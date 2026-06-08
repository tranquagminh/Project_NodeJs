import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';

export async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, level: 1 },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });
  return categories;
}

export async function getAllCategories() {
  return prisma.category.findMany({
    include: { parent: { select: { id: true, name: true } }, _count: { select: { products: true } } },
    orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
  });
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { children: true, parent: { select: { id: true, name: true } } },
  });
  if (!category) throw new NotFoundError('Category not found');
  return category;
}

export async function createCategory(data: {
  name: string; slug: string; description?: string; image?: string;
  parentId?: string | null; level?: number; isActive?: boolean; sortOrder?: number;
}) {
  const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
  if (existing) throw new ConflictError('Category slug already exists');

  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: {
  name?: string; slug?: string; description?: string | null; image?: string | null;
  parentId?: string | null; level?: number; isActive?: boolean; sortOrder?: number;
}) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new NotFoundError('Category not found');

  if (data.slug && data.slug !== category.slug) {
    const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictError('Category slug already exists');
  }

  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true, children: true } } } });
  if (!category) throw new NotFoundError('Category not found');

  if (category._count.products > 0) {
    throw new ConflictError('Cannot delete category with products');
  }
  if (category._count.children > 0) {
    throw new ConflictError('Cannot delete category with subcategories');
  }

  await prisma.category.delete({ where: { id } });
  return { message: 'Category deleted' };
}
