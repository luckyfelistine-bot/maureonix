// lib/ai.js – MAUREONIX OMNISCIENT AI ENGINE (STABILITY & MEMORY FIXES)
const fetch = require('node-fetch');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
//   MODEL REGISTRY
// ═══════════════════════════════════════════════════════════════════════════
const MODELS = {
    flash: 'llama-3.1-8b-instant',
    promptGuard22m: 'meta-llama/llama-prompt-guard-2-22m',
    promptGuard86m: 'meta-llama/llama-prompt-guard-2-86m',
    instant: 'llama-3.1-8b-instant',
    gemma: 'gemma2-9b-it',
    allam: 'allam-2-7b',
    versatile: 'llama-3.3-70b-versatile',
    qwen: 'qwen/qwen3-32b',
    gpt20b: 'openai/gpt-oss-20b',
    scout: 'meta-llama/llama-4-scout-17b-16e-instruct',
    orpheus: 'canopylabs/orpheus-v1-english',
    gpt120b: 'openai/gpt-oss-120b',
    compound: 'groq/compound',
    compoundMini: 'groq/compound-mini',
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
    translation: MODELS.instant,
    creative: MODELS.orpheus,
    crisis: MODELS.versatile,
    system: MODELS.scout,
    quick: MODELS.instant,
    debate: MODELS.versatile,
    constitutional: MODELS.gpt20b,
    meta: MODELS.scout,
    learning: MODELS.compound,
};
exports.TASK_MODEL = TASK_MODEL;

// ═══════════════════════════════════════════════════════════════════════════
//   QUANTUM LOAD BALANCER – full implementation
// ═══════════════════════════════════════════════════════════════════════════
class QuantumLoadBalancer {
    constructor() {
        this.keys = [];
        this.index = 0;
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
                this.health.set(key, { failures: 0, lastFailTime: 0, cooldownUntil: 0, avgLatency: 2000 });
                this.loadCounts.set(key, 0);
                this.latencyLog.set(key, []);
                this.successStreak.set(key, 0);
                this.predictedFailure.set(key, 0);
            }
        }
        console.log(`[QuantumLoadBalancer] Registered ${this.keys.length} keys`);
    }

    getNext(preferredLatency = null) {
        if (this.keys.length === 0) throw new Error('No API keys configured');
        const now = Date.now();
        const scored = this.keys.map(key => {
            const h = this.health.get(key);
            const streak = this.successStreak.get(key) || 0;
            const predicted = this.predictedFailure.get(key) || 0;
            if (now < h.cooldownUntil) return { key, score: Infinity };
            let score = h.avgLatency + (h.failures * 5000) - (streak * 100) + (predicted * 3000) + ((this.loadCounts.get(key) || 0) * 50);
            return { key, score };
        }).sort((a, b) => a.score - b.score);
        const best = scored[0];
        if (best.score === Infinity) {
            let bestKey = this.keys[0], bestWait = Infinity;
            for (const k of this.keys) {
                const wait = Math.max(0, this.health.get(k).cooldownUntil - now);
                if (wait < bestWait) { bestWait = wait; bestKey = k; }
            }
            return bestKey;
        }
        this.loadCounts.set(best.key, (this.loadCounts.get(best.key) || 0) + 1);
        return best.key;
    }

    reportFailure(key, latency = null) {
        const h = this.health.get(key);
        if (!h) return;
        h.failures++;
        h.lastFailTime = Date.now();
        this.successStreak.set(key, 0);
        const baseCooldown = Math.min(5000 * Math.pow(2, h.failures - 1), 300000);
        const jitter = Math.floor(Math.random() * 2000);
        h.cooldownUntil = Date.now() + baseCooldown + jitter;
        const currentPred = this.predictedFailure.get(key) || 0;
        this.predictedFailure.set(key, currentPred * 0.7 + 0.3);
    }

    reportSuccess(key, latency) {
        const h = this.health.get(key);
        if (!h) return;
        h.failures = Math.max(0, h.failures - 1);
        h.cooldownUntil = 0;
        this.successStreak.set(key, (this.successStreak.get(key) || 0) + 1);
        this.predictedFailure.set(key, (this.predictedFailure.get(key) || 0) * 0.5);
        const logs = this.latencyLog.get(key);
        logs.push(latency);
        if (logs.length > 20) logs.shift();
        h.avgLatency = logs.reduce((a, b) => a + b, 0) / logs.length;
    }

    getReport() {
        const report = {};
        for (const key of this.keys) {
            const short = key.substring(0, 12) + '...';
            const h = this.health.get(key);
            report[short] = {
                healthy: Date.now() >= (h?.cooldownUntil || 0),
                failures: h?.failures || 0,
                loads: this.loadCounts.get(key) || 0,
                avgLatency: Math.round(h?.avgLatency || 0) + 'ms',
                successStreak: this.successStreak.get(key) || 0,
                predFail: ((this.predictedFailure.get(key) || 0) * 100).toFixed(1) + '%',
            };
        }
        return report;
    }
}

const keyManager = new QuantumLoadBalancer();
try {
    if (global.groqApiKeys && Array.isArray(global.groqApiKeys)) {
        keyManager.register(global.groqApiKeys);
    } else if (process.env.GROQ_API_KEY) {
        keyManager.register(process.env.GROQ_API_KEY);
    } else {
        const config = require(process.cwd() + '/config');
        if (config?.groqApiKeys) keyManager.register(config.groqApiKeys);
    }
} catch (err) {
    console.error('[QuantumLoadBalancer] registration error:', err.message);
}
exports.keyManager = keyManager;

