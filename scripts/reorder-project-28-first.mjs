import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.join(process.cwd(), 'apps', 'web', '.env') });
const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();

// Fetch all works ordered by sort_order
const res = await client.query('SELECT id, title, type, sort_order FROM works ORDER BY sort_order ASC');
const works = res.rows;

console.log(`Loaded ${works.length} works from database.`);

// Current project at index 27 (1-indexed 28):
const p28Index = works.findIndex(w => w.sort_order === 28 || w.id === 'video-recording-2');
console.log(`Found Project 28: index ${p28Index}, id: ${works[p28Index]?.id}, title: ${works[p28Index]?.title}`);

if (p28Index !== -1) {
  const [p28] = works.splice(p28Index, 1);
  // Put it at the first position
  works.unshift(p28);
}

// Re-assign sort_orders from 1 to 48
await client.query('BEGIN');
for (let i = 0; i < works.length; i++) {
  const newOrder = i + 1;
  await client.query('UPDATE works SET sort_order = $1 WHERE id = $2', [newOrder, works[i].id]);
}
await client.query('COMMIT');

console.log('Successfully re-ordered works with Project 28 at the first position (sort_order = 1)!');

// Print first 5 and perfume positions
const verifyRes = await client.query('SELECT sort_order, id, title, type FROM works ORDER BY sort_order ASC LIMIT 10');
console.log('\nTop 10 works now:');
verifyRes.rows.forEach(r => console.log(`${r.sort_order}: [${r.type}] ${r.id} - ${r.title}`));

const perfumeRes = await client.query("SELECT sort_order, id, title, type FROM works WHERE id LIKE '%perfume%' ORDER BY sort_order ASC");
console.log('\nPerfume works now:');
perfumeRes.rows.forEach(r => console.log(`${r.sort_order}: [${r.type}] ${r.id} - ${r.title}`));

await client.end();
