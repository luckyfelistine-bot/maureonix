const fs = require('fs');
const chalk = require('chalk');
const moment = require('moment-timezone');
const { pickRandom } = require('./function');

async function setTemplateMenu(nimesha, type, m, prefix, setv, db, options = {}) {
    // ════════════════════════════════════════
    // Date / Time
    // ════════════════════════════════════════
    const _dayMap = {
        'Sunday': 'Sunday', 'Monday': 'Monday', 'Tuesday': 'Tuesday',
        'Wednesday': 'Wednesday', 'Thursday': 'Thursday',
        'Friday': 'Friday', 'Saturday': 'Saturday'
    };
    const day    = _dayMap[moment.tz('Asia/Colombo').format('dddd')] || moment.tz('Asia/Colombo').format('dddd');
    const date   = moment.tz('Asia/Colombo').format('DD/MM/YYYY');
    const time   = moment.tz('Asia/Colombo').format('HH:mm:ss');

    // Time-based greeting
    const greeting =
        time < '05:00:00' ? 'Good night 🌉' :
        time < '11:00:00' ? 'Good morning 🌄' :
        time < '15:00:00' ? 'Good afternoon 🏙️' :
        time < '18:00:00' ? 'Good evening 🌅' :
        time < '19:00:00' ? 'Good evening 🌃' : 'Good night 🌌';

    // ════════════════════════════════════════
    // Top 5 commands by usage
    // ════════════════════════════════════════
    let topCmds = '';
    try {
        let total = Object.entries(db.hit)
            .sort((a, b) => b[1] - a[1])
            .filter(([command]) => command !== 'totalcmd' && command !== 'todaycmd')
            .slice(0, 5);
        if (total && total.length >= 3) {
            total.forEach(([command, hit]) => {
                topCmds += `│${setv} ${prefix}${command} — ${hit} times\n`;
            });
        } else {
            topCmds = `│${setv} ${prefix}song — song\n│${setv} ${prefix}video — video\n│${setv} ${prefix}sticker — sticker\n│${setv} ${prefix}gpt — AI\n│${setv} ${prefix}menu — menu\n`;
        }
    } catch (e) {
        topCmds = `│${setv} ${prefix}song — song\n│${setv} ${prefix}video — video\n│${setv} ${prefix}gpt — AI\n`;
    }

    // ════════════════════════════════════════
    // Main menu with quick_reply buttons
    // ════════════════════════════════════════
    const menuText = `╔══════════════════════╗
║  *🦊 MAUREONIX*  ║
╚══════════════════════╝

👋 Hello *${m.pushName || 'User'}*!
${greeting}

📅 *Date:* ${date}
🕐 *Time:* ${time}
📆 *Day:* ${day}

╭──❍「 *🏆 Top Commands* 」❍
${topCmds}╰──────❍

✨ *Select a category:* ✨

━━━━━━━━━━━━━━━━━━━━━━
> *🦊 MAUREONIX* [BOT]✨ | 👑 _Infinite Vybeflix_`;

    // ════════════════════════════════════════
    // Quick_reply buttons matching nima.js case names
    // ════════════════════════════════════════
    const menuButtons = [
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '1️⃣ 🤖 BOT', id: `${prefix}botmenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '2️⃣ 👥 GROUP', id: `${prefix}groupmenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '3️⃣ 📥 DOWNLOAD', id: `${prefix}downloadmenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '4️⃣ 🛠️ TOOLS', id: `${prefix}toolsmenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '5️⃣ 🤖 AI', id: `${prefix}aimenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '6️⃣ 🎮 GAMES', id: `${prefix}gamemenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '7️⃣ 😂 FUN', id: `${prefix}funmenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '8️⃣ ANIME', id: `${prefix}animemenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '9️⃣ 🔤 TEXT ART', id: `${prefix}textmakermenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '🔟 🔍 SEARCH', id: `${prefix}searchmenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '👑 OWNER', id: `${prefix}ownermenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '⚡ SPEED TEST', id: `${prefix}speed` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '📋 HELP', id: `${prefix}help` })
        },
    ];

    // Send interactive list message with quick_reply buttons
    await nimesha.sendListMsg(m.chat, {
        text: menuText,
        footer: `© 🦊 MAUREONIX`,
        mentions: [m.sender],
        buttons: menuButtons
    }, { quoted: m });
}

module.exports = setTemplateMenu;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});