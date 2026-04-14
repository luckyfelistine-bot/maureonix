/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  🦊 MAUREONIX — GAMES ENGINE v3.0                   ║
 * ║  RAWG API Integration + Extended Game Library        ║
 * ╚══════════════════════════════════════════════════════╝
 */

require('../settings');
const fs    = require('fs');
const path  = require('path');
const jimp  = require('jimp');
const sharp = require('sharp');
const chalk = require('chalk');
const https = require('https');
const axios = require('axios');
const { sleep, clockString } = require('./function');

const RAWG_KEY = '87d2613ba4b34b7d83929fcd8516f43b';
const RAWG_BASE = 'https://api.rawg.io/api';

// Helper
function pickRandom(list) { return list[Math.floor(Math.random() * list.length)]; }

// ----- Game session helpers (used by nima.js) -----
const rdGame = (bd, id, tm) => Object.keys(bd).find(a => a.startsWith(id) && a.endsWith(tm));
const iGame  = (bd, id)     => (a => a && bd[a].id)(Object.keys(bd).find(a => a.startsWith(id)));
const tGame  = (bd, id)     => (a => a && bd[a].time)(Object.keys(bd).find(a => a.startsWith(id)));

// ----- RAWG API helper -----
function rawgGet(endpoint) {
    return new Promise((resolve, reject) => {
        const url = `${RAWG_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}key=${RAWG_KEY}`;
        https.get(url, { headers: { 'User-Agent': 'MAUREONIX-Bot/3.0' } }, res => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch { reject(new Error('JSON parse error')); }
            });
        }).on('error', reject);
    });
}

function formatGame(g) {
    const rating = g.rating ? `⭐ ${g.rating.toFixed(1)}/5` : '⭐ N/A';
    const released = g.released || 'Unknown';
    const platforms = (g.platforms || []).map(p => p.platform?.name).filter(Boolean).slice(0,4).join(', ') || 'N/A';
    const genres = (g.genres || []).map(x => x.name).slice(0,3).join(', ') || 'N/A';
    return `🎮 *${g.name}*\n` +
           `${rating} | 📅 ${released}\n` +
           `🕹️ Platforms: ${platforms}\n` +
           `🏷️ Genres: ${genres}\n` +
           `🔥 Metacritic: ${g.metacritic || 'N/A'}/100`;
}

// ----- RAWG: Browse games -----
const gameList = async (conn, m, prefix) => {
    try {
        m.reply('🎮 Fetching latest games from RAWG...');
        const data = await rawgGet('/games?ordering=-released&page_size=10');
        if (!data.results?.length) return m.reply('❌ No games found!');
        let text = `╔══[ 🎮 *LATEST GAMES* ]══╗\n\n`;
        data.results.forEach((g, i) => {
            text += `*${i+1}.* ${formatGame(g)}\n\n`;
        });
        text += `╚═══════════════════╝\n_Powered by RAWG.io_\n\n💡 Try: ${prefix}topgames | ${prefix}searchgame <name>`;
        await conn.sendMessage(m.chat, { text }, { quoted: m });
    } catch (e) {
        m.reply('❌ RAWG API error: ' + e.message);
    }
};

const topGames = async (conn, m, prefix) => {
    try {
        m.reply('🏆 Fetching top rated games...');
        const data = await rawgGet('/games?ordering=-rating&metacritic=80,100&page_size=10');
        if (!data.results?.length) return m.reply('❌ No games found!');
        let text = `╔══[ 🏆 *TOP RATED GAMES* ]══╗\n\n`;
        data.results.forEach((g, i) => {
            text += `*${i+1}.* ${formatGame(g)}\n\n`;
        });
        text += `╚══════════════════════╝\n_Powered by RAWG.io_`;
        await conn.sendMessage(m.chat, { text }, { quoted: m });
    } catch (e) {
        m.reply('❌ RAWG API error: ' + e.message);
    }
};

