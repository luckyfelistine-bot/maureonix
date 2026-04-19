// nima_commands.js – ALL COMMAND CASES
// ═══════════════════════════════════════════════════════════════════════════

module.exports = async (nimesha, m, ctx) => {
    const {
        isCmd, command, args, text, q, prefix, isCreator, isOwner, ownerNumber,
        set, sewa, premium, db, store, botNumber,
        suit, chess, chat_ai, gemini_autoreply, gemini_history, menfes,
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
        ytMp4, ytMp3, tiktokDownload, igDownload, fbDownload, spotifyDownload, pinterestDownload, redditDownload, mediafireDownload, apkDownload,
        toAudio, toPTT, toVideo, generateMenuImage,
        runtime, clockString, sleep, isUrl, formatDate, generateProfilePicture,
        pickRandom, similarity, almost, cases
    } = ctx;

    // Only process if it's a command or fileSha256 media
    if (!isCmd && !fileSha256) return;

    switch (fileSha256 || command) {
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

        // ===== AUTOMATION TOGGLE COMMANDS (Owner only) =====
        case 'autoviewstatus': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix}autoviewstatus on/off\nCurrent: ${set.autostatus ? 'ON' : 'OFF'}`);
            set.autostatus = status;
            m.reply(`✅ Auto-view status ${status ? 'enabled' : 'disabled'}.`);
        }
        break
        case 'autolikestatus': case 'autoreactstatus': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix + command} on/off\nCurrent: ${set.autostatusreact ? 'ON' : 'OFF'}`);
            set.autostatusreact = status;
            m.reply(`✅ Auto-react status ${status ? 'enabled' : 'disabled'}.`);
        }
        break
        case 'autoreactmention': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix}autoreactmention on/off\nCurrent: ${set.autoreactmention ? 'ON' : 'OFF'}`);
            set.autoreactmention = status;
            m.reply(`✅ Auto-react to mentions ${status ? 'enabled' : 'disabled'}.`);
        }
        break
        case 'autoreplymention': {
            if (!isCreator) return m.reply(mess.owner);
            if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}autoreplymention <message> (use {user} for mention) or off\nCurrent: ${set.autoreplymention || 'OFF'}`);
            if (args[0]?.toLowerCase() === 'off') {
                set.autoreplymention = '';
                m.reply('✅ Auto-reply to mentions disabled.');
            } else {
                set.autoreplymention = text;
                m.reply(`✅ Auto-reply set to:\n${text}`);
            }
        }
        break
        case 'autoread': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix}autoread on/off\nCurrent: ${set.autoread ? 'ON' : 'OFF'}`);
            set.autoread = status;
            m.reply(`✅ Auto-read messages ${status ? 'enabled' : 'disabled'}.`);
        }
        break
        case 'autotyping': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix}autotyping on/off\nCurrent: ${set.autotyping ? 'ON' : 'OFF'}`);
            set.autotyping = status;
            m.reply(`✅ Auto-typing ${status ? 'enabled' : 'disabled'}.`);
        }
        break
        case 'autorecording': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix}autorecording on/off\nCurrent: ${set.autorecording ? 'ON' : 'OFF'}`);
            set.autorecording = status;
            m.reply(`✅ Auto-recording ${status ? 'enabled' : 'disabled'}.`);
        }
        break
        case 'autobio': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix}autobio on/off\nCurrent: ${set.autobio ? 'ON' : 'OFF'}`);
            set.autobio = status;
            if (status) set.status = 0; // force update
            m.reply(`✅ Auto-bio ${status ? 'enabled' : 'disabled'}.`);
        }
        break
        case 'autobackup': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix}autobackup on/off\nCurrent: ${set.autobackup ? 'ON' : 'OFF'}`);
            set.autobackup = status;
            m.reply(`✅ Auto-backup ${status ? 'enabled' : 'disabled'}.`);
        }
        break
        case 'autojoin': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix}autojoin on/off\nCurrent: ${set.autojoin ? 'ON' : 'OFF'}`);
            set.autojoin = status;
            m.reply(`✅ Auto-join groups (when invited) ${status ? 'enabled' : 'disabled'}.`);
        }
        break
        case 'automation': case 'autosettings': {
            if (!isCreator) return m.reply(mess.owner);
            let txt = `⚙️ *Automation Settings*\n\n`;
            txt += `🔹 autoviewstatus : ${set.autostatus ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autoreactstatus: ${set.autostatusreact ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autoreactmention: ${set.autoreactmention ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autoreplymention: ${set.autoreplymention ? '✏️ ' + set.autoreplymention : '❌ OFF'}\n`;
            txt += `🔹 autoread       : ${set.autoread ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autotyping     : ${set.autotyping ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autorecording  : ${set.autorecording ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autobio        : ${set.autobio ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autobackup     : ${set.autobackup ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autojoin       : ${set.autojoin ? '✅ ON' : '❌ OFF'}\n`;
            txt += `\n_Use ${prefix}autoviewstatus on/off, etc._`;
            m.reply(txt);
        }
        break

        // ===== PRIVACY MANAGER (Owner only) =====
        case 'privacy': {
            if (!isCreator) return m.reply(mess.owner);

            const privacyMenu = `🤍⃝ *PRIVACY MANAGER*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 *Reply with a number:*

🧩 *Last Seen:*
*1* — Everyone
*2* — My Contacts
*3* — Nobody

🧩 *Online Status:*
*4* — Everyone
*5* — Match Last Seen

🧩 *Profile Picture:*
*6* — Everyone
*7* — My Contacts
*8* — Nobody

🧩 *Status Updates:*
*9* — Everyone
*10* — My Contacts
*11* — Nobody

🧩 *Read Receipts:*
*12* — Enable
*13* — Disable

🧩 *Groups Add:*
*14* — Everyone
*15* — My Contacts
*16* — Admins Only

⏳ *Disappearing Messages:*
*17* — Off
*18* — 24 Hours
*19* — 7 Days
*20* — 90 Days

🚫 *Privacy Tools:*
*21* — View Block List

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

            if (!text) {
                return await m.reply(privacyMenu);
            }

            const choice = parseInt(text.trim());
            if (isNaN(choice) || choice < 1 || choice > 21) {
                return m.reply('⚠️ Please reply with a number between 1 and 21!');
            }

            try {
                let resultMsg = '';
                switch(choice) {
                    case 1: await nimesha.updateLastSeenPrivacy('all'); resultMsg = '✅ Last Seen → Everyone'; break;
                    case 2: await nimesha.updateLastSeenPrivacy('contacts'); resultMsg = '✅ Last Seen → My Contacts'; break;
                    case 3: await nimesha.updateLastSeenPrivacy('none'); resultMsg = '✅ Last Seen → Nobody'; break;
                    case 4: await nimesha.updateOnlinePrivacy('all'); resultMsg = '✅ Online Status → Everyone'; break;
                    case 5: await nimesha.updateOnlinePrivacy('match_last_seen'); resultMsg = '✅ Online Status → Match Last Seen'; break;
                    case 6: await nimesha.updateProfilePicturePrivacy('all'); resultMsg = '✅ Profile Picture → Everyone'; break;
                    case 7: await nimesha.updateProfilePicturePrivacy('contacts'); resultMsg = '✅ Profile Picture → My Contacts'; break;
                    case 8: await nimesha.updateProfilePicturePrivacy('none'); resultMsg = '✅ Profile Picture → Nobody'; break;
                    case 9: await nimesha.updateStatusPrivacy('all'); resultMsg = '✅ Status → Everyone'; break;
                    case 10: await nimesha.updateStatusPrivacy('contacts'); resultMsg = '✅ Status → My Contacts'; break;
                    case 11: await nimesha.updateStatusPrivacy('none'); resultMsg = '✅ Status → Nobody'; break;
                    case 12: await nimesha.updateReadReceiptsPrivacy('all'); resultMsg = '✅ Read Receipts → Enabled'; break;
                    case 13: await nimesha.updateReadReceiptsPrivacy('none'); resultMsg = '✅ Read Receipts → Disabled'; break;
                    case 14: await nimesha.updateGroupsAddPrivacy('all'); resultMsg = '✅ Groups Add → Everyone'; break;
                    case 15: await nimesha.updateGroupsAddPrivacy('contacts'); resultMsg = '✅ Groups Add → My Contacts'; break;
                    case 16: await nimesha.updateGroupsAddPrivacy('contact_blacklist'); resultMsg = '✅ Groups Add → Admins Only'; break;
                    case 17: await nimesha.updateDefaultDisappearingMode(0); resultMsg = '✅ Disappearing → Off'; break;
                    case 18: await nimesha.updateDefaultDisappearingMode(86400); resultMsg = '✅ Disappearing → 24 Hours'; break;
                    case 19: await nimesha.updateDefaultDisappearingMode(604800); resultMsg = '✅ Disappearing → 7 Days'; break;
                    case 20: await nimesha.updateDefaultDisappearingMode(7776000); resultMsg = '✅ Disappearing → 90 Days'; break;
                    case 21: {
                        const blocklist = await nimesha.fetchBlocklist();
                        if (!blocklist || blocklist.length === 0) {
                            resultMsg = '📋 *Block List*\n\nNo blocked contacts.';
                        } else {
                            const list = blocklist.map((jid, i) => `${i+1}. +${jid.replace('@s.whatsapp.net','')}`).join('\n');
                            resultMsg = `📋 *Block List (${blocklist.length})*\n\n${list}`;
                        }
                        break;
                    }
                }
                await m.reply(`🔐 *Privacy Updated!*\n━━━━━━━━━━━━━━━━━━━━━━\n${resultMsg}`);
            } catch(e) {
                await m.reply(`❌ Error: ${e.message}\n\n_Bot may not have permission._`);
            }
        }
        break

        // ===== VIEW-ONCE REVEALER =====
        case 'vv': case 'ok': case 'wow': {
            const quoted = m.quoted;
            if (!quoted) return m.reply(`⚠️ Reply to a view once message!`);
            try {
                const msg = quoted.message?.viewOnceMessage?.message || quoted.message?.viewOnceMessageV2?.message || quoted.message;
                if (msg?.imageMessage) {
                    const buffer = await nimesha.downloadMediaMessage(quoted);
                    await nimesha.sendMessage(m.chat, { image: buffer, caption: `👁️ *View Once Revealed*\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX` }, { quoted: m });
                } else if (msg?.videoMessage) {
                    const buffer = await nimesha.downloadMediaMessage(quoted);
                    await nimesha.sendMessage(m.chat, { video: buffer, caption: `👁️ *View Once Revealed*\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX` }, { quoted: m });
                } else {
                    m.reply('❌ Not a view‑once message or unsupported type.');
                }
            } catch (e) { m.reply(`❌ Error: ${e.message}`); }
        }
        break

        // ===== IMAGE MENU SHORTCUT =====
        case 'imagemenu': case 'imenu': {
            try {
                const { generateMenuImage } = require('./lib/menuimage');
                const menuImg = await generateMenuImage({
                    prefix,
                    botName: set?.botname || global.botname || 'Maureonix',
                    ownerName: set?.author || global.ownerName || 'Infinite Vybeflix',
                    memberName: m.pushName || 'User',
                    totalCmds: cases.length,
                    time: jam,
                    date: tanggal,
                });
                await nimesha.sendMessage(m.chat, {
                    image: menuImg,
                    caption: `*${set?.botname || 'Maureonix'}* Menu\n👑 _By ${set?.author || 'Infinite Vybeflix'}_`,
                    mentions: [m.sender],
                }, { quoted: m });
            } catch(e) {
                await m.reply('❌ Failed to generate menu image: ' + e.message);
            }
        }
        break

        case 'setppbot': {
            if (!isCreator) return m.reply(mess.owner);
            if (!/image/.test(m.quoted?.type)) return m.reply(`📌 Reply to an image (caption: *${prefix + command}*)`);
            let media = await m.quoted.download();
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
                if (m.quoted?.isMedia) {
                    if (/image|video/.test(m.quoted.mime)) {
                        await nimesha.sendMessage('status@broadcast', {
                            [`${m.quoted.mime.split('/')[0]}`]: await m.quoted.download(),
                            caption: text || m.quoted?.body || ''
                        }, { statusJidList, broadcast: true });
                        m.react('✅');
                    } else if (/audio/.test(m.quoted.mime)) {
                        await nimesha.sendMessage('status@broadcast', {
                            audio: await m.quoted.download(),
                            mimetype: 'audio/mp4',
                            ptt: true
                        }, { backgroundColor, statusJidList, broadcast: true });
                        m.react('✅');
                    } else m.reply('Only video/audio/image/text supported');
                } else if (m.quoted?.text) {
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
            if (!/image/.test(m.quoted?.type)) return m.reply(`📌 Reply to an image (caption: *${prefix + command}*)`);
            let media = await m.quoted.download();
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

        // ===== MOVIE COMMANDS (ENHANCED) =====
        case 'movie': case 'film': case 'cinema': {
            if (!text) return m.reply(`Example: ${prefix + command} <title>`);
            await m.reply('🎬 *Searching...*');
            try {
                const results = await Movie.search(text);
                if (!results || !results.length) return m.reply('No results found.');
                // Store search results for this user to allow number selection
                if (!db.movieSearch) db.movieSearch = {};
                db.movieSearch[m.sender] = { results, timestamp: Date.now() };
                const listMsg = Movie.formatList(results);
                await m.reply(listMsg + `\n\n_Reply with the number (1-${Math.min(results.length,8)}) to see details, or use *.imdb <id>*._`);
            } catch(e) { m.reply(`❌ ${e.message}`); }
        }
        break
        case 'imdb': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <imdb-id>\nOr reply with a number from a previous search.`);
            let id = args[0];
            // Check if it's a number (selection from previous search)
            if (/^\d+$/.test(id) && db.movieSearch && db.movieSearch[m.sender]) {
                const search = db.movieSearch[m.sender];
                // Clear old searches (>5 min)
                if (Date.now() - search.timestamp > 300000) {
                    delete db.movieSearch[m.sender];
                } else {
                    const index = parseInt(id) - 1;
                    if (index >= 0 && index < search.results.length) {
                        id = search.results[index].imdbID;
                    } else {
                        return m.reply('Invalid number. Please use a valid IMDB ID.');
                    }
                }
            }
            try {
                const data = await Movie.getById(id);
                const poster = data.Poster && data.Poster !== 'N/A' ? data.Poster : null;
                const caption = Movie.formatMovie(data);
                if (poster) {
                    await nimesha.sendMessage(m.chat, { image: { url: poster }, caption }, { quoted: m });
                } else {
                    await m.reply(caption);
                }
            } catch(e) { m.reply(`❌ ${e.message}`); }
        }
        break
        case 'series': case 'tvshow': {
            if (!text) return m.reply(`Example: ${prefix + command} <title>`);
            await m.reply('📺 *Searching TV series...*');
            try {
                const results = await Movie.search(text, 'series');
                if (!results || !results.length) return m.reply('No series found.');
                if (!db.movieSearch) db.movieSearch = {};
                db.movieSearch[m.sender] = { results, timestamp: Date.now() };
                const listMsg = Movie.formatList(results);
                await m.reply(listMsg + `\n\n_Reply with the number (1-${Math.min(results.length,8)}) to see details, or use *.imdb <id>*._`);
            } catch(e) { m.reply(`❌ ${e.message}`); }
        }
        break
        case 'rating': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <imdb-id>`);
            const r = await Movie.getRatings(args[0]);
            await m.reply(`⭐ *Ratings*\nIMDB: ${r.imdb}/10\n🍅 Rotten: ${r.rotten}\nⓂ️ Metacritic: ${r.metacritic}/100`);
        }
        break
        case 'episodes': case 'eps': {
            if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <imdb-id> <season-number>`);
            try {
                const s = await OMDB.season(args[0], args[1]);
                let txt = `📂 *${s.Title} — Season ${s.Season}*\n\n`;
                (s.Episodes || []).forEach(e => txt += `E${e.Episode} — ${e.Title} ⭐${e.imdbRating}\n`);
                m.reply(txt);
            } catch (e) { m.reply('❌ ' + e.message); }
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

        // ===== ADDITIONAL FUN COMMANDS =====
        case 'insult': {
            const mentioned = m.mentionedJid?.[0] || m.sender;
            const insults = ['You have the personality of a wet sock! 🧦', 'You bring everyone so much joy... when you leave.', 'I\'d agree with you but then we\'d both be wrong.'];
            const insult = insults[Math.floor(Math.random() * insults.length)];
            await nimesha.sendMessage(m.chat, { text: `😈 *Insult*\n━━━━━━━━━━━━━━━━━━━━━━\n👤 @${mentioned.split('@')[0]}\n\n😤 ${insult}\n━━━━━━━━━━━━━━━━━━━━━━`, mentions: [mentioned] }, { quoted: m });
        }
        break
        case 'flirt': {
            const flirts = ['Are you a magician? Every time I look at you, everyone else disappears ✨', 'Do you have a map? I keep getting lost in your eyes 👀', 'Is your name Google? Because you have everything I\'ve been searching for 🔍'];
            const flirt = flirts[Math.floor(Math.random() * flirts.length)];
            await m.reply(`💕 *Flirt Line*\n━━━━━━━━━━━━━━━━━━━━━━\n${flirt}`);
        }
        break
        case 'hack': {
            const target = m.mentionedJid?.[0] ? `@${m.mentionedJid[0].split('@')[0]}` : (q || 'Target');
            const stages = [
                `💻 *HACKING INITIATED...*\n━━━━━━━━━━━━━━━━━━━━━━\n🎯 Target: ${target}\n⚡ [▓░░░░░░░░░] 10% — Connecting...`,
                `💻 *HACKING IN PROGRESS...*\n━━━━━━━━━━━━━━━━━━━━━━\n🎯 Target: ${target}\n⚡ [▓▓▓▓░░░░░░] 40% — Bypassing firewall...`,
                `💻 *HACKING IN PROGRESS...*\n━━━━━━━━━━━━━━━━━━━━━━\n🎯 Target: ${target}\n⚡ [▓▓▓▓▓▓▓░░░] 70% — Extracting data...`,
                `✅ *HACK COMPLETE!*\n━━━━━━━━━━━━━━━━━━━━━━\n🎯 Target: ${target}\n⚡ [▓▓▓▓▓▓▓▓▓▓] 100%\n📊 Password: 1234567890\n📧 Email: hacked@fake.com\n💰 Balance: $999,999`
            ];
            let hackMsg = await m.reply(stages[0]);
            for (let i = 1; i < stages.length; i++) {
                await new Promise(r => setTimeout(r, 2000));
                await nimesha.sendMessage(m.chat, { text: stages[i], edit: hackMsg.key });
            }
        }
        break
        case 'simp': {
            const mentioned = m.mentionedJid?.[0] || m.sender;
            const simpLevel = Math.floor(Math.random() * 101);
            await nimesha.sendMessage(m.chat, { text: `😍 *Simp Meter*\n━━━━━━━━━━━━━━━━━━━━━━\n👤 @${mentioned.split('@')[0]}\n\n💘 Simp Level: ${simpLevel}%\n${simpLevel > 80 ? '🚨 Ultra Simp!' : simpLevel > 50 ? '😅 Major Simp!' : '😌 Normal person'}`, mentions: [mentioned] }, { quoted: m });
        }
        break
        case 'character': {
            const mentioned = m.mentionedJid?.[0] || m.sender;
            const traits = ['Smart 🧠', 'Funny 😂', 'Kind ❤️', 'Creative 🎨', 'Brave 💪', 'Loyal 🤝', 'Mysterious 🔮', 'Energetic ⚡'];
            const selected = traits.sort(() => 0.5 - Math.random()).slice(0, 3);
            await nimesha.sendMessage(m.chat, { text: `🎭 *Character Analysis*\n━━━━━━━━━━━━━━━━━━━━━━\n👤 @${mentioned.split('@')[0]}\n\n✨ *Personality Traits:*\n${selected.map(t => `• ${t}`).join('\n')}`, mentions: [mentioned] }, { quoted: m });
        }
        break
        case 'shayari': {
            const shayaris = [
                'Mohabbat ek dua hai,\nJo dil se nikalti hai,\nYeh sochke dil bhi muskurata hai,\nKi koi doosra bhi khayalon mein aata hai. 🌹',
                'Zindagi ka safar, ajeeb hai yaro,\nKoi samajh na paya, kya hai raaz yaro.',
                'Pyar ko pyar hi rehne do,\nKoi naam na do.'
            ];
            const shayari = shayaris[Math.floor(Math.random() * shayaris.length)];
            await m.reply(`🌹 *Shayari*\n━━━━━━━━━━━━━━━━━━━━━━\n${shayari}`);
        }
        break
        case 'goodnight': {
            const gns = ['🌙 Good night! Sweet dreams! 💭', '🌛 Sleep well! The stars will watch over you! ⭐', '🌜 May your dreams be magical tonight! ✨'];
            await m.reply(`🌙 *Good Night!*\n━━━━━━━━━━━━━━━━━━━━━━\n${gns[Math.floor(Math.random() * gns.length)]}`);
        }
        break
        case 'roseday': {
            await m.reply(`🌹 *Happy Rose Day!*\n━━━━━━━━━━━━━━━━━━━━━━\n🌹🌹🌹🌹🌹\n\nRoses are red,\nViolets are blue,\nThis bot is amazing,\nAnd so are you! 💕\n\n🌹🌹🌹🌹🌹`);
        }
        break
        case 'stupid': {
            const mentioned = m.mentionedJid?.[0] || m.sender;
            const stupidMsg = args.slice(1).join(' ') || 'You did something very stupid! 🤦';
            await nimesha.sendMessage(m.chat, { text: `🤦 *Stupid Alert!*\n━━━━━━━━━━━━━━━━━━━━━━\n👤 @${mentioned.split('@')[0]}\n\n😤 ${stupidMsg}`, mentions: [mentioned] }, { quoted: m });
        }
        break
        case 'wasted': {
            const mentioned = m.mentionedJid?.[0] || m.sender;
            try {
                const pp = await nimesha.profilePictureUrl(mentioned, 'image').catch(() => null);
                if (pp) {
                    const imgBuffer = await getMiscImage('wasted', { imageUrl: pp });
                    if (imgBuffer) return await nimesha.sendMessage(m.chat, { image: imgBuffer, caption: `💀 *WASTED*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
                }
                await nimesha.sendMessage(m.chat, { text: `💀 *WASTED*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
            } catch (e) { m.reply('❌ Error: ' + e.message); }
        }
        break

        // ===== ANIME REACTION GIFS =====
        case 'neko': case 'waifu': case 'hug': case 'kiss': case 'pat': case 'wink':
        case 'cry': case 'slap': case 'dance': case 'happy': case 'blush': case 'facepalm':
        case 'nom': case 'poke': case 'punch': case 'loli': {
            try {
                const fetch = require('node-fetch');
                const res = await fetch(`https://nekos.best/api/v2/${command}`).catch(() => null);
                const data = await res?.json();
                const gifUrl = data?.results?.[0]?.url;
                if (gifUrl) {
                    await nimesha.sendMessage(m.chat, { video: { url: gifUrl }, gifPlayback: true, caption: `*${command.toUpperCase()}*` }, { quoted: m });
                } else {
                    m.reply(`❌ Could not fetch ${command} GIF.`);
                }
            } catch (e) { m.reply('❌ Error: ' + e.message); }
        }
        break

        // ===== TEXT EFFECTS =====
        case 'metallic': case 'ice': case 'snow': case 'impressive': case 'matrix': case 'light':
        case 'neon': case 'devil': case 'purple': case 'thunder': case 'leaves': case '1917':
        case 'arena': case 'hacker': case 'sand': case 'blackpink': case 'glitch': case 'fire': {
            if (!text) return m.reply(`Example: ${prefix + command} <text>`);
            await m.reply('🎨 *Generating text art...*');
            try {
                const fetch = require('node-fetch');
                const res = await fetch(`https://api.paxsenix.biz.id/text-effect/${command}?text=${encodeURIComponent(text)}`);
                if (!res.ok) throw new Error('API error');
                const buffer = await res.buffer();
                await nimesha.sendMessage(m.chat, { image: buffer, caption: `🎨 *${command.toUpperCase()} Text Art*\n📝 *Text:* ${text}` }, { quoted: m });
            } catch (e) {
                // Fallback to another API
                try {
                    const fetch = require('node-fetch');
                    const res = await fetch(`https://api.lolhuman.xyz/api/teks/${command}?apikey=demo&text=${encodeURIComponent(text)}`);
                    const buffer = await res.buffer();
                    await nimesha.sendMessage(m.chat, { image: buffer, caption: `🎨 *${command.toUpperCase()} Text Art*\n📝 *Text:* ${text}` }, { quoted: m });
                } catch (e2) {
                    m.reply('❌ Failed to generate text art: ' + e.message);
                }
            }
        }
        break

        // ===== MEME OVERLAYS =====
        case 'oogway': {
            if (!text) return m.reply(`Example: ${prefix + command} <quote>`);
            try {
                const fetch = require('node-fetch');
                const res = await fetch(`https://api.paxsenix.biz.id/canvas/oogway?quote=${encodeURIComponent(text)}`);
                const buffer = await res.buffer();
                await nimesha.sendMessage(m.chat, { image: buffer, caption: `🐢 *Oogway says:*\n"${text}"` }, { quoted: m });
            } catch (e) {
                await m.reply(`🐢 *Oogway says:*\n"${text}"`);
            }
        }
        break
        case 'tweet': {
            if (!text) return m.reply(`Example: ${prefix + command} <tweet text>`);
            const username = m.pushName || 'User';
            try {
                const fetch = require('node-fetch');
                const res = await fetch(`https://api.paxsenix.biz.id/tools/tweet?username=${encodeURIComponent(username)}&tweet=${encodeURIComponent(text)}`);
                const buffer = await res.buffer();
                await nimesha.sendMessage(m.chat, { image: buffer, caption: `🐦 *Tweet*\n@${username}: ${text}` }, { quoted: m });
            } catch (e) {
                await m.reply(`🐦 *@${username}:* ${text}`);
            }
        }
        break
        case 'ytcomment': {
            if (!text) return m.reply(`Example: ${prefix + command} <comment>`);
            const username = m.pushName || 'User';
            try {
                const fetch = require('node-fetch');
                const res = await fetch(`https://api.paxsenix.biz.id/tools/ytcomment?username=${encodeURIComponent(username)}&comment=${encodeURIComponent(text)}`);
                const buffer = await res.buffer();
                await nimesha.sendMessage(m.chat, { image: buffer, caption: `💬 *YouTube Comment*\n${username}: ${text}` }, { quoted: m });
            } catch (e) {
                await m.reply(`💬 *YouTube Comment*\n👤 ${username}: ${text}`);
            }
        }
        break
        case 'jail': {
            const mentioned = m.mentionedJid?.[0] || m.sender;
            try {
                const pp = await nimesha.profilePictureUrl(mentioned, 'image').catch(() => null);
                if (pp) {
                    const fetch = require('node-fetch');
                    const res = await fetch(`https://api.paxsenix.biz.id/overlay/jail?image=${encodeURIComponent(pp)}`);
                    const buffer = await res.buffer();
                    return await nimesha.sendMessage(m.chat, { image: buffer, caption: `🚔 *JAILED!*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
                }
                await nimesha.sendMessage(m.chat, { text: `🚔 *@${mentioned.split('@')[0]} is now in JAIL!*`, mentions: [mentioned] }, { quoted: m });
            } catch (e) { m.reply('❌ Error: ' + e.message); }
        }
        break
        case 'triggered': {
            const mentioned = m.mentionedJid?.[0] || m.sender;
            try {
                const pp = await nimesha.profilePictureUrl(mentioned, 'image').catch(() => null);
                if (pp) {
                    const fetch = require('node-fetch');
                    const res = await fetch(`https://api.paxsenix.biz.id/overlay/triggered?image=${encodeURIComponent(pp)}`);
                    const buffer = await res.buffer();
                    return await nimesha.sendMessage(m.chat, { video: buffer, gifPlayback: true, caption: `😤 *TRIGGERED!*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
                }
                await nimesha.sendMessage(m.chat, { text: `😤 *@${mentioned.split('@')[0]} is TRIGGERED!*`, mentions: [mentioned] }, { quoted: m });
            } catch (e) { m.reply('❌ Error: ' + e.message); }
        }
        break
        case 'namecard': {
            const name = m.pushName || text || 'User';
            try {
                const fetch = require('node-fetch');
                const res = await fetch(`https://api.paxsenix.biz.id/tools/namecard?name=${encodeURIComponent(name)}&subtitle=${encodeURIComponent('WhatsApp: ' + m.sender.split('@')[0])}`);
                const buffer = await res.buffer();
                await nimesha.sendMessage(m.chat, { image: buffer, caption: `🪪 *Name Card*\n👤 ${name}` }, { quoted: m });
            } catch (e) {
                await m.reply(`🪪 *Name Card*\n👤 *Name:* ${name}\n📱 *Number:* +${m.sender.split('@')[0]}`);
            }
        }
        break
        case 'heart': case 'circle': case 'lgbt': case 'horny': case 'lolice': case 'gay': case 'glass': case 'passed': {
            const mentioned = m.mentionedJid?.[0] || m.sender;
            const emojiMap = { heart: '❤️', circle: '🕊️', lgbt: '🏳️‍🌈', horny: '😏', lolice: '👮', gay: '🌈', glass: '👓', passed: '✅' };
            try {
                const pp = await nimesha.profilePictureUrl(mentioned, 'image').catch(() => null);
                if (pp) {
                    const fetch = require('node-fetch');
                    const res = await fetch(`https://api.paxsenix.biz.id/overlay/${command}?image=${encodeURIComponent(pp)}`);
                    const buffer = await res.buffer();
                    return await nimesha.sendMessage(m.chat, { image: buffer, caption: `${emojiMap[command]} *${command.toUpperCase()}*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
                }
                await nimesha.sendMessage(m.chat, { text: `${emojiMap[command]} *${command.toUpperCase()}*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
            } catch (e) { m.reply('❌ Error: ' + e.message); }
        }
        break
        case 'its-so-stupid': case 'comrade': {
            const mentioned = m.mentionedJid?.[0] || m.sender;
            try {
                const pp = await nimesha.profilePictureUrl(mentioned, 'image').catch(() => null);
                if (pp) {
                    const fetch = require('node-fetch');
                    const res = await fetch(`https://api.paxsenix.biz.id/meme/${command}?image=${encodeURIComponent(pp)}`);
                    const buffer = await res.buffer();
                    return await nimesha.sendMessage(m.chat, { image: buffer, caption: `😆 *${command.toUpperCase()}*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
                }
                await nimesha.sendMessage(m.chat, { text: `😆 *${command.toUpperCase()}*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
            } catch (e) { m.reply('❌ Error: ' + e.message); }
        }
        break

        // Helper function for meme overlays
        async function getMiscImage(type, params = {}) {
            const fetch = require('node-fetch');
            const base = 'https://api.paxsenix.biz.id';
            const endpoints = {
                wasted: `${base}/overlay/wasted?image=${params.imageUrl || ''}`,
                jail: `${base}/overlay/jail?image=${params.imageUrl || ''}`,
                triggered: `${base}/overlay/triggered?image=${params.imageUrl || ''}`,
            };
            if (!endpoints[type]) return null;
            const res = await fetch(endpoints[type]);
            if (!res.ok) return null;
            return await res.buffer();
        }

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
            const res = slotMachine();
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
            if ((!isCmd || isCreator) && budy && typeof budy === 'string' && budy.toLowerCase() !== undefined) {
                if (m.chat.endsWith('broadcast')) return;
                // Guard: ensure db and db.database exist
                if (!global.db || !global.db.database) return;
                if (!(budy.toLowerCase() in global.db.database)) return;
                await nimesha.relayMessage(m.chat, global.db.database[budy.toLowerCase()], {});
            }