'use strict';
const fs    = require('fs');
const chalk = require('chalk');
const SecureConfig = require('./config');

// ── Owner & Identity ─────────────────────────────────────────────────────────
global.owner     = SecureConfig.ownerNumber;
global.ownerName = SecureConfig.ownerName;
global.author    = SecureConfig.ownerName;
global.botname   = SecureConfig.botName;
global.packname  = SecureConfig.botName;

// ── Prefixes & Symbols ───────────────────────────────────────────────────────
global.listprefix = SecureConfig.listprefix || ['.', '!', '+'];
global.listv      = SecureConfig.listv || [
    '•','●','■','✿','▲','➩','➢','➣','➤','✦','✧','△','❀','○','□','♤','♡','◇','♧','々','〆'
];

// ── Database Paths ────────────────────────────────────────────────────────────
global.tempatDB    = SecureConfig.tempatDB || 'database.json';
global.tempatStore = SecureConfig.tempatStore || 'baileys_store.json';

// ── Connection ────────────────────────────────────────────────────────────────
global.pairing_code = SecureConfig.pairingCode !== undefined ? SecureConfig.pairingCode : true;
global.number_bot   = SecureConfig.number_bot || '254116903500';

// ── Media Placeholders ────────────────────────────────────────────────────────
global.fake = {
    anonim:       'https://ibb.co/rKyYj3Rr',
    thumbnailUrl: 'https://ibb.co/rKyYj3Rr',
    thumbnail:    fs.readFileSync('./src/media/nima.png'),
    docs:         fs.readFileSync('./src/media/fake.pdf'),
    listfakedocs: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf'
    ],
};

// ── Social Links & IDs (from config) ─────────────────────────────────────────
global.my = {
    tt:       SecureConfig.tiktokLink || 'https://vm.tiktok.com/ZS9LevY1LSrXD-wytcp/',
    gh:       SecureConfig.githubRepo || 'https://github.com/luckyfelistine-bot/maureonix',
    gc:       SecureConfig.channelLink || 'https://whatsapp.com/channel/0029Vb7IABxCXC3J7ZFFsk2h',
    group:    SecureConfig.groupInviteLink || 'https://chat.whatsapp.com/BWhOCHhbXpD2tiNF9JGXqp',
    ch:       SecureConfig.channelJid || SecureConfig.groupJid,  // auto-follow uses this
    groupJid: SecureConfig.groupJid,   // for auto-join in index.js
};

// ── Economy Limits ────────────────────────────────────────────────────────────
global.limit = SecureConfig.limit || { free: 20,    premium: 999,     vip: 9999 };
global.money = SecureConfig.money || { free: 10000, premium: 1000000, vip: 10000000 };

// ── System Messages (enhanced) ────────────────────────────────────────────────
global.mess = {
    key:          'Your API key has expired. Please contact the owner.',
    owner:        '👑 *Only the owner can use this command.*',
    admin:        '🛡️ *Only admins can use this command.*',
    botAdmin:     '🤖 *The bot needs to be admin to use this command.*',
    group:        '👥 *This command can only be used in groups.*',
    private:      '🔒 *This command can only be used in private chats.*',
    limit:        '⚠️ *You have exceeded your daily limit.*\nUse `.daily` to claim more.',
    prem:         '💎 *This command is for premium users only.*',
    wait:         '⏳ *Processing, please wait...*',
    error:        '❌ *An error occurred. Please try again later.*',
    done:         '✅ *Done!*',
    banned:       '🚫 *You are banned from using this bot.*',
    modePrivate:  '🔒 *Bot is in private mode. You are not authorised.*',
    modeRestr:    '⛔ *Bot is not active in this group.*',
    footer:       SecureConfig.footer || '> *🦊 MAUREONIX* ✨ | 👑 _Infinite Vybeflix_',
};

// ── API Endpoints ─────────────────────────────────────────────────────────────
global.APIs    = { nima: 'https://api.nima.biz.id' };
global.APIKeys = { 'https://api.nima.biz.id': SecureConfig.apiKey };

// ── External Keys ─────────────────────────────────────────────────────────────
global.geminiApiKey = SecureConfig.geminiApiKey;
global.footer       = SecureConfig.footer || global.mess.footer;

// ── Filters ───────────────────────────────────────────────────────────────────
global.badWords = SecureConfig.badWords || [
    'dongo', 'fuck', 'shit', 'bitch', 'ass', 'nigga', 'retard',
    'kys', 'kill yourself', 'idiot', 'moron', 'bastard',
];
global.chatLength       = SecureConfig.chatLength || 500;
global.geminiMemorySize = SecureConfig.geminiMemorySize || 50;

// ═══════════════════════════════════════════════════════════════════════════════
// 🔐  BOT MODE SYSTEM (public / private / restricted)
// ─────────────────────────────────────────────────────────────────────────────
//  'public'      → Everyone can use the bot (default)
//  'private'     → Only owner + allowedUsers can use commands
//  'restricted'  → Bot only responds inside allowedGroups
// ═══════════════════════════════════════════════════════════════════════════════
global.botMode          = 'public';               // default
global.restrictedGroups = [];                    // groups BLOCKED in any mode
global.allowedGroups    = [];                    // groups ALLOWED in restricted mode
global.allowedUsers     = [];                    // extra users allowed in private mode

// ── API Keys for external services ────────────────────────────────────────────
global.RAWG_KEY   = '87d2613ba4b34b7d83929fcd8516f43b';
global.OMDB_KEY   = 'c9e60a6f';
global.TMDB_KEY   = '87d2613ba4b34b7d83929fcd8516f43b';

// ── Version Info ──────────────────────────────────────────────────────────────
global.BOT_VERSION = '3.0.0';
global.GITHUB_REPO = 'luckyfelistine-bot/maureonix';

// ── Hot-Reload ────────────────────────────────────────────────────────────────
let _file = require.resolve(__filename);
fs.watchFile(_file, () => {
    fs.unwatchFile(_file);
    console.log(chalk.redBright(`⚡ Reloaded: ${__filename}`));
    delete require.cache[_file];
    require(_file);
});