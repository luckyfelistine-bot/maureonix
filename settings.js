const fs = require('fs');
const chalk = require('chalk');

const SecureConfig = require('./config');

// ─── Core Identity ──────────────────────────────────
global.owner = SecureConfig.ownerNumber;
global.ownerName = SecureConfig.ownerName;
global.author = SecureConfig.ownerName;
global.botname = SecureConfig.botName;
global.packname = SecureConfig.botName;
global.version = '5.0.0-OMEGA';
global.prefix = '.';
global.public = true;
global.autoread = false;
global.antitag = true;

// ─── API Keys (from config) ────────────────────────
global.poeApiKey = SecureConfig.poeApiKey;
global.omdbApiKey = SecureConfig.omdbApiKey;
global.rapidApiKey = SecureConfig.rapidApiKey;
global.geminiKey = SecureConfig.geminiApiKey;
global.geminiApiKey = SecureConfig.geminiApiKey;
global.removeBgKey = SecureConfig.removeBgApiKey;
global.voiceRssKey = SecureConfig.voiceRssApiKey;
global.openaiKey = SecureConfig.openaiKey;
global.llamaKey = SecureConfig.llamaKey;
global.deepseekKey = SecureConfig.deepseekKey;

// ─── Paths & Prefixes ───────────────────────────────
global.listprefix = SecureConfig.listprefix;
global.listv = SecureConfig.listv;
global.tempatDB = SecureConfig.tempatDB;
global.tempatStore = SecureConfig.tempatStore;
global.pairing_code = SecureConfig.pairingCode;
global.number_bot = SecureConfig.number_bot;

// ─── Fake Media ─────────────────────────────────────
global.fake = {
    anonim: 'https://ibb.co/rKyYj3Rr',
    thumbnailUrl: 'https://ibb.co/rKyYj3Rr',
    thumbnail: fs.readFileSync('./src/media/nima.png'),
    docs: fs.readFileSync('./src/media/fake.pdf'),
    listfakedocs: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/pdf'],
};

// ─── Social Links ───────────────────────────────────
global.my = {
    tt: SecureConfig.tiktokLink,
    gh: SecureConfig.githubRepo,
    gc: SecureConfig.groupInviteLink,
    ch: SecureConfig.groupJid,
};

// ─── Limits & Economy ───────────────────────────────
global.limit = SecureConfig.limit;
global.money = SecureConfig.money;

// ─── Messages ───────────────────────────────────────
global.mess = SecureConfig.mess;

// ─── APIs ───────────────────────────────────────────
global.APIs = {
    nima: 'https://api.nima.biz.id',
};
global.APIKeys = {
    'https://api.nima.biz.id': SecureConfig.apiKey,
};

// ─── Misc ───────────────────────────────────────────
global.badWords = SecureConfig.badWords;
global.chatLength = SecureConfig.chatLength;
global.geminiMemorySize = SecureConfig.geminiMemorySize;
global.footer = SecureConfig.footer;

// ─── Database (will be populated by database.js) ────
global.db = {
  users: {},
  groups: {},
  chats: {},
  premium: [],
  banned: [],
  warnings: {},
  settings: {},
  afk: {},
  rpg: {},
  casino: {},
  giveaways: {},
  polls: {},
  reminders: []
};

// ─── Anti‑Crash ─────────────────────────────────────
process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

// ─── Hot Reload (optional) ──────────────────────────
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});