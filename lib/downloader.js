'use strict'
/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║          MAUREONIX  —  ULTIMATE DOWNLOADER ENGINE  v4.0               ║
 * ║                                                                         ║
 * ║  Engines  : yt-dlp (2000+ sites) · Cobalt API · spotdl               ║
 * ║             gallery-dl · direct HTTP · ffmpeg post-process            ║
 * ║  Features : Smart routing · Bulk/concurrent · Progress CB            ║
 * ║             Auto-retry · File cleanup · URL fetcher                  ║
 * ║  Hosting  : Railway-native (no Docker deps, pure process spawns)     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
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
const DL_DIR        = process.env.DL_DIR        || path.join(os.tmpdir(), 'maureonix_dl')
const YTDLP_BIN     = process.env.YTDLP_BIN     || 'yt-dlp'
const FFMPEG_BIN    = process.env.FFMPEG_BIN     || 'ffmpeg'
const GALLERYDL_BIN = process.env.GALLERYDL_BIN  || 'gallery-dl'
const SPOTDL_BIN    = process.env.SPOTDL_BIN     || 'spotdl'
const COBALT_API    = process.env.COBALT_API     || 'https://api.cobalt.tools'
const MAX_CONCURRENT= parseInt(process.env.DL_CONCURRENCY || '4', 10)
const TG_MAX_MB     = 49          // Telegram Bot API hard cap
const DL_TIMEOUT_MS = 360_000     // 6 min per single download
const MAX_RETRIES   = 3

// ensure temp download dir exists
if (!fs.existsSync(DL_DIR)) fs.mkdirSync(DL_DIR, { recursive: true })
// auto-clean files older than 1 hour every hour
setInterval(() => cleanupOldFiles(3_600_000), 3_600_000)

// ─────────────────────────────────────────────────────────────────────────────
//  PLATFORM  DETECTOR
// ─────────────────────────────────────────────────────────────────────────────
const PLATFORM_PATTERNS = [
  [/tiktok\.com|vm\.tiktok\.com/i,              'tiktok'      ],
  [/spotify\.com/i,                             'spotify'     ],
  [/instagram\.com/i,                           'instagram'   ],
  [/twitter\.com|x\.com/i,                      'twitter'     ],
  [/pinterest\.com|pin\.it/i,                   'pinterest'   ],
  [/youtube\.com|youtu\.be/i,                   'youtube'     ],
  [/soundcloud\.com/i,                          'soundcloud'  ],
  [/reddit\.com|redd\.it/i,                     'reddit'      ],
  [/deezer\.com/i,                              'deezer'      ],
  [/tidal\.com/i,                               'tidal'       ],
  [/twitch\.tv/i,                               'twitch'      ],
  [/bandcamp\.com/i,                            'bandcamp'    ],
  [/audiomack\.com/i,                           'audiomack'   ],
  [/vimeo\.com/i,                               'vimeo'       ],
  [/dailymotion\.com/i,                         'dailymotion' ],
  [/rumble\.com/i,                              'rumble'      ],
  [/drive\.google\.com/i,                       'gdrive'      ],
  [/mediafire\.com/i,                           'mediafire'   ],
  [/facebook\.com|fb\.watch/i,                  'facebook'    ],
  [/kick\.com/i,                                'kick'        ],
  [/odysee\.com/i,                              'odysee'      ],
  [/bitchute\.com/i,                            'bitchute'    ],
  [/mixcloud\.com/i,                            'mixcloud'    ],
  [/streamable\.com/i,                          'streamable'  ],
  [/threads\.net/i,                             'threads'     ],
  [/snapchat\.com/i,                            'snapchat'    ],
  [/pornhub\.com/i,                             'pornhub'     ],
  [/xvideos\.com/i,                             'xvideos'     ],
  [/xnxx\.com/i,                                'xnxx'        ],
  [/spankbang\.com/i,                           'spankbang'   ],
  [/youporn\.com/i,                             'youporn'     ],
  [/redtube\.com/i,                             'redtube'     ],
  [/tube8\.com/i,                               'tube8'       ],
  [/loom\.com/i,                                'loom'        ],
  [/capcut\.com/i,                              'capcut'      ],
  [/likee\.video/i,                             'likee'       ],
  [/trovo\.live/i,                              'trovo'       ],
  [/bilibili\.com/i,                            'bilibili'    ],
  [/nicovideo\.jp/i,                            'nicovideo'   ],
  [/apkmirror\.com|apkpure\.com|aptoide\.com/i, 'apk'         ],
]

