import puppeteer from 'puppeteer';
import path from 'node:path';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  const artifactDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\46558307-f2ec-45f5-8a1f-dbe570640ace';
  
  // 1. Top screenshot (Videos first)
  const shot1 = path.join(artifactDir, 'portfolio_top_videos.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved top screenshot (videos):', shot1);
  
  // 2. Scroll to Perfume (#37 and #38) which is right after the 36 videos
  await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('div[role="button"]'));
    // Find perfume tile
    const perfumeTile = tiles.find(t => t.getAttribute('aria-label')?.toLowerCase().includes('perfume') || t.textContent?.toLowerCase().includes('perfume'));
    if (perfumeTile) {
      perfumeTile.scrollIntoView({ behavior: 'instant', block: 'center' });
    } else if (tiles.length >= 37) {
      tiles[36].scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });
  await new Promise(r => setTimeout(r, 2000));
  
  const shot2 = path.join(artifactDir, 'portfolio_perfume_and_rolex.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved Perfume & Rolex screenshot:', shot2);

  // 3. Scroll to the bottom showing all others
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 2000));
  
  const shot3 = path.join(artifactDir, 'portfolio_bottom_others.png');
  await page.screenshot({ path: shot3 });
  console.log('Saved bottom screenshot:', shot3);

  // 4. Click Perfume tile to test lightbox slide navigation
  const clickedPerfume = await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('div[role="button"]'));
    const perfume = tiles.find(t => t.getAttribute('aria-label')?.toLowerCase().includes('perfume') || t.textContent?.toLowerCase().includes('ambre'));
    if (perfume) {
      perfume.click();
      return true;
    }
    return false;
  });

  if (clickedPerfume) {
    await new Promise(r => setTimeout(r, 1000));
    const shot4 = path.join(artifactDir, 'perfume_modal_16_9.png');
    await page.screenshot({ path: shot4 });
    console.log('Saved perfume modal screenshot:', shot4);
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error capturing screenshot:', err);
  process.exit(1);
});
