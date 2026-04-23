const axios = require('axios');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execAsync = promisify(exec);

// ==================== YT-DLP ULTIMATE FALLBACK ====================
const YTDL_TIMEOUT = 60000;

async function ytdlpFallback(url, type = 'video', quality = 'best') {
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const id = Date.now();
    const outPath = path.join(tmpDir, `dl_${id}.${type === 'audio' ? 'mp3' : 'mp4'}`);
    
    const format = type === 'audio' 
        ? '-f bestaudio --extract-audio --audio-format mp3 --audio-quality 0' 
        : `-f "best[height<=720]/best"`;
    
    const cmd = `yt-dlp ${format} --no-playlist --no-warnings -o "${outPath}" "${url}"`;
    
    try {
        await execAsync(cmd, { timeout: YTDL_TIMEOUT });
        if (fs.existsSync(outPath)) {
            const stats = fs.statSync(outPath);
            if (stats.size > 0) return { url: outPath, local: true, title: 'Downloaded via yt-dlp' };
        }
    } catch (e) { /* fallback will catch */ }
    throw new Error('yt-dlp failed');
}

// ==================== YOUTUBE MP3 ====================
async function ytMp3(url) {
    // Try API 1
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data?.dl) return { url: data.data.dl, title: data.data.title };
    } catch (e) {}
    
    // Try API 2
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 'success' && data.url) return { url: data.url, title: data.title || 'YouTube Audio' };
    } catch (e) {}
    
    // Try API 3
    try {
        const { data } = await axios.get(`https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 200 && data.data?.downloadUrl) return { url: data.data.downloadUrl, title: data.data.title };
    } catch (e) {}
    
    // Ultimate fallback: yt-dlp
    return await ytdlpFallback(url, 'audio');
}

// ==================== YOUTUBE MP4 ====================
async function ytMp4(url) {
    // Try API 1
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data?.dl) return { url: data.data.dl, title: data.data.title };
    } catch (e) {}
    
    // Try API 2
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 'success' && data.url) return { url: data.url, title: data.title || 'YouTube Video' };
    } catch (e) {}
    
    // Try API 3
    try {
        const { data } = await axios.get(`https://api.agatz.xyz/api/ytmp4?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 200 && data.data?.downloadUrl) return { url: data.data.downloadUrl, title: data.data.title };
    } catch (e) {}
    
    // Ultimate fallback
    return await ytdlpFallback(url, 'video');
}

// ==================== TIKTOK ====================
async function tiktokDownload(url) {
    // Try API 1
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data) {
            const d = data.data;
            if (d.video) return { type: 'video', url: d.video, title: d.title };
            if (d.images) return { type: 'images', items: d.images, title: d.title };
        }
    } catch (e) {}
    
    // Try API 2
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/tiktok?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 'success') {
            if (data.video) return { type: 'video', url: data.video, title: data.title };
            if (data.images) return { type: 'images', items: data.images, title: data.title };
        }
    } catch (e) {}
    
    // Try API 3
    try {
        const { data } = await axios.get(`https://api.agatz.xyz/api/tiktok?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 200) {
            if (data.data?.video) return { type: 'video', url: data.data.video, title: data.data.title };
            if (data.data?.images) return { type: 'images', items: data.data.images, title: data.data.title };
        }
    } catch (e) {}
    
    // Try API 4
    try {
        const { data } = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.code === 0) {
            if (data.data?.images) return { type: 'images', items: data.data.images.map(i => i + '.jpeg'), title: data.data.title };
            return { type: 'video', url: data.data.play, title: data.data.title };
        }
    } catch (e) {}
    
    throw new Error('All TikTok APIs failed');
}

// ==================== INSTAGRAM ====================
async function igDownload(url) {
    // Try API 1
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data?.length) {
            if (data.data.length === 1) return { type: data.data[0].type, url: data.data[0].url };
            return { items: data.data.map(i => ({ is_video: i.type === 'video', url: i.url })) };
        }
    } catch (e) {}
    
    // Try API 2
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 'success') {
            if (Array.isArray(data.data)) {
                if (data.data.length === 1) return { type: data.data[0].type, url: data.data[0].url };
                return { items: data.data.map(i => ({ is_video: i.type === 'video', url: i.url })) };
            }
        }
    } catch (e) {}
    
    // Try API 3
    try {
        const { data } = await axios.get(`https://api.agatz.xyz/api/instagram?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 200 && data.data?.url) {
            return { type: 'video', url: data.data.url };
        }
    } catch (e) {}
    
    // Try API 4 - savefrom
    try {
        const { data } = await axios.get(`https://worker-curly-tooth-d464.cuongtran.space/savefrom?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data?.url?.[0]?.url) return { type: 'video', url: data.url[0].url };
    } catch (e) {}
    
    throw new Error('All Instagram APIs failed');
}

// ==================== FACEBOOK ====================
async function fbDownload(url) {
    // Try API 1
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/fbdl?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data?.hd) return { hd: data.data.hd, sd: data.data.sd };
    } catch (e) {}
    
    // Try API 2
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/fbdl?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 'success') return { hd: data.hd || data.url, sd: data.sd || data.url };
    } catch (e) {}
    
    // Try API 3
    try {
        const { data } = await axios.get(`https://api.agatz.xyz/api/facebook?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 200 && data.data?.url) return { hd: data.data.url, sd: data.data.url };
    } catch (e) {}
    
    // yt-dlp fallback
    const res = await ytdlpFallback(url, 'video');
    return { hd: res.url, sd: res.url };
}

