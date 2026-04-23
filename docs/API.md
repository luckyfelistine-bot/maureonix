\# 🔌 API Reference – Maureonix v5.0.0



This document lists all external APIs used by Maureonix, including endpoints, fallback chains, rate limits, and instructions for obtaining API keys.



---



\## 🗂️ API Summary



| Category | Primary API | Fallback(s) | Key Required |

|----------|-------------|-------------|--------------|

| AI Chat | Groq (GPT/Llama/DeepSeek) | Gemini | ✅ Yes |

| AI Image | Pollinations.ai | – | ❌ No |

| Translation | MyMemory | LibreTranslate, Google Translate | ❌ No |

| TTS | Google TTS | Voice RSS, gTTS | ⚠️ Voice RSS only |

| Background Removal | remove.bg | – | ✅ Yes |

| Weather | Open-Meteo | – | ❌ No |

| News | RSS2JSON (NY Times) | – | ❌ No |

| Crypto | CoinGecko | – | ❌ No |

| Forex | Frankfurter | – | ❌ No |

| IP Lookup | ipapi.co | – | ❌ No |

| QR Code | goQR.me | – | ❌ No |

| URL Shortener | is.gd | TinyURL | ❌ No |

| Memes | meme-api.com | – | ❌ No |

| Jokes | Official Joke API | – | ❌ No |

| Quotes | Quotable | – | ❌ No |

| Facts | Useless Facts | – | ❌ No |

| Anime GIFs | Nekos.best | waifu.pics | ❌ No |

| Text Effects | Paxsenix / Vihangayt | DavidCyrilTech | ❌ No |

| Sticker APIs | Paxsenix (ATTP/Brat) | Lolhuman | ❌ No |

| YouTube Download | yt-dlp (local) | – | ❌ No |

| TikTok | TikWM | – | ❌ No |

| Instagram | SaveInsta | – | ❌ No |

| Facebook | Fdown | – | ❌ No |

| Twitter/X | Twitter API (scrape) | – | ❌ No |

| Spotify | Spotify Downloader | – | ❌ No |

| Movie/TV | OMDB | TMDB, TVMaze | ⚠️ OMDB only |

| Anime/Manga | Jikan (MyAnimeList) | AniList | ❌ No |

| Sports | API Sports | Odds API, ESPN | ⚠️ API Sports only |

| Games (RAWG) | RAWG | – | ✅ Yes |



---



\## 🧠 AI APIs



\### Groq (GPT, Llama, DeepSeek)

\- \*\*Endpoint:\*\* `https://api.groq.com/openai/v1/chat/completions`

\- \*\*Models:\*\* `llama3-70b-8192`, `mixtral-8x7b-32768`, `gemma2-9b-it`, `deepseek-r1-distill-llama-70b`

\- \*\*Rate Limit:\*\* 30 requests/minute (free tier)

