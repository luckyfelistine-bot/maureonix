// ═══════════════════════════════════════════════════════════════
//  lib/downloader.js — MAUREONIX PRODUCTION DOWNLOADER
// ═══════════════════════════════════════════════════════════════
//  ARCHITECTURE  : Tier 1 (Free Official APIs)
//               → Tier 2 (Free / Open Source : Invidious, Piped, TikWM, Cobalt)
//               → Tier 3 (Apify — YOUR account & API token)
//               → Tier 4 (Playwright Browser Fallback)
//  CONSTRAINTS   : ZERO ytdl-core | ZERO @distube/ytdl-core | ZERO youtubei.js
//  COVERAGE      : YouTube, TikTok, Instagram, X/Twitter, Facebook,
//                  Vimeo, Reddit, Spotify, MediaFire + 500+ generic sites
// ═══════════════════════════════════════════════════════════════

"use strict";

const fs   = require("fs");
const path = require("path");
const os   = require("os");
const https = require("https");
const { spawn } = require("child_process");
const { pipeline } = require("stream/promises");

// ─────────────────────────────────────────────────────────────
//  CONFIG RESOLUTION  (reads from ../config.js → process.env)
// ─────────────────────────────────────────────────────────────
let CONFIG = {};
try { CONFIG = require("../config"); } catch { /* silent */ }
const getConf = (k, d) => CONFIG[k] ?? process.env[k] ?? d;

const DL_DIR           = getConf("DL_DIR", path.join(os.tmpdir(), "maureonix_dl"));
const FFMPEG_BIN       = getConf("FFMPEG_BIN", "ffmpeg");
const COBALT_API       = getConf("COBALT_API", "https://api.cobalt.tools");
const APIFY_TOKEN      = getConf("APIFY_API_TOKEN", "");          // ← YOUR APIFY KEY
const YOUTUBE_API_KEY  = getConf("YOUTUBE_API_KEY", "");          // Free Google Cloud
const SPOTIFY_ID       = getConf("SPOTIFY_CLIENT_ID", "");
const SPOTIFY_SECRET   = getConf("SPOTIFY_CLIENT_SECRET", "");
const MEDIAFIRE_APP_ID = getConf("MEDIAFIRE_APP_ID", "");
const VIMEO_TOKEN      = getConf("VIMEO_ACCESS_TOKEN", "");
const REDDIT_ID        = getConf("REDDIT_CLIENT_ID", "");
const REDDIT_SECRET    = getConf("REDDIT_CLIENT_SECRET", "");

const TG_MAX_MB        = 49;
const MAX_DOWNLOAD_MB  = 500;
const MAX_CONCURRENT   = 5;
const STATUS_EDIT_1    = 180000;
const STATUS_EDIT_2    = 360000;

// Free/open-source Invidious instances (rotate on failure)
const INVIDIOUS_POOL = [
  "https://vid.puffyan.us",
  "https://y.com.sb",
  "https://iv.datura.network",
  "https://inv.nadeko.net",
  "https://iv.nboeck.de",
];
// Free/open-source Piped instances (rotate on failure)
const PIPED_POOL = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.projectsegfault.com",
  "https://pipedapi.adminforge.de",
];

// Apify Actor IDs (verified April 2026)
const APIFY_ACTORS = {
  universal: "scrapepilot/download-from-any-website-youtube-tiktok-ig-1000",
  youtube:   "streamers/youtube-scraper",
  tiktok:    "clockworks/tiktok-scraper",
  instagram: "apify/instagram-scraper",
  twitter:   "apidojo/tweet-scraper",
  facebook:  "apify/facebook-posts-scraper",
};

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
           ".gif":"animation" }[ext] || "document";
}
async function ensureUnderLimit(fp) {
  if (getFileSizeMB(fp) <= TG_MAX_MB) return fp;
  throw new Error(`File too large (${getFileSizeMB(fp).toFixed(1)} MB)`);
}
function extractURLs(text) {
  return [...new Set((text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/gi) || []))];
}

// ─────────────────────────────────────────────────────────────
//  HTTP HELPERS (axios lazy-loaded)
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
//  TIER 1 — FREE OFFICIAL APIs
// ═════════════════════════════════════════════════════════════

