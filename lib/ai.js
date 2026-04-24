const fetch = require('node-fetch');

// ═══════════════════════════════════════════════════════════════
//   GROQ API CONFIGURATION (Free tier – 30 requests/minute)
// ═══════════════════════════════════════════════════════════════
const GROQ_API_KEY = process.env.GROQ_API_KEY || require('../config').groqApiKey || '';
const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';

// ✅ UPDATED: Current working Groq models (verified via API)
const MODELS = {
    // Meta Llama models – all active and fast
    fast: 'llama-3.3-70b-versatile',           // Most reliable for general chat
    smart: 'llama-3.3-70b-versatile',          // Same as fast (no separate 70b needed)
    versatile: 'llama-3.3-70b-versatile',
    instant: 'llama-3.1-8b-instant',           // Very fast, smaller context
    
    // Mixtral – still available
    mixtral: 'mixtral-8x7b-32768',             // Excellent for complex tasks
    
    // DeepSeek distilled model (via Groq)
    deepseek: 'deepseek-r1-distill-llama-70b', // Reasoning model
    
    // Qwen models
    qwen: 'qwen/qwen3-32b',                    // Alibaba's 32B model
    
    // Meta Llama 4 Scout (newer)
    llama4: 'meta-llama/llama-4-scout-17b-16e-instruct',
    
    // Other available models from Groq (fallback options)
    allam: 'allam-2-7b',                       // SDAIA Arabic/English model
    compound: 'groq/compound',                 // Groq's compound model
    compoundMini: 'groq/compound-mini',
    
    // Legacy (kept for reference but may not work)
    gemma: 'gemma2-9b-it',                     // DECOMMISSIONED – will fallback
};

// ═══════════════════════════════════════════════════════════════
//   MEMORY STORAGE (per user conversation history)
// ═══════════════════════════════════════════════════════════════
const AI_MEMORY = new Map();          // userId -> array of messages
const MEMORY_MAX_LENGTH = 20;         // Keep last 20 messages for context

/**
 * Get or create conversation history for a user
 */
function getMemory(userId) {
    if (!AI_MEMORY.has(userId)) {
        AI_MEMORY.set(userId, []);
    }
    return AI_MEMORY.get(userId);
}

/**
 * Add a message to user's history
 */
function addToMemory(userId, role, content) {
    const mem = getMemory(userId);
    mem.push({ role, content });
    // Trim to max length
    if (mem.length > MEMORY_MAX_LENGTH) {
        mem.splice(0, mem.length - MEMORY_MAX_LENGTH);
    }
}

/**
 * Clear a user's conversation memory
 */
function clearMemory(userId) {
    AI_MEMORY.delete(userId);
    return true;
}

