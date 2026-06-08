import cron from 'node-cron';
import { cancelTimedOutOrders, autoCompleteDelivered } from './order.service';

export function startOrderCrons(): void {
  if (process.env.NODE_ENV === 'test') return;

  // Every minute: cancel timed-out PENDING orders
  cron.schedule('* * * * *', async () => {
    try {
      const count = await cancelTimedOutOrders();
      if (count > 0) console.log(`[cron:timeout] Cancelled ${count} timed-out orders`);
    } catch (err) {
      console.error('[cron:timeout] Error:', err);
    }
  });

  // Daily 02:00 VN time (UTC+7 → 19:00 UTC): auto-complete DELIVERED orders after 7 days
  cron.schedule('0 19 * * *', async () => {
    try {
      const count = await autoCompleteDelivered();
      if (count > 0) console.log(`[cron:autocomplete] Completed ${count} delivered orders`);
    } catch (err) {
      console.error('[cron:autocomplete] Error:', err);
    }
  });
}
