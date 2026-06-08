import prisma from '../../config/database';
import { env } from '../../config/env';
import { verifyVnpaySignature } from './vnpay.crypto';
import { verifyMomoSignature } from './momo.crypto';
import { updateOrderStatus } from '../order/order.service';
import { sendNotification } from '../notification/notification.service';

// ── Internal helper ───────────────────────────────────────────────────────────

async function confirmOrderPayment(orderId: string, txnId: string): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: 'PAID' },
  });

  try {
    await updateOrderStatus(orderId, 'CONFIRMED', 'SYSTEM', {
      reason: `Payment confirmed — txn ${txnId}`,
    });
  } catch {
    // Order may already be CONFIRMED (idempotent double-fire); ignore.
  }

  // Best-effort PAYMENT_SUCCESS notification
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, orderCode: true, total: true },
    });
    if (order?.userId) {
      sendNotification({
        type: 'PAYMENT_SUCCESS',
        userId: order.userId,
        payload: { orderCode: order.orderCode, amount: Number(order.total), orderId },
      }).catch((err) => console.error('[payment] PAYMENT_SUCCESS notification failed:', err));
    }
  } catch (err) {
    console.error('[payment] Failed to fetch order for PAYMENT_SUCCESS notification:', err);
  }
}

async function markTransactionFailed(orderId: string, gatewayTxnRef: string, response: unknown): Promise<void> {
  await prisma.orderPaymentTransaction.updateMany({
    where: { orderId, gatewayTxnRef, status: 'PENDING' },
    data: { status: 'FAILED', gatewayResponse: response as never, processedAt: new Date() },
  });
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: 'FAILED' },
  });
  await notifyPaymentFailed(orderId);
}

async function notifyPaymentFailed(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, orderCode: true },
    });
    if (order?.userId) {
      sendNotification({
        type: 'PAYMENT_FAILED',
        userId: order.userId,
        payload: { orderCode: order.orderCode, orderId },
      }).catch((err) => console.error('[payment] PAYMENT_FAILED notification failed:', err));
    }
  } catch (err) {
    console.error('[payment] Failed to fetch order for PAYMENT_FAILED notification:', err);
  }
}

// ── VNPay ─────────────────────────────────────────────────────────────────────

export async function processVnpayWebhook(
  params: Record<string, string>,
): Promise<{ RspCode: string; Message: string }> {
  if (!verifyVnpaySignature(params, env.VNPAY_HASH_SECRET)) {
    return { RspCode: '97', Message: 'Invalid signature' };
  }

  const txnRef = params.vnp_TxnRef;
  const responseCode = params.vnp_ResponseCode;

  const txn = await prisma.orderPaymentTransaction.findUnique({
    where: { gatewayTxnRef: txnRef },
    include: { order: true },
  });

  if (!txn) return { RspCode: '01', Message: 'Order not found' };

  // Idempotency — already processed
  if (txn.status !== 'PENDING') return { RspCode: '00', Message: 'Confirm Success' };

  const success = responseCode === '00';
  const now = new Date();

  await prisma.orderPaymentTransaction.update({
    where: { id: txn.id },
    data: {
      status: success ? 'SUCCESS' : 'FAILED',
      gatewayResponse: params as never,
      metadata: {
        bankCode: params.vnp_BankCode,
        bankTranNo: params.vnp_BankTranNo,
        transactionNo: params.vnp_TransactionNo,
        cardType: params.vnp_CardType,
        payDate: params.vnp_PayDate,
      },
      processedAt: now,
    },
  });

  if (success) {
    await confirmOrderPayment(txn.orderId, txnRef);
  } else {
    await prisma.order.update({
      where: { id: txn.orderId },
      data: { paymentStatus: 'FAILED' },
    });
    await notifyPaymentFailed(txn.orderId);
  }

  return { RspCode: '00', Message: 'Confirm Success' };
}

// ── MoMo ──────────────────────────────────────────────────────────────────────

export async function processMomoWebhook(
  data: Record<string, string | number>,
): Promise<void> {
  if (!verifyMomoSignature(data, env.MOMO_SECRET_KEY)) {
    throw new Error('Invalid MoMo signature');
  }

  const requestId = String(data.requestId ?? '');
  const resultCode = Number(data.resultCode ?? data.responseCode ?? -1);

  const txn = await prisma.orderPaymentTransaction.findUnique({
    where: { gatewayTxnRef: requestId },
    include: { order: true },
  });

  if (!txn) throw new Error('Transaction not found');

  // Idempotency
  if (txn.status !== 'PENDING') return;

  const success = resultCode === 0;
  const now = new Date();

  await prisma.orderPaymentTransaction.update({
    where: { id: txn.id },
    data: {
      status: success ? 'SUCCESS' : 'FAILED',
      gatewayResponse: data as never,
      metadata: {
        transId: data.transId,
        payType: data.payType,
        orderType: data.orderType,
        message: data.message,
      },
      processedAt: now,
    },
  });

  if (success) {
    await confirmOrderPayment(txn.orderId, requestId);
  } else {
    await prisma.order.update({
      where: { id: txn.orderId },
      data: { paymentStatus: 'FAILED' },
    });
    await notifyPaymentFailed(txn.orderId);
  }
}

// ── Mock (PAYMENT_MOCK_MODE only) ─────────────────────────────────────────────

export async function processMockWebhook(
  orderCode: string,
  result: 'success' | 'failed',
): Promise<void> {
  if (!env.PAYMENT_MOCK_MODE) throw new Error('Mock gateway disabled');

  const gatewayTxnRef = `MOCK-${orderCode.toUpperCase()}`;
  const txn = await prisma.orderPaymentTransaction.findUnique({
    where: { gatewayTxnRef },
  });

  if (!txn) throw new Error('Transaction not found');
  if (txn.status !== 'PENDING') return;

  const success = result === 'success';

  await prisma.orderPaymentTransaction.update({
    where: { id: txn.id },
    data: {
      status: success ? 'SUCCESS' : 'FAILED',
      processedAt: new Date(),
      metadata: { mock: true },
    },
  });

  if (success) {
    await confirmOrderPayment(txn.orderId, gatewayTxnRef);
  } else {
    await markTransactionFailed(txn.orderId, gatewayTxnRef, { mock: true, result });
  }
}
