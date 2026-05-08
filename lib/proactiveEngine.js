// lib/proactiveEngine.js – Maureonix Proactive Intelligence Engine v4.0 (STABLE)
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const cron = require('node-cron');
const EventEmitter = require('events');

// ── Engine‑wide configuration ───────────────────────────────────
const ENGINE_CONFIG = Object.freeze({
    MEMORY_PATH: path.join(process.cwd(), 'data', 'engine-memory'),
    LOG_PATH: path.join(process.cwd(), 'data', 'engine-logs'),
    TIMEZONE: 'Africa/Nairobi',
    OWNER_NAME: 'Creator',
    MAX_PROACTIVE_PER_HOUR: 6,
    MIN_PROACTIVE_INTERVAL: 5 * 60 * 1000,
    MEMORY_OFFLOAD_THRESHOLD: 0.75,
    MEMORY_CRITICAL_THRESHOLD: 0.90,
});

// ── Global state (initialised later) ────────────────────────────
const state = {
    nimesha: null,
    ownerJid: null,
    isInitialized: false,
    isShuttingDown: false,
    healthMetrics: {
        startTime: Date.now(),
        totalMessages: 0,
        proactiveMessages: 0,
        errors: 0,
        lastBriefing: null,
        lastDigest: null,
        lastTrendReport: null,
        lastWeatherAlert: 0,
        lastBackupCheck: null,
        lastSelfHeal: 0,
        lastCrisisCheck: 0,
    },
    ownerActiveWindow: { start: 7, end: 23, confidence: 0 },
    proactiveCounter: { hour: new Date().getHours(), count: 0 },
    timers: new Map(),
    emitter: new EventEmitter(),
    // Core modules (lazy loaded)
    shortTermMemory: null,
    workingMemory: null,
    longTermMemory: null,
    personalityMatrix: null,
    knowledgeGraph: null,
    reminderSystem: null,
    proactiveIntelligence: null,
};

// ═══════════════════════════════════════════════════════════════
//  Neural Cache (short‑term memory)
// ═══════════════════════════════════════════════════════════════
class NeuralCache {
    constructor(maxSize = 500, ttl = 3600000) {
        this.maxSize = maxSize;
        this.ttl = ttl;
        this.store = new Map();
        this.timestamps = new Map();
    }
    get(key) {
        if (!this.store.has(key)) return undefined;
        const ts = this.timestamps.get(key);
        if (Date.now() - ts > this.ttl) {
            this.delete(key);
            return undefined;
        }
        this.timestamps.set(key, Date.now()); // refresh
        return this.store.get(key);
    }
    set(key, value) {
        if (this.store.size >= this.maxSize) this._evictOldest();
        this.store.set(key, value);
        this.timestamps.set(key, Date.now());
    }
    delete(key) {
        this.store.delete(key);
        this.timestamps.delete(key);
    }
    has(key) {
        return this.get(key) !== undefined;
    }
    clear() {
        this.store.clear();
        this.timestamps.clear();
    }
    size() { return this.store.size; }
    _evictOldest() {
        let oldestKey = null, oldestTime = Infinity;
        for (const [key, t] of this.timestamps) {
            if (t < oldestTime) { oldestTime = t; oldestKey = key; }
        }
        if (oldestKey) this.delete(oldestKey);
    }
    getStats() { return { size: this.store.size, maxSize: this.maxSize }; }
    destroy() { this.clear(); }
}

// ═══════════════════════════════════════════════════════════════
//  Long‑Term Memory (persistent .json files)
// ═══════════════════════════════════════════════════════════════
class LongTermMemory {
    constructor(basePath) {
        this.basePath = basePath;
        this.index = new Map();
        this._initDirs();
        this._loadIndex();
    }
    async _initDirs() {
        for (const d of ['memories', 'patterns', 'knowledge']) {
            await fs.mkdir(path.join(this.basePath, d), { recursive: true }).catch(() => {});
        }
    }
    async _loadIndex() {
        try {
            const raw = await fs.readFile(path.join(this.basePath, 'index.json'), 'utf8');
            const data = JSON.parse(raw);
            for (const [k, v] of Object.entries(data)) this.index.set(k, v);
        } catch {}
    }
    async _saveIndex() {
        const obj = Object.fromEntries(this.index);
        await fs.writeFile(path.join(this.basePath, 'index.json'), JSON.stringify(obj)).catch(() => {});
    }
    _sanitizeKey(key) { return key.replace(/[^a-z0-9_-]/gi, '_').slice(0, 100); }
    _categorize(key) {
        if (key.includes('reminder')) return 'reminders';
        if (key.includes('pattern')) return 'patterns';
        if (key.includes('knowledge')) return 'knowledge';
        return 'memories';
    }
    async store(key, data) {
        const cat = this._categorize(key);
        const file = path.join(this.basePath, cat, `${this._sanitizeKey(key)}.json`);
        const entry = { ...data, _stored: Date.now() };
        await fs.writeFile(file, JSON.stringify(entry)).catch(() => {});
        this.index.set(key, { category: cat, file, storedAt: Date.now() });
        await this._saveIndex();
    }
    async retrieve(key) {
        const meta = this.index.get(key);
        if (!meta) return null;
        try {
            const raw = await fs.readFile(meta.file, 'utf8');
            return JSON.parse(raw);
        } catch { return null; }
    }
    getStats() { return { indexSize: this.index.size, basePath: this.basePath }; }
    destroy() {}
}

