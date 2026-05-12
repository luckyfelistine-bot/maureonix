const path = require('path');
const fs = require('fs');
const { PAIR_WINDOW_MS, PAIR_MAX_ATTEMPTS } = require('../config/constants');

const pairAttempts = new Map();
const activePairingSockets = new Map(); // cleanNumber -> socket metadata

function checkPairRateLimit(ip) {
  const now = Date.now();
  const attempts = pairAttempts.get(ip) || [];
  const recent = attempts.filter(t => now - t < PAIR_WINDOW_MS);
  pairAttempts.set(ip, recent);
  return recent.length < PAIR_MAX_ATTEMPTS;
}

function recordPairAttempt(ip) {
  const attempts = pairAttempts.get(ip) || [];
  attempts.push(Date.now());
  pairAttempts.set(ip, attempts);
}

/**
 * Clean up a pairing socket and optionally its session directory.
 */
function cleanupPairingSocket(number, deleteSession = false) {
  const info = activePairingSockets.get(number);
  if (!info) return;

  try { info.sock?.ev?.removeAllListeners(); } catch (_) {}
  try { info.sock?.ws?.close(); } catch (_) {}

  if (deleteSession && info.sessionDir) {
    try { fs.rmSync(info.sessionDir, { recursive: true, force: true }); } catch (_) {}
  }

  activePairingSockets.delete(number);
}

/**
 * Generate a pairing code for a phone number.
 * The socket stays alive in the background so the user can enter the code
 * and complete WhatsApp registration.
 */
async function generatePairCode(number) {
  const { default: makeWASocket, useMultiFileAuthState, fetchLatestWaWebVersion, makeCacheableSignalKeyStore } = require('baileys');
  const pino = require('pino');

  const cleanNumber = number.replace(/[^0-9]/g, '');
  if (cleanNumber.length < 9) {
    throw new Error('Invalid phone number. Include country code.');
  }

  // If we already have an active pairing for this number, return the existing code.
  const existing = activePairingSockets.get(cleanNumber);
  if (existing && existing.code) {
    return { code: existing.code, number: cleanNumber, status: 'pending' };
  }

  // Tear down any previous stale socket for this number.
  if (existing) {
    cleanupPairingSocket(cleanNumber, true);
  }

  // Use a persistent session directory so auth state survives.
  const sessionDir = path.join(process.cwd(), 'pair_sessions', cleanNumber);
  fs.mkdirSync(sessionDir, { recursive: true });

  const logger = pino({ level: 'silent' });
  let pairingStarted = false;

  // Promise that resolves as soon as the code string is obtained.
  let resolveCode = null;
  let rejectCode = null;
  const codePromise = new Promise((resolve, reject) => {
    resolveCode = resolve;
    rejectCode = reject;
  });

  // Hard safety net: if we cannot get a code within 30s, abort.
  const codeTimeout = setTimeout(() => {
    if (rejectCode) {
      rejectCode(new Error('Pairing code generation timed out.'));
      cleanupPairingSocket(cleanNumber, true);
    }
  }, 30_000);

  try {
    const { version } = await fetchLatestWaWebVersion().catch(() => ({ version: [2, 3000, 1017531287] }));
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      browser: ['Ubuntu', 'Chrome', '20.0.0'], // Proven browser signature from jadibot.js
      connectTimeoutMs: 60_000,
      defaultQueryTimeoutMs: 60_000,
      keepAliveIntervalMs: 25_000,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
    });

    // CRITICAL: persist credentials exactly like the working implementations.
    sock.ev.on('creds.update', saveCreds);

    const socketInfo = {
      sock,
      sessionDir,
      code: null,
      status: 'connecting',
      createdAt: Date.now(),
      connectedAt: null,
    };
    activePairingSockets.set(cleanNumber, socketInfo);

    // Connection lifecycle handler.
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        socketInfo.status = 'closed';

        // If we haven't resolved the code promise yet, reject it.
        if (rejectCode) {
          clearTimeout(codeTimeout);
          let message = 'Connection closed by WhatsApp.';
          if (statusCode === 401) message = 'Phone number not registered on WhatsApp.';
          else if (statusCode === 403) message = 'Access denied. Try again later.';
          else if (lastDisconnect?.error?.message) message = lastDisconnect.error.message;
          rejectCode(new Error(message));
          resolveCode = null;
          rejectCode = null;
        }

        // Schedule cleanup of closed sessions after 60s to allow client polling.
        setTimeout(() => cleanupPairingSocket(cleanNumber, true), 60_000);
        return;
      }

      if (connection === 'open') {
        socketInfo.status = 'connected';
        socketInfo.connectedAt = Date.now();
        console.log(`[PAIR] Socket connected for ${cleanNumber}`);
        // Do NOT destroy the socket here. The session is now active and usable.
      }

      // Request pairing code DURING the connecting phase — exactly like index.js / jadibot.js.
      if (connection === 'connecting' && !sock.authState.creds.registered && !pairingStarted) {
        pairingStarted = true;
        setTimeout(async () => {
          try {
            const code = await sock.requestPairingCode(cleanNumber);
            const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
            socketInfo.code = formatted;

            clearTimeout(codeTimeout);
            if (resolveCode) {
              resolveCode({ code: formatted, number: cleanNumber, status: 'pending' });
              resolveCode = null;
              rejectCode = null;
            }
          } catch (err) {
            clearTimeout(codeTimeout);
            if (rejectCode) {
              rejectCode(err);
              resolveCode = null;
              rejectCode = null;
            }
            cleanupPairingSocket(cleanNumber, true);
          }
        }, 3000);
      }
    });

    // Auto-purge sockets that never finish pairing after 5 minutes.
    setTimeout(() => {
      const current = activePairingSockets.get(cleanNumber);
      if (current && current.status === 'connecting') {
        console.log(`[PAIR] Cleaning up stale pairing socket for ${cleanNumber}`);
        cleanupPairingSocket(cleanNumber, true);
      }
    }, 5 * 60_000);

    return codePromise;
  } catch (err) {
    clearTimeout(codeTimeout);
    cleanupPairingSocket(cleanNumber, true);
    throw new Error(err?.message || 'Failed to initialize pairing.');
  }
}

/**
 * Return a snapshot of active pairing sessions (useful for admin/status routes).
 */
function getActivePairingSessions() {
  return Array.from(activePairingSockets.entries()).map(([number, info]) => ({
    number,
    status: info.status,
    code: info.code,
    createdAt: info.createdAt,
    connectedAt: info.connectedAt,
  }));
}

module.exports = {
  checkPairRateLimit,
  recordPairAttempt,
  generatePairCode,
  pairAttempts,
  activePairingSockets,
  getActivePairingSessions,
  cleanupPairingSocket,
};
