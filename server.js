const fs = require('fs'); const path = require('path'); const logStream = fs.createWriteStream(path.join(__dirname, 'public', 'debug.log'), { flags: 'a' }); console.log = function(...args) { logStream.write(args.join(' ') + '\n'); process.stdout.write(args.join(' ') + '\n'); }; console.error = function(...args) { logStream.write('ERROR: ' + args.join(' ') + '\n'); process.stderr.write(args.join(' ') + '\n'); };
process.on('uncaughtException', err => console.error('UNCAUGHT:', err)); process.on('unhandledRejection', err => console.error('UNHANDLED:', err));
const express = require('express');
const cors = require('cors');
const { getTenants, getTenant, upsertTenant, deleteTenant } = require('./database');
const { initializeSession, getSessionStatus, logoutSession } = require('./whatsappManager');


const cleanLocks = () => {
    try {
        const authPath = path.join(__dirname, '.wwebjs_auth');
        if (fs.existsSync(authPath)) {
            const sessions = fs.readdirSync(authPath);
            for (const session of sessions) {
                const lockPath = path.join(authPath, session, 'SingletonLock');
                if (fs.existsSync(lockPath)) {
                    fs.unlinkSync(lockPath);
                    console.log('Removed stale lock: ' + lockPath);
                }
            }
        }
    } catch (e) {
        console.error('Error cleaning locks:', e);
    }
};
cleanLocks();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_prod';

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = app.use(express.static(path.join(__dirname, 'public')));', [username]);
        if (result.rows.length === 0) return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        
        const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, role: user.role });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Protect tenant routes
app.use('/api/tenants', authenticateToken);
app.use('/api/sessions', authenticateToken);


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
    console.log(`ğŸš€ Multi-Tenant Server running on port ${PORT}`);
});



