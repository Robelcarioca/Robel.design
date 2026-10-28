import puppeteer from 'puppeteer';
import fs from 'node:fs';

async function checkDrive() {
  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log('Navigating to Google Drive folder...');
  await page.goto('https://drive.google.com/drive/folders/1tA-kV3g8r7HJk_F8UC183Xe2O34ADtNz?usp=sharing', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  const title = await page.title();
  console.log('Page Title:', title);

  // Wait a little for any client JS hydration
  await new Promise(r => setTimeout(r, 4000));

  // Extract all file names and IDs/links
  const data = await page.evaluate(() => {
    const results = [];
    // Drive items usually have data-id or data-target or aria-label
    const nodes = document.querySelectorAll('[data-id], [data-target="doc"], div[role="row"], div[role="gridcell"]');
    nodes.forEach(n => {
      const id = n.getAttribute('data-id');
      const text = n.innerText || n.getAttribute('aria-label');
      if (text || id) {
        results.push({ id, text: (text || '').replace(/\n+/g, ' ').trim() });
      }
    });

    // Also look for links or script tags with drive data
    const links = Array.from(document.querySelectorAll('a[href*="/file/d/"], a[href*="/folders/"]')).map(a => ({
      href: a.href,
      text: a.innerText.trim()
    }));

    return { results: results.slice(0, 100), links };
  });

  console.log('Extracted elements count:', data.results.length);
  console.log('Extracted links count:', data.links.length);
  if (data.links.length > 0) {
    console.log('Sample links:', data.links.slice(0, 10));
  }
  console.log('Sample results:', data.results.slice(0, 20));

  // Take screenshot for debugging if needed
  await page.screenshot({ path: 'gdrive-preview.png' });
  console.log('Saved screenshot to gdrive-preview.png');

  await browser.close();
}

checkDrive().catch(console.error);
