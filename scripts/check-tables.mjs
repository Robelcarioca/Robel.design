import { createClient } from '../apps/web/node_modules/@supabase/supabase-js/dist/index.mjs';
import fs from 'fs';

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

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const candidates = [
    'feedback',
    'notification',
    'notification_recipient',
    'waitlist_entry',
    'user',
    'session',
    'app_settings',
    'post',
    'works'
  ];
  
  for (const table of candidates) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    console.log(`Table '${table}':`, error ? error.message : 'AVAILABLE');
  }
}

run().catch(console.error);
