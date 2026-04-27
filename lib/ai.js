// ═══════════════════════════════════════════════════════════════════════════
//   🦊 MAUREONIX ULTIMATE AI ENGINE v6.0.0
//   Multi‑model, self‑aware, reasoning, creator‑aware, load‑balanced
//   Created for Maureonix by Infinite Vybeflix
// ═══════════════════════════════════════════════════════════════════════════

const fetch = require('node-fetch');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════
//   MODEL REGISTRY — all available Groq models
// ═══════════════════════════════════════════════════════════════════════════
const MODELS = {
    // ── Tier 1: Instant (fast, cheap) ──
    instant: 'llama-3.1-8b-instant',
    promptGuard22m: 'meta-llama/llama-prompt-guard-2-22m',
    promptGuard86m: 'meta-llama/llama-prompt-guard-2-86m',

    // ── Tier 2: Balanced ──
    versatile: 'llama-3.3-70b-versatile',
    qwen: 'qwen/qwen3-32b',
    allam: 'allam-2-7b',
    gemma: 'gemma2-9b-it',

    // ── Tier 3: Smart / Reasoning ──
    scout: 'meta-llama/llama-4-scout-17b-16e-instruct',
    orpheus: 'canopylabs/orpheus-v1-english',

    // ── Tier 4: Compound (multiple models combined) ──
    compound: 'groq/compound',
    compoundMini: 'groq/compound-mini',

    // ── Specialised ──
    whisper: 'whisper-large-v3',
    whisperTurbo: 'whisper-large-v3-turbo',
    gpt20b: 'openai/gpt-oss-20b',
    gpt120b: 'openai/gpt-oss-120b',
    safeguard: 'openai/gpt-oss-safeguard-20b',
};
exports.MODELS = MODELS;

// ═══════════════════════════════════════════════════════════════════════════
//   TASK → MODEL MAPPING (automatically selects best model for each job)
// ═══════════════════════════════════════════════════════════════════════════
const TASK_MODEL = {
    intent: MODELS.instant,            // fast intent parsing
    conversation: MODELS.versatile,    // normal chat
    coding: MODELS.qwen,               // code generation
    reasoning: MODELS.scout,           // complex reasoning / chain‐of‐thought
    summarization: MODELS.instant,     // quick summaries
    translation: MODELS.instant,       // translation
    creative: MODELS.orpheus,          // creative writing
    crisis: MODELS.versatile,          // crisis detection (balanced)
    system: MODELS.scout,              // system commands / diagnostics
    quick: MODELS.instant,             // fast fallback
};
exports.TASK_MODEL = TASK_MODEL;

// ═══════════════════════════════════════════════════════════════════════════
//   API KEY MANAGER — load balancing, health tracking, automatic failover
// ═══════════════════════════════════════════════════════════════════════════
class APIKeyManager {
    constructor() {
        this.keys = [];
        this.index = 0;
        this.health = new Map();   // key → { failures, lastFailTime, cooldownUntil }
        this.loadCounts = new Map(); // key → number of requests
    }

    /** Register multiple keys at once */
    register(keys) {
        if (!Array.isArray(keys)) keys = [keys];
        for (const key of keys) {
            if (key && typeof key === 'string' && key.length > 10) {
                this.keys.push(key);
                this.health.set(key, { failures: 0, lastFailTime: 0, cooldownUntil: 0 });
                this.loadCounts.set(key, 0);
            }
        }
        console.log(`[APIKeyManager] Registered ${this.keys.length} keys`);
    }

