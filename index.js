const SecureConfig = require('./config');

// Inject all SecureConfig properties into process.env (if not already set)
for (const [key, value] of Object.entries(SecureConfig)) {
    if (typeof value === 'string' && !process.env[key]) {
        process.env[key] = value;
    }
}

const cron = require('node-cron');
const { sendEmail } = require('./lib/emailService');
const { generateReport } = require('./lib/reporting');

// Schedule daily & weekly reports
cron.schedule(SecureConfig.reportDailyTime, async () => {
    console.log('[CRON] Daily report');
    const report = await generateReport('daily', global.db, require('./lib/ai'), null, null, null, null, null, 'owner');
    const ownerJid = SecureConfig.ownerNumber[0] + '@s.whatsapp.net';
    if (global.nimaInstance) await global.nimaInstance.sendMessage(ownerJid, { text: report.text }).catch(e=>console.error);
    await sendEmail(SecureConfig.emailRecipient, '📊 Maureonix Daily Report', report.text, report.attachment, report.filename);
}, { timezone: 'Africa/Nairobi' });

cron.schedule(SecureConfig.reportWeeklyTime, async () => {
    console.log('[CRON] Weekly report');
    const report = await generateReport('weekly', global.db, require('./lib/ai'), null, null, null, null, null, 'owner');
    const ownerJid = SecureConfig.ownerNumber[0] + '@s.whatsapp.net';
    if (global.nimaInstance) await global.nimaInstance.sendMessage(ownerJid, { text: report.text }).catch(e=>console.error);
    await sendEmail(SecureConfig.emailRecipient, '📊 Maureonix Weekly Report', report.text, report.attachment, report.filename);
}, { timezone: 'Africa/Nairobi' });

