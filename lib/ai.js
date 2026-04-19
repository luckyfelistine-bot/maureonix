const fetch = require('node-fetch');

// ═══════════════════════════════════════════════════════════════
//   GROQ API CONFIGURATION (Free tier – 30 requests/minute)
// ═══════════════════════════════════════════════════════════════
const GROQ_API_KEY = process.env.GROQ_API_KEY || require('../config').groqApiKey || '';
const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';

// Available Groq models (all free)
const MODELS = {
    fast: 'llama3-8b-8192',      // Fast, good for general chat
    smart: 'llama3-70b-8192',    // More powerful, slightly slower
    mixtral: 'mixtral-8x7b-32768', // Excellent for complex tasks
    gemma: 'gemma2-9b-it'        // Google's lightweight model
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
    const defaultSystem = 'You are Maureonix, a helpful WhatsApp bot created by Infinite Vybeflix. Be concise, friendly, and use emojis occasionally.';
    messages.push({ role: 'system', content: systemPrompt || defaultSystem });
    
    // Add conversation history
    messages.push(...history);
    
    // Add current user message
    messages.push({ role: 'user', content: prompt });
    
    // Try each model in order until one works
    const modelsToTry = [model, MODELS.fast, MODELS.mixtral, MODELS.gemma];
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
            model = MODELS.smart;  // llama3-70b is closest to GPT-4
            break;
        case 'gemini':
            model = MODELS.gemma;  // Gemma is Google's model
            break;
        case 'llama':
        case 'llama3':
            model = MODELS.fast;
            break;
        case 'deepseek':
            model = MODELS.mixtral; // Mixtral is powerful like DeepSeek
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

// ═══════════════════════════════════════════════════════════════
//   EXPORTS
// ═══════════════════════════════════════════════════════════════
module.exports = {
    // Core functions
    groqChat,
    ultimateAI,
    askModel,
    
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
    AI_MEMORY
};