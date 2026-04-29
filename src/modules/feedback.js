const fs = require('fs').promises;           // use promises API
const path = require('path');
const { FEEDBACK_FILE } = require('../config/constants');

// Simple mutex to serialise writes and avoid corruption
let writeQueue = Promise.resolve();

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function loadFeedback() {
  await ensureDir(path.dirname(FEEDBACK_FILE));
  try {
    const raw = await fs.readFile(FEEDBACK_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    console.error('[feedback] Failed to load feedback:', err.message);
    return [];
  }
}

async function saveFeedback(data) {
  // chain writes to prevent interleaving
  writeQueue = writeQueue.then(async () => {
    await ensureDir(path.dirname(FEEDBACK_FILE));
    const tmpFile = FEEDBACK_FILE + '.tmp';
    await fs.writeFile(tmpFile, JSON.stringify(data, null, 2));
    // atomic rename (if supported) to avoid partial writes
    try {
      await fs.rename(tmpFile, FEEDBACK_FILE);
    } catch (err) {
      // fallback: just write directly if rename fails (e.g., across devices)
      await fs.writeFile(FEEDBACK_FILE, JSON.stringify(data, null, 2));
      try { await fs.unlink(tmpFile); } catch (_) {}
    }
  }).catch(err => console.error('[feedback] Failed to save feedback:', err));
  return writeQueue;
}

module.exports = { loadFeedback, saveFeedback };