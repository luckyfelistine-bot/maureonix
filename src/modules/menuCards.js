const path = require('path');
const fs = require('fs');
const { MENU_CARDS_DIR } = require('../config/constants');

module.exports = function mountMenuCardRoute(app) {
  app.get('/menucard/:id', (req, res) => {
    // ── Path traversal protection ──
    let cardId = req.params.id;

    // Strip any directory components
    cardId = path.basename(cardId);

    // Only allow alphanumeric characters, hyphens, and underscores
    if (!/^[a-zA-Z0-9_-]+$/.test(cardId)) {
      return res.status(400).send('Invalid menu card ID');
    }

    // Try PNG first, then JPEG
    const pngPath = path.join(MENU_CARDS_DIR, cardId + '.png');
    if (fs.existsSync(pngPath)) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 1 day
      return res.sendFile(pngPath);
    }

    const jpgPath = path.join(MENU_CARDS_DIR, cardId + '.jpg');
    if (fs.existsSync(jpgPath)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 1 day
      return res.sendFile(jpgPath);
    }

    res.status(404).send('Menu card not found');
  });
};