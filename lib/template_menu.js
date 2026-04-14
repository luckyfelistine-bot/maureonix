'use strict';
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  🦊 MAUREONIX — QUANTUM SPLIT MENU v3.1 (FIXED)            ║
 * ║  Guaranteed to work with all Baileys versions                ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const fs    = require('fs');
const chalk = require('chalk');
const moment = require('moment-timezone');

// ── Categories ───────────────────────────────────────────────────────────
const MENU_CATEGORIES = [
    { id: 'botmenu',      icon: '🤖', title: 'BOT SYSTEM',      desc: 'Alive · Ping · Speed · Runtime · Info' },
    { id: 'groupmenu',    icon: '👥', title: 'GROUP CONTROL',   desc: 'TagAll · Kick · Ban · Promote · Poll' },
    { id: 'downloadmenu', icon: '⬇️', title: 'DOWNLOADS',       desc: 'Song · MP3 · Video · YT · All formats' },
    { id: 'searchmenu',   icon: '🔍', title: 'SEARCH ENGINE',   desc: 'Google · Dictionary · Weather · News' },
    { id: 'aimenu',       icon: '🧠', title: 'AI INTELLIGENCE', desc: 'GPT · Gemini · LLaMA · Imagine · Flux' },
    { id: 'stickersmenu', icon: '🎨', title: 'STICKER & IMAGE', desc: 'Make · ATTP · Remove BG · Blur · SS' },
    { id: 'gamemenu',     icon: '🎮', title: 'GAMES',           desc: 'Slot · Casino · RAWG · Blackjack · Chess' },
    { id: 'funmenu',      icon: '😂', title: 'FUN & VIBES',     desc: 'Jokes · Ship · Hack · Wasted · Anime' },
    { id: 'moviesmenu',   icon: '🎬', title: 'MOVIES & TV',     desc: 'OMDB · TMDB · Top Rated · Trailers' },
    { id: 'adminmenu',    icon: '🛡️', title: 'ADMIN CTRL',     desc: 'AutoMod · Antilink · Lock · VoteKick' },
    { id: 'ownermenu',    icon: '👑', title: 'OWNER PANEL',    desc: 'Mode · Broadcast · Update · Backup' },
];

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

// ── 4-LAYER FALLBACK BUTTON SENDER ────────────────────────────────────────
async function sendButtons(sock, jid, text, footer, buttons, context = {}) {
    // LAYER 1: Template Buttons (Baileys v6+)
    try {
        const msg = {
            text: text,
            footer: footer,
            templateButtons: buttons.map((btn, idx) => ({
                index: idx,
                quickReplyButton: {
                    displayText: btn.display_text,
                    id: btn.id
                }
            })),
            ...context
        };
        await sock.sendMessage(jid, msg);
        console.log('[Menu] Layer 1 success: Template buttons');
        return true;
    } catch (e1) { console.log('[Menu] Layer 1 failed:', e1.message); }

    // LAYER 2: Sections/List (WhatsApp Business)
    try {
        const msg = {
            text: text,
            footer: footer,
            buttonText: "🦊 Open Menu",
            sections: [{
                title: "📂 Categories",
                rows: buttons.map(btn => ({
                    title: btn.display_text,
                    rowId: btn.id,
                    description: btn.description || ''
                }))
            }],
            ...context
        };
        await sock.sendMessage(jid, msg);
        console.log('[Menu] Layer 2 success: Sections');
        return true;
    } catch (e2) { console.log('[Menu] Layer 2 failed:', e2.message); }

    // LAYER 3: Legacy Buttons (older Baileys)
    try {
        const msg = {
            text: text,
            footer: footer,
            buttons: buttons.map(btn => ({
                buttonId: btn.id,
                buttonText: { displayText: btn.display_text },
                type: 1
            })),
            headerType: 1,
            ...context
        };
        await sock.sendMessage(jid, msg);
        console.log('[Menu] Layer 3 success: Legacy buttons');
        return true;
    } catch (e3) { console.log('[Menu] Layer 3 failed:', e3.message); }

    // LAYER 4: Plain Text (guaranteed to work)
    try {
        let plainText = text + "\n\n📋 *CHOOSE A NUMBER:*\n";
        buttons.slice(0, 10).forEach((btn, idx) => {
            plainText += `\n${idx + 1}. ${btn.display_text}`;
        });
        plainText += `\n\n_Reply with the number_`;
        await sock.sendMessage(jid, { text: plainText, ...context });
        console.log('[Menu] Layer 4 success: Plain text');
        return true;
    } catch (e4) {
        console.log('[Menu] Layer 4 failed:', e4.message);
        return false;
    }
}

