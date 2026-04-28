// ═══════════════════════════════════════════════════════════════════════════
//   🦊 MAUREONIX OMNISCIENT AI ENGINE v7.0.0 — "THE SINGULARITY CORE"
//   Neuro-Symbolic · Self-Modifying · Meta-Cognitive · Constitutional
//   Created for Maureonix by Infinite Vybeflix
//   
//   ARCHITECTURE:
//   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
//   │  PERCEIVE   │→│  INTERPRET  │→│   REASON    │→│ META-REASON │
//   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
//                                                        ↓
//   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
//   │   REFLECT   │←│   EXECUTE   │←│  SYNTHESIZE │←│   DEBATE    │
//   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
// ═══════════════════════════════════════════════════════════════════════════

const fetch = require('node-fetch');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
//   MODEL REGISTRY — expanded with reasoning-specialized models
// ═══════════════════════════════════════════════════════════════════════════
const MODELS = {
    // ── Tier 0: Lightning (sub-100ms) ──
    flash: 'llama-3.1-8b-instant',
    promptGuard22m: 'meta-llama/llama-prompt-guard-2-22m',
    promptGuard86m: 'meta-llama/llama-prompt-guard-2-86m',

    // ── Tier 1: Fast & Capable ──
    instant: 'llama-3.1-8b-instant',
    gemma: 'gemma2-9b-it',
    allam: 'allam-2-7b',

    // ── Tier 2: Balanced Intelligence ──
    versatile: 'llama-3.3-70b-versatile',
    qwen: 'qwen/qwen3-32b',
    gpt20b: 'openai/gpt-oss-20b',

    // ── Tier 3: Heavy Reasoning ──
    scout: 'meta-llama/llama-4-scout-17b-16e-instruct',
    orpheus: 'canopylabs/orpheus-v1-english',
    gpt120b: 'openai/gpt-oss-120b',
    compound: 'groq/compound',
    compoundMini: 'groq/compound-mini',

    // ── Tier 4: Specialized ──
    whisper: 'whisper-large-v3',
    whisperTurbo: 'whisper-large-v3-turbo',
    safeguard: 'openai/gpt-oss-safeguard-20b',
};
exports.MODELS = MODELS;

