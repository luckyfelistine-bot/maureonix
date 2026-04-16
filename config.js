// ============================================================
//                  MAUREONIX MASTER CONFIG
//   All settings in one place – edit only this file
// ============================================================

const SecureConfig = {
    // ----- Bot Identity -----
    botName: 'Maureonix',
    ownerName: 'Infinite Vybeflix',
    ownerNumber: ['254116903500'],   // Your WhatsApp number (array)

    // ----- WhatsApp Group & Channel -----
    groupJid: '120363423838424989@g.us',           // Group ID (starts with 1203...)
    groupInviteLink: 'https://chat.whatsapp.com/BWhOCHhbXpD2tiNF9JGXqp',
    channelLink: 'https://whatsapp.com/channel/0029Vb7IABxCXC3J7ZFFsk2h',
    channelJid: '120363426431427396@newsletter',   // Channel ID for auto-follow

    // ----- Social Media -----
    tiktokLink: 'https://vm.tiktok.com/ZS9LevY1LSrXD-wytcp/',
    githubRepo: 'https://github.com/luckyfelistine-bot/maureonix',

    // ----- API Keys (keep as is) -----
    geminiApiKey: 'AIzaSyARjH2TwsNEpQ3vPHzDecf5a7v7evmQmZc',
    apiKey: 'nz-8ce9753907',

    // ----- Bot Behavior -----
    pairingCode: true,               // true = pairing code, false = QR code
    number_bot: '254116903500',      // Phone number used for pairing (your number)
    adminonly: false,                // When true, bot responds only to owner(s)

    // ----- Footer Text (appears in many messages) -----
    footer: '> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX',

    // ----- Paths (usually don't change) -----
    tempatDB: 'database.json',
    tempatStore: 'baileys_store.json',
    listprefix: ['+', '!', '.'],
    listv: ['•','●','■','✿','▲','➩','➢','➣','➤','✦','✧','△','❀','○','□','♤','♡','◇','♧','々','〆'],

    // ----- Limits & Money -----
    limit: { free: 20, premium: 999, vip: 9999 },
    money: { free: 10000, premium: 1000000, vip: 10000000 },

    // ----- Error Messages (English) -----
    mess: {
        key: 'Your API key has expired. Please visit https://nima.biz.id',
        owner: 'Only the owner can use this command.',
        admin: 'Only admins can use this command.',
        botAdmin: 'The bot needs to be admin to use this command.',
        group: 'Use this command in groups only!',
        private: 'Use this command in private chat only!',
        limit: 'You have exceeded your daily limit.',
        prem: 'This command is only for premium users.',
        wait: 'Processing, please wait...',
        error: 'An error occurred. Please try again later.',
        done: 'Done! 🎉'
    },

    // ----- Other -----
    badWords: ['dongo'],
    chatLength: 500,
    geminiMemorySize: 50,
};

module.exports = SecureConfig;