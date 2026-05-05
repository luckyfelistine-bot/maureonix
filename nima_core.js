// ═══════════════════════════════════════════════════════════════════════════
//   🦊 MAUREONIX v6.0.0 – CORE HANDLER (Thinking Separation + .vv Fix)
//   Games imported from ./lib/game – AI uses fixed lib/ai.js
// ═══════════════════════════════════════════════════════════════════════════

process.env.TZ = 'Africa/Nairobi';
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));
process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err));

require('./settings');
const fs = require('fs');
const os = require('os');
const util = require('util');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const yts = require('yt-search');
const cron = require('node-cron');
const fetch = require('node-fetch');
const FileType = require('file-type');
const { Chess } = require('chess.js');
const { Akinator } = require('aki-api');
const FormData = require('form-data');
const webp = require('node-webpmux');
const moment = require('moment-timezone');
const { performance } = require('perf_hooks');
const { exec, spawn, execSync } = require('child_process');
const { generateWAMessageContent, getContentType } = require('baileys');
const { generateMenuImage } = require('./lib/menuimage');
const { initEmailReports } = require('./lib/emailReports');
const { sendCrisisAlert } = require('./lib/maureonixCore');

const { UguuSe } = require('./lib/uploader');
const { antiSpam } = require('./lib/antispam');
const {
    ytMp3, ytMp4, tiktokDownload, igDownload, fbDownload,
    twitterDownload, spotifyDownload, pinterestDownload,
    redditDownload, soundcloudDownload, threadsDownload,
    capcutDownload, likeeDownload, snapchatDownload,
    vimeoDownload, dailymotionDownload, mediafireDownload,
    gdriveDownload, apkDownload
} = require('./lib/downloader');
const { toAudio, toPTT, toVideo } = require('./lib/converter');
const { GroupUpdate, LoadDataBase } = require('./src/message');
const { cmdAdd, cmdDel, cmdAddHit, addExpired, getPosition, getExpired, getStatus, checkStatus, getAllExpired, checkExpired } = require('./lib/database');
const { getRandom, getBuffer, fetchJson, runtime, clockString, sleep, isUrl, formatDate, formatp, generateProfilePicture, errorCache, normalize, updateSettings, parseMention, fixBytes, similarity, pickRandom, unsafeAgent, tarBackup } = require('./lib/function');
const { writeExif } = require('./lib/exif');

// Import the fixed AI module
const AI = require('./lib/ai');
const Search = require('./lib/search');
const Tools = require('./lib/tools');
const Fun = require('./lib/fun');
const Economy = require('./lib/economy');
const Admin = require('./lib/admin');
const Daily = require('./lib/daily');
const Health = require('./lib/health');
const Finance = require('./lib/finance');
const Social = require('./lib/social');
const Dev = require('./lib/dev');
const Travel = require('./lib/travel');
const Food = require('./lib/food');
const { generateQuantumMenu } = require('./lib/menuimage');

// Import all games from ./lib/game
const {
  // Classes used inside nima_core.js
  TicTacToe, TicTacToeClassic, Connect4, Battleship, Wordle, Hangman, SnakeLadder,
  Blackjack, BlackjackCasino,
  RAWG, TriviaMaster, PokemonGame, NumbersGame, FunAPIs,
  RPGAdventure,
  // Casino utilities (used by command files via ctx)
  slotMachine, rouletteSpin, crash, diceRoll, coinflip, rpsls, mathQuiz, anagram, numberGuess,
  // Game key helpers (still used in the trivia loop)
  iGame,
  // State manager
  gameManager
} = require('./lib/game');

const { sessionManager: learningSessionManager } = require('./lib/learningEngine');

const { OMDB, TVMaze, AniList, Jikan, TMDB, MovieGuesser, Movie, fmtCast } = require('./lib/movie');
const { APISports, OddsAPI, ESPN } = require('./lib/sports');

const memoryStore = require('./lib/memoryStore');

// ═══════════════════════════════════════════════════════════════
//  PROACTIVE SCHEDULER
// ═══════════════════════════════════════════════════════════════

// ── 7:00 AM – ENHANCED DAILY BRIEFING ─────────────────────────
cron.schedule('0 7 * * *', async () => {
    const ownerJid = global.owner[0] + '@s.whatsapp.net';
    const fetch = require('node-fetch');
    const config = require('../config');

    // 1. Date & time
    const now = moment().tz('Africa/Nairobi');
    const dateStr = now.format('dddd, MMMM Do YYYY');
    const timeStr = now.format('HH:mm:ss');

    // 2. Weather (wttr.in – free, lightweight)
    let weather = 'N/A';
    try {
        const w = await fetch('https://wttr.in/Kericho?format=%C+%t').then(r => r.text());
        weather = w.trim();
    } catch (e) { weather = '🌤 22°C'; }

    // 3. News headlines (freenewsapi.io)
    let news = 'No headlines available.';
    try {
        const apiKey = config.freenewsApiKey;
        const newsRes = await fetch(`https://api.freenewsapi.com/v1/top-headlines?country=ke&limit=3&apikey=${apiKey}`);
        if (newsRes.ok) {
            const data = await newsRes.json();
            if (data.articles && data.articles.length) {
                news = data.articles.map(a => `• ${a.title}`).join('\n');
            }
        }
    } catch (e) {}

    // 4. Bot usage stats
    const uptime = runtime(process.uptime());
    const totalUsers = Object.keys(global.db?.users || {}).length;
    const totalGroups = global.db?.groups ? Object.keys(global.db.groups).length : 0;
    const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    // 5. Briefing message
    const briefing = `🌅 *Good Morning, Creator!*\n\n` +
                     `📅 ${dateStr}  🕖 ${timeStr}\n` +
                     `🌡 Weather (Nairobi): ${weather}\n\n` +
                     `📰 *Top Headlines:*\n${news}\n\n` +
                     `🤖 *Bot Health*\n` +
                     `• Uptime: ${uptime}\n` +
                     `• RAM: ${memUsage} MB\n` +
                     `• Users: ${totalUsers}\n` +
                     `• Groups: ${totalGroups}\n\n` +
                     `🚀 Have an amazing day!`;

    if (global.nimaInstance) {
        await global.nimaInstance.sendMessage(ownerJid, { text: briefing });
    }
}, { timezone: 'Africa/Nairobi' });

