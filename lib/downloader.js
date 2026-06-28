// ═══════════════════════════════════════════════════════════════
//  lib/downloader.js — MAUREONIX PRODUCTION DOWNLOADER v2
// ═══════════════════════════════════════════════════════════════
//  FIXES APPLIED:
//   → yt-dlp via system Python 3.11 (nixpacks.toml fix)
//   → Self-hosted Cobalt API as Tier 2
//   → Rotating TikWM + direct APIs as Tier 3
//   → Playwright as absolute last resort
//   → ZERO reliance on ytdl-core, youtube-dl-exec, or dead Invidious pools
// ═══════════════════════════════════════════════════════════════

"use strict";

const fs   = require("fs");
const path = require("path");
const os   = require("os");
const https = require("https");
const { spawn } = require("child_process");
const { pipeline } = require("stream/promises");

// ─────────────────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────────────────
let CONFIG = {};
try { CONFIG = require("../config"); } catch { /* silent */ }
const getConf = (k, d) => CONFIG[k] ?? process.env[k] ?? d;

const DL_DIR           = getConf("DL_DIR", path.join(os.tmpdir(), "maureonix_dl"));
const FFMPEG_BIN       = getConf("FFMPEG_BIN", "ffmpeg");
const COBALT_API       = getConf("COBALT_API", ""); // ← YOUR SELF-HOSTED COBALT URL
const YOUTUBE_API_KEY  = getConf("YOUTUBE_API_KEY", "");
const SPOTIFY_ID       = getConf("SPOTIFY_CLIENT_ID", "");
const SPOTIFY_SECRET   = getConf("SPOTIFY_CLIENT_SECRET", "");
const MEDIAFIRE_APP_ID = getConf("MEDIAFIRE_APP_ID", "");
const VIMEO_TOKEN      = getConf("VIMEO_ACCESS_TOKEN", "");

const TG_MAX_MB        = 49;
const MAX_DOWNLOAD_MB  = 500;
const MAX_CONCURRENT   = 5;
const STATUS_EDIT_1    = 180000;
const STATUS_EDIT_2    = 360000;

if (!fs.existsSync(DL_DIR)) fs.mkdirSync(DL_DIR, { recursive: true });

// ─────────────────────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────────────────────
function getFileSizeMB(fp) {
  try { return fs.statSync(fp).size / (1024 * 1024); } catch { return 0; }
}
function cleanupFile(fp) {
  try { if (fp && fs.existsSync(fp)) fs.unlinkSync(fp); } catch {}
}
function sanitiseFilename(name = "") {
  return name.replace(/[/\\?%*:|"<>\r\n]/g, "_").replace(/\s+/g, " ").trim().slice(0, 180)
         || `file_${Date.now()}`;
}
function extractYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function detectPlatform(url) {
  const p = [
    [/youtube\.com|youtu\.be/i, "youtube"],
    [/tiktok\.com|vm\.tiktok\.com/i, "tiktok"],
    [/instagram\.com/i, "instagram"],
    [/twitter\.com|x\.com/i, "twitter"],
    [/facebook\.com|fb\.watch/i, "facebook"],
    [/vimeo\.com/i, "vimeo"],
    [/reddit\.com|redd\.it/i, "reddit"],
    [/spotify\.com/i, "spotify"],
    [/mediafire\.com/i, "mediafire"],
    [/soundcloud\.com/i, "soundcloud"],
  ];
  for (const [re, name] of p) if (re.test(url)) return name;
  return "generic";
}
function guessMime(fp) {
  const ext = path.extname(fp).toLowerCase();
  return { ".mp4":"video", ".mp3":"audio", ".m4a":"audio", ".webm":"video",
           ".jpg":"photo", ".jpeg":"photo", ".png":"photo", ".webp":"photo",
           ".gif":"amaureonixtion" }[ext] || "document";
}
async function ensureUnderLimit(fp) {
  if (getFileSizeMB(fp) <= TG_MAX_MB) return fp;
  throw new Error(`File too large (${getFileSizeMB(fp).toFixed(1)} MB)`);
}
function extractURLs(text) {
  return [...new Set((text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/gi) || []))];
}

// ─────────────────────────────────────────────────────────────
//  HTTP HELPERS
// ─────────────────────────────────────────────────────────────
function getAxios() {
  const axios = require("axios");
  return axios;
}
async function downloadHTTP(url, dest, opts = {}) {
  const axios = getAxios();
  const { maxSizeMB = MAX_DOWNLOAD_MB, headers = {}, signal, timeout = 300_000 } = opts;
  const response = await axios({
    method: "get", url, responseType: "stream",
    timeout, maxRedirects: 10,
    maxContentLength: maxSizeMB * 1024 * 1024,
    signal, headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", ...headers }
  });
  const writer = fs.createWriteStream(dest);
  let downloaded = 0;
  const maxBytes = maxSizeMB * 1024 * 1024;
  return new Promise((resolve, reject) => {
    response.data.on("data", chunk => {
      downloaded += chunk.length;
      if (downloaded > maxBytes) {
        response.data.destroy(); writer.destroy();
        reject(new Error(`Exceeded ${maxSizeMB} MB`));
      }
    });
    writer.on("finish", () => resolve(dest));
    writer.on("error", reject);
    response.data.on("error", reject);
    if (signal) signal.addEventListener("abort", () => { writer.destroy(); reject(new Error("Aborted")); });
  });
}

// ─────────────────────────────────────────────────────────────
//  FFMPEG
// ─────────────────────────────────────────────────────────────
function ffmpegConvert(src, dest, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const args = ["-y", "-i", src, ...extraArgs, dest];
    const proc = spawn(FFMPEG_BIN, args);
    let stderr = "";
    proc.stderr.on("data", d => stderr += d.toString());
    proc.on("close", code => {
      if (code === 0 && fs.existsSync(dest)) resolve(dest);
      else reject(new Error(stderr.slice(-200) || `ffmpeg exited ${code}`));
    });
    proc.on("error", reject);
  });
}

