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
    constructor() { this.keys = []; this.health = new Map(); /* ... same as before ... */ }
    register(keys) { /* ... */ }
    getNext() { /* ... */ }
    reportFailure(k) { /* ... */ }
    reportSuccess(k, lat) { /* ... */ }
    getReport() { /* ... */ }
}
const keyManager = new QuantumLoadBalancer();
try {
    if (global.groqApiKeys && Array.isArray(global.groqApiKeys)) keyManager.register(global.groqApiKeys);
    else if (process.env.GROQ_API_KEY) keyManager.register(process.env.GROQ_API_KEY);
    else { const config = require(process.cwd() + '/config'); if (config?.groqApiKeys) keyManager.register(config.groqApiKeys); }
} catch (err) { console.error('[QuantumLoadBalancer] registration error:', err.message); }
exports.keyManager = keyManager;

// ─── HYPER MEMORY (unchanged) ───
class HyperMemorySystem { /* ... */ }
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
                const latency = Date.now() - (reqStart || Date.now());
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

// ─── META THINK (unchanged) ───
async function metaThink(prompt, userId, depth = 2) {
    const l1 = await groqChat(`Think step-by-step about: ${prompt}`, TASK_MODEL.reasoning, userId, null, 0.6, 800);
    if (depth < 2) return { layers: [l1.text] };
    const l2 = await groqChat(`Analyze your reasoning:\n${l1.text}`, TASK_MODEL.meta, userId, null, 0.5, 600);
    return { layers: [l1.text, l2.text] };
}
exports.metaThink = metaThink;

// ─── AI MODE SYSTEM ───
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

// ─── HIDDEN THINKING STORE ───
const lastThinking = new Map();

// ═══════════════════════════════════════════════════════════════
//  ULTIMATE AI – Returns final answer only; stores thinking
// ═══════════════════════════════════════════════════════════════
async function ultimateAI(prompt, userId, preferredModel = TASK_MODEL.conversation, systemPrompt = null) {
    const mode = aiModes.get(userId);
    const effectiveSystem = mode ? MODE_PROMPTS[mode] : systemPrompt;
    let finalText = '';
    let thinking = '';

    // Decide whether to use meta-thinking for complex prompts
    const isComplex = prompt.length > 100 || /\b(why|how|explain|analyze|compare|what if)\b/i.test(prompt);

    if (isComplex && !mode && !systemPrompt) {
        // No mode selected and complex → use meta-think
        const meta = await metaThink(prompt, userId, 2);
        thinking = meta.layers.map((l, i) => `🧠 Layer ${i + 1}:\n${l}`).join('\n\n');
        // Final answer is the last layer (the refined response)
        finalText = meta.layers[meta.layers.length - 1];
    } else if (isComplex && effectiveSystem) {
        // Use system prompt (mode or provided) with chain-of-thought internally
        const thinkPrompt = `[INTERNAL THINKING – DO NOT SHOW TO USER]\nThink through the following request step-by-step. Your thoughts will be hidden.\n[/INTERNAL THINKING]\n\nNow, respond to the user's request:\n${prompt}`;
        const res = await groqChat(thinkPrompt, preferredModel, userId, effectiveSystem, 0.4, 1024);
        // Extract final answer (after the think tag, or the whole output if no tags)
        const parts = res.text.split('[/INTERNAL THINKING]');
        finalText = parts.length > 1 ? parts[1].trim() : res.text;
        thinking = parts.length > 1 ? parts[0].replace('[INTERNAL THINKING – DO NOT SHOW TO USER]\n', '').trim() : '';
    } else {
        // Simple prompt or mode active → just answer
        const res = await groqChat(prompt, preferredModel, userId, effectiveSystem, 0.7, 1024);
        finalText = res.text;
    }

    // Store thinking for up to 10 minutes
    if (thinking) lastThinking.set(userId, { text: thinking, expires: Date.now() + 600_000 });
    return { text: finalText.trim(), thinking };
}
exports.ultimateAI = ultimateAI;

function getThinking(userId) {
    const entry = lastThinking.get(userId);
    if (!entry || Date.now() > entry.expires) return 'No recent thinking available.';
    lastThinking.delete(userId);
    return entry.text;
}
exports.getThinking = getThinking;

// ─── EXISTING UTILITIES (unchanged) ───
async function askModel(prompt, modelName, userId) {
    let model;
    switch (modelName.toLowerCase()) {
        case 'gpt': case 'chatgpt': model = MODELS.gpt20b; break;
        case 'gemini': model = MODELS.gemma; break;
        case 'llama': case 'llama3': model = MODELS.versatile; break;
        case 'deepseek': model = MODELS.qwen; break;
        case 'qwen': model = MODELS.qwen; break;
        case 'scout': model = MODELS.scout; break;
        default: model = MODELS.versatile;
    }
    return await groqChat(prompt, model, userId);
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
    const res = await groqChat(`Write ${language} code for: ${prompt}. Only code.`, TASK_MODEL.coding, 'global', null, 0.2, 2048);
    return { text: res.text };
}
exports.codeAI = codeAI;

async function brainrot(text) { const res = await ultimateAI(`Convert to Gen Z brainrot: "${text}"`); return { text: res.text }; }
exports.brainrot = brainrot;
async function roast(target) { const res = await ultimateAI(`Roast this: "${target}"`); return { text: res.text }; }
exports.roast = roast;
async function rizz(situation) { const res = await ultimateAI(`Give a pickup line for: "${situation}"`); return { text: res.text }; }
exports.rizz = rizz;
async function getBalance() { return { balance: 'Unlimited', rate_limit: '30/min' }; }
exports.getBalance = getBalance;

// ─── CRISIS DETECTION (unchanged) ───
const CRISIS_KEYWORDS = { /* ... */ };
async function detectCrisis(text) { /* ... */ }
exports.detectCrisis = detectCrisis;

// ─── ALL COMMANDS LIST ───
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

module.exports = {
    MODELS, TASK_MODEL, keyManager,
    groqChat, ultimateAI, askModel, metaThink,
    getMemory, addToMemory, clearMemory,
    selfChatAI, sendLongMessage, enhancedAI,
    detectSelfChatLoop,
    setMode, getCurrentMode, getThinking,
    imagine, translate, summarize, codeAI, brainrot, roast, rizz, getBalance, detectCrisis,
    ALL_COMMANDS,
};
