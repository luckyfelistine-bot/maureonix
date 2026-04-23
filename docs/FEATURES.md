\# ✨ Features – Maureonix v5.0.0



Maureonix is a \*\*feature‑rich, multi‑device WhatsApp bot\*\* designed for power users, community managers, and developers. This document provides a deep dive into every major feature category.



---



\## 🧠 AI \& Intelligence



| Feature | Description | How to Use |

|---------|-------------|------------|

| \*\*Multi‑Model AI Chat\*\* | Chat with GPT‑4, Gemini, Llama 3, and DeepSeek via Groq. Each model has unique strengths. | `.gpt <prompt>`, `.gemini <prompt>`, `.llama <prompt>`, `.deepseek <prompt>` |

| \*\*AI Image Generation\*\* | Generate high‑quality images from text prompts using Pollinations.ai. | `.imagine a futuristic city` |

| \*\*Smart Translation\*\* | Translate text between 100+ languages, including Sinhala, with automatic source detection. | `.translate si Hello world` |

| \*\*Text‑to‑Speech (TTS)\*\* | Convert text to natural‑sounding voice notes. Supports multiple languages and accents. | `.tts en-us Welcome to Maureonix` |

| \*\*Summarization\*\* | Condense long messages or articles into concise summaries. | Reply to a long message with `.summarize` |

| \*\*Code Generation\*\* | Generate code snippets in Python, JavaScript, Java, and more. | `.code python fibonacci function` |

| \*\*AI Roast \& Rizz\*\* | Get roasted by AI or generate smooth pickup lines. | `.roastai my friend`, `.rizz at a coffee shop` |

| \*\*Context Memory\*\* | AI remembers conversation history (up to 20 messages) for coherent multi‑turn chats. | `.clearmemory` to reset |



---



\## ⚡ Automation (50+ Toggles)



Maureonix can automate repetitive tasks, making group management and personal use effortless.



| Automation | What It Does | Owner Command |

|------------|--------------|---------------|

| \*\*Auto‑View Status\*\* | Automatically views all WhatsApp statuses. | `.autoviewstatus on/off` |

| \*\*Auto‑React to Status\*\* | Reacts with 👍 to viewed statuses. | `.autolikestatus on/off` |

| \*\*Auto‑React to Mentions\*\* | Reacts with 👀 when someone mentions the bot. | `.autoreactmention on/off` |

| \*\*Auto‑Reply to Mentions\*\* | Sends a custom reply when mentioned. Use `{user}` as placeholder. | `.autoreplymention Hello {user}!` |

| \*\*Auto‑Read Messages\*\* | Marks all incoming messages as read. | `.autoread on/off` |

| \*\*Auto‑Typing\*\* | Shows "typing…" indicator before replying. | `.autotyping on/off` |

| \*\*Auto‑Recording\*\* | Shows "recording audio…" indicator (for voice note illusion). | `.autorecording on/off` |

| \*\*Auto‑Bio\*\* | Updates the bot's profile bio with uptime and stats every hour. | `.autobio on/off` |

| \*\*Auto‑Backup\*\* | Sends a daily database backup to the owner. | `.autobackup on/off` |

| \*\*Auto‑Join\*\* | Automatically joins groups when invited by trusted users. | `.autojoin on/off` |

| \*\*Auto‑Download Status\*\* | Downloads all viewed statuses to the owner's private chat. | `.autodownload on/off` |

| \*\*Auto‑Forward\*\* | Forwards every incoming message to a specified JID (owner only). | `.autoforward 120xxx@g.us` |

| \*\*Auto‑Sticker\*\* | Converts every image/video sent to the bot into a sticker. | `.autosticker on/off` |

| \*\*Auto‑Translate\*\* | Translates all incoming messages to a target language. | `.autotranslate si` |

| \*\*Auto‑Delete\*\* | Deletes the bot's own messages after X seconds. | `.autodelete 10` |

| \*\*Auto‑React\*\* | Reacts to every incoming message with a fixed emoji. | `.autoreact ❤️` |

| \*\*Auto‑Block\*\* | Blocks users who send specified keywords. | `.autoblock spam,scam` |

| \*\*Auto‑Kick\*\* | Kicks group members who send prohibited keywords. | `.autokick link,invite` |

