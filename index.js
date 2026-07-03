// index.js — Maureonix WhatsApp Bot Entry Point
// NO circular dependencies. All modules loaded cleanly.

require('./settings');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { Boom } = require('@hapi/boom');
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeInMemoryStore, getContentType } = require('@whiskeysockets/baileys');
const pino = require('pino');

// ═══════════════════════════════════════════════════════════════════════════════
// STORE SETUP
// ═══════════════════════════════════════════════════════════════════════════════

const store = makeInMemoryStore({ logger: pino({ level: 'silent' }) });

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE LOADING (safe order, no circular deps)
// ═══════════════════════════════════════════════════════════════════════════════

// Load message handlers FIRST — they define LoadDataBase and SaveDataBase
const { MessagesUpsert, GroupParticipantsUpdate, Solving, LoadDataBase, SaveDataBase } = require('./src/message');

// Load core processor — it receives LoadDataBase/SaveDataBase as params
const { coreHandler, smsg, getBuffer, getGroupAdmins, getRandom, start, success, close } = require('./maureonix_core');

// Load nima (if available — optional)
let nima;
try { nima = require('./nima'); } catch (e) { nima = null; }

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE SETUP
// ═══════════════════════════════════════════════════════════════════════════════

const Database = require('./lib/database');
const db = new Database(path.join(__dirname, 'database.json'));