// ─── YouTube Data API v3 (metadata only) ───
async function youtubeDataAPIMeta(videoId) {
  if (!YOUTUBE_API_KEY) return null;
  try {
    const axios = getAxios();
    const { data } = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`,
      { timeout: 15000 }
    );
    const item = data.items?.[0];
    if (!item) return null;
    return {
      title: item.snippet.title,
      description: item.snippet.description,
      channel: item.snippet.channelTitle,
      duration: item.contentDetails.duration, // ISO 8601
      views: parseInt(item.statistics.viewCount || 0),
      thumbnails: item.snippet.thumbnails,
      publishedAt: item.snippet.publishedAt,
    };
  } catch (e) { console.error(`[T1-YouTube] ${e.message}`); return null; }
}

// ─── Vimeo API ───
async function vimeoAPIMeta(url) {
  if (!VIMEO_TOKEN) return null;
  const m = url.match(/vimeo\.com\/(\d+)/);
  if (!m) return null;
  try {
    const axios = getAxios();
    const { data } = await axios.get(`https://api.vimeo.com/videos/${m[1]}`, {
      headers: { Authorization: `Bearer ${VIMEO_TOKEN}` },
      timeout: 15000,
    });
    return {
      title: data.name,
      description: data.description,
      duration: data.duration,
      uploader: data.user?.name,
      thumbnails: data.pictures?.sizes?.map(s => ({ url: s.link, width: s.width })),
      mediaUrl: data.download?.[0]?.link || data.files?.[0]?.link,
    };
  } catch (e) { console.error(`[T1-Vimeo] ${e.message}`); return null; }
}

// ─── Reddit API ───
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
  } catch (e) { console.error(`[T1-Reddit] ${e.message}`); return null; }
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
      preview_url: data.preview_url, // 30s only — Spotify DRM prevents full audio
      image: data.album?.images?.[0]?.url || data.images?.[0]?.url,
      platform: "spotify",
    };
  } catch (e) { console.error(`[T1-Spotify] ${e.message}`); return null; }
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
  } catch (e) { console.error(`[T1-MediaFire] ${e.message}`); return null; }
}

// ═════════════════════════════════════════════════════════════
//  TIER 2 — FREE / OPEN SOURCE EXTRACTORS
// ═════════════════════════════════════════════════════════════

// ─── Invidious (YouTube direct streams, no API key) ───
async function invidiousExtract(videoId) {
  const axios = getAxios();
  for (const host of INVIDIOUS_POOL) {
    try {
      const { data } = await axios.get(`${host}/api/v1/videos/${videoId}`, { timeout: 15000 });
      const formats = [];
      if (data.formatStreams) {
        for (const f of data.formatStreams) formats.push({ url: f.url, quality: f.qualityLabel || f.resolution, hasVideo: true, hasAudio: true });
      }
      if (data.adaptiveFormats) {
        for (const f of data.adaptiveFormats) formats.push({ url: f.url, quality: f.qualityLabel || `${f.bitrate}bps`, hasVideo: f.type?.startsWith("video"), hasAudio: f.type?.startsWith("audio") });
      }
      if (!formats.length) continue;
      return { title: data.title, uploader: data.author, formats, source: "invidious" };
    } catch (e) { continue; }
  }
  throw new Error("Invidious pool exhausted");
}

// ─── Piped (YouTube direct streams, no API key) ───
async function pipedExtract(videoId) {
  const axios = getAxios();
  for (const host of PIPED_POOL) {
    try {
      const { data } = await axios.get(`${host}/streams/${videoId}`, { timeout: 15000 });
      const formats = [];
      if (data.videoStreams) {
        for (const f of data.videoStreams) formats.push({ url: f.url, quality: f.quality, hasVideo: true, hasAudio: f.videoOnly === false });
      }
      if (data.audioStreams) {
        for (const f of data.audioStreams) formats.push({ url: f.url, quality: f.quality, hasVideo: false, hasAudio: true });
      }
      if (!formats.length) continue;
      return { title: data.title, uploader: data.uploader, formats, source: "piped" };
    } catch (e) { continue; }
  }
  throw new Error("Piped pool exhausted");
}

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

