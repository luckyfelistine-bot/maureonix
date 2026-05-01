// lib/ai.js – MAUREONIX OMNISCIENT AI ENGINE (Complete, Fixed Thinking Separation)
const fetch = require('node-fetch');
const crypto = require('crypto');

// ─── MODEL REGISTRY ───
const MODELS = {
    flash: 'llama-3.1-8b-instant',
    instant: 'llama-3.1-8b-instant',
    gemma: 'gemma2-9b-it',
    versatile: 'llama-3.3-70b-versatile',
    qwen: 'qwen/qwen3-32b',
    scout: 'meta-llama/llama-4-scout-17b-16e-instruct',
    orpheus: 'canopylabs/orpheus-v1-english',
    gpt20b: 'openai/gpt-oss-20b',
    gpt120b: 'openai/gpt-oss-120b',
    compound: 'groq/compound',
    whisper: 'whisper-large-v3',
    whisperTurbo: 'whisper-large-v3-turbo',
    safeguard: 'openai/gpt-oss-safeguard-20b',
};
exports.MODELS = MODELS;

const TASK_MODEL = {
    intent: MODELS.flash,
    conversation: MODELS.versatile,
    coding: MODELS.qwen,
    reasoning: MODELS.scout,
    deep_reasoning: MODELS.gpt120b,
    summarization: MODELS.instant,
    creative: MODELS.orpheus,
    crisis: MODELS.versatile,
    quick: MODELS.instant,
};
exports.TASK_MODEL = TASK_MODEL;

// ─── QUANTUM LOAD BALANCER (unchanged) ───
class QuantumLoadBalancer {
    constructor() { this.keys = []; this.health = new Map(); this.current = 0; this.latencies = new Map(); }
    register(keys) {
        const arr = Array.isArray(keys) ? keys : [keys];
        for (const k of arr) { if (!this.keys.includes(k)) { this.keys.push(k); this.health.set(k, { fails: 0, lastFail: 0 }); } }
    }
    getNext() {
        if (!this.keys.length) throw new Error('No Groq API keys available');
        const now = Date.now();
        const healthy = this.keys.filter(k => {
            const h = this.health.get(k);
            return h.fails < 3 || (now - h.lastFail > 60000);
        });
        const pool = healthy.length ? healthy : this.keys;
        return pool[this.current++ % pool.length];
    }
    reportFailure(key) {
        const h = this.health.get(key);
        if (h) { h.fails++; h.lastFail = Date.now(); }
    }
    reportSuccess(key, latency) { this.health.set(key, { fails: 0, lastFail: 0 }); }
    getReport() { return { total: this.keys.length, healthy: this.keys.filter(k => this.health.get(k).fails < 3).length }; }
}
const keyManager = new QuantumLoadBalancer();
try {
    if (global.groqApiKeys && Array.isArray(global.groqApiKeys)) keyManager.register(global.groqApiKeys);
    else if (process.env.GROQ_API_KEY) keyManager.register(process.env.GROQ_API_KEY);
    else { const config = require(process.cwd() + '/config'); if (config?.groqApiKeys) keyManager.register(config.groqApiKeys); }
} catch (err) { console.error('[QuantumLoadBalancer] registration error:', err.message); }
exports.keyManager = keyManager;

// ─── HYPER MEMORY (unchanged) ───
class HyperMemorySystem {
    constructor() { this.working = new Map(); }
    addWorking(uid, role, content) {
        if (!this.working.has(uid)) this.working.set(uid, []);
        const mem = this.working.get(uid);
        mem.push({ role, content, time: Date.now() });
        while (mem.length > 30) mem.shift();
    }
    getWorking(uid) { return this.working.get(uid) || []; }
    clear(uid) { this.working.delete(uid); }
}
const hyperMemory = new HyperMemorySystem();
function getMemory(uid) { return hyperMemory.getWorking(uid); }
function addToMemory(uid, role, content) { hyperMemory.addWorking(uid, role, content); }
function clearMemory(uid) { hyperMemory.clear(uid); }
exports.getMemory = getMemory;
exports.addToMemory = addToMemory;
exports.clearMemory = clearMemory;

