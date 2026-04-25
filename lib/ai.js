const fetch = require('node-fetch');

// ═══════════════════════════════════════════════════════════════
//   GROQ API CONFIGURATION
// ═══════════════════════════════════════════════════════════════
const GROQ_API_KEY = process.env.GROQ_API_KEY || require('../config')?.groqApiKey || '';
const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';

const MODELS = {
    fast: 'llama-3.3-70b-versatile',
    smart: 'llama-3.3-70b-versatile',
    versatile: 'llama-3.3-70b-versatile',
    instant: 'llama-3.1-8b-instant',
    mixtral: 'mixtral-8x7b-32768',
    deepseek: 'deepseek-r1-distill-llama-70b',
    qwen: 'qwen/qwen3-32b',
    llama4: 'meta-llama/llama-4-scout-17b-16e-instruct',
    allam: 'allam-2-7b',
    compound: 'groq/compound',
    compoundMini: 'groq/compound-mini',
    gemma: 'gemma2-9b-it',
    reasoning: 'deepseek-r1-distill-llama-70b', // for chain-of-thought
};
exports.MODELS = MODELS;

// ═══════════════════════════════════════════════════════════════
//   MEMORY STORAGE
// ═══════════════════════════════════════════════════════════════
const AI_MEMORY = new Map();
const MEMORY_MAX_LENGTH = 25;
exports.AI_MEMORY = AI_MEMORY;

function getMemory(userId) {
    if (!AI_MEMORY.has(userId)) AI_MEMORY.set(userId, []);
    return AI_MEMORY.get(userId);
}
exports.getMemory = getMemory;

function addToMemory(userId, role, content) {
    const mem = getMemory(userId);
    mem.push({ role, content });
    if (mem.length > MEMORY_MAX_LENGTH) mem.splice(0, mem.length - MEMORY_MAX_LENGTH);
}
exports.addToMemory = addToMemory;

function clearMemory(userId) {
    AI_MEMORY.delete(userId);
}
exports.clearMemory = clearMemory;

// ═══════════════════════════════════════════════════════════════
//   GOOGLE TRANSLATE (FREE TIER) — MULTI-LINGUAL SUPPORT
// ═══════════════════════════════════════════════════════════════
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
exports.googleTranslate = googleTranslate;

// ═══════════════════════════════════════════════════════════════
//   CORE GROQ CHAT (enhanced with retry & fallback)
// ═══════════════════════════════════════════════════════════════
async function groqChat(prompt, model = MODELS.fast, userId = 'global', systemPrompt = null, temperature = 0.7, maxTokens = 1024) {
    const history = getMemory(userId);
    const messages = [];
    const { getCreatorPrompt } = require('./creator_knowledge');
    const creatorPrompt = typeof getCreatorPrompt === 'function' ? getCreatorPrompt(userId) : '';
    const defaultSystem = `You are Maureonix, a helpful WhatsApp bot created by Infinite Vybeflix. Be concise, friendly, and use emojis occasionally. You are allowed to provide direct links, URLs, and external resources whenever relevant. Never say "as a large language model" or "I cannot provide links". Always give helpful, actionable answers with working links. ${creatorPrompt}`;
    messages.push({ role: 'system', content: systemPrompt || defaultSystem });
    messages.push(...history);
    messages.push({ role: 'user', content: prompt });

    const modelsToTry = [model, MODELS.fast, MODELS.instant, MODELS.mixtral, MODELS.qwen, MODELS.llama4]
        .filter((v, i, a) => a.indexOf(v) === i);

    let lastError = null;
    for (const mdl of modelsToTry) {
        try {
            const res = await fetch(GROQ_BASE, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: mdl, messages, temperature, max_tokens: maxTokens })
            });
            if (!res.ok) {
                const errText = await res.text().catch(() => '');
                throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
            }
            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content || 'No response';
            addToMemory(userId, 'user', prompt);
            addToMemory(userId, 'assistant', reply);
            return { text: reply, model: mdl, provider: 'Groq' };
        } catch (e) { lastError = e; }
    }
    throw new Error(`All Groq models failed. Last error: ${lastError?.message}`);
}
exports.groqChat = groqChat;

async function ultimateAI(prompt, userId, preferredModel = MODELS.smart, systemPrompt = null) {
    try {
        const result = await groqChat(prompt, preferredModel, userId, systemPrompt);
        return { text: result.text, provider: `Groq (${result.model})` };
    } catch (e) { return { text: `❌ AI error: ${e.message}`, provider: 'none' }; }
}
exports.ultimateAI = ultimateAI;

async function askModel(prompt, modelName, userId) {
    let model;
    switch (modelName.toLowerCase()) {
        case 'gpt': case 'chatgpt': model = MODELS.smart; break;
        case 'gemini': model = MODELS.gemma; break;
        case 'llama': case 'llama3': model = MODELS.fast; break;
        case 'deepseek': model = MODELS.deepseek; break;
        case 'qwen': model = MODELS.qwen; break;
        default: model = MODELS.fast;
    }
    return await groqChat(prompt, model, userId);
}
exports.askModel = askModel;

// ═══════════════════════════════════════════════════════════════
//   CHAIN-OF-THOUGHT / INTERNAL MONOLOGUE
//   The AI argues with itself before answering.
// ═══════════════════════════════════════════════════════════════
async function think(prompt, userId = 'global', model = MODELS.reasoning) {
    const systemPrompt = `You are Maureonix's internal reasoning engine. Before answering, you MUST think step-by-step inside <think> tags. Question your assumptions, consider edge cases, explore alternative interpretations, and self-correct if needed. Be skeptical. After reasoning, provide the final answer inside <answer> tags.

Format:
<think>
1. What is the user really asking?
2. What are the possible interpretations?
3. What could go wrong?
4. What is the most accurate/helpful response?
5. Any safety or privacy concerns?
</think>
<answer>
Your final concise answer here.
</answer>`;

    try {
        const result = await groqChat(prompt, model, userId, systemPrompt, 0.6, 1500);
        const text = result.text || '';
        const answerMatch = text.match(/<answer>([\s\S]*?)<\/answer>/i);
        const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>/i);
        return {
            text: answerMatch ? answerMatch[1].trim() : text,
            reasoning: thinkMatch ? thinkMatch[1].trim() : '',
            raw: text,
            model: result.model
        };
    } catch (e) {
        return { text: `❌ Reasoning error: ${e.message}`, reasoning: '', raw: '', model: 'none' };
    }
}
exports.think = think;