// ─── Cobalt (Universal free/open-source downloader) ───
// NOTE: Hosted api.cobalt.tools has bot protection. Set COBALT_API to your
// self-hosted instance OR use Apify as primary for production reliability.
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
  const res = await axios.post(`${COBALT_API}/`, body, {
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
//  TIER 3 — APIFY (USER'S ACCOUNT)
// ═════════════════════════════════════════════════════════════
// Uses YOUR Apify API token. Actors are billed to your account.
// This is the "500+ sites" backbone.

async function apifyRequest(method, endpoint, body = null, opts = {}) {
  if (!APIFY_TOKEN) throw new Error("Apify token not configured");
  const axios = getAxios();
  const url = `https://api.apify.com/v2${endpoint}`;
  const cfg = {
    method, url,
    headers: { Authorization: `Bearer ${APIFY_TOKEN}`, "Content-Type": "application/json" },
    timeout: opts.timeout || 300_000,
    ...(body && { data: body }),
  };
  const { data } = await axios(cfg);
  return data.data;
}

// Synchronous run (max 300s) — returns dataset items directly
async function apifyRunSync(actorId, input) {
  const data = await apifyRequest("post", `/acts/${actorId}/run-sync-get-dataset-items`, { input }, { timeout: 300_000 });
  return data; // array of items
}

// Async run with polling
async function apifyRunAsync(actorId, input, maxWaitSec = 180) {
  const run = await apifyRequest("post", `/acts/${actorId}/runs`, { input });
  const runId = run.id;
  const start = Date.now();
  while (Date.now() - start < maxWaitSec * 1000) {
    await sleep(3000);
    const status = await apifyRequest("get", `/actor-runs/${runId}`, null, { timeout: 15000 });
    if (status.status === "SUCCEEDED") {
      const items = await apifyRequest("get", `/datasets/${status.defaultDatasetId}/items?clean=true`, null, { timeout: 30000 });
      return items;
    }
    if (status.status === "FAILED" || status.status === "ABORTED" || status.status === "TIMED-OUT") {
      throw new Error(`Apify run ${status.status}: ${status.statusMessage || "No message"}`);
    }
  }
  throw new Error("Apify run timed out");
}

// ─── Apify Universal (500+ sites) ───
async function apifyUniversal(url, audioOnly = false) {
  const items = await apifyRunSync(APIFY_ACTORS.universal, {
    urls: [url],
    downloadMedia: true,
    audioOnly: !!audioOnly,
    proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ["RESIDENTIAL"] },
  });
  if (!items?.length) throw new Error("Apify universal returned empty");
  const files = [];
  for (const item of items) {
    const mediaUrl = item.videoUrl || item.audioUrl || item.mediaUrl || item.downloadUrl;
    if (!mediaUrl) continue;
    const ext = audioOnly ? ".mp3" : (path.extname(item.filename || "").slice(1) || "mp4");
    const dest = path.join(DL_DIR, sanitiseFilename(item.title || item.filename || `apify_${Date.now()}.${ext}`));
    await downloadHTTP(mediaUrl, dest, { headers: item.headers || {} });
    files.push(dest);
  }
  if (!files.length) throw new Error("Apify universal: no downloadable URLs");
  return files;
}

// ─── Apify YouTube ───
async function apifyYouTube(url, audioOnly = false) {
  const items = await apifyRunSync(APIFY_ACTORS.youtube, {
    urls: [url],
    downloadSubtitles: false,
    proxyConfiguration: { useApifyProxy: true },
  });
  const item = items?.[0];
  if (!item) throw new Error("Apify YouTube returned empty");
  const mediaUrl = audioOnly ? (item.audioUrl || item.audioDownloadUrl) : (item.videoUrl || item.downloadUrl);
  if (!mediaUrl) throw new Error("Apify YouTube: no media URL");
  const title = sanitiseFilename(item.title || "youtube");
  const dest = path.join(DL_DIR, `${title}.${audioOnly ? "mp3" : "mp4"}`);
  await downloadHTTP(mediaUrl, dest);
  return [dest];
}

// ─── Apify TikTok ───
async function apifyTikTok(url, audioOnly = false) {
  const items = await apifyRunSync(APIFY_ACTORS.tiktok, {
    urls: [url],
    proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ["RESIDENTIAL"] },
  });
  const item = items?.[0];
  if (!item) throw new Error("Apify TikTok returned empty");
  const files = [];
  const mediaUrl = audioOnly ? (item.musicUrl || item.audioUrl) : (item.videoUrl || item.playAddr);
  if (!mediaUrl) throw new Error("Apify TikTok: no media URL");
  const dest = path.join(DL_DIR, sanitiseFilename(item.text || "tiktok") + (audioOnly ? "_audio.mp3" : ".mp4"));
  await downloadHTTP(mediaUrl, dest);
  files.push(dest);
  return files;
}