// ── HOURLY CLEANUP – prevent memory bloat ─────────────────────
cron.schedule('0 * * * *', async () => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // 1. Clean up auto‑AI sessions
    if (global.db && global.db.autoAiSessions) {
        for (const [uid, sess] of Object.entries(global.db.autoAiSessions)) {
            if (!sess.lastActivity || now - sess.lastActivity > oneHour) {
                delete global.db.autoAiSessions[uid];
            }
        }
    }

    // 2. Trim pending messages (keep only latest 50)
    const botSet = global.db?.set && Object.keys(global.db.set).length ? global.db.set[Object.keys(global.db.set)[0]] : null;
    if (botSet && botSet.pendingMessages && botSet.pendingMessages.length > 50) {
        botSet.pendingMessages = botSet.pendingMessages.slice(-50);
    }

            // 3. Abandoned games cleanup
            if (global.db && global.db.game) {
                for (const gameType of ['connect4', 'suit', 'chess', 'ulartangga']) {
                    const rooms = global.db.game[gameType];
                    if (rooms) {
                        for (const roomId of Object.keys(rooms)) {
                            const room = rooms[roomId];
                            const last = room.lastMove || room.time || room.started || 0;
                            if (now - last > oneHour) delete rooms[roomId];
                        }
                    }
                }
            }

            // 4. Cleanup old user memories (inactive > 7 days)
            try {
                require('./lib/memoryStore').cleanupOldMemories();
            } catch (e) {}
        }, { timezone: 'Africa/Nairobi' });