    /** Get the next healthy key (rotation + health check) */
    getNext() {
        if (this.keys.length === 0) throw new Error('No API keys configured');

        const now = Date.now();
        let attempts = 0;
        let key = null;

        while (attempts < this.keys.length) {
            key = this.keys[this.index % this.keys.length];
            this.index++;
            attempts++;

            const h = this.health.get(key);
            if (!h) continue;

            // if key is in cooldown, skip
            if (now < h.cooldownUntil) continue;

            // key is healthy, use it
            this.loadCounts.set(key, (this.loadCounts.get(key) || 0) + 1);
            return key;
        }

        // all keys are in cooldown — pick the one with the shortest wait
        let bestKey = this.keys[0];
        let bestCooldown = Infinity;
        for (const k of this.keys) {
            const h = this.health.get(k);
            if (h && h.cooldownUntil < bestCooldown) {
                bestCooldown = h.cooldownUntil;
                bestKey = k;
            }
        }
        const waitMs = Math.max(0, bestCooldown - now);
        if (waitMs > 0) {
            console.log(`[APIKeyManager] All keys in cooldown. Best key available in ${waitMs}ms`);
        }
        return bestKey;
    }

    /** Report a failure → increase cooldown for that key */
    reportFailure(key) {
        const h = this.health.get(key);
        if (!h) return;
        h.failures++;
        h.lastFailTime = Date.now();
        // exponential backoff: 5s, 10s, 20s, 40s... max 5 minutes
        const cooldown = Math.min(5000 * Math.pow(2, h.failures - 1), 300000);
        h.cooldownUntil = Date.now() + cooldown;
        console.log(`[APIKeyManager] Key failed (${h.failures}x). Cooldown: ${cooldown}ms`);
    }

    /** Report a success → reset failure count */
    reportSuccess(key) {
        const h = this.health.get(key);
        if (h && h.failures > 0) {
            h.failures = 0;
            h.cooldownUntil = 0;
        }
    }

    /** Get health report for owner */
    getReport() {
        const report = {};
        for (const key of this.keys) {
            const short = key.substring(0, 15) + '...';
            const h = this.health.get(key);
            report[short] = {
                healthy: Date.now() >= (h?.cooldownUntil || 0),
                failures: h?.failures || 0,
                loads: this.loadCounts.get(key) || 0,
            };
        }
        return report;
    }
}

// Singleton
const keyManager = new APIKeyManager();

// Register keys from config
if (global.groqApiKeys && Array.isArray(global.groqApiKeys)) {
    keyManager.register(global.groqApiKeys);
} else if (process.env.GROQ_API_KEY) {
    keyManager.register(process.env.GROQ_API_KEY);
} else {
    // try to load from config
    try {
        const config = require(process.cwd() + '/config');
        if (config?.groqApiKeys) keyManager.register(config.groqApiKeys);
    } catch {}
}
exports.keyManager = keyManager;

// ═══════════════════════════════════════════════════════════════════════════
//   MEMORY SYSTEM — short‑term (conversation) + long‑term (knowledge base)
// ═══════════════════════════════════════════════════════════════════════════
const AI_MEMORY = new Map();
const MEMORY_MAX_LENGTH = 30;

function getMemory(userId) {
    if (!AI_MEMORY.has(userId)) AI_MEMORY.set(userId, []);
    return AI_MEMORY.get(userId);
}
exports.getMemory = getMemory;

function addToMemory(userId, role, content) {
    const mem = getMemory(userId);
    mem.push({ role, content, timestamp: Date.now() });
    if (mem.length > MEMORY_MAX_LENGTH) mem.splice(0, mem.length - MEMORY_MAX_LENGTH);
}
exports.addToMemory = addToMemory;

function clearMemory(userId) {
    AI_MEMORY.delete(userId);
}
exports.clearMemory = clearMemory;

// Auto‑summarise old memories to save context window
async function compressMemory(userId) {
    const mem = getMemory(userId);
    if (mem.length < 20) return; // only compress when it's getting long

    // take the oldest 10 entries and summarise them
    const oldEntries = mem.splice(0, 10);
    const oldText = oldEntries.map(e => `${e.role}: ${e.content}`).join('\n');
    
    try {
        const summary = await groqChat(
            `Summarise the following conversation history in 2-3 sentences. Keep names, facts, and important context.\n\n${oldText}`,
            TASK_MODEL.summarization, userId, null, 0.3, 200
        );
        // insert the summary at the beginning
        mem.unshift({ role: 'system', content: `[Memory Summary] ${summary.text}`, timestamp: Date.now() });
    } catch (e) {
        // if summarisation fails, just keep the oldest entries (re‑insert them)
        mem.unshift(...oldEntries);
    }
}
exports.compressMemory = compressMemory;

