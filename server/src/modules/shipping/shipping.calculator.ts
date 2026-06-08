import { ShippingZone, ShippingMethod } from '@prisma/client';
import {
  SHIPPING_FEES,
  SHIPPING_LEAD_TIME_DAYS,
  FREE_SHIPPING_THRESHOLD,
  STRINGING_EXTRA_DAYS,
} from './shipping.constants';

export interface ShippingQuote {
  fee: number;
  estimatedDays: [number, number] | null;
  qualifiesForFreeShipping: boolean;
  isFree: boolean;
}

export function calculateShippingFee(
  zone: ShippingZone,
  method: ShippingMethod,
  subtotal: number,
  hasStringing = false,
): ShippingQuote {
  const baseFee = SHIPPING_FEES[zone][method];
  if (baseFee === null) {
    return { fee: 0, estimatedDays: null, qualifiesForFreeShipping: false, isFree: false };
  }

  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const isFree = qualifiesForFreeShipping && method === 'STANDARD_DELIVERY';
  const fee = isFree ? 0 : baseFee;

  const leadTime = SHIPPING_LEAD_TIME_DAYS[zone];
  let days: [number, number] | null =
    method === 'STANDARD_DELIVERY' ? leadTime.standard : leadTime.express;

  if (days !== null && hasStringing) {
    days = [days[0] + STRINGING_EXTRA_DAYS, days[1] + STRINGING_EXTRA_DAYS];
  }

  return { fee, estimatedDays: days, qualifiesForFreeShipping, isFree };
}
