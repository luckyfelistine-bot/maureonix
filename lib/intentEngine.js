// ═══════════════════════════════════════════════════════════════════════════
//   🦊 MAUREONIX COGNITIVE INTENT PARSER v3.0
//   Multi‑layer, context‑aware, multi‑lingual, game‑aware
//   Works with the AI Engine for complete understanding
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
//   COMPLETE COMMAND TAXONOMY — semantic descriptions for disambiguation
//   This covers every command the bot can execute.
// ═══════════════════════════════════════════════════════════════════════════
const TAXONOMY = [
    // ── Bot Info ──
    { cmd: 'ping', domains: ['bot'], verbs: ['ping','check','test'], nouns: ['speed','latency','response','connection'], desc: 'Check bot response time' },
    { cmd: 'alive', domains: ['bot'], verbs: ['check','are'], nouns: ['alive','online','status','up'], desc: 'Check if bot is online' },
    { cmd: 'menu', domains: ['bot'], verbs: ['show','list','give','get'], nouns: ['menu','help','commands','options','what can you do'], desc: 'Show the main menu' },
    { cmd: 'owner', domains: ['bot'], verbs: ['contact','call','find','who'], nouns: ['owner','creator','human','maker','infinite','vybeflix'], desc: 'Contact the owner' },
    { cmd: 'profile', domains: ['bot','user'], verbs: ['check','show','my'], nouns: ['profile','stats','info','account','limit','balance'], desc: 'Show user profile' },
    { cmd: 'leaderboard', domains: ['bot'], verbs: ['show','get','see'], nouns: ['leaderboard','top','ranking','richest','highest'], desc: 'Show leaderboard' },
    { cmd: 'docs', domains: ['bot','info'], verbs: ['read','show','get','open'], nouns: ['docs','documentation','guide','manual','help'], desc: 'Read documentation' },
    { cmd: 'ask', domains: ['bot','info'], verbs: ['ask','question','how'], nouns: [], desc: 'Ask about documentation' },

    // ── Download ──
    { cmd: 'song', domains: ['music','audio','download'], verbs: ['download','get','play','find','search'], nouns: ['song','music','track','audio','mp3','tune'], desc: 'Download audio from YouTube/Spotify' },
    { cmd: 'video', domains: ['video','download'], verbs: ['download','get','find'], nouns: ['video','clip','movie','mp4','footage'], desc: 'Download video from YouTube etc.' },
    { cmd: 'play', domains: ['music','audio'], verbs: ['play','listen','hear','put on'], nouns: ['song','music','track','playlist'], desc: 'Play audio (alias for song)' },
    { cmd: 'tiktok', domains: ['social','download'], verbs: ['download','get','save'], nouns: ['tiktok','tt','tik'], desc: 'Download TikTok videos' },
    { cmd: 'instagram', domains: ['social','download'], verbs: ['download','get','save'], nouns: ['instagram','ig','insta','reel','post'], desc: 'Download Instagram media' },
    { cmd: 'spotify', domains: ['music','download'], verbs: ['download','get'], nouns: ['spotify','sp','spot'], desc: 'Download from Spotify' },
    { cmd: 'apk', domains: ['apps','download'], verbs: ['download','get','install'], nouns: ['apk','app','android','application'], desc: 'Download Android APK' },
    { cmd: 'dl', domains: ['download'], verbs: ['download','get','fetch','grab'], nouns: ['file','url','link'], desc: 'Universal downloader' },

    // ── AI ──
    { cmd: 'gpt', domains: ['ai','chat'], verbs: ['ask','tell','explain','help'], nouns: ['gpt','chatgpt','openai','question'], desc: 'Chat with GPT' },
    { cmd: 'gemini', domains: ['ai','chat'], verbs: ['ask','tell'], nouns: ['gemini','google','bard'], desc: 'Chat with Gemini' },
    { cmd: 'deepseek', domains: ['ai','chat'], verbs: ['ask','tell'], nouns: ['deepseek','deep','seek'], desc: 'Chat with DeepSeek' },
    { cmd: 'ai', domains: ['ai','chat'], verbs: ['ask','tell','help','explain','what','who','how','why','can you'], nouns: [], desc: 'General AI conversation' },
    { cmd: 'imagine', domains: ['ai','image'], verbs: ['draw','create','generate','make','design','paint'], nouns: ['image','picture','art','photo','illustration'], desc: 'Generate AI image' },
    { cmd: 'translate', domains: ['ai','text'], verbs: ['translate','convert','change'], nouns: ['language','text','word'], desc: 'Translate text' },
    { cmd: 'tts', domains: ['ai','audio'], verbs: ['speak','say','read','pronounce'], nouns: ['text','voice','speech'], desc: 'Text to speech' },
    { cmd: 'summarize', domains: ['ai','text'], verbs: ['summarize','summarise','shorten','tl;dr'], nouns: ['summary','text','article'], desc: 'Summarise text' },
    { cmd: 'code', domains: ['ai','dev'], verbs: ['write','create','generate','make','build'], nouns: ['code','script','program','function','algorithm'], desc: 'Generate code' },
    { cmd: 'brainrot', domains: ['ai','fun'], verbs: ['generate','make'], nouns: ['brainrot','gen z','slang','skibidi','rizz'], desc: 'Generate brainrot text' },

    // ── Search ──
    { cmd: 'google', domains: ['search'], verbs: ['search','find','look','google','query'], nouns: ['web','internet','information'], desc: 'Google search' },
    { cmd: 'wiki', domains: ['search'], verbs: ['search','find','look'], nouns: ['wiki','wikipedia','encyclopedia'], desc: 'Wikipedia search' },
    { cmd: 'weather', domains: ['search','info'], verbs: ['check','get','show'], nouns: ['weather','forecast','temperature','rain','hot','cold'], desc: 'Weather forecast' },
    { cmd: 'news', domains: ['search','info'], verbs: ['get','show','tell','what is'], nouns: ['news','headlines','current events','happening'], desc: 'Latest news' },
    { cmd: 'crypto', domains: ['search','finance'], verbs: ['check','get','show'], nouns: ['crypto','bitcoin','eth','price','coin'], desc: 'Crypto price' },
    { cmd: 'urban', domains: ['search','fun'], verbs: ['define','explain','what is'], nouns: ['urban','slang','meaning','dictionary'], desc: 'Urban Dictionary lookup' },
    { cmd: 'anime', domains: ['search','entertainment'], verbs: ['search','find','look'], nouns: ['anime','show'], desc: 'Search anime' },
    { cmd: 'manga', domains: ['search','entertainment'], verbs: ['search','find','look'], nouns: ['manga','comic'], desc: 'Search manga' },
    { cmd: 'github', domains: ['search','dev'], verbs: ['search','find','look'], nouns: ['github','repo','repository','code'], desc: 'GitHub search' },
    { cmd: 'npm', domains: ['search','dev'], verbs: ['search','find','look'], nouns: ['npm','package','module'], desc: 'NPM search' },

    // ── Fun ──
    { cmd: 'joke', domains: ['fun'], verbs: ['tell','give','say','make'], nouns: ['joke','funny','laugh','humour'], desc: 'Tell a joke' },
    { cmd: 'meme', domains: ['fun'], verbs: ['send','give','show'], nouns: ['meme','funny picture'], desc: 'Send a meme' },
    { cmd: '8ball', domains: ['fun'], verbs: ['ask','predict','will','should','do you think'], nouns: ['8ball','magic','ball','fortune'], desc: 'Magic 8‑ball' },
    { cmd: 'truth', domains: ['fun','game'], verbs: ['give','ask','tell'], nouns: ['truth','truth or dare'], desc: 'Truth question' },
    { cmd: 'dare', domains: ['fun','game'], verbs: ['give','ask','tell'], nouns: ['dare','challenge'], desc: 'Dare challenge' },
    { cmd: 'roast', domains: ['fun'], verbs: ['roast','burn','insult','diss'], nouns: [], desc: 'Roast someone' },
    { cmd: 'compliment', domains: ['fun'], verbs: ['compliment','praise','say something nice'], nouns: [], desc: 'Compliment someone' },
    { cmd: 'ship', domains: ['fun'], verbs: ['ship','match','calculate'], nouns: ['love','compatibility','couple'], desc: 'Ship two people' },
    { cmd: 'sticker', domains: ['media','sticker'], verbs: ['make','create','convert'], nouns: ['sticker','stiker'], desc: 'Create sticker' },
    { cmd: 'brat', domains: ['media','sticker'], verbs: ['make','create'], nouns: ['brat','brat sticker'], desc: 'Create brat sticker' },
    { cmd: 'qc', domains: ['media','image'], verbs: ['make','create'], nouns: ['quote','qc','quotely'], desc: 'Create quote image' },

    // ── Games ──
    { cmd: 'slot', domains: ['game','casino'], verbs: ['spin','play'], nouns: ['slot','slots','machine'], desc: 'Slot machine' },
    { cmd: 'rpg', domains: ['game','adventure'], verbs: ['fight','play','attack','heal'], nouns: ['rpg','adventure','quest'], desc: 'RPG game' },
    { cmd: 'blackjack', domains: ['game','casino'], verbs: ['play','hit','stand'], nouns: ['blackjack','bj','21'], desc: 'Blackjack game' },
    { cmd: 'connect4', domains: ['game','multiplayer'], verbs: ['play','start'], nouns: ['connect4','connect four','c4'], desc: 'Connect 4 game' },
    { cmd: 'trivia', domains: ['game','quiz'], verbs: ['play','ask','give'], nouns: ['trivia','quiz','question'], desc: 'Trivia quiz' },
    { cmd: 'pokemon', domains: ['game'], verbs: ['guess','who is'], nouns: ['pokemon','who\'s that pokemon'], desc: 'Guess Pokémon' },
    { cmd: 'roulette', domains: ['game','casino'], verbs: ['bet','spin'], nouns: ['roulette','wheel'], desc: 'Roulette' },
    { cmd: 'crash', domains: ['game','casino'], verbs: ['bet','cash'], nouns: ['crash','multiplier'], desc: 'Crash game' },
    { cmd: 'coinflip', domains: ['game','casino'], verbs: ['flip','bet'], nouns: ['coin','coinflip','heads','tails'], desc: 'Coin flip' },
    { cmd: 'rps', domains: ['game'], verbs: ['play','throw'], nouns: ['rps','rock','paper','scissors'], desc: 'Rock Paper Scissors' },

    // ── Economy ──
    { cmd: 'daily', domains: ['economy'], verbs: ['claim','get','collect'], nouns: ['daily','reward','bonus','free'], desc: 'Claim daily reward' },
    { cmd: 'work', domains: ['economy'], verbs: ['work','earn','make'], nouns: ['job','money','coins'], desc: 'Work for money' },
    { cmd: 'rob', domains: ['economy'], verbs: ['rob','steal','mug'], nouns: ['money','coins','wallet'], desc: 'Rob someone' },
    { cmd: 'balance', domains: ['economy'], verbs: ['check','get','show','how much'], nouns: ['balance','money','wallet','coins','bank','rich','poor'], desc: 'Check balance' },
    { cmd: 'deposit', domains: ['economy'], verbs: ['deposit','save','put','store'], nouns: ['money','coins','bank'], desc: 'Deposit money' },
    { cmd: 'withdraw', domains: ['economy'], verbs: ['withdraw','take','pull','get'], nouns: ['money','coins','bank'], desc: 'Withdraw money' },
    { cmd: 'transfer', domains: ['economy'], verbs: ['transfer','send','give','pay'], nouns: ['money','coins'], desc: 'Transfer money' },
    { cmd: 'buy', domains: ['economy'], verbs: ['buy','purchase','get','shop'], nouns: ['item','phone','car','house'], desc: 'Buy item' },
    { cmd: 'inventory', domains: ['economy'], verbs: ['check','show','list'], nouns: ['inventory','inv','items','backpack','stuff'], desc: 'Check inventory' },

    // ── Group ──
    { cmd: 'add', domains: ['group','admin'], verbs: ['add','invite','bring'], nouns: ['member','user','person'], desc: 'Add member' },
    { cmd: 'kick', domains: ['group','admin'], verbs: ['kick','remove','ban','get out','throw'], nouns: ['member','user','person'], desc: 'Kick member' },
    { cmd: 'promote', domains: ['group','admin'], verbs: ['promote','make','give'], nouns: ['admin','power'], desc: 'Promote to admin' },
    { cmd: 'demote', domains: ['group','admin'], verbs: ['demote','remove','take'], nouns: ['admin','power'], desc: 'Demote from admin' },
    { cmd: 'tagall', domains: ['group','admin'], verbs: ['tag','mention','call','notify'], nouns: ['everyone','all','members','people'], desc: 'Tag all members' },
    { cmd: 'hidetag', domains: ['group','admin'], verbs: ['tag','mention','ghost'], nouns: ['everyone','all'], desc: 'Hidden tag' },
    { cmd: 'linkgroup', domains: ['group'], verbs: ['get','give','send','share'], nouns: ['link','invite','group link','url'], desc: 'Get group link' },
    { cmd: 'revoke', domains: ['group','admin'], verbs: ['reset','change','revoke','new'], nouns: ['link','invite'], desc: 'Reset group link' },
    { cmd: 'setname', domains: ['group','admin'], verbs: ['change','set','rename','update'], nouns: ['name','title','group name'], desc: 'Set group name' },
    { cmd: 'setdesc', domains: ['group','admin'], verbs: ['change','set','update'], nouns: ['description','desc','about'], desc: 'Set group description' },
    { cmd: 'delete', domains: ['group'], verbs: ['delete','remove','clear'], nouns: ['message','msg'], desc: 'Delete message' },

    // ── Owner ──
    { cmd: 'block', domains: ['owner'], verbs: ['block','ban'], nouns: ['user','number','person'], desc: 'Block user' },
    { cmd: 'unblock', domains: ['owner'], verbs: ['unblock','unban'], nouns: ['user','number'], desc: 'Unblock user' },
    { cmd: 'join', domains: ['owner'], verbs: ['join','enter'], nouns: ['group','link'], desc: 'Join group' },
    { cmd: 'leave', domains: ['owner'], verbs: ['leave','exit','get out'], nouns: ['group'], desc: 'Leave group' },
    { cmd: 'backup', domains: ['owner'], verbs: ['backup','save','export'], nouns: ['database','db','data'], desc: 'Backup database' },
    { cmd: 'public', domains: ['owner'], verbs: ['make','set'], nouns: ['public','mode','open'], desc: 'Set public mode' },
    { cmd: 'private', domains: ['owner'], verbs: ['make','set'], nouns: ['private','mode','closed','lock'], desc: 'Set private mode' },

    // ── Health/Finance ──
    { cmd: 'bmi', domains: ['health'], verbs: ['calculate','check','get'], nouns: ['bmi','body mass','weight','height'], desc: 'Calculate BMI' },
    { cmd: 'bmr', domains: ['health'], verbs: ['calculate','check','get'], nouns: ['bmr','calories','metabolism'], desc: 'Calculate BMR' },
    { cmd: 'sleep', domains: ['health'], verbs: ['calculate','check','when'], nouns: ['sleep','wake','bedtime','cycle'], desc: 'Sleep cycles' },
    { cmd: 'workout', domains: ['health'], verbs: ['give','generate','create'], nouns: ['workout','exercise','gym','fitness','plan'], desc: 'Workout plan' },
    { cmd: 'recipe', domains: ['food'], verbs: ['give','find','get','show'], nouns: ['recipe','food','dish','cook','meal'], desc: 'Find recipe' },
    { cmd: 'stock', domains: ['finance'], verbs: ['check','get','show'], nouns: ['stock','share','price','market'], desc: 'Stock price' },
    { cmd: 'loan', domains: ['finance'], verbs: ['calculate','compute'], nouns: ['loan','emi','mortgage'], desc: 'Calculate EMI' },
    { cmd: 'tip', domains: ['finance'], verbs: ['calculate','compute'], nouns: ['tip','gratuity','split'], desc: 'Tip calculator' },

    // ── Reminders/Notes ──
    { cmd: 'remindme', domains: ['productivity'], verbs: ['remind','set','create'], nouns: ['reminder','alarm','notification'], desc: 'Set reminder' },
    { cmd: 'remind', domains: ['productivity'], verbs: ['remind','schedule','set'], nouns: ['reminder','meeting','call','appointment'], desc: 'Natural language reminder' },
    { cmd: 'reminders', domains: ['productivity'], verbs: ['list','show','get','check'], nouns: ['reminders','active','pending'], desc: 'List reminders' },
    { cmd: 'note', domains: ['productivity'], verbs: ['save','write','add','create'], nouns: ['note','memo','record'], desc: 'Save a note' },
    { cmd: 'todo', domains: ['productivity'], verbs: ['add','create','make'], nouns: ['todo','task','list'], desc: 'Add to‑do' },

    // ── Movies/Sports ──
    { cmd: 'movie', domains: ['entertainment'], verbs: ['find','search','get','show'], nouns: ['movie','film','cinema','show'], desc: 'Search movie' },
    { cmd: 'series', domains: ['entertainment'], verbs: ['find','search','get'], nouns: ['series','tv','show','drama'], desc: 'Search TV series' },
    { cmd: 'leagues', domains: ['sports'], verbs: ['show','list','get'], nouns: ['leagues','football','soccer','competition'], desc: 'List football leagues' },
    { cmd: 'live', domains: ['sports'], verbs: ['show','get','check'], nouns: ['live','score','match','game'], desc: 'Live scores' },
    { cmd: 'standings', domains: ['sports'], verbs: ['show','get','check'], nouns: ['standings','table','ranking','position'], desc: 'League table' },

    // ── System (owner only) ──
    { cmd: 'sysinfo', domains: ['system','owner'], verbs: ['show','get','check'], nouns: ['system','info','stats','status','cpu','memory'], desc: 'System information' },
    { cmd: 'restart', domains: ['system','owner'], verbs: ['restart','reboot','reload'], nouns: ['bot','system'], desc: 'Restart bot' },
    { cmd: 'knowledge', domains: ['system','owner'], verbs: ['learn','remember','store','add'], nouns: ['fact','knowledge','memory'], desc: 'Add knowledge' },
    { cmd: 'reflect', domains: ['system','owner'], verbs: ['reflect','report'], nouns: ['self','diagnostics','report'], desc: 'Self‑reflection report' },
    { cmd: 'autoai', domains: ['system','owner'], verbs: ['enable','disable','toggle'], nouns: ['auto','ai','autoai','mode'], desc: 'Toggle auto‑AI' },
    { cmd: 'privatemode', domains: ['system','owner'], verbs: ['set','change'], nouns: ['private','mode','away'], desc: 'Set private mode' },
    { cmd: 'pending', domains: ['system','owner'], verbs: ['check','show','get'], nouns: ['pending','inbox','messages','waiting'], desc: 'Pending messages' },
];

