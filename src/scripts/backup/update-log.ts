import { db } from '../../db/index';
import { siteSettings } from '../../db/schema';
import { eq } from 'drizzle-orm';

interface BackupEntry {
  timestamp: string;
  filename: string;
  size: string;
}

async function updateBackupLog(filename: string, size: string) {
  try {
    const timestamp = new Date().toISOString();

    // Get existing backups
    const existing = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'database_backups'))
      .limit(1);

    let backups: BackupEntry[] = [];

    if (existing.length > 0 && existing[0].value) {
      try {
        backups = JSON.parse(existing[0].value);
      } catch (e) {
        console.warn('Failed to parse existing backups, starting fresh');
      }
    }

    // Add new backup entry
    backups.push({
      timestamp,
      filename,
      size
    });

    // Keep only last 30 backups in the log
    if (backups.length > 30) {
      backups = backups.slice(-30);
    }

    // Update database
    await db
      .insert(siteSettings)
      .values({
        key: 'database_backups',
        value: JSON.stringify(backups)
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: JSON.stringify(backups),
          updatedAt: new Date()
        }
      });

    console.log('Backup log updated');
  } catch (error) {
    console.error('Failed to update backup log:', error);
    process.exit(1);
  }
  process.exit(0);
}

// Get filename and size from environment variables set by the workflow
const filename = process.env.BACKUP_FILE || 'unknown';
const size = process.env.BACKUP_SIZE || 'unknown';

updateBackupLog(filename, size);