\- \*\*Key:\*\* \[Get from Groq Console](https://console.groq.com/keys)

\- \*\*Fallback:\*\* Google Gemini



\### Google Gemini

\- \*\*Endpoint:\*\* `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

\- \*\*Rate Limit:\*\* 60 requests/minute (free tier)

\- \*\*Key:\*\* \[Get from Google AI Studio](https://aistudio.google.com/app/apikey)



\### AI Image Generation (Pollinations.ai)

\- \*\*Endpoint:\*\* `https://image.pollinations.ai/prompt/{prompt}`

\- \*\*Rate Limit:\*\* Unlimited (no key required)

\- \*\*Note:\*\* Returns a direct image URL.



---



\## 🌐 Translation \& TTS



\### MyMemory Translation

\- \*\*Endpoint:\*\* `https://api.mymemory.translated.net/get`

\- \*\*Rate Limit:\*\* 1000 characters/day (anonymous)

\- \*\*Fallback:\*\* LibreTranslate → Google Translate



\### LibreTranslate

\- \*\*Endpoint:\*\* `https://translate.argosopentech.com/translate`

\- \*\*Rate Limit:\*\* Public instance, may be slow

\- \*\*Languages:\*\* 30+ including Sinhala (`si`)



\### Google Translate TTS

\- \*\*Endpoint:\*\* `https://translate.google.com/translate\_tts`

\- \*\*Rate Limit:\*\* No documented limit (free)

\- \*\*Note:\*\* Returns MP3 audio.



\### Voice RSS TTS

\- \*\*Endpoint:\*\* `https://api.voicerss.org/`

\- \*\*Rate Limit:\*\* 350 requests/day (free tier)

\- \*\*Key:\*\* \[Get from Voice RSS](https://www.voicerss.org/registration.aspx)



---



\## 🎨 Media \& Sticker APIs



\### remove.bg

\- \*\*Endpoint:\*\* `https://api.remove.bg/v1.0/removebg`

\- \*\*Rate Limit:\*\* 50 images/month (free tier)

\- \*\*Key:\*\* \[Get from remove.bg](https://www.remove.bg/api)



\### Paxsenix (ATTP, Brat, Text Effects)

\- \*\*Base URL:\*\* `https://api.paxsenix.biz.id`

\- \*\*Endpoints:\*\*

&nbsp; - `/sticker/attp?text={text}`

&nbsp; - `/maker/brat?text={text}`

&nbsp; - `/text-effect/{effect}?text={text}`

\- \*\*Rate Limit:\*\* Unknown (free public API)

\- \*\*Fallback:\*\* Lolhuman API (demo key)



---



\## 📥 Downloader APIs



| Platform | Method | Notes |

|----------|--------|-------|

| YouTube | yt-dlp (local subprocess) | Uses `yt-dlp` Python package |

| TikTok | TikWM scraping | No key required |

| Instagram | SaveInsta scraping | No key required |

| Facebook | Fdown scraping | No key required |

| Twitter/X | Twitter API (guest token) | May break; fallback available |

| Spotify | spotifydl.com scraping | No key required |



---



\## 🔍 Search \& Utility APIs



| API | Endpoint | Rate Limit | Key |

|-----|----------|------------|-----|

| Wikipedia | `https://en.wikipedia.org/api/rest\_v1/page/summary/{title}` | Unlimited | ❌ |

| GitHub | `https://api.github.com/search/repositories` | 60/hour (unauthenticated) | ❌ |

| NPM | `https://registry.npmjs.org/{package}` | Unlimited | ❌ |

| Urban Dictionary | `https://api.urbandictionary.com/v0/define` | Unlimited | ❌ |

| Open-Meteo (Weather) | `https://api.open-meteo.com/v1/forecast` | 10,000/day | ❌ |

| CoinGecko (Crypto) | `https://api.coingecko.com/api/v3/simple/price` | 30/minute | ❌ |

| Frankfurter (Forex) | `https://api.frankfurter.app/latest` | Unlimited | ❌ |

| ipapi.co (IP Lookup) | `https://ipapi.co/{ip}/json/` | 1000/day | ❌ |

| goQR.me | `https://api.qrserver.com/v1/create-qr-code/` | Unlimited | ❌ |

| is.gd (URL Shortener) | `https://is.gd/create.php` | Unlimited | ❌ |



---



\## 😂 Fun APIs



| API | Endpoint | Notes |

|-----|----------|-------|

| Meme API | `https://meme-api.com/gimme` | Reddit memes |

| Official Joke API | `https://official-joke-api.appspot.com/random\_joke` | Random jokes |

| Quotable | `https://api.quotable.io/random` | Inspirational quotes |

| Useless Facts | `https://uselessfacts.jsph.pl/random.json` | Random facts |

| Nekos.best | `https://nekos.best/api/v2/{category}` | Anime GIFs |

| waifu.pics | `https://api.waifu.pics/sfw/{category}` | Fallback anime GIFs |



---



\## 🎬 Movies \& TV APIs



\### OMDB (Open Movie Database)

\- \*\*Endpoint:\*\* `http://www.omdbapi.com/`

\- \*\*Rate Limit:\*\* 1000/day (free tier)

\- \*\*Key:\*\* \[Get from OMDB](http://www.omdbapi.com/apikey.aspx)

\- \*\*Note:\*\* Used for `.movie`, `.imdb`, `.series`, `.rating`.



\### TMDB (The Movie Database) – Planned

\- \*\*Endpoint:\*\* `https://api.themoviedb.org/3/`

\- \*\*Rate Limit:\*\* 50 requests/second

\- \*\*Key:\*\* \[Get from TMDB](https://www.themoviedb.org/settings/api)



\### TVMaze

\- \*\*Endpoint:\*\* `https://api.tvmaze.com/`

\- \*\*Rate Limit:\*\* 20 requests/10 seconds

\- \*\*Key:\*\* ❌ No key required



\### AniList (Anime/Manga)

\- \*\*Endpoint:\*\* `https://graphql.anilist.co`

\- \*\*Rate Limit:\*\* 90 requests/minute

\- \*\*Key:\*\* ❌ No key required



\### Jikan (MyAnimeList)

\- \*\*Endpoint:\*\* `https://api.jikan.moe/v4/`

\- \*\*Rate Limit:\*\* 3 requests/second

\- \*\*Key:\*\* ❌ No key required



---



\## ⚽ Sports APIs



\### API Sports (Football)

\- \*\*Base URL:\*\* `https://v3.football.api-sports.io/`

\- \*\*Rate Limit:\*\* 100 requests/day (free tier)

\- \*\*Key:\*\* \[Get from API Sports](https://dashboard.api-football.com/)

\- \*\*Endpoints:\*\*

&nbsp; - `/leagues` – List leagues

&nbsp; - `/fixtures` – Upcoming matches

&nbsp; - `/standings` – League table

&nbsp; - `/teams` – Team info

&nbsp; - `/players` – Player stats

&nbsp; - `/predictions` – Match predictions



\### Odds API (Betting)

\- \*\*Base URL:\*\* `https://api.the-odds-api.com/v4/`

\- \*\*Rate Limit:\*\* 500 requests/month (free tier)

\- \*\*Key:\*\* \[Get from The Odds API](https://the-odds-api.com/)



\### ESPN (Free)

\- \*\*Base URL:\*\* `https://site.api.espn.com/apis/site/v2/sports/`

\- \*\*Rate Limit:\*\* Unknown (public API)

\- \*\*Key:\*\* ❌ No key required



---



\## 🎮 Games APIs



\### RAWG (Video Game Database)

\- \*\*Base URL:\*\* `https://api.rawg.io/api/`

\- \*\*Rate Limit:\*\* 20,000 requests/month (free tier)

\- \*\*Key:\*\* \[Get from RAWG](https://rawg.io/apidocs)

\- \*\*Endpoints:\*\*

&nbsp; - `/games` – Search games

&nbsp; - `/games/{id}` – Game details

&nbsp; - `/games/{id}/screenshots`

&nbsp; - `/games/{id}/movies` – Trailers

&nbsp; - `/games/{id}/stores`



---



\## 🔄 Fallback Strategy



Maureonix uses a \*\*waterfall fallback\*\* pattern for critical commands. If the primary API fails (network error, rate limit, invalid response), the next API in the chain is tried.



\### Example: `.translate`



MyMemory API

↓ (fail)



LibreTranslate API

↓ (fail)



Google Translate (scraping)

↓ (fail)



Error message to user





\### Example: `.tts`



Google TTS (free)

↓ (fail)



Voice RSS (API key)

↓ (fail)



gTTS (local generation)

↓ (fail)



Paxsenix TTS API

↓ (fail)



Error message to user





This design ensures maximum uptime even when individual services are down.



---



\## 📊 Rate Limit Handling



| API | Handling Strategy |

|-----|-------------------|

| Groq / Gemini | Queue requests; notify user if limit exceeded |

| remove.bg | Return friendly error; suggest free alternative |

| MyMemory | Fallback to other translation APIs |

| API Sports | Cache responses for 5 minutes |

| CoinGecko | Cache for 60 seconds |



---



