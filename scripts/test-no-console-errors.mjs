import puppeteer from 'puppeteer';

async function testNoConsoleErrors() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[Console Error] ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    errors.push(`[Page Error] ${err.message}`);
  });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // Scroll through the page to render all tiles and trigger any useEffects
  await page.evaluate(async () => {
    window.scrollBy(0, 1000);
    await new Promise(r => setTimeout(r, 1000));
    window.scrollBy(0, 1000);
    await new Promise(r => setTimeout(r, 1000));
  });

  await new Promise(r => setTimeout(r, 2000));

  console.log(`\nFound ${errors.length} errors:`);
  errors.forEach(e => console.error(e));

  await browser.close();

  if (errors.length === 0) {
    console.log('PASSED: Clean run, zero console errors!');
    process.exit(0);
  } else {
    console.log('FAILED: Errors detected.');
    process.exit(1);
  }
}

testNoConsoleErrors().catch(err => {
  console.error(err);
  process.exit(1);
});
