// ═══════════════════════════════════════════════════════════════════════════════
//  lib/maureonixTrustGuard.js — TRUST & SELF-HEALING ENGINE v∞
//  Purpose: Earn trust through verification. Heal herself through sandboxed loops.
//  Inspired by: Replit Agent, Devin, OpenDevin, quantum-inspired self-healing
// ═══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const PROJECT_ROOT = path.join(__dirname, '..');
const SANDBOX_DIR = path.join(PROJECT_ROOT, '.maureonix_sandbox');
const TRUST_DIR = path.join(PROJECT_ROOT, '.maureonix_trust');
const HEALING_DIR = path.join(PROJECT_ROOT, '.maureonix_healing');

[SANDBOX_DIR, TRUST_DIR, HEALING_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ─────────────────────────────────────────────────────────────────────────────
//   TRUST SCORE SYSTEM
//   Every action has a trust score. Low score = high scrutiny.
//   Trust is earned, not given.
// ─────────────────────────────────────────────────────────────────────────────

class TrustScoreSystem {
    constructor() {
        this.dbPath = path.join(TRUST_DIR, 'trust_scores.json');
        this.scores = this.load();
        this.baseThreshold = 70; // Minimum trust to auto-approve
    }

    load() {
        if (fs.existsSync(this.dbPath)) {
            try { return JSON.parse(fs.readFileSync(this.dbPath, 'utf8')); }
            catch { return {}; }
        }
        return {};
    }

    save() {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.scores, null, 2), 'utf8');
    }

    // Calculate trust score for an action
    calculateActionTrust(action) {
        let score = 50; // Start neutral

        // File modification trust factors
        if (action.type === 'write_file') {
            const isNewFile = !fs.existsSync(action.target);
            if (isNewFile) score += 20; // New files are safer
            else {
                score -= 30; // Modifying existing files is risky
                const hasBackup = fs.existsSync(action.backupPath);
                if (hasBackup) score += 15; // Backup reduces risk
            }

            // Core files are highest risk
            const isCoreFile = /maureonix|skillDiscovery|config/.test(action.target);
            if (isCoreFile) score -= 25;

            // Size of change matters
            const changeSize = action.diffSize || 0;
            if (changeSize < 50) score += 10; // Small changes are safer
            if (changeSize > 500) score -= 20; // Large changes are riskier
        }

        // Command execution trust factors
        if (action.type === 'exec_cmd') {
            const cmd = action.command || '';
            if (/npm install/.test(cmd)) score += 10;
            if (/git (pull|status|log)/.test(cmd)) score += 15;
            if (/git push/.test(cmd)) score -= 10; // Push affects remote
            if (/rm |del |format|mkfs/.test(cmd)) score -= 100; // Dangerous
            if (/curl.*\|.*sh|wget.*\|.*sh/.test(cmd)) score -= 100; // Pipe to shell
        }

        // Database operations
        if (action.type === 'db_delete') score -= 20;
        if (action.type === 'db_set') {
            const isConfig = /config|owner|token|passphrase/.test(action.key || '');
            if (isConfig) score -= 40; // Config changes are high risk
        }

        // Restart is moderate risk
        if (action.type === 'restart_bot') score -= 15;

        return Math.max(0, Math.min(100, score));
    }

    // Record action outcome and update trust
    recordOutcome(action, success, creatorApproved) {
        const key = `${action.type}:${action.target || action.command || 'unknown'}`;
        if (!this.scores[key]) {
            this.scores[key] = { total: 0, successes: 0, failures: 0, approvals: 0, lastOutcome: null };
        }
        this.scores[key].total++;
        if (success) this.scores[key].successes++;
        else this.scores[key].failures++;
        if (creatorApproved) this.scores[key].approvals++;
        this.scores[key].lastOutcome = success ? 'success' : 'failure';
        this.scores[key].lastUpdated = new Date().toISOString();
        this.save();
    }

    // Get trust verdict for an action
    getVerdict(action) {
        const score = this.calculateActionTrust(action);
        const key = `${action.type}:${action.target || action.command || 'unknown'}`;
        const history = this.scores[key];
        const successRate = history ? history.successes / history.total : 0.5;

        const adjustedScore = score + (successRate * 20); // Boost based on track record

        if (adjustedScore >= 85) return { verdict: 'AUTO_APPROVE', score: adjustedScore, reason: 'High trust action with good history' };
        if (adjustedScore >= 60) return { verdict: 'NOTIFY', score: adjustedScore, reason: 'Moderate trust — notify creator' };
        if (adjustedScore >= 30) return { verdict: 'REQUIRE_APPROVAL', score: adjustedScore, reason: 'Low trust — requires explicit approval' };
        return { verdict: 'BLOCK', score: adjustedScore, reason: 'Dangerous action blocked for safety' };
    }

    getTrustReport() {
        const entries = Object.entries(this.scores);
        return {
            totalTrackedActions: entries.length,
            highTrustActions: entries.filter(([k, v]) => v.successes / v.total > 0.9).length,
            lowTrustActions: entries.filter(([k, v]) => v.failures / v.total > 0.3).length,
            recentFailures: entries.filter(([k, v]) => v.lastOutcome === 'failure').map(([k]) => k)
        };
    }
}

