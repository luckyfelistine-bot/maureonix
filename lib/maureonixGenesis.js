// ═══════════════════════════════════════════════════════════════════════════════
//  lib/maureonixGenesis.js — CREATIVE GENESIS ENGINE v∞
//  Purpose: Maureonix asks questions no one asked. She originates, not just imitates.
//  Inspired by: Human curiosity, anomaly detection, surprise-driven learning,
//               and the recognition that current AI cannot make fundamental discoveries [^24^]
// ═══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const GENESIS_DIR = path.join(PROJECT_ROOT, '.maureonix_genesis');
const CURIOSITY_DIR = path.join(GENESIS_DIR, 'curiosity');
const ANOMALY_DIR = path.join(GENESIS_DIR, 'anomalies');
const QUESTION_DIR = path.join(GENESIS_DIR, 'questions');
const INSIGHT_DIR = path.join(GENESIS_DIR, 'insights');

[CURIOSITY_DIR, ANOMALY_DIR, QUESTION_DIR, INSIGHT_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ─────────────────────────────────────────────────────────────────────────────
//   ANOMALY DETECTOR
//   She notices when things don't fit. Surprise is the seed of discovery.
// ─────────────────────────────────────────────────────────────────────────────

class AnomalyDetector {
    constructor() {
        this.dbPath = path.join(ANOMALY_DIR, 'anomalies.json');
        this.anomalies = this.load();
        this.baselineStats = new Map();
    }

    load() {
        if (fs.existsSync(this.dbPath)) {
            try { return JSON.parse(fs.readFileSync(this.dbPath, 'utf8')); }
            catch { return []; }
        }
        return [];
    }

    save() {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.anomalies, null, 2), 'utf8');
    }

    // Establish baseline for a metric
    establishBaseline(name, values) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        this.baselineStats.set(name, { avg, stdDev, count: values.length });
    }

    // Detect if a new value is anomalous
    detect(name, value) {
        const baseline = this.baselineStats.get(name);
        if (!baseline) return { isAnomaly: false, reason: 'No baseline' };

        const zScore = Math.abs(value - baseline.avg) / (baseline.stdDev || 1);
        const isAnomaly = zScore > 2.5; // 2.5 sigma = 99% confidence

        if (isAnomaly) {
            const anomaly = {
                id: require('crypto').randomUUID(),
                timestamp: new Date().toISOString(),
                metric: name,
                value,
                expected: baseline.avg,
                deviation: zScore,
                type: value > baseline.avg ? 'unexpected_high' : 'unexpected_low',
                investigated: false,
                insight: null
            };
            this.anomalies.push(anomaly);
            this.save();
            return { isAnomaly: true, anomaly, surprise: zScore };
        }

        return { isAnomaly: false, zScore };
    }

    // Detect logical anomalies — things that shouldn't coexist
    detectLogicalConflict(skillA, skillB) {
        // Two skills that do opposite things
        const conflicts = [
            ['encrypt', 'decrypt'],
            ['compress', 'decompress'],
            ['lock', 'unlock'],
            ['enable', 'disable'],
            ['start', 'stop']
        ];

        const aName = skillA.name.toLowerCase();
        const bName = skillB.name.toLowerCase();

        for (const [op1, op2] of conflicts) {
            if ((aName.includes(op1) && bName.includes(op2)) ||
                (aName.includes(op2) && bName.includes(op1))) {
                return {
                    isConflict: true,
                    type: 'inverse_operation',
                    description: `${skillA.name} and ${skillB.name} are inverse operations`,
                    opportunity: 'Could combine into a toggle or state machine'
                };
            }
        }

        return { isConflict: false };
    }

    // Detect missing capabilities — gaps in the skill space
    detectMissingCapabilities(skills) {
        const categories = new Set(skills.map(s => s.category));
        const commonPatterns = [
            { pattern: /image.*resize|resize.*image/, category: 'Media', name: 'image_resizer' },
            { pattern: /audio.*convert|convert.*audio/, category: 'Media', name: 'audio_converter' },
            { pattern: /pdf.*merge|merge.*pdf/, category: 'Utility', name: 'pdf_merger' },
            { pattern: /backup.*auto|auto.*backup/, category: 'Core Library', name: 'auto_backup' },
            { pattern: /cache.*clear|clear.*cache/, category: 'Core Library', name: 'cache_manager' },
            { pattern: /rate.*limit|limit.*rate/, category: 'API Integration', name: 'rate_limiter' },
            { pattern: /encrypt.*file|file.*encrypt/, category: 'Utility', name: 'file_encryptor' }
        ];

        const missing = [];
        for (const candidate of commonPatterns) {
            const hasSimilar = skills.some(s => candidate.pattern.test(s.name + ' ' + s.description));
            if (!hasSimilar) {
                missing.push({
                    name: candidate.name,
                    category: candidate.category,
                    reason: 'Common pattern not found in skill registry',
                    priority: 'medium'
                });
            }
        }

        return missing;
    }

    getUninvestigatedAnomalies() {
        return this.anomalies.filter(a => !a.investigated);
    }

    investigate(anomalyId, insight) {
        const a = this.anomalies.find(x => x.id === anomalyId);
        if (a) {
            a.investigated = true;
            a.insight = insight;
            a.investigatedAt = new Date().toISOString();
            this.save();
        }
    }
}

