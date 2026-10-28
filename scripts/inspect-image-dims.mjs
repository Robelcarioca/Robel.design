import fs from 'node:fs';
import path from 'node:path';

// Quick pure-JS image dimension reader
function getDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    // PNG
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    return { width, height, format: 'PNG' };
  } else if (buf[0] === 0xff && buf[1] === 0xd8) {
    // JPEG
    let offset = 2;
    while (offset < buf.length) {
      if (buf[offset] !== 0xff) break;
      const marker = buf[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        const height = buf.readUInt16BE(offset + 5);
        const width = buf.readUInt16BE(offset + 7);
        return { width, height, format: 'JPEG' };
      }
      const len = buf.readUInt16BE(offset + 2);
      offset += 2 + len;
    }
  }
  return { width: null, height: null, format: 'unknown' };
}

const worksDir = path.join(process.cwd(), 'apps', 'web', 'public', 'works');
const walk = (d) => {
  const entries = fs.readdirSync(d, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'videos' && e.name !== 'web-videos' && e.name !== 'posters') {
        walk(full);
      }
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(e.name)) {
      const rel = path.relative(worksDir, full);
      const dims = getDimensions(full);
      const ratio = dims.width && dims.height ? (dims.width / dims.height).toFixed(2) : 'N/A';
      console.log(`${rel.padEnd(40)} | ${dims.width}x${dims.height} | aspect: ${ratio}`);
    }
  }
};

walk(worksDir);