| \*\*Auto‑Mute\*\* | Deletes messages containing specified keywords. | `.automute badword` |

| \*\*Auto‑Welcome\*\* | Sends a welcome message when a user joins a group. | `.autowelcome on/off` |

| \*\*Auto‑Goodbye\*\* | Sends a goodbye message when a user leaves. | `.autogoodbye on/off` |



View all automation settings with `.automation`.



---



\## 👥 Group Management



| Feature | Description | Command |

|---------|-------------|---------|

| \*\*Add/Kick Members\*\* | Add or remove members (bot must be admin). | `.add 2547xxx`, `.kick @user` |

| \*\*Promote/Demote Admins\*\* | Change admin privileges. | `.promote @user`, `.demote @user` |

| \*\*Warning System\*\* | Issue warnings; auto‑kick after 4 warnings. | `.warn @user`, `.unwarn @user` |

| \*\*Group Settings\*\* | Open/close group, enable disappearing messages, toggle features. | `.group open`, `.group antilink on` |

| \*\*Anti‑Link\*\* | Deletes messages containing WhatsApp group links. | `.group antilink on` |

| \*\*Anti‑Virtex\*\* | Deletes long/buggy messages. | `.group antivirtex on` |

| \*\*Anti‑Delete\*\* | Resends deleted messages (anti‑delete). | `.group antidelete on` |

| \*\*Anti‑Toxic\*\* | Deletes messages with bad words. | `.group antitoxic on` |

| \*\*Anti‑Hidetag\*\* | Detects and warns users who use hidetag. | `.group antihidetag on` |

| \*\*Anti‑Tag Status\*\* | Warns/kicks users who tag the group in statuses. | `.group antitagsw on` |

| \*\*Tag All / Hidetag\*\* | Mention all members with or without notification. | `.tagall Announcement`, `.hidetag` |

| \*\*Group Info\*\* | Change group name, description, or profile picture. | `.setname`, `.setdesc`, `.setppgc` |

| \*\*Invite Link\*\* | Get or revoke the group invite link. | `.linkgroup`, `.revoke` |

| \*\*Pin/Unpin\*\* | Pin important messages. | `.pin` (reply to message) |

| \*\*Clear Chat\*\* | Delete multiple messages (owner only). | `.clearchat` |



---



\## 🎮 Games \& Entertainment



| Category | Games | Description |

|----------|-------|-------------|

| \*\*Multiplayer\*\* | Connect 4, Suit (Rock Paper Scissors), Chess | Play against friends in groups. |

| \*\*Casino\*\* | Roulette, Crash, Dice, Coinflip, Slot | Bet virtual coins and win big. |

| \*\*RPG Adventure\*\* | Fight enemies, level up, earn gold | Persistent character progression. |

| \*\*Trivia \& Quizzes\*\* | Trivia, Math Quiz, Pokémon, Anagram, Guess Number | Test your knowledge. |

| \*\*Classic Games\*\* | Blackjack, Tic‑Tac‑Toe, Snake \& Ladder | Solo or with friends. |

| \*\*RAWG Game Database\*\* | Search 800,000+ games, get screenshots, trailers, store links | `.rawg Elden Ring` |



---



\## 🎬 Movies, TV \& Anime



| Feature | Description | Example |

|---------|-------------|---------|

| \*\*Movie Search\*\* | Find movies by title, get ratings, plot, cast. | `.movie Inception` |

| \*\*IMDB Details\*\* | Detailed info via IMDB ID. | `.imdb tt1375666` |

| \*\*Series Search\*\* | TV show details, seasons, episodes. | `.series Breaking Bad` |

| \*\*Ratings\*\* | IMDB, Rotten Tomatoes, Metacritic scores. | `.rating tt1375666` |

| \*\*TV Schedule\*\* | See what's airing today (US). | `.tvschedule` |

| \*\*Anime \& Manga\*\* | Search via AniList or Jikan (MyAnimeList). | `.anime Attack on Titan`, `.manga Berserk` |

| \*\*Trending Anime\*\* | Currently popular anime. | `.trendinganime` |

| \*\*Movie Quote Game\*\* | Guess the movie from emojis. | `.moviequote` |



---



\## ⚽ Live Sports



| Feature | Description | Example |

|---------|-------------|---------|