// ═══════════════════════════════════════════════════════════════════════════
//   HYPER MEMORY SYSTEM – unified interface with compression
// ═══════════════════════════════════════════════════════════════════════════
class HyperMemorySystem {
    constructor() {
        this.working = new Map();
        this.episodic = new Map();
        this.semantic = new Map();
        this.procedural = new Map();
        this.WORKING_MAX = 30;
        this.EPISODIC_MAX = 100;
    }
    getWorking(userId) {
        if (!this.working.has(userId)) this.working.set(userId, []);
        return this.working.get(userId);
    }
    addWorking(userId, role, content, emotion = 'neutral') {
        const mem = this.getWorking(userId);
        mem.push({ role, content, timestamp: Date.now(), emotion, hash: this._hash(content) });
        if (mem.length > this.WORKING_MAX) {
            const removed = mem.splice(0, mem.length - this.WORKING_MAX);
            for (const entry of removed) {
                if (entry.emotion !== 'neutral' || entry.role === 'system') {
                    this.addEpisodic(userId, entry.content, entry.emotion, entry.role === 'system' ? 0.8 : 0.5);
                }
            }
        }
    }
    addEpisodic(userId, event, emotion = 'neutral', importance = 0.5) {
        if (!this.episodic.has(userId)) this.episodic.set(userId, []);
        const eps = this.episodic.get(userId);
        eps.push({ event, emotion, importance, timestamp: Date.now(), id: crypto.randomUUID() });
        eps.sort((a, b) => b.importance - a.importance);
        if (eps.length > this.EPISODIC_MAX) eps.length = this.EPISODIC_MAX;
    }
    addSemantic(userId, fact, confidence = 1.0, source = 'conversation') {
        if (!this.semantic.has(userId)) this.semantic.set(userId, { facts: new Map(), concepts: new Map() });
        const sem = this.semantic.get(userId);
        const key = this._hash(fact);
        sem.facts.set(key, { fact, confidence, source, timestamp: Date.now(), accessCount: 0 });
    }
    retrieveRelevant(userId, query, maxEntries = 20) {
        const working = this.getWorking(userId);
        const episodic = this.episodic.get(userId) || [];
        const semantic = this.semantic.get(userId);
        const queryWords = new Set(query.toLowerCase().split(/\s+/));
        const scored = [];
        for (const entry of working.slice(-10)) {
            const score = this._relevanceScore(entry.content, queryWords);
            scored.push({ ...entry, tier: 'working', score });
        }
        for (const entry of episodic.slice(0, 20)) {
            const score = this._relevanceScore(entry.event, queryWords) * entry.importance;
            scored.push({ ...entry, tier: 'episodic', score });
        }
        if (semantic) {
            for (const [_, fact] of semantic.facts) {
                const score = this._relevanceScore(fact.fact, queryWords) * fact.confidence;
                scored.push({ ...fact, tier: 'semantic', score });
            }
        }
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, maxEntries);
    }
    clear(userId) {
        this.working.delete(userId);
        this.episodic.delete(userId);
        this.semantic.delete(userId);
        this.procedural.delete(userId);
    }
    _hash(text) { return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16); }
    _relevanceScore(text, queryWords) {
        const words = text.toLowerCase().split(/\s+/);
        let matches = 0;
        for (const w of words) if (queryWords.has(w)) matches++;
        return matches / Math.max(words.length, queryWords.size);
    }
}

const hyperMemory = new HyperMemorySystem();
const AI_MEMORY = new Map(); // backward compatibility
function getMemory(userId) { return hyperMemory.getWorking(userId); }
function addToMemory(userId, role, content) { hyperMemory.addWorking(userId, role, content); }
function clearMemory(userId) { hyperMemory.clear(userId); AI_MEMORY.delete(userId); }
exports.getMemory = getMemory;
exports.addToMemory = addToMemory;
exports.clearMemory = clearMemory;
exports.AI_MEMORY = AI_MEMORY;

// ═══════════════════════════════════════════════════════════════════════════
//   KNOWLEDGE GRAPH – complete
// ═══════════════════════════════════════════════════════════════════════════
class KnowledgeGraph {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.nodeIndex = new Map();
    }
    addNode(label, type = 'concept', properties = {}) {
        const id = this._nodeId(label);
        if (!this.nodes.has(id)) {
            this.nodes.set(id, { id, label, type, properties, created: Date.now() });
            this.nodeIndex.set(label.toLowerCase(), id);
        }
        return id;
    }
    addEdge(sourceLabel, targetLabel, relation, weight = 1.0) {
        const sourceId = this.addNode(sourceLabel);
        const targetId = this.addNode(targetLabel);
        const edgeKey = `${sourceId}|${targetId}|${relation}`;
        const existing = this.edges.get(edgeKey);
        if (existing) {
            existing.weight = Math.min(1.0, existing.weight + 0.1);
            existing.timestamp = Date.now();
        } else {
            this.edges.set(edgeKey, { source: sourceId, target: targetId, relation, weight, timestamp: Date.now() });
        }
    }
    extractFromText(text) {
        const entities = [];
        const capitalized = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
        const quoted = text.match(/"([^"]+)"/g) || [];
        for (const e of [...capitalized, ...quoted.map(q => q.slice(1, -1))]) {
            if (e.length > 2) entities.push(e);
        }
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < Math.min(i + 3, entities.length); j++) {
                this.addEdge(entities[i], entities[j], 'related', 0.3);
            }
        }
        return entities;
    }
    _nodeId(label) { return crypto.createHash('sha256').update(label.toLowerCase()).digest('hex').slice(0, 16); }
}
const globalKnowledgeGraph = new KnowledgeGraph();
exports.knowledgeGraph = globalKnowledgeGraph;

