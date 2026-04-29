const { ADMIN_SECRET, GROQ_API_KEY } = require('../config/constants');
const { loadFeedback, saveFeedback } = require('../modules/feedback');
const { dashboardAiChat } = require('../modules/aiChat');
const { getVisitors, getVisitorStats } = require('../modules/visitors');
const { pairAttempts } = require('../modules/pairCode');

// ── Simple in‑memory rate limiter for AI chat ──
const aiRateMap = new Map();
const AI_RATE_WINDOW = 60000;      // 1 minute
const AI_MAX_REQUESTS = 15;        // per window

function checkAiRateLimit(ip) {
  const now = Date.now();
  const entry = aiRateMap.get(ip) || { count: 0, reset: now + AI_RATE_WINDOW };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + AI_RATE_WINDOW;
  }
  entry.count++;
  aiRateMap.set(ip, entry);
  return entry.count <= AI_MAX_REQUESTS;
}

// ── Clean up stale rate‑limit entries every 5 minutes ──
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of aiRateMap) {
    if (now > entry.reset) aiRateMap.delete(key);
  }
  // also clean pairAttempts (old entries)
  for (const [ip, attempts] of pairAttempts) {
    const recent = attempts.filter(t => now - t < 60000);
    if (recent.length === 0) pairAttempts.delete(ip);
    else pairAttempts.set(ip, recent);
  }
}, 300000).unref();

