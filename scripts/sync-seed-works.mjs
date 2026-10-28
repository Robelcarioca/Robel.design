import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

dotenv.config({ path: path.join(process.cwd(), 'apps', 'web', '.env') });
const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();

const res = await client.query(`
  SELECT id, title, category, type, media_url as "mediaUrl", poster_url as "posterUrl", images, description, sort_order as "sortOrder", published
  FROM works 
  ORDER BY sort_order ASC, created_at ASC
`);

console.log(`Fetched ${res.rows.length} works from database`);

const worksPath = path.join(process.cwd(), 'apps', 'web', 'src', 'lib', 'actions', 'works.ts');
let content = fs.readFileSync(worksPath, 'utf8');

// Replace SEED_WORKS array
const jsonStr = JSON.stringify(res.rows, null, 2);
const newSeedBlock = `const SEED_WORKS: Omit<WorkItem, "createdAt">[] = ${jsonStr};`;

const seedStart = content.indexOf('const SEED_WORKS: Omit<WorkItem, "createdAt">[]');
const seedEnd = content.indexOf('async function requireAdmin()');

if (seedStart !== -1 && seedEnd !== -1) {
  content = content.slice(0, seedStart) + newSeedBlock + '\n\n' + content.slice(seedEnd);
  fs.writeFileSync(worksPath, content, 'utf8');
  console.log('Successfully updated SEED_WORKS in works.ts');
} else {
  console.error('Could not find SEED_WORKS boundary in works.ts');
}

await client.end();
