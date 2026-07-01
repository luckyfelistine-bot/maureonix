// maureonix_core.js — Core message processing engine
// Handles all incoming messages, command parsing, and AI responses

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// ── Load AI module ──
let AI = null;
try {
    AI = require('./lib/ai');
} catch (e) {
    console.error('[maureonix_core] AI module not available:', e.message);
}

// ── Load config ──
let config = {};
try {
    config = require('./config');
} catch (e) {
    console.error('[maureonix_core] Config not available:', e.message);
}

// ── Command registry ──
const commandRegistry = new Map();

/**
 * Register a command handler
 * @param {string} name - Command name (without prefix)
 * @param {Function} handler - Async handler function
 * @param {Object} meta - Command metadata
 */
function registerCommand(name, handler, meta = {}) {
    commandRegistry.set(name.toLowerCase(), { handler, meta });
}

/**
 * Extract command and arguments from message body
 * @param {string} body - Message text
 * @param {string} prefix - Command prefix (default: '.')
 */
function parseCommand(body, prefix = '.') {
    if (!body || !body.startsWith(prefix)) return null;

    const trimmed = body.slice(prefix.length).trim();
    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    const fullArgs = trimmed.slice(command.length).trim();

    return { command, args, fullArgs, raw: body };
}

/**
 * Main message handler — called for every incoming message
 * @param {Object} sock - Baileys socket
 * @param {Object} msg - Raw message object
 * @param {Object} ctx - Message context
 */
async function coreHandler(sock, msg, ctx) {
    try {
        const { body, isGroup, isChannel, sender, remoteJid, pushName } = ctx;

        // Skip empty messages
        if (!body || body.trim().length === 0) return;

        // Determine prefix (configurable)
        const prefix = config.prefix || '.';

        // Check if it's a command
        const parsed = parseCommand(body, prefix);

        if (parsed) {
            // It's a command — route to command handler
            const cmdEntry = commandRegistry.get(parsed.command);
            if (cmdEntry) {
                try {
                    await cmdEntry.handler(sock, msg, ctx, parsed);
                } catch (cmdErr) {
                    console.error(`[coreHandler] Command "${parsed.command}" error:`, cmdErr.message);
                    await safeReply(sock, remoteJid, `❌ Error executing command: ${cmdErr.message}`);
                }
            } else {
                // Unknown command — could be AI query
                await handleAIQuery(sock, msg, ctx, body);
            }
        } else {
            // Not a command — treat as natural language query
            // Only respond in private chats or when mentioned in groups
            const shouldRespond = !isGroup || body.includes(`@${config.botNumber}`);
            if (shouldRespond) {
                await handleAIQuery(sock, msg, ctx, body);
            }
        }

    } catch (e) {
        console.error('[coreHandler] Fatal error:', e.message);
    }
}

/**
 * Handle AI/natural language queries
 */
async function handleAIQuery(sock, msg, ctx, query) {
    if (!AI || !AI.ultimateAI) {
        await safeReply(sock, ctx.remoteJid, '⚠️ AI service is currently unavailable. Please try again later.');
        return;
    }

    try {
        // Show typing indicator
        await sock.sendPresenceUpdate('composing', ctx.remoteJid);

        const response = await AI.ultimateAI(query, ctx.sender, 'deepseek');

        // Stop typing
        await sock.sendPresenceUpdate('paused', ctx.remoteJid);

        if (response && response.text) {
            await safeReply(sock, ctx.remoteJid, response.text);
        }
    } catch (e) {
        console.error('[handleAIQuery] AI error:', e.message);
        await safeReply(sock, ctx.remoteJid, '❌ AI processing failed. Please try again.');
    }
}

/**
 * Safe message reply with error handling
 */
async function safeReply(sock, jid, text, options = {}) {
    try {
        if (!sock || !jid || !text) return false;
        await sock.sendMessage(jid, { text: String(text).slice(0, 4096), ...options });
        return true;
    } catch (e) {
        console.error('[safeReply] Failed:', e.message);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   BUILT-IN COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

// Ping command
registerCommand('ping', async (sock, msg, ctx, parsed) => {
    const start = Date.now();
    await safeReply(sock, ctx.remoteJid, '🏓 Pong!');
    const latency = Date.now() - start;
    await safeReply(sock, ctx.remoteJid, `⏱️ Latency: ${latency}ms`);
}, { description: 'Check bot responsiveness' });

// Help command
registerCommand('help', async (sock, msg, ctx, parsed) => {
    const commands = Array.from(commandRegistry.entries())
        .map(([name, entry]) => `• *${name}* — ${entry.meta.description || 'No description'}`)
        .join('\n');

    const helpText = `🦊 *Maureonix Help*\n\n${commands}\n\n_Type any message to chat with AI._`;
    await safeReply(sock, ctx.remoteJid, helpText);
}, { description: 'Show available commands' });

// Status command
registerCommand('status', async (sock, msg, ctx, parsed) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const status = `🦊 *Maureonix Status*\n\n⏱ Uptime: ${hours}h ${minutes}m\n💾 Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB\n🟢 Connected: ${sock.ws?.readyState === 1 ? 'Yes' : 'No'}`;
    await safeReply(sock, ctx.remoteJid, status);
}, { description: 'Show bot status' });

// ═══════════════════════════════════════════════════════════════════════════════
//   EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = coreHandler;
