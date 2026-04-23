const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const youtubedl = require('youtube-dl-exec');

const API_TIMEOUT = 20000;

const isValidUrl = (url) => {
    try { new URL(url); return true; } catch { return false; }
};

const delay = ms => new Promise(r => setTimeout(r, ms));

// ═══════════════════════════════════════════════════════════════
//  YOUTUBE - PRIMARY: youtube-dl-exec (auto-manages yt-dlp)
//  FALLBACK: Cobalt API
// ═══════════════════════════════════════════════════════════════
async function ytDownload(url, type = 'audio') {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    
    const id = Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const ext = type === 'audio' ? 'mp3' : 'mp4';
    const outPath = path.join(tmpDir, `dl_${id}.${ext}`);
    
    try {
        const format = type === 'audio' 
            ? 'bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio'
            : 'best[height<=720][ext=mp4]/best[height<=720]/best';
        
        const extractAudio = type === 'audio';
        
        await youtubedl(url, {
            output: outPath,
            format: format,
            noPlaylist: true,
            noWarnings: true,
            extractAudio: extractAudio,
            audioFormat: extractAudio ? 'mp3' : undefined,
            audioQuality: extractAudio ? 0 : undefined,
            ffmpegLocation: 'ffmpeg',
            addHeader: [
                'referer:youtube.com',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            ]
        });
        
        if (fs.existsSync(outPath) && fs.statSync(outPath).size > 2048) {
            return { 
                url: outPath, 
                local: true, 
                title: 'YouTube ' + (type === 'audio' ? 'Audio' : 'Video'),
                size: fs.statSync(outPath).size 
            };
        }
    } catch (e) {
        console.log('youtube-dl-exec failed:', e.message);
        try { fs.unlinkSync(outPath); } catch {}
    }
    
    // Fallback: Cobalt API
    try {
        const cobaltUrl = 'https://api.cobalt.tools/api/json';
        const res = await axios.post(cobaltUrl, {
            url: url,
            isAudioOnly: type === 'audio',
            filenamePattern: 'basic'
        }, {
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: API_TIMEOUT
        });
        
        if (res.data?.url) {
            return { url: res.data.url, local: false, title: 'YouTube ' + (type === 'audio' ? 'Audio' : 'Video') };
        }
        if (res.data?.picker) {
            return { url: res.data.picker[0]?.url, local: false, title: 'YouTube Video' };
        }
    } catch (e) {
        console.log('Cobalt fallback failed:', e.message);
    }
    
    throw new Error('All YouTube download methods failed. The video may be age-restricted or unavailable.');
}

async function ytMp3(url) {
    return ytDownload(url, 'audio');
}

async function ytMp4(url) {
    return ytDownload(url, 'video');
}

// ═══════════════════════════════════════════════════════════════
//  FETCH HELPER
// ═══════════════════════════════════════════════════════════════
async function fetchWithFallback(urls, parser, timeout = API_TIMEOUT) {
    let lastErr;
    for (const url of urls) {
        try {
            const { data } = await axios.get(url, { 
                timeout, 
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } 
            });
            const result = parser(data);
            if (result) return result;
        } catch (e) { lastErr = e; continue; }
    }
    throw lastErr || new Error('All APIs failed');
}

