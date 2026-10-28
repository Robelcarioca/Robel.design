import { execSync } from 'node:child_process';
import path from 'node:path';

const p14 = path.join('apps', 'web', 'public', 'works', 'web-videos', 'screen-recording-2026-10-20-131050.mp4');
execSync(`ffmpeg -ss 00:00:05 -i "${p14}" -frames:v 1 -q:v 2 test_p14_5s.jpg -y`);
execSync(`ffmpeg -ss 00:00:07 -i "${p14}" -frames:v 1 -q:v 2 test_p14_7s.jpg -y`);
console.log('Extracted frames for p14');
