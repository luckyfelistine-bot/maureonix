'use strict'
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║          MAUREONIX — DEBUGGED DOWNLOADER ENGINE  v7.3                  ║
 * ║                                                                          ║
 * ║  YouTube  → youtubei.js  (local session, auto-retry init)              ║
 * ║  TikTok   → TikWM API → yt-dlp → Cobalt → HTML scrape (last resort)   ║
 * ║  Spotify  → spotdl                                                     ║
 * ║  Social   → yt-dlp (2000+ sites)                                       ║
 * ║  Images   → gallery-dl                                                 ║
 * ║                                                                          ║
 * ║  FIXES  : downloadHTTP now uses axios (gzip + redirects handled)       ║
 * ║           tiktokScrapeDownload supports SIGI_STATE fallback            ║
 * ║           tiktokScrapeDownload normalizes object URLs                  ║
 * ║           youtubeiDownload cleans up partial files on error            ║
 * ║           downloadHTTP referer removed (axios handles natively)        ║
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
const { Readable }  = require('stream')
const { pipeline }  = require('stream/promises')

const execFileAsync = promisify(execFile)

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const DL_DIR         = process.env.DL_DIR          || path.join(os.tmpdir(), 'maureonix_dl')
const YTDLP_BIN      = process.env.YTDLP_BIN       || 'yt-dlp'
const FFMPEG_BIN     = process.env.FFMPEG_BIN      || 'ffmpeg'
const GALLERYDL_BIN  = process.env.GALLERYDL_BIN   || 'gallery-dl'
const SPOTDL_BIN     = process.env.SPOTDL_BIN      || 'spotdl'
const TIKWM_API      = process.env.TIKWM_API       || 'https://www.tikwm.com'
const COBALT_API     = process.env.COBALT_API      || null
const PROXY_URL      = process.env.PROXY_URL       || null
const MAX_CONCURRENT = parseInt(process.env.DL_CONCURRENCY || '3', 10)
const TG_MAX_MB      = 49
const DL_TIMEOUT_MS  = 300_000
const MAX_RETRIES    = 3

if (!fs.existsSync(DL_DIR)) fs.mkdirSync(DL_DIR, { recursive: true })

// ─────────────────────────────────────────────────────────────────────────────
//  YOUTUBEI.JS  (no Puppeteer, no PO tokens, auto-retry init)
// ─────────────────────────────────────────────────────────────────────────────
let _youtubei = null
let _youtubeiInitPromise = null

async function getYoutubei() {
  if (_youtubei) return _youtubei
  if (_youtubeiInitPromise) return _youtubeiInitPromise

  _youtubeiInitPromise = (async () => {
    try {
      const { Innertube, UniversalCache } = require('youtubei.js')
      const yt = await Innertube.create({
        cache: new UniversalCache(true),
        generate_session_locally: true,
        retrieve_player: true,
      })
      console.log('📺 youtubei.js session ready')
      _youtubei = yt
      return yt
    } catch (err) {
      _youtubeiInitPromise = null
      throw err
    }
  })()

  return _youtubeiInitPromise
}

