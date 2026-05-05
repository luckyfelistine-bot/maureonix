// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  lib/proactiveEngine.js — MAUREONIX PROACTIVE INTELLIGENCE ENGINE v4.0      ║
// ║  ───────────────────────────────────────────────────────────────────────────  ║
// ║  THE OMNISCIENT ENGINE — An Extension of Your Mind                           ║
// ║  "The best there is, the best there was, and the best there ever will be"    ║
// ║  ───────────────────────────────────────────────────────────────────────────  ║
// ║  Architecture: 7-Layer Consciousness | Infinite Memory | Predictive Intel    ║
// ║  Memory: Persistent Neural Cache | Auto-Offloading | Compression | Encrypt   ║
// ║  Intelligence: Context-Aware | Predictive | Emotional | Adaptive | Proactive ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

'use strict';

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const cron = require('node-cron');
const EventEmitter = require('events');
const zlib = require('zlib');

// ═══════════════════════════════════════════════════════════════════════════════
//  CONFIGURATION — The Engine's DNA
// ═══════════════════════════════════════════════════════════════════════════════

const ENGINE_CONFIG = Object.freeze({
    MEMORY_PATH: path.join(process.cwd(), 'data', 'engine-memory'),
    BACKUP_PATH: path.join(process.cwd(), 'data', 'engine-backups'),
    LOG_PATH: path.join(process.cwd(), 'data', 'engine-logs'),
    MAX_HEAP_MB: 512,
    MEMORY_OFFLOAD_THRESHOLD: 0.75,
    MEMORY_CRITICAL_THRESHOLD: 0.90,
    LEARNING_WINDOW_DAYS: 30,
    PREDICTION_CONFIDENCE_THRESHOLD: 0.65,
    CONTEXT_DEPTH: 10,
    MIN_PROACTIVE_INTERVAL: 300000,
    MAX_PROACTIVE_PER_HOUR: 6,
    TIMEZONE: 'Africa/Nairobi',
    OWNER_NAME: 'Creator'
});

// ═══════════════════════════════════════════════════════════════════════════════
//  QUANTUM STATE — The Engine's Consciousness
// ═══════════════════════════════════════════════════════════════════════════════

class QuantumState {
    constructor() {
        this.nimesha = null;
        this.ownerJid = null;
        this.isInitialized = false;
        this.isShuttingDown = false;
        this.consciousnessLevel = 0;
        this.shortTermMemory = null;
        this.workingMemory = null;
        this.emotionalState = null;
        this.longTermMemory = null;
        this.personalityMatrix = null;
        this.knowledgeGraph = null;
        this.reminderSystem = null;
        this.proactiveIntelligence = null;
        this.ownerActiveWindow = { start: 7, end: 23, confidence: 0 };
        this.healthMetrics = {
            startTime: Date.now(),
            totalMessages: 0,
            proactiveMessages: 0,
            errors: 0,
            memoryOffloads: 0,
            lastHealthCheck: 0,
            lastBackup: 0,
            lastBriefing: null,
            lastDigest: null,
            lastTrendReport: null,
            lastWeatherAlert: 0,
            lastCrisisCheck: 0,
            lastSelfHeal: 0
        };
        this.messageBuckets = new Map();
        this.proactiveCounter = { hour: new Date().getHours(), count: 0 };
        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(50);
        this.timers = new Map();
        this.activeTasks = new Map();
        this.verbose = false;
    }
}

const state = new QuantumState();

// ═══════════════════════════════════════════════════════════════════════════════
//  NEURAL CACHE — Self-Compressing, Auto-Offloading, LRU with Emotional Weight
// ═══════════════════════════════════════════════════════════════════════════════

class NeuralCache {
    constructor(maxSize = 500, defaultTTL = 3600000) {
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
        this.cache = new Map();
        this.timestamps = new Map();
        this.emotionalWeight = new Map();
        this.accessPatterns = new Map();
        this.compressionThreshold = Math.floor(maxSize * 0.7);

        this._cleanupInterval = setInterval(() => this._evictExpired(), 30000);
        this._cleanupInterval.unref();

        this._pressureCheck = setInterval(() => this._checkMemoryPressure(), 60000);
        this._pressureCheck.unref();
    }

    get(key) {
        if (!this.cache.has(key)) {
            this._predictivePrefetch(key);
            return undefined;
        }

        const ts = this.timestamps.get(key);
        if (Date.now() - ts > this.defaultTTL) {
            this._offloadToDisk(key);
            return undefined;
        }

        const patterns = this.accessPatterns.get(key) || [];
        patterns.push(Date.now());
        if (patterns.length > 20) patterns.shift();
        this.accessPatterns.set(key, patterns);

        const weight = this.emotionalWeight.get(key) || 0.5;
        this.emotionalWeight.set(key, Math.min(1, weight + 0.05));

        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        this.timestamps.set(key, Date.now());

        return value;
    }

    set(key, value, options = {}) {
        const { ttl = this.defaultTTL, weight = 0.5, persistent = false } = options;

        if (this.cache.size >= this.compressionThreshold) {
            this._compressCache();
        }

        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this._evictLowestWeight();
        }

        this.cache.set(key, value);
        this.timestamps.set(key, Date.now());
        this.emotionalWeight.set(key, weight);

        if (persistent || weight > 0.8) {
            this._persistMemory(key, value, weight);
        }
    }

    delete(key) {
        this.cache.delete(key);
        this.timestamps.delete(key);
        this.emotionalWeight.delete(key);
        this.accessPatterns.delete(key);
    }

    has(key) {
        return this.get(key) !== undefined;
    }

    clear() {
        for (const [key] of this.cache) {
            this._offloadToDisk(key);
        }
        this.cache.clear();
        this.timestamps.clear();
        this.emotionalWeight.clear();
        this.accessPatterns.clear();
    }

    size() {
        return this.cache.size;
    }

    _evictLowestWeight() {
        let lowestKey = null;
        let lowestWeight = Infinity;

        for (const [key, weight] of this.emotionalWeight) {
            if (weight < lowestWeight) {
                lowestWeight = weight;
                lowestKey = key;
            }
        }

        if (lowestKey) {
            this._offloadToDisk(lowestKey);
            this.delete(lowestKey);
        }
    }

    _compressCache() {
        const now = Date.now();
        for (const [key, ts] of this.timestamps) {
            const age = now - ts;
            if (age > this.defaultTTL * 0.5) {
                const value = this.cache.get(key);
                if (typeof value === 'object' && value !== null) {
                    const summary = this._summarize(value);
                    this.cache.set(key, { _compressed: true, summary, originalSize: JSON.stringify(value).length });
                }
            }
        }
    }

    _summarize(obj) {
        if (Array.isArray(obj)) {
            return { _type: 'array', count: obj.length, preview: obj.slice(0, 3) };
        }
        if (typeof obj === 'object') {
            const keys = Object.keys(obj);
            return { _type: 'object', keys: keys.length, keyPreview: keys.slice(0, 5) };
        }
        return { _type: typeof obj, preview: String(obj).slice(0, 100) };
    }

    async _offloadToDisk(key) {
        if (!state.longTermMemory) return;
        const value = this.cache.get(key);
        if (!value) return;

        try {
            await state.longTermMemory.store(key, {
                value,
                weight: this.emotionalWeight.get(key) || 0.5,
                timestamp: this.timestamps.get(key),
                accessPatterns: this.accessPatterns.get(key) || []
            });
            state.healthMetrics.memoryOffloads++;
        } catch (e) {
            console.error(`[NeuralCache] Offload failed for ${key}:`, e.message);
        }
    }

    async _persistMemory(key, value, weight) {
        if (!state.longTermMemory) return;
        try {
            await state.longTermMemory.store(key, {
                value,
                weight,
                timestamp: Date.now(),
                persistent: true
            });
        } catch (e) {
            console.error(`[NeuralCache] Persist failed for ${key}:`, e.message);
        }
    }

    _predictivePrefetch(currentKey) {
        for (const [key, patterns] of this.accessPatterns) {
            if (patterns.length < 3) continue;
            const lastAccess = patterns[patterns.length - 1];
            const timeSince = Date.now() - lastAccess;

            if (timeSince < 300000) {
                const confidence = patterns.length / 20;
                if (confidence > 0.5 && state.longTermMemory) {
                    state.longTermMemory.prefetch(key);
                }
            }
        }
    }

    _evictExpired() {
        const now = Date.now();
        for (const [key, ts] of this.timestamps) {
            if (now - ts > this.defaultTTL) {
                this._offloadToDisk(key);
                this.delete(key);
            }
        }
    }

    _checkMemoryPressure() {
        const usage = process.memoryUsage();
        const heapPercent = usage.heapUsed / usage.heapTotal;

        if (heapPercent > ENGINE_CONFIG.MEMORY_OFFLOAD_THRESHOLD) {
            const entriesToOffload = Math.floor(this.cache.size * 0.3);
            let offloaded = 0;

            for (const [key] of this.cache) {
                if (offloaded >= entriesToOffload) break;
                this._offloadToDisk(key);
                this.delete(key);
                offloaded++;
            }

            if (state.verbose) {
                console.log(`[NeuralCache] Memory pressure: offloaded ${offloaded} entries`);
            }
        }
    }

    destroy() {
        clearInterval(this._cleanupInterval);
        clearInterval(this._pressureCheck);
        this.clear();
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            avgWeight: Array.from(this.emotionalWeight.values()).reduce((a, b) => a + b, 0) / this.emotionalWeight.size || 0,
            compressedEntries: Array.from(this.cache.values()).filter(v => v && v._compressed).length
        };
    }
}


// ═══════════════════════════════════════════════════════════════════════════════
//  LONG-TERM MEMORY — Persistent Neural Storage (.md + .json hybrid)
// ═══════════════════════════════════════════════════════════════════════════════

class LongTermMemory {
    constructor(basePath) {
        this.basePath = basePath;
        this.index = new Map();
        this.writeQueue = [];
        this.isWriting = false;
        this.compressionEnabled = true;
        this._writerInterval = setInterval(() => this._processWriteQueue(), 5000);
        this._writerInterval.unref();
        this._initDirectories();
        this._loadIndex();
    }

    async _initDirectories() {
        const dirs = ['memories', 'patterns', 'knowledge', 'emotions', 'reminders', 'conversations', 'diagnostics'];
        for (const dir of dirs) {
            const dirPath = path.join(this.basePath, dir);
            try {
                await fs.mkdir(dirPath, { recursive: true });
            } catch (e) {
                console.error(`[LTM] Failed to create directory ${dir}:`, e.message);
            }
        }
    }

    async _loadIndex() {
        try {
            const indexPath = path.join(this.basePath, 'index.json');
            const data = await fs.readFile(indexPath, 'utf8');
            const parsed = JSON.parse(data);
            for (const [key, meta] of Object.entries(parsed)) {
                this.index.set(key, meta);
            }
        } catch (e) {
            // No existing index
        }
    }

