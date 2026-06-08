import prisma from '../../config/database';
import { NotFoundError, BusinessRuleError } from '../../utils/errors';
import {
  STRINGING_SERVICE_FEE,
  STRINGING_LEAD_TIME_ADDED_DAYS,
  GRIP_OPTIONS,
} from './stringing.constants';
import type { StringingConfig } from './stringing.validation';
import type {
  StringingOptionsResponse,
  CompatibleString,
  VariantOption,
  PriceBreakdown,
  ValidateResult,
} from './stringing.types';

// ── Category helpers ──────────────────────────────────────────────────────────

type CategoryWithParent = { slug: string; parent: { slug: string } | null };

function isRacketCategory(cat: CategoryWithParent): boolean {
  return cat.slug === 'rackets' || cat.parent?.slug === 'rackets';
}

function isStringCategory(cat: CategoryWithParent): boolean {
  return cat.slug === 'strings' || cat.parent?.slug === 'strings';
}

// ── Pure domain functions ─────────────────────────────────────────────────────

/**
 * Implements §2.3 — tension compatibility check.
 * Returns the effective max and which source is the binding constraint.
 * Throws BusinessRuleError if the weight has no configured max.
 */
export function calculateEffectiveMaxTension(
  racketMaxByWeight: Record<string, number>,
  racketWeight: string,
  stringMaxTension: number,
): { effective: number; binding: 'RACKET' | 'STRING' | 'EQUAL' } {
  const racketMax = racketMaxByWeight[racketWeight];
  if (racketMax === undefined) {
    throw new BusinessRuleError(
      `Maximum tension not configured for weight ${racketWeight}.`,
      'MAX_TENSION_NOT_CONFIGURED',
      { weight: racketWeight },
    );
  }
  const effective = Math.min(racketMax, stringMaxTension);
  const binding =
    racketMax < stringMaxTension ? 'RACKET' :
    racketMax > stringMaxTension ? 'STRING' :
    'EQUAL';
  return { effective, binding };
}

/**
 * Implements Rule 7 — default tension fallback.
 * Uses admin-set defaultByWeight first; falls back to maxByWeight[weight] - 2.
 */
export function calculateDefaultTension(
  defaultByWeight: Record<string, number> | null | undefined,
  maxByWeight: Record<string, number>,
  weight: string,
): number {
  if (defaultByWeight && defaultByWeight[weight] !== undefined) {
    return defaultByWeight[weight];
  }
  const max = maxByWeight[weight];
  if (max === undefined) {
    throw new BusinessRuleError(
      `Maximum tension not configured for weight ${weight}.`,
      'MAX_TENSION_NOT_CONFIGURED',
      { weight },
    );
  }
  return max - 2;
}

/**
 * Implements §2.7 — price impact of adding stringing.
 * Returns the additional cost added on top of the racket variant price.
 */
export function calculateStringingPriceImpact(stringPrice: number): {
  stringPrice: number;
  stringingFee: number;
  total: number;
} {
  return {
    stringPrice,
    stringingFee: STRINGING_SERVICE_FEE,
    total: stringPrice + STRINGING_SERVICE_FEE,
  };
}

// ── Service layer ─────────────────────────────────────────────────────────────

/**
 * Returns all data needed by the Product Detail page to render the stringing form.
 * Implements Rules 1, 6, 7; references §2.1–2.4.
 */