// ==================== TIKTOK ====================
async function tiktokDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    
    const apis = [
        `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`,
        `https://api.ryzendesu.vip/api/downloader/tiktok?url=${encodeURIComponent(url)}`,
        `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
    ];
    
    try {
        return await fetchWithFallback(apis, (data) => {
            if (data?.status && data.data) {
                const d = data.data;
                if (d.video) return { type: 'video', url: d.video, title: d.title || 'TikTok' };
                if (d.images) return { type: 'images', items: d.images, title: d.title || 'TikTok' };
            }
            if (data?.status === 'success') {
                if (data.video) return { type: 'video', url: data.video, title: data.title || 'TikTok' };
                if (data.images) return { type: 'images', items: data.images, title: data.title || 'TikTok' };
            }
            if (data?.code === 0) {
                if (data.data?.images) return { type: 'images', items: data.data.images.map(i => i + '.jpeg'), title: data.data.title || 'TikTok' };
                if (data.data?.play) return { type: 'video', url: data.data.play, title: data.data.title || 'TikTok' };
            }
            return null;
        });
    } catch (e) {
        throw new Error('All TikTok APIs failed: ' + e.message);
    }
}

// ==================== INSTAGRAM ====================
async function igDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    
    const apis = [
        `https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(url)}`,
        `https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`,
        `https://api.nyxs.pw/dl/ig?url=${encodeURIComponent(url)}`,
    ];
    
    try {
        return await fetchWithFallback(apis, (data) => {
            if (data?.status && data.data?.length) {
                if (data.data.length === 1) return { type: data.data[0].type, url: data.data[0].url };
                return { items: data.data.map(i => ({ is_video: i.type === 'video', url: i.url })) };
            }
            if (data?.status === 'success' && Array.isArray(data.data)) {
                if (data.data.length === 1) return { type: data.data[0].type, url: data.data[0].url };
                return { items: data.data.map(i => ({ is_video: i.type === 'video', url: i.url })) };
            }
            if (data?.status === 200 && data.result?.url) return { type: data.result.type || 'video', url: data.result.url };
            return null;
        });
    } catch {
        try {
            const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: API_TIMEOUT });
            const $ = cheerio.load(data);
            const vid = $('meta[property="og:video"]').attr('content') || $('meta[property="og:video:secure_url"]').attr('content');
            const img = $('meta[property="og:image"]').attr('content');
            if (vid) return { type: 'video', url: vid };
            if (img) return { type: 'image', url: img };
        } catch {}
        throw new Error('All Instagram APIs failed');
    }
}

// ==================== FACEBOOK ====================
async function fbDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    
    const apis = [
        `https://api.siputzx.my.id/api/d/fbdl?url=${encodeURIComponent(url)}`,
        `https://api.ryzendesu.vip/api/downloader/fbdl?url=${encodeURIComponent(url)}`,
        `https://api.nyxs.pw/dl/fb?url=${encodeURIComponent(url)}`,
    ];
    
    try {
        return await fetchWithFallback(apis, (data) => {
            if (data?.status && data.data?.hd) return { hd: data.data.hd, sd: data.data.sd };
            if (data?.status === 'success') return { hd: data.hd || data.url, sd: data.sd || data.url };
            if (data?.status === 200 && data.result?.url) return { hd: data.result.url, sd: data.result.url };
            return null;
        });
    } catch {
        try {
            const res = await ytDownload(url, 'video');
            return { hd: res.url, sd: res.url };
        } catch (e) {
            throw new Error('Facebook download failed: ' + e.message);
        }
    }
}

// ==================== TWITTER / X ====================
async function twitterDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    
    const apis = [
        `https://api.siputzx.my.id/api/d/twitter?url=${encodeURIComponent(url)}`,
        `https://api.ryzendesu.vip/api/downloader/twitter?url=${encodeURIComponent(url)}`,
        `https://api.nyxs.pw/dl/xdl?url=${encodeURIComponent(url)}`,
    ];
    
    try {
        return await fetchWithFallback(apis, (data) => {
            if (data?.status && data.data?.url) return { url: data.data.url, title: data.data.desc || 'Twitter Video' };
            if (data?.status === 'success' && data.url) return { url: data.url, title: data.title || 'Twitter Video' };
            if (data?.status === 200 && data.result?.url) return { url: data.result.url, title: 'Twitter Video' };
            return null;
        });
    } catch {
        try {
            const res = await ytDownload(url, 'video');
            return { url: res.local ? res.url : res.url, title: 'Twitter Video' };
        } catch (e) {
            throw new Error('Twitter download failed: ' + e.message);
        }
    }
}