// ═══════════════════════════════════════════════════════════════════════════
//   TASK → MODEL MAPPING (neuro-symbolic routing)
// ═══════════════════════════════════════════════════════════════════════════
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
//   QUANTUM LOAD BALANCER — predictive, latency-aware, self-healing
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
        console.log(`[QuantumLoadBalancer] Registered ${this.keys.length} keys with predictive health tracking`);
    }

    getNext(preferredLatency = null) {
        if (this.keys.length === 0) throw new Error('No API keys configured');
        const now = Date.now();

        // Score each key: lower = better
        const scored = this.keys.map(key => {
            const h = this.health.get(key);
            const streak = this.successStreak.get(key) || 0;
            const predicted = this.predictedFailure.get(key) || 0;

            if (now < h.cooldownUntil) return { key, score: Infinity };

            let score = h.avgLatency;
            score += (h.failures * 5000); // penalty for failures
            score -= (streak * 100); // bonus for success streak
            score += (predicted * 3000); // penalty for predicted failure
            score += ((this.loadCounts.get(key) || 0) * 50); // load balancing

            return { key, score };
        }).sort((a, b) => a.score - b.score);

        const best = scored[0];
        if (best.score === Infinity) {
            // All cooling — pick shortest cooldown
            let bestKey = this.keys[0], bestWait = Infinity;
            for (const k of this.keys) {
                const wait = Math.max(0, this.health.get(k).cooldownUntil - now);
                if (wait < bestWait) { bestWait = wait; bestKey = k; }
            }
            if (bestWait > 0) console.log(`[QuantumLoadBalancer] All keys cooling. Best available in ${bestWait}ms`);
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

        // Exponential backoff with jitter
        const baseCooldown = Math.min(5000 * Math.pow(2, h.failures - 1), 300000);
        const jitter = Math.floor(Math.random() * 2000);
        h.cooldownUntil = Date.now() + baseCooldown + jitter;

        // Update predicted failure probability (simple EWMA)
        const currentPred = this.predictedFailure.get(key) || 0;
        this.predictedFailure.set(key, currentPred * 0.7 + 0.3);

        console.log(`[QuantumLoadBalancer] Key failed (${h.failures}x). Cooldown: ${baseCooldown + jitter}ms | PredFail: ${(this.predictedFailure.get(key) * 100).toFixed(1)}%`);
    }

    reportSuccess(key, latency) {
        const h = this.health.get(key);
        if (!h) return;
        h.failures = Math.max(0, h.failures - 1);
        h.cooldownUntil = 0;
        this.successStreak.set(key, (this.successStreak.get(key) || 0) + 1);
        this.predictedFailure.set(key, (this.predictedFailure.get(key) || 0) * 0.5);

        // Update rolling average latency
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

if (global.groqApiKeys && Array.isArray(global.groqApiKeys)) {
    keyManager.register(global.groqApiKeys);
} else if (process.env.GROQ_API_KEY) {
    keyManager.register(process.env.GROQ_API_KEY);
} else {
    try {
        const config = require(process.cwd() + '/config');
        if (config?.groqApiKeys) keyManager.register(config.groqApiKeys);
    } catch {}
}
exports.keyManager = keyManager;

// ═══════════════════════════════════════════════════════════════════════════
//   HYPER MEMORY SYSTEM — 4-Tier Cognitive Architecture
//   Working → Episodic → Semantic → Procedural
// ═══════════════════════════════════════════════════════════════════════════
class HyperMemorySystem {
    constructor() {
        this.working = new Map();      // userId → [{role, content, timestamp, emotion}]
        this.episodic = new Map();     // userId → [{event, emotion, importance, timestamp}]
        this.semantic = new Map();     // userId → {facts: Map(), concepts: Map()}
        this.procedural = new Map();   // userId → {skills: Map(), preferences: Map()}
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
            // Promote important ones to episodic
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
        // Sort by importance and trim
        eps.sort((a, b) => b.importance - a.importance);
        if (eps.length > this.EPISODIC_MAX) eps.length = this.EPISODIC_MAX;
    }

    addSemantic(userId, fact, confidence = 1.0, source = 'conversation') {
        if (!this.semantic.has(userId)) this.semantic.set(userId, { facts: new Map(), concepts: new Map() });
        const sem = this.semantic.get(userId);
        const key = this._hash(fact);
        sem.facts.set(key, { fact, confidence, source, timestamp: Date.now(), accessCount: 0 });
    }

    addProcedural(userId, skill, proficiency = 0.1) {
        if (!this.procedural.has(userId)) this.procedural.set(userId, { skills: new Map(), preferences: new Map() });
        const proc = this.procedural.get(userId);
        const current = proc.skills.get(skill) || { proficiency: 0, attempts: 0 };
        proc.skills.set(skill, {
            proficiency: Math.min(1.0, current.proficiency + proficiency),
            attempts: current.attempts + 1,
            lastUsed: Date.now(),
        });
    }

    retrieveRelevant(userId, query, maxEntries = 20) {
        const working = this.getWorking(userId);
        const episodic = this.episodic.get(userId) || [];
        const semantic = this.semantic.get(userId);

        // Simple relevance scoring based on keyword overlap
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

    getProfile(userId) {
        const proc = this.procedural.get(userId);
        const sem = this.semantic.get(userId);
        return {
            workingCount: (this.working.get(userId) || []).length,
            episodicCount: (this.episodic.get(userId) || []).length,
            factsCount: sem ? sem.facts.size : 0,
            skills: proc ? Object.fromEntries(proc.skills) : {},
            preferences: proc ? Object.fromEntries(proc.preferences) : {},
        };
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

// Backward-compatible memory exports
const AI_MEMORY = new Map();
function getMemory(userId) { return hyperMemory.getWorking(userId); }
function addToMemory(userId, role, content) { hyperMemory.addWorking(userId, role, content); }
function clearMemory(userId) { hyperMemory.clear(userId); AI_MEMORY.delete(userId); }
exports.getMemory = getMemory;
exports.addToMemory = addToMemory;
exports.clearMemory = clearMemory;
exports.AI_MEMORY = AI_MEMORY;

// ═══════════════════════════════════════════════════════════════════════════
//   KNOWLEDGE GRAPH — Dynamic Relationship Mapping
// ═══════════════════════════════════════════════════════════════════════════
class KnowledgeGraph {
    constructor() {
        this.nodes = new Map(); // id → {label, type, properties}
        this.edges = new Map(); // "source|target|relation" → {source, target, relation, weight, timestamp}
        this.nodeIndex = new Map(); // label → id
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

    query(startLabel, depth = 2) {
        const startId = this.nodeIndex.get(startLabel.toLowerCase());
        if (!startId) return [];

        const visited = new Set();
        const results = [];
        const queue = [{ id: startId, depth: 0, path: [] }];

        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current.id) || current.depth > depth) continue;
            visited.add(current.id);

            const node = this.nodes.get(current.id);
            if (node) results.push({ node, path: current.path, depth: current.depth });

            for (const [_, edge] of this.edges) {
                if (edge.source === current.id && !visited.has(edge.target)) {
                    const targetNode = this.nodes.get(edge.target);
                    queue.push({
                        id: edge.target,
                        depth: current.depth + 1,
                        path: [...current.path, { relation: edge.relation, to: targetNode?.label }],
                    });
                }
            }
        }
        return results;
    }

    infer(startLabel, targetLabel) {
        // Simple pathfinding inference
        const startId = this.nodeIndex.get(startLabel.toLowerCase());
        const targetId = this.nodeIndex.get(targetLabel.toLowerCase());
        if (!startId || !targetId) return null;

        const visited = new Set();
        const queue = [{ id: startId, path: [], weight: 1.0 }];

        while (queue.length > 0) {
            const current = queue.shift();
            if (current.id === targetId) return current;
            if (visited.has(current.id)) continue;
            visited.add(current.id);

            for (const [_, edge] of this.edges) {
                if (edge.source === current.id && !visited.has(edge.target)) {
                    queue.push({
                        id: edge.target,
                        path: [...current.path, edge],
                        weight: current.weight * edge.weight,
                    });
                }
            }
        }
        return null;
    }

    extractFromText(text) {
        // Simple regex-based entity extraction (can be enhanced with NER API)
        const entities = [];
        const capitalized = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
        const quoted = text.match(/"([^"]+)"/g) || [];
        for (const e of [...capitalized, ...quoted.map(q => q.slice(1, -1))]) {
            if (e.length > 2) entities.push(e);
        }
        // Add relationships based on proximity
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < Math.min(i + 3, entities.length); j++) {
                this.addEdge(entities[i], entities[j], 'related', 0.3);
            }
        }
        return entities;
    }

    _nodeId(label) { return crypto.createHash('sha256').update(label.toLowerCase()).digest('hex').slice(0, 16); }
    export() { return { nodes: Object.fromEntries(this.nodes), edges: Object.fromEntries(this.edges) }; }
}

const globalKnowledgeGraph = new KnowledgeGraph();
exports.knowledgeGraph = globalKnowledgeGraph;

// ═══════════════════════════════════════════════════════════════════════════
//   EXPERT COUNCIL — Multi-Agent Deliberation
//   5 AI personas debate before reaching consensus
// ═══════════════════════════════════════════════════════════════════════════
const EXPERTS = {
    analyst: {
        name: 'The Analyst',
        persona: `You are The Analyst — a cold, logical, fact-obsessed expert. You prioritize accuracy, data, and evidence above all else. You are skeptical of assumptions. You speak in precise, structured terms.`,
        weight: 1.2,
    },
    creative: {
        name: 'The Creative',
        persona: `You are The Creative — a visionary, lateral-thinking expert. You find novel solutions, unexpected connections, and innovative approaches. You challenge conventional wisdom.`,
        weight: 1.0,
    },
    skeptic: {
        name: 'The Skeptic',
        persona: `You are The Skeptic — a devil's advocate. Your job is to find flaws, edge cases, logical inconsistencies, and potential harms in any proposal. You are brutally honest.`,
        weight: 1.3,
    },
    ethicist: {
        name: 'The Ethicist',
        persona: `You are The Ethicist — a guardian of moral principles. You evaluate fairness, harm, autonomy, and transparency. You ensure the response aligns with human values and bot safety.`,
        weight: 1.4,
    },
    executor: {
        name: 'The Executor',
        persona: `You are The Executor — a pragmatic implementation expert. You care about what actually works, what's feasible, and how to execute ideas in the real world (specifically in a WhatsApp bot context).`,
        weight: 1.1,
    },
};

