import puppeteer from 'puppeteer';
import path from 'node:path';

async function testTouchAndReplay() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Check total project tiles
  const totalTiles = await page.$$eval('[role="button"][aria-label^="View project"]', els => els.length);
  console.log('Total project tiles rendered:', totalTiles);

  // 2. Find first video tile and hover over it
  const videoTile = await page.$('.group video');
  if (videoTile) {
    console.log('Found video element in card!');
    
    // Hover over the card containing the video
    const card = await videoTile.evaluateHandle(el => el.closest('.group'));
    await card.hover();
    console.log('Hovered over video card...');
    
    // Wait 2 seconds to check if video is playing
    await new Promise(r => setTimeout(r, 2000));
    
    const isPlaying = await videoTile.evaluate(v => !v.paused && v.currentTime > 0);
    const currentTime = await videoTile.evaluate(v => v.currentTime);
    console.log(`Video playing on hover: ${isPlaying}, currentTime: ${currentTime.toFixed(2)}s`);

    // Wait another 3.5 seconds to see it loop/replay past 4.5s
    await new Promise(r => setTimeout(r, 3500));
    const replayedTime = await videoTile.evaluate(v => v.currentTime);
    console.log(`Video replayed currentTime: ${replayedTime.toFixed(2)}s (should be reset/replaying)`);
  }

  // Take screenshot of playing state
  const artifactDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\46558307-f2ec-45f5-8a1f-dbe570640ace';
  const shotPath = path.join(artifactDir, 'video_replay_verified.png');
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);

  // 3. Test Touch Interaction on Mobile Viewport
  console.log('\nTesting mobile touch interaction...');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Find a video tile on mobile
  const mobileVideo = await mobilePage.$('.group video');
  if (mobileVideo) {
    const mobileCard = await mobileVideo.evaluateHandle(el => el.closest('.group'));
    
    // Tap the whole video card
    console.log('Tapping video card on mobile...');
    await mobileCard.tap();
    await new Promise(r => setTimeout(r, 2000));

    const mobilePlaying = await mobileVideo.evaluate(v => !v.paused && v.currentTime > 0);
    const mobileCurTime = await mobileVideo.evaluate(v => v.currentTime);
    console.log(`Mobile video playing on touch: ${mobilePlaying}, currentTime: ${mobileCurTime.toFixed(2)}s`);

    const mobileShot = path.join(artifactDir, 'mobile_touch_video_verified.png');
    await mobilePage.screenshot({ path: mobileShot });
    console.log('Saved mobile screenshot:', mobileShot);
  }

  await browser.close();
  console.log('All tests completed successfully!');
}

testTouchAndReplay().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