// ==================== SPOTIFY ====================
async function spotifyDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    
    const apis = [
        `https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(url)}`,
        `https://api.ryzendesu.vip/api/downloader/spotify?url=${encodeURIComponent(url)}`,
    ];
    
    try {
        return await fetchWithFallback(apis, (data) => {
            if (data?.status && data.data?.url) return { url: data.data.url, title: data.data.title || 'Spotify Track' };
            if (data?.status === 'success' && data.url) return { url: data.url, title: data.title || 'Spotify Track' };
            return null;
        });
    } catch (e) {
        throw new Error('All Spotify APIs failed: ' + e.message);
    }
}

// ==================== PINTEREST ====================
async function pinterestDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    
    const apis = [
        `https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(url)}`,
        `https://api.ryzendesu.vip/api/downloader/pinterest?url=${encodeURIComponent(url)}`,
    ];
    
    try {
        return await fetchWithFallback(apis, (data) => {
            if (data?.status && data.data?.url) return { type: data.data.type || 'image', url: data.data.url, title: data.data.title };
            if (data?.status === 'success') return { type: data.type || 'image', url: data.url, title: data.title };
            return null;
        });
    } catch {
        try {
            const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: API_TIMEOUT });
            const $ = cheerio.load(data);
            const vid = $('video').attr('src');
            const img = $('img[srcset]').first().attr('src') || $('img').first().attr('src');
            if (vid) return { type: 'video', url: vid };
            if (img) return { type: 'image', url: img };
        } catch {}
        throw new Error('Pinterest download failed');
    }
}

// ==================== REDDIT ====================
async function redditDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    try {
        const jsonUrl = url.replace(/\/?$/, '.json');
        const { data } = await axios.get(jsonUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: API_TIMEOUT });
        const post = data[0].data.children[0].data;
        const media = post.secure_media?.reddit_video?.fallback_url || post.url;
        const isVideo = !!post.secure_media?.reddit_video;
        return { url: media, title: post.title || 'Reddit Post', isVideo };
    } catch (e) {
        throw new Error('Reddit download failed: ' + e.message);
    }
}

// ==================== SOUNDCLOUD ====================
async function soundcloudDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    
    const apis = [
        `https://api.siputzx.my.id/api/d/soundcloud?url=${encodeURIComponent(url)}`,
        `https://api.ryzendesu.vip/api/downloader/soundcloud?url=${encodeURIComponent(url)}`,
    ];
    
    try {
        return await fetchWithFallback(apis, (data) => {
            if (data?.status && data.data?.url) return { url: data.data.url, title: data.data.title };
            if (data?.status === 'success' && data.url) return { url: data.url, title: data.title };
            return null;
        });
    } catch (e) {
        throw new Error('SoundCloud download failed: ' + e.message);
    }
}

// ==================== THREADS ====================
async function threadsDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    
    const apis = [
        `https://api.siputzx.my.id/api/d/threads?url=${encodeURIComponent(url)}`,
        `https://api.ryzendesu.vip/api/downloader/threads?url=${encodeURIComponent(url)}`,
    ];
    
    try {
        return await fetchWithFallback(apis, (data) => {
            if (data?.status && data.data?.url) return { type: data.data.type || 'image', url: data.data.url, title: data.data.title };
            if (data?.status === 'success') return { type: data.type || 'image', url: data.url, title: data.title };
            return null;
        });
    } catch (e) {
        throw new Error('Threads download failed: ' + e.message);
    }
}

// ==================== CAPCUT ====================
async function capcutDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    
    const apis = [
        `https://api.siputzx.my.id/api/d/capcut?url=${encodeURIComponent(url)}`,
        `https://api.ryzendesu.vip/api/downloader/capcut?url=${encodeURIComponent(url)}`,
    ];
    
    try {
        return await fetchWithFallback(apis, (data) => {
            if (data?.status && data.data?.url) return { url: data.data.url, title: data.data.title };
            if (data?.status === 'success' && data.url) return { url: data.url, title: data.title };
            return null;
        });
    } catch (e) {
        throw new Error('CapCut download failed: ' + e.message);
    }
}

