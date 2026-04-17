const fs = require('fs');
const chalk = require('chalk');
const moment = require('moment-timezone');
const { pickRandom } = require('./function');
const { generateQuantumMenu } = require('./menuimage'); // Import new generator

async function setTemplateMenu(nimesha, type, m, prefix, setv, db, options = {}) {
    const _dayMap = {
        'Sunday': 'Sunday', 'Monday': 'Monday', 'Tuesday': 'Tuesday',
        'Wednesday': 'Wednesday', 'Thursday': 'Thursday',
        'Friday': 'Friday', 'Saturday': 'Saturday'
    };
    const hari    = _dayMap[moment.tz('Africa/Nairobi').format('dddd')] || moment.tz('Africa/Nairobi').format('dddd');
    const tanggal = moment.tz('Africa/Nairobi').format('DD/MM/YYYY');
    const jam     = moment.tz('Africa/Nairobi').format('HH:mm:ss');

    const ucapanWaktu =
        jam < '05:00:00' ? 'Good Dawn 🌉' :
        jam < '11:00:00' ? 'Good Morning 🌄' :
        jam < '15:00:00' ? 'Good Day 🏙️' :
        jam < '18:00:00' ? 'Good Evening 🌅' :
        jam < '19:00:00' ? 'Good Evening 🌃' : 'Good Night 🌌';

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
            topCmds = `│${setv} ${prefix}song — Song\n│${setv} ${prefix}video — Video\n│${setv} ${prefix}sticker — Sticker\n│${setv} ${prefix}gpt — AI\n│${setv} ${prefix}menu — Menu\n`;
        }
    } catch (e) {
        topCmds = `│${setv} ${prefix}song — Song\n│${setv} ${prefix}video — Video\n│${setv} ${prefix}gpt — AI\n`;
    }

    // NEW: Generate and send image menu if options.image is true
    if (options.image || options.qimage) {
        try {
            const imageBuffer = await generateQuantumMenu({
                width: 1080,
                height: 1920,
                theme: 'maureonix',
                botName: 'MAUREONIX',
                subtitle: 'INFINITE VYBE',
                sections: [
                    { icon: '📅', title: 'DATE & TIME', content: `${tanggal}\n${jam} (${hari})` },
                    { icon: '👤', title: 'USER', content: m.pushName || 'User' },
                    { icon: '🤖', title: 'BOT', content: 'MAUREONIX v5.0' },
                    { icon: '⚡', title: 'PREFIX', content: prefix },
                    { icon: '📊', title: 'TOP COMMANDS', content: topCmds.replace(/[││]/g, '').replace(/${setv}/g, '').trim() },
                    { icon: '🎮', title: 'CATEGORIES', content: 'Bot, Group, Download, AI, Games, Fun' }
                ]
            });
            
            await nimesha.sendMessage(m.chat, {
                image: imageBuffer,
                caption: `╔══════════════════════╗\n║  *🦊 Maureonix*  ║\n╚══════════════════════╝\n\n👋 Hello *${m.pushName || 'User'}*!\n${ucapanWaktu}\n\n📅 *Date:* ${tanggal}\n🕐 *Time:* ${jam}\n📆 *Day:* ${hari}\n\nSelect a category below or use ${prefix}help`,
                footer: '© Maureonix Quantum Interface',
                buttons: [
                    { buttonId: `${prefix}botmenu`, buttonText: { displayText: '🤖 BOT' }, type: 1 },
                    { buttonId: `${prefix}groupmenu`, buttonText: { displayText: '👥 GROUP' }, type: 1 },
                    { buttonId: `${prefix}downloadmenu`, buttonText: { displayText: '⬇️ DOWNLOAD' }, type: 1 }
                ],
                headerType: 4
            }, { quoted: m });
            
            return;
        } catch (e) {
            console.log('Image generation failed, falling back to text:', e.message);
            // Continue to text menu below
        }
    }

    const menuText = `╔══════════════════════╗
║  *🦊 Maureonix*  ║
╚══════════════════════╝

👋 Hello *${m.pushName || 'User'}*!
${ucapanWaktu}

📅 *Date:* ${tanggal}
🕐 *Time:* ${jam}
📆 *Day:* ${hari}

╭──❍「 *🏆 Top Commands* 」❍
${topCmds}╰──────❍

✨ *Select a category:* ✨

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;

    const menuButtons = [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '1️⃣ 🤖 BOT', id: `${prefix}botmenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '2️⃣ 👥 GROUP', id: `${prefix}groupmenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '3️⃣ 📥 DOWNLOAD', id: `${prefix}downloadmenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '4️⃣ 🛠️ TOOLS', id: `${prefix}toolsmenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '5️⃣ 🤖 AI', id: `${prefix}aimenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '6️⃣ 🎮 GAMES', id: `${prefix}gamemenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '7️⃣ 😂 FUN', id: `${prefix}funmenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '8️⃣ ANIME', id: `${prefix}animemenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '9️⃣ 🔤 TEXT ART', id: `${prefix}textmakermenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔟 🔍 SEARCH', id: `${prefix}searchmenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👑 OWNER', id: `${prefix}ownermenu` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⚡ SPEED TEST', id: `${prefix}speed` }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📋 HELP', id: `${prefix}help` }) },
    ];

    await nimesha.sendListMsg(m.chat, {
        text: menuText,
        footer: `© Maureonix`,
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