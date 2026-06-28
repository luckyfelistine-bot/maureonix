const fs = require('fs');
const path = require('path');
const { ensureUnderLimit, guessMime, getFileSizeMB, cleanupFile } = require('../lib/downloader');
const { extractText } = require('../lib/extract');

// Send a downloaded file to WhatsApp
async function sendFile(maureonix, m, filePath, captionExtra = '') {
    const safe = await ensureUnderLimit(filePath);
    const mime = guessMime(safe);
    const sizeMB = getFileSizeMB(safe).toFixed(1);
    const caption = captionExtra ? `${captionExtra} — ${sizeMB} MB` : `📥 ${sizeMB} MB`;
    const buffer = fs.readFileSync(safe);
    if (mime === 'video') await maureonix.sendMessage(m.chat, { video: buffer, caption }, { quoted: m });
    else if (mime === 'audio') await maureonix.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg' }, { quoted: m });
    else if (mime === 'image') await maureonix.sendMessage(m.chat, { image: buffer, caption }, { quoted: m });
    else await maureonix.sendMessage(m.chat, { document: buffer, fileName: path.basename(safe), caption }, { quoted: m });
    cleanupFile(filePath);
}

// Extract content from a quoted message
async function extractQuotedContent(quoted, maureonix) {
    if (!quoted) return { text: '', type: 'none', error: 'No quoted message' };
    const type = quoted.type;
    const mime = (quoted.mimetype || '').toLowerCase();
    const buffer = await quoted.download().catch(e => null);
    if (!buffer) return { text: '', type, error: 'Failed to download' };
    const filename = quoted.filename || '';
    const text = await extractText(buffer, mime, filename);
    return { text, type: type === 'documentMessage' ? 'document' : type };
}

// Generate text art command handler
async function generateTextArt(maureonix, m, cmd, text, prefix) {
    if (!text) return m.reply(`Example: ${prefix + cmd} <text>`);
    await m.reply('🎨 *Generating text art...*');
    try {
        const fetch = require('node-fetch');
        const apis = [
            `https://api.vihangayt.me/maker/${cmd}?text=${encodeURIComponent(text)}`,
            `https://api.davidcyriltech.my.id/${cmd}?text=${encodeURIComponent(text)}`
        ];
        let success = false;
        for (const url of apis) {
            try {
                const res = await fetch(url);
                if (!res.ok) continue;
                const buffer = await res.buffer();
                if (buffer && buffer.length > 100) {
                    await maureonix.sendMessage(m.chat, { image: buffer, caption: `🎨 *${cmd.toUpperCase()} Text Art*\n📝 *Text:* ${text}` }, { quoted: m });
                    success = true;
                    break;
                }
            } catch (e) {}
        }
        if (!success) throw new Error('All APIs failed');
    } catch (e) { m.reply('❌ Failed to generate text art: ' + e.message); }
}

// Image overlay command handler (popcat.xyz)
async function imageOverlay(maureonix, m, apiName, emoji) {
    const mentioned = m.mentionedJid?.[0] || m.sender;
    try {
        const pp = await maureonix.profilePictureUrl(mentioned, 'image').catch(() => null);
        if (pp) {
            const fetch = require('node-fetch');
            const url = `https://api.popcat.xyz/${apiName}?image=${encodeURIComponent(pp)}`;
            const res = await fetch(url);
            const buffer = await res.buffer();
            return await maureonix.sendMessage(m.chat, { image: buffer, caption: `${emoji} *${apiName.toUpperCase()}*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
        }
        await maureonix.sendMessage(m.chat, { text: `${emoji} *${apiName.toUpperCase()}*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
    } catch (e) { m.reply('❌ Error: ' + e.message); }
}

module.exports = { sendFile, extractQuotedContent, generateTextArt, imageOverlay };