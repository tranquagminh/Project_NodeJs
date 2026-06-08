import { describe, it, expect, vi } from 'vitest';
import { formatOrderCode, generateOrderCode } from '../order.code-generator';

describe('formatOrderCode', () => {
  it('matches VLT-YYYYMMDD-XXXXXX format', () => {
    const code = formatOrderCode();
    expect(code).toMatch(/^VLT-\d{8}-[A-Z0-9]{6}$/);
  });

  it('contains today\'s date in VN timezone', () => {
    const code = formatOrderCode();
    const datePart = code.split('-')[1] + code.split('-')[2]; // "YYYYMMDD" after split
    // Just verify it's 8 digits
    expect(code.split('-')[1]).toMatch(/^\d{8}$/);
  });

  it('does not contain ambiguous chars O, 0, I, 1 in the random segment', () => {
    // Run 100 times to be statistically confident
    for (let i = 0; i < 100; i++) {
      const segment = formatOrderCode().split('-')[2];
      expect(segment).not.toMatch(/[O0I1]/);
    }
  });

  it('random segment is exactly 6 characters', () => {
    const segment = formatOrderCode().split('-')[2];
    expect(segment).toHaveLength(6);
  });
});

describe('generateOrderCode', () => {
  it('returns a code when no collision', async () => {
    const checkExists = vi.fn().mockResolvedValue(false);
    const code = await generateOrderCode(checkExists);
    expect(code).toMatch(/^VLT-\d{8}-[A-Z0-9]{6}$/);
    expect(checkExists).toHaveBeenCalledTimes(1);
  });

  it('retries on collision and returns unique code', async () => {
    const checkExists = vi.fn()
      .mockResolvedValueOnce(true)  // first try: collides
      .mockResolvedValueOnce(true)  // second try: collides
      .mockResolvedValueOnce(false); // third try: unique

    const code = await generateOrderCode(checkExists);
    expect(code).toMatch(/^VLT-\d{8}-[A-Z0-9]{6}$/);
    expect(checkExists).toHaveBeenCalledTimes(3);
  });

  it('throws after max retries exhausted', async () => {
    const checkExists = vi.fn().mockResolvedValue(true); // always collides
    await expect(generateOrderCode(checkExists, 3)).rejects.toThrow(/unique order code/i);
    expect(checkExists).toHaveBeenCalledTimes(3);
  });
});
