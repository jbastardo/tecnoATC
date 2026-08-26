const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
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
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255),
                api_key VARCHAR(255),
                system_prompt TEXT,
                bot_active BOOLEAN DEFAULT false
            );
        `);
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                tenant_id VARCHAR(255) REFERENCES tenants(id) ON DELETE CASCADE,
                from_number VARCHAR(100) NOT NULL,
                to_number VARCHAR(100) NOT NULL,
                is_from_me BOOLEAN NOT NULL DEFAULT false,
                body TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Add new columns if they don't exist
        await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_url TEXT;`);
        await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);`);

        await client.query(`
            INSERT INTO users (username, password_hash, role)
            VALUES ('master', '$2b$10$kdQ0.3Nneuj3ZWEG0YaAx.EK86oyowmg0mKskt0MyVwUYW/b6meDy', 'master')
            ON CONFLICT (username) DO UPDATE SET password_hash = '$2b$10$kdQ0.3Nneuj3ZWEG0YaAx.EK86oyowmg0mKskt0MyVwUYW/b6meDy';
        `);
        
        console.log("Database initialized (PostgreSQL)");
    } finally {
        client.release();
    }
};

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
    let userId = null;
    
    if (tenant.username && tenant.password_hash) {
        const userRes = await pool.query(`
            INSERT INTO users (username, password_hash, role) 
            VALUES ($1, $2, 'tenant')
            ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
            RETURNING id
        `, [tenant.username, tenant.password_hash]);
        userId = userRes.rows[0].id;
    }
    
    if (userId) {
        const sql = `
            INSERT INTO tenants (id, user_id, name, api_key, system_prompt, bot_active) 
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET 
            user_id=EXCLUDED.user_id, name=EXCLUDED.name, api_key=EXCLUDED.api_key, system_prompt=EXCLUDED.system_prompt, bot_active=EXCLUDED.bot_active
        `;
        await pool.query(sql, [tenant.id, userId, tenant.name, tenant.api_key, tenant.system_prompt, tenant.bot_active == 1]);
    } else {
        const sql = `
            INSERT INTO tenants (id, name, api_key, system_prompt, bot_active) 
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET 
            name=EXCLUDED.name, api_key=EXCLUDED.api_key, system_prompt=EXCLUDED.system_prompt, bot_active=EXCLUDED.bot_active
        `;
        await pool.query(sql, [tenant.id, tenant.name, tenant.api_key, tenant.system_prompt, tenant.bot_active == 1]);
    }
};

const deleteTenant = async (id) => {
    await pool.query("DELETE FROM tenants WHERE id = $1", [id]);
};

const setBotActive = async (id, isActive) => {
    await pool.query("UPDATE tenants SET bot_active = $1 WHERE id = $2", [isActive, id]);
};

const saveMessage = async (tenantId, fromNumber, toNumber, isFromMe, body, mediaUrl = null, contactName = null) => {
    await pool.query(`
        INSERT INTO messages (tenant_id, from_number, to_number, is_from_me, body, media_url, contact_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [tenantId, fromNumber, toNumber, isFromMe, body, mediaUrl, contactName]);
};

const getMessages = async (tenantId) => {
    const res = await pool.query(`
        SELECT * FROM messages 
        WHERE tenant_id = $1 
        ORDER BY created_at ASC
    `, [tenantId]);
    return res.rows;
};

module.exports = { pool, getTenants, getTenant, upsertTenant, deleteTenant, setBotActive, saveMessage, getMessages };
