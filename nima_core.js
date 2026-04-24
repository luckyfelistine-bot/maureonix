// ═══════════════════════════════════════════════════════════════════════════
//   🦊 MAUREONIX v5.0.0 – CORE HANDLER (Commands separated)
//   Created by Infinite Vybeflix
//   GitHub: https://github.com/luckyfelistine-bot/maureonix
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
const speed = require('performance-now');
const moment = require('moment-timezone');
const { performance } = require('perf_hooks');
const PhoneNum = require('awesome-phonenumber');
const { exec, spawn, execSync } = require('child_process');
const { generateWAMessageContent, getContentType } = require('baileys');
const { generateMenuImage } = require('./lib/menuimage');

// Core helpers (original)
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
const templateMenu = require('./lib/template_menu');
const { toAudio, toPTT, toVideo } = require('./lib/converter');
const { GroupUpdate, LoadDataBase } = require('./src/message');
const { JadiBot, StopJadiBot, ListJadiBot } = require('./src/jadibot');
const { cmdAdd, cmdDel, cmdAddHit, addExpired, getPosition, getExpired, getStatus, checkStatus, getAllExpired, checkExpired } = require('./lib/database');
const { getRandom, getBuffer, fetchJson, runtime, clockString, sleep, isUrl, formatDate, formatp, generateProfilePicture, errorCache, normalize, updateSettings, parseMention, fixBytes, similarity, pickRandom, unsafeAgent, tarBackup } = require('./lib/function');
const { writeExif } = require('./lib/exif');

// ═══════════════════════════════════════════════════════════════════════════
//  NEW ULTIMATE LIBRARIES (v5.0.0)
// ═══════════════════════════════════════════════════════════════════════════

const AI = require('./lib/ai');   // now AI.askModel, AI.imagine, etc. work
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

// ═══════════════════════════════════════════════════════════════════
//  GODMODE IMPORTS (v6.0.0)
// ═══════════════════════════════════════════════════════════════════
const {
  TicTacToe, Connect4, Battleship, Wordle, Hangman, SnakeLadder,
  Blackjack, BlackjackCasino,
  RAWG, TriviaMaster, PokemonGame, NumbersGame, FunAPIs,
  RPGAdventure, slotMachine, rouletteSpin, crash, diceRoll, coinflip, rpsls, mathQuiz, anagram, numberGuess,
  rdGame, iGame, tGame, gameSlot, gameCasinoSolo, gameSamgongSolo, gameMerampok, gameBegal, daily, buy, setLimit, addLimit, addMoney, setMoney, transfer
} = require('./lib/game');

const { OMDB, TVMaze, AniList, Jikan, TMDB, MovieGuesser, Movie, fmtCast } = require('./lib/movie');

const { APISports, OddsAPI, ESPN } = require('./lib/sports');

// ═══════════════════════════════════════════════════════════════
//  PROACTIVE SCHEDULER – runs on module load
// ═══════════════════════════════════════════════════════════════

// Morning briefing every day at 7 AM Nairobi time
cron.schedule('0 7 * * *', async () => {
    const ownerJid = global.owner[0] + '@s.whatsapp.net';
    const briefing = `🌅 *Good Morning!*\n\n📅 ${new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\nHere's your briefing:\n- Check your reminders\n- Today's weather: .weather Nairobi\n- Top news: .news\n\nHave a great day! 🚀`;
    if (global.nimaInstance) {
        await global.nimaInstance.sendMessage(ownerJid, { text: briefing });
    }
}, { timezone: 'Africa/Nairobi' });

// ═══════════════════════════════════════════════════════════════
//  🔔 PROACTIVE REMINDER / SCHEDULER (checks every 10 seconds)
// ═══════════════════════════════════════════════════════════════
setInterval(async () => {
    if (!global.db?.reminders || !Array.isArray(global.db.reminders)) return;
    const now = Date.now();
    const dueItems = global.db.reminders.filter(r => r.due && r.due <= now);
    if (dueItems.length === 0) return;

    // Process each due reminder
    for (const item of dueItems) {
        try {
            const sock = global.nimaInstance;
            if (!sock) continue;

            const recipient = item.target || item.user; // target for .schedule, user for .remindme
            const text = item.text || item.message || '⏰ Reminder!';

            if (recipient && text) {
                // Send to the intended recipient (could be a user JID or group JID)
                await sock.sendMessage(recipient, { text: `🔔 *Reminder:*\n\n${text}` })
                    .catch(e => console.error('[reminder send error]', e.message));
            }
        } catch (e) {
            console.error('[reminder process error]', e);
        }
    }

    // Remove sent reminders from the array
    global.db.reminders = global.db.reminders.filter(r => !dueItems.includes(r));
}, 10000); // every 10 seconds

// ═══════════════════════════════════════════════════════════════════════════
//  HELPER: fetchApi (fallback chain)
// ═══════════════════════════════════════════════════════════════════════════

async function fetchApi(endpoint, data, options = {}) {
    const base = global.APIs?.nima || 'https://api.nima.biz.id';
    const key = global.APIKeys?.[base] || '';
    const url = base + endpoint;
    const method = options.method || 'GET';
    const headers = { 'Authorization': `Bearer ${key}`, ...options.headers };
    let body;
    if (data instanceof FormData) {
        body = data;
        Object.assign(headers, data.getHeaders());
    } else if (method === 'POST') {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(data);
    }
    const res = await fetch(url, { method, headers, body });
    if (options.buffer) return await res.buffer();
    const json = await res.json();
    if (json.status === false) throw new Error(json.message || 'API error');
    return json;
}

// ═══════════════════════════════════════════════════════════════════════════
//  GLOBAL VARIABLES
// ═══════════════════════════════════════════════════════════════════════════

const menfesTimeouts = new Map();
const settingsPath = path.join(__dirname, 'settings.js');
const cases = global.db && global.db.cases ? global.db.cases : (global.db = global.db || {}, global.db.cases = [...fs.readFileSync('./nima.js', 'utf-8').matchAll(/case\s+['"]([^'"]+)['"]/g)].map(match => match[1]));

