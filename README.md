<div align="center">

<img src="https://i.ibb.co/23ZN28Xm/image.png" alt="Maureonix WhatsApp Bot" width="300" />
# 🦊 MAUREONIX 🦊 WhatsApp Bot

> A powerful, multi-device WhatsApp bot built with Node.js and Baileys

<a href="https://github.com/luckyfelistine-bot/maureonix/watchers"><img src="https://img.shields.io/github/watchers/luckyfelistine-bot/maureonix?label=Watchers&color=green&style=flat-square"/></a>
<a href="https://github.com/luckyfelistine-bot/maureonix/network/members"><img src="https://img.shields.io/github/forks/luckyfelistine-bot/maureonix?label=Forks&color=blue&style=flat-square"/></a>
<a href="https://github.com/luckyfelistine-bot/maureonix/stargazers"><img src="https://img.shields.io/github/stars/luckyfelistine-bot/maureonix?label=Stars&color=yellow&style=flat-square"/></a>
<a href="https://github.com/luckyfelistine-bot/maureonix/issues"><img src="https://img.shields.io/github/issues/luckyfelistine-bot/maureonix?label=Issues&color=success&style=flat-square"/></a>
<a href="https://github.com/luckyfelistine-bot/maureonix/pulls"><img src="https://img.shields.io/github/issues-pr/luckyfelistine-bot/maureonix?label=PullRequest&color=success&style=flat-square"/></a>

