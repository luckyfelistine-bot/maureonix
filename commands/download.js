// commands/download.js – Media & file downloaders
const fs = require('fs');
const path = require('path');
const {
  smartDownload, bulkDownload, extractURLs, ensureUnderLimit,
  guessMime, getFileSizeMB, cleanupFile, STATUS_EDIT_1, STATUS_EDIT_2
} = require('../lib/downloader');

// ─── Inline isUrl validator (no external dependency) ───
const isUrl = (text) => /^https?:\/\/[^\s<>"{}|\\^`[\]]+/i.test(text || '');

// ─── Inline sendFile (no ./_utils dependency) ───
async function sendFile(nimesha, m, fp, label = '📁') {
  const safe = await ensureUnderLimit(fp);
  const mime = guessMime(safe);
  const size = getFileSizeMB(safe).toFixed(1);
  const cap = `${label}\n📦 ${size} MB`;

  if (mime === 'video') {
    await nimesha.sendMessage(m.chat, { video: fs.readFileSync(safe), caption: cap }, { quoted: m });
  } else if (mime === 'audio') {
    await nimesha.sendMessage(m.chat, { audio: fs.readFileSync(safe), mimetype: 'audio/mpeg' }, { quoted: m });
  } else if (mime === 'photo') {
    await nimesha.sendMessage(m.chat, { image: fs.readFileSync(safe), caption: cap }, { quoted: m });
  } else if (mime === 'animation') {
    await nimesha.sendMessage(m.chat, { video: fs.readFileSync(safe), gifPlayback: true, caption: cap }, { quoted: m });
  } else {
    await nimesha.sendMessage(m.chat, { document: fs.readFileSync(safe), fileName: path.basename(safe) }, { quoted: m });
  }
  cleanupFile(fp);
}

// ─── Timed status helper (edits at 3min, fails at 6min) ───
async function createStatus(nimesha, m, text) {
  const msg = await nimesha.sendMessage(m.chat, { text }, { quoted: m });
  const key = msg.key;
  let settled = false;

  const t1 = setTimeout(() => {
    if (!settled) {
      nimesha.sendMessage(m.chat, {
        text: `⏳ Still processing... (this is taking longer than usual)`,
        edit: key
      }).catch(() => {});
    }
  }, STATUS_EDIT_1);

  const t2 = setTimeout(() => {
    if (!settled) {
      settled = true;
      nimesha.sendMessage(m.chat, {
        text: `❌ Request timed out after 6 minutes. The service may be slow or unavailable.`,
        edit: key
      }).catch(() => {});
    }
  }, STATUS_EDIT_2);

  return {
    key,
    async success(txt) {
      settled = true;
      clearTimeout(t1); clearTimeout(t2);
      await nimesha.sendMessage(m.chat, { text: txt, edit: key }).catch(() => {});
    },
    async error(txt) {
      settled = true;
      clearTimeout(t1); clearTimeout(t2);
      await nimesha.sendMessage(m.chat, { text: txt, edit: key }).catch(() => {});
    }
  };
}

module.exports = {
  video: async (nimesha, m, { text, prefix, command }) => {
    if (!text) return m.reply(`🎬 *Usage:* ${prefix + command} <url or query>\nQuality: add a number (e.g., .video 720 https://... )`);
    let input = text.trim();
    let quality = 'best';
    const qMatch = input.match(/^(2160|1440|1080|720|480|360|240)\s+/);
    if (qMatch) { quality = qMatch[1]; input = input.slice(qMatch[0].length).trim(); }
    let url = input;
    let searchMeta = null;
    if (!isUrl(url)) {
      const yts = require('yt-search');
      const sr = await yts(url);
      if (!sr.videos?.length) return m.reply('❌ No results');
      url = sr.videos[0].url;
      searchMeta = sr.videos[0];
    }
    const status = await createStatus(nimesha, m, `⏳ Downloading video (${quality === 'best' ? 'best' : quality + 'p'})...`);
    try {
      const files = await smartDownload(url, { audioOnly: false, quality });
      for (const fp of files) {
        const safe = await ensureUnderLimit(fp);
        const size = getFileSizeMB(safe);
        const title = searchMeta?.title || path.basename(safe);
        const caption = `🎬 *${title}*\n📦 ${size.toFixed(1)} MB`;
        await nimesha.sendMessage(m.chat, { video: fs.readFileSync(safe), caption }, { quoted: m });
        cleanupFile(fp);
      }
      await status.success('✅ Video sent!');
    } catch (err) { await status.error(`❌ ${err.message}`); }
  },

  song: async (nimesha, m, { text, prefix, command }) => {
    if (!text) return m.reply(`🎵 *Universal Audio Downloader*\n\nUsage: ${prefix + command} <query or url>`);
    let url = text.trim();
    let searchMeta = null;
    if (!isUrl(url)) {
      await m.reply(`🔍 Searching: *${text}*`);
      const yts = require('yt-search');
      const sr = await yts(text);
      if (!sr.videos?.length) return m.reply('❌ No results found');
      url = sr.videos[0].url;
      searchMeta = sr.videos[0];
    }
    const status = await createStatus(nimesha, m, '🎵 Downloading audio...');
    try {
      const files = await smartDownload(url, { audioOnly: true });
      for (const fp of files) {
        const safe = await ensureUnderLimit(fp);
        const title = searchMeta?.title || path.basename(safe).replace(/\.[^.]+$/, '');
        await nimesha.sendMessage(m.chat, { audio: fs.readFileSync(safe), mimetype: 'audio/mpeg', fileName: `${title}.mp3`, ptt: false }, { quoted: m });
        cleanupFile(fp);
      }
      await status.success(`✅ Audio sent! (${files.length} track${files.length > 1 ? 's' : ''})`);
    } catch (e) { await status.error(`❌ ${e.message}`); }
  },

  play: async (nimesha, m, { text, prefix, command }) => {
    if (!text) return m.reply(`Example: ${prefix + command} <query>`);
    const status = await createStatus(nimesha, m, '🎵 *Searching & Downloading...*');
    try {
      const yts = require('yt-search');
      const sr = await yts(text);
      if (!sr.videos?.length) throw new Error('No results');
      const video = sr.videos[0];
      const files = await smartDownload(video.url, { audioOnly: true });
      for (const fp of files) {
        const safe = await ensureUnderLimit(fp);
        const title = video.title || path.basename(safe).replace(/\.[^.]+$/, '');
        await nimesha.sendMessage(m.chat, {
          audio: fs.readFileSync(safe), mimetype: 'audio/mpeg', fileName: `${title}.mp3`, ptt: false,
          contextInfo: { externalAdReply: { title: video.title, body: video.author?.name || 'YouTube', thumbnailUrl: video.thumbnail, sourceUrl: video.url, mediaType: 2 } }
        }, { quoted: m });
        cleanupFile(fp);
      }
      await status.success(`✅ *${video.title}* sent!`);
    } catch (e) { await status.error(`❌ ${e.message}`); }
  },

  spotify: async (nimesha, m, { text, prefix, command }) => {
    if (!text) return m.reply(`🟢 *Usage:* ${prefix + command} <track/album/playlist url>`);
    if (!isUrl(text)) return m.reply('❌ Provide a valid Spotify URL');
    const status = await createStatus(nimesha, m, '🟢 Processing Spotify...');
    try {
      const files = await smartDownload(text.trim(), { audioOnly: true });
      for (const fp of files) {
        const safe = await ensureUnderLimit(fp);
        await nimesha.sendMessage(m.chat, { audio: fs.readFileSync(safe), mimetype: 'audio/mpeg', fileName: path.basename(safe) }, { quoted: m });
        cleanupFile(fp);
      }
      await status.success('✅ Spotify track(s) sent!');
    } catch (err) { await status.error(`❌ ${err.message}`); }
  },

  apk: async (nimesha, m, { text, prefix, command }) => {
    if (!text) return m.reply(`📱 *Usage:* ${prefix + command} <app name or URL>`);
    const status = await createStatus(nimesha, m, '📱 Searching APK...');
    let url = text.trim();
    if (!isUrl(url)) {
      try {
        const { fetchURLs } = require('../lib/downloader');
        const found = await fetchURLs(text, { site: 'apkpure.com', count: 3 });
        if (!found.length) return status.error('❌ No APK found');
        url = found[0];
      } catch (e) { return status.error(`❌ Search failed: ${e.message}`); }
    }
    try {
      const files = await smartDownload(url);
      for (const fp of files) {
        const safe = await ensureUnderLimit(fp);
        await nimesha.sendMessage(m.chat, { document: fs.readFileSync(safe), mimetype: 'application/vnd.android.package-archive', fileName: path.basename(safe) }, { quoted: m });
        cleanupFile(fp);
      }
      await status.success('✅ APK sent!');
    } catch (err) { await status.error(`❌ ${err.message}`); }
  },

  dl: async (nimesha, m, { text, prefix, command }) => {
    if (!text) return m.reply('📥 *Universal Downloader*\nUsage:\n' + prefix + 'dl <url> — single\n' + prefix + 'dl audio <url> — audio only\n' + prefix + 'dl 720 <url> — specific quality\n' + prefix + 'dl <url1> <url2> ... — bulk');
    let input = text.trim();
    let audioOnly = false;
    let quality = 'best';
    if (/^audio\s+/i.test(input)) { audioOnly = true; input = input.slice(6).trim(); }
    const qMatch = input.match(/^(2160|1440|1080|720|480|360|240)\s+/);
    if (qMatch) { quality = qMatch[1]; input = input.slice(qMatch[0].length).trim(); }
    const urls = extractURLs(input);
    if (!urls.length) return m.reply('❌ No valid URLs found.');
    const isBulk = urls.length > 1;
    const status = await createStatus(nimesha, m, isBulk ? `📦 Bulk download queued (${urls.length} URLs)...` : `⏳ Fetching ${urls[0].slice(0, 55)}...`);
    try {
      if (!isBulk) {
        const files = await smartDownload(urls[0], { audioOnly, quality });
        for (const fp of files) {
          const safe = await ensureUnderLimit(fp);
          const mime = guessMime(safe);
          const cap = `📥 ${getFileSizeMB(safe).toFixed(1)} MB`;
          if (mime.startsWith('video/')) await nimesha.sendMessage(m.chat, { video: fs.readFileSync(safe), caption: cap }, { quoted: m });
          else if (mime.startsWith('audio/')) await nimesha.sendMessage(m.chat, { audio: fs.readFileSync(safe), mimetype: 'audio/mpeg' }, { quoted: m });
          else if (mime.startsWith('image/')) await nimesha.sendMessage(m.chat, { image: fs.readFileSync(safe), caption: cap }, { quoted: m });
          else await nimesha.sendMessage(m.chat, { document: fs.readFileSync(safe), fileName: path.basename(safe) }, { quoted: m });
          cleanupFile(fp);
        }
      } else {
        const { results, errors } = await bulkDownload(urls, { audioOnly, quality });
        for (const { files } of results) {
          for (const fp of files) {
            const safe = await ensureUnderLimit(fp);
            const mime = guessMime(safe);
            if (mime.startsWith('video/')) await nimesha.sendMessage(m.chat, { video: fs.readFileSync(safe) }, { quoted: m });
            else if (mime.startsWith('audio/')) await nimesha.sendMessage(m.chat, { audio: fs.readFileSync(safe), mimetype: 'audio/mpeg' }, { quoted: m });
            else await nimesha.sendMessage(m.chat, { document: fs.readFileSync(safe), fileName: path.basename(safe) }, { quoted: m });
            cleanupFile(fp);
          }
        }
        if (errors.length) await m.reply(`❌ Failed: ${errors.map(e => e.url).join(', ')}`);
      }
      await status.success('✅ Download complete!');
    } catch (err) { await status.error(`❌ ${err.message}`); }
  },

  fetch: async (nimesha, m, { text, prefix, command, db }) => {
    if (!text) return m.reply('🔍 *Usage:* `.fetch <query>` — finds downloadable URLs\n`.fetch 20 cats` — limit to 20 URLs\n`.fetch site:youtube.com 5 lofi` — scoped');
    let count = 10;
    let query = text.trim();
    const countMatch = query.match(/^(\d+)\s+/);
    if (countMatch) { count = Math.min(parseInt(countMatch[1], 10), 50); query = query.slice(countMatch[0].length).trim(); }
    let site = null;
    const siteMatch = query.match(/^site:(\S+)\s+/i);
    if (siteMatch) { site = siteMatch[1]; query = query.slice(siteMatch[0].length).trim(); }
    const status = await createStatus(nimesha, m, `🔍 Searching for ${count} URLs: "${query}"...`);
    try {
      const { fetchURLs } = require('../lib/downloader');
      const urls = await fetchURLs(query, { count, site });
      if (!urls.length) return status.error('❌ No URLs found.');
      const list = urls.map((u, i) => `${i + 1}. ${u.slice(0, 70)}`).join('\n');
      if (db) {
        if (!db.fetchedURLs) db.fetchedURLs = {};
        db.fetchedURLs[m.sender] = urls;
      }
      await status.success(`✅ Found ${urls.length} URLs:\n\n${list}\n\n_Send ${prefix}dlall to download all._`);
    } catch (err) { await status.error(`❌ Search failed: ${err.message}`); }
  },

  dlall: async (nimesha, m, { text, prefix, command, db }) => {
    const urls = db?.fetchedURLs?.[m.sender];
    if (!urls || !urls.length) return m.reply(`⚠️ No fetched URLs. Run ${prefix}fetch first.`);
    const audioOnly = /audio|mp3/i.test(text);
    const status = await createStatus(nimesha, m, `📦 Downloading ${urls.length} URLs...`);
    try {
      const { results, errors } = await bulkDownload(urls, { audioOnly });
      for (const { files } of results) {
        for (const fp of files) {
          const safe = await ensureUnderLimit(fp);
          const mime = guessMime(safe);
          if (mime.startsWith('video/')) await nimesha.sendMessage(m.chat, { video: fs.readFileSync(safe) }, { quoted: m });
          else if (mime.startsWith('audio/')) await nimesha.sendMessage(m.chat, { audio: fs.readFileSync(safe), mimetype: 'audio/mpeg' }, { quoted: m });
          else await nimesha.sendMessage(m.chat, { document: fs.readFileSync(safe), fileName: path.basename(safe) }, { quoted: m });
          cleanupFile(fp);
        }
      }
      if (db?.fetchedURLs) delete db.fetchedURLs[m.sender];
      await status.success(`✅ Done! ${results.length} succeeded${errors.length ? `, ${errors.length} failed` : ''}`);
    } catch (err) { await status.error(`❌ ${err.message}`); }
  },

  tiktok: async (nimesha, m, { text, prefix, command }) => {
    let audioOnly = /^audio\s/i.test(text);
    let inputText = audioOnly ? text.slice(6).trim() : text;
    const urls = extractURLs(inputText);
    if (!urls.length) return m.reply('🎵 *TikTok Downloader*\n`' + prefix + 'tt <url>` — video\n`' + prefix + 'tt audio <url>` — audio only\n`' + prefix + 'tt <url1> <url2>…` — bulk');
    const status = await createStatus(nimesha, m, `⏳ TikTok download${urls.length > 1 ? ` ×${urls.length}` : ''}…`);
    let sent = 0, failed = [];
    for (const url of urls) {
      try {
        const files = await smartDownload(url, { audioOnly, onProgress: async (msg) => { await nimesha.sendMessage(m.chat, { text: `⏳ ${msg.slice(0, 100)}`, edit: status.key }).catch(() => {}); } });
        for (const fp of files) { await sendFile(nimesha, m, fp, '🎵 TikTok'); sent++; }
      } catch (e) { failed.push({ url, error: e.message }); }
    }
    await status.success(`✅ ${sent} file(s) sent${failed.length ? ` · ${failed.length} failed` : ''}`);
    if (failed.length) await m.reply(`❌ Failed:\n${failed.map(f => f.error.slice(0, 80)).join('\n')}`);
  },

  instagram: async (nimesha, m, { text, prefix, command }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply('📸 *Usage:* `' + prefix + 'ig <url>` — reels, posts, carousels, stories');
    const status = await createStatus(nimesha, m, `📸 Fetching Instagram (${urls.length} URL${urls.length > 1 ? 's' : ''})…`);
    let sent = 0, failed = [];
    for (const url of urls) {
      try {
        const files = await smartDownload(url, { onProgress: async (msg) => { await nimesha.sendMessage(m.chat, { text: `📸 ${msg.slice(0, 100)}`, edit: status.key }).catch(() => {}); } });
        for (const fp of files) { await sendFile(nimesha, m, fp, '📸 Instagram'); sent++; }
      } catch (e) { failed.push({ url, error: e.message }); }
    }
    await status.success(`✅ ${sent} sent${failed.length ? ` · ${failed.length} failed` : ''}`);
    if (failed.length) await m.reply(`❌ ${failed.map(f => f.error.slice(0, 80)).join('\n')}`);
  },

  twitter: async (nimesha, m, { text, prefix, command }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply('🐦 *Usage:* `' + prefix + 'tw <url>`');
    const status = await createStatus(nimesha, m, '🐦 Twitter/X media…');
    let sent = 0, failed = [];
    for (const url of urls) {
      try {
        const files = await smartDownload(url, { onProgress: async (msg) => { await nimesha.sendMessage(m.chat, { text: `🐦 ${msg.slice(0, 100)}`, edit: status.key }).catch(() => {}); } });
        for (const fp of files) { await sendFile(nimesha, m, fp, '🐦 Twitter/X'); sent++; }
      } catch (e) { failed.push({ url, error: e.message }); }
    }
    await status.success(`✅ ${sent} sent${failed.length ? ` · ${failed.length} failed` : ''}`);
    if (failed.length) await m.reply(`❌ ${failed.map(f => f.error.slice(0, 80)).join('\n')}`);
  },

  facebook: async (nimesha, m, { text, prefix, command }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply('👤 *Usage:* `' + prefix + 'fb <url>`');
    const status = await createStatus(nimesha, m, '👤 Facebook video…');
    let sent = 0, failed = [];
    for (const url of urls) {
      try {
        const files = await smartDownload(url, { onProgress: async (msg) => { await nimesha.sendMessage(m.chat, { text: `👤 ${msg.slice(0, 100)}`, edit: status.key }).catch(() => {}); } });
        for (const fp of files) { await sendFile(nimesha, m, fp, '👤 Facebook'); sent++; }
      } catch (e) { failed.push({ url, error: e.message }); }
    }
    await status.success(`✅ ${sent} sent${failed.length ? ` · ${failed.length} failed` : ''}`);
    if (failed.length) await m.reply(`❌ ${failed.map(f => f.error.slice(0, 80)).join('\n')}`);
  },

  soundcloud: async (nimesha, m, { text, prefix, command }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply('🔊 *Usage:* `' + prefix + 'sc <url>` — track or playlist');
    const status = await createStatus(nimesha, m, '🔊 SoundCloud…');
    let sent = 0, failed = [];
    for (const url of urls) {
      try {
        const files = await smartDownload(url, { audioOnly: true, onProgress: async (msg) => { await nimesha.sendMessage(m.chat, { text: `🔊 ${msg.slice(0, 100)}`, edit: status.key }).catch(() => {}); } });
        for (const fp of files) { await sendFile(nimesha, m, fp, '🔊 SoundCloud'); sent++; }
      } catch (e) { failed.push({ url, error: e.message }); }
    }
    await status.success(`✅ ${sent} sent${failed.length ? ` · ${failed.length} failed` : ''}`);
    if (failed.length) await m.reply(`❌ ${failed.map(f => f.error.slice(0, 80)).join('\n')}`);
  },

  gdrive: async (nimesha, m, { text, prefix, command }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply('📁 *Usage:* `' + prefix + 'gd <url>`');
    const status = await createStatus(nimesha, m, '📁 Google Drive…');
    try {
      const files = await smartDownload(urls[0]);
      for (const fp of files) await sendFile(nimesha, m, fp, '📁 GDrive');
      await status.success('✅ Done!');
    } catch (err) { await status.error(`❌ ${err.message.slice(0, 200)}`); }
  },

  mediafire: async (nimesha, m, { text, prefix, command }) => {
    const urls = extractURLs(text);
    if (!urls.length) return m.reply('📦 *Usage:* `' + prefix + 'mf <url>`');
    const status = await createStatus(nimesha, m, '📦 MediaFire…');
    try {
      const files = await smartDownload(urls[0]);
      for (const fp of files) await sendFile(nimesha, m, fp, '📦 MediaFire');
      await status.success('✅ Done!');
    } catch (err) { await status.error(`❌ ${err.message.slice(0, 200)}`); }
  },

  related: async (nimesha, m, { text, prefix, command, db }) => {
    if (!text) return m.reply('🔗 *Find Related Content*\n\n`' + prefix + 'related <url>` — find 10 similar\n`' + prefix + 'related 20 <url>` — find 20 similar\n`' + prefix + 'related 15 <url> amapiano` — with extra keywords\n\n_Works on TikTok, YouTube, SoundCloud, Instagram, and any site._\n_After fetching, send ' + prefix + 'dlall to download them all._');
    let count = 10;
    let inputText = text;
    let extraQuery = '';
    const countMatch = inputText.match(/^(\d+)\s+/);
    if (countMatch) { count = Math.min(parseInt(countMatch[1], 10), 50); inputText = inputText.slice(countMatch[0].length).trim(); }
    const exampleURLs = extractURLs(inputText);
    if (!exampleURLs.length) return m.reply('❌ Please include a URL as the example.\n_e.g. `' + prefix + 'related https://tiktok.com/…`_');
    const exampleURL = exampleURLs[0];
    const afterURL = inputText.replace(exampleURL, '').trim();
    if (afterURL) extraQuery = afterURL;
    const status = await createStatus(nimesha, m, `🔗 Analysing example and searching for *${count}* similar…`);
    try {
      const { fetchRelated } = require('../lib/downloader');
      const { platform, query, urls } = await fetchRelated(exampleURL, { count, extraQuery });
      if (!urls.length) return status.error('❌ Could not find related content. Try `' + prefix + 'related <url> <extra keywords>`');
      if (db) {
        if (!db.fetchedURLs) db.fetchedURLs = {};
        db.fetchedURLs[m.sender] = urls;
      }
      const listText = urls.map((u, i) => `${i + 1}. \`${u.slice(0, 65)}\``).join('\n');
      await status.success(`🔗 *${urls.length} related found* [${platform}]\n_Query used: "${query.slice(0, 60)}"_\n\n${listText}\n\n_Send ${prefix}dlall to download all of them_`);
    } catch (err) { await status.error(`❌ Related search failed: ${err.message.slice(0, 200)}`); }
  },

  // aliases
  mp4: async (nimesha, m, ctx) => { await module.exports.video(nimesha, m, ctx); },
  mp3: async (nimesha, m, ctx) => { await module.exports.song(nimesha, m, ctx); },
  music: async (nimesha, m, ctx) => { await module.exports.song(nimesha, m, ctx); },
  audio: async (nimesha, m, ctx) => { await module.exports.song(nimesha, m, ctx); },
  ytmp4: async (nimesha, m, ctx) => { await module.exports.video(nimesha, m, ctx); },
  ytmp3: async (nimesha, m, ctx) => { await module.exports.song(nimesha, m, ctx); },
  yt: async (nimesha, m, ctx) => { await module.exports.video(nimesha, m, ctx); },
  ytvideo: async (nimesha, m, ctx) => { await module.exports.video(nimesha, m, ctx); },
  ytaudio: async (nimesha, m, ctx) => { await module.exports.song(nimesha, m, ctx); },
  play2: async (nimesha, m, ctx) => { await module.exports.play(nimesha, m, ctx); },
  yplay: async (nimesha, m, ctx) => { await module.exports.play(nimesha, m, ctx); },
  sp: async (nimesha, m, ctx) => { await module.exports.spotify(nimesha, m, ctx); },
  spot: async (nimesha, m, ctx) => { await module.exports.spotify(nimesha, m, ctx); },
  vid: async (nimesha, m, ctx) => { await module.exports.video(nimesha, m, ctx); },
  tt: async (nimesha, m, ctx) => { await module.exports.tiktok(nimesha, m, ctx); },
  tik: async (nimesha, m, ctx) => { await module.exports.tiktok(nimesha, m, ctx); },
  ig: async (nimesha, m, ctx) => { await module.exports.instagram(nimesha, m, ctx); },
  insta: async (nimesha, m, ctx) => { await module.exports.instagram(nimesha, m, ctx); },
  reel: async (nimesha, m, ctx) => { await module.exports.instagram(nimesha, m, ctx); },
  tw: async (nimesha, m, ctx) => { await module.exports.twitter(nimesha, m, ctx); },
  x: async (nimesha, m, ctx) => { await module.exports.twitter(nimesha, m, ctx); },
  fb: async (nimesha, m, ctx) => { await module.exports.facebook(nimesha, m, ctx); },
  sc: async (nimesha, m, ctx) => { await module.exports.soundcloud(nimesha, m, ctx); },
  gd: async (nimesha, m, ctx) => { await module.exports.gdrive(nimesha, m, ctx); },
  mf: async (nimesha, m, ctx) => { await module.exports.mediafire(nimesha, m, ctx); },
  find: async (nimesha, m, ctx) => { await module.exports.fetch(nimesha, m, ctx); },
  downloadall: async (nimesha, m, ctx) => { await module.exports.dlall(nimesha, m, ctx); },
  getall: async (nimesha, m, ctx) => { await module.exports.dlall(nimesha, m, ctx); },
  similar: async (nimesha, m, ctx) => { await module.exports.related(nimesha, m, ctx); },
  like: async (nimesha, m, ctx) => { await module.exports.related(nimesha, m, ctx); },
};