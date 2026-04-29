const getAdminCommandHtml = require('../views/adminCommandHtml');
const { ADMIN_SECRET } = require('../config/constants');

module.exports = function mountAdminCommandRoute(app, packageInfo) {
  app.get('/admin', (req, res) => {
    const isDefault = ADMIN_SECRET === 'maureonix_secret_key';
    res.set({
      // ── Comprehensive security headers ──
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self';"
    });
    res.send(getAdminCommandHtml(packageInfo, isDefault));
  });
};