// ═══════════════════════════════════════════════════════════════
//  MAIN HANDLER – fully enclosed in a single try-catch
// ═══════════════════════════════════════════════════════════════
const coreHandler = async (nimesha, m, msg, store) => {
    try {
        await LoadDataBase(nimesha, m);
        if (!global.db) global.db = { users: {}, groups: {}, game: {}, set: {}, premium: [], database: {} };
        if (!global.db.database) global.db.database = {};
        const botNumber = nimesha.decodeJid(nimesha.user.id);

         // ═══════════════════════════════════════════════════════
        //  Initialise email reporting engine (once)
        // ═══════════════════════════════════════════════════════
        if (!global.__emailReportsInitialized) {
            global.__emailReportsInitialized = true;
            initEmailReports(nimesha, AI);
            const { maureonixCore } = require('./lib/maureonixCore');
            maureonixCore.initialize().then(() => {
                console.log('🦊 Maureonix Omniscient Core is awake.');
            });
        }

        const sendReply = async (jid, content, options = {}) => {
            let msgContent = typeof content === 'string' ? { text: content, ...options } : { ...content, ...options };
            if (jid.endsWith('@newsletter')) return nimesha.newsletterMsg(jid, msgContent).catch(() => {});
            return nimesha.sendMessage(jid, msgContent);
        };

        // Proxy nimesha.sendMessage to support newsletters automatically
        const originalSendMessage = nimesha.sendMessage.bind(nimesha);
        nimesha.sendMessage = async (jid, content, options = {}) => {
            if (jid && jid.endsWith('@newsletter')) {
                let msg = content;
                if (typeof content === 'string') msg = { text: content };
                else if (content && content.text && !content.caption) msg = { text: content.text };
                else if (content && content.caption && !content.text) msg = { text: content.caption };
                return nimesha.newsletterMsg(jid, msg).catch(() => {});
            }
            return originalSendMessage(jid, content, options);
        };

        let messageHandled = false;
        const mess = {
            wait: '⏳ Please wait...',
            owner: '❌ Only for the bot owner!',
            group: '❌ Only in a group!',
            admin: '❌ You must be admin!',
            botAdmin: '❌ Bot must be admin!',
            private: '❌ Only in private chat!',
            premium: '❌ Premium users only!',
            limit: '❌ Daily limit reached!',
            banned: '❌ You are banned!',
            nsfw: '❌ NSFW is disabled!',
            error: '❌ An error occurred.',
        };

        const sewa = db.sewa;
        const premium = db.premium;
        if (!db.set) db.set = {};
        if (!db.set[botNumber]) db.set[botNumber] = {};
        const set = db.set[botNumber];
        if (!db.game) db.game = {};
        let chat_ai = db.game.chat_ai;
        if (!db.game.gemini_autoreply) db.game.gemini_autoreply = {};
        let gemini_autoreply = db.game.gemini_autoreply;
        if (!db.game.gemini_history) db.game.gemini_history = {};
        let gemini_history = db.game.gemini_history;
        let menfes = db.game.menfes;

        const ownerNumber = set.owner = [...new Set([...owner, ...set?.owner || []])];

        // ─── MISSING GLOBALS (listv, limit, tempatDB, fake, my, cases)
        const listprefix = ['.', '#', '!', '/', '?', ';', ':', ','];
        const listv = ['┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃'];
        const limit = global.limit || { free: 20, premium: 50, vip: 100 };
        const tempatDB = global.tempatDB || 'database.json';
        const fake = global.fake || { name: 'Maureonix', number: '254116903500' };
        const my = global.my || { ch: null };
        let cases = [];
        try {
            const nimaJsContent = fs.readFileSync('./nima.js', 'utf-8');
            const matches = nimaJsContent.matchAll(/case\s+['"]([^'"]+)['"]/g);
            cases = [...matches].map(match => match[1]);
            if (!global.db.cases) global.db.cases = cases;
        } catch (e) { console.error('[cases] Could not read nima.js, "did you mean" disabled'); }

        await GroupUpdate(nimesha, m, store);
        const _isOwnerSelf = ownerNumber.filter(v => typeof v === 'string').map(v => v.replace(/[^0-9]/g, '')).includes(m.sender?.split('@')[0]);
        
        // ─── CRITICAL FIX: NEVER reply to bot's own messages (except owner self-chat)
        if (m.key.fromMe && !_isOwnerSelf) return;

        let body = '';
        try {
            body = ((m.type === 'conversation') ? m.message.conversation :
            (m.type == 'imageMessage') ? m.message.imageMessage.caption :
            (m.type == 'videoMessage') ? m.message.videoMessage.caption :
            (m.type == 'extendedTextMessage') ? m.message.extendedTextMessage.text :
            (m.type == 'reactionMessage') ? m.message.reactionMessage.text :
            (m.type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
            (m.type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
            (m.type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
            (m.type == 'interactiveResponseMessage'  && m.quoted) ? (m.message.interactiveResponseMessage?.nativeFlowResponseMessage ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id : '') :
            (m.type == 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || '') :
            (m.type == 'editedMessage') ? (m.message.editedMessage?.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text || m.message.editedMessage?.message?.protocolMessage?.editedMessage?.conversation || '') :
            (m.type === 'newsletterMessage') ? m.message.newsletterMessage?.text :
            (m.type == 'protocolMessage') ? (m.message.protocolMessage?.editedMessage?.extendedTextMessage?.text || m.message.protocolMessage?.editedMessage?.conversation || m.message.protocolMessage?.editedMessage?.imageMessage?.caption || m.message.protocolMessage?.editedMessage?.videoMessage?.caption || '') : '') || '';
        } catch (err) {
            // Don't block the whole handler – just set empty body and continue
            body = '';
        }

        const budy = (typeof m.text == 'string' ? m.text : '') || body;

        const footerText = '\n\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX';
        m.reply = async (content, options = {}) => {
            if (messageHandled) return;
            messageHandled = true;
            if (typeof content === 'string') content += footerText;
            else if (typeof content === 'object') {
                if (content.text) content.text += footerText;
                else if (content.caption) content.caption += footerText;
            }
            return sendReply(m.chat, content, options);
        };

        const isCreator = isOwner = m.fromMe || ownerNumber.filter(v => typeof v === 'string').map(v => v.replace(/[^0-9]/g, '')).includes(m.sender.split('@')[0]);
        const prefix = isCreator ? (/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi)[0] : listprefix.find(a => body?.startsWith(a)) || '') : set.multiprefix ? (/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi)[0] : listprefix.find(a => body?.startsWith(a)) || '¿') : listprefix.find(a => body?.startsWith(a)) || '¿';
        const isCmd = prefix ? body.startsWith(prefix) : listprefix.some(p => body.startsWith(p));
        const args = body.trim().split(/ +/).slice(1);
        const quotedMsg = m.quoted ? m.quoted : m;
        const command = isCreator ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : isCmd ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : '';
        const text = q = args.join(' ');
        const mime = (quotedMsg.msg || quotedMsg).mimetype || '';
        const author = set.author = global.author || 'Infinite Vybeflix';
        const packname = set.packname = global.packname || 'Maureonix';
        const botname = set.botname = global.botname || 'Maureonix';
        const dayName = moment.tz('Africa/Nairobi').format('dddd');
        const tanggal = moment.tz('Africa/Nairobi').format('DD/MM/YYYY');
        const jam = moment.tz('Africa/Nairobi').format('HH:mm:ss');
        const ucapanWaktu = jam < '05:00:00' ? 'Good Dawn 🌉' : jam < '11:00:00' ? 'Good Morning 🌄' : jam < '15:00:00' ? 'Good Day 🏙️' : jam < '18:00:00' ? 'Good Evening 🌅' : jam < '19:00:00' ? 'Good Evening 🌃' : 'Good Night 🌌';
        const almost = 0.66;
        const time_end = 60000 - (new Date().getSeconds() * 1000 + new Date().getMilliseconds());
        const readmore = String.fromCharCode(8206).repeat(999);
        const setv = pickRandom(listv);
        const isVip = isCreator || (db.users[m.sender] ? db.users[m.sender].vip : false);
        const isBan = isCreator || (db.users[m.sender] ? db.users[m.sender].ban : false);
        const isLimit = isCreator || (db.users[m.sender] ? (db.users[m.sender].limit > 0) : false);
        const isPremium = isCreator || checkStatus(m.sender, premium) || false;
        const isNsfw = m.isGroup ? db.groups[m.chat].nsfw : false;
        const fkontak = { key: { remoteJid: '0@s.whatsapp.net', participant: '0@s.whatsapp.net', fromMe: false, id: 'Maureonix' }, message: { contactMessage: { displayName: (m.pushName || author), vcard: `BEGIN:VCARD\nVERSION:7.0\nN:XL;${m.pushName || author};;;\nFN:${m.pushName || author}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Mobile\nEND:VCARD` } } };

        // Reset Limits daily
        cron.schedule('00 00 * * *', async () => {
            cmdDel(db.hit);
            let user = Object.keys(db.users);
            for (let jid of user) {
                const limitUser = db.users[jid].vip ? limit.vip : checkStatus(jid, premium) ? limit.premium : limit.free;
                if (db.users[jid].limit < limitUser) db.users[jid].limit = limitUser;
            }

            // 🧹 Clean up memory leaks
            if (db.lastSelfReply) {
                const dayAgo = Date.now() - 86400000;
                for (const [uid, time] of Object.entries(db.lastSelfReply)) {
                    if (time < dayAgo) delete db.lastSelfReply[uid];
                }
            }
            if (errorCache) {
                for (const key of Object.keys(errorCache)) delete errorCache[key];
            }

            if (set?.autobackup) {
                let datanya = './database/' + tempatDB;
                if (tempatDB.startsWith('mongodb')) {
                    datanya = './database/backup_database.json';
                    fs.writeFileSync(datanya, JSON.stringify(global.db, null, 2), 'utf-8');
                }
                let tglnya = new Date().toISOString().replace(/[:.]/g, '-');
                for (let o of ownerNumber) {
                    try { await nimesha.sendMessage(o, { document: fs.readFileSync(datanya), mimetype: 'application/json', fileName: tglnya + '_database.json' }); } catch (e) {}
                }
            }
        }, { scheduled: true, timezone: 'Africa/Nairobi' });

        // Auto Bio
        if (set.autobio) {
            if (new Date() * 1 - set.status > 60000) {
                await nimesha.updateProfileStatus(`${nimesha.user.name} | 🎯 Runtime: ${runtime(process.uptime())}`).catch(() => {});
                set.status = new Date() * 1;
            }
        }

        // Mode restrictions
        if (!isCreator) {
            if ((set.grouponly === set.privateonly)) { if (!nimesha.public && !m.key.fromMe) return; }
            else if (set.grouponly) { if (!m.isGroup) return; }
            else if (set.privateonly) { if (m.isGroup) return; }
        }

        // Learning Mode Override
        if (global.learningMode && global.learningMode[m.sender] && global.learningEngine) {
            const lowerText = (text || '').toLowerCase();
            if (isCmd && (command === 'exitlearn' || command === 'stop' || command === 'exit' || command === 'quit')) {
                // allow exit
            } else {
                try {
                    const result = await global.learningEngine.processLearningQuery(budy, m.sender);
                    if (result) { await m.reply(result.message || result.text); return; }
                } catch (err) { await m.reply('⚠️ Learning mode error. Use `.exitlearn` to disable.'); delete global.learningMode[m.sender]; return; }
            }
        }

        // ─── MAUREONIX OMNISCIENT CORE (Owner console, no prefix) ───
        const botOwnJid = nimesha.decodeJid(nimesha.user.id);
        const isOwnerConsole = !m.isGroup && m.fromMe && m.chat === botOwnJid && _isOwnerSelf;
        if (isOwnerConsole && !isCmd && !messageHandled) {
            messageHandled = true;
            const { handleOwnerMessage } = require('./lib/maureonixCore');
            await handleOwnerMessage(nimesha, m, {
                body, budy, set, db, ownerNumber, AI
            });
            return;
        }

        // ─── PRIVATE MODE (away/ai/both) with fixed AI separation ───
        if (!m.isGroup && !m.fromMe && m.key.remoteJid !== 'status@broadcast' && !isCmd && (body || budy) && !isOwner) {
            const mode = set.privatemode || 'off';
            const awayMsg = set.awaymsg || 'I am not available right now.';
            const user = db.users[m.sender];
            const addPending = (fromJid, msg) => {
                if (!set.pendingMessages) set.pendingMessages = [];
                let entry = set.pendingMessages.find(e => e.from === fromJid);
                if (!entry) { entry = { from: fromJid, timestamp: Date.now(), messages: [] }; set.pendingMessages.push(entry); }
                entry.messages.push({ time: Date.now(), body: msg });
                if (entry.messages.length > 50) entry.messages.shift();
            };
            if (mode === 'away' || mode === 'both') addPending(m.sender, body || budy);
            if (mode === 'away') { await m.reply(awayMsg); return; }
            else if (mode === 'ai' || mode === 'both') {
                if (set.autotyping) await nimesha.sendPresenceUpdate('composing', m.chat);
                try {
                    const { answer, thinking } = await AI.enhancedAI(body || budy, m.sender, 'deepseek', null);
                    if (!messageHandled) {
                        if (!db.thinkingSessions) db.thinkingSessions = {};
                        db.thinkingSessions[m.sender] = { reasoning: thinking, timestamp: Date.now(), query: body || budy };
                        const replyText = `🤖 *Maureonix*\n\n${answer}`;
                        await AI.sendLongMessage(nimesha, m.chat, replyText + '\n\n_💭 Type .thinking to see my reasoning_', { quoted: m });
                        messageHandled = true;   // <-- ADD THIS LINE
                        if (set.ownerMirror && m.sender !== ownerNumber[0]) {
                            await nimesha.sendMessage(ownerNumber[0], { text: `📨 *Private AI reply to ${m.pushName}*\n👤 ${m.sender}\n💬 ${(body || budy).slice(0, 200)}\n\n🤖 ${answer.slice(0, 300)}` }).catch(() => {});
                        }
                    }
                } catch (e) { console.error('[privat AI]', e); }
                return;
            }
        }

        // ─── AUTO-AI AWAY ASSISTANT (with fixed AI separation) ───
        const hasText = body || budy;
        const hasMedia = m.isMedia && !m.key.fromMe && m.key.remoteJid !== 'status@broadcast';
        if (set.autoai && !isCmd && !m.key.fromMe && m.key.remoteJid !== 'status@broadcast' && (hasText || hasMedia) && !messageHandled && !isCreator) {
            let userMessage = hasText ? (body || budy) : '';
            if (!userMessage && hasMedia) {
                try {
                    const mediaBuffer = await m.download();
                    const { processFile } = require('./lib/fileProcessor');
                    const result = await processFile(mediaBuffer, m.mime, m.msg?.fileName || '');
                    userMessage = result.type === 'text' ? `[File: ${m.mime}]\n${result.content}` : `[File of type ${m.mime}]`;
                } catch (e) { userMessage = `[File error]`; }
            }
            if (!userMessage) return;

            const now = Date.now();
            if (!db.lastAutoReply) db.lastAutoReply = {};
            if (now - (db.lastAutoReply[m.sender] || 0) < 1500) return;
            db.lastAutoReply[m.sender] = now;

            if (!db.autoAiSessions) db.autoAiSessions = {};
            if (!db.autoAiSessions[m.sender]) {
                db.autoAiSessions[m.sender] = { started: now, messageCount: 0, lastActivity: now, context: [], notifiedOwner: false };
            }
            const session = db.autoAiSessions[m.sender];
            session.messageCount++;
            session.lastActivity = now;
            session.context.push({ role: 'user', content: userMessage, time: now });
            if (session.context.length > 10) session.context.shift();

            if (!set.pendingMessages) set.pendingMessages = [];
            let entry = set.pendingMessages.find(e => e.from === m.sender);
            if (!entry) { entry = { from: m.sender, timestamp: now, messages: [] }; set.pendingMessages.push(entry); }
            entry.messages.push({ time: now, body: body || budy });
            if (entry.messages.length > 50) entry.messages.shift();

            if (set.autotyping) await nimesha.sendPresenceUpdate('composing', m.chat).catch(() => {});

            try {
                const { answer, thinking } = await AI.enhancedAI(userMessage, m.sender, 'deepseek', null);
                if (!messageHandled) {
                    if (!db.thinkingSessions) db.thinkingSessions = {};
                    db.thinkingSessions[m.sender] = { reasoning: thinking, timestamp: Date.now(), query: userMessage };
                    const replyText = `🤖 *Maureonix*\n\n${answer}`;
                    await AI.sendLongMessage(nimesha, m.chat, replyText + '\n\n_💭 Type .thinking to see my reasoning_', { quoted: m });
                    messageHandled = true;   // <-- ADD THIS LINE
                    
                    if (set.ownerMirror && m.sender !== ownerNumber[0]) {
                        await nimesha.sendMessage(ownerNumber[0], { text: `📨 *Auto-AI reply to ${m.pushName}*\n👤 ${m.sender}\n💬 ${userMessage.slice(0, 200)}\n\n🤖 ${answer.slice(0, 300)}` }).catch(() => {});
                    }
                    session.context.push({ role: 'assistant', content: answer, time: Date.now() });
                }
                if (session.messageCount % 5 === 0 && !session.notifiedOwner) {
                    await nimesha.sendMessage(ownerNumber[0], { text: `📬 *Auto-AI Activity Report*\nUser: ${m.sender}\nMessages: ${session.messageCount}\nLast: ${userMessage.substring(0, 80)}...` }).catch(() => {});
                    session.notifiedOwner = true;
                }
            } catch (e) { console.error('[autoai error]', e); }
            if (messageHandled) return;
        }

        // ─── CRISIS INTERVENTION (runs early – before auto‑AI) ───
        const crisisScope = db.set?.crisisScope || 'all';
        let shouldProcessCrisis = false;
        if (crisisScope === 'off') shouldProcessCrisis = false;
        else if (crisisScope === 'dm') shouldProcessCrisis = (!m.isGroup && !m.key.fromMe && m.key.remoteJid !== 'status@broadcast');
        else if (crisisScope === 'groups') shouldProcessCrisis = (m.isGroup && !m.key.fromMe);
        else shouldProcessCrisis = (!m.isGroup && !m.key.fromMe && m.key.remoteJid !== 'status@broadcast') || (m.isGroup && !m.key.fromMe);

        if (shouldProcessCrisis && (body || budy) && !messageHandled) {
            const userMessage = body || budy;
            
            // ─── Handle "crisis stop" command to exit crisis mode ───
            if (db.crisisPending?.[m.sender]?.state === 'talking' && userMessage.toLowerCase() === 'crisis stop') {
                delete db.crisisPending[m.sender];
                await nimesha.sendMessage(m.chat, { text: '💙 *Crisis mode ended.*\nI\'m still here if you need me. Just type anything.' }, { quoted: m });
                return;
            }

            const crisis = AI.detectCrisis(userMessage);
            if (crisis.isCrisis) {
                const lastCrisis = db.crisisTimestamps?.[m.sender] || 0;
                // Reduced cooldown to 5 minutes (was 30) to allow re-triggering
                if (Date.now() - lastCrisis < 5 * 60 * 1000) {
                    // Still handle but don't spam owner
                } else {
                    if (!db.crisisTimestamps) db.crisisTimestamps = {};
                    db.crisisTimestamps[m.sender] = Date.now();
                    let verified = true;
                    if (global.set?.aiCrisisVerification !== false) {
                        try {
                            const { verifyCrisisWithAI } = require('./lib/ai');
                            const verification = await verifyCrisisWithAI(userMessage, m.sender);
                            if (!verification.isDistress) verified = false;
                        } catch (e) {
                            // verification function missing or failed – fall back to keyword detection
                            verified = true;
                        }
                    }
                    if (verified) {
                        const crisisMsg = `💙 *I hear you. You're not alone.*\n\nYou can talk to me directly – just type naturally.\n👉 Reply with "yes" to talk, or "no" for human contact.\n\n_Your feelings matter._ 💙`;
                        await nimesha.sendMessage(m.chat, { text: crisisMsg }, { quoted: m });
                        if (!db.crisisPending) db.crisisPending = {};
                        db.crisisPending[m.sender] = { state: 'awaiting_choice', originalMsg: userMessage, timestamp: Date.now(), severity: crisis.severity };
                        // Send crisis alert via email + WhatsApp (FIXED: pass nimesha)
                        await sendCrisisAlert(userMessage, m.sender, crisis.severity, nimesha);
                        return;
                    }
                }
            }

            if (db.crisisPending?.[m.sender]?.state === 'awaiting_choice') {
                const choice = userMessage.trim().toLowerCase();
                if (choice === 'yes') {
                    db.crisisPending[m.sender].state = 'talking';
                    db.crisisPending[m.sender].lastMsgTime = Date.now();
                    await nimesha.sendMessage(m.chat, { text: `💙 I'm here. Type anything. (Say "crisis stop" to end.)` }, { quoted: m });
                    return;
                } else if (choice === 'no') {
                    const ownerFirst = (Array.isArray(ownerNumber) ? ownerNumber[0] : ownerNumber).replace(/[^0-9]/g, '');
                    await nimesha.sendMessage(m.chat, { text: `💙 You can reach someone at https://wa.me/${ownerFirst}. Take care.` }, { quoted: m });
                    delete db.crisisPending[m.sender];  // Clean up
                    return;
                } else {
                    await nimesha.sendMessage(m.chat, { text: `Please reply *yes* (talk to me) or *no* (human contact).` }, { quoted: m });
                    return;
                }
            }

            if (db.crisisPending?.[m.sender]?.state === 'talking') {
                db.crisisPending[m.sender].lastMsgTime = Date.now();
                if (set.autotyping) await nimesha.sendPresenceUpdate('composing', m.chat);
                try {
                    const crisisSystem = `You are a compassionate listener. The user is in distress. Respond warmly and briefly. Never give medical advice. Use 💙.`;
                    const result = await AI.ultimateAI(userMessage, m.sender, 'deepseek', crisisSystem);
                    await nimesha.sendMessage(m.chat, { text: result.text }, { quoted: m });
                } catch (e) {
                    await nimesha.sendMessage(m.chat, { text: `💙 I'm here. Type "crisis stop" if you need space.` }, { quoted: m });
                }
                return;
            }
        }

        // Cleanup idle crisis sessions (after 10 minutes)
        const nowTimeCrisis = Date.now();
        if (db.crisisPending) {
            for (const [userId, state] of Object.entries(db.crisisPending)) {
                if (state.state === 'talking' && nowTimeCrisis - state.lastMsgTime > 10 * 60 * 1000) {
                    delete db.crisisPending[userId];
                    try { await nimesha.sendMessage(userId, { text: `💙 I'm still here if you need me.` }); } catch {}
                }
            }
        }

        // ─── GEMINI AUTO REPLY (with thinking separation, using AI.enhancedAI) ───
        const isAutoReplyEnabled = !m.isGroup ? (db.game.private_ai_disabled === false) : (gemini_autoreply[m.chat] === true);
        if (!messageHandled && isAutoReplyEnabled && !isCmd && !m.key.fromMe && !isCreator && m.key.remoteJid !== 'status@broadcast' && (body || budy) && !chat_ai[m.sender]) {
            try {
                const ownerName = global.ownerName || global.author || 'Infinite Vybeflix';
                const ownerNum = (global.owner?.[0] || '254116903500');
                const botName = global.botname || 'Maureonix';
                const apiKey = global.geminiApiKey;
                if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
                    const memSize = global.geminiMemorySize || 50;
                    const histKey = m.isGroup ? m.chat : m.sender;
                    if (!gemini_history[histKey]) gemini_history[histKey] = [];
                    const systemPrompt = `You are ${botName}, a WhatsApp bot. Created by ${ownerName} (${ownerNum}). Reply in the same language. Be concise.`;
                    memoryStore.appendGeminiMessage(histKey, 'user', body || budy, m.isGroup);
                    if (gemini_history[histKey].length > memSize) gemini_history[histKey].shift();
                    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            system_instruction: { parts: [{ text: systemPrompt }] },
                            contents: memoryStore.getGeminiCompatibleHistory(histKey, memSize)
                        })
                    });
                    const geminiData = await geminiRes.json();
                    let replyText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (replyText) {
                        let answer = replyText;
                        let reasoning = '';
                        if (replyText.includes('💭')) {
                            const parts = replyText.split(/💭/i);
                            answer = parts[0].trim();
                            reasoning = parts.slice(1).join(' ').trim();
                        }
                        if (!db.thinkingSessions) db.thinkingSessions = {};
                        db.thinkingSessions[m.sender] = { reasoning, timestamp: Date.now(), query: body || budy };
                        memoryStore.appendGeminiMessage(histKey, 'model', replyText, m.isGroup);
                        await m.reply(answer + '\n\n_💭 Type .thinking to see my reasoning_');
                        if (set.ownerMirror && m.sender !== ownerNumber[0]) {
                            await nimesha.sendMessage(ownerNumber[0], { text: `📨 *Gemini reply to ${m.pushName}*\n👤 ${m.sender}\n💬 ${(body || budy).slice(0, 200)}\n\n🤖 ${answer.slice(0, 300)}` }).catch(() => {});
                        }
                        return;
                    } else {
                        // Gemini returned no text – set handled so no other block fires
                        messageHandled = true;
                        // optional soft fallback (uncomment if you want a reply)
                        // await nimesha.sendMessage(m.chat, { text: '🤖 *Maureonix*\n\nI couldn\'t process that right now. Please try again.' }, { quoted: m });
                    }
                }
            } catch (e) {
                console.log('Gemini AutoReply Error:', e.message);
                messageHandled = true;   // prevent falling through to dispatcher
            }
        }

        if (messageHandled) return;
        if (!m.isGroup && !isCreator && isCmd) return;

        // ─── GROUP SETTINGS & ANTI‑SPAM (condensed but functional) ───
        if (m.isGroup) {
            if (db.groups[m.chat].mute && !isCreator) return;
            // Anti Hidetag
            if (!m.key.fromMe && m.mentionedJid?.length === m.metadata.participants?.length && db.groups[m.chat].antihidetag && !isCreator && m.isBotAdmin && !m.isAdmin) {
                await nimesha.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender }});
                await m.reply('*Anti Hidetag is active❗*');
            }
            // Anti Tag Status
            if (!m.key.fromMe && db.groups[m.chat].antitagsw && !isCreator && m.isBotAdmin && !m.isAdmin) {
                if (m.type === 'groupStatusMentionMessage' || m.message?.groupStatusMentionMessage || m.message?.protocolMessage?.type === 25 || Object.keys(m.message).length === 1 && Object.keys(m.message)[0] === 'messageContextInfo') {
                    if (!db.groups[m.chat].tagsw[m.sender]) {
                        db.groups[m.chat].tagsw[m.sender] = 1;
                        await m.reply(`⚠️ Warning 1/5 – do not tag the group in status.\n@${m.sender.split('@')[0]}`);
                    } else if (db.groups[m.chat].tagsw[m.sender] >= 5) {
                        await nimesha.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                        delete db.groups[m.chat].tagsw[m.sender];
                    } else {
                        db.groups[m.chat].tagsw[m.sender] += 1;
                        await m.reply(`⚠️ Warning ${db.groups[m.chat].tagsw[m.sender]}/5 – do not tag the group in status.`);
                    }
                }
            }
            // Anti Toxic (simplified)
            const badWords = ['fuck', 'shit', 'bitch', 'cunt', 'asshole'];
            if (!m.key.fromMe && db.groups[m.chat].antitoxic && !isCreator && m.isBotAdmin && !m.isAdmin) {
                if (budy.toLowerCase().split(/\s+/).some(word => badWords.includes(word))) {
                    await nimesha.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender }});
                    await m.reply(`@${m.sender.split('@')[0]} toxic language detected.`);
                }
            }
            // Anti Delete
            if (m.type === 'protocolMessage' && m.msg?.type === 0 && db.groups[m.chat].antidelete && !isCreator && m.isBotAdmin && !m.isAdmin) {
                const chats = store?.messages?.[m.chat]?.array?.find(a => a.key.id === m.msg.key.id);
                if (chats?.message) {
                    const msgType = Object.keys(chats.message)[0];
                    const msgContent = chats.message[msgType];
                    if (msgContent.fileSha256 && msgContent.mediaKey) {
                        msgContent.mediaKey = fixBytes(msgContent.mediaKey);
                        msgContent.fileSha256 = fixBytes(msgContent.fileSha256);
                        msgContent.fileEncSha256 = fixBytes(msgContent.fileEncSha256);
                    }
                    msgContent.contextInfo = { mentionedJid: [chats.key.participant], isForwarded: true };
                    const pesan = msgType === 'conversation' ? { extendedTextMessage: { text: msgContent, contextInfo: { mentionedJid: [chats.key.participant] }}} : { [msgType]: msgContent };
                    await nimesha.relayMessage(m.chat, pesan, {});
                }
            }
            // Anti Link Group
            if (db.groups[m.chat].antilink && !isCreator && m.isBotAdmin && !m.isAdmin && budy.match('chat.whatsapp.com/')) {
                await nimesha.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender }});
                await m.reply(`@${m.sender.split('@')[0]} group links not allowed.`);
            }
            // Anti Virtex
            if (db.groups[m.chat].antivirtex && !isCreator && m.isBotAdmin && !m.isAdmin) {
                if (budy.length > 4500 || m.msg?.nativeFlowMessage?.messageParamsJson?.length > 3500) {
                    await nimesha.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender }});
                    await nimesha.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                    await m.reply(`@${m.sender.split('@')[0]} removed for virtex.`);
                }
            }
        }

        // Auto Read, Auto Status, Auto React, Auto Reply (condensed)
        if (m.message && m.key.remoteJid !== 'status@broadcast') {
            if ((set.autoread && nimesha.public) || isCreator) {
                nimesha.readMessages([m.key]);
                console.log(chalk.black(chalk.bgWhite('[ MESSAGE ]:'), chalk.bgGreen(new Date), chalk.bgHex('#00EAD3')(budy || m.type), chalk.bgHex('#AF26EB')(m.key.id) + '\n' + chalk.bgCyanBright('[ FROM ] :'), chalk.bgYellow(m.pushName || (isCreator ? 'Bot' : 'Anonym')), chalk.bgHex('#FF449F')(m.sender), chalk.bgHex('#FF5700')(m.isGroup ? m.metadata.subject : m.chat.endsWith('@newsletter') ? 'Newsletter' : 'Private Chat'), chalk.bgBlue('(' + m.chat + ')')));
            }
        }
        if (m.key.remoteJid === 'status@broadcast' && set.autostatus && !m.key.fromMe) {
            await nimesha.readMessages([m.key]);
            if (set.autostatusreact) await nimesha.sendMessage(m.chat, { react: { text: '👍', key: m.key } });
        }
        if (set.autoreactmention && m.mentionedJid?.includes(botNumber) && !m.key.fromMe) {
            await nimesha.sendMessage(m.chat, { react: { text: '👀', key: m.key } });
        }
        if (set.autoreplymention && m.mentionedJid?.includes(botNumber) && !m.key.fromMe) {
            const replyText = set.autoreplymention.replace(/{user}/g, `@${m.sender.split('@')[0]}`);
            await nimesha.sendMessage(m.chat, { text: replyText, mentions: [m.sender] }, { quoted: m });
        }

        // ─── AUTO COMMANDS SHORTCUTS (autodownload, autoforward, autosticker, etc.) ───
        if (set.autodownload && m.key.remoteJid === 'status@broadcast' && !m.key.fromMe) {
            try {
                const media = m.message?.protocolMessage || m.message?.imageMessage || m.message?.videoMessage;
                if (media) {
                    const buffer = await nimesha.downloadMediaMessage(m);
                    await nimesha.sendMessage(ownerNumber[0], { [media.imageMessage ? 'image' : 'video']: buffer, caption: `Status from @${m.sender.split('@')[0]}`, mentions: [m.sender] });
                }
            } catch {}
        }
        if (set.autoforward && !m.key.fromMe && m.key.remoteJid !== 'status@broadcast') {
            try { await nimesha.sendMessage(set.autoforward, { forward: m }, {}); } catch {}
        }
        if (set.autosticker && !m.key.fromMe && (m.type === 'imageMessage' || m.type === 'videoMessage')) {
            try {
                const buffer = await m.download();
                const sticker = await writeExif(buffer, { packname, author });
                await nimesha.sendMessage(m.chat, { sticker: fs.readFileSync(sticker) }, { quoted: m });
                fs.unlinkSync(sticker);
            } catch {}
        }
        if (set.autodelete > 0 && m.key.fromMe) {
            setTimeout(async () => { try { await nimesha.sendMessage(m.chat, { delete: m.key }); } catch {} }, set.autodelete * 1000);
        }
        if (set.autoreact && !m.key.fromMe) {
            try { await nimesha.sendMessage(m.chat, { react: { text: set.autoreact, key: m.key } }); } catch {}
        }

        // Anti Spam & DidYouMean
        if (nimesha.public && isCmd) {
            if (set.autotyping) await nimesha.sendPresenceUpdate('composing', m.chat);
            if (set.antispam && antiSpam.isFiltered(m.sender)) return m.reply('「 ❗ 」Please wait 5 seconds between commands.');
        }
        if (isCmd && !isCreator) antiSpam.addFilter(m.sender);

        // ─── FIXED .vv COMMAND (view‑once) – replies only to quoted message ───
        if (isCmd && command === 'vv' && m.quoted && m.quoted.msg && (m.quoted.msg.viewOnce || m.quoted.msg.viewOnceMessageV2)) {
            try {
                const mediaBuffer = await nimesha.downloadMediaMessage(m.quoted);
                if (!mediaBuffer) return m.reply('Could not download view‑once media.');
                const mimeType = m.quoted.msg.mimetype || (m.quoted.type === 'imageMessage' ? 'image/jpeg' : 'video/mp4');
                const isImage = mimeType.startsWith('image/');
                const msgOptions = isImage
                    ? { image: mediaBuffer, caption: '👁️ View‑once image recovered.' }
                    : { video: mediaBuffer, caption: '👁️ View‑once video recovered.' };
                await nimesha.sendMessage(m.chat, msgOptions, { quoted: m });
                await nimesha.sendMessage(m.chat, { delete: m.key }).catch(() => {});
            } catch (e) { console.error('[vv error]', e); m.reply('Failed to retrieve view‑once media.'); }
            return;
        }

        // Inbox auto-add
        if (!m.isGroup && !m.key.fromMe && m.key.remoteJid !== 'status@broadcast' && m.sender && isCmd) {
            try {
                const autoGroupJid = global.my?.ch;
                if (autoGroupJid && autoGroupJid.endsWith('@g.us')) {
                    const groupMeta = await nimesha.groupMetadata(autoGroupJid).catch(()=>null);
                    if (groupMeta) {
                        const alreadyIn = groupMeta.participants.some(p => (p.id || p.lid || '').replace(/[^0-9]/g, '') === m.sender.replace(/[^0-9]/g, ''));
                        if (!alreadyIn) {
                            const findJid = typeof nimesha.findJidByLid === 'function' ? nimesha.findJidByLid(m.sender.replace(/[^0-9]/g, '') + '@lid', store) : null;
                            const addJid = findJid ? (m.sender.replace(/[^0-9]/g, '') + '@lid') : m.sender;
                            const res = await nimesha.groupParticipantsUpdate(autoGroupJid, [addJid], 'add').catch(()=>null);
                            if (res?.[0]?.status == 403) {
                                const invCode = await nimesha.groupInviteCode(autoGroupJid).catch(()=>null);
                                if (invCode) await nimesha.sendMessage(m.sender, { text: '*Maureonix Group*\nhttps://chat.whatsapp.com/BWhOCHhbXpD2tiNF9JGXqp' });
                            }
                        }
                    }
                }
            } catch(e) {}
        }

        // Menfes & Room AI
        if (!m.isGroup && (!isCmd || isCreator)) {
            if (menfes[m.sender] && m.key.remoteJid !== 'status@broadcast' && m.msg) {
                m.react('✈');
                m.msg.contextInfo = { isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: `*Message from ${menfes[m.sender].nama || 'Someone'}*`}, key: { remoteJid: '0@s.whatsapp.net', fromMe: false, participant: '0@s.whatsapp.net' }};
                const pesan = m.type === 'conversation' ? { extendedTextMessage: { text: m.msg, contextInfo: { isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: `*Message from ${menfes[m.sender].nama || 'Someone'}*`}, key: { remoteJid: '0@s.whatsapp.net', fromMe: false, participant: '0@s.whatsapp.net' }}}} : { [m.type]: m.msg };
                await nimesha.relayMessage(menfes[m.sender].tujuan, pesan, {});
            }
            if (chat_ai[m.sender] && m.key.remoteJid !== 'status@broadcast') {
                if (!/^(del((room|c|hat)ai)|>|<$)$/i.test(command) && budy) {
                    chat_ai[m.sender].push({ role: 'user', content: budy });
                    if (chat_ai[m.sender].length > 20) chat_ai[m.sender].shift();
                    let hasil;
                    try {
                        const base = global.APIs?.nima || 'https://api.nima.biz.id';
                        const key = global.APIKeys?.[base] || '';
                        const res = await fetch(base + '/ai/chat4', { method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: chat_ai[m.sender], prompt: budy }) });
                        if (res.ok) hasil = await res.json();
                        else hasil = null;
                    } catch(e) { hasil = null; }
                    const response = hasil?.result?.message || 'Sorry, I don\'t understand.';
                    chat_ai[m.sender].push({ role: 'assistant', content: response });
                    if (chat_ai[m.sender].length > 20) chat_ai[m.sender].shift();
                    await m.reply(response);
                }
            }
        }

        // AFK
        let mentionUser = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])];
        for (let jid of mentionUser) {
            let user = db.users[jid];
            if (user && user.afkTime && user.afkTime > -1) {
                let reason = user.afkReason || '';
                m.reply(`Don't tag them!\nThey are AFK ${reason ? 'because ' + reason : ''}\nTime: ${clockString(new Date - user.afkTime)}`.trim());
            }
        }
        if (db.users[m.sender].afkTime > -1) {
            let user = db.users[m.sender];
            m.reply(`@${m.sender.split('@')[0]} is no longer AFK${user.afkReason ? ' because ' + user.afkReason : ''}\nTime: ${clockString(new Date - user.afkTime)}`);
            user.afkTime = -1;
            user.afkReason = '';
        }

        // ─── .thinking COMMAND (uses AI.getThinking) ───
        if (isCmd && command === 'thinking' && !messageHandled) {
            const thinking = AI.getThinking(m.sender);
            if (thinking !== 'No recent thinking available.') {
                await m.reply(`💭 *My reasoning:*\n\n${thinking}`);
            } else {
                await m.reply('No reasoning available. Ask me something first, then use this command.');
            }
            return;
        }

        // ─── FINAL: LOAD AND EXECUTE COMMANDS FROM nima_commands.js ───
        const handleCommand = require('./nima_commands');
        await handleCommand(nimesha, m, {
            mess,
            isCmd, command, args, text, q, prefix, isCreator, isOwner, ownerNumber,
            set, sewa, premium, db, store, botNumber,
            chat_ai, gemini_autoreply, gemini_history, menfes, learningSessionManager,
            checkStatus, getExpired, formatDate, listv, fake, my, tempatDB,
            isVip, isBan, isLimit, isPremium, isNsfw,
            author, packname, botname, dayName, tanggal, jam, ucapanWaktu,
            setv, fkontak, readmore, fileSha256: null, budy, body,
            AI, Search, Tools, Fun, Economy, Admin, Daily, Health, Finance, Social, Dev, Travel, Food,
            RAWG, TriviaMaster, PokemonGame, NumbersGame, FunAPIs, RPGAdventure,
            slotMachine, rouletteSpin, crash, diceRoll, coinflip, rpsls, mathQuiz, anagram, numberGuess,
            OMDB, TVMaze, AniList, Jikan, TMDB, MovieGuesser, Movie, fmtCast,
            APISports, OddsAPI, ESPN,
            ytMp3, ytMp4, tiktokDownload, igDownload, fbDownload,
            twitterDownload, spotifyDownload, pinterestDownload,
            redditDownload, soundcloudDownload, threadsDownload,
            capcutDownload, likeeDownload, snapchatDownload,
            vimeoDownload, dailymotionDownload, mediafireDownload,
            gdriveDownload, apkDownload,
            toAudio, toPTT, toVideo, generateMenuImage,
            runtime, clockString, sleep, isUrl, formatDate, generateProfilePicture,
            pickRandom, similarity, almost, cases, getBuffer, writeExif
        });

    } catch (e) {
        console.error(e);
        if (e?.message?.includes('No sessions')) return;
        const errorKey = e?.code || e?.name || e?.message?.slice(0, 100) || 'unknown_error';
        const now = Date.now();
        if (!errorCache[errorKey]) errorCache[errorKey] = [];
        errorCache[errorKey] = errorCache[errorKey].filter(ts => now - ts < 600000);
        if (errorCache[errorKey].length >= 3) return;
        errorCache[errorKey].push(now);
        if (m && m.reply) m.reply('Error: ' + (e?.name || e?.code || 'Unknown'));
    }
};

module.exports = coreHandler;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});