// ==================== TWITTER / X ====================
async function twitterDownload(url) {
    // Try API 1
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/twitter?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data?.url) return { url: data.data.url, title: data.data.desc };
    } catch (e) {}
    
    // Try API 2
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/twitter?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 'success' && data.url) return { url: data.url, title: data.title || 'Twitter Video' };
    } catch (e) {}
    
    // Try API 3
    try {
        const { data } = await axios.get(`https://api.agatz.xyz/api/twitter?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 200 && data.data?.url) return { url: data.data.url, title: data.data.title };
    } catch (e) {}
    
    // yt-dlp fallback
    const res = await ytdlpFallback(url, 'video');
    return { url: res.url, title: 'Twitter Video' };
}

// ==================== SPOTIFY ====================
async function spotifyDownload(url) {
    // Try API 1
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data?.url) return { url: data.data.url, title: data.data.title };
    } catch (e) {}
    
    // Try API 2
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/spotify?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 'success' && data.url) return { url: data.url, title: data.title || 'Spotify Track' };
    } catch (e) {}
    
    // Try API 3
    try {
        const { data } = await axios.get(`https://api.agatz.xyz/api/spotify?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 200 && data.data?.downloadUrl) return { url: data.data.downloadUrl, title: data.data.title };
    } catch (e) {}
    
    throw new Error('All Spotify APIs failed');
}

// ==================== PINTEREST ====================
async function pinterestDownload(url) {
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data?.url) return { type: data.data.type || 'image', url: data.data.url, title: data.data.title };
    } catch (e) {}
    
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/pinterest?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 'success') return { type: data.type || 'image', url: data.url, title: data.title };
    } catch (e) {}
    
    // Scrape fallback
    try {
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 });
        const $ = cheerio.load(data);
        const vid = $('video').attr('src');
        const img = $('img[srcset]').first().attr('src') || $('img').first().attr('src');
        if (vid) return { type: 'video', url: vid };
        if (img) return { type: 'image', url: img };
    } catch (e) {}
    
    throw new Error('Pinterest download failed');
}

// ==================== REDDIT ====================
async function redditDownload(url) {
    try {
        const jsonUrl = url.replace(/\/?$/, '.json');
        const { data } = await axios.get(jsonUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 });
        const post = data[0].data.children[0].data;
        const media = post.secure_media?.reddit_video?.fallback_url || post.url;
        const isVideo = !!post.secure_media?.reddit_video;
        return { url: media, title: post.title, isVideo };
    } catch (e) {
        throw new Error('Reddit download failed');
    }
}

// ==================== SOUNDCLOUD ====================
async function soundcloudDownload(url) {
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/soundcloud?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data?.url) return { url: data.data.url, title: data.data.title };
    } catch (e) {}
    
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/soundcloud?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 'success' && data.url) return { url: data.url, title: data.title };
    } catch (e) {}
    
    throw new Error('SoundCloud download failed');
}

