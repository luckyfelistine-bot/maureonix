// src/message.js — Maureonix Message Handler
// Exports: MessagesUpsert, GroupParticipantsUpdate, Solving

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// ── Load core handler ──
let coreHandler = null;
try {
    coreHandler = require('../maureonix_core');
} catch (e) {
    console.error('[src/message.js] Failed to load maureonix_core:', e.message);
}

// ── Load command handler ──
let cmdHandler = null;
try {
    cmdHandler = require('../maureonix');
} catch (e) {
    console.error('[src/message.js] Failed to load maureonix:', e.message);
}

// ═══════════════════════════════════════════════════════════════════════════════
//   MessagesUpsert — Main message entry point
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Handle incoming WhatsApp messages (including channel/newsletter)
 * @param {Object} sock - Baileys socket instance
 * @param {Object} message - messages.upsert event payload
 * @param {Object} store - Global message store
 */
async function MessagesUpsert(sock, message, store) {
    try {
        // Validate inputs
        if (!sock || !message || !message.messages || !Array.isArray(message.messages)) {
            return;
        }

        for (const msg of message.messages) {
            if (!msg || !msg.key) continue;

            const remoteJid = msg.key.remoteJid || '';
            const fromMe = msg.key.fromMe || false;
            const id = msg.key.id || '';

            // Skip self-messages to prevent loops
            if (fromMe) continue;

            // Skip status messages
            if (remoteJid === 'status@broadcast') continue;

            // Build message context
            const ctx = {
                sock,
                msg,
                store,
                remoteJid,
                fromMe,
                id,
                isGroup: remoteJid.endsWith('@g.us'),
                isChannel: remoteJid.endsWith('@newsletter'),
                isPrivate: remoteJid.endsWith('@s.whatsapp.net'),
                sender: msg.key.participant || remoteJid,
                pushName: msg.pushName || '',
                messageType: Object.keys(msg.message || {})[0] || 'unknown',
                body: extractBody(msg),
                timestamp: msg.messageTimestamp || Date.now(),
            };

            // Update store
            if (store && store.messages) {
                if (!store.messages[remoteJid]) {
                    store.messages[remoteJid] = { array: [], keyId: new Set() };
                }
                if (!store.messages[remoteJid].keyId.has(id)) {
                    store.messages[remoteJid].array.push(msg);
                    store.messages[remoteJid].keyId.add(id);
                }
            }

            // Route to core handler if available
            if (coreHandler && typeof coreHandler === 'function') {
                try {
                    await coreHandler(sock, msg, ctx);
                } catch (handlerErr) {
                    console.error('[MessagesUpsert] Core handler error:', handlerErr.message);
                }
            }

            // Route to command handler if available
            if (cmdHandler && typeof cmdHandler === 'function') {
                try {
                    await cmdHandler(sock, msg, ctx);
                } catch (cmdErr) {
                    console.error('[MessagesUpsert] Command handler error:', cmdErr.message);
                }
            }
        }
    } catch (e) {
        console.error('[MessagesUpsert] Fatal error:', e.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   GroupParticipantsUpdate — Handle group member changes
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Handle group participant updates (join/leave/promote/demote)
 * @param {Object} sock - Baileys socket instance
 * @param {Object} update - group-participants.update event payload
 * @param {Object} store - Global message store
 */
async function GroupParticipantsUpdate(sock, update, store) {
    try {
        if (!sock || !update || !update.id) return;

        const { id, participants, action } = update;

        // Update store metadata
        if (store && store.groupMetadata && store.groupMetadata[id]) {
            // Refresh group metadata on participant changes
            try {
                const metadata = await sock.groupMetadata(id);
                store.groupMetadata[id] = metadata;
            } catch (e) {
                // Group might be left or unavailable
            }
        }

        // Log for debugging
        console.log(`[GroupParticipants] ${action}: ${participants?.join(', ')} in ${id}`);

    } catch (e) {
        console.error('[GroupParticipantsUpdate] Error:', e.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   Solving — Pre-connection setup and store initialization
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initialize store and bind event listeners before connection
 * @param {Object} sock - Baileys socket instance
 * @param {Object} store - Global message store
 */
async function Solving(sock, store) {
    try {
        if (!sock || !store) {
            console.warn('[Solving] Missing sock or store');
            return;
        }

        // Ensure store structure
        store.contacts = store.contacts || {};
        store.presences = store.presences || {};
        store.messages = store.messages || {};
        store.groupMetadata = store.groupMetadata || {};

        // Bind presence updates
        sock.ev.on('presence.update', ({ id, presences }) => {
            if (!store.presences[id]) store.presences[id] = {};
            Object.assign(store.presences[id], presences);
        });

        // Bind group metadata updates
        sock.ev.on('groups.update', (updates) => {
            for (const update of updates) {
                if (store.groupMetadata[update.id]) {
                    Object.assign(store.groupMetadata[update.id], update);
                } else {
                    store.groupMetadata[update.id] = update;
                }
            }
        });

        console.log(chalk.green('✅ [Solving] Store initialized and listeners bound'));

    } catch (e) {
        console.error('[Solving] Error:', e.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function extractBody(msg) {
    try {
        const m = msg.message || {};
        if (m.conversation) return m.conversation;
        if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
        if (m.imageMessage?.caption) return m.imageMessage.caption;
        if (m.videoMessage?.caption) return m.videoMessage.caption;
        if (m.documentMessage?.caption) return m.documentMessage.caption;
        if (m.buttonsResponseMessage?.selectedButtonId) return m.buttonsResponseMessage.selectedButtonId;
        if (m.listResponseMessage?.singleSelectReply?.selectedRowId) return m.listResponseMessage.singleSelectReply.selectedRowId;
        if (m.templateButtonReplyMessage?.selectedId) return m.templateButtonReplyMessage.selectedId;
        return '';
    } catch {
        return '';
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   EXPORTS — MUST be functions for index.js destructuring to work
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    MessagesUpsert,
    GroupParticipantsUpdate,
    Solving,
};
