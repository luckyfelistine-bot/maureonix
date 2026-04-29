const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '../..');

// ── Safe environment variable parser ──
function cleanEnv(val) {
  if (!val) return '';
  return val.trim().replace(/^["']+|["']+$/g, '');
}

function requireEnv(name, fallback) {
  const raw = cleanEnv(process.env[name]);
  if (raw) return raw;
  if (fallback !== undefined) return fallback;
  console.error(`[CONFIG] Required environment variable ${name} is not set. Exiting.`);
  process.exit(1); // safe exit when mandatory config missing
}

// ── Admin secret: multiple acceptable names ──
const rawSecret =
  cleanEnv(process.env.MAUREONIX_ADMIN_SECRET) ||
  cleanEnv(process.env.ADMIN_SECRET) ||
  cleanEnv(process.env.MAUREONIX_SECRET);

const ADMIN_SECRET = rawSecret || 'maureonix_secret_key';

// Log secret status (avoid printing actual secret)
const isDefaultSecret = ADMIN_SECRET === 'maureonix_secret_key';
if (isDefaultSecret) {
  console.warn('⚠️  WARNING: Using default admin secret "maureonix_secret_key".');
  console.warn('   Set MAUREONIX_ADMIN_SECRET or ADMIN_SECRET in environment for production.');
} else {
  console.log('[AUTH] Admin secret loaded from environment.');
}
console.log('[AUTH] Secret length:', ADMIN_SECRET.length, 'chars');

// ── Groq API key ──
let GROQ_API_KEY = cleanEnv(process.env.GROQ_API_KEY);
if (!GROQ_API_KEY) {
  // Fallback to legacy config file
  try {
    const cfg = require('../../config');
    GROQ_API_KEY = cfg.groqApiKey || cfg.GROQ_API_KEY || '';
  } catch (_) {
    // no config file
  }
}
if (!GROQ_API_KEY) {
  console.warn('[AI] No GROQ_API_KEY found. AI features will be unavailable.');
}

// ── Server port ──
const PORT = (() => {
  const rawPort = process.env.PORT || process.env.SERVER_PORT || '3000';
  const parsed = parseInt(rawPort, 10);
  if (isNaN(parsed) || parsed < 1 || parsed > 65535) {
    console.warn(`[CONFIG] Invalid port "${rawPort}", defaulting to 3000`);
    return 3000;
  }
  return parsed;
})();

// ── AI Model ──
const AI_MODEL = requireEnv('AI_MODEL', 'llama-3.3-70b-versatile');
const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';

// ── File paths ──
const FEEDBACK_FILE = path.join(PROJECT_ROOT, 'database', 'feedback.json');
const MENU_CARDS_DIR = path.join(PROJECT_ROOT, 'database', 'menucards');
const CUSTOM_MENU_DIR = MENU_CARDS_DIR; // alias for compatibility

// ── Visitor & pairing limits ──
const MAX_VISITOR_LOG = 500;
const PAIR_WINDOW_MS = 60000;     // 1 minute
const PAIR_MAX_ATTEMPTS = 5;      // max 5 per window

// ── Validate and create directories on first access ──
const fs = require('fs');
function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[CONFIG] Created directory: ${dir}`);
  }
}
ensureDirSync(path.dirname(FEEDBACK_FILE));
ensureDirSync(MENU_CARDS_DIR);

module.exports = {
  PORT,
  ADMIN_SECRET,
  GROQ_API_KEY,
  AI_MODEL,
  GROQ_BASE,
  FEEDBACK_FILE,
  MENU_CARDS_DIR,
  CUSTOM_MENU_DIR,
  MAX_VISITOR_LOG,
  PAIR_WINDOW_MS,
  PAIR_MAX_ATTEMPTS,
};