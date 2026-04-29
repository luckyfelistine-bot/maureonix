// commands/download.js — MAUREONIX DOWNLOAD COMMANDS
// Works with the new tiered production downloader (lib/downloader.js)
// Zero broadcast of raw errors to chat; all errors go to status message.

const fs = require("fs");
const path = require("path");
const {
  smartDownload,
  extractURLs,
  ensureUnderLimit,
  guessMime,
  getFileSizeMB,
  cleanupFile,
  STATUS_EDIT_1,
  STATUS_EDIT_2,
} = require("../lib/downloader");

const isUrl = (text) => /^https?:\/\/[^\s<>"{}|\\^`[\]]+/i.test(text || "");

async function sendFile(nimesha, m, fp, label = "📁") {
  const safe = await ensureUnderLimit(fp);
  const mime = guessMime(safe);
  const size = getFileSizeMB(safe).toFixed(1);
  const cap = `${label}\n📦 ${size} MB`;
  const buffer = fs.readFileSync(safe);
  if (mime === "video") {
    await nimesha.sendMessage(m.chat, { video: buffer, caption: cap }, { quoted: m });
  } else if (mime === "audio") {
    await nimesha.sendMessage(m.chat, { audio: buffer, mimetype: "audio/mpeg" }, { quoted: m });
  } else if (mime === "photo") {
    await nimesha.sendMessage(m.chat, { image: buffer, caption: cap }, { quoted: m });
  } else {
    await nimesha.sendMessage(m.chat, { document: buffer, fileName: path.basename(fp) }, { quoted: m });
  }
  cleanupFile(fp);
}

async function createStatus(nimesha, m, text) {
  const msg = await nimesha.sendMessage(m.chat, { text }, { quoted: m });
  const key = msg.key;
  let settled = false;
  const t1 = setTimeout(() => {
    if (!settled) nimesha.sendMessage(m.chat, { text: "⏳ Still processing...", edit: key }).catch(() => {});
  }, STATUS_EDIT_1);
  const t2 = setTimeout(() => {
    if (!settled) {
      settled = true;
      nimesha.sendMessage(m.chat, { text: "❌ Request timed out.", edit: key }).catch(() => {});
    }
  }, STATUS_EDIT_2);
  return {
    key,
    async success(txt) {
      settled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      await nimesha.sendMessage(m.chat, { text: txt, edit: key }).catch(() => {});
    },
    async error(txt) {
      settled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      await nimesha.sendMessage(m.chat, { text: txt, edit: key }).catch(() => {});
    },
  };
}

module.exports = {
  // ─── VIDEO (YouTube + generic) ───
  video: async (nimesha, m, { text, prefix, command }) => {
    if (!text) return m.reply(`🎬 *Usage:* ${prefix + command} <url or search>`);
    let url = text.trim();
    if (!isUrl(url)) {
      const yts = require("yt-search");
      const sr = await yts(url);
      if (!sr.videos?.length) return m.reply("❌ No results found.");
      url = sr.videos[0].url;
    }
    const status = await createStatus(nimesha, m, "⏳ Downloading video...");
    try {
      const files = await smartDownload(url, { audioOnly: false });
      for (const fp of files) await sendFile(nimesha, m, fp, "🎬 Video");
      await status.success("✅ Video sent!");
    } catch (err) {
      await status.error(`❌ ${err.message}`);
    }
  },

  // ─── SONG / AUDIO (YouTube + generic) ───
  song: async (nimesha, m, { text, prefix, command }) => {
    if (!text) return m.reply(`🎵 *Usage:* ${prefix + command} <url or search>`);
    let url = text.trim();
    if (!isUrl(url)) {
      const yts = require("yt-search");
      const sr = await yts(url);
      if (!sr.videos?.length) return m.reply("❌ No results found.");
      url = sr.videos[0].url;
    }
    const status = await createStatus(nimesha, m, "🎵 Downloading audio...");
    try {
      const files = await smartDownload(url, { audioOnly: true });
      for (const fp of files) await sendFile(nimesha, m, fp, "🎵 Audio");
      await status.success("✅ Audio sent!");
    } catch (err) {
      await status.error(`❌ ${err.message}`);
    }
  },

  // ─── TIKTOK ───
  tiktok: async (nimesha, m, { text }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply("🎵 *Usage:* .tt <url>");
    const status = await createStatus(nimesha, m, "⏳ Downloading TikTok...");
    try {
      const files = await smartDownload(urls[0]);
      for (const fp of files) await sendFile(nimesha, m, fp, "🎵 TikTok");
      await status.success("✅ Done!");
    } catch (err) {
      await status.error(`❌ ${err.message}`);
    }
  },

  // ─── INSTAGRAM ───
  ig: async (nimesha, m, { text }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply("📸 *Usage:* .ig <url>");
    const status = await createStatus(nimesha, m, "⏳ Downloading Instagram...");
    try {
      const files = await smartDownload(urls[0]);
      for (const fp of files) await sendFile(nimesha, m, fp, "📸 Instagram");
      await status.success("✅ Done!");
    } catch (err) {
      await status.error(`❌ ${err.message}`);
    }
  },

  // ─── TWITTER / X ───
  twitter: async (nimesha, m, { text }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply("🐦 *Usage:* .x <url>");
    const status = await createStatus(nimesha, m, "⏳ Downloading X...");
    try {
      const files = await smartDownload(urls[0]);
      for (const fp of files) await sendFile(nimesha, m, fp, "🐦 X");
      await status.success("✅ Done!");
    } catch (err) {
      await status.error(`❌ ${err.message}`);
    }
  },

  // ─── FACEBOOK ───
  fb: async (nimesha, m, { text }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply("📘 *Usage:* .fb <url>");
    const status = await createStatus(nimesha, m, "⏳ Downloading Facebook...");
    try {
      const files = await smartDownload(urls[0]);
      for (const fp of files) await sendFile(nimesha, m, fp, "📘 Facebook");
      await status.success("✅ Done!");
    } catch (err) {
      await status.error(`❌ ${err.message}`);
    }
  },

  // ─── REDDIT ───
  reddit: async (nimesha, m, { text }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply("👽 *Usage:* .reddit <url>");
    const status = await createStatus(nimesha, m, "⏳ Downloading Reddit...");
    try {
      const files = await smartDownload(urls[0]);
      for (const fp of files) await sendFile(nimesha, m, fp, "👽 Reddit");
      await status.success("✅ Done!");
    } catch (err) {
      await status.error(`❌ ${err.message}`);
    }
  },

  // ─── SPOTIFY (preview / metadata) ───
  spotify: async (nimesha, m, { text }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply("🎧 *Usage:* .spotify <url>");
    const status = await createStatus(nimesha, m, "⏳ Fetching Spotify...");
    try {
      const files = await smartDownload(urls[0], { audioOnly: true });
      for (const fp of files) await sendFile(nimesha, m, fp, "🎧 Spotify");
      await status.success("✅ Done!");
    } catch (err) {
      await status.error(`❌ ${err.message}`);
    }
  },

  // ─── MEDIAFIRE ───
  mediafire: async (nimesha, m, { text }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply("☁️ *Usage:* .mediafire <url>");
    const status = await createStatus(nimesha, m, "⏳ Downloading from MediaFire...");
    try {
      const files = await smartDownload(urls[0]);
      for (const fp of files) await sendFile(nimesha, m, fp, "☁️ MediaFire");
      await status.success("✅ Done!");
    } catch (err) {
      await status.error(`❌ ${err.message}`);
    }
  },

  // ─── UNIVERSAL / ANY URL ───
  download: async (nimesha, m, { text }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply("📥 *Usage:* .dl <url>");
    const status = await createStatus(nimesha, m, "⏳ Downloading...");
    try {
      const files = await smartDownload(urls[0]);
      for (const fp of files) await sendFile(nimesha, m, fp, "📥 Download");
      await status.success("✅ Done!");
    } catch (err) {
      await status.error(`❌ ${err.message}`);
    }
  },

  // ═══════════════════════════════════════════════════════════
  //  ALIASES
  // ═══════════════════════════════════════════════════════════
  tt: async (n, m, c) => module.exports.tiktok(n, m, c),
  ytmp4: async (n, m, c) => module.exports.video(n, m, c),
  mp4: async (n, m, c) => module.exports.video(n, m, c),
  ytmp3: async (n, m, c) => module.exports.song(n, m, c),
  mp3: async (n, m, c) => module.exports.song(n, m, c),
  x: async (n, m, c) => module.exports.twitter(n, m, c),
  twt: async (n, m, c) => module.exports.twitter(n, m, c),
  insta: async (n, m, c) => module.exports.ig(n, m, c),
  sf: async (n, m, c) => module.exports.spotify(n, m, c),
  mf: async (n, m, c) => module.exports.mediafire(n, m, c),
  dl: async (n, m, c) => module.exports.download(n, m, c),
};