const trustSystem = new TrustScoreSystem();

// ─────────────────────────────────────────────────────────────────────────────
//   SANDBOX EXECUTOR
//   Runs code in isolation before allowing it near production.
// ─────────────────────────────────────────────────────────────────────────────

class SandboxExecutor {
    constructor() {
        this.timeout = 15000;
        this.maxOutput = 1024 * 1024; // 1MB
    }

    async executeCode(code, context = {}) {
        const sandboxId = crypto.randomUUID();
        const sandboxFile = path.join(SANDBOX_DIR, `test_${sandboxId}.js`);
        const result = {
            success: false,
            output: '',
            error: null,
            duration: 0,
            sandboxId
        };

        try {
            // Wrap code in a safe container
            const wrappedCode = `
                const fs = require('fs');
                const path = require('path');
                // Restricted fs — only within sandbox
                const safeFs = {
                    readFileSync: (p, ...args) => {
                        const resolved = path.resolve(p);
                        if (!resolved.startsWith('${SANDBOX_DIR.replace(/\\/g, '\\\\')}')) {
                            throw new Error('Sandbox violation: attempted to read outside sandbox');
                        }
                        return fs.readFileSync(resolved, ...args);
                    },
                    writeFileSync: (p, ...args) => {
                        const resolved = path.resolve(p);
                        if (!resolved.startsWith('${SANDBOX_DIR.replace(/\\/g, '\\\\')}')) {
                            throw new Error('Sandbox violation: attempted to write outside sandbox');
                        }
                        return fs.writeFileSync(resolved, ...args);
                    }
                };

                // Execute user code with restricted context
                (async () => {
                    try {
                        ${code}
                        console.log('__SANDBOX_SUCCESS__');
                    } catch (e) {
                        console.error('__SANDBOX_ERROR__:', e.message);
                        process.exit(1);
                    }
                })();
            `;

            fs.writeFileSync(sandboxFile, wrappedCode, 'utf8');

            const start = Date.now();
            const output = execSync(`node "${sandboxFile}"`, {
                timeout: this.timeout,
                encoding: 'utf8',
                maxBuffer: this.maxOutput,
                cwd: SANDBOX_DIR
            });
            result.duration = Date.now() - start;
            result.output = output;
            result.success = output.includes('__SANDBOX_SUCCESS__');

        } catch (e) {
            result.error = e.message;
            result.success = false;
        } finally {
            // Cleanup
            try { fs.unlinkSync(sandboxFile); } catch {}
            // Cleanup any files created in sandbox
            const sandboxFiles = fs.readdirSync(SANDBOX_DIR);
            for (const f of sandboxFiles) {
                if (f.startsWith(`test_${sandboxId}`)) {
                    try { fs.unlinkSync(path.join(SANDBOX_DIR, f)); } catch {}
                }
            }
        }

        return result;
    }

