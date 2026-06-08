import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { NotFoundError, ForbiddenError, ConflictError, BusinessRuleError } from '../../utils/errors';
import { awardPoints } from '../points/points.service';
import { aggregateRatings, isEligibleForPointsReward } from './review.rating-aggregator';
import { sendNotification } from '../notification/notification.service';

const POINTS_FOR_QUALITY_REVIEW = 50;

export interface CreateReviewInput {
  orderItemId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  hadStringing?: boolean;
}

export interface EditReviewInput {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface ReviewListParams {
  page?: number;
  limit?: number;
  status?: string;
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}

async function recomputeProductRating(productId: string, tx: Prisma.TransactionClient) {
  const approvedReviews = await tx.review.findMany({
    where: { productId, status: 'APPROVED' },
    select: { rating: true },
  });

  const agg = aggregateRatings(approvedReviews);

  await tx.product.update({
    where: { id: productId },
    data: {
      avgRating: agg.avgRating,
      totalReviews: agg.totalReviews,
    },
  });
}

export async function listProductReviews(productId: string, params: ReviewListParams = {}) {
  const { page = 1, limit = 10, sort = 'newest' } = params;
  const skip = (page - 1) * limit;

  const orderBy: Prisma.ReviewOrderByWithRelationInput =
    sort === 'oldest' ? { createdAt: 'asc' }
    : sort === 'highest' ? { rating: 'desc' }
    : sort === 'lowest' ? { rating: 'asc' }
    : sort === 'helpful' ? { helpfulCount: 'desc' }
    : { createdAt: 'desc' };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId, status: 'APPROVED' },
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        images: true,
        hadStringing: true,
        helpfulCount: true,
        createdAt: true,
        user: { select: { id: true, fullName: true } },
      },
    }),
    prisma.review.count({ where: { productId, status: 'APPROVED' } }),
  ]);

  return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getProductRatingDistribution(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId, status: 'APPROVED' },
    select: { rating: true },
  });
  return aggregateRatings(reviews);
}

export async function createReview(input: CreateReviewInput, userId: string) {
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: input.orderItemId },
    include: {
      order: {
        select: { id: true, userId: true, status: true },
      },
    },
  });

  if (!orderItem) throw new NotFoundError('Order item not found');
  if (orderItem.order.userId !== userId) throw new ForbiddenError('Not your order item');
  if (orderItem.order.status !== 'DELIVERED' && orderItem.order.status !== 'REFUNDED') {
    throw new BusinessRuleError('Can only review after order is delivered', 'ORDER_NOT_DELIVERED');
  }

  const existing = await prisma.review.findUnique({
    where: { userId_orderItemId: { userId, orderItemId: input.orderItemId } },
  });
  if (existing) throw new ConflictError('You have already reviewed this item');

  const editableUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const review = await prisma.review.create({
    data: {
      userId,
      productId: orderItem.productId,
      orderId: orderItem.order.id,
      orderItemId: input.orderItemId,
      rating: input.rating,
      title: input.title,
      comment: input.comment,
      images: input.images ?? [],
      hadStringing: input.hadStringing ?? false,
      status: 'PENDING_APPROVAL',
      editableUntil,
      pointsAwarded: false,
      helpfulCount: 0,
    },
  });

  return review;
}

export async function listMyReviews(userId: string, params: ReviewListParams = {}) {
  const { page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.review.count({ where: { userId } }),
  ]);

  return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function editReview(reviewId: string, input: EditReviewInput, userId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new NotFoundError('Review not found');
  if (review.userId !== userId) throw new ForbiddenError('Not your review');
  if (review.status === 'REJECTED') {
    throw new BusinessRuleError('Rejected reviews cannot be edited', 'REVIEW_REJECTED');
  }

  const now = new Date();
  if (review.editableUntil && now > review.editableUntil) {
    throw new BusinessRuleError('Edit window has expired (7 days)', 'REVIEW_EDIT_WINDOW_EXPIRED');
  }

  const wasApproved = review.status === 'APPROVED';

  const updated = await prisma.$transaction(async (tx) => {
    const newStatus = wasApproved ? 'APPROVED' as const : review.status;

    const updatedReview = await tx.review.update({
      where: { id: reviewId },
      data: {
        ...input,
        status: wasApproved ? 'PENDING_APPROVAL' : newStatus,
      },
    });

    if (wasApproved) {
      await recomputeProductRating(review.productId, tx);
    }

    return updatedReview;
  });

  return updated;
}

