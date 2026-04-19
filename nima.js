// ═══════════════════════════════════════════════════════════════════════════
//   🦊 MAUREONIX v5.0.0 – ULTIMATE COMMAND HANDLER
//   Created by Infinite Vybeflix
//   GitHub: https://github.com/luckyfelistine-bot/maureonix
// ═══════════════════════════════════════════════════════════════════════════

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
const { generateMenuImage } = require('./lib/menuimage'); // adjust path

// Core helpers (original)
const { UguuSe } = require('./lib/uploader');
const { antiSpam } = require('./lib/antispam');
const { ytMp4, ytMp3, tiktokDownload, igDownload, fbDownload, spotifyDownload, pinterestDownload, redditDownload, mediafireDownload, apkDownload } = require('./lib/scraper');
const templateMenu = require('./lib/template_menu');
const { toAudio, toPTT, toVideo } = require('./lib/converter');
const { GroupUpdate, LoadDataBase } = require('./src/message');
const { JadiBot, StopJadiBot, ListJadiBot } = require('./src/jadibot');
const { cmdAdd, cmdDel, cmdAddHit, addExpired, getPosition, getExpired, getStatus, checkStatus, getAllExpired, checkExpired } = require('./lib/database');
const { getRandom, getBuffer, fetchJson, runtime, clockString, sleep, isUrl, formatDate, formatp, generateProfilePicture, errorCache, normalize, updateSettings, parseMention, fixBytes, similarity, pickRandom, unsafeAgent, tarBackup } = require('./lib/function');

// ═══════════════════════════════════════════════════════════════════════════
//  NEW ULTIMATE LIBRARIES (v5.0.0)
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN HANDLER EXPORT
// ═══════════════════════════════════════════════════════════════════════════

