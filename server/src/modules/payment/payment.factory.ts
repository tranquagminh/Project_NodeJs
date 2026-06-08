import { PaymentMethod } from '@prisma/client';
import { env } from '../../config/env';
import { PaymentProvider } from './payment.types';
import { CodProvider } from './providers/cod.provider';
import { BankTransferProvider } from './providers/bank-transfer.provider';
import { VnpayProvider } from './providers/vnpay.provider';
import { MomoProvider } from './providers/momo.provider';
import { MockProvider } from './providers/mock.provider';

export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  if (env.PAYMENT_MOCK_MODE && (method === 'VNPAY' || method === 'MOMO')) {
    return new MockProvider();
  }

  switch (method) {
    case 'COD':
      return new CodProvider();
    case 'BANK_TRANSFER':
      return new BankTransferProvider();
    case 'VNPAY':
      return new VnpayProvider();
    case 'MOMO':
      return new MomoProvider();
  }
}
