// commands/download.js – Works with new downloader.js, never broadcasts errors
const fs = require('fs');
const path = require('path');
const { smartDownload, bulkDownload, extractURLs, ensureUnderLimit, guessMime, getFileSizeMB, cleanupFile, STATUS_EDIT_1, STATUS_EDIT_2 } = require('../lib/downloader');

const isUrl = (text) => /^https?:\/\/[^\s<>"{}|\\^`[\]]+/i.test(text || '');

async function sendFile(nimesha, m, fp, label = '📁') {
  const safe = await ensureUnderLimit(fp);
  const mime = guessMime(safe);
  const size = getFileSizeMB(safe).toFixed(1);
  const cap = `${label}\n📦 ${size} MB`;
  const buffer = fs.readFileSync(safe);
  if (mime === 'video') await nimesha.sendMessage(m.chat, { video: buffer, caption: cap }, { quoted: m });
  else if (mime === 'audio') await nimesha.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg' }, { quoted: m });
  else if (mime === 'photo') await nimesha.sendMessage(m.chat, { image: buffer, caption: cap }, { quoted: m });
  else await nimesha.sendMessage(m.chat, { document: buffer, fileName: path.basename(fp) }, { quoted: m });
  cleanupFile(fp);
}

async function createStatus(nimesha, m, text) {
  const msg = await nimesha.sendMessage(m.chat, { text }, { quoted: m });
  const key = msg.key;
  let settled = false;
  const t1 = setTimeout(() => { if (!settled) nimesha.sendMessage(m.chat, { text: `⏳ Still processing...`, edit: key }).catch(()=>{}); }, STATUS_EDIT_1);
  const t2 = setTimeout(() => { if (!settled) { settled = true; nimesha.sendMessage(m.chat, { text: `❌ Request timed out.`, edit: key }).catch(()=>{}); } }, STATUS_EDIT_2);
  return {
    key, async success(txt) { settled = true; clearTimeout(t1); clearTimeout(t2); await nimesha.sendMessage(m.chat, { text: txt, edit: key }).catch(()=>{}); },
    async error(txt) { settled = true; clearTimeout(t1); clearTimeout(t2); await nimesha.sendMessage(m.chat, { text: txt, edit: key }).catch(()=>{}); }
  };
}

module.exports = {
  // YouTube video
  video: async (nimesha, m, { text, prefix, command }) => {
    if (!text) return m.reply(`🎬 *Usage:* ${prefix+command} <url>`);
    let input = text.trim(), quality = 'best';
    const qMatch = input.match(/^(2160|1440|1080|720|480|360|240)\s+/);
    if (qMatch) { quality = qMatch[1]; input = input.slice(qMatch[0].length).trim(); }
    let url = input;
    if (!isUrl(url)) {
      const yts = require('yt-search');
      const sr = await yts(url);
      if (!sr.videos?.length) return m.reply('❌ No results');
      url = sr.videos[0].url;
    }
    const status = await createStatus(nimesha, m, `⏳ Downloading video...`);
    try {
      const files = await smartDownload(url, { audioOnly: false, quality });
      for (const fp of files) await sendFile(nimesha, m, fp, '🎬 Video');
      await status.success('✅ Video sent!');
    } catch (err) { await status.error(`❌ ${err.message}`); }
  },
  song: async (nimesha, m, { text, prefix, command }) => {
    if (!text) return m.reply(`🎵 *Usage:* ${prefix+command} <url>`);
    let url = text.trim();
    if (!isUrl(url)) {
      const yts = require('yt-search');
      const sr = await yts(url);
      if (!sr.videos?.length) return m.reply('❌ No results');
      url = sr.videos[0].url;
    }
    const status = await createStatus(nimesha, m, `🎵 Downloading audio...`);
    try {
      const files = await smartDownload(url, { audioOnly: true });
      for (const fp of files) await sendFile(nimesha, m, fp, '🎵 Audio');
      await status.success('✅ Audio sent!');
    } catch (err) { await status.error(`❌ ${err.message}`); }
  },
  tiktok: async (nimesha, m, { text }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply('🎵 *Usage:* .tt <url>');
    const status = await createStatus(nimesha, m, `⏳ Downloading TikTok...`);
    try {
      const files = await smartDownload(urls[0]);
      for (const fp of files) await sendFile(nimesha, m, fp, '🎵 TikTok');
      await status.success('✅ Done!');
    } catch (err) { await status.error(`❌ ${err.message}`); }
  },
  instagram: async (nimesha, m, { text }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply('📸 *Usage:* .ig <url>');
    const status = await createStatus(nimesha, m, `📸 Downloading Instagram...`);
    try {
      const files = await smartDownload(urls[0]);
      for (const fp of files) await sendFile(nimesha, m, fp, '📸 Instagram');
      await status.success('✅ Done!');
    } catch (err) { await status.error(`❌ ${err.message}`); }
  },
  twitter: async (nimesha, m, { text }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply('🐦 *Usage:* .tw <url>');
    const status = await createStatus(nimesha, m, `🐦 Downloading Twitter/X...`);
    try {
      const files = await smartDownload(urls[0]);
      for (const fp of files) await sendFile(nimesha, m, fp, '🐦 Twitter');
      await status.success('✅ Done!');
    } catch (err) { await status.error(`❌ ${err.message}`); }
  },
  facebook: async (nimesha, m, { text }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply('👤 *Usage:* .fb <url>');
    const status = await createStatus(nimesha, m, `👤 Downloading Facebook...`);
    try {
      const files = await smartDownload(urls[0]);
      for (const fp of files) await sendFile(nimesha, m, fp, '👤 Facebook');
      await status.success('✅ Done!');
    } catch (err) { await status.error(`❌ ${err.message}`); }
  },
  spotify: async (nimesha, m, { text }) => {
    if (!isUrl(text)) return m.reply('🟢 *Usage:* .spotify <url>');
    const status = await createStatus(nimesha, m, `🟢 Downloading Spotify...`);
    try {
      const files = await smartDownload(text.trim());
      for (const fp of files) await sendFile(nimesha, m, fp, '🟢 Spotify');
      await status.success('✅ Done!');
    } catch (err) { await status.error(`❌ ${err.message}`); }
  },
  // Aliases
  vid: async (nimesha, m, ctx) => { await module.exports.video(nimesha, m, ctx); },
  ytmp4: async (nimesha, m, ctx) => { await module.exports.video(nimesha, m, ctx); },
  mp4: async (nimesha, m, ctx) => { await module.exports.video(nimesha, m, ctx); },
  mp3: async (nimesha, m, ctx) => { await module.exports.song(nimesha, m, ctx); },
  ytmp3: async (nimesha, m, ctx) => { await module.exports.song(nimesha, m, ctx); },
  audio: async (nimesha, m, ctx) => { await module.exports.song(nimesha, m, ctx); },
  tt: async (nimesha, m, ctx) => { await module.exports.tiktok(nimesha, m, ctx); },
  ig: async (nimesha, m, ctx) => { await module.exports.instagram(nimesha, m, ctx); },
  tw: async (nimesha, m, ctx) => { await module.exports.twitter(nimesha, m, ctx); },
  fb: async (nimesha, m, ctx) => { await module.exports.facebook(nimesha, m, ctx); },
  sp: async (nimesha, m, ctx) => { await module.exports.spotify(nimesha, m, ctx); },
};