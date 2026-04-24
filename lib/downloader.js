const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const youtubedl = require('youtube-dl-exec');

const API_TIMEOUT = 20000;

// ─── UTILS ─────────────────────────────────────────────────────
const isValidUrl = (url) => {
    try { new URL(url); return true; } catch { return false; }
};

const delay = ms => new Promise(r => setTimeout(r, ms));

// Supported domains map (for user-friendly messages)
const PLATFORM_MAP = {
    'youtube.com': 'YouTube', 'youtu.be': 'YouTube',
    'tiktok.com': 'TikTok', 'tiktokcdn.com': 'TikTok',
    'instagram.com': 'Instagram', 'instagr.am': 'Instagram',
    'facebook.com': 'Facebook', 'fb.watch': 'Facebook', 'fb.me': 'Facebook',
    'twitter.com': 'Twitter/X', 'x.com': 'Twitter/X', 't.co': 'Twitter/X',
    'spotify.com': 'Spotify', 'open.spotify.com': 'Spotify',
    'pinterest.com': 'Pinterest', 'pin.it': 'Pinterest',
    'reddit.com': 'Reddit', 'redd.it': 'Reddit',
    'soundcloud.com': 'SoundCloud', 'snd.sc': 'SoundCloud',
    'threads.net': 'Threads',
    'snapchat.com': 'Snapchat',
    'vimeo.com': 'Vimeo', 'player.vimeo.com': 'Vimeo',
    'dailymotion.com': 'Dailymotion', 'dai.ly': 'Dailymotion',
    'mediafire.com': 'MediaFire',
    'drive.google.com': 'Google Drive',
    'capcut.com': 'CapCut',
    'likee.video': 'Likee', 'likee.com': 'Likee',
    'bandcamp.com': 'Bandcamp',
    'audiomack.com': 'Audiomack',
    'mixcloud.com': 'Mixcloud',
    'twitch.tv': 'Twitch', 'clips.twitch.tv': 'Twitch',
    'rumble.com': 'Rumble',
    'odysee.com': 'Odysee', 'lbry.tv': 'Odysee',
    'patreon.com': 'Patreon',
    'substack.com': 'Substack',
    'kick.com': 'Kick',
    'streamable.com': 'Streamable',
    'loom.com': 'Loom',
    'wistia.com': 'Wistia', 'wistia.net': 'Wistia',
    'ted.com': 'TED',
    'coursera.org': 'Coursera',
    'udemy.com': 'Udemy',
    'linkedin.com': 'LinkedIn',
    'vk.com': 'VK', 'vk.ru': 'VK',
    'ok.ru': 'Odnoklassniki',
    'mail.ru': 'Mail.ru',
    'bilibili.com': 'Bilibili', 'b23.tv': 'Bilibili',
    'youku.com': 'Youku',
    'iqiyi.com': 'iQiyi',
    'nicovideo.jp': 'Nico Nico',
    'dailymail.co.uk': 'Daily Mail',
    'bbc.com': 'BBC', 'bbc.co.uk': 'BBC',
    'cnn.com': 'CNN',
    'espn.com': 'ESPN',
    'imdb.com': 'IMDb',
    'archive.org': 'Internet Archive',
    'peertube.tv': 'PeerTube',
    'framatube.org': 'PeerTube',
};

function detectPlatform(url) {
    try {
        const host = new URL(url).hostname.replace(/^www\./, '');
        for (const [domain, name] of Object.entries(PLATFORM_MAP)) {
            if (host.includes(domain)) return name;
        }
        return 'Unknown Platform';
    } catch { return 'Unknown'; }
}

// ─── UNIVERSAL DOWNLOAD ENGINE ─────────────────────────────────
async function universalDownload(url, options = {}) {
    if (!isValidUrl(url)) throw new Error('Invalid URL provided');

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const id = Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const isAudio = options.audio === true;
    const ext = isAudio ? 'mp3' : 'mp4';
    const outPath = path.join(tmpDir, `dl_${id}.${ext}`);

    const platform = detectPlatform(url);

    // ── YT-DLP Configuration ──────────────────────────────────
    const ytdlOptions = {
        output: outPath,
        noPlaylist: true,
        noWarnings: true,
        noCheckCertificates: true,
        addHeader: [
            'referer:' + new URL(url).hostname,
            'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
        ],
        ffmpegLocation: 'ffmpeg',
    };

    if (isAudio) {
        ytdlOptions.extractAudio = true;
        ytdlOptions.audioFormat = 'mp3';
        ytdlOptions.audioQuality = 0;
        ytdlOptions.format = 'bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio/best';
    } else {
        // Video: max 720p for WhatsApp compatibility
        ytdlOptions.format = 'best[height<=720][ext=mp4]/best[height<=720]/best[ext=mp4]/best';
    }

    // ── Special handling for specific platforms ───────────────
    const host = new URL(url).hostname;

    // Spotify: needs cookies or returns preview only
    if (host.includes('spotify.com')) {
        throw new Error('Spotify requires authentication. Use .spotify <track URL> for audio-only download via API.');
    }

    // MediaFire: direct download, no yt-dlp needed
    if (host.includes('mediafire.com')) {
        return await mediafireDirect(url);
    }

    // Google Drive: direct download
    if (host.includes('drive.google.com')) {
        return await gdriveDirect(url);
    }

    // Reddit: use .json API first (faster)
    if (host.includes('reddit.com') || host.includes('redd.it')) {
        try { return await redditDirect(url); } catch { /* fall through to yt-dlp */ }
    }

    // ── Execute yt-dlp ────────────────────────────────────────
    try {
        await youtubedl(url, ytdlOptions);

        if (fs.existsSync(outPath) && fs.statSync(outPath).size > 4096) {
            return {
                url: outPath,
                local: true,
                title: `${platform} ${isAudio ? 'Audio' : 'Video'}`,
                platform: platform,
                size: fs.statSync(outPath).size
            };
        }
    } catch (e) {
        console.log(`[yt-dlp] ${platform} failed:`, e.message);
        try { fs.unlinkSync(outPath); } catch {}
    }

    // ── Fallback: Cobalt API (works for most platforms) ───────
    try {
        const cobaltRes = await axios.post('https://api.cobalt.tools/api/json', {
            url: url,
            isAudioOnly: isAudio,
            filenamePattern: 'basic'
        }, {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            timeout: API_TIMEOUT
        });

        if (cobaltRes.data?.url) {
            return {
                url: cobaltRes.data.url,
                local: false,
                title: `${platform} ${isAudio ? 'Audio' : 'Video'}`,
                platform: platform
            };
        }
    } catch (e) {
        console.log('[Cobalt] fallback failed:', e.message);
    }

    throw new Error(`${platform} download failed. The content may be private, geo-blocked, or unsupported.`);
}

