import fs from 'fs';

const code = fs.readFileSync('c:/Users/HP/Documents/Project/My Portifolio/apps/web/src/lib/actions/works.ts', 'utf-8');
const regex = /"mediaUrl":\s*"([^"]+)"/g;
const urls = [];
let m;
while ((m = regex.exec(code)) !== null) {
  urls.push(m[1]);
}

console.log('Total mediaUrls:', urls.length);
urls.slice(0, 20).forEach((u, i) => console.log(`${i + 1}: ${u}`));

// Check if these files actually exist on disk
let missing = 0;
for (const u of urls) {
  const localPath = 'c:/Users/HP/Documents/Project/My Portifolio/apps/web/public' + decodeURIComponent(u);
  if (!fs.existsSync(localPath)) {
    console.log('MISSING:', u, '->', localPath);
    missing++;
  }
}
console.log('Total missing files:', missing);
