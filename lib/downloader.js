'use strict'
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║          MAUREONIX — ULTIMATE DOWNLOADER ENGINE  v5.0                  ║
 * ║                                                                          ║
 * ║  Research-verified engine priority (April 2025):                       ║
 * ║                                                                          ║
 * ║  TikTok   → TikWM API → Cobalt   (yt-dlp broken on TikTok since 2025) ║
 * ║  Spotify  → spotdl    (sources YouTube, no premium)                    ║
 * ║  Social   → Cobalt API → gallery-dl → yt-dlp                          ║
 * ║  Generic  → yt-dlp (2000+ sites) → direct HTTP                        ║
 * ║  Images   → gallery-dl                                                 ║
 * ║                                                                          ║
 * ║  Features : Smart routing · Bulk concurrent · URL fetcher              ║
 * ║             Fetch-related (give example, get similar URLs)             ║
 * ║             Auto-retry · ffmpeg compress · File cleanup               ║
 * ║  Hosting  : Railway-native (nixpacks, pure process spawns)            ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

const { spawn }     = require('child_process')
const { execFile }  = require('child_process')
const { promisify } = require('util')
const path          = require('path')
const fs            = require('fs')
const os            = require('os')
const https         = require('https')
const http          = require('http')

const execFileAsync = promisify(execFile)

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIG  (all overridable via Railway env vars)
// ─────────────────────────────────────────────────────────────────────────────
const DL_DIR        = process.env.DL_DIR         || path.join(os.tmpdir(), 'maureonix_dl')
const YTDLP_BIN     = process.env.YTDLP_BIN      || 'yt-dlp'
const FFMPEG_BIN    = process.env.FFMPEG_BIN      || 'ffmpeg'
const GALLERYDL_BIN = process.env.GALLERYDL_BIN   || 'gallery-dl'
const SPOTDL_BIN    = process.env.SPOTDL_BIN      || 'spotdl'
// ⚠️  api.cobalt.tools is bot-protected and must NOT be used directly.
//     Set COBALT_API in Railway env to point to YOUR own self-hosted instance.
//     If not set, the bot auto-discovers free no-auth community instances.
const COBALT_API_OVERRIDE = process.env.COBALT_API || null
const TIKWM_API     = process.env.TIKWM_API       || 'https://www.tikwm.com'
const MAX_CONCURRENT= parseInt(process.env.DL_CONCURRENCY || '4', 10)
const TG_MAX_MB     = 49           // Telegram Bot API hard cap
const DL_TIMEOUT_MS = 360_000      // 6 min per single download
const MAX_RETRIES   = 3

// ── Cobalt instance state (auto-discovered, rotated on failure) ────────────
let _cobaltInstances   = []          // list from instances.cobalt.best
let _cobaltInstanceIdx = 0           // current index
let _cobaltCacheTime   = 0           // last fetch timestamp
const COBALT_CACHE_TTL = 10 * 60 * 1000  // re-fetch every 10 minutes

/**
 * Fetch a working no-auth Cobalt instance URL.
 * Priority: COBALT_API env var → best community instance from instances.cobalt.best
 */
async function getCobaltInstance() {
  if (COBALT_API_OVERRIDE) return COBALT_API_OVERRIDE

  const now = Date.now()
  if (_cobaltInstances.length === 0 || now - _cobaltCacheTime > COBALT_CACHE_TTL) {
    try {
      const axios = require('axios')
      const res = await axios.get('https://instances.cobalt.best/api', {
        headers: {
          // Required — the instance list blocks default user-agents
          'User-Agent': 'maureonix-bot/1.0 (+https://t.me/maureonix)',
          'Accept'    : 'application/json',
        },
        timeout: 15_000,
      })
      const list = Array.isArray(res.data) ? res.data : []
      _cobaltInstances = list
        .filter(i => i.online === true && i.info?.auth === false && i.info?.cors !== false)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .map(i => `${i.protocol || 'https'}://${i.api}`)
      _cobaltCacheTime   = now
      _cobaltInstanceIdx = 0
    } catch (e) {
      // if instance list fails, fall back silently — cobaltDownload will throw and yt-dlp takes over
      _cobaltInstances = []
    }
  }

  if (_cobaltInstances.length === 0) throw new Error('No working Cobalt instances available')
  // rotate through instances — if current one fails, caller bumps _cobaltInstanceIdx
  return _cobaltInstances[_cobaltInstanceIdx % _cobaltInstances.length]
}

if (!fs.existsSync(DL_DIR)) fs.mkdirSync(DL_DIR, { recursive: true })
setInterval(() => cleanupOldFiles(3_600_000), 3_600_000)

