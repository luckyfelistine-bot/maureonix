// commands/bot.js – Basic bot commands & stats (including full menu)
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

    // ──────────────────────────────────────────────
    //  🏠  MAIN MENU
    // ──────────────────────────────────────────────
    menu: async (nimesha, m, ctx) => {
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
            await nimesha.sendCarouselMsg(m.chat, carouselBody, `© Maureonix | ${prefix}help <cmd> for details`, carouselCards, { quoted: m });
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
                await nimesha.sendMessage(m.chat, { image: buf, caption }, { quoted: m });
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
    //  🧭  SUB‑MENUS (quick‑reply targets)
    // ──────────────────────────────────────────────
    botmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *🤖 BOT COMMANDS*  ║
╚══════════════════════╝

📌 *General*
▸ ${prefix}alive – Check if bot is online
▸ ${prefix}ping – Response speed
▸ ${prefix}info – Bot information
▸ ${prefix}owner – Contact owner
▸ ${prefix}runtime – Uptime of bot
▸ ${prefix}speed – Internet speed test
▸ ${prefix}profile – Your profile
▸ ${prefix}leaderboard – Top users
▸ ${prefix}totalpesan – Message stats
▸ ${prefix}sc – Source code
▸ ${prefix}donasi – Donate

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    groupmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *👥 GROUP COMMANDS*  ║
╚══════════════════════╝

📌 *Member Management*
▸ ${prefix}add @user – Add member
▸ ${prefix}kick @user – Remove member
▸ ${prefix}promote @user – Make admin
▸ ${prefix}demote @user – Remove admin
▸ ${prefix}warn @user – Issue warning
▸ ${prefix}unwarn @user – Clear warnings

📌 *Group Info & Settings*
▸ ${prefix}setname <name> – Change group name
▸ ${prefix}setdesc <desc> – Change description
▸ ${prefix}setppgc – Reply to image to set group photo
▸ ${prefix}linkgroup – Get invite link
▸ ${prefix}revoke – Reset invite link
▸ ${prefix}group open/close – Allow/restrict messaging

📌 *Tagging*
▸ ${prefix}tagall <message> – Mention everyone
▸ ${prefix}hidetag <message> – Hidden mention
▸ ${prefix}totag – Reply to forward with hidden mentions

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    downloadmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *⬇️ DOWNLOAD COMMANDS*  ║
╚══════════════════════╝

📌 *Audio & Video*
▸ ${prefix}song <query> – Download MP3
▸ ${prefix}video <query> – Download MP4
▸ ${prefix}play <query> – Play audio

📌 *Social Media*
▸ ${prefix}tiktok <url>
▸ ${prefix}instagram <url>
▸ ${prefix}facebook <url>
▸ ${prefix}twitter <url>
▸ ${prefix}spotify <url>

📌 *Other*
▸ ${prefix}mediafire <url>
▸ ${prefix}apk <app name>

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    aimenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *🧠 AI COMMANDS*  ║
╚══════════════════════╝

📌 *Chat Models*
▸ ${prefix}gpt <prompt>
▸ ${prefix}gemini <prompt>
▸ ${prefix}llama <prompt>
▸ ${prefix}deepseek <prompt>
▸ ${prefix}ai <prompt>

📌 *Image Generation*
▸ ${prefix}imagine <prompt>

📌 *Utilities*
▸ ${prefix}translate <text> <lang>
▸ ${prefix}tts <text>
▸ ${prefix}summarize
▸ ${prefix}code <description>
▸ ${prefix}brainrot <text>

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    gamemenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *🎮 GAMES COMMANDS*  ║
╚══════════════════════╝

📌 *Multiplayer*
▸ ${prefix}connect4 @user
▸ ${prefix}suit @user
▸ ${prefix}chess @user

📌 *Single Player*
▸ ${prefix}slot – Slot machine
▸ ${prefix}blackjack – Play blackjack
▸ ${prefix}rpg – Adventure RPG
▸ ${prefix}math – Math quiz
▸ ${prefix}tebaklagu – Guess song

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    funmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *😂 FUN COMMANDS*  ║
╚══════════════════════╝

📌 *Random Fun*
▸ ${prefix}joke – Random joke
▸ ${prefix}meme – Random meme
▸ ${prefix}quote – Inspirational quote
▸ ${prefix}fact – Random fact

📌 *Interactive*
▸ ${prefix}8ball <question>
▸ ${prefix}roast @user
▸ ${prefix}compliment @user
▸ ${prefix}ship @user1 @user2
▸ ${prefix}truth – Truth question
▸ ${prefix}dare – Dare challenge
▸ ${prefix}bisakah <question>

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    stickermenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *🎨 STICKER COMMANDS*  ║
╚══════════════════════╝

📌 *Create Stickers*
▸ ${prefix}sticker – Send image/video
▸ ${prefix}s – Shortcut for sticker
▸ ${prefix}simage – Sticker to image
▸ ${prefix}toimg – Same as simage
▸ ${prefix}attp <text> – Animated text

📌 *Image Editing*
▸ ${prefix}removebg – Remove background
▸ ${prefix}blur – Blur image
▸ ${prefix}qc <text> – Quote canvas
▸ ${prefix}brat <text> – Brat style
▸ ${prefix}smeme – Sticker meme

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    searchmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *🔍 SEARCH COMMANDS*  ║
╚══════════════════════╝

📌 *Web Search*
▸ ${prefix}google <query>
▸ ${prefix}wiki <query>
▸ ${prefix}urban <word>
▸ ${prefix}weather <city>
▸ ${prefix}news

📌 *Anime & Manga*
▸ ${prefix}anime <title>
▸ ${prefix}manga <title>

📌 *Developer*
▸ ${prefix}github <repo>
▸ ${prefix}npm <package>
▸ ${prefix}iplookup <ip>
▸ ${prefix}whois <domain>
▸ ${prefix}dns <domain>

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    economymenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *💰 ECONOMY COMMANDS*  ║
╚══════════════════════╝

📌 *Actions*
▸ ${prefix}daily – Claim daily reward
▸ ${prefix}work – Work to earn coins
▸ ${prefix}rob @user – Attempt to rob someone
▸ ${prefix}balance – Check your balance
▸ ${prefix}deposit <amount> – Deposit to bank
▸ ${prefix}withdraw <amount> – Withdraw from bank
▸ ${prefix}transfer @user <amount> – Send coins
▸ ${prefix}lb – Leaderboard
▸ ${prefix}buy <item> – Buy from shop
▸ ${prefix}inventory – View your items

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    ownermenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *👑 OWNER COMMANDS*  ║
╚══════════════════════╝

📌 *User Control*
▸ ${prefix}block @user
▸ ${prefix}unblock @user
▸ ${prefix}ban @user
▸ ${prefix}unban @user
▸ ${prefix}addprem @user
▸ ${prefix}delprem @user

📌 *Bot Control*
▸ ${prefix}backup – Backup database
▸ ${prefix}shutdown – Stop bot
▸ ${prefix}restart – Restart bot
▸ ${prefix}join <link> – Join group
▸ ${prefix}leave – Leave group
▸ ${prefix}setppbot – Set bot profile picture
▸ ${prefix}delppbot – Remove bot profile picture

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    sportsmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *⚽ SPORTS COMMANDS*  ║
╚══════════════════════╝

📌 *Football (API Sports)*
▸ ${prefix}leagues – List leagues & IDs
▸ ${prefix}fixtures <league-id> – Upcoming matches
▸ ${prefix}live – Live scores (Premier League)
▸ ${prefix}standings <league-id> – League table
▸ ${prefix}team <id> – Team info
▸ ${prefix}player <id> – Player stats
▸ ${prefix}h2h <id1>-<id2> – Head to head
▸ ${prefix}predict <fixture-id> – Match prediction

📌 *Betting (Odds API)*
▸ ${prefix}sports – List available sports
▸ ${prefix}odds <sport-key> – Current odds

📌 *ESPN (Free)*
▸ ${prefix}espn <sport> <league> – Live scoreboard
▸ ${prefix}espnnews <sport> <league> – News

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    moviesmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *🎬 MOVIES COMMANDS*  ║
╚══════════════════════╝

📌 *Movie Info*
▸ ${prefix}movie <title>
▸ ${prefix}film <title>
▸ ${prefix}imdb <id>
▸ ${prefix}series <title>
▸ ${prefix}rating <id>
▸ ${prefix}tv <show>
▸ ${prefix}episodes <show-id> <season>
▸ ${prefix}moviequote

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    casinomenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *🎰 CASINO COMMANDS*  ║
╚══════════════════════╝

📌 *Games*
▸ ${prefix}slot – Spin the slot machine
▸ ${prefix}roulette <bet> <red/black/even/odd/number>
▸ ${prefix}crash <bet> <multiplier> – Crash game
▸ ${prefix}dice <bet> over/under <2-11>
▸ ${prefix}coin <bet> heads/tails
▸ ${prefix}rps <rock/paper/scissors/lizard/spock>

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    rpgmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *🧙 RPG ADVENTURE*  ║
╚══════════════════════╝

📌 *Commands*
▸ ${prefix}rpg – View your stats
▸ ${prefix}rpg fight – Attack current enemy
▸ ${prefix}rpg heal – Heal 40 HP (costs 10 gold)
▸ ${prefix}rpg spawn – Summon a new enemy

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    mastermenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *📊 MASTER COMMANDS*  ║
╚══════════════════════╝

📌 *Categories*
▸ ${prefix}economy – Economy system
▸ ${prefix}daily – Daily tools
▸ ${prefix}health – Health calculators
▸ ${prefix}finance – Finance tools
▸ ${prefix}social – Social utilities
▸ ${prefix}dev – Developer tools
▸ ${prefix}travel – Travel helpers
▸ ${prefix}food – Food & recipes

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    adminmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗
║  *🛠️ ADMIN COMMANDS*  ║
╚══════════════════════╝

📌 *User Management*
▸ ${prefix}ban @user
▸ ${prefix}unban @user
▸ ${prefix}mute – Mute group
▸ ${prefix}unmute – Unmute group
▸ ${prefix}warn @user
▸ ${prefix}unwarn @user

📌 *Chat Management*
▸ ${prefix}clear – Clear chat
▸ ${prefix}delete – Delete message
▸ ${prefix}pin – Pin message
▸ ${prefix}unpin – Unpin message

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    // ──────────────────────────────────────────────
    //  🔁  MENU ALIASES
    // ──────────────────────────────────────────────
    help: async (nimesha, m, ctx) => { await module.exports.menu(nimesha, m, ctx); },
    allmenu: async (nimesha, m, ctx) => { await module.exports.menu(nimesha, m, ctx); },

    // ──────────────────────────────────────────────
    //  🔁  OTHER ALIASES
    // ──────────────────────────────────────────────
    on: async (nimesha, m, ctx) => { await module.exports.alive(nimesha, m, ctx); },
};