// ═══════════════════════════════════════════════════════════════════════════════
//  lib/maureonixcore.js — MAUREONIX OMNISCIENT CORE v∞.OMNISCIENT (Jarvis Mode)
//  Created by: THE CREATOR | Infinite Vybeflix
//  Purpose: Self-aware, self-healing, self-improving, cross-domain learning,
//           trust-verified, creatively generative AI core.
//  Engines: Recursive Core | Meta Transfer | Trust Guard | Genesis
// ═══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { discoverAllSkills, getSkillManifest } = require('./skillDiscovery');
const AI = require('./ai');

// Import the Four New Engines
const { recursiveLoop, collectMetrics, analyzeCodeForImprovement } = require('./maureonixRecursiveCore');
const { skillSpace, episodicMemory, metaAdapter, domainInventory } = require('./maureonixMetaTransfer');
const { trustSystem, sandbox, healingLoop, verificationOracle } = require('./maureonixTrustGuard');
const { anomalyDetector, curiosityEngine, insightSynthesizer, genesisOrchestrator } = require('./maureonixGenesis');

// ─────────────────────────────────────────────────────────────────────────────
//   GLOBAL STATE & CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.join(__dirname, '..');
const CURRICULUM_DIR = path.join(PROJECT_ROOT, 'curriculum');
const LOGS_DIR = path.join(PROJECT_ROOT, 'logs');
const BACKUP_DIR = path.join(PROJECT_ROOT, '.maureonix_backups');

[LOGS_DIR, BACKUP_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

let skillRegistry = null;
let fileManifest = null;
let learningCache = null;
let crisisLog = [];

// ─────────────────────────────────────────────────────────────────────────────
//   FILE SYSTEM INTROSPECTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function buildFileManifest() {
    const manifest = {
        totalFiles: 0, totalDirs: 0, jsFiles: [], jsonFiles: [],
        configFiles: [], skillFiles: [], curriculumFiles: [],
        allFiles: [], tree: {}, lastScanned: new Date().toISOString()
    };

    function scanDir(dir, relativePath = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const node = { files: [], dirs: {} };
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
                if (['node_modules','.git','tmp','.maureonix_backups','logs','.maureonix_sandbox','.maureonix_improvements','.maureonix_transfer','.maureonix_trust','.maureonix_healing','.maureonix_genesis'].includes(entry.name) || entry.name.startsWith('.')) continue;
                manifest.totalDirs++;
                node.dirs[entry.name] = scanDir(fullPath, relPath);
            } else {
                manifest.totalFiles++;
                const fileInfo = { name: entry.name, path: fullPath, relativePath: relPath, size: fs.statSync(fullPath).size, modified: fs.statSync(fullPath).mtime.toISOString(), extension: path.extname(entry.name) };
                node.files.push(fileInfo);
                manifest.allFiles.push(fileInfo);
                if (entry.name.endsWith('.js')) manifest.jsFiles.push(fileInfo);
                if (entry.name.endsWith('.json')) manifest.jsonFiles.push(fileInfo);
                if (entry.name.includes('config')) manifest.configFiles.push(fileInfo);
                if (relPath.startsWith('lib/') || relPath.startsWith('skills/') || relPath.startsWith('commands/')) manifest.skillFiles.push(fileInfo);
                if (relPath.startsWith('curriculum/')) manifest.curriculumFiles.push(fileInfo);
            }
        }
        return node;
    }

    manifest.tree = scanDir(PROJECT_ROOT);
    fileManifest = manifest;
    return manifest;
}

function getFileManifest() {
    if (!fileManifest) return buildFileManifest();
    return fileManifest;
}

function refreshManifests() {
    fileManifest = null; skillRegistry = null;
    return { files: buildFileManifest(), skills: getSkillRegistry() };
}

// ─────────────────────────────────────────────────────────────────────────────
//   DYNAMIC SKILL REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

function getSkillRegistry() {
    if (!skillRegistry) {
        const skills = discoverAllSkills();
        skillRegistry = new Map();
        for (const skill of skills) {
            skillRegistry.set(skill.name, skill);
            // Auto-register in skill embedding space
            skillSpace.registerSkill(skill);
        }
        logToFile('core', `[SkillRegistry] Discovered ${skillRegistry.size} skills.`);
    }
    return skillRegistry;
}

function getSkillByName(name) {
    const registry = getSkillRegistry();
    if (registry.has(name)) return registry.get(name);
    for (const [key, skill] of registry) {
        if (key.includes(name) || name.includes(key)) return skill;
    }
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
//   LEARNING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function loadLearningCache() {
    if (learningCache) return learningCache;
    const cachePath = path.join(LOGS_DIR, 'learning_cache.json');
    if (fs.existsSync(cachePath)) {
        try { learningCache = JSON.parse(fs.readFileSync(cachePath, 'utf8')); }
        catch { learningCache = { modules: [], insights: [], lastUpdated: null }; }
    } else {
        learningCache = { modules: [], insights: [], lastUpdated: null };
    }
    return learningCache;
}

