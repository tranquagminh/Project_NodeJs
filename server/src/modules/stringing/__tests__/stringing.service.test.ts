import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BusinessRuleError, NotFoundError } from '../../../utils/errors';

// ── Prisma mock ───────────────────────────────────────────────────────────────
const mockPrismaProduct = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findMany: vi.fn(),
}));
const mockPrismaVariant = vi.hoisted(() => ({ findUnique: vi.fn() }));

vi.mock('../../../config/database', () => ({
  default: {
    product: mockPrismaProduct,
    productVariant: mockPrismaVariant,
  },
}));

import {
  calculateEffectiveMaxTension,
  calculateDefaultTension,
  calculateStringingPriceImpact,
  getStringingOptions,
  validateStringingConfig,
} from '../stringing.service';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const RACKET_CAT_SUB   = { id: 'cat-astrox', slug: 'astrox-series', parent: { slug: 'rackets' } };
const RACKET_CAT_ROOT  = { id: 'cat-rackets', slug: 'rackets', parent: null };
const STRING_CAT_ROOT  = { id: 'cat-strings', slug: 'strings', parent: null };
const SHOES_CAT        = { id: 'cat-shoes', slug: 'shoes', parent: null };

const RACKET_SPEC = {
  id: 'spec-1',
  maxTensionByWeight: { '3U': 29, '4U': 28 },
  defaultTensionByWeight: { '3U': 27, '4U': 26 },
  recommendedStringIds: ['string-product-1'],
};

const STRING_SPEC = {
  id: 'spec-str-1',
  stringMaxTension: 30,
  stringRecommendedMin: 20,
  stringRecommendedMax: 28,
  stringRepulsion: 5,
  stringDurability: 3,
  stringControl: 3,
};

const RACKET_VARIANT_4U = {
  id: 'variant-racket-4u',
  productId: 'product-racket-1',
  isActive: true,
  stock: 15,
  price: '235.00',
  salePrice: null,
  attributes: { weight: '4U', gripSize: 'G5' },
  product: {
    id: 'product-racket-1',
    name: 'ASTROX 88 D PRO',
    spec: RACKET_SPEC,
    category: RACKET_CAT_SUB,
  },
};

const STRING_VARIANT = {
  id: 'variant-string-1',
  productId: 'string-product-1',
  isActive: true,
  stock: 100,
  price: '12.00',
  salePrice: null,
  attributes: { gauge: 0.68, color: 'White', length: 10 },
  product: {
    id: 'string-product-1',
    name: 'BG80 Performance String',
    spec: STRING_SPEC,
    category: STRING_CAT_ROOT,
  },
};

// ── Pure function tests ───────────────────────────────────────────────────────

describe('calculateEffectiveMaxTension', () => {
  it('returns RACKET binding when racket max < string max', () => {
    const result = calculateEffectiveMaxTension({ '4U': 28 }, '4U', 30);
    expect(result).toEqual({ effective: 28, binding: 'RACKET' });
  });

  it('returns STRING binding when string max < racket max', () => {
    const result = calculateEffectiveMaxTension({ '3U': 30 }, '3U', 28);
    expect(result).toEqual({ effective: 28, binding: 'STRING' });
  });

  it('returns EQUAL binding when both maxes are equal', () => {
    const result = calculateEffectiveMaxTension({ '4U': 28 }, '4U', 28);
    expect(result).toEqual({ effective: 28, binding: 'EQUAL' });
  });

  it('throws MAX_TENSION_NOT_CONFIGURED when weight not in map', () => {
    expect(() => calculateEffectiveMaxTension({ '4U': 28 }, '3U', 30))
      .toThrow(BusinessRuleError);
    expect(() => calculateEffectiveMaxTension({ '4U': 28 }, '3U', 30)).toThrow(
      expect.objectContaining({ ruleCode: 'MAX_TENSION_NOT_CONFIGURED' }),
    );
  });
});

describe('calculateDefaultTension', () => {
  it('uses explicit default when set for the weight', () => {
    expect(calculateDefaultTension({ '4U': 26 }, { '4U': 28 }, '4U')).toBe(26);
  });

  it('falls back to maxByWeight - 2 when defaultByWeight is null', () => {
    expect(calculateDefaultTension(null, { '4U': 28 }, '4U')).toBe(26);
  });

  it('falls back when defaultByWeight is empty object', () => {
    expect(calculateDefaultTension({}, { '4U': 28 }, '4U')).toBe(26);
  });

  it('falls back when weight not in defaultByWeight but is in maxByWeight', () => {
    expect(calculateDefaultTension({ '3U': 27 }, { '4U': 28 }, '4U')).toBe(26);
  });

  it('throws when weight absent from both maps', () => {
    expect(() => calculateDefaultTension(null, { '4U': 28 }, '5U'))
      .toThrow(expect.objectContaining({ ruleCode: 'MAX_TENSION_NOT_CONFIGURED' }));
  });
});

