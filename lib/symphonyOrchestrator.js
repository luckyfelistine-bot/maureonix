// ═══════════════════════════════════════════════════════════════════════════════
//  lib/symphonyOrchestrator.js — SYMPHONY × MAUREONIX UNIFIED ORCHESTRATOR
//  Version: v1.0.0-OMNISCIENT
//  Purpose: Full Symphony spec implementation fused with Maureonix's 4 engines
//  Route: Option A — Full integration with GitHub Issues, WhatsApp + Email alerts
//  Created by: THE CREATOR | Infinite Vybeflix
// ═══════════════════════════════════════════════════════════════════════════════

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const crypto = require('crypto');
const EventEmitter = require('events');
const cron = require('node-cron');

// ─────────────────────────────────────────────────────────────────────────────
//   EXTERNAL DEPENDENCIES (install these: npm install node-fetch liquidjs)
// ─────────────────────────────────────────────────────────────────────────────
let fetch;
try { fetch = require('node-fetch'); } catch { fetch = global.fetch; }
let Liquid;
try { Liquid = require('liquidjs'); } catch { Liquid = null; }

// ═══════════════════════════════════════════════════════════════════════════════
//   SECTION 1: CONFIGURATION & WORKFLOW LOADER (Symphony Spec §5, §6)
// ═══════════════════════════════════════════════════════════════════════════════

const PROJECT_ROOT = path.join(__dirname, '..');
const WORKFLOW_PATH = path.join(PROJECT_ROOT, 'WORKFLOW.md');
const SYMPHONY_DIR = path.join(PROJECT_ROOT, '.symphony');
const WORKSPACE_ROOT = path.join(SYMPHONY_DIR, 'workspaces');
const LOGS_DIR = path.join(PROJECT_ROOT, 'logs');
const STATE_DIR = path.join(SYMPHONY_DIR, 'state');

// Ensure directories exist
[SYMPHONY_DIR, WORKSPACE_ROOT, LOGS_DIR, STATE_DIR].forEach(d => {
    if (!fsSync.existsSync(d)) fsSync.mkdirSync(d, { recursive: true });
});

// Default configuration (Symphony §6.4 Cheat Sheet)
const DEFAULT_CONFIG = {
    tracker: {
        kind: 'github',
        endpoint: 'https://api.github.com',
        api_key: null,
        project_slug: null,
        active_states: ['open'],
        terminal_states: ['closed'],
    },
    polling: { interval_ms: 30000 },
    workspace: { root: WORKSPACE_ROOT },
    hooks: {
        after_create: null,
        before_run: null,
        after_run: null,
        before_remove: null,
        timeout_ms: 60000,
    },
    agent: {
        max_concurrent_agents: 3,
        max_turns: 20,
        max_retry_backoff_ms: 300000,
        max_concurrent_agents_by_state: {},
    },
    codex: {
        command: 'node lib/symphonyAgentRunner.js',
        turn_timeout_ms: 3600000,
        read_timeout_ms: 5000,
        stall_timeout_ms: 300000,
    },
    notifications: {
        whatsapp_enabled: true,
        email_enabled: true,
        alert_on_completion: true,
        alert_on_failure: true,
    },
    server: {
        port: null,
    },
};

class WorkflowLoader {
    constructor(filePath = WORKFLOW_PATH) {
        this.filePath = filePath;
        this.lastModified = 0;
        this.currentWorkflow = null;
        this.liquidEngine = Liquid ? new Liquid.Liquid({ strictVariables: true, strictFilters: true }) : null;
    }

    async load() {
        try {
            const stats = await fs.stat(this.filePath);
            if (stats.mtimeMs <= this.lastModified && this.currentWorkflow) {
                return this.currentWorkflow;
            }

            const content = await fs.readFile(this.filePath, 'utf8');
            const parsed = this.parse(content);
            this.lastModified = stats.mtimeMs;
            this.currentWorkflow = parsed;
            return parsed;
        } catch (e) {
            if (e.code === 'ENOENT') throw { code: 'missing_workflow_file', message: `WORKFLOW.md not found at ${this.filePath}` };
            throw { code: 'workflow_parse_error', message: e.message };
        }
    }

    parse(content) {
        let config = {};
        let promptTemplate = content.trim();

        if (content.startsWith('---')) {
            const endIndex = content.indexOf('---', 3);
            if (endIndex !== -1) {
                const frontMatter = content.slice(3, endIndex).trim();
                promptTemplate = content.slice(endIndex + 3).trim();
                try {
                    config = this.parseYAML(frontMatter);
                    if (typeof config !== 'object' || Array.isArray(config)) {
                        throw { code: 'workflow_front_matter_not_a_map', message: 'Front matter must be a YAML map/object' };
                    }
                } catch (e) {
                    if (e.code) throw e;
                    throw { code: 'workflow_parse_error', message: `Invalid YAML front matter: ${e.message}` };
                }
            }
        }

        return { config, promptTemplate };
    }