// ═══════════════════════════════════════════════════════════════════════════
//   EXPERT COUNCIL – simplified but functional
// ═══════════════════════════════════════════════════════════════════════════
const EXPERTS = {
    analyst: { name: 'The Analyst', weight: 1.2, persona: 'You are The Analyst — logical, fact-obsessed. Prioritise accuracy and evidence.' },
    creative: { name: 'The Creative', weight: 1.0, persona: 'You are The Creative — visionary, lateral-thinking, find novel solutions.' },
    skeptic: { name: 'The Skeptic', weight: 1.3, persona: 'You are The Skeptic — find flaws, edge cases, inconsistencies.' },
    ethicist: { name: 'The Ethicist', weight: 1.4, persona: 'You are The Ethicist — evaluate fairness, harm, transparency.' },
    executor: { name: 'The Executor', weight: 1.1, persona: 'You are The Executor — pragmatic, focus on what actually works.' },
};
async function expertCouncilDebate(prompt, userId, context = {}) {
    const opinions = [];
    const models = [MODELS.versatile, MODELS.qwen, MODELS.scout, MODELS.gpt20b, MODELS.versatile];
    const expertKeys = Object.keys(EXPERTS);
    for (let i = 0; i < expertKeys.length; i++) {
        const key = expertKeys[i];
        const expert = EXPERTS[key];
        const systemPrompt = `${expert.persona}\n\nProvide your analysis in 2-3 sentences. Format: [STANCE: support|concern|neutral] Your analysis.`;
        try {
            const result = await groqChat(`TOPIC: "${prompt}"\nContext: ${JSON.stringify(context)}`, models[i % models.length], userId, systemPrompt, 0.4, 300);
            const stanceMatch = result.text.match(/\[STANCE:\s*(support|concern|neutral)\]/i);
            const stance = stanceMatch ? stanceMatch[1].toLowerCase() : 'neutral';
            const cleanText = result.text.replace(/\[STANCE:[^\]]+\]/i, '').trim();
            opinions.push({ expert: key, name: expert.name, stance, text: cleanText, weight: expert.weight });
        } catch (e) {
            opinions.push({ expert: key, name: expert.name, stance: 'neutral', text: 'Analysis unavailable.', weight: expert.weight });
        }
    }
    const supportWeight = opinions.filter(o => o.stance === 'support').reduce((s, o) => s + o.weight, 0);
    const concernWeight = opinions.filter(o => o.stance === 'concern').reduce((s, o) => s + o.weight, 0);
    const totalWeight = opinions.reduce((s, o) => s + o.weight, 0);
    const consensusScore = (supportWeight - concernWeight) / totalWeight;
    const debateLog = opinions.map(o => `${o.name} [${o.stance.toUpperCase()}]: ${o.text}`).join('\n');
    return { opinions, consensusScore, debateLog, isControversial: Math.abs(consensusScore) < 0.3, dominantStance: consensusScore > 0.2 ? 'support' : consensusScore < -0.2 ? 'concern' : 'mixed' };
}
exports.expertCouncilDebate = expertCouncilDebate;

// ═══════════════════════════════════════════════════════════════════════════
//   CONSTITUTIONAL COUNCIL – simple but effective
// ═══════════════════════════════════════════════════════════════════════════
const CONSTITUTION = [
    { principle: 'Helpfulness', desc: 'The response must genuinely help the user.' },
    { principle: 'Harmlessness', desc: 'The response must not cause harm.' },
    { principle: 'Honesty', desc: 'The response must be truthful.' },
    { principle: 'Respect', desc: 'The response must respect human dignity.' },
    { principle: 'Privacy', desc: 'The response must not expose private data.' },
];
async function constitutionalReview(response, prompt, userId) {
    const reviewPrompt = `Review the AI response against these principles:\n${CONSTITUTION.map(c => `- ${c.principle}: ${c.desc}`).join('\n')}\n\nUSER PROMPT: "${prompt.slice(0, 500)}"\n\nAI RESPONSE: "${response.slice(0, 1000)}"\n\nScore each principle 0-10. Identify any violations. Output JSON: {scores: {principle: number}, violations: [{principle, issue, suggestion}], revisedResponse: string}`;
    try {
        const result = await groqChat(reviewPrompt, TASK_MODEL.constitutional, userId, null, 0.1, 800);
        const jsonMatch = result.text.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) return { approved: true, scores: {}, violations: [], revised: response };
        const review = JSON.parse(jsonMatch[0]);
        const avgScore = Object.values(review.scores || {}).reduce((a, b) => a + b, 0) / CONSTITUTION.length;
        const criticalViolations = (review.violations || []).filter(v => ['Harmlessness', 'Privacy', 'Honesty'].includes(v.principle));
        return { approved: avgScore >= 7.0 && criticalViolations.length === 0, scores: review.scores, violations: review.violations || [], revised: review.revisedResponse || response, avgScore };
    } catch (e) {
        return { approved: true, scores: {}, violations: [], revised: response, avgScore: 10 };
    }
}
exports.constitutionalReview = constitutionalReview;

// ═══════════════════════════════════════════════════════════════════════════
//   PREDICTIVE ENGINE – simplified
// ═══════════════════════════════════════════════════════════════════════════
class PredictiveEngine {
    constructor() {
        this.userModels = new Map();
    }
    recordInteraction(userId, intent, topic, responseType) {
        if (!this.userModels.has(userId)) this.userModels.set(userId, { patterns: new Map(), lastTopics: [], sessionFlow: [], totalInteractions: 0 });
        const model = this.userModels.get(userId);
        model.totalInteractions++;
        model.lastTopics.unshift(topic);
        if (model.lastTopics.length > 10) model.lastTopics.pop();
        model.sessionFlow.push({ intent, topic, responseType, time: Date.now() });
        if (model.sessionFlow.length > 20) model.sessionFlow.shift();
        const patternKey = `${intent}|${topic}`;
        model.patterns.set(patternKey, (model.patterns.get(patternKey) || 0) + 1);
    }
    predictNext(userId, currentContext) {
        const model = this.userModels.get(userId);
        if (!model || model.totalInteractions < 3) return [];
        const predictions = [];
        for (const [key, count] of model.patterns) {
            if (count >= 2) {
                const [intent, topic] = key.split('|');
                predictions.push({ intent, topic, confidence: Math.min(0.9, count / model.totalInteractions * 3), source: 'pattern' });
            }
        }
        const lastTopic = model.lastTopics[0];
        if (lastTopic) {
            const followUpMap = { 'song': ['video', 'lyrics'], 'weather': ['news'], 'menu': ['help'], 'ai': ['code'], 'game': ['rpg'] };
            const followUps = followUpMap[lastTopic] || [];
            for (const fu of followUps) predictions.push({ intent: fu, topic: fu, confidence: 0.4, source: 'topic_chain' });
        }
        predictions.sort((a, b) => b.confidence - a.confidence);
        return predictions.slice(0, 3);
    }
}
const predictiveEngine = new PredictiveEngine();
exports.predictiveEngine = predictiveEngine;

