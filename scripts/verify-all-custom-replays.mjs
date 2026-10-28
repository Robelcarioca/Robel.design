import puppeteer from 'puppeteer';
import path from 'node:path';

async function verifyAllCustomReplays() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // 1. Verify Location is removed from sidebar
  const sidebarText = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    return aside ? aside.textContent : '';
  });
  const hasLocation = sidebarText.includes('Location') || sidebarText.includes('Addis Ababa');
  console.log('Location present in sidebar?', hasLocation ? 'YES (FAIL)' : 'NO (PASSED - removed!)');
  
  // 2. Check each target video project
  const targetIndices = [8, 13, 14, 20, 27, 31, 32, 36];
  
  for (const idx of targetIndices) {
    // Scroll tile into view
    await page.evaluate((targetIdx) => {
      const tiles = Array.from(document.querySelectorAll('div[role="button"]'));
      const tile = tiles[targetIdx - 1];
      if (tile) {
        tile.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    }, idx);

    // Wait a brief moment for video to initialize and play
    await new Promise(r => setTimeout(r, 1200));

    const videoState = await page.evaluate((targetIdx) => {
      const tiles = Array.from(document.querySelectorAll('div[role="button"]'));
      const tile = tiles[targetIdx - 1];
      const video = tile ? tile.querySelector('video') : null;
      return {
        label: tile ? tile.getAttribute('aria-label') : null,
        src: video ? video.getAttribute('src') : null,
        paused: video ? video.paused : null,
        currentTime: video ? video.currentTime : null,
      };
    }, idx);

    console.log(`Project ${idx}: currentTime = ${videoState.currentTime?.toFixed(2)}s | paused = ${videoState.paused} | label = ${videoState.label}`);
  }

  // Screenshot sidebar without location
  const artifactDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\46558307-f2ec-45f5-8a1f-dbe570640ace';
  const shot1 = path.join(artifactDir, 'sidebar_location_removed.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved screenshot of sidebar:', shot1);

  await browser.close();
  console.log('Verification completed!');
}

verifyAllCustomReplays().catch(err => {
  console.error(err);
  process.exit(1);
});
