const getAdminCommandHtml = require('../views/adminCommandHtml');

module.exports = function mountAdminCommandRoute(app, packageInfo) {
  app.get('/admin', (req, res) => {
    res.send(getAdminCommandHtml(packageInfo));
  });
};