import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.join(process.cwd(), 'apps', 'web', '.env') });
const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();

// 1. Delete fragmented single slides
const deleteResult = await client.query(`
  DELETE FROM works 
  WHERE id LIKE 'perfume-slide-%' 
     OR id LIKE 'rolex-slide-%' 
     OR id LIKE 'watch-slide-%'
`);
console.log(`Deleted ${deleteResult.rowCount} fragmented single-slide rows.`);

// 2. Ensure perfume, rolex, and watch have correct images and metadata
await client.query(`
  UPDATE works 
  SET 
    title = 'Perfume Luxe — Digital Brand Experience',
    category = 'UI/UX',
    type = 'image',
    media_url = '/works/Perfume/cover 1.png',
    images = $1,
    description = 'Complete 10-slide luxury fragrance digital experience, product showcase and conversion funnel.',
    sort_order = 1
  WHERE id = 'perfume-case-study'
`, [JSON.stringify([
  "/works/Perfume/cover 1.png",
  "/works/Perfume/overview 1.png",
  "/works/Perfume/slide-01 1.png",
  "/works/Perfume/slide-02 1.png",
  "/works/Perfume/slide-03 1.png",
  "/works/Perfume/slide-04 1.png",
  "/works/Perfume/slide-05 1.png",
  "/works/Perfume/slide-06 1.png",
  "/works/Perfume/slide-07 1.png",
  "/works/Perfume/slide-08 1.png"
])]);

await client.query(`
  UPDATE works 
  SET 
    title = 'Rolex Oyster Perpetual — Interactive UI',
    category = 'UI/UX',
    type = 'image',
    media_url = '/works/Rolex/rolex-slide-1(1).png',
    images = $1,
    description = 'Precision horology concept with interactive model viewing, typography mastery and luxury aesthetics.',
    sort_order = 2
  WHERE id = 'rolex-oyster-perpetual'
`, [JSON.stringify([
  "/works/Rolex/rolex-slide-1(1).png",
  "/works/Rolex/rolex-slide-2(1).png",
  "/works/Rolex/rolex-slide-3(1).png",
  "/works/Rolex/rolex-slide-4(1).png",
  "/works/Rolex/rolex-slide-5(1).png",
  "/works/Rolex/rolex-slide-6.png"
])]);

await client.query(`
  UPDATE works 
  SET 
    title = 'Modern Chronograph — Watch Companion App',
    category = 'UI/UX',
    type = 'image',
    media_url = '/works/Watch/1.png',
    images = $1,
    description = 'Sleek timekeeping companion app UI with fluid data visualization and tactile micro-details.',
    sort_order = 3
  WHERE id = 'modern-chronograph-app'
`, [JSON.stringify([
  "/works/Watch/1.png",
  "/works/Watch/2.png",
  "/works/Watch/3.png",
  "/works/Watch/4.png",
  "/works/Watch/5.jpg",
  "/works/Watch/6.jpg",
  "/works/Watch/7.jpg"
])]);

// 3. Re-index sort_order for all remaining items
const remaining = await client.query("SELECT id FROM works ORDER BY sort_order ASC, created_at ASC");
console.log(`Remaining total works: ${remaining.rows.length}`);

for (let i = 0; i < remaining.rows.length; i++) {
  await client.query("UPDATE works SET sort_order = $1 WHERE id = $2", [i + 1, remaining.rows[i].id]);
}

console.log("Database successfully cleaned and re-indexed!");
await client.end();
