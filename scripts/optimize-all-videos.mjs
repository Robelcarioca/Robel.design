import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), 'apps', 'web', '.env') });

const videosDir = path.join(process.cwd(), 'apps', 'web', 'public', 'works', 'videos');
const postersDir = path.join(process.cwd(), 'apps', 'web', 'public', 'works', 'posters');
const webVideosDir = path.join(process.cwd(), 'apps', 'web', 'public', 'works', 'web-videos');

if (!fs.existsSync(postersDir)) fs.mkdirSync(postersDir, { recursive: true });
if (!fs.existsSync(webVideosDir)) fs.mkdirSync(webVideosDir, { recursive: true });

const files = fs.readdirSync(videosDir).filter(f => f.endsWith('.mp4') && !f.startsWith('test-'));
console.log(`Found ${files.length} MP4 videos to process.`);

const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const basename = path.basename(file, '.mp4');
  const inputPath = path.join(videosDir, file);
  const posterPath = path.join(postersDir, `${basename}.jpg`);
  const webVideoPath = path.join(webVideosDir, `${basename}.mp4`);

  console.log(`[${i + 1}/${files.length}] Processing ${file}...`);

  // 1. Extract poster frame if not exists
  if (!fs.existsSync(posterPath)) {
    try {
      execSync(`ffmpeg -y -ss 00:00:01 -i "${inputPath}" -vframes 1 -vf "scale=960:-2" -q:v 3 -update 1 "${posterPath}"`, { stdio: 'ignore' });
    } catch {
      try {
        execSync(`ffmpeg -y -ss 00:00:00 -i "${inputPath}" -vframes 1 -vf "scale=960:-2" -q:v 3 -update 1 "${posterPath}"`, { stdio: 'ignore' });
      } catch (err) {
        console.warn(`  Failed poster for ${file}:`, err.message);
      }
    }
  }

  // 2. Generate web-optimized faststart video (~1MB vs 30MB)
  if (!fs.existsSync(webVideoPath)) {
    try {
      execSync(`ffmpeg -y -i "${inputPath}" -vf "scale=960:-2" -c:v libx264 -crf 26 -preset fast -an -movflags +faststart "${webVideoPath}"`, { stdio: 'ignore' });
    } catch (err) {
      console.warn(`  Failed web-video for ${file}:`, err.message);
    }
  }

  // 3. Update database poster_url and media_url for fast web playback
  const posterUrl = `/works/posters/${basename}.jpg`;
  const webMediaUrl = fs.existsSync(webVideoPath) ? `/works/web-videos/${basename}.mp4` : `/works/videos/${file}`;

  await client.query(`
    UPDATE works 
    SET 
      poster_url = $1,
      media_url = $2
    WHERE media_url LIKE $3
  `, [posterUrl, webMediaUrl, `%${file}%`]);
}

console.log('All videos optimized with faststart and posters generated!');
await client.end();
