import { randomUUID } from 'crypto';
import { env } from '../../../config/env';
import { signMomoCreate, signMomoRefund } from '../momo.crypto';
import { OrderForPayment, PaymentInitiation, PaymentProvider, RefundParams, RefundResult } from '../payment.types';

interface MomoCreateResponse {
  resultCode: number;
  message: string;
  payUrl?: string;
  requestId?: string;
  orderId?: string;
}

export class MomoProvider implements PaymentProvider {
  async initiate(order: OrderForPayment): Promise<PaymentInitiation> {
    const requestId = randomUUID();
    const requestType = 'payWithMethod';
    const amount = Math.round(order.total);

    const sigData: Record<string, string | number> = {
      accessKey: env.MOMO_ACCESS_KEY,
      amount,
      extraData: '',
      ipnUrl: env.MOMO_NOTIFY_URL,
      orderId: order.orderCode,
      orderInfo: `Thanh toan don hang ${order.orderCode}`,
      partnerCode: env.MOMO_PARTNER_CODE,
      redirectUrl: env.MOMO_RETURN_URL,
      requestId,
      requestType,
    };

    const signature = signMomoCreate(sigData, env.MOMO_SECRET_KEY);

    const body = {
      partnerCode: env.MOMO_PARTNER_CODE,
      accessKey: env.MOMO_ACCESS_KEY,
      requestId,
      amount,
      orderId: order.orderCode,
      orderInfo: `Thanh toan don hang ${order.orderCode}`,
      redirectUrl: env.MOMO_RETURN_URL,
      ipnUrl: env.MOMO_NOTIFY_URL,
      extraData: '',
      requestType,
      signature,
      lang: 'vi',
    };

    const apiUrl = `${env.MOMO_API_URL}/v2/gateway/api/create`;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as MomoCreateResponse;

    if (data.resultCode !== 0 || !data.payUrl) {
      throw new Error(`MoMo payment init failed: ${data.message} (code ${data.resultCode})`);
    }

    return {
      method: 'MOMO',
      status: 'PENDING_USER_ACTION',
      redirectUrl: data.payUrl,
      gatewayTxnRef: requestId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    const requestId = randomUUID();
    const amount = Math.round(params.amount);

    const sigData: Record<string, string | number> = {
      accessKey: env.MOMO_ACCESS_KEY,
      amount,
      description: params.reason,
      orderId: params.orderCode,
      partnerCode: env.MOMO_PARTNER_CODE,
      requestId,
      transId: params.gatewayTxnRef,
    };

    const signature = signMomoRefund(sigData, env.MOMO_SECRET_KEY);

    const body = { ...sigData, lang: 'vi', signature };

    try {
      const res = await fetch(`${env.MOMO_API_URL}/v2/gateway/api/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { resultCode: number; message: string; transId?: string };
      return {
        success: data.resultCode === 0,
        refundId: data.transId ? String(data.transId) : undefined,
        message: data.message,
      };
    } catch (err) {
      return { success: false, message: `MoMo refund request failed: ${err}` };
    }
  }
}