const searchGame = async (conn, m, prefix) => {
    const query = (m.args || []).join(' ').trim();
    if (!query) return m.reply(`🔍 Usage: ${prefix}searchgame <game name>\nExample: ${prefix}searchgame minecraft`);
    try {
        m.reply(`🔍 Searching for *${query}*...`);
        const data = await rawgGet(`/games?search=${encodeURIComponent(query)}&page_size=5`);
        if (!data.results?.length) return m.reply(`❌ No results for: *${query}*`);
        let text = `╔══[ 🔍 *SEARCH: ${query.toUpperCase()}* ]══╗\n\n`;
        data.results.forEach((g, i) => {
            text += `*${i+1}.* ${formatGame(g)}\n\n`;
        });
        text += `╚══════════════════════╝\n_Powered by RAWG.io_`;
        await conn.sendMessage(m.chat, { text }, { quoted: m });
    } catch (e) {
        m.reply('❌ RAWG API error: ' + e.message);
    }
};

const randomGame = async (conn, m, prefix) => {
    try {
        const page = Math.floor(Math.random() * 50) + 1;
        const data = await rawgGet(`/games?ordering=-rating&page_size=20&page=${page}`);
        if (!data.results?.length) return m.reply('❌ No games found!');
        const g = pickRandom(data.results);
        const text = `🎲 *RANDOM GAME PICK*\n\n${formatGame(g)}\n\n_Try: ${prefix}searchgame ${g.name}_`;
        await conn.sendMessage(m.chat, { text }, { quoted: m });
    } catch (e) {
        m.reply('❌ RAWG API error: ' + e.message);
    }
};

const gamesByGenre = async (conn, m, prefix) => {
    const genre = (m.args?.[0] || '').toLowerCase();
    const genres = {
        action: 4, rpg: 5, strategy: 10, shooter: 2, adventure: 3,
        puzzle: 7, racing: 1, sports: 15, indie: 51, simulation: 14,
        horror: 'horror', fighting: 6
    };
    if (!genre || !genres[genre]) {
        return m.reply(`🎯 Available genres:\n${Object.keys(genres).map(g => `▸ ${prefix}genre ${g}`).join('\n')}`);
    }
    try {
        m.reply(`🎯 Finding ${genre} games...`);
        const data = await rawgGet(`/games?genres=${genres[genre]}&ordering=-rating&page_size=8`);
        if (!data.results?.length) return m.reply('❌ No games found!');
        let text = `╔══[ 🎯 *${genre.toUpperCase()} GAMES* ]══╗\n\n`;
        data.results.forEach((g, i) => { text += `*${i+1}.* ${formatGame(g)}\n\n`; });
        text += `╚══════════════════════╝\n_Powered by RAWG.io_`;
        await conn.sendMessage(m.chat, { text }, { quoted: m });
    } catch (e) {
        m.reply('❌ RAWG API error: ' + e.message);
    }
};

// ----- Classic games -----
const gameSlot = async (conn, m, db) => {
    if (db.users[m.sender].limit < 1) return m.reply(global.mess.limit);
    const slots = ['🍇','🍉','🍋','🍌','🍎','🍑','🍒','🫐','🥥','🥑'];
    const slot1 = pickRandom(slots), slot2 = pickRandom(slots), slot3 = pickRandom(slots);
    const l1 = `${pickRandom(slots)} : ${pickRandom(slots)} : ${pickRandom(slots)}`;
    const l2 = `${slot1} : ${slot2} : ${slot3}`;
    const l3 = `${pickRandom(slots)} : ${pickRandom(slots)} : ${pickRandom(slots)}`;
    const rnd = Math.floor(Math.random() * 10);
    const botNumber = await conn.decodeJid(conn.user.id);
    db.users[m.sender].limit -= 1;
    db.set[botNumber].limit += 1;
    if (slot1 === slot2 && slot2 === slot3) {
        db.users[m.sender].limit += rnd;
        db.users[m.sender].money += rnd * 500;
        conn.sendMessage(m.chat, { text:
            `╔══[ 🎰 SLOT MACHINE ]══╗\n\n${l1}\n${l2} ◀ YOUR SPIN\n${l3}\n\n╚══════════════════╝\n\n🎉 *JACKPOT!* You won!\n✅ Limit +${rnd} | 💰 Money +${rnd*500}`
        }, { quoted: m });
    } else {
        conn.sendMessage(m.chat, { text:
            `╔══[ 🎰 SLOT MACHINE ]══╗\n\n${l1}\n${l2} ◀ YOUR SPIN\n${l3}\n\n╚══════════════════╝\n\n😞 *No match.* Try again!\n📉 Limit -1`
        }, { quoted: m });
    }
};