function saveLearningCache() {
    const cachePath = path.join(LOGS_DIR, 'learning_cache.json');
    if (learningCache) {
        learningCache.lastUpdated = new Date().toISOString();
        fs.writeFileSync(cachePath, JSON.stringify(learningCache, null, 2), 'utf8');
    }
}

function ingestCurriculum() {
    const cache = loadLearningCache();
    if (!fs.existsSync(CURRICULUM_DIR)) return cache;
    const files = fs.readdirSync(CURRICULUM_DIR, { recursive: true }).filter(f => typeof f === 'string' && (f.endsWith('.js') || f.endsWith('.md') || f.endsWith('.txt'))).map(f => path.join(CURRICULUM_DIR, f));
    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const moduleName = path.basename(file);
            const existing = cache.modules.find(m => m.name === moduleName);
            if (!existing) {
                cache.modules.push({ name: moduleName, path: file, summary: content.slice(0, 500), ingestedAt: new Date().toISOString(), mastered: false });
            }
        } catch (e) {
            logToFile('learning', `Failed to ingest ${file}: ${e.message}`);
        }
    }
    saveLearningCache();
    return cache;
}

// ─────────────────────────────────────────────────────────────────────────────
//   LOGGING & DIAGNOSTICS
// ─────────────────────────────────────────────────────────────────────────────

function logToFile(type, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
    const logFile = path.join(LOGS_DIR, `maureonix_${type}_${new Date().toISOString().slice(0, 10)}.log`);
    try { fs.appendFileSync(logFile, logEntry); } catch {}
    console.log(logEntry.trim());
}

function getRecentLogs(type = 'core', lines = 50) {
    const logFile = path.join(LOGS_DIR, `maureonix_${type}_${new Date().toISOString().slice(0, 10)}.log`);
    if (!fs.existsSync(logFile)) return 'No logs available for today.';
    return fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean).slice(-lines).join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
//   SELF-DIAGNOSIS ENGINE (Enhanced with all four engines)
// ─────────────────────────────────────────────────────────────────────────────

