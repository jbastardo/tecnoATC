const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/public/dashboard.html', 'utf8');

const oldFormHTML = `<div class="form-group">
                <label>API Key (No usado por ahora, déjalo vacío o pon algo)</label>
                <input type="text" id="t_apikey">
            </div>`;

const newFormHTML = `<div class="form-group">
                <label>API Key (No usado por ahora, déjalo vacío o pon algo)</label>
                <input type="text" id="t_apikey">
            </div>
            <div class="form-group">
                <label>Usuario del Cliente (Para que inicie sesión)</label>
                <input type="text" id="t_username" placeholder="Ej: micliente">
            </div>
            <div class="form-group">
                <label>Contraseña del Cliente</label>
                <input type="password" id="t_password" placeholder="Ej: clave123">
            </div>`;

content = content.replace(oldFormHTML, newFormHTML);

const oldPayload = `            const payload = {
                id: document.getElementById('t_id').value,
                name: document.getElementById('t_name').value,
                api_key: document.getElementById('t_apikey').value,
                system_prompt: document.getElementById('t_prompt').value,
                bot_active: document.getElementById('t_active').checked
            };`;

const newPayload = `            const payload = {
                id: document.getElementById('t_id').value,
                name: document.getElementById('t_name').value,
                api_key: document.getElementById('t_apikey').value,
                system_prompt: document.getElementById('t_prompt').value,
                bot_active: document.getElementById('t_active').checked,
                username: document.getElementById('t_username').value,
                password: document.getElementById('t_password').value
            };`;

content = content.replace(oldPayload, newPayload);

fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/public/dashboard.html', content, 'utf8');
console.log('dashboard.html updated');
