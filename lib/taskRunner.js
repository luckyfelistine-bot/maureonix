// lib/taskRunner.js — Maureonix Autonomous Task Runner
const fs = require('fs');
const path = require('path');
const { mathEngine } = require('./mathBridge');

const TASKS_FILE = path.join(__dirname, '..', 'database', 'tasks.json');
let tasks = [];

// ─── Load existing tasks ───
function loadTasks() {
    try {
        if (fs.existsSync(TASKS_FILE)) {
            const raw = fs.readFileSync(TASKS_FILE, 'utf8');
            tasks = JSON.parse(raw);
        } else {
            tasks = [];
            saveTasks();
        }
    } catch (e) {
        tasks = [];
    }
    return tasks;
}

// ─── Persist tasks ───
function saveTasks() {
    try {
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
    } catch (e) {}
}

// ─── Add a new task ───
function addTask({ userId, description, runDate = null, dependencies = [], priority = 'normal', recurring = null }) {
    const task = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        userId: userId || 'owner',
        description,
        status: 'pending',
        priority,
        created: Date.now(),
        runDate: runDate || null,
        dependencies: dependencies || [],
        recurring: recurring || null,
        result: null,
        attempts: 0,
        maxAttempts: 3,
        progress: []
    };
    tasks.push(task);
    saveTasks();
    return task;
}

// ─── Remove completed / cancelled tasks ───
function removeTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
}

// ─── Start the polling loop ───
let runnerInterval = null;
function startRunner() {
    if (runnerInterval) clearInterval(runnerInterval);
    runnerInterval = setInterval(pollTasks, 15000); // every 15 seconds
    console.log('[TaskRunner] Polling started');
}

function stopRunner() {
    if (runnerInterval) clearInterval(runnerInterval);
}

// ─── Poll for ready tasks ───
async function pollTasks() {
    loadTasks();
    const now = Date.now();
    const ready = tasks.filter(t => {
        if (t.status !== 'pending') return false;
        if (t.runDate && new Date(t.runDate).getTime() > now) return false;
        for (const depId of t.dependencies) {
            const dep = tasks.find(d => d.id === depId);
            if (!dep || dep.status !== 'completed') return false;
        }
        return true;
    });

    for (const task of ready) {
        await executeTask(task);
    }
}

// ─── Execute a single task ───
async function executeTask(task) {
    task.status = 'running';
    task.attempts++;
    task.startedAt = Date.now();
    saveTasks();

    try {
        const AI = require('./ai');
        const isSymphonyTask = task.description.startsWith('symphony:');

        let systemPrompt;
        if (isSymphonyTask) {
            const issueMatch = task.description.match(/symphony:\s*#?\s*(\d+)/);
            const issueNum = issueMatch ? issueMatch[1] : null;

            systemPrompt = `You are a Symphony coding agent working on GitHub issue #${issueNum}.\n` +
                           `You have access to all Maureonix system commands.\n` +
                           `Complete the coding task and report with DONE:`;
        } else {
            systemPrompt = `You are Maureonix, performing an autonomous task for the owner.\n` +
                           `Task description: ${task.description}\n\n` +
                           `You have access to all core system commands (read_file, write_file, send_message, schedule_message, etc.).\n` +
                           `Complete the task effectively. Report progress at key milestones by answering with the milestone name.\n` +
                           `When finished, output EXACTLY this line: DONE: <summary of what you accomplished>`;
        }

        const conversation = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Please complete this task: ${task.description}` }
        ];
        let finalAnswer = '';
        let currentRound = 0;
        const maxRounds = 10;

        while (currentRound < maxRounds) {
            currentRound++;
            const response = await AI.ultimateAI(
                conversation.map(m => `${m.role}: ${m.content}`).join('\n'),
                'system',
                'deepseek'
            );
            const text = response.text;

            // Check for completion marker
            if (text.includes('DONE:')) {
                const summary = text.split('DONE:')[1].trim();
                finalAnswer = summary;
                task.result = summary;
                task.status = 'completed';
                task.completedAt = Date.now();
                task.progress.push({ time: Date.now(), message: 'Completed: ' + summary });
                break;
            }

            // Otherwise, treat the reply as progress and continue
            task.progress.push({ time: Date.now(), message: text.slice(0, 200) });
            conversation.push({ role: 'assistant', content: text });

            // Let the AI optionally request system actions via a special syntax
            const actionMatches = text.match(/```([\s\S]+?)```/g);
            if (actionMatches) {
                for (const match of actionMatches) {
                    const code = match.replace(/```/g, '').trim();
                    try {
                        const { executeActions } = require('./maureonixCore');
                        task.progress.push({ time: Date.now(), message: 'Attempted action: ' + code.slice(0, 100) });
                    } catch (e) {
                        task.progress.push({ time: Date.now(), message: 'Action failed: ' + e.message });
                    }
                }
            }

            saveTasks();
        }

        // If max rounds reached without DONE
        if (task.status !== 'completed') {
            task.status = 'failed';
            task.result = 'Max rounds exceeded';
        }

    } catch (e) {
        task.status = 'failed';
        task.result = e.message;
    }

    // If failed but retries remain, set back to pending
    if (task.status === 'failed' && task.attempts < task.maxAttempts) {
        task.status = 'pending';
        task.nextRetryAt = Date.now() + 60000 * task.attempts; // exponential backoff
    }

    // Report result to owner via WhatsApp if possible
    try {
        const maureonix = global.maureonixInstance;
        if (maureonix && task.userId) {
            const ownerJid = Array.isArray(require('../config').ownerNumber)
                ? require('../config').ownerNumber[0] + '@s.whatsapp.net'
                : require('../config').ownerNumber + '@s.whatsapp.net';
            if (task.status === 'completed') {
                await maureonix.sendMessage(ownerJid, { text: `✅ *Task completed:* ${task.description}\n\n📋 Result: ${task.result}` });
            } else if (task.status === 'failed' && task.attempts >= task.maxAttempts) {
                await maureonix.sendMessage(ownerJid, { text: `❌ *Task failed permanently:* ${task.description}\n\nError: ${task.result}` });
            }
        }
    } catch (e) {}

    // Handle recurring tasks
    if (task.status === 'completed' && task.recurring) {
        const next = new Date();
        if (task.recurring.interval === 'daily') next.setDate(next.getDate() + 1);
        else if (task.recurring.interval === 'weekly') next.setDate(next.getDate() + 7);
        else if (task.recurring.interval === 'monthly') next.setMonth(next.getMonth() + 1);
        if (task.recurring.at) {
            const [h, m] = task.recurring.at.split(':').map(Number);
            next.setHours(h, m, 0, 0);
        }
        addTask({
            userId: task.userId,
            description: task.description,
            runDate: next.getTime(),
            priority: task.priority,
            recurring: task.recurring
        });
    }

    saveTasks();
}

module.exports = { addTask, removeTask, startRunner, stopRunner, loadTasks, saveTasks };
