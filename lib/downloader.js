// lib/downloader.js – API-FIRST, NO PYTHON, EXPORTS STATUS CONSTANTS
"use strict"

const { spawn } = require("child_process")
const path = require("path")
const fs = require("fs")
const os = require("os")
const https = require("https")
const { Readable } = require("stream")
const { pipeline } = require("stream/promises")

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────
const DL_DIR         = process.env.DL_DIR          || path.join(os.tmpdir(), "maureonix_dl")
const FFMPEG_BIN     = process.env.FFMPEG_BIN      || "ffmpeg"
const TIKWM_API      = (process.env.TIKWM_API      || "https://www.tikwm.com").trim()
const COBALT_API     = (process.env.COBALT_API     || "https://api.cobalt.tools").trim()
const APIFY_TOKEN    = process.env.APIFY_TOKEN     || ""

// Apify actor IDs (free, public)
const APIFY_YOUTUBE_ACTOR      = "zakeygroot/youtube-pro-downloader-2026-working"
const APIFY_TIKTOK_ACTOR       = "apilabs/tiktok-downloader"
const APIFY_INSTAGRAM_ACTOR    = "instaprism/instagram-media-downloader"
const APIFY_ALL_SOCIAL_ACTOR   = "wilcode/all-social-media-video-downloader"

const MAX_CONCURRENT = 5
const TG_MAX_MB      = 49
const MAX_DOWNLOAD_MB = 500
const POLL_INTERVAL = 2000
const MAX_POLL_ATTEMPTS = 30

// These constants are used by commands/download.js
const STATUS_EDIT_1 = 180000   // 3 minutes
const STATUS_EDIT_2 = 360000   // 6 minutes

if (!fs.existsSync(DL_DIR)) fs.mkdirSync(DL_DIR, { recursive: true })

// ─────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────
function getFileSizeMB(fp) {
  try { return fs.statSync(fp).size / (1024 * 1024) } catch { return 0 }
}
function cleanupFile(fp) {
  try { if (fp && fs.existsSync(fp)) fs.unlinkSync(fp) } catch {}
}
function sanitiseFilename(name = "") {
  return name.replace(/[/\\?%*:|"<>\r\n]/g, "_").replace(/\s+/g, " ").trim().slice(0, 180) || `file_${Date.now()}`
}
function extractYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─────────────────────────────────────────────────────────────
// HTTP DOWNLOADER
// ─────────────────────────────────────────────────────────────
async function downloadHTTP(url, dest, opts = {}) {
  const axios = require("axios")
  const { expectedType = "binary", maxSizeMB = MAX_DOWNLOAD_MB, headers = {}, signal } = opts
  const response = await axios({
    method: "get", url, responseType: "stream",
    timeout: 300_000, maxRedirects: 10,
    maxContentLength: maxSizeMB * 1024 * 1024, signal,
    headers: { "User-Agent": "Mozilla/5.0", ...headers }
  })
  const writer = fs.createWriteStream(dest)
  let downloaded = 0
  const maxBytes = maxSizeMB * 1024 * 1024
  response.data.on("data", chunk => {
    downloaded += chunk.length
    if (downloaded > maxBytes) { response.data.destroy(); writer.destroy(); throw new Error(`Exceeded ${maxSizeMB} MB`) }
  })
  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(dest))
    writer.on("error", reject)
    response.data.on("error", reject)
    if (signal) signal.addEventListener("abort", () => { writer.destroy(); reject(new Error("Aborted")) })
  })
}

// ─────────────────────────────────────────────────────────────
// LOADER.TO API – WORKING YOUTUBE DOWNLOADER (FREE, NO KEY)
// ─────────────────────────────────────────────────────────────
async function loaderToDownload(url, audioOnly = false, signal) {
  const axios = require("axios")
  const format = audioOnly ? "mp3" : "mp4"
  const initRes = await axios.get(`https://loader.to/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}`, {
    timeout: 30000, signal
  })
  const data = initRes.data
  if (!data.success) throw new Error(`loader.to error: ${data.message || "Unknown"}`)
  const id = data.id
  const progressUrl = data.progress_url
  let attempts = 0
  while (attempts < MAX_POLL_ATTEMPTS) {
    await sleep(POLL_INTERVAL)
    const pollRes = await axios.get(progressUrl, { timeout: 15000, signal })
    const pollData = pollRes.data
    if (pollData.success && pollData.download_url) {
      const finalUrl = pollData.download_url
      const title = sanitiseFilename(data.title || `yt_${Date.now()}`)
      const ext = audioOnly ? ".mp3" : ".mp4"
      const dest = path.join(DL_DIR, `${title}_${extractYouTubeId(url) || Date.now()}${ext}`)
      await downloadHTTP(finalUrl, dest, { expectedType: audioOnly ? "audio" : "video", signal })
      return [dest]
    }
    attempts++
    if (pollData.status && pollData.status.includes("error")) throw new Error(pollData.status)
  }
  throw new Error("loader.to polling timed out")
}

