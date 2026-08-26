const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:hW6z7NaYL6R4pis9xGlWdxKPKXU4ZJrmhrdjvrDJZhpCDOvavS1izt4MDrFtGmc9@192.168.1.32:5535/postgres'
});

const initDB = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'tenant'
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS tenants (
                id VARCHAR(255) PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                name VARCHAR(255),
                api_key VARCHAR(255),
                system_prompt TEXT,
                bot_active BOOLEAN DEFAULT false
            );
        `);
        
        await client.query(`
            INSERT INTO users (username, password_hash, role)
            VALUES ('master', '$2b$10$L2v6mK8FhI2U8B9.K7N/Y.H4lX2H2Qk2x9D5qU6jL3P3U5P3U5P3U', 'master')
            ON CONFLICT (username) DO NOTHING;
        `);
        
        console.log("Database initialized (PostgreSQL)");
    } finally {
        client.release();
    }
};

// Don't crash if no DB URL locally, let it be handled when deployed
if (process.env.DATABASE_URL) {
    initDB().catch(err => console.error("DB Init Error:", err));
}

const getTenants = async () => {
    const res = await pool.query("SELECT * FROM tenants");
    return res.rows.map(row => ({...row, bot_active: row.bot_active ? 1 : 0}));
};

const getTenant = async (id) => {
    const res = await pool.query("SELECT * FROM tenants WHERE id = $1", [id]);
    if (res.rows.length === 0) return null;
    return {...res.rows[0], bot_active: res.rows[0].bot_active ? 1 : 0};
};

const upsertTenant = async (tenant) => {
    const sql = `
        INSERT INTO tenants (id, name, api_key, system_prompt, bot_active) 
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET 
        name=EXCLUDED.name, api_key=EXCLUDED.api_key, system_prompt=EXCLUDED.system_prompt, bot_active=EXCLUDED.bot_active
    `;
    await pool.query(sql, [tenant.id, tenant.name, tenant.api_key, tenant.system_prompt, tenant.bot_active == 1]);
};

const deleteTenant = async (id) => {
    await pool.query("DELETE FROM tenants WHERE id = $1", [id]);
};

module.exports = { pool, getTenants, getTenant, upsertTenant, deleteTenant };

