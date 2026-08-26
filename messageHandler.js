const { generateResponse } = require('./aiService');
const { saveMessage } = require('./database');

const pausedChats = new Map();

const handleMessage = async (msg, tenantConfig) => {
    try {
        if (msg.from === 'status@broadcast' || msg.id.fromMe) return;
        if (!msg.body && !msg.hasMedia) return;
        if (msg.from.endsWith('@g.us')) return;

        const chatId = `${tenantConfig.id}_${msg.from}`;
        
        let mediaUrl = null;
        let mediaData = null;
        if (msg.hasMedia) {
            try {
                const media = await msg.downloadMedia();
                if (media) {
                    const ext = media.mimetype.split('/')[1].split(';')[0] || 'bin';
                    const filename = `media_${Date.now()}.${ext}`;
                    const path = require('path');
                    const uploadDir = path.join(__dirname, 'public', 'uploads');
                    const fsSync = require('fs');
                    if (!fsSync.existsSync(uploadDir)) fsSync.mkdirSync(uploadDir, { recursive: true });
                    fsSync.writeFileSync(path.join(uploadDir, filename), media.data, 'base64');
                    mediaUrl = '/uploads/' + filename;
                    
                    mediaData = {
                        inlineData: {
                            data: media.data,
                            mimeType: media.mimetype
                        }
                    };
                }
            } catch(e) { console.error("Error downloading media", e); }
        }

        let contactName = null;
        try {
            const contact = await msg.getContact();
            contactName = contact.pushname || contact.name || msg.from.split('@')[0];
        } catch(e) {}

        const bodyText = msg.body || '';

        // Save incoming message
        await saveMessage(tenantConfig.id, msg.from, 'bot', false, bodyText, mediaUrl, contactName);

        if (bodyText.trim().toLowerCase() === '/resumir') {
            pausedChats.delete(chatId);
            await msg.reply("? Chat despausado. El bot volver� a responder.");
            return;
        }

        if (pausedChats.has(chatId)) {
            console.log(`[Pausa - ${tenantConfig.name}] Mensaje ignorado de ${msg.from}`);
            return;
        }

        console.log(`[Mensaje Entrante - ${tenantConfig.name}] de ${msg.from}: ${bodyText} ${mediaUrl ? '[IMAGE]' : ''}`);

        // If bot is inactive, do not generate AI response
        if (!tenantConfig.bot_active) {
            console.log(`[Bot Inactivo - ${tenantConfig.name}] No se genera respuesta.`);
            return;
        }

        const context = "A�n no tenemos base de datos de contexto.";
        const aiResponse = await generateResponse(bodyText, tenantConfig, context, mediaData);

        if (aiResponse.includes('[REQUIERE_HUMANO]')) {
            pausedChats.set(chatId, true);
            const pauseMsg = "Entiendo. Por la naturaleza de tu consulta, te transferir� con un agente humano para que te ayude con esto. Por favor, espera un momento.";
            await msg.reply(pauseMsg);
            await saveMessage(tenantConfig.id, 'bot', msg.from, true, pauseMsg);
            console.log(`[Intervenci�n Humana Solicitada] Chat ${chatId} pausado.`);
            return;
        }

        await msg.reply(aiResponse);
        await saveMessage(tenantConfig.id, 'bot', msg.from, true, aiResponse);
        console.log(`[Respuesta Enviada - ${tenantConfig.name}]: ${aiResponse}`);

    } catch (error) {
        console.error(`Error handling message for ${tenantConfig.name}:`, error.stack || error);
    }
};

module.exports = { handleMessage, pausedChats };
