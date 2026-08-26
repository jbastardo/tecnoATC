const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/public/index.html', 'utf8');

content = content.replace(/tenant\.html/g, 'chat.html');
content = content.replace(
    "localStorage.setItem('role', data.role);",
    "localStorage.setItem('role', data.role);\n                    if (data.tenantId) localStorage.setItem('tenantId', data.tenantId);"
);

fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/public/index.html', content, 'utf8');
console.log('index.html updated');
