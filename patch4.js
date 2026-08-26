const fs = require('fs');
const file = 'c:/Antigravity/tecnotienda/tecnoATC/whatsappManager.js';
let content = fs.readFileSync(file, 'utf8');

const badCode = `    const authPath = path.join(__dirname, '.wwebjs_auth', \psession-\p);
    try {
        require('child_process').execSync('find ' + authPath + ' -name "Singleton*" -delete');
    } catch(e) {}`;

const goodCode = `    const authPath = path.join(__dirname, '.wwebjs_auth', \`session-${tenantId}\`);
    try {
        const cp = require('child_process');
        cp.execSync('find ' + authPath + ' -name "Singleton*" -delete', { stdio: 'ignore' });
    } catch(e) {}`;

content = content.replace(badCode, goodCode);
fs.writeFileSync(file, content);