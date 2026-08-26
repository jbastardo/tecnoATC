const { Client, LocalAuth } = require('whatsapp-web.js');
const { handleMessage } = require('./messageHandler');
const { getTenant } = require('./database');
const qrcode = require('qrcode');

const sessions = new Map();

const initializeSession = async (tenantId) => {
    if (sessions.has(tenantId)) {
        return sessions.get(tenantId);
    }

    const sessionData = { qr: null, status: 'INITIALIZING', client: null };
    sessions.set(tenantId, sessionData);

    const fs = require('fs');
    const path = require('path');
    const authPath = path.join(__dirname, '.wwebjs_auth', `session-$tenantId`);
    try {
        const cleanRecursive = (dir) => {
            if (!fs.existsSync(dir)) return;
            for (const f of fs.readdirSync(dir)) {
                const full = path.join(dir, f);
                if (fs.statSync(full).isDirectory()) cleanRecursive(full);
                else if (f.startsWith('Singleton')) fs.unlinkSync(full);
            }
        };
        cleanRecursive(authPath);
    } catch(e) {}

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: tenantId }),
        puppeteer: { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote', '--single-process'] }
    });

    client.on('qr', async (qr) => {
        console.log(`[${tenantId}] QR received`);
        try {
            sessionData.qr = await qrcode.toDataURL(qr);
            sessionData.status = 'QR_READY';
        } catch (err) {
            console.error(`[${tenantId}] Error generating QR`, err);
        }
    });

    client.on('ready', () => {
        console.log(`[${tenantId}] Client is ready!`);
        sessionData.status = 'CONNECTED';
        sessionData.qr = null;
    });

    client.on('disconnected', () => {
        console.log(`[${tenantId}] Client disconnected!`);
        sessionData.status = 'DISCONNECTED';
        if (sessionData.client) {
            sessionData.client.destroy().catch(() => {});
        }
        sessions.delete(tenantId);
    });

    client.on('message_create', async (msg) => {
        try {
            const tenant = await getTenant(tenantId);
            if (!tenant || !tenant.bot_active || !tenant.api_key) return;
            await handleMessage(msg, tenant);
        } catch (err) {
            console.error(`[${tenantId}] Error in message_create`, err);
        }
    });

    client.initialize().catch(err => {
        console.error(`[${tenantId}] Init error:`, err);
        sessionData.status = 'ERROR';
    });
    
    sessionData.client = client;
    return sessionData;
};

const getSessionStatus = (tenantId) => {
    if (!sessions.has(tenantId)) return { status: 'NOT_FOUND', qr: null };
    const session = sessions.get(tenantId);
    return { status: session.status, qr: session.qr };
};

const logoutSession = async (tenantId) => {
    if (sessions.has(tenantId)) {
        const session = sessions.get(tenantId);
        if (session.client) {
            try { await session.client.logout(); } catch(e){}
            try { await session.client.destroy(); } catch(e){}
        }
        sessions.delete(tenantId);
    }
};

module.exports = { initializeSession, getSessionStatus, logoutSession };



