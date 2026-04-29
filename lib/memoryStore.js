// lib/memoryStore.js – Maureonix Unified Memory Bridge
// Replaces scattered AI_MEMORY, gemini_history with hyperMemory
// Provides a single API for conversation context and facts

const hyperMemory = require('./ai').hyperMemory;
const crypto = require('crypto');

class MemoryStore {
    constructor() {
        // Map from user/chat ID to language preferences (kept in sync)
        this.languagePrefs = new Map();
    }

    // ── Working Memory (short‑term conversation) ──────────
    addMessage(userId, role, content) {
        // Lower‑level storage in hyperMemory (capped, auto‑flows to episodic)
        hyperMemory.addWorking(userId, role, content);
    }

    getRecentMessages(userId, count = 20) {
        const working = hyperMemory.getWorking(userId);
        // Return plain array of { role, content }
        return working.slice(-count).map(m => ({ role: m.role, content: m.content }));
    }

    // ── Semantic Facts (long‑term knowledge) ──────────────
    storeFact(userId, fact, confidence = 0.9) {
        hyperMemory.addSemantic(userId, fact, confidence);
    }

    recallFacts(userId, query, limit = 5) {
        return hyperMemory.retrieveRelevant(userId, query, limit)
            .filter(m => m.tier === 'semantic')
            .map(m => ({ fact: m.fact, confidence: m.confidence }));
    }

    // ── Gemini‑compatible history bridge ─────────────────
    // (Used by the Gemini auto‑reply block to keep history in the same store)
    appendGeminiMessage(chatId, role, text, isGroup = false) {
        // Store in hyperMemory in a format compatible with generic helpers
        hyperMemory.addWorking(chatId, role, text);
        // Optionally tag for Gemini-specific retrieval (if needed)
        // We hash a marker so that future retrieval can filter if desired.
        // For now, just keep it consistent.
    }

    getGeminiCompatibleHistory(chatId, memSize = 50) {
        // Return array of { role, parts: [{ text }] } for Gemini API
        const raw = hyperMemory.getWorking(chatId).slice(-memSize);
        return raw.map(entry => ({
            role: entry.role === 'assistant' ? 'model' : entry.role,
            parts: [{ text: entry.content }]
        }));
    }

    // ── Full reset ───────────────────────────────────────
    clear(userId) {
        hyperMemory.clear(userId);
        this.languagePrefs.delete(userId);
    }
}

// Singleton
const memoryStore = new MemoryStore();
module.exports = memoryStore;