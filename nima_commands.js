// nima_commands.js – Dispatcher (splits work to category modules)
const fs = require('fs');
const path = require('path');
const { writeExif } = require('./lib/exif');
const { exec } = require('child_process');
const { getBuffer } = require('./lib/function');
const { sendFile, extractQuotedContent, generateTextArt, imageOverlay } = require('./commands/_utils');

let allCommands = {};

// Dynamically load all command files from the commands folder
const commandsDir = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js') && f !== '_utils.js');

for (const file of commandFiles) {
    const mod = require(path.join(commandsDir, file));
    if (mod) {
        for (const [key, handler] of Object.entries(mod)) {
            if (allCommands[key]) {
                console.warn(`⚠️ Duplicate command "${key}" — overwriting.`);
            }
            allCommands[key] = handler;
        }
    }
}

module.exports = async (nimesha, m, ctx) => {
    const {
        mess, isCmd, command, args, text, q, prefix, isCreator, isOwner, ownerNumber,
        set, sewa, premium, db, store, botNumber,
        suit, chess, chat_ai, gemini_autoreply, gemini_history, menfes,
        checkStatus, getExpired, formatDate, listv, fake, my, tempatDB,
        tekateki, akinator, tictactoe, tebaklirik, kuismath, blackjack,
        tebaklagu, tebakkata, family100, susunkata, tebakbom, ulartangga,
        tebakkimia, caklontong, tebakangka, tebaknegara, tebakgambar, tebakbendera,
        isVip, isBan, isLimit, isPremium, isNsfw,
        author, packname, botname, dayName, tanggal, jam, ucapanWaktu,
        setv, fkontak, readmore, fileSha256, budy, body,
        AI, Search, Tools, Fun, Economy, Admin, Daily, Health, Finance, Social, Dev, Travel, Food,
        RAWG, TriviaMaster, PokemonGame, NumbersGame, FunAPIs, RPGAdventure,
        slotMachine, rouletteSpin, crash, diceRoll, coinflip, rpsls, mathQuiz, anagram, numberGuess,
        gameSlot, gameCasinoSolo, gameSamgongSolo, gameMerampok, gameBegal,
        daily, buy, setLimit, addLimit, addMoney, setMoney, transfer,
        OMDB, TVMaze, AniList, Jikan, TMDB, MovieGuesser, Movie, fmtCast,
        APISports, OddsAPI, ESPN,
        ytMp3, ytMp4, tiktokDownload, igDownload, fbDownload,
        twitterDownload, spotifyDownload, pinterestDownload,
        redditDownload, soundcloudDownload, threadsDownload,
        capcutDownload, likeeDownload, snapchatDownload,
        vimeoDownload, dailymotionDownload, mediafireDownload,
        gdriveDownload, apkDownload,
        toAudio, toPTT, toVideo, generateMenuImage,
        runtime, clockString, sleep, isUrl, generateProfilePicture,
        pickRandom, similarity, almost, cases, getBuffer,
    } = ctx;

    // If we have a matching handler, call it
    if (allCommands[command]) {
        return allCommands[command](nimesha, m, ctx);
    }

    // Fallback for unknown commands (media hash, eval, etc.)
    if (fileSha256 && db.cmd && db.cmd[fileSha256]) {
        const hash = db.cmd[fileSha256];
        if (hash.text) {
            // handle media hash commands if needed (kept for compatibility)
        }
    }
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
        exec(budy.slice(2), (err, stdout) => {
            if (err) return m.reply(`${err}`);
            if (stdout) return m.reply(stdout);
        });
    }
    // If the message matches a database store command (global.db.database)
    if ((!isCmd || isCreator) && budy && typeof budy === 'string' && budy.toLowerCase() !== undefined) {
        if (m.chat.endsWith('broadcast')) return;
        if (!global.db || !global.db.database) return;
        if (!(budy.toLowerCase() in global.db.database)) return;
        await nimesha.relayMessage(m.chat, global.db.database[budy.toLowerCase()], {});
    }
};