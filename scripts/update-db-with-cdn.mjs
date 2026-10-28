import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import pgMod from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';

dotenv.config({ path: path.join(process.cwd(), 'apps', 'web', '.env') });

const Client = pgMod.default?.Client || pgMod.Client;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

const manifest = JSON.parse(fs.readFileSync('assets-manifest.json', 'utf8'));

async function updateDb() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL database.');

  let updated = 0;
  for (const item of manifest) {
    const slideJson = item.cdnSlideUrls ? JSON.stringify(item.cdnSlideUrls) : null;
    const res = await client.query(
      `
      UPDATE works
      SET
        media_url = $1,
        poster_url = $2,
        images = $3
      WHERE id = $4
    `,
      [item.cdnMediaUrl, item.cdnPosterUrl, slideJson, item.id]
    );

    if (res.rowCount > 0) {
      updated += res.rowCount;
    }
  }

  console.log(`Successfully updated ${updated} rows in the database with CDN URLs!`);

  const sample = await client.query('SELECT id, title, media_url, poster_url FROM works LIMIT 3');
  console.log('Sample updated rows in DB:');
  sample.rows.forEach(r => console.log(` - [${r.id}] ${r.title}\n   media: ${r.media_url}\n   poster: ${r.poster_url}`));

  await client.end();
}

updateDb().catch(console.error);
