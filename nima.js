// ═══════════════════════════════════════════════════════════════════════════
//   🦊 MAUREONIX v5.0.0 – ULTIMATE COMMAND HANDLER
//   Created by Infinite Vybeflix
//   GitHub: https://github.com/luckyfelistine-bot/maureonix
// ═══════════════════════════════════════════════════════════════════════════
//
//   This file contains every command available in the bot.
//   It uses a command registry pattern for fast lookups and easy maintenance.
//   All new libraries (daily, health, finance, etc.) are imported at the top.
//
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
//  CORE MODULES & CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

require('./settings');                          // global variables & config
const fs = require('fs');
const path = require('path');
const util = require('util');
const axios = require('axios');
const chalk = require('chalk');
const crypto = require('crypto');
const fetch = require('node-fetch');
const moment = require('moment-timezone');
const { exec, spawn } = require('child_process');
const { performance } = require('perf_hooks');

// Baileys specific
const { getContentType, generateWAMessageContent } = require('baileys');

// ═══════════════════════════════════════════════════════════════════════════
//  CUSTOM LIBRARIES (all located in ./lib/)
// ═══════════════════════════════════════════════════════════════════════════

// Core helpers (original)
const { getRandom, getBuffer, fetchJson, runtime, clockString, sleep, isUrl,
        formatDate, formatp, generateProfilePicture, errorCache, normalize,
        updateSettings, parseMention, fixBytes, similarity, pickRandom,
        unsafeAgent, tarBackup } = require('./lib/function');

// Uploader & Converters
const { UguuSe, TelegraPh } = require('./lib/uploader');
const { toAudio, toPTT, toVideo, ffmpeg } = require('./lib/converter');
const { imageToWebp, videoToWebp, writeExif, gifToWebp } = require('./lib/exif');

// Games & Economy (original)
const { rdGame, iGame, tGame, gameSlot, gameCasinoSolo, gameSamgongSolo,
        gameMerampok, gameBegal, daily, buy, setLimit, addLimit, addMoney,
        setMoney, transfer, Blackjack, SnakeLadder } = require('./lib/game');

// TicTacToe (original class)
const TicTacToe = require('./lib/tictactoe');

// Math quiz generator
const { modes, genMath } = require('./lib/math');

// Template menu (list/button)
const setTemplateMenu = require('./lib/template_menu');

// ═══════════════════════════════════════════════════════════════════════════
//  NEW ULTIMATE LIBRARIES (v5.0.0)
// ═══════════════════════════════════════════════════════════════════════════

// AI & API Wrappers
const Poe = require('./lib/poe');
const AI = require('./lib/ai');
const Movie = require('./lib/movie');
const Search = require('./lib/search');
const Tools = require('./lib/tools');
const Fun = require('./lib/fun');
const Economy = require('./lib/economy');
const Games = require('./lib/games');
const Admin = require('./lib/admin');
const { antiSpam } = require('./lib/antispam');
const db = require('./lib/database');
const { generateQuantumMenu } = require('./lib/menuimage');

// Daily Life & Lifestyle
const Daily = require('./lib/daily');
const Health = require('./lib/health');
const Finance = require('./lib/finance');
const Social = require('./lib/social');
const Dev = require('./lib/dev');
const Travel = require('./lib/travel');
const Food = require('./lib/food');

// Downloader (ultimate scraper)
const Scraper = require('./lib/scraper');

// ═══════════════════════════════════════════════════════════════════════════
//  COMMAND REGISTRY (Fast lookup & metadata)
// ═══════════════════════════════════════════════════════════════════════════

const Commands = new Map();      // name -> { handler, category, desc, ... }
const Aliases = new Map();       // alias -> primary name
const Cooldowns = new Map();     // command -> cooldown in ms

/**
 * Register a new command.
 * @param {string} name - Primary command name
 * @param {Function} handler - Async function (m, args, nimesha, ctx)
 * @param {object} opts - { category, desc, aliases, cooldown, premium, owner, admin, group, private }
 */
function cmd(name, handler, opts = {}) {
    const meta = {
        handler,
        category: opts.category || 'misc',
        desc: opts.desc || 'No description',
        cooldown: opts.cooldown || 0,
        premium: opts.premium || false,
        owner: opts.owner || false,
        admin: opts.admin || false,
        group: opts.group || false,
        private: opts.private || false
    };
    Commands.set(name, meta);
    if (opts.aliases) {
        opts.aliases.forEach(alias => Aliases.set(alias, name));
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format uptime seconds to human readable string.
 */
function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

/**
 * Get all categories with their command names.
 */
function getCategories() {
    const cats = {};
    for (const [name, meta] of Commands) {
        if (!cats[meta.category]) cats[meta.category] = [];
        cats[meta.category].push(name);
    }
    return cats;
}

/**
 * Escape markdown characters.
 */
function escapeMd(text) {
    return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

/**
 * Helper for category icons in menu.
 */
function getCategoryIcon(cat) {
    const icons = {
        general: '🤖', group: '👥', downloaders: '⬇️', ai: '🧠', sticker: '🎨',
        fun: '😂', games: '🎮', search: '🔍', movies: '🎬', economy: '💰',
        admin: '🛡️', owner: '👑', daily: '📅', health: '💪', finance: '📊',
        social: '📱', dev: '💻', travel: '✈️', food: '🍔', nsfw: '🔞'
    };
    return icons[cat] || '📌';
}

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: GENERAL (Core bot info & utilities)
// ═══════════════════════════════════════════════════════════════════════════

cmd('alive', async (m, args, nimesha, ctx) => {
    const aliveText = `╭━═✦〔 Maureonix 〕✦═━╮
╰═✪═════════════════✪═╯

✅ *Bot is alive!*
━━━━━━━━━━━━━━━━━━━━━━
📅 *Date:* ${moment.tz('Africa/Nairobi').format('DD/MM/YYYY')}
🕐 *Time:* ${moment.tz('Africa/Nairobi').format('HH:mm:ss')}
⏱️ *Uptime:* ${formatUptime(process.uptime())}
🤖 *Bot:* ${global.botname || 'Maureonix'}
👑 *Owner:* ${global.ownerName || 'Infinite Vybeflix'}
🔧 *Prefix:* ${ctx.prefix}
📡 *Status:* Online ✅
━━━━━━━━━━━━━━━━━━━━━━
${global.footer || '> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX'}`;

    const buttons = [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📋 Menu', id: `${ctx.prefix}menu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⚡ Speed', id: `${ctx.prefix}speed` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⏱️ Runtime', id: `${ctx.prefix}runtime` }) }
    ];
    await nimesha.sendListMsg(m.chat, {
        text: aliveText,
        footer: '© Maureonix',
        mentions: [m.sender],
        buttons
    }, { quoted: m });
}, { category: 'general', desc: 'Check if bot is online', aliases: ['bot'] });

cmd('ping', async (m, args, nimesha, ctx) => {
    const start = Date.now();
    const pingMsg = await nimesha.sendMessage(m.chat, { text: '🏓 *Pinging...*' }, { quoted: m });
    const pingTime = Date.now() - start;
    await nimesha.sendMessage(m.chat, {
        text: `🏓 *PONG!*\n━━━━━━━━━━━━━━━━━━━━━━\n⚡ *Response:* ${pingTime}ms\n📡 *Status:* ${pingTime < 500 ? '🟢 Excellent' : pingTime < 1000 ? '🟡 Good' : '🔴 Slow'}\n⏱️ *Uptime:* ${formatUptime(process.uptime())}\n━━━━━━━━━━━━━━━━━━━━━━\n${global.footer}`,
        edit: pingMsg.key
    });
}, { category: 'general', desc: 'Check bot response time' });

cmd('runtime', async (m, args, nimesha) => {
    await m.reply(`⏱️ *BOT RUNTIME*\n━━━━━━━━━━━━━━━━━━━━━━\n🚀 *Running since start:*\n${formatUptime(process.uptime())}\n━━━━━━━━━━━━━━━━━━━━━━\n${global.footer}`);
}, { category: 'general', desc: 'Show bot uptime', aliases: ['uptime'] });

cmd('speed', async (m, args, nimesha) => {
    const speedMsg = await m.reply('⚡ *Running speed test...*');
    try {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execPromise = promisify(exec);
        const { stdout, stderr } = await execPromise('python3 speed.py --share');
        const result = stdout?.trim() || stderr?.trim() || '❌ Speed test failed';
        await nimesha.sendMessage(m.chat, { text: result, edit: speedMsg.key });
    } catch (e) {
        await nimesha.sendMessage(m.chat, { text: `❌ Speed test error: ${e.message}`, edit: speedMsg.key });
    }
}, { category: 'general', desc: 'Test internet speed' });

cmd('info', async (m, args, nimesha, ctx) => {
    const buttons = [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📋 Menu', id: `${ctx.prefix}menu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '✅ Alive', id: `${ctx.prefix}alive` }) }
    ];
    await nimesha.sendListMsg(m.chat, {
        text: `╭━═✦〔 Maureonix 〕✦═━╮
╰═✪═════════════════✪═╯

🤖 *Bot Name:* ${global.botname || 'Maureonix'}
👑 *Owner:* ${global.ownerName || 'Infinite Vybeflix'}
📱 *Platform:* WhatsApp
🔧 *Prefix:* ${ctx.prefix}
📅 *Date:* ${moment.tz('Africa/Nairobi').format('DD/MM/YYYY')}
🕐 *Time:* ${moment.tz('Africa/Nairobi').format('HH:mm:ss')}
⏱️ *Uptime:* ${formatUptime(process.uptime())}
🌐 *GitHub:* ${global.my?.gh || 'https://github.com/luckyfelistine-bot/maureonix'}
━━━━━━━━━━━━━━━━━━━━━━
${global.footer}`,
        footer: '© Maureonix',
        mentions: [m.sender],
        buttons
    }, { quoted: m });
}, { category: 'general', desc: 'Bot information', aliases: ['owner', 'dev'] });

cmd('menu', async (m, args, nimesha, ctx) => {
    // Attempt to generate quantum image menu
    try {
        const buf = await generateQuantumMenu({
            width: 1080,
            height: 1920,
            theme: 'maureonix',
            botName: global.botname || 'MAUREONIX',
            subtitle: 'ULTIMATE v5.0',
            user: m.pushName || 'User',
            prefix: ctx.prefix,
            totalCmds: Commands.size,
            time: moment.tz('Africa/Nairobi').format('HH:mm:ss'),
            date: moment.tz('Africa/Nairobi').format('DD/MM/YYYY'),
            ownerName: global.ownerName || 'Infinite Vybeflix',
            sections: Object.entries(getCategories()).slice(0, 8).map(([cat, cmds]) => ({
                icon: getCategoryIcon(cat),
                title: cat.toUpperCase(),
                content: cmds.slice(0, 5).join(', ') + '...'
            }))
        });
        await nimesha.sendMessage(m.chat, {
            image: buf,
            caption: `╭━═✦〔 Maureonix 〕✦═━╮\n╰═✪═════════════════✪═╯\n\n👋 Hello *${m.pushName || 'User'}*!\n🔧 Prefix: *${ctx.prefix}*\n📊 Commands: *${Commands.size}+*\n\n_Swipe carousel or use ${ctx.prefix}help <command>_`,
            footer: '© Maureonix Quantum Interface',
            buttons: [
                { buttonId: `${ctx.prefix}botmenu`, buttonText: { displayText: '🤖 BOT' }, type: 1 },
                { buttonId: `${ctx.prefix}groupmenu`, buttonText: { displayText: '👥 GROUP' }, type: 1 },
                { buttonId: `${ctx.prefix}downloadmenu`, buttonText: { displayText: '⬇️ DOWNLOAD' }, type: 1 }
            ],
            headerType: 4
        }, { quoted: m });
        return;
    } catch (e) {
        console.log('Quantum menu failed, falling back to carousel:', e.message);
    }

    // Fallback: Carousel menu with PNGs (using server.js endpoints)
    const set = global.db?.set?.[nimesha.decodeJid(nimesha.user.id)] || {};
    const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN
        ? 'https://' + process.env.RAILWAY_PUBLIC_DOMAIN
        : `http://localhost:${process.env.PORT || 3000}`;

    // Ensure menu cards are generated
    if (global.generateMenuCards) {
        await global.generateMenuCards({
            botName: set?.botname || global.botname,
            ownerName: global.ownerName,
            botNumber: nimesha.decodeJid(nimesha.user.id).split('@')[0],
            ownerNum: (global.owner?.[0] || '254116903500').replace(/[^0-9]/g, ''),
            prefix: ctx.prefix
        }).catch(() => {});
    }

    const carouselCards = [
        { id: 'bot', body: '🤖 *BOT COMMANDS*\n━━━━━━━━━━━━━━━━━\n▸ .alive\n▸ .bot\n▸ .ping\n▸ .speed\n▸ .runtime\n▸ .info\n▸ .owner\n▸ .vv\n▸ .jid\n▸ .github\n▸ .groupinfo\n▸ .staff', footer: '👆 Tap — BOT menu', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🤖 Open BOT Menu', id: ctx.prefix + 'botmenu' }) }] },
        { id: 'group', body: '👥 *GROUP COMMANDS*\n━━━━━━━━━━━━━━━━━\n▸ .tagall\n▸ .hidetag\n▸ .add\n▸ .kick\n▸ .promote\n▸ .demote\n▸ .welcome\n▸ .setname\n▸ .setdesc\n▸ .linkgrup\n▸ .revoke', footer: '👆 Tap — GROUP menu', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👥 Open GROUP Menu', id: ctx.prefix + 'groupmenu' }) }] },
        { id: 'download', body: '⬇️ *DOWNLOAD*\n━━━━━━━━━━━━━━━━━\n▸ .song\n▸ .mp3\n▸ .play\n▸ .ytmp3\n▸ .video\n▸ .mp4\n▸ .ytmp4\n▸ .tiktok\n▸ .instagram\n▸ .facebook\n▸ .spotify', footer: '👆 Tap — DOWNLOAD menu', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⬇️ Open DOWNLOAD', id: ctx.prefix + 'downloadmenu' }) }] },
        { id: 'ai', body: '🤖 *AI COMMANDS*\n━━━━━━━━━━━━━━━━━\n▸ .gpt\n▸ .poe\n▸ .gemini\n▸ .llama3\n▸ .deepseek\n▸ .ai\n▸ .imagine\n▸ .flux\n▸ .sora\n▸ .translate\n▸ .summarize', footer: '👆 Tap — AI menu', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🤖 Open AI Menu', id: ctx.prefix + 'aimenu' }) }] },
        { id: 'sticker', body: '🎨 *STICKER & IMAGE*\n━━━━━━━━━━━━━━━━━\n▸ .sticker\n▸ .attp\n▸ .simage\n▸ .removebg\n▸ .blur\n▸ .ss\n▸ .tts\n▸ .trt\n▸ .qc\n▸ .toimg', footer: '👆 Tap — STICKER menu', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎨 Open STICKER', id: ctx.prefix + 'stickersmenu' }) }] },
        { id: 'fun', body: '😂 *FUN & ENTERTAINMENT*\n━━━━━━━━━━━━━━━━━\n▸ .joke\n▸ .quote\n▸ .fact\n▸ .8ball\n▸ .compliment\n▸ .insult\n▸ .hack\n▸ .ship\n▸ .flirt\n▸ .shayari', footer: '👆 Tap — FUN menu', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '😂 Open FUN Menu', id: ctx.prefix + 'funmenu' }) }] },
        { id: 'games', body: '🎮 *GAMES*\n━━━━━━━━━━━━━━━━━\n▸ .tictactoe\n▸ .suit\n▸ .chess\n▸ .akinator\n▸ .slot\n▸ .math\n▸ .blackjack\n▸ .wordle\n▸ .hangman\n▸ .connect4', footer: '👆 Tap — GAMES menu', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎮 Open GAMES', id: ctx.prefix + 'gamemenu' }) }] },
        { id: 'search', body: '🔍 *SEARCH & INFO*\n━━━━━━━━━━━━━━━━━\n▸ .google\n▸ .ytsearch\n▸ .define\n▸ .weather\n▸ .news\n▸ .lyrics\n▸ .movie\n▸ .anime\n▸ .wiki\n▸ .urban', footer: '👆 Tap — SEARCH menu', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔍 Open SEARCH', id: ctx.prefix + 'searchmenu' }) }] },
        { id: 'privacy', body: '🔐 *PRIVACY MANAGER*\n━━━━━━━━━━━━━━━━━\n▸ .privacy 1-3 — Last Seen\n▸ .privacy 4-5 — Online\n▸ .privacy 6-8 — Profile Pic\n▸ .privacy 9-11 — Status\n▸ .privacy 12-13 — Receipts\n▸ .privacy 14-16 — Groups\n▸ .privacy 17-20 — Disappearing\n▸ .privacy 21 — Block List', footer: '👆 Tap — PRIVACY menu', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔐 Open PRIVACY', id: ctx.prefix + 'privacy' }) }] },
    ].map(card => ({
        url: baseUrl + '/menucard/' + card.id,
        body: card.body,
        footer: card.footer,
        buttons: card.buttons
    }));

    await nimesha.sendCarouselMsg(
        m.chat,
        `╭━═✦〔 Maureonix 〕✦═━╮\n╰═✪═════════════════✪═╯\n\n👤 *User:* ${m.pushName || 'User'}\n🔧 *Prefix:* ${ctx.prefix}\n📅 ${moment.tz('Africa/Nairobi').format('DD/MM/YYYY')}  🕐 ${moment.tz('Africa/Nairobi').format('HH:mm:ss')}\n\n_Swipe and tap on a category_ 👉`,
        'Maureonix | By Infinite Vybeflix',
        carouselCards
    );
}, { category: 'general', desc: 'Show main menu', aliases: ['help', 'allmenu'] });

cmd('owner', async (m, args, nimesha) => {
    await nimesha.sendContact(m.chat, global.owner, m);
}, { category: 'general', desc: 'Show owner contact' });

cmd('delete', async (m, args, nimesha) => {
    if (!m.quoted) return m.reply('Reply to a message to delete');
    await nimesha.sendMessage(m.chat, { delete: m.quoted.key });
}, { category: 'general', desc: 'Delete a message', aliases: ['del'] });

cmd('react', async (m, args) => {
    if (!args[0]) return m.reply('Provide emoji');
    await m.react(args[0]);
}, { category: 'general', desc: 'React to a message with emoji' });

cmd('afk', async (m, args) => {
    global.db.afk = global.db.afk || {};
    global.db.afk[m.sender] = { reason: args.join(' ') || 'AFK', time: Date.now() };
    await m.reply(`😴 *AFK Set:* ${args.join(' ') || 'AFK'}`);
}, { category: 'general', desc: 'Set AFK status' });

cmd('unafk', async (m) => {
    if (global.db.afk?.[m.sender]) {
        delete global.db.afk[m.sender];
        await m.reply('🔙 Welcome back!');
    }
}, { category: 'general', desc: 'Remove AFK status' });

cmd('tos', async (m) => {
    await m.reply(`📜 *Terms of Service*\n1. Don't spam\n2. No illegal content\n3. Admin decisions are final\n4. Bot collects minimal data for economy/games\n5. We are not responsible for downloaded content`);
}, { category: 'general', desc: 'Show terms of service' });

cmd('report', async (m, args) => {
    if (!args.join(' ')) return m.reply('Provide issue');
    global.db.reports = global.db.reports || [];
    global.db.reports.push({ user: m.sender, issue: args.join(' '), date: Date.now() });
    await m.reply('📩 Report sent to owner');
}, { category: 'general', desc: 'Report an issue to the owner' });

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: AI COMMANDS (Multi‑model, image gen, translation)
// ═══════════════════════════════════════════════════════════════════════════

cmd('gpt', async (m, args, nimesha, ctx) => {
    if (!args.join(' ')) return m.reply('Usage: .gpt <question>');
    await m.reply('🧠 *POE/AI Processing...*');
    const res = await AI.ultimateAI(args.join(' '), m.sender, 'gpt');
    await m.reply(`🤖 *${res.provider.toUpperCase()}*\n\n${res.text}`);
}, { category: 'ai', desc: 'Chat with GPT', aliases: ['chatgpt', 'openai'] });

cmd('poe', async (m, args, nimesha) => {
    if (!args.join(' ')) return m.reply('Usage: .poe <question>');
    await m.reply('⚡ *Querying POE Claude-Opus...*');
    const res = await AI.poeChat(args.join(' '), 'Claude-Opus-4.6', m.sender);
    await m.reply(`🧠 *POE Response*\n\n${res}`);
}, { category: 'ai', desc: 'Chat with POE (Claude)', cooldown: 5000 });

cmd('gemini', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .gemini <question>');
    await m.reply('✨ *Gemini thinking...*');
    const res = await AI.gemini(args.join(' '));
    await m.reply(`♊ *Gemini:*\n\n${res}`);
}, { category: 'ai', desc: 'Ask Google Gemini' });

cmd('llama', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .llama <question>');
    const res = await AI.llama3(args.join(' '));
    await m.reply(`🦙 *Llama3:*\n\n${res}`);
}, { category: 'ai', desc: 'Ask Llama 3' });

cmd('deepseek', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .deepseek <question>');
    const res = await AI.deepseek(args.join(' '));
    await m.reply(`🐋 *DeepSeek:*\n\n${res}`);
}, { category: 'ai', desc: 'Ask DeepSeek' });

cmd('ai', async (m, args, nimesha) => {
    if (!args.join(' ')) return m.reply('Usage: .ai <question>');
    await m.reply('🌐 *Ultimate AI Chain...*');
    const res = await AI.ultimateAI(args.join(' '), m.sender, 'poe');
    await m.reply(`🎯 *${res.provider.toUpperCase()}*\n\n${res.text}`);
}, { category: 'ai', desc: 'Smart AI with fallback chain', aliases: ['ask', 'brain'] });

cmd('imagine', async (m, args, nimesha) => {
    if (!args.join(' ')) return m.reply('Usage: .imagine <prompt>');
    await m.reply('🎨 *Generating image...*');
    const url = await AI.imagine(args.join(' '));
    await nimesha.sendMessage(m.chat, { image: { url }, caption: `🎨 Prompt: ${args.join(' ')}` }, { quoted: m });
}, { category: 'ai', desc: 'Generate AI image', aliases: ['aiimage', 'draw', 'create'], cooldown: 10000 });

cmd('poeimage', async (m, args, nimesha) => {
    if (!args.join(' ')) return m.reply('Usage: .poeimage <prompt>');
    await m.reply('🖼️ *POE Image Gen...*');
    const res = await Poe.generateImage(args.join(' '), 'FLUX-pro');
    const url = res.data?.[0]?.url;
    if (url) await nimesha.sendMessage(m.chat, { image: { url }, caption: `🖼️ ${args.join(' ')}` }, { quoted: m });
    else m.reply('Failed');
}, { category: 'ai', desc: 'Generate image with POE', cooldown: 15000 });

cmd('translate', async (m, args) => {
    if (args.length < 2) return m.reply('Usage: .translate <lang> <text>');
    const lang = args[0];
    const text = args.slice(1).join(' ');
    const res = await AI.translate(text, lang);
    await m.reply(`🌐 *Translated (${lang}):*\n${res}`);
}, { category: 'ai', desc: 'Translate text', aliases: ['tr'] });

cmd('tts', async (m, args, nimesha) => {
    if (!args.join(' ')) return m.reply('Usage: .tts <text>');
    const gTTS = require('gtts');
    const tts = new gTTS(args.join(' '), 'en');
    const file = path.join(__dirname, 'database', 'temp', `${Date.now()}.mp3`);
    tts.save(file, async () => {
        await nimesha.sendMessage(m.chat, { audio: fs.readFileSync(file), mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
        fs.unlinkSync(file);
    });
}, { category: 'ai', desc: 'Text to speech' });

cmd('summarize', async (m, args, nimesha, ctx) => {
    const msgs = ctx.store?.messages[m.chat]?.array?.slice(-30) || [];
    const convo = msgs.map(msg => msg.body).filter(Boolean).join('\n');
    if (!convo) return m.reply('No recent conversation');
    const res = await AI.summarize(convo);
    await m.reply(`📋 *Summary:*\n\n${res.text}`);
}, { category: 'ai', desc: 'Summarize conversation' });

cmd('code', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .code <description>');
    const lang = args[0].startsWith('--') ? args.shift().slice(2) : 'javascript';
    const res = await AI.codeAI(args.join(' '), lang);
    await m.reply(`💻 *${lang.toUpperCase()} Code:*\n\n\`\`\`${lang}\n${res.text}\n\`\`\``);
}, { category: 'ai', desc: 'Generate code', aliases: ['coding', 'program'] });

cmd('brainrot', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .brainrot <text>');
    const res = await AI.brainrot(args.join(' '));
    await m.reply(`🧠 *Brainrot Mode:*\n${res.text}`);
}, { category: 'ai', desc: 'Convert text to brainrot slang' });

cmd('roastai', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .roastai <name>');
    const res = await AI.roast(args.join(' '));
    await m.reply(`🔥 *AI Roast:*\n${res.text}`);
}, { category: 'ai', desc: 'AI generated roast' });

cmd('rizz', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .rizz <situation>');
    const res = await AI.rizz(args.join(' '));
    await m.reply(`💘 *Rizz:*\n${res.text}`);
}, { category: 'ai', desc: 'Get a pickup line' });

cmd('clearmemory', async (m) => {
    AI.clearMemory(m.sender);
    await m.reply('🧹 AI memory cleared');
}, { category: 'ai', desc: 'Clear AI conversation history' });

cmd('poebalance', async (m) => {
    try {
        const bal = await Poe.getBalance();
        await m.reply(`💰 *POE Balance:* ${bal.current_point_balance} points`);
    } catch (e) {
        await m.reply('❌ Failed to fetch balance');
    }
}, { category: 'ai', desc: 'Check POE API balance', owner: true });

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: MOVIES (OMDB Pro Integration)
// ═══════════════════════════════════════════════════════════════════════════

cmd('movie', async (m, args, nimesha) => {
    if (!args.join(' ')) return m.reply('Usage: .movie <title>');
    await m.reply('🎬 *Searching IMDB...*');
    try {
        const movies = await Movie.search(args.join(' '));
        if (!movies?.length) return m.reply('No results');
        const list = movies.slice(0, 5).map((mv, i) => `${i+1}. *${mv.Title}* (${mv.Year})`).join('\n');
        await m.reply(`🎬 *Results:*\n${list}\n\nUse .imdb <id> for details`);
    } catch (e) { m.reply(`❌ ${e.message}`); }
}, { category: 'movies', desc: 'Search for a movie', aliases: ['film', 'cinema'] });

cmd('imdb', async (m, args, nimesha) => {
    if (!args[0]) return m.reply('Usage: .imdb <imdb-id>');
    try {
        const data = await Movie.getById(args[0]);
        await nimesha.sendMessage(m.chat, { image: { url: data.Poster !== 'N/A' ? data.Poster : undefined }, caption: Movie.formatMovie(data) }, { quoted: m });
    } catch (e) { m.reply(`❌ ${e.message}`); }
}, { category: 'movies', desc: 'Get movie details by IMDB ID' });

cmd('rating', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .rating <imdb-id>');
    const r = await Movie.getRatings(args[0]);
    await m.reply(`⭐ *Ratings*\nIMDB: ${r.imdb}/10\n🍅 Rotten: ${r.rotten}\nⓂ️ Metacritic: ${r.metacritic}/100`);
}, { category: 'movies', desc: 'Get movie ratings' });

cmd('series', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .series <name>');
    const data = await Movie.getByTitle(args.join(' '), '', 'full');
    if (data.Type !== 'series') return m.reply('Not a series');
    await m.reply(`📺 *${data.Title}*\n📅 Seasons: ${data.totalSeasons}\n⭐ ${data.imdbRating}/10\n📖 ${data.Plot}`);
}, { category: 'movies', desc: 'Search for a TV series' });

