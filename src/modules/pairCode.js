// modules/pairCode.js
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
  const cleanup = () => {
    if (sock) {
      try { sock.ws?.close(); } catch (_) {}
      sock = null;
    }
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}
  };

  try {
    // Step 1 – WhatsApp Web version
    const { version } = await fetchLatestWaWebVersion().catch(() => ({ version: [2, 3000, 1017531287] }));

    // Step 2 – Auth state
    const { state } = await useMultiFileAuthState(tempDir);

    // Step 3 – Wait for socket to open (up to 60 seconds)
    const socketOpenPromise = new Promise((resolve, reject) => {
      sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false,
        browser: ['Maureonix (Pairing)', 'Chrome', '120.0.0.0'],
        connectTimeoutMs: 60_000,          // generous handshake time
        defaultQueryTimeoutMs: 60_000,
        keepAliveIntervalMs: 25_000
      });

      const onConnectionUpdate = (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
          sock.ev.off('connection.update', onConnectionUpdate);
          resolve();
        } else if (connection === 'close') {
          sock.ev.off('connection.update', onConnectionUpdate);
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          if (statusCode === 401) reject(new Error('Phone number not registered on WhatsApp.'));
          else if (statusCode === 403) reject(new Error('Access denied. Try again later.'));
          else reject(new Error(`Connection closed: ${lastDisconnect?.error?.message || 'Unknown'}`));
        }
      };
      sock.ev.on('connection.update', onConnectionUpdate);
    });

    // Hard deadline: 65 seconds total
    const totalTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Pairing request timed out after 65 seconds.')), 65_000);
    });

    await Promise.race([socketOpenPromise, totalTimeout]);

    // Step 4 – Request the pairing code with a 3‑second cooldown and up to 3 retries (exactly like main bot)
    let code = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await new Promise(r => setTimeout(r, 3_000));   // cooldown
        code = await sock.requestPairingCode(cleanNumber);
        break;   // success
      } catch (e) {
        if (attempt === 2) throw e;
        // otherwise retry
      }
    }

    cleanup();

    const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
    return { code: formatted, number: cleanNumber };

  } catch (err) {
    cleanup();
    let message = err?.message || 'Failed to get pairing code.';
    if (message.includes('timed out')) message = 'Request timed out. Please try again in a moment.';
    if (message.includes('Connection closed')) message = 'Connection closed by WhatsApp. Please try again.';
    throw new Error(message);
  }
}

module.exports = { checkPairRateLimit, recordPairAttempt, generatePairCode, pairAttempts };
