// Internal imports
import { db } from '@db/index';
import { events, filmmakers, reviews, siteSettings, spotlightEvents, submissions } from '@db/schema';
// External packages
import { eq, sql } from 'drizzle-orm';

async function checkChanges() {
  try {
    const backupLogResult = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'database_backups'));

    // Use updated_at as the last backup timestamp (simpler and more reliable)
    const lastBackupTime = backupLogResult[0]?.updatedAt
      ? new Date(backupLogResult[0].updatedAt)
      : new Date(0);

    // Find the most recent change across every tracked table.
    // siteSettings/events only have one timestamp column; the rest take GREATEST(created, updated).
    const tableQueries = await Promise.all([
      db.select({ ts: sql<Date | null>`MAX(${siteSettings.updatedAt})` }).from(siteSettings),
      db.select({ ts: sql<Date | null>`MAX(${events.createdAt})` }).from(events),
      db.select({ ts: sql<Date | null>`MAX(GREATEST(${filmmakers.createdAt}, ${filmmakers.updatedAt}))` }).from(filmmakers),
      db.select({ ts: sql<Date | null>`MAX(GREATEST(${spotlightEvents.createdAt}, ${spotlightEvents.updatedAt}))` }).from(spotlightEvents),
      db.select({ ts: sql<Date | null>`MAX(GREATEST(${submissions.createdAt}, ${submissions.updatedAt}))` }).from(submissions),
      db.select({ ts: sql<Date | null>`MAX(GREATEST(${reviews.createdAt}, ${reviews.updatedAt}))` }).from(reviews),
    ]);

    let lastChangeTime: Date | null = null;
    for (const result of tableQueries) {
      const ts = result[0]?.ts;
      if (!ts) continue;
      const date = new Date(ts);
      if (!lastChangeTime || date > lastChangeTime) {
        lastChangeTime = date;
      }
    }

    if (!lastChangeTime) {
      console.log('SKIP_BACKUP=true');
      console.log('No data in any tracked table');
      process.exit(0);
    }

    if (lastChangeTime <= lastBackupTime) {
      console.log('SKIP_BACKUP=true');
      console.log(`No changes since ${lastBackupTime.toISOString()}`);
      process.exit(0);
    }

    console.log('SKIP_BACKUP=false');
    console.log(`Changes detected: ${lastChangeTime.toISOString()}`);
    process.exit(0);
  } catch (error) {
    console.error('Error checking changes:', error);
    console.log('SKIP_BACKUP=false'); // Backup on error to be safe
    process.exit(0);
  }
}

checkChanges();
