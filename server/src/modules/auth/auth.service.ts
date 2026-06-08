import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { env } from '../../config/env';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../../utils/errors';
import { PointTransactionType } from '@prisma/client';

// ── Token helpers ─────────────────────────────────────────────────────────────

function generateAccessToken(payload: { id: string; email: string; role: string }) {
  // env.JWT_EXPIRES_IN is a valid ms-compatible string; cast needed due to @types/jsonwebtoken branded StringValue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
}

function generateOpaqueToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

function refreshTokenTTLMs(): number {
  const val = env.JWT_REFRESH_EXPIRES_IN; // e.g. "7d"
  const match = val.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const n = Number(match[1]);
  const unit: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return n * (unit[match[2]] ?? 86_400_000);
}

// ── Loyalty point helpers ─────────────────────────────────────────────────────

async function awardPoints(
  userId: string,
  type: PointTransactionType,
  points: number,
  description: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { pointBalance: { increment: points } },
      select: { pointBalance: true },
    });
    await tx.pointTransaction.create({
      data: { userId, type, points, balance: user.pointBalance, description },
    });
  });
}

// ── Auth functions ────────────────────────────────────────────────────────────

export async function register(data: { email: string; password: string; fullName: string; phone?: string }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
      phone: data.phone,
    },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true },
  });

  // Welcome bonus — fire and forget (non-critical)
  awardPoints(user.id, 'WELCOME_BONUS', 10, 'Welcome to VOLTA!').catch(() => {});

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const opaqueToken = generateOpaqueToken();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: opaqueToken,
      expiresAt: new Date(Date.now() + refreshTokenTTLMs()),
    },
  });

  return { user, accessToken, refreshToken: opaqueToken };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.isActive || user.deletedAt) {
    throw new UnauthorizedError('Account is deactivated');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const opaqueToken = generateOpaqueToken();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: opaqueToken,
      expiresAt: new Date(Date.now() + refreshTokenTTLMs()),
    },
  });

  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken: opaqueToken };
}

export async function logout(token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function refreshToken(token: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, role: true, isActive: true, deletedAt: true } } },
  });

  if (!stored || stored.expiresAt < new Date() || !stored.user.isActive || stored.user.deletedAt) {
    // Delete the stale token
    if (stored) await prisma.refreshToken.delete({ where: { token } });
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Rotation — delete old, issue new
  await prisma.refreshToken.delete({ where: { token } });

  const newOpaqueToken = generateOpaqueToken();
  await prisma.refreshToken.create({
    data: {
      userId: stored.user.id,
      token: newOpaqueToken,
      expiresAt: new Date(Date.now() + refreshTokenTTLMs()),
    },
  });

  const accessToken = generateAccessToken({
    id: stored.user.id,
    email: stored.user.email,
    role: stored.user.role,
  });

  return { accessToken, refreshToken: newOpaqueToken };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatar: true,
      role: true,
      isActive: true,
      emailVerified: true,
      pointBalance: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}

// ── Email verification ────────────────────────────────────────────────────────

export async function sendVerificationEmail(userId: string): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, emailVerified: true } });
  if (!user) throw new NotFoundError('User not found');
  if (user.emailVerified) return { message: 'Email is already verified' };

  // Invalidate old tokens
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const token = generateOpaqueToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  });

  // TODO: send email — console.log for now
  console.log(`[EMAIL] Verify: ${env.CLIENT_URL}/verify-email?token=${token}`);

  return { message: 'Verification email sent' };
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, emailVerified: true } } },
  });

  if (!record || record.expiresAt < new Date()) {
    if (record) await prisma.emailVerificationToken.delete({ where: { token } });
    throw new BadRequestError('Invalid or expired verification token');
  }

  if (record.user.emailVerified) {
    await prisma.emailVerificationToken.delete({ where: { token } });
    return { message: 'Email already verified' };
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
    prisma.emailVerificationToken.delete({ where: { token } }),
  ]);

  // Email verify bonus
  awardPoints(record.userId, 'EMAIL_VERIFY_BONUS', 5, 'Email verification bonus').catch(() => {});

  return { message: 'Email verified successfully' };
}

// ── Password reset ────────────────────────────────────────────────────────────

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const RESPONSE = { message: 'If the email exists, a reset link has been sent' };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return RESPONSE;

  // Invalidate old tokens
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = generateOpaqueToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
    },
  });

  // TODO: send email
  console.log(`[EMAIL] Reset: ${env.CLIENT_URL}/reset-password?token=${token}`);

  return RESPONSE;
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: { select: { id: true } } },
  });

  if (!record || record.expiresAt < new Date() || record.usedAt) {
    if (record && !record.usedAt) await prisma.passwordResetToken.delete({ where: { token } });
    throw new BadRequestError('Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { password: hashedPassword } }),
    prisma.passwordResetToken.update({ where: { token }, data: { usedAt: new Date() } }),
    // Invalidate all refresh tokens on password change
    prisma.refreshToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return { message: 'Password reset successfully' };
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function updateProfile(
  userId: string,
  data: { fullName?: string; phone?: string; avatar?: string },
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, fullName: true, phone: true, avatar: true, updatedAt: true },
  });
  return user;
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
  if (!user) throw new NotFoundError('User not found');

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new BadRequestError('Current password is incorrect');

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { password: hashed } }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);

  return { message: 'Password changed successfully' };
}

export async function softDeleteAccount(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date(), isActive: false } }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);
}
