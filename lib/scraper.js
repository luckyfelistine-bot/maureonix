const { exec } = require('child_process');
const fetch = require('node-fetch');

function run(cmd, timeout = 60000) {
  return new Promise((res, rej) => {
    const child = exec(cmd, { maxBuffer: 1024 * 1024 * 500 }, (err, stdout) => {
      if (err) return rej(err);
      res(stdout.trim());
    });
    setTimeout(() => { try { child.kill(); } catch {} rej(new Error('timeout')); }, timeout);
  });
}

// ─── YOUTUBE ────────────────────────────────────────
async function ytMp3(url) {
  const id = url.match(/(?:v=|youtu\.be\/|shorts\/)([^\&\n?#]+)/)?.[1];
  const info = await fetch(`https://www.youtube.com/oembed?url=https://youtu.be/${id}&format=json`).then(r => r.json());
  const methods = [
    () => run(`yt-dlp --no-warnings -f "bestaudio[ext=m4a]" --get-url "${url}"`, 30000),
    () => run(`yt-dlp --no-warnings -f "bestaudio" --extractor-args "youtube:player_client=android" --get-url "${url}"`, 30000),
    async () => {
      const r = await fetch('https://api.cobalt.tools/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, downloadMode: 'audio', audioFormat: 'mp3' })
      });
      const d = await r.json();
      if (d.url) return d.url;
      throw new Error('cobalt fail');
    }
  ];
  for (const m of methods) { try { const u = await m(); if (u) return { title: info.title, url: u, thumb: `https://img.youtube.com/vi/${id}/maxresdefault.jpg` }; } catch {} }
  throw new Error('All YT MP3 methods failed');
}

async function ytMp4(url, quality = '720') {
  const id = url.match(/(?:v=|youtu\.be\/|shorts\/)([^\&\n?#]+)/)?.[1];
  const info = await fetch(`https://www.youtube.com/oembed?url=https://youtu.be/${id}&format=json`).then(r => r.json());
  const methods = [
    () => run(`yt-dlp --no-warnings -f "best[height<=${quality}][ext=mp4]" --get-url "${url}"`, 30000),
    () => run(`yt-dlp --no-warnings -f "best" --get-url "${url}"`, 30000),
    async () => {
      const r = await fetch('https://api.cobalt.tools/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, downloadMode: 'auto', videoQuality: quality })
      });
      const d = await r.json();
      if (d.url) return d.url;
      throw new Error('cobalt fail');
    }
  ];
  for (const m of methods) { try { const u = await m(); if (u) return { title: info.title, url: u, thumb: `https://img.youtube.com/vi/${id}/maxresdefault.jpg` }; } catch {} }
  throw new Error('All YT MP4 methods failed');
}

// ─── TIKTOK ─────────────────────────────────────────
async function tiktokDownload(url) {
  const methods = [
    async () => {
      const r = await fetch('https://tikwm.com/api/', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ url, hd: '1' })
      });
      const d = await r.json();
      if (d.data?.play) return { type: 'video', url: d.data.play, title: d.data.title };
      throw new Error('no video');
    },
    async () => {
      const r = await fetch('https://api.tikmate.app/api/lookup', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ url })
      });
      const d = await r.json();
      if (d.token && d.id) return { type: 'video', url: `https://api.tikmate.app/api/download?id=${d.id}&token=${d.token}&hd=1` };
      throw new Error('no video');
    }
  ];
  for (const m of methods) { try { return await m(); } catch {} }
  throw new Error('TikTok failed');
}

// ─── INSTAGRAM ──────────────────────────────────────
async function igDownload(url) {
  const methods = [
    async () => {
      const r = await fetch('https://v3.saveig.app/api/ajaxSearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
        body: new URLSearchParams({ q: url, t: 'media', lang: 'en' })
      });
      const d = await r.json();
      const links = [...(d.data || '').matchAll(/href="(https:\/\/[^"]+\.(mp4|jpg))"/g)].map(m => m[1]);
      if (links.length === 1) return { type: links[0].includes('.mp4') ? 'video' : 'image', url: links[0] };
      if (links.length > 1) return { type: 'album', items: links.map(l => ({ url: l, is_video: l.includes('.mp4') })) };
      throw new Error('no links');
    }
  ];
  for (const m of methods) { try { return await m(); } catch {} }
  throw new Error('Instagram failed');
}

