import crypto from 'crypto';

/**
 * Build sorted query string from params (no URL-encoding — VNPay hashes raw values).
 */
export function buildVnpayHashData(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
}

/**
 * HMAC-SHA512 signature over sorted params (excludes vnp_SecureHash / vnp_SecureHashType).
 */
export function signVnpayParams(params: Record<string, string>, secret: string): string {
  const hashData = buildVnpayHashData(params);
  return crypto.createHmac('sha512', secret).update(Buffer.from(hashData, 'utf-8')).digest('hex');
}

/**
 * Verify VNPay IPN/return signature. Timing-safe comparison.
 */
export function verifyVnpaySignature(params: Record<string, string>, secret: string): boolean {
  const { vnp_SecureHash, vnp_SecureHashType, ...rest } = params;
  if (!vnp_SecureHash) return false;
  const expected = signVnpayParams(rest as Record<string, string>, secret);
  const expectedBuf = Buffer.from(expected, 'hex');
  const receivedBuf = Buffer.from(vnp_SecureHash.toLowerCase(), 'hex');
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

/**
 * Format a Date as VNPay date string: YYYYMMDDHHmmss in UTC+7.
 */
export function formatVnpDate(date: Date): string {
  const vnMs = date.getTime() + 7 * 60 * 60 * 1000;
  const d = new Date(vnMs);
  return d.toISOString().replace(/\D/g, '').slice(0, 14);
}