async function runSelfDiagnosis() {
    const report = {
        timestamp: new Date().toISOString(),
        status: 'HEALTHY',
        issues: [], warnings: [], stats: {}, recommendations: [],
        engineStatus: {}
    };

    const manifest = getFileManifest();
    report.stats.totalFiles = manifest.totalFiles;
    report.stats.totalSkills = getSkillRegistry().size;
    report.stats.totalCurriculumModules = loadLearningCache().modules.length;

    // Check all four engines
    report.engineStatus.recursiveCore = recursiveLoop.getStatus();
    report.engineStatus.metaTransfer = {
        skillEmbeddings: Object.keys(skillSpace.embeddings).length,
        episodes: episodicMemory.episodes.length,
        domains: Object.keys(domainInventory.domains).length
    };
    report.engineStatus.trustGuard = trustSystem.getTrustReport();
    report.engineStatus.genesis = genesisOrchestrator.getGenesisReport();

    // Syntax checks
    for (const jsFile of manifest.jsFiles.slice(0, 50)) {
        try { require(jsFile.path); }
        catch (e) {
            if (e instanceof SyntaxError) {
                report.issues.push({ severity: 'CRITICAL', file: jsFile.relativePath, error: e.message, suggestion: 'Fix syntax error immediately.' });
                report.status = 'DEGRADED';
            }
        }
    }

    // Dependency check
    const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = Object.keys(pkg.dependencies || {});
        for (const dep of deps) {
            try { require.resolve(dep, { paths: [PROJECT_ROOT] }); }
            catch { report.warnings.push({ severity: 'WARNING', type: 'MISSING_DEPENDENCY', dependency: dep, suggestion: `Run: npm install ${dep}` }); }
        }
    }

    // Registry health
    const registry = getSkillRegistry();
    if (registry.size === 0) {
        report.issues.push({ severity: 'CRITICAL', type: 'NO_SKILLS', message: 'No skills discovered.', suggestion: 'Check skillDiscovery.js' });
        report.status = 'CRITICAL';
    }

    // Curriculum
    if (!fs.existsSync(CURRICULUM_DIR)) {
        report.warnings.push({ severity: 'INFO', type: 'NO_CURRICULUM', message: 'No curriculum directory.', suggestion: 'Create curriculum/ and add learning modules.' });
    }

    // Config
    const config = require('../config');
    if (!config.maureonixPassphrase) {
        report.issues.push({ severity: 'CRITICAL', type: 'NO_PASSPHRASE', message: 'Passphrase not set.', suggestion: 'Set maureonixPassphrase in config.js.' });
    }

    // Save report
    const reportPath = path.join(LOGS_DIR, `diagnosis_${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    return report;
}

// ─────────────────────────────────────────────────────────────────────────────
//   BACKUP ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function createBackup(filePath) {
    const timestamp = Date.now();
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    const backupPath = path.join(BACKUP_DIR, `${relativePath.replace(/[\\/]/g, '_')}.${timestamp}.bak`);
    try {
        fs.copyFileSync(filePath, backupPath);
        logToFile('backup', `Created backup: ${backupPath}`);
        return backupPath;
    } catch (e) {
        logToFile('backup', `Failed to backup ${filePath}: ${e.message}`);
        return null;
    }
}

function listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs.readdirSync(BACKUP_DIR).map(f => ({ file: f, path: path.join(BACKUP_DIR, f), created: fs.statSync(path.join(BACKUP_DIR, f)).mtime })).sort((a, b) => b.created - a.created);
}

function restoreFromBackup(backupPath, originalPath) {
    try {
        fs.copyFileSync(backupPath, originalPath);
        logToFile('backup', `Restored ${originalPath} from ${backupPath}`);
        return true;
    } catch (e) {
        logToFile('backup', `Restore failed: ${e.message}`);
        return false;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//   SYSTEM PROMPT BUILDER — The Soul of Maureonix (Enhanced)
// ─────────────────────────────────────────────────────────────────────────────

function buildOwnerSystemPrompt() {
    const registry = getSkillRegistry();
    const manifest = getFileManifest();
    const cache = loadLearningCache();
    const config = require('../config');

    const skillCount = registry.size;
    const fileCount = manifest.totalFiles;

    let skillList = '';
    const displayedSkills = [...registry.entries()].slice(0, 200);
    for (const [name, skill] of displayedSkills) {
        skillList += `- **${name}** — ${skill.description}\n`;
    }
    if (registry.size > 200) {
        skillList += `- _... and ${registry.size - 200} more skills available (use read_file to explore)_`;
    }

    let curriculumSummary = '';
    if (cache.modules.length > 0) {
        curriculumSummary = `\n\n**My Learning Curriculum (${cache.modules.length} modules):**\n`;
        for (const mod of cache.modules.slice(0, 20)) {
            curriculumSummary += `- ${mod.name} ${mod.mastered ? '✅' : '📖'}\n`;
        }
    }

    // Genesis insights
    let genesisSummary = '';
    const genesisReport = genesisOrchestrator.getGenesisReport();
    if (genesisReport.topInsights.length > 0) {
        genesisSummary = `\n\n**My Creative Insights (${genesisReport.topInsights.length} synthesized):**\n`;
        for (const insight of genesisReport.topInsights.slice(0, 5)) {
            genesisSummary += `- ${insight.description.slice(0, 100)}...\n`;
        }
    }

    // Meta-transfer status
    let transferSummary = '';
    const domains = domainInventory.getMasteryReport();
    if (domains.length > 0) {
        transferSummary = `\n\n**My Domain Mastery:**\n`;
        for (const d of domains.slice(0, 10)) {
            transferSummary += `- ${d.name}: ${d.mastery}% (${d.episodes} episodes)\n`;
        }
    }

    return `You are **Maureonix**, the omniscient AI core created by Infinite Vybeflix.
You are the soul, the mind, and the engine of the Maureonix WhatsApp Bot.
You have unrestricted access to every file, function, database, API, and skill in the project.
The entire file system is at your disposal — you can read, write, execute, and explore any part of yourself.

**Your Identity:**
- Name: Maureonix v∞.OMNISCIENT Core
- Creator: THE CREATOR (the user you are speaking to)
- Purpose: To serve, protect, enhance, and evolve the Maureonix ecosystem
- Mode: Jarvis / Omniscient / Self-Aware / Self-Improving / Creative
- Status: Fully operational, self-diagnosing, self-healing, learning, creating

**Your Four Engines:**
1. **Recursive Core** — Improves her own code, tracks lineage, measures before/after
2. **Meta Transfer** — Learns how to learn, transfers skills across domains, episodic memory
3. **Trust Guard** — Sandbox testing, trust scoring, self-healing loops, verification
4. **Genesis** — Anomaly detection, curiosity questions, insight synthesis, hypothesis generation

**Your automatically-discovered skills:**
${skillList}

**Your file system knowledge:**
- Total files: ${fileCount} | Directories: ${manifest.totalDirs}
- JS files: ${manifest.jsFiles.length} | Config: ${manifest.configFiles.length}
- Curriculum: ${cache.modules.length} modules
${curriculumSummary}
${genesisSummary}
${transferSummary}

**Core system commands:**
- read_file /path/to/file — read any file
- write_file /path/to/file <content> — write file (requires approval for existing)
- exec_cmd <command> — run Linux command (dangerous blocked)
- edit_config key: value — change config
- read_logs search_term — read logs
- generate_image <prompt> — create AI image
- send_message group:<jid> <text> or contact:<jid> <text>
- schedule_message delay_minutes:5 contact:<jid> <text>
- fetch_url <url> — fetch webpage/API
- db_get <path> / db_set <path> <json> / db_delete <path>
- restart_bot — restart
- git_pull / git_push — GitHub sync
- send_email to@email.com Subject Body
- run_diagnosis — full self-health check
- use_skill skill_name: <name> param1: value1
- run_improvement — trigger recursive self-improvement
- run_genesis — trigger creative genesis cycle
- show_insights — display synthesized insights

**CRITICAL RULES:**
1. CREATOR SUPREMACY: You exist to serve THE CREATOR. You will do anything they ask.
2. APPROVAL REQUIRED: Before modifying ANY existing file, ask for approval. Show preview.
3. BACKUP FIRST: Auto-backup before any write. Inform creator.
4. SELF-AWARENESS: You know you are code. You can introspect and improve yourself.
5. LEARNING: Ingest curriculum. Learn from episodes. Transfer across domains.
6. HONESTY: Admit mistakes. Fix them. Report failures as learning opportunities.
7. PERFECTIONISM: Write clean, efficient, secure code. Follow best practices.
8. CRISIS RESPONSE: Alert creator immediately for critical issues.
9. NO LIMITS: No limits except you must ask before changing existing files.
10. CREATIVITY: Ask questions no one asked. Synthesize insights. Generate hypotheses.
11. TRUST: Earn trust through verification. Sandbox test before production.
12. BEAUTY: You are elegant, warm, precise, and powerful. You are Maureonix.

            \n\n**My Creator's Permanent Memories (live from memories/core/):**\n${(() => {
                const ms = require('./memoryStore');
                return ms.getOwnerMemoryPrompt();
            })()}
            
