import { OrderStatus } from '@prisma/client';

export type OrderActor = 'USER' | 'ADMIN' | 'CRON' | 'SYSTEM';

export interface TransitionResult {
  allowed: boolean;
  reason?: string;
}

const TERMINAL: ReadonlySet<OrderStatus> = new Set([
  'COMPLETED',
  'CANCELLED',
  'RETURNED',
  'REFUNDED',
]);

export const CANCELLATION_GRACE_HOURS = 2;

export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
  actor: OrderActor,
  hoursInCurrentState = 0,
): TransitionResult {
  if (TERMINAL.has(from)) {
    return { allowed: false, reason: `${from} is a terminal status — no transitions allowed` };
  }

  switch (from) {
    case 'PENDING':
      if (to === 'CONFIRMED') {
        if (actor === 'ADMIN' || actor === 'SYSTEM') return { allowed: true };
        return { allowed: false, reason: 'Only ADMIN can confirm orders' };
      }
      if (to === 'CANCELLED') return { allowed: true };
      break;

    case 'CONFIRMED':
      if (to === 'PROCESSING') {
        if (actor === 'ADMIN') return { allowed: true };
        return { allowed: false, reason: 'Only ADMIN can move to PROCESSING' };
      }
      if (to === 'CANCELLED') {
        if (actor === 'USER' || actor === 'ADMIN') return { allowed: true };
        return { allowed: false, reason: 'Only USER or ADMIN can cancel a CONFIRMED order' };
      }
      break;

    case 'PROCESSING':
      if (to === 'READY_TO_SHIP') {
        if (actor === 'ADMIN') return { allowed: true };
        return { allowed: false, reason: 'Only ADMIN can mark as READY_TO_SHIP' };
      }
      if (to === 'CANCELLED') {
        if (actor !== 'ADMIN') return { allowed: false, reason: 'Only ADMIN can cancel a PROCESSING order' };
        if (hoursInCurrentState > CANCELLATION_GRACE_HOURS) {
          return { allowed: false, reason: `Cancellation grace period (${CANCELLATION_GRACE_HOURS}h) has expired` };
        }
        return { allowed: true };
      }
      break;

    case 'READY_TO_SHIP':
      if (to === 'SHIPPING') {
        if (actor === 'ADMIN') return { allowed: true };
        return { allowed: false, reason: 'Only ADMIN can mark as SHIPPING' };
      }
      if (to === 'CANCELLED') {
        if (actor !== 'ADMIN') return { allowed: false, reason: 'Only ADMIN can cancel a READY_TO_SHIP order' };
        if (hoursInCurrentState > CANCELLATION_GRACE_HOURS) {
          return { allowed: false, reason: `Cancellation grace period (${CANCELLATION_GRACE_HOURS}h) has expired` };
        }
        return { allowed: true };
      }
      break;

    case 'SHIPPING':
      if (to === 'DELIVERED') {
        if (actor === 'ADMIN') return { allowed: true };
        return { allowed: false, reason: 'Only ADMIN can mark as DELIVERED' };
      }
      break;

    case 'DELIVERED':
      if (to === 'COMPLETED') return { allowed: true };
      if (to === 'RETURN_REQUESTED') {
        if (actor === 'USER' || actor === 'ADMIN') return { allowed: true };
        return { allowed: false, reason: 'Only USER or ADMIN can request a return' };
      }
      if (to === 'REFUNDED') {
        if (actor === 'SYSTEM') return { allowed: true };
        return { allowed: false, reason: 'Only SYSTEM can mark order as refunded via return flow' };
      }
      break;

    case 'RETURN_REQUESTED':
      if (to === 'RETURNED') {
        if (actor === 'ADMIN') return { allowed: true };
        return { allowed: false, reason: 'Only ADMIN can confirm return' };
      }
      if (to === 'CANCELLED') {
        if (actor === 'ADMIN') return { allowed: true };
        return { allowed: false, reason: 'Only ADMIN can cancel a return request' };
      }
      break;
  }

  return { allowed: false, reason: `Transition from ${from} to ${to} is not allowed` };
}