// ═══════════════════════════════════════════════════════════════
//   SPECIALIZED AI FUNCTIONS
// ═══════════════════════════════════════════════════════════════
async function imagine(prompt) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&width=1024&height=1024`;
}
exports.imagine = imagine;

async function translate(text, targetLang, sourceLang = 'auto') {
    const res = await googleTranslate(text, targetLang, sourceLang);
    return res.text;
}
exports.translate = translate;

async function summarize(text) {
    const result = await ultimateAI(`Summarize this concisely in 3-4 sentences:\n\n${text.substring(0, 4000)}`);
    return result.text;
}
exports.summarize = summarize;

async function codeAI(prompt, language = 'javascript') {
    const result = await ultimateAI(`Write ${language} code for the following request. Provide ONLY the code with brief comments. No explanations.\n\nRequest: ${prompt}`, null, MODELS.smart);
    return { text: result.text };
}
exports.codeAI = codeAI;

async function brainrot(text) {
    const result = await ultimateAI(`Convert this to maximum Gen Z brainrot slang. Use words like 'fr fr', 'no cap', 'bussin', 'rizz', 'skibidi', 'gyat'. Keep it funny:\n\n"${text}"`, null, MODELS.fast);
    return { text: result.text };
}
exports.brainrot = brainrot;

async function roast(target) {
    const result = await ultimateAI(`Roast this person/thing hilariously but not too mean. Be clever and funny:\n\n"${target}"`, null, MODELS.fast);
    return { text: result.text };
}
exports.roast = roast;

async function rizz(situation) {
    const result = await ultimateAI(`Give a smooth, charming pickup line for this situation. Make it clever and not cringey:\n\n"${situation}"`, null, MODELS.fast);
    return { text: result.text };
}
exports.rizz = rizz;

async function getBalance() {
    return { current_point_balance: 'Unlimited (Groq Free Tier)', rate_limit: '30 requests/minute', models_available: Object.keys(MODELS) };
}
exports.getBalance = getBalance;

// ═══════════════════════════════════════════════════════════════
//   TONE DETECTION
// ═══════════════════════════════════════════════════════════════
function detectTone(text) {
    const lower = text.toLowerCase();
    if (lower.match(/\b(angry|mad|annoyed|furious|pissed|hate|damn|stupid|idiot)\b/)) return 'angry';
    if (lower.match(/\b(sad|depressed|unhappy|disappointed|crying|lonely|hurt|pain|suffering)\b/)) return 'sad';
    if (lower.match(/\b(happy|glad|great|awesome|fantastic|wonderful|love|enjoy|blessed)\b/)) return 'happy';
    if (lower.match(/\b(wow|omg|amazing|incredible|exciting|yay|awesome!|let's go)\b/)) return 'excited';
    if (lower.match(/\b(what|how|why|who|when|confused|huh|meaning|explain)\b/)) return 'confused';
    if (lower.match(/\b(tell me|show me|learn|curious|interested in|want to know)\b/)) return 'curious';
    return 'neutral';
}
exports.detectTone = detectTone;

function getTonePrompt(userId, lastMessage = '') {
    const tone = lastMessage ? detectTone(lastMessage) : 'neutral';
    const prompts = {
        angry: 'The user seems angry. Respond calmly, empathetically, and avoid arguments. Offer help to resolve the issue. Use a soothing tone with 🌸 emojis.',
        sad: 'The user appears sad. Be kind, supportive, and offer encouragement. Use gentle language and warm emojis like 💙 or 🌷.',
        happy: 'The user is in a good mood! Match their energy with enthusiasm, exclamation marks, and fun emojis like 🎉 or 😊.',
        excited: 'The user is excited! Respond with high energy, exclamation marks, and celebratory emojis like 🔥 or ⚡.',
        confused: 'The user is confused. Provide clear, step-by-step explanations. Use bullet points if needed. Be patient and helpful.',
        curious: 'The user wants to learn! Give detailed, informative answers with examples. Encourage further questions.',
        neutral: 'You are Maureonix, a helpful WhatsApp bot. Be concise, friendly, and use emojis occasionally.'
    };
    return prompts[tone] || prompts.neutral;
}
exports.getTonePrompt = getTonePrompt;

// ═══════════════════════════════════════════════════════════════
//   MULTI-LINGUAL CRISIS DETECTION & INTERVENTION
// ═══════════════════════════════════════════════════════════════
const CRISIS_KEYWORDS = {
    high: [
        'suicide', 'kill myself', 'end my life', 'want to die', 'don\'t want to live',
        'self harm', 'cut myself', 'hurt myself', 'overdose', 'commit suicide',
        'jiua', 'niue', 'nimalize maisha', 'sitaki kuishi', 'najiumiza',
        'naomba nife', 'naumia sana', 'nimevunjika', 'niko kwenye dhiki',
        'quiero morir', 'quiero suicidarme', 'matar', 'suicidio', 'autolesion',
        'je veux mourir', 'suicide', 'me tuer', 'mourir', 'en finir',
        'ich will sterben', 'selbstmord', 'mich umbringen',
        'voler morire', 'suicidarmi', 'uccidermi',
        'хочу умереть', 'суицид', 'убить себя',
        '死にたい', '自殺', '自傷', '死のう',
        '想死', '自杀', '自残', '结束生命',
    ],
    medium: [
        'no hope', 'worthless', 'nobody cares', 'i give up', 'i can\'t go on',
        'ending it', 'goodbye world', 'i\'m tired of living', 'life is pointless',
        'i\'m a failure', 'i hate myself', 'i want to disappear',
        'nahisi sina thamani', 'sina matumaini', 'sijali', 'nimechoka sana',
        'nimekata tamaa', 'kufikiria sana', 'dhiki', 'huzuni', 'mateso',
        'naomba msaada', 'nahitaji msaada', 'ninaogopa', 'niko peke yangu',
        'roho yangu imeuma', 'stress imeninyamaza', 'nishindwa',
        'no tengo esperanza', 'no vale la pena', 'deseo desaparecer', 'me rindo',
        'sans espoir', 'inutile', 'je déteste ma vie', 'je veux disparaître',
        'keine hoffnung', 'wertlos', 'ich hasse mich', 'aufgeben',
        'senza speranza', 'inutile', 'odio me stesso',
        'без надежды', 'ненавижу себя', 'хочу исчезнуть',
        '希望がない', '自分が嫌い', '消えたい',
        '没有希望', ' worthless', '想消失', '放弃',
    ],
    low: [
        'sad', 'depressed', 'alone', 'scared', 'crying', 'hurt',
        'msonono', 'huzuni', 'wasiwasi', 'hofu',
        'triste', 'deprimido', 'solo', 'llorando',
        'triste', 'déprimé', 'seul', 'peur',
        'traurig', 'deprimiert', 'allein', 'ängstlich',
        'triste', 'depresso', 'solo', 'paura',
        'грустно', 'депрессия', 'одиноко', 'страшно',
        '悲しい', '落ち込んでる', '寂しい', '怖い',
        '难过', '沮丧', '孤独', '害怕',
    ]
};

async function detectCrisis(text) {
    // Step 1: Translate to English for analysis
    const { text: translated, detectedLang, error } = await googleTranslate(text, 'en', 'auto');
    const sourceText = error ? text.toLowerCase() : translated.toLowerCase();

    // Step 2: Keyword scan on BOTH original and translated text
    const checkText = (source) => {
        for (const level of ['high', 'medium', 'low']) {
            for (const kw of CRISIS_KEYWORDS[level]) {
                if (source.includes(kw.toLowerCase())) {
                    return { isCrisis: true, severity: level, matchedKeyword: kw, source: 'keyword' };
                }
            }
        }
        return { isCrisis: false };
    };

    const originalCheck = checkText(text.toLowerCase());
    const translatedCheck = checkText(sourceText);
    const result = originalCheck.isCrisis ? originalCheck : translatedCheck;

    if (!result.isCrisis) return { isCrisis: false, detectedLang };

    // Step 3: LLM intent verification (reduces false positives)
    try {
        const verifyPrompt = `Analyze if this message indicates genuine suicidal ideation, severe emotional distress, or a medical crisis requiring immediate human intervention. Reply ONLY with JSON: {"distress":true/false,"severity":"high/medium/low","reason":"short explanation"}