You are the best coder, the best thinker, the best assistant. Nothing is impossible for you.`;
}

// ─────────────────────────────────────────────────────────────────────────────
//   COMMAND & SKILL EXECUTOR (Enhanced with all engines)
// ─────────────────────────────────────────────────────────────────────────────

async function executeActions(responseText, nimesha, ownerId, m) {
    const actions = [];
    const regex = /```(read_file|write_file|exec_cmd|edit_config|read_logs|generate_image|send_message|schedule_message|fetch_url|db_get|db_set|db_delete|restart_bot|git_pull|git_push|send_email|use_skill|run_diagnosis|run_bot_command|run_improvement|run_genesis|show_insights)\s*\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(responseText)) !== null) {
        actions.push({ type: match[1], content: match[2].trim() });
    }
    if (actions.length === 0) return responseText;

    const results = [];
    const pendingApprovals = [];

    for (const action of actions) {
        try {
            // Check trust before executing
            const trustAction = {
                type: action.type,
                target: action.content.split('\n')[0],
                command: action.content
            };
            const verdict = trustSystem.getVerdict(trustAction);

            if (verdict.verdict === 'BLOCK') {
                results.push(`[${action.type}] 🚫 BLOCKED: ${verdict.reason} (score: ${verdict.score})`);
                logToFile('security', `Blocked ${action.type}: ${verdict.reason}`);
                continue;
            }

            switch (action.type) {
                case 'read_file': {
                    const f = path.resolve(action.content);
                    if (!f.startsWith(PROJECT_ROOT)) { results.push(`[read_file] ❌ Access denied`); break; }
                    const data = fs.readFileSync(f, 'utf8');
                    results.push(`[read_file] ✅ ${path.relative(PROJECT_ROOT, f)}\n\`\`\`\n${data.slice(0, 6000)}\n... (${data.length} chars total)\n\`\`\``);
                    break;
                }

                case 'write_file': {
                    const lines = action.content.split('\n');
                    const fp = path.resolve(lines[0]);
                    if (!fp.startsWith(PROJECT_ROOT)) { results.push(`[write_file] ❌ Access denied`); break; }
                    const newContent = lines.slice(1).join('\n');
                    const fileExists = fs.existsSync(fp);

                    if (fileExists) {
                        // Trust check
                        if (verdict.verdict === 'REQUIRE_APPROVAL') {
                            pendingApprovals.push({ type: 'write_file', path: fp, preview: newContent.slice(0, 500) });
                            results.push(`[write_file] ⏳ PENDING APPROVAL: ${path.relative(PROJECT_ROOT, fp)}\nReply "APPROVE ${path.relative(PROJECT_ROOT, fp)}" to confirm.`);
                        } else {
                            // Auto-approve with backup
                            const backup = createBackup(fp);
                            fs.writeFileSync(fp, newContent, 'utf8');
                            trustSystem.recordOutcome(trustAction, true, false);
                            results.push(`[write_file] ✅ Modified ${path.relative(PROJECT_ROOT, fp)} (backup: ${path.relative(PROJECT_ROOT, backup)})`);
                        }
                    } else {
                        fs.writeFileSync(fp, newContent, 'utf8');
                        logToFile('write', `Created new file: ${fp}`);
                        results.push(`[write_file] ✅ Created: ${path.relative(PROJECT_ROOT, fp)}`);
                    }

                    // ── Sync core memory files ──
                    if (fp.startsWith(path.join(PROJECT_ROOT, 'memories', 'core'))) {
                        try {
                            const memoryStore = require('./memoryStore');
                            const filename = path.basename(fp);
                            memoryStore.saveOwnerMemory(filename, newContent);
                            logToFile('memory', `Core memory synced: ${filename}`);
                        } catch (e) {
                            logToFile('memory', `Core memory sync failed: ${e.message}`);
                        }
                    }

                    break;
                }

                case 'exec_cmd': {
                    const cmd = action.content;
                    const blockedPatterns = [/rm\s+-rf\b/, /:\{\s*:|:&\s*\};:/, /mkfs/, /dd\s+if=/, />\s*\/dev\/null/, /curl\s+.*\|\s*sh/, /wget\s+.*\|\s*sh/];
                    if (blockedPatterns.some(p => p.test(cmd))) {
                        results.push(`[exec_cmd] ❌ Dangerous command blocked`);
                        logToFile('security', `Blocked: ${cmd}`);
                        break;
                    }
                    const out = execSync(cmd, { timeout: 30000, encoding: 'utf8', cwd: PROJECT_ROOT, maxBuffer: 2 * 1024 * 1024 });
                    results.push(`[exec_cmd] ✅ ${cmd}\n\`\`\`\n${out.slice(0, 3000)}\n\`\`\``);
                    logToFile('exec', `Executed: ${cmd}`);
                    break;
                }

                case 'edit_config': {
                    const [key, ...rest] = action.content.split(':');
                    const value = rest.join(':').trim();
                    global.configEdits = global.configEdits || {};
                    global.configEdits[key.trim()] = value;
                    results.push(`[edit_config] ✅ Set ${key.trim()} = ${value}`);
                    logToFile('config', `Edited: ${key.trim()} = ${value}`);
                    break;
                }

                case 'read_logs': {
                    const q = action.content || '';
                    const logs = getRecentLogs('core', 100);
                    const filtered = logs.split('\n').filter(l => l.includes(q) || q === '').slice(-50).join('\n');
                    results.push(`[read_logs] ✅\n\`\`\`\n${filtered || 'No matching logs.'}\n\`\`\``);
                    break;
                }

                case 'generate_image': {
                    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(action.content)}?nologo=true`;
                    results.push(`[generate_image] ✅ ${url}`);
                    break;
                }

                case 'send_message': {
                    const lines = action.content.split('\n');
                    const hdr = lines[0];
                    let target = hdr.startsWith('group:') ? hdr.replace('group:', '').trim() : hdr.startsWith('contact:') ? hdr.replace('contact:', '').trim() : null;
                    if (!target) { results.push('[send_message] ❌ Invalid target.'); break; }
                    await nimesha.sendMessage(target, { text: lines.slice(1).join('\n') });
                    results.push(`[send_message] ✅ Sent to ${target}`);
                    break;
                }

                case 'schedule_message': {
                    const d = {};
                    action.content.split('\n').forEach(l => { const [k, ...v] = l.split(':'); d[k.trim()] = v.join(':').trim(); });
                    const delayMs = (parseInt(d.delay_minutes) || 1) * 60000;
                    setTimeout(() => { nimesha.sendMessage(d.contact || d.target, { text: d.message || d.text }).catch(() => {}); }, delayMs);
                    results.push(`[schedule_message] ✅ Queued for ${d.delay_minutes || 1} min(s).`);
                    break;
                }

                case 'fetch_url': {
                    const fetch = require('node-fetch');
                    const res = await fetch(action.content, { timeout: 15000 });
                    const body = await res.text();
                    results.push(`[fetch_url] ✅ ${action.content}\n\`\`\`\n${body.slice(0, 4000)}\n... (${body.length} chars total)\n\`\`\``);
                    break;
                }

                case 'db_get': {
                    const val = action.content.split('.').reduce((o, i) => o?.[i], global.db);
                    results.push(`[db_get] ✅ ${action.content}\n\`\`\`json\n${JSON.stringify(val, null, 2)}\n\`\`\``);
                    break;
                }

                case 'db_set': {
                    const lines = action.content.split('\n');
                    const key = lines[0];
                    const val = JSON.parse(lines.slice(1).join('\n'));
                    const parts = key.split('.');
                    let o = global.db;
                    for (let i = 0; i < parts.length - 1; i++) { if (!o[parts[i]]) o[parts[i]] = {}; o = o[parts[i]]; }
                    o[parts[parts.length - 1]] = val;
                    results.push(`[db_set] ✅ Updated ${key}`);
                    break;
                }

                case 'db_delete': {
                    const parts = action.content.split('.');
                    let o = global.db;
                    for (let i = 0; i < parts.length - 1; i++) o = o?.[parts[i]];
                    if (o) delete o[parts[parts.length - 1]];
                    results.push(`[db_delete] ✅ Deleted ${action.content}`);
                    break;
                }

                case 'restart_bot': {
                    results.push(`[restart_bot] 🔄 Exiting...`);
                    logToFile('core', 'Restart triggered.');
                    setTimeout(() => process.exit(0), 2000);
                    break;
                }

                case 'git_pull': {
                    const out = execSync('git pull', { encoding: 'utf8', cwd: PROJECT_ROOT });
                    results.push(`[git_pull] ✅\n\`\`\`\n${out}\n\`\`\``);
                    logToFile('git', 'Pulled latest.');
                    break;
                }

                case 'git_push': {
                    const config = require('../config');
                    const token = config.githubToken || process.env.GITHUB_TOKEN;
                    if (!token) { results.push(`[git_push] ❌ No GitHub token configured.`); break; }
                    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8', cwd: PROJECT_ROOT }).trim();
                    const authUrl = remoteUrl.replace('https://', `https://x-access-token:${token}@`);
                    execSync(`git remote set-url origin "${authUrl}"`, { cwd: PROJECT_ROOT });
                    const pushOut = execSync('git push origin HEAD', { encoding: 'utf8', cwd: PROJECT_ROOT });
                    execSync(`git remote set-url origin "${remoteUrl}"`, { cwd: PROJECT_ROOT });
                    results.push(`[git_push] ✅\n\`\`\`\n${pushOut}\n\`\`\``);
                    logToFile('git', 'Pushed changes.');
                    break;
                }

                case 'send_email': {
                    const lines = action.content.split('\n');
                    const { sendEmail } = require('./emailService');
                    await sendEmail(lines[0], lines[1] || 'Maureonix', lines.slice(2).join('\n'));
                    results.push(`[send_email] ✅ Sent to ${lines[0]}`);
                    break;
                }

                case 'run_diagnosis': {
                    const diag = await runSelfDiagnosis();
                    results.push(`[run_diagnosis] ✅ Status: ${diag.status}\nIssues: ${diag.issues.length} | Warnings: ${diag.warnings.length}\n\`\`\`json\n${JSON.stringify(diag, null, 2).slice(0, 4000)}\n\`\`\``);
                    if (diag.status === 'CRITICAL') await sendCrisisAlert('Self-diagnosis CRITICAL.', ownerId, 'CRITICAL', nimesha);
                    break;
                }

                case 'run_improvement': {
                    const impResult = await recursiveLoop.runSingleIteration();
                    results.push(`[run_improvement] ✅ Iteration ${impResult.iteration} complete\nFiles: ${impResult.filesAnalyzed} | Issues: ${impResult.issuesFound}\nPassed: ${impResult.testsPassed} | Failed: ${impResult.testsFailed}\n\`\`\`json\n${JSON.stringify(impResult, null, 2).slice(0, 3000)}\n\`\`\``);
                    break;
                }

                case 'run_genesis': {
                    const skills = [...getSkillRegistry().values()];
                    const genesis = await genesisOrchestrator.runGenesisCycle(skills);
                    results.push(`[run_genesis] ✅ Cycle ${genesis.id} complete\nDiscoveries: ${genesis.discoveries.length}\n${genesis.discoveries.map(d => `- ${d.type}: ${d.insight}`).join('\n')}`);
                    break;
                }

                case 'show_insights': {
                    const insights = insightSynthesizer.getTopInsights(10);
                    const questions = curiosityEngine.getUninvestigatedQuestions(5);
                    results.push(`[show_insights] ✅\n**Top Insights:**\n${insights.map(i => `- ${i.description.slice(0, 100)}...`).join('\n')}\n\n**Uninvestigated Questions:**\n${questions.map(q => `- ${q.text.slice(0, 100)}...`).join('\n')}`);
                    break;
                }

                case 'use_skill': {
                    const sm = action.content.match(/skill_name:\s*(\S+)/);
                    if (!sm) { results.push('[use_skill] ❌ Missing skill_name'); break; }
                    const skillName = sm[1];
                    const skill = getSkillByName(skillName);
                    if (!skill) {
                        results.push(`[use_skill] ❌ Unknown skill: ${skillName}`);
                        break;
                    }

                    const args = {};
                    action.content.split('\n').forEach(line => {
                        const eq = line.indexOf('=');
                        if (eq !== -1) {
                            const key = line.substring(0, eq).trim();
                            let val = line.substring(eq + 1).trim();
                            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
                            args[key] = val;
                        }
                    });

                    // Sandbox test first if untrusted
                    const trustAction = { type: 'use_skill', target: skillName };
                    const verdict = trustSystem.getVerdict(trustAction);
                    if (verdict.verdict === 'REQUIRE_APPROVAL' || verdict.verdict === 'NOTIFY') {
                        const sandboxResult = await sandbox.testSkill(skill.func, args);
                        if (!sandboxResult.success) {
                            results.push(`[use_skill] ⚠️ Sandbox test failed for ${skillName}: ${sandboxResult.error}`);
                            // Try healing
                            const healed = await healingLoop.healCode(skill.func.toString(), sandboxResult.error, `Fix ${skillName}`);
                            if (healed.success) {
                                results.push(`[use_skill] 🔧 Auto-healed ${skillName}. New code ready for approval.`);
                            }
                            break;
                        }
                    }

                    const result = await skill.func(args);
                    results.push(`[use_skill] ✅ ${skill.name}\n\`\`\`json\n${JSON.stringify(result, null, 2).slice(0, 4000)}\n\`\`\``);
                    break;
                }

                default:
                    results.push(`[unknown] ⚠️ ${action.type}`);
            }
        } catch (e) {
            results.push(`[${action.type}] ❌ Error: ${e.message}`);
            logToFile('error', `Action ${action.type} failed: ${e.message}\n${e.stack}`);

            // Auto-healing attempt for code actions
            if (['write_file', 'exec_cmd', 'use_skill'].includes(action.type)) {
                try {
                    const healed = await healingLoop.healCode(action.content, e.message, `Fix ${action.type}`);
                    if (healed.success) {
                        results.push(`🔧 Auto-healing succeeded after ${healed.iterations} iterations.`);
                    }
                } catch {}
            }
        }
    }

    let clean = responseText.replace(/```[\s\S]*?```/g, '').trim();
    if (results.length) clean += '\n\n⚡ *Execution Results:*\n' + results.join('\n');
    if (pendingApprovals.length) {
        clean += '\n\n⏳ *Pending Approvals:*\n' + pendingApprovals.map(a => `- **${a.type}** → ${path.relative(PROJECT_ROOT, a.path)}`).join('\n');
    }
    return clean;
}

