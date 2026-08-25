let currentTenantId = null;
let statusInterval = null;

const fetchTenants = async () => {
    const res = await fetch('/api/tenants');
    const tenants = await res.json();
    const list = document.getElementById('tenantList');
    list.innerHTML = '';
    tenants.forEach(t => {
        const li = document.createElement('li');
        li.textContent = t.name;
        li.className = t.id === currentTenantId ? 'active' : '';
        li.onclick = () => loadTenant(t);
        list.appendChild(li);
    });
};

const loadTenant = (tenant) => {
    currentTenantId = tenant.id;
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('tenantContent').style.display = 'block';
    
    document.getElementById('tName').textContent = tenant.name;
    document.getElementById('fId').value = tenant.id;
    document.getElementById('fName').value = tenant.name;
    document.getElementById('fApiKey').value = tenant.api_key || '';
    document.getElementById('fPrompt').value = tenant.system_prompt || '';
    document.getElementById('fActive').checked = tenant.bot_active === 1;

    updateStatusBadge(tenant.status || 'DISCONNECTED');
    fetchTenants(); // update active class
    
    if (statusInterval) clearInterval(statusInterval);
    pollStatus();
    statusInterval = setInterval(pollStatus, 3000);
};

const updateStatusBadge = (status) => {
    const badge = document.getElementById('tStatus');
    badge.textContent = status;
    badge.className = `status-badge ${status}`;
};

const pollStatus = async () => {
    if (!currentTenantId) return;
    try {
        const res = await fetch(`/api/sessions/status/${currentTenantId}`);
        const data = await res.json();
        updateStatusBadge(data.status);
        
        const qrContainer = document.getElementById('qrContainer');
        if (data.qr) {
            qrContainer.innerHTML = `<img src="${data.qr}" alt="QR Code">`;
        } else if (data.status === 'CONNECTED') {
            qrContainer.innerHTML = `<p style="color:#10b981;font-weight:bold;">¡Conectado exitosamente!</p>`;
        } else {
            qrContainer.innerHTML = `<p class="text-muted">Esperando QR...</p>`;
        }
    } catch (e) { console.error(e); }
};

document.getElementById('newTenantBtn').onclick = () => {
    currentTenantId = null;
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('tenantContent').style.display = 'block';
    
    document.getElementById('tName').textContent = "Nuevo Cliente";
    document.getElementById('fId').value = "";
    document.getElementById('fName').value = "";
    document.getElementById('fApiKey').value = "";
    document.getElementById('fPrompt').value = "";
    document.getElementById('fActive').checked = false;
    
    document.getElementById('qrContainer').innerHTML = `<p class="text-muted">Guarda el cliente para iniciar sesión</p>`;
    updateStatusBadge('N/A');
    if (statusInterval) clearInterval(statusInterval);
};

document.getElementById('configForm').onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
        id: document.getElementById('fId').value,
        name: document.getElementById('fName').value,
        api_key: document.getElementById('fApiKey').value,
        system_prompt: document.getElementById('fPrompt').value,
        bot_active: document.getElementById('fActive').checked ? 1 : 0
    };

    const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if (res.ok) {
        const data = await res.json();
        currentTenantId = data.id;
        document.getElementById('fId').value = data.id;
        document.getElementById('tName').textContent = payload.name;
        alert("Configuración guardada exitosamente");
        fetchTenants();
    }
};

document.getElementById('deleteBtn').onclick = async () => {
    if (!currentTenantId) return;
    if (confirm("¿Estás seguro de eliminar este cliente?")) {
        await fetch(`/api/tenants/${currentTenantId}`, { method: 'DELETE' });
        currentTenantId = null;
        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('tenantContent').style.display = 'none';
        fetchTenants();
        if (statusInterval) clearInterval(statusInterval);
    }
};

document.getElementById('startSessionBtn').onclick = async () => {
    if (!currentTenantId) return alert("Primero guarda el cliente.");
    await fetch(`/api/sessions/start/${currentTenantId}`, { method: 'POST' });
    updateStatusBadge('INITIALIZING');
    pollStatus();
};

document.getElementById('logoutSessionBtn').onclick = async () => {
    if (!currentTenantId) return;
    if (confirm("¿Cerrar sesión de WhatsApp para este cliente?")) {
        await fetch(`/api/sessions/logout/${currentTenantId}`, { method: 'POST' });
        updateStatusBadge('DISCONNECTED');
        document.getElementById('qrContainer').innerHTML = `<p class="text-muted">Desconectado</p>`;
    }
};

// Init
fetchTenants();
