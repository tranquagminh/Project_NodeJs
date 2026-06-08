import { ReturnReason, ReturnStatus } from '@prisma/client';

export interface ReturnItemInput {
  orderItemId: string;
  quantity: number;
}

export interface SubmitReturnInput {
  reason: ReturnReason;
  reasonNote?: string;
  customerImages?: string[];
  items: ReturnItemInput[];
  // Required for COD orders
  refundBankName?: string;
  refundBankAccount?: string;
  refundBankHolder?: string;
}

export interface ApproveReturnInput {
  adminNote?: string;
  adminUserId: string;
}

export interface RejectReturnInput {
  rejectionReason: string;
  adminUserId: string;
}

export interface MarkReceivedInput {
  adminUserId: string;
  note?: string;
}

export interface SubmitTrackingInput {
  returnTrackingNumber: string;
  returnTrackingCarrier: string;
}

export type ReturnActor = 'USER' | 'ADMIN' | 'SYSTEM';

export interface ReturnTransitionResult {
  allowed: boolean;
  reason?: string;
}

export function canTransitionReturn(
  from: ReturnStatus,
  to: ReturnStatus,
  actor: ReturnActor,
): ReturnTransitionResult {
  const TERMINAL: ReturnStatus[] = ['REFUNDED', 'REJECTED', 'CANCELLED'];
  if (TERMINAL.includes(from)) {
    return { allowed: false, reason: `${from} is a terminal status` };
  }

  switch (from) {
    case 'REQUESTED':
      if (to === 'APPROVED' && actor === 'ADMIN') return { allowed: true };
      if (to === 'REJECTED' && actor === 'ADMIN') return { allowed: true };
      if (to === 'CANCELLED' && actor === 'USER') return { allowed: true };
      break;
    case 'APPROVED':
      if (to === 'RECEIVED' && actor === 'ADMIN') return { allowed: true };
      if (to === 'CANCELLED' && actor === 'ADMIN') return { allowed: true };
      break;
    case 'RECEIVED':
      if (to === 'REFUNDED' && actor === 'SYSTEM') return { allowed: true };
      break;
  }

  return { allowed: false, reason: `Transition ${from} → ${to} not allowed for ${actor}` };
}
