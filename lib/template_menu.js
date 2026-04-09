const fs = require('fs');
const chalk = require('chalk');
const moment = require('moment-timezone');
const { pickRandom } = require('./function');

async function setTemplateMenu(nimesha, type, m, prefix, setv, db, options = {}) {
    // ════════════════════════════════════════
    // දිනය / වේලාව සිංහලෙන්
    // ════════════════════════════════════════
    const _dayMap = {
        'Sunday': 'ඉරිදා', 'Monday': 'සඳුදා', 'Tuesday': 'අඟහරුවාදා',
        'Wednesday': 'බදාදා', 'Thursday': 'බ්‍රහස්පතින්දා',
        'Friday': 'සිකුරාදා', 'Saturday': 'සෙනසුරාදා'
    };
    const hari    = _dayMap[moment.tz('Asia/Colombo').format('dddd')] || moment.tz('Asia/Colombo').format('dddd');
    const tanggal = moment.tz('Asia/Colombo').format('DD/MM/YYYY');
    const jam     = moment.tz('Asia/Colombo').format('HH:mm:ss');

    // වේලාවට ගැළෙන සිංහල සුභ පැතුම
    const ucapanWaktu =
        jam < '05:00:00' ? 'සුබ අලුයමක් 🌉' :
        jam < '11:00:00' ? 'සුභ උදෑසනක් 🌄' :
        jam < '15:00:00' ? 'සුභ දහවලක් 🏙️' :
        jam < '18:00:00' ? 'සුභ සන්ධ්‍යාවක් 🌅' :
        jam < '19:00:00' ? 'සුභ සන්ධ්‍යාවක් 🌃' : 'සුභ රාත්‍රියක් 🌌';

    // ════════════════════════════════════════
    // ඉහලම commands 5 ක් - usage stats
    // ════════════════════════════════════════
    let topCmds = '';
    try {
        let total = Object.entries(db.hit)
            .sort((a, b) => b[1] - a[1])
            .filter(([command]) => command !== 'totalcmd' && command !== 'todaycmd')
            .slice(0, 5);
        if (total && total.length >= 3) {
            total.forEach(([command, hit]) => {
                topCmds += `│${setv} ${prefix}${command} — ${hit} වාර\n`;
            });
        } else {
            topCmds = `│${setv} ${prefix}song — ගීත\n│${setv} ${prefix}video — වීඩියෝ\n│${setv} ${prefix}sticker — ස්ටිකර්\n│${setv} ${prefix}gpt — AI\n│${setv} ${prefix}menu — මෙනු\n`;
        }
    } catch (e) {
        topCmds = `│${setv} ${prefix}song — ගීත\n│${setv} ${prefix}video — වීඩියෝ\n│${setv} ${prefix}gpt — AI\n`;
    }

    // ════════════════════════════════════════
    // SULA MD MINI BOT STYLE — ප්‍රධාන මෙනු
    // sendListMsg + quick_reply buttons
    // ════════════════════════════════════════
    const menuText = `╔══════════════════════╗
║  *🧬🌐『 𝖭𝖬𝖣 𝖠𝖷𝖨𝖲 』🌐🧬*  ║
╚══════════════════════╝

👋 හලෝ *${m.pushName || 'යෙදුම්කරු'}*!
${ucapanWaktu}

📅 *දිනය:* ${tanggal}
🕐 *වේලාව:* ${jam}
📆 *දවස:* ${hari}

╭──❍「 *🏆 ඉහලම විධාන* 」❍
${topCmds}╰──────❍

✨ *Category එකක් තෝරන්න:* ✨

━━━━━━━━━━━━━━━━━━━━━━
> *🧬🌐『 𝖭𝖬𝖣 𝖠𝖷𝖨𝖲 』🌐🧬* [BOT]✨ | 👑 _නිමේශ මධුශන්_`;

    // ════════════════════════════════════════
    // SULA MD style quick_reply buttons
    // id = nima.js හි case name ට හරියටම match
    // ════════════════════════════════════════
    const menuButtons = [
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '1️⃣ 🤖 බොට් (BOT)', id: `${prefix}botmenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '2️⃣ 👥 සමූහ (GROUP)', id: `${prefix}groupmenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '3️⃣ 📥 බාගත කිරීම් (DOWNLOAD)', id: `${prefix}downloadmenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '4️⃣ 🛠️ මෙවලම් (TOOLS)', id: `${prefix}toolsmenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '5️⃣ 🤖 AI (INTELLIGENCE)', id: `${prefix}aimenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '6️⃣ 🎮 ක්‍රීඩා (GAMES)', id: `${prefix}gamemenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '7️⃣ 😂 විනෝදය (FUN)', id: `${prefix}funmenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '8️⃣ ඇනිමේ (ANIME)', id: `${prefix}animemenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '9️⃣ 🔤 අකුරු කලාව (TEXT ART)', id: `${prefix}textmakermenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '🔟 🔍 සෙවුම් (SEARCH)', id: `${prefix}searchmenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '👑 හිමිකරු (OWNER)', id: `${prefix}ownermenu` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '⚡ වේගය (SPEED TEST)', id: `${prefix}speed` })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '📋 උදව් (HELP)', id: `${prefix}help` })
        },
    ];

    // sendListMsg = interactiveMessage + nativeFlowMessage + quick_reply buttons
    await nimesha.sendListMsg(m.chat, {
        text: menuText,
        footer: `© 🧬🌐『 𝖭𝖬𝖣 𝖠𝖷𝖨𝖲 』🌐🧬`,
        mentions: [m.sender],
        buttons: menuButtons
    }, { quoted: m });
}

module.exports = setTemplateMenu;

// ══════════════════════════════
// ගොනු වෙනස් වූ විට ස්වයංක්‍රීයව reload
// ══════════════════════════════
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});