[![WhatsApp Channel](https://img.shields.io/badge/WhatsApp%20Channel-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029Vb7IABxCXC3J7ZFFsk2h)
[![WhatsApp Group](https://img.shields.io/badge/WhatsApp%20Group-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://chat.whatsapp.com/B61mO6noiJG3wVzgkDZd4a)
[![TikTok](https://img.shields.io/badge/TikTok-000000?style=for-the-badge&logo=tiktok&logoColor=white)](https://vm.tiktok.com/ZS9LevY1LSrXD-wytcp/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://choosealicense.com/licenses/mit/)

</div>

---

## ✨ Features

| Category | Description |
|----------|-------------|
| 🤖 Bot | Auto-reply, pairing code, QR login, 50+ automation toggles |
| 👥 Group | Admin tools, anti-spam, welcome/goodbye messages, anti-link, anti-delete |
| 🔍 Search | Google, Wikipedia, GitHub, NPM, Urban Dictionary, weather, news |
| 📥 Download | YouTube MP3/MP4, TikTok, Instagram, Facebook, Twitter, Spotify, MediaFire, APK |
| 🎨 Sticker | Sticker maker, animated text (ATTP), remove.bg, blur, QC, brat |
| 🧠 AI | ChatGPT, Gemini, Llama, DeepSeek, image generation, translate, TTS, summarize |
| 🎮 Games | Connect 4, Blackjack, RPG Adventure, Slot, Roulette, Crash, Dice, Trivia, Pokémon |
| 🎬 Movies & TV | IMDB, TMDB, TVMaze, AniList, series info, ratings, trailers |
| ⚽ Sports | Live scores, fixtures, standings, team/player stats, predictions, odds |
| 💰 Economy | Daily rewards, work, rob, bank, shop, inventory, leaderboard |
| 📊 Master Tools | Health calculators (BMI, BMR), finance (stocks, crypto), travel, food recipes, dev utilities |
| 🔔 Reminders | Persistent reminders with heartbeat, notes, to-do lists, habits |
| 😄 Fun | Memes, jokes, quotes, facts, 8ball, roast, compliment, ship, truth/dare |
| 👑 Owner | Full bot control, block/unblock, backup, set PP, clear chat, join/leave groups |
| 🔐 Privacy | View-once revealer, auto-delete, auto-block keywords |

---

## 📋 Requirements

| Software | Version |
|----------|---------|
| **Node.js** | v20 or higher |
| **Git** | Any version |
| **yt-dlp** | Latest (for YouTube downloads) |
| **ffmpeg** | Any version |
| **Python 3** | Required for yt-dlp |

---

## 🆕 v5.0.0 Upgrades

| Feature | Description |
|---------|-------------|
| **50+ Automation Toggles** | Auto-view status, auto-react, auto-reply mentions, auto-translate, auto-sticker, auto-forward, auto-delete, auto-block/kick/mute keywords, and more. |
| **Multi-User (JadiBot)** | Users can pair their own WhatsApp number and run a personal bot instance. |
| **Heartbeat System** | Persistent reminders, auto-backup, and health checks keep the bot alive and reliable. |
| **RAWG Game Database** | Search 800,000+ games, get details, screenshots, trailers, store links. |
| **Casino Games** | Roulette, Crash, Dice, Coinflip, RPS with betting. |
| **RPG Adventure** | Level up, fight enemies, heal, earn gold and XP. |
| **Live Sports** | Football scores, standings, H2H, predictions via API Sports and ESPN. |
| **Movie & TV APIs** | IMDB, TMDB, TVMaze, AniList, Jikan for comprehensive media info. |
| **Master Command Suite** | Health, finance, social, developer, travel, and food tools. |
| **Enhanced AI** | Groq-powered models (GPT, Gemini, Llama, DeepSeek) with memory. |
| **Remove.bg Integration** | One-click background removal with your own API key. |
| **Voice RSS TTS** | High-quality text-to-speech with multi-language support. |

---

## 🚀 Installation

### 📱 Termux (Android) — Recommended

```bash
pkg update && pkg upgrade -y
pkg install git nodejs-lts python ffmpeg imagemagick -y
pip install yt-dlp
git clone https://github.com/luckyfelistine-bot/maureonix.git
cd maureonix
npm install --legacy-peer-deps
node start.js

Update if already installed

cd ~/maureonix
git pull origin main
pip install -U yt-dlp
node start.js

Keep Termux running in background
Disable battery optimization for Termux (Settings → Apps → Termux → Battery → Unrestricted)

Use wake lock: termux-wake-lock

💻 Ubuntu / VPS / SSH

sudo apt update && sudo apt upgrade -y
sudo apt install git nodejs npm python3 python3-pip ffmpeg imagemagick -y
pip3 install yt-dlp
git clone https://github.com/luckyfelistine-bot/maureonix.git
cd maureonix
npm install
npm start

🤖 Auto Install

git clone https://github.com/luckyfelistine-bot/maureonix.git
cd maureonix
bash install.sh

☁️ Railway Deploy
https://railway.app/button.svg

⚙️ Configuration
All settings are in config.js and settings.js.

// Owner number (with country code)
ownerNumber: ['254116903500']

// Bot name and author
botName: 'Maureonix'
ownerName: 'Infinite Vybeflix'

// Command prefixes (in settings.js)
global.listprefix = ['!', '.', '+']

// Pairing code (true = pairing code, false = QR code)
global.pairing_code = true

### 🔑 New API Keys (v5.0.0)

Add these to `config.js`:

| Key | Purpose | How to Get |
|-----|---------|------------|
| `removeBgApiKey` | Background removal | [remove.bg](https://www.remove.bg/api) |
| `voiceRssApiKey` | Text-to-speech | [Voice RSS](https://www.voicerss.org/) |
| `geminiApiKey` | Gemini AI | [Google AI Studio](https://aistudio.google.com/) |
| `groqApiKey` | GPT/Llama/DeepSeek | [Groq](https://console.groq.com/) |

Changes apply automatically without restart.

▶️ Running the Bot

npm start
# or
yarn start

After start, scan the QR code or use the pairing code.

🗂️ Project Structure

maureonix/
│
├── 📄 README.md                     # Main documentation 
│
├── 📁 docs/                         # Full documentation
│   ├── INSTALL.md
│   ├── CONFIG.md
│   ├── COMMANDS.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── FEATURES.md
│   ├── HEARTBEAT.md
│   ├── SECURITY.md
│   ├── USAGE.md
│   ├── CHANGELOG.md
│   ├── CONTRIBUTING.md
│   └── ROADMAP.md
│
├── 📁 core/                         # Maureonix core brain
│   ├── nima.js
│   ├── nima_core.js
│   ├── nima_commands.js
│   ├── nmd_axis.js
│   ├── shasikala.js
│   └── protection.js
│
├── 📁 src/                          # Runtime engine
│   ├── index.js                     # REAL ENTRY POINT
│   ├── start.js
│   ├── server.js
│   └── message.js
│
├── 📁 commands/                     # Modular commands (future split)
│   ├── ai/
│   ├── admin/
│   ├── owner/
│   ├── group/
│   ├── games/
│   ├── movies/
│   ├── search/
│   ├── download/
│   ├── tools/
│   └── fun/
│
├── 📁 lib/                          # Helpers / utilities
│   ├── scraper.js
│   ├── uploader.js
│   ├── formatter.js
│   └── logger.js
│
├── 📁 database/
│   ├── jadibot/
│   ├── menucards/
│   ├── temp/
│   └── cache/
│
├── 📁 media/
│   ├── logos/
│   ├── backgrounds/
│   ├── fonts/
│   └── generated/
│
├── 📁 config/
│   ├── config.js
│   └── settings.js
│
├── 📁 scripts/
│   ├── install.sh
│   ├── build.sh
│   └── cleanup.sh
│
├── 📁 deployment/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── railway.json
│   ├── heroku.yml
│   ├── Procfile
│   └── ecosystem.config.js
│
├── speed.py
├── package.json
├── package-lock.json
├── yarn.lock
├── .gitignore
└── .railwayignore

🧩 Adding a New Command
Inside nima.js, under switch (command):

case 'ping': {
  m.reply('pong 🏓')
}
break

⚠️ YouTube Download Note
Uses yt-dlp for downloading.

WhatsApp audio limit: 16MB (larger files will show an error)

Region-blocked videos use tv_embedded client

Update yt-dlp: pip install -U yt-dlp

👥 Contributors
Name	Role
Infinite Vybeflix	Creator & Lead Developer
📞 Support
💬 WhatsApp Group

📢 WhatsApp Channel

🐙 GitHub Repository

🎵 TikTok

<div align="center">
Created with ❤️ by Infinite Vybeflix

License: MIT

</div> ```