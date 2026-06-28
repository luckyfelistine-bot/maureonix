// ============================================================
//                  MAUREONIX MASTER CONFIG
//   All secrets moved to environment variables
//   DO NOT add hardcoded keys here — use .env or platform env vars
// ============================================================

const SecureConfig = {
    // ===== BOT IDENTITY =====
    botName: 'Maureonix',
    ownerName: 'Infinite Vybeflix',
    ownerNumber: ['254116903500'],
    girlfriendJid: '254140562441@s.whatsapp.net',
    girlfriendNickname: 'Dal',

    // ── Email ──
    emailSender: process.env.EMAIL_SENDER || 'iris.with.vybeflix@gmail.com',
    emailAppPassword: process.env.EMAIL_APP_PASSWORD,
    emailRecipient: process.env.EMAIL_RECIPIENT || 'irislogs006@gmail.com',
    reportDailyTime: '0 7 * * *',
    reportWeeklyTime: '0 8 * * 1',
    resendApiKey: process.env.RESEND_API_KEY,

    // ── News API ──
    freenewsApiKey: process.env.FREENEWS_API_KEY,

    // ── Passphrase ──
    maureonixPassphrase: process.env.MAUREONIX_PASSPHRASE || 'Hello_Maureonix',

    // ===== WHATSAPP GROUP & CHANNEL =====
    groupJid: '120363423838424989@g.us',
    groupInviteLink: 'https://chat.whatsapp.com/BWhOCHhbXpD2tiNF9JGXqp',
    channelLink: 'https://whatsapp.com/channel/0029Vb7IABxCXC3J7ZFFsk2h',
    channelJid: '120363426431427396@newsletter',

    // ===== SOCIAL MEDIA =====
    tiktokLink: 'https://vm.tiktok.com/ZS9LevY1LSrXD-wytcp/',
    githubRepo: 'https://github.com/luckyfelistine-bot/maureonix',
    githubToken: process.env.GITHUB_TOKEN,

    // ===== API KEYS (SPORTS) =====
    apiSportsKey: process.env.API_SPORTS_KEY,
    oddsApiKey: process.env.ODDS_API_KEY,

    // ===== API KEYS (AI & SERVICES) =====
    geminiApiKey: process.env.GEMINI_API_KEY,
    removeBgApiKey: process.env.REMOVE_BG_API_KEY,
    voiceRssApiKey: process.env.VOICE_RSS_API_KEY,
    apiKey: process.env.NIMA_API_KEY,
    poeApiKey: process.env.POE_API_KEY,
    omdbApiKey: process.env.OMDB_API_KEY,
    rapidApiKey: process.env.RAPIDAPI_KEY,
    openaiKey: process.env.OPENAI_KEY,
    llamaKey: process.env.LLAMA_KEY,
    deepseekKey: process.env.DEEPSEEK_KEY,

    // ── AEVIBRON AI GATEWAY (Primary — Replaces Groq) ──
    aevibronApiKey: process.env.AEVIBRON_API_KEY,
    aevibronBaseUrl: process.env.AEVIBRON_BASE_URL || 'https://aevibron-gateway.vercel.app/api/v1',

    // ── LEGACY Groq (deprecated, kept for backward compat only) ──
    groqApiKeys: process.env.GROQ_API_KEYS
        ? process.env.GROQ_API_KEYS.split(',').map(k => k.trim())
        : [],

    // ===== BOT BEHAVIOR =====
    pairingCode: true,
    number_bot: '254116903500',
    adminonly: false,

    // ===== FOOTER TEXT =====
    footer: '> *Maureonix* [BOT] | BUILT BY AEVIBRON | CREATED BY INFINITE VYBEFLIX',

    // ===== PATHS =====
    tempatDB: 'database.json',
    tempatStore: 'baileys_store.json',
    listprefix: ['+', '!', '.'],
    listv: ['•','●','■','✿','▲','➩','➢','➣','➤','✦','✧','△','❀','○','□','♤','♡','◇','♧','々','〆'],

    // ===== LIMITS & MONEY =====
    limit: { free: 20, premium: 999, vip: 9999 },
    money: { free: 10000, premium: 1000000, vip: 10000000 },

    // ===== ERROR MESSAGES =====
    mess: {
        key: 'Your API key has expired. Please visit https://maureonix.biz.id',
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

    // ===== CORE API TOKENS =====
    APIFY_TOKEN: process.env.APIFY_TOKEN,
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
    COBALT_API: process.env.COBALT_API || 'https://api.cobalt.tools',

    // ===== OPTIONAL OFFICIAL APIs =====
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    VIMEO_ACCESS_TOKEN: process.env.VIMEO_ACCESS_TOKEN,
    REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    MEDIAFIRE_APP_ID: process.env.MEDIAFIRE_APP_ID,

    // ===== RAPIDAPI HOSTS =====
    RAPIDAPI_YT_HOST: process.env.RAPIDAPI_YT_HOST || 'yt-downloader1.p.rapidapi.com',
    RAPIDAPI_TIKTOK_HOST: process.env.RAPIDAPI_TIKTOK_HOST || 'tiktok-video-downloader-api.p.rapidapi.com',
    RAPIDAPI_IG_HOST: process.env.RAPIDAPI_IG_HOST || 'instagram-downloader38.p.rapidapi.com',
    RAPIDAPI_TWITTER_HOST: process.env.RAPIDAPI_TWITTER_HOST || 'twitter-video-downloader-api.p.rapidapi.com',
    RAPIDAPI_FB_HOST: process.env.RAPIDAPI_FB_HOST || 'facebook-downloader.p.rapidapi.com',
    RAPIDAPI_ALL_MEDIA_HOST: process.env.RAPIDAPI_ALL_MEDIA_HOST || 'all-media-downloader.p.rapidapi.com',

    // ===== APIFY ACTORS =====
    APIFY_YOUTUBE_ACTOR: process.env.APIFY_YOUTUBE_ACTOR || 'zakeygroot/youtube-pro-downloader-2026-working',
    APIFY_TIKTOK_ACTOR: process.env.APIFY_TIKTOK_ACTOR || 'apilabs/tiktok-downloader',
    APIFY_INSTAGRAM_ACTOR: process.env.APIFY_INSTAGRAM_ACTOR || 'instaprism/instagram-media-downloader',
    APIFY_SOCIAL_ACTOR: process.env.APIFY_SOCIAL_ACTOR || 'rover-omniscraper/media-downloader-actor',
    APIFY_ALL_SOCIAL_ACTOR: process.env.APIFY_ALL_SOCIAL_ACTOR || 'wilcode/all-social-media-video-downloader',

    // ===== OTHER THIRD-PARTY APIs =====
    TIKWM_API: process.env.TIKWM_API || 'https://www.tikwm.com',

    // ===== DOWNLOAD & PROCESSING SETTINGS =====
    DL_DIR: process.env.DL_DIR || '/tmp/maureonix_dl',
    DL_CONCURRENCY: process.env.DL_CONCURRENCY || '5',
    FFMPEG_BIN: process.env.FFMPEG_BIN || 'ffmpeg',
    GALLERYDL_BIN: process.env.GALLERYDL_BIN || 'gallery-dl',
    SPOTDL_BIN: process.env.SPOTDL_BIN || 'spotdl',

    // ===== OTHER =====
    badWords: ['dongo'],
    chatLength: 500,
    geminiMemorySize: 50,
};

module.exports = SecureConfig;