// ─────────────────────────────────────────────────────────────────────────────
//  PLATFORM DETECTOR
// ─────────────────────────────────────────────────────────────────────────────
const PLATFORM_PATTERNS = [
  [/tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com|douyin\.com/i, 'tiktok'],
  [/spotify\.com/i,                                'spotify'],
  [/instagram\.com/i,                              'instagram'],
  [/twitter\.com|x\.com/i,                         'twitter'],
  [/pinterest\.com|pin\.it/i,                      'pinterest'],
  [/youtube\.com|youtu\.be/i,                      'youtube'],
  [/soundcloud\.com/i,                             'soundcloud'],
  [/reddit\.com|redd\.it/i,                        'reddit'],
  [/deezer\.com/i,                                 'deezer'],
  [/tidal\.com/i,                                  'tidal'],
  [/twitch\.tv/i,                                  'twitch'],
  [/bandcamp\.com/i,                               'bandcamp'],
  [/audiomack\.com/i,                              'audiomack'],
  [/vimeo\.com/i,                                  'vimeo'],
  [/dailymotion\.com/i,                            'dailymotion'],
  [/rumble\.com/i,                                 'rumble'],
  [/drive\.google\.com/i,                          'gdrive'],
  [/mediafire\.com/i,                              'mediafire'],
  [/facebook\.com|fb\.watch/i,                     'facebook'],
  [/kick\.com/i,                                   'kick'],
  [/odysee\.com/i,                                 'odysee'],
  [/bitchute\.com/i,                               'bitchute'],
  [/mixcloud\.com/i,                               'mixcloud'],
  [/streamable\.com/i,                             'streamable'],
  [/threads\.net/i,                                'threads'],
  [/snapchat\.com/i,                               'snapchat'],
  [/pornhub\.com/i,                                'pornhub'],
  [/xvideos\.com/i,                                'xvideos'],
  [/xnxx\.com/i,                                   'xnxx'],
  [/spankbang\.com/i,                              'spankbang'],
  [/youporn\.com/i,                                'youporn'],
  [/redtube\.com/i,                                'redtube'],
  [/tube8\.com/i,                                  'tube8'],
  [/loom\.com/i,                                   'loom'],
  [/capcut\.com/i,                                 'capcut'],
  [/likee\.video/i,                                'likee'],
  [/trovo\.live/i,                                 'trovo'],
  [/bilibili\.com/i,                               'bilibili'],
  [/nicovideo\.jp/i,                               'nicovideo'],
  [/apkmirror\.com|apkpure\.com|aptoide\.com/i,    'apk'],
]

function detectPlatform(url) {
  for (const [re, name] of PLATFORM_PATTERNS) {
    if (re.test(url)) return name
  }
  return 'generic'
}

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

function extractYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
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

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ─────────────────────────────────────────────────────────────────────────────
//  DIRECT HTTP DOWNLOADER  (axios — handles gzip, redirects, streams)
// ─────────────────────────────────────────────────────────────────────────────
async function downloadHTTP(url, dest, redirectCount = 0) {
  if (redirectCount > 8) throw new Error('Too many HTTP redirects')
  const axios = require('axios')

  const response = await axios({
    method: 'get',
    url,
    responseType: 'stream',
    timeout: DL_TIMEOUT_MS,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })

  const writer = fs.createWriteStream(dest)
  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(dest))
    const onError = (err) => {
      writer.destroy()
      cleanupFile(dest)
      reject(err)
    }
    writer.on('error', onError)
    response.data.on('error', onError)
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  TIKTOK DIRECT SCRAPER  ← LAST-RESORT FALLBACK
//  Handles both __UNIVERSAL_DATA_FOR_REHYDRATION__ and SIGI_STATE
// ─────────────────────────────────────────────────────────────────────────────
async function tiktokScrapeDownload(url, audioOnly = false, onProgress = null) {
  const axios = require('axios')
  onProgress?.('🔍 TikTok direct scrape (last resort)...')

  const resolved = await resolveRedirect(url)

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.tiktok.com/',
  }

  let html = ''
  let lastErr = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await axios.get(resolved, { headers, timeout: 15000, maxRedirects: 5 })
      html = res.data
      break
    } catch (e) {
      lastErr = e
      onProgress?.(`⚠️ Scrape attempt ${attempt}/${MAX_RETRIES} failed: ${e.message}`)
      if (attempt < MAX_RETRIES) await sleep(2000 * attempt)
    }
  }
  if (!html) throw lastErr || new Error('TikTok scrape: could not fetch page')

  const scriptMatch = html.match(/<script\s+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i)
    || html.match(/<script\s+id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/i)

  if (!scriptMatch) {
    throw new Error('TikTok scrape: rehydration script not found (blocked or page changed)')
  }

  let data
  try {
    data = JSON.parse(scriptMatch[1].trim())
  } catch (e) {
    throw new Error('TikTok scrape: failed to parse rehydration JSON')
  }

  // ── Navigate to itemStruct ─────────────────────────────────────────────
  const scope = data.__DEFAULT_SCOPE__ || data
  const videoDetail = scope['webapp.video-detail'] || scope['webapp.video_detail']

  let itemStruct = null

  if (videoDetail) {
    itemStruct = videoDetail.itemInfo?.itemStruct
      || (videoDetail.itemModule ? Object.values(videoDetail.itemModule)[0] : null)
  }

  // SIGI_STATE fallback: flat structure
  if (!itemStruct && scope.ItemModule) {
    itemStruct = Object.values(scope.ItemModule)[0]
  }
  if (!itemStruct && scope.itemModule) {
    itemStruct = Object.values(scope.itemModule)[0]
  }

  if (!itemStruct) {
    throw new Error('TikTok scrape: itemStruct not found in page data')
  }

  const videoData = itemStruct.video || {}
  const musicData = itemStruct.music || {}
  const title = itemStruct.desc || 'tiktok'
  const videoId = itemStruct.id || Date.now()

  // ── Helper to extract string URL from object or string ─────────────────
  const getUrl = (val) => {
    if (typeof val === 'string') return val
    if (val && typeof val === 'object') return val.urlList?.[0] || val.url?.[0] || null
    return null
  }

  // ── Slideshow / Images ──
  const imageList = itemStruct.imagePost?.images || []
  if (imageList.length > 0) {
    onProgress?.(`🖼️ Slideshow — ${imageList.length} images`)
    const files = []
    let i = 0
    for (const img of imageList) {
      i++
      const imgUrl = getUrl(img.imageURL) || getUrl(img.displayImage)
      if (!imgUrl) continue
      const ext = imgUrl.includes('.webp') ? '.webp' : '.jpg'
      const fname = sanitiseFilename(`tiktok_${videoId}_${i}${ext}`)
      const dest = path.join(DL_DIR, fname)
      onProgress?.(`⬇️ Image ${i}/${imageList.length}`)
      await downloadHTTP(imgUrl, dest)
      files.push(dest)
    }
    if (audioOnly) {
      const musicUrl = getUrl(musicData.playUrl)
      if (musicUrl) {
        const adest = path.join(DL_DIR, sanitiseFilename(`tiktok_${videoId}_audio.mp3`))
        await downloadHTTP(musicUrl, adest)
        files.push(adest)
      }
    }
    if (files.length === 0) throw new Error('TikTok scrape: no images could be downloaded')
    return files
  }

  // ── Audio only ──
  if (audioOnly) {
    const musicUrl = getUrl(musicData.playUrl)
    if (musicUrl) {
      onProgress?.('🎵 Extracting audio...')
      const ext = musicUrl.includes('.mp3') ? '.mp3' : '.mp4'
      const fname = sanitiseFilename(`${title}_audio${ext === '.mp4' ? '.mp3' : ext}`)
      const dest = path.join(DL_DIR, fname)
      await downloadHTTP(musicUrl, dest)
      if (ext === '.mp4') {
        const mp3Dest = dest.replace(/\.[^.]+$/, '.mp3')
        await ffmpegConvert(dest, mp3Dest, ['-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k'])
        cleanupFile(dest)
        return [mp3Dest]
      }
      return [dest]
    }
  }

  // ── Video ──
  let videoUrl = getUrl(videoData.downloadAddr) || getUrl(videoData.playAddr)
  if (!videoUrl) {
    throw new Error('TikTok scrape: no video URL found')
  }

  onProgress?.('⬇️ Downloading TikTok (no watermark)...')
  const fname = sanitiseFilename(`${title}_${videoId}.mp4`)
  const dest = path.join(DL_DIR, fname)
  await downloadHTTP(videoUrl, dest)
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  TIKWM API  ← PRIMARY for TikTok
// ─────────────────────────────────────────────────────────────────────────────
async function tikwmDownload(url, audioOnly = false, onProgress = null) {
  const axios = require('axios')
  const resolved = await resolveRedirect(url)
  onProgress?.(`🔗 Resolved: ${resolved.slice(0, 60)}`)

  const form = new URLSearchParams()
  form.append('url', resolved)
  form.append('hd', '1')

  let lastErr = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await axios.post(`${TIKWM_API}/api/`, form.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.tikwm.com/',
        },
        timeout: 30_000,
      })

      const d = res.data
      if (!d || d.code !== 0) {
        throw new Error(`TikWM API error: ${d?.msg || JSON.stringify(d).slice(0, 100)}`)
      }

      const data = d.data

      if (data.images && data.images.length > 0) {
        onProgress?.(`🖼️ Slideshow — ${data.images.length} images`)
        const files = []
        let i = 0
        for (const imgUrl of data.images) {
          i++
          const ext = imgUrl.includes('.webp') ? '.webp' : '.jpg'
          const fname = sanitiseFilename(`tikwm_${data.id || Date.now()}_${i}${ext}`)
          const dest = path.join(DL_DIR, fname)
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

      if (audioOnly && data.music) {
        onProgress?.('🎵 Extracting audio...')
        const adest = path.join(DL_DIR, sanitiseFilename(`${data.title || 'tiktok'}_audio.mp3`))
        await downloadHTTP(data.music, adest)
        return [adest]
      }

      const videoUrl = data.hdplay || data.play
      if (!videoUrl) throw new Error('TikWM: no video URL in response')

      onProgress?.('⬇️ Downloading TikTok (no watermark)...')
      const fname = sanitiseFilename(`${data.title || 'tiktok'}_${data.id || Date.now()}.mp4`)
      const dest = path.join(DL_DIR, fname)
      await downloadHTTP(videoUrl, dest)
      return [dest]

    } catch (e) {
      lastErr = e
      onProgress?.(`⚠️ TikWM attempt ${attempt}/${MAX_RETRIES} failed: ${e.message}`)
      if (attempt < MAX_RETRIES) await sleep(2000 * attempt)
    }
  }
  throw lastErr || new Error('TikWM: all retries exhausted')
}

