import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import * as wishlistTriggers from '../wishlist/wishlist-triggers.service';

// ==================== Public Queries ====================

interface ProductFilters {
  page?: number;
  limit?: number;
  sort?: string;
  categoryId?: string;
  brandId?: string;
  skillLevel?: string;
  playStyle?: string;
  series?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
}

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: 'asc' as const }, take: 3 },
  spec: { select: { flex: true, skillLevel: true, playStyle: true, series: true } },
};

const productDetailInclude = {
  category: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: 'asc' as const } },
  spec: true,
  variants: { orderBy: { price: 'asc' as const } },
};

export async function getProducts(filters: ProductFilters) {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 12;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = { status: 'ACTIVE' };

  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.brandId) where.brandId = filters.brandId;
  if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
  if (filters.isNewArrival !== undefined) where.isNewArrival = filters.isNewArrival;

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.basePrice = {};
    if (filters.minPrice !== undefined) where.basePrice.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.basePrice.lte = filters.maxPrice;
  }

  if (filters.skillLevel || filters.playStyle || filters.series) {
    where.spec = {};
    if (filters.skillLevel) (where.spec as Prisma.ProductSpecWhereInput).skillLevel = filters.skillLevel as any;
    if (filters.playStyle) (where.spec as Prisma.ProductSpecWhereInput).playStyle = filters.playStyle as any;
    if (filters.series) (where.spec as Prisma.ProductSpecWhereInput).series = filters.series;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  switch (filters.sort) {
    case 'price-asc': orderBy = { basePrice: 'asc' }; break;
    case 'price-desc': orderBy = { basePrice: 'desc' }; break;
    case 'rating': orderBy = { avgRating: 'desc' }; break;
    case 'popular': orderBy = { totalSold: 'desc' }; break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, include: productInclude, orderBy, skip, take: limit }),
    prisma.product.count({ where }),
  ]);

  return { products, meta: { page, limit, total } };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productDetailInclude,
  });
  if (!product) throw new NotFoundError('Product not found');
  return product;
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { status: 'ACTIVE', isFeatured: true },
    include: productInclude,
    take: 8,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getNewArrivals() {
  return prisma.product.findMany({
    where: { status: 'ACTIVE', isNewArrival: true },
    include: productInclude,
    take: 8,
    orderBy: { createdAt: 'desc' },
  });
}

export async function searchProducts(query: string, page = 1, limit = 12) {
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { shortDescription: { contains: query, mode: 'insensitive' } },
      { spec: { series: { contains: query, mode: 'insensitive' } } },
    ],
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, include: productInclude, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where }),
  ]);

  return { products, meta: { page, limit, total } };
}

// ==================== Admin CRUD ====================