cmd('actor', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .actor <name>');
    await m.reply('🎭 Use .movie <actor name> to find their films');
}, { category: 'movies', desc: 'Find movies by actor (redirects to .movie)' });

// ============================================================
// CONTINUED IN PART 2 – DOWNLOADERS, SEARCH, FUN, ECONOMY, GAMES
// ============================================================

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: DOWNLOADERS (50+ commands)
// ═══════════════════════════════════════════════════════════════════════════

cmd('song', async (m, args, nimesha) => {
    if (!args.join(' ')) return m.reply('Usage: .song <query/url>');
    await m.reply('🎵 *Downloading audio...*');
    try {
        let url = args[0];
        if (!url.includes('youtube') && !url.includes('youtu.be')) {
            const yts = require('yt-search');
            const sr = await yts(args.join(' '));
            if (sr.videos?.length) url = sr.videos[0].url;
            else throw new Error('No results');
        }
        const audio = await Scraper.ytMp3(url);
        await nimesha.sendMessage(m.chat, { 
            audio: { url: audio.url }, mimetype: 'audio/mpeg', 
            fileName: `${audio.title}.mp3`, ptt: false 
        }, { quoted: m });
    } catch (e) { m.reply(`❌ ${e.message}`); }
}, { category: 'downloaders', desc: 'Download YouTube audio', aliases: ['mp3', 'ytmp3', 'play'] });

cmd('video', async (m, args, nimesha) => {
    if (!args[0]) return m.reply('Usage: .video <url>');
    await m.reply('📥 *Downloading video...*');
    try {
        const v = await Scraper.ytMp4(args[0]);
        await nimesha.sendMessage(m.chat, { video: { url: v.url }, caption: v.title }, { quoted: m });
    } catch (e) { m.reply(`❌ ${e.message}`); }
}, { category: 'downloaders', desc: 'Download YouTube video', aliases: ['mp4', 'ytmp4'] });

cmd('tiktok', async (m, args, nimesha) => {
    if (!args[0]) return m.reply('Usage: .tiktok <url>');
    await m.reply('🎬 *Fetching TikTok...*');
    try {
        const tt = await Scraper.tiktokDownload(args[0]);
        if (tt.type === 'video') await nimesha.sendMessage(m.chat, { video: { url: tt.url }, caption: tt.title || 'TikTok' }, { quoted: m });
        else if (tt.items) for (const img of tt.items.slice(0, 10)) await nimesha.sendMessage(m.chat, { image: { url: img } }, { quoted: m });
    } catch (e) { m.reply(`❌ ${e.message}`); }
}, { category: 'downloaders', desc: 'Download TikTok video', aliases: ['tt', 'tik'] });

cmd('instagram', async (m, args, nimesha) => {
    if (!args[0]) return m.reply('Usage: .ig <url>');
    await m.reply('📸 *Downloading...*');
    try {
        const ig = await Scraper.igDownload(args[0]);
        if (ig.type === 'image') await nimesha.sendMessage(m.chat, { image: { url: ig.url } }, { quoted: m });
        else if (ig.type === 'video') await nimesha.sendMessage(m.chat, { video: { url: ig.url } }, { quoted: m });
        else if (ig.items) for (const item of ig.items.slice(0, 10)) {
            await nimesha.sendMessage(m.chat, item.is_video ? { video: { url: item.url } } : { image: { url: item.url } }, { quoted: m });
        }
    } catch (e) { m.reply(`❌ ${e.message}`); }
}, { category: 'downloaders', desc: 'Download Instagram post', aliases: ['ig', 'insta'] });

cmd('facebook', async (m, args, nimesha) => {
    if (!args[0]) return m.reply('Usage: .fb <url>');
    await m.reply('📱 *Downloading FB...*');
    try {
        const fb = await Scraper.fbDownload(args[0]);
        await nimesha.sendMessage(m.chat, { video: { url: fb.hd || fb.sd }, caption: 'Facebook Video' }, { quoted: m });
    } catch (e) { m.reply(`❌ ${e.message}`); }
}, { category: 'downloaders', desc: 'Download Facebook video', aliases: ['fb'] });

cmd('twitter', async (m, args, nimesha) => {
    if (!args[0]) return m.reply('Usage: .twitter <url>');
    await m.reply('🐦 *Downloading X...*');
    try {
        const tw = await Scraper.twitterDownload(args[0]);
        await nimesha.sendMessage(m.chat, { video: { url: tw.url } }, { quoted: m });
    } catch (e) { m.reply(`❌ ${e.message}`); }
}, { category: 'downloaders', desc: 'Download Twitter/X video', aliases: ['x', 'twit'] });

