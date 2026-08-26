const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/public/dashboard.html', 'utf8');

const badScript = `        let qrInterval = null;

        function closeQrModal() {
            document.getElementById('qrModal').style.display = 'none';
            if(qrInterval) clearInterval(qrInterval);
            loadTenants();
        }

        async function startSession(id) {
            await api(/api/sessions/start/+id, { method: 'POST' });
            document.getElementById('qrModal').style.display = 'flex';
            document.getElementById('qrContainer').innerHTML = '<p>Generando QR...</p>';
            
            if(qrInterval) clearInterval(qrInterval);
            qrInterval = setInterval(async () => {
                const statusData = await api(/api/sessions/status/+id);
                if (statusData.status === 'QR_READY' && statusData.qr) {
                    document.getElementById('qrContainer').innerHTML = <img src="+statusData.qr+" alt="QR Code">;
                } else if (statusData.status === 'CONNECTED') {
                    document.getElementById('qrContainer').innerHTML = '<p style="color:green; font-weight:bold;">Â¡Conectado exitosamente!</p>';
                    clearInterval(qrInterval);
                    setTimeout(() => closeQrModal(), 2000);
                }
            }, 2000);
        }`;

const goodScript = `        let qrInterval = null;

        function closeQrModal() {
            document.getElementById('qrModal').style.display = 'none';
            if(qrInterval) clearInterval(qrInterval);
            loadTenants();
        }

        async function startSession(id) {
            await api('/api/sessions/start/' + id, { method: 'POST' });
            document.getElementById('qrModal').style.display = 'flex';
            document.getElementById('qrContainer').innerHTML = '<p>Generando QR...</p>';
            
            if(qrInterval) clearInterval(qrInterval);
            qrInterval = setInterval(async () => {
                const statusData = await api('/api/sessions/status/' + id);
                if (statusData.status === 'QR_READY' && statusData.qr) {
                    document.getElementById('qrContainer').innerHTML = '<img src="' + statusData.qr + '" alt="QR Code">';
                } else if (statusData.status === 'CONNECTED') {
                    document.getElementById('qrContainer').innerHTML = '<p style="color:green; font-weight:bold;">¡Conectado exitosamente!</p>';
                    clearInterval(qrInterval);
                    setTimeout(() => closeQrModal(), 2000);
                }
            }, 2000);
        }`;

content = content.replace(badScript, goodScript);
fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/public/dashboard.html', content, 'utf8');
console.log('HTML fixed');
