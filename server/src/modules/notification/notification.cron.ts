import cron from 'node-cron';
import prisma from '../../config/database';
import { sendNotification } from './notification.service';

export function schedulePointsExpiringCron(): void {
  if (process.env.NODE_ENV === 'test') return;

  // 8am daily VN time (UTC+7 → 01:00 UTC)
  cron.schedule('0 1 * * *', async () => {
    try {
      console.log('[cron:points-expiring] Running points expiry check...');

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Find users with non-zero point balances who haven't received a
      // POINTS_EXPIRING notification in the last 30 days.
      // Since PointTransaction has no expiresAt, we notify users who have
      // accumulated points (pointBalance > 0) and haven't been notified recently.
      const usersWithPoints = await prisma.user.findMany({
        where: {
          pointBalance: { gt: 0 },
          deletedAt: null,
          // No POINTS_EXPIRING notification in last 30 days
          notifications: {
            none: {
              type: 'POINTS_EXPIRING',
              createdAt: { gte: thirtyDaysAgo },
            },
          },
        },
        select: { id: true, pointBalance: true },
        take: 500, // process in bounded batches
      });

      // Use 30 days from now as the "expiry" for display purposes
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      let sent = 0;
      for (const user of usersWithPoints) {
        try {
          await sendNotification({
            type: 'POINTS_EXPIRING',
            userId: user.id,
            payload: {
              amount: user.pointBalance,
              expiresAt,
            },
          });
          sent++;
        } catch (err) {
          console.error(`[cron:points-expiring] Failed to notify user ${user.id}:`, err);
        }
      }

      if (sent > 0) {
        console.log(`[cron:points-expiring] Sent ${sent} POINTS_EXPIRING notifications`);
      }
    } catch (err) {
      console.error('[cron:points-expiring] Error:', err);
    }
  });
}
