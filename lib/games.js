class TicTacToe {
  constructor(p1, p2) {
    this.board = Array(9).fill(null);
    this.players = { X: p1, O: p2 };
    this.turn = 'X';
    this.winner = null;
  }
  move(pos) {
    if (this.board[pos] || this.winner) return 'invalid';
    this.board[pos] = this.turn;
    if (this.checkWin(this.turn)) { this.winner = this.turn; return 'win'; }
    if (this.board.every(c => c)) return 'draw';
    this.turn = this.turn === 'X' ? 'O' : 'X';
    return 'continue';
  }
  checkWin(p) {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return wins.some(c => c.every(i => this.board[i] === p));
  }
  render() {
    const b = this.board.map((c, i) => c || (i + 1));
    return `${b[0]}│${b[1]}│${b[2]}\n─┼─┼─\n${b[3]}│${b[4]}│${b[5]}\n─┼─┼─\n${b[6]}│${b[7]}│${b[8]}`;
  }
}

class Blackjack {
  constructor() {
    this.deck = this.shuffle([...'♥♦♣♠'].flatMap(s => [...'23456789TJQKA'].map(v => v+s)));
    this.player = [this.draw(), this.draw()];
    this.dealer = [this.draw(), this.draw()];
    this.done = false;
  }
  shuffle(d) { for (let i = d.length-1; i>0; i--) { let j = Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; } return d; }
  draw() { return this.deck.pop(); }
  val(hand) {
    let v = 0, a = 0;
    for (let c of hand) { let r = c.slice(0,-1); if (r==='A') {a++;v+=11;} else if ('TJQK'.includes(r)) v+=10; else v+=parseInt(r); }
    while (v>21 && a--) v-=10;
    return v;
  }
  hit() { this.player.push(this.draw()); if (this.val(this.player)>21) this.done = true; return this.val(this.player); }
  stand() {
    this.done = true;
    while (this.val(this.dealer) < 17) this.dealer.push(this.draw());
    const pv = this.val(this.player), dv = this.val(this.dealer);
    if (pv>21) return 'bust';
    if (dv>21 || pv>dv) return 'win';
    if (pv<dv) return 'lose';
    return 'draw';
  }
}

class Wordle {
  constructor(word) {
    this.word = word || ['APPLE','BEACH','CHAIR','DANCE','EAGLE','FLAME','GRAPE','HOUSE','IGLOO','JUICE'][Math.floor(Math.random()*10)];
    this.guesses = [];
    this.max = 6;
  }
  guess(word) {
    if (word.length !== 5) return 'invalid';
    this.guesses.push(word.toUpperCase());
    let res = '';
    for (let i = 0; i < 5; i++) {
      if (word[i] === this.word[i]) res += '🟩';
      else if (this.word.includes(word[i])) res += '🟨';
      else res += '⬛';
    }
    return { result: res, won: word === this.word, lost: this.guesses.length >= this.max };
  }
}

class Hangman {
  constructor() {
    this.words = ['JAVASCRIPT','NODEJS','BAILEYS','WHATSAPP','MAUREONIX','CYBERPUNK','QUANTUM','NEBULA'];
    this.word = this.words[Math.floor(Math.random() * this.words.length)];
    this.guessed = new Set();
    this.lives = 6;
  }
  guess(char) {
    char = char.toUpperCase();
    if (this.guessed.has(char)) return 'already';
    this.guessed.add(char);
    if (!this.word.includes(char)) this.lives--;
    const display = this.word.split('').map(c => this.guessed.has(c) ? c : '_').join(' ');
    const won = !display.includes('_');
    return { display, lives: this.lives, won, lost: this.lives <= 0, word: this.word };
  }
}

class Connect4 {
  constructor(p1, p2) {
    this.board = Array(6).fill().map(() => Array(7).fill(null));
    this.players = [p1, p2];
    this.turn = 0;
  }
  drop(col) {
    for (let row = 5; row >= 0; row--) {
      if (!this.board[row][col]) {
        this.board[row][col] = this.turn;
        const won = this.checkWin(row, col);
        if (!won) this.turn = this.turn ? 0 : 1;
        return { success: true, won, board: this.board };
      }
    }
    return { success: false };
  }
  checkWin(r, c) {
    const p = this.board[r][c];
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (let [dr,dc] of dirs) {
      let count = 1;
      for (let m of [1,-1]) {
        for (let i = 1; i < 4; i++) {
          const nr = r + dr*i*m, nc = c + dc*i*m;
          if (nr>=0&&nr<6&&nc>=0&&nc<7&&this.board[nr][nc]===p) count++; else break;
        }
      }
      if (count >= 4) return true;
    }
    return false;
  }
}

function slotMachine() {
  const emojis = ['🍒','🍋','🍊','🍉','🔔','💎','7️⃣'];
  const reels = [0,0,0].map(() => emojis[Math.floor(Math.random()*emojis.length)]);
  const win = reels[0] === reels[1] && reels[1] === reels[2];
  const mult = reels[0]==='7️⃣'?10:reels[0]==='💎'?5:reels[0]==='🔔'?3:1;
  return { reels, win, amount: win ? 100 * mult : 0 };
}

async function trivia() {
  const r = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
  const d = await r.json();
  const q = d.results[0];
  return {
    question: q.question,
    correct: q.correct_answer,
    options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random()-0.5)
  };
}

module.exports = { TicTacToe, Blackjack, Wordle, Hangman, Connect4, slotMachine, trivia };