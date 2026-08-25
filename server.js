const fs = require('fs'); const path = require('path'); const logStream = fs.createWriteStream(path.join(__dirname, 'public', 'debug.log'), { flags: 'a' }); console.log = function(...args) { logStream.write(args.join(' ') + '\n'); process.stdout.write(args.join(' ') + '\n'); }; console.error = function(...args) { logStream.write('ERROR: ' + args.join(' ') + '\n'); process.stderr.write(args.join(' ') + '\n'); };
process.on('uncaughtException', err => console.error('UNCAUGHT:', err)); process.on('unhandledRejection', err => console.error('UNHANDLED:', err));
const express = require('express');
const cors = require('cors');
const { getTenants, getTenant, upsertTenant, deleteTenant } = require('./database');
const { initializeSession, getSessionStatus, logoutSession } = require('./whatsappManager');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/tenants', async (req, res) => {
    try {
        const tenants = await getTenants();
        const enhancedTenants = tenants.map(t => ({
            ...t,
            status: getSessionStatus(t.id).status
        }));
        res.json(enhancedTenants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tenants', async (req, res) => {
    try {
        const { id, name, api_key, system_prompt, bot_active } = req.body;
        const tenantId = id || require('crypto').randomUUID();
        await upsertTenant({ id: tenantId, name, api_key, system_prompt, bot_active });
        res.json({ id: tenantId, success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/tenants/:id', async (req, res) => {
    try {
        await logoutSession(req.params.id);
        await deleteTenant(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/sessions/start/:id', async (req, res) => {
    try {
        const tenant = await getTenant(req.params.id);
        if (!tenant) return res.status(404).json({ error: "Tenant not found" });
        await initializeSession(req.params.id);
        res.json({ success: true, message: "Initialization started" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/sessions/status/:id', (req, res) => {
    const status = getSessionStatus(req.params.id);
    res.json(status);
});

app.post('/api/sessions/logout/:id', async (req, res) => {
    try {
        await logoutSession(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const restoreSessions = async () => {
    const tenants = await getTenants();
    tenants.forEach(tenant => {
        initializeSession(tenant.id).catch(console.error);
    });
};
restoreSessions();

const PORT = process.env.PORT || 8012;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Multi-Tenant Server running on port ${PORT}`);
});


