import { OrderForPayment, PaymentInitiation, PaymentProvider, RefundParams, RefundResult } from '../payment.types';

export class CodProvider implements PaymentProvider {
  async initiate(_order: OrderForPayment): Promise<PaymentInitiation> {
    return { method: 'COD', status: 'PENDING_ADMIN_CONFIRM' };
  }

  async refund(_params: RefundParams): Promise<RefundResult> {
    return { success: true, message: 'COD refund is manual — admin transfers via banking app' };
  }
}