// This function lets the auto‑AI execute internal bot commands
async function handleAutoCommand(nimesha, m, ctx, aiResult) {
    const { command, args } = aiResult;
    // We need the full switch statement from nima_commands.js.
    // The cleanest way is to call the same command handler but with a synthetic context.
    const handleCommand = require('./nima_commands');
    
    // Build the context object that the command handler expects.
    // You must pass all necessary properties; the easiest is to reuse the existing ctx
    // but override `command`, `args`, `text`, `q`, and set `isCmd` to true.
    const syntheticCtx = {
        // Copy all existing ctx variables (db, store, set, AI, etc.)
        ...ctx,
        command: command,
        args: args,
        text: args.join(' ') || '',
        q: args.join(' ') || '',
        isCmd: true,          // tell the handler that this is a command
        prefix: ctx.prefix,   // keep the prefix so commands like .menu still work
        // The bot's socket is already passed as nimesha, so no change needed
    };
    
    await handleCommand(nimesha, m, syntheticCtx);
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN HANDLER EXPORT (will be wrapped by nima.js)
// ═══════════════════════════════════════════════════════════════════════════

const coreHandler = async (nimesha, m, msg, store) => {
    await LoadDataBase(nimesha, m);

    // Ensure db is defined even if LoadDataBase failed partially
    if (!global.db) {
        global.db = { users: {}, groups: {}, game: {}, set: {}, premium: [], database: {} };
    }
    if (!global.db.database) global.db.database = {};
    
    const botNumber = nimesha.decodeJid(nimesha.user.id);

    // Helper to send replies that work for both regular chats and newsletters
    const sendReply = async (jid, content, options = {}) => {
        // Always normalise content to an object with a `text` property if it's a string
        let messageContent;
        if (typeof content === 'string') {
            messageContent = { text: content, ...options };
        } else {
            // Merge provided options into the content object if needed
            messageContent = { ...content, ...options };
        }

        if (jid.endsWith('@newsletter')) {
            return nimesha.newsletterMsg(jid, messageContent).catch(e => {
                console.error('[newsletter send error]', e?.message);
            });
        }
        return nimesha.sendMessage(jid, messageContent);
    };
    

    // Common reply messages
    const mess = {
        wait: '⏳ Please wait...',
        owner: '❌ This command is only for the bot owner!',
        group: '❌ This command can only be used in a group!',
        admin: '❌ You must be a group admin to use this command!',
        botAdmin: '❌ The bot must be a group admin to perform this action!',
        private: '❌ This command can only be used in private chat!',
        premium: '❌ This feature is for premium users only!',
        limit: '❌ You have reached your daily limit!',
        banned: '❌ You are banned from using the bot!',
        nsfw: '❌ NSFW commands are disabled in this group!',
        error: '❌ An error occurred. Please try again later.',
    };
    
    // Read Database
    const sewa = db.sewa;
    const premium = db.premium;
    const set = db.set[botNumber];
    
    // Database Game
    let suit = db.game.suit;
    let chess = db.game.chess;
    let chat_ai = db.game.chat_ai;
    if (!db.game.gemini_autoreply) db.game.gemini_autoreply = {};
    let gemini_autoreply = db.game.gemini_autoreply;
    if (!db.game.gemini_history) db.game.gemini_history = {};
    let gemini_history = db.game.gemini_history;
    let menfes = db.game.menfes;
    let tekateki = db.game.tekateki;
    let akinator = db.game.akinator;
    let tictactoe = db.game.tictactoe;
    let tebaklirik = db.game.tebaklirik;
    let kuismath = db.game.kuismath;
    let blackjack = db.game.blackjack;
    let tebaklagu = db.game.tebaklagu;
    let tebakkata = db.game.tebakkata;
    let family100 = db.game.family100;
    let susunkata = db.game.susunkata;
    let tebakbom = db.game.tebakbom;
    let ulartangga = db.game.ulartangga;
    let tebakkimia = db.game.tebakkimia;
    let caklontong = db.game.caklontong;
    let tebakangka = db.game.tebakangka;
    let tebaknegara = db.game.tebaknegara;
    let tebakgambar = db.game.tebakgambar;
    let tebakbendera = db.game.tebakbendera;
    
    const ownerNumber = set.owner = [...new Set([...owner, ...set?.owner || []])];
    
    if (set.antidelete === undefined) set.antidelete = false;
    if (set.autostatus === undefined) set.autostatus = false;
    if (set.autostatusreact === undefined) set.autostatusreact = false;
    if (set.autorecording === undefined) set.autorecording = false;
    
    try {
        await GroupUpdate(nimesha, m, store);

        // Skip bot's own messages — prevent loops, but allow owner self-chat commands
        const _isOwnerSelf = ownerNumber.filter(v => typeof v === 'string').map(v => v.replace(/[^0-9]/g, '')).includes(m.sender?.split('@')[0]);
        if (m.fromMe && !_isOwnerSelf) return;
        
        const body = ((m.type === 'conversation') ? m.message.conversation :
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
        
        const budy = (typeof m.text == 'string' ? m.text : '');

        // Override m.reply so newsletters receive messages correctly
        const originalReply = m.reply.bind(m);
        m.reply = async (content, options = {}) => {
            return sendReply(m.chat, content, options);
        };

        const isCreator = isOwner = m.fromMe || ownerNumber.filter(v => typeof v === 'string').map(v => v.replace(/[^0-9]/g, '')).includes(m.sender.split('@')[0]);
        const prefix = isCreator ? (/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi)[0] : listprefix.find(a => body?.startsWith(a)) || '') : set.multiprefix ? (/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi)[0] : listprefix.find(a => body?.startsWith(a)) || '¿') : listprefix.find(a => body?.startsWith(a)) || '¿';
        const isCmd = prefix ? body.startsWith(prefix) : listprefix.some(p => body.startsWith(p));
        const args = body.trim().split(/ +/).slice(1);
        const quoted = m.quoted ? m.quoted : m;
        const command = isCreator ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : isCmd ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : '';
        const text = q = args.join(' ');
        const mime = (quoted.msg || quoted).mimetype || '';
        const qmsg = (quoted.msg || quoted);
        const author = set.author = global.author || 'Infinite Vybeflix';
        const packname = set.packname = global.packname || 'Maureonix';
        const botname = set.botname = global.botname || 'Maureonix';
        const _dayMap = {
            'Sunday':'Sunday','Monday':'Monday','Tuesday':'Tuesday',
            'Wednesday':'Wednesday','Thursday':'Thursday',
            'Friday':'Friday','Saturday':'Saturday'
        };
        const dayName = _dayMap[moment.tz('Africa/Nairobi').format('dddd')] || moment.tz('Africa/Nairobi').format('dddd');
        const tanggal = moment.tz('Africa/Nairobi').format('DD/MM/YYYY');
        const jam = moment.tz('Africa/Nairobi').format('HH:mm:ss');
        const ucapanWaktu = jam < '05:00:00' ? 'Good Dawn 🌉' : jam < '11:00:00' ? 'Good Morning 🌄' : jam < '15:00:00' ? 'Good Day 🏙️' : jam < '18:00:00' ? 'Good Evening 🌅' : jam < '19:00:00' ? 'Good Evening 🌃' : 'Good Night 🌌';
        const almost = 0.66;
        const time = Date.now();
        const time_now = new Date();
        const time_end = 60000 - (time_now.getSeconds() * 1000 + time_now.getMilliseconds());
        const readmore = String.fromCharCode(8206).repeat(999);
        const setv = pickRandom(listv);
        
        const isVip = isCreator || (db.users[m.sender] ? db.users[m.sender].vip : false);
        const isBan = isCreator || (db.users[m.sender] ? db.users[m.sender].ban : false);
        const isLimit = isCreator || (db.users[m.sender] ? (db.users[m.sender].limit > 0) : false);
        const isPremium = isCreator || checkStatus(m.sender, premium) || false;
        const isNsfw = m.isGroup ? db.groups[m.chat].nsfw : false;
        
        // Fake
        const fkontak = {
            key: {
                remoteJid: '0@s.whatsapp.net',
                participant: '0@s.whatsapp.net',
                fromMe: false,
                id: 'Infinite Vybeflix'
            },
            message: {
                contactMessage: {
                    displayName: (m.pushName || author),
                    vcard: `BEGIN:VCARD\nVERSION:7.0\nN:XL;${m.pushName || author},;;;\nFN:${m.pushName || author}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Mobile\nEND:VCARD`,
                    sendEphemeral: true
                }
            }
        };
        
        // Reset Limit daily
        cron.schedule('00 00 * * *', async () => {
            cmdDel(db.hit);
            console.log('Reset Limits for Users');
            let user = Object.keys(db.users);
            for (let jid of user) {
                const limitUser = db.users[jid].vip ? limit.vip : checkStatus(jid, premium) ? limit.premium : limit.free;
                if (db.users[jid].limit < limitUser) db.users[jid].limit = limitUser;
            }
            if (set?.autobackup) {
                let datanya = './database/' + tempatDB;
                if (tempatDB.startsWith('mongodb')) {
                    datanya = './database/backup_database.json';
                    fs.writeFileSync(datanya, JSON.stringify(global.db, null, 2), 'utf-8');
                }
                let tglnya = new Date().toISOString().replace(/[:.]/g, '-');
                for (let o of ownerNumber) {
                    try {
                        await nimesha.sendMessage(o, { document: fs.readFileSync(datanya), mimetype: 'application/json', fileName: tglnya + '_database.json' });
                        console.log(`[AUTO BACKUP] Backup sent to ${o}`);
                    } catch (e) {
                        console.error(`[AUTO BACKUP] Failed to send backup to ${o}:`, error);
                    }
                }
            }
        }, {
            scheduled: true,
            timezone: 'Africa/Nairobi'
        });
        
        // Auto Bio
        if (set.autobio) {
            if (new Date() * 1 - set.status > 60000) {
                await nimesha.updateProfileStatus(`${nimesha.user.name} | 🎯 Runtime: ${runtime(process.uptime())}`).catch(e => {});
                set.status = new Date() * 1;
            }
        }
        
                // Set Mode (newsletters are always allowed)
        const isNewsletter = m.chat.endsWith('@newsletter');
        if (!isCreator) {
            if ((set.grouponly === set.privateonly)) {
                if (!nimesha.public && !m.key.fromMe) return;
            } else if (set.grouponly) {
                if (!m.isGroup) return;
            } else if (set.privateonly) {
                if (m.isGroup) return;
            }
        }

        // ===== ENHANCED AUTO‑AI MODE =====
        // Determine if this is a self‑chat (owner messaging own bot number)
        const botOwnJid = nimesha.decodeJid(nimesha.user.id);
        const isSelfChat = !m.isGroup && m.fromMe && m.chat === botOwnJid;

        // 1) Self‑chat AI – owner talking to bot from the same number
        if (isSelfChat && set.autoai_selfchat && !isCmd && (body || budy)) {
            const userMessage = body || budy;
            
            // Guard: ignore messages that look like the bot's own replies
            if (userMessage.trim().startsWith('🤖 *Maureonix*')) return;
            
            // Cooldown: only respond once every 3 seconds (adjust as needed)
            const now = Date.now();
            if (!set._lastSelfChatTime) set._lastSelfChatTime = 0;
            if (now - set._lastSelfChatTime < 3000) return;
            set._lastSelfChatTime = now;

            if (userMessage.trim().length > 0) {
                if (set.autotyping) await nimesha.sendPresenceUpdate('composing', m.chat);
                try {
                    const { detectTone, getTonePrompt, groqChat, sendLongMessage } = require('./lib/ai');
                    const tone = detectTone(userMessage);
                    const tonePrompt = getTonePrompt(tone);
                    
                    // Use a fast, reliable model; fallback handled inside groqChat
                    const result = await groqChat(userMessage, 'llama-3.3-70b-versatile', m.sender, tonePrompt);
                    
                    // Only reply if we got meaningful text
                    if (result && result.text && result.text.length > 0) {
                        await sendLongMessage(nimesha, m.chat, `🤖 *Maureonix*\n\n${result.text}`, { quoted: m });
                    }
                } catch (e) {
                    // Log error but don't flood the owner with error messages
                    console.error('[selfchat AI error]', e.message);
                }
                return; // stop further processing
            }
        }

        // 2) Private message from a stranger (not owner, not group, not status)
        if (!m.isGroup && !m.fromMe && m.key.remoteJid !== 'status@broadcast' && !isCmd && (body || budy) && !isOwner) {
            const mode = set.privatemode || 'off';
            const awayMsg = set.awaymsg || 'I am not available right now.';
            const user = db.users[m.sender];

            // Helper to store a pending message for the owner
            const addPending = (fromJid, msg) => {
                if (!set.pendingMessages) set.pendingMessages = [];
                // Find existing entry for this JID
                let entry = set.pendingMessages.find(e => e.from === fromJid);
                if (!entry) {
                    entry = { from: fromJid, timestamp: Date.now(), messages: [] };
                    set.pendingMessages.push(entry);
                }
                entry.messages.push({ time: Date.now(), body: msg });
                // Limit to 50 messages per user
                if (entry.messages.length > 50) entry.messages.shift();
            };

            // Store the incoming message if we are in a 'recording' mode (away, both)
            if (mode === 'away' || mode === 'both') {
                addPending(m.sender, body || budy);
            }

            if (mode === 'away') {
                // Always send away message (flag not needed for pure away)
                await m.reply(awayMsg);
                return;
            } else if (mode === 'ai') {
                // No away message, just AI
                if (set.autotyping) await nimesha.sendPresenceUpdate('composing', m.chat);
                try {
                    const { enhancedAI, sendLongMessage } = require('./lib/ai');
                    const result = await enhancedAI(body || budy, m.sender, 'deepseek');
                    await sendLongMessage(nimesha, m.chat, `🤖 *Maureonix*\n\n${result.text}`, { quoted: m });
                } catch (e) {
                    console.error('[privat AI error]', e);
                }
                return;
            } else if (mode === 'both') {
                // Send away message only once per user
                if (!user._awayNotified) {
                    await m.reply(awayMsg);
                    user._awayNotified = true;
                    await sleep(1000);  // small delay before switching to AI
                }
                // Now engage AI
                if (set.autotyping) await nimesha.sendPresenceUpdate('composing', m.chat);
                try {
                    const { enhancedAI, sendLongMessage } = require('./lib/ai');
                    const result = await enhancedAI(body || budy, m.sender, 'deepseek');
                    await sendLongMessage(nimesha, m.chat, `🤖 *Maureonix*\n\n${result.text}`, { quoted: m });
                } catch (e) {
                    console.error('[privat AI error]', e);
                }
                return;
            }
            // If mode is 'off' or unrecognised, do nothing (and don't store message)
        }

        // Private chat — block commands for non-owners
        if (!m.isGroup && !isCreator && isCmd) return;
        
        // Group Settings
        if (m.isGroup) {
            // Mute
            if (db.groups[m.chat].mute && !isCreator) {
                return;
            }
            
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
                        await m.reply(`This group has been tagged in a WhatsApp status\n@${m.sender.split('@')[0]}, please do not tag the group in statuses\n⚠️ Warning ${db.groups[m.chat].tagsw[m.sender]}/5 — next time you will be kicked!❗`);
                    } else if (db.groups[m.chat].tagsw[m.sender] >= 5) {
                        await nimesha.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch((err) => m.reply('Failed!'));
                        await m.reply(`@${m.sender.split("@")[0]} has been removed from the group\nBecause you tagged the group in a WhatsApp status 5 times.`);
                        delete db.groups[m.chat].tagsw[m.sender];
                    } else {
                        db.groups[m.chat].tagsw[m.sender] += 1;
                        await m.reply(`This group has been tagged in a WhatsApp status\n@${m.sender.split('@')[0]}, please do not tag the group in statuses\n⚠️ Warning ${db.groups[m.chat].tagsw[m.sender]}/5 — next time you will be kicked!❗`);
                    }
                }
            }
            
            // Anti Toxic
            if (!m.key.fromMe && db.groups[m.chat].antitoxic && !isCreator && m.isBotAdmin && !m.isAdmin) {
                if (budy.toLowerCase().split(/\s+/).some(word => badWords.includes(word))) {
                    await nimesha.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender }});
                    await nimesha.relayMessage(m.chat, { extendedTextMessage: { text: `Detected @${m.sender.split('@')[0]} using toxic language\nPlease use polite language.`, contextInfo: { mentionedJid: [m.key.participant], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Toxic❗*'}, ...m.key }}}, {});
                }
            }
            
            // Anti Delete
            if (m.type === 'protocolMessage' && m.msg?.type === 0 && db.groups[m.chat].antidelete && !isCreator && m.isBotAdmin && !m.isAdmin) {
                if (store?.messages?.[m.chat]?.array) {
                    const chats = store.messages[m.chat].array.find(a => a.key.id === m.msg.key.id);
                    if (!chats?.message) return;
                    const msgType = Object.keys(chats.message)[0];
                    const msgContent = chats.message[msgType];
                    if (msgContent.fileSha256 && msgContent.mediaKey) {
                        msgContent.mediaKey = fixBytes(msgContent.mediaKey);
                        msgContent.fileSha256 = fixBytes(msgContent.fileSha256);
                        msgContent.fileEncSha256 = fixBytes(msgContent.fileEncSha256);
                    }
                    msgContent.contextInfo = { mentionedJid: [chats.key.participant], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Delete❗*'}, ...chats.key };
                    const pesan = msgType === 'conversation' ? { extendedTextMessage: { text: msgContent, contextInfo: { mentionedJid: [chats.key.participant], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Delete❗*'}, ...chats.key }}} : { [msgType]: msgContent };
                    await nimesha.relayMessage(m.chat, pesan, {});
                }
            }
            
            // Anti Link Group
            if (db.groups[m.chat].antilink && !isCreator && m.isBotAdmin && !m.isAdmin) {
                if (budy.match('chat.whatsapp.com/')) {
                    await nimesha.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender }});
                    await nimesha.relayMessage(m.chat, { extendedTextMessage: { text: `Detected @${m.sender.split('@')[0]} sending a group link.\nSorry, the link must be deleted.`, contextInfo: { mentionedJid: [m.key.participant], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Link❗*'}, ...m.key }}}, {});
                }
            }
            
            // Anti Virtex Group
            if (db.groups[m.chat].antivirtex && !isCreator && m.isBotAdmin && !m.isAdmin) {
                if (budy.length > 4500) {
                    await nimesha.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender }});
                    await nimesha.relayMessage(m.chat, { extendedTextMessage: { text: `Detected @${m.sender.split('@')[0]} sending virtex.`, contextInfo: { mentionedJid: [m.key.participant], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Virtex❗*'}, ...m.key }}}, {});
                    await nimesha.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                }
                if (m.msg?.nativeFlowMessage?.messageParamsJson?.length > 3500) {
                    await nimesha.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender }});
                    await nimesha.relayMessage(m.chat, { extendedTextMessage: { text: `Detected @${m.sender.split('@')[0]} sending a bug.`, contextInfo: { mentionedJid: [m.key.participant], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Bug❗*'}, ...m.key }}}, {});
                    await nimesha.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                }
            }
        }
        
        // Auto Read
        if (m.message && m.key.remoteJid !== 'status@broadcast') {
            if ((set.autoread && nimesha.public) || isCreator) {
                nimesha.readMessages([m.key]);
                console.log(chalk.black(chalk.bgWhite('[ MESSAGE ]:'), chalk.bgGreen(new Date), chalk.bgHex('#00EAD3')(budy || m.type), chalk.bgHex('#AF26EB')(m.key.id) + '\n' + chalk.bgCyanBright('[ FROM ] :'), chalk.bgYellow(m.pushName || (isCreator ? 'Bot' : 'Anonym')), chalk.bgHex('#FF449F')(m.sender), chalk.bgHex('#FF5700')(m.isGroup ? m.metadata.subject : m.chat.endsWith('@newsletter') ? 'Newsletter' : 'Private Chat'), chalk.bgBlue('(' + m.chat + ')')));
            }
        }
        
        // Auto Status View
        if (m.key.remoteJid === 'status@broadcast' && set.autostatus && !m.key.fromMe) {
            await nimesha.readMessages([m.key]);
            if (set.autostatusreact) {
                await nimesha.sendMessage(m.chat, { react: { text: '👍', key: m.key } });
            }
        }

        // Auto React to Mentions
        if (set.autoreactmention && m.mentionedJid?.includes(botNumber) && !m.key.fromMe) {
            await nimesha.sendMessage(m.chat, { react: { text: '👀', key: m.key } });
        }

        // Auto Reply to Mentions
        if (set.autoreplymention && m.mentionedJid?.includes(botNumber) && !m.key.fromMe) {
            const replyText = set.autoreplymention.replace(/{user}/g, `@${m.sender.split('@')[0]}`);
            await nimesha.sendMessage(m.chat, { text: replyText, mentions: [m.sender] }, { quoted: m });
        }

        // ===== AUTO COMMANDS EXECUTION =====
        const isGroup = m.isGroup;
        const bodyLower = budy.toLowerCase();

        // Auto Download Status (owner only, downloads status to private chat)
        if (set.autodownload && m.key.remoteJid === 'status@broadcast' && !m.key.fromMe) {
            try {
                const msg = m.message?.protocolMessage || m.message?.imageMessage || m.message?.videoMessage;
                if (msg) {
                    const buffer = await nimesha.downloadMediaMessage(m);
                    const caption = `📥 Auto-downloaded status from @${m.sender.split('@')[0]}`;
                    await nimesha.sendMessage(ownerNumber[0], { [msg.imageMessage ? 'image' : 'video']: buffer, caption, mentions: [m.sender] });
                }
            } catch {}
        }

        // Auto Forward (owner only)
        if (set.autoforward && !m.key.fromMe && m.key.remoteJid !== 'status@broadcast') {
            try {
                await nimesha.sendMessage(set.autoforward, { forward: m }, {});
            } catch {}
        }

        // Auto Sticker (converts any image/video to sticker)
        if (set.autosticker && !m.key.fromMe && (m.type === 'imageMessage' || m.type === 'videoMessage')) {
            try {
                const buffer = await m.download();
                const sticker = await writeExif(buffer, { packname, author });
                await nimesha.sendMessage(m.chat, { sticker: fs.readFileSync(sticker) }, { quoted: m });
                fs.unlinkSync(sticker);
            } catch {}
        }

        // Auto Translate (translates incoming messages to target language)
        if (set.autotranslate && !m.key.fromMe && bodyLower) {
            try {
                const translated = await AI.translate(budy, set.autotranslate);
                await m.reply(`🌐 *Translated (${set.autotranslate})*\n${translated}`);
            } catch {}
        }

        // Auto Delete (deletes bot's own messages after X seconds)
        if (set.autodelete > 0 && m.key.fromMe) {
            setTimeout(async () => {
                try { await nimesha.sendMessage(m.chat, { delete: m.key }); } catch {}
            }, set.autodelete * 1000);
        }

        // Auto React (reacts to all incoming messages with a fixed emoji)
        if (set.autoreact && !m.key.fromMe) {
            try {
                await nimesha.sendMessage(m.chat, { react: { text: set.autoreact, key: m.key } });
            } catch {}
        }

        // Auto Block (blocks users who send certain keywords)
        if (set.autoblock && !m.key.fromMe && !isCreator) {
            const keywords = set.autoblock;
            if (keywords.some(kw => bodyLower.includes(kw))) {
                await nimesha.updateBlockStatus(m.sender, 'block');
                await m.reply('🚫 You have been blocked for using prohibited words.');
            }
        }

        // Auto Kick (kicks group members who send certain keywords)
        if (isGroup && set.autokick && !m.key.fromMe && m.isBotAdmin && !m.isAdmin) {
            const keywords = set.autokick;
            if (keywords.some(kw => bodyLower.includes(kw))) {
                await nimesha.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                await nimesha.sendMessage(m.chat, { text: `🚫 @${m.sender.split('@')[0]} was kicked for using prohibited words.`, mentions: [m.sender] });
            }
        }

        // Auto Mute (deletes messages containing certain keywords)
        if (isGroup && set.automute && !m.key.fromMe && m.isBotAdmin && !m.isAdmin) {
            const keywords = set.automute;
            if (keywords && keywords.some(kw => bodyLower.includes(kw))) {
                await nimesha.sendMessage(m.chat, { delete: m.key });
            }
        }

        // Auto Welcome (sends welcome message when a user joins)
        if (isGroup && set.autowelcome && m.type === 'groupParticipantsUpdate') {
            const update = m.message.groupParticipantsUpdate;
            if (update.action === 'add') {
                for (const jid of update.participants) {
                    await nimesha.sendMessage(m.chat, { text: `👋 Welcome @${jid.split('@')[0]} to the group!`, mentions: [jid] });
                }
            }
        }

        // Auto Goodbye (sends goodbye message when a user leaves)
        if (isGroup && set.autogoodbye && m.type === 'groupParticipantsUpdate') {
            const update = m.message.groupParticipantsUpdate;
            if (update.action === 'remove') {
                for (const jid of update.participants) {
                    await nimesha.sendMessage(m.chat, { text: `😢 Goodbye @${jid.split('@')[0]}.`, mentions: [jid] });
                }
            }
        }

        // Filter Bot & Ban
        if (m.isBot) return;
        if (db.users[m.sender]?.ban && !isCreator) return;
        
        // Typing & Anti Spam & Hit
        if (nimesha.public && isCmd) {
            if (set.autotyping) {
                await nimesha.sendPresenceUpdate('composing', m.chat);
            }
            if (cases.includes(command)) {
                cmdAdd(db.hit);
                cmdAddHit(db.hit, command);
            }
            if (set.antispam && antiSpam.isFiltered(m.sender)) {
                console.log(chalk.bgRed('[ SPAM ] : '), chalk.black(chalk.bgHex('#1CFFF7')(`From -> ${m.sender}`), chalk.bgHex('#E015FF')(` In ${m.isGroup ? m.chat : 'Private Chat'}`)));
                return m.reply('「 ❗ 」Please wait 5 seconds between commands.');
            }
            
            if (command && set.didyoumean && isCmd) {
                let _b = '';
                let _s = 0;
                for (const c of cases) {
                    let sim = similarity(command.toLowerCase(), c.toLowerCase());
                    let lengthDiff = Math.abs(command.length - c.length);
                    if (sim > _s && lengthDiff <= 1) {
                        _s = sim;
                        _b = c;
                    }
                }
                let s_percentage = parseInt(_s * 100);
                if (_s >= almost && command.toLowerCase() !== _b.toLowerCase()) {
                    return m.reply(`Command not found!\nDid you mean:\n- ${prefix + _b}\n- Similarity: ${s_percentage}%`);
                }
            }
        }
        
        if (isCmd && !isCreator) antiSpam.addFilter(m.sender);

        // Delete quoted button message when button clicked
        const isButtonClick = ['interactiveResponseMessage', 'buttonsResponseMessage', 'listResponseMessage', 'templateButtonReplyMessage', 'messageContextInfo'].includes(m.type);
        if (isButtonClick && m.quoted?.key) {
            try { await nimesha.sendMessage(m.chat, { delete: m.quoted.key }); } catch(e) {}
        }
        
        const isRealOwner = ownerNumber.filter(v => typeof v === 'string').map(v => v.replace(/[^0-9]/g, '')).includes(m.sender.split('@')[0]);
        // ok sir — only if owner number != bot number (not self-mode)
        const botNum = botNumber.split('@')[0].replace(/[^0-9]/g, '');
        const ownerNumClean = (ownerNumber[0] || '').replace(/[^0-9]/g, '');
        const isSelfMode = botNum === ownerNumClean;
        if (isCmd && isRealOwner && command && prefix && body.startsWith(prefix) && !isSelfMode && !m.isGroup) {
            await m.react('🫡');
            await m.reply('ok sir');
        }

        // Cmd Media
        let fileSha256;
        if (m.isMedia && m.msg.fileSha256 && db.cmd && (m.msg.fileSha256.toString('base64') in db.cmd)) {
            let hash = db.cmd[m.msg.fileSha256.toString('base64')];
            fileSha256 = hash.text;
        }
        
        // Salam greeting
        if (/^a(s|ss)alamu('|)alaikum(| )(wr|)( |)(wb|)$/.test(budy?.toLowerCase())) {
            const jwb_salam = ['Wa\'alaikumusalam','Wa\'alaikumusalam wr wb','Wa\'alaikumusalam Warohmatulahi Wabarokatuh'];
            m.reply(pickRandom(jwb_salam));
        }
        
        // Prayer times (example for Nairobi, you can adjust)
        const jadwalSholat = {
            Fajr: '05:00',
            Dhuhr: '12:30',
            Asr: '15:45',
            Maghrib: '18:30',
            Isha: '19:45'
        };
        if (!this.intervalSholat) this.intervalSholat = null;
        if (!this.waktusholat) this.waktusholat = {};
        if (this.intervalSholat) clearInterval(this.intervalSholat); 
        setTimeout(() => {
            this.intervalSholat = setInterval(async() => {
                const sekarang = moment.tz('Africa/Nairobi');
                const jamSholat = sekarang.format('HH:mm');
                const hariIni = sekarang.format('YYYY-MM-DD');
                const seconds = sekarang.format('ss');
                if (seconds !== '00') return;
                for (const [sholat, waktu] of Object.entries(jadwalSholat)) {
                    if (jamSholat === waktu && this.waktusholat[sholat] !== hariIni) {
                        this.waktusholat[sholat] = hariIni;
                        for (const [idnya, settings] of Object.entries(db.groups)) {
                            if (settings.waktusholat) {
                                await nimesha.sendMessage(idnya, { text: `*${sholat}* time has arrived, prepare for prayer🙂.\n\n*${waktu.slice(0, 5)}*\n_For Nairobi and surrounding areas._` }, { ephemeralExpiration: m.expiration || store?.messages[idnya]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration || 0 }).catch(e => {});
                            }
                        }
                    }
                }
            }, 60000);
        }, time_end);
        
        // Check Expired
        checkExpired(premium);
        checkExpired(sewa, nimesha);
        
        // Connect 4 Game (replaces TicTacToe)
        let connect4Room = Object.values(db.game.connect4 || {}).find(room => room.id && room.state === 'PLAYING' && [room.player1, room.player2].includes(m.sender));
        if (connect4Room) {
            let now = Date.now();
            if (now - (connect4Room.lastMove || now) > 10 * 60 * 1000) {
                m.reply('⌛ Connect 4 game cancelled due to 10 minutes of inactivity.');
                delete db.game.connect4[connect4Room.id];
                return;
            }
            connect4Room.lastMove = now;

            if (!/^[1-7]$|^(me)?nyerah|surr?ender$/i.test(m.text)) return;

            if (/^(me)?nyerah|surr?ender$/i.test(m.text)) {
                const winner = m.sender === connect4Room.player1 ? connect4Room.player2 : connect4Room.player1;
                m.reply(`🏳️ @${m.sender.split('@')[0]} surrendered!\n@${winner.split('@')[0]} wins!`, { mentions: [m.sender, winner] });
                delete db.game.connect4[connect4Room.id];
                return;
            }

            const currentPlayer = connect4Room.turn === 1 ? connect4Room.player1 : connect4Room.player2;
            if (m.sender !== currentPlayer) return m.reply('⏳ Not your turn!');

            const col = parseInt(m.text) - 1;
            const { board, turn } = connect4Room;

            let row = -1;
            for (let r = 5; r >= 0; r--) {
                if (board[r][col] === 0) {
                    row = r;
                    break;
                }
            }
            if (row === -1) return m.reply('❌ Column is full! Choose another.');

            board[row][col] = turn;
            connect4Room.turn = turn === 1 ? 2 : 1;

            const checkWin = (r, c, p) => {
                const dirs = [[1,0],[0,1],[1,1],[1,-1]];
                for (let [dr, dc] of dirs) {
                    let count = 1;
                    for (let d of [1, -1]) {
                        for (let i = 1; i < 4; i++) {
                            const nr = r + dr * i * d;
                            const nc = c + dc * i * d;
                            if (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && board[nr][nc] === p) count++;
                            else break;
                        }
                    }
                    if (count >= 4) return true;
                }
                return false;
            };

            const isWin = checkWin(row, col, turn === 1 ? 2 : 1);
            const isDraw = board.every(row => row.every(cell => cell !== 0));

            const symbols = { 0: '⚪', 1: '🔴', 2: '🟡' };
            let boardStr = '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣\n';
            for (let r = 0; r < 6; r++) {
                for (let c = 0; c < 7; c++) {
                    boardStr += symbols[board[r][c]];
                }
                boardStr += '\n';
            }
            boardStr += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣';

            if (isWin) {
                const winner = turn === 1 ? connect4Room.player2 : connect4Room.player1;
                m.reply(`🎉 @${winner.split('@')[0]} wins!\n\n${boardStr}`, { mentions: [winner] });
                delete db.game.connect4[connect4Room.id];
            } else if (isDraw) {
                m.reply(`🤝 It's a draw!\n\n${boardStr}`);
                delete db.game.connect4[connect4Room.id];
            } else {
                const nextPlayer = connect4Room.turn === 1 ? connect4Room.player1 : connect4Room.player2;
                m.reply(`🔴 ${currentPlayer === connect4Room.player1 ? 'Red' : 'Yellow'}'s move made.\n🟡 Turn: @${nextPlayer.split('@')[0]}\n\n${boardStr}\n\nReply with column number (1-7) or "nyerah" to surrender.`, { mentions: [nextPlayer] });
            }
            return;
        }
        
        // Suit PvP
        let roof = Object.values(suit).find(roof => roof.id && roof.status && [roof.p, roof.p2].includes(m.sender));
        if (roof) {
            let now = Date.now();
            let win = '', tie = false;
            if (now - (roof.lastMove || now) > 3 * 60 * 1000) {
                m.reply('Suit game cancelled due to 3 minutes of inactivity.');
                delete suit[roof.id];
                return;
            }
            roof.lastMove = now;
            if (m.sender == roof.p2 && /^(acc(ept)?|terima|gas|oke?|tolak|gamau|nanti|ga(k.)?bisa|y)/i.test(m.text) && m.isGroup && roof.status == 'wait') {
                if (/^(tolak|gamau|nanti|n|ga(k.)?bisa)/i.test(m.text)) {
                    m.reply(`@${roof.p2.split('@')[0]} rejected the suit, suit cancelled.`);
                    delete suit[roof.id];
                    return !0;
                }
                roof.status = 'play';
                roof.asal = m.chat;
                m.reply(`✅ Suit request sent!\n\n@${roof.p.split('@')[0]} vs @${roof.p2.split('@')[0]}\n\n📱 Give your choice in private chat:\nhttps://wa.me/${botNumber.split('@')[0]}`);
                if (!roof.තෝරන්න) nimesha.sendMessage(roof.p, { text: `📌 Choose your option:\n\n🗿 Rock\n📄 Paper\n✂️ Scissors` }, { quoted: m });
                if (!roof.තෝරන්න2) nimesha.sendMessage(roof.p2, { text: `📌 Choose your option:\n\n🗿 Rock\n📄 Paper\n✂️ Scissors` }, { quoted: m });
            }
            let jwb = m.sender == roof.p, jwb2 = m.sender == roof.p2;
            let g = /scissors/i, b = /rock/i, k = /paper/i, reg = /^(rock|paper|scissors)/i;
            
            if (jwb && reg.test(m.text) && !roof.තෝරන්න && !m.isGroup) {
                roof.තෝරන්න = reg.exec(m.text.toLowerCase())[0];
                roof.text = m.text;
                m.reply(`You chose ${m.text} ${!roof.තෝරන්න2 ? `\n\nWaiting for the opponent's choice.` : ''}`);
                if (!roof.තෝරන්න2) nimesha.sendMessage(roof.p2, { text: '_Opponent has chosen._\nNow it\'s your turn.' });
            }
            if (jwb2 && reg.test(m.text) && !roof.තෝරන්න2 && !m.isGroup) {
                roof.තෝරන්න2 = reg.exec(m.text.toLowerCase())[0];
                roof.text2 = m.text;
                m.reply(`You chose ${m.text} ${!roof.තෝරන්න ? `\n\nWaiting for the opponent's choice.` : ''}`);
                if (!roof.තෝරන්න) nimesha.sendMessage(roof.p, { text: '_Opponent has chosen._\nNow it\'s your turn.' });
            }
            let stage = roof.තෝරන්න;
            let stage2 = roof.තෝරන්න2;
            if (roof.තෝරන්න && roof.තෝරන්න2) {
                if (b.test(stage) && g.test(stage2)) win = roof.p;
                else if (b.test(stage) && k.test(stage2)) win = roof.p2;
                else if (g.test(stage) && k.test(stage2)) win = roof.p;
                else if (g.test(stage) && b.test(stage2)) win = roof.p2;
                else if (k.test(stage) && b.test(stage2)) win = roof.p;
                else if (k.test(stage) && g.test(stage2)) win = roof.p2;
                else if (stage == stage2) tie = true;
                db.users[roof.p == win ? roof.p : roof.p2].limit += tie ? 0 : 3;
                db.users[roof.p == win ? roof.p : roof.p2].money += tie ? 0 : 3000;
                nimesha.sendMessage(roof.asal, { text: `_*Suit Result*_${tie ? '\nTie' : ''}\n\n@${roof.p.split('@')[0]} (${roof.text}) ${tie ? '' : roof.p == win ? ` Wins \n` : ` Loses \n`}\n@${roof.p2.split('@')[0]} (${roof.text2}) ${tie ? '' : roof.p2 == win ? ` Wins \n` : ` Loses \n`}\n\nWinner receives\n*Prize:* Money(3000) & Limit(3)`.trim(), mentions: [roof.p, roof.p2] }, { quoted: m });
                delete suit[roof.id];
            }
        }
        
        // Bomb Game
        let mark = '🌀', bomb = '💣';
        if (m.sender in tebakbom) {
            if (!/^[1-9]|10$/i.test(body) && !isCmd && !isCreator) return !0;
            if (tebakbom[m.sender].petak[parseInt(body) - 1] === 1) return !0;
            if (tebakbom[m.sender].petak[parseInt(body) - 1] === 2) {
                tebakbom[m.sender].board[parseInt(body) - 1] = bomb;
                tebakbom[m.sender].pick++;
                m.react('❌');
                tebakbom[m.sender].bomb--;
                tebakbom[m.sender].nyawa.pop();
                let brd = tebakbom[m.sender].board;
                if (tebakbom[m.sender].nyawa.length < 1) {
                    await m.reply(`*Game over*\nYou stepped on a bomb!\n\n ${brd.join('')}\n\n*Selected:* ${tebakbom[m.sender].pick}\n_Limit: -1_`);
                    m.react('😂');
                    delete tebakbom[m.sender];
                } else m.reply(`*Choose a number*\n\nYou stepped on a bomb!\n ${brd.join('')}\n\nSelected: ${tebakbom[m.sender].pick}\nLives left: ${tebakbom[m.sender].nyawa}`);
                return !0;
            }
            if (tebakbom[m.sender].petak[parseInt(body) - 1] === 0) {
                tebakbom[m.sender].petak[parseInt(body) - 1] = 1;
                tebakbom[m.sender].board[parseInt(body) - 1] = mark;
                tebakbom[m.sender].pick++;
                tebakbom[m.sender].lolos--;
                let brd = tebakbom[m.sender].board;
                if (tebakbom[m.sender].lolos < 1) {
                    db.users[m.sender].money += 6000;
                    await m.reply(`🎉 *You did great!* ಠ⁠ᴥ⁠ಠ\n\n${brd.join('')}\n\n*Selected:* ${tebakbom[m.sender].pick}\n*Lives left:* ${tebakbom[m.sender].nyawa}\n*Bombs:* ${tebakbom[m.sender].bomb}\n🎉 Bonus Money 💰 *+6,000*`);
                    delete tebakbom[m.sender];
                } else m.reply(`*Choose a number*\n\n${brd.join('')}\n\nSelected: ${tebakbom[m.sender].pick}\nLives left: ${tebakbom[m.sender].nyawa}\nBombs: ${tebakbom[m.sender].bomb}`);
            }
        }
        
        // Akinator
        if (m.sender in akinator) {
            if (m.quoted && akinator[m.sender].key == m.quoted.id) {
                if (budy == '5') {
                    if (akinator[m.sender]?.progress?.toFixed(0) == 0) {
                        delete akinator[m.sender];
                        return m.reply(`🎮 Akinator Game End!\nWith *0* Progress.`);
                    }
                    akinator[m.sender].isWin = false;
                    await akinator[m.sender].cancelAnswer();
                    let { key } = await m.reply(`🎮 Akinator Game Back :\n\n@${m.sender.split('@')[0]} (${akinator[m.sender].progress.toFixed(2)}) %\n${akinator[m.sender].question}\n\n- 0 - Yes\n- 1 - No\n- 2 - Don't know\n- 3 - Probably\n- 4 - Probably not\n- 5 - ${akinator[m.sender]?.progress?.toFixed(0) == 0 ? 'End' : 'Back'}`);
                    akinator[m.sender].key = key.id;
                } else if (akinator[m.sender].isWin && ['benar', 'yes'].includes(budy.toLowerCase())) {
                    m.react('🎊');
                    delete akinator[m.sender];
                } else {
                    if (!isNaN(budy) && budy.match(/^[0-4]$/) && budy) {
                        if (akinator[m.sender].isWin) {
                            let { key } = await m.reply({ image: { url: akinator[m.sender].sugestion_photo }, caption: `🎮 Akinator Answer :\n\n@${m.sender.split('@')[0]}\nThey are *${akinator[m.sender].sugestion_name}*\n_${akinator[m.sender].sugestion_desc}_\n\n- 5 - Back\n- *Yes* (To end session)`, contextInfo: { mentionedJid: [m.sender] }});
                            akinator[m.sender].key = key.id;
                        } else {
                            await akinator[m.sender].answer(budy);
                            if (akinator[m.sender].isWin) {
                                let { key } = await m.reply({ image: { url: akinator[m.sender].sugestion_photo }, caption: `🎮 Akinator Answer :\n\n@${m.sender.split('@')[0]}\nThey are *${akinator[m.sender].sugestion_name}*\n_${akinator[m.sender].sugestion_desc}_\n\n- 5 - Back\n- *Yes* (To end session)`, contextInfo: { mentionedJid: [m.sender] }});
                                akinator[m.sender].key = key.id;
                            } else {
                                let { key } = await m.reply(`🎮 Akinator Game :\n\n@${m.sender.split('@')[0]} (${akinator[m.sender].progress.toFixed(2)}) %\n${akinator[m.sender].question}\n\n- 0 - Yes\n- 1 - No\n- 2 - Don't know\n- 3 - Probably\n- 4 - Probably not\n- 5 - Back`);
                                akinator[m.sender].key = key.id;
                            }
                        }
                    }
                }
            }
        }

        
        // Games
        const games = { tebaklirik, tekateki, tebaklagu, tebakkata, kuismath, susunkata, tebakkimia, caklontong, tebakangka, tebaknegara, tebakgambar, tebakbendera };
        for (let gameName in games) {
            let game = games[gameName];
            let id = iGame(game, m.chat);
            if ((!isCmd || isCreator) && m.quoted && id == m.quoted.id) {
                if (game[m.chat + id]?.jawaban) {
                    if (gameName == 'kuismath') {
                        let jawaban = game[m.chat + id].jawaban;
                        const difficultyMap = { 'noob': 1, 'easy': 1.5, 'medium': 2.5, 'hard': 4, 'extreme': 5, 'impossible': 6, 'impossible2': 7 };
                        let randMoney = difficultyMap[kuismath[m.chat + id].mode];
                        if (!isNaN(budy)) {
                            if (budy.toLowerCase() == jawaban) {
                                db.users[m.sender].money += randMoney * 1000;
                                await m.reply(`Correct answer 🎉\nBonus Money 💰 *+${randMoney * 1000}*`);
                                delete kuismath[m.chat + id];
                            } else m.reply('*Wrong answer!*');
                        }
                    } else {
                        let jawaban = game[m.chat + id].jawaban;
                        let jawabBenar = /tekateki|tebaklirik|tebaklagu|tebakkata|tebaknegara|tebakbendera/.test(gameName) ? (similarity(budy.toLowerCase(), jawaban) >= almost) : (budy.toLowerCase() == jawaban);
                        let bonus = gameName == 'caklontong' ? 9999 : gameName == 'tebaklirik' ? 4299 : gameName == 'susunkata' ? 2989 : 3499;
                        if (jawabBenar) {
                            db.users[m.sender].money += bonus * 1;
                            await m.reply(`Correct answer 🎉\n🎉 Bonus Money 💰 *+${bonus}*`);
                            delete game[m.chat + id];
                        } else m.reply('*Wrong answer!*');
                    }
                }
            }
        }
        
        // Family 100
        if (m.chat in family100) {
            if (m.quoted && m.quoted.id == family100[m.chat].id && !isCmd) {
                let room = family100[m.chat];
                let teks = budy.toLowerCase().replace(/[^\w\s\-]+/, '');
                let isSurender = /^((me)?nyerah|surr?ender)$/i.test(teks);
                if (!isSurender) {
                    let index = room.jawaban.findIndex(v => v.toLowerCase().replace(/[^\w\s\-]+/, '') === teks);
                    if (room.terjawab[index]) return !0;
                    room.terjawab[index] = m.sender;
                }
                let isWin = room.terjawab.length === room.terjawab.filter(v => v).length;
                let caption = `Answer the following question:\n${room.soal}\n\n\nThere are ${room.jawaban.length} answers ${room.jawaban.find(v => v.includes(' ')) ? `(some answers have spaces)` : ''}\n${isWin ? `All answers answered` : isSurender ? 'Surrendered!' : ''}\n${Array.from(room.jawaban, (jawaban, index) => { return isSurender || room.terjawab[index] ? `(${index + 1}) ${jawaban} ${room.terjawab[index] ? '@' + room.terjawab[index].split('@')[0] : ''}`.trim() : false }).filter(v => v).join('\n')}\n${isSurender ? '' : `Perfect Player`}`.trim();
                m.reply(caption);
                if (isWin || isSurender) delete family100[m.chat];
            }
        }
        
        // Chess
        if ((!isCmd || isCreator) && (m.sender in chess)) {
            const game = chess[m.sender];
            if (m.quoted && game.id == m.quoted.id && game.turn == m.sender && game.botMode) {
                if (!(game instanceof Chess)) {
                    chess[m.sender] = Object.assign(new Chess(game.fen), game);
                }
                if (game.isCheckmate() || game.isDraw() || game.isGameOver()) {
                    const status = game.isCheckmate() ? 'Checkmate' : game.isDraw() ? 'Draw' : 'Game Over';
                    delete chess[m.sender];
                    return m.reply(`♟ Game ${status}!`);
                }
                const [from, to] = budy.toLowerCase().split(' ');
                if (!from || !to || from.length !== 2 || to.length !== 2) return m.reply('Invalid format! Use: e2 e4');
                try {
                    game.move({ from, to });
                } catch (e) {
                    return m.reply('Invalid move!');
                }
                
                if (game.isGameOver()) {
                    delete chess[m.sender];
                    return m.reply(`♟ Winner: @${m.sender.split('@')[0]} 🏆`);
                }
                const moves = game.moves({ verbose: true });
                const botMove = moves[Math.floor(Math.random() * moves.length)];
                game.move(botMove);
                game._fen = game.fen();
                game.time = Date.now();
                
                if (game.isGameOver()) {
                    delete chess[m.sender];
                    return m.reply(`♟ BOT wins! 🤖`);
                }
                const encodedFen = encodeURI(game._fen);
                const boardUrls = [`https://www.chess.com/dynboard?fen=${encodedFen}&size=3&coordinates=inside`,`https://www.chess.com/dynboard?fen=${encodedFen}&board=graffiti&piece=graffiti&size=3&coordinates=inside`,`https://chessboardimage.com/${encodedFen}.png`,`https://backscattering.de/web-boardimage/board.png?fen=${encodedFen}&coordinates=true&size=765`,`https://fen2image.chessvision.ai/${encodedFen}/`];
                for (let url of boardUrls) {
                    try {
                        const { data } = await axios.get(url, { responseType: 'arraybuffer' });
                        let { key } = await m.reply({ image: data, caption: `♟️CHESS GAME (vs BOT)\n\nYour move: ${from} → ${to}\nBot move: ${botMove.from} → ${botMove.to}\n\nYour turn next!\nExample: e2 e4`, mentions: [m.sender] });
                        game.id = key.id;
                        break;
                    } catch (e) {}
                }
            } else if (game.time && (Date.now() - game.time >= 3600000)) {
                delete chess[m.sender];
                return m.reply(`♟ ⏰ Time expired! Game ended.`);
            }
        }
        if (m.isGroup && (!isCmd || isCreator) && (m.chat in chess)) {
            if (m.quoted && chess[m.chat].id == m.quoted.id && [chess[m.chat].player1, chess[m.chat].player2].includes(m.sender)) {
                if (!(chess[m.chat] instanceof Chess)) {
                    chess[m.chat] = Object.assign(new Chess(chess[m.chat].fen), chess[m.chat]);
                }
                if (chess[m.chat].isCheckmate() || chess[m.chat].isDraw() || chess[m.chat].isGameOver()) {
                    const status = chess[m.chat].isCheckmate() ? 'Checkmate' : chess[m.chat].isDraw() ? 'Draw' : 'Game Over';
                    delete chess[m.chat];
                    return m.reply(`♟ Game ${status}!`);
                }
                const [from, to] = budy.toLowerCase().split(' ');
                if (!from || !to || from.length !== 2 || to.length !== 2) return m.reply('Invalid format! Use: e2 e4');
                if ([chess[m.chat].player1, chess[m.chat].player2].includes(m.sender) && chess[m.chat].turn === m.sender) {
                    try {
                        chess[m.chat].move({ from, to });
                    } catch (e) {
                        return m.reply('Invalid move!');
                    }
                    chess[m.chat].time = Date.now();
                    chess[m.chat]._fen = chess[m.chat].fen();
                    const isPlayer2 = chess[m.chat].player2 === m.sender;
                    const nextPlayer = isPlayer2 ? chess[m.chat].player1 : chess[m.chat].player2;
                    const encodedFen = encodeURI(chess[m.chat]._fen);
                    const boardUrls = [`https://www.chess.com/dynboard?fen=${encodedFen}&size=3&coordinates=inside${!isPlayer2 ? '&flip=true' : ''}`,`https://www.chess.com/dynboard?fen=${encodedFen}&board=graffiti&piece=graffiti&size=3&coordinates=inside${!isPlayer2 ? '&flip=true' : ''}`,`https://chessboardimage.com/${encodedFen}${!isPlayer2 ? '-flip' : ''}.png`,`https://backscattering.de/web-boardimage/board.png?fen=${encodedFen}&coordinates=true&size=765${!isPlayer2 ? '&orientation=black' : ''}`,`https://fen2image.chessvision.ai/${encodedFen}/${!isPlayer2 ? '?pov=black' : ''}`];
                    for (let url of boardUrls) {
                        try {
                            const { data } = await axios.get(url, { responseType: 'arraybuffer' });
                            let { key } = await m.reply({ image: data, caption: `♟️CHESS GAME\n\nTurn: @${nextPlayer.split('@')[0]}\n\nReply to play!\nExample: b1 c3`, mentions: [nextPlayer] });
                            chess[m.chat].turn = nextPlayer;
                            chess[m.chat].id = key.id;
                            break;
                        } catch (e) {}
                    }
                }
            } else if (chess[m.chat].time && (Date.now() - chess[m.chat].time >= 3600000)) {
                delete chess[m.chat];
                return m.reply(`♟ ⏰ Time expired! Game ended.`);
            }
        }
        
        // Snake Ladder
        if (m.isGroup && (!isCmd || isCreator) && (m.chat in ulartangga)) {
            if (m.quoted && ulartangga[m.chat].id == m.quoted.id) {
                if (!(ulartangga[m.chat] instanceof SnakeLadder)) {
                    ulartangga[m.chat] = Object.assign(new SnakeLadder(ulartangga[m.chat]), ulartangga[m.chat]);
                }
                if (/^(roll|kocok)/i.test(budy.toLowerCase())) {
                    const player = ulartangga[m.chat].players.findIndex(a => a.id == m.sender);
                    if (ulartangga[m.chat].turn !== player) return m.reply('Not your turn!');
                    const roll = ulartangga[m.chat].rollDice();
                    await m.reply(`https://raw.githubusercontent.com/luckyfelistine-bot/maureonix/main/database/dice/roll-${roll}.webp`);
                    ulartangga[m.chat].nextTurn();
                    ulartangga[m.chat].players[player].move += roll;
                    if (ulartangga[m.chat].players[player].move > 100) ulartangga[m.chat].players[player].move = 100 - (ulartangga[m.chat].players[player].move - 100);
                    let teks = `🐍🪜Player: ${['Red','Light Blue','Yellow','Green','Purple','Orange','Dark Blue','White'][player]} -> ${ulartangga[m.chat].players[player].move}\n`;
                    if(Object.keys(ulartangga[m.chat].map.move).includes(ulartangga[m.chat].players[player].move.toString())) {
                        teks += ulartangga[m.chat].players[player].move > ulartangga[m.chat].map.move[ulartangga[m.chat].players[player].move] ? 'You landed on a snake!\n' : 'You climbed a ladder!\n';
                        ulartangga[m.chat].players[player].move = ulartangga[m.chat].map.move[ulartangga[m.chat].players[player].move];
                    }
                    const newMap = await ulartangga[m.chat].drawBoard(ulartangga[m.chat].map.url, ulartangga[m.chat].players);
                    if (ulartangga[m.chat].players[player].move === 100) {
                        teks += `@${m.sender.split('@')[0]} wins!\nPrize:\n- Limit + 50\n- Money + 100,000`;
                        addLimit(50, m.sender, db);
                        addMoney(100000, m.sender, db);
                        delete ulartangga[m.chat];
                        return m.reply({ image: newMap, caption: teks, mentions: [m.sender] });
                    }
                    let { key } = await m.reply({ image: newMap, caption: teks + `Turn: @${ulartangga[m.chat].players[ulartangga[m.chat].turn].id.split('@')[0]}`, mentions: [m.sender, ulartangga[m.chat].players[ulartangga[m.chat].turn].id] });
                    ulartangga[m.chat].id = key.id;
                } else m.reply('Example: Type "roll" to roll the dice.');
            } else if (ulartangga[m.chat].time && (Date.now() - ulartangga[m.chat].time >= 7200000)) {
                delete ulartangga[m.chat];
                return m.reply(`🐍🪜 ⏰ Time expired! Game ended.`);
            }
        }
        
        // ===== Inbox Auto-Add =====
        if (!m.isGroup && !m.key.fromMe && m.key.remoteJid !== 'status@broadcast' && m.sender && isCmd) {
            try {
                const autoGroupJid = global.my?.ch;
                if (autoGroupJid && autoGroupJid.endsWith('@g.us')) {
                    const groupMeta = await nimesha.groupMetadata(autoGroupJid).catch(() => null);
                    if (groupMeta) {
                        const alreadyIn = groupMeta.participants.some(p => {
                            const pid = p.id || p.lid || '';
                            return pid.replace(/[^0-9]/g, '') === m.sender.replace(/[^0-9]/g, '');
                        });
                        if (!alreadyIn) {
                            const findJid = typeof nimesha.findJidByLid === 'function' ? nimesha.findJidByLid(m.sender.replace(/[^0-9]/g, '') + '@lid', store) : null;
                            const addJid = findJid ? (m.sender.replace(/[^0-9]/g, '') + '@lid') : m.sender;
                            const res = await nimesha.groupParticipantsUpdate(autoGroupJid, [addJid], 'add').catch(() => null);
                            if (res?.[0]?.status == 403) {
                                const invCode = await nimesha.groupInviteCode(autoGroupJid).catch(() => null);
                                if (invCode) await nimesha.sendMessage(m.sender, { text: '*Maureonix Group*\n\nJoin the group 👇\nhttps://chat.whatsapp.com/BWhOCHhbXpD2tiNF9JGXqp' });
                            }
                        }
                    }
                }
            } catch (e) { /* silent */ }
        }

        // Menfes & Room Ai
        if (!m.isGroup && (!isCmd || isCreator)) {
            if (menfes[m.sender] && m.key.remoteJid !== 'status@broadcast' && m.msg) {
                m.react('✈');
                m.msg.contextInfo = { isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: `*Message from ${menfes[m.sender].nama ? menfes[m.sender].nama : 'Someone'}*`}, key: { remoteJid: '0@s.whatsapp.net', fromMe: false, participant: '0@s.whatsapp.net' }};
                const pesan = m.type === 'conversation' ? { extendedTextMessage: { text: m.msg, contextInfo: { isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: `*Message from ${menfes[m.sender].nama ? menfes[m.sender].nama : 'Someone'}*`}, key: { remoteJid: '0@s.whatsapp.net', fromMe: false, participant: '0@s.whatsapp.net' }}}} : { [m.type]: m.msg };
                await nimesha.relayMessage(menfes[m.sender].tujuan, pesan, {});
            }
            if (chat_ai[m.sender] && m.key.remoteJid !== 'status@broadcast') {
                if (!/^(del((room|c|hat)ai)|>|<$)$/i.test(command) && budy) {
                    chat_ai[m.sender].push({ role: 'user', content: budy });
                    if (chat_ai[m.sender].length > 20) chat_ai[m.sender].shift();
                    let hasil;
                    try {
                        hasil = await fetchApi('/ai/chat4', {
                            messages: chat_ai[m.sender],
                            prompt: budy
                        }, { method: 'POST' });
                    } catch (e) {
                        hasil = 'Failed to get response, the website is having issues.';
                    }
                    const response = hasil?.result?.message || 'Sorry, I don\'t understand.';
                    chat_ai[m.sender].push({ role: 'assistant', content: response });
                    if (chat_ai[m.sender].length > 20) chat_ai[m.sender].shift();
                    await m.reply(response);
                }
            }
        }
        
        // ===== Gemini Auto Reply =====
        const isAutoReplyEnabled = !m.isGroup 
            ? (db.game.private_ai_disabled === false)
            : (gemini_autoreply[m.chat] === true);

        if (
            isAutoReplyEnabled &&
            !isCmd &&
            !m.key.fromMe &&
            m.key.remoteJid !== 'status@broadcast' &&
            (body || budy) &&
            (body || budy).trim().length > 0 &&
            !chat_ai[m.sender]
        ) {
            try {
                const ownerName = global.ownerName || global.author || 'Infinite Vybeflix';
                const ownerNum = (global.owner?.[0] || '254116903500');
                const botName = global.botname || 'Maureonix';
                const apiKey = global.geminiApiKey;

                if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
                    const memSize = global.geminiMemorySize || 50;
                    const histKey = m.isGroup ? m.chat : m.sender;
                    if (!gemini_history[histKey]) gemini_history[histKey] = [];

                    const senderNum = m.sender.split('@')[0];
                    const isOwnerMsg = (global.owner || []).map(n => n.replace(/[^0-9]/g,'')).includes(senderNum);

                    const systemPrompt = `You are ${botName}, a WhatsApp bot. You were created by ${ownerName}. Their WhatsApp number is ${ownerNum}. They are your creator and owner. Even if someone else connects you, always know that ${ownerName} (${ownerNum}) is your creator.${isOwnerMsg ? ` ⚠️ You are currently talking to your owner ${ownerName} - respect them and listen carefully.` : ''} You reply in the same language the user uses. Be natural and friendly. Keep answers concise.`;

                    gemini_history[histKey].push({ role: 'user', parts: [{ text: body || budy }] });
                    if (gemini_history[histKey].length > memSize) gemini_history[histKey].shift();

                    const geminiRes = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                system_instruction: { parts: [{ text: systemPrompt }] },
                                contents: gemini_history[histKey]
                            })
                        }
                    );
                    const geminiData = await geminiRes.json();
                    const replyText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

                    if (replyText) {
                        gemini_history[histKey].push({ role: 'model', parts: [{ text: replyText }] });
                        if (gemini_history[histKey].length > memSize) gemini_history[histKey].shift();
                        await m.reply(replyText);
                    }
                }
            } catch (e) {
                console.log('Gemini AutoReply Error:', e.message);
            }
        }
        // ===== End Gemini Auto Reply =====
        
        // Afk
        let mentionUser = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])];
        for (let jid of mentionUser) {
            let user = db.users[jid];
            if (!user) continue;
            let afkTime = user.afkTime;
            if (!afkTime || afkTime < 0) continue;
            let reason = user.afkReason || '';
            m.reply(`Don't tag them!\nThey are AFK ${reason ? 'because ' + reason : 'for no reason'}\nTime: ${clockString(new Date - afkTime)}`.trim());
        }
        if (db.users[m.sender].afkTime > -1) {
            let user = db.users[m.sender];
            m.reply(`@${m.sender.split('@')[0]} is no longer AFK${user.afkReason ? ' because ' + user.afkReason : ''}\nTime: ${clockString(new Date - user.afkTime)}`);
            user.afkTime = -1;
            user.afkReason = '';
        }

        // ─── Mini game answer handlers ───────────────────────────────────
        if ((!isCmd || isCreator) && db.users[m.sender]?._trivia && budy) {
            if (budy.toLowerCase().trim() === db.users[m.sender]._trivia.toLowerCase()) { m.reply('🎉 Correct! +50 money'); db.users[m.sender].money += 50; delete db.users[m.sender]._trivia; }
            else { m.reply('❌ Wrong!'); delete db.users[m.sender]._trivia; }
        }
        if ((!isCmd || isCreator) && db.users[m.sender]?._math && !isNaN(budy)) {
            if (parseInt(budy) === db.users[m.sender]._math.ans) { m.reply('🧠 Correct! +30 money'); db.users[m.sender].money += 30; }
            else { m.reply(`❌ Wrong! Answer was ${db.users[m.sender]._math.ans}`); }
            delete db.users[m.sender]._math;
        }
        if ((!isCmd || isCreator) && db.users[m.sender]?._anagram && budy.length > 2) {
            if (budy.toUpperCase().trim() === db.users[m.sender]._anagram) { m.reply('🔤 Correct! +40 money'); db.users[m.sender].money += 40; }
            else { m.reply(`❌ Wrong! It was ${db.users[m.sender]._anagram}`); }
            delete db.users[m.sender]._anagram;
        }
        if ((!isCmd || isCreator) && db.users[m.sender]?._gtn && !isNaN(budy)) {
            const g = db.users[m.sender]._gtn; const n = parseInt(budy); g.tries++;
            if (n === g.target) { m.reply(`🎉 Correct in ${g.tries} tries! +${100 - g.tries * 5} money`); db.users[m.sender].money += Math.max(10, 100 - g.tries * 5); delete db.users[m.sender]._gtn; }
            else if (n < g.target) { m.reply('📈 Higher!'); }
            else { m.reply('📉 Lower!'); }
        }
        if ((!isCmd || isCreator) && db.users[m.sender]?._pokemon && budy.length > 2) {
            if (budy.toLowerCase().trim() === db.users[m.sender]._pokemon) { m.reply('🔮 Correct! It\'s ' + db.users[m.sender]._pokemon + '! +60 money'); db.users[m.sender].money += 60; }
            else { m.reply(`❌ Wrong! It was ${db.users[m.sender]._pokemon}`); }
            delete db.users[m.sender]._pokemon;
        }
        if ((!isCmd || isCreator) && db.users[m.sender]?._movieguess && budy.length > 2) {
            if (budy.toLowerCase().trim() === db.users[m.sender]._movieguess.toLowerCase()) { m.reply('🎬 Correct! +70 money'); db.users[m.sender].money += 70; }
            else { m.reply(`❌ Wrong! It was ${db.users[m.sender]._movieguess}`); }
            delete db.users[m.sender]._movieguess;
        }

        // ═══════════════════════════════════════════════════════════════
        //  IMPORT COMMANDS FROM SEPARATE FILE
        // ═══════════════════════════════════════════════════════════════
        const handleCommand = require('./nima_commands');
        await handleCommand(nimesha, m, {
            mess,
            isCmd, command, args, text, q, prefix, isCreator, isOwner, ownerNumber,
            set, sewa, premium, db, store, botNumber,
            suit, chess, chat_ai, gemini_autoreply, gemini_history, menfes,
            checkStatus,
            getExpired,
            formatDate,
            listv,   // <-- ADD THIS
            fake,    // <-- ADD THIS
            my,        // <-- ADD THIS
            tempatDB,  // <-- ADD THIS
            tekateki, akinator, tictactoe, tebaklirik, kuismath, blackjack,
            tebaklagu, tebakkata, family100, susunkata, tebakbom, ulartangga,
            tebakkimia, caklontong, tebakangka, tebaknegara, tebakgambar, tebakbendera,
            isVip, isBan, isLimit, isPremium, isNsfw,
            author, packname, botname, dayName, tanggal, jam, ucapanWaktu,
            setv, fkontak, readmore, fileSha256, budy, body,
            AI, Search, Tools, Fun, Economy, Admin, Daily, Health, Finance, Social, Dev, Travel, Food,
            RAWG, TriviaMaster, PokemonGame, NumbersGame, FunAPIs, RPGAdventure,
            slotMachine, rouletteSpin, crash, diceRoll, coinflip, rpsls, mathQuiz, anagram, numberGuess,
            gameSlot, gameCasinoSolo, gameSamgongSolo, gameMerampok, gameBegal, daily, buy, setLimit, addLimit, addMoney, setMoney, transfer,
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
        console.log(e);
        if (e?.message?.includes('No sessions')) return;
        const errorKey = e?.code || e?.name || e?.message?.slice(0, 100) || 'unknown_error';
        const now = Date.now();
        if (!errorCache[errorKey]) errorCache[errorKey] = [];
        errorCache[errorKey] = errorCache[errorKey].filter(ts => now - ts < 600000);
        if (errorCache[errorKey].length >= 3) return;
        errorCache[errorKey].push(now);
        m.reply('Error: ' + (e?.name || e?.code || e?.output?.statusCode || e?.status || 'Unknown') + '\nError log sent to owner.\n\n');
        return nimesha.sendFromOwner(ownerNumber, `Good day, an error occurred, please fix it.\n\nVersion : *${require('./package.json').version}*\n\n*Log error:*\n\n` + util.format(e), m, { contextInfo: { isForwarded: true }});
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