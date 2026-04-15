process.on('uncaughtException', (err) => console.error('[uncaughtException]', err))
process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err))

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

const { UguuSe } = require('./lib/uploader');
const TicTacToe = require('./lib/tictactoe');
const { antiSpam } = require('./src/antispam');
const { ytMp4, ytMp3, tiktokDownload, igDownload, fbDownload } = require('./lib/scraper');
const { toAudio, toPTT, toVideo } = require('./lib/converter');
const { GroupUpdate, LoadDataBase } = require('./src/message');
const { JadiBot, StopJadiBot, ListJadiBot } = require('./src/jadibot');
const { cmdAdd, cmdDel, cmdAddHit, addExpired, getPosition, getExpired, getStatus, checkStatus, getAllExpired, checkExpired } = require('./src/database');
const { rdGame, iGame, tGame, gameSlot, gameCasinoSolo, gameSamgongSolo, gameMerampok, gameBegal, daily, buy, setLimit, addLimit, addMoney, setMoney, transfer, Blackjack, SnakeLadder } = require('./lib/game');
const { getRandom, getBuffer, fetchJson, runtime, clockString, sleep, isUrl, formatDate, formatp, generateProfilePicture, errorCache, normalize, updateSettings, parseMention, fixBytes, similarity, pickRandom, tarBackup } = require('./lib/function');

// ── NEW MENU MODULES (untraceable) ─────────────────────────────────────────
const { setTemplateMenu, sendCategoryMenu, MENU_CATALOGUE } = require('./lib/template_menu');
const adminProt  = require('./lib/admin_protection');
const gameLib    = require('./lib/game');
const movies     = require('./lib/movies');

const menfesTimeouts = new Map();
const settingsPath = path.join(__dirname, 'settings.js');
const cases = global.db && global.db.cases ? global.db.cases : (global.db = global.db || {}, global.db.cases = [...fs.readFileSync('./nima.js', 'utf-8').matchAll(/case\s+['"]([^'"]+)['"]/g)].map(match => match[1]));

// ── Helper: Bot mode access check ───────────────────────────────────────────
function checkBotAccess(m, senderNum, ownerNums) {
    const mode   = global.botMode || 'public';
    const chat   = m.chat || '';
    if ((global.restrictedGroups || []).includes(chat)) {
        return { ok: false, reason: global.mess?.modeRestr || '⛔ This group is restricted.' };
    }
    if (mode === 'public') return { ok: true };
    if (mode === 'private') {
        if (ownerNums.some(n => senderNum === n)) return { ok: true };
        const allowed = (global.allowedUsers || []).map(n => n.replace(/[^0-9]/g, ''));
        if (allowed.includes(senderNum)) return { ok: true };
        return { ok: false, reason: global.mess?.modePriv || '🔒 Bot is in private mode.' };
    }
    if (mode === 'restricted') {
        if (!m.isGroup) return { ok: false, reason: global.mess?.modeRestr || '⛔ Bot restricted to allowed groups.' };
        if ((global.allowedGroups || []).includes(chat)) return { ok: true };
        return { ok: false, reason: global.mess?.modeRestr || '⛔ Bot not available in this group.' };
    }
    return { ok: true };
}

