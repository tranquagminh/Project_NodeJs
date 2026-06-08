// Global test setup: set required env vars before any test module loads
process.env.JWT_SECRET = 'test-secret-key-for-vitest';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-vitest';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
