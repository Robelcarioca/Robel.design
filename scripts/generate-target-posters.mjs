import { execSync } from 'node:child_process';
import path from 'node:path';
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), 'apps', 'web', '.env') });

const targets = [
  { p: 8, id: 'video-recording-15', file: 'screen-recording-2026-10-16-095652.mp4', start: 11, end: null },
  { p: 13, id: 'video-recording-21', file: 'screen-recording-2026-10-20-130856.mp4', start: 70, end: 74 },
  { p: 14, id: 'video-recording-22', file: 'screen-recording-2026-10-20-131050.mp4', start: 5, end: 7 },
  { p: 20, id: 'video-recording-30', file: 'screen-recording-2026-10-24-071718.mp4', start: 5, end: null },
  { p: 27, id: 'video-recording-37', file: 'screen-recording-2026-10-26-174829.mp4', start: 3, end: null },
  { p: 31, id: 'video-recording-20', file: 'screen-recording-2026-10-19-171910.mp4', start: 2, end: null },
  { p: 32, id: 'video-recording-25', file: 'screen-recording-2026-10-20-131910.mp4', start: 60, end: null },
  { p: 36, id: 'video-recording-27', file: 'screen-recording-2026-10-23-164057.mp4', start: 5, end: null },
];

const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();

for (const t of targets) {
  const videoPath = path.join(process.cwd(), 'apps', 'web', 'public', 'works', 'web-videos', t.file);
  const posterName = t.file.replace('.mp4', `-clip-p${t.p}.jpg`);
  const posterPath = path.join(process.cwd(), 'apps', 'web', 'public', 'works', 'web-videos', posterName);
  const posterUrl = `/works/web-videos/${posterName}`;

  // Format start time as HH:MM:SS
  const hrs = String(Math.floor(t.start / 3600)).padStart(2, '0');
  const mins = String(Math.floor((t.start % 3600) / 60)).padStart(2, '0');
  const secs = String(Math.floor(t.start % 60)).padStart(2, '0');
  const timeStr = `${hrs}:${mins}:${secs}`;

  try {
    const cmd = `ffmpeg -ss ${timeStr} -i "${videoPath}" -frames:v 1 -q:v 2 "${posterPath}" -y`;
    execSync(cmd);
    console.log(`Generated poster for Project ${t.p} at ${timeStr} -> ${posterName}`);

    // Update database poster_url so it matches perfectly
    await client.query('UPDATE works SET poster_url = $1 WHERE id = $2', [posterUrl, t.id]);
    console.log(`Updated DB poster_url for ${t.id} to ${posterUrl}`);
  } catch (err) {
    console.error(`Error processing Project ${t.p}: ${err.message}`);
  }
}

await client.end();
console.log('All posters generated and database updated successfully!');