// ─── Apify Instagram ───
async function apifyInstagram(url, audioOnly = false) {
  const items = await apifyRunSync(APIFY_ACTORS.instagram, {
    urls: [url],
    proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ["RESIDENTIAL"] },
  });
  const item = items?.[0];
  if (!item) throw new Error("Apify Instagram returned empty");
  const mediaUrl = item.videoUrl || item.displayUrl || item.url;
  if (!mediaUrl) throw new Error("Apify Instagram: no media URL");
  const dest = path.join(DL_DIR, sanitiseFilename(item.caption || "instagram") + (audioOnly ? "_audio.mp3" : ".mp4"));
  await downloadHTTP(mediaUrl, dest);
  return [dest];
}

// ─── Apify Twitter/X ───
async function apifyTwitter(url, audioOnly = false) {
  const items = await apifyRunSync(APIFY_ACTORS.twitter, {
    urls: [url],
    proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ["RESIDENTIAL"] },
  });
  const item = items?.[0];
  if (!item) throw new Error("Apify Twitter returned empty");
  const mediaUrl = item.media?.[0]?.url || item.videoUrl || item.url;
  if (!mediaUrl) throw new Error("Apify Twitter: no media URL");
  const dest = path.join(DL_DIR, sanitiseFilename(item.text?.slice(0, 60) || "twitter") + (audioOnly ? "_audio.mp3" : ".mp4"));
  await downloadHTTP(mediaUrl, dest);
  return [dest];
}

// ─── Apify Facebook ───
async function apifyFacebook(url, audioOnly = false) {
  const items = await apifyRunSync(APIFY_ACTORS.facebook, {
    urls: [url],
    proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ["RESIDENTIAL"] },
  });
  const item = items?.[0];
  if (!item) throw new Error("Apify Facebook returned empty");
  const mediaUrl = item.videoUrl || item.url;
  if (!mediaUrl) throw new Error("Apify Facebook: no media URL");
  const dest = path.join(DL_DIR, sanitiseFilename(item.text?.slice(0, 60) || "facebook") + (audioOnly ? "_audio.mp3" : ".mp4"));
  await downloadHTTP(mediaUrl, dest);
  return [dest];
}