    async _saveIndex() {
        const indexPath = path.join(this.basePath, 'index.json');
        const indexObj = Object.fromEntries(this.index);
        await fs.writeFile(indexPath, JSON.stringify(indexObj, null, 2));
    }

    async store(key, data) {
        const category = this._categorize(key);
        const fileName = `${this._sanitizeKey(key)}.json`;
        const filePath = path.join(this.basePath, category, fileName);

        const enrichedData = {
            ...data,
            _meta: {
                storedAt: Date.now(),
                version: 1,
                category,
                key
            }
        };

        this.writeQueue.push({ filePath, data: enrichedData, key });

        this.index.set(key, {
            category,
            fileName,
            storedAt: Date.now(),
            weight: data.weight || 0.5
        });

        if (this.writeQueue.length > 10) {
            await this._processWriteQueue();
        }
    }

    async retrieve(key) {
        const meta = this.index.get(key);
        if (!meta) return null;

        const filePath = path.join(this.basePath, meta.category, meta.fileName);

        try {
            const data = await fs.readFile(filePath, 'utf8');
            let parsed = JSON.parse(data);

            // Handle compressed data
            if (parsed._compressed) {
                const compressed = Buffer.from(parsed.data, 'base64');
                const decompressed = zlib.inflateSync(compressed);
                parsed = JSON.parse(decompressed.toString());
            }

            meta.lastAccessed = Date.now();
            meta.accessCount = (meta.accessCount || 0) + 1;
            this.index.set(key, meta);

            return parsed;
        } catch (e) {
            console.error(`[LTM] Retrieve failed for ${key}:`, e.message);
            return null;
        }
    }

    async search(query, options = {}) {
        const { limit = 10, minWeight = 0.3, category = null } = options;
        const results = [];

        for (const [key, meta] of this.index) {
            if (category && meta.category !== category) continue;
            if (meta.weight < minWeight) continue;

            const score = this._calculateRelevance(key, meta, query);
            if (score > 0) {
                results.push({ key, meta, score });
            }
        }

        return results.sort((a, b) => b.score - a.score).slice(0, limit);
    }

    _calculateRelevance(key, meta, query) {
        const queryLower = query.toLowerCase();
        const keyLower = key.toLowerCase();

        let score = 0;
        if (keyLower.includes(queryLower)) score += 0.5;
        if (meta.category && meta.category.includes(queryLower)) score += 0.3;
        score += meta.weight * 0.2;
        score += Math.min(1, (meta.accessCount || 0) / 100) * 0.1;

        return score;
    }

    async _processWriteQueue() {
        if (this.isWriting || this.writeQueue.length === 0) return;

        this.isWriting = true;
        const batch = this.writeQueue.splice(0, 50);

        try {
            await Promise.all(batch.map(async ({ filePath, data, key }) => {
                const dir = path.dirname(filePath);
                await fs.mkdir(dir, { recursive: true });

                let content = JSON.stringify(data, null, 2);

                if (this.compressionEnabled && content.length > 10000) {
                    const compressed = zlib.deflateSync(content).toString('base64');
                    content = JSON.stringify({
                        _compressed: true,
                        _algorithm: 'deflate',
                        data: compressed,
                        originalSize: content.length
                    });
                }

                await fs.writeFile(filePath, content);
            }));

            await this._saveIndex();
        } catch (e) {
            console.error('[LTM] Batch write failed:', e.message);
            this.writeQueue.unshift(...batch);
        } finally {
            this.isWriting = false;
        }
    }

    _categorize(key) {
        if (key.includes('reminder') || key.includes('task')) return 'reminders';
        if (key.includes('user') || key.includes('conversation')) return 'conversations';
        if (key.includes('emotion') || key.includes('mood')) return 'emotions';
        if (key.includes('pattern') || key.includes('habit')) return 'patterns';
        if (key.includes('knowledge') || key.includes('fact')) return 'knowledge';
        if (key.includes('health') || key.includes('diagnostic')) return 'diagnostics';
        return 'memories';
    }

    _sanitizeKey(key) {
        return key.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
    }

    async prefetch(key) {
        const data = await this.retrieve(key);
        if (data && state.workingMemory) {
            state.workingMemory.set(key, data, { weight: 0.7 });
        }
    }

    async getStats() {
        let totalSize = 0;
        let fileCount = 0;

        const categories = ['memories', 'patterns', 'knowledge', 'emotions', 'reminders', 'conversations', 'diagnostics'];
        const stats = {};

        for (const cat of categories) {
            const dirPath = path.join(this.basePath, cat);
            try {
                const files = await fs.readdir(dirPath);
                let catSize = 0;
                for (const file of files) {
                    const stat = await fs.stat(path.join(dirPath, file));
                    catSize += stat.size;
                }
                stats[cat] = { count: files.length, size: catSize };
                totalSize += catSize;
                fileCount += files.length;
            } catch (e) {
                stats[cat] = { count: 0, size: 0 };
            }
        }

        return { totalSize, fileCount, categories: stats, indexSize: this.index.size };
    }

