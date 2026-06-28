// commands/fun.js – Jokes, memes, games, reactions, overlays
const { pickRandom } = require('../lib/function');
const { generateTextArt, imageOverlay } = require('./_utils');

module.exports = {
    joke: async (maureonix, m, { Fun }) => {
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
    meme: async (maureonix, m, { Fun }) => {
        try {
            const fetch = require('node-fetch');
            const url = 'https://meme-api.com/gimme';
            const res = await fetch(url);
            const json = await res.json();
            if (json.url) await maureonix.sendMessage(m.chat, { image: { url: json.url }, caption: `${json.title}\n📁 r/${json.subreddit}` }, { quoted: m });
            else throw new Error('No meme found');
        } catch (e) {
            try {
                const res = await Fun.meme();
                await maureonix.sendMessage(m.chat, { image: { url: res.image }, caption: `${res.caption}\n📁 r/${res.subreddit}` }, { quoted: m });
            } catch (e2) { m.reply('❌ Meme failed: ' + e.message); }
        }
    },
    quote: async (maureonix, m, { Fun }) => {
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
    fact: async (maureonix, m, { Fun }) => {
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
    ship: async (maureonix, m, { args, prefix, command }) => {
        if (args.length < 2) return m.reply(`Example: ${prefix + command} @user1 @user2`);
        const percent = Math.floor(Math.random() * 100);
        const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));
        await m.reply(`💘 *Ship Meter*\n\n@${args[0].split('@')[0]} ❤️ @${args[1].split('@')[0]}\n\n${bar} ${percent}%\n\n${percent > 80 ? '🔥 Perfect match!' : percent > 50 ? '💕 Good compatibility' : '💔 Maybe not...'}`);
    },
    wyr: async (maureonix, m, { Fun }) => {
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
    '8ball': async (maureonix, m, { text }) => {
        if (!text) return m.reply('Ask a question');
        const answers = ['Yes', 'No', 'Maybe', 'Definitely', 'Absolutely not', 'Ask again later', 'Most likely', 'Very doubtful', 'Without a doubt', 'Better not tell you now'];
        await m.reply(`🎲 *8Ball*\nQ: ${text}\nA: ${pickRandom(answers)}`);
    },
    roll: async (maureonix, m, { args }) => {
        const sides = parseInt(args[0]) || 6;
        const result = Math.floor(Math.random() * sides) + 1;
        await m.reply(`🎲 *Rolled:* ${result} (1-${sides})`);
    },
    flip: async (maureonix, m) => {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        await m.reply(`🪙 *Coin Flip:* ${result}`);
    },
    roast: async (maureonix, m) => {
        const roasts = ["You're like a cloud. When you disappear, it's a beautiful day.", "I'm not saying I hate you, but I would unplug your life support to charge my phone.", "You're the reason the gene pool needs a lifeguard.", "If laughter is the best medicine, your face must be curing the world.", "You're not stupid; you just have bad luck thinking."];
        await m.reply(`🔥 ${pickRandom(roasts)}`);
    },
    compliment: async (maureonix, m) => {
        const compliments = ["You're an awesome friend.", "You're a gift to those around you.", "You're a smart cookie.", "You are awesome!", "You have impeccable manners.", "I like your style.", "You have the best laugh.", "I appreciate you.", "You are the most perfect you there is.", "You are enough."];
        if (m.quoted) await m.reply(`🌟 @${m.quoted.sender.split('@')[0]}, ${pickRandom(compliments)}`, { mentions: [m.quoted.sender] });
        else await m.reply(`🌟 ${pickRandom(compliments)}`);
    },
    truth: async (maureonix, m) => {
        const truths = ["What's the last lie you told?", "What was the most embarrassing thing you've done?", "What's your biggest fear?", "What's one secret you've never told anyone?", "What's the worst thing you've ever done?", "Who was your first crush?", "What's the strangest dream you've had?", "What's your biggest regret?", "What's the most childish thing you still do?", "Have you ever cheated on a test?"];
        await m.reply(`🎯 *Truth:*\n${pickRandom(truths)}`);
    },
    dare: async (maureonix, m) => {
        const dares = ["Do 20 pushups.", "Sing a song for 30 seconds.", "Dance without music for 1 minute.", "Let someone tickle you for 10 seconds.", "Eat a spoonful of hot sauce.", "Talk in an accent for the next 3 rounds.", "Do your best impression of a celebrity.", "Let the group post something on your social media.", "Wear your clothes backward for the next hour.", "Try to lick your elbow."];
        await m.reply(`😈 *Dare:*\n${pickRandom(dares)}`);
    },
    bisakah: async (maureonix, m, { text, command }) => {
        if (!text) return m.reply('Ask a question!');
        const answers = ['Yes', 'No', 'Maybe', 'Definitely', 'Absolutely not', 'Ask again later'];
        await m.reply(`🎲 *${command.charAt(0).toUpperCase() + command.slice(1)}*\nQ: ${text}\nA: ${pickRandom(answers)}`);
    },
    // Anime reactions
    neko: async (maureonix, m, { command }) => {
        try {
            const fetch = require('node-fetch');
            const res = await fetch(`https://nekos.best/api/v2/${command}`).catch(() => null);
            const data = await res?.json();
            const gifUrl = data?.results?.[0]?.url;
            if (gifUrl) await maureonix.sendMessage(m.chat, { video: { url: gifUrl }, gifPlayback: true, caption: `*${command.toUpperCase()}*` }, { quoted: m });
            else throw new Error('No GIF');
        } catch (e) {
            try {
                const fetch = require('node-fetch');
                const endpoints = { neko: 'neko', waifu: 'waifu', hug: 'hug', kiss: 'kiss', pat: 'pat', cry: 'cry', slap: 'slap', dance: 'dance', happy: 'happy', blush: 'blush', wink: 'wink' };
                const endpoint = endpoints[command] || 'waifu';
                const res = await fetch(`https://api.waifu.pics/sfw/${endpoint}`);
                const json = await res.json();
                if (json.url) await maureonix.sendMessage(m.chat, { video: { url: json.url }, gifPlayback: true, caption: `*${command.toUpperCase()}*` }, { quoted: m });
            } catch (e2) { m.reply(`❌ Could not fetch ${command} GIF.`); }
        }
    },
    waifu: async (maureonix, m, ctx) => { await module.exports.neko(maureonix, m, ctx); },
    hug: async (maureonix, m, ctx) => { await module.exports.neko(maureonix, m, ctx); },
    kiss: async (maureonix, m, ctx) => { await module.exports.neko(maureonix, m, ctx); },
    pat: async (maureonix, m, ctx) => { await module.exports.neko(maureonix, m, ctx); },
    wink: async (maureonix, m, ctx) => { await module.exports.neko(maureonix, m, ctx); },
    cry: async (maureonix, m, ctx) => { await module.exports.neko(maureonix, m, ctx); },
    slap: async (maureonix, m, ctx) => { await module.exports.neko(maureonix, m, ctx); },
    dance: async (maureonix, m, ctx) => { await module.exports.neko(maureonix, m, ctx); },
    happy: async (maureonix, m, ctx) => { await module.exports.neko(maureonix, m, ctx); },
    blush: async (maureonix, m, ctx) => { await module.exports.neko(maureonix, m, ctx); },
    facepalm: async (maureonix, m, ctx) => { await module.exports.neko(maureonix, m, ctx); },
    nom: async (maureonix, m, ctx) => { await module.exports.neko(maureonix, m, ctx); },
    poke: async (maureonix, m, ctx) => { await module.exports.neko(maureonix, m, ctx); },
    punch: async (maureonix, m, ctx) => { await module.exports.neko(maureonix, m, ctx); },
    loli: async (maureonix, m, ctx) => { await module.exports.neko(maureonix, m, ctx); },
    // Text effects
    metallic: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'metallic', ctx.text, ctx.prefix); },
    ice: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'ice', ctx.text, ctx.prefix); },
    snow: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'snow', ctx.text, ctx.prefix); },
    impressive: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'impressive', ctx.text, ctx.prefix); },
    matrix: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'matrix', ctx.text, ctx.prefix); },
    light: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'light', ctx.text, ctx.prefix); },
    neon: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'neon', ctx.text, ctx.prefix); },
    devil: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'devil', ctx.text, ctx.prefix); },
    purple: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'purple', ctx.text, ctx.prefix); },
    thunder: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'thunder', ctx.text, ctx.prefix); },
    leaves: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'leaves', ctx.text, ctx.prefix); },
    '1917': async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, '1917', ctx.text, ctx.prefix); },
    arena: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'arena', ctx.text, ctx.prefix); },
    hacker: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'hacker', ctx.text, ctx.prefix); },
    sand: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'sand', ctx.text, ctx.prefix); },
    blackpink: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'blackpink', ctx.text, ctx.prefix); },
    glitch: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'glitch', ctx.text, ctx.prefix); },
    fire: async (maureonix, m, ctx) => { await generateTextArt(maureonix, m, 'fire', ctx.text, ctx.prefix); },
    // Meme overlays
    oogway: async (maureonix, m, { text, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <quote>`);
        try {
            const fetch = require('node-fetch');
            const url = `https://api.popcat.xyz/oogway?text=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            const buffer = await res.buffer();
            await maureonix.sendMessage(m.chat, { image: buffer, caption: `🐢 *Oogway says:*\n"${text}"` }, { quoted: m });
        } catch (e) { await m.reply(`🐢 *Oogway says:*\n"${text}"`); }
    },
    tweet: async (maureonix, m, { text, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <tweet text>`);
        const username = m.pushName || 'User';
        try {
            const fetch = require('node-fetch');
            const url = `https://api.popcat.xyz/tweet?username=${encodeURIComponent(username)}&text=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            const buffer = await res.buffer();
            await maureonix.sendMessage(m.chat, { image: buffer, caption: `🐦 *Tweet*\n@${username}: ${text}` }, { quoted: m });
        } catch (e) { await m.reply(`🐦 *@${username}:* ${text}`); }
    },
    ytcomment: async (maureonix, m, { text, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <comment>`);
        const username = m.pushName || 'User';
        try {
            const fetch = require('node-fetch');
            const ppUrl = await maureonix.profilePictureUrl(m.sender, 'image').catch(() => 'https://i.imgur.com/default.png');
            const url = `https://api.popcat.xyz/youtubecomment?username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(ppUrl)}&comment=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            const buffer = await res.buffer();
            await maureonix.sendMessage(m.chat, { image: buffer, caption: `💬 *YouTube Comment*\n${username}: ${text}` }, { quoted: m });
        } catch (e) { await m.reply(`💬 *YouTube Comment*\n👤 ${username}: ${text}`); }
    },
    jail: async (maureonix, m) => { await imageOverlay(maureonix, m, 'jail', '🚔'); },
    triggered: async (maureonix, m) => { await imageOverlay(maureonix, m, 'triggered', '😤'); },
    namecard: async (maureonix, m, { text }) => {
        const name = m.pushName || text || 'User';
        try {
            const fetch = require('node-fetch');
            const url = `https://api.popcat.xyz/welcomecard?background=https://cdn.popcat.xyz/welcome-bg.png&text1=${encodeURIComponent(name)}&text2=WhatsApp%20User&text3=Member%20%231&avatar=${encodeURIComponent(await maureonix.profilePictureUrl(m.sender, 'image').catch(() => 'https://i.imgur.com/default.png'))}`;
            const res = await fetch(url);
            const buffer = await res.buffer();
            await maureonix.sendMessage(m.chat, { image: buffer, caption: `🪪 *Name Card*\n👤 ${name}` }, { quoted: m });
        } catch (e) { await m.reply(`🪪 *Name Card*\n👤 *Name:* ${name}\n📱 *Number:* +${m.sender.split('@')[0]}`); }
    },
    heart: async (maureonix, m) => { await imageOverlay(maureonix, m, 'heart', '❤️'); },
    circle: async (maureonix, m) => { await imageOverlay(maureonix, m, 'circle', '🕊️'); },
    lgbt: async (maureonix, m) => { await imageOverlay(maureonix, m, 'rainbow', '🏳️‍🌈'); },
    horny: async (maureonix, m) => { await imageOverlay(maureonix, m, 'horny', '😏'); },
    lolice: async (maureonix, m) => { await imageOverlay(maureonix, m, 'lolice', '👮'); },
    gay: async (maureonix, m) => { await imageOverlay(maureonix, m, 'gay', '🌈'); },
    glass: async (maureonix, m) => { await imageOverlay(maureonix, m, 'glass', '👓'); },
    passed: async (maureonix, m) => { await imageOverlay(maureonix, m, 'passed', '✅'); },
    'its-so-stupid': async (maureonix, m) => { await imageOverlay(maureonix, m, 'its-so-stupid', '😆'); },
    comrade: async (maureonix, m) => { await imageOverlay(maureonix, m, 'communist', '☭'); },
    funmenu: async (maureonix, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *😂 FUN COMMANDS*  ║\n╚══════════════════════╝\n\n📌 *Random Fun*\n▸ ${prefix}joke – Random joke\n▸ ${prefix}meme – Random meme\n▸ ${prefix}quote – Inspirational quote\n▸ ${prefix}fact – Random fact\n\n📌 *Interactive*\n▸ ${prefix}8ball <question>\n▸ ${prefix}roast @user\n▸ ${prefix}compliment @user\n▸ ${prefix}ship @user1 @user2\n▸ ${prefix}truth – Truth question\n▸ ${prefix}dare – Dare challenge\n▸ ${prefix}bisakah <question>\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },
    // Aliases
    '8b': async (maureonix, m, ctx) => { await module.exports['8ball'](maureonix, m, ctx); },
    wouldyourather: async (maureonix, m, ctx) => { await module.exports.wyr(maureonix, m, ctx); },
};