// Route aggregator – loads and mounts all route handlers
// If any module fails to load, the application exits immediately (fail‑fast)

function safeRequire(modulePath, moduleName) {
  try {
    return require(modulePath);
  } catch (err) {
    console.error(`[ROUTES] Fatal: Could not load route module "${moduleName}".`);
    console.error(`  Path: ${modulePath}`);
    console.error(`  Error: ${err.message}`);
    process.exit(1);
  }
}

const mountMenuCard      = safeRequire('./menucard', 'menucard');
const mountPair          = safeRequire('./pair', 'pair');
const mountApi           = safeRequire('./api', 'api');
const mountDashboard     = safeRequire('./dashboard', 'dashboard');
const mountAdminFeedback = safeRequire('./adminFeedback', 'adminFeedback');
const mountAdminCommand  = safeRequire('./adminCommand', 'adminCommand');

module.exports = function mountAllRoutes(app, packageInfo) {
  console.log('[ROUTES] Mounting all routes...');

  mountMenuCard(app);
  mountPair(app);
  mountApi(app, packageInfo);
  mountDashboard(app, packageInfo);
  mountAdminFeedback(app);          // legacy feedback page (no packageInfo needed)
  mountAdminCommand(app, packageInfo);

  console.log('[ROUTES] All routes mounted successfully.');
};