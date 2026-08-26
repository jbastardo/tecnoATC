const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'messages';
  `))
  .then(res => { console.log('Messages Schema:', res.rows); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
