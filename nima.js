process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));
process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err));

/*
    * Created by Infinite Vybeflix
    * Repository: https://github.com/luckyfelistine-bot/maureonix
    * WhatsApp Channel: https://whatsapp.com/channel/0029Vb7IABxCXC3J7ZFFsk2h
*/

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
const templateMenu = require('./lib/template_menu');
const { toAudio, toPTT, toVideo } = require('./lib/converter');
const { GroupUpdate, LoadDataBase } = require('./src/message');
const { JadiBot, StopJadiBot, ListJadiBot } = require('./src/jadibot');
const { cmdAdd, cmdDel, cmdAddHit, addExpired, getPosition, getExpired, getStatus, checkStatus, getAllExpired, checkExpired } = require('./src/database');
const { rdGame, iGame, tGame, gameSlot, gameCasinoSolo, gameSamgongSolo, gameMerampok, gameBegal, daily, buy, setLimit, addLimit, addMoney, setMoney, transfer, Blackjack, SnakeLadder } = require('./lib/game');
const { getRandom, getBuffer, fetchJson, runtime, clockString, sleep, isUrl, formatDate, formatp, generateProfilePicture, errorCache, normalize, updateSettings, parseMention, fixBytes, similarity, pickRandom, tarBackup } = require('./lib/function');

