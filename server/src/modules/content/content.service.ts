import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';

// ==================== BANNER ====================

export async function getBanners(position?: string) {
  const where: Record<string, unknown> = { isActive: true };
  if (position) where.position = position;

  const now = new Date();
  return prisma.banner.findMany({
    where: {
      ...where,
      OR: [{ startDate: null }, { startDate: { lte: now } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
    },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getAllBanners() {
  return prisma.banner.findMany({ orderBy: [{ position: 'asc' }, { sortOrder: 'asc' }] });
}

export async function createBanner(data: Record<string, unknown>) {
  return prisma.banner.create({ data: data as any });
}

export async function updateBanner(id: string, data: Record<string, unknown>) {
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) throw new NotFoundError('Banner not found');
  return prisma.banner.update({ where: { id }, data: data as any });
}

export async function deleteBanner(id: string) {
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) throw new NotFoundError('Banner not found');
  await prisma.banner.delete({ where: { id } });
  return { message: 'Banner deleted' };
}

// ==================== ATHLETE ====================

export async function getAthletes() {
  return prisma.athlete.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
}

export async function getAllAthletes() {
  return prisma.athlete.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function createAthlete(data: Record<string, unknown>) {
  return prisma.athlete.create({ data: data as any });
}

export async function updateAthlete(id: string, data: Record<string, unknown>) {
  const athlete = await prisma.athlete.findUnique({ where: { id } });
  if (!athlete) throw new NotFoundError('Athlete not found');
  return prisma.athlete.update({ where: { id }, data: data as any });
}

export async function deleteAthlete(id: string) {
  const athlete = await prisma.athlete.findUnique({ where: { id } });
  if (!athlete) throw new NotFoundError('Athlete not found');
  await prisma.athlete.delete({ where: { id } });
  return { message: 'Athlete deleted' };
}

// ==================== TECHNOLOGY ====================

export async function getTechnologies() {
  return prisma.technology.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
}

export async function getAllTechnologies() {
  return prisma.technology.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function createTechnology(data: Record<string, unknown>) {
  if (data.slug) {
    const existing = await prisma.technology.findUnique({ where: { slug: data.slug as string } });
    if (existing) throw new ConflictError('Technology slug already exists');
  }
  return prisma.technology.create({ data: data as any });
}

export async function updateTechnology(id: string, data: Record<string, unknown>) {
  const tech = await prisma.technology.findUnique({ where: { id } });
  if (!tech) throw new NotFoundError('Technology not found');
  if (data.slug && data.slug !== tech.slug) {
    const existing = await prisma.technology.findUnique({ where: { slug: data.slug as string } });
    if (existing) throw new ConflictError('Technology slug already exists');
  }
  return prisma.technology.update({ where: { id }, data: data as any });
}

export async function deleteTechnology(id: string) {
  const tech = await prisma.technology.findUnique({ where: { id } });
  if (!tech) throw new NotFoundError('Technology not found');
  await prisma.technology.delete({ where: { id } });
  return { message: 'Technology deleted' };
}
