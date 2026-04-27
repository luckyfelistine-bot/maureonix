"use strict"
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  MAUREONIX — BULLETPROOF API-FIRST DOWNLOADER ENGINE  v10.0             ║
 * ║  Railway-Ready · AbortController · Size Guards · Magic-Byte Validate    ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

const { spawn }     = require("child_process")
const { promisify } = require("util")
const path          = require("path")
const fs            = require("fs")
const os            = require("os")
const https         = require("https")
const http          = require("http")
const { Readable }  = require("stream")
const { pipeline }  = require("stream/promises")

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const DL_DIR         = process.env.DL_DIR          || path.join(os.tmpdir(), "maureonix_dl")
const FFMPEG_BIN     = process.env.FFMPEG_BIN      || "ffmpeg"
const GALLERYDL_BIN  = process.env.GALLERYDL_BIN   || "gallery-dl"
const SPOTDL_BIN     = process.env.SPOTDL_BIN      || "spotdl"
const TIKWM_API      = (process.env.TIKWM_API      || "https://www.tikwm.com").trim()
const COBALT_API     = (process.env.COBALT_API     || "https://api.cobalt.tools").trim()

const APIFY_TOKEN    = process.env.APIFY_TOKEN     || ""
const RAPIDAPI_KEY   = process.env.RAPIDAPI_KEY    || ""

const RAPIDAPI_YT_HOST         = process.env.RAPIDAPI_YT_HOST         || "yt-downloader1.p.rapidapi.com"
const RAPIDAPI_TIKTOK_HOST     = process.env.RAPIDAPI_TIKTOK_HOST     || "tiktok-video-downloader-api.p.rapidapi.com"
const RAPIDAPI_IG_HOST         = process.env.RAPIDAPI_IG_HOST         || "instagram-downloader38.p.rapidapi.com"
const RAPIDAPI_TWITTER_HOST    = process.env.RAPIDAPI_TWITTER_HOST    || "twitter-video-downloader-api.p.rapidapi.com"
const RAPIDAPI_FB_HOST         = process.env.RAPIDAPI_FB_HOST         || "facebook-downloader.p.rapidapi.com"
const RAPIDAPI_ALL_MEDIA_HOST  = process.env.RAPIDAPI_ALL_MEDIA_HOST  || "all-media-downloader.p.rapidapi.com"

const APIFY_YOUTUBE_ACTOR      = process.env.APIFY_YOUTUBE_ACTOR      || "zakeygroot/youtube-pro-downloader-2026-working"
const APIFY_TIKTOK_ACTOR       = process.env.APIFY_TIKTOK_ACTOR       || "apilabs/tiktok-downloader"
const APIFY_INSTAGRAM_ACTOR    = process.env.APIFY_INSTAGRAM_ACTOR    || "instaprism/instagram-media-downloader"
const APIFY_SOCIAL_ACTOR       = process.env.APIFY_SOCIAL_ACTOR       || "rover-omniscraper/media-downloader-actor"
const APIFY_ALL_SOCIAL_ACTOR   = process.env.APIFY_ALL_SOCIAL_ACTOR   || "wilcode/all-social-media-video-downloader"

let _rawConcurrency = parseInt(process.env.DL_CONCURRENCY || "5", 10)
const MAX_CONCURRENT = Number.isNaN(_rawConcurrency) || _rawConcurrency < 1 ? 5 : Math.min(_rawConcurrency, 10)

const TG_MAX_MB      = 49
const DL_TIMEOUT_MS  = 300_000
const MAX_RETRIES    = 3
const MAX_DOWNLOAD_MB = 500
const API_TIMEOUT_MS = 60_000
const STATUS_EDIT_1  = 180_000   // 3 min — "still processing"
const STATUS_EDIT_2  = 360_000   // 6 min — timeout

if (!fs.existsSync(DL_DIR)) fs.mkdirSync(DL_DIR, { recursive: true })

