import { env } from '../../../config/env';
import { OrderForPayment, PaymentInitiation, PaymentProvider, RefundParams, RefundResult } from '../payment.types';

export class MockProvider implements PaymentProvider {
  async initiate(order: OrderForPayment): Promise<PaymentInitiation> {
    const mockUrl = `${env.CLIENT_URL}/payment/mock?orderCode=${order.orderCode}&method=${order.paymentMethod}`;
    return {
      method: order.paymentMethod,
      status: 'PENDING_USER_ACTION',
      redirectUrl: mockUrl,
      gatewayTxnRef: `MOCK-${order.orderCode}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
  }

  async refund(_params: RefundParams): Promise<RefundResult> {
    return { success: true, refundId: `MOCK-REFUND-${Date.now()}` };
  }
}