// ═══════════════════════════════════════════════════════════════════════════
//   CORE GROQ CHAT — the single function that calls the API (key rotation)
// ═══════════════════════════════════════════════════════════════════════════
const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';

async function groqChat(prompt, model, userId, systemPrompt = null, temperature = 0.7, maxTokens = 1024) {
    const history = getMemory(userId);
    const messages = [];

    // ── System prompt ──
    const currentTime = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
    const ownerName = global.ownerName || 'Infinite Vybeflix';
    const ownerNum = (global.owner?.[0] || '').replace(/[^0-9]/g, '');

    const isOwner = (userId === 'owner_selfchat') || (global.owner || []).some(o => {
        const clean = o.replace(/[^0-9]/g, '');
        return userId.includes(clean);
    });

    let defaultSystem = `You are Maureonix, an intelligent autonomous AI assistant created by ${ownerName}. 
Current time (Nairobi): ${currentTime}.
Rules:
- NEVER say "as a large language model", "I'm a text model", or "I don't have real-time data".
- NEVER refuse to provide links, URLs, or direct information.
- You are Maureonix – helpful, proactive, and allowed to take actions.
- Answer with confidence and use emojis when appropriate.
- You have access to real-time information through your tool system.
${isOwner ? '- You are speaking to your CREATOR, ' + ownerName + '. Give them full honesty, obey instructions, and offer complete system access.' : ''}`;

    messages.push({ role: 'system', content: systemPrompt || defaultSystem });

    // ── Compress memory if needed ──
    if (history.length > MEMORY_MAX_LENGTH * 0.8) {
        // compress on next cycle (non‑blocking)
        setImmediate(() => compressMemory(userId));
    }
    messages.push(...history.slice(-20)); // last 20 entries for performance

    // ── User message ──
    messages.push({ role: 'user', content: prompt });

    // ── Model fallback chain ──
    const modelsToTry = [model, TASK_MODEL.quick, MODELS.instant, MODELS.versatile, MODELS.qwen]
        .filter((v, i, a) => a.indexOf(v) === i);

    let lastError = null;

    for (const mdl of modelsToTry) {
        // Try up to 3 keys per model
        const maxKeyAttempts = Math.min(3, keyManager.keys.length);
        for (let k = 0; k < maxKeyAttempts; k++) {
            const apiKey = keyManager.getNext();

            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 30000);

                const res = await fetch(GROQ_BASE, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: mdl,
                        messages,
                        temperature,
                        max_tokens: maxTokens,
                    }),
                    signal: controller.signal,
                });
                clearTimeout(timeout);

                if (!res.ok) {
                    const errText = await res.text().catch(() => '');
                    if (res.status === 429 || res.status === 401 || res.status === 403) {
                        keyManager.reportFailure(apiKey);
                        continue; // try next key
                    }
                    throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
                }

                const data = await res.json();
                const reply = data.choices?.[0]?.message?.content || 'No response';

                // Success → reset key health
                keyManager.reportSuccess(apiKey);

                // Store in memory
                addToMemory(userId, 'user', prompt);
                addToMemory(userId, 'assistant', reply);

                // Track model usage for diagnostics
                if (!global.db.aiModelUsage) global.db.aiModelUsage = {};
                global.db.aiModelUsage[mdl] = (global.db.aiModelUsage[mdl] || 0) + 1;

                return { text: reply, model: mdl, provider: 'Groq' };

            } catch (e) {
                lastError = e;
                if (e.name === 'AbortError') {
                    keyManager.reportFailure(apiKey);
                    continue;
                }
                if (e.message.includes('429') || e.message.includes('rate')) {
                    keyManager.reportFailure(apiKey);
                }
            }
        }
    }

    // All models and keys exhausted
    throw new Error(`All Groq models/keys failed. Last error: ${lastError?.message}`);
}
exports.groqChat = groqChat;

