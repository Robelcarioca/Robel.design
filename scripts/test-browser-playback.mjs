import puppeteer from 'puppeteer';
import fs from 'node:fs';

// Let's test with real Google Drive file IDs
// 1LFC6AT0KpAxgw9S3FlhyT7si0LpRQpkE: Screen Recording 2026-10-13 231952.mp4
// 1dT0jaoa_IopGYZuf29pJQSIi8Kjyp-UG: 714453928405006915.jpg

const testHtml = `
<!DOCTYPE html>
<html>
<head><title>GDrive Media Test</title></head>
<body style="background: #222; color: #fff; font-family: sans-serif;">
  <h1>Google Drive Media Playback Test</h1>
  
  <div style="margin-bottom: 20px;">
    <h3>Image Test (lh3.googleusercontent.com)</h3>
    <img id="test-img" src="https://lh3.googleusercontent.com/d/1dT0jaoa_IopGYZuf29pJQSIi8Kjyp-UG" width="300" />
  </div>

  <div style="margin-bottom: 20px;">
    <h3>Video Direct UC Download Test</h3>
    <video id="test-vid-1" src="https://drive.google.com/uc?export=download&id=1LFC6AT0KpAxgw9S3FlhyT7si0LpRQpkE" width="300" muted autoplay playsinline loop></video>
  </div>

  <div style="margin-bottom: 20px;">
    <h3>Video Usercontent Direct Test</h3>
    <video id="test-vid-2" src="https://drive.usercontent.google.com/download?id=1LFC6AT0KpAxgw9S3FlhyT7si0LpRQpkE&export=download" width="300" muted autoplay playsinline loop></video>
  </div>

  <script>
    window.testResults = { img: false, vid1: false, vid2: false, errors: [] };
    
    const img = document.getElementById('test-img');
    img.onload = () => { window.testResults.img = true; console.log('Image loaded successfully'); };
    img.onerror = (e) => { window.testResults.errors.push('Img error'); console.error('Image error'); };

    const v1 = document.getElementById('test-vid-1');
    v1.oncanplay = () => { window.testResults.vid1 = true; console.log('Vid1 can play'); };
    v1.onerror = (e) => { 
      const err = v1.error ? v1.error.code + ': ' + v1.error.message : 'Unknown';
      window.testResults.errors.push('Vid1 error: ' + err); 
      console.error('Vid1 error', err); 
    };

    const v2 = document.getElementById('test-vid-2');
    v2.oncanplay = () => { window.testResults.vid2 = true; console.log('Vid2 can play'); };
    v2.onerror = (e) => { 
      const err = v2.error ? v2.error.code + ': ' + v2.error.message : 'Unknown';
      window.testResults.errors.push('Vid2 error: ' + err); 
      console.error('Vid2 error', err); 
    };
  </script>
</body>
</html>
`;

fs.writeFileSync('gdrive-browser-test.html', testHtml);

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure()?.errorText));

  console.log('Loading test page...');
  await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/gdrive-browser-test.html');

  // Wait 10 seconds for video buffering/loading
  await new Promise(r => setTimeout(r, 10000));

  const results = await page.evaluate(() => window.testResults);
  console.log('Test Results:', results);

  const videoStats = await page.evaluate(() => {
    const v1 = document.getElementById('test-vid-1');
    const v2 = document.getElementById('test-vid-2');
    return {
      v1: { readyState: v1.readyState, paused: v1.paused, currentTime: v1.currentTime, duration: v1.duration },
      v2: { readyState: v2.readyState, paused: v2.paused, currentTime: v2.currentTime, duration: v2.duration }
    };
  });
  console.log('Video stats:', videoStats);

  await browser.close();
})();
