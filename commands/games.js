// commands/games.js – Maureonix Ultimate Game Engine
// Contains every game from nima_core.js + new research games
// Uses gameManager for central state and auto‑cleanup

const { pickRandom, rand, sleep, clockString } = require('../lib/function');
const gameManager = require('../lib/gameManager');
const { TicTacToe, Connect4, BlackjackCasino, Blackjack, SnakeLadder, RPGAdventure, RAWG, TriviaMaster, PokemonGame, NumbersGame, FunAPIs } = require('../lib/games');

// ==================== GAME STATE HELPERS ====================

function getGame(type, playerId, createIfMissing = false, gameData = null) {
    let game = gameManager.findPlayerIn(type, playerId);
    if (!game && createIfMissing && gameData) {
        const id = `${type}_${Date.now()}`;
        gameManager.set(type, id, gameData);
        game = { id, data: gameData };
    }
    return game;
}

// ==================== PVP GAMES ====================

// Suit (Rock‑Paper‑Scissors) – from nima_core.js
async function suitGame(conn, m, db) {
    if (!m.isGroup) return m.reply('This game is only available in groups.');
    const opponent = m.mentionedJid?.[0];
    if (!opponent) return m.reply(`Mention an opponent!\nExample: .suit @user`);
    if (opponent === m.sender) return m.reply('You cannot play against yourself!');
    
    let existing = gameManager.findPlayerIn('suit', m.sender);
    if (existing) return m.reply('You are already in a suit game! Finish it first.');
    existing = gameManager.findPlayerIn('suit', opponent);
    if (existing) return m.reply('Opponent is already in a suit game!');

    const gameId = `suit_${Date.now()}`;
    const gameData = {
        id: gameId,
        p: m.sender,
        p2: opponent,
        status: 'wait',
        lastMove: Date.now(),
        asal: m.chat,
        හතර: null,
        හතර2: null,
        text: '',
        text2: ''
    };
    gameManager.set('suit', gameId, gameData, [m.sender, opponent]);
    await m.reply(`🗿 *Suit Challenge!*\n@${m.sender.split('@')[0]} challenges @${opponent.split('@')[0]}!\n\nType *accept* or *reject* to respond.`, { mentions: [m.sender, opponent] });
}

async function suitAccept(conn, m, db) {
    const game = gameManager.findPlayerIn('suit', m.sender);
    if (!game || game.data.status !== 'wait') return;
    if (m.sender !== game.data.p2) return;
    if (!/^(acc(ept)?|terima|gas|oke?|y)/i.test(m.text)) return;
    game.data.status = 'play';
    game.data.lastMove = Date.now();
    await m.reply(`✅ Suit request accepted!\n\n@${game.data.p.split('@')[0]} vs @${game.data.p2.split('@')[0]}\n\n📱 Give your choice in private chat:\nhttps://wa.me/${conn.user.id.split(':')[0]}`);
    await conn.sendMessage(game.data.p, { text: `📌 Choose your option:\n\n🗿 Rock\n📄 Paper\n✂️ Scissors` });
    await conn.sendMessage(game.data.p2, { text: `📌 Choose your option:\n\n🗿 Rock\n📄 Paper\n✂️ Scissors` });
}

