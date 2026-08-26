const fs = require('fs');
let content = fs.readFileSync('c:/Antigravity/tecnotienda/tecnoATC/public/chat.html', 'utf8');

// 1. Update contact name in list
const searchContactNameList = `<div class="contact-name">+$\{c.id}</div>`;
const replaceContactNameList = `<div class="contact-name">$\{c.lastMsg.contact_name || '+' + c.id}</div>`;
content = content.replace(searchContactNameList, replaceContactNameList);

// 2. Update contact name in header
const searchHeaderName = `<h2>+$\{id}</h2>`;
const replaceHeaderName = `<h2>$\{messages.length > 0 && messages[0].contact_name ? messages[0].contact_name : '+' + id}</h2>`;
content = content.replace(searchHeaderName, replaceHeaderName);

// 3. Render images in messages
const searchMessageLoop = `<div>$\{m.body.replace(/\\n/g, '<br>')}</div>
                        <div class="message-time">$\{timeStr}</div>`;
const replaceMessageLoop = `
                        $\{m.media_url ? '<img src="' + m.media_url + '" style="max-width: 100%; border-radius: 8px; margin-bottom: 5px;">' : ''}
                        <div>$\{m.body ? m.body.replace(/\\n/g, '<br>') : ''}</div>
                        <div class="message-time">$\{timeStr}</div>`;
content = content.replace(searchMessageLoop, replaceMessageLoop);

fs.writeFileSync('c:/Antigravity/tecnotienda/tecnoATC/public/chat.html', content, 'utf8');
console.log('chat.html updated');