// ─────────────────────────────────────────────────────────────────────────────
//  PLATFORM  DETECTOR
// ─────────────────────────────────────────────────────────────────────────────
const PLATFORM_PATTERNS = [
  [/tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com/i, 'tiktok'     ],
  [/spotify\.com/i,                                'spotify'    ],
  [/instagram\.com/i,                              'instagram'  ],
  [/twitter\.com|x\.com/i,                         'twitter'    ],
  [/pinterest\.com|pin\.it/i,                      'pinterest'  ],
  [/youtube\.com|youtu\.be/i,                      'youtube'    ],
  [/soundcloud\.com/i,                             'soundcloud' ],
  [/reddit\.com|redd\.it/i,                        'reddit'     ],
  [/deezer\.com/i,                                 'deezer'     ],
  [/tidal\.com/i,                                  'tidal'      ],
  [/twitch\.tv/i,                                  'twitch'     ],
  [/bandcamp\.com/i,                               'bandcamp'   ],
  [/audiomack\.com/i,                              'audiomack'  ],
  [/vimeo\.com/i,                                  'vimeo'      ],
  [/dailymotion\.com/i,                            'dailymotion'],
  [/rumble\.com/i,                                 'rumble'     ],
  [/drive\.google\.com/i,                          'gdrive'     ],
  [/mediafire\.com/i,                              'mediafire'  ],
  [/facebook\.com|fb\.watch/i,                     'facebook'   ],
  [/kick\.com/i,                                   'kick'       ],
  [/odysee\.com/i,                                 'odysee'     ],
  [/bitchute\.com/i,                               'bitchute'   ],
  [/mixcloud\.com/i,                               'mixcloud'   ],
  [/streamable\.com/i,                             'streamable' ],
  [/threads\.net/i,                                'threads'    ],
  [/snapchat\.com/i,                               'snapchat'   ],
  [/pornhub\.com/i,                                'pornhub'    ],
  [/xvideos\.com/i,                                'xvideos'    ],
  [/xnxx\.com/i,                                   'xnxx'       ],
  [/spankbang\.com/i,                              'spankbang'  ],
  [/youporn\.com/i,                                'youporn'    ],
  [/redtube\.com/i,                                'redtube'    ],
  [/tube8\.com/i,                                  'tube8'      ],
  [/loom\.com/i,                                   'loom'       ],
  [/capcut\.com/i,                                 'capcut'     ],
  [/likee\.video/i,                                'likee'      ],
  [/trovo\.live/i,                                 'trovo'      ],
  [/bilibili\.com/i,                               'bilibili'   ],
  [/nicovideo\.jp/i,                               'nicovideo'  ],
  [/apkmirror\.com|apkpure\.com|aptoide\.com/i,    'apk'        ],
]

function detectPlatform(url) {
  for (const [re, name] of PLATFORM_PATTERNS) {
    if (re.test(url)) return name
  }
  return 'generic'
}

// Cobalt-first platforms (Cobalt → yt-dlp)
const COBALT_FIRST = new Set([
  'instagram','twitter','youtube','pinterest','vimeo','facebook',
  'soundcloud','streamable','kick','twitch','dailymotion','reddit',
  'snapchat','threads','rumble','bilibili','capcut','loom',
])

// gallery-dl platforms
const GALLERYDL_FIRST = new Set([
  'instagram','pinterest','twitter','reddit','likee',
])

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
function getFileSizeMB(fp) {
  try { return fs.statSync(fp).size / (1024 * 1024) } catch { return 0 }
}

function cleanupFile(fp) {
  try { if (fp && fs.existsSync(fp)) fs.unlinkSync(fp) } catch {}
}

function cleanupOldFiles(maxAgeMs = 3_600_000) {
  try {
    const now = Date.now()
    for (const f of fs.readdirSync(DL_DIR)) {
      const fp = path.join(DL_DIR, f)
      try { const s = fs.statSync(fp); if (s.isFile() && now - s.mtimeMs > maxAgeMs) fs.unlinkSync(fp) }
      catch {}
    }
  } catch {}
}

function scanDirForNew(dir, maxAgeMs = 600_000) {
  const now = Date.now()
  try {
    return fs.readdirSync(dir)
      .map(f => path.join(dir, f))
      .filter(fp => { try { const s = fs.statSync(fp); return s.isFile() && now - s.mtimeMs < maxAgeMs } catch { return false } })
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
  } catch { return [] }
}

function sanitiseFilename(name = '') {
  return name.replace(/[/\\?%*:|"<>\r\n]/g, '_').replace(/\s+/g, ' ').trim().slice(0, 180) || `file_${Date.now()}`
}

function extractURLs(text = '') {
  return [...new Set((text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/gi) || []))]
}

function guessMime(fp) {
  const ext = path.extname(fp).toLowerCase()
  return {
    '.mp4':'video','.mkv':'video','.avi':'video','.mov':'video','.webm':'video','.flv':'video',
    '.mp3':'audio','.m4a':'audio','.ogg':'audio','.flac':'audio','.wav':'audio','.aac':'audio',
    '.jpg':'photo','.jpeg':'photo','.png':'photo','.gif':'animation','.webp':'photo',
    '.pdf':'document','.apk':'document','.zip':'document','.rar':'document',
  }[ext] || 'document'
}

// follow redirects to resolve short links (vm.tiktok.com etc.)
function resolveRedirect(url) {
  return new Promise((resolve) => {
    try {
      const proto = url.startsWith('https') ? https : http
      const req = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
        req.destroy()
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, url).toString())
        } else {
          resolve(url)
        }
      })
      req.on('error', () => resolve(url))
      req.setTimeout(10000, () => { req.destroy(); resolve(url) })
    } catch { resolve(url) }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  DIRECT  HTTP  DOWNLOADER