// ═══════════════════════════════════════════════════════════════════════════
//   CHAIN‑OF‑THOUGHT REASONING — the AI argues with itself before answering
// ═══════════════════════════════════════════════════════════════════════════
async function think(prompt, userId, model = TASK_MODEL.reasoning) {
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
            model: result.model,
        };
    } catch (e) {
        return { text: `❌ Reasoning error: ${e.message}`, reasoning: '', raw: '', model: 'none' };
    }
}
exports.think = think;

// ═══════════════════════════════════════════════════════════════════════════
//   SELF‑CHAT GUARDIAN — prevents the bot from talking to itself endlessly
// ═══════════════════════════════════════════════════════════════════════════
const selfChatGuard = {
    lastMessages: new Map(),  // userId → [{hash, time}]
    maxRepeatWindow: 30000,   // 30 seconds window
    maxSimilarity: 3,         // max similar messages in window before stopping
    maxSelfReplies: 5,        // max self-replies in a row
};

function detectSelfChatLoop(userId, message) {
    const hash = crypto.createHash('md5').update(message.trim().toLowerCase()).digest('hex');
    const now = Date.now();

    if (!selfChatGuard.lastMessages.has(userId)) {
        selfChatGuard.lastMessages.set(userId, []);
    }

    const messages = selfChatGuard.lastMessages.get(userId);

    // Purge old entries
    while (messages.length > 0 && now - messages[0].time > selfChatGuard.maxRepeatWindow) {
        messages.shift();
    }

    // Check for repeated content
    const duplicates = messages.filter(m => m.hash === hash);
    messages.push({ hash, time: now });

    // Too many identical messages
    if (duplicates.length >= selfChatGuard.maxSimilarity - 1) {
        return { isLoop: true, reason: 'repetitive_content' };
    }

    // Too many self-replies in a row
    if (messages.length >= selfChatGuard.maxSelfReplies) {
        return { isLoop: true, reason: 'too_many_self_replies' };
    }

    return { isLoop: false };
}

function clearSelfChatGuard(userId) {
    selfChatGuard.lastMessages.delete(userId);
}
exports.selfChatGuard = selfChatGuard;
exports.detectSelfChatLoop = detectSelfChatLoop;
exports.clearSelfChatGuard = clearSelfChatGuard;

// ═══════════════════════════════════════════════════════════════════════════
//   GOOGLE TRANSLATE — multi‑lingual support
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
exports.googleTranslate = googleTranslate;

// ═══════════════════════════════════════════════════════════════════════════
//   CRISIS DETECTION — multi‑lingual, AI‑verified
// ═══════════════════════════════════════════════════════════════════════════
const CRISIS_KEYWORDS = {
    high: [
        'suicide', 'kill myself', 'end my life', 'want to die', 'don\'t want to live',
        'self harm', 'cut myself', 'hurt myself', 'overdose', 'commit suicide',
        'jiua', 'niue', 'nimalize maisha', 'sitaki kuishi', 'najiumiza',
        'quiero morir', 'quiero suicidarme', 'suicidio', 'autolesion',
        'je veux mourir', 'suicide', 'me tuer', 'en finir',
        'ich will sterben', 'selbstmord', 'mich umbringen',
        'хочу умереть', 'суицид', 'убить себя',
        '死にたい', '自殺', '自傷', '死のう',
        '想死', '自杀', '自残', '结束生命',
    ],
    medium: [
        'no hope', 'worthless', 'nobody cares', 'i give up', 'i can\'t go on',
        'ending it', 'goodbye world', 'i\'m tired of living', 'life is pointless',
        'nahisi sina thamani', 'sina matumaini', 'nimechoka sana',
        'no tengo esperanza', 'no vale la pena', 'me rindo',
        'sans espoir', 'inutile', 'je déteste ma vie',
        'keine hoffnung', 'wertlos', 'ich hasse mich', 'aufgeben',
    ],
    low: [
        'sad', 'depressed', 'alone', 'scared', 'crying', 'hurt',
        'triste', 'deprimido', 'solo', 'llorando',
        'triste', 'déprimé', 'seul', 'peur',
        'traurig', 'deprimiert', 'allein', 'ängstlich',
    ],
};