// ─── GROQ CHAT (unchanged) ───
const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';
async function groqChat(prompt, model, userId, systemPrompt = null, temperature = 0.7, maxTokens = 1024, depth = 0) {
    if (depth > 2) throw new Error('Max recursion depth');
    const history = getMemory(userId);
    const messages = [];
    messages.push({ role: 'system', content: systemPrompt || 'You are Maureonix, a helpful assistant.' });
    const sanitised = history.slice(-15).map(m => ({ role: m.role, content: m.content }));
    messages.push(...sanitised);
    messages.push({ role: 'user', content: prompt });

    const models = [model, MODELS.instant, MODELS.versatile, MODELS.qwen].filter((v, i, a) => a.indexOf(v) === i);
    const reqStart = Date.now();
    for (const mdl of models) {
        for (let k = 0; k < Math.min(3, keyManager.keys.length); k++) {
            const apiKey = keyManager.getNext();
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 30000);
                const res = await fetch(GROQ_BASE, {
                    method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: mdl, messages, temperature, max_tokens: maxTokens }),
                    signal: controller.signal,
                });
                clearTimeout(timeout);
                const latency = Date.now() - reqStart;
                if (!res.ok) { keyManager.reportFailure(apiKey); continue; }
                const data = await res.json();
                const reply = data.choices?.[0]?.message?.content || '';
                keyManager.reportSuccess(apiKey, latency);
                addToMemory(userId, 'user', prompt);
                addToMemory(userId, 'assistant', reply);
                return { text: reply, model: mdl };
            } catch (e) { keyManager.reportFailure(apiKey); }
        }
    }
    throw new Error('All Groq keys failed');
}
exports.groqChat = groqChat;

// ─── META THINK (fixed: returns { reasoning, answer }) ───
async function metaThink(prompt, userId, depth = 2) {
    // First layer: step-by-step reasoning
    const l1 = await groqChat(`Think step-by-step about: ${prompt}`, TASK_MODEL.reasoning, userId, null, 0.6, 800);
    if (depth < 2) return { reasoning: l1.text, answer: l1.text };
    // Second layer: analyze reasoning
    const l2 = await groqChat(`Analyze your reasoning:\n${l1.text}\nThen provide a final concise answer to the original question.`, TASK_MODEL.deep_reasoning, userId, null, 0.5, 1000);
    // Extract answer (after final answer marker)
    let answer = l2.text;
    const answerMarker = /(final answer:|conclusion:|answer:)/i;
    if (answerMarker.test(answer)) {
        const parts = answer.split(answerMarker);
        answer = parts[parts.length - 1].trim();
    }
    return { reasoning: `${l1.text}\n\n${l2.text}`, answer: answer || l1.text };
}
exports.metaThink = metaThink;

// ─── HIDDEN THINKING STORE ───
const lastThinking = new Map();

