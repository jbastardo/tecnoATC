const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/server.js', 'utf8');

if (!content.includes('/api/debug-log')) {
    const search = `app.use(express.static('public'));`;
    const replace = `app.use(express.static('public'));
app.get('/api/debug-log', (req, res) => {
    try {
        const log = require('fs').readFileSync(require('path').join(__dirname, 'public', 'debug.log'), 'utf8');
        res.type('text/plain').send(log);
    } catch(e) { res.send(e.message); }
});`;
    content = content.replace(search, replace);
    fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/server.js', content, 'utf8');
    console.log('server.js updated');
} else {
    console.log('already has debug route');
}
