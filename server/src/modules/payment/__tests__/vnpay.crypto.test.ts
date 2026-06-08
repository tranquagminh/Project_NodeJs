import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  buildVnpayHashData,
  signVnpayParams,
  verifyVnpaySignature,
  formatVnpDate,
} from '../vnpay.crypto';

const SECRET = 'test_secret_key_volta';

describe('buildVnpayHashData', () => {
  it('sorts keys alphabetically', () => {
    const result = buildVnpayHashData({ vnp_Z: 'last', vnp_A: 'first', vnp_M: 'middle' });
    expect(result).toBe('vnp_A=first&vnp_M=middle&vnp_Z=last');
  });

  it('handles single key', () => {
    expect(buildVnpayHashData({ vnp_Amount: '100000' })).toBe('vnp_Amount=100000');
  });
});

describe('signVnpayParams', () => {
  it('produces a 128-char hex string (SHA-512)', () => {
    const sig = signVnpayParams({ vnp_Amount: '100000', vnp_Command: 'pay' }, SECRET);
    expect(sig).toHaveLength(128);
    expect(sig).toMatch(/^[0-9a-f]{128}$/);
  });

  it('is deterministic', () => {
    const params = { vnp_TxnRef: 'VLT-20240101-ABC123', vnp_Amount: '5000000' };
    expect(signVnpayParams(params, SECRET)).toBe(signVnpayParams(params, SECRET));
  });

  it('produces different output for different secrets', () => {
    const params = { vnp_Amount: '100000' };
    expect(signVnpayParams(params, 'secret1')).not.toBe(signVnpayParams(params, 'secret2'));
  });

  it('produces different output when params change', () => {
    const p1 = { vnp_Amount: '100000' };
    const p2 = { vnp_Amount: '200000' };
    expect(signVnpayParams(p1, SECRET)).not.toBe(signVnpayParams(p2, SECRET));
  });

  it('matches manual HMAC-SHA512', () => {
    const params = { vnp_Amount: '100000', vnp_Command: 'pay', vnp_TxnRef: 'VLT-20240101-ABC' };
    const hashData = 'vnp_Amount=100000&vnp_Command=pay&vnp_TxnRef=VLT-20240101-ABC';
    const expected = crypto.createHmac('sha512', SECRET).update(Buffer.from(hashData, 'utf-8')).digest('hex');
    expect(signVnpayParams(params, SECRET)).toBe(expected);
  });
});

describe('verifyVnpaySignature', () => {
  it('returns true for valid signature', () => {
    const params = { vnp_Amount: '100000', vnp_Command: 'pay', vnp_TxnRef: 'VLT-ABC' };
    const sig = signVnpayParams(params, SECRET);
    expect(verifyVnpaySignature({ ...params, vnp_SecureHash: sig }, SECRET)).toBe(true);
  });

  it('returns true and ignores vnp_SecureHashType', () => {
    const params = { vnp_Amount: '100000', vnp_TxnRef: 'VLT-ABC' };
    const sig = signVnpayParams(params, SECRET);
    expect(verifyVnpaySignature({ ...params, vnp_SecureHashType: 'SHA512', vnp_SecureHash: sig }, SECRET)).toBe(true);
  });

  it('returns false for tampered amount', () => {
    const params = { vnp_Amount: '100000', vnp_TxnRef: 'VLT-ABC' };
    const sig = signVnpayParams(params, SECRET);
    expect(verifyVnpaySignature({ ...params, vnp_Amount: '999999', vnp_SecureHash: sig }, SECRET)).toBe(false);
  });

  it('returns false for wrong secret', () => {
    const params = { vnp_Amount: '100000', vnp_TxnRef: 'VLT-ABC' };
    const sig = signVnpayParams(params, SECRET);
    expect(verifyVnpaySignature({ ...params, vnp_SecureHash: sig }, 'wrong_secret')).toBe(false);
  });

  it('returns false when vnp_SecureHash missing', () => {
    const params = { vnp_Amount: '100000' };
    expect(verifyVnpaySignature(params, SECRET)).toBe(false);
  });

  it('case-insensitive hash comparison', () => {
    const params = { vnp_Amount: '100000' };
    const sig = signVnpayParams(params, SECRET);
    expect(verifyVnpaySignature({ ...params, vnp_SecureHash: sig.toUpperCase() }, SECRET)).toBe(true);
  });
});

describe('formatVnpDate', () => {
  it('returns 14-digit string', () => {
    const result = formatVnpDate(new Date('2024-01-15T10:30:00.000Z'));
    expect(result).toHaveLength(14);
    expect(result).toMatch(/^\d{14}$/);
  });

  it('applies UTC+7 offset', () => {
    // 2024-01-15T17:30:00.000Z = 2024-01-16 00:30:00 VN time
    const result = formatVnpDate(new Date('2024-01-15T17:30:00.000Z'));
    expect(result).toBe('20240116003000');
  });

  it('midnight UTC = 07:00 VN time', () => {
    const result = formatVnpDate(new Date('2024-01-15T00:00:00.000Z'));
    expect(result).toBe('20240115070000');
  });
});
