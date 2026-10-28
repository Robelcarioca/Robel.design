import nodemailer from 'nodemailer';
import fs from 'fs';

const envPath = fs.existsSync('./apps/web/.env') ? './apps/web/.env' : fs.existsSync('.env') ? '.env' : '../apps/web/.env';
const envText = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envText.split('\n')) {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || '';
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1]] = val;
  }
}

async function testSmtp() {
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS?.replace(/\s+/g, '');

  if (!user || !pass) {
    console.log('SMTP credentials not yet filled in apps/web/.env (SMTP_PASS is empty).');
    return;
  }

  console.log(`Connecting to ${env.SMTP_HOST || 'smtp.gmail.com'} as ${user}...`);
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(env.SMTP_PORT) || 465,
    secure: true,
    auth: { user, pass }
  });

  try {
    await transporter.verify();
    console.log('SUCCESS: SMTP connection verified!');

    // Send a test verification email
    const info = await transporter.sendMail({
      from: env.SMTP_FROM || user,
      to: env.MEETING_NOTIFICATION_EMAIL || user,
      subject: '🗓️ Portfolio Scheduler: SMTP Test Email',
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #fafafa; border-radius: 10px;">
          <h2 style="color: #161616;">Portfolio Scheduler Email Integration Verified!</h2>
          <p>Your meeting notification service is connected and ready to send meeting details whenever a client schedules a call.</p>
        </div>
      `
    });

    console.log('SUCCESS: Test email delivered! Message ID:', info.messageId);
  } catch (err) {
    console.error('SMTP verification failed:', err.message);
  }
}

testSmtp();