// ─────────────────────────────────────────────────────────────────────────────
//  BINARY CHECKS (Railway safety)
// ─────────────────────────────────────────────────────────────────────────────
const BINARY_CACHE = new Map()
function hasBinary(name) {
  if (BINARY_CACHE.has(name)) return BINARY_CACHE.get(name)
  try {
    require("child_process").execSync(`which ${name}`, { stdio: "ignore" })
    BINARY_CACHE.set(name, true)
    return true
  } catch {
    BINARY_CACHE.set(name, false)
    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  LAZY LOADERS
// ─────────────────────────────────────────────────────────────────────────────
let _axiosInstance = null
function getAxios() {
  if (_axiosInstance) return _axiosInstance
  const axios = require("axios")
  _axiosInstance = axios.create({
    timeout: API_TIMEOUT_MS,
    maxRedirects: 10,
    maxContentLength: MAX_DOWNLOAD_MB * 1024 * 1024,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  })
  return _axiosInstance
}

function getYoutubeDlExec() {
  try {
    return require("youtube-dl-exec")
  } catch {
    throw new Error("youtube-dl-exec not installed. Run: npm install youtube-dl-exec")
  }
}

let _youtubei = null
let _youtubeiInitPromise = null

async function getYoutubei() {
  if (_youtubei) return _youtubei
  if (_youtubeiInitPromise) return _youtubeiInitPromise
  _youtubeiInitPromise = (async () => {
    try {
      const { Innertube, UniversalCache } = require("youtubei.js")
      const yt = await Innertube.create({
        cache: new UniversalCache(true),
        generate_session_locally: true,
        retrieve_player: true,
      })
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
  [/tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com|douyin\.com/i, "tiktok"],
  [/spotify\.com/i, "spotify"],
  [/instagram\.com/i, "instagram"],
  [/twitter\.com|x\.com/i, "twitter"],
  [/pinterest\.com|pin\.it/i, "pinterest"],
  [/youtube\.com|youtu\.be/i, "youtube"],
  [/soundcloud\.com/i, "soundcloud"],
  [/reddit\.com|redd\.it/i, "reddit"],
  [/deezer\.com/i, "deezer"],
  [/tidal\.com/i, "tidal"],
  [/twitch\.tv/i, "twitch"],
  [/bandcamp\.com/i, "bandcamp"],
  [/audiomack\.com/i, "audiomack"],
  [/vimeo\.com/i, "vimeo"],
  [/dailymotion\.com/i, "dailymotion"],
  [/rumble\.com/i, "rumble"],
  [/drive\.google\.com/i, "gdrive"],
  [/mediafire\.com/i, "mediafire"],
  [/facebook\.com|fb\.watch/i, "facebook"],
  [/kick\.com/i, "kick"],
  [/odysee\.com/i, "odysee"],
  [/bitchute\.com/i, "bitchute"],
  [/mixcloud\.com/i, "mixcloud"],
  [/streamable\.com/i, "streamable"],
  [/threads\.net/i, "threads"],
  [/snapchat\.com/i, "snapchat"],
  [/pornhub\.com/i, "pornhub"],
  [/xvideos\.com/i, "xvideos"],
  [/xnxx\.com/i, "xnxx"],
  [/spankbang\.com/i, "spankbang"],
  [/youporn\.com/i, "youporn"],
  [/redtube\.com/i, "redtube"],
  [/tube8\.com/i, "tube8"],
  [/loom\.com/i, "loom"],
  [/capcut\.com/i, "capcut"],
  [/likee\.video/i, "likee"],
  [/trovo\.live/i, "trovo"],
  [/bilibili\.com/i, "bilibili"],
  [/nicovideo\.jp/i, "nicovideo"],
  [/apkmirror\.com|apkpure\.com|aptoide\.com/i, "apk"],
  [/linkedin\.com/i, "linkedin"],
  [/telegram\.me|t\.me/i, "telegram"],
  [/whatsapp\.com/i, "whatsapp"],
  [/weibo\.com/i, "weibo"],
  [/ok\.ru/i, "okru"],
  [/vk\.com/i, "vk"],
]

function detectPlatform(url) {
  for (const [re, name] of PLATFORM_PATTERNS) {
    if (re.test(url)) return name
  }
  return "generic"
}

const GALLERYDL_FIRST = new Set(["instagram", "pinterest", "twitter", "reddit", "likee"])

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
function getFileSizeMB(fp) {
  try { return fs.statSync(fp).size / (1024 * 1024) } catch { return 0 }
}

function cleanupFile(fp) {
  try { if (fp && fs.existsSync(fp)) fs.unlinkSync(fp) } catch {}
}

function cleanupDir(dir) {
  try {
    if (!fs.existsSync(dir)) return
    for (const f of fs.readdirSync(dir)) {
      const fp = path.join(dir, f)
      try { if (fs.statSync(fp).isFile()) fs.unlinkSync(fp) } catch {}
    }
    fs.rmdirSync(dir)
  } catch {}
}

function scanDirForNew(dir, maxAgeMs = 600_000) {
  const now = Date.now()
  try {
    return fs.readdirSync(dir)
      .map(f => path.join(dir, f))
      .filter(fp => {
        try {
          const s = fs.statSync(fp)
          return s.isFile() && now - s.mtimeMs < maxAgeMs
        } catch { return false }
      })
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
  } catch { return [] }
}

function sanitiseFilename(name = "") {
  return name.replace(/[/\\?%*:|"<>\r\n]/g, "_").replace(/\s+/g, " ").trim().slice(0, 180) || `file_${Date.now()}`
}

function extractURLs(text = "") {
  return [...new Set((text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/gi) || []))]
}

function extractYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function guessMime(fp) {
  const ext = path.extname(fp).toLowerCase()
  return {
    ".mp4":"video",".mkv":"video",".avi":"video",".mov":"video",".webm":"video",".flv":"video",
    ".mp3":"audio",".m4a":"audio",".ogg":"audio",".flac":"audio",".wav":"audio",".aac":"audio",
    ".jpg":"photo",".jpeg":"photo",".png":"photo",".gif":"animation",".webp":"photo",
    ".pdf":"document",".apk":"document",".zip":"document",".rar":"document",
  }[ext] || "document"
}

function resolveRedirect(url) {
  return new Promise((resolve) => {
    try {
      const proto = url.startsWith("https") ? https : http
      const req = proto.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, res => {
        req.destroy()
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(res.headers.location.startsWith("http")
            ? res.headers.location
            : new URL(res.headers.location, url).toString())
        } else {
          resolve(url)
        }
      })
      req.on("error", () => resolve(url))
      req.setTimeout(10000, () => { req.destroy(); resolve(url) })
    } catch { resolve(url) }
  })
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function isValidMediaFile(fp, expectedType = "video") {
  try {
    const fd = fs.openSync(fp, 'r')
    const buf = Buffer.alloc(16)
    fs.readSync(fd, buf, 0, 16, 0)
    fs.closeSync(fd)

    const startStr = buf.toString('ascii', 0, 16).toLowerCase()
    if (startStr.includes('<!doctype') || startStr.includes('<html')) return false

    if (expectedType === "video") {
      const fourCC = buf.toString('ascii', 4, 8)
      if (['ftyp','moov','mdat','free','skip','wide','pnot'].includes(fourCC)) return true
      if (buf[0] === 0x1A && buf[1] === 0x45 && buf[2] === 0xDF && buf[3] === 0xA3) return true
    }
    if (expectedType === "audio") {
      if (buf.toString('ascii', 0, 3) === 'ID3') return true
      if ((buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0)) return true
    }
    return true
  } catch { return false }
}

async function fetchPageTitle(url) {
  try {
    const axios = getAxios()
    const res = await axios.get(url, { timeout: 10000, maxRedirects: 5 })
    const m = res.data.match(/<title[^>]*>([^<]*)<\/title>/i)
    if (!m) return ''
    return m[1].replace(/[#@\[\](){}|*^~`]+/g, ' ')
      .replace(/\b(ft|feat|official|music|video|lyrics|hd|4k|full)\b/gi, '')
      .replace(/\s{2,}/g, ' ').trim().slice(0, 80)
  } catch { return '' }
}

// ─────────────────────────────────────────────────────────────────────────────
//  HTTP DOWNLOADER (with size guard & abort support)
// ─────────────────────────────────────────────────────────────────────────────
async function downloadHTTP(url, dest, opts = {}) {
  const axios = getAxios()
  const { expectedType = "binary", maxSizeMB = MAX_DOWNLOAD_MB, headers = {}, signal } = opts

  const response = await axios({
    method: "get",
    url,
    responseType: "stream",
    timeout: DL_TIMEOUT_MS,
    maxRedirects: 10,
    maxContentLength: maxSizeMB * 1024 * 1024,
    signal,
    headers: {
      ...headers,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  })

  const contentType = response.headers["content-type"] || ""
  if (expectedType === "video" && (contentType.includes("html") || contentType.includes("json"))) {
    throw new Error(`Expected video, got content-type: ${contentType}`)
  }
  if (expectedType === "audio" && contentType.includes("html")) {
    throw new Error(`Expected audio, got content-type: ${contentType}`)
  }

  const writer = fs.createWriteStream(dest)
  let downloaded = 0
  const maxBytes = maxSizeMB * 1024 * 1024

  response.data.on("data", chunk => {
    downloaded += chunk.length
    if (downloaded > maxBytes) {
      response.data.destroy()
      writer.destroy()
      throw new Error(`Download exceeded ${maxSizeMB} MB limit`)
    }
  })

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(dest))
    const onError = (err) => {
      writer.destroy()
      cleanupFile(dest)
      reject(err)
    }
    writer.on("error", onError)
    response.data.on("error", onError)
    if (signal) {
      signal.addEventListener("abort", () => {
        writer.destroy()
        cleanupFile(dest)
        reject(new Error("Download aborted"))
      })
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  RAPIDAPI HELPERS (with retry & 429 handling)
// ─────────────────────────────────────────────────────────────────────────────
async function rapidApiGet(host, endpoint, params, onProgress, signal) {
  const axios = getAxios()
  let lastErr = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await axios.get(`https://${host}${endpoint}`, {
        params,
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": host,
        },
        signal,
      })
      return res.data
    } catch (e) {
      lastErr = e
      const status = e.response?.status
      if (status === 429 || status === 503) {
        onProgress?.(`⏳ RapidAPI rate limit (attempt ${attempt}/${MAX_RETRIES})...`)
        await sleep(2000 * attempt)
      } else {
        break
      }
    }
  }
  throw lastErr || new Error("RapidAPI request failed after retries")
}

// ─────────────────────────────────────────────────────────────────────────────
//  APIFY HELPERS (with run + dataset poll fallback)
// ─────────────────────────────────────────────────────────────────────────────
async function apifyRunSync(actorId, input, onProgress, signal) {
  const axios = getAxios()
  onProgress?.("🎭 Apify Actor → starting...")

  const runRes = await axios.post(
    `https://api.apify.com/v2/acts/${actorId}/runs`,
    input,
    { params: { token: APIFY_TOKEN }, timeout: 30_000, signal }
  )

  const runId = runRes.data?.data?.id
  if (!runId) throw new Error("Apify: could not start actor run")

  const datasetId = runRes.data?.data?.defaultDatasetId
  const buildSecs = runRes.data?.data?.options?.buildWaitSecs || 60

  onProgress?.("🎭 Apify Actor → waiting for build...")
  await sleep(Math.min(buildSecs, 10) * 1000)

  const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items`
  const startTime = Date.now()

  while (Date.now() - startTime < 120_000) {
    if (signal?.aborted) throw new Error("Apify polling aborted")

    try {
      const poll = await axios.get(datasetUrl, {
        params: { token: APIFY_TOKEN, clean: true },
        timeout: 15_000,
        signal,
      })
      if (Array.isArray(poll.data) && poll.data.length > 0) {
        return poll.data
      }
    } catch {}

    onProgress?.("🎭 Apify Actor → polling dataset...")
    await sleep(5000)
  }

  throw new Error("Apify: dataset polling timed out")
}

// ─────────────────────────────────────────────────────────────────────────────
//  RAPIDAPI — YOUTUBE
// ─────────────────────────────────────────────────────────────────────────────
async function rapidApiYouTubeDownload(url, audioOnly = false, onProgress = null, signal = null) {
  if (!RAPIDAPI_KEY) throw new Error("RapidAPI key not configured")
  onProgress?.("🚀 RapidAPI YouTube → resolving...")

  const data = await rapidApiGet(RAPIDAPI_YT_HOST, "/api", { key: RAPIDAPI_KEY, url }, onProgress, signal)
  if (!data || !Array.isArray(data.medias) || !data.medias.length) {
    throw new Error("RapidAPI YouTube: no media found")
  }

  let media
  if (audioOnly) {
    media = data.medias.find(m => m.extension === "mp3" || m.type?.includes("audio"))
  } else {
    media = data.medias.find(m => m.extension === "mp4" && m.quality >= 720)
      || data.medias.find(m => m.extension === "mp4")
      || data.medias[0]
  }

  if (!media?.url) throw new Error("RapidAPI YouTube: no suitable media URL")

  const title = sanitiseFilename(data.title || `yt_${Date.now()}`)
  const ext = audioOnly ? ".mp3" : (media.extension || "mp4")
  const dest = path.join(DL_DIR, `${title}_${extractYouTubeId(url) || Date.now()}.${ext.replace(/^\./, '')}`)

  onProgress?.(`⬇️ RapidAPI YouTube → ${media.quality || "best"}p...`)
  await downloadHTTP(media.url, dest, { expectedType: audioOnly ? "audio" : "video", signal })
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  APIFY — YOUTUBE
// ─────────────────────────────────────────────────────────────────────────────
async function apifyYouTubeDownload(url, audioOnly = false, onProgress = null, signal = null) {
  if (!APIFY_TOKEN) throw new Error("Apify token not configured")

  const items = await apifyRunSync(APIFY_YOUTUBE_ACTOR, {
    urls: [url],
    downloadVideo: !audioOnly,
    downloadAudio: audioOnly,
    quality: audioOnly ? "best" : "1080",
  }, onProgress, signal)

  if (!Array.isArray(items) || !items.length) throw new Error("Apify YouTube: no dataset items")
  const item = items[0]
  if (!item.success) throw new Error(`Apify YouTube: ${item.error || "unknown error"}`)

  const downloadUrl = audioOnly ? item.audioUrl : item.videoUrl
  if (!downloadUrl) throw new Error("Apify YouTube: no download URL")

  const title = sanitiseFilename(item.title || `yt_${Date.now()}`)
  const ext = audioOnly ? ".mp3" : ".mp4"
  const dest = path.join(DL_DIR, `${title}_${extractYouTubeId(url) || Date.now()}${ext}`)

  onProgress?.("⬇️ Apify YouTube → downloading...")
  await downloadHTTP(downloadUrl, dest, { expectedType: audioOnly ? "audio" : "video", signal })
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  RAPIDAPI — TIKTOK
// ─────────────────────────────────────────────────────────────────────────────
async function rapidApiTikTokDownload(url, audioOnly = false, onProgress = null, signal = null) {
  if (!RAPIDAPI_KEY) throw new Error("RapidAPI key not configured")
  onProgress?.("🚀 RapidAPI TikTok → resolving...")

  const data = await rapidApiGet(RAPIDAPI_TIKTOK_HOST, "/media", { videoUrl: url }, onProgress, signal)
  const mediaUrl = data?.downloadUrl || data?.video?.url || data?.url || data?.media?.url || data?.data?.play
  if (!mediaUrl) throw new Error("RapidAPI TikTok: no download URL")

  const title = sanitiseFilename(data.title || data?.video?.title || "tiktok")
  const ext = audioOnly ? ".mp3" : ".mp4"
  const dest = path.join(DL_DIR, `${title}_${Date.now()}.${ext}`)

  onProgress?.(`⬇️ RapidAPI TikTok → ${audioOnly ? "audio" : "video"}...`)
  await downloadHTTP(mediaUrl, dest, { expectedType: audioOnly ? "audio" : "video", signal })

  if (audioOnly && !dest.endsWith(".mp3")) {
    const mp3Dest = dest.replace(/\.[^.]+$/, ".mp3")
    await ffmpegConvert(dest, mp3Dest, ["-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k"])
    cleanupFile(dest)
    return [mp3Dest]
  }
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  APIFY — TIKTOK
// ─────────────────────────────────────────────────────────────────────────────
async function apifyTikTokDownload(url, audioOnly = false, onProgress = null, signal = null) {
  if (!APIFY_TOKEN) throw new Error("Apify token not configured")

  const items = await apifyRunSync(APIFY_TIKTOK_ACTOR, {
    urls: [url], downloadVideo: true, downloadAudio: audioOnly
  }, onProgress, signal)

  if (!Array.isArray(items) || !items.length) throw new Error("Apify TikTok: no items")
  const item = items[0]
  const dlUrl = audioOnly ? item.audioUrl : item.videoUrl
  if (!dlUrl) throw new Error("Apify TikTok: no download URL")

  const title = sanitiseFilename(item.title || "tiktok")
  const ext = audioOnly ? ".mp3" : ".mp4"
  const dest = path.join(DL_DIR, `${title}_${Date.now()}${ext}`)

  onProgress?.("⬇️ Apify TikTok → downloading...")
  await downloadHTTP(dlUrl, dest, { expectedType: audioOnly ? "audio" : "video", signal })
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  RAPIDAPI — INSTAGRAM
// ─────────────────────────────────────────────────────────────────────────────
async function rapidApiInstagramDownload(url, onProgress = null, signal = null) {
  if (!RAPIDAPI_KEY) throw new Error("RapidAPI key not configured")
  onProgress?.("🚀 RapidAPI Instagram → resolving...")

  const data = await rapidApiGet(RAPIDAPI_IG_HOST, "/download", { url }, onProgress, signal)
  const urls = data?.urls || data?.result?.map(r => r.url) || data?.media || data?.data?.urls || []
  if (!urls.length) throw new Error("RapidAPI Instagram: no media URLs")

  const files = []
  let i = 0
  for (const mediaUrl of urls) {
    i++
    const ext = mediaUrl.includes(".mp4") ? ".mp4" : ".jpg"
    const dest = path.join(DL_DIR, `ig_${Date.now()}_${i}${ext}`)
    onProgress?.(`⬇️ Instagram ${i}/${urls.length}...`)
    try {
      await downloadHTTP(mediaUrl, dest, { signal })
      files.push(dest)
    } catch (e) {
      onProgress?.(`⚠️ IG item ${i} failed: ${e.message}`)
    }
  }
  if (!files.length) throw new Error("RapidAPI Instagram: all items failed")
  return files
}

// ─────────────────────────────────────────────────────────────────────────────
//  APIFY — INSTAGRAM
// ─────────────────────────────────────────────────────────────────────────────
async function apifyInstagramDownload(url, onProgress = null, signal = null) {
  if (!APIFY_TOKEN) throw new Error("Apify token not configured")

  const items = await apifyRunSync(APIFY_INSTAGRAM_ACTOR, {
    urls: [url], includeMetadata: true
  }, onProgress, signal)

  if (!Array.isArray(items) || !items.length) throw new Error("Apify Instagram: no items")

  const files = []
  let i = 0
  for (const item of items) {
    const mediaUrls = item.mediaUrls || item.urls || (item.videoUrl ? [item.videoUrl] : [])
    for (const mediaUrl of mediaUrls) {
      i++
      const ext = mediaUrl.includes(".mp4") ? ".mp4" : ".jpg"
      const dest = path.join(DL_DIR, `ig_${Date.now()}_${i}${ext}`)
      onProgress?.(`⬇️ Apify Instagram ${i}...`)
      try {
        await downloadHTTP(mediaUrl, dest, { signal })
        files.push(dest)
      } catch (e) {
        onProgress?.(`⚠️ Apify IG item ${i} failed: ${e.message}`)
      }
    }
  }
  if (!files.length) throw new Error("Apify Instagram: all items failed")
  return files
}

// ─────────────────────────────────────────────────────────────────────────────
//  RAPIDAPI — TWITTER/X
// ─────────────────────────────────────────────────────────────────────────────
async function rapidApiTwitterDownload(url, onProgress = null, signal = null) {
  if (!RAPIDAPI_KEY) throw new Error("RapidAPI key not configured")
  onProgress?.("🚀 RapidAPI Twitter/X → resolving...")

  const data = await rapidApiGet(RAPIDAPI_TWITTER_HOST, "/download", { url }, onProgress, signal)
  const mediaUrl = data?.video_url || data?.url || data?.downloadUrl || data?.media?.[0]?.url || data?.video?.url
  if (!mediaUrl) throw new Error("RapidAPI Twitter: no media URL")

  const dest = path.join(DL_DIR, `twitter_${Date.now()}.mp4`)
  onProgress?.("⬇️ RapidAPI Twitter/X → downloading...")
  await downloadHTTP(mediaUrl, dest, { expectedType: "video", signal })
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  RAPIDAPI — FACEBOOK
// ─────────────────────────────────────────────────────────────────────────────
async function rapidApiFacebookDownload(url, onProgress = null, signal = null) {
  if (!RAPIDAPI_KEY) throw new Error("RapidAPI key not configured")
  onProgress?.("🚀 RapidAPI Facebook → resolving...")

  const data = await rapidApiGet(RAPIDAPI_FB_HOST, "/download", { url }, onProgress, signal)
  const mediaUrl = data?.url || data?.links?.["Download High Quality"] || data?.links?.["Download Low Quality"] || data?.video_url || data?.downloadUrl
  if (!mediaUrl) throw new Error("RapidAPI Facebook: no media URL")

  const dest = path.join(DL_DIR, `fb_${Date.now()}.mp4`)
  onProgress?.("⬇️ RapidAPI Facebook → downloading...")
  await downloadHTTP(mediaUrl, dest, { expectedType: "video", signal })
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  RAPIDAPI — ALL-MEDIA (50+ sites)
// ─────────────────────────────────────────────────────────────────────────────
async function rapidApiAllMediaDownload(url, audioOnly = false, onProgress = null, signal = null) {
  if (!RAPIDAPI_KEY) throw new Error("RapidAPI key not configured")
  onProgress?.("🚀 RapidAPI All-Media → resolving...")

  const data = await rapidApiGet(RAPIDAPI_ALL_MEDIA_HOST, "/download", { url }, onProgress, signal)
  const mediaUrl = data?.url || data?.downloadUrl || data?.video_url || data?.media?.[0]?.url || data?.link
  if (!mediaUrl) throw new Error("RapidAPI All-Media: no media URL")

  const title = sanitiseFilename(data?.title || `media_${Date.now()}`)
  const ext = audioOnly ? ".mp3" : ".mp4"
  const dest = path.join(DL_DIR, `${title}.${ext}`)

  onProgress?.("⬇️ RapidAPI All-Media → downloading...")
  await downloadHTTP(mediaUrl, dest, { expectedType: audioOnly ? "audio" : "video", signal })

  if (audioOnly && !dest.endsWith(".mp3")) {
    const mp3Dest = dest.replace(/\.[^.]+$/, ".mp3")
    await ffmpegConvert(dest, mp3Dest, ["-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k"])
    cleanupFile(dest)
    return [mp3Dest]
  }
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  APIFY — UNIVERSAL (21+ platforms)
// ─────────────────────────────────────────────────────────────────────────────
async function apifyAllInOneDownload(url, audioOnly = false, onProgress = null, signal = null) {
  if (!APIFY_TOKEN) throw new Error("Apify token not configured")

  let items = []
  try {
    items = await apifyRunSync(APIFY_SOCIAL_ACTOR, { urls: [url], includeMetadata: true }, onProgress, signal)
  } catch (e) {
    onProgress?.(`⚠️ Primary actor failed: ${e.message}. Trying backup...`)
    items = await apifyRunSync(APIFY_ALL_SOCIAL_ACTOR, { urls: [url], includeMetadata: true }, onProgress, signal)
  }

  if (!Array.isArray(items) || !items.length) throw new Error("Apify Universal: no items")
  const item = items[0]
  if (!item.success) throw new Error(`Apify Universal: ${item.error || "failed"}`)

  const dlUrl = audioOnly ? (item.audioUrl || item.video_url) : (item.video_url || item.downloadUrl)
  if (!dlUrl) throw new Error("Apify Universal: no download URL")

  const title = sanitiseFilename(item.title || `media_${Date.now()}`)
  const ext = audioOnly ? ".mp3" : ".mp4"
  const dest = path.join(DL_DIR, `${title}.${ext}`)

  onProgress?.("⬇️ Apify Universal → downloading...")
  await downloadHTTP(dlUrl, dest, { expectedType: audioOnly ? "audio" : "video", signal })

  if (audioOnly && !dest.endsWith(".mp3")) {
    const mp3Dest = dest.replace(/\.[^.]+$/, ".mp3")
    await ffmpegConvert(dest, mp3Dest, ["-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k"])
    cleanupFile(dest)
    return [mp3Dest]
  }
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  COBALT API
// ─────────────────────────────────────────────────────────────────────────────
async function cobaltDownload(url, audioOnly = false, onProgress = null, signal = null) {
  if (!COBALT_API) throw new Error("Cobalt not configured")
  const axios = getAxios()

  const body = {
    url,
    videoQuality: "1080",
    audioFormat: audioOnly ? "mp3" : "best",
    downloadMode: audioOnly ? "audio" : "auto",
    filenameStyle: "pretty",
    tiktokFullAudio: true,
    tiktokH265: false,
    removeTikTokWatermark: true,
    youtubeHLS: false,
  }

  onProgress?.(`🔷 Cobalt → ${COBALT_API.replace("https://", "")}`)
  const res = await axios.post(`${COBALT_API}/`, body, {
    headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "maureonix-bot/1.0" },
    timeout: 30_000,
    signal,
  })

  const d = res.data
  if (d.status === "error") throw new Error(`Cobalt: ${d.error?.code || JSON.stringify(d.error)}`)

  const files = []
  if (d.status === "redirect" || d.status === "tunnel") {
    const fname = sanitiseFilename(d.filename || `cobalt_${Date.now()}.mp4`)
    const dest = path.join(DL_DIR, fname)
    onProgress?.("⬇️ Cobalt streaming...")
    await downloadHTTP(d.url, dest, { signal })
    files.push(dest)
  } else if (d.status === "picker") {
    onProgress?.(`📦 ${d.picker.length} items`)
    let i = 0
    for (const item of d.picker) {
      i++
      const fname = sanitiseFilename(item.filename || `cobalt_${Date.now()}_${i}.mp4`)
      const dest = path.join(DL_DIR, fname)
      onProgress?.(`⬇️ Item ${i}/${d.picker.length}`)
      try {
        await downloadHTTP(item.url, dest, { signal })
        files.push(dest)
      } catch (e) {
        onProgress?.(`⚠️ Cobalt item ${i} failed: ${e.message}`)
      }
    }
    if (!files.length) throw new Error("Cobalt picker: all items failed")
  } else {
    throw new Error(`Unexpected Cobalt status: ${d.status}`)
  }
  return files
}

// ─────────────────────────────────────────────────────────────────────────────
//  TIKWM API  (BULLETPROOF)
// ─────────────────────────────────────────────────────────────────────────────
async function tikwmDownload(url, audioOnly = false, onProgress = null, signal = null) {
  const axios = getAxios()
  const resolved = await resolveRedirect(url)
  onProgress?.(`🔗 Resolved: ${resolved.slice(0, 60)}`)

  const form = new URLSearchParams()
  form.append("url", resolved)
  form.append("hd", "1")

  const tikwmHeaders = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.tikwm.com/",
  }

  let lastErr = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await axios.post(`${TIKWM_API}/api/`, form.toString(), {
        headers: tikwmHeaders,
        timeout: 30_000,
        signal,
      })

      const d = res.data
      if (!d || d.code !== 0) {
        throw new Error(`TikWM API error: ${d?.msg || JSON.stringify(d).slice(0, 100)}`)
      }

      const data = d.data
      const title = sanitiseFilename(data.title || "tiktok")
      const videoId = data.id || Date.now()

      // Slideshow
      if (Array.isArray(data.images) && data.images.length > 0) {
        onProgress?.(`🖼️ Slideshow — ${data.images.length} images`)
        const files = []
        let i = 0
        for (const imgUrl of data.images) {
          i++
          const ext = imgUrl.includes(".webp") ? ".webp" : ".jpg"
          const fname = sanitiseFilename(`tikwm_${videoId}_${i}.${ext}`)
          const dest = path.join(DL_DIR, fname)
          onProgress?.(`⬇️ Image ${i}/${data.images.length}`)
          try {
            await downloadHTTP(imgUrl, dest, { headers: { Referer: "https://www.tikwm.com/" }, signal })
            files.push(dest)
          } catch (e) {
            onProgress?.(`⚠️ Image ${i} failed: ${e.message}`)
          }
        }
        if (!files.length) throw new Error("TikWM slideshow: all images failed")

        if (audioOnly && data.music) {
          const musicUrl = typeof data.music === "string" ? data.music : data.music?.url || data.music?.playUrl
          if (musicUrl) {
            const adest = path.join(DL_DIR, sanitiseFilename(`tikwm_${videoId}_audio.mp3`))
            try {
              await downloadHTTP(musicUrl, adest, { headers: { Referer: "https://www.tikwm.com/" }, signal })
              files.push(adest)
            } catch {}
          }
        }
        return files
      }

      // Audio only
      if (audioOnly) {
        const musicUrl = typeof data.music === "string" ? data.music : data.music?.url || data.music?.playUrl
        if (musicUrl) {
          onProgress?.("🎵 Extracting audio...")
          const adest = path.join(DL_DIR, sanitiseFilename(`${title}_audio.mp3`))
          await downloadHTTP(musicUrl, adest, { headers: { Referer: "https://www.tikwm.com/" }, signal })
          return [adest]
        }
        throw new Error("TikWM: no audio URL available")
      }

      // VIDEO — try HD then SD with validation
      const candidates = [
        { url: data.hdplay, label: "HD" },
        { url: data.play, label: "SD" },
        { url: data.wmplay, label: "Watermarked" },
      ].filter(c => c.url)

      if (!candidates.length) throw new Error("TikWM: no video URL in response")

      for (const { url: videoUrl, label } of candidates) {
        try {
          onProgress?.(`⬇️ Downloading TikTok (${label})...`)
          const fname = sanitiseFilename(`${title}_${videoId}.mp4`)
          const dest = path.join(DL_DIR, fname)

          await downloadHTTP(videoUrl, dest, {
            expectedType: "video",
            headers: { Referer: "https://www.tikwm.com/", Origin: "https://www.tikwm.com" },
            signal,
          })

          if (!isValidMediaFile(dest, "video")) {
            cleanupFile(dest)
            throw new Error(`Downloaded file is not valid video (got HTML/audio?)`)
          }

          return [dest]
        } catch (videoErr) {
          onProgress?.(`⚠️ ${label} failed: ${videoErr.message}`)
          lastErr = videoErr
        }
      }

      throw lastErr || new Error("TikWM: all video qualities failed")

    } catch (e) {
      lastErr = e
      onProgress?.(`⚠️ TikWM attempt ${attempt}/${MAX_RETRIES} failed: ${e.message}`)
      if (attempt < MAX_RETRIES) await sleep(2000 * attempt)
    }
  }
  throw lastErr || new Error("TikWM: all retries exhausted")
}

async function tikwmSearch(keyword, count = 10, signal = null) {
  const axios = getAxios()
  const res = await axios.get(`${TIKWM_API}/api/feed/search`, {
    params: { keywords: keyword, count, cursor: 0, web: 1, hd: 1 },
    headers: { "User-Agent": "Mozilla/5.0", Referer: "https://www.tikwm.com/" },
    timeout: 20_000,
    signal,
  })
  const videos = res.data?.data?.videos || []
  return videos.map(v => `https://www.tiktok.com/@${v.author?.unique_id || "user"}/video/${v.video_id || v.id}`)
}

// ─────────────────────────────────────────────────────────────────────────────
//  YOUTUBEI.JS
// ─────────────────────────────────────────────────────────────────────────────
async function youtubeiDownload(url, opts = {}) {
  const { audioOnly = false, quality = "best", onProgress = null, signal = null } = opts
  const videoId = extractYouTubeId(url)
  if (!videoId) throw new Error("Invalid YouTube URL")

  onProgress?.("📡 YouTube InnerTube API...")
  const yt = await getYoutubei()
  const info = await yt.getInfo(videoId)

  const rawTitle = info.basic_info?.title || info.primary_info?.title?.text || `yt_${videoId}`
  const title = sanitiseFilename(rawTitle)

  const downloadOpts = audioOnly
    ? { type: "audio", quality: "best" }
    : { type: "video", quality: quality === "best" ? "best" : quality, format: "mp4" }

  const ext = audioOnly ? ".mp3" : ".mp4"
  const dest = path.join(DL_DIR, `${title}_${videoId}.${ext}`)

  try {
    onProgress?.(audioOnly ? "🎵 Downloading audio stream..." : "⬇️ Downloading video stream...")
    const stream = await info.download(downloadOpts)
    if (signal?.aborted) throw new Error("youtubei.js download aborted")
    const nodeStream = Readable.fromWeb(stream)
    await pipeline(nodeStream, fs.createWriteStream(dest))
  } catch (e) {
    cleanupFile(dest)
    throw e
  }

  if (audioOnly && !dest.endsWith(".mp3")) {
    const mp3Dest = dest.replace(/\.[^.]+$/, ".mp3")
    onProgress?.("🔧 Converting to MP3...")
    try {
      await ffmpegConvert(dest, mp3Dest, ["-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k"])
    } finally {
      cleanupFile(dest)
    }
    return [mp3Dest]
  }
  return [dest]
}

async function youtubeiSearch(query, count = 10, signal = null) {
  const yt = await getYoutubei()
  const search = await yt.search(query, { type: "video" })
  const videos = search.videos || []
  return videos.slice(0, count).map(v => `https://www.youtube.com/watch?v=${v.id}`)
}

// ─────────────────────────────────────────────────────────────────────────────
//  YOUTUBE-DL-EXEC  (LAST RESORT — isolated dir per download)
// ─────────────────────────────────────────────────────────────────────────────
async function youtubeDlExecDownload(url, opts = {}) {
  const { audioOnly = false, quality = "best", onProgress = null, signal = null } = opts
  const youtubedl = getYoutubeDlExec()

  onProgress?.("⚡ youtube-dl-exec (last resort)...")

  const jobDir = path.join(DL_DIR, `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
  fs.mkdirSync(jobDir, { recursive: true })

  const outputTemplate = path.join(jobDir, "%(title).120B [%(id)s].%(ext)s")

  const options = {
    output: outputTemplate,
    noWarnings: true,
    noCallHome: true,
    noCheckCertificate: true,
    preferFreeFormats: true,
    mergeOutputFormat: "mp4",
    retries: 10,
    fragmentRetries: 10,
    socketTimeout: 30,
  }

  if (audioOnly) {
    options.extractAudio = true
    options.audioFormat = "mp3"
    options.audioQuality = 0
  } else {
    options.format = quality === "best"
      ? "best[ext=mp4]/best"
      : `best[height<=${quality}][ext=mp4]/best[height<=${quality}]`
  }

  try {
    await youtubedl(url, options)
  } catch (e) {
    cleanupDir(jobDir)
    throw new Error(`youtube-dl-exec failed: ${e.message}`)
  }

  if (signal?.aborted) {
    cleanupDir(jobDir)
    throw new Error("Download aborted")
  }

  const files = scanDirForNew(jobDir, 120_000)
  if (!files.length) {
    cleanupDir(jobDir)
    throw new Error("youtube-dl-exec: no output file found")
  }

  if (audioOnly) {
    const mp3Files = files.filter(f => f.endsWith(".mp3"))
    if (mp3Files.length) { cleanupDir(jobDir); return mp3Files }
    const videoFiles = files.filter(f => /\.(mp4|webm|m4a|ogg|mkv)$/i.test(f))
    if (videoFiles.length) {
      const mp3Dest = videoFiles[0].replace(/\.[^.]+$/, ".mp3")
      await ffmpegConvert(videoFiles[0], mp3Dest, ["-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k"])
      cleanupDir(jobDir)
      return [mp3Dest]
    }
  }

  const result = files
  setTimeout(() => cleanupDir(jobDir), 300_000) // cleanup after 5 min
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
//  SPOTDL (with binary check)
// ─────────────────────────────────────────────────────────────────────────────
function spotdlDownload(url, onProgress = null) {
  return new Promise((resolve, reject) => {
    if (!hasBinary(SPOTDL_BIN)) {
      return reject(new Error(`spotdl binary not found (${SPOTDL_BIN}). Install with: pip install spotdl`))
    }
    const args = [
      "--output", path.join(DL_DIR, "{title} - {artists}"),
      "--format", "mp3",
      "--bitrate", "320k",
      "--threads", "4",
      "--no-cache",
      url,
    ]
    const proc = spawn(SPOTDL_BIN, args)
    const files = []
    let stderr = ""
    const timer = setTimeout(() => { proc.kill(); reject(new Error("spotdl timeout")) }, DL_TIMEOUT_MS * 2)

    proc.stdout.on("data", d => {
      const s = d.toString()
      onProgress?.(s.trim().slice(0, 80))
      for (const m of (s.match(/Downloaded "(.+?)"/g) || [])) {
        const name = m.replace(/Downloaded "|"/g, "").trim()
        const fp = fs.existsSync(name) ? name : path.join(DL_DIR, path.basename(name))
        if (fs.existsSync(fp)) files.push(fp)
      }
    })
    proc.stderr.on("data", d => { stderr += d.toString() })
    proc.on("close", code => {
      clearTimeout(timer)
      const out = files.length > 0 ? files : scanDirForNew(DL_DIR)
      if (code === 0 || out.length > 0) return resolve(out)
      reject(new Error(`spotdl exit ${code}: ${stderr.slice(-300)}`))
    })
    proc.on("error", e => { clearTimeout(timer); reject(e) })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  GALLERY-DL (with binary check)
// ─────────────────────────────────────────────────────────────────────────────
function galleryDlDownload(url, onProgress = null) {
  return new Promise((resolve, reject) => {
    if (!hasBinary(GALLERYDL_BIN)) {
      return reject(new Error(`gallery-dl binary not found (${GALLERYDL_BIN}). Install with: pip install gallery-dl`))
    }
    const args = ["--dest", DL_DIR, "--no-mtime", "--retries", "3", "--sleep", "0.3", url]
    const proc = spawn(GALLERYDL_BIN, args)
    const files = []
    let stderr = ""
    const timer = setTimeout(() => { proc.kill(); reject(new Error("gallery-dl timeout")) }, DL_TIMEOUT_MS)

    proc.stdout.on("data", d => {
      for (const line of d.toString().split("\n")) {
        const t = line.trim()
        if (t && fs.existsSync(t)) { files.push(t); onProgress?.(path.basename(t).slice(0, 50)) }
      }
    })
    proc.stderr.on("data", d => { stderr += d.toString() })
    proc.on("close", code => {
      clearTimeout(timer)
      const out = files.length > 0 ? files : scanDirForNew(DL_DIR)
      if (code === 0 || out.length > 0) return resolve(out)
      reject(new Error(`gallery-dl exit ${code}: ${stderr.slice(-300)}`))
    })
    proc.on("error", e => { clearTimeout(timer); reject(e) })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  GOOGLE DRIVE
// ─────────────────────────────────────────────────────────────────────────────
async function gdriveDownload(url, signal = null) {
  const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/)
  if (!idMatch) throw new Error("Cannot extract Google Drive file ID")
  const fileId = idMatch[1]
  const dlUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`
  try { return await youtubeDlExecDownload(dlUrl, { signal }) } catch {}
  const dest = path.join(DL_DIR, `gdrive_${fileId}`)
  await downloadHTTP(dlUrl, dest, { signal })
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  MEDIAFIRE
// ─────────────────────────────────────────────────────────────────────────────
async function mediafireDownload(url, signal = null) {
  const axios = getAxios()
  const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 15000, signal })
  const m1 = res.data.match(/href="(https:\/\/download\d*\.mediafire\.com\/[^"]+)"/)
  const m2 = res.data.match(/id="downloadButton"[^>]+href="([^"]+)"/)
  const dlUrl = (m1 || m2)?.[1]
  if (!dlUrl) throw new Error("MediaFire: cannot find direct download link")
  const dest = path.join(DL_DIR, `mediafire_${Date.now()}`)
  await downloadHTTP(dlUrl, dest, { signal })
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  APK
// ─────────────────────────────────────────────────────────────────────────────
async function apkDownload(url, signal = null) {
  try { return await youtubeDlExecDownload(url, { signal }) } catch {}
  const dest = path.join(DL_DIR, `app_${Date.now()}.apk`)
  await downloadHTTP(url, dest, { signal })
  return [dest]
}

// ─────────────────────────────────────────────────────────────────────────────
//  FFMPEG (with binary check & graceful fallback)
// ─────────────────────────────────────────────────────────────────────────────
function ffmpegCompress(src) {
  if (!hasBinary(FFMPEG_BIN)) throw new Error(`ffmpeg not found (${FFMPEG_BIN}). Install via nixpacks/apt.`)
  const dest = src.replace(/\.[^.]+$/, "") + "_cmp.mp4"
  return new Promise((resolve, reject) => {
    const args = ["-y", "-i", src, "-c:v", "libx264", "-preset", "fast", "-crf", "28",
                  "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", dest]
    const proc = spawn(FFMPEG_BIN, args)
    let stderr = ""
    const timer = setTimeout(() => { proc.kill(); reject(new Error("ffmpeg timeout")) }, 180_000)
    proc.stderr.on("data", d => { stderr += d.toString() })
    proc.on("close", code => {
      clearTimeout(timer)
      if (code === 0 && fs.existsSync(dest)) return resolve(dest)
      reject(new Error(`ffmpeg exit ${code}`))
    })
    proc.on("error", e => { clearTimeout(timer); reject(e) })
  })
}

function ffmpegConvert(src, dest, extraArgs = []) {
  if (!hasBinary(FFMPEG_BIN)) throw new Error(`ffmpeg not found (${FFMPEG_BIN}). Install via nixpacks/apt.`)
  return new Promise((resolve, reject) => {
    const args = ["-y", "-i", src, ...extraArgs, dest]
    const proc = spawn(FFMPEG_BIN, args)
    let stderr = ""
    const timer = setTimeout(() => { proc.kill(); reject(new Error("ffmpeg convert timeout")) }, 180_000)
    proc.stderr.on("data", d => { stderr += d.toString() })
    proc.on("close", code => {
      clearTimeout(timer)
      if (code === 0 && fs.existsSync(dest)) return resolve(dest)
      reject(new Error(`ffmpeg convert exit ${code}: ${stderr.slice(-200)}`))
    })
    proc.on("error", e => { clearTimeout(timer); reject(e) })
  })
}

async function ensureUnderLimit(filepath) {
  if (!filepath || !fs.existsSync(filepath)) throw new Error(`File not found: ${filepath}`)
  if (getFileSizeMB(filepath) <= TG_MAX_MB) return filepath
  const isVideo = /\.(mp4|mkv|avi|mov|webm|flv)$/i.test(filepath)
  if (!isVideo) throw new Error(`File too large (${getFileSizeMB(filepath).toFixed(1)} MB) and cannot be compressed`)
  if (!hasBinary(FFMPEG_BIN)) throw new Error(`File too large and ffmpeg not available for compression`)
  const compressed = await ffmpegCompress(filepath)
  if (getFileSizeMB(compressed) <= TG_MAX_MB) {
    cleanupFile(filepath)
    return compressed
  }
  throw new Error(`Still too large after compression (${getFileSizeMB(compressed).toFixed(1)} MB)`)
}

// ─────────────────────────────────────────────────────────────────────────────
//  SMART ROUTER
// ─────────────────────────────────────────────────────────────────────────────
async function smartDownload(url, opts = {}) {
  const { audioOnly = false, quality = "best", onProgress = null } = opts
  const log = m => { try { onProgress?.(m) } catch {} }
  const platform = detectPlatform(url)
  log(`🔍 Platform: ${platform}`)

  const controller = new AbortController()
  const signal = controller.signal

  // YouTube
  if (platform === "youtube") {
    if (RAPIDAPI_KEY) {
      try { log("🚀 RapidAPI YouTube..."); return await rapidApiYouTubeDownload(url, audioOnly, log, signal) }
      catch (e) { log(`⚠️ RapidAPI YT: ${e.message}`) }
    }
    if (APIFY_TOKEN) {
      try { log("🎭 Apify YouTube..."); return await apifyYouTubeDownload(url, audioOnly, log, signal) }
      catch (e) { log(`⚠️ Apify YT: ${e.message}`) }
    }
    try { log("📺 youtubei.js..."); return await youtubeiDownload(url, { audioOnly, quality, onProgress: log, signal }) }
    catch (e) { log(`⚠️ youtubei.js: ${e.message}`) }
    if (COBALT_API) {
      try { log("🔷 Cobalt fallback..."); return await cobaltDownload(url, audioOnly, log, signal) }
      catch (e) { log(`⚠️ Cobalt: ${e.message}`) }
    }
    try { log("⚡ youtube-dl-exec LAST RESORT..."); return await youtubeDlExecDownload(url, { audioOnly, quality, onProgress: log, signal }) }
    catch (e) { throw new Error(`YouTube failed. Last error: ${e.message}`) }
  }

  // TikTok
  if (platform === "tiktok") {
    try { log("🎵 TikWM API..."); return await tikwmDownload(url, audioOnly, log, signal) }
    catch (e) { log(`⚠️ TikWM: ${e.message}`) }
    if (RAPIDAPI_KEY) {
      try { log("🚀 RapidAPI TikTok..."); return await rapidApiTikTokDownload(url, audioOnly, log, signal) }
      catch (e) { log(`⚠️ RapidAPI TikTok: ${e.message}`) }
    }
    if (APIFY_TOKEN) {
      try { log("🎭 Apify TikTok..."); return await apifyTikTokDownload(url, audioOnly, log, signal) }
      catch (e) { log(`⚠️ Apify TikTok: ${e.message}`) }
    }
    if (COBALT_API) {
      try { log("🔷 Cobalt fallback..."); return await cobaltDownload(url, audioOnly, log, signal) }
      catch (e) { log(`⚠️ Cobalt: ${e.message}`) }
    }
    try { log("⚡ youtube-dl-exec LAST RESORT..."); return await youtubeDlExecDownload(url, { audioOnly, quality, onProgress: log, signal }) }
    catch (e) { throw new Error(`TikTok failed. Last error: ${e.message}`) }
  }

  // Instagram
  if (platform === "instagram") {
    if (RAPIDAPI_KEY) {
      try { log("🚀 RapidAPI Instagram..."); return await rapidApiInstagramDownload(url, log, signal) }
      catch (e) { log(`⚠️ RapidAPI IG: ${e.message}`) }
    }
    if (APIFY_TOKEN) {
      try { log("🎭 Apify Instagram..."); return await apifyInstagramDownload(url, log, signal) }
      catch (e) { log(`⚠️ Apify IG: ${e.message}`) }
    }
    if (!audioOnly && hasBinary(GALLERYDL_BIN)) {
      try { log("🖼️ gallery-dl..."); const files = await galleryDlDownload(url, log); if (files.length) return files }
      catch (e) { log(`⚠️ gallery-dl: ${e.message}`) }
    }
    if (COBALT_API) {
      try { log("🔷 Cobalt fallback..."); return await cobaltDownload(url, audioOnly, log, signal) }
      catch (e) { log(`⚠️ Cobalt: ${e.message}`) }
    }
    try { log("⚡ youtube-dl-exec LAST RESORT..."); return await youtubeDlExecDownload(url, { audioOnly, quality, onProgress: log, signal }) }
    catch (e) { throw new Error(`Instagram failed. Last error: ${e.message}`) }
  }

  // Twitter/X
  if (platform === "twitter") {
    if (RAPIDAPI_KEY) {
      try { log("🚀 RapidAPI Twitter/X..."); return await rapidApiTwitterDownload(url, log, signal) }
      catch (e) { log(`⚠️ RapidAPI Twitter: ${e.message}`) }
    }
    if (APIFY_TOKEN) {
      try { log("🎭 Apify Universal..."); return await apifyAllInOneDownload(url, audioOnly, log, signal) }
      catch (e) { log(`⚠️ Apify Universal: ${e.message}`) }
    }
    if (COBALT_API) {
      try { log("🔷 Cobalt fallback..."); return await cobaltDownload(url, audioOnly, log, signal) }
      catch (e) { log(`⚠️ Cobalt: ${e.message}`) }
    }
    try { log("⚡ youtube-dl-exec LAST RESORT..."); return await youtubeDlExecDownload(url, { audioOnly, quality, onProgress: log, signal }) }
    catch (e) { throw new Error(`Twitter/X failed. Last error: ${e.message}`) }
  }

  // Facebook
  if (platform === "facebook") {
    if (RAPIDAPI_KEY) {
      try { log("🚀 RapidAPI Facebook..."); return await rapidApiFacebookDownload(url, log, signal) }
      catch (e) { log(`⚠️ RapidAPI FB: ${e.message}`) }
    }
    if (APIFY_TOKEN) {
      try { log("🎭 Apify Universal..."); return await apifyAllInOneDownload(url, audioOnly, log, signal) }
      catch (e) { log(`⚠️ Apify Universal: ${e.message}`) }
    }
    if (COBALT_API) {
      try { log("🔷 Cobalt fallback..."); return await cobaltDownload(url, audioOnly, log, signal) }
      catch (e) { log(`⚠️ Cobalt: ${e.message}`) }
    }
    try { log("⚡ youtube-dl-exec LAST RESORT..."); return await youtubeDlExecDownload(url, { audioOnly, quality, onProgress: log, signal }) }
    catch (e) { throw new Error(`Facebook failed. Last error: ${e.message}`) }
  }

  // Spotify
  if (platform === "spotify") {
    log("🟢 spotDL → Spotify...")
    return await spotdlDownload(url, log)
  }

  // Google Drive
  if (platform === "gdrive") {
    log("📁 Google Drive...")
    return await gdriveDownload(url, signal)
  }

  // MediaFire
  if (platform === "mediafire") {
    log("📦 MediaFire...")
    return await mediafireDownload(url, signal)
  }

  // APK
  if (platform === "apk") {
    log("📱 APK...")
    return await apkDownload(url, signal)
  }

  // Generic / Everything else
  if (RAPIDAPI_KEY) {
    try { log("🚀 RapidAPI All-Media (50+ sites)..."); return await rapidApiAllMediaDownload(url, audioOnly, log, signal) }
    catch (e) { log(`⚠️ RapidAPI All-Media: ${e.message}`) }
  }
  if (APIFY_TOKEN) {
    try { log("🎭 Apify Universal (21+ platforms)..."); return await apifyAllInOneDownload(url, audioOnly, log, signal) }
    catch (e) { log(`⚠️ Apify Universal: ${e.message}`) }
  }
  if (COBALT_API) {
    try { log("🔷 Cobalt fallback..."); return await cobaltDownload(url, audioOnly, log, signal) }
    catch (e) { log(`⚠️ Cobalt: ${e.message}`) }
  }
  if (GALLERYDL_FIRST.has(platform) && !audioOnly && hasBinary(GALLERYDL_BIN)) {
    try { log("🖼️ gallery-dl..."); const files = await galleryDlDownload(url, log); if (files.length) return files }
    catch (e) { log(`⚠️ gallery-dl: ${e.message}`) }
  }
  try { log("⚡ youtube-dl-exec LAST RESORT..."); return await youtubeDlExecDownload(url, { audioOnly, quality, onProgress: log, signal }) }
  catch (e) { throw new Error(`Download failed. Last error: ${e.message}`) }
}

// ─────────────────────────────────────────────────────────────────────────────
//  BULK DOWNLOADER
// ─────────────────────────────────────────────────────────────────────────────
async function bulkDownload(urls, opts = {}) {
  const { audioOnly = false, quality = "best", onProgress = null } = opts
  const results = [], errors = []
  const total = urls.length
  let done = 0

  const notify = (url, status, extra = {}) => {
    done++
    try { onProgress?.({ done, total, url, status, ...extra }) } catch {}
  }

  const queue = [...urls]
  const active = new Set()

  await new Promise(resolve => {
    const schedule = () => {
      while (active.size < MAX_CONCURRENT && queue.length > 0) {
        const url = queue.shift()
        const task = smartDownload(url, {
          audioOnly, quality,
          onProgress: m => {
            try { onProgress?.({ done, total, url, status: "progress", message: m }) } catch {}
          },
        })
          .then(files => { results.push({ url, files }); notify(url, "done", { files }) })
          .catch(err => { errors.push({ url, error: err.message }); notify(url, "error", { error: err.message }) })
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
//  URL FETCHER / SEARCH
// ─────────────────────────────────────────────────────────────────────────────
async function fetchURLs(query, opts = {}) {
  const { count = 10, site = null, type = "any" } = opts
  const axios = getAxios()
  const results = new Set()

  if (site && /tiktok/i.test(site)) {
    try {
      const ttUrls = await tikwmSearch(query, Math.min(count, 35))
      for (const u of ttUrls) results.add(u)
    } catch {}
    return [...results].slice(0, count)
  }

  if (!site || /youtube/i.test(site) || type === "video" || type === "audio") {
    try {
      const ytUrls = await youtubeiSearch(query, Math.min(count, 25))
      for (const u of ytUrls) results.add(u)
    } catch {}
  }

  if (results.size < count) {
    try {
      const q = site ? `site:${site} ${query}` : query
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}&kl=wt-wt`
      const res = await axios.get(url, { timeout: 20_000 })
      const re = /uddg=([^&"]+)/g
      let m
      while ((m = re.exec(res.data)) !== null && results.size < count * 3) {
        try {
          const u = decodeURIComponent(m[1])
          if (u.startsWith("http") && !u.includes("duckduckgo.com")) results.add(u)
        } catch {}
      }
    } catch {}
  }

  return [...results].slice(0, count)
}

// ─────────────────────────────────────────────────────────────────────────────
//  FETCH RELATED
// ─────────────────────────────────────────────────────────────────────────────
async function fetchRelated(exampleUrl, opts = {}) {
  const { count = 10, crossPlatform = false, extraQuery = "" } = opts
  const platform = detectPlatform(exampleUrl)
  const results = new Set()

  let keywords = ""
  try {
    const u = new URL(exampleUrl)
    const tokens = [
      ...u.pathname.split(/[/_\-+.?&=]+/),
      ...u.searchParams.values(),
    ]
    keywords = tokens
      .filter(t => t.length > 2 && !/^\d+$/.test(t) && !/^(www|com|net|org|http|https|video|watch|post|p|v|reel|status|clip)$/i.test(t))
      .slice(0, 8)
      .join(" ")
  } catch {}

  if (platform === "youtube") {
    try {
      const videoId = extractYouTubeId(exampleUrl)
      if (videoId) {
        const yt = await getYoutubei()
        const info = await yt.getInfo(videoId)
        const title = info.basic_info?.title || ""
        if (title) {
          keywords = title.replace(/[#@\[\](){}|*^~`]+/g, " ")
                          .replace(/\b(ft|feat|official|music|video|lyrics|hd|4k|full)\b/gi, "")
                          .replace(/\s{2,}/g, " ").trim().slice(0, 80)
        }
      }
    } catch {}
  } else if (platform === "tiktok") {
    try {
      const axios = getAxios()
      const form = new URLSearchParams()
      form.append("url", exampleUrl)
      form.append("hd", "0")
      const r = await axios.post(`${TIKWM_API}/api/`, form.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 15_000 })
      const t = r.data?.data?.title
      if (t) keywords = t.replace(/#\S+/g, "").trim().slice(0, 80)
      const tags = (r.data?.data?.title || "").match(/#\w+/g) || []
      if (tags.length) keywords += " " + tags.slice(0, 3).join(" ")
    } catch {}
  } else {
    const title = await fetchPageTitle(exampleUrl)
    if (title) keywords = title
  }

  if (!keywords && extraQuery) keywords = extraQuery
  if (!keywords) keywords = exampleUrl.split("/").pop()?.split("?")[0] || "trending"
  if (extraQuery) keywords = `${keywords} ${extraQuery}`.trim()
  keywords = keywords.trim().slice(0, 100)

  if (platform === "tiktok") {
    try {
      const ttUrls = await tikwmSearch(keywords, Math.min(count + 5, 35))
      for (const u of ttUrls) { if (u !== exampleUrl) results.add(u) }
    } catch {}
  } else if (platform === "youtube") {
    try {
      const ytUrls = await youtubeiSearch(keywords, Math.min(count + 3, 25))
      for (const u of ytUrls) { if (u !== exampleUrl) results.add(u) }
    } catch {}
  } else if (platform === "soundcloud" || platform === "bandcamp" || platform === "audiomack") {
    try {
      const youtubedl = getYoutubeDlExec()
      const result = await youtubedl(`scsearch${Math.min(count + 3, 20)}:${keywords}`, {
        print: "%(webpage_url)s",
        noWarnings: true,
        noCallHome: true,
        skipDownload: true,
        flatPlaylist: true,
        playlistEnd: String(Math.min(count + 3, 20)),
      })
      const urls = (result || "").toString().split("\n").filter(Boolean)
      for (const u of urls) { if (u !== exampleUrl) results.add(u) }
    } catch {}
    if (crossPlatform) {
      try {
        const ytUrls = await youtubeiSearch(keywords, Math.min(count, 5))
        for (const u of ytUrls) { if (u !== exampleUrl) results.add(u) }
      } catch {}
    }
  } else {
    try {
      const domainMatch = exampleUrl.match(/https?:\/\/(?:www\.)?([^/]+)/)
      const domain = domainMatch?.[1] || ""
      const q = domain ? `site:${domain} ${keywords}` : keywords
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}&kl=wt-wt`
      const axios = getAxios()
      const res = await axios.get(searchUrl, { timeout: 20_000 })
      const re = /uddg=([^&"]+)/g
      let m
      while ((m = re.exec(res.data)) !== null && results.size < count * 3) {
        try {
          const u = decodeURIComponent(m[1])
          if (u.startsWith("http") && !u.includes("duckduckgo.com") && u !== exampleUrl) results.add(u)
        } catch {}
      }
    } catch {}
    try {
      const ytUrls = await youtubeiSearch(keywords, Math.min(count, 5))
      for (const u of ytUrls) { if (u !== exampleUrl) results.add(u) }
    } catch {}
  }

  if (crossPlatform && platform !== "youtube") {
    try {
      const ytUrls = await youtubeiSearch(keywords, Math.min(count, 5))
      for (const u of ytUrls) { if (u !== exampleUrl) results.add(u) }
    } catch {}
  }

  const urls = [...results].filter(u => u !== exampleUrl).slice(0, count)
  return { platform, query: keywords, urls }
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
  youtubeiDownload,
  youtubeiSearch,
  cobaltDownload,
  youtubeDlExecDownload,
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
  cleanupDir,
  downloadHTTP,
  resolveRedirect,
  sanitiseFilename,
  isValidMediaFile,
  DL_DIR,
  TG_MAX_MB,
  STATUS_EDIT_1,
  STATUS_EDIT_2,
  // API exports
  rapidApiYouTubeDownload,
  apifyYouTubeDownload,
  rapidApiTikTokDownload,
  apifyTikTokDownload,
  rapidApiInstagramDownload,
  apifyInstagramDownload,
  rapidApiTwitterDownload,
  rapidApiFacebookDownload,
  rapidApiAllMediaDownload,
  apifyAllInOneDownload,
}