import puppeteer from 'puppeteer';

async function inspectElaya() {
  const browser = await puppeteer.launch({ 
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true, 
    args: ['--no-sandbox'] 
  });
  const page = await browser.newPage();
  await page.goto('https://elaya.design/', { waitUntil: 'networkidle2' });
  const data = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).map(i => ({ 
      src: i.src, 
      alt: i.alt,
      w: i.naturalWidth, 
      h: i.naturalHeight 
    }));
    const vids = Array.from(document.querySelectorAll('video')).map(v => ({ 
      src: v.src, 
      poster: v.poster,
      autoplay: v.autoplay,
      loop: v.loop
    }));
    return {
      totalImgs: imgs.length,
      sampleImgs: imgs,
      totalVids: vids.length,
      vids: vids
    };
  });
  console.log('Total images on elaya:', data.totalImgs);
  console.log('Total videos on elaya:', data.totalVids);
  console.log('Videos:', data.vids);
  console.log('Sample images:', data.sampleImgs.slice(0, 8));
  await browser.close();
}

inspectElaya();
