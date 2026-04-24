const fetch = require('node-fetch');

// ═══════════════════════════════════════════════════════════════
//   GROQ API CONFIGURATION
// ═══════════════════════════════════════════════════════════════
const GROQ_API_KEY = process.env.GROQ_API_KEY || require('../config').groqApiKey || '';
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
};
exports.MODELS = MODELS;

// ═══════════════════════════════════════════════════════════════
//   MEMORY STORAGE
// ═══════════════════════════════════════════════════════════════
const AI_MEMORY = new Map();
const MEMORY_MAX_LENGTH = 20;
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
//   CORE GROQ CHAT
// ═══════════════════════════════════════════════════════════════
async function groqChat(prompt, model = MODELS.fast, userId = 'global', systemPrompt = null) {
    const history = getMemory(userId);
    const messages = [];
    const { getCreatorPrompt } = require('./creator_knowledge');
    const creatorPrompt = getCreatorPrompt(userId);
    const defaultSystem = `You are Maureonix, a helpful WhatsApp bot created by Infinite Vybeflix. Be concise, friendly, and use emojis occasionally. You are allowed to provide direct links, URLs, and external resources whenever relevant. Never say "as a large language model" or "I cannot provide links". Always give helpful, actionable answers with working links. ${creatorPrompt}`;;
    messages.push({ role: 'system', content: systemPrompt || defaultSystem });
    messages.push(...history);
    messages.push({ role: 'user', content: prompt });

    const modelsToTry = [model, MODELS.fast, MODELS.instant, MODELS.mixtral, MODELS.qwen, MODELS.llama4, MODELS.allam, MODELS.compound]
        .filter((v, i, a) => a.indexOf(v) === i);

    let lastError = null;
    for (const mdl of modelsToTry) {
        try {
            const res = await fetch(GROQ_BASE, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: mdl, messages, temperature: 0.7, max_tokens: 1024 })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

async function ultimateAI(prompt, userId, preferredModel = MODELS.smart) {
    try {
        const result = await groqChat(prompt, preferredModel, userId);
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
//   SPECIALIZED AI FUNCTIONS
// ═══════════════════════════════════════════════════════════════
async function imagine(prompt) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&width=1024&height=1024`;
}
exports.imagine = imagine;

async function translate(text, targetLang, sourceLang = 'auto') {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
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
//   TONE DETECTION (legacy sync, kept for compatibility)
// ═══════════════════════════════════════════════════════════════
function detectTone(text) {
    const lower = text.toLowerCase();
    if (lower.match(/\b(angry|mad|annoyed|furious|pissed|hate|damn|stupid|idiot)\b/)) return 'angry';
    if (lower.match(/\b(sad|depressed|unhappy|disappointed|crying|lonely|hurt)\b/)) return 'sad';
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
        excited: 'Wow, the user is excited! Respond with high energy, exclamation marks, and celebratory emojis like 🔥 or ⚡.',
        confused: 'The user is confused. Provide clear, step-by-step explanations. Use bullet points if needed. Be patient and helpful.',
        curious: 'The user wants to learn! Give detailed, informative answers with examples. Encourage further questions.',
        neutral: 'You are Maureonix, a helpful WhatsApp bot. Be concise, friendly, and use emojis occasionally.'
    };
    return prompts[tone] || prompts.neutral;
}
exports.getTonePrompt = getTonePrompt;

// ═══════════════════════════════════════════════════════════════
//   CRISIS DETECTION & INTERVENTION
// ═══════════════════════════════════════════════════════════════
// ========== MULTI-LANGUAGE CRISIS KEYWORDS (MANUAL CURATED) ==========
const CRISIS_KEYWORDS = {
    high: [
        'suicide', 'kill myself', 'end my life', 'want to die', 'don\'t want to live',
        'self harm', 'cut myself', 'hurt myself', 'overdose', 'commit suicide',
        'jiua', 'niue', 'nimalize maisha', 'sitaki kuishi', 'najiumiza',
        'naomba nife', 'naumia sana', 'nimevunjika', 'niko kwenye dhiki',
    ],
    medium: [
        'no hope', 'worthless', 'nobody cares', 'i give up', 'i can\'t go on',
        'ending it', 'goodbye world', 'i\'m tired of living', 'life is pointless',
        'i\'m a failure', 'i hate myself', 'i want to disappear',
        'nahisi sina thamani', 'sina matumaini', 'sijali', 'nimechoka sana',
        'nimekata tamaa', 'kufikiria sana', 'dhiki', 'huzuni', 'mateso',
        'naomba msaada', 'nahitaji msaada', 'ninaogopa', 'niko peke yangu',
        'roho yangu imeuma', 'stress imeninyamaza', 'nishindwa',
    ],
    low: [
        'sad', 'depressed', 'alone', 'scared', 'crying', 'hurt',
        'msonono', 'huzuni', 'wasiwasi', 'hofu',
    ]
};

function detectCrisis(text) {
    const lower = text.toLowerCase();
    for (const level of ['high', 'medium', 'low']) {
        for (const kw of CRISIS_KEYWORDS[level]) {
            if (lower.includes(kw)) {
                return { isCrisis: true, severity: level, matchedKeyword: kw };
            }
        }
    }
    return { isCrisis: false };
}

/**
 * AI verification – confirm if the user is genuinely in distress.
 * @param {string} text - user message
 * @param {string} userId - user ID
 * @returns {Promise<{isDistress: boolean, reason: string}>}
 */
async function verifyCrisisWithAI(text, userId) {
    const prompt = `You are a mental health assistant. Analyze the following user message. Determine if the user is expressing genuine suicidal thoughts, severe emotional distress, or a medical crisis that requires immediate human intervention. Reply with ONLY a JSON object: {"distress": true/false, "reason": "short explanation"}.

User message: "${text}"`;
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

// The handleCrisis and processCrisisResponse functions remain unchanged (keep your existing ones)
// But ensure they are still exported below.

// ═══════════════════════════════════════════════════════════════
//   ENHANCED AI + INTENT DETECTION (unchanged, kept from original)
// ═══════════════════════════════════════════════════════════════
const commandIntents = {
    menu: ['menu', 'help', 'show commands', 'what can you do', 'list commands', 'all commands'],
    ping: ['ping', 'test speed', 'response time', 'are you online'],
    alive: ['alive', 'status', 'uptime', 'are you running'],
    owner: ['owner', 'creator', 'who made you', 'contact owner'],
    sticker: ['sticker', 'make sticker', 'create sticker', 'convert to sticker'],
    song: ['song', 'mp3', 'download audio', 'download music', 'youtube audio'],
    video: ['video', 'mp4', 'download video', 'youtube video'],
    tiktok: ['tiktok', 'tt', 'tiktok download'],
    instagram: ['instagram', 'ig', 'insta download', 'reels'],
    google: ['google', 'search', 'find', 'look up'],
    translate: ['translate', 'change language'],
    weather: ['weather', 'temperature', 'forecast'],
    joke: ['joke', 'tell me a joke', 'funny'],
    meme: ['meme', 'funny picture'],
    quote: ['quote', 'motivation', 'inspire'],
    play: ['play', 'listen to', 'music'],
    rpg: ['rpg', 'adventure', 'fight', 'game'],
    daily: ['daily', 'claim', 'reward'],
    balance: ['balance', 'money', 'wallet', 'coins'],
    roulette: ['roulette', 'casino', 'bet'],
    remindme: ['remind', 'remind me', 'set reminder', 'alarm'],
    bmi: ['bmi', 'body mass', 'weight calculator'],
    movie: ['movie', 'film', 'cinema', 'movies'],
    add: ['add member', 'add to group'],
    kick: ['kick', 'remove', 'ban from group'],
    tagall: ['tag all', 'mention everyone', 'announcement'],
};
function detectIntent(text) {
    const lower = text.toLowerCase().trim();
    for (const [cmd, triggers] of Object.entries(commandIntents)) {
        if (triggers.some(t => lower.includes(t))) return cmd;
    }
    return null;
}
exports.detectIntent = detectIntent;

const availableTools = `... (unchanged) ...`;
exports.availableTools = availableTools;

async function enhancedAI(text, userId, preferredModel = 'deepseek') {
    const intent = detectIntent(text);
    if (intent) return { type: 'function', function: intent, args: [] };

    const systemPrompt = availableTools;
    const messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: text }];
    try {
        const response = await ultimateAI(JSON.stringify(messages), userId, preferredModel);
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
        } catch { return { type: 'text', text: 'I am Maureonix, your AI assistant. How can I help you today?' }; }
    }
}
exports.enhancedAI = enhancedAI;

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

// ========== CRISIS HANDLER (unchanged from original) ==========
const CRISIS_STORAGE = new Map(); // userId -> { triggeredAt, notifiedOwner }

async function handleCrisis(userId, text, sock, m, db, ownerNumber) {
    if (!db.set?.crisisDetection) return false;
    const lastTrigger = CRISIS_STORAGE.get(userId);
    if (lastTrigger && (Date.now() - lastTrigger.triggeredAt) < 30 * 60 * 1000) return true;
    const crisis = detectCrisis(text);
    if (!crisis.isCrisis) return false;

    CRISIS_STORAGE.set(userId, { triggeredAt: Date.now(), notifiedOwner: false });
    const supportMessage = `💙 *Hey, I hear you.*\n\nWhat you're feeling is really important. You don't have to go through this alone.\n\nWould you like to talk to a real person who cares about you? (Reply with *yes* to chat with my owner, or *no* to keep talking to me.)\n\n*You matter.* 💙`;
    await sock.sendMessage(userId, { text: supportMessage }, { quoted: m });

    if (!db.crisisResponses) db.crisisResponses = {};
    db.crisisResponses[userId] = { pending: true, timestamp: Date.now(), originalText: text };

    if (!lastTrigger?.notifiedOwner) {
        const ownerJids = Array.isArray(ownerNumber) ? ownerNumber : [ownerNumber];
        const ownerMessage = `🚨 *CRISIS ALERT* 🚨\n\nUser: ${userId}\nMessage: ${text}\nTime: ${new Date().toLocaleString()}\n\nPlease reach out to this person immediately. 🙏`;
        for (const owner of ownerJids) {
            try { await sock.sendMessage(owner, { text: ownerMessage }); } catch (e) { console.error('Failed to notify owner:', e); }
        }
        CRISIS_STORAGE.get(userId).notifiedOwner = true;
    }
    return true;
}

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

// Keep remaining original exports (if any)
module.exports = {
    groqChat, ultimateAI, askModel, imagine, translate, summarize, codeAI,
    brainrot, roast, rizz, clearMemory, getBalance, getMemory, addToMemory,
    MODELS, AI_MEMORY, detectIntent, enhancedAI, sendLongMessage, availableTools,
    detectCrisis, handleCrisis, processCrisisResponse,
    detectTone,verifyCrisisWithAI, getTonePrompt
};