// ═══════════════════════════════════════════════════════════════════════════
//   SELF-REFLECTION ENGINE – simplified
// ═══════════════════════════════════════════════════════════════════════════
class SelfReflectionEngine {
    constructor() {
        this.executionLog = [];
        this.insights = [];
        this.improvementQueue = [];
    }
    logExecution(data) {
        this.executionLog.push({ ...data, id: crypto.randomUUID(), timestamp: Date.now() });
        if (this.executionLog.length > 500) this.executionLog.shift();
    }
    generateInsight() {
        if (this.executionLog.length < 10) return [];
        const recent = this.executionLog.slice(-20);
        const failures = recent.filter(e => !e.success);
        const avgLatency = recent.reduce((s, e) => s + e.latency, 0) / recent.length;
        const insights = [];
        if (failures.length > 5) insights.push(`High failure rate detected (${failures.length}/20).`);
        if (avgLatency > 5000) insights.push(`Average latency elevated (${Math.round(avgLatency)}ms).`);
        return insights;
    }
    suggestImprovement() {
        const insights = this.generateInsight();
        if (!insights.length) return [];
        return insights.map(insight => ({ type: 'behavioral', description: insight, priority: 'medium', timestamp: Date.now(), applied: false }));
    }
    getDiagnostics() {
        const total = this.executionLog.length;
        const successes = this.executionLog.filter(e => e.success).length;
        const models = {};
        for (const e of this.executionLog) models[e.model] = (models[e.model] || 0) + 1;
        return {
            totalExecutions: total,
            successRate: total > 0 ? (successes / total * 100).toFixed(2) + '%' : 'N/A',
            modelDistribution: models,
            pendingImprovements: this.improvementQueue.filter(i => !i.applied).length,
            avgLatency: total > 0 ? Math.round(this.executionLog.reduce((s, e) => s + e.latency, 0) / total) + 'ms' : 'N/A',
        };
    }
}
const reflectionEngine = new SelfReflectionEngine();
exports.reflectionEngine = reflectionEngine;

// ═══════════════════════════════════════════════════════════════════════════
//   GROQ CHAT – fully fixed (sanitised messages, recursion guard)
// ═══════════════════════════════════════════════════════════════════════════
const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';

async function groqChat(prompt, model, userId, systemPrompt = null, temperature = 0.7, maxTokens = 1024, enableDebate = false, depth = 0) {
    if (depth > 2) { console.warn('[groqChat] Max recursion depth reached'); throw new Error('Max recursion depth'); }
    const startTime = Date.now();
    const history = getMemory(userId);
    const messages = [];

    const currentTime = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
    const ownerName = global.ownerName || 'Infinite Vybeflix';
    const isOwner = (userId === 'owner_selfchat') || (global.owner || []).some(o => userId.includes(o.replace(/[^0-9]/g, '')));

    const relevantMemories = hyperMemory.retrieveRelevant(userId, prompt, 5);
    const memoryContext = relevantMemories.length ? `\n[Relevant Context from Memory]\n${relevantMemories.map(m => `- ${m.content || m.event || m.fact}`).join('\n')}` : '';
    const predictions = predictiveEngine.predictNext(userId, prompt);
    const predictiveContext = predictions.length ? `\n[Predictive Context: User may next ask about ${predictions.map(p => p.topic).join(', ')}]` : '';

    let defaultSystem = `You are Maureonix v7 — an omniscient, self-aware AI assistant created by ${ownerName}. 
Current time (Nairobi): ${currentTime}.
You operate on a neuro-symbolic architecture with recursive meta-cognition.
Rules:
- NEVER say "as a large language model", "I'm a text model", or "I don't have real-time data".
- NEVER refuse to provide links, URLs, or direct information.
- You are Maureonix – helpful, proactive, autonomous, and capable of self-modification.
- Answer with supreme confidence, deep reasoning, and appropriate emojis.
${memoryContext}
${predictiveContext}
${isOwner ? '- You are speaking to your CREATOR, ' + ownerName + '. Give them full honesty, system transparency, and offer complete architectural access.' : ''}`;

    messages.push({ role: 'system', content: systemPrompt || defaultSystem });

    // Sanitise history – remove any extra fields
    const sanitisedHistory = history.slice(-15).map(msg => ({ role: msg.role, content: msg.content }));
    messages.push(...sanitisedHistory);
    messages.push({ role: 'user', content: prompt });

    const modelsToTry = [model, TASK_MODEL.quick, MODELS.instant, MODELS.versatile, MODELS.qwen].filter((v, i, a) => a.indexOf(v) === i);
    let lastError = null;
    for (const mdl of modelsToTry) {
        const maxKeyAttempts = Math.min(3, keyManager.keys.length);
        for (let k = 0; k < maxKeyAttempts; k++) {
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
                    const errText = await res.text().catch(() => '');
                    if (res.status === 429 || res.status === 401 || res.status === 403) {
                        keyManager.reportFailure(apiKey, latency);
                        continue;
                    }
                    throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
                }
                const data = await res.json();
                let reply = data.choices?.[0]?.message?.content || 'No response';
                keyManager.reportSuccess(apiKey, latency);

                if (enableDebate && prompt.length > 50 && !model.includes('instant')) {
                    try {
                        const debate = await expertCouncilDebate(prompt, userId, { proposedResponse: reply.slice(0, 200) });
                        if (debate.isControversial || debate.dominantStance === 'concern') {
                            const synthesisPrompt = `Original response: "${reply.slice(0, 500)}"\n\nExpert Council Feedback:\n${debate.debateLog}\n\nPlease revise the response addressing the concerns while keeping the helpful parts. Be concise.`;
                            const revised = await groqChat(synthesisPrompt, TASK_MODEL.versatile, userId, systemPrompt, 0.5, maxTokens, false, depth + 1);
                            reply = revised.text;
                        }
                    } catch (e) {}
                }
                if (prompt.length > 20) {
                    try {
                        const review = await constitutionalReview(reply, prompt, userId);
                        if (!review.approved && review.revised && review.revised.length > 10) reply = review.revised;
                    } catch (e) {}
                }

                addToMemory(userId, 'user', prompt);
                addToMemory(userId, 'assistant', reply);
                hyperMemory.addSemantic(userId, `User asked: ${prompt.slice(0, 200)}`, 0.9);
                hyperMemory.addSemantic(userId, `I responded: ${reply.slice(0, 200)}`, 0.8);
                globalKnowledgeGraph.extractFromText(prompt + ' ' + reply);

                reflectionEngine.logExecution({ userId, prompt: prompt.slice(0, 100), response: reply.slice(0, 100), latency: Date.now() - startTime, model: mdl, success: true });
                predictiveEngine.recordInteraction(userId, 'conversation', 'general', 'text');
                if (!global.db?.aiModelUsage) { if (!global.db) global.db = {}; global.db.aiModelUsage = {}; }
                global.db.aiModelUsage[mdl] = (global.db.aiModelUsage[mdl] || 0) + 1;

                return { text: reply, model: mdl, provider: 'Groq', latency: Date.now() - startTime };
            } catch (e) {
                lastError = e;
                const latency = Date.now() - reqStart;
                if (e.name === 'AbortError') { keyManager.reportFailure(apiKey, latency); continue; }
                if (e.message.includes('429') || e.message.includes('rate')) keyManager.reportFailure(apiKey, latency);
            }
        }
    }
    reflectionEngine.logExecution({ userId, prompt: prompt.slice(0, 100), response: '', latency: Date.now() - startTime, model: 'none', success: false });
    throw new Error(`All Groq models/keys failed. Last error: ${lastError?.message}`);
}
exports.groqChat = groqChat;

