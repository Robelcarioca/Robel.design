import puppeteer from 'puppeteer';
import fs from 'node:fs';

async function crawl() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  async function getFolderItems(folderUrl, folderName = 'root') {
    console.log(`Loading folder "${folderName}" (${folderUrl})...`);
    await page.goto(folderUrl, { waitUntil: 'networkidle2', timeout: 45000 });
    
    // Scroll down multiple times to load lazy items
    for (let i = 0; i < 15; i++) {
      await page.evaluate(() => {
        const scrollables = Array.from(document.querySelectorAll('div[role="main"], div[role="region"], div[data-target]'));
        window.scrollBy(0, 1000);
        scrollables.forEach(s => s.scrollTop += 1500);
      });
      await new Promise(r => setTimeout(r, 600));
    }

    const items = await page.evaluate(() => {
      const map = new Map();
      const rows = document.querySelectorAll('div[data-id], div[role="row"], div[data-target="doc"]');
      rows.forEach(r => {
        const id = r.getAttribute('data-id');
        // Look for file name
        const text = r.innerText || '';
        const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
        const aria = r.getAttribute('aria-label') || '';
        
        let name = '';
        if (aria) {
          // aria might be "Screen Recording 2026-10-13 231952.mp4 ..."
          name = aria.split(' ')[0];
        }
        for (const line of lines) {
          if (line.endsWith('.mp4') || line.endsWith('.jpg') || line.endsWith('.png') || line.endsWith('.jpeg')) {
            name = line;
            break;
          }
        }
        if (!name && lines.length > 0) {
          name = lines[0];
        }

        if (id && name) {
          if (!map.has(id) || map.get(id).name.length < name.length) {
            map.set(id, { id, name, text: lines.join(' | ') });
          }
        }
      });
      return Array.from(map.values());
    });

    return items;
  }

  const rootItems = await getFolderItems('https://drive.google.com/drive/folders/1tA-kV3g8r7HJk_F8UC183Xe2O34ADtNz?usp=sharing', 'root');
  console.log(`Root found ${rootItems.length} items`);

  const perfumeItems = await getFolderItems('https://drive.google.com/drive/folders/1azYqJDSChIA6GAi0iHbBYbqubaqdRnRv?usp=sharing', 'Perfume');
  console.log(`Perfume found ${perfumeItems.length} items`);

  const rolexItems = await getFolderItems('https://drive.google.com/drive/folders/18JO9noqQG6XjKJKsAh8dTyCduFdXboIB?usp=sharing', 'Rolex');
  console.log(`Rolex found ${rolexItems.length} items`);

  const watchItems = await getFolderItems('https://drive.google.com/drive/folders/1OCjInLZa68jyAOMoAcwQhyL66acdXzHq?usp=sharing', 'Watch');
  console.log(`Watch found ${watchItems.length} items`);

  fs.writeFileSync('gdrive-manifest.json', JSON.stringify({ 
    root: rootItems,
    Perfume: perfumeItems,
    Rolex: rolexItems,
    Watch: watchItems
  }, null, 2));
  console.log('Saved to gdrive-manifest.json');
  await browser.close();
}

crawl().catch(console.error);
