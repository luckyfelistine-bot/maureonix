class AntiSpam {
  constructor() {
    this.filters = new Map(); // command cooldown
    this.flood = new Map();   // message flood
    this.reports = new Map(); // reported users
    this.blacklist = new Set();
    this.cooldowns = new Map(); // per-command cooldowns
  }

  isFiltered(from, cmd = 'global') {
    return this.filters.has(`${from}_${cmd}`);
  }

  addFilter(from, cmd = 'global', ms = 3000) {
    const key = `${from}_${cmd}`;
    this.filters.set(key, true);
    setTimeout(() => this.filters.delete(key), ms);
  }

  isFlooding(from) {
    const now = Date.now();
    if (!this.flood.has(from)) {
      this.flood.set(from, [now]);
      return false;
    }
    const times = this.flood.get(from).filter(t => now - t < 10000);
    times.push(now);
    this.flood.set(from, times);
    return times.length > 5; // 5 messages in 10s = flood
  }

  setCommandCooldown(cmd, ms) {
    this.cooldowns.set(cmd, ms);
  }

  checkCooldown(from, cmd) {
    const ms = this.cooldowns.get(cmd) || 0;
    if (!ms) return false;
    const key = `cd_${from}_${cmd}`;
    if (this.filters.has(key)) return true;
    this.filters.set(key, true);
    setTimeout(() => this.filters.delete(key), ms);
    return false;
  }

  report(userId, reason) {
    if (!this.reports.has(userId)) this.reports.set(userId, []);
    this.reports.get(userId).push({ reason, date: Date.now() });
    if (this.reports.get(userId).length >= 3) this.blacklist.add(userId);
  }

  isBlacklisted(userId) {
    return this.blacklist.has(userId);
  }
}

module.exports = { antiSpam: new AntiSpam() };