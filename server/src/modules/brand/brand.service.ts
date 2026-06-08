import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';

export async function getBrands() {
  return prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
}

export async function getAllBrands() {
  return prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
}

export async function getBrandById(id: string) {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) throw new NotFoundError('Brand not found');
  return brand;
}

export async function createBrand(data: { name: string; slug: string; logo?: string; description?: string; isActive?: boolean }) {
  const existing = await prisma.brand.findUnique({ where: { slug: data.slug } });
  if (existing) throw new ConflictError('Brand slug already exists');
  return prisma.brand.create({ data });
}

export async function updateBrand(id: string, data: { name?: string; slug?: string; logo?: string | null; description?: string | null; isActive?: boolean }) {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) throw new NotFoundError('Brand not found');

  if (data.slug && data.slug !== brand.slug) {
    const existing = await prisma.brand.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictError('Brand slug already exists');
  }

  return prisma.brand.update({ where: { id }, data });
}

export async function deleteBrand(id: string) {
  const brand = await prisma.brand.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
  if (!brand) throw new NotFoundError('Brand not found');
  if (brand._count.products > 0) throw new ConflictError('Cannot delete brand with products');

  await prisma.brand.delete({ where: { id } });
  return { message: 'Brand deleted' };
}
