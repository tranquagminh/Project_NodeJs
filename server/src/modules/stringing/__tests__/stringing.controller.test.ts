import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { NotFoundError, BusinessRuleError } from '../../../utils/errors';
import { errorHandler } from '../../../middlewares/errorHandler';
import { GRIP_OPTIONS } from '../stringing.constants';

// ── Mock service ──────────────────────────────────────────────────────────────
vi.mock('../stringing.service', () => ({
  getStringingOptions: vi.fn(),
  validateStringingConfig: vi.fn(),
}));

import { getStringingOptions, validateStringingConfig } from '../stringing.service';
import stringingRoutes from '../stringing.route';

// ── Test app ──────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/stringing', stringingRoutes);
app.use(errorHandler);

// ── Fixtures ──────────────────────────────────────────────────────────────────
const RACKET_PRODUCT_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const RACKET_VARIANT_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';
const STRING_VARIANT_ID = 'c3d4e5f6-a7b8-4c9d-ae0f-2a3b4c5d6e7f';

const MOCK_OPTIONS = {
  racket: {
    productId: RACKET_PRODUCT_ID,
    name: 'ASTROX 88 D PRO',
    variants: [{ variantId: RACKET_VARIANT_ID, label: '4U G5', weight: '4U', gripSize: 'G5', maxTension: 28, defaultTension: 26, stock: 15 }],
  },
  compatibleStrings: [
    { productId: 'sp1', variantId: STRING_VARIANT_ID, name: 'BG80', brand: 'YONEX', price: 12, salePrice: null, stock: 100, specs: { gauge: 0.68, maxTension: 30, recommendedMin: 20, recommendedMax: 28, repulsion: 5, durability: 3, control: 3 }, isRecommended: true },
  ],
  gripOptions: GRIP_OPTIONS,
  stringingFee: 0,
  leadTimeAddedDays: 1,
  disclaimer: 'Stringing is free with every racket purchase. Adds 1 day to delivery.',
};

const MOCK_VALID_RESULT = {
  valid: true as const,
  config: { racketVariantId: RACKET_VARIANT_ID, stringVariantId: STRING_VARIANT_ID, tension: 26, gripChoice: 'ORIGINAL' as const },
  priceBreakdown: { racketVariantPrice: 235, stringVariantPrice: 12, stringingFee: 0, totalAdditional: 12 },
  summary: 'ASTROX 88 D PRO (4U G5) strung with BG80 @ 26 lbs',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/stringing/options/:racketProductId', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('200 happy path — returns stringing options', async () => {
    vi.mocked(getStringingOptions).mockResolvedValue(MOCK_OPTIONS);

    const res = await request(app).get(`/api/stringing/options/${RACKET_PRODUCT_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.racket.productId).toBe(RACKET_PRODUCT_ID);
    expect(res.body.data.compatibleStrings[0].isRecommended).toBe(true);
  });

  it('404 when product does not exist', async () => {
    vi.mocked(getStringingOptions).mockRejectedValue(new NotFoundError('Product not found'));

    const res = await request(app).get(`/api/stringing/options/${RACKET_PRODUCT_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('422 NOT_A_RACKET for shoes/apparel product', async () => {
    vi.mocked(getStringingOptions).mockRejectedValue(
      new BusinessRuleError('Not a racket', 'NOT_A_RACKET', { categorySlug: 'shoes' }),
    );

    const res = await request(app).get(`/api/stringing/options/${RACKET_PRODUCT_ID}`);
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('NOT_A_RACKET');
  });

  it('422 RACKET_SPEC_INCOMPLETE for racket with no spec', async () => {
    vi.mocked(getStringingOptions).mockRejectedValue(
      new BusinessRuleError('Spec incomplete', 'RACKET_SPEC_INCOMPLETE', {}),
    );

    const res = await request(app).get(`/api/stringing/options/${RACKET_PRODUCT_ID}`);
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('RACKET_SPEC_INCOMPLETE');
  });

  it('400 for non-UUID racket product ID', async () => {
    const res = await request(app).get('/api/stringing/options/not-a-uuid');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/stringing/validate', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const validBody = {
    racketVariantId: RACKET_VARIANT_ID,
    stringVariantId: STRING_VARIANT_ID,
    tension: 26,
    gripChoice: 'ORIGINAL',
  };

  it('200 valid: true on happy path', async () => {
    vi.mocked(validateStringingConfig).mockResolvedValue(MOCK_VALID_RESULT);

    const res = await request(app).post('/api/stringing/validate').send(validBody);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.valid).toBe(true);
    expect(res.body.data.priceBreakdown.totalAdditional).toBe(12);
  });

  it('200 valid: true when tension is exactly at effective max (boundary inclusive)', async () => {
    vi.mocked(validateStringingConfig).mockResolvedValue(MOCK_VALID_RESULT);

    const res = await request(app).post('/api/stringing/validate').send({ ...validBody, tension: 28 });
    expect(res.status).toBe(200);
    expect(res.body.data.valid).toBe(true);
  });

  it('422 MAX_TENSION_EXCEEDED when tension too high', async () => {
    vi.mocked(validateStringingConfig).mockResolvedValue({
      valid: false,
      rule: 'MAX_TENSION_EXCEEDED',
      message: 'Tension 32 lbs exceeds the safe maximum (28 lbs at weight 4U).',
      details: { racketMaxTension: 28, stringMaxTension: 30, effectiveMax: 28, requestedTension: 32, racketWeight: '4U', binding: 'RACKET' },
    });

    const res = await request(app).post('/api/stringing/validate').send({ ...validBody, tension: 32 });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('STRINGING_VALIDATION_FAILED');
    expect(res.body.error.details.rule).toBe('MAX_TENSION_EXCEEDED');
    expect(res.body.error.details.effectiveMax).toBe(28);
  });

  it('400 when tension is not a 0.5-step value (26.3)', async () => {
    const res = await request(app).post('/api/stringing/validate').send({ ...validBody, tension: 26.3 });
    expect(res.status).toBe(400);
  });

  it('400 when required fields are missing', async () => {
    const res = await request(app).post('/api/stringing/validate').send({ tension: 26 });
    expect(res.status).toBe(400);
  });

  it('404 when racket variant does not exist', async () => {
    vi.mocked(validateStringingConfig).mockRejectedValue(new NotFoundError('Racket variant not found'));

    const res = await request(app).post('/api/stringing/validate').send(validBody);
    expect(res.status).toBe(404);
  });

  it('400 SQL-injection-like string in IDs is safely handled (UUID validation)', async () => {
    const res = await request(app).post('/api/stringing/validate').send({
      ...validBody,
      racketVariantId: "'; DROP TABLE products; --",
    });
    expect(res.status).toBe(400);
  });
});
