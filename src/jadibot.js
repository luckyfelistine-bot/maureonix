require('../settings');
const fs = require('fs');
const pino = require('pino');
const path = require('path');
const { Boom } = require('@hapi/boom');
const NodeCache = require('node-cache');
const { exec } = require('child_process');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser, makeCacheableSignalKeyStore, fetchLatestWaWebVersion } = require('baileys');

const { GroupParticipantsUpdate, MessagesUpsert, Solving } = require('./message');

// Store active bot instances
global.client = global.client || {};
const msgRetryCounterCache = new NodeCache();

async function JadiBot(conn, from, m, store) {
    // Ensure global database is accessible
    if (!global.db) global.db = { users: {}, groups: {}, game: {}, set: {}, premium: [] };
    if (!global.db.set) global.db.set = {};

    // If an active session already exists for this user, return it
    if (global.client[from] && global.client[from].user) {
        return global.client[from];
    }

    async function startJadiBot() {
        try {
            const authFolder = path.join(process.cwd(), 'jadibot_sessions', from.split('@')[0]);
            if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder, { recursive: true });

            const { state, saveCreds } = await useMultiFileAuthState(authFolder);
            const { version } = await fetchLatestWaWebVersion();
            const level = pino({ level: 'silent' });

            const getMessage = async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id);
                    return msg?.message || '';
                }
                return { conversation: 'Hello, I am Maureonix' };
            };

            global.client[from] = makeWASocket({
                version,
                logger: level,
                getMessage,
                syncFullHistory: false,
                maxMsgRetryCount: 15,
                msgRetryCounterCache,
                retryRequestDelayMs: 250,
                defaultQueryTimeoutMs: 60000,
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 25000,
                browser: ['Ubuntu', 'Chrome', '20.0.0'],
                transactionOpts: {
                    maxCommitRetries: 10,
                    delayBetweenTriesMs: 250,
                },
                appStateMacVerification: {
                    patch: true,
                    snapshot: true,
                },
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, level),
                },
            });

            await Solving(global.client[from], store);
            // Forward unhandled errors to main bot owner
            global.client[from].ev.on('unhandledRejection', async (reason, promise) => {
                console.error(`[JadiBot ${from}] Unhandled Rejection:`, reason);
                const ownerJid = global.owner?.[0] + '@s.whatsapp.net';
                if (ownerJid) {
                    await conn.sendMessage(ownerJid, {
                        text: `⚠️ *JadiBot Error*\n👤 User: @${from.split('@')[0]}\n❌ ${String(reason).slice(0, 500)}`,
                        mentions: [from]
                    }).catch(() => {});
                }
            });

            global.client[from].ev.on('uncaughtException', async (err) => {
                console.error(`[JadiBot ${from}] Uncaught Exception:`, err);
                const ownerJid = global.owner?.[0] + '@s.whatsapp.net';
                if (ownerJid) {
                    await conn.sendMessage(ownerJid, {
                        text: `🔥 *JadiBot Crash*\n👤 User: @${from.split('@')[0]}\n❌ ${err.message}`,
                        mentions: [from]
                    }).catch(() => {});
                }
            });

            let pairingStarted = false;

            global.client[from].ev.on('creds.update', saveCreds);

            global.client[from].ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, receivedPendingNotifications } = update;

                // Request pairing code if not registered
                if (connection === 'connecting' && !global.client[from].authState.creds.registered && !pairingStarted) {
                    pairingStarted = true;
                    setTimeout(async () => {
                        try {
                            const phoneNumber = from.split('@')[0].replace(/[^0-9]/g, '');
                            const code = await global.client[from].requestPairingCode(phoneNumber);
                            const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
                            await m.reply(`📲 *Your Pairing Code:* ${formatted}\n\n_Enter this in WhatsApp > Linked Devices > Link with phone number._`);
                        } catch (e) {
                            await m.reply(`❌ Failed to get pairing code: ${e.message}`);
                        }
                    }, 3000);
                }

                if (connection === 'close') {
                    delete global.client[from];
                    const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    console.log(`[JadiBot ${from}] Disconnected: ${reason}`);
                    // Notify owner of unexpected disconnections
                    if (reason !== DisconnectReason.connectionClosed && reason !== DisconnectReason.connectionLost) {
                        const ownerJid = global.owner?.[0] + '@s.whatsapp.net';
                        if (ownerJid) {
                            await conn.sendMessage(ownerJid, {
                                text: `🔌 *JadiBot Disconnected*\n👤 @${from.split('@')[0]}\n⚠️ Reason: ${reason}`,
                                mentions: [from]
                            }).catch(() => {});
                        }
                    }
                    // ... the rest of the existing reconnect logic (do not change anything below) ...    

                    if ([DisconnectReason.connectionLost, DisconnectReason.connectionClosed, DisconnectReason.restartRequired, DisconnectReason.timedOut, DisconnectReason.badSession, DisconnectReason.connectionReplaced].includes(reason)) {
                        // Reconnect
                        setTimeout(() => JadiBot(conn, from, m, store), 5000);
                    } else if (reason === DisconnectReason.loggedOut) {
                        await m.reply('❌ Session logged out. Please pair again with .pair');
                        StopJadiBot(conn, from, m);
                    } else if (reason === DisconnectReason.multideviceMismatch) {
                        await m.reply('❌ Multi-device mismatch. Please pair again.');
                        StopJadiBot(conn, from, m);
                    } else {
                        await m.reply('❌ Bot disconnected.');
                        StopJadiBot(conn, from, m);
                    }
                }

                if (connection === 'open') {
                    const botNumber = await global.client[from].decodeJid(global.client[from].user.id);
                    console.log(`[JadiBot ${from}] Connected as ${botNumber}`);

                    // Initialize settings for this bot number if not exists
                    if (!global.db.set[botNumber]) {
                        global.db.set[botNumber] = {
                            public: true,
                            autostatus: false,
                            autoread: true,
                            autotyping: true,
                            owner: [from] // The user is the owner of their own bot
                        };
                    }

                    // Auto-join channel if configured
                    if (global.my?.ch && global.my.ch.includes('@newsletter')) {
                        await global.client[from].newsletterMsg(global.my.ch, { type: 'follow' }).catch(() => {});
                    }

                    await global.client[from].sendMessage(from, { text: '✅ *Your personal bot is now active!*\n\nType .help for commands.\nType .stopjadibot to stop.' });
                }

                if (receivedPendingNotifications == 'true') {
                    global.client[from].ev.flush();
                }
            });

            global.client[from].ev.on('contacts.update', (update) => {
                for (let contact of update) {
                    if (!contact.id) continue;
                    let trueJid;
                    if (contact.id.endsWith('@lid')) {
                        trueJid = global.client[from].findJidByLid?.(contact.id, store);
                    } else {
                        trueJid = jidNormalizedUser(contact.id);
                    }
                    if (!trueJid) continue;
                    if (!store.contacts) store.contacts = {};
                    store.contacts[trueJid] = {
                        ...store.contacts[trueJid],
                        id: trueJid,
                        name: contact.notify
                    };
                    if (contact.id.endsWith('@lid')) {
                        store.contacts[trueJid].lid = jidNormalizedUser(contact.id);
                    }
                }
            });

            global.client[from].ev.on('call', async (call) => {
                const botNumber = await global.client[from].decodeJid(global.client[from].user.id);
                if (global.db.set[botNumber]?.anticall) {
                    for (let id of call) {
                        if (id.status === 'offer') {
                            await global.client[from].sendMessage(id.from, {
                                text: `📵 Cannot receive ${id.isVideo ? 'video' : 'voice'} calls.\n@${id.from.split('@')[0]} Contact owner for help.`,
                                mentions: [id.from]
                            });
                            await global.client[from].rejectCall(id.id, id.from);
                        }
                    }
                }
            });

            global.client[from].ev.on('groups.update', (update) => {
                for (let n of update) {
                    if (!store.groupMetadata) store.groupMetadata = {};
                    if (store.groupMetadata[n.id]) {
                        Object.assign(store.groupMetadata[n.id], n);
                    } else {
                        store.groupMetadata[n.id] = n;
                    }
                }
            });

            global.client[from].ev.on('group-participants.update', async (update) => {
                await GroupParticipantsUpdate(global.client[from], update, store);
            });

            global.client[from].ev.on('messages.upsert', async (message) => {
                await MessagesUpsert(global.client[from], message, store);
            });

            return global.client[from];
        } catch (e) {
            console.error('[JadiBot Error]', e);
            await m.reply(`❌ Failed to start bot: ${e.message}`);
            throw e;
        }
    }

    return startJadiBot();
}

