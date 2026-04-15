/**
 * MAUREONIX — Quantum Menu Engine v5.0
 * Created by Infinite Vybeflix
 *
 * DESIGN:
 *   .menu        → master.png  + branded text + category carousel quick_reply buttons
 *   .botmenu     → bot.png     + command list + command buttons
 *   .groupmenu   → group.png   + command list + command buttons
 *   .downloadmenu→ download.png
 *   .aimenu      → ai.png
 *   .stickersmenu→ sticker.png
 *   .gamemenu    → games.png
 *   .funmenu     → fun.png
 *   .searchmenu  → search.png
 *   .moviesmenu  → movies.png   (NEW)
 *   .ownermenu   → owner.png
 *   .adminmenu   → admin.png
 *
 *   Images: ALL pre-generated PNG files. Read directly from database/menucards/.
 *   NO Sharp at runtime. NO SVG. ZERO image generation errors possible.
 */

'use strict';

const fs     = require('fs');
const path   = require('path');
const chalk  = require('chalk');
const moment = require('moment-timezone');

// ─────────────────────────────────────────────────────────────────────────────
// Pre-generated card location
// ─────────────────────────────────────────────────────────────────────────────
const CARDS_DIR = path.join(__dirname, '../database/menucards');

/** Read a pre-generated card PNG. Returns Buffer or null — never throws. */
function readCard(name) {
    try {
        const p = path.join(CARDS_DIR, `${name}.png`);
        if (fs.existsSync(p)) return fs.readFileSync(p);
    } catch (e) {
        console.log(`[Menu] readCard(${name}) error: ${e.message}`);
    }
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MENU CATALOGUE
// ─────────────────────────────────────────────────────────────────────────────
const MENU_CATALOGUE = {
    bot: {
        title: 'BOT SYSTEM',
        icon:  '🤖',
        file:  'bot',
        cmds: [
            { cmd: 'alive',        desc: 'Check bot is online' },
            { cmd: 'ping',         desc: 'Response time' },
            { cmd: 'speed',        desc: 'Full speed test' },
            { cmd: 'runtime',      desc: 'Bot uptime' },
            { cmd: 'info',         desc: 'Bot information' },
            { cmd: 'help',         desc: 'Help centre' },
            { cmd: 'vv',           desc: 'Reveal view once' },
            { cmd: 'jid',          desc: 'Get JID info' },
            { cmd: 'github',       desc: 'Source code' },
            { cmd: 'update',       desc: 'Check for updates' },
            { cmd: 'privacy',      desc: 'Bot privacy settings' },
        ],
    },
    group: {
        title: 'GROUP CONTROL',
        icon:  '👥',
        file:  'group',
        cmds: [
            { cmd: 'tagall',       desc: 'Tag all members' },
            { cmd: 'hidetag',      desc: 'Hidden tag all' },
            { cmd: 'add',          desc: 'Add a member' },
            { cmd: 'kick',         desc: 'Remove a member' },
            { cmd: 'promote',      desc: 'Make admin' },
            { cmd: 'demote',       desc: 'Remove admin' },
            { cmd: 'warn',         desc: 'Warn a user' },
            { cmd: 'votekick',     desc: 'Vote to kick' },
            { cmd: 'poll',         desc: 'Create a poll' },
            { cmd: 'groupinfo',    desc: 'Group info' },
            { cmd: 'linkgroup',    desc: 'Invite link' },
            { cmd: 'revoke',       desc: 'Reset invite link' },
            { cmd: 'welcome',      desc: 'Toggle welcome' },
            { cmd: 'goodbye',      desc: 'Toggle goodbye' },
            { cmd: 'setwelcome',   desc: 'Custom welcome text' },
            { cmd: 'setleave',     desc: 'Custom goodbye text' },
            { cmd: 'staff',        desc: 'List admins' },
        ],
    },
    download: {
        title: 'DOWNLOADS',
        icon:  '📥',
        file:  'download',
        cmds: [
            { cmd: 'song',         desc: 'Download MP3' },
            { cmd: 'mp3',          desc: 'YouTube to MP3' },
            { cmd: 'play',         desc: 'Play & download' },
            { cmd: 'ytmp3',        desc: 'YT audio' },
            { cmd: 'video',        desc: 'Download video' },
            { cmd: 'mp4',          desc: 'YouTube to MP4' },
            { cmd: 'ytmp4',        desc: 'YT video' },
            { cmd: 'apk',          desc: 'Download APK' },
        ],
    },
    ai: {
        title: 'AI / INTELLIGENCE',
        icon:  '🧠',
        file:  'ai',
        cmds: [
            { cmd: 'gpt',          desc: 'GPT-4 AI chat' },
            { cmd: 'gemini',       desc: 'Google Gemini' },
            { cmd: 'llama3',       desc: 'Meta LLaMA3' },
            { cmd: 'ai',           desc: 'AI assistant' },
            { cmd: 'chatai',       desc: 'AI chatroom' },
            { cmd: 'imagine',      desc: 'AI image gen' },
            { cmd: 'flux',         desc: 'FLUX image' },
            { cmd: 'sora',         desc: 'Sora image' },
        ],
    },
    sticker: {
        title: 'STICKER & IMAGE',
        icon:  '🎨',
        file:  'sticker',
        cmds: [
            { cmd: 'sticker',      desc: 'Image to sticker' },
            { cmd: 's',            desc: 'Quick sticker' },
            { cmd: 'simage',       desc: 'Sticker to image' },
            { cmd: 'attp',         desc: 'Animated text sticker' },
            { cmd: 'removebg',     desc: 'Remove background' },
            { cmd: 'blur',         desc: 'Blur image' },
            { cmd: 'ss',           desc: 'Screenshot URL' },
            { cmd: 'tts',          desc: 'Text to speech' },
            { cmd: 'trt',          desc: 'Translate text' },
        ],
    },
    games: {
        title: 'GAMES ZONE',
        icon:  '🎮',
        file:  'games',
        cmds: [
            { cmd: 'slot',         desc: 'Slot machine' },
            { cmd: 'casino',       desc: 'Casino game' },
            { cmd: 'blackjack',    desc: 'Blackjack / 21' },
            { cmd: 'math',         desc: 'Math quiz' },
            { cmd: 'tictactoe',    desc: 'Tic Tac Toe PvP' },
            { cmd: 'suit',         desc: 'Rock Paper Scissors' },
            { cmd: 'daily',        desc: 'Daily reward' },
            { cmd: 'transfer',     desc: 'Transfer money' },
            { cmd: 'buy',          desc: 'Buy items' },
            { cmd: 'gamelist',     desc: 'Browse games (RAWG)' },
            { cmd: 'topgames',     desc: 'Top rated games' },
            { cmd: 'searchgame',   desc: 'Search a game' },
            { cmd: 'randomgame',   desc: 'Random game info' },
            { cmd: 'genre',        desc: 'Games by genre' },
        ],
    },
    fun: {
        title: 'FUN & VIBES',
        icon:  '😂',
        file:  'fun',
        cmds: [
            { cmd: 'joke',         desc: 'Random joke' },
            { cmd: 'quote',        desc: 'Inspirational quote' },
            { cmd: 'fact',         desc: 'Random fact' },
            { cmd: '8ball',        desc: 'Magic 8-ball' },
            { cmd: 'ship',         desc: 'Ship two people' },
            { cmd: 'simp',         desc: 'Simp meter' },
            { cmd: 'hack',         desc: 'Fake hack animation' },
            { cmd: 'compliment',   desc: 'Compliment someone' },
            { cmd: 'insult',       desc: 'Roast someone' },
            { cmd: 'flirt',        desc: 'Flirt line' },
            { cmd: 'wasted',       desc: 'Wasted overlay' },
            { cmd: 'jail',         desc: 'Jail overlay' },
            { cmd: 'triggered',    desc: 'Triggered GIF' },
            { cmd: 'shayari',      desc: 'Shayari poem' },
            { cmd: 'character',    desc: 'Character analysis' },
            { cmd: 'tweet',        desc: 'Fake tweet card' },
            { cmd: 'ytcomment',    desc: 'Fake YT comment' },
            { cmd: 'oogway',       desc: 'Master Oogway quote' },
            { cmd: 'namecard',     desc: 'Name card' },
            { cmd: 'hug',          desc: 'Hug anime GIF' },
            { cmd: 'kiss',         desc: 'Kiss anime GIF' },
            { cmd: 'pat',          desc: 'Pat anime GIF' },
            { cmd: 'slap',         desc: 'Slap anime GIF' },
            { cmd: 'neon',         desc: 'Neon text effect' },
            { cmd: 'fire',         desc: 'Fire text effect' },
            { cmd: 'glitch',       desc: 'Glitch text effect' },
        ],
    },
    search: {
        title: 'SEARCH ENGINE',
        icon:  '🔍',
        file:  'search',
        cmds: [
            { cmd: 'define',       desc: 'Dictionary lookup' },
            { cmd: 'weather',      desc: 'Weather by city' },
            { cmd: 'news',         desc: 'Latest news' },
            { cmd: 'lyrics',       desc: 'Song lyrics' },
            { cmd: 'cinfo',        desc: 'Country info' },
            { cmd: 'url',          desc: 'URL encode text' },
        ],
    },
    movies: {
        title: 'MOVIES & TV',
        icon:  '🎬',
        file:  'movies',
        cmds: [
            { cmd: 'movie',        desc: 'Movie details (OMDB)' },
            { cmd: 'series',       desc: 'TV series info' },
            { cmd: 'tv',           desc: 'TV series + episodes' },
            { cmd: 'topmovies',    desc: 'Top rated movies' },
            { cmd: 'upcoming',     desc: 'Upcoming releases' },
            { cmd: 'nowplaying',   desc: 'Currently in cinemas' },
            { cmd: 'trailer',      desc: 'Find movie trailer' },
            { cmd: 'celebrity',    desc: 'Celebrity profile' },
            { cmd: 'moviequote',   desc: 'Random movie quote' },
        ],
    },
    owner: {
        title: 'OWNER PANEL',
        icon:  '👑',
        file:  'owner',
        cmds: [
            { cmd: 'broadcast',    desc: 'Broadcast message' },
            { cmd: 'addprem',      desc: 'Add premium user' },
            { cmd: 'delprem',      desc: 'Remove premium user' },
            { cmd: 'setbotname',   desc: 'Change bot name' },
            { cmd: 'backup',       desc: 'Backup database' },
            { cmd: 'mode',         desc: 'Set bot mode (public/private/restricted)' },
            { cmd: 'allowgroup',   desc: 'Allow a group' },
            { cmd: 'restrictgroup',desc: 'Block a group' },
            { cmd: 'allowuser',    desc: 'Whitelist a user' },
            { cmd: 'adminonly',    desc: 'Toggle admin-only mode' },
            { cmd: 'update',       desc: 'Check for updates' },
        ],
    },
    admin: {
        title: 'ADMIN CONTROL',
        icon:  '🛡️',
        file:  'admin',
        cmds: [
            { cmd: 'pair',         desc: 'Pair two users' },
            { cmd: 'automod',      desc: 'Toggle auto-mod' },
            { cmd: 'antilink',     desc: 'Toggle anti-link' },
            { cmd: 'antispam',     desc: 'Toggle anti-spam' },
            { cmd: 'antidelete',   desc: 'Toggle anti-delete' },
            { cmd: 'antibadword',  desc: 'Toggle anti-badword' },
            { cmd: 'nsfw',         desc: 'Toggle NSFW filter' },
            { cmd: 'anticall',     desc: 'Toggle anti-call' },
            { cmd: 'antiviewonce', desc: 'Toggle anti-viewonce' },
            { cmd: 'poll',         desc: 'Create a poll' },
            { cmd: 'welcome',      desc: 'Toggle welcome msg' },
            { cmd: 'goodbye',      desc: 'Toggle goodbye msg' },
            { cmd: 'lock',         desc: 'Lock group' },
            { cmd: 'unlock',       desc: 'Unlock group' },
            { cmd: 'votekick',     desc: 'Vote to kick user' },
            { cmd: 'protections',  desc: 'View all protections' },
        ],
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Text builders
// ─────────────────────────────────────────────────────────────────────────────
function buildMainMenuText(m, prefix, setv, db) {
    const tz   = 'Asia/Colombo';
    const now  = moment.tz(tz);
    const time = now.format('HH:mm:ss');
    const date = now.format('DD/MM/YYYY');
    const day  = now.format('dddd');

    const greeting =
        time < '05:00:00' ? 'Good Night 🌉' :
        time < '11:00:00' ? 'Good Morning 🌄' :
        time < '15:00:00' ? 'Good Afternoon 🏙️' :
        time < '18:00:00' ? 'Good Evening 🌅' :
        time < '19:00:00' ? 'Good Evening 🌃' : 'Good Night 🌌';

    // Hot commands
    let hotLine = `${prefix}song · ${prefix}gpt · ${prefix}sticker · ${prefix}alive · ${prefix}movie`;
    try {
        const hits = Object.entries(db.hit || {})
            .filter(([c]) => c !== 'totalcmd' && c !== 'todaycmd')
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        if (hits.length >= 3) hotLine = hits.map(([c, h]) => `${prefix}${c} ·${h}x`).join('  ');
    } catch { /* use default */ }

    const totalCmds = Object.values(MENU_CATALOGUE).reduce((a, c) => a + c.cmds.length, 0);
    const owner     = global.ownerName || 'Infinite Vybeflix';
    const botVer    = global.BOT_VERSION || '3.0.0';
    const mode      = global.botMode || 'public';

    return `*╭━═✦〔 🦊 MAUREONIX 〕✦═━╮*
*│👋 ʜᴇʟʟᴏ* *${m.pushName || 'User'}* — ${greeting}
*│⚡ ᴘʀᴇꜰɪx:* ${prefix}
*│🧬 ᴠᴇʀꜱɪᴏɴ:* ${botVer}
*│📦 ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅꜱ:* ${totalCmds}+
*│👤 ᴏᴡɴᴇʀ:* ${owner}
*│🌐 ᴍᴏᴅᴇ:* ${mode}
*│📅 ᴅᴀᴛᴇ:* ${date}  *🕐* ${time}
*│📆 ᴅᴀʏ:* ${day}
*╰═✪═════════════✪═╯*

╭═✪═════════════✪═━
│ 🔥 *ʜᴏᴛ ᴄᴏᴍᴍᴀɴᴅꜱ*
├═✪═════════════✪═╮
│ ➠ ${hotLine}
╰═✪═════════════✪═╯

_Tap a category button below_ ✨`;
}

function buildCatMenuText(catKey, prefix, m) {
    const cat  = MENU_CATALOGUE[catKey];
    const ver  = global.BOT_VERSION || '3.0.0';

    const cmdLines = cat.cmds
        .map(({ cmd, desc }) => `│ ➠ *${prefix}${cmd}* — _${desc}_`)
        .join('\n');

    return `*╭━═✦〔 ${cat.icon} ${cat.title} 〕✦═━╮*
*│🦊 ᴍᴀᴜʀᴇᴏɴɪx* v${ver}
*│👤 ᴜꜱᴇʀ:* ${m.pushName || 'User'}
*│⚡ ᴘʀᴇꜰɪx:* ${prefix}
*│📦 ᴄᴏᴍᴍᴀɴᴅꜱ:* ${cat.cmds.length}
*╰═✪═════════════✪═╯*

╭═✪═════════════✪═━
│ ${cat.icon} *${cat.title}*
├═✪═════════════✪═╮
${cmdLines}
╰═✪═════════════✪═╯

_Tap any command button to execute_ ⚡`;
}

// ─────────────────────────────────────────────────────────────────────────────
// setTemplateMenu — .menu command
// ─────────────────────────────────────────────────────────────────────────────
async function setTemplateMenu(conn, type, m, prefix, setv, db, options = {}) {
    const text   = buildMainMenuText(m, prefix, setv, db);
    const footer = `© 🦊 MAUREONIX | By Infinite Vybeflix`;
    const img    = readCard('master');

    const buttons = [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '1️⃣ 🤖 BOT SYSTEM',     id: `${prefix}botmenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '2️⃣ 👥 GROUP CONTROL',  id: `${prefix}groupmenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '3️⃣ 📥 DOWNLOADS',      id: `${prefix}downloadmenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '4️⃣ 🧠 AI / CHAT',      id: `${prefix}aimenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '5️⃣ 🎨 STICKER & IMG',  id: `${prefix}stickersmenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '6️⃣ 🎮 GAMES ZONE',     id: `${prefix}gamemenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '7️⃣ 😂 FUN & VIBES',    id: `${prefix}funmenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '8️⃣ 🔍 SEARCH ENGINE',  id: `${prefix}searchmenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '9️⃣ 🎬 MOVIES & TV',    id: `${prefix}moviesmenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔟 🛡️ ADMIN CONTROL', id: `${prefix}adminmenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👑 OWNER PANEL',       id: `${prefix}ownermenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⚡ SPEED TEST',        id: `${prefix}speed` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '✅ BOT ALIVE',         id: `${prefix}alive` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📋 HELP',              id: `${prefix}help` }) },
    ];

    // Attempt 1 — image caption + buttons
    if (img) {
        try {
            await conn.sendListMsg(m.chat, {
                image: img, caption: text, footer, mentions: [m.sender], buttons,
            }, { quoted: m });
            return;
        } catch (e1) {
            console.log('[Menu] sendListMsg+image failed:', e1.message);
            // Attempt 2 — send image separately then buttons
            try {
                await conn.sendMessage(m.chat, { image: img, caption: text, mentions: [m.sender] }, { quoted: m });
                await conn.sendListMsg(m.chat, {
                    text: '_Tap a category to browse commands:_', footer, mentions: [m.sender], buttons,
                }, { quoted: m });
                return;
            } catch (e2) {
                console.log('[Menu] Image+buttons fallback failed:', e2.message);
            }
        }
    }

    // Attempt 3 — text + buttons, no image
    try {
        await conn.sendListMsg(m.chat, { text, footer, mentions: [m.sender], buttons }, { quoted: m });
        return;
    } catch (e3) {
        console.log('[Menu] sendListMsg text-only failed:', e3.message);
    }

    // Absolute last resort — plain text
    const plain = Object.entries(MENU_CATALOGUE)
        .map(([k, c]) => `${c.icon} *${c.title}:* ${prefix}${k}`)
        .join('\n');
    await conn.sendMessage(m.chat, {
        text: `${text}\n\n${plain}`, mentions: [m.sender],
    }, { quoted: m });
}

// ─────────────────────────────────────────────────────────────────────────────
// sendCategoryMenu — tapping a category button
// ─────────────────────────────────────────────────────────────────────────────
async function sendCategoryMenu(conn, m, prefix, catKey, db) {
    const cat = MENU_CATALOGUE[catKey];
    if (!cat) {
        return conn.sendMessage(m.chat, {
            text: `❌ Unknown category: *${catKey}*\nUse *${prefix}menu* to browse.`,
        }, { quoted: m });
    }

    const text    = buildCatMenuText(catKey, prefix, m);
    const footer  = `© 🦊 MAUREONIX | ${cat.title}`;
    const img     = readCard(cat.file);

    // Build command buttons (max ~12 to avoid Baileys limit)
    const topCmds = cat.cmds.slice(0, 12);
    const buttons = topCmds.map(({ cmd }) => ({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({ display_text: `${cmd}`, id: `${prefix}${cmd}` }),
    }));
    buttons.push({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({ display_text: '📋 Back to Menu', id: `${prefix}menu` }),
    });

    // Attempt 1 — image + text + buttons
    if (img) {
        try {
            await conn.sendListMsg(m.chat, {
                image: img, caption: text, footer, mentions: [m.sender], buttons,
            }, { quoted: m });
            return;
        } catch (e1) {
            console.log(`[Menu:${catKey}] sendListMsg+image failed: ${e1.message}`);
            // Attempt 2 — image first, then buttons
            try {
                await conn.sendMessage(m.chat, { image: img, caption: text, mentions: [m.sender] }, { quoted: m });
                await conn.sendListMsg(m.chat, {
                    text: `*${cat.icon} ${cat.title}* — Tap a command:`, footer, mentions: [m.sender], buttons,
                }, { quoted: m });
                return;
            } catch (e2) {
                console.log(`[Menu:${catKey}] Image+buttons fallback failed: ${e2.message}`);
            }
        }
    }

    // Attempt 3 — text + buttons only
    try {
        await conn.sendListMsg(m.chat, { text, footer, mentions: [m.sender], buttons }, { quoted: m });
        return;
    } catch (e3) {
        console.log(`[Menu:${catKey}] sendListMsg text-only failed: ${e3.message}`);
    }

    // Last resort — plain text list
    const plain = cat.cmds.map(({ cmd, desc }) => `• ${prefix}${cmd} — ${desc}`).join('\n');
    await conn.sendMessage(m.chat, {
        text: `${cat.icon} *${cat.title}*\n\n${plain}`, mentions: [m.sender],
    }, { quoted: m });
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
module.exports = { setTemplateMenu, sendCategoryMenu, MENU_CATALOGUE };

// Hot-reload watcher
let _wf = require.resolve(__filename);
fs.watchFile(_wf, () => {
    fs.unwatchFile(_wf);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[_wf];
    require(_wf);
});