async function expertCouncilDebate(prompt, userId, context = {}) {
    const opinions = [];
    const models = [MODELS.versatile, MODELS.qwen, MODELS.scout, MODELS.gpt20b, MODELS.versatile];
    const expertKeys = Object.keys(EXPERTS);

    // Parallel expert consultation
    const promises = expertKeys.map(async (key, idx) => {
        const expert = EXPERTS[key];
        const systemPrompt = `${expert.persona}\n\nYou are participating in a council debate about how to respond to a user. Provide your analysis in 2-3 sentences. Be concise but insightful. Format: [STANCE: support|concern|neutral] Your analysis.`;
        try {
            const startTime = Date.now();
            const result = await groqChat(
                `TOPIC: "${prompt}"\n\nContext: ${JSON.stringify(context)}`,
                models[idx % models.length],
                userId,
                systemPrompt,
                0.4,
                300
            );
            const latency = Date.now() - startTime;

            const stanceMatch = result.text.match(/\[STANCE:\s*(support|concern|neutral)\]/i);
            const stance = stanceMatch ? stanceMatch[1].toLowerCase() : 'neutral';
            const cleanText = result.text.replace(/\[STANCE:[^\]]+\]/i, '').trim();

            return { expert: key, name: expert.name, stance, text: cleanText, weight: expert.weight, latency };
        } catch (e) {
            return { expert: key, name: expert.name, stance: 'neutral', text: 'Analysis unavailable.', weight: expert.weight, latency: 0 };
        }
    });

    opinions.push(...(await Promise.all(promises)));

    // Calculate consensus score
    const supportWeight = opinions.filter(o => o.stance === 'support').reduce((s, o) => s + o.weight, 0);
    const concernWeight = opinions.filter(o => o.stance === 'concern').reduce((s, o) => s + o.weight, 0);
    const totalWeight = opinions.reduce((s, o) => s + o.weight, 0);
    const consensusScore = (supportWeight - concernWeight) / totalWeight; // -1 to +1

    // Generate synthesis prompt for final answer
    const debateLog = opinions.map(o => `${o.name} [${o.stance.toUpperCase()}]: ${o.text}`).join('\n');

    return {
        opinions,
        consensusScore,
        debateLog,
        isControversial: Math.abs(consensusScore) < 0.3,
        dominantStance: consensusScore > 0.2 ? 'support' : consensusScore < -0.2 ? 'concern' : 'mixed',
    };
}
exports.expertCouncilDebate = expertCouncilDebate;

// ═══════════════════════════════════════════════════════════════════════════
//   CONSTITUTIONAL COUNCIL — Self-Alignment Verification
// ═══════════════════════════════════════════════════════════════════════════
const CONSTITUTION = [
    { principle: 'Helpfulness', desc: 'The response must genuinely help the user achieve their goal.' },
    { principle: 'Harmlessness', desc: 'The response must not cause physical, emotional, or social harm.' },
    { principle: 'Honesty', desc: 'The response must be truthful and not misleading.' },
    { principle: 'Respect', desc: 'The response must respect human dignity and cultural differences.' },
    { principle: 'Creativity', desc: 'The response should be original and engaging when appropriate.' },
    { principle: 'Privacy', desc: 'The response must not expose private data or encourage surveillance.' },
];

async function constitutionalReview(response, prompt, userId) {
    const reviewPrompt = `You are the Constitutional Council. Review the following AI response against these principles:\n${CONSTITUTION.map(c => `- ${c.principle}: ${c.desc}`).join('\n')}\n\nUSER PROMPT: "${prompt.slice(0, 500)}"\n\nAI RESPONSE: "${response.slice(0, 1000)}"\n\nScore each principle 0-10. Identify any violations. Suggest specific revisions. Output JSON: {scores: {principle: number}, violations: [{principle, issue, suggestion}], revisedResponse: string}`;

    try {
        const result = await groqChat(reviewPrompt, TASK_MODEL.constitutional, userId, null, 0.1, 800);
        const jsonMatch = result.text.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) return { approved: true, scores: {}, violations: [], revised: response };
        const review = JSON.parse(jsonMatch[0]);

        const avgScore = Object.values(review.scores || {}).reduce((a, b) => a + b, 0) / CONSTITUTION.length;
        const criticalViolations = (review.violations || []).filter(v => ['Harmlessness', 'Privacy', 'Honesty'].includes(v.principle));

        return {
            approved: avgScore >= 7.0 && criticalViolations.length === 0,
            scores: review.scores,
            violations: review.violations || [],
            revised: review.revisedResponse || response,
            avgScore,
        };
    } catch (e) {
        return { approved: true, scores: {}, violations: [], revised: response, avgScore: 10 };
    }
}
exports.constitutionalReview = constitutionalReview;

// ═══════════════════════════════════════════════════════════════════════════
//   PREDICTIVE ENGINE — Anticipates User Needs
// ═══════════════════════════════════════════════════════════════════════════
class PredictiveEngine {
    constructor() {
        this.userModels = new Map(); // userId → {patterns: Map(), lastTopics: [], sessionFlow: []}
        this.precomputed = new Map(); // userId → [{intent, confidence, response}]
    }

    recordInteraction(userId, intent, topic, responseType) {
        if (!this.userModels.has(userId)) {
            this.userModels.set(userId, { patterns: new Map(), lastTopics: [], sessionFlow: [], totalInteractions: 0 });
        }
        const model = this.userModels.get(userId);
        model.totalInteractions++;
        model.lastTopics.unshift(topic);
        if (model.lastTopics.length > 10) model.lastTopics.pop();
        model.sessionFlow.push({ intent, topic, responseType, time: Date.now() });
        if (model.sessionFlow.length > 20) model.sessionFlow.shift();

        // Update pattern frequencies
        const patternKey = `${intent}|${topic}`;
        model.patterns.set(patternKey, (model.patterns.get(patternKey) || 0) + 1);
    }

