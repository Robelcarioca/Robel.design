import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.join(process.cwd(), 'apps', 'web', '.env') });
const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();

const targetId = 'presentation-keynote-deck';

const check = await client.query('SELECT sort_order, id, title, media_url FROM works WHERE id = $1', [targetId]);
console.log('Target to delete:', check.rows);

if (check.rows.length > 0) {
  const del = await client.query('DELETE FROM works WHERE id = $1', [targetId]);
  console.log(`Deleted ${del.rowCount} row: ${targetId}`);

  // Re-sequence 1 to 48
  const rem = await client.query('SELECT id FROM works ORDER BY sort_order ASC, created_at ASC');
  console.log(`Re-ordering ${rem.rows.length} remaining works...`);
  for (let i = 0; i < rem.rows.length; i++) {
    await client.query('UPDATE works SET sort_order = $1 WHERE id = $2', [i + 1, rem.rows[i].id]);
  }
  console.log('Successfully re-ordered remaining works from 1 to', rem.rows.length);
} else {
  console.log('Item not found in DB!');
}

await client.end();