module.exports = nimesha = async (nimesha, m, msg, store) => {
    await LoadDataBase(nimesha, m);
    
    const botNumber = nimesha.decodeJid(nimesha.user.id);
    
    // Read Database
    const sewa = db.sewa
    const premium = db.premium
    const set = db.set[botNumber]
    
    // Database Game
    let suit = db.game.suit
    let chess = db.game.chess
    let chat_ai = db.game.chat_ai
    if (!db.game.gemini_autoreply) db.game.gemini_autoreply = {}
    let gemini_autoreply = db.game.gemini_autoreply
    if (!db.game.gemini_history) db.game.gemini_history = {}
    let gemini_history = db.game.gemini_history
    let menfes = db.game.menfes
    let tekateki = db.game.tekateki
    let akinator = db.game.akinator
    let tictactoe = db.game.tictactoe
    let tebaklirik = db.game.tebaklirik
    let kuismath = db.game.kuismath
    let blackjack = db.game.blackjack
    let tebaklagu = db.game.tebaklagu
    let tebakkata = db.game.tebakkata
    let family100 = db.game.family100
    let susunkata = db.game.susunkata
    let tebakbom = db.game.tebakbom
    let ulartangga = db.game.ulartangga
    let tebakkimia = db.game.tebakkimia
    let caklontong = db.game.caklontong
    let tebakangka = db.game.tebakangka
    let tebaknegara = db.game.tebaknegara
    let tebakgambar = db.game.tebakgambar
    let tebakbendera = db.game.tebakbendera
    
    const ownerNumber = set.owner = [...new Set([...owner, ...set?.owner || []])];
    
    if (set.antidelete === undefined) set.antidelete = false;
    if (set.autostatus === undefined) set.autostatus = false;
    if (set.autostatusreact === undefined) set.autostatusreact = false;
    if (set.autorecording === undefined) set.autorecording = false;
    
    try {
        await GroupUpdate(nimesha, m, store);

        // Skip own messages (unless owner)
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
        
        const budy = (typeof m.text == 'string' ? m.text : '')
        const isCreator = isOwner = m.fromMe || ownerNumber.filter(v => typeof v === 'string').map(v => v.replace(/[^0-9]/g, '')).includes(m.sender.split('@')[0])
        const prefix = isCreator ? (/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi)[0] : listprefix.find(a => body?.startsWith(a)) || '') : set.multiprefix ? (/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi)[0] : listprefix.find(a => body?.startsWith(a)) || '¿') : listprefix.find(a => body?.startsWith(a)) || '¿'
        const isCmd = prefix ? body.startsWith(prefix) : listprefix.some(p => body.startsWith(p))
        const args = body.trim().split(/ +/).slice(1)
        const quoted = m.quoted ? m.quoted : m
        const command = isCreator ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : isCmd ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : ''
        const text = q = args.join(' ')
        const mime = (quoted.msg || quoted).mimetype || ''
        const qmsg = (quoted.msg || quoted)
        
        // Identity from config (via settings.js)
        const author   = set.author   = global.author   || 'Infinite Vybeflix';
        const packname = set.packname = global.packname  || 'MAUREONIX';
        const botname  = set.botname  = global.botname   || 'Maureonix';
        
        // Date / Time
        const _dayMap = {
            'Sunday':'Sunday', 'Monday':'Monday', 'Tuesday':'Tuesday',
            'Wednesday':'Wednesday', 'Thursday':'Thursday',
            'Friday':'Friday', 'Saturday':'Saturday'
        };
        const day = _dayMap[moment.tz('Asia/Colombo').format('dddd')] || moment.tz('Asia/Colombo').format('dddd');
        const tanggal = moment.tz('Asia/Colombo').format('DD/MM/YYYY');
        const jam = moment.tz('Asia/Colombo').format('HH:mm:ss');
        const ucapanWaktu = jam < '05:00:00' ? 'Good Night 🌉' : jam < '11:00:00' ? 'Good Morning 🌄' : jam < '15:00:00' ? 'Good Afternoon 🏙' : jam < '18:00:00' ? 'Good Evening 🌅' : jam < '19:00:00' ? 'Good Evening 🌃' : 'Good Night 🌌';
        const almost = 0.66
        const time_now = new Date()
        const time_end = 60000 - (time_now.getSeconds() * 1000 + time_now.getMilliseconds());
        const readmore = String.fromCharCode(8206).repeat(999)
        const setv = pickRandom(listv)
        
        const isVip = isCreator || (db.users[m.sender] ? db.users[m.sender].vip : false)
        const isBan = isCreator || (db.users[m.sender] ? db.users[m.sender].ban : false)
        const isLimit = isCreator || (db.users[m.sender] ? (db.users[m.sender].limit > 0) : false)
        const isPremium = isCreator || checkStatus(m.sender, premium) || false
        const isNsfw = m.isGroup ? db.groups[m.chat].nsfw : false
        
        // Fake contact
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
                    vcard: `BEGIN:VCARD\nVERSION:7.0\nN:XL;${m.pushName || author},;;;\nFN:${m.pushName || author}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                    sendEphemeral: true
                }
            }
        }
        
        // Daily limit reset (cron)
        if (!global._cronRegistered) {
            global._cronRegistered = true;
            cron.schedule('00 00 * * *', async () => {
                cmdDel(db.hit);
                let users = Object.keys(db.users);
                for (let jid of users) {
                    const lim = db.users[jid].vip ? limit.vip : checkStatus(jid, premium) ? limit.premium : limit.free;
                    if (db.users[jid].limit < lim) db.users[jid].limit = lim;
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
                            await nimesha.sendMessage(o, { document: fs.readFileSync(datanya), mimetype: 'application/json', fileName: tglnya + '_database.json' })
                        } catch {}
                    }
                }
            }, { scheduled: true, timezone: 'Asia/Colombo' });
        }
        
        // Auto Bio
        if (set.autobio) {
            if (new Date() * 1 - set.status > 60000) {
                await nimesha.updateProfileStatus(`${nimesha.user.name} | 🎯 Runtime: ${runtime(process.uptime())}`).catch(() => {});
                set.status = new Date() * 1;
            }
        }
        
        // Mode (public / grouponly / privateonly)
        if (!isCreator) {
            if ((set.grouponly === set.privateonly)) {
                if (!nimesha.public && !m.key.fromMe) return;
            } else if (set.grouponly) {
                if (!m.isGroup) return;
            } else if (set.privateonly) {
                if (m.isGroup) return;
            }
        }
        if (!m.isGroup && !isCreator && isCmd) return;
        
        // Group protections
        if (m.isGroup) {
            if (db.groups[m.chat].mute && !isCreator) return;
            
            // Anti Hidetag
            if (!m.key.fromMe && m.mentionedJid?.length === m.metadata?.participanis?.length && db.groups[m.chat].antihidetag && !isCreator && m.isBotAdmin && !m.isAdmin) {
                await nimesha.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender }});
                await m.reply('*Anti Hidetag is active!*');
            }
            
            // Anti Tag Status
            if (!m.key.fromMe && db.groups[m.chat].antitagsw && !isCreator && m.isBotAdmin && !m.isAdmin) {
                if (m.type === 'groupStatusMentionMessage' || m.message?.groupStatusMentionMessage || Object.keys(m.message).length === 1 && Object.keys(m.message)[0] === 'messageContextInfo') {
                    if (!db.groups[m.chat].tagsw) db.groups[m.chat].tagsw = {};
                    if (!db.groups[m.chat].tagsw[m.sender]) {
                        db.groups[m.chat].tagsw[m.sender] = 1;
                        await m.reply(`This group was tagged in WhatsApp status\n@${m.sender.split('@')[0]}, do not tag the group in status\n⚠️ Warning ${db.groups[m.chat].tagsw[m.sender]}/5`);
                    } else if (db.groups[m.chat].tagsw[m.sender] >= 5) {
                        await nimesha.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
                        await m.reply(`@${m.sender.split('@')[0]} removed — tagged group in status 5 times.`);
                        delete db.groups[m.chat].tagsw[m.sender];
                    } else {
                        db.groups[m.chat].tagsw[m.sender]++;
                        await m.reply(`Anti-Status Tag\n@${m.sender.split('@')[0]} ⚠️ Warning ${db.groups[m.chat].tagsw[m.sender]}/5`);
                    }
                }
            }
            
            // Anti Toxic
            if (!m.key.fromMe && db.groups[m.chat].antitoxic && !isCreator && m.isBotAdmin && !m.isAdmin) {
                if (budy.toLowerCase().split(/\s+/).some(word => badWords.includes(word))) {
                    await nimesha.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender }});
                    await nimesha.relayMessage(m.chat, { extendedTextMessage: { text: `Detected @${m.sender.split('@')[0]} using toxic language. Please use polite language.`, contextInfo: { mentionedJid: [m.key.participant], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Toxic!*' }, ...m.key } } }, {});
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
                    msgContent.contextInfo = { mentionedJid: [chats.key.participant], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Delete!*' }, ...chats.key };
                    const pesan = msgType === 'conversation' ? { extendedTextMessage: { text: msgContent, contextInfo: { mentionedJid: [chats.key.participant], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Delete!*' }, ...chats.key } } } : { [msgType]: msgContent };
                    await nimesha.relayMessage(m.chat, pesan, {});
                }
            }
            
            // Anti Link
            if (db.groups[m.chat].antilink && !isCreator && m.isBotAdmin && !m.isAdmin) {
                if (budy.match('chat.whatsapp.com/')) {
                    await nimesha.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender }});
                    await nimesha.relayMessage(m.chat, { extendedTextMessage: { text: `Detected @${m.sender.split('@')[0]} sending a group invite link. Link deleted.`, contextInfo: { mentionedJid: [m.key.participant], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Link!*' }, ...m.key } } }, {});
                }
            }
            
            // Anti Virtex
            if (db.groups[m.chat].antivirtex && !isCreator && m.isBotAdmin && !m.isAdmin) {
                if (budy.length > 4500) {
                    await nimesha.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender }});
                    await nimesha.relayMessage(m.chat, { extendedTextMessage: { text: `Detected @${m.sender.split('@')[0]} sending a virtex message.`, contextInfo: { mentionedJid: [m.key.participant], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Virtex!*' }, ...m.key } } }, {});
                    await nimesha.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                }
                if (m.msg?.nativeFlowMessage?.messageParamsJson?.length > 3500) {
                    await nimesha.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender }});
                    await nimesha.relayMessage(m.chat, { extendedTextMessage: { text: `Detected @${m.sender.split('@')[0]} sending a bug message.`, contextInfo: { mentionedJid: [m.key.participant], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Bug!*' }, ...m.key } } }, {});
                    await nimesha.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                }
            }
        }
        
        // Auto Read
        if (m.message && m.key.remoteJid !== 'status@broadcast') {
            if ((set.autoread && nimesha.public) || isCreator) {
                nimesha.readMessages([m.key]);
                console.log(chalk.black(chalk.bgWhite('[ MESSAGE ]:'), chalk.bgGreen(new Date), chalk.bgHex('#00EAD3')(budy || m.type), chalk.bgHex('#AF26EB')(m.key.id) + '\n' + chalk.bgCyanBright('[ FROM ] :'), chalk.bgYellow(m.pushName || (isCreator ? 'Bot' : 'Anon')), chalk.bgHex('#FF449F')(m.sender), chalk.bgHex('#FF5700')(m.isGroup ? m.metadata.subject : m.chat.endsWith('@newsletter') ? 'Newsletter' : 'Private Chat'), chalk.bgBlue('(' + m.chat + ')')));
            }
        }
        
        // Filter bot messages & banned users
        if (m.isBot) return;
        if (db.users[m.sender]?.ban && !isCreator) return;
        
        // API key filter
        if (cases.includes(command) && isCmd && (command !== 'setapikey') && global.APIKeys[global.APIs.nimesha] === 'nz-8ce9753907') {
            return m.reply('.setapikey nz-8ce9753907');
        }
        
        // Typing, anti-spam, hit tracking
        if (nimesha.public && isCmd) {
            if (set.autotyping) await nimesha.sendPresenceUpdate('composing', m.chat);
            if (cases.includes(command)) {
                cmdAdd(db.hit);
                cmdAddHit(db.hit, command);
            }
            if (set.antispam && antiSpam.isFiltered(m.sender)) {
                console.log(chalk.bgRed('[ SPAM ] : '), chalk.black(chalk.bgHex('#1CFFF7')(`From -> ${m.sender}`), chalk.bgHex('#E015FF')(` In ${m.isGroup ? m.chat : 'Private Chat'}`)));
                return m.reply('Please wait 5 seconds between commands.');
            }
            if (command && set.didyoumean && isCmd) {
                let _b = '', _s = 0;
                for (const c of cases) {
                    let sim = similarity(command.toLowerCase(), c.toLowerCase());
                    let ld = Math.abs(command.length - c.length);
                    if (sim > _s && ld <= 1) { _s = sim; _b = c; }
                }
                if (_s >= almost && command.toLowerCase() !== _b.toLowerCase()) {
                    return m.reply(`Command not found!\nDid you mean:\n- ${prefix + _b}\n- Similarity: ${parseInt(_s * 100)}%`);
                }
            }
        }
        if (isCmd && !isCreator) antiSpam.addFilter(m.sender);
        
        // Delete quoted button message when clicked
        const isButtonClick = ['interactiveResponseMessage', 'buttonsResponseMessage', 'listResponseMessage', 'templateButtonReplyMessage', 'messageContextInfo'].includes(m.type);
        if (isButtonClick && m.quoted?.key) {
            try { await nimesha.sendMessage(m.chat, { delete: m.quoted.key }); } catch {}
        }
        
        // Owner command acknowledgement
        const isRealOwner = ownerNumber.filter(v => typeof v === 'string').map(v => v.replace(/[^0-9]/g, '')).includes(m.sender.split('@')[0]);
        const botNum = botNumber.split('@')[0].replace(/[^0-9]/g, '');
        const ownerNumClean = (ownerNumber[0] || '').replace(/[^0-9]/g, '');
        const isSelfMode = botNum === ownerNumClean;
        if (isCmd && isRealOwner && command && prefix && body.startsWith(prefix) && !isSelfMode && !m.isGroup) {
            await m.react('🫡');
            await m.reply('ok sir');
        }
        
        // FileSha256 cmd
        let fileSha256;
        if (m.isMedia && m.msg.fileSha256 && db.cmd && (m.msg.fileSha256.toString('base64') in db.cmd)) {
            fileSha256 = db.cmd[m.msg.fileSha256.toString('base64')].text;
        }
        
        // Salam response
        if (/^a(s|ss)alamu('|)alaikum(| )(wr|)( |)(wb|)$/.test(budy?.toLowerCase())) {
            const jwb = ["Wa'alaikumusalam", "Wa'alaikumusalam wr wb", "Wa'alaikumusalam Warohmatulahi Wabarokatuh"];
            m.reply(pickRandom(jwb));
        }
        
        // Prayer time reminder
        const jadwalSholat = {
            Fajr: '04:30',
            Dhuhr: '12:06',
            Asr: '15:21',
            Maghrib: '18:08',
            Isha: '19:00'
        };
        if (!global._prayerRegistered) {
            global._prayerRegistered = true;
            if (global._prayerInterval) clearInterval(global._prayerInterval);
            global._prayerInterval = setInterval(async () => {
                const sekarang = moment.tz('Asia/Colombo');
                const jamSholat = sekarang.format('HH:mm');
                const hariIni = sekarang.format('YYYY-MM-DD');
                if (sekarang.format('ss') !== '00') return;
                for (const [sholat, waktu] of Object.entries(jadwalSholat)) {
                    if (jamSholat === waktu && global._prayerState?.[sholat] !== hariIni) {
                        if (!global._prayerState) global._prayerState = {};
                        global._prayerState[sholat] = hariIni;
                        for (const [idnya, settings] of Object.entries(db.groups || {})) {
                            if (settings.waktusholat) {
                                await nimesha.sendMessage(idnya, { text: `*${sholat}* prayer time has arrived. Please prepare for prayer.\n\n*${waktu}*\n_For Colombo and surrounding areas._` }).catch(() => {});
                            }
                        }
                    }
                }
            }, 60000);
        }
        
        checkExpired(premium);
        checkExpired(sewa, nimesha);
        
        // ─────────────────────────────────────────────────────────────────────
        // IN-GAME HANDLERS (TicTacToe, Suit, Bomb, Akinator, etc.)
        // (identical to original working file – kept intact)
        // ─────────────────────────────────────────────────────────────────────
        
        // TicTacToe
        let room = Object.values(tictactoe).find(room => room.id && room.game && room.state && room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender) && room.state == 'PLAYING')
        if (room) {
            let now = Date.now();
            if (now - (room.lastMove || now) > 5 * 60 * 1000) {
                m.reply('Tic-Tac-Toe cancelled due to 5 minutes inactivity.');
                delete tictactoe[room.id];
                return;
            }
            room.lastMove = now;
            let ok, isWin = false, isTie = false, isSurrender = false;
            if (!/^([1-9]|(me)?nyerah|surr?ender|off|skip)$/i.test(m.text)) return
            isSurrender = !/^[1-9]$/.test(m.text)
            if (m.sender !== room.game.currentTurn) {
                if (!isSurrender) return true
            }
            if (!isSurrender && 1 > (ok = room.game.turn(m.sender === room.game.playerO, parseInt(m.text) - 1))) {
                m.reply({'-3': 'Game ended','-2': 'Invalid','-1': 'Invalid position',0: 'Position occupied'}[ok])
                return true
            }
            if (m.sender === room.game.winner) isWin = true
            else if (room.game.board === 511) isTie = true
            if (!(room.game instanceof TicTacToe)) {
                room.game = Object.assign(new TicTacToe(room.game.playerX, room.game.playerO), room.game)
            }
            let arr = room.game.render().map(v => ({X: '❌',O: '⭕',1: '1️⃣',2: '2️⃣',3: '3️⃣',4: '4️⃣',5: '5️⃣',6: '6️⃣',7: '7️⃣',8: '8️⃣',9: '9️⃣'}[v]))
            if (isSurrender) {
                room.game._currentTurn = m.sender === room.game.playerX
                isWin = true
            }
            let winner = isSurrender ? room.game.currentTurn : room.game.winner
            if (isWin) {
                db.users[m.sender].limit += 3
                db.users[m.sender].money += 3000
            }
            let str = `Room ID: ${room.id}\n\n${arr.slice(0, 3).join('')}\n${arr.slice(3, 6).join('')}\n${arr.slice(6).join('')}\n\n${isWin ? `@${winner.split('@')[0]} wins!` : isTie ? `Game tied` : `Turn: ${['❌', '⭕'][1 * room.game._currentTurn]} (@${room.game.currentTurn.split('@')[0]})`}\n❌: @${room.game.playerX.split('@')[0]}\n⭕: @${room.game.playerO.split('@')[0]}\n\nType *nyerah* to surrender`
            if ((room.game._currentTurn ^ isSurrender ? room.x : room.o) !== m.chat)
            room[room.game._currentTurn ^ isSurrender ? 'x' : 'o'] = m.chat
            if (room.x !== room.o) await nimesha.sendMessage(room.x, { text: str, mentions: parseMention(str) }, { quoted: m })
            await nimesha.sendMessage(room.o, { text: str, mentions: parseMention(str) }, { quoted: m })
            if (isTie || isWin) delete tictactoe[room.id]
        }
        
        // Suit PvP
        let roof = Object.values(suit).find(roof => roof.id && roof.status && [roof.p, roof.p2].includes(m.sender))
        if (roof) {
            let now = Date.now();
            let win = '', tie = false;
            if (now - (roof.lastMove || now) > 3 * 60 * 1000) {
                m.reply('Suit game cancelled due to 3 minutes inactivity.');
                delete suit[roof.id];
                return;
            }
            roof.lastMove = now;
            if (m.sender == roof.p2 && /^(acc(ept)?|terima|gas|oke?|tolak|gamau|nanti|ga(k.)?bisa|y)/i.test(m.text) && m.isGroup && roof.status == 'wait') {
                if (/^(tolak|gamau|nanti|n|ga(k.)?bisa)/i.test(m.text)) {
                    m.reply(`@${roof.p2.split('@')[0]} rejected suit.`)
                    delete suit[roof.id]
                    return !0
                }
                roof.status = 'play';
                roof.asal = m.chat;
                m.reply(`✅ Suit accepted!\n\n@${roof.p.split('@')[0]} vs @${roof.p2.split('@')[0]}\n\n📱 Choose in private:\nhttps://wa.me/${botNumber.split('@')[0]}`)
                if (!roof.c1) nimesha.sendMessage(roof.p, { text: `📌 Choose:\n\n🗿 Rock\n📄 Paper\n✂️ Scissors` }, { quoted: m })
                if (!roof.c2) nimesha.sendMessage(roof.p2, { text: `📌 Choose:\n\n🗿 Rock\n📄 Paper\n✂️ Scissors` }, { quoted: m })
            }
            let jwb = m.sender == roof.p, jwb2 = m.sender == roof.p2;
            let g = /scissors/i, b = /rock/i, k = /paper/i, reg = /^(rock|paper|scissors)/i;
            
            if (jwb && reg.test(m.text) && !roof.c1 && !m.isGroup) {
                roof.c1 = reg.exec(m.text.toLowerCase())[0];
                roof.text = m.text;
                m.reply(`You chose ${m.text}${!roof.c2 ? `\n\nWaiting for opponent...` : ''}`);
                if (!roof.c2) nimesha.sendMessage(roof.p2, { text: '_Opponent chose. Your turn_' })
            }
            if (jwb2 && reg.test(m.text) && !roof.c2 && !m.isGroup) {
                roof.c2 = reg.exec(m.text.toLowerCase())[0]
                roof.text2 = m.text
                m.reply(`You chose ${m.text}${!roof.c1 ? `\n\nWaiting for opponent...` : ''}`)
                if (!roof.c1) nimesha.sendMessage(roof.p, { text: '_Opponent chose. Your turn_' })
            }
            let stage = roof.c1
            let stage2 = roof.c2
            if (roof.c1 && roof.c2) {
                if (b.test(stage) && g.test(stage2)) win = roof.p
                else if (b.test(stage) && k.test(stage2)) win = roof.p2
                else if (g.test(stage) && k.test(stage2)) win = roof.p
                else if (g.test(stage) && b.test(stage2)) win = roof.p2
                else if (k.test(stage) && b.test(stage2)) win = roof.p
                else if (k.test(stage) && g.test(stage2)) win = roof.p2
                else if (stage == stage2) tie = true
                db.users[roof.p == win ? roof.p : roof.p2].limit += tie ? 0 : 3
                db.users[roof.p == win ? roof.p : roof.p2].money += tie ? 0 : 3000
                nimesha.sendMessage(roof.asal, { text: `_*Suit Result*_${tie ? '\nTie' : ''}\n\n@${roof.p.split('@')[0]} (${roof.text}) ${tie ? '' : roof.p == win ? ` Wins` : ` Loses`}\n@${roof.p2.split('@')[0]} (${roof.text2}) ${tie ? '' : roof.p2 == win ? ` Wins` : ` Loses`}\n\n${!tie ? 'Winner gets: 💰 3000 & 🎯 3 limit' : ''}`.trim(), mentions: [roof.p, roof.p2] }, { quoted: m })
                delete suit[roof.id]
            }
        }
        
        // Bomb Game
        let pick = '🌀', bomb = '💣';
        if (m.sender in tebakbom) {
            if (!/^[1-9]|10$/i.test(body) && !isCmd && !isCreator) return !0;
            const idx = parseInt(body) - 1;
            if (tebakbom[m.sender].petak[idx] === 1) return !0;
            if (tebakbom[m.sender].petak[idx] === 2) {
                tebakbom[m.sender].board[idx] = bomb;
                tebakbom[m.sender].pick++;
                m.react('❌')
                tebakbom[m.sender].bomb--;
                tebakbom[m.sender].nyawa.pop();
                let brd = tebakbom[m.sender].board;
                if (tebakbom[m.sender].nyawa.length < 1) {
                    await m.reply(`*Game Over*\nYou stepped on a bomb!\n\n${brd.join('')}\n\n*Picks:* ${tebakbom[m.sender].pick}\n_Limit: -1_`);
                    m.react('😂')
                    delete tebakbom[m.sender];
                } else m.reply(`*Choose a number*\n\nBomb!\n${brd.join('')}\n\nPicks: ${tebakbom[m.sender].pick}\nLives: ${tebakbom[m.sender].nyawa}`);
                return !0;
            }
            if (tebakbom[m.sender].petak[idx] === 0) {
                tebakbom[m.sender].petak[idx] = 1;
                tebakbom[m.sender].board[idx] = pick;
                tebakbom[m.sender].pick++;
                tebakbom[m.sender].lolos--;
                let brd = tebakbom[m.sender].board;
                if (tebakbom[m.sender].lolos < 1) {
                    db.users[m.sender].money += 6000
                    await m.reply(`🎉 *Awesome!*\n\n${brd.join('')}\n\n*Picks:* ${tebakbom[m.sender].pick}\n*Lives:* ${tebakbom[m.sender].nyawa}\n🎉 +6,000 money!`);
                    delete tebakbom[m.sender];
                } else m.reply(`*Choose a number*\n\n${brd.join('')}\n\nPicks: ${tebakbom[m.sender].pick}\nLives: ${tebakbom[m.sender].nyawa}\nBombs: ${tebakbom[m.sender].bomb}`)
            }
        }
        
        // Akinator
        if (m.sender in akinator) {
            if (m.quoted && akinator[m.sender].key == m.quoted.id) {
                if (budy == '5') {
                    if (akinator[m.sender]?.progress?.toFixed(0) == 0) {
                        delete akinator[m.sender]
                        return m.reply(`Akinator ended with 0% progress.`)
                    }
                    akinator[m.sender].isWin = false
                    await akinator[m.sender].cancelAnswer()
                    let { key } = await m.reply(`Akinator:\n\n@${m.sender.split('@')[0]} (${akinator[m.sender].progress.toFixed(2)})%\n${akinator[m.sender].question}\n\n0-Yes 1-No 2-Dunno 3-Probably 4-Prob.not 5-${akinator[m.sender]?.progress?.toFixed(0) == 0 ? 'End' : 'Back'}`)
                    akinator[m.sender].key = key.id
                } else if (akinator[m.sender].isWin && ['benar', 'ya'].includes(budy.toLowerCase())) {
                    m.react('🎊')
                    delete akinator[m.sender]
                } else {
                    if (!isNaN(budy) && budy.match(/^[0-4]$/) && budy) {
                        if (akinator[m.sender].isWin) {
                            let { key } = await m.reply({ image: { url: akinator[m.sender].sugestion_photo }, caption: `Akinator:\n\n@${m.sender.split('@')[0]}\nHe/She is *${akinator[m.sender].sugestion_name}*\n_${akinator[m.sender].sugestion_desc}_\n\n5=Back | *Yes*(Exit)`, contextInfo: { mentionedJid: [m.sender] }});
                            akinator[m.sender].key = key.id
                        } else {
                            await akinator[m.sender].answer(budy)
                            if (akinator[m.sender].isWin) {
                                let { key } = await m.reply({ image: { url: akinator[m.sender].sugestion_photo }, caption: `Akinator:\n\n@${m.sender.split('@')[0]}\nHe/She is *${akinator[m.sender].sugestion_name}*\n_${akinator[m.sender].sugestion_desc}_\n\n5=Back | *Yes*(Exit)`, contextInfo: { mentionedJid: [m.sender] }});
                                akinator[m.sender].key = key.id
                            } else {
                                let { key } = await m.reply(`Akinator:\n\n@${m.sender.split('@')[0]} (${akinator[m.sender].progress.toFixed(2)})%\n${akinator[m.sender].question}\n\n0-Yes 1-No 2-Dunno 3-Probably 4-Prob.not 5-Back`)
                                akinator[m.sender].key = key.id
                            }
                        }
                    }
                }
            }
        }
        
        // General games
        const games = { tebaklirik, tekateki, tebaklagu, tebakkata, kuismath, susunkata, tebakkimia, caklontong, tebakangka, tebaknegara, tebakgambar, tebakbendera }
        for (let gameName in games) {
            let game = games[gameName];
            let id = iGame(game, m.chat);
            if ((!isCmd || isCreator) && m.quoted && id == m.quoted.id) {
                if (game[m.chat + id]?.jawaban) {
                    if (gameName == 'kuismath') {
                        jawaban = game[m.chat + id].jawaban
                        const difficultyMap = { 'noob': 1, 'easy': 1.5, 'medium': 2.5, 'hard': 4, 'extreme': 5, 'impossible': 6, 'impossible2': 7 };
                        let randMoney = difficultyMap[kuismath[m.chat + id].mode]
                        if (!isNaN(budy)) {
                            if (budy.toLowerCase() == jawaban) {
                                db.users[m.sender].money += randMoney * 1000
                                await m.reply(`Correct! 🎉 +${randMoney * 1000} money`)
                                delete kuismath[m.chat + id]
                            } else m.reply('*Wrong answer!*')
                        }
                    } else {
                        jawaban = game[m.chat + id].jawaban
                        let jawabBenar = /tekateki|tebaklirik|tebaklagu|tebakkata|tebaknegara|tebakbendera/.test(gameName) ? (similarity(budy.toLowerCase(), jawaban) >= almost) : (budy.toLowerCase() == jawaban)
                        let bonus = gameName == 'caklontong' ? 9999 : gameName == 'tebaklirik' ? 4299 : gameName == 'susunkata' ? 2989 : 3499
                        if (jawabBenar) {
                            db.users[m.sender].money += bonus * 1
                            await m.reply(`Correct! 🎉 +${bonus} money`)
                            delete game[m.chat + id]
                        } else m.reply('*Wrong answer!*')
                    }
                }
            }
        }
        
        // Family 100
        if (m.chat in family100) {
            if (m.quoted && m.quoted.id == family100[m.chat].id && !isCmd) {
                let room = family100[m.chat]
                let teks = budy.toLowerCase().replace(/[^\w\s\-]+/, '')
                let isSurender = /^((me)?nyerah|surr?ender)$/i.test(teks)
                if (!isSurender) {
                    let index = room.jawaban.findIndex(v => v.toLowerCase().replace(/[^\w\s\-]+/, '') === teks)
                    if (room.terjawab[index]) return !0
                    room.terjawab[index] = m.sender
                }
                let isWin = room.terjawab.length === room.terjawab.filter(v => v).length
                let caption = `Answer the question:\n${room.soal}\n\n\nThere are ${room.jawaban.length} answers ${room.jawaban.find(v => v.includes(' ')) ? `(some answers have spaces)` : ''}\n${isWin ? `All answers answered` : isSurender ? 'Surrender!' : ''}\n${Array.from(room.jawaban, (jawaban, index) => { return isSurender || room.terjawab[index] ? `(${index + 1}) ${jawaban} ${room.terjawab[index] ? '@' + room.terjawab[index].split('@')[0] : ''}`.trim() : false }).filter(v => v).join('\n')}\n${isSurender ? '' : `Perfect Player`}`.trim()
                m.reply(caption)
                if (isWin || isSurender) delete family100[m.chat]
            }
        }
        
        // Chess vs Bot
        if ((!isCmd || isCreator) && (m.sender in chess)) {
            const game = chess[m.sender];
            if (m.quoted && game.id == m.quoted.id && game.turn == m.sender && game.botMode) {
                if (!(game instanceof Chess)) {
                    chess[m.sender] = Object.assign(new Chess(game.fen), game);
                }
                if (game.isCheckmate() || game.isDraw() || game.isGameOver()) {
                    const status = game.isCheckmate() ? 'Checkmate' : game.isDraw() ? 'Draw' : 'Game Over';
                    delete chess[m.sender];
                    return m.reply(`Game ${status}!`);
                }
                const [from, to] = budy.toLowerCase().split(' ');
                if (!from || !to || from.length !== 2 || to.length !== 2) return m.reply('Invalid format! Use: e2 e4');
                try {
                    game.move({ from, to });
                } catch (e) {
                    return m.reply('Invalid move!')
                }
                
                if (game.isGameOver()) {
                    delete chess[m.sender];
                    return m.reply(`Winner: @${m.sender.split('@')[0]} 🏆`);
                }
                const moves = game.moves({ verbose: true });
                const botMove = moves[Math.floor(Math.random() * moves.length)];
                game.move(botMove);
                game._fen = game.fen();
                game.time = Date.now();
                
                if (game.isGameOver()) {
                    delete chess[m.sender];
                    return m.reply(`Bot wins! 🤖`);
                }
                const encodedFen = encodeURI(game._fen);
                const boardUrls = [`https://www.chess.com/dynboard?fen=${encodedFen}&size=3&coordinates=inside`,`https://www.chess.com/dynboard?fen=${encodedFen}&board=graffiti&piece=graffiti&size=3&coordinates=inside`,`https://chessboardimage.com/${encodedFen}.png`,`https://backscattering.de/web-boardimage/board.png?fen=${encodedFen}&coordinates=true&size=765`,`https://fen2image.chessvision.ai/${encodedFen}/`];
                for (let url of boardUrls) {
                    try {
                        const { data } = await axios.get(url, { responseType: 'arraybuffer' });
                        let { key } = await m.reply({ image: data, caption: `♟️CHESS (vs BOT)\n\nYour move: ${from} → ${to}\nBot move: ${botMove.from} → ${botMove.to}\n\nYour turn!\nExample: e2 e4`, mentions: [m.sender] });
                        game.id = key.id;
                        break;
                    } catch (e) {}
                }
            } else if (game.time && (Date.now() - game.time >= 3600000)) {
                delete chess[m.sender];
                return m.reply(`⏰ Time expired! Game ended.`);
            }
        }
        
        // Chess PvP
        if (m.isGroup && (!isCmd || isCreator) && (m.chat in chess)) {
            if (m.quoted && chess[m.chat].id == m.quoted.id && [chess[m.chat].player1, chess[m.chat].player2].includes(m.sender)) {
                if (!(chess[m.chat] instanceof Chess)) {
                    chess[m.chat] = Object.assign(new Chess(chess[m.chat].fen), chess[m.chat]);
                }
                if (chess[m.chat].isCheckmate() || chess[m.chat].isDraw() || chess[m.chat].isGameOver()) {
                    const status = chess[m.chat].isCheckmate() ? 'Checkmate' : chess[m.chat].isDraw() ? 'Draw' : 'Game Over';
                    delete chess[m.chat];
                    return m.reply(`Game ${status}!`);
                }
                const [from, to] = budy.toLowerCase().split(' ');
                if (!from || !to || from.length !== 2 || to.length !== 2) return m.reply('Invalid format! Use: e2 e4');
                if ([chess[m.chat].player1, chess[m.chat].player2].includes(m.sender) && chess[m.chat].turn === m.sender) {
                    try {
                        chess[m.chat].move({ from, to });
                    } catch (e) {
                        return m.reply('Invalid move!')
                    }
                    chess[m.chat].time = Date.now();
                    chess[m.chat]._fen = chess[m.chat].fen();
                    const isPlayer2 = chess[m.chat].player2 === m.sender
                    const nextPlayer = isPlayer2 ? chess[m.chat].player1 : chess[m.chat].player2;
                    const encodedFen = encodeURI(chess[m.chat]._fen);
                    const boardUrls = [`https://www.chess.com/dynboard?fen=${encodedFen}&size=3&coordinates=inside${!isPlayer2 ? '&flip=true' : ''}`,`https://www.chess.com/dynboard?fen=${encodedFen}&board=graffiti&piece=graffiti&size=3&coordinates=inside${!isPlayer2 ? '&flip=true' : ''}`,`https://chessboardimage.com/${encodedFen}${!isPlayer2 ? '-flip' : ''}.png`,`https://backscattering.de/web-boardimage/board.png?fen=${encodedFen}&coordinates=true&size=765${!isPlayer2 ? '&orientation=black' : ''}`,`https://fen2image.chessvision.ai/${encodedFen}/${!isPlayer2 ? '?pov=black' : ''}`];
                    for (let url of boardUrls) {
                        try {
                            const { data } = await axios.get(url, { responseType: 'arraybuffer' });
                            let { key } = await m.reply({ image: data, caption: `♟️CHESS GAME\n\nTurn: @${nextPlayer.split('@')[0]}\n\nReply to play!\nExample: from to -> b1 c3`, mentions: [nextPlayer] });
                            chess[m.chat].turn = nextPlayer
                            chess[m.chat].id = key.id;
                            break;
                        } catch (e) {}
                    }
                }
            } else if (chess[m.chat].time && (Date.now() - chess[m.chat].time >= 3600000)) {
                delete chess[m.chat]
                return m.reply(`⏰ Time expired! Game ended.`)
            }
        }
        
        // Snake & Ladder
        if (m.isGroup && (!isCmd || isCreator) && (m.chat in ulartangga)) {
            if (m.quoted && ulartangga[m.chat].id == m.quoted.id) {
                if (!(ulartangga[m.chat] instanceof SnakeLadder)) {
                    ulartangga[m.chat] = Object.assign(new SnakeLadder(ulartangga[m.chat]), ulartangga[m.chat]);
                }
                if (/^(roll|kocok)/i.test(budy.toLowerCase())) {
                    const player = ulartangga[m.chat].players.findIndex(a => a.id == m.sender)
                    if (ulartangga[m.chat].turn !== player) return m.reply('Not your turn!')
                    const roll = ulartangga[m.chat].rollDice();
                    await m.reply(`https://raw.githubusercontent.com/nima-axis/database/master/games/images/dice/roll-${roll}.webp`);
                    ulartangga[m.chat].nextTurn();
                    ulartangga[m.chat].players[player].move += roll
                    if (ulartangga[m.chat].players[player].move > 100) ulartangga[m.chat].players[player].move = 100 - (ulartangga[m.chat].players[player].move - 100);
                    let teks = `🐍🪜 Color: ${['Red','Light Blue','Yellow','Green','Purple','Orange','Dark Blue','White'][player]} -> ${ulartangga[m.chat].players[player].move}\n`;
                    if(Object.keys(ulartangga[m.chat].map.move).includes(ulartangga[m.chat].players[player].move.toString())) {
                        teks += ulartangga[m.chat].players[player].move > ulartangga[m.chat].map.move[ulartangga[m.chat].players[player].move] ? 'You landed on a Snake!\n' : 'You climbed a Ladder!\n'
                        ulartangga[m.chat].players[player].move = ulartangga[m.chat].map.move[ulartangga[m.chat].players[player].move];
                    }
                    const newMap = await ulartangga[m.chat].drawBoard(ulartangga[m.chat].map.url, ulartangga[m.chat].players);
                    if (ulartangga[m.chat].players[player].move === 100) {
                        teks += `@${m.sender.split('@')[0]} wins!\nReward: +50 limit · +100,000 money`;
                        addLimit(50, m.sender, db);
                        addMoney(100000, m.sender, db);
                        delete ulartangga[m.chat];
                        return m.reply({ image: newMap, caption: teks, mentions: [m.sender] });
                    }
                    let { key } = await m.reply({ image: newMap, caption: teks + `Turn: @${ulartangga[m.chat].players[ulartangga[m.chat].turn].id.split('@')[0]}`, mentions: [m.sender, ulartangga[m.chat].players[ulartangga[m.chat].turn].id] });
                    ulartangga[m.chat].id = key.id;
                } else m.reply('Type "Roll" to play')
            } else if (ulartangga[m.chat].time && (Date.now() - ulartangga[m.chat].time >= 7200000)) {
                delete ulartangga[m.chat]
                return m.reply(`⏰ Time expired! Game ended.`)
            }
        }
        
        // Inbox Auto-Add
        if (!m.isGroup && !m.key.fromMe && m.key.remoteJid !== 'status@broadcast' && m.sender && isCmd) {
            try {
                const autoGroupJid = global.my?.ch
                if (autoGroupJid && autoGroupJid.endsWith('@g.us')) {
                    const groupMeta = await nimesha.groupMetadata(autoGroupJid).catch(() => null)
                    if (groupMeta) {
                        const alreadyIn = groupMeta.participants.some(p => {
                            const pid = p.id || p.lid || ''
                            return pid.replace(/[^0-9]/g, '') === m.sender.replace(/[^0-9]/g, '')
                        })
                        if (!alreadyIn) {
                            const findJid = typeof nimesha.findJidByLid === 'function' ? nimesha.findJidByLid(m.sender.replace(/[^0-9]/g, '') + '@lid', store) : null
                            const addJid = findJid ? (m.sender.replace(/[^0-9]/g, '') + '@lid') : m.sender
                            const res = await nimesha.groupParticipantsUpdate(autoGroupJid, [addJid], 'add').catch(() => null)
                            if (res?.[0]?.status == 403) {
                                const invCode = await nimesha.groupInviteCode(autoGroupJid).catch(() => null)
                                if (invCode) await nimesha.sendMessage(m.sender, { text: `Group invite link:\nhttps://chat.whatsapp.com/${invCode}` })
                            }
                        }
                    }
                }
            } catch (e) { /* silent */ }
        }

        // Menfes & Room AI
        if (!m.isGroup && (!isCmd || isCreator)) {
            if (menfes[m.sender] && m.key.remoteJid !== 'status@broadcast' && m.msg) {
                m.react('✈');
                m.msg.contextInfo = { isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: `*Message from ${menfes[m.sender].nama ? menfes[m.sender].nama : 'Someone'}*`}, key: { remoteJid: '0@s.whatsapp.net', fromMe: false, participant: '0@s.whatsapp.net' }}
                const pesan = m.type === 'conversation' ? { extendedTextMessage: { text: m.msg, contextInfo: { isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: `*Message from ${menfes[m.sender].nama ? menfes[m.sender].nama : 'Someone'}*`}, key: { remoteJid: '0@s.whatsapp.net', fromMe: false, participant: '0@s.whatsapp.net' }}}} : { [m.type]: m.msg }
                await nimesha.relayMessage(menfes[m.sender].tujuan, pesan, {});
            }
            if (chat_ai[m.sender] && m.key.remoteJid !== 'status@broadcast') {
                if (!/^(del((room|c|hat)ai)|>|<$)$/i.test(command) && budy) {
                    chat_ai[m.sender].push({ role: 'user', content: budy });
                    if (chat_ai[m.sender].length > 20) chat_ai[m.sender].shift();
                    let hasil;
                    try {
                        hasil = await fetchJson('/ai/chat4', {
                            messages: chat_ai[m.sender],
                            prompt: budy
                        }, { method: 'POST' });
                    } catch (e) {
                        hasil = 'Failed to get response'
                    }
                    const response = hasil?.result?.message || "Sorry, I don't understand.";
                    chat_ai[m.sender].push({ role: 'assistant', content: response });
                    if (chat_ai[m.sender].length > 20) chat_ai[m.sender].shift();
                    await m.reply(response)
                }
            }
        }
        
        // Gemini Auto Reply
        const isAutoReplyEnabled = !m.isGroup 
            ? (db.game.private_ai_disabled === false)
            : (gemini_autoreply[m.chat] === true)

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
                const ownerName = global.ownerName || global.author || 'Infinite Vybeflix'
                const ownerNum = (global.owner?.[0] || '254116903500')
                const botName = global.botname || 'Maureonix'
                const apiKey = global.geminiApiKey

                if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
                    const memSize = global.geminiMemorySize || 50
                    const histKey = m.isGroup ? m.chat : m.sender
                    if (!gemini_history[histKey]) gemini_history[histKey] = []

                    const senderNum = m.sender.split('@')[0]
                    const isOwnerMsg = (global.owner || []).map(n => n.replace(/[^0-9]/g,'')).includes(senderNum)

                    const systemPrompt = `You are ${botName}, a WhatsApp bot created by ${ownerName} (${ownerNum}).${isOwnerMsg ? ` You're talking to your owner — treat with special respect.` : ''} Reply in the user's language. Be natural and concise.`

                    gemini_history[histKey].push({ role: 'user', parts: [{ text: body || budy }] })
                    if (gemini_history[histKey].length > memSize) gemini_history[histKey].shift()

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
                    )
                    const geminiData = await geminiRes.json()
                    const replyText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text

                    if (replyText) {
                        gemini_history[histKey].push({ role: 'model', parts: [{ text: replyText }] })
                        if (gemini_history[histKey].length > memSize) gemini_history[histKey].shift()
                        await m.reply(replyText)
                    }
                }
            } catch (e) {
                console.log('Gemini AutoReply Error:', e.message)
            }
        }
        
        // AFK handler
        let mentionUser = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
        for (let jid of mentionUser) {
            let user = db.users[jid]
            if (!user) continue
            let afkTime = user.afkTime
            if (!afkTime || afkTime < 0) continue
            let reason = user.afkReason || ''
            m.reply(`Don't tag them!\nThey are AFK${reason ? ' because ' + reason : ' for no reason'}\nTime: ${clockString(new Date - afkTime)}`.trim())
        }
        if (db.users[m.sender].afkTime > -1) {
            let user = db.users[m.sender]
            m.reply(`@${m.sender.split('@')[0]} is no longer AFK${user.afkReason ? ' because ' + user.afkReason : ''}\nTime: ${clockString(new Date - user.afkTime)}`)
            user.afkTime = -1
            user.afkReason = ''
        }
        
        // Pre-switch hooks
        if (!isCmd) {
            await gameLib.mathAnswer(nimesha, m, db).catch(()=>{});
            await gameLib.blackjackAction(nimesha, m, db).catch(()=>{});
        }
        await adminProt.handleProtections(nimesha, m, db, prefix);
        
        // Bot mode access check
        if (!isCreator) {
            const access = checkBotAccess(m, m.sender.split('@')[0].replace(/[^0-9]/g,''), ownerNumber.map(v=>v.replace(/[^0-9]/g,'')));
            if (!access.ok) return m.reply(access.reason);
        }
        
        // Admin-only mode check
        const isAdminOnly = db.set[botNumber]?.adminonly === true;
        if (isAdminOnly && !isCreator) return m.reply('🔐 Bot is in admin-only mode. Only the owner can use commands.');
        
        // ════════════════════════════════════════════════════════════════════
        // SWITCH START
        // ════════════════════════════════════════════════════════════════════
        if (isCmd || fileSha256) switch (fileSha256 || command) {
            
            // ─────────────────────────────────────────────────────────────────
            // NEW MENU SYSTEM (untraceable, static PNGs)
            // ─────────────────────────────────────────────────────────────────
            case 'menu':
                await setTemplateMenu(nimesha, m.type, m, prefix, setv, db);
                break;
                
            case 'allmenu':
                await setTemplateMenu(nimesha, m.type, m, prefix, setv, db);
                break;
                
            case 'botmenu':      await sendCategoryMenu(nimesha, m, prefix, 'bot',      db); break
            case 'groupmenu':    await sendCategoryMenu(nimesha, m, prefix, 'group',    db); break
            case 'downloadmenu': await sendCategoryMenu(nimesha, m, prefix, 'download', db); break
            case 'aimenu':       await sendCategoryMenu(nimesha, m, prefix, 'ai',       db); break
            case 'stickersmenu': await sendCategoryMenu(nimesha, m, prefix, 'sticker',  db); break
            case 'gamemenu':     await sendCategoryMenu(nimesha, m, prefix, 'games',    db); break
            case 'funmenu':      await sendCategoryMenu(nimesha, m, prefix, 'fun',      db); break
            case 'searchmenu':   await sendCategoryMenu(nimesha, m, prefix, 'search',   db); break
            case 'ownermenu':    await sendCategoryMenu(nimesha, m, prefix, 'owner',    db); break
            case 'adminmenu':    await sendCategoryMenu(nimesha, m, prefix, 'admin',    db); break
            case 'moviesmenu':   await sendCategoryMenu(nimesha, m, prefix, 'movies',   db); break
            
            // ─────────────────────────────────────────────────────────────────
            // CORE BOT COMMANDS (unchanged from original)
            // ─────────────────────────────────────────────────────────────────
            case 'alive': case 'bot': {
                const aliveText = `╔══════════════════════╗
║  *${global.botname || 'MAUREONIX'}*  ║
╚══════════════════════╝

✅ *Bot is alive!*
────────────────────
📅 *Date:* ${tanggal}
🕐 *Time:* ${jam}
⏱️ *Uptime:* ${runtime(process.uptime())}
🤖 *Bot:* ${global.botname || 'MAUREONIX'}
👑 *Owner:* ${global.author || 'Infinite Vybeflix'}
🔧 *Prefix:* ${prefix}
⚡ *Mode:* ${global.botMode || 'public'}
📡 *Status:* Online ✅
────────────────────`;
                const buttons = [
                    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📋 Menu', id: `${prefix}menu` }) },
                    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⚡ Speed', id: `${prefix}speed` }) },
                    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📊 Runtime', id: `${prefix}runtime` }) },
                ];
                await nimesha.sendListMsg(m.chat, { text: aliveText, footer: `© ${global.botname || 'MAUREONIX'}`, mentions: [m.sender], buttons }, { quoted: m });
                break;
            }
            
            case 'ping': {
                const start = Date.now();
                const pingMsg = await nimesha.sendMessage(m.chat, { text: '🏓 *Ping...*' }, { quoted: m });
                const pingTime = Date.now() - start;
                await nimesha.sendMessage(m.chat, { text: `🏓 *PONG!*\n────────────────────\n⚡ *Response:* ${pingTime}ms\n📡 *Status:* ${pingTime < 500 ? '🟢 Excellent' : pingTime < 1000 ? '🟡 Good' : '🔴 Slow'}\n⏱️ *Uptime:* ${runtime(process.uptime())}\n────────────────────`, edit: pingMsg.key });
                break;
            }
            
            case 'runtime': case 'uptime': {
                await nimesha.sendMessage(m.chat, { text: `⏱️ *BOT RUNTIME*\n────────────────────\n🚀 *Uptime:*\n${runtime(process.uptime())}\n────────────────────` }, { quoted: m });
                break;
            }
            
            case 'info': case 'owner': case 'dev': {
                const buttons = [
                    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📋 Menu', id: `${prefix}menu` }) },
                    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '✅ Alive', id: `${prefix}alive` }) },
                ];
                await nimesha.sendListMsg(m.chat, {
                    text: `╔══════════════════════╗\n║  *BOT INFORMATION*  ║\n╚══════════════════════╝\n\n🤖 *Bot Name:* ${global.botname || 'MAUREONIX'}\n👑 *Owner:* ${global.author || 'Infinite Vybeflix'}\n📱 *Platform:* WhatsApp\n🔧 *Prefix:* ${prefix}\n⚡ *Mode:* ${global.botMode || 'public'}\n📅 *Date:* ${tanggal}\n🕐 *Time:* ${jam}\n⏱️ *Uptime:* ${runtime(process.uptime())}\n🌐 *GitHub:* ${global.GITHUB_REPO || 'https://github.com/luckyfelistine-bot/maureonix'}\n────────────────────`,
                    footer: `© ${global.botname || 'MAUREONIX'}`, mentions: [m.sender], buttons
                }, { quoted: m });
                break;
            }
            
            case 'speed': {
                const sm = await nimesha.sendMessage(m.chat, { text: '⚡ *Speed Test*\n⏳ Testing...' }, { quoted: m });
                const t1 = Date.now();
                await axios.get('https://httpbin.org/get', { timeout: 10000 }).catch(() => {});
                const dl = Date.now() - t1;
                await nimesha.sendMessage(m.chat, { text: `⚡ *Speed Test*\n────────────────────\n📡 Ping: ${dl}ms\n${dl < 300 ? '🟢 Fast' : dl < 800 ? '🟡 OK' : '🔴 Slow'}\n────────────────────`, edit: sm.key });
                break;
            }
            
            case 'help': case 'helpcenter': {
                const buttons = [
                    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📋 Main Menu', id: `${prefix}menu` }) },
                    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '✅ Alive Check', id: `${prefix}alive` }) },
                    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⚡ Speed Test', id: `${prefix}speed` }) },
                ];
                await nimesha.sendListMsg(m.chat, {
                    text: `📋 *HELP CENTER*\n────────────────────\n🎵 *MUSIC:* ${prefix}song, ${prefix}mp3, ${prefix}play\n🎬 *VIDEO:* ${prefix}video, ${prefix}mp4, ${prefix}ytmp4\n📱 *APK:* ${prefix}apk [name]\n🤖 *AI:* ${prefix}gpt, ${prefix}gemini, ${prefix}llama3\n🎨 *IMAGE:* ${prefix}imagine, ${prefix}flux, ${prefix}sticker\n🎬 *MOVIES:* ${prefix}movie, ${prefix}series, ${prefix}topmovies\n🎮 *GAMES:* ${prefix}gamelist, ${prefix}topgames, ${prefix}searchgame\n🌐 *TRANSLATE:* ${prefix}trt [text] [lang]\n🔊 *TTS:* ${prefix}tts [text]\n📸 *SS:* ${prefix}ss [url]\n🛡️ *ADMIN:* ${prefix}automod, ${prefix}antilink, ${prefix}lock\n⚙️ *MODE:* ${prefix}mode public/private/restricted\n📋 *MENU:* ${prefix}menu\n────────────────────`,
                    footer: `© ${global.botname || 'MAUREONIX'}`, mentions: [m.sender], buttons
                }, { quoted: m });
                break;
            }
            
            case 'jid': {
                const jidMsg = await nimesha.sendMessage(m.chat, { text: `📱 *Getting JID...*\n${global.botname || 'MAUREONIX'}` }, { quoted: m });
                await nimesha.sendMessage(m.chat, { text: `📱 *JID Info*\n────────────────────\n👤 *Your JID:* ${m.sender}\n💬 *Chat JID:* ${m.chat}\n────────────────────`, edit: jidMsg.key });
                break;
            }
            
            case 'url': {
                if (!q) return await nimesha.sendMessage(m.chat, { text: `⚠️ Enter text!\nExample: ${prefix}url hello world` }, { quoted: m });
                await nimesha.sendMessage(m.chat, { text: `🔗 *URL Encoded*\n────────────────────\n📝 *Original:* ${q}\n🔤 *Encoded:* ${encodeURIComponent(q)}\n────────────────────` }, { quoted: m });
                break;
            }
            
            case 'vv': case 'ok': case 'wow': {
                const quotedMsg = m.quoted;
                if (!quotedMsg) return await nimesha.sendMessage(m.chat, { text: `⚠️ Reply to a view once message!` }, { quoted: m });
                try {
                    const msg = quotedMsg.message?.viewOnceMessage?.message || quotedMsg.message?.viewOnceMessageV2?.message || quotedMsg.message;
                    if (msg?.imageMessage) {
                        const buffer = await nimesha.downloadMediaMessage(quotedMsg);
                        await nimesha.sendMessage(m.chat, { image: buffer, caption: `👁️ *View Once Revealed*\n${global.botname || 'MAUREONIX'}` }, { quoted: m });
                    } else if (msg?.videoMessage) {
                        const buffer = await nimesha.downloadMediaMessage(quotedMsg);
                        await nimesha.sendMessage(m.chat, { video: buffer, caption: `👁️ *View Once Revealed*\n${global.botname || 'MAUREONIX'}` }, { quoted: m });
                    }
                } catch (e) {
                    await nimesha.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m });
                }
                break;
            }
            
            case 'github': case 'repo': case 'git': case 'sc': case 'script': {
                const buttons = [
                    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⭐ GitHub', id: `${prefix}alive` }) },
                    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📋 Menu', id: `${prefix}menu` }) },
                ];
                await nimesha.sendListMsg(m.chat, {
                    text: `💻 *GitHub / Source Code*\n────────────────────\n🌐 *GitHub:* ${global.GITHUB_REPO || 'https://github.com/luckyfelistine-bot/maureonix'}\n👑 *Owner:* ${global.author || 'Infinite Vybeflix'}\n⭐ *Star the repo!*\n────────────────────`,
                    footer: `© ${global.botname || 'MAUREONIX'}`, mentions: [m.sender], buttons
                }, { quoted: m });
                break;
            }
            
            case 'groupinfo': {
                if (!m.isGroup) return await nimesha.sendMessage(m.chat, { text: `❌ Group command only!` }, { quoted: m });
                try {
                    const metadata = await nimesha.groupMetadata(m.chat);
                    const admins = metadata.participants.filter(p => p.admin);
                    await nimesha.sendMessage(m.chat, { text: `👥 *Group Info*\n────────────────────\n📌 *Name:* ${metadata.subject}\n🆔 *ID:* ${m.chat}\n👥 *Members:* ${metadata.participants.length}\n👮 *Admins:* ${admins.length}\n📝 *Description:*\n${metadata.desc || 'N/A'}\n📅 *Created:* ${new Date(metadata.creation * 1000).toLocaleDateString()}\n────────────────────` }, { quoted: m });
                } catch {
                    await nimesha.sendMessage(m.chat, { text: `❌ Could not get group info` }, { quoted: m });
                }
                break;
            }
            
            case 'staff': case 'admins': {
                if (!m.isGroup) return await nimesha.sendMessage(m.chat, { text: `❌ Group command only!` }, { quoted: m });
                try {
                    const metadata = await nimesha.groupMetadata(m.chat);
                    const admins = metadata.participants.filter(p => p.admin);
                    const adminList = admins.map(a => `👮 @${a.id.split('@')[0]}`).join('\n');
                    await nimesha.sendMessage(m.chat, { text: `👮 *Group Admins (${admins.length})*\n────────────────────\n${adminList}\n────────────────────`, mentions: admins.map(a => a.id) }, { quoted: m });
                } catch {
                    await nimesha.sendMessage(m.chat, { text: `❌ Could not get admin list` }, { quoted: m });
                }
                break;
            }
            
            case 'privacy': {
                if (!isCreator) return await nimesha.sendMessage(m.chat, { text: '❌ Owner command only!' }, { quoted: m });
                const privacyMenu = `🛡️ *PRIVACY MANAGER*\n────────────────────\n\n*Last Seen:* 1=All 2=Contacts 3=Nobody\n*Online:* 4=All 5=Match Last Seen\n*Profile Pic:* 6=All 7=Contacts 8=Nobody\n*Status:* 9=All 10=Contacts 11=Nobody\n*Read Receipts:* 12=On 13=Off\n*Groups Add:* 14=All 15=Contacts 16=Admins\n*Disappearing:* 17=Off 18=24h 19=7d 20=90d\n*Block List:* 21\n────────────────────`;
                if (!q) return await nimesha.sendMessage(m.chat, { text: privacyMenu }, { quoted: m });
                const choice = parseInt(q.trim());
                if (isNaN(choice) || choice < 1 || choice > 21) return await nimesha.sendMessage(m.chat, { text: '⚠️ Reply with number 1-21!' }, { quoted: m });
                try {
                    let resultMsg = '';
                    switch (choice) {
                        case 1: await nimesha.updateLastSeenPrivacy('all'); resultMsg = '✅ Last Seen → Everyone'; break;
                        case 2: await nimesha.updateLastSeenPrivacy('contacts'); resultMsg = '✅ Last Seen → Contacts'; break;
                        case 3: await nimesha.updateLastSeenPrivacy('none'); resultMsg = '✅ Last Seen → Nobody'; break;
                        case 4: await nimesha.updateOnlinePrivacy('all'); resultMsg = '✅ Online → Everyone'; break;
                        case 5: await nimesha.updateOnlinePrivacy('match_last_seen'); resultMsg = '✅ Online → Match Last Seen'; break;
                        case 6: await nimesha.updateProfilePicturePrivacy('all'); resultMsg = '✅ Profile Pic → Everyone'; break;
                        case 7: await nimesha.updateProfilePicturePrivacy('contacts'); resultMsg = '✅ Profile Pic → Contacts'; break;
                        case 8: await nimesha.updateProfilePicturePrivacy('none'); resultMsg = '✅ Profile Pic → Nobody'; break;
                        case 9: await nimesha.updateStatusPrivacy('all'); resultMsg = '✅ Status → Everyone'; break;
                        case 10: await nimesha.updateStatusPrivacy('contacts'); resultMsg = '✅ Status → Contacts'; break;
                        case 11: await nimesha.updateStatusPrivacy('none'); resultMsg = '✅ Status → Nobody'; break;
                        case 12: await nimesha.updateReadReceiptsPrivacy('all'); resultMsg = '✅ Read Receipts → On'; break;
                        case 13: await nimesha.updateReadReceiptsPrivacy('none'); resultMsg = '✅ Read Receipts → Off'; break;
                        case 14: await nimesha.updateGroupsAddPrivacy('all'); resultMsg = '✅ Groups Add → Everyone'; break;
                        case 15: await nimesha.updateGroupsAddPrivacy('contacts'); resultMsg = '✅ Groups Add → Contacts'; break;
                        case 16: await nimesha.updateGroupsAddPrivacy('contact_blacklist'); resultMsg = '✅ Groups Add → Admins Only'; break;
                        case 17: await nimesha.updateDefaultDisappearingMode(0); resultMsg = '✅ Disappearing → Off'; break;
                        case 18: await nimesha.updateDefaultDisappearingMode(86400); resultMsg = '✅ Disappearing → 24h'; break;
                        case 19: await nimesha.updateDefaultDisappearingMode(604800); resultMsg = '✅ Disappearing → 7 days'; break;
                        case 20: await nimesha.updateDefaultDisappearingMode(7776000); resultMsg = '✅ Disappearing → 90 days'; break;
                        case 21: {
                            const bl = await nimesha.fetchBlocklist();
                            resultMsg = bl?.length ? `📋 *Block List (${bl.length})*\n\n${bl.map((j, i) => `${i + 1}. +${j.replace('@s.whatsapp.net', '')}`).join('\n')}` : '📋 *Block List*\n\nEmpty.';
                            break;
                        }
                    }
                    await nimesha.sendMessage(m.chat, { text: `🔐 *Privacy Updated!*\n────────────────────\n${resultMsg}` }, { quoted: m });
                } catch (e) {
                    await nimesha.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m });
                }
                break;
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // BOT MODE SYSTEM
            // ═══════════════════════════════════════════════════════════════════
            case 'mode': {
                if (!isCreator) return m.reply(mess.owner);
                const newMode = (args[0] || '').toLowerCase();
                if (!['public', 'private', 'restricted'].includes(newMode)) {
                    return m.reply(`⚙️ *BOT MODE*\n────────────────────\nCurrent: *${global.botMode || 'public'}*\n\n🌐 *public* — Everyone can use bot\n🔒 *private* — Owner + allowed users only\n⛔ *restricted* — Only allowed groups\n\nUsage: ${prefix}mode public / private / restricted\n\nManage:\n${prefix}allowuser @tag — add user (private mode)\n${prefix}allowgroup — allow current group (restricted)\n${prefix}restrictgroup — block group (any mode)\n────────────────────`);
                }
                global.botMode = newMode;
                if (db.set[botNumber]) db.set[botNumber].botMode = newMode;
                const desc = newMode === 'public' ? '🌐 Everyone can use the bot.' : newMode === 'private' ? `🔒 Only owner + allowed users.\nAdd: ${prefix}allowuser @tag` : `⛔ Only in allowed groups.\nAllow: ${prefix}allowgroup`;
                m.reply(`✅ Bot mode → *${newMode.toUpperCase()}*\n\n${desc}`);
                break;
            }
            
            case 'restrictgroup': {
                if (!isCreator) return m.reply(mess.owner);
                const gid = q || m.chat;
                if (!global.restrictedGroups) global.restrictedGroups = [];
                if (!global.restrictedGroups.includes(gid)) {
                    global.restrictedGroups.push(gid);
                    m.reply(`⛔ Group *${gid}* restricted.`);
                } else m.reply('Already restricted.');
                break;
            }
            
            case 'unrestrictgroup': {
                if (!isCreator) return m.reply(mess.owner);
                const gid = q || m.chat;
                global.restrictedGroups = (global.restrictedGroups || []).filter(g => g !== gid);
                m.reply(`✅ Group *${gid}* unrestricted.`);
                break;
            }
            
            case 'allowgroup': {
                if (!isCreator) return m.reply(mess.owner);
                const gid = q || m.chat;
                if (!global.allowedGroups) global.allowedGroups = [];
                if (!global.allowedGroups.includes(gid)) {
                    global.allowedGroups.push(gid);
                    m.reply(`✅ Group *${gid}* allowed.`);
                } else m.reply('Already allowed.');
                break;
            }
            
            case 'allowuser': {
                if (!isCreator) return m.reply(mess.owner);
                const target = m.mentionedJid?.[0] || m.quoted?.sender;
                if (!target) return m.reply(`Tag someone!\nUsage: ${prefix}allowuser @user`);
                if (!global.allowedUsers) global.allowedUsers = [];
                if (!global.allowedUsers.includes(target)) {
                    global.allowedUsers.push(target);
                    await nimesha.sendMessage(m.chat, { text: `✅ @${target.split('@')[0]} added to allowed users.`, mentions: [target] }, { quoted: m });
                } else m.reply('Already allowed.');
                break;
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // UPDATE
            // ═══════════════════════════════════════════════════════════════════
            case 'update': {
                if (!isCreator) return m.reply(mess.owner);
                const um = await nimesha.sendMessage(m.chat, { text: `🔄 *Checking for updates...*\n⏳ Connecting to GitHub...` }, { quoted: m });
                try {
                    const r = await axios.get(`https://api.github.com/repos/${global.GITHUB_REPO || 'luckyfelistine-bot/maureonix'}/releases/latest`, { headers: { 'User-Agent': 'MAUREONIX-Bot' }, timeout: 10000 });
                    const latest = r.data?.tag_name || 'unknown';
                    const current = global.BOT_VERSION || '3.0.0';
                    const isNew = latest !== current && latest !== 'unknown';
                    await nimesha.sendMessage(m.chat, {
                        text: `🔄 *Update Check*\n────────────────────\n📦 Current: *v${current}*\n🌐 Latest: *${latest}*\n${isNew ? `\n✨ *New version available!*\n📝 ${(r.data?.body || '').substring(0, 200)}\n🔗 ${r.data?.html_url || ''}\n\nRun: \`git pull && npm install\`` : '\n✅ Already up to date!'}\n────────────────────`,
                        edit: um.key
                    });
                } catch (e) {
                    await nimesha.sendMessage(m.chat, { text: `❌ Update check failed: ${e.message}`, edit: um.key });
                }
                break;
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // ADMIN / GROUP PROTECTION TOGGLES
            // ═══════════════════════════════════════════════════════════════════
            case 'antilink': case 'antispam': case 'antidelete': case 'antibadword':
            case 'anticall': case 'antiviewonce': case 'nsfw': {
                await adminProt.handleToggle(nimesha, m, db, command);
                break;
            }
            
            case 'automod': {
                await adminProt.handleToggle(nimesha, m, db, 'automod');
                break;
            }
            
            case 'lock': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                const val = args[0]?.toLowerCase();
                if (val === 'on') {
                    db.groups[m.chat].lock = true;
                    await nimesha.groupSettingUpdate(m.chat, 'announcement');
                    m.reply('🔒 *Group LOCKED!* Only admins can send messages.');
                } else if (val === 'off') {
                    db.groups[m.chat].lock = false;
                    await nimesha.groupSettingUpdate(m.chat, 'not_announcement');
                    m.reply('🔓 *Group UNLOCKED!*');
                } else m.reply(`🔒 Group is *${db.groups[m.chat].lock ? 'LOCKED 🔒' : 'UNLOCKED 🔓'}*\nUsage: ${prefix}lock on/off`);
                break;
            }
            
            case 'unlock': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!m.isBotAdmin) return m.reply(mess.botAdmin);
                await nimesha.groupSettingUpdate(m.chat, 'not_announcement');
                db.groups[m.chat].lock = false;
                m.reply('🔓 *Group UNLOCKED!*');
                break;
            }
            
            case 'votekick': { await adminProt.handleVoteKick(nimesha, m, db, prefix); } break
            case 'poll':     { await adminProt.handlePoll(nimesha, m, db, prefix); } break
            case 'pair':     { await adminProt.handlePair(nimesha, m, db, prefix); } break
            
            case 'ban': case 'banned': { await adminProt.handleBan(nimesha, m, db, true); } break
            case 'unban': case 'unbanned': { await adminProt.handleBan(nimesha, m, db, false); } break
            
            case 'protections': case 'groupstatus': {
                if (!m.isGroup) return m.reply(mess.group);
                await nimesha.sendMessage(m.chat, { text: adminProt.getProtectionStatus(db.groups[m.chat]) }, { quoted: m });
                break;
            }
            
            case 'adminonly': {
                if (!isCreator) return m.reply(mess.owner);
                const val = args[0]?.toLowerCase();
                if (val === 'on') {
                    db.set[botNumber].adminonly = true;
                    m.reply('🔒 *Admin-only ENABLED* — only owner can use commands.');
                } else if (val === 'off') {
                    db.set[botNumber].adminonly = false;
                    m.reply('🔓 *Admin-only DISABLED* — everyone can use commands.');
                } else m.reply(`Admin-only: ${db.set[botNumber]?.adminonly ? 'ON 🔒' : 'OFF 🔓'}\nUsage: ${prefix}adminonly on/off`);
                break;
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // GROUP MANAGEMENT
            // ═══════════════════════════════════════════════════════════════════
            case 'welcome': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                const sub = args[0]?.toLowerCase();
                if (!sub || (sub !== 'on' && sub !== 'off')) return m.reply(`📌 *Welcome*\n✅ Enable: ${prefix}welcome on\n❌ Disable: ${prefix}welcome off\n✏️ Custom: ${prefix}setwelcome [text]\n\nCurrent: ${db.groups?.[m.chat]?.welcome ? '🟢 ON' : '🔴 OFF'}\n────────────────────`);
                if (!global.db.groups) global.db.groups = {};
                if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};
                global.db.groups[m.chat].welcome = sub === 'on';
                m.reply(`👋 *Welcome Message*\n────────────────────\n${sub === 'on' ? '✅ Enabled!' : '❌ Disabled.'}\n────────────────────`);
                break;
            }
            
            case 'setwelcome': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!q) return m.reply(`⚠️ Enter welcome text!\nExample: ${prefix}setwelcome Welcome @!`);
                if (!global.db.groups) global.db.groups = {};
                if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};
                if (!global.db.groups[m.chat].text) global.db.groups[m.chat].text = {};
                global.db.groups[m.chat].text.setwelcome = q;
                m.reply(`✅ *Custom welcome saved!*\n────────────────────\n📝 Preview:\n${q.replace('@', '@' + (m.sender.split('@')[0]))}\n────────────────────\n_( @ ) = new member tag_`);
                break;
            }
            
            case 'goodbye': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                const sub = args[0]?.toLowerCase();
                if (!sub || (sub !== 'on' && sub !== 'off')) return m.reply(`📌 *Goodbye*\n✅ Enable: ${prefix}goodbye on\n❌ Disable: ${prefix}goodbye off\n\nCurrent: ${db.groups?.[m.chat]?.leave ? '🟢 ON' : '🔴 OFF'}\n────────────────────`);
                if (!global.db.groups) global.db.groups = {};
                if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};
                global.db.groups[m.chat].leave = sub === 'on';
                m.reply(`👋 *Goodbye Message*\n────────────────────\n${sub === 'on' ? '✅ Enabled!' : '❌ Disabled.'}\n────────────────────`);
                break;
            }
            
            case 'setleave': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!m.isAdmin) return m.reply(mess.admin);
                if (!q) return m.reply(`⚠️ Enter leave text!\nExample: ${prefix}setleave Goodbye @`);
                if (!global.db.groups) global.db.groups = {};
                if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};
                if (!global.db.groups[m.chat].text) global.db.groups[m.chat].text = {};
                global.db.groups[m.chat].text.setleave = q;
                m.reply(`✅ *Custom leave message saved!*\n────────────────────\n📝 Preview:\n${q.replace('@', '@' + (m.sender.split('@')[0]))}\n────────────────────`);
                break;
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // RAWG GAMES
            // ═══════════════════════════════════════════════════════════════════
            case 'gamelist':   await gameLib.gameList(nimesha, m, prefix); break
            case 'topgames':   await gameLib.topGames(nimesha, m, prefix); break
            case 'searchgame': await gameLib.searchGame(nimesha, m, prefix); break
            case 'randomgame': await gameLib.randomGame(nimesha, m, prefix); break
            case 'genre':      await gameLib.gamesByGenre(nimesha, m, prefix); break
            
            case 'blackjack': case 'bj': { await gameLib.blackjack(nimesha, m, prefix, db); } break
            case 'math': case 'mathquiz': { await gameLib.mathQuiz(nimesha, m, db); } break
            
            // ═══════════════════════════════════════════════════════════════════
            // MOVIES & TV
            // ═══════════════════════════════════════════════════════════════════
            case 'movie': {
                if (!text) return m.reply(`🎬 Usage: ${prefix}movie <title>\nExample: ${prefix}movie Inception`);
                try {
                    const film = await movies.getMovie(text);
                    const trailer = await movies.getTrailer(film.title, film.year);
                    if (trailer) film.trailerUrl = trailer;
                    let reply = movies.formatMovie(film);
                    if (film.poster) {
                        const pb = await axios.get(film.poster, { responseType: 'arraybuffer' }).then(r => Buffer.from(r.data)).catch(() => null);
                        if (pb) {
                            await nimesha.sendMessage(m.chat, { image: pb, caption: reply }, { quoted: m });
                            break;
                        }
                    }
                    await m.reply(reply);
                } catch (e) { m.reply(`❌ ${e.message}`); }
                break;
            }
            
            case 'tv': case 'series': {
                if (!text) return m.reply(`📺 Usage: ${prefix}tv <series name>\nExample: ${prefix}tv Breaking Bad\nWith season: ${prefix}tv Breaking Bad s2`);
                const parts = text.split(' ');
                let season = null, titleParts = [];
                for (const p of parts) {
                    if (/^s\d+$/i.test(p)) season = parseInt(p.slice(1));
                    else titleParts.push(p);
                }
                try {
                    const series = await movies.getTVSeries(titleParts.join(' '), season);
                    let reply = movies.formatTVSeries(series);
                    if (series.poster) {
                        const pb = await axios.get(series.poster, { responseType: 'arraybuffer' }).then(r => Buffer.from(r.data)).catch(() => null);
                        if (pb) {
                            await nimesha.sendMessage(m.chat, { image: pb, caption: reply }, { quoted: m });
                            break;
                        }
                    }
                    await m.reply(reply);
                } catch (e) { m.reply(`❌ ${e.message}`); }
                break;
            }
            
            case 'topmovies': {
                const page = parseInt(args[0]) || 1;
                const list = await movies.topRatedMovies(page).catch(e => { m.reply(`❌ ${e.message}`); return null; });
                if (list) await m.reply(movies.formatMovieList(list, '🏆 TOP RATED MOVIES'));
                break;
            }
            
            case 'upcoming': {
                const page = parseInt(args[0]) || 1;
                const list = await movies.upcomingMovies(page).catch(e => { m.reply(`❌ ${e.message}`); return null; });
                if (list) await m.reply(movies.formatMovieList(list, '📅 UPCOMING MOVIES'));
                break;
            }
            
            case 'nowplaying': {
                const page = parseInt(args[0]) || 1;
                const list = await movies.nowPlaying(page).catch(e => { m.reply(`❌ ${e.message}`); return null; });
                if (list) await m.reply(movies.formatMovieList(list, '🎬 NOW PLAYING'));
                break;
            }
            
            case 'trailer': {
                if (!text) return m.reply(`🎥 Usage: ${prefix}trailer <movie title>`);
                const yearMatch = text.match(/\b(19|20)\d{2}\b/);
                const title2 = text.replace(/\b(19|20)\d{2}\b/, '').trim();
                const year2 = yearMatch ? yearMatch[0] : null;
                const trailerUrl = await movies.getTrailer(title2, year2);
                if (trailerUrl) await m.reply(`🎥 *Watch Trailer: ${title2}*\n${trailerUrl}`);
                else await m.reply(`❌ No trailer found for "${text}"`);
                break;
            }
            
            case 'celebrity': {
                if (!text) return m.reply(`⭐ Usage: ${prefix}celebrity <name>\nExample: ${prefix}celebrity Leonardo DiCaprio`);
                try {
                    const celeb = await movies.getCelebrity(text);
                    let reply = `⭐ *${celeb.name}*\n📅 Born: ${celeb.birthday || 'N/A'}\n📍 Birthplace: ${celeb.place || 'N/A'}\n⭐ Popularity: ${celeb.popularity?.toFixed(1)}\n🎭 Known for: ${celeb.knownFor.join(', ')}\n📝 Bio: ${celeb.bio}`;
                    if (celeb.photo) {
                        const pb = await axios.get(celeb.photo, { responseType: 'arraybuffer' }).then(r => Buffer.from(r.data)).catch(() => null);
                        if (pb) {
                            await nimesha.sendMessage(m.chat, { image: pb, caption: reply }, { quoted: m });
                            break;
                        }
                    }
                    await m.reply(reply);
                } catch (e) { m.reply(`❌ ${e.message}`); }
                break;
            }
            
            case 'moviequote': {
                const qte = await movies.randomQuote();
                await m.reply(`💬 *Movie Quote*\n────────────────────\n${qte}\n────────────────────`);
                break;
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // DOWNLOADS
            // ═══════════════════════════════════════════════════════════════════
            case 'apk': {
                if (!q) return m.reply(`⚠️ Enter app name!\nExample: ${prefix}apk WhatsApp`);
                const waitMsg = await nimesha.sendMessage(m.chat, { text: `🔍 *Searching for APK...*\n📱 *App:* ${q}\n⏳ Please wait...` }, { quoted: m });
                const apkInfo = await tryFetch([
                    async () => {
                        const r = await axios.get(`https://api.paxsenix.biz.id/dl/apkpure?q=${encodeURIComponent(q)}`, { timeout: 20000 });
                        return r.data?.title ? { title: r.data.title, url: r.data.url, size: r.data.size, version: r.data.version } : null;
                    },
                    async () => {
                        return { title: q, url: `https://apkpure.com/search?q=${encodeURIComponent(q)}`, size: 'N/A', version: 'Latest' };
                    }
                ]);
                if (apkInfo) {
                    await nimesha.sendMessage(m.chat, { text: `📱 *APK Found!*\n────────────────────\n📦 *App:* ${apkInfo.title || q}\n📌 *Version:* ${apkInfo.version || 'Latest'}\n💾 *Size:* ${apkInfo.size || 'N/A'}\n🔗 *Download:* ${apkInfo.url || 'N/A'}\n────────────────────`, edit: waitMsg.key });
                } else {
                    await nimesha.sendMessage(m.chat, { text: `❌ APK not found\n🔗 Try: https://apkpure.com/search?q=${encodeURIComponent(q)}`, edit: waitMsg.key });
                }
                break;
            }
            
            case 'mp3': case 'song': case 'play': case 'ytmp3': {
                const input = q;
                if (!input) return await nimesha.sendListMsg(m.chat, { text: `⚠️ Enter a song name or URL!\nExamples:\n${prefix}${command} Shape of You\n${prefix}${command} https://youtu.be/...\n────────────────────`, footer: `© ${global.botname || 'MAUREONIX'}`, buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📋 Menu', id: `${prefix}menu` })] } }, { quoted: m });
                try {
                    const searchMsg = await nimesha.sendMessage(m.chat, { text: `🔍 *Searching...*\n────────────────────\n🎵 *Request:* ${input}\n⏳ Searching YouTube...\n────────────────────` }, { quoted: m });
                    const searchKey = searchMsg?.key || null;
                    let displayTitle = input, videoUrl = input;
                    if (!input.match(/https?:\/\//)) {
                        try {
                            const res = await yts(input);
                            const v = res?.videos?.[0] || res?.all?.[0];
                            if (v) {
                                const _v = v.videoId || v.url?.match(/(?:v=|youtu\.be\/)([^&?#]+)/)?.[1];
                                if (_v) {
                                    videoUrl = `https://www.youtube.com/watch?v=${_v}`;
                                    displayTitle = v.title || input;
                                }
                            }
                        } catch {}
                    }
                    const songButtons = [
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '1️⃣ Audio (🎵 mp3)', id: '1' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '2️⃣ Voice note (🎤)', id: '2' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '3️⃣ Document (📄)', id: '3' }) },
                    ];
                    const btnMsg = await nimesha.sendListMsg(m.chat, { text: `🎯 *Found!*\n────────────────────\n🎵 *Song:* ${displayTitle}\n🔗 ${videoUrl}\n────────────────────\n🎶 *Choose format:*\n────────────────────`, footer: `© ${global.botname || 'MAUREONIX'} | Choose format`, mentions: [m.sender], buttons: songButtons }, { quoted: m });
                    const btnKey = btnMsg?.key || null;
                    pendingDownload.set(m.sender, { type: 'song', input, url: videoUrl, displayTitle, statusKey: searchKey, buttonKey: btnKey });
                    setTimeout(async () => {
                        if (pendingDownload.has(m.sender) && pendingDownload.get(m.sender).buttonKey === btnKey) {
                            pendingDownload.delete(m.sender);
                            try { if (btnKey) await nimesha.sendMessage(m.chat, { delete: btnKey }); } catch {}
                            try { if (searchKey) await nimesha.sendMessage(m.chat, { delete: searchKey }); } catch {}
                        }
                    }, AUTO_DELETE_SECS * 1000);
                } catch (err) {
                    await nimesha.sendMessage(m.chat, { text: `⚠️ *Error:* ${err.message}` }, { quoted: m });
                }
                break;
            }
            
            case 'video': case 'mp4': case 'ytmp4': case 'ytvideo': {
                const input = q;
                if (!input) return await nimesha.sendListMsg(m.chat, { text: `⚠️ Enter a video name or URL!\nExamples:\n${prefix}${command} Avengers\n────────────────────`, footer: `© ${global.botname || 'MAUREONIX'}`, buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📋 Menu', id: `${prefix}menu` })] } }, { quoted: m });
                try {
                    let videoUrl = input, displayTitle = input;
                    const vidSearchMsg = await nimesha.sendMessage(m.chat, { text: `🔍 *Searching...*\n────────────────────\n🎬 *Request:* ${input}\n⏳ Searching YouTube...\n────────────────────` }, { quoted: m });
                    const vidSearchKey = vidSearchMsg?.key || null;
                    if (!input.match(/https?:\/\//)) {
                        const searchRes = await yts(input);
                        const video = searchRes?.videos?.[0] || searchRes?.all?.[0];
                        if (!video) {
                            try { await nimesha.sendMessage(m.chat, { text: `❌ *No results found!*\n────────────────────\n🎬 ${input}\n────────────────────`, edit: vidSearchKey }); } catch {}
                            return;
                        }
                        const _v = video.videoId || video.url?.match(/(?:v=|youtu\.be\/)([^&?#]+)/)?.[1];
                        if (_v) videoUrl = `https://www.youtube.com/watch?v=${_v}`;
                        displayTitle = video.title || input;
                    }
                    const videoButtons = [
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '1️⃣ 144p (Video)', id: '1' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '2️⃣ 360p (Video)', id: '2' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '3️⃣ 720p (Video)', id: '3' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '4️⃣ 144p (📄 Document)', id: '4' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '5️⃣ 360p (📄 Document)', id: '5' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '6️⃣ 720p (📄 Document)', id: '6' }) },
                    ];
                    const vidBtnMsg = await nimesha.sendListMsg(m.chat, { text: `🎯 *Found!*\n────────────────────\n🎬 *Video:* ${displayTitle}\n🔗 ${videoUrl}\n────────────────────\n📺 *Choose quality:*\n────────────────────`, footer: `© ${global.botname || 'MAUREONIX'} | Choose quality`, mentions: [m.sender], buttons: videoButtons }, { quoted: m });
                    const vidBtnKey = vidBtnMsg?.key || null;
                    pendingDownload.set(m.sender, { type: 'video', input, url: videoUrl, displayTitle, statusKey: vidSearchKey, buttonKey: vidBtnKey });
                    setTimeout(async () => {
                        if (pendingDownload.has(m.sender) && pendingDownload.get(m.sender).buttonKey === vidBtnKey) {
                            pendingDownload.delete(m.sender);
                            try { if (vidBtnKey) await nimesha.sendMessage(m.chat, { delete: vidBtnKey }); } catch {}
                            try { if (vidSearchKey) await nimesha.sendMessage(m.chat, { delete: vidSearchKey }); } catch {}
                        }
                    }, AUTO_DELETE_SECS * 1000);
                } catch (err) {
                    await nimesha.sendMessage(m.chat, { text: `⚠️ *Error:* ${err.message}` }, { quoted: m });
                }
                break;
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // PENDING DOWNLOAD HANDLER (1-6 button response)
            // ═══════════════════════════════════════════════════════════════════
            case '1': case '2': case '3': case '4': case '5': case '6': {
                if (!pendingDownload.has(m.sender)) break;
                const choice = command;
                const pending = pendingDownload.get(m.sender);
                pendingDownload.delete(m.sender);
                
                if (pending.type === 'song') {
                    const fmtNames = { '1': 'Audio 🎵', '2': 'Voice note 🎤', '3': 'Document 📄' };
                    const statusKey = pending.statusKey, buttonKey = pending.buttonKey;
                    if (buttonKey) { try { await nimesha.sendMessage(m.chat, { delete: buttonKey }); } catch {} }
                    await nimesha.sendMessage(m.chat, { text: `⬇️ *Downloading...*\n────────────────────\n🎵 *Song:* ${pending.displayTitle}\n🎶 *Format:* ${fmtNames[choice]}\n⏳ Connecting to YouTube...\n────────────────────`, edit: statusKey });
                    try {
                        let dlResult = pending.url?.match(/https?:\/\//) ? await musicDownloader.downloadByUrl(pending.url) : await musicDownloader.searchAndDownload(pending.input);
                        if (!dlResult?.success) {
                            await nimesha.sendMessage(m.chat, { text: `❌ *Download failed!*\n────────────────────\n🎵 ${pending.displayTitle}\n⚠️ ${dlResult?.error || 'Error'}\n────────────────────`, edit: statusKey });
                            return;
                        }
                        await nimesha.sendMessage(m.chat, { text: `📤 *Uploading...*\n────────────────────\n🎵 *Song:* ${pending.displayTitle}\n⏳ Sending...\n────────────────────`, edit: statusKey });
                        const audioBuffer = fs.readFileSync(dlResult.filePath);
                        const mediaCaption = `🎵 *${pending.displayTitle}*\n────────────────────\n${global.botname || 'MAUREONIX'}`;
                        if (choice === '1') {
                            await nimesha.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: false, fileName: `${pending.displayTitle.substring(0, 40)}.mp3`, contextInfo: { externalAdReply: { title: pending.displayTitle, body: '🎵 MAUREONIX', renderLargerThumbnail: false } } }, { quoted: m });
                        } else if (choice === '2') {
                            await nimesha.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m });
                        } else if (choice === '3') {
                            await nimesha.sendMessage(m.chat, { document: audioBuffer, mimetype: 'audio/mpeg', fileName: `${pending.displayTitle.substring(0, 40)}.mp3`, caption: mediaCaption }, { quoted: m });
                        }
                        await nimesha.sendMessage(m.chat, { text: `✅ *Success!*\n────────────────────\n🎵 *Song:* ${pending.displayTitle}\n🎶 *Format:* ${fmtNames[choice]}\n────────────────────`, edit: statusKey });
                        try { fs.unlinkSync(dlResult.filePath); } catch {}
                    } catch (err) {
                        await nimesha.sendMessage(m.chat, { text: `❌ *Error!*\n────────────────────\n⚠️ ${err.message.substring(0, 150)}\n────────────────────`, edit: statusKey });
                    }
                }
                
                if (pending.type === 'video') {
                    const qualityMap = { '1': '144', '2': '360', '3': '720', '4': '144', '5': '360', '6': '720' };
                    const isDoc = ['4', '5', '6'].includes(choice);
                    const quality = qualityMap[choice];
                    const statusKey = pending.statusKey, buttonKey = pending.buttonKey;
                    if (buttonKey) { try { await nimesha.sendMessage(m.chat, { delete: buttonKey }); } catch {} }
                    await nimesha.sendMessage(m.chat, { text: `⬇️ *Downloading video...*\n────────────────────\n🎬 *Video:* ${pending.displayTitle}\n📺 *Quality:* ${quality}p${isDoc ? ' (Document)' : ''}\n⏳ Fetching...\n────────────────────`, edit: statusKey });
                    try {
                        const outputPath = path.join(TEMP_MEDIA_DIR, `video_${Date.now()}.mp4`);
                        const qFilter = quality === '144' ? 'bestvideo[height<=144][ext=mp4]+bestaudio[ext=m4a]/worst[ext=mp4]/worst' : quality === '360' ? 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best[height<=360]' : 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]';
                        await new Promise((res, rej) => {
                            exec(`yt-dlp -f "${qFilter}" --merge-output-format mp4 --no-playlist --no-warnings -o "${outputPath}" "${pending.url}"`, { timeout: 120000 }, (err, stdout, stderr) => {
                                if (err) return rej(new Error(stderr?.split('\n').filter(l => l.includes('ERROR')).join(' ') || err.message));
                                res();
                            });
                        });
                        const fileStat = fs.statSync(outputPath);
                        const fileSizeMB = fileStat.size / (1024 * 1024);
                        if (fileSizeMB > 150) {
                            try { fs.unlinkSync(outputPath); } catch {}
                            await nimesha.sendMessage(m.chat, { text: `❌ *File too large!*\n────────────────────\n📦 *Size:* ${fileSizeMB.toFixed(1)}MB (Limit: 150MB)\n💡 Try 144p or 360p\n────────────────────`, edit: statusKey });
                            return;
                        }
                        await nimesha.sendMessage(m.chat, { text: `📤 *Uploading...*\n────────────────────\n🎬 *Video:* ${pending.displayTitle}\n📺 *Quality:* ${quality}p${isDoc ? ' (Document)' : ''}\n📦 *Size:* ${fileSizeMB.toFixed(1)}MB\n⏳ Sending...\n────────────────────`, edit: statusKey });
                        const videoBuffer = fs.readFileSync(outputPath);
                        try { fs.unlinkSync(outputPath); } catch {}
                        const vidCaption = `🎬 *${pending.displayTitle}*\n📺 *Quality:* ${quality}p\n📦 *Size:* ${fileSizeMB.toFixed(1)}MB\n────────────────────\n${global.botname || 'MAUREONIX'}`;
                        if (isDoc) {
                            await nimesha.sendMessage(m.chat, { document: videoBuffer, mimetype: 'video/mp4', fileName: `${pending.displayTitle.substring(0, 40)}.mp4`, caption: vidCaption + (isDoc ? ' (Document)' : '') }, { quoted: m });
                        } else {
                            await nimesha.sendMessage(m.chat, { video: videoBuffer, caption: vidCaption }, { quoted: m });
                        }
                        await nimesha.sendMessage(m.chat, { text: `✅ *Success!*\n────────────────────\n🎬 *Video:* ${pending.displayTitle}\n📺 *Quality:* ${quality}p${isDoc ? ' (Document)' : ''}\n────────────────────`, edit: statusKey });
                    } catch (err) {
                        const friendlyErr = err.message.includes('ffmpeg') ? 'ffmpeg not installed' : err.message.includes('yt-dlp') ? 'yt-dlp not installed/outdated' : err.message.includes('unavailable') || err.message.includes('private') ? 'Video is private or unavailable' : err.message.substring(0, 150);
                        await nimesha.sendMessage(m.chat, { text: `❌ *Video error!*\n────────────────────\n⚠️ ${friendlyErr}\n────────────────────`, edit: statusKey });
                    }
                }
                break;
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // SEARCH / TOOLS
            // ═══════════════════════════════════════════════════════════════════
            case 'joke': {
                const jokeMsg = await nimesha.sendMessage(m.chat, { text: `😂 *Getting a joke...*\n⏳ Please wait...` }, { quoted: m });
                const joke = await tryFetch([
                    async () => {
                        const r = await axios.get('https://v2.jokeapi.dev/joke/Any?type=twopart&blacklistFlags=nsfw,racist,sexist', { timeout: 8000 });
                        return r.data?.setup ? `😂 *${r.data.setup}*\n\n${r.data.delivery}` : null;
                    },
                    async () => {
                        const r = await axios.get('https://official-joke-api.appspot.com/jokes/random', { timeout: 8000 });
                        return r.data?.setup ? `😂 *${r.data.setup}*\n\n${r.data.punchline}` : null;
                    }
                ]);
                await nimesha.sendMessage(m.chat, { text: joke ? `${joke}\n────────────────────` : `❌ Could not get a joke`, edit: jokeMsg.key });
                break;
            }
            
            case 'quote': {
                const quoteMsg = await nimesha.sendMessage(m.chat, { text: `💬 *Getting a quote...*\n⏳ Please wait...` }, { quoted: m });
                const quote = await tryFetch([
                    async () => {
                        const r = await axios.get('https://api.quotable.io/random', { timeout: 8000 });
                        return r.data?.content ? `💬 *"${r.data.content}"*\n\n— _${r.data.author}_` : null;
                    },
                    async () => {
                        const r = await axios.get('https://zenquotes.io/api/random', { timeout: 8000 });
                        return r.data?.[0]?.q ? `💬 *"${r.data[0].q}"*\n\n— _${r.data[0].a}_` : null;
                    }
                ]);
                await nimesha.sendMessage(m.chat, { text: quote ? `${quote}\n────────────────────` : `❌ Could not get a quote`, edit: quoteMsg.key });
                break;
            }
            
            case 'fact': {
                const factMsg = await nimesha.sendMessage(m.chat, { text: `💡 *Getting a fact...*\n⏳ Please wait...` }, { quoted: m });
                const fact = await tryFetch([
                    async () => {
                        const r = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', { timeout: 8000 });
                        return r.data?.text || null;
                    },
                    async () => {
                        const r = await axios.get('https://catfact.ninja/fact', { timeout: 8000 });
                        return r.data?.fact || null;
                    }
                ]);
                await nimesha.sendMessage(m.chat, { text: fact ? `💡 *Interesting Fact!*\n────────────────────\n${fact}\n────────────────────` : `❌ Could not get a fact`, edit: factMsg.key });
                break;
            }
            
            case 'define': {
                if (!q) return m.reply(`⚠️ Enter a word!\nExample: ${prefix}define hello`);
                const defineMsg = await nimesha.sendMessage(m.chat, { text: `📖 *Looking up "${q}"...*\n⏳ Please wait...` }, { quoted: m });
                const def = await tryFetch([
                    async () => {
                        const r = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`, { timeout: 8000 });
                        const d = r.data?.[0];
                        return d ? `📖 *${d.word}*\n\n*Meaning:* ${d.meanings?.[0]?.definitions?.[0]?.definition}\n*Example:* ${d.meanings?.[0]?.definitions?.[0]?.example || 'N/A'}\n*Part of speech:* ${d.meanings?.[0]?.partOfSpeech || 'N/A'}` : null;
                    }
                ]);
                await nimesha.sendMessage(m.chat, { text: def ? `${def}\n────────────────────` : `❌ "${q}" not found`, edit: defineMsg.key });
                break;
            }
            
            case 'weather': {
                if (!q) return m.reply(`⚠️ Enter a city name!\nExample: ${prefix}weather Colombo`);
                const weatherMsg = await nimesha.sendMessage(m.chat, { text: `🌤️ *Getting weather...*\n⏳ Please wait...` }, { quoted: m });
                const weather = await tryFetch([
                    async () => {
                        const r = await axios.get(`https://wttr.in/${encodeURIComponent(q)}?format=j1`, { timeout: 10000 });
                        const d = r.data?.current_condition?.[0];
                        if (!d) return null;
                        return `🌤️ *Weather: ${q}*\n────────────────────\n🌡️ *Temp:* ${d.temp_C}°C (${d.temp_F}°F)\n💧 *Humidity:* ${d.humidity}%\n🌬️ *Wind:* ${d.windspeedKmph} km/h\n☁️ *Condition:* ${d.weatherDesc?.[0]?.value}\n👁️ *Visibility:* ${d.visibility} km`;
                    }
                ]);
                await nimesha.sendMessage(m.chat, { text: weather ? `${weather}\n────────────────────` : `❌ City "${q}" not found`, edit: weatherMsg.key });
                break;
            }
            
            case 'news': {
                const newsMsg = await nimesha.sendMessage(m.chat, { text: `📰 *Getting news...*\n⏳ Please wait...` }, { quoted: m });
                const news = await tryFetch([
                    async () => {
                        const r = await axios.get('https://newsapi.org/v2/top-headlines?country=us&apiKey=demo&pageSize=5', { timeout: 10000 });
                        return r.data?.articles?.slice(0, 5).map((a, i) => `${i + 1}. *${a.title}*\n   ${a.source?.name || ''}`).join('\n\n') || null;
                    },
                    async () => {
                        const r = await axios.get('https://api.currentsapi.services/v1/latest-news?apiKey=demo&language=en&page_size=5', { timeout: 10000 });
                        return r.data?.news?.slice(0, 5).map((a, i) => `${i + 1}. *${a.title}*`).join('\n\n') || null;
                    }
                ]);
                await nimesha.sendMessage(m.chat, { text: news ? `📰 *Latest News*\n────────────────────\n${news}\n────────────────────` : `❌ Could not get news`, edit: newsMsg.key });
                break;
            }
            
            case 'lyrics': {
                if (!q) return m.reply(`⚠️ Enter a song name!\nExample: ${prefix}lyrics Shape of You`);
                const lyricsMsg = await nimesha.sendMessage(m.chat, { text: `🎵 *Getting lyrics...*\n⏳ Please wait...` }, { quoted: m });
                const lyrics = await tryFetch([
                    async () => {
                        const r = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(q)}`, { timeout: 10000 });
                        return r.data?.lyrics ? `🎵 *${r.data.title}* — ${r.data.author}\n────────────────────\n${r.data.lyrics.substring(0, 2000)}` : null;
                    },
                    async () => {
                        const search = await axios.get(`https://api.lyrics.ovh/suggest/${encodeURIComponent(q)}`, { timeout: 8000 });
                        const song = search.data?.data?.[0];
                        if (!song) return null;
                        const lyr = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(song.artist.name)}/${encodeURIComponent(song.title)}`, { timeout: 10000 });
                        return lyr.data?.lyrics ? `🎵 *${song.title}* — ${song.artist.name}\n────────────────────\n${lyr.data.lyrics.substring(0, 2000)}` : null;
                    }
                ]);
                await nimesha.sendMessage(m.chat, { text: lyrics ? `${lyrics}\n────────────────────` : `❌ Lyrics for "${q}" not found`, edit: lyricsMsg.key });
                break;
            }
            
            case '8ball': {
                if (!q) return m.reply(`⚠️ Ask a question!\nExample: ${prefix}8ball Will I win?`);
                const eightMsg = await nimesha.sendMessage(m.chat, { text: `🎱 *Magic 8-Ball...*\n⏳ Please wait...` }, { quoted: m });
                const answers = ['✅ Yes', '❌ No', '🤔 Maybe', '💯 Definitely!', '🙅 No way', '⭐ Signs point to yes', '🔮 Ask again later', '🌟 Without a doubt', '😐 Cannot predict now', '🎯 Outlook good'];
                const answer = answers[Math.floor(Math.random() * answers.length)];
                await nimesha.sendMessage(m.chat, { text: `🎱 *Magic 8-Ball*\n────────────────────\n❓ *Question:* ${q}\n\n🔮 *Answer:* ${answer}\n────────────────────`, edit: eightMsg.key });
                break;
            }
            
            case 'tts': {
                if (!q) return m.reply(`⚠️ Enter text!\nExample: ${prefix}tts hello world`);
                const lang = args[args.length - 1]?.length === 2 ? args.pop() : 'en';
                const ttsText = args.join(' ');
                try {
                    const audioBuffer = await ttsGenerate(ttsText, lang);
                    if (audioBuffer) {
                        await nimesha.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
                    } else {
                        await nimesha.sendMessage(m.chat, { text: `❌ TTS generation failed` }, { quoted: m });
                    }
                } catch (e) {
                    await nimesha.sendMessage(m.chat, { text: `❌ TTS error: ${e.message}` }, { quoted: m });
                }
                break;
            }
            
            case 'trt': case 'translate': {
                if (!q) return m.reply(`⚠️ Enter text and language!\nExample: ${prefix}trt Hello en\nExample: ${prefix}trt Ayubowan si`);
                const trtMsg = await nimesha.sendMessage(m.chat, { text: `🌐 *Translating...*\n⏳ Please wait...` }, { quoted: m });
                const parts2 = [...args];
                const toLang = parts2[parts2.length - 1]?.length <= 5 ? parts2.pop() : 'en';
                const toTranslate = parts2.join(' ');
                const translated = await translateText(toTranslate, toLang);
                await nimesha.sendMessage(m.chat, { text: translated ? `🌐 *Translation*\n────────────────────\n📝 *Original:* ${toTranslate}\n🔤 *Translated (${toLang}):* ${translated}\n────────────────────` : `❌ Translation failed`, edit: trtMsg.key });
                break;
            }
            
            case 'ss': case 'screenshot': {
                if (!q || !q.match(/https?:\/\//)) return m.reply(`⚠️ Enter a URL!\nExample: ${prefix}ss https://google.com`);
                const waitMsg = await nimesha.sendMessage(m.chat, { text: `📸 *Taking screenshot...*\n🔗 ${q}\n⏳ Please wait...` }, { quoted: m });
                const imgBuffer = await takeScreenshot(q);
                if (imgBuffer) {
                    await nimesha.sendMessage(m.chat, { image: imgBuffer, caption: `📸 *Screenshot*\n🔗 ${q}\n────────────────────` }, { quoted: m });
                    await nimesha.sendMessage(m.chat, { text: `✅ *Screenshot successful!*\n🔗 ${q}`, edit: waitMsg.key });
                } else {
                    await nimesha.sendMessage(m.chat, { text: `❌ Could not take screenshot`, edit: waitMsg.key });
                }
                break;
            }
            
            case 'cinfo': {
                if (!q) return m.reply(`⚠️ Enter a country name!\nExample: ${prefix}cinfo Sri Lanka`);
                const cinfoMsg = await nimesha.sendMessage(m.chat, { text: `🌍 *Getting country info...*\n⏳ Please wait...` }, { quoted: m });
                const info = await tryFetch([
                    async () => {
                        const r = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(q)}?fullText=false`, { timeout: 10000 });
                        const c = r.data?.[0];
                        if (!c) return null;
                        return `🌍 *Country Info: ${c.name?.common}*\n────────────────────\n🏳️ *Official:* ${c.name?.official}\n🗺️ *Capital:* ${c.capital?.[0] || 'N/A'}\n🌏 *Region:* ${c.region} - ${c.subregion}\n👥 *Population:* ${c.population?.toLocaleString()}\n💱 *Currency:* ${Object.values(c.currencies || {})[0]?.name || 'N/A'}\n🗣️ *Languages:* ${Object.values(c.languages || {}).join(', ')}\n📞 *Calling Code:* +${c.idd?.root?.replace('+', '')}${c.idd?.suffixes?.[0] || ''}\n🚗 *Driving Side:* ${c.car?.side || 'N/A'}\n🏖️ *Area:* ${c.area?.toLocaleString()} km²`;
                    }
                ]);
                await nimesha.sendMessage(m.chat, { text: info ? `${info}\n────────────────────` : `❌ Country "${q}" not found`, edit: cinfoMsg.key });
                break;
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // AI
            // ═══════════════════════════════════════════════════════════════════
            case 'gpt': case 'gemini': case 'llama3': case 'ai': case 'chatai': {
                if (!q) return m.reply(`⚠️ Ask a question!\nExample: ${prefix}${command} What is love?`);
                const waitMsg = await nimesha.sendMessage(m.chat, { text: `🤖 *AI thinking...*\n────────────────────\n❓ *Question:* ${q}\n⏳ Please wait...\n────────────────────` }, { quoted: m });
                const answer = await aiQuery(q, command);
                await nimesha.sendMessage(m.chat, { text: answer ? `🤖 *AI Answer (${command.toUpperCase()})*\n────────────────────\n❓ *Q:* ${q}\n\n💡 *A:* ${answer}\n────────────────────` : `❌ Could not get AI response`, edit: waitMsg.key });
                break;
            }
            
            case 'imagine': case 'flux': case 'sora': {
                if (!q) return m.reply(`⚠️ Enter a prompt!\nExample: ${prefix}${command} a beautiful sunset`);
                const waitMsg = await nimesha.sendMessage(m.chat, { text: `🎨 *AI Image generating...*\n────────────────────\n✨ *Prompt:* ${q}\n⏳ Please wait...\n────────────────────` }, { quoted: m });
                const imgBuffer = await tryFetch([
                    async () => {
                        const r = await axios.get(`https://api.paxsenix.biz.id/ai/flux?prompt=${encodeURIComponent(q)}`, { responseType: 'arraybuffer', timeout: 30000 });
                        return Buffer.from(r.data);
                    },
                    async () => {
                        const r = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(q)}?width=1024&height=1024&nologo=true`, { responseType: 'arraybuffer', timeout: 30000 });
                        return Buffer.from(r.data);
                    },
                    async () => {
                        const r = await axios.get(`https://nexra.aryahcr.cc/api/image/completeai?prompt=${encodeURIComponent(q)}&model=flux`, { responseType: 'arraybuffer', timeout: 30000 });
                        return Buffer.from(r.data);
                    }
                ]);
                if (imgBuffer) {
                    await nimesha.sendMessage(m.chat, { image: imgBuffer, caption: `🎨 *AI Generated Image*\n✨ *Prompt:* ${q}\n🤖 *Model:* ${command}\n────────────────────` }, { quoted: m });
                    await nimesha.sendMessage(m.chat, { text: `✅ *AI Image generated!*\n✨ *Prompt:* ${q}`, edit: waitMsg.key });
                } else {
                    await nimesha.sendMessage(m.chat, { text: `❌ Could not generate image`, edit: waitMsg.key });
                }
                break;
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // STICKER & IMAGE
            // ═══════════════════════════════════════════════════════════════════
            case 'sticker': case 'stickerpack': case 's': {
                const quotedS = m.quoted, msgS = m.message;
                let mediaBuffer = null, mimeType = 'image/jpeg';
                try {
                    if (quotedS?.message?.imageMessage || quotedS?.message?.videoMessage || quotedS?.message?.stickerMessage) {
                        mediaBuffer = await nimesha.downloadMediaMessage(quotedS);
                        mimeType = quotedS.message?.imageMessage ? 'image/jpeg' : quotedS.message?.videoMessage ? 'video/mp4' : 'image/webp';
                    } else if (msgS?.imageMessage || msgS?.videoMessage) {
                        mediaBuffer = await nimesha.downloadMediaMessage(m);
                        mimeType = msgS?.imageMessage ? 'image/jpeg' : 'video/mp4';
                    }
                    if (!mediaBuffer) return m.reply(`⚠️ Reply to an image/video!`);
                    const packName = args[0] || global.packname || 'MAUREONIX';
                    const stickerBuffer = await makeSticker(mediaBuffer, mimeType, packName, global.author || 'Infinite Vybeflix');
                    await nimesha.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });
                } catch (e) {
                    await nimesha.sendMessage(m.chat, { text: `❌ Sticker error: ${e.message}` }, { quoted: m });
                }
                break;
            }
            
            case 'simage': case 'toimg': {
                const quotedI = m.quoted;
                if (!quotedI?.message?.stickerMessage) return m.reply(`⚠️ Reply to a sticker!`);
                try {
                    const buffer = await nimesha.downloadMediaMessage(quotedI);
                    await nimesha.sendMessage(m.chat, { image: buffer, caption: `🖼️ *Sticker → Image*\n${global.botname || 'MAUREONIX'}` }, { quoted: m });
                } catch (e) {
                    await nimesha.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m });
                }
                break;
            }
            
            case 'removebg': case 'rmbg': {
                const quotedR = m.quoted, msgR = m.message;
                let imageBuffer = null;
                try {
                    if (quotedR?.message?.imageMessage) imageBuffer = await nimesha.downloadMediaMessage(quotedR);
                    else if (msgR?.imageMessage) imageBuffer = await nimesha.downloadMediaMessage(m);
                    if (!imageBuffer) return m.reply(`⚠️ Reply to an image!`);
                    const waitMsg = await nimesha.sendMessage(m.chat, { text: `🔧 *Removing background...*\n⏳ Please wait...` }, { quoted: m });
                    const result = await removeBackground(imageBuffer);
                    if (result) {
                        await nimesha.sendMessage(m.chat, { image: result, caption: `✅ *Background Removed!*\n${global.botname || 'MAUREONIX'}` }, { quoted: m });
                        await nimesha.sendMessage(m.chat, { text: `✅ *Background removed!*`, edit: waitMsg.key });
                    } else {
                        await nimesha.sendMessage(m.chat, { text: `❌ Could not remove background`, edit: waitMsg.key });
                    }
                } catch (e) {
                    await nimesha.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m });
                }
                break;
            }
            
            case 'blur': {
                const quotedB = m.quoted, msgB = m.message;
                let imageBuffer = null;
                try {
                    if (quotedB?.message?.imageMessage) imageBuffer = await nimesha.downloadMediaMessage(quotedB);
                    else if (msgB?.imageMessage) imageBuffer = await nimesha.downloadMediaMessage(m);
                    if (!imageBuffer) return m.reply(`⚠️ Reply to an image!`);
                    const sharp = require('sharp');
                    const blurred = await sharp(imageBuffer).blur(15).toBuffer();
                    await nimesha.sendMessage(m.chat, { image: blurred, caption: `🫧 *Blurred Image*\n${global.botname || 'MAUREONIX'}` }, { quoted: m });
                } catch (e) {
                    await nimesha.sendMessage(m.chat, { text: `❌ Blur error: ${e.message}` }, { quoted: m });
                }
                break;
            }
            
            case 'attp': {
                if (!q) return m.reply(`⚠️ Enter text!\nExample: ${prefix}attp Hello`);
                const atttpWaitMsg = await nimesha.sendMessage(m.chat, { text: `🎨 *Generating ATTP sticker...*\n📝 *Text:* ${q}\n⏳ Please wait...` }, { quoted: m });
                try {
                    const webpBuffer = await new Promise((resolve, reject) => {
                        const fontPath = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
                        const escTxt = s => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/:/g, '\\:').replace(/,/g, '\\,').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/%/g, '\\%');
                        const safeText = escTxt(q);
                        const tmpOut = path.join(os.tmpdir(), `attp_${Date.now()}.webp`);
                        const cycle = 0.3, dur = 1.8;
                        const base = `fontfile='${fontPath}':text='${safeText}':borderw=3:bordercolor=black@0.8:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2`;
                        const drawRed = `drawtext=${base}:fontcolor=#FF4444:enable='lt(mod(t\\,${cycle})\\,0.1)'`;
                        const drawBlue = `drawtext=${base}:fontcolor=#4488FF:enable='between(mod(t\\,${cycle})\\,0.1\\,0.2)'`;
                        const drawGreen = `drawtext=${base}:fontcolor=#44FF88:enable='gte(mod(t\\,${cycle})\\,0.2)'`;
                        const ffArgs = ['-y', '-f', 'lavfi', '-i', `color=c=black:s=512x512:d=${dur}:r=15`, '-vf', `${drawRed},${drawBlue},${drawGreen},scale=512:512`, '-vcodec', 'libwebp', '-lossless', '0', '-compression_level', '4', '-quality', '70', '-loop', '0', '-preset', 'default', '-an', '-vsync', '0', '-t', String(dur), tmpOut];
                        const ff = spawn('ffmpeg', ffArgs);
                        const errors = [];
                        ff.stderr.on('data', e => errors.push(e));
                        ff.on('error', reject);
                        ff.on('close', code => {
                            if (code === 0 && fs.existsSync(tmpOut)) {
                                const buf = fs.readFileSync(tmpOut);
                                try { fs.unlinkSync(tmpOut); } catch {}
                                resolve(buf);
                            } else {
                                try { fs.unlinkSync(tmpOut); } catch {}
                                reject(new Error(Buffer.concat(errors).toString().slice(-300)));
                            }
                        });
                    });
                    await nimesha.sendMessage(m.chat, { sticker: webpBuffer }, { quoted: m });
                    await nimesha.sendMessage(m.chat, { text: `✅ *ATTP sticker created!*\n🎨 *Text:* ${q}`, edit: atttpWaitMsg.key });
                } catch (ffErr) {
                    const imgBuffer = await tryFetch([
                        async () => {
                            const r = await axios.get(`https://api.paxsenix.biz.id/sticker/attp?text=${encodeURIComponent(q)}`, { responseType: 'arraybuffer', timeout: 15000 });
                            return Buffer.from(r.data);
                        },
                        async () => {
                            const r = await axios.get(`https://api.lolhuman.xyz/api/attp?apikey=demo&text=${encodeURIComponent(q)}`, { responseType: 'arraybuffer', timeout: 15000 });
                            return Buffer.from(r.data);
                        }
                    ]);
                    if (imgBuffer) {
                        await nimesha.sendMessage(m.chat, { sticker: imgBuffer }, { quoted: m });
                        await nimesha.sendMessage(m.chat, { text: `✅ *ATTP sticker created!*\n🎨 *Text:* ${q}`, edit: atttpWaitMsg.key });
                    } else {
                        await nimesha.sendMessage(m.chat, { text: `❌ Could not generate ATTP sticker`, edit: atttpWaitMsg.key });
                    }
                }
                break;
            }
            
            case 'metallic': case 'ice': case 'snow': case 'impressive': case 'matrix': case 'light': case 'neon': case 'devil': case 'purple': case 'thunder': case 'leaves': case '1917': case 'arena': case 'hacker': case 'sand': case 'blackpink': case 'glitch': case 'fire': {
                if (!q) return m.reply(`⚠️ Enter text!\nExample: ${prefix}${command} Hello`);
                const waitMsg = await nimesha.sendMessage(m.chat, { text: `🎨 *Generating text art...*\n✨ *Style:* ${command}\n📝 *Text:* ${q}\n⏳ Please wait...` }, { quoted: m });
                const imgBuffer = await tryFetch([
                    async () => {
                        const r = await axios.get(`https://api.paxsenix.biz.id/text-effect/${command}?text=${encodeURIComponent(q)}`, { responseType: 'arraybuffer', timeout: 20000 });
                        return Buffer.from(r.data);
                    },
                    async () => {
                        const r = await axios.get(`https://api.lolhuman.xyz/api/teks/${command}?apikey=demo&text=${encodeURIComponent(q)}`, { responseType: 'arraybuffer', timeout: 20000 });
                        return Buffer.from(r.data);
                    },
                    async () => {
                        const r = await axios.get(`https://nekobot.xyz/api/text?type=${command}&text=${encodeURIComponent(q)}`, { responseType: 'arraybuffer', timeout: 20000 });
                        return Buffer.from(r.data);
                    }
                ]);
                if (imgBuffer) {
                    await nimesha.sendMessage(m.chat, { image: imgBuffer, caption: `🎨 *${command.toUpperCase()} Text Art*\n📝 *Text:* ${q}\n────────────────────` }, { quoted: m });
                    await nimesha.sendMessage(m.chat, { text: `✅ *Text art generated!*\n✨ *Style:* ${command}`, edit: waitMsg.key });
                } else {
                    await nimesha.sendMessage(m.chat, { text: `❌ Could not generate text art`, edit: waitMsg.key });
                }
                break;
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // FUN COMMANDS (shortened – full list from original)
            // ═══════════════════════════════════════════════════════════════════
            case 'compliment': {
                const mentioned = m.mentionedJid?.[0] || m.sender;
                const compliments = ['You are amazing! 🌟', 'You make the world a better place! 🌍', 'You are so talented! 🎉', 'Your smile lights up the room! 😊', 'You are absolutely wonderful! ✨', 'You are one of a kind! 🦋', 'You are inspiring! 💫'];
                await nimesha.sendMessage(m.chat, { text: `💖 *Compliment*\n────────────────────\n👤 @${mentioned.split('@')[0]}\n\n💌 ${pickRandom(compliments)}\n────────────────────`, mentions: [mentioned] }, { quoted: m });
                break;
            }
            
            case 'insult': {
                const mentioned = m.mentionedJid?.[0] || m.sender;
                const insult = await tryFetch([async () => { const r = await axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json', { timeout: 8000 }); return r.data?.insult || null; }]) || 'You have the personality of a wet sock! 🧦';
                await nimesha.sendMessage(m.chat, { text: `😂 *Insult*\n────────────────────\n👤 @${mentioned.split('@')[0]}\n\n😈 ${insult}\n────────────────────`, mentions: [mentioned] }, { quoted: m });
                break;
            }
            
            case 'flirt': {
                const flirts = ['Are you a magician? Every time I look at you, everyone else disappears ✨', 'Do you have a map? I keep getting lost in your eyes 👀', 'Are you a parking ticket? You have "fine" written all over you 😍', 'Is your name Google? You have everything I\'ve been searching for 🔍'];
                await nimesha.sendMessage(m.chat, { text: `💕 *Flirt Line*\n────────────────────\n${pickRandom(flirts)}\n────────────────────` }, { quoted: m });
                break;
            }
            
            case 'hack': {
                const target = m.mentionedJid?.[0] ? `@${m.mentionedJid[0].split('@')[0]}` : (q || 'Target');
                const stages = [
                    `💻 *HACKING INITIATED...*\n────────────────────\n🎯 Target: ${target}\n⚡ [░▒▒▒▒▒▒▒▒▒] 10% — Connecting...`,
                    `💻 *HACKING IN PROGRESS...*\n────────────────────\n🎯 Target: ${target}\n⚡ [████▒▒▒▒▒▒] 40% — Bypassing firewall...`,
                    `💻 *HACKING IN PROGRESS...*\n────────────────────\n🎯 Target: ${target}\n⚡ [███████▒▒▒] 70% — Extracting data...`,
                    `✅ *HACK COMPLETE!*\n────────────────────\n🎯 Target: ${target}\n⚡ [██████████] 100%\n📠 Password: 1234567890\n📧 Email: hacked@fake.com\n💰 Balance: $999,999\n────────────────────`
                ];
                let hackMsg = await nimesha.sendMessage(m.chat, { text: stages[0] });
                for (let i = 1; i < stages.length; i++) {
                    await new Promise(r => setTimeout(r, 2000));
                    await nimesha.sendMessage(m.chat, { text: stages[i], edit: hackMsg.key });
                }
                break;
            }
            
            case 'wasted': {
                const mentioned = m.mentionedJid?.[0] || m.sender;
                try {
                    const pp = await nimesha.profilePictureUrl(mentioned, 'image').catch(() => null);
                    if (pp) {
                        const imgBuffer = await getMiscImage('wasted', { imageUrl: pp });
                        if (imgBuffer) return await nimesha.sendMessage(m.chat, { image: imgBuffer, caption: `💀 *WASTED*\n@${mentioned.split('@')[0]}\n${global.botname || 'MAUREONIX'}`, mentions: [mentioned] }, { quoted: m });
                    }
                    await nimesha.sendMessage(m.chat, { text: `💀 *WASTED*\n@${mentioned.split('@')[0]}\n${global.botname || 'MAUREONIX'}`, mentions: [mentioned] }, { quoted: m });
                } catch (e) {
                    await nimesha.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m });
                }
                break;
            }
            
            case 'ship': {
                const user1 = m.mentionedJid?.[0] || m.sender, user2 = m.mentionedJid?.[1] || m.sender;
                const shipPercent = Math.floor(Math.random() * 101);
                const hearts = '❤️'.repeat(Math.floor(shipPercent / 20)) + '🤍'.repeat(5 - Math.floor(shipPercent / 20));
                await nimesha.sendMessage(m.chat, { text: `💕 *Ship Meter*\n────────────────────\n👤 @${user1.split('@')[0]}\n💖 + 💖\n👤 @${user2.split('@')[0]}\n\n${hearts}\n💯 *Match:* ${shipPercent}%\n${shipPercent > 70 ? '🔥 Perfect Match!' : shipPercent > 40 ? '💛 Good Match!' : '💔 Maybe next time...'}\n────────────────────`, mentions: [user1, user2] }, { quoted: m });
                break;
            }
            
            case 'simp': {
                const mentioned = m.mentionedJid?.[0] || m.sender;
                const simpLevel = Math.floor(Math.random() * 101);
                await nimesha.sendMessage(m.chat, { text: `😍 *Simp Meter*\n────────────────────\n👤 @${mentioned.split('@')[0]}\n\n💘 Simp Level: ${simpLevel}%\n${simpLevel > 80 ? '🚨 Ultra Simp!' : simpLevel > 50 ? '😅 Major Simp!' : '😌 Normal person'}\n────────────────────`, mentions: [mentioned] }, { quoted: m });
                break;
            }
            
            case 'character': {
                const mentioned = m.mentionedJid?.[0] || m.sender;
                const traits = ['Smart 🧠', 'Funny 😂', 'Kind ❤️', 'Creative 🎨', 'Brave 💪', 'Loyal 🤝', 'Mysterious 🔮', 'Energetic ⚡'];
                const selected = traits.sort(() => 0.5 - Math.random()).slice(0, 3);
                await nimesha.sendMessage(m.chat, { text: `🎭 *Character Analysis*\n────────────────────\n👤 @${mentioned.split('@')[0]}\n\n✨ *Personality Traits:*\n${selected.map(t => `• ${t}`).join('\n')}\n────────────────────`, mentions: [mentioned] }, { quoted: m });
                break;
            }
            
            case 'shayari': {
                const shayaris = ['Mohabbat ek dua hai,\nJo dil se nikalti hai,\nYeh sochke dil bhi muskurata hai,\nKi koi doosra bhi khayalon mein aata hai. 🌹', 'Zindagi ka safar, ajeeb hai yaro,\nKoi samajh na paya, kya hai raaz yaro,\nKoi rota hai tanha, koi hansta hai,\nPar dil ki baat, dil mein hi rehti hai. 💫', 'Pyar ko pyar hi rehne do,\nKoi naam na do,\nJo rishta dil se bana hai,\nUse alfazon ki zaroorat kya. 💕'];
                await nimesha.sendMessage(m.chat, { text: `🌹 *Shayari*\n────────────────────\n${pickRandom(shayaris)}\n────────────────────` }, { quoted: m });
                break;
            }
            
            // ─────────────────────────────────────────────────────────────────
            // DEFAULT – eval, exec, database relay
            // ─────────────────────────────────────────────────────────────────
            default:
                if (budy.startsWith('>')) {
                    if (!isCreator) return;
                    try {
                        let evaled = await eval(budy.slice(2));
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                        await m.reply(evaled);
                    } catch (err) {
                        await m.reply(String(err));
                    }
                }
                if (budy.startsWith('<')) {
                    if (!isCreator) return;
                    try {
                        let evaled = await eval(`(async () => { ${budy.slice(2)} })()`);
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                        await m.reply(evaled);
                    } catch (err) {
                        await m.reply(String(err));
                    }
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
        
        // ── Post-switch: store quoted for anti-delete ────────────────────────
        if (m.message && m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            try { await storeMessage(m); } catch {}
        }
        
        // ── Temp cleanup (10% chance) ────────────────────────────────────────
        if (Math.random() < 0.1) musicDownloader.cleanTemp();
        
        // ── Auto Recording ───────────────────────────────────────────────────
        if (set.autorecording && m.chat && !m.fromMe && m.isChats) {
            try {
                const userText = m.body || m.text || '';
                await nimesha.presenceSubscribe(m.chat);
                await nimesha.sendPresenceUpdate('available', m.chat);
                await new Promise(r => setTimeout(r, 500));
                await nimesha.sendPresenceUpdate('recording', m.chat);
                const recDelay = Math.max(3000, Math.min(8000, userText.length * 150));
                await new Promise(r => setTimeout(r, recDelay));
                await nimesha.sendPresenceUpdate('paused', m.chat);
            } catch (e) {
                console.log('AutoRecording error:', e.message);
            }
        }
        
    } catch (e) {
        console.error('Main error:', e);
        if (e?.message?.includes('No sessions')) return;
        const errorKey = e?.code || e?.name || e?.message?.slice(0, 100) || 'unknown_error';
        const now = Date.now();
        if (!errorCache[errorKey]) errorCache[errorKey] = [];
        errorCache[errorKey] = errorCache[errorKey].filter(ts => now - ts < 600000);
        if (errorCache[errorKey].length >= 3) return;
        errorCache[errorKey].push(now);
        m.reply('Error: ' + (e?.name || e?.code || e?.output?.statusCode || e?.status || 'Unknown') + '\nError log sent to owner.\n\n');
        return nimesha.sendFromOwner(ownerNumber, `Error occurred:\n\nVersion: ${require('./package.json').version}\n\nLog:\n` + util.format(e), m, { contextInfo: { isForwarded: true } });
    }
};

// ════════════════════════════════════════════════════════════════════════════
// FILE WATCHER — hot reload
// ════════════════════════════════════════════════════════════════════════════
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});