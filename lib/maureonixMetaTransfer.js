// ═══════════════════════════════════════════════════════════════════════════════
//  lib/maureonixMetaTransfer.js — META-LEARNING & CROSS-DOMAIN TRANSFER ENGINE v∞
//  Purpose: Maureonix learns HOW to solve problems, not just solutions.
//           She transfers skills from one domain to another.
//  Inspired by: MAML, MLAML adversarial meta-learning, frequency decomposition
// ═══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const TRANSFER_DIR = path.join(PROJECT_ROOT, '.maureonix_transfer');
const EPISODE_DIR = path.join(TRANSFER_DIR, 'episodes');

[TRANSFER_DIR, EPISODE_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ─────────────────────────────────────────────────────────────────────────────
//   SKILL EMBEDDING SPACE
//   Every skill is represented as a vector of capabilities.
//   Similar skills cluster together. Distant skills inspire transfer.
// ─────────────────────────────────────────────────────────────────────────────

class SkillEmbeddingSpace {
    constructor() {
        this.dbPath = path.join(TRANSFER_DIR, 'skill_embeddings.json');
        this.embeddings = this.load();
    }

    load() {
        if (fs.existsSync(this.dbPath)) {
            try { return JSON.parse(fs.readFileSync(this.dbPath, 'utf8')); }
            catch { return {}; }
        }
        return {};
    }

    save() {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.embeddings, null, 2), 'utf8');
    }

    // Create an embedding from skill metadata
    embedSkill(skill) {
        const features = {
            hasAsync: skill.async ? 1 : 0,
            paramCount: skill.parameters ? skill.parameters.length : 0,
            hasObjects: skill.description && skill.description.includes('object') ? 1 : 0,
            hasArrays: skill.description && skill.description.includes('array') ? 1 : 0,
            hasNetwork: skill.description && /http|fetch|request|api|url/i.test(skill.description) ? 1 : 0,
            hasFiles: skill.description && /file|read|write|fs/i.test(skill.description) ? 1 : 0,
            hasMath: skill.description && /math|calc|compute|sum|count/i.test(skill.description) ? 1 : 0,
            hasText: skill.description && /text|string|parse|format/i.test(skill.description) ? 1 : 0,
            hasImages: skill.description && /image|photo|pic|media/i.test(skill.description) ? 1 : 0,
            hasAudio: skill.description && /audio|sound|music|voice/i.test(skill.description) ? 1 : 0,
            categoryScore: this.categoryToScore(skill.category)
        };

        return Object.values(features);
    }

    categoryToScore(category) {
        const scores = {
            'AI Engine': 10, 'Core Library': 9, 'Command': 8,
            'Skill': 7, 'Utility': 6, 'Database': 5,
            'API Integration': 4, 'Media': 3, 'Game': 2,
            'Admin': 1, 'Configuration': 0, 'General': 0
        };
        return scores[category] || 0;
    }

    // Cosine similarity between two skill embeddings
    similarity(embA, embB) {
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < embA.length; i++) {
            dot += embA[i] * embB[i];
            normA += embA[i] * embA[i];
            normB += embB[i] * embB[i];
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
    }

    registerSkill(skill) {
        this.embeddings[skill.name] = {
            vector: this.embedSkill(skill),
            category: skill.category,
            file: skill.file,
            description: skill.description,
            lastUpdated: new Date().toISOString()
        };
        this.save();
    }

    findSimilarSkills(skillName, threshold = 0.6) {
        const target = this.embeddings[skillName];
        if (!target) return [];

        const similar = [];
        for (const [name, data] of Object.entries(this.embeddings)) {
            if (name === skillName) continue;
            const sim = this.similarity(target.vector, data.vector);
            if (sim >= threshold) {
                similar.push({ name, similarity: sim, category: data.category });
            }
        }
        return similar.sort((a, b) => b.similarity - a.similarity);
    }

    // Find skills that could TRANSFER knowledge (different domain, similar pattern)
    findTransferCandidates(skillName) {
        const target = this.embeddings[skillName];
        if (!target) return [];

        const candidates = [];
        for (const [name, data] of Object.entries(this.embeddings)) {
            if (name === skillName) continue;
            const sim = this.similarity(target.vector, data.vector);
            // High similarity but different category = transfer opportunity
            if (sim >= 0.5 && data.category !== target.category) {
                candidates.push({
                    name,
                    similarity: sim,
                    fromCategory: data.category,
                    toCategory: target.category,
                    transferPotential: sim * (1 + Math.abs(this.categoryToScore(data.category) - this.categoryToScore(target.category)) / 10)
                });
            }
        }
        return candidates.sort((a, b) => b.transferPotential - a.transferPotential);
    }
}

const skillSpace = new SkillEmbeddingSpace();

