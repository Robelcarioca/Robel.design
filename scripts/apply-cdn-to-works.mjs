import fs from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(fs.readFileSync('assets-manifest.json', 'utf8'));
const worksTsPath = path.join(process.cwd(), 'apps', 'web', 'src', 'lib', 'actions', 'works.ts');
let worksTs = fs.readFileSync(worksTsPath, 'utf8');

const updatedSeedWorks = manifest.map(item => {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    type: item.type,
    mediaUrl: item.cdnMediaUrl,
    posterUrl: item.cdnPosterUrl,
    images: item.cdnSlideUrls ? JSON.stringify(item.cdnSlideUrls) : null,
    description: item.description,
    sortOrder: item.sortOrder,
    published: true,
  };
});

const startMarker = 'const SEED_WORKS: Omit<WorkItem, "createdAt">[] = ';
const startIdx = worksTs.indexOf(startMarker);
if (startIdx === -1) {
  console.error('Could not find SEED_WORKS marker in works.ts');
  process.exit(1);
}

const equalsIdx = worksTs.indexOf('=', startIdx);
const arrayStart = worksTs.indexOf('[', equalsIdx);
const arrayEnd = worksTs.indexOf('];', arrayStart) + 1;

const newCode = worksTs.slice(0, arrayStart) + JSON.stringify(updatedSeedWorks, null, 2) + worksTs.slice(arrayEnd);
fs.writeFileSync(worksTsPath, newCode, 'utf8');

console.log(`Successfully updated SEED_WORKS in ${worksTsPath} with ${updatedSeedWorks.length} CDN URLs!`);
