/**
 * MAUREONIX - Quantum Menu Engine v4.0
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN DECISIONS:
 *
 *  .menu   → Instant WhatsApp native LIST message (sections + rows).
 *            NO image generation. Zero blocking. Lightning fast.
 *            Beautiful, categorised, tappable rows.
 *
 *  .allmenu → Generates the master image THEN sends it.
 *             This is the only place image generation happens on demand.
 *
 *  Category menus (botmenu, gamemenu, etc.)
 *          → Sends category card image + quick_reply buttons list.
 *            Image generation wrapped in try/catch — if it fails
 *            the buttons still go out. Never blocks the user.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs    = require('fs');
const chalk = require('chalk');
const moment = require('moment-timezone');

// ── Catalogue: what each category contains ───────────────────────────────────
const CAT = {
    botmenu: {
        title: 'BOT SYSTEM',
        desc:  'Alive · Ping · Speed · Runtime · Info · Block',
        cmds:  ['alive','ping','speed','runtime','info','owner','vv','jid','github','staff','block','unblock','listblock','help','privacy'],
    },
    groupmenu: {
        title: 'GROUP CONTROL',
        desc:  'Tags · Kick · Ban · Promote · Demote · Protect',
        cmds:  ['tagall','hidetag','add','kick','ban','unban','promote','demote','warn','unwarn','votekick','poll','setname','setdesc','linkgroup','revoke','setwelcome','setleave'],
    },
    downloadmenu: {
        title: 'DOWNLOADS',
        desc:  'Song · MP3 · Play · Video · MP4 · YouTube',
        cmds:  ['song','mp3','play','ytmp3','video','mp4','ytmp4'],
    },
    aimenu: {
        title: 'AI / INTELLIGENCE',
        desc:  'GPT · Gemini · LLaMA · Image Gen · Chat AI',
        cmds:  ['gpt','gemini','llama3','ai','chatai','imagine','flux','sora'],
    },
    stickersmenu: {
        title: 'STICKER & IMAGE',
        desc:  'Make · ATTP · Remove BG · Blur · Screenshot',
        cmds:  ['sticker','s','simage','attp','removebg','blur','ss','tts','trt'],
    },
    gamemenu: {
        title: 'GAMES ZONE',
        desc:  'Slot · Casino · Blackjack · Math · RAWG API',
        cmds:  ['slot','casino','blackjack','math','tictactoe','suit','daily','transfer','buy','gamelist','topgames','searchgame','randomgame','genre'],
    },
    funmenu: {
        title: 'FUN & VIBES',
        desc:  'Jokes · Ship · Hack · Wasted · Effects · Anime',
        cmds:  ['joke','quote','fact','8ball','ship','simp','hack','compliment','insult','flirt','wasted','jail','triggered','shayari','character','tweet','ytcomment','oogway','namecard'],
    },
    searchmenu: {
        title: 'SEARCH ENGINE',
        desc:  'Google · Dictionary · Weather · News · Lyrics',
        cmds:  ['google','ytsearch','define','weather','news','lyrics','cinfo'],
    },
    moviesmenu: {
        title: 'MOVIES & TV',
        desc:  'OMDB · TMDB · Top Rated · Upcoming · Celebrity',
        cmds:  ['movie','series','topmovies','upcoming','nowplaying','celebrity','movierec','moviequote','trailer'],
    },
    ownermenu: {
        title: 'OWNER PANEL',
        desc:  'Broadcast · Premium · Mode · Update · Backup',
        cmds:  ['broadcast','addprem','delprem','addowner','delowner','setbotname','backup','mode','allowgroup','restrictgroup','allowuser','update','shutdown','restart'],
    },
    adminmenu: {
        title: 'ADMIN CONTROL',
        desc:  'AutoMod · Protections · Poll · Lock · Pair',
        cmds:  ['pair','automod','antilink','antispam','antidelete','antibadword','nsfw','anticall','antiviewonce','poll','welcome','goodbye','lock','unlock','votekick','protections'],
    },
};

// ── Native WhatsApp list sections ─────────────────────────────────────────────
// Each section has a title + rows. Rows appear as tappable list items.
const buildSections = (prefix) => [
    {
        title: 'SYSTEM & TOOLS',
        rows: [
            { title: 'BOT',        rowId: `${prefix}botmenu`,      description: 'Alive · Ping · Speed · Runtime · Info' },
            { title: 'GROUP',      rowId: `${prefix}groupmenu`,    description: 'Tags · Kick · Ban · Promote · Protect' },
            { title: 'DOWNLOADS',  rowId: `${prefix}downloadmenu`, description: 'Song · MP3 · Video · MP4 · YouTube' },
            { title: 'SEARCH',     rowId: `${prefix}searchmenu`,   description: 'Google · Dictionary · Weather · News' },
        ],
    },
    {
        title: 'ENTERTAINMENT',
        rows: [
            { title: 'AI',         rowId: `${prefix}aimenu`,       description: 'GPT · Gemini · LLaMA · Image Gen' },
            { title: 'STICKER',    rowId: `${prefix}stickersmenu`, description: 'Make · ATTP · Remove BG · Blur' },
            { title: 'GAMES',      rowId: `${prefix}gamemenu`,     description: 'Slot · Casino · Blackjack · RAWG' },
            { title: 'FUN',        rowId: `${prefix}funmenu`,      description: 'Jokes · Ship · Hack · Wasted · Effects' },
            { title: 'MOVIES & TV',rowId: `${prefix}moviesmenu`,   description: 'OMDB · TMDB · Top Rated · Upcoming' },
        ],
    },
    {
        title: 'CONTROL',
        rows: [
            { title: 'ADMIN',      rowId: `${prefix}adminmenu`,    description: 'AutoMod · Protections · Poll · Lock' },
            { title: 'OWNER',      rowId: `${prefix}ownermenu`,    description: 'Broadcast · Premium · Mode · Update' },
        ],
    },
    {
        title: 'QUICK ACTIONS',
        rows: [
            { title: 'Speed Test', rowId: `${prefix}speed`,    description: 'Check bot response time now' },
            { title: 'Bot Alive',  rowId: `${prefix}alive`,    description: 'Confirm bot is online' },
            { title: 'Full Image Menu', rowId: `${prefix}allmenu`, description: 'View visual command map image' },
            { title: 'Help',       rowId: `${prefix}help`,     description: 'Full help centre' },
        ],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// setTemplateMenu  — called when user sends  .menu
// FAST: sends native list only, zero image generation
// ─────────────────────────────────────────────────────────────────────────────
async function setTemplateMenu(conn, type, m, prefix, setv, db, options = {}) {
    const tz  = 'Asia/Colombo';
    const now = moment.tz(tz);
    const date = now.format('DD/MM/YYYY');
    const time = now.format('HH:mm:ss');
    const day  = now.format('dddd');

    const hr = now.format('HH:mm:ss');
    const greeting =
        hr < '05:00:00' ? 'Good Night' :
        hr < '11:00:00' ? 'Good Morning' :
        hr < '15:00:00' ? 'Good Afternoon' :
        hr < '19:00:00' ? 'Good Evening' : 'Good Night';

    // Top commands from hit tracker
    let hotCmds = `${prefix}song · ${prefix}gpt · ${prefix}sticker · ${prefix}alive`;
    try {
        const hits = Object.entries(db.hit || {})
            .filter(([c]) => c !== 'totalcmd' && c !== 'todaycmd')
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        if (hits.length >= 3) hotCmds = hits.map(([c, h]) => `${prefix}${c} (${h}x)`).join('  ·  ');
    } catch { /* keep default */ }

    const header =
