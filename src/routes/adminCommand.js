const getAdminCommandHtml = require('../views/adminCommandHtml');
const { ADMIN_SECRET } = require('../config/constants');

module.exports = function mountAdminCommandRoute(app, packageInfo) {
  app.get('/admin', (req, res) => {
    const isDefault = ADMIN_SECRET === 'maureonix_secret_key';
    res.send(getAdminCommandHtml(packageInfo, isDefault));
  });
};