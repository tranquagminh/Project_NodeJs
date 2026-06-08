import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';

const wishlistInclude = {
  product: {
    select: {
      id: true, name: true, slug: true, basePrice: true, salePrice: true, status: true,
      images: { where: { isMain: true }, take: 1 },
      spec: { select: { series: true, playStyle: true } },
    },
  },
};

export async function getWishlist(userId: string) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: wishlistInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function addToWishlist(userId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError('Product not found');

  return prisma.wishlist.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
    include: wishlistInclude,
  });
}

export async function removeFromWishlist(userId: string, productId: string) {
  const item = await prisma.wishlist.findUnique({ where: { userId_productId: { userId, productId } } });
  if (!item) throw new NotFoundError('Wishlist item not found');

  await prisma.wishlist.delete({ where: { userId_productId: { userId, productId } } });
  return { message: 'Removed from wishlist' };
}
