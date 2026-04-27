// commands/bot.js — Basic bot commands & stats
module.exports = {
    ping: async (nimesha, m, { runtime, m: msgObj, prefix }) => {
        const start = Date.now();
        const msg = await m.reply('📡 *Pinging...*');
        const end = Date.now();
        await nimesha.sendMessage(m.chat, {
            text: `🏓 *Pong!*\n━━━━━━━━━━━━━━━━━━━━━━\n📶 *Response:* ${end - start} ms\n⚡ *WebSocket:* ${nimesha.ws?.readyState === 1 ? 'Connected' : 'Disconnected'}\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`,
            edit: msg.key
        });
    },
    alive: async (nimesha, m, { runtime, prefix, author, tanggal, jam, db }) => {
        const uptime = runtime(process.uptime());
        const ram = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
        const users = Object.keys(db.users || {}).length;
        const groups = Object.keys(db.groups || {}).length;
        const msg = `╔══════════════════════╗
║  *🦊 Maureonix* [BOT]  ║
╠══════════════════════╣
║ ✅ *Bot is online!*
║ 🕒 *Uptime:* ${uptime}
║ 💾 *RAM:* ${ram}
║ 👥 *Users:* ${users}
║ 🏠 *Groups:* ${groups}
║ 🧠 *Prefix:* ${prefix}
║ 📅 *Date:* ${tanggal}
║ 🕐 *Time:* ${jam}
║ 🤖 *Status:* Active & Healthy
╠══════════════════════╣
║ 👑 *By ${author}*
╚══════════════════════╝`;
        await m.reply(msg);
    },
    speed: async (nimesha, m) => {
        const speed = require('performance-now');
        const start = speed();
        const msg = await m.reply('⚡ *Testing speed...*');
        const end = speed();
        await nimesha.sendMessage(m.chat, { text: `⚡ *Speed Test*\n━━━━━━━━━━━━━━━━━━━━━━\n📶 *Response:* ${(end - start).toFixed(3)} ms`, edit: msg.key });
    },
    runtime: async (nimesha, m, { runtime }) => {
        await m.reply(`🕒 *Bot Uptime*\n━━━━━━━━━━━━━━━━━━━━━━\n${runtime(process.uptime())}`);
    },
    info: async (nimesha, m, { botname, author, tanggal, jam, prefix, cases, db }) => {
        const msg = `🤖 *Bot Information*\n━━━━━━━━━━━━━━━━━━━━━━\n📛 *Name:* ${botname}\n👑 *Owner:* ${author}\n🔢 *Version:* 5.0.0\n📅 *Date:* ${tanggal}\n🕐 *Time:* ${jam}\n🧠 *Prefix:* ${prefix}\n📊 *Commands:* ${cases.length}+\n👥 *Users:* ${Object.keys(db.users).length}\n🏠 *Groups:* ${Object.keys(db.groups).length}\n━━━━━━━━━━━━━━━━━━━━━━`;
        await m.reply(msg);
    },
    owner: async (nimesha, m, { ownerNumber }) => {
        await nimesha.sendContact(m.chat, ownerNumber, m);
    },
    profile: async (nimesha, m, { isVip, isPremium, checkStatus, premium, getExpired, formatDate, db }) => {
        const infoUser = db.users[m.sender];
        if (!infoUser) return m.reply('❌ User not found in database.');
        const _msg = await m.reply('⏳ *Loading...*');
        await nimesha.sendMessage(m.chat, {
            text: `*👤 Profile @${m.sender.split('@')[0]}* :
🐋 Bot User: ${Object.keys(db.users).includes(m.sender) ? 'True' : 'False'}
🔥 User: ${isVip ? 'VIP' : isPremium ? 'PREMIUM' : 'FREE'}${isPremium ? `\n⏳ Expired : ${checkStatus(m.sender, premium) ? formatDate(getExpired(m.sender, premium)) : '-'}` : ''}
🎫 Limit: ${infoUser.limit}
💰 Money: ${infoUser.money.toLocaleString('en-US')}`,
            edit: _msg.key
        });
    },
    leaderboard: async (nimesha, m, { db }) => {
        const entries = Object.entries(db.users).sort((a, b) => b[1].money - a[1].money).slice(0, 10).map(e => e[0]);
        let teks = '╭──❍「 *LEADERBOARD* 」❍\n';
        for (let i = 0; i < entries.length; i++) {
            teks += `│• ${i + 1}. @${entries[i].split('@')[0]}\n│• Balance: ${db.users[entries[i]].money.toLocaleString('en-US')}\n│\n`;
        }
        teks += '╰──────❍';
        const _msg = await m.reply('⏳ 🏆 *Getting leaderboard...*');
        await nimesha.sendMessage(m.chat, { text: teks, edit: _msg.key });
    },
    totalpesan: async (nimesha, m, { store, prefix, command, text }) => {
        let messageCount = {};
        let messages = store?.messages[m.chat]?.array || [];
        let participants = m?.metadata?.participants?.map(p => p.id) || messages.map(p => p.key.participant) || [];
        messages.forEach(mes => {
            if (mes.key?.participant && mes.message) messageCount[mes.key.participant] = (messageCount[mes.key.participant] || 0) + 1;
        });
        let totalMessages = Object.values(messageCount).reduce((a, b) => a + b, 0);
        let date = new Date().toLocaleDateString('en-US');
        let zeroMessageUsers = participants.filter(user => !messageCount[user]).map(user => `- @${user.replace(/[^0-9]/g, '')}`);
        let messageList = Object.entries(messageCount).map(([sender, count], index) => `${index + 1}. @${sender.replace(/[^0-9]/g, '')}: ${count} messages`);
        let result = `Total messages ${totalMessages} from ${participants.length} members\nOn ${date}:\n${messageList.join('\n')}\n\n${text.length > 0 ? (zeroMessageUsers.length ? `Members who didn't send messages (Siders):\n${zeroMessageUsers.join('\n')}` : 'All members have sent messages!') : `Check siders? ${prefix + command} --sider`}`;
        const _msg = await m.reply('⏳ 📊 *Counting...*');
        await nimesha.sendMessage(m.chat, { text: result, edit: _msg.key });
    },
    donasi: async (nimesha, m) => {
        const _msg = await m.reply('⏳ 💰 *Getting donation info...*');
        await nimesha.sendMessage(m.chat, { text: 'You can donate via this URL:\nhttps://saweria.co/nima-axis', edit: _msg.key });
    },
    stats: async (nimesha, m, { runtime, db }) => {
        const msg = `📊 *Bot Statistics*\n\n▸ *Uptime:* ${runtime(process.uptime())}\n▸ *Commands Run:* ${db.hit?.totalcmd || 0}\n▸ *Users:* ${Object.keys(db.users).length}\n▸ *Groups:* ${Object.keys(db.groups).length}\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },
    botmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *🤖 BOT COMMANDS*  ║\n╚══════════════════════╝\n\n📌 *General*\n▸ ${prefix}alive – Check if bot is online\n▸ ${prefix}ping – Response speed\n▸ ${prefix}info – Bot information\n▸ ${prefix}owner – Contact owner\n▸ ${prefix}runtime – Uptime of bot\n▸ ${prefix}speed – Internet speed test\n▸ ${prefix}profile – Your profile\n▸ ${prefix}leaderboard – Top users\n▸ ${prefix}totalpesan – Message stats\n▸ ${prefix}sc – Source code\n▸ ${prefix}donasi – Donate\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },
    // aliases
    on: async (nimesha, m, ctx) => { await module.exports.alive(nimesha, m, ctx); },
};