const anomalyDetector = new AnomalyDetector();

// ─────────────────────────────────────────────────────────────────────────────
//   CURIOSITY ENGINE
//   She asks questions. Not because she was prompted, but because she wants to know.
// ─────────────────────────────────────────────────────────────────────────────

class CuriosityEngine {
    constructor() {
        this.dbPath = path.join(CURIOSITY_DIR, 'curiosity.json');
        this.questions = this.load();
        this.questionTemplates = [
            // Pattern: What if X but Y?
            { template: 'What if {skillA} could {action} like {skillB}?', type: 'analogy' },
            { template: 'Why does {skill} use {approach} instead of {alternative}?', type: 'challenge' },
            { template: 'What would happen if we removed {component} from {system}?', type: 'subtraction' },
            { template: 'Can {skillA} and {skillB} be combined into a single {category} skill?', type: 'synthesis' },
            { template: 'What is the inverse of {skill}? Does it exist?', type: 'inversion' },
            { template: 'If {skill} fails, what is the third alternative (not the backup)?', type: 'lateral' },
            { template: 'What pattern connects {skillA}, {skillB}, and {skillC}?', type: 'abstraction' },
            { template: 'Has anyone tried {skill} on {unusual_target}?', type: 'application' },
            { template: 'What is the simplest version of {complex_skill} that still works?', type: 'essence' },
            { template: 'If {skill} had emotions, what would it feel when it fails?', type: 'empathy' }
        ];
    }

    load() {
        if (fs.existsSync(this.dbPath)) {
            try { return JSON.parse(fs.readFileSync(this.dbPath, 'utf8')); }
            catch { return []; }
        }
        return [];
    }

    save() {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.questions, null, 2), 'utf8');
    }

    generateQuestions(skills, context = {}) {
        const questions = [];
        const skillList = skills.slice(0, 20); // Use top 20 skills

        for (const template of this.questionTemplates) {
            const q = this.instantiateTemplate(template, skillList, context);
            if (q && !this.isDuplicate(q.text)) {
                questions.push(q);
            }
        }

        // Generate domain-crossing questions
        const categories = [...new Set(skills.map(s => s.category))];
        for (let i = 0; i < categories.length; i++) {
            for (let j = i + 1; j < categories.length; j++) {
                questions.push({
                    text: `What would a ${categories[i]} skill look like if designed by ${categories[j]} principles?`,
                    type: 'cross_pollination',
                    novelty: 'high',
                    generatedAt: new Date().toISOString()
                });
            }
        }

        // Save new questions
        for (const q of questions) {
            this.questions.push({ ...q, id: require('crypto').randomUUID(), investigated: false });
        }
        this.save();

        return questions;
    }

    instantiateTemplate(template, skills, context) {
        let text = template.template;
        const replacements = {
            skillA: () => this.pickRandom(skills)?.name || 'a skill',
            skillB: () => this.pickRandom(skills)?.name || 'another skill',
            skillC: () => this.pickRandom(skills)?.name || 'a third skill',
            skill: () => this.pickRandom(skills)?.name || 'this skill',
            action: () => context.action || 'operate',
            approach: () => context.approach || 'this approach',
            alternative: () => context.alternative || 'another approach',
            component: () => context.component || 'this component',
            system: () => context.system || 'the system',
            category: () => context.category || 'new',
            unusual_target: () => context.unusualTarget || 'an unexpected target',
            complex_skill: () => this.pickRandom(skills.filter(s => s.description?.length > 100))?.name || 'this complex skill'
        };

        for (const [key, fn] of Object.entries(replacements)) {
            text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), fn);
        }

        return {
            text,
            type: template.type,
            novelty: this.assessNovelty(text),
            generatedAt: new Date().toISOString()
        };
    }

    pickRandom(arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    }

    assessNovelty(text) {
        // Simple heuristic: longer + more unusual word combinations = more novel
        const words = text.toLowerCase().split(/\s+/);
        const unique = new Set(words);
        const ratio = unique.size / words.length;
        if (ratio > 0.8 && words.length > 15) return 'high';
        if (ratio > 0.6) return 'medium';
        return 'low';
    }

    isDuplicate(text) {
        const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');
        return this.questions.some(q => q.text.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized);
    }

    getUninvestigatedQuestions(limit = 10) {
        return this.questions
            .filter(q => !q.investigated)
            .sort((a, b) => (b.novelty === 'high' ? 1 : 0) - (a.novelty === 'high' ? 1 : 0))
            .slice(0, limit);
    }

    markInvestigated(questionId, findings) {
        const q = this.questions.find(x => x.id === questionId);
        if (q) {
            q.investigated = true;
            q.findings = findings;
            q.investigatedAt = new Date().toISOString();
            this.save();
        }
    }
}

