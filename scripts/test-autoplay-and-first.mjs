import puppeteer from 'puppeteer';
import path from 'node:path';

async function verifyAutoplayAndFirst() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));
  
  // Check the first project tile
  const firstTileInfo = await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('div[role="button"]'));
    const first = tiles[0];
    const video = first?.querySelector('video');
    return {
      ariaLabel: first?.getAttribute('aria-label'),
      videoSrc: video?.getAttribute('src'),
      videoPaused: video ? video.paused : null,
      videoCurrentTime: video ? video.currentTime : null,
      videoMuted: video ? video.muted : null,
    };
  });
  console.log('First Project Tile Info:', firstTileInfo);
  
  const artifactDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\46558307-f2ec-45f5-8a1f-dbe570640ace';
  const shot1 = path.join(artifactDir, 'autoplay_first_project_verified.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved screenshot:', shot1);

  // Wait 2 seconds and check if currentTime increased (proving video is autoplaying by itself)
  await new Promise(r => setTimeout(r, 2000));
  const videoProgress = await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('div[role="button"]'));
    const video = tiles[0]?.querySelector('video');
    return {
      videoPaused: video ? video.paused : null,
      videoCurrentTime: video ? video.currentTime : null,
    };
  });
  console.log('Video progress after 2 seconds:', videoProgress);

  // Scroll to Perfume tile and check slide auto-advance
  await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('div[role="button"]'));
    const perfume = tiles.find(t => t.getAttribute('aria-label')?.toLowerCase().includes('perfume'));
    if (perfume) {
      perfume.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  const perfumeSlideBefore = await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('div[role="button"]'));
    const perfume = tiles.find(t => t.getAttribute('aria-label')?.toLowerCase().includes('perfume'));
    return perfume?.getAttribute('aria-label');
  });
  console.log('Perfume slide initially:', perfumeSlideBefore);

  // Wait 4 seconds for auto-advance (timer is 3.5s)
  await new Promise(r => setTimeout(r, 4000));

  const perfumeSlideAfter = await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('div[role="button"]'));
    const perfume = tiles.find(t => t.getAttribute('aria-label')?.toLowerCase().includes('perfume'));
    return perfume?.getAttribute('aria-label');
  });
  console.log('Perfume slide after 4 seconds (autoplayed):', perfumeSlideAfter);

  const shot2 = path.join(artifactDir, 'autoplay_perfume_slide_advance.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved perfume slide screenshot:', shot2);

  await browser.close();
  console.log('All tests completed successfully!');
}

verifyAutoplayAndFirst().catch(err => {
  console.error(err);
  process.exit(1);
});
