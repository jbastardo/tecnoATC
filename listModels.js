const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    const res = await pool.query("SELECT api_key FROM tenants WHERE api_key IS NOT NULL LIMIT 1");
    if(res.rows.length === 0) return process.exit(1);
    const key = res.rows[0].api_key;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data.models.map(m => m.name).join(', '));
    process.exit(0);
}
check();
