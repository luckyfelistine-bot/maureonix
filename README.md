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
| 🤖 Bot | Auto-reply, pairing code, QR login |
| 👥 Group | Admin tools, anti-spam, welcome messages |
| 🔍 Search | Google, Wikipedia, weather, and more |
| 📥 Download | **YouTube MP3/MP4** (16MB limit), TikTok, Instagram |
| 🛠️ Tools | Sticker maker, image editor, QR generator |
| 🧠 AI | ChatGPT, image generation |
| 🎮 Games | TicTacToe, Chess, Quiz, and more |
| 😄 Fun | Memes, jokes, random content |
| 👑 Owner | Full bot control commands |

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

Changes apply automatically without restart.

▶️ Running the Bot

npm start
# or
yarn start

After start, scan the QR code or use the pairing code.

🗂️ Project Structure

maureonix/
├── index.js          # WhatsApp connection & event handler
├── nima.js           # All commands (main bot logic)
├── config.js         # Plain-text configuration
├── settings.js       # Additional settings
├── start.js          # Entry point
├── lib/              # Helper libraries
├── src/              # Core modules
└── database/         # Temporary files and data

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