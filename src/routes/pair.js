const { checkPairRateLimit, recordPairAttempt, generatePairCode } = require('../modules/pairCode');

module.exports = function mountPairRoute(app) {
  app.get('/pair', async (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

    // ── Rate limit check ──
    if (!checkPairRateLimit(clientIp)) {
      return res.status(429).json({
        status: false,
        message: 'Rate limit exceeded. Max 5 attempts per minute.'
      });
    }

    const { number } = req.query;
    if (!number) {
      return res.status(400).json({
        status: false,
        message: 'Missing "number" parameter. Example: /pair?number=254xxxxxxxx'
      });
    }

    // Record attempt early so rate limiting is effective even if the request later fails
    recordPairAttempt(clientIp);

    // ── Request timeout (50 seconds) ──
    req.setTimeout(65_000, () => {
      if (!res.headersSent) {
        res.status(504).json({
          status: false,
          message: 'Pairing request timed out. Please try again.'
        });
      }
    });

    try {
      const result = await generatePairCode(number);
      res.json({
        status: true,
        code: result.code,
        number: result.number
      });
    } catch (err) {
      // already reported by generatePairCode, just pass through
      res.status(500).json({
        status: false,
        message: err.message
      });
    }
  });
};
