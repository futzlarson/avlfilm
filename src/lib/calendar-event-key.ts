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
export function calendarMatchKey(title: string, startDate: string): string {
  const normalizedTitle = (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

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
