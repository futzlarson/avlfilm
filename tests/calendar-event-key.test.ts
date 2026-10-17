import { calendarMatchKey } from '@lib/calendar-event-key';
import { describe, expect, it } from 'vitest';

describe('calendarMatchKey', () => {
  it('matches a listing renamed with a year on the same day', () => {
    expect(calendarMatchKey('Asheville Jewish Film Festival 2026', '2026-10-11T18:00:00.000Z')).toBe(
      calendarMatchKey('Asheville Jewish Film Festival', '2026-10-11T14:00:00-04:00')
    );
  });

  it('matches across a start-time edit on the same Eastern day', () => {
    expect(calendarMatchKey('Screening', '2026-10-11T23:30:00.000Z')).toBe(
      calendarMatchKey('Screening', '2026-10-11T15:00:00-04:00')
    );
  });

  it('does not match the same title on a different day', () => {
    expect(calendarMatchKey('Asheville Jewish Film Festival', '2026-10-17T23:00:00.000Z')).not.toBe(
      calendarMatchKey('Asheville Jewish Film Festival', '2026-10-11T14:00:00-04:00')
    );
  });

  it('keeps numbers that are not years', () => {
    expect(calendarMatchKey('48 Hour Film Project', '2026-07-10T22:00:00.000Z')).toContain('48 hour');
  });
});
