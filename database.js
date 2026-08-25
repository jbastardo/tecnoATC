const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT,
        api_key TEXT,
        system_prompt TEXT,
        bot_active INTEGER DEFAULT 0
    )`);
});

const getTenants = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM tenants", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const getTenant = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM tenants WHERE id = ?", [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const upsertTenant = (tenant) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO tenants (id, name, api_key, system_prompt, bot_active) 
                     VALUES (?, ?, ?, ?, ?)
                     ON CONFLICT(id) DO UPDATE SET 
                     name=excluded.name, api_key=excluded.api_key, system_prompt=excluded.system_prompt, bot_active=excluded.bot_active`;
        db.run(sql, [tenant.id, tenant.name, tenant.api_key, tenant.system_prompt, tenant.bot_active !== undefined ? tenant.bot_active : 0], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
};

const deleteTenant = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM tenants WHERE id = ?", [id], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

module.exports = { getTenants, getTenant, upsertTenant, deleteTenant };
