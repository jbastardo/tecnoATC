const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const logPath = path.join(__dirname, 'public', 'debug.log');
const out = fs.openSync(logPath, 'a');

const child = spawn('node', ['server.js'], {
    stdio: ['ignore', out, out]
});

child.on('exit', (code) => {
    fs.appendFileSync(logPath, 'Server exited with code ' + code + '\n');
    // Start fallback server ONLY if server.js crashes
    const http = require('http');
    const server = http.createServer((req, res) => {
        if (req.url === '/debug.log') {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(fs.readFileSync(logPath));
        } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Wrapper running because server.js crashed. Check /debug.log');
        }
    });
    server.listen(8012, '0.0.0.0', () => {
        fs.appendFileSync(logPath, 'Wrapper fallback listening on 8012\n');
    });
});