async function tikwmSearch(keyword, count = 10) {
  const axios = require('axios')
  const res = await axios.get(`${TIKWM_API}/api/feed/search`, {
    params: { keywords: keyword, count, cursor: 0, web: 1, hd: 1 },
    headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.tikwm.com/' },
    timeout: 20_000,
  })
  const videos = res.data?.data?.videos || []
  return videos.map(v => `https://www.tiktok.com/@${v.author?.unique_id || 'user'}/video/${v.video_id || v.id}`)
}

// ─────────────────────────────────────────────────────────────────────────────
//  YOUTUBEI.JS  ← PRIMARY for YouTube
// ─────────────────────────────────────────────────────────────────────────────
async function youtubeiDownload(url, opts = {}) {
  const { audioOnly = false, quality = 'best', onProgress = null } = opts
  const videoId = extractYouTubeId(url)
  if (!videoId) throw new Error('Invalid YouTube URL — cannot extract video ID')

  onProgress?.('📡 YouTube InnerTube API...')
  const yt = await getYoutubei()
  const info = await yt.getInfo(videoId)

  const rawTitle = info.basic_info?.title || info.primary_info?.title?.text || `yt_${videoId}`
  const title = sanitiseFilename(rawTitle)

  const downloadOpts = audioOnly
    ? { type: 'audio', quality: 'best' }
    : { type: 'video', quality: quality === 'best' ? 'best' : quality, format: 'mp4' }

  const ext = audioOnly ? '.mp3' : '.mp4'
  const dest = path.join(DL_DIR, `${title}_${videoId}${ext}`)

  try {
    onProgress?.(audioOnly ? '🎵 Downloading audio stream...' : '⬇️ Downloading video stream...')
    const stream = await info.download(downloadOpts)
    const nodeStream = Readable.fromWeb(stream)
    await pipeline(nodeStream, fs.createWriteStream(dest))
  } catch (e) {
    cleanupFile(dest)
    throw e
  }

  if (audioOnly && !dest.endsWith('.mp3')) {
    const mp3Dest = dest.replace(/\.[^.]+$/, '.mp3')
    onProgress?.('🔧 Converting to MP3...')
    await ffmpegConvert(dest, mp3Dest, ['-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k'])
    cleanupFile(dest)
    return [mp3Dest]
  }

  return [dest]
}

