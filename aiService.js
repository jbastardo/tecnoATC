const { GoogleGenerativeAI } = require('@google/generative-ai');

async function generateResponse(prompt, tenantConfig, context = "", mediaData = null) {
    try {
        const genAI = new GoogleGenerativeAI(tenantConfig.api_key);

        const systemPrompt = `${tenantConfig.system_prompt || "Eres un asistente de atención al cliente para una empresa. Responde de manera amable y profesional."}
REGLA CR� TICA: Si el cliente pregunta sobre el estado de un envío, rastreo de un paquete, o hace una solicitud que requiere revisión manual o intervención humana estricta, DEBES responder ÚNICAMENTE con el siguiente código exacto y nada más: [REQUIERE_HUMANO]

Utiliza la siguiente información de contexto para responder la pregunta, si es relevante:
${context}
`;
        
        const model = genAI.getGenerativeModel({
            model: "gemini-3.6-flash",
            systemInstruction: systemPrompt
        });
        
        const userParts = [];
        if (mediaData) userParts.push(mediaData);
        if (prompt) {
            userParts.push(prompt);
        } else {
            userParts.push("El usuario envió una imagen.");
        }

        const result = await model.generateContent(userParts);
        return result.response.text();
    } catch (error) {
        console.error("Error generating AI response:", error);
        require('fs').appendFileSync(require('path').join(__dirname, 'public', 'debug.log'), new Date().toISOString() + ' AI Error: ' + (error.message || error.toString()) + '\n');
        return "Error técnico de Gemini: " + (error.message || error.toString());
    }
}

module.exports = { generateResponse };