// ═══════════════════════════════════════════════════════════════
//   CORE GROQ CHAT FUNCTION (with fallback models)
// ═══════════════════════════════════════════════════════════════
async function groqChat(prompt, model = MODELS.fast, userId = 'global', systemPrompt = null) {
    const history = getMemory(userId);
    
    // Build messages array
    const messages = [];
    
    // System prompt
    const { getCreatorPrompt } = require('./lib/creator_knowledge');
    const creatorPrompt = getCreatorPrompt(userId);
    const defaultSystem = `You are Maureonix, a helpful WhatsApp bot created by Infinite Vybeflix. Be concise, friendly, and use emojis occasionally.\n${creatorPrompt}`;
    messages.push({ role: 'system', content: systemPrompt || defaultSystem });
    
    // Add conversation history
    messages.push(...history);
    
    // Add current user message
    messages.push({ role: 'user', content: prompt });
    
    // ✅ UPDATED: Fallback chain using only active models from Groq API
    const modelsToTry = [
        model,
        MODELS.fast,
        MODELS.instant,
        MODELS.mixtral,
        MODELS.qwen,
        MODELS.llama4,
        MODELS.allam,
        MODELS.compound
    ].filter((v, i, a) => a.indexOf(v) === i); // remove duplicates
    
    let lastError = null;
    
    for (const mdl of modelsToTry) {
        try {
            const res = await fetch(GROQ_BASE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: mdl,
                    messages,
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errText}`);
            }

            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content || 'No response';
            
            // Store in memory
            addToMemory(userId, 'user', prompt);
            addToMemory(userId, 'assistant', reply);
            
            return { text: reply, model: mdl, provider: 'Groq' };
            
        } catch (e) {
            lastError = e;
            // Continue to next model
        }
    }
    
    throw new Error(`All Groq models failed. Last error: ${lastError?.message}`);
}

// ═══════════════════════════════════════════════════════════════
//   ULTIMATE AI (smart fallback chain)
// ═══════════════════════════════════════════════════════════════
async function ultimateAI(prompt, userId, preferredModel = MODELS.smart) {
    try {
        const result = await groqChat(prompt, preferredModel, userId);
        return { text: result.text, provider: `Groq (${result.model})` };
    } catch (e) {
        return { text: `❌ AI error: ${e.message}`, provider: 'none' };
    }
}

// ═══════════════════════════════════════════════════════════════
//   SPECIALIZED AI FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * AI Image Generation (free via Pollinations)
 */
async function imagine(prompt) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&width=1024&height=1024`;
}

/**
 * Translate text using Google Translate (free)
 */
async function translate(text, targetLang, sourceLang = 'auto') {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
}

/**
 * Summarize long text
 */
async function summarize(text) {
    const result = await ultimateAI(`Summarize this concisely in 3-4 sentences:\n\n${text.substring(0, 4000)}`);
    return result.text;
}

/**
 * Generate code in any language
 */
async function codeAI(prompt, language = 'javascript') {
    const result = await ultimateAI(
        `Write ${language} code for the following request. Provide ONLY the code with brief comments. No explanations.\n\nRequest: ${prompt}`,
        null,
        MODELS.smart
    );
    return { text: result.text };
}

/**
 * Convert text to brainrot (Gen Z slang)
 */
async function brainrot(text) {
    const result = await ultimateAI(
        `Convert this to maximum Gen Z brainrot slang. Use words like 'fr fr', 'no cap', 'bussin', 'rizz', 'skibidi', 'gyat'. Keep it funny:\n\n"${text}"`,
        null,
        MODELS.fast
    );
    return { text: result.text };
}

/**
 * AI-generated roast
 */
async function roast(target) {
    const result = await ultimateAI(
        `Roast this person/thing hilariously but not too mean. Be clever and funny:\n\n"${target}"`,
        null,
        MODELS.fast
    );
    return { text: result.text };
}

/**
 * Generate a pickup line (rizz)
 */
async function rizz(situation) {
    const result = await ultimateAI(
        `Give a smooth, charming pickup line for this situation. Make it clever and not cringey:\n\n"${situation}"`,
        null,
        MODELS.fast
    );
    return { text: result.text };
}

/**
 * Ask a specific Groq model directly (for .gpt, .gemini, .llama, .deepseek commands)
 */
async function askModel(prompt, modelName, userId) {
    let model;
    switch (modelName.toLowerCase()) {
        case 'gpt':
        case 'chatgpt':
            model = MODELS.smart;  // llama-3.3-70b-versatile
            break;
        case 'gemini':
            model = MODELS.gemma;  // may fail, fallback will catch
            break;
        case 'llama':
        case 'llama3':
            model = MODELS.fast;
            break;
        case 'deepseek':
            model = MODELS.deepseek;
            break;
        case 'qwen':
            model = MODELS.qwen;
            break;
        default:
            model = MODELS.fast;
    }
    return await groqChat(prompt, model, userId);
}

/**
 * Get API usage stats (mock – Groq free tier is unlimited within rate limits)
 */
async function getBalance() {
    return {
        current_point_balance: 'Unlimited (Groq Free Tier)',
        rate_limit: '30 requests/minute',
        models_available: Object.keys(MODELS)
    };
}

// ==================== INTENT DETECTION ====================
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
        if (triggers.some(t => lower.includes(t))) {
            return cmd;
        }
    }
    return null;
}

