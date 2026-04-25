const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '../..');

module.exports = {
  PORT: process.env.PORT || process.env.SERVER_PORT || 3000,
  ADMIN_SECRET: process.env.MAUREONIX_ADMIN_SECRET || 'maureonix_secret_key',
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