const { GoogleGenAI } = require('@google/genai');

async function generateResponse(prompt, tenantConfig, context = "") {
    try {
        const ai = new GoogleGenAI({ apiKey: tenantConfig.api_key });

        const systemPrompt = `${tenantConfig.system_prompt || "Eres un asistente de atención al cliente para una empresa. Responde de manera amable y profesional."}
REGLA CRÍTICA: Si el cliente pregunta sobre el estado de un envío, rastreo de un paquete, o hace una solicitud que requiere revisión manual o intervención humana estricta, DEBES responder ÚNICAMENTE con el siguiente código exacto y nada más: [REQUIERE_HUMANO]

Utiliza la siguiente información de contexto para responder la pregunta, si es relevante:
${context}
`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] }, 
                { role: 'user', parts: [{ text: prompt }] }
            ]
        });
        return response.text;
    } catch (error) {
        console.error("Error generating AI response:", error);
        return "Lo siento, en este momento estoy teniendo problemas técnicos.";
    }
}

module.exports = { generateResponse };
