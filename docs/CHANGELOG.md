\# 📝 Changelog – Maureonix



All notable changes to this project will be documented in this file.



The format is based on \[Keep a Changelog](https://keepachangelog.com/en/1.0.0/),

and this project adheres to \[Semantic Versioning](https://semver.org/spec/v2.0.0.html).



---



\## \[5.0.0] – 2026-04-20



\### 🚀 Added – Major Feature Expansion

\- \*\*50+ Automation Toggles\*\* – Auto-view status, auto-react, auto-reply mentions, auto-translate, auto-sticker, auto-forward, auto-delete, auto-block/kick/mute keywords, auto-welcome/goodbye, and more.

\- \*\*RAWG Game Database\*\* – Search 800,000+ games, get details, screenshots, trailers, store links (`.rawg`, `.gameinfo`, `.screenshots`, `.trailers`, `.topgames`).

\- \*\*Casino Suite\*\* – Roulette, Crash, Dice, Coinflip, RPS with betting (`.roulette`, `.crash`, `.dice`, `.coinflip`, `.rps`).

\- \*\*RPG Adventure\*\* – Persistent character progression, fight enemies, heal, earn gold and XP (`.rpg fight`, `.rpg heal`, `.rpg spawn`).

\- \*\*Live Sports\*\* – Football scores, standings, fixtures, H2H, predictions, betting odds via API Sports and ESPN (`.leagues`, `.fixtures`, `.live`, `.standings`, `.team`, `.player`, `.h2h`, `.predict`, `.odds`, `.espn`).

\- \*\*Movie \& TV APIs\*\* – Full integration with OMDB, TMDB, TVMaze, AniList, Jikan (`.movie`, `.imdb`, `.series`, `.rating`, `.tv`, `.episodes`, `.anime`, `.manga`, `.trendinganime`).

\- \*\*Master Command Suite\*\* – Health calculators (BMI, BMR, TDEE, macros), finance (stocks, crypto, portfolio), travel (packing, world clock, itinerary), food recipes, developer utilities.

\- \*\*Productivity System\*\* – Persistent reminders with heartbeat, notes, to‑do lists, habit tracker, mood logger, water intake, expense tracker (`.remindme`, `.note`, `.todo`, `.habit`, `.mood`, `.water`, `.expense`).

\- \*\*Enhanced AI\*\* – Groq‑powered models (GPT‑4, Llama 3, DeepSeek) alongside Gemini; AI memory (context retention); image generation via Pollinations.ai.

\- \*\*remove.bg Integration\*\* – One‑click background removal (`.removebg`) using provided API key.

\- \*\*Voice RSS TTS\*\* – High‑quality text‑to‑speech with multi‑language support (`.tts`).

\- \*\*Interactive Carousel Menu\*\* – Swipeable category cards for easy navigation.

\- \*\*JadiBot Multi‑User Pairing\*\* – Users can pair their own WhatsApp numbers and run personal bot instances (`.pair`, `.startjadibot`, `.stopjadibot`).



\### 🔧 Changed

\- Refactored `nima\_commands.js` into modular `case` blocks for maintainability.

\- Moved automation logic from scattered places into a unified execution block in `nima\_core.js`.

\- Improved fallback chains for translation, TTS, and sticker APIs.

\- Database schema extended to support new features (reminders, notes, todos, jadibot sessions).



\### 🛠️ Fixed

\- Duplicate `formatDate` declaration causing syntax error on startup.

\- `keyId.has is not a function` error by ensuring `keyId` is always a Set after JSON load.

\- YouTube download failures due to missing `yt-dlp` fallback.

\- TTS "audio not available" by adding multiple fallback services.



\### 🗑️ Removed

\- Deprecated QR‑only login; pairing code is now default and more reliable.



---



\## \[4.2.0] – 2025-12-10



\### Added

\- Anti‑delete, anti‑virtex, anti‑link, anti‑toxic group protections.

\- Tag status detection and auto‑warn/kick.

\- Basic economy system (daily, work, rob, balance, transfer).

\- Simple games: Connect 4, Suit, Slot, Blackjack, TicTacToe.

\- YouTube, TikTok, Instagram downloaders.



\### Changed

\- Upgraded to Baileys v7.0.0-rc.9 for multi‑device stability.



---



\## \[4.0.0] – 2025-09-01



\### Added

\- Initial public release.

\- Core bot commands (ping, alive, menu, owner).

\- Group management (add, kick, promote, demote, tagall).

\- AI chat with Gemini and GPT via Groq.

\- Sticker maker, ATTP, QC, brat.

\- Search commands (Google, Wiki, Urban, Weather, News).

\- Fun commands (joke, meme, quote, fact, 8ball).



---



\## \[Unreleased]

\### Planned for v5.1.0

\- Daraja (M‑Pesa) integration for in‑app donations.

\- WhatsApp Business API support for larger groups.

\- Web dashboard for real‑time monitoring.

\- Voice command support (experimental).

\- introducing .pair to allow multi user.





---



\*\*Legend:\*\*

\- 🚀 Added – New features

\- 🔧 Changed – Changes in existing functionality

\- 🛠️ Fixed – Bug fixes

\- 🗑️ Removed – Deprecated features

