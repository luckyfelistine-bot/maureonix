const mountMenuCard = require('./menucard');
const mountPair = require('./pair');
const mountApi = require('./api');
const mountDashboard = require('./dashboard');
const mountAdminFeedback = require('./adminFeedback');
const mountAdminCommand = require('./adminCommand');

module.exports = function mountAllRoutes(app, packageInfo) {
  mountMenuCard(app);
  mountPair(app);
  mountApi(app, packageInfo);
  mountDashboard(app, packageInfo);
  mountAdminFeedback(app);
  mountAdminCommand(app, packageInfo);
};