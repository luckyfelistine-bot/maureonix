// nima_commands.js – ALL COMMAND CASES (FULLY FIXED & COMPLETE)
// ═══════════════════════════════════════════════════════════════════════════

module.exports = async (nimesha, m, ctx) => {
    const {
        isCmd, command, args, text, q, prefix, isCreator, isOwner, ownerNumber,
        set, sewa, premium, db, store, botNumber,
        suit, chess, chat_ai, gemini_autoreply, gemini_history, menfes,
        tekateki, akinator, tictactoe, tebaklirik, kuismath, blackjack,
        tebaklagu, tebakkata, family100, susunkata, tebakbom, ulartangga,
        tebakkimia, caklontong, tebakangka, tebaknegara, tebakgambar, tebakbendera,
        isVip, isBan, isLimit, isPremium, isNsfw,
        author, packname, botname, dayName, tanggal, jam, ucapanWaktu,
        setv, fkontak, readmore, fileSha256, budy, body,
        AI, Search, Tools, Fun, Economy, Admin, Daily, Health, Finance, Social, Dev, Travel, Food,
        RAWG, TriviaMaster, PokemonGame, NumbersGame, FunAPIs, RPGAdventure,
        slotMachine, rouletteSpin, crash, diceRoll, coinflip, rpsls, mathQuiz, anagram, numberGuess,
        gameSlot, gameCasinoSolo, gameSamgongSolo, gameMerampok, gameBegal, daily, buy, setLimit, addLimit, addMoney, setMoney, transfer,
        OMDB, TVMaze, AniList, Jikan, TMDB, MovieGuesser, Movie, fmtCast,
        APISports, OddsAPI, ESPN,
        ytMp4, ytMp3, tiktokDownload, igDownload, fbDownload, spotifyDownload, pinterestDownload, redditDownload, mediafireDownload, apkDownload,
        toAudio, toPTT, toVideo, generateMenuImage,
        runtime, clockString, sleep, isUrl, formatDate, generateProfilePicture,
        pickRandom, similarity, almost, cases
    } = ctx;

    // Only process if it's a command or fileSha256 media
    if (!isCmd && !fileSha256) return;

    switch (fileSha256 || command) {
        // ===== BASIC BOT COMMANDS =====
        case 'ping': {
            const start = Date.now();
            const msg = await m.reply('📡 *Pinging...*');
            const end = Date.now();
            await nimesha.sendMessage(m.chat, {
                text: `🏓 *Pong!*\n━━━━━━━━━━━━━━━━━━━━━━\n📶 *Response:* ${end - start} ms\n⚡ *WebSocket:* ${nimesha.ws?.readyState === 1 ? 'Connected' : 'Disconnected'}\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`,
                edit: msg.key
            });
        }
        break

        case 'alive': case 'on': {
            const uptime = runtime(process.uptime());
            const ram = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
            const users = Object.keys(db.users || {}).length;
            const groups = Object.keys(db.groups || {}).length;
            const aliveMsg = `╔══════════════════════╗
║  *🦊 Maureonix* [BOT]  ║
╠══════════════════════╣
║ ✅ *Bot is online!*
║
║ 🕒 *Uptime:* ${uptime}
║ 💾 *RAM:* ${ram}
║ 👥 *Users:* ${users}
║ 🏠 *Groups:* ${groups}
║ 🧠 *Prefix:* ${prefix}
║ 📅 *Date:* ${tanggal}
║ 🕐 *Time:* ${jam}
║
║ 🤖 *Status:* Active & Healthy
╠══════════════════════╣
║ 👑 *By ${author}*
╚══════════════════════╝`;
            await m.reply(aliveMsg);
        }
        break

        case 'speed': {
            const speed = require('performance-now');
            const start = speed();
            const msg = await m.reply('⚡ *Testing speed...*');
            const end = speed();
            await nimesha.sendMessage(m.chat, {
                text: `⚡ *Speed Test*\n━━━━━━━━━━━━━━━━━━━━━━\n📶 *Response:* ${(end - start).toFixed(3)} ms`,
                edit: msg.key
            });
        }
        break

        case 'runtime': {
            await m.reply(`🕒 *Bot Uptime*\n━━━━━━━━━━━━━━━━━━━━━━\n${runtime(process.uptime())}`);
        }
        break

        case 'info': {
            const infoMsg = `🤖 *Bot Information*
━━━━━━━━━━━━━━━━━━━━━━
📛 *Name:* ${botname}
👑 *Owner:* ${author}
🔢 *Version:* 5.0.0
📅 *Date:* ${tanggal}
🕐 *Time:* ${jam}
🧠 *Prefix:* ${prefix}
📊 *Commands:* ${cases.length}+
👥 *Users:* ${Object.keys(db.users).length}
🏠 *Groups:* ${Object.keys(db.groups).length}
━━━━━━━━━━━━━━━━━━━━━━`;
            await m.reply(infoMsg);
        }
        break

        case 'owner': case 'listowner': {
            await nimesha.sendContact(m.chat, ownerNumber, m);
        }
        break

        case 'profile': case 'cek': {
            const user = Object.keys(db.users);
            const infoUser = db.users[m.sender];
            const _msg_profile = await m.reply('⏳ *Loading...*');
            await nimesha.sendMessage(m.chat, { text: `*👤 Profile @${m.sender.split('@')[0]}* :
🐋 Bot User: ${user.includes(m.sender) ? 'True' : 'False'}
🔥 User: ${isVip ? 'VIP' : isPremium ? 'PREMIUM' : 'FREE'}${isPremium ? `\n⏳ Expired : ${checkStatus(m.sender, premium) ? formatDate(getExpired(m.sender, db.premium)) : '-'}` : ''}
🎫 Limit: ${infoUser.limit}
💰 Money: ${infoUser ? infoUser.money.toLocaleString('en-US') : '0'}`, edit: _msg_profile.key });
        }
        break

        case 'leaderboard': {
            const entries = Object.entries(db.users).sort((a, b) => b[1].money - a[1].money).slice(0, 10).map(entry => entry[0]);
            let teksnya = '╭──❍「 *LEADERBOARD* 」❍\n';
            for (let i = 0; i < entries.length; i++) {
                teksnya += `│• ${i + 1}. @${entries[i].split('@')[0]}\n│• Balance: ${db.users[entries[i]].money.toLocaleString('en-US')}\n│\n`;
            }
            const _msg_leaderboard = await m.reply('⏳ 🏆 *Getting leaderboard...*');
            await nimesha.sendMessage(m.chat, { text: teksnya + '╰──────❍', edit: _msg_leaderboard.key });
        }
        break

        case 'totalpesan': {
            let messageCount = {};
            let messages = store?.messages[m.chat]?.array || [];
            let participants = m?.metadata?.participants?.map(p => p.id) || store?.messages[m.chat]?.array?.map(p => p.key.participant) || [];
            messages.forEach(mes => {
                if (mes.key?.participant && mes.message) {
                    messageCount[mes.key.participant] = (messageCount[mes.key.participant] || 0) + 1;
                }
            });
            let totalMessages = Object.values(messageCount).reduce((a, b) => a + b, 0);
            let date = new Date().toLocaleDateString('en-US');
            let zeroMessageUsers = participants.filter(user => !messageCount[user]).map(user => `- @${user.replace(/[^0-9]/g, '')}`);
            let messageList = Object.entries(messageCount).map(([sender, count], index) => `${index + 1}. @${sender.replace(/[^0-9]/g, '')}: ${count} messages`);
            let result = `Total messages ${totalMessages} from ${participants.length} members\nOn ${date}:\n${messageList.join('\n')}\n\nNote: ${text.length > 0 ? `\n${zeroMessageUsers.length > 0 ? `Members who didn't send messages (Siders):\n${zeroMessageUsers.join('\n')}` : 'All members have sent messages!'}` : `Check siders? ${prefix + command} --sider`}`;
            const _msg_totalpesan = await m.reply('⏳ 📊 *Counting...*');
            await nimesha.sendMessage(m.chat, { text: result, edit: _msg_totalpesan.key });
        }
        break

        case 'sc': case 'script': {
            await m.reply(`https://github.com/luckyfelistine-bot/maureonix\n⬆️ This is the script`, {
                contextInfo: {
                    forwardingScore: 10,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: my.ch,
                        serverMessageId: null,
                        newsletterName: 'Maureonix'
                    },
                    externalAdReply: {
                        title: author,
                        body: 'Subscribe My YouTube',
                        thumbnail: fake.thumbnail,
                        mediaType: 2,
                        mediaUrl: my.tt,
                        sourceUrl: my.tt,
                    }
                }
            });
        }
        break

        case 'donasi': case 'donate': {
            const _msg_donasi = await m.reply('⏳ 💰 *Getting donation info...*');
            await nimesha.sendMessage(m.chat, { text: 'You can donate via this URL:\nhttps://saweria.co/nima-axis', edit: _msg_donasi.key });
        }
        break

        // ===== STICKER & MEDIA TOOLS =====
        case 'sticker': case 's': {
            if (!m.quoted) return m.reply('Reply to an image, video, or GIF to convert to sticker.');
            try {
                const buffer = await m.quoted.download();
                const stickerBuffer = await writeExif(buffer, {
                    packname: packname,
                    author: author
                });
                await nimesha.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });
            } catch (e) {
                m.reply('❌ Failed to create sticker: ' + e.message);
            }
        }
        break

        case 'simage': case 'toimg': {
            if (!m.quoted || !/sticker/.test(m.quoted.type)) return m.reply('Reply to a sticker to convert to image.');
            try {
                const buffer = await m.quoted.download();
                await nimesha.sendMessage(m.chat, { image: buffer }, { quoted: m });
            } catch (e) {
                m.reply('❌ Failed to convert: ' + e.message);
            }
        }
        break

        case 'attp': {
            if (!text) return m.reply(`Example: ${prefix + command} <text>`);
            try {
                const url = `https://api.lolhuman.xyz/api/attp?apikey=demo&text=${encodeURIComponent(text)}`;
                const buffer = await getBuffer(url);
                await nimesha.sendMessage(m.chat, { sticker: buffer }, { quoted: m });
            } catch (e) {
                m.reply('❌ Failed to create attp: ' + e.message);
            }
        }
        break

        case 'removebg': {
            if (!m.quoted || !/image/.test(m.quoted.type)) return m.reply('Reply to an image to remove background.');
            await m.reply('🎨 *Removing background...*');
            try {
                const buffer = await m.quoted.download();
                const formData = new FormData();
                formData.append('image', buffer, 'image.png');
                const res = await fetch('https://api.remove.bg/v1.0/removebg', {
                    method: 'POST',
                    headers: { 'X-Api-Key': 'YOUR_REMOVE_BG_KEY' },
                    body: formData
                });
                if (!res.ok) throw new Error('API error');
                const result = await res.buffer();
                await nimesha.sendMessage(m.chat, { image: result, caption: '✅ Background removed' }, { quoted: m });
            } catch (e) {
                m.reply('❌ Remove BG failed. You may need an API key.');
            }
        }
        break

        case 'blur': {
            if (!m.quoted || !/image/.test(m.quoted.type)) return m.reply('Reply to an image to blur.');
            try {
                const buffer = await m.quoted.download();
                const blurred = await sharp(buffer).blur(10).toBuffer();
                await nimesha.sendMessage(m.chat, { image: blurred, caption: '🔮 Blurred' }, { quoted: m });
            } catch (e) {
                m.reply('❌ Failed to blur: ' + e.message);
            }
        }
        break

        case 'qc': {
            if (!text) return m.reply(`Example: ${prefix + command} <text>`);
            try {
                const url = `https://api.lolhuman.xyz/api/quotemaker?apikey=demo&text=${encodeURIComponent(text)}&avatar=${encodeURIComponent(await nimesha.profilePictureUrl(m.sender, 'image').catch(() => 'https://telegra.ph/file/95670d63378f7f4210f03.png'))}`;
                const buffer = await getBuffer(url);
                await nimesha.sendMessage(m.chat, { image: buffer }, { quoted: m });
            } catch (e) {
                m.reply('❌ QC failed: ' + e.message);
            }
        }
        break

        case 'brat': {
            if (!text) return m.reply(`Example: ${prefix + command} <text>`);
            try {
                const url = `https://api.lolhuman.xyz/api/brat?apikey=demo&text=${encodeURIComponent(text)}`;
                const buffer = await getBuffer(url);
                await nimesha.sendMessage(m.chat, { image: buffer }, { quoted: m });
            } catch (e) {
                m.reply('❌ Brat failed: ' + e.message);
            }
        }
        break

        case 'smeme': {
            if (!m.quoted || !/image/.test(m.quoted.type)) return m.reply('Reply to an image with caption: .smeme top|bottom');
            if (!text || !text.includes('|')) return m.reply(`Example: ${prefix + command} top text|bottom text`);
            const [top, bottom] = text.split('|').map(s => s.trim());
            try {
                const buffer = await m.quoted.download();
                const url = `https://api.memegen.link/images/custom/${encodeURIComponent(top)}/${encodeURIComponent(bottom)}.png?background=${encodeURIComponent(buffer.toString('base64'))}`;
                const memeBuffer = await getBuffer(url);
                await nimesha.sendMessage(m.chat, { image: memeBuffer }, { quoted: m });
            } catch (e) {
                m.reply('❌ Smeme failed: ' + e.message);
            }
        }
        break

        // ===== AI COMMANDS =====
        case 'gpt': case 'chatgpt': case 'openai': {
            if (!text) return m.reply(`Example: ${prefix + command} <question>`);
            await m.reply('🧠 *Groq AI thinking...*');
            try {
                const res = await AI.askModel(text, 'gpt', m.sender);
                await m.reply(`🤖 *GPT (Groq)*\n\n${res.text}`);
            } catch (e) {
                await m.reply(`❌ AI error: ${e.message}`);
            }
        }
        break

        case 'gemini': {
            if (!text) return m.reply(`Example: ${prefix + command} <question>`);
            await m.reply('♊ *Gemini (via Groq)* thinking...');
            try {
                const res = await AI.askModel(text, 'gemini', m.sender);
                await m.reply(`♊ *Gemini*\n\n${res.text}`);
            } catch (e) {
                await m.reply(`❌ AI error: ${e.message}`);
            }
        }
        break

        case 'llama': case 'llama3': {
            if (!text) return m.reply(`Example: ${prefix + command} <question>`);
            await m.reply('🦙 *Llama 3 thinking...*');
            try {
                const res = await AI.askModel(text, 'llama', m.sender);
                await m.reply(`🦙 *Llama 3*\n\n${res.text}`);
            } catch (e) {
                await m.reply(`❌ AI error: ${e.message}`);
            }
        }
        break

        case 'deepseek': {
            if (!text) return m.reply(`Example: ${prefix + command} <question>`);
            await m.reply('🐋 *DeepSeek (via Groq)* thinking...');
            try {
                const res = await AI.askModel(text, 'deepseek', m.sender);
                await m.reply(`🐋 *DeepSeek*\n\n${res.text}`);
            } catch (e) {
                await m.reply(`❌ AI error: ${e.message}`);
            }
        }
        break

        case 'ai': case 'ask': case 'brain': {
            if (!text) return m.reply(`Example: ${prefix + command} <question>`);
            await m.reply('🌐 *Ultimate AI thinking...*');
            try {
                const res = await AI.ultimateAI(text, m.sender);
                await m.reply(`🎯 *${res.provider}*\n\n${res.text}`);
            } catch (e) {
                await m.reply(`❌ AI error: ${e.message}`);
            }
        }
        break

        case 'imagine': case 'aiimage': case 'draw': case 'create': {
            if (!text) return m.reply(`Example: ${prefix + command} <prompt>`);
            await m.reply('🎨 *Generating image...*');
            const url = await AI.imagine(text);
            await nimesha.sendMessage(m.chat, { image: { url }, caption: `🎨 *${text}*` }, { quoted: m });
        }
        break

        case 'translate': case 'tr': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} <lang> <text>`);
            const lang = args[0];
            const txt = args.slice(1).join(' ');
            const res = await AI.translate(txt, lang);
            await m.reply(`🌐 *Translated (${lang}):*\n${res}`);
        }
        break

        case 'tts': {
            if (!text) return m.reply(`Example: ${prefix + command} <text>`);
            const lang = 'en';
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
            try {
                const fetch = require('node-fetch');
                const audioBuffer = await fetch(url).then(r => r.buffer());
                await nimesha.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
            } catch {
                try {
                    const gTTS = require('gtts');
                    const tts = new gTTS(text, 'en');
                    const file = path.join(__dirname, 'database', 'temp', `${Date.now()}.mp3`);
                    tts.save(file, async () => {
                        await nimesha.sendMessage(m.chat, { audio: fs.readFileSync(file), mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
                        fs.unlinkSync(file);
                    });
                } catch (e) {
                    m.reply('❌ TTS failed: ' + e.message);
                }
            }
        }
        break

        case 'summarize': {
            if (!m.quoted) return m.reply('Reply to a long message to summarize');
            const toSummarize = m.quoted.body || m.quoted.text || '';
            if (!toSummarize) return m.reply('No text to summarize');
            await m.reply('📋 *Summarizing...*');
            const summary = await AI.summarize(toSummarize);
            await m.reply(`📋 *Summary:*\n\n${summary}`);
        }
        break

        case 'code': case 'coding': case 'program': {
            if (!text) return m.reply(`Example: ${prefix + command} <description>`);
            const lang = args[0].startsWith('--') ? args.shift().slice(2) : 'javascript';
            const res = await AI.codeAI(text, lang);
            await m.reply(`💻 *${lang.toUpperCase()} Code:*\n\n\`\`\`${lang}\n${res.text}\n\`\`\``);
        }
        break

        case 'brainrot': {
            if (!text) return m.reply(`Example: ${prefix + command} <text>`);
            const res = await AI.brainrot(text);
            await m.reply(`🧠 *Brainrot Mode:*\n${res.text}`);
        }
        break

        case 'roastai': {
            if (!text) return m.reply(`Example: ${prefix + command} <name/thing>`);
            const res = await AI.roast(text);
            await m.reply(`🔥 *AI Roast:*\n${res.text}`);
        }
        break

        case 'rizz': {
            if (!text) return m.reply(`Example: ${prefix + command} <situation>`);
            const res = await AI.rizz(text);
            await m.reply(`💘 *Rizz:*\n${res.text}`);
        }
        break

        case 'clearmemory': {
            AI.clearMemory(m.sender);
            await m.reply('🧹 AI memory cleared');
        }
        break

        case 'aibalance': case 'poebalance': {
            try {
                const bal = await AI.getBalance();
                await m.reply(`💰 *AI Service Status*\n\nBalance: ${bal.current_point_balance}\nRate Limit: ${bal.rate_limit}\nModels: ${bal.models_available.join(', ')}`);
            } catch (e) {
                await m.reply('❌ Failed to fetch status');
            }
        }
        break

        // ===== DOWNLOADERS =====
        case 'song': case 'mp3': case 'ytmp3': case 'play': {
            if (!text) return m.reply(`Example: ${prefix + command} <query/url>`);
            await m.reply('🎵 *Downloading audio...*');
            try {
                let url = text;
                if (!url.includes('youtube') && !url.includes('youtu.be')) {
                    const sr = await yts(text);
                    if (sr.videos?.length) url = sr.videos[0].url;
                    else throw new Error('No results');
                }
                const audio = await ytMp3(url);
                await nimesha.sendMessage(m.chat, {
                    audio: { url: audio.url }, mimetype: 'audio/mpeg',
                    fileName: `${audio.title}.mp3`, ptt: false
                }, { quoted: m });
            } catch(e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'video': case 'mp4': case 'ytmp4': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <url>`);
            await m.reply('📥 *Downloading video...*');
            try {
                const v = await ytMp4(args[0]);
                await nimesha.sendMessage(m.chat, { video: { url: v.url }, caption: v.title }, { quoted: m });
            } catch(e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'tiktok': case 'tt': case 'tik': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <url>`);
            await m.reply('🎬 *Fetching TikTok...*');
            try {
                const tt = await tiktokDownload(args[0]);
                if (tt.type === 'video') await nimesha.sendMessage(m.chat, { video: { url: tt.url }, caption: tt.title || 'TikTok' }, { quoted: m });
                else if (tt.items) for (const img of tt.items.slice(0,10)) await nimesha.sendMessage(m.chat, { image: { url: img } }, { quoted: m });
            } catch(e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'instagram': case 'ig': case 'insta': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <url>`);
            await m.reply('📸 *Downloading...*');
            try {
                const ig = await igDownload(args[0]);
                if (ig.type === 'image') await nimesha.sendMessage(m.chat, { image: { url: ig.url } }, { quoted: m });
                else if (ig.type === 'video') await nimesha.sendMessage(m.chat, { video: { url: ig.url } }, { quoted: m });
                else if (ig.items) for (const item of ig.items.slice(0,10)) {
                    await nimesha.sendMessage(m.chat, item.is_video ? { video: { url: item.url } } : { image: { url: item.url } }, { quoted: m });
                }
            } catch(e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'facebook': case 'fb': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <url>`);
            await m.reply('📱 *Downloading FB...*');
            try {
                const fb = await fbDownload(args[0]);
                await nimesha.sendMessage(m.chat, { video: { url: fb.hd || fb.sd }, caption: 'Facebook Video' }, { quoted: m });
            } catch(e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'twitter': case 'x': case 'twit': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <url>`);
            await m.reply('🐦 *Downloading X...*');
            try {
                const tw = await (require('./lib/scraper').twitterDownload(args[0]));
                await nimesha.sendMessage(m.chat, { video: { url: tw.url } }, { quoted: m });
            } catch(e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'spotify': case 'sp': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <track url>`);
            await m.reply('🎧 *Downloading...*');
            try {
                const sp = await spotifyDownload(args[0]);
                await nimesha.sendMessage(m.chat, { audio: { url: sp.url }, mimetype: 'audio/mpeg', fileName: `${sp.title}.mp3` }, { quoted: m });
            } catch(e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'mediafire': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <url>`);
            try {
                const mf = await mediafireDownload(args[0]);
                await nimesha.sendMessage(m.chat, { document: { url: mf.url }, mimetype: 'application/octet-stream' }, { quoted: m });
            } catch(e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'apk': {
            if (!text) return m.reply(`Example: ${prefix + command} <app name>`);
            try {
                const apk = await apkDownload(text);
                await nimesha.sendMessage(m.chat, { document: apk.buffer, fileName: `${text}.apk`, mimetype: 'application/vnd.android.package-archive' }, { quoted: m });
            } catch(e) { m.reply(`❌ ${e.message}`); }
        }
        break

        // ===== SEARCH COMMANDS =====
        case 'google': case 'g': case 'search': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            const res = await Search.googleSearch(text);
            await m.reply(`🔍 *Google Results*\n\n${res || 'No results'}`);
        }
        break

        case 'wiki': case 'wikipedia': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            const res = await Search.wikiSearch(text);
            await m.reply(`📚 ${res}`);
        }
        break

        case 'github': {
            if (!text) return m.reply(`Example: ${prefix + command} <repo>`);
            const res = await Search.githubSearch(text);
            await m.reply(`💻 *GitHub*\n\n${res}`);
        }
        break

        case 'npm': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <package>`);
            const res = await Search.npmSearch(args[0]);
            await m.reply(`📦 *NPM*\n\n${res}`);
        }
        break

        case 'urban': {
            if (!text) return m.reply(`Example: ${prefix + command} <word>`);
            const res = await Search.urbanDictionary(text);
            await m.reply(`📖 *Urban Dictionary*\n\n${res}`);
        }
        break

        case 'anime': {
            if (!text) return m.reply(`Example: ${prefix + command} <title>`);
            const res = await Search.animeSearch(text);
            await m.reply(`📺 *Anime*\n\n${res}`);
        }
        break

        case 'manga': {
            if (!text) return m.reply(`Example: ${prefix + command} <title>`);
            const res = await Search.mangaSearch(text);
            await m.reply(`📖 *Manga*\n\n${res}`);
        }
        break

        case 'weather': case 'cuaca': {
            if (!text) return m.reply(`Example: ${prefix + command} <city>`);
            const res = await Tools.weather(text);
            await m.reply(res);
        }
        break

        case 'news': {
            const res = await Tools.news();
            await m.reply(`📰 *News*\n\n${res}`);
        }
        break

        case 'covid': {
            if (!text) return m.reply(`Example: ${prefix + command} <country>`);
            const res = await Tools.covid(text);
            await m.reply(res);
        }
        break

        case 'crypto': case 'bitcoin': case 'eth': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <bitcoin>`);
            const res = await Tools.cryptoPrice(args[0].toLowerCase());
            await m.reply(res);
        }
        break

        case 'forex': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} USD EUR`);
            const res = await Tools.forex(args[0], args[1]);
            await m.reply(res);
        }
        break

        case 'iplookup': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <ip>`);
            const res = await Tools.ipLookup(args[0]);
            await m.reply(res);
        }
        break

        case 'whois': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <domain>`);
            const res = await Tools.whois(args[0]);
            await m.reply(res);
        }
        break

        case 'dns': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <domain>`);
            const res = await Tools.dnsLookup(args[0]);
            await m.reply(`📡 *DNS*\n\`\`\`${res}\`\`\``);
        }
        break

        case 'qr': {
            if (!text) return m.reply(`Example: ${prefix + command} <text>`);
            const buf = await Tools.qr(text);
            await nimesha.sendMessage(m.chat, { image: buf, caption: 'QR Code' }, { quoted: m });
        }
        break

        case 'shorten': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <url>`);
            const res = await Tools.shorten(args[0]);
            await m.reply(`🔗 *Short URL:*\n${res}`);
        }
        break

        // ===== FUN COMMANDS =====
        case 'joke': {
            const res = await Fun.joke();
            await m.reply(res);
        }
        break

        case 'meme': {
            const res = await Fun.meme();
            await nimesha.sendMessage(m.chat, { image: { url: res.image }, caption: `${res.caption}\n📁 r/${res.subreddit}` }, { quoted: m });
        }
        break

        case 'quote': {
            const res = await Fun.quote();
            await m.reply(res);
        }
        break

        case 'fact': {
            const res = await Fun.fact();
            await m.reply(res);
        }
        break

        case 'ship': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} @user1 @user2`);
            const res = await Fun.ship(args[0], args[1]);
            await m.reply(res);
        }
        break

        case 'wyr': case 'wouldyourather': {
            const res = await Fun.wouldYouRather();
            await m.reply(res);
        }
        break

        case '8ball': case '8b': {
            if (!text) return m.reply('Ask a question');
            const res = await Fun.eightBall(text);
            await m.reply(res);
        }
        break

        case 'roll': {
            const res = await Fun.rollDice(parseInt(args[0]) || 6);
            await m.reply(res);
        }
        break

        case 'flip': case 'coin': {
            await m.reply(await Fun.flipCoin());
        }
        break

        case 'roast': {
            if (args[0]) {
                const res = await AI.roast(args.join(' '));
                await m.reply(`🔥 ${res.text}`);
            } else {
                await m.reply(await Fun.roast());
            }
        }
        break

        case 'compliment': {
            if (m.quoted) await m.reply(`🌟 @${m.quoted.sender.split('@')[0]}, ${(await Fun.compliment()).replace('🌟 ', '')}`, { mentions: [m.quoted.sender] });
            else await m.reply(await Fun.compliment());
        }
        break

        case 'truth': {
            await m.reply(await Fun.truth());
        }
        break

        case 'dare': {
            await m.reply(await Fun.dare());
        }
        break

        case 'bisakah': case 'apakah': case 'kapan': {
            if (!text) return m.reply('Ask a question!');
            const answers = ['Yes', 'No', 'Maybe', 'Definitely', 'Absolutely not', 'Ask again later'];
            await m.reply(`🎲 *${command.charAt(0).toUpperCase() + command.slice(1)}*\nQ: ${text}\nA: ${pickRandom(answers)}`);
        }
        break

        // ===== ANIME REACTION GIFS =====
        case 'neko': case 'waifu': case 'hug': case 'kiss': case 'pat': case 'wink':
        case 'cry': case 'slap': case 'dance': case 'happy': case 'blush': case 'facepalm':
        case 'nom': case 'poke': case 'punch': case 'loli': {
            try {
                const fetch = require('node-fetch');
                const res = await fetch(`https://nekos.best/api/v2/${command}`).catch(() => null);
                const data = await res?.json();
                const gifUrl = data?.results?.[0]?.url;
                if (gifUrl) {
                    await nimesha.sendMessage(m.chat, { video: { url: gifUrl }, gifPlayback: true, caption: `*${command.toUpperCase()}*` }, { quoted: m });
                } else {
                    m.reply(`❌ Could not fetch ${command} GIF.`);
                }
            } catch (e) { m.reply('❌ Error: ' + e.message); }
        }
        break

        // ===== TEXT EFFECTS =====
        case 'metallic': case 'ice': case 'snow': case 'impressive': case 'matrix': case 'light':
        case 'neon': case 'devil': case 'purple': case 'thunder': case 'leaves': case '1917':
        case 'arena': case 'hacker': case 'sand': case 'blackpink': case 'glitch': case 'fire': {
            if (!text) return m.reply(`Example: ${prefix + command} <text>`);
            await m.reply('🎨 *Generating text art...*');
            try {
                const fetch = require('node-fetch');
                const res = await fetch(`https://api.paxsenix.biz.id/text-effect/${command}?text=${encodeURIComponent(text)}`);
                if (!res.ok) throw new Error('API error');
                const buffer = await res.buffer();
                await nimesha.sendMessage(m.chat, { image: buffer, caption: `🎨 *${command.toUpperCase()} Text Art*\n📝 *Text:* ${text}` }, { quoted: m });
            } catch (e) {
                try {
                    const fetch = require('node-fetch');
                    const res = await fetch(`https://api.lolhuman.xyz/api/teks/${command}?apikey=demo&text=${encodeURIComponent(text)}`);
                    const buffer = await res.buffer();
                    await nimesha.sendMessage(m.chat, { image: buffer, caption: `🎨 *${command.toUpperCase()} Text Art*\n📝 *Text:* ${text}` }, { quoted: m });
                } catch (e2) {
                    m.reply('❌ Failed to generate text art: ' + e.message);
                }
            }
        }
        break

        // ===== MEME OVERLAYS =====
        case 'oogway': {
            if (!text) return m.reply(`Example: ${prefix + command} <quote>`);
            try {
                const fetch = require('node-fetch');
                const res = await fetch(`https://api.paxsenix.biz.id/canvas/oogway?quote=${encodeURIComponent(text)}`);
                const buffer = await res.buffer();
                await nimesha.sendMessage(m.chat, { image: buffer, caption: `🐢 *Oogway says:*\n"${text}"` }, { quoted: m });
            } catch (e) {
                await m.reply(`🐢 *Oogway says:*\n"${text}"`);
            }
        }
        break

        case 'tweet': {
            if (!text) return m.reply(`Example: ${prefix + command} <tweet text>`);
            const username = m.pushName || 'User';
            try {
                const fetch = require('node-fetch');
                const res = await fetch(`https://api.paxsenix.biz.id/tools/tweet?username=${encodeURIComponent(username)}&tweet=${encodeURIComponent(text)}`);
                const buffer = await res.buffer();
                await nimesha.sendMessage(m.chat, { image: buffer, caption: `🐦 *Tweet*\n@${username}: ${text}` }, { quoted: m });
            } catch (e) {
                await m.reply(`🐦 *@${username}:* ${text}`);
            }
        }
        break

        case 'ytcomment': {
            if (!text) return m.reply(`Example: ${prefix + command} <comment>`);
            const username = m.pushName || 'User';
            try {
                const fetch = require('node-fetch');
                const res = await fetch(`https://api.paxsenix.biz.id/tools/ytcomment?username=${encodeURIComponent(username)}&comment=${encodeURIComponent(text)}`);
                const buffer = await res.buffer();
                await nimesha.sendMessage(m.chat, { image: buffer, caption: `💬 *YouTube Comment*\n${username}: ${text}` }, { quoted: m });
            } catch (e) {
                await m.reply(`💬 *YouTube Comment*\n👤 ${username}: ${text}`);
            }
        }
        break

        case 'jail': {
            const mentioned = m.mentionedJid?.[0] || m.sender;
            try {
                const pp = await nimesha.profilePictureUrl(mentioned, 'image').catch(() => null);
                if (pp) {
                    const fetch = require('node-fetch');
                    const res = await fetch(`https://api.paxsenix.biz.id/overlay/jail?image=${encodeURIComponent(pp)}`);
                    const buffer = await res.buffer();
                    return await nimesha.sendMessage(m.chat, { image: buffer, caption: `🚔 *JAILED!*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
                }
                await nimesha.sendMessage(m.chat, { text: `🚔 *@${mentioned.split('@')[0]} is now in JAIL!*`, mentions: [mentioned] }, { quoted: m });
            } catch (e) { m.reply('❌ Error: ' + e.message); }
        }
        break

        case 'triggered': {
            const mentioned = m.mentionedJid?.[0] || m.sender;
            try {
                const pp = await nimesha.profilePictureUrl(mentioned, 'image').catch(() => null);
                if (pp) {
                    const fetch = require('node-fetch');
                    const res = await fetch(`https://api.paxsenix.biz.id/overlay/triggered?image=${encodeURIComponent(pp)}`);
                    const buffer = await res.buffer();
                    return await nimesha.sendMessage(m.chat, { video: buffer, gifPlayback: true, caption: `😤 *TRIGGERED!*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
                }
                await nimesha.sendMessage(m.chat, { text: `😤 *@${mentioned.split('@')[0]} is TRIGGERED!*`, mentions: [mentioned] }, { quoted: m });
            } catch (e) { m.reply('❌ Error: ' + e.message); }
        }
        break

        case 'namecard': {
            const name = m.pushName || text || 'User';
            try {
                const fetch = require('node-fetch');
                const res = await fetch(`https://api.paxsenix.biz.id/tools/namecard?name=${encodeURIComponent(name)}&subtitle=${encodeURIComponent('WhatsApp: ' + m.sender.split('@')[0])}`);
                const buffer = await res.buffer();
                await nimesha.sendMessage(m.chat, { image: buffer, caption: `🪪 *Name Card*\n👤 ${name}` }, { quoted: m });
            } catch (e) {
                await m.reply(`🪪 *Name Card*\n👤 *Name:* ${name}\n📱 *Number:* +${m.sender.split('@')[0]}`);
            }
        }
        break

        case 'heart': case 'circle': case 'lgbt': case 'horny': case 'lolice': case 'gay': case 'glass': case 'passed': {
            const mentioned = m.mentionedJid?.[0] || m.sender;
            const emojiMap = { heart: '❤️', circle: '🕊️', lgbt: '🏳️‍🌈', horny: '😏', lolice: '👮', gay: '🌈', glass: '👓', passed: '✅' };
            try {
                const pp = await nimesha.profilePictureUrl(mentioned, 'image').catch(() => null);
                if (pp) {
                    const fetch = require('node-fetch');
                    const res = await fetch(`https://api.paxsenix.biz.id/overlay/${command}?image=${encodeURIComponent(pp)}`);
                    const buffer = await res.buffer();
                    return await nimesha.sendMessage(m.chat, { image: buffer, caption: `${emojiMap[command]} *${command.toUpperCase()}*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
                }
                await nimesha.sendMessage(m.chat, { text: `${emojiMap[command]} *${command.toUpperCase()}*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
            } catch (e) { m.reply('❌ Error: ' + e.message); }
        }
        break

        case 'its-so-stupid': case 'comrade': {
            const mentioned = m.mentionedJid?.[0] || m.sender;
            try {
                const pp = await nimesha.profilePictureUrl(mentioned, 'image').catch(() => null);
                if (pp) {
                    const fetch = require('node-fetch');
                    const res = await fetch(`https://api.paxsenix.biz.id/meme/${command}?image=${encodeURIComponent(pp)}`);
                    const buffer = await res.buffer();
                    return await nimesha.sendMessage(m.chat, { image: buffer, caption: `😆 *${command.toUpperCase()}*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
                }
                await nimesha.sendMessage(m.chat, { text: `😆 *${command.toUpperCase()}*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
            } catch (e) { m.reply('❌ Error: ' + e.message); }
        }
        break

        // ===== GAMES COMMANDS =====
        case 'slot': case 'slots': {
            const res = slotMachine();
            const u = Economy.ensureUser(m.sender);
            if (res.win) { u.coins += res.amount; await m.reply(`🎰 ${res.reels.join(' | ')}\n\n🎉 You won ${res.amount} coins!`); }
            else { u.coins = Math.max(0, u.coins - 10); await m.reply(`🎰 ${res.reels.join(' | ')}\n\n😞 Lost 10 coins`); }
        }
        break

        case 'rpg': case 'adventure': {
            if (!db.users[m.sender]) db.users[m.sender] = {};
            if (!db.users[m.sender].rpg) db.users[m.sender].rpg = new RPGAdventure(m.sender);
            const r = db.users[m.sender].rpg;
            if (args[0] === 'fight' || args[0] === 'attack') {
                if (!r.enemy) r.spawn();
                const res = r.attack();
                if (res.dead) { delete db.users[m.sender].rpg; m.reply(`💀 You died on floor ${r.floor}! Game over.`); }
                else if (res.win) { m.reply(`⚔️ Victory! +${res.gold} gold, +${res.xp} XP${res.levelup ? '\n🆙 LEVEL UP!' : ''}\n\n${r.fmt()}`); }
                else m.reply(`⚔️ You dealt ${res.dmg}, enemy dealt ${res.edmg}\nEnemy HP: ${res.ehp}\n${r.fmt()}`);
            } else if (args[0] === 'heal') { const h = r.heal(); m.reply(h === 'poor' ? 'Need 10 gold' : `❤️ Healed! HP: ${h.hp}\n${r.fmt()}`); }
            else if (args[0] === 'spawn') { r.spawn(); m.reply(`👹 ${r.enemy.name} appeared!\n${r.fmt()}`); }
            else { m.reply(r.fmt()); }
        }
        break

        case 'blackjack': case 'bj': {
            if (!db.users[m.sender]) db.users[m.sender] = {};
            if (!db.users[m.sender].blackjack) {
                db.users[m.sender].blackjack = new BlackjackCasino();
                await m.reply(`🃏 *Blackjack Started!*\n${db.users[m.sender].blackjack.status()}\n\nReply with:\n- *hit* to take a card\n- *stand* to hold`);
            } else {
                const game = db.users[m.sender].blackjack;
                if (text.toLowerCase() === 'hit') {
                    const val = game.hit();
                    if (val > 21) {
                        await m.reply(`💥 BUST! ${game.reveal()}`);
                        delete db.users[m.sender].blackjack;
                    } else {
                        await m.reply(`🃏 You drew: ${game.player.slice(-1)[0]} (Total: ${val})\n${game.status()}`);
                    }
                } else if (text.toLowerCase() === 'stand') {
                    const result = game.stand();
                    await m.reply(`${game.reveal()}\n\n${result === 'win' ? '🎉 You win!' : result === 'lose' ? '💀 Dealer wins' : '🤝 Draw'}`);
                    delete db.users[m.sender].blackjack;
                }
            }
        }
        break

        case 'connect4': case 'c4': {
            if (!m.isGroup) return m.reply('This game is only available in groups.');
            const opponent = m.mentionedJid?.[0];
            if (!opponent) return m.reply(`Mention an opponent!\nExample: ${prefix}connect4 @user`);
            if (opponent === m.sender) return m.reply('You cannot play against yourself!');
            if (opponent === botNumber) return m.reply('Bot cannot play Connect 4 yet.');
            if (!db.game.connect4) db.game.connect4 = {};
            const existing = Object.values(db.game.connect4).find(g => g.state === 'PLAYING' && [g.player1, g.player2].includes(m.sender));
            if (existing) return m.reply('You are already in an active game! Finish it first.');
            const gameId = `c4_${Date.now()}`;
            const board = Array(6).fill().map(() => Array(7).fill(0));
            const firstTurn = Math.random() < 0.5 ? 1 : 2;
            db.game.connect4[gameId] = { id: gameId, player1: m.sender, player2: opponent, turn: firstTurn, board: board, state: 'PLAYING', lastMove: Date.now() };
            const symbols = { 0: '⚪', 1: '🔴', 2: '🟡' };
            let boardStr = '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣\n';
            for (let r = 0; r < 6; r++) { for (let c = 0; c < 7; c++) { boardStr += symbols[board[r][c]]; } boardStr += '\n'; }
            boardStr += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣';
            const firstPlayer = firstTurn === 1 ? m.sender : opponent;
            await m.reply(`🎮 *Connect 4 Started!*\n🔴 @${m.sender.split('@')[0]} vs 🟡 @${opponent.split('@')[0]}\n\nFirst turn: @${firstPlayer.split('@')[0]}\n\n${boardStr}\n\nReply with column number (1-7) to drop your piece.`, { mentions: [m.sender, opponent] });
        }
        break

        // ===== ECONOMY COMMANDS =====
        case 'daily': case 'claim': {
            const res = Economy.daily(m.sender);
            if (res.success) await m.reply(`✅ Claimed ${res.amount} coins & ${res.gems} gems!\n🔥 Streak: ${res.streak}`);
            else await m.reply(`⏳ Come back in ${res.wait} hours`);
        }
        break

        case 'work': {
            const res = Economy.work(m.sender);
            if (res.success) await m.reply(`💼 You worked as ${global.db.users[m.sender].job} and earned ${res.amount} coins`);
            else await m.reply(`⏳ Wait ${res.wait} minutes`);
        }
        break

        case 'rob': {
            const target = m.mentionedJid?.[0];
            if (!target) return m.reply('Tag someone to rob');
            const res = Economy.rob(m.sender, target);
            if (res.success) await m.reply(`💰 Robbed ${res.amount} coins!`);
            else if (res.reason) await m.reply(res.reason);
            else await m.reply(`🚔 Caught! Lost ${res.penalty} coins`);
        }
        break

        case 'balance': case 'bal': case 'money': {
            const u = Economy.ensureUser(m.sender);
            await m.reply(`💰 *Balance*\n👛 Wallet: ${u.coins}\n🏦 Bank: ${u.bank}\n💎 Gems: ${u.gems}\n📊 Level: ${u.level}\n⭐ XP: ${u.xp}`);
        }
        break

        case 'deposit': case 'dep': {
            if (!args[0] || isNaN(args[0])) return m.reply(`Example: ${prefix + command} <amount>`);
            if (Economy.deposit(m.sender, parseInt(args[0]))) await m.reply('✅ Deposited');
            else await m.reply('❌ Insufficient funds');
        }
        break

        case 'withdraw': case 'with': {
            if (!args[0] || isNaN(args[0])) return m.reply(`Example: ${prefix + command} <amount>`);
            if (Economy.withdraw(m.sender, parseInt(args[0]))) await m.reply('✅ Withdrawn');
            else await m.reply('❌ Insufficient funds');
        }
        break

        case 'transfer': case 'pay': {
            if (m.mentionedJid.length < 1 || !args[1] || isNaN(args[1])) return m.reply(`Example: ${prefix + command} @user <amount>`);
            if (Economy.transfer(m.sender, m.mentionedJid[0], parseInt(args[1]))) await m.reply('💸 Transfer complete');
            else await m.reply('❌ Insufficient funds');
        }
        break

        case 'buy': {
            const shop = { 'phone': 1000, 'laptop': 5000, 'car': 50000, 'house': 200000, 'jet': 1000000 };
            if (!shop[args[0]]) return m.reply(`Shop: ${Object.entries(shop).map(([k,v]) => `${k}: ${v}🪙`).join(', ')}`);
            if (Economy.buyItem(m.sender, args[0], shop[args[0]])) await m.reply(`🛒 Bought ${args[0]}`);
            else await m.reply('❌ Broke');
        }
        break

        case 'inventory': case 'inv': {
            const u = Economy.ensureUser(m.sender);
            if (!u.inventory.length) return m.reply('Empty backpack');
            await m.reply(`🎒 *Inventory*\n${u.inventory.map(i => `• ${i.item}`).join('\n')}`);
        }
        break

        // ===== GROUP COMMANDS =====
        case 'add': {
            if (!m.isGroup) return m.reply(mess.group);
            if (!m.isAdmin) return m.reply(mess.admin);
            if (!m.isBotAdmin) return m.reply(mess.botAdmin);
            if (text || m.quoted) {
                const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
                const findJid = nimesha.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
                const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                const nmrnya = nimesha.findJidByLid(klss, store, true);
                try {
                    const res = await nimesha.groupParticipantsUpdate(m.chat, [nmrnya], 'add');
                    for (let i of (res || [])) {
                        const statusMessages = {
                            200: `Successfully added @${nmrnya.split('@')[0]} to the group!`,
                            401: 'They have blocked the bot!',
                            409: 'They are already in the group!',
                            500: 'Group is full!'
                        };
                        if (statusMessages[i.status]) {
                            await m.reply(statusMessages[i.status]);
                        } else if (i.status == 408) {
                            const invv = await nimesha.groupInviteCode(m.chat).catch(() => null);
                            await m.reply(`@${nmrnya.split('@')[0]} recently left the group!\n\nBecause of privacy, an invitation is being sent\n-> wa.me/${nmrnya.replace(/\D/g, '')}`);
                            if (invv) await nimesha.sendMessage(nmrnya, { text: `https://chat.whatsapp.com/${invv}\n\nAdmin: @${m.sender.split('@')[0]}\nInvites you to the group 🙇` }).catch(() => m.reply('❌ Failed to send invitation!'));
                        } else if (i.status == 403) {
                            try {
                                const attrs = i?.content?.content?.[0]?.attrs;
                                if (attrs?.code && attrs?.expiration) {
                                    await nimesha.sendGroupInviteV4(m.chat, nmrnya, attrs.code, attrs.expiration, m.metadata.subject, `Admin: @${m.sender.split('@')[0]}\nInvites you to the group 🙇`, null, { mentions: [m.sender] });
                                } else {
                                    const invv = await nimesha.groupInviteCode(m.chat).catch(() => null);
                                    if (invv) await nimesha.sendMessage(nmrnya, { text: `https://chat.whatsapp.com/${invv}\n\nAdmin: @${m.sender.split('@')[0]}\nInvites you to the group 🙇` }).catch(() => {});
                                }
                                await m.reply(`@${nmrnya.split('@')[0]} is a private account, cannot add directly\nInvitation sent -> wa.me/${nmrnya.replace(/\D/g, '')}`, { mentions: [nmrnya] });
                            } catch (invErr) {
                                const invv = await nimesha.groupInviteCode(m.chat).catch(() => null);
                                if (invv) await nimesha.sendMessage(nmrnya, { text: `https://chat.whatsapp.com/${invv}\n\nAdmin: @${m.sender.split('@')[0]}\nInvites you to the group 🙇` }).catch(() => {});
                                await m.reply(`@${nmrnya.split('@')[0]} is a private account, cannot add directly\nInvitation sent`, { mentions: [nmrnya] });
                            }
                        } else {
                            await m.reply('Failed to add user\nStatus: ' + i.status);
                        }
                    }
                } catch (e) {
                    console.error('[.add error]', e);
                    await m.reply('An error occurred! Failed to add user\n' + (e?.message || ''));
                }
            } else m.reply(`⚠️ *Add Command*\n\nTo add someone to the group:\n📌 With number: ${prefix + command} *94xxxxxxxxx*\n\nExample: ${prefix + command} 254712345678`);
        }
        break

        case 'kick': case 'dor': {
            if (!m.isGroup) return m.reply(mess.group);
            if (!m.isAdmin) return m.reply(mess.admin);
            if (!m.isBotAdmin) return m.reply(mess.botAdmin);
            if (text || m.quoted) {
                const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
                const findJid = nimesha.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
                const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                const nmrnya = nimesha.findJidByLid(klss, store, true);
                await nimesha.groupParticipantsUpdate(m.chat, [nmrnya], 'remove')
                    .then(() => m.reply(`╔══════════════════╗\n║  🦵 *Kicked from group* 🦵\n╠══════════════════╣\n║\n║ ✅ @${nmrnya.split('@')[0]}\n║ *Successfully removed*\n║ *from the group!*\n║\n║ 🏅 Group: ${m.metadata.subject}\n║ 👤 By: @${m.sender.split('@')[0]}\n╚══════════════════╝`, { mentions: [nmrnya, m.sender] }))
                    .catch(() => m.reply('❌ Kick failed!'));
            } else m.reply(`⚠️ *Kick Command*\n\nTo remove someone:\n📌 By reply: *(reply to their message)*\n📌 With number: ${prefix + command} *94xxxxxxxxx*\n\nExample: ${prefix + command} 254712345678`);
        }
        break

        case 'promote': {
            if (!m.isGroup) return m.reply(mess.group);
            if (!m.isAdmin) return m.reply(mess.admin);
            if (!m.isBotAdmin) return m.reply(mess.botAdmin);
            if (text || m.quoted) {
                const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
                const findJid = nimesha.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
                const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                const nmrnya = nimesha.findJidByLid(klss, store, true);
                await nimesha.groupParticipantsUpdate(m.chat, [nmrnya], 'promote')
                    .then(() => m.reply(`╔══════════════════╗\n║  👑 *Admin Promotion* 👑\n╠══════════════════╣\n║\n║ ✅ @${nmrnya.split('@')[0]}\n║ *Successfully promoted*\n║ *to Admin!*\n║\n║ 🏅 Group: ${m.metadata.subject}\n║ 👤 By: @${m.sender.split('@')[0]}\n╚══════════════════╝`, { mentions: [nmrnya, m.sender] }))
                    .catch(() => m.reply('❌ Promote failed!'));
            } else m.reply(`⚠️ *Promote Command*\n\nTo promote someone to Admin:\n📌 By reply: *(reply to their message)*\n📌 With number: ${prefix + command} *94xxxxxxxxx*\n\nExample: ${prefix + command} 254712345678`);
        }
        break

        case 'demote': {
            if (!m.isGroup) return m.reply(mess.group);
            if (!m.isAdmin) return m.reply(mess.admin);
            if (!m.isBotAdmin) return m.reply(mess.botAdmin);
            if (text || m.quoted) {
                const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
                const findJid = nimesha.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
                const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net');
                const nmrnya = nimesha.findJidByLid(klss, store, true);
                await nimesha.groupParticipantsUpdate(m.chat, [nmrnya], 'demote')
                    .then(() => m.reply(`╔══════════════════╗\n║  🚫 *Admin Demotion* 🚫\n╠══════════════════╣\n║\n║ ✅ @${nmrnya.split('@')[0]}\n║ *Successfully demoted*\n║ *from Admin!*\n║\n║ 🏅 Group: ${m.metadata.subject}\n║ 👤 By: @${m.sender.split('@')[0]}\n╚══════════════════╝`, { mentions: [nmrnya, m.sender] }))
                    .catch(() => m.reply('❌ Demote failed!'));
            } else m.reply(`⚠️ *Demote Command*\n\nTo demote an Admin:\n📌 By reply: *(reply to their message)*\n📌 With number: ${prefix + command} *94xxxxxxxxx*\n\nExample: ${prefix + command} 254712345678`);
        }
        break

        case 'tagall': {
            if (!m.isGroup) return m.reply(mess.group);
            if (!m.isAdmin) return m.reply(mess.admin);
            if (!m.isBotAdmin) return m.reply(mess.botAdmin);
            let setv = pickRandom(listv);
            let members = m.metadata.participants.map(p => {
                if (p.id && p.id.endsWith('@lid') && p.lid) {
                    const real = nimesha.findJidByLid ? nimesha.findJidByLid(p.id, store) : null;
                    return { ...p, id: (real && !real.endsWith('@lid')) ? real : (p.jid || p.id) };
                }
                return p;
            }).filter(p => p.id && !p.id.endsWith('@lid'));
            if (!members.length) members = m.metadata.participants;
            let chunkSize = 50;
            if (m.quoted) {
                const quotedType = m.quoted.type;
                const allMentions = members.map(a => a.id);
                const isMedia = /image|video|audio|document|sticker|ptt|voice/.test(quotedType);
                if (isMedia) {
                    let captionTeks = `*Tagging everyone*\n\n*Message:* ${q ? q : ''}\n\n`;
                    for (let mem of members.slice(0, 50)) {
                        captionTeks += `${setv} @${mem.id.split('@')[0]}\n`;
                    }
                    try {
                        const mediaBuffer = await m.quoted.download();
                        const mediaMime = m.quoted.msg?.mimetype || m.quoted.mimetype || 'application/octet-stream';
                        let mediaMsg = {};
                        if (/image/.test(quotedType)) mediaMsg = { image: mediaBuffer, caption: captionTeks, mentions: allMentions };
                        else if (/video/.test(quotedType)) mediaMsg = { video: mediaBuffer, caption: captionTeks, mentions: allMentions };
                        else if (/audio|ptt|voice/.test(quotedType)) {
                            await nimesha.sendMessage(m.chat, { audio: mediaBuffer, mimetype: mediaMime, ptt: /ptt|voice/.test(quotedType) }, { quoted: m });
                            mediaMsg = { text: captionTeks, mentions: allMentions };
                        } else if (/document/.test(quotedType)) {
                            await nimesha.sendMessage(m.chat, { document: mediaBuffer, mimetype: mediaMime, fileName: m.quoted.msg?.fileName || 'file' }, { quoted: m });
                            mediaMsg = { text: captionTeks, mentions: allMentions };
                        } else if (/sticker/.test(quotedType)) {
                            await nimesha.sendMessage(m.chat, { sticker: mediaBuffer }, { quoted: m });
                            if (captionTeks) await nimesha.sendMessage(m.chat, { text: captionTeks, mentions: allMentions }, { quoted: m });
                            mediaMsg = null;
                        }
                        if (mediaMsg) await nimesha.sendMessage(m.chat, mediaMsg, { quoted: m });
                    } catch(e) {
                        await nimesha.sendMessage(m.chat, { forward: m.quoted.fakeObj(), mentions: allMentions }, {});
                    }
                } else {
                    await nimesha.sendMessage(m.chat, { forward: m.quoted.fakeObj(), mentions: allMentions }, {});
                }
                for (let i = 50; i < members.length; i += chunkSize) {
                    let chunk = members.slice(i, i + chunkSize);
                    let teks = '';
                    for (let mem of chunk) teks += `${setv} @${mem.id.split('@')[0]}\n`;
                    await nimesha.sendMessage(m.chat, { text: teks, mentions: chunk.map(a => a.id) }, { quoted: m });
                    await new Promise(res => setTimeout(res, 1000));
                }
            } else {
                for (let i = 0; i < members.length; i += chunkSize) {
                    let chunk = members.slice(i, i + chunkSize);
                    let teks = i === 0 ? `*Tagging everyone*\n\n*Message:* ${q ? q : ''}\n\n` : '';
                    for (let mem of chunk) teks += `${setv} @${mem.id.split('@')[0]}\n`;
                    await nimesha.sendMessage(m.chat, { text: teks, mentions: chunk.map(a => a.id) }, { quoted: m });
                    await new Promise(res => setTimeout(res, 1000));
                }
            }
        }
        break

        case 'hidetag': case 'h': {
            if (!m.isGroup) return m.reply(mess.group);
            if (!m.isAdmin) return m.reply(mess.admin);
            if (!m.isBotAdmin) return m.reply(mess.botAdmin);
            try {
                const members = m.metadata?.participants?.map(a => a.id) || [];
                await m.reply(q ? q : '', { mentions: members });
            } catch(e) {
                console.error('[hidetag error]', e?.message);
                m.reply('❌ hidetag error: ' + e?.message);
            }
        }
        break

        case 'linkgroup': case 'linkgc': {
            if (!m.isGroup) return m.reply(mess.group);
            if (!m.isAdmin) return m.reply(mess.admin);
            if (!m.isBotAdmin) return m.reply(mess.botAdmin);
            let response = await nimesha.groupInviteCode(m.chat);
            await m.reply(`https://chat.whatsapp.com/${response}\n\nLink Group : ${(store.groupMetadata[m.chat] ? store.groupMetadata[m.chat] : (store.groupMetadata[m.chat] = await nimesha.groupMetadata(m.chat))).subject}`, { detectLink: true });
        }
        break

        case 'revoke': case 'newlink': {
            if (!m.isGroup) return m.reply(mess.group);
            if (!m.isAdmin) return m.reply(mess.admin);
            if (!m.isBotAdmin) return m.reply(mess.botAdmin);
            await nimesha.groupRevokeInvite(m.chat).then((a) => {
                m.reply(`✅ Success! Group link reset for: ${m.metadata.subject}`);
            }).catch((err) => m.reply('Failed!'));
        }
        break

        case 'setname': case 'setnamegc': {
            if (!m.isGroup) return m.reply(mess.group);
            if (!m.isAdmin) return m.reply(mess.admin);
            if (!m.isBotAdmin) return m.reply(mess.botAdmin);
            if (text || m.quoted) {
                const teksnya = text ? text : m.quoted.text;
                await nimesha.groupUpdateSubject(m.chat, teksnya).catch((err) => m.reply('Failed!'));
            } else m.reply(`⚠️ *Setname Command*\n\nTo change the group name:\n📌 ${prefix + command} *New Name*\n\nExample: ${prefix + command} Maureonix Group`);
        }
        break

        case 'setdesc': case 'setdescgc': {
            if (!m.isGroup) return m.reply(mess.group);
            if (!m.isAdmin) return m.reply(mess.admin);
            if (!m.isBotAdmin) return m.reply(mess.botAdmin);
            if (text || m.quoted) {
                const teksnya = text ? text : m.quoted.text;
                await nimesha.groupUpdateDescription(m.chat, teksnya).catch((err) => m.reply('Failed!'));
            } else m.reply(`⚠️ *Setdesc Command*\n\nTo change the group description:\n📌 ${prefix + command} *Description*\n\nExample: ${prefix + command} Welcome everyone!`);
        }
        break

        case 'setppgc': case 'setppgroups': {
            if (!m.isGroup) return m.reply(mess.group);
            if (!m.isAdmin) return m.reply(mess.admin);
            if (!m.isBotAdmin) return m.reply(mess.botAdmin);
            if (!m.quoted) return m.reply('Reply to an image for the group profile picture');
            if (!/image/.test(m.quoted?.type)) return m.reply(`📌 Reply to an image (caption: *${prefix + command}*)`);
            let media = await m.quoted.download();
            let { img } = await generateProfilePicture(media, text.length > 0 ? null : 512);
            await nimesha.query({
                tag: 'iq',
                attrs: {
                    target: m.chat,
                    to: '@s.whatsapp.net',
                    type: 'set',
                    xmlns: 'w:profile:picture'
                },
                content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }]
            });
            m.reply('Success');
        }
        break

        case 'delete': case 'del': case 'd': {
            if (!m.quoted) return m.reply('Reply to the message you want to delete');
            await nimesha.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: m.isBotAdmin ? false : true, id: m.quoted.id, participant: m.quoted.sender }});
        }
        break

        case 'pin': case 'unpin': {
            if (!m.isGroup) return m.reply(mess.group);
            if (!m.isAdmin) return m.reply(mess.admin);
            if (!m.isBotAdmin) return m.reply(mess.botAdmin);
            await nimesha.sendMessage(m.chat, { pin: { type: command == 'pin' ? 1 : 0, time: 2592000, key: m.quoted ? m.quoted.key : m.key }});
        }
        break

        // ===== OWNER COMMANDS =====
        case 'shutdown': case 'off': {
            if (!isCreator) return m.reply(mess.owner);
            m.reply(`⚠️ *Shutdown disabled* — bot session protection is active.`);
        }
        break

        case 'block': case 'blokir': {
            if (!isCreator) return m.reply(mess.owner);
            let _blockJid = null;
            if (m.quoted?.sender) _blockJid = m.quoted.sender;
            else if (m.mentionedJid?.[0]) _blockJid = m.mentionedJid[0];
            else if (text) _blockJid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            else if (!m.isGroup) _blockJid = m.chat;
            if (_blockJid) {
                await nimesha.updateBlockStatus(_blockJid, 'block');
                m.reply(`✅ Blocked ${_blockJid.replace('@s.whatsapp.net', '')}`);
            } else m.reply(`Reply, tag, or provide a number.`);
        }
        break

        case 'unblock': case 'unblokir': {
            if (!isCreator) return m.reply(mess.owner);
            let _unblockJid = null;
            if (m.quoted?.sender) _unblockJid = m.quoted.sender;
            else if (m.mentionedJid?.[0]) _unblockJid = m.mentionedJid[0];
            else if (text) _unblockJid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            else if (!m.isGroup) _unblockJid = m.chat;
            if (_unblockJid) {
                await nimesha.updateBlockStatus(_unblockJid, 'unblock');
                m.reply(`✅ Unblocked ${_unblockJid.replace('@s.whatsapp.net', '')}`);
            } else m.reply(`Reply, tag, or provide a number.`);
        }
        break

        case 'join': {
            if (!isCreator) return m.reply(mess.owner);
            if (!text) return m.reply('Enter the group link!');
            const result = args[0].match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
            if (!result) return m.reply('Invalid link❗');
            await nimesha.groupAcceptInvite(result[1]);
            m.reply('Joined!');
        }
        break

        case 'leave': {
            if (!isCreator) return m.reply(mess.owner);
            await nimesha.groupLeave(m.chat);
            m.reply('Left the group.');
        }
        break

        case 'clearchat': {
            if (!isCreator) return m.reply(mess.owner);
            const statusMsg = await m.reply('🗑️ *Clearing chat...*');
            let deletedCount = 0;
            try {
                const storedMsgs = global.store?.messages?.[m.chat]?.array || [];
                const chunks = [];
                for (let i = 0; i < storedMsgs.length; i += 10) chunks.push(storedMsgs.slice(i, i + 10));
                for (const chunk of chunks) {
                    await Promise.all(chunk.map(async (msg) => {
                        try {
                            await nimesha.sendMessage(m.chat, { delete: msg.key });
                            deletedCount++;
                        } catch {}
                    }));
                    await sleep(200);
                }
                await nimesha.sendMessage(m.chat, { text: `✅ *Cleared ${deletedCount} messages*`, edit: statusMsg.key });
            } catch {
                m.reply('❌ Failed to clear chat');
            }
        }
        break

        case 'backup': {
            if (!isCreator) return m.reply(mess.owner);
            switch (args[0]) {
                case 'database':
                let tglnya = new Date().toISOString().replace(/[:.]/g, '-');
                let datanya = './database/' + tempatDB;
                if (tempatDB.startsWith('mongodb')) {
                    datanya = './database/backup_database.json';
                    fs.writeFileSync(datanya, JSON.stringify(global.db, null, 2), 'utf-8');
                }
                await m.reply({
                    document: fs.readFileSync(datanya),
                    mimetype: 'application/json',
                    fileName: tglnya + '_database.json'
                });
                break;
                default: m.reply('Use: backup database');
            }
        }
        break

        case 'setppbot': {
            if (!isCreator) return m.reply(mess.owner);
            if (!/image/.test(m.quoted?.type)) return m.reply(`📌 Reply to an image (caption: *${prefix + command}*)`);
            let media = await m.quoted.download();
            let { img } = await generateProfilePicture(media);
            await nimesha.query({
                tag: 'iq',
                attrs: {
                    to: '@s.whatsapp.net',
                    type: 'set',
                    xmlns: 'w:profile:picture'
                },
                content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }]
            });
            m.reply('✅ Profile picture updated');
        }
        break

        case 'delppbot': {
            if (!isCreator) return m.reply(mess.owner);
            await nimesha.removeProfilePicture(nimesha.user.id);
            m.reply('✅ Profile picture removed');
        }
        break

        // ===== MENU COMMANDS =====
        case 'menu': case 'help': case 'allmenu': {
            try {
                // Carousel attempt (may fail if sendCarouselMsg not available)
                const carouselCards = [
                    { url: './database/menucards/bot.png', body: `🤖 *BOT*\n\n▸ ${prefix}alive\n▸ ${prefix}ping\n▸ ${prefix}info\n▸ ${prefix}owner\n▸ ${prefix}runtime\n▸ ${prefix}speed\n▸ ${prefix}profile\n▸ ${prefix}leaderboard\n▸ ${prefix}totalpesan\n▸ ${prefix}sc\n▸ ${prefix}donasi`, footer: 'Bot utilities & info', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🤖 Bot Menu', id: `${prefix}botmenu` }) }] },
                    { url: './database/menucards/group.png', body: `👥 *GROUP*\n\n▸ ${prefix}add\n▸ ${prefix}kick\n▸ ${prefix}promote\n▸ ${prefix}demote\n▸ ${prefix}tagall\n▸ ${prefix}hidetag\n▸ ${prefix}setname\n▸ ${prefix}setdesc\n▸ ${prefix}linkgroup\n▸ ${prefix}revoke`, footer: 'Manage your group', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👥 Group Menu', id: `${prefix}groupmenu` }) }] },
                    { url: './database/menucards/download.png', body: `⬇️ *DOWNLOAD*\n\n▸ ${prefix}song\n▸ ${prefix}video\n▸ ${prefix}tiktok\n▸ ${prefix}instagram\n▸ ${prefix}facebook\n▸ ${prefix}twitter\n▸ ${prefix}spotify\n▸ ${prefix}mediafire\n▸ ${prefix}apk`, footer: 'Download from 20+ platforms', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⬇️ Download Menu', id: `${prefix}downloadmenu` }) }] },
                    { url: './database/menucards/ai.png', body: `🧠 *AI*\n\n▸ ${prefix}gpt\n▸ ${prefix}gemini\n▸ ${prefix}llama\n▸ ${prefix}deepseek\n▸ ${prefix}ai\n▸ ${prefix}imagine\n▸ ${prefix}translate\n▸ ${prefix}tts\n▸ ${prefix}summarize\n▸ ${prefix}code`, footer: 'Chat with advanced AI', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🧠 AI Menu', id: `${prefix}aimenu` }) }] },
                    { url: './database/menucards/sticker.png', body: `🎨 *STICKER*\n\n▸ ${prefix}sticker\n▸ ${prefix}s\n▸ ${prefix}simage\n▸ ${prefix}toimg\n▸ ${prefix}attp\n▸ ${prefix}removebg\n▸ ${prefix}blur\n▸ ${prefix}qc\n▸ ${prefix}brat\n▸ ${prefix}smeme`, footer: 'Create and edit stickers', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎨 Sticker Menu', id: `${prefix}stickermenu` }) }] },
                    { url: './database/menucards/games.png', body: `🎮 *GAMES*\n\n▸ ${prefix}connect4 @user\n▸ ${prefix}suit @user\n▸ ${prefix}slot\n▸ ${prefix}blackjack\n▸ ${prefix}rpg\n▸ ${prefix}math\n▸ ${prefix}tebaklagu`, footer: 'Multiplayer & solo games', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎮 Games Menu', id: `${prefix}gamemenu` }) }] },
                    { url: './database/menucards/fun.png', body: `😂 *FUN*\n\n▸ ${prefix}joke\n▸ ${prefix}meme\n▸ ${prefix}quote\n▸ ${prefix}fact\n▸ ${prefix}8ball\n▸ ${prefix}roast\n▸ ${prefix}compliment\n▸ ${prefix}ship\n▸ ${prefix}truth\n▸ ${prefix}dare`, footer: 'Entertainment & random fun', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '😂 Fun Menu', id: `${prefix}funmenu` }) }] },
                    { url: './database/menucards/search.png', body: `🔍 *SEARCH*\n\n▸ ${prefix}google\n▸ ${prefix}wiki\n▸ ${prefix}urban\n▸ ${prefix}weather\n▸ ${prefix}news\n▸ ${prefix}anime\n▸ ${prefix}manga\n▸ ${prefix}github\n▸ ${prefix}npm\n▸ ${prefix}iplookup`, footer: 'Search the web instantly', buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔍 Search Menu', id: `${prefix}searchmenu` }) }] }
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
                await nimesha.sendCarouselMsg(m.chat, carouselBody, `© Maureonix | ${prefix}help <cmd> for details`, carouselCards, { quoted: m });
            } catch (e) {
                console.error('[carousel error]', e);
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
                    const textMenu = `*🦊 Maureonix Menu*\n\n` +
                        `🤖 *Bot:* ${prefix}ping, ${prefix}alive, ${prefix}owner, ${prefix}profile, ${prefix}leaderboard, ${prefix}sc, ${prefix}donasi\n` +
                        `👥 *Group:* ${prefix}add, ${prefix}kick, ${prefix}promote, ${prefix}demote, ${prefix}tagall, ${prefix}hidetag, ${prefix}linkgroup, ${prefix}revoke, ${prefix}setname, ${prefix}setdesc, ${prefix}setppgc\n` +
                        `⬇️ *Download:* ${prefix}song, ${prefix}video, ${prefix}tiktok, ${prefix}instagram, ${prefix}facebook, ${prefix}twitter, ${prefix}spotify, ${prefix}mediafire, ${prefix}apk\n` +
                        `🧠 *AI:* ${prefix}gpt, ${prefix}gemini, ${prefix}llama, ${prefix}deepseek, ${prefix}ai, ${prefix}imagine, ${prefix}translate, ${prefix}tts, ${prefix}summarize, ${prefix}code, ${prefix}brainrot\n` +
                        `🎨 *Sticker:* ${prefix}sticker, ${prefix}simage, ${prefix}attp, ${prefix}removebg, ${prefix}blur, ${prefix}qc, ${prefix}brat, ${prefix}smeme\n` +
                        `🔍 *Search:* ${prefix}google, ${prefix}wiki, ${prefix}urban, ${prefix}weather, ${prefix}news, ${prefix}anime, ${prefix}manga, ${prefix}github, ${prefix}npm, ${prefix}iplookup\n` +
                        `🎮 *Games:* ${prefix}connect4, ${prefix}suit, ${prefix}slot, ${prefix}blackjack, ${prefix}rpg, ${prefix}math, ${prefix}tebaklagu\n` +
                        `😂 *Fun:* ${prefix}joke, ${prefix}meme, ${prefix}quote, ${prefix}fact, ${prefix}8ball, ${prefix}roast, ${prefix}compliment, ${prefix}ship, ${prefix}truth, ${prefix}dare\n` +
                        `💰 *Economy:* ${prefix}daily, ${prefix}work, ${prefix}rob, ${prefix}balance, ${prefix}deposit, ${prefix}withdraw, ${prefix}transfer, ${prefix}buy, ${prefix}inventory\n` +
                        `👑 *Owner:* ${prefix}block, ${prefix}unblock, ${prefix}join, ${prefix}leave, ${prefix}backup, ${prefix}setppbot, ${prefix}delppbot\n` +
                        `\nType ${prefix}help <category> for more.`;
                    await m.reply(textMenu);
                }
            }
        }
        break

        // ===== SUB-MENU HANDLERS =====
        case 'botmenu': {
            const botMenuText = `╔══════════════════════╗
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
            await m.reply(botMenuText);
        }
        break

        case 'groupmenu': {
            const groupMenuText = `╔══════════════════════╗
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
            await m.reply(groupMenuText);
        }
        break

        case 'downloadmenu': {
            const downloadMenuText = `╔══════════════════════╗
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
            await m.reply(downloadMenuText);
        }
        break

        case 'aimenu': {
            const aiMenuText = `╔══════════════════════╗
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
            await m.reply(aiMenuText);
        }
        break

        case 'gamemenu': {
            const gameMenuText = `╔══════════════════════╗
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
            await m.reply(gameMenuText);
        }
        break

        case 'funmenu': {
            const funMenuText = `╔══════════════════════╗
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
            await m.reply(funMenuText);
        }
        break

        case 'stickermenu': {
            const stickerMenuText = `╔══════════════════════╗
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
            await m.reply(stickerMenuText);
        }
        break

        case 'searchmenu': {
            const searchMenuText = `╔══════════════════════╗
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
            await m.reply(searchMenuText);
        }
        break

        case 'economymenu': {
            const economyMenuText = `╔══════════════════════╗
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
            await m.reply(economyMenuText);
        }
        break

        case 'ownermenu': {
            const ownerMenuText = `╔══════════════════════╗
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
            await m.reply(ownerMenuText);
        }
        break

        case 'stats': {
            const statsText = `📊 *Bot Statistics*

▸ *Uptime:* ${runtime(process.uptime())}
▸ *Commands Run:* ${db.hit?.totalcmd || 0}
▸ *Users:* ${Object.keys(db.users).length}
▸ *Groups:* ${Object.keys(db.groups).length}

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
            await m.reply(statsText);
        }
        break

        // ===== SPORTS SUB-MENU =====
        case 'sportsmenu': {
            const sportsMenuText = `╔══════════════════════╗
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
            await m.reply(sportsMenuText);
        }
        break

        // ===== CASINO SUB-MENU =====
        case 'casinomenu': {
            const casinoMenuText = `╔══════════════════════╗
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
            await m.reply(casinoMenuText);
        }
        break

        // ===== RPG SUB-MENU =====
        case 'rpgmenu': {
            const rpgMenuText = `╔══════════════════════╗
║  *🧙 RPG ADVENTURE*  ║
╚══════════════════════╝

📌 *Commands*
▸ ${prefix}rpg – View your stats
▸ ${prefix}rpg fight – Attack current enemy
▸ ${prefix}rpg heal – Heal 40 HP (costs 10 gold)
▸ ${prefix}rpg spawn – Summon a new enemy

━━━━━━━━━━━━━━━━━━━━━━
> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
            await m.reply(rpgMenuText);
        }
        break

        // ===== MASTER SUB-MENUS =====
        case 'mastermenu': {
            const masterMenuText = `╔══════════════════════╗
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
            await m.reply(masterMenuText);
        }
        break

        // fallback for unknown commands (media hash commands)
        default:
            if (budy.startsWith('>')) {
                if (!isCreator) return;
                try {
                    let evaled = await eval(budy.slice(2));
                    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                    await m.reply(evaled);
                } catch (err) { await m.reply(String(err)); }
            }
            if (budy.startsWith('<')) {
                if (!isCreator) return;
                try {
                    let evaled = await eval(`(async () => { ${budy.slice(2)} })()`);
                    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                    await m.reply(evaled);
                } catch (err) { await m.reply(String(err)); }
            }
            if (budy.startsWith('$')) {
                if (!isCreator) return;
                if (!text) return;
                exec(budy.slice(2), (err, stdout) => {
                    if (err) return m.reply(`${err}`);
                    if (stdout) return m.reply(stdout);
                });
            }
            if ((!isCmd || isCreator) && budy && typeof budy === 'string' && budy.toLowerCase() !== undefined) {
                if (m.chat.endsWith('broadcast')) return;
                if (!global.db || !global.db.database) return;
                if (!(budy.toLowerCase() in global.db.database)) return;
                await nimesha.relayMessage(m.chat, global.db.database[budy.toLowerCase()], {});
            }
    } // ← closes the switch statement
}   // ← closes the module.exports function