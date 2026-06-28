// commands/bot.js – Basic bot commands & stats (full menu)
// Note: Sub‑menu commands (botmenu, groupmenu, etc.) are removed because they are defined in their respective category files.
// The main .menu command uses buttons that call those commands, which are loaded from other files.

module.exports = {
    ping: async (maureonix, m, { runtime, m: msgObj, prefix }) => {
        const start = Date.now();
        const msg = await m.reply('📡 *Pinging...*');
        const end = Date.now();
        await maureonix.sendMessage(m.chat, {
            text: `🏓 *Pong!*\n━━━━━━━━━━━━━━━━━━━━━━\n📶 *Response:* ${end - start} ms\n⚡ *WebSocket:* ${maureonix.ws?.readyState === 1 ? 'Connected' : 'Disconnected'}\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`,
            edit: msg.key
        });
    },
    alive: async (maureonix, m, { runtime, prefix, author, tanggal, jam, db }) => {
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
    speed: async (maureonix, m) => {
        const speed = require('performance-now');
        const start = speed();
        const msg = await m.reply('⚡ *Testing speed...*');
        const end = speed();
        await maureonix.sendMessage(m.chat, { text: `⚡ *Speed Test*\n━━━━━━━━━━━━━━━━━━━━━━\n📶 *Response:* ${(end - start).toFixed(3)} ms`, edit: msg.key });
    },
    runtime: async (maureonix, m, { runtime }) => {
        await m.reply(`🕒 *Bot Uptime*\n━━━━━━━━━━━━━━━━━━━━━━\n${runtime(process.uptime())}`);
    },
    info: async (maureonix, m, { botname, author, tanggal, jam, prefix, cases, db }) => {
        const msg = `🤖 *Bot Information*\n━━━━━━━━━━━━━━━━━━━━━━\n📛 *Name:* ${botname}\n👑 *Owner:* ${author}\n🔢 *Version:* 5.0.0\n📅 *Date:* ${tanggal}\n🕐 *Time:* ${jam}\n🧠 *Prefix:* ${prefix}\n📊 *Commands:* ${cases.length}+\n👥 *Users:* ${Object.keys(db.users).length}\n🏠 *Groups:* ${Object.keys(db.groups).length}\n━━━━━━━━━━━━━━━━━━━━━━`;
        await m.reply(msg);
    },
    owner: async (maureonix, m, { ownerNumber }) => {
        await maureonix.sendContact(m.chat, ownerNumber, m);
    },
    profile: async (maureonix, m, { isVip, isPremium, checkStatus, premium, getExpired, formatDate, db }) => {
        const infoUser = db.users[m.sender];
        if (!infoUser) return m.reply('❌ User not found in database.');
        const _msg = await m.reply('⏳ *Loading...*');
        await maureonix.sendMessage(m.chat, {
            text: `*👤 Profile @${m.sender.split('@')[0]}* :\n🐋 Bot User: ${Object.keys(db.users).includes(m.sender) ? 'True' : 'False'}\n🔥 User: ${isVip ? 'VIP' : isPremium ? 'PREMIUM' : 'FREE'}${isPremium ? `\n⏳ Expired : ${checkStatus(m.sender, premium) ? formatDate(getExpired(m.sender, premium)) : '-'}` : ''}\n🎫 Limit: ${infoUser.limit}\n💰 Money: ${infoUser.money.toLocaleString('en-US')}`,
            edit: _msg.key
        });
    },
    leaderboard: async (maureonix, m, { db }) => {
        const entries = Object.entries(db.users).sort((a, b) => b[1].money - a[1].money).slice(0, 10).map(e => e[0]);
        let teks = '╭──❍「 *LEADERBOARD* 」❍\n';
        for (let i = 0; i < entries.length; i++) {
            teks += `│• ${i + 1}. @${entries[i].split('@')[0]}\n│• Balance: ${db.users[entries[i]].money.toLocaleString('en-US')}\n│\n`;
        }
        teks += '╰──────❍';
        const _msg = await m.reply('⏳ 🏆 *Getting leaderboard...*');
        await maureonix.sendMessage(m.chat, { text: teks, edit: _msg.key });
    },
    totalpesan: async (maureonix, m, { store, prefix, command, text }) => {
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
        await maureonix.sendMessage(m.chat, { text: result, edit: _msg.key });
    },
    donasi: async (maureonix, m) => {
        const _msg = await m.reply('⏳ 💰 *Getting donation info...*');
        await maureonix.sendMessage(m.chat, { text: 'You can donate via this URL:\nhttps://saweria.co/maureonix-axis', edit: _msg.key });
    },
    stats: async (maureonix, m, { runtime, db }) => {
        const msg = `📊 *Bot Statistics*\n\n▸ *Uptime:* ${runtime(process.uptime())}\n▸ *Commands Run:* ${db.hit?.totalcmd || 0}\n▸ *Users:* ${Object.keys(db.users).length}\n▸ *Groups:* ${Object.keys(db.groups).length}\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    // ──────────────────────────────────────────────
    //  🏠  MAIN MENU (with carousel, fallback to image or text)
    // ──────────────────────────────────────────────
    menu: async (maureonix, m, ctx) => {
        const { prefix, cases, m: msg, pushName, ucapanWaktu, tanggal, jam, botname, author, generateMenuImage } = ctx;
        const carouselCards = [
            { url: './database/menucards/bot.png', body: `🤖 *BOT*\n\n▸ ${prefix}alive\n▸ ${prefix}ping\n▸ ${prefix}info\n▸ ${prefix}owner\n▸ ${prefix}runtime\n▸ ${prefix}profile\n▸ ${prefix}leaderboard\n▸ ${prefix}totalpesan\n▸ ${prefix}sc\n▸ ${prefix}donasi`, footer: 'Bot utilities & info', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🤖 Bot Menu', id: `${prefix}botmenu` }) }] },
            { url: './database/menucards/group.png', body: `👥 *GROUP*\n\n▸ ${prefix}add\n▸ ${prefix}kick\n▸ ${prefix}promote\n▸ ${prefix}demote\n▸ ${prefix}warn\n▸ ${prefix}tagall\n▸ ${prefix}hidetag\n▸ ${prefix}setname\n▸ ${prefix}setdesc\n▸ ${prefix}linkgroup\n▸ ${prefix}revoke`, footer: 'Manage your group', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👥 Group Menu', id: `${prefix}groupmenu` }) }] },
            { url: './database/menucards/download.png', body: `⬇️ *DOWNLOAD*\n\n▸ ${prefix}song\n▸ ${prefix}video\n▸ ${prefix}tiktok\n▸ ${prefix}instagram\n▸ ${prefix}facebook\n▸ ${prefix}twitter\n▸ ${prefix}spotify\n▸ ${prefix}mediafire\n▸ ${prefix}apk`, footer: 'Download from 20+ platforms', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⬇️ Download Menu', id: `${prefix}downloadmenu` }) }] },
            { url: './database/menucards/ai.png', body: `🧠 *AI*\n\n▸ ${prefix}gpt\n▸ ${prefix}gemini\n▸ ${prefix}llama\n▸ ${prefix}deepseek\n▸ ${prefix}ai\n▸ ${prefix}imagine\n▸ ${prefix}translate\n▸ ${prefix}tts\n▸ ${prefix}summarize\n▸ ${prefix}code\n▸ ${prefix}brainrot\n▸ ${prefix}docs\n▸ ${prefix}ask`, footer: 'Chat with advanced AI', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🧠 AI Menu', id: `${prefix}aimenu` }) }] },
            { url: './database/menucards/sticker.png', body: `🎨 *STICKER*\n\n▸ ${prefix}sticker\n▸ ${prefix}s\n▸ ${prefix}simage\n▸ ${prefix}toimg\n▸ ${prefix}attp\n▸ ${prefix}removebg\n▸ ${prefix}blur\n▸ ${prefix}qc\n▸ ${prefix}brat\n▸ ${prefix}smeme\n▸ ${prefix}vv\n▸ ${prefix}namecard`, footer: 'Create and edit stickers', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎨 Sticker Menu', id: `${prefix}stickermenu` }) }] },
            { url: './database/menucards/fun.png', body: `😂 *FUN*\n\n▸ ${prefix}joke\n▸ ${prefix}meme\n▸ ${prefix}quote\n▸ ${prefix}fact\n▸ ${prefix}8ball\n▸ ${prefix}roast\n▸ ${prefix}compliment\n▸ ${prefix}ship\n▸ ${prefix}truth\n▸ ${prefix}dare\n▸ ${prefix}neko\n▸ ${prefix}waifu`, footer: 'Entertainment & random fun', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '😂 Fun Menu', id: `${prefix}funmenu` }) }] },
            { url: './database/menucards/games.png', body: `🎮 *GAMES*\n\n▸ ${prefix}connect4\n▸ ${prefix}suit\n▸ ${prefix}slot\n▸ ${prefix}blackjack\n▸ ${prefix}rpg\n▸ ${prefix}math\n▸ ${prefix}anagram\n▸ ${prefix}guessnum\n▸ ${prefix}trivia\n▸ ${prefix}pokemon`, footer: 'Multiplayer & solo games', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎮 Games Menu', id: `${prefix}gamemenu` }) }] },
            { url: './database/menucards/search.png', body: `🔍 *SEARCH*\n\n▸ ${prefix}google\n▸ ${prefix}wiki\n▸ ${prefix}urban\n▸ ${prefix}weather\n▸ ${prefix}news\n▸ ${prefix}anime\n▸ ${prefix}manga\n▸ ${prefix}github\n▸ ${prefix}npm\n▸ ${prefix}iplookup`, footer: 'Search the web instantly', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔍 Search Menu', id: `${prefix}searchmenu` }) }] },
            { url: './database/menucards/privacy.png', body: `🔒 *PRIVACY & AUTO*\n\n▸ ${prefix}autoai\n▸ ${prefix}selfchat\n▸ ${prefix}privatemode\n▸ ${prefix}setawaymsg\n▸ ${prefix}pending\n▸ ${prefix}pendingclear\n▸ ${prefix}automation`, footer: 'Auto toggles & privacy', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔒 Privacy Menu', id: `${prefix}privacymenu` }) }] },
            { url: './database/menucards/economy.png', body: `💰 *ECONOMY*\n\n▸ ${prefix}daily\n▸ ${prefix}work\n▸ ${prefix}rob\n▸ ${prefix}balance\n▸ ${prefix}deposit\n▸ ${prefix}withdraw\n▸ ${prefix}transfer\n▸ ${prefix}buy\n▸ ${prefix}inventory\n▸ ${prefix}lb`, footer: 'Virtual economy & banking', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💰 Economy Menu', id: `${prefix}economymenu` }) }] },
            { url: './database/menucards/sports.png', body: `⚽ *SPORTS*\n\n▸ ${prefix}leagues\n▸ ${prefix}fixtures <league>\n▸ ${prefix}live\n▸ ${prefix}standings <league>\n▸ ${prefix}team <id>\n▸ ${prefix}player <id>\n▸ ${prefix}h2h <id1>-<id2>\n▸ ${prefix}odds <sport>\n▸ ${prefix}espn`, footer: 'Live scores, stats & betting', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⚽ Sports Menu', id: `${prefix}sportsmenu` }) }] },
            { url: './database/menucards/movies.png', body: `🎬 *MOVIES*\n\n▸ ${prefix}movie\n▸ ${prefix}series\n▸ ${prefix}imdb\n▸ ${prefix}rating\n▸ ${prefix}tv\n▸ ${prefix}episodes\n▸ ${prefix}anime\n▸ ${prefix}manga`, footer: 'Movie & TV show info', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎬 Movies Menu', id: `${prefix}moviesmenu` }) }] },
            { url: './database/menucards/casino.png', body: `🎰 *CASINO*\n\n▸ ${prefix}roulette <bet> <choice>\n▸ ${prefix}crash <bet> <mult>\n▸ ${prefix}dice <bet> over/under <num>\n▸ ${prefix}coin <bet> heads/tails\n▸ ${prefix}rps rock/paper/scissors`, footer: 'Bet & win virtual coins', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎰 Casino Menu', id: `${prefix}casinomenu` }) }] },
            { url: './database/menucards/admin.png', body: `🛠️ *ADMIN*\n\n▸ ${prefix}ban\n▸ ${prefix}unban\n▸ ${prefix}mute\n▸ ${prefix}unmute\n▸ ${prefix}warn\n▸ ${prefix}unwarn\n▸ ${prefix}clear\n▸ ${prefix}delete\n▸ ${prefix}pin\n▸ ${prefix}unpin`, footer: 'Moderation tools', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🛠️ Admin Menu', id: `${prefix}adminmenu` }) }] },
            { url: './database/menucards/owner.png', body: `👑 *OWNER*\n\n▸ ${prefix}block\n▸ ${prefix}unblock\n▸ ${prefix}join\n▸ ${prefix}leave\n▸ ${prefix}backup\n▸ ${prefix}setppbot\n▸ ${prefix}delppbot\n▸ ${prefix}public\n▸ ${prefix}private\n▸ ${prefix}schedule\n▸ ${prefix}remind\n▸ ${prefix}reminders\n▸ ${prefix}pendingclear`, footer: 'Owner commands', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👑 Owner Menu', id: `${prefix}ownermenu` }) }] }
        ];
        const carouselBody = `╔══════════════════════╗
║  *🦊 Maureonix*  ║
╚══════════════════════╝

👋 Hello *${m.pushName || 'User'}*!
${ucapanWaktu}

📅 *Date:* ${tanggal}
🕐 *Time:* ${jam}

🔧 *Prefix:* ${prefix}
📊 *Commands:* ${cases.length}+

✨ *Swipe to explore categories* ✨`;

        try {
            await maureonix.sendCarouselMsg(m.chat, carouselBody, `© Maureonix | ${prefix}help <cmd> for details`, carouselCards, { quoted: m });
        } catch (e) {
            console.error('[carousel error]', e);
            // Fallback to image menu
            try {
                const buf = await generateMenuImage({
                    botName: botname,
                    ownerName: author,
                    memberName: m.pushName || 'User',
                    prefix: prefix,
                    totalCmds: cases.length,
                    time: jam,
                    date: tanggal
                });
                const caption = `╭━═✦〔 Maureonix 〕✦═━╮\n╰═✪═════════════════✪═╯\n\n👋 Hello *${m.pushName || 'User'}*!\n🔧 Prefix: *${prefix}*\n📊 Commands: *${cases.length}+*\n\n_Type ${prefix}help <command> for details_`;
                await maureonix.sendMessage(m.chat, { image: buf, caption }, { quoted: m });
            } catch (imgErr) {
                // Ultimate fallback – plain text menu
                const textMenu = `*🦊 Maureonix Menu*\n\n` +
                    `🤖 *Bot:* ${prefix}ping, ${prefix}alive, ${prefix}owner, ${prefix}profile, ${prefix}leaderboard, ${prefix}sc, ${prefix}donasi\n` +
                    `👥 *Group:* ${prefix}add, ${prefix}kick, ${prefix}promote, ${prefix}demote, ${prefix}tagall, ${prefix}hidetag, ${prefix}linkgroup, ${prefix}revoke, ${prefix}setname, ${prefix}setdesc, ${prefix}setppgc, ${prefix}delete, ${prefix}pin\n` +
                    `⬇️ *Download:* ${prefix}song, ${prefix}video, ${prefix}tiktok, ${prefix}instagram, ${prefix}facebook, ${prefix}twitter, ${prefix}spotify, ${prefix}mediafire, ${prefix}apk\n` +
                    `🧠 *AI:* ${prefix}gpt, ${prefix}gemini, ${prefix}llama, ${prefix}deepseek, ${prefix}ai, ${prefix}imagine, ${prefix}translate, ${prefix}tts, ${prefix}summarize, ${prefix}code, ${prefix}brainrot, ${prefix}docs, ${prefix}ask\n` +
                    `🎨 *Sticker:* ${prefix}sticker, ${prefix}simage, ${prefix}attp, ${prefix}removebg, ${prefix}blur, ${prefix}qc, ${prefix}brat, ${prefix}smeme\n` +
                    `😂 *Fun:* ${prefix}joke, ${prefix}meme, ${prefix}quote, ${prefix}fact, ${prefix}8ball, ${prefix}roast, ${prefix}compliment, ${prefix}ship, ${prefix}truth, ${prefix}dare, ${prefix}neko, ${prefix}waifu\n` +
                    `🎮 *Games:* ${prefix}connect4, ${prefix}suit, ${prefix}slot, ${prefix}blackjack, ${prefix}rpg, ${prefix}math, ${prefix}anagram, ${prefix}guessnum, ${prefix}trivia, ${prefix}pokemon\n` +
                    `🔍 *Search:* ${prefix}google, ${prefix}wiki, ${prefix}urban, ${prefix}weather, ${prefix}news, ${prefix}anime, ${prefix}manga, ${prefix}github, ${prefix}npm, ${prefix}iplookup\n` +
                    `🔒 *Privacy/Auto:* ${prefix}autodownload, ${prefix}autoviewstatus, ${prefix}selfchat, ${prefix}privatemode, ${prefix}setawaymsg, ${prefix}pending, ${prefix}automation\n` +
                    `💰 *Economy:* ${prefix}daily, ${prefix}work, ${prefix}rob, ${prefix}balance, ${prefix}deposit, ${prefix}withdraw, ${prefix}transfer, ${prefix}buy, ${prefix}inventory, ${prefix}lb\n` +
                    `⚽ *Sports:* ${prefix}leagues, ${prefix}fixtures, ${prefix}live, ${prefix}standings, ${prefix}team, ${prefix}player, ${prefix}h2h, ${prefix}odds, ${prefix}espn\n` +
                    `🎬 *Movies:* ${prefix}movie, ${prefix}series, ${prefix}imdb, ${prefix}rating, ${prefix}tv, ${prefix}episodes, ${prefix}anime, ${prefix}manga\n` +
                    `🎰 *Casino:* ${prefix}roulette, ${prefix}crash, ${prefix}dice, ${prefix}coin, ${prefix}rps\n` +
                    `🛠️ *Admin:* ${prefix}ban, ${prefix}unban, ${prefix}mute, ${prefix}unmute, ${prefix}warn, ${prefix}unwarn, ${prefix}clear, ${prefix}delete, ${prefix}pin\n` +
                    `👑 *Owner:* ${prefix}block, ${prefix}unblock, ${prefix}join, ${prefix}leave, ${prefix}backup, ${prefix}setppbot, ${prefix}delppbot, ${prefix}public, ${prefix}private, ${prefix}schedule, ${prefix}remind, ${prefix}reminders, ${prefix}pendingclear\n` +
                    `\nType ${prefix}help <category> for more.`;
                await m.reply(textMenu);
            }
        }
    },

    // ──────────────────────────────────────────────
    //  🔁  MENU ALIASES
    // ──────────────────────────────────────────────
    help: async (maureonix, m, ctx) => { await module.exports.menu(maureonix, m, ctx); },
    allmenu: async (maureonix, m, ctx) => { await module.exports.menu(maureonix, m, ctx); },

    // ──────────────────────────────────────────────
    //  🔁  OTHER ALIASES
    // ──────────────────────────────────────────────
    on: async (maureonix, m, ctx) => { await module.exports.alive(maureonix, m, ctx); },
};