export async function getAllProducts(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      include: { ...productInclude, _count: { select: { variants: true, reviews: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count(),
  ]);
  return { products, meta: { page, limit, total } };
}

export async function createProduct(data: {
  name: string; slug: string; description?: string; shortDescription?: string;
  categoryId: string; brandId: string; basePrice: number; salePrice?: number | null;
  sku: string; status?: string; isFeatured?: boolean; isNewArrival?: boolean;
  metaTitle?: string; metaDescription?: string;
}) {
  const existing = await prisma.product.findFirst({ where: { OR: [{ slug: data.slug }, { sku: data.sku }] } });
  if (existing) throw new ConflictError('Product slug or SKU already exists');

  return prisma.product.create({ data: data as any, include: productDetailInclude });
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new NotFoundError('Product not found');

  if (data.slug && data.slug !== product.slug) {
    const existing = await prisma.product.findUnique({ where: { slug: data.slug as string } });
    if (existing) throw new ConflictError('Product slug already exists');
  }
  if (data.sku && data.sku !== product.sku) {
    const existing = await prisma.product.findUnique({ where: { sku: data.sku as string } });
    if (existing) throw new ConflictError('Product SKU already exists');
  }

  // Compute effective prices before update for price-drop detection
  const now = new Date();
  const oldSaleActive =
    product.salePrice !== null &&
    (product.saleStartDate === null || now >= product.saleStartDate) &&
    (product.saleEndDate === null || now <= product.saleEndDate);
  const oldEffectivePrice = Number(oldSaleActive ? product.salePrice : product.basePrice);

  const updated = await prisma.product.update({ where: { id }, data: data as any, include: productDetailInclude });

  // Compute new effective price — re-fetch scalar fields not present in productDetailInclude
  const updatedScalars = await prisma.product.findUnique({
    where: { id },
    select: { basePrice: true, salePrice: true, saleStartDate: true, saleEndDate: true },
  });
  const newSalePrice = updatedScalars?.salePrice ?? null;
  const newSaleActive =
    newSalePrice !== null &&
    (updatedScalars?.saleStartDate == null || now >= updatedScalars.saleStartDate) &&
    (updatedScalars?.saleEndDate == null || now <= updatedScalars.saleEndDate);
  const newEffectivePrice = Number(newSaleActive ? newSalePrice : (updatedScalars?.basePrice ?? 0));

  // Best-effort price-drop trigger
  wishlistTriggers.checkPriceDrop(id, oldEffectivePrice, newEffectivePrice).catch((err) => {
    console.error('[product] checkPriceDrop trigger failed:', err);
  });

  return updated;
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new NotFoundError('Product not found');

  await prisma.product.delete({ where: { id } });
  return { message: 'Product deleted' };
}

// ==================== Spec ====================

export async function upsertSpec(productId: string, data: Record<string, unknown>) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError('Product not found');

  return prisma.productSpec.upsert({
    where: { productId },
    create: { productId, ...data } as any,
    update: data as any,
  });
}

// ==================== Variants ====================

export async function createVariant(productId: string, data: {
  name: string; sku: string; price: number; salePrice?: number | null; stock?: number; attributes?: Record<string, unknown>;
}) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError('Product not found');

  const existing = await prisma.productVariant.findUnique({ where: { sku: data.sku } });
  if (existing) throw new ConflictError('Variant SKU already exists');

  return prisma.productVariant.create({ data: { ...data, productId } as any });
}

export async function updateVariant(productId: string, variantId: string, data: Record<string, unknown>) {
  const variant = await prisma.productVariant.findFirst({ where: { id: variantId, productId } });
  if (!variant) throw new NotFoundError('Variant not found');

  const oldStock = variant.stock;

  const updated = await prisma.productVariant.update({ where: { id: variantId }, data: data as any });

  const newStock = updated.stock;

  // Best-effort stock-change triggers
  if (oldStock !== newStock) {
    wishlistTriggers.checkBackInStock(productId, oldStock, newStock).catch((err) => {
      console.error('[product] checkBackInStock trigger failed:', err);
    });
    wishlistTriggers.checkLowStock(productId, oldStock, newStock).catch((err) => {
      console.error('[product] checkLowStock trigger failed:', err);
    });
  }

  return updated;
}

export async function deleteVariant(productId: string, variantId: string) {
  const variant = await prisma.productVariant.findFirst({ where: { id: variantId, productId } });
  if (!variant) throw new NotFoundError('Variant not found');

  await prisma.productVariant.delete({ where: { id: variantId } });
  return { message: 'Variant deleted' };
}

// ==================== Images ====================

export async function addImage(productId: string, data: { url: string; alt?: string; sortOrder?: number; isMain?: boolean }) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError('Product not found');

  if (data.isMain) {
    await prisma.productImage.updateMany({ where: { productId, isMain: true }, data: { isMain: false } });
  }

  return prisma.productImage.create({ data: { ...data, productId } });
}

export async function deleteImage(productId: string, imageId: string) {
  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId } });
  if (!image) throw new NotFoundError('Image not found');

  await prisma.productImage.delete({ where: { id: imageId } });
  return { message: 'Image deleted' };
}