async function suitChoice(conn, m, db) {
    const game = gameManager.findPlayerIn('suit', m.sender);
    if (!game || game.data.status !== 'play') return;
    if (m.isGroup) return;
    const isP1 = m.sender === game.data.p;
    const isP2 = m.sender === game.data.p2;
    const choice = m.text.toLowerCase();
    if (!['rock', 'paper', 'scissors'].includes(choice)) return;
    
    if (isP1 && !game.data.හතර) {
        game.data.හතර = choice;
        game.data.text = m.text;
        await m.reply(`You chose ${m.text} ${!game.data.හතර2 ? `\n\nWaiting for opponent's choice.` : ''}`);
        if (!game.data.හතර2) await conn.sendMessage(game.data.p2, { text: 'Opponent has chosen. Now it\'s your turn.' });
    } else if (isP2 && !game.data.හතර2) {
        game.data.හතර2 = choice;
        game.data.text2 = m.text;
        await m.reply(`You chose ${m.text} ${!game.data.හතර ? `\n\nWaiting for opponent's choice.` : ''}`);
        if (!game.data.හතර) await conn.sendMessage(game.data.p, { text: 'Opponent has chosen. Now it\'s your turn.' });
    }
    
    if (game.data.හතර && game.data.හතර2) {
        const p1c = game.data.හතර, p2c = game.data.හතර2;
        let win = null;
        if (p1c === p2c) win = 'draw';
        else if ((p1c === 'rock' && p2c === 'scissors') ||
                 (p1c === 'scissors' && p2c === 'paper') ||
                 (p1c === 'paper' && p2c === 'rock')) win = game.data.p;
        else win = game.data.p2;
        
        const reward = 3000;
        const limitReward = 3;
        if (win !== 'draw') {
            db.users[win].money += reward;
            db.users[win].limit += limitReward;
        }
        await conn.sendMessage(game.data.asal, {
            text: `_*Suit Result*_${win === 'draw' ? '\nTie' : ''}\n\n@${game.data.p.split('@')[0]} (${game.data.text}) ${win === game.data.p ? 'Wins' : win === 'draw' ? 'Ties' : 'Loses'}\n@${game.data.p2.split('@')[0]} (${game.data.text2}) ${win === game.data.p2 ? 'Wins' : win === 'draw' ? 'Ties' : 'Loses'}\n\nWinner receives Money(${reward}) & Limit(${limitReward})`,
            mentions: [game.data.p, game.data.p2]
        });
        gameManager.delete('suit', game.id);
    }
}

// Chess (PvP & vs Bot) – from nima_core.js
async function chessGame(conn, m, db) {
    const opponent = m.mentionedJid?.[0];
    const isBot = !opponent || opponent === 'bot';
    if (!isBot && opponent === m.sender) return m.reply('You cannot play against yourself!');
    if (!isBot && gameManager.findPlayerIn('chess', m.sender)) return m.reply('You are already in a chess game!');
    if (!isBot && gameManager.findPlayerIn('chess', opponent)) return m.reply('Opponent is already in a chess game!');
    
    const { Chess } = require('chess.js');
    const game = new Chess();
    const gameId = `chess_${Date.now()}`;
    const gameData = {
        id: gameId,
        fen: game.fen(),
        botMode: isBot,
        player1: m.sender,
        player2: isBot ? 'BOT' : opponent,
        turn: m.sender,
        time: Date.now()
    };
    gameManager.set('chess', gameId, gameData, [m.sender, isBot ? null : opponent]);
    if (isBot) {
        await m.reply(`♟️ *Chess Game (vs BOT)*\nYou are white. Your turn.\nUse *e2 e4* format.\n\n${await chessBoardImage(game.fen())}`);
    } else {
        await m.reply(`♟️ *Chess Game*\n@${m.sender.split('@')[0]} (White) vs @${opponent.split('@')[0]} (Black)\nWhite starts.\nUse *e2 e4* format.\n\n${await chessBoardImage(game.fen())}`, { mentions: [m.sender, opponent] });
    }
}

async function chessBoardImage(fen) {
    const url = `https://www.chess.com/dynboard?fen=${encodeURIComponent(fen)}&size=3&coordinates=inside`;
    try { return await getBuffer(url); } catch { return null; }
}

async function chessMove(conn, m, db) {
    const gameData = gameManager.findPlayerIn('chess', m.sender);
    if (!gameData) return;
    const { Chess } = require('chess.js');
    const game = new Chess(gameData.data.fen);
    if (gameData.data.turn !== m.sender) return m.reply('Not your turn!');
    const [from, to] = m.text.split(' ');
    if (!from || !to) return m.reply('Invalid format. Use: e2 e4');
    try {
        game.move({ from, to });
    } catch (e) {
        return m.reply('Invalid move!');
    }
    gameData.data.fen = game.fen();
    gameData.data.turn = gameData.data.player2 === 'BOT' ? (game.turn() === 'w' ? gameData.data.player1 : 'BOT') : (game.turn() === 'w' ? gameData.data.player1 : gameData.data.player2);
    gameData.data.lastMove = Date.now();
    
    if (game.game_over()) {
        const winner = game.in_checkmate() ? (game.turn() === 'w' ? gameData.data.player2 : gameData.data.player1) : null;
        await m.reply(`♟️ Game over! ${winner ? `Winner: @${winner.split('@')[0]}` : 'Draw'}`);
        gameManager.delete('chess', gameData.id);
        return;
    }
    
    if (gameData.data.player2 === 'BOT' && gameData.data.turn === 'BOT') {
        const moves = game.moves();
        if (moves.length) {
            const botMove = moves[Math.floor(Math.random() * moves.length)];
            game.move(botMove);
            gameData.data.fen = game.fen();
            gameData.data.turn = gameData.data.player1;
            await m.reply(`🤖 Bot moved: ${botMove}\n\n${await chessBoardImage(game.fen())}`);
        }
    } else {
        const nextPlayer = gameData.data.turn;
        await m.reply(`♟️ Move accepted. Turn: @${nextPlayer.split('@')[0]}\n\n${await chessBoardImage(game.fen())}`, { mentions: [nextPlayer] });
    }
}

// ==================== SOLO GAMES ====================

// Blackjack (from nima_core.js)
async function blackjackGame(conn, m, db) {
    let game = gameManager.get('blackjack', m.sender);
    if (!game) {
        const bj = new BlackjackCasino();
        gameManager.set('blackjack', m.sender, bj);
        await m.reply(`🃏 *Blackjack Started!*\n${bj.status()}\n\nReply with:\n- *hit* to take a card\n- *stand* to hold`);
    } else {
        const bj = game;
        const action = m.text.toLowerCase();
        if (action === 'hit') {
            const val = bj.hit();
            if (val > 21) {
                await m.reply(`💥 BUST! ${bj.reveal()}`);
                gameManager.delete('blackjack', m.sender);
            } else {
                await m.reply(`🃏 You drew: ${bj.player.slice(-1)[0]} (Total: ${val})\n${bj.status()}`);
            }
        } else if (action === 'stand') {
            const result = bj.stand();
            await m.reply(`${bj.reveal()}\n\n${result === 'win' ? '🎉 You win!' : result === 'lose' ? '💀 Dealer wins' : '🤝 Draw'}`);
            gameManager.delete('blackjack', m.sender);
        }
    }
}

// RPG Adventure (from nima_core.js)
async function rpgCommand(conn, m, db, args) {
    let rpg = gameManager.get('rpg', m.sender);
    if (!rpg) {
        rpg = new RPGAdventure(m.sender);
        gameManager.set('rpg', m.sender, rpg);
    }
    const sub = args[0];
    if (sub === 'fight' || sub === 'attack') {
        if (!rpg.enemy) rpg.spawn();
        const res = rpg.attack();
        if (res.dead) {
            await m.reply(`💀 You died on floor ${rpg.floor}! Game over.`);
            gameManager.delete('rpg', m.sender);
        } else if (res.win) {
            await m.reply(`⚔️ Victory! +${res.gold} gold, +${res.xp} XP${res.levelup ? '\n🆙 LEVEL UP!' : ''}\n\n${rpg.fmt()}`);
        } else {
            await m.reply(`⚔️ You dealt ${res.dmg}, enemy dealt ${res.edmg}\nEnemy HP: ${res.ehp}\n${rpg.fmt()}`);
        }
    } else if (sub === 'heal') {
        const h = rpg.heal();
        if (h === 'poor') await m.reply('Need 10 gold');
        else await m.reply(`❤️ Healed! HP: ${h.hp}\n${rpg.fmt()}`);
    } else if (sub === 'spawn') {
        rpg.spawn();
        await m.reply(`👹 ${rpg.enemy.name} appeared!\n${rpg.fmt()}`);
    } else {
        await m.reply(rpg.fmt());
    }
}

// ==================== MINI GAMES (from nima_core.js) ====================

async function mathQuizGame(m, db, diff, args) {
    const q = require('../lib/games').mathQuiz(diff);
    db.users[m.sender]._math = q;
    await m.reply(`🧠 *Math Quiz [${diff}]*\n${q.q}\n\nReply with the answer.`);
}

async function anagramGame(m, db) {
    const a = require('../lib/games').anagram();
    db.users[m.sender]._anagram = a.original;
    await m.reply(`🔤 Unscramble: *${a.scrambled}*\n\nReply with the correct word.`);
}

async function guessNumberGame(m, db, min, max) {
    const target = rand(min || 1, max || 100);
    db.users[m.sender]._gtn = { target, min: min || 1, max: max || 100, tries: 0 };
    await m.reply(`🔢 Guess the number between ${min || 1} and ${max || 100}`);
}

async function triviaGame(m, db, cat, diff) {
    try {
        const q = await TriviaMaster.get(cat, diff);
        db.users[m.sender]._trivia = q.correct;
        let txt = `🎯 *Trivia* — ${q.category} | ${q.difficulty}\n\n${q.q}\n\n`;
        q.options.forEach((o, i) => txt += `${String.fromCharCode(65 + i)}. ${o}\n`);
        await m.reply(txt);
    } catch (e) {
        await m.reply('❌ Trivia failed');
    }
}

async function pokemonGame(conn, m, db) {
    try {
        const p = await PokemonGame.random();
        db.users[m.sender]._pokemon = p.name;
        await conn.sendMessage(m.chat, { image: { url: p.sprite }, caption: `🔮 Who's that Pokémon?\nType: ${p.types.join('/')}\n\n${p.desc.slice(0,120)}...\n\nReply with the name!` }, { quoted: m });
    } catch (e) {
        await m.reply('❌ Pokemon API error');
    }
}

async function numbersFact(m) {
    try {
        const t = await NumbersGame.trivia();
        await m.reply(`🔢 *Did you know?*\n${t}`);
    } catch (e) {
        await m.reply('❌ Error');
    }
}

// ==================== GROUP GAMES ====================

// Connect 4 (from nima_core.js)
async function connect4Game(conn, m, db) {
    if (!m.isGroup) return m.reply('This game is only available in groups.');
    const opponent = m.mentionedJid?.[0];
    if (!opponent) return m.reply(`Mention an opponent!\nExample: .connect4 @user`);
    if (opponent === m.sender) return m.reply('You cannot play against yourself!');
    if (opponent === conn.user.id.split(':')[0] + '@s.whatsapp.net') return m.reply('Bot cannot play Connect 4 yet.');
    
    let existing = gameManager.findPlayerIn('connect4', m.sender);
    if (existing) return m.reply('You are already in a Connect 4 game! Finish it first.');
    existing = gameManager.findPlayerIn('connect4', opponent);
    if (existing) return m.reply('Opponent is already in a Connect 4 game!');
    
    const gameId = `c4_${Date.now()}`;
    const board = Array(6).fill().map(() => Array(7).fill(0));
    const firstTurn = Math.random() < 0.5 ? 1 : 2;
    const gameData = {
        id: gameId,
        player1: m.sender,
        player2: opponent,
        turn: firstTurn,
        board: board,
        state: 'PLAYING',
        lastMove: Date.now()
    };
    gameManager.set('connect4', gameId, gameData, [m.sender, opponent]);
    const symbols = { 0: '⚪', 1: '🔴', 2: '🟡' };
    let boardStr = '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣\n';
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) boardStr += symbols[board[r][c]];
        boardStr += '\n';
    }
    boardStr += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣';
    const firstPlayer = firstTurn === 1 ? m.sender : opponent;
    await m.reply(`🎮 *Connect 4 Started!*\n🔴 @${m.sender.split('@')[0]} vs 🟡 @${opponent.split('@')[0]}\n\nFirst turn: @${firstPlayer.split('@')[0]}\n\n${boardStr}\n\nReply with column number (1-7) to drop your piece.`, { mentions: [m.sender, opponent] });
}

