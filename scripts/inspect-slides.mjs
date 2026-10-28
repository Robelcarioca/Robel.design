import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.join(process.cwd(), 'apps', 'web', '.env') });
const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();

const res = await client.query("SELECT id, title, type, images FROM works WHERE id LIKE 'perfume%' OR id LIKE 'rolex%' OR id LIKE 'watch%' OR id LIKE 'modern%' ORDER BY sort_order ASC");
console.log('Found', res.rows.length, 'matching items:');
for (const r of res.rows) {
  let count = 0;
  if (r.images) {
    try { count = JSON.parse(r.images).length; } catch {}
  }
  console.log(`${r.id.padEnd(26)} | ${r.title.padEnd(50)} | images: ${count}`);
}

await client.end();