export async function deleteReview(reviewId: string, userId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new NotFoundError('Review not found');
  if (review.userId !== userId) throw new ForbiddenError('Not your review');

  await prisma.$transaction(async (tx) => {
    await tx.reviewHelpfulVote.deleteMany({ where: { reviewId } });
    await tx.review.delete({ where: { id: reviewId } });

    if (review.status === 'APPROVED') {
      await recomputeProductRating(review.productId, tx);
    }
  });
}

export async function voteHelpful(reviewId: string, userId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new NotFoundError('Review not found');
  if (review.status !== 'APPROVED') {
    throw new BusinessRuleError('Can only vote on approved reviews', 'REVIEW_NOT_APPROVED');
  }
  if (review.userId === userId) throw new ForbiddenError('Cannot vote on your own review');

  const existing = await prisma.reviewHelpfulVote.findUnique({
    where: { reviewId_userId: { reviewId, userId } },
  });
  if (existing) throw new ConflictError('Already voted helpful');

  await prisma.$transaction([
    prisma.reviewHelpfulVote.create({ data: { reviewId, userId } }),
    prisma.review.update({ where: { id: reviewId }, data: { helpfulCount: { increment: 1 } } }),
  ]);
}

export async function unvoteHelpful(reviewId: string, userId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new NotFoundError('Review not found');

  const existing = await prisma.reviewHelpfulVote.findUnique({
    where: { reviewId_userId: { reviewId, userId } },
  });
  if (!existing) throw new NotFoundError('Vote not found');

  await prisma.$transaction([
    prisma.reviewHelpfulVote.delete({ where: { reviewId_userId: { reviewId, userId } } }),
    prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { decrement: 1 } },
    }),
  ]);
}

export async function listAdminReviews(params: ReviewListParams & { productId?: string } = {}) {
  const { page = 1, limit = 20, status, productId } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.ReviewWhereInput = {};
  if (status) where.status = status as never;
  if (productId) where.productId = productId;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function approveReview(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { product: { select: { name: true } } },
  });
  if (!review) throw new NotFoundError('Review not found');
  if (review.status === 'APPROVED') return review;

  const approved = await prisma.$transaction(async (tx) => {
    const updated = await tx.review.update({
      where: { id: reviewId },
      data: { status: 'APPROVED' },
    });

    await recomputeProductRating(review.productId, tx);

    if (!review.pointsAwarded) {
      const eligible = isEligibleForPointsReward(review.comment, review.images as string[]);
      if (eligible) {
        await awardPoints(
          review.userId,
          'REVIEW_EARN',
          POINTS_FOR_QUALITY_REVIEW,
          `Quality review reward for review ${reviewId}`,
        );
        await tx.review.update({
          where: { id: reviewId },
          data: { pointsAwarded: true },
        });
      }
    }

    return updated;
  });

  // Best-effort notification
  sendNotification({
    type: 'REVIEW_APPROVED',
    userId: review.userId,
    payload: { productName: review.product.name, reviewId },
  }).catch((err) => console.error('[review] REVIEW_APPROVED notification failed:', err));

  return approved;
}

export async function rejectReview(reviewId: string, reason: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { product: { select: { name: true } } },
  });
  if (!review) throw new NotFoundError('Review not found');

  const wasApproved = review.status === 'APPROVED';

  const rejected = await prisma.$transaction(async (tx) => {
    const updated = await tx.review.update({
      where: { id: reviewId },
      data: { status: 'REJECTED', adminNote: reason },
    });

    if (wasApproved) {
      await recomputeProductRating(review.productId, tx);
    }

    return updated;
  });

  // Best-effort notification
  sendNotification({
    type: 'REVIEW_REJECTED',
    userId: review.userId,
    payload: { productName: review.product.name, reason, reviewId },
  }).catch((err) => console.error('[review] REVIEW_REJECTED notification failed:', err));

  return rejected;
}

export async function adminDeleteReview(reviewId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new NotFoundError('Review not found');

  await prisma.$transaction(async (tx) => {
    await tx.reviewHelpfulVote.deleteMany({ where: { reviewId } });
    await tx.review.delete({ where: { id: reviewId } });

    if (review.status === 'APPROVED') {
      await recomputeProductRating(review.productId, tx);
    }
  });
}
