// commands/owner.js – Owner & privacy controls (enhanced with owner mirror)
const fs = require('fs');
const path = require('path');
const { generateProfilePicture, sleep } = require('../lib/function');
const { sendEmail } = require('../lib/emailService');

module.exports = {
    block: async (maureonix, m, { isCreator, mess, text }) => {
        if (!isCreator) return m.reply(mess.owner);
        let _blockJid = null;
        if (m.quoted?.sender) _blockJid = m.quoted.sender;
        else if (m.mentionedJid?.[0]) _blockJid = m.mentionedJid[0];
        else if (text) _blockJid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        else if (!m.isGroup) _blockJid = m.chat;
        if (_blockJid) {
            await maureonix.updateBlockStatus(_blockJid, 'block');
            m.reply(`✅ Blocked ${_blockJid.replace('@s.whatsapp.net', '')}`);
        } else m.reply('Reply, tag, or provide a number.');
    },
    unblock: async (maureonix, m, { isCreator, mess, text }) => {
        if (!isCreator) return m.reply(mess.owner);
        let _unblockJid = null;
        if (m.quoted?.sender) _unblockJid = m.quoted.sender;
        else if (m.mentionedJid?.[0]) _unblockJid = m.mentionedJid[0];
        else if (text) _unblockJid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        else if (!m.isGroup) _unblockJid = m.chat;
        if (_unblockJid) {
            await maureonix.updateBlockStatus(_unblockJid, 'unblock');
            m.reply(`✅ Unblocked ${_unblockJid.replace('@s.whatsapp.net', '')}`);
        } else m.reply('Reply, tag, or provide a number.');
    },
    join: async (maureonix, m, { isCreator, mess, args }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!args[0]) return m.reply('Enter the group link!');
        const result = args[0].match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
        if (!result) return m.reply('Invalid link❗');
        await maureonix.groupAcceptInvite(result[1]);
        m.reply('Joined!');
    },
    leave: async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        await maureonix.groupLeave(m.chat);
        m.reply('Left the group.');
    },
    clearchat: async (maureonix, m, { isCreator, mess, store, sleep }) => {
        if (!isCreator) return m.reply(mess.owner);
        await m.reply('⚠️ *Clearing chat...* This may take a while.');
        let deleted = 0;
        const messages = store?.messages?.[m.chat]?.array || [];
        if (messages.length === 0) return m.reply('No messages to delete.');
        for (let i = 0; i < messages.length; i += 20) {
            const batch = messages.slice(i, i + 20);
            await Promise.all(batch.map(async (msg) => {
                try { await maureonix.sendMessage(m.chat, { delete: msg.key }); deleted++; } catch (e) {}
            }));
            await sleep(300);
        }
        await m.reply(`✅ *Deleted ${deleted} messages* from this chat.`);
    },
    backup: async (maureonix, m, { isCreator, mess, args, tempatDB }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (args[0] === 'database') {
            let tglnya = new Date().toISOString().replace(/[:.]/g, '-');
            let datanya = './database/' + tempatDB;
            if (tempatDB.startsWith('mongodb')) {
                datanya = './database/backup_database.json';
                fs.writeFileSync(datanya, JSON.stringify(global.db, null, 2), 'utf-8');
            }
            await m.reply({ document: fs.readFileSync(datanya), mimetype: 'application/json', fileName: tglnya + '_database.json' });
        } else m.reply('Use: backup database');
    },
    setppbot: async (maureonix, m, { isCreator, mess, prefix, command, generateProfilePicture }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!/image/.test(m.quoted?.type)) return m.reply(`📌 Reply to an image (caption: *${prefix + command}*)`);
        let media = await m.quoted.download();
        let { img } = await generateProfilePicture(media);
        await maureonix.query({ tag: 'iq', attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'w:profile:picture' }, content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }] });
        m.reply('✅ Profile picture updated');
    },
    delppbot: async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        await maureonix.removeProfilePicture(maureonix.user.id);
        m.reply('✅ Profile picture removed');
    },
    // Auto toggles
    autodownload: async (maureonix, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix}autodownload on/off\nCurrent: ${set.autodownload ? 'ON' : 'OFF'}`);
        set.autodownload = status;
        m.reply(`✅ Auto-download ${status ? 'enabled' : 'disabled'}.`);
    },
    autoviewstatus: async (maureonix, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix}autoviewstatus on/off\nCurrent: ${set.autostatus ? 'ON' : 'OFF'}`);
        set.autostatus = status;
        m.reply(`✅ Auto-view status ${status ? 'enabled' : 'disabled'}.`);
    },
    autolikestatus: async (maureonix, m, { isCreator, mess, args, set, prefix, command }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix + command} on/off\nCurrent: ${set.autostatusreact ? 'ON' : 'OFF'}`);
        set.autostatusreact = status;
        m.reply(`✅ Auto-react to status ${status ? 'enabled' : 'disabled'}.`);
    },
    autoreactmention: async (maureonix, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix}autoreactmention on/off\nCurrent: ${set.autoreactmention ? 'ON' : 'OFF'}`);
        set.autoreactmention = status;
        m.reply(`✅ Auto-react to mentions ${status ? 'enabled' : 'disabled'}.`);
    },
    autoreplymention: async (maureonix, m, { isCreator, mess, text, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}autoreplymention <message> (use {user} for mention) or off\nCurrent: ${set.autoreplymention || 'OFF'}`);
        if (args[0]?.toLowerCase() === 'off') {
            set.autoreplymention = '';
            m.reply('✅ Auto-reply to mentions disabled.');
        } else {
            set.autoreplymention = text;
            m.reply(`✅ Auto-reply set to:\n${text}`);
        }
    },
    autoforward: async (maureonix, m, { isCreator, mess, text, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}autoforward <target JID> or off\nCurrent: ${set.autoforward || 'OFF'}`);
        if (args[0]?.toLowerCase() === 'off') {
            set.autoforward = '';
            m.reply('✅ Auto-forward disabled.');
        } else {
            set.autoforward = text;
            m.reply(`✅ Auto-forward set to ${text}`);
        }
    },
    autosticker: async (maureonix, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix}autosticker on/off\nCurrent: ${set.autosticker ? 'ON' : 'OFF'}`);
        set.autosticker = status;
        m.reply(`✅ Auto-sticker ${status ? 'enabled' : 'disabled'}.`);
    },
    autotranslate: async (maureonix, m, { isCreator, mess, text, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}autotranslate <target language code> or off\nExample: ${prefix}autotranslate si\nCurrent: ${set.autotranslate || 'OFF'}`);
        if (args[0]?.toLowerCase() === 'off') {
            set.autotranslate = '';
            m.reply('✅ Auto-translate disabled.');
        } else {
            set.autotranslate = text;
            m.reply(`✅ Auto-translate set to ${text}`);
        }
    },
    autodelete: async (maureonix, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!args[0] && args[0] !== 'off') return m.reply(`Usage: ${prefix}autodelete <seconds> or off\nExample: ${prefix}autodelete 10\nCurrent: ${set.autodelete || 'OFF'}`);
        if (args[0]?.toLowerCase() === 'off') {
            set.autodelete = 0;
            m.reply('✅ Auto-delete disabled.');
        } else {
            const sec = parseInt(args[0]);
            if (isNaN(sec)) return m.reply('Invalid seconds.');
            set.autodelete = sec;
            m.reply(`✅ Auto-delete set to ${sec} seconds.`);
        }
    },
    autoreact: async (maureonix, m, { isCreator, mess, text, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}autoreact <emoji> or off\nExample: ${prefix}autoreact 👍\nCurrent: ${set.autoreact || 'OFF'}`);
        if (args[0]?.toLowerCase() === 'off') {
            set.autoreact = '';
            m.reply('✅ Auto-react disabled.');
        } else {
            set.autoreact = text;
            m.reply(`✅ Auto-react set to ${text}`);
        }
    },
    autoblock: async (maureonix, m, { isCreator, mess, text, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}autoblock <keyword1,keyword2> or off\nExample: ${prefix}autoblock spam,scam\nCurrent: ${set.autoblock ? set.autoblock.join(', ') : 'OFF'}`);
        if (args[0]?.toLowerCase() === 'off') {
            set.autoblock = [];
            m.reply('✅ Auto-block disabled.');
        } else {
            set.autoblock = text.split(',').map(s => s.trim().toLowerCase());
            m.reply(`✅ Auto-block keywords set: ${set.autoblock.join(', ')}`);
        }
    },
    autokick: async (maureonix, m, { isCreator, mess, text, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}autokick <keyword1,keyword2> or off\nExample: ${prefix}autokick spam,link\nCurrent: ${set.autokick ? set.autokick.join(', ') : 'OFF'}`);
        if (args[0]?.toLowerCase() === 'off') {
            set.autokick = [];
            m.reply('✅ Auto-kick disabled.');
        } else {
            set.autokick = text.split(',').map(s => s.trim().toLowerCase());
            m.reply(`✅ Auto-kick keywords set: ${set.autokick.join(', ')}`);
        }
    },
    automute: async (maureonix, m, { isCreator, mess, text, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}automute <keyword1,keyword2> or off\nExample: ${prefix}automute spam,link\nCurrent: ${set.automute ? set.automute.join(', ') : 'OFF'}`);
        if (args[0]?.toLowerCase() === 'off') {
            set.automute = [];
            m.reply('✅ Auto-mute disabled.');
        } else {
            set.automute = text.split(',').map(s => s.trim().toLowerCase());
            m.reply(`✅ Auto-mute keywords set: ${set.automute.join(', ')}`);
        }
    },
    autowelcome: async (maureonix, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix}autowelcome on/off\nCurrent: ${set.autowelcome ? 'ON' : 'OFF'}`);
        set.autowelcome = status;
        m.reply(`✅ Auto-welcome ${status ? 'enabled' : 'disabled'}.`);
    },
    autogoodbye: async (maureonix, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix}autogoodbye on/off\nCurrent: ${set.autogoodbye ? 'ON' : 'OFF'}`);
        set.autogoodbye = status;
        m.reply(`✅ Auto-goodbye ${status ? 'enabled' : 'disabled'}.`);
    },
    automation: async (maureonix, m, { isCreator, mess, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        let txt = `⚙️ *Automation Settings*\n\n`;
        txt += `🔹 autoviewstatus : ${set.autostatus ? '✅ ON' : '❌ OFF'}\n`;
        txt += `🔹 autolikestatus: ${set.autostatusreact ? '✅ ON' : '❌ OFF'}\n`;
        txt += `🔹 autoreactmention: ${set.autoreactmention ? '✅ ON' : '❌ OFF'}\n`;
        txt += `🔹 autoreplymention: ${set.autoreplymention ? '✏️ ' + set.autoreplymention : '❌ OFF'}\n`;
        txt += `🔹 autoread       : ${set.autoread ? '✅ ON' : '❌ OFF'}\n`;
        txt += `🔹 autotyping     : ${set.autotyping ? '✅ ON' : '❌ OFF'}\n`;
        txt += `🔹 autorecording  : ${set.autorecording ? '✅ ON' : '❌ OFF'}\n`;
        txt += `🔹 autobio        : ${set.autobio ? '✅ ON' : '❌ OFF'}\n`;
        txt += `🔹 autobackup     : ${set.autobackup ? '✅ ON' : '❌ OFF'}\n`;
        txt += `🔹 autojoin       : ${set.autojoin ? '✅ ON' : '❌ OFF'}\n`;
        txt += `🔹 autodownload   : ${set.autodownload ? '✅ ON' : '❌ OFF'}\n`;
        txt += `🔹 autoforward    : ${set.autoforward || '❌ OFF'}\n`;
        txt += `🔹 autosticker    : ${set.autosticker ? '✅ ON' : '❌ OFF'}\n`;
        txt += `🔹 autotranslate  : ${set.autotranslate || '❌ OFF'}\n`;
        txt += `🔹 autodelete     : ${set.autodelete ? set.autodelete + 's' : '❌ OFF'}\n`;
        txt += `🔹 autoreact      : ${set.autoreact || '❌ OFF'}\n`;
        txt += `🔹 autoblock      : ${set.autoblock?.length ? set.autoblock.join(', ') : '❌ OFF'}\n`;
        txt += `🔹 autokick       : ${set.autokick?.length ? set.autokick.join(', ') : '❌ OFF'}\n`;
        txt += `🔹 automute       : ${set.automute?.length ? set.automute.join(', ') : '❌ OFF'}\n`;
        txt += `🔹 autowelcome    : ${set.autowelcome ? '✅ ON' : '❌ OFF'}\n`;
        txt += `🔹 autogoodbye    : ${set.autogoodbye ? '✅ ON' : '❌ OFF'}\n`;
        txt += `🔹 autoai_selfchat : ${set.autoai_selfchat ? '✅ ON' : '❌ OFF'}\n`;
        txt += `🔹 privatemode     : ${(set.privatemode || 'off').toUpperCase()}\n`;
        txt += `🔹 awaymsg         : ${set.awaymsg || 'Default'}\n`;
        txt += `🔹 ownermirror     : ${set.ownerMirror ? '✅ ON' : '❌ OFF'}\n`;
        txt += `\n_Use ${prefix}autoviewstatus on/off, etc._`;
        m.reply(txt);
    },
    public: async (maureonix, m, { isCreator, mess, set }) => {
        if (!isCreator) return m.reply(mess.owner);
        set.public = true;
        m.reply('✅ Bot is now in *PUBLIC* mode. Everyone can use commands.');
    },
    private: async (maureonix, m, { isCreator, mess, set }) => {
        if (!isCreator) return m.reply(mess.owner);
        set.public = false;
        m.reply('🔒 Bot is now in *PRIVATE* mode. Only owner can use commands.');
    },
    publicmode: async (maureonix, m, { isCreator, mess, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = set.public ? 'PUBLIC' : 'PRIVATE';
        m.reply(`⚙️ Current mode: *${status}*\nUse ${prefix}public or ${prefix}private to change.`);
    },
    autoai: async (maureonix, m, { isCreator, mess, args, set, prefix, command }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix + command} on/off\nCurrent: ${set.autoai ? 'ON' : 'OFF'}`);
        set.autoai = status;
        m.reply(`✅ Auto-AI ${status ? 'enabled' : 'disabled'}. Now messages without prefix will get AI responses.`);
    },
    autoaiselfchat: async (maureonix, m, { isCreator, mess, args, set, prefix, command }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix + command} on/off\nCurrent: ${set.autoai_selfchat ? 'ON' : 'OFF'}`);
        set.autoai_selfchat = status;
        m.reply(`✅ Self‑chat AI ${status ? 'enabled' : 'disabled'}.`);
    },
    privatemode: async (maureonix, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const mode = args[0]?.toLowerCase();
        if (!['off', 'away', 'ai', 'both'].includes(mode)) return m.reply(`Usage: ${prefix}privatemode <off|away|ai|both>\nCurrent: ${set.privatemode || 'off'}`);
        set.privatemode = mode;
        let desc = mode === 'off' ? 'No automatic response to private messages.' : mode === 'away' ? 'Bot will send an away message.' : mode === 'ai' ? 'Bot will chat with strangers using AI.' : 'Bot will send an away message then switch to AI chat.';
        m.reply(`✅ Private mode set to *${mode.toUpperCase()}*\n${desc}`);
    },
    setawaymsg: async (maureonix, m, { isCreator, mess, text, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!text && args[0] !== 'reset') return m.reply(`Usage: ${prefix}setawaymsg <message> or ${prefix}setawaymsg reset`);
        if (args[0] === 'reset') {
            set.awaymsg = 'I\'m currently not available. I\'ll respond when I can. Meanwhile, you can leave a message.';
            m.reply('✅ Away message reset to default.');
        } else {
            set.awaymsg = text;
            m.reply(`✅ Away message set to:\n${text}`);
        }
    },
    awaymsg: async (maureonix, m, { isCreator, mess, set }) => {
        if (!isCreator) return m.reply(mess.owner);
        m.reply(`📴 *Current away message:*\n${set.awaymsg || '(default)'}`);
    },
    pending: async (maureonix, m, { isCreator, mess, set, args, prefix, AI }) => {
        if (!isCreator) return m.reply(mess.owner);
        const pending = set.pendingMessages || [];
        if (!pending.length) return m.reply('📭 No pending messages.');
        const wantRaw = args[0]?.toLowerCase() === 'raw';
        if (wantRaw) {
            let txt = '📩 *Pending Messages (while you were away)*\n\n';
            pending.forEach(entry => {
                const num = entry.from.split('@')[0];
                const last = entry.messages[entry.messages.length - 1];
                const preview = last.body.length > 40 ? last.body.slice(0, 40) + '...' : last.body;
                const time = new Date(last.time).toLocaleString('en-KE', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
                txt += `👤 *${num}* — ${entry.messages.length} msg${entry.messages.length > 1 ? 's' : ''}\n   Last: ${preview}\n   Time: ${time}\n\n`;
            });
            txt += `_Use ${prefix}pendingclear to clear this list._\n_Use ${prefix}pending (without raw) for AI summary._`;
            return m.reply(txt);
        }
        await m.reply('🧠 *Analyzing your inbox...*');
        let aiPrompt = 'Summarize the following pending messages for the owner in a clear, concise, bullet-point format. Group by user, highlight key topics and any urgent requests. Keep it brief.\n\nPending Messages:\n';
        let totalMessages = 0;
        pending.forEach(entry => {
            const num = entry.from.split('@')[0];
            const msgs = entry.messages;
            totalMessages += msgs.length;
            aiPrompt += `--- User @${num} (${msgs.length} message${msgs.length > 1 ? 's' : ''}) ---\n`;
            const sample = msgs.slice(-5);
            sample.forEach((msg, i) => { const time = new Date(msg.time).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }); aiPrompt += `[${time}] ${msg.body}\n`; });
            if (msgs.length > 5) aiPrompt += `... and ${msgs.length - 5} earlier messages.\n`;
            aiPrompt += '\n';
        });
        aiPrompt += '\nProvide a helpful summary for the owner. Mention any urgent matters.';
        try {
            const { ultimateAI } = require('../lib/ai');
            const result = await ultimateAI(aiPrompt, m.sender, 'deepseek');
            const summary = result.text || 'Unable to generate summary.';
            let finalText = `📩 *Inbox Summary* (${totalMessages} messages from ${pending.length} user${pending.length > 1 ? 's' : ''})\n\n${summary}\n\n_Use ${prefix}pending raw for full list._\n_Use ${prefix}pendingclear to clear._`;
            await m.reply(finalText);
        } catch (e) { m.reply(`❌ AI summary failed. Use ${prefix}pending raw for full list.`); }
    },
    pendingclear: async (maureonix, m, { isCreator, mess, set }) => {
        if (!isCreator) return m.reply(mess.owner);
        set.pendingMessages = [];
        await m.reply('✅ Pending messages cleared.');
    },
    crisis: async (maureonix, m, { isCreator, mess, args, prefix, set }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!args[0]) return m.reply(`Usage:\n${prefix}crisis on/off - global toggle\n${prefix}crisis scope <all|dm|groups|off> - set scope\n${prefix}crisiscancel @user - cancel crisis mode for user`);
        const action = args[0].toLowerCase();
        if (action === 'on') { set.crisisDetection = true; m.reply('✅ Crisis detection ENABLED.'); }
        else if (action === 'off') { set.crisisDetection = false; m.reply('❌ Crisis detection DISABLED.'); }
        else if (action === 'scope') {
            const scope = args[1]?.toLowerCase();
            if (!['all', 'dm', 'groups', 'off'].includes(scope)) return m.reply(`Invalid scope. Use: all, dm, groups, off\nCurrent: ${set.crisisScope || 'all'}`);
            set.crisisScope = scope;
            m.reply(`✅ Crisis scope set to *${scope.toUpperCase()}*`);
        } else m.reply('Unknown action. Use `on`, `off`, or `scope`.');
    },
    crisiscancel: async (maureonix, m, { isCreator, mess, args, db }) => {
        if (!isCreator) return m.reply(mess.owner);
        let target = m.mentionedJid?.[0];
        if (!target && args[0]) { let num = args[0].replace(/[^0-9]/g, ''); if (num.length >= 9) target = num + '@s.whatsapp.net'; }
        if (!target && m.quoted?.sender) target = m.quoted.sender;
        if (!target) return m.reply('❌ Please tag the user, reply to their message, or provide their phone number.');
        if (db.crisisPending?.[target]) {
            delete db.crisisPending[target];
            await m.reply(`✅ Crisis mode cancelled for @${target.split('@')[0]}.`, { mentions: [target] });
            await maureonix.sendMessage(target, { text: '🕊️ *The crisis support session has ended.*\n\nIf you need help again, just type anything – I will listen. You are not alone.' }).catch(() => {});
        } else m.reply(`❌ No active crisis mode found for @${target.split('@')[0]}.`);
    },
    knowledge: async (maureonix, m, { isCreator, mess, text, db, prefix, AI }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!db.botKnowledge) db.botKnowledge = [];
        if (!text) {
            const kb = db.botKnowledge;
            if (!kb.length) return m.reply(`🧠 *My Knowledge Base*\n\nEmpty. Add knowledge with:\n${prefix}knowledge <fact to remember>`);
            let txt = `🧠 *My Knowledge Base* (${kb.length} entries)\n\n`;
            kb.slice(-10).forEach((k, i) => {
                txt += `${i + 1}. ${k.text.substring(0, 60)}${k.text.length > 60 ? '...' : ''}\n   _Added: ${new Date(k.added).toLocaleDateString()}_\n\n`;
            });
            return m.reply(txt);
        }
        db.botKnowledge.push({ text: text.trim(), added: Date.now(), by: 'creator', category: 'general' });
        if (db.botKnowledge.length > 500) db.botKnowledge.shift();
        m.reply(`🧠 *Knowledge Added*\n\n"${text.trim()}"\n\nI've saved this. I'll be able to recall it in our conversations and use it to help you better.`);
    },
    reflect: async (maureonix, m, { isCreator, mess, db, runtime, AI }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!db.botReflections) db.botReflections = [];
        const refl = {
            timestamp: Date.now(),
            uptime: runtime(process.uptime()),
            users: Object.keys(db.users || {}).length,
            groups: Object.keys(db.groups || {}).length,
            memorySize: AI.getMemory?.(m.sender)?.length || 0,
            modelUsage: db.aiModelUsage || {}
        };
        db.botReflections.push(refl);
        if (db.botReflections.length > 100) db.botReflections.shift();
        let txt = `🪞 *Self-Reflection Report*\n\n`;
        txt += `⏱️ Uptime: ${refl.uptime}\n`;
        txt += `👥 Users: ${refl.users}\n`;
        txt += `🏠 Groups: ${refl.groups}\n`;
        txt += `🧠 Memory Entries: ${refl.memorySize}\n`;
        txt += `📊 Model Usage:\n`;
        Object.entries(refl.modelUsage).forEach(([model, count]) => {
            txt += `   • ${model}: ${count} calls\n`;
        });
        txt += `\n_These are my personal metrics. I track them to understand my own usage._`;
        m.reply(txt);
    },
    ownermenu: async (maureonix, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *👑 OWNER COMMANDS*  ║\n╚══════════════════════╝\n\n📌 *User Control*\n▸ ${prefix}block @user\n▸ ${prefix}unblock @user\n▸ ${prefix}ban @user\n▸ ${prefix}unban @user\n▸ ${prefix}addprem @user\n▸ ${prefix}delprem @user\n\n📌 *Bot Control*\n▸ ${prefix}backup – Backup database\n▸ ${prefix}shutdown – Stop bot\n▸ ${prefix}restart – Restart bot\n▸ ${prefix}join <link> – Join group\n▸ ${prefix}leave – Leave group\n▸ ${prefix}setppbot – Set bot profile picture\n▸ ${prefix}delppbot – Remove bot profile picture\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    // ═════════════════════════════════════════════════════════
    //  NEW: OWNER MIRROR – forwards auto‑AI replies to owner
    // ═════════════════════════════════════════════════════════
    ownermirror: async (maureonix, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix}ownermirror on/off\nCurrent: ${set.ownerMirror ? 'ON' : 'OFF'}`);
        set.ownerMirror = status;
        m.reply(`✅ Owner Mirror ${status ? 'enabled' : 'disabled'}. All auto‑AI replies will be forwarded to your DM.`);
    },

    // ═════════════════════════════════════════════════════════════════
    //  EMAIL & LEARNING COMMANDS — Maureonix v4.0
    // ═════════════════════════════════════════════════════════════════

    sendemail: async (maureonix, m, { isCreator, mess, args, prefix, command }) => {
        if (!isCreator) return m.reply(mess.owner);
        const input = args.join(' ');
        const parts = input.split('|').map(p => p.trim());
        if (parts.length < 3) return m.reply(`📧 *Send Email*\n\nUsage: ${prefix + command} email@example.com | Subject | Message\n\nExample:\n${prefix + command} john@gmail.com | Hello | This is a test from Maureonix!`);
        const [to, subject, ...textParts] = parts;
        const text = textParts.join(' | ');
        if (!to.includes('@')) return m.reply('❌ Invalid email address. Must contain @');
        await m.reply(`📤 Sending email to ${to}...`);
        const { sendDynamicEmail } = require('../lib/emailReports');
        const result = await sendDynamicEmail(to, subject, text);
        await m.reply(result.success ? `✅ Email sent successfully to ${to}\nSubject: ${subject}` : `❌ Failed to send email\nError: ${result.error}`);
    },

    emailstatus: async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        const { getStats } = require('../lib/emailService');
        const { getReportState } = require('../lib/emailReports');
        const stats = getStats();
        const state = getReportState();
        let txt = `📧 *Email System Status*\n\n`;
        txt += `Connection: ${stats.isConnected ? '✅ Online' : '❌ Offline'}\n`;
        txt += `Emails Sent (session): ${stats.emailsSent}\n`;
        txt += `Last Daily: ${state.lastDaily ? new Date(state.lastDaily).toLocaleString('en-KE') : 'Never'}\n`;
        txt += `Last Weekly: ${state.lastWeekly ? new Date(state.lastWeekly).toLocaleString('en-KE') : 'Never'}\n`;
        txt += `Last Monthly: ${state.lastMonthly ? new Date(state.lastMonthly).toLocaleString('en-KE') : 'Never'}\n`;
        txt += `Alerts Sent: ${state.alertsSent}\n`;
        txt += `Crises Handled: ${state.crisesHandled}\n`;
        txt += `Learning Reports: ${state.learningReportsSent}\n`;
        txt += `Emails Received: ${state.emailsReceived}\n`;
        txt += `Last Backup: ${state.lastBackup ? new Date(state.lastBackup).toLocaleString('en-KE') : 'Never'}\n\n`;
        txt += `_Sender: ${global.emailSender || 'Not configured'}_\n`;
        txt += `_Recipient: ${global.emailRecipient || 'Not configured'}_`;
        await m.reply(txt);
    },

    testemail: async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        await m.reply('📧 Sending test email...');
        const { sendDynamicEmail } = require('../lib/emailReports');
        const result = await sendDynamicEmail(
            global.emailRecipient,
            '🧪 Maureonix Test Email',
            'This is a test email from Maureonix Cortex v4.0.\n\nIf you received this, your email system is working perfectly! ⚡\n\nTime: ' + new Date().toLocaleString('en-KE')
        );
        await m.reply(result.success ? '✅ Test email sent! Check your inbox.' : `❌ Test failed: ${result.error}`);
    },

    dailyreport: async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        await m.reply('📊 Generating daily report...');
        const { sendDailyReport } = require('../lib/emailReports');
        await sendDailyReport();
        await m.reply('✅ Daily report sent to your email!');
    },

    weeklyreport: async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        await m.reply('📈 Generating weekly report...');
        const { sendWeeklyReport } = require('../lib/emailReports');
        await sendWeeklyReport();
        await m.reply('✅ Weekly report sent to your email!');
    },

    monthlyreport: async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        await m.reply('🌌 Generating monthly deep dive...');
        const { sendMonthlyReport } = require('../lib/emailReports');
        await sendMonthlyReport();
        await m.reply('✅ Monthly report sent to your email!');
    },

    reportnow: async (maureonix, m, { isCreator, mess, args }) => {
        if (!isCreator) return m.reply(mess.owner);
        const type = args[0]?.toLowerCase() || 'custom';
        const { sendDailyReport, sendWeeklyReport, sendMonthlyReport } = require('../lib/emailReports');
        if (type === 'daily') await sendDailyReport();
        else if (type === 'weekly') await sendWeeklyReport();
        else if (type === 'monthly') await sendMonthlyReport();
        else await sendDailyReport();
        await m.reply(`✅ ${type} report sent!`);
    },

    backupnow: async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        await m.reply('💾 Creating backup...');
        const { performAutoBackup } = require('../lib/emailReports');
        await performAutoBackup();
        await m.reply('✅ Backup sent to your email!');
    },

    learnfile: async (maureonix, m, { isCreator, mess, args, prefix, command, db, learningSessionManager }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!m.quoted || !['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'].includes(m.quoted.type)) {
            return m.reply(`📌 Reply to a file with *${prefix + command} <curriculum_name>*\nExample: ${prefix + command} AI_Fundamentals`);
        }
        const curriculumName = args.join(' ') || `file_${Date.now()}`;
        const buffer = await m.quoted.download();
        const { processFile } = require('../lib/fileProcessor');
        const result = await processFile(buffer, m.quoted.mimetype, m.quoted.filename);
        if (result.type !== 'text') return m.reply('❌ Could not extract text from this file.');
        const engine = global.learningEngine;
        const startRes = await engine.startLearning(m.sender, result.content, curriculumName);
        if (!startRes.success) return m.reply(`❌ ${startRes.error}`);
        global.learningMode[m.sender] = true;
        if (!db.learningCurricula) db.learningCurricula = {};
        db.learningCurricula[curriculumName] = { content: result.content.slice(0, 5000), date: Date.now() };
        await m.reply(startRes.message + `\n\nChunk 1/${startRes.totalChunks}:\n${startRes.firstChunk.text.slice(0, 300)}...\nType *next* to continue, *exit* to stop.`);
    },

    learntext: async (maureonix, m, { isCreator, mess, text, prefix, command, learningSessionManager }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!text) return m.reply(`Usage: ${prefix + command} <name> || <content>`);
        const parts = text.split('||');
        if (parts.length < 2) return m.reply('Separate name and content with `||`');
        const name = parts[0].trim();
        const content = parts.slice(1).join('||').trim();
        if (content.length < 50) return m.reply('Content too short (min 50 chars).');
        const engine = global.learningEngine;
        const startRes = await engine.startLearning(m.sender, content, name);
        if (!startRes.success) return m.reply(`❌ ${startRes.error}`);
        global.learningMode[m.sender] = true;
        await m.reply(startRes.message);
    },

    autolearn: async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        await m.reply('🧠 Scanning curriculum folder and auto-learning...');
        const { scanAndLearnCurriculum } = require('../lib/emailReports');
        await scanAndLearnCurriculum();
        await m.reply('✅ Auto-learning complete! Check your email for reports.');
    },

    learningstatus: async (maureonix, m, { isCreator, mess, learningSessionManager }) => {
        if (!isCreator) return m.reply(mess.owner);
        const session = learningSessionManager?.getSession(m.sender);
        if (!session) return m.reply('No active learning session.');
        const mastery = learningSessionManager.calculateMastery(m.sender);
        let txt = `📚 *Learning Status*\n\nCurriculum: ${session.curriculumName}\nProgress: ${session.currentChunkIndex + 1}/${session.chunks.length} chunks\nMastery: ${mastery.toFixed(1)}%\nStatus: ${session.status}\n\nType *next* or *exit*.`;
        await m.reply(txt);
    },

    learningstop: async (maureonix, m, { isCreator, mess, learningSessionManager }) => {
        if (!isCreator) return m.reply(mess.owner);
        const result = learningSessionManager?.endSession(m.sender);
        delete global.learningMode[m.sender];
        if (result) {
            await m.reply(`🛑 Learning stopped. Final mastery: ${result.mastery.toFixed(1)}%`);
            const { sendLearningReport } = require('../lib/emailReports');
            await sendLearningReport(result.curriculumName, result);
        } else {
            await m.reply('No active session.');
        }
    },

    learninghistory: async (maureonix, m, { isCreator, mess, learningSessionManager }) => {
        if (!isCreator) return m.reply(mess.owner);
        const history = learningSessionManager?.getMasteryHistory(m.sender);
        if (!history?.length) return m.reply('No learning history.');
        let txt = `📜 *Learning History*\n\n`;
        history.slice(-10).forEach((h, i) => {
            txt += `${i+1}. ${h.curriculum} – ${h.mastery}% mastery\n   ${new Date(h.completedAt).toLocaleDateString()}\n`;
        });
        await m.reply(txt);
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    //   SYMPHONY ORCHESTRATOR COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════════

    symphony: async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        try {
            const { symphonyOrchestrator } = require('../lib/symphonyOrchestrator');
            const status = symphonyOrchestrator.getStatus();
            const txt = `🎼 *Symphony Orchestrator*\n\n` +
                `Status: ${status.is_running ? '🟢 RUNNING' : '🔴 STOPPED'}\n` +
                `Active Sessions: ${status.running_count}\n` +
                `Retry Queue: ${status.retrying_count}\n` +
                `Completed: ${status.completed_count}\n` +
                `Poll Interval: ${status.poll_interval_ms}ms\n\n` +
                `Running Issues:\n${status.running.map(r => `• #${r.identifier} (${r.state}) - ${r.turn_count} turns`).join('\n') || 'None'}`;
            await m.reply(txt);
        } catch (e) {
            await m.reply(`❌ Symphony orchestrator error: ${e.message}`);
        }
    },

    'symphony-start': async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        try {
            const { startSymphony } = require('../lib/symphonyOrchestrator');
            await startSymphony();
            await m.reply('🎼 *Symphony Orchestrator started*');
        } catch (e) {
            await m.reply(`❌ Failed to start: ${e.message}`);
        }
    },

    'symphony-stop': async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        try {
            const { symphonyOrchestrator } = require('../lib/symphonyOrchestrator');
            await symphonyOrchestrator.shutdown();
            await m.reply('🛑 *Symphony Orchestrator stopped*');
        } catch (e) {
            await m.reply(`❌ Failed to stop: ${e.message}`);
        }
    },

    'symphony-refresh': async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        try {
            const { symphonyOrchestrator } = require('../lib/symphonyOrchestrator');
            symphonyOrchestrator.scheduleTick(0);
            await m.reply('🔄 *Symphony poll triggered*');
        } catch (e) {
            await m.reply(`❌ Failed: ${e.message}`);
        }
    },

    'symphony-force': async (maureonix, m, { isCreator, mess, args }) => {
        if (!isCreator) return m.reply(mess.owner);
        const issueNum = args[0];
        if (!issueNum) return m.reply('Usage: .symphony-force <issue-number>');
        try {
            // Manual dispatch: we don't have a direct dispatch-by-number function in the orchestrator;
            // we can simulate by fetching the issue and calling dispatchIssue.
            // For now, inform the owner that this is a placeholder.
            await m.reply(`🚀 Force dispatch of issue #${issueNum} requested. (Implementation pending full orchestrator integration)`);
        } catch (e) {
            await m.reply(`❌ Failed: ${e.message}`);
        }
    },

        // ═══════════════════════════════════════════════════════════════════════════════
    //   SUPER INTELLIGENCE COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════════

    think: async (maureonix, m, { isCreator, mess, args }) => {
        if (!isCreator) return m.reply(mess.owner);
        try {
            const { superIntelligence } = require('../lib/superIntelligencePack');
            if (!superIntelligence.initialized) await superIntelligence.initialize();

            const query = args.join(' ') || 'Analyze current system state';
            const result = await superIntelligence.think(query);

            await m.reply(`🧠 *Cognitive Analysis*\n\n` +
                  `Plan: ${result.plan.goal}\n` +
                  `Steps: ${result.plan.steps.length}\n` +
                  `Confidence: ${Math.round(result.confidence * 100)}%\n\n` +
                  `💡 Creative Ideas:\n${result.creativeIdeas.map(i => `• ${i.idea.slice(0, 100)}...`).join('\n') || 'None'}\n\n` +
                  `🤖 Swarm: ${result.swarmConsensus ? result.swarmConsensus.winner : 'N/A'}`);
        } catch (e) {
            await m.reply(`❌ Cognitive error: ${e.message}`);
        }
    },

    cognitive: async (maureonix, m, ctx) => { await module.exports.think(maureonix, m, ctx); },

    audit: async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        try {
            const { superIntelligence } = require('../lib/superIntelligencePack');
            if (!superIntelligence.initialized) await superIntelligence.initialize();

            await m.reply('🔍 Running comprehensive code audit...');
            const audit = await superIntelligence.auditProject();

            const analysis = audit.analysis;
            await m.reply(`📊 *Code Audit Results*\n\n` +
                  `Files: ${analysis.filesAnalyzed}\n` +
                  `Average Score: ${analysis.averageScore}/100\n` +
                  `Critical Issues: ${analysis.criticalIssues}\n` +
                  `Total Issues: ${analysis.totalIssues}\n\n` +
                  `💡 ${analysis.recommendation}\n\n` +
                  `Top Issues:\n${analysis.fileResults.slice(0, 5).map(f => 
                    `• ${path.basename(f.filePath)}: ${f.overall}/100 (${f.issues?.length || 0} issues)`
                  ).join('\n')}`);
        } catch (e) {
            await m.reply(`❌ Audit error: ${e.message}`);
        }
    },

    'code-audit': async (maureonix, m, ctx) => { await module.exports.audit(maureonix, m, ctx); },

    predict: async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        try {
            const { superIntelligence } = require('../lib/superIntelligencePack');
            if (!superIntelligence.initialized) await superIntelligence.initialize();

            const alerts = await superIntelligence.predictAndPrevent();

            if (alerts.length === 0) {
                await m.reply('🔮 *Predictive Analysis*\n\nNo anomalies predicted. System looks healthy.');
            } else {
                await m.reply(`🔮 *Predictive Alerts* (${alerts.length})\n\n` +
                      alerts.map(a => `⚠️ *${a.type}*\n${a.message}\nConfidence: ${Math.round(a.confidence * 100)}%\nAction: ${a.action}`).join('\n\n'));
            }
        } catch (e) {
            await m.reply(`❌ Prediction error: ${e.message}`);
        }
    },

    forecast: async (maureonix, m, ctx) => { await module.exports.predict(maureonix, m, ctx); },

    reflect: async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        try {
            const { superIntelligence } = require('../lib/superIntelligencePack');
            if (!superIntelligence.initialized) await superIntelligence.initialize();

            await m.reply('🪞 Running self-reflection cycle...');
            const reflection = await superIntelligence.selfImprove();

            await m.reply(`🪞 *Self-Reflection*\n\n` +
                  `Calibration: ${reflection.reflection.calibration.status}\n` +
                  `Score: ${Math.round(reflection.reflection.calibration.calibrationScore * 100)}%\n` +
                  `Memories Consolidated: ${reflection.memoriesConsolidated}\n\n` +
                  `Improvement Areas:\n${reflection.reflection.improvementAreas.map(a => `• ${a}`).join('\n') || 'None'}\n\n` +
                  `Architecture Suggestions:\n${reflection.architectureSuggestions.slice(0, 3).map(s => `• ${s.description} (${s.priority})`).join('\n') || 'None'}`);
        } catch (e) {
            await m.reply(`❌ Reflection error: ${e.message}`);
        }
    },

    'self-reflect': async (maureonix, m, ctx) => { await module.exports.reflect(maureonix, m, ctx); },

    swarm: async (maureonix, m, { isCreator, mess, args }) => {
        if (!isCreator) return m.reply(mess.owner);
        try {
            const { superIntelligence } = require('../lib/superIntelligencePack');
            if (!superIntelligence.initialized) await superIntelligence.initialize();

            const query = args.join(' ') || 'How should I improve the bot?';
            await m.reply('🤖 Deploying agent swarm...');

            const consensus = await superIntelligence.swarm.collaborate(query);

            await m.reply(`🤖 *Swarm Consensus*\n\n` +
                  `Winner: ${consensus.winner}\n` +
                  `Confidence: ${Math.round(consensus.confidence * 100)}%\n` +
                  `Score: ${Math.round(consensus.score * 100)}%\n\n` +
                  `*Proposal:*\n${consensus.proposal.slice(0, 800)}\n\n` +
                  `*Incorporated Feedback:*\n${consensus.incorporatedFeedback.map(f => `• ${f.slice(0, 100)}`).join('\n') || 'None'}`);
        } catch (e) {
            await m.reply(`❌ Swarm error: ${e.message}`);
        }
    },

    agents: async (maureonix, m, ctx) => { await module.exports.swarm(maureonix, m, ctx); },

    memory: async (maureonix, m, { isCreator, mess, args }) => {
        if (!isCreator) return m.reply(mess.owner);
        try {
            const { superIntelligence } = require('../lib/superIntelligencePack');
            if (!superIntelligence.initialized) await superIntelligence.initialize();

            const query = args.join(' ') || 'recent events';
            const memories = await superIntelligence.memory.recall(query, 5);

            await m.reply(`📚 *Neural Memory Recall* (${memories.length})\n\n` +
                  memories.map((memo, i) => 
                    `${i + 1}. [${memo.type}] ${memo.content.slice(0, 150)}...\n   Domain: ${memo.domain} | Importance: ${Math.round(memo.importance * 100)}% | Accessed: ${memo.accessCount}x`
                  ).join('\n\n'));
        } catch (e) {
            await m.reply(`❌ Memory error: ${e.message}`);
        }
    },

    recall: async (maureonix, m, ctx) => { await module.exports.memory(maureonix, m, ctx); },

    brainstorm: async (maureonix, m, { isCreator, mess, args }) => {
        if (!isCreator) return m.reply(mess.owner);
        try {
            const { superIntelligence } = require('../lib/superIntelligencePack');
            if (!superIntelligence.initialized) await superIntelligence.initialize();

            const topic = args.join(' ') || 'improve the bot';
            const ideas = await superIntelligence.creative.brainstorm(topic);

            await m.reply(`💡 *Creative Synthesis* (${ideas.length} ideas)\n\n` +
                  ideas.map((idea, i) => 
                    `${i + 1}. *Novelty: ${Math.round(idea.novelty * 100)}%*\n${idea.idea}\nDomains: ${idea.domains.join(' + ')}`
                  ).join('\n\n'));
        } catch (e) {
            await m.reply(`❌ Synthesis error: ${e.message}`);
        }
    },

    synthesize: async (maureonix, m, ctx) => { await module.exports.brainstorm(maureonix, m, ctx); },

    intelligence: async (maureonix, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        try {
            const { superIntelligence } = require('../lib/superIntelligencePack');
            const status = superIntelligence.getStatus();

            await m.reply(`🧠 *Super Intelligence Status*\n\n` +
                  `Initialized: ${status.initialized ? '✅' : '❌'}\n\n` +
                  `*Neural Memory:* ${status.modules.neuralMemory.memories} memories, ${status.modules.neuralMemory.vocabSize} vocab\n` +
                  `*Strategic Planner:* ${status.modules.strategicPlanner.activePlans} active / ${status.modules.strategicPlanner.totalPlans} total plans\n` +
                  `*Agent Swarm:* ${status.modules.agentSwarm.agents} agents, ${status.modules.agentSwarm.conversations} sessions\n` +
                  `*Code Oracle:* ${status.modules.codeOracle.patternsLoaded} patterns loaded\n` +
                  `*Predictive:* ${status.modules.predictive.metricsTracked} metrics tracked\n` +
                  `*Metacognition:* ${status.modules.metacognition.status} (${Math.round(status.modules.metacognition.calibrationScore * 100)}%)\n` +
                  `*Creative:* ${status.modules.creative.concepts} concepts, ${status.modules.creative.syntheses} syntheses`);
        } catch (e) {
            await m.reply(`❌ Status error: ${e.message}`);
        }
    },

    // Aliases for Symphony commands
    orch: async (maureonix, m, ctx) => { await module.exports.symphony(maureonix, m, ctx); },
    orchestrator: async (maureonix, m, ctx) => { await module.exports.symphony(maureonix, m, ctx); },
    'orch-start': async (maureonix, m, ctx) => { await module.exports['symphony-start'](maureonix, m, ctx); },
    'orch-stop': async (maureonix, m, ctx) => { await module.exports['symphony-stop'](maureonix, m, ctx); },
    'orch-refresh': async (maureonix, m, ctx) => { await module.exports['symphony-refresh'](maureonix, m, ctx); },
    'orch-force': async (maureonix, m, ctx) => { await module.exports['symphony-force'](maureonix, m, ctx); },

    // Aliases for the new commands
    sendmail: async (maureonix, m, ctx) => { await module.exports.sendemail(maureonix, m, ctx); },
    mailstatus: async (maureonix, m, ctx) => { await module.exports.emailstatus(maureonix, m, ctx); },
    dailyrep: async (maureonix, m, ctx) => { await module.exports.dailyreport(maureonix, m, ctx); },
    weekly: async (maureonix, m, ctx) => { await module.exports.weeklyreport(maureonix, m, ctx); },
    monthly: async (maureonix, m, ctx) => { await module.exports.monthlyreport(maureonix, m, ctx); },
    report: async (maureonix, m, ctx) => { await module.exports.reportnow(maureonix, m, ctx); },
    learn: async (maureonix, m, ctx) => { await module.exports.learnfile(maureonix, m, ctx); },
    learnstop: async (maureonix, m, ctx) => { await module.exports.learningstop(maureonix, m, ctx); },
    learnstat: async (maureonix, m, ctx) => { await module.exports.learningstatus(maureonix, m, ctx); },
    learnhistory: async (maureonix, m, ctx) => { await module.exports.learninghistory(maureonix, m, ctx); },

    // Aliases
    blokir: async (maureonix, m, ctx) => { await module.exports.block(maureonix, m, ctx); },
    unblokir: async (maureonix, m, ctx) => { await module.exports.unblock(maureonix, m, ctx); },
    autosettings: async (maureonix, m, ctx) => { await module.exports.automation(maureonix, m, ctx); },
    autogpt: async (maureonix, m, ctx) => { await module.exports.autoai(maureonix, m, ctx); },
    inbox: async (maureonix, m, ctx) => { await module.exports.pending(maureonix, m, ctx); },
    clearinbox: async (maureonix, m, ctx) => { await module.exports.pendingclear(maureonix, m, ctx); },
};
