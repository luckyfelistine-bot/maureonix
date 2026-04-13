/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  🦊 MAUREONIX — ADMIN PROTECTION ENGINE v3.0        ║
 * ║  Full Group Moderation & Protection System           ║
 * ║  Drop-in replacement for nima.js group cases         ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * USAGE (in nima.js switch block):
 *
 *   const admin = require('./lib/admin_protection');
 *   // In your message handler:
 *   await admin.handleProtections(nimesha, m, db, prefix);
 *   // In case 'antilink': etc:
 *   case 'antilink': case 'antispam': ... (see exported TOGGLEABLE_FEATURES)
 */

'use strict';
const fs = require('fs');
const chalk = require('chalk');

// ── All toggleable protection features ────────────────────────────────────────
const TOGGLEABLE_FEATURES = [
    'antilink',       // Remove messages containing links
    'antispam',       // Remove repeated messages
    'antidelete',     // Re-send deleted messages
    'antibadword',    // Remove messages with bad words
    'anticall',       // Block incoming calls (private)
    'antiviewonce',   // Forward view-once media
    'nsfw',           // Block NSFW content
    'welcome',        // Welcome new members
    'goodbye',        // Goodbye on leave
    'automod',        // Auto-moderation (combines several)
    'lock',           // Lock group (only admins send)
    'antihidetag',    // Anti-hidden-tag
    'antitagsw',      // Anti-tag-status-view
    'setinfo',        // Auto-update group description
    'waktusholat',    // Prayer time notifications
    'leave',          // Show leave messages
    'promote',        // Show promote messages
    'demote',         // Show demote messages
];

// ── Vote-kick store (in-memory, resets on restart) ────────────────────────────
const voteKickSessions = {};

// ── Spam tracker ─────────────────────────────────────────────────────────────
const spamTracker = {};

// ── Anti-spam check ───────────────────────────────────────────────────────────
function checkSpam(sender, chat, threshold = 5, windowMs = 5000) {
    const key = `${chat}:${sender}`;
    const now = Date.now();
    if (!spamTracker[key]) spamTracker[key] = [];
    spamTracker[key] = spamTracker[key].filter(t => now - t < windowMs);
    spamTracker[key].push(now);
    return spamTracker[key].length >= threshold;
}

// ── Bad words list (extend as needed) ─────────────────────────────────────────
const DEFAULT_BAD_WORDS = (global.badWords || []).concat([
    'spam','fuck','shit','ass','bitch','nigga','retard','kys','kill yourself'
]);

function containsBadWord(text, extraWords = []) {
    const combined = DEFAULT_BAD_WORDS.concat(extraWords);
    const lower = text.toLowerCase();
    return combined.some(w => lower.includes(w.toLowerCase()));
}

// ── Link detection ────────────────────────────────────────────────────────────
const LINK_REGEX = /(https?:\/\/|wa\.me\/|chat\.whatsapp\.com\/|t\.me\/|bit\.ly\/|tinyurl\.com\/)/i;

function containsLink(text) {
    return LINK_REGEX.test(text);
}

// ── Main protection handler ────────────────────────────────────────────────────
/**
 * Call this at the TOP of your message handler (before the switch block).
 * It silently handles all active protections.
 */