async function connect4Move(conn, m) {
    const game = gameManager.findPlayerIn('connect4', m.sender);
    if (!game) return;
    const g = game.data;
    if (g.turn !== (g.player1 === m.sender ? 1 : 2)) return m.reply('Not your turn!');
    const col = parseInt(m.text) - 1;
    if (isNaN(col) || col < 0 || col > 6) return m.reply('Invalid column (1-7)');
    let row = -1;
    for (let r = 5; r >= 0; r--) {
        if (g.board[r][col] === 0) { row = r; break; }
    }
    if (row === -1) return m.reply('Column full!');
    g.board[row][col] = g.turn === 1 ? 1 : 2;
    const checkWin = (r,c,p) => {
        const dirs = [[1,0],[0,1],[1,1],[1,-1]];
        for (let [dr,dc] of dirs) {
            let cnt = 1;
            for (let d of [1,-1]) {
                for (let i=1; i<4; i++) {
                    const nr = r + dr*i*d, nc = c + dc*i*d;
                    if (nr>=0 && nr<6 && nc>=0 && nc<7 && g.board[nr][nc] === p) cnt++;
                    else break;
                }
            }
            if (cnt >= 4) return true;
        }
        return false;
    };
    const win = checkWin(row, col, g.turn === 1 ? 1 : 2);
    g.turn = g.turn === 1 ? 2 : 1;
    const symbols = { 0:'⚪', 1:'🔴', 2:'🟡' };
    let boardStr = '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣\n';
    for (let r=0; r<6; r++) { for (let c=0; c<7; c++) boardStr += symbols[g.board[r][c]]; boardStr += '\n'; }
    boardStr += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣';
    if (win) {
        const winner = g.player1 === m.sender ? g.player1 : g.player2;
        await m.reply(`🎉 @${winner.split('@')[0]} wins!\n\n${boardStr}`, { mentions: [winner] });
        gameManager.delete('connect4', game.id);
    } else if (g.board.every(row => row.every(cell => cell !== 0))) {
        await m.reply(`🤝 It's a draw!\n\n${boardStr}`);
        gameManager.delete('connect4', game.id);
    } else {
        const nextPlayer = g.turn === 1 ? g.player1 : g.player2;
        await m.reply(`🔴/@${g.player1.split('@')[0]} vs 🟡/@${g.player2.split('@')[0]}\nTurn: @${nextPlayer.split('@')[0]}\n\n${boardStr}`, { mentions: [nextPlayer] });
    }
}