// ─────────────────────────────────────────────────────────────────────────────
function downloadHTTP(url, dest, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 8) return reject(new Error('Too many HTTP redirects'))
    const UA    = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124'
    const proto = url.startsWith('https') ? https : http
    const req   = proto.get(url, { headers: { 'User-Agent': UA, Referer: url } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).toString()
        return downloadHTTP(next, dest, redirectCount + 1).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}: ${url}`))
      const out = fs.createWriteStream(dest)
      res.pipe(out)
      out.on('finish', () => resolve(dest))
      out.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(DL_TIMEOUT_MS, () => { req.destroy(); reject(new Error('HTTP download timeout')) })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  TIKWM  API  ← PRIMARY engine for TikTok (yt-dlp broken on TT since 2025)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Download a TikTok video via TikWM API (free, no key, no watermark).
 * Also resolves short links (vm.tiktok.com, vt.tiktok.com).
 * @param {string} url
 * @param {boolean} audioOnly
 * @param {Function} onProgress
 * @returns {Promise<string[]>}
 */
async function tikwmDownload(url, audioOnly = false, onProgress = null) {
  const axios = require('axios')

  // Resolve short links first
  const resolved = await resolveRedirect(url)
  onProgress?.(`🔗 Resolved: ${resolved.slice(0, 60)}`)

  const form = new URLSearchParams()
  form.append('url', resolved)
  form.append('hd', '1')

  const res = await axios.post(`${TIKWM_API}/api/`, form.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent'  : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer'     : 'https://www.tikwm.com/',
    },
    timeout: 30_000,
  })

  const d = res.data
  if (!d || d.code !== 0) {
    throw new Error(`TikWM API error: ${d?.msg || JSON.stringify(d).slice(0, 100)}`)
  }

  const data = d.data

  // images / slideshow post
  if (data.images && data.images.length > 0) {
    onProgress?.(`🖼️ Slideshow post — ${data.images.length} images`)
    const files = []
    let i = 0
    for (const imgUrl of data.images) {
      i++
      const ext  = imgUrl.includes('.webp') ? '.webp' : '.jpg'
      const fname = sanitiseFilename(`tikwm_${data.id || Date.now()}_${i}${ext}`)
      const dest  = path.join(DL_DIR, fname)
      onProgress?.(`⬇️ Image ${i}/${data.images.length}`)
      await downloadHTTP(imgUrl, dest)
      files.push(dest)
    }
    if (audioOnly && data.music) {
      const adest = path.join(DL_DIR, sanitiseFilename(`tikwm_${data.id || Date.now()}_audio.mp3`))
      await downloadHTTP(data.music, adest)
      files.push(adest)
    }
    return files
  }

  // standard video post
  if (audioOnly && data.music) {
    onProgress?.('🎵 Extracting audio...')
    const adest = path.join(DL_DIR, sanitiseFilename(`${data.title || 'tiktok'}_audio.mp3`))
    await downloadHTTP(data.music, adest)
    return [adest]
  }

  // prefer HD, fallback to SD
  const videoUrl = data.hdplay || data.play
  if (!videoUrl) throw new Error('TikWM: no video URL in response')

  onProgress?.('⬇️ Downloading TikTok (no watermark)...')
  const fname = sanitiseFilename(`${data.title || 'tiktok'}_${data.id || Date.now()}.mp4`)
  const dest  = path.join(DL_DIR, fname)
  await downloadHTTP(videoUrl, dest)
  return [dest]
}

/**
 * Search TikTok for videos via TikWM keyword search.
 * @param {string} keyword
 * @param {number} count
 * @returns {Promise<string[]>}  array of tiktok video URLs
 */
async function tikwmSearch(keyword, count = 10) {
  const axios  = require('axios')
  const res    = await axios.get(`${TIKWM_API}/api/feed/search`, {
    params : { keywords: keyword, count, cursor: 0, web: 1, hd: 1 },
    headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.tikwm.com/' },
    timeout: 20_000,
  })
  const videos = res.data?.data?.videos || []
  return videos.map(v => `https://www.tiktok.com/@${v.author?.unique_id || 'user'}/video/${v.video_id || v.id}`)
}