// 🔄 Startup Git Pull Check — DISABLED (auto git pull off)
// ═══════════════════════════════════════════════════════
(async () => {
    const { execSync } = require('child_process');
    const fs = require('fs');
    const path = require('path');

    // ═══════════════════════════════════════════════════════
    // 📦 Auto Dependency Installer
    // ═══════════════════════════════════════════════════════
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
            for (const dep of deps) {
                const depPath = path.join(nmPath, dep);
                if (!fs.existsSync(depPath)) {
                    console.log(`📦 Missing module detected: ${dep}`);
                    return true;
                }
            }
        } catch {}
        return false;
    }

    function _runInstall(pm) {
        const commands = {
            npm:  [
                'npm install --legacy-peer-deps --no-audit --prefer-offline',
                'npm install --force --no-audit',
                'npm install --legacy-peer-deps',
            ],
            yarn: [
                'yarn install --ignore-engines --network-timeout 100000',
                'yarn install --ignore-engines',
                'yarn install',
            ],
            pnpm: [
                'pnpm install --shamefully-hoist',
                'pnpm install',
            ],
        };

        const cmds = commands[pm] || commands['npm'];
        for (const cmd of cmds) {
            try {
                console.log(`📦 Running: ${cmd}`);
                execSync(cmd, { stdio: 'inherit', cwd: __dirname, timeout: 180000, shell: true });
                console.log('✅ Dependencies installed successfully!');
                return true;
            } catch (e) {
                console.log(`✗ ${cmd} — ${e.message?.substring(0, 80)}`);
            }
        }
        return false;
    }

    if (_needsInstall()) {
        console.log('\n📦 [Auto-Install] Installing dependencies...');
        const pm = _detectPackageManager();
        console.log(`📦 Package manager: ${pm}`);
        const ok = _runInstall(pm);
        if (!ok) {
            console.log('⚠️ Auto-install failed. Please run manually:');
            console.log('   npm install --legacy-peer-deps');
        }
        console.log('');
    }

    // ═══════════════════════════════════════════════════════
    // 🐍 Python Packages Auto-Install / Upgrade
    // ═══════════════════════════════════════════════════════
    (function _autoPip() {
        const pipPackages = [
            'speedtest-cli',
            'yt-dlp',
        ];

        function _getPipCmd() {
            const cmds = ['pip3', 'pip'];
            for (const cmd of cmds) {
                try { execSync(`${cmd} --version`, { stdio: 'pipe', timeout: 5000 }); return cmd; } catch {}
            }
            return null;
        }

        function _isPipPkgInstalled(pip, pkg) {
            try {
                execSync(`${pip} show ${pkg}`, { stdio: 'pipe', timeout: 10000 });
                return true;
            } catch { return false; }
        }

        const pip = _getPipCmd();
        if (!pip) { console.log('⚠️ pip not found — skipping Python packages'); return; }

        for (const pkg of pipPackages) {
            try {
                if (_isPipPkgInstalled(pip, pkg)) {
                    console.log(`🔄 [pip] Upgrading: ${pkg}`);
                    execSync(`${pip} install ${pkg} --upgrade --break-system-packages -q`, { stdio: 'pipe', timeout: 120000 });
                    console.log(`✅ [pip] ${pkg} upgraded`);
                } else {
                    console.log(`📦 [pip] Installing: ${pkg}`);
                    execSync(`${pip} install ${pkg} --break-system-packages -q`, { stdio: 'pipe', timeout: 120000 });
                    console.log(`✅ [pip] ${pkg} installed`);
                }
            } catch (e) {
                console.log(`⚠️ [pip] ${pkg} install/upgrade failed: ${e.message?.substring(0, 80)}`);
            }
        }
    })();

    // ═══════════════════════════════════════════════════════
    // 🔧 System Tools Auto-Install (ffmpeg, yt-dlp binary)
    // ═══════════════════════════════════════════════════════
    (function _autoSystemTools() {
        function _checkCmd(cmd) {
            try { execSync(`which ${cmd}`, { stdio: 'pipe', timeout: 5000 }); return true; } catch { return false; }
        }

        if (!_checkCmd('ffmpeg')) {
            console.log('📦 [system] ffmpeg not found — trying to install...');
            try {
                execSync('pkg install ffmpeg -y', { stdio: 'pipe', timeout: 120000, shell: true });
                console.log('✅ [system] ffmpeg installed');
            } catch {
                try {
                    execSync('apt-get install -y ffmpeg', { stdio: 'pipe', timeout: 120000, shell: true });
                    console.log('✅ [system] ffmpeg installed (apt)');
                } catch (e) {
                    console.log('⚠️ [system] ffmpeg auto-install failed — manual: pkg install ffmpeg');
                }
            }
        } else {
            console.log('✅ [system] ffmpeg OK');
        }

        if (!_checkCmd('yt-dlp')) {
            console.log('📦 [system] yt-dlp binary not found — trying to install...');
            try {
                execSync('pip3 install yt-dlp --break-system-packages -q', { stdio: 'pipe', timeout: 120000, shell: true });
                console.log('✅ [system] yt-dlp installed via pip3');
            } catch {
                try {
                    execSync('curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp', { stdio: 'pipe', timeout: 120000, shell: true });
                    console.log('✅ [system] yt-dlp installed via binary download');
                } catch (e) {
                    console.log('⚠️ [system] yt-dlp auto-install failed — manual: pip install yt-dlp');
                }
            }
        } else {
            console.log('🔄 [system] updating yt-dlp...');
            try {
                execSync('yt-dlp -U --no-color', { stdio: 'pipe', timeout: 60000 });
                console.log('✅ [system] yt-dlp up to date');
            } catch {
                try {
                    execSync('pip3 install yt-dlp --upgrade --break-system-packages -q', { stdio: 'pipe', timeout: 120000, shell: true });
                    console.log('✅ [system] yt-dlp upgraded via pip3');
                } catch (e) {
                    console.log('⚠️ [system] yt-dlp update failed — continuing with current version');
                }
            }
        }
    })();

    const REPO_URL = 'https://github.com/luckyfelistine-bot/maureonix';

    function _isGitRepo() {
        try { execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe', cwd: __dirname, timeout: 5000 }); return true; } catch { return false; }
    }
    function _getCurrentCommit() {
        try { return execSync('git rev-parse HEAD', { encoding: 'utf8', stdio: 'pipe', cwd: __dirname, timeout: 5000 }).trim(); } catch { return null; }
    }
    function _getRemoteCommit() {
        try {
            execSync('git fetch origin main --quiet', { stdio: 'pipe', cwd: __dirname, timeout: 30000 });
            return execSync('git rev-parse origin/main', { encoding: 'utf8', stdio: 'pipe', cwd: __dirname, timeout: 5000 }).trim();
        } catch { return null; }
    }

    // Auto git pull DISABLED — startup/runtime checks off
    const calledByStart = true; // always skip git pull
    if (!calledByStart) {
        // ... git pull logic (kept but unreachable)
    }
})().then(async () => {
// ═══════════════════════════════════════════════════════

require('./settings');
require('./protection');

// 🔒 Ensure database structure exists
if (!global.db) global.db = {};
if (!global.db.set) global.db.set = {};
if (!global.db.users) global.db.users = {};
if (!global.db.groups) global.db.groups = {};
if (!global.db.game) global.db.game = {};
if (!global.db.premium) global.db.premium = [];
if (!global.db.sewa) global.db.sewa = [];

// 🧠 Learning Mode (user‑specific interactive training)
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
const { parsePhoneNumber } = require('awesome-phonenumber');
const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestWaWebVersion, jidNormalizedUser } = await import('baileys');

const { dataBase } = require('./lib/database');
const { app, server, PORT } = require('./src/server');
const { assertInstalled, unsafeAgent } = require('./lib/function');
const { GroupParticipantsUpdate, MessagesUpsert, Solving } = require('./src/message');

const nima = require('./nima');
global.__nimaHandler = nima;

const print = (label, value) => console.log(`${chalk.green.bold('║')} ${chalk.cyan.bold(label.padEnd(16))}${chalk.yellow.bold(':')} ${value}`);
const pairingCode = true;

const _isTTY = process.stdin.isTTY;
const rl = _isTTY
    ? readline.createInterface({ input: process.stdin, output: process.stdout })
    : { question: (t, cb) => {}, close: () => {} };
const question = (text) => new Promise((resolve) => {
    if (!_isTTY) return resolve('');
    rl.question(text, resolve);
});

let pairingStarted = false;
let phoneNumber = process.env.BOT_NUMBER ? process.env.BOT_NUMBER.replace(/[^0-9]/g, '') : '254116903500';

const userInfoSyt = () => {
    try { return os.userInfo().username; } catch (e) { return process.env.USER || process.env.USERNAME || 'unknown'; }
};

global.fetchApi = async (path='/', data={}, options={}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const base = options.name ? (options.name in global.APIs ? global.APIs[options.name] : options.name) : global.APIs.nima;
            const apikey = global.APIKeys[base];
            let method = (options.method || 'GET').toUpperCase();
            let url = base + path;
            let payload = null;
            let headers = options.headers || { 'user-agent': 'Mozilla/5.0 (Linux; Android 15)' };
            const isForm = options.form || data instanceof FormData || (data && typeof data.getHeaders === 'function');
            if (isForm) {
                payload = data;
                method = 'POST';
                headers = { ...headers, ...data.getHeaders() };
            } else if (method !== 'GET') {
                payload = { ...data };
                headers['content-type'] = 'application/json';
            } else {
                url += '?' + new URLSearchParams({ ...data }).toString();
            }

            const res = await axios({
                method, url, data: payload,
                headers, httpsAgent: unsafeAgent,
                responseType: options.buffer ? 'arraybuffer'  : options.responseType || options.type || 'json'
            });
            resolve(options.buffer ? Buffer.from(res.data) : res.data);
        } catch (e) { reject(e); }
    });
};

