import { env } from '../../../config/env';
import { OrderForPayment, PaymentInitiation, PaymentProvider, RefundParams, RefundResult } from '../payment.types';

export class BankTransferProvider implements PaymentProvider {
  async initiate(order: OrderForPayment): Promise<PaymentInitiation> {
    return {
      method: 'BANK_TRANSFER',
      status: 'PENDING_USER_ACTION',
      bankTransferInfo: {
        accountNumber: env.BANK_ACCOUNT_NUMBER,
        accountHolder: env.BANK_ACCOUNT_HOLDER,
        bankName: env.BANK_NAME,
        transferContent: `VOLTA ${order.orderCode}`,
      },
    };
  }

  async refund(_params: RefundParams): Promise<RefundResult> {
    return { success: true, message: 'Bank transfer refund is manual — admin transfers via banking app' };
  }
}