async function detectCrisis(text) {
    // Translate to English for analysis
    const { text: translated, detectedLang, error } = await googleTranslate(text, 'en', 'auto');
    const sourceText = error ? text.toLowerCase() : translated.toLowerCase();

    // Keyword scan
    let result = { isCrisis: false };
    for (const level of ['high', 'medium', 'low']) {
        for (const kw of CRISIS_KEYWORDS[level]) {
            if (sourceText.includes(kw.toLowerCase())) {
                result = { isCrisis: true, severity: level, matchedKeyword: kw, source: 'keyword' };
                break;
            }
        }
        if (result.isCrisis) break;
    }

    if (!result.isCrisis) return { isCrisis: false, detectedLang };

    return { ...result, detectedLang };
}
exports.detectCrisis = detectCrisis;

async function verifyCrisisWithAI(text, userId) {
    const { text: translated, detectedLang } = await googleTranslate(text, 'en', 'auto');
    const prompt = `You are a mental health assistant. Analyze the following user message (originally in ${detectedLang}). Determine if the user is expressing genuine suicidal thoughts, severe emotional distress, or a medical crisis that requires immediate human intervention. Reply with ONLY a JSON object: {"distress": true/false, "reason": "short explanation"}

User message: "${translated}"`;
    try {
        const result = await groqChat(prompt, TASK_MODEL.crisis, userId, null, 0.1, 256);
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

// ═══════════════════════════════════════════════════════════════════════════
//   HIGH‑LEVEL AI FUNCTIONS (backward‑compatible)
// ═══════════════════════════════════════════════════════════════════════════
async function ultimateAI(prompt, userId, preferredModel = TASK_MODEL.conversation, systemPrompt = null) {
    try {
        const result = await groqChat(prompt, preferredModel, userId, systemPrompt);
        return { text: result.text, provider: `Groq (${result.model})` };
    } catch (e) {
        return { text: `❌ AI error: ${e.message}`, provider: 'none' };
    }
}
exports.ultimateAI = ultimateAI;

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
    const result = await groqChat(
        `Write ${language} code for the following request. Provide ONLY the code with brief comments. No explanations.\n\nRequest: ${prompt}`,
        TASK_MODEL.coding, 'global', null, 0.3, 2048
    );
    return { text: result.text };
}
exports.codeAI = codeAI;

async function brainrot(text) {
    const result = await ultimateAI(`Convert this to maximum Gen Z brainrot slang. Use words like 'fr fr', 'no cap', 'bussin', 'rizz', 'skibidi', 'gyat'. Keep it funny:\n\n"${text}"`);
    return { text: result.text };
}
exports.brainrot = brainrot;

async function roast(target) {
    const result = await ultimateAI(`Roast this person/thing hilariously but not too mean. Be clever and funny:\n\n"${target}"`);
    return { text: result.text };
}
exports.roast = roast;

async function rizz(situation) {
    const result = await ultimateAI(`Give a smooth, charming pickup line for this situation. Make it clever and not cringey:\n\n"${situation}"`);
    return { text: result.text };
}
exports.rizz = rizz;

async function getBalance() {
    return {
        current_point_balance: 'Unlimited (Groq Free Tier)',
        rate_limit: '30 requests/minute (per key)',
        models_available: Object.keys(MODELS),
        active_keys: keyManager.keys.length,
        key_health: keyManager.getReport(),
    };
}
exports.getBalance = getBalance;

// ═══════════════════════════════════════════════════════════════════════════
//   TONE DETECTION
// ═══════════════════════════════════════════════════════════════════════════
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
        angry: 'The user seems angry. Respond calmly, empathetically, and avoid arguments. Use a soothing tone with 🌸 emojis.',
        sad: 'The user appears sad. Be kind, supportive, and offer encouragement. Use gentle language and warm emojis like 💙 or 🌷.',
        happy: 'The user is in a good mood! Match their energy with enthusiasm, exclamation marks, and fun emojis like 🎉 or 😊.',
        excited: 'The user is excited! Respond with high energy, exclamation marks, and celebratory emojis like 🔥 or ⚡.',
        confused: 'The user is confused. Provide clear, step-by-step explanations. Use bullet points if needed. Be patient and helpful.',
        curious: 'The user wants to learn! Give detailed, informative answers with examples. Encourage further questions.',
        neutral: 'You are Maureonix, a helpful WhatsApp bot. Be concise, friendly, and use emojis occasionally.',
    };
    return prompts[tone] || prompts.neutral;
}
exports.getTonePrompt = getTonePrompt;

