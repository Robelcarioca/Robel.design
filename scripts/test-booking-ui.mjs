import puppeteer from 'puppeteer';

async function testFullBrowserBooking() {
  console.log('Starting full browser end-to-end booking test...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('[Fast Refresh]')) {
      console.log('BROWSER CONSOLE:', text);
    }
  });
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure()?.errorText));

  try {
    console.log('Navigating to http://localhost:3001 (timeout: 60s)...');
    await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 60000 });

    console.log('Finding and clicking "Book a call" button...');
    await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      return btns.some(b => b.textContent && b.textContent.includes('Book a call'));
    }, { timeout: 15000 });

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('Book a call'));
      if (btn) btn.click();
    });

    // Wait for the scheduler to mount
    console.log('Waiting for Cal.com scheduler...');
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('15 Min Meeting');
    }, { timeout: 15000 });

    // Select slot "08:00"
    console.log('Selecting slot "08:00"...');
    await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent && b.textContent.includes('08:00'));
    }, { timeout: 10000 });

    const slotButtons = await page.$$('button');
    let clicked = false;
    for (const btn of slotButtons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text && text.includes('08:00')) {
        await btn.click();
        console.log(`Clicked slot button: "${text}"`);
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      throw new Error('Slot button "08:00" not found');
    }

    // Wait for form step
    console.log('Waiting for booking form fields...');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });

    // Fill in visitor details
    const visitorName = 'Elena Rostova';
    const visitorEmail = 'robelgudissa0000@gmail.com';
    const visitorNotes = 'Discussion on interactive 3D portfolio components, mobile UX redesign, and brand design tokens.';

    console.log(`Typing name: ${visitorName}...`);
    await page.type('input[type="text"]', visitorName);

    console.log(`Typing email: ${visitorEmail}...`);
    await page.type('input[type="email"]', visitorEmail);

    const textarea = await page.$('textarea');
    if (textarea) {
      console.log('Typing notes/project goals...');
      await textarea.type(visitorNotes);
    }

    // Submit the form
    console.log('Clicking submit button...');
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.click();
      }
    });

    // Check DOM periodically for 10 seconds
    for (let i = 1; i <= 10; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const status = await page.evaluate(() => {
        const h3 = document.querySelector('h3');
        const err = document.querySelector('.bg-red-50\\/90');
        const submitBtn = document.querySelector('button[type="submit"]');
        return {
          h3: h3?.innerText,
          error: err?.innerText,
          buttonText: submitBtn?.innerText
        };
      });
      console.log(`Status at ${i}s:`, status);
      if (status.h3 && status.h3.includes('Meeting Confirmed!')) {
        console.log('SUCCESS: Meeting Confirmed screen reached at', i, 'seconds!');
        break;
      }
    }

    await page.screenshot({ path: 'scripts/booking-current-state.png' });
    console.log('Saved screenshot to scripts/booking-current-state.png');

  } catch (err) {
    console.error('Test execution error:', err.message);
  } finally {
    await browser.close();
  }
}

testFullBrowserBooking();
