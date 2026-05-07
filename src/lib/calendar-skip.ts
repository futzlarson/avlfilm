// Internal imports
import { db } from '@db';
import { siteSettings } from '@db/schema';
// External packages
import { eq } from 'drizzle-orm';

export const CALENDAR_SKIP_KEY = 'calendar_skipped_organizers';

export async function getSkippedOrganizers(): Promise<string[]> {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, CALENDAR_SKIP_KEY))
    .limit(1);

  if (!rows[0]?.value) return [];
  try {
    const parsed = JSON.parse(rows[0].value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export async function setSkippedOrganizers(list: string[]): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key: CALENDAR_SKIP_KEY, value: JSON.stringify(list) })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: JSON.stringify(list), updatedAt: new Date() },
    });
}