module.exports = nimesha = async (nimesha, m, msg, store) => {
    await LoadDataBase(nimesha, m);
    
    const botNumber = nimesha.decodeJid(nimesha.user.id);
    
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
        (m.type == 'protocolMessage') ? (m.message.protocolMessage?.editedMessage?.extendedTextMessage?.text || m.message.protocolMessage?.editedMessage?.conversation || m.message.protocolMessage?.editedMessage?.imageMessage?.caption || m.message.protocolMessage?.editedMessage?.videoMessage?.caption || '') : '') || '';
        
        const budy = (typeof m.text == 'string' ? m.text : '');
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
        
        // Set Mode
        if (!isCreator) {
            if ((set.grouponly === set.privateonly)) {
                if (!nimesha.public && !m.key.fromMe) return;
            } else if (set.grouponly) {
                if (!m.isGroup) return;
            } else if (set.privateonly) {
                if (m.isGroup) return;
            }
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

        
        if (isCmd || fileSha256) switch(fileSha256 || command) {
            // ===== OWNER COMMANDS =====
            case 'shutdown': case 'off': {
                if (!isCreator) return m.reply(mess.owner);
                m.reply(`⚠️ *Shutdown disabled* — bot session protection is active.`);
            }
            break
            case 'byq': {
                if (!isCreator) return m.reply(mess.owner);
                if (!m.quoted) return m.reply('Reply to a message.');
                delete m.quoted.chat;
                let anya = Object.values(m.quoted.fakeObj())[1];
                m.reply(`const byt = ${JSON.stringify(anya.message, null, 2)}\nnimesha.relayMessage(m.chat, byt, {})`);
            }
            break
            case 'setbio': {
                if (!isCreator) return m.reply(mess.owner);
                if (!text) return m.reply('Where is the text?');
                nimesha.setStatus(q);
                m.reply(`✅ *Bio successfully changed to* *${q}*!`);
            }
            break
            case 'setppbot': {
                if (!isCreator) return m.reply(mess.owner);
                if (!/image/.test(quoted.type)) return m.reply(`📌 Reply to an image (caption: *${prefix + command}*)`);
                let media = await quoted.download();
                let { img } = await generateProfilePicture(media, text.length > 0 ? null : 512);
                await nimesha.query({
                    tag: 'iq',
                    attrs: {
                        to: '@s.whatsapp.net',
                        type: 'set',
                        xmlns: 'w:profile:picture'
                    },
                    content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }]
                });
                m.reply('Success');
            }
            break
            case 'delppbot': {
                if (!isCreator) return m.reply(mess.owner);
                await nimesha.removeProfilePicture(nimesha.user.id);
                m.reply('Success');
            }
            break
            case 'join': {
                if (!isCreator) return m.reply(mess.owner);
                if (!text) return m.reply('Enter the group link!');
                if (!isUrl(args[0]) && !args[0].includes('whatsapp.com')) return m.reply('Invalid link!');
                const result = args[0].match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
                if (!result) return m.reply('Invalid link❗');
                m.reply(mess.wait);
                await nimesha.groupAcceptInvite(result[1]).catch((res) => {
                    if (res.data == 400) return m.reply('Group not found❗');
                    if (res.data == 401) return m.reply('Bot has been kicked from the group❗');
                    if (res.data == 409) return m.reply('Bot is already in that group❗');
                    if (res.data == 410) return m.reply('Group URL has been reset❗');
                    if (res.data == 500) return m.reply('Group is full❗');
                });
            }
            break
            case 'leave': {
                if (!isCreator) return m.reply(mess.owner);
                await nimesha.groupLeave(m.chat).then(() => nimesha.sendFromOwner(ownerNumber, 'Successfully left the group', m, { contextInfo: { isForwarded: true }})).catch(e => {});
            }
            break
            case 'clearchat': {
                if (!isCreator) return m.reply(mess.owner);

                const statusMsg = await m.reply('🗑️ *Clearing chat...*');

                let deletedCount = 0;
                let anySuccess = false;

                try {
                    const storedMsgs = global.store?.messages?.[m.chat]?.array || [];

                    if (storedMsgs.length > 0) {
                        const lastMsg = storedMsgs[storedMsgs.length - 1];
                        try {
                            await nimesha.chatModify(
                                {
                                    clear: {
                                        messages: storedMsgs.map(msg => ({
                                            id: msg.key.id,
                                            fromMe: msg.key.fromMe,
                                            timestamp: msg.messageTimestamp
                                        }))
                                    }
                                },
                                m.chat
                            );
                            anySuccess = true;
                        } catch {}

                        if (!anySuccess) {
                            try {
                                await nimesha.chatModify(
                                    { clear: { messages: [{ id: lastMsg.key.id, fromMe: !!lastMsg.key.fromMe, timestamp: Number(lastMsg.messageTimestamp) }] } },
                                    m.chat
                                );
                                anySuccess = true;
                            } catch {}
                        }
                    } else {
                        try {
                            await nimesha.chatModify(
                                { clear: { messages: [{ id: m.key.id, fromMe: true, timestamp: Number(m.messageTimestamp) }] } },
                                m.chat
                            );
                            anySuccess = true;
                        } catch {}
                    }

                    const allMsgs = [...storedMsgs];
                    if (statusMsg?.key) allMsgs.push({ key: statusMsg.key });
                    if (m?.key) allMsgs.push({ key: m.key });

                    const chunks = [];
                    for (let i = 0; i < allMsgs.length; i += 10) chunks.push(allMsgs.slice(i, i + 10));
                    for (const chunk of chunks) {
                        await Promise.allSettled(chunk.map(async (msg) => {
                            try {
                                await nimesha.sendMessage(m.chat, { delete: msg.key });
                                deletedCount++;
                            } catch {}
                        }));
                        await new Promise(r => setTimeout(r, 200));
                    }
                    if (deletedCount > 0) anySuccess = true;

                } catch (e) {}

                try {
                    await nimesha.sendMessage(m.chat, {
                        text: anySuccess
                            ? `✅ *Success!*\n━━━━━━━━━━━━━━━━━━━━━━\n🗑️ *${deletedCount}* messages deleted\n━━━━━━━━━━━━━━━━━━━━━━`
                            : '❌ *Failed to clear chat!*',
                        edit: statusMsg.key
                    });
                } catch {
                    m.reply(anySuccess ? `✅ ${deletedCount} messages deleted` : '❌ Failed to clear chat!');
                }
            }
            break
            case 'getmsgstore': case 'storemsg': {
                if (!isCreator) return m.reply(mess.owner);
                let [teks1, teks2] = text.split`|`;
                if (teks1 && teks2) {
                    const msgnya = await global.loadMessage(teks1, teks2);
                    if (msgnya?.message) await nimesha.relayMessage(m.chat, msgnya.message, {});
                    else m.reply('Message not found!');
                } else m.reply(`Example: ${prefix + command} 123xxx@g.us|3EB0xxx`);
            }
            break
            case 'blokir': case 'block': {
                if (!isCreator) return m.reply(mess.owner);
                let _blockJid = null;
                if (m.quoted?.sender) {
                    _blockJid = m.quoted.sender;
                } else if (m.mentionedJid?.[0]) {
                    _blockJid = m.mentionedJid[0];
                } else if (text) {
                    const _rawNum = text.replace(/[^0-9]/g, '');
                    const _lidFromStore = nimesha.findJidByLid(_rawNum + '@lid', store);
                    _blockJid = _lidFromStore || (_rawNum + '@s.whatsapp.net');
                } else if (!m.isGroup) {
                    _blockJid = m.chat;
                }
                if (_blockJid) {
                    const _blockNum = _blockJid.replace('@s.whatsapp.net','').replace('@lid','');

                    const _pnJid = _blockNum + '@s.whatsapp.net';
                    let _lidJid = _blockJid.endsWith('@lid') ? _blockJid : null;

                    if (!_lidJid) {
                        try {
                            const _lidResult = await nimesha.signalRepository?.lidMapping?.getLIDForPN(_pnJid);
                            if (_lidResult) _lidJid = _lidResult;
                        } catch {}
                    }
                    if (!_lidJid) {
                        try {
                            const _wa = await nimesha.onWhatsApp(_pnJid).catch(() => []);
                            if (_wa?.[0]?.lid) _lidJid = _wa[0].lid;
                        } catch {}
                    }
                    if (!_lidJid) {
                        try {
                            const _fl = nimesha.findJidByLid(_blockNum + '@lid', store);
                            if (_fl) _lidJid = _fl;
                        } catch {}
                    }

                    const _jidsToBlock = [...new Set([_pnJid, _lidJid].filter(Boolean))];

                    const _doBlockJid = async (jid) => {
                        try { await nimesha.updateBlockStatus(jid, 'block'); } catch {}
                        try { await nimesha.query({ tag: 'iq', attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'blocklist' }, content: [{ tag: 'item', attrs: { action: 'block', jid } }] }); } catch {}
                        try { await nimesha.query({ tag: 'iq', attrs: { to: 's.whatsapp.net', type: 'set', id: nimesha.generateMessageTag(), xmlns: 'blocklist' }, content: [{ tag: 'item', attrs: { action: 'block', jid } }] }); } catch {}
                        try { await nimesha.sendNode({ tag: 'iq', attrs: { to: 's.whatsapp.net', type: 'set', id: nimesha.generateMessageTag(), xmlns: 'blocklist' }, content: [{ tag: 'item', attrs: { action: 'block', jid } }] }); } catch {}
                        try { await nimesha.ws?.sendNode?.({ tag: 'iq', attrs: { to: 's.whatsapp.net', type: 'set', xmlns: 'blocklist', id: nimesha.generateMessageTag() }, content: [{ tag: 'item', attrs: { action: 'block', jid } }] }); } catch {}
                        try { await nimesha.assertSessions([jid], true); await nimesha.updateBlockStatus(jid, 'block'); } catch {}
                    };

                    for (const _jid of _jidsToBlock) await _doBlockJid(_jid);

                    await new Promise(r => setTimeout(r, 1500));
                    let _verified = false;
                    try {
                        const _bl = await nimesha.fetchBlocklist().catch(() => []);
                        _verified = _bl.some(j => j.replace('@s.whatsapp.net','').replace('@lid','') === _blockNum);
                    } catch {}

                    if (_verified) {
                        m.reply([
                            '',
                            '*━━━━━━━━━━━━━━━━━━━━━━*',
                            '*┃  🚫  B L O C K E D  🚫  ┃*',
                            '*━━━━━━━━━━━━━━━━━━━━━━*',
                            '',
                            '📱 *Number   :*  +' + _blockNum,
                            '📅 *Date        :*  ' + tanggal,
                            '🕐 *Time        :*  ' + jam,
                            '🚫 *Status     :*  Blocked',
                            '',
                            '━━━━━━━━━━━━━━━━━━━━━━',
                            '',
                            '_Blocked, so you cannot_',
                            '_send messages or call._',
                            '_They will not be able to_',
                            '_contact you anymore._',
                            '',
                            '━━━━━━━━━━━━━━━━━━━━━━',
                        ].join('\n'));
                    } else {
                        m.reply('❌ Block failed!');
                    }
                } else {
                    m.reply(`📌 *Block Command*\n━━━━━━━━━━━━━━\n▸ Reply: ${prefix}block\n▸ Tag: ${prefix}block @mention\n▸ Number: ${prefix}block 94xxx\n▸ Private chat: ${prefix}block`);
                }
            }
            break
            case 'allblock': {
                if (!isCreator) return m.reply(mess.owner);

                const _allJids = new Set();
                const _ownerNums = ownerNumber.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
                const _addJid = (j) => {
                    if (!j) return;
                    const _isPn = j.endsWith('@s.whatsapp.net');
                    const _isLid = j.endsWith('@lid');
                    if (!_isPn && !_isLid) return;
                    if (j === botNumber) return;
                    if (_ownerNums.includes(j)) return;
                    _allJids.add(j);
                };

                try { Object.keys(store?.messages || {}).forEach(_addJid); } catch {}
                try { Object.keys(global.store?.messages || {}).forEach(_addJid); } catch {}
                try { Object.keys(store?.contacts || {}).forEach(_addJid); } catch {}
                try { Object.keys(global.store?.contacts || {}).forEach(_addJid); } catch {}
                try { Object.keys(store?.chats || {}).forEach(_addJid); } catch {}
                try {
                    Object.values(store?.messages || {}).forEach(ml => {
                        (ml?.array || []).forEach(msg => {
                            _addJid(msg?.key?.participant);
                            _addJid(msg?.key?.remoteJid);
                            _addJid(msg?.participantAlt);
                            _addJid(msg?.key?.remoteJidAlt);
                        });
                    });
                } catch {}
                try { Object.keys(db?.users || {}).forEach(_addJid); } catch {}

                if (_allJids.size === 0) return m.reply('❌ No JIDs to block.\n\nBot has not exchanged messages with anyone yet, store empty.');

                let _alreadyBlocked = new Set();
                try {
                    const _bl = await nimesha.fetchBlocklist().catch(() => []);
                    _bl.forEach(j => _alreadyBlocked.add(j.replace('@s.whatsapp.net','').replace('@lid','')));
                } catch {}

                const _targets = [..._allJids].filter(j => !_alreadyBlocked.has(j.replace('@s.whatsapp.net','').replace('@lid','')));
                if (_targets.length === 0) return m.reply(`✅ All (${_allJids.size}) are already blocked!`);

                const _prog = await m.reply(`⏳ Blocking... (0/${_targets.length})`);
                let _ok = 0;

                const _doBlockAll = async (jid) => {
                    const _num = jid.replace('@s.whatsapp.net','').replace('@lid','');
                    const _pn = _num + '@s.whatsapp.net';
                    let _lid = jid.endsWith('@lid') ? jid : null;

                    if (!_lid) {
                        try { const r = await nimesha.signalRepository?.lidMapping?.getLIDForPN(_pn); if (r) _lid = r; } catch {}
                    }
                    if (!_lid) {
                        try { const wa = await nimesha.onWhatsApp(_pn).catch(() => []); if (wa?.[0]?.lid) _lid = wa[0].lid; } catch {}
                    }
                    if (!_lid) {
                        try { const fl = nimesha.findJidByLid(_num + '@lid', store); if (fl) _lid = fl; } catch {}
                    }

                    const _jids = [...new Set([_pn, _lid].filter(Boolean))];

                    for (const _j of _jids) {
                        try { await nimesha.updateBlockStatus(_j, 'block'); } catch {}
                        try { await nimesha.query({ tag: 'iq', attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'blocklist' }, content: [{ tag: 'item', attrs: { action: 'block', jid: _j } }] }); } catch {}
                        try { await nimesha.query({ tag: 'iq', attrs: { to: 's.whatsapp.net', type: 'set', id: nimesha.generateMessageTag(), xmlns: 'blocklist' }, content: [{ tag: 'item', attrs: { action: 'block', jid: _j } }] }); } catch {}
                        try { await nimesha.sendNode({ tag: 'iq', attrs: { to: 's.whatsapp.net', type: 'set', id: nimesha.generateMessageTag(), xmlns: 'blocklist' }, content: [{ tag: 'item', attrs: { action: 'block', jid: _j } }] }); } catch {}
                        try { await nimesha.ws?.sendNode?.({ tag: 'iq', attrs: { to: 's.whatsapp.net', type: 'set', xmlns: 'blocklist', id: nimesha.generateMessageTag() }, content: [{ tag: 'item', attrs: { action: 'block', jid: _j } }] }); } catch {}
                        try { await nimesha.assertSessions([_j], true); await nimesha.updateBlockStatus(_j, 'block'); } catch {}
                    }
                };

                for (let _i = 0; _i < _targets.length; _i++) {
                    await _doBlockAll(_targets[_i]);
                    _ok++;
                    if ((_i + 1) % 5 === 0 || _i + 1 === _targets.length) {
                        await nimesha.sendMessage(m.chat, { text: `⏳ Blocking... (${_i + 1}/${_targets.length})`, edit: _prog.key }).catch(() => {});
                        await new Promise(r => setTimeout(r, 200));
                    }
                }

                await new Promise(r => setTimeout(r, 2000));
                let _finalOk = 0, _finalFail = 0;
                try {
                    const _finalBl = await nimesha.fetchBlocklist().catch(() => []);
                    const _finalNums = new Set(_finalBl.map(j => j.replace('@s.whatsapp.net','').replace('@lid','')));
                    _finalOk = _targets.filter(j => _finalNums.has(j.replace('@s.whatsapp.net','').replace('@lid',''))).length;
                    _finalFail = _targets.length - _finalOk;
                } catch { _finalOk = _ok; }

                await nimesha.sendMessage(m.chat, { text: [
                    '',
                    '*━━━━━━━━━━━━━━━━━━━━━━*',
                    '*┃  🚫  ALL BLOCKED  🚫  ┃*',
                    '*━━━━━━━━━━━━━━━━━━━━━━*',
                    '',
                    '✅ *Blocked   :*  ' + _finalOk,
                    '❌ *Failed     :*  ' + _finalFail,
                    '🔒 *Already   :*  ' + _alreadyBlocked.size,
                    '👥 *Total       :*  ' + _allJids.size,
                    '📅 *Date         :*  ' + tanggal,
                    '🕐 *Time         :*  ' + jam,
                    '',
                    '━━━━━━━━━━━━━━━━━━━━━━',
                ].join('\n'), edit: _prog.key }).catch(() => {});
            }
            break

            case 'allunblock': {
                if (!isCreator) return m.reply(mess.owner);
                const _blocklist = await nimesha.fetchBlocklist().catch(() => []);
                if (_blocklist.length === 0) return m.reply('❌ No blocked contacts.');
                const _uprogMsg = await m.reply(`⏳ Unblocking... (0/${_blocklist.length})`);
                let _unblocked = 0, _ufailed = 0, _umethods = {};

                const tryUnblock = async (jid) => {
                    try {
                        await nimesha.updateBlockStatus(jid, 'unblock');
                        _umethods['m1'] = (_umethods['m1'] || 0) + 1;
                        return true;
                    } catch {}
                    try {
                        await nimesha.query({
                            tag: 'iq',
                            attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'blocklist' },
                            content: [{ tag: 'item', attrs: { action: 'unblock', jid } }]
                        });
                        _umethods['m2'] = (_umethods['m2'] || 0) + 1;
                        return true;
                    } catch {}
                    try {
                        await nimesha.sendNode({
                            tag: 'iq',
                            attrs: { to: 's.whatsapp.net', type: 'set', id: nimesha.generateMessageTag(), xmlns: 'blocklist' },
                            content: [{ tag: 'item', attrs: { action: 'unblock', jid } }]
                        });
                        _umethods['m3'] = (_umethods['m3'] || 0) + 1;
                        return true;
                    } catch {}
                    return false;
                };

                for (const _jid of _blocklist) {
                    const ok = await tryUnblock(_jid);
                    if (ok) { _unblocked++; } else { _ufailed++; }
                    const _total = _unblocked + _ufailed;
                    if (_total % 5 === 0 || _total === _blocklist.length) {
                        await nimesha.sendMessage(m.chat, {
                            text: `⏳ Unblocking... (${_total}/${_blocklist.length}) ✅${_unblocked} ❌${_ufailed}`,
                            edit: _uprogMsg.key
                        }).catch(() => {});
                        await new Promise(r => setTimeout(r, 300));
                    }
                }
                const _umStr = Object.entries(_umethods).map(([k,v]) => k+'='+v).join(' | ') || 'none';
                await nimesha.sendMessage(m.chat, { text: [
                    '',
                    '*━━━━━━━━━━━━━━━━━━━━━━*',
                    '*┃  ✅  ALL UNBLOCKED  ✅  ┃*',
                    '*━━━━━━━━━━━━━━━━━━━━━━*',
                    '',
                    '🔓 *Unblock  :*  ' + _unblocked,
                    '❌ *Failed     :*  ' + _ufailed,
                    '👥 *Total       :*  ' + _blocklist.length,
                    '📅 *Date         :*  ' + tanggal,
                    '🕐 *Time         :*  ' + jam,
                    '',
                    '🔧 *Methods  :*  ' + _umStr,
                    '',
                    '━━━━━━━━━━━━━━━━━━━━━━',
                ].join('\n'), edit: _uprogMsg.key }).catch(() => {});
            }
            break
            case 'listblock': {
                let anu = await nimesha.fetchBlocklist();
                const _msg_listblock = await m.reply('⏳ *Loading...*');
                await nimesha.sendMessage(m.chat, { text: `Number of blocked: ${anu.length}\n` + anu.map(v => '• ' + v.replace(/@.+/, '')).join`\n`, edit: _msg_listblock.key });
            }
            break
            case 'openblokir': case 'unblokir': case 'openblock': case 'unblock': {
                if (!isCreator) return m.reply(mess.owner);
                let _unblockJid = null;
                if (m.quoted?.sender) {
                    _unblockJid = m.quoted.sender;
                } else if (m.mentionedJid?.[0]) {
                    _unblockJid = m.mentionedJid[0];
                } else if (text) {
                    _unblockJid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                } else if (!m.isGroup) {
                    _unblockJid = m.chat;
                }
                if (_unblockJid) {
                    const _unblockNum = _unblockJid.replace('@s.whatsapp.net','').replace('@lid','');
                    await nimesha.updateBlockStatus(_unblockJid, 'unblock')
                        .then(() => {
                            m.reply([
                                '',
                                '*━━━━━━━━━━━━━━━━━━━━━━*',
                                '*┃  ✅  U N B L O C K E D  ✅  ┃*',
                                '*━━━━━━━━━━━━━━━━━━━━━━*',
                                '',
                                '📱 *Number   :*  +' + _unblockNum,
                                '📅 *Date        :*  ' + tanggal,
                                '🕐 *Time        :*  ' + jam,
                                '✅ *Status     :*  Unblocked',
                                '',
                                '━━━━━━━━━━━━━━━━━━━━━━',
                                '',
                                '_Block removed. You can now_',
                                '_send messages to them again._',
                                '',
                                '━━━━━━━━━━━━━━━━━━━━━━',
                            ].join('\n'));
                        })
                        .catch(() => m.reply('❌ Unblock failed!'));
                } else {
                    m.reply(`📌 *Unblock Command*\n━━━━━━━━━━━━━━\n▸ Reply: ${prefix}unblock\n▸ Tag: ${prefix}unblock @mention\n▸ Number: ${prefix}unblock 94xxx`);
                }
            }
            break
            case 'ban': case 'banned': {
                if (!isCreator) return m.reply(mess.owner);
                if (!text) return m.reply(`📌 Tag or enter number!\nExample:\n${prefix + command} 94xxx`);
                const findJid = nimesha.findJidByLid(text.replace(/[^0-9]/g, '') + '@lid', store);
                const klss = text.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                const nmrnya = nimesha.findJidByLid(klss, store, true);
                if (db.users[nmrnya] && !db.users[nmrnya].ban) {
                    db.users[nmrnya].ban = true;
                    m.reply('User has been banned!');
                } else m.reply('User not registered in database!');
            }
            break
            case 'unban': case 'unbanned': {
                if (!isCreator) return m.reply(mess.owner);
                if (!text) return m.reply(`📌 Tag or enter number!\nExample:\n${prefix + command} 94xxx`);
                const findJid = nimesha.findJidByLid(text.replace(/[^0-9]/g, '') + '@lid', store);
                const klss = text.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                const nmrnya = nimesha.findJidByLid(klss, store, true);
                if (db.users[nmrnya] && db.users[nmrnya].ban) {
                    db.users[nmrnya].ban = false;
                    m.reply('User has been unbanned!');
                } else m.reply('User not registered in database!');
            }
            break
            case 'mute': case 'unmute': {
                if (!isCreator) return m.reply(mess.owner);
                if (!m.isGroup) return m.reply(mess.group);
                if (command == 'mute') {
                    db.groups[m.chat].mute = true;
                    m.reply('Bot has been muted in this group!');
                } else if (command == 'unmute') {
                    db.groups[m.chat].mute = false;
                    m.reply('Unmute successful');
                }
            }
            break
            case 'addowner': {
                if (!isCreator) return m.reply(mess.owner);
                if (!text || isNaN(text)) return m.reply(`📌 Tag or enter number!\nExample:\n${prefix + command} 94xxx`);
                const findJid = nimesha.findJidByLid(text.replace(/[^0-9]/g, '') + '@lid', store);
                const klss = text.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                const nmrnya = nimesha.findJidByLid(klss, store, true);
                const onWa = await nimesha.onWhatsApp(nmrnya);
                if (!onWa.length > 0) return m.reply('That number is not registered on WhatsApp!');
                if (set?.owner) {
                    if (set.owner.find(a => a === nmrnya)) return m.reply('That number is already in the owner list!');
                    set.owner.push(nmrnya);
                }
                m.reply('Owner added successfully');
            }
            break
            case 'delowner': {
                if (!isCreator) return m.reply(mess.owner);
                if (!text || isNaN(text)) return m.reply(`📌 Tag or enter number!\nExample:\n${prefix + command} 94xxx`);
                const findJid = nimesha.findJidByLid(text.replace(/[^0-9]/g, '') + '@lid', store);
                const klss = text.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                const nmrnya = nimesha.findJidByLid(klss, store, true);
                const onWa = await nimesha.onWhatsApp(nmrnya);
                if (!onWa.length > 0) return m.reply('That number is not registered on WhatsApp!');
                let list = set.owner;
                const index = list.findIndex(o => o === nmrnya);
                if (index === -1) return m.reply('Not found in owner list!');
                list.splice(index, 1);
                m.reply('Owner removed successfully');
            }
            break
            case 'adduang': case 'addmoney': {
                if (!isCreator) return m.reply(mess.owner);
                if (!args[0] || !args[1] || isNaN(args[1])) return m.reply(`📌 Tag or enter number!\nExample:\n${prefix + command} 94xxx 1000`);
                if (args[1].length > 15) return m.reply('Amount must be up to 15 digits!');
                const findJid = nimesha.findJidByLid(args[0].replace(/[^0-9]/g, '') + '@lid', store);
                const klss = args[0].replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                const nmrnya = nimesha.findJidByLid(klss, store, true);
                const onWa = await nimesha.onWhatsApp(nmrnya);
                if (!onWa.length > 0) return m.reply('That number is not registered on WhatsApp!');
                if (db.users[nmrnya] && db.users[nmrnya].money >= 0) {
                    addMoney(args[1], nmrnya, db);
                    m.reply('Money added successfully');
                } else m.reply('User not registered in database!');
            }
            break
            case 'addlimit': {
                if (!isCreator) return m.reply(mess.owner);
                if (!args[0] || !args[1] || isNaN(args[1])) return m.reply(`📌 Tag or enter number!\nExample:\n${prefix + command} 94xxx 10`);
                if (args[1].length > 10) return m.reply('Limit amount must be up to 10 digits!');
                const findJid = nimesha.findJidByLid(args[0].replace(/[^0-9]/g, '') + '@lid', store);
                const klss = args[0].replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                const nmrnya = nimesha.findJidByLid(klss, store, true);
                const onWa = await nimesha.onWhatsApp(nmrnya);
                if (!onWa.length > 0) return m.reply('That number is not registered on WhatsApp!');
                if (db.users[nmrnya] && db.users[nmrnya].limit >= 0) {
                    addLimit(args[1], nmrnya, db);
                    m.reply('Limit added successfully');
                } else m.reply('User not registered in database!');
            }
            break
            case 'listpc': {
                if (!isCreator) return m.reply(mess.owner);
                let anu = Object.keys(store.messages).filter(a => a.endsWith('.net') || a.endsWith('lid'));
                let teks = `● *Private Chat List*\n\nNumber of Chats: ${anu.length}\n\n`;
                if (anu.length === 0) return m.reply(teks);
                for (let i of anu) {
                    if (store.messages?.[i]?.array?.length) {
                        let nama = nimesha.getName(m.sender);
                        teks += `${setv} *Name:* ${nama}\n${setv} *User:* @${i.split('@')[0]}\n${setv} *Chat:* https://wa.me/${i.split('@')[0]}\n\n=====================\n\n`;
                    }
                }
                await m.reply(teks);
            }
            break
            case 'listgc': {
                if (!isCreator) return m.reply(mess.owner);
                let anu = Object.keys(store.messages).filter(a => a.endsWith('@g.us'));
                let teks = `● *Group Chat List*\n\nNumber of Groups: ${anu.length}\n\n`;
                if (anu.length === 0) return m.reply(teks);
                for (let i of anu) {
                    let metadata;
                    try {
                        metadata = store.groupMetadata[i];
                    } catch (e) {
                        metadata = (store.groupMetadata[i] = await nimesha.groupMetadata(i).catch(e => ({})));
                    }
                    teks += metadata?.subject ? `${setv} *Name:* ${metadata.subject}\n${setv} *Admin:* ${metadata.owner ? `@${metadata.owner.split('@')[0]}` : '-' }\n${setv} *ID:* ${metadata.id}\n${setv} *Created:* ${moment(metadata.creation * 1000).tz('Africa/Nairobi').format('DD/MM/YYYY HH:mm:ss')}\n${setv} *Members:* ${metadata.participants.length}\n\n=====================\n\n` : '';
                }
                await m.reply(teks);
            }
            break
            case 'creategc': case 'buatgc': {
                if (!isCreator) return m.reply(mess.owner);
                if (!text) return m.reply(`Example:\n${prefix + command} *Group Name*`);
                let group = await nimesha.groupCreate(q, [m.sender]);
                let res = await nimesha.groupInviteCode(group.id);
                await m.reply(`*Group Link:* *https://chat.whatsapp.com/${res}*\n\n*Group Name:* *${group.subject}*\nPlease join within 30 seconds to be Admin.`, { detectLink: true });
                await sleep(30000);
                await nimesha.groupParticipantsUpdate(group.id, [m.sender], 'promote').catch(e => {});
                await nimesha.sendMessage(group.id, { text: 'Okay' });
            }
            break
            case 'addsewa': case 'sewa': {
                if (!isCreator) return m.reply(mess.owner);
                if (!text) return m.reply(`Example:\n${prefix + command} https://chat.whatsapp.com/xxx | duration\n${prefix + command} https://chat.whatsapp.com/xxx | 30 days`);
                let [teks1, teks2] = text.split('|')?.map(x => x.trim()) || [];
                if (!isUrl(teks1) && !teks1.includes('chat.whatsapp.com/')) return m.reply('Invalid link!');
                const urlny = teks1.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
                if (!urlny) return m.reply('Invalid link❗');
                try {
                    await nimesha.groupAcceptInvite(urlny[1]);
                } catch (e) {
                    if (e.data == 400) return m.reply('Group not found❗');
                    if (e.data == 401) return m.reply('Bot has been kicked from the group❗');
                    if (e.data == 410) return m.reply('Group URL has been reset❗');
                    if (e.data == 500) return m.reply('Group is full❗');
                }
                await nimesha.groupGetInviteInfo(urlny[1]).then(a => {
                    addExpired({ url: urlny[1], expired: (teks2?.replace(/[^0-9]/g, '') || 30) + 'd', id: a.id }, sewa);
                    m.reply('Successfully added rental with duration: ' + (teks2?.replace(/[^0-9]/g, '') || 30) + ' days\nAuto leave when time expires!');
                }).catch(e => m.reply('Failed to add rental!'));
            }
            break
            case 'delsewa': {
                if (!isCreator) return m.reply(mess.owner);
                if (!text) return m.reply(`Example:\n${prefix + command} https://chat.whatsapp.com/xxxx\n Or \n${prefix + command} id_group@g.us`);
                let urlny;
                if (text.includes('chat.whatsapp.com/')) {
                    urlny = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/)[1];
                } else if (/@g\.us$/.test(text)) {
                    urlny = text.trim();
                } else {
                    return m.reply('Invalid format❗');
                }
                if (checkStatus(urlny, sewa)) {
                    await m.reply('Successfully deleted rental');
                    await nimesha.groupLeave(getStatus(urlny, sewa).id).catch(e => {});
                    sewa.splice(getPosition(urlny, sewa), 1);
                } else m.reply(`${text} not registered in database!\nExample:\n${prefix + command} https://chat.whatsapp.com/xxxx\n Or \n${prefix + command} id_group@g.us`);
            }
            break
            case 'listsewa': {
                if (!isCreator) return m.reply(mess.owner);
                let txt = `*------「 Rental List 」------*\n\n`;
                for (let s of sewa) {
                    txt += `➸ *ID:* ${s.id}\n➸ *URL:* https://chat.whatsapp.com/${s.url}\n➸ *Expired:* ${formatDate(s.expired)}\n\n`;
                }
                m.reply(txt);
            }
            break
            case 'addpr': case 'addprem': case 'addpremium': {
                if (!isCreator) return m.reply(mess.owner);
                if (!text) return m.reply(`Example:\n${prefix + command} @tag|duration\n${prefix + command} @${m.sender.split('@')[0]}|30 days`);
                let [teks1, teks2] = text.split('|').map(x => x.trim());
                const findJid = nimesha.findJidByLid(teks1.replace(/[^0-9]/g, '') + '@lid', store);
                const klss = teks1.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                const nmrnya = nimesha.findJidByLid(klss, store, true);
                const onWa = await nimesha.onWhatsApp(nmrnya);
                if (!onWa.length > 0) return m.reply('That number is not registered on WhatsApp!');
                if (teks2) {
                    if (db.users[nmrnya] && db.users[nmrnya].limit >= 0) {
                        addExpired({ id: nmrnya, expired: teks2.replace(/[^0-9]/g, '') + 'd' }, premium);
                        m.reply(`Successfully ${command} @${nmrnya.split('@')[0]} duration: ${teks2}`);
                        db.users[nmrnya].limit += db.users[nmrnya].vip ? limit.vip : limit.premium;
                        db.users[nmrnya].money += db.users[nmrnya].vip ? money.vip : money.premium;
                    } else m.reply('Number not registered with the bot!\nMake sure the number has used the bot!');
                } else m.reply(`Enter the duration!\nExample:\n${prefix + command} @tag|duration\n${prefix + command} @${m.sender.split('@')[0]}|30d\n_d = day_`);
            }
            break
            case 'delpr': case 'delprem': case 'delpremium': {
                if (!isCreator) return m.reply(mess.owner);
                if (!text) return m.reply(`Example:\n${prefix + command} @tag`);
                const findJid = nimesha.findJidByLid(text.replace(/[^0-9]/g, '') + '@lid', store);
                const klss = text.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                const nmrnya = nimesha.findJidByLid(klss, store, true);
                if (db.users[nmrnya] && db.users[nmrnya].limit >= 0) {
                    if (checkStatus(nmrnya, premium)) {
                        premium.splice(getPosition(nmrnya, premium), 1);
                        m.reply(`Successfully ${command} @${nmrnya.split('@')[0]}`);
                        db.users[nmrnya].limit += db.users[nmrnya].vip ? limit.vip : limit.free;
                        db.users[nmrnya].money += db.users[nmrnya].vip ? money.vip : money.free;
                    } else m.reply(`⚠️ @${nmrnya.split('@')[0]} is not a premium user!`);
                } else m.reply('Number not registered with the bot!');
            }
            break
            case 'listpr': case 'listprem': case 'listpremium': {
                if (!isCreator) return m.reply(mess.owner);
                let txt = `*------「 Premium List 」------*\n\n`;
                for (let userprem of premium) {
                    txt += `➸ *Number:* @${userprem.id.split('@')[0]}\n➸ *Limit:* ${db.users[userprem.id].limit}\n➸ *Money:* ${db.users[userprem.id].money.toLocaleString('en-US')}\n➸ *Expired:* ${formatDate(userprem.expired)}\n\n`;
                }
                m.reply(txt);
            }
            break
            case 'upsw': {
                if (!isCreator) return m.reply(mess.owner);
                const statusJidList = Object.keys(db.users);
                const backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                try {
                    if (quoted.isMedia) {
                        if (/image|video/.test(quoted.mime)) {
                            await nimesha.sendMessage('status@broadcast', {
                                [`${quoted.mime.split('/')[0]}`]: await quoted.download(),
                                caption: text || m.quoted?.body || ''
                            }, { statusJidList, broadcast: true });
                            m.react('✅');
                        } else if (/audio/.test(quoted.mime)) {
                            await nimesha.sendMessage('status@broadcast', {
                                audio: await quoted.download(),
                                mimetype: 'audio/mp4',
                                ptt: true
                            }, { backgroundColor, statusJidList, broadcast: true });
                            m.react('✅');
                        } else m.reply('Only video/audio/image/text supported');
                    } else if (quoted.text) {
                        await nimesha.sendMessage('status@broadcast', { text: text || m.quoted?.body || '' }, {
                            textArgb: 0xffffffff,
                            font: Math.floor(Math.random() * 9),
                            backgroundColor, statusJidList,
                            broadcast: true
                        });
                        m.react('✅');
                    } else m.reply('Only video/audio/image/text supported');
                } catch (e) {
                    m.reply('WhatsApp Status upload failed!');
                }
            }
            break
            case 'addcase': {
                if (!isCreator) return m.reply(mess.owner);
                if (!text && !text.startsWith('case')) return m.reply('Enter the case!');
                fs.readFile('nima.js', 'utf8', (err, data) => {
                    if (err) {
                        console.error('File read error:', err);
                        return;
                    }
                    const posisi = data.indexOf("case '19rujxl1e':");
                    if (posisi !== -1) {
                        const codeBaru = data.slice(0, posisi) + '\n' + `${text}` + '\n' + data.slice(posisi);
                        fs.writeFile('nima.js', codeBaru, 'utf8', (err) => {
                            if (err) {
                                m.reply('File write error: ', err);
                            } else m.reply('Case added successfully');
                        });
                    } else m.reply('Failed to add case!');
                });
            }
            break
            case 'getcase': {
                if (!isCreator) return m.reply(mess.owner);
                if (!text) return m.reply('Enter the case name!');
                try {
                    const getCase = (cases) => {
                        return "case"+`'${cases}'`+fs.readFileSync("nima.js").toString().split('case \''+cases+'\'')[1].split("break")[0]+"break";
                    };
                    m.reply(`${getCase(text)}`);
                } catch (e) {
                    m.reply(`❌ *${text}* command not found!`);
                }
            }
            break
            case 'delcase': {
                if (!isCreator) return m.reply(mess.owner);
                if (!text) return m.reply('Enter the case name!');
                fs.readFile('nima.js', 'utf8', (err, data) => {
                    if (err) {
                        console.error('File read error:', err);
                        return;
                    }
                    const regex = new RegExp(`case\\s+'${text.toLowerCase()}':[\\s\\S]*?break`, 'g');
                    const modifiedData = data.replace(regex, '');
                    fs.writeFile('nima.js', modifiedData, 'utf8', (err) => {
                        if (err) {
                            m.reply('File write error: ', err);
                        } else m.reply('Case successfully removed from file');
                    });
                });
            }
            break
            case 'backup': {
                if (!isCreator) return m.reply(mess.owner);
                switch (args[0]) {
                    case 'all':
                    let bekup = './database/backup_all.tar.gz';
                    tarBackup('./', bekup).then(() => {
                        return m.reply({
                            document: fs.readFileSync(bekup),
                            mimetype: 'application/gzip',
                            fileName: 'backup_all.tar.gz'
                        });
                    }).catch(e => m.reply('Backup failed: ', + e));
                    break
                    case 'auto':
                    if (set.autobackup) return m.reply('Already enabled!');
                    set.autobackup = true;
                    m.reply('Auto backup successfully enabled');
                    break
                    case 'session':
                    await m.reply({
                        document: fs.readFileSync('./nima/creds.json'),
                        mimetype: 'application/json',
                        fileName: 'creds.json'
                    });
                    break
                    case 'database':
                    let tglnya = new Date().toISOString().replace(/[:.]/g, '-');
                    let datanya = './database/' + tempatDB;
                    if (tempatDB.startsWith('mongodb')) {
                        datanya = './database/backup_database.json';
                        fs.writeFileSync(datanya, JSON.stringify(global.db, null, 2), 'utf-8');
                    }
                    await m.reply({
                        document: fs.readFileSync(datanya),
                        mimetype: 'application/json',
                        fileName: tglnya + '_database.json'
                    });
                    break
            // ═══════════════════════════════════════════════════════════════
            //  🎮 RAWG / GAME DATABASE
            // ═══════════════════════════════════════════════════════════════
            case 'rawg': case 'gamesearch': {
                if (!text) return m.reply(`Example: ${prefix + command} elden ring`);
                await m.reply('🎮 Searching RAWG...');
                try {
                    const r = await RAWG.search(text, 1, 8);
                    if (!r.results?.length) return m.reply('No games found.');
                    let txt = `🎮 *RAWG Results*\n\n`;
                    r.results.forEach((g, i) => { txt += `${i + 1}. *${g.name}* (${g.released || 'TBA'})\n⭐ ${g.rating || '?'}/5\n`; });
                    txt += `\n_Use ${prefix}gameinfo <id> for details_`;
                    m.reply(txt);
                } catch (e) { m.reply('❌ ' + e.message); }
            }
            break
            case 'gameinfo': {
                if (!text) return m.reply(`Example: ${prefix + command} <rawg-id or slug>`);
                await m.reply('🎮 Fetching game details...');
                try {
                    const g = await RAWG.details(text);
                    m.reply(RAWG.format(g));
                } catch (e) { m.reply('❌ ' + e.message); }
            }
            break
            case 'gamestores': case 'store': {
                if (!text) return m.reply(`Example: ${prefix + command} <game-id>`);
                try {
                    const s = await RAWG.stores(text);
                    let txt = `🏪 *Stores*\n`; (s.results || []).forEach(x => txt += `• ${x.store.name}: ${x.url}\n`);
                    m.reply(txt || 'No store links.');
                } catch (e) { m.reply('❌ ' + e.message); }
            }
            break
            case 'screenshots': case 'ss': {
                if (!text) return m.reply(`Example: ${prefix + command} <game-id>`);
                try {
                    const s = await RAWG.screens(text);
                    if (!s.results?.length) return m.reply('No screenshots.');
                    for (let i of s.results.slice(0, 5)) await nimesha.sendMessage(m.chat, { image: { url: i.image }, caption: '🎮 Screenshot' }, { quoted: m });
                } catch (e) { m.reply('❌ ' + e.message); }
            }
            break
            case 'trailers': case 'clips': {
                if (!text) return m.reply(`Example: ${prefix + command} <game-id>`);
                try {
                    const t = await RAWG.trailers(text);
                    if (!t.results?.length) return m.reply('No trailers.');
                    let txt = `🎬 *Trailers*\n`; t.results.forEach((v, i) => txt += `${i + 1}. [${v.name}](${v.data?.max || v.data?.[480] || v.data?.[720]})\n`);
                    m.reply(txt);
                } catch (e) { m.reply('❌ ' + e.message); }
            }
            break
            case 'topgames': {
                try { const r = await RAWG.top(); let txt = `🏆 *Top Rated Games*\n\n`; r.results.forEach((g, i) => txt += `${i + 1}. *${g.name}* — ⭐${g.rating}\n`); m.reply(txt); } catch (e) { m.reply('❌ ' + e.message); }
            }
            break
            case 'upcominggames': {
                try { const r = await RAWG.upcoming(); let txt = `🔜 *Upcoming Games*\n\n`; r.results.forEach((g, i) => txt += `${i + 1}. *${g.name}* — 📅 ${g.released || 'TBA'}\n`); m.reply(txt); } catch (e) { m.reply('❌ ' + e.message); }
            }
            break

            // ═══════════════════════════════════════════════════════════════
            //  🃏 CASINO / BRAIN GAMES
            // ═══════════════════════════════════════════════════════════════
            case 'roulette': {
                if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <amount> <red/black/even/odd/number>`);
                const bet = parseInt(args[0]); const choice = args[1].toLowerCase();
                if (isNaN(bet) || db.users[m.sender].money < bet) return m.reply('Invalid bet or insufficient money.');
                const r = rouletteSpin(); let win = false, mult = 0;
                if (['red','black','even','odd'].includes(choice) && r.color.includes(choice === 'red' ? '🔴' : choice === 'black' ? '⚫' : choice === 'even' ? (r.even ? 'yes' : 'no') : !r.even ? 'yes' : 'no')) { win = true; mult = 2; }
                else if (!isNaN(parseInt(choice)) && parseInt(choice) === r.res) { win = true; mult = 36; }
                if (win) { db.users[m.sender].money += bet * mult; m.reply(`🎰 ${r.res} ${r.color}\n\n🎉 WIN! +${bet * mult}`); }
                else { db.users[m.sender].money -= bet; m.reply(`🎰 ${r.res} ${r.color}\n\n💀 Lose -${bet}`); }
            }
            break
            case 'crash': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <amount> <auto-cashout-multiplier>`);
                const bet = parseInt(args[0]); const target = parseFloat(args[1]) || 2.0;
                if (db.users[m.sender].money < bet) return m.reply('Too poor!');
                db.users[m.sender].money -= bet;
                const c = crash();
                if (target <= c.crash) { const win = Math.floor(bet * target); db.users[m.sender].money += win; m.reply(`📈 Crashed at ${c.crash}x\n✅ You cashed out @ ${target}x\n🎉 +${win}`); }
                else { m.reply(`📈 Crashed at ${c.crash}x\n💀 You aimed for ${target}x\nBUST!`); }
            }
            break
            case 'dice': case 'roll': {
                if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <amount> <over/under> <number 2-11>`);
                const bet = parseInt(args[0]); const mode = args[1]; const num = parseInt(args[2]);
                if (db.users[m.sender].money < bet) return m.reply('Too poor!');
                const d1 = diceRoll(), d2 = diceRoll(), sum = d1 + d2;
                const win = (mode === 'over' && sum > num) || (mode === 'under' && sum < num) || (mode === 'exact' && sum === num);
                const mult = mode === 'exact' ? 5 : 2;
                if (win) { db.users[m.sender].money += bet * mult; m.reply(`🎲 ${d1} + ${d2} = ${sum}\n🎉 WIN! +${bet * mult}`); }
                else { db.users[m.sender].money -= bet; m.reply(`🎲 ${d1} + ${d2} = ${sum}\n💀 Lose`); }
            }
            break
            case 'coin': case 'coinflip': {
                if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <amount> <heads/tails>`);
                const bet = parseInt(args[0]); const side = args[1].toLowerCase(); const r = coinflip();
                if (db.users[m.sender].money < bet) return m.reply('Too poor!');
                if (side === r) { db.users[m.sender].money += bet; m.reply(`🪙 ${r}\n🎉 WIN +${bet}`); }
                else { db.users[m.sender].money -= bet; m.reply(`🪙 ${r}\n💀 Lose`); }
            }
            break
            case 'rps': case 'suitpro': {
                const choices = ['rock','paper','scissors','lizard','spock'];
                if (!args[0] || !choices.includes(args[0])) return m.reply(`Pick: rock, paper, scissors, lizard, spock`);
                const p1 = args[0]; const p2 = pickRandom(choices);
                const res = rpsls(p1, p2);
                m.reply(`You: ${p1}\nBot: ${p2}\n\n${res === 'draw' ? '🤝 Draw' : res === 'p1' ? '🎉 You win!' : '💀 Bot wins!'}`);
            }
            break
            case 'math': case 'mathquiz': {
                const diff = args[0] || 'medium';
                const q = mathQuiz(diff);
                db.users[m.sender]._math = q;
                m.reply(`🧠 *Math Quiz [${diff}]*\n${q.q}\n\nReply with the answer.`);
            }
            break
            case 'anagram': case 'scramble': {
                const a = anagram();
                db.users[m.sender]._anagram = a.original;
                m.reply(`🔤 Unscramble: *${a.scrambled}*\n\nReply with the correct word.`);
            }
            break
            case 'guessnum': case 'gtn': {
                db.users[m.sender]._gtn = numberGuess(parseInt(args[0]) || 1, parseInt(args[1]) || 100);
                m.reply(`🔢 Guess the number between ${db.users[m.sender]._gtn.min} and ${db.users[m.sender]._gtn.max}`);
            }
            break
            case 'trivia': {
                try {
                    const q = await TriviaMaster.get(args[0], args[1]);
                    db.users[m.sender]._trivia = q.correct;
                    let txt = `🎯 *Trivia* — ${q.category} | ${q.difficulty}\n\n${q.q}\n\n`;
                    q.options.forEach((o, i) => txt += `${String.fromCharCode(65 + i)}. ${o}\n`);
                    m.reply(txt);
                } catch (e) { m.reply('❌ Trivia failed'); }
            }
            break
            case 'pokemon': {
                try {
                    const p = await PokemonGame.random();
                    db.users[m.sender]._pokemon = p.name;
                    await nimesha.sendMessage(m.chat, { image: { url: p.sprite }, caption: `🔮 Who's that Pokémon?\nType: ${p.types.join('/')}\n\n${p.desc.slice(0, 120)}...\n\nReply with the name!` }, { quoted: m });
                } catch (e) { m.reply('❌ Pokemon API error'); }
            }
            break
            case 'numbers': {
                try { const t = await NumbersGame.trivia(); m.reply(`🔢 *Did you know?*\n${t}`); } catch (e) { m.reply('❌ Error'); }
            }
            break

            // ═══════════════════════════════════════════════════════════════
            //  🧙 RPG SYSTEM
            // ═══════════════════════════════════════════════════════════════
            case 'rpg': case 'adventure': {
                if (!db.users[m.sender].rpg) db.users[m.sender].rpg = new RPGAdventure(m.sender);
                const r = db.users[m.sender].rpg;
                if (args[0] === 'fight' || args[0] === 'attack') {
                    if (!r.enemy) r.spawn();
                    const res = r.attack();
                    if (res.dead) { delete db.users[m.sender].rpg; m.reply(`💀 You died on floor ${r.floor}! Game over.`); }
                    else if (res.win) { m.reply(`⚔️ Victory! +${res.gold} gold, +${res.xp} XP${res.levelup ? '\n🆙 LEVEL UP!' : ''}\n\n${r.fmt()}`); }
                    else m.reply(`⚔️ You dealt ${res.dmg}, enemy dealt ${res.edmg}\nEnemy HP: ${res.ehp}\n${r.fmt()}`);
                } else if (args[0] === 'heal') { const h = r.heal(); m.reply(h === 'poor' ? 'Need 10 gold' : `❤️ Healed! HP: ${h.hp}\n${r.fmt()}`); }
                else if (args[0] === 'spawn') { r.spawn(); m.reply(`👹 ${r.enemy.name} appeared!\n${r.fmt()}`); }
                else { m.reply(r.fmt()); }
            }
            break

            // ═══════════════════════════════════════════════════════════════
            //  🎬 MOVIE / SHOW / ANIME COMMANDS
            // ═══════════════════════════════════════════════════════════════
            case 'tv': case 'tvmaze': {
                if (!text) return m.reply(`Example: ${prefix + command} breaking bad`);
                try {
                    const r = await TVMaze.search(text);
                    if (!r.length) return m.reply('No shows found.');
                    const s = r[0].show;
                    m.reply(TVMaze.fmtShow(s));
                } catch (e) { m.reply('❌ ' + e.message); }
            }
            break
            case 'episodes': case 'eps': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <tvmaze-show-id>`);
                try {
                    const e = await TVMaze.episodes(args[0]);
                    let txt = `📺 *Episodes*\n`; e.slice(-20).forEach(x => txt += `S${String(x.season).padStart(2, '0')}E${String(x.number).padStart(2, '0')} — ${x.name}\n`);
                    m.reply(txt);
                } catch (e) { m.reply('❌ ' + e.message); }
            }
            break
            case 'tvschedule': case 'ontv': {
                try {
                    const s = await TVMaze.schedule('US');
                    let txt = `📡 *Airing Today (US)*\n\n`; s.slice(0, 15).forEach(x => txt += `• ${x.show.name} — ${x.name} (${x.show.network?.name || 'Web'})\n`);
                    m.reply(txt);
                } catch (e) { m.reply('❌ ' + e.message); }
            }
            break
            case 'anime': {
                if (!text) return m.reply(`Example: ${prefix + command} attack on titan`);
                try {
                    const r = await AniList.searchAnime(text, 1, 5);
                    if (!r.Page.media.length) return m.reply('No anime found.');
                    const a = r.Page.media[0];
                    await nimesha.sendMessage(m.chat, { image: { url: a.coverImage.large }, caption: AniList.fmtAnime(a) }, { quoted: m });
                } catch (e) { m.reply('❌ ' + e.message); }
            }
            break
            case 'manga': {
                if (!text) return m.reply(`Example: ${prefix + command} one piece`);
                try {
                    const r = await AniList.searchManga(text, 1, 5);
                    if (!r.Page.media.length) return m.reply('No manga found.');
                    const a = r.Page.media[0];
                    await nimesha.sendMessage(m.chat, { image: { url: a.coverImage.large }, caption: AniList.fmtManga(a) }, { quoted: m });
                } catch (e) { m.reply('❌ ' + e.message); }
            }
            break
            case 'trendinganime': {
                try {
                    const r = await AniList.trending();
                    let txt = `🔥 *Trending Anime*\n\n`; r.Page.media.forEach((a, i) => txt += `${i + 1}. *${a.title.english || a.title.romaji}* — ⭐${a.averageScore}\n`);
                    m.reply(txt);
                } catch (e) { m.reply('❌ ' + e.message); }
            }
            break
            case 'jikan': {
                if (!text) return m.reply(`Example: ${prefix + command} naruto`);
                try {
                    const r = await Jikan.anime(text);
                    if (!r?.length) return m.reply('No results.');
                    const a = r[0];
                    m.reply(`📺 *${a.title}*\n⭐ ${a.score || '?'}/10 | 🎭 ${(a.genres || []).map(g => g.name).join(', ')}\n📁 Episodes: ${a.episodes || '?'}\n📝 ${a.synopsis?.slice(0, 300) || '-'}\n🔗 ${a.url}`);
                } catch (e) { m.reply('❌ ' + e.message); }
            }
            break
            case 'topanime': {
                try {
                    const r = await Jikan.topAnime();
                    let txt = `🏆 *Top Anime*\n\n`; r.slice(0, 10).forEach((a, i) => txt += `${i + 1}. *${a.title}* — ⭐${a.score}\n`);
                    m.reply(txt);
                } catch (e) { m.reply('❌ ' + e.message); }
            }
            break
            case 'moviequote': case 'emojimovie': {
                const mg = new MovieGuesser(); const q = mg.random();
                db.users[m.sender]._movieguess = q.t;
                m.reply(`🎬 Guess the movie:\n\n${q.e}\n\nReply with the title!`);
            }
            break
            case 'season': {
                if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <imdb-id> <season-number>`);
                try {
                    const s = await OMDB.season(args[0], args[1]);
                    let txt = `📂 *${s.Title} — Season ${s.Season}*\n\n`; (s.Episodes || []).forEach(e => txt += `E${e.Episode} — ${e.Title} ⭐${e.imdbRating}\n`);
                    m.reply(txt);
                } catch (e) { m.reply('❌ ' + e.message); }
            }
            break

            // ═══════════════════════════════════════════════════════════════
            //  ⚽ SPORTS COMMANDS (API Sports + Odds + ESPN)
            // ═══════════════════════════════════════════════════════════════
            case 'leagues': case 'football': {
                await m.reply('⚽ Fetching football leagues...');
                try {
                    const leagues = await APISports.leagues({ current: 'true' });
                    if (!leagues.length) return m.reply('No leagues found.');
                    let txt = `📋 *Football Leagues*\n\n`;
                    leagues.slice(0, 15).forEach(l => { txt += `• *${l.league.name}* (${l.country.name})\n  ID: ${l.league.id}\n`; });
                    m.reply(txt);
                } catch (e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'fixtures': case 'matches': {
                if (!text) return m.reply(`Example: ${prefix}fixtures <league-id>\nExample: ${prefix}fixtures 39 (Premier League)`);
                const league = parseInt(text);
                if (isNaN(league)) return m.reply('Invalid league ID.');
                await m.reply('⚽ Fetching fixtures...');
                try {
                    const fixtures = await APISports.fixtures({ league, season: '2025', next: 10 });
                    if (!fixtures.length) return m.reply('No fixtures found.');
                    let txt = `📅 *Upcoming Fixtures*\n\n`;
                    fixtures.forEach(f => { txt += `${APISports.fmtFixture(f)}\n\n`; });
                    m.reply(txt);
                } catch (e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'live': case 'livescore': {
                const league = parseInt(text) || 39;
                await m.reply('⚽ Fetching live scores...');
                try {
                    const live = await APISports.live(league);
                    if (!live.length) return m.reply('No live matches.');
                    let txt = `🔥 *Live Scores*\n\n`;
                    live.forEach(f => { txt += `${APISports.fmtFixture(f)}\n\n`; });
                    m.reply(txt);
                } catch (e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'standings': case 'table': {
                if (!text) return m.reply(`Example: ${prefix}standings <league-id>\nExample: ${prefix}standings 39`);
                const league = parseInt(text);
                if (isNaN(league)) return m.reply('Invalid league ID.');
                await m.reply('📊 Fetching standings...');
                try {
                    const standings = await APISports.standings(league, '2025');
                    if (!standings.length) return m.reply('No standings found.');
                    m.reply(APISports.fmtStandings({ league: { name: 'League', standings: standings } }));
                } catch (e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'team': {
                if (!text) return m.reply(`Example: ${prefix}team <team-id>\nExample: ${prefix}team 33`);
                const id = parseInt(text);
                if (isNaN(id)) return m.reply('Invalid team ID.');
                await m.reply('🏟️ Fetching team info...');
                try {
                    const team = await APISports.team(id);
                    m.reply(APISports.fmtTeam(team[0] || {}));
                } catch (e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'player': {
                if (!text) return m.reply(`Example: ${prefix}player <player-id>\nExample: ${prefix}player 276`);
                const id = parseInt(text);
                if (isNaN(id)) return m.reply('Invalid player ID.');
                await m.reply('👤 Fetching player info...');
                try {
                    const player = await APISports.player(id, '2025');
                    m.reply(APISports.fmtPlayer(player[0] || {}));
                } catch (e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'h2h': case 'headtohead': {
                if (!text) return m.reply(`Example: ${prefix}h2h <team1-id>-<team2-id>\nExample: ${prefix}h2h 33-40`);
                const [t1, t2] = text.split('-').map(x => parseInt(x.trim()));
                if (isNaN(t1) || isNaN(t2)) return m.reply('Invalid format. Use: 33-40');
                await m.reply('⚽ Fetching head-to-head...');
                try {
                    const h2h = await APISports.headToHead(`${t1}-${t2}`);
                    if (!h2h.length) return m.reply('No matches found.');
                    let txt = `⚔️ *Head to Head*\n\n`;
                    h2h.slice(0, 5).forEach(f => { txt += `${APISports.fmtFixture(f)}\n\n`; });
                    m.reply(txt);
                } catch (e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'predict': case 'prediction': {
                if (!text) return m.reply(`Example: ${prefix}prediction <fixture-id>`);
                const id = parseInt(text);
                if (isNaN(id)) return m.reply('Invalid fixture ID.');
                await m.reply('🔮 Fetching prediction...');
                try {
                    const pred = await APISports.predictions(id);
                    if (!pred.length) return m.reply('No prediction available.');
                    const p = pred[0];
                    let txt = `🔮 *Match Prediction*\n\n`;
                    txt += `⚽ ${p.teams?.home?.name} vs ${p.teams?.away?.name}\n\n`;
                    txt += `📊 *Win Probability*\n`;
                    txt += `Home: ${p.predictions?.percent?.home || '?'}%\n`;
                    txt += `Draw: ${p.predictions?.percent?.draw || '?'}%\n`;
                    txt += `Away: ${p.predictions?.percent?.away || '?'}%\n`;
                    txt += `\n💡 *Advice:* ${p.predictions?.advice || 'N/A'}`;
                    m.reply(txt);
                } catch (e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'odds': case 'betting': {
                if (!text) return m.reply(`Example: ${prefix}odds <sport-key>\nExample: ${prefix}odds soccer_epl`);
                const sport = text.trim();
                await m.reply('🎲 Fetching odds...');
                try {
                    const odds = await OddsAPI.odds(sport, 'us', 'h2h');
                    if (!odds.length) return m.reply('No odds found.');
                    let txt = `🎲 *Betting Odds*\n\n`;
                    odds.slice(0, 5).forEach(e => { txt += `${OddsAPI.fmtOdds(e)}\n`; });
                    m.reply(txt);
                } catch (e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'sports': {
                await m.reply('🎲 Fetching available sports...');
                try {
                    const sports = await OddsAPI.sports();
                    if (!sports.length) return m.reply('No sports found.');
                    let txt = `🏈 *Available Sports*\n\n`;
                    sports.forEach(s => { txt += `• *${s.title}* — Key: \`${s.key}\` ${s.active ? '🟢' : '🔴'}\n`; });
                    m.reply(txt);
                } catch (e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'espn': case 'scoreboard': {
                if (!args[0] || !args[1]) return m.reply(`Example: ${prefix}espn <sport> <league>\nExample: ${prefix}espn soccer eng.1`);
                const sport = args[0]; const league = args[1];
                await m.reply('📺 Fetching ESPN scoreboard...');
                try {
                    const sb = await ESPN.scoreboard(sport, league);
                    m.reply(ESPN.fmtScoreboard(sb));
                } catch (e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'espnnews': case 'sportsnews': {
                if (!args[0] || !args[1]) return m.reply(`Example: ${prefix}espnnews <sport> <league>\nExample: ${prefix}espnnews soccer eng.1`);
                const sport = args[0]; const league = args[1];
                await m.reply('📰 Fetching news...');
                try {
                    const news = await ESPN.news(sport, league);
                    let txt = `📰 *ESPN News*\n\n`;
                    news.articles?.slice(0, 5).forEach(a => { txt += `• *${a.headline}*\n  ${a.description?.slice(0, 80)}...\n  🔗 ${a.links?.web?.href}\n\n`; });
                    m.reply(txt);
                } catch (e) { m.reply(`❌ ${e.message}`); }
            }
            break

            // ═══════════════════════════════════════════════════════════════
            //  🎮 CONNECT 4 (Multiplayer)
            // ═══════════════════════════════════════════════════════════════
            case 'connect4': case 'c4': {
                if (!m.isGroup) return m.reply('This game is only available in groups.');
                const opponent = m.mentionedJid?.[0];
                if (!opponent) return m.reply(`Mention an opponent!\nExample: ${prefix}connect4 @user`);
                if (opponent === m.sender) return m.reply('You cannot play against yourself!');
                if (opponent === botNumber) return m.reply('Bot cannot play Connect 4 yet.');
                if (!db.game.connect4) db.game.connect4 = {};
                const existing = Object.values(db.game.connect4).find(g => g.state === 'PLAYING' && [g.player1, g.player2].includes(m.sender));
                if (existing) return m.reply('You are already in an active game! Finish it first.');
                const gameId = `c4_${Date.now()}`;
                const board = Array(6).fill().map(() => Array(7).fill(0));
                const firstTurn = Math.random() < 0.5 ? 1 : 2;
                db.game.connect4[gameId] = { id: gameId, player1: m.sender, player2: opponent, turn: firstTurn, board: board, state: 'PLAYING', lastMove: Date.now() };
                const symbols = { 0: '⚪', 1: '🔴', 2: '🟡' };
                let boardStr = '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣\n';
                for (let r = 0; r < 6; r++) { for (let c = 0; c < 7; c++) { boardStr += symbols[board[r][c]]; } boardStr += '\n'; }
                boardStr += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣';
                const firstPlayer = firstTurn === 1 ? m.sender : opponent;
                await m.reply(`🎮 *Connect 4 Started!*\n🔴 @${m.sender.split('@')[0]} vs 🟡 @${opponent.split('@')[0]}\n\nFirst turn: @${firstPlayer.split('@')[0]}\n\n${boardStr}\n\nReply with column number (1-7) to drop your piece.`, { mentions: [m.sender, opponent] });
            }
            break
                    default:
                    m.reply('Use commands:\n- backup all\n- backup auto\n- backup session\n- backup database');
                }
            }
            break
            case 'getsession': {
                if (!isCreator) return m.reply(mess.owner);
                await m.reply({
                    document: fs.readFileSync('./nima/creds.json'),
                    mimetype: 'application/json',
                    fileName: 'creds.json'
                });
            }
            break
            case 'deletesession': case 'delsession': {
                if (!isCreator) return m.reply(mess.owner);
                fs.readdir('./nima', async function (err, files) {
                    if (err) {
                        console.error('Cannot scan directory: ' + err);
                        return m.reply('Cannot scan directory: ' + err);
                    }
                    let filteredArray = await files.filter(item => ['session-', 'pre-key', 'sender-key', 'app-state'].some(ext => item.startsWith(ext)));                    
                    let teks = `Detected ${filteredArray.length} session files\n\n`;
                    if(filteredArray.length == 0) return m.reply(teks);
                    filteredArray.map(function(e, i) {
                        teks += (i+1)+`. ${e}\n`;
                    });
                    if (text && text == 'true') {
                        let { key } = await m.reply('Deleting session files...');
                        await filteredArray.forEach(function (file) {
                            fs.unlinkSync('./nima/' + file);
                        });
                        sleep(2000);
                        m.reply('Session garbage successfully deleted', { edit: key });
                    } else m.reply(teks + `\n_${prefix + command} true_ to delete`);
                });
            }
            break
            case 'deletesampah': case 'delsampah': {
                if (!isCreator) return m.reply(mess.owner);
                fs.readdir('./database/sampah', async function (err, files) {
                    if (err) {
                        console.error('Cannot scan directory: ' + err);
                        return m.reply('Cannot scan directory: ' + err);
                    }
                    let filteredArray = await files.filter(item => ['gif', 'png', 'bin','mp3', 'mp4', 'jpg', 'webp', 'webm', 'opus', 'jpeg'].some(ext => item.endsWith(ext)));
                    let teks = `Detected ${filteredArray.length} garbage files\n\n`;
                    if(filteredArray.length == 0) return m.reply(teks);
                    filteredArray.map(function(e, i) {
                        teks += (i+1)+`. ${e}\n`;
                    });
                    if (text && text == 'true') {
                        let { key } = await m.reply('Deleting garbage files...');
                        await filteredArray.forEach(function (file) {
                            fs.unlinkSync('./database/temp/' + file);
                        });
                        sleep(2000);
                        m.reply('Garbage successfully deleted', { edit: key });
                    } else m.reply(teks + `\n_${prefix + command} true_ to delete`);
                });
            }
            break
            case 'setbotname': {
                if (!isCreator) return m.reply(mess.owner);
                if (text || m.quoted) {
                    const teksnya = text ? text : m.quoted.text;
                    await updateSettings({
                        filePath: settingsPath,
                        botname: teksnya.trim()
                    });
                    m.reply('Success');
                } else m.reply(`Example: ${prefix + command} text`);
            }
            break
            case 'setpacknamebot': case 'setbotpackname': {
                if (!isCreator) return m.reply(mess.owner);
                if (text || m.quoted) {
                    const teksnya = text ? text : m.quoted.text;
                    await updateSettings({
                        filePath: settingsPath,
                        packname: teksnya.trim()
                    });
                    m.reply('Success');
                } else m.reply(`Example: ${prefix + command} text`);
            }
            break
            case 'setauthorbot': case 'setbotauthor': {
                if (!isCreator) return m.reply(mess.owner);
                if (text || m.quoted) {
                    const teksnya = text ? text : m.quoted.text;
                    await updateSettings({
                        filePath: settingsPath,
                        author: teksnya.trim()
                    });
                    m.reply('Success');
                } else m.reply(`Example: ${prefix + command} text`);
            }
            break
            case 'setapikey': {
                if (!isCreator) return m.reply(mess.owner);
                if (!text) return m.reply('Where is the API key?');
                if (!text.startsWith('nz-')) return m.reply('Invalid API key!\nGet API key at: https://nima.biz.id/profile');
                const newKey = text.trim();
                const oldKey = global.APIKeys[global.APIs.nima] || 'undefined';
                // 1. Update in-memory immediately
                global.APIKeys[global.APIs.nima] = newKey;
                // 2. Persist to config.js (so it survives restart)
                const fs = require('fs');
                const path = require('path');
                const configPath = path.join(process.cwd(), 'config.js');   // ✅ FIXED PATH
                let configContent = fs.readFileSync(configPath, 'utf8');
                configContent = configContent.replace(/apiKey:\s*['"][^'"]*['"]/, `apiKey: '${newKey}'`);
                fs.writeFileSync(configPath, configContent);
                // 3. Success message
                m.reply(`✅ *API Key* *${oldKey}* *→* *${newKey}* *changed!*`);
            }
            break
            case 'sc': case 'script': {
                await m.reply(`https://github.com/luckyfelistine-bot/maureonix\n⬆️ This is the script`, {
                    contextInfo: {
                        forwardingScore: 10,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: my.ch,
                            serverMessageId: null,
                            newsletterName: 'Maureonix'
                        },
                        externalAdReply: {
                            title: author,
                            body: 'Subscribe My YouTube',
                            thumbnail: fake.thumbnail,
                            mediaType: 2,
                            mediaUrl: my.tt,
                            sourceUrl: my.tt,
                        }
                    }
                });
            }
            break
            case 'donasi': case 'donate': {
                const _msg_donasi = await m.reply('⏳ 💰 *Getting donation info...*');
                await nimesha.sendMessage(m.chat, { text: 'You can donate via this URL:\nhttps://saweria.co/nima-axis', edit: _msg_donasi.key });
            }
            break
            
            // ===== GROUP COMMANDS =====
            case 'add': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                if (text || m.quoted) {
                    const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
                    const findJid = nimesha.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
                    const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                    const nmrnya = nimesha.findJidByLid(klss, store, true);
                    try {
                        const res = await nimesha.groupParticipantsUpdate(m.chat, [nmrnya], 'add');
                        for (let i of (res || [])) {
                            const statusMessages = {
                                200: `Successfully added @${nmrnya.split('@')[0]} to the group!`,
                                401: 'They have blocked the bot!',
                                409: 'They are already in the group!',
                                500: 'Group is full!'
                            };
                            if (statusMessages[i.status]) {
                                await m.reply(statusMessages[i.status]);
                            } else if (i.status == 408) {
                                const invv = await nimesha.groupInviteCode(m.chat).catch(() => null);
                                await m.reply(`@${nmrnya.split('@')[0]} recently left the group!\n\nBecause of privacy, an invitation is being sent\n-> wa.me/${nmrnya.replace(/\D/g, '')}`);
                                if (invv) await nimesha.sendMessage(nmrnya, { text: `https://chat.whatsapp.com/${invv}\n\nAdmin: @${m.sender.split('@')[0]}\nInvites you to the group 🙇` }).catch(() => m.reply('❌ Failed to send invitation!'));
                            } else if (i.status == 403) {
                                try {
                                    const attrs = i?.content?.content?.[0]?.attrs;
                                    if (attrs?.code && attrs?.expiration) {
                                        await nimesha.sendGroupInviteV4(m.chat, nmrnya, attrs.code, attrs.expiration, m.metadata.subject, `Admin: @${m.sender.split('@')[0]}\nInvites you to the group 🙇`, null, { mentions: [m.sender] });
                                    } else {
                                        const invv = await nimesha.groupInviteCode(m.chat).catch(() => null);
                                        if (invv) await nimesha.sendMessage(nmrnya, { text: `https://chat.whatsapp.com/${invv}\n\nAdmin: @${m.sender.split('@')[0]}\nInvites you to the group 🙇` }).catch(() => {});
                                    }
                                    await m.reply(`@${nmrnya.split('@')[0]} is a private account, cannot add directly\nInvitation sent -> wa.me/${nmrnya.replace(/\D/g, '')}`, { mentions: [nmrnya] });
                                } catch (invErr) {
                                    const invv = await nimesha.groupInviteCode(m.chat).catch(() => null);
                                    if (invv) await nimesha.sendMessage(nmrnya, { text: `https://chat.whatsapp.com/${invv}\n\nAdmin: @${m.sender.split('@')[0]}\nInvites you to the group 🙇` }).catch(() => {});
                                    await m.reply(`@${nmrnya.split('@')[0]} is a private account, cannot add directly\nInvitation sent`, { mentions: [nmrnya] });
                                }
                            } else {
                                await m.reply('Failed to add user\nStatus: ' + i.status);
                            }
                        }
                    } catch (e) {
                        console.error('[.add error]', e);
                        await m.reply('An error occurred! Failed to add user\n' + (e?.message || ''));
                    }
                } else m.reply(`⚠️ *Add Command*\n\nTo add someone to the group:\n📌 With number: ${prefix + command} *94xxxxxxxxx*\n\nExample: ${prefix + command} 254712345678`);
            }
            break

            case 'kick': case 'dor': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                if (text || m.quoted) {
                    const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
                    const findJid = nimesha.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
                    const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                    const nmrnya = nimesha.findJidByLid(klss, store, true);
                    await nimesha.groupParticipantsUpdate(m.chat, [nmrnya], 'remove')
                        .then(() => m.reply(`╔══════════════════╗\n║  🦵 *Kicked from group* 🦵\n╠══════════════════╣\n║\n║ ✅ @${nmrnya.split('@')[0]}\n║ *Successfully removed*\n║ *from the group!*\n║\n║ 🏅 Group: ${m.metadata.subject}\n║ 👤 By: @${m.sender.split('@')[0]}\n╚══════════════════╝`, { mentions: [nmrnya, m.sender] }))
                        .catch(() => m.reply('❌ Kick failed!'));
                } else m.reply(`⚠️ *Kick Command*\n\nTo remove someone:\n📌 By reply: *(reply to their message)*\n📌 With number: ${prefix + command} *94xxxxxxxxx*\n\nExample: ${prefix + command} 254712345678`);
            }
            break
            case 'promote': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                if (text || m.quoted) {
                    const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
                    const findJid = nimesha.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
                    const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                    const nmrnya = nimesha.findJidByLid(klss, store, true);
                    await nimesha.groupParticipantsUpdate(m.chat, [nmrnya], 'promote')
                        .then(() => m.reply(`╔══════════════════╗\n║  👑 *Admin Promotion* 👑\n╠══════════════════╣\n║\n║ ✅ @${nmrnya.split('@')[0]}\n║ *Successfully promoted*\n║ *to Admin!*\n║\n║ 🏅 Group: ${m.metadata.subject}\n║ 👤 By: @${m.sender.split('@')[0]}\n╚══════════════════╝`, { mentions: [nmrnya, m.sender] }))
                        .catch(() => m.reply('❌ Promote failed!'));
                } else m.reply(`⚠️ *Promote Command*\n\nTo promote someone to Admin:\n📌 By reply: *(reply to their message)*\n📌 With number: ${prefix + command} *94xxxxxxxxx*\n\nExample: ${prefix + command} 254712345678`);
            }
            break
            case 'demote': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                if (text || m.quoted) {
                    const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
                    const findJid = nimesha.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
                    const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                    const nmrnya = nimesha.findJidByLid(klss, store, true);
                    await nimesha.groupParticipantsUpdate(m.chat, [nmrnya], 'demote')
                        .then(() => m.reply(`╔══════════════════╗\n║  🚫 *Admin Demotion* 🚫\n╠══════════════════╣\n║\n║ ✅ @${nmrnya.split('@')[0]}\n║ *Successfully demoted*\n║ *from Admin!*\n║\n║ 🏅 Group: ${m.metadata.subject}\n║ 👤 By: @${m.sender.split('@')[0]}\n╚══════════════════╝`, { mentions: [nmrnya, m.sender] }))
                        .catch(() => m.reply('❌ Demote failed!'));
                } else m.reply(`⚠️ *Demote Command*\n\nTo demote an Admin:\n📌 By reply: *(reply to their message)*\n📌 With number: ${prefix + command} *94xxxxxxxxx*\n\nExample: ${prefix + command} 254712345678`);
            }
            break
            case 'warn': case 'warning': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                if (text || m.quoted) {
                    const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
                    const findJid = nimesha.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
                    const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                    const nmrnya = nimesha.findJidByLid(klss, store, true);
                    if (!db.groups[m.chat].warn[nmrnya]) {
                        db.groups[m.chat].warn[nmrnya] = 1;
                        m.reply('Warning 1/4, can be kicked at any time❗');
                    } else if (db.groups[m.chat].warn[nmrnya] >= 3) {
                        await nimesha.groupParticipantsUpdate(m.chat, [nmrnya], 'remove').catch((err) => m.reply('Failed!'));
                        delete db.groups[m.chat].warn[nmrnya];
                    } else {
                        db.groups[m.chat].warn[nmrnya] += 1;
                        m.reply(`Warning ${db.groups[m.chat].warn[nmrnya]}/4, can be kicked at any time❗`);
                    }
                } else m.reply(`⚠️ *Warn Command*\n\nTo warn someone:\n📌 By reply: *(reply to their message)*\n📌 With number: ${prefix + command} *94xxxxxxxxx*\n\nExample: ${prefix + command} 254712345678`);
            }
            break
            case 'unwarn': case 'delwarn': case 'unwarning': case 'delwarning': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                if (text || m.quoted) {
                    const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
                    const findJid = nimesha.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
                    const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                    const nmrnya = nimesha.findJidByLid(klss, store, true);
                    if (db.groups[m.chat]?.warn?.[nmrnya]) {
                        delete db.groups[m.chat].warn[nmrnya];
                        m.reply('Warning successfully removed');
                    }
                } else m.reply(`⚠️ *Unwarn Command*\n\nTo remove a warning:\n📌 By reply: *(reply to their message)*\n📌 With number: ${prefix + command} *94xxxxxxxxx*\n\nExample: ${prefix + command} 254712345678`);
            }
            break
            case 'setname': case 'setnamegc': case 'setsubject': case 'setsubjectgc': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                if (text || m.quoted) {
                    const teksnya = text ? text : m.quoted.text;
                    await nimesha.groupUpdateSubject(m.chat, teksnya).catch((err) => m.reply('Failed!'));
                } else m.reply(`⚠️ *Setname Command*\n\nTo change the group name:\n📌 ${prefix + command} *New Name*\n\nExample: ${prefix + command} Maureonix Group`);
            }
            break
            case 'setdesc': case 'setdescgc': case 'setdesk': case 'setdeskgc': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                if (text || m.quoted) {
                    const teksnya = text ? text : m.quoted.text;
                    await nimesha.groupUpdateDescription(m.chat, teksnya).catch((err) => m.reply('Failed!'));
                } else m.reply(`⚠️ *Setdesc Command*\n\nTo change the group description:\n📌 ${prefix + command} *Description*\n\nExample: ${prefix + command} Welcome everyone!`);
            }
            break
            case 'setppgroups': case 'setppgrup': case 'setppgc': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                if (!m.quoted) return m.reply('Reply to an image for the group profile picture');
                if (!/image/.test(quoted.type)) return m.reply(`📌 Reply to an image (caption: *${prefix + command}*)`);
                let media = await quoted.download();
                let { img } = await generateProfilePicture(media, text.length > 0 ? null : 512);
                await nimesha.query({
                    tag: 'iq',
                    attrs: {
                        target: m.chat,
                        to: '@s.whatsapp.net',
                        type: 'set',
                        xmlns: 'w:profile:picture'
                    },
                    content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }]
                });
                m.reply('Success');
            }
            break
            case 'delete': case 'del': case 'd': {
                if (!m.quoted) return m.reply('Reply to the message you want to delete');
                await nimesha.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: m.isBotAdmin ? false : true, id: m.quoted.id, participant: m.quoted.sender }});
            }
            break
            case 'pin': case 'unpin': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                await nimesha.sendMessage(m.chat, { pin: { type: command == 'pin' ? 1 : 0, time: 2592000, key: m.quoted ? m.quoted.key : m.key }});
            }
            break
            case 'linkgroup': case 'linkgrup': case 'linkgc': case 'urlgroup': case 'urlgrup': case 'urlgc': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                let response = await nimesha.groupInviteCode(m.chat);
                await m.reply(`https://chat.whatsapp.com/${response}\n\nLink Group : ${(store.groupMetadata[m.chat] ? store.groupMetadata[m.chat] : (store.groupMetadata[m.chat] = await nimesha.groupMetadata(m.chat))).subject}`, { detectLink: true });
            }
            break
            case 'revoke': case 'newlink': case 'newurl': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                await nimesha.groupRevokeInvite(m.chat).then((a) => {
                    m.reply(`✅ Success! Group link reset for: ${m.metadata.subject}`);
                }).catch((err) => m.reply('Failed!'));
            }
            break
            case 'group': case 'grup': case 'gc': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                let set = db.groups[m.chat];
                switch (args[0]?.toLowerCase()) {
                    case 'close': case 'open':
                    await nimesha.groupSettingUpdate(m.chat, args[0] == 'close' ? 'announcement' : 'not_announcement').then(a => m.reply(`*${args[0] == 'open' ? '🔓 Group opened!' : '🔒 Group closed!'}*`));
                    break
                    case 'join':
                    const _list = await nimesha.groupRequestParticipantsList(m.chat).then(a => a.map(b => b.jid));
                    if (/(a(p|pp|cc)|(ept|rove))|true|ok/i.test(args[1]) && _list.length > 0) {
                        await nimesha.groupRequestParticipantsUpdate(m.chat, _list, 'approve').catch(e => m.react('❌'));
                    } else if (/reject|false|no/i.test(args[1]) && _list.length > 0) {
                        await nimesha.groupRequestParticipantsUpdate(m.chat, _list, 'reject').catch(e => m.react('❌'));
                    } else m.reply(`List Request Join :\n${_list.length > 0 ? '- @' + _list.join('\n- @').split('@')[0] : '*Nothing*'}\nExample: ${prefix + command} join acc/reject`);
                    break
                    case 'pesansementara': case 'disappearing':
                    if (/90|7|1|24|on/i.test(args[1])) {
                        nimesha.sendMessage(m.chat, { disappearingMessagesInChat: /90/i.test(args[1]) ? 7776000 : /7/i.test(args[1]) ? 604800 : 86400 });
                    } else if (/0|off|false/i.test(args[1])) {
                        nimesha.sendMessage(m.chat, { disappearingMessagesInChat: 0 });
                    } else m.reply('Please choose:\n90 days, 7 days, 1 day, off');
                    break
                    case 'antilink': case 'antivirtex': case 'antidelete': case 'welcome': case 'antitoxic': case 'waktusholat': case 'nsfw': case 'antihidetag': case 'setinfo': case 'antitagsw': case 'leave': case 'promote': case 'demote':
                    if (/on|true/i.test(args[1])) {
                        if (set[args[0]]) return m.reply('*Already enabled*');
                        set[args[0]] = true;
                        m.reply('*Successfully changed to On*');
                    } else if (/off|false/i.test(args[1])) {
                        set[args[0]] = false;
                        m.reply('*Successfully changed to Off*');
                    } else m.reply(`⚠️ *${args[0].charAt(0).toUpperCase() + args[0].slice(1)}* type on or off`);
                    break
                    case 'setwelcome': case 'setleave': case 'setpromote': case 'setdemote':
                    if (args[1]) {
                        set.text[args[0]] = args.slice(1).join(' ');
                        m.reply(`Successfully changed ${args[0].split('set')[1]} to:\n${set.text[args[0]]}`);
                    } else m.reply(`📌 *${args[0]} Command*\n\nExample: ${prefix + command} ${args[0]} Welcome @ !\n\n*Special Tags:*\n• @ → user mention\n• @admin → admin mention\n• @subject → ${m.metadata.subject}\n\nExample: ${prefix + command} ${args[0]} Welcome @ to ${m.metadata.subject} ❤️`);
                    break
                    default:
                    m.reply(`Group settings for ${m.metadata.subject}\n- open\n- close\n- join acc/reject\n- disappearing 90/7/1/off\n- antilink on/off ${set.antilink ? '🟢' : '🔴'}\n- antivirtex on/off ${set.antivirtex ? '🟢' : '🔴'}\n- antidelete on/off ${set.antidelete ? '🟢' : '🔴'}\n- welcome on/off ${set.welcome ? '🟢' : '🔴'}\n- leave on/off ${set.leave ? '🟢' : '🔴'}\n- promote on/off ${set.promote ? '🟢' : '🔴'}\n- demote on/off ${set.demote ? '🟢' : '🔴'}\n- setinfo on/off ${set.setinfo ? '🟢' : '🔴'}\n- nsfw on/off ${set.nsfw ? '🟢' : '🔴'}\n- waktusholat on/off ${set.waktusholat ? '🟢' : '🔴'}\n- antihidetag on/off ${set.antihidetag ? '🟢' : '🔴'}\n- antitagsw on/off ${set.antitagsw ? '🟢' : '🔴'}\n\n- setwelcome _text_\n- setleave _text_\n- setpromote _text_\n- setdemote _text_\n\nExample:\n${prefix + command} antilink off`);
                }
            }
            break
            case 'tagall': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                let setv = pickRandom(listv);
                let members = m.metadata.participants.map(p => {
                    if (p.id && p.id.endsWith('@lid') && p.lid) {
                        const real = nimesha.findJidByLid ? nimesha.findJidByLid(p.id, store) : null;
                        return { ...p, id: (real && !real.endsWith('@lid')) ? real : (p.jid || p.id) };
                    }
                    return p;
                }).filter(p => p.id && !p.id.endsWith('@lid'));
                if (!members.length) members = m.metadata.participants;
                let chunkSize = 50;
                if (m.quoted) {
                    const quotedType = m.quoted.type;
                    const allMentions = members.map(a => a.id);
                    const isMedia = /image|video|audio|document|sticker|ptt|voice/.test(quotedType);
                    if (isMedia) {
                        let captionTeks = `*Tagging everyone*\n\n*Message:* ${q ? q : ''}\n\n`;
                        for (let mem of members.slice(0, 50)) {
                            captionTeks += `${setv} @${mem.id.split('@')[0]}\n`;
                        }
                        try {
                            const mediaBuffer = await m.quoted.download();
                            const mediaMime = m.quoted.msg?.mimetype || m.quoted.mimetype || 'application/octet-stream';
                            let mediaMsg = {};
                            if (/image/.test(quotedType)) mediaMsg = { image: mediaBuffer, caption: captionTeks, mentions: allMentions };
                            else if (/video/.test(quotedType)) mediaMsg = { video: mediaBuffer, caption: captionTeks, mentions: allMentions };
                            else if (/audio|ptt|voice/.test(quotedType)) {
                                await nimesha.sendMessage(m.chat, { audio: mediaBuffer, mimetype: mediaMime, ptt: /ptt|voice/.test(quotedType) }, { quoted: m });
                                mediaMsg = { text: captionTeks, mentions: allMentions };
                            } else if (/document/.test(quotedType)) {
                                await nimesha.sendMessage(m.chat, { document: mediaBuffer, mimetype: mediaMime, fileName: m.quoted.msg?.fileName || 'file' }, { quoted: m });
                                mediaMsg = { text: captionTeks, mentions: allMentions };
                            } else if (/sticker/.test(quotedType)) {
                                await nimesha.sendMessage(m.chat, { sticker: mediaBuffer }, { quoted: m });
                                if (captionTeks) await nimesha.sendMessage(m.chat, { text: captionTeks, mentions: allMentions }, { quoted: m });
                                mediaMsg = null;
                            }
                            if (mediaMsg) await nimesha.sendMessage(m.chat, mediaMsg, { quoted: m });
                        } catch(e) {
                            await nimesha.sendMessage(m.chat, { forward: m.quoted.fakeObj(), mentions: allMentions }, {});
                        }
                    } else {
                        await nimesha.sendMessage(m.chat, { forward: m.quoted.fakeObj(), mentions: allMentions }, {});
                    }
                    for (let i = 50; i < members.length; i += chunkSize) {
                        let chunk = members.slice(i, i + chunkSize);
                        let teks = '';
                        for (let mem of chunk) teks += `${setv} @${mem.id.split('@')[0]}\n`;
                        await nimesha.sendMessage(m.chat, { text: teks, mentions: chunk.map(a => a.id) }, { quoted: m });
                        await new Promise(res => setTimeout(res, 1000));
                    }
                } else {
                    for (let i = 0; i < members.length; i += chunkSize) {
                        let chunk = members.slice(i, i + chunkSize);
                        let teks = i === 0 ? `*Tagging everyone*\n\n*Message:* ${q ? q : ''}\n\n` : '';
                        for (let mem of chunk) teks += `${setv} @${mem.id.split('@')[0]}\n`;
                        await nimesha.sendMessage(m.chat, { text: teks, mentions: chunk.map(a => a.id) }, { quoted: m });
                        await new Promise(res => setTimeout(res, 1000));
                    }
                }
            }
            break
            case 'hidetag': case 'h': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                try {
                    const members = m.metadata?.participants?.map(a => a.id) || [];
                    await m.reply(q ? q : '', { mentions: members });
                } catch(e) {
                    console.error('[hidetag error]', e?.message);
                    m.reply('❌ hidetag error: ' + e?.message);
                }
            }
            break
            case 'totag': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                if (!m.quoted) return m.reply(`📌 Reply to a message (caption: *${prefix + command}*)`);
                delete m.quoted.chat;
                await nimesha.sendMessage(m.chat, { forward: m.quoted.fakeObj(), mentions: m.metadata.participants.map(a => a.id) });
            }
            break
            case 'listonline': case 'liston': {
                if (!m.isGroup) return m.reply(mess.group);
                let id = args && /\d+\-\d+@g.us/.test(args[0]) ? args[0] : m.chat;
                if (!store.presences || !store.presences[id]) return m.reply('No one is online right now!');
                let online = [...Object.keys(store.presences[id]), botNumber];
                await m.reply('Online list:\n\n' + online.map(v => setv + ' @' + v.replace(/@.+/, '')).join`\n`, { mentions: online }).catch((e) => m.reply('No one online at the moment..'));
            }
            break
            
            // ===== BOT COMMANDS =====
            case 'owner': case 'listowner': {
                await nimesha.sendContact(m.chat, ownerNumber, m);
            }
            break
            case 'profile': case 'cek': {
                const user = Object.keys(db.users);
                const infoUser = db.users[m.sender];
                const _msg_profile = await m.reply('⏳ *Loading...*');
                await nimesha.sendMessage(m.chat, { text: `*👤 Profile @${m.sender.split('@')[0]}* :\n🐋 Bot User: ${user.includes(m.sender) ? 'True' : 'False'}\n🔥 User: ${isVip ? 'VIP' : isPremium ? 'PREMIUM' : 'FREE'}${isPremium ? `\n⏳ Expired : ${checkStatus(m.sender, premium) ? formatDate(getExpired(m.sender, db.premium)) : '-'}` : ''}\n🎫 Limit: ${infoUser.limit}\n💰 Money: ${infoUser ? infoUser.money.toLocaleString('en-US') : '0'}`, edit: _msg_profile.key });
            }
            break
            case 'leaderboard': {
                const entries = Object.entries(db.users).sort((a, b) => b[1].money - a[1].money).slice(0, 10).map(entry => entry[0]);
                let teksnya = '╭──❍「 *LEADERBOARD* 」❍\n';
                for (let i = 0; i < entries.length; i++) {
                    teksnya += `│• ${i + 1}. @${entries[i].split('@')[0]}\n│• Balance: ${db.users[entries[i]].money.toLocaleString('en-US')}\n│\n`;
                }
                const _msg_leaderboard = await m.reply('⏳ 🏆 *Getting leaderboard...*');
                await nimesha.sendMessage(m.chat, { text: teksnya + '╰──────❍', edit: _msg_leaderboard.key });
            }
            break
            case 'totalpesan': {
                let messageCount = {};
                let messages = store?.messages[m.chat]?.array || [];
                let participants = m?.metadata?.participants?.map(p => p.id) || store?.messages[m.chat]?.array?.map(p => p.key.participant) || [];
                messages.forEach(mes => {
                    if (mes.key?.participant && mes.message) {
                        messageCount[mes.key.participant] = (messageCount[mes.key.participant] || 0) + 1;
                    }
                });
                let totalMessages = Object.values(messageCount).reduce((a, b) => a + b, 0);
                let date = new Date().toLocaleDateString('en-US');
                let zeroMessageUsers = participants.filter(user => !messageCount[user]).map(user => `- @${user.replace(/[^0-9]/g, '')}`);
                let messageList = Object.entries(messageCount).map(([sender, count], index) => `${index + 1}. @${sender.replace(/[^0-9]/g, '')}: ${count} messages`);
                let result = `Total messages ${totalMessages} from ${participants.length} members\nOn ${date}:\n${messageList.join('\n')}\n\nNote: ${text.length > 0 ? `\n${zeroMessageUsers.length > 0 ? `Members who didn't send messages (Siders):\n${zeroMessageUsers.join('\n')}` : 'All members have sent messages!'}` : `Check siders? ${prefix + command} --sider`}`;
                const _msg_totalpesan = await m.reply('⏳ 📊 *Counting...*');
                await nimesha.sendMessage(m.chat, { text: result, edit: _msg_totalpesan.key });
            }
            break

            // ===== AI COMMANDS =====
            case 'gpt': case 'chatgpt': case 'openai': {
                if (!text) return m.reply(`Example: ${prefix + command} <question>`);
                await m.reply('🧠 *Groq AI thinking...*');
                try {
                    const res = await AI.askModel(text, 'gpt', m.sender);
                    await m.reply(`🤖 *GPT (Groq)*\n\n${res.text}`);
                } catch (e) {
                    await m.reply(`❌ AI error: ${e.message}`);
                }
            }
            break
            case 'poe': {
                if (!text) return m.reply(`Example: ${prefix + command} <question>`);
                await m.reply('⚡ *Using Groq AI...*');
                try {
                    const res = await AI.ultimateAI(text, m.sender);
                    await m.reply(`🧠 *AI Response*\n\n${res.text}`);
                } catch (e) {
                    await m.reply(`❌ AI error: ${e.message}`);
                }
            }
            break
            case 'gemini': {
                if (!text) return m.reply(`Example: ${prefix + command} <question>`);
                await m.reply('♊ *Gemini (via Groq)* thinking...');
                try {
                    const res = await AI.askModel(text, 'gemini', m.sender);
                    await m.reply(`♊ *Gemini*\n\n${res.text}`);
                } catch (e) {
                    await m.reply(`❌ AI error: ${e.message}`);
                }
            }
            break
            case 'llama': case 'llama3': {
                if (!text) return m.reply(`Example: ${prefix + command} <question>`);
                await m.reply('🦙 *Llama 3 thinking...*');
                try {
                    const res = await AI.askModel(text, 'llama', m.sender);
                    await m.reply(`🦙 *Llama 3*\n\n${res.text}`);
                } catch (e) {
                    await m.reply(`❌ AI error: ${e.message}`);
                }
            }
            break
            case 'deepseek': {
                if (!text) return m.reply(`Example: ${prefix + command} <question>`);
                await m.reply('🐋 *DeepSeek (via Groq)* thinking...');
                try {
                    const res = await AI.askModel(text, 'deepseek', m.sender);
                    await m.reply(`🐋 *DeepSeek*\n\n${res.text}`);
                } catch (e) {
                    await m.reply(`❌ AI error: ${e.message}`);
                }
            }
            break
            case 'ai': case 'ask': case 'brain': {
                if (!text) return m.reply(`Example: ${prefix + command} <question>`);
                await m.reply('🌐 *Ultimate AI thinking...*');
                try {
                    const res = await AI.ultimateAI(text, m.sender);
                    await m.reply(`🎯 *${res.provider}*\n\n${res.text}`);
                } catch (e) {
                    await m.reply(`❌ AI error: ${e.message}`);
                }
            }
            break
            case 'imagine': case 'aiimage': case 'draw': case 'create': {
                if (!text) return m.reply(`Example: ${prefix + command} <prompt>`);
                await m.reply('🎨 *Generating image...*');
                const url = await AI.imagine(text);
                await nimesha.sendMessage(m.chat, { image: { url }, caption: `🎨 *${text}*` }, { quoted: m });
            }
            break
            case 'poeimage': {
                if (!text) return m.reply(`Example: ${prefix + command} <prompt>`);
                await m.reply('🖼️ *Generating image...*');
                const url = await AI.imagine(text);
                await nimesha.sendMessage(m.chat, { image: { url }, caption: `🖼️ ${text}` }, { quoted: m });
            }
            break
            case 'translate': case 'tr': {
                if (args.length < 2) return m.reply(`Example: ${prefix + command} <lang> <text>`);
                const lang = args[0];
                const txt = args.slice(1).join(' ');
                const res = await AI.translate(txt, lang);
                await m.reply(`🌐 *Translated (${lang}):*\n${res}`);
            }
            break
            case 'tts': {
                if (!text) return m.reply(`Example: ${prefix + command} <text>`);
                const lang = 'en';
                const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
                try {
                    const fetch = require('node-fetch');
                    const audioBuffer = await fetch(url).then(r => r.buffer());
                    await nimesha.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
                } catch {
                    try {
                        const gTTS = require('gtts');
                        const tts = new gTTS(text, 'en');
                        const file = path.join(__dirname, 'database', 'temp', `${Date.now()}.mp3`);
                        tts.save(file, async () => {
                            await nimesha.sendMessage(m.chat, { audio: fs.readFileSync(file), mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
                            fs.unlinkSync(file);
                        });
                    } catch (e) {
                        m.reply('❌ TTS failed: ' + e.message);
                    }
                }
            }
            break
            case 'summarize': {
                if (!m.quoted) return m.reply('Reply to a long message to summarize');
                const toSummarize = m.quoted.body || m.quoted.text || '';
                if (!toSummarize) return m.reply('No text to summarize');
                await m.reply('📋 *Summarizing...*');
                const summary = await AI.summarize(toSummarize);
                await m.reply(`📋 *Summary:*\n\n${summary}`);
            }
            break
            case 'code': case 'coding': case 'program': {
                if (!text) return m.reply(`Example: ${prefix + command} <description>`);
                const lang = args[0].startsWith('--') ? args.shift().slice(2) : 'javascript';
                const res = await AI.codeAI(text, lang);
                await m.reply(`💻 *${lang.toUpperCase()} Code:*\n\n\`\`\`${lang}\n${res.text}\n\`\`\``);
            }
            break
            case 'brainrot': {
                if (!text) return m.reply(`Example: ${prefix + command} <text>`);
                const res = await AI.brainrot(text);
                await m.reply(`🧠 *Brainrot Mode:*\n${res.text}`);
            }
            break
            case 'roastai': {
                if (!text) return m.reply(`Example: ${prefix + command} <name/thing>`);
                const res = await AI.roast(text);
                await m.reply(`🔥 *AI Roast:*\n${res.text}`);
            }
            break
            case 'rizz': {
                if (!text) return m.reply(`Example: ${prefix + command} <situation>`);
                const res = await AI.rizz(text);
                await m.reply(`💘 *Rizz:*\n${res.text}`);
            }
            break
            case 'clearmemory': {
                AI.clearMemory(m.sender);
                await m.reply('🧹 AI memory cleared');
            }
            break
            case 'poebalance': case 'aibalance': {
                try {
                    const bal = await AI.getBalance();
                    await m.reply(`💰 *AI Service Status*\n\nBalance: ${bal.current_point_balance}\nRate Limit: ${bal.rate_limit}\nModels: ${bal.models_available.join(', ')}`);
                } catch (e) {
                    await m.reply('❌ Failed to fetch status');
                }
            }
            break

            // ===== MOVIE COMMANDS =====
            case 'movie': case 'film': case 'cinema': {
                if (!text) return m.reply(`Example: ${prefix + command} <title>`);
                await m.reply('🎬 *Searching IMDB...*');
                try {
                    const movies = await Movie.search(text);
                    if (!movies?.length) return m.reply('No results');
                    const list = movies.slice(0,5).map((m,i)=>`${i+1}. *${m.Title}* (${m.Year})`).join('\n');
                    await m.reply(`🎬 *Results:*\n${list}\n\nUse .imdb <id> for details`);
                } catch(e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'imdb': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <imdb-id>`);
                try {
                    const data = await Movie.getById(args[0]);
                    await nimesha.sendMessage(m.chat, { image: { url: data.Poster !== 'N/A' ? data.Poster : undefined }, caption: Movie.formatMovie(data) }, { quoted: m });
                } catch(e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'rating': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <imdb-id>`);
                const r = await Movie.getRatings(args[0]);
                await m.reply(`⭐ *Ratings*\nIMDB: ${r.imdb}/10\n🍅 Rotten: ${r.rotten}\nⓂ️ Metacritic: ${r.metacritic}/100`);
            }
            break
            case 'series': {
                if (!text) return m.reply(`Example: ${prefix + command} <name>`);
                const data = await Movie.getByTitle(text, '', 'full');
                if (data.Type !== 'series') return m.reply('Not a series');
                await m.reply(`📺 *${data.Title}*\n📅 Seasons: ${data.totalSeasons}\n⭐ ${data.imdbRating}/10\n📖 ${data.Plot}`);
            }
            break

            // ===== DOWNLOADERS =====
            case 'song': case 'mp3': case 'ytmp3': case 'play': {
                if (!text) return m.reply(`Example: ${prefix + command} <query/url>`);
                await m.reply('🎵 *Downloading audio...*');
                try {
                    let url = text;
                    if (!url.includes('youtube') && !url.includes('youtu.be')) {
                        const sr = await yts(text);
                        if (sr.videos?.length) url = sr.videos[0].url;
                        else throw new Error('No results');
                    }
                    const audio = await ytMp3(url);
                    await nimesha.sendMessage(m.chat, { 
                        audio: { url: audio.url }, mimetype: 'audio/mpeg', 
                        fileName: `${audio.title}.mp3`, ptt: false 
                    }, { quoted: m });
                } catch(e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'video': case 'mp4': case 'ytmp4': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <url>`);
                await m.reply('📥 *Downloading video...*');
                try {
                    const v = await ytMp4(args[0]);
                    await nimesha.sendMessage(m.chat, { video: { url: v.url }, caption: v.title }, { quoted: m });
                } catch(e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'tiktok': case 'tt': case 'tik': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <url>`);
                await m.reply('🎬 *Fetching TikTok...*');
                try {
                    const tt = await tiktokDownload(args[0]);
                    if (tt.type === 'video') await nimesha.sendMessage(m.chat, { video: { url: tt.url }, caption: tt.title || 'TikTok' }, { quoted: m });
                    else if (tt.items) for (const img of tt.items.slice(0,10)) await nimesha.sendMessage(m.chat, { image: { url: img } }, { quoted: m });
                } catch(e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'instagram': case 'ig': case 'insta': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <url>`);
                await m.reply('📸 *Downloading...*');
                try {
                    const ig = await igDownload(args[0]);
                    if (ig.type === 'image') await nimesha.sendMessage(m.chat, { image: { url: ig.url } }, { quoted: m });
                    else if (ig.type === 'video') await nimesha.sendMessage(m.chat, { video: { url: ig.url } }, { quoted: m });
                    else if (ig.items) for (const item of ig.items.slice(0,10)) {
                        await nimesha.sendMessage(m.chat, item.is_video ? { video: { url: item.url } } : { image: { url: item.url } }, { quoted: m });
                    }
                } catch(e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'facebook': case 'fb': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <url>`);
                await m.reply('📱 *Downloading FB...*');
                try {
                    const fb = await fbDownload(args[0]);
                    await nimesha.sendMessage(m.chat, { video: { url: fb.hd || fb.sd }, caption: 'Facebook Video' }, { quoted: m });
                } catch(e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'twitter': case 'x': case 'twit': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <url>`);
                await m.reply('🐦 *Downloading X...*');
                try {
                    const tw = await (require('./lib/scraper').twitterDownload(args[0]));
                    await nimesha.sendMessage(m.chat, { video: { url: tw.url } }, { quoted: m });
                } catch(e) { m.reply(`❌ ${e.message}`); }
            }
            break
            case 'spotify': case 'sp': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <track url>`);
                await m.reply('🎧 *Downloading...*');
                try {
                    const sp = await spotifyDownload(args[0]);
                    await nimesha.sendMessage(m.chat, { audio: { url: sp.url }, mimetype: 'audio/mpeg', fileName: `${sp.title}.mp3` }, { quoted: m });
                } catch(e) { m.reply(`❌ ${e.message}`); }
            }
            break

            // ===== SEARCH COMMANDS =====
            case 'google': case 'g': case 'search': {
                if (!text) return m.reply(`Example: ${prefix + command} <query>`);
                const res = await Search.googleSearch(text);
                await m.reply(`🔍 *Google Results*\n\n${res || 'No results'}`);
            }
            break
            case 'wiki': case 'wikipedia': {
                if (!text) return m.reply(`Example: ${prefix + command} <query>`);
                const res = await Search.wikiSearch(text);
                await m.reply(`📚 ${res}`);
            }
            break
            case 'github': {
                if (!text) return m.reply(`Example: ${prefix + command} <repo>`);
                const res = await Search.githubSearch(text);
                await m.reply(`💻 *GitHub*\n\n${res}`);
            }
            break
            case 'npm': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <package>`);
                const res = await Search.npmSearch(args[0]);
                await m.reply(`📦 *NPM*\n\n${res}`);
            }
            break
            case 'urban': {
                if (!text) return m.reply(`Example: ${prefix + command} <word>`);
                const res = await Search.urbanDictionary(text);
                await m.reply(`📖 *Urban Dictionary*\n\n${res}`);
            }
            break
            case 'anime': {
                if (!text) return m.reply(`Example: ${prefix + command} <title>`);
                const res = await Search.animeSearch(text);
                await m.reply(`📺 *Anime*\n\n${res}`);
            }
            break
            case 'manga': {
                if (!text) return m.reply(`Example: ${prefix + command} <title>`);
                const res = await Search.mangaSearch(text);
                await m.reply(`📖 *Manga*\n\n${res}`);
            }
            break
            case 'weather': case 'cuaca': {
                if (!text) return m.reply(`Example: ${prefix + command} <city>`);
                const res = await Tools.weather(text);
                await m.reply(res);
            }
            break
            case 'news': {
                const res = await Tools.news();
                await m.reply(`📰 *News*\n\n${res}`);
            }
            break
            case 'covid': {
                if (!text) return m.reply(`Example: ${prefix + command} <country>`);
                const res = await Tools.covid(text);
                await m.reply(res);
            }
            break
            case 'crypto': case 'bitcoin': case 'eth': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <bitcoin>`);
                const res = await Tools.cryptoPrice(args[0].toLowerCase());
                await m.reply(res);
            }
            break
            case 'forex': {
                if (args.length < 2) return m.reply(`Example: ${prefix + command} USD EUR`);
                const res = await Tools.forex(args[0], args[1]);
                await m.reply(res);
            }
            break
            case 'iplookup': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <ip>`);
                const res = await Tools.ipLookup(args[0]);
                await m.reply(res);
            }
            break
            case 'whois': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <domain>`);
                const res = await Tools.whois(args[0]);
                await m.reply(res);
            }
            break
            case 'dns': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <domain>`);
                const res = await Tools.dnsLookup(args[0]);
                await m.reply(`📡 *DNS*\n\`\`\`${res}\`\`\``);
            }
            break
            case 'qr': {
                if (!text) return m.reply(`Example: ${prefix + command} <text>`);
                const buf = await Tools.qr(text);
                await nimesha.sendMessage(m.chat, { image: buf, caption: 'QR Code' }, { quoted: m });
            }
            break
            case 'shorten': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <url>`);
                const res = await Tools.shorten(args[0]);
                await m.reply(`🔗 *Short URL:*\n${res}`);
            }
            break

            // ===== FUN COMMANDS =====
            case 'joke': {
                const res = await Fun.joke();
                await m.reply(res);
            }
            break
            case 'meme': {
                const res = await Fun.meme();
                await nimesha.sendMessage(m.chat, { image: { url: res.image }, caption: `${res.caption}\n📁 r/${res.subreddit}` }, { quoted: m });
            }
            break
            case 'quote': {
                const res = await Fun.quote();
                await m.reply(res);
            }
            break
            case 'fact': {
                const res = await Fun.fact();
                await m.reply(res);
            }
            break
            case 'ship': {
                if (args.length < 2) return m.reply(`Example: ${prefix + command} @user1 @user2`);
                const res = await Fun.ship(args[0], args[1]);
                await m.reply(res);
            }
            break
            case 'wyr': case 'wouldyourather': {
                const res = await Fun.wouldYouRather();
                await m.reply(res);
            }
            break
            case '8ball': case '8b': {
                if (!text) return m.reply('Ask a question');
                const res = await Fun.eightBall(text);
                await m.reply(res);
            }
            break
            case 'roll': {
                const res = await Fun.rollDice(parseInt(args[0]) || 6);
                await m.reply(res);
            }
            break
            case 'flip': case 'coin': {
                await m.reply(await Fun.flipCoin());
            }
            break
            case 'roast': {
                if (args[0]) {
                    const res = await AI.roast(args.join(' '));
                    await m.reply(`🔥 ${res.text}`);
                } else {
                    await m.reply(await Fun.roast());
                }
            }
            break
            case 'compliment': {
                if (m.quoted) await m.reply(`🌟 @${m.quoted.sender.split('@')[0]}, ${(await Fun.compliment()).replace('🌟 ', '')}`, { mentions: [m.quoted.sender] });
                else await m.reply(await Fun.compliment());
            }
            break
            case 'truth': {
                await m.reply(await Fun.truth());
            }
            break
            case 'dare': {
                await m.reply(await Fun.dare());
            }
            break

            // ===== ECONOMY COMMANDS =====
            case 'daily': case 'claim': {
                const res = Economy.daily(m.sender);
                if (res.success) await m.reply(`✅ Claimed ${res.amount} coins & ${res.gems} gems!\n🔥 Streak: ${res.streak}`);
                else await m.reply(`⏳ Come back in ${res.wait} hours`);
            }
            break
            case 'work': {
                const res = Economy.work(m.sender);
                if (res.success) await m.reply(`💼 You worked as ${global.db.users[m.sender].job} and earned ${res.amount} coins`);
                else await m.reply(`⏳ Wait ${res.wait} minutes`);
            }
            break
            case 'rob': {
                const target = m.mentionedJid?.[0];
                if (!target) return m.reply('Tag someone to rob');
                const res = Economy.rob(m.sender, target);
                if (res.success) await m.reply(`💰 Robbed ${res.amount} coins!`);
                else if (res.reason) await m.reply(res.reason);
                else await m.reply(`🚔 Caught! Lost ${res.penalty} coins`);
            }
            break
            case 'balance': case 'bal': case 'money': {
                const u = Economy.ensureUser(m.sender);
                await m.reply(`💰 *Balance*\n👛 Wallet: ${u.coins}\n🏦 Bank: ${u.bank}\n💎 Gems: ${u.gems}\n📊 Level: ${u.level}\n⭐ XP: ${u.xp}`);
            }
            break
            case 'deposit': case 'dep': {
                if (!args[0] || isNaN(args[0])) return m.reply(`Example: ${prefix + command} <amount>`);
                if (Economy.deposit(m.sender, parseInt(args[0]))) await m.reply('✅ Deposited');
                else await m.reply('❌ Insufficient funds');
            }
            break
            case 'withdraw': case 'with': {
                if (!args[0] || isNaN(args[0])) return m.reply(`Example: ${prefix + command} <amount>`);
                if (Economy.withdraw(m.sender, parseInt(args[0]))) await m.reply('✅ Withdrawn');
                else await m.reply('❌ Insufficient funds');
            }
            break
            case 'transfer': case 'pay': {
                if (m.mentionedJid.length < 1 || !args[1] || isNaN(args[1])) return m.reply(`Example: ${prefix + command} @user <amount>`);
                if (Economy.transfer(m.sender, m.mentionedJid[0], parseInt(args[1]))) await m.reply('💸 Transfer complete');
                else await m.reply('❌ Insufficient funds');
            }
            break
            case 'lb': case 'leaderboard': case 'top': {
                const lb = Economy.leaderboard();
                let txt = '🏆 *Global Leaderboard*\n\n';
                lb.forEach((u,i) => { txt += `${i+1}. @${u.id.split('@')[0]} — Lv.${u.level} | ${u.coins}🪙\n`; });
                await nimesha.sendMessage(m.chat, { text: txt, mentions: lb.map(u => u.id) }, { quoted: m });
            }
            break
            case 'buy': {
                const shop = { 'phone': 1000, 'laptop': 5000, 'car': 50000, 'house': 200000, 'jet': 1000000 };
                if (!shop[args[0]]) return m.reply(`Shop: ${Object.entries(shop).map(([k,v]) => `${k}: ${v}🪙`).join(', ')}`);
                if (Economy.buyItem(m.sender, args[0], shop[args[0]])) await m.reply(`🛒 Bought ${args[0]}`);
                else await m.reply('❌ Broke');
            }
            break
            case 'inventory': case 'inv': {
                const u = Economy.ensureUser(m.sender);
                if (!u.inventory.length) return m.reply('Empty backpack');
                await m.reply(`🎒 *Inventory*\n${u.inventory.map(i => `• ${i.item}`).join('\n')}`);
            }
            break

            // ===== GAMES COMMANDS =====
            case 'ttt': case 'tictactoe': {
                // handled earlier in main logic
            }
            break
            case 'blackjack': case 'bj': {
                // handled earlier
            }
            break
            case 'slot': case 'slots': {
                const res = Games.slotMachine();
                const u = Economy.ensureUser(m.sender);
                if (res.win) { u.coins += res.amount; await m.reply(`🎰 ${res.reels.join(' | ')}\n\n🎉 You won ${res.amount} coins!`); }
                else { u.coins = Math.max(0, u.coins - 10); await m.reply(`🎰 ${res.reels.join(' | ')}\n\n😞 Lost 10 coins`); }
            }
            break

            // ===== DAILY COMMANDS =====
            case 'remindme': {
                if (args.length < 2) return m.reply(`Example: ${prefix + command} <minutes> <text>`);
                const mins = parseInt(args[0]);
                const msg = args.slice(1).join(' ');
                if (isNaN(mins)) return m.reply('Invalid minutes');
                const time = Daily.remind(m.sender, msg, mins);
                await m.reply(`⏰ Reminder set for ${time}\n📝 ${msg}`);
            }
            break
            case 'reminders': {
                const list = Daily.listReminders(m.sender);
                if (!list.length) return m.reply('No active reminders');
                await m.reply(`⏰ *Your Reminders*\n${list.map((r,i) => `${i+1}. ${r.text} — ${new Date(r.due).toLocaleTimeString()}`).join('\n')}`);
            }
            break
            case 'clearme': case 'clearreminders': {
                Daily.clearReminders(m.sender);
                await m.reply('🧹 All reminders cleared');
            }
            break
            case 'note': case 'notes': case 'addnote': {
                const [title, ...body] = text.split('|');
                if (!title || !body.length) return m.reply(`Example: ${prefix + command} Title | Content`);
                const n = Daily.addNote(m.sender, title.trim(), body.join('|').trim());
                await m.reply(`📝 Note #${n} saved: *${title.trim()}*`);
            }
            break
            case 'mynotes': {
                const notes = Daily.getNotes(m.sender);
                if (!notes.length) return m.reply('No notes');
                await m.reply(`📚 *Your Notes*\n${notes.map((n,i) => `${i+1}. *${n.title}* — ${new Date(n.date).toLocaleDateString()}`).join('\n')}`);
            }
            break
            case 'delnote': {
                const idx = parseInt(args[0]) - 1;
                Daily.delNote(m.sender, idx);
                await m.reply('🗑️ Note deleted');
            }
            break
            case 'todo': case 'addtodo': {
                if (!text) return m.reply(`Example: ${prefix + command} <task> | priority (high/medium/low)`);
                const [task, priority] = text.split('|').map(s => s.trim());
                const count = Daily.addTodo(m.sender, task, priority || 'medium');
                await m.reply(`✅ Task added! (${count} pending)`);
            }
            break
            case 'todos': {
                const t = Daily.getTodos(m.sender);
                if (!t.length) return m.reply('No tasks');
                const pending = t.filter(x => !x.done);
                const done = t.filter(x => x.done);
                await m.reply(`📋 *Todo List*\n\n*Pending:*\n${pending.map((x,i) => `${i+1}. [${x.priority.toUpperCase()}] ${x.task}`).join('\n') || 'None'}\n\n*Done:* ${done.length}`);
            }
            break
            case 'done': case 'check': {
                const idx = parseInt(args[0]) - 1;
                Daily.doneTodo(m.sender, idx);
                await m.reply('🎉 Task completed!');
            }
            break
            case 'cleartodo': {
                Daily.clearDone(m.sender);
                await m.reply('🧹 Completed tasks cleared');
            }
            break
            case 'habit': case 'checkin': {
                if (!text) return m.reply(`Example: ${prefix + command} <name>`);
                const res = Daily.checkHabit(m.sender, text);
                if (res.done) return m.reply(`✅ Already checked in today!\n🔥 Streak: ${res.streak} days`);
                await m.reply(`🔥 *${text}* checked!\nStreak: ${res.streak} days (Best: ${res.best})`);
            }
            break
            case 'habits': {
                const h = Daily.getHabits(m.sender);
                const entries = Object.entries(h);
                if (!entries.length) return m.reply('No habits tracked');
                await m.reply(`📊 *Your Habits*\n${entries.map(([k,v]) => `• ${k}: ${v.streak}🔥 (Best: ${v.best})`).join('\n')}`);
            }
            break
            case 'mood': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <1-10> [note]`);
                const score = parseInt(args[0]);
                const note = args.slice(1).join(' ') || '';
                const res = Daily.logMood(m.sender, score, note);
                await m.reply(`📊 Mood logged: ${score}/10\n📈 7-day avg: ${res.avg}\n💡 ${res.advice}`);
            }
            break
            case 'moodgraph': {
                const h = Daily.moodHistory(m.sender);
                if (!h.length) return m.reply('No mood data');
                const bars = h.slice(-10).map(e => {
                    const bar = '█'.repeat(e.score) + '░'.repeat(10-e.score);
                    return `${new Date(e.date).getDate()} ${bar} ${e.score}`;
                }).join('\n');
                await m.reply(`📈 *Mood History*\n\`\`\`\n${bars}\n\`\`\``);
            }
            break
            case 'water': case 'drink': {
                const ml = parseInt(args[0]) || 250;
                const res = Daily.drink(m.sender, ml);
                await m.reply(`💧 +${ml}ml\n${res.total}/${res.goal}ml (${res.pct}%)\n${res.msg}`);
            }
            break
            case 'expense': case 'spend': {
                if (args.length < 2) return m.reply(`Example: ${prefix + command} <amount> <category> [note]`);
                const res = Daily.spend(m.sender, args[0], args[1], args.slice(2).join(' '));
                await m.reply(`💸 Spent $${args[0]} on ${args[1]}\n📊 Today: $${res.today} | Month: $${res.total}`);
            }
            break
            case 'myexpenses': case 'budget': {
                const ins = Daily.expenseInsight(m.sender);
                if (!ins) return m.reply('No expenses tracked');
                await m.reply(`📊 *30-Day Insight*\nTotal: $${ins.total}\nDaily Avg: $${ins.dailyAvg}\n🏆 Top: ${ins.top[0]} ($${ins.top[1].toFixed(2)})\n\n${ins.breakdown}`);
            }
            break
            case 'grocery': case 'groceries': {
                if (!text) {
                    const list = Daily.getGrocery(m.sender);
                    return m.reply(`🛒 *Grocery List*\n${list.map((x,i) => `${i+1}. ${x}`).join('\n') || 'Empty'}`);
                }
                Daily.addGrocery(m.sender, text);
                await m.reply('🛒 Added to list');
            }
            break
            case 'cleargrocery': {
                Daily.clearGrocery(m.sender);
                await m.reply('🛒 List cleared');
            }
            break
            case 'timer': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <minutes> [label]`);
                const mins = parseInt(args[0]);
                const label = args.slice(1).join(' ') || 'Timer';
                setTimeout(() => m.reply(`⏰ *Time's up!*\n${label}`), mins * 60000);
                await m.reply(`⏱️ ${label} set for ${mins} minutes`);
            }
            break
            case 'alarm': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <HH:MM> [message]`);
                const [h, min] = args[0].split(':').map(Number);
                const now = new Date();
                const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, min);
                if (target < now) target.setDate(target.getDate() + 1);
                const diff = target - now;
                const msg = args.slice(1).join(' ') || 'Alarm ringing!';
                setTimeout(() => m.reply(`⏰ *ALARM!*\n📝 ${msg}`), diff);
                await m.reply(`⏰ Alarm set for ${args[0]}`);
            }
            break

            // ===== HEALTH COMMANDS =====
            case 'bmi': {
                if (args.length < 2) return m.reply(`Example: ${prefix + command} <kg> <cm>`);
                const res = Health.bmi(parseFloat(args[0]), parseFloat(args[1]));
                await m.reply(`⚖️ *BMI Result*\nValue: ${res.val}\nCategory: ${res.cat}\nIdeal weight: ${res.ideal[0]}-${res.ideal[1]}kg`);
            }
            break
            case 'bmr': {
                if (args.length < 4) return m.reply(`Example: ${prefix + command} <kg> <cm> <age> <male/female>`);
                const val = Health.bmr(parseFloat(args[0]), parseFloat(args[1]), parseInt(args[2]), args[3]);
                await m.reply(`🔥 *BMR:* ${val} calories/day`);
            }
            break
            case 'tdee': {
                if (args.length < 2) return m.reply(`Example: ${prefix + command} <bmr> <sedentary/light/moderate/active/athlete>`);
                const val = Health.tdee(parseInt(args[0]), args[1]);
                await m.reply(`⚡ *TDEE:* ${val} calories/day`);
            }
            break
            case 'macros': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <calories> [lose/maintain/gain]`);
                const res = Health.macros(parseInt(args[0]), args[1]);
                await m.reply(`🥗 *Macros for ${args[0]} cal*\n🥩 Protein: ${res.protein}g\n🥑 Fat: ${res.fat}g\n🍚 Carbs: ${res.carbs}g`);
            }
            break
            case 'watercalc': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <kg>`);
                await m.reply(`💧 Drink ~${Health.water(parseFloat(args[0]))}ml daily`);
            }
            break
            case 'sleep': {
                const cycles = Health.sleepWakeUp();
                await m.reply(`😴 *If you sleep now, wake up at:*\n${cycles.map((t,i) => `${i+1} cycle${i+1>1?'s':''}: ${t}`).join('\n')}\n\n💡 90min = 1 sleep cycle`);
            }
            break
            case 'heartrate': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <age>`);
                const z = Health.hrZones(parseInt(args[0]));
                await m.reply(`❤️ *HR Zones (Max: ${z.max})*\n🔥 Fat Burn: ${z.fatburn}\n🏃 Cardio: ${z.cardio}\n⚡ Peak: ${z.peak}`);
            }
            break
            case 'onerm': {
                if (args.length < 2) return m.reply(`Example: ${prefix + command} <weight> <reps>`);
                const rm = Health.oneRm(parseFloat(args[0]), parseInt(args[1]));
                await m.reply(`🏋️ Estimated 1RM: ${rm}kg`);
            }
            break
            case 'bodyfat': {
                if (args.length < 4) return m.reply(`Example: ${prefix + command} <male/female> <waist(cm)> <neck(cm)> <height(cm)> [hip(cm)]`);
                const res = Health.bodyFat(args[0], parseFloat(args[1]), parseFloat(args[2]), parseFloat(args[3]), parseFloat(args[4]||0));
                await m.reply(`📊 Estimated body fat: ${res}%`);
            }
            break
            case 'workout': case 'gym': {
                const type = args[0] || 'fullbody';
                const plan = Health.workout(type);
                await m.reply(`💪 *${type.toUpperCase()} Workout*\n${plan.map((x,i) => `${i+1}. ${x}`).join('\n')}`);
            }
            break
            case 'yoga': {
                const p = Health.yoga(args[0]);
                await m.reply(`🧘 *${p.name}*\n⏱️ Hold: ${p.time}\n✨ Benefit: ${p.benefit}`);
            }
            break

            // ===== FINANCE COMMANDS =====
            case 'stock': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <AAPL>`);
                try {
                    const s = await Finance.stock(args[0]);
                    await m.reply(`📈 *${args[0].toUpperCase()}*\nPrice: $${s.price}\nChange: ${s.change}%\nPrev: $${s.prev}`);
                } catch(e) { m.reply('❌ Market data limit'); }
            }
            break
            case 'portfolio': {
                const p = Finance.getPortfolio(m.sender);
                if (!p.length) return m.reply('No portfolio. Use .addstock/.addcrypto');
                let txt = `📊 *Your Portfolio*\n`;
                p.forEach((x,i) => { txt += `${i+1}. ${x.type} ${x.sym} x${x.qty} @ $${x.buy}\n`; });
                await m.reply(txt);
            }
            break
            case 'addstock': {
                if (args.length < 3) return m.reply(`Example: ${prefix + command} <SYM> <qty> <buyPrice>`);
                Finance.addPortfolio(m.sender, 'stock', args[0], args[1], args[2]);
                await m.reply('✅ Added to portfolio');
            }
            break
            case 'addcrypto': {
                if (args.length < 3) return m.reply(`Example: ${prefix + command} <BTC> <qty> <buyPrice>`);
                Finance.addPortfolio(m.sender, 'crypto', args[0], args[1], args[2]);
                await m.reply('✅ Added to portfolio');
            }
            break
            case 'tip': {
                if (args.length < 2) return m.reply(`Example: ${prefix + command} <amount> <percent> [people]`);
                const res = Finance.tip(parseFloat(args[0]), parseInt(args[1]), parseInt(args[2]||1));
                await m.reply(`💰 *Tip Calculator*\nSubtotal: $${res.subtotal}\nTip (${args[1]}%): $${res.tip}\nTotal: $${res.total}\nPer person: $${res.each}`);
            }
            break
            case 'loan': case 'emi': {
                if (args.length < 3) return m.reply(`Example: ${prefix + command} <principal> <rate%> <months>`);
                const res = Finance.emi(parseFloat(args[0]), parseFloat(args[1]), parseInt(args[2]));
                await m.reply(`🏦 *Loan EMI*\nEMI: $${res.emi}/month\nTotal: $${res.total}\nInterest: $${res.interest}`);
            }
            break
            case 'savings': {
                if (args.length < 2) return m.reply(`Example: ${prefix + command} <goalAmount> <monthlySaving> [rate%]`);
                const res = Finance.savings(parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2]||5));
                await m.reply(`🏦 Reach $${args[0]} in ~${res.years} years (${res.months} months)`);
            }
            break

            // ===== SOCIAL COMMANDS =====
            case 'bio': {
                const niche = args[0] || 'creator';
                await m.reply(`✍️ *Bio Idea*\n${Social.bios(niche)}`);
            }
            break
            case 'hashtag': case 'tags': {
                const topic = args[0] || 'love';
                await m.reply(`#️⃣ *Hashtags*\n${Social.hashtags(topic)}`);
            }
            break
            case 'caption': {
                const mood = args[0] || 'happy';
                await m.reply(`📝 *Caption*\n${Social.captions(mood)}`);
            }
            break
            case 'username': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <name> [clean/dev/cool]`);
                await m.reply(`👤 Suggested: ${Social.username(args[0], args[1])}`);
            }
            break
            case 'slogan': {
                await m.reply(`💡 *Slogan:*\n"${Social.slogan(args[0] || 'business')}"`);
            }
            break
            case 'email': case 'draft': {
                if (!text) return m.reply(`Example: ${prefix + command} <purpose>`);
                const res = await AI.ultimateAI(`Write a professional, concise email for: ${text}`, m.sender, 'deepseek');
                await m.reply(`📧 *Draft:*\n\n${res.text}`);
            }
            break
            case 'invoice': {
                if (args.length < 3) return m.reply(`Example: ${prefix + command} <to> <amount> <description>`);
                const [to, amt, ...desc] = args;
                const inv = `━━━━━━━━━━━━━━━\n📄 INVOICE #${Math.floor(Math.random()*100000)}\nTo: ${to}\nAmount: $${amt}\nFor: ${desc.join(' ')}\nDate: ${new Date().toLocaleDateString()}\nStatus: ⏳ PENDING\n━━━━━━━━━━━━━━━`;
                await m.reply(inv);
            }
            break

            // ===== DEVELOPER COMMANDS =====
            case 'uuid': { await m.reply(`🔑 ${Dev.uuid()}`); } break
            case 'password': {
                const len = parseInt(args[0]) || 16;
                const p = Dev.password(len);
                await m.reply(`🔐 *Password*\n\`\`\`\n${p.pass}\n\`\`\`\nEntropy: ${p.entropy}`);
            } break
            case 'json': {
                if (!text) return m.reply(`Example: ${prefix + command} <json string>`);
                const r = Dev.json(text);
                if (r.valid) await m.reply(`✅ Valid (${r.keys} keys)\n\`\`\`json\n${r.pretty.slice(0,2000)}\n\`\`\``);
                else await m.reply(`❌ ${r.error}`);
            } break
            case 'regex': {
                if (args.length < 3) return m.reply(`Example: ${prefix + command} <pattern> <flags> <text>`);
                const r = Dev.regex(args[0], args[1], args.slice(2).join(' '));
                await m.reply(`🔍 Matches: ${r.count}\n${r.matches.map((x,i) => `${i+1}. ${x}`).join('\n') || 'None'}`);
            } break
            case 'encode': {
                if (args.length < 2) return m.reply(`Example: ${prefix + command} <base64/url/html> <text>`);
                await m.reply(Dev.encode(args[0], args.slice(1).join(' ')));
            } break
            case 'decode': {
                if (args.length < 2) return m.reply(`Example: ${prefix + command} <base64/url/html> <text>`);
                await m.reply(Dev.decode(args[0], args.slice(1).join(' ')));
            } break
            case 'lorem': {
                await m.reply(Dev.lorem(parseInt(args[0]) || 50));
            } break
            case 'palette': {
                const c = Dev.palette();
                await m.reply(`🎨 *Color Palette*\n${c.map(x => `■ ${x}`).join('\n')}`);
            } break
            case 'qrvcard': {
                if (args.length < 3) return m.reply(`Example: ${prefix + command} <name> <phone> <email>`);
                const data = Dev.qrData('vcard', { name: args[0], phone: args[1], email: args[2] });
                const buf = await Tools.qr(data);
                await nimesha.sendMessage(m.chat, { image: buf, caption: `📇 vCard QR for ${args[0]}` }, { quoted: m });
            } break
            case 'qrwifi': {
                if (args.length < 2) return m.reply(`Example: ${prefix + command} <SSID> <password>`);
                const data = Dev.qrData('wifi', { ssid: args[0], pass: args[1] });
                const buf = await Tools.qr(data);
                await nimesha.sendMessage(m.chat, { image: buf, caption: `📶 WiFi: ${args[0]}` }, { quoted: m });
            } break
            case 'checksum': {
                if (!m.quoted || !m.quoted.isMedia) return m.reply('Reply to a file');
                const buf = await m.quoted.download();
                const sha = Dev.checksum(buf, 'sha256');
                const md5 = Dev.checksum(buf, 'md5');
                await m.reply(`📁 Checksums\nSHA256: ${sha}\nMD5: ${md5}`);
            } break

            // ===== TRAVEL COMMANDS =====
            case 'packing': {
                if (args.length < 3) return m.reply(`Example: ${prefix + command} <destination> <days> <hot/cold/rain>`);
                const list = Travel.packing(args[0], parseInt(args[1]), args[2]);
                await m.reply(`🎒 *Packing List for ${args[0]}*\n${list.map((x,i) => `${i+1}. ${x}`).join('\n')}`);
            } break
            case 'worldclock': case 'time': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <city>`);
                const t = Travel.timezone(args[0]);
                await m.reply(`🌍 *${t.city}*\n🕐 ${t.time}\n📅 ${t.date}\n${t.offset}`);
            } break
            case 'phrasebook': case 'phrases': {
                const lang = args[0] || 'spanish';
                const p = Travel.phrases(lang);
                await m.reply(`🗣️ *${lang.toUpperCase()} Phrases*\n${Object.entries(p).map(([k,v]) => `*${k}:* ${v}`).join('\n')}`);
            } break
            case 'itinerary': {
                if (args.length < 2) return m.reply(`Example: ${prefix + command} <city> <days>`);
                const plan = Travel.itinerary(args[0], parseInt(args[1]));
                await m.reply(`🗺️ *${args[0]} ${args[1]}-Day Plan*\n${plan.map((x,i) => `Day ${i+1}: ${x}`).join('\n')}`);
            } break
            case 'convert': case 'unit': {
                if (args.length < 3) return m.reply(`Example: ${prefix + command} <value> <from> <to>\nUnits: km, mi, kg, lb, c, f, l, gal`);
                const val = parseFloat(args[0]);
                const f = args[1].toLowerCase(); const t = args[2].toLowerCase();
                const rates = { km_mi:0.621371, mi_km:1.60934, kg_lb:2.20462, lb_kg:0.453592, l_gal:0.264172, gal_l:3.78541 };
                const key = `${f}_${t}`;
                let res;
                if (key === 'c_f') res = (val * 9/5) + 32;
                else if (key === 'f_c') res = (val - 32) * 5/9;
                else if (rates[key]) res = val * rates[key];
                else return m.reply('Unsupported conversion');
                await m.reply(`🔄 ${val}${f} = ${res.toFixed(2)}${t}`);
            } break
            case 'detectlang': {
                if (!text) return m.reply(`Example: ${prefix + command} <text>`);
                const res = await AI.ultimateAI(`Detect the language of this text and reply with ONLY the language name: "${text}". If it's Swahili say Swahili.`, m.sender, 'deepseek');
                await m.reply(`🌐 Detected: ${res.text.replace(/\./g,'')}`);
            } break
            case 'readtime': {
                const words = text.split(/\s+/).length;
                const mins = Math.ceil(words / 200);
                await m.reply(`📖 ${words} words ≈ ${mins} min read`);
            } break

            // ===== FOOD COMMANDS =====
            case 'recipe': {
                if (!text) return m.reply(`Example: ${prefix + command} <dish>`);
                const r = await Food.recipe(text);
                if (!r) return m.reply('Recipe not found');
                await nimesha.sendMessage(m.chat, { image: { url: r.thumb }, caption: `🍽️ *${r.name}*\n📍 ${r.area} | ${r.category}\n\n*Ingredients:*\n${r.ingredients.join('\n')}\n\n*Instructions:*\n${r.instructions.slice(0,800)}...` }, { quoted: m });
            } break
            case 'cocktail': {
                const c = await Food.cocktail(text || 'margarita');
                if (!c) return m.reply('Drink not found');
                await nimesha.sendMessage(m.chat, { image: { url: c.thumb }, caption: `🍸 *${c.name}*\n🥃 Glass: ${c.glass}\n\n*Ingredients:*\n${c.ingredients.join(', ')}\n\n*How to make:*\n${c.instructions}` }, { quoted: m });
            } break
            case 'substitute': {
                if (!args[0]) return m.reply(`Example: ${prefix + command} <ingredient>`);
                await m.reply(`🔄 *Substitute for ${args[0]}*\n${Food.substitute(args[0])}`);
            } break
            case 'mealprep': {
                const plan = Food.mealPrep(args[0] || 'balanced');
                await m.reply(`🥗 *${(args[0]||'balanced').toUpperCase()} Meal Plan*\n${plan.map((x,i) => `${i+1}. ${x}`).join('\n')}`);
            } break

            // ===== MENU COMMANDS =====
            case 'menu': case 'help': case 'allmenu': {
                // Primary: interactive carousel with local images and formatted commands
                try {
                    const carouselCards = [
                        { url: './database/menucards/bot.png', body: `🤖 *BOT*\n\n▸ ${prefix}alive\n▸ ${prefix}ping\n▸ ${prefix}info\n▸ ${prefix}owner\n▸ ${prefix}runtime\n▸ ${prefix}speed\n▸ ${prefix}staff\n▸ ${prefix}profile\n▸ ${prefix}leaderboard\n▸ ${prefix}totalpesan\n▸ ${prefix}sc\n▸ ${prefix}donasi`, footer: 'Bot utilities & info', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🤖 Bot Menu', id: `${prefix}botmenu` }) }, { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📊 Stats', id: `${prefix}stats` }) }] },
                        { url: './database/menucards/group.png', body: `👥 *GROUP*\n\n▸ ${prefix}add\n▸ ${prefix}kick\n▸ ${prefix}promote\n▸ ${prefix}demote\n▸ ${prefix}tagall\n▸ ${prefix}hidetag\n▸ ${prefix}setname\n▸ ${prefix}setdesc\n▸ ${prefix}groupinfo\n▸ ${prefix}linkgroup\n▸ ${prefix}revoke\n▸ ${prefix}welcome\n▸ ${prefix}goodbye`, footer: 'Manage your group', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👥 Group Menu', id: `${prefix}groupmenu` }) }, { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔗 Link Group', id: `${prefix}linkgroup` }) }] },
                        { url: './database/menucards/download.png', body: `⬇️ *DOWNLOAD*\n\n▸ ${prefix}song\n▸ ${prefix}video\n▸ ${prefix}tiktok\n▸ ${prefix}instagram\n▸ ${prefix}facebook\n▸ ${prefix}twitter\n▸ ${prefix}spotify\n▸ ${prefix}mediafire\n▸ ${prefix}apk\n▸ ${prefix}play`, footer: 'Download from 20+ platforms', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⬇️ Download Menu', id: `${prefix}downloadmenu` }) }, { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎵 Song', id: `${prefix}song ` }) }] },
                        { url: './database/menucards/ai.png', body: `🧠 *AI*\n\n▸ ${prefix}gpt\n▸ ${prefix}gemini\n▸ ${prefix}llama\n▸ ${prefix}deepseek\n▸ ${prefix}ai\n▸ ${prefix}imagine\n▸ ${prefix}translate\n▸ ${prefix}tts\n▸ ${prefix}summarize\n▸ ${prefix}code\n▸ ${prefix}brainrot`, footer: 'Chat with advanced AI', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🧠 AI Menu', id: `${prefix}aimenu` }) }, { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💬 GPT', id: `${prefix}gpt ` }) }] },
                        { url: './database/menucards/sticker.png', body: `🎨 *STICKER*\n\n▸ ${prefix}sticker\n▸ ${prefix}s\n▸ ${prefix}simage\n▸ ${prefix}toimg\n▸ ${prefix}attp\n▸ ${prefix}removebg\n▸ ${prefix}blur\n▸ ${prefix}qc\n▸ ${prefix}brat\n▸ ${prefix}smeme`, footer: 'Create and edit stickers', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎨 Sticker Menu', id: `${prefix}stickermenu` }) }, { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🖼️ Sticker', id: `${prefix}sticker` }) }] },
                        { url: './database/menucards/games.png', body: `🎮 *GAMES*\n\n▸ ${prefix}connect4 @user\n▸ ${prefix}suit @user\n▸ ${prefix}chess @user\n▸ ${prefix}slot\n▸ ${prefix}blackjack\n▸ ${prefix}akinator\n▸ ${prefix}wordle\n▸ ${prefix}hangman\n▸ ${prefix}math\n▸ ${prefix}tebaklagu`, footer: 'Multiplayer & solo games', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎮 Games Menu', id: `${prefix}gamemenu` }) }, { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔴 Connect4', id: `${prefix}connect4 ` }) }] },
                        { url: './database/menucards/fun.png', body: `😂 *FUN*\n\n▸ ${prefix}joke\n▸ ${prefix}meme\n▸ ${prefix}quote\n▸ ${prefix}fact\n▸ ${prefix}8ball\n▸ ${prefix}roast\n▸ ${prefix}compliment\n▸ ${prefix}ship\n▸ ${prefix}truth\n▸ ${prefix}dare\n▸ ${prefix}bisakah`, footer: 'Entertainment & random fun', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '😂 Fun Menu', id: `${prefix}funmenu` }) }, { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎱 8ball', id: `${prefix}8ball ` }) }] },
                        { url: './database/menucards/admin.png', body: `🛠️ *ADMIN*\n\n▸ ${prefix}ban\n▸ ${prefix}unban\n▸ ${prefix}mute\n▸ ${prefix}unmute\n▸ ${prefix}warn\n▸ ${prefix}unwarn\n▸ ${prefix}clear\n▸ ${prefix}delete\n▸ ${prefix}pin\n▸ ${prefix}unpin`, footer: 'Admin & moderation tools', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🛠️ Admin Menu', id: `${prefix}adminmenu` }) }, { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔇 Mute', id: `${prefix}mute` }) }] },
                        { url: './database/menucards/search.png', body: `🔍 *SEARCH*\n\n▸ ${prefix}google\n▸ ${prefix}wiki\n▸ ${prefix}urban\n▸ ${prefix}weather\n▸ ${prefix}news\n▸ ${prefix}anime\n▸ ${prefix}manga\n▸ ${prefix}github\n▸ ${prefix}npm\n▸ ${prefix}iplookup\n▸ ${prefix}whois\n▸ ${prefix}dns`, footer: 'Search the web instantly', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔍 Search Menu', id: `${prefix}searchmenu` }) }, { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🌐 Google', id: `${prefix}google ` }) }] },
                        { url: './database/menucards/movies.png', body: `🎬 *MOVIES*\n\n▸ ${prefix}movie\n▸ ${prefix}film\n▸ ${prefix}imdb\n▸ ${prefix}series\n▸ ${prefix}rating\n▸ ${prefix}tv\n▸ ${prefix}anime`, footer: 'Movie & TV show info', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎬 Movies Menu', id: `${prefix}moviesmenu` }) }, { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📽️ Movie', id: `${prefix}movie ` }) }] },
                        { url: './database/menucards/sports.png', body: `⚽ *SPORTS*\n\n▸ ${prefix}leagues\n▸ ${prefix}fixtures <league>\n▸ ${prefix}live\n▸ ${prefix}standings <league>\n▸ ${prefix}team <id>\n▸ ${prefix}player <id>\n▸ ${prefix}odds <sport>\n▸ ${prefix}espn`, footer: 'Live scores, stats & betting', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⚽ Sports Menu', id: `${prefix}sportsmenu` }) }, { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔥 Live', id: `${prefix}live` }) }] },
                        { url: './database/menucards/casino.png', body: `🎰 *CASINO*\n\n▸ ${prefix}slot\n▸ ${prefix}roulette <bet> <choice>\n▸ ${prefix}crash <bet> <mult>\n▸ ${prefix}dice <bet> over/under <num>\n▸ ${prefix}coin <bet> heads/tails\n▸ ${prefix}rps rock/paper/scissors`, footer: 'Bet & win virtual coins', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎰 Casino Menu', id: `${prefix}casinomenu` }) }, { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎲 Roulette', id: `${prefix}roulette ` }) }] },
                        { url: './database/menucards/rpg.png', body: `🧙 *RPG*\n\n▸ ${prefix}rpg – View stats\n▸ ${prefix}rpg fight – Attack\n▸ ${prefix}rpg heal – Heal (10 gold)\n▸ ${prefix}rpg spawn – New enemy`, footer: 'Adventure & level up', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🧙 RPG Menu', id: `${prefix}rpgmenu` }) }, { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⚔️ Fight', id: `${prefix}rpg fight` }) }] },
                        { url: './database/menucards/master.png', body: `📊 *MASTER*\n\n▸ ${prefix}economy\n▸ ${prefix}daily\n▸ ${prefix}health\n▸ ${prefix}finance\n▸ ${prefix}social\n▸ ${prefix}dev\n▸ ${prefix}travel\n▸ ${prefix}food`, footer: 'Advanced features & tools', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📊 Master Menu', id: `${prefix}mastermenu` }) }, { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💰 Economy', id: `${prefix}economymenu` }) }] },
                        { url: './database/menucards/owner.png', body: `👑 *OWNER*\n\n▸ ${prefix}block\n▸ ${prefix}unblock\n▸ ${prefix}ban\n▸ ${prefix}unban\n▸ ${prefix}addprem\n▸ ${prefix}delprem\n▸ ${prefix}backup\n▸ ${prefix}shutdown\n▸ ${prefix}restart\n▸ ${prefix}join\n▸ ${prefix}leave`, footer: 'Bot management (owner only)', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👑 Owner Menu', id: `${prefix}ownermenu` }) }, { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⚡ Speed Test', id: `${prefix}speed` }) }] }
                    ];

                    const carouselBody = `╔══════════════════════╗
║  *🦊 Maureonix*  ║
╚══════════════════════╝

👋 Hello *${m.pushName || 'User'}*!
${ucapanWaktu}

📅 *Date:* ${tanggal}
🕐 *Time:* ${jam}
📆 *Day:* ${dayName}

🔧 *Prefix:* ${prefix}
📊 *Commands:* ${cases.length}+

✨ *Swipe to explore categories* ✨`;

                    await nimesha.sendCarouselMsg(m.chat, carouselBody, `© Maureonix | ${prefix}help <cmd> for details`, carouselCards, { quoted: m });
                } catch (e) {
                    console.error('[carousel error]', e);
                    // Fallback: generate beautiful menu image (same as before)
                    try {
                        const buf = await generateMenuImage({
                            botName: global.botname || 'Maureonix',
                            ownerName: global.ownerName || 'Infinite Vybeflix',
                            memberName: m.pushName || 'User',
                            prefix: prefix,
                            totalCmds: cases.length,
                            time: jam,
                            date: tanggal
                        });

                        const caption = `╭━═✦〔 Maureonix 〕✦═━╮
╰═✪═════════════════✪═╯

👋 Hello *${m.pushName || 'User'}*!
🔧 Prefix: *${prefix}*
📊 Commands: *${cases.length}+*

_Type ${prefix}help <command> for details_`;
                        await nimesha.sendMessage(m.chat, { image: buf, caption }, { quoted: m });
                    } catch (imgErr) {
                        console.error('[menu image fallback error]', imgErr);
                        // Last resort: beautifully formatted text menu (already provided earlier)
                        const textMenu = `...`; // keep your existing beautiful fallback
                        await m.reply(textMenu);
                    }
                }
            }
            break

            // ===== SUB-MENU HANDLERS =====
            case 'botmenu': {
                const botMenuText = `╔══════════════════════╗
║  *🤖 BOT COMMANDS*  ║
╚══════════════════════╝

📌 *General*
▸ ${prefix}alive – Check if bot is online
▸ ${prefix}ping – Response speed
▸ ${prefix}info – Bot information
▸ ${prefix}owner – Contact owner
▸ ${prefix}runtime – Uptime of bot
▸ ${prefix}speed – Internet speed test
▸ ${prefix}staff – List bot staff
▸ ${prefix}profile – Your profile
▸ ${prefix}leaderboard – Top users
▸ ${prefix}totalpesan – Message stats
▸ ${prefix}sc – Source code
▸ ${prefix}donasi – Donate

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(botMenuText);
            }
            break

            case 'groupmenu': {
                const groupMenuText = `╔══════════════════════╗
║  *👥 GROUP COMMANDS*  ║
╚══════════════════════╝

📌 *Member Management*
▸ ${prefix}add @user – Add member
▸ ${prefix}kick @user – Remove member
▸ ${prefix}promote @user – Make admin
▸ ${prefix}demote @user – Remove admin

📌 *Group Info & Settings*
▸ ${prefix}setname <name> – Change group name
▸ ${prefix}setdesc <desc> – Change description
▸ ${prefix}groupinfo – View group details
▸ ${prefix}linkgroup – Get invite link
▸ ${prefix}revoke – Reset invite link
▸ ${prefix}welcome on/off – Toggle welcome msg
▸ ${prefix}goodbye on/off – Toggle goodbye msg

📌 *Tagging*
▸ ${prefix}tagall <message> – Mention everyone
▸ ${prefix}hidetag <message> – Hidden mention

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(groupMenuText);
            }
            break

            case 'downloadmenu': {
                const downloadMenuText = `╔══════════════════════╗
║  *⬇️ DOWNLOAD COMMANDS*  ║
╚══════════════════════╝

📌 *Audio & Video*
▸ ${prefix}song <query> – Download MP3
▸ ${prefix}video <query> – Download MP4
▸ ${prefix}play <query> – Play audio

📌 *Social Media*
▸ ${prefix}tiktok <url>
▸ ${prefix}instagram <url>
▸ ${prefix}facebook <url>
▸ ${prefix}twitter <url>
▸ ${prefix}spotify <url>

📌 *Other*
▸ ${prefix}mediafire <url>
▸ ${prefix}apk <app name>

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(downloadMenuText);
            }
            break

            case 'aimenu': {
                const aiMenuText = `╔══════════════════════╗
║  *🧠 AI COMMANDS*  ║
╚══════════════════════╝

📌 *Chat Models*
▸ ${prefix}gpt <prompt>
▸ ${prefix}gemini <prompt>
▸ ${prefix}llama <prompt>
▸ ${prefix}deepseek <prompt>
▸ ${prefix}ai <prompt>

📌 *Image Generation*
▸ ${prefix}imagine <prompt>
▸ ${prefix}flux <prompt>
▸ ${prefix}sora <prompt>

📌 *Utilities*
▸ ${prefix}translate <text> <lang>
▸ ${prefix}tts <text>
▸ ${prefix}summarize
▸ ${prefix}code <description>
▸ ${prefix}brainrot <text>

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(aiMenuText);
            }
            break

            case 'gamemenu': {
                const gameMenuText = `╔══════════════════════╗
║  *🎮 GAMES COMMANDS*  ║
╚══════════════════════╝

📌 *Multiplayer*
▸ ${prefix}tictactoe @user
▸ ${prefix}suit @user
▸ ${prefix}chess @user

📌 *Single Player*
▸ ${prefix}slot – Slot machine
▸ ${prefix}blackjack – Play blackjack
▸ ${prefix}akinator – Guess character
▸ ${prefix}wordle – Word guessing
▸ ${prefix}hangman – Hangman game
▸ ${prefix}math – Math quiz
▸ ${prefix}tebaklagu – Guess song

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(gameMenuText);
            }
            break

            case 'funmenu': {
                const funMenuText = `╔══════════════════════╗
║  *😂 FUN COMMANDS*  ║
╚══════════════════════╝

📌 *Random Fun*
▸ ${prefix}joke – Random joke
▸ ${prefix}meme – Random meme
▸ ${prefix}quote – Inspirational quote
▸ ${prefix}fact – Random fact

📌 *Interactive*
▸ ${prefix}8ball <question>
▸ ${prefix}roast @user
▸ ${prefix}compliment @user
▸ ${prefix}ship @user1 @user2
▸ ${prefix}truth – Truth question
▸ ${prefix}dare – Dare challenge
▸ ${prefix}bisakah <question>

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(funMenuText);
            }
            break

            case 'stickermenu': {
                const stickerMenuText = `╔══════════════════════╗
║  *🎨 STICKER COMMANDS*  ║
╚══════════════════════╝

📌 *Create Stickers*
▸ ${prefix}sticker – Send image/video
▸ ${prefix}s – Shortcut for sticker
▸ ${prefix}simage – Sticker to image
▸ ${prefix}toimg – Same as simage
▸ ${prefix}attp <text> – Animated text

📌 *Image Editing*
▸ ${prefix}removebg – Remove background
▸ ${prefix}blur – Blur image
▸ ${prefix}qc <text> – Quote canvas
▸ ${prefix}brat <text> – Brat style
▸ ${prefix}smeme – Sticker meme

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(stickerMenuText);
            }
            break

            case 'adminmenu': {
                const adminMenuText = `╔══════════════════════╗
║  *🛠️ ADMIN COMMANDS*  ║
╚══════════════════════╝

📌 *User Management*
▸ ${prefix}ban @user
▸ ${prefix}unban @user
▸ ${prefix}mute – Mute group
▸ ${prefix}unmute – Unmute group
▸ ${prefix}warn @user
▸ ${prefix}unwarn @user

📌 *Chat Management*
▸ ${prefix}clear – Clear chat
▸ ${prefix}delete – Delete message
▸ ${prefix}pin – Pin message
▸ ${prefix}unpin – Unpin message

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(adminMenuText);
            }
            break

            case 'searchmenu': {
                const searchMenuText = `╔══════════════════════╗
║  *🔍 SEARCH COMMANDS*  ║
╚══════════════════════╝

📌 *Web Search*
▸ ${prefix}google <query>
▸ ${prefix}wiki <query>
▸ ${prefix}urban <word>
▸ ${prefix}weather <city>
▸ ${prefix}news

📌 *Anime & Manga*
▸ ${prefix}anime <title>
▸ ${prefix}manga <title>

📌 *Developer*
▸ ${prefix}github <repo>
▸ ${prefix}npm <package>
▸ ${prefix}iplookup <ip>
▸ ${prefix}whois <domain>
▸ ${prefix}dns <domain>

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(searchMenuText);
            }
            break

            case 'moviesmenu': {
                const moviesMenuText = `╔══════════════════════╗
║  *🎬 MOVIES COMMANDS*  ║
╚══════════════════════╝

📌 *Movie Info*
▸ ${prefix}movie <title>
▸ ${prefix}film <title>
▸ ${prefix}imdb <id>
▸ ${prefix}series <title>
▸ ${prefix}rating <id>
▸ ${prefix}cinema

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(moviesMenuText);
            }
            break

            case 'mastermenu': {
                const masterMenuText = `╔══════════════════════╗
║  *📊 MASTER COMMANDS*  ║
╚══════════════════════╝

📌 *Categories*
▸ ${prefix}economy – Economy system
▸ ${prefix}daily – Daily tools
▸ ${prefix}health – Health calculators
▸ ${prefix}finance – Finance tools
▸ ${prefix}social – Social utilities
▸ ${prefix}dev – Developer tools
▸ ${prefix}travel – Travel helpers
▸ ${prefix}food – Food & recipes

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(masterMenuText);
            }
            break
            // ===== SPORTS SUB‑MENU =====
            case 'sportsmenu': {
                const sportsMenuText = `╔══════════════════════╗
║  *⚽ SPORTS COMMANDS*  ║
╚══════════════════════╝

📌 *Football (API Sports)*
▸ ${prefix}leagues – List leagues & IDs
▸ ${prefix}fixtures <league-id> – Upcoming matches
▸ ${prefix}live – Live scores (Premier League)
▸ ${prefix}standings <league-id> – League table
▸ ${prefix}team <id> – Team info
▸ ${prefix}player <id> – Player stats
▸ ${prefix}h2h <id1>-<id2> – Head to head
▸ ${prefix}predict <fixture-id> – Match prediction

📌 *Betting (Odds API)*
▸ ${prefix}sports – List available sports
▸ ${prefix}odds <sport-key> – Current odds

📌 *ESPN (Free)*
▸ ${prefix}espn <sport> <league> – Live scoreboard
▸ ${prefix}espnnews <sport> <league> – News

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(sportsMenuText);
            }
            break

            // ===== CASINO SUB‑MENU =====
            case 'casinomenu': {
                const casinoMenuText = `╔══════════════════════╗
║  *🎰 CASINO COMMANDS*  ║
╚══════════════════════╝

📌 *Games*
▸ ${prefix}slot – Spin the slot machine
▸ ${prefix}roulette <bet> <red/black/even/odd/number>
▸ ${prefix}crash <bet> <multiplier> – Crash game
▸ ${prefix}dice <bet> over/under <2-11>
▸ ${prefix}coin <bet> heads/tails
▸ ${prefix}rps <rock/paper/scissors/lizard/spock>

📌 *Classic Casino*
▸ ${prefix}casino <bet> – Simple number game
▸ ${prefix}samgong <bet> – Card game

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(casinoMenuText);
            }
            break

            // ===== RPG SUB‑MENU =====
            case 'rpgmenu': {
                const rpgMenuText = `╔══════════════════════╗
║  *🧙 RPG ADVENTURE*  ║
╚══════════════════════╝

📌 *Commands*
▸ ${prefix}rpg – View your stats
▸ ${prefix}rpg fight – Attack current enemy
▸ ${prefix}rpg heal – Heal 40 HP (costs 10 gold)
▸ ${prefix}rpg spawn – Summon a new enemy

📌 *How to Play*
Defeat enemies to earn gold and XP.
Level up to increase HP, attack, and defense.
Reach higher floors for tougher enemies!

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(rpgMenuText);
            }
            break
            case 'ownermenu': {
                const ownerMenuText = `╔══════════════════════╗
║  *👑 OWNER COMMANDS*  ║
╚══════════════════════╝

📌 *User Control*
▸ ${prefix}block @user
▸ ${prefix}unblock @user
▸ ${prefix}ban @user
▸ ${prefix}unban @user
▸ ${prefix}addprem @user
▸ ${prefix}delprem @user

📌 *Bot Control*
▸ ${prefix}backup – Backup database
▸ ${prefix}shutdown – Stop bot
▸ ${prefix}restart – Restart bot
▸ ${prefix}join <link> – Join group
▸ ${prefix}leave – Leave group

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(ownerMenuText);
            }
            break

            case 'stats': {
                // Simple stats – you can expand this
                const statsText = `📊 *Bot Statistics*

▸ *Uptime:* ${runtime(process.uptime())}
▸ *Commands Run:* ${db.hit?.totalcmd || 0}
▸ *Users:* ${Object.keys(db.users).length}
▸ *Groups:* ${Object.keys(db.groups).length}

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(statsText);
            }
            break

            // ===== MASTER SUB‑MENUS =====
            case 'economymenu': {
                const economyMenuText = `╔══════════════════════╗
║  *💰 ECONOMY COMMANDS*  ║
╚══════════════════════╝

📌 *Actions*
▸ ${prefix}daily – Claim daily reward
▸ ${prefix}work – Work to earn coins
▸ ${prefix}rob @user – Attempt to rob someone
▸ ${prefix}balance – Check your balance
▸ ${prefix}deposit <amount> – Deposit to bank
▸ ${prefix}withdraw <amount> – Withdraw from bank
▸ ${prefix}transfer @user <amount> – Send coins
▸ ${prefix}lb – Leaderboard
▸ ${prefix}buy <item> – Buy from shop
▸ ${prefix}inventory – View your items

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(economyMenuText);
            }
            break

            case 'dailymenu': {
                const dailyMenuText = `╔══════════════════════╗
║  *📅 DAILY TOOLS*  ║
╚══════════════════════╝

📌 *Reminders*
▸ ${prefix}remindme <minutes> <text>
▸ ${prefix}reminders – List reminders
▸ ${prefix}clearme – Clear all reminders

📌 *Notes*
▸ ${prefix}note <title>|<content>
▸ ${prefix}mynotes – View your notes
▸ ${prefix}delnote <number> – Delete a note

📌 *To‑Do*
▸ ${prefix}todo <task>|<priority>
▸ ${prefix}todos – List tasks
▸ ${prefix}done <number> – Mark as done
▸ ${prefix}cleartodo – Clear completed

📌 *Habits*
▸ ${prefix}habit <name> – Check in
▸ ${prefix}habits – View habits

📌 *Mood & Health*
▸ ${prefix}mood <1-10> [note]
▸ ${prefix}moodgraph – View history
▸ ${prefix}water <ml> – Log water intake

📌 *Finance*
▸ ${prefix}expense <amount> <category>
▸ ${prefix}myexpenses – View spending

📌 *Shopping*
▸ ${prefix}grocery <item> – Add to list
▸ ${prefix}cleargrocery – Clear list

📌 *Timers*
▸ ${prefix}timer <minutes> [label]
▸ ${prefix}alarm <HH:MM> [message]

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(dailyMenuText);
            }
            break

            case 'healthmenu': {
                const healthMenuText = `╔══════════════════════╗
║  *💪 HEALTH COMMANDS*  ║
╚══════════════════════╝

📌 *Calculators*
▸ ${prefix}bmi <kg> <cm>
▸ ${prefix}bmr <kg> <cm> <age> <gender>
▸ ${prefix}tdee <bmr> <activity>
▸ ${prefix}macros <calories> [goal]
▸ ${prefix}watercalc <kg>

📌 *Fitness*
▸ ${prefix}sleep – Wake‑up times
▸ ${prefix}heartrate <age>
▸ ${prefix}onerm <weight> <reps>
▸ ${prefix}bodyfat <gender> <waist> <neck> <height>
▸ ${prefix}workout [type]
▸ ${prefix}yoga [pose]

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(healthMenuText);
            }
            break

            case 'financemenu': {
                const financeMenuText = `╔══════════════════════╗
║  *📊 FINANCE COMMANDS*  ║
╚══════════════════════╝

📌 *Stocks & Crypto*
▸ ${prefix}stock <symbol>
▸ ${prefix}crypto <symbol>
▸ ${prefix}portfolio – Your holdings
▸ ${prefix}addstock <sym> <qty> <price>
▸ ${prefix}addcrypto <sym> <qty> <price>

📌 *Calculators*
▸ ${prefix}tip <amount> <percent> [people]
▸ ${prefix}loan <principal> <rate%> <months>
▸ ${prefix}savings <goal> <monthly> [rate%]
▸ ${prefix}forex <from> <to>

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(financeMenuText);
            }
            break

            case 'socialmenu': {
                const socialMenuText = `╔══════════════════════╗
║  *📱 SOCIAL COMMANDS*  ║
╚══════════════════════╝

📌 *Content Ideas*
▸ ${prefix}bio [niche]
▸ ${prefix}hashtag <topic>
▸ ${prefix}caption [mood]
▸ ${prefix}username <name> [style]
▸ ${prefix}slogan [business]

📌 *Communication*
▸ ${prefix}email <purpose>
▸ ${prefix}invoice <to> <amount> <desc>

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(socialMenuText);
            }
            break

            case 'devmenu': {
                const devMenuText = `╔══════════════════════╗
║  *💻 DEVELOPER TOOLS*  ║
╚══════════════════════╝

📌 *Utilities*
▸ ${prefix}uuid – Generate UUID
▸ ${prefix}password [length]
▸ ${prefix}json <string> – Validate/format
▸ ${prefix}regex <pattern> <flags> <text>
▸ ${prefix}encode <type> <text>
▸ ${prefix}decode <type> <text>
▸ ${prefix}lorem [words]
▸ ${prefix}palette – Color palette
▸ ${prefix}qrvcard <name> <phone> <email>
▸ ${prefix}qrwifi <ssid> <pass>
▸ ${prefix}checksum – Reply to file

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(devMenuText);
            }
            break

            case 'travelmenu': {
                const travelMenuText = `╔══════════════════════╗
║  *✈️ TRAVEL COMMANDS*  ║
╚══════════════════════╝

📌 *Planning*
▸ ${prefix}packing <dest> <days> <weather>
▸ ${prefix}itinerary <city> <days>
▸ ${prefix}worldclock <city>
▸ ${prefix}phrasebook [language]
▸ ${prefix}convert <value> <from> <to>
▸ ${prefix}detectlang <text>
▸ ${prefix}readtime <text>

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(travelMenuText);
            }
            break

            case 'foodmenu': {
                const foodMenuText = `╔══════════════════════╗
║  *🍔 FOOD COMMANDS*  ║
╚══════════════════════╝

📌 *Recipes & More*
▸ ${prefix}recipe <dish>
▸ ${prefix}cocktail [name]
▸ ${prefix}substitute <ingredient>
▸ ${prefix}mealprep [type]

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
                await m.reply(foodMenuText);
            }
            break

            // fallback for unknown commands (media hash commands)
            default:
                if (budy.startsWith('>')) {
                    if (!isCreator) return;
                    try {
                        let evaled = await eval(budy.slice(2));
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                        await m.reply(evaled);
                    } catch (err) { await m.reply(String(err)); }
                }
                if (budy.startsWith('<')) {
                    if (!isCreator) return;
                    try {
                        let evaled = await eval(`(async () => { ${budy.slice(2)} })()`);
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                        await m.reply(evaled);
                    } catch (err) { await m.reply(String(err)); }
                }
                if (budy.startsWith('$')) {
                    if (!isCreator) return;
                    if (!text) return;
                    exec(budy.slice(2), (err, stdout) => {
                        if (err) return m.reply(`${err}`);
                        if (stdout) return m.reply(stdout);
                    });
                }
                if ((!isCmd || isCreator) && budy.toLowerCase() != undefined) {
                    if (m.chat.endsWith('broadcast')) return;
                    if (!(budy.toLowerCase() in db.database)) return;
                    await nimesha.relayMessage(m.chat, db.database[budy.toLowerCase()], {});
                }
        }
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
}

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});