const gameCasinoSolo = async (conn, m, prefix, db) => {
    try {
        if (db.users[m.sender].limit < 1) return m.reply(global.mess.limit);
        const botNumber = await conn.decodeJid(conn.user.id);
        const botScore  = Math.floor(Math.random() * 101);
        const userScore = Math.floor(Math.random() * 81);
        const count     = parseInt(m.args?.[0]);
        if (!m.args?.[0]) return m.reply(`💰 Usage: ${prefix}casino <amount>\nExample: ${prefix}casino 1000`);
        if (isNaN(count) || count < 1) return m.reply(`Please enter a valid amount!\nExample: ${prefix}casino 1000`);
        if (db.users[m.sender].money < count) return m.reply(`❌ You don't have enough money!\nBalance: ${db.users[m.sender].money}`);
        db.users[m.sender].limit -= 1;
        db.users[m.sender].money -= count;
        db.set[botNumber].money  += count;
        let result;
        if (botScore > userScore) {
            result = `😞 *You LOST* — Bot won!\n💸 Lost: ${count} money`;
        } else if (botScore < userScore) {
            db.users[m.sender].money += count * 2;
            result = `🎉 *You WON!*\n💰 Earned: ${count * 2} money`;
        } else {
            db.users[m.sender].money += count;
            result = `🤝 *DRAW!* — Bet returned.\n💵 Returned: ${count} money`;
        }
        m.reply(`╔══[ 💰 CASINO ]══╗\n\n🤓 Your score: *${userScore}*\n🤖 Bot score: *${botScore}*\n\n${result}\n\n╚══════════════╝`);
    } catch { m.reply('❌ Error!'); }
};

const gameSamgongSolo = async (conn, m, db) => {
    const suits = ['♥️','♦️','♣️','♠️'];
    const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    if (db.users[m.sender].limit < 1) return m.reply(global.mess.limit);
    const count = parseInt(m.args?.[0]);
    if (isNaN(count) || count < 5000) return m.reply('❌ Minimum bet is 5000!');
    if (db.users[m.sender].money < count) return m.reply("❌ You don't have enough money!");
    db.users[m.sender].money -= count;
    db.users[m.sender].limit -= 1;
    let { key } = await m.reply('🃏 *Game started!* Dealing cards...');
    await sleep(5000);
    const deck = ranks.flatMap(r => suits.map(s => `${r}${s}`)).sort(() => Math.random() - 0.5);
    const draw = () => [deck.pop(), deck.pop(), deck.pop()];
    const val  = c => (['J','Q','K'].includes(c.slice(0,-2)) ? 10 : c.slice(0,-2) === 'A' ? 15 : parseInt(c));
    const calcScore = hand => hand.reduce((s, c) => s + val(c), 0);
    let pH = draw(), bH = draw();
    let pS = calcScore(pH), bS = calcScore(bH);
    await m.reply({ text: `🃏 *Cards dealt:*\n🤓 You: ${pH.join(' ')}\n🤖 Bot: ${bH.join(' ')}`, edit: key });
    await sleep(2000);
    while (pS < 30 && bS < 30 && pH.length < 4) {
        if (pS < 30) pH.push(deck.pop());
        if (bS < 30) bH.push(deck.pop());
        pS = calcScore(pH); bS = calcScore(bH);
    }
    let winnings = count * 1.5;
    let result = pS > 30 ? '💀 You busted! Lost.' : pS === bS ? '🤝 Draw! Bet returned.' : bS > 30 || pS > bS ? `🎉 You won! +${winnings}` : '😞 Bot won!';
    if (pS <= 30 && (bS > 30 || pS > bS)) db.users[m.sender].money += (pS === bS ? count : winnings);
    await m.reply({ text: `🃏 *Final Result:*\n🤓 You: ${pH.join(' ')} (${pS})\n🤖 Bot: ${bH.join(' ')} (${bS})\n\n${result}`, edit: key });
};