`╔══[ *MAUREONIX COMMAND HUB* ]══╗

*${greeting}*, *${m.pushName || 'User'}*! 

 Date: ${date}  |  Time: ${time}
 Day: ${day}

 HOT: ${hotCmds}

_Tap the button below to browse all categories_ `;

    const sections = buildSections(prefix);

    // Try native WhatsApp list (best experience)
    let sent = false;
    try {
        await conn.sendMessage(m.chat, {
            text:       header,
            footer:     'MAUREONIX | By Infinite Vybeflix',
            title:      'MAUREONIX',
            buttonText: '  BROWSE ALL COMMANDS',
            sections,
            listType:   1,
            mentions:   [m.sender],
        }, { quoted: m });
        sent = true;
    } catch (listErr) {
        console.log('[Menu] Native list failed, trying sendListMsg:', listErr.message);
    }

    // Fallback: sendListMsg with quick_reply buttons
    if (!sent) {
        try {
            const buttons = Object.entries(CAT).map(([key, cat]) => ({
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({ display_text: cat.title, id: `${prefix}${key}` }),
            }));
            buttons.push(
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Speed Test',  id: `${prefix}speed` }) },
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Image Menu',  id: `${prefix}allmenu` }) },
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Help',        id: `${prefix}help` }) },
            );
            await conn.sendListMsg(m.chat, {
                text:     header,
                footer:   'MAUREONIX | By Infinite Vybeflix',
                mentions: [m.sender],
                buttons,
            }, { quoted: m });
            sent = true;
        } catch (e2) {
            console.log('[Menu] sendListMsg also failed:', e2.message);
        }
    }

    // Last resort: plain text
    if (!sent) {
        const plain = Object.entries(CAT)
            .map(([key, cat]) => `*${cat.title}*: ${prefix}${key}`)
            .join('\n');
        await conn.sendMessage(m.chat, {
            text: `${header}\n\n${plain}\n\n_Type any category command to see its menu_`,
            mentions: [m.sender],
        }, { quoted: m });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// sendCategoryMenu  — called when user taps a category
// Sends image + buttons.  Image failure NEVER blocks buttons.
// ─────────────────────────────────────────────────────────────────────────────
async function sendCategoryMenu(conn, m, prefix, menuKey, db) {
    const cat = CAT[menuKey];
    if (!cat) return m.reply(`Unknown category: ${menuKey}`);

    // Try image — wrapped tight, failure is silent
    try {
        const { generateCategoryCard } = require('./menuimage');
        const catKey = menuKey.replace(/menu$/, '');
        const img = await generateCategoryCard(catKey, {
            prefix,
            botName:    'MAUREONIX',
            ownerName:  (global.author || 'Infinite Vybeflix').replace(/[^\x20-\x7E]/g, '').trim(),
            memberName: (m.pushName || 'User').replace(/[^\x20-\x7E]/g, '').trim(),
        });
        await conn.sendMessage(m.chat, {
            image:   img,
            caption: `*${cat.title}*\n_Tap any command below to execute it instantly_`,
        }, { quoted: m });
    } catch (imgErr) {
        console.log(`[Menu] Category image failed (${menuKey}): ${imgErr.message}`);
        // Continue — buttons will still go out below
    }

    // Always send buttons
    const buttons = cat.cmds.map(cmd => ({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({ display_text: `> ${cmd}`, id: `${prefix}${cmd}` }),
    }));
    buttons.push({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({ display_text: 'Back to Menu', id: `${prefix}menu` }),
    });

    try {
        await conn.sendListMsg(m.chat, {
            text:     `*${cat.title}*\n\n${cat.desc}\n\nTap any command to run it instantly.\nPrefix: *${prefix}*`,
            footer:   'MAUREONIX | Infinite Vybeflix',
            mentions: [m.sender],
            buttons,
        }, { quoted: m });
    } catch (btnErr) {
        // Plain text absolute last resort
        await conn.sendMessage(m.chat, {
            text: `*${cat.title}*\n\n${cat.cmds.map(c => `${prefix}${c}`).join('\n')}`,
            mentions: [m.sender],
        }, { quoted: m });
    }
}

module.exports = { setTemplateMenu, sendCategoryMenu, CAT };

// Hot-reload watcher
let _f = require.resolve(__filename);
fs.watchFile(_f, () => {
    fs.unwatchFile(_f);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[_f];
    require(_f);
});
