import { describe, it, expect } from 'vitest';
import { calculateShippingFee } from '../shipping.calculator';
import { FREE_SHIPPING_THRESHOLD } from '../shipping.constants';

describe('calculateShippingFee', () => {
  describe('base fee per zone × method', () => {
    it('ZONE_1 + STANDARD → 25,000', () => {
      expect(calculateShippingFee('ZONE_1', 'STANDARD_DELIVERY', 0).fee).toBe(25_000);
    });
    it('ZONE_1 + EXPRESS → 50,000', () => {
      expect(calculateShippingFee('ZONE_1', 'EXPRESS_VELOCITY', 0).fee).toBe(50_000);
    });
    it('ZONE_2 + STANDARD → 35,000', () => {
      expect(calculateShippingFee('ZONE_2', 'STANDARD_DELIVERY', 0).fee).toBe(35_000);
    });
    it('ZONE_2 + EXPRESS → 70,000', () => {
      expect(calculateShippingFee('ZONE_2', 'EXPRESS_VELOCITY', 0).fee).toBe(70_000);
    });
    it('ZONE_3 + STANDARD → 45,000', () => {
      expect(calculateShippingFee('ZONE_3', 'STANDARD_DELIVERY', 0).fee).toBe(45_000);
    });
    it('ZONE_3 + EXPRESS → 90,000', () => {
      expect(calculateShippingFee('ZONE_3', 'EXPRESS_VELOCITY', 0).fee).toBe(90_000);
    });
    it('ZONE_4 + STANDARD → 60,000', () => {
      expect(calculateShippingFee('ZONE_4', 'STANDARD_DELIVERY', 0).fee).toBe(60_000);
    });
    it('ZONE_4 + EXPRESS → not available (null estimatedDays, fee 0)', () => {
      const result = calculateShippingFee('ZONE_4', 'EXPRESS_VELOCITY', 0);
      expect(result.estimatedDays).toBeNull();
      expect(result.isFree).toBe(false);
    });
  });

  describe('free shipping threshold', () => {
    it('qualifies for free STANDARD when subtotal >= threshold', () => {
      const result = calculateShippingFee('ZONE_1', 'STANDARD_DELIVERY', FREE_SHIPPING_THRESHOLD);
      expect(result.fee).toBe(0);
      expect(result.isFree).toBe(true);
      expect(result.qualifiesForFreeShipping).toBe(true);
    });

    it('qualifies at exactly the threshold', () => {
      const result = calculateShippingFee('ZONE_3', 'STANDARD_DELIVERY', FREE_SHIPPING_THRESHOLD);
      expect(result.fee).toBe(0);
      expect(result.isFree).toBe(true);
    });

    it('does NOT qualify one VND below threshold', () => {
      const result = calculateShippingFee('ZONE_1', 'STANDARD_DELIVERY', FREE_SHIPPING_THRESHOLD - 1);
      expect(result.fee).toBe(25_000);
      expect(result.isFree).toBe(false);
    });

    it('EXPRESS is never free even above threshold', () => {
      const result = calculateShippingFee('ZONE_1', 'EXPRESS_VELOCITY', FREE_SHIPPING_THRESHOLD * 2);
      expect(result.fee).toBe(50_000);
      expect(result.isFree).toBe(false);
      expect(result.qualifiesForFreeShipping).toBe(true); // qualifies but not applied to express
    });
  });

  describe('lead time', () => {
    it('ZONE_1 STANDARD → [1, 2] days', () => {
      expect(calculateShippingFee('ZONE_1', 'STANDARD_DELIVERY', 0).estimatedDays).toEqual([1, 2]);
    });

    it('ZONE_1 EXPRESS → [0, 1] days', () => {
      expect(calculateShippingFee('ZONE_1', 'EXPRESS_VELOCITY', 0).estimatedDays).toEqual([0, 1]);
    });

    it('adds +1 day each end when hasStringing = true', () => {
      const base = calculateShippingFee('ZONE_1', 'STANDARD_DELIVERY', 0);
      const withStringing = calculateShippingFee('ZONE_1', 'STANDARD_DELIVERY', 0, true);
      expect(withStringing.estimatedDays).toEqual([
        base.estimatedDays![0] + 1,
        base.estimatedDays![1] + 1,
      ]);
    });

    it('ZONE_4 EXPRESS has null estimatedDays even with stringing', () => {
      const result = calculateShippingFee('ZONE_4', 'EXPRESS_VELOCITY', 0, true);
      expect(result.estimatedDays).toBeNull();
    });
  });
});
