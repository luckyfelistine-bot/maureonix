// commands/fun.js – Jokes, memes, games, reactions, overlays
const { pickRandom } = require('../lib/function');
const { generateTextArt, imageOverlay } = require('./_utils');

module.exports = {
    joke: async (nimesha, m, { Fun }) => {
        try {
            const fetch = require('node-fetch');
            const url = 'https://official-joke-api.appspot.com/random_joke';
            const res = await fetch(url);
            const json = await res.json();
            await m.reply(`😂 *Joke*\n\n${json.setup}\n\n${json.punchline}`);
        } catch (e) {
            try { const res = await Fun.joke(); await m.reply(res); } catch (e2) { m.reply('❌ Joke failed: ' + e.message); }
        }
    },
    meme: async (nimesha, m, { Fun }) => {
        try {
            const fetch = require('node-fetch');
            const url = 'https://meme-api.com/gimme';
            const res = await fetch(url);
            const json = await res.json();
            if (json.url) await nimesha.sendMessage(m.chat, { image: { url: json.url }, caption: `${json.title}\n📁 r/${json.subreddit}` }, { quoted: m });
            else throw new Error('No meme found');
        } catch (e) {
            try {
                const res = await Fun.meme();
                await nimesha.sendMessage(m.chat, { image: { url: res.image }, caption: `${res.caption}\n📁 r/${res.subreddit}` }, { quoted: m });
            } catch (e2) { m.reply('❌ Meme failed: ' + e.message); }
        }
    },
    quote: async (nimesha, m, { Fun }) => {
        try {
            const fetch = require('node-fetch');
            const url = 'https://api.quotable.io/random';
            const res = await fetch(url);
            const json = await res.json();
            await m.reply(`💬 *Quote*\n\n"${json.content}"\n\n— ${json.author}`);
        } catch (e) {
            try { const res = await Fun.quote(); await m.reply(res); } catch (e2) { m.reply('❌ Quote failed: ' + e.message); }
        }
    },
    fact: async (nimesha, m, { Fun }) => {
        try {
            const fetch = require('node-fetch');
            const url = 'https://uselessfacts.jsph.pl/random.json?language=en';
            const res = await fetch(url);
            const json = await res.json();
            await m.reply(`🤓 *Random Fact*\n\n${json.text}`);
        } catch (e) {
            try { const res = await Fun.fact(); await m.reply(res); } catch (e2) { m.reply('❌ Fact failed: ' + e.message); }
        }
    },
    ship: async (nimesha, m, { args, prefix, command }) => {
        if (args.length < 2) return m.reply(`Example: ${prefix + command} @user1 @user2`);
        const percent = Math.floor(Math.random() * 100);
        const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));
        await m.reply(`💘 *Ship Meter*\n\n@${args[0].split('@')[0]} ❤️ @${args[1].split('@')[0]}\n\n${bar} ${percent}%\n\n${percent > 80 ? '🔥 Perfect match!' : percent > 50 ? '💕 Good compatibility' : '💔 Maybe not...'}`);
    },
    wyr: async (nimesha, m, { Fun }) => {
        try {
            const fetch = require('node-fetch');
            const url = 'https://would-you-rather-api.abaanshanid.repl.co/';
            const res = await fetch(url);
            const json = await res.json();
            await m.reply(`🤔 *Would You Rather*\n\n${json.data || json.question || 'No question found'}`);
        } catch (e) {
            try { const res = await Fun.wouldYouRather(); await m.reply(res); } catch (e2) { m.reply('❌ WYR failed: ' + e.message); }
        }
    },
    '8ball': async (nimesha, m, { text }) => {
        if (!text) return m.reply('Ask a question');
        const answers = ['Yes', 'No', 'Maybe', 'Definitely', 'Absolutely not', 'Ask again later', 'Most likely', 'Very doubtful', 'Without a doubt', 'Better not tell you now'];
        await m.reply(`🎲 *8Ball*\nQ: ${text}\nA: ${pickRandom(answers)}`);
    },
    roll: async (nimesha, m, { args }) => {
        const sides = parseInt(args[0]) || 6;
        const result = Math.floor(Math.random() * sides) + 1;
        await m.reply(`🎲 *Rolled:* ${result} (1-${sides})`);
    },
    flip: async (nimesha, m) => {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        await m.reply(`🪙 *Coin Flip:* ${result}`);
    },
    roast: async (nimesha, m) => {
        const roasts = ["You're like a cloud. When you disappear, it's a beautiful day.", "I'm not saying I hate you, but I would unplug your life support to charge my phone.", "You're the reason the gene pool needs a lifeguard.", "If laughter is the best medicine, your face must be curing the world.", "You're not stupid; you just have bad luck thinking."];
        await m.reply(`🔥 ${pickRandom(roasts)}`);
    },
    compliment: async (nimesha, m) => {
        const compliments = ["You're an awesome friend.", "You're a gift to those around you.", "You're a smart cookie.", "You are awesome!", "You have impeccable manners.", "I like your style.", "You have the best laugh.", "I appreciate you.", "You are the most perfect you there is.", "You are enough."];
        if (m.quoted) await m.reply(`🌟 @${m.quoted.sender.split('@')[0]}, ${pickRandom(compliments)}`, { mentions: [m.quoted.sender] });
        else await m.reply(`🌟 ${pickRandom(compliments)}`);
    },
    truth: async (nimesha, m) => {
        const truths = ["What's the last lie you told?", "What was the most embarrassing thing you've done?", "What's your biggest fear?", "What's one secret you've never told anyone?", "What's the worst thing you've ever done?", "Who was your first crush?", "What's the strangest dream you've had?", "What's your biggest regret?", "What's the most childish thing you still do?", "Have you ever cheated on a test?"];
        await m.reply(`🎯 *Truth:*\n${pickRandom(truths)}`);
    },
    dare: async (nimesha, m) => {
        const dares = ["Do 20 pushups.", "Sing a song for 30 seconds.", "Dance without music for 1 minute.", "Let someone tickle you for 10 seconds.", "Eat a spoonful of hot sauce.", "Talk in an accent for the next 3 rounds.", "Do your best impression of a celebrity.", "Let the group post something on your social media.", "Wear your clothes backward for the next hour.", "Try to lick your elbow."];
        await m.reply(`😈 *Dare:*\n${pickRandom(dares)}`);
    },
    bisakah: async (nimesha, m, { text, command }) => {
        if (!text) return m.reply('Ask a question!');
        const answers = ['Yes', 'No', 'Maybe', 'Definitely', 'Absolutely not', 'Ask again later'];
        await m.reply(`🎲 *${command.charAt(0).toUpperCase() + command.slice(1)}*\nQ: ${text}\nA: ${pickRandom(answers)}`);
    },
    // Anime reactions
    neko: async (nimesha, m, { command }) => {
        try {
            const fetch = require('node-fetch');
            const res = await fetch(`https://nekos.best/api/v2/${command}`).catch(() => null);
            const data = await res?.json();
            const gifUrl = data?.results?.[0]?.url;
            if (gifUrl) await nimesha.sendMessage(m.chat, { video: { url: gifUrl }, gifPlayback: true, caption: `*${command.toUpperCase()}*` }, { quoted: m });
            else throw new Error('No GIF');
        } catch (e) {
            try {
                const fetch = require('node-fetch');
                const endpoints = { neko: 'neko', waifu: 'waifu', hug: 'hug', kiss: 'kiss', pat: 'pat', cry: 'cry', slap: 'slap', dance: 'dance', happy: 'happy', blush: 'blush', wink: 'wink' };
                const endpoint = endpoints[command] || 'waifu';
                const res = await fetch(`https://api.waifu.pics/sfw/${endpoint}`);
                const json = await res.json();
                if (json.url) await nimesha.sendMessage(m.chat, { video: { url: json.url }, gifPlayback: true, caption: `*${command.toUpperCase()}*` }, { quoted: m });
            } catch (e2) { m.reply(`❌ Could not fetch ${command} GIF.`); }
        }
    },
    waifu: async (nimesha, m, ctx) => { await module.exports.neko(nimesha, m, ctx); },
    hug: async (nimesha, m, ctx) => { await module.exports.neko(nimesha, m, ctx); },
    kiss: async (nimesha, m, ctx) => { await module.exports.neko(nimesha, m, ctx); },
    pat: async (nimesha, m, ctx) => { await module.exports.neko(nimesha, m, ctx); },
    wink: async (nimesha, m, ctx) => { await module.exports.neko(nimesha, m, ctx); },
    cry: async (nimesha, m, ctx) => { await module.exports.neko(nimesha, m, ctx); },
    slap: async (nimesha, m, ctx) => { await module.exports.neko(nimesha, m, ctx); },
    dance: async (nimesha, m, ctx) => { await module.exports.neko(nimesha, m, ctx); },
    happy: async (nimesha, m, ctx) => { await module.exports.neko(nimesha, m, ctx); },
    blush: async (nimesha, m, ctx) => { await module.exports.neko(nimesha, m, ctx); },
    facepalm: async (nimesha, m, ctx) => { await module.exports.neko(nimesha, m, ctx); },
    nom: async (nimesha, m, ctx) => { await module.exports.neko(nimesha, m, ctx); },
    poke: async (nimesha, m, ctx) => { await module.exports.neko(nimesha, m, ctx); },
    punch: async (nimesha, m, ctx) => { await module.exports.neko(nimesha, m, ctx); },
    loli: async (nimesha, m, ctx) => { await module.exports.neko(nimesha, m, ctx); },
    // Text effects
    metallic: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'metallic', ctx.text, ctx.prefix); },
    ice: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'ice', ctx.text, ctx.prefix); },
    snow: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'snow', ctx.text, ctx.prefix); },
    impressive: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'impressive', ctx.text, ctx.prefix); },
    matrix: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'matrix', ctx.text, ctx.prefix); },
    light: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'light', ctx.text, ctx.prefix); },
    neon: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'neon', ctx.text, ctx.prefix); },
    devil: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'devil', ctx.text, ctx.prefix); },
    purple: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'purple', ctx.text, ctx.prefix); },
    thunder: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'thunder', ctx.text, ctx.prefix); },
    leaves: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'leaves', ctx.text, ctx.prefix); },
    '1917': async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, '1917', ctx.text, ctx.prefix); },
    arena: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'arena', ctx.text, ctx.prefix); },
    hacker: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'hacker', ctx.text, ctx.prefix); },
    sand: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'sand', ctx.text, ctx.prefix); },
    blackpink: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'blackpink', ctx.text, ctx.prefix); },
    glitch: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'glitch', ctx.text, ctx.prefix); },
    fire: async (nimesha, m, ctx) => { await generateTextArt(nimesha, m, 'fire', ctx.text, ctx.prefix); },
    // Meme overlays
    oogway: async (nimesha, m, { text, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <quote>`);
        try {
            const fetch = require('node-fetch');
            const url = `https://api.popcat.xyz/oogway?text=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            const buffer = await res.buffer();
            await nimesha.sendMessage(m.chat, { image: buffer, caption: `🐢 *Oogway says:*\n"${text}"` }, { quoted: m });
        } catch (e) { await m.reply(`🐢 *Oogway says:*\n"${text}"`); }
    },
    tweet: async (nimesha, m, { text, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <tweet text>`);
        const username = m.pushName || 'User';
        try {
            const fetch = require('node-fetch');
            const url = `https://api.popcat.xyz/tweet?username=${encodeURIComponent(username)}&text=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            const buffer = await res.buffer();
            await nimesha.sendMessage(m.chat, { image: buffer, caption: `🐦 *Tweet*\n@${username}: ${text}` }, { quoted: m });
        } catch (e) { await m.reply(`🐦 *@${username}:* ${text}`); }
    },
    ytcomment: async (nimesha, m, { text, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <comment>`);
        const username = m.pushName || 'User';
        try {
            const fetch = require('node-fetch');
            const ppUrl = await nimesha.profilePictureUrl(m.sender, 'image').catch(() => 'https://i.imgur.com/default.png');
            const url = `https://api.popcat.xyz/youtubecomment?username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(ppUrl)}&comment=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            const buffer = await res.buffer();
            await nimesha.sendMessage(m.chat, { image: buffer, caption: `💬 *YouTube Comment*\n${username}: ${text}` }, { quoted: m });
        } catch (e) { await m.reply(`💬 *YouTube Comment*\n👤 ${username}: ${text}`); }
    },
    jail: async (nimesha, m) => { await imageOverlay(nimesha, m, 'jail', '🚔'); },
    triggered: async (nimesha, m) => { await imageOverlay(nimesha, m, 'triggered', '😤'); },
    namecard: async (nimesha, m, { text }) => {
        const name = m.pushName || text || 'User';
        try {
            const fetch = require('node-fetch');
            const url = `https://api.popcat.xyz/welcomecard?background=https://cdn.popcat.xyz/welcome-bg.png&text1=${encodeURIComponent(name)}&text2=WhatsApp%20User&text3=Member%20%231&avatar=${encodeURIComponent(await nimesha.profilePictureUrl(m.sender, 'image').catch(() => 'https://i.imgur.com/default.png'))}`;
            const res = await fetch(url);
            const buffer = await res.buffer();
            await nimesha.sendMessage(m.chat, { image: buffer, caption: `🪪 *Name Card*\n👤 ${name}` }, { quoted: m });
        } catch (e) { await m.reply(`🪪 *Name Card*\n👤 *Name:* ${name}\n📱 *Number:* +${m.sender.split('@')[0]}`); }
    },
    heart: async (nimesha, m) => { await imageOverlay(nimesha, m, 'heart', '❤️'); },
    circle: async (nimesha, m) => { await imageOverlay(nimesha, m, 'circle', '🕊️'); },
    lgbt: async (nimesha, m) => { await imageOverlay(nimesha, m, 'rainbow', '🏳️‍🌈'); },
    horny: async (nimesha, m) => { await imageOverlay(nimesha, m, 'horny', '😏'); },
    lolice: async (nimesha, m) => { await imageOverlay(nimesha, m, 'lolice', '👮'); },
    gay: async (nimesha, m) => { await imageOverlay(nimesha, m, 'gay', '🌈'); },
    glass: async (nimesha, m) => { await imageOverlay(nimesha, m, 'glass', '👓'); },
    passed: async (nimesha, m) => { await imageOverlay(nimesha, m, 'passed', '✅'); },
    'its-so-stupid': async (nimesha, m) => { await imageOverlay(nimesha, m, 'its-so-stupid', '😆'); },
    comrade: async (nimesha, m) => { await imageOverlay(nimesha, m, 'communist', '☭'); },
    funmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *😂 FUN COMMANDS*  ║\n╚══════════════════════╝\n\n📌 *Random Fun*\n▸ ${prefix}joke – Random joke\n▸ ${prefix}meme – Random meme\n▸ ${prefix}quote – Inspirational quote\n▸ ${prefix}fact – Random fact\n\n📌 *Interactive*\n▸ ${prefix}8ball <question>\n▸ ${prefix}roast @user\n▸ ${prefix}compliment @user\n▸ ${prefix}ship @user1 @user2\n▸ ${prefix}truth – Truth question\n▸ ${prefix}dare – Dare challenge\n▸ ${prefix}bisakah <question>\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },
    // Aliases
    '8b': async (nimesha, m, ctx) => { await module.exports['8ball'](nimesha, m, ctx); },
    wouldyourather: async (nimesha, m, ctx) => { await module.exports.wyr(nimesha, m, ctx); },
};