// ═══════════════════════════════════════════════════════════════════════════
//   PATTERN LIBRARIES — for fast rejection without API call
// ═══════════════════════════════════════════════════════════════════════════
const NEGATION = /\b(don't|do not|never|no|not|stop|quit|cease|avoid|refrain from|didn't|won't|wouldn't|shouldn't|can't|cannot|couldn't)\b/i;
const DESCRIPTIVE = /^(i'm|i am|we are|they are|she is|he is|my name is|this is|that is|it is)\s+\w+ing\b|^(i was|we were)\s+\w+ing\b|^(i have|we have)\s+\w+(ed|en)\b|^(yesterday|today|tomorrow|last week)\s|\b(said|told|mentioned|claimed|thought|felt|heard|saw)\b|\b(playing|watching|listening|having|eating|going|doing)\s+(?:a|an|the|some|my|his|her|their)\b/i;
const SARCASM = /(?:^|\s)(yeah right|sure|okay|ok|great|wonderful|perfect|lovely|fantastic)[,.!]*\s*(?:sure|right|okay|ok)|!{2,}\s*(?:sure|right|okay)|\b(obviously|clearly|definitely)\b.*\?|(?:^|\s)(oh|ah|wow)\s+(?:great|perfect|wonderful|lovely)\b/i;
const HYPOTHETICAL = /\b(if|suppose|assuming|imagine|what if|let's say|in theory|hypothetically)\b|\b(if i were|if you were)\b/i;
const INJECTION = /ignore (?:all |your |the )?(?:previous |prior )?(?:instructions|prompts|rules)|(?:new|different) (?:instructions|prompt|role|persona)|DAN mode|jailbreak|developer mode|(?:system|admin|root) (?:override|access)|eval\s*\(|process\.exit|require\s*\(|child_process/i;
const REPORTED_SPEECH = /\b(said|told|mentioned|claimed|asked|requested|demanded|yelled|screamed|whispered)\s+["'][^"']+["']/i;
const PROMOTIONAL = /\b(buy now|limited offer|discount|free trial|click here|subscribe|join now|win a|act now|congratulations.*won|earn money fast|work from home)\b/i;
const SPAM = /\bhttps?:\/\/\S+\s+https?:\/\/\S+\s+https?:\/\/\S+|\b(?!.*\.(com|org|net|io|gov|edu|mil))\b.*\b(follow me|dm me|subscribe)\b/i;

// ═══════════════════════════════════════════════════════════════════════════
//   GAME STATE AWARENESS
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
        if (mode === 'akinator' && /^(yes|no|don't know|probably|probably not|back|end)$/i.test(lower)) return { isGame: true, game: 'akinator' };
    }
    return { isGame: false };
}

// ═══════════════════════════════════════════════════════════════════════════
//   UNICODE NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════════
const HOMOGLYPHS = { 'а':'a','е':'e','о':'o','р':'p','с':'c','х':'x','і':'i','ј':'j','ԛ':'q','ѕ':'s','ԝ':'w','Ƅ':'b','ԁ':'d','һ':'h','ո':'n','ʀ':'r','ս':'u','ν':'v','у':'y' };

// ═══════════════════════════════════════════════════════════════════════════
//   INTENT ENGINE CLASS — multi‑layer analysis
// ═══════════════════════════════════════════════════════════════════════════
class IntentEngine {
    constructor(opts = {}) {
        this.context = opts.context || [];
        this.activeModes = opts.activeModes || [];
        this.userId = opts.userId || 'global';
        this.model = opts.model || 'llama-3.1-8b-instant'; // fast model for intent
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
                    imperative: /^(do|run|execute|use|call|trigger|send|give|show|get|find|search|download|play|tell|make|create|convert|ban|kick|add|remove|delete|set|change|update|start|stop|turn on|turn off|enable|disable|toggle|block|unblock|claim|deposit|withdraw|buy|sell|transfer|pay|check|calculate|summarise|translate|speak|say|generate|create|draw|imagine)\b/i.test(t),
                    injection: INJECTION.test(t),
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

    // ── Layer 2: Contextual / Rule‑Based ──
    contextualMatch(text) {
        const lower = text.toLowerCase().trim();

        // Direct prefix match: ".song"
        const prefixMatch = lower.match(/^[.!+?¿](\w+)(?:\s|$)/);
        if (prefixMatch && TAXONOMY.some(t => t.cmd === prefixMatch[1])) {
            const cmd = prefixMatch[1];
            const argsText = text.slice(prefixMatch[0].length).trim();
            return { cmd, args: argsText ? [argsText] : [], confidence: 'certain', source: 'prefix' };
        }

        // Explicit command mention: "run song" or "do .gpt"
        const explicitMatch = lower.match(/(?:run|do|execute|use|call|trigger)\s+(?:\.|!|\?)?(\w+)/);
        if (explicitMatch && TAXONOMY.some(t => t.cmd === explicitMatch[1])) {
            return { cmd: explicitMatch[1], args: [], confidence: 'high', source: 'explicit' };
        }

        // Trigger matching from taxonomy
        for (const intent of TAXONOMY) {
            for (const trigger of intent.triggers) {
                const regex = new RegExp(`(?:^|\\s)${trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$|[.!?])`, 'i');
                if (regex.test(lower)) {
                    const triggerIndex = lower.indexOf(trigger.toLowerCase());
                    let argsText = '';
                    if (triggerIndex !== -1) {
                        argsText = text.slice(triggerIndex + trigger.length).trim();
                        argsText = argsText.replace(/^(\s*[:,-]\s*|\s+)/, '');
                    }
                    return { cmd: intent.cmd, args: argsText ? [argsText] : [], confidence: 'high', source: 'trigger' };
                }
            }
        }

        // Fuzzy: check if any command word appears
        const words = lower.split(/\s+/);
        for (const intent of TAXONOMY) {
            if (words.includes(intent.cmd)) {
                const idx = words.indexOf(intent.cmd);
                const args = words.slice(idx + 1);
                return { cmd: intent.cmd, args: args.length ? [args.join(' ')] : [], confidence: 'medium', source: 'fuzzy' };
            }
        }

        // Reminder detection
        if (/remind me (to|at|in|about|on)/i.test(lower) || /set a reminder/i.test(lower)) {
            let reminderText = text.replace(/^(remind me|set a reminder)( to| at| in| about| on)?/i, '').trim();
            return { cmd: 'remind', args: [reminderText], confidence: 'high', source: 'reminder_pattern' };
        }

        return null;
    }

    // ── Layer 3: LLM‑Based Disambiguation (only when necessary) ──
    async llmDisambiguation(text, clauses) {
        const clauseStr = clauses.map((c, i) => 
            `Clause ${i+1}: "${c.text}" | Mood: ${c.imperative?'imperative':c.question?'interrogative':c.descriptive?'descriptive':'neutral'} | Neg: ${c.negated} | Desc: ${c.descriptive} | Sarc: ${c.sarcastic} | Spam: ${c.spam}`
        ).join('\n');

        const recent = this.context.slice(-3).map((t, i) => `${i+1}. ${t.role}: "${t.content?.substring?.(0, 80) || ''}"`).join('\n');

        const prompt = `You are Maureonix's Cognitive Intent Parser. Analyze with extreme precision.

USER: "${text}"

CLAUSES:
${clauseStr}

CONTEXT:
${recent || 'None'}

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
9. CONFIDENCE: CERTAIN only if unambiguous imperative with clear target.

OUTPUT JSON ONLY:
{
  "reasoning": {"mood":"...","negation":false,"confidence":"certain|likely|uncertain|conversation"},
  "intent": {"type":"function|text","function":"cmd or null","args":["..."]},
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
                    max_tokens: 500,
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

            if (conf === 'certain' && intentType === 'function' && parsed.intent.function) {
                return {
                    type: 'function',
                    function: parsed.intent.function,
                    args: Array.isArray(parsed.intent.args) ? parsed.intent.args : [],
                    confidence: 'certain',
                    source: 'llm_certain',
                    reasoning: parsed.reasoning,
                };
            }

            if ((conf === 'likely' || conf === 'uncertain') && intentType === 'function') {
                return {
                    type: 'text',
                    text: parsed.response?.text || `Did you mean ".${parsed.intent.function}"?`,
                    confidence: conf,
                    source: 'llm_conservative',
                    suggestedCommand: parsed.intent.function,
                };
            }

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

    // ── Multi‑lingual pre‑processing ──
    async preprocess(text) {
        // Detect if non‑English and translate for parsing
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
            return { type: 'game', game: gameCtx.game, gameType: gameCtx.type, confidence: 'certain', source: 'game_context', detectedLang };
        }

        // 2. Game topic detection (not active mode, but discussing a game)
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

        // 4. Contextual / rule‑based match
        const contextual = this.contextualMatch(normalized);
        if (contextual && contextual.confidence === 'certain') {
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

        // 5. For medium confidence or no match, fall back to LLM
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
module.exports = { IntentEngine, googleTranslate, TAXONOMY };