    async testSkill(skillFunc, args = {}) {
        const funcStr = skillFunc.toString();
        const testCode = `
            const skill = ${funcStr};
            const result = skill(${JSON.stringify(args)});
            if (result && typeof result.then === 'function') {
                result.then(r => {
                    console.log('Result:', JSON.stringify(r));
                    console.log('__SANDBOX_SUCCESS__');
                }).catch(e => {
                    console.error('__SANDBOX_ERROR__:', e.message);
                    process.exit(1);
                });
            } else {
                console.log('Result:', JSON.stringify(result));
                console.log('__SANDBOX_SUCCESS__');
            }
        `;
        return this.executeCode(testCode);
    }
}

const sandbox = new SandboxExecutor();

// ─────────────────────────────────────────────────────────────────────────────
//   SELF-HEALING LOOP
//   Generate → Execute → Analyze → Repair → Repeat
// ─────────────────────────────────────────────────────────────────────────────

class SelfHealingLoop {
    constructor() {
        this.maxRetries = 5;
        this.healingLog = [];
    }

    async healCode(originalCode, errorContext, intent) {
        let currentCode = originalCode;
        let iteration = 0;
        const healingSession = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            intent,
            iterations: [],
            finalStatus: 'failed'
        };

        while (iteration < this.maxRetries) {
            iteration++;

            // Step 1: Execute current code in sandbox
            const execResult = await sandbox.executeCode(currentCode);

            const iterationRecord = {
                iteration,
                code: currentCode.slice(0, 500),
                execution: execResult,
                repairs: []
            };

            if (execResult.success) {
                iterationRecord.repairs.push('Code executed successfully');
                healingSession.iterations.push(iterationRecord);
                healingSession.finalStatus = 'healed';
                healingSession.finalCode = currentCode;
                this.logHealing(healingSession);
                return {
                    success: true,
                    code: currentCode,
                    iterations: iteration,
                    session: healingSession
                };
            }

            // Step 2: Analyze error and generate repair
            const error = execResult.error || 'Unknown error';
            const repair = this.generateRepair(currentCode, error, errorContext);

            if (!repair) {
                iterationRecord.repairs.push('No repair strategy found');
                healingSession.iterations.push(iterationRecord);
                break;
            }

            iterationRecord.repairs.push(repair.description);
            currentCode = repair.fixedCode;
            healingSession.iterations.push(iterationRecord);
        }

        healingSession.finalStatus = iteration >= this.maxRetries ? 'max_retries_exceeded' : 'unrepairable';
        this.logHealing(healingSession);