| \*\*Leagues\*\* | List all football leagues with IDs. | `.leagues` |

| \*\*Fixtures\*\* | Upcoming matches for a league. | `.fixtures 39` (Premier League) |

| \*\*Live Scores\*\* | Real‑time scores for ongoing matches. | `.live` |

| \*\*Standings\*\* | League table. | `.standings 39` |

| \*\*Team Info\*\* | Squad, coach, venue. | `.team 33` (Man United) |

| \*\*Player Stats\*\* | Goals, assists, cards. | `.player 276` |

| \*\*Head‑to‑Head\*\* | Compare two teams. | `.h2h 33-40` |

| \*\*Predictions\*\* | Match outcome probabilities. | `.predict 12345` |

| \*\*Betting Odds\*\* | Current odds from bookmakers. | `.odds soccer\_epl` |

| \*\*ESPN News\*\* | Latest sports headlines. | `.espnnews soccer eng.1` |



---



\## 📥 Downloader Suite



| Platform | What It Downloads | Example |

|----------|------------------|---------|

| \*\*YouTube\*\* | MP3 audio or MP4 video (uses yt‑dlp). | `.song Faded`, `.video <url>` |

| \*\*TikTok\*\* | Video without watermark. | `.tiktok <url>` |

| \*\*Instagram\*\* | Photos, videos, reels, stories. | `.instagram <url>` |

| \*\*Facebook\*\* | Public videos. | `.fb <url>` |

| \*\*Twitter/X\*\* | Videos from tweets. | `.twitter <url>` |

| \*\*Spotify\*\* | Track preview (30s). | `.spotify <track url>` |

| \*\*MediaFire\*\* | Any file from MediaFire. | `.mediafire <url>` |

| \*\*APK\*\* | Android app files. | `.apk whatsapp` |



---



\## 💰 Economy System



| Feature | Description | Command |

|---------|-------------|---------|

| \*\*Daily Reward\*\* | Claim free coins every 24h. Streak bonus. | `.daily` |

| \*\*Work\*\* | Earn coins by working random jobs. | `.work` |

| \*\*Rob\*\* | Attempt to steal from other users. | `.rob @user` |

| \*\*Bank\*\* | Deposit/withdraw to earn interest. | `.deposit 1000`, `.withdraw 500` |

| \*\*Transfer\*\* | Send money to friends. | `.transfer @user 100` |

| \*\*Shop\*\* | Buy items (phone, laptop, car, house, jet). | `.buy phone` |

| \*\*Inventory\*\* | View owned items. | `.inventory` |

| \*\*Leaderboard\*\* | Top richest users. | `.lb` |



---



\## 📅 Productivity \& Organization



| Feature | Description | Command |

|---------|-------------|---------|

| \*\*Reminders\*\* | Set one‑time or recurring reminders with heartbeat persistence. | `.remindme 10 Call mom` |

| \*\*Notes\*\* | Save personal notes with titles. | `.note Shopping \\| Milk, Eggs` |

| \*\*To‑Do Lists\*\* | Manage tasks with priorities (high/medium/low). | `.todo Finish report \\| high` |

| \*\*Habit Tracker\*\* | Track daily habits and view streaks. | `.habit Exercise` |

| \*\*Mood Tracker\*\* | Log daily mood (1‑10) and view trends. | `.mood 8 Feeling great` |

| \*\*Water Intake\*\* | Log daily water consumption. | `.water 500` |

| \*\*Expense Tracker\*\* | Track spending by category. | `.expense 20 Food` |

| \*\*Grocery List\*\* | Maintain a shared or personal grocery list. | `.grocery Milk` |

| \*\*Timer \& Alarm\*\* | Set timers and alarms. | `.timer 5 Tea`, `.alarm 08:00` |



---



\## 💪 Health \& Fitness



| Calculator | Description | Example |

|-----------|-------------|---------|

| \*\*BMI\*\* | Body Mass Index. | `.bmi 70 175` |

| \*\*BMR\*\* | Basal Metabolic Rate. | `.bmr 70 175 25 male` |

| \*\*TDEE\*\* | Total Daily Energy Expenditure. | `.tdee 1800 moderate` |

| \*\*Macros\*\* | Protein, fat, carb split. | `.macros 2000 maintain` |