// ─────────────────────────────────────────────────────────────────────────────
//  COBALT  API
// ─────────────────────────────────────────────────────────────────────────────
async function cobaltDownload(url, audioOnly = false, onProgress = null) {
  const axios = require('axios')
  const body  = {
    url,
    videoQuality          : '1080',
    audioFormat           : audioOnly ? 'mp3' : 'best',
    downloadMode          : audioOnly ? 'audio' : 'auto',
    filenameStyle         : 'pretty',
    tiktokFullAudio       : true,
    tiktokH265            : false,
    removeTikTokWatermark : true,
    youtubeHLS            : false,
  }

  // Try each community instance, rotate on auth/network failure
  let lastErr = null
  const maxAttempts = 3

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let instanceUrl
    try {
      instanceUrl = await getCobaltInstance()
    } catch (e) {
      throw new Error(`Cobalt: no instances available — ${e.message}`)
    }

    try {
      onProgress?.(`🔷 Cobalt → ${instanceUrl.replace('https://', '')}`)
      const res = await axios.post(`${instanceUrl}/`, body, {
        headers: {
          Accept         : 'application/json',
          'Content-Type' : 'application/json',
          'User-Agent'   : 'maureonix-bot/1.0 (+https://t.me/maureonix)',
        },
        timeout: 30_000,
      })
      const d = res.data
      if (d.status === 'error') {
        if (d.error?.code?.includes('auth')) {
          _cobaltInstanceIdx++; lastErr = new Error(`auth required on ${instanceUrl}`); continue
        }
        throw new Error(`Cobalt: ${d.error?.code || JSON.stringify(d.error)}`)
      }

      const files = []
      if (d.status === 'redirect' || d.status === 'tunnel') {
        const fname = sanitiseFilename(d.filename || `cobalt_${Date.now()}.mp4`)
        const dest  = path.join(DL_DIR, fname)
        onProgress?.('⬇️ Cobalt streaming...')
        await downloadHTTP(d.url, dest)
        files.push(dest)
      } else if (d.status === 'picker') {
        onProgress?.(`📦 ${d.picker.length} items in carousel`)
        let i = 0
        for (const item of d.picker) {
          i++
          const fname = sanitiseFilename(item.filename || `cobalt_${Date.now()}_${i}.mp4`)
          const dest  = path.join(DL_DIR, fname)
          onProgress?.(`⬇️ Item ${i}/${d.picker.length}`)
          await downloadHTTP(item.url, dest)
          files.push(dest)
        }
      } else {
        throw new Error(`Unexpected Cobalt status: ${d.status}`)
      }
      return files

    } catch (e) {
      lastErr = e
      _cobaltInstanceIdx++
    }
  }
  throw lastErr || new Error('Cobalt: all instances failed')
}

// ─────────────────────────────────────────────────────────────────────────────
//  YT-DLP  (universal 2000+ sites — NOT used for TikTok)
// ─────────────────────────────────────────────────────────────────────────────
function buildYtdlpArgs(url, opts = {}) {
  const { audioOnly = false, quality = 'best', playlist = false, outputTemplate = null } = opts
  const tpl  = outputTemplate || path.join(DL_DIR, '%(title).120B.%(ext)s')
  const args = [
    '--no-warnings',
    '--merge-output-format', 'mp4',
    '--concurrent-fragments', '8',
    '--retries', String(MAX_RETRIES),
    '--fragment-retries', String(MAX_RETRIES),
    '--file-access-retries', '3',
    '--extractor-retries', '3',
    '--retry-sleep', '2',
    '--socket-timeout', '30',
    '-o', tpl,
    '--ffmpeg-location', FFMPEG_BIN,
    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    '--add-header', 'Accept-Language:en-US,en;q=0.9',
    '--no-check-certificates',
    '--geo-bypass',
  ]
  if (!playlist) args.push('--no-playlist')
  if (audioOnly) {
    args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0')
  } else {
    const fmt = quality === 'best'
      ? 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best'
      : `bestvideo[height<=${quality}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${quality}]`
    args.push('-f', fmt, '--embed-thumbnail', '--embed-metadata')
  }
  if (url) args.push(url)
  return args
}

