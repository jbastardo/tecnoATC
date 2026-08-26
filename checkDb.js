const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres:hW6z7NaYL6R4pis9xGIWdxKPKXU4ZJrmhrdjvrDJZhpCDOvavS1izt4MDrFtGmc9@lhxtukdhojb4mlhymspk9oh7:5432/postgres' });
client.connect()
  .then(() => client.query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 10'))
  .then(res => { console.log('Messages:', res.rows); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