export async function getStringingOptions(racketProductId: string): Promise<StringingOptionsResponse> {
  const product = await prisma.product.findUnique({
    where: { id: racketProductId },
    include: {
      category: { include: { parent: { select: { slug: true } } } },
      brand: { select: { name: true } },
      spec: true,
      variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
    },
  });

  if (!product) throw new NotFoundError('Product not found');

  // Rule 1 — only rackets can be stringed (§2.1)
  if (!isRacketCategory(product.category as CategoryWithParent)) {
    throw new BusinessRuleError(
      'This product is not a racket and cannot be strung.',
      'NOT_A_RACKET',
      { productId: racketProductId, categorySlug: product.category.slug },
    );
  }

  if (!product.spec || !product.spec.maxTensionByWeight) {
    throw new BusinessRuleError(
      'Racket spec is incomplete: missing tension configuration.',
      'RACKET_SPEC_INCOMPLETE',
      { productId: racketProductId },
    );
  }

  const maxByWeight = product.spec.maxTensionByWeight as Record<string, number>;
  const defaultByWeight = product.spec.defaultTensionByWeight as Record<string, number> | null;

  // Build variant options — skip variants whose weight isn't in maxTensionByWeight
  const variantOptions: VariantOption[] = product.variants
    .filter((v) => {
      const attrs = v.attributes as Record<string, unknown> | null;
      const w = attrs?.weight as string | undefined;
      return w !== undefined && maxByWeight[w] !== undefined;
    })
    .map((v) => {
      const attrs = v.attributes as Record<string, unknown>;
      const weight = attrs.weight as string;
      const gripSize = (attrs.gripSize as string) ?? '';
      return {
        variantId: v.id,
        label: `${weight} ${gripSize}`.trim(),
        weight,
        gripSize,
        maxTension: maxByWeight[weight],
        defaultTension: calculateDefaultTension(defaultByWeight, maxByWeight, weight),
        stock: v.stock,
      };
    });

  // Rule 6 — recommended strings shown first (§2.4)
  const recommendedIds = new Set(product.spec.recommendedStringIds ?? []);

  // All ACTIVE string products (including out-of-stock variants for recommended ones)
  const stringProducts = await prisma.product.findMany({
    where: { category: { slug: 'strings' }, status: 'ACTIVE' },
    include: {
      brand: { select: { name: true } },
      spec: true,
      variants: {
        where: { isActive: true },
        orderBy: [{ stock: 'desc' }, { price: 'asc' }],
      },
    },
  });

  const compatibleStrings: CompatibleString[] = stringProducts
    .map((sp) => {
      // Rule 6 — recommended, out-of-stock strings still appear with stock: 0
      const isRecommended = recommendedIds.has(sp.id);
      const primaryVariant =
        sp.variants.find((v) => v.stock > 0) ??
        (isRecommended ? sp.variants[0] : undefined);
      if (!primaryVariant) return null;

      const vAttrs = primaryVariant.attributes as Record<string, unknown> | null;
      return {
        productId: sp.id,
        variantId: primaryVariant.id,
        name: sp.name,
        brand: sp.brand?.name ?? '',
        price: Number(primaryVariant.price),
        salePrice: primaryVariant.salePrice ? Number(primaryVariant.salePrice) : null,
        stock: primaryVariant.stock,
        specs: {
          gauge: vAttrs?.gauge ? Number(vAttrs.gauge) : null,
          maxTension: sp.spec?.stringMaxTension ?? 35,
          recommendedMin: sp.spec?.stringRecommendedMin ?? null,
          recommendedMax: sp.spec?.stringRecommendedMax ?? null,
          repulsion: sp.spec?.stringRepulsion ?? null,
          durability: sp.spec?.stringDurability ?? null,
          control: sp.spec?.stringControl ?? null,
        },
        isRecommended,
      } satisfies CompatibleString;
    })
    .filter((s): s is CompatibleString => s !== null);

  // Rule 6 — recommended first → stock DESC → name ASC
  compatibleStrings.sort((a, b) => {
    if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1;
    if (b.stock !== a.stock) return b.stock - a.stock;
    return a.name.localeCompare(b.name);
  });

  return {
    racket: { productId: product.id, name: product.name, variants: variantOptions },
    compatibleStrings,
    gripOptions: GRIP_OPTIONS,
    stringingFee: STRINGING_SERVICE_FEE,
    leadTimeAddedDays: STRINGING_LEAD_TIME_ADDED_DAYS,
    disclaimer: 'Stringing is free with every racket purchase. Adds 1 day to delivery.',
  };
}

/**
 * Validates a stringing configuration without persisting anything.
 * Called by the frontend before adding to cart (§2.2, §2.3, §2.7).
 * Returns a discriminated union — never throws on business rule violations.
 */
