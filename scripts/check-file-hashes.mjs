import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dir = path.join(process.cwd(), 'apps', 'web', 'public', 'works');
const files = fs.readdirSync(dir).filter(f => !fs.statSync(path.join(dir, f)).isDirectory());

console.log('Comparing files in works directory:');
const hashes = {};
for (const f of files) {
  const buf = fs.readFileSync(path.join(dir, f));
  const hash = crypto.createHash('md5').update(buf).digest('hex');
  const size = buf.length;
  console.log(`${f.padEnd(45)} | ${String(size).padStart(8)} bytes | ${hash}`);
  if (!hashes[hash]) hashes[hash] = [];
  hashes[hash].push(f);
}

console.log('\nDuplicates found by MD5 hash:');
for (const [hash, fileList] of Object.entries(hashes)) {
  if (fileList.length > 1) {
    console.log(`Hash ${hash}:`, fileList);
  }
}
