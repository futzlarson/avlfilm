ALTER TABLE "site_settings" ALTER COLUMN "updated_at" SET NOT NULL;

-- Rename last_backup_timestamp to database_backups and convert to JSON format
UPDATE "site_settings"
SET
  "key" = 'database_backups',
  "value" = json_build_array(
    json_build_object(
      'timestamp', "value",
      'filename', 'backup-' || replace(split_part("value", 'T', 1), '-', '-') || 'T' || replace(split_part(split_part("value", 'T', 2), '.', 1), ':', '-') || '.dump',
      'size', 'unknown'
    )
  )::text
WHERE "key" = 'last_backup_timestamp';