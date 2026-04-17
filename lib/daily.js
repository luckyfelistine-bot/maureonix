// MAUREONIX DAILY LIFE ENGINE v5.1

class DailyHub {
  constructor() {
    this.reminders = global.db.reminders ||= [];
    this.notes = global.db.notes ||= {};
    this.todos = global.db.todos ||= {};
    this.habits = global.db.habits ||= {};
    this.moods = global.db.moods ||= {};
    this.water = global.db.water ||= {};
    this.expenses = global.db.expenses ||= {};
    this.groceries = global.db.groceries ||= {};
  }

  // ─── REMINDERS ───────────────────────────────────
  remind(userId, text, minutes) {
    const due = Date.now() + minutes * 60000;
    this.reminders.push({ userId, text, due, created: Date.now() });
    return new Date(due).toLocaleTimeString();
  }
  listReminders(userId) {
    const now = Date.now();
    return this.reminders.filter(r => r.userId === userId && r.due > now);
  }
  clearReminders(userId) {
    this.reminders = this.reminders.filter(r => r.userId !== userId || r.due <= Date.now());
  }

  // ─── NOTES ───────────────────────────────────────
  addNote(userId, title, body) {
    this.notes[userId] ||= [];
    this.notes[userId].unshift({ title, body, date: Date.now() });
    if (this.notes[userId].length > 50) this.notes[userId].pop();
    return this.notes[userId].length;
  }
  getNotes(userId) { return this.notes[userId] || []; }
  delNote(userId, idx) { this.notes[userId]?.splice(idx, 1); }

  // ─── TODOS ───────────────────────────────────────
  addTodo(userId, task, priority = 'medium') {
    this.todos[userId] ||= [];
    this.todos[userId].push({ task, priority, done: false, created: Date.now() });
    return this.todos[userId].filter(t => !t.done).length;
  }
  getTodos(userId) { return this.todos[userId] || []; }
  doneTodo(userId, idx) { 
    const t = this.todos[userId]?.[idx]; 
    if (t) t.done = true; 
    return t; 
  }
  clearDone(userId) { 
    if (this.todos[userId]) this.todos[userId] = this.todos[userId].filter(t => !t.done); 
  }

  // ─── HABITS ──────────────────────────────────────
  checkHabit(userId, name) {
    this.habits[userId] ||= {};
    this.habits[userId][name] ||= { streak: 0, last: 0, best: 0 };
    const h = this.habits[userId][name];
    const today = new Date().setHours(0,0,0,0);
    if (h.last === today) return { done: true, streak: h.streak };
    const yesterday = today - 86400000;
    h.streak = (h.last === yesterday) ? h.streak + 1 : 1;
    h.last = today;
    if (h.streak > h.best) h.best = h.streak;
    return { streak: h.streak, best: h.best, done: false };
  }
  getHabits(userId) { return this.habits[userId] || {}; }

  // ─── MOOD JOURNAL ────────────────────────────────
  logMood(userId, score, note) {
    this.moods[userId] ||= [];
    this.moods[userId].push({ score: Math.min(10, Math.max(1, score)), note, date: Date.now() });
    if (this.moods[userId].length > 60) this.moods[userId].shift();
    const recent = this.moods[userId].slice(-7);
    const avg = (recent.reduce((a,b) => a+b.score,0)/recent.length).toFixed(1);
    const advice = avg >= 8 ? "You're glowing! Keep that energy 🔥" : avg >= 6 ? "Steady and balanced 💪" : avg >= 4 ? "Take time to recharge 🌱" : "Be gentle with yourself today 🫂";
    return { avg, total: this.moods[userId].length, advice };
  }
  moodHistory(userId) { return this.moods[userId] || []; }

  // ─── WATER TRACKER ───────────────────────────────
  drink(userId, ml = 250) {
    const today = new Date().toDateString();
    this.water[userId] ||= { date: today, total: 0, goal: 2500 };
    if (this.water[userId].date !== today) this.water[userId] = { date: today, total: 0, goal: 2500 };
    this.water[userId].total += ml;
    const { total, goal } = this.water[userId];
    const pct = Math.min(100, Math.floor((total/goal)*100));
    const remaining = Math.max(0, goal - total);
    let msg = pct < 30 ? "💧 Start hydrating!" : pct < 60 ? "🌊 Keep going!" : pct < 100 ? "🚰 Almost there!" : "🌊 Hydration goal crushed!";
    return { total, goal, pct, remaining, msg };
  }

  // ─── EXPENSE TRACKER ─────────────────────────────
  spend(userId, amount, category, note) {
    this.expenses[userId] ||= [];
    const e = { amount: parseFloat(amount), category: category.toLowerCase(), note, date: Date.now(), day: new Date().toDateString() };
    this.expenses[userId].push(e);
    const month = new Date().getMonth();
    const monthly = this.expenses[userId].filter(x => new Date(x.date).getMonth() === month);
    const total = monthly.reduce((a,b) => a+b.amount, 0);
    const today = this.expenses[userId].filter(x => x.day === e.day).reduce((a,b) => a+b.amount, 0);
    return { total: total.toFixed(2), today: today.toFixed(2), count: monthly.length };
  }
  getExpenses(userId, days = 7) {
    const cutoff = Date.now() - days*86400000;
    return (this.expenses[userId] || []).filter(e => e.date > cutoff);
  }
  expenseInsight(userId) {
    const exps = this.getExpenses(userId, 30);
    if (!exps.length) return null;
    const cats = {};
    exps.forEach(e => cats[e.category] = (cats[e.category]||0) + e.amount);
    const sorted = Object.entries(cats).sort((a,b) => b[1]-a[1]);
    const total = sorted.reduce((a,b) => a+b[1], 0);
    return {
      total: total.toFixed(2),
      dailyAvg: (total/30).toFixed(2),
      top: sorted[0],
      breakdown: sorted.map(([k,v]) => `${k}: $${v.toFixed(2)}`).join('\n')
    };
  }

  // ─── GROCERY LIST ────────────────────────────────
  addGrocery(userId, items) {
    this.groceries[userId] ||= [];
    const added = items.split(',').map(i => i.trim()).filter(Boolean);
    this.groceries[userId].push(...added);
    return added.length;
  }
  getGrocery(userId) { return this.groceries[userId] || []; }
  clearGrocery(userId) { this.groceries[userId] = []; }

  // ─── ALARM/TIMER HELPERS ─────────────────────────
  timerEnd(minutes) { return Date.now() + minutes*60000; }
}

module.exports = new DailyHub();