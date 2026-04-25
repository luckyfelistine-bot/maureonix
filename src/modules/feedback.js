const fs = require('fs');
const path = require('path');
const { FEEDBACK_FILE } = require('../config/constants');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadFeedback() {
  ensureDir(path.dirname(FEEDBACK_FILE));
  if (!fs.existsSync(FEEDBACK_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8')); }
  catch { return []; }
}

function saveFeedback(data) {
  ensureDir(path.dirname(FEEDBACK_FILE));
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
}

module.exports = { loadFeedback, saveFeedback };