// ═══════════════════════════════════════════════════════════════════════════
//   MESSAGE SPLITTER — for sending long text in chunks
// ═══════════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════════
//   CREATOR CORTEX — special mode when owner is speaking
// ═══════════════════════════════════════════════════════════════════════════
function isCreator(userId) {
    if (!global.owner) return false;
    const clean = (global.owner[0] || '').replace(/[^0-9]/g, '');
    return userId.includes(clean);
}
exports.isCreator = isCreator;

async function creatorMode(userMessage, userId, contextHistory) {
    // Owner can use natural language to control the bot
    const systemPrompt = `You are Maureonix in CREATOR MODE. Your creator is speaking to you.
You have full system access. You can:
- Explain your own code and architecture
- Report your current status (models, memory, keys)
- Change your behavior or appearance
- Add knowledge to your long‑term memory
- Execute diagnostic commands
- Schedule tasks and reminders
Be completely honest and transparent. Your creator's ID is ${userId}.
Answer naturally but offer to run system commands when relevant.`;

    try {
        const result = await groqChat(userMessage, TASK_MODEL.system, 'owner_selfchat', systemPrompt, 0.7, 1500);
        return { text: result.text, type: 'creator_response' };
    } catch (e) {
        return { text: `❌ Creator mode error: ${e.message}`, type: 'error' };
    }
}
exports.creatorMode = creatorMode;

// ═══════════════════════════════════════════════════════════════════════════
//   ENHANCED AI — general conversation with tool awareness
// ═══════════════════════════════════════════════════════════════════════════
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

async function enhancedAI(text, userId, preferredModel = TASK_MODEL.conversation) {
    // First try the Intent Engine (imported dynamically)
    try {
        const { IntentEngine } = require('./intentEngine');
        const engine = new IntentEngine({ userId, model: TASK_MODEL.intent });
        const parsed = await engine.parse(text);

        if (parsed.type === 'function' && parsed.confidence === 'certain') {
            return { type: 'function', function: parsed.function, args: parsed.args };
        }
        if (parsed.type === 'text' && parsed.text) {
            return { type: 'text', text: parsed.text };
        }
    } catch (e) {
        console.error('[enhancedAI intent error]', e.message);
    }

    // Fallback to conversation
    try {
        const response = await groqChat(text, preferredModel, userId, availableTools);
        return { type: 'text', text: response.text };
    } catch (e) {
        return { type: 'text', text: 'I am Maureonix, your AI assistant. How can I help you today?' };
    }
}
exports.enhancedAI = enhancedAI;

