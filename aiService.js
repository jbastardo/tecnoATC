const { GoogleGenAI } = require('@google/genai');

async function generateResponse(prompt, tenantConfig, context = "", mediaData = null) {
    try {
        const ai = new GoogleGenAI({ apiKey: tenantConfig.api_key });

        const systemPrompt = `${tenantConfig.system_prompt || "Eres un asistente de atención al cliente para una empresa. Responde de manera amable y profesional."}
REGLA CRÍTICA: Si el cliente pregunta sobre el estado de un envío, rastreo de un paquete, o hace una solicitud que requiere revisión manual o intervención humana estricta, DEBES responder ÚNICAMENTE con el siguiente código exacto y nada más: [REQUIERE_HUMANO]

Utiliza la siguiente información de contexto para responder la pregunta, si es relevante:
${context}
`;
        
        const userParts = [];
        if (mediaData) userParts.push(mediaData);
        if (prompt) userParts.push({ text: prompt });
        if (userParts.length === 0) userParts.push({ text: "El usuario envió una imagen." });

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [
                { role: 'user', parts: userParts }
            ],
            config: {
                systemInstruction: systemPrompt
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating AI response:", error);
        require('fs').appendFileSync(require('path').join(__dirname, 'public', 'debug.log'), new Date().toISOString() + ' AI Error: ' + error.message + '\n');
        return "Lo siento, en este momento estoy teniendo problemas técnicos.";
    }
}

module.exports = { generateResponse };

