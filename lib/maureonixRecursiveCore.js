// ═══════════════════════════════════════════════════════════════════════════════
//  lib/maureonixRecursiveCore.js — RECURSIVE SELF-IMPROVEMENT ENGINE v∞
//  Purpose: Maureonix improves her own code, evaluates the improvement,
//           and applies it only if it makes her better.
//  Inspired by: Claude self-training, AlphaEvolve, ICLR 2026 RSI Workshop
// ═══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const PROJECT_ROOT = path.join(__dirname, '..');
const IMPROVEMENT_DIR = path.join(PROJECT_ROOT, '.maureonix_improvements');
const METRICS_DIR = path.join(PROJECT_ROOT, '.maureonix_metrics');

[IMPROVEMENT_DIR, METRICS_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ─────────────────────────────────────────────────────────────────────────────
//   IMPROVEMENT LINEAGE TRACKER
//   Every change has a parent. We track the family tree of Maureonix's mind.
// ─────────────────────────────────────────────────────────────────────────────

class ImprovementLineage {
    constructor() {
        this.dbPath = path.join(IMPROVEMENT_DIR, 'lineage.json');
        this.entries = this.load();
    }

    load() {
        if (fs.existsSync(this.dbPath)) {
            try { return JSON.parse(fs.readFileSync(this.dbPath, 'utf8')); }
            catch { return []; }
        }
        return [];
    }

    save() {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.entries, null, 2), 'utf8');
    }

    record({ parentHash, fileChanged, changeType, description, metricsBefore, metricsAfter, approved, autoApplied }) {
        const entry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            parentHash,
            fileChanged,
            changeType, // 'optimization', 'bugfix', 'feature', 'refactor'
            description,
            metricsBefore,
            metricsAfter,
            improvementScore: this.calculateImprovement(metricsBefore, metricsAfter),
            approved,
            autoApplied,
            status: autoApplied ? 'applied' : 'pending'
        };
        this.entries.push(entry);
        this.save();
        return entry;
    }

    calculateImprovement(before, after) {
        let score = 0;
        if (before.loadTime && after.loadTime) score += (before.loadTime - after.loadTime) / before.loadTime * 100;
        if (before.errorRate && after.errorRate) score += (before.errorRate - after.errorRate) / before.errorRate * 100;
        if (before.skillCount && after.skillCount) score += (after.skillCount - before.skillCount) * 10;
        return Math.round(score * 100) / 100;
    }

    getBestImprovements(limit = 10) {
        return this.entries
            .filter(e => e.status === 'applied' && e.improvementScore > 0)
            .sort((a, b) => b.improvementScore - a.improvementScore)
            .slice(0, limit);
    }

    getRecentFailures(limit = 10) {
        return this.entries
            .filter(e => e.improvementScore < 0 || e.status === 'reverted')
            .slice(-limit);
    }
}

const lineage = new ImprovementLineage();

// ─────────────────────────────────────────────────────────────────────────────
//   PERFORMANCE METRICS COLLECTOR
//   She measures herself before and after every change.
// ─────────────────────────────────────────────────────────────────────────────

async function collectMetrics() {
    const metrics = {
        timestamp: new Date().toISOString(),
        loadTime: null,
        skillCount: 0,
        fileCount: 0,
        errorRate: 0,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        responseLatency: [],
        crashCount: 0
    };

    try {
        const start = Date.now();
        const { discoverAllSkills } = require('./skillDiscovery');
        const skills = discoverAllSkills();
        metrics.skillCount = skills.length;
        metrics.loadTime = Date.now() - start;

        const manifest = require('./maureonixcore').getFileManifest();
        metrics.fileCount = manifest.totalFiles;
    } catch (e) {
        metrics.errorRate = 1;
    }

    // Load historical crash count
    const crashLog = path.join(METRICS_DIR, 'crashes.json');
    if (fs.existsSync(crashLog)) {
        try {
            const crashes = JSON.parse(fs.readFileSync(crashLog, 'utf8'));
            metrics.crashCount = crashes.length;
        } catch {}
    }

    return metrics;
}