// ═════════════════════════════════════════════════════════════
//  TIER 1 — YT-DLP (The King. Covers 1000+ sites.)
// ═════════════════════════════════════════════════════════════

function spawnYtDlp(args) {
  return new Promise((resolve, reject) => {
    // yt-dlp is installed via pip in nixpacks.toml and is in PATH
    const proc = spawn("yt-dlp", args, { timeout: 300_000 });
    let stdout = "", stderr = "";
    proc.stdout.on("data", d => stdout += d.toString());
    proc.stderr.on("data", d => stderr += d.toString());
    proc.on("close", code => {
      if (code !== 0) return reject(new Error(stderr.slice(-300) || `yt-dlp exited ${code}`));
      resolve(stdout);
    });
    proc.on("error", reject);
  });
}

async function ytDlpDownload(url, audioOnly = false, signal) {
  const ext = audioOnly ? "mp3" : "mp4";
  const title = sanitiseFilename(`yt_${Date.now()}`);
  const dest = path.join(DL_DIR, `${title}.${ext}`);

  const args = [
    "--no-check-certificates",
    "--no-warnings",
    "--prefer-free-formats",
    "--add-header", "User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "-o", dest,
    "--max-filesize", `${MAX_DOWNLOAD_MB}M`,
    "--retries", "10",
    "--fragment-retries", "10",
  ];

  if (audioOnly) {
    args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
  } else {
    args.push("-f", "best[filesize<500M]/best");
  }

  args.push(url);

  await spawnYtDlp(args);

  if (!fs.existsSync(dest)) {
    // yt-dlp might have written with a different extension
    const files = fs.readdirSync(DL_DIR).filter(f => f.startsWith(title));
    if (!files.length) throw new Error("yt-dlp failed to write file");
    return [path.join(DL_DIR, files[0])];
  }

  if (audioOnly && !dest.endsWith(".mp3")) {
    const mp3Dest = dest.replace(/\.[^.]+$/, ".mp3");
    await ffmpegConvert(dest, mp3Dest, ["-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k"]);
    cleanupFile(dest);
    return [mp3Dest];
  }

  return [dest];
}

