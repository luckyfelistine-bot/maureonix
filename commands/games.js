// commands/games.js – Slot, RPG, Blackjack, Connect4, RAWG, Trivia, Casino, Mini-games
const { pickRandom } = require('../lib/function');

module.exports = {
    slot: async (nimesha, m, { slotMachine, Economy }) => {
        const res = slotMachine();
        const u = Economy.ensureUser(m.sender);
        if (res.win) { u.coins += res.amount; await m.reply(`🎰 ${res.reels.join(' | ')}\n\n🎉 You won ${res.amount} coins!`); }
        else { u.coins = Math.max(0, u.coins - 10); await m.reply(`🎰 ${res.reels.join(' | ')}\n\n😞 Lost 10 coins`); }
    },
    slots: async (nimesha, m, ctx) => { await module.exports.slot(nimesha, m, ctx); },
    rpg: async (nimesha, m, { args, db, RPGAdventure }) => {
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
    },
    blackjack: async (nimesha, m, { text, db, BlackjackCasino }) => {
        if (!db.users[m.sender]) db.users[m.sender] = {};
        if (!db.users[m.sender].blackjack) {
            db.users[m.sender].blackjack = new BlackjackCasino();
            await m.reply(`🃏 *Blackjack Started!*\n${db.users[m.sender].blackjack.status()}\n\nReply with:\n- *hit* to take a card\n- *stand* to hold`);
        } else {
            const game = db.users[m.sender].blackjack;
            if (text.toLowerCase() === 'hit') {
                const val = game.hit();
                if (val > 21) { await m.reply(`💥 BUST! ${game.reveal()}`); delete db.users[m.sender].blackjack; }
                else await m.reply(`🃏 You drew: ${game.player.slice(-1)[0]} (Total: ${val})\n${game.status()}`);
            } else if (text.toLowerCase() === 'stand') {
                const result = game.stand();
                await m.reply(`${game.reveal()}\n\n${result === 'win' ? '🎉 You win!' : result === 'lose' ? '💀 Dealer wins' : '🤝 Draw'}`);
                delete db.users[m.sender].blackjack;
            }
        }
    },
    connect4: async (nimesha, m, { prefix, command, db, botNumber }) => {
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
        db.game.connect4[gameId] = { id: gameId, player1: m.sender, player2: opponent, turn: firstTurn, board, state: 'PLAYING', lastMove: Date.now() };
        const symbols = { 0: '⚪', 1: '🔴', 2: '🟡' };
        let boardStr = '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣\n';
        for (let r = 0; r < 6; r++) { for (let c = 0; c < 7; c++) boardStr += symbols[board[r][c]]; boardStr += '\n'; }
        boardStr += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣';
        const firstPlayer = firstTurn === 1 ? m.sender : opponent;
        await m.reply(`🎮 *Connect 4 Started!*\n🔴 @${m.sender.split('@')[0]} vs 🟡 @${opponent.split('@')[0]}\n\nFirst turn: @${firstPlayer.split('@')[0]}\n\n${boardStr}\n\nReply with column number (1-7) to drop your piece.`, { mentions: [m.sender, opponent] });
    },
    c4: async (nimesha, m, ctx) => { await module.exports.connect4(nimesha, m, ctx); },
    math: async (nimesha, m, { args, mathQuiz, db }) => {
        const diff = args[0] || 'medium';
        const q = mathQuiz(diff);
        db.users[m.sender]._math = q;
        m.reply(`🧠 *Math Quiz [${diff}]*\n${q.q}\n\nReply with the answer.`);
    },
    anagram: async (nimesha, m, { anagram, db }) => {
        const a = anagram();
        db.users[m.sender]._anagram = a.original;
        m.reply(`🔤 Unscramble: *${a.scrambled}*\n\nReply with the correct word.`);
    },
    guessnum: async (nimesha, m, { args, numberGuess, db }) => {
        db.users[m.sender]._gtn = numberGuess(parseInt(args[0]) || 1, parseInt(args[1]) || 100);
        m.reply(`🔢 Guess the number between ${db.users[m.sender]._gtn.min} and ${db.users[m.sender]._gtn.max}`);
    },
    trivia: async (nimesha, m, { args, TriviaMaster, db }) => {
        try {
            const q = await TriviaMaster.get(args[0], args[1]);
            db.users[m.sender]._trivia = q.correct;
            let txt = `🎯 *Trivia* — ${q.category} | ${q.difficulty}\n\n${q.q}\n\n`;
            q.options.forEach((o, i) => txt += `${String.fromCharCode(65 + i)}. ${o}\n`);
            m.reply(txt);
        } catch (e) { m.reply('❌ Trivia failed'); }
    },
    pokemon: async (nimesha, m, { PokemonGame, db }) => {
        try {
            const p = await PokemonGame.random();
            db.users[m.sender]._pokemon = p.name;
            await nimesha.sendMessage(m.chat, { image: { url: p.sprite }, caption: `🔮 Who's that Pokémon?\nType: ${p.types.join('/')}\n\n${p.desc.slice(0, 120)}...\n\nReply with the name!` }, { quoted: m });
        } catch (e) { m.reply('❌ Pokemon API error'); }
    },
    numbers: async (nimesha, m, { NumbersGame }) => {
        try { const t = await NumbersGame.trivia(); m.reply(`🔢 *Did you know?*\n${t}`); } catch (e) { m.reply('❌ Error'); }
    },
    // RAWG games
    rawg: async (nimesha, m, { text, RAWG, prefix, command }) => {
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
    },
    gameinfo: async (nimesha, m, { text, RAWG, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <rawg-id or slug>`);
        await m.reply('🎮 Fetching game details...');
        try {
            const g = await RAWG.details(text);
            m.reply(RAWG.format(g));
        } catch (e) { m.reply('❌ ' + e.message); }
    },
    gamestores: async (nimesha, m, { text, RAWG, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <game-id>`);
        try {
            const s = await RAWG.stores(text);
            let txt = `🏪 *Stores*\n`; (s.results || []).forEach(x => txt += `• ${x.store.name}: ${x.url}\n`);
            m.reply(txt || 'No store links.');
        } catch (e) { m.reply('❌ ' + e.message); }
    },
    screenshots: async (nimesha, m, { text, RAWG, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <game-id>`);
        try {
            const s = await RAWG.screens(text);
            if (!s.results?.length) return m.reply('No screenshots.');
            for (let i of s.results.slice(0, 5)) await nimesha.sendMessage(m.chat, { image: { url: i.image }, caption: '🎮 Screenshot' }, { quoted: m });
        } catch (e) { m.reply('❌ ' + e.message); }
    },
    trailers: async (nimesha, m, { text, RAWG, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <game-id>`);
        try {
            const t = await RAWG.trailers(text);
            if (!t.results?.length) return m.reply('No trailers.');
            let txt = `🎬 *Trailers*\n`; t.results.forEach((v, i) => txt += `${i + 1}. [${v.name}](${v.data?.max || v.data?.[480] || v.data?.[720]})\n`);
            m.reply(txt);
        } catch (e) { m.reply('❌ ' + e.message); }
    },
    topgames: async (nimesha, m, { RAWG }) => {
        try { const r = await RAWG.top(); let txt = `🏆 *Top Rated Games*\n\n`; r.results.forEach((g, i) => txt += `${i + 1}. *${g.name}* — ⭐${g.rating}\n`); m.reply(txt); } catch (e) { m.reply('❌ ' + e.message); }
    },
    upcominggames: async (nimesha, m, { RAWG }) => {
        try { const r = await RAWG.upcoming(); let txt = `🔜 *Upcoming Games*\n\n`; r.results.forEach((g, i) => txt += `${i + 1}. *${g.name}* — 📅 ${g.released || 'TBA'}\n`); m.reply(txt); } catch (e) { m.reply('❌ ' + e.message); }
    },
    // Casino
    roulette: async (nimesha, m, { args, db, rouletteSpin, prefix, command }) => {
        if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <amount> <red/black/even/odd/number>`);
        const bet = parseInt(args[0]); const choice = args[1].toLowerCase();
        if (isNaN(bet) || db.users[m.sender].money < bet) return m.reply('Invalid bet or insufficient money.');
        const r = rouletteSpin(); let win = false, mult = 0;
        if (['red', 'black', 'even', 'odd'].includes(choice) && r.color.includes(choice === 'red' ? '🔴' : choice === 'black' ? '⚫' : choice === 'even' ? (r.even ? 'yes' : 'no') : !r.even ? 'yes' : 'no')) { win = true; mult = 2; }
        else if (!isNaN(parseInt(choice)) && parseInt(choice) === r.res) { win = true; mult = 36; }
        if (win) { db.users[m.sender].money += bet * mult; m.reply(`🎰 ${r.res} ${r.color}\n\n🎉 WIN! +${bet * mult}`); }
        else { db.users[m.sender].money -= bet; m.reply(`🎰 ${r.res} ${r.color}\n\n💀 Lose -${bet}`); }
    },
    crash: async (nimesha, m, { args, db, crash, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <amount> <auto-cashout-multiplier>`);
        const bet = parseInt(args[0]); const target = parseFloat(args[1]) || 2.0;
        if (db.users[m.sender].money < bet) return m.reply('Too poor!');
        db.users[m.sender].money -= bet;
        const c = crash();
        if (target <= c.crash) { const win = Math.floor(bet * target); db.users[m.sender].money += win; m.reply(`📈 Crashed at ${c.crash}x\n✅ You cashed out @ ${target}x\n🎉 +${win}`); }
        else { m.reply(`📈 Crashed at ${c.crash}x\n💀 You aimed for ${target}x\nBUST!`); }
    },
    dice: async (nimesha, m, { args, db, diceRoll, prefix, command }) => {
        if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <amount> <over/under> <number 2-11>`);
        const bet = parseInt(args[0]); const mode = args[1]; const num = parseInt(args[2]);
        if (db.users[m.sender].money < bet) return m.reply('Too poor!');
        const d1 = diceRoll(), d2 = diceRoll(), sum = d1 + d2;
        const win = (mode === 'over' && sum > num) || (mode === 'under' && sum < num) || (mode === 'exact' && sum === num);
        const mult = mode === 'exact' ? 5 : 2;
        if (win) { db.users[m.sender].money += bet * mult; m.reply(`🎲 ${d1} + ${d2} = ${sum}\n🎉 WIN! +${bet * mult}`); }
        else { db.users[m.sender].money -= bet; m.reply(`🎲 ${d1} + ${d2} = ${sum}\n💀 Lose`); }
    },
    coinflip: async (nimesha, m, { args, db, coinflip, prefix, command }) => {
        if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <amount> <heads/tails>`);
        const bet = parseInt(args[0]); const side = args[1].toLowerCase(); const r = coinflip();
        if (db.users[m.sender].money < bet) return m.reply('Too poor!');
        if (side === r) { db.users[m.sender].money += bet; m.reply(`🪙 ${r}\n🎉 WIN +${bet}`); }
        else { db.users[m.sender].money -= bet; m.reply(`🪙 ${r}\n💀 Lose`); }
    },
    rps: async (nimesha, m, { args, pickRandom, rpsls }) => {
        const choices = ['rock', 'paper', 'scissors', 'lizard', 'spock'];
        if (!args[0] || !choices.includes(args[0])) return m.reply(`Pick: rock, paper, scissors, lizard, spock`);
        const p1 = args[0]; const p2 = pickRandom(choices);
        const res = rpsls(p1, p2);
        m.reply(`You: ${p1}\nBot: ${p2}\n\n${res === 'draw' ? '🤝 Draw' : res === 'p1' ? '🎉 You win!' : '💀 Bot wins!'}`);
    },
    gamemenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *🎮 GAMES COMMANDS*  ║\n╚══════════════════════╝\n\n📌 *Multiplayer*\n▸ ${prefix}connect4 @user\n▸ ${prefix}suit @user\n▸ ${prefix}chess @user\n\n📌 *Single Player*\n▸ ${prefix}slot – Slot machine\n▸ ${prefix}blackjack – Play blackjack\n▸ ${prefix}rpg – Adventure RPG\n▸ ${prefix}math – Math quiz\n▸ ${prefix}tebaklagu – Guess song\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },
    rpgmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *🧙 RPG ADVENTURE*  ║\n╚══════════════════════╝\n\n📌 *Commands*\n▸ ${prefix}rpg – View your stats\n▸ ${prefix}rpg fight – Attack current enemy\n▸ ${prefix}rpg heal – Heal 40 HP (costs 10 gold)\n▸ ${prefix}rpg spawn – Summon a new enemy\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },
    casinomenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *🎰 CASINO COMMANDS*  ║\n╚══════════════════════╝\n\n📌 *Games*\n▸ ${prefix}slot – Spin the slot machine\n▸ ${prefix}roulette <bet> <red/black/even/odd/number>\n▸ ${prefix}crash <bet> <multiplier> – Crash game\n▸ ${prefix}dice <bet> over/under <2-11>\n▸ ${prefix}coin <bet> heads/tails\n▸ ${prefix}rps <rock/paper/scissors/lizard/spock>\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },
    // Aliases
    bj: async (nimesha, m, ctx) => { await module.exports.blackjack(nimesha, m, ctx); },
    suitpro: async (nimesha, m, ctx) => { await module.exports.rps(nimesha, m, ctx); },
    coin: async (nimesha, m, ctx) => { await module.exports.coinflip(nimesha, m, ctx); },
};