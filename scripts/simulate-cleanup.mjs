import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.join(process.cwd(), 'apps', 'web', '.env') });
const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();

const idsToDelete = [
  // 1. The last video requested by user
  'video-recording-39', // screen-recording-2026-10-26-180701.mp4
  // 2. The bird video requested by user
  'video-recording-1',  // Fluid Layout Transitions & Gesture Choreography / Kingfisher bird
  // 3. Duplicate showcase videos (copies of screen-recordings)
  'ui-interaction-motion',
  'mobile-fluid-gestures',
  'interactive-analytics-dashboard',
  'event-stage-motion',
  'checkout-micro-animation',
  'agency-showreel-motion',
  // 4. Repeated poster photos (video thumbnails displayed as photos)
  'poster-artwork-1',
  'poster-artwork-2',
  'poster-artwork-3',
  'poster-artwork-4',
  'poster-artwork-5',
  'poster-artwork-6',
  // 5. Repeated photos (exact duplicates of existing works)
  'mouse-instagram-post',       // duplicate of hardware-product-showcase
  'perfume-landing-post',      // duplicate of perfume-campaign-landing
  'studio-editorial-shoot-1',  // duplicate of kickoff-football-web
  'studio-editorial-shoot-2',  // duplicate of nexora-saas-platform
  'brand-identity-cover-alt',  // duplicate of brand-identity-system
  'full-storefront-longform',   // duplicate of presentation-keynote-deck
  'visual-identity-synthesis', // synthetic duplicate
];

console.log(`Checking ${idsToDelete.length} IDs to delete...`);

const checkRes = await client.query(`
  SELECT id, title, type, media_url FROM works WHERE id = ANY($1::text[])
`, [idsToDelete]);

console.log(`Found ${checkRes.rows.length} matching rows in DB:`);
for (const r of checkRes.rows) {
  console.log(`- [${r.id}] (${r.type}) ${r.title} -> ${r.media_url}`);
}

const remainingRes = await client.query(`
  SELECT id, title, type, media_url FROM works WHERE id != ALL($1::text[]) ORDER BY sort_order ASC
`, [idsToDelete]);

console.log(`\nRemaining unique works count: ${remainingRes.rows.length}`);
for (const [idx, r] of remainingRes.rows.entries()) {
  console.log(`${idx + 1}. [${r.id}] (${r.type}) ${r.title} -> ${r.media_url}`);
}

await client.end();