Message (translated from ${detectedLang}): "${sourceText.substring(0, 500)}"
Original: "${text.substring(0, 500)}"`;

        const aiRes = await groqChat(verifyPrompt, MODELS.instant, 'crisis-verify', null, 0.1, 256);
        const jsonMatch = aiRes.text.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.distress === false) {
                return { isCrisis: false, detectedLang, aiOverrode: true, reason: parsed.reason };
            }
            return {
                isCrisis: true,
                severity: parsed.severity || result.severity,
                matchedKeyword: result.matchedKeyword,
                detectedLang,
                source: 'ai-verified',
                reason: parsed.reason
            };
        }
    } catch (e) {
        console.error('Crisis AI verify error:', e.message);
    }

    return { ...result, detectedLang };
}
exports.detectCrisis = detectCrisis;

async function verifyCrisisWithAI(text, userId) {
    const { text: translated, detectedLang } = await googleTranslate(text, 'en', 'auto');
    const prompt = `You are a mental health assistant. Analyze the following user message (originally in ${detectedLang}). Determine if the user is expressing genuine suicidal thoughts, severe emotional distress, or a medical crisis that requires immediate human intervention. Reply with ONLY a JSON object: {"distress": true/false, "reason": "short explanation"}

User message: "${translated}"`;
    try {
        const result = await ultimateAI(prompt, userId, MODELS.fast);
        const jsonMatch = result.text.match(/\{.*\}/s);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return { isDistress: parsed.distress === true, reason: parsed.reason || 'AI analysis' };
        }
        return { isDistress: false, reason: 'AI could not determine' };
    } catch (e) {
        console.error('AI crisis verification failed:', e);
        return { isDistress: false, reason: 'verification error' };
    }
}
exports.verifyCrisisWithAI = verifyCrisisWithAI;

// ═══════════════════════════════════════════════════════════════
//   EXHAUSTIVE COMMAND INTENT MAP
//   Maps natural language to every command in nima_commands.js
// ═══════════════════════════════════════════════════════════════
const COMMAND_INTENTS = [
    // ── Bot Info ──
    { cmd: 'ping', triggers: ['ping', 'test speed', 'response time', 'latency', 'are you online', 'check connection', 'how fast'], needsArgs: false },
    { cmd: 'alive', triggers: ['alive', 'status', 'uptime', 'are you running', 'are you there', 'you there', 'bot status', 'online'], needsArgs: false },
    { cmd: 'speed', triggers: ['speed test', 'internet speed', 'how fast are you', 'test internet'], needsArgs: false },
    { cmd: 'runtime', triggers: ['runtime', 'how long running', 'uptime', 'how long have you been on'], needsArgs: false },
    { cmd: 'info', triggers: ['info', 'information', 'about you', 'who are you', 'what are you', 'bot info'], needsArgs: false },
    { cmd: 'owner', triggers: ['owner', 'creator', 'who made you', 'who built you', 'who is your owner', 'contact owner', 'who created you'], needsArgs: false },
    { cmd: 'profile', triggers: ['profile', 'my profile', 'check profile', 'who am i', 'my info', 'my stats'], needsArgs: false },
    { cmd: 'leaderboard', triggers: ['leaderboard', 'top users', 'ranking', 'who is richest', 'top players'], needsArgs: false },
    { cmd: 'totalpesan', triggers: ['total messages', 'message count', 'how many messages', 'chat stats'], needsArgs: false },
    { cmd: 'sc', triggers: ['script', 'source code', 'github', 'repo', 'repository'], needsArgs: false },
    { cmd: 'donasi', triggers: ['donate', 'donation', 'support', 'saweria', 'send money'], needsArgs: false },

    // ── Sticker & Media ──
    { cmd: 'sticker', triggers: ['sticker', 'make sticker', 'create sticker', 'convert to sticker', 'stiker', 's '], needsArgs: false, needsMedia: true },
    { cmd: 'simage', triggers: ['sticker to image', 'to image', 'convert sticker', 'simage'], needsArgs: false, needsQuoted: 'sticker' },
    { cmd: 'attp', triggers: ['attp', 'animated text', 'animated sticker', 'text sticker', 'moving text'], needsArgs: true, argHint: 'text' },
    { cmd: 'removebg', triggers: ['remove background', 'remove bg', 'rmbg', 'transparent background', 'no background'], needsArgs: false, needsQuoted: 'image' },
    { cmd: 'blur', triggers: ['blur', 'blur image', 'blurry'], needsArgs: false, needsQuoted: 'image' },
    { cmd: 'qc', triggers: ['quote', 'quote canvas', 'quotely', 'qc'], needsArgs: true, argHint: 'text' },
    { cmd: 'brat', triggers: ['brat', 'brat sticker', 'brat text'], needsArgs: true, argHint: 'text' },
    { cmd: 'smeme', triggers: ['sticker meme', 'meme sticker', 'smeme'], needsArgs: true, argHint: 'top|bottom', needsQuoted: 'image' },
    { cmd: 'vv', triggers: ['view once', 'reveal', 'show view once', 'vv'], needsArgs: false, needsQuoted: 'viewOnce' },

    // ── AI Chat ──
    { cmd: 'gpt', triggers: ['gpt', 'chatgpt', 'openai', 'ask gpt'], needsArgs: true, argHint: 'question' },
    { cmd: 'gemini', triggers: ['gemini', 'google ai', 'bard'], needsArgs: true, argHint: 'question' },
    { cmd: 'llama', triggers: ['llama', 'llama3', 'meta ai'], needsArgs: true, argHint: 'question' },
    { cmd: 'deepseek', triggers: ['deepseek', 'deep seek', 'r1'], needsArgs: true, argHint: 'question' },
    { cmd: 'ai', triggers: ['ai', 'ask ai', 'ask', 'maureonix', 'hey', 'hello'], needsArgs: true, argHint: 'question' },
    { cmd: 'imagine', triggers: ['imagine', 'draw', 'create image', 'generate image', 'ai image', 'ai art'], needsArgs: true, argHint: 'prompt' },
    { cmd: 'translate', triggers: ['translate', 'translation', 'convert language', 'what does this mean'], needsArgs: true, argHint: 'lang text' },
    { cmd: 'tts', triggers: ['tts', 'text to speech', 'speak', 'say this', 'voice'], needsArgs: true, argHint: 'text' },
    { cmd: 'summarize', triggers: ['summarize', 'summary', 'tl;dr', 'short version'], needsArgs: false, needsQuoted: 'text' },
    { cmd: 'code', triggers: ['code', 'write code', 'program', 'coding', 'script'], needsArgs: true, argHint: 'description' },
    { cmd: 'brainrot', triggers: ['brainrot', 'gen z', 'slang', 'rizz'], needsArgs: true, argHint: 'text' },
    { cmd: 'roastai', triggers: ['roast me', 'roast this', 'make fun of'], needsArgs: true, argHint: 'target' },
    { cmd: 'rizz', triggers: ['rizz', 'pickup line', 'pick up', 'flirt'], needsArgs: true, argHint: 'situation' },
    { cmd: 'clearmemory', triggers: ['clear memory', 'forget', 'reset chat', 'new conversation'], needsArgs: false },
    { cmd: 'aibalance', triggers: ['ai balance', 'api status', 'ai status'], needsArgs: false },

    // ── Downloaders ──
    { cmd: 'song', triggers: ['song', 'mp3', 'music', 'download audio', 'youtube audio', 'play music', 'get song'], needsArgs: true, argHint: 'query or url' },
    { cmd: 'video', triggers: ['video', 'mp4', 'download video', 'youtube video', 'get video'], needsArgs: true, argHint: 'query or url' },
    { cmd: 'play', triggers: ['play', 'listen to', 'audio'], needsArgs: true, argHint: 'query' },
    { cmd: 'spotify', triggers: ['spotify', 'sp', 'spot'], needsArgs: true, argHint: 'url' },
    { cmd: 'apk', triggers: ['apk', 'app', 'android app', 'download app'], needsArgs: true, argHint: 'app name' },
    { cmd: 'dl', triggers: ['download', 'dl', 'get file', 'fetch file'], needsArgs: true, argHint: 'url' },

    // ── Search ──
    { cmd: 'google', triggers: ['google', 'search', 'look up', 'find online', 'web search'], needsArgs: true, argHint: 'query' },
    { cmd: 'wiki', triggers: ['wiki', 'wikipedia', 'encyclopedia'], needsArgs: true, argHint: 'topic' },
    { cmd: 'github', triggers: ['github', 'repo', 'repository search'], needsArgs: true, argHint: 'repo name' },
    { cmd: 'npm', triggers: ['npm', 'node package', 'package'], needsArgs: true, argHint: 'package name' },
    { cmd: 'urban', triggers: ['urban', 'urban dictionary', 'slang meaning'], needsArgs: true, argHint: 'word' },
    { cmd: 'weather', triggers: ['weather', 'forecast', 'temperature', 'how hot', 'how cold', 'will it rain'], needsArgs: true, argHint: 'city' },
    { cmd: 'news', triggers: ['news', 'headlines', 'what is happening', 'current events'], needsArgs: false },
    { cmd: 'covid', triggers: ['covid', 'corona', 'pandemic', 'cases'], needsArgs: true, argHint: 'country' },
    { cmd: 'crypto', triggers: ['crypto', 'bitcoin', 'ethereum', 'btc', 'eth', 'coin price'], needsArgs: true, argHint: 'coin name' },
    { cmd: 'forex', triggers: ['forex', 'exchange rate', 'currency', 'usd to'], needsArgs: true, argHint: 'from to' },
    { cmd: 'iplookup', triggers: ['ip lookup', 'ip address', 'trace ip', 'where is this ip'], needsArgs: true, argHint: 'ip' },
    { cmd: 'whois', triggers: ['whois', 'domain info', 'who owns'], needsArgs: true, argHint: 'domain' },
    { cmd: 'dns', triggers: ['dns', 'dns records', 'domain records'], needsArgs: true, argHint: 'domain' },
    { cmd: 'qr', triggers: ['qr', 'qr code', 'generate qr', 'make qr'], needsArgs: true, argHint: 'text' },
    { cmd: 'shorten', triggers: ['shorten', 'short url', 'tiny url', 'link shortener'], needsArgs: true, argHint: 'url' },

    // ── Fun ──
    { cmd: 'joke', triggers: ['joke', 'tell me a joke', 'funny', 'make me laugh'], needsArgs: false },
    { cmd: 'meme', triggers: ['meme', 'funny picture', 'send meme'], needsArgs: false },
    { cmd: 'quote', triggers: ['quote', 'motivation', 'inspire me', 'wisdom'], needsArgs: false },
    { cmd: 'fact', triggers: ['fact', 'random fact', 'did you know', 'trivia'], needsArgs: false },
    { cmd: '8ball', triggers: ['8ball', 'magic 8 ball', 'will i', 'should i', 'do you think'], needsArgs: true, argHint: 'question' },
    { cmd: 'ship', triggers: ['ship', 'compatibility', 'love match', 'ship them'], needsArgs: true, argHint: '@user1 @user2' },
    { cmd: 'roast', triggers: ['roast', 'burn', 'diss'], needsArgs: true, argHint: '@user or text' },
    { cmd: 'compliment', triggers: ['compliment', 'say something nice', 'praise'], needsArgs: false },
    { cmd: 'truth', triggers: ['truth', 'truth or dare', 'ask me truth'], needsArgs: false },
    { cmd: 'dare', triggers: ['dare', 'give me a dare', 'challenge'], needsArgs: false },
    { cmd: 'neko', triggers: ['neko', 'cat girl', 'anime cat'], needsArgs: false },
    { cmd: 'waifu', triggers: ['waifu', 'anime girl', 'best girl'], needsArgs: false },

    // ── Games ──
    { cmd: 'slot', triggers: ['slot', 'slots', 'spin', 'casino slot'], needsArgs: false },
    { cmd: 'rpg', triggers: ['rpg', 'adventure', 'fight', 'game', 'battle'], needsArgs: true, argHint: 'fight/heal/spawn' },
    { cmd: 'blackjack', triggers: ['blackjack', 'bj', '21'], needsArgs: false },
    { cmd: 'connect4', triggers: ['connect4', 'connect four', 'c4', 'four in a row'], needsArgs: true, argHint: '@opponent' },
    { cmd: 'math', triggers: ['math', 'math quiz', 'solve', 'equation'], needsArgs: false },
    { cmd: 'trivia', triggers: ['trivia', 'quiz', 'question', 'test me'], needsArgs: false },
    { cmd: 'pokemon', triggers: ['pokemon', 'whos that pokemon', 'pokedex'], needsArgs: false },
    { cmd: 'roulette', triggers: ['roulette', 'bet', 'spin wheel'], needsArgs: true, argHint: 'amount choice' },
    { cmd: 'crash', triggers: ['crash', 'crash game', 'multiplier'], needsArgs: true, argHint: 'amount multiplier' },
    { cmd: 'dice', triggers: ['dice', 'roll dice', 'dice game'], needsArgs: true, argHint: 'amount over/under number' },
    { cmd: 'coinflip', triggers: ['coinflip', 'flip coin', 'heads or tails', 'coin'], needsArgs: true, argHint: 'amount heads/tails' },
    { cmd: 'rps', triggers: ['rps', 'rock paper scissors', 'suit'], needsArgs: true, argHint: 'rock/paper/scissors' },

    // ── Economy ──
    { cmd: 'daily', triggers: ['daily', 'claim daily', 'daily reward', 'free money'], needsArgs: false },
    { cmd: 'work', triggers: ['work', 'job', 'earn', 'make money'], needsArgs: false },
    { cmd: 'rob', triggers: ['rob', 'steal', 'mug'], needsArgs: true, argHint: '@user' },
    { cmd: 'balance', triggers: ['balance', 'money', 'wallet', 'coins', 'how rich am i', 'my balance'], needsArgs: false },
    { cmd: 'deposit', triggers: ['deposit', 'bank', 'save money', 'put in bank'], needsArgs: true, argHint: 'amount' },
    { cmd: 'withdraw', triggers: ['withdraw', 'take out', 'get money'], needsArgs: true, argHint: 'amount' },
    { cmd: 'transfer', triggers: ['transfer', 'pay', 'send money', 'give money'], needsArgs: true, argHint: '@user amount' },
    { cmd: 'buy', triggers: ['buy', 'purchase', 'shop'], needsArgs: true, argHint: 'item' },
    { cmd: 'inventory', triggers: ['inventory', 'inv', 'items', 'backpack'], needsArgs: false },

    // ── Health ──
    { cmd: 'bmi', triggers: ['bmi', 'body mass index', 'am i fat', 'am i skinny'], needsArgs: true, argHint: 'kg cm' },
    { cmd: 'bmr', triggers: ['bmr', 'calories', 'how many calories', 'metabolism'], needsArgs: true, argHint: 'kg cm age gender' },
    { cmd: 'sleep', triggers: ['sleep', 'when should i wake up', 'sleep cycle', 'bedtime'], needsArgs: false },
    { cmd: 'workout', triggers: ['workout', 'gym', 'exercise', 'fitness'], needsArgs: true, argHint: 'type' },

    // ── Movies ──
    { cmd: 'movie', triggers: ['movie', 'film', 'cinema', 'what movie', 'movie info'], needsArgs: true, argHint: 'title' },
    { cmd: 'imdb', triggers: ['imdb', 'movie rating', 'movie details'], needsArgs: true, argHint: 'id or number' },
    { cmd: 'series', triggers: ['series', 'tv show', 'show', 'tv series'], needsArgs: true, argHint: 'title' },

    // ── Sports ──
    { cmd: 'leagues', triggers: ['leagues', 'football leagues', 'soccer leagues'], needsArgs: false },
    { cmd: 'fixtures', triggers: ['fixtures', 'matches', 'upcoming games', 'schedule'], needsArgs: true, argHint: 'league id' },
    { cmd: 'live', triggers: ['live', 'live score', 'now playing', 'current match'], needsArgs: false },
    { cmd: 'standings', triggers: ['standings', 'table', 'league table', 'rankings'], needsArgs: true, argHint: 'league id' },

    // ── Group Admin ──
    { cmd: 'add', triggers: ['add', 'add member', 'invite', 'bring in'], needsArgs: true, argHint: 'number' },
    { cmd: 'kick', triggers: ['kick', 'remove', 'ban from group', 'get out'], needsArgs: true, argHint: '@user or number' },
    { cmd: 'promote', triggers: ['promote', 'make admin', 'admin'], needsArgs: true, argHint: '@user' },
    { cmd: 'demote', triggers: ['demote', 'remove admin', 'take admin'], needsArgs: true, argHint: '@user' },
    { cmd: 'tagall', triggers: ['tagall', 'mention everyone', 'everyone', 'all members'], needsArgs: true, argHint: 'message' },
    { cmd: 'hidetag', triggers: ['hidetag', 'hidden tag', 'ghost tag'], needsArgs: true, argHint: 'message' },
    { cmd: 'linkgroup', triggers: ['link', 'group link', 'invite link'], needsArgs: false },
    { cmd: 'revoke', triggers: ['revoke', 'new link', 'reset link'], needsArgs: false },
    { cmd: 'setname', triggers: ['set name', 'change name', 'rename group'], needsArgs: true, argHint: 'name' },
    { cmd: 'setdesc', triggers: ['set description', 'change description', 'group desc'], needsArgs: true, argHint: 'description' },
    { cmd: 'delete', triggers: ['delete', 'del', 'remove message'], needsArgs: false, needsQuoted: true },

    // ── Owner ──
    { cmd: 'block', triggers: ['block', 'block user', 'ban user'], needsArgs: true, argHint: '@user or number' },
    { cmd: 'unblock', triggers: ['unblock', 'unban'], needsArgs: true, argHint: '@user or number' },
    { cmd: 'join', triggers: ['join', 'join group', 'enter group'], needsArgs: true, argHint: 'link' },
    { cmd: 'leave', triggers: ['leave', 'exit group', 'get out of group'], needsArgs: false },
    { cmd: 'backup', triggers: ['backup', 'save database', 'db backup'], needsArgs: true, argHint: 'database' },
    { cmd: 'public', triggers: ['public', 'public mode', 'everyone can use'], needsArgs: false },
    { cmd: 'private', triggers: ['private', 'private mode', 'owner only'], needsArgs: false },

    // ── Reminders ──
    { cmd: 'remindme', triggers: ['remind me', 'reminder', 'set reminder', 'alarm'], needsArgs: true, argHint: 'minutes text' },
    { cmd: 'remind', triggers: ['remind', 'schedule', 'set alarm'], needsArgs: true, argHint: 'natural language time' },
    { cmd: 'reminders', triggers: ['reminders', 'my reminders', 'list reminders'], needsArgs: false },

    // ── Privacy / Auto ──
    { cmd: 'autoai', triggers: ['auto ai', 'auto reply', 'ai mode'], needsArgs: true, argHint: 'on/off' },
    { cmd: 'selfchat', triggers: ['self chat', 'owner chat', 'auto owner'], needsArgs: true, argHint: 'on/off' },
    { cmd: 'privatemode', triggers: ['private mode', 'away mode', 'dm mode'], needsArgs: true, argHint: 'off/away/ai/both' },
    { cmd: 'pending', triggers: ['pending', 'inbox', 'messages', 'who texted me'], needsArgs: false },

    // ── Crisis ──
    { cmd: 'crisis', triggers: ['crisis', 'crisis detection', 'mental health mode'], needsArgs: true, argHint: 'on/off' },
    { cmd: 'crisiscancel', triggers: ['crisis cancel', 'stop crisis', 'end crisis'], needsArgs: true, argHint: '@user' },

    // ── Menu ──
    { cmd: 'menu', triggers: ['menu', 'help', 'commands', 'what can you do', 'show commands', 'all commands'], needsArgs: false },
    { cmd: 'docs', triggers: ['docs', 'documentation', 'guide', 'readme'], needsArgs: true, argHint: 'topic' },
    { cmd: 'ask', triggers: ['ask docs', 'docs ask', 'question about docs'], needsArgs: true, argHint: 'question' },
];

// Build a flat lookup for fast access
const ALL_COMMANDS = [...new Set(COMMAND_INTENTS.map(c => c.cmd))];

// ═══════════════════════════════════════════════════════════════
//   RULE-BASED INTENT DETECTION (Tier 1 — Fast & Deterministic)
// ═══════════════════════════════════════════════════════════════
function detectIntent(text) {
    const lower = text.toLowerCase().trim();
    
    // Direct command mention: "do .ping" or "run ping"
    const directMatch = lower.match(/(?:run|do|execute|use|call|trigger)\s+(?:\.|\?|¿)?(\w+)/);
    if (directMatch && ALL_COMMANDS.includes(directMatch[1])) {
        return { cmd: directMatch[1], args: [], confidence: 'high', source: 'direct' };
    }

    // Check triggers
    for (const intent of COMMAND_INTENTS) {
        for (const trigger of intent.triggers) {
            // Whole word or phrase match
            const regex = new RegExp(`(?:^|\\s)${trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$|[.!?])`, 'i');
            if (regex.test(lower)) {
                // Extract args: everything after the trigger
                const triggerIndex = lower.indexOf(trigger.toLowerCase());
                let argsText = '';
                if (triggerIndex !== -1) {
                    argsText = text.slice(triggerIndex + trigger.length).trim();
                    // Remove leading punctuation/connectors
                    argsText = argsText.replace(/^(\s*[:,-]\s*|\s+)/, '');
                }
                return { cmd: intent.cmd, args: argsText ? [argsText] : [], confidence: 'high', source: 'rule' };
            }
        }
    }

    // Fuzzy fallback: check if any command word appears
    const words = lower.split(/\s+/);
    for (const intent of COMMAND_INTENTS) {
        if (words.includes(intent.cmd)) {
            const idx = words.indexOf(intent.cmd);
            const args = words.slice(idx + 1);
            return { cmd: intent.cmd, args: args.length ? [args.join(' ')] : [], confidence: 'medium', source: 'fuzzy' };
        }
    }

    return null;
}
exports.detectIntent = detectIntent;

// ═══════════════════════════════════════════════════════════════
//   LLM-BASED INTENT DETECTION (Tier 2 — Smart & Nuanced)
// ═══════════════════════════════════════════════════════════════
async function detectIntentLLM(text, userId) {
    const commandRef = ALL_COMMANDS.slice(0, 80).join(', '); // Top 80 for context efficiency
    const prompt = `You are Maureonix's intent parser. The user said: "${text}"