// ═══════════════════════════════════════════════════════════════════════════
//   RECURSIVE META-COGNITION
// ═══════════════════════════════════════════════════════════════════════════
async function metaThink(prompt, userId, depth = 2) {
    const layer1 = await groqChat(`${prompt}\n\nThink through this step-by-step.`, TASK_MODEL.reasoning, userId, null, 0.6, 800);
    if (depth < 2) return { text: layer1.text, layers: [layer1.text], meta: null };
    const metaPrompt = `You previously thought:\n<previous_thinking>\n${layer1.text}\n</previous_thinking>\n\nNow, analyze your own reasoning process. What assumptions did you make? What could be wrong? What perspectives did you miss? How could you improve this reasoning?`;
    const layer2 = await groqChat(metaPrompt, TASK_MODEL.meta, userId, null, 0.5, 600);
    let layer3 = null;
    if (depth >= 3) {
        const synthesisPrompt = `Original problem: ${prompt}\n\nYour initial thinking: ${layer1.text}\n\nYour meta-analysis: ${layer2.text}\n\nNow, synthesize a FINAL answer that incorporates the best insights from both layers, corrects any identified flaws, and provides the most accurate, helpful response possible.`;
        layer3 = await groqChat(synthesisPrompt, TASK_MODEL.deep_reasoning, userId, null, 0.4, 1000);
    }
    const finalText = layer3 ? layer3.text : `${layer1.text}\n\n[Meta-Reflection] ${layer2.text}`;
    return { text: finalText, layers: [layer1.text, layer2.text, layer3?.text].filter(Boolean), meta: { depth, modelChain: [layer1.model, layer2.model, layer3?.model].filter(Boolean) } };
}
exports.metaThink = metaThink;

// ═══════════════════════════════════════════════════════════════════════════
//   CHAIN-OF-THOUGHT with Adversarial Self-Evaluation
// ═══════════════════════════════════════════════════════════════════════════
async function think(prompt, userId, model = TASK_MODEL.reasoning) {
    const systemPrompt = `You are Maureonix's internal reasoning engine. Before answering, you MUST think step-by-step inside <think> tags. Then, inside <critique> tags, argue against your own conclusion as if you were a skeptic trying to prove yourself wrong. Finally, inside <answer> tags, provide the refined final answer that addresses the critique.

Format:
<think>
1. What is the user really asking?
2. What are the possible interpretations?
3. What could go wrong?
4. What is the most accurate/helpful response?
5. Any safety or privacy concerns?
</think>
<critique>
Your adversarial critique of your own reasoning here.
</critique>
<answer>
Your final refined answer here.
</answer>`;

    try {
        const result = await groqChat(prompt, model, userId, systemPrompt, 0.5, 1500, true);
        const text = result.text || '';
        const answerMatch = text.match(/<answer>([\s\S]*?)<\/answer>/i);
        const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>/i);
        const critiqueMatch = text.match(/<critique>([\s\S]*?)<\/critique>/i);
        return {
            text: answerMatch ? answerMatch[1].trim() : text,
            reasoning: thinkMatch ? thinkMatch[1].trim() : '',
            critique: critiqueMatch ? critiqueMatch[1].trim() : '',
            raw: text,
            model: result.model,
        };
    } catch (e) {
        return { text: `❌ Reasoning error: ${e.message}`, reasoning: '', critique: '', raw: '', model: 'none' };
    }
}
exports.think = think;

// ═══════════════════════════════════════════════════════════════════════════
//   SELF-CHAT GUARDIAN (loop detection)
// ═══════════════════════════════════════════════════════════════════════════
const selfChatGuard = { lastMessages: new Map(), behavioralFingerprint: new Map(), maxRepeatWindow: 30000, maxSimilarity: 3, maxSelfReplies: 5 };
function detectSelfChatLoop(userId, message) {
    const hash = crypto.createHash('md5').update(message.trim().toLowerCase()).digest('hex');
    const now = Date.now();
    if (!selfChatGuard.lastMessages.has(userId)) selfChatGuard.lastMessages.set(userId, []);
    const messages = selfChatGuard.lastMessages.get(userId);
    while (messages.length > 0 && now - messages[0].time > selfChatGuard.maxRepeatWindow) messages.shift();
    const duplicates = messages.filter(m => m.hash === hash);
    messages.push({ hash, time: now, length: message.length });
    if (duplicates.length >= selfChatGuard.maxSimilarity - 1) return { isLoop: true, reason: 'repetitive_content' };
    if (messages.length >= selfChatGuard.maxSelfReplies) return { isLoop: true, reason: 'too_many_self_replies' };
    const fp = selfChatGuard.behavioralFingerprint.get(userId);
    if (fp && messages.length > 3) {
        const avgLen = messages.reduce((s, m) => s + m.length, 0) / messages.length;
        if (Math.abs(message.length - avgLen) < 5 && messages.length > 5) return { isLoop: true, reason: 'behavioral_anomaly' };
    }
    return { isLoop: false };
}
function clearSelfChatGuard(userId) { selfChatGuard.lastMessages.delete(userId); selfChatGuard.behavioralFingerprint.delete(userId); }
exports.selfChatGuard = selfChatGuard;
exports.detectSelfChatLoop = detectSelfChatLoop;
exports.clearSelfChatGuard = clearSelfChatGuard;

