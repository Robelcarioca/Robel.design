import fs from 'node:fs';
import path from 'node:path';

const gdrive = JSON.parse(fs.readFileSync('gdrive-manifest.json', 'utf8'));

console.log('=== Google Drive Manifest Summary ===');
console.log('Root items:', gdrive.root.length);
console.log('Perfume items:', gdrive.Perfume?.length || 0);
console.log('Rolex items:', gdrive.Rolex?.length || 0);
console.log('Watch items:', gdrive.Watch?.length || 0);

// Check Vid directory
const vidDir = path.join(process.cwd(), 'Vid');
const vidFiles = fs.existsSync(vidDir) ? fs.readdirSync(vidDir) : [];
console.log('\n=== Local Vid Folder ===');
console.log('Total files/dirs in Vid:', vidFiles.length);

// Check works.ts SEED_WORKS
const worksTs = fs.readFileSync(path.join(process.cwd(), 'apps', 'web', 'src', 'lib', 'actions', 'works.ts'), 'utf8');
const seedMatch = worksTs.match(/const SEED_WORKS: Omit<WorkItem, "createdAt">\[] = (\[[\s\S]*?\]);/);
let seedWorks = [];
if (seedMatch) {
  try {
    seedWorks = JSON.parse(seedMatch[1]);
  } catch (e) {
    console.error('Error parsing SEED_WORKS:', e.message);
  }
}
console.log('\n=== SEED_WORKS in works.ts ===');
console.log('Total seed works:', seedWorks.length);

// Compare files
const gdriveFileMap = new Map();
gdrive.root.forEach(item => gdriveFileMap.set(item.name.toLowerCase(), item));
if (gdrive.Perfume) gdrive.Perfume.forEach(item => gdriveFileMap.set('perfume/' + item.name.toLowerCase(), item));
if (gdrive.Rolex) gdrive.Rolex.forEach(item => gdriveFileMap.set('rolex/' + item.name.toLowerCase(), item));
if (gdrive.Watch) gdrive.Watch.forEach(item => gdriveFileMap.set('watch/' + item.name.toLowerCase(), item));

console.log('\n=== Matching SEED_WORKS to Google Drive files ===');
let matchedCount = 0;
let unmatchedList = [];

for (const work of seedWorks) {
  const mediaBasename = path.basename(work.mediaUrl).toLowerCase();
  // Try matching directly
  let gItem = gdriveFileMap.get(mediaBasename);
  
  // Try matching if mediaUrl is a screen-recording with hyphens instead of spaces
  if (!gItem && mediaBasename.startsWith('screen-recording-')) {
    // e.g. screen-recording-2026-10-13-231952.mp4 -> Screen Recording 2026-10-13 231952.mp4
    const converted = mediaBasename
      .replace('screen-recording-', 'screen recording ')
      .replace(/(\d{4}-\d{2}-\d{2})-(\d{2})(\d{2})(\d{2})/, '$1 $2$3$4');
    gItem = gdriveFileMap.get(converted);
  }

  // Try subfolders
  if (!gItem && work.mediaUrl.toLowerCase().includes('perfume')) {
    gItem = gdriveFileMap.get('perfume/' + mediaBasename);
  }
  if (!gItem && work.mediaUrl.toLowerCase().includes('rolex')) {
    gItem = gdriveFileMap.get('rolex/' + mediaBasename);
  }
  if (!gItem && work.mediaUrl.toLowerCase().includes('watch')) {
    gItem = gdriveFileMap.get('watch/' + mediaBasename);
  }

  if (gItem) {
    matchedCount++;
  } else {
    unmatchedList.push({ id: work.id, title: work.title, mediaUrl: work.mediaUrl });
  }
}

console.log(`Matched: ${matchedCount} / ${seedWorks.length}`);
if (unmatchedList.length > 0) {
  console.log('Unmatched items:');
  unmatchedList.forEach(u => console.log(` - [${u.id}] ${u.mediaUrl} (${u.title})`));
}
