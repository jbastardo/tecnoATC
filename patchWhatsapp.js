const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/whatsappManager.js', 'utf8');

content = content.replace(
    'if (!tenant || !tenant.bot_active || !tenant.api_key) return;',
    'if (!tenant) return;'
);

fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/whatsappManager.js', content, 'utf8');
console.log('whatsappManager.js patched');
