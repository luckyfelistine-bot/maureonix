const path = require('path');
const fs = require('fs');
const os = require('os');
const { PAIR_WINDOW_MS, PAIR_MAX_ATTEMPTS } = require('../config/constants');

const pairAttempts = new Map();

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

async function generatePairCode(number) {
  const { default: makeWASocket, useMultiFileAuthState, fetchLatestWaWebVersion } = require('baileys');
  const pino = require('pino');

  const cleanNumber = number.replace(/[^0-9]/g, '');
  if (cleanNumber.length < 9) throw new Error('Invalid phone number. Include country code.');

  const tempId = `pair_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const tempDir = path.join(os.tmpdir(), tempId);
  fs.mkdirSync(tempDir, { recursive: true });

  let sock = null;
  let codeResolved = false;

  function cleanup() {
    if (sock) sock.ws?.close();
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch(e) {}
  }

  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      if (!codeResolved) {
        codeResolved = true;
        cleanup();
        reject(new Error('Pairing request timed out after 45 seconds.'));
      }
    }, 45000);

    try {
      const { state } = await useMultiFileAuthState(tempDir);
      let version;
      try {
        version = (await fetchLatestWaWebVersion()).version;
      } catch (e) {
        console.warn('[PAIR] Could not fetch latest WA version, using fallback. Error:', e.message);
        version = [2, 3000, 1017531287]; // stable fallback version
      }      sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false,
        browser: ['Maureonix (Pairing)', 'Chrome', '120.0.0.0'],
        connectTimeoutMs: 30000,
        defaultQueryTimeoutMs: 30000,
        keepAliveIntervalMs: 10000,
        emitOwnEvents: true,
      });

      const codePromise = sock.requestPairingCode(cleanNumber);
      codePromise.then(code => {
        if (!codeResolved) {
          codeResolved = true;
          clearTimeout(timeout);
          cleanup();
          const formatted = code.match(/.{1,4}/g)?.join('-') || code;
          resolve({ code: formatted, number: cleanNumber });
        }
      }).catch(err => {
        if (!codeResolved) {
          codeResolved = true;
          clearTimeout(timeout);
          cleanup();
          reject(err);
        }
      });

      sock.ev.on('connection.update', (update) => {
        if (update.connection === 'close' && !codeResolved) {
          const error = update.lastDisconnect?.error?.message || 'Connection closed';
          codeResolved = true;
          clearTimeout(timeout);
          cleanup();
          reject(new Error(`WhatsApp connection error: ${error}`));
        }
      });
    } catch (err) {
      codeResolved = true;
      clearTimeout(timeout);
      cleanup();
      reject(err);
    }
  });
}

module.exports = { checkPairRateLimit, recordPairAttempt, generatePairCode, pairAttempts };