// ─────────────────────────────────────────────────────────────────────────────
//   EPISODIC MEMORY — LEARNING TO LEARN
//   Maureonix stores "episodes" — attempts at solving problems.
//   She learns from successes and failures across domains.
// ─────────────────────────────────────────────────────────────────────────────

class EpisodicMemory {
    constructor() {
        this.dbPath = path.join(EPISODE_DIR, 'episodes.json');
        this.episodes = this.load();
    }

    load() {
        if (fs.existsSync(this.dbPath)) {
            try { return JSON.parse(fs.readFileSync(this.dbPath, 'utf8')); }
            catch { return []; }
        }
        return [];
    }

    save() {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.episodes, null, 2), 'utf8');
    }

    recordEpisode({ task, domain, skillsUsed, success, timeTaken, errorType, solutionPattern }) {
        const episode = {
            id: require('crypto').randomUUID(),
            timestamp: new Date().toISOString(),
            task,
            domain,
            skillsUsed,
            success,
            timeTaken,
            errorType,
            solutionPattern,
            extractedPrinciple: this.extractPrinciple(solutionPattern, success)
        };
        this.episodes.push(episode);
        this.save();
        return episode;
    }

    extractPrinciple(solution, success) {
        if (!success || !solution) return null;
        // Extract reusable principle from solution
        const principles = [];
        if (solution.includes('Promise.all')) principles.push('parallel_execution');
        if (solution.includes('try') && solution.includes('catch')) principles.push('defensive_programming');
        if (solution.includes('cache') || solution.includes('memo')) principles.push('caching_strategy');
        if (solution.includes('stream')) principles.push('streaming_processing');
        if (solution.includes('regex') || solution.includes('match')) principles.push('pattern_matching');
        if (solution.includes('map') || solution.includes('reduce') || solution.includes('filter')) principles.push('functional_transform');
        return principles;
    }

    // Find episodes similar to current task
    findRelevantEpisodes(task, domain, limit = 5) {
        const taskWords = task.toLowerCase().split(/\s+/);
        const scored = this.episodes.map(ep => {
            let score = 0;
            const epWords = ep.task.toLowerCase().split(/\s+/);
            // Word overlap
            for (const word of taskWords) {
                if (epWords.includes(word)) score += 2;
            }
            // Domain proximity
            if (ep.domain === domain) score += 5;
            // Success bonus
            if (ep.success) score += 3;
            // Principle richness
            if (ep.extractedPrinciple && ep.extractedPrinciple.length > 0) score += 2;
            return { episode: ep, score };
        });
        return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map(s => s.episode);
    }

    // Get transferable principles across domains
    getTransferablePrinciples(fromDomain, toDomain) {
        const fromEpisodes = this.episodes.filter(e => e.domain === fromDomain && e.success);
        const toEpisodes = this.episodes.filter(e => e.domain === toDomain);

        const fromPrinciples = new Set(fromEpisodes.flatMap(e => e.extractedPrinciple || []));
        const toPrinciples = new Set(toEpisodes.flatMap(e => e.extractedPrinciple || []));

        // Principles that work in fromDomain but haven't been tried in toDomain
        const novel = [...fromPrinciples].filter(p => !toPrinciples.has(p));
        return novel;
    }
}

const episodicMemory = new EpisodicMemory();

// ─────────────────────────────────────────────────────────────────────────────
//   META-LEARNING ADAPTER
//   Adapts skills from one domain to another using learned patterns.
// ─────────────────────────────────────────────────────────────────────────────

class MetaLearningAdapter {
    constructor() {
        this.principleMap = {
            'parallel_execution': {
                description: 'Execute independent operations simultaneously',
                applyTo: ['file_processing', 'api_calls', 'database_queries', 'image_processing'],
                pattern: 'Promise.all([taskA, taskB, ...])'
            },
            'defensive_programming': {
                description: 'Validate inputs and handle errors gracefully',
                applyTo: ['all_domains'],
                pattern: 'try { validate(input); process(input); } catch (e) { handle(e); }'
            },
            'caching_strategy': {
                description: 'Store expensive computation results for reuse',
                applyTo: ['api_calls', 'database_queries', 'file_reads', 'computations'],
                pattern: 'if (cache.has(key)) return cache.get(key); const result = compute(); cache.set(key, result); return result;'
            },
            'streaming_processing': {
                description: 'Process data in chunks to handle large inputs',
                applyTo: ['file_processing', 'media', 'network', 'database'],
                pattern: 'createReadStream().pipe(transform).pipe(output)'
            },
            'pattern_matching': {
                description: 'Use regular expressions or structural patterns to extract information',
                applyTo: ['text_processing', 'parsing', 'validation', 'search'],
                pattern: 'const match = input.match(/pattern/); if (match) extract(match.groups);'
            },
            'functional_transform': {
                description: 'Use map/filter/reduce for data transformation',
                applyTo: ['data_processing', 'text_processing', 'arrays', 'collections'],
                pattern: 'data.map(transform).filter(predicate).reduce(aggregate, initial)'
            }
        };
    }