// ==================== NEW GAMES FROM RESEARCH ====================

// Flag Quiz
async function flagQuizGame(conn, m) {
    const { flag, answer } = await require('../lib/games').flagQuiz();
    db.users[m.sender]._flagAnswer = answer;
    await conn.sendMessage(m.chat, { text: `🏁 *Flag Quiz*\nFlag: ${flag}\n\nWhich country is this?` }, { quoted: m });
}

// Capital Quiz
async function capitalQuizGame(conn, m) {
    const { country, answer } = await require('../lib/games').capitalQuiz();
    db.users[m.sender]._capitalAnswer = answer;
    await m.reply(`🏛️ *Capital Quiz*\nCountry: ${country}\n\nWhat is the capital?`);
}

// Lyrics Game
async function lyricsGameCommand(conn, m, artist, title) {
    const { snippet, artist: a, title: t } = await require('../lib/games').lyricsGame(artist, title);
    db.users[m.sender]._lyricsAnswer = { artist: a, title: t };
    await m.reply(`🎤 *Guess the Song!*\n\nLyrics snippet:\n${snippet}\n\nWhat song is this? (Reply with *title - artist*)`);
}

// Truth or Dare
async function truthOrDareCommand(m, type) {
    const result = require('../lib/games').truthOrDare(type);
    if (type === 'truth' || type === 'dare') await m.reply(`🎲 *${type.toUpperCase()}*\n${result}`);
    else await m.reply(`🎲 *Truth or Dare*\nTruth: ${result.truth}\nDare: ${result.dare}`);
}