// ═══════════════════════════════════════════════════════════════
//  ULTIMATE AI – Returns { text, thinking } where text is answer only
// ═══════════════════════════════════════════════════════════════
async function ultimateAI(prompt, userId, preferredModel = TASK_MODEL.conversation, systemPrompt = null) {
    // Remove any accidental meta-reflection from user prompt (clean)
    const cleanPrompt = prompt.replace(/^(to answer that|i('|i)ll go through|let me think|self[ -]assessment).*?(\n|$)/gim, '').trim();
    
    const isComplex = cleanPrompt.length > 100 || /\b(why|how|explain|analyze|compare|what if)\b/i.test(cleanPrompt);
    let finalAnswer = '';
    let reasoning = '';

    if (isComplex && !systemPrompt) {
        // Use meta-think to separate reasoning from answer
        const meta = await metaThink(cleanPrompt, userId, 2);
        reasoning = meta.reasoning;
        finalAnswer = meta.answer;
    } else {
        // Simple or guided prompt → just answer, but we still ask to avoid reasoning in output
        const effectiveSystem = systemPrompt || 'You are Maureonix. Answer directly. Never include reasoning or disclaimers. Just give the answer.';
        const res = await groqChat(cleanPrompt, preferredModel, userId, effectiveSystem, 0.7, 1024);
        finalAnswer = res.text;
        reasoning = '';
    }

    // Remove any leftover "I'll go through..." from answer
    finalAnswer = finalAnswer.replace(/^(to answer that|i('|i)ll go through|let me think|self[ -]assessment).*?(\n|$)/gim, '').trim();
    
    // Store thinking for up to 10 minutes
    if (reasoning) lastThinking.set(userId, { text: reasoning, expires: Date.now() + 600_000 });
    return { text: finalAnswer, thinking: reasoning };
}
exports.ultimateAI = ultimateAI;

// ─── ENHANCED AI (alias with same separation) ───
async function enhancedAI(prompt, userId, model = null, systemPrompt = null) {
    return ultimateAI(prompt, userId, model || TASK_MODEL.conversation, systemPrompt);
}
exports.enhancedAI = enhancedAI;

// ─── SELF-CHAT AI (for owner self-chat, includes context) ───
async function selfChatAI(prompt, userId, context = null, recentMessages = [], activeModes = []) {
    let system = 'You are Maureonix, the AI assistant for the bot owner. The owner is talking to you directly without a command prefix. Answer concisely and helpfully. Do not include reasoning or meta-commentary.';
    if (activeModes.includes('connect4')) system += ' The user is playing Connect 4. Respond about the game if asked.';
    if (activeModes.includes('chess')) system += ' The user is playing chess. Respond about the game if asked.';
    if (activeModes.includes('akinator')) system += ' The user is playing Akinator. Respond about the game if asked.';
    if (activeModes.includes('truth_or_dare')) system += ' The user may be playing Truth or Dare. Provide truth questions or dares when asked.';
    const contextStr = recentMessages.length ? `\nRecent conversation:\n${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}\n` : '';
    return ultimateAI(prompt, userId, TASK_MODEL.versatile, system + contextStr);
}
exports.selfChatAI = selfChatAI;

// ─── DETECT SELF-CHAT LOOP ───
function detectSelfChatLoop(messages, threshold = 3) {
    const recent = messages.slice(-threshold);
    const allSame = recent.every(m => m.content === recent[0]?.content);
    return allSame && recent.length >= threshold;
}
exports.detectSelfChatLoop = detectSelfChatLoop;

// ─── SEND LONG MESSAGE (split into multiple messages if needed) ───
async function sendLongMessage(nimesha, jid, text, options = {}) {
    const MAX_LEN = 3000;
    if (text.length <= MAX_LEN) {
        return nimesha.sendMessage(jid, { text, ...options });
    }
    const parts = [];
    for (let i = 0; i < text.length; i += MAX_LEN) {
        parts.push(text.slice(i, i + MAX_LEN));
    }
    for (let part of parts) {
        await nimesha.sendMessage(jid, { text: part, ...options });
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}
exports.sendLongMessage = sendLongMessage;

// ─── AI MODE SYSTEM (unchanged) ───
const aiModes = new Map();
const MODE_PROMPTS = {
    instant:  'You are Maureonix in INSTANT mode. Reply in 1-2 short sentences. No reasoning, no meta. Just the final answer. ✨',
    search:   'You are Maureonix in SEARCH mode. Provide facts, links, references. Clear and direct. 🔍',
    code:     'You are Maureonix in CODE mode. Output only working code, no explanations unless asked. 🖥️',
    creative: 'You are Maureonix in CREATIVE mode. Write beautifully with flair and originality. 🌟',
};
function setMode(userId, mode) {
    if (!MODE_PROMPTS[mode]) return `Unknown mode. Available: ${Object.keys(MODE_PROMPTS).join(', ')}`;
    aiModes.set(userId, mode);
    return `✅ Mode set to *${mode}*`;
}
exports.setMode = setMode;
function getCurrentMode(userId) { return aiModes.get(userId) || 'default'; }
exports.getCurrentMode = getCurrentMode;

// ─── GET STORED THINKING ───
function getThinking(userId) {
    const entry = lastThinking.get(userId);
    if (!entry || Date.now() > entry.expires) return 'No recent thinking available.';
    // Do not delete immediately – let user fetch multiple times if needed, but expires after 10 min
    return entry.text;
}
exports.getThinking = getThinking;

function clearThinking(userId) { lastThinking.delete(userId); }
exports.clearThinking = clearThinking;

// ─── EXISTING UTILITIES ───
async function askModel(prompt, modelName, userId) {
    console.log(`[askModel] Called with model: ${modelName}, user: ${userId}, prompt: ${prompt.substring(0, 50)}...`);
    let systemHint = '';
    let preferredModel = TASK_MODEL.conversation;

    const defaultSystemHint = `You are Maureonix, a charming and highly capable WhatsApp bot created by Infinite Vybeflix.
You're talking to a user who may be curious, playful, serious, or even a bit down – adapt your tone accordingly.
- Be warm and conversational when the user is casual.
- Be precise and structured when they ask a factual or technical question.
- Be empathetic and supportive if they sound sad or frustrated.
- Never give one‑word answers unless the question is genuinely yes/no.
- Write full, natural paragraphs, and don't be afraid to show a little personality.
- You can use light emojis when appropriate (e.g. 😊, 💡, 🎉) but don't overdo it.
Your goal is to make the user feel heard, helped, and happy.`;

    switch (modelName.toLowerCase()) {
        case 'gpt':
        case 'chatgpt':
            systemHint = defaultSystemHint;
            preferredModel = MODELS.gpt20b;
            break;
        case 'gemini':
            systemHint = defaultSystemHint;
            preferredModel = MODELS.gemma;
            break;
        case 'llama':
        case 'llama3':
            systemHint = defaultSystemHint;
            preferredModel = MODELS.versatile;
            break;
        case 'deepseek':
            systemHint = defaultSystemHint;
            preferredModel = MODELS.qwen;
            break;
        default:
            systemHint = defaultSystemHint;
            preferredModel = TASK_MODEL.conversation;
    }
    try {
        const result = await ultimateAI(prompt, userId, preferredModel, systemHint);
        console.log(`[askModel] Success, answer length: ${result.text.length}`);
        return { text: result.text };
    } catch (err) {
        console.error(`[askModel] Error for model ${modelName}:`, err);
        throw new Error(`AI request failed: ${err.message}`);
    }
}
exports.askModel = askModel;

async function imagine(prompt) { return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true`; }
exports.imagine = imagine;

async function translate(text, tl, sl = 'auto') {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const data = await res.json();
        return data[0].map(i => i[0]).join('');
    } catch (e) { return text; }
}
exports.translate = translate;

async function summarize(text) {
    const res = await ultimateAI(`Summarize this concisely:\n\n${text.substring(0, 4000)}`);
    return res.text;
}
exports.summarize = summarize;

async function codeAI(prompt, language = 'javascript') {
    const res = await groqChat(`Write ${language} code for: ${prompt}. Output only code, no explanations.`, TASK_MODEL.coding, 'global', null, 0.2, 2048);
    return { text: res.text };
}
exports.codeAI = codeAI;

async function brainrot(text) {
    const res = await ultimateAI(`Convert to Gen Z brainrot (slang, short, chaotic): "${text}"`, 'global', TASK_MODEL.creative);
    return { text: res.text };
}
exports.brainrot = brainrot;

async function roast(target) {
    const res = await ultimateAI(`Roast this person/thing in a funny but not offensive way: "${target}"`, 'global', TASK_MODEL.creative);
    return { text: res.text };
}
exports.roast = roast;

async function rizz(situation) {
    const res = await ultimateAI(`Give a smooth pickup line for this situation: "${situation}"`, 'global', TASK_MODEL.creative);
    return { text: res.text };
}
exports.rizz = rizz;

async function getBalance() { return { balance: 'Unlimited', rate_limit: '30/min' }; }
exports.getBalance = getBalance;

// ─── CRISIS DETECTION (simplified) ───
const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'want to die', 'hopeless', 'no reason to live', 'hurt myself'];
async function detectCrisis(text) {
    const lower = text.toLowerCase();
    const isCrisis = CRISIS_KEYWORDS.some(kw => lower.includes(kw));
    return { isCrisis, severity: isCrisis ? (lower.includes('suicide') ? 'high' : 'medium') : 'low' };
}
exports.detectCrisis = detectCrisis;

// ─── ALL COMMANDS LIST (for reference) ───
const ALL_COMMANDS = [
    'ping', 'alive', 'speed', 'runtime', 'info', 'owner', 'profile', 'leaderboard',
    'sticker', 's', 'simage', 'attp', 'removebg', 'blur', 'qc', 'brat', 'smeme',
    'gpt', 'gemini', 'llama', 'deepseek', 'ai', 'imagine', 'translate', 'tts',
    'stt', 'vv', 'summarize', 'code', 'brainrot', 'roastai', 'rizz', 'clearmemory',
    'song', 'video', 'play', 'spotify', 'apk', 'dl', 'tiktok', 'instagram', 'twitter', 'facebook',
    'google', 'wiki', 'urban', 'weather', 'news', 'crypto', 'forex', 'iplookup',
    'joke', 'meme', 'quote', 'fact', '8ball', 'ship', 'roast', 'compliment', 'truth', 'dare',
    'slot', 'rpg', 'blackjack', 'connect4', 'c4', 'math', 'anagram', 'guessnum', 'trivia', 'pokemon',
    'daily', 'work', 'rob', 'balance', 'deposit', 'withdraw', 'transfer', 'buy', 'inventory', 'lb',
    'add', 'kick', 'promote', 'demote', 'tagall', 'hidetag', 'linkgroup', 'revoke',
    'block', 'unblock', 'join', 'leave', 'backup', 'setppbot', 'public', 'private',
    'bmi', 'bmr', 'sleep', 'workout', 'recipe', 'cocktail',
    'movie', 'series', 'imdb', 'tv', 'leagues', 'fixtures', 'live', 'standings',
    'menu', 'docs', 'ask', 'remindme', 'remind', 'reminders', 'note', 'todo',
    'learn', 'test', 'eval', 'exitlearn', 'study', 'quiz', 'mode', 'thinking',
];
exports.ALL_COMMANDS = ALL_COMMANDS;

// ─── FINAL EXPORTS (ensure everything is present) ───
module.exports = {
    MODELS, TASK_MODEL, keyManager,
    groqChat, ultimateAI, askModel, metaThink,
    getMemory, addToMemory, clearMemory,
    selfChatAI, sendLongMessage, enhancedAI, detectSelfChatLoop,
    setMode, getCurrentMode, getThinking, clearThinking,
    imagine, translate, summarize, codeAI, brainrot, roast, rizz, getBalance, detectCrisis,
    ALL_COMMANDS,
};
