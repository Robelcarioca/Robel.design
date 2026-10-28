import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), 'apps', 'web', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'uploads';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const mimeTypes = {
  '.mp4': 'video/mp4',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

async function uploadFile(localPath, storagePath) {
  const ext = path.extname(localPath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  const buffer = fs.readFileSync(localPath);

  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: buffer,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed to upload ${storagePath}: ${res.status} ${text}`);
    return null;
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
  return publicUrl;
}

async function syncAll() {
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public', 'works');
  const uploadList = [];

  function collectFiles(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip the raw uncompressed videos folder! We only upload the web-optimized videos
        if (entry.name === 'videos') continue;
        collectFiles(fullPath, `${prefix}${entry.name}/`);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.mp4', '.jpg', '.jpeg', '.png'].includes(ext)) {
          uploadList.push({
            localPath: fullPath,
            storagePath: `works/${prefix}${entry.name}`,
          });
        }
      }
    }
  }

  collectFiles(publicDir);
  console.log(`Found ${uploadList.length} files to sync to Supabase Storage (${BUCKET})...`);

  const results = {};
  let completed = 0;

  // Upload in chunks of 5 concurrently
  const chunkSize = 5;
  for (let i = 0; i < uploadList.length; i += chunkSize) {
    const chunk = uploadList.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (item) => {
        const publicUrl = await uploadFile(item.localPath, item.storagePath);
        if (publicUrl) {
          results[item.storagePath] = publicUrl;
          completed++;
          process.stdout.write(`\rProgress: ${completed} / ${uploadList.length} (${Math.round(completed/uploadList.length*100)}%)`);
        }
      })
    );
  }

  console.log('\nAll assets uploaded successfully to Supabase Storage!');
  fs.writeFileSync('storage-urls.json', JSON.stringify(results, null, 2));
  console.log('Saved mapping to storage-urls.json');
}

syncAll().catch(console.error);
