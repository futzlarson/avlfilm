import { readFileSync } from 'fs';
import { resolve } from 'path';
import { db } from '../db';
import { filmmakers } from '../db/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Role normalization mapping
const ROLE_MAPPINGS: Record<string, string> = {
  'DP': 'Director of Photography (DP)',
  'Cinematographer': 'Director of Photography (DP)',
  'Director/Videographer/Editor': 'Director, Videographer, Editor',
  'Producer/Director': 'Producer, Director',
  'Videographer/photographer': 'Videographer, Photographer',
  'Producer/DP': 'Producer, Director of Photography (DP)',
  'Director,cinematographer,editor,producer': 'Director, Cinematographer, Editor, Producer',
  'Producer & DP': 'Producer, Director of Photography (DP)',
  'Producer/DP,editor': 'Producer, Director of Photography (DP), Editor',
  'Filmmaker': 'Filmmaker',
  'Writer,producer,director': 'Writer, Producer, Director',
  'Producer,Director,Editor': 'Producer, Director, Editor',
  'Director,Producer,Actor,Writer': 'Director, Producer, Actor, Writer',
  'Producer,Editor,Scriptwriting,DP,Audio/Lighting': 'Producer, Editor, Screenwriter, Director of Photography (DP), Audio Engineer, Gaffer',
  'Producer,Cinematographer,Editor': 'Producer, Cinematographer, Editor',
  'Actor/Narrator/Spokesperson,Writer,Director,DP': 'Actor, Narrator, Spokesperson, Writer, Director, Director of Photography (DP)',
  'Camera Assistant or PA,aspiring Director': 'Camera Assistant, PA (Production Assistant), Director',
  'Producer / PM': 'Producer, Production Manager (PM)',
  'sound engineer': 'Sound Engineer',
  'DP,Filmmaker,Cine,Editor': 'Director of Photography (DP), Filmmaker, Editor',
  'Producer,DP,editor': 'Producer, Director of Photography (DP), Editor',
  'Producer/director': 'Producer, Director',
  'DP,Gaffer,Producer,Editor': 'Director of Photography (DP), Gaffer, Producer, Editor',
  'Director,DP/ Camera & drone Op,editor': 'Director, Director of Photography (DP), Camera Assistant, Drone Pilot, Editor',
  'Producer,editor,DP.': 'Producer, Editor, Director of Photography (DP)',
  'DP/Director': 'Director of Photography (DP), Director',
  'Documentary Filmmaker,Editor': 'Filmmaker, Editor',
  'Doing it all…': 'Filmmaker',
  'A Jack of all trades': 'Filmmaker',
  'producer,additional cam op,director,production assitant': 'Producer, Additional Camera Operator, Director, Production Assistant',
  'Director,Producer,Writer,Production Coordinator,2nd AD': 'Director, Producer, Writer, Production Coordinator, 2nd AD',
  'P.A./ 2nd AC': 'PA (Production Assistant), Camera Assistant',
  'Producer/Director (worked in Camera/Sound depts)': 'Producer, Director',
  'Director/Writer': 'Director, Writer',
  'Music/Composer': 'Composer',
  'DP / Photography / Drone / Grip / Audio': 'Director of Photography (DP), Photographer, Drone Pilot, Grip, Audio Engineer',
  'Cam/Grip/Editor': 'Camera Assistant, Grip, Editor',
  'Production Design/Animator/Writer/Dir': 'Production Designer, Writer, Director',
  '"Production Design/Animator/\nWriter/Dir"': 'Production Designer, Writer, Director',
  'Production Design/Animator/\nWriter/Dir': 'Production Designer, Writer, Director',
  'Acting Studio for all levels': 'Actor',
  'Writer/AD': 'Writer, Assistant Director (AD)',
  'Actor/Producer': 'Actor, Producer',
  'Actor/Editor/Camera': 'Actor, Editor, Camera Assistant',
  'Director/Camera': 'Director, Camera Assistant',
  'Actor/Director': 'Actor, Director',
  'Actor/Writer': 'Actor, Writer',
  'Actor/Writer/Finanace': 'Actor, Writer, Finance',
  'Dir/Writer': 'Director, Writer',
  'Screenwriter/Actor/Filmmaker': 'Screenwriter, Actor, Filmmaker',
  'Screenwriter/AD/Director': 'Screenwriter, Assistant Director (AD), Director',
  'Director-Producer-Writer': 'Director, Producer, Writer',
  'DP,Filmmaker,Licensed Drone Pilot': 'Director of Photography (DP), Filmmaker, Drone Pilot',
  'Photography,Licensed Drone Pilot': 'Photographer, Drone Pilot',
  'Filmmaker,Editor': 'Filmmaker, Editor',
  'writer,screenwriter,creative director': 'Writer, Screenwriter, Creative Director',
  'AD,Swing,Director & Producer': 'Assistant Director (AD), Director, Producer',
  'Photographer,DP,Drone Pilot': 'Photographer, Director of Photography (DP), Drone Pilot',
};

function normalizeRoles(rolesStr: string): string {
  // Check if we have a direct mapping
  if (ROLE_MAPPINGS[rolesStr]) {
    return ROLE_MAPPINGS[rolesStr];
  }

  // Otherwise, split and normalize each role
  const roles = rolesStr.split(/[,/]/).map(r => r.trim()).filter(Boolean);
  const normalized = roles.map(role => {
    // Handle specific role variations
    if (role.toLowerCase() === 'dp' || role.toLowerCase() === 'cinematographer') {
      return 'Director of Photography (DP)';
    }
    if (role.toLowerCase() === 'videographer') {
      return 'Videographer';
    }
    if (role.toLowerCase() === 'photographer' || role.toLowerCase() === 'photography') {
      return 'Photographer';
    }
    if (role.toLowerCase() === 'producer') {
      return 'Producer';
    }
    if (role.toLowerCase() === 'director') {
      return 'Director';
    }
    if (role.toLowerCase() === 'editor') {
      return 'Editor';
    }
    if (role.toLowerCase() === 'writer' || role.toLowerCase() === 'screenwriter') {
      return 'Writer';
    }
    if (role.toLowerCase() === 'actor') {
      return 'Actor';
    }
    // Return as-is for others
    return role;
  });

  return normalized.join(', ');
}

function formatPhone(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as ###-###-####
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Return original if not 10 digits
  return phone;
}

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