cmd('spotify', async (m, args, nimesha) => {
    if (!args[0]) return m.reply('Usage: .spotify <track url>');
    await m.reply('🎧 *Downloading...*');
    try {
        const sp = await Scraper.spotifyDownload(args[0]);
        await nimesha.sendMessage(m.chat, { audio: { url: sp.url }, mimetype: 'audio/mpeg', fileName: `${sp.title}.mp3` }, { quoted: m });
    } catch (e) { m.reply(`❌ ${e.message}`); }
}, { category: 'downloaders', desc: 'Download Spotify track', aliases: ['sp'] });

cmd('pinterest', async (m, args, nimesha) => {
    if (!args[0]) return m.reply('Usage: .pinterest <url>');
    try {
        const pin = await Scraper.pinterestDownload(args[0]);
        await nimesha.sendMessage(m.chat, { [pin.type]: { url: pin.url } }, { quoted: m });
    } catch (e) { m.reply(`❌ ${e.message}`); }
}, { category: 'downloaders', desc: 'Download Pinterest media', aliases: ['pin'] });

cmd('reddit', async (m, args, nimesha) => {
    if (!args[0]) return m.reply('Usage: .reddit <url>');
    try {
        const rd = await Scraper.redditDownload(args[0]);
        await nimesha.sendMessage(m.chat, { [rd.type]: { url: rd.url } }, { quoted: m });
    } catch (e) { m.reply(`❌ ${e.message}`); }
}, { category: 'downloaders', desc: 'Download Reddit media', aliases: ['red'] });

cmd('mediafire', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .mediafire <url>');
    try {
        const mf = await Scraper.mediafireDownload(args[0]);
        await m.reply(`📁 *Download:*\n${mf.url}`);
    } catch (e) { m.reply(`❌ ${e.message}`); }
}, { category: 'downloaders', desc: 'Get MediaFire download link', aliases: ['mf'] });

cmd('apk', async (m, args, nimesha) => {
    if (!args[0]) return m.reply('Usage: .apk <package name>');
    try {
        const apk = await Scraper.apkDownload(args[0]);
        await nimesha.sendMessage(m.chat, { document: apk.buffer, mimetype: 'application/vnd.android.package-archive', fileName: `${args[0]}.apk` }, { quoted: m });
    } catch (e) { m.reply(`❌ ${e.message}`); }
}, { category: 'downloaders', desc: 'Download APK from Google Play', aliases: ['app'] });

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: SEARCH & INFO (40+ commands)
// ═══════════════════════════════════════════════════════════════════════════

cmd('google', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .google <query>');
    const res = await Search.googleSearch(args.join(' '));
    await m.reply(`🔍 *Google Results*\n\n${res || 'No results'}`);
}, { category: 'search', desc: 'Search Google', aliases: ['g', 'search'] });

cmd('wiki', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .wiki <query>');
    const res = await Search.wikiSearch(args.join(' '));
    await m.reply(`📚 ${res}`);
}, { category: 'search', desc: 'Search Wikipedia', aliases: ['wikipedia'] });

cmd('github', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .github <repo>');
    const res = await Search.githubSearch(args.join(' '));
    await m.reply(`💻 *GitHub*\n\n${res}`);
}, { category: 'search', desc: 'Search GitHub repositories' });

cmd('npm', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .npm <package>');
    const res = await Search.npmSearch(args[0]);
    await m.reply(`📦 *NPM*\n\n${res}`);
}, { category: 'search', desc: 'Search NPM packages' });

cmd('urban', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .urban <word>');
    const res = await Search.urbanDictionary(args.join(' '));
    await m.reply(`📖 *Urban Dictionary*\n\n${res}`);
}, { category: 'search', desc: 'Search Urban Dictionary' });

cmd('anime', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .anime <title>');
    const res = await Search.animeSearch(args.join(' '));
    await m.reply(`📺 *Anime*\n\n${res}`);
}, { category: 'search', desc: 'Search for anime' });

cmd('manga', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .manga <title>');
    const res = await Search.mangaSearch(args.join(' '));
    await m.reply(`📖 *Manga*\n\n${res}`);
}, { category: 'search', desc: 'Search for manga' });

cmd('weather', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .weather <city>');
    const res = await Tools.weather(args.join(' '));
    await m.reply(res);
}, { category: 'search', desc: 'Get weather forecast' });

cmd('news', async (m) => {
    const res = await Tools.news();
    await m.reply(`📰 *News*\n\n${res}`);
}, { category: 'search', desc: 'Latest news headlines' });

cmd('covid', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .covid <country>');
    const res = await Tools.covid(args.join(' '));
    await m.reply(res);
}, { category: 'search', desc: 'COVID-19 statistics' });

cmd('crypto', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .crypto <bitcoin>');
    const res = await Tools.cryptoPrice(args[0].toLowerCase());
    await m.reply(res);
}, { category: 'search', desc: 'Cryptocurrency price', aliases: ['bitcoin', 'eth'] });

cmd('forex', async (m, args) => {
    if (args.length < 2) return m.reply('Usage: .forex USD EUR');
    const res = await Tools.forex(args[0], args[1]);
    await m.reply(res);
}, { category: 'search', desc: 'Currency exchange rate' });

cmd('iplookup', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .iplookup <ip>');
    const res = await Tools.ipLookup(args[0]);
    await m.reply(res);
}, { category: 'search', desc: 'IP address lookup' });

cmd('whois', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .whois <domain>');
    const res = await Tools.whois(args[0]);
    await m.reply(res);
}, { category: 'search', desc: 'Domain WHOIS lookup' });

cmd('dns', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .dns <domain>');
    const res = await Tools.dnsLookup(args[0]);
    await m.reply(`📡 *DNS*\n\`\`\`${res}\`\`\``);
}, { category: 'search', desc: 'DNS lookup' });

cmd('qr', async (m, args, nimesha) => {
    if (!args.join(' ')) return m.reply('Usage: .qr <text>');
    const buf = await Tools.qr(args.join(' '));
    await nimesha.sendMessage(m.chat, { image: buf, caption: 'QR Code' }, { quoted: m });
}, { category: 'search', desc: 'Generate QR code' });

cmd('shorten', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .shorten <url>');
    const res = await Tools.shorten(args[0]);
    await m.reply(`🔗 *Short URL:*\n${res}`);
}, { category: 'search', desc: 'Shorten a URL' });

cmd('calc', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .calc 2+2');
    try {
        const res = Function('"use strict";return (' + args.join(' ') + ')')();
        await m.reply(`🧮 *Result:* ${res}`);
    } catch { await m.reply('Invalid expression'); }
}, { category: 'search', desc: 'Calculator' });

cmd('base64', async (m, args) => {
    if (args.length < 2) return m.reply('Usage: .base64 encode/decode <text>');
    const res = await Tools.base64(args[0], args.slice(1).join(' '));
    await m.reply(`🔤 ${res}`);
}, { category: 'search', desc: 'Base64 encode/decode' });

cmd('hash', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .hash <text>');
    const algo = args[0].startsWith('--') ? args.shift().slice(2) : 'sha256';
    const res = await Tools.hashGen(args.join(' '), algo);
    await m.reply(`🔐 *${algo}:*\n${res}`);
}, { category: 'search', desc: 'Generate hash' });

cmd('morse', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .morse <text>');
    const res = await Tools.morse(args.join(' '));
    await m.reply(`📻 *Morse:*\n\`\`\`${res}\`\`\``);
}, { category: 'search', desc: 'Convert text to Morse code' });

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: FUN & SOCIAL (50+ commands)
// ═══════════════════════════════════════════════════════════════════════════

cmd('joke', async (m) => {
    const res = await Fun.joke();
    await m.reply(res);
}, { category: 'fun', desc: 'Get a random joke' });

cmd('meme', async (m, args, nimesha) => {
    const res = await Fun.meme();
    await nimesha.sendMessage(m.chat, { image: { url: res.image }, caption: `${res.caption}\n📁 r/${res.subreddit}` }, { quoted: m });
}, { category: 'fun', desc: 'Get a random meme' });

cmd('quote', async (m) => {
    const res = await Fun.quote();
    await m.reply(res);
}, { category: 'fun', desc: 'Inspirational quote' });

cmd('fact', async (m) => {
    const res = await Fun.fact();
    await m.reply(res);
}, { category: 'fun', desc: 'Random fact' });

cmd('ship', async (m, args) => {
    if (args.length < 2) return m.reply('Usage: .ship @user1 @user2');
    const res = await Fun.ship(args[0], args[1]);
    await m.reply(res);
}, { category: 'fun', desc: 'Love compatibility' });

cmd('wyr', async (m) => {
    const res = await Fun.wouldYouRather();
    await m.reply(res);
}, { category: 'fun', desc: 'Would you rather?', aliases: ['wouldyourather'] });

cmd('8ball', async (m, args) => {
    if (!args.join(' ')) return m.reply('Ask a question');
    const res = await Fun.eightBall(args.join(' '));
    await m.reply(res);
}, { category: 'fun', desc: 'Magic 8-ball', aliases: ['8b'] });

cmd('roll', async (m, args) => {
    const res = await Fun.rollDice(parseInt(args[0]) || 6);
    await m.reply(res);
}, { category: 'fun', desc: 'Roll a dice' });

cmd('flip', async (m) => {
    await m.reply(await Fun.flipCoin());
}, { category: 'fun', desc: 'Flip a coin', aliases: ['coin'] });

cmd('roast', async (m, args) => {
    if (args[0]) {
        const res = await AI.roast(args.join(' '));
        await m.reply(`🔥 ${res.text}`);
    } else {
        await m.reply(await Fun.roast());
    }
}, { category: 'fun', desc: 'Get roasted' });

cmd('compliment', async (m, args) => {
    if (m.quoted) await m.reply(`🌟 @${m.quoted.sender.split('@')[0]}, ${(await Fun.compliment()).replace('🌟 ', '')}`, { mentions: [m.quoted.sender] });
    else await m.reply(await Fun.compliment());
}, { category: 'fun', desc: 'Give a compliment' });

cmd('truth', async (m) => {
    await m.reply(await Fun.truth());
}, { category: 'fun', desc: 'Truth or Dare: Truth' });

cmd('dare', async (m) => {
    await m.reply(await Fun.dare());
}, { category: 'fun', desc: 'Truth or Dare: Dare' });

cmd('emojimix', async (m, args, nimesha) => {
    if (args.length < 2) return m.reply('Usage: .emojimix 😂 🤔');
    const url = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u${args[0].codePointAt(0).toString(16)}-u${args[1].codePointAt(0).toString(16)}.png`;
    try {
        const buf = await fetch(url).then(r => r.buffer());
        await nimesha.sendMessage(m.chat, { image: buf, caption: `${args[0]} + ${args[1]}` }, { quoted: m });
    } catch { m.reply('Combo not found'); }
}, { category: 'fun', desc: 'Mix two emojis' });

cmd('fancy', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .fancy <text>');
    const text = args.join(' ');
    const fancy = text.split('').map(c => {
        const code = c.charCodeAt(0);
        return code >= 65 && code <= 90 ? String.fromCharCode(0x1D504 + code - 65) :
               code >= 97 && code <= 122 ? String.fromCharCode(0x1D51E + code - 97) : c;
    }).join('');
    await m.reply(fancy);
}, { category: 'fun', desc: 'Convert text to fancy font' });

cmd('gay', async (m, args) => {
    const target = m.mentionedJid?.[0] || m.sender;
    const pct = Math.floor(Math.random() * 101);
    await m.reply(`🏳️‍🌈 *Gay Rate*\n@${target.split('@')[0]} is ${pct}% gay`, { mentions: [target] });
}, { category: 'fun', desc: 'How gay are you?' });

cmd('simpcard', async (m, args, nimesha) => {
    const target = m.mentionedJid?.[0] || m.sender;
    await nimesha.sendMessage(m.chat, { image: { url: 'https://some-random-api.com/canvas/simpcard?avatar=' + encodeURIComponent(await nimesha.profilePictureUrl(target, 'image').catch(() => 'https://i.imgur.com/2Jz1DkP.png')) }, caption: `🃏 Simp Card` }, { quoted: m });
}, { category: 'fun', desc: 'Generate a simp card' });

cmd('jail', async (m, args, nimesha) => {
    const target = m.mentionedJid?.[0] || m.sender;
    const pp = await nimesha.profilePictureUrl(target, 'image').catch(() => 'https://i.imgur.com/2Jz1DkP.png');
    await nimesha.sendMessage(m.chat, { image: { url: `https://some-random-api.com/canvas/jail?avatar=${encodeURIComponent(pp)}` } }, { quoted: m });
}, { category: 'fun', desc: 'Jail overlay' });

cmd('triggered', async (m, args, nimesha) => {
    const target = m.mentionedJid?.[0] || m.sender;
    const pp = await nimesha.profilePictureUrl(target, 'image').catch(() => 'https://i.imgur.com/2Jz1DkP.png');
    await nimesha.sendMessage(m.chat, { image: { url: `https://some-random-api.com/canvas/triggered?avatar=${encodeURIComponent(pp)}` } }, { quoted: m });
}, { category: 'fun', desc: 'Triggered overlay' });

cmd('wanted', async (m, args, nimesha) => {
    const target = m.mentionedJid?.[0] || m.sender;
    const pp = await nimesha.profilePictureUrl(target, 'image').catch(() => 'https://i.imgur.com/2Jz1DkP.png');
    await nimesha.sendMessage(m.chat, { image: { url: `https://some-random-api.com/canvas/wasted?avatar=${encodeURIComponent(pp)}` } }, { quoted: m });
}, { category: 'fun', desc: 'Wanted poster overlay' });

// ============================================================
// CONTINUED IN PART 3 – ECONOMY, GAMES, GROUP ADMIN
// ============================================================

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: ECONOMY & RPG (40+ commands)
// ═══════════════════════════════════════════════════════════════════════════

cmd('daily', async (m) => {
    const res = Economy.daily(m.sender);
    if (res.success) await m.reply(`✅ Claimed ${res.amount} coins & ${res.gems} gems!\n🔥 Streak: ${res.streak}`);
    else await m.reply(`⏳ Come back in ${res.wait} hours`);
}, { category: 'economy', desc: 'Claim daily reward', cooldown: 1000 });

cmd('work', async (m) => {
    const res = Economy.work(m.sender);
    if (res.success) await m.reply(`💼 You worked as ${global.db.users[m.sender].job} and earned ${res.amount} coins`);
    else await m.reply(`⏳ Wait ${res.wait} minutes`);
}, { category: 'economy', desc: 'Work to earn coins', cooldown: 1000 });

cmd('rob', async (m) => {
    const target = m.mentionedJid?.[0];
    if (!target) return m.reply('Tag someone to rob');
    const res = Economy.rob(m.sender, target);
    if (res.success) await m.reply(`💰 Robbed ${res.amount} coins!`);
    else if (res.reason) await m.reply(res.reason);
    else await m.reply(`🚔 Caught! Lost ${res.penalty} coins`);
}, { category: 'economy', desc: 'Rob another user', cooldown: 2000 });

cmd('balance', async (m) => {
    const u = Economy.ensureUser(m.sender);
    await m.reply(`💰 *Balance*\n👛 Wallet: ${u.coins}\n🏦 Bank: ${u.bank}\n💎 Gems: ${u.gems}\n📊 Level: ${u.level}\n⭐ XP: ${u.xp}`);
}, { category: 'economy', desc: 'Check your balance', aliases: ['bal', 'money'] });

cmd('deposit', async (m, args) => {
    if (!args[0] || isNaN(args[0])) return m.reply('Usage: .deposit <amount>');
    if (Economy.deposit(m.sender, parseInt(args[0]))) await m.reply('✅ Deposited');
    else await m.reply('❌ Insufficient funds');
}, { category: 'economy', desc: 'Deposit coins to bank', aliases: ['dep'] });

cmd('withdraw', async (m, args) => {
    if (!args[0] || isNaN(args[0])) return m.reply('Usage: .withdraw <amount>');
    if (Economy.withdraw(m.sender, parseInt(args[0]))) await m.reply('✅ Withdrawn');
    else await m.reply('❌ Insufficient funds');
}, { category: 'economy', desc: 'Withdraw from bank', aliases: ['with'] });

cmd('transfer', async (m, args) => {
    if (m.mentionedJid.length < 1 || !args[1] || isNaN(args[1])) return m.reply('Usage: .transfer @user <amount>');
    if (Economy.transfer(m.sender, m.mentionedJid[0], parseInt(args[1]))) await m.reply('💸 Transfer complete');
    else await m.reply('❌ Insufficient funds');
}, { category: 'economy', desc: 'Transfer coins to another user', aliases: ['pay'] });