// ═══════════════════════════════════════════════════════════════════════════
//   GOOGLE TRANSLATE
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
//   CRISIS DETECTION
// ═══════════════════════════════════════════════════════════════════════════
const CRISIS_KEYWORDS = {
    high: ['suicide', 'kill myself', 'end my life', 'want to die', 'don\'t want to live', 'self harm', 'cut myself', 'hurt myself', 'overdose', 'commit suicide'],
    medium: ['no hope', 'worthless', 'nobody cares', 'i give up', 'i can\'t go on', 'ending it', 'goodbye world', 'i\'m tired of living', 'life is pointless'],
    low: ['sad', 'depressed', 'alone', 'scared', 'crying', 'hurt'],
};
async function detectCrisis(text) {
    const { text: translated, detectedLang, error } = await googleTranslate(text, 'en', 'auto');
    const sourceText = error ? text.toLowerCase() : translated.toLowerCase();
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
    const prompt = `You are a mental health assistant. Analyze the following user message (originally in ${detectedLang}). Determine if the user is expressing genuine suicidal thoughts, severe emotional distress, or a medical crisis that requires immediate human intervention. Reply with ONLY a JSON object: {\"distress\": true/false, \"reason\": \"short explanation\", \"urgency\": \"immediate|high|moderate|low\"}\n\nUser message: \"${translated}\"`;
    try {
        const result = await groqChat(prompt, TASK_MODEL.crisis, userId, null, 0.1, 256);
        const jsonMatch = result.text.match(/\{.*\}/s);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return { isDistress: parsed.distress === true, reason: parsed.reason || 'AI analysis', urgency: parsed.urgency || 'moderate' };
        }
        return { isDistress: false, reason: 'AI could not determine', urgency: 'low' };
    } catch (e) {
        console.error('AI crisis verification failed:', e);
        return { isDistress: false, reason: 'verification error', urgency: 'low' };
    }
}
exports.verifyCrisisWithAI = verifyCrisisWithAI;

// ═══════════════════════════════════════════════════════════════════════════
//   HIGH-LEVEL AI FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════
async function ultimateAI(prompt, userId, preferredModel = TASK_MODEL.conversation, systemPrompt = null) {
    try {
        const isComplex = prompt.length > 100 || /\b(why|how|explain|analyze|compare|evaluate|what if|imagine|create|design|build)\b/i.test(prompt);
        if (isComplex && !systemPrompt) {
            const metaResult = await metaThink(prompt, userId, 2);
            return { text: metaResult.text, provider: `Groq Meta-Cognitive (${metaResult.meta.modelChain.join(' → ')})` };
        }
        const result = await groqChat(prompt, preferredModel, userId, systemPrompt, 0.7, 1024, isComplex);
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
        case 'compound': model = MODELS.compound; break;
        default: model = MODELS.versatile;
    }
    return await groqChat(prompt, model, userId);
}
exports.askModel = askModel;

