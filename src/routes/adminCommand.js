const getAdminCommandHtml = require('../views/adminCommandHtml');
const { ADMIN_SECRET } = require('../config/constants');

module.exports = function mountAdminCommandRoute(app, packageInfo) {
  app.get('/admin', (req, res) => {
    const isDefault = ADMIN_SECRET === 'maureonix_secret_key';
    res.set({
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.send(getAdminCommandHtml(packageInfo, isDefault));
  });
};