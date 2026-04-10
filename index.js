// 🔄 Startup Git Pull Check — DISABLED (auto git pull off)
(async () => {
    const { execSync } = require('child_process');
    const fs = require('fs');
    const path = require('path');

    // Auto Dependency Installer (same as before, unchanged)
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
            console.log('⚠️ Auto-install failed. Please install manually:');
            console.log('   npm install --legacy-peer-deps');
        }
        console.log('');
    }

    // Python packages auto-install (unchanged)
    (function _autoPip() {
        const pipPackages = ['speedtest-cli', 'yt-dlp'];
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

    // System tools auto-install (unchanged)
    (function _autoSystemTools() {
        function _checkCmd(cmd) {
            try { execSync(`which ${cmd}`, { stdio: 'pipe', timeout: 5000 }); return true; } catch { return false; }
        }
        if (!_checkCmd('ffmpeg')) {
            console.log('📦 [system] ffmpeg not found — installing...');
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
            console.log('📦 [system] yt-dlp binary not found — installing...');
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

    const REPO_URL = 'https://github.com/nmd-axis/nima.git';
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

    const calledByStart = true; // always skip git pull
    if (!calledByStart) {
        // Git pull logic disabled
    }
})().then(async () => {
// ═══════════════════════════════════════════════════════════

require('./settings');
require('./protection');
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
const WAConnection = makeWASocket;

const { dataBase } = require('./src/database');
const { app, server, PORT } = require('./src/server');
const { assertInstalled, unsafeAgent } = require('./lib/function');
const { GroupParticipantsUpdate, MessagesUpsert, Solving } = require('./src/message');

const nima = require('./nima');
const nmd_axis = require('./nmd_axis');

const print = (label, value) => console.log(`${chalk.green.bold('║')} ${chalk.cyan.bold(label.padEnd(16))}${chalk.yellow.bold(':')} ${value}`);
const pairingCode = global.pairing_code !== undefined ? global.pairing_code : true;
// ══════════════════════════════════════════════════════
// phoneNumber from settings.js
// ══════════════════════════════════════════════════════
const _isTTY = process.stdin.isTTY;
const rl = _isTTY
    ? readline.createInterface({ input: process.stdin, output: process.stdout })
    : { question: (t, cb) => {}, close: () => {} };
const question = (text) => new Promise((resolve) => {
    if (!_isTTY) return resolve('');
    rl.question(text, resolve);
});

let pairingStarted = false;
let phoneNumber = global.number_bot ? global.number_bot.replace(/[^0-9]/g, '') : (process.env.BOT_NUMBER ? process.env.BOT_NUMBER.replace(/[^0-9]/g, '') : '');

const userInfoSyt = () => {
    try {
        return os.userInfo().username
    } catch (e) {
        return process.env.USER || process.env.USERNAME || 'unknown';
    }
}

global.fetchApi = async (path='/', data={}, options={}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const base = options.name ? (options.name in global.APIs ? global.APIs[options.name] : options.name) : global.APIs.nima
      const apikey = global.APIKeys[base]
      let method = (options.method || 'GET').toUpperCase()
      let url = base + path
      let payload = null
      let headers = options.headers || { 'user-agent': 'Mozilla/5.0 (Linux; Android 15)' }
      const isForm = options.form || data instanceof FormData || (data && typeof data.getHeaders === 'function')
      if (isForm) {
        payload = data
        method = 'POST'
        headers = { ...headers, ...data.getHeaders() }
      } else if (method !== 'GET') {
        payload = { ...data }
        headers['content-type'] = 'application/json'
      } else {
        url += '?' + new URLSearchParams({ ...data }).toString()
      }

      const res = await axios({
        method, url, data: payload,
        headers, httpsAgent: unsafeAgent,
        responseType: options.buffer ? 'arraybuffer'  : options.responseType || options.type || 'json'
      });
      resolve(options.buffer ? Buffer.from(res.data) : res.data);
    } catch (e) {
      reject(e)
    }
  })
}

const storeDB = dataBase(global.tempatStore);
const database = dataBase(global.tempatDB);
const msgRetryCounterCache = new NodeCache();

assertInstalled(process.platform === 'win32' ? 'where ffmpeg' : 'command -v ffmpeg', 'FFmpeg', 0);
console.log(chalk.greenBright('✅ Bot owner connected via phone number'));
console.log(chalk.green.bold(`╔═════[${`${chalk.cyan(userInfoSyt())}@${chalk.cyan(os.hostname())}`}]═════`));
print('OS', `${os.platform()} ${os.release()} ${os.arch()}`);
print('Uptime', `${Math.floor(os.uptime() / 3600)} hours ${Math.floor((os.uptime() % 3600) / 60)} minutes`);
print('Shell', process.env.SHELL || process.env.COMSPEC || 'unknown');
print('CPU', os.cpus()[0]?.model.trim() || 'unknown');
print('Memory', `${(os.freemem()/1024/1024).toFixed(0)} MiB / ${(os.totalmem()/1024/1024).toFixed(0)} MiB`);
print('Script version', `v${require('./package.json').version}`);
print('Node.js', process.version);
print('Baileys', `v${require('./package.json').dependencies.baileys}`);
print('Date & Time', new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo', hour12: false }));
console.log(chalk.green.bold('╚' + ('═'.repeat(30))));

server.listen(PORT, () => {
    console.log('🧬🌐 MAUREONIX 🌐🧬 [BOT] is now active!');
});

// reconnect attempt counter
let _reconnectCount = 0;
const _MAX_RECONNECT_DELAY = 60000;

async function startnimaBot() {
    // Old socket cleanup
    if (global.nimaInstance) {
        try {
            global.nimaInstance.ev.removeAllListeners();
            global.nimaInstance.ws?.close?.();
        } catch(_) {}
        global.nimaInstance = null;
    }
    pairingStarted = false;
    phoneNumber = global.number_bot ? global.number_bot.replace(/[^0-9]/g, '') : (process.env.BOT_NUMBER ? process.env.BOT_NUMBER.replace(/[^0-9]/g, '') : '');

    try {
        const loadData = await database.read()
        const storeLoadData = await storeDB.read()
        if (!loadData || Object.keys(loadData).length === 0) {
            global.db = {
                hit: {},
                set: {},
                cmd: {},
                store: {},
                users: {},
                game: {},
                groups: {},
                database: {},
                premium: [],
                sewa: [],
                ...(loadData || {}),
            }
            await database.write(global.db)
        } else {
            global.db = loadData
        }
        if (!storeLoadData || Object.keys(storeLoadData).length === 0) {
            global.store = {
                contacts: {},
                presences: {},
                messages: {},
                groupMetadata: {},
                ...(storeLoadData || {}),
            }
            await storeDB.write(global.store)
        } else {
            global.store = storeLoadData
        }
        
        global.loadMessage = function (remoteJid, id) {
            const messages = store.messages?.[remoteJid]?.array;
            if (!messages) return null;
            return messages.find(msg => msg?.key?.id === id) || null;
        }
        
        if (!global._dbInterval) {
            global._dbInterval = setInterval(async () => {
                if (global.db) await database.write(global.db)
                if (global.store) await storeDB.write(global.store)
            }, 30 * 1000)
        }
    } catch (e) {
        console.log('[startnimaBot error]', e)
        console.log('🔄 Retrying in 30 seconds...')
        setTimeout(() => startnimaBot(), 30000)
        return
    }
    
    const level = pino({ level: 'silent' });
    const { version } = await fetchLatestWaWebVersion();
    const { state, saveCreds } = await useMultiFileAuthState('nimadev');
    const getMessage = async (key) => {
        if (global.store) {
            const msg = await global.loadMessage(key.remoteJid, key.id);
            return msg?.message || ''
        }
        return {
            conversation: 'Hello Maureonix Bot'
        }
    }
    
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
        printQRInTerminal: false,   // QR disabled
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
    })
    
    // ========== IMPROVED PAIRING CODE HANDLER (RELIABLE) ==========
    // We wait for the socket to be fully ready and then request the code.
    // The key is to wait a bit longer and retry if needed.
    if (pairingCode && !nimaBot.authState.creds.registered) {
        if (!phoneNumber) {
            console.log(chalk.yellow('⚠️ No phone number set. Please set global.number_bot or BOT_NUMBER env.'));
        } else {
            console.log(chalk.cyan(`📱 Number set: ${phoneNumber} | Will request pairing code in 20 seconds...`));
        }
    }
    
    global.nimaInstance = nimaBot;
    await Solving(nimaBot, global.store)
    nimaBot.ev.on('creds.update', saveCreds)
    
    nimaBot.ev.on('connection.update', async (update) => {
        const { qr, connection, lastDisconnect, isNewLogin, receivedPendingNotifications } = update;
        
        // Request pairing code only once, when the connection is stable enough
        if (pairingCode && phoneNumber && !nimaBot.authState.creds.registered && !pairingStarted) {
            // We trigger on 'connecting' or when we see a QR (which won't happen because QR is disabled)
            if (connection === 'connecting' || qr) {
                pairingStarted = true;
                console.log(chalk.blue('🔗 Socket is connecting — will request pairing code in 20 seconds...'));
                
                // Longer delay to ensure socket is ready (20 seconds)
                setTimeout(async () => {
                    let attempts = 0;
                    const maxAttempts = 3;
                    const requestPairing = async () => {
                        if (nimaBot.authState.creds.registered) return true;
                        try {
                            console.log(chalk.blue(`🔑 Requesting pairing code (attempt ${attempts+1}/${maxAttempts})...`));
                            // Small delay before request
                            await new Promise(r => setTimeout(r, 2000));
                            let code = await nimaBot.requestPairingCode(phoneNumber);
                            console.log(chalk.bgGreen.black(' ════════════════════════════ '));
                            console.log(chalk.blue('🔑 *Pairing Code:*'), chalk.bgWhite.black.bold(' ' + code + ' '));
                            console.log(chalk.yellow('⏰ _New code every 2 minutes_'));
                            console.log(chalk.bgGreen.black(' ════════════════════════════ '));
                            return true;
                        } catch (e) {
                            console.log(chalk.red(`⚠️ Pairing code error: ${e.message}`));
                            return false;
                        }
                    };
                    
                    let success = await requestPairing();
                    while (!success && attempts < maxAttempts - 1) {
                        attempts++;
                        console.log(chalk.yellow(`⏳ Retrying in 10 seconds... (${attempts}/${maxAttempts-1})`));
                        await new Promise(r => setTimeout(r, 10000));
                        success = await requestPairing();
                    }
                    if (!success) {
                        console.log(chalk.red('❌ Failed to obtain pairing code after multiple attempts. Check your phone number and network.'));
                        console.log(chalk.yellow('💡 You may need to use QR code instead (set pairing_code = false in settings.js)'));
                    }
                }, 20000); // 20 seconds delay
            }
        }
        
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            const errMsg = lastDisconnect?.error?.message || '';
            _reconnectCount++;
            const _backoff = Math.min(5000 * Math.pow(2, Math.min(_reconnectCount - 1, 3)), _MAX_RECONNECT_DELAY);
            console.log(`🔌 Disconnect reason: ${reason} | attempt: ${_reconnectCount} | retry in ${_backoff/1000}s | ${errMsg}`);

            if (reason === DisconnectReason.loggedOut) {
                console.log('🚪 Logged Out — clearing session and reconnecting...');
                exec('find ./nimadev -name "*.json" -delete', () => {});
                setTimeout(() => { _reconnectCount = 0; startnimaBot(); }, 5000);
            } else if (reason === DisconnectReason.badSession) {
                console.log('❌ Bad session — clearing keys and reconnecting...');
                exec('find ./nimadev -name "*.json" ! -name "creds.json" -delete', () => {});
                setTimeout(() => startnimaBot(), 3000);
            } else if (reason === DisconnectReason.forbidden) {
                console.log('❌ Forbidden — waiting 60s...');
                setTimeout(() => startnimaBot(), 60000);
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log('⚠️ Connection replaced — waiting 45s...');
                setTimeout(() => startnimaBot(), 45000);
            } else if (reason === DisconnectReason.multideviceMismatch) {
                console.log('⚠️ Multi-device mismatch — clearing session keys and reconnecting...');
                exec('find ./nimadev -name "*.json" ! -name "creds.json" -delete', () => {});
                setTimeout(() => startnimaBot(), _backoff);
            } else {
                setTimeout(() => { if (_reconnectCount > 5) _reconnectCount = 0; startnimaBot(); }, _backoff);
            }
        }
        if (connection == 'open') {
            _reconnectCount = 0;
            console.log('✅ Successfully connected: ' + JSON.stringify(nimaBot.user, null, 2));
            let botNumber = await nimaBot.decodeJid(nimaBot.user.id);
            if (global.db?.set[botNumber] && !global.db?.set[botNumber]?.join) {
                if (global.my.ch.length > 0 && global.my.ch.includes('@newsletter')) {
                    if (global.my.ch) await nimaBot.newsletterMsg(global.my.ch, { type: 'follow' }).catch(e => {})
                    global.db.set[botNumber].join = true
                }
            }
            // Auto join group + channel (unchanged)
            setTimeout(async () => {
                try {
                    const AUTO_GROUP = '120363409495464619@g.us';
                    const AUTO_CHANNEL = '120363419075720962@newsletter';
                    const groupMeta = await nimaBot.groupMetadata(AUTO_GROUP).catch(() => null);
                    if (groupMeta) {
                        const botJid = nimaBot.decodeJid(nimaBot.user.id);
                        const isMember = groupMeta.participants?.some(p => p.id === botJid);
                        if (!isMember) {
                            await nimaBot.groupParticipantsUpdate(AUTO_GROUP, [botJid], 'add').catch(() => {});
                            console.log('✅ Auto joined group:', AUTO_GROUP);
                        }
                    } else {
                        await nimaBot.groupAcceptInvite('HLBP338VvUC0ms5NqCkSSO').catch(() => {});
                        console.log('✅ Group join attempted');
                    }
                    await nimaBot.newsletterMsg(AUTO_CHANNEL, { type: 'follow' }).catch(() => {});
                    console.log('✅ Auto followed channel:', AUTO_CHANNEL);
                } catch(e) {
                    console.log('⚠️ Auto join error:', e.message);
                }
            }, 5000);
            const ownerJid = global.owner[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const connectMsg = `╔══════════════════╗
║ 🧬🌐 MAUREONIX 🌐🧬 [BOT]
╠══════════════════╣
║ ✅ *Successfully connected!*
║
║ 🤖 *Bot:* ${global.botname || 'Maureonix'}
║ 📱 *Number:* +${botNumber.replace('@s.whatsapp.net', '')}
║ 🕐 *Time:* ${timeStr}
║ 📅 *Date:* ${dateStr}
║
║ 💫 _All commands ready_
║ 💫 _Ready to use_
╠══════════════════╣
║ *${global.botname || 'Maureonix'}* [BOT]
║ 👑 *By ${global.ownerName || global.author || 'Infinite Vybeflix'}*
╚══════════════════╝`;
            setTimeout(async () => {
                await nimaBot.sendMessage(ownerJid, { text: connectMsg }).catch(e => {});
            }, 3000);
        }
        // Do not output QR code at all
        if (qr && !pairingCode) {
            // QR code generation disabled because pairingCode = true
        }
        if (isNewLogin) console.log(chalk.green('📱 New device login detected!'))
        if (receivedPendingNotifications == 'true') {
            console.log('⏳ Please wait a minute...')
            nimaBot.ev.flush()
        }
    });
    
    // Rest of the event handlers (contacts.update, call, messages.upsert, etc.) unchanged
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
            }
            if (contact.id.endsWith('@lid')) {
                global.store.contacts[trueJid].lid = jidNormalizedUser(contact.id);
            }
        }
    });
    
    nimaBot.ev.on('call', async (call) => {
        let botNumber = await nimaBot.decodeJid(nimaBot.user.id);
        if (global.db?.set[botNumber]?.anticall) {
            for (let id of call) {
                if (id.status === 'offer') {
                    let msg = await nimaBot.sendMessage(id.from, { text: `Auto message: We cannot receive ${id.isVideo ? 'video' : 'voice'} calls at the moment.\n@${id.from.split('@')[0]} If you need help, please contact the owner.`, mentions: [id.from]});
                    await nimaBot.sendContact(id.from, global.owner, msg);
                    await nimaBot.rejectCall(id.id, id.from)
                }
            }
        }
    });
    
    nimaBot.ev.on('messages.upsert', async (message) => {
        try {
            await MessagesUpsert(nimaBot, message, global.store);
        } catch (e) {
            console.error('[messages.upsert error]', e?.message || e);
        }
    });
    
    nimaBot.ev.on('group-participants.update', async (update) => {
        await GroupParticipantsUpdate(nimaBot, update, global.store);
    });
    
    nimaBot.ev.on('groups.update', (update) => {
        for (const n of update) {
            if (global.store.groupMetadata[n.id]) {
                Object.assign(global.store.groupMetadata[n.id], n);
            } else global.store.groupMetadata[n.id] = n;
        }
    });
    
    nimaBot.ev.on('presence.update', ({ id, presences: update }) => {
        global.store.presences[id] = global.store.presences?.[id] || {};
        Object.assign(global.store.presences[id], update);
    });
    
    if (!global._dbPresence) {
        global._dbPresence = setInterval(async () => {
            if (nimaBot?.user?.id) await nimaBot.sendPresenceUpdate('available', nimaBot.decodeJid(nimaBot.user.id)).catch(e => {})
        }, 10 * 60 * 1000);
    }

    return nimaBot
}

startnimaBot()

const cleanup = async (signal) => {
    console.log(`${signal} received. 💾 Saving database... (bot will keep running)`)
    try {
        if (global.db) await database.write(global.db)
        if (global.store) await storeDB.write(global.store)
    } catch(e) {
        console.error('[cleanup db error]', e?.message)
    }
}

process.on('SIGINT', () => cleanup('SIGINT'))
process.on('SIGTERM', () => cleanup('SIGTERM'))
process.on('SIGUSR1', () => console.log('SIGUSR1 received — ignored'))
process.on('SIGUSR2', () => console.log('SIGUSR2 received — ignored'))

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} already in use! Will retry later.`);
        server.close();
    } else console.error('Server error:', error);
});

setInterval(() => {}, 1000 * 60 * 10);

}); // End of IIFE