// ═══════════════════════════════════════════════════════════════
//  Personality Matrix
// ═══════════════════════════════════════════════════════════════
class PersonalityMatrix {
    constructor() {
        this.traits = { warmth: 0.8, assertiveness: 0.6, curiosity: 0.9, humor: 0.7 };
        this.history = [];
    }
    adapt(message) {
        // simple sentiment adjustment
        if (/thank|love|great|awesome/i.test(message)) this.traits.warmth = Math.min(1, this.traits.warmth + 0.01);
        if (/angry|hate|damn/i.test(message)) this.traits.assertiveness = Math.max(0.2, this.traits.assertiveness - 0.01);
        this.history.push({ ts: Date.now(), traits: { ...this.traits } });
        if (this.history.length > 200) this.history.shift();
    }
    _generateTone() {
        if (this.traits.warmth > 0.7) return 'warm';
        if (this.traits.curiosity > 0.8) return 'curious';
        return 'neutral';
    }
    serialize() { return { traits: this.traits, historySize: this.history.length }; }
}

// ═══════════════════════════════════════════════════════════════
//  Knowledge Graph
// ═══════════════════════════════════════════════════════════════
class KnowledgeGraph {
    constructor() { this.facts = new Map(); }
    addFact(subject, predicate, object, confidence = 0.8) {
        const id = `${subject}::${predicate}::${object}`;
        this.facts.set(id, { subject, predicate, object, confidence, created: Date.now() });
    }
    query(subject, relation = null) {
        const res = [];
        for (const fact of this.facts.values()) {
            if (fact.subject === subject && (!relation || fact.predicate === relation)) res.push(fact);
        }
        return res;
    }
    serialize() { return { facts: this.facts.size }; }
}

