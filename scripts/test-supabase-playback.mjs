import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const testUrl = 'https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/test-video.mp4';
  
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('requestfailed', req => console.log('FAILED:', req.url(), req.failure()?.errorText));

  await page.goto('about:blank');
  await page.setContent(`
    <!DOCTYPE html>
    <html><body>
      <video id="v" src="${testUrl}" autoplay muted loop playsinline width="400"></video>
      <script>
        window.videoPlayed = false;
        const v = document.getElementById('v');
        v.addEventListener('playing', () => { window.videoPlayed = true; console.log('Playing!'); });
        v.addEventListener('error', (e) => { window.videoError = v.error ? v.error.message : 'error'; console.error('Error!', v.error); });
      </script>
    </body></html>
  `);

  await new Promise(r => setTimeout(r, 4000));
  const res = await page.evaluate(() => ({
    played: window.videoPlayed,
    error: window.videoError,
    currentTime: document.getElementById('v').currentTime
  }));
  console.log('Browser playback evaluation:', res);
  await browser.close();
})();