    parseYAML(str) {
        // Simple YAML parser for front matter (sufficient for Symphony config)
        const result = {};
        const lines = str.split('
');
        let current = result;
        const stack = [{ obj: result, indent: -1 }];

        for (let line of lines) {
            if (!line.trim() || line.trim().startsWith('#')) continue;
            const indent = line.length - line.trimStart().length;

            // Pop stack to correct level
            while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
                stack.pop();
            }
            current = stack[stack.length - 1].obj;

            if (line.includes(':')) {
                const [key, ...valParts] = line.split(':');
                const keyTrim = key.trim();
                const valTrim = valParts.join(':').trim();

                if (!valTrim) {
                    // Nested object
                    current[keyTrim] = {};
                    stack.push({ obj: current[keyTrim], indent });
                } else if (valTrim.startsWith('[') && valTrim.endsWith(']')) {
                    current[keyTrim] = valTrim.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
                } else if (valTrim.startsWith("'") && valTrim.endsWith("'")) {
                    current[keyTrim] = valTrim.slice(1, -1);
                } else if (valTrim.startsWith('"') && valTrim.endsWith('"')) {
                    current[keyTrim] = valTrim.slice(1, -1);
                } else if (!isNaN(valTrim)) {
                    current[keyTrim] = Number(valTrim);
                } else if (valTrim === 'true') {
                    current[keyTrim] = true;
                } else if (valTrim === 'false') {
                    current[keyTrim] = false;
                } else if (valTrim === 'null') {
                    current[keyTrim] = null;
                } else {
                    current[keyTrim] = valTrim;
                }
            }
        }
        return result;
    }

    async renderPrompt(issue, attempt = null) {
        const workflow = await this.load();
        if (!this.liquidEngine) {
            // Fallback: simple mustache-style replacement
            let template = workflow.promptTemplate || 'You are working on issue {{issue.identifier}}: {{issue.title}}';
            template = template.replace(/\{\{\s*issue\.identifier\s*\}\}/g, issue.identifier);
            template = template.replace(/\{\{\s*issue\.title\s*\}\}/g, issue.title);
            template = template.replace(/\{\{\s*issue\.description\s*\}\}/g, issue.description || '');
            template = template.replace(/\{\{\s*issue\.state\s*\}\}/g, issue.state);
            template = template.replace(/\{\{\s*attempt\s*\}\}/g, attempt !== null ? String(attempt) : '');
            return template;
        }
        return await this.liquidEngine.parseAndRender(workflow.promptTemplate, { issue, attempt });
    }
}

class ConfigResolver {
    constructor(workflowLoader) {
        this.loader = workflowLoader;
        this.effectiveConfig = null;
    }

    async resolve() {
        const workflow = await this.loader.load();
        const raw = workflow.config;
        const resolved = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

        // Deep merge with defaults
        this.deepMerge(resolved, raw);

        // Resolve $VAR indirection
        this.resolveEnvVars(resolved);

        // Path expansion
        if (resolved.workspace.root) {
            resolved.workspace.root = this.expandPath(resolved.workspace.root);
        }

        this.effectiveConfig = resolved;
        return resolved;
    }

    deepMerge(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                this.deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }

    resolveEnvVars(obj) {
        for (const key in obj) {
            if (typeof obj[key] === 'string' && obj[key].startsWith('$')) {
                const varName = obj[key].slice(1);
                obj[key] = process.env[varName] || '';
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.resolveEnvVars(obj[key]);
            }
        }
    }

    expandPath(p) {
        if (p.startsWith('~')) return path.join(process.env.HOME || process.env.USERPROFILE, p.slice(1));
        if (!path.isAbsolute(p)) return path.resolve(PROJECT_ROOT, p);
        return p;
    }