async function youtubeiSearch(query, count = 10) {
  const yt = await getYoutubei()
  const search = await yt.search(query, { type: 'video' })
  const videos = search.videos || []
  return videos.slice(0, count).map(v => `https://www.youtube.com/watch?v=${v.id}`)
}

// ─────────────────────────────────────────────────────────────────────────────
//  COBALT FALLBACK
// ─────────────────────────────────────────────────────────────────────────────
async function cobaltDownload(url, audioOnly = false, onProgress = null) {
  if (!COBALT_API) throw new Error('Cobalt not configured. Set COBALT_API env var.')

  const axios = require('axios')
  const body = {
    url,
    videoQuality: '1080',
    audioFormat: audioOnly ? 'mp3' : 'best',
    downloadMode: audioOnly ? 'audio' : 'auto',
    filenameStyle: 'pretty',
    tiktokFullAudio: true,
    tiktokH265: false,
    removeTikTokWatermark: true,
    youtubeHLS: false,
  }

  onProgress?.(`🔷 Cobalt → ${COBALT_API.replace('https://', '')}`)
  const res = await axios.post(`${COBALT_API}/`, body, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'maureonix-bot/1.0',
    },
    timeout: 30_000,
  })
  const d = res.data
  if (d.status === 'error') throw new Error(`Cobalt: ${d.error?.code || JSON.stringify(d.error)}`)

  const files = []
  if (d.status === 'redirect' || d.status === 'tunnel') {
    const fname = sanitiseFilename(d.filename || `cobalt_${Date.now()}.mp4`)
    const dest = path.join(DL_DIR, fname)
    onProgress?.('⬇️ Cobalt streaming...')
    await downloadHTTP(d.url, dest)
    files.push(dest)
  } else if (d.status === 'picker') {
    onProgress?.(`📦 ${d.picker.length} items`)
    let i = 0
    for (const item of d.picker) {
      i++
      const fname = sanitiseFilename(item.filename || `cobalt_${Date.now()}_${i}.mp4`)
      const dest = path.join(DL_DIR, fname)
      onProgress?.(`⬇️ Item ${i}/${d.picker.length}`)
      await downloadHTTP(item.url, dest)
      files.push(dest)
    }
  } else {
    throw new Error(`Unexpected Cobalt status: ${d.status}`)
  }
  return files
}

