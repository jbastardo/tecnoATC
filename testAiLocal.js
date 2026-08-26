const { GoogleGenAI } = require('@google/genai');

async function test() {
    try {
        const aiInstance = new GoogleGenAI({ apiKey: 'DUMMY_KEY_OR_BAD_KEY_JUST_TO_SEE_VALIDATION_ERROR' });
        await aiInstance.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [
                { role: 'user', parts: [{ inlineData: { data: 'iVBORw0KGgo=', mimeType: 'image/jpeg'} }, { text: 'test' }] }
            ],
            config: {
                systemInstruction: 'sys prompt'
            }
        });
        console.log('Success');
        process.exit(0);
    } catch(e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}
test();
