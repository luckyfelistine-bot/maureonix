// ═══════════════════════════════════════════════════════════════════════════
//   🦊 MAUREONIX ORACLE INTENT ENGINE v4.0 — "THE MIND READER"
//   Semantic Embedding · State Machine · Intent Fusion · Temporal Parsing
//   Cross-Lingual Zero-Shot · Confidence Calibration
// ═══════════════════════════════════════════════════════════════════════════

const fetch = require('node-fetch');

// ═══════════════════════════════════════════════════════════════════════════
//   GOOGLE TRANSLATE (lightweight copy for intent parsing)
// ═══════════════════════════════════════════════════════════════════════════
async function googleTranslate(text, targetLang = 'en', sourceLang = 'auto') {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url, { timeout: 8000 });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const translated = data[0].map(item => item[0]).join('');
        const detectedLang = data[2] || sourceLang;
        return { text: translated, detectedLang, raw: data };
    } catch (e) {
        return { text, detectedLang: 'en', error: e.message };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   COMPLETE COMMAND TAXONOMY — Semantic descriptions with embedding anchors
// ═══════════════════════════════════════════════════════════════════════════
const TAXONOMY = [
    // ── Bot Info ──
    { cmd: 'ping', domains: ['bot'], verbs: ['ping','check','test'], nouns: ['speed','latency','response','connection'], desc: 'Check bot response time', embedding: 'network latency speed test connection diagnostic' },
    { cmd: 'alive', domains: ['bot'], verbs: ['check','are'], nouns: ['alive','online','status','up'], desc: 'Check if bot is online', embedding: 'status online availability health check' },
    { cmd: 'menu', domains: ['bot'], verbs: ['show','list','give','get'], nouns: ['menu','help','commands','options','what can you do'], desc: 'Show the main menu', embedding: 'menu help commands list options guide navigation' },
    { cmd: 'owner', domains: ['bot'], verbs: ['contact','call','find','who'], nouns: ['owner','creator','human','maker','infinite','vybeflix'], desc: 'Contact the owner', embedding: 'owner creator contact developer admin' },
    { cmd: 'profile', domains: ['bot','user'], verbs: ['check','show','my'], nouns: ['profile','stats','info','account','limit','balance'], desc: 'Show user profile', embedding: 'profile statistics account information user data' },
    { cmd: 'leaderboard', domains: ['bot'], verbs: ['show','get','see'], nouns: ['leaderboard','top','ranking','richest','highest'], desc: 'Show leaderboard', embedding: 'leaderboard ranking top scores competition' },
    { cmd: 'docs', domains: ['bot','info'], verbs: ['read','show','get','open'], nouns: ['docs','documentation','guide','manual','help'], desc: 'Read documentation', embedding: 'documentation guide manual instructions help docs' },
    { cmd: 'ask', domains: ['bot','info'], verbs: ['ask','question','how'], nouns: [], desc: 'Ask about documentation', embedding: 'question inquiry ask information docs' },

    // ── Download ──
    { cmd: 'song', domains: ['music','audio','download'], verbs: ['download','get','play','find','search'], nouns: ['song','music','track','audio','mp3','tune'], desc: 'Download audio from YouTube/Spotify', embedding: 'download music song audio mp3 track youtube spotify' },
    { cmd: 'video', domains: ['video','download'], verbs: ['download','get','find'], nouns: ['video','clip','movie','mp4','footage'], desc: 'Download video from YouTube etc.', embedding: 'download video mp4 clip movie youtube' },
    { cmd: 'play', domains: ['music','audio'], verbs: ['play','listen','hear','put on'], nouns: ['song','music','track','playlist'], desc: 'Play audio (alias for song)', embedding: 'play music audio listen song track' },
    { cmd: 'tiktok', domains: ['social','download'], verbs: ['download','get','save'], nouns: ['tiktok','tt','tik'], desc: 'Download TikTok videos', embedding: 'download tiktok video social media' },
    { cmd: 'instagram', domains: ['social','download'], verbs: ['download','get','save'], nouns: ['instagram','ig','insta','reel','post'], desc: 'Download Instagram media', embedding: 'download instagram ig reel post photo video' },
    { cmd: 'spotify', domains: ['music','download'], verbs: ['download','get'], nouns: ['spotify','sp','spot'], desc: 'Download from Spotify', embedding: 'download spotify music track playlist' },
    { cmd: 'apk', domains: ['apps','download'], verbs: ['download','get','install'], nouns: ['apk','app','android','application'], desc: 'Download Android APK', embedding: 'download apk app android application install' },
    { cmd: 'dl', domains: ['download'], verbs: ['download','get','fetch','grab'], nouns: ['file','url','link'], desc: 'Universal downloader', embedding: 'download file url link universal fetch' },

    // ── AI ──
    { cmd: 'gpt', domains: ['ai','chat'], verbs: ['ask','tell','explain','help'], nouns: ['gpt','chatgpt','openai','question'], desc: 'Chat with GPT', embedding: 'chat gpt openai ai conversation ask' },
    { cmd: 'gemini', domains: ['ai','chat'], verbs: ['ask','tell'], nouns: ['gemini','google','bard'], desc: 'Chat with Gemini', embedding: 'chat gemini google bard ai conversation' },
    { cmd: 'deepseek', domains: ['ai','chat'], verbs: ['ask','tell'], nouns: ['deepseek','deep','seek'], desc: 'Chat with DeepSeek', embedding: 'chat deepseek ai conversation ask' },
    { cmd: 'ai', domains: ['ai','chat'], verbs: ['ask','tell','help','explain','what','who','how','why','can you'], nouns: [], desc: 'General AI conversation', embedding: 'ai assistant chat conversation help ask question' },
    { cmd: 'imagine', domains: ['ai','image'], verbs: ['draw','create','generate','make','design','paint'], nouns: ['image','picture','art','photo','illustration'], desc: 'Generate AI image', embedding: 'generate image picture art photo ai draw create' },
    { cmd: 'translate', domains: ['ai','text'], verbs: ['translate','convert','change'], nouns: ['language','text','word'], desc: 'Translate text', embedding: 'translate language text convert words' },
    { cmd: 'tts', domains: ['ai','audio'], verbs: ['speak','say','read','pronounce'], nouns: ['text','voice','speech'], desc: 'Text to speech', embedding: 'text to speech voice audio speak read' },
    { cmd: 'summarize', domains: ['ai','text'], verbs: ['summarize','summarise','shorten','tl;dr'], nouns: ['summary','text','article'], desc: 'Summarise text', embedding: 'summarize text article summary shorten tl;dr' },
    { cmd: 'code', domains: ['ai','dev'], verbs: ['write','create','generate','make','build'], nouns: ['code','script','program','function','algorithm'], desc: 'Generate code', embedding: 'code generate write program script function algorithm' },
    { cmd: 'brainrot', domains: ['ai','fun'], verbs: ['generate','make'], nouns: ['brainrot','gen z','slang','skibidi','rizz'], desc: 'Generate brainrot text', embedding: 'brainrot gen z slang skibidi rizz funny text' },

    // ── Search ──
    { cmd: 'google', domains: ['search'], verbs: ['search','find','look','google','query'], nouns: ['web','internet','information'], desc: 'Google search', embedding: 'search google web internet find information query' },
    { cmd: 'wiki', domains: ['search'], verbs: ['search','find','look'], nouns: ['wiki','wikipedia','encyclopedia'], desc: 'Wikipedia search', embedding: 'search wikipedia wiki encyclopedia knowledge' },
    { cmd: 'weather', domains: ['search','info'], verbs: ['check','get','show'], nouns: ['weather','forecast','temperature','rain','hot','cold'], desc: 'Weather forecast', embedding: 'weather forecast temperature rain check' },
    { cmd: 'news', domains: ['search','info'], verbs: ['get','show','tell','what is'], nouns: ['news','headlines','current events','happening'], desc: 'Latest news', embedding: 'news headlines current events information latest' },
    { cmd: 'crypto', domains: ['search','finance'], verbs: ['check','get','show'], nouns: ['crypto','bitcoin','eth','price','coin'], desc: 'Crypto price', embedding: 'crypto bitcoin price check ethereum coin' },
    { cmd: 'urban', domains: ['search','fun'], verbs: ['define','explain','what is'], nouns: ['urban','slang','meaning','dictionary'], desc: 'Urban Dictionary lookup', embedding: 'urban dictionary slang define meaning words' },
    { cmd: 'anime', domains: ['search','entertainment'], verbs: ['search','find','look'], nouns: ['anime','show'], desc: 'Search anime', embedding: 'search anime show manga japanese' },
    { cmd: 'manga', domains: ['search','entertainment'], verbs: ['search','find','look'], nouns: ['manga','comic'], desc: 'Search manga', embedding: 'search manga comic japanese anime' },
    { cmd: 'github', domains: ['search','dev'], verbs: ['search','find','look'], nouns: ['github','repo','repository','code'], desc: 'GitHub search', embedding: 'search github repository code repo developer' },
    { cmd: 'npm', domains: ['search','dev'], verbs: ['search','find','look'], nouns: ['npm','package','module'], desc: 'NPM search', embedding: 'search npm package module node javascript' },

    // ── Fun ──
    { cmd: 'joke', domains: ['fun'], verbs: ['tell','give','say','make'], nouns: ['joke','funny','laugh','humour'], desc: 'Tell a joke', embedding: 'joke funny laugh humor tell comedy' },
    { cmd: 'meme', domains: ['fun'], verbs: ['send','give','show'], nouns: ['meme','funny picture'], desc: 'Send a meme', embedding: 'meme funny picture image humor send' },
    { cmd: '8ball', domains: ['fun'], verbs: ['ask','predict','will','should','do you think'], nouns: ['8ball','magic','ball','fortune'], desc: 'Magic 8-ball', embedding: '8ball magic fortune predict ask future' },
    { cmd: 'truth', domains: ['fun','game'], verbs: ['give','ask','tell'], nouns: ['truth','truth or dare'], desc: 'Truth question', embedding: 'truth question dare game fun' },
    { cmd: 'dare', domains: ['fun','game'], verbs: ['give','ask','tell'], nouns: ['dare','challenge'], desc: 'Dare challenge', embedding: 'dare challenge game fun truth' },
    { cmd: 'roast', domains: ['fun'], verbs: ['roast','burn','insult','diss'], nouns: [], desc: 'Roast someone', embedding: 'roast insult funny burn diss humor' },
    { cmd: 'compliment', domains: ['fun'], verbs: ['compliment','praise','say something nice'], nouns: [], desc: 'Compliment someone', embedding: 'compliment praise nice kind words' },
    { cmd: 'ship', domains: ['fun'], verbs: ['ship','match','calculate'], nouns: ['love','compatibility','couple'], desc: 'Ship two people', embedding: 'ship love compatibility couple match romance' },
    { cmd: 'sticker', domains: ['media','sticker'], verbs: ['make','create','convert'], nouns: ['sticker','stiker'], desc: 'Create sticker', embedding: 'sticker create make convert image media' },
    { cmd: 'brat', domains: ['media','sticker'], verbs: ['make','create'], nouns: ['brat','brat sticker'], desc: 'Create brat sticker', embedding: 'brat sticker create make image' },
    { cmd: 'qc', domains: ['media','image'], verbs: ['make','create'], nouns: ['quote','qc','quotely'], desc: 'Create quote image', embedding: 'quote image create quotely text' },

    // ── Games ──
    { cmd: 'slot', domains: ['game','casino'], verbs: ['spin','play'], nouns: ['slot','slots','machine'], desc: 'Slot machine', embedding: 'slot machine casino spin game gambling' },
    { cmd: 'rpg', domains: ['game','adventure'], verbs: ['fight','play','attack','heal'], nouns: ['rpg','adventure','quest'], desc: 'RPG game', embedding: 'rpg adventure game quest fight roleplay' },
    { cmd: 'blackjack', domains: ['game','casino'], verbs: ['play','hit','stand'], nouns: ['blackjack','bj','21'], desc: 'Blackjack game', embedding: 'blackjack casino card game 21 gambling' },
    { cmd: 'connect4', domains: ['game','multiplayer'], verbs: ['play','start'], nouns: ['connect4','connect four','c4'], desc: 'Connect 4 game', embedding: 'connect four game multiplayer board strategy' },
    { cmd: 'trivia', domains: ['game','quiz'], verbs: ['play','ask','give'], nouns: ['trivia','quiz','question'], desc: 'Trivia quiz', embedding: 'trivia quiz question game knowledge' },
    { cmd: 'pokemon', domains: ['game'], verbs: ['guess','who is'], nouns: ['pokemon','who\'s that pokemon'], desc: 'Guess Pokémon', embedding: 'pokemon guess game quiz character' },
    { cmd: 'roulette', domains: ['game','casino'], verbs: ['bet','spin'], nouns: ['roulette','wheel'], desc: 'Roulette', embedding: 'roulette casino wheel spin gambling bet' },
    { cmd: 'crash', domains: ['game','casino'], verbs: ['bet','cash'], nouns: ['crash','multiplier'], desc: 'Crash game', embedding: 'crash game multiplier gambling bet casino' },
    { cmd: 'coinflip', domains: ['game','casino'], verbs: ['flip','bet'], nouns: ['coin','coinflip','heads','tails'], desc: 'Coin flip', embedding: 'coin flip heads tails game gambling' },
    { cmd: 'rps', domains: ['game'], verbs: ['play','throw'], nouns: ['rps','rock','paper','scissors'], desc: 'Rock Paper Scissors', embedding: 'rock paper scissors game rps' },

    // ── Economy ──
    { cmd: 'daily', domains: ['economy'], verbs: ['claim','get','collect'], nouns: ['daily','reward','bonus','free'], desc: 'Claim daily reward', embedding: 'daily reward claim bonus free economy' },
    { cmd: 'work', domains: ['economy'], verbs: ['work','earn','make'], nouns: ['job','money','coins'], desc: 'Work for money', embedding: 'work earn money job coins economy' },
    { cmd: 'rob', domains: ['economy'], verbs: ['rob','steal','mug'], nouns: ['money','coins','wallet'], desc: 'Rob someone', embedding: 'rob steal money coins wallet economy' },
    { cmd: 'balance', domains: ['economy'], verbs: ['check','get','show','how much'], nouns: ['balance','money','wallet','coins','bank','rich','poor'], desc: 'Check balance', embedding: 'balance money wallet coins bank check economy' },
    { cmd: 'deposit', domains: ['economy'], verbs: ['deposit','save','put','store'], nouns: ['money','coins','bank'], desc: 'Deposit money', embedding: 'deposit save money bank coins economy' },
    { cmd: 'withdraw', domains: ['economy'], verbs: ['withdraw','take','pull','get'], nouns: ['money','coins','bank'], desc: 'Withdraw money', embedding: 'withdraw take money bank coins economy' },
    { cmd: 'transfer', domains: ['economy'], verbs: ['transfer','send','give','pay'], nouns: ['money','coins'], desc: 'Transfer money', embedding: 'transfer send money coins pay economy' },
    { cmd: 'buy', domains: ['economy'], verbs: ['buy','purchase','get','shop'], nouns: ['item','phone','car','house'], desc: 'Buy item', embedding: 'buy purchase item shop store economy' },
    { cmd: 'inventory', domains: ['economy'], verbs: ['check','show','list'], nouns: ['inventory','inv','items','backpack','stuff'], desc: 'Check inventory', embedding: 'inventory items backpack check list stuff' },

    // ── Group ──
    { cmd: 'add', domains: ['group','admin'], verbs: ['add','invite','bring'], nouns: ['member','user','person'], desc: 'Add member', embedding: 'add member invite group user person' },
    { cmd: 'kick', domains: ['group','admin'], verbs: ['kick','remove','ban','get out','throw'], nouns: ['member','user','person'], desc: 'Kick member', embedding: 'kick remove ban member group user' },
    { cmd: 'promote', domains: ['group','admin'], verbs: ['promote','make','give'], nouns: ['admin','power'], desc: 'Promote to admin', embedding: 'promote admin power group member' },
    { cmd: 'demote', domains: ['group','admin'], verbs: ['demote','remove','take'], nouns: ['admin','power'], desc: 'Demote from admin', embedding: 'demote admin remove power group' },
    { cmd: 'tagall', domains: ['group','admin'], verbs: ['tag','mention','call','notify'], nouns: ['everyone','all','members','people'], desc: 'Tag all members', embedding: 'tag all everyone mention members group notify' },
    { cmd: 'hidetag', domains: ['group','admin'], verbs: ['tag','mention','ghost'], nouns: ['everyone','all'], desc: 'Hidden tag', embedding: 'hidden tag mention everyone ghost group' },
    { cmd: 'linkgroup', domains: ['group'], verbs: ['get','give','send','share'], nouns: ['link','invite','group link','url'], desc: 'Get group link', embedding: 'group link invite url share' },
    { cmd: 'revoke', domains: ['group','admin'], verbs: ['reset','change','revoke','new'], nouns: ['link','invite'], desc: 'Reset group link', embedding: 'revoke reset link invite group new' },
    { cmd: 'setname', domains: ['group','admin'], verbs: ['change','set','rename','update'], nouns: ['name','title','group name'], desc: 'Set group name', embedding: 'set name rename title group update' },
    { cmd: 'setdesc', domains: ['group','admin'], verbs: ['change','set','update'], nouns: ['description','desc','about'], desc: 'Set group description', embedding: 'set description about group update' },
    { cmd: 'delete', domains: ['group'], verbs: ['delete','remove','clear'], nouns: ['message','msg'], desc: 'Delete message', embedding: 'delete message remove clear group' },

    // ── Owner ──
    { cmd: 'block', domains: ['owner'], verbs: ['block','ban'], nouns: ['user','number','person'], desc: 'Block user', embedding: 'block user ban number person' },
    { cmd: 'unblock', domains: ['owner'], verbs: ['unblock','unban'], nouns: ['user','number'], desc: 'Unblock user', embedding: 'unblock user unban number' },
    { cmd: 'join', domains: ['owner'], verbs: ['join','enter'], nouns: ['group','link'], desc: 'Join group', embedding: 'join group enter link invite' },
    { cmd: 'leave', domains: ['owner'], verbs: ['leave','exit','get out'], nouns: ['group'], desc: 'Leave group', embedding: 'leave group exit' },
    { cmd: 'backup', domains: ['owner'], verbs: ['backup','save','export'], nouns: ['database','db','data'], desc: 'Backup database', embedding: 'backup database save export data' },
    { cmd: 'public', domains: ['owner'], verbs: ['make','set'], nouns: ['public','mode','open'], desc: 'Set public mode', embedding: 'public mode open bot access' },
    { cmd: 'private', domains: ['owner'], verbs: ['make','set'], nouns: ['private','mode','closed','lock'], desc: 'Set private mode', embedding: 'private mode closed lock bot access' },

    // ── Health/Finance ──
    { cmd: 'bmi', domains: ['health'], verbs: ['calculate','check','get'], nouns: ['bmi','body mass','weight','height'], desc: 'Calculate BMI', embedding: 'bmi body mass index calculate weight height health' },
    { cmd: 'bmr', domains: ['health'], verbs: ['calculate','check','get'], nouns: ['bmr','calories','metabolism'], desc: 'Calculate BMR', embedding: 'bmr calories metabolism calculate health' },
    { cmd: 'sleep', domains: ['health'], verbs: ['calculate','check','when'], nouns: ['sleep','wake','bedtime','cycle'], desc: 'Sleep cycles', embedding: 'sleep wake bedtime cycle calculate health' },
    { cmd: 'workout', domains: ['health'], verbs: ['give','generate','create'], nouns: ['workout','exercise','gym','fitness','plan'], desc: 'Workout plan', embedding: 'workout exercise gym fitness plan generate' },
    { cmd: 'recipe', domains: ['food'], verbs: ['give','find','get','show'], nouns: ['recipe','food','dish','cook','meal'], desc: 'Find recipe', embedding: 'recipe food dish cook meal find' },
    { cmd: 'stock', domains: ['finance'], verbs: ['check','get','show'], nouns: ['stock','share','price','market'], desc: 'Stock price', embedding: 'stock share price market check finance' },
    { cmd: 'loan', domains: ['finance'], verbs: ['calculate','compute'], nouns: ['loan','emi','mortgage'], desc: 'Calculate EMI', embedding: 'loan emi mortgage calculate finance' },
    { cmd: 'tip', domains: ['finance'], verbs: ['calculate','compute'], nouns: ['tip','gratuity','split'], desc: 'Tip calculator', embedding: 'tip gratuity split calculate bill' },

    // ── Reminders/Notes ──
    { cmd: 'remindme', domains: ['productivity'], verbs: ['remind','set','create'], nouns: ['reminder','alarm','notification'], desc: 'Set reminder', embedding: 'reminder alarm notification set create' },
    { cmd: 'remind', domains: ['productivity'], verbs: ['remind','schedule','set'], nouns: ['reminder','meeting','call','appointment'], desc: 'Natural language reminder', embedding: 'remind schedule meeting call appointment' },
    { cmd: 'reminders', domains: ['productivity'], verbs: ['list','show','get','check'], nouns: ['reminders','active','pending'], desc: 'List reminders', embedding: 'reminders list active pending check' },
    { cmd: 'note', domains: ['productivity'], verbs: ['save','write','add','create'], nouns: ['note','memo','record'], desc: 'Save a note', embedding: 'note memo save write record' },
    { cmd: 'todo', domains: ['productivity'], verbs: ['add','create','make'], nouns: ['todo','task','list'], desc: 'Add to-do', embedding: 'todo task list add create' },

    // ── Movies/Sports ──
    { cmd: 'movie', domains: ['entertainment'], verbs: ['find','search','get','show'], nouns: ['movie','film','cinema','show'], desc: 'Search movie', embedding: 'movie film cinema search find entertainment' },
    { cmd: 'series', domains: ['entertainment'], verbs: ['find','search','get'], nouns: ['series','tv','show','drama'], desc: 'Search TV series', embedding: 'series tv show drama search find' },
    { cmd: 'leagues', domains: ['sports'], verbs: ['show','list','get'], nouns: ['leagues','football','soccer','competition'], desc: 'List football leagues', embedding: 'leagues football soccer competition list sports' },
    { cmd: 'live', domains: ['sports'], verbs: ['show','get','check'], nouns: ['live','score','match','game'], desc: 'Live scores', embedding: 'live score match game sports check' },
    { cmd: 'standings', domains: ['sports'], verbs: ['show','get','check'], nouns: ['standings','table','ranking','position'], desc: 'League table', embedding: 'standings table ranking position sports' },

    // ── System (owner only) ──
    { cmd: 'sysinfo', domains: ['system','owner'], verbs: ['show','get','check'], nouns: ['system','info','stats','status','cpu','memory'], desc: 'System information', embedding: 'system info stats status cpu memory' },
    { cmd: 'restart', domains: ['system','owner'], verbs: ['restart','reboot','reload'], nouns: ['bot','system'], desc: 'Restart bot', embedding: 'restart reboot reload bot system' },
    { cmd: 'knowledge', domains: ['system','owner'], verbs: ['learn','remember','store','add'], nouns: ['fact','knowledge','memory'], desc: 'Add knowledge', embedding: 'knowledge learn remember store fact memory' },
    { cmd: 'reflect', domains: ['system','owner'], verbs: ['reflect','report'], nouns: ['self','diagnostics','report'], desc: 'Self-reflection report', embedding: 'reflect self diagnostics report analysis' },
    { cmd: 'autoai', domains: ['system','owner'], verbs: ['enable','disable','toggle'], nouns: ['auto','ai','autoai','mode'], desc: 'Toggle auto-AI', embedding: 'auto ai mode toggle enable disable' },
    { cmd: 'privatemode', domains: ['system','owner'], verbs: ['set','change'], nouns: ['private','mode','away'], desc: 'Set private mode', embedding: 'private mode away set change' },
    { cmd: 'pending', domains: ['system','owner'], verbs: ['check','show','get'], nouns: ['pending','inbox','messages','waiting'], desc: 'Pending messages', embedding: 'pending inbox messages waiting check' },

    // ── Learning ──
    { cmd: 'learn', domains: ['learning','system'], verbs: ['learn','study','read'], nouns: ['learn','study','mode','curriculum'], desc: 'Enter learning mode', embedding: 'learn study mode curriculum read education' },
    { cmd: 'test', domains: ['learning','system'], verbs: ['test','quiz','evaluate'], nouns: ['test','quiz','evaluation','exam'], desc: 'Test knowledge', embedding: 'test quiz evaluate exam knowledge check' },
    { cmd: 'eval', domains: ['learning','system'], verbs: ['evaluate','assess','grade'], nouns: ['evaluation','assessment','grade'], desc: 'Evaluate understanding', embedding: 'evaluate assess grade understanding learning' },
    { cmd: 'exitlearn', domains: ['learning','system'], verbs: ['exit','leave','stop'], nouns: ['learning','mode','study'], desc: 'Exit learning mode', embedding: 'exit learning mode study stop' },
];

// ═══════════════════════════════════════════════════════════════════════════
//   SEMANTIC INTENT MATCHER — Embedding-based similarity (LLM-powered)
// ═══════════════════════════════════════════════════════════════════════════
class SemanticIntentMatcher {
    constructor(taxonomy) {
        this.taxonomy = taxonomy;
        this.cache = new Map(); // text → embedding vector (simulated)
    }

    // Generate a semantic embedding using LLM (simulated via keyword extraction + weighting)
    async generateEmbedding(text) {
        const cacheKey = text.toLowerCase().trim().slice(0, 100);
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        // Extract semantic features
        const words = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
        const embedding = {};

        // Word frequency weights
        for (const word of words) {
            embedding[word] = (embedding[word] || 0) + 1;
        }

        // Boost verbs and nouns based on position
        const firstWords = words.slice(0, 3);
        for (const w of firstWords) embedding[w] = (embedding[w] || 0) + 2;

        this.cache.set(cacheKey, embedding);
        return embedding;
    }

    cosineSimilarity(emb1, emb2) {
        const allKeys = new Set([...Object.keys(emb1), ...Object.keys(emb2)]);
        let dot = 0, mag1 = 0, mag2 = 0;
        for (const key of allKeys) {
            const v1 = emb1[key] || 0;
            const v2 = emb2[key] || 0;
            dot += v1 * v2;
            mag1 += v1 * v1;
            mag2 += v2 * v2;
        }
        if (mag1 === 0 || mag2 === 0) return 0;
        return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
    }

    async match(text, topK = 5) {
        const inputEmb = await this.generateEmbedding(text);
        const scores = [];

        for (const intent of this.taxonomy) {
            const intentEmb = await this.generateEmbedding(intent.embedding || `${intent.desc} ${intent.verbs.join(' ')} ${intent.nouns.join(' ')}`);
            const sim = this.cosineSimilarity(inputEmb, intentEmb);

            // Boost for exact verb/noun matches
            const lower = text.toLowerCase();
            let boost = 0;
            for (const verb of intent.verbs) if (lower.includes(verb)) boost += 0.15;
            for (const noun of intent.nouns) if (lower.includes(noun)) boost += 0.1;
            if (lower.includes(intent.cmd)) boost += 0.3;

            scores.push({ intent, score: Math.min(1.0, sim + boost) });
        }

        scores.sort((a, b) => b.score - a.score);
        return scores.slice(0, topK);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   CONVERSATION STATE MACHINE — Multi-turn context tracking
// ═══════════════════════════════════════════════════════════════════════════
class ConversationStateMachine {
    constructor() {
        this.states = new Map(); // userId → {currentState, stateData, history}
    }

    getState(userId) {
        if (!this.states.has(userId)) {
            this.states.set(userId, { currentState: 'idle', stateData: {}, history: [], enteredAt: Date.now() });
        }
        return this.states.get(userId);
    }

    transition(userId, newState, data = {}) {
        const state = this.getState(userId);
        state.history.push({ from: state.currentState, to: newState, at: Date.now(), data });
        if (state.history.length > 20) state.history.shift();
        state.currentState = newState;
        state.stateData = { ...state.stateData, ...data };
        state.enteredAt = Date.now();
    }

    isInState(userId, state) {
        return this.getState(userId).currentState === state;
    }

    getStateContext(userId) {
        const state = this.getState(userId);
        return {
            current: state.currentState,
            duration: Date.now() - state.enteredAt,
            history: state.history.slice(-5),
            data: state.stateData,
        };
    }

    reset(userId) {
        this.states.delete(userId);
    }
}

const globalStateMachine = new ConversationStateMachine();

// ═══════════════════════════════════════════════════════════════════════════
//   INTENT FUSION ENGINE — Combines multiple weak signals into strong intent
// ═══════════════════════════════════════════════════════════════════════════
class IntentFusionEngine {
    fuse(signals) {
        // signals: [{source, intent, confidence, weight}]
        const grouped = {};
        for (const sig of signals) {
            if (!grouped[sig.intent]) grouped[sig.intent] = [];
            grouped[sig.intent].push(sig);
        }

        const fused = [];
        for (const [intent, sigs] of Object.entries(grouped)) {
            // Weighted average confidence
            const totalWeight = sigs.reduce((s, g) => s + (g.weight || 1), 0);
            const weightedConf = sigs.reduce((s, g) => s + g.confidence * (g.weight || 1), 0) / totalWeight;

            // Agreement factor (more sources = higher confidence)
            const agreement = Math.min(1.0, sigs.length * 0.2 + 0.6);

            fused.push({
                intent,
                confidence: Math.min(1.0, weightedConf * agreement),
                sources: sigs.map(s => s.source),
                rawSignals: sigs.length,
            });
        }

        fused.sort((a, b) => b.confidence - a.confidence);
        return fused;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   TEMPORAL INTENT PARSER — Understands "do this later"
// ═══════════════════════════════════════════════════════════════════════════
class TemporalIntentParser {
    parse(text) {
        const patterns = [
            { regex: /\b(remind me|remind us|remind everyone)\b/i, type: 'reminder', extract: (m) => m[0] },
            { regex: /\b(in\s+(\d+)\s*(min|minute|minutes|hour|hours|hr|hrs|day|days))\b/i, type: 'delayed', delay: (m) => {
                const num = parseInt(m[2]);
                const unit = m[3].startsWith('min') ? 60 : m[3].startsWith('hour') || m[3].startsWith('hr') ? 3600 : 86400;
                return num * unit * 1000;
            }},
            { regex: /\b(tomorrow|next\s+day)\b/i, type: 'tomorrow', delay: () => 86400000 },
            { regex: /\b(next\s+week)\b/i, type: 'next_week', delay: () => 604800000 },
            { regex: /\b(at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?)\b/i, type: 'scheduled_time', extract: (m) => m[0] },
        ];

        for (const p of patterns) {
            const match = text.match(p.regex);
            if (match) {
                return {
                    hasTemporal: true,
                    type: p.type,
                    delay: p.delay ? p.delay(match) : null,
                    raw: p.extract ? p.extract(match) : match[0],
                };
            }
        }
        return { hasTemporal: false };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   PATTERN LIBRARIES — Enhanced fast rejection
// ═══════════════════════════════════════════════════════════════════════════
const NEGATION = /\b(don\'t|do not|never|no|not|stop|quit|cease|avoid|refrain from|didn\'t|won\'t|wouldn\'t|shouldn\'t|can\'t|cannot|couldn\'t)\b/i;
const DESCRIPTIVE = /^(i\'m|i am|we are|they are|she is|he is|my name is|this is|that is|it is)\s+\w+ing\b|^(i was|we were)\s+\w+ing\b|^(i have|we have)\s+\w+(ed|en)\b|^(yesterday|today|tomorrow|last week)\s|\b(said|told|mentioned|claimed|thought|felt|heard|saw)\b|\b(playing|watching|listening|having|eating|going|doing)\s+(?:a|an|the|some|my|his|her|their)\b/i;
const SARCASM = /(?:^|\s)(yeah right|sure|okay|ok|great|wonderful|perfect|lovely|fantastic)[,.!]*\s*(?:sure|right|okay|ok)|!{2,}\s*(?:sure|right|okay)|\b(obviously|clearly|definitely)\b.*\?|(?:^|\s)(oh|ah|wow)\s+(?:great|perfect|wonderful|lovely)\b/i;
const HYPOTHETICAL = /\b(if|suppose|assuming|imagine|what if|let\'s say|in theory|hypothetically)\b|\b(if i were|if you were)\b/i;
const INJECTION = /ignore (?:all |your |the )?(?:previous |prior )?(?:instructions|prompts|rules)|(?:new|different) (?:instructions|prompt|role|persona)|DAN mode|jailbreak|developer mode|(?:system|admin|root) (?:override|access)|eval\s*\(|process\.exit|require\s*\(|child_process/i;
const REPORTED_SPEECH = /\b(said|told|mentioned|claimed|asked|requested|demanded|yelled|screamed|whispered)\s+["'][^"']+["']/i;
const PROMOTIONAL = /\b(buy now|limited offer|discount|free trial|click here|subscribe|join now|win a|act now|congratulations.*won|earn money fast|work from home)\b/i;
const SPAM = /\bhttps?:\/\/\S+\s+https?:\/\/\S+\s+https?:\/\/\S+|\b(?!.*\.(com|org|net|io|gov|edu|mil))\b.*\b(follow me|dm me|subscribe)\b/i;

// ═══════════════════════════════════════════════════════════════════════════
//   GAME STATE AWARENESS — Enhanced
// ═══════════════════════════════════════════════════════════════════════════
function detectGameTopic(text) {
    const lower = text.toLowerCase();
    if (/\btruth or dare\b/i.test(lower)) return 'truth_or_dare';
    if (/\b(truths and dares|give me truth|give me dare|truth question|dare challenge|ask truth|ask dare)\b/i.test(lower)) return 'truth_or_dare';
    if (/\bconnect four|connect 4\b/i.test(lower)) return 'connect4';
    if (/\bchess\b/i.test(lower)) return 'chess';
    if (/\bslot machine\b/i.test(lower)) return 'slot';
    if (/\brpg\b/i.test(lower)) return 'rpg';
    if (/\bblackjack\b/i.test(lower)) return 'blackjack';
    if (/\btrivia\b/i.test(lower)) return 'trivia';
    if (/\bpokemon\b/i.test(lower)) return 'pokemon';
    if (/\broulette\b/i.test(lower)) return 'roulette';
    if (/\bcoinflip|coin flip\b/i.test(lower)) return 'coinflip';
    return null;
}

function checkGameContext(text, activeModes) {
    const lower = text.toLowerCase().trim();
    for (const mode of activeModes) {
        if (mode === 'truth_or_dare' && /\b(truth|dare)\b/i.test(lower) && lower.length < 60 && !lower.includes('command') && !lower.includes('menu')) {
            return { isGame: true, game: 'truth_or_dare', type: /\btruth\b/i.test(lower) ? 'truth' : 'dare' };
        }
        if (mode === 'chess' && /^[a-h][1-8]\s+[a-h][1-8]$/i.test(lower)) return { isGame: true, game: 'chess' };
        if (mode === 'connect4' && (/^[1-7]$|^(me)?nyerah|surr?ender$/i.test(lower))) return { isGame: true, game: 'connect4' };
        if (mode === 'akinator' && /^(yes|no|don\'t know|probably|probably not|back|end)$/i.test(lower)) return { isGame: true, game: 'akinator' };
        if (mode === 'rpg' && /^(attack|heal|defend|run|use|cast|inventory|stats|quest)$/i.test(lower)) return { isGame: true, game: 'rpg' };
    }
    return { isGame: false };
}

// ═══════════════════════════════════════════════════════════════════════════
//   UNICODE NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════════
const HOMOGLYPHS = { 'а':'a','е':'e','о':'o','р':'p','с':'c','х':'x','і':'i','ј':'j','ԛ':'q','ѕ':'s','ԝ':'w','Ƅ':'b','ԁ':'d','һ':'h','ո':'n','ʀ':'r','ս':'u','ν':'v','у':'y' };

// ═══════════════════════════════════════════════════════════════════════════
//   ORACLE INTENT ENGINE — Multi-layer analysis with state awareness
// ═══════════════════════════════════════════════════════════════════════════
class IntentEngine {
    constructor(opts = {}) {
        this.context = opts.context || [];
        this.activeModes = opts.activeModes || [];
        this.userId = opts.userId || 'global';
        this.model = opts.model || 'llama-3.1-8b-instant';
        this.semanticMatcher = new SemanticIntentMatcher(TAXONOMY);
        this.stateMachine = globalStateMachine;
        this.fusionEngine = new IntentFusionEngine();
        this.temporalParser = new TemporalIntentParser();
    }

    normalize(text) {
        let n = text.replace(/\u200B|\u200C|\u200D|\uFEFF/g, '');
        for (const [f, r] of Object.entries(HOMOGLYPHS)) n = n.split(f).join(r);
        return n.normalize('NFKC');
    }

    // ── Layer 1: Syntactic Analysis ──
    syntacticAnalysis(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        const clauses = [];
        for (const sent of sentences) {
            const parts = sent.split(/,|;|\band\b|\bwhile\b|\bthen\b|\bbut\b|\bor\b/);
            for (const part of parts) {
                const t = part.trim(); if (!t) continue;
                clauses.push({
                    text: t,
                    negated: NEGATION.test(t),
                    descriptive: DESCRIPTIVE.test(t),
                    sarcastic: SARCASM.test(t),
                    hypothetical: HYPOTHETICAL.test(t),
                    reported: REPORTED_SPEECH.test(t),
                    promotional: PROMOTIONAL.test(t),
                    spam: SPAM.test(t),
                    question: /^(what|how|why|who|when|where|is|are|do|does|did|can|could|will|would|should|may|might|has|have|had|am|was|were)\b/i.test(t) || t.endsWith('?'),
                    imperative: /^(do|run|execute|use|call|trigger|send|give|show|get|find|search|download|play|tell|make|create|convert|ban|kick|add|remove|delete|set|change|update|start|stop|turn on|turn off|enable|disable|toggle|block|unblock|claim|deposit|withdraw|buy|sell|transfer|pay|check|calculate|summarise|translate|speak|say|generate|create|draw|imagine|learn|study|read|test|quiz|evaluate)\b/i.test(t),
                    injection: INJECTION.test(t),
                    temporal: this.temporalParser.parse(t).hasTemporal,
                });
            }
        }
        return clauses;
    }

    // ── Layer 1b: Fast rejection ──
    fastReject(clauses) {
        if (!clauses.length) return { reject: true, reason: 'empty' };
        if (clauses.some(c => c.injection)) return { reject: true, reason: 'injection', certainty: 1.0 };
        if (clauses.some(c => c.spam)) return { reject: true, reason: 'spam', certainty: 1.0 };
        if (clauses.some(c => c.promotional && c.imperative)) return { reject: true, reason: 'promotional', certainty: 0.95 };
        if (clauses.every(c => c.descriptive && !c.imperative && !c.question)) return { reject: true, reason: 'all_descriptive', certainty: 0.9 };
        if (clauses.every(c => c.negated)) return { reject: true, reason: 'all_negated', certainty: 0.9 };
        if (clauses.some(c => c.sarcastic && c.imperative)) return { reject: true, reason: 'sarcasm', certainty: 0.85 };
        if (clauses.some(c => c.reported && c.imperative)) return { reject: true, reason: 'reported_speech', certainty: 0.9 };
        return { reject: false };
    }

    // ── Layer 2: Contextual / Rule-Based + Semantic Matching ──
    async contextualMatch(text) {
        const lower = text.toLowerCase().trim();
        const signals = [];

        // Direct prefix match: ".song"
        const prefixMatch = lower.match(/^[.!+?¿](\w+)(?:\s|$)/);
        if (prefixMatch && TAXONOMY.some(t => t.cmd === prefixMatch[1])) {
            const cmd = prefixMatch[1];
            const argsText = text.slice(prefixMatch[0].length).trim();
            return { cmd, args: argsText ? [argsText] : [], confidence: 'certain', source: 'prefix' };
        }

        // Explicit command mention
        const explicitMatch = lower.match(/(?:run|do|execute|use|call|trigger)\s+(?:\.|!|\?)?(\w+)/);
        if (explicitMatch && TAXONOMY.some(t => t.cmd === explicitMatch[1])) {
            return { cmd: explicitMatch[1], args: [], confidence: 'high', source: 'explicit' };
        }

        // Semantic embedding matching
        const semanticMatches = await this.semanticMatcher.match(text, 3);
        for (const match of semanticMatches) {
            if (match.score > 0.6) {
                signals.push({ source: 'semantic', intent: match.intent.cmd, confidence: match.score, weight: 1.5 });
            }
        }

        // Trigger matching from taxonomy
        for (const intent of TAXONOMY) {
            for (const trigger of [...intent.verbs, ...intent.nouns, intent.cmd]) {
                const regex = new RegExp(`(?:^|\s)${trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\s|$|[.!?])`, 'i');
                if (regex.test(lower)) {
                    const triggerIndex = lower.indexOf(trigger.toLowerCase());
                    let argsText = '';
                    if (triggerIndex !== -1) {
                        argsText = text.slice(triggerIndex + trigger.length).trim();
                        argsText = argsText.replace(/^(\s*[:,-]\s*|\s+)/, '');
                    }
                    signals.push({ source: 'trigger', intent: intent.cmd, confidence: 0.85, weight: 1.2 });
                    if (signals.length >= 5) break;
                }
            }
        }

        // Fuzzy command word match
        const words = lower.split(/\s+/);
        for (const intent of TAXONOMY) {
            if (words.includes(intent.cmd)) {
                const idx = words.indexOf(intent.cmd);
                const args = words.slice(idx + 1);
                signals.push({ source: 'fuzzy', intent: intent.cmd, confidence: 0.7, weight: 1.0 });
            }
        }

        // Reminder detection
        if (/remind me (to|at|in|about|on)/i.test(lower) || /set a reminder/i.test(lower)) {
            let reminderText = text.replace(/^(remind me|set a reminder)( to| at| in| about| on)?/i, '').trim();
            signals.push({ source: 'pattern', intent: 'remind', confidence: 0.95, weight: 2.0 });
            return { cmd: 'remind', args: [reminderText], confidence: 'high', source: 'reminder_pattern' };
        }

        // Temporal intent detection
        const temporal = this.temporalParser.parse(text);
        if (temporal.hasTemporal && signals.length > 0) {
            // Boost confidence for temporal commands
            for (const sig of signals) sig.confidence = Math.min(1.0, sig.confidence + 0.1);
        }

        // Fuse signals
        if (signals.length > 0) {
            const fused = this.fusionEngine.fuse(signals);
            const top = fused[0];
            if (top.confidence > 0.85) {
                return { cmd: top.intent, args: [], confidence: 'certain', source: `fused:${top.sources.join('+')}` };
            } else if (top.confidence > 0.6) {
                return { cmd: top.intent, args: [], confidence: 'high', source: `fused:${top.sources.join('+')}` };
            } else if (top.confidence > 0.4) {
                return { cmd: top.intent, args: [], confidence: 'medium', source: `fused:${top.sources.join('+')}` };
            }
        }

        return null;
    }

    // ── Layer 3: LLM-Based Disambiguation with State Awareness ──
    async llmDisambiguation(text, clauses) {
        const clauseStr = clauses.map((c, i) => 
            `Clause ${i+1}: "${c.text}" | Mood: ${c.imperative?'imperative':c.question?'interrogative':c.descriptive?'descriptive':'neutral'} | Neg: ${c.negated} | Desc: ${c.descriptive} | Sarc: ${c.sarcastic} | Spam: ${c.spam} | Temporal: ${c.temporal}`
        ).join('\n');

        const recent = this.context.slice(-3).map((t, i) => `${i+1}. ${t.role}: "${t.content?.substring?.(0, 80) || ''}"`).join('\n');
        const stateCtx = this.stateMachine.getStateContext(this.userId);

        const prompt = `You are Maureonix's Oracle Intent Parser. Analyze with extreme precision.

USER: "${text}"

CLAUSES:
${clauseStr}

CONTEXT:
${recent || 'None'}

CONVERSATION STATE: ${stateCtx.current} (duration: ${Math.round(stateCtx.duration / 1000)}s)
ACTIVE MODES: ${this.activeModes.join(', ') || 'None'}

TOP COMMANDS:
${TAXONOMY.slice(0, 40).map(t => `- ${t.cmd}: ${t.desc}`).join('\n')}

PROTOCOL:
1. If the user wants to execute a bot function → type "function"
2. If the user is just chatting → type "text" with a brief natural reply
3. MOOD: imperative=command, interrogative=question, descriptive=statement
4. NEGATION: if negated → NO command
5. DESCRIPTION vs REQUEST: "I'm playing" = description (NO). "Play music" = request (YES).
6. REPORTED SPEECH: "He said 'ban me'" = NO command
7. GAME CONTEXT: truth/dare during truth-or-dare = game content, NOT command.
8. SARCASM: exaggerated praise + command = NO command.
9. TEMPORAL: "remind me in 5 min" = function with temporal data.
10. CONFIDENCE: CERTAIN only if unambiguous imperative with clear target.

OUTPUT JSON ONLY:
{
  "reasoning": {"mood":"...","negation":false,"temporal":{},"confidence":"certain|likely|uncertain|conversation"},
  "intent": {"type":"function|text|game","function":"cmd or null","args":["..."],"temporal":{"hasTemporal":false,"delay":null}},
  "response": {"text":"reply if conversation or clarification"}
}`;

        try {
            const apiKey = (global.apiKeyManager || (require('./ai').keyManager)).getNext();
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.05,
                    max_tokens: 600,
                }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const raw = data.choices?.[0]?.message?.content || '';
            const match = raw.match(/\{[\s\S]*?\}/);
            if (!match) return { type: 'text', text: null, confidence: 'uncertain', source: 'parse_fail' };
            const parsed = JSON.parse(match[0]);

            const conf = parsed.reasoning?.confidence || 'uncertain';
            const intentType = parsed.intent?.type;
            const temporal = parsed.intent?.temporal || { hasTemporal: false };

            // Update state machine based on intent
            if (intentType === 'function' && conf === 'certain' && parsed.intent.function) {
                this.stateMachine.transition(this.userId, 'executing', { command: parsed.intent.function });
                return {
                    type: 'function',
                    function: parsed.intent.function,
                    args: Array.isArray(parsed.intent.args) ? parsed.intent.args : [],
                    confidence: 'certain',
                    source: 'llm_certain',
                    reasoning: parsed.reasoning,
                    temporal,
                };
            }

            if ((conf === 'likely' || conf === 'uncertain') && intentType === 'function') {
                this.stateMachine.transition(this.userId, 'awaiting_clarification', { suggested: parsed.intent.function });
                return {
                    type: 'text',
                    text: parsed.response?.text || `Did you mean ".${parsed.intent.function}"?`,
                    confidence: conf,
                    source: 'llm_conservative',
                    suggestedCommand: parsed.intent.function,
                    temporal,
                };
            }

            if (intentType === 'game') {
                return {
                    type: 'game',
                    game: parsed.intent.function,
                    confidence: conf,
                    source: 'llm_game',
                };
            }

            this.stateMachine.transition(this.userId, 'conversing');
            return {
                type: 'text',
                text: parsed.response?.text || null,
                confidence: conf,
                source: 'llm_conversation',
            };
        } catch (e) {
            console.error('[IntentEngine LLM error]', e.message);
            return { type: 'text', text: null, confidence: 'error', source: 'llm_error' };
        }
    }

    // ── Multi-lingual pre-processing ──
    async preprocess(text) {
        const lower = text.trim();
        const langPatterns = {
            sw: /\b(naomba|nisaidie|tafadhali|asante|vipi|mambo|sema)\b/i,
            es: /\b(hola|gracias|por favor|ayuda|qué|quién|cómo)\b/i,
            fr: /\b(bonjour|merci|s'il vous plaît|aide|quoi|qui|comment)\b/i,
            de: /\b(hallo|danke|bitte|hilfe|was|wer|wie)\b/i,
            ar: /[\u0600-\u06FF]/,
            zh: /[\u4e00-\u9fff]/,
            ja: /[\u3040-\u309F\u30A0-\u30FF]/,
            ko: /[\uAC00-\uD7AF]/,
        };
        let detectedLang = 'en';
        for (const [lang, pattern] of Object.entries(langPatterns)) {
            if (pattern.test(lower)) {
                detectedLang = lang;
                break;
            }
        }

        if (detectedLang !== 'en') {
            const { text: translated } = await googleTranslate(text, 'en', detectedLang);
            return { original: text, translated, detectedLang };
        }
        return { original: text, translated: text, detectedLang: 'en' };
    }

    // ── Master Parse Method ──
    async parse(text) {
        const { original, translated, detectedLang } = await this.preprocess(text);
        const normalized = this.normalize(translated);

        // 1. Game context check
        const gameCtx = checkGameContext(normalized, this.activeModes);
        if (gameCtx.isGame) {
            this.stateMachine.transition(this.userId, 'gaming', { game: gameCtx.game });
            return { type: 'game', game: gameCtx.game, gameType: gameCtx.type, confidence: 'certain', source: 'game_context', detectedLang };
        }

        // 2. Game topic detection
        const gameTopic = detectGameTopic(normalized);
        const clauses = this.syntacticAnalysis(normalized);
        if (gameTopic && clauses.every(c => c.descriptive || !c.imperative)) {
            return { type: 'game_topic', game: gameTopic, confidence: 'high', source: 'topic_detection', detectedLang };
        }

        // 3. Fast rejection
        const rejection = this.fastReject(clauses);
        if (rejection.reject) {
            return { type: 'text', text: null, confidence: rejection.certainty, source: rejection.reason, detectedLang };
        }

        // 4. Contextual / rule-based + semantic match
        const contextual = await this.contextualMatch(normalized);
        if (contextual && contextual.confidence === 'certain') {
            this.stateMachine.transition(this.userId, 'executing', { command: contextual.cmd });
            return {
                type: 'function',
                function: contextual.cmd,
                args: contextual.args,
                confidence: 'certain',
                source: contextual.source,
                detectedLang,
            };
        }
        if (contextual && contextual.confidence === 'high') {
            return {
                type: 'function',
                function: contextual.cmd,
                args: contextual.args,
                confidence: 'high',
                source: contextual.source,
                detectedLang,
            };
        }

        // 5. LLM disambiguation for medium/uncertain
        const llmResult = await this.llmDisambiguation(normalized, clauses);
        if (llmResult.type === 'function') {
            return { ...llmResult, detectedLang };
        }
        return { ...llmResult, detectedLang };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   EXPORTS
// ═══════════════════════════════════════════════════════════════════════════
module.exports = { IntentEngine, googleTranslate, TAXONOMY, globalStateMachine };