async function ytDlpGetInfo(url) {
  const stdout = await spawnYtDlp([
    "--dump-single-json",
    "--no-check-certificates",
    "--no-warnings",
    url
  ]);
  return JSON.parse(stdout);
}

// ═════════════════════════════════════════════════════════════
//  TIER 2 — SELF-HOSTED COBALT (Your private instance)
// ═════════════════════════════════════════════════════════════
async function cobaltDownload(url, audioOnly = false, signal) {
  if (!COBALT_API) throw new Error("Cobalt not configured");
  const axios = getAxios();
  const body = {
    url,
    videoQuality: "1080",
    audioFormat: audioOnly ? "mp3" : "best",
    downloadMode: audioOnly ? "audio" : "auto",
    removeTikTokWatermark: true,
  };
  const res = await axios.post(`${COBALT_API.replace(/\/$/, "")}/`, body, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    timeout: 30000,
    signal,
  });
  const d = res.data;
  if (d.status === "error") throw new Error(`Cobalt error: ${d.error?.code || "unknown"}`);
  const files = [];
  if (d.status === "redirect" || d.status === "tunnel") {
    const dest = path.join(DL_DIR, sanitiseFilename(d.filename || `cobalt_${Date.now()}.mp4`));
    await downloadHTTP(d.url, dest, { signal });
    files.push(dest);
  } else if (d.status === "picker") {
    for (const item of d.picker || []) {
      const dest = path.join(DL_DIR, sanitiseFilename(item.filename || `cobalt_${Date.now()}.mp4`));
      await downloadHTTP(item.url, dest, { signal });
      files.push(dest);
    }
  } else throw new Error(`Unexpected Cobalt status: ${d.status}`);
  return files;
}

// ═════════════════════════════════════════════════════════════
//  TIER 3 — PLATFORM SPECIFIC DIRECT APIs
// ═════════════════════════════════════════════════════════════

// ─── TikWM (TikTok, free, no key) ───
async function tikwmDownload(url, audioOnly = false, signal) {
  const axios = getAxios();
  let resolved = url;
  try {
    const head = await axios.head(url, { timeout: 10000, signal, maxRedirects: 5 });
    resolved = head.request?.res?.responseUrl || url;
  } catch { /* keep original */ }

  const form = new URLSearchParams();
  form.append("url", resolved);
  form.append("hd", "1");

  const res = await axios.post(`https://www.tikwm.com/api/`, form.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Referer": "https://www.tikwm.com/",
    },
    timeout: 30000,
    signal,
  });

  const data = res.data;
  if (!data || data.code !== 0) throw new Error(`TikWM error: ${data?.msg || "Unknown"}`);
  const vd = data.data;
  const title = sanitiseFilename(vd.title || "tiktok");
  const videoId = vd.id || Date.now();

  // Slideshow
  if (Array.isArray(vd.images) && vd.images.length) {
    const files = [];
    for (let i = 0; i < vd.images.length; i++) {
      const ext = vd.images[i].includes(".webp") ? ".webp" : ".jpg";
      const dest = path.join(DL_DIR, `tikwm_${videoId}_${i+1}.${ext}`);
      await downloadHTTP(vd.images[i], dest, { headers: { Referer: "https://www.tikwm.com/" }, signal });
      files.push(dest);
    }
    if (audioOnly && vd.music) {
      const musicUrl = typeof vd.music === "string" ? vd.music : vd.music?.url;
      if (musicUrl) {
        const adest = path.join(DL_DIR, `tikwm_${videoId}_audio.mp3`);
        await downloadHTTP(musicUrl, adest, { headers: { Referer: "https://www.tikwm.com/" }, signal });
        files.push(adest);
      }
    }
    return files;
  }

  // Audio only
  if (audioOnly) {
    const musicUrl = typeof vd.music === "string" ? vd.music : vd.music?.url;
    if (!musicUrl) throw new Error("No audio URL");
    const adest = path.join(DL_DIR, `${title}_audio.mp3`);
    await downloadHTTP(musicUrl, adest, { headers: { Referer: "https://www.tikwm.com/" }, signal });
    return [adest];
  }

  // Video HD → SD → Watermark
  const candidates = [
    { url: vd.hdplay, label: "HD" },
    { url: vd.play, label: "SD" },
    { url: vd.wmplay, label: "Watermarked" }
  ].filter(c => c.url);

  for (const { url: videoUrl } of candidates) {
    try {
      const dest = path.join(DL_DIR, `${title}_${videoId}.mp4`);
      await downloadHTTP(videoUrl, dest, { headers: { Referer: "https://www.tikwm.com/", Origin: "https://www.tikwm.com" }, signal });
      return [dest];
    } catch { /* try next */ }
  }
  throw new Error("All TikTok qualities failed");
}