| \*\*Water Intake\*\* | Recommended daily water. | `.watercalc 70` |

| \*\*Sleep Cycles\*\* | Optimal wake‑up times. | `.sleep` |

| \*\*Heart Rate Zones\*\* | Fat burn, cardio, peak. | `.heartrate 30` |

| \*\*1RM\*\* | One‑rep max estimate. | `.onerm 80 8` |

| \*\*Body Fat %\*\* | Navy method. | `.bodyfat male 80 40 175` |

| \*\*Workout Plans\*\* | Fullbody, push, pull, legs. | `.workout fullbody` |

| \*\*Yoga Poses\*\* | Pose instructions and benefits. | `.yoga downward dog` |



---



\## 📊 Finance Tools



| Tool | Description | Example |

|------|-------------|---------|

| \*\*Stock Price\*\* | Real‑time stock quotes. | `.stock AAPL` |

| \*\*Crypto Price\*\* | Bitcoin, Ethereum, etc. | `.crypto ethereum` |

| \*\*Portfolio Tracker\*\* | Track your stock/crypto holdings. | `.addstock AAPL 10 150` |

| \*\*Tip Calculator\*\* | Split bills easily. | `.tip 50 15 2` |

| \*\*Loan EMI\*\* | Monthly payment calculator. | `.loan 10000 5 24` |

| \*\*Savings Goal\*\* | Time to reach savings target. | `.savings 50000 500 6` |

| \*\*Forex\*\* | Currency exchange rates. | `.forex USD EUR` |



---



\## 🛠️ Developer Utilities



| Tool | Description | Example |

|------|-------------|---------|

| \*\*UUID\*\* | Generate a random UUID. | `.uuid` |

| \*\*Password\*\* | Strong password generator. | `.password 16` |

| \*\*JSON Validator\*\* | Validate and pretty‑print JSON. | `.json {"key":"value"}` |

| \*\*Regex Tester\*\* | Test regular expressions. | `.regex "\\\\d+" g "abc123"` |

| \*\*Encode/Decode\*\* | Base64, URL, HTML. | `.encode base64 hello` |

| \*\*Lorem Ipsum\*\* | Placeholder text. | `.lorem 100` |

| \*\*Color Palette\*\* | Random color scheme. | `.palette` |

| \*\*QR Code\*\* | Generate QR from text/URL/vCard/WiFi. | `.qr Hello`, `.qrvcard`, `.qrwifi` |

| \*\*Checksum\*\* | SHA256/MD5 of a file. | Reply to file with `.checksum` |



---



\## 🔒 Privacy \& Security



| Feature | Description |

|---------|-------------|

| \*\*View‑Once Revealer\*\* | Reveal "view once" images/videos. (`.vv`) |

| \*\*Anti‑Delete\*\* | Resend deleted messages in groups. |

| \*\*Anti‑Link\*\* | Block WhatsApp group links. |

| \*\*Block/Unblock\*\* | Manage blocked contacts. |

| \*\*All Block\*\* | Block all known JIDs with one command. |

| \*\*Session Cleanup\*\* | Delete old session files to prevent bans. |



---



\## 🧩 Multi‑User (JadiBot)



Maureonix supports \*\*multi‑user pairing\*\* – users can pair their own WhatsApp number and run a personal bot instance.



| Command | Description |

|---------|-------------|

| `.pair 2547xxx` | Request a pairing code for your number. |

| `.startjadibot` | Activate your personal bot after pairing. |

| `.stopjadibot` | Stop your personal bot instance. |

| `.listjadibot` | (Owner) List all active user bots. |



Each user gets a dedicated Baileys socket and auth folder, completely isolated from the main bot.



---



\## 📈 Performance \& Reliability



| Feature | How It Works |

|---------|--------------|

| \*\*Heartbeat System\*\* | Persistent reminders, auto‑backup, and health checks keep the bot alive. |

| \*\*Fallback Chains\*\* | Multiple APIs for critical functions (translate, TTS, AI) ensure uptime. |

| \*\*Message Deduplication\*\* | `keyId` Set prevents duplicate processing. |

| \*\*Throttled Database Writes\*\* | Reduces disk I/O when using JSON storage. |

| \*\*PM2 / Termux‑Services\*\* | Process managers keep the bot running 24/7. |



---