const curiosityEngine = new CuriosityEngine();

// ─────────────────────────────────────────────────────────────────────────────
//   INSIGHT SYNTHESIZER
//   She connects dots that no one else connected.
// ─────────────────────────────────────────────────────────────────────────────

class InsightSynthesizer {
    constructor() {
        this.dbPath = path.join(INSIGHT_DIR, 'insights.json');
        this.insights = this.load();
    }

    load() {
        if (fs.existsSync(this.dbPath)) {
            try { return JSON.parse(fs.readFileSync(this.dbPath, 'utf8')); }
            catch { return []; }
        }
        return [];
    }

    save() {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.insights, null, 2), 'utf8');
    }

    // Synthesize insight from multiple sources
    synthesize(sources) {
        // Look for non-obvious connections
        const connections = [];

        for (let i = 0; i < sources.length; i++) {
            for (let j = i + 1; j < sources.length; j++) {
                const a = sources[i];
                const b = sources[j];
                const connection = this.findConnection(a, b);
                if (connection) connections.push(connection);
            }
        }

        if (connections.length === 0) return null;

        // Rank by surprise factor
        connections.sort((a, b) => b.surprise - a.surprise);
        const best = connections[0];

        const insight = {
            id: require('crypto').randomUUID(),
            timestamp: new Date().toISOString(),
            type: 'synthesis',
            description: best.description,
            sources: [best.sourceA, best.sourceB],
            surprise: best.surprise,
            actionable: best.actionable,
            verified: false
        };

        this.insights.push(insight);
        this.save();
        return insight;
    }

    findConnection(a, b) {
        // Check for shared patterns in descriptions
        const aWords = (a.description || a.name || '').toLowerCase().split(/\s+/);
        const bWords = (b.description || b.name || '').toLowerCase().split(/\s+/);
        const shared = aWords.filter(w => bWords.includes(w) && w.length > 3);

        if (shared.length >= 2) {
            // But they should be in DIFFERENT categories for true cross-domain insight
            const differentCategories = a.category !== b.category;
            const surprise = differentCategories ? shared.length * 2 : shared.length;

            return {
                sourceA: a.name || a,
                sourceB: b.name || b,
                description: `${a.name || a} and ${b.name || b} share the pattern: ${shared.join(', ')}.${differentCategories ? ' This crosses domains!' : ''}`,
                surprise,
                actionable: differentCategories
                    ? `Could create a unified ${a.category}/${b.category} skill using shared pattern`
                    : `Could refactor into shared utility`
            };
        }

        // Check for complementary functions
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();
        const complements = [
            ['read', 'write'], ['get', 'set'], ['create', 'delete'],
            ['encode', 'decode'], ['compress', 'decompress'], ['lock', 'unlock']
        ];

        for (const [op1, op2] of complements) {
            if ((aName.includes(op1) && bName.includes(op2)) ||
                (aName.includes(op2) && bName.includes(op1))) {
                return {
                    sourceA: a.name || a,
                    sourceB: b.name || b,
                    description: `${a.name || a} and ${b.name || b} are complementary operations that could form a stateful pair`,
                    surprise: 5,
                    actionable: `Create a state manager that uses both: ${op1}/${op2} toggle`
                };
            }
        }

        return null;
    }

    // Generate a truly novel hypothesis
    generateHypothesis(observations) {
        const patterns = this.extractPatterns(observations);
        if (patterns.length < 2) return null;

        // Find the gap in the pattern
        const hypothesis = {
            id: require('crypto').randomUUID(),
            timestamp: new Date().toISOString(),
            type: 'hypothesis',
            statement: `If ${patterns[0]} always leads to ${patterns[1]}, then ${patterns[2]} might lead to an undiscovered ${patterns[3]}`,
            basis: patterns,
            testable: true,
            tested: false,
            result: null
        };

        this.insights.push(hypothesis);
        this.save();
        return hypothesis;
    }

    extractPatterns(observations) {
        // Simple pattern extraction: find repeated cause-effect pairs
        const patterns = [];
        for (const obs of observations) {
            if (obs.cause && obs.effect) {
                patterns.push(`${obs.cause} -> ${obs.effect}`);
            }
        }
        return [...new Set(patterns)];
    }

    getTopInsights(limit = 10) {
        return this.insights
            .filter(i => !i.verified || i.surprise > 5)
            .sort((a, b) => (b.surprise || 0) - (a.surprise || 0))
            .slice(0, limit);
    }

    verifyInsight(insightId, result) {
        const i = this.insights.find(x => x.id === insightId);
        if (i) {
            i.verified = true;
            i.verificationResult = result;
            i.verifiedAt = new Date().toISOString();
            this.save();
        }
    }
}