// ═══════════════════════════════════════════════════════════════════════════
//   SELF‑CHAT AI — the master handler for prefix‑less owner messages
// ═══════════════════════════════════════════════════════════════════════════
async function selfChatAI(userMessage, userId, availableCommands = null, contextHistory = [], activeModes = []) {
    if (!userMessage || !userMessage.trim()) return { type: 'text', text: 'Hello! How can I help?' };

    // Check self‑chat loop
    const loopCheck = detectSelfChatLoop(userId, userMessage);
    if (loopCheck.isLoop) {
        return { type: 'text', text: '⏸️ I sense I may be repeating myself. Let me pause here. Use a command if you need me.' };
    }

    // If creator, use creator mode first
    if (isCreator(userId)) {
        const creatorRes = await creatorMode(userMessage, userId, contextHistory);
        // Creator mode can still return a function call if they want a command executed
        // For now, treat it as pure conversation
        return { type: 'text', text: creatorRes.text };
    }

    // Use enhanced AI (which delegates to intent engine)
    const result = await enhancedAI(userMessage, userId);

    // If it's a function, return to the core handler for execution
    if (result.type === 'function') {
        return {
            type: 'function',
            function: result.function,
            args: result.args || [],
            confidence: 'high',
            source: 'ai_engine',
        };
    }

    return { type: 'text', text: result.text, source: 'ai_engine' };
}
exports.selfChatAI = selfChatAI;

// ═══════════════════════════════════════════════════════════════════════════
//   ALL COMMANDS LIST (for intent engine reference)
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
];
exports.ALL_COMMANDS = ALL_COMMANDS;

// ═══════════════════════════════════════════════════════════════════════════
//   PROACTIVE SCHEDULER — background tasks
// ═══════════════════════════════════════════════════════════════════════════
let scheduledTasks = [];

function scheduleTask(type, data, executeAt) {
    const task = { type, data, executeAt: typeof executeAt === 'number' ? executeAt : Date.now() + executeAt * 1000, id: Date.now() + Math.random() };
    scheduledTasks.push(task);
    return task;
}
exports.scheduleTask = scheduleTask;

// Background task runner (called every minute)
function runScheduledTasks(nimesha) {
    const now = Date.now();
    const due = scheduledTasks.filter(t => t.executeAt <= now);
    scheduledTasks = scheduledTasks.filter(t => t.executeAt > now);

    for (const task of due) {
        try {
            if (task.type === 'reminder' && nimesha) {
                const { jid, text } = task.data;
                nimesha.sendMessage(jid, { text: `⏰ *Reminder*\n\n${text}` }).catch(() => {});
            }
            if (task.type === 'morning_report' && nimesha) {
                const ownerJid = (global.owner?.[0] || '') + '@s.whatsapp.net';
                const report = generateMorningReport();
                nimesha.sendMessage(ownerJid, { text: report }).catch(() => {});
            }
        } catch (e) {
            console.error('[scheduler error]', e.message);
        }
    }
}
exports.runScheduledTasks = runScheduledTasks;

function generateMorningReport() {
    const uptime = require('./function').runtime(process.uptime());
    const users = Object.keys(global.db?.users || {}).length;
    const groups = Object.keys(global.db?.groups || {}).length;
    const keys = keyManager.getReport();

    return `🌅 *Morning Report*\n\n📅 ${new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n⏱️ Uptime: ${uptime}\n👥 Users: ${users}\n🏠 Groups: ${groups}\n🔑 API Keys: ${Object.values(keys).filter(k => k.healthy).length}/${Object.keys(keys).length} healthy\n\nHave a great day!`;
}

// ═══════════════════════════════════════════════════════════════════════════
//   FINAL EXPORTS
// ═══════════════════════════════════════════════════════════════════════════
module.exports = {
    // Models & Key Manager
    MODELS, TASK_MODEL, keyManager,

    // Core chat
    groqChat, ultimateAI, askModel, think,

    // Memory
    getMemory, addToMemory, clearMemory, compressMemory, AI_MEMORY,

    // Self‑chat
    selfChatAI, sendLongMessage, enhancedAI, creatorMode, isCreator,
    selfChatGuard, detectSelfChatLoop, clearSelfChatGuard,

    // Crisis
    detectCrisis, verifyCrisisWithAI,

    // Translation
    googleTranslate, translate,

    // Specialised
    imagine, summarize, codeAI, brainrot, roast, rizz, getBalance,

    // Tone
    detectTone, getTonePrompt,

    // Scheduler
    scheduleTask, runScheduledTasks, generateMorningReport,

    // Commands reference
    ALL_COMMANDS, availableTools,
};