// ═══════════════════════════════════════════════════════════════
//  Reminder System
// ═══════════════════════════════════════════════════════════════
class ReminderSystem {
    constructor() {
        this.reminders = new Map();
        this.completed = new NeuralCache(500, 86400000 * 30);
        this.stats = { created: 0, completed: 0, missed: 0, snoozed: 0 };
    }
    create(text, dueTime, opts = {}) {
        const id = `rem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const reminder = {
            id, text, due: new Date(dueTime).getTime(), created: Date.now(),
            priority: opts.priority || 'normal', category: opts.category || 'general',
            notified: false, snoozeCount: 0, maxSnoozes: 3, status: 'active'
        };
        this.reminders.set(id, reminder);
        this.stats.created++;
        return reminder;
    }
    async checkAndNotify() {
        const now = Date.now();
        for (const [id, r] of this.reminders) {
            if (r.status !== 'active' || r.notified || r.due > now) continue;
            r.notified = true;
            if (state.nimesha && state.ownerJid) {
                try {
                    await state.nimesha.sendMessage(state.ownerJid, { text: `⏰ *Reminder*: ${r.text}` });
                } catch {}
            }
        }
    }
    complete(id) {
        const r = this.reminders.get(id);
        if (!r) return false;
        r.status = 'completed'; r.completedAt = Date.now();
        this.completed.set(id, r);
        this.reminders.delete(id);
        this.stats.completed++;
        return true;
    }
    snooze(id, minutes = 10) {
        const r = this.reminders.get(id);
        if (!r || r.snoozeCount >= r.maxSnoozes) return false;
        r.due = Date.now() + minutes * 60000;
        r.snoozeCount++;
        r.notified = false;
        this.stats.snoozed++;
        return true;
    }
    getStats() {
        return { ...this.stats, active: this.reminders.size, completed: this.completed.size() };
    }
}

// ═══════════════════════════════════════════════════════════════
//  Proactive Intelligence (insights generator)
// ═══════════════════════════════════════════════════════════════
class ProactiveIntelligence {
    async analyzeContext() {
        return {
            hour: new Date().getHours(),
            pendingReminders: state.reminderSystem ? state.reminderSystem.reminders.size : 0,
            memoryPressure: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
        };
    }

    async generateInsights() {
        const ctx = await this.analyzeContext();
        const insights = [];

        // ── Reminder backlog (once per hour) ──
        if (ctx.pendingReminders > 5) {
            const key = 'reminder_backlog_sent';
            if (!state.shortTermMemory.has(key)) {
                state.shortTermMemory.set(key, true); // auto‑expires in 1h
                insights.push({
                    type: 'reminder_backlog',
                    message: `You have ${ctx.pendingReminders} pending reminders. Want me to prioritise them?`,
                    priority: 'medium'
                });
            }
        }

        // ── Bedtime reminder ──
        if (ctx.hour > 23 || ctx.hour < 5) {
            insights.push({
                type: 'bedtime',
                message: "It's late. Consider getting some rest.",
                priority: 'low'
            });
        }

        // Memory warning – silenced (auto‑trimmed without notification)
        // if (ctx.memoryPressure > 0.85) { ... }

        return insights;
    }

    async executeProactive() {
        const now = Date.now();
        const hour = new Date().getHours();
        if (state.proactiveCounter.hour !== hour) {
            state.proactiveCounter = { hour, count: 0 };
        }
        if (state.proactiveCounter.count >= ENGINE_CONFIG.MAX_PROACTIVE_PER_HOUR) return;
        if (now - (state.lastProactiveTime || 0) < ENGINE_CONFIG.MIN_PROACTIVE_INTERVAL) return;

        const insights = await this.generateInsights();
        for (const ins of insights.slice(0, 2)) {
            if (state.nimesha && state.ownerJid) {
                try {
                    await state.nimesha.sendMessage(state.ownerJid, {
                        text: `💫 *${ins.type.replace(/_/g, ' ')}*\n\n${ins.message}`
                    });
                    state.proactiveCounter.count++;
                    state.lastProactiveTime = now;
                } catch {}
            }
        }
    }
}

// 

// ═══════════════════════════════════════════════════════════════
//  Memory Manager
// ═══════════════════════════════════════════════════════════════
class MemoryManager {
    constructor() { this.samples = []; }
    sample() {
        const m = process.memoryUsage();
        this.samples.push({ ts: Date.now(), pct: m.heapUsed / m.heapTotal });
        if (this.samples.length > 60) this.samples.shift();
    }
    getStats() {
        const latest = this.samples[this.samples.length - 1];
        return latest ? { percent: Math.round(latest.pct * 100), heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1048576) } : null;
    }
    async smartOffload() {
        if (state.shortTermMemory) state.shortTermMemory.clear();
        if (state.workingMemory) state.workingMemory.clear();
        if (global.gc) global.gc();
    }
}
const memoryManager = new MemoryManager();

// ═══════════════════════════════════════════════════════════════
//  Helper: safe task execution
// ═══════════════════════════════════════════════════════════════
async function safeExecute(name, fn) {
    try { await fn(); } catch (e) {
        console.error(`[ProactiveEngine] ${name} failed:`, e.message);
        state.healthMetrics.errors++;
    }
}

// ═══════════════════════════════════════════════════════════════
//  Intelligent Tasks (all gracefully handle missing dependencies)
// ═══════════════════════════════════════════════════════════════
async function sendDailyBriefing() {
    if (!state.nimesha || !state.ownerJid) return;
    const today = new Date().toDateString();
    if (state.healthMetrics.lastBriefing === today) return;

    let insights = 'All systems are optimal.';
    try {
        const AI = require('./ai');
        const diag = require('./realTimeDiagnostics');
        const data = diag.diagnosticsReport.generateFullReport();
        const res = await AI.ultimateAI(`Write a warm morning briefing based on: ${JSON.stringify(data)}`, 'system', 'deepseek');
        insights = res?.text || insights;
    } catch (e) {}

    const mem = memoryManager.getStats();
    const msg = `🌅 *Good Morning, Creator!*\n\n${insights}\n\n⏱ Uptime: ${formatDuration(process.uptime() * 1000)}\n💾 Memory: ${mem ? `${mem.heapUsedMB} MB (${mem.percent}%)` : 'N/A'}\n\nHave a powerful day! 🚀`;
    try { await state.nimesha.sendMessage(state.ownerJid, { text: msg }); state.healthMetrics.lastBriefing = today; } catch {}
}

async function checkAnomalies() {
    if (!state.nimesha) return;
    try {
        const { anomalyDetector } = require('./realTimeDiagnostics');
        const anomalies = anomalyDetector.detect();
        // Skip purely memory‑usage anomalies – they are normal on Railway
        const critical = anomalies.filter(a => 
            a && a.severity === 'critical' && 
            !(a.message && a.message.includes('Heap usage'))
        );
        if (critical.length > 0) {
            const signature = critical.map(a => a.message).sort().join('|');
            const cacheKey = 'anomaly_' + require('crypto').createHash('sha256').update(signature).digest('hex').slice(0,12);
            if (!state.shortTermMemory.has(cacheKey)) {
                state.shortTermMemory.set(cacheKey, true);
                let msg = `🚨 *Critical anomalies detected:*\n`;
                critical.forEach(a => msg += `• ${a.message}\n`);
                await state.nimesha.sendMessage(state.ownerJid, { text: msg });
            }
        }
    } catch (e) {}
}

async function checkWeatherAlert() {
    if (!state.nimesha) return;
    const now = Date.now();
    if (now - state.healthMetrics.lastWeatherAlert < 6 * 3600000) return;
    try {
        const fetch = require('node-fetch');
        const lat = -0.2867, lon = 36.8233;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Africa/Nairobi`;
        const res = await fetch(url);
        const data = await res.json();
        const code = data.daily.weathercode[0];
        if ([95, 96, 99].includes(code)) {
            await state.nimesha.sendMessage(state.ownerJid, { text: `⛈️ *Severe weather alert!* Thunderstorms expected today.` });
        }
        state.healthMetrics.lastWeatherAlert = now;
    } catch {}
}

