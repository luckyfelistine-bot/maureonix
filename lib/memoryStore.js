// lib/memoryStore.js – Maureonix Persistent Memory Bridge
// Short‑term: hyperMemory (in‑memory, fast)
// Long‑term:  memories/  (disk, editable, self‑cleaning)

const fs = require('fs');
const path = require('path');
const hyperMemory = require('./ai').hyperMemory;

const PROJECT_ROOT = path.join(__dirname, '..');
const MEMORIES_DIR = path.join(PROJECT_ROOT, 'memories');
const CORE_DIR = path.join(MEMORIES_DIR, 'core');
const USERS_DIR = path.join(MEMORIES_DIR, 'users');

[ MEMORIES_DIR, CORE_DIR, USERS_DIR ].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// In‑memory cache for user facts (avoids constant disk I/O)
const userMemoryCache = new Map();
// In‑memory owner memory (always loaded)
let ownerMemoryCache = null;

class MemoryStore {
    constructor() {
        this.languagePrefs = new Map();
        // Load owner core memories once
        ownerMemoryCache = this.loadOwnerMemories();
    }

    // ════════════ Owner Permanent Memories (Markdown files) ════════════
    loadOwnerMemories() {
        const coreFiles = ['SOUL.md', 'MEMORY.md', 'HEARTBEAT.md'];
        const memories = {};
        for (const file of coreFiles) {
            const filePath = path.join(CORE_DIR, file);
            if (fs.existsSync(filePath)) {
                memories[file] = fs.readFileSync(filePath, 'utf8');
            } else {
                memories[file] = '';
            }
        }
        return memories;
    }

    /** Save a single core memory file (used by write_file command) */
    saveOwnerMemory(filename, content) {
        const filePath = path.join(CORE_DIR, filename);
        fs.writeFileSync(filePath, content, 'utf8');
        if (ownerMemoryCache) ownerMemoryCache[filename] = content;
        console.log(`[MemoryStore] Updated owner memory: ${filename}`);
    }

    /** Append to a core memory file */
    appendOwnerMemory(filename, content) {
        const filePath = path.join(CORE_DIR, filename);
        fs.appendFileSync(filePath, content + '\n', 'utf8');
        if (ownerMemoryCache) {
            ownerMemoryCache[filename] = (ownerMemoryCache[filename] || '') + content + '\n';
        }
        console.log(`[MemoryStore] Appended to owner memory: ${filename}`);
    }

    getOwnerCoreMemories() {
        return ownerMemoryCache || this.loadOwnerMemories();
    }

    /** Return a formatted string of owner memories for the system prompt */
    getOwnerMemoryPrompt() {
        const mem = this.getOwnerCoreMemories();
        let prompt = '';
        if (mem['SOUL.md'] && mem['SOUL.md'].trim()) {
            prompt += `\n**My Creator's Soul (SOUL.md):**\n${mem['SOUL.md'].substring(0, 2000)}\n`;
        }
        if (mem['MEMORY.md'] && mem['MEMORY.md'].trim()) {
            prompt += `\n**My Permanent Memory (MEMORY.md):**\n${mem['MEMORY.md'].substring(0, 2000)}\n`;
        }
        if (mem['HEARTBEAT.md'] && mem['HEARTBEAT.md'].trim()) {
            prompt += `\n**My Heartbeat Log (HEARTBEAT.md):**\n${mem['HEARTBEAT.md'].substring(0, 500)}\n`;
        }
        return prompt;
    }

    // ════════════ User Long‑Term Memories (JSON files) ════════════
    _getUserFilePath(userId) {
        // Sanitize userId to a safe filename
        const safe = userId.replace(/[^a-zA-Z0-9\-_@.]/g, '_');
        return path.join(USERS_DIR, `${safe}.json`);
    }

    loadUserMemory(userId) {
        if (userMemoryCache.has(userId)) return userMemoryCache.get(userId);

        const filePath = this._getUserFilePath(userId);
        let data = {};
        if (fs.existsSync(filePath)) {
            try { data = JSON.parse(fs.readFileSync(filePath, 'utf8')); }
            catch { data = {}; }
        }
        userMemoryCache.set(userId, data);
        return data;
    }

    saveUserMemory(userId, data) {
        userMemoryCache.set(userId, data);
        const filePath = this._getUserFilePath(userId);
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (e) {
            console.error(`[MemoryStore] Failed to save user memory for ${userId}:`, e.message);
        }
    }

    /** Set a specific fact for a user */
    setUserFact(userId, key, value) {
        const mem = this.loadUserMemory(userId);
        mem[key] = value;
        mem._lastModified = Date.now();
        this.saveUserMemory(userId, mem);
    }

    /** Get a specific fact */
    getUserFact(userId, key) {
        const mem = this.loadUserMemory(userId);
        return mem[key] || null;
    }

    /** Delete a user's memory file (e.g., after long inactivity) */
    deleteUserMemory(userId) {
        userMemoryCache.delete(userId);
        const filePath = this._getUserFilePath(userId);
        try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
    }

    /** Clean up old user memories (inactive > 7 days) */
    cleanupOldMemories() {
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const files = fs.readdirSync(USERS_DIR);
        for (const file of files) {
            const filePath = path.join(USERS_DIR, file);
            try {
                const stats = fs.statSync(filePath);
                if (now - stats.mtimeMs > sevenDays) {
                    fs.unlinkSync(filePath);
                    // Remove from cache if present
                    for (const [key, val] of userMemoryCache) {
                        if (this._getUserFilePath(key) === filePath) {
                            userMemoryCache.delete(key);
                            break;
                        }
                    }
                }
            } catch (e) {}
        }
        console.log('[MemoryStore] User memory cleanup completed');
    }

    // ════════════ Short‑Term Working Memory (HyperMemory) ════════════
    addMessage(userId, role, content) {
        hyperMemory.addWorking(userId, role, content);
    }

    getRecentMessages(userId, count = 20) {
        const working = hyperMemory.getWorking(userId);
        return working.slice(-count).map(m => ({ role: m.role, content: m.content }));
    }

    storeFact(userId, fact, confidence = 0.9) {
        hyperMemory.addSemantic(userId, fact, confidence);
    }

    recallFacts(userId, query, limit = 5) {
        return hyperMemory.retrieveRelevant(userId, query, limit)
            .filter(m => m.tier === 'semantic')
            .map(m => ({ fact: m.fact, confidence: m.confidence }));
    }

    // Gemini‑compatible history (unchanged)
    appendGeminiMessage(chatId, role, text, isGroup = false) {
        hyperMemory.addWorking(chatId, role, text);
    }

    getGeminiCompatibleHistory(chatId, memSize = 50) {
        const raw = hyperMemory.getWorking(chatId).slice(-memSize);
        return raw.map(entry => ({
            role: entry.role === 'assistant' ? 'model' : entry.role,
            parts: [{ text: entry.content }]
        }));
    }

    clear(userId) {
        hyperMemory.clear(userId);
        this.languagePrefs.delete(userId);
    }
}

// Singleton
const memoryStore = new MemoryStore();
module.exports = memoryStore;