// ═════════════════════════════════════════════════════════════
//  TIER 4 — PLAYWRIGHT BROWSER FALLBACK
// ═════════════════════════════════════════════════════════════
async function playwrightExtract(url, audioOnly = false) {
  // Lazy-load playwright only when needed
  let playwright;
  try { playwright = require("playwright"); } catch {
    throw new Error("Playwright not installed. Run: npm i playwright");
  }
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    // Try to extract the biggest <video> src
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
    const videoId = extractYouTubeId(url);
    if (!videoId) throw new Error("Invalid YouTube URL");

    // T1: Metadata from Data API (optional, for enrichment)
    let meta = null;
    if (YOUTUBE_API_KEY) {
      try { meta = await youtubeDataAPIMeta(videoId); } catch (e) { /* silent */ }
    }

    // T2: Invidious (free/open-source YouTube frontend)
    try {
      const info = await invidiousExtract(videoId);
      let chosen = null;
      if (audioOnly) chosen = info.formats.find(f => f.hasAudio && !f.hasVideo);
      if (!chosen) chosen = info.formats.find(f => f.hasVideo && (quality === "best" ? true : f.quality?.includes(quality)));
      if (!chosen) chosen = info.formats.find(f => f.hasVideo);
      if (!chosen) throw new Error("No matching Invidious format");
      const title = sanitiseFilename(meta?.title || info.title || videoId);
      const dest = path.join(DL_DIR, `${title}.${audioOnly ? "mp3" : "mp4"}`);
      await downloadHTTP(chosen.url, dest, { signal: sig });
      if (audioOnly && !dest.endsWith(".mp3")) {
        const mp3 = dest.replace(/\.[^.]+$/, ".mp3");
        await ffmpegConvert(dest, mp3, ["-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k"]);
        cleanupFile(dest); return [mp3];
      }
      return [dest];
    } catch (e) { console.error(`[T2-Invidious] ${e.message}`); }

    // T2: Piped (fallback)
    try {
      const info = await pipedExtract(videoId);
      let chosen = null;
      if (audioOnly) chosen = info.formats.find(f => f.hasAudio && !f.hasVideo);
      if (!chosen) chosen = info.formats.find(f => f.hasVideo);
      if (!chosen) throw new Error("No matching Piped format");
      const title = sanitiseFilename(meta?.title || info.title || videoId);
      const dest = path.join(DL_DIR, `${title}.${audioOnly ? "mp3" : "mp4"}`);
      await downloadHTTP(chosen.url, dest, { signal: sig });
      if (audioOnly && !dest.endsWith(".mp3")) {
        const mp3 = dest.replace(/\.[^.]+$/, ".mp3");
        await ffmpegConvert(dest, mp3, ["-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k"]);
        cleanupFile(dest); return [mp3];
      }
      return [dest];
    } catch (e) { console.error(`[T2-Piped] ${e.message}`); }

    // T2: Cobalt
    try { return await cobaltDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T2-Cobalt] ${e.message}`); }

    // T3: Apify YouTube actor
    if (APIFY_TOKEN) {
      try { return await apifyYouTube(url, audioOnly); }
      catch (e) { console.error(`[T3-Apify-YT] ${e.message}`); }
    }

    // T3: Apify Universal
    if (APIFY_TOKEN) {
      try { return await apifyUniversal(url, audioOnly); }
      catch (e) { console.error(`[T3-Apify-Uni] ${e.message}`); }
    }

    throw new Error("All YouTube extraction tiers failed.");
  }

  // ─── TIKTOK ───
  if (platform === "tiktok") {
    // T2: TikWM (free, fastest)
    try { return await tikwmDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T2-TikWM] ${e.message}`); }

    // T2: Cobalt
    try { return await cobaltDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T2-Cobalt] ${e.message}`); }

    // T3: Apify TikTok
    if (APIFY_TOKEN) {
      try { return await apifyTikTok(url, audioOnly); }
      catch (e) { console.error(`[T3-Apify-TT] ${e.message}`); }
    }

    // T3: Apify Universal
    if (APIFY_TOKEN) {
      try { return await apifyUniversal(url, audioOnly); }
      catch (e) { console.error(`[T3-Apify-Uni] ${e.message}`); }
    }

    throw new Error("All TikTok extraction tiers failed.");
  }

  // ─── INSTAGRAM ───
  if (platform === "instagram") {
    // T2: Cobalt
    try { return await cobaltDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T2-Cobalt] ${e.message}`); }

    // T3: Apify Instagram
    if (APIFY_TOKEN) {
      try { return await apifyInstagram(url, audioOnly); }
      catch (e) { console.error(`[T3-Apify-IG] ${e.message}`); }
    }

    // T3: Apify Universal
    if (APIFY_TOKEN) {
      try { return await apifyUniversal(url, audioOnly); }
      catch (e) { console.error(`[T3-Apify-Uni] ${e.message}`); }
    }

    // T4: Playwright
    try { return await playwrightExtract(url, audioOnly); }
    catch (e) { console.error(`[T4-Playwright] ${e.message}`); }

    throw new Error("All Instagram extraction tiers failed.");
  }

  // ─── TWITTER / X ───
  if (platform === "twitter") {
    // T2: Cobalt
    try { return await cobaltDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T2-Cobalt] ${e.message}`); }

    // T3: Apify Twitter
    if (APIFY_TOKEN) {
      try { return await apifyTwitter(url, audioOnly); }
      catch (e) { console.error(`[T3-Apify-TW] ${e.message}`); }
    }

    // T3: Apify Universal
    if (APIFY_TOKEN) {
      try { return await apifyUniversal(url, audioOnly); }
      catch (e) { console.error(`[T3-Apify-Uni] ${e.message}`); }
    }

    throw new Error("All Twitter extraction tiers failed.");
  }

  // ─── FACEBOOK ───
  if (platform === "facebook") {
    // T2: Cobalt
    try { return await cobaltDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T2-Cobalt] ${e.message}`); }

    // T3: Apify Facebook
    if (APIFY_TOKEN) {
      try { return await apifyFacebook(url, audioOnly); }
      catch (e) { console.error(`[T3-Apify-FB] ${e.message}`); }
    }

    // T3: Apify Universal
    if (APIFY_TOKEN) {
      try { return await apifyUniversal(url, audioOnly); }
      catch (e) { console.error(`[T3-Apify-Uni] ${e.message}`); }
    }

    throw new Error("All Facebook extraction tiers failed.");
  }

  // ─── VIMEO ───
  if (platform === "vimeo") {
    // T1: Metadata + possible direct link
    let meta = null;
    try { meta = await vimeoAPIMeta(url); } catch (e) { /* silent */ }
    if (meta?.mediaUrl) {
      const dest = path.join(DL_DIR, sanitiseFilename(meta.title || "vimeo") + ".mp4");
      await downloadHTTP(meta.mediaUrl, dest, { signal: sig });
      return [dest];
    }

    // T2: Cobalt
    try { return await cobaltDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T2-Cobalt] ${e.message}`); }

    // T3: Apify Universal
    if (APIFY_TOKEN) {
      try { return await apifyUniversal(url, audioOnly); }
      catch (e) { console.error(`[T3-Apify-Uni] ${e.message}`); }
    }

    throw new Error("All Vimeo extraction tiers failed.");
  }

  // ─── REDDIT ───
  if (platform === "reddit") {
    // T1: Reddit API for direct media URL
    let meta = null;
    try { meta = await redditAPIMeta(url); } catch (e) { /* silent */ }
    if (meta?.mediaUrl) {
      const dest = path.join(DL_DIR, sanitiseFilename(meta.title || "reddit") + ".mp4");
      await downloadHTTP(meta.mediaUrl, dest, { signal: sig });
      return [dest];
    }

    // T2: Cobalt
    try { return await cobaltDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T2-Cobalt] ${e.message}`); }

    // T3: Apify Universal
    if (APIFY_TOKEN) {
      try { return await apifyUniversal(url, audioOnly); }
      catch (e) { console.error(`[T3-Apify-Uni] ${e.message}`); }
    }

    throw new Error("All Reddit extraction tiers failed.");
  }

  // ─── SPOTIFY ───
  if (platform === "spotify") {
    // T1: Metadata + 30s preview ONLY (Spotify DRM prevents full download via official API)
    const meta = await spotifyAPIMeta(url);
    if (meta?.preview_url) {
      const dest = path.join(DL_DIR, sanitiseFilename(meta.title || "spotify") + "_preview.mp3");
      await downloadHTTP(meta.preview_url, dest, { signal: sig });
      return [dest];
    }
    // For full tracks, fall through to Cobalt / Apify (legality depends on jurisdiction)
    try { return await cobaltDownload(url, audioOnly, sig); }
    catch (e) { console.error(`[T2-Cobalt] ${e.message}`); }
    if (APIFY_TOKEN) {
      try { return await apifyUniversal(url, audioOnly); }
      catch (e) { console.error(`[T3-Apify-Uni] ${e.message}`); }
    }
    throw new Error("Spotify: no preview available and extraction tiers failed.");
  }

  // ─── MEDIAFIRE ───
  if (platform === "mediafire") {
    // T1: MediaFire API direct link
    const meta = await mediafireAPIMeta(url);
    if (meta?.directUrl) {
      const dest = path.join(DL_DIR, sanitiseFilename(meta.title || "mediafire"));
      await downloadHTTP(meta.directUrl, dest, { signal: sig });
      return [dest];
    }
    throw new Error("MediaFire: unable to retrieve direct link.");
  }

  // ─── GENERIC / 500+ SITES ───
  // T2: Cobalt
  try { return await cobaltDownload(url, audioOnly, sig); }
  catch (e) { console.error(`[T2-Cobalt] ${e.message}`); }

  // T3: Apify Universal (the "500+ sites" backbone)
  if (APIFY_TOKEN) {
    try { return await apifyUniversal(url, audioOnly); }
    catch (e) { console.error(`[T3-Apify-Uni] ${e.message}`); }
  }

  // T4: Playwright last resort
  try { return await playwrightExtract(url, audioOnly); }
  catch (e) { console.error(`[T4-Playwright] ${e.message}`); }

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
  // Manual access to tiers for debugging / advanced use
  tiers: {
    youtubeDataAPIMeta,
    vimeoAPIMeta,
    redditAPIMeta,
    spotifyAPIMeta,
    mediafireAPIMeta,
    invidiousExtract,
    pipedExtract,
    tikwmDownload,
    cobaltDownload,
    apifyUniversal,
    apifyYouTube,
    apifyTikTok,
    apifyInstagram,
    apifyTwitter,
    apifyFacebook,
    playwrightExtract,
  }
};