async function handleProtections(conn, m, db, prefix = '.') {
    if (!m.isGroup) {
        // Private chat: anti-call handled separately in connection events
        return;
    }

    const set = db.groups?.[m.chat];
    if (!set) return;

    const text = m.body || m.text || '';
    const sender = m.sender;
    const isAdmin = m.isAdmin;
    const isBotAdmin = m.isBotAdmin;

    // ── AUTOMOD combines: antilink + antibadword + antispam ──────────────────
    if (set.automod) {
        set.antilink    = true;
        set.antibadword = true;
        set.antispam    = true;
    }

    // ── ANTI-LINK ─────────────────────────────────────────────────────────────
    if (set.antilink && !isAdmin && isBotAdmin && containsLink(text)) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key });
            await conn.sendMessage(m.chat, {
                text: `⚠️ @${sender.split('@')[0]} *Links are not allowed in this group!*\n\n🔗 Your message has been deleted.\n📋 *Rule:* No external links without admin permission.`,
                mentions: [sender]
            });
        } catch {}
        return;
    }

    // ── ANTI-BAD-WORD ────────────────────────────────────────────────────────
    if (set.antibadword && !isAdmin && isBotAdmin && containsBadWord(text, set.badWordList || [])) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key });
            await conn.sendMessage(m.chat, {
                text: `🤬 @${sender.split('@')[0]} *Bad language detected!*\n\n🗑️ Message deleted.\n⚠️ Next violation may result in a kick.`,
                mentions: [sender]
            });
            // Warn counter
            if (!db.users[sender]) db.users[sender] = {};
            db.users[sender].warns = (db.users[sender].warns || 0) + 1;
            if (db.users[sender].warns >= 3) {
                await conn.groupParticipantsUpdate(m.chat, [sender], 'remove').catch(() => {});
                await conn.sendMessage(m.chat, {
                    text: `🔨 @${sender.split('@')[0]} has been *auto-kicked* for repeated bad language (3 warnings).`,
                    mentions: [sender]
                });
                db.users[sender].warns = 0;
            }
        } catch {}
        return;
    }

    // ── ANTI-SPAM ─────────────────────────────────────────────────────────────
    if (set.antispam && !isAdmin && isBotAdmin && checkSpam(sender, m.chat)) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key });
            await conn.sendMessage(m.chat, {
                text: `🚫 @${sender.split('@')[0]} *Spam detected!* Please slow down.`,
                mentions: [sender]
            });
        } catch {}
        return;
    }
}

// ── Anti-delete handler (call from messages.upsert on update) ─────────────────
async function handleAntiDelete(conn, update, db) {
    try {
        const { key, update: upd } = update;
        if (!upd?.messageStubType) return;
        if (upd.messageStubType !== 68 && upd.messageStubType !== 69) return; // REVOKE types
        const chat = key.remoteJid;
        const set = db.groups?.[chat];
        if (!set?.antidelete) return;
        const stored = db._deletedMsgs?.[key.id];
        if (!stored) return;
        await conn.sendMessage(chat, {
            text: `🗑️ *Anti-Delete* — A message was deleted:\n\n${stored.text || '[media]'}`,
            mentions: stored.mentions || []
        });
    } catch {}
}

// ── Welcome / Goodbye handlers ────────────────────────────────────────────────
async function handleWelcome(conn, update, db) {
    try {
        const { id: chat, participants, action } = update;
        const set = db.groups?.[chat];
        if (!set) return;

        if (action === 'add' && set.welcome) {
            for (const jid of participants) {
                const name = jid.split('@')[0];
                let welcomeText = set.text?.setwelcome
                    ?.replace(/@/g, `@${name}`)
                    ?.replace(/@subject/g, set.groupName || 'this group')
                    || `👋 Welcome *@${name}* to the group!\n\nPlease read the rules and enjoy your stay. 🎉`;
                await conn.sendMessage(chat, {
                    text: welcomeText,
                    mentions: [jid]
                });
            }
        }

        if (action === 'remove' && set.goodbye) {
            for (const jid of participants) {
                const name = jid.split('@')[0];
                let byeText = set.text?.setleave
                    ?.replace(/@/g, `@${name}`)
                    || `👋 *@${name}* has left the group. Goodbye! 😢`;
                await conn.sendMessage(chat, {
                    text: byeText,
                    mentions: [jid]
                });
            }
        }
    } catch {}
}

// ── VOTE KICK ─────────────────────────────────────────────────────────────────
/**
 * Start or vote in a vote-kick session.
 * Usage: .votekick @target
 */
