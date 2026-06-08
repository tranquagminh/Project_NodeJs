import { PaymentMethod } from '@prisma/client';

export interface OrderForPayment {
  id: string;
  orderCode: string;
  paymentMethod: PaymentMethod;
  total: number;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  ipAddress?: string;
}

export interface PaymentInitiation {
  method: PaymentMethod;
  status: 'PENDING_USER_ACTION' | 'PENDING_ADMIN_CONFIRM' | 'COMPLETED';
  redirectUrl?: string;
  bankTransferInfo?: {
    accountNumber: string;
    accountHolder: string;
    bankName: string;
    transferContent: string;
  };
  gatewayTxnRef?: string;
  expiresAt?: Date;
}

export interface RefundParams {
  orderId: string;
  orderCode: string;
  gatewayTxnRef: string;
  amount: number;
  reason: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  message?: string;
}

export interface PaymentProvider {
  initiate(order: OrderForPayment): Promise<PaymentInitiation>;
  refund?(params: RefundParams): Promise<RefundResult>;
}