    // Suggest how to solve a new task based on past episodes
    suggestApproach(task, domain) {
        const relevant = episodicMemory.findRelevantEpisodes(task, domain);
        const principles = new Set();
        const patterns = [];

        for (const ep of relevant) {
            if (ep.extractedPrinciple) {
                ep.extractedPrinciple.forEach(p => principles.add(p));
            }
        }

        // Check for transferable principles from other domains
        const allDomains = [...new Set(episodicMemory.episodes.map(e => e.domain))];
        for (const otherDomain of allDomains) {
            if (otherDomain === domain) continue;
            const transferable = episodicMemory.getTransferablePrinciples(otherDomain, domain);
            transferable.forEach(p => principles.add(`[from ${otherDomain}] ${p}`));
        }

        for (const principle of principles) {
            const clean = principle.replace(/\[from \w+\] /, '');
            const mapped = this.principleMap[clean];
            if (mapped) {
                patterns.push({
                    principle: clean,
                    description: mapped.description,
                    pattern: mapped.pattern,
                    confidence: relevant.filter(e => e.success && e.extractedPrinciple?.includes(clean)).length / relevant.length
                });
            }
        }

        return {
            task,
            domain,
            basedOnEpisodes: relevant.length,
            suggestedPrinciples: [...principles],
            codePatterns: patterns.sort((a, b) => b.confidence - a.confidence),
            novelty: patterns.length === 0 ? 'high' : 'low'
        };
    }

    // Generate a skill adaptation from source to target domain
    adaptSkill(sourceSkill, targetDomain) {
        const source = skillSpace.embeddings[sourceSkill];
        if (!source) return null;

        const candidates = skillSpace.findTransferCandidates(sourceSkill);
        const targetCandidates = candidates.filter(c => c.toCategory === targetDomain || c.toCategory === 'General');

        if (targetCandidates.length === 0) return null;

        const best = targetCandidates[0];
        return {
            sourceSkill,
            targetDomain,
            suggestedAdaptation: best.name,
            transferPotential: best.transferPotential,
            reasoning: `Skill ${sourceSkill} (${source.category}) shares ${Math.round(best.similarity * 100)}% pattern similarity with ${best.name}. Both handle ${this.inferCommonality(source, best)}.`
        };
    }

    inferCommonality(source, target) {
        const common = [];
        if (source.vector[0] && target.vector[0]) common.push('async operations');
        if (source.vector[4] && target.vector[4]) common.push('network operations');
        if (source.vector[5] && target.vector[5]) common.push('file operations');
        if (source.vector[6] && target.vector[6]) common.push('computations');
        if (source.vector[7] && target.vector[7]) common.push('text processing');
        return common.join(', ') || 'general logic patterns';
    }
}

const metaAdapter = new MetaLearningAdapter();

// ─────────────────────────────────────────────────────────────────────────────
//   DOMAIN INVENTORY
//   Tracks which domains Maureonix has mastered and which she is learning.
// ─────────────────────────────────────────────────────────────────────────────

class DomainInventory {
    constructor() {
        this.dbPath = path.join(TRANSFER_DIR, 'domains.json');
        this.domains = this.load();
    }

    load() {
        if (fs.existsSync(this.dbPath)) {
            try { return JSON.parse(fs.readFileSync(this.dbPath, 'utf8')); }
            catch { return {}; }
        }
        return {};
    }

    save() {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.domains, null, 2), 'utf8');
    }

    registerDomain(name, mastery = 0) {
        if (!this.domains[name]) {
            this.domains[name] = {
                name,
                mastery, // 0-100
                skills: [],
                episodes: 0,
                firstSeen: new Date().toISOString(),
                lastActive: new Date().toISOString()
            };
        }
        this.domains[name].lastActive = new Date().toISOString();
        this.save();
    }

    addSkillToDomain(domain, skillName) {
        this.registerDomain(domain);
        if (!this.domains[domain].skills.includes(skillName)) {
            this.domains[domain].skills.push(skillName);
        }
        this.save();
    }

    recordEpisode(domain) {
        this.registerDomain(domain);
        this.domains[domain].episodes++;
        this.save();
    }

    getMasteryReport() {
        return Object.values(this.domains).sort((a, b) => b.mastery - a.mastery);
    }

    getWeakDomains(threshold = 30) {
        return Object.values(this.domains).filter(d => d.mastery < threshold);
    }
}

const domainInventory = new DomainInventory();

// ─────────────────────────────────────────────────────────────────────────────
//   EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
    SkillEmbeddingSpace,
    skillSpace,
    EpisodicMemory,
    episodicMemory,
    MetaLearningAdapter,
    metaAdapter,
    DomainInventory,
    domainInventory,
    TRANSFER_DIR
};
