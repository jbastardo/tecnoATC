const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/aiService.js', 'utf8');

const search = `model: 'gemini-1.5-flash',`;
const replace = `model: 'gemini-1.5-flash-latest',`;
content = content.replace(search, replace);

fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/aiService.js', content, 'utf8');
console.log('aiService.js model updated');