function detectPlatform(url) {
  for (const [re, name] of PLATFORM_PATTERNS) {
    if (re.test(url)) return name
  }
  return 'generic'
}

// platforms where Cobalt is tried first
const COBALT_PLATFORMS = new Set([
  'tiktok','instagram','twitter','youtube','pinterest',
  'vimeo','facebook','soundcloud','streamable','kick',
  'twitch','dailymotion','reddit','snapchat','threads',
  'rumble','bilibili','capcut','loom',
])

// platforms where gallery-dl excels
const GALLERYDL_PLATFORMS = new Set([
  'instagram','pinterest','twitter','reddit','likee',
])

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
function getFileSizeMB(fp) {
  try { return fs.statSync(fp).size / (1024 * 1024) } catch { return 0 }
}

function cleanupFile(fp) {
  try { fs.unlinkSync(fp) } catch {}
}

function cleanupOldFiles(maxAgeMs = 3_600_000) {
  try {
    const now = Date.now()
    for (const f of fs.readdirSync(DL_DIR)) {
      const fp = path.join(DL_DIR, f)
      try {
        const s = fs.statSync(fp)
        if (s.isFile() && now - s.mtimeMs > maxAgeMs) fs.unlinkSync(fp)
      } catch {}
    }
  } catch {}
}

function scanDirForNew(dir, maxAgeMs = 600_000) {
  const now = Date.now()
  try {
    return fs.readdirSync(dir)
      .map(f => path.join(dir, f))
      .filter(fp => {
        try { const s = fs.statSync(fp); return s.isFile() && now - s.mtimeMs < maxAgeMs }
        catch { return false }
      })
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
  } catch { return [] }
}

