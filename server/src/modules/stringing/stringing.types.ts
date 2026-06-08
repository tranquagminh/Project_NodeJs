import type { GRIP_OPTIONS } from './stringing.constants';
import type { StringingConfig } from './stringing.validation';

export interface VariantOption {
  variantId: string;
  label: string;
  weight: string;
  gripSize: string;
  maxTension: number;
  defaultTension: number;
  stock: number;
}

export interface RacketOptions {
  productId: string;
  name: string;
  variants: VariantOption[];
}

export interface StringSpecs {
  gauge: number | null;
  maxTension: number;
  recommendedMin: number | null;
  recommendedMax: number | null;
  repulsion: number | null;
  durability: number | null;
  control: number | null;
}

export interface CompatibleString {
  productId: string;
  variantId: string;
  name: string;
  brand: string;
  price: number;
  salePrice: number | null;
  stock: number;
  specs: StringSpecs;
  isRecommended: boolean;
}

export interface StringingOptionsResponse {
  racket: RacketOptions;
  compatibleStrings: CompatibleString[];
  gripOptions: typeof GRIP_OPTIONS;
  stringingFee: number;
  leadTimeAddedDays: number;
  disclaimer: string;
}

export interface PriceBreakdown {
  racketVariantPrice: number;
  stringVariantPrice: number;
  stringingFee: number;
  totalAdditional: number;
}

export type ValidateResult =
  | { valid: true; config: StringingConfig; priceBreakdown: PriceBreakdown; summary: string }
  | { valid: false; rule: string; message: string; details: Record<string, unknown> };