const storeDB = dataBase(global.tempatStore);
const database = dataBase(global.tempatDB);
const msgRetryCounterCache = new NodeCache();

assertInstalled(process.platform === 'win32' ? 'where ffmpeg' : 'command -v ffmpeg', 'FFmpeg', 0);
console.log(chalk.greenBright('✅ Connected via owner\'s phone'));
console.log(chalk.green.bold(`╔═════[${`${chalk.cyan(userInfoSyt())}@${chalk.cyan(os.hostname())}`}]═════`));
print('OS', `${os.platform()} ${os.release()} ${os.arch()}`);
print('Uptime', `${Math.floor(os.uptime() / 3600)} hours ${Math.floor((os.uptime() % 3600) / 60)} minutes`);
print('Shell', process.env.SHELL || process.env.COMSPEC || 'unknown');
print('CPU', os.cpus()[0]?.model.trim() || 'unknown');
print('Memory', `${(os.freemem()/1024/1024).toFixed(0)} MiB / ${(os.totalmem()/1024/1024).toFixed(0)} MiB`);
print('Script version', `v${require('./package.json').version}`);
print('Node.js', process.version);
print('Baileys', `v${require('./package.json').dependencies.baileys}`);
print('Date & Time', new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi', hour12: false }));
console.log(chalk.green.bold('╚' + ('═'.repeat(30))));

if (!server.listening) {
    server.listen(PORT, () => { console.log('Maureonix [BOT] is now active!'); });
} else {
    console.log(`✅ Server already listening on port ${PORT}`);
}

// ═══════════════════════════════════════════════════════
//  SESSION HEALTH WATCHDOG
// ═══════════════════════════════════════════════════════
let decryptErrorCount = 0;
let lastDecryptErrorTime = 0;
const DECRYPT_ERROR_THRESHOLD = 10;     // consecutive decryption errors
const DECRYPT_ERROR_WINDOW = 30000;     // within 30 seconds
let lastMessageTime = Date.now();
let healthCheckInterval = null;

function resetHealthCounters() {
    decryptErrorCount = 0;
    lastDecryptErrorTime = 0;
    lastMessageTime = Date.now();
}

function recordDecryptError() {
    const now = Date.now();
    if (now - lastDecryptErrorTime > DECRYPT_ERROR_WINDOW) {
        decryptErrorCount = 0;
    }
    decryptErrorCount++;
    lastDecryptErrorTime = now;
    console.log(`⚠️ [watchdog] Decryption error ${decryptErrorCount}/${DECRYPT_ERROR_THRESHOLD}`);
    if (decryptErrorCount >= DECRYPT_ERROR_THRESHOLD) {
        console.log('⚠️ [watchdog] Too many decryption errors — forcing full session reset...');
        if (healthCheckInterval) clearInterval(healthCheckInterval);
        triggerSessionReset();
    }
}

function recordMessageReceived() {
    lastMessageTime = Date.now();
    // reset error count on successful message
    decryptErrorCount = 0;
}

function triggerSessionReset() {
    exec('find ./nimadev -name "*.json" -delete', () => {});
    global.nimaInstance?.ws?.close();
    setTimeout(() => startnimaBot(), 3000);
}

// Heartbeat: if no message for 2 minutes, force reconnect
healthCheckInterval = setInterval(() => {
    const idle = Date.now() - lastMessageTime;
    if (idle > 120000) {
        console.log('⚠️ [watchdog] No messages received for 2 minutes — reconnecting...');
        clearInterval(healthCheckInterval);
        triggerSessionReset();
    }
}, 30000);

// ═══════════════════════════════════════════════════════
//  START BOT FUNCTION
// ═══════════════════════════════════════════════════════
let _reconnectCount = 0;
const _MAX_RECONNECT_DELAY = 60000;

async function startnimaBot() {
    if (global.nimaInstance) {
        try {
            global.nimaInstance.ev.removeAllListeners();
            global.nimaInstance.ws?.close?.();
        } catch(_) {}
        global.nimaInstance = null;
    }
    pairingStarted = false;
    phoneNumber = global.number_bot || '254116903500';
    resetHealthCounters();

    try {
        const loadData = await database.read();
        const storeLoadData = await storeDB.read();
        if (!loadData || Object.keys(loadData).length === 0) {
            global.db = {
                hit: {}, set: {}, cmd: {}, store: {},
                users: {}, game: {}, groups: {}, database: {},
                premium: [], sewa: [],
                ...(loadData || {}),
            };
            await database.write(global.db);
        } else {
            global.db = loadData;
        }

        if (global.store && global.store.messages) {
            for (const jid in global.store.messages) {
                const entry = global.store.messages[jid];
                if (entry.keyId && !(entry.keyId instanceof Set)) {
                    entry.keyId = new Set(Object.keys(entry.keyId));
                } else if (!entry.keyId) {
                    entry.keyId = new Set();
                }
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

        if (!storeLoadData || Object.keys(storeLoadData).length === 0) {
            global.store = {
                contacts: {}, presences: {}, messages: {}, groupMetadata: {},
                ...(storeLoadData || {}),
            };
            await storeDB.write(global.store);
        } else {
            global.store = storeLoadData;
        }

        global.loadMessage = function (remoteJid, id) {
            const messages = store.messages?.[remoteJid]?.array;
            if (!messages) return null;
            return messages.find(msg => msg?.key?.id === id) || null;
        };

        if (!global._dbInterval) {
            global._dbInterval = setInterval(async () => {
                if (global.db) await database.write(global.db);
                if (global.store) await storeDB.write(global.store);
            }, 30 * 1000);
        }

        const { LearningEngine } = require('./lib/learningEngine');
        global.learningEngine = new LearningEngine();
        const AI = require('./lib/ai');
        global.learningEngine.setAIChat(AI.groqChat);
        console.log('✅ Learning Engine initialized and connected to AI.');

    } catch (e) {
        console.log('[startnimaBot error]', e);
        setTimeout(() => startnimaBot(), 30000);
        return;
    }

    const { loadDocs } = require('./lib/docs');
    loadDocs();

    const level = pino({ level: 'silent' });
    const { version } = await fetchLatestWaWebVersion();
    const { state, saveCreds } = await useMultiFileAuthState('nimadev');

    const getMessage = async (key) => {
        if (global.store) {
            const msg = await global.loadMessage(key.remoteJid, key.id);
            return msg?.message || '';
        }
        return { conversation: 'Hello Maureonix Bot' };
    };

    global.nimaInstance = null;
    const nimaBot = WAConnection({
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
        maxRetries: 20,
        GenerateHighQualityLinkPreview: false,
        markOnlineOnConnect: false,
        printQRInTerminal: false,
        transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 250 },
        appStateMacVerification: { patch: true, snapshot: true },
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, level),
        },
    });

    if (pairingCode && !nimaBot.authState.creds.registered) {
        phoneNumber = '254116903500';
        console.log(chalk.cyan('📱 Number set: ' + phoneNumber + ' | Ready for pair code...'));
    }

    global.nimaInstance = nimaBot;

    setInterval(async () => {
        if (nimaBot && nimaBot.authState?.creds?.registered) {
            try { await nimaBot.requestPreKeys?.(3); } catch(_) {}
        }
    }, 12 * 60 * 60 * 1000);

    await Solving(nimaBot, global.store);

    nimaBot.ev.on('creds.update', saveCreds);

    nimaBot.ev.on('connection.update', async (update) => {
        const { qr, connection, lastDisconnect, isNewLogin, receivedPendingNotifications } = update;
        if ((connection === 'connecting' || !!qr) && pairingCode && phoneNumber && !nimaBot.authState.creds.registered && !pairingStarted) {
            pairingStarted = true;
            const requestCode = async () => {
                if (nimaBot.authState.creds.registered) return;
                try {
                    let code = await nimaBot.requestPairingCode(phoneNumber);
                    console.log(chalk.bgGreen.black(' ════════════════════════════ '));
                    console.log(chalk.blue('🔑 *Pairing Code:*'), chalk.bgWhite.black.bold(' ' + code + ' '));
                    console.log(chalk.bgGreen.black(' ════════════════════════════ '));
                } catch(e) { console.log('⚠️ error:', e.message); }
            };
            setTimeout(async () => {
                await requestCode();
                const interval = setInterval(async () => {
                    if (nimaBot.authState.creds.registered) { clearInterval(interval); return; }
                    await requestCode();
                }, 115000);
            }, 3000);
        }
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            const errMsg = lastDisconnect?.error?.message || '';
            _reconnectCount++;
            const _backoff = Math.min(5000 * Math.pow(2, Math.min(_reconnectCount - 1, 3)), _MAX_RECONNECT_DELAY);
            console.log(`🔌 Disconnect reason: ${reason} | attempt: ${_reconnectCount} | retry in ${_backoff/1000}s | ${errMsg}`);

            if (errMsg.includes('closed session') || errMsg.includes('decrypt')) {
                recordDecryptError();
            }

            if (reason === DisconnectReason.loggedOut) {
                exec('find ./nimadev -name "*.json" -delete', () => {});
                setTimeout(() => { _reconnectCount = 0; startnimaBot(); }, 5000);
            } else if (reason === DisconnectReason.badSession) {
                exec('find ./nimadev -name "*.json" ! -name "creds.json" -delete', () => {});
                setTimeout(() => startnimaBot(), 3000);
            } else if (reason === DisconnectReason.forbidden) {
                setTimeout(() => startnimaBot(), 60000);
            } else if (reason === DisconnectReason.connectionReplaced) {
                setTimeout(() => startnimaBot(), 45000);
            } else if (reason === DisconnectReason.multideviceMismatch) {
                exec('find ./nimadev -name "*.json" ! -name "creds.json" -delete', () => {});
                setTimeout(() => startnimaBot(), _backoff);
            } else {
                setTimeout(() => { if (_reconnectCount > 5) _reconnectCount = 0; startnimaBot(); }, _backoff);
            }
        }
        if (connection == 'open') {
            _reconnectCount = 0;
            resetHealthCounters();
            try { await nimaBot.requestPreKeys?.(3); } catch(_) {}
            console.log('✅ Successfully connected');

            // Auto join group and channel
            setTimeout(async () => {
                try {
                    const AUTO_GROUP = global.my?.ch || '120363423838424989@g.us';
                    const AUTO_CHANNEL = SecureConfig.channelJid || '120363426431427396@newsletter';
                    const groupMeta = await nimaBot.groupMetadata(AUTO_GROUP).catch(() => null);
                    if (groupMeta) {
                        const botJid = nimaBot.decodeJid(nimaBot.user.id);
                        const isMember = groupMeta.participants?.some(p => p.id === botJid);
                        if (!isMember) {
                            await nimaBot.groupParticipantsUpdate(AUTO_GROUP, [botJid], 'add').catch(() => {});
                            console.log('✅ Auto joined group');
                        }
                    }
                    await nimaBot.newsletterMsg(AUTO_CHANNEL, { type: 'follow' }).catch(() => {});
                } catch(e) { console.log('⚠️ Auto join error:', e.message); }
            }, 5000);

            const ownerJid = SecureConfig.ownerNumber[0] + '@s.whatsapp.net';
            const connectMsg = `✅ Bot connected!`;
            setTimeout(async () => {
                await nimaBot.sendMessage(ownerJid, { text: connectMsg }).catch(e => {});
            }, 3000);
        }
        if (qr) {
            console.log(chalk.cyan('\n📱 QR Code (scan with WhatsApp):'));
            qrcode.generate(qr, { small: true });
            try { app._router.stack = app._router.stack.filter(r => r.regexp && !r.regexp.toString().includes('/qr')); } catch(e) {}
            app.get('/qr', async (req, res) => {
                res.setHeader('content-type', 'image/png');
                res.end(await toBuffer(qr));
            });
        }
    });

    nimaBot.ev.on('contacts.update', (update) => {
        for (let contact of update) {
            if (!contact.id) continue;
            let trueJid;
            if (contact.id.endsWith('@lid')) {
                trueJid = nimaBot.findJidByLid(jidNormalizedUser(contact.id), global.store);
            } else {
                trueJid = jidNormalizedUser(contact.id);
            }
            if (!trueJid) continue;
            global.store.contacts[trueJid] = {
                ...global.store.contacts[trueJid],
                id: trueJid,
                name: contact.notify
            };
        }
    });

    nimaBot.ev.on('call', async (call) => {
        let botNumber = await nimaBot.decodeJid(nimaBot.user.id);
        if (global.db?.set[botNumber]?.anticall) {
            for (let id of call) {
                if (id.status === 'offer') {
                    await nimaBot.sendMessage(id.from, { text: `Cannot receive calls.` });
                    await nimaBot.rejectCall(id.id, id.from);
                }
            }
        }
    });

    nimaBot.ev.on('messages.upsert', async (message) => {
        recordMessageReceived();   // <-- important for watchdog
        try {
            await MessagesUpsert(nimaBot, message, global.store);
        } catch (e) {
            console.error('[messages.upsert error]', e?.message || e);
            if (e?.message?.includes('closed session') || e?.message?.includes('decrypt')) {
                recordDecryptError();
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

    if (!global._dbPresence) {
        global._dbPresence = setInterval(async () => {
            if (nimaBot?.user?.id) await nimaBot.sendPresenceUpdate('available', nimaBot.decodeJid(nimaBot.user.id)).catch(e => {});
        }, 10 * 60 * 1000);
    }

    return nimaBot;
}

startnimaBot();

const cleanup = async (signal) => {
    console.log(`${signal} received. Saving database...`);
    try {
        if (global.db) await database.write(global.db);
        if (global.store) await storeDB.write(global.store);
    } catch(e) {}
};

process.on('SIGINT', () => cleanup('SIGINT'));
process.on('SIGTERM', () => cleanup('SIGTERM'));

process.on('uncaughtException', (err) => console.error('🔥', err));
process.on('unhandledRejection', (reason, promise) => console.error('⚠️', reason));

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') console.log(`Port ${PORT} in use`);
});

setInterval(() => {}, 1000 * 60 * 10);

}); // end of startup IIFE