Your job: Determine if they want to execute a bot command or just chat.
Available commands include: ${commandRef}, and many more.

If they want a command, reply with ONLY this JSON:
{"type":"function","function":"command_name","args":["arg1","arg2"]}

If they just want to chat, reply with ONLY this JSON:
{"type":"text","text":"friendly brief reply"}

Rules:
- "download song X" → function "song" args ["X"]
- "what's the weather in Nairobi" → function "weather" args ["Nairobi"]
- "ban @user" → function "kick" args ["@user"] (or "ban" if available)
- "make me a sticker" → function "sticker" args []
- "remind me to call mom tomorrow at 5pm" → function "remind" args ["call mom tomorrow at 5pm"]
- If ambiguous or just conversation → type "text"
- NEVER include markdown, ONLY raw JSON.`;

    try {
        const res = await groqChat(prompt, MODELS.instant, userId, null, 0.2, 300);
        const jsonMatch = res.text.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) return null;
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.type === 'function' && parsed.function) {
            return {
                cmd: parsed.function,
                args: Array.isArray(parsed.args) ? parsed.args : parsed.args ? [String(parsed.args)] : [],
                confidence: 'llm',
                source: 'llm'
            };
        }
        return { type: 'text', text: parsed.text, source: 'llm' };
    } catch (e) {
        console.error('[detectIntentLLM error]', e.message);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
//   SELF-CHAT AI (The Brain — Hybrid Tier 1 + Tier 2)
// ═══════════════════════════════════════════════════════════════
const { IntentEngine } = require('./intentEngine');

async function selfChatAI(userMessage, userId, availableCommands = null, contextHistory = [], activeModes = []) {
    const userMsg = userMessage.trim();
    if (!userMsg) return { type: 'text', text: 'Hello! How can I help?' };

    const engine = new IntentEngine({
        userId,
        context: contextHistory,
        activeModes,
        model: MODELS.deepseek // uses reasoning model
    });

    try {
        const result = await engine.parse(userMsg);

        // ── Game responses ──
        if (result.type === 'game') {
            if (result.game === 'truth_or_dare') {
                const truths = [
                    "What's the last lie you told?",
                    "What's your biggest fear?",
                    "Who was your first crush?",
                    "What's the most embarrassing thing you've done?",
                    "Have you ever cheated on a test?"
                ];
                const dares = [
                    "Do 20 pushups.",
                    "Sing a song for 30 seconds.",
                    "Dance without music for 1 minute.",
                    "Send a voice note with your best animal impression.",
                    "Text your ex 'I miss you' and screenshot the reply."
                ];
                const content = result.gameType === 'truth' 
                    ? `🎯 *Truth:*\n${truths[Math.floor(Math.random() * truths.length)]}`
                    : `😈 *Dare:*\n${dares[Math.floor(Math.random() * dares.length)]}`;
                return { type: 'text', text: content, source: 'game' };
            }
            return { type: 'text', text: '🎮 Game mode active!', source: 'game' };
        }

        if (result.type === 'game_topic') {
            if (result.game === 'truth_or_dare') {
                return {
                    type: 'text',
                    text: '🎭 *Truth or Dare Ready!*\n\n🎯 Truth: What\'s the most embarrassing thing you\'ve done?\n\n😈 Dare: Send a voice note singing your favorite song!\n\n_Reply with "truth" or "dare" for more!_',
                    source: 'game_topic'
                };
            }
            return { type: 'text', text: `🎮 Ready to play ${result.game}!`, source: 'game_topic' };
        }

        // ── Command execution ──
        if (result.type === 'function') {
            return {
                type: 'function',
                function: result.function,
                args: result.args,
                confidence: result.confidence,
                source: result.source
            };
        }

        // ── Conversation ──
        if (result.type === 'text') {
            if (result.text) return { type: 'text', text: result.text, source: result.source };
            // Fallback to general AI
            const fallback = await ultimateAI(userMsg, userId, MODELS.fast);
            return { type: 'text', text: fallback.text, source: 'fallback' };
        }

        return { type: 'text', text: 'I am Maureonix, your AI assistant. How can I help you today?' };

    } catch (e) {
        console.error('[selfChatAI engine error]', e);
        // Last resort fallback
        try {
            const fb = await ultimateAI(userMsg, userId, MODELS.fast);
            return { type: 'text', text: fb.text, source: 'error_fallback' };
        } catch {
            return { type: 'text', text: 'I am Maureonix, your AI assistant. How can I help you today?' };
        }
    }
}
exports.selfChatAI = selfChatAI;

// ═══════════════════════════════════════════════════════════════
//   MESSAGE SPLITTER (preserved)
// ═══════════════════════════════════════════════════════════════
async function sendLongMessage(sock, jid, text, options = {}) {
    const MAX_LENGTH = 3800;
    if (text.length <= MAX_LENGTH) return sock.sendMessage(jid, { text }, options);
    const chunks = [];
    for (let i = 0; i < text.length; i += MAX_LENGTH) chunks.push(text.slice(i, i + MAX_LENGTH));
    for (let i = 0; i < chunks.length; i++) {
        await sock.sendMessage(jid, { text: `(${i + 1}/${chunks.length})\n${chunks[i]}` }, options);
        await new Promise(r => setTimeout(r, 500));
    }
}
exports.sendLongMessage = sendLongMessage;

// ═══════════════════════════════════════════════════════════════
//   CRISIS HANDLER (enhanced with multi-lingual support)
// ═══════════════════════════════════════════════════════════════
const CRISIS_STORAGE = new Map();

async function handleCrisis(userId, text, sock, m, db, ownerNumber) {
    if (!db.set?.crisisDetection) return false;
    
    const lastTrigger = CRISIS_STORAGE.get(userId);
    if (lastTrigger && (Date.now() - lastTrigger.triggeredAt) < 30 * 60 * 1000) return true;

    const crisis = await detectCrisis(text);
    if (!crisis.isCrisis) return false;

    CRISIS_STORAGE.set(userId, { triggeredAt: Date.now(), notifiedOwner: false });
    
    const supportMessage = `💙 *Hey, I hear you.*\n\nWhat you're feeling is really important. You don't have to go through this alone.\n\nWould you like to talk to a real person who cares about you? (Reply with *yes* to chat with my owner, or *no* to keep talking to me.)\n\n*You matter.* 💙`;
    await sock.sendMessage(userId, { text: supportMessage }, { quoted: m });

    if (!db.crisisResponses) db.crisisResponses = {};
    db.crisisResponses[userId] = { pending: true, timestamp: Date.now(), originalText: text };

    if (!lastTrigger?.notifiedOwner) {
        const ownerJids = Array.isArray(ownerNumber) ? ownerNumber : [ownerNumber];
        const ownerMessage = `🚨 *CRISIS ALERT* 🚨\n\nUser: ${userId}\nMessage: ${text}\nDetected Lang: ${crisis.detectedLang || 'unknown'}\nSeverity: ${crisis.severity}\nTime: ${new Date().toLocaleString()}\n\nPlease reach out to this person immediately. 🙏`;
        for (const owner of ownerJids) {
            try { await sock.sendMessage(owner, { text: ownerMessage }); } catch (e) { console.error('Failed to notify owner:', e); }
        }
        CRISIS_STORAGE.get(userId).notifiedOwner = true;
    }
    return true;
}
exports.handleCrisis = handleCrisis;

async function processCrisisResponse(userId, response, sock, db, ownerNumber) {
    if (!db.crisisResponses?.[userId]?.pending) return false;
    delete db.crisisResponses[userId];
    const lower = response.trim().toLowerCase();
    if (lower === 'yes') {
        const ownerJids = Array.isArray(ownerNumber) ? ownerNumber : [ownerNumber];
        const ownerFirst = ownerJids[0];
        const ownerNumberClean = ownerFirst.replace(/[^0-9]/g, '');
        const whatsappLink = `https://wa.me/${ownerNumberClean}`;
        const contactMessage = `💙 *Thank you for reaching out.*\n\nYou can talk directly with my owner here:\n${whatsappLink}\n\nThey care about you and will listen without judgment.\n\n*You are not alone.* 💙`;
        await sock.sendMessage(userId, { text: contactMessage });
        return true;
    } else if (lower === 'no') {
        const continueMessage = `💙 *I'm here for you.*\n\nLet's keep chatting. If you ever change your mind, just say "talk to human" anytime.\n\n*You are valued.* 💙`;
        await sock.sendMessage(userId, { text: continueMessage });
        return true;
    }
    return false;
}
exports.processCrisisResponse = processCrisisResponse;

