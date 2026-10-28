const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '../apps/web/.env');
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

const { Client } = require(path.resolve(__dirname, '../packages/db/node_modules/pg'));

async function test() {
  console.log('Testing DIRECT_URL (port 5432)...');
  const client = new Client({
    connectionString: env.DIRECT_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });
  try {
    await client.connect();
    console.log('DIRECT_URL connected successfully!');
    const res = await client.query('SELECT current_database(), now();');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('DIRECT_URL failed:', err.message);
  }
}

test();
