const { MAX_VISITOR_LOG } = require('../config/constants');

const visitorLog = [];

function trackVisitor(req, res, next) {
  if (req.path.startsWith('/api') || req.path.match(/\.(jpg|jpeg|png|gif|css|js|ico|svg|woff|woff2)$/)) return next();
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  visitorLog.unshift({ ip, path: req.path, time: new Date().toISOString(), ua: req.headers['user-agent'] || '' });
  if (visitorLog.length > MAX_VISITOR_LOG) visitorLog.pop();
  next();
}

function getVisitors() {
  return visitorLog.slice(0, 100);
}

function getVisitorStats() {
  const today = new Date().toDateString();
  return {
    total: visitorLog.length,
    today: visitorLog.filter(v => new Date(v.time).toDateString() === today).length,
    unique: new Set(visitorLog.map(v => v.ip)).size
  };
}

module.exports = { trackVisitor, getVisitors, getVisitorStats };