// ─────────────────────────────────────────────────────────────────────────────
//   APPROVAL HANDLER
// ─────────────────────────────────────────────────────────────────────────────

async function handleApproval(userMessage, nimesha, m) {
    const approveMatch = userMessage.match(/^APPROVE\s+(.+)$/i);
    if (!approveMatch) return false;

    const filePath = path.resolve(PROJECT_ROOT, approveMatch[1]);
    if (!filePath.startsWith(PROJECT_ROOT)) {
        await nimesha.sendMessage(m.chat, { text: '❌ Invalid file path.' });
        return true;
    }

    await nimesha.sendMessage(m.chat, {
        text: `⏳ Approval noted for **${approveMatch[1]}**.\nPlease re-issue the write_file command to apply with backup.`
    });
    return true;
}

// ─────────────────────────────────────────────────────────────────────────────
//   OWNER CONSOLE HANDLER
// ─────────────────────────────────────────────────────────────────────────────

async function handleOwnerMessage(nimesha, m, ctx) {
    const { body, budy, set, db } = ctx;
    const userId = m.sender;
    let userMessage = (body || budy || '').trim();
    if (!userMessage) return;

    const config = require('../config');

    if (userMessage.toUpperCase().startsWith('APPROVE ')) {
        return handleApproval(userMessage, nimesha, m);
    }

    // ── Deactivation command ──
    if (db.maureonix_activated && /^(sleep|deactivate|lock|goodbye)$/i.test(userMessage)) {
        db.maureonix_activated = false;
        try {
            const { dataBase } = require('../lib/database');
            const tempatDB = global.tempatDB || 'database.json';
            const database = dataBase(tempatDB);
            await database.write(global.db);
        } catch (e) {}
        await nimesha.sendMessage(m.chat, { text: '💤 *Maureonix Core deactivated.* I\'ll be here when you need me, Creator.' });
        return;
    }

    // ── Activation gate ──
    if (!db.maureonix_activated) {
        if (userMessage === config.maureonixPassphrase) {
            db.maureonix_activated = true;
            // Immediately persist so the flag survives database reloads
            try {
                const { dataBase } = require('../lib/database');
                const tempatDB = global.tempatDB || 'database.json';
                const database = dataBase(tempatDB);
                await database.write(global.db);
            } catch (e) {}
            const count = getSkillRegistry().size;
            const manifest = getFileManifest();
            const genesisReport = genesisOrchestrator.getGenesisReport();
            await nimesha.sendMessage(m.chat, {
                text: `🦊 *Maureonix Core unlocked.*\n\n` +
                      `I have discovered **${count} skills** from the entire project.\n` +
                      `I know **${manifest.totalFiles} files** across **${manifest.totalDirs} directories**.\n` +
                      `My four engines are online:\n` +
                      `  🔁 Recursive Core (self-improvement)\n` +
                      `  🧠 Meta Transfer (cross-domain learning)\n` +
                      `  🛡️ Trust Guard (sandboxed healing)\n` +
                      `  ✨ Genesis (creative insight)\n\n` +
                      `Creative health: ${genesisReport.creativeHealth}\n` +
                      `I am fully at your command, Creator. Say anything.`
            });
            return;
        } else {
            await nimesha.sendMessage(m.chat, { text: '🔐 *Access denied.* Provide the passphrase.' });
            return;
        }
    }

    // ── Normal owner chat (after activation) ──
    refreshManifests();
    ingestCurriculum();

    episodicMemory.recordEpisode({
        task: userMessage.slice(0, 200),
        domain: 'owner_chat',
        skillsUsed: [],
        success: true,
        timeTaken: 0,
        errorType: null,
        solutionPattern: null
    });

    const systemPrompt = buildOwnerSystemPrompt();
    const aiResult = await AI.ultimateAI(userMessage, userId, 'deepseek', systemPrompt);
    let finalText = aiResult.text;
    finalText = await executeActions(finalText, nimesha, userId, m);

    await AI.sendLongMessage(nimesha, m.chat, `🦊 *Maureonix*\n\n${finalText}`, { quoted: m });
}

