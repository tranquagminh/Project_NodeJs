import { ShippingMethod } from '@prisma/client';
import { getZoneForProvince } from './shipping.zones';
import { calculateShippingFee } from './shipping.calculator';

export async function getShippingQuote(params: {
  subtotal: number;
  province: string;
  method: ShippingMethod;
  hasStringing?: boolean;
}) {
  const zone = getZoneForProvince(params.province);
  const quote = calculateShippingFee(zone, params.method, params.subtotal, params.hasStringing);

  if (quote.estimatedDays === null) {
    throw Object.assign(new Error('EXPRESS_NOT_AVAILABLE_IN_ZONE'), {
      statusCode: 422,
      errorCode: 'EXPRESS_NOT_AVAILABLE_IN_ZONE',
    });
  }

  return {
    zone,
    fee: quote.fee,
    estimatedDays: quote.estimatedDays,
    qualifiesForFreeShipping: quote.qualifiesForFreeShipping,
    isFree: quote.isFree,
  };
}
