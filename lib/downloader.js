// lib/downloader.js – MAUREONIX FINAL DOWNLOADER
// TikTok via TikWM, YouTube via youtubei.js (manual) + ytdl-core, fallbacks to Cobalt
"use strict"

const { spawn } = require("child_process")
const path = require("path")
const fs = require("fs")
const os = require("os")
const https = require("https")
const { Readable } = require("stream")
const { pipeline } = require("stream/promises")

// ─────────────────────────────────────────────────────────────
// CONFIG (reads from process.env – set in config.js)
// ─────────────────────────────────────────────────────────────
const DL_DIR         = process.env.DL_DIR          || path.join(os.tmpdir(), "maureonix_dl")
const FFMPEG_BIN     = process.env.FFMPEG_BIN      || "ffmpeg"
const COBALT_API     = process.env.COBALT_API      || "https://api.cobalt.tools"
// No Apify needed; no RapidAPI needed

const MAX_CONCURRENT = 5
const TG_MAX_MB      = 49
const MAX_DOWNLOAD_MB = 500
const POLL_INTERVAL = 2000
const MAX_POLL_ATTEMPTS = 30

// Used by commands/download.js
const STATUS_EDIT_1 = 180000
const STATUS_EDIT_2 = 360000

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
// HTTP DOWNLOADER (with size guard & abort support)
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
        if (downloaded > maxBytes) {
            response.data.destroy()
            writer.destroy()
            throw new Error(`Exceeded ${maxSizeMB} MB`)
        }
    })
    return new Promise((resolve, reject) => {
        writer.on("finish", () => resolve(dest))
        writer.on("error", reject)
        response.data.on("error", reject)
        if (signal) signal.addEventListener("abort", () => { writer.destroy(); reject(new Error("Aborted")) })
    })
}

// ─────────────────────────────────────────────────────────────
//  TIKTOK – TikWM (most reliable, no key)
// ─────────────────────────────────────────────────────────────
async function tikwmDownload(url, audioOnly = false, signal) {
    const axios = require("axios")
    // Resolve short links to get the real URL
    let resolved = url
    try {
        const head = await axios.head(url, { timeout: 10000, signal })
        resolved = head.request.res.responseUrl || url
    } catch { /* keep original */ }

    const form = new URLSearchParams()
    form.append("url", resolved)
    form.append("hd", "1")

    const res = await axios.post(`https://www.tikwm.com/api/`, form.toString(), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://www.tikwm.com/",
        },
        timeout: 30000,
        signal,
    })

    const data = res.data
    if (!data || data.code !== 0) throw new Error(`TikWM error: ${data?.msg || "Unknown"}`)
    const videoData = data.data
    const title = sanitiseFilename(videoData.title || "tiktok")
    const videoId = videoData.id || Date.now()

    // Slideshow (multiple images)
    if (Array.isArray(videoData.images) && videoData.images.length) {
        const files = []
        for (let i = 0; i < videoData.images.length; i++) {
            const ext = videoData.images[i].includes(".webp") ? ".webp" : ".jpg"
            const dest = path.join(DL_DIR, `tikwm_${videoId}_${i+1}.${ext}`)
            await downloadHTTP(videoData.images[i], dest, { headers: { Referer: "https://www.tikwm.com/" }, signal })
            files.push(dest)
        }
        if (audioOnly && videoData.music) {
            const musicUrl = typeof videoData.music === "string" ? videoData.music : videoData.music?.url
            if (musicUrl) {
                const adest = path.join(DL_DIR, `tikwm_${videoId}_audio.mp3`)
                await downloadHTTP(musicUrl, adest, { headers: { Referer: "https://www.tikwm.com/" }, signal })
                files.push(adest)
            }
        }
        return files
    }

    // Audio only
    if (audioOnly) {
        const musicUrl = typeof videoData.music === "string" ? videoData.music : videoData.music?.url
        if (!musicUrl) throw new Error("No audio URL")
        const adest = path.join(DL_DIR, `${title}_audio.mp3`)
        await downloadHTTP(musicUrl, adest, { headers: { Referer: "https://www.tikwm.com/" }, signal })
        return [adest]
    }

    // Video – try HD, then SD, then watermark
    const candidates = [
        { url: videoData.hdplay, label: "HD" },
        { url: videoData.play, label: "SD" },
        { url: videoData.wmplay, label: "Watermarked" }
    ].filter(c => c.url)

    for (const { url: videoUrl } of candidates) {
        try {
            const dest = path.join(DL_DIR, `${title}_${videoId}.mp4`)
            await downloadHTTP(videoUrl, dest, {
                expectedType: "video",
                headers: { Referer: "https://www.tikwm.com/", Origin: "https://www.tikwm.com" },
                signal,
            })
            return [dest]
        } catch (err) {
            // try next candidate
        }
    }
    throw new Error("All TikTok video qualities failed")
}

