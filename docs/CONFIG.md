\# ⚙️ Configuration Guide – Maureonix v5.0.0



All configuration is centralized in two files: `config.js` (sensitive keys) and `settings.js` (global preferences). Environment variables are also supported for cloud deployments.



---



\## 📁 File Overview



| File | Purpose | Tracked in Git |

|------|---------|----------------|

| `config.js` | API keys, owner number, database URI | ❌ (add to `.gitignore`) |

| `settings.js` | Bot name, prefix, global flags | ✅ |

| `.env` | Alternative for environment variables | ❌ (optional) |



---



\## 🔐 `config.js` – Required Keys



Create a `config.js` file based on `config.example.js`. Below are all available keys.



```javascript

const SecureConfig = {

&nbsp;   // ===== OWNER \& BOT IDENTITY =====

&nbsp;   ownerNumber: \['254116903500'],        // WhatsApp number with country code (array)

&nbsp;   botName: 'Maureonix',                 // Display name of the bot

&nbsp;   ownerName: 'Infinite Vybeflix',       // Owner's name



&nbsp;   // ===== DATABASE =====

&nbsp;   mongoUri: process.env.MONGODB\_URI || 'mongodb://localhost:27017/maureonix',

&nbsp;                                         // MongoDB connection string (optional)

&nbsp;   // Use './database/database.json' for JSON fallback



&nbsp;   // ===== API KEYS =====

&nbsp;   geminiApiKey: process.env.GEMINI\_API\_KEY || '',

&nbsp;   groqApiKey: process.env.GROQ\_API\_KEY || '',

&nbsp;   removeBgApiKey: process.env.REMOVE\_BG\_KEY || '',

&nbsp;   voiceRssApiKey: process.env.VOICE\_RSS\_KEY || '',



&nbsp;   // ===== CHANNEL / NEWSLETTER =====

&nbsp;   channelJid: '120363426431427396@newsletter',

};



module.exports = SecureConfig;



🔑 Where to Obtain Each Key

Key	Service	Sign‑Up URL	Free Tier Limit

geminiApiKey	Google Gemini	aistudio.google.com	60 requests/min

groqApiKey	Groq (GPT/Llama/DeepSeek)	console.groq.com	30 requests/min

removeBgApiKey	remove.bg	remove.bg/api	50 images/month

voiceRssApiKey	Voice RSS (TTS)	voicerss.org	350 requests/day

mongoUri	MongoDB Atlas	mongodb.com/atlas	512 MB free

⚙️ settings.js – Global Preferences

These settings control bot behavior and can be changed without restart.



// ===== BOT IDENTITY =====

global.botname = 'Maureonix';

global.ownername = 'Infinite Vybeflix';

global.author = 'Infinite Vybeflix';

global.packname = 'Maureonix';            // Sticker pack name



// ===== COMMAND PREFIX =====

global.listprefix = \['.', '!', '#'];

global.multiprefix = true;                // Allow any registered prefix



// ===== PAIRING MODE =====

global.pairing\_code = true;               // true = pairing code, false = QR

global.number\_bot = '254116903500';       // Bot's own number



// ===== DATABASE PATHS =====

global.tempatDB = './database/database.json';   // JSON fallback

global.tempatStore = './database/store.json';



// ===== API ENDPOINTS =====

global.APIs = {

&nbsp;   maureonix: 'https://api.maureonix.biz.id'

};

global.APIKeys = {

&nbsp;   'https://api.maureonix.biz.id': ''         // Your API key from maureonix.biz.id

};



// ===== OWNER LIST =====

global.owner = \['254116903500'];



// ===== CHANNEL / GROUP (auto‑join) =====

global.my = {

&nbsp;   ch: '120363426431427396@newsletter',

&nbsp;   tt: 'https://youtube.com/@infinitevybeflix'

};



// ===== FAKE THUMBNAIL =====

global.fake = {

&nbsp;   thumbnail: 'https://i.imgur.com/1z5l2v7.jpg'

};



// ===== LIST EMOJIS =====

global.listv = \['⬜','🔲','🔳','▪️','▫️','◽','◾','🔸','🔹','🔶','🔷','💠','🌀','⬛','⬜'];



🌍 Environment Variables (Railway / Docker)

For cloud deployments, you can use environment variables instead of config.js. The bot reads these automatically.



Variable	Maps To	Required

BOT\_NUMBER	global.number\_bot	✅ Yes

MONGODB\_URI	mongoUri in config.js	❌ No (falls back to JSON)

GEMINI\_API\_KEY	geminiApiKey	❌ No

GROQ\_API\_KEY	groqApiKey	❌ No

REMOVE\_BG\_KEY	removeBgApiKey	❌ No

VOICE\_RSS\_KEY	voiceRssApiKey	❌ No

PORT	Express server port	Default 3000

Example .env file:



BOT\_NUMBER=254116903500

MONGODB\_URI=mongodb+srv://user:pass@cluster.mongodb.net/maureonix

GEMINI\_API\_KEY=AIza...

GROQ\_API\_KEY=gsk\_...

REMOVE\_BG\_KEY=8EFJ7He4wghiENEFjLGNTb9n

VOICE\_RSS\_KEY=79b0ea4a2b424f9098ad09859db8e0a0

PORT=8080



🔄 Applying Configuration Changes

File	Restart Required

config.js	✅ Yes

settings.js	✅ Yes

.env	✅ Yes

After modifying any configuration, restart the bot:



\# PM2

pm2 restart maureonix



\# Termux

sv restart maureonix



\# Node

npm start