// ── Basic HTML sanitization ──
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = function mountApiRoutes(app, packageInfo) {
  // ═══ Root status ═══
  app.all('/', (req, res) => {
    if (process.send) {
      process.send('uptime');
      process.once('message', (uptime) => {
        res.json({
          bot_name: packageInfo.name,
          version: packageInfo.version,
          author: packageInfo.author,
          description: packageInfo.description,
          uptime: `${Math.floor(uptime)} seconds`
        });
      });
    } else {
      res.json({ error: 'Process not running with IPC' });
    }
  });

  // ═══ Process relay ═══
  app.all('/process', (req, res) => {
    const { send } = req.query;
    if (!send) return res.status(400).json({ error: 'Missing "send" query parameter' });
    if (process.send) {
      process.send(send);
      res.json({ status: 'Sent', data: send });
    } else {
      res.json({ error: 'Process not running with IPC' });
    }
  });

  // ═══ Legacy chat (stub) ═══
  app.all('/chat', (req, res) => {
    const { message, to } = req.query;
    if (!message || !to) return res.status(400).json({ error: 'Missing "message" or "to" parameter' });
    res.json({ status: 200, mess: 'Not yet implemented' });
  });

  // ═══ AI Chat – session-based with rate limiting ═══
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { sessionId, message } = req.body;
      if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 64) {
        return res.status(400).json({ error: 'Invalid sessionId' });
      }
      if (!message || typeof message !== 'string' || message.length > 2000) {
        return res.status(400).json({ error: 'Invalid message (max 2000 chars)' });
      }

      const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      if (!checkAiRateLimit(clientIp)) {
        return res.status(429).json({ error: 'Too many AI requests. Please slow down.' });
      }

      const result = await dashboardAiChat(sessionId, message);
      res.json(result);
    } catch (e) {
      console.error('AI chat error:', e.message);
      res.status(500).json({ error: 'Neural assistant offline', details: e.message });
    }
  });

  // ═══ Feedback CRUD ═══
  app.post('/api/feedback', async (req, res) => {
    try {
      const { rating, comment, contact, page } = req.body;
      const numRating = parseInt(rating);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
      }

      const feedback = await loadFeedback();
      const entry = {
        id: 'fb_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
        timestamp: new Date().toISOString(),
        rating: numRating,
        comment: sanitize((comment || '').trim()).substring(0, 2000),
        contact: sanitize((contact || '').trim()).substring(0, 200),
        page: (page || '').trim().substring(0, 500),
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
        seen: false
      };

      // Prevent spam from same IP within 30 seconds
      const recent = feedback.filter(f => f.ip === entry.ip && Date.now() - new Date(f.timestamp).getTime() < 30000);
      if (recent.length > 0) {
        return res.status(429).json({ success: false, message: 'You recently submitted feedback. Please wait 30 seconds before trying again.' });
      }

      feedback.unshift(entry);
      if (feedback.length > 1000) feedback.splice(1000);
      await saveFeedback(feedback);
      res.json({ success: true, id: entry.id });
    } catch (e) {
      console.error('Feedback save error:', e);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.get('/api/feedback/list', async (req, res) => {
    try {
      const { secret } = req.query;
      if (!secret || secret !== ADMIN_SECRET) return res.status(403).json({ error: 'Unauthorized' });
      const feedback = await loadFeedback();
      res.json({ count: feedback.length, feedback });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.delete('/api/feedback/:id', async (req, res) => {
    try {
      const { secret } = req.query;
      if (!secret || secret !== ADMIN_SECRET) return res.status(403).json({ error: 'Unauthorized' });
      let feedback = await loadFeedback();
      const initialLen = feedback.length;
      feedback = feedback.filter(f => f.id !== req.params.id);
      if (feedback.length === initialLen) return res.status(404).json({ error: 'Feedback not found' });
      await saveFeedback(feedback);
      res.json({ success: true, remaining: feedback.length });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/feedback/seen', async (req, res) => {
    try {
      const { secret } = req.query;
      if (!secret || secret !== ADMIN_SECRET) return res.status(403).json({ error: 'Unauthorized' });
      const feedback = await loadFeedback();
      feedback.forEach(f => f.seen = true);
      await saveFeedback(feedback);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ═══ Admin stats ═══
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const { secret } = req.query;
      if (!secret || secret !== ADMIN_SECRET) {
        console.log('Auth fail — got:', secret?.substring(0, 3) + '...', 'expected:', ADMIN_SECRET.substring(0, 3) + '...');
        return res.status(403).json({ error: 'Unauthorized' });
      }
      const feedback = await loadFeedback();
      const vStats = getVisitorStats();
      const mem = process.memoryUsage();
      res.json({
        uptime: Math.floor(process.uptime()),
        totalVisitors: vStats.total,
        uniqueVisitors: vStats.unique,
        todayVisitors: vStats.today,
        totalPairs: Array.from(pairAttempts.values()).reduce((a, b) => a + b.length, 0),
        feedbackCount: feedback.length,
        unseenFeedback: feedback.filter(f => !f.seen).length,
        avgRating: feedback.length ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : '0.0',
        botStatus: 'ONLINE',
        version: packageInfo.version,
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          rss: Math.round(mem.rss / 1024 / 1024),
          heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotal: Math.round(mem.heapTotal / 1024 / 1024)
        }
      });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ═══ Admin visitors ═══
  app.get('/api/admin/visitors', (req, res) => {
    try {
      const { secret } = req.query;
      if (!secret || secret !== ADMIN_SECRET) return res.status(403).json({ error: 'Unauthorized' });
      res.json({ visitors: getVisitors() });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ═══ Health / debug endpoints ═══
  app.get('/api/admin/debug', (req, res) => {
    const { secret } = req.query;
    if (!secret || secret !== ADMIN_SECRET) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.json({
      authenticated: true,
      secretConfigured: ADMIN_SECRET !== 'maureonix_secret_key',
      uptime: process.uptime().toFixed(0) + 's'
    });
  });

  app.get('/api/admin/check', (req, res) => {
    const { secret } = req.query;
    if (!secret || secret !== ADMIN_SECRET) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.json({
      secretSet: ADMIN_SECRET !== 'maureonix_secret_key',
      groqKeySet: !!GROQ_API_KEY,
      nodeVersion: process.version,
      memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
    });
  });
};