// ─────────────────────────────────────────────────────────────
//  YOUTUBE – Manual extraction from youtubei.js
// ─────────────────────────────────────────────────────────────
let _youtubei = null
async function getYoutubei() {
    if (_youtubei) return _youtubei
    const { Innertube, UniversalCache } = require("youtubei.js")
    _youtubei = await Innertube.create({ cache: new UniversalCache(true), generate_session_locally: true, retrieve_player: true })
    return _youtubei
}
async function youtubeiManualDownload(url, opts = {}) {
    const { audioOnly = false, quality = "best", signal } = opts
    const videoId = extractYouTubeId(url)
    if (!videoId) throw new Error("Invalid YouTube URL")

    const yt = await getYoutubei()
    const info = await yt.getInfo(videoId)
    const formats = info.streamingData?.formats || []
    const adaptiveFormats = info.streamingData?.adaptiveFormats || []
    const allFormats = [...formats, ...adaptiveFormats]

    let selected
    if (audioOnly) {
        selected = allFormats.find(f => f.hasAudio && !f.hasVideo && f.audioBitrate)
        if (!selected) selected = allFormats.find(f => f.hasAudio)
    } else {
        const desiredHeight = quality === "best" ? 1080 : parseInt(quality)
        selected = allFormats.find(f => f.hasVideo && f.height >= desiredHeight)
        if (!selected) selected = allFormats.find(f => f.hasVideo)
    }
    if (!selected || !selected.url) throw new Error("No downloadable URL found")

    const title = sanitiseFilename(info.videoDetails?.title || `yt_${videoId}`)
    const ext = audioOnly ? ".mp3" : ".mp4"
    const dest = path.join(DL_DIR, `${title}_${videoId}.${ext}`)

    await downloadHTTP(selected.url, dest, { expectedType: audioOnly ? "audio" : "video", signal })

    // Convert to MP3 if needed (selected may be m4a/opus)
    if (audioOnly && !dest.endsWith(".mp3")) {
        const mp3Dest = dest.replace(/\.[^.]+$/, ".mp3")
        await ffmpegConvert(dest, mp3Dest, ["-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k"])
        cleanupFile(dest)
        return [mp3Dest]
    }
    return [dest]
}

// ─────────────────────────────────────────────────────────────
//  YOUTUBE – Fallback using @distube/ytdl-core
// ─────────────────────────────────────────────────────────────
let _ytdl = null
function getYtdl() {
    if (!_ytdl) _ytdl = require('@distube/ytdl-core')
    return _ytdl
}
async function ytdlCoreDownload(url, opts = {}) {
    const { audioOnly = false, quality = "best", signal } = opts
    const ytdl = getYtdl()
    const info = await ytdl.getInfo(url, { requestOptions: { signal } })
    const format = ytdl.chooseFormat(info.formats, { quality: audioOnly ? 'lowestaudio' : quality })
    if (!format) throw new Error("No suitable format")
    const title = sanitiseFilename(info.videoDetails.title)
    const ext = audioOnly ? ".mp3" : ".mp4"
    const dest = path.join(DL_DIR, `${title}_${Date.now()}.${ext}`)
    const stream = ytdl(url, { format, requestOptions: { signal } })
    const writer = fs.createWriteStream(dest)
    await pipeline(stream, writer)
    if (audioOnly && !dest.endsWith(".mp3")) {
        const mp3Dest = dest.replace(/\.[^.]+$/, ".mp3")
        await ffmpegConvert(dest, mp3Dest, ["-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k"])
        cleanupFile(dest)
        return [mp3Dest]
    }
    return [dest]
}

// ─────────────────────────────────────────────────────────────
//  COBALT – Universal fallback (supports many platforms)
// ─────────────────────────────────────────────────────────────
async function cobaltDownload(url, audioOnly = false, signal) {
    if (!COBALT_API) throw new Error("Cobalt not configured")
    const axios = require("axios")
    const body = {
        url,
        videoQuality: "1080",
        audioFormat: audioOnly ? "mp3" : "best",
        downloadMode: audioOnly ? "audio" : "auto",
        removeTikTokWatermark: true,
    }
    const res = await axios.post(`${COBALT_API}/`, body, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
        signal,
    })
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
    } else throw new Error(`Unexpected Cobalt status: ${d.status}`)
    return files
}

// ─────────────────────────────────────────────────────────────
//  FFMPEG (audio conversion)
// ─────────────────────────────────────────────────────────────
function ffmpegConvert(src, dest, extraArgs = []) {
    return new Promise((resolve, reject) => {
        const args = ["-y", "-i", src, ...extraArgs, dest]
        const proc = spawn("ffmpeg", args)
        let stderr = ""
        proc.stderr.on("data", d => stderr += d.toString())
        proc.on("close", code => {
            if (code === 0 && fs.existsSync(dest)) resolve(dest)
            else reject(new Error(stderr.slice(-200)))
        })
        proc.on("error", reject)
    })
}