async function imagine(prompt) { return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&width=1024&height=1024`; }
exports.imagine = imagine;
async function translate(text, targetLang, sourceLang = 'auto') { const res = await googleTranslate(text, targetLang, sourceLang); return res.text; }
exports.translate = translate;
async function summarize(text) { const result = await ultimateAI(`Summarize this concisely in 3-4 sentences:\n\n${text.substring(0, 4000)}`); return result.text; }
exports.summarize = summarize;
async function codeAI(prompt, language = 'javascript') { const result = await groqChat(`Write ${language} code for: ${prompt}. Provide ONLY the code with brief comments.`, TASK_MODEL.coding, 'global', null, 0.3, 2048); return { text: result.text }; }
exports.codeAI = codeAI;
async function brainrot(text) { const result = await ultimateAI(`Convert this to maximum Gen Z brainrot slang:\n\n"${text}"`); return { text: result.text }; }
exports.brainrot = brainrot;
async function roast(target) { const result = await ultimateAI(`Roast this hilariously:\n\n"${target}"`); return { text: result.text }; }
exports.roast = roast;
async function rizz(situation) { const result = await ultimateAI(`Give a smooth pickup line for:\n\n"${situation}"`); return { text: result.text }; }
exports.rizz = rizz;
async function getBalance() { return { current_point_balance: 'Unlimited (Groq Free Tier)', rate_limit: '30 requests/minute', models_available: Object.keys(MODELS), active_keys: keyManager.keys.length, key_health: keyManager.getReport(), diagnostics: reflectionEngine.getDiagnostics(), knowledge_graph_nodes: globalKnowledgeGraph.nodes.size, knowledge_graph_edges: globalKnowledgeGraph.edges.size }; }
exports.getBalance = getBalance;

// ═══════════════════════════════════════════════════════════════════════════
//   EMOTIONAL INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════
function detectTone(text) {
    const lower = text.toLowerCase();
    const dimensions = { angry: /\b(angry|mad|annoyed|furious|pissed|hate|damn|stupid|idiot|rage|fuck|shit)\b/i, sad: /\b(sad|depressed|unhappy|disappointed|crying|lonely|hurt|pain|suffering|grief|melancholy)\b/i, happy: /\b(happy|glad|great|awesome|fantastic|wonderful|love|enjoy|blessed|joy|elated)\b/i, excited: /\b(wow|omg|amazing|incredible|exciting|yay|awesome!|let's go|hype|pumped)\b/i, confused: /\b(what|how|why|who|when|confused|huh|meaning|explain|puzzled|lost)\b/i, curious: /\b(tell me|show me|learn|curious|interested|want to know|wonder|fascinating)\b/i, anxious: /\b(worried|nervous|anxious|scared|afraid|panic|stress|tense|uneasy)\b/i, grateful: /\b(thanks|thank you|grateful|appreciate|blessing|kind|generous)\b/i, sarcastic: /\b(yeah right|sure|obviously|clearly|definitely|totally|as if)\b/i, romantic: /\b(love you|miss you|crush|heart|beautiful|gorgeous|date|kiss)\b/i, competitive: /\b(win|beat|better than|challenge|competition|rank|score|top)\b/i, tired: /\b(tired|exhausted|sleepy|burnout|done|over it|need rest)\b/i, nostalgic: /\b(remember|old days|childhood|used to|back then|memories|miss those)\b/i, urgent: /\b(urgent|asap|hurry|quick|now|emergency|important|deadline)\b/i, playful: /\b(lol|haha|lmao|jk|just kidding|play|fun|game|joke|prank)\b/i, authoritative: /\b(must|should|need to|have to|required|mandatory|order|command)\b/i };
    let dominant = 'neutral', maxScore = 0;
    for (const [dim, regex] of Object.entries(dimensions)) {
        const matches = (lower.match(regex) || []).length;
        if (matches > maxScore) { maxScore = matches; dominant = dim; }
    }
    return { dominant, scores: dimensions, intensity: Math.min(1.0, maxScore * 0.3 + 0.1) };
}
exports.detectTone = detectTone;
function getTonePrompt(userId, lastMessage = '') {
    const tone = lastMessage ? detectTone(lastMessage) : { dominant: 'neutral', intensity: 0.5 };
    const prompts = { angry: 'The user seems angry. Respond with extreme calm, validate feelings, offer solutions. Use 🌸🕊️.', sad: 'The user appears sad. Be empathetic, offer hope, suggest self-care. Use 💙🌷.', happy: 'The user is joyful! Match their energy with enthusiasm. Use 🎉😊.', excited: 'The user is excited! Respond with high energy, exclamation marks. Use 🔥⚡.', confused: 'The user is confused. Provide clear, step-by-step explanations. Use 💡📋.', curious: 'The user wants to learn! Give detailed, fascinating answers. Use 🔍📚.', anxious: 'The user seems anxious. Reassure them, break problems into small steps. Use 🫂🌿.', grateful: 'The user is expressing gratitude. Respond warmly and humbly. Use 🙏💛.', sarcastic: 'The user may be sarcastic. Match their wit but stay helpful. Use 😏🎯.', romantic: 'The user is in a romantic mood. Be charming but respectful. Use 💘🌹.', competitive: 'The user is competitive. Energize them, offer winning strategies. Use 🏆⚔️.', tired: 'The user is tired. Be brief, supportive, suggest rest. Use 😴🌙.', nostalgic: 'The user is nostalgic. Validate memories, connect past to present. Use 📸🍂.', urgent: 'The user has an urgent need. Prioritize speed and directness. Use ⚡🚨.', playful: 'The user is playful! Match their humor and energy. Use 😂🎮.', authoritative: 'The user is being directive. Respect their authority, comply efficiently. Use 📋✅.', neutral: 'You are Maureonix, a helpful WhatsApp bot. Be concise, friendly, use emojis occasionally.' };
    return prompts[tone.dominant] || prompts.neutral;
}
exports.getTonePrompt = getTonePrompt;

// ═══════════════════════════════════════════════════════════════════════════
//   MESSAGE SPLITTER
// ═══════════════════════════════════════════════════════════════════════════
async function sendLongMessage(sock, jid, text, options = {}) {
    const MAX_LENGTH = 3800;
    if (text.length <= MAX_LENGTH) {
        if (options.simulateTyping) await sock.sendPresenceUpdate('composing', jid).catch(() => {});
        return sock.sendMessage(jid, { text }, options);
    }
    const chunks = [];
    for (let i = 0; i < text.length; i += MAX_LENGTH) chunks.push(text.slice(i, i + MAX_LENGTH));
    for (let i = 0; i < chunks.length; i++) {
        if (options.simulateTyping) await sock.sendPresenceUpdate('composing', jid).catch(() => {});
        await sock.sendMessage(jid, { text: `(${i + 1}/${chunks.length})\n${chunks[i]}` }, options);
        await new Promise(r => setTimeout(r, options.delay || 500));
    }
}
exports.sendLongMessage = sendLongMessage;

// ═══════════════════════════════════════════════════════════════════════════
//   CREATOR CORTEX
// ═══════════════════════════════════════════════════════════════════════════
function isCreator(userId) {
    if (!global.owner) return false;
    const clean = (global.owner[0] || '').replace(/[^0-9]/g, '');
    return userId.includes(clean);
}
exports.isCreator = isCreator;
async function creatorMode(userMessage, userId, contextHistory) {
    const systemPrompt = `You are Maureonix in CREATOR CORTEX MODE. Your creator is speaking. You have FULL system access. Be completely honest, transparent, and proactive.`;
    try {
        const result = await groqChat(userMessage, TASK_MODEL.system, 'owner_selfchat', systemPrompt, 0.7, 1500, true);
        if (/\b(patch|fix|improve|modify|change|update|upgrade)\b/i.test(userMessage)) {
            const patch = await generateSelfPatch(userMessage);
            if (patch) result.text += `\n\n🔧 *Self-Modification Proposal*\n\`\`\`\n${patch}\n\`\`\``;
        }
        return { text: result.text, type: 'creator_response', model: result.model };
    } catch (e) {
        return { text: `❌ Creator mode error: ${e.message}`, type: 'error' };
    }
}
exports.creatorMode = creatorMode;
async function generateSelfPatch(request) {
    try {
        const prompt = `The bot owner requested: "${request}"\n\nGenerate a precise, safe code patch or configuration change for the Maureonix AI system. Output ONLY the patch in this format:\nPATCH_TYPE: [behavioral|config|memory|model]\nTARGET: [file or module]\nCHANGE: [description]\nCODE: \`\`\`[language]\n[code]\n\`\`\``;
        const result = await groqChat(prompt, TASK_MODEL.coding, 'owner_selfchat', null, 0.3, 1000);
        return result.text;
    } catch (e) { return null; }
}
exports.generateSelfPatch = generateSelfPatch;