// ─── Reddit JSON API ───
async function redditAPIMeta(url) {
  try {
    const axios = getAxios();
    const jsonUrl = url.replace(/\/?$/, ".json");
    const { data } = await axios.get(jsonUrl, {
      headers: { "User-Agent": "MaureonixBot/1.0" },
      timeout: 15000,
    });
    const post = data?.[0]?.data?.children?.[0]?.data;
    if (!post) return null;
    let mediaUrl = null;
    if (post.media?.reddit_video?.fallback_url) mediaUrl = post.media.reddit_video.fallback_url;
    else if (post.url_overridden_by_dest && /\.(mp4|webm|mov)(\?|$)/i.test(post.url_overridden_by_dest)) mediaUrl = post.url_overridden_by_dest;
    return {
      title: post.title,
      subreddit: post.subreddit,
      author: post.author,
      mediaUrl,
      thumbnail: post.thumbnail?.startsWith("http") ? post.thumbnail : null,
      nsfw: post.over_18,
    };
  } catch (e) { console.error(`[T3-Reddit] ${e.message}`); return null; }
}

// ─── Spotify Web API ───
let _spotifyToken = null;
async function spotifyAuth() {
  if (_spotifyToken) return _spotifyToken;
  if (!SPOTIFY_ID || !SPOTIFY_SECRET) return null;
  const axios = getAxios();
  const { data } = await axios.post("https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    { headers: { Authorization: `Basic ${Buffer.from(`${SPOTIFY_ID}:${SPOTIFY_SECRET}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, timeout: 15000 }
  );
  _spotifyToken = data.access_token;
  setTimeout(() => _spotifyToken = null, (data.expires_in - 60) * 1000);
  return _spotifyToken;
}
async function spotifyAPIMeta(url) {
  try {
    const token = await spotifyAuth();
    if (!token) return null;
    const axios = getAxios();
    let endpoint = null;
    const episodeMatch = url.match(/episode\/([a-zA-Z0-9]+)/);
    const trackMatch  = url.match(/track\/([a-zA-Z0-9]+)/);
    if (episodeMatch) endpoint = `https://api.spotify.com/v1/episodes/${episodeMatch[1]}`;
    else if (trackMatch) endpoint = `https://api.spotify.com/v1/tracks/${trackMatch[1]}`;
    else return null;
    const { data } = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000,
    });
    return {
      title: data.name,
      artist: data.artists?.map(a => a.name).join(", ") || data.show?.name,
      duration_ms: data.duration_ms,
      preview_url: data.preview_url,
      image: data.album?.images?.[0]?.url || data.images?.[0]?.url,
      platform: "spotify",
    };
  } catch (e) { console.error(`[T3-Spotify] ${e.message}`); return null; }
}

// ─── MediaFire API ───
async function mediafireAPIMeta(url) {
  if (!MEDIAFIRE_APP_ID) return null;
  const m = url.match(/mediafire\.com\/file\/([a-zA-Z0-9]+)/i);
  if (!m) return null;
  try {
    const axios = getAxios();
    const { data } = await axios.get(`https://www.mediafire.com/api/1.5/file/get_info.json?quick_key=${m[1]}&app_id=${MEDIAFIRE_APP_ID}&response_format=json`, { timeout: 15000 });
    const info = data?.response?.file_info;
    if (!info) return null;
    return {
      title: info.filename,
      size: parseInt(info.size || 0),
      directUrl: info.links?.normal_download,
    };
  } catch (e) { console.error(`[T3-MediaFire] ${e.message}`); return null; }
}

