import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';

export async function updateProfile(userId: string, data: { fullName?: string; phone?: string; avatar?: string }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, fullName: true, phone: true, avatar: true, role: true, updatedAt: true },
  });
  return user;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new BadRequestError('Current password is incorrect');

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  return { message: 'Password changed successfully' };
}

// ==================== ADDRESS ====================

type AddressInput = {
  fullName: string;
  phone: string;
  addressLine: string;
  wardCode?: string;
  wardName?: string;
  districtCode?: string;
  districtName?: string;
  provinceCode?: string;
  provinceName: string;
  country?: string;
  isDefault?: boolean;
};

export async function getAddresses(userId: string) {
  return prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
}

export async function createAddress(userId: string, data: AddressInput) {
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
  }

  return prisma.address.create({ data: { ...data, userId } });
}

export async function updateAddress(userId: string, addressId: string, data: Partial<AddressInput>) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new NotFoundError('Address not found');

  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
  }

  return prisma.address.update({ where: { id: addressId }, data });
}

export async function deleteAddress(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new NotFoundError('Address not found');

  await prisma.address.delete({ where: { id: addressId } });
  return { message: 'Address deleted successfully' };
}

// ==================== ADMIN ====================

export async function listUsers(opts: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}) {
  const page = opts.page ?? 1;
  const limit = Math.min(opts.limit ?? 20, 100);
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(opts.search && {
      OR: [
        { email: { contains: opts.search, mode: 'insensitive' as const } },
        { fullName: { contains: opts.search, mode: 'insensitive' as const } },
      ],
    }),
    ...(opts.role && { role: opts.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN' }),
    ...(opts.isActive !== undefined && { isActive: opts.isActive }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, fullName: true, phone: true, avatar: true,
        role: true, isActive: true, emailVerified: true, pointBalance: true,
        createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: {
      id: true, email: true, fullName: true, phone: true, avatar: true,
      role: true, isActive: true, emailVerified: true, pointBalance: true,
      createdAt: true, updatedAt: true,
      addresses: true,
    },
  });
  if (!user) throw new NotFoundError('User not found');
  return user;
}

export async function suspendUser(userId: string): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId, deletedAt: null }, select: { id: true } });
  if (!user) throw new NotFoundError('User not found');

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { isActive: false } }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);

  return { message: 'User suspended' };
}

export async function activateUser(userId: string): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId, deletedAt: null }, select: { id: true } });
  if (!user) throw new NotFoundError('User not found');

  await prisma.user.update({ where: { id: userId }, data: { isActive: true } });
  return { message: 'User activated' };
}

export async function changeUserRole(
  userId: string,
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN',
): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId, deletedAt: null }, select: { id: true } });
  if (!user) throw new NotFoundError('User not found');

  await prisma.user.update({ where: { id: userId }, data: { role } });
  return { message: `User role updated to ${role}` };
}