// ─────────────────────────────────────────────────────────────
//  PLATFORM DETECTION & HELPERS
// ─────────────────────────────────────────────────────────────
function detectPlatform(url) {
    const patterns = [
        [/youtube\.com|youtu\.be/i, "youtube"],
        [/tiktok\.com|vm\.tiktok\.com/i, "tiktok"],
        [/instagram\.com/i, "instagram"],
        [/twitter\.com|x\.com/i, "twitter"],
        [/facebook\.com|fb\.watch/i, "facebook"],
        [/soundcloud\.com/i, "soundcloud"],
        [/mediafire\.com/i, "mediafire"],
        [/drive\.google\.com/i, "gdrive"],
    ]
    for (const [re, name] of patterns) if (re.test(url)) return name
    return "generic"
}
async function resolveRedirect(url) {
    return new Promise((resolve) => {
        try {
            https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, res => {
                resolve(res.headers.location || url)
            }).on("error", () => resolve(url))
        } catch { resolve(url) }
    })
}
async function ensureUnderLimit(fp) {
    if (getFileSizeMB(fp) <= TG_MAX_MB) return fp
    throw new Error(`File too large (${getFileSizeMB(fp).toFixed(1)} MB)`)
}
function guessMime(fp) {
    const ext = path.extname(fp).toLowerCase()
    return {
        ".mp4": "video", ".mp3": "audio", ".jpg": "photo", ".png": "photo",
        ".gif": "animation"
    }[ext] || "document"
}

// ─────────────────────────────────────────────────────────────
//  SMART DOWNLOADER – Routes to correct method
// ─────────────────────────────────────────────────────────────
async function smartDownload(url, opts = {}) {
    const { audioOnly = false, quality = "best", onProgress = null } = opts
    const platform = detectPlatform(url)
    const signal = new AbortController().signal

    // YouTube
    if (platform === "youtube") {
        // Try manual extraction from youtubei.js first
        try {
            return await youtubeiManualDownload(url, { audioOnly, quality, signal })
        } catch (e) {
            console.error(`[DL] youtubei manual failed: ${e.message}`)
        }
        // Fallback to ytdl-core
        try {
            return await ytdlCoreDownload(url, { audioOnly, quality, signal })
        } catch (e) {
            console.error(`[DL] ytdl-core failed: ${e.message}`)
        }
        // Ultimate fallback: Cobalt
        try {
            return await cobaltDownload(url, audioOnly, signal)
        } catch (e) {
            console.error(`[DL] Cobalt failed: ${e.message}`)
        }
        throw new Error("All YouTube download methods failed.")
    }

    // TikTok
    if (platform === "tiktok") {
        try {
            return await tikwmDownload(url, audioOnly, signal)
        } catch (e) {
            console.error(`[DL] TikWM failed: ${e.message}`)
            // Fallback: Cobalt
            try {
                return await cobaltDownload(url, audioOnly, signal)
            } catch (cErr) {
                console.error(`[DL] Cobalt fallback failed: ${cErr.message}`)
            }
            throw new Error(`TikTok download failed: ${e.message}`)
        }
    }

    // Instagram (not implemented with free API – stub)
    if (platform === "instagram") {
        throw new Error("Instagram download not implemented in this version. Use Cobalt if configured.")
    }

    // Twitter
    if (platform === "twitter") {
        throw new Error("Twitter download not implemented in this version. Use Cobalt if configured.")
    }

    // Facebook
    if (platform === "facebook") {
        throw new Error("Facebook download not implemented in this version. Use Cobalt if configured.")
    }

    // Generic fallback – try Cobalt
    if (COBALT_API) {
        try {
            return await cobaltDownload(url, audioOnly, signal)
        } catch (e) {
            console.error(`[DL] Cobalt generic failed: ${e.message}`)
        }
    }
    throw new Error(`No download method available for ${platform}.`)
}

// ─────────────────────────────────────────────────────────────
//  BULK DOWNLOADER
// ─────────────────────────────────────────────────────────────
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

function extractURLs(text) {
    return [...new Set((text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/gi) || []))]
}

// ─────────────────────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
    smartDownload,
    bulkDownload,
    extractURLs,
    detectPlatform,
    ensureUnderLimit,
    guessMime,
    getFileSizeMB,
    cleanupFile,
    DL_DIR,
    TG_MAX_MB,
    STATUS_EDIT_1,
    STATUS_EDIT_2,
    // for manual use
    tikwmDownload,
    youtubeiManualDownload,
    ytdlCoreDownload,
    cobaltDownload,
}