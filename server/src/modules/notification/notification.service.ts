import { NotificationType, NotificationPreference } from '@prisma/client';
import prisma from '../../config/database';
import { NOTIFICATION_CONFIG } from './notification.config';
import { renderNotification } from './notification.templates';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NotificationPrefs {
  promotionEmails: boolean;
  backInStockEmails: boolean;
  priceDropEmails: boolean;
  pointsExpiringEmails: boolean;
  pointsEarnedEmails: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  promotionEmails: true,
  backInStockEmails: true,
  priceDropEmails: true,
  pointsExpiringEmails: true,
  pointsEarnedEmails: false,
};

// Discriminated union for type-safe payloads
export type SendNotificationInput =
  | { type: 'ORDER_CONFIRMED'; userId: string; payload: { orderCode: string; total: number; itemCount: number; orderId?: string } }
  | { type: 'ORDER_PROCESSING'; userId: string; payload: { orderCode: string; orderId?: string } }
  | { type: 'ORDER_SHIPPED'; userId: string; payload: { orderCode: string; trackingNumber?: string; orderId?: string } }
  | { type: 'ORDER_DELIVERED'; userId: string; payload: { orderCode: string; orderId?: string } }
  | { type: 'ORDER_CANCELLED'; userId: string; payload: { orderCode: string; reason?: string; orderId?: string } }
  | { type: 'PAYMENT_SUCCESS'; userId: string; payload: { orderCode: string; amount: number; orderId?: string } }
  | { type: 'PAYMENT_FAILED'; userId: string; payload: { orderCode: string; orderId?: string } }
  | { type: 'PAYMENT_REFUNDED'; userId: string; payload: { orderCode: string; amount: number; orderId?: string } }
  | { type: 'RETURN_APPROVED'; userId: string; payload: { orderCode: string; returnId?: string } }
  | { type: 'RETURN_REJECTED'; userId: string; payload: { orderCode: string; reason?: string; returnId?: string } }
  | { type: 'RETURN_COMPLETED'; userId: string; payload: { orderCode: string; amount: number; returnId?: string } }
  | { type: 'BACK_IN_STOCK'; userId: string; payload: { productName: string; productSlug: string; productId?: string } }
  | { type: 'PRICE_DROP'; userId: string; payload: { productName: string; oldPrice: number; newPrice: number; dropPct: number; productId?: string; productSlug?: string } }
  | { type: 'LOW_STOCK_WISHLIST'; userId: string; payload: { productName: string; stock: number; productId?: string } }
  | { type: 'REVIEW_APPROVED'; userId: string; payload: { productName: string; reviewId?: string } }
  | { type: 'REVIEW_REJECTED'; userId: string; payload: { productName: string; reason?: string; reviewId?: string } }
  | { type: 'POINTS_EARNED'; userId: string; payload: { amount: number; reason: string; newBalance: number } }
  | { type: 'POINTS_EXPIRING'; userId: string; payload: { amount: number; expiresAt: Date } }
  | { type: 'PROMOTION'; userId: string; payload: { title: string; body: string; couponCode?: string; url?: string } };

// ── Core send function ────────────────────────────────────────────────────────

export async function sendNotification(input: SendNotificationInput): Promise<void> {
  const { type, userId, payload } = input;

  // 1. Fetch user
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, deletedAt: true } });
  if (!user || user.deletedAt !== null) {
    console.warn(`[notification] Skipping notification for missing/deleted user: ${userId}`);
    return;
  }

  // 2. Get or create NotificationPreference
  let prefRow = await prisma.notificationPreference.findFirst({ where: { userId } });
  const prefs: NotificationPrefs = prefRow
    ? {
        promotionEmails: prefRow.promotionEmails,
        backInStockEmails: prefRow.backInStockEmails,
        priceDropEmails: prefRow.priceDropEmails,
        pointsExpiringEmails: prefRow.pointsExpiringEmails,
        pointsEarnedEmails: prefRow.pointsEarnedEmails,
      }
    : DEFAULT_PREFS;

  // 3. Get config
  const config = NOTIFICATION_CONFIG[type];

  // 4. Render title + message
  const rendered = renderNotification(type, payload as Record<string, unknown>);

  // 5. Extract entity refs from payload
  const p = payload as Record<string, unknown>;
  const orderId = (p.orderId as string | undefined) ?? null;
  const productId = (p.productId as string | undefined) ?? null;
  const returnId = (p.returnId as string | undefined) ?? null;
  const reviewId = (p.reviewId as string | undefined) ?? null;
  const url = (p.url as string | undefined) ?? null;

  // 6. Insert Notification row
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title: rendered.title,
      message: rendered.message,
      orderId,
      productId,
      returnId,
      reviewId,
      url,
      payload: payload as object,
    },
  });

  // 7. Determine if email should be sent
  let shouldEmail = false;
  if (config.email === 'ALWAYS') {
    shouldEmail = true;
  } else if (config.email === 'RESPECTS_PREFERENCE' && config.preferenceKey) {
    shouldEmail = prefs[config.preferenceKey];
  }
  // NEVER → shouldEmail stays false

  // 8. Send email (console stub)
  if (shouldEmail && rendered.emailSubject) {
    try {
      console.log(`[EMAIL] Type: ${type} To: ${user.email} Subject: ${rendered.emailSubject}`);
      // TODO: Replace with actual email service (e.g. SendGrid, SES)
      await prisma.notification.update({
        where: { id: notification.id },
        data: { emailSent: true, emailSentAt: new Date() },
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[EMAIL] Failed to send email for notification ${notification.id}:`, errMsg);
      await prisma.notification.update({
        where: { id: notification.id },
        data: { emailErrorMsg: errMsg },
      }).catch(() => {
        // ignore update error
      });
    }
  }
}

export async function sendBulkNotifications(inputs: SendNotificationInput[]): Promise<void> {
  const BATCH_SIZE = 10;
  for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
    const batch = inputs.slice(i, i + BATCH_SIZE);
    for (const input of batch) {
      try {
        await sendNotification(input);
      } catch (err) {
        console.error(`[notification] Failed to send ${input.type} to user ${input.userId}:`, err);
      }
    }
  }
}

// ── Query functions ───────────────────────────────────────────────────────────

export async function listUserNotifications(
  userId: string,
  params: { page?: number; pageSize?: number; unreadOnly?: boolean },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where = {
    userId,
    ...(params.unreadOnly ? { readAt: null } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
  ]);

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function markAsRead(notifId: string, userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notifId, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function deleteNotification(notifId: string, userId: string): Promise<void> {
  await prisma.notification.deleteMany({ where: { id: notifId, userId } });
}

export async function getOrCreatePreferences(userId: string): Promise<NotificationPreference> {
  const existing = await prisma.notificationPreference.findFirst({ where: { userId } });
  if (existing) return existing;

  return prisma.notificationPreference.create({
    data: {
      userId,
      ...DEFAULT_PREFS,
    },
  });
}

export async function updatePreferences(
  userId: string,
  data: Partial<NotificationPrefs>,
): Promise<NotificationPreference> {
  const existing = await prisma.notificationPreference.findFirst({ where: { userId } });
  if (existing) {
    return prisma.notificationPreference.update({
      where: { id: existing.id },
      data,
    });
  }
  return prisma.notificationPreference.create({
    data: { userId, ...DEFAULT_PREFS, ...data },
  });
}