describe('calculateStringingPriceImpact', () => {
  it('returns correct breakdown with STRINGING_SERVICE_FEE = 0', () => {
    expect(calculateStringingPriceImpact(180000)).toEqual({
      stringPrice: 180000,
      stringingFee: 0,
      total: 180000,
    });
  });

  it('total equals stringPrice + fee for any price', () => {
    const result = calculateStringingPriceImpact(12);
    expect(result.total).toBe(result.stringPrice + result.stringingFee);
  });
});

// ── Service layer tests (mocked Prisma) ──────────────────────────────────────

describe('getStringingOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('happy path: returns racket variants and compatible strings, recommended first', async () => {
    mockPrismaProduct.findUnique.mockResolvedValue({
      id: 'product-racket-1',
      name: 'ASTROX 88 D PRO',
      category: RACKET_CAT_SUB,
      brand: { name: 'VOLTA' },
      spec: RACKET_SPEC,
      variants: [
        { id: 'v1', isActive: true, stock: 15, price: '235.00', salePrice: null, attributes: { weight: '4U', gripSize: 'G5' } },
        { id: 'v2', isActive: true, stock: 10, price: '235.00', salePrice: null, attributes: { weight: '3U', gripSize: 'G4' } },
      ],
    });
    mockPrismaProduct.findMany.mockResolvedValue([
      {
        id: 'string-product-1',
        name: 'BG80 Performance String',
        brand: { name: 'YONEX' },
        spec: STRING_SPEC,
        variants: [{ id: 'sv1', isActive: true, stock: 100, price: '12.00', salePrice: null, attributes: { gauge: 0.68 } }],
      },
      {
        id: 'string-product-2',
        name: 'BG65 Power String',
        brand: { name: 'YONEX' },
        spec: { stringMaxTension: 30, stringRecommendedMin: 18, stringRecommendedMax: 28, stringRepulsion: 3, stringDurability: 5, stringControl: 3 },
        variants: [{ id: 'sv2', isActive: true, stock: 150, price: '9.00', salePrice: null, attributes: { gauge: 0.70 } }],
      },
    ]);

    const result = await getStringingOptions('product-racket-1');

    expect(result.racket.productId).toBe('product-racket-1');
    expect(result.racket.variants).toHaveLength(2);
    expect(result.racket.variants[0].weight).toBe('4U');
    expect(result.racket.variants[0].maxTension).toBe(28);
    expect(result.racket.variants[0].defaultTension).toBe(26);
    expect(result.compatibleStrings).toHaveLength(2);
    // BG80 is recommended → first
    expect(result.compatibleStrings[0].productId).toBe('string-product-1');
    expect(result.compatibleStrings[0].isRecommended).toBe(true);
    expect(result.compatibleStrings[1].isRecommended).toBe(false);
    expect(result.stringingFee).toBe(0);
    expect(result.leadTimeAddedDays).toBe(1);
  });

  it('throws NOT_FOUND when product does not exist', async () => {
    mockPrismaProduct.findUnique.mockResolvedValue(null);
    await expect(getStringingOptions('non-existent-id')).rejects.toThrow(NotFoundError);
  });

  it('throws NOT_A_RACKET for a shoes product', async () => {
    mockPrismaProduct.findUnique.mockResolvedValue({
      id: 'shoe-product',
      name: 'POWER CUSHION 65 Z3',
      category: SHOES_CAT,
      brand: { name: 'VOLTA' },
      spec: null,
      variants: [],
    });
    await expect(getStringingOptions('shoe-product')).rejects.toThrow(
      expect.objectContaining({ ruleCode: 'NOT_A_RACKET' }),
    );
  });

  it('throws RACKET_SPEC_INCOMPLETE when spec is missing', async () => {
    mockPrismaProduct.findUnique.mockResolvedValue({
      id: 'product-racket-1',
      name: 'ASTROX 88 D PRO',
      category: RACKET_CAT_SUB,
      brand: { name: 'VOLTA' },
      spec: null,
      variants: [],
    });
    await expect(getStringingOptions('product-racket-1')).rejects.toThrow(
      expect.objectContaining({ ruleCode: 'RACKET_SPEC_INCOMPLETE' }),
    );
  });

  it('throws RACKET_SPEC_INCOMPLETE when maxTensionByWeight is null', async () => {
    mockPrismaProduct.findUnique.mockResolvedValue({
      id: 'product-racket-1',
      name: 'ASTROX 88 D PRO',
      category: RACKET_CAT_SUB,
      brand: { name: 'VOLTA' },
      spec: { maxTensionByWeight: null, defaultTensionByWeight: null, recommendedStringIds: [] },
      variants: [],
    });
    await expect(getStringingOptions('product-racket-1')).rejects.toThrow(
      expect.objectContaining({ ruleCode: 'RACKET_SPEC_INCOMPLETE' }),
    );
  });

  it('returns empty compatibleStrings when all strings are out of stock (non-recommended)', async () => {
    mockPrismaProduct.findUnique.mockResolvedValue({
      id: 'product-racket-1',
      name: 'ASTROX 88 D PRO',
      category: RACKET_CAT_SUB,
      brand: { name: 'VOLTA' },
      spec: { maxTensionByWeight: { '4U': 28 }, defaultTensionByWeight: null, recommendedStringIds: [] },
      variants: [{ id: 'v1', isActive: true, stock: 10, price: '235.00', salePrice: null, attributes: { weight: '4U', gripSize: 'G5' } }],
    });
    mockPrismaProduct.findMany.mockResolvedValue([
      {
        id: 'string-product-2',
        name: 'BG65',
        brand: { name: 'YONEX' },
        spec: null,
        variants: [{ id: 'sv2', isActive: true, stock: 0, price: '9.00', salePrice: null, attributes: {} }],
      },
    ]);

    const result = await getStringingOptions('product-racket-1');
    // BG65 is not recommended and out of stock → excluded
    expect(result.compatibleStrings).toHaveLength(0);
  });

  it('includes out-of-stock string if it is recommended', async () => {
    mockPrismaProduct.findUnique.mockResolvedValue({
      id: 'product-racket-1',
      name: 'ASTROX 88 D PRO',
      category: RACKET_CAT_SUB,
      brand: { name: 'VOLTA' },
      spec: { maxTensionByWeight: { '4U': 28 }, defaultTensionByWeight: null, recommendedStringIds: ['string-product-1'] },
      variants: [{ id: 'v1', isActive: true, stock: 10, price: '235.00', salePrice: null, attributes: { weight: '4U', gripSize: 'G5' } }],
    });
    mockPrismaProduct.findMany.mockResolvedValue([
      {
        id: 'string-product-1',
        name: 'BG80',
        brand: { name: 'YONEX' },
        spec: STRING_SPEC,
        variants: [{ id: 'sv1', isActive: true, stock: 0, price: '12.00', salePrice: null, attributes: {} }],
      },
    ]);

    const result = await getStringingOptions('product-racket-1');
    expect(result.compatibleStrings).toHaveLength(1);
    expect(result.compatibleStrings[0].stock).toBe(0);
    expect(result.compatibleStrings[0].isRecommended).toBe(true);
  });
});

