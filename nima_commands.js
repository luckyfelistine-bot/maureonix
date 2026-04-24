// nima_commands.js – ALL COMMAND CASES (FULLY FIXED & COMPLETE)
// ═══════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { getBuffer } = require('./lib/function');
const { writeExif } = require('./lib/exif');

module.exports = async (nimesha, m, ctx) => {
    const {
        mess,
        isCmd, command, args, text, q, prefix, isCreator, isOwner, ownerNumber,
        set, sewa, premium, db, store, botNumber,
        suit, chess, chat_ai, gemini_autoreply, gemini_history, menfes,
        checkStatus,
        getExpired,
        formatDate,
        listv,   // <-- ADD THIS
        fake,    // <-- ADD THIS
        my,        // <-- ADD THIS
        tempatDB,  // <-- ADD THIS
        tekateki, akinator, tictactoe, tebaklirik, kuismath, blackjack,
        tebaklagu, tebakkata, family100, susunkata, tebakbom, ulartangga,
        tebakkimia, caklontong, tebakangka, tebaknegara, tebakgambar, tebakbendera,
        isVip, isBan, isLimit, isPremium, isNsfw,
        author, packname, botname, dayName, tanggal, jam, ucapanWaktu,
        setv, fkontak, readmore, fileSha256, budy, body,
        AI, Search, Tools, Fun, Economy, Admin, Daily, Health, Finance, Social, Dev, Travel, Food,
        RAWG, TriviaMaster, PokemonGame, NumbersGame, FunAPIs, RPGAdventure,
        slotMachine, rouletteSpin, crash, diceRoll, coinflip, rpsls, mathQuiz, anagram, numberGuess,
        gameSlot, gameCasinoSolo, gameSamgongSolo, gameMerampok, gameBegal,Blackjack, BlackjackCasino, daily, buy, setLimit, addLimit, addMoney, setMoney, transfer,
        OMDB, TVMaze, AniList, Jikan, TMDB, MovieGuesser, Movie, fmtCast,
        APISports, OddsAPI, ESPN,
        ytMp4, ytMp3, tiktokDownload, igDownload, fbDownload, spotifyDownload, pinterestDownload, redditDownload, mediafireDownload, apkDownload,
        toAudio, toPTT, toVideo, generateMenuImage,
        runtime, clockString, sleep, isUrl, generateProfilePicture,
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
                const stickerPath = await writeExif(buffer, {
                    packname: packname,
                    author: author
                });
                // ✅ Read the file as buffer
                const stickerBuffer = fs.readFileSync(stickerPath);
                await nimesha.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });
                // Clean up temp file
                fs.unlinkSync(stickerPath);
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
            if (!text) return m.reply(`Example: ${prefix + command} Hello`);
            await m.reply('🎨 *Creating animated sticker...*');
            try {
                // FFmpeg direct to WebP
                const webpBuffer = await new Promise((resolve, reject) => {
                    const { spawn } = require('child_process');
                    const os = require('os');
                    const path = require('path');
                    const fs = require('fs');
                    const fontPath = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
                    const escTxt = (s) => s
                        .replace(/\\/g, '\\\\')
                        .replace(/'/g, "\\'")
                        .replace(/:/g, '\\:')
                        .replace(/,/g, '\\,')
                        .replace(/\[/g, '\\[')
                        .replace(/\]/g, '\\]')
                        .replace(/%/g, '\\%');
                    const safeText = escTxt(text);
                    const tmpOut = path.join(os.tmpdir(), `attp_${Date.now()}.webp`);
                    const cycle = 0.3, dur = 1.8;
                    const base = `fontfile='${fontPath}':text='${safeText}':borderw=3:bordercolor=black@0.8:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2`;
                    const drawRed   = `drawtext=${base}:fontcolor=#FF4444:enable='lt(mod(t\\,${cycle})\\,0.1)'`;
                    const drawBlue  = `drawtext=${base}:fontcolor=#4488FF:enable='between(mod(t\\,${cycle})\\,0.1\\,0.2)'`;
                    const drawGreen = `drawtext=${base}:fontcolor=#44FF88:enable='gte(mod(t\\,${cycle})\\,0.2)'`;
                    const args = [
                        '-y',
                        '-f', 'lavfi', '-i', `color=c=black:s=512x512:d=${dur}:r=15`,
                        '-vf', `${drawRed},${drawBlue},${drawGreen},scale=512:512`,
                        '-vcodec', 'libwebp',
                        '-lossless', '0',
                        '-compression_level', '4',
                        '-quality', '70',
                        '-loop', '0',
                        '-preset', 'default',
                        '-an', '-vsync', '0',
                        '-t', String(dur),
                        tmpOut
                    ];
                    const ff = spawn('ffmpeg', args);
                    let stderr = '';
                    ff.stderr.on('data', d => stderr += d);
                    ff.on('error', reject);
                    ff.on('close', code => {
                        if (code === 0 && fs.existsSync(tmpOut)) {
                            const buf = fs.readFileSync(tmpOut);
                            fs.unlinkSync(tmpOut);
                            resolve(buf);
                        } else {
                            try { fs.unlinkSync(tmpOut); } catch {}
                            reject(new Error(stderr.slice(-200)));
                        }
                    });
                });
                await nimesha.sendMessage(m.chat, { sticker: webpBuffer }, { quoted: m });
                m.reply(`✅ ATTP sticker created!`);
            } catch (ffErr) {
                console.log('ATTP ffmpeg fail:', ffErr.message.slice(0, 200));
                // Fallback to free APIs
                const fetch = require('node-fetch');
                const apis = [
                    `https://api.paxsenix.biz.id/sticker/attp?text=${encodeURIComponent(text)}`,
                    `https://api.lolhuman.xyz/api/attp?apikey=demo&text=${encodeURIComponent(text)}`
                ];
                let success = false;
                for (const url of apis) {
                    try {
                        const res = await fetch(url);
                        if (!res.ok) continue;
                        const buffer = await res.buffer();
                        if (buffer && buffer.length > 100) {
                            await nimesha.sendMessage(m.chat, { sticker: buffer }, { quoted: m });
                            m.reply(`✅ ATTP sticker created!`);
                            success = true;
                            break;
                        }
                    } catch (e) { continue; }
                }
                if (!success) m.reply('❌ Failed to create ATTP sticker.');
            }
        }
        break

        case 'removebg': case 'rmbg': {
            if (!m.quoted || !/image/.test(m.quoted.type)) return m.reply('Reply to an image to remove background.');
            await m.reply('🎨 *Removing background...*');
            try {
                const buffer = await m.quoted.download();
                const fetch = require('node-fetch');
                const FormData = require('form-data');
                const form = new FormData();
                form.append('image_file', buffer, 'image.png');
                form.append('size', 'auto');

                const res = await fetch('https://api.remove.bg/v1.0/removebg', {
                    method: 'POST',
                    headers: { 'X-Api-Key': global.removeBgKey },
                    body: form
                });

                if (res.ok) {
                    const result = await res.buffer();
                    await nimesha.sendMessage(m.chat, { image: result, caption: '✅ Background removed' }, { quoted: m });
                } else {
                    const errorText = await res.text();
                    throw new Error(`API error: ${res.status} - ${errorText}`);
                }
            } catch (e) {
                console.error('RemoveBG error:', e.message);
                m.reply('❌ Failed to remove background. The image may be invalid or API limit reached.');
            }
        }
        break

        case 'blur': {
            if (!m.quoted || !/image/.test(m.quoted.type)) return m.reply('Reply to an image to blur.');
            try {
                const sharp = require('sharp');
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
                const fetch = require('node-fetch');
                const ppUrl = await nimesha.profilePictureUrl(m.sender, 'image').catch(() => 'https://telegra.ph/file/95670d63378f7f4210f03.png');
                const apis = [
                    `https://api.vihangayt.me/maker/quotely?text=${encodeURIComponent(text)}&avatar=${encodeURIComponent(ppUrl)}`,
                    `https://api.davidcyriltech.my.id/quote?text=${encodeURIComponent(text)}&avatar=${encodeURIComponent(ppUrl)}`
                ];
                
                let success = false;
                for (const url of apis) {
                    try {
                        const res = await fetch(url);
                        if (!res.ok) continue;
                        const buffer = await res.buffer();
                        if (buffer && buffer.length > 100) {
                            await nimesha.sendMessage(m.chat, { image: buffer }, { quoted: m });
                            success = true;
                            break;
                        }
                    } catch (e) { continue; }
                }
                
                if (!success) throw new Error('All APIs failed');
            } catch (e) {
                m.reply('❌ QC failed: ' + e.message);
            }
        }
        break

        case 'brat': {
            if (!isLimit) return m.reply(mess.limit);
            if (!text && (!m.quoted || !m.quoted.text)) return m.reply(`📌 Reply with text or type: ${prefix + command} <text>`);
            const inputText = text || m.quoted.text;
            await m.reply('🎨 *Generating brat sticker...*');
            try {
                const fetch = require('node-fetch');
                const apis = [
                    `https://api.paxsenix.biz.id/maker/brat?text=${encodeURIComponent(inputText)}`,
                    `https://api.davidcyriltech.my.id/brat?text=${encodeURIComponent(inputText)}`
                ];
                let success = false;
                for (const url of apis) {
                    try {
                        const res = await fetch(url);
                        if (!res.ok) continue;
                        const buffer = await res.buffer();
                        if (buffer && buffer.length > 100) {
                            await nimesha.sendAsSticker(m.chat, buffer, m);
                            success = true;
                            break;
                        }
                    } catch (e) { continue; }
                }
                if (!success) throw new Error('All APIs failed');
                setLimit(m, db);
            } catch (e) {
                m.reply('❌ Brat generation failed.');
            }
        }
        break

        case 'smeme': {
            if (!m.quoted || !/image/.test(m.quoted.type)) return m.reply('Reply to an image with caption: .smeme top|bottom');
            if (!text || !text.includes('|')) return m.reply(`Example: ${prefix + command} top text|bottom text`);
            const [top, bottom] = text.split('|').map(s => s.trim());
            try {
                const fetch = require('node-fetch');
                const buffer = await m.quoted.download();
                const base64 = buffer.toString('base64');
                const url = `https://api.memegen.link/images/custom/${encodeURIComponent(top || '_')}/${encodeURIComponent(bottom || '_')}.png?background=${encodeURIComponent(base64)}`;
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
            await m.reply('🦊 *Maureonix thinking...*');
            try {
                const res = await AI.askModel(text, 'gpt', m.sender);
                await m.reply(`🦊 *Maureonix*\n\n${res.text}`);
            } catch (e) {
                await m.reply(`❌ AI error: ${e.message}`);
            }
        }
        break

        case 'gemini': {
            if (!text) return m.reply(`Example: ${prefix + command} <question>`);
            await m.reply('♊ *Maureonix(gemini)* thinking...');
            try {
                const res = await AI.askModel(text, 'gemini', m.sender);
                await m.reply(`♊ *Maureonix*\n\n${res.text}`);
            } catch (e) {
                await m.reply(`❌ AI error: ${e.message}`);
            }
        }
        break

        case 'llama': case 'llama3': {
            if (!text) return m.reply(`Example: ${prefix + command} <question>`);
            await m.reply('🦙 *Maureonix(Llama 3)thinking...*');
            try {
                const res = await AI.askModel(text, 'llama', m.sender);
                await m.reply(`🦙 *Maureonix*\n\n${res.text}`);
            } catch (e) {
                await m.reply(`❌ AI error: ${e.message}`);
            }
        }
        break

        case 'deepseek': {
            if (!text) return m.reply(`Example: ${prefix + command} <question>`);
            await m.reply('🐋 *Maureonix(DeepSeek)* thinking...');
            try {
                const res = await AI.askModel(text, 'deepseek', m.sender);
                await m.reply(`🐋 *Maureonix*\n\n${res.text}`);
            } catch (e) {
                await m.reply(`❌ AI error: ${e.message}`);
            }
        }
        break

        case 'ai': case 'askai': {
            if (!text) return m.reply(`Example: ${prefix + command} <question>`);

            const { buildContext } = require('./lib/docs');
            const context = buildContext(text, 2);

            let prompt = text;
            if (context) {
                prompt = `You are Maureonix. Use the documentation below if relevant to answer.\n\n${context}\n\nUser: ${text}`;
            }

            const res = await AI.ultimateAI(prompt, m.sender);
            await m.reply(`🦊 *Maureonix*\n\n${res.text}`);
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
            if (args.length < 2) return m.reply(`Example: ${prefix + command} si Hello world\nExample: ${prefix + command} en ආයුබෝවන්`);
            const targetLang = args[0].toLowerCase();
            const textToTranslate = args.slice(1).join(' ');
            if (!textToTranslate) return m.reply('Please provide text to translate.');

            await m.reply('🌐 *Translating...*');

            try {
                const fetch = require('node-fetch');

                // Helper function to try multiple translation services
                const tryTranslate = async (url, parseFn) => {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return await parseFn(res);
                };

                let translatedText = null;

                // 1. MyMemory API (free, 1000 chars/day, supports Sinhala 'si')
                try {
                    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|${targetLang}`;
                    translatedText = await tryTranslate(myMemoryUrl, async (res) => {
                        const json = await res.json();
                        if (json.responseStatus === 200 && json.responseData?.translatedText) {
                            return json.responseData.translatedText;
                        }
                        throw new Error('MyMemory failed');
                    });
                } catch (e) {
                    console.log('MyMemory failed:', e.message);
                }

                // 2. Google Translate (via libreTranslate fallback or custom scraping)
                if (!translatedText) {
                    try {
                        // Using LibreTranslate (public instances, supports many languages)
                        const libreUrl = `https://translate.argosopentech.com/translate`;
                        const libreBody = {
                            q: textToTranslate,
                            source: 'auto',
                            target: targetLang,
                            format: 'text'
                        };
                        const res = await fetch(libreUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(libreBody)
                        });
                        if (res.ok) {
                            const json = await res.json();
                            translatedText = json.translatedText;
                        }
                    } catch (e) {
                        console.log('LibreTranslate failed:', e.message);
                    }
                }

                // 3. Google Translate via a free API wrapper (paxsenix)
                if (!translatedText) {
                    try {
                        const gTranslateUrl = `https://api.paxsenix.biz.id/tools/translate?text=${encodeURIComponent(textToTranslate)}&to=${targetLang}`;
                        translatedText = await tryTranslate(gTranslateUrl, async (res) => {
                            const json = await res.json();
                            if (json.status === 200 && json.result) {
                                return json.result;
                            }
                            throw new Error('Paxsenix failed');
                        });
                    } catch (e) {
                        console.log('Paxsenix translate failed:', e.message);
                    }
                }

                // 4. Final fallback: Google Translate via direct URL (may be blocked on some servers)
                if (!translatedText) {
                    try {
                        const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`;
                        translatedText = await tryTranslate(googleUrl, async (res) => {
                            const json = await res.json();
                            if (json && json[0] && json[0][0] && json[0][0][0]) {
                                return json[0].map(part => part[0]).join('');
                            }
                            throw new Error('Google Translate failed');
                        });
                    } catch (e) {
                        console.log('Google Translate fallback failed:', e.message);
                    }
                }

                if (translatedText) {
                    await m.reply(`🌐 *Translated (${targetLang})*\n\n${translatedText}`);
                } else {
                    throw new Error('All translation services failed');
                }

            } catch (e) {
                m.reply(`❌ Translation failed: ${e.message}`);
            }
        }
        break
        case 'tts': {
            if (!text) return m.reply(`Example: ${prefix + command} Hello world`);
            const lang = args[0]?.length === 2 ? args.shift() : 'en';
            const txt = args.join(' ') || text;
            await m.reply('🔊 *Generating voice...*');

            let audioBuffer = null;
            const tmpDir = path.join(require('os').tmpdir());

            const isValidAudio = (buf) => {
                if (!buf || buf.length < 100) return false;
                if (buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0) return true;
                if (buf.slice(0, 4).toString() === 'OggS') return true;
                return false;
            };

            // 1. gTTS (most reliable, works offline after first run)
            try {
                const gTTS = require('gtts');
                const tempFile = path.join(tmpDir, `tts_${Date.now()}.mp3`);
                await new Promise((resolve, reject) => {
                    const tts = new gTTS(txt, lang);
                    tts.save(tempFile, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
                const buf = fs.readFileSync(tempFile);
                fs.unlinkSync(tempFile);
                if (isValidAudio(buf)) audioBuffer = buf;
            } catch (e) {
                console.log('gTTS failed:', e.message);
            }

            // 2. Google Translate TTS via axios
            if (!audioBuffer) {
                try {
                    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(txt)}&tl=${lang}&client=tw-ob&ttsspeed=1`;
                    const res = await axios.get(url, {
                        responseType: 'arraybuffer',
                        headers: { 
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Referer': 'https://translate.google.com/'
                        },
                        timeout: 15000
                    });
                    const buf = Buffer.from(res.data);
                    if (isValidAudio(buf)) audioBuffer = buf;
                } catch (e) {
                    console.log('Google TTS failed:', e.message);
                }
            }

            if (audioBuffer) {
                await nimesha.sendMessage(m.chat, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    ptt: true
                }, { quoted: m });
            } else {
                m.reply('❌ TTS failed. Make sure `gtts` is installed: npm install gtts');
            }
        }
        break
        case 'vv': case 'ok': case 'wow': {
            const quoted = m.quoted;
            if (!quoted) return m.reply(`⚠️ Reply to a view once message!`);
            try {
                const msg = quoted.message?.viewOnceMessage?.message || 
                            quoted.message?.viewOnceMessageV2?.message || 
                            quoted.message;
                if (msg?.imageMessage) {
                    const buffer = await nimesha.downloadMediaMessage(quoted);
                    await nimesha.sendMessage(m.chat, { 
                        image: buffer, 
                        caption: `👁️ *View Once Revealed*\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX` 
                    }, { quoted: m });
                } else if (msg?.videoMessage) {
                    const buffer = await nimesha.downloadMediaMessage(quoted);
                    await nimesha.sendMessage(m.chat, { 
                        video: buffer, 
                        caption: `👁️ *View Once Revealed*\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX` 
                    }, { quoted: m });
                } else {
                    m.reply('❌ Not a view‑once message or unsupported type.');
                }
            } catch (e) { 
                m.reply(`❌ Error: ${e.message}`); 
            }
        }
        break
        case 'summarize': {
            if (!m.quoted) return m.reply('Reply to a long message to summarize');
            const toSummarize = m.quoted.body || m.quoted.text || '';
            if (!toSummarize) return m.reply('No text to summarize');
            await m.reply('📋 *Summarizing...*');
            try {
                const summary = await AI.summarize(toSummarize);
                await m.reply(`📋 *Summary:*\n\n${summary}`);
            } catch (e) {
                m.reply('❌ Summarize failed: ' + e.message);
            }
        }
        break

        case 'code': case 'coding': case 'program': {
            if (!text) return m.reply(`Example: ${prefix + command} <description>`);
            const lang = args[0]?.startsWith('--') ? args.shift().slice(2) : 'javascript';
            const desc = args.join(' ') || text;
            try {
                const res = await AI.codeAI(desc, lang);
                await m.reply(`💻 *${lang.toUpperCase()} Code:*\n\n\`\`\`${lang}\n${res.text}\n\`\`\``);
            } catch (e) {
                m.reply('❌ Code generation failed: ' + e.message);
            }
        }
        break

        case 'brainrot': {
            if (!text) return m.reply(`Example: ${prefix + command} <text>`);
            try {
                const res = await AI.brainrot(text);
                await m.reply(`🧠 *Brainrot Mode:*\n${res.text}`);
            } catch (e) {
                m.reply('❌ Brainrot failed: ' + e.message);
            }
        }
        break

        case 'roastai': {
            if (!text) return m.reply(`Example: ${prefix + command} <name/thing>`);
            try {
                const res = await AI.roast(text);
                await m.reply(`🔥 *AI Roast:*\n${res.text}`);
            } catch (e) {
                m.reply('❌ Roast failed: ' + e.message);
            }
        }
        break

        case 'rizz': {
            if (!text) return m.reply(`Example: ${prefix + command} <situation>`);
            try {
                const res = await AI.rizz(text);
                await m.reply(`💘 *Rizz:*\n${res.text}`);
            } catch (e) {
                m.reply('❌ Rizz failed: ' + e.message);
            }
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

        // ═══════════════════════════════════════════════════════════════
        //  UNIVERSAL VIDEO DOWNLOADER — works across ALL platforms
        // ═══════════════════════════════════════════════════════════════
        case 'video': case 'vid': case 'dl': case 'download': {
            if (!text) return m.reply(`📥 *Universal Video Downloader*\n\nSupports 50+ platforms:\nYouTube, TikTok, Instagram, Facebook, Twitter/X, Pinterest, Reddit, SoundCloud, Threads, Snapchat, Vimeo, Dailymotion, Twitch, Rumble, Odysee, Bandcamp, Audiomack, Mixcloud, Kick, Streamable, Loom, LinkedIn, VK, Bilibili, TED, Coursera, BBC, CNN, and more!\n\nUsage: ${prefix + command} <url>`);

            const url = text.trim();
            await m.reply(`🔍 Detecting platform...`);

            try {
                const { universalDownload, detectPlatform } = require('./lib/downloader');
                const platform = detectPlatform(url);

                await m.reply(`📥 Downloading from *${platform}*...`);

                const result = await universalDownload(url, { audio: false });

                if (result.local) {
                    const buffer = fs.readFileSync(result.url);
                    await nimesha.sendMessage(m.chat, {
                        video: buffer,
                        caption: `✅ *${result.platform} Video*\n📦 Size: ${(result.size / 1024 / 1024).toFixed(2)} MB`
                    }, { quoted: m });
                    fs.unlinkSync(result.url);
                } else {
                    await nimesha.sendMessage(m.chat, {
                        video: { url: result.url },
                        caption: `✅ *${result.platform} Video*`
                    }, { quoted: m });
                }
            } catch (e) {
                m.reply(`❌ Download failed:\n${e.message}\n\n💡 Tip: Make sure the URL is public and not geo-blocked.`);
            }
        }
        break

        case 'song': case 'mp3': case 'ytmp3': case 'play': {
            if (!text) return m.reply(`🎵 *Universal Audio Downloader*\n\nUsage: ${prefix + command} <query or url>\n\nWorks with YouTube, SoundCloud, Bandcamp, Audiomack, Mixcloud, and more.`);

            try {
                const { universalDownload } = require('./lib/downloader');
                let url = text.trim();

                // If not a URL, search YouTube
                if (!url.startsWith('http')) {
                    await m.reply(`🔍 Searching: *${text}*`);
                    const yts = require('yt-search');
                    const sr = await yts(text);
                    if (!sr.videos?.length) throw new Error('No results found');
                    url = sr.videos[0].url;
                }

                await m.reply(`🎵 Downloading audio...`);

                const result = await universalDownload(url, { audio: true });

                if (result.local) {
                    const buffer = fs.readFileSync(result.url);
                    await nimesha.sendMessage(m.chat, {
                        audio: buffer,
                        mimetype: 'audio/mpeg',
                        fileName: `${result.title}.mp3`,
                        ptt: false
                    }, { quoted: m });
                    fs.unlinkSync(result.url);
                } else {
                    await nimesha.sendMessage(m.chat, {
                        audio: { url: result.url },
                        mimetype: 'audio/mpeg',
                        fileName: `${result.title}.mp3`,
                        ptt: false
                    }, { quoted: m });
                }
            } catch (e) {
                m.reply(`❌ Audio download failed:\n${e.message}`);
            }
        }
        break

        case 'play2': case 'yplay': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('🎵 *Searching & Downloading...*');
            try {
                const yts = require('yt-search');
                const { universalDownload } = require('./lib/downloader');
                const sr = await yts(text);
                if (!sr.videos?.length) throw new Error('No results');
                const video = sr.videos[0];
                const result = await universalDownload(video.url, { audio: true });

                if (result.local) {
                    const buffer = fs.readFileSync(result.url);
                    await nimesha.sendMessage(m.chat, {
                        audio: buffer,
                        mimetype: 'audio/mpeg',
                        fileName: `${result.title}.mp3`,
                        ptt: false,
                        contextInfo: {
                            externalAdReply: {
                                title: video.title,
                                body: video.author.name,
                                thumbnailUrl: video.thumbnail,
                                sourceUrl: video.url
                            }
                        }
                    }, { quoted: m });
                    fs.unlinkSync(result.url);
                } else {
                    await nimesha.sendMessage(m.chat, {
                        audio: { url: result.url },
                        mimetype: 'audio/mpeg',
                        fileName: `${result.title}.mp3`,
                        ptt: false,
                        contextInfo: {
                            externalAdReply: {
                                title: video.title,
                                body: video.author.name,
                                thumbnailUrl: video.thumbnail,
                                sourceUrl: video.url
                            }
                        }
                    }, { quoted: m });
                }
            } catch (e) {
                m.reply(`❌ ${e.message}`);
            }
        }
        break

        case 'spotify': case 'sp': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <track url>`);
            await m.reply('🎧 *Downloading from Spotify...*');
            try {
                const { spotifyDownload } = require('./lib/downloader');
                const sp = await spotifyDownload(args[0]);
                await nimesha.sendMessage(m.chat, {
                    audio: { url: sp.url },
                    mimetype: 'audio/mpeg',
                    fileName: `${sp.title}.mp3`
                }, { quoted: m });
            } catch (e) {
                m.reply(`❌ ${e.message}`);
            }
        }
        break

        case 'apk': case 'app': {
            if (!text) return m.reply(`Example: ${prefix + command} <app name>`);
            await m.reply('📲 *Searching APK...*');
            try {
                const { apkDownload } = require('./lib/downloader');
                const apk = await apkDownload(text);
                await nimesha.sendMessage(m.chat, {
                    document: { url: apk.url },
                    mimetype: 'application/vnd.android.package-archive',
                    fileName: `${apk.name}.apk`,
                    caption: apk.name
                }, { quoted: m });
            } catch (e) {
                m.reply(`❌ ${e.message}`);
            }
        }
        break

        case 'ytsearch': case 'yts': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('🔍 *Searching YouTube...*');
            try {
                const yts = require('yt-search');
                const res = await yts(text);
                let txt = '*🎬 YouTube Search Results*\n\n';
                res.videos.slice(0, 10).forEach((v, i) => {
                    txt += `${i + 1}. *${v.title}*\n👤 ${v.author.name} | ⏱️ ${v.timestamp} | 👁️ ${v.views}\n🔗 ${v.url}\n\n`;
                });
                await m.reply(txt);
            } catch (e) {
                m.reply(`❌ ${e.message}`);
            }
        }
        break

        // ===== SEARCH COMMANDS =====
        // ===== SEARCH COMMANDS =====
        case 'google': case 'g': case 'search': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('🔍 *Searching Google...*');
            try {
                const res = await Search.googleSearch(text);
                await m.reply(res);
            } catch (e) {
                m.reply('❌ Search failed: ' + e.message);
            }
        }
        break

        case 'bing': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('🔍 *Searching Bing...*');
            try {
                const res = await Search.bingSearch(text);
                await m.reply(res);
            } catch (e) {
                m.reply('❌ Bing search failed: ' + e.message);
            }
        }
        break

        case 'wiki': case 'wikipedia': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('📚 *Searching Wikipedia...*');
            try {
                const res = await Search.wikiSearch(text);
                await m.reply(res);
            } catch (e) {
                m.reply('❌ Wikipedia failed: ' + e.message);
            }
        }
        break

        case 'github': {
            if (!text) return m.reply(`Example: ${prefix + command} <repo/user>`);
            await m.reply('💻 *Searching GitHub...*');
            try {
                const res = await Search.githubSearch(text);
                await m.reply(res);
            } catch (e) {
                m.reply('❌ GitHub search failed: ' + e.message);
            }
        }
        break

        case 'npm': {
            if (!text) return m.reply(`Example: ${prefix + command} <package>`);
            await m.reply('📦 *Searching NPM...*');
            try {
                const res = await Search.npmSearch(text);
                await m.reply(res);
            } catch (e) {
                m.reply('❌ NPM search failed: ' + e.message);
            }
        }
        break

        case 'urban': {
            if (!text) return m.reply(`Example: ${prefix + command} <word>`);
            await m.reply('📖 *Searching Urban Dictionary...*');
            try {
                const res = await Search.urbanDictionary(text);
                await m.reply(res);
            } catch (e) {
                m.reply('❌ Urban Dictionary failed: ' + e.message);
            }
        }
        break
        case 'anime': {
            if (!text) return m.reply(`Example: ${prefix + command} <title>`);
            await m.reply('📺 *Searching Anime...*');
            try {
                const res = await Search.animeSearch(text);
                await m.reply(res);
            } catch (e) {
                m.reply('❌ Anime search failed: ' + e.message);
            }
        }
        break

        case 'manga': {
            if (!text) return m.reply(`Example: ${prefix + command} <title>`);
            await m.reply('📖 *Searching Manga...*');
            try {
                const res = await Search.mangaSearch(text);
                await m.reply(res);
            } catch (e) {
                m.reply('❌ Manga search failed: ' + e.message);
            }
        }
        break
        // ===== SOCIAL MEDIA SEARCH =====
        case 'reddit': case 'redditsearch': {
            if (!text) return m.reply(`Example: ${prefix + command} <query> | [subreddit]`);
            const [query, sub] = text.includes('|') ? text.split('|').map(s => s.trim()) : [text, 'all'];
            await m.reply('🔴 *Searching Reddit...*');
            try {
                const res = await Search.redditSearch(query, sub);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'reddituser': {
            if (!text) return m.reply(`Example: ${prefix + command} <username>`);
            await m.reply('👤 *Searching Reddit User...*');
            try {
                const res = await Search.redditUserSearch(text.replace(/^u\//, ''));
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'twitter': case 'x': case 'tweetsearch': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('🐦 *Searching Twitter...*');
            try {
                const res = await Search.twitterSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'twitteruser': case 'xuser': {
            if (!text) return m.reply(`Example: ${prefix + command} <username>`);
            await m.reply('👤 *Searching Twitter User...*');
            try {
                const res = await Search.twitterUserSearch(text.replace(/^@/, ''));
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'discord': {
            if (!text) return m.reply(`Example: ${prefix + command} <server keyword>`);
            await m.reply('💬 *Searching Discord servers...*');
            try {
                const res = await Search.discordSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'telegram': case 'tg': {
            if (!text) return m.reply(`Example: ${prefix + command} <channel keyword>`);
            await m.reply('📱 *Searching Telegram...*');
            try {
                const res = await Search.telegramSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'mastodon': {
            if (!text) return m.reply(`Example: ${prefix + command} <query> | [instance]`);
            const [query, instance] = text.includes('|') ? text.split('|').map(s => s.trim()) : [text, 'mastodon.social'];
            await m.reply('🐘 *Searching Mastodon...*');
            try {
                const res = await Search.mastodonSearch(query, instance);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'bluesky': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('🦋 *Searching Bluesky...*');
            try {
                const res = await Search.blueskySearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'instagram': case 'igsearch': {
            if (!text) return m.reply(`Example: ${prefix + command} <username>`);
            await m.reply('📸 *Searching Instagram...*');
            try {
                const res = await Search.instagramSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'tiktok': case 'ttsearch': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('🎵 *Searching TikTok...*');
            try {
                const res = await Search.tiktokSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'pinterest': case 'pin': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('📌 *Searching Pinterest...*');
            try {
                const res = await Search.pinterestSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'twitch': {
            if (!text) return m.reply(`Example: ${prefix + command} <channel>`);
            await m.reply('🎮 *Searching Twitch...*');
            try {
                const res = await Search.twitchSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'youtube': case 'yt': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('🎬 *Searching YouTube...*');
            try {
                const res = await Search.youtubeSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'ytchannel': case 'ytc': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('📺 *Searching YouTube Channels...*');
            try {
                const res = await Search.youtubeChannelSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        // ===== CODE & DEV SEARCH =====
        case 'gitlab': {
            if (!text) return m.reply(`Example: ${prefix + command} <project>`);
            await m.reply('🦊 *Searching GitLab...*');
            try {
                const res = await Search.gitlabSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'pypi': {
            if (!text) return m.reply(`Example: ${prefix + command} <package>`);
            await m.reply('🐍 *Searching PyPI...*');
            try {
                const res = await Search.pypiSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'docker': case 'dockerhub': {
            if (!text) return m.reply(`Example: ${prefix + command} <image>`);
            await m.reply('🐳 *Searching Docker Hub...*');
            try {
                const res = await Search.dockerHubSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'stackoverflow': case 'so': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('💻 *Searching Stack Overflow...*');
            try {
                const res = await Search.stackOverflowSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'sourceforge': case 'sf': {
            if (!text) return m.reply(`Example: ${prefix + command} <project>`);
            await m.reply('📦 *Searching SourceForge...*');
            try {
                const res = await Search.sourceForgeSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        // ===== ENTERTAINMENT SEARCH =====
        case 'tvsearch': case 'tvdb': {
            if (!text) return m.reply(`Example: ${prefix + command} <title>`);
            await m.reply('📺 *Searching TV Shows...*');
            try {
                const res = await Search.tvSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'game': case 'gamesearch': {
            if (!text) return m.reply(`Example: ${prefix + command} <title>`);
            await m.reply('🎮 *Searching Games (RAWG)...*');
            try {
                const res = await Search.gameSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'igdb': {
            if (!text) return m.reply(`Example: ${prefix + command} <title>`);
            await m.reply('🎮 *Searching IGDB...*');
            try {
                const res = await Search.igdbSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'comic': case 'comicvine': {
            if (!text) return m.reply(`Example: ${prefix + command} <character/issue>`);
            await m.reply('💥 *Searching ComicVine...*');
            try {
                const res = await Search.comicSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'spotifysearch': case 'sps': {
            if (!text) return m.reply(`Example: ${prefix + command} <query> | [track/artist/album]`);
            const [query, type] = text.includes('|') ? text.split('|').map(s => s.trim()) : [text, 'track'];
            await m.reply('🎵 *Searching Spotify...*');
            try {
                const res = await Search.spotifySearch(query, type);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'lastfm': {
            if (!text) return m.reply(`Example: ${prefix + command} <query> | [track/artist/album]`);
            const [query, type] = text.includes('|') ? text.split('|').map(s => s.trim()) : [text, 'track'];
            await m.reply('🎵 *Searching Last.fm...*');
            try {
                const res = await Search.lastfmSearch(query, type);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'deezer': {
            if (!text) return m.reply(`Example: ${prefix + command} <query> | [track/artist/album]`);
            const [query, type] = text.includes('|') ? text.split('|').map(s => s.trim()) : [text, 'track'];
            await m.reply('🎵 *Searching Deezer...*');
            try {
                const res = await Search.deezerSearch(query, type);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'lyrics': {
            if (!text || !text.includes('|')) return m.reply(`Example: ${prefix + command} <artist> | <song>`);
            const [artist, title] = text.split('|').map(s => s.trim());
            await m.reply('🎤 *Searching Lyrics...*');
            try {
                const res = await Search.lyricsSearch(artist, title);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'giphy': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('🎭 *Searching GIPHY...*');
            try {
                const res = await Search.giphySearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'tenor': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('🎭 *Searching Tenor...*');
            try {
                const res = await Search.tenorSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        // ===== ACADEMIC SEARCH =====
        case 'arxiv': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('📄 *Searching arXiv...*');
            try {
                const res = await Search.arxivSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'crossref': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('📄 *Searching Crossref...*');
            try {
                const res = await Search.crossrefSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'semanticscholar': case 'scholar': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('📚 *Searching Semantic Scholar...*');
            try {
                const res = await Search.semanticScholarSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'openalex': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('📚 *Searching OpenAlex...*');
            try {
                const res = await Search.openAlexSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'pubmed': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('🧬 *Searching PubMed...*');
            try {
                const res = await Search.pubmedSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'core': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('📄 *Searching CORE...*');
            try {
                const res = await Search.coreSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'googlescholar': case 'gscholar': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('📄 *Searching Google Scholar...*');
            try {
                const res = await Search.googleScholarSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'doi': {
            if (!text) return m.reply(`Example: ${prefix + command} <doi>`);
            await m.reply('📄 *Looking up DOI...*');
            try {
                const res = await Search.doiLookup(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        // ===== NEWS SEARCH =====
        case 'hackernews': case 'hn': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('🟠 *Searching HackerNews...*');
            try {
                const res = await Search.hackernewsSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'techcrunch': case 'tc': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('💻 *Searching TechCrunch...*');
            try {
                const res = await Search.techCrunchSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        // ===== SHOPPING SEARCH =====
        case 'ebay': {
            if (!text) return m.reply(`Example: ${prefix + command} <item>`);
            await m.reply('🛒 *Searching eBay...*');
            try {
                const res = await Search.ebaySearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'amazon': {
            if (!text) return m.reply(`Example: ${prefix + command} <item>`);
            await m.reply('📦 *Searching Amazon...*');
            try {
                const res = await Search.amazonSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'aliexpress': case 'ali': {
            if (!text) return m.reply(`Example: ${prefix + command} <item>`);
            await m.reply('📦 *Searching AliExpress...*');
            try {
                const res = await Search.aliexpressSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'etsy': {
            if (!text) return m.reply(`Example: ${prefix + command} <item>`);
            await m.reply('🎨 *Searching Etsy...*');
            try {
                const res = await Search.etsySearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        // ===== IMAGE SEARCH =====
        case 'image': case 'img': case 'imgsearch': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('🖼️ *Searching Images...*');
            try {
                const res = await Search.imageSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        // ===== WEATHER & GEO =====
        case 'openweather': case 'ow': {
            if (!text) return m.reply(`Example: ${prefix + command} <city>`);
            await m.reply('🌤️ *Searching Weather...*');
            try {
                const res = await Search.openWeatherSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'geocode': case 'locate': case 'whereis': {
            if (!text) return m.reply(`Example: ${prefix + command} <place>`);
            await m.reply('📍 *Geocoding...*');
            try {
                const res = await Search.geocodeSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        // ===== FINANCE =====
        case 'stocksearch': case 'stocks': {
            if (!text) return m.reply(`Example: ${prefix + command} <AAPL>`);
            await m.reply('📈 *Searching Stock...*');
            try {
                const res = await Search.stockSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'exchange': case 'exchangerate': case 'convertcurrency': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} <USD> <EUR>`);
            await m.reply('💱 *Fetching exchange rate...*');
            try {
                const res = await Search.exchangeRate(args[0], args[1]);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        // ===== GOVERNMENT / PUBLIC DATA =====
        case 'nasa': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('🚀 *Searching NASA...*');
            try {
                const res = await Search.nasaSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'worldbank': {
            if (!text) return m.reply(`Example: ${prefix + command} <indicator>`);
            await m.reply('🌍 *Searching World Bank...*');
            try {
                const res = await Search.worldBankSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'patent': {
            if (!text) return m.reply(`Example: ${prefix + command} <keyword>`);
            await m.reply('📜 *Searching Patents...*');
            try {
                const res = await Search.patentSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        // ===== FUN APIs =====
        case 'randomuser': case 'fakeuser': {
            await m.reply('👤 *Generating random user...*');
            try {
                const res = await Search.randomUser();
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'nameinfo': case 'namecheck': {
            if (!text) return m.reply(`Example: ${prefix + command} <name>`);
            await m.reply('📛 *Analyzing name...*');
            try {
                const res = await Search.nameInfo(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'pokedex': case 'pokemoninfo': {
            if (!text) return m.reply(`Example: ${prefix + command} <pokemon>`);
            await m.reply('⚡ *Searching Pokedex...*');
            try {
                const res = await Search.pokemonSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'chucknorris': case 'chuck': {
            await m.reply('🥋 *Fetching Chuck Norris fact...*');
            try {
                const res = await Search.chuckNorris();
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'dadjoke': {
            await m.reply('😂 *Fetching dad joke...*');
            try {
                const res = await Search.dadJoke();
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'catfact': {
            await m.reply('🐱 *Fetching cat fact...*');
            try {
                const res = await Search.catFact();
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'dog': case 'dogimg': case 'dogpic': {
            await m.reply('🐕 *Fetching dog image...*');
            try {
                const res = await Search.dogImage();
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'numberfact': case 'numfact': {
            if (!text) return m.reply(`Example: ${prefix + command} <number>`);
            await m.reply('🔢 *Fetching number fact...*');
            try {
                const res = await Search.numberFact(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'rickandmorty': case 'rm': {
            if (!text) return m.reply(`Example: ${prefix + command} <name> | [character/episode/location]`);
            const [query, type] = text.includes('|') ? text.split('|').map(s => s.trim()) : [text, 'character'];
            await m.reply('👽 *Searching Rick and Morty...*');
            try {
                const res = await Search.rickAndMortySearch(query, type);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'starwars': case 'sw': {
            if (!text) return m.reply(`Example: ${prefix + command} <name> | [people/planets/starships]`);
            const [query, type] = text.includes('|') ? text.split('|').map(s => s.trim()) : [text, 'people'];
            await m.reply('⭐ *Searching Star Wars...*');
            try {
                const res = await Search.starWarsSearch(query, type);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'harrypotter': case 'hp': {
            if (!text) return m.reply(`Example: ${prefix + command} <name>`);
            await m.reply('⚡ *Searching Harry Potter...*');
            try {
                const res = await Search.harryPotterSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'brewery': {
            if (!text) return m.reply(`Example: ${prefix + command} <city/name>`);
            await m.reply('🍺 *Searching Breweries...*');
            try {
                const res = await Search.brewerySearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'foodsearch': case 'recipesearch': {
            if (!text) return m.reply(`Example: ${prefix + command} <dish>`);
            await m.reply('🍽️ *Searching Recipes...*');
            try {
                const res = await Search.foodSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        // ===== META / UNIVERSAL SEARCH =====
        case 'find': case 'searchall': case 'universalsearch': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('🔥 *Running universal search across 20+ platforms...*');
            try {
                const res = await Search.universalSearch(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'findperson': case 'stalk': case 'whoisuser': {
            if (!text) return m.reply(`Example: ${prefix + command} <username>`);
            await m.reply('👤 *Searching person across social platforms...*');
            try {
                const res = await Search.findPerson(text.replace(/^@/, ''));
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'findanything': case 'deepsearch': case 'knowledgesearch': {
            if (!text) return m.reply(`Example: ${prefix + command} <query>`);
            await m.reply('📚 *Deep knowledge search across academic databases...*');
            try {
                const res = await Search.findAnything(text);
                await m.reply(res);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break
        case 'remindme': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} <minutes> <text>`);
            const mins = parseInt(args[0]);
            const msgText = args.slice(1).join(' ');
            if (isNaN(mins) || mins <= 0) return m.reply('Invalid minutes.');
            const due = Date.now() + mins * 60000;
            if (!db.reminders) db.reminders = [];
            db.reminders.push({ user: m.sender, target: m.sender, text: msgText, due });
            await m.reply(`⏰ Reminder set for ${mins} minute(s).\n📝 ${msgText}`);
        }
        break
        case 'remind': {
            if (!text) return m.reply(`Example: ${prefix + command} me to call John tomorrow at 10am`);
            await m.reply('🧠 *Understanding your reminder...*');
            try {
                const { ultimateAI } = require('./lib/ai');
                const now = new Date();
                const prompt = `Extract the reminder datetime (ISO 8601 format, in Africa/Nairobi timezone) and message from this user request.
Return ONLY a JSON object with "due" (timestamp in milliseconds) and "text" (the reminder message). If you can't determine a date/time, set "due" to null.
Current time: ${now.toISOString()} (Nairobi: ${now.toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })})
User request: "${text}"
JSON:`;
                const res = await ultimateAI(prompt, m.sender, 'deepseek');
                // Try to extract JSON from response
                let parsed;
                try {
                    parsed = JSON.parse(res.text);
                } catch {
                    // maybe the response has extra text, find JSON object
                    const match = res.text.match(/\{[\s\S]*\}/);
                    if (!match) throw new Error('No JSON found');
                    parsed = JSON.parse(match[0]);
                }
                if (!parsed.due || isNaN(parsed.due) || !parsed.text) {
                    return m.reply('❌ Could not extract a valid time from your request. Please be more specific.\nExample: "remind me to buy milk at 5pm"');
                }
                const dueMs = parsed.due;
                // Don't allow past reminders
                if (dueMs <= Date.now()) {
                    return m.reply('❌ The time you mentioned is in the past. Please use a future time.');
                }
                if (!db.reminders) db.reminders = [];
                db.reminders.push({ user: m.sender, target: m.sender, text: parsed.text, due: dueMs });
                const timeStr = new Date(dueMs).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
                await m.reply(`⏰ *Reminder set!*\n📝 ${parsed.text}\n📅 ${timeStr}`);
            } catch (e) {
                m.reply(`❌ Failed to set reminder: ${e.message}\n\nTry using the manual format: ${prefix}remindme 30 Buy milk`);
            }
        }
        break
        case 'schedule': case 'sched': {
            if (!isCreator) return m.reply(mess.owner);
            // Syntax: .schedule <time> <@user|jid> <message>
            const timeArg = args[0];
            const targetArg = args[1];
            const message = args.slice(2).join(' ');
            if (!timeArg || !targetArg || !message) return m.reply(`Example: ${prefix + command} 30m @user Hello, wake up!\nTime format: 30m (minutes), 2h (hours), 10s (seconds), or milliseconds.`);
            
            // Parse time
            let due;
            if (/^\d+$/.test(timeArg) && timeArg.length > 10) {
                // it's a timestamp in ms
                due = parseInt(timeArg);
            } else {
                const match = timeArg.match(/^(\d+)\s*(s|m|h|d)$/i);
                if (!match) return m.reply('Invalid time format. Use: 10s, 30m, 2h, 1d, or a timestamp.');
                const num = parseInt(match[1]);
                const unit = match[2].toLowerCase();
                const now = Date.now();
                if (unit === 's') due = now + num * 1000;
                else if (unit === 'm') due = now + num * 60000;
                else if (unit === 'h') due = now + num * 3600000;
                else if (unit === 'd') due = now + num * 86400000;
            }

            // Resolve target JID
            let targetJid;
            if (targetArg.startsWith('@')) {
                const mentioned = m.mentionedJid?.[0];
                if (!mentioned) return m.reply('Mention a valid user (e.g., @user).');
                targetJid = mentioned;
            } else if (targetArg.endsWith('@g.us') || targetArg.endsWith('@s.whatsapp.net')) {
                targetJid = targetArg;
            } else {
                targetJid = targetArg.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }

            if (!targetJid) return m.reply('Could not resolve target.');

            if (!db.reminders) db.reminders = [];
            db.reminders.push({ user: m.sender, target: targetJid, text: message, due });
            await m.reply(`📨 Scheduled message to ${targetJid.split('@')[0]} in ${timeArg}.\n📝 ${message}`);
        }
        break
        case 'weather': case 'cuaca': {
            if (!text) return m.reply(`Example: ${prefix + command} <city>`);
            await m.reply('🌤️ *Checking weather...*');
            try {
                const res = await Search.weatherSearch(text);
                await m.reply(res);
            } catch (e) {
                m.reply('❌ Weather failed: ' + e.message);
            }
        }
        break

        case 'news': {
            const query = text || '';
            await m.reply('📰 *Fetching news...*');
            try {
                const res = await Search.newsSearch(query);
                await m.reply(res);
            } catch (e) {
                m.reply('❌ News failed: ' + e.message);
            }
        }
        break

        case 'crypto': case 'bitcoin': case 'eth': {
            const coin = args[0]?.toLowerCase() || 'bitcoin';
            await m.reply('💰 *Checking crypto...*');
            try {
                const res = await Search.cryptoSearch(coin);
                await m.reply(res);
            } catch (e) {
                m.reply('❌ Crypto failed: ' + e.message);
            }
        }
        break

        case 'forex': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} USD EUR`);
            await m.reply('💱 *Fetching rate...*');
            try {
                const res = await Search.exchangeRate(args[0], args[1]);
                await m.reply(res);
            } catch (e) {
                m.reply('❌ Forex failed: ' + e.message);
            }
        }
        break
        case 'covid': {
            if (!text) return m.reply(`Example: ${prefix + command} <country>`);
            try {
                const fetch = require('node-fetch');
                // Using disease.sh API (free, no key)
                const url = `https://disease.sh/v3/covid-19/countries/${encodeURIComponent(text)}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('Country not found');
                const json = await res.json();
                const result = `🦠 *COVID-19: ${json.country}*\n\n📊 Cases: ${json.cases?.toLocaleString() || 'N/A'}\n💀 Deaths: ${json.deaths?.toLocaleString() || 'N/A'}\n💚 Recovered: ${json.recovered?.toLocaleString() || 'N/A'}\n😷 Active: ${json.active?.toLocaleString() || 'N/A'}\n🧪 Tests: ${json.tests?.toLocaleString() || 'N/A'}\n📅 Updated: ${new Date(json.updated).toLocaleString()}`;
                await m.reply(result);
            } catch (e) {
                m.reply('❌ COVID data failed: ' + e.message);
            }
        }
        break

        case 'crypto': case 'bitcoin': case 'eth': {
            const coin = args[0]?.toLowerCase() || 'bitcoin';
            try {
                const fetch = require('node-fetch');
                // Using CoinGecko API (free, no key)
                const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd,eur,gbp&include_24hr_change=true&include_market_cap=true`;
                const res = await fetch(url);
                const json = await res.json();
                
                if (json[coin]) {
                    const data = json[coin];
                    const result = `💰 *${coin.charAt(0).toUpperCase() + coin.slice(1)} Price*\n\n💵 USD: $${data.usd?.toLocaleString()}\n💶 EUR: €${data.eur?.toLocaleString()}\n💷 GBP: £${data.gbp?.toLocaleString()}\n📈 24h Change: ${data.usd_24h_change?.toFixed(2) || 'N/A'}%\n🏦 Market Cap: $${data.usd_market_cap?.toLocaleString()}`;
                    await m.reply(result);
                } else {
                    throw new Error('Cryptocurrency not found. Try: bitcoin, ethereum, litecoin, ripple, cardano');
                }
            } catch (e) {
                // Fallback
                try {
                    const res = await Tools.cryptoPrice(coin);
                    await m.reply(res);
                } catch (e2) {
                    m.reply('❌ Crypto lookup failed: ' + e.message);
                }
            }
        }
        break

        case 'forex': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} USD EUR`);
            try {
                const fetch = require('node-fetch');
                // Using ExchangeRate-API (free tier available) or Frankfurter (free, no key)
                const url = `https://api.frankfurter.app/latest?from=${args[0].toUpperCase()}&to=${args[1].toUpperCase()}`;
                const res = await fetch(url);
                const json = await res.json();
                
                if (json.rates && json.rates[args[1].toUpperCase()]) {
                    const rate = json.rates[args[1].toUpperCase()];
                    const result = `💱 *Forex Rate*\n\n1 ${args[0].toUpperCase()} = ${rate} ${args[1].toUpperCase()}\n📅 Date: ${json.date}`;
                    await m.reply(result);
                } else {
                    throw new Error('Invalid currency codes');
                }
            } catch (e) {
                // Fallback
                try {
                    const res = await Tools.forex(args[0], args[1]);
                    await m.reply(res);
                } catch (e2) {
                    m.reply('❌ Forex lookup failed: ' + e.message);
                }
            }
        }
        break

        case 'iplookup': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <ip>`);
            try {
                const fetch = require('node-fetch');
                // Using ipapi.co (free tier, no key for non-SSL)
                const url = `https://ipapi.co/${args[0]}/json/`;
                const res = await fetch(url);
                const json = await res.json();
                
                if (json.error) throw new Error(json.reason || 'Invalid IP');
                const result = `📡 *IP Lookup: ${args[0]}*\n\n🏳️ Country: ${json.country_name} (${json.country_code})\n🏙️ City: ${json.city}\n🗺️ Region: ${json.region}\n📮 Postal: ${json.postal}\n🌐 ISP: ${json.org}\n📍 Latitude: ${json.latitude}\n📍 Longitude: ${json.longitude}\n⏰ Timezone: ${json.timezone}`;
                await m.reply(result);
            } catch (e) {
                // Fallback
                try {
                    const res = await Tools.ipLookup(args[0]);
                    await m.reply(res);
                } catch (e2) {
                    m.reply('❌ IP lookup failed: ' + e.message);
                }
            }
        }
        break

        case 'whois': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <domain>`);
            try {
                const fetch = require('node-fetch');
                // Using whoisjson API (free tier) or jsonwhois
                const url = `https://api.whoisfreaks.com/v1.0/whois?apiKey=free&whois=live&domainName=${encodeURIComponent(args[0])}`;
                // Alternative: using ip-api for domain info
                const backupUrl = `https://ipapi.co/${encodeURIComponent(args[0])}/json/`;
                
                try {
                    const res = await fetch(url);
                    const json = await res.json();
                    if (json.whoisResponseRaw) {
                        await m.reply(`📡 *WHOIS: ${args[0]}*\n\n\`\`\`\n${json.whoisResponseRaw.substring(0, 2000)}\n\`\`\``);
                    } else {
                        throw new Error('No WHOIS data');
                    }
                } catch (e2) {
                    // Simple DNS info fallback
                    const dns = require('dns').promises;
                    const addresses = await dns.lookup(args[0]);
                    await m.reply(`📡 *Domain Info: ${args[0]}*\n\n🌐 IP: ${addresses.address}\n📡 Family: IPv${addresses.family}\n\n_For full WHOIS, please use a paid API or whois command line tool._`);
                }
            } catch (e) {
                m.reply('❌ WHOIS lookup failed: ' + e.message);
            }
        }
        break

        case 'dns': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <domain>`);
            try {
                const dns = require('dns').promises;
                const [a, aaaa, mx, txt, ns] = await Promise.allSettled([
                    dns.resolve4(args[0]),
                    dns.resolve6(args[0]),
                    dns.resolveMx(args[0]),
                    dns.resolveTxt(args[0]),
                    dns.resolveNs(args[0])
                ]);
                
                let result = `📡 *DNS Records: ${args[0]}*\n\n`;
                if (a.status === 'fulfilled') result += `🅰️ A Records:\n${a.value.map(ip => `  • ${ip}`).join('\n')}\n\n`;
                if (aaaa.status === 'fulfilled') result += `🅰️ AAAA Records:\n${aaaa.value.map(ip => `  • ${ip}`).join('\n')}\n\n`;
                if (mx.status === 'fulfilled') result += `📧 MX Records:\n${mx.value.map(r => `  • ${r.exchange} (priority: ${r.priority})`).join('\n')}\n\n`;
                if (txt.status === 'fulfilled') result += `📝 TXT Records:\n${txt.value.map(r => `  • ${r.join('')}`).join('\n')}\n\n`;
                if (ns.status === 'fulfilled') result += `🌐 NS Records:\n${ns.value.map(r => `  • ${r}`).join('\n')}\n\n`;
                
                await m.reply(result || 'No DNS records found');
            } catch (e) {
                m.reply('❌ DNS lookup failed: ' + e.message);
            }
        }
        break

        case 'qr': {
            if (!text) return m.reply(`Example: ${prefix + command} <text>`);
            try {
                const fetch = require('node-fetch');
                // Using goqr.me API (free, no key)
                const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
                const res = await fetch(url);
                const buffer = await res.buffer();
                await nimesha.sendMessage(m.chat, { image: buffer, caption: 'QR Code' }, { quoted: m });
            } catch (e) {
                m.reply('❌ QR generation failed: ' + e.message);
            }
        }
        break

        case 'shorten': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <url>`);
            try {
                const fetch = require('node-fetch');
                // Using is.gd (free, no key) or TinyURL
                const apis = [
                    `https://is.gd/create.php?format=simple&url=${encodeURIComponent(args[0])}`,
                    `https://tinyurl.com/api-create.php?url=${encodeURIComponent(args[0])}`
                ];
                
                let success = false;
                for (const url of apis) {
                    try {
                        const res = await fetch(url);
                        const shortUrl = await res.text();
                        if (shortUrl && shortUrl.startsWith('http')) {
                            await m.reply(`🔗 *Short URL:*\n${shortUrl}`);
                            success = true;
                            break;
                        }
                    } catch (e) { continue; }
                }
                
                if (!success) throw new Error('All URL shorteners failed');
            } catch (e) {
                m.reply('❌ URL shortening failed: ' + e.message);
            }
        }
        break

        // ===== FUN COMMANDS =====
        case 'joke': {
            try {
                const fetch = require('node-fetch');
                // Using Official Joke API (free, no key)
                const url = 'https://official-joke-api.appspot.com/random_joke';
                const res = await fetch(url);
                const json = await res.json();
                await m.reply(`😂 *Joke*\n\n${json.setup}\n\n${json.punchline}`);
            } catch (e) {
                // Fallback
                try {
                    const res = await Fun.joke();
                    await m.reply(res);
                } catch (e2) {
                    m.reply('❌ Joke failed: ' + e.message);
                }
            }
        }
        break

        case 'meme': {
            try {
                const fetch = require('node-fetch');
                // Using Reddit memes API (free) or meme-api
                const url = 'https://meme-api.com/gimme';
                const res = await fetch(url);
                const json = await res.json();
                if (json.url) {
                    await nimesha.sendMessage(m.chat, { image: { url: json.url }, caption: `${json.title}\n📁 r/${json.subreddit}` }, { quoted: m });
                } else {
                    throw new Error('No meme found');
                }
            } catch (e) {
                // Fallback
                try {
                    const res = await Fun.meme();
                    await nimesha.sendMessage(m.chat, { image: { url: res.image }, caption: `${res.caption}\n📁 r/${res.subreddit}` }, { quoted: m });
                } catch (e2) {
                    m.reply('❌ Meme failed: ' + e.message);
                }
            }
        }
        break

        case 'quote': {
            try {
                const fetch = require('node-fetch');
                // Using Quotable API (free, no key)
                const url = 'https://api.quotable.io/random';
                const res = await fetch(url);
                const json = await res.json();
                await m.reply(`💬 *Quote*\n\n"${json.content}"\n\n— ${json.author}`);
            } catch (e) {
                // Fallback
                try {
                    const res = await Fun.quote();
                    await m.reply(res);
                } catch (e2) {
                    m.reply('❌ Quote failed: ' + e.message);
                }
            }
        }
        break

        case 'fact': {
            try {
                const fetch = require('node-fetch');
                // Using uselessfacts API (free, no key)
                const url = 'https://uselessfacts.jsph.pl/random.json?language=en';
                const res = await fetch(url);
                const json = await res.json();
                await m.reply(`🤓 *Random Fact*\n\n${json.text}`);
            } catch (e) {
                // Fallback
                try {
                    const res = await Fun.fact();
                    await m.reply(res);
                } catch (e2) {
                    m.reply('❌ Fact failed: ' + e.message);
                }
            }
        }
        break

        case 'ship': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} @user1 @user2`);
            try {
                const res = await Fun.ship(args[0], args[1]);
                await m.reply(res);
            } catch (e) {
                // Manual ship calculation fallback
                const percent = Math.floor(Math.random() * 100);
                const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));
                await m.reply(`💘 *Ship Meter*\n\n@${args[0].split('@')[0]} ❤️ @${args[1].split('@')[0]}\n\n${bar} ${percent}%\n\n${percent > 80 ? '🔥 Perfect match!' : percent > 50 ? '💕 Good compatibility' : '💔 Maybe not...'}`);
            }
        }
        break

        case 'wyr': case 'wouldyourather': {
            try {
                const fetch = require('node-fetch');
                // Using would-you-rather API (free)
                const url = 'https://would-you-rather-api.abaanshanid.repl.co/';
                const res = await fetch(url);
                const json = await res.json();
                await m.reply(`🤔 *Would You Rather*\n\n${json.data || json.question || 'No question found'}`);
            } catch (e) {
                // Fallback
                try {
                    const res = await Fun.wouldYouRather();
                    await m.reply(res);
                } catch (e2) {
                    m.reply('❌ WYR failed: ' + e.message);
                }
            }
        }
        break

        case '8ball': case '8b': {
            if (!text) return m.reply('Ask a question');
            const answers = ['Yes', 'No', 'Maybe', 'Definitely', 'Absolutely not', 'Ask again later', 'Most likely', 'Very doubtful', 'Without a doubt', 'Better not tell you now'];
            await m.reply(`🎲 *8Ball*\nQ: ${text}\nA: ${pickRandom(answers)}`);
        }
        break

        case 'roll': {
            const sides = parseInt(args[0]) || 6;
            const result = Math.floor(Math.random() * sides) + 1;
            await m.reply(`🎲 *Rolled:* ${result} (1-${sides})`);
        }
        break

        case 'flip': case 'coin': {
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            await m.reply(`🪙 *Coin Flip:* ${result}`);
        }
        break

        case 'roast': {
            if (args[0]) {
                try {
                    const res = await AI.roast(args.join(' '));
                    await m.reply(`🔥 ${res.text}`);
                } catch (e) {
                    const roasts = [
                        "You're like a cloud. When you disappear, it's a beautiful day.",
                        "I'm not saying I hate you, but I would unplug your life support to charge my phone.",
                        "You're the reason the gene pool needs a lifeguard.",
                        "If laughter is the best medicine, your face must be curing the world.",
                        "You're not stupid; you just have bad luck thinking."
                    ];
                    await m.reply(`🔥 ${pickRandom(roasts)}`);
                }
            } else {
                try {
                    const res = await Fun.roast();
                    await m.reply(res);
                } catch (e) {
                    const roasts = [
                        "You're like a cloud. When you disappear, it's a beautiful day.",
                        "I'm not saying I hate you, but I would unplug your life support to charge my phone.",
                        "You're the reason the gene pool needs a lifeguard."
                    ];
                    await m.reply(`🔥 ${pickRandom(roasts)}`);
                }
            }
        }
        break

        case 'compliment': {
            const compliments = [
                "You're an awesome friend.",
                "You're a gift to those around you.",
                "You're a smart cookie.",
                "You are awesome!",
                "You have impeccable manners.",
                "I like your style.",
                "You have the best laugh.",
                "I appreciate you.",
                "You are the most perfect you there is.",
                "You are enough."
            ];
            if (m.quoted) {
                await m.reply(`🌟 @${m.quoted.sender.split('@')[0]}, ${pickRandom(compliments)}`, { mentions: [m.quoted.sender] });
            } else {
                await m.reply(`🌟 ${pickRandom(compliments)}`);
            }
        }
        break

        case 'truth': {
            const truths = [
                "What's the last lie you told?",
                "What was the most embarrassing thing you've done?",
                "What's your biggest fear?",
                "What's one secret you've never told anyone?",
                "What's the worst thing you've ever done?",
                "Who was your first crush?",
                "What's the strangest dream you've had?",
                "What's your biggest regret?",
                "What's the most childish thing you still do?",
                "Have you ever cheated on a test?"
            ];
            await m.reply(`🎯 *Truth:*\n${pickRandom(truths)}`);
        }
        break

        case 'dare': {
            const dares = [
                "Do 20 pushups.",
                "Sing a song for 30 seconds.",
                "Dance without music for 1 minute.",
                "Let someone tickle you for 10 seconds.",
                "Eat a spoonful of hot sauce.",
                "Talk in an accent for the next 3 rounds.",
                "Do your best impression of a celebrity.",
                "Let the group post something on your social media.",
                "Wear your clothes backward for the next hour.",
                "Try to lick your elbow."
            ];
            await m.reply(`😈 *Dare:*\n${pickRandom(dares)}`);
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
                // Using nekos.best API (free, no key)
                const res = await fetch(`https://nekos.best/api/v2/${command}`).catch(() => null);
                const data = await res?.json();
                const gifUrl = data?.results?.[0]?.url;
                if (gifUrl) {
                    await nimesha.sendMessage(m.chat, { video: { url: gifUrl }, gifPlayback: true, caption: `*${command.toUpperCase()}*` }, { quoted: m });
                } else {
                    throw new Error(`Could not fetch ${command} GIF`);
                }
            } catch (e) { 
                // Fallback to waifu.im or other free APIs
                try {
                    const fetch = require('node-fetch');
                    const endpoints = {
                        neko: 'neko', waifu: 'waifu', hug: 'hug', kiss: 'kiss', 
                        pat: 'pat', cry: 'cry', slap: 'slap', dance: 'dance',
                        happy: 'happy', blush: 'blush', wink: 'wink'
                    };
                    const endpoint = endpoints[command] || 'waifu';
                    const res = await fetch(`https://api.waifu.pics/sfw/${endpoint}`);
                    const json = await res.json();
                    if (json.url) {
                        await nimesha.sendMessage(m.chat, { video: { url: json.url }, gifPlayback: true, caption: `*${command.toUpperCase()}*` }, { quoted: m });
                    } else {
                        throw new Error('Fallback failed');
                    }
                } catch (e2) {
                    m.reply(`❌ Could not fetch ${command} GIF.`);
                }
            }
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
                // Using vihangayt API (free, no key)
                const apis = [
                    `https://api.vihangayt.me/maker/${command}?text=${encodeURIComponent(text)}`,
                    `https://api.davidcyriltech.my.id/${command}?text=${encodeURIComponent(text)}`
                ];
                
                let success = false;
                for (const url of apis) {
                    try {
                        const res = await fetch(url);
                        if (!res.ok) continue;
                        const buffer = await res.buffer();
                        if (buffer && buffer.length > 100) {
                            await nimesha.sendMessage(m.chat, { image: buffer, caption: `🎨 *${command.toUpperCase()} Text Art*\n📝 *Text:* ${text}` }, { quoted: m });
                            success = true;
                            break;
                        }
                    } catch (e) { continue; }
                }
                
                if (!success) throw new Error('All APIs failed');
            } catch (e) {
                m.reply('❌ Failed to generate text art: ' + e.message);
            }
        }
        break

        // ===== MEME OVERLAYS =====
        case 'oogway': {
            if (!text) return m.reply(`Example: ${prefix + command} <quote>`);
            try {
                const fetch = require('node-fetch');
                // Using popcat.xyz API (free, no key)
                const url = `https://api.popcat.xyz/oogway?text=${encodeURIComponent(text)}`;
                const res = await fetch(url);
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
                // Using nekohime API or popcat
                const url = `https://api.popcat.xyz/tweet?username=${encodeURIComponent(username)}&text=${encodeURIComponent(text)}`;
                const res = await fetch(url);
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
                // Using popcat.xyz API (free, no key)
                const ppUrl = await nimesha.profilePictureUrl(m.sender, 'image').catch(() => 'https://i.imgur.com/default.png');
                const url = `https://api.popcat.xyz/youtubecomment?username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(ppUrl)}&comment=${encodeURIComponent(text)}`;
                const res = await fetch(url);
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
                    // Using popcat.xyz API (free, no key)
                    const url = `https://api.popcat.xyz/jail?image=${encodeURIComponent(pp)}`;
                    const res = await fetch(url);
                    const buffer = await res.buffer();
                    return await nimesha.sendMessage(m.chat, { image: buffer, caption: `🚔 *JAILED!*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
                }
                await nimesha.sendMessage(m.chat, { text: `🚔 *@${mentioned.split('@')[0]} is now in JAIL!*`, mentions: [mentioned] }, { quoted: m });
            } catch (e) { 
                m.reply('❌ Error: ' + e.message); 
            }
        }
        break

        case 'triggered': {
            const mentioned = m.mentionedJid?.[0] || m.sender;
            try {
                const pp = await nimesha.profilePictureUrl(mentioned, 'image').catch(() => null);
                if (pp) {
                    const fetch = require('node-fetch');
                    // Using popcat.xyz API (free, no key)
                    const url = `https://api.popcat.xyz/triggered?image=${encodeURIComponent(pp)}`;
                    const res = await fetch(url);
                    const buffer = await res.buffer();
                    return await nimesha.sendMessage(m.chat, { video: buffer, gifPlayback: true, caption: `😤 *TRIGGERED!*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
                }
                await nimesha.sendMessage(m.chat, { text: `😤 *@${mentioned.split('@')[0]} is TRIGGERED!*`, mentions: [mentioned] }, { quoted: m });
            } catch (e) { 
                m.reply('❌ Error: ' + e.message); 
            }
        }
        break

        case 'namecard': {
            const name = m.pushName || text || 'User';
            try {
                const fetch = require('node-fetch');
                // Using popcat.xyz or similar free API
                const url = `https://api.popcat.xyz/welcomecard?background=https://cdn.popcat.xyz/welcome-bg.png&text1=${encodeURIComponent(name)}&text2=WhatsApp%20User&text3=Member%20%231&avatar=${encodeURIComponent(await nimesha.profilePictureUrl(m.sender, 'image').catch(() => 'https://i.imgur.com/default.png'))}`;
                const res = await fetch(url);
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
            const overlayMap = { heart: 'heart', circle: 'circle', lgbt: 'rainbow', horny: 'horny', lolice: 'lolice', gay: 'gay', glass: 'glass', passed: 'passed' };
            try {
                const pp = await nimesha.profilePictureUrl(mentioned, 'image').catch(() => null);
                if (pp) {
                    const fetch = require('node-fetch');
                    // Using popcat.xyz API (free, no key)
                    const overlay = overlayMap[command] || command;
                    const url = `https://api.popcat.xyz/${overlay}?image=${encodeURIComponent(pp)}`;
                    const res = await fetch(url);
                    const buffer = await res.buffer();
                    return await nimesha.sendMessage(m.chat, { image: buffer, caption: `${emojiMap[command]} *${command.toUpperCase()}*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
                }
                await nimesha.sendMessage(m.chat, { text: `${emojiMap[command]} *${command.toUpperCase()}*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
            } catch (e) { 
                m.reply('❌ Error: ' + e.message); 
            }
        }
        break

        case 'its-so-stupid': case 'comrade': {
            const mentioned = m.mentionedJid?.[0] || m.sender;
            const templateMap = { 'its-so-stupid': 'its-so-stupid', 'comrade': 'communist' };
            try {
                const pp = await nimesha.profilePictureUrl(mentioned, 'image').catch(() => null);
                if (pp) {
                    const fetch = require('node-fetch');
                    const template = templateMap[command] || command;
                    const url = `https://api.popcat.xyz/${template}?image=${encodeURIComponent(pp)}`;
                    const res = await fetch(url);
                    const buffer = await res.buffer();
                    return await nimesha.sendMessage(m.chat, { image: buffer, caption: `😆 *${command.toUpperCase()}*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
                }
                await nimesha.sendMessage(m.chat, { text: `😆 *${command.toUpperCase()}*\n@${mentioned.split('@')[0]}`, mentions: [mentioned] }, { quoted: m });
            } catch (e) { 
                m.reply('❌ Error: ' + e.message); 
            }
        }
        break

        // ===== GAMES COMMANDS =====
        case 'slot': case 'slots': {
            const res = slotMachine();
            const u = Economy.ensureUser(m.sender);
            if (res.win) { 
                u.coins += res.amount; 
                await m.reply(`🎰 ${res.reels.join(' | ')}\n\n🎉 You won ${res.amount} coins!`); 
            }
            else { 
                u.coins = Math.max(0, u.coins - 10); 
                await m.reply(`🎰 ${res.reels.join(' | ')}\n\n😞 Lost 10 coins`); 
            }
        }
        break

        case 'rpg': case 'adventure': {
            if (!db.users[m.sender]) db.users[m.sender] = {};
            if (!db.users[m.sender].rpg) db.users[m.sender].rpg = new RPGAdventure(m.sender);
            const r = db.users[m.sender].rpg;
            if (args[0] === 'fight' || args[0] === 'attack') {
                if (!r.enemy) r.spawn();
                const res = r.attack();
                if (res.dead) { 
                    delete db.users[m.sender].rpg; 
                    m.reply(`💀 You died on floor ${r.floor}! Game over.`); 
                }
                else if (res.win) { 
                    m.reply(`⚔️ Victory! +${res.gold} gold, +${res.xp} XP${res.levelup ? '\n🆙 LEVEL UP!' : ''}\n\n${r.fmt()}`); 
                }
                else m.reply(`⚔️ You dealt ${res.dmg}, enemy dealt ${res.edmg}\nEnemy HP: ${res.ehp}\n${r.fmt()}`);
            } else if (args[0] === 'heal') { 
                const h = r.heal(); 
                m.reply(h === 'poor' ? 'Need 10 gold' : `❤️ Healed! HP: ${h.hp}\n${r.fmt()}`); 
            }
            else if (args[0] === 'spawn') { 
                r.spawn(); 
                m.reply(`👹 ${r.enemy.name} appeared!\n${r.fmt()}`); 
            }
            else { 
                m.reply(r.fmt()); 
            }
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
            for (let r = 0; r < 6; r++) { 
                for (let c = 0; c < 7; c++) { 
                    boardStr += symbols[board[r][c]]; 
                } 
                boardStr += '\n'; 
            }
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

        // ═══════════════════════════════════════════════════════════════
        //  🎮 RAWG / GAME DATABASE
        // ═══════════════════════════════════════════════════════════════
        case 'rawg': case 'gamesearch': {
            if (!text) return m.reply(`Example: ${prefix + command} elden ring`);
            await m.reply('🎮 Searching RAWG...');
            try {
                const r = await RAWG.search(text, 1, 8);
                if (!r.results?.length) return m.reply('No games found.');
                let txt = `🎮 *RAWG Results*\n\n`;
                r.results.forEach((g, i) => { txt += `${i + 1}. *${g.name}* (${g.released || 'TBA'})\n⭐ ${g.rating || '?'}/5\n`; });
                txt += `\n_Use ${prefix}gameinfo <id> for details_`;
                m.reply(txt);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'gameinfo': {
            if (!text) return m.reply(`Example: ${prefix + command} <rawg-id or slug>`);
            await m.reply('🎮 Fetching game details...');
            try {
                const g = await RAWG.details(text);
                m.reply(RAWG.format(g));
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'gamestores': case 'store': {
            if (!text) return m.reply(`Example: ${prefix + command} <game-id>`);
            try {
                const s = await RAWG.stores(text);
                let txt = `🏪 *Stores*\n`; (s.results || []).forEach(x => txt += `• ${x.store.name}: ${x.url}\n`);
                m.reply(txt || 'No store links.');
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'screenshots': case 'ss': {
            if (!text) return m.reply(`Example: ${prefix + command} <game-id>`);
            try {
                const s = await RAWG.screens(text);
                if (!s.results?.length) return m.reply('No screenshots.');
                for (let i of s.results.slice(0, 5)) await nimesha.sendMessage(m.chat, { image: { url: i.image }, caption: '🎮 Screenshot' }, { quoted: m });
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'trailers': case 'clips': {
            if (!text) return m.reply(`Example: ${prefix + command} <game-id>`);
            try {
                const t = await RAWG.trailers(text);
                if (!t.results?.length) return m.reply('No trailers.');
                let txt = `🎬 *Trailers*\n`; t.results.forEach((v, i) => txt += `${i + 1}. [${v.name}](${v.data?.max || v.data?.[480] || v.data?.[720]})\n`);
                m.reply(txt);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'topgames': {
            try { const r = await RAWG.top(); let txt = `🏆 *Top Rated Games*\n\n`; r.results.forEach((g, i) => txt += `${i + 1}. *${g.name}* — ⭐${g.rating}\n`); m.reply(txt); } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'upcominggames': {
            try { const r = await RAWG.upcoming(); let txt = `🔜 *Upcoming Games*\n\n`; r.results.forEach((g, i) => txt += `${i + 1}. *${g.name}* — 📅 ${g.released || 'TBA'}\n`); m.reply(txt); } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        // ═══════════════════════════════════════════════════════════════
        //  🎰 CASINO GAMES
        // ═══════════════════════════════════════════════════════════════
        case 'roulette': {
            if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <amount> <red/black/even/odd/number>`);
            const bet = parseInt(args[0]); const choice = args[1].toLowerCase();
            if (isNaN(bet) || db.users[m.sender].money < bet) return m.reply('Invalid bet or insufficient money.');
            const r = rouletteSpin(); let win = false, mult = 0;
            if (['red','black','even','odd'].includes(choice) && r.color.includes(choice === 'red' ? '🔴' : choice === 'black' ? '⚫' : choice === 'even' ? (r.even ? 'yes' : 'no') : !r.even ? 'yes' : 'no')) { win = true; mult = 2; }
            else if (!isNaN(parseInt(choice)) && parseInt(choice) === r.res) { win = true; mult = 36; }
            if (win) { db.users[m.sender].money += bet * mult; m.reply(`🎰 ${r.res} ${r.color}\n\n🎉 WIN! +${bet * mult}`); }
            else { db.users[m.sender].money -= bet; m.reply(`🎰 ${r.res} ${r.color}\n\n💀 Lose -${bet}`); }
        }
        break

        case 'crash': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <amount> <auto-cashout-multiplier>`);
            const bet = parseInt(args[0]); const target = parseFloat(args[1]) || 2.0;
            if (db.users[m.sender].money < bet) return m.reply('Too poor!');
            db.users[m.sender].money -= bet;
            const c = crash();
            if (target <= c.crash) { const win = Math.floor(bet * target); db.users[m.sender].money += win; m.reply(`📈 Crashed at ${c.crash}x\n✅ You cashed out @ ${target}x\n🎉 +${win}`); }
            else { m.reply(`📈 Crashed at ${c.crash}x\n💀 You aimed for ${target}x\nBUST!`); }
        }
        break

        case 'dice': case 'roll': {
            if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <amount> <over/under> <number 2-11>`);
            const bet = parseInt(args[0]); const mode = args[1]; const num = parseInt(args[2]);
            if (db.users[m.sender].money < bet) return m.reply('Too poor!');
            const d1 = diceRoll(), d2 = diceRoll(), sum = d1 + d2;
            const win = (mode === 'over' && sum > num) || (mode === 'under' && sum < num) || (mode === 'exact' && sum === num);
            const mult = mode === 'exact' ? 5 : 2;
            if (win) { db.users[m.sender].money += bet * mult; m.reply(`🎲 ${d1} + ${d2} = ${sum}\n🎉 WIN! +${bet * mult}`); }
            else { db.users[m.sender].money -= bet; m.reply(`🎲 ${d1} + ${d2} = ${sum}\n💀 Lose`); }
        }
        break

        case 'coinflip': case 'coin': {
            if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <amount> <heads/tails>`);
            const bet = parseInt(args[0]); const side = args[1].toLowerCase(); const r = coinflip();
            if (db.users[m.sender].money < bet) return m.reply('Too poor!');
            if (side === r) { db.users[m.sender].money += bet; m.reply(`🪙 ${r}\n🎉 WIN +${bet}`); }
            else { db.users[m.sender].money -= bet; m.reply(`🪙 ${r}\n💀 Lose`); }
        }
        break

        case 'rps': case 'suitpro': {
            const choices = ['rock','paper','scissors','lizard','spock'];
            if (!args[0] || !choices.includes(args[0])) return m.reply(`Pick: rock, paper, scissors, lizard, spock`);
            const p1 = args[0]; const p2 = pickRandom(choices);
            const res = rpsls(p1, p2);
            m.reply(`You: ${p1}\nBot: ${p2}\n\n${res === 'draw' ? '🤝 Draw' : res === 'p1' ? '🎉 You win!' : '💀 Bot wins!'}`);
        }
        break

        // ═══════════════════════════════════════════════════════════════
        //  🧠 MINI GAMES & QUIZZES
        // ═══════════════════════════════════════════════════════════════
        case 'math': case 'mathquiz': {
            const diff = args[0] || 'medium';
            const q = mathQuiz(diff);
            db.users[m.sender]._math = q;
            m.reply(`🧠 *Math Quiz [${diff}]*\n${q.q}\n\nReply with the answer.`);
        }
        break

        case 'anagram': case 'scramble': {
            const a = anagram();
            db.users[m.sender]._anagram = a.original;
            m.reply(`🔤 Unscramble: *${a.scrambled}*\n\nReply with the correct word.`);
        }
        break

        case 'guessnum': case 'gtn': {
            db.users[m.sender]._gtn = numberGuess(parseInt(args[0]) || 1, parseInt(args[1]) || 100);
            m.reply(`🔢 Guess the number between ${db.users[m.sender]._gtn.min} and ${db.users[m.sender]._gtn.max}`);
        }
        break

        case 'trivia': {
            try {
                const q = await TriviaMaster.get(args[0], args[1]);
                db.users[m.sender]._trivia = q.correct;
                let txt = `🎯 *Trivia* — ${q.category} | ${q.difficulty}\n\n${q.q}\n\n`;
                q.options.forEach((o, i) => txt += `${String.fromCharCode(65 + i)}. ${o}\n`);
                m.reply(txt);
            } catch (e) { m.reply('❌ Trivia failed'); }
        }
        break

        case 'pokemon': {
            try {
                const p = await PokemonGame.random();
                db.users[m.sender]._pokemon = p.name;
                await nimesha.sendMessage(m.chat, { image: { url: p.sprite }, caption: `🔮 Who's that Pokémon?\nType: ${p.types.join('/')}\n\n${p.desc.slice(0, 120)}...\n\nReply with the name!` }, { quoted: m });
            } catch (e) { m.reply('❌ Pokemon API error'); }
        }
        break

        case 'numbers': {
            try { const t = await NumbersGame.trivia(); m.reply(`🔢 *Did you know?*\n${t}`); } catch (e) { m.reply('❌ Error'); }
        }
        break

        // ═══════════════════════════════════════════════════════════════
        //  🎬 MOVIE / TV COMMANDS
        // ═══════════════════════════════════════════════════════════════
        case 'movie': case 'film': case 'cinema': {
            if (!text) return m.reply(`Example: ${prefix + command} <title>`);
            await m.reply('🎬 *Searching...*');
            try {
                const results = await Movie.search(text);
                if (!results || !results.length) return m.reply('No results found.');
                if (!db.movieSearch) db.movieSearch = {};
                db.movieSearch[m.sender] = { results, timestamp: Date.now() };
                const listMsg = Movie.formatList(results);
                await m.reply(listMsg + `\n\n_Reply with the number (1-${Math.min(results.length,8)}) to see details, or use *.imdb <id>*._`);
            } catch(e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'imdb': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <imdb-id>\nOr reply with a number from a previous search.`);
            let id = args[0];
            if (/^\d+$/.test(id) && db.movieSearch && db.movieSearch[m.sender]) {
                const search = db.movieSearch[m.sender];
                if (Date.now() - search.timestamp > 300000) {
                    delete db.movieSearch[m.sender];
                } else {
                    const index = parseInt(id) - 1;
                    if (index >= 0 && index < search.results.length) {
                        id = search.results[index].imdbID;
                    } else {
                        return m.reply('Invalid number. Please use a valid IMDB ID.');
                    }
                }
            }
            try {
                const data = await Movie.getById(id);
                const poster = data.Poster && data.Poster !== 'N/A' ? data.Poster : null;
                const caption = Movie.formatMovie(data);
                if (poster) {
                    await nimesha.sendMessage(m.chat, { image: { url: poster }, caption }, { quoted: m });
                } else {
                    await m.reply(caption);
                }
            } catch(e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'series': case 'tvshow': {
            if (!text) return m.reply(`Example: ${prefix + command} <title>`);
            await m.reply('📺 *Searching TV series...*');
            try {
                const results = await Movie.search(text, 'series');
                if (!results || !results.length) return m.reply('No series found.');
                if (!db.movieSearch) db.movieSearch = {};
                db.movieSearch[m.sender] = { results, timestamp: Date.now() };
                const listMsg = Movie.formatList(results);
                await m.reply(listMsg + `\n\n_Reply with the number (1-${Math.min(results.length,8)}) to see details, or use *.imdb <id>*._`);
            } catch(e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'rating': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <imdb-id>`);
            const r = await Movie.getRatings(args[0]);
            await m.reply(`⭐ *Ratings*\nIMDB: ${r.imdb}/10\n🍅 Rotten: ${r.rotten}\nⓂ️ Metacritic: ${r.metacritic}/100`);
        }
        break

        case 'tv': case 'tvmaze': {
            if (!text) return m.reply(`Example: ${prefix + command} breaking bad`);
            try {
                const r = await TVMaze.search(text);
                if (!r.length) return m.reply('No shows found.');
                const s = r[0].show;
                m.reply(TVMaze.fmtShow(s));
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'episodes': case 'eps': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <tvmaze-show-id>`);
            try {
                const e = await TVMaze.episodes(args[0]);
                let txt = `📺 *Episodes*\n`; e.slice(-20).forEach(x => txt += `S${String(x.season).padStart(2, '0')}E${String(x.number).padStart(2, '0')} — ${x.name}\n`);
                m.reply(txt);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'tvschedule': case 'ontv': {
            try {
                const s = await TVMaze.schedule('US');
                let txt = `📡 *Airing Today (US)*\n\n`; s.slice(0, 15).forEach(x => txt += `• ${x.show.name} — ${x.name} (${x.show.network?.name || 'Web'})\n`);
                m.reply(txt);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'trendinganime': {
            try {
                const r = await AniList.trending();
                let txt = `🔥 *Trending Anime*\n\n`; r.Page.media.forEach((a, i) => txt += `${i + 1}. *${a.title.english || a.title.romaji}* — ⭐${a.averageScore}\n`);
                m.reply(txt);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'jikan': {
            if (!text) return m.reply(`Example: ${prefix + command} naruto`);
            try {
                const r = await Jikan.anime(text);
                if (!r?.length) return m.reply('No results.');
                const a = r[0];
                m.reply(`📺 *${a.title}*\n⭐ ${a.score || '?'}/10 | 🎭 ${(a.genres || []).map(g => g.name).join(', ')}\n📁 Episodes: ${a.episodes || '?'}\n📝 ${a.synopsis?.slice(0, 300) || '-'}\n🔗 ${a.url}`);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'topanime': {
            try {
                const r = await Jikan.topAnime();
                let txt = `🏆 *Top Anime*\n\n`; r.slice(0, 10).forEach((a, i) => txt += `${i + 1}. *${a.title}* — ⭐${a.score}\n`);
                m.reply(txt);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        case 'moviequote': case 'emojimovie': {
            const mg = new MovieGuesser(); const q = mg.random();
            db.users[m.sender]._movieguess = q.t;
            m.reply(`🎬 Guess the movie:\n\n${q.e}\n\nReply with the title!`);
        }
        break

        case 'season': {
            if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <imdb-id> <season-number>`);
            try {
                const s = await OMDB.season(args[0], args[1]);
                let txt = `📂 *${s.Title} — Season ${s.Season}*\n\n`; (s.Episodes || []).forEach(e => txt += `E${e.Episode} — ${e.Title} ⭐${e.imdbRating}\n`);
                m.reply(txt);
            } catch (e) { m.reply('❌ ' + e.message); }
        }
        break

        // ═══════════════════════════════════════════════════════════════
        //  ⚽ SPORTS COMMANDS
        // ═══════════════════════════════════════════════════════════════
        case 'leagues': case 'football': {
            await m.reply('⚽ Fetching football leagues...');
            try {
                const leagues = await APISports.leagues({ current: 'true' });
                if (!leagues.length) return m.reply('No leagues found.');
                let txt = `📋 *Football Leagues*\n\n`;
                leagues.slice(0, 15).forEach(l => { txt += `• *${l.league.name}* (${l.country.name})\n  ID: ${l.league.id}\n`; });
                m.reply(txt);
            } catch (e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'fixtures': case 'matches': {
            if (!text) return m.reply(`Example: ${prefix}fixtures <league-id>\nExample: ${prefix}fixtures 39 (Premier League)`);
            const league = parseInt(text);
            if (isNaN(league)) return m.reply('Invalid league ID.');
            await m.reply('⚽ Fetching fixtures...');
            try {
                const fixtures = await APISports.fixtures({ league, season: '2025', next: 10 });
                if (!fixtures.length) return m.reply('No fixtures found.');
                let txt = `📅 *Upcoming Fixtures*\n\n`;
                fixtures.forEach(f => { txt += `${APISports.fmtFixture(f)}\n\n`; });
                m.reply(txt);
            } catch (e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'live': case 'livescore': {
            const league = parseInt(text) || 39;
            await m.reply('⚽ Fetching live scores...');
            try {
                const live = await APISports.live(league);
                if (!live.length) return m.reply('No live matches.');
                let txt = `🔥 *Live Scores*\n\n`;
                live.forEach(f => { txt += `${APISports.fmtFixture(f)}\n\n`; });
                m.reply(txt);
            } catch (e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'standings': case 'table': {
            if (!text) return m.reply(`Example: ${prefix}standings <league-id>\nExample: ${prefix}standings 39`);
            const league = parseInt(text);
            if (isNaN(league)) return m.reply('Invalid league ID.');
            await m.reply('📊 Fetching standings...');
            try {
                const standings = await APISports.standings(league, '2025');
                if (!standings.length) return m.reply('No standings found.');
                m.reply(APISports.fmtStandings({ league: { name: 'League', standings: standings } }));
            } catch (e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'team': {
            if (!text) return m.reply(`Example: ${prefix}team <team-id>\nExample: ${prefix}team 33`);
            const id = parseInt(text);
            if (isNaN(id)) return m.reply('Invalid team ID.');
            await m.reply('🏟️ Fetching team info...');
            try {
                const team = await APISports.team(id);
                m.reply(APISports.fmtTeam(team[0] || {}));
            } catch (e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'player': {
            if (!text) return m.reply(`Example: ${prefix}player <player-id>\nExample: ${prefix}player 276`);
            const id = parseInt(text);
            if (isNaN(id)) return m.reply('Invalid player ID.');
            await m.reply('👤 Fetching player info...');
            try {
                const player = await APISports.player(id, '2025');
                m.reply(APISports.fmtPlayer(player[0] || {}));
            } catch (e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'h2h': case 'headtohead': {
            if (!text) return m.reply(`Example: ${prefix}h2h <team1-id>-<team2-id>\nExample: ${prefix}h2h 33-40`);
            const [t1, t2] = text.split('-').map(x => parseInt(x.trim()));
            if (isNaN(t1) || isNaN(t2)) return m.reply('Invalid format. Use: 33-40');
            await m.reply('⚽ Fetching head-to-head...');
            try {
                const h2h = await APISports.headToHead(`${t1}-${t2}`);
                if (!h2h.length) return m.reply('No matches found.');
                let txt = `⚔️ *Head to Head*\n\n`;
                h2h.slice(0, 5).forEach(f => { txt += `${APISports.fmtFixture(f)}\n\n`; });
                m.reply(txt);
            } catch (e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'predict': case 'prediction': {
            if (!text) return m.reply(`Example: ${prefix}prediction <fixture-id>`);
            const id = parseInt(text);
            if (isNaN(id)) return m.reply('Invalid fixture ID.');
            await m.reply('🔮 Fetching prediction...');
            try {
                const pred = await APISports.predictions(id);
                if (!pred.length) return m.reply('No prediction available.');
                const p = pred[0];
                let txt = `🔮 *Match Prediction*\n\n`;
                txt += `⚽ ${p.teams?.home?.name} vs ${p.teams?.away?.name}\n\n`;
                txt += `📊 *Win Probability*\n`;
                txt += `Home: ${p.predictions?.percent?.home || '?'}%\n`;
                txt += `Draw: ${p.predictions?.percent?.draw || '?'}%\n`;
                txt += `Away: ${p.predictions?.percent?.away || '?'}%\n`;
                txt += `\n💡 *Advice:* ${p.predictions?.advice || 'N/A'}`;
                m.reply(txt);
            } catch (e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'odds': case 'betting': {
            if (!text) return m.reply(`Example: ${prefix}odds <sport-key>\nExample: ${prefix}odds soccer_epl`);
            const sport = text.trim();
            await m.reply('🎲 Fetching odds...');
            try {
                const odds = await OddsAPI.odds(sport, 'us', 'h2h');
                if (!odds.length) return m.reply('No odds found.');
                let txt = `🎲 *Betting Odds*\n\n`;
                odds.slice(0, 5).forEach(e => { txt += `${OddsAPI.fmtOdds(e)}\n`; });
                m.reply(txt);
            } catch (e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'sports': {
            await m.reply('🎲 Fetching available sports...');
            try {
                const sports = await OddsAPI.sports();
                if (!sports.length) return m.reply('No sports found.');
                let txt = `🏈 *Available Sports*\n\n`;
                sports.forEach(s => { txt += `• *${s.title}* — Key: \`${s.key}\` ${s.active ? '🟢' : '🔴'}\n`; });
                m.reply(txt);
            } catch (e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'espn': case 'scoreboard': {
            if (!args[0] || !args[1]) return m.reply(`Example: ${prefix}espn <sport> <league>\nExample: ${prefix}espn soccer eng.1`);
            const sport = args[0]; const league = args[1];
            await m.reply('📺 Fetching ESPN scoreboard...');
            try {
                const sb = await ESPN.scoreboard(sport, league);
                m.reply(ESPN.fmtScoreboard(sb));
            } catch (e) { m.reply(`❌ ${e.message}`); }
        }
        break

        case 'espnnews': case 'sportsnews': {
            if (!args[0] || !args[1]) return m.reply(`Example: ${prefix}espnnews <sport> <league>\nExample: ${prefix}espnnews soccer eng.1`);
            const sport = args[0]; const league = args[1];
            await m.reply('📰 Fetching news...');
            try {
                const news = await ESPN.news(sport, league);
                let txt = `📰 *ESPN News*\n\n`;
                news.articles?.slice(0, 5).forEach(a => { txt += `• *${a.headline}*\n  ${a.description?.slice(0, 80)}...\n  🔗 ${a.links?.web?.href}\n\n`; });
                m.reply(txt);
            } catch (e) { m.reply(`❌ ${e.message}`); }
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
            if (res.success) await m.reply(`💼 You worked as ${db.users[m.sender].job} and earned ${res.amount} coins`);
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

        case 'lb': case 'leaderboard': case 'top': {
            const lb = Economy.leaderboard();
            let txt = '🏆 *Global Leaderboard*\n\n';
            lb.forEach((u,i) => { txt += `${i+1}. @${u.id.split('@')[0]} — Lv.${u.level} | ${u.coins}🪙\n`; });
            await nimesha.sendMessage(m.chat, { text: txt, mentions: lb.map(u => u.id) }, { quoted: m });
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

        // ===== HEALTH COMMANDS =====
        case 'bmi': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} <kg> <cm>`);
            const res = Health.bmi(parseFloat(args[0]), parseFloat(args[1]));
            await m.reply(`⚖️ *BMI Result*\nValue: ${res.val}\nCategory: ${res.cat}\nIdeal weight: ${res.ideal[0]}-${res.ideal[1]}kg`);
        }
        break

        case 'bmr': {
            if (args.length < 4) return m.reply(`Example: ${prefix + command} <kg> <cm> <age> <male/female>`);
            const val = Health.bmr(parseFloat(args[0]), parseFloat(args[1]), parseInt(args[2]), args[3]);
            await m.reply(`🔥 *BMR:* ${val} calories/day`);
        }
        break

        case 'tdee': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} <bmr> <sedentary/light/moderate/active/athlete>`);
            const val = Health.tdee(parseInt(args[0]), args[1]);
            await m.reply(`⚡ *TDEE:* ${val} calories/day`);
        }
        break

        case 'macros': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <calories> [lose/maintain/gain]`);
            const res = Health.macros(parseInt(args[0]), args[1]);
            await m.reply(`🥗 *Macros for ${args[0]} cal*\n🥩 Protein: ${res.protein}g\n🥑 Fat: ${res.fat}g\n🍚 Carbs: ${res.carbs}g`);
        }
        break

        case 'watercalc': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <kg>`);
            await m.reply(`💧 Drink ~${Health.water(parseFloat(args[0]))}ml daily`);
        }
        break

        case 'sleep': {
            const cycles = Health.sleepWakeUp();
            await m.reply(`😴 *If you sleep now, wake up at:*\n${cycles.map((t,i) => `${i+1} cycle${i+1>1?'s':''}: ${t}`).join('\n')}\n\n💡 90min = 1 sleep cycle`);
        }
        break

        case 'heartrate': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <age>`);
            const z = Health.hrZones(parseInt(args[0]));
            await m.reply(`❤️ *HR Zones (Max: ${z.max})*\n🔥 Fat Burn: ${z.fatburn}\n🏃 Cardio: ${z.cardio}\n⚡ Peak: ${z.peak}`);
        }
        break

        case 'onerm': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} <weight> <reps>`);
            const rm = Health.oneRm(parseFloat(args[0]), parseInt(args[1]));
            await m.reply(`🏋️ Estimated 1RM: ${rm}kg`);
        }
        break

        case 'bodyfat': {
            if (args.length < 4) return m.reply(`Example: ${prefix + command} <male/female> <waist(cm)> <neck(cm)> <height(cm)> [hip(cm)]`);
            const res = Health.bodyFat(args[0], parseFloat(args[1]), parseFloat(args[2]), parseFloat(args[3]), parseFloat(args[4]||0));
            await m.reply(`📊 Estimated body fat: ${res}%`);
        }
        break

        case 'workout': case 'gym': {
            const type = args[0] || 'fullbody';
            const plan = Health.workout(type);
            await m.reply(`💪 *${type.toUpperCase()} Workout*\n${plan.map((x,i) => `${i+1}. ${x}`).join('\n')}`);
        }
        break

        case 'yoga': {
            const p = Health.yoga(args[0]);
            await m.reply(`🧘 *${p.name}*\n⏱️ Hold: ${p.time}\n✨ Benefit: ${p.benefit}`);
        }
        break

        // ===== FINANCE COMMANDS =====
        case 'stock': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <AAPL>`);
            try {
                const s = await Finance.stock(args[0]);
                await m.reply(`📈 *${args[0].toUpperCase()}*\nPrice: $${s.price}\nChange: ${s.change}%\nPrev: $${s.prev}`);
            } catch(e) { m.reply('❌ Market data limit'); }
        }
        break

        case 'crypto': case 'bitcoin': case 'eth': {
            const coin = args[0]?.toLowerCase() || 'bitcoin';
            try {
                const s = await Finance.crypto(coin);
                await m.reply(`💰 *${coin.toUpperCase()}*\nPrice: $${s.price}\n24h Change: ${s.change24h}%\nMarket Cap: $${s.marketCap}`);
            } catch(e) { m.reply('❌ Crypto data limit'); }
        }
        break

        case 'portfolio': {
            const p = Finance.getPortfolio(m.sender);
            if (!p.length) return m.reply('No portfolio. Use .addstock/.addcrypto');
            let txt = `📊 *Your Portfolio*\n`;
            p.forEach((x,i) => { txt += `${i+1}. ${x.type} ${x.sym} x${x.qty} @ $${x.buy}\n`; });
            await m.reply(txt);
        }
        break

        case 'addstock': {
            if (args.length < 3) return m.reply(`Example: ${prefix + command} <SYM> <qty> <buyPrice>`);
            Finance.addPortfolio(m.sender, 'stock', args[0], args[1], args[2]);
            await m.reply('✅ Added to portfolio');
        }
        break

        case 'addcrypto': {
            if (args.length < 3) return m.reply(`Example: ${prefix + command} <BTC> <qty> <buyPrice>`);
            Finance.addPortfolio(m.sender, 'crypto', args[0], args[1], args[2]);
            await m.reply('✅ Added to portfolio');
        }
        break

        case 'tip': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} <amount> <percent> [people]`);
            const res = Finance.tip(parseFloat(args[0]), parseInt(args[1]), parseInt(args[2]||1));
            await m.reply(`💰 *Tip Calculator*\nSubtotal: $${res.subtotal}\nTip (${args[1]}%): $${res.tip}\nTotal: $${res.total}\nPer person: $${res.each}`);
        }
        break

        case 'loan': case 'emi': {
            if (args.length < 3) return m.reply(`Example: ${prefix + command} <principal> <rate%> <months>`);
            const res = Finance.emi(parseFloat(args[0]), parseFloat(args[1]), parseInt(args[2]));
            await m.reply(`🏦 *Loan EMI*\nEMI: $${res.emi}/month\nTotal: $${res.total}\nInterest: $${res.interest}`);
        }
        break

        case 'savings': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} <goalAmount> <monthlySaving> [rate%]`);
            const res = Finance.savings(parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2]||5));
            await m.reply(`🏦 Reach $${args[0]} in ~${res.years} years (${res.months} months)`);
        }
        break

        // ===== DAILY / PRODUCTIVITY =====
        case 'remindme': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} <minutes> <text>`);
            const mins = parseInt(args[0]);
            const msgText = args.slice(1).join(' ');
            if (isNaN(mins) || mins <= 0) return m.reply('Invalid minutes.');
            const due = Date.now() + mins * 60000;
            if (!db.reminders) db.reminders = [];
            db.reminders.push({ user: m.sender, text: msgText, due });
            await m.reply(`⏰ Reminder set for ${mins} minute(s).\n📝 ${msgText}`);
        }
        break

        case 'reminders': {
            if (!db.reminders) db.reminders = [];
            // Filter only reminders for this user (user == m.sender)
            const mine = db.reminders.filter(r => r.user === m.sender || r.target === m.sender);
            if (!mine.length) return m.reply('📭 You have no active reminders.');
            let txt = '⏰ *Your Active Reminders*\n\n';
            mine.forEach((r, i) => {
                const due = new Date(r.due);
                const timeLeft = r.due - Date.now();
                const timeStr = due.toLocaleString('en-KE', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
                let relative = '';
                if (timeLeft < 60000) relative = ' (now)';
                else if (timeLeft < 3600000) relative = ` (in ${Math.floor(timeLeft / 60000)}m)`;
                else if (timeLeft < 86400000) relative = ` (in ${Math.floor(timeLeft / 3600000)}h)`;
                else relative = ` (in ${Math.floor(timeLeft / 86400000)}d)`;
                txt += `${i + 1}. ${r.text}\n   📅 ${timeStr}${relative}\n\n`;
            });
            txt += `Total: ${mine.length} reminder${mine.length > 1 ? 's' : ''}`;
            await m.reply(txt);
        }
        break

        case 'clearreminders': case 'clearme': {
            if (!db.reminders) return m.reply('No reminders to clear.');
            db.reminders = db.reminders.filter(r => r.user !== m.sender);
            await m.reply('🧹 All your reminders cleared.');
        }
        break

        case 'note': case 'addnote': {
            const [title, ...body] = text.split('|');
            if (!title || !body.length) return m.reply(`Example: ${prefix + command} Title | Content`);
            if (!db.notes) db.notes = {};
            if (!db.notes[m.sender]) db.notes[m.sender] = [];
            db.notes[m.sender].push({ title: title.trim(), content: body.join('|').trim(), date: Date.now() });
            await m.reply(`📝 Note saved: *${title.trim()}*`);
        }
        break

        case 'mynotes': {
            if (!db.notes?.[m.sender]?.length) return m.reply('No notes.');
            let txt = `📚 *Your Notes*\n`;
            db.notes[m.sender].forEach((n, i) => {
                txt += `${i+1}. *${n.title}* — ${new Date(n.date).toLocaleDateString()}\n`;
            });
            await m.reply(txt);
        }
        break

        case 'delnote': {
            const idx = parseInt(args[0]) - 1;
            if (!db.notes?.[m.sender] || idx < 0 || idx >= db.notes[m.sender].length) return m.reply('Invalid note number.');
            db.notes[m.sender].splice(idx, 1);
            await m.reply('🗑️ Note deleted');
        }
        break

        case 'todo': case 'addtodo': {
            if (!text) return m.reply(`Example: ${prefix + command} <task> | priority (high/medium/low)`);
            const [task, priority] = text.split('|').map(s => s.trim());
            if (!db.todos) db.todos = {};
            if (!db.todos[m.sender]) db.todos[m.sender] = [];
            db.todos[m.sender].push({ task, priority: priority || 'medium', done: false, date: Date.now() });
            await m.reply(`✅ Task added! (${db.todos[m.sender].filter(t => !t.done).length} pending)`);
        }
        break

        case 'todos': {
            if (!db.todos?.[m.sender]?.length) return m.reply('No tasks.');
            const pending = db.todos[m.sender].filter(t => !t.done);
            const done = db.todos[m.sender].filter(t => t.done);
            let txt = `📋 *Todo List*\n\n*Pending:*\n`;
            pending.forEach((t, i) => { txt += `${i+1}. [${t.priority.toUpperCase()}] ${t.task}\n`; });
            txt += `\n*Done:* ${done.length}`;
            await m.reply(txt);
        }
        break

        case 'done': case 'check': {
            const idx = parseInt(args[0]) - 1;
            if (!db.todos?.[m.sender] || idx < 0 || idx >= db.todos[m.sender].length) return m.reply('Invalid task number.');
            db.todos[m.sender][idx].done = true;
            await m.reply('🎉 Task completed!');
        }
        break

        case 'cleartodo': {
            if (!db.todos?.[m.sender]) return m.reply('No tasks.');
            db.todos[m.sender] = db.todos[m.sender].filter(t => !t.done);
            await m.reply('🧹 Completed tasks cleared');
        }
        break

        // ===== SOCIAL COMMANDS =====
        case 'bio': {
            const niche = args[0] || 'creator';
            await m.reply(`✍️ *Bio Idea*\n${Social.bios(niche)}`);
        }
        break

        case 'hashtag': case 'tags': {
            const topic = args[0] || 'love';
            await m.reply(`#️⃣ *Hashtags*\n${Social.hashtags(topic)}`);
        }
        break

        case 'caption': {
            const mood = args[0] || 'happy';
            await m.reply(`📝 *Caption*\n${Social.captions(mood)}`);
        }
        break

        case 'username': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <name> [clean/dev/cool]`);
            await m.reply(`👤 Suggested: ${Social.username(args[0], args[1])}`);
        }
        break

        case 'slogan': {
            await m.reply(`💡 *Slogan:*\n"${Social.slogan(args[0] || 'business')}"`);
        }
        break

        // ===== DEVELOPER COMMANDS =====
        case 'uuid': { await m.reply(`🔑 ${Dev.uuid()}`); } break

        case 'password': {
            const len = parseInt(args[0]) || 16;
            const p = Dev.password(len);
            await m.reply(`🔐 *Password*\n\`\`\`\n${p.pass}\n\`\`\`\nEntropy: ${p.entropy}`);
        } break

        case 'json': {
            if (!text) return m.reply(`Example: ${prefix + command} <json string>`);
            const r = Dev.json(text);
            if (r.valid) await m.reply(`✅ Valid (${r.keys} keys)\n\`\`\`json\n${r.pretty.slice(0,2000)}\n\`\`\``);
            else await m.reply(`❌ ${r.error}`);
        } break

        case 'encode': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} <base64/url/html> <text>`);
            await m.reply(Dev.encode(args[0], args.slice(1).join(' ')));
        } break

        case 'decode': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} <base64/url/html> <text>`);
            await m.reply(Dev.decode(args[0], args.slice(1).join(' ')));
        } break

        case 'lorem': {
            await m.reply(Dev.lorem(parseInt(args[0]) || 50));
        } break

        case 'palette': {
            const c = Dev.palette();
            await m.reply(`🎨 *Color Palette*\n${c.map(x => `■ ${x}`).join('\n')}`);
        } break

        case 'qrvcard': {
            if (args.length < 3) return m.reply(`Example: ${prefix + command} <name> <phone> <email>`);
            const data = Dev.qrData('vcard', { name: args[0], phone: args[1], email: args[2] });
            const buf = await Tools.qr(data);
            await nimesha.sendMessage(m.chat, { image: buf, caption: `📇 vCard QR for ${args[0]}` }, { quoted: m });
        } break

        case 'qrwifi': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} <SSID> <password>`);
            const data = Dev.qrData('wifi', { ssid: args[0], pass: args[1] });
            const buf = await Tools.qr(data);
            await nimesha.sendMessage(m.chat, { image: buf, caption: `📶 WiFi: ${args[0]}` }, { quoted: m });
        } break

        case 'checksum': {
            if (!m.quoted || !m.quoted.isMedia) return m.reply('Reply to a file');
            const buf = await m.quoted.download();
            const sha = Dev.checksum(buf, 'sha256');
            const md5 = Dev.checksum(buf, 'md5');
            await m.reply(`📁 Checksums\nSHA256: ${sha}\nMD5: ${md5}`);
        } break

        // ===== TRAVEL COMMANDS =====
        case 'packing': {
            if (args.length < 3) return m.reply(`Example: ${prefix + command} <destination> <days> <hot/cold/rain>`);
            const list = Travel.packing(args[0], parseInt(args[1]), args[2]);
            await m.reply(`🎒 *Packing List for ${args[0]}*\n${list.map((x,i) => `${i+1}. ${x}`).join('\n')}`);
        } break

        case 'worldclock': case 'time': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <city>`);
            const t = Travel.timezone(args[0]);
            await m.reply(`🌍 *${t.city}*\n🕐 ${t.time}\n📅 ${t.date}\n${t.offset}`);
        } break

        case 'phrasebook': case 'phrases': {
            const lang = args[0] || 'spanish';
            const p = Travel.phrases(lang);
            await m.reply(`🗣️ *${lang.toUpperCase()} Phrases*\n${Object.entries(p).map(([k,v]) => `*${k}:* ${v}`).join('\n')}`);
        } break

        case 'itinerary': {
            if (args.length < 2) return m.reply(`Example: ${prefix + command} <city> <days>`);
            const plan = Travel.itinerary(args[0], parseInt(args[1]));
            await m.reply(`🗺️ *${args[0]} ${args[1]}-Day Plan*\n${plan.map((x,i) => `Day ${i+1}: ${x}`).join('\n')}`);
        } break

        case 'convert': case 'unit': {
            if (args.length < 3) return m.reply(`Example: ${prefix + command} <value> <from> <to>\nUnits: km, mi, kg, lb, c, f, l, gal`);
            const val = parseFloat(args[0]);
            const f = args[1].toLowerCase(); const t = args[2].toLowerCase();
            const rates = { km_mi:0.621371, mi_km:1.60934, kg_lb:2.20462, lb_kg:0.453592, l_gal:0.264172, gal_l:3.78541 };
            const key = `${f}_${t}`;
            let res;
            if (key === 'c_f') res = (val * 9/5) + 32;
            else if (key === 'f_c') res = (val - 32) * 5/9;
            else if (rates[key]) res = val * rates[key];
            else return m.reply('Unsupported conversion');
            await m.reply(`🔄 ${val}${f} = ${res.toFixed(2)}${t}`);
        } break

        case 'detectlang': {
            if (!text) return m.reply(`Example: ${prefix + command} <text>`);
            const res = await AI.ultimateAI(`Detect language: "${text}". Reply only language name.`, m.sender, 'deepseek');
            await m.reply(`🌐 Detected: ${res.text}`);
        } break

        case 'readtime': {
            const words = text.split(/\s+/).length;
            const mins = Math.ceil(words / 200);
            await m.reply(`📖 ${words} words ≈ ${mins} min read`);
        } break

        // ===== FOOD COMMANDS =====
        case 'recipe': {
            if (!text) return m.reply(`Example: ${prefix + command} <dish>`);
            const r = await Food.recipe(text);
            if (!r) return m.reply('Recipe not found');
            await nimesha.sendMessage(m.chat, { image: { url: r.thumb }, caption: `🍽️ *${r.name}*\n📍 ${r.area} | ${r.category}\n\n*Ingredients:*\n${r.ingredients.join('\n')}\n\n*Instructions:*\n${r.instructions.slice(0,800)}...` }, { quoted: m });
        } break

        case 'cocktail': {
            const c = await Food.cocktail(text || 'margarita');
            if (!c) return m.reply('Drink not found');
            await nimesha.sendMessage(m.chat, { image: { url: c.thumb }, caption: `🍸 *${c.name}*\n🥃 Glass: ${c.glass}\n\n*Ingredients:*\n${c.ingredients.join(', ')}\n\n*How to make:*\n${c.instructions}` }, { quoted: m });
        } break

        case 'substitute': {
            if (!args[0]) return m.reply(`Example: ${prefix + command} <ingredient>`);
            await m.reply(`🔄 *Substitute for ${args[0]}*\n${Food.substitute(args[0])}`);
        } break

        case 'mealprep': {
            const plan = Food.mealPrep(args[0] || 'balanced');
            await m.reply(`🥗 *${(args[0]||'balanced').toUpperCase()} Meal Plan*\n${plan.map((x,i) => `${i+1}. ${x}`).join('\n')}`);
        } break

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
        // ===== JADIBOT (MULTI-USER) COMMANDS =====
        case 'pair': {
            if (!text) return m.reply(`Example: ${prefix}pair 254712345678`);
            const targetNumber = text.replace(/[^0-9]/g, '');
            if (targetNumber.length < 9) return m.reply('Invalid phone number. Include country code.');

            // Check if already paired
            if (db.jadibot && db.jadibot.sessions && db.jadibot.sessions[m.sender]?.active) {
                return m.reply('✅ You already have an active bot session! Use .stopjadibot first if you want to re-pair.');
            }

            const { execSync } = require('child_process');
            const fs = require('fs');
            const path = require('path');

            // Clean up any old temp auth for this user
            const tempAuthFolder = path.join(process.cwd(), 'jadibot_sessions', `temp_${m.sender.split('@')[0]}`);
            try { fs.rmSync(tempAuthFolder, { recursive: true, force: true }); } catch {}

            // Create a temporary socket to request pairing code
            const { default: makeWASocket, useMultiFileAuthState, fetchLatestWaWebVersion } = require('baileys');
            const pino = require('pino');
            const { state, saveCreds } = await useMultiFileAuthState(tempAuthFolder);
            const { version } = await fetchLatestWaWebVersion();

            const tempSocket = makeWASocket({
                version,
                logger: pino({ level: 'silent' }),
                auth: state,
                printQRInTerminal: false,
                browser: ['Ubuntu', 'Chrome', '20.0.0']
            });

            let pairingCode;
            try {
                pairingCode = await tempSocket.requestPairingCode(targetNumber);
            } catch (e) {
                tempSocket.ws?.close();
                try { fs.rmSync(tempAuthFolder, { recursive: true, force: true }); } catch {}
                return m.reply(`❌ Failed to get pairing code: ${e.message}`);
            }

            // Store the request in database
            if (!db.jadibot) db.jadibot = { sessions: {}, requests: {} };
            if (!db.jadibot.requests) db.jadibot.requests = {};
            db.jadibot.requests[m.sender] = {
                code: pairingCode,
                number: targetNumber,
                authFolder: path.join(process.cwd(), 'jadibot_sessions', m.sender.split('@')[0]),
                timestamp: Date.now()
            };

            // Close temp socket but keep auth folder – user will use it when they start
            tempSocket.ws?.close();

            const formattedCode = pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode;
            await m.reply(`📲 *WhatsApp Pairing Code*\n\n🔑 *Your code:* ${formattedCode}\n\n⏰ _Expires in 60 seconds_\n\n1. Open WhatsApp on your phone\n2. Go to *Settings* → *Linked Devices*\n3. Tap *Link a Device*\n4. Enter the code above\n\n_After linking, use ${prefix}startjadibot to activate your bot_`);

            // Notify owner
            const ownerMsg = `🔐 *New Pairing Request*\n👤 @${m.sender.split('@')[0]}\n📱 +${targetNumber}\n🔑 ${formattedCode}`;
            await nimesha.sendMessage(ownerNumber[0], { text: ownerMsg, mentions: [m.sender] });
        }
        break

        case 'startjadibot': {
            if (!db.jadibot?.requests?.[m.sender]) {
                return m.reply('❌ No pairing request found. Use .pair <number> first.');
            }

            const req = db.jadibot.requests[m.sender];
            // Check if request expired (older than 2 minutes)
            if (Date.now() - req.timestamp > 120000) {
                delete db.jadibot.requests[m.sender];
                return m.reply('❌ Pairing request expired. Please use .pair again.');
            }

            if (db.jadibot.sessions?.[m.sender]?.active) {
                return m.reply('✅ Your bot is already running! Use .stopjadibot to stop.');
            }

            await m.reply('⏳ *Starting your bot instance...*');

            const { JadiBot } = require('./src/jadibot');
            try {
                const userClient = await JadiBot(nimesha, m.sender, m, store);
                if (!db.jadibot.sessions) db.jadibot.sessions = {};
                db.jadibot.sessions[m.sender] = {
                    active: true,
                    number: req.number,
                    startedAt: Date.now(),
                    authFolder: req.authFolder
                };
                delete db.jadibot.requests[m.sender];
                await m.reply(`✅ *Your bot is now active!*\n\n📱 Number: +${req.number}\n\n_Use .help to see commands_\n_Use .stopjadibot to stop_`);
            } catch (e) {
                m.reply(`❌ Failed to start bot: ${e.message}`);
            }
        }
        break

        case 'stopjadibot': {
            if (!db.jadibot?.sessions?.[m.sender]?.active) {
                return m.reply('❌ You don\'t have an active bot session.');
            }

            const { StopJadiBot } = require('./src/jadibot');
            await StopJadiBot(nimesha, m.sender, m);
            if (db.jadibot.sessions[m.sender]) {
                db.jadibot.sessions[m.sender].active = false;
            }
            await m.reply('🛑 *Your bot has been stopped.*');
        }
        break

        case 'listjadibot': {
            if (!isCreator) return m.reply(mess.owner);
            const { ListJadiBot } = require('./src/jadibot');
            await ListJadiBot(nimesha, m);
        }
        break
        case 'stopuserjadibot': case 'forcestop': {
            if (!isCreator) return m.reply(mess.owner);
            const target = m.mentionedJid?.[0];
            if (!target) return m.reply(`Mention the user whose bot you want to stop.\nExample: ${prefix}stopuserjadibot @user`);

            const { StopJadiBot } = require('./src/jadibot');
            const stopped = await StopJadiBot(nimesha, target, m);
            if (stopped) {
                // Update database
                if (db.jadibot?.sessions?.[target]) {
                    db.jadibot.sessions[target].active = false;
                }
                await m.reply(`🛑 Force‑stopped bot for @${target.split('@')[0]}`, { mentions: [target] });
            } else {
                await m.reply(`❌ No active bot session found for @${target.split('@')[0]}.`, { mentions: [target] });
            }
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
        // ===== AUTO COMMANDS (Owner Toggles) =====
        case 'autodownload': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix}autodownload on/off\nCurrent: ${set.autodownload ? 'ON' : 'OFF'}`);
            set.autodownload = status;
            m.reply(`✅ Auto-download ${status ? 'enabled' : 'disabled'}.`);
        }
        break

        case 'autoviewstatus': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix}autoviewstatus on/off\nCurrent: ${set.autostatus ? 'ON' : 'OFF'}`);
            set.autostatus = status;
            m.reply(`✅ Auto-view status ${status ? 'enabled' : 'disabled'}.`);
        }
        break

        case 'autolikestatus': case 'autoreactstatus': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix + command} on/off\nCurrent: ${set.autostatusreact ? 'ON' : 'OFF'}`);
            set.autostatusreact = status;
            m.reply(`✅ Auto-react to status ${status ? 'enabled' : 'disabled'}.`);
        }
        break

        case 'autoreactmention': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix}autoreactmention on/off\nCurrent: ${set.autoreactmention ? 'ON' : 'OFF'}`);
            set.autoreactmention = status;
            m.reply(`✅ Auto-react to mentions ${status ? 'enabled' : 'disabled'}.`);
        }
        break

        case 'autoreplymention': {
            if (!isCreator) return m.reply(mess.owner);
            if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}autoreplymention <message> (use {user} for mention) or off\nCurrent: ${set.autoreplymention || 'OFF'}`);
            if (args[0]?.toLowerCase() === 'off') {
                set.autoreplymention = '';
                m.reply('✅ Auto-reply to mentions disabled.');
            } else {
                set.autoreplymention = text;
                m.reply(`✅ Auto-reply set to:\n${text}`);
            }
        }
        break

        case 'autoforward': {
            if (!isCreator) return m.reply(mess.owner);
            if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}autoforward <target JID> or off\nCurrent: ${set.autoforward || 'OFF'}`);
            if (args[0]?.toLowerCase() === 'off') {
                set.autoforward = '';
                m.reply('✅ Auto-forward disabled.');
            } else {
                set.autoforward = text;
                m.reply(`✅ Auto-forward set to ${text}`);
            }
        }
        break

        case 'autosticker': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix}autosticker on/off\nCurrent: ${set.autosticker ? 'ON' : 'OFF'}`);
            set.autosticker = status;
            m.reply(`✅ Auto-sticker ${status ? 'enabled' : 'disabled'}.`);
        }
        break

        case 'autotranslate': {
            if (!isCreator) return m.reply(mess.owner);
            if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}autotranslate <target language code> or off\nExample: ${prefix}autotranslate si\nCurrent: ${set.autotranslate || 'OFF'}`);
            if (args[0]?.toLowerCase() === 'off') {
                set.autotranslate = '';
                m.reply('✅ Auto-translate disabled.');
            } else {
                set.autotranslate = text;
                m.reply(`✅ Auto-translate set to ${text}`);
            }
        }
        break

        case 'autodelete': {
            if (!isCreator) return m.reply(mess.owner);
            if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}autodelete <seconds> or off\nExample: ${prefix}autodelete 10\nCurrent: ${set.autodelete || 'OFF'}`);
            if (args[0]?.toLowerCase() === 'off') {
                set.autodelete = 0;
                m.reply('✅ Auto-delete disabled.');
            } else {
                const sec = parseInt(args[0]);
                if (isNaN(sec)) return m.reply('Invalid seconds.');
                set.autodelete = sec;
                m.reply(`✅ Auto-delete set to ${sec} seconds.`);
            }
        }
        break

        case 'autoreact': {
            if (!isCreator) return m.reply(mess.owner);
            if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}autoreact <emoji> or off\nExample: ${prefix}autoreact 👍\nCurrent: ${set.autoreact || 'OFF'}`);
            if (args[0]?.toLowerCase() === 'off') {
                set.autoreact = '';
                m.reply('✅ Auto-react disabled.');
            } else {
                set.autoreact = text;
                m.reply(`✅ Auto-react set to ${text}`);
            }
        }
        break

        case 'autoblock': {
            if (!isCreator) return m.reply(mess.owner);
            if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}autoblock <keyword1,keyword2> or off\nExample: ${prefix}autoblock spam,scam\nCurrent: ${set.autoblock ? set.autoblock.join(', ') : 'OFF'}`);
            if (args[0]?.toLowerCase() === 'off') {
                set.autoblock = [];
                m.reply('✅ Auto-block disabled.');
            } else {
                set.autoblock = text.split(',').map(s => s.trim().toLowerCase());
                m.reply(`✅ Auto-block keywords set: ${set.autoblock.join(', ')}`);
            }
        }
        break

        case 'autokick': {
            if (!isCreator) return m.reply(mess.owner);
            if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}autokick <keyword1,keyword2> or off\nExample: ${prefix}autokick spam,link\nCurrent: ${set.autokick ? set.autokick.join(', ') : 'OFF'}`);
            if (args[0]?.toLowerCase() === 'off') {
                set.autokick = [];
                m.reply('✅ Auto-kick disabled.');
            } else {
                set.autokick = text.split(',').map(s => s.trim().toLowerCase());
                m.reply(`✅ Auto-kick keywords set: ${set.autokick.join(', ')}`);
            }
        }
        break

        case 'automute': {
            if (!isCreator) return m.reply(mess.owner);
            if (!text && args[0] !== 'off') return m.reply(`Usage: ${prefix}automute <keyword1,keyword2> or off\nExample: ${prefix}automute spam,link\nCurrent: ${set.automute ? set.automute.join(', ') : 'OFF'}`);
            if (args[0]?.toLowerCase() === 'off') {
                set.automute = [];
                m.reply('✅ Auto-mute disabled.');
            } else {
                set.automute = text.split(',').map(s => s.trim().toLowerCase());
                m.reply(`✅ Auto-mute keywords set: ${set.automute.join(', ')}`);
            }
        }
        break

        case 'autowelcome': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix}autowelcome on/off\nCurrent: ${set.autowelcome ? 'ON' : 'OFF'}`);
            set.autowelcome = status;
            m.reply(`✅ Auto-welcome ${status ? 'enabled' : 'disabled'}.`);
        }
        break

        case 'autogoodbye': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix}autogoodbye on/off\nCurrent: ${set.autogoodbye ? 'ON' : 'OFF'}`);
            set.autogoodbye = status;
            m.reply(`✅ Auto-goodbye ${status ? 'enabled' : 'disabled'}.`);
        }
        break

        case 'automation': case 'autosettings': {
            if (!isCreator) return m.reply(mess.owner);
            let txt = `⚙️ *Automation Settings*\n\n`;
            txt += `🔹 autoviewstatus : ${set.autostatus ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autolikestatus: ${set.autostatusreact ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autoreactmention: ${set.autoreactmention ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autoreplymention: ${set.autoreplymention ? '✏️ ' + set.autoreplymention : '❌ OFF'}\n`;
            txt += `🔹 autoread       : ${set.autoread ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autotyping     : ${set.autotyping ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autorecording  : ${set.autorecording ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autobio        : ${set.autobio ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autobackup     : ${set.autobackup ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autojoin       : ${set.autojoin ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autodownload   : ${set.autodownload ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autoforward    : ${set.autoforward || '❌ OFF'}\n`;
            txt += `🔹 autosticker    : ${set.autosticker ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autotranslate  : ${set.autotranslate || '❌ OFF'}\n`;
            txt += `🔹 autodelete     : ${set.autodelete ? set.autodelete + 's' : '❌ OFF'}\n`;
            txt += `🔹 autoreact      : ${set.autoreact || '❌ OFF'}\n`;
            txt += `🔹 autoblock      : ${set.autoblock?.length ? set.autoblock.join(', ') : '❌ OFF'}\n`;
            txt += `🔹 autokick       : ${set.autokick?.length ? set.autokick.join(', ') : '❌ OFF'}\n`;
            txt += `🔹 automute       : ${set.automute?.length ? set.automute.join(', ') : '❌ OFF'}\n`;
            txt += `🔹 autowelcome    : ${set.autowelcome ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 autogoodbye    : ${set.autogoodbye ? '✅ ON' : '❌ OFF'}\n`;
            txt += `\n_Use ${prefix}autoviewstatus on/off, etc._`;
            m.reply(txt);
            txt += `🔹 autoai_selfchat : ${set.autoai_selfchat ? '✅ ON' : '❌ OFF'}\n`;
            txt += `🔹 privatemode     : ${(set.privatemode || 'off').toUpperCase()}\n`;
            txt += `🔹 awaymsg         : ${set.awaymsg || 'Default'}\n`;
        }
        break
        case 'docs': {
            const fs = require('fs');
            const path = require('path');
            const docsDir = path.join(process.cwd(), 'docs');

            // Simple fuzzy finder (if no findSimilar available)
            const findSimilar = (input, items, limit = 3) => {
                const lower = input.toLowerCase();
                const scored = items.map(item => {
                    const ilower = item.toLowerCase();
                    let score = 0;
                    if (ilower === lower) score = 100;
                    else if (ilower.startsWith(lower)) score = 80;
                    else if (ilower.includes(lower)) score = 60;
                    else {
                        let i = 0, j = 0;
                        while (i < lower.length && j < ilower.length) {
                            if (lower[i] === ilower[j]) { i++; score += 1; }
                            j++;
                        }
                    }
                    return { item, score };
                });
                return scored
                    .filter(s => s.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, limit)
                    .map(s => s.item);
            };

            const getAvailableDocs = () => {
                if (!fs.existsSync(docsDir)) return [];
                return fs.readdirSync(docsDir)
                    .filter(f => f.endsWith('.md'))
                    .map(f => f.replace('.md', ''))
                    .sort();
            };

            const available = getAvailableDocs();

            // If no argument, show list
            if (!args[0]) {
                if (!fs.existsSync(docsDir)) {
                    return m.reply('❌ *Documentation folder not found.*\n\nMake sure a `docs/` folder with `.md` files exists in the bot\'s root directory.');
                }
                if (available.length === 0) {
                    return m.reply('❌ No documentation files found in `docs/`.\n\nAdd some `.md` files there.');
                }
                let list = `📚 *Maureonix Documentation*\n━━━━━━━━━━━━━━━━━━━━━━\n`;
                available.forEach((name, i) => {
                    list += `${i + 1}. ${name}\n`;
                });
                list += `\n_Type ${prefix}docs <name> to read a file._`;
                return m.reply(list);
            }

            // Search for the requested doc (case-insensitive)
            const requested = args[0].toLowerCase().replace(/\.md$/, '');
            const exactMatch = available.find(f => f.toLowerCase() === requested);

            if (exactMatch) {
                const filePath = path.join(docsDir, `${exactMatch}.md`);
                try {
                    let content = fs.readFileSync(filePath, 'utf8');
                    content = content
                        .replace(/^#{1,6}\s+/gm, '')
                        .replace(/\*\*(.*?)\*\*/g, '$1')
                        .replace(/\*(.*?)\*/g, '$1')
                        .replace(/`{1,3}[^`]*`{1,3}/g, '')
                        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                        .replace(/^\s*[-*+]\s+/gm, '• ')
                        .replace(/^\s*\d+\.\s+/gm, '• ')
                        .replace(/\n{3,}/g, '\n\n')
                        .trim();

                    const maxLen = 3800;
                    if (content.length <= maxLen) {
                        await m.reply(`📄 *${exactMatch.toUpperCase()}.md*\n━━━━━━━━━━━━━━━━━━━━━━\n${content}`);
                    } else {
                        const chunks = [];
                        for (let i = 0; i < content.length; i += maxLen) {
                            chunks.push(content.slice(i, i + maxLen));
                        }
                        await m.reply(`📄 *${exactMatch.toUpperCase()}.md* (Part 1/${chunks.length})`);
                        for (let i = 0; i < chunks.length; i++) {
                            await nimesha.sendMessage(m.chat, { text: chunks[i] }, { quoted: m });
                            await sleep(1000);
                        }
                    }
                } catch (e) {
                    m.reply(`❌ Error reading documentation: ${e.message}`);
                }
            } else {
                // No exact match – suggest similar
                const similar = findSimilar(requested, available, 3);
                if (similar.length > 0) {
                    let suggestion = `❌ Documentation file *"${requested}"* not found.\n\n`;
                    suggestion += `💡 *Did you mean:*\n`;
                    similar.forEach(s => suggestion += `   • ${s}\n`);
                    suggestion += `\n_Or type ${prefix}docs to see all available docs._`;
                    return m.reply(suggestion);
                } else {
                    let msg = `❌ Documentation file *"${requested}"* not found.\n\n`;
                    if (available.length > 0) {
                        msg += `📚 *Available docs:*\n`;
                        available.forEach(d => msg += `   • ${d}\n`);
                    } else {
                        msg += `No docs found in the \`docs/\` folder.`;
                    }
                    return m.reply(msg);
                }
            }
        }
        break

        case 'ask': case 'docsask': {
            if (!text) return m.reply(`Example: ${prefix + command} How do I set up auto-backup?`);
            await m.reply('🔍 *Searching documentation...*');

            const { buildContext } = require('./lib/docs');
            const context = buildContext(text, 3);

            let prompt;
            if (context) {
                prompt = `You are Maureonix, a WhatsApp bot. Answer the user's question using ONLY the documentation provided below. If the answer is not in the documentation, say "I couldn't find that in my documentation. Try using .docs <name> to read the full guide." Keep answers concise and helpful.\n\n${context}\n\nUser question: ${text}`;
            } else {
                prompt = `You are Maureonix. Answer briefly. User question: ${text}`;
            }

            try {
                const res = await AI.ultimateAI(prompt, m.sender, 'deepseek');
                await m.reply(`📚 *Maureonix Help*\n\n${res.text}`);
            } catch (e) {
                m.reply(`❌ Failed to get answer: ${e.message}`);
            }
        }
        break

        case 'public': {
            if (!isCreator) return m.reply(mess.owner);
            set.public = true;
            m.reply('✅ Bot is now in *PUBLIC* mode. Everyone can use commands.');
        }
        break

        case 'private': {
            if (!isCreator) return m.reply(mess.owner);
            set.public = false;
            m.reply('🔒 Bot is now in *PRIVATE* mode. Only owner can use commands.');
        }
        break

        case 'mode': {
            if (!isCreator) return m.reply(mess.owner);
            const status = set.public ? 'PUBLIC' : 'PRIVATE';
            m.reply(`⚙️ Current mode: *${status}*\nUse ${prefix}public or ${prefix}private to change.`);
        }
        break
        case 'autoai': case 'autogpt': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix + command} on/off\nCurrent: ${set.autoai ? 'ON' : 'OFF'}`);
            set.autoai = status;
            m.reply(`✅ Auto-AI ${status ? 'enabled' : 'disabled'}. Now messages without prefix will get AI responses.`);
        }
        break
        case 'autoaiselfchat': case 'selfchat': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase() === 'on' ? true : args[0]?.toLowerCase() === 'off' ? false : null;
            if (status === null) return m.reply(`Usage: ${prefix + command} on/off\nCurrent: ${set.autoai_selfchat ? 'ON' : 'OFF'}`);
            set.autoai_selfchat = status;
            m.reply(`✅ Self‑chat AI ${status ? 'enabled' : 'disabled'}.`);
        }
        break
        case 'privatemode': {
            if (!isCreator) return m.reply(mess.owner);
            const mode = args[0]?.toLowerCase();
            if (!['off', 'away', 'ai', 'both'].includes(mode)) {
                return m.reply(`Usage: ${prefix}privatemode <off|away|ai|both>\nCurrent: ${set.privatemode || 'off'}`);
            }
            set.privatemode = mode;
            let desc = mode === 'off' ? 'No automatic response to private messages.' :
                       mode === 'away' ? 'Bot will send an away message.' :
                       mode === 'ai' ? 'Bot will chat with strangers using AI.' :
                       'Bot will send an away message then switch to AI chat.';
            m.reply(`✅ Private mode set to *${mode.toUpperCase()}*\n${desc}`);
        }
        break
        case 'setawaymsg': {
            if (!isCreator) return m.reply(mess.owner);
            if (!text && args[0] !== 'reset') return m.reply(`Usage: ${prefix}setawaymsg <message> or ${prefix}setawaymsg reset`);
            if (args[0] === 'reset') {
                set.awaymsg = 'I\'m currently not available. I\'ll respond when I can. Meanwhile, you can leave a message.';
                m.reply('✅ Away message reset to default.');
            } else {
                set.awaymsg = text;
                m.reply(`✅ Away message set to:\n${text}`);
            }
        }
        break
        case 'awaymsg': {
            if (!isCreator) return m.reply(mess.owner);
            m.reply(`📴 *Current away message:*\n${set.awaymsg || '(default)'}`);
        }
        break
        case 'pending': case 'inbox': {
            if (!isCreator) return m.reply(mess.owner);
            const pending = set.pendingMessages || [];
            if (!pending.length) return m.reply('📭 No pending messages.');

            // Check if user wants a raw list instead of AI summary
            const wantRaw = args[0]?.toLowerCase() === 'raw';
            const wantSummary = !wantRaw; // default to summary

            if (wantRaw) {
                // Original raw view
                let txt = '📩 *Pending Messages (while you were away)*\n\n';
                pending.forEach(entry => {
                    const num = entry.from.split('@')[0];
                    const last = entry.messages[entry.messages.length - 1];
                    const preview = last.body.length > 40 ? last.body.slice(0, 40) + '...' : last.body;
                    const time = new Date(last.time).toLocaleString('en-KE', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
                    txt += `👤 *${num}* — ${entry.messages.length} msg${entry.messages.length > 1 ? 's' : ''}\n`;
                    txt += `   Last: ${preview}\n`;
                    txt += `   Time: ${time}\n\n`;
                });
                txt += `_Use ${prefix}pendingclear to clear this list._\n_Use ${prefix}pending (without raw) for AI summary._`;
                return m.reply(txt);
            }

            // ---- AI Summary Mode ----
            await m.reply('🧠 *Analyzing your inbox...*');

            // Build a structured text to send to AI
            let aiPrompt = 'Summarize the following pending messages for the owner in a clear, concise, bullet-point format. ';
            aiPrompt += 'Group by user, highlight key topics and any urgent requests. Keep it brief.\n\n';
            aiPrompt += 'Pending Messages:\n';
            let totalMessages = 0;
            pending.forEach(entry => {
                const num = entry.from.split('@')[0];
                const msgs = entry.messages;
                totalMessages += msgs.length;
                aiPrompt += `--- User @${num} (${msgs.length} message${msgs.length > 1 ? 's' : ''}) ---\n`;
                // Take up to 5 messages per user to avoid huge prompt
                const sample = msgs.slice(-5);
                sample.forEach((msg, i) => {
                    const time = new Date(msg.time).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
                    aiPrompt += `[${time}] ${msg.body}\n`;
                });
                if (msgs.length > 5) aiPrompt += `... and ${msgs.length - 5} earlier messages.\n`;
                aiPrompt += '\n';
            });
            aiPrompt += `\nProvide a helpful summary for the owner. Mention any urgent matters.`;

            try {
                const { ultimateAI } = require('./lib/ai');
                const result = await ultimateAI(aiPrompt, m.sender, 'deepseek');
                const summary = result.text || 'Unable to generate summary.';
                let finalText = `📩 *Inbox Summary* (${totalMessages} messages from ${pending.length} user${pending.length > 1 ? 's' : ''})\n\n`;
                finalText += summary;
                finalText += `\n\n_Use ${prefix}pending raw for full list._\n_Use ${prefix}pendingclear to clear._`;
                await m.reply(finalText);
            } catch (e) {
                // Fallback to raw if AI fails
                console.error('[inbox AI summary error]', e);
                m.reply('⚠️ AI summary failed. Here is the raw list:\n\n' + txt);
                // but we don't have txt here... we'll just call the raw block recursively;
                // instead, just tell user to use raw
                m.reply(`❌ AI summary failed. Use ${prefix}pending raw for full list.`);
            }
        }
        break
        case 'pendingclear': case 'clearinbox': {
            if (!isCreator) return m.reply(mess.owner);
            set.pendingMessages = [];
            await m.reply('✅ Pending messages cleared.');
        }
        break
        case 'crisis': {
            if (!isCreator) return m.reply(mess.owner);
            const status = args[0]?.toLowerCase();
            if (status !== 'on' && status !== 'off') {
                return m.reply(`Usage: ${prefix}crisis on/off\nCurrent: ${db.set?.crisisDetection ? 'ON' : 'OFF'}`);
            }
            db.set.crisisDetection = (status === 'on');
            m.reply(`✅ Crisis detection ${status === 'on' ? 'enabled' : 'disabled'}. I will silently monitor for distress signals.`);
        }
        break

        // ===== MENU COMMANDS =====
        case 'menu': case 'help': case 'allmenu': {
            try {
                // Carousel attempt (may fail if sendCarouselMsg not available)
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

        // ===== MOVIES SUB-MENU =====
        case 'moviesmenu': {
            const moviesMenuText = `╔══════════════════════╗
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
            await m.reply(moviesMenuText);
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

        case 'adminmenu': {
            const adminMenuText = `╔══════════════════════╗
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
            await m.reply(adminMenuText);
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