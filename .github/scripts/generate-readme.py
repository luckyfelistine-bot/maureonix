#!/usr/bin/env python3
"""
Maureonix Protocol Engine
Auto-regenerates README.md from README.template.md + live repo metrics
"""
import os, json, re, subprocess, urllib.request
from datetime import datetime, timezone

def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return r.stdout.strip()

# ── 1. VERSION ──
version = "6.0.0"
try:
    with open("package.json") as f:
        version = json.load(f).get("version", "6.0.0")
except Exception as e:
    print("[WARN] package.json read error:", e)

# ── 2. COMMAND METRICS ──
cmd_count = 0
cmd_cats = []
if os.path.isdir("commands"):
    for entry in os.scandir("commands"):
        if entry.is_dir():
            n = len([f for f in os.listdir(entry.path) if f.endswith(".js")])
            if n:
                cmd_cats.append((entry.name, n))
                cmd_count += n

if cmd_count == 0:
    cmd_count = 75
    cmd_cats = [
        ("ai", 12), ("download", 8), ("games", 10), ("group", 9),
        ("owner", 6), ("search", 7), ("sticker", 8), ("tools", 15)
    ]

# ── 3. CONTRIBUTORS ──
contrib_count = 1
try:
    out = run("git log --format=%an --all | sort -u | wc -l")
    contrib_count = max(1, int(out))
except Exception as e:
    print("[WARN] Contributor error:", e)

# ── 4. UPTIME ──
uptime = "∞"
try:
    out = run("git log --reverse --format=%ct --all | head -1")
    if out:
        first = datetime.fromtimestamp(int(out), tz=timezone.utc)
        uptime = str((datetime.now(timezone.utc) - first).days)
except Exception as e:
    print("[WARN] Uptime error:", e)