const menfesTimeouts = new Map();
const settingsPath = path.join(__dirname, 'settings.js');
const cases = global.db && global.db.cases ? global.db.cases : (global.db = global.db || {}, global.db.cases = [...fs.readFileSync('./nima.js', 'utf-8').matchAll(/case\s+['"]([^'"]+)['"]/g)].map(match => match[1]));

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
            if (!m.key.fromMe && m.mentionedJid?.length === m.metadata.participanis?.length && db.groups[m.chat].antihidetag && !isCreator && m.isBotAdmin && !m.isAdmin) {
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
        
        // Filter Set Api Key
        if (cases.includes(command) && isCmd && (command !== 'setapikey') && global.APIKeys[global.APIs.nimesha] === 'nz-8ce9753907') {
            return m.reply('.setapikey nz-8ce9753907');
        }
        
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

        // Songs/Videos download - handled in nmd_axis.js
        
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
        
        // TicTacToe
        let room = Object.values(tictactoe).find(room => room.id && room.game && room.state && room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender) && room.state == 'PLAYING');
        if (room) {
            let now = Date.now();
            if (now - (room.lastMove || now) > 5 * 60 * 1000) {
                m.reply('Tic-Tac-Toe game cancelled due to 5 minutes of inactivity.');
                delete tictactoe[room.id];
                return;
            }
            room.lastMove = now;
            let ok, isWin = false, isTie = false, isSurrender = false;
            if (!/^([1-9]|(me)?nyerah|surr?ender|off|skip)$/i.test(m.text)) return;
            isSurrender = !/^[1-9]$/.test(m.text);
            if (m.sender !== room.game.currentTurn) {
                if (!isSurrender) return true;
            }
            if (!isSurrender && 1 > (ok = room.game.turn(m.sender === room.game.playerO, parseInt(m.text) - 1))) {
                m.reply({'-3':'Game ended','-2':'Invalid','-1':'Invalid position',0:'Invalid position'}[ok]);
                return true;
            }
            if (m.sender === room.game.winner) isWin = true;
            else if (room.game.board === 511) isTie = true;
            if (!(room.game instanceof TicTacToe)) {
                room.game = Object.assign(new TicTacToe(room.game.playerX, room.game.playerO), room.game);
            }
            let arr = room.game.render().map(v => ({X: '❌',O: '⭕',1: '1️⃣',2: '2️⃣',3: '3️⃣',4: '4️⃣',5: '5️⃣',6: '6️⃣',7: '7️⃣',8: '8️⃣',9: '9️⃣'}[v]));
            if (isSurrender) {
                room.game._currentTurn = m.sender === room.game.playerX;
                isWin = true;
            }
            let winner = isSurrender ? room.game.currentTurn : room.game.winner;
            if (isWin) {
                db.users[m.sender].limit += 3;
                db.users[m.sender].money += 3000;
            }
            let str = `Room ID: ${room.id}\n\n${arr.slice(0, 3).join('')}\n${arr.slice(3, 6).join('')}\n${arr.slice(6).join('')}\n\n${isWin ? `@${winner.split('@')[0]} wins!` : isTie ? `Game drawn` : `Turn: ${['❌', '⭕'][1 * room.game._currentTurn]} (@${room.game.currentTurn.split('@')[0]})`}\n❌: @${room.game.playerX.split('@')[0]}\n⭕: @${room.game.playerO.split('@')[0]}\n\nType *nyerah* to surrender.`;
            if ((room.game._currentTurn ^ isSurrender ? room.x : room.o) !== m.chat)
                room[room.game._currentTurn ^ isSurrender ? 'x' : 'o'] = m.chat;
            if (room.x !== room.o) await nimesha.sendMessage(room.x, { text: str, mentions: parseMention(str) }, { quoted: m });
            await nimesha.sendMessage(room.o, { text: str, mentions: parseMention(str) }, { quoted: m });
            if (isTie || isWin) delete tictactoe[room.id];
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
                if (!roof.choice1) nimesha.sendMessage(roof.p, { text: `📌 Choose your option:\n\n🗿 Rock\n📄 Paper\n✂️ Scissors` }, { quoted: m });
                if (!roof.choice2) nimesha.sendMessage(roof.p2, { text: `📌 Choose your option:\n\n🗿 Rock\n📄 Paper\n✂️ Scissors` }, { quoted: m });
            }
            let jwb = m.sender == roof.p, jwb2 = m.sender == roof.p2;
            let g = /scissors/i, b = /rock/i, k = /paper/i, reg = /^(rock|paper|scissors)/i;
            
            if (jwb && reg.test(m.text) && !roof.choice1 && !m.isGroup) {
                roof.choice1 = reg.exec(m.text.toLowerCase())[0];
                roof.text = m.text;
                m.reply(`You chose ${m.text} ${!roof.choice2 ? `\n\nWaiting for the opponent's choice.` : ''}`);
                if (!roof.choice2) nimesha.sendMessage(roof.p2, { text: '_Opponent has chosen._\nNow it\'s your turn.' });
            }
            if (jwb2 && reg.test(m.text) && !roof.choice2 && !m.isGroup) {
                roof.choice2 = reg.exec(m.text.toLowerCase())[0];
                roof.text2 = m.text;
                m.reply(`You chose ${m.text} ${!roof.choice1 ? `\n\nWaiting for the opponent's choice.` : ''}`);
                if (!roof.choice1) nimesha.sendMessage(roof.p, { text: '_Opponent has chosen._\nNow it\'s your turn.' });
            }
            let stage = roof.choice1;
            let stage2 = roof.choice2;
            if (roof.choice1 && roof.choice2) {
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
                        jawaban = game[m.chat + id].jawaban;
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
                        jawaban = game[m.chat + id].jawaban;
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
        
        if (isCmd || fileSha256) switch(fileSha256 || command) {
            // Template case (unused)
            case '19rujxl1e': {
                console.log('.');
            }
            break
            
            // Owner Menu
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
                        try { await nimesha.query({ tag: 'iq', attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'blocklist' }, content: [{ tag: 'item', attrs: { action: 'block', jid: jid } }] }); } catch {}
                        try { await nimesha.query({ tag: 'iq', attrs: { to: 's.whatsapp.net', type: 'set', id: nimesha.generateMessageTag(), xmlns: 'blocklist' }, content: [{ tag: 'item', attrs: { action: 'block', jid: jid } }] }); } catch {}
                        try { await nimesha.sendNode({ tag: 'iq', attrs: { to: 's.whatsapp.net', type: 'set', id: nimesha.generateMessageTag(), xmlns: 'blocklist' }, content: [{ tag: 'item', attrs: { action: 'block', jid: jid } }] }); } catch {}
                        try { await nimesha.ws?.sendNode?.({ tag: 'iq', attrs: { to: 's.whatsapp.net', type: 'set', xmlns: 'blocklist', id: nimesha.generateMessageTag() }, content: [{ tag: 'item', attrs: { action: 'block', jid: jid } }] }); } catch {}
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
                            content: [{ tag: 'item', attrs: { action: 'unblock', jid: jid } }]
                        });
                        _umethods['m2'] = (_umethods['m2'] || 0) + 1;
                        return true;
                    } catch {}
                    try {
                        await nimesha.sendNode({
                            tag: 'iq',
                            attrs: { to: 's.whatsapp.net', type: 'set', id: nimesha.generateMessageTag(), xmlns: 'blocklist' },
                            content: [{ tag: 'item', attrs: { action: 'unblock', jid: jid } }]
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
                let old_key = global.APIKeys[global.APIs.nimesha];
                await updateSettings({
                    filePath: settingsPath,
                    apikey: text.trim()
                });
                m.reply(`✅ *API Key* *${old_key}* *→* *${q}* *changed!*`);
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
            
            // Group Menu
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
            
            // Bot Menu
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
            case 'req': case 'request': {
                if (!text) return m.reply('What do you want to request from the owner?');
                await m.reply(`*Request sent to owner*\n_Thank you🙏_`);
                await nimesha.sendFromOwner(ownerNumber, `Message from: @${m.sender.split('@')[0]}\nTo Owner\n\nRequest: ${text}`, m, { contextInfo: { mentionedJid: [m.sender], isForwarded: true }});
            }
            break
            case 'totalfitur': {
                const total = ((fs.readFileSync('./nima.js').toString()).match(/case '/g) || []).length;
                const _msg_totalfitur = await m.reply('⏳ 📋 *Counting...*');
                await nimesha.sendMessage(m.chat, { text: `📊 *Total Commands:* ${total}`, edit: _msg_totalfitur.key });
            }
            break
            case 'daily': case 'claim': {
                daily(m, db);
            }
            break
            case 'transfer': case 'tf': {
                transfer(m, args, db);
            }
            break
            case 'buy': {
                buy(m, args, db);
            }
            break
            case 'react': {
                nimesha.sendMessage(m.chat, { react: { text: args[0], key: m.quoted ? m.quoted.key : m.key }});
            }
            break
            case 'tagme': {
                m.reply(`@${m.sender.split('@')[0]}`, {mentions: [m.sender]});
            }
            break
            case 'runtime': case 'tes': case 'bot': {
                switch(args[0]) {
                    case 'mode': case 'public': case 'self':
                    if (!isCreator) return m.reply(mess.owner);
                    if (args[1] == 'public' || args[1] == 'all') {
                        if (nimesha.public && set.grouponly && set.privateonly) return m.reply('*Already enabled*');
                        nimesha.public = set.public = true;
                        set.grouponly = true;
                        set.privateonly = true;
                        m.reply('*Successfully changed to Public*');
                    } else if (args[1] == 'self') {
                        set.grouponly = false;
                        set.privateonly = false;
                        nimesha.public = set.public = false;
                        m.reply('*Successfully changed to Self*');
                    } else if (args[1] == 'group') {
                        set.grouponly = true;
                        set.privateonly = false;
                        m.reply('*Successfully changed to Group Only*');
                    } else if (args[1] == 'private') {
                        set.grouponly = false;
                        set.privateonly = true;
                        m.reply('*Successfully changed to Private Only*');
                    } else m.reply('Mode: self/public/group/private/all');
                    break
                    case 'anticall': case 'autobio': case 'autoread': case 'autotyping': case 'readsw': case 'multiprefix': case 'antispam': case 'antidelete': case 'autostatus': case 'autostatusreact': case 'autorecording': case 'didyoumean':
                    if (!isCreator) return m.reply(mess.owner);
                    if (args[1] == 'on') {
                        if (set[args[0]]) return m.reply('*Already enabled*');
                        set[args[0]] = true;
                        m.reply('*Successfully changed to On*');
                    } else if (args[1] == 'off') {
                        set[args[0]] = false;
                        m.reply('*Successfully changed to Off*');
                    } else m.reply(`${args[0].charAt(0).toUpperCase() + args[0].slice(1)} on/off`);
                    break
                    case 'set': case 'settings':
                    let settingsBot = Object.entries(set).map(([key, value]) => {
                        let list = key == 'status' ? new Date(value).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : (typeof value === 'boolean') ? (value ? 'on🟢' : 'off🔴') : (typeof value === 'object') ? `\n${value.map(a => '- ' + a).join('\n')}` : value;
                        return `- ${key.charAt(0).toUpperCase() + key.slice(1)} : ${list}`;
                    }).join('\n');
                    m.reply(`Settings Bot @${botNumber.split('@')[0]}\n${settingsBot}\n\nExample: ${prefix + command} mode`);
                    break
                    default:
                if (args[0] || args[1]) {
                    if (command !== 'bot') return;
                    const validSettings = ['mode', 'anticall', 'antidelete', 'autostatus', 'autostatusreact', 'autorecording', 'autobio', 'autoread', 'autotyping', 'readsw', 'multiprefix'];
                    
                    if (!validSettings.includes(args[0])) {
                        return m.reply(`❌ *Invalid command!*\n\n✅ Valid commands:\n\n${validSettings.map(s => `${prefix}bot ${s} on/off`).join('\n')}`);
                    }
                    
                    m.reply(`*Please choose a setting:*\n- Mode : *${prefix + command} mode self/public*\n- Anti Call : *${prefix + command} anticall on/off*\n- Anti Delete : *${prefix + command} antidelete on/off*\n- Auto Status : *${prefix + command} autostatus on/off*\n- Auto Status React : *${prefix + command} autostatusreact on/off*\n- Auto Recording : *${prefix + command} autorecording on/off*\n- Auto Bio : *${prefix + command} autobio on/off*\n- Auto Read : *${prefix + command} autoread on/off*\n- Auto Typing : *${prefix + command} autotyping on/off*\n- Read Sw : *${prefix + command} readsw on/off*\n- Multi Prefix : *${prefix + command} multiprefix on/off*`);
                }
                }
            }
            break
            case 'ping': case 'botstatus': case 'statusbot': {
                const used = process.memoryUsage();
                const cpus = os.cpus().map(cpu => {
                    cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0);
                    return cpu;
                });
                const cpu = cpus.reduce((last, cpu, _, { length }) => {
                    last.total += cpu.total;
                    last.speed += cpu.speed / length;
                    last.times.user += cpu.times.user;
                    last.times.nice += cpu.times.nice;
                    last.times.sys += cpu.times.sys;
                    last.times.idle += cpu.times.idle;
                    last.times.irq += cpu.times.irq;
                    return last;
                }, {
                    speed: 0,
                    total: 0,
                    times: {
                        user: 0,
                        nice: 0,
                        sys: 0,
                        idle: 0,
                        irq: 0
                    }
                });
                let timestamp = speed();
                let latensi = speed() - timestamp;
                neww = performance.now();
                oldd = performance.now();
                respon = `Response speed ${latensi.toFixed(4)} _Seconds_ \n ${oldd - neww} _milliseconds_\n\nRuntime: ${runtime(process.uptime())}\n\n💻 Server Info\nRAM: ${formatp(os.totalmem() - os.freemem())} / ${formatp(os.totalmem())}\n\n_NodeJS Memory Usage_\n${Object.keys(used).map((key, _, arr) => `${key.padEnd(Math.max(...arr.map(v=>v.length)),' ')}: ${formatp(used[key])}`).join('\n')}\n\n${cpus[0] ? `_CPU Usage_\n${cpus[0].model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}\n_CPU Core(s) Usage (${cpus.length} Core CPU)_\n${cpus.map((cpu, i) => `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}`).join('\n\n')}` : ''}`.trim();
                m.reply(respon);
            }
            break
            case 'speedtest': case 'speed': {
                const speedMsg = await m.reply('⚡ *Running speed test...*');
                let cp = require('child_process');
                let { promisify } = require('util');
                let exec = promisify(cp.exec).bind(cp);
                let o;
                try {
                    o = await exec('python3 speed.py --share');
                } catch (e) {
                    o = e;
                } finally {
                    let { stdout, stderr } = o;
                    const result = stdout?.trim() || stderr?.trim() || '❌ Speed test failed';
                    if (speedMsg?.key) await nimesha.sendMessage(m.chat, { text: result, edit: speedMsg.key });
                    else await m.reply(result);
                }
            }
            break
            case 'afk': {
                let user = db.users[m.sender];
                user.afkTime = + new Date;
                user.afkReason = text;
                const _msg_afk = await m.reply('⏳ *Setting...*');
                await nimesha.sendMessage(m.chat, { text: `💤 @${m.sender.split('@')[0]} AFK mode ON${text ? ' — _' + text + '_' : ''}`, edit: _msg_afk.key });
            }
            break
            case 'readviewonce': case 'readviewone': case 'rvo': {
                if (!m.quoted) return m.reply(`Reply to a view once message.\nExample: ${prefix + command}`);
                try {
                    if (m.quoted.msg.viewOnce) {
                        delete m.quoted.chat;
                        m.quoted.msg.viewOnce = false;
                        await m.reply({ forward: m.quoted });
                    } else m.reply(`Reply to a view once message.\nExample: ${prefix + command}`);
                } catch (e) {
                    m.reply('Invalid media!');
                }
            }
            break
            case 'inspect': {
                if (!text) return m.reply('Enter a group or channel link!');
                let _grup = /chat.whatsapp.com\/([\w\d]*)/;
                let _saluran = /whatsapp\.com\/channel\/([\w\d]*)/;
                if (_grup.test(text)) {
                    await nimesha.groupGetInviteInfo(text.match(_grup)[1]).then((_g) => {
                        let teks = `*[ INFORMATION GROUP ]*\n\nName: ${_g.subject}\nGroup ID: ${_g.id}\nCreated: ${new Date(_g.creation * 1000).toLocaleString()}${_g.owner ? ('\nCreated by: ' + _g.owner) : '' }\nLinked Parent: ${_g.linkedParent}\nRestrict: ${_g.restrict}\nAnnounce: ${_g.announce}\nIs Community: ${_g.isCommunity}\nCommunity Announce:${_g.isCommunityAnnounce}\nJoin Approval: ${_g.joinApprovalMode}\nMember Add Mode: ${_g.memberAddMode}\nDescription ID: ${'`' + _g.descId + '`'}\nDescription: ${_g.desc}\nParticipants:\n`;
                        _g.participants.forEach((a) => {
                            teks += a.admin ? `- Admin: @${a.id.split('@')[0]} [${a.admin}]\n` : '';
                        });
                        m.reply(teks);
                    }).catch((e) => {
                        if ([400, 406].includes(e.data)) return m.reply('Group not found❗');
                        if (e.data == 401) return m.reply('Bot has been kicked from the group❗');
                        if (e.data == 410) return m.reply('Group URL has been reset❗');
                    });
                } else if (_saluran.test(text) || text.endsWith('@newsletter') || !isNaN(text)) {
                    await nimesha.newsletterMsg(text.match(_saluran)[1]).then((n) => {
                        m.reply(`*[ INFORMATION CHANNEL ]*\n\nID: ${n.id}\nState: ${n.state.type}\nName: ${n.thread_metadata.name.text}\nCreated: ${new Date(n.thread_metadata.creation_time * 1000).toLocaleString()}\nSubscribers: ${n.thread_metadata.subscribers_count}\nVerification: ${n.thread_metadata.verification}\nDescription: ${n.thread_metadata.description.text}\n`);
                    }).catch((e) => m.reply('Channel not found❗'));
                } else m.reply('Only group or channel URLs are supported!');
            }
            break
            case 'addmsg': {
                if (!m.quoted) return m.reply('Reply to the message you want to save to the database.');
                if (!text) return m.reply(`Example: ${prefix + command} file name`);
                let msgs = db.database;
                if (text.toLowerCase() in msgs) return m.reply(`✅ *'${text}'* is already registered in the list!`);
                msgs[text.toLowerCase()] = m.quoted;
                delete msgs[text.toLowerCase()].chat;
                m.reply(`Successfully saved message as '${text}'\nUse ${prefix}getmsg ${text} to retrieve it\nUse ${prefix}listmsg to see the list`);
            }
            break
            case 'delmsg': case 'deletemsg': {
                if (!text) return m.reply('Which message name to delete?');
                let msgs = db.database;
                if (text == 'allmsg') {
                    db.database = {};
                    m.reply('All messages have been deleted from the list.');
                } else {
                    if (!(text.toLowerCase() in msgs)) return m.reply(`❌ *'${text}'* not in the list!`);
                    delete msgs[text.toLowerCase()];
                    m.reply(`Successfully deleted '${text}' from the list.`);
                }
            }
            break
            case 'getmsg': {
                if (!text) return m.reply(`Example: ${prefix + command} file name\nUse ${prefix}listmsg to see the list`);
                let msgs = db.database;
                if (!(text.toLowerCase() in msgs)) return m.reply(`❌ *'${text}'* not in the list!`);
                await nimesha.relayMessage(m.chat, msgs[text.toLowerCase()], {});
            }
            break
            case 'listmsg': {
                let seplit = Object.entries(db.database).map(([nama, isi]) => { return { nama, message: getContentType(isi) }});
                let teks = '「 DATABASE LIST 」\n\n';
                for (let i of seplit) {
                    teks += `${setv} *Name:* ${i.nama}\n${setv} *Type:* ${i.message?.replace(/Message/i, '')}\n───────────────\n`;
                }
                m.reply(teks);
            }
            break
            case 'setcmd': case 'addcmd': {
                if (!m.quoted) return m.reply('Reply to the media (sticker/image) to set as command!');
                if (!m.quoted.fileSha256) return m.reply('nima base hash code missing. Sorry!');
                if (!text) return m.reply(`Example: ${prefix + command} command name`);
                let hash = m.quoted.fileSha256.toString('base64');
                if (global.db.cmd[hash] && global.db.cmd[hash].locked) return m.reply('You are not allowed to change this sticker command.');
                global.db.cmd[hash] = {
                    creator: m.sender,
                    locked: false,
                    at: + new Date,
                    text
                };
                m.reply('Success!');
            }
            break
            case 'delcmd': {
                if (!m.quoted) return m.reply('Reply to the media (sticker/image) to remove command!');
                if (!m.quoted.fileSha256) return m.reply('nima base hash code missing. Sorry!');
                let hash = m.quoted.fileSha256.toString('base64');
                if (global.db.cmd[hash] && global.db.cmd[hash].locked) return m.reply('You are not allowed to change this sticker command.');
                delete global.db.cmd[hash];
                m.reply('Success');
            }
            break
            case 'listcmd': {
                let teks = `*Hash List*\nInfo: *bold* hash is locked\n${Object.entries(global.db.cmd).map(([key, value], index) => `${index + 1}. ${value.locked ? `*${key}*` : key} : ${value.text}`).join('\n')}`.trim();
                nimesha.sendText(m.chat, teks, m);
            }
            break
            case 'lockcmd': case 'unlockcmd': {
                if (!isCreator) return m.reply(mess.owner);
                if (!m.quoted) return m.reply('Reply to the media (sticker/image) to lock/unlock command!');
                if (!m.quoted.fileSha256) return m.reply('nima base hash code missing. Sorry!');
                let hash = m.quoted.fileSha256.toString('base64');
                if (!(hash in global.db.cmd)) return m.reply('Sticker command not found.');
                global.db.cmd[hash].locked = !/^un/i.test(command);
            }
            break
            case 'q': case 'quoted': {
                if (!m.quoted) return m.reply('Reply to a message!');
                if (text) {
                    delete m.quoted.chat;
                    await m.reply({ forward: m.quoted });
                } else {
                    try {
                        const anu = await m.getQuotedObj();
                        if (!anu) return m.reply('Cannot get format!');
                        if (!anu.quoted) return m.reply('The message you replied to has no quoted message.');
                        await nimesha.relayMessage(m.chat, { [anu.quoted.type]: anu.quoted.msg }, {});
                    } catch (e) {
                        return m.reply('Cannot get format!');
                    }
                }
            }
            break
            case 'confes': case 'confess': case 'menfes': case 'menfess': {
                if (!isLimit) return m.reply(mess.limit);
                if (m.isGroup) return m.reply(mess.private);
                if (menfes[m.sender]) return m.reply(`⚠️ You are already in a ${command} session!`);
                if (!text) return m.reply(`Example: ${prefix + command} 254xxxx|Anonymous name`);
                let [teks1, teks2] = text.split`|`;
                if (teks1) {
                    const tujuan = teks1.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                    const onWa = await nimesha.onWhatsApp(tujuan);
                    if (!onWa.length > 0) return m.reply('That number is not registered on WhatsApp!');
                    menfes[m.sender] = {
                        tujuan: tujuan,
                        nama: teks2 ? teks2 : 'Someone'
                    };
                    menfes[tujuan] = {
                        tujuan: m.sender,
                        nama: 'Receiver',
                    };
                    const timeout = setTimeout(() => {
                        if (menfes[m.sender]) {
                            m.reply(`⏰ _Session expired!_`);
                            delete menfes[m.sender];
                        }
                        if (menfes[tujuan]) {
                            nimesha.sendMessage(tujuan, { text: `⏰ _Session expired!_` });
                            delete menfes[tujuan];
                        }
                        menfesTimeouts.delete(m.sender);
                        menfesTimeouts.delete(tujuan);
                    }, 600000);
                    menfesTimeouts.set(m.sender, timeout);
                    menfesTimeouts.set(tujuan, timeout);
                    nimesha.sendMessage(tujuan, { text: `_${command} session started._\n*Note:* Type _*${prefix}del${command}*_ to end it.` });
                    m.reply(`_Starting ${command}..._\n*Start sending messages/media*\n*Duration: 10 minutes*\n*Note:* Type _*${prefix}del${command}*_ to end.`);
                    setLimit(m, db);
                } else m.reply(`📌 Enter the number!\nExample: ${prefix + command} 254xxxx|Anonymous name`);
            }
            break
            case 'delconfes': case 'delconfess': case 'delmenfes': case 'delmenfess': {
                if (!menfes[m.sender]) return m.reply(`⚠️ You are not in a ${command.split('del')[1]} session!`);
                let anu = menfes[m.sender];
                if (menfesTimeouts.has(m.sender)) {
                    clearTimeout(menfesTimeouts.get(m.sender));
                    menfesTimeouts.delete(m.sender);
                }
                if (menfesTimeouts.has(anu.tujuan)) {
                    clearTimeout(menfesTimeouts.get(anu.tujuan));
                    menfesTimeouts.delete(anu.tujuan);
                }
                nimesha.sendMessage(anu.tujuan, { text: `Chat ended by ${anu.nama ? anu.nama : 'Someone'}` });
                m.reply(`Successfully ended ${command.split('del')[1]} session!`);
                delete menfes[anu.tujuan];
                delete menfes[m.sender];
            }
            break
            case 'cai': case 'roomai': case 'chatai': case 'autoai': {
                if (m.isGroup) return m.reply(mess.private);
                if (chat_ai[m.sender]) return m.reply(`⚠️ You are already in a ${command} session!`);
                if (!text) return m.reply(`📌 *AI Chat Command*\nExample: ${prefix + command} Hello!\nWith prompt: ${prefix + command} Hello|You are Maureonix.\n\nTo exit room: *${prefix + 'del' + command}*`);
                let [teks1, teks2] = text.split`|`;
                chat_ai[m.sender] = [{ role: 'system', content: teks2 || '' }, { role: 'user', content: text.split`|` ? teks1 : text || '' }];
                let hasil = await fetchApi('/ai/chat4', {
                    messages: chat_ai[m.sender],
                    prompt: budy
                }, { method: 'POST' });
                const response = hasil?.result?.message || 'Sorry, I don\'t understand.';
                chat_ai[m.sender].push({ role: 'assistant', content: response });
                await m.reply(response);
            }
            break
            case 'delcai': case 'delroomai': case 'delchatai': case 'delautoai': {
                if (!chat_ai[m.sender]) return m.reply(`⚠️ You are not in a ${command.split('del')[1]} session!`);
                m.reply(`Successfully ended ${command.split('del')[1]} session!`);
                delete chat_ai[m.sender];
            }
            break
            // ===== Gemini Auto Reply Commands =====
            case 'autoreply': {
                if (!m.isGroup) return m.reply(`⚠️ *Private Chat AI*\n\nPrivate chat AI control:\n✅ on: *${prefix}aion*\n❌ off: *${prefix}aioff*\n\n💡 Group AI: *${prefix}groupai on/off*`);
                if (!isAdmin && !isCreator) return m.reply('⚠️ Group Admin only!');
                if (!text || !['on','off'].includes(text.toLowerCase())) return m.reply(`*Gemini Auto Reply (Group)*\n\n✅ Enable: *${prefix}autoreply on*\n❌ Disable: *${prefix}autoreply off*\n\nStatus: ${gemini_autoreply[m.chat] ? '✅ ON' : '❌ OFF'}`);
                if (text.toLowerCase() === 'on') {
                    gemini_autoreply[m.chat] = true;
                    m.reply(`✅ *Gemini Auto Reply ON!*\n\nNow *this group* will automatically reply to every message with AI 🤖`);
                } else {
                    gemini_autoreply[m.chat] = false;
                    m.reply(`❌ *Gemini Auto Reply OFF!*\n\nAI auto reply has been disabled.`);
                }
            }
            break
            case 'aion': case 'privateai': {
                if (m.isGroup) return m.reply(`💡 Use this in private chat only!\nGroup AI: *${prefix}groupai on*`);
                if (!isCreator) return m.reply(mess.owner);
                db.game.private_ai_disabled = false;
                m.reply(`✅ *Private Chat AI ON!*\n\nAI autoreply enabled in private chat.`);
            }
            break
            case 'aioff': case 'stopai': {
                if (m.isGroup) return m.reply(`💡 Use this in private chat only!\nGroup AI: *${prefix}groupai off*`);
                if (!isCreator) return m.reply(mess.owner);
                db.game.private_ai_disabled = true;
                m.reply(`❌ *Private Chat AI OFF!*\n\nAI autoreply disabled in private chat.`);
            }
            break
            case 'groupai': {
                if (!m.isGroup) return m.reply(`💡 Use this in group chat only!\nPrivate AI: *${prefix}aion* / *${prefix}aioff*`);
                if (!isAdmin && !isCreator) return m.reply('⚠️ Group Admin only!');
                if (!text || !['on','off'].includes(text.toLowerCase())) return m.reply(`*Group AI Auto Reply*\n\n✅ Enable: *${prefix}groupai on*\n❌ Disable: *${prefix}groupai off*\n\nStatus: ${gemini_autoreply[m.chat] ? '✅ ON' : '❌ OFF'}\n\n💡 This applies only to this group.`);
                if (text.toLowerCase() === 'on') {
                    gemini_autoreply[m.chat] = true;
                    m.reply(`✅ *Group AI ON!*\n\n*${m.isGroup ? m.metadata?.subject || 'This group' : ''}* will now have AI autoreply.\nOther groups are not affected. 🤖`);
                } else {
                    gemini_autoreply[m.chat] = false;
                    m.reply(`❌ *Group AI OFF!*\n\nAI auto reply disabled.`);
                }
            }
            break
            case 'clearai': case 'resetai': {
                const histKeyDel = m.isGroup ? m.chat : m.sender;
                if (gemini_history[histKeyDel]) {
                    delete gemini_history[histKeyDel];
                    m.reply('🗑️ *AI conversation history cleared!*\n\nA new conversation begins.');
                } else {
                    m.reply('⚠️ No history found.');
                }
            }
            break
            // ===== End Gemini Commands =====
            case 'jadibot': {
                if (!isPremium) return m.reply(mess.prem);
                if (!isLimit) return m.reply(mess.limit);
                const nmrnya = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender;
                const onWa = await nimesha.onWhatsApp(nmrnya);
                if (!onWa.length > 0) return m.reply('That number is not registered on WhatsApp!');
                await JadiBot(nimesha, nmrnya, m, store);
                m.reply(`Use ${prefix}stopjadibot\nto stop it.`);
                setLimit(m, db);
            }
            break
            case 'stopjadibot': case 'deljadibot': {
                const nmrnya = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender;
                const onWa = await nimesha.onWhatsApp(nmrnya);
                if (!onWa.length > 0) return m.reply('That number is not registered on WhatsApp!');
                await StopJadiBot(nimesha, nmrnya, m);
            }
            break
            case 'listjadibot': {
                ListJadiBot(nimesha, m);
            }
            break
            
            // Tools Menu
            case 'fetch': case 'get': {
                if (!isPremium) return m.reply(mess.prem);
                if (!isLimit) return m.reply(mess.limit);
                if (!/^https?:\/\//.test(text)) return m.reply('Start with http:// or https://');
                try {
                    const res = await axios.get(isUrl(text) ? isUrl(text)[0] : text);
                    if (!/text|json|html|plain/.test(res.headers['content-type'])) {
                        await m.reply(text);
                    } else m.reply(util.format(res.data));
                    setLimit(m, db);
                } catch (e) {
                    m.reply(String(e));
                }
            }
            break
            case 'toaud': case 'toaudio': {
                if (!/video|audio/.test(mime)) return m.reply(`Reply/Send a video/audio with caption ${prefix + command} to convert to audio.`);
                m.reply(mess.wait);
                let media = await quoted.download();
                let audio = await toAudio(media, 'mp4');
                await m.reply({ audio: audio, mimetype: 'audio/mpeg'});
            }
            break
            case 'tomp3': {
                if (!/video|audio/.test(mime)) return m.reply(`Reply/Send a video/audio with caption ${prefix + command} to convert to MP3.`);
                m.reply(mess.wait);
                let media = await quoted.download();
                let audio = await toAudio(media, 'mp4');
                await m.reply({ document: audio, mimetype: 'audio/mpeg', fileName: `Converted By Maureonix.mp3`});
            }
            break
            case 'tovn': case 'toptt': case 'tovoice': {
                if (!/video|audio/.test(mime)) return m.reply(`Reply/Send a video/audio with caption ${prefix + command} to convert to voice note.`);
                m.reply(mess.wait);
                let media = await quoted.download();
                let audio = await toPTT(media, 'mp4');
                await m.reply({ audio: audio, mimetype: 'audio/ogg; codecs=opus', ptt: true });
            }
            break
            case 'togif': {
                if (!/webp|video/.test(mime)) return m.reply(`📌 Reply to a video/sticker (caption: *${prefix + command}*)`);
                m.reply(mess.wait);
                let media = await nimesha.downloadAndSaveMediaMessage(qmsg);
                let ran = `./database/temp/${getRandom('.gif')}`;
                exec(`convert ${media} ${ran}`, (err) => {
                    fs.unlinkSync(media);
                    if (err) return m.reply('Failed❗');
                    let buffer = fs.readFileSync(ran);
                    m.reply({ video: buffer, gifPlayback: true });
                    fs.unlinkSync(ran);
                });
            }
            break
            case 'toimage': case 'toimg': {
                if (!/webp|video|image/.test(mime)) return m.reply(`📌 Reply to a video/sticker (caption: *${prefix + command}*)`);
                m.reply(mess.wait);
                let media = await nimesha.downloadAndSaveMediaMessage(qmsg);
                let ran = `./database/temp/${getRandom('.png')}`;
                exec(`convert ${media}[0] ${ran}`, (err) => {
                    fs.unlinkSync(media);
                    if (err) return m.reply('Failed❗');
                    let buffer = fs.readFileSync(ran);
                    m.reply({ image: buffer });
                    fs.unlinkSync(ran);
                });
            }
            break
            case 'toptv': {
                if (!/video/.test(mime)) return m.reply(`📌 Reply to a video with caption ${prefix + command}`);
                if ((m.quoted ? m.quoted.type : m.type) === 'videoMessage') {
                    const anu = await quoted.download();
                    const message = await generateWAMessageContent({ video: anu }, { upload: nimesha.waUploadToServer });
                    await nimesha.relayMessage(m.chat, { ptvMessage: message.videoMessage }, {});
                } else m.reply('Reply to a video to convert to PTV!');
            }
            break
            case 'tourl': {
                try {
                    if (/webp|video|sticker|audio|jpg|jpeg|png/.test(mime)) {
                        m.reply(mess.wait);
                        let media = await quoted.download();
                        let anu = await UguuSe(media);
                        m.reply('URL: ' + anu.url);
                    } else m.reply('Send media to upload!');
                } catch (e) {
                    m.reply('Upload server offline!');
                }
            }
            break
            case 'texttospech': case 'tts': case 'tospech': {
                if (!text) return m.reply('Which text do you want to convert to audio?');
                let anu = await fetchApi('/tools/tts', { text }, { buffer: true });
                m.reply({ audio: anu, ptt: true, mimetype: 'audio/mpeg' });
            }
            break
            case 'translate': case 'tr': {
                if (text && text == 'list') {
                    let list_tr = `╭──❍「 *Language Code* 」❍\n│• af : Afrikaans\n│• ar : Arabic\n│• zh : Chinese\n│• en : English\n│• en-us : English (United States)\n│• fr : French\n│• de : German\n│• hi : Hindi\n│• hu : Hungarian\n│• is : Icelandic\n│• id : Indonesian\n│• it : Italian\n│• ja : Japanese\n│• ko : Korean\n│• la : Latin\n│• no : Norwegian\n│• pt : Portuguese\n│• pt : Portuguese\n│• pt-br : Portuguese (Brazil)\n│• ro : Romanian\n│• ru : Russian\n│• sr : Serbian\n│• es : Spanish\n│• sv : Swedish\n│• ta : Tamil\n│• th : Thai\n│• tr : Turkish\n│• vi : Vietnamese\n╰──────❍`;
                    m.reply(list_tr);
                } else {
                    if (!m.quoted && (!text|| !args[1])) return m.reply(`📌 Reply/Send text (caption: *${prefix + command}*)`);
                    let lang = args[0] ? args[0] : 'id';
                    let teks = args[1] ? args.slice(1).join(' ') : m.quoted.text;
                    try {
                        let hasil = await fetchApi('/tools/translate', { text: teks, lang });
                        m.reply(`Target: ${lang}\n${hasil.result.translate}`);
                    } catch (e) {
                        m.reply(`Language *${lang}* not found!\nSee list with ${prefix + command} list`);
                    }
                }
            }
            break
            case 'toqr': case 'qr': {
                if (!text) return m.reply(`Text to convert to QR *${prefix + command}* text`);
                m.reply(mess.wait);
                let anu = await fetchApi('/tools/to-qr', { data: text }, { buffer: true });
                await m.reply({ image: anu, caption: 'Take it' });
            }
            break
            case 'tohd': case 'remini': case 'hd': {
                if (!isLimit) return m.reply(mess.limit);
                if (/image/.test(mime)) {
                    try {
                        let media = await quoted.download();
                        const form = new FormData();
                        form.append('buffer', media, {
                            filename: 'image.jpg',
                            contentType: 'image/jpeg'
                        });
                        let hasil = await fetchApi('/tools/remini', form, { buffer: true });
                        m.reply({ image: hasil, caption: 'Okay' });
                        setLimit(m, db);
                    } catch (e) {
                        let media = await nimesha.downloadAndSaveMediaMessage(qmsg);
                        let ran = `./database/temp/${getRandom('.jpg')}`;
                        const scaleFactor = isNaN(parseInt(text)) ? 4 : parseInt(text) < 10 ? parseInt(text) : 4;
                        exec(`ffmpeg -i "${media}" -vf "scale=iw*${scaleFactor}:ih*${scaleFactor}:flags=lanczos" -q:v 1 "${ran}"`, async (err, stderr, stdout) => {
                            fs.unlinkSync(media);
                            if (err) return m.reply(String(err));
                            let buff = fs.readFileSync(ran);
                            await nimesha.sendMedia(m.chat, buff, '', 'Okay', m);
                            fs.unlinkSync(ran);
                            setLimit(m, db);
                        });
                    }
                } else m.reply(`📌 Reply/Send an image\nExample: ${prefix + command}`);
            }
            break
            case 'dehaze': case 'colorize': case 'colorfull': {
                if (!isLimit) return m.reply(mess.limit);
                if (/image/.test(mime)) {
                    let media = await quoted.download();
                    const form = new FormData();
                    form.append('buffer', media, {
                        filename: 'image.jpg',
                        contentType: 'image/jpeg'
                    });
                    let hasil = await fetchApi('/tools/recolor', form, { buffer: true });
                    m.reply({ image: hasil, caption: 'Okay' });
                    setLimit(m, db);
                } else m.reply(`📌 Reply/Send an image\nExample: ${prefix + command}`);
            }
            break
            case 'hitamkan': case 'toblack': {
                if (!isLimit) return m.reply(mess.limit);
                if (/image/.test(mime)) {
                    let media = await quoted.download();
                    const form = new FormData();
                    form.append('style', 'summer');
                    form.append('buffer', media, {
                        filename: 'image.jpg',
                        contentType: 'image/jpeg'
                    });
                    let hasil = await fetchApi('/create/skin-tone', form, { buffer: true });
                    m.reply({ image: hasil, caption: 'Okay' });
                    setLimit(m, db);
                } else m.reply(`📌 Reply/Send an image\nExample: ${prefix + command}`);
            }
            break
            case 'ssweb': {
                if (!isPremium) return m.reply(mess.prem);
                if (!text) return m.reply(`Example: ${prefix + command} https://github.com/luckyfelistine-bot/maureonix`);
                try {
                    let anu = 'https://' + text.replace(/^https?:\/\//, '');
                    let hasil = await fetchApi('/tools/ss', { url: anu }, { buffer: true });
                    await m.reply({ image: hasil, caption: 'Okay' });
                    setLimit(m, db);
                } catch (e) {
                    m.reply('SS Web server offline!');
                }
            }
            break
            case 'readmore': {
                let teks1 = text.split`|`[0] ? text.split`|`[0] : '';
                let teks2 = text.split`|`[1] ? text.split`|`[1] : '';
                const _msg_readmore = await m.reply('⏳ *Processing...*');
                await nimesha.sendMessage(m.chat, { text: teks1 + readmore + teks2, edit: _msg_readmore.key });
            }
            break
            case 'getexif': {
                if (!m.quoted) return m.reply(`Reply to a sticker with caption ${prefix + command}`);
                if (!/sticker|webp/.test(quoted.type)) return m.reply(`Reply to a sticker with caption ${prefix + command}`);
                const img = new webp.Image();
                await img.load(await m.quoted.download());
                if (!img.exif) return m.reply('This sticker has no metadata/EXIF.');
                try {
                    const exifData = JSON.parse(img.exif.slice(22).toString());
                    m.reply(util.format(exifData));
                } catch (e) {
                    m.reply(`⚠️ Sticker has EXIF, but not in JSON format:\n\n${img.exif.toString()}`);
                }
            }
            break
            case 'cuaca': case 'weather': {
                if (!text) return m.reply(`Example: ${prefix + command} Nairobi`);
                try {
                    let { result: data } = await fetchApi('/tools/cuaca', { city: text });
                    m.reply(`*🏙 Weather for ${data.name}*\n\n*🌤️ Weather:* ${data.weather[0].main}\n*📝 Description:* ${data.weather[0].description}\n*🌡️ Temperature:* ${data.main.temp} °C\n*🤔 Feels like:* ${data.main.feels_like} °C\n*🌬️ Pressure:* ${data.main.pressure} hPa\n*💧 Humidity:* ${data.main.humidity}%\n*🌪️ Wind speed:* ${data.wind.speed} Km/h\n*📍 Location:*\n- *Latitude:* ${data.coord.lat}\n- *Longitude:* ${data.coord.lon}\n*🌏 Country:* ${data.sys.country}`);
                } catch (e) {
                    m.reply('City not found!');
                }
            }
            break
            case 'sticker': case 'stiker': case 's': case 'stickergif': case 'stikergif': case 'sgif': case 'stickerwm': case 'swm': case 'curi': case 'colong': case 'take': case 'stickergifwm': case 'sgifwm': {
                if (!/image|video|sticker/.test(quoted.type)) return m.reply(`Send/Reply to an image/video/GIF with caption ${prefix + command}\nDuration of video/gif 1-9 seconds.`);
                let media = await quoted.download();
                let teks1 = text.split`|`[0] ? text.split`|`[0] : packname;
                let teks2 = text.split`|`[1] ? text.split`|`[1] : author;
                if (/image|webp/.test(mime)) {
                    m.reply(mess.wait);
                    await nimesha.sendAsSticker(m.chat, media, m, { packname: teks1, author: teks2 });
                } else if (/video/.test(mime)) {
                    if ((qmsg).seconds > 11) return m.reply('Maximum 10 seconds!');
                    m.reply(mess.wait);
                    await nimesha.sendAsSticker(m.chat, media, m, { packname: teks1, author: teks2 });
                } else m.reply(`Send/Reply to an image/video/GIF with caption ${prefix + command}\nDuration of video/gif 1-9 seconds.`);
            }
            break
            case 'smeme': case 'stickmeme': case 'stikmeme': case 'stickermeme': case 'stikermeme': {
                try {
                    if (!isLimit) return m.reply(mess.limit);
                    if (!/image|webp/.test(mime)) return m.reply(`Reply to an image/sticker with caption ${prefix + command} top|bottom`);
                    if (!text) return m.reply(`Reply to an image/sticker with caption ${prefix + command} top|bottom`);
                    m.reply(mess.wait);
                    let atas = text.split`|`[0] ? text.split`|`[0] : '-';
                    let bawah = text.split`|`[1] ? text.split`|`[1] : '-';
                    let media = await quoted.download();
                    let mem = await UguuSe(media);
                    let smeme = await fetchApi('/create/meme2', { url: mem.url, text: atas, text2: bawah }, { buffer: true });
                    await nimesha.sendAsSticker(m.chat, smeme, m, { packname, author });
                    setLimit(m, db);
                } catch (e) {
                    console.log(e);
                    m.reply('Meme server offline!');
                }
            }
            break
            case 'emojimix': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} 😅+🤔`);
                let [emoji1, emoji2] = text.split`+`;
                if (!emoji1 && !emoji2) return m.reply(`Example: ${prefix + command} 😅+🤔`);
                try {
                    let { result } = await fetchApi('/tools/emojimix', { emoji1, emoji2 });
                    if (result.length < 1) return m.reply(`❌ *${text}* Emoji mix not found!`);
                    for (let res of result) {
                        await nimesha.sendAsSticker(m.chat, res.url, m, { packname, author });
                    }
                    setLimit(m, db);
                } catch (e) {
                    m.reply('Emoji mix failed!');
                }
            }
            break
            case 'hack': case 'hacker': case 'hackwifi': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} +254xxxxxxxx\nExample: ${prefix + command} @mention`);
                const target = text.replace(/[^0-9+]/g, '') || text;
                const displayTarget = text;
                const steps = [
                    `⚠️ *[ HACK SYSTEM INITIATED ]*`,
                    `🔍 *Target Detected:* \`${displayTarget}\``,
                    `📡 *Scanning IP Address...*\n\`192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}\``,
                    `🌐 *Locating Device...*\n\`${['Samsung Galaxy', 'iPhone 15', 'Xiaomi Redmi', 'Huawei P40'][Math.floor(Math.random()*4)]}\``,
                    `🔓 *Bypassing WhatsApp Encryption...*\n\`SHA-256 ▓▓▓▓▓▓░░░░ 60%\``,
                    `💀 *Breaking Security Layers...*\n\`Layer 1 ✅ | Layer 2 ✅ | Layer 3 🔄\``,
                    `📲 *Accessing Device Camera...*\n\`[GRANTED]\``,
                    `📂 *Extracting Files...*\n\`Contacts ✅ | Messages ✅ | Gallery ✅\``,
                    `🔐 *WhatsApp Session Hijacked!*\n\`Token: 7f4a2b9c1e6d3f8a\``,
                    `✅ *HACK COMPLETE!*\n\`${displayTarget}\`'s WhatsApp has been fully HACKED! 💀`
                ];
                try {
                    let msg = await m.reply(steps[0]);
                    await sleep(1500);
                    for (let i = 1; i < steps.length; i++) {
                        await nimesha.sendMessage(m.chat, { text: steps[i], edit: msg.key });
                        await sleep(1500);
                    }
                    setLimit(m, db);
                } catch(e) {
                    m.reply(steps.join('\n\n'));
                }
            }
            break
            case 'attp': case 'attp2': {
                // handled in nmd_axis.js
            }
            break
            case 'qc':
            case 'quote':
            case 'fakechat': {
              if (!isLimit) return m.reply(mess.limit);
              if (!text && !m.quoted) return m.reply(`📌 Reply/Send: *${prefix + command}*`);
            
              try {
                let mediaBuffer;
                let quotedMediaBuffer;
                let ppUrl = await nimesha.profilePictureUrl(m.sender, 'image').catch(() => 'https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg');
                let bufferPp = await getBuffer(ppUrl);
                if (m.isMedia) {
                  mediaBuffer = await m.download();
                }
                if (m.quoted && m.quoted.isMedia) {
                  quotedMediaBuffer = await m.quoted.download();
                }
                const senderName = m.pushName || store.contacts?.[m.sender]?.name || '+' + m.sender.split('@')[0];
                const quotedName = store.contacts?.[m.quoted?.sender]?.name || '+' + (m.quoted?.sender || '').split('@')[0];
                const params = {
                  type: 'quote',
                  backgroundColor: '#1b2226',
                  width: 512,
                  scale: 2,
                  text,
                  messages: [
                    {
                      avatar: true,
                      from: {
                        id: 1,
                        name: senderName,
                        number: '+' + m.sender.split('@')[0],
                        time: new Date().toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }),
                        photo: { buffer: bufferPp.toString('base64') }
                      },
                      text: m.text || m.body || '',
                      ...(mediaBuffer ? { media: { buffer: mediaBuffer.toString('base64') } } : {}),
                      ...(m.quoted ? {
                            replyMessage: {
                              chatId: Math.floor(Math.random() * 9999999),
                              name: quotedName,
                              text: m?.quoted?.text || '',
                              number: '+' + m.quoted.sender.split('@')[0],
                              ...(quotedMediaBuffer ? { media: { buffer: quotedMediaBuffer.toString('base64') } } : {})
                            }
                          }  : {})
                    }
                  ]
                };
                let res = await fetchApi('/create/qc', params, { method: 'POST', buffer: true });
                await nimesha.sendAsSticker(m.chat, Buffer.from(res, 'base64'), m, { packname, author });
                setLimit(m, db);
              } catch (e) {
                console.error(e);
                m.reply('Failed to create fake chat.');
              }
            }
            break
            case 'brat': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text && (!m.quoted || !m.quoted.text)) return m.reply(`📌 Reply to *${prefix + command}* with text`);
                try {
                    let res = await fetchApi('/create/brat', { text }, { buffer: true });
                    await nimesha.sendAsSticker(m.chat, res, m);
                    setLimit(m, db);
                } catch (e) {
                    m.reply('Brat server offline!');
                }
            }
            break
            case 'bratvid': case 'bratvideo': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text && (!m.quoted || !m.quoted.text)) return m.reply(`📌 Reply to *${prefix + command}* with text`);
                const teks = (m.quoted ? m.quoted.text : text).split(' ');
                const tempDir = path.join(process.cwd(), 'database/temp');
                try {
                    const framePaths = [];
                    for (let i = 0; i < teks.length; i++) {
                        const currentText = teks.slice(0, i + 1).join(' ');
                        let res = await fetchApi('/create/brat2', { text: currentText }, { buffer: true });
                        const framePath = path.join(tempDir, `${time + '-' + m.sender + i}.mp4`);
                        fs.writeFileSync(framePath, res);
                        framePaths.push(framePath);
                    }
                    const fileListPath = path.join(tempDir, `${time + '-' + m.sender}.txt`);
                    let fileListContent = '';
                    for (let i = 0; i < framePaths.length; i++) {
                        fileListContent += `file '${framePaths[i]}'\n`;
                        fileListContent += `duration 0.5\n`;
                    }
                    fileListContent += `file '${framePaths[framePaths.length - 1]}'\n`;
                    fileListContent += `duration 3\n`;
                    fs.writeFileSync(fileListPath, fileListContent);
                    const outputVideoPath = path.join(tempDir, `${time + '-' + m.sender}-output.mp4`);
                    execSync(`ffmpeg -y -f concat -safe 0 -i ${fileListPath} -vf 'fps=30' -c:v libx264 -preset veryfast -pix_fmt yuv420p -t 00:00:10 ${outputVideoPath}`);
                    nimesha.sendAsSticker(m.chat, outputVideoPath, m, { packname, author });
                    framePaths.forEach((filePath) => fs.unlinkSync(filePath));
                    fs.unlinkSync(fileListPath);
                    fs.unlinkSync(outputVideoPath);
                    setLimit(m, db);
                } catch (e) {
                    console.log(e);
                    m.reply('Error processing request!');
                }
            }
            break
            case 'wasted': {
                if (!isLimit) return m.reply(mess.limit);
                try {
                    if (/jpg|jpeg|png/.test(mime)) {
                        m.reply(mess.wait);
                        let media = await quoted.download();
                        const form = new FormData();
                        form.append('buffer', media, {
                            filename: 'image.jpg',
                            contentType: 'image/jpeg'
                        });
                        let hasil = await fetchApi('/create/wasted', form, { buffer: true });
                        await nimesha.sendMedia(m.chat, hasil, '', 'Take it', m);
                        setLimit(m, db);
                    } else m.reply('Send media to upload!');
                } catch (e) {
                    m.reply('Canvas server offline!');
                }
            }
            break
            case 'trigger': case 'triggered': {
                if (!isLimit) return m.reply(mess.limit);
                try {
                    if (/jpg|jpeg|png/.test(mime)) {
                        m.reply(mess.wait);
                        let media = await quoted.download();
                        let anu = await UguuSe(media);
                        let hasil = await fetchApi('/create/triggered', form, { buffer: true });
                        await nimesha.sendMedia(m.chat, hasil, '', 'Take it', m);
                        setLimit(m, db);
                    } else m.reply('Send media to upload!');
                } catch (e) {
                    m.reply('Canvas server offline!');
                }
            }
            break
            case 'nulis': {
                const _msg_nulis = await m.reply('⏳ *Processing...*');
                await nimesha.sendMessage(m.chat, { text: `*Example*\n${prefix}nulisleft\n${prefix}nulisright\n${prefix}paperleft\n${prefix}paperright`, edit: _msg_nulis.key });
            }
            break
            case 'nuliskanan': case 'nuliskiri': case 'foliokanan': case 'foliokiri': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`📌 *${prefix + command}* *(text)* send it`);
                m.reply(mess.wait);
                const splitText = text.replace(/(\S+\s*){1,9}/g, '$&\n');
                const fixHeight = splitText.split('\n').slice(0, 31).join('\n');
                let hasil = await fetchApi('/create/nulis/' + command, { text: fixHeight }, { buffer: true });
                await m.reply({ image: hasil, caption: 'Don\'t be lazy. Be a diligent student. r_ r' });
                setLimit(m, db);
            }
            break
            case 'bass': case 'blown': case 'deep': case 'earrape': case 'fast': case 'fat': case 'nightcore': case 'reverse': case 'robot': case 'slow': case 'smooth': case 'tupai': {
                try {
                    let set;
                    if (/bass/.test(command)) set = '-af equalizer=f=54:width_type=o:width=2:g=20';
                    if (/blown/.test(command)) set = '-af acrusher=.1:1:64:0:log';
                    if (/deep/.test(command)) set = '-af atempo=4/4,asetrate=44500*2/3';
                    if (/earrape/.test(command)) set = '-af volume=12';
                    if (/fast/.test(command)) set = '-filter:a "atempo=1.63,asetrate=44100"';
                    if (/fat/.test(command)) set = '-filter:a "atempo=1.6,asetrate=22100"';
                    if (/nightcore/.test(command)) set = '-filter:a atempo=1.06,asetrate=44100*1.25';
                    if (/reverse/.test(command)) set = '-filter_complex "areverse"';
                    if (/robot/.test(command)) set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"';
                    if (/slow/.test(command)) set = '-filter:a "atempo=0.7,asetrate=44100"';
                    if (/smooth/.test(command)) set = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"';
                    if (/tupai/.test(command)) set = '-filter:a "atempo=0.5,asetrate=65100"';
                    if (/audio/.test(mime)) {
                        m.reply(mess.wait);
                        let media = await nimesha.downloadAndSaveMediaMessage(qmsg);
                        let ran = `./database/temp/${getRandom('.mp3')}`;
                        exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
                            fs.unlinkSync(media);
                            if (err) return m.reply(err);
                            let buff = fs.readFileSync(ran);
                            m.reply({ audio: buff, mimetype: 'audio/mpeg' });
                            fs.unlinkSync(ran);
                        });
                    } else m.reply(`📌 Reply/Send an audio file (caption: *${prefix + command}*)`);
                } catch (e) {
                    m.reply('Failed!');
                }
            }
            break
            case 'tinyurl': case 'shorturl': case 'shortlink': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text || !isUrl(text)) return m.reply(`Example: ${prefix + command} https://github.com/luckyfelistine-bot/maureonix`);
                try {
                    let hasil = await fetchApi('/other/tinyurl', { url: text });
                    m.reply('URL: ' + hasil.result);
                    setLimit(m, db);
                } catch (e) {
                    m.reply('Failed!');
                }
            }
            break
            case 'git': case 'gitclone': {
                if (!isLimit) return m.reply(mess.limit);
                if (!args[0]) return m.reply(`Example: ${prefix + command} https://github.com/luckyfelistine-bot/maureonix`);
                if (!isUrl(args[0]) && !args[0].includes('github.com')) return m.reply('Use a GitHub URL!');
                let [, user, repo] = args[0].match(/(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i) || [];
                try {
                    m.reply({ document: { url: `https://api.github.com/repos/${user}/${repo}/zipball` }, fileName: repo + '.zip', mimetype: 'application/zip' }).catch((e) => m.reply(mess.error));
                    setLimit(m, db);
                } catch (e) {
                    m.reply('Failed!');
                }
            }
            break
            
            // Ai Menu
            case 'ai': case 'google': case 'bard': case 'gemini': {
                if (!text) return m.reply(`Example: ${prefix + command} query`);
                try {
                    let hasil = await fetchApi('/ai/gemini-flash-lite', { query: text });
                    m.reply(hasil.result.text);
                } catch (e) {
                    m.reply(pickRandom(['AI feature is having issues!','Unable to connect to AI!','AI system is currently busy!','Feature is currently unavailable!']));
                }
            }
            break
            
            // Search Menu
            case 'gimage': case 'bingimg': {
                if (!text) return m.reply(`Example: ${prefix + command} query`);
                try {
                    let anu = await fetchApi('/search/google', { query: text });
                    let una = pickRandom(anu.result);
                    await m.reply({ image: { url: una.pagemap?.cse_thumbnail?.[0]?.src || una.pagemap?.cse_image?.[0].src || una.pagemap?.metatags?.[0]?.["og:image"] }, caption: 'Search result for ' + text + '\nTitle: ' + una.title + '\nSnippet: ' + una.snippet + '\nSource: ' + una.link || una.formattedUrl });
                    setLimit(m, db);
                } catch (e) {
                    m.reply('Search not found!');
                }
            }
            break
            case 'play': case 'ytplay': case 'yts': case 'ytsearch': case 'youtubesearch': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} Shape of You`);
                try {
                    let statusMsg = await m.reply(`🔍 *Searching...*\n━━━━━━━━━━━━━━━━━━━━━━\n🎵 *Request:* ${text}\n⏳ Searching on YouTube...\n━━━━━━━━━━━━━━━━━━━━━━`);

                    const searchRes = await yts(text);
                    const video = searchRes?.videos?.[0] || searchRes?.all?.[0];
                    if (!video) return m.reply('❌ No YouTube results found!');

                    const _vid = video.videoId || video.url?.match(/(?:v=|youtu\.be\/)([^&?#]+)/)?.[1];
                    if (!_vid) return m.reply('❌ YouTube video ID not found!');
                    const videoUrl = `https://www.youtube.com/watch?v=${_vid}`;
                    const videoTitle = video.title || text;

                    await nimesha.sendMessage(m.chat, {
                        text: `⬇️ *Downloading...*\n━━━━━━━━━━━━━━━━━━━━━━\n🎵 *Song:* ${videoTitle}\n⏳ *URL:* ${videoUrl}\n━━━━━━━━━━━━━━━━━━━━━━`
                    }, { quoted: m, edit: statusMsg.key });

                    const _sendProgress = async (txt) => {
                        try { await nimesha.sendMessage(m.chat, { text: txt }, { quoted: m, edit: statusMsg.key }); } catch {}
                    };

                    const hasil = await ytMp3(videoUrl, _sendProgress);
                    const isBuffer = Buffer.isBuffer(hasil.result);
                    const audioPayload = isBuffer ? hasil.result : { url: hasil.result?.url || hasil.result };

                    if (isBuffer && hasil.result.length > 16 * 1024 * 1024) {
                        return m.reply(`❌ *File too large!*\n📁 Size: ${hasil.size}\n⚠️ WhatsApp limit: 16MB`);
                    }

                    await m.reply({
                        audio: audioPayload,
                        mimetype: 'audio/mpeg',
                        contextInfo: {
                            externalAdReply: {
                                title: hasil.title || videoTitle,
                                body: hasil.channel || video.author?.name || '',
                                previewType: 'PHOTO',
                                thumbnailUrl: hasil.thumb || video.thumbnail || '',
                                mediaType: 1,
                                renderLargerThumbnail: true,
                                sourceUrl: videoUrl
                            }
                        }
                    });

                    await nimesha.sendMessage(m.chat, {
                        text: `✅ *Success!*\n━━━━━━━━━━━━━━━━━━━━━━\n🎵 *Song:* ${hasil.title || videoTitle}\n━━━━━━━━━━━━━━━━━━━━━━`
                    }, { quoted: m, edit: statusMsg.key });

                    setLimit(m, db);
                } catch (e) {
                    m.reply('❌ Download failed: ' + e.message.substring(0, 100));
                }
            }
            break
            case 'pixiv': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} hu tao`);
                try {
                    m.reply(mess.wait);
                    const res = await fetchApi('/search/pixiv', { query: text });
                    let hasil = pickRandom(res.result.body.illusts);
                    const response = await fetch(hasil.url, { headers: { 'referer': 'https://www.pixiv.net' }});
                    const image = await response.buffer();
                    m.reply({ image, caption: `Title: ${hasil.title}\nDescription: ${hasil.alt}\nTags:\n${hasil.tags.map(a => '- ' + a).join('\n')}` });
                    setLimit(m, db);
                } catch (e) {
                    console.log(e);
                    m.reply('Post not found!');
                }
            }
            break
            case 'pinterest': case 'pint': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} hu tao`);
                try {
                    const res = await fetchApi('/search/pinterest', { query: text });
                    const hasil = pickRandom(res.result);
                    const image = await getBuffer(hasil);
                    await m.reply({ image, caption: 'Result from: ' + text });
                    setLimit(m, db);
                } catch (e) {
                    m.reply('Search not found!');
                }
            }
            break
            case 'wallpaper': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} hu tao`);
                try {
                    let anu = await fetchApi('/search/pinterest', { query: text });
                    if (anu.length < 1) {
                        m.reply('Post not found!');
                    } else {
                        let result = pickRandom(anu.result);
                        await m.reply({ image: { url: result.urls.original }, caption: `*Media Url :* ${result.pin}${result.description ? '\n*Description :* ' + result.description : ''}` });
                        setLimit(m, db);
                    }
                } catch (e) {
                    m.reply('Wallpaper server offline!');
                }
            }
            break
            case 'ringtone': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} black rover`);
                try {
                    let anu = await fetchApi('/search/meloboom', { query: text });
                    let result = pickRandom(anu.result.data);
                    await m.reply({ audio: { url: anu.result.populated.media[result.media.audio[0]].url }, fileName: result.slug + '.mp3', mimetype: 'audio/mpeg' });
                    setLimit(m, db);
                } catch (e) {
                    m.reply('Audio not found!');
                }
            }
            break
            case 'npm': case 'npmjs': {
                if (!text) return m.reply(`Example: ${prefix + command} axios`);
                try {
                    let anu = await fetchApi('/search/npm', { query: text });
                    if (anu.result.objects.length > 1) return m.reply('Search results not found');
                    let txt = anu.result.objects.map(({ package: pkg }) => {
                        return `*${pkg.name}* (v${pkg.version})\n_${pkg.links.npm}_\n_${pkg.description}_`;
                    }).join`\n\n`;
                    m.reply(txt);
                } catch (e) {
                    m.reply('Search results not found');
                }
            }
            break
            case 'style': {
                if (!text) return m.reply(`Example: ${prefix + command} name`);
                let anu = await fetchApi('/search/styletext', { text });
                let txt = anu.result.map(a => `*${a.name}*\n${a.result}`).join`\n\n`;
                m.reply(txt);
            }
            break
            case 'spotify': case 'spotifysearch': {
                if (!text) return m.reply(`Example: ${prefix + command} alan walker alone`);
                try {
                    let hasil = await fetchApi('/search/spotify', { query: text });
                    let txt = hasil.result.map(a => {
                        return `*Title : ${a.title}*\n- Artist : ${a.artist}\n- Url : ${a.url}`;
                    }).join`\n\n`;
                    m.reply(txt);
                } catch (e) {
                    m.reply('Search server offline!');
                }
            }
            break
            case 'tenor': {
                if (!text) return m.reply(`Example: ${prefix + command} alone`);
                try {
                    const anu = await fetchApi('/search/tenor', { query: text });
                    const hasil = pickRandom(anu.result);
                    await m.reply({ video: { url: hasil.media[0].mp4.url }, caption: `👀 *Media:* ${hasil.url}\n📋 *Description:* ${hasil.content_description}\n🔛 *Url:* ${hasil.itemurl}`, gifPlayback: true, gifAttribution: 2 });
                } catch (e) {
                    m.reply('Result not found!');
                }
            }
            break
            case 'urban': {
                if (!text) return m.reply(`Example: ${prefix + command} alone`);
                try {
                    const anu = await fetchJson('https://api.urbandictionary.com/v0/define?term=' + text);
                    const hasil = pickRandom(anu.list);
                    await m.reply(`${hasil.definition}\n\n📚 Source: ${hasil.permalink}`);
                } catch (e) {
                    m.reply('Result not found!');
                }
            }
            break
            
            // Stalker Menu
            case 'wastalk': case 'whatsappstalk': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} @tag / 254xxx`);
                try {
                    let num = m.quoted?.sender || m.mentionedJid?.[0] || text;
                    if (!num) return m.reply(`Example: ${prefix + command} @tag / 254xxx`);
                    num = num.replace(/\D/g, '') + '@s.whatsapp.net';
                    if (!(await nimesha.onWhatsApp(num))[0]?.exists) return m.reply('Number not registered on WhatsApp!');
                    let img = await nimesha.profilePictureUrl(num, 'image').catch(_ => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60');
                    let bio = await nimesha.fetchStatus(num).catch(_ => { });
                    let name = await nimesha.getName(num);
                    let business = await nimesha.getBusinessProfile(num);
                    let format = PhoneNum(`+${num.split('@')[0]}`);
                    let regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
                    let country = regionNames.of(format.getRegionCode('international'));
                    let wea = `WhatsApp Info\n\n*° Country:* ${country.toUpperCase()}\n*° Name:* ${name ? name : '-'}\n*° Formatted number:* ${format.getNumber('international')}\n*° URL:* wa.me/${num.split('@')[0]}\n*° Mentions:* @${num.split('@')[0]}\n*° Status:* ${bio?.status || '-'}\n*° Status date:* ${bio?.setAt ? moment(bio.setAt.toDateString()).locale('en').format('LL') : '-'}\n\n${business ? `*WhatsApp Business Info*\n\n*° Business ID:* ${business.wid}\n*° Website:* ${business.website ? business.website : '-'}\n*° Email:* ${business.email ? business.email : '-'}\n*° Category:* ${business.category}\n*° Address:* ${business.address ? business.address : '-'}\n*° Timezone:* ${business.business_hours.timezone ? business.business_hours.timezone : '-'}\n*° Description:* ${business.description ? business.description : '-'}` : '*Normal WhatsApp account*'}`;
                    img ? await nimesha.sendMessage(m.chat, { image: { url: img }, caption: wea, mentions: [num] }, { quoted: m }) : m.reply(wea);
                } catch (e) {
                    m.reply('Number not found!');
                }
            }
            break
            case 'ghstalk': case 'githubstalk': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} username`);
                try {
                    const res = await fetchJson('https://api.github.com/users/' + text);
                    m.reply({ image: { url: res.avatar_url }, caption: `*Username:* ${res.login}\n*Nickname:* ${res.name || 'N/A'}\n*Bio:* ${res.bio || 'N/A'}\n*ID:* ${res.id}\n*Node ID:* ${res.node_id}\n*Type:* ${res.type}\n*Admin:* ${res.admin ? 'Yes' : 'No'}\n*Company:* ${res.company || 'N/A'}\n*Blog:* ${res.blog || 'N/A'}\n*Location:* ${res.location || 'N/A'}\n*Email:* ${res.email || 'N/A'}\n*Public Repos:* ${res.public_repos}\n*Public Gists:* ${res.public_gists}\n*Followers:* ${res.followers}\n*Following:* ${res.following}\n*Created At:* ${res.created_at} *Updated At:* ${res.updated_at}` });
                } catch (e) {
                    m.reply('Username not found!');
                }
            }
            break
            
            // Downloader Menu
            
            // 🎵 SONG DOWNLOAD - handled in nmd_axis.js
            case 'song': case 'mp3': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} Shape of You`);
                // nmd_axis.js handles this
            }
            break
            
            case 'ytmp3': case 'ytaudio': case 'ytplayaudio': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} Shape of You or ${prefix + command} https://youtu.be/xxx`);

                const isUrl = /https?:\/\//.test(text);

                let ytUrl = text;
                let ytTitle = text;

                let statusMsg = await m.reply(`🔍 *${isUrl ? 'Recognizing URL' : 'Searching'}...*\n━━━━━━━━━━━━━━━━━━━━━━\n🎵 *Request:* ${text}\n━━━━━━━━━━━━━━━━━━━━━━`);

                if (!isUrl) {
                    try {
                        const searchRes = await yts(text);
                        const video = searchRes?.videos?.[0] || searchRes?.all?.[0];
                        if (!video) return m.reply('❌ No YouTube results found!');
                        const videoId = video.videoId || video.url?.match(/(?:v=|youtu\.be\/)([^&?#]+)/)?.[1];
                        if (!videoId) return m.reply('❌ YouTube video ID not found!');
                        ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
                        ytTitle = video.title || text;
                        await nimesha.sendMessage(m.chat, {
                            text: `🎯 *Found!*\n━━━━━━━━━━━━━━━━━━━━━━\n🎵 *Song:* ${ytTitle}\n🔗 ${ytUrl}\n⬇️ *Downloading...*\n━━━━━━━━━━━━━━━━━━━━━━`
                        }, { quoted: m, edit: statusMsg.key });
                    } catch (se) {
                        return m.reply('❌ YouTube search failed: ' + se.message.substring(0, 80));
                    }
                } else {
                    await nimesha.sendMessage(m.chat, {
                        text: `⬇️ *Downloading...*\n━━━━━━━━━━━━━━━━━━━━━━\n🔗 *URL:* ${ytUrl}\n━━━━━━━━━━━━━━━━━━━━━━`
                    }, { quoted: m, edit: statusMsg.key });
                }

                const _sendProgress = async (txt) => {
                    try { await nimesha.sendMessage(m.chat, { text: txt }, { quoted: m, edit: statusMsg.key }); } catch {}
                };

                try {
                    const hasil = await ytMp3(ytUrl, _sendProgress);
                    const isBuffer = Buffer.isBuffer(hasil.result);
                    const audioPayload = isBuffer ? hasil.result : { url: hasil.result?.url || hasil.result };

                    if (isBuffer && hasil.result.length > 16 * 1024 * 1024) {
                        return nimesha.sendMessage(m.chat, {
                            text: `❌ *File too large!*\n📁 Size: ${hasil.size}\n⚠️ WhatsApp limit: 16MB`
                        }, { quoted: m, edit: statusMsg.key });
                    }

                    await m.reply({
                        audio: audioPayload,
                        mimetype: 'audio/mpeg',
                        contextInfo: {
                            externalAdReply: {
                                title: hasil.title || ytTitle,
                                body: hasil.channel || '',
                                previewType: 'PHOTO',
                                thumbnailUrl: hasil.thumb || '',
                                mediaType: 1,
                                renderLargerThumbnail: true,
                                sourceUrl: ytUrl
                            }
                        }
                    });

                    await nimesha.sendMessage(m.chat, {
                        text: `✅ *Success!*\n━━━━━━━━━━━━━━━━━━━━━━\n🎵 *Song:* ${hasil.title || ytTitle}\n━━━━━━━━━━━━━━━━━━━━━━`
                    }, { quoted: m, edit: statusMsg.key });

                    setLimit(m, db);
                } catch (e) {
                    nimesha.sendMessage(m.chat, {
                        text: '❌ Download failed: ' + e.message.substring(0, 100)
                    }, { quoted: m, edit: statusMsg.key });
                }
            }
            break
            case 'ytmp4': case 'ytvideo': case 'ytplayvideo': case 'video': case 'mp4': {
                // nmd_axis.js handles this
            }
            break
            case 'ig': case 'instagram': case 'instadl': case 'igdown': case 'igdl': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} Instagram URL`);
                if (!text.includes('instagram.com')) return m.reply('URL does not contain an Instagram post!');
                const statusMsg = await m.reply(`⬇ *Downloading...*\n━━━━━━━━━━━━━━━━━━━━━━\n📷 *Instagram:* ${text.substring(0, 50)}...\n━━━━━━━━━━━━━━━━━━━━━━`);
                try {
                    const hasil = await igDownload(text);
                    if (hasil.type === 'album') {
                        await nimesha.sendAlbumMessage(m.chat, {
                            album: hasil.items.map(a => (a.is_video ? { video: { url: a.url } } : { image: { url: a.url } })),
                            caption: hasil.caption || ''
                        }, { quoted: m });
                    } else if (hasil.type === 'video') {
                        await m.reply({ video: { url: hasil.url }, caption: hasil.caption || '' });
                    } else {
                        await m.reply({ image: { url: hasil.url }, caption: hasil.caption || '' });
                    }
                    await nimesha.sendMessage(m.chat, { text: '✅ *Success!*', edit: statusMsg.key }).catch(() => {});
                    setLimit(m, db);
                } catch (e) {
                    console.log('[IG DL]', e.message);
                    await nimesha.sendMessage(m.chat, { text: '❌ Post not found or private!', edit: statusMsg.key }).catch(() => {});
                }
            }
            break
            case 'tiktok': case 'tiktokdown': case 'ttdown': case 'ttdl': case 'tt': case 'ttmp4': case 'ttvideo': case 'tiktokmp4': case 'tiktokvideo': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} TikTok URL`);
                if (!text.includes('tiktok.com') && !text.includes('vm.tiktok') && !text.includes('vt.tiktok')) return m.reply('URL does not contain a TikTok post!');

                const _ttButtons = [
                    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '✅ No Watermark', id: `${prefix}tt_nowm ${text}` }) },
                    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💧 With Watermark', id: `${prefix}tt_wm ${text}` }) }
                ];
                await nimesha.sendListMsg(m.chat, {
                    text: `🎵 *TikTok Download*\n━━━━━━━━━━━━━━━━━━━━━━\n🔗 ${text.substring(0, 50)}\n━━━━━━━━━━━━━━━━━━━━━━\n\nHow would you like to download it?`,
                    footer: 'Maureonix',
                    buttons: _ttButtons
                }, { quoted: m });
            }
            break
            case 'tt_nowm': case 'tt_wm': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} TikTok URL`);
                const _isNoWm = command === 'tt_nowm';
                const ttVidStatus = await m.reply(`⬇ *Downloading...*\n━━━━━━━━━━━━━━━━━━━━━━\n🎵 *TikTok Video:* ${text.substring(0, 45)}...\n${_isNoWm ? '✅ No Watermark' : '💧 With Watermark'}\n━━━━━━━━━━━━━━━━━━━━━━`);
                try {
                    const hasil = await tiktokDownload(text);

                    const _fixUrl = (u) => {
                        if (!u) return null;
                        if (u.startsWith('http')) return u;
                        if (u.startsWith('/')) return 'https://tikwm.com' + u;
                        return null;
                    };

                    if (hasil.type === 'slideshow') {
                        await nimesha.sendAlbumMessage(m.chat, {
                            album: hasil.items.map(u => ({ image: { url: _fixUrl(u) || u } })),
                            caption: `*📍 ${hasil.title || ''}*\n*🎃 ${hasil.author || ''}*`
                        }, { quoted: m });
                    } else {
                        const _rawUrl = (_isNoWm ? hasil.url : (hasil.urlWatermark || hasil.url));
                        const videoUrl = _fixUrl(_rawUrl);
                        if (!videoUrl) throw new Error('invalid video url: ' + _rawUrl);

                        let videoPayload;
                        try {
                            const fetch2 = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
                            const vRes = await fetch2(videoUrl, {
                                headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.tiktok.com/' },
                                signal: AbortSignal.timeout(60000)
                            });
                            if (!vRes.ok) throw new Error(`HTTP ${vRes.status}`);
                            const vBuf = Buffer.from(await vRes.arrayBuffer());
                            if (vBuf.length < 10000) throw new Error('file too small');

                            let finalBuf = vBuf;
                            try {
                                const { execFile: _ffExecFile } = require('child_process');
                                const _os = require('os'); const _fs = require('fs');
                                const _tIn = _os.tmpdir() + '/tt_in_' + Date.now() + '.mp4';
                                const _tOut = _os.tmpdir() + '/tt_out_' + Date.now() + '.mp4';
                                _fs.writeFileSync(_tIn, vBuf);
                                await new Promise((res, rej) => {
                                    const _ffProc = _ffExecFile('ffmpeg', [
                                        '-y', '-i', _tIn,
                                        '-c:v', 'libx264', '-preset', 'fast', '-crf', '28',
                                        '-c:a', 'aac', '-movflags', '+faststart',
                                        _tOut
                                    ], { timeout: 90000 }, (err) => {
                                        if (err) return rej(err);
                                        res();
                                    });
                                });
                                const _reOut = _fs.readFileSync(_tOut);
                                if (_reOut.length > 10000) finalBuf = _reOut;
                                try { _fs.unlinkSync(_tIn); _fs.unlinkSync(_tOut); } catch {}
                                console.log('[TT DL] ffmpeg re-encode OK, size:', finalBuf.length);
                            } catch(_ffErr) {
                                console.log('[TT DL] ffmpeg skip:', _ffErr.message);
                            }
                            videoPayload = finalBuf;
                        } catch(dlErr) {
                            console.log('[TT DL] buffer fail, try url direct:', dlErr.message);
                            videoPayload = { url: videoUrl };
                        }

                        await m.reply({
                            video: videoPayload,
                            caption: `*📍 ${hasil.title || 'TikTok Video'}*\n*🎃 ${hasil.author || ''}*`,
                            mimetype: 'video/mp4'
                        });
                    }
                    await nimesha.sendMessage(m.chat, { text: '✅ *Success!*', edit: ttVidStatus.key }).catch(() => {});
                    setLimit(m, db);
                } catch (e) {
                    console.log('[TT DL]', e.message);
                    await nimesha.sendMessage(m.chat, { text: '❌ TikTok download failed!', edit: ttVidStatus.key }).catch(() => {});
                }
            }
            break
            case 'ttmp3': case 'tiktokmp3': case 'ttaudio': case 'tiktokaudio': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} TikTok URL`);
                if (!text.includes('tiktok.com') && !text.includes('vm.tiktok') && !text.includes('vt.tiktok')) return m.reply('URL does not contain a TikTok post!');
                const ttAudStatus = await m.reply(`⬇ *Downloading...*\n━━━━━━━━━━━━━━━━━━━━━━\n🎵 *TikTok Audio:* ${text.substring(0, 45)}...\n━━━━━━━━━━━━━━━━━━━━━━`);
                try {
                    const hasil = await tiktokDownload(text);
                    let audioUrl = hasil.audio || hasil.url || '';
                    if (audioUrl.startsWith('/')) audioUrl = 'https://tikwm.com' + audioUrl;
                    if (!audioUrl.startsWith('http')) throw new Error('invalid audio url: ' + audioUrl);

                    await m.reply({
                        audio: { url: audioUrl },
                        mimetype: 'audio/mpeg',
                        contextInfo: {
                            externalAdReply: {
                                title: 'TikTok • ' + (hasil.author || ''),
                                body: hasil.title || '',
                                previewType: 'PHOTO',
                                thumbnailUrl: hasil.thumb || '',
                                mediaType: 1,
                                renderLargerThumbnail: true,
                                sourceUrl: text
                            }
                        }
                    });
                    await nimesha.sendMessage(m.chat, { text: '✅ *Success!*', edit: ttAudStatus.key }).catch(() => {});
                    setLimit(m, db);
                } catch (e) {
                    console.log('[TT MP3]', e.message);
                    await nimesha.sendMessage(m.chat, { text: '❌ TikTok audio download failed!', edit: ttAudStatus.key }).catch(() => {});
                }
            }
            break
            case 'fb': case 'fbdl': case 'fbdown': case 'facebook': case 'facebookdl': case 'facebookdown': case 'fbdownload': case 'fbmp4': case 'fbvideo': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} Facebook URL`);
                if (!text.includes('facebook.com') && !text.includes('fb.watch')) return m.reply('URL does not contain a Facebook post!');
                const fbStatus = await m.reply(`⬇ *Downloading...*\n━━━━━━━━━━━━━━━━━━━━━━\n📸 *Facebook:* ${text.substring(0, 50)}...\n━━━━━━━━━━━━━━━━━━━━━━`);
                try {
                    const hasil = await fbDownload(text);
                    const videoUrl = hasil.hd || hasil.sd;
                    if (!videoUrl) throw new Error('no url');
                    await nimesha.sendMessage(m.chat, { text: `⬇️ *Sending...*\n🎥 *${hasil.title || 'Facebook Video'}*`, edit: fbStatus.key }).catch(() => {});
                    await nimesha.sendFileUrl(m.chat, videoUrl, `*🎐 ${hasil.title || 'Facebook Video'}*`, m);
                    await nimesha.sendMessage(m.chat, { text: '✅ *Success!* Facebook video found.', edit: fbStatus.key }).catch(() => {});
                    setLimit(m, db);
                } catch (e) {
                    console.log('[FB DL]', e.message);
                    await nimesha.sendMessage(m.chat, { text: '❌ Facebook download failed!', edit: fbStatus.key }).catch(() => {});
                }
            }
            break
            case 'mediafire': case 'mf': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} https://www.mediafire.com/file/xxxxxxxxx/xxxxx.zip/file`);
                if (!isUrl(args[0]) && !args[0].includes('mediafire.com')) return m.reply('Invalid URL!');
                try {
                    let { result: res } = await fetchApi('/download/mediafire', { url: text });
                    await nimesha.sendMedia(m.chat, res.link, res.filename, `*MEDIAFIRE DOWNLOADER*\n\n*${setv} Name* : ${res.filename}\n*${setv} Size* : ${res.size}`, m);
                    setLimit(m, db);
                } catch (e) {
                    m.reply('Download server offline!');
                }
            }
            break
            case 'spotifydl': {
                if (!isLimit) return m.reply(mess.limit);
                if (!text) return m.reply(`Example: ${prefix + command} https://open.spotify.com/track/0JiVRyTJcJnmlwCZ854K4p`);
                if (!isUrl(args[0]) && !args[0].includes('open.spotify.com/track')) return m.reply('Invalid URL!');
                try {
                    let statusMsg = await m.reply(`⬇ *Downloading...*\n━━━━━━━━━━━━━━━━━━━━━━\n💚 *Spotify:* ${text.substring(0,50)}...\n━━━━━━━━━━━━━━━━━━━━━━`);
                    const { result: hasil } = await fetchApi('/download/spotify', { url: text });
                    await nimesha.sendMessage(m.chat, { text: `⬇️ *Downloading...*\n🎵 *${hasil.artist} - ${hasil.title}*` }, { quoted: m, edit: statusMsg.key });
                    const buffer = await fetchApi('/download/spotify/audio', { url: text }, { buffer: true });
                    await m.reply({
                        audio: buffer,
                        mimetype: 'audio/mpeg',
                        contextInfo: {
                            externalAdReply: {
                                title: hasil.artist + ' • ' + hasil.title,
                                body: hasil.duration,
                                previewType: 'PHOTO',
                                thumbnailUrl: hasil.cover,
                                mediaType: 1,
                                renderLargerThumbnail: true,
                                sourceUrl: text
                            }
                        }
                    });
                    await nimesha.sendMessage(m.chat, { text: '✅ *Success!* Spotify track downloaded.' }, { quoted: m, edit: statusMsg.key });
                    setLimit(m, db);
                } catch (e) {
                    console.log(e);
                    m.reply('Download server offline!');
                }
            }
            break
            
            // Quotes Menu
            case 'motivasi': {
                const hasil = await fetchApi('/random/motivasi');
                const _msg_bijak = await m.reply('⏳ 💡 *Getting...*');
                await nimesha.sendMessage(m.chat, { text: hasil.result, edit: _msg_bijak.key });
            }
            break
            case 'bijak': {
                const hasil = await fetchApi('/random/bijak');
                const _msg_dare = await m.reply('⏳ 🎯 *Getting Dare...*');
                await nimesha.sendMessage(m.chat, { text: hasil.result, edit: _msg_dare.key });
            }
            break
            case 'dare': {
                const hasil = await fetchApi('/random/dare');
                const _msg_bucin = await m.reply('⏳ 💕 *Getting...*');
                await nimesha.sendMessage(m.chat, { text: hasil.result, edit: _msg_bucin.key });
            }
            break
            case 'quotes': {
                const { result: hasil } = await fetchApi('/random/quotes');
                const _msg_quotes = await m.reply('⏳ 💬 *Getting quote...*');
                await nimesha.sendMessage(m.chat, { text: `_${hasil.quotes}_\n\n*- ${hasil.author}*`, edit: _msg_quotes.key });
            }
            break
            case 'truth': {
                const hasil = await fetchApi('/random/truth');
                const _msg_truth = await m.reply('⏳ 🤔 *Getting Truth...*');
                await nimesha.sendMessage(m.chat, { text: `_${pickRandom(hasil.result)}_`, edit: _msg_truth.key });
            }
            break
            case 'renungan': {
                const hasil = await fetchApi('/random/renungan');
                const _msg_renungan = await m.reply('⏳ *Getting...*');
                await nimesha.sendMessage(m.chat, { text: hasil.result || '', contextInfo: { forwardingScore: 10, isForwarded: true, externalAdReply: { title: (m.pushName || 'Anonymous'), thumbnailUrl: hasil.result, mediaType: 1, previewType: 'PHOTO', renderLargerThumbnail: true } }, edit: _msg_renungan.key });
            }
            break
            case 'bucin': {
                const hasil = await fetchApi('/random/bucin');
                const _msg_bucin = await m.reply('⏳ *Processing...*');
                await nimesha.sendMessage(m.chat, { text: hasil.result, edit: _msg_bucin.key });
            }
            break
            
            // Random Menu
            case 'coffe': case 'kopi': {
                try {
                    await nimesha.sendFileUrl(m.chat, 'https://coffee.alexflipnote.dev/random', '☕ Random Coffee', m);
                } catch (e) {
                    try {
                        const anu = await fetchJson('https://api.sampleapis.com/coffee/hot');
                        await nimesha.sendFileUrl(m.chat, pickRandom(anu).image, '☕ Random Coffee', m);
                    } catch (e) {
                        const _msg_kopi = await m.reply('⏳ *Processing...*');
                        await nimesha.sendMessage(m.chat, { text: 'Server offline!', edit: _msg_kopi.key });
                    }
                }
            }
            break
            
            // Anime Menu
            case 'waifu': case 'neko': {
                try {
                    if (!isNsfw && text === 'nsfw') return m.reply('NSFW filter is active!');
                    const res = await fetchJson('https://api.waifu.pics/' + (text === 'nsfw' ? 'nsfw' : 'sfw') + '/' + command);
                    await nimesha.sendFileUrl(m.chat, res.url, 'Random Waifu', m);
                    setLimit(m, db);
                } catch (e) {
                    m.reply('Server offline!');
                }
            }
            break
            
            // Fun Menu
            case 'dadu': {
                let ddsa = [{ url: 'https://telegra.ph/file/9f60e4cdbeb79fc6aff7a.png', no: 1 },{ url: 'https://telegra.ph/file/797f86e444755282374ef.png', no: 2 },{ url: 'https://telegra.ph/file/970d2a7656ada7c579b69.png', no: 3 },{ url: 'https://telegra.ph/file/0470d295e00ebe789fb4d.png', no: 4 },{ url: 'https://telegra.ph/file/a9d7332e7ba1d1d26a2be.png', no: 5 },{ url: 'https://telegra.ph/file/99dcd999991a79f9ba0c0.png', no: 6 }];
                let media = pickRandom(ddsa);
                try {
                    await nimesha.sendAsSticker(m.chat, media.url, m, { packname, author, isAvatar: 1 });
                } catch (e) {
                    let anu = await fetch(media.url);
                    let una = await anu.buffer();
                    await nimesha.sendAsSticker(m.chat, una, m, { packname, author, isAvatar: 1 });
                }
            }
            break
            case 'halah': case 'hilih': case 'huluh': case 'heleh': case 'holoh': {
                if (!m.quoted && !text) return m.reply(`📌 Reply/Send text (caption: *${prefix + command}*)`);
                ter = command[1].toLowerCase();
                tex = m.quoted ? m.quoted.text ? m.quoted.text : q ? q : m.text : q ? q : m.text;
                m.reply(tex.replace(/[aiueo]/g, ter).replace(/[AIUEO]/g, ter.toUpperCase()));
            }
            break
            case 'bisakah': {
                if (!text) return m.reply(`Example: ${prefix + command} can I win?`);
                let bisa = ['Yes','Try it','Definitely','Maybe','No','Maybe not','Try again','Are you dreaming?','are you sure?'];
                let keh = bisa[Math.floor(Math.random() * bisa.length)];
                m.reply(`*Can ${text}*\nAnswer: ${keh}`);
            }
            break
            case 'apakah': {
                if (!text) return m.reply(`Example: ${prefix + command} can I win?`);
                let apa = ['Yes','No','Maybe','Try again','Maybe yes','Maybe no','Probably yes','I don\'t know'];
                let kah = apa[Math.floor(Math.random() * apa.length)];
                m.reply(`*${command} ${text}*\nAnswer: ${kah}`);
            }
            break
            case 'kapan': case 'kapankah': {
                if (!text) return m.reply(`Example: ${prefix + command} can I win?`);
                let kapan = ['Tomorrow','The day after tomorrow','Later','In 4 days','In 5 days','In 6 days','In 1 week','In 2 weeks','In 3 weeks','In 1 month','In 2 months','In 3 months','In 4 months','In 5 months','In 6 months','In 1 year','In 2 years','In 3 years','In 4 years','In 5 years','In 6 years','In 1 century','In 3 days','Next month','I don\'t know','Never'];
                let koh = kapan[Math.floor(Math.random() * kapan.length)];
                m.reply(`*${command} ${text}*\nAnswer: ${koh}`);
            }
            break
            case 'siapa': case 'siapakah': {
                if (!m.isGroup) return m.reply(mess.group);
                if (!text) return m.reply(`Example: ${prefix + command} Sri Lanka?`);
                let member = (store.groupMetadata[m.chat] ? store.groupMetadata[m.chat].participants : m.metadata.participants).map(a => a.id);
                let siapakh = pickRandom(member);
                m.reply(`@${siapakh.split('@')[0]}`);
            }
            break
            case 'tanyakerang': case 'kerangajaib': case 'kerang': {
                if (!text) return m.reply(`Example: ${prefix + command} can I borrow money?`);
                let krng = ['Maybe someday','Not really','Neither','I don\'t think so','Yes','No','Ask again','No'];
                let jwb = pickRandom(krng);
                m.reply(`*Question: ${text}*\n*Answer: ${jwb}*`);
            }
            break
            case 'cekmati': {
                if (!text) return m.reply(`Example: ${prefix + command} name`);
                let teksnya = text.replace(/@|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').replace(/\d/g, '');
                let data = await axios.get(`https://api.agify.io/?name=${teksnya ? teksnya : 'bot'}`).then(res => res.data).catch(e => ({ age: Math.floor(Math.random() * 90) + 20 }));
                m.reply(`Name: ${text}\n*Death at age:* ${data.age == null ? (Math.floor(Math.random() * 90) + 20) : data.age} years.\n\n_It's just a game, life is a game_\n_No one knows when death will come_`);
            }
            break
            case 'ceksifat': {
                let sifat_a = ['Wise','Patient','Creative','Humoristic','Easy going','Independent','Loyal','Honest','Generous','Idealist','Fair','Polite','Diligent','Hardworking','Forgiving','Generous','Cheerful','Confident','Loving','Disciplined','Optimistic','Brave','Grateful','Responsible','Reliable','Calm','Logical'];
                let sifat_b = ['Arrogant','Insecure','Vengeful','Sensitive','Perfectionist','Attention seeker','Stingy','Selfish','Pessimistic','Loner','Manipulative','Unstable','Cowardly','Vulgar','Disloyal','Lazy','Rude','Complicated','Wasteful','Stubborn','Unwise','Traitor','Greedy','Gluttonous','Gossiper','Racist','Careless','Intolerant'];
                let teks = `╭──❍「 *Character Check* 」❍\n│• Character of ${text && m.mentionedJid ? text : '@' + m.sender.split('@')[0]}${(text && m.mentionedJid ? '' : (`\n│• Name: *${text ? text : m.pushName}*` || '\n│• Name: *Without Name*'))}\n│• They are: *${pickRandom(sifat_a)}*\n│• Flaws: *${pickRandom(sifat_b)}*\n│• Courage: *${Math.floor(Math.random() * 100)}%*\n│• Care: *${Math.floor(Math.random() * 100)}%*\n│• Anxiety: *${Math.floor(Math.random() * 100)}%*\n│• Fear: *${Math.floor(Math.random() * 100)}%*\n│• Good traits: *${Math.floor(Math.random() * 100)}%*\n│• Bad traits: *${Math.floor(Math.random() * 100)}%*\n╰──────❍`;
                m.reply(teks);
            }
            break
            case 'cekkhodam': {
                if (!text) return m.reply(`Example: ${prefix + command} name`);
                try {
                    const { result: hasil } = await fetchApi('/primbon/cekkhodam');
                    m.reply(`Khodam from *${text}* is *${hasil.nama}*\n_${hasil.deskripsi}_`);
                } catch (e) {
                    m.reply(pickRandom(['Doctor Indosiar','Sigit Rendang','Soap opera cleric','Bocil epep']));
                }
            }
            break
            case 'rate': case 'nilai': {
                const _msg_rate = await m.reply('⏳ ⭐ *Rating...*');
                await nimesha.sendMessage(m.chat, { text: `🤖 Bot Rate: *${Math.floor(Math.random() * 100)}%*`, edit: _msg_rate.key });
            }
            break
            case 'jodohku': {
                if (!m.isGroup) return m.reply(mess.group);
                let member = (store.groupMetadata?.[m.chat]?.participants || m.metadata?.participants || []).map(a => a.id);
                let jodoh = pickRandom(member);
                m.reply(`👫 Your soulmate\n@${m.sender.split('@')[0]} ❤ @${jodoh ? jodoh.split('@')[0] : '0'}`);
            }
            break
            case 'jadian': {
                if (!m.isGroup) return m.reply(mess.group);
                let member = (store.groupMetadata?.[m.chat]?.participants || m.metadata?.participants || []).map(a => a.id);
                let jadian1 = pickRandom(member);
                let jadian2 = pickRandom(member);
                m.reply(`Love game 💖 Don't forget to support 🗿\n@${jadian1.split('@')[0]} ❤ @${jadian2.split('@')[0]}`);
            }
            break
            case 'fitnah': {
                let [teks1, teks2, teks3] = text.split`|`;
                if (!teks1 || !teks2 || !teks3) return m.reply(`Example: ${prefix + command} target message|your message|number/tag`);
                let ftelo = { key: { fromMe: false, participant: teks3.replace(/[^0-9]/g, '') + '@s.whatsapp.net', ...(m.isGroup ? { remoteJid: m.chat } : { remoteJid: teks3.replace(/[^0-9]/g, '') + '@s.whatsapp.net'})}, message: { conversation: teks1 }};
                nimesha.sendMessage(m.chat, { text: teks2 }, { quoted: ftelo });
            }
            break
            case 'coba': {
                let anu = ['I am a monkey','I am a gorilla','I am stupid','I am rich','I am a god','I am a dog','I am a fool','I am a king','I am a sultan','I am good','I am black','I like it'];
                await nimesha.sendButtonMsg(m.chat, {
                    text: 'Good🙂',
                    buttons: [{
                        buttonId: 'teshoki',
                        buttonText: { displayText: '\n' + pickRandom(anu)},
                        type: 1
                    },{
                        buttonId: 'cobacoba',
                        buttonText: { displayText: '\n' + pickRandom(anu)},
                        type: 1
                    }]
                });
            }
            break
            
            // Game Menu
            case 'slot': {
                await gameSlot(nimesha, m, db);
            }
            break
            case 'casino': {
                await gameCasinoSolo(nimesha, m, prefix, db);
            }
            break
            case 'samgong': case 'kartu': {
                await gameSamgongSolo(nimesha, m, db);
            }
            break
            case 'rampok': case 'merampok': {
                await gameMerampok(m, db);
            }
            break
            case 'begal': {
                await gameBegal(nimesha, m, db);
            }
            break
            case 'suitpvp': case 'suit': {
                if (Object.values(suit).find(roof => roof.id.startsWith('suit') && [roof.p, roof.p2].includes(m.sender))) return m.reply(`Finish your previous suit session first.`);
                if (m.mentionedJid[0] === m.sender) return m.reply(`You cannot play against yourself!`);
                if (!m.mentionedJid[0]) return m.reply(`_Who do you want to challenge?_\nTag them..\n\nExample: ${prefix}suit @${ownerNumber[0]}`, m.chat, { mentions: [ownerNumber[0] + '@s.whatsapp.net'] });
                if (Object.values(suit).find(roof => roof.id.startsWith('suit') && [roof.p, roof.p2].includes(m.mentionedJid[0]))) return m.reply(`The person you challenged is already in a suit game :(`);
                let caption = `_*SUIT PvP*_\n\n@${m.sender.split('@')[0]} challenges @${m.mentionedJid[0].split('@')[0]} to a suit game.\n\nPlease @${m.mentionedJid[0].split('@')[0]} type accept/reject.`;
                let id = 'suit_' + Date.now();
                suit[id] = {
                    chat: caption,
                    id: id,
                    p: m.sender,
                    p2: m.mentionedJid[0],
                    status: 'wait',
                    poin: 10,
                    poin_lose: 10,
                    timeout: 3 * 60 * 1000
                };
                m.reply(caption);
                await sleep(3 * 60 * 1000);
                if (suit[id]) {
                    m.reply(`⏰ _Suit time expired!_`);
                    delete suit[id];
                }
            }
            break
            case 'delsuit': case 'deletesuit': {
                let roomnya = Object.values(suit).find(roof => roof.id.startsWith('suit') && [roof.p, roof.p2].includes(m.sender));
                if (!roomnya) return m.reply(`⚠️ You are not in a suit room!`);
                delete suit[roomnya.id];
                m.reply(`✅ Suit room session deleted!`);
            }
            break
            case 'ttc': case 'ttt': case 'tictactoe': {
                if (Object.values(tictactoe).find(room => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender))) return m.reply(`⚠️ You are already in a game! To end it: *${prefix}del${command}*`);
                let room = Object.values(tictactoe).find(room => room.state === 'WAITING' && (text ? room.name === text : true));
                if (room) {
                    m.reply('Partner found!');
                    room.o = m.chat;
                    room.game.playerO = m.sender;
                    room.state = 'PLAYING';
                    if (!(room.game instanceof TicTacToe)) {
                        room.game = Object.assign(new TicTacToe(room.game.playerX, room.game.playerO), room.game);
                    }
                    let arr = room.game.render().map(v => {
                        return {X: '❌',O: '⭕',1: '1️⃣',2: '2️⃣',3: '3️⃣',4: '4️⃣',5: '5️⃣',6: '6️⃣',7: '7️⃣',8: '8️⃣',9: '9️⃣'}[v];
                    });
                    let str = `Room ID: ${room.id}\n\n${arr.slice(0, 3).join('')}\n${arr.slice(3, 6).join('')}\n${arr.slice(6).join('')}\n\nWaiting for @${room.game.currentTurn.split('@')[0]}\n\nType *nyerah* to surrender.`;
                    if (room.x !== room.o) await nimesha.sendMessage(room.x, { text: str, mentions: parseMention(str) }, { quoted: m });
                    await nimesha.sendMessage(room.o, { text: str, mentions: parseMention(str) }, { quoted: m });
                } else {
                    room = {
                        id: 'tictactoe-' + (+new Date),
                        x: m.chat,
                        o: '',
                        game: new TicTacToe(m.sender, 'o'),
                        state: 'WAITING',
                    };
                    if (text) room.name = text;
                    nimesha.sendMessage(m.chat, { text: 'Waiting for a partner' + (text ? ` type ${prefix}${command} ${text}` : ''), mentions: m.mentionedJid }, { quoted: m });
                    tictactoe[room.id] = room;
                    await sleep(300000);
                    if (tictactoe[room.id]) {
                        m.reply(`⏰ _Session expired!_`);
                        delete tictactoe[room.id];
                    }
                }
            }
            break
            case 'delttc': case 'delttt': {
                let roomnya = Object.values(tictactoe).find(room => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender));
                if (!roomnya) return m.reply(`⚠️ You are not in a TicTacToe room!`);
                delete tictactoe[roomnya.id];
                m.reply(`✅ TicTacToe room session deleted!`);
            }
            break
            case 'akinator': {
                if (text == 'start') {
                    if (akinator[m.sender]) return m.reply('You already have an unfinished session!');
                    akinator[m.sender] = new Akinator({ region: 'en', childMode: false });
                    try {
                        await akinator[m.sender].start();
                    } catch (e) {
                        delete akinator[m.sender];
                        return m.reply('Akinator server is having issues.\nPlease try again!');
                    }
                    let { key } = await m.reply(`🎮 Akinator Game :\n\n@${m.sender.split('@')[0]}\n${akinator[m.sender].question}\n\n- 0 - Yes\n- 1 - No\n- 2 - Don't know\n- 3 - Probably\n- 4 - Probably not\n\n${prefix + command} end (To exit session)`);
                    akinator[m.sender].key = key.id;
                    await sleep(3600000);
                    if (akinator[m.sender]) {
                        m.reply(`⏰ _Session expired!_`);
                        delete akinator[m.sender];
                    }
                } else if (text == 'end') {
                    if (!akinator[m.sender]) return m.reply('You are not playing Akinator!');
                    delete akinator[m.sender];
                    m.reply('Successfully ended Akinator session.');
                } else m.reply(`Example: ${prefix + command} start/end`);
            }
            break
            case 'tebakbom': {
                if (tebakbom[m.sender]) return m.reply('You already have an unfinished game!');
                tebakbom[m.sender] = {
                    petak: [0, 0, 0, 2, 0, 2, 0, 2, 0, 0].sort(() => Math.random() - 0.5),
                    board: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'],
                    bomb: 3,
                    lolos: 7,
                    pick: 0,
                    nyawa: ['❤️', '❤️', '❤️'],
                };
                await m.reply(`*Bomb Game*\n\n${tebakbom[m.sender].board.join("")}\n\nChoose a number! Avoid bombs!\nBombs: ${tebakbom[m.sender].bomb}\nLives: ${tebakbom[m.sender].nyawa.join("")}`);
                await sleep(120000);
                if (tebakbom[m.sender]) {
                    m.reply(`⏰ _Session expired!_`);
                    delete tebakbom[m.sender];
                }
            }
            break
            case 'tekateki': {
                if (iGame(tekateki, m.chat)) return m.reply('An unfinished session already exists!');
                const { result: hasil } = await fetchApi('/games/tekateki');
                let { key } = await m.reply(`🎮 Next Riddle:\n\n${hasil.soal}\n\nTime: 60s\nPrize *+3499*`);
                tekateki[m.chat + key.id] = {
                    jawaban: hasil.jawaban.toLowerCase(),
                    id: key.id
                };
                await sleep(60000);
                if (rdGame(tekateki, m.chat, key.id)) {
                    m.reply('⏰ Time expired!\nAnswer: ' + tekateki[m.chat + key.id].jawaban);
                    delete tekateki[m.chat + key.id];
                }
            }
            break
            case 'tebaklirik': {
                if (iGame(tebaklirik, m.chat)) return m.reply('An unfinished session already exists!');
                const { result: hasil } = await fetchApi('/games/tebaklirik');
                let { key } = await m.reply(`🎮 Find the lyric:\n\n${hasil.soal}\n\nTime: 90s\nPrize *+4299*`);
                tebaklirik[m.chat + key.id] = {
                    jawaban: hasil.jawaban.toLowerCase(),
                    id: key.id
                };
                await sleep(90000);
                if (rdGame(tebaklirik, m.chat, key.id)) {
                    m.reply('⏰ Time expired!\nAnswer: ' + tebaklirik[m.chat + key.id].jawaban);
                    delete tebaklirik[m.chat + key.id];
                }
            }
            break
            case 'tebakkata': {
                if (iGame(tebakkata, m.chat)) return m.reply('An unfinished session already exists!');
                const { result: hasil } = await fetchApi('/games/tebakkata');
                let { key } = await m.reply(`🎮 Find the word:\n\n${hasil.soal}\n\nTime: 60s\nPrize *+3499*`);
                tebakkata[m.chat + key.id] = {
                    jawaban: hasil.jawaban.toLowerCase(),
                    id: key.id
                };
                await sleep(60000);
                if (rdGame(tebakkata, m.chat, key.id)) {
                    m.reply('⏰ Time expired!\nAnswer: ' + tebakkata[m.chat + key.id].jawaban);
                    delete tebakkata[m.chat + key.id];
                }
            }
            break
            case 'family100': {
                if (family100.hasOwnProperty(m.chat)) return m.reply('An unfinished session already exists!');
                const { result: hasil } = await fetchApi('/games/family100');
                let { key } = await m.reply(`🎮 Answer the following question:\n\n${hasil.soal}\n\nTime: 5m\nPrize *+3499*`);
                family100[m.chat] = {
                    soal: hasil.soal,
                    jawaban: hasil.jawaban,
                    terjawab: Array.from(hasil.jawaban, () => false),
                    id: key.id
                };
                await sleep(300000);
                if (family100.hasOwnProperty(m.chat)) {
                    m.reply('⏰ Time expired!\nAnswers:\n- ' + family100[m.chat].jawaban.join('\n- '));
                    delete family100[m.chat];
                }
            }
            break
            case 'susunkata': {
                if (iGame(susunkata, m.chat)) return m.reply('An unfinished session already exists!');
                const { result: hasil } = await fetchApi('/games/susunkata');
                let { key } = await m.reply(`🎮 Arrange the word:\n\n${hasil.soal}\nType: ${hasil.tipe}\n\nTime: 60s\nPrize *+2989*`);
                susunkata[m.chat + key.id] = {
                    jawaban: hasil.jawaban.toLowerCase(),
                    id: key.id
                };
                await sleep(60000);
                if (rdGame(susunkata, m.chat, key.id)) {
                    m.reply('⏰ Time expired!\nAnswer: ' + susunkata[m.chat + key.id].jawaban);
                    delete susunkata[m.chat + key.id];
                }
            }
            break
            case 'tebakkimia': {
                if (iGame(tebakkimia, m.chat)) return m.reply('An unfinished session already exists!');
                const { result: hasil } = await fetchApi('/games/tebakkimia');
                let { key } = await m.reply(`🎮 Find the chemical symbol:\n\n${hasil.unsur}\n\nTime: 60s\nPrize *+3499*`);
                tebakkimia[m.chat + key.id] = {
                    jawaban: hasil.lambang.toLowerCase(),
                    id: key.id
                };
                await sleep(60000);
                if (rdGame(tebakkimia, m.chat, key.id)) {
                    m.reply('⏰ Time expired!\nAnswer: ' + tebakkimia[m.chat + key.id].jawaban);
                    delete tebakkimia[m.chat + key.id];
                }
            }
            break
            case 'caklontong': {
                if (iGame(caklontong, m.chat)) return m.reply('An unfinished session already exists!');
                const { result: hasil } = await fetchApi('/games/caklontong');
                let { key } = await m.reply(`🎮 Answer the following question:\n\n${hasil.soal}\n\nTime: 60s\nPrize *+9999*`);
                caklontong[m.chat + key.id] = {
                    ...hasil,
                    jawaban: hasil.jawaban.toLowerCase(),
                    id: key.id
                };
                await sleep(60000);
                if (rdGame(caklontong, m.chat, key.id)) {
                    m.reply(`Time expired!\nAnswer: ${caklontong[m.chat + key.id].jawaban}\n"${caklontong[m.chat + key.id].deskripsi}"`);
                    delete caklontong[m.chat + key.id];
                }
            }
            break
            case 'tebaknegara': {
                if (iGame(tebaknegara, m.chat)) return m.reply('An unfinished session already exists!');
                const { result: hasil } = await fetchApi('/games/tebaknegara');
                let { key } = await m.reply(`🎮 Guess the country from the location:\n\n*Location: ${hasil.tempat}*\n\nTime: 60s\nPrize *+3499*`);
                tebaknegara[m.chat + key.id] = {
                    jawaban: hasil.negara.toLowerCase(),
                    id: key.id
                };
                await sleep(60000);
                if (rdGame(tebaknegara, m.chat, key.id)) {
                    m.reply('⏰ Time expired!\nAnswer: ' + tebaknegara[m.chat + key.id].jawaban);
                    delete tebaknegara[m.chat + key.id];
                }
            }
            break
            case 'tebakgambar': {
                if (iGame(tebakgambar, m.chat)) return m.reply('An unfinished session already exists!');
                const { result: hasil } = await fetchApi('/games/tebakgambar');
                let { key } = await nimesha.sendFileUrl(m.chat, hasil.img, `🎮 Guess the image:\n\n${hasil.deskripsi}\n\nTime: 60s\nPrize *+3499*`, m);
                tebakgambar[m.chat + key.id] = {
                    jawaban: hasil.jawaban.toLowerCase(),
                    id: key.id
                };
                await sleep(60000);
                if (rdGame(tebakgambar, m.chat, key.id)) {
                    m.reply('⏰ Time expired!\nAnswer: ' + tebakgambar[m.chat + key.id].jawaban);
                    delete tebakgambar[m.chat + key.id];
                }
            }
            break
            case 'tebakbendera': {
                if (iGame(tebakbendera, m.chat)) return m.reply('An unfinished session already exists!');
                const { result: hasil } = await fetchApi('/games/tebakbendera');
                let { key } = await m.reply(`🎮 Guess the country from the flag:\n\n*Flag: ${hasil.bendera}*\n\nTime: 60s\nPrize *+3499*`);
                tebakbendera[m.chat + key.id] = {
                    jawaban: hasil.negara.toLowerCase(),
                    id: key.id
                };
                await sleep(60000);
                if (rdGame(tebakbendera, m.chat, key.id)) {
                    m.reply('⏰ Time expired!\nAnswer: ' + tebakbendera[m.chat + key.id].jawaban);
                    delete tebakbendera[m.chat + key.id];
                }
            }
            break
            case 'tebakangka': case 'butawarna': case 'colorblind': {
                if (iGame(tebakangka, m.chat)) return m.reply('An unfinished session already exists!');
                const soal = await fetchJson('https://raw.githubusercontent.com/luckyfelistine-bot/maureonix/main/database/color_blind.json');
                const hasil = pickRandom(soal);
                let { key } = await m.reply({
                    text: `Choose the correct answer!\nOptions: ${[hasil.number, ...hasil.similar].sort(() => Math.random() - 0.5).join(', ')}`,
                    contextInfo: {
                        externalAdReply: {
                            renderLargerThumbnail: true,
                            thumbnailUrl: hasil.color_blind[0],
                            body: `Level: ${hasil.lv}`,
                            previewType: 0,
                            mediaType: 1,
                        }
                    }
                });
                tebakangka[m.chat + key.id] = {
                    jawaban: hasil.number,
                    id: key.id
                };
                await sleep(60000);
                if (rdGame(tebakangka, m.chat, key.id)) {
                    m.reply('⏰ Time expired!\nAnswer: ' + tebakangka[m.chat + key.id].jawaban);
                    delete tebakangka[m.chat + key.id];
                }
            }
            break
            case 'kuismath': case 'math': {
                const { genMath, modes } = require('./lib/math');
                const inputMode = ['noob', 'easy', 'medium', 'hard','extreme','impossible','impossible2'];
                if (iGame(kuismath, m.chat)) return m.reply('An unfinished session already exists!');
                if (!text) return m.reply(`Mode: ${Object.keys(modes).join(' | ')}\nUsage example: ${prefix}math medium`);
                if (!inputMode.includes(text.toLowerCase())) return m.reply('Mode not found!');
                let result = await genMath(text.toLowerCase());
                let { key } = await m.reply(`*What is the result: ${result.soal.toLowerCase()}*?\n\nTime: ${(result.waktu / 1000).toFixed(2)} seconds`);
                kuismath[m.chat + key.id] = {
                    jawaban: result.jawaban,
                    mode: text.toLowerCase(),
                    id: key.id
                };
                await sleep(kuismath, result.waktu);
                if (rdGame(m.chat + key.id)) {
                    m.reply('⏰ Time expired!\nAnswer: ' + kuismath[m.chat + key.id].jawaban);
                    delete kuismath[m.chat + key.id];
                }
            }
            break
            case 'ulartangga': case 'snakeladder': case 'ut': {
                if (!m.isGroup) return m.reply(mess.group);
                if (ulartangga[m.chat] && !(ulartangga[m.chat] instanceof SnakeLadder)) {
                    ulartangga[m.chat] = Object.assign(new SnakeLadder(ulartangga[m.chat]), ulartangga[m.chat]);
                }
                switch(args[0]) {
                    case 'create': case 'join':
                    if (ulartangga[m.chat]) {
                        if (Object.keys(ulartangga[m.chat].players).length > 8) return m.reply(`⚠️ Player limit reached! To start: *${prefix + command} start*`);
                        if (ulartangga[m.chat].players.some(a => a.id == m.sender)) return m.reply('You are already connected!');
                        ulartangga[m.chat].players.push({ id: m.sender, move: 0 });
                        m.reply('Successfully joined the game session.');
                    } else {
                        ulartangga[m.chat] = new SnakeLadder({ id: m.chat, host: m.sender });
                        ulartangga[m.chat].players.push({ id: m.sender, move: 0 });
                        ulartangga[m.chat].time = Date.now();
                        m.reply('Successfully created a game session.');
                    }
                    break
                    case 'start':
                    if (!ulartangga[m.chat]) return m.reply('No game session available!');
                    if (ulartangga[m.chat].players.length < 2) return m.reply('Not enough players!\nMinimum 2 players!');
                    if (ulartangga[m.chat].start) return m.reply('Session already started!');
                    if (ulartangga[m.chat].host !== m.sender) return m.reply(`Only the host @${ulartangga[m.chat].host.split('@')[0]} can start the session!`);
                    let { key } = await m.reply({ image: { url: ulartangga[m.chat].map.url }, caption: `🐍🪜SNAKE LADDER GAME\n\n${ulartangga[m.chat].players.map((p, i) => `- @${p.id.split('@')[0]} (Pawn ${['Red', 'Light Blue', 'Yellow', 'Green', 'Purple', 'Orange', 'Dark Blue', 'White'][i]})`).join('\n')}\n\nTurn: @${m.sender.split('@')[0]}\n\nReply to play!\nExample: Type "roll" to roll the dice.`, mentions: ulartangga[m.chat].players.map(p => p.id)});
                    ulartangga[m.chat].id = key.id;
                    ulartangga[m.chat].start = true;
                    break
                    case 'leave':
                    if (!ulartangga[m.chat]) return m.reply('No game session available!');
                    if (!ulartangga[m.chat].players.some(a => a.id == m.sender)) return m.reply('You are not a player!');
                    const player = ulartangga[m.chat].players.findIndex(a => a.id == m.sender);
                    if (ulartangga[m.chat].start) return m.reply('⚠️ Game has already started! Cannot leave now.');
                    if (ulartangga[m.chat].players.length < 1 || ulartangga[m.chat].host === m.sender) {
                        m.reply(ulartangga[m.chat].host === m.sender ? '🚪 Host left, game ended!' : 'Less than 1 player, game ended!');
                        delete ulartangga[m.chat];
                        break;
                    }
                    ulartangga[m.chat].players.splice(player, 1);
                    m.reply('✅ Left the game!');
                    break
                    case 'end':
                    if (!ulartangga[m.chat]) return m.reply('No game session available!');
                    if (ulartangga[m.chat]?.host !== m.sender) return m.reply(`Only the host @${ulartangga[m.chat].host.split('@')[0]} can delete the session!`);
                    delete ulartangga[m.chat];
                    m.reply('Game session successfully deleted.');
                    break
                    default:
                    m.reply(`🐍🪜SNAKE LADDER GAME\nCommand: ${prefix + command} <command>\n- create\n- join\n- start\n- leave\n- end`);
                }
            }
            break
            case 'chess': case 'catur': case 'ct': {
                const { DEFAUT_POSITION } = require('chess.js');
                if (!m.isGroup) return m.reply(mess.group);
                if (chess[m.chat] && !(chess[m.chat] instanceof Chess)) {
                    chess[m.chat] = Object.assign(new Chess(chess[m.chat].fen), chess[m.chat]);
                }
                switch(args[0]) {
                    case 'start':
                    if (!chess[m.chat]) return m.reply('No game session available!');
                    if (!chess[m.chat].acc) return m.reply('Players not complete!');
                    if (chess[m.chat].player1 !== m.sender) return m.reply('⚠️ Only the main player can start!');
                    if (chess[m.chat].turn !== m.sender && !chess[m.chat].start) {
                        const encodedFen = encodeURI(chess[m.chat]._fen);
                        let boardUrls = [`https://www.chess.com/dynboard?fen=${encodedFen}&size=3&coordinates=inside`,`https://www.chess.com/dynboard?fen=${encodedFen}&board=graffiti&piece=graffiti&size=3&coordinates=inside`,`https://chessboardimage.com/${encodedFen}.png`,`https://backscattering.de/web-boardimage/board.png?fen=${encodedFen}`,`https://fen2image.chessvision.ai/${encodedFen}`];
                        for (let url of boardUrls) {
                            try {
                                const { data } = await axios.get(url, { responseType: 'arraybuffer' });
                                let { key } = await m.reply({ image: data, caption: `♟️${command.toUpperCase()} GAME\n\nTurn: @${m.sender.split('@')[0]}\n\nReply to play!\nExample: b1 c3`, mentions: [m.sender] });
                                chess[m.chat].start = true;
                                chess[m.chat].turn = m.sender;
                                chess[m.chat].id = key.id;
                                return;
                            } catch (e) {}
                        }
                        if (!chess[m.chat].key) {
                            m.reply(`❌ Failed to start the game!`);
                        }
                    } else if ([chess[m.chat].player1, chess[m.chat].player2].includes(m.sender)) {
                        const isPlayer2 = chess[m.chat].player2 === m.sender;
                        const nextPlayer = isPlayer2 ? chess[m.chat].player1 : chess[m.chat].player2;
                        const encodedFen = encodeURI(chess[m.chat]._fen);
                        const boardUrls = [`https://www.chess.com/dynboard?fen=${encodedFen}&size=3&coordinates=inside${!isPlayer2 ? '&flip=true' : ''}`,`https://www.chess.com/dynboard?fen=${encodedFen}&board=graffiti&piece=graffiti&size=3&coordinates=inside${!isPlayer2 ? '&flip=true' : ''}`,`https://chessboardimage.com/${encodedFen}${!isPlayer2 ? '-flip' : ''}.png`,`https://backscattering.de/web-boardimage/board.png?fen=${encodedFen}&coordinates=true&size=765${!isPlayer2 ? '&orientation=black' : ''}`,`https://fen2image.chessvision.ai/${encodedFen}/${!isPlayer2 ? '?pov=black' : ''}`];
                        for (let url of boardUrls) {
                            try {
                                chess[m.chat].turn = chess[m.chat].turn === m.sender ? m.sender : nextPlayer;
                                const { data } = await axios.get(url, { responseType: 'arraybuffer' });
                                let { key } = await m.reply({ image: data, caption: `♟️CHESS GAME\n\nTurn: @${chess[m.chat].turn.split('@')[0]}\n\nReply to play!\nExample: b1 c3`, mentions: [chess[m.chat].turn] });
                                chess[m.chat].id = key.id;
                                break;
                            } catch (e) {}
                        }
                    }
                    break
                    case 'join':
                    if (chess[m.chat]) {
                        if (chess[m.chat].player1 !== m.sender) {
                            if (chess[m.chat].acc) return m.reply(`⚠️ Players are complete! Please try again later.`);
                            let teks = chess[m.chat].player2 === m.sender ? 'Thanks for joining' : `Since @${chess[m.chat].player2.split('@')[0]} did not respond\nThey will be replaced by @${m.sender.split('@')[0]}`;
                            chess[m.chat].player2 = m.sender;
                            chess[m.chat].acc = true;
                            m.reply(`${teks}\nPlease ask @${chess[m.chat].player1.split('@')[0]} to start the game (${prefix + command} start)`);
                        } else m.reply(`⚠️ You are already connected!`);
                    } else m.reply('No game session available!');
                    break
                    case 'end': case 'leave':
                    if (chess[m.chat]) {
                        if (![chess[m.chat].player1, chess[m.chat].player2].includes(m.sender)) return m.reply('Only players can end the game!');
                        delete chess[m.chat];
                        m.reply('Successfully deleted game session.');
                    } else m.reply('No game session available!');
                    break
                    case 'bot': case 'computer':
                    if (chess[m.sender]) {
                        delete chess[m.sender];
                        return m.reply('Successfully deleted vs BOT session.');
                    } else {
                        chess[m.sender] = new Chess(DEFAUT_POSITION);
                        chess[m.sender]._fen = chess[m.sender].fen();
                        chess[m.sender].turn = m.sender;
                        chess[m.sender].botMode = true;
                        chess[m.sender].time = Date.now();
                        const encodedFen = encodeURI(chess[m.sender]._fen);
                        const boardUrls = [`https://www.chess.com/dynboard?fen=${encodedFen}&size=3&coordinates=inside`,`https://www.chess.com/dynboard?fen=${encodedFen}&board=graffiti&piece=graffiti&size=3&coordinates=inside`,`https://chessboardimage.com/${encodedFen}.png`,`https://backscattering.de/web-boardimage/board.png?fen=${encodedFen}&coordinates=true&size=765`,`https://fen2image.chessvision.ai/${encodedFen}/`];
                        for (let url of boardUrls) {
                            try {
                                const { data } = await axios.get(url, { responseType: 'arraybuffer' });
                                let { key } = await m.reply({ image: data, caption: `♟️CHESS GAME\n\nTurn: @${chess[m.sender].turn.split('@')[0]}\n\nReply to play!\nExample: b1 c3`, mentions: [chess[m.sender].turn] });
                                chess[m.sender].id = key.id;
                                break;
                            } catch (e) {}
                        }
                    }
                    break
                    default:
                    if (/^@?\d+$/.test(args[0])) {
                        if (chess[m.chat]) return m.reply('An unfinished session already exists!');
                        if (m.mentionedJid.length < 1) return m.reply('Tag someone to play with!');
                        chess[m.chat] = new Chess(DEFAUT_POSITION);
                        chess[m.chat]._fen = chess[m.chat].fen();
                        chess[m.chat].player1 = m.sender;
                        chess[m.chat].player2 = m.mentionedJid ? m.mentionedJid[0] : null;
                        chess[m.chat].time = Date.now();
                        chess[m.chat].turn = null;
                        chess[m.chat].acc = false;
                        m.reply(`♟️${command.toUpperCase()} GAME\n\n@${m.sender.split('@')[0]} challenges @${m.mentionedJid[0].split('@')[0]}\nTo join type ${prefix + command} join`);
                    } else {
                        m.reply(`♟️${command.toUpperCase()} GAME\n\nExample: ${prefix + command} @tag/number\n- start\n- leave\n- join\n- computer\n- end`);
                    }
                }
            }
            break
            case 'blackjack': case 'bj': {
                let session = null;
                for (let id in blackjack) {
                    if (blackjack[id].players.find(p => p.id === m.sender)) {
                        session = blackjack[id];
                        break;
                    }
                }
                if (session && !(session instanceof Blackjack)) {
                    session = Object.assign(new Blackjack(session), session);
                }
                if (blackjack[m.chat] && !(blackjack[m.chat] instanceof Blackjack)) {
                    blackjack[m.chat] = Object.assign(new Blackjack(blackjack[m.chat]), blackjack[m.chat]);
                }
                switch(args[0]) {
                    case 'create': case 'join':
                    if (!m.isGroup) return m.reply(mess.group);
                    if (blackjack[m.chat] || session) {
                        if (blackjack[m.chat]?.players?.some(a => a.id === m.sender)) return m.reply('You are already connected!');
                        if (session) return m.reply('You are already in another group session! Leave it first.');
                        if (blackjack[m.chat].players.length > 10) return m.reply(`⚠️ Player limit reached! To start: *${prefix + command} start*`);
                        blackjack[m.chat].players.push({ id: m.sender, cards: [] });
                        m.reply('Successfully joined Blackjack game.');
                    } else {
                        blackjack[m.chat] = new Blackjack({ id: m.chat, host: m.sender });
                        blackjack[m.chat].players.push({ id: m.sender, cards: [] });
                        m.reply('Successfully created Blackjack game.');
                    }
                    break
                    case 'start':
                    if (!m.isGroup) return m.reply(mess.group);
                    if (!blackjack[m.chat]) return m.reply('No Blackjack game session available!');
                    if (blackjack[m.chat]?.host !== m.sender) return m.reply(`Only the host @${blackjack[m.chat].host.split('@')[0]} can start the session!`);
                    if (blackjack[m.chat].players.length < 2) return m.reply('⚠️ At least 2 players are required to start!');
                    if (blackjack[m.chat].started) return m.reply('Game already started!');
                    blackjack[m.chat].distributeCards();
                    m.reply(`🃏BLACKJACK GAME♦️\nStarting Card: ${blackjack[m.chat].startCard.rank + blackjack[m.chat].startCard.suit}\nDeck Count: ${blackjack[m.chat].deck.length}\n${blackjack[m.chat].players.map(a => `- @${a.id.split('@')[0]} : (${a.cards.length} cards)`).join('\n')}\n\nCheck private chat\nwa.me/${botNumber.split('@')[0]}`);
                    for (let p of blackjack[m.chat].players) {
                        const startCard = blackjack[m.chat].startCard;
                        let buttons = p.cards.map(a => ({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: `${a.rank}${a.suit}`, id: `.${command} play ${a.rank}${a.suit}` })}));
                        if (!blackjack[m.chat].hasMatching(p.id)) buttons.push({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Drink', id: `.${command} drink` }) });
                        await nimesha.sendListMsg(p.id, { text: `Starting Card: ${startCard.rank + startCard.suit}`, footer: `${p.cards.map(c => c.rank + c.suit).join(', ')}`, buttons }, { quoted: m });
                    }
                    break
                    case 'hit': case 'drink': {
                        if (!session) return m.reply('No Blackjack game session available!');
                        if (!session.started) return m.reply('Game has not started!');
                        if (session.players.length < 2) return m.reply('⚠️ At least 2 players are required to start!');
                        if (!session.players?.some(a => a.id === m.sender)) return m.reply('You are not connected!');
                        if (!args[0]) return m.reply(`Use format:\n${prefix + command} play <card>\nExample: ${prefix + command} hit`);
                        const player = session.players.find(p => p.id === m.sender);
                        const hitIndex = player.cards.findIndex(c => (c.rank + c.suit) === (session.startCard.rank + session.startCard.suit));
                        if (session.submitCard.some(s => s.id === m.sender) || session.skip.includes(m.sender)) {
                            return m.reply('You have already played this round!');
                        }
                        if (!session.hasMatching(m.sender)) {
                            if (session.deck.length) {
                                const newCard = session.deck.shift();
                                player.cards.push(newCard);
                                await sleep(1000);
                                let buttons = player.cards.map(a => ({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: `${a.rank}${a.suit}`, id: `.${command} play ${a.rank}${a.suit}` })}));
                                if (!session.hasMatching(player.id)) buttons.push({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Drink', id: `.${command} drink` }) });
                                await nimesha.sendListMsg(player.id, { text: `Starting Card: ${session.startCard.rank + session.startCard.suit}`, footer: `${player.cards.map(c => c.rank + c.suit).join(', ')}`, buttons }, { quoted: m });
                            } else {
                                let reuse = session.reuseSubmitCardsForDrinking();
                                await m.reply(reuse.msg);
                                if (!session.skip.find(a => a.id === player.id)) session.skip.push({ id: player.id });
                                await m.reply('Deck is empty, you cannot draw a card. Skipping.');
                                await nimesha.sendText(session.id, `@${m.sender.split('@')[0]} Skipping because deck is empty.`, m);
                                if ((session.submitCard.length + session.skip.length) === session.players.length) {
                                    const result = session.resolveRound();
                                    if (result) {
                                        await nimesha.sendText(session.id, result, m);
                                        if (session.players.length === 1) {
                                            await nimesha.sendText(session.id, `Only one player left (@${session.players[0].id.split('@')[0]}), Blackjack session ended.`, m);
                                            delete blackjack[session.id];
                                            return;
                                        }
                                        const leaderCards = session.players.find(a => a.id === session.leader);
                                        let buttons = leaderCards.cards.map(c => ({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: `${c.rank}${c.suit}`, id: `.${command} play ${c.rank}${c.suit}` }));
                                        await nimesha.sendListMsg(session.leader, { text: 'Choose a card to start the next round', footer: leaderCards.cards.map(c => c.rank + c.suit).join(', '), buttons }, { quoted: m });
                                    }
                                }
                            }
                        } else m.reply(`You have a matching suit card, play before drinking!`);
                        if ((session.submitCard.length + session.skip.length) === session.players.length) {
                            const result = session.resolveRound();
                            if (result) {
                                await nimesha.sendText(session.id, result, m);
                                if (session.players.length === 1) {
                                    await nimesha.sendText(session.id, `Only one player left (@${session.players[0].id.split('@')[0]}), Blackjack session ended.`, m);
                                    delete blackjack[session.id];
                                    return;
                                }
                                const leaderCards = session.players.find(a => a.id === session.leader);
                                let buttons = leaderCards.cards.map(c => ({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: `${c.rank}${c.suit}`, id: `.${command} play ${c.rank}${c.suit}` })));
                                await nimesha.sendListMsg(session.leader, { text: 'Choose a card to start the next round', footer: leaderCards.cards.map(c => c.rank + c.suit).join(', '), buttons }, { quoted: m });
                            }
                        }
                    }
                    break
                    case 'play': {
                        if (!session) return m.reply('No Blackjack game session available!');
                        if (!session.started) return m.reply('Game has not started!');
                        if (session.players.length < 2) return m.reply('⚠️ At least 2 players are required to start!');
                        if (!session.players?.some(a => a.id === m.sender)) return m.reply('You are not connected!');
                        if (!args[1]) return m.reply(`Use format:\n${prefix + command} play <card>\nExample: ${prefix + command} play 3♥️`);
                        const player = session.players.find(p => p.id === m.sender);
                        const idx = player.cards.findIndex(c => normalize(c.rank + c.suit) === normalize(args[1]));
                        if (idx === -1) return m.reply('Invalid card!');
                        if (session.submitCard.some(s => s.id === m.sender) || session.skip.includes(m.sender)) return m.reply('You have already played this round!');
                        const card = player.cards[idx];
                        if (Object.keys(session.startCard).length) {
                            if (card.suit !== session.startCard.suit) return m.reply(`❌ Card does not match! Suit must be ${session.startCard.suit}`);
                        } else if (m.sender !== session.leader) return m.reply('Only the round leader can start!');
                        player.cards.splice(idx, 1);
                        session.secondDeck.push(card);
                        session.submitCard.push({ id: m.sender, card: card });
                        await sleep(1000);
                        if (player.cards.length === 0) {
                            session.winner.push({ id: player.id });
                            session.leader = '';
                            session.submitCard = [];
                            session.players = session.players.filter(p => p.id !== player.id);
                            await nimesha.sendText(session.id, `@${m.sender.split('@')[0]} wins the game!\nCards left: 0`, m);
                            if (session.players.length === 1) {
                                await nimesha.sendText(session.id, `Only one player left (@${session.players[0].id.split('@')[0]}), Blackjack session ended.`, m);
                                delete blackjack[session.id];
                                return;
                            }
                        }
                        if (Object.keys(session.startCard).length === 0) {
                            session.startCard = card;
                            await nimesha.sendText(session.id, `@${m.sender.split('@')[0]} starts the round with ${card.rank}${card.suit}`, m);
                            for (let s of session.players) {
                                if (s.id === session.leader) continue;
                                const startCard = session.startCard;
                                let buttons = s.cards.map(a => ({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: `${a.rank}${a.suit}`, id: `.${command} play ${a.rank}${a.suit}` })}));
                                if (!session.hasMatching(s.id)) buttons.push({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Drink', id: `.${command} drink` }) });
                                await nimesha.sendListMsg(s.id, { text: `Starting Card: ${startCard.rank + startCard.suit}`, footer: `${s.cards.map(c => c.rank + c.suit).join(', ')}`, buttons }, { quoted: m });
                            }
                            return;
                        }
                        if ((session.submitCard.length + session.skip.length) === session.players.length) {
                            const result = session.resolveRound();
                            if (result) {
                                await nimesha.sendText(session.id, result, m);
                                if (session.players.length === 1) {
                                    await nimesha.sendText(session.id, `Only one player left (@${session.players[0].id.split('@')[0]}), Blackjack session ended.`, m);
                                    delete blackjack[session.id];
                                    return;
                                }
                                const leaderCards = session.players.find(a => a.id === session.leader);
                                let buttons = leaderCards.cards.map(c => ({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: `${c.rank}${c.suit}`, id: `.${command} play ${c.rank}${c.suit}` })));
                                await nimesha.sendListMsg(session.leader, { text: 'Choose a card to start the next round', footer: leaderCards.cards.map(c => c.rank + c.suit).join(', '), buttons }, { quoted: m });
                            }
                        }
                        await m.reply(`✅ You played ${card.rank}${card.suit}`);
                        await nimesha.sendText(session.id, `@${m.sender.split('@')[0]} played ${card.rank}${card.suit}`, m);
                    }
                    break
                    case 'info':
                    if (!session) return m.reply('No Blackjack game session available!');
                    if (!session.players?.some(a => a.id === m.sender)) return m.reply('You are not connected!');
                    const players = session.players.map((p, i) => `${i + 1}. @${p.id.split('@')[0]} ${p.id === session.host ? '(HOST) ' : p.id === session.leader ? '(Leader)' : ''}`).join('\n');
                    if (m.isGroup) {
                        m.reply(`🃏BLACKJACK GAME INFO ♦️\n*Number of players:* ${session.players.length}\n*Host:* @${session.host.split('@')[0]}\n*Status:* ${session.started ? 'Started' : 'Not started'}${Object.keys(session.startCard).length > 1 ? `\n*Starting Card:* ${session.startCard.rank + session.startCard.suit}` : ''}\n*Deck cards left:* ${session.deck.length}\n\n*Player list:*\n${players}${session.secondDeck.length ? `\n\n*Card history:* ${session.secondDeck.map(c => `${c.rank}${c.suit}`).join(', ')}` : ''}`);
                    } else {
                        const player = session.players.find(p => p.id === m.sender);
                        const cards = player.cards?.map(c => `${c.rank}${c.suit}`).join(', ') || 'No cards yet';
                        m.reply(`🃏BLACKJACK GAME INFO ♦️\n*Number of players:* ${session.players.length}\n*Host:* @${session.host.split('@')[0]}\n*Status:* ${session.started ? 'Started' : 'Not started'}${Object.keys(session.startCard).length > 1 ? `\n*Starting Card:* ${session.startCard.rank + session.startCard.suit}` : ''}\n*Deck cards left:* ${session.deck.length}\n\n*Player list:*\n${players}\n\n*Your cards:*\n${cards}${session.secondDeck.length ? `\n\n*Card history:* ${session.secondDeck.map(c => `${c.rank}${c.suit}`).join(', ')}` : ''}`);
                    }
                    break
                    case 'end':
                    if (!m.isGroup) return m.reply(mess.group);
                    if (!blackjack[m.chat]) return m.reply('No Blackjack game session available!');
                    if (blackjack[m.chat]?.host !== m.sender) return m.reply(`Only the host @${blackjack[m.chat].host.split('@')[0]} can delete the session!`);
                    delete blackjack[m.chat];
                    m.reply('Blackjack game session successfully deleted.');
                    break
                    default:
                    m.reply(`🃏BLACKJACK GAME♦️\nCommand: ${prefix + command} <command>\n- create\n- join\n- start\n- info\n- hit\n- deck\n- end`);
                }
            }
            break
            
            // Menu
            case 'menu': {
                if (args[0] == 'set') {
                    if (['1','2','3'].includes(args[1])) {
                        set.template = parseInt(Number(args[1]));
                        m.reply('Successfully changed menu template.');
                    } else m.reply(`Choose a template:\n- 1 (Button Menu)\n- 2 (List Menu)\n- 3 (Document Menu)`);
                } else {
                    // Carousel menu — swipe and tap to open sub-menu
                    const _baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN ? 'https://' + process.env.RAILWAY_PUBLIC_DOMAIN : ('https://your-server-url');
                    if (global.generateMenuCards) await global.generateMenuCards().catch(e => {});
                    const carouselCards = [
                        {
                            url: _baseUrl + '/menucard/bot',
                            body: '🤖 *BOT COMMANDS*\n━━━━━━━━━━━━━━━━━\n▸ .alive\n▸ .bot\n▸ .ping\n▸ .speed\n▸ .runtime\n▸ .block\n▸ .unblock\n▸ .allblock\n▸ .allunblock\n▸ .listblock',
                            footer: '👆 Tap — BOT menu will open',
                            buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🤖 Open BOT Menu', id: prefix + 'botmenu' }) }]
                        },
                        {
                            url: _baseUrl + '/menucard/group',
                            body: '👥 *GROUP COMMANDS*\n━━━━━━━━━━━━━━━━━\n▸ .tagall\n▸ .hidetag\n▸ .add\n▸ .kick\n▸ .promote\n▸ .demote\n▸ .welcome\n▸ .setname',
                            footer: '👆 Tap — GROUP menu will open',
                            buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👥 Open GROUP Menu', id: prefix + 'groupmenu' }) }]
                        },
                        {
                            url: _baseUrl + '/menucard/download',
                            body: '⬇️ *DOWNLOAD COMMANDS*\n━━━━━━━━━━━━━━━━━\n▸ .song\n▸ .mp3\n▸ .play\n▸ .ytmp3\n▸ .video\n▸ .mp4\n▸ .ytmp4',
                            footer: '👆 Tap — DOWNLOAD menu will open',
                            buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⬇️ Open DOWNLOAD Menu', id: prefix + 'downloadmenu' }) }]
                        },
                        {
                            url: _baseUrl + '/menucard/ai',
                            body: '🤖 *AI COMMANDS*\n━━━━━━━━━━━━━━━━━\n▸ .gpt\n▸ .gemini\n▸ .llama3\n▸ .ai\n▸ .chatai\n▸ .imagine\n▸ .flux\n▸ .sora',
                            footer: '👆 Tap — AI menu will open',
                            buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🤖 Open AI Menu', id: prefix + 'aimenu' }) }]
                        },
                        {
                            url: _baseUrl + '/menucard/sticker',
                            body: '🎨 *STICKER & IMAGE*\n━━━━━━━━━━━━━━━━━\n▸ .sticker\n▸ .attp\n▸ .simage\n▸ .removebg\n▸ .blur\n▸ .ss\n▸ .tts\n▸ .trt',
                            footer: '👆 Tap — STICKER menu will open',
                            buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎨 Open STICKER Menu', id: prefix + 'stickersmenu' }) }]
                        },
                        {
                            url: _baseUrl + '/menucard/fun',
                            body: '😂 *FUN COMMANDS*\n━━━━━━━━━━━━━━━━━\n▸ .joke\n▸ .quote\n▸ .fact\n▸ .8ball\n▸ .compliment\n▸ .hack\n▸ .ship\n▸ .flirt',
                            footer: '👆 Tap — FUN menu will open',
                            buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '😂 Open FUN Menu', id: prefix + 'quotesmenu' }) }]
                        },
                        {
                            url: _baseUrl + '/menucard/games',
                            body: '🎮 *GAMES COMMANDS*\n━━━━━━━━━━━━━━━━━\n▸ .tictactoe\n▸ .suit\n▸ .chess\n▸ .akinator\n▸ .slot\n▸ .math\n▸ .blackjack',
                            footer: '👆 Tap — GAMES menu will open',
                            buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎮 Open GAMES Menu', id: prefix + 'gamemenu' }) }]
                        },
                        {
                            url: _baseUrl + '/menucard/search',
                            body: '🔍 *SEARCH COMMANDS*\n━━━━━━━━━━━━━━━━━\n▸ .google\n▸ .ytsearch\n▸ .define\n▸ .weather\n▸ .news\n▸ .lyrics\n▸ .fact',
                            footer: '👆 Tap — SEARCH menu will open',
                            buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔍 Open SEARCH Menu', id: prefix + 'searchmenu' }) }]
                        },
                        {
                            url: await (async () => {
                                try {
                                    const ownerJid = (global.owner?.[0] || '').replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                                    if (ownerJid && ownerJid !== '@s.whatsapp.net') {
                                        const dpUrl = await nimesha.profilePictureUrl(ownerJid, 'image');
                                        if (dpUrl) return dpUrl;
                                    }
                                } catch (_) {}
                                try {
                                    const botJid = nimesha.user?.id?.replace(':0@', '@') || nimesha.user?.id;
                                    if (botJid) {
                                        const dpUrl = await nimesha.profilePictureUrl(botJid, 'image');
                                        if (dpUrl) return dpUrl;
                                    }
                                } catch (_) {}
                                return 'https://i.ibb.co/MDcvDZqT/z-R.jpg';
                            })(),
                            body: '🔐 *Privacy Manager*\n━━━━━━━━━━━━━━━━━\n▸ .privacy 1-3 — Last Seen\n▸ .privacy 4-5 — Online Status\n▸ .privacy 6-8 — Profile Picture\n▸ .privacy 9-11 — Status Updates\n▸ .privacy 12-13 — Read Receipts\n▸ .privacy 14-16 — Groups Add\n▸ .privacy 17-20 — Disappearing\n▸ .privacy 21 — Block List',
                            footer: '👆 Tap — Privacy settings will open',
                            buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔐 Open Privacy Menu', id: prefix + 'privacy' }) }]
                        },
                    ];
                    await nimesha.sendCarouselMsg(
                        m.chat,
                        `*Maureonix*\n\n👤 *User:* ${m.pushName || 'User'}\n🔧 *Prefix:* ${prefix}\n📅 ${tanggal}  🕐 ${jam}\n\n_Swipe and tap on a category_ 👉`,
                        'Maureonix | By Infinite Vybeflix',
                        carouselCards
                    );
                }
            }
            break
            case 'allmenu': {
                try {
                    const { generateMenuImage } = require('./lib/menuimage');
                    const menuImg = await generateMenuImage({
                        prefix,
                        botName: set?.botname || 'Maureonix',
                        ownerName: global.author || 'Infinite Vybeflix',
                        memberName: m.pushName || 'User',
                        totalCmds: ((fs.readFileSync('./nima.js').toString()).match(/case '/g) || []).length,
                        time: jam,
                        date: tanggal,
                    });
                    await nimesha.sendMessage(m.chat, {
                        image: menuImg,
                        caption: '*' + (set?.botname || 'Maureonix') + '* Menu\n👑 _By ' + (global.author || 'Infinite Vybeflix') + '_',
                        mentions: [m.sender],
                    }, { quoted: m });
                    break;
                } catch(menuErr) {
                    console.log('Menu image error, falling back:', menuErr.message);
                }
                let profile;
                try {
                    profile = await nimesha.profilePictureUrl(m.sender, 'image');
                } catch (e) {
                    profile = fake.anonim;
                }
                const menunya = `
╭──❍「 *🤵USER DETAILS👩‍💼* 」❍
├ *Name* : ${m.pushName ? m.pushName : 'Infinite Vybeflix'}
├ *Number* : @${m.sender.split('@')[0]}
├ *User* : ${isVip ? 'VIP' : isPremium ? 'PREMIUM' : 'FREE'}
├ *Limit* : ${isVip ? 'VIP' : db.users[m.sender].limit }
├ *Money* : ${db.users[m.sender] ? db.users[m.sender].money.toLocaleString('en-US') : '0'}
╰─┬────❍
╭─┴─❍「 *🤖 BOT DETAILS 🤖* 」❍
├ *Bot Name* : ${set?.botname || 'Maureonix'}
├ *Powered by* : @${'0@s.whatsapp.net'.split('@')[0]}
├ *Owner* : @${ownerNumber[0].split('@')[0]}
├ *Mode* : ${nimesha.public ? 'Public' : 'Self'}
├ *Prefix* :${set.multiprefix ? '「 MULTI-PREFIX 」' : ' *'+prefix+'*' }
├ *Total Features* : ${((fs.readFileSync('./nima.js').toString()).match(/case '/g) || []).length}
├ *Premium Features* : 🔸️
╰─┬────❍
╭─┴─❍「 *📅 DETAILS 📅* 」❍
├ *Date* : ${tanggal}
├ *Day* : ${dayName}
├ *Time* : ${jam} EAT
╰──────❍
╭──❍「 *🤖 BOT COMMANDS 🤖* 」❍
│${setv} ${prefix}alive (Is the bot alive?)
│${setv} ${prefix}bot (Bot status)
│${setv} ${prefix}ping (Response time)
│${setv} ${prefix}runtime (Uptime)
│${setv} ${prefix}uptime (Uptime)
│${setv} ${prefix}speed (Speed test)
│${setv} ${prefix}info (Bot info)
│${setv} ${prefix}owner (Owner info)
│${setv} ${prefix}vv (View once messages)
│${setv} ${prefix}ok (View once messages)
│${setv} ${prefix}jid (JID / number)
│${setv} ${prefix}url (URL encode)
│${setv} ${prefix}groupinfo (Group details)
│${setv} ${prefix}staff (Group admins)
│${setv} ${prefix}admins (Group admins)
│${setv} ${prefix}github (GitHub repository)
│${setv} ${prefix}repo (GitHub repository)
│${setv} ${prefix}profile (Account details)
│${setv} ${prefix}claim (Claim daily reward)
│${setv} ${prefix}buy (Buy items)
│${setv} ${prefix}transfer (Send money)
│${setv} ${prefix}leaderboard (Leaderboard)
│${setv} ${prefix}request (Make a request)
│${setv} ${prefix}react (React to message)
│${setv} ${prefix}tagme (Tag me)
│${setv} ${prefix}runtime (Uptime)
│${setv} ${prefix}totalfitur (Total features)
│${setv} ${prefix}speed (Speed test)
│${setv} ${prefix}ping (Response time)
│${setv} ${prefix}afk (Set AFK)
│${setv} ${prefix}rvo (Read view once)
│${setv} ${prefix}inspect (Inspect group/channel)
│${setv} ${prefix}addmsg (Add message to database)
│${setv} ${prefix}delmsg (Delete message from database)
│${setv} ${prefix}getmsg (Get message from database)
│${setv} ${prefix}listmsg (List messages)
│${setv} ${prefix}setcmd (Set command)
│${setv} ${prefix}delcmd (Delete command)
│${setv} ${prefix}listcmd (List commands)
│${setv} ${prefix}lockcmd (Lock command)
│${setv} ${prefix}q (Quote message)
│${setv} ${prefix}menfes (Secret message)
│${setv} ${prefix}confes (Confession)
│${setv} ${prefix}roomai (AI room)
│${setv} ${prefix}jadibot (Become another bot) 🔸️
│${setv} ${prefix}stopjadibot (Stop jadibot)
│${setv} ${prefix}listjadibot (List jadibots)
│${setv} ${prefix}donasi (Donate)
│${setv} ${prefix}addsewa (Add rental)
│${setv} ${prefix}delsewa (Delete rental)
│${setv} ${prefix}listsewa (List rentals)
╰─┬────❍
╭─┴❍「 *👥 GROUP COMMANDS 👥* 」❍
│${setv} ${prefix}add (Add member)
│${setv} ${prefix}kick (Remove member)
│${setv} ${prefix}promote (Promote to admin)
│${setv} ${prefix}demote (Demote from admin)
│${setv} ${prefix}warn (Warn member)
│${setv} ${prefix}unwarn (Remove warning)
│${setv} ${prefix}setname (Change group name)
│${setv} ${prefix}setdesc (Change description)
│${setv} ${prefix}setppgc (Set group picture)
│${setv} ${prefix}delete (Delete message)
│${setv} ${prefix}linkgrup (Group link)
│${setv} ${prefix}revoke (Reset link)
│${setv} ${prefix}tagall (Tag everyone)
│${setv} ${prefix}pin (Pin message)
│${setv} ${prefix}unpin (Unpin message)
│${setv} ${prefix}hidetag (Hidden tag)
│${setv} ${prefix}totag (Forward and tag)
│${setv} ${prefix}listonline (List online users)
│${setv} ${prefix}group set (Group settings)
│${setv} ${prefix}group (Admin only)
╰─┬────❍
╭─┴❍「 *🔍 SEARCH 🔍* 」❍
│${setv} ${prefix}ytsearch (YouTube search)
│${setv} ${prefix}spotify (Music search)
│${setv} ${prefix}pixiv (Art search)
│${setv} ${prefix}pinterest (Image search)
│${setv} ${prefix}wallpaper (Wallpaper)
│${setv} ${prefix}ringtone (Ringtone)
│${setv} ${prefix}google (Google search)
│${setv} ${prefix}gimage (Google images)
│${setv} ${prefix}npm (NPM search)
│${setv} ${prefix}style (Text styles)
│${setv} ${prefix}cuaca (Weather)
│${setv} ${prefix}tenor (GIF search)
│${setv} ${prefix}urban (Urban dictionary)
╰─┬────❍
╭─┴❍「 *⬇️ DOWNLOAD ⬇️* 」❍
│${setv} ${prefix}mp3 (Song name / YouTube URL)
│${setv} ${prefix}song (Song name / YouTube URL)
│${setv} ${prefix}play (Song name / YouTube URL)
│${setv} ${prefix}ytmp3 (Song name / YouTube URL)
│${setv} ${prefix}ytmp4 (Video name / YouTube URL)
│${setv} ${prefix}video (Video name / YouTube URL)
│${setv} ${prefix}mp4 (Video name / YouTube URL)
│${setv} ${prefix}instagram (Instagram video)
│${setv} ${prefix}tiktok (TikTok video)
│${setv} ${prefix}tiktokmp3 (TikTok audio)
│${setv} ${prefix}facebook (Facebook video)
│${setv} ${prefix}spotifydl (Spotify track)
│${setv} ${prefix}mediafire (MediaFire file)
╰─┬────❍
╭─┴❍「 *💬 QUOTES 💬* 」❍
│${setv} ${prefix}motivasi (Motivation)
│${setv} ${prefix}quotes (Quotes)
│${setv} ${prefix}truth (Truth)
│${setv} ${prefix}bijak (Wisdom)
│${setv} ${prefix}dare (Dare)
│${setv} ${prefix}bucin (Love quotes)
│${setv} ${prefix}renungan (Reflection)
╰─┬────❍
╭─┴❍「 *🛠️ TOOLS 🛠️* 」❍
│${setv} ${prefix}get (Fetch data) 🔸️
│${setv} ${prefix}hd (Enhance image)
│${setv} ${prefix}toaudio (Convert to audio)
│${setv} ${prefix}tomp3 (Convert to MP3)
│${setv} ${prefix}tovn (Convert to voice note)
│${setv} ${prefix}toimage (Convert to image)
│${setv} ${prefix}toptv (Convert to PTV)
│${setv} ${prefix}tourl (Upload to URL)
│${setv} ${prefix}tts (Text to speech)
│${setv} ${prefix}toqr (Generate QR)
│${setv} ${prefix}brat (Special sticker)
│${setv} ${prefix}bratvid (Video sticker)
│${setv} ${prefix}ssweb (Web screenshot) 🔸️
│${setv} ${prefix}sticker (Make sticker)
│${setv} ${prefix}attp (Animated sticker)
│${setv} ${prefix}colong (Take sticker)
│${setv} ${prefix}smeme (Make meme)
│${setv} ${prefix}dehaze (Enhance)
│${setv} ${prefix}colorize (Colorize)
│${setv} ${prefix}hitamkan (Black & white)
│${setv} ${prefix}emojimix (Mix emojis)
│${setv} ${prefix}hack (Fake hack)
│${setv} ${prefix}nulis (Write)
│${setv} ${prefix}readmore (Read more)
│${setv} ${prefix}qc (Fake chat)
│${setv} ${prefix}translate (Translate)
│${setv} ${prefix}wasted (Wasted effect)
│${setv} ${prefix}triggered (Triggered effect)
│${setv} ${prefix}shorturl (Shorten URL)
│${setv} ${prefix}gitclone (GitHub clone)
│${setv} ${prefix}fat (Audio effect)
│${setv} ${prefix}fast (Audio effect)
│${setv} ${prefix}bass (Audio effect)
│${setv} ${prefix}slow (Audio effect)
│${setv} ${prefix}tupai (Audio effect)
│${setv} ${prefix}deep (Audio effect)
│${setv} ${prefix}robot (Audio effect)
│${setv} ${prefix}blown (Audio effect)
│${setv} ${prefix}reverse (Audio effect)
│${setv} ${prefix}smooth (Audio effect)
│${setv} ${prefix}earrape (Audio effect)
│${setv} ${prefix}nightcore (Audio effect)
│${setv} ${prefix}getexif (Get sticker EXIF)
│${setv} ${prefix}blur (Blur image)
│${setv} ${prefix}removebg (Remove background)
│${setv} ${prefix}rmbg (Remove background)
│${setv} ${prefix}simage (Sticker → image)
│${setv} ${prefix}toimg (Sticker → image)
│${setv} ${prefix}tts (Text → speech)
│${setv} ${prefix}trt (Translate)
╰─┬────❍
╭─┴❍「 *🤖 ARTIFICIAL INTELLIGENCE 🤖* 」❍
│${setv} ${prefix}ai (Ask AI)
│${setv} ${prefix}gemini (Gemini AI)
│${setv} ${prefix}txt2img (Text to image)
╰─┬────❍
╭─┴❍「 *✨ ANIME ✨* 」❍
│${setv} ${prefix}waifu (Anime images)
│${setv} ${prefix}neko (Neko images)
╰─┬────❍
╭─┴❍「 *🎮 GAMES 🎮* 」❍
│${setv} ${prefix}tictactoe (Tic Tac Toe)
│${setv} ${prefix}akinator (Akinator)
│${setv} ${prefix}suit (Rock Paper Scissors)
│${setv} ${prefix}slot (Slot machine)
│${setv} ${prefix}math (Math quiz)
│${setv} ${prefix}begal (Rob)
│${setv} ${prefix}ulartangga (Snake Ladder)
│${setv} ${prefix}blackjack (Blackjack)
│${setv} ${prefix}catur (Chess)
│${setv} ${prefix}casino (Casino)
│${setv} ${prefix}samgong (Card game)
│${setv} ${prefix}rampok (Rob)
│${setv} ${prefix}tekateki (Riddle)
│${setv} ${prefix}tebaklirik (Lyric guess)
│${setv} ${prefix}tebakkata (Word guess)
│${setv} ${prefix}tebakbom (Bomb guess)
│${setv} ${prefix}susunkata (Arrange word)
│${setv} ${prefix}colorblind (Color test)
│${setv} ${prefix}tebakkimia (Chemistry guess)
│${setv} ${prefix}caklontong (Funny riddle)
│${setv} ${prefix}tebakangka (Number guess)
│${setv} ${prefix}tebaknegara (Country guess)
│${setv} ${prefix}tebakgambar (Image guess)
│${setv} ${prefix}tebakbendera (Flag guess)
╰─┬────❍
╭─┴❍「 *😂 ENTERTAINMENT 😂* 」❍
│${setv} ${prefix}coba (Try)
│${setv} ${prefix}dadu (Dice)
│${setv} ${prefix}bisakah (Can I?)
│${setv} ${prefix}apakah (Is it?)
│${setv} ${prefix}kapan (When?)
│${setv} ${prefix}siapa (Who?)
│${setv} ${prefix}kerangajaib (Magic shell)
│${setv} ${prefix}cekmati (Death joke)
│${setv} ${prefix}ceksifat (Check character)
│${setv} ${prefix}cekkhodam (Check khodam)
│${setv} ${prefix}rate (Rate)
│${setv} ${prefix}jodohku (Soulmate)
│${setv} ${prefix}jadian (Relationship)
│${setv} ${prefix}fitnah (Fake message)
│${setv} ${prefix}halah (Text effect)
│${setv} ${prefix}hilih (Text effect)
│${setv} ${prefix}huluh (Text effect)
│${setv} ${prefix}heleh (Text effect)
│${setv} ${prefix}holoh (Text effect)
╰─┬────❍
╭─┴❍「 *🎲 RANDOM 🎲* 」❍
│${setv} ${prefix}coffe (Coffee images)
╰─┬────❍
╭─┴❍「 *🔎 INFORMATION 🔎* 」❍
│${setv} ${prefix}wastalk (WhatsApp info)
│${setv} ${prefix}githubstalk (GitHub info)
╰─┬────❍
╭─┴❍「 *👑 OWNER COMMANDS 👑* 」❍
│${setv} ${prefix}bot [set] (Bot settings)
│${setv} ${prefix}setbio (Set bio)
│${setv} ${prefix}setppbot (Set bot picture)
│${setv} ${prefix}join (Join group)
│${setv} ${prefix}leave (Leave group)
│${setv} ${prefix}block (Block)
│${setv} ${prefix}listblock (List blocked)
│${setv} ${prefix}openblock (Unblock)
│${setv} ${prefix}listpc (Private chats list)
│${setv} ${prefix}listgc (Groups list)
│${setv} ${prefix}ban (Ban user)
│${setv} ${prefix}unban (Unban user)
│${setv} ${prefix}mute (Mute)
│${setv} ${prefix}unmute (Unmute)
│${setv} ${prefix}creategc (Create group)
│${setv} ${prefix}clearchat (Clear chat)
│${setv} ${prefix}addprem (Add premium)
│${setv} ${prefix}delprem (Remove premium)
│${setv} ${prefix}listprem (List premium)
│${setv} ${prefix}addlimit (Add limit)
│${setv} ${prefix}adduang (Add money)
│${setv} ${prefix}setbotauthor (Set bot author)
│${setv} ${prefix}setbotname (Set bot name)
│${setv} ${prefix}setbotpackname (Set pack name)
│${setv} ${prefix}setapikey (Set API key)
│${setv} ${prefix}addowner (Add owner)
│${setv} ${prefix}delowner (Remove owner)
│${setv} ${prefix}getmsgstore (Get message store)
│${setv} ${prefix}bot --settings (Bot settings)
│${setv} ${prefix}bot settings (Bot settings)
│${setv} ${prefix}getsession (Get session)
│${setv} ${prefix}delsession (Delete session)
│${setv} ${prefix}delsampah (Delete garbage)
│${setv} ${prefix}upsw (Upload status)
│${setv} ${prefix}backup (Backup data)
│${setv} ${prefix}bot autostatus (Auto view status)
│${setv} ${prefix}bot antidelete (Anti delete)
│${setv} $ (Execute code)
│${setv} > (Execute code)
│${setv} < (Execute code)
╰──────❍`;
                await m.reply({
                    document: fake.docs,
                    fileName: ucapanWaktu,
                    mimetype: pickRandom(fake.listfakedocs),
                    fileLength: '100000000000000',
                    pageCount: '999',
                    caption: menunya,
                    contextInfo: {
                        mentionedJid: [m.sender, '0@s.whatsapp.net', ownerNumber[0] + '@s.whatsapp.net'],
                        forwardingScore: 10,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: my.ch,
                            serverMessageId: null,
                            newsletterName: 'Maureonix'
                        },
                        externalAdReply: {
                            title: author,
                            body: packname,
                            showAdAttribution: false,
                            thumbnailUrl: profile,
                            mediaType: 1,
                            previewType: 0,
                            renderLargerThumbnail: true,
                            mediaUrl: my.gh,
                            sourceUrl: my.gh,
                        }
                    }
                });
            }
            break
            case 'botmenu': {
                await nimesha.sendListMsg(m.chat, {
                    text: `*🤖 BOT Commands*\n━━━━━━━━━━━━━━━━━━━━━━\n_Tap a command to run 👇_`,
                    footer: 'Maureonix | By Infinite Vybeflix',
                    buttons: [
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'alive — Bot alive check', id: prefix + 'alive' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'bot — Bot status', id: prefix + 'bot' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'ping — Response time', id: prefix + 'ping' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'speed — Speed test', id: prefix + 'speed' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'runtime — Uptime', id: prefix + 'runtime' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'info — Bot info', id: prefix + 'info' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'owner — Owner info', id: prefix + 'owner' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'github — Source code', id: prefix + 'github' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'groupinfo — Group info', id: prefix + 'groupinfo' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'staff — Admins list', id: prefix + 'staff' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'vv — View once reveal', id: prefix + 'vv' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'jid — JID info', id: prefix + 'jid' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'block — Number block', id: prefix + 'block' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'allblock — All chats block', id: prefix + 'allblock' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'listblock — Block list', id: prefix + 'listblock' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'allunblock — All unblock', id: prefix + 'allunblock' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'unblock — Unblock number', id: prefix + 'unblock' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'joke — Random joke', id: prefix + 'joke' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'quote — Quote', id: prefix + 'quote' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'fact — Fun fact', id: prefix + 'fact' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔙 Back to Menu', id: prefix + 'menu' }) }
                    ],
                    mentions: [m.sender],
                }, { quoted: m });
            }
            break
            case 'groupmenu': {
                await nimesha.sendListMsg(m.chat, {
                    text: `*👥 GROUP Commands*\n━━━━━━━━━━━━━━━━━━━━━━\n_Tap a command to run 👇_`,
                    footer: 'Maureonix | By Infinite Vybeflix',
                    buttons: [
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'tagall — Tag everyone', id: prefix + 'tagall' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'hidetag — Hidden tag', id: prefix + 'hidetag' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'totag — Forward + tag', id: prefix + 'totag' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'add — Member add', id: prefix + 'add' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'kick — Member kick', id: prefix + 'kick' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'promote — Admin promote', id: prefix + 'promote' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'demote — Admin demote', id: prefix + 'demote' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'warn — Warn member', id: prefix + 'warn' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'setname — Group name', id: prefix + 'setname' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'setdesc — Group desc', id: prefix + 'setdesc' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'linkgrup — Group link', id: prefix + 'linkgrup' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'revoke — New link', id: prefix + 'revoke' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'welcome — Welcome on/off', id: prefix + 'welcome' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'goodbye — Goodbye on/off', id: prefix + 'goodbye' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'setwelcome — Custom welcome', id: prefix + 'setwelcome' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'setleave — Custom goodbye', id: prefix + 'setleave' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'privacy — Privacy Manager', id: prefix + 'privacy' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔙 Back to Menu', id: prefix + 'menu' }) }
                    ],
                    mentions: [m.sender],
                }, { quoted: m });
            }
            break
            case 'searchmenu': {
                await nimesha.sendListMsg(m.chat, {
                    text: `*🔍 SEARCH Commands*\n━━━━━━━━━━━━━━━━━━━━━━\n_Tap a command to run 👇_`,
                    footer: 'Maureonix | By Infinite Vybeflix',
                    buttons: [
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'ytsearch — YouTube search', id: prefix + 'ytsearch' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'google — Google search', id: prefix + 'google' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'define — Dictionary', id: prefix + 'define' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'weather — Weather info', id: prefix + 'weather' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'news — Latest news', id: prefix + 'news' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'lyrics — Song lyrics', id: prefix + 'lyrics' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'fact — Fun fact', id: prefix + 'fact' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'cinfo — Country info', id: prefix + 'cinfo' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔙 Back to Menu', id: prefix + 'menu' }) }
                    ],
                    mentions: [m.sender],
                }, { quoted: m });
            }
            break
            case 'downloadmenu': {
                await nimesha.sendListMsg(m.chat, {
                    text: `*⬇️ DOWNLOAD Commands*\n━━━━━━━━━━━━━━━━━━━━━━\n_Tap a command to run 👇_`,
                    footer: 'Maureonix | By Infinite Vybeflix',
                    buttons: [
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'song — YouTube audio', id: prefix + 'song' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'mp3 — MP3 download', id: prefix + 'mp3' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'play — Play music', id: prefix + 'play' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'ytmp3 — YT to MP3', id: prefix + 'ytmp3' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'video — YouTube video', id: prefix + 'video' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'mp4 — MP4 download', id: prefix + 'mp4' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'ytmp4 — YT to MP4', id: prefix + 'ytmp4' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔙 Back to Menu', id: prefix + 'menu' }) }
                    ],
                    mentions: [m.sender],
                }, { quoted: m });
            }
            break
            case 'quotesmenu': {
                await nimesha.sendListMsg(m.chat, {
                    text: `*😂 FUN & QUOTES*\n━━━━━━━━━━━━━━━━━━━━━━\n_Tap a command to run 👇_`,
                    footer: 'Maureonix | By Infinite Vybeflix',
                    buttons: [
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'joke — Random joke', id: prefix + 'joke' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'quote — Quote', id: prefix + 'quote' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'fact — Fun fact', id: prefix + 'fact' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '8ball — Magic 8ball', id: prefix + '8ball' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'compliment — Compliment', id: prefix + 'compliment' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'insult — Insult', id: prefix + 'insult' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'ship — Ship meter', id: prefix + 'ship' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'hack — Fake hack', id: prefix + 'hack' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'flirt — Flirt line', id: prefix + 'flirt' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'shayari — Shayari', id: prefix + 'shayari' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'wasted — Wasted effect', id: prefix + 'wasted' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'jail — Jail effect', id: prefix + 'jail' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'triggered — Triggered effect', id: prefix + 'triggered' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'simp — Simp meter', id: prefix + 'simp' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'character — Character analysis', id: prefix + 'character' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔙 Back to Menu', id: prefix + 'menu' }) }
                    ],
                    mentions: [m.sender],
                }, { quoted: m });
            }
            break
            case 'toolsmenu': {
                const _msg_toolsmenu = await m.reply('⏳ *Loading...*');
                await nimesha.sendMessage(m.chat, { text: `
╭──❍「 *TOOLS* 」❍
│${setv} ${prefix}get (Fetch data) 🔸️
│${setv} ${prefix}hd (Enhance image)
│${setv} ${prefix}toaudio (Convert to audio)
│${setv} ${prefix}tomp3 (Convert to MP3)
│${setv} ${prefix}tovn (Convert to voice note)
│${setv} ${prefix}toimage (Convert to image)
│${setv} ${prefix}toptv (Convert to PTV)
│${setv} ${prefix}tourl (Upload to URL)
│${setv} ${prefix}tts (Text to speech)
│${setv} ${prefix}toqr (Generate QR)
│${setv} ${prefix}brat (Brat sticker)
│${setv} ${prefix}bratvid (Video brat sticker)
│${setv} ${prefix}ssweb (Web screenshot) 🔸️
│${setv} ${prefix}sticker (Make sticker)
│${setv} ${prefix}attp (Animated sticker)
│${setv} ${prefix}colong (Take sticker)
│${setv} ${prefix}smeme (Make meme)
│${setv} ${prefix}dehaze (Enhance)
│${setv} ${prefix}colorize (Colorize)
│${setv} ${prefix}hitamkan (Black & white)
│${setv} ${prefix}emojimix (Mix emojis)
│${setv} ${prefix}hack (Fake hack)
│${setv} ${prefix}nulis (Write)
│${setv} ${prefix}readmore (Read more)
│${setv} ${prefix}qc (Fake chat)
│${setv} ${prefix}translate (Translate)
│${setv} ${prefix}wasted (Wasted effect)
│${setv} ${prefix}triggered (Triggered effect)
│${setv} ${prefix}shorturl (Shorten URL)
│${setv} ${prefix}gitclone (GitHub clone)
│${setv} ${prefix}fat (Audio effect)
│${setv} ${prefix}fast (Audio effect)
│${setv} ${prefix}bass (Audio effect)
│${setv} ${prefix}slow (Audio effect)
│${setv} ${prefix}tupai (Audio effect)
│${setv} ${prefix}deep (Audio effect)
│${setv} ${prefix}robot (Audio effect)
│${setv} ${prefix}blown (Audio effect)
│${setv} ${prefix}reverse (Audio effect)
│${setv} ${prefix}smooth (Audio effect)
│${setv} ${prefix}earrape (Audio effect)
│${setv} ${prefix}nightcore (Audio effect)
│${setv} ${prefix}getexif (Get sticker EXIF)
│${setv} ${prefix}blur (Blur image)
│${setv} ${prefix}removebg (Remove background)
│${setv} ${prefix}rmbg (Remove background)
│${setv} ${prefix}simage (Sticker → image)
│${setv} ${prefix}toimg (Sticker → image)
│${setv} ${prefix}tts (Text → speech)
│${setv} ${prefix}trt (Translate)
╰──────❍`, edit: _msg_toolsmenu.key });
            }
            break
            case 'aimenu': {
                await nimesha.sendListMsg(m.chat, {
                    text: `*🤖 AI Commands*\n━━━━━━━━━━━━━━━━━━━━━━\n_Tap a command to run 👇_`,
                    footer: 'Maureonix | By Infinite Vybeflix',
                    buttons: [
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'gpt — GPT AI chat', id: prefix + 'gpt' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'gemini — Gemini AI', id: prefix + 'gemini' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'llama3 — Llama3 AI', id: prefix + 'llama3' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'ai — AI assistant', id: prefix + 'ai' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'chatai — Chat AI', id: prefix + 'chatai' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'imagine — AI image gen', id: prefix + 'imagine' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'flux — Flux image', id: prefix + 'flux' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'sora — Sora image', id: prefix + 'sora' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔙 Back to Menu', id: prefix + 'menu' }) }
                    ],
                    mentions: [m.sender],
                }, { quoted: m });
            }
            break
            case 'randommenu': {
                const _msg_randommenu = await m.reply('⏳ *Loading...*');
                await nimesha.sendMessage(m.chat, { text: `
╭──❍「 *RANDOM* 」❍
│${setv} ${prefix}coffe (Coffee images)
╰──────❍`, edit: _msg_randommenu.key });
            }
            break
            case 'stalkermenu': {
                const _msg_stalkermenu = await m.reply('⏳ *Loading...*');
                await nimesha.sendMessage(m.chat, { text: `
╭──❍「 *STALKER* 」❍
│${setv} ${prefix}wastalk (WhatsApp info)
│${setv} ${prefix}githubstalk (GitHub info)
╰──────❍`, edit: _msg_stalkermenu.key });
            }
            break
            case 'animemenu': {
                const _msg_animemenu = await m.reply('⏳ *Loading...*');
                await nimesha.sendMessage(m.chat, { text: `
╭──❍「 *ANIME* 」❍
│${setv} ${prefix}waifu (Anime images)
│${setv} ${prefix}neko (Neko images)
│${setv} ${prefix}loli (Loli anime images)
│${setv} ${prefix}hug (Hug GIF)
│${setv} ${prefix}kiss (Kiss GIF)
│${setv} ${prefix}pat (Pat GIF)
│${setv} ${prefix}poke (Poke GIF)
│${setv} ${prefix}cry (Cry GIF)
│${setv} ${prefix}wink (Wink GIF)
│${setv} ${prefix}nom (Eat GIF)
│${setv} ${prefix}facepalm (Facepalm GIF)
│${setv} ${prefix}punch (Punch GIF)
│${setv} ${prefix}slap (Slap GIF)
│${setv} ${prefix}dance (Dance GIF)
╰──────❍`, edit: _msg_animemenu.key });
            }
            break
            case 'stickersmenu': {
                await nimesha.sendListMsg(m.chat, {
                    text: `*🎨 STICKER & IMAGE*\n━━━━━━━━━━━━━━━━━━━━━━\n_Tap a command to run 👇_`,
                    footer: 'Maureonix | By Infinite Vybeflix',
                    buttons: [
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'sticker — Make sticker', id: prefix + 'sticker' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 's — Quick sticker', id: prefix + 's' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'simage — Sticker to image', id: prefix + 'simage' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'attp — Animated text sticker', id: prefix + 'attp' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'removebg — Remove background', id: prefix + 'removebg' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'blur — Blur image', id: prefix + 'blur' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'ss — Screenshot URL', id: prefix + 'ss' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'tts — Text to speech', id: prefix + 'tts' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'trt — Translate', id: prefix + 'trt' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔙 Back to Menu', id: prefix + 'menu' }) }
                    ],
                    mentions: [m.sender],
                }, { quoted: m });
            }
            break
            case 'gamemenu': {
                await nimesha.sendListMsg(m.chat, {
                    text: `*🎮 GAMES*\n━━━━━━━━━━━━━━━━━━━━━━\n_Tap a command to run 👇_`,
                    footer: 'Maureonix | By Infinite Vybeflix',
                    buttons: [
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'tictactoe — Tic Tac Toe', id: prefix + 'tictactoe' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'suit — Rock Paper Scissors', id: prefix + 'suit' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'akinator — Akinator', id: prefix + 'akinator' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'slot — Slot machine', id: prefix + 'slot' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'math — Math quiz', id: prefix + 'math' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'blackjack — Blackjack', id: prefix + 'blackjack' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'chess — Chess', id: prefix + 'chess' }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔙 Back to Menu', id: prefix + 'menu' }) }
                    ],
                    mentions: [m.sender],
                }, { quoted: m });
            }
            break
            case 'funmenu': {
                const _msg_funmenu = await m.reply('⏳ *Loading...*');
                await nimesha.sendMessage(m.chat, { text: `
╭──❍「 *FUN* 」❍
│${setv} ${prefix}coba (Try)
│${setv} ${prefix}dadu (Dice)
│${setv} ${prefix}bisakah (Can I?)
│${setv} ${prefix}apakah (Is it?)
│${setv} ${prefix}kapan (When?)
│${setv} ${prefix}siapa (Who?)
│${setv} ${prefix}kerangajaib (Magic shell)
│${setv} ${prefix}cekmati (Death joke)
│${setv} ${prefix}ceksifat (Check character)
│${setv} ${prefix}cekkhodam (Check khodam)
│${setv} ${prefix}rate (Rate)
│${setv} ${prefix}jodohku (Soulmate)
│${setv} ${prefix}jadian (Relationship)
│${setv} ${prefix}fitnah (Fake message)
│${setv} ${prefix}halah (Text effect)
│${setv} ${prefix}hilih (Text effect)
│${setv} ${prefix}huluh (Text effect)
│${setv} ${prefix}heleh (Text effect)
│${setv} ${prefix}holoh (Text effect)
├──── *New Fun Commands* ────
│${setv} ${prefix}joke (Joke)
│${setv} ${prefix}quote (Life quote)
│${setv} ${prefix}fact (Interesting fact)
│${setv} ${prefix}8ball (Fortune)
│${setv} ${prefix}compliment (Compliment)
│${setv} ${prefix}insult (Humorous insult)
│${setv} ${prefix}flirt (Flirt line)
│${setv} ${prefix}hack (Fake hack)
│${setv} ${prefix}shayari (Shayari)
│${setv} ${prefix}goodnight (Good night)
│${setv} ${prefix}roseday (Rose day)
│${setv} ${prefix}ship (Match meter)
│${setv} ${prefix}simp (Simp meter)
│${setv} ${prefix}character (Character analysis)
│${setv} ${prefix}wasted (Wasted effect)
│${setv} ${prefix}triggered (Triggered effect)
│${setv} ${prefix}stupid (Funny message)
│${setv} ${prefix}oogway (Oogway quote)
│${setv} ${prefix}tweet (Tweet image)
│${setv} ${prefix}ytcomment (YouTube comment image)
│${setv} ${prefix}jail (Jail effect)
│${setv} ${prefix}namecard (Name card)
│${setv} ${prefix}heart (Heart effect)
│${setv} ${prefix}circle (Circle effect)
│${setv} ${prefix}lgbt (LGBT effect)
╰──────❍`, edit: _msg_funmenu.key });
            }
            break
            case 'textmakermenu': {
                const _msg_textmakermenu = await m.reply('⏳ *Loading...*');
                await nimesha.sendMessage(m.chat, { text: `
╭──❍「 *TEXT MAKER* 」❍
│${setv} ${prefix}metallic (Metallic style)
│${setv} ${prefix}ice (Ice style)
│${setv} ${prefix}snow (Snow style)
│${setv} ${prefix}impressive (Impressive style)
│${setv} ${prefix}matrix (Matrix style)
│${setv} ${prefix}light (Light style)
│${setv} ${prefix}neon (Neon style)
│${setv} ${prefix}devil (Devil style)
│${setv} ${prefix}purple (Purple style)
│${setv} ${prefix}thunder (Thunder style)
│${setv} ${prefix}leaves (Leaves style)
│${setv} ${prefix}1917 (1917 style)
│${setv} ${prefix}arena (Arena style)
│${setv} ${prefix}hacker (Hacker style)
│${setv} ${prefix}sand (Sand style)
│${setv} ${prefix}blackpink (BlackPink style)
│${setv} ${prefix}glitch (Glitch style)
│${setv} ${prefix}fire (Fire style)
╰──────❍`, edit: _msg_textmakermenu.key });
            }
            break
            case 'ownermenu': {
                const _msg_ownermenu = await m.reply('⏳ *Loading...*');
                await nimesha.sendMessage(m.chat, { text: `
╭──❍「 *OWNER* 」❍
│${setv} ${prefix}bot [set] (Bot settings)
│${setv} ${prefix}setbio (Set bio)
│${setv} ${prefix}setppbot (Set bot picture)
│${setv} ${prefix}join (Join group)
│${setv} ${prefix}leave (Leave group)
│${setv} ${prefix}block (Block)
│${setv} ${prefix}listblock (List blocked)
│${setv} ${prefix}openblock (Unblock)
│${setv} ${prefix}listpc (Private chats list)
│${setv} ${prefix}listgc (Groups list)
│${setv} ${prefix}ban (Ban user)
│${setv} ${prefix}unban (Unban user)
│${setv} ${prefix}mute (Mute)
│${setv} ${prefix}unmute (Unmute)
│${setv} ${prefix}creategc (Create group)
│${setv} ${prefix}clearchat (Clear chat)
│${setv} ${prefix}addprem (Add premium)
│${setv} ${prefix}delprem (Remove premium)
│${setv} ${prefix}listprem (List premium)
│${setv} ${prefix}addlimit (Add limit)
│${setv} ${prefix}adduang (Add money)
│${setv} ${prefix}setbotauthor (Set bot author)
│${setv} ${prefix}setbotname (Set bot name)
│${setv} ${prefix}setbotpackname (Set pack name)
│${setv} ${prefix}setapikey (Set API key)
│${setv} ${prefix}addowner (Add owner)
│${setv} ${prefix}delowner (Remove owner)
│${setv} ${prefix}getmsgstore (Get message store)
│${setv} ${prefix}bot --settings (Bot settings)
│${setv} ${prefix}bot settings (Bot settings)
│${setv} ${prefix}bot antidelete on/off (Anti delete)
│${setv} ${prefix}bot autostatus on/off (Auto view status)
│${setv} ${prefix}getsession (Get session)
│${setv} ${prefix}delsession (Delete session)
│${setv} ${prefix}delsampah (Delete garbage)
│${setv} ${prefix}upsw (Upload status)
│${setv} ${prefix}backup (Backup data)
│${setv} ${prefix}aion (Auto reply on)
│${setv} ${prefix}aioff (Auto reply off)
│${setv} $ (Execute code)
│${setv} > (Execute code)
│${setv} < (Execute code)
╰──────❍`, edit: _msg_ownermenu.key });
            }
            break

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