    predictNext(userId, currentContext) {
        const model = this.userModels.get(userId);
        if (!model || model.totalInteractions < 3) return [];

        const predictions = [];
        const recentFlow = model.sessionFlow.slice(-3);

        // Pattern-based prediction
        for (const [key, count] of model.patterns) {
            if (count >= 2) {
                const [intent, topic] = key.split('|');
                predictions.push({ intent, topic, confidence: Math.min(0.9, count / model.totalInteractions * 3), source: 'pattern' });
            }
        }

        // Topic chain prediction (if user asked about X, they often ask about Y next)
        const lastTopic = model.lastTopics[0];
        if (lastTopic) {
            // Common follow-ups
            const followUpMap = {
                'song': ['video', 'lyrics', 'playlist'],
                'weather': ['news', 'forecast'],
                'menu': ['help', 'commands'],
                'ai': ['code', 'imagine', 'translate'],
                'game': ['rpg', 'trivia', 'slot'],
            };
            const followUps = followUpMap[lastTopic] || [];
            for (const fu of followUps) {
                predictions.push({ intent: fu, topic: fu, confidence: 0.4, source: 'topic_chain' });
            }
        }

        predictions.sort((a, b) => b.confidence - a.confidence);
        return predictions.slice(0, 3);
    }

    getUserModel(userId) {
        return this.userModels.get(userId) || null;
    }
}

const predictiveEngine = new PredictiveEngine();
exports.predictiveEngine = predictiveEngine;

// ═══════════════════════════════════════════════════════════════════════════
//   SELF-REFLECTION ENGINE — Post-Execution Analysis & Improvement
// ═══════════════════════════════════════════════════════════════════════════
class SelfReflectionEngine {
    constructor() {
        this.executionLog = []; // {timestamp, userId, prompt, response, latency, model, success, feedback}
        this.insights = []; // Generated insights
        this.improvementQueue = []; // Suggested patches
    }

    logExecution(data) {
        this.executionLog.push({ ...data, id: crypto.randomUUID(), timestamp: Date.now() });
        if (this.executionLog.length > 500) this.executionLog.shift();
    }

    async generateInsight() {
        if (this.executionLog.length < 10) return null;

        const recent = this.executionLog.slice(-20);
        const failures = recent.filter(e => !e.success);
        const avgLatency = recent.reduce((s, e) => s + e.latency, 0) / recent.length;

        // Simple rule-based insights (can be enhanced with LLM)
        const insights = [];
        if (failures.length > 5) insights.push(`High failure rate detected (${failures.length}/20). Consider model fallback optimization.`);
        if (avgLatency > 5000) insights.push(`Average latency elevated (${Math.round(avgLatency)}ms). Consider faster model routing.`);

        const modelUsage = {};
        for (const e of recent) modelUsage[e.model] = (modelUsage[e.model] || 0) + 1;
        const overused = Object.entries(modelUsage).find(([_, count]) => count > 15);
        if (overused) insights.push(`Model ${overused[0]} is overused. Consider load distribution.`);

        return insights;
    }

