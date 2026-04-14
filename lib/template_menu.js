'use strict';
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🦊 MAUREONIX — QUANTUM NEURAL MENU v4.0                                     ║
 * ║                                                                              ║
 * ║  THE MOST BEAUTIFUL WHATSAPP BOT MENU EVER CREATED                          ║
 * ║  Features:                                                                   ║
 * ║  ✨ Cyberpunk neon aesthetic with glowing effects                             ║
 * ║  🎨 Sharp-generated 4K visuals                                              ║
 * ║  🎭 Animated SVG elements (particles, rotating rings)                       ║
 * ║  ⚡ 4-layer button fallback system                                            ║
 * ║  🎪 Interactive category cards                                                ║
 * ║  📱 Mobile-optimized vertical format                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const fs = require('fs');
const chalk = require('chalk');
const moment = require('moment-timezone');

// ═══════════════════════════════════════════════════════════════════════════════
// MENU CATEGORIES — Each with unique cyberpunk styling
// ═══════════════════════════════════════════════════════════════════════════════
const MENU_CATEGORIES = [
    { 
        id: 'botmenu', 
        icon: '🤖', 
        title: 'BOT SYSTEM', 
        desc: 'Core controls & system info',
        color: '#00F0FF',
        glow: 'cyan'
    },
    { 
        id: 'groupmenu', 
        icon: '👥', 
        title: 'GROUP CONTROL', 
        desc: 'Advanced group management',
        color: '#FF00A0',
        glow: 'pink'
    },
    { 
        id: 'downloadmenu', 
        icon: '⬇️', 
        title: 'DOWNLOADS', 
        desc: 'Media & file downloads',
        color: '#00FF41',
        glow: 'green'
    },
    { 
        id: 'searchmenu', 
        icon: '🔍', 
        title: 'SEARCH ENGINE', 
        desc: 'Web search & lookup',
        color: '#FFD700',
        glow: 'gold'
    },
    { 
        id: 'aimenu', 
        icon: '🧠', 
        title: 'AI INTELLIGENCE', 
        desc: 'Smart AI assistants',
        color: '#B829DD',
        glow: 'purple'
    },
    { 
        id: 'stickersmenu', 
        icon: '🎨', 
        title: 'STICKER & IMAGE', 
        desc: 'Visual creation tools',
        color: '#FF6B6B',
        glow: 'red'
    },
    { 
        id: 'gamemenu', 
        icon: '🎮', 
        title: 'GAMES', 
        desc: 'Play & earn rewards',
        color: '#00FFFF',
        glow: 'cyan'
    },
    { 
        id: 'funmenu', 
        icon: '😂', 
        title: 'FUN & VIBES', 
        desc: 'Entertainment hub',
        color: '#FF1493',
        glow: 'pink'
    },
    { 
        id: 'moviesmenu', 
        icon: '🎬', 
        title: 'MOVIES & TV', 
        desc: 'Cinema database',
        color: '#E50914',
        glow: 'red'
    },
    { 
        id: 'adminmenu', 
        icon: '🛡️', 
        title: 'ADMIN CONTROL', 
        desc: 'Protection & moderation',
        color: '#FF4500',
        glow: 'orange'
    },
    { 
        id: 'ownermenu', 
        icon: '👑', 
        title: 'OWNER PANEL', 
        desc: 'Owner exclusive',
        color: '#FFD700',
        glow: 'gold'
    }
];

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY COMMANDS DATABASE
// ═══════════════════════════════════════════════════════════════════════════════
const CAT_CMDS = {
    botmenu: { 
        icon: '🤖', 
        title: 'BOT SYSTEM', 
        color: '#00F0FF',
        cmds: ['alive', 'ping', 'speed', 'runtime', 'info', 'owner', 'vv', 'jid', 'github', 'staff', 'groupinfo', 'block', 'unblock', 'listblock', 'allblock', 'allunblock', 'privacy', 'help'] 
    },
    groupmenu: { 
        icon: '👥', 
        title: 'GROUP CONTROL', 
        color: '#FF00A0',
        cmds: ['tagall', 'hidetag', 'totag', 'add', 'kick', 'ban', 'unban', 'promote', 'demote', 'warn', 'unwarn', 'votekick', 'poll', 'setname', 'setdesc', 'linkgroup', 'revoke', 'setwelcome', 'setleave', 'welcome', 'goodbye', 'lock', 'unlock'] 
    },
    downloadmenu: { 
        icon: '⬇️', 
        title: 'DOWNLOADS', 
        color: '#00FF41',
        cmds: ['song', 'mp3', 'play', 'ytmp3', 'video', 'mp4', 'ytmp4'] 
    },
    searchmenu: { 
        icon: '🔍', 
        title: 'SEARCH ENGINE', 
        color: '#FFD700',
        cmds: ['define', 'weather', 'news', 'lyrics', 'cinfo', 'apk'] 
    },
    aimenu: { 
        icon: '🧠', 
        title: 'AI INTELLIGENCE', 
        color: '#B829DD',
        cmds: ['gpt', 'gemini', 'llama3', 'ai', 'chatai', 'imagine', 'flux', 'sora'] 
    },
    stickersmenu: { 
        icon: '🎨', 
        title: 'STICKER & IMAGE', 
        color: '#FF6B6B',
        cmds: ['sticker', 's', 'simage', 'toimg', 'attp', 'removebg', 'blur', 'ss', 'tts', 'trt'] 
    },
    gamemenu: { 
        icon: '🎮', 
        title: 'GAMES', 
        color: '#00FFFF',
        cmds: ['slot', 'casino', 'blackjack', 'math', 'tictactoe', 'suit', 'chess', 'akinator', 'snakeladder', 'daily', 'transfer', 'buy', 'gamelist', 'topgames', 'searchgame', 'randomgame', 'genre'] 
    },
    funmenu: { 
        icon: '😂', 
        title: 'FUN & VIBES', 
        color: '#FF1493',
        cmds: ['joke', 'quote', 'fact', '8ball', 'ship', 'simp', 'hack', 'compliment', 'insult', 'flirt', 'wasted', 'jail', 'triggered', 'shayari', 'character', 'tweet', 'ytcomment', 'oogway', 'namecard', 'goodnight', 'roseday', 'stupid'] 
    },
    moviesmenu: { 
        icon: '🎬', 
        title: 'MOVIES & TV', 
        color: '#E50914',
        cmds: ['movie', 'tv', 'trailer', 'topmovies', 'upcoming', 'nowplaying', 'celebrity', 'moviequote'] 
    },
    ownermenu: { 
        icon: '👑', 
        title: 'OWNER PANEL', 
        color: '#FFD700',
        cmds: ['shutdown', 'restart', 'broadcast', 'addprem', 'delprem', 'addowner', 'delowner', 'setbotname', 'backup', 'mode', 'restrictgroup', 'allowgroup', 'allowuser', 'update', 'adminonly', 'adduang', 'addlimit', 'ban', 'unban'] 
    },
    adminmenu: { 
        icon: '🛡️', 
        title: 'ADMIN CONTROL', 
        color: '#FF4500',
        cmds: ['pair', 'automod', 'antilink', 'antispam', 'antidelete', 'antibadword', 'anticall', 'antiviewonce', 'nsfw', 'antitoxic', 'antivirtex', 'poll', 'welcome', 'goodbye', 'lock', 'unlock', 'votekick', 'protections', 'setwelcome', 'setleave'] 
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4-LAYER INTERACTIVE BUTTON SYSTEM — Guaranteed to work
// ═══════════════════════════════════════════════════════════════════════════════
async function sendInteractiveButtons(sock, jid, text, footer, buttons, context = {}) {
    // Layer 1: Template Buttons (Modern Baileys v6+)
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
        console.log(chalk.cyan('[Menu] Layer 1: Template buttons ✓'));
        return true;
    } catch (e1) {
        console.log(chalk.yellow('[Menu] Layer 1 failed:', e1.message));
    }

    // Layer 2: Sections/List (WhatsApp Business API style)
    try {
        const msg = {
            text: text,
            footer: footer,
            buttonText: "🦊 EXPLORE",
            sections: [{
                title: "📂 QUANTUM CATEGORIES",
                rows: buttons.map(btn => ({
                    title: btn.display_text,
                    rowId: btn.id,
                    description: btn.description || ''
                }))
            }],
            ...context
        };
        await sock.sendMessage(jid, msg);
        console.log(chalk.cyan('[Menu] Layer 2: Sections ✓'));
        return true;
    } catch (e2) {
        console.log(chalk.yellow('[Menu] Layer 2 failed:', e2.message));
    }

    // Layer 3: Legacy Buttons (Older Baileys)
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
        console.log(chalk.cyan('[Menu] Layer 3: Legacy buttons ✓'));
        return true;
    } catch (e3) {
        console.log(chalk.yellow('[Menu] Layer 3 failed:', e3.message));
    }

    // Layer 4: Plain Text with Numbers (Guaranteed)
    try {
        let plainText = text + "\n\n📋 *CHOOSE BY NUMBER:*\n";
        buttons.slice(0, 10).forEach((btn, idx) => {
            plainText += `\n${idx + 1}️⃣ ${btn.display_text}`;
            if (btn.description) plainText += `\n   └ _${btn.description}_`;
        });
        plainText += "\n\n_Reply with the number to select_";
        await sock.sendMessage(jid, { text: plainText, ...context });
        console.log(chalk.cyan('[Menu] Layer 4: Plain text ✓'));
        return true;
    } catch (e4) {
        console.log(chalk.red('[Menu] Layer 4 failed:', e4.message));
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN MENU FUNCTION — The stunning experience
// ═══════════════════════════════════════════════════════════════════════════════
async function setTemplateMenu(nimesha, type, m, prefix, setv, db, options = {}) {
    const now = moment.tz('Asia/Colombo');
    const date = now.format('DD/MM/YYYY');
    const time = now.format('HH:mm:ss');
    const day = now.format('dddd');
    
    const greeting = time < '05:00:00' ? '🌉 Good Night' :
                   time < '11:00:00' ? '🌄 Good Morning' :
                   time < '15:00:00' ? '🏙️ Good Afternoon' :
                   time < '19:00:00' ? '🌅 Good Evening' : '🌌 Good Night';

    // Get trending commands
    let hotCommands = `${prefix}song · ${prefix}gpt · ${prefix}sticker · ${prefix}movie`;
    try {
        const hits = Object.entries(db.hit || {})
            .sort((a, b) => b[1] - a[1])
            .filter(([c]) => c !== 'totalcmd' && c !== 'todaycmd')
            .slice(0, 5);
        if (hits.length >= 3) {
            hotCommands = hits.map(([c, h]) => `${prefix}${c} ·${h}x`).join('  ');
        }
    } catch {}

    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 1: Generate and send stunning visual menu image
    // ═══════════════════════════════════════════════════════════════════════════
    let imageSent = false;
    try {
        const { generateMenuImage } = require('./menuimage');
        const botNum = nimesha.decodeJid(nimesha.user.id);
        
        const menuImage = await generateMenuImage({
            prefix,
            botName: db.set?.[botNum]?.botname || '🦊 MAUREONIX',
            ownerName: global.author || 'Infinite Vybeflix',
            memberName: m.pushName || 'User',
            totalCmds: 220,
            time,
            date
        });

        // Send with futuristic caption
        await nimesha.sendMessage(m.chat, {
            image: menuImage,
            caption: `╔════════════════════════════════════╗
║  🦊 *MAUREONIX QUANTUM INTERFACE*  ║
╚════════════════════════════════════╝

${greeting}, *${m.pushName || 'User'}*! 👋

⚡ *System Online* — Neural Link Established
🔥 *Trending:* ${hotCommands}

📱 *Tap a button below to explore the quantum realm* 👇`,
            mentions: [m.sender]
        }, { quoted: m });
        
        imageSent = true;
        console.log(chalk.green('[Menu] Quantum visual sent successfully'));
    } catch (e) {
        console.log(chalk.red('[Menu] Visual generation failed:', e.message));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 2: Send interactive buttons with cyberpunk styling
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Build futuristic header text
    const headerText = `╔══[ 🦊 *MAUREONIX* ]══╗

${greeting}, *${m.pushName || 'User'}*! ✨
📅 ${date}  🕐 ${time}  📆 ${day}

🔥 *HOT:* ${hotCommands}

⚡ *QUANTUM CATEGORIES:*`;

    // Create category buttons (max 10 for compatibility)
    const categoryButtons = MENU_CATEGORIES.slice(0, 10).map(cat => ({
        display_text: `${cat.icon} ${cat.title}`,
        id: `${prefix}${cat.id}`,
        description: cat.desc
    }));

    // Add special utility buttons
    categoryButtons.push(
        { 
            display_text: '🖼️ FULL MENU POSTER', 
            id: `${prefix}allmenu`, 
            description: 'Complete command map in 4K visual' 
        },
        { 
            display_text: '❓ QUANTUM HELP', 
            id: `${prefix}help`, 
            description: 'Interactive guide & examples' 
        }
    );

    // Send with 4-layer fallback
    const buttonsSent = await sendInteractiveButtons(
        nimesha,
        m.chat,
        headerText,
        '⚡ 🦊 MAUREONIX v4.0 · By Infinite Vybeflix · Quantum Neural Interface',
        categoryButtons,
        { quoted: m, mentions: [m.sender] }
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 3: Ultimate fallback — ASCII art menu
    // ═══════════════════════════════════════════════════════════════════════════
    if (!buttonsSent && !imageSent) {
        const asciiMenu = `
╔══════════════════════════════════════════════════╗
║        🦊 MAUREONIX QUANTUM INTERFACE            ║
╠══════════════════════════════════════════════════╣
║  ${greeting}, ${m.pushName || 'User'}!                          ║
║  📅 ${date} | 🕐 ${time}                            ║
╠══════════════════════════════════════════════════╣
║  ⚡ CATEGORIES:                                   ║
${MENU_CATEGORIES.slice(0, 8).map((cat, idx) => 
    `║  ${idx + 1}. ${cat.icon} ${cat.title.padEnd(20)} ${prefix}${cat.id.padEnd(15)}║`
).join('\n')}
║                                                  ║
║  🔥 Trending: ${hotCommands.substring(0, 35).padEnd(35)}║
╚══════════════════════════════════════════════════╝

_Reply with a number or command_`;

        await nimesha.sendMessage(m.chat, {
            text: asciiMenu,
            mentions: [m.sender]
        }, { quoted: m });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY SUB-MENU — Individual category experience
// ═══════════════════════════════════════════════════════════════════════════════
async function sendCategoryMenu(nimesha, m, prefix, menuKey, db) {
    const cat = CAT_CMDS[menuKey];
    if (!cat) {
        return m.reply('❌ *Unknown quantum category* — Try ' + prefix + 'menu');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 1: Send category visual card
    // ═══════════════════════════════════════════════════════════════════════════
    try {
        const { generateCategoryCard } = require('./menuimage');
        
        const categoryImage = await generateCategoryCard(menuKey, {
            prefix,
            botName: '🦊 MAUREONIX',
            ownerName: global.author || 'Infinite Vybeflix',
            memberName: m.pushName || 'User'
        });

        await nimesha.sendMessage(m.chat, {
            image: categoryImage,
            caption: `${cat.icon} *${cat.title}* — *Quantum Module Activated* ⚡

🎨 *Visual Interface Loaded*
📊 ${cat.cmds.length} Commands Available

_Tap any command below to execute instantly_ 👇`,
            mentions: [m.sender]
        }, { quoted: m });
    } catch (e) {
        console.log(chalk.yellow('[Menu] Category visual failed:', e.message));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 2: Send command buttons in chunks (max 10 per message)
    // ═══════════════════════════════════════════════════════════════════════════
    const chunkSize = 10;
    const commandChunks = [];
    
    for (let i = 0; i < cat.cmds.length; i += chunkSize) {
        commandChunks.push(cat.cmds.slice(i, i + chunkSize));
    }

    for (let chunkIdx = 0; chunkIdx < commandChunks.length; chunkIdx++) {
        const chunk = commandChunks[chunkIdx];
        
        // Create buttons for this chunk
        const buttons = chunk.map(cmd => ({
            display_text: `▸ ${prefix}${cmd}`,
            id: `${prefix}${cmd}`,
            description: ''
        }));
        
        // Add navigation buttons to last chunk
        if (chunkIdx === commandChunks.length - 1) {
            buttons.push(
                { display_text: '🔙 Main Menu', id: `${prefix}menu`, description: 'Return to quantum hub' },
                { display_text: '📋 Help', id: `${prefix}help`, description: 'Get command help' }
            );
        }

        // Determine text for this chunk
        const isFirstChunk = chunkIdx === 0;
        const chunkText = isFirstChunk 
            ? `${cat.icon} *${cat.title}* — *Available Commands* ⚡\n\nPrefix: *${prefix}*\nTotal: *${cat.cmds.length}* commands\n\n_Tap to execute instantly:_`
            : `${cat.icon} *${cat.title}* — *Commands (continued...)*`;

        await sendInteractiveButtons(
            nimesha,
            m.chat,
            chunkText,
            `🦊 MAUREONIX · ${chunkIdx + 1}/${commandChunks.length}`,
            buttons,
            { quoted: m, mentions: [m.sender] }
        );
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FULL MENU POSTER — The complete command map
// ═══════════════════════════════════════════════════════════════════════════════
async function sendFullMenuPoster(nimesha, m, prefix, db) {
    try {
        const { generateFullMenuPoster } = require('./menuimage');
        
        const posterImage = await generateFullMenuPoster({
            prefix,
            botName: '🦊 MAUREONIX',
            ownerName: global.author || 'Infinite Vybeflix',
            totalCmds: 220
        });

        await nimesha.sendMessage(m.chat, {
            image: posterImage,
            caption: `🖼️ *MAUREONIX COMPLETE COMMAND MAP* 🖼️

✨ *4K Quantum Visual Generated*
📊 All 220+ Commands Visualized
🔍 Save this image for quick reference!

⚡ *Need interactive mode?* Type ${prefix}menu`,
            mentions: [m.sender]
        }, { quoted: m });
        
        console.log(chalk.green('[Menu] Full poster sent successfully'));
    } catch (e) {
        console.log(chalk.red('[Menu] Poster generation failed:', e.message));
        m.reply(`❌ Could not generate poster. Try ${prefix}menu instead.`);
    }
}

module.exports = {
    setTemplateMenu,
    sendCategoryMenu,
    sendFullMenuPoster,
    CAT_CMDS,
    MENU_CATEGORIES
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOT RELOAD
// ═══════════════════════════════════════════════════════════════════════════════
let _f = require.resolve(__filename);
fs.watchFile(_f, () => {
    fs.unwatchFile(_f);
    console.log(chalk.redBright(`[Quantum Menu] Updated ${_f}`));
    delete require.cache[_f];
    require(_f);
});