// ==================== LIKEE ====================
async function likeeDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    
    const apis = [
        `https://api.siputzx.my.id/api/d/likee?url=${encodeURIComponent(url)}`,
        `https://api.ryzendesu.vip/api/downloader/likee?url=${encodeURIComponent(url)}`,
    ];
    
    try {
        return await fetchWithFallback(apis, (data) => {
            if (data?.status && data.data?.url) return { url: data.data.url, title: data.data.title };
            if (data?.status === 'success' && data.url) return { url: data.url, title: data.title };
            return null;
        });
    } catch (e) {
        throw new Error('Likee download failed: ' + e.message);
    }
}

// ==================== SNAPCHAT ====================
async function snapchatDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    
    const apis = [
        `https://api.siputzx.my.id/api/d/snapchat?url=${encodeURIComponent(url)}`,
        `https://api.ryzendesu.vip/api/downloader/snapchat?url=${encodeURIComponent(url)}`,
    ];
    
    try {
        return await fetchWithFallback(apis, (data) => {
            if (data?.status && data.data?.url) return { url: data.data.url, title: data.data.title };
            if (data?.status === 'success' && data.url) return { url: data.url, title: data.title };
            return null;
        });
    } catch (e) {
        throw new Error('Snapchat download failed: ' + e.message);
    }
}

// ==================== VIMEO ====================
async function vimeoDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    
    try {
        const res = await ytDownload(url, 'video');
        return { url: res.local ? res.url : res.url, title: 'Vimeo Video' };
    } catch (e) {
        throw new Error('Vimeo download failed: ' + e.message);
    }
}

// ==================== DAILYMOTION ====================
async function dailymotionDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    
    try {
        const res = await ytDownload(url, 'video');
        return { url: res.local ? res.url : res.url, title: 'Dailymotion Video' };
    } catch (e) {
        throw new Error('Dailymotion download failed: ' + e.message);
    }
}

// ==================== MEDIAFIRE ====================
async function mediafireDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');
    
    const apis = [
        `https://api.siputzx.my.id/api/d/mediafire?url=${encodeURIComponent(url)}`,
        `https://api.ryzendesu.vip/api/downloader/mediafire?url=${encodeURIComponent(url)}`,
    ];
    
    try {
        return await fetchWithFallback(apis, (data) => {
            if (data?.status && data.data?.link) return { url: data.data.link, filename: data.data.filename, mimetype: data.data.mimetype || 'application/octet-stream' };
            if (data?.status === 'success' && data.url) return { url: data.url, filename: data.filename, mimetype: 'application/octet-stream' };
            return null;
        });
    } catch {
        try {
            const { data } = await axios.get(url, { timeout: API_TIMEOUT });
            const $ = cheerio.load(data);
            const link = $('a#downloadButton').attr('href');
            const fname = $('div.dl-btn-label').text().trim() || 'file';
            if (link) return { url: link, filename: fname, mimetype: 'application/octet-stream' };
        } catch {}
        throw new Error('MediaFire download failed');
    }
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
        const { data } = await axios.get(`https://api.siputzx.my.id/api/apk/search?q=${encodeURIComponent(query)}`, { timeout: API_TIMEOUT });
        if (data?.status && data.data?.length) {
            const app = data.data[0];
            const dl = await axios.get(`https://api.siputzx.my.id/api/apk/download?id=${app.id}`, { timeout: API_TIMEOUT });
            if (dl.data?.status && dl.data.data?.downloadLink) return { url: dl.data.data.downloadLink, name: app.name };
        }
    } catch {}
    
    try {
        const { data } = await axios.get(`https://api.ryzendesu.vip/api/search/apk?query=${encodeURIComponent(query)}`, { timeout: API_TIMEOUT });
        if (data?.status === 'success' && data.data?.length) {
            const app = data.data[0];
            return { url: app.download, name: app.name };
        }
    } catch {}
    
    throw new Error('APK not found');
}

module.exports = {
    ytMp3, ytMp4, tiktokDownload, igDownload, fbDownload,
    twitterDownload, spotifyDownload, pinterestDownload,
    redditDownload, soundcloudDownload, threadsDownload,
    capcutDownload, likeeDownload, snapchatDownload,
    vimeoDownload, dailymotionDownload, mediafireDownload,
    gdriveDownload, apkDownload
};