// ── Main Menu ─────────────────────────────────────────────────────────────
async function setTemplateMenu(nimesha, type, m, prefix, setv, db, options = {}) {
    const now  = moment.tz('Asia/Colombo');
    const date = now.format('DD/MM/YYYY');
    const time = now.format('HH:mm:ss');
    const day  = now.format('dddd');
    const greeting = time < '05:00:00' ? '🌉 Good Night' :
                   time < '11:00:00' ? '🌄 Good Morning' :
                   time < '15:00:00' ? '🏙️ Good Afternoon' :
                   time < '19:00:00' ? '🌅 Good Evening' : '🌌 Good Night';

    let topCmds = `${prefix}song · ${prefix}gpt · ${prefix}sticker · ${prefix}alive · ${prefix}movie`;
    try {
        const hits = Object.entries(db.hit || {})
            .sort((a, b) => b[1] - a[1])
            .filter(([c]) => c !== 'totalcmd' && c !== 'todaycmd')
            .slice(0, 5);
        if (hits.length >= 3) topCmds = hits.map(([c, h]) => `${prefix}${c} ·${h}x`).join('  ');
    } catch {}

    // STEP 1: Send Image
    let imageSent = false;
    try {
        const { generateMenuImage } = require('./lib/menuimage');
        const botNum = nimesha.decodeJid(nimesha.user.id);
        const img = await generateMenuImage({
            prefix,
            botName: db.set?.[botNum]?.botname || '🦊 MAUREONIX',
            ownerName: global.author || 'Infinite Vybeflix',
            memberName: m.pushName || 'User',
            totalCmds: 220,
            time, date,
        });
        await nimesha.sendMessage(m.chat, {
            image: img,
            caption: `${greeting}, *${m.pushName || 'User'}*! 🦊\n\n🔥 *Hot:* ${topCmds}\n\n_Tap a button below 👇_`,
            mentions: [m.sender],
        }, { quoted: m });
        imageSent = true;
    } catch (e) {
        console.log('[Menu] Image failed:', e.message);
    }

    // STEP 2: Send Buttons (4-layer fallback)
    const header = `╔══[ 🦊 *MAUREONIX* ]══╗\n\n${greeting}, *${m.pushName || 'User'}*!\n📅 ${date}  🕐 ${time}  📆 ${day}\n\n🔥 *Hot:* ${topCmds}`;
    
    const buttons = MENU_CATEGORIES.slice(0, 10).map(cat => ({
        display_text: `${cat.icon} ${cat.title}`,
        id: `${prefix}${cat.id}`,
        description: cat.desc
    }));
    
    buttons.push(
        { display_text: '🖼️ Full Menu', id: `${prefix}allmenu`, description: 'Complete command poster' },
        { display_text: '❓ Help', id: `${prefix}help`, description: 'Command guide' }
    );

    await sendButtons(nimesha, m.chat, header, '⚡ 🦊 MAUREONIX · By Infinite Vybeflix', buttons, { quoted: m, mentions: [m.sender] });
}

// ── Category Sub-Menu ───────────────────────────────────────────────────────
async function sendCategoryMenu(nimesha, m, prefix, menuKey, db) {
    const cat = CAT_CMDS[menuKey];
    if (!cat) return m.reply('❌ Unknown category.');

    // Try image
    try {
        const { generateCategoryCard } = require('./lib/menuimage');
        const img = await generateCategoryCard(menuKey.replace('menu', ''), {
            prefix, botName: '🦊 MAUREONIX',
            ownerName: global.author || 'Infinite Vybeflix',
            memberName: m.pushName || 'User',
        });
        await nimesha.sendMessage(m.chat, {
            image: img,
            caption: `${cat.icon} *${cat.title}*\n\nTap any command below ⚡`,
        }, { quoted: m });
    } catch (e) { console.log('[Menu] Category image failed:', e.message); }

    // Send command buttons (chunked by 10)
    const chunks = [];
    for (let i = 0; i < cat.cmds.length; i += 10) {
        chunks.push(cat.cmds.slice(i, i + 10));
    }

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const buttons = chunk.map(cmd => ({
            display_text: `▸ ${prefix}${cmd}`,
            id: `${prefix}${cmd}`,
            description: ''
        }));
        
        if (i === chunks.length - 1) {
            buttons.push({ display_text: '🔙 Main Menu', id: `${prefix}menu`, description: 'Back to main menu' });
        }

        const text = i === 0 
            ? `${cat.icon} *${cat.title}*\n\nPrefix: *${prefix}* · ${cat.cmds.length} commands\n\nTap to execute:`
            : `*${cat.title}* (continued...)`;

        await sendButtons(nimesha, m.chat, text, '🦊 MAUREONIX · Infinite Vybeflix', buttons, { quoted: m, mentions: [m.sender] });
    }
}

module.exports = { setTemplateMenu, sendCategoryMenu, CAT_CMDS };

let _f = require.resolve(__filename);
fs.watchFile(_f, () => {
    fs.unwatchFile(_f);
    console.log(chalk.redBright(`Update ${_f}`));
    delete require.cache[_f];
    require(_f);
});