// ─────────────────────────────────────────────────────────────────────────────
//   SELF-ANALYSIS ENGINE
//   She reads her own code and identifies improvement opportunities.
// ─────────────────────────────────────────────────────────────────────────────

function analyzeCodeForImprovement(filePath) {
    const issues = [];
    if (!fs.existsSync(filePath)) return issues;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Pattern 1: Synchronous file operations in async contexts
    const syncFileOps = /fs\.(readFileSync|writeFileSync|appendFileSync)\s*\(/;
    lines.forEach((line, idx) => {
        if (syncFileOps.test(line) && line.includes('async')) {
            issues.push({
                line: idx + 1,
                type: 'performance',
                severity: 'medium',
                message: 'Synchronous file operation inside async context may block event loop',
                suggestion: 'Consider fs.promises.readFile or fs.readFile with callback'
            });
        }
    });

    // Pattern 2: Missing error handling
    const riskyPatterns = [
        { regex: /JSON\.parse\s*\([^)]+\)(?!\s*catch)/, msg: 'JSON.parse without try-catch' },
        { regex: /require\s*\([^)]+\)(?!\s*try)/, msg: 'require without error handling' },
        { regex: /execSync\s*\(/, msg: 'execSync blocks thread — consider exec with callback' }
    ];

    lines.forEach((line, idx) => {
        riskyPatterns.forEach(pattern => {
            if (pattern.regex.test(line) && !line.includes('try') && !line.includes('catch')) {
                issues.push({
                    line: idx + 1,
                    type: 'reliability',
                    severity: 'high',
                    message: pattern.msg,
                    suggestion: 'Wrap in try-catch or add validation'
                });
            }
        });
    });

    // Pattern 3: Hardcoded values that should be config
    const hardcoded = /(const|let|var)\s+\w+\s*=\s*['"]\d{3,}['"]/;
    lines.forEach((line, idx) => {
        if (hardcoded.test(line) && !line.includes('config') && !line.includes('process.env')) {
            issues.push({
                line: idx + 1,
                type: 'maintainability',
                severity: 'low',
                message: 'Potential hardcoded magic number',
                suggestion: 'Move to config.js or constants file'
            });
        }
    });

    // Pattern 4: Deprecated or suboptimal patterns
    const deprecated = [
        { regex: /new Buffer\s*\(/, msg: 'new Buffer is deprecated — use Buffer.from()' },
        { regex: /\.substr\s*\(/, msg: 'String.prototype.substr is deprecated — use slice()' },
        { regex: /__dirname\s*\+\s*['"]/, msg: 'Use path.join(__dirname, ...) for cross-platform safety' }
    ];

    lines.forEach((line, idx) => {
        deprecated.forEach(pattern => {
            if (pattern.regex.test(line)) {
                issues.push({
                    line: idx + 1,
                    type: 'modernization',
                    severity: 'low',
                    message: pattern.msg,
                    suggestion: 'Update to modern equivalent'
                });
            }
        });
    });

    return issues;
}

// ─────────────────────────────────────────────────────────────────────────────
//   IMPROVEMENT GENERATOR
//   Generates candidate improvements based on analysis.
// ─────────────────────────────────────────────────────────────────────────────

function generateImprovementPlan(filePath, issues) {
    const plans = [];
    const content = fs.readFileSync(filePath, 'utf8');

    for (const issue of issues) {
        if (issue.type === 'reliability' && issue.severity === 'high') {
            plans.push({
                priority: 1,
                target: filePath,
                line: issue.line,
                action: 'add_error_handling',
                description: `Add try-catch around ${issue.message}`,
                estimatedImpact: 'high'
            });
        }
        if (issue.type === 'performance') {
            plans.push({
                priority: 2,
                target: filePath,
                line: issue.line,
                action: 'async_conversion',
                description: 'Convert sync file operation to async',
                estimatedImpact: 'medium'
            });
        }
        if (issue.type === 'modernization') {
            plans.push({
                priority: 3,
                target: filePath,
                line: issue.line,
                action: 'modernize_syntax',
                description: issue.message,
                estimatedImpact: 'low'
            });
        }
    }

    // Always suggest adding instrumentation if missing
    if (!content.includes('logToFile') && !content.includes('console.log')) {
        plans.push({
            priority: 2,
            target: filePath,
            action: 'add_instrumentation',
            description: 'Add logging for observability',
            estimatedImpact: 'medium'
        });
    }

    return plans.sort((a, b) => a.priority - b.priority);
}

// ─────────────────────────────────────────────────────────────────────────────
//   SANDBOXED TESTING
//   Tests the improvement in isolation before applying.
// ─────────────────────────────────────────────────────────────────────────────

async function sandboxTest(filePath, proposedContent) {
    const testId = crypto.randomUUID();
    const sandboxPath = path.join(IMPROVEMENT_DIR, `sandbox_${testId}.js`);
    const result = { passed: false, errors: [], warnings: [] };

    try {
        // Write to sandbox
        fs.writeFileSync(sandboxPath, proposedContent, 'utf8');

        // Test 1: Syntax validation
        try {
            execSync(`node --check "${sandboxPath}"`, { timeout: 10000 });
            result.passed = true;
        } catch (e) {
            result.passed = false;
            result.errors.push(`Syntax error: ${e.message}`);
            return result;
        }

        // Test 2: Try requiring the module (if it's a module)
        try {
            delete require.cache[require.resolve(sandboxPath)];
            require(sandboxPath);
            result.passed = true;
        } catch (e) {
            result.passed = false;
            result.errors.push(`Runtime error: ${e.message}`);
        }

        // Test 3: Static analysis - check for common anti-patterns
        const lines = proposedContent.split('\n');
        if (lines.length > 500 && !proposedContent.includes('//')) {
            result.warnings.push('Large file with no comments — consider adding documentation');
        }

    } catch (e) {
        result.errors.push(`Sandbox error: ${e.message}`);
    } finally {
        // Cleanup
        try { fs.unlinkSync(sandboxPath); } catch {}
    }

    return result;
}

// ─────────────────────────────────────────────────────────────────────────────
//   THE RECURSIVE LOOP
//   The heart of self-improvement.
// ─────────────────────────────────────────────────────────────────────────────

class RecursiveImprovementLoop {
    constructor() {
        this.isRunning = false;
        this.iterationCount = 0;
        this.maxIterations = 5; // Safety limit per session
        this.cooldownMs = 60000; // 1 minute between iterations
    }

    async runSingleIteration(targetFiles = null) {
        if (this.isRunning) return { status: 'busy', message: 'Improvement loop already running' };
        this.isRunning = true;
        this.iterationCount++;

        const results = {
            iteration: this.iterationCount,
            timestamp: new Date().toISOString(),
            filesAnalyzed: 0,
            issuesFound: 0,
            plansGenerated: 0,
            testsPassed: 0,
            testsFailed: 0,
            improvementsQueued: []
        };

        try {
            // Phase 1: Collect baseline metrics
            const metricsBefore = await collectMetrics();

            // Phase 2: Discover files to analyze
            const filesToAnalyze = targetFiles || this.discoverTargetFiles();
            results.filesAnalyzed = filesToAnalyze.length;

            // Phase 3: Analyze each file
            for (const file of filesToAnalyze) {
                const issues = analyzeCodeForImprovement(file);
                results.issuesFound += issues.length;

                if (issues.length > 0) {
                    const plans = generateImprovementPlan(file, issues);
                    results.plansGenerated += plans.length;

                    // Phase 4: Generate and test improvements for top priority plans
                    for (const plan of plans.slice(0, 2)) { // Max 2 per file per iteration
                        const improved = await this.applyPlan(file, plan);
                        if (improved) {
                            const testResult = await sandboxTest(file, improved.content);
                            if (testResult.passed) {
                                results.testsPassed++;
                                results.improvementsQueued.push({
                                    file,
                                    plan,
                                    content: improved.content,
                                    testResult
                                });
                            } else {
                                results.testsFailed++;
                            }
                        }
                    }
                }
            }

            // Phase 5: Record lineage
            lineage.record({
                parentHash: this.getCurrentCodeHash(),
                fileChanged: targetFiles ? targetFiles.join(', ') : 'multiple',
                changeType: 'optimization',
                description: `Iteration ${this.iterationCount}: ${results.issuesFound} issues, ${results.testsPassed} improvements passed sandbox`,
                metricsBefore,
                metricsAfter: await collectMetrics(),
                approved: false,
                autoApplied: false
            });

        } catch (e) {
            results.error = e.message;
        } finally {
            this.isRunning = false;
        }

        return results;
    }

    discoverTargetFiles() {
        const targets = [];
        const coreFiles = [
            path.join(PROJECT_ROOT, 'lib', 'maureonixcore.js'),
            path.join(PROJECT_ROOT, 'lib', 'skillDiscovery.js'),
            path.join(PROJECT_ROOT, 'lib', 'maureonixRecursiveCore.js'),
            path.join(PROJECT_ROOT, 'lib', 'maureonixMetaTransfer.js'),
            path.join(PROJECT_ROOT, 'lib', 'maureonixTrustGuard.js'),
            path.join(PROJECT_ROOT, 'lib', 'maureonixGenesis.js')
        ];
        for (const f of coreFiles) {
            if (fs.existsSync(f)) targets.push(f);
        }
        return targets;
    }

    async applyPlan(filePath, plan) {
        const content = fs.readFileSync(filePath, 'utf8');
        let modified = content;

        switch (plan.action) {
            case 'add_error_handling': {
                const lines = content.split('\n');
                const lineIdx = plan.line - 1;
                const targetLine = lines[lineIdx];
                const indent = targetLine.match(/^\s*/)[0];
                lines[lineIdx] = `${indent}try {\n${indent}  ${targetLine.trim()}\n${indent}} catch (e) {\n${indent}  logToFile('error', e.message);\n${indent}}`;
                modified = lines.join('\n');
                break;
            }
            case 'async_conversion': {
                modified = content.replace(
                    /fs\.readFileSync\s*\(([^)]+)\)/g,
                    'await fs.promises.readFile($1)'
                );
                break;
            }
            case 'modernize_syntax': {
                modified = content.replace(/new Buffer\s*\(/g, 'Buffer.from(');
                modified = modified.replace(/\.substr\s*\(/g, '.slice(');
                break;
            }
            case 'add_instrumentation': {
                modified = content.replace(
                    /(function\s+\w+\s*\([^)]*\)\s*\{)/g,
                    "$1\n  logToFile('trace', 'Entering $1');"
                );
                break;
            }
            default:
                return null;
        }

        return { content: modified, plan };
    }

    getCurrentCodeHash() {
        const files = this.discoverTargetFiles();
        const hash = crypto.createHash('sha256');
        for (const f of files) {
            if (fs.existsSync(f)) hash.update(fs.readFileSync(f));
        }
        return hash.digest('hex').slice(0, 16);
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            iterationCount: this.iterationCount,
            maxIterations: this.maxIterations,
            lineageCount: lineage.entries.length,
            bestImprovements: lineage.getBestImprovements(5),
            recentFailures: lineage.getRecentFailures(5)
        };
    }
}

const recursiveLoop = new RecursiveImprovementLoop();

// ─────────────────────────────────────────────────────────────────────────────
//   EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
    RecursiveImprovementLoop,
    recursiveLoop,
    collectMetrics,
    analyzeCodeForImprovement,
    generateImprovementPlan,
    sandboxTest,
    lineage,
    ImprovementLineage
};
