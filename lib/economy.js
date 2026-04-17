const XP_BASE = 100;
const XP_MULT = 1.5;

function getLevel(xp) { return Math.floor(Math.sqrt(xp / XP_BASE)); }
function getRequiredXP(lvl) { return Math.floor(XP_BASE * Math.pow(lvl, XP_MULT)); }

function ensureUser(uid) {
  if (!global.db.users[uid]) {
    global.db.users[uid] = { 
      xp: 0, coins: 500, bank: 0, gems: 0, 
      daily: 0, work: 0, rob: 0, level: 0,
      inventory: [], pets: [], married: null,
      house: null, car: null, job: 'unemployed',
      streak: 0, achievements: []
    };
  }
  return global.db.users[uid];
}

function addXP(uid, amount) {
  const u = ensureUser(uid);
  const oldLvl = getLevel(u.xp);
  u.xp += amount;
  const newLvl = getLevel(u.xp);
  if (newLvl > oldLvl) {
    u.level = newLvl;
    u.coins += newLvl * 100;
    return { leveledUp: true, newLvl, bonus: newLvl * 100 };
  }
  return { leveledUp: false };
}

function daily(uid) {
  const u = ensureUser(uid);
  const now = Date.now();
  if (now - u.daily < 86400000) {
    const hrs = Math.ceil((86400000 - (now - u.daily)) / 3600000);
    return { success: false, wait: hrs };
  }
  const streakBonus = u.streak >= 5 ? 2 : 1;
  const amount = 500 * streakBonus;
  u.coins += amount;
  u.gems += 1;
  u.daily = now;
  u.streak++;
  return { success: true, amount, gems: 1, streak: u.streak };
}

function work(uid) {
  const u = ensureUser(uid);
  const now = Date.now();
  if (now - u.work < 3600000) return { success: false, wait: Math.ceil((3600000 - (now - u.work)) / 60000) };
  const base = Math.floor(Math.random() * 400) + 100;
  const multiplier = u.job === 'developer' ? 3 : u.job === 'hacker' ? 2.5 : u.job === 'trader' ? 2 : 1;
  const earned = Math.floor(base * multiplier);
  u.coins += earned;
  u.work = now;
  return { success: true, amount: earned };
}

function rob(uid, targetUid) {
  const u = ensureUser(uid);
  const t = ensureUser(targetUid);
  const now = Date.now();
  if (now - u.rob < 7200000) return { success: false, wait: Math.ceil((7200000 - (now - u.rob)) / 60000) };
  if (u.coins < 200) return { success: false, reason: 'Need 200 coins to rob' };
  if (Math.random() < 0.4) {
    const amt = Math.min(t.coins, Math.floor(Math.random() * 800) + 200);
    u.coins += amt; t.coins -= amt;
    u.rob = now;
    return { success: true, amount: amt };
  } else {
    const fine = Math.min(u.coins, Math.floor(Math.random() * 300) + 100);
    u.coins -= fine;
    u.rob = now;
    return { success: false, penalty: fine };
  }
}

function deposit(uid, amount) {
  const u = ensureUser(uid);
  if (u.coins < amount) return false;
  u.coins -= amount; u.bank += amount;
  return true;
}

function withdraw(uid, amount) {
  const u = ensureUser(uid);
  if (u.bank < amount) return false;
  u.bank -= amount; u.coins += amount;
  return true;
}

function transfer(from, to, amount) {
  const f = ensureUser(from), t = ensureUser(to);
  if (f.coins < amount) return false;
  f.coins -= amount; t.coins += amount;
  return true;
}

function buyItem(uid, item, price) {
  const u = ensureUser(uid);
  if (u.coins < price) return false;
  u.coins -= price;
  u.inventory.push({ item, bought: Date.now() });
  return true;
}

function leaderboard() {
  return Object.entries(global.db.users)
    .map(([id, d]) => ({ id, xp: d.xp || 0, level: getLevel(d.xp || 0), coins: d.coins || 0, bank: d.bank || 0 }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 15);
}

function marry(uid, partnerUid) {
  const u = ensureUser(uid), p = ensureUser(partnerUid);
  if (u.married || p.married) return false;
  u.married = partnerUid; p.married = uid;
  return true;
}

function divorce(uid) {
  const u = ensureUser(uid);
  if (!u.married) return false;
  const p = ensureUser(u.married);
  u.married = null; p.married = null;
  return true;
}

function adoptPet(uid, petName, type) {
  const u = ensureUser(uid);
  if (u.pets.length >= 5) return false;
  u.pets.push({ name: petName, type, level: 1, xp: 0, happy: 100, fed: 100 });
  return true;
}

module.exports = {
  ensureUser, getLevel, getRequiredXP, addXP, daily, work, rob,
  deposit, withdraw, transfer, buyItem, leaderboard, marry, divorce, adoptPet
};