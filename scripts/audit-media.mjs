import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

dotenv.config({ path: path.join(process.cwd(), 'apps', 'web', '.env') });
const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();

const res = await client.query('SELECT id, title, type, category, media_url, poster_url, images FROM works ORDER BY sort_order ASC');
console.log(`Checking all ${res.rows.length} works from database...`);

let okMedia = 0;
let failMedia = [];

for (const row of res.rows) {
  // Check media_url
  const mediaPath = path.join(process.cwd(), 'apps', 'web', 'public', row.media_url);
  const exists = fs.existsSync(mediaPath);
  if (!exists) {
    failMedia.push({ id: row.id, title: row.title, type: row.type, path: row.media_url });
  } else {
    okMedia++;
  }

  // Check images array if exists
  if (row.images) {
    try {
      const imgs = JSON.parse(row.images);
      for (const img of imgs) {
        const ip = path.join(process.cwd(), 'apps', 'web', 'public', img);
        if (!fs.existsSync(ip)) {
          failMedia.push({ id: row.id, title: row.title, type: 'slide-image', path: img });
        }
      }
    } catch {}
  }
}

console.log(`Media files check: ${okMedia} exist, ${failMedia.length} missing.`);
if (failMedia.length > 0) {
  console.log('MISSING MEDIA:');
  failMedia.forEach(f => console.log(`  [${f.type}] ${f.id}: "${f.path}"`));
}

await client.end();
