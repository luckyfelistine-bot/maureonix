'use strict';
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  🦊 MAUREONIX — QUANTUM SPLIT MENU v3.0                     ║
 * ║                                                              ║
 * ║  DESIGN — Totally different from any other WhatsApp bot:     ║
 * ║  Step 1 → Sends a Sharp-generated image (fox logo + grid)    ║
 * ║  Step 2 → Sends a native WhatsApp LIST MESSAGE with sections ║
 * ║           (not button rows — opens a scrollable category     ║
 * ║            picker that looks like an in-app menu)            ║
 * ║                                                              ║
 * ║  Sub-menus: also send a category card image THEN a list      ║
 * ║  of clickable commands as quick_reply buttons.               ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const fs    = require('fs');
const chalk = require('chalk');
const moment = require('moment-timezone');

// ── Section definitions for the native list ───────────────────────────────
const SECTIONS = [
    {
        title: '⚡ CORE SYSTEM',
        rows: [
            { title:'🤖  BOT',         rowId:'botmenu',      description:'Alive · Ping · Speed · Runtime · Info · JID' },
            { title:'👥  GROUP',        rowId:'groupmenu',    description:'TagAll · Kick · Ban · Promote · Warn · Poll' },
            { title:'⬇️  DOWNLOAD',     rowId:'downloadmenu', description:'Song · MP3 · Video · MP4 · YT · All formats' },
            { title:'🔍  SEARCH',       rowId:'searchmenu',   description:'Google · Dictionary · Weather · News · Country' },
        ]
    },
    {
        title: '🎭 ENTERTAINMENT',
        rows: [
            { title:'🧠  AI',           rowId:'aimenu',       description:'GPT · Gemini · LLaMA · Imagine · Flux · Sora' },
            { title:'🎨  STICKER',      rowId:'stickersmenu', description:'Make · ATTP · Remove BG · Blur · Screenshot' },
            { title:'🎮  GAMES',        rowId:'gamemenu',     description:'Slot · Casino · Blackjack · Chess · RAWG API' },
            { title:'😂  FUN',          rowId:'funmenu',      description:'Jokes · Ship · Hack · Wasted · Triggered · Anime' },
            { title:'🎬  MOVIES & TV',  rowId:'moviesmenu',   description:'OMDB · TMDB · Top Rated · Upcoming · Trailers' },
        ]
    },
    {
        title: '🔐 ADMINISTRATION',
        rows: [
            { title:'🛡️  ADMIN CTRL',   rowId:'adminmenu',    description:'AutoMod · Protections · Lock · VoteKick · Poll' },
            { title:'👑  OWNER PANEL',  rowId:'ownermenu',    description:'Mode · Broadcast · Premium · Update · Backup' },
        ]
    },
    {
        title: '⚡ QUICK ACTIONS',
        rows: [
            { title:'⚡  Speed Test',   rowId:'speed',        description:'Check bot response & network latency' },
            { title:'✅  Bot Alive',    rowId:'alive',        description:'Check if bot is online and running' },
            { title:'🖼️  Visual Map',   rowId:'allmenu',      description:'Full image command map (beautiful poster)' },
            { title:'📋  Help Centre',  rowId:'help',         description:'Full command guide with examples' },
        ]
    },
];