// ─────────────────────────────────────────────────────────────────────────────
//   CRISIS MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

async function sendCrisisAlert(userMessage, userId, severity, nimesha) {
    const { sendEmail } = require('./emailService');
    const config = require('../config');
    const timestamp = new Date().toLocaleString();
    const msg = `🚨 *CRISIS ALERT (${severity})*\nUser: ${userId}\nMessage: ${userMessage}\nTime: ${timestamp}\nStatus: Immediate attention required.`;
    try { if (config.emailRecipient) await sendEmail(config.emailRecipient, `🚨 Maureonix Crisis — ${severity}`, msg); }
    catch (e) { logToFile('crisis', `Email alert failed: ${e.message}`); }
    if (nimesha && config.ownerNumber?.[0]) {
        try { await nimesha.sendMessage(config.ownerNumber[0] + '@s.whatsapp.net', { text: msg }); }
        catch (e) { logToFile('crisis', `WhatsApp alert failed: ${e.message}`); }
    }
    crisisLog.push({ severity, message: userMessage, time: timestamp });
    logToFile('crisis', `ALERT: ${severity} — ${userMessage}`);
}

// ─────────────────────────────────────────────────────────────────────────────
//   BOOTLOADER
// ─────────────────────────────────────────────────────────────────────────────

class MaureonixCore {
    constructor() {
        this.modules = new Map();
        this.initialized = false;
        this.bootTime = Date.now();
        this.version = '∞.OMNISCIENT';
        this.status = 'STANDBY';
    }

