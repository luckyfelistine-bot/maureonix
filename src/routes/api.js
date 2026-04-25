const { ADMIN_SECRET } = require('../config/constants');
const { loadFeedback, saveFeedback } = require('../modules/feedback');
const { dashboardAiChat } = require('../modules/aiChat');
const { getVisitors, getVisitorStats } = require('../modules/visitors');
const { pairAttempts } = require('../modules/pairCode');

module.exports = function mountApiRoutes(app, packageInfo) {
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
    } else res.json({ error: 'Process not running with IPC' });
  });

  app.all('/process', (req, res) => {
    const { send } = req.query;
    if (!send) return res.status(400).json({ error: 'Missing "send" query parameter' });
    if (process.send) {
      process.send(send);
      res.json({ status: 'Sent', data: send });
    } else res.json({ error: 'Process not running with IPC' });
  });

  app.all('/chat', (req, res) => {
    const { message, to } = req.query;
    if (!message || !to) return res.status(400).json({ error: 'Missing "message" or "to" parameter' });
    res.json({ status: 200, mess: 'Not yet implemented' });
  });

  // ═══ DEBUG: verify what secret the server expects ═══
  app.get('/api/admin/debug', (req, res) => {
    const expected = ADMIN_SECRET;
    res.json({
      ok: true,
      hint: 'Expected secret starts with: ' + expected.substring(0, 3) + '***',
      length: expected.length,
      envVarSet: !!process.env.MAUREONIX_ADMIN_SECRET,
      usingDefault: expected === 'maureonix_secret_key',
      tryThis: expected === 'maureonix_secret_key' ? 'Use default: maureonix_secret_key' : 'Use your Railway env var value'
    });
  });

  // ═══ AI Chat with Dashboard Navigation System Prompt ═══
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { sessionId, message } = req.body;
      if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 64) {
        return res.status(400).json({ error: 'Invalid sessionId' });
      }
      if (!message || typeof message !== 'string' || message.length > 2000) {
        return res.status(400).json({ error: 'Invalid message (max 2000 chars)' });
      }

      const systemPrompt = `You are Maureonix Neural Assistant, the AI guide for the Maureonix Dashboard.
You help users navigate the dashboard, understand features, and use bot commands.

AVAILABLE DASHBOARD SECTIONS:
- #features — Feature Matrix showing all 16 bot modules (Core, AI, Games, Downloaders, etc.)
- #pairing — WhatsApp pairing / 8-digit code generator
- #stats — Live statistics (commands, uptime, platforms)
- #terminal — Neural Terminal with inspirational quotes

RULES:
1. NEVER tell users to restart, shutdown, or run dangerous system commands.
2. NEVER reveal admin secrets or internal paths.
3. If the user wants to navigate, include an action block: [ACTION: {"type":"scrollTo","target":"pairing"}]
4. If they ask about pairing, guide them to #pairing.
5. If they ask about commands/features, guide them to #features.
6. Be concise, friendly, cyberpunk-themed. Use emojis occasionally.
7. If you don't know something, say so honestly.`;

      const history = [];
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ];

      const fetch = require('node-fetch');
      const apiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${require('../config/constants').GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!apiRes.ok) throw new Error(`Groq HTTP ${apiRes.status}`);
      const data = await apiRes.json();
      let text = data.choices?.[0]?.message?.content || 'No response';

      // Extract actions
      const actions = [];
      const actionRegex = /\[ACTION:\s*(\{.*?\})\]/gs;
      text = text.replace(actionRegex, (match, jsonStr) => {
        try { actions.push(JSON.parse(jsonStr)); } catch {}
        return '';
      }).trim();

      res.json({ text, actions });
    } catch (e) {
      console.error('AI chat error:', e.message);
      res.status(500).json({ error: 'Neural assistant offline', details: e.message });
    }
  });

  app.post('/api/feedback', (req, res) => {
    try {
      const { rating, comment, contact, page } = req.body;
      const numRating = parseInt(rating);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
      const feedback = loadFeedback();
      const entry = {
        id: 'fb_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
        timestamp: new Date().toISOString(),
        rating: numRating,
        comment: (comment || '').trim().substring(0, 2000),
        contact: (contact || '').trim().substring(0, 200),
        page: (page || '').trim().substring(0, 500),
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
        seen: false
      };
      const recent = feedback.filter(f => f.ip === entry.ip && Date.now() - new Date(f.timestamp).getTime() < 5000);
      if (recent.length > 0) return res.status(429).json({ success: false, message: 'Please wait before submitting again' });
      feedback.unshift(entry);
      if (feedback.length > 1000) feedback.splice(1000);
      saveFeedback(feedback);
      res.json({ success: true, id: entry.id });
    } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
  });

  app.get('/api/feedback/list', (req, res) => {
    try {
      const { secret } = req.query;
      if (!secret || secret !== ADMIN_SECRET) return res.status(403).json({ error: 'Unauthorized' });
      const feedback = loadFeedback();
      res.json({ count: feedback.length, feedback });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
  });

  app.delete('/api/feedback/:id', (req, res) => {
    try {
      const { secret } = req.query;
      if (!secret || secret !== ADMIN_SECRET) return res.status(403).json({ error: 'Unauthorized' });
      let feedback = loadFeedback();
      const initialLen = feedback.length;
      feedback = feedback.filter(f => f.id !== req.params.id);
      if (feedback.length === initialLen) return res.status(404).json({ error: 'Feedback not found' });
      saveFeedback(feedback);
      res.json({ success: true, remaining: feedback.length });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
  });

  app.post('/api/feedback/seen', (req, res) => {
    try {
      const { secret } = req.query;
      if (!secret || secret !== ADMIN_SECRET) return res.status(403).json({ error: 'Unauthorized' });
      const feedback = loadFeedback();
      feedback.forEach(f => f.seen = true);
      saveFeedback(feedback);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
  });

  app.get('/api/admin/stats', (req, res) => {
    try {
      const { secret } = req.query;
      if (!secret || secret !== ADMIN_SECRET) {
        console.log('Auth fail — got:', secret?.substring(0,3)+'...', 'expected:', ADMIN_SECRET.substring(0,3)+'...');
        return res.status(403).json({ error: 'Unauthorized' });
      }
      const feedback = loadFeedback();
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
        memory: { rss: Math.round(mem.rss / 1024 / 1024), heapUsed: Math.round(mem.heapUsed / 1024 / 1024), heapTotal: Math.round(mem.heapTotal / 1024 / 1024) }
      });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
  });

  app.get('/api/admin/visitors', (req, res) => {
    try {
      const { secret } = req.query;
      if (!secret || secret !== ADMIN_SECRET) return res.status(403).json({ error: 'Unauthorized' });
      res.json({ visitors: getVisitors() });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
  });
  // Debug: verify auth config without exposing secret
  app.get('/api/admin/check', (req, res) => {
    res.json({
      hasMaureonixSecret: !!process.env.MAUREONIX_ADMIN_SECRET,
      hasAdminSecret: !!process.env.ADMIN_SECRET,
      usingFallback: ADMIN_SECRET === 'maureonix_secret_key',
      secretLength: ADMIN_SECRET.length,
      envKeys: Object.keys(process.env).filter(k => 
        k.toLowerCase().includes('secret') || 
        k.toLowerCase().includes('admin') ||
        k.toLowerCase().includes('maureonix')
      )
    });
  });
};