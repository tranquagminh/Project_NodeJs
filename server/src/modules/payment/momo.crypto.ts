import crypto from 'crypto';

// Field order per MoMo v2 API spec (alphabetical, predefined)
const CREATE_FIELDS = [
  'accessKey', 'amount', 'extraData', 'ipnUrl', 'orderId',
  'orderInfo', 'partnerCode', 'redirectUrl', 'requestId', 'requestType',
] as const;

const REFUND_FIELDS = [
  'accessKey', 'amount', 'description', 'orderId',
  'partnerCode', 'requestId', 'transId',
] as const;

const IPN_FIELDS = [
  'accessKey', 'amount', 'extraData', 'message', 'orderId',
  'orderInfo', 'orderType', 'partnerCode', 'payType', 'requestId',
  'responseCode', 'transId',
] as const;

function hmacSha256(secret: string, data: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function buildRaw(data: Record<string, string | number>, fields: readonly string[]): string {
  return fields.map(f => `${f}=${data[f] ?? ''}`).join('&');
}

export function signMomoCreate(data: Record<string, string | number>, secret: string): string {
  return hmacSha256(secret, buildRaw(data, CREATE_FIELDS));
}

export function signMomoRefund(data: Record<string, string | number>, secret: string): string {
  return hmacSha256(secret, buildRaw(data, REFUND_FIELDS));
}

/**
 * Verify MoMo IPN signature. Timing-safe comparison.
 */
export function verifyMomoSignature(data: Record<string, string | number>, secret: string): boolean {
  const received = String(data['signature'] ?? '');
  if (!received) return false;
  const { signature: _sig, ...rest } = data;
  const expected = hmacSha256(secret, buildRaw(rest, IPN_FIELDS));
  const buf1 = Buffer.from(expected, 'hex');
  const buf2 = Buffer.from(received, 'hex');
  if (buf1.length !== buf2.length) return false;
  return crypto.timingSafeEqual(buf1, buf2);
}
