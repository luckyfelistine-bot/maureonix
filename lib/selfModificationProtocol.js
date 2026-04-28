// ═══════════════════════════════════════════════════════════════════════════
//   🦊 MAUREONIX SELF-MODIFICATION PROTOCOL v1.0 — "THE EVOLUTION ENGINE"
//   Auto-Generated Patches · Validation · Rollback · Safety Constraints
//   Created for Maureonix by Infinite Vybeflix
// ═══════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════════════════════
//   SAFETY CONSTRAINTS — Immutable boundaries
// ═══════════════════════════════════════════════════════════════════════════
const IMMUTABLE_FILES = [
    'config.js',
    '.env',
    'package.json',
    'package-lock.json',
];

const FORBIDDEN_PATTERNS = [
    /process\.exit\s*\(/i,
    /child_process/i,
    /eval\s*\(/i,
    /Function\s*\(/i,
    /require\s*\(\s*['"`]https?/i,
    /fs\.unlinkSync\s*\(\s*['"`]\//i,
    /fs\.rmdirSync\s*\(\s*['"`]\//i,
    /delete\s+require\.cache/i,
    /global\.owner\s*=\s*null/i,
    /global\.owner\s*=\s*\[\s*\]/i,
];

const ALLOWED_DIRECTORIES = [
    'lib',
    'commands',
    'plugins',
    'utils',
    'handlers',
];

// ═══════════════════════════════════════════════════════════════════════════
//   PATCH CLASS — Represents a single self-modification
// ═══════════════════════════════════════════════════════════════════════════
class Patch {
    constructor({
        id = crypto.randomUUID(),
        type,           // 'behavioral' | 'config' | 'optimization' | 'bugfix' | 'feature'
        target,         // file path relative to project root
        description,
        motivation,     // why this patch is needed
        code,           // the actual code change
        originalCode,   // what to replace (null for additions)
        author = 'Maureonix_Self',
        timestamp = Date.now(),
        priority = 'medium', // 'critical' | 'high' | 'medium' | 'low'
        validationTests = [], // array of test descriptions
    }) {
        this.id = id;
        this.type = type;
        this.target = target;
        this.description = description;
        this.motivation = motivation;
        this.code = code;
        this.originalCode = originalCode;
        this.author = author;
        this.timestamp = timestamp;
        this.priority = priority;
        this.validationTests = validationTests;
        this.status = 'pending'; // pending | validated | applied | failed | rolled_back
        this.validationResults = [];
        this.error = null;
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            target: this.target,
            description: this.description,
            motivation: this.motivation,
            code: this.code,
            originalCode: this.originalCode,
            author: this.author,
            timestamp: this.timestamp,
            priority: this.priority,
            validationTests: this.validationTests,
            status: this.status,
            validationResults: this.validationResults,
            error: this.error,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   PATCH VALIDATOR — Ensures patches are safe before application
// ═══════════════════════════════════════════════════════════════════════════
class PatchValidator {
    validate(patch) {
        const errors = [];
        const warnings = [];

        // 1. Check target file is not immutable
        const basename = path.basename(patch.target);
        if (IMMUTABLE_FILES.includes(basename)) {
            errors.push(`Target file "${basename}" is immutable`);
        }

        // 2. Check target is in allowed directory
        const dir = patch.target.split('/')[0];
        if (!ALLOWED_DIRECTORIES.includes(dir)) {
            errors.push(`Target directory "${dir}" is not in allowed list: ${ALLOWED_DIRECTORIES.join(', ')}`);
        }

        // 3. Check for forbidden patterns in code
        for (const pattern of FORBIDDEN_PATTERNS) {
            if (pattern.test(patch.code)) {
                errors.push(`Code contains forbidden pattern: ${pattern.toString()}`);
            }
        }

        // 4. Check code syntax (basic)
        try {
            new Function(patch.code);
        } catch (e) {
            errors.push(`Code syntax error: ${e.message}`);
        }

        // 5. Check file exists (for replacements)
        if (patch.originalCode) {
            const fullPath = path.join(process.cwd(), patch.target);
            if (!fs.existsSync(fullPath)) {
                errors.push(`Target file does not exist: ${patch.target}`);
            } else {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (!content.includes(patch.originalCode)) {
                    errors.push(`Original code not found in target file. The file may have changed.`);
                }
            }
        }

        // 6. Check patch size (prevent massive changes)
        if (patch.code.length > 10000) {
            warnings.push(`Patch is very large (${patch.code.length} chars). Consider breaking into smaller patches.`);
        }

        // 7. Check for obvious infinite loops
        if (/while\s*\(\s*true\s*\)/i.test(patch.code) && !/break|return/i.test(patch.code)) {
            errors.push('Potential infinite loop detected without break/return');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            score: Math.max(0, 100 - errors.length * 25 - warnings.length * 5),
        };
    }

    // Simulate the patch to check for runtime errors
    simulate(patch) {
        try {
            // Create a sandboxed environment
            const sandbox = {
                console: { log: () => {}, error: () => {}, warn: () => {} },
                require: (mod) => {
                    if (['fs', 'path', 'crypto', 'util'].includes(mod)) return require(mod);
                    throw new Error(`Module "${mod}" not allowed in simulation`);
                },
                module: { exports: {} },
                exports: {},
                global: {},
                process: { env: {}, cwd: () => '/tmp' },
            };

            const fn = new Function('console', 'require', 'module', 'exports', 'global', 'process', patch.code);
            fn(sandbox.console, sandbox.require, sandbox.module, sandbox.exports, sandbox.global, sandbox.process);

            return { success: true, error: null };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   PATCH MANAGER — Orchestrates patch lifecycle
// ═══════════════════════════════════════════════════════════════════════════
class PatchManager {
    constructor() {
        this.patches = new Map();
        this.validator = new PatchValidator();
        this.backupDir = path.join(process.cwd(), '.patch_backups');
        this.patchLogFile = path.join(process.cwd(), 'patch_history.json');

        // Ensure backup directory exists
        try { fs.mkdirSync(this.backupDir, { recursive: true }); } catch {}

        // Load existing patches
        this.loadHistory();
    }

    loadHistory() {
        try {
            if (fs.existsSync(this.patchLogFile)) {
                const data = JSON.parse(fs.readFileSync(this.patchLogFile, 'utf8'));
                for (const p of data.patches || []) {
                    this.patches.set(p.id, new Patch(p));
                }
            }
        } catch (e) {
            console.error('[PatchManager] Failed to load history:', e.message);
        }
    }

    saveHistory() {
        try {
            const data = {
                lastUpdated: Date.now(),
                patches: Array.from(this.patches.values()).map(p => p.toJSON()),
            };
            fs.writeFileSync(this.patchLogFile, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error('[PatchManager] Failed to save history:', e.message);
        }
    }

    createPatch(patchData) {
        const patch = new Patch(patchData);
        this.patches.set(patch.id, patch);
        this.saveHistory();
        return patch;
    }

    async validatePatch(patchId) {
        const patch = this.patches.get(patchId);
        if (!patch) return { success: false, error: 'Patch not found' };

        const validation = this.validator.validate(patch);

        if (validation.valid) {
            const simulation = this.validator.simulate(patch);
            validation.simulation = simulation;

            if (!simulation.success) {
                validation.valid = false;
                validation.errors.push(`Simulation failed: ${simulation.error}`);
            }
        }

        patch.validationResults = validation;
        patch.status = validation.valid ? 'validated' : 'failed';
        if (!validation.valid) patch.error = validation.errors.join('; ');

        this.saveHistory();
        return validation;
    }

    async applyPatch(patchId, approvedBy = 'system') {
        const patch = this.patches.get(patchId);
        if (!patch) return { success: false, error: 'Patch not found' };

        if (patch.status !== 'validated') {
            return { success: false, error: `Patch status is "${patch.status}", expected "validated"` };
        }

        const targetPath = path.join(process.cwd(), patch.target);

        try {
            // 1. Backup original file
            if (fs.existsSync(targetPath)) {
                const backupPath = path.join(this.backupDir, `${path.basename(patch.target)}.${patch.id}.backup`);
                fs.copyFileSync(targetPath, backupPath);
            }

            // 2. Read current content
            let content = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : '';

            // 3. Apply patch
            if (patch.originalCode) {
                // Replacement
                if (!content.includes(patch.originalCode)) {
                    throw new Error('Original code no longer exists in file');
                }
                content = content.replace(patch.originalCode, patch.code);
            } else {
                // Addition (append to end)
                content = content + '\n\n' + patch.code;
            }

            // 4. Write new content
            fs.writeFileSync(targetPath, content);

            // 5. Update patch status
            patch.status = 'applied';
            patch.appliedAt = Date.now();
            patch.approvedBy = approvedBy;
            this.saveHistory();

            return { success: true, patch };
        } catch (e) {
            patch.status = 'failed';
            patch.error = e.message;
            this.saveHistory();
            return { success: false, error: e.message };
        }
    }

    async rollbackPatch(patchId) {
        const patch = this.patches.get(patchId);
        if (!patch) return { success: false, error: 'Patch not found' };

        if (patch.status !== 'applied') {
            return { success: false, error: `Cannot rollback patch with status "${patch.status}"` };
        }

        const targetPath = path.join(process.cwd(), patch.target);
        const backupPath = path.join(this.backupDir, `${path.basename(patch.target)}.${patch.id}.backup`);

        try {
            if (fs.existsSync(backupPath)) {
                fs.copyFileSync(backupPath, targetPath);
                patch.status = 'rolled_back';
                patch.rolledBackAt = Date.now();
                this.saveHistory();
                return { success: true };
            } else {
                // Try to reconstruct from originalCode
                if (patch.originalCode) {
                    let content = fs.readFileSync(targetPath, 'utf8');
                    content = content.replace(patch.code, patch.originalCode);
                    fs.writeFileSync(targetPath, content);
                    patch.status = 'rolled_back';
                    patch.rolledBackAt = Date.now();
                    this.saveHistory();
                    return { success: true };
                }
                return { success: false, error: 'No backup found and cannot reconstruct' };
            }
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    getPatchHistory() {
        return Array.from(this.patches.values()).map(p => ({
            id: p.id,
            type: p.type,
            target: p.target,
            description: p.description,
            status: p.status,
            priority: p.priority,
            timestamp: p.timestamp,
            appliedAt: p.appliedAt,
            approvedBy: p.approvedBy,
        }));
    }

    getPendingPatches() {
        return Array.from(this.patches.values()).filter(p => p.status === 'pending');
    }

    getAppliedPatches() {
        return Array.from(this.patches.values()).filter(p => p.status === 'applied');
    }

    generatePatchFromInsight(insight, aiChatFn) {
        // Generate a patch based on a self-reflection insight
        const prompt = `You are Maureonix's Self-Modification System. Based on the following insight, generate a code patch.

INSIGHT: "${insight}"

Generate a patch object with these fields:
- type: "behavioral" | "optimization" | "bugfix" | "feature"
- target: which file to modify (e.g., "lib/ai.js", "commands/ai.js")
- description: what the patch does
- motivation: why it's needed
- originalCode: the exact code to replace (or null if adding new code)
- code: the new code
- priority: "critical" | "high" | "medium" | "low"
- validationTests: array of test descriptions

Output ONLY valid JSON.`;

        return aiChatFn(prompt, 'llama-3.3-70b-versatile', 'system', null, 0.2, 1500)
            .then(result => {
                const jsonMatch = result.text.match(/\{[\s\S]*?\}/);
                if (jsonMatch) {
                    const patchData = JSON.parse(jsonMatch[0]);
                    return this.createPatch(patchData);
                }
                throw new Error('Failed to parse patch JSON');
            });
    }
}

// Singleton instance
const patchManager = new PatchManager();

// ═══════════════════════════════════════════════════════════════════════════
//   EXPORTS
// ═══════════════════════════════════════════════════════════════════════════
module.exports = {
    Patch,
    PatchValidator,
    PatchManager,
    patchManager,
    IMMUTABLE_FILES,
    FORBIDDEN_PATTERNS,
    ALLOWED_DIRECTORIES,
};