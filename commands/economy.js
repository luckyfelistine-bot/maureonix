// commands/economy.js – Economy & banking
module.exports = {
    daily: async (nimesha, m, { Economy, prefix, command }) => {
        const res = Economy.daily(m.sender);
        if (res.success) await m.reply(`✅ Claimed ${res.amount} coins & ${res.gems} gems!\n🔥 Streak: ${res.streak}`);
        else await m.reply(`⏳ Come back in ${res.wait} hours`);
    },
    claim: async (nimesha, m, ctx) => { await module.exports.daily(nimesha, m, ctx); },
    work: async (nimesha, m, { Economy, db }) => {
        const res = Economy.work(m.sender);
        if (res.success) await m.reply(`💼 You worked as ${db.users[m.sender].job} and earned ${res.amount} coins`);
        else await m.reply(`⏳ Wait ${res.wait} minutes`);
    },
    rob: async (nimesha, m, { Economy }) => {
        const target = m.mentionedJid?.[0];
        if (!target) return m.reply('Tag someone to rob');
        const res = Economy.rob(m.sender, target);
        if (res.success) await m.reply(`💰 Robbed ${res.amount} coins!`);
        else if (res.reason) await m.reply(res.reason);
        else await m.reply(`🚔 Caught! Lost ${res.penalty} coins`);
    },
    balance: async (nimesha, m, { Economy }) => {
        const u = Economy.ensureUser(m.sender);
        await m.reply(`💰 *Balance*\n👛 Wallet: ${u.coins}\n🏦 Bank: ${u.bank}\n💎 Gems: ${u.gems}\n📊 Level: ${u.level}\n⭐ XP: ${u.xp}`);
    },
    deposit: async (nimesha, m, { args, Economy, prefix, command }) => {
        if (!args[0] || isNaN(args[0])) return m.reply(`Example: ${prefix + command} <amount>`);
        if (Economy.deposit(m.sender, parseInt(args[0]))) await m.reply('✅ Deposited');
        else await m.reply('❌ Insufficient funds');
    },
    withdraw: async (nimesha, m, { args, Economy, prefix, command }) => {
        if (!args[0] || isNaN(args[0])) return m.reply(`Example: ${prefix + command} <amount>`);
        if (Economy.withdraw(m.sender, parseInt(args[0]))) await m.reply('✅ Withdrawn');
        else await m.reply('❌ Insufficient funds');
    },
    transfer: async (nimesha, m, { args, Economy, prefix, command }) => {
        if (m.mentionedJid.length < 1 || !args[1] || isNaN(args[1])) return m.reply(`Example: ${prefix + command} @user <amount>`);
        if (Economy.transfer(m.sender, m.mentionedJid[0], parseInt(args[1]))) await m.reply('💸 Transfer complete');
        else await m.reply('❌ Insufficient funds');
    },
    buy: async (nimesha, m, { args, Economy, prefix, command }) => {
        const shop = { phone: 1000, laptop: 5000, car: 50000, house: 200000, jet: 1000000 };
        if (!shop[args[0]]) return m.reply(`Shop: ${Object.entries(shop).map(([k, v]) => `${k}: ${v}🪙`).join(', ')}`);
        if (Economy.buyItem(m.sender, args[0], shop[args[0]])) await m.reply(`🛒 Bought ${args[0]}`);
        else await m.reply('❌ Broke');
    },
    inventory: async (nimesha, m, { Economy }) => {
        const u = Economy.ensureUser(m.sender);
        if (!u.inventory.length) return m.reply('Empty backpack');
        await m.reply(`🎒 *Inventory*\n${u.inventory.map(i => `• ${i.item}`).join('\n')}`);
    },
    lb: async (nimesha, m, { Economy }) => {
        const lb = Economy.leaderboard();
        let txt = '🏆 *Global Leaderboard*\n\n';
        lb.forEach((u, i) => { txt += `${i + 1}. @${u.id.split('@')[0]} — Lv.${u.level} | ${u.coins}🪙\n`; });
        await nimesha.sendMessage(m.chat, { text: txt, mentions: lb.map(u => u.id) }, { quoted: m });
    },
    economymenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *💰 ECONOMY COMMANDS*  ║\n╚══════════════════════╝\n\n📌 *Actions*\n▸ ${prefix}daily – Claim daily reward\n▸ ${prefix}work – Work to earn coins\n▸ ${prefix}rob @user – Attempt to rob someone\n▸ ${prefix}balance – Check your balance\n▸ ${prefix}deposit <amount> – Deposit to bank\n▸ ${prefix}withdraw <amount> – Withdraw from bank\n▸ ${prefix}transfer @user <amount> – Send coins\n▸ ${prefix}lb – Leaderboard\n▸ ${prefix}buy <item> – Buy from shop\n▸ ${prefix}inventory – View your items\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },
    // Aliases
    bal: async (nimesha, m, ctx) => { await module.exports.balance(nimesha, m, ctx); },
    money: async (nimesha, m, ctx) => { await module.exports.balance(nimesha, m, ctx); },
    dep: async (nimesha, m, ctx) => { await module.exports.deposit(nimesha, m, ctx); },
    with: async (nimesha, m, ctx) => { await module.exports.withdraw(nimesha, m, ctx); },
    pay: async (nimesha, m, ctx) => { await module.exports.transfer(nimesha, m, ctx); },
    inv: async (nimesha, m, ctx) => { await module.exports.inventory(nimesha, m, ctx); },
    top: async (nimesha, m, ctx) => { await module.exports.lb(nimesha, m, ctx); },
};