function ytdlpDownload(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const args   = buildYtdlpArgs(url, opts)
    const proc   = spawn(YTDLP_BIN, args)
    let lastFile = null
    let stderr   = ''
    const timer  = setTimeout(() => { proc.kill(); reject(new Error('yt-dlp timeout')) }, DL_TIMEOUT_MS)

    proc.stdout.on('data', d => {
      const s = d.toString()
      const dm = s.match(/\[download\] Destination:\s+(.+)/)
      if (dm) lastFile = dm[1].trim()
      const mm = s.match(/\[Merger\] Merging formats into "(.+)"/)
      if (mm) lastFile = mm[1].trim().replace(/^"/, '').replace(/"$/, '')
      const am = s.match(/\[ExtractAudio\] Destination:\s+(.+)/)
      if (am) lastFile = am[1].trim()
    })
    proc.stderr.on('data', d => { stderr += d.toString() })
    proc.on('close', code => {
      clearTimeout(timer)
      if (code === 0) {
        if (lastFile && fs.existsSync(lastFile)) return resolve([lastFile])
        const found = scanDirForNew(DL_DIR)
        if (found.length) return resolve(found)
        return reject(new Error('yt-dlp: no output file found'))
      }
      reject(new Error(`yt-dlp exit ${code}: ${stderr.slice(-600)}`))
    })
    proc.on('error', e => { clearTimeout(timer); reject(e) })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  SPOTDL  (Spotify — no premium needed)
// ─────────────────────────────────────────────────────────────────────────────
function spotdlDownload(url, onProgress = null) {
  return new Promise((resolve, reject) => {
    const args  = [
      '--output', path.join(DL_DIR, '{title} - {artists}'),
      '--format', 'mp3',
      '--bitrate', '320k',
      '--threads', '4',
      '--no-cache',
      url,
    ]
    const proc  = spawn(SPOTDL_BIN, args)
    const files = []
    let stderr  = ''
    const timer = setTimeout(() => { proc.kill(); reject(new Error('spotdl timeout')) }, DL_TIMEOUT_MS * 2)

    proc.stdout.on('data', d => {
      const s = d.toString()
      onProgress?.(s.trim().slice(0, 80))
      for (const m of (s.match(/Downloaded "(.+?)"/g) || [])) {
        const name = m.replace(/Downloaded "|"/g, '').trim()
        const fp   = fs.existsSync(name) ? name : path.join(DL_DIR, path.basename(name))
        if (fs.existsSync(fp)) files.push(fp)
      }
    })
    proc.stderr.on('data', d => { stderr += d.toString() })
    proc.on('close', code => {
      clearTimeout(timer)
      const out = files.length > 0 ? files : scanDirForNew(DL_DIR)
      if (code === 0 || out.length > 0) return resolve(out)
      reject(new Error(`spotdl exit ${code}: ${stderr.slice(-300)}`))
    })
    proc.on('error', e => { clearTimeout(timer); reject(e) })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  GALLERY-DL  (image galleries, Pinterest, Instagram archives)
// ─────────────────────────────────────────────────────────────────────────────
function galleryDlDownload(url, onProgress = null) {
  return new Promise((resolve, reject) => {
    const args  = ['--dest', DL_DIR, '--no-mtime', '--retries', '3', '--sleep', '0.3', url]
    const proc  = spawn(GALLERYDL_BIN, args)
    const files = []
    let stderr  = ''
    const timer = setTimeout(() => { proc.kill(); reject(new Error('gallery-dl timeout')) }, DL_TIMEOUT_MS)

    proc.stdout.on('data', d => {
      for (const line of d.toString().split('\n')) {
        const t = line.trim()
        if (t && fs.existsSync(t)) { files.push(t); onProgress?.(path.basename(t).slice(0, 50)) }
      }
    })
    proc.stderr.on('data', d => { stderr += d.toString() })
    proc.on('close', code => {
      clearTimeout(timer)
      const out = files.length > 0 ? files : scanDirForNew(DL_DIR)
      if (code === 0 || out.length > 0) return resolve(out)
      reject(new Error(`gallery-dl exit ${code}: ${stderr.slice(-300)}`))
    })
    proc.on('error', e => { clearTimeout(timer); reject(e) })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  GOOGLE DRIVE
// ─────────────────────────────────────────────────────────────────────────────
async function gdriveDownload(url) {
  const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/)
  if (!idMatch) throw new Error('Cannot extract Google Drive file ID from URL')
  const fileId = idMatch[1]
  const dlUrl  = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`
  try { return await ytdlpDownload(dlUrl) } catch {}
  const dest = path.join(DL_DIR, `gdrive_${fileId}`)
  await downloadHTTP(dlUrl, dest)
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  MEDIAFIRE
// ─────────────────────────────────────────────────────────────────────────────
async function mediafireDownload(url) {
  const axios = require('axios')
  const res   = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 })
  // try direct download link pattern
  const m1 = res.data.match(/href="(https:\/\/download\d*\.mediafire\.com\/[^"]+)"/)
  const m2 = res.data.match(/id="downloadButton"[^>]+href="([^"]+)"/)
  const dlUrl = (m1 || m2)?.[1]
  if (!dlUrl) throw new Error('MediaFire: cannot find direct download link')
  const dest = path.join(DL_DIR, `mediafire_${Date.now()}`)
  await downloadHTTP(dlUrl, dest)
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  APK  STORES
// ─────────────────────────────────────────────────────────────────────────────
async function apkDownload(url) {
  try { return await ytdlpDownload(url) } catch {}
  const dest = path.join(DL_DIR, `app_${Date.now()}.apk`)
  await downloadHTTP(url, dest)
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  FFMPEG  COMPRESS  (shrink over-limit files before sending to Telegram)
// ─────────────────────────────────────────────────────────────────────────────
function ffmpegCompress(src) {
  const dest = src.replace(/\.[^.]+$/, '') + '_cmp.mp4'
  return new Promise((resolve, reject) => {
    const args  = ['-y', '-i', src, '-c:v', 'libx264', '-preset', 'fast', '-crf', '28',
                   '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', dest]
    const proc  = spawn(FFMPEG_BIN, args)
    let stderr  = ''
    const timer = setTimeout(() => { proc.kill(); reject(new Error('ffmpeg timeout')) }, 180_000)
    proc.stderr.on('data', d => { stderr += d.toString() })
    proc.on('close', code => {
      clearTimeout(timer)
      if (code === 0 && fs.existsSync(dest)) return resolve(dest)
      reject(new Error(`ffmpeg exit ${code}`))
    })
    proc.on('error', e => { clearTimeout(timer); reject(e) })
  })
}

async function ensureUnderLimit(filepath) {
  if (!filepath || !fs.existsSync(filepath)) throw new Error(`File not found: ${filepath}`)
  if (getFileSizeMB(filepath) <= TG_MAX_MB) return filepath
  const isVideo = /\.(mp4|mkv|avi|mov|webm|flv)$/i.test(filepath)
  if (!isVideo) throw new Error(`File too large (${getFileSizeMB(filepath).toFixed(1)} MB) and cannot be compressed`)
  const compressed = await ffmpegCompress(filepath)
  if (getFileSizeMB(compressed) <= TG_MAX_MB) return compressed
  throw new Error(`Still too large after compression (${getFileSizeMB(compressed).toFixed(1)} MB). Split required.`)
}

// ─────────────────────────────────────────────────────────────────────────────
//  SMART  ROUTER  —  single URL, picks best engine automatically
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {string}   url
 * @param {object}   opts
 * @param {boolean}  opts.audioOnly
 * @param {string}   opts.quality  'best'|'1080'|'720'|'480'|'360'
 * @param {Function} opts.onProgress (message: string) => void
 * @returns {Promise<string[]>}  array of local file paths
 */
async function smartDownload(url, opts = {}) {
  const { audioOnly = false, quality = 'best', onProgress = null } = opts
  const log      = m => onProgress?.(m)
  const platform = detectPlatform(url)
  log(`🔍 Platform detected: ${platform}`)

  // ── TikTok ── TikWM primary, Cobalt secondary (NEVER use yt-dlp for TT)
  if (platform === 'tiktok') {
    try {
      log('🎵 TikWM API (no watermark)...')
      return await tikwmDownload(url, audioOnly, log)
    } catch (e) {
      log(`⚠️ TikWM failed: ${e.message} — trying Cobalt...`)
    }
    try {
      log('🔷 Cobalt fallback...')
      return await cobaltDownload(url, audioOnly, log)
    } catch (e2) {
      throw new Error(`TikTok download failed. TikWM: ${e2.message}`)
    }
  }

  // ── Spotify ── spotdl only
  if (platform === 'spotify') {
    log('🟢 spotDL → Spotify...')
    return await spotdlDownload(url, log)
  }

  // ── Google Drive ──
  if (platform === 'gdrive') {
    log('📁 Google Drive...')
    return await gdriveDownload(url)
  }

  // ── MediaFire ──
  if (platform === 'mediafire') {
    log('📦 MediaFire scraper...')
    return await mediafireDownload(url)
  }

  // ── APK stores ──
  if (platform === 'apk') {
    log('📱 APK downloader...')
    return await apkDownload(url)
  }

  // ── Cobalt-first platforms ──
  if (COBALT_FIRST.has(platform)) {
    try {
      log(`🔷 Cobalt → ${platform}...`)
      return await cobaltDownload(url, audioOnly, log)
    } catch (e) {
      log(`⚠️ Cobalt: ${e.message} → yt-dlp fallback`)
    }
  }

  // ── gallery-dl for image-heavy platforms ──
  if (GALLERYDL_FIRST.has(platform) && !audioOnly) {
    try {
      log(`🖼️ gallery-dl → ${platform}...`)
      const files = await galleryDlDownload(url, log)
      if (files.length > 0) return files
    } catch (e) {
      log(`⚠️ gallery-dl: ${e.message} → yt-dlp fallback`)
    }
  }

  // ── yt-dlp universal (2000+ sites) ──
  log(`⚡ yt-dlp → ${platform}...`)
  return await ytdlpDownload(url, { audioOnly, quality })
}

// ─────────────────────────────────────────────────────────────────────────────
//  BULK  DOWNLOADER  — concurrent sliding window
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Download many URLs concurrently (MAX_CONCURRENT at a time).
 * @param {string[]}  urls
 * @param {object}    opts
 * @returns {Promise<{results, errors, total, succeeded}>}
 */
async function bulkDownload(urls, opts = {}) {
  const { audioOnly = false, quality = 'best', onProgress = null } = opts
  const results = [], errors = []
  const total   = urls.length
  let done      = 0

  const notify = (url, status, extra = {}) => {
    done++
    onProgress?.({ done, total, url, status, ...extra })
  }

  const queue  = [...urls]
  const active = new Set()

  await new Promise(resolve => {
    const schedule = () => {
      while (active.size < MAX_CONCURRENT && queue.length > 0) {
        const url  = queue.shift()
        const task = smartDownload(url, {
          audioOnly, quality,
          onProgress: m => onProgress?.({ done, total, url, status: 'progress', message: m }),
        })
          .then(files => { results.push({ url, files }); notify(url, 'done', { files }) })
          .catch(err  => { errors.push({ url, error: err.message }); notify(url, 'error', { error: err.message }) })
          .finally(() => { active.delete(task); schedule() })
        active.add(task)
      }
      if (active.size === 0 && queue.length === 0) resolve()
    }
    schedule()
  })

  return { results, errors, total, succeeded: results.length }
}

// ─────────────────────────────────────────────────────────────────────────────
//  URL  FETCHER  — search for downloadable URLs
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Find downloadable URLs for a query.
 * @param {string}  query
 * @param {object}  opts
 * @param {number}  opts.count   — max URLs to return (default 10)
 * @param {string}  opts.site    — restrict to domain e.g. 'youtube.com'
 * @param {string}  opts.type    — 'any'|'video'|'audio'|'image'
 * @returns {Promise<string[]>}
 */
async function fetchURLs(query, opts = {}) {
  const { count = 10, site = null, type = 'any' } = opts
  const axios   = require('axios')
  const results = new Set()

  // ── TikTok keyword search via TikWM ──────────────────────────────────────
  if (site && /tiktok/i.test(site)) {
    try {
      const ttUrls = await tikwmSearch(query, Math.min(count, 35))
      for (const u of ttUrls) results.add(u)
    } catch {}
    return [...results].slice(0, count)
  }

  // ── YouTube via yt-dlp ytsearch (no API key) ──────────────────────────────
  if (!site || /youtube/i.test(site) || type === 'video' || type === 'audio') {
    try {
      const n    = Math.min(count, 25)
      const term = site && !/youtube/i.test(site) ? `${site} ${query}` : query
      const { stdout } = await execFileAsync(
        YTDLP_BIN,
        [`ytsearch${n}:${term}`, '--get-url', '--no-playlist', '--no-warnings', '--skip-download'],
        { timeout: 30_000 }
      )
      for (const u of stdout.trim().split('\n').filter(Boolean)) results.add(u)
    } catch {}
  }

  // ── DuckDuckGo HTML scrape (no API key) ───────────────────────────────────
  if (results.size < count) {
    try {
      const q   = site ? `site:${site} ${query}` : query
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}&kl=wt-wt`
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124' },
        timeout: 20_000,
      })
      const re = /uddg=([^&"]+)/g
      let m
      while ((m = re.exec(res.data)) !== null && results.size < count * 3) {
        try {
          const u = decodeURIComponent(m[1])
          if (u.startsWith('http') && !u.includes('duckduckgo.com')) results.add(u)
        } catch {}
      }
    } catch {}
  }

  // ── yt-dlp site search page ───────────────────────────────────────────────
  if (results.size < count && site) {
    try {
      const searchURL = `https://${site}/search?q=${encodeURIComponent(query)}`
      const { stdout } = await execFileAsync(
        YTDLP_BIN,
        [searchURL, '--get-url', '--no-warnings', '--skip-download',
         '--flat-playlist', '--playlist-end', String(count)],
        { timeout: 20_000 }
      )
      for (const u of stdout.trim().split('\n').filter(Boolean)) results.add(u)
    } catch {}
  }

  return [...results].slice(0, count)
}

// ─────────────────────────────────────────────────────────────────────────────
//  FETCH  RELATED  — give an example URL, get similar content URLs
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Given an example URL (or piece of content), fetch related/similar URLs.
 *
 * Strategy:
 *  1. Detect platform from URL
 *  2. Extract keywords from URL (title, path, query string, hashtags)
 *  3. Search that same platform for similar content
 *  4. Optionally also search YouTube as a cross-platform sweep
 *
 * @param {string}  exampleUrl
 * @param {object}  opts
 * @param {number}  opts.count         — how many related URLs to return (default 10)
 * @param {boolean} opts.crossPlatform — also search YouTube regardless of source platform
 * @param {string}  opts.extraQuery    — extra search terms to narrow results
 * @returns {Promise<{platform: string, query: string, urls: string[]}>}
 */
async function fetchRelated(exampleUrl, opts = {}) {
  const { count = 10, crossPlatform = false, extraQuery = '' } = opts
  const axios    = require('axios')
  const platform = detectPlatform(exampleUrl)
  const results  = new Set()

  // ── Step 1: Extract keywords from the URL + its metadata ─────────────────
  let keywords = ''

  // a) Parse URL path tokens
  try {
    const u       = new URL(exampleUrl)
    const tokens  = [
      ...u.pathname.split(/[/_\-+.?&=]+/),
      ...u.searchParams.values(),
    ]
    keywords = tokens
      .filter(t => t.length > 2 && !/^\d+$/.test(t) && !/^(www|com|net|org|http|https|video|watch|post|p|v|reel|status|clip)$/i.test(t))
      .slice(0, 8)
      .join(' ')
  } catch {}

  // b) Try fetching yt-dlp metadata (title) for richer keywords — fast attempt
  if (platform !== 'tiktok') {
    try {
      const { stdout } = await execFileAsync(
        YTDLP_BIN,
        [exampleUrl, '--skip-download', '--print', 'title', '--no-warnings'],
        { timeout: 15_000 }
      )
      const title = stdout.trim()
      if (title && title.length > 3) {
        // strip timestamps, emojis, common filler
        const clean = title.replace(/[#@\[\](){}|*^~`]+/g, ' ')
                           .replace(/\b(ft|feat|official|music|video|lyrics|hd|4k|full)\b/gi, '')
                           .replace(/\s{2,}/g, ' ').trim()
        keywords = clean.slice(0, 80)
      }
    } catch {}
  } else {
    // TikTok: use TikWM to get title
    try {
      const axios2 = require('axios')
      const form   = new URLSearchParams()
      form.append('url', exampleUrl)
      form.append('hd', '0')
      const r = await axios2.post(`${TIKWM_API}/api/`, form.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15_000 })
      const t = r.data?.data?.title
      if (t) keywords = t.replace(/#\S+/g, '').trim().slice(0, 80)

      // Also grab hashtags from title — great for TikTok search
      const tags = (r.data?.data?.title || '').match(/#\w+/g) || []
      if (tags.length) keywords += ' ' + tags.slice(0, 3).join(' ')
    } catch {}
  }

  if (!keywords && extraQuery) keywords = extraQuery
  if (!keywords) keywords = exampleUrl.split('/').pop()?.split('?')[0] || 'trending'
  if (extraQuery) keywords = `${keywords} ${extraQuery}`.trim()

  keywords = keywords.trim().slice(0, 100)

  // ── Step 2: Search on same platform ─────────────────────────────────────
  if (platform === 'tiktok') {
    try {
      const ttUrls = await tikwmSearch(keywords, Math.min(count + 5, 35))
      for (const u of ttUrls) { if (u !== exampleUrl) results.add(u) }
    } catch {}
  } else if (platform === 'youtube') {
    try {
      const { stdout } = await execFileAsync(
        YTDLP_BIN,
        [`ytsearch${Math.min(count + 3, 25)}:${keywords}`, '--get-url', '--no-playlist', '--no-warnings', '--skip-download'],
        { timeout: 30_000 }
      )
      for (const u of stdout.trim().split('\n').filter(Boolean)) { if (u !== exampleUrl) results.add(u) }
    } catch {}
  } else if (platform === 'soundcloud' || platform === 'bandcamp' || platform === 'audiomack') {
    try {
      const { stdout } = await execFileAsync(
        YTDLP_BIN,
        [`scsearch${Math.min(count + 3, 20)}:${keywords}`, '--get-url', '--no-playlist', '--no-warnings', '--skip-download'],
        { timeout: 30_000 }
      )
      for (const u of stdout.trim().split('\n').filter(Boolean)) { if (u !== exampleUrl) results.add(u) }
    } catch {}
    // also search YouTube
    crossPlatform && await _ytSearch(keywords, count, exampleUrl, results)
  } else {
    // Generic: DuckDuckGo on same site + YouTube cross-search
    try {
      const domainMatch = exampleUrl.match(/https?:\/\/(?:www\.)?([^/]+)/)
      const domain      = domainMatch?.[1] || ''
      const q   = domain ? `site:${domain} ${keywords}` : keywords
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}&kl=wt-wt`
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124' },
        timeout: 20_000,
      })
      const re = /uddg=([^&"]+)/g
      let m
      while ((m = re.exec(res.data)) !== null && results.size < count * 3) {
        try {
          const u = decodeURIComponent(m[1])
          if (u.startsWith('http') && !u.includes('duckduckgo.com') && u !== exampleUrl) results.add(u)
        } catch {}
      }
    } catch {}
    await _ytSearch(keywords, count, exampleUrl, results)
  }

  // ── Cross-platform YouTube sweep ─────────────────────────────────────────
  if (crossPlatform && platform !== 'youtube') {
    await _ytSearch(keywords, Math.min(count, 5), exampleUrl, results)
  }

  const urls = [...results].filter(u => u !== exampleUrl).slice(0, count)
  return { platform, query: keywords, urls }
}

async function _ytSearch(keywords, count, exclude, resultsSet) {
  try {
    const { stdout } = await execFileAsync(
      YTDLP_BIN,
      [`ytsearch${Math.min(count, 15)}:${keywords}`, '--get-url', '--no-playlist', '--no-warnings', '--skip-download'],
      { timeout: 25_000 }
    )
    for (const u of stdout.trim().split('\n').filter(Boolean)) {
      if (u !== exclude) resultsSet.add(u)
    }
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  // ── Primary API ────────────────────────────────────────────────────────────
  smartDownload,
  bulkDownload,
  fetchURLs,
  fetchRelated,
  // ── Individual engines ────────────────────────────────────────────────────
  tikwmDownload,
  tikwmSearch,
  cobaltDownload,
  ytdlpDownload,
  spotdlDownload,
  galleryDlDownload,
  gdriveDownload,
  mediafireDownload,
  apkDownload,
  // ── Helpers ───────────────────────────────────────────────────────────────
  detectPlatform,
  extractURLs,
  guessMime,
  ensureUnderLimit,
  getFileSizeMB,
  cleanupFile,
  cleanupOldFiles,
  downloadHTTP,
  resolveRedirect,
  sanitiseFilename,
  // ── Constants ─────────────────────────────────────────────────────────────
  DL_DIR,
  TG_MAX_MB,
}