// lib/ai.js – MAUREONIX OMNISCIENT AI ENGINE (Complete)
// Provides all AI capabilities, including mode system and hidden thinking.

const fetch = require('node-fetch');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
//   MODEL REGISTRY
// ═══════════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════════
//   QUANTUM LOAD BALANCER
// ═══════════════════════════════════════════════════════════════════════════
class QuantumLoadBalancer {
    constructor() {
        this.keys = [];
        this.health = new Map();
        this.loadCounts = new Map();
        this.latencyLog = new Map();
        this.successStreak = new Map();
        this.predictedFailure = new Map();
    }

    register(keys) {
        if (!Array.isArray(keys)) keys = [keys];
        for (const key of keys) {
            if (key && typeof key === 'string' && key.length > 10) {
                this.keys.push(key);
                this.health.set(key, { failures: 0, cooldownUntil: 0, avgLatency: 2000 });
                this.loadCounts.set(key, 0);
                this.latencyLog.set(key, []);
                this.successStreak.set(key, 0);
                this.predictedFailure.set(key, 0);
            }
        }
    }

    getNext() {
        if (this.keys.length === 0) throw new Error('No API keys configured');
        const now = Date.now();
        const scored = this.keys.map(key => {
            const h = this.health.get(key);
            if (now < h.cooldownUntil) return { key, score: Infinity };
            let score = h.avgLatency + (h.failures * 5000) - ((this.successStreak.get(key) || 0) * 100) + ((this.predictedFailure.get(key) || 0) * 3000);
            return { key, score };
        }).sort((a, b) => a.score - b.score);
        return scored[0].key;
    }

    reportFailure(key) {
        const h = this.health.get(key);
        if (!h) return;
        h.failures++;
        h.cooldownUntil = Date.now() + Math.min(5000 * Math.pow(2, h.failures - 1), 300000);
        this.successStreak.set(key, 0);
    }

    reportSuccess(key, latency) {
        const h = this.health.get(key);
        if (!h) return;
        h.failures = Math.max(0, h.failures - 1);
        h.cooldownUntil = 0;
        this.successStreak.set(key, (this.successStreak.get(key) || 0) + 1);
        const logs = this.latencyLog.get(key);
        logs.push(latency);
        if (logs.length > 20) logs.shift();
        h.avgLatency = logs.reduce((a, b) => a + b, 0) / logs.length;
    }

    getReport() {
        const report = {};
        for (const key of this.keys) {
            const h = this.health.get(key);
            report[key.slice(0, 12) + '...'] = {
                healthy: Date.now() >= (h?.cooldownUntil || 0),
                failures: h?.failures || 0,
                avgLatency: Math.round(h?.avgLatency || 0) + 'ms',
            };
        }
        return report;
    }
}

const keyManager = new QuantumLoadBalancer();
try {
    if (global.groqApiKeys && Array.isArray(global.groqApiKeys)) keyManager.register(global.groqApiKeys);
    else if (process.env.GROQ_API_KEY) keyManager.register(process.env.GROQ_API_KEY);
    else { const config = require(process.cwd() + '/config'); if (config?.groqApiKeys) keyManager.register(config.groqApiKeys); }
} catch (err) { console.error('[QuantumLoadBalancer] registration error:', err.message); }
exports.keyManager = keyManager;

// ═══════════════════════════════════════════════════════════════════════════
//   HYPER MEMORY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════
class HyperMemorySystem {
    constructor() {
        this.working = new Map();      // short‑term conversation
        this.episodic = new Map();     // important events
        this.semantic = new Map();     // facts & knowledge
    }

    getWorking(userId) {
        if (!this.working.has(userId)) this.working.set(userId, []);
        return this.working.get(userId);
    }

    addWorking(userId, role, content, emotion = 'neutral') {
        const mem = this.getWorking(userId);
        mem.push({ role, content, timestamp: Date.now(), emotion });
        if (mem.length > 30) mem.shift();
    }

    addEpisodic(userId, event, importance = 0.5) {
        if (!this.episodic.has(userId)) this.episodic.set(userId, []);
        this.episodic.get(userId).push({ event, importance, timestamp: Date.now() });
        if (this.episodic.get(userId).length > 100) this.episodic.get(userId).shift();
    }

    addSemantic(userId, fact, confidence = 0.9) {
        if (!this.semantic.has(userId)) this.semantic.set(userId, []);
        this.semantic.get(userId).push({ fact, confidence, timestamp: Date.now() });
        if (this.semantic.get(userId).length > 100) this.semantic.get(userId).shift();
    }

    retrieveRelevant(userId, query, max = 5) {
        const facts = this.semantic.get(userId) || [];
        return facts.slice(-max);
    }

