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
  // Use the correct Baileys import (no @whiskeysockets prefix for compatibility)
  const { default: makeWASocket, useMultiFileAuthState, fetchLatestWaWebVersion } = require('baileys');
  const pino = require('pino');

  const cleanNumber = number.replace(/[^0-9]/g, '');
  if (cleanNumber.length < 9) throw new Error('Invalid phone number. Include country code.');

  const tempId = `pair_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const tempDir = path.join(os.tmpdir(), tempId);
  fs.mkdirSync(tempDir, { recursive: true });

  let sock = null;
  let timeoutId = null;

  // Cleanup function
  const cleanup = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (sock) {
      try { sock.ws?.close(); } catch (_) {}
      sock = null;
    }
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}
  };

  try {
    // Global timeout (45 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Pairing request timed out after 45 seconds.')), 45000);
    });

    // Step 1: get WhatsApp Web version
    const { version } = await fetchLatestWaWebVersion().catch(() => ({ version: [2, 3000, 1017531287] }));

    // Step 2: create auth state
    const { state } = await useMultiFileAuthState(tempDir);

    // Step 3: create socket and wait for connection
    const socketPromise = new Promise((resolve, reject) => {
      sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false,
        browser: ['Maureonix (Pairing)', 'Chrome', '120.0.0.0'],
        connectTimeoutMs: 30000,
        defaultQueryTimeoutMs: 30000,
        keepAliveIntervalMs: 10000
      });

      const onConnectionUpdate = (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
          sock.ev.off('connection.update', onConnectionUpdate);
          resolve();
        } else if (connection === 'close') {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const reason = lastDisconnect?.error?.message || 'Unknown';
          let errorMsg = `Connection closed: ${reason}`;
          if (statusCode === 401) errorMsg = 'Phone number not registered on WhatsApp. Check the number and try again.';
          else if (statusCode === 403) errorMsg = 'Access denied. Try again later.';
          reject(new Error(errorMsg));
        }
      };
      sock.ev.on('connection.update', onConnectionUpdate);

      // Also handle socket errors
      sock.ev.on('error', (err) => {
        sock.ev.off('connection.update', onConnectionUpdate);
        reject(err);
      });
    });

    // Wait for either connection or timeout
    await Promise.race([socketPromise, timeoutPromise]);

    // Step 4: request pairing code
    const codePromise = sock.requestPairingCode(cleanNumber);
    const code = await Promise.race([codePromise, timeoutPromise]);

    // Success
    cleanup();
    const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
    return { code: formatted, number: cleanNumber };
  } catch (err) {
    cleanup();
    let message = err?.message || 'Failed to get pairing code.';
    if (message.includes('timed out')) message = 'Request timed out. Please try again.';
    if (message.includes('Connection closed')) message = 'Connection closed by WhatsApp. Please try again.';
    throw new Error(message);
  }
}

module.exports = { checkPairRateLimit, recordPairAttempt, generatePairCode, pairAttempts };
