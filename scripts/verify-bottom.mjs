import puppeteer from 'puppeteer';
import path from 'node:path';

async function captureBottom() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Scroll to bottom of works section
  await page.evaluate(() => {
    const el = document.getElementById('pricing') || document.body;
    el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 1500));
  
  const artifactDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\46558307-f2ec-45f5-8a1f-dbe570640ace';
  const shot = path.join(artifactDir, 'bottom_works_verified.png');
  await page.screenshot({ path: shot });
  console.log('Saved bottom screenshot:', shot);
  await browser.close();
}

captureBottom();
