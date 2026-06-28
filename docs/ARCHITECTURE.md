\# 🏗️ Architecture Overview – Maureonix v5.0.0



This document describes the high‑level structure of the Maureonix WhatsApp bot, including core modules, data flow, and key design patterns.



---



\## 📁 Project Structure



maureonix/

├── index.js # Entry point: WhatsApp connection, pairing, event listeners

├── maureonix\_core.js # Core command handler, automation, game loops

├── maureonix\_commands.js # All command cases (700+ commands, switch statement)

├── config.js # Sensitive keys (API keys, owner number, MongoDB URI)

├── settings.js # Global preferences (prefix, bot name, lists)

├── start.js # Simple startup wrapper (calls index.js)

├── protection.js # Anti‑crash, rate limiting, security guards

│

├── lib/ # Reusable helper modules

│ ├── ai.js # AI models (GPT, Gemini, Llama, DeepSeek) + image gen

│ ├── search.js # Web search (Google, Wiki, GitHub, NPM, Urban)

│ ├── tools.js # Utilities (weather, crypto, IP lookup, QR, etc.)

│ ├── fun.js # Jokes, memes, quotes, truth/dare, etc.

│ ├── economy.js # Economy system (daily, work, rob, bank, shop)

│ ├── admin.js # Admin tools (mute, warn, clear, etc.)

│ ├── daily.js # Productivity (reminders, notes, to‑do, habits)

│ ├── health.js # Health calculators (BMI, BMR, TDEE, macros)

│ ├── finance.js # Finance tools (stocks, crypto, portfolio, loans)

│ ├── social.js # Social media helpers (bios, hashtags, captions)

│ ├── dev.js # Developer utilities (UUID, password, JSON, regex)

│ ├── travel.js # Travel tools (packing, timezones, phrases)

│ ├── food.js # Food \& recipes (recipe, cocktail, substitute)

│ ├── game.js # Games (Connect4, Blackjack, RPG, Casino, RAWG)

│ ├── movie.js # Movie/TV APIs (OMDB, TMDB, TVMaze, AniList, Jikan)

│ ├── sports.js # Sports APIs (API Sports, Odds, ESPN)

│ ├── database.js # MongoDB / JSON database abstraction

│ ├── function.js # General helpers (runtime, sleep, fetchJson, etc.)

│ ├── scraper.js # Downloaders (YT, TikTok, IG, FB, Twitter, Spotify)

│ ├── converter.js # Media conversion (audio, video, sticker)

│ ├── uploader.js # File upload to various hosts

│ ├── exif.js # Sticker metadata (packname, author)

│ ├── menuimage.js # Dynamic menu card generation

│ └── antispam.js # Command cooldown / rate limiting

│

├── src/ # Core application logic

│ ├── message.js # Message serialization, upsert handler, store management

│ ├── jadibot.js # Multi‑user pairing system (JadiBot)

│ └── server.js # Express web server (health checks, QR display)

│

├── database/ # Persistent data (when using JSON)

│ ├── database.json # Main bot database

│ ├── store.json # Message store (for anti‑delete, caching)

│ └── temp/ # Temporary files (downloads, stickers)

│

├── maureonixdev/ # Baileys auth state (main bot session)

├── jadibot\_sessions/ # User‑specific auth folders (when using JadiBot)

│

├── docs/ # Documentation files

│ ├── README.md

│ ├── INSTALL.md

│ ├── CONFIG.md

│ ├── COMMANDS.md

│ └── ARCHITECTURE.md

│

└── package.json # Dependencies and scripts





---



\## 🔄 Data Flow



┌─────────────┐ ┌──────────────┐ ┌─────────────────┐

│ WhatsApp │────▶│ Baileys │────▶│ index.js │

│ Server │◀────│ Socket │◀────│ (Event Loop) │

└─────────────┘ └──────────────┘ └────────┬────────┘

│

▼

┌─────────────────┐

│ maureonix\_core.js │

│ (Core Handler)│

└────────┬────────┘

│