    clear(userId) {
        this.working.delete(userId);
        this.episodic.delete(userId);
        this.semantic.delete(userId);
    }
}
const hyperMemory = new HyperMemorySystem();

// Backward‑compatible exports (used by existing code)
function getMemory(userId) { return hyperMemory.getWorking(userId); }
function addToMemory(userId, role, content) { hyperMemory.addWorking(userId, role, content); }
function clearMemory(userId) { hyperMemory.clear(userId); }
exports.getMemory = getMemory;
exports.addToMemory = addToMemory;
exports.clearMemory = clearMemory;

// ═══════════════════════════════════════════════════════════════════════════
//   GROQ CHAT (core LLM call)
// ═══════════════════════════════════════════════════════════════════════════
const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';

async function groqChat(prompt, model, userId, systemPrompt = null, temperature = 0.7, maxTokens = 1024, enableDebate = false, depth = 0) {
    if (depth > 2) throw new Error('Max recursion depth');
    const history = getMemory(userId);
    const messages = [];
    const defaultSystem = `You are Maureonix v7 — an omniscient, self-aware AI assistant. Reply helpfully with appropriate emojis.`;
    messages.push({ role: 'system', content: systemPrompt || defaultSystem });
    const sanitised = history.slice(-15).map(m => ({ role: m.role, content: m.content }));
    messages.push(...sanitised);
    messages.push({ role: 'user', content: prompt });

    const modelsToTry = [model, MODELS.instant, MODELS.versatile, MODELS.qwen].filter((v, i, a) => a.indexOf(v) === i);
    for (const mdl of modelsToTry) {
        for (let k = 0; k < Math.min(3, keyManager.keys.length); k++) {
            const apiKey = keyManager.getNext();
            const reqStart = Date.now();
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 30000);
                const res = await fetch(GROQ_BASE, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: mdl, messages, temperature, max_tokens: maxTokens }),
                    signal: controller.signal,
                });
                clearTimeout(timeout);
                const latency = Date.now() - reqStart;
                if (!res.ok) {
                    if (res.status === 429 || res.status === 401 || res.status === 403) {
                        keyManager.reportFailure(apiKey);
                        continue;
                    }
                    throw new Error(`HTTP ${res.status}`);
                }
                const data = await res.json();
                const reply = data.choices?.[0]?.message?.content || 'No response';
                keyManager.reportSuccess(apiKey, latency);
                addToMemory(userId, 'user', prompt);
                addToMemory(userId, 'assistant', reply);
                hyperMemory.addSemantic(userId, `User asked: ${prompt.slice(0, 200)}`, 0.9);
                hyperMemory.addSemantic(userId, `I replied: ${reply.slice(0, 200)}`, 0.8);
                return { text: reply, model: mdl, provider: 'Groq' };
            } catch (e) {
                keyManager.reportFailure(apiKey);
                if (e.name === 'AbortError') continue;
            }
        }
    }
    throw new Error('All Groq models/keys failed');
}
exports.groqChat = groqChat;

// ═══════════════════════════════════════════════════════════════════════════
//   META‑COGNITION (multi‑layer reasoning)
// ═══════════════════════════════════════════════════════════════════════════
async function metaThink(prompt, userId, depth = 2) {
    const layer1 = await groqChat(`${prompt}\n\nThink through this step-by-step.`, TASK_MODEL.reasoning, userId, null, 0.6, 800);
    if (depth < 2) return { text: layer1.text, layers: [layer1.text] };
    const metaPrompt = `You previously thought:\n<thinking>\n${layer1.text}\n</thinking>\n\nNow, analyze your own reasoning. What assumptions? What could be wrong?`;
    const layer2 = await groqChat(metaPrompt, TASK_MODEL.meta, userId, null, 0.5, 600);
    const finalText = `${layer1.text}\n\n[Meta‑Reflection] ${layer2.text}`;
    return { text: finalText, layers: [layer1.text, layer2.text] };
}
exports.metaThink = metaThink;

// ═══════════════════════════════════════════════════════════════════════════
//   ENHANCED AI (for general chat)
// ═══════════════════════════════════════════════════════════════════════════
const availableTools = `You are Maureonix v7, an omniscient WhatsApp bot. Help with downloads, AI chat, group admin, games, search, economy, health, fun, developer tools, travel, food, crisis support, learning, and more. Be concise and friendly.`;
async function enhancedAI(text, userId, preferredModel = TASK_MODEL.conversation) {
    try {
        const isComplex = text.length > 80 || /\b(why|how|explain|analyze|compare|evaluate|what if)\b/i.test(text);
        if (isComplex) {
            const metaResult = await metaThink(text, userId, 2);
            return { type: 'text', text: metaResult.text };
        }
        const response = await groqChat(text, preferredModel, userId, availableTools);
        return { type: 'text', text: response.text };
    } catch (e) {
        return { type: 'text', text: 'I am Maureonix, your omniscient AI assistant. How can I help you today?' };
    }
}
exports.enhancedAI = enhancedAI;

