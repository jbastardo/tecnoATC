const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/aiService.js', 'utf8');

const search = `        return "Lo siento, en este momento estoy teniendo problemas técnicos.";`;
const replace = `        return "Error técnico de Gemini: " + error.message;`;
content = content.replace(search, replace);

fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/aiService.js', content, 'utf8');
console.log('aiService.js error message updated');
