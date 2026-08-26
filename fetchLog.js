const { execSync } = require('child_process');
try {
    const out = execSync("ssh root@192.168.1.32 \"docker exec $(docker ps -q -f name=tecno-a-t-c -f status=running | head -n 1) tail -n 20 public/debug.log\"", { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    console.log("LOG:", out);
} catch(e) {
    console.error("Error:", e.message);
    if(e.stderr) console.error("STDERR:", e.stderr);
}
