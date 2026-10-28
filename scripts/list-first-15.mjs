import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.join(process.cwd(), 'apps', 'web', '.env') });
const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();

const res = await client.query('SELECT sort_order, id, title, type, media_url FROM works ORDER BY sort_order ASC LIMIT 15');
console.log('First 15 works:');
res.rows.forEach(r => console.log(`${r.sort_order}. [${r.id}] (${r.type}) ${r.title} -> ${r.media_url}`));
await client.end();
