const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/messageHandler.js', 'utf8');

// Replace the first part of handleMessage
const search1 = `const handleMessage = async (msg, tenantConfig) => {
    try {
        if (msg.from === 'status@broadcast' || msg.id.fromMe) return;
        if (!msg.body || typeof msg.body !== 'string') return;
        if (msg.from.endsWith('@g.us')) return;

        const chatId = \`\${tenantConfig.id}_\${msg.from}\`;

        // Save incoming message
        await saveMessage(tenantConfig.id, msg.from, 'bot', false, msg.body);`;

const replace1 = `const handleMessage = async (msg, tenantConfig) => {
    try {
        if (msg.from === 'status@broadcast' || msg.id.fromMe) return;
        if (!msg.body && !msg.hasMedia) return;
        if (msg.from.endsWith('@g.us')) return;

        const chatId = \`\${tenantConfig.id}_\${msg.from}\`;
        
        let mediaUrl = null;
        let mediaData = null;
        if (msg.hasMedia) {
            try {
                const media = await msg.downloadMedia();
                if (media) {
                    const ext = media.mimetype.split('/')[1].split(';')[0] || 'bin';
                    const filename = \`media_\${Date.now()}.\${ext}\`;
                    const path = require('path');
                    const uploadDir = path.join(__dirname, 'public', 'uploads');
                    const fsSync = require('fs');
                    if (!fsSync.existsSync(uploadDir)) fsSync.mkdirSync(uploadDir, { recursive: true });
                    fsSync.writeFileSync(path.join(uploadDir, filename), media.data, 'base64');
                    mediaUrl = '/uploads/' + filename;
                    
                    mediaData = {
                        inlineData: {
                            data: media.data,
                            mimeType: media.mimetype
                        }
                    };
                }
            } catch(e) { console.error("Error downloading media", e); }
        }

        let contactName = null;
        try {
            const contact = await msg.getContact();
            contactName = contact.pushname || contact.name || msg.from.split('@')[0];
        } catch(e) {}

        const bodyText = msg.body || '';

        // Save incoming message
        await saveMessage(tenantConfig.id, msg.from, 'bot', false, bodyText, mediaUrl, contactName);`;

content = content.replace(search1, replace1);

// Replace ai generation call
const search2 = `const aiResponse = await generateResponse(msg.body, tenantConfig, context);`;
const replace2 = `const aiResponse = await generateResponse(bodyText, tenantConfig, context, mediaData);`;
content = content.replace(search2, replace2);

// Fix msg.body.trim().toLowerCase() where it assumes msg.body is not empty
const search3 = `if (msg.body.trim().toLowerCase() === '/resumir') {`;
const replace3 = `if (bodyText.trim().toLowerCase() === '/resumir') {`;
content = content.replace(search3, replace3);

const search4 = `console.log(\`[Mensaje Entrante - \${tenantConfig.name}] de \${msg.from}: \${msg.body}\`);`;
const replace4 = `console.log(\`[Mensaje Entrante - \${tenantConfig.name}] de \${msg.from}: \${bodyText} \${mediaUrl ? '[IMAGE]' : ''}\`);`;
content = content.replace(search4, replace4);

fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/messageHandler.js', content, 'utf8');

// Now update aiService.js
let aiContent = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/aiService.js', 'utf8');
aiContent = aiContent.replace(
    'async function generateResponse(prompt, tenantConfig, context = "") {',
    'async function generateResponse(prompt, tenantConfig, context = "", mediaData = null) {'
);

const aiSearch = `const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] }, 
                { role: 'user', parts: [{ text: prompt }] }
            ]
        });`;
        
const aiReplace = `
        const userParts = [];
        if (mediaData) userParts.push(mediaData);
        if (prompt) userParts.push({ text: prompt });
        if (userParts.length === 0) userParts.push({ text: "El usuario envió una imagen." });

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] }, 
                { role: 'user', parts: userParts }
            ]
        });`;

aiContent = aiContent.replace(aiSearch, aiReplace);
fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/aiService.js', aiContent, 'utf8');
console.log('messageHandler.js and aiService.js updated');