// ═════════════════════════════════════════════════════════════
//  TIER 4 — PLAYWRIGHT BROWSER FALLBACK
// ═════════════════════════════════════════════════════════════
async function playwrightExtract(url, audioOnly = false) {
  let playwright;
  try { playwright = require("playwright"); } catch {
    throw new Error("Playwright not installed. Run: npm i playwright");
  }
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    const videoSrc = await page.evaluate(() => {
      const v = document.querySelector("video");
      return v?.currentSrc || v?.src || null;
    });
    if (!videoSrc) throw new Error("Playwright: no video element found");
    const ext = audioOnly ? ".mp3" : ".mp4";
    const dest = path.join(DL_DIR, `playwright_${Date.now()}${ext}`);
    await downloadHTTP(videoSrc, dest);
    if (audioOnly && !dest.endsWith(".mp3")) {
      const mp3Dest = dest.replace(/\.[^.]+$/, ".mp3");
      await ffmpegConvert(dest, mp3Dest, ["-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k"]);
      cleanupFile(dest);
      return [mp3Dest];
    }
    return [dest];
  } finally {
    await browser.close();
  }
}

// ═════════════════════════════════════════════════════════════
//  PROVIDER ROUTER — smartDownload
// ═════════════════════════════════════════════════════════════
async function smartDownload(url, opts = {}) {
  const { audioOnly = false, quality = "best", signal } = opts;
  const platform = detectPlatform(url);
  const ctrl = new AbortController();
  if (signal) signal.addEventListener("abort", () => ctrl.abort());
  const sig = ctrl.signal;

  // ─── YOUTUBE ───
  if (platform === "youtube") {
    // T1: yt-dlp (covers everything including Shorts, age-gated, etc.)
    try { return await ytDlpDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T1-yt-dlp-YT] ${e.message}`); }

    // T2: Self-hosted Cobalt
    if (COBALT_API) {
      try { return await cobaltDownload(url, audioOnly, sig); }
      catch (e) { console.error(`[T2-Cobalt-YT] ${e.message}`); }
    }

    throw new Error("All YouTube extraction tiers failed.");
  }

  // ─── TIKTOK ───
  if (platform === "tiktok") {
    // T1: yt-dlp (very reliable for TikTok)
    try { return await ytDlpDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T1-yt-dlp-TT] ${e.message}`); }

    // T2: TikWM (free, fastest)
    try { return await tikwmDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T2-TikWM] ${e.message}`); }

    // T3: Self-hosted Cobalt
    if (COBALT_API) {
      try { return await cobaltDownload(url, audioOnly, sig); }
      catch (e) { console.error(`[T3-Cobalt-TT] ${e.message}`); }
    }

    throw new Error("All TikTok extraction tiers failed.");
  }

  // ─── INSTAGRAM ───
  if (platform === "instagram") {
    // T1: yt-dlp
    try { return await ytDlpDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T1-yt-dlp-IG] ${e.message}`); }

    // T2: Self-hosted Cobalt
    if (COBALT_API) {
      try { return await cobaltDownload(url, audioOnly, sig); }
      catch (e) { console.error(`[T2-Cobalt-IG] ${e.message}`); }
    }

    // T3: Playwright
    try { return await playwrightExtract(url, audioOnly); }
    catch (e) { console.error(`[T3-Playwright] ${e.message}`); }

    throw new Error("All Instagram extraction tiers failed.");
  }

  // ─── TWITTER / X ───
  if (platform === "twitter") {
    // T1: yt-dlp
    try { return await ytDlpDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T1-yt-dlp-TW] ${e.message}`); }

    // T2: Self-hosted Cobalt
    if (COBALT_API) {
      try { return await cobaltDownload(url, audioOnly, sig); }
      catch (e) { console.error(`[T2-Cobalt-TW] ${e.message}`); }
    }

    throw new Error("All Twitter extraction tiers failed.");
  }

  // ─── FACEBOOK ───
  if (platform === "facebook") {
    // T1: yt-dlp
    try { return await ytDlpDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T1-yt-dlp-FB] ${e.message}`); }

    // T2: Self-hosted Cobalt
    if (COBALT_API) {
      try { return await cobaltDownload(url, audioOnly, sig); }
      catch (e) { console.error(`[T2-Cobalt-FB] ${e.message}`); }
    }

    throw new Error("All Facebook extraction tiers failed.");
  }

  // ─── VIMEO ───
  if (platform === "vimeo") {
    try { return await ytDlpDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T1-yt-dlp-Vimeo] ${e.message}`); }

    if (COBALT_API) {
      try { return await cobaltDownload(url, audioOnly, sig); }
      catch (e) { console.error(`[T2-Cobalt-Vimeo] ${e.message}`); }
    }

    throw new Error("All Vimeo extraction tiers failed.");
  }

  // ─── REDDIT ───
  if (platform === "reddit") {
    // T1: Reddit JSON API for direct media URL
    let meta = null;
    try { meta = await redditAPIMeta(url); } catch (e) { /* silent */ }
    if (meta?.mediaUrl) {
      const dest = path.join(DL_DIR, sanitiseFilename(meta.title || "reddit") + ".mp4");
      await downloadHTTP(meta.mediaUrl, dest, { signal: sig });
      return [dest];
    }

    // T2: yt-dlp
    try { return await ytDlpDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T2-yt-dlp-Reddit] ${e.message}`); }

    throw new Error("All Reddit extraction tiers failed.");
  }

  // ─── SPOTIFY ───
  if (platform === "spotify") {
    const meta = await spotifyAPIMeta(url);
    if (meta?.preview_url) {
      const dest = path.join(DL_DIR, sanitiseFilename(meta.title || "spotify") + "_preview.mp3");
      await downloadHTTP(meta.preview_url, dest, { signal: sig });
      return [dest];
    }
    try { return await ytDlpDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T2-yt-dlp-Spotify] ${e.message}`); }
    throw new Error("Spotify: no preview available and extraction tiers failed.");
  }

  // ─── MEDIAFIRE ───
  if (platform === "mediafire") {
    const meta = await mediafireAPIMeta(url);
    if (meta?.directUrl) {
      const dest = path.join(DL_DIR, sanitiseFilename(meta.title || "mediafire"));
      await downloadHTTP(meta.directUrl, dest, { signal: sig });
      return [dest];
    }
    throw new Error("MediaFire: unable to retrieve direct link.");
  }

  // ─── GENERIC / 500+ SITES ───
  // T1: yt-dlp (this is THE solution for generic sites)
  try { return await ytDlpDownload(url, audioOnly, sig); }
  catch (e) { console.error(`[T1-yt-dlp-Generic] ${e.message}`); }

  // T2: Self-hosted Cobalt
  if (COBALT_API) {
    try { return await cobaltDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T2-Cobalt-Generic] ${e.message}`); }
  }

  // T3: Playwright last resort
  try { return await playwrightExtract(url, audioOnly); }
  catch (e) { console.error(`[T3-Playwright] ${e.message}`); }

  throw new Error(`No extraction method available for this URL. Platform: ${platform}`);
}

// ═════════════════════════════════════════════════════════════
//  BULK DOWNLOADER
// ═════════════════════════════════════════════════════════════
async function bulkDownload(urls, opts = {}) {
  const results = [], errors = [];
  const queue = [...urls];
  const active = new Set();
  await new Promise(resolve => {
    const schedule = () => {
      while (active.size < MAX_CONCURRENT && queue.length) {
        const url = queue.shift();
        const task = smartDownload(url, opts)
          .then(files => results.push({ url, files }))
          .catch(err => errors.push({ url, error: err.message }))
          .finally(() => { active.delete(task); schedule(); });
        active.add(task);
      }
      if (!active.size && !queue.length) resolve();
    };
    schedule();
  });
  return { results, errors };
}

// ═════════════════════════════════════════════════════════════
//  EXPORTS
// ═════════════════════════════════════════════════════════════
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
  // Manual access to tiers for debugging
  tiers: {
    ytDlpDownload,
    ytDlpGetInfo,
    cobaltDownload,
    tikwmDownload,
    redditAPIMeta,
    spotifyAPIMeta,
    mediafireAPIMeta,
    playwrightExtract,
  }
};