// ─── FACEBOOK ───────────────────────────────────────
async function fbDownload(url) {
  const r = await fetch('https://getfvid.com/downloader', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ url })
  });
  const html = await r.text();
  const hd = html.match(/href="(https:\/\/video[^"]+)" [^>]*>HD/)?.[1];
  const sd = html.match(/href="(https:\/\/video[^"]+)" [^>]*>SD/)?.[1];
  if (!hd && !sd) throw new Error('No FB link');
  return { hd, sd, url: hd || sd };
}

// ─── TWITTER/X ──────────────────────────────────────
async function twitterDownload(url) {
  const r = await fetch(`https://twitsave.com/info?url=${encodeURIComponent(url)}`);
  const html = await r.text();
  const video = html.match(/href="(https:\/\/video\.twimg\.com[^"]+)"/)?.[1];
  if (!video) throw new Error('No Twitter video');
  return { url: video };
}

// ─── SPOTIFY ────────────────────────────────────────
async function spotifyDownload(url) {
    try {
        const apiUrl = `https://api.spotify-downloader.com/download?url=${encodeURIComponent(url)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        if (data.success && data.downloadUrl) {
            return { url: data.downloadUrl, title: data.metadata?.title, artist: data.metadata?.artists };
        }
        throw new Error('No download URL');
    } catch (e) {
        // Fallback to yt-dlp
        const out = await run(`yt-dlp -f bestaudio --get-url "${url}"`);
        return { url: out.trim().split('\n')[0] };
    }
}

// ─── ADDITIONAL PLATFORMS ───────────────────────────
async function pinterestDownload(url) {
  const r = await fetch(`https://www.savepin.app/download.php?url=${encodeURIComponent(url)}&format=mp4`);
  const html = await r.text();
  const video = html.match(/href="(https:\/\/v\.pinimg\.com[^"]+)"/)?.[1];
  const image = html.match(/href="(https:\/\/i\.pinimg\.com[^"]+)"/)?.[1];
  if (video) return { type: 'video', url: video };
  if (image) return { type: 'image', url: image };
  throw new Error('Pinterest failed');
}

async function redditDownload(url) {
  const jsonUrl = url.replace(/\/$/, '') + '.json';
  const r = await fetch(jsonUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const data = await r.json();
  const media = data[0]?.data?.children[0]?.data?.media?.reddit_video?.fallback_url;
  const img = data[0]?.data?.children[0]?.data?.url_overridden_by_dest;
  if (media) return { type: 'video', url: media };
  if (img && /\.(jpg|jpeg|png|gif)/.test(img)) return { type: 'image', url: img };
  throw new Error('Reddit failed');
}

async function soundcloudDownload(url) {
  const r = await fetch(`https://api.soundcloud.com/resolve?url=${encodeURIComponent(url)}&client_id=YOUR_CLIENT_ID`);
  const d = await r.json();
  // Requires auth; placeholder for expansion
  throw new Error('SoundCloud requires OAuth setup');
}

async function mediafireDownload(url) {
  const r = await fetch(url);
  const html = await r.text();
  const dl = html.match(/href="(https:\/\/download[^"]+)"/)?.[1] || html.match(/id="downloadButton".*href="([^"]+)"/)?.[1];
  if (!dl) throw new Error('MediaFire failed');
  return { url: dl };
}

async function apkDownload(pkg) {
  const r = await fetch(`https://d.apkpure.com/b/APK/${pkg}?version=latest`);
  if (r.status !== 200) throw new Error('APK not found');
  return { url: r.url, buffer: await r.buffer() };
}

module.exports = {
  ytMp3, ytMp4, tiktokDownload, igDownload, fbDownload,
  twitterDownload, spotifyDownload, pinterestDownload,
  redditDownload, soundcloudDownload, mediafireDownload, apkDownload
};