import { PROVINCES, DISTRICTS, WARDS } from './location.data';
import { NotFoundError } from '../../utils/errors';

export function getProvinces() {
  return PROVINCES;
}

export function getDistricts(provinceCode: string) {
  const province = PROVINCES.find((p) => p.code === provinceCode);
  if (!province) throw new NotFoundError(`Province ${provinceCode} not found`);

  return DISTRICTS.filter((d) => d.provinceCode === provinceCode);
}

export function getWards(districtCode: string) {
  const district = DISTRICTS.find((d) => d.code === districtCode);
  if (!district) throw new NotFoundError(`District ${districtCode} not found`);

  return WARDS.filter((w) => w.districtCode === districtCode);
}
