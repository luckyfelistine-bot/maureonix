const crypto = require('crypto');
const { MAX_VISITOR_LOG } = require('../config/constants');

// ── In‑memory log (most recent visits) ──
const visitorLog = [];

// ── Unique IP counter (all‑time, hashed for privacy) ──
const uniqueIpHashes = new Set();

// Simple one‑way hash to anonymise IPs while preserving count
function hashIp(ip) {
  return crypto.createHash('sha256').update(ip + 'maureonix-static-salt').digest('hex').substring(0, 16);
}

function trackVisitor(req, res, next) {
  // Skip static assets and API calls to reduce noise
  if (req.path.startsWith('/api') || req.path.match(/\.(jpg|jpeg|png|gif|css|js|ico|svg|woff|woff2)$/)) {
    return next();
  }

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

  // Add to recent log (original IP for admin display – still visible to admins)
  visitorLog.unshift({
    ip,
    path: req.path,
    time: new Date().toISOString(),
    ua: req.headers['user-agent'] || ''
  });

  if (visitorLog.length > MAX_VISITOR_LOG) {
    visitorLog.pop();
  }

  // Track unique IP (hashed)
  const hashed = hashIp(ip);
  uniqueIpHashes.add(hashed);

  next();
}

function getVisitors() {
  return visitorLog.slice(0, 100); // return the 100 most recent hits
}

function getVisitorStats() {
  const today = new Date().toDateString();
  const todayCount = visitorLog.filter(v => new Date(v.time).toDateString() === today).length;

  return {
    total: visitorLog.length,
    today: todayCount,
    unique: uniqueIpHashes.size   // accurate all‑time unique IP count
  };
}

module.exports = { trackVisitor, getVisitors, getVisitorStats };