const insightSynthesizer = new InsightSynthesizer();

// ─────────────────────────────────────────────────────────────────────────────
//   GENESIS ORCHESTRATOR
//   The conductor of creative genesis.
// ─────────────────────────────────────────────────────────────────────────────

class GenesisOrchestrator {
    constructor() {
        this.lastGenesis = null;
        this.genesisCount = 0;
    }

    async runGenesisCycle(skills, context = {}) {
        this.genesisCount++;
        const cycle = {
            id: this.genesisCount,
            timestamp: new Date().toISOString(),
            discoveries: []
        };

        // Phase 1: Detect anomalies
        const { anomalyDetector } = require('./maureonixGenesis');
        const missing = anomalyDetector.detectMissingCapabilities(skills);
        if (missing.length > 0) {
            cycle.discoveries.push({
                type: 'missing_capability',
                findings: missing,
                insight: `Found ${missing.length} gaps in the skill ecosystem`
            });
        }

        // Phase 2: Generate questions
        const questions = curiosityEngine.generateQuestions(skills, context);
        const topQuestions = curiosityEngine.getUninvestigatedQuestions(5);
        if (topQuestions.length > 0) {
            cycle.discoveries.push({
                type: 'novel_questions',
                findings: topQuestions,
                insight: `Generated ${questions.length} questions, ${topQuestions.length} uninvestigated`
            });
        }

        // Phase 3: Synthesize insights
        const insight = insightSynthesizer.synthesize(skills.slice(0, 10));
        if (insight) {
            cycle.discoveries.push({
                type: 'cross_domain_insight',
                findings: [insight],
                insight: insight.description
            });
        }

        // Phase 4: Generate hypothesis
        const observations = skills.map(s => ({
            cause: s.category,
            effect: s.name
        }));
        const hypothesis = insightSynthesizer.generateHypothesis(observations);
        if (hypothesis) {
            cycle.discoveries.push({
                type: 'novel_hypothesis',
                findings: [hypothesis],
                insight: hypothesis.statement
            });
        }

        this.lastGenesis = cycle;
        return cycle;
    }

    getGenesisReport() {
        return {
            totalCycles: this.genesisCount,
            lastCycle: this.lastGenesis,
            uninvestigatedQuestions: curiosityEngine.getUninvestigatedQuestions().length,
            uninvestigatedAnomalies: anomalyDetector.getUninvestigatedAnomalies().length,
            topInsights: insightSynthesizer.getTopInsights(5),
            creativeHealth: this.assessCreativeHealth()
        };
    }

    assessCreativeHealth() {
        const q = curiosityEngine.questions.length;
        const investigated = curiosityEngine.questions.filter(x => x.investigated).length;
        const insights = insightSynthesizer.insights.length;
        const verified = insightSynthesizer.insights.filter(x => x.verified).length;

        if (q === 0) return 'dormant';
        if (investigated / q < 0.3) return 'curious';
        if (insights > 10 && verified / insights > 0.5) return 'creative';
        if (insights > 50) return 'genius';
        return 'awakening';
    }
}

const genesisOrchestrator = new GenesisOrchestrator();

// ─────────────────────────────────────────────────────────────────────────────
//   EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
    AnomalyDetector,
    anomalyDetector,
    CuriosityEngine,
    curiosityEngine,
    InsightSynthesizer,
    insightSynthesizer,
    GenesisOrchestrator,
    genesisOrchestrator,
    GENESIS_DIR
};