cmd('lb', async (m, args, nimesha) => {
    const lb = Economy.leaderboard();
    let txt = '🏆 *Global Leaderboard*\n\n';
    lb.forEach((u, i) => { txt += `${i+1}. @${u.id.split('@')[0]} — Lv.${u.level} | ${u.coins}🪙\n`; });
    await nimesha.sendMessage(m.chat, { text: txt, mentions: lb.map(u => u.id) }, { quoted: m });
}, { category: 'economy', desc: 'Global leaderboard', aliases: ['leaderboard', 'top'] });

cmd('buy', async (m, args) => {
    const shop = { 'phone': 1000, 'laptop': 5000, 'car': 50000, 'house': 200000, 'jet': 1000000 };
    if (!shop[args[0]]) return m.reply(`Shop: ${Object.entries(shop).map(([k,v]) => `${k}: ${v}🪙`).join(', ')}`);
    if (Economy.buyItem(m.sender, args[0], shop[args[0]])) await m.reply(`🛒 Bought ${args[0]}`);
    else await m.reply('❌ Broke');
}, { category: 'economy', desc: 'Buy items from shop' });

cmd('inventory', async (m) => {
    const u = Economy.ensureUser(m.sender);
    if (!u.inventory.length) return m.reply('Empty backpack');
    await m.reply(`🎒 *Inventory*\n${u.inventory.map(i => `• ${i.item}`).join('\n')}`);
}, { category: 'economy', desc: 'View your inventory', aliases: ['inv'] });

cmd('marry', async (m, args) => {
    const target = m.mentionedJid?.[0];
    if (!target) return m.reply('Tag your soulmate');
    if (Economy.marry(m.sender, target)) await m.reply(`💍 @${m.sender.split('@')[0]} married @${target.split('@')[0]}!`, { mentions: [m.sender, target] });
    else await m.reply('❌ Already married or they are taken');
}, { category: 'economy', desc: 'Marry another user' });

cmd('divorce', async (m) => {
    if (Economy.divorce(m.sender)) await m.reply('💔 Divorced');
    else await m.reply('You are single');
}, { category: 'economy', desc: 'Divorce your partner' });

cmd('adopt', async (m, args) => {
    if (args.length < 2) return m.reply('Usage: .adopt <name> <type>');
    if (Economy.adoptPet(m.sender, args[0], args[1])) await m.reply(`🐾 Adopted ${args[0]} the ${args[1]}!`);
    else await m.reply('Max 5 pets or insufficient funds');
}, { category: 'economy', desc: 'Adopt a pet' });

cmd('job', async (m, args) => {
    const jobs = ['developer', 'hacker', 'trader', 'artist', 'musician'];
    if (!args[0] || !jobs.includes(args[0])) return m.reply(`Jobs: ${jobs.join(', ')}`);
    global.db.users[m.sender].job = args[0];
    await m.reply(`💼 Now working as ${args[0]}`);
}, { category: 'economy', desc: 'Choose a job' });

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: GAMES (30+ commands)
// ═══════════════════════════════════════════════════════════════════════════

const activeGames = global.activeGames || (global.activeGames = {});

cmd('ttt', async (m, args, nimesha) => {
    const id = m.chat;
    if (!activeGames[id]) {
        if (!m.mentionedJid?.[0] && args[0] !== 'bot') return m.reply('Usage: .ttt @user or .ttt bot');
        const p2 = args[0] === 'bot' ? 'bot' : m.mentionedJid[0];
        activeGames[id] = new Games.TicTacToe(m.sender, p2);
        await m.reply(`❌ *TicTacToe Started!*\n${activeGames[id].render()}\n\n@${m.sender.split('@')[0]}'s turn (X)`, { mentions: [m.sender] });
    } else {
        const game = activeGames[id];
        const pos = parseInt(args[0]);
        if (isNaN(pos) || pos < 1 || pos > 9) return m.reply('Send position 1-9');
        const res = game.move(pos - 1);
        let txt = `${game.render()}\n\n`;
        if (res === 'win') { 
            txt += `🎉 Player ${game.turn} wins!`; 
            delete activeGames[id]; 
        } else if (res === 'draw') { 
            txt += '🤝 Draw!'; 
            delete activeGames[id]; 
        } else { 
            if (game.players.O === 'bot') {
                const empty = game.board.map((c,i) => c===null?i:null).filter(c=>c!==null);
                const botMove = empty[Math.floor(Math.random()*empty.length)];
                game.board[botMove] = 'O';
                txt = `${game.render()}\n\n`;
                if (game.checkWin('O')) { txt += `🤖 Bot wins!`; delete activeGames[id]; }
                else { txt += `Your turn (X)`; }
            } else {
                txt += `@${game.players[game.turn]}'s turn (${game.turn})`; 
            }
        }
        await m.reply(txt, { mentions: Object.values(game.players).filter(p => p !== 'bot') });
    }
}, { category: 'games', desc: 'Play Tic Tac Toe', aliases: ['tictactoe'] });

cmd('blackjack', async (m) => {
    const id = 'bj_'+m.sender;
    if (!activeGames[id]) {
        activeGames[id] = new Games.Blackjack();
        const g = activeGames[id];
        await m.reply(`🃏 *Blackjack*\nYour cards: ${g.player.join(', ')} (${g.val(g.player)})\nDealer shows: ${g.dealer[0]}\n\nType .hit or .stand`);
    } else {
        await m.reply('Game in progress. Use .hit or .stand');
    }
}, { category: 'games', desc: 'Play Blackjack', aliases: ['bj'] });

cmd('hit', async (m) => {
    const id = 'bj_'+m.sender;
    if (!activeGames[id]) return m.reply('No active blackjack. Use .blackjack');
    const g = activeGames[id];
    const v = g.hit();
    if (g.done || g.val(g.player) > 21) {
        const res = g.stand();
        await m.reply(`💥 Bust! ${g.player.join(', ')} = ${g.val(g.player)}\n\nDealer: ${g.dealer.join(', ')} = ${g.val(g.dealer)}\n\nResult: ${res}`);
        delete activeGames[id];
    } else {
        await m.reply(`🃏 Your cards: ${g.player.join(', ')} (${g.val(g.player)})\nType .hit or .stand`);
    }
}, { category: 'games', desc: 'Hit in Blackjack' });

cmd('stand', async (m) => {
    const id = 'bj_'+m.sender;
    if (!activeGames[id]) return m.reply('No active blackjack');
    const g = activeGames[id];
    const res = g.stand();
    await m.reply(`🃏 Your cards: ${g.player.join(', ')} (${g.val(g.player)})\nDealer: ${g.dealer.join(', ')} (${g.val(g.dealer)})\n\nResult: ${res}`);
    delete activeGames[id];
}, { category: 'games', desc: 'Stand in Blackjack' });

cmd('slot', async (m) => {
    const res = Games.slotMachine();
    const u = Economy.ensureUser(m.sender);
    if (res.win) { u.coins += res.amount; await m.reply(`🎰 ${res.reels.join(' | ')}\n\n🎉 You won ${res.amount} coins!`); }
    else { u.coins = Math.max(0, u.coins - 10); await m.reply(`🎰 ${res.reels.join(' | ')}\n\n😞 Lost 10 coins`); }
}, { category: 'games', desc: 'Play slot machine', aliases: ['slots'] });

cmd('trivia', async (m) => {
    const t = await Games.trivia();
    activeGames['tr_'+m.chat] = t;
    await m.reply(`❓ *Trivia*\n\n${t.question}\n\n${t.options.map((o,i) => `${String.fromCharCode(65+i)}. ${o}`).join('\n')}\n\nReply with .answer A/B/C/D`);
}, { category: 'games', desc: 'Answer trivia question', aliases: ['quiz'] });

cmd('answer', async (m, args) => {
    const id = 'tr_'+m.chat;
    if (!activeGames[id]) return m.reply('No active trivia');
    const t = activeGames[id];
    const ans = args[0]?.toUpperCase();
    const idx = ans ? ans.charCodeAt(0) - 65 : -1;
    const correct = t.options.indexOf(t.correct);
    if (idx === correct) {
        Economy.ensureUser(m.sender).coins += 100;
        await m.reply(`✅ Correct! +100 coins`);
    } else {
        await m.reply(`❌ Wrong! Answer was ${String.fromCharCode(65+correct)}. ${t.correct}`);
    }
    delete activeGames[id];
}, { category: 'games', desc: 'Answer trivia question' });

cmd('wordle', async (m, args) => {
    const id = 'wd_'+m.sender;
    if (!activeGames[id]) {
        activeGames[id] = new Games.Wordle();
        await m.reply('🟩 *Wordle started!*\nGuess the 5-letter word.\nType .word <guess>');
    } else {
        if (!args[0] || args[0].length !== 5) return m.reply('Send 5-letter word');
        const g = activeGames[id];
        const res = g.guess(args[0]);
        let txt = res.result + '\n';
        if (res.won) { txt += '🎉 Correct! +200 coins'; Economy.ensureUser(m.sender).coins += 200; delete activeGames[id]; }
        else if (res.lost) { txt += `💀 Game over. Word was: ${g.word}`; delete activeGames[id]; }
        else { txt += `Attempt ${g.guesses.length}/6`; }
        await m.reply(txt);
    }
}, { category: 'games', desc: 'Play Wordle', aliases: ['wd'] });

cmd('hangman', async (m, args) => {
    const id = 'hm_'+m.chat;
    if (!activeGames[id]) {
        activeGames[id] = new Games.Hangman();
        await m.reply('🎭 *Hangman started!*\nGuess letters with .hm <letter>');
    } else {
        if (!args[0]) return m.reply('Guess a letter');
        const g = activeGames[id];
        const res = g.guess(args[0]);
        let txt = `Word: ${res.display}\n❤️ Lives: ${res.lives}\nGuessed: ${Array.from(g.guessed).join(', ')}`;
        if (res.won) { txt += '\n🎉 You won! +150 coins'; Economy.ensureUser(m.sender).coins += 150; delete activeGames[id]; }
        else if (res.lost) { txt += `\n💀 Hanged! Word was: ${res.word}`; delete activeGames[id]; }
        await m.reply(txt);
    }
}, { category: 'games', desc: 'Play Hangman', aliases: ['hm'] });

cmd('connect4', async (m, args, nimesha) => {
    const id = m.chat;
    if (!activeGames['c4_'+id]) {
        if (!m.mentionedJid?.[0]) return m.reply('Tag opponent: .connect4 @user');
        activeGames['c4_'+id] = new Games.Connect4(m.sender, m.mentionedJid[0]);
        await m.reply(`🔴 *Connect 4*\n${activeGames['c4_'+id].board.map(r=>r.map(c=>c===0?'🔴':c===1?'🟡':'⬛').join('')).join('\n')}\n@${m.sender.split('@')[0]}'s turn (🔴)`, { mentions: [m.sender] });
    } else {
        const col = parseInt(args[0]) - 1;
        if (isNaN(col) || col < 0 || col > 6) return m.reply('Column 1-7');
        const g = activeGames['c4_'+id];
        const res = g.drop(col);
        if (!res.success) return m.reply('Column full');
        let txt = res.board.map(r=>r.map(c=>c===0?'🔴':c===1?'🟡':'⬛').join('')).join('\n') + '\n\n';
        if (res.won) { txt += `🎉 Player ${g.turn===0?'🔴':'🟡'} wins!`; delete activeGames['c4_'+id]; }
        else if (res.board.every(r => r.every(c => c !== null))) { txt += '🤝 Draw!'; delete activeGames['c4_'+id]; }
        else { txt += `@${g.players[g.turn].split('@')[0]}'s turn (${g.turn===0?'🔴':'🟡'})`; }
        await m.reply(txt, { mentions: g.players });
    }
}, { category: 'games', desc: 'Play Connect 4', aliases: ['c4'] });

cmd('rps', async (m, args) => {
    const choices = ['rock','paper','scissors'];
    if (!args[0] || !choices.includes(args[0].toLowerCase())) return m.reply('Usage: .rps rock/paper/scissors');
    const user = args[0].toLowerCase();
    const bot = choices[Math.floor(Math.random()*3)];
    let res = '';
    if (user === bot) res = 'Draw!';
    else if ((user==='rock'&&bot==='scissors')||(user==='paper'&&bot==='rock')||(user==='scissors'&&bot==='paper')) { res = 'You win! +20 coins'; Economy.ensureUser(m.sender).coins += 20; }
    else res = 'Bot wins!';
    await m.reply(`🎮 You: ${user} | Bot: ${bot}\n${res}`);
}, { category: 'games', desc: 'Rock Paper Scissors', aliases: ['rockpaperscissors'] });

cmd('guess', async (m, args) => {
    const id = 'gs_'+m.sender;
    if (!activeGames[id]) {
        activeGames[id] = { num: Math.floor(Math.random()*100)+1, tries: 0 };
        await m.reply('🎯 *Guess the Number* (1-100)\nType .guess <number>');
    } else {
        const g = activeGames[id];
        const n = parseInt(args[0]);
        if (isNaN(n)) return m.reply('Send a number');
        g.tries++;
        if (n === g.num) {
            const reward = Math.max(500 - (g.tries * 50), 100);
            Economy.ensureUser(m.sender).coins += reward;
            await m.reply(`🎯 Correct in ${g.tries} tries! +${reward} coins`);
            delete activeGames[id];
        } else if (g.tries >= 10) {
            await m.reply(`💀 Out of tries. Number was ${g.num}`);
            delete activeGames[id];
        } else {
            await m.reply(`${n < g.num ? '📈 Higher' : '📉 Lower'} (${10-g.tries} left)`);
        }
    }
}, { category: 'games', desc: 'Guess the number', aliases: ['gtn'] });

cmd('lottery', async (m) => {
    const u = Economy.ensureUser(m.sender);
    if (u.coins < 50) return m.reply('Need 50 coins');
    u.coins -= 50;
    const nums = Array.from({length:6},()=>Math.floor(Math.random()*49)+1).sort((a,b)=>a-b);
    const win = Math.random() < 0.05;
    if (win) { u.coins += 5000; await m.reply(`🎰 ${nums.join('-')}\n🎉 JACKPOT! +5000 coins!`); }
    else await m.reply(`🎰 ${nums.join('-')}\n😞 No luck`);
}, { category: 'games', desc: 'Play lottery' });

cmd('fight', async (m) => {
    const target = m.mentionedJid?.[0];
    if (!target) return m.reply('Tag someone to fight');
    const p1 = Math.floor(Math.random()*100);
    const p2 = Math.floor(Math.random()*100);
    const winner = p1 > p2 ? m.sender : target;
    await m.reply(`⚔️ *Fight Result*\n@${m.sender.split('@')[0]}: ${p1}HP\n@${target.split('@')[0]}: ${p2}HP\n\n🏆 @${winner.split('@')[0]} wins!`, { mentions: [m.sender, target] });
}, { category: 'games', desc: 'Fight another user' });

cmd('math', async (m) => {
    const ops = ['+','-','*'];
    const op = ops[Math.floor(Math.random()*3)];
    const a = Math.floor(Math.random()*50)+1;
    const b = Math.floor(Math.random()*50)+1;
    const ans = op==='+'?a+b:op==='-'?a-b:a*b;
    activeGames['mt_'+m.sender] = ans;
    await m.reply(`🧮 *Math Quiz*\n${a} ${op} ${b} = ?\nReply with .ma <answer>`);
}, { category: 'games', desc: 'Math quiz' });

cmd('ma', async (m, args) => {
    const id = 'mt_'+m.sender;
    if (!activeGames[id]) return m.reply('No active math quiz');
    if (parseInt(args[0]) === activeGames[id]) {
        Economy.ensureUser(m.sender).coins += 50;
        await m.reply('✅ Correct! +50 coins');
    } else {
        await m.reply(`❌ Wrong! Answer: ${activeGames[id]}`);
    }
    delete activeGames[id];
}, { category: 'games', desc: 'Answer math quiz' });

cmd('horse', async (m, args) => {
    const horses = ['🐎 Red','🐴 Blue','🦄 Green','🦓 Yellow'];
    const winner = horses[Math.floor(Math.random()*horses.length)];
    const bet = args[0];
    const u = Economy.ensureUser(m.sender);
    if (!bet) return m.reply(`Pick: ${horses.join(', ')}\nUsage: .horse <name> <coins>`);
    const amt = parseInt(args[1]) || 100;
    if (u.coins < amt) return m.reply('Insufficient coins');
    u.coins -= amt;
    if (winner.toLowerCase().includes(bet.toLowerCase())) {
        u.coins += amt * 3;
        await m.reply(`🏇 ${winner} wins!\n🎉 You won ${amt*3} coins!`);
    } else {
        await m.reply(`🏇 ${winner} wins!\n😞 You lost ${amt} coins`);
    }
}, { category: 'games', desc: 'Horse race betting' });