global.db = db;
global._databaseInstance = db;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CONNECTION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'session'));
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(chalk.green(`Using Baileys v${version.join('.')}, isLatest: ${isLatest}`));

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: true,
            auth: state,
            browser: ['Maureonix', 'Chrome', '1.0.0'],
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            markOnlineOnConnect: true,
            keepAliveIntervalMs: 30000,
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id);
                    return msg?.message || undefined;
                }
                return undefined;
            },
        });

        // Bind store to socket
        store.bind(sock.ev);
        sock.ev.on('creds.update', saveCreds);

        // Initialize store (from src/message.js Solving)
        await Solving(sock, store);

        // ── Connection Update ──
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log(chalk.yellow('QR Code received, scan to connect'));
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom)
                    ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
                    : true;
                console.log(chalk.red('Connection closed due to:'), lastDisconnect?.error?.message || 'Unknown');
                console.log(chalk.yellow('Reconnecting...'));
                if (shouldReconnect) {
                    setTimeout(connectToWhatsApp, 5000);
                } else {
                    console.log(chalk.red('Logged out. Please delete session folder and restart.'));
                    process.exit(0);
                }
            } else if (connection === 'open') {
                console.log(chalk.green('✅ Connected to WhatsApp!'));
                console.log(chalk.cyan('Bot Number:'), sock.decodeJid(sock.user.id));
                console.log(chalk.cyan('Name:'), sock.user.name || 'Unknown');

                // Send startup message to owner if configured
                if (global.owner && global.owner[0]) {
                    try {
                        const ownerJid = global.owner[0][0] + '@s.whatsapp.net';
                        await sock.sendMessage(ownerJid, {
                            text: `🤖 *Maureonix is online!*\n\n⏰ Time: ${new Date().toLocaleString()}\n📱 Number: ${sock.decodeJid(sock.user.id)}\n👤 Name: ${sock.user.name || 'Unknown'}`,
                        });
                    } catch (e) {
                        console.log(chalk.yellow('[Startup] Could not send owner notification'));
                    }
                }
            }
        });

        // ── Messages Upsert ──
        sock.ev.on('messages.upsert', async (message) => {
            try {
                // First: route through MessagesUpsert for dedup, store, DB init
                await MessagesUpsert(sock, message, store);

                // Second: process each message through coreHandler
                if (message.messages && Array.isArray(message.messages)) {
                    for (const msg of message.messages) {
                        if (!msg || msg.key?.fromMe) continue;
                        if (msg.key?.remoteJid === 'status@broadcast') continue;

                        // Convert to smsg format
                        const m = smsg(sock, msg, store);
                        if (!m) continue;

                        // Pass LoadDataBase and SaveDataBase as options to avoid circular deps
                        await coreHandler(sock, m, store, { LoadDataBase, SaveDataBase });
                    }
                }
            } catch (e) {
                console.error(chalk.red('[messages.upsert] Error:'), e.message);
                console.error(e.stack);
            }
        });

        // ── Group Participants Update ──
        sock.ev.on('group-participants.update', async (update) => {
            try {
                await GroupParticipantsUpdate(sock, update, store);
            } catch (e) {
                console.error(chalk.red('[group-participants.update] Error:'), e.message);
            }
        });

        // ── Group Update ──
        sock.ev.on('groups.update', async (updates) => {
            try {
                for (const update of updates) {
                    console.log(chalk.cyan('[Group Update]'), update.id, update);
                }
            } catch (e) {
                console.error(chalk.red('[groups.update] Error:'), e.message);
            }
        });

        // ── Presence Update ──
        sock.ev.on('presence.update', async (update) => {
            try {
                if (store && store.presences) {
                    if (!store.presences[update.id]) store.presences[update.id] = {};
                    Object.assign(store.presences[update.id], update.presences);
                }
            } catch (e) {
                console.error(chalk.red('[presence.update] Error:'), e.message);
            }
        });

        // ── Call (reject all calls) ──
        sock.ev.on('call', async (callEv) => {
            try {
                for (const call of callEv) {
                    if (call.status === 'offer') {
                        console.log(chalk.yellow('[Call] Rejecting call from:'), call.from);
                        await sock.rejectCall(call.id, call.from);
                    }
                }
            } catch (e) {
                console.error(chalk.red('[call] Error:'), e.message);
            }
        });

        // ── Message Delete (anti-delete) ──
        sock.ev.on('messages.delete', async (item) => {
            try {
                if (item.keys && Array.isArray(item.keys)) {
                    for (const key of item.keys) {
                        console.log(chalk.yellow('[Delete] Message deleted:'), key.id);
                        // Anti-delete logic: if antidelete is enabled, notify group
                        if (key.remoteJid && global.db?.groups?.[key.remoteJid]?.antidelete) {
                            const deletedMsg = store?.messages?.[key.remoteJid]?.array?.find(m => m.key.id === key.id);
                            if (deletedMsg) {
                                await sock.sendMessage(key.remoteJid, {
                                    text: `⚠️ *Anti-Delete Alert*\n\nSomeone deleted a message!\n\n👤 Sender: ${deletedMsg.key.participant || deletedMsg.key.remoteJid}\n📝 Content: ${deletedMsg.message?.conversation || deletedMsg.message?.extendedTextMessage?.text || '(media)'}`,
                                });
                            }
                        }
                    }
                }
            } catch (e) {
                console.error(chalk.red('[messages.delete] Error:'), e.message);
            }
        });

        // ── Message Update (edit detection) ──
        sock.ev.on('messages.update', async (updates) => {
            try {
                for (const update of updates) {
                    console.log(chalk.cyan('[Message Update]'), update.key.id, update.update);
                }
            } catch (e) {
                console.error(chalk.red('[messages.update] Error:'), e.message);
            }
        });

        // ── Receipts ──
        sock.ev.on('message-receipt.update', async (updates) => {
            try {
                for (const update of updates) {
                    console.log(chalk.gray('[Receipt]'), update.key.id, update.receipt);
                }
            } catch (e) {
                console.error(chalk.red('[message-receipt.update] Error:'), e.message);
            }
        });

        // ── History sync ──
        sock.ev.on('messaging-history.set', async ({ chats, contacts, messages, isLatest }) => {
            try {
                console.log(chalk.cyan(`[History Sync] ${chats.length} chats, ${contacts.length} contacts, ${messages.length} messages. isLatest: ${isLatest}`));
            } catch (e) {
                console.error(chalk.red('[messaging-history.set] Error:'), e.message);
            }
        });

        // ── Chats sync ──
        sock.ev.on('chats.upsert', async (chats) => {
            try {
                for (const chat of chats) {
                    if (store && store.chats) {
                        store.chats[chat.id] = chat;
                    }
                }
            } catch (e) {
                console.error(chalk.red('[chats.upsert] Error:'), e.message);
            }
        });

        sock.ev.on('chats.update', async (updates) => {
            try {
                for (const update of updates) {
                    if (store && store.chats && store.chats[update.id]) {
                        Object.assign(store.chats[update.id], update);
                    }
                }
            } catch (e) {
                console.error(chalk.red('[chats.update] Error:'), e.message);
            }
        });

        sock.ev.on('chats.delete', async (deletions) => {
            try {
                for (const id of deletions) {
                    if (store && store.chats) {
                        delete store.chats[id];
                    }
                }
            } catch (e) {
                console.error(chalk.red('[chats.delete] Error:'), e.message);
            }
        });

        // ── Contacts sync ──
        sock.ev.on('contacts.upsert', async (contacts) => {
            try {
                for (const contact of contacts) {
                    if (store && store.contacts) {
                        store.contacts[contact.id] = contact;
                    }
                }
            } catch (e) {
                console.error(chalk.red('[contacts.upsert] Error:'), e.message);
            }
        });

        sock.ev.on('contacts.update', async (updates) => {
            try {
                for (const update of updates) {
                    if (store && store.contacts && store.contacts[update.id]) {
                        Object.assign(store.contacts[update.id], update);
                    }
                }
            } catch (e) {
                console.error(chalk.red('[contacts.update] Error:'), e.message);
            }
        });

        // ── Nima integration (if available) ──
        if (nima && typeof nima === 'function') {
            try {
                await nima(sock, store, { LoadDataBase, SaveDataBase });
            } catch (e) {
                console.log(chalk.yellow('[Nima] Optional module not loaded:'), e.message);
            }
        }

        return sock;

    } catch (e) {
        console.error(chalk.red('[connectToWhatsApp] Fatal error:'), e.message);
        console.error(e.stack);
        setTimeout(connectToWhatsApp, 10000);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════════════════════════════

console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🤖  Maureonix WhatsApp Bot                                ║
║   Developed by Infinite Vybeflix                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`));

connectToWhatsApp();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n[Shutdown] Saving database...'));
    try { await SaveDataBase(); } catch (e) {}
    console.log(chalk.yellow('[Shutdown] Goodbye!'));
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log(chalk.yellow('\n[Shutdown] Saving database...'));
    try { await SaveDataBase(); } catch (e) {}
    console.log(chalk.yellow('[Shutdown] Goodbye!'));
    process.exit(0);
});

// Uncaught exception handler
process.on('uncaughtException', (err) => {
    console.error(chalk.red('[Uncaught Exception]'), err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('[Unhandled Rejection]'), reason);
});
