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

async function check() {
  const { data, error } = await supabase
    .from('feedback')
    .select('id, category, message, status, adminNote, createdAt')
    .order('createdAt', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error querying feedback:', error.message);
  } else {
    console.log('Latest bookings found in database:');
    for (const row of data) {
      console.log('---');
      console.log('ID:', row.id);
      console.log('Category:', row.category);
      console.log('AdminNote:', row.adminNote);
      console.log('Message parsed:', JSON.parse(row.message));
      console.log('Created At:', row.createdAt);
    }
  }
}

check().catch(console.error);