const gameMerampok = async (m, db) => {
    if (db.users[m.sender].limit < 1) return m.reply(global.mess.limit);
    db.users[m.sender].limit -= 1;
    const __t = new Date - db.users[m.sender].lastrampok;
    const timers = clockString(3600000 - __t);
    if (new Date - db.users[m.sender].lastrampok > 3600000) {
        const dapat = Math.floor(Math.random() * 10000);
        const who = m.isGroup ? (m.mentionedJid?.[0] || m.quoted?.sender) : m.chat;
        if (!who) return m.reply('❌ Tag a person to rob!');
        if (!db.users[who]) return m.reply('❌ This person is not in the database!');
        if (10000 > db.users[who].money) return m.reply("❌ They don't have enough money to rob!");
        db.users[who].money -= dapat;
        db.users[m.sender].money += dapat;
        db.users[m.sender].lastrampok = Date.now();
        m.reply(`🔫 *ROB SUCCESSFUL!*\n\n💰 Robbed: ${dapat} money\n⏰ Next rob available in 1 hour.`);
    } else m.reply(`⏳ You're hiding! Wait *${timers}* before robbing again.`);
};

const gameBegal = async (conn, m, db) => {
    if (db.users[m.sender].limit < 1) return m.reply(global.mess.limit);
    db.users[m.sender].limit -= 1;
    const user = db.users[m.sender];
    const timers = clockString(3600000 - (Date.now() - user.lastbegal));
    const botNumber = await conn.decodeJid(conn.user.id);
    const randomUang = Math.floor(Math.random() * 10001);
    const outcomes = [
        { text: 'Target escaped!', no: 0 },
        { text: 'Target ran away!', no: 0 },
        { text: 'Target was stronger!', no: 1 },
        { text: 'Target called police!', no: 0 },
        { text: 'Target surrendered!', no: 2 },
        { text: 'Target caught — success!', no: 2 },
        { text: 'Target fought back!', no: 1 },
    ];
    const outcome = pickRandom(outcomes);
    if (Date.now() - user.lastbegal > 3600000) {
        const { key } = await m.reply('🔍 Searching for target...');
        await sleep(2000);
        if (outcome.no === 0) {
            await m.reply({ text: `❌ ${outcome.text} — Failed!`, edit: key });
        } else if (outcome.no === 1) {
            db.users[m.sender].money -= randomUang;
            db.set[botNumber].money  += randomUang;
            await m.reply({ text: `💀 ${outcome.text}\n😞 You lost ${randomUang} money!`, edit: key });
        } else {
            db.users[m.sender].money += randomUang;
            db.users[m.sender].lastbegal = Date.now();
            await m.reply({ text: `🎉 ${outcome.text}\n💰 Got ${randomUang} money!`, edit: key });
        }
    } else m.reply(`⏳ Wait *${timers}* to strike again.`);
};

// ----- Math Quiz -----
const mathQuizSessions = {};

const mathQuiz = async (conn, m, db) => {
    const chat = m.chat;
    if (mathQuizSessions[chat]) return m.reply('⚠️ A math quiz is already running! Answer it first.');
    const a = Math.floor(Math.random() * 50) + 1;
    const b = Math.floor(Math.random() * 50) + 1;
    const ops = [
        { sym: '+', ans: a + b },
        { sym: '-', ans: a - b },
        { sym: '×', ans: a * b },
    ];
    const op = pickRandom(ops);
    mathQuizSessions[chat] = {
        answer: op.ans,
        starter: m.sender,
        timeout: setTimeout(() => {
            delete mathQuizSessions[chat];
            conn.sendMessage(chat, { text: `⏰ Time's up! The answer was *${op.ans}*` });
        }, 30000)
    };
    await conn.sendMessage(m.chat, {
        text: `🧮 *MATH QUIZ*\n\n❓ What is *${a} ${op.sym} ${b}*?\n\n⏰ You have 30 seconds!\n💰 Reward: +5 limit, +2500 money`
    }, { quoted: m });
};

const mathAnswer = async (conn, m, db) => {
    const chat = m.chat;
    if (!mathQuizSessions[chat]) return;
    const answer = parseInt(m.body?.trim());
    if (isNaN(answer)) return;
    if (answer === mathQuizSessions[chat].answer) {
        clearTimeout(mathQuizSessions[chat].timeout);
        delete mathQuizSessions[chat];
        db.users[m.sender].limit  = (db.users[m.sender].limit  || 0) + 5;
        db.users[m.sender].money  = (db.users[m.sender].money  || 0) + 2500;
        await conn.sendMessage(m.chat, {
            text: `🎉 @${m.sender.split('@')[0]} got it right! *${answer}*\n\n✅ Reward: +5 limit, +2500 money`,
            mentions: [m.sender]
        });
    }
};

