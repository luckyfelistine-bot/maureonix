// ╔══════════════════════════════════════════════════════════════════╗
// ║  🔥 MAUREONIX GODMODE GAME ENGINE v6.0.1                       ║
// ║  Merged: tictactoe.js + games.js + game.js + RAWG + Free APIs  ║
// ║  Created by Infinite Vybeflix — Destroyer of Boredom           ║
// ║  UPGRADED: GameManager integration for stability & auto-cleanup ║
// ╚══════════════════════════════════════════════════════════════════╝

require('../settings');
const fs = require('fs');
const jimp = require('jimp');
const chalk = require('chalk');
const fetch = require('node-fetch');
const { sleep, clockString } = require('./function');
const gameManager = require('./gameManager');   // ← new central state

const pickRandom = (list) => list[Math.floor(list.length * Math.random())];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ═══════════════════════════════════════════════════════════════════
//  RAWG.IO ULTIMATE CLIENT
// ═══════════════════════════════════════════════════════════════════
const RAWG_KEY = '87d2613ba4b34b7d83929fcd8516f43b';
const RAWG_BASE = 'https://api.rawg.io/api';

class RAWG {
  static async req(endpoint, params = {}) {
    const u = new URL(RAWG_BASE + endpoint);
    u.searchParams.set('key', RAWG_KEY);
    Object.entries(params).forEach(([k, v]) => v !== undefined && u.searchParams.set(k, v));
    const r = await fetch(u.toString(), { timeout: 15000 });
    if (!r.ok) throw new Error(`RAWG ${r.status}`);
    return await r.json();
  }
  static search(q, page = 1, ps = 10) { return this.req('/games', { search: q, page, page_size: ps }); }
  static details(id) { return this.req(`/games/${id}`); }
  static screens(id) { return this.req(`/games/${id}/screenshots`); }
  static trailers(id) { return this.req(`/games/${id}/movies`); }
  static stores(id) { return this.req(`/games/${id}/stores`); }
  static achievements(id, page = 1) { return this.req(`/games/${id}/achievements`, { page }); }
  static dlc(id) { return this.req(`/games/${id}/additions`); }
  static series(id) { return this.req(`/games/${id}/game-series`); }
  static reddit(id) { return this.req(`/games/${id}/reddit`); }
  static devs(page = 1) { return this.req('/developers', { page, page_size: 20 }); }
  static pubs(page = 1) { return this.req('/publishers', { page, page_size: 20 }); }
  static genres() { return this.req('/genres'); }
  static platforms() { return this.req('/platforms'); }
  static tags(ps = 40) { return this.req('/tags', { page_size: ps }); }
  static creators(page = 1) { return this.req('/creators', { page, page_size: 20 }); }
  static upcoming() {
    const d = new Date(); const y = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return this.req('/games', { dates: `${y},2099-12-31`, ordering: '-added', page_size: 10 });
  }
  static top() {
    const d = new Date(); const y = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return this.req('/games', { dates: `2000-01-01,${y}`, ordering: '-rating', page_size: 10 });
  }
  static format(g) {
    return `🎮 *${g.name}*\n⭐ RAWG Rating: ${g.rating || 'N/A'}/5 | 🔥 ${g.ratings_count || 0} ratings\n📅 Released: ${g.released || 'TBA'}\n🎭 Genres: ${(g.genres || []).map(x => x.name).join(', ') || '-'}\n🖥️ Platforms: ${(g.platforms || []).map(x => x.platform.name).join(', ') || '-'}\n🏪 Stores: ${(g.stores || []).map(x => x.store.name).join(', ') || '-'}\n📝 ${(g.description_raw || g.description || 'No description.').toString().replace(/<[^>]+>/g, '').slice(0, 350)}...\n🔗 ${g.website || `https://rawg.io/games/${g.slug}`}`;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  FREE API HELPERS (NO KEY NEEDED)
// ═══════════════════════════════════════════════════════════════════
class TriviaMaster {
  static async get(cat, diff) {
    const cats = { general: 9, books: 10, film: 11, music: 12, games: 15, tv: 14, science: 17, computers: 18, math: 19, myth: 20, sports: 21, geo: 22, hist: 23, pol: 24, art: 25, celeb: 26, animals: 27 };
    const url = `https://opentdb.com/api.php?amount=1&type=multiple${cat ? '&category=' + cats[cat] : ''}${diff ? '&difficulty=' + diff : ''}`;
    const r = await fetch(url).then(x => x.json());
    if (r.response_code !== 0) throw new Error('Trivia failed');
    const q = r.results[0];
    return { q: q.question, correct: q.correct_answer, options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5), category: q.category, difficulty: q.difficulty };
  }
}

class PokemonGame {
  static async random() {
    const id = rand(1, 898);
    const p = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(x => x.json());
    const s = await fetch(p.species.url).then(x => x.json());
    const desc = s.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text.replace(/\s+/g, ' ') || 'A wild Pokémon appears!';
    return { name: p.name, types: p.types.map(t => t.type.name), sprite: p.sprites.other['official-artwork'].front_default || p.sprites.front_default, desc, stats: p.stats.map(s => ({ name: s.stat.name, val: s.base_stat })) };
  }
}

class NumbersGame {
  static trivia() { return fetch('http://numbersapi.com/random/trivia').then(x => x.text()); }
  static math() { return fetch('http://numbersapi.com/random/math').then(x => x.text()); }
  static year() { return fetch('http://numbersapi.com/random/year').then(x => x.text()); }
}

// Free Fun APIs
class FunAPIs {
  static async chuckNorris() {
    const r = await fetch('https://api.chucknorris.io/jokes/random').then(x => x.json());
    return r.value;
  }
  static async dadJoke() {
    const r = await fetch('https://icanhazdadjoke.com/', { headers: { Accept: 'application/json' } }).then(x => x.json());
    return r.joke;
  }
  static async advice() {
    const r = await fetch('https://api.adviceslip.com/advice').then(x => x.json());
    return r.slip.advice;
  }
  static async uselessFact() {
    const r = await fetch('https://uselessfacts.jsph.pl/random.json?language=en').then(x => x.json());
    return r.text;
  }
  static async catFact() {
    const r = await fetch('https://catfact.ninja/fact').then(x => x.json());
    return r.fact;
  }
  static async dogFact() {
    const r = await fetch('https://dog-api.kinduff.com/api/facts').then(x => x.json());
    return r.facts[0];
  }
  static async bored() {
    const r = await fetch('https://www.boredapi.com/api/activity').then(x => x.json());
    return `${r.activity} (Type: ${r.type}, Participants: ${r.participants})`;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  TICTACTOE (BITWISE) — Used by nima.js handler
// ═══════════════════════════════════════════════════════════════════
class TicTacToe {
  constructor(playerX = 'x', playerO = 'o') {
    this.playerX = playerX; this.playerO = playerO;
    this._currentTurn = false; this._x = 0; this._o = 0; this.turns = 0;
  }
  get board() { return this._x | this._o; }
  get currentTurn() { return this._currentTurn ? this.playerO : this.playerX; }
  get enemyTurn() { return this._currentTurn ? this.playerX : this.playerO; }
  static check(state) { for (let c of [7, 56, 73, 84, 146, 273, 292, 448]) if ((state & c) === c) return !0; return !1; }
  static toBinary(x = 0, y = 0) { if (x < 0 || x > 2 || y < 0 || y > 2) throw new Error('invalid'); return 1 << x + (3 * y); }
  turn(player = 0, x = 0, y) {
    if (this.board === 511) return -3;
    let pos = 0;
    if (y == null) { if (x < 0 || x > 8) return -1; pos = 1 << x; }
    else { if (x < 0 || x > 2 || y < 0 || y > 2) return -1; pos = TicTacToe.toBinary(x, y); }
    if (this._currentTurn ^ player) return -2;
    if (this.board & pos) return 0;
    this[this._currentTurn ? '_o' : '_x'] |= pos;
    this._currentTurn = !this._currentTurn; this.turns++; return 1;
  }
  static render(bX = 0, bO = 0) { let x = parseInt(bX.toString(2), 4), y = parseInt(bO.toString(2), 4) * 2; return [...(x + y).toString(4).padStart(9, '0')].reverse().map((v, i) => v == 1 ? 'X' : v == 2 ? 'O' : ++i); }
  render() { return TicTacToe.render(this._x, this._o); }
  get winner() { return TicTacToe.check(this._x) ? this.playerX : TicTacToe.check(this._o) ? this.playerO : false; }
}

// ═══════════════════════════════════════════════════════════════════
//  TICTACTOE CLASSIC
// ═══════════════════════════════════════════════════════════════════
class TicTacToeClassic {
  constructor(p1, p2) { this.board = Array(9).fill(null); this.players = { X: p1, O: p2 }; this.turn = 'X'; this.winner = null; }
  move(pos) {
    if (this.board[pos] || this.winner) return 'invalid';
    this.board[pos] = this.turn;
    if (this.checkWin(this.turn)) { this.winner = this.turn; return 'win'; }
    if (this.board.every(c => c)) return 'draw';
    this.turn = this.turn === 'X' ? 'O' : 'X'; return 'continue';
  }
  checkWin(p) { return [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]].some(c => c.every(i => this.board[i] === p)); }
  render() { const b = this.board.map((c, i) => c || (i + 1)); return `${b[0]}│${b[1]}│${b[2]}\n─┼─┼─\n${b[3]}│${b[4]}│${b[5]}\n─┼─┼─\n${b[6]}│${b[7]}│${b[8]}`; }
}

// ═══════════════════════════════════════════════════════════════════
//  CONNECT 4
// ═══════════════════════════════════════════════════════════════════
class Connect4 {
  constructor(p1, p2) { this.board = Array(6).fill().map(() => Array(7).fill(null)); this.players = [p1, p2]; this.turn = 0; this.winner = null; }
  drop(c) { for (let r = 5; r >= 0; r--) { if (!this.board[r][c]) { this.board[r][c] = this.turn; if (this.check(r, c)) { this.winner = this.players[this.turn]; return { ok: true, win: true }; } this.turn = this.turn ? 0 : 1; return { ok: true, win: false }; } } return { ok: false }; }
  check(r, c) { const p = this.board[r][c]; for (let [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) { let cnt = 1; for (let m of [1, -1]) for (let i = 1; i < 4; i++) { const nr = r + dr * i * m, nc = c + dc * i * m; if (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && this.board[nr][nc] === p) cnt++; else break; } if (cnt >= 4) return true; } return false; }
}

// ═══════════════════════════════════════════════════════════════════
//  BATTLESHIP
// ═══════════════════════════════════════════════════════════════════
class Battleship {
  constructor(p1, p2) {
    this.p1 = p1; this.p2 = p2; this.turn = p1;
    this.b = { [p1]: this.mk(), [p2]: this.mk() };
    this.s = { [p1]: this.mk(), [p2]: this.mk() };
    this.ships = { [p1]: this.randPlace(), [p2]: this.randPlace() };
  }
  mk() { return Array(10).fill().map(() => Array(10).fill('🌊')); }
  randPlace() { const s = []; for (let l of [5, 4, 3, 3, 2]) { let placed = false; while (!placed) { const h = Math.random() < 0.5; const r = rand(0, 9), c = rand(0, 9); if (h && c + l <= 10) { s.push({r,c,l,h}); placed = true; } else if (!h && r + l <= 10) { s.push({r,c,l,h}); placed = true; } } } return s; }
  shoot(who, x, y) {
    if (who !== this.turn) return { ok: false, msg: 'Not your turn' };
    const opp = who === this.p1 ? this.p2 : this.p1;
    if (this.s[who][y][x] !== '🌊') return { ok: false, msg: 'Already shot there' };
    const hit = this.ships[opp].some(sh => sh.h ? sh.r === y && x >= sh.c && x < sh.c + sh.l : sh.c === x && y >= sh.r && y < sh.r + sh.l);
    this.s[who][y][x] = hit ? '💥' : '❌';
    if (hit) { let total = 0, got = 0; for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) if (this.s[who][r][c] === '💥') got++; for (let sh of this.ships[opp]) total += sh.l; if (got >= total) { this.winner = who; return { ok: true, hit, win: true }; } }
    this.turn = opp; return { ok: true, hit, win: false };
  }
  renderBoard(who, hide = false) { let t = '  0 1 2 3 4 5 6 7 8 9\n'; for (let r = 0; r < 10; r++) { t += String(r) + ' '; for (let c = 0; c < 10; c++) t += this.s[who][r][c] + ' '; t += '\n'; } return '```\n' + t + '```'; }
}

// ═══════════════════════════════════════════════════════════════════
//  WORDLE & HANGMAN
// ═══════════════════════════════════════════════════════════════════
class Wordle {
  constructor(word) { this.word = word || ['APPLE', 'BEACH', 'CHAIR', 'DANCE', 'EAGLE', 'FLAME', 'GRAPE', 'HOUSE', 'IGLOO', 'JUICE', 'MAURE', 'NEBULA', 'QUANT', 'VIBES', 'PIXEL'][Math.floor(Math.random() * 15)]; this.guesses = []; this.max = 6; }
  guess(w) { w = w.toUpperCase(); if (w.length !== 5) return 'invalid'; this.guesses.push(w); let r = ''; for (let i = 0; i < 5; i++) { if (w[i] === this.word[i]) r += '🟩'; else if (this.word.includes(w[i])) r += '🟨'; else r += '⬛'; } return { result: r, won: w === this.word, lost: this.guesses.length >= this.max && w !== this.word, answer: w === this.word || (this.guesses.length >= this.max && w !== this.word) ? this.word : null }; }
}

class Hangman {
  constructor() {
    this.pool = ['JAVASCRIPT', 'NODEJS', 'BAILEYS', 'WHATSAPP', 'MAUREONIX', 'CYBERPUNK', 'QUANTUM', 'NEBULA', 'GALAXY', 'INFINITE', 'VYBEFLIX', 'BLACKJACK', 'LEOPARD', 'TIGER', 'PYTHON', 'GODMODE'];
    this.word = pickRandom(this.pool); this.guessed = new Set(); this.lives = 6;
  }
  guess(ch) { ch = ch.toUpperCase(); if (this.guessed.has(ch)) return 'already'; this.guessed.add(ch); if (!this.word.includes(ch)) this.lives--; const display = this.word.split('').map(c => this.guessed.has(c) ? c : '_').join(' '); const won = !display.includes('_'); return { display, lives: this.lives, won, lost: this.lives <= 0, word: this.word }; }
}

// ═══════════════════════════════════════════════════════════════════
//  BLACKJACK (CASINO SOLO)
// ═══════════════════════════════════════════════════════════════════
class BlackjackCasino {
  constructor() {
    this.deck = this.shuffle([...'♥♦♣♠'].flatMap(s => [...'23456789TJQKA'].map(v => v + s)));
    this.player = [this.draw(), this.draw()]; this.dealer = [this.draw(), this.draw()]; this.done = false;
  }
  shuffle(d) { for (let i = d.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; } return d; }
  draw() { return this.deck.pop(); }
  val(h) { let v = 0, a = 0; for (let c of h) { let r = c.slice(0, -1); if (r === 'A') { a++; v += 11; } else if ('TJQK'.includes(r)) v += 10; else v += parseInt(r); } while (v > 21 && a--) v -= 10; return v; }
  hit() { this.player.push(this.draw()); if (this.val(this.player) > 21) this.done = true; return this.val(this.player); }
  stand() {
    this.done = true;
    while (this.val(this.dealer) < 17) this.dealer.push(this.draw());
    const pv = this.val(this.player), dv = this.val(this.dealer);
    if (pv > 21) return 'bust'; if (dv > 21 || pv > dv) return 'win'; if (pv < dv) return 'lose'; return 'draw';
  }
  status() { return `🃏 You: ${this.player.join(' ')} (${this.val(this.player)})\n🤖 Dealer: ${this.dealer[0]} ?`; }
  reveal() { return `🃏 You: ${this.player.join(' ')} (${this.val(this.player)})\n🤖 Dealer: ${this.dealer.join(' ')} (${this.val(this.dealer)})`; }
}

// ═══════════════════════════════════════════════════════════════════
//  BLACKJACK MP (from original game.js — nima.js expects this name)
// ═══════════════════════════════════════════════════════════════════
class Blackjack {
  constructor(data) {
    this.id = data.id || ''; this.skip = data.skip || []; this.host = data.host || '';
    this.leader = data.leader || ''; this.winner = data.winner || [];
    this.players = data.players || []; this.started = data.started || false;
    this.startCard = data.startCard || {}; this.submitCard = data.submitCard || [];
    this.secondDeck = data.secondDeck || []; this.deck = data.deck || this.gen();
  }
  gen() { let d = []; for (let s of ['♥️', '♦️', '♣️', '♠️']) for (let r of ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']) d.push({ rank: r, suit: s }); return d; }
  shuffle() { for (let i = this.deck.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1)); [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]; } }
  deal() {
    this.shuffle(); const map = { 2: 10, 3: 7, 4: 7, 5: 6, 6: 6, 7: 5, 8: 5, 9: 4, 10: 4 };
    for (let p of this.players) p.cards.push(...this.deck.splice(0, map[this.players.length] || 4));
    this.startCard = this.deck.shift(); this.secondDeck.push(this.startCard); this.started = true;
  }
  hasMatch(pl) { return this.players.find(p => p.id === pl)?.cards?.some(c => c?.suit === this.startCard.suit) || false; }
  resolve() {
    const rv = r => r === 'A' ? 14 : r === 'K' ? 13 : r === 'Q' ? 12 : r === 'J' ? 11 : parseInt(r) || 0;
    let high = this.submitCard[0], lid = high?.id;
    for (let c of this.submitCard) { if (rv(c.card.rank) > rv(high.card.rank)) { high = c; lid = c.id; } }
    if (lid) { this.leader = lid; this.startCard = {}; this.submitCard = []; return `@${lid.split('@')[0]} leads next round!`; }
  }
  reuse() {
    const drinkers = this.players.filter(p => !this.hasMatch(p.id) && !this.skip.includes(p.id));
    const cards = this.submitCard.map(s => s.card);
    if ((this.submitCard.length + this.skip.length) === this.players.length && cards.length === 1) {
      const owner = this.submitCard[0].id; this.leader = owner;
      for (let p of this.players) if (p.id !== owner) this.skip.push(p.id);
      return { msg: `@${owner.split('@')[0]} is the only one with cards, becomes new leader.`, continue: true };
    }
    let i = 0; for (let c of cards) { if (!drinkers.length) break; const pl = this.players.find(p => p.id === drinkers[i % drinkers.length].id); pl.cards.push(c); if (!this.skip.find(a => a.id === pl.id)) this.skip.push({ id: pl.id }); i++; }
    return { msg: `Cards distributed.`, continue: true };
  }
}

// ═══════════════════════════════════════════════════════════════════
//  SNAKES & LADDERS
// ═══════════════════════════════════════════════════════════════════
class SnakeLadder {
  constructor(data) {
    this.turn = data.turn || 0; this.host = data.host || null; this.start = data.start || false;
    this.players = data.players || []; this.map = data.map || this.createMap();
  }
  roll() { return rand(1, 6); }
  createMap() {
    const maps = [
      { url: 'https://raw.githubusercontent.com/luckyfelistine-bot/maureonix/main/database/map/map1.jpg', move: { 4: 56, 12: 50, 14: 55, 22: 58, 41: 79, 54: 88, 96: 42, 94: 71, 75: 32, 48: 16, 37: 3, 28: 10 } },
      { url: 'https://raw.githubusercontent.com/luckyfelistine-bot/maureonix/main/database/map/map2.jpg', move: { 7: 36, 21: 58, 31: 51, 34: 84, 54: 89, 63: 82, 96: 72, 78: 59, 66: 12, 56: 20, 43: 24, 33: 5 } },
      { url: 'https://raw.githubusercontent.com/luckyfelistine-bot/maureonix/main/database/map/map3.jpg', move: { 8: 29, 10: 32, 20: 39, 27: 85, 51: 67, 72: 91, 79: 100, 98: 65, 94: 75, 93: 73, 64: 60, 62: 19, 56: 24, 53: 50, 17: 7 } },
      { url: 'https://raw.githubusercontent.com/luckyfelistine-bot/maureonix/main/database/map/map4.jpg', move: { 8: 29, 10: 32, 20: 39, 27: 85, 51: 67, 72: 91, 79: 100, 98: 65, 94: 75, 93: 73, 64: 60, 62: 19, 56: 24, 53: 50, 17: 7 } },
      { url: 'https://raw.githubusercontent.com/luckyfelistine-bot/maureonix/main/database/map/map5.jpg', move: { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 51: 67, 72: 91, 80: 99, 98: 79, 94: 75, 93: 73, 87: 36, 64: 60, 62: 19, 54: 34, 17: 7 } },
      { url: 'https://raw.githubusercontent.com/luckyfelistine-bot/maureonix/main/database/map/map6.jpg', move: { 4: 23, 13: 46, 33: 52, 42: 63, 50: 69, 62: 81, 74: 93, 99: 41, 95: 76, 89: 53, 66: 45, 54: 31, 43: 17, 40: 2, 27: 5 } },
      { url: 'https://raw.githubusercontent.com/luckyfelistine-bot/maureonix/main/database/map/map7.jpg', move: { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 51: 67, 71: 91, 80: 100, 98: 79, 95: 75, 93: 73, 87: 24, 64: 60, 62: 19, 54: 34, 17: 7 } },
      { url: 'https://raw.githubusercontent.com/luckyfelistine-bot/maureonix/main/database/map/map8.jpg', move: { 2: 38, 7: 14, 8: 31, 15: 26, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 78: 98, 87: 94, 99: 80, 95: 75, 92: 88, 89: 68, 74: 53, 64: 60, 62: 19, 49: 11, 46: 25, 16: 6 } }
    ];
    return pickRandom(maps);
  }
  next() { this.turn = (this.turn + 1) % this.players.length; }
  async draw(url, players = []) {
    try {
      const board = await jimp.read(url); board.resize(612, 612);
      const w = board.getWidth(), h = board.getHeight(), sz = Math.min(w, h);
      board.crop((w - sz) / 2, (h - sz) / 2, sz, sz);
      const ts = sz / 10; players = players.filter(a => a.move !== null);
      for (let i = 0; i < players.length; i++) {
        const pos = players[i].move, row = Math.floor((pos - 1) / 10), col = (row % 2 === 0) ? (pos - 1) % 10 : 9 - (pos - 1) % 10;
        const x = col * ts, y = (9 - row) * ts;
        const p = await jimp.read(`https://raw.githubusercontent.com/luckyfelistine-bot/maureonix/main/database/player/player${i + 1}.png`);
        const ps = ts * 0.7; p.resize(ps, ps);
        board.composite(p, x + ts / 2 - ps / 2, y + ts / 2 - ps / 2, { mode: jimp.BLEND_SOURCE_OVER });
      }
      return await board.getBufferAsync(jimp.MIME_JPEG);
    } catch (e) { return null; }
  }
}

// ═══════════════════════════════════════════════════════════════════
//  RPG ADVENTURE ENGINE — now uses GameManager for persistence
// ═══════════════════════════════════════════════════════════════════
class RPGAdventure {
  constructor(id) {
    this.id = id;
    this.lvl = 1; this.hp = 100; this.max = 100;
    this.atk = 10; this.def = 5; this.gold = 0; this.xp = 0;
    this.inv = []; this.floor = 1; this.enemy = null;
    // Automatically save to central game manager
    gameManager.set('rpg', id, this);
  }
  spawn() { const names = ['Goblin', 'Orc', 'Skeleton', 'Dark Mage', 'Dragon', 'Demon', 'Cyber Wolf', 'Quantum Beast']; const n = pickRandom(names); const m = Math.floor(this.floor * 1.5); this.enemy = { name: n, hp: 30 + m * 10, atk: 5 + m * 2, gold: m * 15, xp: m * 10 }; return this.enemy; }
  attack() { if (!this.enemy) return 'noenemy'; let dmg = Math.max(1, this.atk + rand(-2, 4) - Math.floor(this.enemy.atk / 5)); this.enemy.hp -= dmg; if (this.enemy.hp <= 0) { const g = this.enemy.gold, x = this.enemy.xp; this.gold += g; this.xp += x; this.enemy = null; this.floor++; if (this.xp >= this.lvl * 50) { this.lvl++; this.max += 20; this.hp = this.max; this.atk += 3; this.def += 2; return { win: true, gold: g, xp: x, levelup: true }; } return { win: true, gold: g, xp: x, levelup: false }; } let edmg = Math.max(1, this.enemy.atk + rand(-2, 2) - Math.floor(this.def / 3)); this.hp -= edmg; if (this.hp <= 0) return { dead: true, dmg, edmg }; return { dmg, edmg, ehp: this.enemy.hp, hp: this.hp }; }
  heal() { if (this.gold < 10) return 'poor'; this.gold -= 10; this.hp = Math.min(this.max, this.hp + 40); return { hp: this.hp }; }
  fmt() { return `🧙 *RPG @${this.id.split('@')[0]}*\n❤️ HP: ${this.hp}/${this.max}\n⚔️ ATK: ${this.atk} | 🛡️ DEF: ${this.def}\n💰 Gold: ${this.gold} | ⭐ XP: ${this.xp}\n🏆 Level: ${this.lvl} | 🏰 Floor: ${this.floor}\n🎒 Inv: ${this.inv.join(', ') || 'Empty'}${this.enemy ? `\n👹 Fighting: ${this.enemy.name} (${this.enemy.hp} HP)` : ''}`; }
}

// ═══════════════════════════════════════════════════════════════════
//  CASINO UTILITIES
// ═══════════════════════════════════════════════════════════════════
function slotMachine() {
  const em = ['🍒', '🍋', '🍊', '🍉', '🔔', '💎', '7️⃣', '🦊', '👑'];
  const reels = [0, 0, 0].map(() => pickRandom(em));
  const win = reels[0] === reels[1] && reels[1] === reels[2];
  const mult = reels[0] === '👑' ? 15 : reels[0] === '7️⃣' ? 10 : reels[0] === '💎' ? 5 : reels[0] === '🔔' ? 3 : 1;
  return { reels, win, amount: win ? 100 * mult : 0 };
}

function rouletteSpin() {
  const res = rand(0, 36);
  const red = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const color = res === 0 ? '🟢' : red.includes(res) ? '🔴' : '⚫';
  return { res, color, even: res !== 0 && res % 2 === 0, first: res >= 1 && res <= 12, second: res >= 13 && res <= 24, third: res >= 25 && res <= 36 };
}

function crash() {
  let m = 1.0;
  while (Math.random() > 0.06 && m < 50) m += 0.01 + Math.random() * 0.08;
  return { crash: parseFloat(m.toFixed(2)) };
}

function diceRoll(sides = 6) { return rand(1, sides); }
function coinflip() { return Math.random() < 0.5 ? 'heads' : 'tails'; }

function rpsls(p1, p2) {
  const r = { rock: ['scissors', 'lizard'], paper: ['rock', 'spock'], scissors: ['paper', 'lizard'], lizard: ['spock', 'paper'], spock: ['scissors', 'rock'] };
  if (p1 === p2) return 'draw'; return r[p1]?.includes(p2) ? 'p1' : 'p2';
}

function mathQuiz(diff = 'medium') {
  const ops = { easy: ['+', '-'], medium: ['+', '-', '*'], hard: ['+', '-', '*', '/'] }[diff];
  const op = pickRandom(ops); let a, b, ans;
  switch (op) {
    case '+': a = rand(1, diff === 'easy' ? 30 : diff === 'medium' ? 150 : 800); b = rand(1, diff === 'easy' ? 30 : diff === 'medium' ? 150 : 800); ans = a + b; break;
    case '-': a = rand(10, diff === 'easy' ? 50 : diff === 'medium' ? 300 : 1500); b = rand(1, a); ans = a - b; break;
    case '*': a = rand(2, diff === 'medium' ? 15 : 30); b = rand(2, diff === 'medium' ? 15 : 30); ans = a * b; break;
    case '/': b = rand(2, diff === 'hard' ? 20 : 12); ans = rand(2, diff === 'hard' ? 20 : 12); a = b * ans; break;
  }
  return { q: `${a} ${op} ${b}`, ans };
}

function anagram(words = ['MAUREONIX', 'BLACKJACK', 'WHATSAPP', 'QUANTUM', 'NEBULA', 'CYBERPUNK', 'GALAXY', 'INFINITE', 'VYBEFLIX', 'GODMODE', 'LEOPARD']) {
  const w = pickRandom(words); return { original: w, scrambled: w.split('').sort(() => Math.random() - 0.5).join('') };
}

function numberGuess(min = 1, max = 100) { return { target: rand(min, max), min, max, tries: 0 }; }

// ═══════════════════════════════════════════════════════════════════
//  ORIGINAL ECONOMY GAMES (Preserved for nima.js compatibility)
// ═══════════════════════════════════════════════════════════════════
const rdGame = (bd, id, tm) => Object.keys(bd).find(a => a.startsWith(id) && a.endsWith(tm));
const iGame = (bd, id) => (a => a && bd[a].id)(Object.keys(bd).find(a => a.startsWith(id)));
const tGame = (bd, id) => (a => a && bd[a].time)(Object.keys(bd).find(a => a.startsWith(id)));

const gameSlot = async (conn, m, db) => {
  if (db.users[m.sender].limit < 1) return m.reply(global.mess.limit);
  const sotoy = ['🍇', '🍉', '🍋', '🍌', '🍎', '🍑', '🍒', '🫐', '🥥', '🥑', '🦊', '👑'];
  const slot1 = pickRandom(sotoy), slot2 = pickRandom(sotoy), slot3 = pickRandom(sotoy);
  const l1 = `${pickRandom(sotoy)} : ${pickRandom(sotoy)} : ${pickRandom(sotoy)}`;
  const l2 = `${slot1} : ${slot2} : ${slot3}`; const l3 = `${pickRandom(sotoy)} : ${pickRandom(sotoy)} : ${pickRandom(sotoy)}`;
  const rl = Math.floor(Math.random() * 15) + 1; const botNumber = await conn.decodeJid(conn.user.id);
  if (slot1 === slot2 && slot2 === slot3) {
    db.users[m.sender].limit -= 1; db.set[botNumber].limit += 1;
    db.users[m.sender].limit += rl; db.users[m.sender].money += rl * 500;
    conn.sendMessage(m.chat, { text: `🎰 *SLOT*\n${l1}\n${l2} ⬅️\n${l3}\n\n✅ JACKPOT! +${rl} limit & +${rl * 500} money` }, { quoted: m });
  } else {
    db.users[m.sender].limit -= 1; db.set[botNumber].limit += 1;
    conn.sendMessage(m.chat, { text: `🎰 *SLOT*\n${l1}\n${l2} ⬅️\n${l3}\n\n❌ You lose -1 limit` }, { quoted: m });
  }
};

const gameCasinoSolo = async (conn, m, prefix, db) => {
  try {
    if (db.users[m.sender].limit < 1) return m.reply(global.mess.limit);
    const botNumber = await conn.decodeJid(conn.user.id);
    let count = m.args[0] ? (m.args[0].toLowerCase() === 'all' ? Math.floor(db.users[m.sender].money) : parseInt(m.args[0])) : 1;
    if (isNaN(count) || count < 1) return m.reply(`Example: ${prefix}casino 1000`);
    if (db.users[m.sender].money < count) return m.reply('Not enough money!');
    db.users[m.sender].limit -= 1; db.users[m.sender].money -= count; db.set[botNumber].money += count;
    const aku = rand(20, 100), kamu = rand(10, 100);
    if (aku > kamu) m.reply(`💰 CASINO\nYou: ${kamu} | Bot: ${aku}\n\n❌ You lose ${count}`);
    else if (aku < kamu) { db.users[m.sender].money += count * 2; m.reply(`💰 CASINO\nYou: ${kamu} | Bot: ${aku}\n\n🎉 WIN! +${count * 2}`); }
    else { db.users[m.sender].money += count; m.reply(`💰 CASINO\nDraw! Money returned.`); }
  } catch (e) { m.reply('Error!'); }
};

const gameSamgongSolo = async (conn, m, db) => {
  const suits = ['♥️', '♦️', '♣️', '♠️'], ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  if (db.users[m.sender].limit < 1) return m.reply(global.mess.limit);
  const count = parseInt(m.args[0]); if (isNaN(count) || count < 5000) return m.reply('Minimum bet 5000!');
  if (db.users[m.sender].money < count) return m.reply('Too poor!');
  db.users[m.sender].money -= count; db.users[m.sender].limit -= 1;
  let { key } = await m.reply('🃏 Dealing...'); await sleep(4000);
  const deck = ranks.flatMap(r => suits.map(s => `${r} ${s}`)).sort(() => Math.random() - 0.5);
  const draw = () => [deck.pop(), deck.pop(), deck.pop()];
  const score = h => h.reduce((s, c) => s + (['J', 'Q', 'K'].includes(c.split(' ')[0]) ? 10 : c.split(' ')[0] === 'A' ? 15 : parseInt(c)), 0);
  let ph = draw(), bh = draw(), ps = score(ph), bs = score(bh);
  while (ps < 30 && bs < 30 && ph.length < 4) { if (ps < 30) ph.push(deck.pop()); if (bs < 30) bh.push(deck.pop()); ps = score(ph); bs = score(bh); }
  let win = ps > 30 ? 'lose' : ps === bs ? 'draw' : bs > 30 || ps > bs ? 'win' : 'lose';
  let gain = count * 1.5; if (win === 'win') db.users[m.sender].money += gain; else if (win === 'draw') db.users[m.sender].money += count;
  m.reply(`🃏 SAMGONG\nYou: ${ph.join(', ')} (${ps})\nBot: ${bh.join(', ')} (${bs})\n\n${win === 'win' ? '🎉 WIN +' + gain : win === 'draw' ? '🤝 Draw' : '💀 LOSE'}`, { edit: key });
};

const gameMerampok = async (m, db) => {
  if (db.users[m.sender].limit < 1) return m.reply(global.mess.limit);
  db.users[m.sender].limit -= 1;
  let __timers = (new Date - db.users[m.sender].lastrampok), _timers = (3600000 - __timers), timers = clockString(_timers);
  if (new Date - db.users[m.sender].lastrampok > 3600000) {
    let dapat = rand(1000, 15000);
    let who = m.isGroup ? (m.mentionedJid ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null) : m.chat;
    if (!who) return m.reply('Tag someone!'); if (!db.users[who]) return m.reply('Not in database!');
    if (db.users[who].money < 10000) return m.reply('Target too poor!');
    db.users[who].money -= dapat; db.users[m.sender].money += dapat; db.users[m.sender].lastrampok = new Date * 1;
    m.reply(`🏴‍☠️ Robbed ${dapat} money from @${who.split('@')[0]}!`, { mentions: [who] });
  } else m.reply(`Wait ${timers} to rob again.`);
};

const gameBegal = async (conn, m, db) => {
  if (db.users[m.sender].limit < 1) return m.reply(global.mess.limit);
  db.users[m.sender].limit -= 1; let user = db.users[m.sender];
  let __timers = (new Date - user.lastbegal), _timers = (3600000 - __timers), timers = clockString(_timers);
  if (new Date - user.lastbegal > 3600000) {
    const botNumber = await conn.decodeJid(conn.user.id); const ru = rand(1000, 20000);
    const pool = [{ t: 'Target escaped!', r: 0 }, { t: 'Target ran!', r: 0 }, { t: 'Target hid!', r: 0 }, { t: 'Target committed suicide!', r: 2 }, { t: 'Target caught!', r: 2 }, { t: 'Target not found!', r: 0 }, { t: 'Target too strong!', r: 1 }, { t: 'Target cheated!', r: 1 }, { t: 'Target called police!', r: 0 }, { t: 'Target arrested!', r: 2 }, { t: 'Target surrendered!', r: 2 }];
    const ev = pickRandom(pool); let { key } = await m.reply('🔪 Searching victim...'); await sleep(3000);
    if (ev.r === 0) { m.reply({ text: ev.t, edit: key }); m.reply('Failed, try again.'); }
    else if (ev.r === 1) { m.reply({ text: ev.t, edit: key }); m.reply(`You died! Lost ${ru} money.`); db.users[m.sender].money -= ru; db.set[botNumber].money += ru; }
    else { m.reply({ text: ev.t, edit: key }); m.reply(`💰 Got ${ru} money!`); db.users[m.sender].money += ru; db.users[m.sender].lastbegal = new Date * 1; }
  } else m.reply(`Wait ⏱️${timers}`);
};

const daily = async (m, db) => {
  let user = db.users[m.sender], __timers = (new Date - user.lastclaim), _timers = (86400000 - __timers), timers = clockString(_timers);
  if (new Date - user.lastclaim > 86400000) { user.limit += 15; user.money += 25000; user.lastclaim = new Date * 1; m.reply(`🎁 DAILY\n+15 Limit\n+25,000 Money`); }
  else m.reply(`Wait ⏱️${timers}`);
};

const buy = async (m, args, db) => {
  if (args[0] === 'limit') {
    if (!args[1] || isNaN(args[1])) return m.reply(`.buy limit <amount>\nPrice: 500 / limit`);
    let c = parseInt(args[1]); if (db.users[m.sender].money >= c * 400) { db.users[m.sender].limit += c; db.users[m.sender].money -= c * 400; m.reply(`Bought ${c} limit`); }
    else m.reply(`Need ${c * 400} money`);
  } else m.reply(`Shop:\n• limit — 400 money each\nUsage: .buy limit 5`);
};

const setLimit = (m, db) => db.users[m.sender].limit -= 1;
const addLimit = (j, n, db) => db.users[n].limit += parseInt(j);
const addMoney = (j, n, db) => db.users[n].money += parseInt(j);
const setMoney = (m, db) => db.users[m.sender].money -= 1000;

const transfer = async (m, args, db) => {
  if (args[0] === 'limit' || args[0] === 'money') {
    let type = args[0]; let count = parseInt(args[2]) || 1;
    let who = m.mentionedJid[0] || (m.quoted && m.quoted.sender) || (args[1] && args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net');
    if (!who || !db.users[who]) return m.reply('Tag a registered user!');
    if (db.users[m.sender][type] < count) return m.reply(`Not enough ${type}!`);
    db.users[m.sender][type] -= count; db.users[who][type] += count;
    m.reply(`Transferred ${count} ${type} to @${who.split('@')[0]}`, { mentions: [who] });
  } else m.reply(`Usage: .transfer limit @user 5 / .transfer money @user 1000`);
};

// ═══════════════════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════════════════
module.exports = {
  // RAWG
  RAWG,
  // Free APIs
  TriviaMaster, PokemonGame, NumbersGame, FunAPIs,
  // Boards & Words
  TicTacToe, TicTacToeClassic, Connect4, Battleship, Wordle, Hangman,
  // Cards
  BlackjackCasino, Blackjack, SnakeLadder,
  // RPG
  RPGAdventure,
  // Casino utils
  slotMachine, rouletteSpin, crash, diceRoll, coinflip, rpsls,
  // Brain
  mathQuiz, anagram, numberGuess,
  // Legacy economy / games
  rdGame, iGame, tGame, gameSlot, gameCasinoSolo, gameSamgongSolo,
  gameMerampok, gameBegal, daily, buy, setLimit, addLimit, addMoney, setMoney, transfer,
  // Utils
  pickRandom,
  // ══════════════ NEW MANAGER EXPORT ══════════════
  gameManager
};