// Would You Rather
async function wyrCommand(m) {
    const q = await require('../lib/games').wouldYouRather();
    await m.reply(`🤔 *Would You Rather*\n${q}`);
}

// 8Ball
async function eightBallCommand(m, question) {
    const answer = await require('../lib/games').eightBall(question);
    await m.reply(`🎱 *8Ball*\nQ: ${question}\nA: ${answer}`);
}

// Ship Meter
async function shipCommand(m, name1, name2) {
    const result = await require('../lib/games').ship(name1, name2);
    await m.reply(`💘 *Ship Meter*\n${name1} ❤️ ${name2}\n${result}`);
}

// Random Quote
async function quoteCommand(m) {
    const quote = await require('../lib/games').randomQuote();
    await m.reply(`💬 *Quote*\n${quote}`);
}

// Random Meme
async function memeCommand(conn, m) {
    const meme = await require('../lib/games').randomMeme();
    await conn.sendMessage(m.chat, { image: { url: meme.url }, caption: `${meme.title}\n📁 r/${meme.subreddit}` }, { quoted: m });
}

// Joke
async function jokeCommand(m) {
    const joke = await FunAPIs.dadJoke();
    await m.reply(`😂 *Joke*\n${joke}`);
}

// Fact
async function factCommand(m) {
    const fact = await FunAPIs.uselessFact();
    await m.reply(`🤓 *Random Fact*\n${fact}`);
}

// ==================== ECONOMY GAMES ====================
// (Preserved from nima_core.js – daily, work, rob, transfer, buy, inventory, etc.)

async function dailyCommand(m, db) {
    const user = db.users[m.sender];
    const last = user.lastclaim || 0;
    if (Date.now() - last > 86400000) {
        user.limit += 15;
        user.money += 25000;
        user.lastclaim = Date.now();
        await m.reply(`🎁 *Daily Reward*\n+15 Limit\n+25,000 Money`);
    } else {
        const left = 86400000 - (Date.now() - last);
        await m.reply(`⏳ Come back in ${Math.ceil(left / 3600000)} hours.`);
    }
}

async function workCommand(m, db) {
    const user = db.users[m.sender];
    const last = user.lastwork || 0;
    if (Date.now() - last > 3600000) {
        const jobs = ['programmer', 'designer', 'writer', 'teacher', 'chef', 'driver'];
        const job = pickRandom(jobs);
        const earn = rand(500, 3000);
        user.money += earn;
        user.lastwork = Date.now();
        user.job = job;
        await m.reply(`💼 You worked as a ${job} and earned ${earn} coins!`);
    } else {
        const left = 3600000 - (Date.now() - last);
        await m.reply(`⏳ You need to rest. Come back in ${Math.ceil(left / 60000)} minutes.`);
    }
}

async function robCommand(m, db) {
    const target = m.mentionedJid?.[0];
    if (!target) return m.reply('Tag someone to rob!');
    if (target === m.sender) return m.reply('You cannot rob yourself!');
    const user = db.users[m.sender];
    const victim = db.users[target];
    if (!victim) return m.reply('User not in database.');
    const last = user.lastrob || 0;
    if (Date.now() - last > 3600000) {
        const success = Math.random() < 0.5;
        if (success) {
            const amount = rand(1000, 5000);
            if (victim.money >= amount) {
                victim.money -= amount;
                user.money += amount;
                await m.reply(`💰 Robbed ${amount} coins from @${target.split('@')[0]}!`, { mentions: [target] });
            } else {
                await m.reply(`🚨 @${target.split('@')[0]} is too poor to rob.`, { mentions: [target] });
            }
        } else {
            const penalty = rand(500, 2000);
            user.money = Math.max(0, user.money - penalty);
            await m.reply(`🚔 You got caught! Lost ${penalty} coins.`);
        }
        user.lastrob = Date.now();
    } else {
        const left = 3600000 - (Date.now() - last);
        await m.reply(`⏳ Wait ${Math.ceil(left / 60000)} minutes before robbing again.`);
    }
}

