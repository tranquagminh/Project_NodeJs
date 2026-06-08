// Unambiguous charset: no O, 0, I, 1
const CHARSET = 'BCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSegment(length: number): string {
  return Array.from({ length }, () => CHARSET[Math.floor(Math.random() * CHARSET.length)]).join('');
}

function todayVN(): string {
  // VN timezone = UTC+7
  const now = new Date();
  const vnMs = now.getTime() + 7 * 60 * 60 * 1000;
  const vnDate = new Date(vnMs);
  return vnDate.toISOString().slice(0, 10).replace(/-/g, '');
}

export function formatOrderCode(): string {
  return `VLT-${todayVN()}-${randomSegment(6)}`;
}

export async function generateOrderCode(
  checkExists: (code: string) => Promise<boolean>,
  maxRetries = 5,
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const code = formatOrderCode();
    if (!(await checkExists(code))) return code;
  }
  throw new Error('Failed to generate a unique order code after maximum retries');
}
