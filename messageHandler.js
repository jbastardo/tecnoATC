const { generateResponse } = require('./aiService');

const pausedChats = new Map();

const simulateTypingDelay = async (chat) => {
    const delay = Math.floor(Math.random() * 3000) + 2000; 
    await chat.sendStateTyping();
    return new Promise(resolve => setTimeout(resolve, delay));
};

const handleMessage = async (msg, tenantConfig) => {
    try {
        if (msg.from === 'status@broadcast' || msg.id.fromMe) return;

        if (!msg.body || typeof msg.body !== 'string') return;
        // getChat() disabled due to WA Web bug
        // const chat = await msg.getChat();
        if (msg.from.endsWith('@g.us')) return;

        const chatId = `${tenantConfig.id}_${msg.from}`;

        if (msg.body.trim().toLowerCase() === '/resumir') {
            pausedChats.delete(chatId);
            await msg.reply("✅ Chat despausado. El bot volverá a responder.");
            return;
        }

        if (pausedChats.has(chatId)) {
            console.log(`[Pausa - ${tenantConfig.name}] Mensaje ignorado de ${msg.from}`);
            return;
        }

        console.log(`[Mensaje Entrante - ${tenantConfig.name}] de ${msg.from}: ${msg.body}`);

        // await simulateTypingDelay(chat);

        const context = "Aún no tenemos base de datos de contexto.";
        
        const aiResponse = await generateResponse(msg.body, tenantConfig, context);

        // await chat.clearState();

        if (aiResponse.includes('[REQUIERE_HUMANO]')) {
            pausedChats.set(chatId, true);
            const pauseMsg = "Entiendo. Por la naturaleza de tu consulta, te transferiré con un agente humano para que te ayude con esto. Por favor, espera un momento.";
            await msg.reply(pauseMsg);
            console.log(`[Intervención Humana Solicitada] Chat ${chatId} pausado.`);
            return;
        }

        await msg.reply(aiResponse);
        console.log(`[Respuesta Enviada - ${tenantConfig.name}]: ${aiResponse}`);

    } catch (error) {
        console.error(`Error handling message for ${tenantConfig.name}:`, error.stack || error);
    }
};

module.exports = { handleMessage };
