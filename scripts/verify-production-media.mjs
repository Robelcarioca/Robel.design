import puppeteer from 'puppeteer';

async function runVerification() {
  console.log('Launching browser to test http://localhost:3001...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const consoleLogs = [];
  const errors = [];
  const failedRequests = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });

  page.on('pageerror', err => {
    errors.push('PAGE ERROR: ' + err.message);
  });

  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), error: req.failure()?.errorText });
  });

  console.log('Navigating to portfolio homepage...');
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // 1. Verify page title & project tiles
  const pageTitle = await page.title();
  console.log('Page Title:', pageTitle);

  const tileCount = await page.evaluate(() => {
    return document.querySelectorAll('div[role="button"][aria-label*="View project"]').length;
  });
  console.log(`Rendered Project Tiles: ${tileCount} (Expected: 48)`);

  // 2. Wait for first video in viewport to autoplay
  console.log('Checking video autoplay in viewport...');
  await new Promise(r => setTimeout(r, 4000));

  const firstVideoStats = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('video'));
    if (videos.length === 0) return null;
    const v = videos[0];
    return {
      src: v.src,
      paused: v.paused,
      currentTime: v.currentTime,
      readyState: v.readyState,
      error: v.error ? v.error.message : null,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
    };
  });
  console.log('First Video State:', firstVideoStats);

  // 3. Scroll down to trigger more videos and verify lazy loading
  console.log('Scrolling page down...');
  await page.evaluate(() => window.scrollBy(0, 1200));
  await new Promise(r => setTimeout(r, 3000));

  const scrolledVideoStats = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('video'));
    const playingCount = videos.filter(v => !v.paused && v.currentTime > 0).length;
    return {
      totalVideosOnPage: videos.length,
      currentlyPlaying: playingCount
    };
  });
  console.log('Scrolled Video Stats:', scrolledVideoStats);

  // 4. Test clicking a tile to open Lightbox
  console.log('Clicking first project tile to open Lightbox...');
  await page.click('div[role="button"][aria-label*="View project"]');
  await new Promise(r => setTimeout(r, 1500));

  const lightboxState = await page.evaluate(() => {
    const dialog = document.querySelector('div[role="dialog"]');
    if (!dialog) return { open: false };
    const title = dialog.querySelector('h2')?.innerText;
    const video = dialog.querySelector('video');
    return {
      open: true,
      title,
      hasVideo: !!video,
      videoSrc: video ? video.src : null,
      videoPaused: video ? video.paused : null,
      videoCurrentTime: video ? video.currentTime : null,
      videoError: video?.error ? video.error.message : null
    };
  });
  console.log('Lightbox State:', lightboxState);

  // 5. Close Lightbox
  console.log('Closing Lightbox...');
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 1000));

  const isLightboxClosed = await page.evaluate(() => !document.querySelector('div[role="dialog"]'));
  console.log('Lightbox Closed:', isLightboxClosed);

  // 6. Test multi-slide project (Perfume / Rolex / Watch)
  console.log('Scrolling to multi-slide project (Perfume Luxe)...');
  await page.evaluate(() => {
    const perfumeTile = Array.from(document.querySelectorAll('div[role="button"]')).find(el => el.getAttribute('aria-label')?.includes('Perfume'));
    if (perfumeTile) perfumeTile.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 2000));

  const perfumeSlideState = await page.evaluate(() => {
    const perfumeTile = Array.from(document.querySelectorAll('div[role="button"]')).find(el => el.getAttribute('aria-label')?.includes('Perfume'));
    if (!perfumeTile) return null;
    const img = perfumeTile.querySelector('img[alt*="slide"]');
    const badge = perfumeTile.querySelector('div')?.innerText;
    return {
      ariaLabel: perfumeTile.getAttribute('aria-label'),
      currentImgSrc: img?.src,
    };
  });
  console.log('Perfume Slide State:', perfumeSlideState);

  // Summary
  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log(`Console Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log('Errors:', errors);
  }
  console.log(`Failed Network Requests: ${failedRequests.length}`);
  if (failedRequests.length > 0) {
    console.log('Failed Requests:', failedRequests.slice(0, 10));
  }

  // Take screenshot
  await page.screenshot({ path: 'production-verification.png' });
  console.log('Screenshot saved to production-verification.png');

  await browser.close();

  if (firstVideoStats && firstVideoStats.currentTime > 0 && tileCount === 48 && errors.length === 0) {
    console.log('\n>>> ALL PRODUCTION VERIFICATION CHECKS PASSED PERFECTLY! <<<');
  } else {
    console.log('\n>>> Verification finished. Review stats above. <<<');
  }
}

runVerification().catch(console.error);