async function handleVoteKick(conn, m, db, prefix = '.') {
    if (!m.isGroup) return m.reply('❌ Only usable in groups!');
    if (!m.isBotAdmin) return m.reply('❌ Bot must be admin!');

    const target = m.mentionedJid?.[0] || (m.quoted?.sender);
    if (!target) return m.reply(`⚠️ Tag someone to vote-kick!\nExample: ${prefix}votekick @user`);

    const chat = m.chat;
    const voter = m.sender;
    const members = m.metadata?.participants || [];
    const totalMembers = members.length;
    const needed = Math.max(2, Math.ceil(totalMembers * 0.3)); // 30% vote needed

    if (!voteKickSessions[chat]) voteKickSessions[chat] = {};

    if (!voteKickSessions[chat][target]) {
        voteKickSessions[chat][target] = {
            votes: new Set([voter]),
            startedBy: voter,
            startedAt: Date.now(),
            needed,
            timeout: setTimeout(async () => {
                delete voteKickSessions[chat]?.[target];
                await conn.sendMessage(chat, {
                    text: `⏰ Vote-kick for @${target.split('@')[0]} has *expired* — not enough votes.`,
                    mentions: [target]
                });
            }, 120000) // 2 min timeout
        };
        await conn.sendMessage(chat, {
            text: `🗳️ *VOTE KICK STARTED*\n\n👤 Target: @${target.split('@')[0]}\n🚀 Started by: @${voter.split('@')[0]}\n\n✅ Votes needed: *${needed}/${totalMembers}*\n⏰ Expires in: 2 minutes\n\n💬 Reply ${prefix}votekick @${target.split('@')[0]} to cast your vote!`,
            mentions: [target, voter]
        });
    } else {
        const session = voteKickSessions[chat][target];
        if (Date.now() - session.startedAt > 120000) {
            delete voteKickSessions[chat][target];
            return m.reply('⏰ Previous vote expired. Start a new one.');
        }
        if (session.votes.has(voter)) {
            return m.reply('⚠️ You already voted!');
        }
        session.votes.add(voter);
        const current = session.votes.size;
        if (current >= needed) {
            clearTimeout(session.timeout);
            delete voteKickSessions[chat][target];
            try {
                await conn.groupParticipantsUpdate(chat, [target], 'remove');
                await conn.sendMessage(chat, {
                    text: `✅ *VOTE KICK PASSED* — @${target.split('@')[0]} has been removed!\n\n🗳️ Votes: ${current}/${totalMembers}`,
                    mentions: [target]
                });
            } catch {
                await conn.sendMessage(chat, { text: '❌ Could not kick — bot may lack permission.' });
            }
        } else {
            await conn.sendMessage(chat, {
                text: `🗳️ Vote registered!\n\n👤 Target: @${target.split('@')[0]}\n✅ Current votes: *${current}/${needed}* needed`,
                mentions: [target]
            });
        }
    }
}

// ── POLL ──────────────────────────────────────────────────────────────────────
const pollSessions = {};

async function handlePoll(conn, m, db, prefix = '.') {
    const args = m.args || [];
    if (args.length < 3) {
        return m.reply(`📊 *POLL Command*\n\nUsage: ${prefix}poll <question> | <option1> | <option2> | ...\n\nExample:\n${prefix}poll Best fruit? | Apple | Mango | Banana`);
    }
    const raw = (m.text || '').replace(m.command, '').trim();
    const parts = raw.split('|').map(s => s.trim());
    if (parts.length < 3) return m.reply('❌ Please provide a question and at least 2 options separated by |');

    const question = parts[0];
    const options  = parts.slice(1).slice(0, 12); // WA allows max 12 options

    try {
        await conn.sendMessage(m.chat, {
            poll: {
                name: question,
                values: options,
                selectableCount: 1
            }
        }, { quoted: m });
    } catch {
        // Fallback text poll
        const text = `📊 *POLL: ${question}*\n\n` + options.map((o, i) => `${i+1}️⃣ ${o}`).join('\n') + `\n\n_Reply with the number to vote!_`;
        await conn.sendMessage(m.chat, { text }, { quoted: m });
    }
}

// ── AUTO-MOD STATUS DISPLAY ──────────────────────────────────────────────────
function getProtectionStatus(set) {
    const status = (v) => v ? '🟢 ON' : '🔴 OFF';
    return `
╔══[ 🛡️ *PROTECTION STATUS* ]══╗

🔗 Anti-Link       ${status(set.antilink)}
💬 Anti-Spam       ${status(set.antispam)}
🗑️ Anti-Delete     ${status(set.antidelete)}
🤬 Anti-Badword    ${status(set.antibadword)}
📵 Anti-Call       ${status(set.anticall)}
👁️ Anti-ViewOnce   ${status(set.antiviewonce)}
🔞 NSFW Filter     ${status(set.nsfw)}
🤖 Auto-Mod        ${status(set.automod)}
👋 Welcome         ${status(set.welcome)}
🚪 Goodbye         ${status(set.goodbye)}
🔒 Group Lock      ${status(set.lock)}
🏷️ Anti-HideTag    ${status(set.antihidetag)}

╚═══════════════════════════╝
_Use: .automod on/off to toggle all_`.trim();
}