cmd('roulette', async (m, args) => {
    const u = Economy.ensureUser(m.sender);
    const bet = parseInt(args[0]);
    if (isNaN(bet) || bet < 10) return m.reply('Usage: .roulette <coins> <red/black/green>');
    if (u.coins < bet) return m.reply('Too poor');
    const color = ['red','black','green'][Math.floor(Math.random()*3)];
    const pick = (args[1] || 'red').toLowerCase();
    u.coins -= bet;
    let win = 0;
    if (pick === color) win = color === 'green' ? bet * 14 : bet * 2;
    u.coins += win;
    await m.reply(`🎡 ${color.toUpperCase()}!\n${win ? `🎉 Won ${win}` : `😞 Lost ${bet}`}`);
}, { category: 'games', desc: 'Play roulette', aliases: ['rl'] });

cmd('chess', async (m) => {
    await m.reply('♟️ Chess engine requires external API. Use .ai to analyze chess positions.');
}, { category: 'games', desc: 'Chess (placeholder)' });

cmd('minesweeper', async (m) => {
    const grid = Array(5).fill().map(() => Array(5).fill('⬜'));
    const mines = new Set();
    while (mines.size < 3) mines.add(Math.floor(Math.random()*25));
    activeGames['ms_'+m.sender] = { mines: Array.from(mines), revealed: new Set() };
    await m.reply('💣 *Minesweeper* (5x5, 3 mines)\nType .ms <1-25> to reveal');
}, { category: 'games', desc: 'Play Minesweeper' });

cmd('ms', async (m, args) => {
    const id = 'ms_'+m.sender;
    if (!activeGames[id]) return m.reply('Start with .minesweeper');
    const pos = parseInt(args[0]) - 1;
    if (isNaN(pos)) return m.reply('1-25');
    const g = activeGames[id];
    if (g.mines.includes(pos)) {
        delete activeGames[id];
        return m.reply('💥 BOOM! You died.');
    }
    g.revealed.add(pos);
    if (g.revealed.size >= 22) {
        delete activeGames[id];
        return m.reply('🎉 You cleared the field! +300 coins');
    }
    let board = '';
    for (let i = 0; i < 25; i++) {
        board += g.revealed.has(i) ? '✅' : '⬜';
        if ((i+1) % 5 === 0) board += '\n';
    }
    await m.reply(`💣 ${board}\nSafe! ${22 - g.revealed.size} left.`);
}, { category: 'games', desc: 'Reveal Minesweeper cell' });

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: GROUP / ADMIN (50+ commands)
// ═══════════════════════════════════════════════════════════════════════════

cmd('antilink', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const status = args[0] === 'on';
    await Admin.setAntiLink(nimesha, m.chat, status);
    await m.reply(`🔗 Antilink ${status ? 'enabled' : 'disabled'}`);
}, { category: 'admin', desc: 'Toggle anti-link', admin: true });

cmd('antidelete', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const status = args[0] === 'on';
    await Admin.setAntiDelete(nimesha, m.chat, status);
    await m.reply(`🗑️ Antidelete ${status ? 'enabled' : 'disabled'}`);
}, { category: 'admin', desc: 'Toggle anti-delete', admin: true });

cmd('antispam', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const status = args[0] === 'on';
    await Admin.setAntiSpam(nimesha, m.chat, status);
    await m.reply(`🛡️ Antispam ${status ? 'enabled' : 'disabled'}`);
}, { category: 'admin', desc: 'Toggle anti-spam', admin: true });

cmd('welcome', async (m) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const g = global.db.groups[m.chat] = global.db.groups[m.chat] || {};
    g.welcome = !g.welcome;
    await m.reply(`👋 Welcome ${g.welcome ? 'enabled' : 'disabled'}`);
}, { category: 'admin', desc: 'Toggle welcome message', admin: true });

cmd('goodbye', async (m) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const g = global.db.groups[m.chat] = global.db.groups[m.chat] || {};
    g.goodbye = !g.goodbye;
    await m.reply(`👋 Goodbye ${g.goodbye ? 'enabled' : 'disabled'}`);
}, { category: 'admin', desc: 'Toggle goodbye message', admin: true });

cmd('setwelcome', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    await Admin.setWelcome(nimesha, m.chat, args.join(' '));
    await m.reply('✅ Welcome message set');
}, { category: 'admin', desc: 'Set custom welcome message', admin: true });

cmd('setbye', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    await Admin.setGoodbye(nimesha, m.chat, args.join(' '));
    await m.reply('✅ Goodbye message set');
}, { category: 'admin', desc: 'Set custom goodbye message', admin: true });

cmd('autosticker', async (m) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const g = global.db.groups[m.chat] = global.db.groups[m.chat] || {};
    g.autosticker = !g.autosticker;
    await m.reply(`🎨 Autosticker ${g.autosticker ? 'enabled' : 'disabled'}`);
}, { category: 'admin', desc: 'Toggle auto-sticker', admin: true });

cmd('filter', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const [trigger, ...resp] = args.join(' ').split('|');
    if (!trigger || !resp.length) return m.reply('Usage: .filter trigger | response');
    await Admin.setFilter(nimesha, m.chat, trigger.trim(), resp.join('|').trim());
    await m.reply(`✅ Filter added: "${trigger.trim()}"`);
}, { category: 'admin', desc: 'Add word filter', admin: true });

cmd('delfilter', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    await Admin.deleteFilter(nimesha, m.chat, args.join(' '));
    await m.reply('✅ Filter removed');
}, { category: 'admin', desc: 'Remove word filter', admin: true });

cmd('grouplink', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isBotAdmin) return m.reply('Make me admin');
    const link = await Admin.inviteCode(nimesha, m.chat);
    await m.reply(`🔗 *Group Link*\n${link}`);
}, { category: 'admin', desc: 'Get group invite link', aliases: ['linkgc', 'linkgrup'] });

cmd('revoke', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    await Admin.revokeInvite(nimesha, m.chat);
    await m.reply('♻️ Link revoked');
}, { category: 'admin', desc: 'Revoke group invite link' });

cmd('tagall', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const text = args.join(' ') || 'Attention everyone!';
    await Admin.tagAll(nimesha, m.chat, text, m.metadata.participants);
}, { category: 'admin', desc: 'Tag all members', aliases: ['tag'] });

cmd('hidetag', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    await Admin.hideTag(nimesha, m.chat, args.join(' ') || 'Hidden message', m.metadata.participants);
}, { category: 'admin', desc: 'Hidden tag', aliases: ['ht'] });

cmd('add', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isBotAdmin) return m.reply('Make me admin');
    const num = args[0]?.replace(/\D/g,'');
    if (!num) return m.reply('Usage: .add 254XXXXXXXXX');
    await Admin.addMember(nimesha, m.chat, num+'@s.whatsapp.net');
    await m.reply(`✅ Added @${num}`, { mentions: [num+'@s.whatsapp.net'] });
}, { category: 'admin', desc: 'Add member to group' });

cmd('kick', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isBotAdmin) return m.reply('Make me admin');
    const target = m.mentionedJid?.[0];
    if (!target) return m.reply('Tag user');
    await Admin.kickMember(nimesha, m.chat, target);
    await m.reply(`🚫 Removed @${target.split('@')[0]}`, { mentions: [target] });
}, { category: 'admin', desc: 'Kick member from group' });

cmd('promote', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const target = m.mentionedJid?.[0];
    if (!target) return m.reply('Tag user');
    await Admin.promote(nimesha, m.chat, target);
    await m.reply(`⬆️ Promoted @${target.split('@')[0]}`, { mentions: [target] });
}, { category: 'admin', desc: 'Promote to admin' });

cmd('demote', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const target = m.mentionedJid?.[0];
    if (!target) return m.reply('Tag user');
    await Admin.demote(nimesha, m.chat, target);
    await m.reply(`⬇️ Demoted @${target.split('@')[0]}`, { mentions: [target] });
}, { category: 'admin', desc: 'Demote from admin' });

cmd('warn', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const target = m.mentionedJid?.[0];
    if (!target) return m.reply('Tag user');
    const reason = args.slice(1).join(' ') || 'No reason';
    const count = await Admin.warn(m.chat, target, reason);
    if (count >= 3) {
        await Admin.kickMember(nimesha, m.chat, target);
        await m.reply(`⚠️ @${target.split('@')[0]} kicked for 3 warnings.`, { mentions: [target] });
        Admin.clearWarns(m.chat, target);
    } else {
        await m.reply(`⚠️ Warned @${target.split('@')[0]}\nReason: ${reason}\nCount: ${count}/3`, { mentions: [target] });
    }
}, { category: 'admin', desc: 'Warn a member' });

cmd('warnings', async (m) => {
    const target = m.mentionedJid?.[0] || m.sender;
    const count = Admin.getWarnings(m.chat, target);
    await m.reply(`⚠️ @${target.split('@')[0]} has ${count} warning(s)`, { mentions: [target] });
}, { category: 'admin', desc: 'Check warnings', aliases: ['warns'] });

cmd('clearwarn', async (m) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const target = m.mentionedJid?.[0];
    if (!target) return m.reply('Tag user');
    Admin.clearWarns(m.chat, target);
    await m.reply(`✅ Cleared warnings for @${target.split('@')[0]}`, { mentions: [target] });
}, { category: 'admin', desc: 'Clear warnings' });

cmd('mute', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const dur = args[0] ? parseInt(args[0]) * 60000 : 0;
    await Admin.setMute(nimesha, m.chat, dur);
    await m.reply(dur ? `🔇 Muted for ${args[0]}m` : '🔇 Group muted');
}, { category: 'admin', desc: 'Mute group' });

cmd('unmute', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    await Admin.setUnmute(nimesha, m.chat);
    await m.reply('🔊 Group unmuted');
}, { category: 'admin', desc: 'Unmute group' });

cmd('setname', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    if (!args.join(' ')) return m.reply('Provide name');
    await nimesha.groupUpdateSubject(m.chat, args.join(' '));
    await m.reply('✅ Name updated');
}, { category: 'admin', desc: 'Change group name' });

cmd('setdesc', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    if (!args.join(' ')) return m.reply('Provide description');
    await nimesha.groupUpdateDescription(m.chat, args.join(' '));
    await m.reply('✅ Description updated');
}, { category: 'admin', desc: 'Change group description' });

cmd('groupinfo', async (m, args, nimesha) => {
    if (!m.isGroup) return m.reply('Group only');
    const info = await Admin.getGroupInfo(nimesha, m.chat);
    await m.reply(`📋 *Group Info*\nName: ${info.name}\nMembers: ${info.size}\nCreated: ${new Date(info.created*1000).toLocaleDateString()}`);
}, { category: 'admin', desc: 'Group information', aliases: ['ginfo'] });

cmd('lock', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    await nimesha.groupSettingUpdate(m.chat, 'announcement');
    await m.reply('🔒 Locked (admins only)');
}, { category: 'admin', desc: 'Lock group (only admins can send)' });

cmd('unlock', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    await nimesha.groupSettingUpdate(m.chat, 'not_announcement');
    await m.reply('🔓 Unlocked');
}, { category: 'admin', desc: 'Unlock group' });

cmd('slowmode', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const sec = parseInt(args[0]);
    if (isNaN(sec)) return m.reply('Usage: .slowmode 5');
    // Implement slowmode via db
    global.db.groups[m.chat] = global.db.groups[m.chat] || {};
    global.db.groups[m.chat].slowmode = sec;
    await m.reply(`🐌 Slowmode: ${sec}s`);
}, { category: 'admin', desc: 'Set slowmode' });

cmd('poll', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const [q, ...opts] = args.join(' ').split(';');
    if (!q || opts.length < 2) return m.reply('Usage: .poll Question;Opt1;Opt2');
    await nimesha.sendPoll(m.chat, q.trim(), opts.map(o => o.trim()));
}, { category: 'admin', desc: 'Create a poll' });

cmd('purge', async (m, args, nimesha) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const count = parseInt(args[0]) || 10;
    await m.reply(`🧹 Purging ${count} messages...`);
    const msgs = await nimesha.loadMessages(m.chat, count);
    for (const msg of msgs) {
        if (args[1] === 'bot' && !msg.key.fromMe) continue;
        try { await nimesha.sendMessage(m.chat, { delete: msg.key }); } catch {}
    }
}, { category: 'admin', desc: 'Delete multiple messages' });

cmd('nsfw', async (m) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const g = global.db.groups[m.chat] = global.db.groups[m.chat] || {};
    g.nsfw = !g.nsfw;
    await m.reply(`🔞 NSFW ${g.nsfw ? 'enabled' : 'disabled'}`);
}, { category: 'admin', desc: 'Toggle NSFW mode', admin: true });

cmd('autolevelup', async (m) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const g = global.db.groups[m.chat] = global.db.groups[m.chat] || {};
    g.autolevelup = !g.autolevelup;
    await m.reply(`📈 Auto-levelup ${g.autolevelup ? 'enabled' : 'disabled'}`);
}, { category: 'admin', desc: 'Toggle auto level-up announcement', admin: true });

cmd('group', async (m) => {
    if (!m.isGroup || !m.isAdmin) return m.reply('Admin only');
    const g = global.db.groups[m.chat] = global.db.groups[m.chat] || {};
    const status = `📊 *Group Settings*
🔗 Antilink: ${g.antilink ? '✅' : '❌'}
🗑️ Antidelete: ${g.antidelete ? '✅' : '❌'}
🛡️ Antispam: ${g.antispam ? '✅' : '❌'}
👋 Welcome: ${g.welcome ? '✅' : '❌'}
😢 Goodbye: ${g.goodbye ? '✅' : '❌'}
🎨 Autosticker: ${g.autosticker ? '✅' : '❌'}
🔞 NSFW: ${g.nsfw ? '✅' : '❌'}
📈 AutoLevel: ${g.autolevelup ? '✅' : '❌'}`;
    await m.reply(status);
}, { category: 'admin', desc: 'View group settings', aliases: ['gsettings'] });

cmd('votekick', async (m, args, nimesha) => {
    if (!m.isGroup) return m.reply('Group only');
    const target = m.mentionedJid?.[0];
    if (!target) return m.reply('Tag user to votekick');
    if (!global.votes) global.votes = {};
    const id = m.chat + '_' + target;
    if (global.votes[id]) return m.reply('Vote already active');
    global.votes[id] = { target, votes: new Set(), needed: Math.floor(m.metadata.participants.length / 2) + 1 };
    await m.reply(`🗳️ *Votekick started for @${target.split('@')[0]}*\nType .vote to agree (${global.votes[id].needed} needed)`, { mentions: [target] });
}, { category: 'admin', desc: 'Start a votekick' });

cmd('vote', async (m, args, nimesha) => {
    if (!m.isGroup) return m.reply('Group only');
    const active = Object.entries(global.votes || {}).find(([k,v]) => k.startsWith(m.chat));
    if (!active) return m.reply('No active votekick');
    const [id, vote] = active;
    if (vote.votes.has(m.sender)) return m.reply('You already voted');
    vote.votes.add(m.sender);
    if (vote.votes.size >= vote.needed) {
        await Admin.kickMember(nimesha, m.chat, vote.target);
        await m.reply(`🚫 @${vote.target.split('@')[0]} was votekicked!`, { mentions: [vote.target] });
        delete global.votes[id];
    } else {
        await m.reply(`🗳️ ${vote.votes.size}/${vote.needed} votes to kick @${vote.target.split('@')[0]}`, { mentions: [vote.target] });
    }
}, { category: 'admin', desc: 'Vote in a votekick' });

cmd('everyone', async (m, args, nimesha) => {
    if (!m.isGroup) return m.reply('Group only');
    const text = args.join(' ') || 'Attention!';
    const meta = await nimesha.groupMetadata(m.chat);
    await nimesha.sendMessage(m.chat, { text, mentions: meta.participants.map(p => p.id) });
}, { category: 'admin', desc: 'Mention everyone', aliases: ['all'] });

