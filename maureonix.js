// maureonix.js — Maureonix Command Router & Main Handler
// This is the primary entry point for processing commands after message parsing.

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// ═══════════════════════════════════════════════════════════════════════════════
// COMMAND LOADER — dynamically loads all command files from the commands/ folder
// ═══════════════════════════════════════════════════════════════════════════════

const commands = new Map();
const aliases = new Map();
const cooldowns = new Map();

/**
 * Load all command modules from the commands directory
 */
function loadCommands() {
    const commandsDir = path.join(__dirname, 'commands');
    if (!fs.existsSync(commandsDir)) {
        console.log(chalk.yellow('[CommandLoader] No commands/ directory found, creating...'));
        fs.mkdirSync(commandsDir, { recursive: true });
        return;
    }

    const categories = fs.readdirSync(commandsDir).filter(f => fs.statSync(path.join(commandsDir, f)).isDirectory());

    for (const category of categories) {
        const categoryPath = path.join(commandsDir, category);
        const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

        for (const file of files) {
            try {
                const filePath = path.join(categoryPath, file);
                delete require.cache[require.resolve(filePath)];
                const cmd = require(filePath);

                if (!cmd || !cmd.name) {
                    console.log(chalk.yellow(`[CommandLoader] Skipping ${file} — no name/export`));
                    continue;
                }

                cmd.category = category;
                cmd.filename = file;
                commands.set(cmd.name.toLowerCase(), cmd);

                if (cmd.aliases && Array.isArray(cmd.aliases)) {
                    for (const alias of cmd.aliases) {
                        aliases.set(alias.toLowerCase(), cmd.name.toLowerCase());
                    }
                }

                console.log(chalk.green(`[CommandLoader] Loaded: ${cmd.name} (${category})`));
            } catch (e) {
                console.error(chalk.red(`[CommandLoader] Failed to load ${file}:`), e.message);
            }
        }
    }

    console.log(chalk.cyan(`[CommandLoader] Total commands loaded: ${commands.size}`));
}

// Load commands on startup
loadCommands();

// ═══════════════════════════════════════════════════════════════════════════════
// COMMAND HANDLER — the main function that routes commands
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Main command handler — processes incoming messages and routes to commands
 * @param {Object} sock - Baileys socket instance
 * @param {Object} m - Message object (from smsg)
 * @param {Object} ctx - Context object with parsed command info
 */
