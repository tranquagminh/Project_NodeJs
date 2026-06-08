import { Request, Response, NextFunction } from 'express';
import * as reviewService from './review.service';
import { sendSuccess, sendPaginated } from '../../utils/response';

export async function getProductReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, sort } = req.query as Record<string, string | undefined>;
    const result = await reviewService.listProductReviews(req.params.productId as string, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sort: sort as reviewService.ReviewListParams['sort'],
    });
    sendPaginated(res, result.reviews, { page: result.page, limit: result.limit, total: result.total });
  } catch (e) { next(e); }
}

export async function getProductRatingDistribution(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await reviewService.getProductRatingDistribution(req.params.productId as string));
  } catch (e) { next(e); }
}

export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await reviewService.createReview(req.body, req.user!.id), 'Review submitted', 201);
  } catch (e) { next(e); }
}

export async function listMyReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as Record<string, string | undefined>;
    const result = await reviewService.listMyReviews(req.user!.id, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
    sendPaginated(res, result.reviews, { page: result.page, limit: result.limit, total: result.total });
  } catch (e) { next(e); }
}

export async function editReview(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await reviewService.editReview(req.params.id as string, req.body, req.user!.id));
  } catch (e) { next(e); }
}

export async function deleteReview(req: Request, res: Response, next: NextFunction) {
  try {
    await reviewService.deleteReview(req.params.id as string, req.user!.id);
    sendSuccess(res, null, 'Review deleted');
  } catch (e) { next(e); }
}

export async function voteHelpful(req: Request, res: Response, next: NextFunction) {
  try {
    await reviewService.voteHelpful(req.params.id as string, req.user!.id);
    sendSuccess(res, null, 'Voted helpful');
  } catch (e) { next(e); }
}

export async function unvoteHelpful(req: Request, res: Response, next: NextFunction) {
  try {
    await reviewService.unvoteHelpful(req.params.id as string, req.user!.id);
    sendSuccess(res, null, 'Vote removed');
  } catch (e) { next(e); }
}

export async function listAdminReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, status, productId } = req.query as Record<string, string | undefined>;
    const result = await reviewService.listAdminReviews({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      status,
      productId,
    });
    sendPaginated(res, result.reviews, { page: result.page, limit: result.limit, total: result.total });
  } catch (e) { next(e); }
}

export async function approveReview(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await reviewService.approveReview(req.params.id as string), 'Review approved');
  } catch (e) { next(e); }
}

export async function rejectReview(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await reviewService.rejectReview(req.params.id as string, req.body.reason), 'Review rejected');
  } catch (e) { next(e); }
}

export async function adminDeleteReview(req: Request, res: Response, next: NextFunction) {
  try {
    await reviewService.adminDeleteReview(req.params.id as string);
    sendSuccess(res, null, 'Review deleted');
  } catch (e) { next(e); }
}