cmd('inspect', async (m, args, nimesha) => {
    if (!m.isGroup) return m.reply('Group only');
    const meta = await nimesha.groupMetadata(m.chat);
    let txt = `🔍 *Group Inspection*\n\n`;
    txt += `👥 Total: ${meta.participants.length}\n`;
    txt += `👑 Admins: ${meta.participants.filter(p => p.admin).length}\n`;
    const inactive = meta.participants.filter(p => !p.admin).slice(0, 10);
    txt += `\n*Random Pings (10):*\n`;
    await nimesha.sendMessage(m.chat, { text: txt, mentions: inactive.map(p => p.id) });
}, { category: 'admin', desc: 'Inspect group members' });

cmd('pair', async (m, args, nimesha) => {
    if (nimesha.authState.creds.registered) return m.reply('Already registered');
    const phone = args[0]?.replace(/\D/g,'');
    if (!phone) return m.reply('Usage: .pair 254XXXXXXXXX');
    const code = await nimesha.requestPairingCode(phone);
    const formatted = code.match(/.{1,4}/g).join('-');
    await m.reply(`📱 Pairing code: *${formatted}*`);
}, { category: 'admin', desc: 'Get pairing code' });

// ============================================================
// CONTINUED IN PART 4 – STICKER, OWNER, NSFW, DAILY, HEALTH, FINANCE, SOCIAL, DEV, TRAVEL, FOOD
// ============================================================

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: STICKER & CONVERTER (20+ commands)
// ═══════════════════════════════════════════════════════════════════════════

cmd('sticker', async (m, args, nimesha) => {
    if (!m.quoted || !m.quoted.isMedia) return m.reply('Reply to image/video');
    const buf = await m.quoted.download();
    await nimesha.sendAsSticker(m.chat, buf, m, { packname: global.botname, author: global.author });
}, { category: 'sticker', desc: 'Create sticker from image/video', aliases: ['s'] });

cmd('attp', async (m, args, nimesha) => {
    if (!args.join(' ')) return m.reply('Usage: .attp <text>');
    const buf = await fetch(`https://api.xteam.xyz/attp?file&text=${encodeURIComponent(args.join(' '))}`).then(r => r.buffer());
    await nimesha.sendAsSticker(m.chat, buf, m);
}, { category: 'sticker', desc: 'Animated text sticker' });

cmd('ttp', async (m, args, nimesha) => {
    if (!args.join(' ')) return m.reply('Usage: .ttp <text>');
    const buf = await fetch(`https://api.xteam.xyz/ttp?file&text=${encodeURIComponent(args.join(' '))}`).then(r => r.buffer());
    await nimesha.sendAsSticker(m.chat, buf, m);
}, { category: 'sticker', desc: 'Text to picture sticker' });

cmd('toimg', async (m, args, nimesha) => {
    if (!m.quoted || m.quoted.mtype !== 'stickerMessage') return m.reply('Reply to sticker');
    const buf = await m.quoted.download();
    await nimesha.sendMessage(m.chat, { image: buf, caption: 'Converted' }, { quoted: m });
}, { category: 'sticker', desc: 'Sticker to image', aliases: ['toimage'] });

cmd('tomp3', async (m, args, nimesha) => {
    if (!m.quoted || !['videoMessage','audioMessage'].includes(m.quoted.mtype)) return m.reply('Reply to video/audio');
    const buf = await m.quoted.download();
    await nimesha.sendMessage(m.chat, { audio: buf, mimetype: 'audio/mpeg', fileName: 'audio.mp3' }, { quoted: m });
}, { category: 'sticker', desc: 'Convert to MP3', aliases: ['toaudio'] });

cmd('tovid', async (m, args, nimesha) => {
    if (!m.quoted || m.quoted.mtype !== 'imageMessage') return m.reply('Reply to image (GIF)');
    const buf = await m.quoted.download();
    await nimesha.sendMessage(m.chat, { video: buf, caption: 'Converted', gifPlayback: true }, { quoted: m });
}, { category: 'sticker', desc: 'Image to video/GIF', aliases: ['togif'] });

cmd('tourl', async (m, args, nimesha) => {
    if (!m.quoted || !m.quoted.isMedia) return m.reply('Reply to media');
    const buf = await m.quoted.download();
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', buf, 'file.jpg');
    const res = await fetch('https://telegra.ph/upload', { method: 'POST', body: form });
    const data = await res.json();
    await m.reply(`🔗 *URL:*\nhttps://telegra.ph${data[0].src}`);
}, { category: 'sticker', desc: 'Upload media to URL' });

cmd('readmore', async (m, args) => {
    const text = args.join(' ').split('|').join('\u200E'.repeat(4000) + '\n');
    await m.reply(text || 'Text1|Text2');
}, { category: 'sticker', desc: 'Create "Read more" message', aliases: ['rm'] });

cmd('pp', async (m, args, nimesha) => {
    const target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
    const url = await nimesha.profilePictureUrl(target, 'image').catch(() => null);
    if (!url) return m.reply('No profile photo');
    await nimesha.sendMessage(m.chat, { image: { url } }, { quoted: m });
}, { category: 'sticker', desc: 'Get profile picture', aliases: ['getpp'] });

cmd('save', async (m, args, nimesha) => {
    if (!m.quoted) return m.reply('Reply to status');
    const type = m.quoted.mtype.replace('Message','');
    const buf = await m.quoted.download();
    await nimesha.sendMessage(m.chat, { [type]: buf }, { quoted: m });
}, { category: 'sticker', desc: 'Save status' });

cmd('qc', async (m, args, nimesha) => {
    if (!m.quoted) return m.reply('Reply to a message');
    const text = args.join(' ') || m.quoted.body || 'Quote';
    const avatar = await nimesha.profilePictureUrl(m.quoted.sender, 'image').catch(() => 'https://i.imgur.com/2Jz1DkP.png');
    const json = {
        type: "quote",
        format: "png",
        backgroundColor: "#1b1429",
        width: 512,
        height: 768,
        scale: 2,
        messages: [{
            entities: [],
            avatar: true,
            from: { id: 1, name: m.quoted.pushName || 'User', photo: { url: avatar } },
            text: text,
            replyMessage: {}
        }]
    };
    const res = await fetch('https://bot.lyo.su/quote/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json)
    });
    const data = await res.json();
    const buf = Buffer.from(data.result.image, 'base64');
    await nimesha.sendMessage(m.chat, { image: buf }, { quoted: m });
}, { category: 'sticker', desc: 'Create fake WhatsApp chat', aliases: ['quote'] });

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: OWNER (40+ commands)
// ═══════════════════════════════════════════════════════════════════════════

cmd('eval', async (m, args, nimesha) => {
    if (!m.fromMe) return m.reply('Owner only');
    try {
        let evaled = await eval(args.join(' '));
        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
        await m.reply(`📟 *EVAL*\n\`\`\`js\n${evaled.slice(0, 3000)}\n\`\`\``);
    } catch (e) { await m.reply(`❌ ${e.message}`); }
}, { category: 'owner', desc: 'Evaluate JavaScript code', owner: true });

cmd('exec', async (m, args) => {
    if (!m.fromMe) return m.reply('Owner only');
    const { exec } = require('child_process');
    exec(args.join(' '), async (err, stdout) => {
        if (err) return m.reply(`❌ ${err.message}`);
        await m.reply(`📟 *EXEC*\n\`\`\`\n${stdout.slice(0, 3000)}\n\`\`\``);
    });
}, { category: 'owner', desc: 'Execute shell command', owner: true });

cmd('broadcast', async (m, args, nimesha) => {
    if (!m.fromMe) return m.reply('Owner only');
    const text = args.join(' ') || 'Broadcast';
    const chats = await nimesha.chats;
    let sent = 0;
    for (const [id] of Object.entries(chats || {})) {
        if (id.endsWith('@s.whatsapp.net')) {
            await nimesha.sendMessage(id, { text: `📢 *Broadcast*\n\n${text}` }).catch(() => {});
            sent++;
        }
    }
    await m.reply(`📢 Broadcast sent to ${sent} chats`);
}, { category: 'owner', desc: 'Broadcast to all chats', aliases: ['bc'], owner: true });

cmd('bcgc', async (m, args, nimesha) => {
    if (!m.fromMe) return m.reply('Owner only');
    const text = args.join(' ') || 'Broadcast';
    const groups = await nimesha.groupFetchAllParticipating();
    let sent = 0;
    for (const id of Object.keys(groups || {})) {
        await nimesha.sendMessage(id, { text: `📢 *Group Broadcast*\n\n${text}` }).catch(() => {});
        sent++;
    }
    await m.reply(`📢 Broadcast sent to ${sent} groups`);
}, { category: 'owner', desc: 'Broadcast to all groups', owner: true });

cmd('setppbot', async (m, args, nimesha) => {
    if (!m.fromMe) return m.reply('Owner only');
    if (!m.quoted || !m.quoted.isMedia) return m.reply('Reply to image');
    const buf = await m.quoted.download();
    await nimesha.updateProfilePicture(nimesha.user.id, buf);
    await m.reply('✅ Profile picture updated');
}, { category: 'owner', desc: 'Set bot profile picture', owner: true });

cmd('setprefix', async (m, args) => {
    if (!m.fromMe) return m.reply('Owner only');
    if (!args[0]) return m.reply('Provide prefix');
    global.prefix = args[0];
    await m.reply(`✅ Prefix set to ${args[0]}`);
}, { category: 'owner', desc: 'Change command prefix', owner: true });

cmd('ban', async (m, args) => {
    if (!m.fromMe) return m.reply('Owner only');
    const target = m.mentionedJid?.[0];
    if (!target) return m.reply('Tag user');
    global.db.banned.push(target);
    await m.reply(`🚫 Banned @${target.split('@')[0]}`, { mentions: [target] });
}, { category: 'owner', desc: 'Ban a user', owner: true });

cmd('unban', async (m, args) => {
    if (!m.fromMe) return m.reply('Owner only');
    const target = m.mentionedJid?.[0];
    if (!target) return m.reply('Tag user');
    global.db.banned = global.db.banned.filter(id => id !== target);
    await m.reply(`✅ Unbanned @${target.split('@')[0]}`, { mentions: [target] });
}, { category: 'owner', desc: 'Unban a user', owner: true });

cmd('listban', async (m) => {
    if (!m.fromMe) return m.reply('Owner only');
    await m.reply(`🚫 Banned:\n${global.db.banned.map(id => `• @${id.split('@')[0]}`).join('\n') || 'None'}`, { mentions: global.db.banned });
}, { category: 'owner', desc: 'List banned users', owner: true });

cmd('addlimit', async (m, args) => {
    if (!m.fromMe) return m.reply('Owner only');
    const target = m.mentionedJid?.[0];
    const amt = parseInt(args[1]);
    if (!target || isNaN(amt)) return m.reply('Usage: .addlimit @user <amount>');
    const u = Economy.ensureUser(target);
    u.limit = (u.limit || 0) + amt;
    await m.reply(`✅ Added ${amt} limit to @${target.split('@')[0]}`, { mentions: [target] });
}, { category: 'owner', desc: 'Add limit to user', owner: true });

cmd('addprem', async (m, args) => {
    if (!m.fromMe) return m.reply('Owner only');
    const target = m.mentionedJid?.[0];
    const days = parseInt(args[1]) || 30;
    if (!target) return m.reply('Tag user');
    global.db.premium.push({ id: target, expired: Date.now() + days * 86400000 });
    await m.reply(`👑 @${target.split('@')[0]} is premium for ${days} days`, { mentions: [target] });
}, { category: 'owner', desc: 'Add premium user', owner: true });

cmd('delprem', async (m, args) => {
    if (!m.fromMe) return m.reply('Owner only');
    const target = m.mentionedJid?.[0];
    global.db.premium = global.db.premium.filter(p => p.id !== target);
    await m.reply(`✅ Removed premium`);
}, { category: 'owner', desc: 'Remove premium user', owner: true });

cmd('listprem', async (m) => {
    if (!m.fromMe) return m.reply('Owner only');
    const list = global.db.premium.map(p => `• @${p.id.split('@')[0]} — ${new Date(p.expired).toLocaleDateString()}`);
    await m.reply(`👑 *Premium Users*\n\n${list.join('\n') || 'None'}`, { mentions: global.db.premium.map(p => p.id) });
}, { category: 'owner', desc: 'List premium users', owner: true });

cmd('block', async (m, args, nimesha) => {
    if (!m.fromMe) return m.reply('Owner only');
    const target = m.mentionedJid?.[0] || args[0] + '@s.whatsapp.net';
    await nimesha.updateBlockStatus(target, 'block');
    await m.reply(`🚫 Blocked`);
}, { category: 'owner', desc: 'Block a user', owner: true });

cmd('unblock', async (m, args, nimesha) => {
    if (!m.fromMe) return m.reply('Owner only');
    const target = m.mentionedJid?.[0] || args[0] + '@s.whatsapp.net';
    await nimesha.updateBlockStatus(target, 'unblock');
    await m.reply(`✅ Unblocked`);
}, { category: 'owner', desc: 'Unblock a user', owner: true });

cmd('join', async (m, args, nimesha) => {
    if (!m.fromMe) return m.reply('Owner only');
    if (!args[0]?.includes('chat.whatsapp.com')) return m.reply('Provide invite link');
    const code = args[0].split('/').pop();
    await nimesha.groupAcceptInvite(code);
    await m.reply('✅ Joined group');
}, { category: 'owner', desc: 'Join group via invite link', owner: true });

cmd('leave', async (m, args, nimesha) => {
    if (!m.fromMe) return m.reply('Owner only');
    if (!m.isGroup) return m.reply('Group only');
    await m.reply('👋 Bye');
    await nimesha.groupLeave(m.chat);
}, { category: 'owner', desc: 'Leave current group', owner: true });

cmd('shutdown', async (m) => {
    if (!m.fromMe) return m.reply('Owner only');
    await m.reply('💤 Shutting down...');
    process.exit(0);
}, { category: 'owner', desc: 'Shut down the bot', owner: true });

cmd('restart', async (m) => {
    if (!m.fromMe) return m.reply('Owner only');
    await m.reply('🔄 Restarting...');
    process.exit(1);
}, { category: 'owner', desc: 'Restart the bot', owner: true });

cmd('update', async (m) => {
    if (!m.fromMe) return m.reply('Owner only');
    const { exec } = require('child_process');
    exec('git pull', async (err, stdout) => {
        if (err) return m.reply(`❌ ${err.message}`);
        await m.reply(`🔄 Updated:\n\`\`\`\n${stdout}\n\`\`\`\nRestart to apply.`);
    });
}, { category: 'owner', desc: 'Update from GitHub', owner: true });

cmd('mode', async (m, args, nimesha) => {
    if (!m.fromMe) return m.reply('Owner only');
    nimesha.public = args[0] === 'public';
    await m.reply(`🔰 Mode: ${nimesha.public ? 'Public' : 'Self'}`);
}, { category: 'owner', desc: 'Switch bot mode', owner: true });

cmd('clearall', async (m) => {
    if (!m.fromMe) return m.reply('Owner only');
    global.db.users = {};
    global.db.groups = {};
    await m.reply('💥 Database cleared');
}, { category: 'owner', desc: 'Clear all user data', owner: true });

cmd('getsession', async (m, args, nimesha) => {
    if (!m.fromMe) return m.reply('Owner only');
    await m.reply(`📁 Session Info:\nJID: ${nimesha.user?.id}\nName: ${nimesha.user?.name}`);
}, { category: 'owner', desc: 'Get session info', owner: true });

cmd('anticall', async (m, args) => {
    if (!m.fromMe) return m.reply('Owner only');
    global.anticall = args[0] === 'on';
    await m.reply(`📵 Anticall ${global.anticall ? 'enabled' : 'disabled'}`);
}, { category: 'owner', desc: 'Toggle anti-call', owner: true });

cmd('self', async (m, args, nimesha) => {
    if (!m.fromMe) return m.reply('Owner only');
    nimesha.public = false;
    await m.reply('🔒 Self mode');
}, { category: 'owner', desc: 'Switch to self mode', owner: true });

cmd('public', async (m, args, nimesha) => {
    if (!m.fromMe) return m.reply('Owner only');
    nimesha.public = true;
    await m.reply('🌐 Public mode');
}, { category: 'owner', desc: 'Switch to public mode', owner: true });

cmd('spampair', async (m, args, nimesha) => {
    if (!m.fromMe) return m.reply('Owner only');
    const num = args[0]?.replace(/\D/g,'');
    const count = parseInt(args[1]) || 5;
    if (!num) return m.reply('Usage: .spampair 254xxxxx 10');
    for (let i = 0; i < count; i++) {
        try { await nimesha.requestPairingCode(num); } catch {}
    }
    await m.reply(`📱 Sent ${count} pairing codes`);
}, { category: 'owner', desc: 'Spam pairing codes (use with caution)', owner: true });