// ==================== THREADS ====================
async function threadsDownload(url) {
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/threads?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data?.url) return { type: data.data.type || 'image', url: data.data.url, title: data.data.title };
    } catch (e) {}
    
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/threads?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 'success') return { type: data.type || 'image', url: data.url, title: data.title };
    } catch (e) {}
    
    throw new Error('Threads download failed');
}

// ==================== CAPCUT ====================
async function capcutDownload(url) {
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/capcut?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data?.url) return { url: data.data.url, title: data.data.title };
    } catch (e) {}
    
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/capcut?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 'success' && data.url) return { url: data.url, title: data.title };
    } catch (e) {}
    
    throw new Error('CapCut download failed');
}

// ==================== LIKEE ====================
async function likeeDownload(url) {
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/likee?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data?.url) return { url: data.data.url, title: data.data.title };
    } catch (e) {}
    
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/likee?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 'success' && data.url) return { url: data.url, title: data.title };
    } catch (e) {}
    
    throw new Error('Likee download failed');
}

// ==================== SNAPCHAT ====================
async function snapchatDownload(url) {
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/snapchat?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data?.url) return { url: data.data.url, title: data.data.title };
    } catch (e) {}
    
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/snapchat?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 'success' && data.url) return { url: data.url, title: data.title };
    } catch (e) {}
    
    throw new Error('Snapchat download failed');
}

// ==================== VIMEO ====================
async function vimeoDownload(url) {
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/vimeo?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data?.url) return { url: data.data.url, title: data.data.title };
    } catch (e) {}
    
    // yt-dlp fallback
    const res = await ytdlpFallback(url, 'video');
    return { url: res.url, title: 'Vimeo Video' };
}

// ==================== DAILYMOTION ====================
async function dailymotionDownload(url) {
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/dailymotion?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data?.url) return { url: data.data.url, title: data.data.title };
    } catch (e) {}
    
    // yt-dlp fallback
    const res = await ytdlpFallback(url, 'video');
    return { url: res.url, title: 'Dailymotion Video' };
}

// ==================== MEDIAFIRE ====================
async function mediafireDownload(url) {
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/mediafire?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status && data.data?.link) return { url: data.data.link, filename: data.data.filename, mimetype: data.data.mimetype || 'application/octet-stream' };
    } catch (e) {}
    
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/mediafire?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (data.status === 'success' && data.url) return { url: data.url, filename: data.filename, mimetype: 'application/octet-stream' };
    } catch (e) {}
    
    // Scrape fallback
    try {
        const { data } = await axios.get(url, { timeout: 15000 });
        const $ = cheerio.load(data);
        const link = $('a#downloadButton').attr('href');
        const fname = $('div.dl-btn-label').text().trim() || 'file';
        if (link) return { url: link, filename: fname, mimetype: 'application/octet-stream' };
    } catch (e) {}
    
    throw new Error('MediaFire download failed');
}

// ==================== GOOGLE DRIVE ====================
async function gdriveDownload(url) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (!match) throw new Error('Invalid Google Drive URL');
    const id = match[1];
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;
    return { url: downloadUrl, filename: `gdrive_file_${id}`, mimetype: 'application/octet-stream' };
}

// ==================== APK DOWNLOADER ====================
async function apkDownload(query) {
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/apk/search?q=${encodeURIComponent(query)}`, { timeout: 15000 });
        if (data.status && data.data?.length) {
            const app = data.data[0];
            const dl = await axios.get(`https://api.siputzx.my.id/api/apk/download?id=${app.id}`, { timeout: 15000 });
            if (dl.data.status && dl.data.data?.downloadLink) return { url: dl.data.data.downloadLink, name: app.name };
        }
    } catch (e) {}
    
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/search/apk?query=${encodeURIComponent(query)}`, { timeout: 15000 });
        if (data.status === 'success' && data.data?.length) {
            const app = data.data[0];
            return { url: app.download, name: app.name };
        }
    } catch (e) {}
    
    throw new Error('APK not found');
}

module.exports = {
    ytMp3, ytMp4, tiktokDownload, igDownload, fbDownload,
    twitterDownload, spotifyDownload, pinterestDownload,
    redditDownload, soundcloudDownload, threadsDownload,
    capcutDownload, likeeDownload, snapchatDownload,
    vimeoDownload, dailymotionDownload, mediafireDownload,
    gdriveDownload, apkDownload, ytdlpFallback
};