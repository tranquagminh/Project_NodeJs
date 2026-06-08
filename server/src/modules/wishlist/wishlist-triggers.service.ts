import prisma from '../../config/database';
import { sendBulkNotifications, SendNotificationInput } from '../notification/notification.service';

const PRICE_DROP_THRESHOLD = 0.10; // 10%
const BACK_IN_STOCK_DEDUP_DAYS = 30;
const PRICE_DROP_DEDUP_DAYS = 30;
const LOW_STOCK_DEDUP_DAYS = 7;
const LOW_STOCK_THRESHOLD = 5;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

// ── checkBackInStock ──────────────────────────────────────────────────────────

export async function checkBackInStock(
  productId: string,
  oldTotalStock: number,
  newTotalStock: number,
): Promise<void> {
  if (oldTotalStock !== 0 || newTotalStock <= 0) return;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, slug: true },
  });
  if (!product) return;

  const cutoff = daysAgo(BACK_IN_STOCK_DEDUP_DAYS);

  // Get wishlist users for this product
  const wishlistEntries = await prisma.wishlist.findMany({
    where: { productId },
    select: { userId: true },
  });

  if (wishlistEntries.length === 0) return;

  const userIds = wishlistEntries.map((w) => w.userId);

  // Find users who already received BACK_IN_STOCK for this product recently
  const recentNotifications = await prisma.notification.findMany({
    where: {
      userId: { in: userIds },
      type: 'BACK_IN_STOCK',
      productId,
      createdAt: { gte: cutoff },
    },
    select: { userId: true },
  });
  const alreadyNotified = new Set(recentNotifications.map((n) => n.userId));

  const inputs: SendNotificationInput[] = userIds
    .filter((uid) => !alreadyNotified.has(uid))
    .map((userId) => ({
      type: 'BACK_IN_STOCK' as const,
      userId,
      payload: {
        productName: product.name,
        productSlug: product.slug,
        productId,
      },
    }));

  if (inputs.length > 0) {
    await sendBulkNotifications(inputs);
  }
}

// ── checkPriceDrop ────────────────────────────────────────────────────────────

export async function checkPriceDrop(
  productId: string,
  oldEffectivePrice: number,
  newEffectivePrice: number,
): Promise<void> {
  if (oldEffectivePrice <= 0 || newEffectivePrice >= oldEffectivePrice) return;

  const dropPct = (oldEffectivePrice - newEffectivePrice) / oldEffectivePrice;
  if (dropPct < PRICE_DROP_THRESHOLD) return;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, slug: true },
  });
  if (!product) return;

  const cutoff = daysAgo(PRICE_DROP_DEDUP_DAYS);

  const wishlistEntries = await prisma.wishlist.findMany({
    where: { productId },
    select: { userId: true },
  });

  if (wishlistEntries.length === 0) return;

  const userIds = wishlistEntries.map((w) => w.userId);

  const recentNotifications = await prisma.notification.findMany({
    where: {
      userId: { in: userIds },
      type: 'PRICE_DROP',
      productId,
      createdAt: { gte: cutoff },
    },
    select: { userId: true },
  });
  const alreadyNotified = new Set(recentNotifications.map((n) => n.userId));

  const inputs: SendNotificationInput[] = userIds
    .filter((uid) => !alreadyNotified.has(uid))
    .map((userId) => ({
      type: 'PRICE_DROP' as const,
      userId,
      payload: {
        productName: product.name,
        productSlug: product.slug,
        oldPrice: oldEffectivePrice,
        newPrice: newEffectivePrice,
        dropPct,
        productId,
      },
    }));

  if (inputs.length > 0) {
    await sendBulkNotifications(inputs);
  }
}

// ── checkLowStock ─────────────────────────────────────────────────────────────

export async function checkLowStock(
  productId: string,
  oldStock: number,
  newStock: number,
): Promise<void> {
  // Only fires if crossing from >= 5 to < 5 (and still > 0)
  if (!(oldStock >= LOW_STOCK_THRESHOLD && newStock > 0 && newStock < LOW_STOCK_THRESHOLD)) return;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, slug: true },
  });
  if (!product) return;

  const cutoff = daysAgo(LOW_STOCK_DEDUP_DAYS);

  const wishlistEntries = await prisma.wishlist.findMany({
    where: { productId },
    select: { userId: true },
  });

  if (wishlistEntries.length === 0) return;

  const userIds = wishlistEntries.map((w) => w.userId);

  const recentNotifications = await prisma.notification.findMany({
    where: {
      userId: { in: userIds },
      type: 'LOW_STOCK_WISHLIST',
      productId,
      createdAt: { gte: cutoff },
    },
    select: { userId: true },
  });
  const alreadyNotified = new Set(recentNotifications.map((n) => n.userId));

  const inputs: SendNotificationInput[] = userIds
    .filter((uid) => !alreadyNotified.has(uid))
    .map((userId) => ({
      type: 'LOW_STOCK_WISHLIST' as const,
      userId,
      payload: {
        productName: product.name,
        stock: newStock,
        productId,
      },
    }));

  if (inputs.length > 0) {
    await sendBulkNotifications(inputs);
  }
}