cmd('getmsg', async (m, args) => {
    if (!m.fromMe) return m.reply('Owner only');
    if (!m.quoted) return m.reply('Reply to a message');
    await m.reply(JSON.stringify(m.quoted, null, 2).slice(0, 3000));
}, { category: 'owner', desc: 'Get raw message JSON', aliases: ['getm'], owner: true });

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: NSFW (Configurable)
// ═══════════════════════════════════════════════════════════════════════════

cmd('nsfwmenu', async (m) => {
    if (!m.isGroup || !global.db.groups[m.chat]?.nsfw) return m.reply('NSFW disabled in this group');
    await m.reply(`🔞 *NSFW Menu*\n.waifu\n.hentai\n.neko\n.trap\n.blowjob\n.ass\n.bdsm\n.cum\n.femdom\n.glasses\n.maid\n.masturbation\n.panties\n.school\n.uniform\n.yuri`);
}, { category: 'nsfw', desc: 'NSFW command list', aliases: ['nsfwlist'] });

cmd('waifu', async (m, args, nimesha) => {
    if (!m.isGroup || !global.db.groups[m.chat]?.nsfw) return m.reply('NSFW disabled');
    const res = await fetch('https://api.waifu.im/search/?is_nsfw=true').then(r => r.json());
    await nimesha.sendMessage(m.chat, { image: { url: res.images[0].url } }, { quoted: m });
}, { category: 'nsfw', desc: 'NSFW waifu image', cooldown: 5000 });

cmd('hentai', async (m, args, nimesha) => {
    if (!m.isGroup || !global.db.groups[m.chat]?.nsfw) return m.reply('NSFW disabled');
    const res = await fetch('https://api.waifu.im/search/?included_tags=hentai&is_nsfw=true').then(r => r.json());
    await nimesha.sendMessage(m.chat, { image: { url: res.images[0].url } }, { quoted: m });
}, { category: 'nsfw', desc: 'NSFW hentai image', cooldown: 5000 });

cmd('neko', async (m, args, nimesha) => {
    if (!m.isGroup || !global.db.groups[m.chat]?.nsfw) return m.reply('NSFW disabled');
    const res = await fetch('https://api.waifu.im/search/?included_tags=neko&is_nsfw=true').then(r => r.json());
    await nimesha.sendMessage(m.chat, { image: { url: res.images[0].url } }, { quoted: m });
}, { category: 'nsfw', desc: 'NSFW neko image', cooldown: 5000 });

// ============================================================
// CONTINUED IN PART 5 – DAILY, HEALTH, FINANCE, SOCIAL, DEV
// ============================================================

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: DAILY ASSISTANT (reminders, notes, habits, etc.)
// ═══════════════════════════════════════════════════════════════════════════

cmd('remindme', async (m, args) => {
    if (args.length < 2) return m.reply('Usage: .remindme <minutes> <text>');
    const mins = parseInt(args[0]);
    const text = args.slice(1).join(' ');
    if (isNaN(mins)) return m.reply('Invalid minutes');
    const time = Daily.remind(m.sender, text, mins);
    await m.reply(`⏰ Reminder set for ${time}\n📝 ${text}`);
}, { category: 'daily', desc: 'Set a reminder' });

cmd('reminders', async (m) => {
    const list = Daily.listReminders(m.sender);
    if (!list.length) return m.reply('No active reminders');
    await m.reply(`⏰ *Your Reminders*\n${list.map((r,i) => `${i+1}. ${r.text} — ${new Date(r.due).toLocaleTimeString()}`).join('\n')}`);
}, { category: 'daily', desc: 'List active reminders' });

cmd('clearme', async (m) => {
    Daily.clearReminders(m.sender);
    await m.reply('🧹 All reminders cleared');
}, { category: 'daily', desc: 'Clear all reminders', aliases: ['clearreminders'] });

cmd('note', async (m, args) => {
    const [title, ...body] = args.join(' ').split('|');
    if (!title || !body.length) return m.reply('Usage: .note Title | Content');
    const n = Daily.addNote(m.sender, title.trim(), body.join('|').trim());
    await m.reply(`📝 Note #${n} saved: *${title.trim()}*`);
}, { category: 'daily', desc: 'Add a note', aliases: ['notes', 'addnote'] });

cmd('mynotes', async (m) => {
    const notes = Daily.getNotes(m.sender);
    if (!notes.length) return m.reply('No notes');
    await m.reply(`📚 *Your Notes*\n${notes.map((n,i) => `${i+1}. *${n.title}* — ${new Date(n.date).toLocaleDateString()}`).join('\n')}`);
}, { category: 'daily', desc: 'View your notes' });

cmd('delnote', async (m, args) => {
    const idx = parseInt(args[0]) - 1;
    Daily.delNote(m.sender, idx);
    await m.reply('🗑️ Note deleted');
}, { category: 'daily', desc: 'Delete a note' });

cmd('todo', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .todo <task> | priority (high/medium/low)');
    const [task, priority] = args.join(' ').split('|').map(s => s.trim());
    const count = Daily.addTodo(m.sender, task, priority || 'medium');
    await m.reply(`✅ Task added! (${count} pending)`);
}, { category: 'daily', desc: 'Add a todo', aliases: ['addtodo'] });

cmd('todos', async (m) => {
    const t = Daily.getTodos(m.sender);
    if (!t.length) return m.reply('No tasks');
    const pending = t.filter(x => !x.done);
    const done = t.filter(x => x.done);
    await m.reply(`📋 *Todo List*\n\n*Pending:*\n${pending.map((x,i) => `${i+1}. [${x.priority.toUpperCase()}] ${x.task}`).join('\n') || 'None'}\n\n*Done:* ${done.length}`);
}, { category: 'daily', desc: 'View todo list' });

cmd('done', async (m, args) => {
    const idx = parseInt(args[0]) - 1;
    Daily.doneTodo(m.sender, idx);
    await m.reply('🎉 Task completed!');
}, { category: 'daily', desc: 'Mark task as done', aliases: ['check'] });

cmd('cleartodo', async (m) => {
    Daily.clearDone(m.sender);
    await m.reply('🧹 Completed tasks cleared');
}, { category: 'daily', desc: 'Clear completed todos' });

cmd('habit', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .habit <name>');
    const res = Daily.checkHabit(m.sender, args.join(' '));
    if (res.done) return m.reply(`✅ Already checked in today!\n🔥 Streak: ${res.streak} days`);
    await m.reply(`🔥 *${args.join(' ')}* checked!\nStreak: ${res.streak} days (Best: ${res.best})`);
}, { category: 'daily', desc: 'Track a habit', aliases: ['checkin'] });

cmd('habits', async (m) => {
    const h = Daily.getHabits(m.sender);
    const entries = Object.entries(h);
    if (!entries.length) return m.reply('No habits tracked');
    await m.reply(`📊 *Your Habits*\n${entries.map(([k,v]) => `• ${k}: ${v.streak}🔥 (Best: ${v.best})`).join('\n')}`);
}, { category: 'daily', desc: 'View habits' });

cmd('mood', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .mood <1-10> [note]');
    const score = parseInt(args[0]);
    const note = args.slice(1).join(' ') || '';
    const res = Daily.logMood(m.sender, score, note);
    await m.reply(`📊 Mood logged: ${score}/10\n📈 7-day avg: ${res.avg}\n💡 ${res.advice}`);
}, { category: 'daily', desc: 'Log your mood' });

cmd('moodgraph', async (m) => {
    const h = Daily.moodHistory(m.sender);
    if (!h.length) return m.reply('No mood data');
    const bars = h.slice(-10).map(e => {
        const bar = '█'.repeat(e.score) + '░'.repeat(10-e.score);
        return `${new Date(e.date).getDate()} ${bar} ${e.score}`;
    }).join('\n');
    await m.reply(`📈 *Mood History*\n\`\`\`\n${bars}\n\`\`\``);
}, { category: 'daily', desc: 'View mood graph' });

cmd('water', async (m, args) => {
    const ml = parseInt(args[0]) || 250;
    const res = Daily.drink(m.sender, ml);
    await m.reply(`💧 +${ml}ml\n${res.total}/${res.goal}ml (${res.pct}%)\n${res.msg}`);
}, { category: 'daily', desc: 'Track water intake', aliases: ['drink'] });

cmd('expense', async (m, args) => {
    if (args.length < 2) return m.reply('Usage: .expense <amount> <category> [note]');
    const res = Daily.spend(m.sender, args[0], args[1], args.slice(2).join(' '));
    await m.reply(`💸 Spent $${args[0]} on ${args[1]}\n📊 Today: $${res.today} | Month: $${res.total}`);
}, { category: 'daily', desc: 'Track expense', aliases: ['spend'] });

cmd('myexpenses', async (m) => {
    const ins = Daily.expenseInsight(m.sender);
    if (!ins) return m.reply('No expenses tracked');
    await m.reply(`📊 *30-Day Insight*\nTotal: $${ins.total}\nDaily Avg: $${ins.dailyAvg}\n🏆 Top: ${ins.top[0]} ($${ins.top[1].toFixed(2)})\n\n${ins.breakdown}`);
}, { category: 'daily', desc: 'View expense insights', aliases: ['budget'] });

cmd('grocery', async (m, args) => {
    if (!args.join(' ')) {
        const list = Daily.getGrocery(m.sender);
        return m.reply(`🛒 *Grocery List*\n${list.map((x,i) => `${i+1}. ${x}`).join('\n') || 'Empty'}`);
    }
    Daily.addGrocery(m.sender, args.join(' '));
    await m.reply('🛒 Added to list');
}, { category: 'daily', desc: 'Manage grocery list', aliases: ['groceries'] });

cmd('cleargrocery', async (m) => {
    Daily.clearGrocery(m.sender);
    await m.reply('🛒 List cleared');
}, { category: 'daily', desc: 'Clear grocery list' });

cmd('timer', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .timer <minutes> [label]');
    const mins = parseInt(args[0]);
    const label = args.slice(1).join(' ') || 'Timer';
    setTimeout(() => m.reply(`⏰ *Time's up!*\n${label}`), mins * 60000);
    await m.reply(`⏱️ ${label} set for ${mins} minutes`);
}, { category: 'daily', desc: 'Set a timer' });

cmd('alarm', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .alarm <HH:MM> [message]');
    const [h, min] = args[0].split(':').map(Number);
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, min);
    if (target < now) target.setDate(target.getDate() + 1);
    const diff = target - now;
    const msg = args.slice(1).join(' ') || 'Alarm ringing!';
    setTimeout(() => m.reply(`⏰ *ALARM!*\n📝 ${msg}`), diff);
    await m.reply(`⏰ Alarm set for ${args[0]}`);
}, { category: 'daily', desc: 'Set an alarm' });

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: HEALTH & FITNESS
// ═══════════════════════════════════════════════════════════════════════════

cmd('bmi', async (m, args) => {
    if (args.length < 2) return m.reply('Usage: .bmi <kg> <cm>');
    const res = Health.bmi(parseFloat(args[0]), parseFloat(args[1]));
    await m.reply(`⚖️ *BMI Result*\nValue: ${res.val}\nCategory: ${res.cat}\nIdeal weight: ${res.ideal[0]}-${res.ideal[1]}kg`);
}, { category: 'health', desc: 'Calculate BMI' });

cmd('bmr', async (m, args) => {
    if (args.length < 4) return m.reply('Usage: .bmr <kg> <cm> <age> <male/female>');
    const val = Health.bmr(parseFloat(args[0]), parseFloat(args[1]), parseInt(args[2]), args[3]);
    await m.reply(`🔥 *BMR:* ${val} calories/day`);
}, { category: 'health', desc: 'Calculate BMR' });

cmd('tdee', async (m, args) => {
    if (args.length < 2) return m.reply('Usage: .tdee <bmr> <sedentary/light/moderate/active/athlete>');
    const val = Health.tdee(parseInt(args[0]), args[1]);
    await m.reply(`⚡ *TDEE:* ${val} calories/day`);
}, { category: 'health', desc: 'Calculate TDEE' });

cmd('macros', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .macros <calories> [lose/maintain/gain]');
    const res = Health.macros(parseInt(args[0]), args[1]);
    await m.reply(`🥗 *Macros for ${args[0]} cal*\n🥩 Protein: ${res.protein}g\n🥑 Fat: ${res.fat}g\n🍚 Carbs: ${res.carbs}g`);
}, { category: 'health', desc: 'Calculate macros' });

cmd('watercalc', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .watercalc <kg>');
    await m.reply(`💧 Drink ~${Health.water(parseFloat(args[0]))}ml daily`);
}, { category: 'health', desc: 'Daily water recommendation' });

cmd('sleep', async (m) => {
    const cycles = Health.sleepWakeUp();
    await m.reply(`😴 *If you sleep now, wake up at:*\n${cycles.map((t,i) => `${i+1} cycle${i+1>1?'s':''}: ${t}`).join('\n')}\n\n💡 90min = 1 sleep cycle`);
}, { category: 'health', desc: 'Optimal wake-up times' });

cmd('heartrate', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .heartrate <age>');
    const z = Health.hrZones(parseInt(args[0]));
    await m.reply(`❤️ *HR Zones (Max: ${z.max})*\n🔥 Fat Burn: ${z.fatburn}\n🏃 Cardio: ${z.cardio}\n⚡ Peak: ${z.peak}`);
}, { category: 'health', desc: 'Heart rate zones' });

cmd('onerm', async (m, args) => {
    if (args.length < 2) return m.reply('Usage: .onerm <weight> <reps>');
    const rm = Health.oneRm(parseFloat(args[0]), parseInt(args[1]));
    await m.reply(`🏋️ Estimated 1RM: ${rm}kg`);
}, { category: 'health', desc: 'One-rep max calculator' });

cmd('bodyfat', async (m, args) => {
    if (args.length < 4) return m.reply('Usage: .bodyfat <male/female> <waist(cm)> <neck(cm)> <height(cm)> [hip(cm)]');
    const res = Health.bodyFat(args[0], parseFloat(args[1]), parseFloat(args[2]), parseFloat(args[3]), parseFloat(args[4]||0));
    await m.reply(`📊 Estimated body fat: ${res}%`);
}, { category: 'health', desc: 'Body fat percentage' });

cmd('workout', async (m, args) => {
    const type = args[0] || 'fullbody';
    const plan = Health.workout(type);
    await m.reply(`💪 *${type.toUpperCase()} Workout*\n${plan.map((x,i) => `${i+1}. ${x}`).join('\n')}`);
}, { category: 'health', desc: 'Get a workout plan', aliases: ['gym'] });

cmd('yoga', async (m, args) => {
    const p = Health.yoga(args[0]);
    await m.reply(`🧘 *${p.name}*\n⏱️ Hold: ${p.time}\n✨ Benefit: ${p.benefit}`);
}, { category: 'health', desc: 'Yoga pose of the day' });

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: FINANCE
// ═══════════════════════════════════════════════════════════════════════════

cmd('stock', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .stock <AAPL>');
    try {
        const s = await Finance.stock(args[0]);
        await m.reply(`📈 *${args[0].toUpperCase()}*\nPrice: $${s.price}\nChange: ${s.change}%\nPrev: $${s.prev}`);
    } catch(e) { m.reply('❌ Market data limit'); }
}, { category: 'finance', desc: 'Get stock price', cooldown: 3000 });

cmd('portfolio', async (m) => {
    const p = Finance.getPortfolio(m.sender);
    if (!p.length) return m.reply('No portfolio. Use .addstock/.addcrypto');
    let txt = `📊 *Your Portfolio*\n`;
    p.forEach((x,i) => { txt += `${i+1}. ${x.type} ${x.sym} x${x.qty} @ $${x.buy}\n`; });
    await m.reply(txt);
}, { category: 'finance', desc: 'View investment portfolio' });

cmd('addstock', async (m, args) => {
    if (args.length < 3) return m.reply('Usage: .addstock <SYM> <qty> <buyPrice>');
    Finance.addPortfolio(m.sender, 'stock', args[0], args[1], args[2]);
    await m.reply('✅ Added to portfolio');
}, { category: 'finance', desc: 'Add stock to portfolio' });