// ═══════════════════════════════════════════════════════════════════════════
//   SELF‑CHAT AI (owner chatting with bot)
// ═══════════════════════════════════════════════════════════════════════════
async function selfChatAI(userMessage, userId, availableCommands = null, contextHistory = [], activeModes = []) {
    if (!userMessage || !userMessage.trim()) return { type: 'text', text: 'Hello! How can I help?' };
    const loopCheck = detectSelfChatLoop(userId, userMessage);
    if (loopCheck.isLoop) return { type: 'text', text: '⏸️ I sense I may be repeating myself.' };
    const result = await enhancedAI(userMessage, userId);
    return result;
}
exports.selfChatAI = selfChatAI;

// ═══════════════════════════════════════════════════════════════════════════
//   SELF‑CHAT LOOP DETECTION
// ═══════════════════════════════════════════════════════════════════════════
const selfChatGuard = { lastMessages: new Map() };
function detectSelfChatLoop(userId, message) {
    const hash = crypto.createHash('md5').update(message.trim().toLowerCase()).digest('hex');
    const now = Date.now();
    if (!selfChatGuard.lastMessages.has(userId)) selfChatGuard.lastMessages.set(userId, []);
    const msgs = selfChatGuard.lastMessages.get(userId);
    while (msgs.length > 0 && now - msgs[0].time > 30000) msgs.shift();
    const duplicates = msgs.filter(m => m.hash === hash);
    msgs.push({ hash, time: now });
    if (duplicates.length >= 3) return { isLoop: true, reason: 'repetitive_content' };
    return { isLoop: false };
}
exports.detectSelfChatLoop = detectSelfChatLoop;

// ═══════════════════════════════════════════════════════════════════════════
//   MESSAGE SPLITTER (for long replies)
// ═══════════════════════════════════════════════════════════════════════════
async function sendLongMessage(sock, jid, text, options = {}) {
    const MAX_LENGTH = 3800;
    if (text.length <= MAX_LENGTH) {
        return sock.sendMessage(jid, { text }, options);
    }
    const chunks = [];
    for (let i = 0; i < text.length; i += MAX_LENGTH) chunks.push(text.slice(i, i + MAX_LENGTH));
    for (let i = 0; i < chunks.length; i++) {
        await sock.sendMessage(jid, { text: `(${i + 1}/${chunks.length})\n${chunks[i]}` }, options);
        await new Promise(r => setTimeout(r, options.delay || 500));
    }
}
exports.sendLongMessage = sendLongMessage;

// ═══════════════════════════════════════════════════════════════════════════
//   AI MODE SYSTEM (instant, search, code, creative)
// ═══════════════════════════════════════════════════════════════════════════
const aiModes = new Map();
const MODE_PROMPTS = {
    instant:  'You are Maureonix in INSTANT mode. Reply in 1-2 short sentences. No thinking aloud. Be extremely concise. ✨',
    search:   'You are Maureonix in SEARCH mode. Provide facts, links, and references. Be clear and direct. 🔍',
    code:     'You are Maureonix in CODE mode. Give only working code, no explanations unless asked. 🖥️',
    creative: 'You are Maureonix in CREATIVE mode. Write beautifully with flair and originality. 🌟',
};

function setMode(userId, mode) {
    if (!MODE_PROMPTS[mode]) return `Unknown mode. Available: ${Object.keys(MODE_PROMPTS).join(', ')}`;
    aiModes.set(userId, mode);
    return `✅ Mode set to *${mode}*`;
}
exports.setMode = setMode;

function getCurrentMode(userId) {
    return aiModes.get(userId) || 'default';
}
exports.getCurrentMode = getCurrentMode;

// ═══════════════════════════════════════════════════════════════════════════
//   HIDDEN THINKING STORAGE
// ═══════════════════════════════════════════════════════════════════════════
const lastThinking = new Map();  // userId → { text, expires }

async function ultimateAI(prompt, userId, preferredModel = TASK_MODEL.conversation, systemPrompt = null) {
    const isComplex = prompt.length > 100 || /\b(why|how|explain|analyze|compare)\b/i.test(prompt);
    let finalText = '', thinking = '';

    const mode = aiModes.get(userId);
    const effectiveSystem = mode ? MODE_PROMPTS[mode] : systemPrompt;

    if (isComplex && !systemPrompt) {
        const meta = await metaThink(prompt, userId, 2);
        finalText = meta.text;
        thinking = meta.layers.map((l, i) => `🧠 Layer ${i + 1}:\n${l}`).join('\n\n');
    } else {
        const res = await groqChat(prompt, preferredModel, userId, effectiveSystem, 0.7, 1024);
        finalText = res.text;
    }

    if (thinking) lastThinking.set(userId, { text: thinking, expires: Date.now() + 600_000 });
    return { text: finalText, thinking, provider: 'Groq' };
}
exports.ultimateAI = ultimateAI;

