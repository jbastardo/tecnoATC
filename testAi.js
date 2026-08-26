const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_TEST }); // We can just use dummy or read from db

async function test() {
    try {
        const { Pool } = require('pg');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const res = await pool.query("SELECT api_key FROM tenants WHERE api_key IS NOT NULL LIMIT 1");
        if (res.rows.length === 0) { console.log('No api key found'); return process.exit(1); }
        const key = res.rows[0].api_key;
        
        const aiInstance = new GoogleGenAI({ apiKey: key });
        const response = await aiInstance.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [
                { role: 'user', parts: [{ text: 'System prompt' }] }, 
                { role: 'user', parts: [{ text: 'User prompt' }] }
            ]
        });
        console.log(response.text);
        process.exit(0);
    } catch(e) {
        console.error("AI Error:", e.message);
        process.exit(1);
    }
}
test();