    async validate() {
        const config = await this.resolve();
        const errors = [];

        if (!config.tracker.kind) errors.push('tracker.kind is required');
        if (!config.tracker.api_key) errors.push('tracker.api_key is required (set GITHUB_TOKEN env var or in WORKFLOW.md)');
        if (!config.tracker.project_slug) errors.push('tracker.project_slug is required (format: owner/repo)');
        if (!config.codex.command) errors.push('codex.command is required');

        return { valid: errors.length === 0, errors, config };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   SECTION 2: GITHUB ISSUE TRACKER CLIENT (Symphony §11 adapted for GitHub)
// ═══════════════════════════════════════════════════════════════════════════════

class GitHubTrackerClient {
    constructor(config) {
        this.config = config;
        this.baseUrl = config.tracker.endpoint || 'https://api.github.com';
        this.token = config.tracker.api_key;
        this.projectSlug = config.tracker.project_slug;
        this.activeStates = config.tracker.active_states || ['open'];
        this.terminalStates = config.tracker.terminal_states || ['closed'];
    }

    async fetchCandidateIssues() {
        const [owner, repo] = this.projectSlug.split('/');
        if (!owner || !repo) throw { code: 'missing_tracker_project_slug', message: 'project_slug must be owner/repo format' };

        const url = `${this.baseUrl}/repos/${owner}/${repo}/issues?state=open&per_page=50`;
        return this.fetchIssues(url);
    }

    async fetchIssuesByStates(states) {
        if (!states || states.length === 0) return [];
        const [owner, repo] = this.projectSlug.split('/');
        const url = `${this.baseUrl}/repos/${owner}/${repo}/issues?state=all&per_page=100`;
        const all = await this.fetchIssues(url);
        return all.filter(i => states.includes(i.state.toLowerCase()));
    }

    async fetchIssueStatesByIds(issueIds) {
        if (!issueIds || issueIds.length === 0) return [];
        const [owner, repo] = this.projectSlug.split('/');
        const results = [];
        for (const id of issueIds) {
            try {
                const url = `${this.baseUrl}/repos/${owner}/${repo}/issues/${id}`;
                const res = await this.apiRequest(url);
                results.push(this.normalizeIssue(res));
            } catch (e) {
                // Issue might not exist anymore
            }
        }
        return results;
    }

    async fetchIssues(url) {
        const res = await this.apiRequest(url);
        if (!Array.isArray(res)) return [];
        return res.filter(i => !i.pull_request).map(i => this.normalizeIssue(i));
    }

    normalizeIssue(ghIssue) {
        return {
            id: String(ghIssue.id),
            identifier: `${ghIssue.number}`,
            title: ghIssue.title,
            description: ghIssue.body || null,
            priority: this.inferPriority(ghIssue),
            state: ghIssue.state,
            branch_name: null,
            url: ghIssue.html_url,
            labels: (ghIssue.labels || []).map(l => l.name.toLowerCase()),
            blocked_by: [],
            created_at: ghIssue.created_at,
            updated_at: ghIssue.updated_at,
        };
    }

    inferPriority(issue) {
        const labels = (issue.labels || []).map(l => l.name.toLowerCase());
        if (labels.includes('priority: critical') || labels.includes('critical')) return 1;
        if (labels.includes('priority: high') || labels.includes('high')) return 2;
        if (labels.includes('priority: medium') || labels.includes('medium')) return 3;
        if (labels.includes('priority: low') || labels.includes('low')) return 4;
        return null;
    }

    async apiRequest(url) {
        const res = await fetch(url, {
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Symphony-Maureonix/1.0',
            },
            timeout: 30000,
        });
        if (res.status === 401) throw { code: 'missing_tracker_api_key', message: 'Invalid GitHub token' };
        if (res.status === 404) throw { code: 'linear_api_status', message: 'Repository not found' };
        if (!res.ok) throw { code: 'linear_api_status', message: `GitHub API error: ${res.status}` };
        return await res.json();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   SECTION 3: WORKSPACE MANAGER (Symphony §9)
// ═══════════════════════════════════════════════════════════════════════════════

class WorkspaceManager {
    constructor(config) {
        this.config = config;
        this.root = config.workspace.root;
    }

    sanitizeIdentifier(identifier) {
        return identifier.replace(/[^A-Za-z0-9._-]/g, '_');
    }

    getWorkspacePath(identifier) {
        const key = this.sanitizeIdentifier(identifier);
        const wsPath = path.join(this.root, key);
        // Safety invariant: must be under root
        const resolved = path.resolve(wsPath);
        const rootResolved = path.resolve(this.root);
        if (!resolved.startsWith(rootResolved)) {
            throw { code: 'invalid_workspace_cwd', message: `Workspace path ${resolved} escapes root ${rootResolved}` };
        }
        return resolved;
    }

    async createOrReuse(identifier) {
        const wsPath = this.getWorkspacePath(identifier);
        let createdNow = false;

        try {
            await fs.access(wsPath);
        } catch {
            await fs.mkdir(wsPath, { recursive: true });
            createdNow = true;
        }

        if (createdNow && this.config.hooks.after_create) {
            await this.runHook('after_create', wsPath);
        }

        return { path: wsPath, workspace_key: this.sanitizeIdentifier(identifier), created_now: createdNow };
    }

    async runHook(hookName, wsPath) {
        const script = this.config.hooks[hookName];
        if (!script) return { success: true };

        return new Promise((resolve) => {
            const timeout = this.config.hooks.timeout_ms || 60000;
            const child = spawn('bash', ['-lc', script], {
                cwd: wsPath,
                timeout,
                env: { ...process.env, SYMPHONY_WORKSPACE: wsPath },
            });

            let stdout = '';
            let stderr = '';
            child.stdout.on('data', d => stdout += d);
            child.stderr.on('data', d => stderr += d);

            child.on('close', (code) => {
                if (code !== 0) {
                    resolve({ success: false, error: `Hook ${hookName} exited ${code}: ${stderr}` });
                } else {
                    resolve({ success: true, stdout });
                }
            });

            child.on('error', (err) => {
                resolve({ success: false, error: `Hook ${hookName} failed: ${err.message}` });
            });
        });
    }

    async cleanup(identifier) {
        const wsPath = this.getWorkspacePath(identifier);
        if (this.config.hooks.before_remove) {
            await this.runHook('before_remove', wsPath);
        }
        try {
            await fs.rm(wsPath, { recursive: true, force: true });
        } catch (e) {
            // Log but ignore cleanup failures per spec
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   SECTION 4: AGENT RUNNER (Symphony §10 adapted for Maureonix AI.ultimateAI)
// ═══════════════════════════════════════════════════════════════════════════════

class AgentRunner extends EventEmitter {
    constructor(config, workspaceManager, workflowLoader) {
        super();
        this.config = config;
        this.workspaceManager = workspaceManager;
        this.workflowLoader = workflowLoader;
        this.activeSessions = new Map();
    }

    async startSession(issue, attempt = null) {
        const workspace = await this.workspaceManager.createOrReuse(issue.identifier);

        // Run before_run hook
        const hookResult = await this.workspaceManager.runHook('before_run', workspace.path);
        if (!hookResult.success) {
            throw { code: 'hook_failure', message: `before_run failed: ${hookResult.error}` };
        }

        // Build prompt
        const prompt = await this.workflowLoader.renderPrompt(issue, attempt);

        // Session metadata
        const sessionId = `symphony-${issue.id}-${Date.now()}`;
        const session = {
            session_id: sessionId,
            thread_id: sessionId,
            turn_id: 'turn-1',
            issue_id: issue.id,
            issue_identifier: issue.identifier,
            workspace_path: workspace.path,
            started_at: new Date().toISOString(),
            status: 'initializing',
            prompt,
            turn_count: 0,
            max_turns: this.config.agent.max_turns,
        };

        this.activeSessions.set(issue.id, session);
        this.emit('session_started', session);

        // Launch the agent via Maureonix AI system
        return this.runAgentTurn(session, issue, attempt);
    }

    async runAgentTurn(session, issue, attempt) {
        session.status = 'streaming_turn';
        session.turn_count++;
        session.turn_id = `turn-${session.turn_count}`;
        session.last_codex_timestamp = Date.now();

        this.emit('turn_started', session);

        try {
            // Import Maureonix AI system
            const AI = require('./ai');

            // Build system prompt that instructs the AI to act as a Symphony agent
            const systemPrompt = this.buildAgentSystemPrompt(session, issue);

            // Call Maureonix's AI.ultimateAI
            const aiResult = await AI.ultimateAI(
                session.prompt,
                `symphony-${issue.id}`,
                'deepseek',
                systemPrompt
            );

            session.last_codex_message = aiResult.text?.slice(0, 500) || '';
            session.last_codex_event = 'turn_completed';
            session.last_codex_timestamp = Date.now();

            // Process any actions in the AI response
            const { executeActions } = require('./maureonixCore');
            // We need a mock nimesha for non-WhatsApp contexts, or use the notification system
            const mockNimesha = this.createMockNimesha(session);

            const processedText = await executeActions(
                aiResult.text,
                mockNimesha,
                'symphony-system',
                { chat: session.issue_id, sender: 'symphony' },
                null
            );

            // Check if we should continue (another turn)
            const shouldContinue = this.shouldContinueTurn(session, processedText);

            if (shouldContinue && session.turn_count < session.max_turns) {
                // Update prompt for continuation
                session.prompt = `Continue working on this issue. Previous progress:
${processedText.slice(-2000)}

Continue:`;
                return this.runAgentTurn(session, issue, attempt);
            }

            session.status = 'succeeded';
            this.emit('session_completed', session, processedText);

            // Run after_run hook
            await this.workspaceManager.runHook('after_run', session.workspace_path);

            return { session, result: processedText, status: 'success' };

        } catch (e) {
            session.status = 'failed';
            session.error = e.message;
            this.emit('session_failed', session, e);

            // Run after_run hook even on failure
            await this.workspaceManager.runHook('after_run', session.workspace_path);

            throw { code: 'agent_turn_error', message: e.message, session };
        }
    }

    buildAgentSystemPrompt(session, issue) {
        let prompt = `You are a Symphony coding agent working on GitHub issue #${issue.identifier}: "${issue.title}".\n`;
        prompt += `You are operating in workspace: ${session.workspace_path}\n`;
        prompt += `You have access to all Maureonix system commands.\n`;
        prompt += `Your task is to analyze the issue, implement the fix or feature, test it, and report completion.\n`;
        prompt += `Rules:\n1. Always backup files before modifying\n2. Run tests after changes\n3. Use git commands to track changes\n4. Report completion with DONE: summary\n5. If stuck, ask for help clearly\n`;

        // Add super intelligence context if available
        try {
            const { superIntelligence } = require('./superIntelligencePack');
            if (superIntelligence.initialized) {
                const plan = superIntelligence.planner.createPlan(
                    `Fix issue #${issue.identifier}: ${issue.title}`,
                    {
                        issue,
                        workspace: session.workspace_path,
                    }
                );
                prompt += `\n**Strategic Plan:**\n`;
                for (const step of plan.steps) {
                    prompt += `${step.id}: ${step.action}\n`;
                }
            }
        } catch (e) {}

        return prompt;
    }

    createMockNimesha(session) {
        // Returns a minimal mock that captures messages for the notification system
        const notifications = [];
        return {
            sendMessage: async (target, message) => {
                notifications.push({ target, message, time: Date.now() });
                // Also emit through our event system
                this.emit('notification', { session, target, message });
                return true;
            },
            _notifications: notifications,
        };
    }

    shouldContinueTurn(session, text) {
        // Don't continue if explicitly done
        if (text.includes('DONE:')) return false;
        if (text.includes('COMPLETED')) return false;
        // Continue if there are pending actions or the agent seems to be mid-task
        const hasPendingActions = /```(read_file|write_file|exec_cmd|git_)/.test(text);
        return hasPendingActions;
    }

    async stopSession(issueId) {
        const session = this.activeSessions.get(issueId);
        if (session) {
            session.status = 'canceled';
            this.activeSessions.delete(issueId);
            this.emit('session_stopped', session);
        }
    }

    getSession(issueId) {
        return this.activeSessions.get(issueId);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   SECTION 5: NOTIFICATION SYSTEM (WhatsApp + Email)
// ═══════════════════════════════════════════════════════════════════════════════

class NotificationSystem {
    constructor(config) {
        this.config = config;
        this.nimesha = global.nimaInstance || null;
    }

    setNimesha(instance) {
        this.nimesha = instance;
    }

    async sendWhatsApp(jid, text) {
        if (!this.config.notifications.whatsapp_enabled || !this.nimesha) return false;
        try {
            await this.nimesha.sendMessage(jid, { text });
            return true;
        } catch (e) {
            logToFile('notification', `WhatsApp failed: ${e.message}`);
            return false;
        }
    }

    async sendEmail(subject, body) {
        if (!this.config.notifications.email_enabled) return false;
        try {
            const { sendEmail } = require('./emailService');
            const config = require('../config');
            if (config.emailRecipient) {
                await sendEmail(config.emailRecipient, subject, body);
                return true;
            }
        } catch (e) {
            logToFile('notification', `Email failed: ${e.message}`);
        }
        return false;
    }

    async alertIssueStarted(issue, session) {
        const msg = `🎼 *Symphony Started* #${issue.identifier}\n\n📋 ${issue.title}\n🔄 Turn ${session.turn_count}/${session.max_turns}\n📁 ${session.workspace_path}`;
        await this.sendWhatsApp(this.getOwnerJid(), msg);
        await this.sendEmail(`Symphony Started: #${issue.identifier}`, msg);
    }

    async alertIssueCompleted(issue, session, result) {
        const summary = result.slice(0, 500);
        const msg = `✅ *Symphony Completed* #${issue.identifier}\n\n📋 ${issue.title}\n⏱ ${session.turn_count} turns\n\n📝 ${summary}\n\n🔗 ${issue.url}`;
        await this.sendWhatsApp(this.getOwnerJid(), msg);
        await this.sendEmail(`✅ Symphony Completed: #${issue.identifier}`, `${msg}\n\nFull result:\n${result}`);
    }

    async alertIssueFailed(issue, session, error) {
        const msg = `❌ *Symphony Failed* #${issue.identifier}\n\n📋 ${issue.title}\n💥 ${error.message || error}\n🔄 Attempt ${session.retry_attempt || 1}\n\n🔗 ${issue.url}`;
        await this.sendWhatsApp(this.getOwnerJid(), msg);
        await this.sendEmail(`❌ Symphony Failed: #${issue.identifier}`, msg);
    }

    async alertRetryScheduled(issue, retryEntry) {
        const dueDate = new Date(retryEntry.due_at_ms).toLocaleString();
        const msg = `⏳ *Symphony Retry Scheduled* #${issue.identifier}\n\n📋 ${issue.title}\n⏰ ${dueDate}\n🔢 Attempt ${retryEntry.attempt}`;
        await this.sendWhatsApp(this.getOwnerJid(), msg);
    }

    getOwnerJid() {
        const config = require('../config');
        const raw = Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber;
        return raw ? raw.replace(/\D/g, '') + '@s.whatsapp.net' : null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   SECTION 6: ORCHESTRATOR STATE MACHINE (Symphony §7)
// ═══════════════════════════════════════════════════════════════════════════════

class SymphonyOrchestrator extends EventEmitter {
    constructor() {
        super();
        this.workflowLoader = new WorkflowLoader();
        this.configResolver = new ConfigResolver(this.workflowLoader);
        this.state = this.createInitialState();
        this.tracker = null;
        this.workspaceManager = null;
        this.agentRunner = null;
        this.notifications = null;
        this.pollTimer = null;
        this.isRunning = false;
        this.watchers = new Map();
    }

    createInitialState() {
        return {
            poll_interval_ms: 30000,
            max_concurrent_agents: 3,
            running: new Map(),
            claimed: new Set(),
            retry_attempts: new Map(),
            completed: new Set(),
            codex_totals: { input_tokens: 0, output_tokens: 0, total_tokens: 0, seconds_running: 0 },
            codex_rate_limits: null,
        };
    }

    async initialize() {
        console.log('╔══════════════════════════════════════════════════════════════════╗');
        console.log('║     🎼 SYMPHONY × MAUREONIX ORCHESTRATOR v1.0.0                ║');
        console.log('║     Four Engines | Recursive | Transfer | Trust | Genesis        ║');
        console.log('║     GitHub Issues | WhatsApp + Email | Self-Healing              ║');
        console.log('╚══════════════════════════════════════════════════════════════════╝');

        // Validate config
        const validation = await this.configResolver.validate();
        if (!validation.valid) {
            console.error('❌ Startup validation failed:');
            validation.errors.forEach(e => console.error(`   • ${e}`));
            throw { code: 'startup_validation_failed', errors: validation.errors };
        }

        const config = validation.config;
        this.state.poll_interval_ms = config.polling.interval_ms;
        this.state.max_concurrent_agents = config.agent.max_concurrent_agents;

        // Initialize components
        this.tracker = new GitHubTrackerClient(config);
        this.workspaceManager = new WorkspaceManager(config);
        this.agentRunner = new AgentRunner(config, this.workspaceManager, this.workflowLoader);
        this.notifications = new NotificationSystem(config);

        // Wire up agent events
        this.agentRunner.on('session_started', (session) => this.onSessionStarted(session));
        this.agentRunner.on('session_completed', (session, result) => this.onSessionCompleted(session, result));
        this.agentRunner.on('session_failed', (session, error) => this.onSessionFailed(session, error));
        this.agentRunner.on('notification', (notif) => this.onAgentNotification(notif));

        // Setup workflow file watcher
        this.setupWorkflowWatcher();

        // Startup terminal cleanup
        await this.startupTerminalCleanup();

        // Start polling
        this.isRunning = true;
        this.scheduleTick(0);

        // Start proactive engine integration
        this.integrateProactiveEngine();

        console.log('✅ Symphony Orchestrator initialized and running');
        return this.getStatus();
    }

    setupWorkflowWatcher() {
        try {
            fsSync.watchFile(WORKFLOW_PATH, { interval: 2000 }, async () => {
                try {
                    await this.workflowLoader.load();
                    const validation = await this.configResolver.validate();
                    if (validation.valid) {
                        this.state.poll_interval_ms = validation.config.polling.interval_ms;
                        this.state.max_concurrent_agents = validation.config.agent.max_concurrent_agents;
                        logToFile('orchestrator', 'WORKFLOW.md reloaded successfully');
                    } else {
                        logToFile('orchestrator', `WORKFLOW.md reload failed: ${validation.errors.join(', ')}`);
                    }
                } catch (e) {
                    logToFile('orchestrator', `Workflow watch error: ${e.message}`);
                }
            });
        } catch (e) {
            logToFile('orchestrator', `Failed to setup workflow watcher: ${e.message}`);
        }
    }

    async startupTerminalCleanup() {
        try {
            const config = await this.configResolver.resolve();
            const terminalIssues = await this.tracker.fetchIssuesByStates(config.tracker.terminal_states);
            for (const issue of terminalIssues) {
                await this.workspaceManager.cleanup(issue.identifier);
                logToFile('orchestrator', `Cleaned terminal workspace for #${issue.identifier}`);
            }
        } catch (e) {
            logToFile('orchestrator', `Startup cleanup warning: ${e.message}`);
        }
    }

    scheduleTick(delayMs) {
        if (this.pollTimer) clearTimeout(this.pollTimer);
        this.pollTimer = setTimeout(() => this.onTick(), delayMs);
    }

    async onTick() {
        if (!this.isRunning) return;

        try {
            // Step 1: Reconcile running issues
            await this.reconcileRunningIssues();

            // Step 2: Validate config
            const validation = await this.configResolver.validate();
            if (!validation.valid) {
                logToFile('orchestrator', `Dispatch validation failed: ${validation.errors.join(', ')}`);
                this.emit('dispatch_skipped', validation.errors);
                this.scheduleTick(this.state.poll_interval_ms);
                return;
            }

            // Step 3: Fetch candidates
            const issues = await this.tracker.fetchCandidateIssues();
            if (!issues || issues.length === 0) {
                this.scheduleTick(this.state.poll_interval_ms);
                return;
            }

            // Step 4: Sort and dispatch
            const sorted = this.sortForDispatch(issues);
            for (const issue of sorted) {
                if (!this.shouldDispatch(issue)) break;
                await this.dispatchIssue(issue);
            }

        } catch (e) {
            logToFile('orchestrator', `Tick error: ${e.message}`);
        }

        this.scheduleTick(this.state.poll_interval_ms);
    }

    async reconcileRunningIssues() {
        // Stall detection
        const now = Date.now();
        for (const [issueId, entry] of this.state.running) {
            const lastActivity = entry.last_codex_timestamp || entry.started_at;
            const elapsed = now - new Date(lastActivity).getTime();
            const stallTimeout = (await this.configResolver.resolve()).codex.stall_timeout_ms;

            if (stallTimeout > 0 && elapsed > stallTimeout) {
                logToFile('orchestrator', `Stall detected for #${entry.issue_identifier}, terminating`);
                await this.agentRunner.stopSession(issueId);
                this.scheduleRetry(issueId, entry, 'stalled');
            }
        }

        // Tracker state refresh
        if (this.state.running.size === 0) return;

        const runningIds = [...this.state.running.keys()];
        try {
            const refreshed = await this.tracker.fetchIssueStatesByIds(runningIds);
            const config = await this.configResolver.resolve();

            for (const issue of refreshed) {
                const entry = this.state.running.get(issue.id);
                if (!entry) continue;

                const stateNorm = issue.state.toLowerCase();
                const terminalStates = config.tracker.terminal_states.map(s => s.toLowerCase());
                const activeStates = config.tracker.active_states.map(s => s.toLowerCase());

                if (terminalStates.includes(stateNorm)) {
                    // Terminal: stop and cleanup
                    await this.agentRunner.stopSession(issue.id);
                    this.state.running.delete(issue.id);
                    this.state.claimed.delete(issue.id);
                    await this.workspaceManager.cleanup(issue.identifier);
                    logToFile('orchestrator', `Issue #${issue.identifier} terminal, cleaned up`);
                } else if (!activeStates.includes(stateNorm)) {
                    // Non-active: stop without cleanup
                    await this.agentRunner.stopSession(issue.id);
                    this.state.running.delete(issue.id);
                    this.state.claimed.delete(issue.id);
                    logToFile('orchestrator', `Issue #${issue.identifier} non-active, stopped`);
                } else {
                    // Still active: update snapshot
                    entry.issue = issue;
                }
            }
        } catch (e) {
            logToFile('orchestrator', `State refresh failed: ${e.message}`);
        }
    }

    sortForDispatch(issues) {
        return issues.sort((a, b) => {
            // Priority ascending (lower = higher priority)
            if (a.priority !== null && b.priority !== null) return a.priority - b.priority;
            if (a.priority !== null) return -1;
            if (b.priority !== null) return 1;
            // Created_at oldest first
            if (a.created_at && b.created_at) return new Date(a.created_at) - new Date(b.created_at);
            // Identifier tie-breaker
            return (a.identifier || '').localeCompare(b.identifier || '');
        });
    }

    shouldDispatch(issue) {
        if (!issue.id || !issue.identifier || !issue.title || !issue.state) return false;

        const stateNorm = issue.state.toLowerCase();
        // Must check active states
        // (Already filtered by tracker, but double-check)

        if (this.state.running.has(issue.id)) return false;
        if (this.state.claimed.has(issue.id)) return false;

        // Concurrency check
        const runningCount = this.state.running.size;
        if (runningCount >= this.state.max_concurrent_agents) return false;

        // Per-state concurrency
        const config = this.configResolver.effectiveConfig;
        if (config && config.agent.max_concurrent_agents_by_state[stateNorm]) {
            const stateLimit = config.agent.max_concurrent_agents_by_state[stateNorm];
            const stateRunning = [...this.state.running.values()].filter(e => e.issue.state.toLowerCase() === stateNorm).length;
            if (stateRunning >= stateLimit) return false;
        }

        return true;
    }

    async dispatchIssue(issue, attempt = null) {
        logToFile('orchestrator', `Dispatching #${issue.identifier}: ${issue.title}`);

        this.state.claimed.add(issue.id);

        const runningEntry = {
            issue_id: issue.id,
            issue_identifier: issue.identifier,
            issue,
            attempt: attempt || 0,
            started_at: new Date().toISOString(),
            status: 'preparing_workspace',
            session_id: null,
            codex_app_server_pid: null,
            last_codex_message: null,
            last_codex_event: null,
            last_codex_timestamp: null,
            codex_input_tokens: 0,
            codex_output_tokens: 0,
            codex_total_tokens: 0,
            turn_count: 0,
        };

        try {
            const result = await this.agentRunner.startSession(issue, attempt);

            runningEntry.session_id = result.session.session_id;
            runningEntry.status = 'running';
            this.state.running.set(issue.id, runningEntry);

            // Clear any retry
            this.state.retry_attempts.delete(issue.id);

            return result;
        } catch (e) {
            runningEntry.status = 'failed';
            runningEntry.error = e.message;
            this.state.running.delete(issue.id);
            this.scheduleRetry(issue.id, runningEntry, e.message);
            throw e;
        }
    }

    async onSessionStarted(session) {
        const entry = this.state.running.get(session.issue_id);
        if (entry) {
            entry.session_id = session.session_id;
            entry.status = 'streaming_turn';
        }

        const issue = entry?.issue || session.issue;
        if (issue) {
            await this.notifications.alertIssueStarted(issue, session);
        }

        this.emit('issue_started', session);
    }

    async onSessionCompleted(session, result) {
        const entry = this.state.running.get(session.issue_id);
        if (!entry) return;

        entry.status = 'succeeded';
        this.state.running.delete(session.issue_id);
        this.state.completed.add(session.issue_id);

        // Update totals
        this.state.codex_totals.seconds_running += (Date.now() - new Date(entry.started_at).getTime()) / 1000;

        const issue = entry.issue;
        await this.notifications.alertIssueCompleted(issue, session, result);

        // Schedule continuation retry (1 second) to check if issue still active
        this.scheduleRetry(session.issue_id, entry, null, 'continuation');

        this.emit('issue_completed', session, result);
    }

    async onSessionFailed(session, error) {
        const entry = this.state.running.get(session.issue_id);
        if (!entry) return;

        entry.status = 'failed';
        this.state.running.delete(session.issue_id);

        const issue = entry.issue;
        await this.notifications.alertIssueFailed(issue, session, error);

        // Schedule exponential backoff retry
        this.scheduleRetry(session.issue_id, entry, error.message || String(error));

        this.emit('issue_failed', session, error);
    }

    onAgentNotification(notif) {
        // Forward agent notifications to WhatsApp if needed
        if (notif.message && notif.message.text) {
            this.notifications.sendWhatsApp(this.notifications.getOwnerJid(), notif.message.text);
        }
    }

    scheduleRetry(issueId, entry, error, type = 'failure') {
        // Cancel existing retry
        const existing = this.state.retry_attempts.get(issueId);
        if (existing && existing.timer_handle) clearTimeout(existing.timer_handle);

        let delayMs;
        let attemptNum;

        if (type === 'continuation') {
            delayMs = 1000; // 1 second for continuation
            attemptNum = 1;
        } else {
            // Exponential backoff: 10s * 2^(attempt-1), capped at max
            const maxBackoff = this.configResolver.effectiveConfig?.agent?.max_retry_backoff_ms || 300000;
            attemptNum = (entry.attempt || 0) + 1;
            delayMs = Math.min(10000 * Math.pow(2, attemptNum - 1), maxBackoff);
        }

        const dueAt = Date.now() + delayMs;

        const retryEntry = {
            issue_id: issueId,
            identifier: entry.issue_identifier,
            attempt: attemptNum,
            due_at_ms: dueAt,
            error: error,
            type,
        };

        const timer = setTimeout(() => this.onRetryTimer(issueId), delayMs);
        retryEntry.timer_handle = timer;

        this.state.retry_attempts.set(issueId, retryEntry);

        if (type !== 'continuation') {
            this.notifications.alertRetryScheduled(entry.issue, retryEntry);
        }

        logToFile('orchestrator', `Retry scheduled for #${entry.issue_identifier} in ${delayMs}ms (attempt ${attemptNum})`);
    }

    async onRetryTimer(issueId) {
        this.state.retry_attempts.delete(issueId);

        try {
            // Re-fetch the issue
            const candidates = await this.tracker.fetchCandidateIssues();
            const issue = candidates.find(i => i.id === issueId);

            if (!issue) {
                // Issue no longer exists or not active
                this.state.claimed.delete(issueId);
                logToFile('orchestrator', `Issue ${issueId} no longer active, releasing claim`);
                return;
            }

            // Check if still dispatchable
            if (this.shouldDispatch(issue)) {
                const retryEntry = this.state.retry_attempts.get(issueId);
                await this.dispatchIssue(issue, retryEntry?.attempt);
            } else {
                // Re-queue with slot error
                const entry = { issue_identifier: issue.identifier, issue, attempt: 1 };
                this.scheduleRetry(issueId, entry, 'no available orchestrator slots');
            }
        } catch (e) {
            logToFile('orchestrator', `Retry timer error: ${e.message}`);
        }
    }

    integrateProactiveEngine() {
        // Connect with Maureonix proactive engine for health monitoring
        try {
            const proactive = require('./proactiveEngine');
            // If proactive engine is initialized, it will pick up our status
            logToFile('orchestrator', 'Proactive engine integration ready');
        } catch (e) {
            logToFile('orchestrator', `Proactive engine not available: ${e.message}`);
        }
    }

    getStatus() {
        return {
            is_running: this.isRunning,
            poll_interval_ms: this.state.poll_interval_ms,
            max_concurrent: this.state.max_concurrent_agents,
            running_count: this.state.running.size,
            claimed_count: this.state.claimed.size,
            retrying_count: this.state.retry_attempts.size,
            completed_count: this.state.completed.size,
            running: [...this.state.running.values()].map(e => ({
                issue_id: e.issue_id,
                identifier: e.issue_identifier,
                state: e.issue?.state,
                session_id: e.session_id,
                turn_count: e.turn_count,
                started_at: e.started_at,
            })),
            retrying: [...this.state.retry_attempts.values()].map(r => ({
                issue_id: r.issue_id,
                identifier: r.identifier,
                attempt: r.attempt,
                due_at: new Date(r.due_at_ms).toISOString(),
                error: r.error,
            })),
            codex_totals: this.state.codex_totals,
        };
    }

    async shutdown() {
        this.isRunning = false;
        if (this.pollTimer) clearTimeout(this.pollTimer);

        // Stop all running sessions
        for (const [issueId] of this.state.running) {
            await this.agentRunner.stopSession(issueId);
        }

        // Clear all retry timers
        for (const [, retry] of this.state.retry_attempts) {
            if (retry.timer_handle) clearTimeout(retry.timer_handle);
        }

        logToFile('orchestrator', 'Orchestrator shutdown complete');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   SECTION 7: HTTP STATUS API (Symphony §13.7 — Optional Extension)
// ═══════════════════════════════════════════════════════════════════════════════

class StatusServer {
    constructor(orchestrator, config) {
        this.orchestrator = orchestrator;
        this.config = config;
        this.server = null;
    }

    async start() {
        const port = this.config.server?.port;
        if (!port) return;

        const http = require('http');
        this.server = http.createServer((req, res) => this.handleRequest(req, res));
        this.server.listen(port, '127.0.0.1', () => {
            logToFile('orchestrator', `Status server listening on http://127.0.0.1:${port}`);
        });
    }

    handleRequest(req, res) {
        res.setHeader('Content-Type', 'application/json');

        if (req.url === '/api/v1/state' && req.method === 'GET') {
            const status = this.orchestrator.getStatus();
            res.writeHead(200);
            res.end(JSON.stringify({
                generated_at: new Date().toISOString(),
                ...status,
            }, null, 2));
        } else if (req.url === '/api/v1/refresh' && req.method === 'POST') {
            this.orchestrator.scheduleTick(0);
            res.writeHead(202);
            res.end(JSON.stringify({ queued: true, requested_at: new Date().toISOString() }));
        } else if (req.url === '/' && req.method === 'GET') {
            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end(this.getDashboardHtml());
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: { code: 'not_found', message: 'Endpoint not found' } }));
        }
    }

    getDashboardHtml() {
        const status = this.orchestrator.getStatus();
        return `<!DOCTYPE html>
<html><head><title>Symphony × Maureonix</title>
<style>
body{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 20px;background:#0a0a0a;color:#e0e0e0}
h1{color:#00ff88;border-bottom:2px solid #00ff88;padding-bottom:10px}
.card{background:#151515;border-radius:8px;padding:20px;margin:15px 0;border-left:4px solid #00ff88}
.running{border-left-color:#00ff88}.retrying{border-left-color:#ffaa00}.error{border-left-color:#ff4444}
.metric{display:inline-block;margin:10px 20px 0 0;font-size:1.1em}
.metric span{color:#00ff88;font-weight:bold}
table{width:100%;border-collapse:collapse;margin-top:10px}
th{text-align:left;padding:8px;background:#1a1a1a;color:#00ff88}
td{padding:8px;border-bottom:1px solid #333}
tr:hover{background:#1a1a1a}
</style></head>
<body>
<h1>🎼 Symphony × Maureonix Dashboard</h1>
<div class="card">
<h3>System Status</h3>
<div class="metric">Running: <span>${status.running_count}</span></div>
<div class="metric">Retrying: <span>${status.retrying_count}</span></div>
<div class="metric">Claimed: <span>${status.claimed_count}</span></div>
<div class="metric">Completed: <span>${status.completed_count}</span></div>
<div class="metric">Poll Interval: <span>${status.poll_interval_ms}ms</span></div>
</div>
<div class="card running">
<h3>🔥 Active Sessions</h3>
${status.running.length ? `<table><tr><th>Issue</th><th>State</th><th>Session</th><th>Turns</th><th>Started</th></tr>
${status.running.map(r => `<tr><td>#${r.identifier}</td><td>${r.state}</td><td>${r.session_id?.slice(0,20)}...</td><td>${r.turn_count}</td><td>${new Date(r.started_at).toLocaleTimeString()}</td></tr>`).join('')}
</table>` : '<p>No active sessions</p>'}
</div>
<div class="card retrying">
<h3>⏳ Retry Queue</h3>
${status.retrying.length ? `<table><tr><th>Issue</th><th>Attempt</th><th>Due At</th><th>Error</th></tr>
${status.retrying.map(r => `<tr><td>#${r.identifier}</td><td>${r.attempt}</td><td>${new Date(r.due_at).toLocaleTimeString()}</td><td>${r.error?.slice(0,50)}</td></tr>`).join('')}
</table>` : '<p>No retries pending</p>'}
</div>
<p style="text-align:center;color:#666;margin-top:30px">Symphony × Maureonix v1.0.0 | Auto-refresh every 30s</p>
<script>setInterval(()=>location.reload(),30000)</script>
</body></html>`;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   SECTION 8: LOGGING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function logToFile(type, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
    const logFile = path.join(LOGS_DIR, `symphony_${type}_${new Date().toISOString().slice(0, 10)}.log`);
    try { fsSync.appendFileSync(logFile, logEntry); } catch {}
    console.log(logEntry.trim());
}

// ═══════════════════════════════════════════════════════════════════════════════
//   SECTION 9: BOOTSTRAP & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

const symphonyOrchestrator = new SymphonyOrchestrator();

async function startSymphony() {
    try {
        const status = await symphonyOrchestrator.initialize();

        // Start optional HTTP server
        const config = await symphonyOrchestrator.configResolver.resolve();
        if (config.server?.port) {
            const server = new StatusServer(symphonyOrchestrator, config);
            await server.start();
        }

        return status;
    } catch (e) {
        console.error('Failed to start Symphony:', e);
        throw e;
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    await symphonyOrchestrator.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await symphonyOrchestrator.shutdown();
    process.exit(0);
});

module.exports = {
    SymphonyOrchestrator,
    symphonyOrchestrator,
    startSymphony,
    WorkflowLoader,
    ConfigResolver,
    GitHubTrackerClient,
    WorkspaceManager,
    AgentRunner,
    NotificationSystem,
    StatusServer,
    logToFile,
};
