import { PointTransactionType } from '@prisma/client';
import prisma from '../../config/database';
import { sendNotification } from '../notification/notification.service';

export async function awardPoints(
  userId: string,
  type: PointTransactionType,
  amount: number,
  description: string,
  orderId?: string,
): Promise<void> {
  let newBalance = 0;

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { pointBalance: { increment: amount } },
      select: { pointBalance: true },
    });
    newBalance = user.pointBalance;
    await tx.pointTransaction.create({
      data: { userId, type, points: amount, balance: user.pointBalance, description, orderId },
    });
  });

  // Best-effort POINTS_EARNED notification
  sendNotification({
    type: 'POINTS_EARNED',
    userId,
    payload: { amount, reason: description, newBalance },
  }).catch((err) => console.error('[points] POINTS_EARNED notification failed:', err));
}

export async function deductPoints(
  userId: string,
  type: PointTransactionType,
  amount: number,
  description: string,
  orderId?: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { pointBalance: { decrement: amount } },
      select: { pointBalance: true },
    });
    await tx.pointTransaction.create({
      data: { userId, type, points: -amount, balance: user.pointBalance, description, orderId },
    });
  });
}

export async function refundPoints(
  userId: string,
  amount: number,
  description: string,
  orderId?: string,
): Promise<void> {
  await awardPoints(userId, 'REFUNDED', amount, description, orderId);
}
