import { db } from '../../db/index';
import { siteSettings, filmmakers } from '../../db/schema';
import { eq, sql, desc } from 'drizzle-orm';

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

    // Get the most recent change from filmmakers table using a single efficient query
    // Use GREATEST to find the most recent timestamp between created_at and updated_at
    const mostRecentFilmmaker = await db
      .select({
        mostRecentChange: sql<Date>`GREATEST(${filmmakers.createdAt}, ${filmmakers.updatedAt})`,
      })
      .from(filmmakers)
      .orderBy(desc(sql`GREATEST(${filmmakers.createdAt}, ${filmmakers.updatedAt})`))
      .limit(1);

    if (mostRecentFilmmaker.length === 0) {
      console.log('SKIP_BACKUP=true');
      console.log('No filmmakers in database');
      process.exit(0);
    }

    const lastChangeTime = new Date(mostRecentFilmmaker[0].mostRecentChange);

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