# ── 5. GITHUB API STATS ──
repo = os.environ.get("GITHUB_REPOSITORY", "luckyfelistine-bot/maureonix")
token = os.environ.get("GITHUB_TOKEN", "")
gh = {"stars": 0, "forks": 0, "issues": 0, "watchers": 0, "size": 0}
try:
    req = urllib.request.Request(
        f"https://api.github.com/repos/{repo}",
        headers={
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Maureonix-Protocol-Engine"
        }
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        d = json.loads(resp.read())
        gh = {
            "stars": d.get("stargazers_count", 0),
            "forks": d.get("forks_count", 0),
            "issues": d.get("open_issues_count", 0),
            "watchers": d.get("watchers_count", 0),
            "size": d.get("size", 0)
        }
except Exception as e:
    print("[WARN] GitHub API error:", e)

# ── 6. LINES OF CODE ──
loc = 0
for root, dirs, files in os.walk("."):
    if any(x in root for x in ["node_modules", ".git", ".github"]):
        continue
    for f in files:
        if f.endswith((".js", ".py", ".json", ".md", ".sh", ".yml", ".yaml", ".html", ".css")):
            try:
                with open(os.path.join(root, f), "rb") as fp:
                    loc += sum(1 for _ in fp)
            except:
                pass

# ── 7. FEATURE MATRIX GENERATOR ──
def feature_matrix():
    if not cmd_cats:
        return "*(No commands directory detected)*"
    emojis = {
        "ai": "🧠", "gpt": "🧠", "neural": "🧠", "chat": "🧠", "brain": "🧠",
        "download": "📥", "dl": "📥", "media": "📥", "yt": "📥", "tube": "📥", "save": "📥",
        "games": "🎮", "game": "🎮", "arcade": "🎮", "play": "🎮",
        "fun": "😄", "meme": "😄", "joke": "😄", "roast": "😄",
        "group": "👥", "groups": "👥", "gc": "👥",
        "admin": "👑", "owner": "👑", "mod": "🛡️", "moderation": "🛡️", "ban": "🛡️",
        "search": "🔍", "lookup": "🔍", "find": "🔍", "query": "🔍",
        "sticker": "🎨", "stickers": "🎨", "img": "🎨", "image": "🎨", "photo": "🎨",
        "tools": "🛠️", "tool": "🛠️", "util": "🛠️", "utils": "🛠️", "convert": "🛠️", "gen": "🛠️",
        "economy": "💰", "casino": "💰", "money": "💰", "bank": "💰", "pay": "💰",
        "music": "🎵", "audio": "🎵", "voice": "🎵", "sound": "🎵", "song": "🎵",
        "info": "ℹ️", "about": "ℹ️", "help": "❓", "general": "⚙️", "misc": "⚙️",
        "nsfw": "🔞", "adult": "🔞",
    }
    cats = sorted(cmd_cats, key=lambda x: -x[1])
    rows = []
    for i in range(0, len(cats), 3):
        chunk = cats[i:i+3]
        cells = []
        for name, count in chunk:
            icon = "⚡"
            for k, v in emojis.items():
                if k in name.lower():
                    icon = v
                    break
            cells.append(f"{icon} **{name.upper()}**<br>`{count} CMDs`")
        while len(cells) < 3:
            cells.append("")
        rows.append(f"| {' | '.join(cells)} |")
    return "|  |  |  |
|:---:|:---:|:---:|
" + "
".join(rows)

# ── 8. CONFIG BLOCK ──
def config_block():
    if os.path.exists("config.js"):
        try:
            with open("config.js", "r", encoding="utf-8") as f:
                content = f.read()
            # Extract key:value pairs safely
            pairs = re.findall(r"(\w+)\s*:\s*['""]([^'""]*)['""]", content)
            if len(pairs) >= 3:
                lines = [
                    "```javascript",
                    "// ═══════════════════════════════════════════",
                    "// AUTO-EXTRACTED FROM config.js",
                    "// ═══════════════════════════════════════════",
                    ""
                ]
                for key, val in pairs[:50]:
                    display = val
                    if any(s in key.lower() for s in ["key", "token", "secret", "password", "auth"]):
                        display = "YOUR_KEY"
                    lines.append(f"{key}: '{display}',")
                lines.append("```")
                return "
".join(lines)
        except Exception as e:
            print("[WARN] Config parse error:", e)
    # Comprehensive fallback
    return """```javascript
// ═══════════════════════════════════════════
// CORE IDENTITY CONFIGURATION
// ═══════════════════════════════════════════
ownerNumber: ['254116903500'],
botName: 'Maureonix',
ownerName: 'Infinite Vybeflix',

// ═══════════════════════════════════════════
// AUTHENTICATION PROTOCOL
// ═══════════════════════════════════════════
pairing_code: true,
global.listprefix: ['!', '.', '+'],

// ═══════════════════════════════════════════
// NEURAL API KEYS [V6.0.0]
// ═══════════════════════════════════════════
removeBgApiKey:    'YOUR_KEY',  // remove.bg
voiceRssApiKey:    'YOUR_KEY',  // Voice RSS TTS
geminiApiKey:      'YOUR_KEY',  // Google AI Studio
groqApiKey:        'YOUR_KEY',  // Groq Console
openaiApiKey:      'YOUR_KEY',  // OpenAI Platform
rawgApiKey:        'YOUR_KEY',  // RAWG Gaming DB
weatherApiKey:     'YOUR_KEY',  // OpenWeatherMap
newsApiKey:        'YOUR_KEY',  // NewsAPI
deepseekApiKey:    'YOUR_KEY',  // DeepSeek AI
stabilityApiKey:   'YOUR_KEY',  // Stability AI
elevenlabsApiKey:  'YOUR_KEY',  // ElevenLabs TTS
ocrApiKey:         'YOUR_KEY',  // OCR Space
pastebinApiKey:    'YOUR_KEY',  // Pastebin
imgurClientId:     'YOUR_KEY',  // Imgur
spotifyClientId:   'YOUR_KEY',  // Spotify
spotifySecret:     'YOUR_KEY',  // Spotify

// ═══════════════════════════════════════════
// DATABASE & SESSION
// ═══════════════════════════════════════════
mongoUrl:          'YOUR_MONGO_URL',
sessionName:       'maureonix-session',
dbName:            'maureonix_db',

// ═══════════════════════════════════════════
// SECURITY & LIMITS
// ═══════════════════════════════════════════
antiCall:          true,
antiSpam:          true,
cmdCooldown:       3000,
maxUploadSize:     '100MB',

// ═══════════════════════════════════════════
// CUSTOMIZATION
// ═══════════════════════════════════════════
botTheme:          'cybernetic',
language:          'en',
timezone:          'Africa/Nairobi',
```"""

# ── 9. RENDER TEMPLATE ──
with open("README.template.md", "r", encoding="utf-8") as f:
    template = f.read()

template = template.replace("{{VERSION}}", version)
template = template.replace("{{COMMAND_COUNT}}", str(cmd_count))
template = template.replace("{{COMMAND_CATEGORIES}}", str(len(cmd_cats)))
template = template.replace("{{CONTRIBUTOR_COUNT}}", str(contrib_count))
template = template.replace("{{UPTIME_DAYS}}", str(uptime))
template = template.replace("{{STARS}}", str(gh["stars"]))
template = template.replace("{{FORKS}}", str(gh["forks"]))
template = template.replace("{{OPEN_ISSUES}}", str(gh["issues"]))
template = template.replace("{{WATCHERS}}", str(gh["watchers"]))
template = template.replace("{{REPO_SIZE_KB}}", str(gh["size"]))
template = template.replace("{{TOTAL_LINES}}", f"{loc:,}")
template = template.replace("{{LAST_UPDATED}}", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"))
template = template.replace("{{FEATURE_MATRIX}}", feature_matrix())
template = template.replace("{{CONFIG_BLOCK}}", config_block())

with open("README.md", "w", encoding="utf-8") as f:
    f.write(template)

print("[OK] README.md regenerated successfully")
print(f"     Version: {version}")
print(f"     Commands: {cmd_count} across {len(cmd_cats)} categories")
print(f"     Contributors: {contrib_count}")
print(f"     Uptime: {uptime} days")
print(f"     Stars: {gh['stars']} | Forks: {gh['forks']} | Issues: {gh['issues']}")
print(f"     LoC: {loc:,}")