// ─── PLATFORM-SPECIFIC DIRECT HANDLERS ─────────────────────────

async function mediafireDirect(url) {
    try {
        const { data } = await axios.get(url, { timeout: API_TIMEOUT });
        const $ = cheerio.load(data);
        const link = $('a#downloadButton').attr('href');
        const fname = $('div.dl-btn-label').text().trim() || 'file';
        if (!link) throw new Error('No download link found');
        return {
            url: link,
            local: false,
            title: fname,
            platform: 'MediaFire',
            isDocument: true,
            mimetype: 'application/octet-stream'
        };
    } catch (e) {
        throw new Error('MediaFire failed: ' + e.message);
    }
}

async function gdriveDirect(url) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (!match) throw new Error('Invalid Google Drive URL');
    const id = match[1];
    return {
        url: `https://drive.google.com/uc?export=download&id=${id}`,
        local: false,
        title: `gdrive_file_${id}`,
        platform: 'Google Drive',
        isDocument: true,
        mimetype: 'application/octet-stream'
    };
}

async function redditDirect(url) {
    const jsonUrl = url.replace(/\/?$/, '.json');
    const { data } = await axios.get(jsonUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: API_TIMEOUT
    });
    const post = data[0].data.children[0].data;
    const media = post.secure_media?.reddit_video?.fallback_url || post.url;
    const isVideo = !!post.secure_media?.reddit_video;
    return {
        url: media,
        local: false,
        title: post.title || 'Reddit Post',
        platform: 'Reddit',
        isVideo: isVideo
    };
}

// ─── SPOTIFY API FALLBACK (separate, needs no yt-dlp) ──────────
async function spotifyDownload(url) {
    if (!isValidUrl(url)) throw new Error('Invalid URL');

    const apis = [
        `https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(url)}`,
        `https://api.ryzendesu.vip/api/downloader/spotify?url=${encodeURIComponent(url)}`,
    ];

    for (const apiUrl of apis) {
        try {
            const { data } = await axios.get(apiUrl, { timeout: API_TIMEOUT });
            if (data?.status && data.data?.url) return { url: data.data.url, title: data.data.title || 'Spotify', platform: 'Spotify' };
            if (data?.status === 'success' && data.url) return { url: data.url, title: data.title || 'Spotify', platform: 'Spotify' };
        } catch {}
    }
    throw new Error('Spotify download failed. Try a different track or check if it\'s available in your region.');
}

// ─── APK SEARCH ────────────────────────────────────────────────
async function apkDownload(query) {
    const apis = [
        `https://api.siputzx.my.id/api/apk/search?q=${encodeURIComponent(query)}`,
        `https://api.ryzendesu.vip/api/search/apk?query=${encodeURIComponent(query)}`,
    ];

    for (const apiUrl of apis) {
        try {
            const { data } = await axios.get(apiUrl, { timeout: API_TIMEOUT });
            let app;
            if (data?.status && data.data?.length) app = data.data[0];
            else if (data?.status === 'success' && data.data?.length) app = data.data[0];

            if (app) {
                // Try to get download link
                if (apiUrl.includes('siputzx')) {
                    const dl = await axios.get(`https://api.siputzx.my.id/api/apk/download?id=${app.id}`, { timeout: API_TIMEOUT });
                    if (dl.data?.status && dl.data.data?.downloadLink) {
                        return { url: dl.data.data.downloadLink, name: app.name, platform: 'APK' };
                    }
                } else {
                    return { url: app.download, name: app.name, platform: 'APK' };
                }
            }
        } catch {}
    }
    throw new Error('APK not found');
}

// ─── EXPORT ────────────────────────────────────────────────────
module.exports = {
    universalDownload,
    spotifyDownload,
    apkDownload,
    detectPlatform,
    PLATFORM_MAP
};