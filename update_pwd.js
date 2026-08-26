const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => client.query('UPDATE users SET password_hash = $1 WHERE username = $2', ['$2b$10$kdQ0.3Nneuj3ZWEG0YaAx.EK86oyowmg0mKskt0MyVwUYW/b6meDy', 'master']))
  .then(() => { console.log('Updated'); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