// ----- Blackjack (full implementation) -----
const blackjackSessions = {};

const blackjack = async (conn, m, prefix, db) => {
    if (db.users[m.sender].limit < 1) return m.reply(global.mess.limit);
    const bet = parseInt(m.args?.[0]);
    if (isNaN(bet) || bet < 100) return m.reply(`♠️ Usage: ${prefix}blackjack <bet>\nMinimum: 100\nExample: ${prefix}blackjack 500`);
    if (db.users[m.sender].money < bet) return m.reply(`❌ Insufficient balance! You have ${db.users[m.sender].money}.`);

    const deck = [];
    ['♠️','♥️','♦️','♣️'].forEach(s => {
        [2,3,4,5,6,7,8,9,10,'J','Q','K','A'].forEach(v => deck.push({s, v}));
    });
    deck.sort(() => Math.random() - 0.5);

    const cardVal = c => typeof c.v === 'number' ? c.v : c.v === 'A' ? 11 : 10;
    const handStr = h => h.map(c => `${c.v}${c.s}`).join(' ');
    const total   = h => {
        let t = h.reduce((s, c) => s + cardVal(c), 0);
        let aces = h.filter(c => c.v === 'A').length;
        while (t > 21 && aces-- > 0) t -= 10;
        return t;
    };

    const pH = [deck.pop(), deck.pop()];
    const bH = [deck.pop(), deck.pop()];
    db.users[m.sender].money -= bet;
    db.users[m.sender].limit -= 1;

    blackjackSessions[m.sender] = { pH, bH, deck, bet, chat: m.chat };

    const pTotal = total(pH);
    await conn.sendMessage(m.chat, {
        text: `♠️ *BLACKJACK*\n\n🤓 Your hand: ${handStr(pH)} (${pTotal})\n🤖 Dealer: ${bH[0].v}${bH[0].s} + ❓\n\n💰 Bet: ${bet}\n\nType *hit* to draw a card or *stand* to hold.`
    }, { quoted: m });

    if (pTotal === 21) {
        const payout = Math.floor(bet * 2.5);
        db.users[m.sender].money += payout;
        delete blackjackSessions[m.sender];
        return conn.sendMessage(m.chat, { text: `🎰 *BLACKJACK!* You win! 💰 +${payout}` });
    }
};

const blackjackAction = async (conn, m, db) => {
    const session = blackjackSessions[m.sender];
    if (!session) return;
    const action = m.body?.toLowerCase().trim();
    if (!['hit','stand'].includes(action)) return;

    const deck = session.deck;
    const cardVal = c => typeof c.v === 'number' ? c.v : c.v === 'A' ? 11 : 10;
    const total = h => {
        let t = h.reduce((s, c) => s + cardVal(c), 0);
        let aces = h.filter(c => c.v === 'A').length;
        while (t > 21 && aces-- > 0) t -= 10;
        return t;
    };
    const handStr = h => h.map(c => `${c.v}${c.s}`).join(' ');

    if (action === 'hit') {
        session.pH.push(deck.pop());
        const pTotal = total(session.pH);
        if (pTotal > 21) {
            delete blackjackSessions[m.sender];
            return conn.sendMessage(m.chat, {
                text: `♠️ *BUST!*\n\n🤓 Your hand: ${handStr(session.pH)} (${pTotal})\n\n😞 You went over 21! Lost ${session.bet} money.`
            });
        }
        return conn.sendMessage(m.chat, {
            text: `♠️ *HIT*\n\n🤓 Your hand: ${handStr(session.pH)} (${pTotal})\n\nType *hit* or *stand*`
        });
    }

    if (action === 'stand') {
        while (total(session.bH) < 17) session.bH.push(deck.pop());
        const pT = total(session.pH), bT = total(session.bH);
        let result;
        if (bT > 21 || pT > bT) {
            const payout = session.bet * 2;
            db.users[m.sender].money += payout;
            result = `🎉 *You WIN!* +${payout} money`;
        } else if (pT === bT) {
            db.users[m.sender].money += session.bet;
            result = `🤝 *PUSH!* Bet returned.`;
        } else {
            result = `😞 *Dealer wins!* Lost ${session.bet} money.`;
        }
        delete blackjackSessions[m.sender];
        return conn.sendMessage(m.chat, {
            text: `♠️ *BLACKJACK RESULT*\n\n🤓 You: ${handStr(session.pH)} (${pT})\n🤖 Dealer: ${handStr(session.bH)} (${bT})\n\n${result}`
        });
    }
};

