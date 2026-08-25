const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const logPath = path.join(__dirname, 'public', 'debug.log');
const out = fs.openSync(logPath, 'a');
const child = spawn('node', ['server.js'], { stdio: ['ignore', out, out] });
const http = require('http');
const server = http.createServer((req, res) => {
    if (req.url === '/debug.log') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        try { res.end(fs.readFileSync(logPath)); } catch (e) { res.end('Log file not found'); }
    } else {
        res.writeHead(200); res.end('Wrapper running. Check /debug.log');
    }
});
server.listen(8012, '0.0.0.0', () => { console.log('Wrapper fallback server listening on 8012'); });
setInterval(() => {}, 10000);
