const getAdminFeedbackHtml = require('../views/adminFeedbackHtml');
const { ADMIN_SECRET } = require('../config/constants');

module.exports = function mountAdminFeedbackRoute(app) {
  app.get('/admin/feedback', (req, res) => {
    const isDefault = ADMIN_SECRET === 'maureonix_secret_key';
    res.send(getAdminFeedbackHtml(isDefault));
  });
};