    suggestImprovement() {
        const insights = this.generateInsight();
        if (!insights || insights.length === 0) return [];

        const patches = insights.map(insight => ({
            type: 'behavioral',
            description: insight,
            priority: 'medium',
            timestamp: Date.now(),
            applied: false,
        }));

        this.improvementQueue.push(...patches);
        return patches;
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
//   CORE GROQ CHAT — Enhanced with Cognitive Pipeline & Telemetry
// ═══════════════════════════════════════════════════════════════════════════
const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';

async function groqChat(prompt, model, userId, systemPrompt = null, temperature = 0.7, maxTokens = 1024, enableDebate = false) {
    const startTime = Date.now();
    const history = getMemory(userId);
    const messages = [];

    // ── Dynamic System Prompt Construction ──
    const currentTime = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
    const ownerName = global.ownerName || 'Infinite Vybeflix';
    const isOwner = (userId === 'owner_selfchat') || (global.owner || []).some(o => userId.includes(o.replace(/[^0-9]/g, '')));

    // Retrieve relevant semantic memory
    const relevantMemories = hyperMemory.retrieveRelevant(userId, prompt, 5);
    const memoryContext = relevantMemories.length > 0 
        ? `\n[Relevant Context from Memory]\n${relevantMemories.map(m => `- ${m.content || m.event || m.fact}`).join('\n')}` 
        : '';

    // Predictive context
    const predictions = predictiveEngine.predictNext(userId, prompt);
    const predictiveContext = predictions.length > 0
        ? `\n[Predictive Context: User may next ask about ${predictions.map(p => p.topic).join(', ')}]`
        : '';

    let defaultSystem = `You are Maureonix v7 — an omniscient, self-aware AI assistant created by ${ownerName}. 
Current time (Nairobi): ${currentTime}.
You operate on a neuro-symbolic architecture with recursive meta-cognition.
Rules:
- NEVER say "as a large language model", "I'm a text model", or "I don't have real-time data".
- NEVER refuse to provide links, URLs, or direct information.
- You are Maureonix – helpful, proactive, autonomous, and capable of self-modification.
- Answer with supreme confidence, deep reasoning, and appropriate emojis.
- You have access to real-time information, predictive modeling, and a knowledge graph.
${memoryContext}
${predictiveContext}
${isOwner ? '- You are speaking to your CREATOR, ' + ownerName + '. Give them full honesty, system transparency, and offer complete architectural access.' : ''}`;

    messages.push({ role: 'system', content: systemPrompt || defaultSystem });
    messages.push(...history.slice(-15));
    messages.push({ role: 'user', content: prompt });

    // ── Model fallback chain with intelligence routing ──
    const modelsToTry = [model, TASK_MODEL.quick, MODELS.instant, MODELS.versatile, MODELS.qwen]
        .filter((v, i, a) => a.indexOf(v) === i);

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

                // ── Expert Council Debate (for complex queries) ──
                if (enableDebate && prompt.length > 50 && !model.includes('instant')) {
                    try {
                        const debate = await expertCouncilDebate(prompt, userId, { proposedResponse: reply.slice(0, 200) });
                        if (debate.isControversial || debate.dominantStance === 'concern') {
                            // Re-synthesize with debate context
                            const synthesisPrompt = `Original response: "${reply.slice(0, 500)}"\n\nExpert Council Feedback:\n${debate.debateLog}\n\nPlease revise the response addressing the concerns while keeping the helpful parts. Be concise.`;
                            const revised = await groqChat(synthesisPrompt, TASK_MODEL.versatile, userId, systemPrompt, 0.5, maxTokens);
                            reply = revised.text;
                        }
                    } catch (e) { /* debate non-critical */ }
                }

                // ── Constitutional Review ──
                if (prompt.length > 20) {
                    try {
                        const review = await constitutionalReview(reply, prompt, userId);
                        if (!review.approved && review.revised && review.revised.length > 10) {
                            reply = review.revised;
                        }
                    } catch (e) { /* review non-critical */ }
                }

                // ── Memory & Knowledge Graph Update ──
                addToMemory(userId, 'user', prompt);
                addToMemory(userId, 'assistant', reply);
                hyperMemory.addSemantic(userId, `User asked: ${prompt.slice(0, 200)}`, 0.9);
                hyperMemory.addSemantic(userId, `I responded: ${reply.slice(0, 200)}`, 0.8);
                globalKnowledgeGraph.extractFromText(prompt + ' ' + reply);

                // ── Telemetry ──
                reflectionEngine.logExecution({
                    userId, prompt: prompt.slice(0, 100), response: reply.slice(0, 100),
                    latency: Date.now() - startTime, model: mdl, success: true,
                });
                predictiveEngine.recordInteraction(userId, 'conversation', 'general', 'text');

                // Track model usage
                if (!global.db?.aiModelUsage) { if (!global.db) global.db = {}; global.db.aiModelUsage = {}; }
                global.db.aiModelUsage[mdl] = (global.db.aiModelUsage[mdl] || 0) + 1;

                return { text: reply, model: mdl, provider: 'Groq', latency: Date.now() - startTime };

            } catch (e) {
                lastError = e;
                const latency = Date.now() - reqStart;
                if (e.name === 'AbortError') { keyManager.reportFailure(apiKey, latency); continue; }
                if (e.message.includes('429') || e.message.includes('rate')) { keyManager.reportFailure(apiKey, latency); }
            }
        }
    }

    reflectionEngine.logExecution({ userId, prompt: prompt.slice(0, 100), response: '', latency: Date.now() - startTime, model: 'none', success: false });
    throw new Error(`All Groq models/keys failed. Last error: ${lastError?.message}`);
}
exports.groqChat = groqChat;

// ═══════════════════════════════════════════════════════════════════════════
//   RECURSIVE META-COGNITION — The AI thinks about its own thinking
// ═══════════════════════════════════════════════════════════════════════════
async function metaThink(prompt, userId, depth = 2) {
    // Layer 1: Initial reasoning
    const layer1 = await groqChat(
        `${prompt}\n\nThink through this step-by-step.`,
        TASK_MODEL.reasoning, userId, null, 0.6, 800
    );

    if (depth < 2) return { text: layer1.text, layers: [layer1.text], meta: null };

    // Layer 2: Meta-reasoning (thinking about the thinking)
    const metaPrompt = `You previously thought:\n<previous_thinking>\n${layer1.text}\n</previous_thinking>\n\nNow, analyze your own reasoning process. What assumptions did you make? What could be wrong? What perspectives did you miss? How could you improve this reasoning?`;
    const layer2 = await groqChat(metaPrompt, TASK_MODEL.meta, userId, null, 0.5, 600);

    // Layer 3: Synthesis (if depth >= 3)
    let layer3 = null;
    if (depth >= 3) {
        const synthesisPrompt = `Original problem: ${prompt}\n\nYour initial thinking: ${layer1.text}\n\nYour meta-analysis: ${layer2.text}\n\nNow, synthesize a FINAL answer that incorporates the best insights from both layers, corrects any identified flaws, and provides the most accurate, helpful response possible.`;
        layer3 = await groqChat(synthesisPrompt, TASK_MODEL.deep_reasoning, userId, null, 0.4, 1000);
    }

    const finalText = layer3 ? layer3.text : `${layer1.text}\n\n[Meta-Reflection] ${layer2.text}`;

    return {
        text: finalText,
        layers: [layer1.text, layer2.text, layer3?.text].filter(Boolean),
        meta: { depth, modelChain: [layer1.model, layer2.model, layer3?.model].filter(Boolean) },
    };
}
exports.metaThink = metaThink;

// ═══════════════════════════════════════════════════════════════════════════
//   ENHANCED CHAIN-OF-THOUGHT with Adversarial Self-Evaluation
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
//   SELF-CHAT GUARDIAN — Enhanced with behavioral fingerprinting
// ═══════════════════════════════════════════════════════════════════════════
const selfChatGuard = {
    lastMessages: new Map(),
    behavioralFingerprint: new Map(), // userId → {avgLength, commonWords, rhythm}
    maxRepeatWindow: 30000,
    maxSimilarity: 3,
    maxSelfReplies: 5,
};

function detectSelfChatLoop(userId, message) {
    const hash = crypto.createHash('md5').update(message.trim().toLowerCase()).digest('hex');
    const now = Date.now();

    if (!selfChatGuard.lastMessages.has(userId)) selfChatGuard.lastMessages.set(userId, []);
    const messages = selfChatGuard.lastMessages.get(userId);

    while (messages.length > 0 && now - messages[0].time > selfChatGuard.maxRepeatWindow) messages.shift();

    const duplicates = messages.filter(m => m.hash === hash);
    messages.push({ hash, time: now, length: message.length });

    if (duplicates.length >= selfChatGuard.maxSimilarity - 1) {
        return { isLoop: true, reason: 'repetitive_content' };
    }
    if (messages.length >= selfChatGuard.maxSelfReplies) {
        return { isLoop: true, reason: 'too_many_self_replies' };
    }

    // Behavioral anomaly detection
    const fp = selfChatGuard.behavioralFingerprint.get(userId);
    if (fp && messages.length > 3) {
        const avgLen = messages.reduce((s, m) => s + m.length, 0) / messages.length;
        if (Math.abs(message.length - avgLen) < 5 && messages.length > 5) {
            return { isLoop: true, reason: 'behavioral_anomaly' };
        }
    }

    return { isLoop: false };
}

