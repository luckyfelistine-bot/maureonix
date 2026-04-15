const express = require('express');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
const packageInfo = require('../package.json');

global.nimaInstance = null;

// ── Static menu cards directory (pre‑generated PNGs) ─────────────────────────
const MENU_CARDS_DIR = path.join(__dirname, '../database/menucards');
if (!fs.existsSync(MENU_CARDS_DIR)) fs.mkdirSync(MENU_CARDS_DIR, { recursive: true });

// Serve menu card images (only PNG files)
app.get('/menucard/:id', (req, res) => {
    const imgPath = path.join(MENU_CARDS_DIR, `${req.params.id}.png`);
    if (fs.existsSync(imgPath)) {
        res.setHeader('Content-Type', 'image/png');
        res.sendFile(imgPath);
    } else {
        res.status(404).send('Not found');
    }
});

// ── Simple dashboard (no traceable content) ─────────────────────────────────
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Bot Dashboard</title>
        <style>body{background:#0a0a1a;color:#ddd;font-family:monospace;text-align:center;padding:2rem;}</style>
        </head>
        <body>
        <h1>🤖 WhatsApp Bot</h1>
        <p>Bot is running. Use WhatsApp to interact.</p>
        <p><a href="/pair">Pair a new device</a></p>
        </body>
        </html>
    `);
});

// Pairing endpoint
app.get('/pair', async (req, res) => {
    const { number } = req.query;
    if (!number) return res.status(400).json({ error: 'Missing number parameter' });
    const nima = global.nimaInstance;
    if (!nima) return res.status(503).json({ error: 'Bot not ready yet' });
    try {
        const clean = number.replace(/\D/g, '');
        const code = await nima.requestPairingCode(clean);
        const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
        res.json({ status: true, code: formatted });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Optional: simple API info
app.get('/info', (req, res) => {
    res.json({
        bot_name: packageInfo.name,
        version: packageInfo.version,
        author: packageInfo.author,
        status: 'online',
        uptime: process.uptime()
    });
});

// Catch-all for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

module.exports = { app, server, PORT };