import { ReturnReason } from '@prisma/client';

export type CategoryType = 'RACKET' | 'SHOES' | 'APPAREL' | 'SHUTTLECOCK' | 'STRING' | 'ACCESSORIES';

export interface EligibilityInput {
  productCategory: string;
  hasStringing: boolean; // true if orderItem.stringVariantId is not null
  sealOpened?: boolean;  // for strings — passed via customer's declaration
  reason: ReturnReason;
  daysSinceDelivery: number;
}

export interface EligibilityResult {
  eligible: boolean;
  ruleCode?: string;
  message?: string;
}

export function getCategoryType(productCategory: string): CategoryType {
  const c = productCategory.toLowerCase();
  if (c.includes('racket') || c.includes('astrox') || c.includes('nanoflare') || c.includes('arcsaber')) {
    return 'RACKET';
  }
  if (c.includes('shoe') || c.includes('cushion') || c.includes('footwear')) return 'SHOES';
  if (c.includes('apparel') || c.includes('clothing') || c.includes('shirt') || c.includes('shorts')) {
    return 'APPAREL';
  }
  if (c.includes('shuttlecock') || c.includes('shuttle')) return 'SHUTTLECOCK';
  if (c.includes('string')) return 'STRING';
  return 'ACCESSORIES';
}

export function canItemBeReturned(input: EligibilityInput): EligibilityResult {
  if (input.daysSinceDelivery < 0) {
    return { eligible: false, ruleCode: 'INVALID_DATE', message: 'Delivery date is in the future' };
  }
  if (input.daysSinceDelivery > 7) {
    return {
      eligible: false,
      ruleCode: 'RETURN_WINDOW_EXPIRED',
      message: 'Return window (7 days from delivery) has expired',
    };
  }

  const category = getCategoryType(input.productCategory);

  switch (category) {
    case 'RACKET': {
      if (input.hasStringing && input.reason !== 'DEFECTIVE') {
        return {
          eligible: false,
          ruleCode: 'STRUNG_RACKET_NOT_RETURNABLE',
          message: 'Strung rackets can only be returned if defective',
        };
      }
      return { eligible: true };
    }

    case 'SHOES':
    case 'APPAREL':
    case 'ACCESSORIES':
      return { eligible: true };

    case 'SHUTTLECOCK': {
      if (input.reason !== 'DEFECTIVE') {
        return {
          eligible: false,
          ruleCode: 'CONSUMABLE_NOT_RETURNABLE',
          message: 'Shuttlecocks can only be returned if defective',
        };
      }
      return { eligible: true };
    }

    case 'STRING': {
      if (input.sealOpened) {
        return {
          eligible: false,
          ruleCode: 'STRING_SEAL_OPENED',
          message: 'Strings with opened seal cannot be returned',
        };
      }
      if (input.reason !== 'DEFECTIVE') {
        return {
          eligible: false,
          ruleCode: 'CONSUMABLE_NOT_RETURNABLE',
          message: 'Strings can only be returned if defective and seal is intact',
        };
      }
      return { eligible: true };
    }
  }
}