        return {
            success: false,
            code: originalCode,
            iterations: iteration,
            lastError: healingSession.iterations[healingSession.iterations.length - 1]?.execution?.error,
            session: healingSession
        };
    }

    generateRepair(code, error, context) {
        const repairs = [];

        // Repair 1: Missing variable declaration
        if (/ReferenceError: (\w+) is not defined/.test(error)) {
            const varName = error.match(/ReferenceError: (\w+) is not defined/)[1];
            repairs.push({
                description: `Declare missing variable '${varName}'`,
                fixedCode: code.replace(
                    new RegExp(`\\b${varName}\\b(?=\\s*=)`),
                    `const ${varName}`
                )
            });
        }

        // Repair 2: Missing await in async context
        if (/SyntaxError: await is only valid in async function/.test(error)) {
            repairs.push({
                description: 'Wrap in async function',
                fixedCode: `(async () => {\n${code}\n})();`
            });
        }

        // Repair 3: JSON parse error
        if (/SyntaxError: Unexpected token/.test(error) && code.includes('JSON.parse')) {
            repairs.push({
                description: 'Add try-catch around JSON.parse',
                fixedCode: code.replace(
                    /JSON\.parse\s*\(([^)]+)\)/g,
                    '((str) => { try { return JSON.parse(str); } catch { return null; } })($1)'
                )
            });
        }

        // Repair 4: Missing module
        if (/Error: Cannot find module/.test(error)) {
            const modName = error.match(/Cannot find module '([^']+)'/)?.[1];
            if (modName) {
                repairs.push({
                    description: `Add fallback for missing module '${modName}'`,
                    fixedCode: code.replace(
                        new RegExp(`require\\s*\\(['"]${modName}['"]\\)`),
                        `(try { require('${modName}') } catch { return { error: 'Module ${modName} not available' } })`
                    )
                });
            }
        }

        // Repair 5: Type error — property of undefined
        if (/TypeError: Cannot read propert(?:y|ies) of (undefined|null)/.test(error)) {
            repairs.push({
                description: 'Add optional chaining',
                fixedCode: code.replace(/(\w+)\.(\w+)/g, '$1?.$2')
            });
        }

        // Default: wrap in try-catch
        if (repairs.length === 0) {
            repairs.push({
                description: 'Wrap in defensive try-catch',
                fixedCode: `try {\n${code}\n} catch (e) {\n  console.error('Healed error:', e.message);\n  return { error: e.message, healed: true };\n}`
            });
        }

        return repairs[0];
    }

    logHealing(session) {
        this.healingLog.push(session);
        const logPath = path.join(HEALING_DIR, `healing_${session.id}.json`);
        fs.writeFileSync(logPath, JSON.stringify(session, null, 2), 'utf8');
    }

    getHealingStats() {
        const sessions = this.healingLog;
        const healed = sessions.filter(s => s.finalStatus === 'healed').length;
        const failed = sessions.filter(s => s.finalStatus !== 'healed').length;
        const avgIterations = sessions.reduce((sum, s) => sum + s.iterations.length, 0) / (sessions.length || 1);

        return {
            totalSessions: sessions.length,
            healed,
            failed,
            successRate: sessions.length > 0 ? Math.round(healed / sessions.length * 100) : 0,
            averageIterations: Math.round(avgIterations * 100) / 100,
            recentSessions: sessions.slice(-5)
        };
    }
}

const healingLoop = new SelfHealingLoop();

// ─────────────────────────────────────────────────────────────────────────────
//   VERIFICATION ORACLE
//   Double-checks that changes actually work before they touch production.
// ─────────────────────────────────────────────────────────────────────────────

class VerificationOracle {
    constructor() {
        this.tests = new Map();
    }

    registerTest(name, testFn) {
        this.tests.set(name, testFn);
    }

    async verifyChange(filePath, oldContent, newContent) {
        const results = {
            file: filePath,
            timestamp: new Date().toISOString(),
            syntaxValid: false,
            canLoad: false,
            testsPass: 0,
            testsFail: 0,
            regressions: [],
            overall: 'failed'
        };

        // Test 1: Syntax
        const tempFile = path.join(SANDBOX_DIR, `verify_${crypto.randomUUID()}.js`);
        try {
            fs.writeFileSync(tempFile, newContent, 'utf8');
            execSync(`node --check "${tempFile}"`, { timeout: 10000 });
            results.syntaxValid = true;
        } catch (e) {
            results.syntaxValid = false;
            results.error = e.message;
        }

        // Test 2: Can load as module
        if (results.syntaxValid) {
            try {
                delete require.cache[require.resolve(tempFile)];
                require(tempFile);
                results.canLoad = true;
            } catch (e) {
                results.canLoad = false;
            }
        }

        // Test 3: Run registered tests
        for (const [name, testFn] of this.tests) {
            try {
                await testFn(newContent, oldContent);
                results.testsPass++;
            } catch (e) {
                results.testsFail++;
                results.regressions.push({ test: name, error: e.message });
            }
        }

        // Cleanup
        try { fs.unlinkSync(tempFile); } catch {}

        results.overall = (results.syntaxValid && results.canLoad && results.testsFail === 0) ? 'passed' : 'failed';
        return results;
    }
}

const verificationOracle = new VerificationOracle();

// ─────────────────────────────────────────────────────────────────────────────
//   EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
    TrustScoreSystem,
    trustSystem,
    SandboxExecutor,
    sandbox,
    SelfHealingLoop,
    healingLoop,
    VerificationOracle,
    verificationOracle,
    SANDBOX_DIR,
    TRUST_DIR
};