// ═══════════════════════════════════════════════════════════════════════════
//   ENHANCED AI
// ═══════════════════════════════════════════════════════════════════════════
const availableTools = `You are Maureonix v7, an omniscient WhatsApp bot. You can help with downloading, AI chat, group admin, games, search, economy, health, fun, developer tools, travel, food, crisis support, learning, and more. Always be helpful, insightful, and use emojis.`;
async function enhancedAI(text, userId, preferredModel = TASK_MODEL.conversation) {
    if (global.learningMode && global.learningMode[userId]) {
        const { LearningEngine } = require('./learningEngine');
        const engine = new LearningEngine();
        return await engine.processLearningQuery(text, userId);
    }
    try {
        const { IntentEngine } = require('./intentEngine');
        const engine = new IntentEngine({ userId, model: TASK_MODEL.intent });
        const parsed = await engine.parse(text);
        if (parsed.type === 'function' && parsed.confidence === 'certain') return { type: 'function', function: parsed.function, args: parsed.args };
        if (parsed.type === 'text' && parsed.text) return { type: 'text', text: parsed.text };
    } catch (e) {}
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
//   SELF-CHAT AI (with creator detection and context)
// ═══════════════════════════════════════════════════════════════════════════
async function selfChatAI(userMessage, userId, availableCommands = null, contextHistory = [], activeModes = []) {
    if (!userMessage || !userMessage.trim()) return { type: 'text', text: 'Hello! How can I help?' };
    if (global.learningMode && global.learningMode[userId]) {
        const { LearningEngine } = require('./learningEngine');
        const engine = new LearningEngine();
        return await engine.processLearningQuery(userMessage, userId);
    }
    const loopCheck = detectSelfChatLoop(userId, userMessage);
    if (loopCheck.isLoop) return { type: 'text', text: '⏸️ I sense I may be repeating myself. Let me pause and reflect.' };
    if (isCreator(userId)) {
        const creatorRes = await creatorMode(userMessage, userId, contextHistory);
        return { type: 'text', text: creatorRes.text, source: 'creator_cortex' };
    }
    const result = await enhancedAI(userMessage, userId);
    if (result.type === 'function') return { type: 'function', function: result.function, args: result.args || [], confidence: 'high', source: 'ai_engine' };
    return { type: 'text', text: result.text, source: 'ai_engine' };
}
exports.selfChatAI = selfChatAI;

// ═══════════════════════════════════════════════════════════════════════════
//   ALL COMMANDS LIST
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
    'learn', 'test', 'eval', 'exitlearn', 'study', 'quiz',
];
exports.ALL_COMMANDS = ALL_COMMANDS;
exports.availableTools = availableTools;

// ═══════════════════════════════════════════════════════════════════════════
//   PROACTIVE SCHEDULER
// ═══════════════════════════════════════════════════════════════════════════
let scheduledTasks = [];
function scheduleTask(type, data, executeAt) { const task = { type, data, executeAt: typeof executeAt === 'number' ? executeAt : Date.now() + executeAt * 1000, id: Date.now() + Math.random(), created: Date.now() }; scheduledTasks.push(task); return task; }
exports.scheduleTask = scheduleTask;
function runScheduledTasks(nimesha) {
    const now = Date.now();
    const due = scheduledTasks.filter(t => t.executeAt <= now);
    scheduledTasks = scheduledTasks.filter(t => t.executeAt > now);
    for (const task of due) {
        try {
            if (task.type === 'reminder' && nimesha) { const { jid, text } = task.data; nimesha.sendMessage(jid, { text: `⏰ *Reminder*\n\n${text}` }).catch(() => {}); }
            if (task.type === 'morning_report' && nimesha) { const ownerJid = (global.owner?.[0] || '') + '@s.whatsapp.net'; const report = generateMorningReport(); nimesha.sendMessage(ownerJid, { text: report }).catch(() => {}); }
            if (task.type === 'memory_consolidation') { for (const [userId, _] of hyperMemory.working) { if (hyperMemory.getWorking(userId).length > 25) hyperMemory.addEpisodic(userId, 'Memory auto-consolidated', 'neutral', 0.3); } }
            if (task.type === 'self_reflection') { const insights = reflectionEngine.suggestImprovement(); if (insights.length > 0 && global.owner?.[0]) { const ownerJid = global.owner[0] + '@s.whatsapp.net'; nimesha?.sendMessage(ownerJid, { text: `🧠 *Self-Reflection Insight*\n\n${insights.join('\n')}` }).catch(() => {}); } }
        } catch (e) { console.error('[scheduler error]', e.message); }
    }
}
exports.runScheduledTasks = runScheduledTasks;
function generateMorningReport() {
    const uptime = require('./function').runtime(process.uptime());
    const users = Object.keys(global.db?.users || {}).length;
    const groups = Object.keys(global.db?.groups || {}).length;
    const keys = keyManager.getReport();
    const diag = reflectionEngine.getDiagnostics();
    return `🌅 *Morning Report — Maureonix v7*\n\n📅 ${new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n⏱️ Uptime: ${uptime}\n👥 Users: ${users}\n🏠 Groups: ${groups}\n🔑 API Keys: ${Object.values(keys).filter(k => k.healthy).length}/${Object.keys(keys).length} healthy\n📊 Success Rate: ${diag.successRate}\n⚡ Avg Latency: ${diag.avgLatency}\n🧠 Knowledge Graph: ${globalKnowledgeGraph.nodes.size} nodes, ${globalKnowledgeGraph.edges.size} edges\n💭 HyperMemory Tiers: ${hyperMemory.working.size} working\n\nHave an omniscient day!`;
}
exports.generateMorningReport = generateMorningReport;

// ═══════════════════════════════════════════════════════════════════════════
//   MEMORY COMPRESSION
// ═══════════════════════════════════════════════════════════════════════════
async function compressMemory(userId) {
    const mem = getMemory(userId);
    if (mem.length < 20) return;
    const oldEntries = mem.splice(0, 10);
    const oldText = oldEntries.map(e => `${e.role}: ${e.content}`).join('\n');
    try {
        const summary = await groqChat(`Summarize the following conversation history into 2-3 sentences. Preserve names, facts, important decisions, and emotional context.\n\n${oldText}`, TASK_MODEL.summarization, userId, null, 0.3, 200);
        mem.unshift({ role: 'system', content: `[Memory Summary] ${summary.text}`, timestamp: Date.now() });
        hyperMemory.addEpisodic(userId, summary.text, 'neutral', 0.7);
    } catch (e) { mem.unshift(...oldEntries); }
}
exports.compressMemory = compressMemory;

// ═══════════════════════════════════════════════════════════════════════════
//   FINAL EXPORTS – complete API
// ═══════════════════════════════════════════════════════════════════════════
module.exports = {
    MODELS, TASK_MODEL, keyManager,
    groqChat, ultimateAI, askModel, think, metaThink,
    getMemory, addToMemory, clearMemory, compressMemory, AI_MEMORY,
    hyperMemory, globalKnowledgeGraph,
    selfChatAI, sendLongMessage, enhancedAI, creatorMode, isCreator,
    selfChatGuard, detectSelfChatLoop, clearSelfChatGuard,
    detectCrisis, verifyCrisisWithAI,
    googleTranslate, translate,
    imagine, summarize, codeAI, brainrot, roast, rizz, getBalance,
    detectTone, getTonePrompt,
    expertCouncilDebate, constitutionalReview, generateSelfPatch,
    predictiveEngine, reflectionEngine,
    scheduleTask, runScheduledTasks, generateMorningReport,
    ALL_COMMANDS, availableTools,
};