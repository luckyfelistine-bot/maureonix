const getAdminFeedbackHtml = require('../views/adminFeedbackHtml');

module.exports = function mountAdminFeedbackRoute(app) {
  app.get('/admin/feedback', (req, res) => {
    res.send(getAdminFeedbackHtml());
  });
};