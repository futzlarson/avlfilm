import { describe, expect, it, vi } from 'vitest';

vi.mock('@db', () => ({ db: {} }));
vi.mock('@lib/redis', () => ({ redis: {}, withRedis: vi.fn() }));
const { isBannerActive } = await import('@lib/banner-cache');

const base = { html: 'Hi', enabled: true, startDate: '', endDate: '' };
// 2026-11-08 10:00 ET
const sunday = new Date('2026-11-08T15:00:00Z');

describe('isBannerActive', () => {
  it('hides a disabled banner even inside its dates', () => {
    expect(isBannerActive({ ...base, enabled: false, startDate: '2026-11-01' }, sunday)).toBe(false);
  });

  it('shows an enabled banner with no dates', () => {
    expect(isBannerActive(base, sunday)).toBe(true);
  });

  it('includes both the start and end day', () => {
    expect(isBannerActive({ ...base, startDate: '2026-11-08', endDate: '2026-11-08' }, sunday)).toBe(true);
  });

  it('hides before the start and after the end', () => {
    expect(isBannerActive({ ...base, startDate: '2026-11-09' }, sunday)).toBe(false);
    expect(isBannerActive({ ...base, endDate: '2026-11-07' }, sunday)).toBe(false);
  });

  it('uses the Eastern date, not UTC', () => {
    // 11:30pm ET on Nov 7 is already Nov 8 in UTC
    expect(isBannerActive({ ...base, endDate: '2026-11-07' }, new Date('2026-11-08T04:30:00Z'))).toBe(true);
  });
});
