const path = require('path');
const fs = require('fs');
const { MENU_CARDS_DIR } = require('../config/constants');

module.exports = function mountMenuCardRoute(app) {
  app.get('/menucard/:id', (req, res) => {
    const cardId = req.params.id;
    const pngPath = path.join(MENU_CARDS_DIR, cardId + '.png');
    if (fs.existsSync(pngPath)) {
      res.setHeader('Content-Type', 'image/png');
      return res.sendFile(pngPath);
    }
    const jpgPath = path.join(MENU_CARDS_DIR, cardId + '.jpg');
    if (fs.existsSync(jpgPath)) {
      res.setHeader('Content-Type', 'image/jpeg');
      return res.sendFile(jpgPath);
    }
    res.status(404).send('Menu card not found');
  });
};