// ── Category command detail maps ──────────────────────────────────────────
const CAT_CMDS = {
    botmenu:      { icon:'🤖', title:'BOT SYSTEM',      cmds:['alive','ping','speed','runtime','info','owner','vv','jid','github','staff','groupinfo','block','unblock','listblock','allblock','allunblock','privacy','help'] },
    groupmenu:    { icon:'👥', title:'GROUP CONTROL',    cmds:['tagall','hidetag','totag','add','kick','ban','unban','promote','demote','warn','unwarn','votekick','poll','setname','setdesc','linkgroup','revoke','setwelcome','setleave','welcome','goodbye','lock','unlock'] },
    downloadmenu: { icon:'⬇️', title:'DOWNLOADS',        cmds:['song','mp3','play','ytmp3','video','mp4','ytmp4'] },
    aimenu:       { icon:'🧠', title:'AI INTELLIGENCE',  cmds:['gpt','gemini','llama3','ai','chatai','imagine','flux','sora'] },
    stickersmenu: { icon:'🎨', title:'STICKER & IMAGE',  cmds:['sticker','s','simage','toimg','attp','removebg','blur','ss','tts','trt'] },
    gamemenu:     { icon:'🎮', title:'GAMES',             cmds:['slot','casino','blackjack','math','tictactoe','suit','chess','akinator','snakeladder','daily','transfer','buy','gamelist','topgames','searchgame','randomgame','genre'] },
    funmenu:      { icon:'😂', title:'FUN & VIBES',       cmds:['joke','quote','fact','8ball','ship','simp','hack','compliment','insult','flirt','wasted','jail','triggered','shayari','character','tweet','ytcomment','oogway','namecard','goodnight','roseday','stupid'] },
    searchmenu:   { icon:'🔍', title:'SEARCH ENGINE',    cmds:['define','weather','news','lyrics','cinfo','apk'] },
    moviesmenu:   { icon:'🎬', title:'MOVIES & TV',       cmds:['movie','tv','trailer','topmovies','upcoming','nowplaying','celebrity','moviequote'] },
    ownermenu:    { icon:'👑', title:'OWNER PANEL',       cmds:['shutdown','restart','broadcast','addprem','delprem','addowner','delowner','setbotname','backup','mode','restrictgroup','allowgroup','allowuser','update','adminonly','adduang','addlimit','ban','unban'] },
    adminmenu:    { icon:'🛡️', title:'ADMIN CONTROL',    cmds:['pair','automod','antilink','antispam','antidelete','antibadword','anticall','antiviewonce','nsfw','antitoxic','antivirtex','poll','welcome','goodbye','lock','unlock','votekick','protections','setwelcome','setleave'] },
};

// ── Main menu function ─────────────────────────────────────────────────────
async function setTemplateMenu(nimesha, type, m, prefix, setv, db, options={}) {
    const now  = moment.tz('Asia/Colombo');
    const date = now.format('DD/MM/YYYY');
    const time = now.format('HH:mm:ss');
    const day  = now.format('dddd');
    const greeting =
        time < '05:00:00' ? '🌉 Good Night'    :
        time < '11:00:00' ? '🌄 Good Morning'  :
        time < '15:00:00' ? '🏙️ Good Afternoon' :
        time < '19:00:00' ? '🌅 Good Evening'   : '🌌 Good Night';

    // Top commands
    let topCmds = `${prefix}song  ·  ${prefix}gpt  ·  ${prefix}sticker  ·  ${prefix}alive  ·  ${prefix}movie`;
    try {
        const hits = Object.entries(db.hit||{})
            .sort((a,b)=>b[1]-a[1])
            .filter(([c])=>c!=='totalcmd'&&c!=='todaycmd')
            .slice(0,5);
        if (hits.length>=3) topCmds = hits.map(([c,h])=>`${prefix}${c} ·${h}x`).join('  ');
    } catch {}

    // ── STEP 1: Generate and send the fox-logo image ──────────────────────
    try {
        const { generateMenuImage } = require('./lib/menuimage');
        const botNum = nimesha.decodeJid(nimesha.user.id);
        const img = await generateMenuImage({
            prefix,
            botName:    db.set?.[botNum]?.botname || '🦊 MAUREONIX',
            ownerName:  global.author || 'Infinite Vybeflix',
            memberName: m.pushName || 'User',
            totalCmds:  220,
            time, date,
        });
        await nimesha.sendMessage(m.chat, {
            image:    img,
            caption:  `${greeting}, *${m.pushName||'User'}*! 🦊\n\n🔥 *Hot:* ${topCmds}\n\n_Scroll the list below to select a category_ 👇`,
            mentions: [m.sender],
        }, { quoted: m });
    } catch(e) {
        // Image generation failed — non-fatal, continue to list
        console.log('[Menu] Image skip:', e.message);
    }

    // ── STEP 2: Native WhatsApp list message with sections ─────────────────
    // This renders as a SCROLLABLE categorised picker (completely different
    // from inline quick_reply buttons — it opens a proper in-app sheet)
    const header = `╔══[ 🦊 *MAUREONIX* ]══╗\n\n${greeting}, *${m.pushName||'User'}*!\n📅 ${date}  🕐 ${time}  📆 ${day}\n\n_Tap the button below to browse all categories_ 👇`;

    const prefixed = SECTIONS.map(sec => ({
        ...sec,
        rows: sec.rows.map(r => ({ ...r, rowId: prefix + r.rowId }))
    }));

    try {
        // Native WhatsApp list (opens a scrollable bottom sheet)
        await nimesha.sendMessage(m.chat, {
            text:       header,
            footer:     '⚡ 🦊 MAUREONIX · By Infinite Vybeflix · 2026',
            title:      '🦊 MAUREONIX v3.0',
            buttonText: '🦊  OPEN COMMAND HUB',
            sections:   prefixed,
            listType:   1,
            mentions:   [m.sender],
        }, { quoted: m });
    } catch {
        // Fallback if native list not supported by Baileys version
        await _fallbackButtonMenu(nimesha, m, prefix, header);
    }
}

