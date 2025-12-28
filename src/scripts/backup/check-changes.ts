import { db } from '../../db/index';
import { siteSettings, filmmakers } from '../../db/schema';
import { eq, sql, desc } from 'drizzle-orm';

async function checkChanges() {
  try {
    const lastBackupResult = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'last_backup_timestamp'));

    const lastBackupTime = lastBackupResult[0]?.value
      ? new Date(lastBackupResult[0].value)
      : new Date(0);

    // Get the most recent change from filmmakers table
    // Sort by the later of created_at or updated_at
    const allFilmmakers = await db
      .select({
        createdAt: filmmakers.createdAt,
        updatedAt: filmmakers.updatedAt,
      })
      .from(filmmakers);

    if (allFilmmakers.length === 0) {
      console.log('SKIP_BACKUP=true');
      console.log('No filmmakers in database');
      process.exit(0);
    }

    // Find the most recent timestamp
    let lastChangeTime = new Date(0);
    for (const filmmaker of allFilmmakers) {
      const created = filmmaker.createdAt ? new Date(filmmaker.createdAt) : new Date(0);
      const updated = filmmaker.updatedAt ? new Date(filmmaker.updatedAt) : new Date(0);
      const mostRecent = created > updated ? created : updated;
      if (mostRecent > lastChangeTime) {
        lastChangeTime = mostRecent;
      }
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