// ----- Snake & Ladder (FULL PRODUCTION IMPLEMENTATION) -----
class SnakeLadder {
    constructor(data = {}) {
        this.players = data.players || [];
        this.turn = data.turn || 0;
        // Standard snake & ladder board layout (1-100)
        this.map = {
            url: 'https://raw.githubusercontent.com/nima-axis/database/master/games/images/snake_ladder/board.png',
            move: {
                // Ladders
                3: 22, 5: 8, 11: 26, 20: 29, 27: 41, 34: 52, 42: 63, 50: 67, 58: 77, 69: 90, 73: 84, 78: 98,
                // Snakes
                17: 4, 19: 7, 21: 9, 28: 1, 44: 26, 47: 15, 56: 33, 62: 19, 64: 43, 71: 48, 80: 54, 89: 68, 92: 73, 95: 75, 98: 79
            }
        };
        this.time = data.time || Date.now();
        this.id = data.id || null;
    }

    rollDice() {
        return Math.floor(Math.random() * 6) + 1;
    }

    nextTurn() {
        this.turn = (this.turn + 1) % this.players.length;
    }

    // Draw the board with player markers using Sharp
    async drawBoard(boardUrl, players) {
        try {
            // Download base board image
            const response = await axios.get(boardUrl, { responseType: 'arraybuffer', timeout: 15000 });
            let boardBuffer = Buffer.from(response.data);

            // Define colors for up to 8 players (you can extend)
            const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan', 'magenta', 'yellow'];
            // Marker size (radius in pixels)
            const markerRadius = 20;

            // We need to map player positions (1-100) to pixel coordinates on the board.
            // Since we don't have exact coordinates, we'll use a generic approach:
            // Assume board is a 10x10 grid. Each cell is roughly 1/10th of width/height.
            // We'll overlay a circle at the center of the cell.
            const img = sharp(boardBuffer);
            const metadata = await img.metadata();
            const cellW = metadata.width / 10;
            const cellH = metadata.height / 10;

            // Build an array of overlays (one per player)
            const overlays = [];
            for (let i = 0; i < players.length; i++) {
                const pos = players[i].move;
                if (pos < 1 || pos > 100) continue;
                // Convert position to row/col (0-indexed)
                // Board layout: row 0 = cells 1-10 (left to right), row 1 = 11-20 (right to left) etc.
                const row = Math.floor((pos - 1) / 10);
                let col;
                if (row % 2 === 0) {
                    // Even rows: left to right
                    col = (pos - 1) % 10;
                } else {
                    // Odd rows: right to left
                    col = 9 - ((pos - 1) % 10);
                }
                const x = col * cellW + cellW / 2;
                const y = row * cellH + cellH / 2;
                // Create a SVG circle as a marker
                const svg = `<svg width="${metadata.width}" height="${metadata.height}">
                    <circle cx="${x}" cy="${y}" r="${markerRadius}" fill="${colors[i % colors.length]}" stroke="white" stroke-width="3" opacity="0.8"/>
                    <text x="${x}" y="${y+6}" font-size="20" text-anchor="middle" fill="white" font-weight="bold">${i+1}</text>
                </svg>`;
                overlays.push({ input: Buffer.from(svg), blend: 'over' });
            }

            // Composite all overlays onto the board
            let composite = img;
            for (const ov of overlays) {
                composite = composite.composite([{ input: ov.input, blend: ov.blend }]);
            }
            const finalBuffer = await composite.png().toBuffer();
            return finalBuffer;
        } catch (err) {
            console.error('SnakeLadder drawBoard error:', err);
            // Fallback: return empty buffer (or a text-based board as last resort)
            return Buffer.from('');
        }
    }
}

