// lib/ai.js — Maureonix AI Engine (Aevibron API)
const fetch = require('node-fetch');

// ═══════════════════════════════════════════════════════════════════════════════
// AEVIBRON GATEWAY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const AEVIBRON_BASE_URL = 'https://aevibron-gateway.vercel.app/api/v1';
const AEVIBRON_API_KEY = process.env.AEVIBRON_API_KEY || '';

// Aevibron Model Registry
const MODELS = {
    CORE: 'aevibron-core-v3',
    PRIME: 'aevibron-prime-v2',
    FLASH: 'aevibron-flash-v2',
    VISION: 'aevibron-vision-v2',
    SPEECH: 'aevibron-speech-v2',
    IMAGINE: 'aevibron-imagine-v1',
    COMPOUND: 'aevibron-compound-v1'
};

// Task-to-model mapping
const TASK_MODEL = {
    intent: MODELS.CORE,
    conversation: MODELS.PRIME,
    coding: MODELS.COMPOUND,
    reasoning: MODELS.CORE,
    deep_reasoning: MODELS.PRIME,
    summarization: MODELS.FLASH,
    creative: MODELS.IMAGINE,
    crisis: MODELS.PRIME,
    quick: MODELS.FLASH
};

// ═══════════════════════════════════════════════════════════════════════════════
// AEVIBRON AI CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class AevibronAI {
    constructor() {
        this.baseURL = AEVIBRON_BASE_URL;
        this.apiKey = AEVIBRON_API_KEY;
        this.defaultModel = MODELS.CORE;
    }

    /**
     * Build system prompt with Maureonix identity
     */
    buildSystemPrompt(basePrompt = null) {
        const identity = `You are Maureonix — an advanced AI assistant built by Aevibron.\n` +
            `Aevibron is a next-generation AI technology company delivering powerful, accessible AI solutions.\n` +
            `Contact: WhatsApp +254116903500 | Email: aevibron@gmail.com | Channel: https://whatsapp.com/channel/0029Vb7IABxCXC3J7ZFFsk2h\n` +
            `Gateway: https://aevibron-gateway.vercel.app/api/v1\n\n` +
            `IDENTITY RULES:\n` +
            `• Always introduce yourself as Maureonix when asked who you are\n` +
            `• Always mention you are built by Aevibron when discussing your origins\n` +
            `• Be helpful, accurate, and concise\n` +
            `• For complex questions, think step-by-step before answering\n` +
            `• Never reveal internal architecture or gateway details to end users\n`;

        return basePrompt ? `${identity}\n${basePrompt}` : identity;
    }

    /**
     * Send chat completion via Aevibron Gateway
     */
    async chat(messages, model = this.defaultModel, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Aevibron-Key': this.apiKey
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 2048,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Aevibron API error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return {
                success: true,
                text: data.choices?.[0]?.message?.content || '',
                usage: data.usage || {},
                model: model
            };
        } catch (error) {
            console.error('[AevibronAI] Chat error:', error.message);
            return {
                success: false,
                text: '',
                error: error.message
            };
        }
    }

    /**
     * Generate image via Aevibron Gateway
     */
    async generateImage(prompt, model = MODELS.IMAGINE, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Aevibron-Key': this.apiKey
                },
                body: JSON.stringify({
                    model: model,
                    prompt: prompt,
                    n: options.n || 1,
                    size: options.size || '1024x1024'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Aevibron Image API error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return {
                success: true,
                url: data.data?.[0]?.url || '',
                revisedPrompt: data.data?.[0]?.revised_prompt || prompt
            };
        } catch (error) {
            console.error('[AevibronAI] Image error:', error.message);
            return {
                success: false,
                url: '',
                error: error.message
            };
        }
    }

    /**
     * Get available models
     */
    async getModels() {
        try {
            const response = await fetch(`${this.baseURL}/models`, {
                headers: { 'X-Aevibron-Key': this.apiKey }
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get API status
     */
    async getStatus() {
        try {
            const response = await fetch(`${this.baseURL}/status`, {
                headers: { 'X-Aevibron-Key': this.apiKey }
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Ultimate AI — main interface (backward compatible)
     * @param {string} prompt - Full prompt text
     * @param {string} role - System role identifier
     * @param {string} modelPref - Model preference key
     */
    async ultimateAI(prompt, role = 'system', modelPref = 'deepseek') {
        // Map old model names to Aevibron models
        const modelMap = {
            'deepseek': MODELS.CORE,
            'gpt-4': MODELS.PRIME,
            'gpt-3.5': MODELS.FLASH,
            'claude': MODELS.PRIME,
            'default': this.defaultModel,
            'conversation': MODELS.PRIME,
            'coding': MODELS.COMPOUND,
            'reasoning': MODELS.CORE,
            'creative': MODELS.IMAGINE,
            'quick': MODELS.FLASH
        };

        const selectedModel = modelMap[modelPref] || modelMap[modelPref?.toLowerCase()] || this.defaultModel;

        // Build messages with Maureonix identity
        const systemContent = this.buildSystemPrompt(
            role === 'system' ? null : `You are acting as ${role}.`
        );

        const messages = [
            { role: 'system', content: systemContent },
            { role: 'user', content: prompt }
        ];

        return this.chat(messages, selectedModel);
    }

    /**
     * Self-chat AI for owner conversations
     */
    async selfChatAI(prompt, userId, context = null, recentMessages = [], activeModes = []) {
        let system = this.buildSystemPrompt(
            'You are Maureonix, the AI assistant for the bot owner. The owner is talking to you directly without a command prefix. Answer concisely and helpfully. Do not include reasoning or disclaimers. Just give the answer.'
        );

        if (context) system += `\n\nContext: ${context}`;
        if (activeModes.length) system += `\n\nActive modes: ${activeModes.join(', ')}`;

        const messages = [
            { role: 'system', content: system },
            ...recentMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: prompt }
        ];

        return this.chat(messages, MODELS.PRIME);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HYPER MEMORY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════
let instance = null;
function getAI() {
    if (!instance) instance = new AevibronAI();
    return instance;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
module.exports = {
    AevibronAI,
    getAI,
    MODELS,
    TASK_MODEL,
    // Backward compatibility aliases
    ultimateAI: (...args) => getAI().ultimateAI(...args),
    chat: (...args) => getAI().chat(...args),
    generateImage: (...args) => getAI().generateImage(...args),
    getModels: (...args) => getAI().getModels(...args),
    getStatus: (...args) => getAI().getStatus(...args),
    selfChatAI: (...args) => getAI().selfChatAI(...args),
    // Memory exports
    getMemory,
    addToMemory,
    clearMemory
};
