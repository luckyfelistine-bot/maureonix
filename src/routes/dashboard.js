const getDashboardHtml = require('../views/dashboardHtml');

module.exports = function mountDashboardRoute(app, packageInfo) {
  app.get('/dashboard', (req, res) => {
    // ── Security headers ──
    res.set({
      'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self';",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      'X-DNS-Prefetch-Control': 'on',
      // Caching: version‑based ETag and short lifetime
      'Cache-Control': 'public, max-age=3600',   // 1 hour
      'ETag': `"maureonix-${packageInfo.version}"`
    });

    // If client has a matching ETag, send 304 Not Modified
    if (req.headers['if-none-match'] === `"maureonix-${packageInfo.version}"`) {
      return res.status(304).end();
    }

    res.send(getDashboardHtml(packageInfo));
  });
};