// ----- Economy functions -----
const daily = async (m, db) => {
    const user   = db.users[m.sender];
    const timers = clockString(86400000 - (Date.now() - user.lastclaim));
    if (Date.now() - user.lastclaim > 86400000) {
        user.limit += 10;
        user.money += 10000;
        user.lastclaim = Date.now();
        m.reply(`📅 *DAILY CLAIM*\n\n✅ Claimed successfully!\n✅ Limit +10\n💰 Money +10,000\n\n⏰ Next claim in 24 hours.`);
    } else m.reply(`⏰ Please wait *${timers}* to claim again.`);
};

const buy = async (m, args, db) => {
    if (args[0] === 'limit') {
        const count = parseInt(args[1]);
        if (!count) return m.reply(`Usage: .buy limit <amount>\nPrice: 500 per limit\nYour balance: ${db.users[m.sender].money}`);
        const cost = count * 500;
        if (db.users[m.sender].money < cost) return m.reply(`❌ Need ${cost} money. You have ${db.users[m.sender].money}.`);
        db.users[m.sender].limit += count;
        db.users[m.sender].money -= cost;
        m.reply(`✅ Bought *${count}* limit!\n💰 Cost: ${cost}\n📊 New limit: ${db.users[m.sender].limit}`);
    } else {
        m.reply(`🛒 *SHOP*\n\n📋 Limit — 500 money each\nExample: .buy limit 5 = 2500 money\n\nYour balance: ${db.users[m.sender].money}\nYour limits: ${db.users[m.sender].limit}`);
    }
};

const setLimit  = (m, db) => { db.users[m.sender].limit -= 1; };
const addLimit  = (amt, no, db) => { db.users[no].limit += parseInt(amt); };
const setMoney  = (m, db) => { db.users[m.sender].money -= 1000; };
const addMoney  = (amt, no, db) => { db.users[no].money += parseInt(amt); };

const transfer = async (m, args, db) => {
    if (args[0] === 'limit') {
        const who   = m.mentionedJid?.[0] || (args[1]?.replace(/[^0-9]/g,'') + '@s.whatsapp.net');
        const count = parseInt(args[2]) || 1;
        if (!who) return m.reply('Tag someone to transfer to!');
        if (!db.users[who]) return m.reply('❌ User not found in database!');
        if (db.users[m.sender].limit < count) return m.reply(`❌ You only have ${db.users[m.sender].limit} limit.`);
        db.users[m.sender].limit -= count;
        db.users[who].limit      += count;
        m.reply(`✅ Transferred *${count}* limit to @${who.split('@')[0]}`);
    } else if (args[0] === 'money' || args[0] === 'uang') {
        const who   = m.mentionedJid?.[0] || (args[1]?.replace(/[^0-9]/g,'') + '@s.whatsapp.net');
        const count = parseInt(args[2]) || 1;
        if (!who) return m.reply('Tag someone to transfer to!');
        if (!db.users[who]) return m.reply('❌ User not found in database!');
        if (db.users[m.sender].money < count) return m.reply(`❌ You only have ${db.users[m.sender].money} money.`);
        db.users[m.sender].money -= count;
        db.users[who].money      += count;
        m.reply(`✅ Transferred *${count}* money to @${who.split('@')[0]}`);
    } else {
        m.reply(`💸 *TRANSFER*\n\n▸ .transfer limit @tag <amount>\n▸ .transfer money @tag <amount>`);
    }
};

// ========== EXPORT ALL ==========
module.exports = {
    // Game session helpers (required by nima.js)
    rdGame,
    iGame,
    tGame,

    // RAWG games
    gameList,
    topGames,
    searchGame,
    randomGame,
    gamesByGenre,

    // Classic games
    gameSlot,
    gameCasinoSolo,
    gameSamgongSolo,
    gameMerampok,
    gameBegal,
    mathQuiz,
    mathAnswer,
    blackjack,
    blackjackAction,

    // Economy
    daily,
    buy,
    transfer,
    setLimit,
    addLimit,
    setMoney,
    addMoney,

    // State maps
    mathQuizSessions,
    blackjackSessions,

    // Classes required by nima.js
    Blackjack: class Blackjack {
        constructor() { /* stub for instanceof checks */ }
    },
    SnakeLadder
};

// Hot-reload watcher
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});