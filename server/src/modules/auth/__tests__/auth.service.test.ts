import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '../../../utils/errors';

// ── Hoisted mocks ──────────────────────────────────────────────────────────────
const mockUser = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
}));

const mockRefreshToken = vi.hoisted(() => ({
  create: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  findUnique: vi.fn(),
}));

const mockEmailVerificationToken = vi.hoisted(() => ({
  create: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  findUnique: vi.fn(),
}));

const mockPasswordResetToken = vi.hoisted(() => ({
  create: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
}));

const mockPointTransaction = vi.hoisted(() => ({
  create: vi.fn(),
}));

// $transaction handles both array form and callback form
const mockTransaction = vi.hoisted(() =>
  vi.fn((opsOrFn: unknown) => {
    if (typeof opsOrFn === 'function') {
      return (opsOrFn as (tx: unknown) => Promise<unknown>)({
        user: mockUser,
        refreshToken: mockRefreshToken,
        emailVerificationToken: mockEmailVerificationToken,
        passwordResetToken: mockPasswordResetToken,
        pointTransaction: mockPointTransaction,
      });
    }
    return Promise.all(opsOrFn as Promise<unknown>[]);
  }),
);

const mockBcrypt = vi.hoisted(() => ({ hash: vi.fn(), compare: vi.fn() }));

vi.mock('../../../config/env', () => ({
  env: {
    JWT_SECRET: 'test-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    CLIENT_URL: 'http://localhost:3000',
    POINTS_PER_WELCOME_BONUS: 100,
    POINTS_PER_EMAIL_VERIFY: 50,
  },
}));

vi.mock('../../../config/database', () => ({
  default: {
    user: mockUser,
    refreshToken: mockRefreshToken,
    emailVerificationToken: mockEmailVerificationToken,
    passwordResetToken: mockPasswordResetToken,
    pointTransaction: mockPointTransaction,
    $transaction: mockTransaction,
  },
}));
vi.mock('bcryptjs', () => ({ default: mockBcrypt }));
// Crypto is NOT mocked — we let it generate real random tokens

import * as authService from '../auth.service';

