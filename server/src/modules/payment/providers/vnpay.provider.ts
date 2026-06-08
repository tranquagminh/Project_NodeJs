import { randomUUID } from 'crypto';
import { env } from '../../../config/env';
import { signVnpayParams, formatVnpDate } from '../vnpay.crypto';
import { OrderForPayment, PaymentInitiation, PaymentProvider, RefundParams, RefundResult } from '../payment.types';

const REFUND_API = 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';

export class VnpayProvider implements PaymentProvider {
  async initiate(order: OrderForPayment): Promise<PaymentInitiation> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: env.VNPAY_TMN_CODE,
      vnp_Amount: String(Math.round(order.total) * 100),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: order.orderCode,
      vnp_OrderInfo: `Thanh toan don hang ${order.orderCode}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: env.VNPAY_RETURN_URL,
      vnp_IpAddr: order.ipAddress ?? '127.0.0.1',
      vnp_CreateDate: formatVnpDate(now),
      vnp_ExpireDate: formatVnpDate(expiresAt),
    };

    params.vnp_SecureHash = signVnpayParams(params, env.VNPAY_HASH_SECRET);

    const redirectUrl = `${env.VNPAY_URL}?${new URLSearchParams(params).toString()}`;

    return {
      method: 'VNPAY',
      status: 'PENDING_USER_ACTION',
      redirectUrl,
      gatewayTxnRef: order.orderCode,
      expiresAt,
    };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    const now = new Date();
    const requestId = randomUUID();

    const refundParams: Record<string, string> = {
      vnp_RequestId: requestId,
      vnp_Version: '2.1.0',
      vnp_Command: 'refund',
      vnp_TmnCode: env.VNPAY_TMN_CODE,
      vnp_TransactionType: '02',
      vnp_TxnRef: params.orderCode,
      vnp_Amount: String(Math.round(params.amount) * 100),
      vnp_OrderInfo: `Hoan tien don hang ${params.orderCode}: ${params.reason}`,
      vnp_TransactionDate: formatVnpDate(now),
      vnp_CreateBy: 'system',
      vnp_CreateDate: formatVnpDate(now),
      vnp_IpAddr: '127.0.0.1',
    };

    refundParams.vnp_SecureHash = signVnpayParams(refundParams, env.VNPAY_HASH_SECRET);

    try {
      const res = await fetch(REFUND_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refundParams),
      });
      const data = await res.json() as Record<string, string>;
      const ok = data.vnp_ResponseCode === '00';
      return {
        success: ok,
        refundId: data.vnp_TransactionNo,
        message: data.vnp_Message,
      };
    } catch (err) {
      return { success: false, message: `VNPay refund request failed: ${err}` };
    }
  }
}
