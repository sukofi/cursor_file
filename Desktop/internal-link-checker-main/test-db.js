const { Client } = require('pg');
const connectionString = 'postgresql://postgres.qfxglantlskokocgifey:NbNzXKUViH8Got0U@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';

const client = new Client({
  connectionString: connectionString,
});

async function test() {
  try {
    console.log('Connecting to Supabase (Pooler 6543)...');
    await client.connect();
    console.log('Success!');
    const res = await client.query('SELECT NOW()');
    console.log(res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
}

test();