async function StopJadiBot(conn, from, m) {
    if (!global.client[from]) {
        return m?.reply ? m.reply('❌ No active bot session found.') : null;
    }
    try {
        global.client[from].ws?.close();
        global.client[from].ev.removeAllListeners();
    } catch (e) {
        console.error('[StopJadiBot Error]', e);
    }
    delete global.client[from];

    // Clean up auth folder
    const authFolder = path.join(process.cwd(), 'jadibot_sessions', from.split('@')[0]);
    try {
        const { rmSync } = require('fs');
        rmSync(authFolder, { recursive: true, force: true });
    } catch {}

    if (m?.reply) await m.reply('🛑 Bot stopped. Session cleared.');
    return true;
}

async function ListJadiBot(conn, m) {
    const active = Object.keys(global.client).filter(k => global.client[k]?.user);
    if (active.length === 0) {
        return m.reply('📭 No active Jadibot sessions.');
    }
    let teks = '🤖 *Active Jadibot Sessions*\n\n';
    for (let jid of active) {
        const user = global.client[jid].user;
        teks += `• @${jid.split('@')[0]} (${user?.name || user?.id || 'Unknown'})\n`;
    }
    await m.reply(teks, { mentions: active });
}

module.exports = { JadiBot, StopJadiBot, ListJadiBot, activeBots: global.client };