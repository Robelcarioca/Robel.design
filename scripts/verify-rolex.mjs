import puppeteer from 'puppeteer';
import path from 'node:path';

async function verifyRolexModal() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // Find Rolex tile and click it
  const clicked = await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('div[role="button"]'));
    const rolex = tiles.find(t => t.getAttribute('aria-label')?.toLowerCase().includes('rolex') || t.textContent?.toLowerCase().includes('rolex'));
    if (rolex) {
      rolex.click();
      return true;
    }
    return false;
  });

  console.log('Rolex tile clicked:', clicked);
  if (clicked) {
    await new Promise(r => setTimeout(r, 1000));
    const artifactDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\46558307-f2ec-45f5-8a1f-dbe570640ace';
    const shot = path.join(artifactDir, 'rolex_modal_16_9.png');
    await page.screenshot({ path: shot });
    console.log('Saved rolex modal screenshot:', shot);
    
    // Press ArrowRight to test keyboard navigation to slide 2
    await page.keyboard.press('ArrowRight');
    await new Promise(r => setTimeout(r, 800));
    const shotSlide2 = path.join(artifactDir, 'rolex_modal_slide_2.png');
    await page.screenshot({ path: shotSlide2 });
    console.log('Saved rolex modal slide 2 screenshot:', shotSlide2);
  }
  await browser.close();
  console.log('Verification done!');
}

verifyRolexModal().catch(err => {
  console.error(err);
  process.exit(1);
});
