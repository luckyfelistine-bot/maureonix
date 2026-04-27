// ============================================================
//                  MAUREONIX MASTER CONFIG
//   All settings in one place — edit only this file
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

// ----- API Keys (Sports) -----
    apiSportsKey: 'e77f42417ca17805d5c16951a9af6137',
    oddsApiKey: '4ac89ebfd82a84d98aa247d8cad45817',

    // ----- API Keys (keep as is) -----
    geminiApiKey: 'AIzaSyARjH2TwsNEpQ3vPHzDecf5a7v7evmQmZc',
// ----- API Keys (AI) -----
    removeBgApiKey: '8EFJ7He4wghiENEFjLGNTb9n',
    voiceRssApiKey: '79b0ea4a2b424f9098ad09859db8e0a0',
    apiKey: 'nz-8ce9753907',
    poeApiKey: 'sk-poe-JhCsJeD24vMIaEpkkBzmg4OSMBtEbQsfxcZNYSqMUCo',
    omdbApiKey: 'c9e60a6f',
    rapidApiKey: process.env.RAPIDAPI_KEY || 'YOUR_RAPIDAPI_KEY',
    openaiKey: process.env.OPENAI_KEY || 'YOUR_OPENAI_KEY',
    llamaKey: process.env.LLAMA_KEY || 'YOUR_LLAMA_KEY',
    deepseekKey: process.env.DEEPSEEK_KEY || 'YOUR_DEEPSEEK_KEY',

    groqApiKeys: [
        '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',   // original
        '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',   // Maureonix
        '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',   // Maureonix ✨✨😭
        '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',   // Selfchat
    ],

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
        done: 'Done! ✅'
    },

    "APIFY_TOKEN": "apify_api_btsTYNk6O2LW1eSh90c5rJIpxVImUd38dus8",
    "RAPIDAPI_KEY": "5902269973mshb6c0a85dfd606ecp10dd57jsn5e3bf5113c68",
    "RAPIDAPI_YT_HOST": "yt-downloader1.p.rapidapi.com",
    "RAPIDAPI_TIKTOK_HOST": "tiktok-video-downloader-api.p.rapidapi.com",
    "RAPIDAPI_IG_HOST": "instagram-downloader38.p.rapidapi.com",
    "RAPIDAPI_TWITTER_HOST": "twitter-video-downloader-api.p.rapidapi.com",
    "RAPIDAPI_FB_HOST": "facebook-downloader.p.rapidapi.com",
    "RAPIDAPI_ALL_MEDIA_HOST": "all-media-downloader.p.rapidapi.com",
    "APIFY_YOUTUBE_ACTOR": "zakeygroot/youtube-pro-downloader-2026-working",
    "APIFY_TIKTOK_ACTOR": "apilabs/tiktok-downloader",
    "APIFY_INSTAGRAM_ACTOR": "instaprism/instagram-media-downloader",
    "APIFY_SOCIAL_ACTOR": "rover-omniscraper/media-downloader-actor",
    "APIFY_ALL_SOCIAL_ACTOR": "wilcode/all-social-media-video-downloader",
    "TIKWM_API": "https://www.tikwm.com",
    "COBALT_API": "https://api.cobalt.tools",
    "DL_DIR": "/tmp/maureonix_dl",
    "DL_CONCURRENCY": "5",
    "YTDLP_BIN": "yt-dlp",
    "FFMPEG_BIN": "ffmpeg",
    "GALLERYDL_BIN": "gallery-dl",
    "SPOTDL_BIN": "spotdl",


    // ----- Other -----
    badWords: ['dongo'],
    chatLength: 500,
    geminiMemorySize: 50,
};

module.exports = SecureConfig;