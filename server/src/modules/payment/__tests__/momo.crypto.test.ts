import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { signMomoCreate, signMomoRefund, verifyMomoSignature } from '../momo.crypto';

// Public MoMo sandbox credentials (from developers.momo.vn)
const ACCESS_KEY = 'F8BBA842ECF85';
const SECRET_KEY = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';

const hmac256 = (secret: string, data: string) =>
  crypto.createHmac('sha256', secret).update(data).digest('hex');

describe('signMomoCreate', () => {
  it('produces a 64-char hex string (SHA-256)', () => {
    const data = {
      accessKey: ACCESS_KEY,
      amount: 50000,
      extraData: '',
      ipnUrl: 'https://example.com/webhook',
      orderId: 'VLT-20240101-ABC123',
      orderInfo: 'Thanh toan don hang VLT-20240101-ABC123',
      partnerCode: 'MOMO',
      redirectUrl: 'https://example.com/return',
      requestId: 'req-001',
      requestType: 'payWithMethod',
    };
    const sig = signMomoCreate(data, SECRET_KEY);
    expect(sig).toHaveLength(64);
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
  });

  it('matches manual HMAC-SHA256 with correct field order', () => {
    const data = {
      accessKey: ACCESS_KEY,
      amount: 50000,
      extraData: '',
      ipnUrl: 'https://example.com/ipn',
      orderId: 'ORDER-001',
      orderInfo: 'Test payment',
      partnerCode: 'MOMO',
      redirectUrl: 'https://example.com/return',
      requestId: 'REQUEST-001',
      requestType: 'payWithMethod',
    };
    const rawSignature = [
      `accessKey=${ACCESS_KEY}`,
      `amount=50000`,
      `extraData=`,
      `ipnUrl=https://example.com/ipn`,
      `orderId=ORDER-001`,
      `orderInfo=Test payment`,
      `partnerCode=MOMO`,
      `redirectUrl=https://example.com/return`,
      `requestId=REQUEST-001`,
      `requestType=payWithMethod`,
    ].join('&');
    expect(signMomoCreate(data, SECRET_KEY)).toBe(hmac256(SECRET_KEY, rawSignature));
  });

  it('is deterministic', () => {
    const data = { accessKey: ACCESS_KEY, amount: 100000, extraData: '', ipnUrl: 'u', orderId: 'O', orderInfo: 'I', partnerCode: 'MOMO', redirectUrl: 'r', requestId: 'R', requestType: 'payWithMethod' };
    expect(signMomoCreate(data, SECRET_KEY)).toBe(signMomoCreate(data, SECRET_KEY));
  });

  it('changes when amount changes', () => {
    const base = { accessKey: ACCESS_KEY, amount: 100000, extraData: '', ipnUrl: 'u', orderId: 'O', orderInfo: 'I', partnerCode: 'MOMO', redirectUrl: 'r', requestId: 'R', requestType: 'payWithMethod' };
    expect(signMomoCreate(base, SECRET_KEY)).not.toBe(signMomoCreate({ ...base, amount: 200000 }, SECRET_KEY));
  });
});

describe('signMomoRefund', () => {
  it('matches manual HMAC-SHA256 with refund field order', () => {
    const data = {
      accessKey: ACCESS_KEY,
      amount: 50000,
      description: 'Refund test',
      orderId: 'ORDER-001',
      partnerCode: 'MOMO',
      requestId: 'REFUND-001',
      transId: 'TRANS-001',
    };
    const rawSignature = [
      `accessKey=${ACCESS_KEY}`,
      `amount=50000`,
      `description=Refund test`,
      `orderId=ORDER-001`,
      `partnerCode=MOMO`,
      `requestId=REFUND-001`,
      `transId=TRANS-001`,
    ].join('&');
    expect(signMomoRefund(data, SECRET_KEY)).toBe(hmac256(SECRET_KEY, rawSignature));
  });
});

describe('verifyMomoSignature', () => {
  const buildIpnData = (overrides: Record<string, string | number> = {}) => ({
    accessKey: ACCESS_KEY,
    amount: 50000,
    extraData: '',
    message: 'Successful.',
    orderId: 'ORDER-001',
    orderInfo: 'Test',
    orderType: 'momo_wallet',
    partnerCode: 'MOMO',
    payType: 'qr',
    requestId: 'REQUEST-001',
    responseCode: 0,
    transId: 'TX-001',
    ...overrides,
  });

  function addSig(data: Record<string, string | number>): Record<string, string | number> {
    const IPN_FIELDS = ['accessKey', 'amount', 'extraData', 'message', 'orderId', 'orderInfo', 'orderType', 'partnerCode', 'payType', 'requestId', 'responseCode', 'transId'];
    const raw = IPN_FIELDS.map(f => `${f}=${data[f] ?? ''}`).join('&');
    return { ...data, signature: hmac256(SECRET_KEY, raw) };
  }

  it('returns true for valid IPN signature', () => {
    const data = addSig(buildIpnData());
    expect(verifyMomoSignature(data, SECRET_KEY)).toBe(true);
  });

  it('returns false for tampered amount', () => {
    const data = addSig(buildIpnData());
    expect(verifyMomoSignature({ ...data, amount: 99999 }, SECRET_KEY)).toBe(false);
  });

  it('returns false for wrong secret', () => {
    const data = addSig(buildIpnData());
    expect(verifyMomoSignature(data, 'wrong_secret')).toBe(false);
  });

  it('returns false when signature missing', () => {
    expect(verifyMomoSignature(buildIpnData(), SECRET_KEY)).toBe(false);
  });
});