cmd('addcrypto', async (m, args) => {
    if (args.length < 3) return m.reply('Usage: .addcrypto <BTC> <qty> <buyPrice>');
    Finance.addPortfolio(m.sender, 'crypto', args[0], args[1], args[2]);
    await m.reply('✅ Added to portfolio');
}, { category: 'finance', desc: 'Add crypto to portfolio' });

cmd('tip', async (m, args) => {
    if (args.length < 2) return m.reply('Usage: .tip <amount> <percent> [people]');
    const res = Finance.tip(parseFloat(args[0]), parseInt(args[1]), parseInt(args[2]||1));
    await m.reply(`💰 *Tip Calculator*\nSubtotal: $${res.subtotal}\nTip (${args[1]}%): $${res.tip}\nTotal: $${res.total}\nPer person: $${res.each}`);
}, { category: 'finance', desc: 'Calculate tip' });

cmd('splitbill', async (m, args) => {
    await m.reply('🧾 Use: .splitbill item1:price,item2:price [tax%] [tip%]\nExample: .splitbill Burger:12,Fries:4,Drink:3 8 15');
}, { category: 'finance', desc: 'Split a bill' });

cmd('loan', async (m, args) => {
    if (args.length < 3) return m.reply('Usage: .loan <principal> <rate%> <months>');
    const res = Finance.emi(parseFloat(args[0]), parseFloat(args[1]), parseInt(args[2]));
    await m.reply(`🏦 *Loan EMI*\nEMI: $${res.emi}/month\nTotal: $${res.total}\nInterest: $${res.interest}`);
}, { category: 'finance', desc: 'Loan EMI calculator', aliases: ['emi'] });

cmd('savings', async (m, args) => {
    if (args.length < 2) return m.reply('Usage: .savings <goalAmount> <monthlySaving> [rate%]');
    const res = Finance.savings(parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2]||5));
    await m.reply(`🏦 Reach $${args[0]} in ~${res.years} years (${res.months} months)`);
}, { category: 'finance', desc: 'Savings goal calculator' });

cmd('crypto', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .crypto <bitcoin>');
    try {
        const c = await Finance.cryptoPrice(args[0].toLowerCase());
        await m.reply(`💰 *${args[0].toUpperCase()}*\nUSD: $${c.usd}\nEUR: €${c.eur}\n24h: ${c.change24h}%`);
    } catch { m.reply('❌ Crypto API error'); }
}, { category: 'finance', desc: 'Crypto price', aliases: ['coin'] });

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: SOCIAL MEDIA
// ═══════════════════════════════════════════════════════════════════════════

cmd('bio', async (m, args) => {
    const niche = args[0] || 'creator';
    await m.reply(`✍️ *Bio Idea*\n${Social.bios(niche)}`);
}, { category: 'social', desc: 'Generate a bio' });

cmd('hashtag', async (m, args) => {
    const topic = args[0] || 'love';
    await m.reply(`#️⃣ *Hashtags*\n${Social.hashtags(topic)}`);
}, { category: 'social', desc: 'Get hashtags', aliases: ['tags'] });

cmd('caption', async (m, args) => {
    const mood = args[0] || 'happy';
    await m.reply(`📝 *Caption*\n${Social.captions(mood)}`);
}, { category: 'social', desc: 'Generate a caption' });

cmd('username', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .username <name> [clean/dev/cool]');
    await m.reply(`👤 Suggested: ${Social.username(args[0], args[1])}`);
}, { category: 'social', desc: 'Generate a username' });

cmd('slogan', async (m, args) => {
    await m.reply(`💡 *Slogan:*\n"${Social.slogan(args[0] || 'business')}"`);
}, { category: 'social', desc: 'Generate a slogan' });

cmd('email', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .email <purpose>\nExample: .email request refund for order 123');
    const res = await AI.ultimateAI(`Write a professional, concise email for: ${args.join(' ')}`, m.sender, 'deepseek');
    await m.reply(`📧 *Draft:*\n\n${res.text}`);
}, { category: 'social', desc: 'Draft an email', aliases: ['draft'] });

cmd('invoice', async (m, args) => {
    if (args.length < 3) return m.reply('Usage: .invoice <to> <amount> <description>');
    const [to, amt, ...desc] = args;
    const inv = `━━━━━━━━━━━━━━━
📄 INVOICE #${Math.floor(Math.random()*100000)}
To: ${to}
Amount: $${amt}
For: ${desc.join(' ')}
Date: ${new Date().toLocaleDateString()}
Status: ⏳ PENDING
━━━━━━━━━━━━━━━`;
    await m.reply(inv);
}, { category: 'social', desc: 'Create a simple invoice' });

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: DEVELOPER
// ═══════════════════════════════════════════════════════════════════════════

cmd('uuid', async (m) => {
    await m.reply(`🔑 ${Dev.uuid()}`);
}, { category: 'dev', desc: 'Generate UUID' });

cmd('password', async (m, args) => {
    const len = parseInt(args[0]) || 16;
    const p = Dev.password(len);
    await m.reply(`🔐 *Password*\n\`\`\`\n${p.pass}\n\`\`\`\nEntropy: ${p.entropy}`);
}, { category: 'dev', desc: 'Generate secure password' });

cmd('json', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .json <json string>');
    const r = Dev.json(args.join(' '));
    if (r.valid) await m.reply(`✅ Valid (${r.keys} keys)\n\`\`\`json\n${r.pretty.slice(0,2000)}\n\`\`\``);
    else await m.reply(`❌ ${r.error}`);
}, { category: 'dev', desc: 'Validate/format JSON' });

cmd('regex', async (m, args) => {
    if (args.length < 3) return m.reply('Usage: .regex <pattern> <flags> <text>');
    const r = Dev.regex(args[0], args[1], args.slice(2).join(' '));
    await m.reply(`🔍 Matches: ${r.count}\n${r.matches.map((x,i) => `${i+1}. ${x}`).join('\n') || 'None'}`);
}, { category: 'dev', desc: 'Test regex' });

cmd('encode', async (m, args) => {
    if (args.length < 2) return m.reply('Usage: .encode <base64/url/html> <text>');
    await m.reply(Dev.encode(args[0], args.slice(1).join(' ')));
}, { category: 'dev', desc: 'Encode text' });

cmd('decode', async (m, args) => {
    if (args.length < 2) return m.reply('Usage: .decode <base64/url/html> <text>');
    await m.reply(Dev.decode(args[0], args.slice(1).join(' ')));
}, { category: 'dev', desc: 'Decode text' });

cmd('lorem', async (m, args) => {
    await m.reply(Dev.lorem(parseInt(args[0]) || 50));
}, { category: 'dev', desc: 'Generate Lorem Ipsum' });

cmd('palette', async (m) => {
    const c = Dev.palette();
    await m.reply(`🎨 *Color Palette*\n${c.map(x => `■ ${x}`).join('\n')}`);
}, { category: 'dev', desc: 'Generate color palette' });

cmd('qrvcard', async (m, args, nimesha) => {
    if (args.length < 3) return m.reply('Usage: .qrvcard <name> <phone> <email>');
    const data = Dev.qrData('vcard', { name: args[0], phone: args[1], email: args[2] });
    const buf = await Tools.qr(data);
    await nimesha.sendMessage(m.chat, { image: buf, caption: `📇 vCard QR for ${args[0]}` }, { quoted: m });
}, { category: 'dev', desc: 'Generate vCard QR code' });

cmd('qrwifi', async (m, args, nimesha) => {
    if (args.length < 2) return m.reply('Usage: .qrwifi <SSID> <password>');
    const data = Dev.qrData('wifi', { ssid: args[0], pass: args[1] });
    const buf = await Tools.qr(data);
    await nimesha.sendMessage(m.chat, { image: buf, caption: `📶 WiFi: ${args[0]}` }, { quoted: m });
}, { category: 'dev', desc: 'Generate WiFi QR code' });

cmd('checksum', async (m, args, nimesha) => {
    if (!m.quoted || !m.quoted.isMedia) return m.reply('Reply to a file');
    const buf = await m.quoted.download();
    const sha = Dev.checksum(buf, 'sha256');
    const md5 = Dev.checksum(buf, 'md5');
    await m.reply(`📁 Checksums\nSHA256: ${sha}\nMD5: ${md5}`);
}, { category: 'dev', desc: 'Get file checksums' });

// ============================================================
// CONTINUED IN PART 6 – TRAVEL, FOOD, MAIN HANDLER EXPORT
// ============================================================

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: TRAVEL
// ═══════════════════════════════════════════════════════════════════════════

cmd('packing', async (m, args) => {
    if (args.length < 3) return m.reply('Usage: .packing <destination> <days> <hot/cold/rain>');
    const list = Travel.packing(args[0], parseInt(args[1]), args[2]);
    await m.reply(`🎒 *Packing List for ${args[0]}*\n${list.map((x,i) => `${i+1}. ${x}`).join('\n')}`);
}, { category: 'travel', desc: 'Generate packing list' });

cmd('worldclock', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .worldclock <city>');
    const t = Travel.timezone(args[0]);
    await m.reply(`🌍 *${t.city}*\n🕐 ${t.time}\n📅 ${t.date}\n${t.offset}`);
}, { category: 'travel', desc: 'World clock', aliases: ['time'] });

cmd('phrasebook', async (m, args) => {
    const lang = args[0] || 'spanish';
    const p = Travel.phrases(lang);
    await m.reply(`🗣️ *${lang.toUpperCase()} Phrases*\n${Object.entries(p).map(([k,v]) => `*${k}:* ${v}`).join('\n')}`);
}, { category: 'travel', desc: 'Basic travel phrases', aliases: ['phrases'] });

cmd('itinerary', async (m, args) => {
    if (args.length < 2) return m.reply('Usage: .itinerary <city> <days>');
    const plan = Travel.itinerary(args[0], parseInt(args[1]));
    await m.reply(`🗺️ *${args[0]} ${args[1]}-Day Plan*\n${plan.map((x,i) => `Day ${i+1}: ${x}`).join('\n')}`);
}, { category: 'travel', desc: 'Generate travel itinerary' });

cmd('convert', async (m, args) => {
    if (args.length < 3) return m.reply('Usage: .convert <value> <from> <to>\nUnits: km, mi, kg, lb, c, f, l, gal');
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
}, { category: 'travel', desc: 'Unit converter', aliases: ['unit'] });

cmd('detectlang', async (m, args) => {
    if (!args.join(' ')) return m.reply('Usage: .detectlang <text>');
    const res = await AI.ultimateAI(`Detect the language of this text and reply with ONLY the language name: "${args.join(' ')}". If it's Swahili say Swahili.`, m.sender, 'deepseek');
    await m.reply(`🌐 Detected: ${res.text.replace(/\./g,'')}`);
}, { category: 'travel', desc: 'Detect language of text' });

cmd('readtime', async (m, args) => {
    const words = args.join(' ').split(/\s+/).length;
    const mins = Math.ceil(words / 200);
    await m.reply(`📖 ${words} words ≈ ${mins} min read`);
}, { category: 'travel', desc: 'Estimate reading time' });

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY: FOOD & DINING
// ═══════════════════════════════════════════════════════════════════════════

cmd('recipe', async (m, args, nimesha) => {
    if (!args.join(' ')) return m.reply('Usage: .recipe <dish>');
    const r = await Food.recipe(args.join(' '));
    if (!r) return m.reply('Recipe not found');
    await nimesha.sendMessage(m.chat, { image: { url: r.thumb }, caption: `🍽️ *${r.name}*\n📍 ${r.area} | ${r.category}\n\n*Ingredients:*\n${r.ingredients.join('\n')}\n\n*Instructions:*\n${r.instructions.slice(0,800)}...` }, { quoted: m });
}, { category: 'food', desc: 'Get a recipe' });

cmd('cocktail', async (m, args, nimesha) => {
    const c = await Food.cocktail(args.join(' ') || 'margarita');
    if (!c) return m.reply('Drink not found');
    await nimesha.sendMessage(m.chat, { image: { url: c.thumb }, caption: `🍸 *${c.name}*\n🥃 Glass: ${c.glass}\n\n*Ingredients:*\n${c.ingredients.join(', ')}\n\n*How to make:*\n${c.instructions}` }, { quoted: m });
}, { category: 'food', desc: 'Get a cocktail recipe' });

cmd('substitute', async (m, args) => {
    if (!args[0]) return m.reply('Usage: .substitute <ingredient>');
    await m.reply(`🔄 *Substitute for ${args[0]}*\n${Food.substitute(args[0])}`);
}, { category: 'food', desc: 'Ingredient substitution' });

cmd('mealprep', async (m, args) => {
    const plan = Food.mealPrep(args[0] || 'balanced');
    await m.reply(`🥗 *${(args[0]||'balanced').toUpperCase()} Meal Plan*\n${plan.map((x,i) => `${i+1}. ${x}`).join('\n')}`);
}, { category: 'food', desc: 'Meal prep ideas' });

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN MESSAGE HANDLER EXPORT
// ═══════════════════════════════════════════════════════════════════════════

module.exports = async (nimesha, m, msg, store) => {
    try {
        if (!m.message || m.isBot) return;

        const botNumber = await nimesha.decodeJid(nimesha.user.id);
        const prefix = global.prefix || '.';

        // AFK Mention Alert
        if (m.mentionedJid?.length) {
            for (const jid of m.mentionedJid) {
                if (global.db.afk?.[jid]) {
                    const afk = global.db.afk[jid];
                    const mins = Math.floor((Date.now() - afk.time) / 60000);
                    await m.reply(`😴 @${jid.split('@')[0]} is AFK: ${afk.reason} (${mins}m ago)`, { mentions: [jid] });
                }
            }
        }

        // Auto-sticker in groups
        if (m.isGroup && global.db.groups[m.chat]?.autosticker && m.isMedia && !m.body?.startsWith(prefix)) {
            const buf = await m.download();
            await nimesha.sendAsSticker(m.chat, buf, m, { packname: global.botname, author: global.author }).catch(() => {});
        }

        // Command detection
        if (!m.body || !m.body.startsWith(prefix)) return;

        const args = m.body.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const startTime = Date.now();

        // Anti-spam / flood
        if (antiSpam.isBlacklisted(m.sender)) return;
        if (antiSpam.isFlooding(m.sender)) {
            antiSpam.report(m.sender, 'Flood');
            return m.reply('🚫 You are flooding. Cool down.');
        }
        if (antiSpam.isFiltered(m.sender, command)) return;
        antiSpam.addFilter(m.sender, command, 2000);

        // Command lookup
        const meta = Commands.get(command) || Commands.get(Aliases.get(command));
        if (!meta) return; // Silent for unknown commands

        // Permission gates
        if (meta.owner && !m.fromMe) return m.reply('👑 Owner only');
        if (meta.premium) {
            const prem = global.db.premium.find(p => p.id === m.sender && p.expired > Date.now());
            if (!prem && !m.fromMe) return m.reply('👑 Premium only');
        }
        if (meta.group && !m.isGroup) return m.reply('Group only');
        if (meta.admin && !m.isAdmin) return m.reply('Admin only');
        if (meta.cooldown && antiSpam.checkCooldown(m.sender, command)) {
            return m.reply('⏳ Command on cooldown');
        }
        if (global.db.banned.includes(m.sender)) return m.reply('🚫 You are banned');

        // XP & Leveling
        if (global.db.users[m.sender] && !m.fromMe) {
            const xpGain = Math.floor(Math.random() * 15) + 5;
            const lv = Economy.addXP(m.sender, xpGain);
            if (lv.leveledUp && global.db.groups[m.chat]?.autolevelup) {
                await m.reply(`🎉 @${m.sender.split('@')[0]} leveled up to ${lv.newLvl}!`, { mentions: [m.sender] });
            }
        }

        // Group filters
        if (m.isGroup && global.db.groups[m.chat]?.filters) {
            const bodyLower = m.body.toLowerCase();
            for (const [trigger, response] of Object.entries(global.db.groups[m.chat].filters)) {
                if (bodyLower.includes(trigger)) {
                    await m.reply(response);
                    break;
                }
            }
        }

        // Execute command
        const ctx = { prefix, args, store, startTime, latency: Date.now() - startTime };
        await meta.handler(m, args, nimesha, ctx);

    } catch (err) {
        console.error('COMMAND ERROR:', err);
        await m.reply(`⚠️ *Crash Handler*\n\`\`\`${err.message}\`\`\``);
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  END OF FILE – MAUREONIX v5.0.0
// ═══════════════════════════════════════════════════════════════════════════