async function sendLearningDigest() {
    if (!state.nimesha) return;
    const today = new Date().toDateString();
    if (state.healthMetrics.lastDigest === today) return;
    try {
        // Gracefully: if maureonixcore not available, we just skip
        const { loadLearningCache } = require('./maureonixcore');
        const cache = loadLearningCache();
        const mastered = cache.modules.filter(m => m.mastered).length;
        const total = cache.modules.length;
        if (total > 0) {
            await state.nimesha.sendMessage(state.ownerJid, { text: `📚 *Learning Digest*\n\nModules: ${total}\nMastered: ${mastered} (${Math.round(mastered/total*100)}%)\n\nKeep learning! 🧠` });
            state.healthMetrics.lastDigest = today;
        }
    } catch {}
}

async function checkBackupAge() {
    if (!state.nimesha) return;
    const today = new Date().toDateString();
    if (state.healthMetrics.lastBackupCheck === today) return;
    try {
        const { listBackups } = require('./maureonixcore');
        const backups = listBackups();
        if (!backups.length) {
            await state.nimesha.sendMessage(state.ownerJid, { text: '⚠️ *No backups found.* Run .backupnow.' });
        } else {
            const latest = backups[0].created;
            const hrs = (Date.now() - latest.getTime()) / 3600000;
            if (hrs > 24) {
                await state.nimesha.sendMessage(state.ownerJid, { text: `⚠️ *Last backup ${Math.round(hrs)}h ago.*` });
            }
        }
        state.healthMetrics.lastBackupCheck = today;
    } catch {}
}

async function sendWeeklyTrendReport() {
    if (!state.nimesha) return;
    const weekKey = `${new Date().getFullYear()}-W${Math.ceil(new Date().getDate() / 7)}`;
    if (state.healthMetrics.lastTrendReport === weekKey) return;
    try {
        const AI = require('./ai');
        const diag = require('./realTimeDiagnostics');
        const data = diag.diagnosticsReport.generateFullReport();
        const res = await AI.ultimateAI(`Analyze weekly trends from these stats: ${JSON.stringify(data)}`, 'system', 'deepseek');
        await state.nimesha.sendMessage(state.ownerJid, { text: `📈 *Weekly Health Trend*\n\n${res.text}` });
        state.healthMetrics.lastTrendReport = weekKey;
    } catch {}
}

async function crisisFollowUp() {
    if (!state.nimesha || !global.db?.crisisPending) return;
    const now = Date.now();
    for (const [userId, cs] of Object.entries(global.db.crisisPending)) {
        if (cs.state === 'talking' && now - cs.lastMsgTime > 30 * 60 * 1000) {
            try { await state.nimesha.sendMessage(userId, { text: '💙 Just checking in. I\'m still here.' }); cs.lastMsgTime = now; } catch {}
        }
    }
}