┌─────────────────────────────┼─────────────────────────────┐

│ │ │

▼ ▼ ▼

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐

│ Automation │ │ Command Router │ │ Games \& Loops │

│ (Auto‑read, │ │ (switch case) │ │ (Suit, Chess, │

│ react, etc.) │ └────────┬────────┘ │ Connect4) │

└─────────────────┘ │ └─────────────────┘

▼

┌─────────────────────┐

│ maureonix\_commands.js │

│ (700+ case blocks) │

└──────────┬──────────┘

│

┌────────────────────────────┼────────────────────────────┐

│ │ │

▼ ▼ ▼

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐

│ lib/ai.js │ │ lib/search.js │ │ lib/game.js │

│ lib/scraper.js │ │ lib/tools.js │ │ lib/economy.js │

│ ... │ │ ... │ │ ... │

└─────────────────┘ └─────────────────┘ └─────────────────┘

│

▼

┌─────────────────────┐

│ Database (MongoDB │

│ or JSON) │

└─────────────────────┘





---



\## 🧩 Core Modules Explained



\### `index.js`

\- \*\*Purpose:\*\* Initialize Baileys socket, handle connection lifecycle (QR/pairing code), set up global event listeners (`messages.upsert`, `group-participants.update`, `presence.update`, etc.).

\- \*\*Key Functions:\*\*

&nbsp; - `startmaureonixBot()` – Creates the WhatsApp socket, loads database, and starts the bot.

&nbsp; - `cleanup()` – Saves database on exit.

\- \*\*Exports:\*\* Express `app`, `server`, `PORT`.



\### `maureonix\_core.js`

\- \*\*Purpose:\*\* Main command processor. Called for every incoming message (after serialization).

\- \*\*Responsibilities:\*\*

&nbsp; - Load user/group data from `db`.

&nbsp; - Execute \*\*automation logic\*\* (auto‑view status, auto‑react, auto‑reply, auto‑translate, etc.).

&nbsp; - Run \*\*game loops\*\* (Connect4, Suit, Chess, RPG, etc.).

&nbsp; - Parse command prefix, arguments, and route to `maureonix\_commands.js`.

&nbsp; - Handle errors and send logs to owner.

\- \*\*Exports:\*\* `coreHandler` function.



\### `maureonix\_commands.js`

\- \*\*Purpose:\*\* Contains \*\*all\*\* command implementations as `case` blocks inside a `switch` statement.

\- \*\*Structure:\*\*

