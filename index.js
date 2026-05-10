// Polyfill crypto.randomUUID for Node < 19
const crypto = require('crypto');
if (!crypto.randomUUID) {
    crypto.randomUUID = () => 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
}

const SecureConfig = require('./config');
for (const [key, value] of Object.entries(SecureConfig)) {
    if (typeof value === 'string' && !process.env[key]) process.env[key] = value;
}

const cron = require('node-cron');
// ── Daily & Weekly reports from the new email engine ──
const { sendDailyReport, sendWeeklyReport } = require('./lib/emailReports');

cron.schedule(SecureConfig.reportDailyTime, async () => {
    console.log('[CRON] Daily report');
    await sendDailyReport();
}, { timezone: 'Africa/Nairobi' });

cron.schedule(SecureConfig.reportWeeklyTime, async () => {
    console.log('[CRON] Weekly report');
    await sendWeeklyReport();
}, { timezone: 'Africa/Nairobi' });

// ═══════════════════════════════════════════════════════
//  AUTO‑INSTALL & SYSTEM PREP
// ═══════════════════════════════════════════════════════
(async () => {
    const { execSync } = require('child_process');
    const fs = require('fs');
    const path = require('path');

    function _detectPackageManager() {
        try { execSync('yarn --version', { stdio: 'pipe', timeout: 5000 }); return 'yarn'; } catch {}
        try { execSync('npm --version',  { stdio: 'pipe', timeout: 5000 }); return 'npm';  } catch {}
        try { execSync('pnpm --version', { stdio: 'pipe', timeout: 5000 }); return 'pnpm'; } catch {}
        return 'npm';
    }

    function _needsInstall() {
        const pkgPath = path.join(__dirname, 'package.json');
        if (!fs.existsSync(pkgPath)) return false;
        const nmPath = path.join(__dirname, 'node_modules');
        if (!fs.existsSync(nmPath)) return true;
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
            for (const dep of deps) if (!fs.existsSync(path.join(nmPath, dep))) return true;
        } catch {}
        return false;
    }

    function _runInstall(pm) {
        const commands = {
            npm:  ['npm install --legacy-peer-deps --no-audit --prefer-offline', 'npm install --force --no-audit', 'npm install --legacy-peer-deps'],
            yarn: ['yarn install --ignore-engines --network-timeout 100000', 'yarn install --ignore-engines', 'yarn install'],
            pnpm: ['pnpm install --shamefully-hoist', 'pnpm install'],
        };
        for (const cmd of commands[pm] || commands['npm']) {
            try { execSync(cmd, { stdio: 'inherit', cwd: __dirname, timeout: 180000, shell: true }); console.log('✅ Dependencies installed'); return true; } catch (e) {}
        }
        return false;
    }

    if (_needsInstall()) { const pm = _detectPackageManager(); _runInstall(pm); }

    // pip packages
    (function _autoPip() {
        const pipPackages = ['speedtest-cli', 'yt-dlp'];
        function _getPipCmd() {
            for (const cmd of ['pip3', 'pip']) { try { execSync(`${cmd} --version`, { stdio: 'pipe' }); return cmd; } catch {} }
            return null;
        }
        const pip = _getPipCmd();
        if (!pip) return;
        for (const pkg of pipPackages) {
            try { execSync(`${pip} install ${pkg} --upgrade --break-system-packages -q`, { stdio: 'pipe', timeout: 120000 }); } catch {}
        }
    })();

    // system tools (ffmpeg, yt-dlp binary)
    (function _autoSystemTools() {
        function _checkCmd(cmd) { try { execSync(`which ${cmd}`, { stdio: 'pipe' }); return true; } catch { return false; } }
        if (!_checkCmd('ffmpeg')) {
            try { execSync('apt-get install -y ffmpeg', { stdio: 'pipe', timeout: 120000, shell: true }); } catch {}
        }
        if (!_checkCmd('yt-dlp')) {
            try { execSync('pip3 install yt-dlp --break-system-packages -q', { stdio: 'pipe', timeout: 120000, shell: true }); } catch {}
        }
    })();

})().then(async () => {

    require('./settings');
    require('./protection');

    if (!global.db) global.db = {};
    if (!global.db.set) global.db.set = {};
    if (!global.db.users) global.db.users = {};
    if (!global.db.groups) global.db.groups = {};
    if (!global.db.game) global.db.game = {};
    if (!global.db.premium) global.db.premium = [];
    if (!global.db.sewa) global.db.sewa = [];

    global.learningMode = {};
    global.learningEngines = {};

    const os = require('os');
    const pino = require('pino');
    const axios = require('axios');
    const chalk = require('chalk');
    const readline = require('readline');
    const { toBuffer } = require('qrcode');
    const { Boom } = require('@hapi/boom');
    const NodeCache = require('node-cache');
    const qrcode = require('qrcode-terminal');
    const { exec } = require('child_process');
    const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestWaWebVersion, jidNormalizedUser } = await import('baileys');

    const { dataBase } = require('./lib/database');
    const { app, server, PORT } = require('./src/server');
    const { assertInstalled, unsafeAgent } = require('./lib/function');
    const { GroupParticipantsUpdate, MessagesUpsert, Solving } = require('./src/message');

    const nima = require('./nima');
    global.__nimaHandler = nima;

    const pairingCode = true;
    let phoneNumber = process.env.BOT_NUMBER ? process.env.BOT_NUMBER.replace(/[^0-9]/g, '') : '254116903500';

    const storeDB = dataBase(global.tempatStore);
    const database = dataBase(global.tempatDB);
    const msgRetryCounterCache = new NodeCache();

    // ═══════════════════════════════════════════════════════
    //  SIMPLE RECONNECTION (no aggressive watchdog)
    // ═══════════════════════════════════════════════════════
    let _reconnectCount = 0;
    const _MAX_RECONNECT_DELAY = 60_000;

    async function startnimaBot() {
        if (global.nimaInstance) {
            try { global.nimaInstance.ev.removeAllListeners(); global.nimaInstance.ws?.close?.(); } catch(_) {}
            global.nimaInstance = null;
        }
        phoneNumber = global.number_bot || '254116903500';

        const loadData = await database.read();
        const storeLoadData = await storeDB.read();
        if (!loadData || Object.keys(loadData).length === 0) {
            global.db = { hit: {}, set: {}, cmd: {}, store: {}, users: {}, game: {}, groups: {}, database: {}, premium: [], sewa: [], ...(loadData || {}) };
            await database.write(global.db);
        } else global.db = loadData;

        if (global.store && global.store.messages) {
            for (const jid in global.store.messages) {
                const entry = global.store.messages[jid];
                if (entry.keyId && !(entry.keyId instanceof Set)) entry.keyId = new Set(Object.keys(entry.keyId));
                else if (!entry.keyId) entry.keyId = new Set();
                if (!entry.array) entry.array = [];
            }
        }

        global.db.set = global.db.set || {};
        global.db.users = global.db.users || {};
        global.db.groups = global.db.groups || {};
        global.db.premium = global.db.premium || [];
        global.db.sewa = global.db.sewa || [];
        global.db.hit = global.db.hit || {};
        global.db.cmd = global.db.cmd || {};
        global.db.game = global.db.game || {};
        global.db.store = global.db.store || {};
        global.db.jadibot = global.db.jadibot || { sessions: {}, requests: {} };

        global.store = storeLoadData || { contacts: {}, presences: {}, messages: {}, groupMetadata: {} };

        global.loadMessage = function (remoteJid, id) {
            const messages = store.messages?.[remoteJid]?.array;
            return messages?.find(msg => msg?.key?.id === id) || null;
        };

        if (!global._dbInterval) {
            global._dbInterval = setInterval(async () => {
                if (global.db) await database.write(global.db);
                if (global.store) await storeDB.write(global.store);
            }, 30_000);
        }

        const { LearningEngine } = require('./lib/learningEngine');
        global.learningEngine = new LearningEngine();
        const AI = require('./lib/ai');
        global.learningEngine.setAIChat(AI.groqChat);
        console.log('✅ Learning Engine initialized');

        const { loadDocs } = require('./lib/docs'); loadDocs();

        const level = pino({ level: 'silent' });
        const { version } = await fetchLatestWaWebVersion();
        const { state, saveCreds } = await useMultiFileAuthState('nimadev');

        const nimaBot = makeWASocket({
            version, logger: level,
            getMessage: async (key) => ((await global.loadMessage(key.remoteJid, key.id))?.message || ''),
            syncFullHistory: false,
            maxMsgRetryCount: 15,
            msgRetryCounterCache,
            retryRequestDelayMs: 250,
            defaultQueryTimeoutMs: 60_000,
            connectTimeoutMs: 60_000,
            keepAliveIntervalMs: 25_000,
            maxRetries: 20,
            printQRInTerminal: false,
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, level) },
        });

        global.nimaInstance = nimaBot;

        if (pairingCode && !nimaBot.authState.creds.registered) {
            const requestCode = async () => {
                if (nimaBot.authState.creds.registered) return;
                try {
                    let code = await nimaBot.requestPairingCode(phoneNumber);
                    console.log('🔑 Pairing Code:', code);
                } catch (e) { console.log('⚠️ Pair error:', e.message); }
            };
            setTimeout(() => {
                requestCode();
                const interval = setInterval(() => {
                    if (nimaBot.authState.creds.registered) { clearInterval(interval); return; }
                    requestCode();
                }, 115000);
            }, 3000);
        }

        await Solving(nimaBot, global.store);

        nimaBot.ev.on('creds.update', saveCreds);

        nimaBot.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                _reconnectCount++;
                const backoff = Math.min(5000 * Math.pow(2, Math.min(_reconnectCount - 1, 3)), _MAX_RECONNECT_DELAY);
                console.log(`🔌 Disconnect: ${reason} | retry in ${backoff / 1000}s`);
                setTimeout(() => startnimaBot(), backoff);
            }
            if (connection === 'open') {
                _reconnectCount = 0;
                console.log('✅ Connected');
            }
        });

        nimaBot.ev.on('messages.upsert', async (message) => {
            await MessagesUpsert(nimaBot, message, global.store);
        });

        // ── Follow configured channel so bot receives channel messages ──
        const config = require('./config');
        const followChannel = async (attempt = 1) => {
            if (!config.channelJid || !config.channelJid.endsWith('@newsletter')) return;
            
            // Wait for connection to be fully open before attempting follow
            if (nimaBot.ws?.readyState !== 1) { // 1 = WebSocket.OPEN
                if (attempt <= 5) {
                    setTimeout(() => followChannel(attempt + 1), 3000 * attempt);
                }
                return;
            }
            
            try {
                await nimaBot.newsletterFollow(config.channelJid);
                console.log('[CHANNEL] ✅ Following channel:', config.channelJid);
            } catch (e) {
                const msg = e.message || '';
                // These are all "already following" or timing errors — suppress them
                const expectedErrors = [
                    'Connection Closed',
                    'unexpected response structure',
                    'already followed',
                    'already a subscriber',
                    'not-authorized',
                    'item-not-found'
                ];
                const isExpected = expectedErrors.some(err => msg.includes(err));
                if (!isExpected) {
                    console.log('[CHANNEL] ⚠️ Follow error:', msg);
                } else if (attempt === 1) {
                    console.log('[CHANNEL] ℹ️ Already following channel:', config.channelJid);
                }
            }
        };
        
        // Delay follow until connection is stable
        setTimeout(() => followChannel(), 5000);

        // ── Route newsletter (channel) messages into the core handler ──
        // Channel messages arrive via messages.upsert with remoteJid ending in @newsletter
        nimaBot.ev.on('messages.upsert', async (message) => {
            if (message.type === 'notify') {
                for (const msg of message.messages) {
                    const remoteJid = msg.key?.remoteJid || '';
                    // Only route if it's a channel message
                    if (remoteJid.endsWith('@newsletter')) {
                        await MessagesUpsert(nimaBot, { messages: [msg], type: 'notify' }, global.store)
                            .catch(err => console.error('[newsletter msg]', err));
                    }
                }
            }
        });

        
        nimaBot.ev.on('group-participants.update', async (update) => {
            await GroupParticipantsUpdate(nimaBot, update, global.store);
        });

        nimaBot.ev.on('groups.update', (update) => {
            for (const n of update) {
                if (global.store.groupMetadata[n.id]) Object.assign(global.store.groupMetadata[n.id], n);
                else global.store.groupMetadata[n.id] = n;
            }
        });

        nimaBot.ev.on('presence.update', ({ id, presences: update }) => {
            global.store.presences[id] = global.store.presences?.[id] || {};
            Object.assign(global.store.presences[id], update);
        });

        return nimaBot;
    }

    startnimaBot();

    // ── Verify yt-dlp installation ──
    const { spawn } = require('child_process');

    const test = spawn('yt-dlp', ['--version']);

    test.stdout.on('data', d => console.log('✅ yt-dlp version:', d.toString().trim()));

    test.stderr.on('data', d => console.error('❌ yt-dlp error:', d.toString()));

    test.on('close', c => console.log('Exit code:', c));

    process.on('SIGINT', async () => {
        if (global.db) await database.write(global.db);
        if (global.store) await storeDB.write(global.store);
        process.exit(0);
    });
});
