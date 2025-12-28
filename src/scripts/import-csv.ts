import { readFileSync } from 'fs';
import { resolve } from 'path';
import { db } from '../db';
import { filmmakers } from '../db/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
import { normalizeRoles } from '../config/roles';
import { formatPhone } from '../utils/formatting';

dotenv.config({ path: '.env.local' });

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Push last field
  result.push(current.trim());

  return result;
}

async function importCSV(csvPath: string) {
  try {
    console.log(`📂 Reading CSV from: ${csvPath}`);
    const csvContent = readFileSync(csvPath, 'utf-8');

    // Split by newlines but keep track of quoted fields
    const rows: string[] = [];
    let currentRow = '';
    let inQuotes = false;

    for (let i = 0; i < csvContent.length; i++) {
      const char = csvContent[i];
      const nextChar = csvContent[i + 1];

      if (char === '"') {
        currentRow += char;
        if (inQuotes && nextChar === '"') {
          currentRow += nextChar;
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === '\n' && !inQuotes) {
        if (currentRow.trim()) {
          rows.push(currentRow);
        }
        currentRow = '';
      } else if (char !== '\r') {
        currentRow += char;
      }
    }

    // Push last row if exists
    if (currentRow.trim()) {
      rows.push(currentRow);
    }

    console.log(`📋 Found ${rows.length - 1} rows (excluding header)`);

    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < rows.length; i++) {
      const values = parseCSVLine(rows[i]);

      if (values.length < 2) {
        skipped++;
        continue;
      }

      const [
        _timestamp,
        name,
        email,
        phone,
        roles,
        company,
        website,
        socialMedia,
        gear
      ] = values;

      // Skip if missing required fields
      if (!name || !email) {
        console.log(`⚠️  Skipping row ${i + 1}: Missing name or email`);
        skipped++;
        continue;
      }

      // Default to 'Filmmaker' if no roles specified
      let effectiveRoles = roles;
      if (!roles || roles.toLowerCase() === 'none') {
        effectiveRoles = 'Filmmaker';
        console.log(`ℹ️  ${name}: No roles specified, defaulting to 'Filmmaker'`);
      }

      const normalizedRoles = normalizeRoles(effectiveRoles);
      const formattedPhone = formatPhone(phone);

      try {
        // Check if filmmaker already exists
        const existing = await db.select().from(filmmakers).where(eq(filmmakers.email, email)).limit(1);

        if (existing.length > 0) {
          console.log(`⏭️  Skipping ${name}: Already exists (${email})`);
          skipped++;
          continue;
        }

        await db.insert(filmmakers).values({
          name,
          email,
          phone: formattedPhone || null,
          roles: normalizedRoles,
          company: company || null,
          website: website || null,
          socialMedia: socialMedia || null,
          gear: gear || null,
          status: 'approved',
        });

        console.log(`✅ Imported: ${name} (${normalizedRoles})`);
        imported++;
      } catch (error: any) {
        console.error(`❌ Failed to import ${name}:`, error.message);
        skipped++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log(`   📝 Total: ${rows.length - 1}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Get CSV path from command line argument or use default
const csvPath = process.argv[2] || resolve(process.cwd(), 'meta/crew.csv');

console.log('🚀 Starting CSV import...\n');
importCSV(csvPath)
  .then(() => {
    console.log('\n✨ Import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Import failed:', error);
    process.exit(1);
  });