async function transferCommand(m, db, type, amount, target) {
    if (!target || !amount) return m.reply(`Usage: .transfer ${type} @user amount`);
    if (type !== 'limit' && type !== 'money') return m.reply('Type must be limit or money');
    const user = db.users[m.sender];
    const recipient = db.users[target];
    if (!recipient) return m.reply('User not found.');
    if (user[type] < amount) return m.reply(`You don't have enough ${type}.`);
    user[type] -= amount;
    recipient[type] += amount;
    await m.reply(`✅ Transferred ${amount} ${type} to @${target.split('@')[0]}`, { mentions: [target] });
}

async function buyCommand(m, db, item, qty) {
    const shop = { limit: 400 };
    if (!shop[item]) return m.reply('Available: limit');
    const cost = shop[item] * (qty || 1);
    if (db.users[m.sender].money < cost) return m.reply('Not enough money.');
    db.users[m.sender].money -= cost;
    db.users[m.sender][item] += (qty || 1);
    await m.reply(`✅ Bought ${qty || 1} ${item} for ${cost} coins.`);
}

async function inventoryCommand(m, db) {
    const inv = db.users[m.sender];
    const items = Object.entries(inv).filter(([k]) => ['limit', 'money', 'gems', 'job'].includes(k));
    let txt = '🎒 *Inventory*\n';
    for (let [k, v] of items) txt += `• ${k}: ${v}\n`;
    await m.reply(txt);
}

// Bomb game – extracted from nima_core.js
async function bombResponse(m, db) {
    if (!(m.sender in db.game.tebakbom)) return false;
    const game = db.game.tebakbom[m.sender];
    const body = m.text || m.body;
    if (!/^[1-9]|10$/i.test(body)) return true; // invalid input, but still in game
    const picked = parseInt(body) - 1;
    if (game.petak[picked] === 1) return true;
    const bomb = '💣', mark = '🌀';
    if (game.petak[picked] === 2) {
        game.board[picked] = bomb;
        game.pick++;
        game.bomb--;
        game.nyawa.pop();
        if (game.nyawa.length < 1) {
            await m.reply(`*Game over*\nYou stepped on a bomb!\n\n ${game.board.join('')}\n\n*Selected:* ${game.pick}\n_Limit: -1_`);
            delete db.game.tebakbom[m.sender];
        } else {
            await m.reply(`*Choose a number*\n\nYou stepped on a bomb!\n ${game.board.join('')}\n\nSelected: ${game.pick}\nLives left: ${game.nyawa}`);
        }
    } else if (game.petak[picked] === 0) {
        game.petak[picked] = 1;
        game.board[picked] = mark;
        game.pick++;
        game.lolos--;
        if (game.lolos < 1) {
            db.users[m.sender].money += 6000;
            await m.reply(`🎉 *You did great!*\n\n${game.board.join('')}\n\n*Selected:* ${game.pick}\n*Lives left:* ${game.nyawa}\n*Bombs:* ${game.bomb}\n🎉 Bonus Money 💰 *+6,000*`);
            delete db.game.tebakbom[m.sender];
        } else {
            await m.reply(`*Choose a number*\n\n${game.board.join('')}\n\nSelected: ${game.pick}\nLives left: ${game.nyawa}\nBombs: ${game.bomb}`);
        }
    }
    return true; // message handled
}

// Akinator – extracted from nima_core.js
async function akinatorResponse(m) {
    if (!(m.sender in global.db.game.akinator)) return false;
    const game = global.db.game.akinator[m.sender];
    const body = m.text || m.body;
    if (m.quoted && game.key === m.quoted.id) {
        if (body === '5') {
            if (game.progress?.toFixed(0) == 0) {
                delete global.db.game.akinator[m.sender];
                await m.reply('Akinator ended.');
                return true;
            }
            game.isWin = false;
            await game.cancelAnswer();
            let { key } = await m.reply(`Akinator Back: ${game.progress.toFixed(2)}%\n${game.question}\n0 Yes 1 No 2 DontKnow 3 Probably 4 ProbablyNot 5 Back`);
            game.key = key.id;
        } else if (game.isWin && ['benar', 'yes'].includes(body.toLowerCase())) {
            delete global.db.game.akinator[m.sender];
        } else {
            if (!isNaN(body) && /^[0-4]$/.test(body)) {
                if (game.isWin) {
                    let { key } = await m.reply({ image: { url: game.sugestion_photo }, caption: `Akinator: ${game.sugestion_name}\n${game.sugestion_desc}\nBack? 5` });
                    game.key = key.id;
                } else {
                    await game.answer(body);
                    if (game.isWin) {
                        let { key } = await m.reply({ image: { url: game.sugestion_photo }, caption: `Akinator: ${game.sugestion_name}\n${game.sugestion_desc}` });
                        game.key = key.id;
                    } else {
                        let { key } = await m.reply(`Akinator (${game.progress.toFixed(2)}%):\n${game.question}\n0 Yes 1 No 2 DontKnow 3 Probably 4 ProbablyNot 5 Back`);
                        game.key = key.id;
                    }
                }
            }
        }
    }
    return true;
}