// ─────────────────────────────────────────────────────────────────────────────
//  YT-DLP  (universal fallback)
// ─────────────────────────────────────────────────────────────────────────────
function buildYtdlpArgs(url, opts = {}) {
  const { audioOnly = false, quality = 'best', playlist = false, outputTemplate = null } = opts
  const tpl = outputTemplate || path.join(DL_DIR, '%(title).120B.%(ext)s')
  const platform = detectPlatform(url)

  const args = [
    '--no-warnings',
    '--merge-output-format', 'mp4',
    '--concurrent-fragments', '8',
    '--retries', '10',
    '--fragment-retries', '10',
    '--file-access-retries', '3',
    '--extractor-retries', '3',
    '--retry-sleep', '2',
    '--socket-timeout', '30',
    '-o', tpl,
    '--ffmpeg-location', FFMPEG_BIN,
    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    '--add-header', 'Accept-Language:en-US,en;q=0.9',
    '--add-header', 'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    '--no-check-certificates',
    '--geo-bypass',
  ]

  if (platform === 'youtube') {
    args.push('--extractor-args', 'youtube:player_client=android')
  }

  if (PROXY_URL) {
    args.push('--proxy', PROXY_URL)
  }

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
    const args = buildYtdlpArgs(url, opts)
    const proc = spawn(YTDLP_BIN, args)
    let lastFile = null
    let stderr = ''
    const timer = setTimeout(() => { proc.kill(); reject(new Error('yt-dlp timeout')) }, DL_TIMEOUT_MS)

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
//  SPOTDL
// ─────────────────────────────────────────────────────────────────────────────
function spotdlDownload(url, onProgress = null) {
  return new Promise((resolve, reject) => {
    const args = [
      '--output', path.join(DL_DIR, '{title} - {artists}'),
      '--format', 'mp3',
      '--bitrate', '320k',
      '--threads', '4',
      '--no-cache',
      url,
    ]
    const proc = spawn(SPOTDL_BIN, args)
    const files = []
    let stderr = ''
    const timer = setTimeout(() => { proc.kill(); reject(new Error('spotdl timeout')) }, DL_TIMEOUT_MS * 2)

    proc.stdout.on('data', d => {
      const s = d.toString()
      onProgress?.(s.trim().slice(0, 80))
      for (const m of (s.match(/Downloaded "(.+?)"/g) || [])) {
        const name = m.replace(/Downloaded "|"/g, '').trim()
        const fp = fs.existsSync(name) ? name : path.join(DL_DIR, path.basename(name))
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
//  GALLERY-DL
// ─────────────────────────────────────────────────────────────────────────────
function galleryDlDownload(url, onProgress = null) {
  return new Promise((resolve, reject) => {
    const args = ['--dest', DL_DIR, '--no-mtime', '--retries', '3', '--sleep', '0.3', url]
    const proc = spawn(GALLERYDL_BIN, args)
    const files = []
    let stderr = ''
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
  if (!idMatch) throw new Error('Cannot extract Google Drive file ID')
  const fileId = idMatch[1]
  const dlUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`
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
  const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 })
  const m1 = res.data.match(/href="(https:\/\/download\d*\.mediafire\.com\/[^"]+)"/)
  const m2 = res.data.match(/id="downloadButton"[^>]+href="([^"]+)"/)
  const dlUrl = (m1 || m2)?.[1]
  if (!dlUrl) throw new Error('MediaFire: cannot find direct download link')
  const dest = path.join(DL_DIR, `mediafire_${Date.now()}`)
  await downloadHTTP(dlUrl, dest)
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
//  FFMPEG UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
function ffmpegCompress(src) {
  const dest = src.replace(/\.[^.]+$/, '') + '_cmp.mp4'
  return new Promise((resolve, reject) => {
    const args = ['-y', '-i', src, '-c:v', 'libx264', '-preset', 'fast', '-crf', '28',
                  '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', dest]
    const proc = spawn(FFMPEG_BIN, args)
    let stderr = ''
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

function ffmpegConvert(src, dest, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const args = ['-y', '-i', src, ...extraArgs, dest]
    const proc = spawn(FFMPEG_BIN, args)
    let stderr = ''
    const timer = setTimeout(() => { proc.kill(); reject(new Error('ffmpeg convert timeout')) }, 180_000)
    proc.stderr.on('data', d => { stderr += d.toString() })
    proc.on('close', code => {
      clearTimeout(timer)
      if (code === 0 && fs.existsSync(dest)) return resolve(dest)
      reject(new Error(`ffmpeg convert exit ${code}: ${stderr.slice(-200)}`))
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
  throw new Error(`Still too large after compression (${getFileSizeMB(compressed).toFixed(1)} MB)`)
}

// ─────────────────────────────────────────────────────────────────────────────
//  SMART ROUTER
// ─────────────────────────────────────────────────────────────────────────────
async function smartDownload(url, opts = {}) {
  const { audioOnly = false, quality = 'best', onProgress = null } = opts
  const log = m => onProgress?.(m)
  const platform = detectPlatform(url)
  log(`🔍 Platform: ${platform}`)

  // ── YouTube ── youtubei.js PRIMARY
  if (platform === 'youtube') {
    try {
      log('📺 youtubei.js (InnerTube API)...')
      return await youtubeiDownload(url, { audioOnly, quality, onProgress: log })
    } catch (e) {
      log(`⚠️ youtubei.js failed: ${e.message} → yt-dlp fallback`)
      try {
        log('⚡ yt-dlp fallback → YouTube...')
        return await ytdlpDownload(url, { audioOnly, quality })
      } catch (e2) {
        throw new Error(`YouTube failed. youtubei.js: ${e.message} | yt-dlp: ${e2.message}`)
      }
    }
  }

  // ── TikTok ── TikWM PRIMARY → yt-dlp → Cobalt → scraper last
  if (platform === 'tiktok') {
    try {
      log('🎵 TikWM API (no watermark)...')
      return await tikwmDownload(url, audioOnly, log)
    } catch (e) {
      log(`⚠️ TikWM failed: ${e.message}`)
    }
    try {
      log('⚡ yt-dlp → TikTok...')
      return await ytdlpDownload(url, { audioOnly, quality })
    } catch (e2) {
      log(`⚠️ yt-dlp failed: ${e2.message}`)
    }
    if (COBALT_API) {
      try {
        log('🔷 Cobalt fallback...')
        return await cobaltDownload(url, audioOnly, log)
      } catch (e3) {
        log(`⚠️ Cobalt failed: ${e3.message}`)
      }
    }
    try {
      log('🔍 Direct scrape (last resort)...')
      return await tiktokScrapeDownload(url, audioOnly, log)
    } catch (e4) {
      throw new Error(`TikTok failed. All engines exhausted. Last error: ${e4.message}`)
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
    log('📦 MediaFire...')
    return await mediafireDownload(url)
  }

  // ── APK stores ──
  if (platform === 'apk') {
    log('📱 APK...')
    return await apkDownload(url)
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
//  BULK DOWNLOADER
// ─────────────────────────────────────────────────────────────────────────────
async function bulkDownload(urls, opts = {}) {
  const { audioOnly = false, quality = 'best', onProgress = null } = opts
  const results = [], errors = []
  const total = urls.length
  let done = 0

  const notify = (url, status, extra = {}) => {
    done++
    onProgress?.({ done, total, url, status, ...extra })
  }

  const queue = [...urls]
  const active = new Set()

  await new Promise(resolve => {
    const schedule = () => {
      while (active.size < MAX_CONCURRENT && queue.length > 0) {
        const url = queue.shift()
        const task = smartDownload(url, {
          audioOnly, quality,
          onProgress: m => onProgress?.({ done, total, url, status: 'progress', message: m }),
        })
          .then(files => { results.push({ url, files }); notify(url, 'done', { files }) })
          .catch(err => { errors.push({ url, error: err.message }); notify(url, 'error', { error: err.message }) })
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
//  URL FETCHER
// ─────────────────────────────────────────────────────────────────────────────
async function fetchURLs(query, opts = {}) {
  const { count = 10, site = null, type = 'any' } = opts
  const axios = require('axios')
  const results = new Set()

  if (site && /tiktok/i.test(site)) {
    try {
      const ttUrls = await tikwmSearch(query, Math.min(count, 35))
      for (const u of ttUrls) results.add(u)
    } catch {}
    return [...results].slice(0, count)
  }

  if (!site || /youtube/i.test(site) || type === 'video' || type === 'audio') {
    try {
      const ytUrls = await youtubeiSearch(query, Math.min(count, 25))
      for (const u of ytUrls) results.add(u)
    } catch {}
  }

  if (results.size < count) {
    try {
      const q = site ? `site:${site} ${query}` : query
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
//  FETCH RELATED
// ─────────────────────────────────────────────────────────────────────────────
async function fetchRelated(exampleUrl, opts = {}) {
  const { count = 10, crossPlatform = false, extraQuery = '' } = opts
  const axios = require('axios')
  const platform = detectPlatform(exampleUrl)
  const results = new Set()

  let keywords = ''

  try {
    const u = new URL(exampleUrl)
    const tokens = [
      ...u.pathname.split(/[/_\-+.?&=]+/),
      ...u.searchParams.values(),
    ]
    keywords = tokens
      .filter(t => t.length > 2 && !/^\d+$/.test(t) && !/^(www|com|net|org|http|https|video|watch|post|p|v|reel|status|clip)$/i.test(t))
      .slice(0, 8)
      .join(' ')
  } catch {}

  if (platform === 'youtube') {
    try {
      const videoId = extractYouTubeId(exampleUrl)
      if (videoId) {
        const yt = await getYoutubei()
        const info = await yt.getInfo(videoId)
        const title = info.basic_info?.title || ''
        if (title) {
          keywords = title.replace(/[#@\[\](){}|*^~`]+/g, ' ')
                          .replace(/\b(ft|feat|official|music|video|lyrics|hd|4k|full)\b/gi, '')
                          .replace(/\s{2,}/g, ' ').trim().slice(0, 80)
        }
      }
    } catch {}
  } else if (platform === 'tiktok') {
    try {
      const axios2 = require('axios')
      const form = new URLSearchParams()
      form.append('url', exampleUrl)
      form.append('hd', '0')
      const r = await axios2.post(`${TIKWM_API}/api/`, form.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15_000 })
      const t = r.data?.data?.title
      if (t) keywords = t.replace(/#\S+/g, '').trim().slice(0, 80)
      const tags = (r.data?.data?.title || '').match(/#\w+/g) || []
      if (tags.length) keywords += ' ' + tags.slice(0, 3).join(' ')
    } catch {}
  } else {
    try {
      const { stdout } = await execFileAsync(
        YTDLP_BIN,
        [exampleUrl, '--skip-download', '--print', 'title', '--no-warnings'],
        { timeout: 15_000 }
      )
      const title = stdout.trim()
      if (title && title.length > 3) {
        keywords = title.replace(/[#@\[\](){}|*^~`]+/g, ' ')
                        .replace(/\b(ft|feat|official|music|video|lyrics|hd|4k|full)\b/gi, '')
                        .replace(/\s{2,}/g, ' ').trim().slice(0, 80)
      }
    } catch {}
  }

  if (!keywords && extraQuery) keywords = extraQuery
  if (!keywords) keywords = exampleUrl.split('/').pop()?.split('?')[0] || 'trending'
  if (extraQuery) keywords = `${keywords} ${extraQuery}`.trim()
  keywords = keywords.trim().slice(0, 100)

  if (platform === 'tiktok') {
    try {
      const ttUrls = await tikwmSearch(keywords, Math.min(count + 5, 35))
      for (const u of ttUrls) { if (u !== exampleUrl) results.add(u) }
    } catch {}
  } else if (platform === 'youtube') {
    try {
      const ytUrls = await youtubeiSearch(keywords, Math.min(count + 3, 25))
      for (const u of ytUrls) { if (u !== exampleUrl) results.add(u) }
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
    crossPlatform && await _ytSearch(keywords, count, exampleUrl, results)
  } else {
    try {
      const domainMatch = exampleUrl.match(/https?:\/\/(?:www\.)?([^/]+)/)
      const domain = domainMatch?.[1] || ''
      const q = domain ? `site:${domain} ${keywords}` : keywords
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

  if (crossPlatform && platform !== 'youtube') {
    await _ytSearch(keywords, Math.min(count, 5), exampleUrl, results)
  }

  const urls = [...results].filter(u => u !== exampleUrl).slice(0, count)
  return { platform, query: keywords, urls }
}

async function _ytSearch(keywords, count, exclude, resultsSet) {
  try {
    const ytUrls = await youtubeiSearch(keywords, Math.min(count, 15))
    for (const u of ytUrls) {
      if (u !== exclude) resultsSet.add(u)
    }
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  smartDownload,
  bulkDownload,
  fetchURLs,
  fetchRelated,
  tikwmDownload,
  tikwmSearch,
  tiktokScrapeDownload,
  youtubeiDownload,
  youtubeiSearch,
  cobaltDownload,
  ytdlpDownload,
  spotdlDownload,
  galleryDlDownload,
  gdriveDownload,
  mediafireDownload,
  apkDownload,
  detectPlatform,
  extractURLs,
  extractYouTubeId,
  guessMime,
  ensureUnderLimit,
  getFileSizeMB,
  cleanupFile,
  cleanupOldFiles,
  downloadHTTP,
  resolveRedirect,
  sanitiseFilename,
  DL_DIR,
  TG_MAX_MB,
}