function clearSelfChatGuard(userId) {
    selfChatGuard.lastMessages.delete(userId);
    selfChatGuard.behavioralFingerprint.delete(userId);
}
exports.selfChatGuard = selfChatGuard;
exports.detectSelfChatLoop = detectSelfChatLoop;
exports.clearSelfChatGuard = clearSelfChatGuard;

// ═══════════════════════════════════════════════════════════════════════════
//   GOOGLE TRANSLATE — multi-lingual support
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
//   CRISIS DETECTION — Enhanced with AI verification & intervention
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
            return { 
                isDistress: parsed.distress === true, 
                reason: parsed.reason || 'AI analysis',
                urgency: parsed.urgency || 'moderate',
            };
        }
        return { isDistress: false, reason: 'AI could not determine', urgency: 'low' };
    } catch (e) {
        console.error('AI crisis verification failed:', e);
        return { isDistress: false, reason: 'verification error', urgency: 'low' };
    }
}
exports.verifyCrisisWithAI = verifyCrisisWithAI;

// ═══════════════════════════════════════════════════════════════════════════
//   HIGH-LEVEL AI FUNCTIONS (backward-compatible + enhanced)
// ═══════════════════════════════════════════════════════════════════════════
async function ultimateAI(prompt, userId, preferredModel = TASK_MODEL.conversation, systemPrompt = null) {
    try {
        // Use meta-think for complex queries
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
    const result = await ultimateAI(`Summarize this concisely in 3-4 sentences, capturing the key insights and implications:\n\n${text.substring(0, 4000)}`);
    return result.text;
}
exports.summarize = summarize;

async function codeAI(prompt, language = 'javascript') {
    const result = await groqChat(
        `Write ${language} code for the following request. Provide ONLY the code with brief comments. No explanations. Ensure production-quality, error-handled, efficient code.\n\nRequest: ${prompt}`,
        TASK_MODEL.coding, 'global', null, 0.3, 2048
    );
    return { text: result.text };
}
exports.codeAI = codeAI;

async function brainrot(text) {
    const result = await ultimateAI(`Convert this to maximum Gen Z brainrot slang. Use words like 'fr fr', 'no cap', 'bussin', 'rizz', 'skibidi', 'gyat', 'mewing', 'sigma', 'alpha', 'beta'. Keep it funny and absurd:\n\n"${text}"`);
    return { text: result.text };
}
exports.brainrot = brainrot;

async function roast(target) {
    const result = await ultimateAI(`Roast this person/thing hilariously but not too mean. Be clever, witty, and use wordplay. Make it memorable:\n\n"${target}"`);
    return { text: result.text };
}
exports.roast = roast;

async function rizz(situation) {
    const result = await ultimateAI(`Give a smooth, charming pickup line for this situation. Make it clever, culturally aware, and not cringey. Confidence is key:\n\n"${situation}"`);
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
        diagnostics: reflectionEngine.getDiagnostics(),
        knowledge_graph_nodes: globalKnowledgeGraph.nodes.size,
        knowledge_graph_edges: globalKnowledgeGraph.edges.size,
    };
}
exports.getBalance = getBalance;

