const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/server.js', 'utf8');

content = content.replace(
    /const result = await pool\.query\('SELECT \* FROM users WHERE username = 1', \[username\]\);/g,
    "const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);"
);

fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/server.js', content, 'utf8');
console.log('Fixed again');
