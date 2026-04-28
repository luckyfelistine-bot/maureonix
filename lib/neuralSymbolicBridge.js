// ═══════════════════════════════════════════════════════════════════════════
//   🦊 MAUREONIX NEURAL-SYMBOLIC BRIDGE v1.0 — "THE COGNITIVE FUSION"
//   Combines Neural Pattern Matching with Symbolic Logic Reasoning
//   Fuzzy Logic · Rule Engine · Probabilistic Inference · Hybrid Queries
//   Created for Maureonix by Infinite Vybeflix
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
//   FUZZY LOGIC ENGINE — Handles uncertainty and gradations
// ═══════════════════════════════════════════════════════════════════════════
class FuzzyLogic {
    // Membership functions
    static triangular(x, a, b, c) {
        if (x <= a || x >= c) return 0;
        if (x === b) return 1;
        if (x < b) return (x - a) / (b - a);
        return (c - x) / (c - b);
    }

    static trapezoidal(x, a, b, c, d) {
        if (x <= a || x >= d) return 0;
        if (x >= b && x <= c) return 1;
        if (x < b) return (x - a) / (b - a);
        return (d - x) / (d - c);
    }

    static gaussian(x, mean, sigma) {
        return Math.exp(-0.5 * Math.pow((x - mean) / sigma, 2));
    }

    // Fuzzy operators
    static and(a, b) { return Math.min(a, b); }
    static or(a, b) { return Math.max(a, b); }
    static not(a) { return 1 - a; }
    static imply(a, b) { return Math.min(1, 1 - a + b); }

