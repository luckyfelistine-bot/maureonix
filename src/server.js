const express = require('express');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');

const app = express();
const server = createServer(app);

// ── Middleware ──
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

global.maureonixInstance = null;

const packageInfo = require('../package.json');
const { PORT, MENU_CARDS_DIR, FEEDBACK_FILE } = require('./config/constants');
const { generateMenuCards } = require('./modules/menuCards');
const { trackVisitor } = require('./modules/visitors');

// ── Ensure required directories exist (constants.js already does this, but double‑check) ──
const feedbackDir = path.dirname(FEEDBACK_FILE);
if (!fs.existsSync(feedbackDir)) fs.mkdirSync(feedbackDir, { recursive: true });
if (!fs.existsSync(MENU_CARDS_DIR)) fs.mkdirSync(MENU_CARDS_DIR, { recursive: true });

// ── Global error handlers ──
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception:', err.message);
  console.error(err.stack);
  // Keep the process alive if possible; otherwise exit gracefully
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled rejection at:', promise, 'reason:', reason);
  // Don't exit, just log – some libraries may have non‑critical rejections
});

// ── Visitor tracking (must come before routes) ──
app.use(trackVisitor);

// ── Mount all routes ──
require('./routes')(app, packageInfo);

// ── Express error‑handling middleware (must be last) ──
app.use((err, req, res, next) => {
  console.error('[EXPRESS] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Expose menu card generation to other parts of the bot (always available)
global.generateMenuCards = generateMenuCards;

// ── Start server after optional menu card generation ──
(async () => {
  // Generate fallback menu cards (non‑blocking)
  try {
    await generateMenuCards();
    console.log('[STARTUP] Fallback menu cards generated.');
  } catch (e) {
    console.warn('[STARTUP] Menu card generation failed:', e.message);
    console.warn('[STARTUP] Existing cards will be used if available.');
  }

  server.listen(PORT, () => {
    console.log(`🦊 Maureonix Neural Interface v${packageInfo.version} running on port ${PORT}`);
  });
})();

// ── Healthcheck endpoint ─────────────────────────────────────────────────
// Returns 200 immediately so Railway's healthcheck passes without waiting
// for the WhatsApp connection to be established.
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

module.exports = { app, server, PORT };