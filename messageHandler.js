const { generateResponse } = require('./aiService');
const { saveMessage } = require('./database');

const pausedChats = new Map();

const handleMessage = async (msg, tenantConfig) => {
    try {
        if (msg.from === 'status@broadcast' || msg.id.fromMe) return;
        if (!msg.body || typeof msg.body !== 'string') return;
        if (msg.from.endsWith('@g.us')) return;

        const chatId = `${tenantConfig.id}_${msg.from}`;

        // Save incoming message
        await saveMessage(tenantConfig.id, msg.from, 'bot', false, msg.body);

        if (msg.body.trim().toLowerCase() === '/resumir') {
            pausedChats.delete(chatId);
            await msg.reply("? Chat despausado. El bot volverá a responder.");
            return;
        }

        if (pausedChats.has(chatId)) {
            console.log(`[Pausa - ${tenantConfig.name}] Mensaje ignorado de ${msg.from}`);
            return;
        }

        console.log(`[Mensaje Entrante - ${tenantConfig.name}] de ${msg.from}: ${msg.body}`);

        // If bot is inactive, do not generate AI response
        if (!tenantConfig.bot_active) {
            console.log(`[Bot Inactivo - ${tenantConfig.name}] No se genera respuesta.`);
            return;
        }

        const context = "Aún no tenemos base de datos de contexto.";
        const aiResponse = await generateResponse(msg.body, tenantConfig, context);

        if (aiResponse.includes('[REQUIERE_HUMANO]')) {
            pausedChats.set(chatId, true);
            const pauseMsg = "Entiendo. Por la naturaleza de tu consulta, te transferiré con un agente humano para que te ayude con esto. Por favor, espera un momento.";
            await msg.reply(pauseMsg);
            await saveMessage(tenantConfig.id, 'bot', msg.from, true, pauseMsg);
            console.log(`[Intervención Humana Solicitada] Chat ${chatId} pausado.`);
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
