const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '../..');

// Railway sometimes wraps env vars in quotes or adds whitespace
function cleanEnv(val) {
  if (!val) return '';
  return val.trim().replace(/^["']+|["']+$/g, '');
}

// Accept either env var name — common mistake
const rawSecret = cleanEnv(process.env.MAUREONIX_ADMIN_SECRET) 
               || cleanEnv(process.env.ADMIN_SECRET) 
               || cleanEnv(process.env.MAUREONIX_SECRET);

const ADMIN_SECRET = rawSecret || 'maureonix_secret_key';

console.log('[AUTH] Admin secret source:', rawSecret ? 'ENV VAR' : 'FALLBACK');
console.log('[AUTH] Secret length:', ADMIN_SECRET.length, 'chars');

module.exports = {
  PORT: process.env.PORT || process.env.SERVER_PORT || 3000,
  ADMIN_SECRET,
  GROQ_API_KEY: process.env.GROQ_API_KEY || (() => {
    try { return require('../../config').groqApiKey; } catch { return ''; }
  })(),
  AI_MODEL: 'llama-3.3-70b-versatile',
  GROQ_BASE: 'https://api.groq.com/openai/v1/chat/completions',
  FEEDBACK_FILE: path.join(PROJECT_ROOT, 'database/feedback.json'),
  MENU_CARDS_DIR: path.join(PROJECT_ROOT, 'database/menucards'),
  CUSTOM_MENU_DIR: path.join(PROJECT_ROOT, 'database/menucards'),
  MAX_VISITOR_LOG: 500,
  PAIR_WINDOW_MS: 60000,
  PAIR_MAX_ATTEMPTS: 5,
};