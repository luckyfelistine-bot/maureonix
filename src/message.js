// src/message.js — Maureonix Message Handler
// Exports: MessagesUpsert, GroupParticipantsUpdate, Solving, LoadDataBase, SaveDataBase
const processedMessages = new Set();
const MESSAGE_DEDUP_WINDOW = 60000;

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE HELPERS — defined here to avoid circular dependency issues
// These were previously in maureonix_core.js but moved here to break the cycle
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Load or initialize user/group database entries
 * @param {Object} sock - Baileys socket instance
 * @param {Object} m - Message object
 */
async function LoadDataBase(sock, m) {
    try {
        if (!global.db) {
            global.db = {
                users: {},
                groups: {},
                game: {},
                set: {},
                premium: [],
                sewa: [],
                hit: {},
                cmd: {},
                store: {},
                database: {},
                jadibot: { sessions: {}, requests: {} }
            };
        }

        const botNumber = sock.decodeJid(sock.user.id);
        const sender = m.sender || m.key?.participant || m.key?.remoteJid || '';
        const chat = m.chat || m.key?.remoteJid || '';

        // Initialize user entry
        if (sender && !global.db.users[sender]) {
            global.db.users[sender] = {
                name: m.pushName || '',
                limit: global.limit?.free || 20,
                premium: false,
                vip: false,
                ban: false,
                afkTime: -1,
                afkReason: '',
                msgCount: 0,
                lastMsg: Date.now()
            };
        }

        // Update user activity
        if (sender && global.db.users[sender]) {
            global.db.users[sender].msgCount = (global.db.users[sender].msgCount || 0) + 1;
            global.db.users[sender].lastMsg = Date.now();
        }

        // Initialize group entry
        if (chat.endsWith('@g.us') && !global.db.groups[chat]) {
            global.db.groups[chat] = {
                name: m.metadata?.subject || '',
                mute: false,
                antihidetag: false,
                antitagsw: false,
                antitoxic: false,
                antidelete: false,
                antilink: false,
                antivirtex: false,
                tagsw: {},
                welcome: false,
                goodbye: false,
                nsfw: false
            };
        }

        // Initialize bot settings
        if (!global.db.set[botNumber]) {
            global.db.set[botNumber] = {
                owner: [],
                author: global.author || 'Infinite Vybeflix',
                packname: global.packname || 'Maureonix',
                botname: global.botname || 'Maureonix',
                multiprefix: false,
                grouponly: false,
                privateonly: false,
                autoread: false,
                autostatus: false,
                autostatusreact: false,
                autoreactmention: false,
                autoreplymention: false,
                autotyping: false,
                autodownload: false,
                autoforward: false,
                autosticker: false,
                autodelete: 0,
                autoreact: false,
                antispam: false,
                autobackup: false,
                status: 0,
                privatemode: 'off',
                awaymsg: 'I am not available right now.',
                pendingMessages: [],
                ownerMirror: false,
                autoai: false,
                crisisScope: 'all',
                aiCrisisVerification: true
            };
        }

        // Initialize game entries
        if (!global.db.game) global.db.game = {};
        if (!global.db.game.chat_ai) global.db.game.chat_ai = {};
        if (!global.db.game.gemini_autoreply) global.db.game.gemini_autoreply = {};
        if (!global.db.game.gemini_history) global.db.game.gemini_history = {};
        if (!global.db.game.menfes) global.db.game.menfes = {};
        if (!global.db.game.blackjack) global.db.game.blackjack = {};
        if (!global.db.game.wordle) global.db.game.wordle = {};
        if (!global.db.game.hangman) global.db.game.hangman = {};
        if (!global.db.game.rpg) global.db.game.rpg = {};
        if (!global.db.game.connect4) global.db.game.connect4 = {};
        if (!global.db.game.suit) global.db.game.suit = {};
        if (!global.db.game.chess) global.db.game.chess = {};
        if (!global.db.game.ulartangga) global.db.game.ulartangga = {};

    } catch (e) {
        console.error('[LoadDataBase] Error:', e.message);
    }
}

/**
 * Save database to persistent storage
 */
async function SaveDataBase() {
    try {
        if (global.db && global._databaseInstance) {
            await global._databaseInstance.write(global.db);
        }
    } catch (e) {
        console.error('[SaveDataBase] Error:', e.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MessagesUpsert — Main message entry point
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
            const dedupKey = `${msg.key.id}-${remoteJid}`;
            if (processedMessages.has(dedupKey)) {
                console.log(`[MessagesUpsert] Skipping duplicate: ${dedupKey}`);
                continue;
            }
            processedMessages.add(dedupKey);
            if (processedMessages.size > 1000) {
                const entries = Array.from(processedMessages).slice(-500);
                processedMessages.clear();
                entries.forEach(e => processedMessages.add(e));
            }
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

            // Load database for this message
            try {
                await LoadDataBase(sock, msg);
            } catch (dbErr) {
                console.error('[MessagesUpsert] LoadDataBase error:', dbErr.message);
            }

            // Route to command handler if available (lazy-loaded to avoid circular deps)
            try {
                const maureonix = require('../maureonix');
                if (maureonix && typeof maureonix === 'function') {
                    await maureonix(sock, msg, ctx);
                } else if (maureonix && typeof maureonix.default === 'function') {
                    await maureonix.default(sock, msg, ctx);
                } else if (maureonix && typeof maureonix.cmdHandler === 'function') {
                    await maureonix.cmdHandler(sock, msg, ctx);
                }
            } catch (cmdErr) {
                // Only log if it's not a "module not found" error
                if (cmdErr.code !== 'MODULE_NOT_FOUND') {
                    console.error('[MessagesUpsert] Command handler error:', cmdErr.message);
                }
            }
        }
    } catch (e) {
        console.error('[MessagesUpsert] Fatal error:', e.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GroupParticipantsUpdate — Handle group member changes
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
// Solving — Pre-connection setup and store initialization
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
// Helpers
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
// EXPORTS — MUST be functions for index.js destructuring to work
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    MessagesUpsert,
    GroupParticipantsUpdate,
    Solving,
    LoadDataBase,
    SaveDataBase,
};