// ─────────────────────────────────────────────────────────────
// APIFY HELPERS
// ─────────────────────────────────────────────────────────────
async function apifyRunSync(actorId, input, signal) {
  if (!APIFY_TOKEN) throw new Error("Apify token not set")
  const axios = require("axios")
  const runRes = await axios.post(`https://api.apify.com/v2/acts/${actorId}/runs`, input, {
    params: { token: APIFY_TOKEN }, timeout: 30000, signal
  })
  const runId = runRes.data?.data?.id
  if (!runId) throw new Error("Could not start Apify actor run")
  const datasetId = runRes.data?.data?.defaultDatasetId
  const buildSecs = runRes.data?.data?.options?.buildWaitSecs || 60
  await sleep(Math.min(buildSecs, 10) * 1000)
  const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items`
  const startTime = Date.now()
  while (Date.now() - startTime < 120000) {
    if (signal?.aborted) throw new Error("Polling aborted")
    try {
      const poll = await axios.get(datasetUrl, { params: { token: APIFY_TOKEN, clean: true }, timeout: 15000, signal })
      if (Array.isArray(poll.data) && poll.data.length > 0) return poll.data
    } catch {}
    await sleep(5000)
  }
  throw new Error("Apify dataset polling timed out")
}

async function apifyYouTubeDownload(url, audioOnly = false, signal) {
  const items = await apifyRunSync(APIFY_YOUTUBE_ACTOR, {
    urls: [url], downloadVideo: !audioOnly, downloadAudio: audioOnly, quality: audioOnly ? "best" : "1080"
  }, signal)
  if (!items.length) throw new Error("No items")
  const item = items[0]
  if (!item.success) throw new Error(`Apify error: ${item.error}`)
  const dlUrl = audioOnly ? item.audioUrl : item.videoUrl
  if (!dlUrl) throw new Error("No download URL")
  const title = sanitiseFilename(item.title || `yt_${Date.now()}`)
  const ext = audioOnly ? ".mp3" : ".mp4"
  const dest = path.join(DL_DIR, `${title}_${extractYouTubeId(url) || Date.now()}${ext}`)
  await downloadHTTP(dlUrl, dest, { expectedType: audioOnly ? "audio" : "video", signal })
  return [dest]
}

async function apifyTikTokDownload(url, audioOnly = false, signal) {
  const items = await apifyRunSync(APIFY_TIKTOK_ACTOR, { urls: [url], downloadVideo: true, downloadAudio: audioOnly }, signal)
  if (!items.length) throw new Error("No items")
  const item = items[0]
  const dlUrl = audioOnly ? item.audioUrl : item.videoUrl
  if (!dlUrl) throw new Error("No download URL")
  const title = sanitiseFilename(item.title || "tiktok")
  const ext = audioOnly ? ".mp3" : ".mp4"
  const dest = path.join(DL_DIR, `${title}_${Date.now()}${ext}`)
  await downloadHTTP(dlUrl, dest, { expectedType: audioOnly ? "audio" : "video", signal })
  if (audioOnly && !dest.endsWith(".mp3")) {
    const mp3Dest = dest.replace(/\.[^.]+$/, ".mp3")
    await ffmpegConvert(dest, mp3Dest, ["-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k"])
    cleanupFile(dest)
    return [mp3Dest]
  }
  return [dest]
}

async function apifyInstagramDownload(url, signal) {
  const items = await apifyRunSync(APIFY_INSTAGRAM_ACTOR, { urls: [url], includeMetadata: true }, signal)
  if (!items.length) throw new Error("No items")
  const files = []
  let i = 0
  for (const item of items) {
    const mediaUrls = item.mediaUrls || item.urls || (item.videoUrl ? [item.videoUrl] : [])
    for (const mediaUrl of mediaUrls) {
      i++
      const ext = mediaUrl.includes(".mp4") ? ".mp4" : ".jpg"
      const dest = path.join(DL_DIR, `ig_${Date.now()}_${i}${ext}`)
      await downloadHTTP(mediaUrl, dest, { signal })
      files.push(dest)
    }
  }
  if (!files.length) throw new Error("No media")
  return files
}

async function apifyAllInOneDownload(url, audioOnly = false, signal) {
  const items = await apifyRunSync(APIFY_ALL_SOCIAL_ACTOR, { urls: [url], includeMetadata: true }, signal)
  if (!items.length) throw new Error("No items")
  const item = items[0]
  if (!item.success) throw new Error(`Apify error: ${item.error}`)
  const dlUrl = audioOnly ? (item.audioUrl || item.video_url) : (item.video_url || item.downloadUrl)
  if (!dlUrl) throw new Error("No download URL")
  const title = sanitiseFilename(item.title || `media_${Date.now()}`)
  const ext = audioOnly ? ".mp3" : ".mp4"
  const dest = path.join(DL_DIR, `${title}.${ext}`)
  await downloadHTTP(dlUrl, dest, { expectedType: audioOnly ? "audio" : "video", signal })
  if (audioOnly && !dest.endsWith(".mp3")) {
    const mp3Dest = dest.replace(/\.[^.]+$/, ".mp3")
    await ffmpegConvert(dest, mp3Dest, ["-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k"])
    cleanupFile(dest)
    return [mp3Dest]
  }
  return [dest]
}

// ─────────────────────────────────────────────────────────────
// TIKWM API (TikTok fallback)
// ─────────────────────────────────────────────────────────────
async function tikwmDownload(url, audioOnly = false, signal) {
  const axios = require("axios")
  const resolved = await resolveRedirect(url)
  const form = new URLSearchParams()
  form.append("url", resolved)
  form.append("hd", "1")
  const res = await axios.post(`${TIKWM_API}/api/`, form.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0", "Referer": "https://www.tikwm.com/" },
    timeout: 30000, signal
  })
  const d = res.data
  if (!d || d.code !== 0) throw new Error(`TikWM error: ${d?.msg || "Unknown"}`)
  const data = d.data
  const title = sanitiseFilename(data.title || "tiktok")
  const videoId = data.id || Date.now()
  if (Array.isArray(data.images) && data.images.length) {
    const files = []
    for (let i = 0; i < data.images.length; i++) {
      const ext = data.images[i].includes(".webp") ? ".webp" : ".jpg"
      const dest = path.join(DL_DIR, `tikwm_${videoId}_${i+1}.${ext}`)
      await downloadHTTP(data.images[i], dest, { headers: { Referer: "https://www.tikwm.com/" }, signal })
      files.push(dest)
    }
    if (audioOnly && data.music) {
      const musicUrl = typeof data.music === "string" ? data.music : data.music?.url
      if (musicUrl) {
        const adest = path.join(DL_DIR, `tikwm_${videoId}_audio.mp3`)
        await downloadHTTP(musicUrl, adest, { headers: { Referer: "https://www.tikwm.com/" }, signal })
        files.push(adest)
      }
    }
    return files
  }
  if (audioOnly) {
    const musicUrl = typeof data.music === "string" ? data.music : data.music?.url
    if (!musicUrl) throw new Error("No audio URL")
    const adest = path.join(DL_DIR, `${title}_audio.mp3`)
    await downloadHTTP(musicUrl, adest, { headers: { Referer: "https://www.tikwm.com/" }, signal })
    return [adest]
  }
  const candidates = [{ url: data.hdplay, label: "HD" }, { url: data.play, label: "SD" }, { url: data.wmplay, label: "Watermarked" }].filter(c => c.url)
  for (const { url: videoUrl } of candidates) {
    try {
      const dest = path.join(DL_DIR, `${title}_${videoId}.mp4`)
      await downloadHTTP(videoUrl, dest, { expectedType: "video", headers: { Referer: "https://www.tikwm.com/" }, signal })
      return [dest]
    } catch (err) { continue }
  }
  throw new Error("All video qualities failed")
}

// ─────────────────────────────────────────────────────────────
// COBALT API (universal fallback)
// ─────────────────────────────────────────────────────────────
async function cobaltDownload(url, audioOnly = false, signal) {
  if (!COBALT_API) throw new Error("Cobalt not configured")
  const axios = require("axios")
  const body = { url, videoQuality: "1080", audioFormat: audioOnly ? "mp3" : "best", downloadMode: audioOnly ? "audio" : "auto", removeTikTokWatermark: true }
  const res = await axios.post(`${COBALT_API}/`, body, { headers: { "Content-Type": "application/json" }, timeout: 30000, signal })
  const d = res.data
  if (d.status === "error") throw new Error(`Cobalt error: ${d.error?.code || "unknown"}`)
  const files = []
  if (d.status === "redirect" || d.status === "tunnel") {
    const dest = path.join(DL_DIR, sanitiseFilename(d.filename || `cobalt_${Date.now()}.mp4`))
    await downloadHTTP(d.url, dest, { signal })
    files.push(dest)
  } else if (d.status === "picker") {
    for (const item of d.picker) {
      const dest = path.join(DL_DIR, sanitiseFilename(item.filename || `cobalt_${Date.now()}.mp4`))
      await downloadHTTP(item.url, dest, { signal })
      files.push(dest)
    }
  } else throw new Error(`Unexpected status: ${d.status}`)
  return files
}

// ─────────────────────────────────────────────────────────────
// YOUTUBEI.JS (last resort for YouTube)
// ─────────────────────────────────────────────────────────────
let _youtubei = null
async function getYoutubei() {
  if (_youtubei) return _youtubei
  const { Innertube, UniversalCache } = require("youtubei.js")
  _youtubei = await Innertube.create({ cache: new UniversalCache(true), generate_session_locally: true, retrieve_player: true })
  return _youtubei
}
async function youtubeiDownload(url, opts = {}) {
  const { audioOnly = false, quality = "best", signal } = opts
  const videoId = extractYouTubeId(url)
  if (!videoId) throw new Error("Invalid YouTube URL")
  const yt = await getYoutubei()
  const info = await yt.getInfo(videoId)
  const title = sanitiseFilename(info.basic_info?.title || `yt_${videoId}`)
  const downloadOpts = audioOnly ? { type: "audio", quality: "best" } : { type: "video", quality: quality === "best" ? "best" : quality, format: "mp4" }
  const ext = audioOnly ? ".mp3" : ".mp4"
  const dest = path.join(DL_DIR, `${title}_${videoId}.${ext}`)
  const stream = await info.download(downloadOpts)
  const nodeStream = Readable.fromWeb(stream)
  await pipeline(nodeStream, fs.createWriteStream(dest))
  if (audioOnly && !dest.endsWith(".mp3")) {
    const mp3Dest = dest.replace(/\.[^.]+$/, ".mp3")
    await ffmpegConvert(dest, mp3Dest, ["-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k"])
    cleanupFile(dest)
    return [mp3Dest]
  }
  return [dest]
}

// ─────────────────────────────────────────────────────────────
// FFMPEG (audio conversion)
// ─────────────────────────────────────────────────────────────
function ffmpegConvert(src, dest, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const args = ["-y", "-i", src, ...extraArgs, dest]
    const proc = spawn("ffmpeg", args)
    let stderr = ""
    proc.stderr.on("data", d => stderr += d.toString())
    proc.on("close", code => { if (code === 0 && fs.existsSync(dest)) resolve(dest); else reject(new Error(stderr.slice(-200))) })
    proc.on("error", reject)
  })
}

// ─────────────────────────────────────────────────────────────
// PLATFORM DETECTION & HELPERS
// ─────────────────────────────────────────────────────────────
function detectPlatform(url) {
  const patterns = [
    [/youtube\.com|youtu\.be/i, "youtube"],
    [/tiktok\.com|vm\.tiktok\.com/i, "tiktok"],
    [/instagram\.com/i, "instagram"],
    [/twitter\.com|x\.com/i, "twitter"],
    [/facebook\.com|fb\.watch/i, "facebook"],
    [/soundcloud\.com/i, "soundcloud"],
  ]
  for (const [re, name] of patterns) if (re.test(url)) return name
  return "generic"
}
async function resolveRedirect(url) {
  return new Promise((resolve) => {
    try { https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, res => { resolve(res.headers.location || url) }).on("error", () => resolve(url)) }
    catch { resolve(url) }
  })
}
async function ensureUnderLimit(fp) { if (getFileSizeMB(fp) <= TG_MAX_MB) return fp; throw new Error(`File too large (${getFileSizeMB(fp).toFixed(1)} MB)`) }
function guessMime(fp) { const ext = path.extname(fp).toLowerCase(); return { ".mp4":"video",".mp3":"audio",".jpg":"photo",".png":"photo",".gif":"animation" }[ext] || "document" }

// ─────────────────────────────────────────────────────────────
// SMART DOWNLOADER
// ─────────────────────────────────────────────────────────────
async function smartDownload(url, opts = {}) {
  const { audioOnly = false, quality = "best", onProgress = null } = opts
  const platform = detectPlatform(url)
  const signal = new AbortController().signal

  // YouTube – use loader.to first (GET method, working)
  if (platform === "youtube") {
    try { return await loaderToDownload(url, audioOnly, signal) }
    catch (e) { console.error(`[DL] loader.to failed: ${e.message}`) }
    if (APIFY_TOKEN) {
      try { return await apifyYouTubeDownload(url, audioOnly, signal) }
      catch (e) { console.error(`[DL] Apify YouTube failed: ${e.message}`) }
    }
    try { return await youtubeiDownload(url, { audioOnly, quality, signal }) }
    catch (e) { console.error(`[DL] youtubei.js failed: ${e.message}`) }
    if (COBALT_API) {
      try { return await cobaltDownload(url, audioOnly, signal) }
      catch (e) { console.error(`[DL] Cobalt failed: ${e.message}`) }
    }
    throw new Error("All YouTube methods failed.")
  }

  // TikTok
  if (platform === "tiktok") {
    try { return await tikwmDownload(url, audioOnly, signal) }
    catch (e) { console.error(`[DL] TikWM failed: ${e.message}`) }
    if (APIFY_TOKEN) {
      try { return await apifyTikTokDownload(url, audioOnly, signal) }
      catch (e) { console.error(`[DL] Apify TikTok failed: ${e.message}`) }
    }
    if (COBALT_API) {
      try { return await cobaltDownload(url, audioOnly, signal) }
      catch (e) { console.error(`[DL] Cobalt failed: ${e.message}`) }
    }
    throw new Error("All TikTok methods failed.")
  }

  // Instagram
  if (platform === "instagram") {
    if (APIFY_TOKEN) {
      try { return await apifyInstagramDownload(url, signal) }
      catch (e) { console.error(`[DL] Apify Instagram failed: ${e.message}`) }
    }
    if (COBALT_API) {
      try { return await cobaltDownload(url, audioOnly, signal) }
      catch (e) { console.error(`[DL] Cobalt failed: ${e.message}`) }
    }
    throw new Error("Instagram download failed.")
  }

  // Twitter / X
  if (platform === "twitter") {
    if (APIFY_TOKEN) {
      try { return await apifyAllInOneDownload(url, audioOnly, signal) }
      catch (e) { console.error(`[DL] Apify Twitter failed: ${e.message}`) }
    }
    if (COBALT_API) {
      try { return await cobaltDownload(url, audioOnly, signal) }
      catch (e) { console.error(`[DL] Cobalt failed: ${e.message}`) }
    }
    throw new Error("Twitter download failed.")
  }

  // Facebook
  if (platform === "facebook") {
    if (APIFY_TOKEN) {
      try { return await apifyAllInOneDownload(url, audioOnly, signal) }
      catch (e) { console.error(`[DL] Apify Facebook failed: ${e.message}`) }
    }
    if (COBALT_API) {
      try { return await cobaltDownload(url, audioOnly, signal) }
      catch (e) { console.error(`[DL] Cobalt failed: ${e.message}`) }
    }
    throw new Error("Facebook download failed.")
  }

  // Generic fallback
  if (APIFY_TOKEN) {
    try { return await apifyAllInOneDownload(url, audioOnly, signal) }
    catch (e) { console.error(`[DL] Apify universal failed: ${e.message}`) }
  }
  if (COBALT_API) {
    try { return await cobaltDownload(url, audioOnly, signal) }
    catch (e) { console.error(`[DL] Cobalt failed: ${e.message}`) }
  }
  throw new Error(`No download method available for ${platform}.`)
}

async function bulkDownload(urls, opts = {}) {
  const results = [], errors = []
  const queue = [...urls]
  const active = new Set()
  await new Promise(resolve => {
    const schedule = () => {
      while (active.size < MAX_CONCURRENT && queue.length) {
        const url = queue.shift()
        const task = smartDownload(url, opts)
          .then(files => results.push({ url, files }))
          .catch(err => errors.push({ url, error: err.message }))
          .finally(() => { active.delete(task); schedule() })
        active.add(task)
      }
      if (!active.size && !queue.length) resolve()
    }
    schedule()
  })
  return { results, errors }
}

function extractURLs(text) { return [...new Set((text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/gi) || []))] }

module.exports = {
  smartDownload, bulkDownload, extractURLs, detectPlatform, ensureUnderLimit,
  guessMime, getFileSizeMB, cleanupFile, DL_DIR, TG_MAX_MB, STATUS_EDIT_1, STATUS_EDIT_2,
  loaderToDownload, apifyYouTubeDownload, apifyTikTokDownload, apifyInstagramDownload,
  apifyAllInOneDownload, tikwmDownload, cobaltDownload, youtubeiDownload
}