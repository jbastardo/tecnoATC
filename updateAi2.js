const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/aiService.js', 'utf8');

const search = `        const userParts = [];
        if (mediaData) userParts.push(mediaData);
        if (prompt) userParts.push({ text: prompt });
        if (userParts.length === 0) userParts.push({ text: "El usuario envió una imagen." });`;
        
const replace = `        const userParts = [];
        if (mediaData) userParts.push(mediaData);
        if (prompt) {
            userParts.push({ text: prompt });
        } else {
            userParts.push({ text: "El usuario envió una imagen." });
        }`;

content = content.replace(search, replace);
fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/aiService.js', content, 'utf8');
console.log('aiService.js updated');
