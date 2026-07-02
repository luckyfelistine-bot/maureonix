// maureonix_core.js — Core message processing engine
// VERSION: 6.2.1-FIX — Double message fix, identity enforcement, reconnect handling

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

// ── Load settings ──
try {
  require('./settings');
} catch (e) {
  console.error('[maureonix_core] Settings not available:', e.message);
}

// ── Ensure privateMode exists ──
if (typeof global.privateMode === 'undefined') {
  global.privateMode = false;
}
if (typeof global.togglePrivateMode !== 'function') {
  global.togglePrivateMode = function() {
    global.privateMode = !global.privateMode;
    return global.privateMode;
  };
}

// ── Command registry ──
const commandRegistry = new Map();

function registerCommand(name, handler, meta = {}) {
  commandRegistry.set(name.toLowerCase(), { handler, meta });
}

function parseCommand(body, prefix = '.') {
  if (!body || !body.startsWith(prefix)) return null;
  const trimmed = body.slice(prefix.length).trim();
  const parts = trimmed.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  const fullArgs = trimmed.slice(command.length).trim();
  return { command, args, fullArgs, raw: body };
}

function isOwner(sender) {
  const ownerJid = Array.isArray(global.owner) 
    ? global.owner[0] + '@s.whatsapp.net' 
    : (global.owner || '') + '@s.whatsapp.net';
  return sender === ownerJid;
}

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
// MESSAGE DEDUPLICATION
// ═══════════════════════════════════════════════════════════════════════════════
const processedMessages = new Set();

function isDuplicate(msgKey, remoteJid) {
  const dedupKey = `${msgKey}-${remoteJid}`;
  if (processedMessages.has(dedupKey)) return true;
  processedMessages.add(dedupKey);
  if (processedMessages.size > 1000) {
    const entries = Array.from(processedMessages).slice(-500);
    processedMessages.clear();
    entries.forEach(e => processedMessages.add(e));
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════════════════════
async function coreHandler(sock, msg, ctx) {
  try {
    const { body, isGroup, sender, remoteJid } = ctx;

    if (!body || body.trim().length === 0) return;

    // Deduplication
    if (msg.key && msg.key.id && isDuplicate(msg.key.id, remoteJid)) {
      console.log(`[coreHandler] Skipping duplicate: ${msg.key.id}`);
      return;
    }

    const prefix = config.prefix || '.';
    const parsed = parseCommand(body, prefix);

    if (parsed) {
      const cmdEntry = commandRegistry.get(parsed.command);
      if (cmdEntry) {
        try {
          await cmdEntry.handler(sock, msg, ctx, parsed);
        } catch (cmdErr) {
          console.error(`[coreHandler] Command "${parsed.command}" error:`, cmdErr.message);
          await safeReply(sock, remoteJid, `❌ Error: ${cmdErr.message}`);
        }
      } else {
        await handleAIQuery(sock, msg, ctx, body);
      }
    } else {
      const shouldRespond = !isGroup || body.includes(`@${config.number_bot}`);
      if (shouldRespond) {
        await handleAIQuery(sock, msg, ctx, body);
      }
    }
  } catch (e) {
    console.error('[coreHandler] Fatal error:', e.message);
  }
}

async function handleAIQuery(sock, msg, ctx, query) {
  if (global.privateMode === true && ctx.isGroup) return;
  if (global.public === false && !isOwner(ctx.sender)) return;

  if (!AI || !AI.ultimateAI) {
    await safeReply(sock, ctx.remoteJid, '⚠️ AI service unavailable. Try again later.');
    return;
  }

  try {
    await sock.sendPresenceUpdate('composing', ctx.remoteJid);
    const response = await AI.ultimateAI(query, ctx.sender, 'deepseek');
    await sock.sendPresenceUpdate('paused', ctx.remoteJid);

    if (response && response.text) {
      await safeReply(sock, ctx.remoteJid, response.text);
    }
  } catch (e) {
    console.error('[handleAIQuery] AI error:', e.message);
    await safeReply(sock, ctx.remoteJid, '❌ AI processing failed. Please try again.');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILT-IN COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

registerCommand('ping', async (sock, msg, ctx, parsed) => {
  const start = Date.now();
  await safeReply(sock, ctx.remoteJid, '🏓 Pong!');
  await safeReply(sock, ctx.remoteJid, `⏱️ Latency: ${Date.now() - start}ms`);
}, { description: 'Check bot responsiveness' });

registerCommand('help', async (sock, msg, ctx, parsed) => {
  const commands = Array.from(commandRegistry.entries())
    .map(([name, entry]) => `• *${name}* — ${entry.meta.description || 'No description'}`)
    .join('\n');
  await safeReply(sock, ctx.remoteJid, `🦊 *Maureonix Help*\n\n${commands}\n\n_Type any message to chat with AI._`);
}, { description: 'Show available commands' });

registerCommand('status', async (sock, msg, ctx, parsed) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const status = `🦊 *Maureonix Status*\n\n⏱ Uptime: ${hours}h ${minutes}m\n💾 Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB\n🟢 Connected: ${sock.ws?.readyState === 1 ? 'Yes' : 'No'}\n🔒 Private Mode: ${global.privateMode ? 'ON' : 'OFF'}\n🔓 Public: ${global.public ? 'ON' : 'OFF'}`;
  await safeReply(sock, ctx.remoteJid, status);
}, { description: 'Show bot status' });

registerCommand('private', async (sock, msg, ctx, parsed) => {
  if (!isOwner(ctx.sender)) {
    return safeReply(sock, ctx.remoteJid, '❌ Owner only.');
  }
  const newState = global.togglePrivateMode();
  await safeReply(sock, ctx.remoteJid, newState 
    ? '🔒 *Private Mode ON* — Only private chats.' 
    : '🔓 *Private Mode OFF* — All chats.'
  );
}, { description: 'Toggle private mode (owner only)' });

registerCommand('public', async (sock, msg, ctx, parsed) => {
  if (!isOwner(ctx.sender)) {
    return safeReply(sock, ctx.remoteJid, '❌ Owner only.');
  }
  global.public = !global.public;
  await safeReply(sock, ctx.remoteJid, global.public 
    ? '🔓 *Public Mode ON* — Everyone can use.' 
    : '🔒 *Public Mode OFF* — Owner only.'
  );
}, { description: 'Toggle public mode (owner only)' });

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-LOAD EXTERNAL COMMAND MODULES
// ═══════════════════════════════════════════════════════════════════════════════
function loadExternalCommands() {
  const cmdDirs = ['./commands', './lib/commands', './src/commands', './plugins'];
  for (const dir of cmdDirs) {
    const fullPath = path.resolve(dir);
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.js'));
      for (const file of files) {
        try {
          const mod = require(path.join(fullPath, file));
          if (mod && typeof mod === 'object') {
            for (const [cmdName, handler] of Object.entries(mod)) {
              if (typeof handler === 'function' && !commandRegistry.has(cmdName.toLowerCase())) {
                registerCommand(cmdName, handler, { description: `From ${file}` });
              }
            }
          }
          console.log(`[maureonix_core] Loaded commands from ${file}`);
        } catch (e) {
          console.error(`[maureonix_core] Failed to load ${file}:`, e.message);
        }
      }
    }
  }
}
loadExternalCommands();

module.exports = coreHandler;
