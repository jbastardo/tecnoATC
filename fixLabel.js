const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/public/dashboard.html', 'utf8');

content = content.replace(
    '<label>API Key (No usado por ahora, dÃ©jalo vacÃ­o o pon algo)</label>',
    '<label>Gemini API Key (Requerida para que la IA funcione)</label>'
);
// Also fixing the case if it has normal characters instead of encoding
content = content.replace(
    '<label>API Key (No usado por ahora, déjalo vacío o pon algo)</label>',
    '<label>Gemini API Key (Requerida para que la IA funcione)</label>'
);

fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/public/dashboard.html', content, 'utf8');
console.log('dashboard label fixed');
