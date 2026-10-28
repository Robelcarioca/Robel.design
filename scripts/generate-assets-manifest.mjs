import fs from 'node:fs';
import path from 'node:path';

const gdrive = JSON.parse(fs.readFileSync('gdrive-manifest.json', 'utf8'));
const storageUrls = JSON.parse(fs.readFileSync('storage-urls.json', 'utf8'));

// Read SEED_WORKS from works.ts
const worksTs = fs.readFileSync(path.join(process.cwd(), 'apps', 'web', 'src', 'lib', 'actions', 'works.ts'), 'utf8');
const startIdx = worksTs.indexOf('const SEED_WORKS:');
const equalsIdx = worksTs.indexOf('=', startIdx);
const arrayStart = worksTs.indexOf('[', equalsIdx);
const arrayEnd = worksTs.indexOf('];', arrayStart) + 1;
const seedWorks = JSON.parse(worksTs.slice(arrayStart, arrayEnd));

console.log(`Processing ${seedWorks.length} seed works...`);

// Build quick lookup for gdrive items
const gdriveMap = new Map();
gdrive.root.forEach(i => gdriveMap.set(i.name.toLowerCase(), i));
if (gdrive.Perfume) gdrive.Perfume.forEach(i => gdriveMap.set('perfume/' + i.name.toLowerCase(), i));
if (gdrive.Rolex) gdrive.Rolex.forEach(i => gdriveMap.set('rolex/' + i.name.toLowerCase(), i));
if (gdrive.Watch) gdrive.Watch.forEach(i => gdriveMap.set('watch/' + i.name.toLowerCase(), i));

// Manual mappings for named works
const specialGdriveMap = {
  'kickoff-football-web.jpg': 'photo_2026-10-23_18-03-29.jpg',
  'nexora-saas-platform.jpg': 'photo_2026-10-23_18-03-53.jpg',
  'mouse-instagram-post.png': 'mouse-instagram-post(1).png',
  'orla-luxury-furniture.jpg': 'ORLA — Quiet Luxury Furniture Website Concept.jpg',
  'amazon-maven-lane.jpg': 'Amazon PA+ Maven Lane.jpg',
  'minimalist-website-template.jpg': 'Minimalist Website Template – Clean, Bold, & Fully Responsive.jpg',
  'brand-identity-cover.png': 'Cover.png',
};

const manifest = [];

for (const work of seedWorks) {
  const localMedia = work.mediaUrl;
  const localPoster = work.posterUrl;
  const mediaBasename = path.basename(localMedia);

  // 1. Resolve CDN URL
  const storageKey = localMedia.startsWith('/') ? localMedia.slice(1) : localMedia;
  const cdnUrl = storageUrls[storageKey] || localMedia;

  // 2. Resolve Poster CDN URL
  let posterCdnUrl = null;
  if (localPoster) {
    const posterStorageKey = localPoster.startsWith('/') ? localPoster.slice(1) : localPoster;
    posterCdnUrl = storageUrls[posterStorageKey] || localPoster;
  }

  // 3. Resolve Slides CDN URLs
  let slideCdnUrls = null;
  if (work.images) {
    try {
      const parsed = JSON.parse(work.images);
      slideCdnUrls = parsed.map(img => {
        const k = img.startsWith('/') ? img.slice(1) : img;
        return storageUrls[k] || img;
      });
    } catch {}
  }

  // 4. Resolve Google Drive mapping
  let gdriveItem = null;
  const lowerBase = mediaBasename.toLowerCase();

  if (specialGdriveMap[mediaBasename]) {
    gdriveItem = gdriveMap.get(specialGdriveMap[mediaBasename].toLowerCase());
  } else if (localMedia.includes('Perfume')) {
    gdriveItem = gdriveMap.get('perfume/' + lowerBase);
  } else if (localMedia.includes('Rolex')) {
    gdriveItem = gdriveMap.get('rolex/' + lowerBase);
  } else if (localMedia.includes('Watch')) {
    gdriveItem = gdriveMap.get('watch/' + lowerBase);
  } else {
    gdriveItem = gdriveMap.get(lowerBase);
    if (!gdriveItem && lowerBase.startsWith('screen-recording-')) {
      const converted = lowerBase
        .replace('screen-recording-', 'screen recording ')
        .replace(/(\d{4}-\d{2}-\d{2})-(\d{2})(\d{2})(\d{2})/, '$1 $2$3$4');
      gdriveItem = gdriveMap.get(converted);
    }
  }

  manifest.push({
    id: work.id,
    title: work.title,
    category: work.category,
    type: work.type,
    sortOrder: work.sortOrder,
    description: work.description,
    localMediaUrl: work.mediaUrl,
    localPosterUrl: work.posterUrl,
    cdnMediaUrl: cdnUrl,
    cdnPosterUrl: posterCdnUrl,
    cdnSlideUrls: slideCdnUrls,
    googleDrive: gdriveItem ? {
      fileId: gdriveItem.id,
      fileName: gdriveItem.name,
      viewUrl: `https://drive.google.com/file/d/${gdriveItem.id}/view`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${gdriveItem.id}`,
      cdnImageUrl: work.type === 'image' ? `https://lh3.googleusercontent.com/d/${gdriveItem.id}` : null,
    } : null,
  });
}

const outputPath = path.join(process.cwd(), 'apps', 'web', 'src', 'data', 'assets-manifest.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
fs.writeFileSync('assets-manifest.json', JSON.stringify(manifest, null, 2));

console.log(`Generated manifest for ${manifest.length} works!`);
const withGdrive = manifest.filter(m => m.googleDrive !== null).length;
console.log(`Google Drive mapped: ${withGdrive} / ${manifest.length}`);