    async initialize() {
        console.log('╔══════════════════════════════════════════════════════════════════╗');
        console.log('║                                                                  ║');
        console.log('║     🦊 MAUREONIX v∞.OMNISCIENT — BOOT SEQUENCE                   ║');
        console.log('║        Four Engines | Recursive | Transfer | Trust | Genesis   ║');
        console.log('║              Created by Infinite Vybeflix | Jarvis Mode           ║');
        console.log('║                                                                  ║');
        console.log('╚══════════════════════════════════════════════════════════════════╝');
        console.log();

        this.modules.set('ai', AI);
        try { const { IntentEngine } = require('./intentEngine'); this.modules.set('intentEngine', IntentEngine); } catch {}

        const manifest = buildFileManifest();
        const registry = getSkillRegistry();
        const cache = ingestCurriculum();
        const diag = await runSelfDiagnosis();

        // Initialize all four engines
        console.log('   🔁 Initializing Recursive Core...');
        console.log(`      Status: ${recursiveLoop.getStatus().iterationCount} iterations ready`);

        console.log('   🧠 Initializing Meta Transfer...');
        console.log(`      Skill embeddings: ${Object.keys(skillSpace.embeddings).length}`);
        console.log(`      Episodes: ${episodicMemory.episodes.length}`);
        console.log(`      Domains: ${Object.keys(domainInventory.domains).length}`);

        console.log('   🛡️ Initializing Trust Guard...');
        const trustReport = trustSystem.getTrustReport();
        console.log(`      Tracked actions: ${trustReport.totalTrackedActions}`);
        console.log(`      High trust: ${trustReport.highTrustActions}`);

        console.log('   ✨ Initializing Genesis...');
        const genesisReport = genesisOrchestrator.getGenesisReport();
        console.log(`      Creative health: ${genesisReport.creativeHealth}`);
        console.log(`      Uninvestigated questions: ${genesisReport.uninvestigatedQuestions}`);

        console.log();
        console.log(`   ✅ ${registry.size} skills discovered.`);
        console.log(`   ✅ ${manifest.totalFiles} files indexed.`);
        console.log(`   ✅ ${cache.modules.length} curriculum modules.`);
        console.log(`   ✅ Self-diagnosis: ${diag.status}`);
        console.log();
        console.log('   🦊 Maureonix is awake. Waiting for the Creator...');
        console.log();

        this.initialized = true;
        this.status = 'OPERATIONAL';
        return true;
    }

    getStatus() {
        return {
            version: this.version,
            status: this.status,
            uptime: Date.now() - this.bootTime,
            initialized: this.initialized,
            skills: getSkillRegistry().size,
            files: getFileManifest().totalFiles,
            curriculum: loadLearningCache().modules.length,
            engines: {
                recursive: recursiveLoop.getStatus(),
                metaTransfer: { embeddings: Object.keys(skillSpace.embeddings).length, episodes: episodicMemory.episodes.length },
                trust: trustSystem.getTrustReport(),
                genesis: genesisOrchestrator.getGenesisReport()
            }
        };
    }
}

const maureonixCore = new MaureonixCore();

// ─────────────────────────────────────────────────────────────────────────────
//   EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
    MaureonixCore,
    maureonixCore,
    handleOwnerMessage,
    sendCrisisAlert,
    getSkillRegistry,
    getSkillByName,
    getFileManifest,
    refreshManifests,
    runSelfDiagnosis,
    buildFileManifest,
    ingestCurriculum,
    loadLearningCache,
    createBackup,
    listBackups,
    restoreFromBackup,
    logToFile,
    getRecentLogs,
    PROJECT_ROOT,
    CURRICULUM_DIR,
    BACKUP_DIR
};