function sanitiseFilename(name) {
  return name.replace(/[/\\?%*:|"<>]/g, '_').slice(0, 200)
}

function extractURLs(text) {
  const re = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi
  return [...new Set((text.match(re) || []))]
}

function guessMime(fp) {
  const ext = path.extname(fp).toLowerCase()
  const MAP = {
    '.mp4':'video', '.mkv':'video', '.avi':'video', '.mov':'video',
    '.webm':'video', '.flv':'video',
    '.mp3':'audio', '.m4a':'audio', '.ogg':'audio', '.flac':'audio',
    '.wav':'audio', '.aac':'audio',
    '.jpg':'photo', '.jpeg':'photo', '.png':'photo',
    '.gif':'animation', '.webp':'photo',
    '.pdf':'document', '.apk':'document', '.zip':'document',
  }
  return MAP[ext] || 'document'
}

// ─────────────────────────────────────────────────────────────────────────────
//  DIRECT  HTTP  DOWNLOADER
// ─────────────────────────────────────────────────────────────────────────────
function downloadHTTP(url, dest) {
  return new Promise((resolve, reject) => {
    const UA    = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    const proto = url.startsWith('https') ? https : http
    const req   = proto.get(url, { headers: { 'User-Agent': UA } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadHTTP(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}: ${url}`))
      const out = fs.createWriteStream(dest)
      res.pipe(out)
      out.on('finish', () => resolve(dest))
      out.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(DL_TIMEOUT_MS, () => { req.destroy(); reject(new Error('HTTP timeout')) })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  COBALT  API
// ─────────────────────────────────────────────────────────────────────────────
async function cobaltDownload(url, audioOnly = false, onProgress = null) {
  const axios = require('axios')
  const body  = {
    url,
    videoQuality             : '1080',
    audioFormat              : audioOnly ? 'mp3' : 'best',
    downloadMode             : audioOnly ? 'audio' : 'auto',
    filenameStyle            : 'pretty',
    tiktokFullAudio          : true,
    tiktokH265               : false,
    removeTikTokWatermark    : true,
    youtubeHLS               : false,
  }
  const res = await axios.post(`${COBALT_API}/`, body, {
    headers : { Accept: 'application/json', 'Content-Type': 'application/json' },
    timeout : 30_000,
  })
  const d = res.data
  if (d.status === 'error') throw new Error(`Cobalt: ${d.error?.code || JSON.stringify(d.error)}`)

  const files = []
  if (d.status === 'redirect' || d.status === 'tunnel') {
    const fname = sanitiseFilename(d.filename || `cobalt_${Date.now()}.mp4`)
    const dest  = path.join(DL_DIR, fname)
    onProgress?.('⬇️ Downloading via Cobalt...')
    await downloadHTTP(d.url, dest)
    files.push(dest)
  } else if (d.status === 'picker') {
    onProgress?.(`📦 Carousel detected — ${d.picker.length} items`)
    let idx = 0
    for (const item of d.picker) {
      idx++
      const fname = sanitiseFilename(item.filename || `cobalt_${Date.now()}_${idx}.mp4`)
      const dest  = path.join(DL_DIR, fname)
      onProgress?.(`⬇️ Item ${idx}/${d.picker.length}...`)
      await downloadHTTP(item.url, dest)
      files.push(dest)
    }
  } else {
    throw new Error(`Unexpected Cobalt status: ${d.status}`)
  }
  return files
}

// ─────────────────────────────────────────────────────────────────────────────
//  YT-DLP
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
    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
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
    const args     = buildYtdlpArgs(url, opts)
    const proc     = spawn(YTDLP_BIN, args)
    let lastFile   = null
    let stderr     = ''
    const timer    = setTimeout(() => { proc.kill(); reject(new Error('yt-dlp timeout')) }, DL_TIMEOUT_MS)

    proc.stdout.on('data', d => {
      const s = d.toString()
      const dm = s.match(/\[download\] Destination:\s+(.+)/)
      if (dm) lastFile = dm[1].trim()
      const mm = s.match(/\[Merger\] Merging formats into "(.+)"/)
      if (mm) lastFile = mm[1].trim()
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
        reject(new Error('yt-dlp: no output file found'))
      } else {
        reject(new Error(`yt-dlp exit ${code}: ${stderr.slice(-600)}`))
      }
    })
    proc.on('error', e => { clearTimeout(timer); reject(e) })
  })
}

function ytdlpBatch(urls, opts = {}) {
  const listFile = path.join(DL_DIR, `batch_${Date.now()}.txt`)
  fs.writeFileSync(listFile, urls.join('\n'), 'utf8')
  return new Promise((resolve, reject) => {
    const baseArgs = buildYtdlpArgs('', opts)  // no trailing url
    const args     = [...baseArgs, '--batch-file', listFile]
    const proc     = spawn(YTDLP_BIN, args)
    const files    = new Set()
    let stderr     = ''
    const timer    = setTimeout(() => { proc.kill(); reject(new Error('yt-dlp batch timeout')) }, DL_TIMEOUT_MS * 3)

    proc.stdout.on('data', d => {
      const s = d.toString()
      for (const m of (s.match(/\[download\] Destination:\s+(.+)/g) || [])) {
        const fp = m.replace('[download] Destination: ', '').trim()
        if (fp && fs.existsSync(fp)) files.add(fp)
      }
      for (const m of (s.match(/\[Merger\] Merging formats into "(.+)"/g) || [])) {
        const fp = m.replace(/.*into "/, '').replace(/"$/, '').trim()
        if (fp && fs.existsSync(fp)) files.add(fp)
      }
    })
    proc.stderr.on('data', d => { stderr += d.toString() })
    proc.on('close', code => {
      clearTimeout(timer)
      try { fs.unlinkSync(listFile) } catch {}
      const out = files.size > 0 ? [...files] : scanDirForNew(DL_DIR)
      if (code === 0 || out.length > 0) return resolve(out)
      reject(new Error(`yt-dlp batch exit ${code}: ${stderr.slice(-400)}`))
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
      const m = s.match(/Downloaded "(.+?)"/g)
      if (m) {
        for (const hit of m) {
          const fp = hit.replace(/Downloaded "|"/g, '').trim()
          const full = fs.existsSync(fp) ? fp : path.join(DL_DIR, path.basename(fp))
          if (fs.existsSync(full)) files.push(full)
        }
      }
    })
    proc.stderr.on('data', d => { stderr += d.toString() })
    proc.on('close', code => {
      clearTimeout(timer)
      if (code === 0 || files.length > 0) {
        return resolve(files.length > 0 ? files : scanDirForNew(DL_DIR))
      }
      reject(new Error(`spotdl exit ${code}: ${stderr.slice(-300)}`))
    })
    proc.on('error', e => { clearTimeout(timer); reject(e) })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  GALLERY-DL  (image galleries)
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
        if (t && fs.existsSync(t)) { files.push(t); onProgress?.(t.slice(0, 60)) }
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
  if (!idMatch) throw new Error('Could not extract Google Drive file ID')
  const fileId   = idMatch[1]
  const endpoint = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`
  try {
    return await ytdlpDownload(endpoint)
  } catch {
    const dest = path.join(DL_DIR, `gdrive_${fileId}`)
    await downloadHTTP(endpoint, dest)
    return [dest]
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  MEDIAFIRE
// ─────────────────────────────────────────────────────────────────────────────
async function mediafireDownload(url) {
  const axios = require('axios')
  const res   = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 15000,
  })
  const match = res.data.match(/href="(https:\/\/download\d+\.mediafire\.com[^"]+)"/)
  if (!match) throw new Error('Could not find MediaFire direct link')
  const dest = path.join(DL_DIR, `mediafire_${Date.now()}`)
  await downloadHTTP(match[1], dest)
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  APK STORES
// ─────────────────────────────────────────────────────────────────────────────
async function apkDownload(url) {
  try { return await ytdlpDownload(url) } catch {}
  const dest = path.join(DL_DIR, `app_${Date.now()}.apk`)
  await downloadHTTP(url, dest)
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  FFMPEG  COMPRESS  (shrink files over TG limit)
// ─────────────────────────────────────────────────────────────────────────────
function ffmpegCompress(src) {
  const dest = src.replace(/\.[^.]+$/, '') + '_compressed.mp4'
  return new Promise((resolve, reject) => {
    const args  = [
      '-y', '-i', src,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '28',
      '-c:a', 'aac', '-b:a', '128k',
      '-movflags', '+faststart',
      dest,
    ]
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
  if (getFileSizeMB(filepath) <= TG_MAX_MB) return filepath
  const isVideo = /\.(mp4|mkv|avi|mov|webm|flv)$/i.test(filepath)
  if (!isVideo) throw new Error(`File too large (${getFileSizeMB(filepath).toFixed(1)} MB) and not compressible`)
  const compressed = await ffmpegCompress(filepath)
  if (getFileSizeMB(compressed) <= TG_MAX_MB) return compressed
  throw new Error(`Still too large after compression (${getFileSizeMB(compressed).toFixed(1)} MB)`)
}

// ─────────────────────────────────────────────────────────────────────────────
//  SMART  ROUTER  — single URL
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Download one URL using the best engine automatically.
 * @param {string}   url
 * @param {object}   opts
 * @param {boolean}  opts.audioOnly
 * @param {string}   opts.quality   'best'|'720'|'480'|'360'
 * @param {Function} opts.onProgress (message: string) => void
 * @returns {Promise<string[]>}
 */
async function smartDownload(url, opts = {}) {
  const { audioOnly = false, quality = 'best', onProgress = null } = opts
  const log      = m => onProgress?.(m)
  const platform = detectPlatform(url)

  log(`🔍 Platform: ${platform}`)

  if (platform === 'spotify') {
    log('🎵 spotDL → Spotify...')
    return await spotdlDownload(url, log)
  }

  if (platform === 'gdrive') {
    log('📁 Google Drive downloader...')
    return await gdriveDownload(url)
  }

  if (platform === 'mediafire') {
    log('📦 MediaFire scraper...')
    return await mediafireDownload(url)
  }

  if (platform === 'apk') {
    log('📱 APK downloader...')
    return await apkDownload(url)
  }

  if (COBALT_PLATFORMS.has(platform)) {
    try {
      log(`🔷 Cobalt API → ${platform}...`)
      return await cobaltDownload(url, audioOnly, log)
    } catch (e) {
      log(`⚠️ Cobalt failed (${e.message}) → yt-dlp fallback`)
    }
  }

  if (GALLERYDL_PLATFORMS.has(platform) && !audioOnly) {
    try {
      log(`🖼️ gallery-dl → ${platform}...`)
      const files = await galleryDlDownload(url, log)
      if (files.length > 0) return files
    } catch (e) {
      log(`⚠️ gallery-dl failed (${e.message}) → yt-dlp fallback`)
    }
  }

  log(`⚡ yt-dlp → ${platform}...`)
  return await ytdlpDownload(url, { audioOnly, quality })
}

// ─────────────────────────────────────────────────────────────────────────────
//  BULK  DOWNLOADER  — concurrent queue
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Download many URLs concurrently (up to MAX_CONCURRENT at a time).
 * @param {string[]}  urls
 * @param {object}    opts
 * @param {boolean}   opts.audioOnly
 * @param {string}    opts.quality
 * @param {Function}  opts.onProgress  ({done,total,url,status,files?,error?,message?}) => void
 * @returns {Promise<{results,errors,total,succeeded}>}
 */
async function bulkDownload(urls, opts = {}) {
  const { audioOnly = false, quality = 'best', onProgress = null } = opts
  const results = []
  const errors  = []
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
//  URL  FETCHER  — search & return downloadable URLs
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Search for URLs matching a query, optionally scoped to a site.
 * @param {string}  query
 * @param {object}  opts
 * @param {number}  opts.count    number of URLs wanted (default 10)
 * @param {string}  opts.site     restrict to domain, e.g. 'youtube.com'
 * @param {string}  opts.type     'any'|'video'|'audio'|'image'
 * @returns {Promise<string[]>}
 */
async function fetchURLs(query, opts = {}) {
  const { count = 10, site = null, type = 'any' } = opts
  const axios   = require('axios')
  const results = new Set()

  // ── YouTube via yt-dlp ytsearch (no API key) ─────────────────────────────
  if (!site || /youtube/i.test(site) || type === 'video' || type === 'audio') {
    try {
      const n    = Math.min(count, 25)
      const term = site && !/youtube/i.test(site) ? `site:${site} ${query}` : query
      const { stdout } = await execFileAsync(
        YTDLP_BIN,
        [`ytsearch${n}:${term}`, '--get-url', '--no-playlist', '--no-warnings', '--skip-download'],
        { timeout: 30000 }
      )
      for (const u of stdout.trim().split('\n').filter(Boolean)) results.add(u)
    } catch {}
  }

  // ── DuckDuckGo HTML scrape (no API key) ──────────────────────────────────
  if (results.size < count) {
    try {
      const q   = site ? `site:${site} ${query}` : query
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}&kl=wt-wt`
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124' },
        timeout: 20000,
      })
      const re = /uddg=([^&"]+)/g
      let m
      while ((m = re.exec(res.data)) !== null && results.size < count * 4) {
        try {
          const u = decodeURIComponent(m[1])
          if (u.startsWith('http') && !u.includes('duckduckgo.com')) results.add(u)
        } catch {}
      }
    } catch {}
  }

  // ── yt-dlp flat-playlist on site search page ─────────────────────────────
  if (results.size < count && site) {
    try {
      const searchURL = `https://${site}/search?q=${encodeURIComponent(query)}`
      const { stdout } = await execFileAsync(
        YTDLP_BIN,
        [searchURL, '--get-url', '--no-warnings', '--skip-download',
         '--flat-playlist', '--playlist-end', String(count)],
        { timeout: 20000 }
      )
      for (const u of stdout.trim().split('\n').filter(Boolean)) results.add(u)
    } catch {}
  }

  return [...results].slice(0, count)
}

// ─────────────────────────────────────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  // primary API
  smartDownload,
  bulkDownload,
  fetchURLs,
  // individual engines (for direct use)
  ytdlpDownload,
  ytdlpBatch,
  cobaltDownload,
  spotdlDownload,
  galleryDlDownload,
  gdriveDownload,
  mediafireDownload,
  apkDownload,
  // helpers
  detectPlatform,
  extractURLs,
  guessMime,
  ensureUnderLimit,
  getFileSizeMB,
  cleanupFile,
  cleanupOldFiles,
  downloadHTTP,
  // constants
  DL_DIR,
  TG_MAX_MB,
}