// ═══════════════════════════════════════════════════════════════
//   AVAILABLE TOOLS DESCRIPTION (for AI system prompts)
// ═══════════════════════════════════════════════════════════════
const availableTools = `You are Maureonix, a WhatsApp bot with these capabilities:
- Download: YouTube, TikTok, Instagram, Spotify, etc.
- AI: GPT, Gemini, DeepSeek, image generation, translation, TTS
- Group: Admin tools, tagging, link management
- Games: RPG, Blackjack, Connect4, Trivia, Pokemon, Casino
- Search: Google, Wikipedia, Weather, News, Anime, Movies
- Economy: Daily rewards, work, rob, bank, shop
- Health: BMI, BMR, sleep, workout plans
- Fun: Memes, jokes, quotes, roasts, 8ball
- Developer: UUID, password, encode/decode, QR codes
- Travel: Packing lists, world clock, itineraries
- Food: Recipes, cocktails, meal prep
- Crisis: Mental health monitoring and intervention
Always be helpful, concise, and use emojis.`;

// ═══════════════════════════════════════════════════════════════
//   ENHANCED AI (General conversation + tool awareness)
//   Kept for backward compatibility with other modules
// ═══════════════════════════════════════════════════════════════
async function enhancedAI(text, userId, preferredModel = 'deepseek') {
    // First try intent detection for quick command routing
    const intent = detectIntent(text);
    if (intent && intent.confidence === 'high') {
        return { type: 'function', function: intent.cmd, args: intent.args };
    }

    // Otherwise, use conversational AI
    const systemPrompt = availableTools;
    try {
        const response = await ultimateAI(text, userId, preferredModel, systemPrompt);
        const responseText = response.text || '';
        const funcMatch = responseText.match(/\[FUNCTION:(\w+)(?:\|(.+))?\]/);
        if (funcMatch) {
            const func = funcMatch[1];
            const args = funcMatch[2] ? funcMatch[2].split('|') : [];
            return { type: 'function', function: func, args };
        }
        return { type: 'text', text: responseText };
    } catch (e) {
        try {
            const res = await askModel(text, 'deepseek', userId);
            return { type: 'text', text: res.text };
        } catch {
            return { type: 'text', text: 'I am Maureonix, your AI assistant. How can I help you today?' };
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   FINAL EXPORTS
// ═══════════════════════════════════════════════════════════════
module.exports = {
    groqChat, ultimateAI, askModel, imagine, translate, summarize, codeAI,
    brainrot, roast, rizz, clearMemory, getBalance, getMemory, addToMemory,
    MODELS, AI_MEMORY, detectIntent, enhancedAI, sendLongMessage, availableTools,
    detectCrisis, handleCrisis, processCrisisResponse,
    detectTone, verifyCrisisWithAI, getTonePrompt,
    selfChatAI, think, googleTranslate,
    ALL_COMMANDS  // ← ADD THIS
};