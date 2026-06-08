import { describe, it, expect } from 'vitest';
import { getZoneForProvince } from '../shipping.zones';

describe('getZoneForProvince', () => {
  it('returns ZONE_1 for Hồ Chí Minh', () => {
    expect(getZoneForProvince('Hồ Chí Minh')).toBe('ZONE_1');
  });

  it('returns ZONE_1 for Hà Nội', () => {
    expect(getZoneForProvince('Hà Nội')).toBe('ZONE_1');
  });

  it('is case-insensitive for ZONE_1', () => {
    expect(getZoneForProvince('HỒ CHÍ MINH')).toBe('ZONE_1');
    expect(getZoneForProvince('hà nội')).toBe('ZONE_1');
  });

  it('returns ZONE_2 for Đà Nẵng', () => {
    expect(getZoneForProvince('Đà Nẵng')).toBe('ZONE_2');
  });

  it('returns ZONE_2 for Hải Phòng', () => {
    expect(getZoneForProvince('Hải Phòng')).toBe('ZONE_2');
  });

  it('returns ZONE_2 for Cần Thơ', () => {
    expect(getZoneForProvince('Cần Thơ')).toBe('ZONE_2');
  });

  it('returns ZONE_2 for Đồng Nai (Biên Hòa)', () => {
    expect(getZoneForProvince('Đồng Nai')).toBe('ZONE_2');
  });

  it('returns ZONE_4 for Hà Giang', () => {
    expect(getZoneForProvince('Hà Giang')).toBe('ZONE_4');
  });

  it('returns ZONE_4 for Cao Bằng', () => {
    expect(getZoneForProvince('Cao Bằng')).toBe('ZONE_4');
  });

  it('returns ZONE_4 for Điện Biên', () => {
    expect(getZoneForProvince('Điện Biên')).toBe('ZONE_4');
  });

  it('returns ZONE_3 for an unknown province (default)', () => {
    expect(getZoneForProvince('Bình Thuận')).toBe('ZONE_3');
  });

  it('returns ZONE_3 for any unlisted province', () => {
    expect(getZoneForProvince('Kon Tum')).toBe('ZONE_3');
    expect(getZoneForProvince('Quảng Ngãi')).toBe('ZONE_3');
  });

  it('trims leading/trailing whitespace', () => {
    expect(getZoneForProvince('  Hà Nội  ')).toBe('ZONE_1');
  });
});