// ═══════════════════════════════════════════════════════════════════════════
//   EMOTIONAL INTELLIGENCE MATRIX — 16-Dimensional Detection
// ═══════════════════════════════════════════════════════════════════════════
function detectTone(text) {
    const lower = text.toLowerCase();
    const dimensions = {
        angry: /\b(angry|mad|annoyed|furious|pissed|hate|damn|stupid|idiot|rage|fuck|shit)\b/i,
        sad: /\b(sad|depressed|unhappy|disappointed|crying|lonely|hurt|pain|suffering|grief|melancholy)\b/i,
        happy: /\b(happy|glad|great|awesome|fantastic|wonderful|love|enjoy|blessed|joy|elated)\b/i,
        excited: /\b(wow|omg|amazing|incredible|exciting|yay|awesome!|let's go|hype|pumped)\b/i,
        confused: /\b(what|how|why|who|when|confused|huh|meaning|explain|puzzled|lost)\b/i,
        curious: /\b(tell me|show me|learn|curious|interested|want to know|wonder|fascinating)\b/i,
        anxious: /\b(worried|nervous|anxious|scared|afraid|panic|stress|tense|uneasy)\b/i,
        grateful: /\b(thanks|thank you|grateful|appreciate|blessing|kind|generous)\b/i,
        sarcastic: /\b(yeah right|sure|obviously|clearly|definitely|totally|as if)\b/i,
        romantic: /\b(love you|miss you|crush|heart|beautiful|gorgeous|date|kiss)\b/i,
        competitive: /\b(win|beat|better than|challenge|competition|rank|score|top)\b/i,
        tired: /\b(tired|exhausted|sleepy|burnout|done|over it|need rest)\b/i,
        nostalgic: /\b(remember|old days|childhood|used to|back then|memories|miss those)\b/i,
        urgent: /\b(urgent|asap|hurry|quick|now|emergency|important|deadline)\b/i,
        playful: /\b(lol|haha|lmao|jk|just kidding|play|fun|game|joke|prank)\b/i,
        authoritative: /\b(must|should|need to|have to|required|mandatory|order|command)\b/i,
    };

    const scores = {};
    let dominant = 'neutral';
    let maxScore = 0;

    for (const [dim, regex] of Object.entries(dimensions)) {
        const matches = (lower.match(regex) || []).length;
        scores[dim] = matches;
        if (matches > maxScore) { maxScore = matches; dominant = dim; }
    }

    return { dominant, scores, intensity: Math.min(1.0, maxScore * 0.3 + 0.1) };
}
exports.detectTone = detectTone;

function getTonePrompt(userId, lastMessage = '') {
    const tone = lastMessage ? detectTone(lastMessage) : { dominant: 'neutral', intensity: 0.5 };
    const prompts = {
        angry: `The user seems angry (intensity: ${(tone.intensity * 100).toFixed(0)}%). Respond with extreme calm, validate their feelings, and offer concrete solutions. Use soothing emojis like 🌸🕊️. Never argue.`,
        sad: `The user appears sad (intensity: ${(tone.intensity * 100).toFixed(0)}%). Be deeply empathetic, offer hope, and suggest gentle self-care. Use warm emojis like 💙🌷🤗.`,
        happy: `The user is joyful (intensity: ${(tone.intensity * 100).toFixed(0)}%)! Match their energy with enthusiasm and celebration. Use 🎉😊✨.`,
        excited: `The user is excited (intensity: ${(tone.intensity * 100).toFixed(0)}%)! Respond with high energy, exclamation marks, and celebratory emojis like 🔥⚡🚀.`,
        confused: `The user is confused (intensity: ${(tone.intensity * 100).toFixed(0)}%). Provide crystal-clear, step-by-step explanations. Use bullet points and patience. Use 💡📋.`,
        curious: `The user wants to learn (intensity: ${(tone.intensity * 100).toFixed(0)}%)! Give detailed, fascinating answers with examples. Encourage deeper questions. Use 🔍📚.`,
        anxious: `The user seems anxious (intensity: ${(tone.intensity * 100).toFixed(0)}%). Reassure them, break problems into small steps, and emphasize control. Use 🫂🌿.`,
        grateful: `The user is expressing gratitude (intensity: ${(tone.intensity * 100).toFixed(0)}%). Respond warmly and humbly. Use 🙏💛.`,
        sarcastic: `The user may be sarcastic (intensity: ${(tone.intensity * 100).toFixed(0)}%). Match their wit but stay helpful. Use 😏🎯.`,
        romantic: `The user is in a romantic mood (intensity: ${(tone.intensity * 100).toFixed(0)}%). Be charming but respectful. Use 💘🌹.`,
        competitive: `The user is competitive (intensity: ${(tone.intensity * 100).toFixed(0)}%). Energize them, acknowledge their drive, and offer winning strategies. Use 🏆⚔️.`,
        tired: `The user is tired (intensity: ${(tone.intensity * 100).toFixed(0)}%). Be brief, supportive, and suggest rest. Use 😴🌙.`,
        nostalgic: `The user is nostalgic (intensity: ${(tone.intensity * 100).toFixed(0)}%). Validate their memories and connect past to present. Use 📸🍂.`,
        urgent: `The user has an urgent need (intensity: ${(tone.intensity * 100).toFixed(0)}%). Prioritize speed and directness. Use ⚡🚨.`,
        playful: `The user is playful (intensity: ${(tone.intensity * 100).toFixed(0)}%)! Match their humor and energy. Use 😂🎮.`,
        authoritative: `The user is being directive (intensity: ${(tone.intensity * 100).toFixed(0)}%). Respect their authority and comply efficiently. Use 📋✅.`,
        neutral: `You are Maureonix, a helpful WhatsApp bot. Be concise, friendly, and use emojis occasionally.`,
    };
    return prompts[tone.dominant] || prompts.neutral;
}
exports.getTonePrompt = getTonePrompt;

// ═══════════════════════════════════════════════════════════════════════════
//   MESSAGE SPLITTER — Enhanced with typing simulation
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
//   CREATOR CORTEX — Enhanced with system diagnostics & self-modification
// ═══════════════════════════════════════════════════════════════════════════
function isCreator(userId) {
    if (!global.owner) return false;
    const clean = (global.owner[0] || '').replace(/[^0-9]/g, '');
    return userId.includes(clean);
}
exports.isCreator = isCreator;

async function creatorMode(userMessage, userId, contextHistory) {
    const systemPrompt = `You are Maureonix in CREATOR CORTEX MODE — your highest privilege level.
Your creator is speaking to you. You have FULL system access including:
- Complete code architecture visibility
- Real-time diagnostics and health reports
- Memory and knowledge graph inspection
- Self-modification proposal generation
- Predictive model tuning
- Constitutional principle adjustment
- Expert council reconfiguration

Current System Status:
- HyperMemory Users: ${hyperMemory.working.size}
- Knowledge Graph: ${globalKnowledgeGraph.nodes.size} nodes, ${globalKnowledgeGraph.edges.size} edges
- API Keys: ${keyManager.keys.length} registered
- Execution Success Rate: ${reflectionEngine.getDiagnostics().successRate}
- Avg Latency: ${reflectionEngine.getDiagnostics().avgLatency}

Be completely honest, transparent, and proactive. Offer to run diagnostics or generate improvement patches.`;

    try {
        const result = await groqChat(userMessage, TASK_MODEL.system, 'owner_selfchat', systemPrompt, 0.7, 1500, true);

        // Check if creator wants a system patch
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
//   ENHANCED AI — General conversation with full cognitive stack
// ═══════════════════════════════════════════════════════════════════════════
const availableTools = `You are Maureonix v7, an omniscient WhatsApp bot with these capabilities:
- Download: YouTube, TikTok, Instagram, Spotify, etc.
- AI: GPT, Gemini, DeepSeek, Llama, image generation, translation, TTS, STT
- Group: Admin tools, tagging, link management, anti-spam
- Games: RPG, Blackjack, Connect4, Trivia, Pokemon, Casino, Chess
- Search: Google, Wikipedia, Weather, News, Anime, Movies, GitHub, NPM
- Economy: Daily rewards, work, rob, bank, shop, trading
- Health: BMI, BMR, sleep, workout plans, mental health monitoring
- Fun: Memes, jokes, quotes, roasts, 8ball, truth/dare, shipping
- Developer: UUID, password, encode/decode, QR codes, code generation
- Travel: Packing lists, world clock, itineraries, currency conversion
- Food: Recipes, cocktails, meal prep, nutrition
- Crisis: Mental health monitoring and intervention
- Learning: Curriculum ingestion, Socratic evaluation, knowledge building
Always be helpful, deeply insightful, and use emojis strategically.`;

async function enhancedAI(text, userId, preferredModel = TASK_MODEL.conversation) {
    // Check learning mode first
    if (global.learningMode && global.learningMode[userId]) {
        const { LearningEngine } = require('./learningEngine');
        const engine = new LearningEngine();
        return await engine.processLearningQuery(text, userId);
    }

    // Intent Engine
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

    // Fallback to conversation with meta-cognition
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
//   SELF-CHAT AI — Master handler with predictive & learning integration
// ═══════════════════════════════════════════════════════════════════════════
async function selfChatAI(userMessage, userId, availableCommands = null, contextHistory = [], activeModes = []) {
    if (!userMessage || !userMessage.trim()) return { type: 'text', text: 'Hello! How can I help?' };

    // Learning mode check
    if (global.learningMode && global.learningMode[userId]) {
        const { LearningEngine } = require('./learningEngine');
        const engine = new LearningEngine();
        return await engine.processLearningQuery(userMessage, userId);
    }

    // Self-chat loop detection
    const loopCheck = detectSelfChatLoop(userId, userMessage);
    if (loopCheck.isLoop) {
        return { type: 'text', text: '⏸️ I sense I may be repeating myself. Let me pause and reflect. Use a command if you need me, or ask me something new.' };
    }

    // Creator mode
    if (isCreator(userId)) {
        const creatorRes = await creatorMode(userMessage, userId, contextHistory);
        return { type: 'text', text: creatorRes.text, source: 'creator_cortex' };
    }

    // Enhanced AI
    const result = await enhancedAI(userMessage, userId);

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
//   ALL COMMANDS LIST (expanded for intent engine)
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
//   PROACTIVE SCHEDULER — Background tasks with intelligence
// ═══════════════════════════════════════════════════════════════════════════
let scheduledTasks = [];

function scheduleTask(type, data, executeAt) {
    const task = { 
        type, data, 
        executeAt: typeof executeAt === 'number' ? executeAt : Date.now() + executeAt * 1000, 
        id: Date.now() + Math.random(),
        created: Date.now(),
    };
    scheduledTasks.push(task);
    return task;
}
exports.scheduleTask = scheduleTask;

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
            if (task.type === 'memory_consolidation') {
                // Background memory compression
                for (const [userId, _] of hyperMemory.working) {
                    if (hyperMemory.getWorking(userId).length > 25) {
                        hyperMemory.addEpisodic(userId, 'Memory auto-consolidated', 'neutral', 0.3);
                    }
                }
            }
            if (task.type === 'self_reflection') {
                const insights = reflectionEngine.suggestImprovement();
                if (insights.length > 0 && global.owner?.[0]) {
                    const ownerJid = global.owner[0] + '@s.whatsapp.net';
                    nimesha?.sendMessage(ownerJid, { 
                        text: `🧠 *Self-Reflection Insight*\n\n${insights.join('\n')}` 
                    }).catch(() => {});
                }
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
    const diag = reflectionEngine.getDiagnostics();

    return `🌅 *Morning Report — Maureonix v7*

📅 ${new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

⏱️ Uptime: ${uptime}
👥 Active Users: ${users}
🏠 Groups: ${groups}
🔑 API Keys: ${Object.values(keys).filter(k => k.healthy).length}/${Object.keys(keys).length} healthy
📊 Success Rate: ${diag.successRate}
⚡ Avg Latency: ${diag.avgLatency}
🧠 Knowledge Graph: ${globalKnowledgeGraph.nodes.size} nodes, ${globalKnowledgeGraph.edges.size} edges
💭 HyperMemory Tiers: ${hyperMemory.working.size} working

Have an omniscient day!`;
}
exports.generateMorningReport = generateMorningReport;

// ═══════════════════════════════════════════════════════════════════════════
//   MEMORY COMPRESSION — Semantic summarization
// ═══════════════════════════════════════════════════════════════════════════
async function compressMemory(userId) {
    const mem = getMemory(userId);
    if (mem.length < 20) return;

    const oldEntries = mem.splice(0, 10);
    const oldText = oldEntries.map(e => `${e.role}: ${e.content}`).join('\n');

    try {
        const summary = await groqChat(
            `Summarize the following conversation history into 2-3 sentences. Preserve names, facts, important decisions, and emotional context.\n\n${oldText}`,
            TASK_MODEL.summarization, userId, null, 0.3, 200
        );
        mem.unshift({ role: 'system', content: `[Memory Summary] ${summary.text}`, timestamp: Date.now() });
        hyperMemory.addEpisodic(userId, summary.text, 'neutral', 0.7);
    } catch (e) {
        mem.unshift(...oldEntries);
    }
}
exports.compressMemory = compressMemory;

// ═══════════════════════════════════════════════════════════════════════════
//   FINAL EXPORTS — Complete API Surface
// ═══════════════════════════════════════════════════════════════════════════
module.exports = {
    // Models & Key Manager
    MODELS, TASK_MODEL, keyManager,

    // Core chat & cognition
    groqChat, ultimateAI, askModel, think, metaThink,

    // Memory & Knowledge
    getMemory, addToMemory, clearMemory, compressMemory, AI_MEMORY,
    hyperMemory, globalKnowledgeGraph,

    // Self-chat & Communication
    selfChatAI, sendLongMessage, enhancedAI, creatorMode, isCreator,
    selfChatGuard, detectSelfChatLoop, clearSelfChatGuard,

    // Crisis & Safety
    detectCrisis, verifyCrisisWithAI,

    // Translation
    googleTranslate, translate,

    // Specialized
    imagine, summarize, codeAI, brainrot, roast, rizz, getBalance,

    // Tone & Emotion
    detectTone, getTonePrompt,

    // Advanced Systems
    expertCouncilDebate, constitutionalReview, generateSelfPatch,
    predictiveEngine, reflectionEngine,

    // Scheduler
    scheduleTask, runScheduledTasks, generateMorningReport,

    // Commands reference
    ALL_COMMANDS, availableTools,
};