async function cmdHandler(sock, m, ctx) {
    try {
        if (!ctx || !ctx.isCmd) return;

        const { command, args, text, prefix, isGroup, isOwner, sender, chat, pushName, botNumber, quotedMsg } = ctx;
        const cmdName = command.toLowerCase();

        // Find command
        let cmd = commands.get(cmdName);
        if (!cmd) {
            const aliasTarget = aliases.get(cmdName);
            if (aliasTarget) cmd = commands.get(aliasTarget);
        }

        if (!cmd) {
            // Unknown command — optionally reply
            // console.log(chalk.yellow(`[cmdHandler] Unknown command: ${cmdName}`));
            return;
        }

        // ── Permission checks ──
        if (cmd.isOwner && !isOwner) {
            await sock.sendMessage(chat, { text: '❌ This command is for owners only.' }, { quoted: m });
            return;
        }

        if (cmd.isGroup && !isGroup) {
            await sock.sendMessage(chat, { text: '❌ This command can only be used in groups.' }, { quoted: m });
            return;
        }

        if (cmd.isPrivate && isGroup) {
            await sock.sendMessage(chat, { text: '❌ This command can only be used in private chat.' }, { quoted: m });
            return;
        }

        // ── Cooldown check ──
        const now = Date.now();
        const cooldownKey = `${sender}-${cmd.name}`;
        const cooldownAmount = (cmd.cooldown || 3) * 1000;

        if (cooldowns.has(cooldownKey)) {
            const expiration = cooldowns.get(cooldownKey);
            if (now < expiration) {
                const timeLeft = Math.ceil((expiration - now) / 1000);
                await sock.sendMessage(chat, { text: `⏳ Please wait ${timeLeft}s before using *${cmd.name}* again.` }, { quoted: m });
                return;
            }
        }
        cooldowns.set(cooldownKey, now + cooldownAmount);
        setTimeout(() => cooldowns.delete(cooldownKey), cooldownAmount);

        // ── Limit check ──
        if (global.db?.users?.[sender]) {
            const user = global.db.users[sender];
            if (!user.premium && !user.vip && !isOwner && cmd.limit !== false) {
                if ((user.limit || 0) <= 0) {
                    await sock.sendMessage(chat, { text: '❌ You have run out of limit. Please contact the owner.' }, { quoted: m });
                    return;
                }
                user.limit -= 1;
            }
        }

        // ── Execute command ──
        console.log(chalk.cyan(`[CMD] ${pushName} (${sender}) → ${cmd.name} (${cmd.category})`));

        const result = await cmd.execute(sock, m, {
            command: cmd.name,
            args,
            text,
            prefix,
            isGroup,
            isOwner,
            sender,
            chat,
            pushName,
            botNumber,
            quotedMsg,
            store: ctx.store,
            conn: sock,
            m,
        });

        // ── Update command stats ──
        if (!global.db.cmd) global.db.cmd = {};
        if (!global.db.cmd[cmd.name]) {
            global.db.cmd[cmd.name] = { count: 0, lastUsed: null };
        }
        global.db.cmd[cmd.name].count += 1;
        global.db.cmd[cmd.name].lastUsed = new Date().toISOString();

        // ── Auto-delete command message if configured ──
        const autoDeleteMs = global.db?.set?.[botNumber]?.autodelete || 0;
        if (autoDeleteMs > 0 && result?.message) {
            setTimeout(async () => {
                try { await sock.sendMessage(chat, { delete: result.message.key }); } catch (e) {}
            }, autoDeleteMs * 1000);
        }

    } catch (e) {
        console.error(chalk.red('[cmdHandler] Error executing command:'), e.message);
        console.error(e.stack);
        try {
            await sock.sendMessage(ctx.chat, { text: `❌ An error occurred while executing the command.\n\n\`\`\`${e.message}\`\`\`` }, { quoted: m });
        } catch (sendErr) {}
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — the default function that message.js calls
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Main Maureonix handler — called by src/message.js for every message
 * @param {Object} sock - Baileys socket instance
 * @param {Object} msg - Raw message from Baileys
 * @param {Object} rawCtx - Context from MessagesUpsert
 */
async function maureonix(sock, msg, rawCtx) {
    try {
        if (!sock || !msg) return;

        // Skip if no text content
        const body = rawCtx?.body || '';
        const prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#%^&.©^]/gi.test(body)
            ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#%^&.©^]/gi)[0]
            : global.prefix?.[0] || '.';
        const isCmd = body.startsWith(prefix);

        // Build full context
        const ctx = {
            ...rawCtx,
            sock,
            msg,
            prefix,
            isCmd,
            command: isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : '',
            args: body.trim().split(/ +/).slice(1),
            text: body.trim().split(/ +/).slice(1).join(' '),
            isGroup: rawCtx?.isGroup || false,
            isOwner: global.owner?.some(([num]) => rawCtx?.sender?.includes(num)) || false,
            sender: rawCtx?.sender || msg.key?.participant || msg.key?.remoteJid || '',
            chat: rawCtx?.remoteJid || msg.key?.remoteJid || '',
            pushName: rawCtx?.pushName || msg.pushName || '',
            botNumber: sock.decodeJid(sock.user.id),
            quotedMsg: null,
            store: rawCtx?.store || null,
        };

        // Only process commands (messages starting with prefix)
        if (isCmd) {
            await cmdHandler(sock, msg, ctx);
        }

    } catch (e) {
        console.error(chalk.red('[maureonix] Error:'), e.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = maureonix;
module.exports.cmdHandler = cmdHandler;
module.exports.loadCommands = loadCommands;
module.exports.commands = commands;
module.exports.aliases = aliases;
