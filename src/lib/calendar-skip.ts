// Internal imports
import { db } from '@db';
import { siteSettings } from '@db/schema';
// External packages
import { eq } from 'drizzle-orm';

export const CALENDAR_SKIP_KEY = 'calendar_skipped_organizers';
// AVL GO reuses one id per recurring series, so skipping the id hides the whole
// series even when the venue (and therefore the organizer field) changes.
export const CALENDAR_SKIP_EVENTS_KEY = 'calendar_skipped_event_ids';

async function getStringList(key: string): Promise<string[]> {
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);

  if (!rows[0]?.value) return [];
  try {
    const parsed = JSON.parse(rows[0].value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

async function setStringList(key: string, list: string[]): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key, value: JSON.stringify(list) })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: JSON.stringify(list), updatedAt: new Date() },
    });
}

export function getSkippedOrganizers(): Promise<string[]> {
  return getStringList(CALENDAR_SKIP_KEY);
}

export function setSkippedOrganizers(list: string[]): Promise<void> {
  return setStringList(CALENDAR_SKIP_KEY, list);
}

export function getSkippedEventIds(): Promise<string[]> {
  return getStringList(CALENDAR_SKIP_EVENTS_KEY);
}

export function setSkippedEventIds(list: string[]): Promise<void> {
  return setStringList(CALENDAR_SKIP_EVENTS_KEY, list);
}
