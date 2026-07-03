// maureonix_core.js — Maureonix Core Message Processing
// NO circular dependencies. All helpers are self-contained or passed as params.

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const axios = require('axios');
const { randomBytes } = require('crypto');
const { sizeFormatter } = require('human-readable');
const { proto, getContentType } = require('@whiskeysockets/baileys');

// ═══════════════════════════════════════════════════════════════════════════════
// FORMAT HELPERS (self-contained, no external deps)
// ═══════════════════════════════════════════════════════════════════════════════

const formatSize = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`,
});

const formatNumber = (number) => {
    return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatDate = (n, locale = 'id') => {
    const d = new Date(n);
    return d.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    });
};

const formatTime = (ms) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
};

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatDuration = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0) result += `${seconds}s`;
    return result.trim() || '0s';
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE HELPERS (self-contained)
// ═══════════════════════════════════════════════════════════════════════════════

const smsg = (sock, msg, store) => {
    if (!msg) return msg;
    const M = proto.WebMessageInfo.fromObject(msg);
    if (M.key) {
        M.id = M.key.id;
        M.isBaileys = M.id?.startsWith('3EB0') && M.id?.length === 22;
        M.chat = M.key.remoteJid;
        M.fromMe = M.key.fromMe;
        M.isGroup = M.chat?.endsWith('@g.us');
        M.sender = M.fromMe
            ? sock.decodeJid(sock.user.id)
            : M.isGroup
                ? M.key.participant || M.chat
                : M.chat;
        M.isOwner = global.owner?.some(([num]) => M.sender?.includes(num)) || false;
    }
    if (M.message) {
        const type = getContentType(M.message);
        M.mtype = type;
        M.msg = M.message[type];
        if (M.msg) {
            M.text = M.msg.text || M.msg.caption || M.msg.contentText || M.msg.selectedDisplayText || M.msg.title || '';
            M.mentionedJid = M.msg.contextInfo?.mentionedJid || [];
            M.quoted = M.msg.contextInfo?.quotedMessage
                ? proto.WebMessageInfo.fromObject({
                    key: { remoteJid: M.chat, fromMe: M.msg.contextInfo?.participant === sock.decodeJid(sock.user.id), id: M.msg.contextInfo?.stanzaId, participant: M.msg.contextInfo?.participant },
                    message: M.msg.contextInfo.quotedMessage,
                })
                : null;
        }
    }
    if (M.quoted) {
        M.quoted.mtype = getContentType(M.quoted.message);
        M.quoted.msg = M.quoted.message[M.quoted.mtype];
        M.quoted.text = M.quoted.msg?.text || M.quoted.msg?.caption || M.quoted.msg?.contentText || M.quoted.msg?.selectedDisplayText || M.quoted.msg?.title || '';
        M.quoted.isOwner = global.owner?.some(([num]) => M.quoted.sender?.includes(num)) || false;
        M.quoted.delete = () => sock.sendMessage(M.chat, { delete: M.quoted.key });
        M.quoted.copyNForward = (jid, forceForward = false) => sock.copyNForward(jid, M.quoted, forceForward);
        M.quoted.download = () => sock.downloadMediaMessage(M.quoted);
    }
    M.copyNForward = (jid, forceForward = false) => sock.copyNForward(jid, M, forceForward);
    M.download = () => sock.downloadMediaMessage(M);
    return M;
};

const getBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'GET',
            url,
            headers: { 'DNT': 1, 'Upgrade-Insecure-Request': 1 },
            ...options,
            responseType: 'arraybuffer',
        });
        return { type: res.headers['content-type'], data: res.data, status: res.status };
    } catch (e) {
        console.error('[getBuffer] Error:', e.message);
        return { type: 'application/octet-stream', data: Buffer.alloc(0), status: 0 };
    }
};

const getGroupAdmins = (participants) => {
    if (!Array.isArray(participants)) return [];
    return participants.filter((p) => p.admin === 'superadmin' || p.admin === 'admin').map((p) => p.id);
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const start = (id, text) => {
    console.log(chalk.green(`[${id}] START`), text || '');
};

const success = (id, text) => {
    console.log(chalk.green(`[${id}] SUCCESS`), text || '');
};

const close = (id, text) => {
    console.log(chalk.red(`[${id}] CLOSE`), text || '');
};

// ═══════════════════════════════════════════════════════════════════════════════
// CORE HANDLER — processes a single message
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Process a single message through the Maureonix pipeline.
 * @param {Object} sock - Baileys socket instance
 * @param {Object} m - Message object (already processed by smsg)
 * @param {Object} store - Global message store
 * @param {Object} options - Additional options
 */
async function coreHandler(sock, m, store, options = {}) {
    try {
        if (!sock || !m) return;

        // Load database — now safely called from message.js which passes it in
        // We accept LoadDataBase/SaveDataBase as optional params to avoid circular deps
        const { LoadDataBase, SaveDataBase } = options;

        if (typeof LoadDataBase === 'function') {
            try {
                await LoadDataBase(sock, m);
            } catch (e) {
                console.error('[coreHandler] LoadDataBase error:', e.message);
            }
        }

        // Extract command from message text
        const body = m.text || m.msg?.text || m.msg?.caption || '';
        const prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#%^&.©^]/gi.test(body)
            ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#%^&.©^]/gi)[0]
            : global.prefix?.[0] || '.';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        // Build context
        const ctx = {
            sock,
            m,
            store,
            command,
            args,
            text,
            prefix,
            isCmd,
            isGroup: m.isGroup || false,
            isOwner: m.isOwner || false,
            sender: m.sender || '',
            chat: m.chat || '',
            pushName: m.pushName || '',
            botNumber: sock.decodeJid(sock.user.id),
            quotedMsg: m.quoted || null,
            groupMetadata: m.isGroup ? (store?.groupMetadata?.[m.chat] || null) : null,
        };

        // ── Auto-read messages ──
        if (global.db?.set?.[ctx.botNumber]?.autoread) {
            try { await sock.readMessages([m.key]); } catch (e) {}
        }

        // ── Auto-typing indicator ──
        if (global.db?.set?.[ctx.botNumber]?.autotyping && isCmd) {
            try { await sock.sendPresenceUpdate('composing', m.chat); } catch (e) {}
        }

        // ── Auto-react to mentions ──
        if (global.db?.set?.[ctx.botNumber]?.autoreactmention && m.mentionedJid?.includes(ctx.botNumber)) {
            try { await sock.sendMessage(m.chat, { react: { text: '👋', key: m.key } }); } catch (e) {}
        }

        // ── Auto-reply to mentions ──
        if (global.db?.set?.[ctx.botNumber]?.autoreplymention && m.mentionedJid?.includes(ctx.botNumber)) {
            try {
                const awayMsg = global.db.set[ctx.botNumber].awaymsg || 'I am not available right now.';
                await sock.sendMessage(m.chat, { text: awayMsg }, { quoted: m });
            } catch (e) {}
        }

        // ── Auto-status view ──
        if (global.db?.set?.[ctx.botNumber]?.autostatus && m.chat === 'status@broadcast') {
            try { await sock.readMessages([m.key]); } catch (e) {}
        }

        // ── Auto-status react ──
        if (global.db?.set?.[ctx.botNumber]?.autostatusreact && m.chat === 'status@broadcast') {
            try { await sock.sendMessage('status@broadcast', { react: { text: '❤️', key: m.key } }, { statusJidList: [m.sender] }); } catch (e) {}
        }

        // ── Auto-download media ──
        if (global.db?.set?.[ctx.botNumber]?.autodownload && (m.mtype === 'imageMessage' || m.mtype === 'videoMessage')) {
            try {
                const buffer = await m.download();
                // Could save to disk or forward — placeholder for extension
                if (buffer && buffer.length > 0) {
                    console.log(`[AutoDownload] ${m.mtype} from ${m.sender} — ${formatBytes(buffer.length)}`);
                }
            } catch (e) {}
        }

        // ── Auto-sticker ──
        if (global.db?.set?.[ctx.botNumber]?.autosticker && m.mtype === 'imageMessage') {
            try {
                const buffer = await m.download();
                if (buffer && buffer.length > 0) {
                    await sock.sendImageAsSticker(m.chat, buffer, m, {
                        packname: global.db.set[ctx.botNumber].packname || 'Maureonix',
                        author: global.db.set[ctx.botNumber].author || 'Infinite Vybeflix',
                    });
                }
            } catch (e) {}
        }

        // ── Auto-forward ──
        if (global.db?.set?.[ctx.botNumber]?.autoforward && m.chat === 'status@broadcast') {
            try {
                const buffer = await m.download();
                if (buffer && buffer.length > 0) {
                    await sock.sendMessage(ctx.botNumber, { [m.mtype.replace('Message', '')]: buffer, caption: m.text || '' });
                }
            } catch (e) {}
        }

        // ── Anti-link (groups) ──
        if (m.isGroup && global.db?.groups?.[m.chat]?.antilink && !m.isOwner) {
            const linkRegex = /(https?:\/\/|www\.)[^\s]+/gi;
            if (linkRegex.test(body)) {
                try {
                    await sock.sendMessage(m.chat, { delete: m.key });
                    await sock.sendMessage(m.chat, { text: 'Links are not allowed in this group.' }, { quoted: m });
                    // Optionally warn/kick
                } catch (e) {}
            }
        }

        // ── Anti-toxic (groups) ──
        if (m.isGroup && global.db?.groups?.[m.chat]?.antitoxic && !m.isOwner) {
            const toxicWords = ['anjing', 'babi', 'kontol', 'memek', 'ngentot', 'bangsat', 'asu', 'goblok', 'tolol'];
            if (toxicWords.some(w => body.toLowerCase().includes(w))) {
                try {
                    await sock.sendMessage(m.chat, { delete: m.key });
                    await sock.sendMessage(m.chat, { text: 'Please watch your language.' }, { quoted: m });
                } catch (e) {}
            }
        }

        // ── Anti-virtex (groups) ──
        if (m.isGroup && global.db?.groups?.[m.chat]?.antivirtex && !m.isOwner) {
            if (body.length > 5000) {
                try {
                    await sock.sendMessage(m.chat, { delete: m.key });
                    await sock.sendMessage(m.chat, { text: 'Virtex/Spam detected and removed.' }, { quoted: m });
                } catch (e) {}
            }
        }

        // ── Auto-delete messages after set time ──
        const autoDeleteMs = global.db?.set?.[ctx.botNumber]?.autodelete || 0;
        if (autoDeleteMs > 0) {
            setTimeout(async () => {
                try { await sock.sendMessage(m.chat, { delete: m.key }); } catch (e) {}
            }, autoDeleteMs * 1000);
        }

        // ── Save database after processing ──
        if (typeof SaveDataBase === 'function') {
            try { await SaveDataBase(); } catch (e) {}
        }

        // ── Log processed message ──
        console.log(
            chalk.cyan('[MSG]'),
            chalk.yellow(m.pushName || 'Unknown'),
            chalk.gray(`(${m.sender})`),
            chalk.white('→'),
            chalk.green(m.chat),
            chalk.magenta(isCmd ? `!${command}` : '(text)')
        );

    } catch (e) {
        console.error('[coreHandler] Fatal error:', e.message);
        console.error(e.stack);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    coreHandler,
    smsg,
    getBuffer,
    getGroupAdmins,
    getRandom,
    start,
    success,
    close,
    formatSize,
    formatNumber,
    formatDate,
    formatTime,
    formatBytes,
    formatDuration,
};