export async function validateStringingConfig(input: StringingConfig): Promise<ValidateResult> {
  // Fetch racket variant with full context
  const racketVariant = await prisma.productVariant.findUnique({
    where: { id: input.racketVariantId },
    include: {
      product: {
        include: {
          spec: true,
          category: { include: { parent: { select: { slug: true } } } },
        },
      },
    },
  });
  if (!racketVariant) throw new NotFoundError('Racket variant not found');

  // Rule 1 — only rackets
  if (!isRacketCategory(racketVariant.product.category as CategoryWithParent)) {
    return { valid: false, rule: 'NOT_A_RACKET', message: 'The selected product is not a racket.', details: {} };
  }

  if (!racketVariant.isActive) {
    return { valid: false, rule: 'RACKET_VARIANT_INACTIVE', message: 'This racket variant is no longer available.', details: {} };
  }

  // Fetch string variant
  const stringVariant = await prisma.productVariant.findUnique({
    where: { id: input.stringVariantId },
    include: {
      product: {
        include: {
          spec: true,
          category: { include: { parent: { select: { slug: true } } } },
        },
      },
    },
  });
  if (!stringVariant) throw new NotFoundError('String variant not found');

  // Rule 4 — string must be from strings category
  if (!isStringCategory(stringVariant.product.category as CategoryWithParent)) {
    return { valid: false, rule: 'NOT_A_STRING', message: 'The selected product is not a badminton string.', details: {} };
  }

  if (!stringVariant.isActive) {
    return { valid: false, rule: 'STRING_VARIANT_INACTIVE', message: 'This string variant is no longer available.', details: {} };
  }

  // Rule 3 — string stock check (§2.2, §16.6 partial)
  // TODO (Order module): if string runs out of stock between CONFIRMED and PROCESSING,
  //   need to either notify user to pick alternative or auto-refund. See §16.6.
  // TODO (Order module): stock is reserved by Cart module when item is added
  if (stringVariant.stock < 1) {
    return {
      valid: false,
      rule: 'STRING_OUT_OF_STOCK',
      message: 'This string is currently out of stock. Please choose another string.',
      details: { stock: 0 },
    };
  }

  // Rule 5 — weight resolution from variant attributes
  const racketAttrs = racketVariant.attributes as Record<string, unknown> | null;
  const racketWeight = racketAttrs?.weight as string | undefined;

  const spec = racketVariant.product.spec;
  if (!spec || !spec.maxTensionByWeight) {
    return {
      valid: false,
      rule: 'MAX_TENSION_NOT_CONFIGURED',
      message: 'Racket spec is incomplete: missing tension configuration.',
      details: {},
    };
  }

  const maxByWeight = spec.maxTensionByWeight as Record<string, number>;

  if (!racketWeight || maxByWeight[racketWeight] === undefined) {
    return {
      valid: false,
      rule: 'MAX_TENSION_NOT_CONFIGURED',
      message: `Maximum tension not configured for weight ${racketWeight ?? 'unknown'}.`,
      details: { weight: racketWeight },
    };
  }

  // Rule 2 — tension compatibility (§2.3)
  const stringSpec = stringVariant.product.spec;
  const stringMaxTension = stringSpec?.stringMaxTension ?? 35;

  const { effective: effectiveMax, binding } = calculateEffectiveMaxTension(maxByWeight, racketWeight, stringMaxTension);
  const racketMax = maxByWeight[racketWeight];

  // Rule 9 — tension floor (sanity)
  if (input.tension < 18) {
    return {
      valid: false,
      rule: 'TENSION_TOO_LOW',
      message: `Tension ${input.tension} lbs is below the minimum safe tension of 18 lbs.`,
      details: { requestedTension: input.tension, minimumTension: 18 },
    };
  }

  if (input.tension > effectiveMax) {
    return {
      valid: false,
      rule: 'MAX_TENSION_EXCEEDED',
      message: `Tension ${input.tension} lbs exceeds the safe maximum (${racketMax} lbs at weight ${racketWeight}). String supports up to ${stringMaxTension} lbs.`,
      details: {
        racketMaxTension: racketMax,
        stringMaxTension,
        effectiveMax,
        requestedTension: input.tension,
        racketWeight,
        binding,
      },
    };
  }

  // All rules passed — build response
  const { stringPrice, stringingFee, total: totalAdditional } = calculateStringingPriceImpact(
    Number(stringVariant.price),
  );

  const priceBreakdown: PriceBreakdown = {
    racketVariantPrice: Number(racketVariant.salePrice ?? racketVariant.price),
    stringVariantPrice: stringPrice,
    stringingFee,
    totalAdditional,
  };

  const gripSize = racketAttrs?.gripSize as string | undefined;
  const summary = `${racketVariant.product.name} (${racketWeight}${gripSize ? ` ${gripSize}` : ''}) strung with ${stringVariant.product.name} @ ${input.tension} lbs`;

  return { valid: true, config: input, priceBreakdown, summary };
}
