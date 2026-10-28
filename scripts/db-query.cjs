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

// require pg from packages/db
const { Client } = require(path.resolve(__dirname, '../packages/db/node_modules/pg'));

async function main() {
  const client = new Client({
    connectionString: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected to Postgres successfully!');
  
  // List all tables
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log('Tables in public schema:', tables.rows.map(r => r.table_name));
  
  // Inspect app_settings
  const appSettings = await client.query('SELECT * FROM app_settings;');
  console.log('app_settings:', appSettings.rows[0]);
  
  // Inspect user
  const users = await client.query('SELECT * FROM "user";');
  console.log('users:', users.rows);
  
  await client.end();
}

main().catch(console.error);