// Trivia loop (tebaklirik, tekateki, etc.) – extracted from nima_core.js
async function triviaResponse(m, db, { iGame, similarity, almost }) {
    const games = {
        tebaklirik: db.game.tebaklirik,
        tekateki: db.game.tekateki,
        tebaklagu: db.game.tebaklagu,
        tebakkata: db.game.tebakkata,
        kuismath: db.game.kuismath,
        susunkata: db.game.susunkata,
        tebakkimia: db.game.tebakkimia,
        caklontong: db.game.caklontong,
        tebakangka: db.game.tebakangka,
        tebaknegara: db.game.tebaknegara,
        tebakgambar: db.game.tebakgambar,
        tebakbendera: db.game.tebakbendera
    };
    for (let gameName in games) {
        let game = games[gameName];
        let id = iGame(game, m.chat);
        if ((!m.quoted || id !== m.quoted.id) || !game[m.chat + id]?.jawaban) continue;
        const jawaban = game[m.chat + id].jawaban;
        const budy = (m.text || m.body).toLowerCase();
        if (gameName === 'kuismath') {
            const mode = db.game.kuismath[m.chat + id].mode;
            const diffMap = { noob:1, easy:1.5, medium:2.5, hard:4, extreme:5, impossible:6, impossible2:7 };
            const bonus = diffMap[mode] * 1000;
            if (!isNaN(m.text) && m.text.toLowerCase() == jawaban) {
                db.users[m.sender].money += bonus;
                await m.reply(`Correct! +${bonus} money`);
                delete db.game.kuismath[m.chat + id];
            } else await m.reply('Wrong!');
        } else {
            const exact = /caklontong|susunkata/.test(gameName);
            const correct = exact ? budy === jawaban : similarity(budy, jawaban) >= almost;
            const bonus = gameName === 'caklontong' ? 9999 : gameName === 'tebaklirik' ? 4299 : gameName === 'susunkata' ? 2989 : 3499;
            if (correct) {
                db.users[m.sender].money += bonus;
                await m.reply(`Correct! +${bonus} money`);
                delete game[m.chat + id];
            } else await m.reply('Wrong!');
        }
        return true; // message handled
    }
    return false;
}

// Family 100 – extracted from nima_core.js
async function family100Response(m, db) {
    if (!(m.chat in db.game.family100)) return false;
    const room = db.game.family100[m.chat];
    if (!m.quoted || m.quoted.id !== room.id) return false;
    const teks = (m.text || m.body).toLowerCase().replace(/[^\w\s\-]+/, '');
    if (/^(me)?nyerah|surr?ender$/i.test(teks)) {
        // surrender: show all answers
        let caption = `Question: ${room.soal}\nAnswers:\n`;
        room.jawaban.forEach((ans, idx) => {
            caption += `(${idx+1}) ${ans}\n`;
        });
        await m.reply(caption);
        delete db.game.family100[m.chat];
        return true;
    }
    const index = room.jawaban.findIndex(v => v.toLowerCase().replace(/[^\w\s\-]+/, '') === teks);
    if (index === -1 || room.terjawab[index]) return false;
    room.terjawab[index] = m.sender;
    const isWin = room.terjawab.filter(Boolean).length === room.jawaban.length;
    let caption = `Question: ${room.soal}\nAnswers:\n`;
    room.jawaban.forEach((ans, idx) => {
        if (room.terjawab[idx]) {
            caption += `(${idx+1}) ${ans} @${room.terjawab[idx].split('@')[0]}\n`;
        } else {
            caption += `(${idx+1}) ...\n`;
        }
    });
    if (isWin) {
        caption += '\nAll answered!';
        delete db.game.family100[m.chat];
    }
    await m.reply(caption);
    return true;
}

