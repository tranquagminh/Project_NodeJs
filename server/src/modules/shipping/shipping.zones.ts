import { ShippingZone } from '@prisma/client';

const ZONE_1_PROVINCES = new Set(['hồ chí minh', 'hà nội']);

const ZONE_2_PROVINCES = new Set([
  'đà nẵng',
  'hải phòng',
  'cần thơ',
  'đồng nai',
  'bà rịa - vũng tàu',
]);

const ZONE_4_PROVINCES = new Set([
  'hà giang',
  'cao bằng',
  'điện biên',
  'lai châu',
  'sơn la',
  'lào cai',
  'yên bái',
]);

export function getZoneForProvince(province: string): ShippingZone {
  const normalized = province.trim().toLowerCase();
  if (ZONE_1_PROVINCES.has(normalized)) return 'ZONE_1';
  if (ZONE_2_PROVINCES.has(normalized)) return 'ZONE_2';
  if (ZONE_4_PROVINCES.has(normalized)) return 'ZONE_4';
  return 'ZONE_3';
}