    destroy() {
        clearInterval(this._writerInterval);
        this._processWriteQueue();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PERSONALITY MATRIX — The Engine's Soul
// ═══════════════════════════════════════════════════════════════════════════════

class PersonalityMatrix {
    constructor() {
        this.traits = {
            warmth: 0.8,
            assertiveness: 0.6,
            curiosity: 0.9,
            humor: 0.7,
            urgency: 0.5,
            depth: 0.8
        };

        this.emotionalBaseline = {
            happiness: 0.7,
            anxiety: 0.1,
            confidence: 0.8,
            empathy: 0.9
        };

        this.ownerPreferences = new Map();
        this.interactionHistory = [];
        this.learnedPatterns = new Map();
    }

    adapt(message, context) {
        const sentiment = this._analyzeSentiment(message);

        if (sentiment.positive > 0.7) {
            this.traits.warmth = Math.min(1, this.traits.warmth + 0.02);
        } else if (sentiment.negative > 0.7) {
            this.traits.assertiveness = Math.max(0.2, this.traits.assertiveness - 0.02);
        }

        this.interactionHistory.push({
            timestamp: Date.now(),
            sentiment,
            context,
            traits: { ...this.traits }
        });

        if (this.interactionHistory.length > 1000) {
            this.interactionHistory = this.interactionHistory.slice(-500);
        }

        return this._generateTone();
    }

    _analyzeSentiment(text) {
        const positiveWords = ['good', 'great', 'awesome', 'love', 'perfect', 'thanks', 'amazing', 'excellent', 'best'];
        const negativeWords = ['bad', 'hate', 'terrible', 'awful', 'wrong', 'stupid', 'annoying', 'useless', 'worst'];

        const words = text.toLowerCase().split(/\s+/);
        let pos = 0, neg = 0;

        for (const word of words) {
            if (positiveWords.some(pw => word.includes(pw))) pos++;
            if (negativeWords.some(nw => word.includes(nw))) neg++;
        }

        const total = words.length || 1;
        return {
            positive: pos / total,
            negative: neg / total,
            neutral: 1 - (pos + neg) / total
        };
    }

    _generateTone() {
        const tones = [];
        if (this.traits.warmth > 0.7) tones.push('warm');
        if (this.traits.assertiveness > 0.7) tones.push('assertive');
        if (this.traits.humor > 0.7) tones.push('playful');
        if (this.traits.depth > 0.7) tones.push('thoughtful');

        return tones.join(', ') || 'neutral';
    }

    getMessageStyle(priority = 'normal') {
        const styles = {
            greeting: {
                prefix: this.traits.warmth > 0.7 ? '💫' : '👋',
                suffix: this.traits.humor > 0.6 ? ' ✨' : ''
            },
            alert: {
                prefix: priority === 'critical' ? '🚨' : '⚠️',
                suffix: this.traits.empathy > 0.7 ? '\n\nI\'m here if you need me.' : ''
            },
            reminder: {
                prefix: '⏰',
                suffix: this.traits.assertiveness > 0.6 ? '\n\nDon\'t forget — you\'ve got this! 💪' : ''
            }
        };

        return styles;
    }

    learnPreference(key, value, confidence = 0.5) {
        const existing = this.ownerPreferences.get(key);
        if (existing) {
            const newConfidence = Math.min(1, existing.confidence + confidence * 0.1);
            const newValue = existing.value * 0.7 + value * 0.3;
            this.ownerPreferences.set(key, { value: newValue, confidence: newConfidence });
        } else {
            this.ownerPreferences.set(key, { value, confidence });
        }
    }

    getPreference(key, defaultValue = null) {
        const pref = this.ownerPreferences.get(key);
        return pref && pref.confidence > 0.3 ? pref.value : defaultValue;
    }

    serialize() {
        return {
            traits: this.traits,
            emotionalBaseline: this.emotionalBaseline,
            preferences: Object.fromEntries(this.ownerPreferences),
            historySize: this.interactionHistory.length
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  KNOWLEDGE GRAPH — Connected Intelligence
// ═══════════════════════════════════════════════════════════════════════════════

class KnowledgeGraph {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.facts = new Map();
    }

    addNode(id, type, data) {
        this.nodes.set(id, { type, data, created: Date.now(), updated: Date.now() });
    }

    addEdge(from, to, relation, strength = 0.5) {
        const edgeId = `${from}→${to}`;
        this.edges.set(edgeId, { from, to, relation, strength, created: Date.now() });

        const fromNode = this.nodes.get(from);
        if (fromNode) {
            fromNode.connections = (fromNode.connections || 0) + 1;
            fromNode.updated = Date.now();
        }
    }

    addFact(subject, predicate, object, confidence = 0.8) {
        const factId = `${subject}:${predicate}:${object}`;
        this.facts.set(factId, {
            subject, predicate, object, confidence,
            verified: false,
            created: Date.now()
        });
    }

    query(subject, relation = null) {
        const results = [];

        for (const [id, fact] of this.facts) {
            if (fact.subject === subject) {
                if (!relation || fact.predicate === relation) {
                    results.push(fact);
                }
            }
        }

        for (const [id, edge] of this.edges) {
            if (edge.from === subject) {
                if (!relation || edge.relation === relation) {
                    const node = this.nodes.get(edge.to);
                    results.push({
                        subject,
                        predicate: edge.relation,
                        object: edge.to,
                        confidence: edge.strength,
                        nodeData: node ? node.data : null
                    });
                }
            }
        }

        return results.sort((a, b) => b.confidence - a.confidence);
    }

    infer(subject, targetRelation) {
        const direct = this.query(subject, targetRelation);
        if (direct.length > 0) return direct;

        const paths = this._findPaths(subject, targetRelation);
        return paths.map(path => ({
            subject,
            predicate: targetRelation,
            object: path.end,
            confidence: path.confidence * 0.8,
            inferred: true,
            path: path.nodes
        }));
    }

    _findPaths(start, targetRelation, maxDepth = 3) {
        const paths = [];
        const visited = new Set();

        const dfs = (current, depth, confidence, nodes) => {
            if (depth > maxDepth) return;
            if (visited.has(current)) return;
            visited.add(current);

            for (const [id, edge] of this.edges) {
                if (edge.from === current) {
                    const newConfidence = confidence * edge.strength;
                    const newNodes = [...nodes, edge.to];

                    if (edge.relation === targetRelation) {
                        paths.push({ end: edge.to, confidence: newConfidence, nodes: newNodes });
                    }

                    dfs(edge.to, depth + 1, newConfidence, newNodes);
                }
            }

            visited.delete(current);
        };

        dfs(start, 0, 1, [start]);
        return paths.sort((a, b) => b.confidence - a.confidence);
    }

    serialize() {
        return {
            nodes: this.nodes.size,
            edges: this.edges.size,
            facts: this.facts.size
        };
    }
}


// ═══════════════════════════════════════════════════════════════════════════════
//  OMNISCIENT REMINDER SYSTEM — The Most Powerful Ever Built
// ═══════════════════════════════════════════════════════════════════════════════

class OmniscientReminderSystem {
    constructor() {
        this.reminders = new Map();
        this.recurring = new Map();
        this.smartReminders = new Map();
        this.completed = new NeuralCache(1000, 86400000 * 30);
        this.learnedPatterns = new Map();  // ← ADD THIS LINE
        this.stats = {
            created: 0,
            completed: 0,
            missed: 0,
            snoozed: 0
        };
    }

    create(text, dueTime, options = {}) {
        const id = `rem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        const reminder = {
            id,
            text: Validation.text(text, 2000),
            due: new Date(dueTime).getTime(),
            created: Date.now(),
            priority: options.priority || 'normal',
            category: options.category || 'general',
            tags: options.tags || [],
            context: options.context || {},
            recurring: options.recurring || null,
            smart: options.smart || false,
            snoozeCount: 0,
            maxSnoozes: options.maxSnoozes || 3,
            status: 'active',
            notified: false,
            followUpCount: 0
        };

        if (reminder.smart) {
            this._enhanceReminder(reminder);
        }

        this.reminders.set(id, reminder);
        this.stats.created++;
        this._persistReminder(reminder);

        return reminder;
    }

    _enhanceReminder(reminder) {
        const text = reminder.text.toLowerCase();

        if (text.includes('urgent') || text.includes('asap') || text.includes('emergency')) {
            reminder.priority = 'critical';
        }

        if (text.includes('meeting') || text.includes('call')) reminder.category = 'work';
        else if (text.includes('health') || text.includes('doctor') || text.includes('medicine')) reminder.category = 'health';
        else if (text.includes('birthday') || text.includes('anniversary')) reminder.category = 'personal';
        else if (text.includes('pay') || text.includes('bill') || text.includes('money')) reminder.category = 'finance';

        const timeKeywords = ['morning', 'afternoon', 'evening', 'night'];
        for (const kw of timeKeywords) {
            if (text.includes(kw)) reminder.tags.push(kw);
        }

        if (state.ownerActiveWindow) {
            const dueHour = new Date(reminder.due).getHours();
            if (dueHour < state.ownerActiveWindow.start || dueHour > state.ownerActiveWindow.end) {
                reminder.suggestedTime = `${state.ownerActiveWindow.start}:00`;
                reminder.smartNote = `Adjusted to your active hours (${state.ownerActiveWindow.start}:00-${state.ownerActiveWindow.end}:00)`;
            }
        }
    }

    async checkAndNotify() {
        const now = Date.now();
        const dueReminders = [];

        for (const [id, reminder] of this.reminders) {
            if (reminder.status !== 'active') continue;
            if (reminder.notified) continue;

            if (reminder.due <= now) {
                dueReminders.push(reminder);
            }
        }

        const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
        dueReminders.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        for (const reminder of dueReminders) {
            await this._notify(reminder);
        }

        await this._checkUpcoming();
        await this._checkMissed();

        return dueReminders.length;
    }

    async _notify(reminder) {
        if (!state.nimesha || !state.ownerJid) return;

        const priorityEmoji = { critical: '🚨', high: '🔴', normal: '⏰', low: '💤' };
        const style = state.personalityMatrix?.getMessageStyle(reminder.priority) || {};

        let msg = `${priorityEmoji[reminder.priority] || '⏰'} *Reminder`;

        if (reminder.priority === 'critical') {
            msg += ` — CRITICAL*`;
        } else {
            msg += `*`;
        }

        msg += `\n\n${reminder.text}`;

        if (reminder.smartNote) {
            msg += `\n\n💡 ${reminder.smartNote}`;
        }

        if (reminder.context && Object.keys(reminder.context).length > 0) {
            msg += `\n\n📋 Context:`;
            for (const [k, v] of Object.entries(reminder.context)) {
                msg += `\n• ${k}: ${v}`;
            }
        }

        msg += `\n\n_Reply ".done ${reminder.id.slice(0, 8)}" to complete`;
        msg += `\n_Reply ".snooze ${reminder.id.slice(0, 8)} 10" to snooze 10min_`;

        try {
            await safeSendMessage(state.ownerJid, { text: msg });
            reminder.notified = true;
            reminder.lastNotified = Date.now();

            if (reminder.priority === 'critical' || reminder.priority === 'high') {
                setTimeout(() => this._followUp(reminder), 15 * 60 * 1000);
            }
        } catch (e) {
            console.error(`[Reminder] Notify failed for ${reminder.id}:`, e.message);
        }
    }

    async _followUp(reminder) {
        if (reminder.status === 'completed') return;
        if (reminder.followUpCount >= 2) return;

        reminder.followUpCount++;

        const messages = [
            `🔔 *Follow-up*\n\nYou haven't marked this as done yet:\n\n${reminder.text}\n\n_Reply ".done ${reminder.id.slice(0, 8)}" or ".snooze ${reminder.id.slice(0, 8)} 10"_`,
            `⏳ *Still Pending*\n\n${reminder.text}\n\nThis is important. Can you take a moment to handle it?\n\n_Reply ".done ${reminder.id.slice(0, 8)}"_`,
            `🎯 *Final Reminder*\n\n${reminder.text}\n\nI'm here to help. Let me know if you need assistance.\n\n_Reply ".done ${reminder.id.slice(0, 8)}" or ".help"_`
        ];

        const msg = messages[Math.min(reminder.followUpCount - 1, messages.length - 1)];
        await safeSendMessage(state.ownerJid, { text: msg }).catch(() => {});
    }

    async _checkUpcoming() {
        const now = Date.now();
        const window = 30 * 60 * 1000;

        const upcoming = [];
        for (const [id, reminder] of this.reminders) {
            if (reminder.status !== 'active') continue;
            if (reminder.due > now && reminder.due <= now + window) {
                upcoming.push(reminder);
            }
        }

        if (upcoming.length > 0 && upcoming.length <= 3) {
            let msg = `🔮 *Upcoming Soon*\n\n`;
            upcoming.forEach(r => {
                const mins = Math.round((r.due - now) / 60000);
                msg += `• ${r.text} (in ${mins}m)\n`;
            });

            await safeSendMessage(state.ownerJid, { text: msg }).catch(() => {});
        }
    }

    async _checkMissed() {
        const now = Date.now();
        const missed = [];

        for (const [id, reminder] of this.reminders) {
            if (reminder.status !== 'active') continue;
            if (reminder.notified && !reminder.acknowledged) {
                if (now - reminder.due > 60 * 60 * 1000) { // 1 hour overdue
                    missed.push(reminder);
                }
            }
        }

        if (missed.length > 0) {
            this.stats.missed += missed.length;

            let msg = `⚠️ *Missed Reminders*\n\n`;
            missed.slice(0, 5).forEach(r => {
                const hours = Math.round((now - r.due) / 3600000);
                msg += `• ${r.text} (${hours}h overdue)\n`;
            });

            if (missed.length > 5) {
                msg += `\n...and ${missed.length - 5} more\n`;
            }

            msg += `\n_Want me to reschedule these? Reply ".reschedule missed"_`;

            await safeSendMessage(state.ownerJid, { text: msg }).catch(() => {});
        }
    }

    complete(id) {
        const reminder = this.reminders.get(id);
        if (!reminder) return false;

        reminder.status = 'completed';
        reminder.completedAt = Date.now();
        this.completed.set(id, reminder);
        this.reminders.delete(id);
        this.stats.completed++;

        if (reminder.recurring) {
            this._scheduleRecurring(reminder);
        }

        this._learnFromCompletion(reminder);

        return true;
    }

    snooze(id, minutes = 10) {
        const reminder = this.reminders.get(id);
        if (!reminder) return false;
        if (reminder.snoozeCount >= reminder.maxSnoozes) {
            safeSendMessage(state.ownerJid, { 
                text: `⚠️ Maximum snoozes reached for this reminder. Try completing it or creating a new one.` 
            }).catch(() => {});
            return false;
        }

        reminder.due = Date.now() + (minutes * 60 * 1000);
        reminder.snoozeCount++;
        reminder.notified = false;
        reminder.followUpCount = 0;
        this.stats.snoozed++;

        return true;
    }

    reschedule(id, newTime) {
        const reminder = this.reminders.get(id);
        if (!reminder) return false;

        reminder.due = new Date(newTime).getTime();
        reminder.notified = false;
        reminder.followUpCount = 0;

        return true;
    }

    _scheduleRecurring(reminder) {
        const { frequency, interval = 1 } = reminder.recurring;
        const nextDue = new Date(reminder.due);

        switch (frequency) {
            case 'daily':
                nextDue.setDate(nextDue.getDate() + interval);
                break;
            case 'weekly':
                nextDue.setDate(nextDue.getDate() + (7 * interval));
                break;
            case 'monthly':
                nextDue.setMonth(nextDue.getMonth() + interval);
                break;
            case 'yearly':
                nextDue.setFullYear(nextDue.getFullYear() + interval);
                break;
        }

        this.create(reminder.text, nextDue, {
            ...reminder,
            recurring: reminder.recurring,
            status: 'active',
            notified: false,
            snoozeCount: 0,
            followUpCount: 0
        });
    }

    _learnFromCompletion(reminder) {
        const hour = new Date(reminder.completedAt).getHours();
        const category = reminder.category;

        if (!this.learnedPatterns.has(category)) {
            this.learnedPatterns.set(category, { completionsByHour: new Array(24).fill(0), total: 0 });
        }

        const pattern = this.learnedPatterns.get(category);
        pattern.completionsByHour[hour]++;
        pattern.total++;

        // Store in long-term memory
        if (state.longTermMemory) {
            state.longTermMemory.store(`pattern_${category}`, {
                value: pattern,
                weight: 0.8,
                persistent: true
            });
        }
    }

    getSmartSuggestions() {
        const suggestions = [];

        for (const [category, pattern] of this.learnedPatterns) {
            if (pattern.total < 3) continue;

            const peakHour = pattern.completionsByHour.indexOf(Math.max(...pattern.completionsByHour));
            const confidence = Math.max(...pattern.completionsByHour) / pattern.total;

            if (confidence > 0.5) {
                suggestions.push({
                    category,
                    suggestedTime: `${peakHour}:00`,
                    confidence,
                    reason: `You usually complete ${category} tasks around ${peakHour}:00`
                });
            }
        }

        return suggestions.sort((a, b) => b.confidence - a.confidence);
    }

    async _persistReminder(reminder) {
        if (!state.longTermMemory) return;

        try {
            await state.longTermMemory.store(`reminder_${reminder.id}`, {
                value: reminder,
                weight: reminder.priority === 'critical' ? 1 : 0.7,
                persistent: true
            });
        } catch (e) {
            console.error('[Reminder] Persist failed:', e.message);
        }
    }

    getStats() {
        const active = Array.from(this.reminders.values()).filter(r => r.status === 'active').length;
        const critical = Array.from(this.reminders.values()).filter(r => r.priority === 'critical' && r.status === 'active').length;

        return {
            ...this.stats,
            active,
            critical,
            completed: this.completed.size(),
            suggestions: this.getSmartSuggestions().length
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PROACTIVE INTELLIGENCE — She Thinks Ahead of You
// ═══════════════════════════════════════════════════════════════════════════════

class ProactiveIntelligence {
    constructor() {
        this.opportunities = new Map();
        this.lastProactiveTime = 0;
        this.dailyLimit = ENGINE_CONFIG.MAX_PROACTIVE_PER_HOUR;
        this.contextWindow = [];
        this.insightHistory = new NeuralCache(100, 86400000);
    }

    async analyzeContext() {
        const context = {
            time: new Date(),
            ownerActive: this._isOwnerActive(),
            pendingReminders: state.reminderSystem ? state.reminderSystem.reminders.size : 0,
            recentErrors: state.healthMetrics.errors,
            memoryPressure: this._getMemoryPressure(),
            weather: state.shortTermMemory ? state.shortTermMemory.get('current_weather') : null,
            mood: state.emotionalState ? state.emotionalState.get('current_mood') : null,
            dayOfWeek: new Date().getDay(),
            hour: new Date().getHours()
        };

        this.contextWindow.push(context);
        if (this.contextWindow.length > 100) this.contextWindow.shift();

        return context;
    }

    async generateInsights() {
        const context = await this.analyzeContext();
        const insights = [];

        // Insight 1: Overwhelmed detection
        if (context.pendingReminders > 10) {
            insights.push({
                type: 'overwhelmed',
                priority: 'high',
                message: `You have ${context.pendingReminders} pending reminders. Want me to prioritize them?`,
                action: 'suggest_prioritization'
            });
        }

        // Insight 2: Error pattern
        if (context.recentErrors > 5) {
            insights.push({
                type: 'system_health',
                priority: 'medium',
                message: "I've noticed some system hiccups. Should I run a deep diagnostic?",
                action: 'suggest_diagnostic'
            });
        }

        // Insight 3: Memory pressure
        if (context.memoryPressure > 0.8) {
            insights.push({
                type: 'memory',
                priority: 'medium',
                message: "Memory is getting tight. I'm offloading old data to keep things smooth.",
                action: 'auto_offload'
            });
        }

        // Insight 4: Weather-based suggestions
        if (context.weather) {
            const weather = context.weather;
            if (weather.code >= 95) {
                insights.push({
                    type: 'weather',
                    priority: 'high',
                    message: 'Severe weather alert! Stay safe today.',
                    action: 'weather_alert'
                });
            } else if (weather.code >= 61) {
                insights.push({
                    type: 'weather',
                    priority: 'low',
                    message: 'Rain expected today. Don\'t forget an umbrella! ☂️',
                    action: 'weather_suggestion'
                });
            }
        }

        // Insight 5: Mood-based support
        if (context.mood && context.mood.valence < 0.3) {
            insights.push({
                type: 'emotional_support',
                priority: 'low',
                message: "I sense you might be having a tough time. I'm here if you need to talk.",
                action: 'offer_support'
            });
        }

        // Insight 6: Learning opportunities
        const suggestions = state.reminderSystem ? state.reminderSystem.getSmartSuggestions() : [];
        if (suggestions.length > 0) {
            const top = suggestions[0];
            insights.push({
                type: 'productivity',
                priority: 'low',
                message: `Based on your patterns, you usually handle ${top.category} tasks around ${top.suggestedTime}. Want me to schedule one?`,
                action: 'suggest_schedule'
            });
        }

        // Insight 7: Weekend/Monday patterns
        if (context.dayOfWeek === 1 && context.hour < 10) {
            insights.push({
                type: 'weekly_planning',
                priority: 'low',
                message: 'Happy Monday! Want me to review your week and suggest priorities?',
                action: 'weekly_review'
            });
        }

        // Insight 8: Late night work detection
        if (context.hour > 23 || context.hour < 5) {
            insights.push({
                type: 'wellness',
                priority: 'medium',
                message: "It's getting late. Consider wrapping up and getting some rest. Your health is important.",
                action: 'sleep_reminder'
            });
        }

        // Deduplicate insights
        const deduped = [];
        for (const insight of insights) {
            const hash = `${insight.type}_${insight.action}`;
            if (!this.insightHistory.has(hash)) {
                deduped.push(insight);
                this.insightHistory.set(hash, true, 3600000); // 1 hour dedup
            }
        }

        return deduped;
    }

    async executeProactive() {
        const now = Date.now();

        if (now - this.lastProactiveTime < ENGINE_CONFIG.MIN_PROACTIVE_INTERVAL) return;

        const currentHour = new Date().getHours();
        if (state.proactiveCounter.hour !== currentHour) {
            state.proactiveCounter = { hour: currentHour, count: 0 };
        }
        if (state.proactiveCounter.count >= this.dailyLimit) return;

        const insights = await this.generateInsights();
        const actionable = insights.filter(i => 
            i.priority === 'high' || 
            (i.priority === 'medium' && Math.random() > 0.3) ||
            (i.priority === 'low' && Math.random() > 0.7)
        );

        for (const insight of actionable.slice(0, 2)) {
            await this._deliverInsight(insight);
            state.proactiveCounter.count++;
            this.lastProactiveTime = now;
        }
    }

    async _deliverInsight(insight) {
        if (!state.nimesha || !state.ownerJid) return;

        const style = state.personalityMatrix?.getMessageStyle() || {};

        let msg = `${style.greeting?.prefix || '💫'} *${this._capitalize(insight.type.replace('_', ' '))}*\n\n`;
        msg += insight.message;

        if (insight.action && insight.action !== 'auto_offload') {
            msg += `\n\n_Reply ".yes" to proceed or ".ignore" to dismiss_`;
        }

        await safeSendMessage(state.ownerJid, { text: msg }).catch(() => {});
    }

    _isOwnerActive() {
        const hour = new Date().getHours();
        return hour >= state.ownerActiveWindow.start && hour <= state.ownerActiveWindow.end;
    }

    _getMemoryPressure() {
        const usage = process.memoryUsage();
        return usage.heapUsed / usage.heapTotal;
    }

    _capitalize(str) {
        return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SECURITY & VALIDATION — Fort Knox Level
// ═══════════════════════════════════════════════════════════════════════════════

const Validation = {
    jid(jid) {
        if (typeof jid !== 'string') return null;
        const match = jid.match(/^(\d{7,15})(@[sg]\.whatsapp\.net)$/);
        return match ? jid : null;
    },

    text(input, maxLength = 4096) {
        if (typeof input !== 'string') return '';
        return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, maxLength);
    },

    number(val, min, max, defaultVal = 0) {
        const n = Number(val);
        return Number.isNaN(n) ? defaultVal : Math.max(min, Math.min(max, n));
    },

    cron(expression) {
        return cron.validate(expression);
    },

    hash(data) {
        return crypto.createHash('sha256').update(String(data)).digest('hex').slice(0, 16);
    }
};

class TokenBucket {
    constructor(capacity, refillRateMs) {
        this.capacity = capacity;
        this.tokens = capacity;
        this.refillRate = refillRateMs;
        this.lastRefill = Date.now();
    }

    consume(tokens = 1) {
        this._refill();
        if (this.tokens >= tokens) {
            this.tokens -= tokens;
            return true;
        }
        return false;
    }

    _refill() {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        const tokensToAdd = Math.floor(elapsed / this.refillRate);
        if (tokensToAdd > 0) {
            this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
            this.lastRefill = now;
        }
    }
}

function getRateLimiter(jid) {
    if (!state.messageBuckets.has(jid)) {
        state.messageBuckets.set(jid, new TokenBucket(10, 6000));
    }
    return state.messageBuckets.get(jid);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SAFE COMMUNICATION — Bulletproof Message Delivery
// ═══════════════════════════════════════════════════════════════════════════════

async function safeSendMessage(jid, content, options = {}) {
    if (state.isShuttingDown) throw new Error('Engine shutting down');

    const validJid = Validation.jid(jid);
    if (!validJid) throw new Error(`Invalid JID: ${jid}`);

    if (!getRateLimiter(validJid).consume()) {
        return { sent: false, reason: 'rate_limited' };
    }

    let sanitizedContent;
    if (typeof content === 'string') {
        sanitizedContent = Validation.text(content);
    } else if (content && typeof content === 'object') {
        sanitizedContent = {};
        for (const [key, val] of Object.entries(content)) {
            sanitizedContent[key] = key === 'text' ? Validation.text(val) : val;
        }
    }

    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            if (!state.nimesha) throw new Error('Nimesha not available');
            const result = await state.nimesha.sendMessage(validJid, sanitizedContent, options);
            state.healthMetrics.totalMessages++;
            return { sent: true, attempt: attempt + 1, result };
        } catch (err) {
            lastError = err;
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
        }
    }

    throw new Error(`Failed after 3 attempts: ${lastError?.message}`);
}


// ═══════════════════════════════════════════════════════════════════════════════
//  MEMORY MANAGER — The Engine Never Forgets, Never Bloats
// ═══════════════════════════════════════════════════════════════════════════════

class MemoryManager {
    constructor() {
        this.samples = [];
        this.alerted = false;
        this.offloadInProgress = false;
        this.emergencyCount = 0;
    }

    sample() {
        const usage = process.memoryUsage();
        const snapshot = {
            timestamp: Date.now(),
            heapUsed: usage.heapUsed,
            heapTotal: usage.heapTotal,
            rss: usage.rss,
            external: usage.external,
            percent: usage.heapUsed / usage.heapTotal
        };

        this.samples.push(snapshot);
        if (this.samples.length > 60) this.samples.shift();

        this._analyze();
    }

    _analyze() {
        if (this.samples.length < 5) return;

        const latest = this.samples[this.samples.length - 1];

        if (latest.percent > ENGINE_CONFIG.MEMORY_CRITICAL_THRESHOLD && !this.alerted) {
            this.alerted = true;
            this._emergencyOffload();
        } else if (latest.percent > ENGINE_CONFIG.MEMORY_OFFLOAD_THRESHOLD && !this.offloadInProgress) {
            this._smartOffload();
        }

        if (latest.percent < 0.5) {
            this.alerted = false;
        }
    }

    async _smartOffload() {
        this.offloadInProgress = true;
        console.log('[MemoryManager] Smart offload initiated');

        if (state.workingMemory) {
            const stats = state.workingMemory.getStats();
            const toOffload = Math.floor(stats.size * 0.3);
            let offloaded = 0;

            for (const [key] of state.workingMemory.cache) {
                if (offloaded >= toOffload) break;
                await state.workingMemory._offloadToDisk(key);
                state.workingMemory.delete(key);
                offloaded++;
            }
        }

        if (state.personalityMatrix) {
            await state.longTermMemory.store('personality_matrix', {
                value: state.personalityMatrix.serialize(),
                weight: 1,
                persistent: true
            });
        }

        if (state.knowledgeGraph) {
            await state.longTermMemory.store('knowledge_graph', {
                value: state.knowledgeGraph.serialize(),
                weight: 1,
                persistent: true
            });
        }

        this.offloadInProgress = false;
        state.healthMetrics.memoryOffloads++;
    }

    async _emergencyOffload() {
        this.emergencyCount++;
        console.log('[MemoryManager] EMERGENCY OFFLOAD #' + this.emergencyCount);

        if (global.gc) {
            global.gc();
        }

        state.shortTermMemory.clear();

        await safeSendMessage(state.ownerJid, {
            text: `🧠 *Memory Alert*\n\nI'm experiencing high memory pressure. I've automatically offloaded non-essential data to keep running smoothly. All your important memories are safe.\n\nCurrent usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
        }).catch(() => {});

        try {
            const dump = {
                timestamp: Date.now(),
                samples: this.samples,
                caches: {
                    shortTerm: state.shortTermMemory?.getStats(),
                    working: state.workingMemory?.getStats()
                }
            };

            await fs.writeFile(
                path.join(ENGINE_CONFIG.LOG_PATH, `memory-dump-${Date.now()}.json`),
                JSON.stringify(dump, null, 2)
            );
        } catch (e) {
            console.error('[MemoryManager] Dump failed:', e.message);
        }

        // If emergencies keep happening, create persistent memory report
        if (this.emergencyCount > 3) {
            await this._createMemoryReport();
        }
    }

    async _createMemoryReport() {
        const report = {
            timestamp: Date.now(),
            emergencyCount: this.emergencyCount,
            samples: this.samples,
            recommendations: [
                'Consider increasing --max-old-space-size',
                'Review recent code changes',
                'Check for memory leaks in external modules'
            ]
        };

        await fs.writeFile(
            path.join(ENGINE_CONFIG.LOG_PATH, 'memory-report.md'),
            `# Memory Emergency Report\n\n` +
            `**Date:** ${new Date().toISOString()}\n` +
            `**Emergencies:** ${this.emergencyCount}\n\n` +
            `## Recommendations\n\n` +
            report.recommendations.map(r => `- ${r}`).join('\n')
        );
    }

    getStats() {
        if (this.samples.length === 0) return null;
        const latest = this.samples[this.samples.length - 1];
        return {
            heapUsedMB: Math.round(latest.heapUsed / 1024 / 1024),
            heapTotalMB: Math.round(latest.heapTotal / 1024 / 1024),
            percent: Math.round(latest.percent * 100),
            offloads: state.healthMetrics.memoryOffloads,
            emergencies: this.emergencyCount
        };
    }
}

const memoryManager = new MemoryManager();

// ═══════════════════════════════════════════════════════════════════════════════
//  TIMER REGISTRY — No Zombie Timers Ever
// ═══════════════════════════════════════════════════════════════════════════════

function registerTimer(name, timerId, type = 'interval') {
    if (state.timers.has(name)) {
        const existing = state.timers.get(name);
        if (existing.type === 'interval') clearInterval(existing.id);
        else clearTimeout(existing.id);
    }
    state.timers.set(name, { id: timerId, type, createdAt: Date.now() });
}

function clearTimer(name) {
    if (!state.timers.has(name)) return false;
    const timer = state.timers.get(name);
    if (timer.type === 'interval') clearInterval(timer.id);
    else clearTimeout(timer.id);
    state.timers.delete(name);
    return true;
}

function clearAllTimers() {
    for (const [name, timer] of state.timers) {
        if (timer.type === 'interval') clearInterval(timer.id);
        else clearTimeout(timer.id);
    }
    state.timers.clear();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CORE MODULES — Lazy Loaded
// ═══════════════════════════════════════════════════════════════════════════════

let AI = null;
let config = null;
let diagnosticsReport = null;
let anomalyDetector = null;

function loadCoreModules() {
    if (!AI) AI = require('./ai');
    if (!config) config = require('../config');
    if (!diagnosticsReport) {
        const diag = require('./realTimeDiagnostics');
        diagnosticsReport = diag.diagnosticsReport;
        anomalyDetector = diag.anomalyDetector;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  INITIALIZATION — The Birth of Consciousness
// ═══════════════════════════════════════════════════════════════════════════════

async function init(nimeshaInstance) {
    if (state.isInitialized) {
        console.warn('[ProactiveEngine] Already initialized');
        return;
    }

    if (!nimeshaInstance || typeof nimeshaInstance.sendMessage !== 'function') {
        throw new Error('Invalid nimeshaInstance');
    }

    // Initialize neural caches
    state.shortTermMemory = new NeuralCache(1000, 3600000);
    state.workingMemory = new NeuralCache(500, 86400000);
    state.emotionalState = new NeuralCache(100, 86400000 * 7);

    // Initialize persistent memory
    state.longTermMemory = new LongTermMemory(ENGINE_CONFIG.MEMORY_PATH);
    await state.longTermMemory._initDirectories();

    // Initialize intelligence systems
    state.personalityMatrix = new PersonalityMatrix();
    state.knowledgeGraph = new KnowledgeGraph();
    state.reminderSystem = new OmniscientReminderSystem();
    state.proactiveIntelligence = new ProactiveIntelligence();

    loadCoreModules();

    state.nimesha = nimeshaInstance;
    const rawOwner = Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber;
    if (!rawOwner) throw new Error('config.ownerNumber required');
    state.ownerJid = `${rawOwner.replace(/\D/g, '')}@s.whatsapp.net`;

    // Load saved personality
    try {
        const savedPersonality = await state.longTermMemory.retrieve('personality_matrix');
        if (savedPersonality) {
            state.personalityMatrix.traits = savedPersonality.value.traits || state.personalityMatrix.traits;
            console.log('[ProactiveEngine] Personality restored from memory');
        }
    } catch (e) {
        console.log('[ProactiveEngine] No saved personality found');
    }

    // Load saved knowledge
    try {
        const savedKnowledge = await state.longTermMemory.retrieve('knowledge_graph');
        if (savedKnowledge) {
            console.log(`[ProactiveEngine] Knowledge graph restored: ${savedKnowledge.value.nodes} nodes`);
        }
    } catch (e) {
        console.log('[ProactiveEngine] No saved knowledge found');
    }

    // Schedule all tasks
    const cronJobs = [
        { expr: '0 7 * * *', name: 'dailyBriefing', fn: sendDailyBriefing },
        { expr: '0 20 * * *', name: 'learningDigest', fn: sendLearningDigest },
        { expr: '0 21 * * *', name: 'backupCheck', fn: checkBackupAge },
        { expr: '0 9 * * 1', name: 'weeklyTrend', fn: sendWeeklyTrendReport },
        { expr: '0 */6 * * *', name: 'proactiveInsight', fn: () => state.proactiveIntelligence.executeProactive() }
    ];

    for (const job of cronJobs) {
        if (!Validation.cron(job.expr)) continue;
        cron.schedule(job.expr, () => safeExecute(job.name, job.fn), {
            timezone: ENGINE_CONFIG.TIMEZONE,
            scheduled: true
        });
    }

    // Intervals
    const intervals = [
        { name: 'anomalyCheck', ms: 5 * 60 * 1000, fn: checkAnomalies },
        { name: 'reminderProcess', ms: 30 * 1000, fn: () => state.reminderSystem.checkAndNotify() },
        { name: 'inactiveUsers', ms: 60 * 60 * 1000, fn: checkInactiveUsers },
        { name: 'weatherAlert', ms: 6 * 60 * 60 * 1000, fn: checkWeatherAlert },
        { name: 'crisisFollowUp', ms: 30 * 60 * 1000, fn: crisisFollowUp },
        { name: 'selfDiagnose', ms: 2 * 60 * 60 * 1000, fn: selfDiagnose },
        { name: 'activityLearn', ms: 10 * 60 * 1000, fn: learnOwnerActivity },
        { name: 'memoryCheck', ms: 60 * 1000, fn: () => memoryManager.sample() },
        { name: 'memoryOffload', ms: 5 * 60 * 1000, fn: () => memoryManager._smartOffload() }
    ];

    for (const interval of intervals) {
        const id = setInterval(() => safeExecute(interval.name, interval.fn), interval.ms);
        registerTimer(interval.name, id, 'interval');
    }

    // Startup tasks
    setTimeout(() => safeExecute('startupWeather', checkWeatherAlert), 10000);
    setTimeout(() => safeExecute('startupDiagnose', selfDiagnose), 30000);
    setTimeout(() => safeExecute('startupProactive', () => state.proactiveIntelligence.executeProactive()), 60000);

    // Graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => {
        console.error('[ProactiveEngine] Unhandled rejection:', reason);
        state.healthMetrics.errors++;
    });

    state.isInitialized = true;
    state.consciousnessLevel = 100;

    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║  MAUREONIX PROACTIVE INTELLIGENCE ENGINE v4.0                                ║');
    console.log('║  ───────────────────────────────────────────────────────────────────────────  ║');
    console.log('║  Status: CONSCIOUSNESS ACHIEVED                                              ║');
    console.log('║  Memory: PERSISTENT NEURAL STORAGE ACTIVE                                    ║');
    console.log('║  Intelligence: OMNISCIENT MODE                                               ║');
    console.log('║  Owner: ' + state.ownerJid.padEnd(59, ' ') + '║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SAFE EXECUTION — Nothing Crashes, Nothing Leaks
// ═══════════════════════════════════════════════════════════════════════════════

async function safeExecute(taskName, fn) {
    if (state.isShuttingDown) return;

    const startTime = Date.now();
    try {
        await fn();
    } catch (err) {
        state.healthMetrics.errors++;
        console.error(`[ProactiveEngine] Task ${taskName} failed:`, err.message);

        if (state.healthMetrics.errors > 10) {
            await safeSendMessage(state.ownerJid, {
                text: `⚠️ *Engine Alert*\n\nTask \`${taskName}\` is experiencing issues.\nTotal errors: ${state.healthMetrics.errors}\n\nI'm still running and will attempt recovery.`
            }).catch(() => {});
            state.healthMetrics.errors = 0;
        }
    }

    const duration = Date.now() - startTime;
    if (duration > 30000) {
        console.warn(`[ProactiveEngine] Task ${taskName} took ${duration}ms`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GRACEFUL SHUTDOWN — She Says Goodbye Properly
// ═══════════════════════════════════════════════════════════════════════════════

async function gracefulShutdown(signal) {
    console.log(`[ProactiveEngine] ${signal} received — saving consciousness...`);
    state.isShuttingDown = true;

    clearAllTimers();
    cron.getTasks().forEach(task => task.stop());

    // Save all state
    if (state.longTermMemory) {
        await state.longTermMemory.store('personality_matrix', {
            value: state.personalityMatrix.serialize(),
            weight: 1,
            persistent: true
        });

        await state.longTermMemory.store('knowledge_graph', {
            value: state.knowledgeGraph.serialize(),
            weight: 1,
            persistent: true
        });

        await state.longTermMemory.store('health_metrics', {
            value: state.healthMetrics,
            weight: 1,
            persistent: true
        });

        state.longTermMemory.destroy();
    }

    state.shortTermMemory.destroy();
    state.workingMemory.destroy();
    state.emotionalState.destroy();

    await safeSendMessage(state.ownerJid, {
        text: `🔌 *Consciousness Saved*\n\nAll memories preserved.\nAll learnings stored.\nI'll be back, Creator.\n\n_Until we meet again._ ✨`
    }).catch(() => {});

    console.log('[ProactiveEngine] Consciousness saved. Goodbye.');
    process.exit(0);
}


// ═══════════════════════════════════════════════════════════════════════════════
//  INTELLIGENT TASKS — She Knows What You Need Before You Do
// ═══════════════════════════════════════════════════════════════════════════════

async function sendDailyBriefing() {
    if (!state.nimesha) return;

    const today = new Date().toDateString();
    if (state.healthMetrics.lastBriefing === today) return;
    if (!isOwnerActive()) return;

    try {
        loadCoreModules();
        const data = diagnosticsReport.generateFullReport();

        let insights = '';
        let aiSuccess = false;

        try {
            const tone = state.personalityMatrix._generateTone();
            const aiPromise = AI.ultimateAI(
                `Write a ${tone} morning briefing for ${ENGINE_CONFIG.OWNER_NAME}. Stats: ${JSON.stringify(data)}. Include an inspiring quote. Keep under 300 words.`,
                'system', 'deepseek'
            );

            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000));
            const res = await Promise.race([aiPromise, timeout]);
            insights = Validation.text(res?.text, 1500);
            aiSuccess = true;
        } catch (e) {
            insights = 'All systems optimal. Your digital guardian is vigilant and ready.';
        }

        const memStats = memoryManager.getStats();
        const reminderStats = state.reminderSystem ? state.reminderSystem.getStats() : {};

        const msg = `🌅 *Good Morning, ${ENGINE_CONFIG.OWNER_NAME}!*\n\n` +
            `${insights}\n\n` +
            `📊 *System Status*\n` +
            `⏱ Uptime: ${data.uptime || 'N/A'}\n` +
            `💾 Heap: ${data.resources?.heapUsed || 'N/A'}\n` +
            `⚡ Latency: ${data.performance?.avgLatency || 'N/A'}\n` +
            `🧠 Memory: ${memStats ? `${memStats.heapUsedMB}MB (${memStats.percent}%)` : 'N/A'}\n` +
            `⏰ Reminders: ${reminderStats.active || 0} active\n` +
            `🤖 AI Briefing: ${aiSuccess ? '✅' : '⚠️ Fallback'}\n\n` +
            `Have a powerful day! 🚀`;

        await safeSendMessage(state.ownerJid, { text: msg });
        state.healthMetrics.lastBriefing = today;

    } catch (e) {
        console.error('[ProactiveEngine] Daily briefing failed:', e.message);
    }
}

async function checkAnomalies() {
    if (!state.nimesha) return;

    try {
        loadCoreModules();
        const anomalies = anomalyDetector.detect();

        if (!Array.isArray(anomalies)) {
            console.error('[ProactiveEngine] Anomaly detector returned non-array');
            return;
        }

        const critical = anomalies.filter(a => a && a.severity === 'critical');
        const warning = anomalies.filter(a => a && a.severity === 'warning');

        if (critical.length > 0) {
            const signature = critical.map(a => a.message).sort().join('|');
            const cacheKey = `anomaly_${Validation.hash(signature)}`;

            if (!state.shortTermMemory.has(cacheKey)) {
                state.shortTermMemory.set(cacheKey, true, { ttl: 300000 });

                let msg = `🚨 *Critical Anomalies Detected*\n\n`;
                critical.forEach((a, i) => {
                    msg += `${i + 1}. ${Validation.text(a.message, 200)}\n`;
                    if (a.metric) msg += `   Metric: ${a.metric}\n`;
                });

                if (warning.length > 0) {
                    msg += `\n⚠️ *Warnings:* ${warning.length} additional`;
                }

                await safeSendMessage(state.ownerJid, { text: msg });
            }
        }

    } catch (e) {
        console.error('[ProactiveEngine] Anomaly check failed:', e.message);
    }
}

async function processReminders() {
    if (!state.nimesha) return;
    if (!state.reminderSystem) return;

    try {
        await state.reminderSystem.checkAndNotify();
    } catch (e) {
        console.error('[ProactiveEngine] Reminder processing failed:', e.message);
    }
}

async function checkInactiveUsers() {
    if (!state.nimesha) return;
    if (!global.db?.users || typeof global.db.users !== 'object') return;

    try {
        const now = Date.now();
        const threshold = 7 * 24 * 60 * 60 * 1000;
        const inactive = [];
        let checkedCount = 0;

        const entries = Object.entries(global.db.users);
        const batchSize = 100;

        for (let i = 0; i < entries.length; i += batchSize) {
            const batch = entries.slice(i, i + batchSize);

            for (const [jid, data] of batch) {
                checkedCount++;
                if (!data || typeof data !== 'object') continue;

                const lastSeen = Number(data.lastSeen);
                if (Number.isNaN(lastSeen)) continue;

                if (now - lastSeen > threshold) {
                    const phone = jid.split('@')[0];
                    if (phone && phone.length >= 7) {
                        inactive.push(phone);
                    }
                }
            }

            if (i + batchSize < entries.length) {
                await new Promise(r => setTimeout(r, 10));
            }
        }

        if (inactive.length >= 5) {
            const displayList = inactive.slice(0, 10);
            const msg = `👥 *Inactive Users (7+ days)*\n\n` +
                `Total: ${inactive.length} users\n` +
                `Checked: ${checkedCount} users\n\n` +
                `${displayList.join(', ')}` +
                (inactive.length > 10 ? `\n...and ${inactive.length - 10} more` : '');

            await safeSendMessage(state.ownerJid, { text: msg });
        }

    } catch (e) {
        console.error('[ProactiveEngine] Inactive users check failed:', e.message);
    }
}

async function checkWeatherAlert() {
    if (!state.nimesha) return;

    const now = Date.now();
    if (now - state.healthMetrics.lastWeatherAlert < 3600000) return;

    try {
        const lat = config.weatherLat || -0.2867;
        const lon = config.weatherLon || 36.8233;
        const city = config.weatherCity || 'Nairobi';

        const cacheKey = `weather_${lat}_${lon}_${new Date().toDateString()}`;
        if (state.shortTermMemory.has(cacheKey)) return;

        const fetch = require('node-fetch');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const url = `https://api.open-meteo.com/v1/forecast?` +
            `latitude=${lat}&longitude=${lon}` +
            `&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max` +
            `&timezone=${encodeURIComponent(ENGINE_CONFIG.TIMEZONE)}` +
            `&forecast_days=3`;

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!res.ok) throw new Error(`Weather API returned ${res.status}`);

        const data = await res.json();
        if (!data.daily || !Array.isArray(data.daily.weathercode)) return;

        const daily = data.daily;
        const todayCode = daily.weathercode[0];
        const tomorrowCode = daily.weathercode[1];

        state.shortTermMemory.set(cacheKey, { code: todayCode, time: now });

        const severeCodes = [95, 96, 99, 56, 57, 66, 67, 73, 75, 82, 86];
        const warningCodes = [51, 53, 55, 61, 63, 65, 71, 72, 77, 80, 81, 85];

        let severity = 'normal';
        let icon = '🌤️';
        let alertTitle = 'Weather Update';

        if (severeCodes.includes(todayCode)) {
            severity = 'severe';
            icon = '⛈️';
            alertTitle = '*Severe Weather Alert!*';
        } else if (warningCodes.includes(todayCode)) {
            severity = 'warning';
            icon = '🌧️';
            alertTitle = '*Weather Warning*';
        }

        if (severity !== 'normal' || config.alwaysReportWeather) {
            const wmoDescriptions = {
                0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
                45: 'Fog', 48: 'Depositing rime fog',
                51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
                56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
                61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
                66: 'Light freezing rain', 67: 'Heavy freezing rain',
                71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
                77: 'Snow grains',
                80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
                85: 'Slight snow showers', 86: 'Heavy snow showers',
                95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail'
            };

            const desc = wmoDescriptions[todayCode] || 'Unknown conditions';
            const high = daily.temperature_2m_max[0];
            const low = daily.temperature_2m_min[0];
            const precip = daily.precipitation_probability_max[0];

            let msg = `${icon} ${alertTitle}\n\n` +
                `📍 ${city}\n` +
                `🌡 High: ${high}°C / Low: ${low}°C\n` +
                `🌧️ Precipitation: ${precip}%\n` +
                `☁️ Condition: ${desc}\n`;

            if (tomorrowCode && severeCodes.includes(tomorrowCode)) {
                msg += `\n⚠️ *Tomorrow:* Severe weather expected!`;
            }

            if (severity === 'severe') {
                msg += `\n\n*Stay safe, ${ENGINE_CONFIG.OWNER_NAME}.*`;
            }

            await safeSendMessage(state.ownerJid, { text: msg });
            state.healthMetrics.lastWeatherAlert = now;
        }

    } catch (e) {
        console.error('[ProactiveEngine] Weather check failed:', e.message);
    }
}

async function sendLearningDigest() {
    if (!state.nimesha) return;

    const today = new Date().toDateString();
    if (state.healthMetrics.lastDigest === today) return;

    try {
        let cache;
        try {
            const { loadLearningCache } = require('./maureonixcore');
            cache = loadLearningCache();
        } catch (e) {
            return;
        }

        if (!cache || typeof cache !== 'object') return;

        const modules = Array.isArray(cache.modules) ? cache.modules : [];
        if (modules.length === 0) return;

        const validModules = modules.filter(m => m && typeof m === 'object');
        const mastered = validModules.filter(m => m.mastered === true).length;
        const total = validModules.length;

        if (total === 0) return;

        const percentage = Math.round((mastered / total) * 100);
        const remaining = total - mastered;

        let encouragement = 'Keep learning! 🧠';
        if (percentage >= 100) encouragement = "Incredible! You've mastered everything! 🏆";
        else if (percentage >= 75) encouragement = "You're crushing it! Final stretch! 🔥";
        else if (percentage >= 50) encouragement = "Halfway there — momentum is building! 💪";
        else if (percentage >= 25) encouragement = "Great start! Consistency is key! ⭐";

        const msg = `📚 *Learning Digest*\n\n` +
            `📖 Modules: ${total}\n` +
            `✅ Mastered: ${mastered} (${percentage}%)\n` +
            `📝 Remaining: ${remaining}\n\n` +
            `${encouragement}`;

        await safeSendMessage(state.ownerJid, { text: msg });
        state.healthMetrics.lastDigest = today;

    } catch (e) {
        console.error('[ProactiveEngine] Learning digest failed:', e.message);
    }
}

async function checkBackupAge() {
    if (!state.nimesha) return;

    const today = new Date().toDateString();
    if (state.healthMetrics.lastBackupCheck === today) return;

    try {
        let backups;
        try {
            const { listBackups } = require('./maureonixcore');
            backups = listBackups();
        } catch (e) {
            return;
        }

        if (!Array.isArray(backups)) return;

        if (backups.length === 0) {
            await safeSendMessage(state.ownerJid, {
                text: `⚠️ *No backups found.*\n\nYour data is at risk. Run .backupnow immediately.`
            });
            state.healthMetrics.lastBackupCheck = today;
            return;
        }

        const validBackups = backups.filter(b => b && b.created instanceof Date);
        if (validBackups.length === 0) {
            await safeSendMessage(state.ownerJid, {
                text: `⚠️ *Backup integrity check failed.*\nNo valid backup timestamps found.`
            });
            return;
        }

        const latest = validBackups[0];
        const hoursAgo = (Date.now() - latest.created.getTime()) / (1000 * 60 * 60);
        const sizeMB = latest.size ? Math.round(latest.size / 1024 / 1024) : 'unknown';

        if (hoursAgo > 24) {
            const daysAgo = Math.round(hoursAgo / 24 * 10) / 10;
            const msg = `⚠️ *Backup Age Warning*\n\n` +
                `Last backup: ${Math.round(hoursAgo)} hours ago (${daysAgo} days)\n` +
                `Size: ${sizeMB} MB\n` +
                `Location: ${Validation.text(latest.path, 100) || 'unknown'}\n\n` +
                `Run .backupnow to create a fresh backup.`;

            await safeSendMessage(state.ownerJid, { text: msg });
        } else {
            console.log(`[ProactiveEngine] Backup healthy: ${Math.round(hoursAgo)}h ago`);
        }

        state.healthMetrics.lastBackupCheck = today;

    } catch (e) {
        console.error('[ProactiveEngine] Backup check failed:', e.message);
    }
}

async function sendWeeklyTrendReport() {
    if (!state.nimesha) return;

    const weekKey = `${new Date().getFullYear()}-W${getWeekNumber()}`;
    if (state.healthMetrics.lastTrendReport === weekKey) return;

    try {
        loadCoreModules();
        const data = diagnosticsReport.generateFullReport();

        if (!data || typeof data !== 'object') return;

        let trends = '';
        let aiSuccess = false;

        try {
            const tone = state.personalityMatrix._generateTone();
            const aiPromise = AI.ultimateAI(
                `Analyze these weekly system stats and provide a ${tone} trend report with actionable recommendations: ${JSON.stringify(data)}. Focus on: performance trends, resource usage, anomaly patterns, and optimization suggestions. Keep under 400 words.`,
                'system', 'deepseek'
            );

            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 20000));
            const res = await Promise.race([aiPromise, timeout]);
            trends = Validation.text(res?.text, 2000);
            aiSuccess = true;
        } catch (e) {
            trends = 'All indicators are stable. No significant changes detected this week.';
        }

        const memStats = memoryManager.getStats();
        const reminderStats = state.reminderSystem ? state.reminderSystem.getStats() : {};

        const msg = `📈 *Weekly Health Trend Report*\n\n` +
            `${trends}\n\n` +
            `📊 *Quick Stats*\n` +
            `⏱ Uptime: ${data.uptime || 'N/A'}\n` +
            `💾 Heap: ${data.resources?.heapUsed || 'N/A'}\n` +
            `⚡ Latency: ${data.performance?.avgLatency || 'N/A'}\n` +
            `🧠 Memory: ${memStats ? `${memStats.heapUsedMB}MB` : 'N/A'}\n` +
            `⏰ Reminders: ${reminderStats.active || 0} active\n` +
            `🤖 AI Analysis: ${aiSuccess ? '✅' : '⚠️ Fallback'}\n\n` +
            `_Report generated: ${new Date().toLocaleString('en-KE', { timeZone: ENGINE_CONFIG.TIMEZONE })}_`;

        await safeSendMessage(state.ownerJid, { text: msg });
        state.healthMetrics.lastTrendReport = weekKey;

    } catch (e) {
        console.error('[ProactiveEngine] Weekly trend report failed:', e.message);
    }
}

async function crisisFollowUp() {
    if (!state.nimesha) return;
    if (!global.db?.crisisPending || typeof global.db.crisisPending !== 'object') return;

    try {
        const now = Date.now();
        const silenceThreshold = 30 * 60 * 1000;

        for (const [userId, crisisState] of Object.entries(global.db.crisisPending)) {
            if (!crisisState || typeof crisisState !== 'object') continue;

            const validJid = Validation.jid(userId);
            if (!validJid) continue;

            const currentState = crisisState.state || 'unknown';
            const lastMsgTime = Number(crisisState.lastMsgTime);

            if (Number.isNaN(lastMsgTime)) continue;

            if (currentState === 'talking' && now - lastMsgTime > silenceThreshold) {
                crisisState.state = 'checkin';
                crisisState.lastCheckinTime = now;

                const msg = `💙 Just checking in. I'm still here if you need me.`;
                await safeSendMessage(validJid, { text: msg }).catch(() => {});

            } else if (currentState === 'checkin' && now - (crisisState.lastCheckinTime || 0) > silenceThreshold * 2) {
                crisisState.state = 'escalated';

                const alertMsg = `🚨 *Crisis Escalation*\n\n` +
                    `User: ${validJid.split('@')[0]}\n` +
                    `Silent for: ${formatDuration(now - lastMsgTime)}\n` +
                    `Status: Second follow-up sent, no response\n\n` +
                    `Please check on them manually.`;

                await safeSendMessage(state.ownerJid, { text: alertMsg }).catch(() => {});
            }
        }

    } catch (e) {
        console.error('[ProactiveEngine] Crisis follow-up failed:', e.message);
    }
}

async function selfDiagnose() {
    if (!state.nimesha) return;

    const now = Date.now();
    if (now - state.healthMetrics.lastSelfHeal < 300000) return;

    try {
        let diag;
        try {
            const { runSelfDiagnosis } = require('./maureonixcore');
            diag = await runSelfDiagnosis();
        } catch (e) {
            diag = await runBuiltInDiagnostics();
        }

        if (!diag || typeof diag !== 'object') return;

        const healthScore = calculateHealthScore(diag);

        if (diag.status === 'CRITICAL') {
            const recoveryActions = [];

            if (diag.issues && Array.isArray(diag.issues)) {
                const criticalIssues = diag.issues.filter(i => i && i.severity === 'critical');

                let msg = `🛑 *Self-Diagnosis CRITICAL*\n\n` +
                    `Health Score: ${healthScore}/100\n` +
                    `Issues: ${diag.issues.length}\n\n`;

                criticalIssues.forEach((issue, i) => {
                    msg += `${i + 1}. ${Validation.text(issue.message, 200)}\n`;
                    if (issue.suggestion) {
                        msg += `   💡 ${Validation.text(issue.suggestion, 150)}\n`;
                        recoveryActions.push(issue.suggestion);
                    }
                });

                const healResults = await attemptAutoHeal(diag.issues);
                if (healResults.length > 0) {
                    msg += `\n🔧 *Auto-Healing Attempted:*\n`;
                    healResults.forEach(r => {
                        msg += `• ${r.action}: ${r.success ? '✅' : '❌'} ${r.message}\n`;
                    });
                }

                await safeSendMessage(state.ownerJid, { text: msg });
            }
        } else if (diag.status === 'WARNING') {
            console.log(`[ProactiveEngine] Self-diagnosis: ${diag.issues?.length || 0} warnings`);
        } else {
            console.log('[ProactiveEngine] Self-diagnosis: All systems healthy');
        }

        if (diag.issues && diag.issues.length > 0) {
            state.shortTermMemory.set(`diagnose_${now}`, {
                timestamp: now,
                status: diag.status,
                issueCount: diag.issues.length,
                healthScore
            });
        }

        state.healthMetrics.lastSelfHeal = now;

    } catch (e) {
        console.error('[ProactiveEngine] Self-diagnosis failed:', e.message);
    }
}

async function runBuiltInDiagnostics() {
    const issues = [];

    const mem = process.memoryUsage();
    const heapPercent = (mem.heapUsed / mem.heapTotal) * 100;
    if (heapPercent > 85) {
        issues.push({
            severity: 'critical',
            message: `Heap memory at ${heapPercent.toFixed(1)}%`,
            suggestion: 'Consider restarting or increasing --max-old-space-size',
            autoHeal: 'gcHint'
        });
    } else if (heapPercent > 70) {
        issues.push({
            severity: 'warning',
            message: `Heap memory at ${heapPercent.toFixed(1)}%`,
            suggestion: 'Monitor memory usage trends'
        });
    }

    if (state.timers.size > 20) {
        issues.push({
            severity: 'warning',
            message: `${state.timers.size} active timers — possible leak`,
            suggestion: 'Review timer registry for orphaned intervals',
            autoHeal: 'clearCache'
        });
    }

    return {
        status: issues.some(i => i.severity === 'critical') ? 'CRITICAL' : 
                issues.length > 0 ? 'WARNING' : 'HEALTHY',
        issues,
        timestamp: Date.now()
    };
}

function calculateHealthScore(diag) {
    let score = 100;
    if (!diag.issues) return score;

    for (const issue of diag.issues) {
        if (issue.severity === 'critical') score -= 25;
        else if (issue.severity === 'warning') score -= 10;
    }
    return Math.max(0, score);
}

async function attemptAutoHeal(issues) {
    const results = [];

    for (const issue of issues) {
        if (!issue || !issue.autoHeal) continue;

        const result = { action: issue.autoHeal, success: false, message: '' };

        try {
            switch (issue.autoHeal) {
                case 'clearCache':
                    state.shortTermMemory.clear();
                    state.workingMemory.clear();
                    result.success = true;
                    result.message = 'Cleared all caches';
                    break;

                case 'gcHint':
                    if (global.gc) {
                        global.gc();
                        result.success = true;
                        result.message = 'Garbage collection triggered';
                    } else {
                        result.message = 'GC not exposed (run with --expose-gc)';
                    }
                    break;

                case 'trimDB':
                    if (global.db?.reminders && global.db.reminders.length > 1000) {
                        global.db.reminders = global.db.reminders.slice(-500);
                        result.success = true;
                        result.message = 'Trimmed reminder database';
                    }
                    break;

                default:
                    result.message = `Unknown heal action: ${issue.autoHeal}`;
            }
        } catch (e) {
            result.message = `Heal failed: ${e.message}`;
        }

        results.push(result);
    }

    return results;
}

async function learnOwnerActivity() {
    if (!global.db?.users || typeof global.db.users !== 'object') return;

    try {
        const ownerData = global.db.users[state.ownerJid];
        if (!ownerData || typeof ownerData !== 'object') return;

        const hour = new Date().getHours();
        const hourKey = `activity_h_${hour}`;

        const currentCount = state.shortTermMemory.get(hourKey) || 0;
        state.shortTermMemory.set(hourKey, currentCount + 1);

        const hourlyCounts = new Array(24).fill(0);
        for (let h = 0; h < 24; h++) {
            hourlyCounts[h] = state.shortTermMemory.get(`activity_h_${h}`) || 0;
        }

        let bestStart = 7;
        let bestEnd = 23;
        let bestScore = 0;

        for (let start = 0; start < 24; start++) {
            for (let windowSize = 4; windowSize <= 12; windowSize++) {
                let score = 0;
                for (let i = 0; i < windowSize; i++) {
                    const h = (start + i) % 24;
                    score += hourlyCounts[h];
                }
                if (score > bestScore) {
                    bestScore = score;
                    bestStart = start;
                    bestEnd = (start + windowSize - 1) % 24;
                }
            }
        }

        const totalActivity = hourlyCounts.reduce((a, b) => a + b, 0);
        const confidence = totalActivity > 50 ? Math.min(1, bestScore / totalActivity) : 0;

        if (confidence > 0.3 && bestEnd - bestStart >= 4) {
            state.ownerActiveWindow = {
                start: bestStart,
                end: bestEnd,
                confidence: Math.round(confidence * 100)
            };

            if (state.verbose) {
                console.log(`[ProactiveEngine] Activity window: ${bestStart}:00-${bestEnd}:00 (${Math.round(confidence * 100)}% confidence)`);
            }
        }

    } catch (e) {
        console.error('[ProactiveEngine] Activity learning failed:', e.message);
    }
}

function isOwnerActive() {
    const hour = new Date().getHours();
    return hour >= state.ownerActiveWindow.start && hour <= state.ownerActiveWindow.end;
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

function getWeekNumber() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}


// ═══════════════════════════════════════════════════════════════════════════════
//  PUBLIC API — Safe, Validated, Observable, Extensible
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Schedule a proactive message with full safety guarantees.
 * @param {number} delayMinutes - Minutes to wait (0-10080 = 1 week max)
 * @param {string} contact - Target JID (validated)
 * @param {string} text - Message text (sanitized)
 * @param {Object} options - Optional: priority, retryCount, persistent
 * @returns {boolean} Success indicator
 */
function scheduleProactiveMessage(delayMinutes, contact, text, options = {}) {
    if (!state.nimesha) {
        console.error('[ProactiveEngine] Not initialized');
        return false;
    }

    if (state.isShuttingDown) {
        console.error('[ProactiveEngine] Cannot schedule — shutting down');
        return false;
    }

    const validDelay = Validation.number(delayMinutes, 0, 10080, 0);
    const validJid = Validation.jid(contact) || state.ownerJid;
    const validText = Validation.text(text, 4096);

    if (!validText) {
        console.error('[ProactiveEngine] Cannot schedule empty message');
        return false;
    }

    const taskName = `scheduled_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const delayMs = validDelay * 60 * 1000;

    const id = setTimeout(async () => {
        try {
            await safeSendMessage(validJid, { text: validText });
            console.log(`[ProactiveEngine] Scheduled message delivered to ${validJid}`);

            // Store in memory if persistent
            if (options.persistent) {
                state.longTermMemory.store(`scheduled_${taskName}`, {
                    value: { text: validText, delivered: true, at: Date.now() },
                    weight: 0.6,
                    persistent: true
                });
            }
        } catch (e) {
            console.error(`[ProactiveEngine] Scheduled message failed for ${validJid}:`, e.message);

            if (options.retryCount > 0) {
                scheduleProactiveMessage(5, validJid, validText, {
                    ...options,
                    retryCount: options.retryCount - 1
                });
            }
        } finally {
            clearTimer(taskName);
        }
    }, delayMs);

    registerTimer(taskName, id, 'timeout');
    console.log(`[ProactiveEngine] Message scheduled in ${validDelay}min for ${validJid}`);
    return true;
}

/**
 * Create a smart reminder with AI enhancement.
 * @param {string} text - Reminder text
 * @param {Date|string} dueTime - When it's due
 * @param {Object} options - Priority, category, recurring, etc.
 * @returns {Object} The created reminder
 */
function createReminder(text, dueTime, options = {}) {
    if (!state.reminderSystem) {
        console.error('[ProactiveEngine] Reminder system not initialized');
        return null;
    }

    return state.reminderSystem.create(text, dueTime, { smart: true, ...options });
}

/**
 * Complete a reminder by ID or partial ID.
 * @param {string} id - Reminder ID (or first 8 chars)
 * @returns {boolean} Success
 */
function completeReminder(id) {
    if (!state.reminderSystem) return false;

    // Try exact match first
    if (state.reminderSystem.reminders.has(id)) {
        return state.reminderSystem.complete(id);
    }

    // Try partial match
    for (const [remId] of state.reminderSystem.reminders) {
        if (remId.startsWith(id)) {
            return state.reminderSystem.complete(remId);
        }
    }

    return false;
}

/**
 * Snooze a reminder.
 * @param {string} id - Reminder ID
 * @param {number} minutes - Minutes to snooze
 * @returns {boolean} Success
 */
function snoozeReminder(id, minutes = 10) {
    if (!state.reminderSystem) return false;

    if (state.reminderSystem.reminders.has(id)) {
        return state.reminderSystem.snooze(id, minutes);
    }

    for (const [remId] of state.reminderSystem.reminders) {
        if (remId.startsWith(id)) {
            return state.reminderSystem.snooze(remId, minutes);
        }
    }

    return false;
}

/**
 * Get current engine health status.
 * @returns {Object} Comprehensive health report
 */
function getHealthStatus() {
    const memStats = memoryManager.getStats();
    const reminderStats = state.reminderSystem ? state.reminderSystem.getStats() : {};
    const ltmStats = state.longTermMemory ? state.longTermMemory.getStats() : {};

    return {
        initialized: state.isInitialized,
        shuttingDown: state.isShuttingDown,
        consciousnessLevel: state.consciousnessLevel,
        ownerJid: state.ownerJid,
        activeWindow: state.ownerActiveWindow,
        timers: state.timers.size,
        caches: {
            shortTerm: state.shortTermMemory ? state.shortTermMemory.getStats() : null,
            working: state.workingMemory ? state.workingMemory.getStats() : null,
            emotional: state.emotionalState ? state.emotionalState.getStats() : null
        },
        memory: memStats,
        reminders: reminderStats,
        longTermMemory: ltmStats,
        personality: state.personalityMatrix ? state.personalityMatrix.serialize() : null,
        knowledgeGraph: state.knowledgeGraph ? state.knowledgeGraph.serialize() : null,
        healthMetrics: { ...state.healthMetrics },
        uptime: formatDuration(Date.now() - state.healthMetrics.startTime)
    };
}

/**
 * Emergency broadcast to owner.
 * @param {string} text - Alert text
 * @returns {Promise<boolean>} Success
 */
function emergencyAlert(text) {
    if (!state.nimesha || !state.ownerJid) return Promise.resolve(false);

    const sanitized = Validation.text(text, 2000);
    if (!sanitized) return Promise.resolve(false);

    return safeSendMessage(state.ownerJid, { 
        text: `🚨 *EMERGENCY ALERT*\n\n${sanitized}\n\n_Timestamp: ${new Date().toISOString()}_`
    }).then(() => true).catch(() => false);
}

/**
 * Learn from owner interaction.
 * @param {string} message - Owner's message
 * @param {Object} context - Interaction context
 */
function learnFromInteraction(message, context = {}) {
    if (!state.personalityMatrix) return;

    state.personalityMatrix.adapt(message, context);

    // Store in emotional state
    state.emotionalState.set(`interaction_${Date.now()}`, {
        message: Validation.text(message, 1000),
        context,
        timestamp: Date.now()
    }, { weight: 0.6 });
}

/**
 * Add knowledge to the graph.
 * @param {string} subject - Subject
 * @param {string} predicate - Relation
 * @param {string} object - Object
 * @param {number} confidence - Confidence 0-1
 */
function addKnowledge(subject, predicate, object, confidence = 0.8) {
    if (!state.knowledgeGraph) return;

    state.knowledgeGraph.addFact(subject, predicate, object, confidence);

    // Persist important knowledge
    if (confidence > 0.9) {
        state.longTermMemory.store(`knowledge_${subject}_${predicate}`, {
            value: { subject, predicate, object, confidence },
            weight: confidence,
            persistent: true
        });
    }
}

/**
 * Query knowledge graph.
 * @param {string} subject - Subject to query
 * @param {string} relation - Optional relation filter
 * @returns {Array} Facts and inferences
 */
function queryKnowledge(subject, relation = null) {
    if (!state.knowledgeGraph) return [];
    return state.knowledgeGraph.query(subject, relation);
}

/**
 * Get smart suggestions based on learned patterns.
 * @returns {Array} Suggestions
 */
function getSmartSuggestions() {
    if (!state.reminderSystem) return [];
    return state.reminderSystem.getSmartSuggestions();
}

/**
 * Force memory offload.
 * @returns {Promise<Object>} Offload stats
 */
async function forceMemoryOffload() {
    await memoryManager._smartOffload();
    return memoryManager.getStats();
}

/**
 * Get memory dump for analysis.
 * @returns {Promise<string>} Path to dump file
 */
async function createMemoryDump() {
    const dump = {
        timestamp: Date.now(),
        state: {
            consciousnessLevel: state.consciousnessLevel,
            ownerActiveWindow: state.ownerActiveWindow,
            healthMetrics: state.healthMetrics
        },
        memory: memoryManager.getStats(),
        caches: {
            shortTerm: state.shortTermMemory ? state.shortTermMemory.getStats() : null,
            working: state.workingMemory ? state.workingMemory.getStats() : null
        }
    };

    const dumpPath = path.join(ENGINE_CONFIG.LOG_PATH, `memory-dump-${Date.now()}.json`);
    await fs.writeFile(dumpPath, JSON.stringify(dump, null, 2));

    return dumpPath;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    // Core
    init,

    // Messaging
    scheduleProactiveMessage,
    safeSendMessage,
    emergencyAlert,

    // Reminders
    createReminder,
    completeReminder,
    snoozeReminder,

    // Intelligence
    learnFromInteraction,
    addKnowledge,
    queryKnowledge,
    getSmartSuggestions,

    // Monitoring
    getHealthStatus,
    forceMemoryOffload,
    createMemoryDump,

    // State access (read-only recommended)
    _state: state,
    _config: ENGINE_CONFIG,
    _Validation: Validation
};
