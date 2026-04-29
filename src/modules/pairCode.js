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
  // Dynamic import to avoid top‑level require errors
  const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
  const pino = require('pino');

  const cleanNumber = number.replace(/[^0-9]/g, '');
  if (cleanNumber.length < 9) throw new Error('Invalid phone number. Include country code.');

  const tempId = `pair_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const tempDir = path.join(os.tmpdir(), tempId);
  fs.mkdirSync(tempDir, { recursive: true });

  let sock = null;
  let codeResolved = false;

  // Prevent duplicate cleanup errors
  function cleanup() {
    if (sock) {
      try { sock.ws?.close(); } catch (_) {}
      sock = null;
    }
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}
  }

  // Get a working WhatsApp Web version
  let version;
  try {
    const { version: v } = await fetchLatestBaileysVersion();
    version = v;
  } catch (e) {
    console.warn('[PAIR] fetchLatestBaileysVersion failed, using fallback. Error:', e.message);
    // Fallback: a recent multi‑device compatible version (major, minor, build)
    version = [2, 3000, 1017531287];
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

      sock = makeWASocket({
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

      // Listen for premature disconnection
      sock.ev.on('connection.update', (update) => {
        if (update.connection === 'close' && !codeResolved) {
          const statusCode = update.lastDisconnect?.error?.output?.statusCode;
          const reason = update.lastDisconnect?.error?.message || 'Connection closed unexpectedly';
          let userMessage = `WhatsApp disconnected: ${reason}`;
          if (statusCode === 401) userMessage = 'Phone number not registered on WhatsApp. Check the number and try again.';
          else if (statusCode === 403) userMessage = 'Access denied. Try again later.';
          else if (reason.includes('timed out')) userMessage = 'Connection timed out. Please try again.';
          codeResolved = true;
          clearTimeout(timeout);
          cleanup();
          reject(new Error(userMessage));
        }
      });

      // Request pairing code
      const code = await sock.requestPairingCode(cleanNumber);
      if (!codeResolved) {
        codeResolved = true;
        clearTimeout(timeout);
        cleanup();
        const formatted = code.match(/.{1,4}/g)?.join('-') || code;
        resolve({ code: formatted, number: cleanNumber });
      }
    } catch (err) {
      if (!codeResolved) {
        codeResolved = true;
        clearTimeout(timeout);
        cleanup();
        let msg = err?.message || 'Unknown error';
        if (msg.includes('Connection closed')) msg = 'Connection closed by WhatsApp. Please try again.';
        else if (msg.includes('timed out')) msg = 'Request timed out. Check your internet and try again.';
        reject(new Error(msg));
      }
    }
  });
}

module.exports = { checkPairRateLimit, recordPairAttempt, generatePairCode, pairAttempts };