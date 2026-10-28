import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.join(process.cwd(), 'apps', 'web', '.env') });
const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();

const res = await client.query(`
  SELECT id, title, category, type, media_url, poster_url, images, sort_order, published
  FROM works 
  ORDER BY sort_order ASC, created_at ASC
`);

console.log(`Total works in DB: ${res.rows.length}`);
res.rows.forEach((r, idx) => {
  console.log(`${idx + 1}. [${r.id}] (${r.type}) ${r.title} -> media_url: ${r.media_url} | poster: ${r.poster_url}`);
});

await client.end();
