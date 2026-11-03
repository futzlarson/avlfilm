/**
 * Tracking key for "already added to Google Calendar".
 *
 * AVL GO reuses a single row (and id) for a recurring series and just moves
 * startDate forward, so the id alone would mark every future occurrence as added.
 */
export function calendarEventKey(id: string, startDate: string): string {
  const parsed = new Date(startDate);
  const stamp = isNaN(parsed.getTime()) ? startDate : parsed.toISOString();
  return `${id}:${stamp}`;
}

/**
 * Fuzzy key for matching an AVL GO event against a Google Calendar entry.
 * Day-level, not minute-level, because AVL GO edits start times after we add.
 */
// Years are dropped because listings get renamed with or without one ("Festival" vs "Festival 2026").
function normalizeTitle(title: string): string {
  return (title || '')
    .toLowerCase()
    .replace(/\b(19|20)\d{2}\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function calendarMatchKey(title: string, startDate: string): string {
  const normalizedTitle = normalizeTitle(title);

  const parsed = new Date(startDate);
  const day = isNaN(parsed.getTime())
    ? startDate
    : new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(parsed);

  return `${normalizedTitle}|${day}`;
}

/**
 * Key for skipping a recurring event. Some sources (e.g. Eventbrite) give every
 * date its own AVL GO id, so the id alone only skips one date.
 */
export function seriesSkipKey(title: string, organizer?: string | null): string {
  return `series:${normalizeTitle(title)}|${normalizeTitle(organizer || '')}`;
}
