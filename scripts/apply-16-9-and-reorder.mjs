import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.join(process.cwd(), 'apps', 'web', '.env') });
const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();

// 1. Update Perfume slides to 16:9 ambre_01.png through ambre_10.png
const perfumeSlides = [
  '/works/Perfume/ambre_01.png',
  '/works/Perfume/ambre_02.png',
  '/works/Perfume/ambre_03.png',
  '/works/Perfume/ambre_04.png',
  '/works/Perfume/ambre_05.png',
  '/works/Perfume/ambre_06.png',
  '/works/Perfume/ambre_07.png',
  '/works/Perfume/ambre_08.png',
  '/works/Perfume/ambre_09.png',
  '/works/Perfume/ambre_10.png'
];

await client.query(`
  UPDATE works
  SET media_url = $1, images = $2
  WHERE id = 'perfume-case-study'
`, [perfumeSlides[0], JSON.stringify(perfumeSlides)]);
console.log('Updated perfume-case-study with 16:9 images');

// 2. Update Rolex slides to 16:9 rolex_01.png through rolex_06.png
const rolexSlides = [
  '/works/Rolex/rolex_01.png',
  '/works/Rolex/rolex_02.png',
  '/works/Rolex/rolex_03.png',
  '/works/Rolex/rolex_04.png',
  '/works/Rolex/rolex_05.png',
  '/works/Rolex/rolex_06.png'
];

await client.query(`
  UPDATE works
  SET media_url = $1, images = $2
  WHERE id = 'rolex-oyster-perpetual'
`, [rolexSlides[0], JSON.stringify(rolexSlides)]);
console.log('Updated rolex-oyster-perpetual with 16:9 images');

// 3. Query all works to re-order: Videos FIRST, then Perfume pics, then the others
const { rows } = await client.query(`
  SELECT id, type, title FROM works
`);

// Partition
const videoWorks = rows.filter(r => r.type === 'video');
const perfumeWorks = rows.filter(r => r.id === 'perfume-case-study' || r.id === 'perfume-campaign-landing');
const otherImageWorks = rows.filter(r => r.type !== 'video' && r.id !== 'perfume-case-study' && r.id !== 'perfume-campaign-landing');

// Preferred order for others
const orderWeights = {
  'rolex-oyster-perpetual': 1,
  'modern-chronograph-app': 2,
  'kickoff-football-web': 3,
  'nexora-saas-platform': 4,
  'hardware-product-showcase': 5,
  'geometric-brand-graphics': 6,
  'orla-furniture': 7,
  'amazon-maven-lane': 8,
  'minimalist-website-template': 9,
  'brand-identity-system': 10
};

otherImageWorks.sort((a, b) => (orderWeights[a.id] || 99) - (orderWeights[b.id] || 99));

// Ensure perfume-case-study comes before perfume-campaign-landing
perfumeWorks.sort((a, b) => (a.id === 'perfume-case-study' ? -1 : 1));

// Combined ordered list
const orderedWorks = [...videoWorks, ...perfumeWorks, ...otherImageWorks];

console.log(`\nRe-ordering ${orderedWorks.length} works:`);
console.log(`- Videos count: ${videoWorks.length}`);
console.log(`- Perfume count: ${perfumeWorks.length}`);
console.log(`- Others count: ${otherImageWorks.length}`);

for (let i = 0; i < orderedWorks.length; i++) {
  await client.query(`UPDATE works SET sort_order = $1 WHERE id = $2`, [i + 1, orderedWorks[i].id]);
}

console.log('Successfully re-ordered all works in DB!');
await client.end();
