const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/aiService.js', 'utf8');

const search = `        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] }, 
                { role: 'user', parts: userParts }
            ]
        });`;
        
const replace = `        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [
                { role: 'user', parts: userParts }
            ],
            config: {
                systemInstruction: systemPrompt
            }
        });`;

content = content.replace(search, replace);

const errorSearch = `        console.error("Error generating AI response:", error);
        return "Lo siento, en este momento estoy teniendo problemas técnicos.";`;
const errorReplace = `        console.error("Error generating AI response:", error);
        require('fs').appendFileSync(require('path').join(__dirname, 'public', 'debug.log'), new Date().toISOString() + ' AI Error: ' + error.message + '\\n');
        return "Lo siento, en este momento estoy teniendo problemas técnicos.";`;

content = content.replace(errorSearch, errorReplace);

fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/aiService.js', content, 'utf8');
console.log('aiService.js updated');