// ── Handler for all toggle commands ──────────────────────────────────────────
/**
 * Handles: .antilink on/off, .antispam on/off, etc.
 * Call this in your nima.js case block.
 */
async function handleToggle(conn, m, db, feature) {
    if (!m.isGroup) return m.reply('❌ Groups only!');
    if (!m.isAdmin) return m.reply('❌ Admins only!');

    const set  = db.groups[m.chat];
    const arg  = (m.args?.[0] || '').toLowerCase();
    const name = feature.charAt(0).toUpperCase() + feature.slice(1);

    if (arg === 'on' || arg === 'true') {
        set[feature] = true;
        return conn.sendMessage(m.chat, {
            text: `✅ *${name}* has been turned *ON* in this group.`
        }, { quoted: m });
    }
    if (arg === 'off' || arg === 'false') {
        set[feature] = false;
        return conn.sendMessage(m.chat, {
            text: `🔴 *${name}* has been turned *OFF* in this group.`
        }, { quoted: m });
    }
    // Show current status
    return conn.sendMessage(m.chat, {
        text: `ℹ️ *${name}* is currently *${set[feature] ? '🟢 ON' : '🔴 OFF'}*\n\nUsage: .${feature} on / .${feature} off`
    }, { quoted: m });
}

// ── PAIR command ──────────────────────────────────────────────────────────────
async function handlePair(conn, m, db, prefix = '.') {
    if (!m.isCreator) return m.reply('👑 Owner only!');
    const number = m.args?.[0]?.replace(/[^0-9]/g, '');
    if (!number) return m.reply(`Usage: ${prefix}pair <phone_number>\nExample: ${prefix}pair 254712345678`);
    try {
        const code = await conn.requestPairingCode(number + '@s.whatsapp.net');
        await conn.sendMessage(m.chat, {
            text: `📱 *PAIRING CODE*\n\nNumber: +${number}\nCode: *${code}*\n\n⏰ Valid for 60 seconds\n📲 Enter this code in WhatsApp → Linked Devices → Link with Phone Number`,
        }, { quoted: m });
    } catch (e) {
        m.reply('❌ Failed to generate pairing code: ' + e.message);
    }
}

// ── ANTI-CALL (attach to conn.call event) ────────────────────────────────────
async function handleAntiCall(conn, call, db) {
    try {
        const set = db.set || {};
        if (!set.anticall) return;
        const callerId = call?.[0]?.from;
        if (!callerId) return;
        await conn.rejectCall(call[0].id, callerId);
        await conn.sendMessage(callerId, {
            text: `📵 *Auto-reject enabled!*\n\nSorry, the bot does not accept calls.\nUse *${global.listprefix?.[0] || '.'}help* for commands.`
        });
    } catch {}
}

// ── BAN/UNBAN (global, not group kick) ──────────────────────────────────────
async function handleBan(conn, m, db, isBanning = true) {
    if (!m.isCreator && !m.isOwner) return m.reply('👑 Owner only!');
    const target = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!target) return m.reply(`Tag or quote the user to ${isBanning ? 'ban' : 'unban'}!`);
    if (!db.users[target]) db.users[target] = {};
    db.users[target].banned = isBanning;
    await conn.sendMessage(m.chat, {
        text: isBanning
            ? `🔨 @${target.split('@')[0]} has been *globally banned* from using the bot.`
            : `✅ @${target.split('@')[0]} has been *unbanned* and can use the bot again.`,
        mentions: [target]
    }, { quoted: m });
}

module.exports = {
    TOGGLEABLE_FEATURES,
    handleProtections,
    handleAntiDelete,
    handleWelcome,
    handleVoteKick,
    handlePoll,
    handlePair,
    handleAntiCall,
    handleBan,
    handleToggle,
    getProtectionStatus,
    containsLink,
    containsBadWord,
    checkSpam,
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});
