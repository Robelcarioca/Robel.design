import pg from 'pg';
import fs from 'fs';

// parse apps/web/.env
const envText = fs.readFileSync('./apps/web/.env', 'utf-8');
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

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
});

async function main() {
  await client.connect();
  const settingsRes = await client.query('SELECT "supportEmail", "resendApiKey", "resendFromEmail", "appName" FROM app_settings LIMIT 1');
  console.log('AppSettings row:', settingsRes.rows[0]);
  
  const usersRes = await client.query('SELECT id, email, name, role FROM "user"');
  console.log('Users:', usersRes.rows);
  
  await client.end();
}

main().catch(console.error);