// ==================== AI FUNCTION CALLING ====================
const availableTools = `
You have access to these internal functions. When a user request matches, respond with ONLY the function call in this format:
[FUNCTION:functionName|arg1|arg2|...]

Available functions:
- menu → show command menu
- ping → check bot speed
- sticker → create sticker (user must provide media)
- song|query → download YouTube audio
- video|url → download YouTube video
- tiktok|url → download TikTok
- instagram|url → download Instagram
- google|query → search Google
- translate|lang|text → translate text
- weather|city → get weather
- joke → tell a joke
- meme → send meme
- quote → send quote
- play|query → play audio
- rpg|action → RPG game (fight/heal/spawn)
- daily → claim daily reward
- balance → check balance
- roulette|amount|choice → play roulette
- remindme|minutes|message → set reminder
- bmi|kg|cm → calculate BMI
- movie|title → search movie
- add|number → add member to group
- kick|number → kick from group
- tagall|message → tag all members

If no function matches, respond normally as Maureonix.
`;

// ==================== ENHANCED ULTIMATE AI ====================
async function enhancedAI(text, userId, preferredModel = 'deepseek') {
    // Step 1: Check for direct intent match
    const intent = detectIntent(text);
    if (intent) {
        return { type: 'function', function: intent, args: [] };
    }

    // Step 2: Use AI to decide function calling
    const systemPrompt = availableTools;
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
    ];

    try {
        const response = await ultimateAI(JSON.stringify(messages), userId, preferredModel);
        const responseText = response.text || '';

        // Check if AI returned a function call
        const funcMatch = responseText.match(/\[FUNCTION:(\w+)(?:\|(.+))?\]/);
        if (funcMatch) {
            const func = funcMatch[1];
            const args = funcMatch[2] ? funcMatch[2].split('|') : [];
            return { type: 'function', function: func, args };
        }

        return { type: 'text', text: responseText };
    } catch (e) {
        // Fallback: simple conversational response
        try {
            const res = await askModel(text, 'deepseek', userId);
            return { type: 'text', text: res.text };
        } catch {
            return { type: 'text', text: 'I am Maureonix, your AI assistant. How can I help you today?' };
        }
    }
}

// ==================== UNLIMITED RESPONSE (SPLIT LONG MESSAGES) ====================
async function sendLongMessage(sock, jid, text, options = {}) {
    const MAX_LENGTH = 3800;
    if (text.length <= MAX_LENGTH) {
        return sock.sendMessage(jid, { text }, options);
    }
    const chunks = [];
    for (let i = 0; i < text.length; i += MAX_LENGTH) {
        chunks.push(text.slice(i, i + MAX_LENGTH));
    }
    for (let i = 0; i < chunks.length; i++) {
        await sock.sendMessage(jid, { text: `(${i + 1}/${chunks.length})\n${chunks[i]}` }, options);
        await new Promise(r => setTimeout(r, 500));
    }
}

// ═══════════════════════════════════════════════════════════════
//   EXPORTS
// ═══════════════════════════════════════════════════════════════
module.exports = {
    // Core functions
    groqChat,
    ultimateAI,
    askModel,
    detectTone,       // <-- must be here
    getTonePrompt,    // <-- must be here
    
    // Specialized
    imagine,
    translate,
    summarize,
    codeAI,
    brainrot,
    roast,
    rizz,
    
    // Utilities
    clearMemory,
    getBalance,
    getMemory,
    addToMemory,
    
    // Expose models
    MODELS,
    AI_MEMORY,
    ...module.exports,
    detectIntent,
    enhancedAI,
    sendLongMessage,
    availableTools

};