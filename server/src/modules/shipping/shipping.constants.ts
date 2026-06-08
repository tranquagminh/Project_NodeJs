import { ShippingZone, ShippingMethod } from '@prisma/client';

export const FREE_SHIPPING_THRESHOLD = 1_500_000; // VND — standard only
export const COD_MAX_ORDER_VALUE = 5_000_000;     // VND

export const SHIPPING_FEES: Record<ShippingZone, Record<ShippingMethod, number | null>> = {
  ZONE_1: { STANDARD_DELIVERY: 25_000, EXPRESS_VELOCITY: 50_000 },
  ZONE_2: { STANDARD_DELIVERY: 35_000, EXPRESS_VELOCITY: 70_000 },
  ZONE_3: { STANDARD_DELIVERY: 45_000, EXPRESS_VELOCITY: 90_000 },
  ZONE_4: { STANDARD_DELIVERY: 60_000, EXPRESS_VELOCITY: null },
};

export const SHIPPING_LEAD_TIME_DAYS: Record<
  ShippingZone,
  { standard: [number, number]; express: [number, number] | null }
> = {
  ZONE_1: { standard: [1, 2], express: [0, 1] },
  ZONE_2: { standard: [2, 3], express: [1, 1] },
  ZONE_3: { standard: [3, 5], express: [2, 2] },
  ZONE_4: { standard: [5, 7], express: null },
};

export const STRINGING_EXTRA_DAYS = 1;