function getThinking(userId) {
    const entry = lastThinking.get(userId);
    if (!entry || Date.now() > entry.expires) return 'No recent thinking available.';
    lastThinking.delete(userId);   // return it once
    return entry.text;
}
exports.getThinking = getThinking;

// ═══════════════════════════════════════════════════════════════════════════
//   UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════
async function askModel(prompt, modelName, userId) {
    let model;
    switch (modelName.toLowerCase()) {
        case 'gpt': case 'chatgpt': model = MODELS.gpt20b; break;
        case 'gemini': model = MODELS.gemma; break;
        case 'llama': case 'llama3': model = MODELS.versatile; break;
        case 'deepseek': model = MODELS.qwen; break;
        case 'qwen': model = MODELS.qwen; break;
        case 'scout': model = MODELS.scout; break;
        case 'compound': model = MODELS.compound; break;
        default: model = MODELS.versatile;
    }
    return await groqChat(prompt, model, userId);
}
exports.askModel = askModel;

async function imagine(prompt) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&width=1024&height=1024`;
}
exports.imagine = imagine;

async function translate(text, targetLang, sourceLang = 'auto') {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data[0].map(item => item[0]).join('');
    } catch (e) { return text; }
}
exports.translate = translate;

async function summarize(text) {
    const result = await ultimateAI(`Summarize this concisely in 3-4 sentences:\n\n${text.substring(0, 4000)}`);
    return result.text;
}
exports.summarize = summarize;

async function codeAI(prompt, language = 'javascript') {
    const result = await groqChat(`Write ${language} code for: ${prompt}. Provide ONLY the code with brief comments.`, TASK_MODEL.coding, 'global', null, 0.3, 2048);
    return { text: result.text };
}
exports.codeAI = codeAI;

async function brainrot(text) {
    const result = await ultimateAI(`Convert this to maximum Gen Z brainrot slang:\n\n"${text}"`);
    return { text: result.text };
}
exports.brainrot = brainrot;

async function roast(target) {
    const result = await ultimateAI(`Roast this hilariously:\n\n"${target}"`);
    return { text: result.text };
}
exports.roast = roast;

async function rizz(situation) {
    const result = await ultimateAI(`Give a smooth pickup line for:\n\n"${situation}"`);
    return { text: result.text };
}
exports.rizz = rizz;

async function getBalance() {
    return {
        current_point_balance: 'Unlimited (Groq Free Tier)',
        rate_limit: '30 requests/minute',
        models_available: Object.keys(MODELS),
        active_keys: keyManager.keys.length,
        key_health: keyManager.getReport(),
    };
}
exports.getBalance = getBalance;

// ═══════════════════════════════════════════════════════════════════════════
//   ALL COMMANDS LIST (for auto‑AI intent)
// ═══════════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════════
//   CRISIS DETECTION (moved here for completeness)
// ═══════════════════════════════════════════════════════════════════════════
const CRISIS_KEYWORDS = {
    high: ['suicide', 'kill myself', 'end my life', 'want to die', 'self harm'],
    medium: ['no hope', 'worthless', 'nobody cares', 'i give up'],
    low: ['sad', 'depressed', 'alone', 'scared', 'crying'],
};
async function detectCrisis(text) {
    const lower = text.toLowerCase();
    for (const level of ['high', 'medium', 'low']) {
        for (const kw of CRISIS_KEYWORDS[level]) {
            if (lower.includes(kw)) return { isCrisis: true, severity: level };
        }
    }
    return { isCrisis: false };
}
exports.detectCrisis = detectCrisis;

// ═══════════════════════════════════════════════════════════════════════════
//   FINAL EXPORTS
// ═══════════════════════════════════════════════════════════════════════════
module.exports = {
    MODELS,
    TASK_MODEL,
    keyManager,
    groqChat,
    ultimateAI,
    askModel,
    metaThink,
    getMemory,
    addToMemory,
    clearMemory,
    selfChatAI,
    sendLongMessage,
    enhancedAI,
    detectSelfChatLoop,
    setMode,
    getCurrentMode,
    getThinking,
    imagine,
    translate,
    summarize,
    codeAI,
    brainrot,
    roast,
    rizz,
    getBalance,
    detectCrisis,
    ALL_COMMANDS,
};