// Snake Ladder – extracted from nima_core.js
async function snakeLadderResponse(conn, m, db) {
    if (!(m.chat in db.game.ulartangga)) return false;
    const game = db.game.ulartangga[m.chat];
    if (!m.quoted || game.id !== m.quoted.id) return false;
    const text = (m.text || m.body).toLowerCase();
    if (!/^(roll|kocok)/i.test(text)) {
        await m.reply('Type "roll" to roll dice.');
        return true;
    }
    const playerIdx = game.players.findIndex(p => p.id === m.sender);
    if (game.turn !== playerIdx) return m.reply('Not your turn!');
    const roll = game.roll();
    await m.reply(`https://raw.githubusercontent.com/luckyfelistine-bot/maureonix/main/database/dice/roll-${roll}.webp`);
    game.next();
    game.players[playerIdx].move += roll;
    if (game.players[playerIdx].move > 100) game.players[playerIdx].move = 100 - (game.players[playerIdx].move - 100);
    let teks = `SnakeLadder: ${game.players[playerIdx].move}\n`;
    if (Object.keys(game.map.move).includes(game.players[playerIdx].move.toString())) {
        const dest = game.map.move[game.players[playerIdx].move];
        teks += game.players[playerIdx].move > dest ? 'Snake!' : 'Ladder!';
        game.players[playerIdx].move = dest;
    }
    const newMap = await game.draw(game.map.url, game.players);
    if (game.players[playerIdx].move === 100) {
        teks += `\n@${m.sender.split('@')[0]} wins! +50 limit, +100k money`;
        db.users[m.sender].limit += 50;
        db.users[m.sender].money += 100000;
        delete db.game.ulartangga[m.chat];
        return await m.reply({ image: newMap, caption: teks, mentions: [m.sender] });
    }
    let { key } = await m.reply({ image: newMap, caption: teks + `\nTurn: @${game.players[game.turn].id.split('@')[0]}`, mentions: [m.sender, game.players[game.turn].id] });
    game.id = key.id;
    return true;
}

// Mini-game answer handlers – extracted from nima_core.js
async function miniGameAnswer(m, db) {
    const budy = (m.text || m.body).trim();
    const userId = m.sender;
    if (db.users[userId]._trivia && budy) {
        if (budy.toLowerCase() === db.users[userId]._trivia.toLowerCase()) {
            db.users[userId].money += 50;
            await m.reply('Correct! +50 money');
        } else await m.reply('Wrong!');
        delete db.users[userId]._trivia;
        return true;
    }
    if (db.users[userId]._math && !isNaN(budy)) {
        const ans = db.users[userId]._math.ans;
        if (parseInt(budy) === ans) {
            db.users[userId].money += 30;
            await m.reply('Correct! +30 money');
        } else await m.reply(`Wrong! Answer was ${ans}`);
        delete db.users[userId]._math;
        return true;
    }
    if (db.users[userId]._anagram && budy.length > 2) {
        const orig = db.users[userId]._anagram;
        if (budy.toUpperCase() === orig) {
            db.users[userId].money += 40;
            await m.reply('Correct! +40 money');
        } else await m.reply(`Wrong! It was ${orig}`);
        delete db.users[userId]._anagram;
        return true;
    }
    if (db.users[userId]._gtn && !isNaN(budy)) {
        const g = db.users[userId]._gtn;
        const n = parseInt(budy);
        g.tries++;
        if (n === g.target) {
            const reward = Math.max(10, 100 - g.tries * 5);
            db.users[userId].money += reward;
            await m.reply(`Correct in ${g.tries} tries! +${reward} money`);
            delete db.users[userId]._gtn;
        } else if (n < g.target) await m.reply('Higher!');
        else await m.reply('Lower!');
        return true;
    }
    if (db.users[userId]._pokemon && budy.length > 2) {
        const name = db.users[userId]._pokemon;
        if (budy.toLowerCase() === name.toLowerCase()) {
            db.users[userId].money += 60;
            await m.reply(`Correct! It's ${name}! +60 money`);
        } else await m.reply(`Wrong! It was ${name}`);
        delete db.users[userId]._pokemon;
        return true;
    }
    if (db.users[userId]._movieguess && budy.length > 2) {
        const movie = db.users[userId]._movieguess;
        if (budy.toLowerCase() === movie.toLowerCase()) {
            db.users[userId].money += 70;
            await m.reply('Correct! +70 money');
        } else await m.reply(`Wrong! It was ${movie}`);
        delete db.users[userId]._movieguess;
        return true;
    }
    return false;
}


// ==================== EXPORT ALL ====================

module.exports = {
    // PvP games
    suitGame,
    suitAccept,
    suitChoice,
    chessGame,
    chessMove,
    connect4Game,
    connect4Move,
    // Solo games
    blackjackGame,
    rpgCommand,
    // Mini games
    mathQuizGame,
    anagramGame,
    guessNumberGame,
    triviaGame,
    pokemonGame,
    numbersFact,
    // New research games
    flagQuizGame,
    capitalQuizGame,
    lyricsGameCommand,
    truthOrDareCommand,
    wyrCommand,
    eightBallCommand,
    shipCommand,
    quoteCommand,
    memeCommand,
    jokeCommand,
    factCommand,
    // Economy
    dailyCommand,
    workCommand,
    robCommand,
    transferCommand,
    buyCommand,
    inventoryCommand,
        // ADD these new ones:
    bombResponse,
    akinatorResponse,
    triviaResponse,
    family100Response,
    snakeLadderResponse,
    miniGameAnswer,
    // Utilities (for other modules)
    getGame,
    gameManager
};
