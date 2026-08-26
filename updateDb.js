const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/database.js', 'utf8');

// 1. Alter table in initDB
const createTableMessages = `CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                tenant_id VARCHAR(255) REFERENCES tenants(id) ON DELETE CASCADE,
                from_number VARCHAR(100) NOT NULL,
                to_number VARCHAR(100) NOT NULL,
                is_from_me BOOLEAN NOT NULL DEFAULT false,
                body TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`;
const alterTable = `CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                tenant_id VARCHAR(255) REFERENCES tenants(id) ON DELETE CASCADE,
                from_number VARCHAR(100) NOT NULL,
                to_number VARCHAR(100) NOT NULL,
                is_from_me BOOLEAN NOT NULL DEFAULT false,
                body TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        \`);
        
        // Add new columns if they don't exist
        await client.query(\`ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_url TEXT;\`);
        await client.query(\`ALTER TABLE messages ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);\`);

        await client.query(\``;

content = content.replace(createTableMessages + "\n        `);\n\n        await client.query(`", alterTable);

// 2. Modify saveMessage
const oldSaveMessage = `const saveMessage = async (tenantId, fromNumber, toNumber, isFromMe, body) => {
    await pool.query(\`
        INSERT INTO messages (tenant_id, from_number, to_number, is_from_me, body)
        VALUES ($1, $2, $3, $4, $5)
    \`, [tenantId, fromNumber, toNumber, isFromMe, body]);
};`;

const newSaveMessage = `const saveMessage = async (tenantId, fromNumber, toNumber, isFromMe, body, mediaUrl = null, contactName = null) => {
    await pool.query(\`
        INSERT INTO messages (tenant_id, from_number, to_number, is_from_me, body, media_url, contact_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    \`, [tenantId, fromNumber, toNumber, isFromMe, body, mediaUrl, contactName]);
};`;

content = content.replace(oldSaveMessage, newSaveMessage);

fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/database.js', content, 'utf8');
console.log('database.js updated');