&nbsp; ```javascript

&nbsp; module.exports = async (maureonix, m, ctx) => {

&nbsp;     const { command, args, text, ... } = ctx;

&nbsp;     switch (command) {

&nbsp;         case 'ping': { ... } break;

&nbsp;         case 'menu': { ... } break;

&nbsp;         // 700+ more cases

&nbsp;     }

&nbsp; };



Design Choice: A single file with a large switch is used for simplicity and fast lookup. Each case is independent and can be modified without affecting others.



lib/database.js

Purpose: Abstraction layer for persistent storage. Supports both MongoDB and JSON file.



Classes:



MongoDB – Connects to MongoDB Atlas or local instance.



JsonDB – Reads/writes to a local JSON file.



Exports: dataBase(uri) factory function.



src/message.js

Purpose: Serialize incoming Baileys messages into a consistent format (m object).



Key Functions:



MessagesUpsert() – Processes new messages, deduplicates via keyId Set, and calls coreHandler.



Solving() – Attaches helper methods to the socket (sendText, sendAsSticker, downloadMediaMessage, etc.).



Store Management: Maintains global.store for message caching, anti‑delete, and contact info.



src/jadibot.js

Purpose: Multi‑user pairing system. Allows users to pair their own WhatsApp number and run a personal bot instance.



Functions:



startJadiBot(userId, authFolder, phoneNumber) – Creates a new Baileys socket for the user.



stopJadiBot(userId) – Closes the socket and cleans up.



Active Instances: Stored in a Map for easy lookup.



🗄️ Database Schema

db (Main Database)



{

&nbsp; users: {

&nbsp;   "jid@s.whatsapp.net": {

&nbsp;     limit: 10,

&nbsp;     money: 5000,

&nbsp;     bank: 2000,

&nbsp;     gems: 0,

&nbsp;     level: 1,

&nbsp;     xp: 0,

&nbsp;     job: "Unemployed",

&nbsp;     inventory: \[],

&nbsp;     vip: false,

&nbsp;     ban: false,

&nbsp;     afkTime: -1,

&nbsp;     afkReason: ""

&nbsp;   }

&nbsp; },

&nbsp; groups: {

&nbsp;   "jid@g.us": {

&nbsp;     mute: false,

&nbsp;     antilink: false,

&nbsp;     antidelete: false,

&nbsp;     welcome: true,

&nbsp;     setinfo: false,

&nbsp;     warn: {},

&nbsp;     text: {}

&nbsp;   }

&nbsp; },

&nbsp; game: {

&nbsp;   connect4: {},

&nbsp;   suit: {},

&nbsp;   rpg: {},

&nbsp;   reminders: \[],

&nbsp;   pairRequests: {}

&nbsp; },

&nbsp; set: {

&nbsp;   "botJid": {

&nbsp;     owner: \["ownerJid"],

&nbsp;     autostatus: false,

&nbsp;     autostatusreact: false,

&nbsp;     autoread: true,

&nbsp;     autotyping: true,

&nbsp;     // ... all auto toggles

&nbsp;   }

&nbsp; },

&nbsp; premium: \[],

&nbsp; sewa: \[],

&nbsp; hit: { totalcmd: 0, todaycmd: 0 },

&nbsp; cmd: {}

}



store (Message Cache)



{

&nbsp; messages: {

&nbsp;   "jid": {

&nbsp;     array: \[ /\* message objects \*/ ],

&nbsp;     keyId: Set(\[ /\* message IDs \*/ ])

&nbsp;   }

&nbsp; },

&nbsp; contacts: {},

&nbsp; presences: {},

&nbsp; groupMetadata: {}

}



🔌 External APIs \& Fallback Strategy

Many commands use multiple APIs in a fallback chain to ensure reliability.



Command	Primary API	Fallback 1	Fallback 2

.translate	MyMemory	LibreTranslate	Google Translate

.tts	Google TTS	Voice RSS	gTTS (local)

.attp	FFmpeg (local)	Paxsenix API	Lolhuman API

.removebg	remove.bg (API key)	–	–

.ai	Groq (GPT/LLaMA)	Gemini	–

.movie	OMDB	TMDB	–

This design prevents a single API outage from breaking functionality.



🧠 Automation Execution Order

Inside maureonix\_core.js, the following checks run in order for every message:



Skip self‑messages (unless owner in self‑chat).



Auto‑read (if enabled).



Auto‑view status / react to status.



Auto‑react / auto‑reply to mentions.



Auto‑download status (owner only).



Auto‑forward (owner only).



Auto‑sticker (convert images).



Auto‑translate incoming messages.



Auto‑delete bot's own messages after X seconds.



Auto‑react to all messages.



Auto‑block / kick / mute based on keywords.



Group welcome / goodbye (on participant updates).



Game loops (Connect4, Suit, RPG, etc.).



Command parsing \& execution.



📈 Performance Considerations

Component	Optimization

keyId Set	Deduplicates messages, prevents duplicate processing.

JSON Database	Throttled writes (every 30 seconds) to reduce disk I/O.

MongoDB	Connection pooling and retry logic.

Command Switch	Direct lookup, O(1) complexity.

AI Memory	Limited to 20 messages per user, prevents unbounded growth.

Sticker Creation	Temporary files cleaned up immediately after sending.

🔒 Security Notes

All API keys are stored in config.js (not committed to Git).



Environment variables supported for cloud deployments.



Owner‑only commands are gated by isCreator check.



Anti‑spam cooldown prevents command flooding.



protection.js includes global error handlers to prevent crashes.

