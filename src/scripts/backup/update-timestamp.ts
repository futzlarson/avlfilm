import { db } from '../../db/index';
import { siteSettings } from '../../db/schema';

async function updateTimestamp() {
  try {
    await db
      .insert(siteSettings)
      .values({
        key: 'last_backup_timestamp',
        value: new Date().toISOString()
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: new Date().toISOString(),
          updatedAt: new Date()
        }
      });
    console.log('Backup timestamp updated');
  } catch (error) {
    console.error('Failed to update timestamp:', error);
    process.exit(1);
  }
  process.exit(0);
}

updateTimestamp();