describe('validateStringingConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validInput = {
    racketVariantId: 'variant-racket-4u',
    stringVariantId: 'variant-string-1',
    tension: 26,
    gripChoice: 'ORIGINAL' as const,
  };

  it('happy path: returns valid: true with correct priceBreakdown', async () => {
    mockPrismaVariant.findUnique
      .mockResolvedValueOnce(RACKET_VARIANT_4U)
      .mockResolvedValueOnce(STRING_VARIANT);

    const result = await validateStringingConfig(validInput);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.priceBreakdown.stringingFee).toBe(0);
      expect(result.priceBreakdown.stringVariantPrice).toBe(12);
      expect(result.priceBreakdown.totalAdditional).toBe(12);
      expect(result.summary).toContain('ASTROX 88 D PRO');
      expect(result.summary).toContain('26 lbs');
    }
  });

  it('tension at exact effective max is valid (boundary inclusive)', async () => {
    mockPrismaVariant.findUnique
      .mockResolvedValueOnce(RACKET_VARIANT_4U)    // racket max 4U = 28
      .mockResolvedValueOnce(STRING_VARIANT);       // string max = 30 → effective = 28

    const result = await validateStringingConfig({ ...validInput, tension: 28 });
    expect(result.valid).toBe(true);
  });

  it('tension at max + 0.5 is invalid', async () => {
    mockPrismaVariant.findUnique
      .mockResolvedValueOnce(RACKET_VARIANT_4U)
      .mockResolvedValueOnce(STRING_VARIANT);

    const result = await validateStringingConfig({ ...validInput, tension: 28.5 });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.rule).toBe('MAX_TENSION_EXCEEDED');
      expect(result.details).toMatchObject({ effectiveMax: 28, racketMaxTension: 28, stringMaxTension: 30 });
    }
  });

  it('tension exceeds racket max — binding = RACKET', async () => {
    mockPrismaVariant.findUnique
      .mockResolvedValueOnce(RACKET_VARIANT_4U)     // racket max 4U = 28
      .mockResolvedValueOnce(STRING_VARIANT);        // string max = 30

    const result = await validateStringingConfig({ ...validInput, tension: 32 });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.rule).toBe('MAX_TENSION_EXCEEDED');
      expect(result.details).toMatchObject({ binding: 'RACKET', effectiveMax: 28 });
    }
  });

  it('tension exceeds string max — binding = STRING', async () => {
    const lowMaxString = {
      ...STRING_VARIANT,
      product: { ...STRING_VARIANT.product, spec: { ...STRING_SPEC, stringMaxTension: 24 } },
    };
    mockPrismaVariant.findUnique
      .mockResolvedValueOnce(RACKET_VARIANT_4U)   // racket max 4U = 28
      .mockResolvedValueOnce(lowMaxString);         // string max = 24 → effective = 24

    const result = await validateStringingConfig({ ...validInput, tension: 26 });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.rule).toBe('MAX_TENSION_EXCEEDED');
      expect(result.details).toMatchObject({ binding: 'STRING', effectiveMax: 24 });
    }
  });

  it('returns STRING_OUT_OF_STOCK when string variant stock is 0', async () => {
    const oos = { ...STRING_VARIANT, stock: 0 };
    mockPrismaVariant.findUnique
      .mockResolvedValueOnce(RACKET_VARIANT_4U)
      .mockResolvedValueOnce(oos);

    const result = await validateStringingConfig(validInput);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.rule).toBe('STRING_OUT_OF_STOCK');
  });

  it('returns RACKET_VARIANT_INACTIVE when racket variant is inactive', async () => {
    const inactive = { ...RACKET_VARIANT_4U, isActive: false };
    mockPrismaVariant.findUnique.mockResolvedValueOnce(inactive);

    const result = await validateStringingConfig(validInput);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.rule).toBe('RACKET_VARIANT_INACTIVE');
  });

  it('returns NOT_A_STRING when string variant belongs to shoes category', async () => {
    const shoeVariant = {
      ...STRING_VARIANT,
      product: { ...STRING_VARIANT.product, category: SHOES_CAT },
    };
    mockPrismaVariant.findUnique
      .mockResolvedValueOnce(RACKET_VARIANT_4U)
      .mockResolvedValueOnce(shoeVariant);

    const result = await validateStringingConfig(validInput);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.rule).toBe('NOT_A_STRING');
  });

  it('returns NOT_A_RACKET when racket variant belongs to shoes category', async () => {
    const shoeRacketVariant = {
      ...RACKET_VARIANT_4U,
      product: { ...RACKET_VARIANT_4U.product, category: SHOES_CAT },
    };
    mockPrismaVariant.findUnique.mockResolvedValueOnce(shoeRacketVariant);

    const result = await validateStringingConfig(validInput);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.rule).toBe('NOT_A_RACKET');
  });

  it('throws NotFoundError when racket variant does not exist', async () => {
    mockPrismaVariant.findUnique.mockResolvedValue(null);
    await expect(validateStringingConfig(validInput)).rejects.toThrow(NotFoundError);
  });

  it('throws NotFoundError when string variant does not exist', async () => {
    mockPrismaVariant.findUnique
      .mockResolvedValueOnce(RACKET_VARIANT_4U)
      .mockResolvedValueOnce(null);
    await expect(validateStringingConfig(validInput)).rejects.toThrow(NotFoundError);
  });

  it('accepts racket in root rackets category (not just sub-categories)', async () => {
    const rootCategoryVariant = {
      ...RACKET_VARIANT_4U,
      product: { ...RACKET_VARIANT_4U.product, category: RACKET_CAT_ROOT },
    };
    mockPrismaVariant.findUnique
      .mockResolvedValueOnce(rootCategoryVariant)
      .mockResolvedValueOnce(STRING_VARIANT);

    const result = await validateStringingConfig(validInput);
    expect(result.valid).toBe(true);
  });
});
