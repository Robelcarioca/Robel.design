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
  const { data: settings, error: sErr } = await supabase.from('app_settings').select('*');
  console.log('app_settings:', settings, sErr);
  
  const { data: users, error: uErr } = await supabase.from('user').select('*');
  console.log('users:', users, uErr);
}

run().catch(console.error);
