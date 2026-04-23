\# 📦 Installation Guide – Maureonix Bot v5.0.0



This guide covers installing Maureonix on \*\*Termux (Android)\*\*, \*\*Ubuntu/Debian VPS\*\*, and \*\*Railway\*\* (cloud deployment). MongoDB is optional but recommended for production.



---



\## 📋 Prerequisites



| Requirement | Version | Notes |

|-------------|---------|-------|

| Node.js | ≥20.0.0 | Use \[nvm](https://github.com/nvm-sh/nvm) to manage versions |

| npm / yarn / pnpm | Latest | Any package manager works |

| Git | Any | To clone the repository |

| FFmpeg | Latest | Required for audio/video/sticker processing |

| yt-dlp | Latest | YouTube downloads (Python package) |

| Python 3 | ≥3.8 | Required for yt-dlp |

| MongoDB (optional) | ≥4.4 | For persistent storage (recommended) |



---



\## 📱 Termux (Android) – Recommended for 24/7



\### Step 1: Install Termux \& Essential Packages



Download \[Termux](https://f-droid.org/repo/com.termux\_118.apk) from F-Droid. Then run:



```bash

pkg update \&\& pkg upgrade -y

pkg install git nodejs-lts python ffmpeg imagemagick -y



Step 2: Install yt-dlp



pip install yt-dlp



Step 3: Clone \& Install Dependencies



git clone https://github.com/luckyfelistine-bot/maureonix.git

cd maureonix

npm install --legacy-peer-deps



Step 4: Configure



cp config.example.js config.js

nano config.js   # Add your API keys and owner number



Step 5: Run the Bot



node start.js



Keeping Termux Alive 24/7

Disable battery optimization for Termux (Settings → Apps → Termux → Battery → Unrestricted).



Use Termux:Boot to auto-start on device reboot.



Install termux-services and run the bot as a background service.



pkg install termux-services

sv-enable maureonix



Updating the Bot



cd ~/maureonix

git pull origin main

pip install -U yt-dlp

npm install --legacy-peer-deps

sv restart maureonix   # if using termux-services



💻 Ubuntu / Debian VPS

Step 1: Update System \& Install Dependencies

sudo apt update \&\& sudo apt upgrade -y

sudo apt install git curl wget python3 python3-pip ffmpeg imagemagick -y



Step 2: Install Node.js 20+

Using NodeSource:



Step 3: Install yt-dlp

sudo pip3 install yt-dlp



Step 4: Install MongoDB (Optional)

\# Import MongoDB public key

wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

echo "deb \[ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

sudo apt update

sudo apt install -y mongodb-org

sudo systemctl start mongod

sudo systemctl enable mongod



Step 5: Clone \& Install

git clone https://github.com/luckyfelistine-bot/maureonix.git

cd maureonix

npm install



Step 6: Configure

cp config.example.js config.js

nano config.js



Set tempatDB to your MongoDB URI (e.g., mongodb://localhost:27017/maureonix) or keep as JSON file path.



Step 7: Run with PM2 (Process Manager)

npm install -g pm2

pm2 start start.js --name maureonix

pm2 save

pm2 startup   # auto-start on reboot



Updating

cd ~/maureonix

git pull origin main

npm install

sudo pip3 install -U yt-dlp

pm2 restart maureonix



☁️ Railway Deployment

Option 1: One-Click Deploy

https://railway.app/button.svg



Option 2: Manual Deploy

Fork the repository.



Create a new project on Railway.



Connect your GitHub account and select the forked repo.



Add the required Environment Variables (see below).



Deploy.



Required Environment Variables on Railway

Variable	Description	Example

BOT\_NUMBER	Bot's WhatsApp number (with country code)	254116903500

MONGODB\_URI	MongoDB connection string	mongodb+srv://...

REMOVE\_BG\_KEY	remove.bg API key	8EFJ7He4wghiENEFjLGNTb9n

VOICE\_RSS\_KEY	Voice RSS API key	79b0ea4a2b424f9098ad09859db8e0a0

GEMINI\_API\_KEY	Google Gemini API key	AIza...

GROQ\_API\_KEY	Groq API key	gsk\_...

🐳 Docker (Optional)

A Dockerfile is included for containerized deployment.



docker build -t maureonix .

docker run -d --name maureonix --restart unless-stopped maureonix



✅ Post-Installation Verification

After starting the bot, you should see:



✅ Connected via owner's phone

╔═════\[root@hostname]═════

║ OS              : linux ...

║ Script version  : v5.0.0

║ Node.js         : v20.x.x

╚══════════════════════════════

Maureonix \[BOT] is now active!



Scan the QR code or use the pairing code displayed in the terminal.



❓ Troubleshooting

Issue	Solution

node: not found	Install Node.js ≥20 via nvm or package manager

yt-dlp: command not found	Run pip install yt-dlp

ffmpeg: command not found	Install ffmpeg via package manager

MongoDB connection refused	Ensure MongoDB is running (sudo systemctl status mongod)

Cannot find module '...'	Run npm install again





