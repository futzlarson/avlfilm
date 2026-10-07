import { isBotSubmission } from '@lib/honeypot';
import { describe, expect, it } from 'vitest';

describe('isBotSubmission', () => {
  it('flags any filled-in value', () => {
    expect(isBotSubmission('555-1234')).toBe(true);
  });

  it('lets empty, blank, or missing values through', () => {
    expect(isBotSubmission('')).toBe(false);
    expect(isBotSubmission('   ')).toBe(false);
    expect(isBotSubmission(null)).toBe(false);
    expect(isBotSubmission(undefined)).toBe(false);
  });
});
