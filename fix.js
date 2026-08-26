const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/server.js', 'utf8');

// The corrupted line is: const result = await pool.query('SELECT * FROM users WHERE username = app.use(express.static(path.join(__dirname, 'public')));', [username]);
// Let's find that line and replace it with the correct SQL query.
content = content.replace(
    /const result = await pool\.query\('SELECT \* FROM users WHERE username = app\.use\(express\.static\(path\.join\(__dirname, 'public'\)\)\);', \[username\]\);/g,
    "const result = await pool.query('SELECT * FROM users WHERE username = 1', [username]);"
);

fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/server.js', content, 'utf8');
console.log('Fixed');
