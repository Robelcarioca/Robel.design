import puppeteer from 'puppeteer';

async function extractElayaStyles() {
  const browser = await puppeteer.launch({ 
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true, 
    args: ['--no-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('https://elaya.design/', { waitUntil: 'networkidle2' });

  const data = await page.evaluate(() => {
    const body = document.body;
    const bodyStyle = window.getComputedStyle(body);

    // Get sidebar
    const sidebar = document.querySelector('nav') || document.querySelector('aside') || document.querySelector('[class*=\"sidebar\"]') || document.querySelector('div > div');
    
    // Find all cards
    const cards = Array.from(document.querySelectorAll('img')).map(img => {
      const container = img.closest('a') || img.parentElement?.parentElement || img.parentElement;
      const rect = img.getBoundingClientRect();
      const style = window.getComputedStyle(img);
      return {
        src: img.src,
        w: rect.width,
        h: rect.height,
        objectFit: style.objectFit,
        borderRadius: window.getComputedStyle(container || img).borderRadius,
      };
    });

    return {
      bgColor: bodyStyle.backgroundColor,
      fontFamily: bodyStyle.fontFamily,
      cardsCount: cards.length,
      sampleCards: cards.slice(0, 8),
    };
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
}

extractElayaStyles();