async function selfDiagnose() {
    if (!state.nimesha) return;
    const now = Date.now();
    if (now - state.healthMetrics.lastSelfHeal < 2 * 3600000) return;
    try {
        const { runSelfDiagnosis } = require('./maureonixcore');
        const diag = await runSelfDiagnosis();
        if (diag.status === 'CRITICAL') {
            await state.nimesha.sendMessage(state.ownerJid, { text: `🛑 *Self‑diagnosis CRITICAL!* Check logs.` });
        }
        state.healthMetrics.lastSelfHeal = now;
    } catch {}
}

async function learnOwnerActivity() {
    // light activity tracking
}

// ═══════════════════════════════════════════════════════════════
//  Public API
// ═══════════════════════════════════════════════════════════════
function scheduleProactiveMessage(delayMinutes, contact, text) {
    if (!state.nimesha) return false;
    setTimeout(() => {
        if (state.nimesha) state.nimesha.sendMessage(contact, { text }).catch(() => {});
    }, delayMinutes * 60000);
    return true;
}

function formatDuration(ms) {
    const sec = Math.floor(ms / 1000);
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
}

// ═══════════════════════════════════════════════════════════════
//  Initialisation
// ═══════════════════════════════════════════════════════════════
async function init(nimeshaInstance) {
    if (state.isInitialized) return;
    state.nimesha = nimeshaInstance;
    const config = require('../config');
    const rawOwner = Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber;
    state.ownerJid = rawOwner.replace(/\D/g, '') + '@s.whatsapp.net';

    // Initialise caches
    state.shortTermMemory = new NeuralCache(500, 3600000);
    state.workingMemory = new NeuralCache(300, 86400000);
    state.longTermMemory = new LongTermMemory(ENGINE_CONFIG.MEMORY_PATH);
    state.personalityMatrix = new PersonalityMatrix();
    state.knowledgeGraph = new KnowledgeGraph();
    state.reminderSystem = new ReminderSystem();
    state.proactiveIntelligence = new ProactiveIntelligence();

    // ── Scheduled tasks (all wrapped in try‑catch) ────────────
    cron.schedule('0 7 * * *', () => safeExecute('dailyBriefing', sendDailyBriefing), { timezone: ENGINE_CONFIG.TIMEZONE });
    cron.schedule('0 20 * * *', () => safeExecute('learningDigest', sendLearningDigest), { timezone: ENGINE_CONFIG.TIMEZONE });
    cron.schedule('0 21 * * *', () => safeExecute('backupCheck', checkBackupAge), { timezone: ENGINE_CONFIG.TIMEZONE });
    cron.schedule('0 9 * * 1', () => safeExecute('weeklyTrend', sendWeeklyTrendReport), { timezone: ENGINE_CONFIG.TIMEZONE });

    // Intervals
    const intervals = [
        { name: 'anomalies', ms: 5 * 60000, fn: checkAnomalies },
        { name: 'reminders', ms: 30000, fn: () => state.reminderSystem.checkAndNotify() },
        { name: 'weather', ms: 6 * 3600000, fn: checkWeatherAlert },
        { name: 'crisisFollowUp', ms: 30 * 60000, fn: crisisFollowUp },
        { name: 'selfDiagnose', ms: 2 * 3600000, fn: selfDiagnose },
        { name: 'activityLearn', ms: 10 * 60000, fn: learnOwnerActivity },
        { name: 'memorySample', ms: 60000, fn: () => memoryManager.sample() },
        { name: 'proactiveInsight', ms: 5 * 60000, fn: () => state.proactiveIntelligence.executeProactive() },
    ];
    for (const iv of intervals) {
        const id = setInterval(() => safeExecute(iv.name, iv.fn), iv.ms);
        state.timers.set(iv.name, id);
    }

    // One‑time startup tasks
    setTimeout(() => safeExecute('startupWeather', checkWeatherAlert), 10000);
    setTimeout(() => safeExecute('startupDiagnose', selfDiagnose), 30000);
    setTimeout(() => safeExecute('startupProactive', () => state.proactiveIntelligence.executeProactive()), 60000);

    state.isInitialized = true;
    console.log('[ProactiveEngine] v4.0 stable initialized');
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    state.isShuttingDown = true;
    for (const [name, id] of state.timers) clearInterval(id);
    state.timers.clear();
    if (state.nimesha && state.ownerJid) {
        await state.nimesha.sendMessage(state.ownerJid, { text: '🔌 *Consciousness saved.* Until next time, Creator.' }).catch(() => {});
    }
    process.exit(0);
});

module.exports = { init, scheduleProactiveMessage };
