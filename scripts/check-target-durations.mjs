import { execSync } from 'node:child_process';
import path from 'node:path';

const files = [
  { p: 8, f: 'screen-recording-2026-10-16-095652.mp4' },
  { p: 13, f: 'screen-recording-2026-10-20-130856.mp4' },
  { p: 14, f: 'screen-recording-2026-10-20-131050.mp4' },
  { p: 20, f: 'screen-recording-2026-10-24-071718.mp4' },
  { p: 27, f: 'screen-recording-2026-10-26-174829.mp4' },
  { p: 31, f: 'screen-recording-2026-10-19-171910.mp4' },
  { p: 32, f: 'screen-recording-2026-10-20-131910.mp4' },
  { p: 36, f: 'screen-recording-2026-10-23-164057.mp4' },
];

files.forEach(({p, f}) => {
  const full = path.join('apps', 'web', 'public', 'works', 'web-videos', f);
  try {
    const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${full}"`;
    const out = execSync(cmd).toString().trim();
    console.log(`Project ${p} (${f}): duration = ${parseFloat(out).toFixed(1)}s (${(parseFloat(out)/60).toFixed(2)} mins)`);
  } catch (err) {
    console.log(`Error probing ${f}: ${err.message}`);
  }
});
