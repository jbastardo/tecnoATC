const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/public/dashboard.html', 'utf8');

if (!content.includes('btn-edit')) {
    content = content.replace(
        '.btn-danger { background: #dc3545; color: white; }',
        '.btn-danger { background: #dc3545; color: white; }\n        .btn-edit { background: #ffc107; color: black; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }'
    );
}

if (!content.includes('window.allTenants = []')) {
    content = content.replace(
        'async function loadTenants() {',
        'window.allTenants = [];\n        async function loadTenants() {'
    );
}
if (!content.includes('window.allTenants = data;')) {
    content = content.replace(
        "const data = await api('/api/tenants');",
        "const data = await api('/api/tenants');\n            window.allTenants = data;"
    );
}

const deleteBtn = '<button class="btn btn-danger" onclick="deleteTenant(\'${t.id}\')">Eliminar</button>';
const editBtn = '<button class="btn btn-edit" onclick="editTenant(\'${t.id}\')">Editar</button>\n                        <button class="btn btn-danger" onclick="deleteTenant(\'${t.id}\')">Eliminar</button>';
if (!content.includes('editTenant')) {
    content = content.replace(deleteBtn, editBtn);
}

const editScript = `
        function editTenant(id) {
            const tenant = window.allTenants.find(t => t.id === id);
            if (!tenant) return;
            document.getElementById('t_id').value = tenant.id;
            document.getElementById('t_id').readOnly = true;
            document.getElementById('t_name').value = tenant.name || '';
            document.getElementById('t_apikey').value = tenant.api_key || '';
            document.getElementById('t_prompt').value = tenant.system_prompt || '';
            document.getElementById('t_active').checked = tenant.bot_active;
            document.getElementById('t_username').value = '';
            document.getElementById('t_password').value = '';
            
            if (!document.getElementById('cancelEditBtn')) {
                const btn = document.createElement('button');
                btn.id = 'cancelEditBtn';
                btn.type = 'button';
                btn.className = 'btn btn-danger';
                btn.style.marginLeft = '10px';
                btn.innerText = 'Cancelar Edición';
                btn.onclick = cancelEdit;
                document.querySelector('#tenantForm button[type="submit"]').after(btn);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function cancelEdit() {
            document.getElementById('tenantForm').reset();
            document.getElementById('t_id').readOnly = false;
            const btn = document.getElementById('cancelEditBtn');
            if (btn) btn.remove();
        }

        async function deleteTenant(id) {`;

if (!content.includes('function editTenant')) {
    content = content.replace('async function deleteTenant(id) {', editScript);
}

content = content.replace(
    "document.getElementById('tenantForm').reset();",
    "cancelEdit();"
);

fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/public/dashboard.html', content, 'utf8');
console.log('dashboard edit functionality added');
