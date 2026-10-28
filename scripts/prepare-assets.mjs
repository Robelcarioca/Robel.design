import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const baseDir = process.cwd();
const vidDir = path.join(baseDir, 'Vid');
const publicWorks = path.join(baseDir, 'apps', 'web', 'public', 'works');
const videosDir = path.join(publicWorks, 'videos');
const postersDir = path.join(publicWorks, 'posters');

fs.mkdirSync(videosDir, { recursive: true });
fs.mkdirSync(postersDir, { recursive: true });

const selectedVideos = [
  { file: 'Screen Recording 2026-10-15 021704.mp4', name: 'ui-interaction-showcase-1.mp4', poster: 'poster-1.jpg' },
  { file: 'Screen Recording 2026-10-15 004222.mp4', name: 'ui-interaction-showcase-2.mp4', poster: 'poster-2.jpg' },
  { file: 'Screen Recording 2026-10-18 071206.mp4', name: 'ui-interaction-showcase-3.mp4', poster: 'poster-3.jpg' },
  { file: 'Screen Recording 2026-10-16 093103.mp4', name: 'ui-interaction-showcase-4.mp4', poster: 'poster-4.jpg' },
  { file: 'Screen Recording 2026-10-14 004156.mp4', name: 'ui-interaction-showcase-5.mp4', poster: 'poster-5.jpg' },
  { file: 'Screen Recording 2026-10-26 174829.mp4', name: 'ui-interaction-showcase-6.mp4', poster: 'poster-6.jpg' },
];

for (const item of selectedVideos) {
  const src = path.join(vidDir, item.file);
  const dest = path.join(videosDir, item.name);
  const posterDest = path.join(postersDir, item.poster);
  if (fs.existsSync(src)) {
    if (!fs.existsSync(dest)) {
      console.log(`Copying ${item.file} -> ${item.name}`);
      fs.copyFileSync(src, dest);
    }
    if (!fs.existsSync(posterDest)) {
      console.log(`Generating poster for ${item.name}`);
      try {
        execSync(`ffmpeg -y -ss 00:00:01 -i "${dest}" -vframes 1 -q:v 2 "${posterDest}"`, { stdio: 'ignore' });
      } catch (err) {
        console.error(`Failed to generate poster for ${item.name}`, err);
      }
    }
  }
}

console.log('Video assets and posters ready.');
