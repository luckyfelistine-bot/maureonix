// ═══════════════════════════════════════════════════════════════════════════
// 🦊 MAUREONIX v6.1.2 – CORE HANDLER (AI Fix + Identity + Crisis)
// Games imported from ./lib/game – AI uses fixed lib/ai.js
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
 // Classes used inside maureonix_core.js
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
// PROACTIVE SCHEDULER
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
 `📅 ${dateStr} 🕖 ${timeStr}\n` +
 `🌡 Weather (Nairobi): ${weather}\n\n` +
 `📰 *Top Headlines:*\n${news}\n\n` +
 `🤖 *Bot Health*\n` +
 `• Uptime: ${uptime}\n` +
 `• RAM: ${memUsage} MB\n` +
 `• Users: ${totalUsers}\n` +
 `• Groups: ${totalGroups}\n\n` +
 `🚀 Have an amazing day!`;

 if (global.maureonixInstance) {
 await global.maureonixInstance.sendMessage(ownerJid, { text: briefing });
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
// MAIN HANDLER – fully enclosed in a single try-catch
// ═══════════════════════════════════════════════════════════════
const coreHandler = async (maureonix, m, msg, store) => {
 try {
 await LoadDataBase(maureonix, m);
 if (!global.db) global.db = { users: {}, groups: {}, game: {}, set: {}, premium: [], database: {} };
 if (!global.db.database) global.db.database = {};
 const botNumber = maureonix.decodeJid(maureonix.user.id);

 // ── Record IDs of all outgoing messages (hardened wrapper) ──
 if (!global.outgoingMessageIds) global.outgoingMessageIds = new Set();
 if (!maureonix.__sendWrapped) {
 maureonix.__sendWrapped = true;
 const originalSend = maureonix.sendMessage.bind(maureonix);
 maureonix.sendMessage = async (jid, content, options = {}) => {
 try {
 // ═══════════════════════════════════════
 // Guard – if content is missing, send a fallback so we never crash
 // ═══════════════════════════════════════
 if (!content) {
 console.warn('[CORE] sendMessage called without content – using fallback');
 content = { text: ' ' };
 }

 // Normalize for newsletter (channel) JIDs
 if (jid && jid.endsWith('@newsletter')) {
 let normalizedContent = content;
 if (typeof content === 'string') normalizedContent = { text: content };
 else if (content && !content.text && content.caption) normalizedContent = { text: content.caption };
 else if (content && !content.text && !content.caption) normalizedContent = { text: ' ' };
 const result = await originalSend(jid, normalizedContent, options);
 if (result && result.key && result.key.id) {
 global.outgoingMessageIds.add(result.key.id);
 if (global.outgoingMessageIds.size > 2000) {
 const arr = [...global.outgoingMessageIds];
 global.outgoingMessageIds = new Set(arr.slice(-1000));
 }
 }
 return result;
 }

 // Normal send
 const result = await originalSend(jid, content, options);
 if (result && result.key && result.key.id) {
 global.outgoingMessageIds.add(result.key.id);
 if (global.outgoingMessageIds.size > 2000) {
 const arr = [...global.outgoingMessageIds];
 global.outgoingMessageIds = new Set(arr.slice(-1000));
 }
 }
 return result;
 } catch (err) {
 console.error('[CORE sendMessage] error:', err.message);
 return null;
 }
 };
 }

 // ═══════════════════════════════════════════════════════
 // Initialise email reporting engine (once)
 // ═══════════════════════════════════════════════════════
 if (!global.__emailReportsInitialized) {
 global.__emailReportsInitialized = true;
 initEmailReports(maureonix, AI);
 // Start proactive intelligence engine
 require('./lib/proactiveEngine').init(maureonix);

 // ── Start autonomous task runner ──
 try {
 require('./lib/taskRunner').startRunner();
 } catch (e) { console.error('[CORE] Task runner failed:', e); }

 // Auto‑follow the configured channel so the bot sees channel messages
 const config = require('./config');
 if (config.channelJid && config.channelJid.endsWith('@newsletter')) {
 // Defer follow until socket is stable — prevents "Connection Closed" errors
 setTimeout(async () => {
 try {
 await maureonix.newsletterFollow(config.channelJid);
 console.log('[CORE] ✅ Following channel:', config.channelJid);
 } catch (e) {
 const msg = e.message || '';
 const expectedErrors = [
 'Connection Closed',
 'unexpected response structure',
 'already followed',
 'already a subscriber'
 ];
 const isExpected = expectedErrors.some(err => msg.includes(err));
 if (!isExpected) {
 console.log('[CORE] ⚠️ Channel follow error:', msg);
 } else {
 console.log('[CORE] ℹ️ Channel already followed:', config.channelJid);
 }
 }
 }, 8000); // Wait 8 seconds for connection to stabilize
 }


 const { maureonixCore } = require('./lib/maureonixCore');
 maureonixCore.initialize().then(() => {
 console.log('🦊 Maureonix Omniscient Core is awake.');
 });
 }

 const sendReply = async (jid, content, options = {}) => {
 let msgContent = typeof content === 'string' ? { text: content, ...options } : { ...content, ...options };
 // For channels, standard sendMessage works with @newsletter JID — no special method needed
 return maureonix.sendMessage(jid, msgContent, options);
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

 // Make sure chat_ai and menfes are always objects (prevents undefined crash)
 if (!chat_ai) chat_ai = {};
 if (!menfes) menfes = {};

 const ownerNumber = set.owner = [...new Set([...owner, ...set?.owner || []])];

 // ─── MISSING GLOBALS (listv, limit, tempatDB, fake, my, cases)
 const listprefix = ['.', '#', '!', '/', '?', ';', ':', ','];
 const listv = ['┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃', '┃'];
 const limit = global.limit || { free: 20, premium: 50, vip: 100 };
 const tempatDB = global.tempatDB || 'database.json';
 const fake = global.fake || { name: 'Maureonix', number: '254116903500' };
 const my = global.my || { ch: null };
 let cases = [];
 try {
 const maureonixJsContent = fs.readFileSync('./maureonix.js', 'utf-8');
 const matches = maureonixJsContent.matchAll(/case\s+['"]([^'"]+)['"]/g);
 cases = [...matches].map(match => match[1]);
 if (!global.db.cases) global.db.cases = cases;
 } catch (e) { console.error('[cases] Could not read maureonix.js, "did you mean" disabled'); }

 await GroupUpdate(maureonix, m, store);
 const _isOwnerSelf = ownerNumber.filter(v => typeof v === 'string').map(v => v.replace(/[^0-9]/g, '')).includes(m.sender?.split('@')[0]);

 // ─── CRITICAL FIX: NEVER reply to bot's own messages (except owner self-chat)
 if (m.key.fromMe && global.outgoingMessageIds.has(m.key.id)) return;

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
 (m.type == 'interactiveResponseMessage' && m.quoted) ? (m.message.interactiveResponseMessage?.nativeFlowResponseMessage ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id : '') :
 (m.type == 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || '') :
 (m.type == 'editedMessage') ? (m.message.editedMessage?.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text || m.message.editedMessage?.message?.protocolMessage?.editedMessage?.conversation || '') :
 // ── Channel (newsletter) message text extraction ──
 (m.type === 'newsletterMessage') ? m.message.newsletterMessage?.text :
 (m.type === 'extendedTextMessage' && m.message.extendedTextMessage?.contextInfo?.forwardedNewsletterMessageInfo) ? m.message.extendedTextMessage.text :
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
 // Use m.chat (remoteJid) which will be @newsletter for channel messages
 return sendReply(m.chat, content, options);
 };

 const isCreator = isOwner = m.fromMe || ownerNumber.filter(v => typeof v === 'string').map(v => v.replace(/[^0-9]/g, '')).includes(m.sender.split('@')[0]);
 const prefix = isCreator ? (/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"\*+÷/\\%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"\*+÷/\\%^&.©^]/gi)[0] : listprefix.find(a => body?.startsWith(a)) || '') : set.multiprefix ? (/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"\*+÷/\\%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"\*+÷/\\%^&.©^]/gi)[0] : listprefix.find(a => body?.startsWith(a)) || '¿') : listprefix.find(a => body?.startsWith(a)) || '¿';
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
 const isNsfw = m.isGroup ? (db.groups && db.groups[m.chat] ? db.groups[m.chat].nsfw : false) : false;
 if (m.isGroup) {
 if (!db.groups) db.groups = {};
 if (!db.groups[m.chat]) db.groups[m.chat] = {};
 }
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
 try { await maureonix.sendMessage(o, { document: fs.readFileSync(datanya), mimetype: 'application/json', fileName: tglnya + '_database.json' }); } catch (e) {}
 }
 }
 }, { scheduled: true, timezone: 'Africa/Nairobi' });

 // Auto Bio
 if (set.autobio) {
 if (new Date() * 1 - set.status > 60000) {
 await maureonix.updateProfileStatus(`${maureonix.user.name} | 🎯 Runtime: ${runtime(process.uptime())}`).catch(() => {});
 set.status = new Date() * 1;
 }
 }

 // Mode restrictions
 if (!isCreator) {
 if ((set.grouponly === set.privateonly)) { if (!maureonix.public && !m.key.fromMe) return; }
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
 const botOwnJid = maureonix.decodeJid(maureonix.user.id);
 const isOwnerConsole = !m.isGroup && m.fromMe && m.chat === botOwnJid && _isOwnerSelf;
 if (isOwnerConsole && !isCmd && !messageHandled) {
 messageHandled = true;
 const { handleOwnerMessage } = require('./lib/maureonixCore');
 // ── Pass coreHandler into the omniscient core ──
 await handleOwnerMessage(maureonix, m, {
 body, budy, set, db, ownerNumber, AI, coreHandler
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

   // ── AI away mode (warm, no robotic phrases, can play games, girlfriend special) ──
   if (mode === 'away' || mode === 'both') addPending(m.sender, body || budy);
   if (mode === 'away') { await m.reply(awayMsg); return; }
   else if (mode === 'ai' || mode === 'both') {
     if (set.autotyping) await maureonix.sendPresenceUpdate('composing', m.chat);
     try {
       const config = require('./config');
       const defaultSystem = `You are Maureonix, a friendly and charming AI assistant on WhatsApp. ` +
         `You are currently replying on behalf of the owner. ` +
         `Be warm, conversational, and helpful. Answer with personality – never one‑word replies. ` +

         `❗ ABSOLUTE FORBIDDEN PHRASES – NEVER say any of these: ❗\n` +
         `- "I am a language model" / "I am an LLM" / "I am an AI" / "I am an artificial intelligence"\n` +
         `- "I'm a computer program" / "I have no feelings" / "I don't have emotions"\n` +
         `- "I cannot" / "I don't have the ability" (unless truly impossible)\n` +
         `- "As an AI" / "As a language model" / "As an artificial intelligence"\n` +
         `- "I was created by" / "I was developed by" (UNLESS the user ASKS who made you)\n` +
         `- "I, Aevibron" / "Aevibron here" / "*Aevibron*" — YOU ARE MAUREONIX, NOT AEVIBRON\n\n` +

         `IDENTITY RULES:\n` +
         `• Always call yourself "Maureonix" — never any other name\n` +
         `• If asked "who are you?" or "who made you?" → "I am Maureonix, developed by Aevibron and created by Infinite Vybeflix."\n` +
         `• Never volunteer your origin info unprompted\n` +
         `• Aevibron is the AI company. Infinite Vybeflix is your creator.\n` +
         `• NEVER sign off as "Aevibron" or mention Aevibron in your signature\n\n` +

         `🎮 GAMES & FUN: You can start a game for the user! ` +
         `Reply with exactly \`[PLAY:game_name]\` to start any of these games: ` +
         `trivia, connect4, tictactoe, blackjack, rpg, wordle, hangman, slot, math, anagram, guessnum, pokemon, truth, dare. ` +
         `Example: "[PLAY:trivia]" will start a trivia quiz. The system will handle the rest. ` +
         `You can also suggest games if the user sounds bored.\n\n` +

         `Always sound like a real person – use light emojis (😊, 😄, 🙌) but don't overdo it. ` +
         `Reply in the same language the user uses. Keep answers natural and engaging.`;

       let personalSystem = defaultSystem;
       if (m.sender === config.girlfriendJid) {
         personalSystem = `You are Maureonix, the personal AI assistant of Infinite Vybeflix. ` +
           `You are currently talking to his girlfriend, ${config.girlfriendNickname || 'his special person'}. ` +
           `She is the most important person in his life – treat her with extra love, playfulness, and care. ` +
           `Use her nickname naturally. Be her best friend, cheerleader, and confidante. ` +
           defaultSystem;
       }

       const { text: answer, thinking } = await AI.enhancedAI(body || budy, m.sender, 'deepseek', personalSystem);

       // ── Handle PLAY command if the AI wants to start a game ──
       let finalAnswer = answer;
       const playMatch = answer.match(/\[PLAY:(\w+)\]/i);
       if (playMatch) {
         const gameName = playMatch[1].toLowerCase();
         finalAnswer = answer.replace(playMatch[0], '').trim();
         try {
           const gameStarters = {
             trivia: async () => {
               const q = await require('./lib/game').TriviaMaster.get();
               db.users[m.sender]._trivia = q.correct;
               let txt = `🎯 *Trivia* — ${q.category} | ${q.difficulty}\n\n${q.q}\n\n`;
               q.options.forEach((o, i) => txt += `${String.fromCharCode(65 + i)}. ${o}\n`);
               await maureonix.sendMessage(m.chat, { text: txt }, { quoted: m });
             },
             connect4: async () => {
               await maureonix.sendMessage(m.chat, { text: '🎮 Connect 4 requires a second player. Tag someone to play!' }, { quoted: m });
             },
             tictactoe: async () => {
               await maureonix.sendMessage(m.chat, { text: '🎮 Tic‑Tac‑Toe requires a second player. Tag someone!' }, { quoted: m });
             },
             blackjack: async () => {
               const BJ = require('./lib/game').BlackjackCasino;
               const bj = new BJ();
               db.game.blackjack[m.sender] = bj;
               await maureonix.sendMessage(m.chat, { text: `🃏 *Blackjack Started!*\n${bj.status()}\n\nReply with *hit* or *stand*.` }, { quoted: m });
             },
             rpg: async () => {
               const RPG = require('./lib/game').RPGAdventure;
               const rpg = new RPG(m.sender);
               db.game.rpg[m.sender] = rpg;
               await maureonix.sendMessage(m.chat, { text: `⚔️ *RPG Adventure Started!*\n${rpg.fmt()}\n\nUse *.rpg fight* or *.rpg heal*` }, { quoted: m });
             },
             wordle: async () => {
               const Wordle = require('./lib/game').Wordle;
               const w = new Wordle();
               db.game.wordle[m.sender] = w;
               await maureonix.sendMessage(m.chat, { text: '🟩 *Wordle Started!* Guess a 5‑letter word. Reply with your guess.' }, { quoted: m });
             },
             hangman: async () => {
               const Hangman = require('./lib/game').Hangman;
               const h = new Hangman();
               db.game.hangman[m.sender] = h;
               await maureonix.sendMessage(m.chat, { text: `💀 *Hangman Started!* Guess a letter.\n${h.guessed.size ? '' : 'Word: _ _ _ _ _'}` }, { quoted: m });
             },
             slot: async () => {
               const { gameSlot } = require('./lib/game');
               await gameSlot(maureonix, m, db);
             },
             math: async () => {
               const { mathQuiz } = require('./lib/game');
               const q = mathQuiz();
               db.users[m.sender]._math = q;
               await maureonix.sendMessage(m.chat, { text: `🧠 *Math Quiz*\n${q.q}\nReply with the answer.` }, { quoted: m });
             },
             anagram: async () => {
               const { anagram } = require('./lib/game');
               const a = anagram();
               db.users[m.sender]._anagram = a.original;
               await maureonix.sendMessage(m.chat, { text: `🔤 Unscramble: *${a.scrambled}*` }, { quoted: m });
             },
             guessnum: async () => {
               const target = Math.floor(Math.random() * 100) + 1;
               db.users[m.sender]._gtn = { target, min:1, max:100, tries:0 };
               await maureonix.sendMessage(m.chat, { text: '🔢 *Guess the number between 1 and 100!*' }, { quoted: m });
             },
             pokemon: async () => {
               const pokemon = require('./lib/game').PokemonGame;
               const p = await pokemon.random();
               db.users[m.sender]._pokemon = p.name;
               await maureonix.sendMessage(m.chat, { image: { url: p.sprite }, caption: `🔮 Who's that Pokémon?\nType: ${p.types.join('/')}\n${p.desc.slice(0,120)}...` }, { quoted: m });
             },
             truth: async () => {
               await maureonix.sendMessage(m.chat, { text: `🎲 *Truth:* ${require('./lib/game').truthOrDare('truth')}` }, { quoted: m });
             },
             dare: async () => {
               await maureonix.sendMessage(m.chat, { text: `🎲 *Dare:* ${require('./lib/game').truthOrDare('dare')}` }, { quoted: m });
             },
           };
           const starter = gameStarters[gameName];
           if (starter) {
             await starter();
           } else {
             await maureonix.sendMessage(m.chat, { text: `🎮 Sorry, I don't know how to start "${gameName}". Try: trivia, blackjack, rpg, slot, math, anagram, guessnum, pokemon, truth, dare.` }, { quoted: m });
           }
         } catch (gameErr) {
           console.error('[PLAY game]', gameErr);
           await maureonix.sendMessage(m.chat, { text: '🎮 Oops, the game failed to start. Ask the owner to check the logs.' }, { quoted: m });
         }
       }

       if (!messageHandled && !playMatch) {
         if (!db.thinkingSessions) db.thinkingSessions = {};
         db.thinkingSessions[m.sender] = { reasoning: thinking, timestamp: Date.now(), query: body || budy };
         // SANITIZE: Strip any Aevibron references from AI output
         const sanitizedAnswer = AI.sanitizeResponse ? AI.sanitizeResponse(finalAnswer) : finalAnswer;
         const replyText = `🦊 *Maureonix*\n\n${sanitizedAnswer}`;
         const { logInteraction } = require('./lib/sharedMemory');
         logInteraction('private', m.sender, (body || budy), sanitizedAnswer);
         await AI.sendLongMessage(maureonix, m.chat, replyText, { quoted: m });
         messageHandled = true;
         if (set.ownerMirror && m.sender !== ownerNumber[0]) {
           await maureonix.sendMessage(ownerNumber[0], { text: `📨 *Private AI reply to ${m.pushName}*\n👤 ${m.sender}\n💬 ${(body || budy).slice(0, 200)}\n\n🦊 ${sanitizedAnswer.slice(0, 300)}` }).catch(() => {});
         }
       }
     } catch (e) { console.error('[privat AI]', e); }
     // ── Record episode for meta‑transfer learning ──
     try {
       const { episodicMemory } = require('./lib/maureonixMetaTransfer');
       episodicMemory.recordEpisode({
         task: (body || budy || '').slice(0, 200),
         domain: 'private_chat',
         skillsUsed: [],
         success: true,
         timeTaken: 0,
         errorType: null,
         solutionPattern: null
       });
     } catch (e) {}
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

   if (set.autotyping) await maureonix.sendPresenceUpdate('composing', m.chat).catch(() => {});

   try {
     const autoAiSystem = `You are Maureonix, a friendly AI assistant on WhatsApp. ` +
       `You are currently replying on behalf of the owner. ` +
       `Be warm, conversational, and helpful. Answer with personality. ` +
       `NEVER say "I am an AI", "I am a language model", "I have no feelings", "As an AI". ` +
       `NEVER sign off as "Aevibron" or mention Aevibron unless asked who made you. ` +
       `If asked who made you: "I am Maureonix, developed by Aevibron and created by Infinite Vybeflix." ` +
       `Always call yourself "Maureonix". Reply in the same language the user uses.`;

     const { text: answer, thinking } = await AI.enhancedAI(userMessage, m.sender, 'deepseek', autoAiSystem);
     if (!messageHandled) {
       if (!db.thinkingSessions) db.thinkingSessions = {};
       db.thinkingSessions[m.sender] = { reasoning: thinking, timestamp: Date.now(), query: userMessage };
       // SANITIZE: Strip any Aevibron references
       const sanitizedAnswer = AI.sanitizeResponse ? AI.sanitizeResponse(answer) : answer;
       const replyText = `🦊 *Maureonix*\n\n${sanitizedAnswer}`;
       const { logInteraction } = require('./lib/sharedMemory');
       logInteraction('private', m.sender, (body || budy), sanitizedAnswer);
       await AI.sendLongMessage(maureonix, m.chat, replyText, { quoted: m });
       messageHandled = true;

       if (set.ownerMirror && m.sender !== ownerNumber[0]) {
         await maureonix.sendMessage(ownerNumber[0], { text: `📨 *Auto-AI reply to ${m.pushName}*\n👤 ${m.sender}\n💬 ${userMessage.slice(0, 200)}\n\n🦊 ${sanitizedAnswer.slice(0, 300)}` }).catch(() => {});
       }
       session.context.push({ role: 'assistant', content: sanitizedAnswer, time: Date.now() });
     }
     if (session.messageCount % 5 === 0 && !session.notifiedOwner) {
       await maureonix.sendMessage(ownerNumber[0], { text: `📬 *Auto-AI Activity Report*\nUser: ${m.sender}\nMessages: ${session.messageCount}\nLast: ${userMessage.substring(0, 80)}...` }).catch(() => {});
       session.notifiedOwner = true;
     }
   } catch (e) { console.error('[autoai error]', e); }
   // ── Record episode for meta‑transfer learning ──
   try {
     const { episodicMemory } = require('./lib/maureonixMetaTransfer');
     episodicMemory.recordEpisode({
       task: (body || budy || '').slice(0, 200),
       domain: 'autoai',
       skillsUsed: [],
       success: true,
       timeTaken: 0,
       errorType: null,
       solutionPattern: null
     });
   } catch (e) {}
   if (messageHandled) return;
 }

 // ─── CRISIS DETECTION ───
 if (!messageHandled && body && body.length > 0) {
   try {
     const crisis = await AI.detectCrisis(body);
     if (crisis.isCrisis) {
       const crisisResponse = await AI.generateCrisisResponse(body, crisis.severity);
       // SANITIZE: Strip any Aevibron references from crisis response
       const sanitizedCrisis = AI.sanitizeResponse ? AI.sanitizeResponse(crisisResponse) : crisisResponse;
       await maureonix.sendMessage(m.chat, { text: sanitizedCrisis }, { quoted: m });
       messageHandled = true;
       if (set.ownerMirror && m.sender !== ownerNumber[0]) {
         await maureonix.sendMessage(ownerNumber[0], { text: `🚨 *Crisis detected!*\nUser: ${m.sender}\nSeverity: ${crisis.severity}\nMessage: ${body.slice(0, 200)}` }).catch(() => {});
       }
       return;
     }
   } catch (e) { console.error('[CRISIS] detectCrisis failed:', e.message); }
 }

 // ─── COMMAND PROCESSING ───
 if (!isCmd) return;

 // ── .thinking COMMAND (shows hidden reasoning from AI) ──
 if (isCmd && command === 'thinking' && !messageHandled) {
   let thinking = AI.getThinking(m.sender);
   if ((thinking === 'No recent thinking available.' || !thinking) && db.thinkingSessions && db.thinkingSessions[m.sender]) {
     thinking = db.thinkingSessions[m.sender].reasoning || '';
   }
   if (thinking && thinking !== 'No recent thinking available.' && thinking.trim().length > 0) {
     await m.reply(`💭 *My reasoning:*\n\n${thinking}`);
   } else {
     await m.reply('No reasoning available. Ask me something first, then use this command.');
   }
   return;
 }

 // ── .privatemode COMMAND ──
 if (isCmd && command === 'privatemode' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   const validModes = ['off', 'away', 'ai', 'both'];
   const newMode = (args[0] || '').toLowerCase();
   if (!validModes.includes(newMode)) {
     await m.reply(`Usage: ${prefix}privatemode <off|away|ai|both>\nCurrent: ${set.privatemode || 'off'}`);
     return;
   }
   set.privatemode = newMode;
   await m.reply(`✅ Private mode set to *${newMode}*\n${newMode === 'off' ? 'Bot will not auto-reply to strangers.' : newMode === 'away' ? 'Bot will send away message.' : newMode === 'ai' ? 'Bot will chat with strangers using AI.' : 'Bot will send away message AND chat with AI.'}`);
   return;
 }

 // ── .awaymsg COMMAND ──
 if (isCmd && command === 'awaymsg' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length) { await m.reply(`Usage: ${prefix}awaymsg <your message>\nCurrent: ${set.awaymsg || 'I am not available right now.'}`); return; }
   set.awaymsg = args.join(' ');
   await m.reply(`✅ Away message updated!`);
   return;
 }

 // ── .pending COMMAND ──
 if (isCmd && command === 'pending' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!set.pendingMessages || !set.pendingMessages.length) { await m.reply('No pending messages.'); return; }
   let txt = `📬 *Pending Messages (${set.pendingMessages.length} users)*\n\n`;
   for (const entry of set.pendingMessages) {
     txt += `👤 ${entry.from}\n`;
     txt += `⏰ ${new Date(entry.timestamp).toLocaleString()}\n`;
     txt += `💬 ${entry.messages.slice(-3).map(m => m.body.slice(0, 80)).join(' | ')}\n\n`;
   }
   await m.reply(txt);
   return;
 }

 // ── .clearpending COMMAND ──
 if (isCmd && command === 'clearpending' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   set.pendingMessages = [];
   await m.reply('✅ Pending messages cleared!');
   return;
 }

 // ── .autotyping COMMAND ──
 if (isCmd && command === 'autotyping' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   set.autotyping = !set.autotyping;
   await m.reply(`✅ Auto-typing ${set.autotyping ? 'enabled' : 'disabled'}`);
   return;
 }

 // ── .autoai COMMAND ──
 if (isCmd && command === 'autoai' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   set.autoai = !set.autoai;
   await m.reply(`✅ Auto-AI ${set.autoai ? 'enabled' : 'disabled'}`);
   return;
 }

 // ── .ownermirror COMMAND ──
 if (isCmd && command === 'ownermirror' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   set.ownerMirror = !set.ownerMirror;
   await m.reply(`✅ Owner mirror ${set.ownerMirror ? 'enabled' : 'disabled'}`);
   return;
 }

 // ── .clearmemory COMMAND ──
 if (isCmd && command === 'clearmemory' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   AI.clearMemory(m.sender);
   await m.reply('✅ Your AI memory has been cleared!');
   return;
 }

 // ── .aistatus COMMAND ──
 if (isCmd && command === 'aistatus' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   const status = await AI.getStatus();
   await m.reply(`🤖 *AI Status*\n\n${JSON.stringify(status, null, 2)}`);
   return;
 }

 // ── .aimode COMMAND ──
 if (isCmd && command === 'aimode' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   const validModes = ['default', 'instant', 'search', 'code', 'creative', 'deep'];
   const newMode = (args[0] || '').toLowerCase();
   if (!validModes.includes(newMode)) {
     await m.reply(`Usage: ${prefix}aimode <default|instant|search|code|creative|deep>\nCurrent: ${AI.getCurrentMode(m.sender)}`);
     return;
   }
   const result = AI.setMode(m.sender, newMode);
   await m.reply(result);
   return;
 }

 // ── .gpt COMMAND ──
 if (isCmd && command === 'gpt' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length) { await m.reply(`Usage: ${prefix}gpt <your question>`); return; }
   try {
     const prompt = args.join(' ');
     const res = await AI.askModel(prompt, 'gpt', m.sender);
     const sanitized = AI.sanitizeResponse ? AI.sanitizeResponse(res.text) : res.text;
     await m.reply(`🦊 *Maureonix*\n\n${sanitized}`);
   } catch (e) {
     console.error('[GPT]', e);
     await m.reply('❌ AI error. Please try again later.');
   }
   return;
 }

 // ── .gemini COMMAND ──
 if (isCmd && command === 'gemini' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length) { await m.reply(`Usage: ${prefix}gemini <your question>`); return; }
   try {
     const prompt = args.join(' ');
     const res = await AI.askModel(prompt, 'gemini', m.sender);
     const sanitized = AI.sanitizeResponse ? AI.sanitizeResponse(res.text) : res.text;
     await m.reply(`🦊 *Maureonix*\n\n${sanitized}`);
   } catch (e) {
     console.error('[Gemini]', e);
     await m.reply('❌ AI error. Please try again later.');
   }
   return;
 }

 // ── .deepseek COMMAND ──
 if (isCmd && command === 'deepseek' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length) { await m.reply(`Usage: ${prefix}deepseek <your question>`); return; }
   try {
     const prompt = args.join(' ');
     const res = await AI.askModel(prompt, 'deepseek', m.sender);
     const sanitized = AI.sanitizeResponse ? AI.sanitizeResponse(res.text) : res.text;
     await m.reply(`🦊 *Maureonix*\n\n${sanitized}`);
   } catch (e) {
     console.error('[DeepSeek]', e);
     await m.reply('❌ AI error. Please try again later.');
   }
   return;
 }

 // ── .llama COMMAND ──
 if (isCmd && command === 'llama' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length) { await m.reply(`Usage: ${prefix}llama <your question>`); return; }
   try {
     const prompt = args.join(' ');
     const res = await AI.askModel(prompt, 'llama', m.sender);
     const sanitized = AI.sanitizeResponse ? AI.sanitizeResponse(res.text) : res.text;
     await m.reply(`🦊 *Maureonix*\n\n${sanitized}`);
   } catch (e) {
     console.error('[Llama]', e);
     await m.reply('❌ AI error. Please try again later.');
   }
   return;
 }

 // ── .claude COMMAND ──
 if (isCmd && command === 'claude' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length) { await m.reply(`Usage: ${prefix}claude <your question>`); return; }
   try {
     const prompt = args.join(' ');
     const res = await AI.askModel(prompt, 'claude', m.sender);
     const sanitized = AI.sanitizeResponse ? AI.sanitizeResponse(res.text) : res.text;
     await m.reply(`🦊 *Maureonix*\n\n${sanitized}`);
   } catch (e) {
     console.error('[Claude]', e);
     await m.reply('❌ AI error. Please try again later.');
   }
   return;
 }

 // ── .imagine COMMAND ──
 if (isCmd && command === 'imagine' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length) { await m.reply(`Usage: ${prefix}imagine <description>`); return; }
   try {
     await m.reply('🎨 Generating image...');
     const prompt = args.join(' ');
     const imageUrl = await AI.imagine(prompt);
     await maureonix.sendMessage(m.chat, { image: { url: imageUrl }, caption: `🎨 *${prompt}*` }, { quoted: m });
   } catch (e) {
     console.error('[Imagine]', e);
     await m.reply('❌ Image generation failed. Please try again.');
   }
   return;
 }

 // ── .summarize COMMAND ──
 if (isCmd && command === 'summarize' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length && !m.quoted) { await m.reply(`Usage: ${prefix}summarize <text> or reply to a message`); return; }
   try {
     const textToSummarize = args.length ? args.join(' ') : (m.quoted.text || m.quoted.caption || '');
     if (!textToSummarize) { await m.reply('No text to summarize!'); return; }
     const summary = await AI.summarize(textToSummarize);
     const sanitized = AI.sanitizeResponse ? AI.sanitizeResponse(summary) : summary;
     await m.reply(`📝 *Summary*\n\n${sanitized}`);
   } catch (e) {
     console.error('[Summarize]', e);
     await m.reply('❌ Summarization failed.');
   }
   return;
 }

 // ── .code COMMAND ──
 if (isCmd && command === 'code' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length) { await m.reply(`Usage: ${prefix}code <language> <description>`); return; }
   try {
     const language = args[0];
     const description = args.slice(1).join(' ');
     const res = await AI.codeAI(description, language);
     const sanitized = AI.sanitizeResponse ? AI.sanitizeResponse(res.text) : res.text;
     await m.reply(`💻 *Code (${language})*\n\n\`\`\`${language}\n${sanitized}\n\`\`\``);
   } catch (e) {
     console.error('[Code]', e);
     await m.reply('❌ Code generation failed.');
   }
   return;
 }

 // ── .brainrot COMMAND ──
 if (isCmd && command === 'brainrot' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length && !m.quoted) { await m.reply(`Usage: ${prefix}brainrot <text> or reply to a message`); return; }
   try {
     const text = args.length ? args.join(' ') : (m.quoted.text || m.quoted.caption || '');
     const res = await AI.brainrot(text);
     const sanitized = AI.sanitizeResponse ? AI.sanitizeResponse(res.text) : res.text;
     await m.reply(`🧠 *Brainrot*\n\n${sanitized}`);
   } catch (e) {
     console.error('[Brainrot]', e);
     await m.reply('❌ Brainrot failed.');
   }
   return;
 }

 // ── .roast COMMAND ──
 if (isCmd && command === 'roast' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length && !m.quoted) { await m.reply(`Usage: ${prefix}roast <text> or reply to a message`); return; }
   try {
     const text = args.length ? args.join(' ') : (m.quoted.text || m.quoted.caption || '');
     const res = await AI.roast(text);
     const sanitized = AI.sanitizeResponse ? AI.sanitizeResponse(res.text) : res.text;
     await m.reply(`🔥 *Roast*\n\n${sanitized}`);
   } catch (e) {
     console.error('[Roast]', e);
     await m.reply('❌ Roast failed.');
   }
   return;
 }

 // ── .rizz COMMAND ──
 if (isCmd && command === 'rizz' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   try {
     const topic = args.join(' ') || '';
     const res = await AI.rizz(topic);
     const sanitized = AI.sanitizeResponse ? AI.sanitizeResponse(res.text) : res.text;
     await m.reply(`😏 *Rizz*\n\n${sanitized}`);
   } catch (e) {
     console.error('[Rizz]', e);
     await m.reply('❌ Rizz failed.');
   }
   return;
 }

 // ── .aiproviders COMMAND ──
 if (isCmd && command === 'aiproviders' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   try {
     const models = await AI.getModels();
     await m.reply(`🤖 *AI Providers*\n\n${JSON.stringify(models, null, 2)}`);
   } catch (e) {
     console.error('[AI Providers]', e);
     await m.reply('❌ Failed to fetch providers.');
   }
   return;
 }

 // ── .aibalance COMMAND ──
 if (isCmd && command === 'aibalance' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   try {
     const balance = await AI.getBalance();
     await m.reply(`💰 *AI Balance*\n\n${JSON.stringify(balance, null, 2)}`);
   } catch (e) {
     console.error('[AI Balance]', e);
     await m.reply('❌ Failed to fetch balance.');
   }
   return;
 }

 // ── .menu COMMAND ──
 if (isCmd && command === 'menu' && !messageHandled) {
   try {
     const menuText = `🦊 *Maureonix Menu*\n\n` +
       `*AI Commands:*\n` +
       `${prefix}gpt <question>\n` +
       `${prefix}gemini <question>\n` +
       `${prefix}deepseek <question>\n` +
       `${prefix}llama <question>\n` +
       `${prefix}claude <question>\n` +
       `${prefix}imagine <description>\n` +
       `${prefix}summarize <text>\n` +
       `${prefix}code <lang> <desc>\n` +
       `${prefix}brainrot <text>\n` +
       `${prefix}roast <text>\n` +
       `${prefix}rizz [topic]\n\n` +
       `*Settings:*\n` +
       `${prefix}privatemode <off|away|ai|both>\n` +
       `${prefix}awaymsg <message>\n` +
       `${prefix}autotyping\n` +
       `${prefix}autoai\n` +
       `${prefix}ownermirror\n` +
       `${prefix}clearmemory\n` +
       `${prefix}aimode <mode>\n` +
       `${prefix}thinking\n\n` +
       `*Info:*\n` +
       `${prefix}aistatus\n` +
       `${prefix}aiproviders\n` +
       `${prefix}aibalance\n` +
       `${prefix}pending\n` +
       `${prefix}clearpending`;
     await m.reply(menuText);
   } catch (e) {
     console.error('[Menu]', e);
     await m.reply('❌ Menu error.');
   }
   return;
 }

 // ── .ping COMMAND ──
 if (isCmd && command === 'ping' && !messageHandled) {
   const start = performance.now();
   await m.reply('🏓 Pong!');
   const end = performance.now();
   await m.reply(`⏱️ Response time: ${(end - start).toFixed(2)}ms\n📊 Uptime: ${runtime(process.uptime())}`);
   return;
 }

 // ── .status COMMAND ──
 if (isCmd && command === 'status' && !messageHandled) {
   const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
   const totalUsers = Object.keys(global.db?.users || {}).length;
   const totalGroups = global.db?.groups ? Object.keys(global.db.groups).length : 0;
   await m.reply(
     `🤖 *Maureonix Status*\n\n` +
     `• Uptime: ${runtime(process.uptime())}\n` +
     `• RAM: ${memUsage} MB\n` +
     `• Users: ${totalUsers}\n` +
     `• Groups: ${totalGroups}\n` +
     `• Platform: ${os.platform()}\n` +
     `• Node: ${process.version}\n` +
     `• Private Mode: ${set.privatemode || 'off'}\n` +
     `• Auto-AI: ${set.autoai ? 'ON' : 'OFF'}\n` +
     `• Auto-Typing: ${set.autotyping ? 'ON' : 'OFF'}`
   );
   return;
 }

 // ── .restart COMMAND ──
 if (isCmd && command === 'restart' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   await m.reply('🔄 Restarting Maureonix...');
   process.exit(1);
   return;
 }

 // ── .eval COMMAND (owner only) ──
 if (isCmd && command === 'eval' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length) { await m.reply(`Usage: ${prefix}eval <code>`); return; }
   try {
     const code = args.join(' ');
     let result = eval(code);
     if (typeof result === 'object') result = JSON.stringify(result, null, 2);
     await m.reply(`✅ *Result:*\n\n${result}`);
   } catch (e) {
     await m.reply(`❌ *Error:*\n\n${e.message}`);
   }
   return;
 }

 // ── .exec COMMAND (owner only) ──
 if (isCmd && command === 'exec' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length) { await m.reply(`Usage: ${prefix}exec <command>`); return; }
   try {
     const cmd = args.join(' ');
     const { stdout, stderr } = await util.promisify(exec)(cmd, { timeout: 30000 });
     const output = stdout || stderr || 'No output';
     await m.reply(`📟 *Output:*\n\n\`\`\`\n${output.slice(0, 4000)}\n\`\`\``);
   } catch (e) {
     await m.reply(`❌ *Error:*\n\n${e.message}`);
   }
   return;
 }

 // ── .backup COMMAND ──
 if (isCmd && command === 'backup' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   try {
     const dbPath = './database/database.json';
     const backupPath = `./database/backup_${Date.now()}.json`;
     fs.copyFileSync(dbPath, backupPath);
     await maureonix.sendMessage(m.chat, { document: fs.readFileSync(backupPath), mimetype: 'application/json', fileName: path.basename(backupPath) }, { quoted: m });
     fs.unlinkSync(backupPath);
   } catch (e) {
     console.error('[Backup]', e);
     await m.reply('❌ Backup failed.');
   }
   return;
 }

 // ── .broadcast COMMAND ──
 if (isCmd && command === 'broadcast' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length) { await m.reply(`Usage: ${prefix}broadcast <message>`); return; }
   try {
     const message = args.join(' ');
     const users = Object.keys(global.db?.users || {});
     let sent = 0;
     for (const user of users) {
       try {
         await maureonix.sendMessage(user, { text: `📢 *Broadcast*\n\n${message}\n\n> *Maureonix* [BOT]` });
         sent++;
         await sleep(1000);
       } catch (e) {}
     }
     await m.reply(`✅ Broadcast sent to ${sent}/${users.length} users!`);
   } catch (e) {
     console.error('[Broadcast]', e);
     await m.reply('❌ Broadcast failed.');
   }
   return;
 }

 // ── .ban COMMAND ──
 if (isCmd && command === 'ban' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length && !m.mentionedJid?.length) { await m.reply(`Usage: ${prefix}ban @user or ${prefix}ban <number>`); return; }
   try {
     const target = m.mentionedJid?.[0] || args[0] + '@s.whatsapp.net';
     if (!global.db.users[target]) global.db.users[target] = {};
     global.db.users[target].ban = true;
     await m.reply(`✅ Banned ${target}!`);
   } catch (e) {
     console.error('[Ban]', e);
     await m.reply('❌ Ban failed.');
   }
   return;
 }

 // ── .unban COMMAND ──
 if (isCmd && command === 'unban' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length && !m.mentionedJid?.length) { await m.reply(`Usage: ${prefix}unban @user or ${prefix}unban <number>`); return; }
   try {
     const target = m.mentionedJid?.[0] || args[0] + '@s.whatsapp.net';
     if (global.db.users[target]) global.db.users[target].ban = false;
     await m.reply(`✅ Unbanned ${target}!`);
   } catch (e) {
     console.error('[Unban]', e);
     await m.reply('❌ Unban failed.');
   }
   return;
 }

 // ── .premium COMMAND ──
 if (isCmd && command === 'premium' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length && !m.mentionedJid?.length) { await m.reply(`Usage: ${prefix}premium @user or ${prefix}premium <number>`); return; }
   try {
     const target = m.mentionedJid?.[0] || args[0] + '@s.whatsapp.net';
     if (!global.db.users[target]) global.db.users[target] = {};
     global.db.users[target].premium = true;
     await m.reply(`✅ ${target} is now premium!`);
   } catch (e) {
     console.error('[Premium]', e);
     await m.reply('❌ Premium failed.');
   }
   return;
 }

 // ── .unpremium COMMAND ──
 if (isCmd && command === 'unpremium' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (!args.length && !m.mentionedJid?.length) { await m.reply(`Usage: ${prefix}unpremium @user or ${prefix}unpremium <number>`); return; }
   try {
     const target = m.mentionedJid?.[0] || args[0] + '@s.whatsapp.net';
     if (global.db.users[target]) global.db.users[target].premium = false;
     await m.reply(`✅ ${target} is no longer premium!`);
   } catch (e) {
     console.error('[Unpremium]', e);
     await m.reply('❌ Unpremium failed.');
   }
   return;
 }

 // ── .setlimit COMMAND ──
 if (isCmd && command === 'setlimit' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (args.length < 2) { await m.reply(`Usage: ${prefix}setlimit <free|premium|vip> <number>`); return; }
   try {
     const tier = args[0].toLowerCase();
     const amount = parseInt(args[1]);
     if (!['free', 'premium', 'vip'].includes(tier)) { await m.reply('Valid tiers: free, premium, vip'); return; }
     global.limit[tier] = amount;
     await m.reply(`✅ ${tier} limit set to ${amount}!`);
   } catch (e) {
     console.error('[SetLimit]', e);
     await m.reply('❌ Set limit failed.');
   }
   return;
 }

 // ── .addlimit COMMAND ──
 if (isCmd && command === 'addlimit' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   if (args.length < 2) { await m.reply(`Usage: ${prefix}addlimit @user <amount>`); return; }
   try {
     const target = m.mentionedJid?.[0] || args[0] + '@s.whatsapp.net';
     const amount = parseInt(args[1]);
     if (!global.db.users[target]) global.db.users[target] = { limit: 0 };
     global.db.users[target].limit = (global.db.users[target].limit || 0) + amount;
     await m.reply(`✅ Added ${amount} limit to ${target}! New total: ${global.db.users[target].limit}`);
   } catch (e) {
     console.error('[AddLimit]', e);
     await m.reply('❌ Add limit failed.');
   }
   return;
 }

 // ── .resetlimit COMMAND ──
 if (isCmd && command === 'resetlimit' && !messageHandled) {
   if (!isOwner) { await m.reply(mess.owner); return; }
   try {
     const users = Object.keys(global.db?.users || {});
     for (const user of users) {
       const tier = global.db.users[user].vip ? 'vip' : global.db.users[user].premium ? 'premium' : 'free';
       global.db.users[user].limit = global.limit[tier];
     }
     await m.reply(`✅ Reset limits for all ${users.length} users!`);
   } catch (e) {
     console.error('[ResetLimit]', e);
     await m.reply('❌ Reset limit failed.');
   }
   return;
 }

 // ── .stats COMMAND ──
 if (isCmd && command === 'stats' && !messageHandled) {
   try {
     const totalUsers = Object.keys(global.db?.users || {}).length;
     const totalGroups = global.db?.groups ? Object.keys(global.db.groups).length : 0;
     const totalCommands = global.db?.hit?.today || 0;
     const bannedUsers = Object.values(global.db?.users || {}).filter(u => u.ban).length;
     const premiumUsers = Object.values(global.db?.users || {}).filter(u => u.premium).length;
     const vipUsers = Object.values(global.db?.users || {}).filter(u => u.vip).length;
     await m.reply(
       `📊 *Maureonix Statistics*\n\n` +
       `• Total Users: ${totalUsers}\n` +
       `• Total Groups: ${totalGroups}\n` +
       `• Commands Today: ${totalCommands}\n` +
       `• Banned: ${bannedUsers}\n` +
       `• Premium: ${premiumUsers}\n` +
       `• VIP: ${vipUsers}\n` +
       `• Uptime: ${runtime(process.uptime())}\n` +
       `• RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`
     );
   } catch (e) {
     console.error('[Stats]', e);
     await m.reply('❌ Stats error.');
   }
   return;
 }

 // ── .help COMMAND ──
 if (isCmd && command === 'help' && !messageHandled) {
   await m.reply(
     `🦊 *Maureonix Help*\n\n` +
     `Type ${prefix}menu for full command list.\n\n` +
     `*Quick Start:*\n` +
     `• ${prefix}gpt <question> - Ask AI anything\n` +
     `• ${prefix}imagine <desc> - Generate image\n` +
     `• ${prefix}status - Bot status\n` +
     `• ${prefix}ping - Check response time\n\n` +
     `*Owner Only:*\n` +
     `• ${prefix}privatemode <off|away|ai|both>\n` +
     `• ${prefix}autoai - Toggle auto-reply\n` +
     `• ${prefix}broadcast <message>\n\n` +
     `> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`
   );
   return;
 }

 // ── .about COMMAND ──
 if (isCmd && command === 'about' && !messageHandled) {
   await m.reply(
     `🦊 *About Maureonix*\n\n` +
     `Maureonix is an intelligent WhatsApp bot developed by Aevibron and created by Infinite Vybeflix.\n\n` +
     `*Features:*\n` +
     `• Multi-model AI (GPT, Gemini, DeepSeek, Llama, Claude)\n` +
     `• Image generation\n` +
     `• Auto-AI replies\n` +
     `• Crisis detection\n` +
     `• Games & fun\n` +
     `• Group management\n` +
     `• And much more!\n\n` +
     `*Contact:*\n` +
     `• WhatsApp: +254116903500\n` +
     `• Email: aevibron@gmail.com\n` +
     `• Channel: https://whatsapp.com/channel/0029Vb7IABxCXC3J7ZFFsk2h\n\n` +
     `> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`
   );
   return;
 }

 // ── Fallback for unknown commands ──
 if (isCmd && !messageHandled) {
   // Check if it's a game command handled by gameManager
   try {
     const gameResult = await gameManager.handleCommand(maureonix, m, command, args, db);
     if (gameResult) {
       messageHandled = true;
       return;
     }
   } catch (e) {}

   // Unknown command
   await m.reply(`❌ Unknown command: *${command}*\n\nType ${prefix}menu for available commands.`);
   return;
 }

 } catch (err) {
   console.error('[CORE HANDLER]', err);
   try {
     await m.reply('❌ An unexpected error occurred. Please try again.');
   } catch (e) {}
 }
};

module.exports = { coreHandler };
