const express = require('express');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');

const app = express();
const server = createServer(app);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

global.nimaInstance = null;

const packageInfo = require('../package.json');
const { PORT, MENU_CARDS_DIR } = require('./config/constants');
const { generateMenuCards } = require('./modules/menuCards');
const { trackVisitor } = require('./modules/visitors');

// Ensure directories exist
const { FEEDBACK_FILE } = require('./config/constants');
const feedbackDir = path.dirname(FEEDBACK_FILE);
if (!fs.existsSync(feedbackDir)) fs.mkdirSync(feedbackDir, { recursive: true });
if (!fs.existsSync(MENU_CARDS_DIR)) fs.mkdirSync(MENU_CARDS_DIR, { recursive: true });

// Generate fallback menu cards once at startup
generateMenuCards();
global.generateMenuCards = generateMenuCards;

// Track every visitor hit
app.use(trackVisitor);

// Mount all routes
require('./routes')(app, packageInfo);

server.listen(PORT, () => {
  console.log(`🦊 Maureonix Neural Interface v${packageInfo.version} running on port ${PORT}`);
});

module.exports = { app, server, PORT };