    // Defuzzification (centroid method)
    static defuzzify(sets, domain = { min: 0, max: 100, step: 1 }) {
        let numerator = 0, denominator = 0;
        for (let x = domain.min; x <= domain.max; x += domain.step) {
            let maxMembership = 0;
            for (const set of sets) {
                maxMembership = Math.max(maxMembership, set.membership(x));
            }
            numerator += x * maxMembership;
            denominator += maxMembership;
        }
        return denominator === 0 ? 0 : numerator / denominator;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   SYMBOLIC RULE ENGINE — Explicit logical rules with inference
// ═══════════════════════════════════════════════════════════════════════════
class RuleEngine {
    constructor() {
        this.rules = []; // { id, premises: [{fact, operator, value}], conclusion, confidence, priority }
        this.facts = new Map(); // factName → { value, confidence, timestamp, source }
        this.inferredFacts = new Map();
    }

    addRule(rule) {
        this.rules.push({
            id: rule.id || Date.now() + Math.random(),
            premises: rule.premises || [],
            conclusion: rule.conclusion,
            confidence: rule.confidence || 1.0,
            priority: rule.priority || 0,
            description: rule.description || '',
        });
        // Sort by priority (highest first)
        this.rules.sort((a, b) => b.priority - a.priority);
    }

    setFact(name, value, confidence = 1.0, source = 'explicit') {
        this.facts.set(name, { value, confidence, timestamp: Date.now(), source });
    }

    getFact(name) {
        return this.facts.get(name) || this.inferredFacts.get(name) || null;
    }

    evaluatePremise(premise) {
        const fact = this.getFact(premise.fact);
        if (!fact) return { satisfied: false, confidence: 0 };

        let satisfied = false;
        switch (premise.operator) {
            case 'eq': case '==': satisfied = fact.value == premise.value; break;
            case 'ne': case '!=': satisfied = fact.value != premise.value; break;
            case 'gt': case '>': satisfied = fact.value > premise.value; break;
            case 'gte': case '>=': satisfied = fact.value >= premise.value; break;
            case 'lt': case '<': satisfied = fact.value < premise.value; break;
            case 'lte': case '<=': satisfied = fact.value <= premise.value; break;
            case 'in': satisfied = Array.isArray(premise.value) ? premise.value.includes(fact.value) : String(fact.value).includes(premise.value); break;
            case 'contains': satisfied = String(fact.value).includes(premise.value); break;
            case 'matches': satisfied = new RegExp(premise.value).test(String(fact.value)); break;
            case 'fuzzy': {
                // Fuzzy matching for uncertain facts
                const similarity = this.calculateSimilarity(fact.value, premise.value);
                satisfied = similarity >= (premise.threshold || 0.7);
                return { satisfied, confidence: similarity * fact.confidence };
            }
        }

        return { satisfied, confidence: fact.confidence };
    }

    calculateSimilarity(a, b) {
        if (typeof a === 'string' && typeof b === 'string') {
            // Simple Jaccard similarity for strings
            const setA = new Set(a.toLowerCase().split(/\s+/));
            const setB = new Set(b.toLowerCase().split(/\s+/));
            const intersection = new Set([...setA].filter(x => setB.has(x)));
            const union = new Set([...setA, ...setB]);
            return intersection.size / union.size;
        }
        return a === b ? 1 : 0;
    }

    infer() {
        const newInferences = [];

        for (const rule of this.rules) {
            let minConfidence = 1.0;
            let allSatisfied = true;

            for (const premise of rule.premises) {
                const result = this.evaluatePremise(premise);
                if (!result.satisfied) {
                    allSatisfied = false;
                    break;
                }
                minConfidence = Math.min(minConfidence, result.confidence);
            }

            if (allSatisfied) {
                const inferredConfidence = minConfidence * rule.confidence;
                const existing = this.inferredFacts.get(rule.conclusion.fact);

                if (!existing || existing.confidence < inferredConfidence) {
                    this.inferredFacts.set(rule.conclusion.fact, {
                        value: rule.conclusion.value,
                        confidence: inferredConfidence,
                        timestamp: Date.now(),
                        source: `inferred_from_rule_${rule.id}`,
                        rule: rule.description,
                    });
                    newInferences.push({
                        fact: rule.conclusion.fact,
                        value: rule.conclusion.value,
                        confidence: inferredConfidence,
                        rule: rule.description,
                    });
                }
            }
        }

        return newInferences;
    }

    // Chain inference until no new facts are derived
    inferAll(maxIterations = 10) {
        let allInferences = [];
        for (let i = 0; i < maxIterations; i++) {
            const newInfs = this.infer();
            if (newInfs.length === 0) break;
            allInferences = allInferences.concat(newInfs);
        }
        return allInferences;
    }

    explain(factName) {
        const fact = this.getFact(factName);
        if (!fact) return `Fact "${factName}" not found.`;

        if (fact.source && fact.source.startsWith('inferred_from_rule_')) {
            return `Fact "${factName}" = ${JSON.stringify(fact.value)} (confidence: ${(fact.confidence * 100).toFixed(1)}%)\nInferred via: ${fact.rule}`;
        }
        return `Fact "${factName}" = ${JSON.stringify(fact.value)} (confidence: ${(fact.confidence * 100).toFixed(1)}%)\nSource: ${fact.source}`;
    }

    exportRules() {
        return this.rules.map(r => ({
            id: r.id,
            description: r.description,
            premises: r.premises,
            conclusion: r.conclusion,
            confidence: r.confidence,
            priority: r.priority,
        }));
    }

    importRules(rules) {
        for (const rule of rules) this.addRule(rule);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   PROBABILISTIC INFERENCE — Bayesian reasoning
// ═══════════════════════════════════════════════════════════════════════════
class BayesianEngine {
    constructor() {
        this.beliefs = new Map(); // hypothesis → { prior, likelihoods: Map() }
    }

    setPrior(hypothesis, probability) {
        this.beliefs.set(hypothesis, {
            prior: probability,
            likelihoods: new Map(),
            posterior: probability,
        });
    }

    addEvidence(hypothesis, evidence, likelihoodGivenTrue, likelihoodGivenFalse) {
        const belief = this.beliefs.get(hypothesis);
        if (!belief) return;
        belief.likelihoods.set(evidence, { true: likelihoodGivenTrue, false: likelihoodGivenFalse });
    }

    update(evidence, observed = true) {
        for (const [hypothesis, belief] of this.beliefs) {
            const likelihood = belief.likelihoods.get(evidence);
            if (!likelihood) continue;

            const pEgivenH = observed ? likelihood.true : (1 - likelihood.true);
            const pEgivenNotH = observed ? likelihood.false : (1 - likelihood.false);

            const numerator = pEgivenH * belief.posterior;
            const denominator = numerator + pEgivenNotH * (1 - belief.posterior);

            belief.posterior = denominator === 0 ? belief.prior : numerator / denominator;
        }
    }

    getPosterior(hypothesis) {
        return this.beliefs.get(hypothesis)?.posterior || 0;
    }

    getMostLikely() {
        let best = null, maxProb = 0;
        for (const [h, b] of this.beliefs) {
            if (b.posterior > maxProb) {
                maxProb = b.posterior;
                best = h;
            }
        }
        return { hypothesis: best, probability: maxProb };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   HYBRID QUERY ENGINE — Combines neural and symbolic results
// ═══════════════════════════════════════════════════════════════════════════
class HybridQueryEngine {
    constructor(ruleEngine, bayesianEngine) {
        this.ruleEngine = ruleEngine;
        this.bayesianEngine = bayesianEngine;
    }

    async query(queryText, neuralResults, userId) {
        // Neural results come from LLM (ambiguous, creative, contextual)
        // Symbolic results come from rule engine (precise, logical, explainable)

        // Set facts from neural results
        if (neuralResults.intent) {
            this.ruleEngine.setFact('user_intent', neuralResults.intent, neuralResults.confidence || 0.8, 'neural');
        }
        if (neuralResults.tone) {
            this.ruleEngine.setFact('user_tone', neuralResults.tone, 0.9, 'neural');
        }
        if (neuralResults.urgency) {
            this.ruleEngine.setFact('message_urgency', neuralResults.urgency, 0.85, 'neural');
        }

        // Run symbolic inference
        const inferences = this.ruleEngine.inferAll();

        // Combine neural and symbolic confidence
        const combined = {
            intent: neuralResults.intent,
            neuralConfidence: neuralResults.confidence || 0.5,
            symbolicConfidence: inferences.length > 0 ? Math.max(...inferences.map(i => i.confidence)) : 0,
            inferences,
            explanation: inferences.map(i => this.ruleEngine.explain(i.fact)).join('\n'),
        };

        // Weighted fusion
        combined.fusedConfidence = (combined.neuralConfidence * 0.6) + (combined.symbolicConfidence * 0.4);

        return combined;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   DEFAULT RULES FOR MAUREONIX
// ═══════════════════════════════════════════════════════════════════════════
const DEFAULT_RULES = [
    {
        id: 'crisis_high_priority',
        description: 'If user shows high distress, escalate to crisis protocol',
        premises: [
            { fact: 'user_tone', operator: 'eq', value: 'distressed' },
            { fact: 'message_urgency', operator: 'eq', value: 'high' },
        ],
        conclusion: { fact: 'response_priority', value: 'crisis' },
        confidence: 0.95,
        priority: 100,
    },
    {
        id: 'angry_user_calm',
        description: 'If user is angry, use calm tone and offer solutions',
        premises: [
            { fact: 'user_tone', operator: 'eq', value: 'angry' },
        ],
        conclusion: { fact: 'response_strategy', value: 'calm_solution_focused' },
        confidence: 0.9,
        priority: 90,
    },
    {
        id: 'creator_full_access',
        description: 'If user is creator, grant full system access',
        premises: [
            { fact: 'user_role', operator: 'eq', value: 'creator' },
        ],
        conclusion: { fact: 'access_level', value: 'unrestricted' },
        confidence: 1.0,
        priority: 1000,
    },
    {
        id: 'new_user_welcome',
        description: 'If user is new, provide welcome and guidance',
        premises: [
            { fact: 'user_interaction_count', operator: 'lte', value: 3 },
        ],
        conclusion: { fact: 'response_style', value: 'welcoming_guided' },
        confidence: 0.85,
        priority: 70,
    },
    {
        id: 'complex_query_deep_reasoning',
        description: 'If query is complex, enable deep reasoning',
        premises: [
            { fact: 'query_complexity', operator: 'gte', value: 0.7 },
        ],
        conclusion: { fact: 'reasoning_depth', value: 'deep' },
        confidence: 0.9,
        priority: 80,
    },
    {
        id: 'game_mode_simple',
        description: 'If in game mode, use simple responses',
        premises: [
            { fact: 'conversation_state', operator: 'eq', value: 'gaming' },
        ],
        conclusion: { fact: 'response_complexity', value: 'simple' },
        confidence: 0.95,
        priority: 85,
    },
    {
        id: 'learning_mode_educational',
        description: 'If in learning mode, use educational tone',
        premises: [
            { fact: 'conversation_state', operator: 'eq', value: 'learning' },
        ],
        conclusion: { fact: 'response_style', value: 'educational_socratic' },
        confidence: 0.95,
        priority: 90,
    },
    {
        id: 'group_admin_tools',
        description: 'If in group and user is admin, suggest admin tools',
        premises: [
            { fact: 'chat_type', operator: 'eq', value: 'group' },
            { fact: 'user_role', operator: 'eq', value: 'admin' },
        ],
        conclusion: { fact: 'available_features', value: 'admin_full' },
        confidence: 0.9,
        priority: 75,
    },
];

// ═══════════════════════════════════════════════════════════════════════════
//   INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════
const ruleEngine = new RuleEngine();
const bayesianEngine = new BayesianEngine();
const hybridQueryEngine = new HybridQueryEngine(ruleEngine, bayesianEngine);

// Load default rules
for (const rule of DEFAULT_RULES) {
    ruleEngine.addRule(rule);
}

// ═══════════════════════════════════════════════════════════════════════════
//   EXPORTS
// ═══════════════════════════════════════════════════════════════════════════
module.exports = {
    FuzzyLogic,
    RuleEngine,
    BayesianEngine,
    HybridQueryEngine,
    ruleEngine,
    bayesianEngine,
    hybridQueryEngine,
    DEFAULT_RULES,
};