// ── Fallback: quick_reply buttons if native list fails ────────────────────
async function _fallbackButtonMenu(nimesha, m, prefix, headerText) {
    const buttons = Object.entries(CAT_CMDS).map(([k,c]) => ({
        name:'quick_reply',
        buttonParamsJson: JSON.stringify({ display_text:`${c.icon} ${c.title}`, id: prefix+k })
    }));
    buttons.push(
        { name:'quick_reply', buttonParamsJson: JSON.stringify({ display_text:'🖼️ Image Map', id:prefix+'allmenu' }) },
        { name:'quick_reply', buttonParamsJson: JSON.stringify({ display_text:'📋 Help',      id:prefix+'help'    }) },
    );
    await nimesha.sendListMsg(m.chat, {
        text: headerText,
        footer: '⚡ 🦊 MAUREONIX',
        mentions: [m.sender],
        buttons,
    }, { quoted: m });
}

// ── Category sub-menu sender ──────────────────────────────────────────────
async function sendCategoryMenu(nimesha, m, prefix, menuKey, db) {
    const cat = CAT_CMDS[menuKey];
    if (!cat) return m.reply('❌ Unknown menu category.');

    // Try to send category image card
    try {
        const { generateCategoryCard } = require('./lib/menuimage');
        const catKey = menuKey.replace('menu','').replace('smenu','').replace('menu','');
        const img = await generateCategoryCard(catKey, {
            prefix,
            botName:    '🦊 MAUREONIX',
            ownerName:  global.author || 'Infinite Vybeflix',
            memberName: m.pushName || 'User',
        });
        await nimesha.sendMessage(m.chat, {
            image:   img,
            caption: `${cat.icon} *${cat.title}*\n\nTap any command below to run it instantly ⚡`,
        }, { quoted: m });
    } catch {}

    // Quick-reply buttons (cleaner than list for sub-menus)
    const buttons = cat.cmds.map(cmd => ({
        name:'quick_reply',
        buttonParamsJson: JSON.stringify({ display_text:`▸ ${prefix}${cmd}`, id: prefix+cmd })
    }));
    buttons.push({
        name:'quick_reply',
        buttonParamsJson: JSON.stringify({ display_text:'🔙 Main Menu', id: prefix+'menu' })
    });

    await nimesha.sendListMsg(m.chat, {
        text:     `${cat.icon} *${cat.title}*\n\nPrefix: *${prefix}* · ${cat.cmds.length} commands\n\nTap any command to execute it:`,
        footer:   '🦊 MAUREONIX · Infinite Vybeflix',
        mentions: [m.sender],
        buttons,
    }, { quoted: m });
}

module.exports = { setTemplateMenu, sendCategoryMenu, CAT_CMDS };

let _f = require.resolve(__filename);
fs.watchFile(_f, () => {
    fs.unwatchFile(_f);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[_f];
    require(_f);
});
