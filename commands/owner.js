// commands/owner.js – Owner & privacy controls (enhanced with owner mirror)
const fs = require('fs');
const path = require('path');
const { generateProfilePicture, sleep } = require('../lib/function');
const { generateReport } = require('../lib/reporting');
const { sendEmail } = require('../lib/emailService');

module.exports = {
    block: async (nimesha, m, { isCreator, mess, text }) => {
        if (!isCreator) return m.reply(mess.owner);
        let _blockJid = null;
        if (m.quoted?.sender) _blockJid = m.quoted.sender;
        else if (m.mentionedJid?.[0]) _blockJid = m.mentionedJid[0];
        else if (text) _blockJid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        else if (!m.isGroup) _blockJid = m.chat;
        if (_blockJid) {
            await nimesha.updateBlockStatus(_blockJid, 'block');
            m.reply(`✅ Blocked ${_blockJid.replace('@s.whatsapp.net', '')}`);
        } else m.reply('Reply, tag, or provide a number.');
    },
    unblock: async (nimesha, m, { isCreator, mess, text }) => {
        if (!isCreator) return m.reply(mess.owner);
        let _unblockJid = null;
        if (m.quoted?.sender) _unblockJid = m.quoted.sender;
        else if (m.mentionedJid?.[0]) _unblockJid = m.mentionedJid[0];
        else if (text) _unblockJid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        else if (!m.isGroup) _unblockJid = m.chat;
        if (_unblockJid) {
            await nimesha.updateBlockStatus(_unblockJid, 'unblock');
            m.reply(`✅ Unblocked ${_unblockJid.replace('@s.whatsapp.net', '')}`);
        } else m.reply('Reply, tag, or provide a number.');
    },
    join: async (nimesha, m, { isCreator, mess, args }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!args[0]) return m.reply('Enter the group link!');
        const result = args[0].match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
        if (!result) return m.reply('Invalid link❗');
        await nimesha.groupAcceptInvite(result[1]);
        m.reply('Joined!');
    },
    leave: async (nimesha, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        await nimesha.groupLeave(m.chat);
        m.reply('Left the group.');
    },
    clearchat: async (nimesha, m, { isCreator, mess, store, sleep }) => {
        if (!isCreator) return m.reply(mess.owner);
        await m.reply('⚠️ *Clearing chat...* This may take a while.');
        let deleted = 0;
        const messages = store?.messages?.[m.chat]?.array || [];
        if (messages.length === 0) return m.reply('No messages to delete.');
        for (let i = 0; i < messages.length; i += 20) {
            const batch = messages.slice(i, i + 20);
            await Promise.all(batch.map(async (msg) => {
                try { await nimesha.sendMessage(m.chat, { delete: msg.key }); deleted++; } catch (e) {}
            }));
            await sleep(300);
        }
        await m.reply(`✅ *Deleted ${deleted} messages* from this chat.`);
    },
    backup: async (nimesha, m, { isCreator, mess, args, tempatDB }) => {
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
    setppbot: async (nimesha, m, { isCreator, mess, prefix, command, generateProfilePicture }) => {
        if (!isCreator) return m.reply(mess.owner);
        if (!/image/.test(m.quoted?.type)) return m.reply(`📌 Reply to an image (caption: *${prefix + command}*)`);
        let media = await m.quoted.download();
        let { img } = await generateProfilePicture(media);
        await nimesha.query({ tag: 'iq', attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'w:profile:picture' }, content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }] });
        m.reply('✅ Profile picture updated');
    },
    delppbot: async (nimesha, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        await nimesha.removeProfilePicture(nimesha.user.id);
        m.reply('✅ Profile picture removed');
    },
    // Auto toggles
    autodownload: async (nimesha, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix}autodownload on/off\nCurrent: ${set.autodownload ? 'ON' : 'OFF'}`);
        set.autodownload = status;
        m.reply(`✅ Auto-download ${status ? 'enabled' : 'disabled'}.`);
    },
    autoviewstatus: async (nimesha, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix}autoviewstatus on/off\nCurrent: ${set.autostatus ? 'ON' : 'OFF'}`);
        set.autostatus = status;
        m.reply(`✅ Auto-view status ${status ? 'enabled' : 'disabled'}.`);
    },
    autolikestatus: async (nimesha, m, { isCreator, mess, args, set, prefix, command }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix + command} on/off\nCurrent: ${set.autostatusreact ? 'ON' : 'OFF'}`);
        set.autostatusreact = status;
        m.reply(`✅ Auto-react to status ${status ? 'enabled' : 'disabled'}.`);
    },
    autoreactmention: async (nimesha, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix}autoreactmention on/off\nCurrent: ${set.autoreactmention ? 'ON' : 'OFF'}`);
        set.autoreactmention = status;
        m.reply(`✅ Auto-react to mentions ${status ? 'enabled' : 'disabled'}.`);
    },
    autoreplymention: async (nimesha, m, { isCreator, mess, text, args, set, prefix }) => {
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
    autoforward: async (nimesha, m, { isCreator, mess, text, args, set, prefix }) => {
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
    autosticker: async (nimesha, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix}autosticker on/off\nCurrent: ${set.autosticker ? 'ON' : 'OFF'}`);
        set.autosticker = status;
        m.reply(`✅ Auto-sticker ${status ? 'enabled' : 'disabled'}.`);
    },
    autotranslate: async (nimesha, m, { isCreator, mess, text, args, set, prefix }) => {
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
    autodelete: async (nimesha, m, { isCreator, mess, args, set, prefix }) => {
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
    autoreact: async (nimesha, m, { isCreator, mess, text, args, set, prefix }) => {
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
    autoblock: async (nimesha, m, { isCreator, mess, text, args, set, prefix }) => {
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
    autokick: async (nimesha, m, { isCreator, mess, text, args, set, prefix }) => {
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
    automute: async (nimesha, m, { isCreator, mess, text, args, set, prefix }) => {
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
    autowelcome: async (nimesha, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix}autowelcome on/off\nCurrent: ${set.autowelcome ? 'ON' : 'OFF'}`);
        set.autowelcome = status;
        m.reply(`✅ Auto-welcome ${status ? 'enabled' : 'disabled'}.`);
    },
    autogoodbye: async (nimesha, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix}autogoodbye on/off\nCurrent: ${set.autogoodbye ? 'ON' : 'OFF'}`);
        set.autogoodbye = status;
        m.reply(`✅ Auto-goodbye ${status ? 'enabled' : 'disabled'}.`);
    },
    automation: async (nimesha, m, { isCreator, mess, set, prefix }) => {
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
    public: async (nimesha, m, { isCreator, mess, set }) => {
        if (!isCreator) return m.reply(mess.owner);
        set.public = true;
        m.reply('✅ Bot is now in *PUBLIC* mode. Everyone can use commands.');
    },
    private: async (nimesha, m, { isCreator, mess, set }) => {
        if (!isCreator) return m.reply(mess.owner);
        set.public = false;
        m.reply('🔒 Bot is now in *PRIVATE* mode. Only owner can use commands.');
    },
    mode: async (nimesha, m, { isCreator, mess, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = set.public ? 'PUBLIC' : 'PRIVATE';
        m.reply(`⚙️ Current mode: *${status}*\nUse ${prefix}public or ${prefix}private to change.`);
    },
    autoai: async (nimesha, m, { isCreator, mess, args, set, prefix, command }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix + command} on/off\nCurrent: ${set.autoai ? 'ON' : 'OFF'}`);
        set.autoai = status;
        m.reply(`✅ Auto-AI ${status ? 'enabled' : 'disabled'}. Now messages without prefix will get AI responses.`);
    },
    autoaiselfchat: async (nimesha, m, { isCreator, mess, args, set, prefix, command }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix + command} on/off\nCurrent: ${set.autoai_selfchat ? 'ON' : 'OFF'}`);
        set.autoai_selfchat = status;
        m.reply(`✅ Self‑chat AI ${status ? 'enabled' : 'disabled'}.`);
    },
    privatemode: async (nimesha, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const mode = args[0]?.toLowerCase();
        if (!['off', 'away', 'ai', 'both'].includes(mode)) return m.reply(`Usage: ${prefix}privatemode <off|away|ai|both>\nCurrent: ${set.privatemode || 'off'}`);
        set.privatemode = mode;
        let desc = mode === 'off' ? 'No automatic response to private messages.' : mode === 'away' ? 'Bot will send an away message.' : mode === 'ai' ? 'Bot will chat with strangers using AI.' : 'Bot will send an away message then switch to AI chat.';
        m.reply(`✅ Private mode set to *${mode.toUpperCase()}*\n${desc}`);
    },
    setawaymsg: async (nimesha, m, { isCreator, mess, text, args, set, prefix }) => {
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
    awaymsg: async (nimesha, m, { isCreator, mess, set }) => {
        if (!isCreator) return m.reply(mess.owner);
        m.reply(`📴 *Current away message:*\n${set.awaymsg || '(default)'}`);
    },
    pending: async (nimesha, m, { isCreator, mess, set, args, prefix, AI }) => {
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
    pendingclear: async (nimesha, m, { isCreator, mess, set }) => {
        if (!isCreator) return m.reply(mess.owner);
        set.pendingMessages = [];
        await m.reply('✅ Pending messages cleared.');
    },
    crisis: async (nimesha, m, { isCreator, mess, args, prefix, set }) => {
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
    crisiscancel: async (nimesha, m, { isCreator, mess, args, db }) => {
        if (!isCreator) return m.reply(mess.owner);
        let target = m.mentionedJid?.[0];
        if (!target && args[0]) { let num = args[0].replace(/[^0-9]/g, ''); if (num.length >= 9) target = num + '@s.whatsapp.net'; }
        if (!target && m.quoted?.sender) target = m.quoted.sender;
        if (!target) return m.reply('❌ Please tag the user, reply to their message, or provide their phone number.');
        if (db.crisisPending?.[target]) {
            delete db.crisisPending[target];
            await m.reply(`✅ Crisis mode cancelled for @${target.split('@')[0]}.`, { mentions: [target] });
            await nimesha.sendMessage(target, { text: '🕊️ *The crisis support session has ended.*\n\nIf you need help again, just type anything – I will listen. You are not alone.' }).catch(() => {});
        } else m.reply(`❌ No active crisis mode found for @${target.split('@')[0]}.`);
    },
    knowledge: async (nimesha, m, { isCreator, mess, text, db, prefix, AI }) => {
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
    reflect: async (nimesha, m, { isCreator, mess, db, runtime, AI }) => {
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
    ownermenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *👑 OWNER COMMANDS*  ║\n╚══════════════════════╝\n\n📌 *User Control*\n▸ ${prefix}block @user\n▸ ${prefix}unblock @user\n▸ ${prefix}ban @user\n▸ ${prefix}unban @user\n▸ ${prefix}addprem @user\n▸ ${prefix}delprem @user\n\n📌 *Bot Control*\n▸ ${prefix}backup – Backup database\n▸ ${prefix}shutdown – Stop bot\n▸ ${prefix}restart – Restart bot\n▸ ${prefix}join <link> – Join group\n▸ ${prefix}leave – Leave group\n▸ ${prefix}setppbot – Set bot profile picture\n▸ ${prefix}delppbot – Remove bot profile picture\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    // ═════════════════════════════════════════════════════════
    //  NEW: OWNER MIRROR – forwards auto‑AI replies to owner
    // ═════════════════════════════════════════════════════════
    ownermirror: async (nimesha, m, { isCreator, mess, args, set, prefix }) => {
        if (!isCreator) return m.reply(mess.owner);
        const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
        if (status === null) return m.reply(`Usage: ${prefix}ownermirror on/off\nCurrent: ${set.ownerMirror ? 'ON' : 'OFF'}`);
        set.ownerMirror = status;
        m.reply(`✅ Owner Mirror ${status ? 'enabled' : 'disabled'}. All auto‑AI replies will be forwarded to your DM.`);
    },

    // Reporting & learning commands
    dailyreport: async (nimesha, m, { isCreator, mess, db, AI, hyperMemory, knowledgeGraph, reflectionEngine, keyManager, learningSessionManager }) => {
        if (!isCreator) return m.reply(mess.owner);
        await m.reply('📊 Generating daily report...');
        const report = await generateReport('daily', db, AI, hyperMemory, knowledgeGraph, reflectionEngine, keyManager, learningSessionManager, m.sender);
        await m.reply(report.text);
        await sendEmail(global.emailRecipient, '📊 Daily Report', report.text, report.attachment, report.filename);
    },
    weeklyreport: async (nimesha, m, { isCreator, mess, db, AI, hyperMemory, knowledgeGraph, reflectionEngine, keyManager, learningSessionManager }) => {
        if (!isCreator) return m.reply(mess.owner);
        await m.reply('📊 Generating weekly report...');
        const report = await generateReport('weekly', db, AI, hyperMemory, knowledgeGraph, reflectionEngine, keyManager, learningSessionManager, m.sender);
        await m.reply(report.text);
        await sendEmail(global.emailRecipient, '📊 Weekly Report', report.text, report.attachment, report.filename);
    },
    reportnow: async (nimesha, m, { isCreator, mess, args, db, AI, hyperMemory, knowledgeGraph, reflectionEngine, keyManager, learningSessionManager }) => {
        if (!isCreator) return m.reply(mess.owner);
        const customType = args[0] || 'now';
        await m.reply('📊 Generating custom report...');
        const report = await generateReport(customType, db, AI, hyperMemory, knowledgeGraph, reflectionEngine, keyManager, learningSessionManager, m.sender);
        await m.reply(report.text);
        if (args.includes('--email')) {
            await sendEmail(global.emailRecipient, `📊 ${customType} Report`, report.text, report.attachment, report.filename);
            await m.reply('✅ Report also sent to email.');
        }
    },
    learnfile: async (nimesha, m, { isCreator, mess, args, prefix, command, db }) => {
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
    learntext: async (nimesha, m, { isCreator, mess, text, prefix, command }) => {
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
    learningstatus: async (nimesha, m, { isCreator, mess, learningSessionManager }) => {
        if (!isCreator) return m.reply(mess.owner);
        const session = learningSessionManager?.getSession(m.sender);
        if (!session) return m.reply('No active learning session.');
        const mastery = learningSessionManager.calculateMastery(m.sender);
        let txt = `📚 *Learning Status*\n\nCurriculum: ${session.curriculumName}\nProgress: ${session.currentChunkIndex + 1}/${session.chunks.length} chunks\nMastery: ${mastery.toFixed(1)}%\nStatus: ${session.status}\n\nType *next* or *exit*.`;
        await m.reply(txt);
    },
    learningstop: async (nimesha, m, { isCreator, mess, learningSessionManager }) => {
        if (!isCreator) return m.reply(mess.owner);
        const result = learningSessionManager?.endSession(m.sender);
        delete global.learningMode[m.sender];
        if (result) {
            await m.reply(`🛑 Learning stopped. Final mastery: ${result.mastery.toFixed(1)}%`);
            await sendEmail(global.emailRecipient, 'Learning Progress', `Curriculum: ${result.curriculumName}\nMastery: ${result.mastery.toFixed(1)}%\nChunks: ${result.chunksStudied}/${result.totalChunks}`);
        } else {
            await m.reply('No active session.');
        }
    },
    learninghistory: async (nimesha, m, { isCreator, mess, learningSessionManager }) => {
        if (!isCreator) return m.reply(mess.owner);
        const history = learningSessionManager?.getMasteryHistory(m.sender);
        if (!history?.length) return m.reply('No learning history.');
        let txt = `📜 *Learning History*\n\n`;
        history.slice(-10).forEach((h, i) => {
            txt += `${i+1}. ${h.curriculum} – ${h.mastery}% mastery\n   ${new Date(h.completedAt).toLocaleDateString()}\n`;
        });
        await m.reply(txt);
    },

    // Aliases
    blokir: async (nimesha, m, ctx) => { await module.exports.block(nimesha, m, ctx); },
    unblokir: async (nimesha, m, ctx) => { await module.exports.unblock(nimesha, m, ctx); },
    autosettings: async (nimesha, m, ctx) => { await module.exports.automation(nimesha, m, ctx); },
    autogpt: async (nimesha, m, ctx) => { await module.exports.autoai(nimesha, m, ctx); },
    selfchat: async (nimesha, m, ctx) => { await module.exports.autoaiselfchat(nimesha, m, ctx); },
    inbox: async (nimesha, m, ctx) => { await module.exports.pending(nimesha, m, ctx); },
    clearinbox: async (nimesha, m, ctx) => { await module.exports.pendingclear(nimesha, m, ctx); },
    report: async (nimesha, m, ctx) => { await module.exports.reportnow(nimesha, m, ctx); },
    dailyrep: async (nimesha, m, ctx) => { await module.exports.dailyreport(nimesha, m, ctx); },
    weekly: async (nimesha, m, ctx) => { await module.exports.weeklyreport(nimesha, m, ctx); },
    learn: async (nimesha, m, ctx) => { await module.exports.learnfile(nimesha, m, ctx); },
    learnstop: async (nimesha, m, ctx) => { await module.exports.learningstop(nimesha, m, ctx); },
    learnstat: async (nimesha, m, ctx) => { await module.exports.learningstatus(nimesha, m, ctx); },
    learnhistory: async (nimesha, m, ctx) => { await module.exports.learninghistory(nimesha, m, ctx); },
};
