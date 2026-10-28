import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';

const client = new pg.Client({
  connectionString: 'postgresql://postgres.pyomtbydcmylvtivtfxz:0921Robelgudissa%24@aws-0-eu-west-1.pooler.supabase.com:5432/postgres'
});

try {
  await client.connect();
  const res = await client.query('SELECT id, name, email, role FROM "user"');
  console.log('EXISTING USERS:', res.rows);
  const worksRes = await client.query('SELECT count(*) FROM "works"');
  console.log('WORKS COUNT:', worksRes.rows);
} catch (err) {
  console.error("Query error:", err);
} finally {
  await client.end();
}