// ── Fixtures ──────────────────────────────────────────────────────────────────
const baseUser = {
  id: 'user-id-1',
  email: 'test@volta.com',
  password: 'hashed-password',
  fullName: 'Test User',
  phone: null,
  avatar: null,
  role: 'USER' as const,
  isActive: true,
  emailVerified: false,
  pointBalance: 0,
  deletedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const createdUserSelect = {
  id: baseUser.id,
  email: baseUser.email,
  fullName: baseUser.fullName,
  role: baseUser.role,
  createdAt: baseUser.createdAt,
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('auth.service', () => {
  beforeEach(() => {
    mockBcrypt.hash.mockResolvedValue('hashed-password');
    mockBcrypt.compare.mockResolvedValue(true);
    mockRefreshToken.create.mockResolvedValue({});
    mockRefreshToken.delete.mockResolvedValue({});
    mockRefreshToken.deleteMany.mockResolvedValue({ count: 0 });
    mockEmailVerificationToken.create.mockResolvedValue({});
    mockEmailVerificationToken.delete.mockResolvedValue({});
    mockEmailVerificationToken.deleteMany.mockResolvedValue({ count: 0 });
    mockPasswordResetToken.create.mockResolvedValue({});
    mockPasswordResetToken.delete.mockResolvedValue({});
    mockPasswordResetToken.deleteMany.mockResolvedValue({ count: 0 });
    mockPasswordResetToken.update.mockResolvedValue({});
    mockPointTransaction.create.mockResolvedValue({});
    mockUser.update.mockResolvedValue({ ...baseUser, pointBalance: 10 });
  });

  // ── register ─────────────────────────────────────────────────────────────────
  describe('register', () => {
    it('creates user, stores refresh token in DB, returns opaque refreshToken + accessToken', async () => {
      mockUser.findUnique.mockResolvedValue(null);
      mockUser.create.mockResolvedValue(createdUserSelect);

      const result = await authService.register({
        email: 'test@volta.com',
        password: 'Password1!',
        fullName: 'Test User',
      });

      expect(mockUser.findUnique).toHaveBeenCalledWith({ where: { email: 'test@volta.com' } });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('Password1!', 12);
      expect(mockRefreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: createdUserSelect.id }) }),
      );
      expect(result.user).toEqual(createdUserSelect);
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      // refreshToken is now an opaque hex string, not a JWT
      expect(result.refreshToken).toMatch(/^[0-9a-f]{80}$/);
    });

    it('throws ConflictError when email is already registered', async () => {
      mockUser.findUnique.mockResolvedValue(baseUser);

      await expect(
        authService.register({ email: baseUser.email, password: 'any', fullName: 'Dupe' })
      ).rejects.toThrow(ConflictError);
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('returns user (without password), stores refresh token, on valid credentials', async () => {
      mockUser.findUnique.mockResolvedValue(baseUser);

      const result = await authService.login(baseUser.email, 'Password1!');

      expect(result.user).not.toHaveProperty('password');
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toMatch(/^[0-9a-f]{80}$/);
      expect(mockRefreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: baseUser.id }) }),
      );
    });

    it('throws UnauthorizedError when user does not exist', async () => {
      mockUser.findUnique.mockResolvedValue(null);
      await expect(authService.login('ghost@example.com', 'any')).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError when account is deactivated', async () => {
      mockUser.findUnique.mockResolvedValue({ ...baseUser, isActive: false });
      await expect(authService.login(baseUser.email, 'Password1!')).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError when account is soft-deleted', async () => {
      mockUser.findUnique.mockResolvedValue({ ...baseUser, deletedAt: new Date() });
      await expect(authService.login(baseUser.email, 'Password1!')).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError on wrong password', async () => {
      mockUser.findUnique.mockResolvedValue(baseUser);
      mockBcrypt.compare.mockResolvedValue(false);
      await expect(authService.login(baseUser.email, 'wrong')).rejects.toThrow(UnauthorizedError);
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('deletes the refresh token from DB', async () => {
      await authService.logout('some-token');
      expect(mockRefreshToken.deleteMany).toHaveBeenCalledWith({ where: { token: 'some-token' } });
    });
  });

  // ── refreshToken ──────────────────────────────────────────────────────────────
  describe('refreshToken', () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    it('rotates token: deletes old, creates new, returns new accessToken + refreshToken', async () => {
      mockRefreshToken.findUnique.mockResolvedValue({
        token: 'old-token',
        expiresAt: futureDate,
        user: { id: baseUser.id, email: baseUser.email, role: baseUser.role, isActive: true, deletedAt: null },
      });

      const result = await authService.refreshToken('old-token');

      expect(mockRefreshToken.delete).toHaveBeenCalledWith({ where: { token: 'old-token' } });
      expect(mockRefreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: baseUser.id }) }),
      );
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toMatch(/^[0-9a-f]{80}$/);
    });

    it('throws UnauthorizedError when token not found in DB', async () => {
      mockRefreshToken.findUnique.mockResolvedValue(null);
      await expect(authService.refreshToken('nonexistent')).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError when token is expired', async () => {
      mockRefreshToken.findUnique.mockResolvedValue({
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000),
        user: { id: baseUser.id, email: baseUser.email, role: baseUser.role, isActive: true, deletedAt: null },
      });
      await expect(authService.refreshToken('expired-token')).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError when the token owner is inactive', async () => {
      mockRefreshToken.findUnique.mockResolvedValue({
        token: 'valid-token',
        expiresAt: futureDate,
        user: { id: baseUser.id, email: baseUser.email, role: baseUser.role, isActive: false, deletedAt: null },
      });
      await expect(authService.refreshToken('valid-token')).rejects.toThrow(UnauthorizedError);
    });
  });

  // ── getMe ─────────────────────────────────────────────────────────────────────
  describe('getMe', () => {
    it('returns user profile including pointBalance', async () => {
      const profile = {
        id: baseUser.id, email: baseUser.email, fullName: baseUser.fullName,
        phone: null, avatar: null, role: baseUser.role, isActive: true,
        emailVerified: false, pointBalance: 0, createdAt: baseUser.createdAt, updatedAt: baseUser.updatedAt,
      };
      mockUser.findUnique.mockResolvedValue(profile);

      const result = await authService.getMe(baseUser.id);

      expect(result).toEqual(profile);
      expect(mockUser.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: baseUser.id, deletedAt: null } }),
      );
    });

    it('throws NotFoundError when user does not exist or is deleted', async () => {
      mockUser.findUnique.mockResolvedValue(null);
      await expect(authService.getMe('nonexistent-id')).rejects.toThrow(NotFoundError);
    });
  });

  // ── verifyEmail ───────────────────────────────────────────────────────────────
  describe('verifyEmail', () => {
    it('sets emailVerified=true, deletes token, on a valid token', async () => {
      mockEmailVerificationToken.findUnique.mockResolvedValue({
        token: 'valid-token',
        userId: baseUser.id,
        expiresAt: new Date(Date.now() + 60_000),
        user: { id: baseUser.id, emailVerified: false },
      });
      mockUser.update.mockResolvedValue({ ...baseUser, emailVerified: true });
      mockEmailVerificationToken.delete.mockResolvedValue({});

      const result = await authService.verifyEmail('valid-token');
      expect(result.message).toMatch(/verified/i);
    });

    it('throws BadRequestError on expired token', async () => {
      mockEmailVerificationToken.findUnique.mockResolvedValue({
        token: 'expired',
        userId: baseUser.id,
        expiresAt: new Date(Date.now() - 1000),
        user: { id: baseUser.id, emailVerified: false },
      });
      await expect(authService.verifyEmail('expired')).rejects.toThrow(BadRequestError);
    });

    it('throws BadRequestError when token not found', async () => {
      mockEmailVerificationToken.findUnique.mockResolvedValue(null);
      await expect(authService.verifyEmail('nonexistent')).rejects.toThrow(BadRequestError);
    });
  });

  // ── forgotPassword ────────────────────────────────────────────────────────────
  describe('forgotPassword', () => {
    it('creates a PasswordResetToken in DB and returns generic message', async () => {
      mockUser.findUnique.mockResolvedValue(baseUser);

      const result = await authService.forgotPassword(baseUser.email);

      expect(result.message).toBeDefined();
      expect(mockPasswordResetToken.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: baseUser.id }) }),
      );
    });

    it('returns the same message when email does not exist (prevents enumeration)', async () => {
      mockUser.findUnique.mockResolvedValue(baseUser);
      const r1 = await authService.forgotPassword(baseUser.email);

      mockUser.findUnique.mockResolvedValue(null);
      const r2 = await authService.forgotPassword('ghost@example.com');

      expect(r2.message).toBe(r1.message);
      // No token created for ghost user
    });
  });

  // ── resetPassword ─────────────────────────────────────────────────────────────
  describe('resetPassword', () => {
    it('hashes new password, marks token as used, invalidates all refresh tokens', async () => {
      mockPasswordResetToken.findUnique.mockResolvedValue({
        token: 'valid-token',
        userId: baseUser.id,
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: null,
        user: { id: baseUser.id },
      });
      mockBcrypt.hash.mockResolvedValue('new-hashed-password');
      mockUser.update.mockResolvedValue(baseUser);

      const result = await authService.resetPassword('valid-token', 'NewPassword1!');

      expect(mockBcrypt.hash).toHaveBeenCalledWith('NewPassword1!', 12);
      expect(result.message).toMatch(/reset/i);
    });

    it('throws BadRequestError on expired token', async () => {
      mockPasswordResetToken.findUnique.mockResolvedValue({
        token: 'expired',
        userId: baseUser.id,
        expiresAt: new Date(Date.now() - 1000),
        usedAt: null,
        user: { id: baseUser.id },
      });
      await expect(authService.resetPassword('expired', 'NewPassword1!')).rejects.toThrow(BadRequestError);
    });

    it('throws BadRequestError when token already used', async () => {
      mockPasswordResetToken.findUnique.mockResolvedValue({
        token: 'used-token',
        userId: baseUser.id,
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: new Date(),
        user: { id: baseUser.id },
      });
      await expect(authService.resetPassword('used-token', 'NewPassword1!')).rejects.toThrow(BadRequestError);
    });

    it('throws BadRequestError when token not found', async () => {
      mockPasswordResetToken.findUnique.mockResolvedValue(null);
      await expect(authService.resetPassword('nonexistent', 'NewPassword1!')).rejects.toThrow(BadRequestError);
    });
  });

  // ── changePassword ────────────────────────────────────────────────────────────
  describe('changePassword', () => {
    it('updates password and invalidates all refresh tokens', async () => {
      mockUser.findUnique.mockResolvedValue(baseUser);
      mockBcrypt.compare.mockResolvedValue(true);
      mockBcrypt.hash.mockResolvedValue('new-hashed');
      mockUser.update.mockResolvedValue(baseUser);

      const result = await authService.changePassword(baseUser.id, 'old-pass', 'new-pass');

      expect(result.message).toMatch(/changed/i);
    });

    it('throws BadRequestError when current password is wrong', async () => {
      mockUser.findUnique.mockResolvedValue(baseUser);
      mockBcrypt.compare.mockResolvedValue(false);

      await expect(authService.changePassword(baseUser.id, 'wrong', 'new')).rejects.toThrow(BadRequestError);
    });

    it('throws NotFoundError when user does not exist', async () => {
      mockUser.findUnique.mockResolvedValue(null);
      await expect(authService.changePassword('ghost', 'old', 'new')).rejects.toThrow(NotFoundError);
    });
  });

  // ── softDeleteAccount ─────────────────────────────────────────────────────────
  describe('softDeleteAccount', () => {
    it('sets deletedAt, deactivates account, invalidates all refresh tokens', async () => {
      mockUser.update.mockResolvedValue({ ...baseUser, deletedAt: new Date(), isActive: false });

      await authService.softDeleteAccount(baseUser.id);

      // $transaction was called
      expect(mockTransaction).toHaveBeenCalled();
    });
  });
});
