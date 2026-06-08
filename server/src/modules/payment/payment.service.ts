import { PaymentMethod } from '@prisma/client';
import prisma from '../../config/database';
import { OrderForPayment, PaymentInitiation } from './payment.types';
import { getPaymentProvider } from './payment.factory';

export type { PaymentInitiation } from './payment.types';

export async function initiatePayment(
  order: OrderForPayment,
): Promise<PaymentInitiation> {
  const provider = getPaymentProvider(order.paymentMethod);
  const initiation = await provider.initiate(order);

  // Persist transaction record for trackable methods (not COD — admin-confirmed manually)
  if (initiation.gatewayTxnRef) {
    await prisma.orderPaymentTransaction.create({
      data: {
        orderId: order.id,
        method: order.paymentMethod,
        amount: order.total,
        gatewayTxnRef: initiation.gatewayTxnRef,
        status: 'PENDING',
      },
    });
  }

  return initiation;
}

export async function retryPayment(
  orderCode: string,
  userId: string,
  ipAddress?: string,
): Promise<PaymentInitiation> {
  const order = await prisma.order.findUnique({ where: { orderCode: orderCode.toUpperCase() } });
  if (!order) throw new Error('Order not found');
  if (order.userId !== userId) throw new Error('Order not found');
  if (order.paymentStatus !== 'PENDING') {
    throw new Error('Payment already processed for this order');
  }
  if (order.status !== 'PENDING') {
    throw new Error('Order is no longer pending payment');
  }

  const provider = getPaymentProvider(order.paymentMethod as PaymentMethod);
  const orderForPayment: OrderForPayment = {
    id: order.id,
    orderCode: order.orderCode,
    paymentMethod: order.paymentMethod as PaymentMethod,
    total: Number(order.total),
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    ipAddress,
  };

  const initiation = await provider.initiate(orderForPayment);

  if (initiation.gatewayTxnRef) {
    // Upsert — handles the case where a retry re-uses the same txnRef (VNPay orderCode)
    const existing = await prisma.orderPaymentTransaction.findUnique({
      where: { gatewayTxnRef: initiation.gatewayTxnRef },
    });
    if (!existing) {
      await prisma.orderPaymentTransaction.create({
        data: {
          orderId: order.id,
          method: order.paymentMethod as PaymentMethod,
          amount: Number(order.total),
          gatewayTxnRef: initiation.gatewayTxnRef,
          status: 'PENDING',
        },
      });
    }
  }

  return initiation;
}
