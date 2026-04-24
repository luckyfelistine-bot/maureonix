/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    MAUREONIX ULTIMATE SEARCH ENGINE v3.0                     ║
 * ║           Capable of finding anything & anyone from 100+ platforms           ║
 * ║         Smart caching • Retry logic • Rate limiting • Parallel search        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const fetch = require('node-fetch');
const NodeCache = require('node-cache');

// ========== CONFIGURATION ==========
const CONFIG = {
    cacheTTL: 600,           // 10 minutes default cache
    cacheCheckPeriod: 120,   // Check for expired keys every 2 minutes
    maxRetries: 3,
    baseDelay: 1000,         // 1 second base retry delay
    maxDelay: 10000,         // 10 seconds max delay
    timeout: 15000,          // 15 seconds request timeout
    concurrentLimit: 5,      // Max concurrent requests per batch
};

// Initialize caches
const cache = new NodeCache({ stdTTL: CONFIG.cacheTTL, checkperiod: CONFIG.cacheCheckPeriod });
const rateLimitCache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

// ========== UTILITY FUNCTIONS ==========

/**
 * Delay promise for rate limiting
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Exponential backoff with jitter
 */
const getBackoffDelay = (attempt) => {
    const exp = Math.min(attempt, 5);
    const jitter = Math.random() * 1000;
    return Math.min(CONFIG.baseDelay * Math.pow(2, exp) + jitter, CONFIG.maxDelay);
};

/**
 * Check and enforce rate limits per domain
 */
async function checkRateLimit(domain, maxRequests = 10) {
    const key = `rl_${domain}`;
    const current = rateLimitCache.get(key) || 0;
    if (current >= maxRequests) {
        const waitTime = 60000 / maxRequests;
        await sleep(waitTime);
        rateLimitCache.set(key, 0);
    }
    rateLimitCache.set(key, current + 1);
}

/**
 * Universal fetch with retry, cache, timeout, and rate limiting
 */
async function fetchJSON(url, options = {}, cacheKey = null, rateLimitDomain = null, rateLimitMax = 10) {
    // Check cache first
    if (cacheKey) {
        const cached = cache.get(cacheKey);
        if (cached) return cached;
    }

    // Rate limit check
    if (rateLimitDomain) {
        await checkRateLimit(rateLimitDomain, rateLimitMax);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

    for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
        try {
            const res = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'User-Agent': 'MAUREONIX-SearchBot/3.0 (WhatsApp Bot; +https://maureonix.bot)',
                    'Accept': 'application/json',
                    ...options.headers,
                },
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                if (res.status === 429) {
                    const retryAfter = res.headers.get('Retry-After') || 5;
                    await sleep(retryAfter * 1000);
                    continue;
                }
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const contentType = res.headers.get('content-type') || '';
            let data;
            if (contentType.includes('application/json')) {
                data = await res.json();
            } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
                const text = await res.text();
                data = { _xml: text };
            } else {
                const text = await res.text();
                try { data = JSON.parse(text); } catch { data = { _text: text }; }
            }

            if (cacheKey) cache.set(cacheKey, data);
            return data;

        } catch (err) {
            if (attempt === CONFIG.maxRetries) {
                clearTimeout(timeoutId);
                throw err;
            }
            const delay = getBackoffDelay(attempt);
            await sleep(delay);
        }
    }
}

/**
 * Fetch HTML with retry
 */
async function fetchHTML(url, options = {}, cacheKey = null) {
    if (cacheKey) {
        const cached = cache.get(cacheKey);
        if (cached) return cached;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

    for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
        try {
            const res = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    ...options.headers,
                },
            });
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const html = await res.text();
            if (cacheKey) cache.set(cacheKey, html);
            return html;
        } catch (err) {
            if (attempt === CONFIG.maxRetries) {
                clearTimeout(timeoutId);
                throw err;
            }
            await sleep(getBackoffDelay(attempt));
        }
    }
}

/**
 * Parallel execution with concurrency limit
 */
async function parallelLimit(tasks, limit = CONFIG.concurrentLimit) {
    const results = [];
    const executing = [];
    for (const [index, task] of tasks.entries()) {
        const p = Promise.resolve().then(() => task()).catch(err => ({ _error: err.message }));
        results.push(p);
        if (tasks.length >= limit) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= limit) await Promise.race(executing);
        }
    }
    return Promise.all(results);
}

/**
 * Format search results consistently
 */
function formatResult(title, content, url = '', meta = {}, emoji = '🔍') {
    let result = `${emoji} *${title}*`;
    if (meta.subtitle) result += `\n_${meta.subtitle}_`;
    result += `\n\n${content}`;
    if (url) result += `\n\n🔗 ${url}`;
    return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
//                            SEARCH ENGINE MODULES
// ═══════════════════════════════════════════════════════════════════════════════

// ========== 1. GENERAL WEB SEARCH ==========

async function googleSearch(query) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CX;
    if (apiKey && cx) {
        try {
            const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
            const data = await fetchJSON(url, {}, `google_${query}`, 'google', 100);
            if (data.items) {
                return data.items.slice(0, 5).map(item =>
                    formatResult(item.title, item.snippet?.substring(0, 200) || 'No description', item.link, {}, '🔍')
                ).join('\n\n');
            }
        } catch (e) {}
    }

    // Fallback: DuckDuckGo Lite scraping
    try {
        const ddgUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
        const html = await fetchHTML(ddgUrl, {}, `ddg_${query}`);
        const matches = [...html.matchAll(/<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>([^<]+)<\/a>/g)];
        const results = matches.slice(0, 5).map(m => ({ title: m[2].trim(), link: m[1] }));
        if (results.length) {
            return results.map((r, i) => formatResult(r.title, 'Web result from DuckDuckGo', r.link, {}, '🔍')).join('\n\n');
        }
    } catch (e) {}

    // Fallback 2: Brave Search
    const braveKey = process.env.BRAVE_API_KEY;
    if (braveKey) {
        try {
            const braveUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`;
            const data = await fetchJSON(braveUrl, {
                headers: { 'X-Subscription-Token': braveKey }
            }, `brave_${query}`, 'brave', 20);
            if (data.web?.results) {
                return data.web.results.map(r =>
                    formatResult(r.title, r.description?.substring(0, 200) || '', r.url, {}, '🔍')
                ).join('\n\n');
            }
        } catch (e) {}
    }

    return '❌ Web search failed. Try `.wiki` or `.reddit` instead.';
}

async function bingSearch(query) {
    const key = process.env.BING_API_KEY;
    if (!key) return '❌ Bing API key missing. Set BING_API_KEY.';
    try {
        const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=5`;
        const data = await fetchJSON(url, { headers: { 'Ocp-Apim-Subscription-Key': key } }, `bing_${query}`, 'bing', 20);
        if (data.webPages?.value) {
            return data.webPages.value.map(r =>
                formatResult(r.name, r.snippet?.substring(0, 200) || '', r.url, {}, '🔍')
            ).join('\n\n');
        }
    } catch (e) { return `❌ Bing search error: ${e.message}`; }
}

// ========== 2. KNOWLEDGE & REFERENCE ==========

async function wikiSearch(query, lang = 'en') {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/ /g, '_'))}`;
    try {
        const data = await fetchJSON(url, {}, `wiki_${lang}_${query}`, 'wikipedia', 30);
        if (data.type === 'disambiguation') {
            return `⚠️ *Disambiguation: ${data.title}*\n_${data.extract}_\n🔗 ${data.content_urls?.desktop?.page}`;
        }
        if (data.extract) {
            return formatResult(data.title, data.extract.substring(0, 1200), data.content_urls?.desktop?.page, { subtitle: data.description || 'Wikipedia' }, '📚');
        }
    } catch (e) { return `❌ Wikipedia: ${e.message}`; }
}

async function wikidataSearch(query) {
    const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&limit=5`;
    try {
        const data = await fetchJSON(url, {}, `wikidata_${query}`, 'wikidata', 30);
        if (!data.search?.length) return 'No Wikidata results.';
        return data.search.map(item =>
            formatResult(item.label, item.description || 'No description', `https://www.wikidata.org/wiki/${item.id}`, {}, '📊')
        ).join('\n\n');
    } catch (e) { return `❌ Wikidata: ${e.message}`; }
}

async function urbanDictionary(term) {
    const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`;
    try {
        const data = await fetchJSON(url, {}, `urban_${term}`, 'urbandictionary', 30);
        if (!data.list?.length) return 'No definitions found.';
        return data.list.slice(0, 3).map((d, i) =>
            `📖 *${d.word}* (${i + 1}/3)\n${d.definition.replace(/\[|\]/g, '')}\n👍 ${d.thumbs_up} 👎 ${d.thumbs_down}\n📌 Example: ${d.example?.replace(/\[|\]/g, '').substring(0, 100)}`
        ).join('\n\n');
    } catch (e) { return `❌ Urban Dictionary: ${e.message}`; }
}

async function dictionarySearch(word) {
    // Free Dictionary API (no key)
    try {
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
        const data = await fetchJSON(url, {}, `dict_${word}`, 'dictionaryapi', 30);
        if (Array.isArray(data) && data[0]) {
            const entry = data[0];
            let result = `📖 *${entry.word}*${entry.phonetic ? ` [${entry.phonetic}]` : ''}\n`;
            entry.meanings.forEach(m => {
                result += `\n*${m.partOfSpeech}:*`;
                m.definitions.slice(0, 3).forEach((d, i) => {
                    result += `\n${i + 1}. ${d.definition}`;
                    if (d.example) result += `\n   _"${d.example}"_`;
                });
            });
            return result;
        }
    } catch (e) {}

    // Merriam-Webster fallback
    const mwKey = process.env.MERRIAM_WEBSTER_KEY;
    if (mwKey) {
        try {
            const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(word)}?key=${mwKey}`;
            const data = await fetchJSON(url, {}, `mw_${word}`, 'merriamwebster', 20);
            if (Array.isArray(data) && data[0]?.shortdef) {
                return `📖 *${word}* (Merriam-Webster)\n\n${data[0].shortdef.map((d, i) => `${i + 1}. ${d}`).join('\n')}`;
            }
        } catch (e) {}
    }

    return '❌ Dictionary lookup failed.';
}

// ========== 3. SOCIAL MEDIA ==========

async function redditSearch(query, subreddit = 'all') {
    const url = subreddit === 'all'
        ? `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=5&sort=relevance`
        : `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&limit=5&sort=relevance&restrict_sr=on`;
    try {
        const data = await fetchJSON(url, { headers: { 'User-Agent': 'MAUREONIX/3.0' } }, `reddit_${subreddit}_${query}`, 'reddit', 10);
        const posts = data.data?.children || [];
        if (!posts.length) return 'No Reddit posts found.';
        return posts.map(p => {
            const post = p.data;
            return `🔴 *${post.title}*\n👍 ${post.ups} | 💬 ${post.num_comments} | r/${post.subreddit}\n🔗 https://redd.it/${post.id}`;
        }).join('\n\n');
    } catch (e) { return `❌ Reddit: ${e.message}`; }
}

async function redditUserSearch(username) {
    try {
        const url = `https://www.reddit.com/user/${encodeURIComponent(username)}/about.json`;
        const data = await fetchJSON(url, { headers: { 'User-Agent': 'MAUREONIX/3.0' } }, `reddit_user_${username}`, 'reddit', 10);
        const u = data.data;
        return `👤 *u/${u.name}*\n📅 Account created: ${new Date(u.created_utc * 1000).toLocaleDateString()}\n⭐ Karma: ${u.total_karma}\n📊 Post Karma: ${u.link_karma} | Comment Karma: ${u.comment_karma}\n🎂 Cake Day: ${new Date(u.created_utc * 1000).toLocaleDateString()}`;
    } catch (e) { return `❌ Reddit user not found: ${e.message}`; }
}

async function twitterSearch(query) {
    const bearer = process.env.TWITTER_BEARER_TOKEN;
    if (!bearer) return '❌ Twitter API requires TWITTER_BEARER_TOKEN. Set it in environment variables.';
    try {
        const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=5&tweet.fields=created_at,public_metrics,author_id`;
        const data = await fetchJSON(url, { headers: { 'Authorization': `Bearer ${bearer}` } }, `twitter_${query}`, 'twitter', 15);
        if (!data.data?.length) return 'No tweets found.';
        return data.data.map(t =>
            `🐦 *Tweet*\n${t.text?.substring(0, 280)}\n❤️ ${t.public_metrics?.like_count || 0} | 🔄 ${t.public_metrics?.retweet_count || 0} | 💬 ${t.public_metrics?.reply_count || 0}\n🕐 ${new Date(t.created_at).toLocaleString()}`
        ).join('\n\n');
    } catch (e) { return `❌ Twitter: ${e.message}`; }
}

async function twitterUserSearch(username) {
    const bearer = process.env.TWITTER_BEARER_TOKEN;
    if (!bearer) return '❌ Twitter API requires TWITTER_BEARER_TOKEN.';
    try {
        const url = `https://api.twitter.com/2/users/by/username/${encodeURIComponent(username.replace('@', ''))}?user.fields=public_metrics,created_at,description,verified`;
        const data = await fetchJSON(url, { headers: { 'Authorization': `Bearer ${bearer}` } }, `twitter_user_${username}`, 'twitter', 15);
        const u = data.data;
        return `🐦 *@${u.username}*${u.verified ? ' ✅' : ''}\n${u.description || ''}\n👥 Followers: ${u.public_metrics?.followers_count?.toLocaleString()} | Following: ${u.public_metrics?.following_count?.toLocaleString()}\n📊 Tweets: ${u.public_metrics?.tweet_count?.toLocaleString()}`;
    } catch (e) { return `❌ Twitter user: ${e.message}`; }
}

async function discordSearch(query) {
    try {
        const url = `https://disboard.org/search?keyword=${encodeURIComponent(query)}`;
        const html = await fetchHTML(url, {}, `discord_${query}`);
        const matches = [...html.matchAll(/<div class="server-name">([^<]+)<\/div>/g)];
        if (!matches.length) return 'No Discord servers found. Try a different keyword.';
        return matches.slice(0, 5).map((m, i) => `💬 *Server ${i + 1}:* ${m[1].trim()}`).join('\n');
    } catch (e) { return `❌ Discord search: ${e.message}`; }
}

async function telegramSearch(query) {
    try {
        const url = `https://tgstat.ru/search?q=${encodeURIComponent(query)}`;
        const html = await fetchHTML(url, {}, `telegram_${query}`);
        const matches = [...html.matchAll(/<div class="font-16 text-dark text-truncate">([^<]+)<\/div>/g)];
        if (!matches.length) return 'No Telegram channels found.';
        return matches.slice(0, 5).map((m, i) => `📱 *Channel ${i + 1}:* ${m[1].trim()}`).join('\n');
    } catch (e) { return `❌ Telegram search: ${e.message}`; }
}

async function mastodonSearch(query, instance = 'mastodon.social') {
    try {
        const url = `https://${instance}/api/v2/search?q=${encodeURIComponent(query)}&limit=5`;
        const data = await fetchJSON(url, {}, `mastodon_${instance}_${query}`, 'mastodon', 20);
        let results = [];
        if (data.accounts?.length) {
            results.push(...data.accounts.map(a => `🐘 *@${a.acct}*\n${a.note?.replace(/<[^>]+>/g, '').substring(0, 100)}\n👥 ${a.followers_count} followers`));
        }
        if (data.statuses?.length) {
            results.push(...data.statuses.map(s => `🐘 *Toot*\n${s.content?.replace(/<[^>]+>/g, '').substring(0, 200)}\n❤️ ${s.favourites_count} | 🔄 ${s.reblogs_count}`));
        }
        return results.length ? results.slice(0, 5).join('\n\n') : 'No Mastodon results found.';
    } catch (e) { return `❌ Mastodon: ${e.message}`; }
}

async function blueskySearch(query) {
    try {
        const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(query)}&limit=5`;
        const data = await fetchJSON(url, {}, `bluesky_${query}`, 'bluesky', 20);
        if (!data.posts?.length) return 'No Bluesky posts found.';
        return data.posts.map(p =>
            `🦋 *@${p.author.handle}*\n${p.record?.text?.substring(0, 280) || ''}\n❤️ ${p.likeCount || 0} | 🔄 ${p.repostCount || 0} | 💬 ${p.replyCount || 0}`
        ).join('\n\n');
    } catch (e) { return `❌ Bluesky: ${e.message}`; }
}

async function instagramSearch(query) {
    try {
        const url = `https://www.picuki.com/search/${encodeURIComponent(query)}`;
        const html = await fetchHTML(url, {}, `instagram_${query}`);
        const matches = [...html.matchAll(/<div class="photo-username">([^<]+)<\/div>/g)];
        if (!matches.length) return '❌ Instagram search requires scraping. No results found.';
        return matches.slice(0, 5).map((m, i) => `📸 *Profile ${i + 1}:* @${m[1].trim()}`).join('\n');
    } catch (e) { return `❌ Instagram: ${e.message}`; }
}

async function tiktokSearch(query) {
    try {
        const url = `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
        const html = await fetchHTML(url, {}, `tiktok_${query}`);
        const matches = [...html.matchAll(/\/video\/(\d+)/g)];
        const unique = [...new Set(matches.slice(0, 5).map(m => m[1]))];
        if (!unique.length) return '❌ TikTok search requires scraping. No results found.';
        return unique.map(id => `🎵 *TikTok Video*\nhttps://www.tiktok.com/video/${id}`).join('\n\n');
    } catch (e) { return `❌ TikTok: ${e.message}`; }
}

async function pinterestSearch(query) {
    const key = process.env.PINTEREST_API_KEY;
    if (!key) {
        try {
            const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
            const html = await fetchHTML(url, {}, `pinterest_${query}`);
            const matches = [...html.matchAll(/"description":"([^"]+)"/g)];
            if (!matches.length) return '❌ Pinterest requires API key or scraping. No results.';
            return matches.slice(0, 5).map((m, i) => `📌 *Pin ${i + 1}:* ${m[1].substring(0, 100)}`).join('\n');
        } catch (e) { return `❌ Pinterest: ${e.message}`; }
    }
    try {
        const url = `https://api.pinterest.com/v5/pins/search?query=${encodeURIComponent(query)}&page_size=5`;
        const data = await fetchJSON(url, { headers: { 'Authorization': `Bearer ${key}` } }, `pinterest_api_${query}`, 'pinterest', 20);
        if (!data.items?.length) return 'No Pinterest pins found.';
        return data.items.map(p => `📌 *${p.title || 'Pin'}*\n${p.description?.substring(0, 150) || ''}\n🔗 ${p.link}`).join('\n\n');
    } catch (e) { return `❌ Pinterest API: ${e.message}`; }
}

async function linkedinSearch(query) {
    return '❌ LinkedIn search requires official API partnership. Use `.google linkedin ${query}` instead.';
}

async function snapchatSearch(query) {
    return '❌ Snapchat has no public search API.';
}

async function twitchSearch(query) {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    if (!clientId || !clientSecret) return '❌ Twitch search requires TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET.';
    try {
        const tokenRes = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, { method: 'POST' });
        const tokenData = await tokenRes.json();
        const token = tokenData.access_token;

        const url = `https://api.twitch.tv/helix/search/channels?query=${encodeURIComponent(query)}&first=5`;
        const data = await fetchJSON(url, {
            headers: { 'Client-Id': clientId, 'Authorization': `Bearer ${token}` }
        }, `twitch_${query}`, 'twitch', 15);
        if (!data.data?.length) return 'No Twitch channels found.';
        return data.data.map(c =>
            `🎮 *${c.display_name}*${c.is_live ? ' 🔴 LIVE' : ''}\n${c.title?.substring(0, 100) || ''}\n👥 ${c.thumbnail_url ? 'Channel found' : ''}\n🔗 https://twitch.tv/${c.broadcaster_login}`
        ).join('\n\n');
    } catch (e) { return `❌ Twitch: ${e.message}`; }
}

async function youtubeSearch(query) {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) {
        try {
            const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            const html = await fetchHTML(url, {}, `yt_scrape_${query}`);
            const matches = [...html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)];
            const unique = [...new Set(matches.slice(0, 5).map(m => m[1]))];
            if (unique.length) {
                return unique.map(id => `🎬 *YouTube Video*\nhttps://youtu.be/${id}`).join('\n\n');
            }
        } catch (e) {}
        return '❌ YouTube search failed. Set YOUTUBE_API_KEY for full results.';
    }
    try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&key=${key}&type=video`;
        const data = await fetchJSON(url, {}, `yt_${query}`, 'youtube', 50);
        if (!data.items?.length) return 'No videos found.';
        return data.items.map(v =>
            `🎬 *${v.snippet.title}*\n👤 ${v.snippet.channelTitle}\n🔗 https://youtu.be/${v.id.videoId}`
        ).join('\n\n');
    } catch (e) { return `❌ YouTube: ${e.message}`; }
}

async function youtubeChannelSearch(query) {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) return '❌ YouTube API key required.';
    try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&key=${key}&type=channel`;
        const data = await fetchJSON(url, {}, `yt_channel_${query}`, 'youtube', 50);
        if (!data.items?.length) return 'No channels found.';
        return data.items.map(c =>
            `📺 *${c.snippet.channelTitle}*\n${c.snippet.description?.substring(0, 150) || ''}\n🔗 https://youtube.com/channel/${c.id.channelId}`
        ).join('\n\n');
    } catch (e) { return `❌ YouTube channel: ${e.message}`; }
}

// ========== 4. CODE & DEVELOPMENT ==========

async function githubSearch(query, type = 'repositories') {
    const url = `https://api.github.com/search/${type}?q=${encodeURIComponent(query)}&per_page=5`;
    try {
        const data = await fetchJSON(url, {}, `github_${type}_${query}`, 'github', 10);
        if (!data.items?.length) return 'No GitHub results.';
        return data.items.map(item => {
            if (type === 'repositories') {
                return `📁 *${item.full_name}*\n⭐ ${item.stargazers_count.toLocaleString()} | 🍴 ${item.forks_count.toLocaleString()} | 🐛 ${item.open_issues_count.toLocaleString()}\n_${item.description?.substring(0, 120) || 'No description'}_\n🔗 ${item.html_url}`;
            } else if (type === 'users') {
                return `👤 *${item.login}*\n${item.bio?.substring(0, 100) || ''}\n🔗 ${item.html_url}`;
            } else {
                return `📁 [${item.title}](${item.html_url})\n_${item.body?.substring(0, 120) || ''}_`;
            }
        }).join('\n\n');
    } catch (e) { return `❌ GitHub: ${e.message}`; }
}

async function githubUserSearch(username) {
    try {
        const url = `https://api.github.com/users/${encodeURIComponent(username)}`;
        const data = await fetchJSON(url, {}, `github_user_${username}`, 'github', 10);
        return `👤 *${data.login}*${data.name ? ` (${data.name})` : ''}\n${data.bio || ''}\n📍 ${data.location || 'N/A'} | 🏢 ${data.company || 'N/A'}\n📊 Public Repos: ${data.public_repos} | Followers: ${data.followers} | Following: ${data.following}\n🔗 ${data.html_url}`;
    } catch (e) { return `❌ GitHub user: ${e.message}`; }
}

async function gitlabSearch(query) {
    try {
        const url = `https://gitlab.com/api/v4/projects?search=${encodeURIComponent(query)}&per_page=5`;
        const data = await fetchJSON(url, {}, `gitlab_${query}`, 'gitlab', 20);
        if (!data.length) return 'No GitLab projects found.';
        return data.map(p =>
            `🦊 *${p.name_with_namespace}*\n⭐ ${p.star_count} | 🍴 ${p.forks_count}\n_${p.description?.substring(0, 120) || 'No description'}_\n🔗 ${p.web_url}`
        ).join('\n\n');
    } catch (e) { return `❌ GitLab: ${e.message}`; }
}

async function npmSearch(pkg) {
    const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(pkg)}&size=5`;
    try {
        const data = await fetchJSON(url, {}, `npm_${pkg}`, 'npm', 30);
        if (!data.objects?.length) return 'No packages found.';
        return data.objects.map(o => {
            const p = o.package;
            return `📦 *${p.name}*@${p.version}\n_${p.description?.substring(0, 150) || 'No description'}_\n⬇️ Weekly: ${o.searchScore ? Math.floor(o.searchScore * 1000) : 'N/A'}\n🔗 ${p.links.npm}`;
        }).join('\n\n');
    } catch (e) { return `❌ NPM: ${e.message}`; }
}

async function pypiSearch(pkg) {
    try {
        const url = `https://pypi.org/pypi/${encodeURIComponent(pkg)}/json`;
        const data = await fetchJSON(url, {}, `pypi_${pkg}`, 'pypi', 20);
        const info = data.info;
        return `🐍 *${info.name}* v${info.version}\n_${info.summary || 'No description'}_\n👤 Author: ${info.author || 'N/A'}\n🏷️ License: ${info.license || 'N/A'}\n🔗 ${info.project_urls?.Homepage || `https://pypi.org/project/${info.name}`}`;
    } catch (e) {
        try {
            const searchUrl = `https://pypi.org/search/?q=${encodeURIComponent(pkg)}`;
            const html = await fetchHTML(searchUrl, {}, `pypi_search_${pkg}`);
            const matches = [...html.matchAll(/<span class="package-snippet__name">([^<]+)<\/span>/g)];
            if (!matches.length) return 'No PyPI packages found.';
            return matches.slice(0, 5).map((m, i) => `🐍 *Package ${i + 1}:* ${m[1]}`).join('\n');
        } catch (e2) { return `❌ PyPI: ${e2.message}`; }
    }
}

async function dockerHubSearch(query) {
    try {
        const url = `https://hub.docker.com/v2/search/repositories/?query=${encodeURIComponent(query)}&page_size=5`;
        const data = await fetchJSON(url, {}, `docker_${query}`, 'dockerhub', 20);
        if (!data.results?.length) return 'No Docker images found.';
        return data.results.map(r =>
            `🐳 *${r.repo_name}*\n⭐ ${r.star_count} | ⬇️ ${r.pull_count?.toLocaleString() || 0} pulls\n_${r.short_description?.substring(0, 120) || ''}_`
        ).join('\n\n');
    } catch (e) { return `❌ Docker Hub: ${e.message}`; }
}

async function stackOverflowSearch(query) {
    try {
        const url = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow&pagesize=5`;
        const data = await fetchJSON(url, {}, `so_${query}`, 'stackoverflow', 20);
        if (!data.items?.length) return 'No Stack Overflow results.';
        return data.items.map(q =>
            `💻 *${q.title}*\n👤 ${q.owner.display_name} | 👍 ${q.score} | 💬 ${q.answer_count} answers\n🔗 ${q.link}`
        ).join('\n\n');
    } catch (e) { return `❌ Stack Overflow: ${e.message}`; }
}

async function sourceForgeSearch(query) {
    try {
        const url = `https://sourceforge.net/directory/?q=${encodeURIComponent(query)}`;
        const html = await fetchHTML(url, {}, `sf_${query}`);
        const matches = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)];
        if (!matches.length) return 'No SourceForge projects found.';
        return matches.slice(0, 5).map((m, i) => `📦 *Project ${i + 1}:* ${m[1].trim()}`).join('\n');
    } catch (e) { return `❌ SourceForge: ${e.message}`; }
}

// ========== 5. ENTERTAINMENT ==========

async function animeSearch(query) {
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`;
    try {
        const data = await fetchJSON(url, {}, `anime_${query}`, 'jikan', 5);
        if (!data.data?.length) return 'No anime found.';
        return data.data.map(a =>
            `🎬 *${a.title}* (${a.type || 'Unknown'})\n⭐ Score: ${a.score || '?'} | 📺 Episodes: ${a.episodes || '?'}\n📅 Aired: ${a.aired?.string?.split(' to')[0] || '?'}\n_${a.synopsis?.substring(0, 200)}..._\n🔗 ${a.url}`
        ).join('\n\n');
    } catch (e) { return `❌ Anime: ${e.message}`; }
}

async function mangaSearch(query) {
    const url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=5`;
    try {
        const data = await fetchJSON(url, {}, `manga_${query}`, 'jikan', 5);
        if (!data.data?.length) return 'No manga found.';
        return data.data.map(m =>
            `📖 *${m.title}*\n⭐ Score: ${m.score || '?'} | 📚 Volumes: ${m.volumes || '?'}\n📅 Published: ${m.published?.string?.split('to')[0] || '?'}\n_${m.synopsis?.substring(0, 200)}..._`
        ).join('\n\n');
    } catch (e) { return `❌ Manga: ${e.message}`; }
}

async function movieSearch(title) {
    const tmdbKey = process.env.TMDB_API_KEY;
    if (tmdbKey) {
        try {
            const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(title)}&page=1`;
            const data = await fetchJSON(url, {}, `tmdb_${title}`, 'tmdb', 20);
            if (data.results?.length) {
                return data.results.slice(0, 5).map(m =>
                    `🎬 *${m.title}* (${m.release_date?.split('-')[0] || 'N/A'})\n⭐ Rating: ${m.vote_average}/10 | 🗳️ ${m.vote_count} votes\n_${m.overview?.substring(0, 200)}..._`
                ).join('\n\n');
            }
        } catch (e) {}
    }

    const omdbKey = process.env.OMDB_API_KEY;
    if (omdbKey) {
        try {
            const url = `https://www.omdbapi.com/?apikey=${omdbKey}&s=${encodeURIComponent(title)}&type=movie&page=1`;
            const data = await fetchJSON(url, {}, `omdb_${title}`, 'omdb', 20);
            if (data.Search?.length) {
                return data.Search.slice(0, 5).map(m =>
                    `🎬 *${m.Title}* (${m.Year})\n🔗 https://www.imdb.com/title/${m.imdbID}/`
                ).join('\n\n');
            }
        } catch (e) {}
    }

    return '❌ Movie search failed. Set TMDB_API_KEY or OMDB_API_KEY.';
}

async function tvSearch(title) {
    const tmdbKey = process.env.TMDB_API_KEY;
    if (!tmdbKey) return '❌ TMDB API key required for TV search.';
    try {
        const url = `https://api.themoviedb.org/3/search/tv?api_key=${tmdbKey}&query=${encodeURIComponent(title)}&page=1`;
        const data = await fetchJSON(url, {}, `tmdb_tv_${title}`, 'tmdb', 20);
        if (!data.results?.length) return 'No TV shows found.';
        return data.results.slice(0, 5).map(t =>
            `📺 *${t.name}* (${t.first_air_date?.split('-')[0] || 'N/A'})\n⭐ Rating: ${t.vote_average}/10\n_${t.overview?.substring(0, 200)}..._`
        ).join('\n\n');
    } catch (e) { return `❌ TV search: ${e.message}`; }
}

async function gameSearch(query) {
    const rawgKey = process.env.RAWG_API_KEY;
    if (!rawgKey) return '❌ RAWG API key required. Get one free at rawg.io.';
    try {
        const url = `https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(query)}&page_size=5`;
        const data = await fetchJSON(url, {}, `rawg_${query}`, 'rawg', 20);
        if (!data.results?.length) return 'No games found.';
        return data.results.map(g =>
            `🎮 *${g.name}* (${g.released || 'TBA'})\n⭐ Rating: ${g.rating || 'N/A'}/5 | 🏆 ${g.metacritic || 'N/A'} Metacritic\n🔗 ${g.website || 'https://rawg.io/games/' + g.slug}`
        ).join('\n\n');
    } catch (e) { return `❌ Game search: ${e.message}`; }
}

async function igdbSearch(query) {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    if (!clientId || !clientSecret) return '❌ IGDB requires Twitch credentials (same as Twitch search).';
    try {
        const tokenRes = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, { method: 'POST' });
        const tokenData = await tokenRes.json();
        const token = tokenData.access_token;

        const url = 'https://api.igdb.com/v4/games';
        const data = await fetchJSON(url, {
            method: 'POST',
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/plain'
            },
            body: `search "${query}"; fields name,first_release_date,rating,summary,url; limit 5;`
        }, `igdb_${query}`, 'igdb', 10);
        if (!data.length) return 'No IGDB results.';
        return data.map(g =>
            `🎮 *${g.name}*\n⭐ Rating: ${g.rating ? (g.rating / 10).toFixed(1) : 'N/A'}/10\n_${g.summary?.substring(0, 200) || 'No summary'}_`
        ).join('\n\n');
    } catch (e) { return `❌ IGDB: ${e.message}`; }
}

async function comicSearch(query) {
    const key = process.env.COMICVINE_API_KEY;
    if (!key) return '❌ ComicVine API key required.';
    try {
        const url = `https://comicvine.gamespot.com/api/search/?api_key=${key}&format=json&query=${encodeURIComponent(query)}&resources=issue,volume,character&limit=5`;
        const data = await fetchJSON(url, {}, `comic_${query}`, 'comicvine', 10);
        if (!data.results?.length) return 'No comics found.';
        return data.results.map(r =>
            `💥 *${r.name || r.volume?.name || 'Comic'}*\n_${r.description?.replace(/<[^>]+>/g, '').substring(0, 150) || ''}_`
        ).join('\n\n');
    } catch (e) { return `❌ ComicVine: ${e.message}`; }
}

async function spotifySearch(query, type = 'track') {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) return '❌ Spotify search requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.';
    try {
        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'grant_type=client_credentials'
        });
        const tokenData = await tokenRes.json();
        const token = tokenData.access_token;

        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=5`;
        const data = await fetchJSON(url, { headers: { 'Authorization': `Bearer ${token}` } }, `spotify_${type}_${query}`, 'spotify', 20);

        if (type === 'track' && data.tracks?.items?.length) {
            return data.tracks.items.map(t =>
                `🎵 *${t.name}* by ${t.artists.map(a => a.name).join(', ')}\n💿 Album: ${t.album.name}\n⏱️ ${Math.floor(t.duration_ms / 60000)}:${String(Math.floor((t.duration_ms % 60000) / 1000)).padStart(2, '0')}\n🔗 ${t.external_urls.spotify}`
            ).join('\n\n');
        } else if (type === 'artist' && data.artists?.items?.length) {
            return data.artists.items.map(a =>
                `🎤 *${a.name}*\n👥 Followers: ${a.followers.total.toLocaleString()}\n🎭 Genres: ${a.genres.slice(0, 3).join(', ') || 'N/A'}\n🔗 ${a.external_urls.spotify}`
            ).join('\n\n');
        }
        return 'No Spotify results.';
    } catch (e) { return `❌ Spotify: ${e.message}`; }
}

async function lastfmSearch(query, type = 'track') {
    const key = process.env.LASTFM_API_KEY;
    if (!key) return '❌ Last.fm API key required.';
    try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=${type}.search&${type}=${encodeURIComponent(query)}&api_key=${key}&format=json&limit=5`;
        const data = await fetchJSON(url, {}, `lastfm_${type}_${query}`, 'lastfm', 20);
        const results = data.results?.[`${type}matches`]?.[type === 'track' ? 'track' : type === 'artist' ? 'artist' : 'album'];
        if (!results?.length) return 'No Last.fm results.';
        return results.slice(0, 5).map(r =>
            `🎵 *${r.name}*${r.artist ? ` by ${r.artist}` : ''}\n👂 ${r.listeners ? parseInt(r.listeners).toLocaleString() + ' listeners' : ''}`
        ).join('\n\n');
    } catch (e) { return `❌ Last.fm: ${e.message}`; }
}

async function deezerSearch(query, type = 'track') {
    try {
        const url = `https://api.deezer.com/search/${type}?q=${encodeURIComponent(query)}&limit=5`;
        const data = await fetchJSON(url, {}, `deezer_${type}_${query}`, 'deezer', 20);
        if (!data.data?.length) return 'No Deezer results.';
        return data.data.map(d => {
            if (type === 'track') return `🎵 *${d.title}* by ${d.artist.name}\n💿 ${d.album.title}\n🔗 ${d.link}`;
            if (type === 'artist') return `🎤 *${d.name}*\n👥 ${d.nb_fan?.toLocaleString() || 0} fans\n🔗 ${d.link}`;
            return `🎵 *${d.title}*\n🔗 ${d.link}`;
        }).join('\n\n');
    } catch (e) { return `❌ Deezer: ${e.message}`; }
}

async function lyricsSearch(artist, title) {
    try {
        const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
        const data = await fetchJSON(url, {}, `lyrics_${artist}_${title}`, 'lyricsovh', 10);
        if (data.lyrics) {
            return `🎤 *${title}* by *${artist}*\n\n${data.lyrics.substring(0, 1500)}${data.lyrics.length > 1500 ? '...' : ''}`;
        }
    } catch (e) {}
    return '❌ Lyrics not found. Try `.lyrics "artist" "song"`';
}

async function giphySearch(query) {
    const key = process.env.GIPHY_API_KEY;
    if (!key) return '❌ GIPHY API key required.';
    try {
        const url = `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(query)}&limit=5`;
        const data = await fetchJSON(url, {}, `giphy_${query}`, 'giphy', 20);
        if (!data.data?.length) return 'No GIFs found.';
        return data.data.map(g => `🎭 *GIF:* ${g.title}\n🔗 ${g.url}`).join('\n\n');
    } catch (e) { return `❌ GIPHY: ${e.message}`; }
}

async function tenorSearch(query) {
    const key = process.env.TENOR_API_KEY;
    if (!key) return '❌ Tenor API key required.';
    try {
        const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${key}&limit=5`;
        const data = await fetchJSON(url, {}, `tenor_${query}`, 'tenor', 20);
        if (!data.results?.length) return 'No Tenor GIFs found.';
        return data.results.map(g => `🎭 *GIF:* ${g.content_description || 'Animation'}\n🔗 ${g.url}`).join('\n\n');
    } catch (e) { return `❌ Tenor: ${e.message}`; }
}

// ========== 6. ACADEMIC & RESEARCH ==========

async function arxivSearch(query) {
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5`;
    try {
        const data = await fetchJSON(url, {}, `arxiv_${query}`, 'arxiv', 5);
        const text = data._xml || '';
        const entries = text.split('<entry>').slice(1);
        if (!entries.length) return 'No arXiv papers found.';
        return entries.slice(0, 5).map(entry => {
            const title = entry.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() || 'Untitled';
            const summary = entry.match(/<summary>([^<]+)<\/summary>/)?.[1]?.trim().substring(0, 200) || '';
            const id = entry.match(/<id>([^<]+)<\/id>/)?.[1] || '';
            const authors = [...entry.matchAll(/<name>([^<]+)<\/name>/g)].map(m => m[1]).join(', ');
            return `📄 *${title}*\n👤 ${authors}\n_${summary}..._\n🔗 ${id}`;
        }).join('\n\n');
    } catch (e) { return `❌ arXiv: ${e.message}`; }
}

async function crossrefSearch(query) {
    const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=5`;
    try {
        const data = await fetchJSON(url, {}, `crossref_${query}`, 'crossref', 10);
        if (!data.message?.items?.length) return 'No Crossref results.';
        return data.message.items.slice(0, 5).map(item => {
            const title = Array.isArray(item.title) ? item.title[0] : item.title || 'Untitled';
            const authors = item.author?.map(a => `${a.given || ''} ${a.family || ''}`.trim()).filter(Boolean).join(', ') || 'Unknown';
            return `📄 *${title}*\n👤 ${authors}\n📅 ${item.published?.['date-parts']?.[0]?.[0] || 'N/A'}\n🔗 ${item.URL}`;
        }).join('\n\n');
    } catch (e) { return `❌ Crossref: ${e.message}`; }
}

async function semanticScholarSearch(query) {
    const key = process.env.SEMANTIC_SCHOLAR_API_KEY;
    const headers = key ? { 'x-api-key': key } : {};
    try {
        const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&fields=title,authors,year,abstract,url,citationCount&limit=5`;
        const data = await fetchJSON(url, { headers }, `ss_${query}`, 'semanticscholar', key ? 100 : 5);
        if (!data.data?.length) return 'No Semantic Scholar results.';
        return data.data.map(p =>
            `📄 *${p.title}*\n👤 ${p.authors?.map(a => a.name).join(', ') || 'Unknown'}\n📅 ${p.year || 'N/A'} | 📊 Citations: ${p.citationCount || 0}\n_${p.abstract?.substring(0, 200) || ''}_`
        ).join('\n\n');
    } catch (e) { return `❌ Semantic Scholar: ${e.message}`; }
}

async function openAlexSearch(query) {
    const key = process.env.OPENALEX_API_KEY;
    const headers = key ? { 'Authorization': `Bearer ${key}` } : {};
    try {
        const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=5`;
        const data = await fetchJSON(url, { headers }, `openalex_${query}`, 'openalex', key ? 100 : 10);
        if (!data.results?.length) return 'No OpenAlex results.';
        return data.results.map(w => {
            const title = w.display_name || 'Untitled';
            const authors = w.authorships?.map(a => a.author.display_name).join(', ') || 'Unknown';
            return `📄 *${title}*\n👤 ${authors}\n📅 ${w.publication_year || 'N/A'} | 📊 Citations: ${w.cited_by_count || 0}\n🔗 ${w.open_access?.oa_url || w.id}`;
        }).join('\n\n');
    } catch (e) { return `❌ OpenAlex: ${e.message}`; }
}

async function pubmedSearch(query) {
    try {
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=5`;
        const searchData = await fetchJSON(searchUrl, {}, `pubmed_search_${query}`, 'pubmed', 3);
        const ids = searchData.esearchresult?.idlist;
        if (!ids?.length) return 'No PubMed results.';

        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
        const summaryData = await fetchJSON(summaryUrl, {}, `pubmed_summary_${query}`, 'pubmed', 3);
        const results = ids.map(id => {
            const article = summaryData.result[id];
            if (!article || id === 'uids') return null;
            return `🧬 *${article.title}*\n👤 ${article.sortfirstauthor || 'Unknown'}\n📅 ${article.pubdate || 'N/A'}\n📰 ${article.source || ''}`;
        }).filter(Boolean);
        return results.join('\n\n');
    } catch (e) { return `❌ PubMed: ${e.message}`; }
}

async function coreSearch(query) {
    const key = process.env.CORE_API_KEY;
    if (!key) return '❌ CORE API key required. Get one free at core.ac.uk.';
    try {
        const url = `https://api.core.ac.uk/v3/search/works?q=${encodeURIComponent(query)}&limit=5`;
        const data = await fetchJSON(url, { headers: { 'Authorization': `Bearer ${key}` } }, `core_${query}`, 'core', 20);
        if (!data.results?.length) return 'No CORE results.';
        return data.results.map(r =>
            `📄 *${r.title}*\n👤 ${r.authors?.map(a => a.name).join(', ') || 'Unknown'}\n📅 ${r.yearPublished || 'N/A'}\n_${r.abstract?.substring(0, 200) || ''}_`
        ).join('\n\n');
    } catch (e) { return `❌ CORE: ${e.message}`; }
}

async function googleScholarSearch(query) {
    const serpKey = process.env.SERPAPI_KEY;
    if (serpKey) {
        try {
            const url = `https://serpapi.com/search.json?engine=google_scholar&q=${encodeURIComponent(query)}&api_key=${serpKey}&num=5`;
            const data = await fetchJSON(url, {}, `scholar_${query}`, 'serpapi', 10);
            if (data.organic_results?.length) {
                return data.organic_results.map(r =>
                    `📄 *${r.title}*\n👤 ${r.publication_info?.summary?.substring(0, 100) || ''}\n🔗 ${r.link}`
                ).join('\n\n');
            }
        } catch (e) {}
    }
    return '❌ Google Scholar requires SERPAPI_KEY for API access.';
}

async function doiLookup(doi) {
    try {
        const url = `https://doi.org/${encodeURIComponent(doi)}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' }, redirect: 'follow' });
        const data = await res.json();
        return `📄 *DOI: ${doi}*\n${JSON.stringify(data, null, 2).substring(0, 1000)}`;
    } catch (e) { return `❌ DOI lookup failed: ${e.message}`; }
}

// ========== 7. NEWS ==========

async function newsSearch(query = '') {
    const gnewsKey = process.env.GNEWS_API_KEY;
    if (gnewsKey && query) {
        try {
            const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&token=${gnewsKey}&lang=en&max=5`;
            const data = await fetchJSON(url, {}, `gnews_${query}`, 'gnews', 20);
            if (data.articles?.length) {
                return data.articles.map(a => formatResult(a.title, a.description?.substring(0, 150) || '', a.url, {}, '📰')).join('\n\n');
            }
        } catch (e) {}
    }

    const newsKey = process.env.NEWSAPI_KEY;
    if (newsKey && query) {
        try {
            const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${newsKey}&pageSize=5&sortBy=relevancy`;
            const data = await fetchJSON(url, {}, `newsapi_${query}`, 'newsapi', 20);
            if (data.articles?.length) {
                return data.articles.map(a => formatResult(a.title, a.description?.substring(0, 150) || '', a.url, { subtitle: a.source.name }, '📰')).join('\n\n');
            }
        } catch (e) {}
    }

    const currentsKey = process.env.CURRENTS_API_KEY;
    if (currentsKey && query) {
        try {
            const url = `https://api.currentsapi.services/v1/search?keywords=${encodeURIComponent(query)}&apiKey=${currentsKey}&limit=5`;
            const data = await fetchJSON(url, {}, `currents_${query}`, 'currents', 20);
            if (data.news?.length) {
                return data.news.map(a => formatResult(a.title, a.description?.substring(0, 150) || '', a.url, {}, '📰')).join('\n\n');
            }
        } catch (e) {}
    }

    const feeds = [
        'https://feeds.bbci.co.uk/news/rss.xml',
        'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
        'https://rss.cnn.com/rss/cnn_topstories.rss'
    ];
    try {
        const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feeds[0])}`;
        const data = await fetchJSON(rssUrl, {}, 'latest_news', 'rss2json', 10);
        if (data.items?.length) {
            return data.items.slice(0, 5).map(item => formatResult(item.title, item.description?.substring(0, 120) + '...', item.link, {}, '📰')).join('\n\n');
        }
    } catch (e) {}

    return '❌ News fetch failed. Set GNEWS_API_KEY, NEWSAPI_KEY, or CURRENTS_API_KEY for better results.';
}

async function hackernewsSearch(query) {
    try {
        const searchUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&hitsPerPage=5`;
        const data = await fetchJSON(searchUrl, {}, `hn_${query}`, 'hackernews', 20);
        if (!data.hits?.length) return 'No HackerNews results.';
        return data.hits.map(h =>
            `🟠 *${h.title}*\n👍 ${h.points} | 💬 ${h.num_comments} comments\n🔗 ${h.url || `https://news.ycombinator.com/item?id=${h.objectID}`}`
        ).join('\n\n');
    } catch (e) { return `❌ HackerNews: ${e.message}`; }
}

async function techCrunchSearch(query) {
    try {
        const url = `https://techcrunch.com/wp-json/wp/v2/posts?search=${encodeURIComponent(query)}&per_page=5`;
        const data = await fetchJSON(url, {}, `tc_${query}`, 'techcrunch', 10);
        if (!data.length) return 'No TechCrunch articles found.';
        return data.map(a => formatResult(a.title.rendered.replace(/<[^>]+>/g, ''), a.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 150), a.link, {}, '💻')).join('\n\n');
    } catch (e) { return `❌ TechCrunch: ${e.message}`; }
}

// ========== 8. SHOPPING & PRODUCTS ==========

async function ebaySearch(query) {
    const key = process.env.EBAY_API_KEY;
    if (!key) return '❌ eBay API key required.';
    try {
        const url = `https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=${key}&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords=${encodeURIComponent(query)}&paginationInput.entriesPerPage=5`;
        const data = await fetchJSON(url, {}, `ebay_${query}`, 'ebay', 10);
        const items = data.findItemsByKeywordsResponse?.[0]?.searchResult?.[0]?.item;
        if (!items?.length) return 'No eBay items found.';
        return items.slice(0, 5).map(item =>
            `🛒 *${item.title?.[0] || 'Item'}*\n💰 $${item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || '?'}\n🔗 ${item.viewItemURL?.[0]}`
        ).join('\n\n');
    } catch (e) { return `❌ eBay: ${e.message}`; }
}

async function amazonSearch(query) {
    const key = process.env.AMAZON_API_KEY;
    if (!key) {
        try {
            const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
            const html = await fetchHTML(url, {}, `amazon_${query}`);
            const matches = [...html.matchAll(/<span class="a-size-medium a-color-base a-text-normal">([^<]+)<\/span>/g)];
            if (!matches.length) return '❌ Amazon search requires API key or advanced scraping.';
            return matches.slice(0, 5).map((m, i) => `📦 *Product ${i + 1}:* ${m[1].trim()}`).join('\n');
        } catch (e) { return `❌ Amazon: ${e.message}`; }
    }
    return '❌ Amazon Product Advertising API requires special signature generation.';
}

async function aliexpressSearch(query) {
    try {
        const url = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(query)}`;
        const html = await fetchHTML(url, {}, `ali_${query}`);
        const matches = [...html.matchAll(/<a[^>]*title="([^"]+)"[^>]*class="[^"]*manhattan-product-title[^"]*"/g)];
        if (!matches.length) return '❌ AliExpress search requires advanced scraping.';
        return matches.slice(0, 5).map((m, i) => `📦 *Product ${i + 1}:* ${m[1].trim()}`).join('\n');
    } catch (e) { return `❌ AliExpress: ${e.message}`; }
}

async function etsySearch(query) {
    const key = process.env.ETSY_API_KEY;
    if (!key) return '❌ Etsy API key required.';
    try {
        const url = `https://openapi.etsy.com/v3/application/listings/active?keywords=${encodeURIComponent(query)}&limit=5`;
        const data = await fetchJSON(url, { headers: { 'x-api-key': key } }, `etsy_${query}`, 'etsy', 20);
        if (!data.results?.length) return 'No Etsy listings found.';
        return data.results.map(l =>
            `🎨 *${l.title}*\n💰 $${l.price?.amount / l.price?.divisor || '?'}\n🔗 https://www.etsy.com/listing/${l.listing_id}`
        ).join('\n\n');
    } catch (e) { return `❌ Etsy: ${e.message}`; }
}

// ========== 9. IMAGES ==========

async function imageSearch(query) {
    const pixabayKey = process.env.PIXABAY_API_KEY;
    if (pixabayKey) {
        try {
            const url = `https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=5`;
            const data = await fetchJSON(url, {}, `pixabay_${query}`, 'pixabay', 20);
            if (data.hits?.length) {
                return data.hits.map(img => `🖼️ *${query}* — ${img.imageWidth}x${img.imageHeight}\n${img.pageURL}`).join('\n\n');
            }
        } catch (e) {}
    }

    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    if (unsplashKey) {
        try {
            const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&client_id=${unsplashKey}`;
            const data = await fetchJSON(url, {}, `unsplash_${query}`, 'unsplash', 20);
            if (data.results?.length) {
                return data.results.map(img => `🖼️ *${img.description || query}* by ${img.user.name}\n🔗 ${img.links.html}`).join('\n\n');
            }
        } catch (e) {}
    }

    const pexelsKey = process.env.PEXELS_API_KEY;
    if (pexelsKey) {
        try {
            const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`;
            const data = await fetchJSON(url, { headers: { 'Authorization': pexelsKey } }, `pexels_${query}`, 'pexels', 20);
            if (data.photos?.length) {
                return data.photos.map(img => `🖼️ *${img.alt || query}* by ${img.photographer}\n🔗 ${img.url}`).join('\n\n');
            }
        } catch (e) {}
    }

    return '❌ Image search failed. Set PIXABAY_API_KEY, UNSPLASH_ACCESS_KEY, or PEXELS_API_KEY.';
}

// ========== 10. WEATHER & GEOGRAPHY ==========

async function weatherSearch(city) {
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geo = await fetchJSON(geoUrl, {}, `geo_${city}`, 'openmeteo', 20);
        if (!geo.results?.length) throw new Error('City not found');
        const { latitude, longitude, name, country } = geo.results[0];

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
        const weather = await fetchJSON(weatherUrl, {}, `weather_${latitude}_${longitude}`, 'openmeteo', 20);
        const current = weather.current;
        const daily = weather.daily;
        const codes = { 0: 'Clear ☀️', 1: 'Mainly clear 🌤️', 2: 'Partly cloudy ⛅', 3: 'Overcast ☁️', 45: 'Fog 🌫️', 51: 'Drizzle 🌦️', 61: 'Rain 🌧️', 71: 'Snow 🌨️', 95: 'Thunderstorm ⛈️' };
        const condition = codes[current.weather_code] || 'Unknown';

        return `🌤️ *Weather in ${name}, ${country}*\n🌡️ ${current.temperature_2m}°C (feels like ${current.apparent_temperature}°C)\n💧 Humidity: ${current.relative_humidity_2m}%\n💨 Wind: ${current.wind_speed_10m} km/h\n☁️ ${condition}\n📅 Today: High ${daily.temperature_2m_max[0]}°C / Low ${daily.temperature_2m_min[0]}°C`;
    } catch (e) { return `❌ Weather: ${e.message}`; }
}

async function openWeatherSearch(city) {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) return '❌ OpenWeather API key required.';
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric`;
        const data = await fetchJSON(url, {}, `ow_${city}`, 'openweather', 20);
        return `🌤️ *Weather in ${data.name}, ${data.sys.country}*\n🌡️ ${data.main.temp}°C (feels like ${data.main.feels_like}°C)\n💧 Humidity: ${data.main.humidity}%\n💨 Wind: ${data.wind.speed} m/s\n☁️ ${data.weather[0].description}\n📊 Pressure: ${data.main.pressure} hPa`;
    } catch (e) { return `❌ OpenWeather: ${e.message}`; }
}

async function geocodeSearch(query) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
        const data = await fetchJSON(url, { headers: { 'User-Agent': 'MAUREONIX/3.0' } }, `geocode_${query}`, 'nominatim', 5);
        if (!data.length) return 'No geocoding results.';
        return data.map(r =>
            `📍 *${r.display_name}*\n🌐 Lat: ${r.lat}, Lon: ${r.lon}\n🏷️ Type: ${r.type}`
        ).join('\n\n');
    } catch (e) { return `❌ Geocode: ${e.message}`; }
}

// ========== 11. FINANCE & CRYPTO ==========

async function cryptoSearch(coin) {
    try {
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(coin)}&order=market_cap_desc&per_page=5&page=1&sparkline=false`;
        const data = await fetchJSON(url, {}, `cg_${coin}`, 'coingecko', 10);
        if (!data.length) {
            const searchUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(coin)}`;
            const searchData = await fetchJSON(searchUrl, {}, `cg_search_${coin}`, 'coingecko', 10);
            if (!searchData.coins?.length) return 'No cryptocurrency found.';
            return searchData.coins.slice(0, 5).map(c =>
                `₿ *${c.name}* (${c.symbol.toUpperCase()})\n#${c.market_cap_rank || '?'} Market Cap Rank\n🔗 https://www.coingecko.com/en/coins/${c.id}`
            ).join('\n\n');
        }
        return data.map(c =>
            `₿ *${c.name}* (${c.symbol.toUpperCase()})\n💰 $${c.current_price?.toLocaleString()}\n📊 24h: ${c.price_change_percentage_24h?.toFixed(2)}% | Market Cap: $${(c.market_cap / 1e9).toFixed(2)}B\n📈 High: $${c.high_24h} | Low: $${c.low_24h}`
        ).join('\n\n');
    } catch (e) { return `❌ Crypto: ${e.message}`; }
}

async function stockSearch(symbol) {
    const key = process.env.ALPHA_VANTAGE_KEY;
    if (!key) return '❌ Alpha Vantage API key required for stocks.';
    try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${key}`;
        const data = await fetchJSON(url, {}, `stock_${symbol}`, 'alphavantage', 5);
        const q = data['Global Quote'];
        if (!q || !q['01. symbol']) return 'No stock data found.';
        return `📈 *${q['01. symbol']}*\n💰 $${q['05. price']}\n📊 Change: ${q['09. change']} (${q['10. change percent']})\n📅 Open: $${q['02. open']} | High: $${q['03. high']} | Low: $${q['04. low']}\n📦 Volume: ${parseInt(q['06. volume']).toLocaleString()}`;
    } catch (e) { return `❌ Stock: ${e.message}`; }
}

async function exchangeRate(from, to) {
    const key = process.env.EXCHANGE_RATE_API_KEY;
    try {
        if (key) {
            const url = `https://v6.exchangerate-api.com/v6/${key}/pair/${encodeURIComponent(from)}/${encodeURIComponent(to)}`;
            const data = await fetchJSON(url, {}, `er_${from}_${to}`, 'exchangerate', 20);
            return `💱 *${from.toUpperCase()} → ${to.toUpperCase()}*\nRate: ${data.conversion_rate}\nLast Update: ${data.time_last_update_utc}`;
        }
        const url = `https://api.exchangerate-api.com/v4/latest/${encodeURIComponent(from)}`;
        const data = await fetchJSON(url, {}, `er_free_${from}`, 'exchangerate', 20);
        const rate = data.rates[to.toUpperCase()];
        if (!rate) return 'Currency not found.';
        return `💱 *${from.toUpperCase()} → ${to.toUpperCase()}*\nRate: ${rate}\nBase: ${data.base} | Date: ${data.date}`;
    } catch (e) { return `❌ Exchange rate: ${e.message}`; }
}

// ========== 12. GOVERNMENT & PUBLIC DATA ==========

async function nasaSearch(query) {
    const key = process.env.NASA_API_KEY || 'DEMO_KEY';
    try {
        const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=5`;
        const data = await fetchJSON(url, {}, `nasa_${query}`, 'nasa', 20);
        if (!data.collection?.items?.length) return 'No NASA results.';
        return data.collection.items.slice(0, 5).map(item => {
            const d = item.data?.[0];
            return `🚀 *${d.title}*\n📅 ${d.date_created?.split('T')[0] || 'N/A'}\n_${d.description?.substring(0, 150) || ''}_`;
        }).join('\n\n');
    } catch (e) { return `❌ NASA: ${e.message}`; }
}

async function worldBankSearch(query) {
    try {
        const url = `https://api.worldbank.org/v2/indicator?format=json&per_page=5&source=2`;
        const data = await fetchJSON(url, {}, `wb_${query}`, 'worldbank', 20);
        if (!data[1]?.length) return 'No World Bank indicators found.';
        return data[1].map(i => `🌍 *${i.name}*\nID: ${i.id}\n_${i.sourceNote?.substring(0, 150) || ''}_`).join('\n\n');
    } catch (e) { return `❌ World Bank: ${e.message}`; }
}

async function patentSearch(query) {
    try {
        const url = `https://api.patentsview.org/patents/query?q={"_text_any":{"patent_title":"${encodeURIComponent(query)}"}}&f=["patent_title","patent_date","inventor_first_name","inventor_last_name"]&per_page=5`;
        const data = await fetchJSON(url, {}, `patent_${query}`, 'uspto', 10);
        if (!data.patents?.length) return 'No patents found.';
        return data.patents.map(p =>
            `📜 *${p.patent_title}*\n📅 ${p.patent_date}\n👤 ${p.inventors?.map(i => `${i.inventor_first_name} ${i.inventor_last_name}`).join(', ') || 'Unknown'}`
        ).join('\n\n');
    } catch (e) { return `❌ Patent search: ${e.message}`; }
}

// ========== 13. FUN & MISC APIs ==========

async function randomUser() {
    try {
        const data = await fetchJSON('https://randomuser.me/api/', {}, 'random_user', 'randomuser', 10);
        const u = data.results[0];
        return `👤 *${u.name.first} ${u.name.last}*\n📧 ${u.email}\n📱 ${u.phone}\n📍 ${u.location.city}, ${u.location.country}\n🎂 ${new Date(u.dob.date).toLocaleDateString()} (${u.dob.age} years)`;
    } catch (e) { return `❌ Random user: ${e.message}`; }
}

async function nameInfo(name) {
    try {
        const [age, gender, nation] = await parallelLimit([
            () => fetchJSON(`https://api.agify.io?name=${encodeURIComponent(name)}`, {}, `agify_${name}`, 'agify', 20).catch(() => null),
            () => fetchJSON(`https://api.genderize.io?name=${encodeURIComponent(name)}`, {}, `genderize_${name}`, 'genderize', 20).catch(() => null),
            () => fetchJSON(`https://api.nationalize.io?name=${encodeURIComponent(name)}`, {}, `nationalize_${name}`, 'nationalize', 20).catch(() => null),
        ]);
        let result = `📛 *Name Analysis: ${name}*`;
        if (age) result += `\n🎂 Predicted Age: ${age.age}`;
        if (gender) result += `\n⚧ Predicted Gender: ${gender.gender} (${Math.round(gender.probability * 100)}% confidence)`;
        if (nation?.country?.length) result += `\n🌍 Likely Nationalities: ${nation.country.slice(0, 3).map(c => `${c.country_id} (${Math.round(c.probability * 100)}%)`).join(', ')}`;
        return result;
    } catch (e) { return `❌ Name info: ${e.message}`; }
}

async function pokemonSearch(name) {
    try {
        const url = `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name.toLowerCase())}`;
        const data = await fetchJSON(url, {}, `pokemon_${name}`, 'pokeapi', 20);
        return `⚡ *${data.name.toUpperCase()}* (#${data.id})\n📏 Height: ${data.height / 10}m | Weight: ${data.weight / 10}kg\n🏷️ Types: ${data.types.map(t => t.type.name).join(', ')}\n💪 Stats: ${data.stats.map(s => `${s.stat.name}: ${s.base_stat}`).join(', ')}`;
    } catch (e) { return `❌ Pokemon: ${e.message}`; }
}

async function chuckNorris() {
    try {
        const data = await fetchJSON('https://api.chucknorris.io/jokes/random', {}, 'chuck', 'chucknorris', 20);
        return `🥋 *Chuck Norris Fact*\n\n${data.value}`;
    } catch (e) { return `❌ Chuck Norris: ${e.message}`; }
}

async function dadJoke() {
    try {
        const data = await fetchJSON('https://icanhazdadjoke.com/', { headers: { 'Accept': 'application/json' } }, 'dadjoke', 'dadjoke', 20);
        return `😂 *Dad Joke*\n\n${data.joke}`;
    } catch (e) { return `❌ Dad joke: ${e.message}`; }
}

async function catFact() {
    try {
        const data = await fetchJSON('https://catfact.ninja/fact', {}, 'catfact', 'catfact', 20);
        return `🐱 *Cat Fact*\n\n${data.fact}`;
    } catch (e) { return `❌ Cat fact: ${e.message}`; }
}

async function dogImage() {
    try {
        const data = await fetchJSON('https://dog.ceo/api/breeds/image/random', {}, 'dogimg', 'dogceo', 20);
        return `🐕 *Random Dog*\n${data.message}`;
    } catch (e) { return `❌ Dog image: ${e.message}`; }
}

async function numberFact(number) {
    try {
        const data = await fetchJSON(`http://numbersapi.com/${encodeURIComponent(number)}`, {}, `num_${number}`, 'numbersapi', 20);
        return `🔢 *Number Fact: ${number}*\n\n${data._text || data}`;
    } catch (e) { return `❌ Number fact: ${e.message}`; }
}

async function rickAndMortySearch(query, type = 'character') {
    try {
        const url = `https://rickandmortyapi.com/api/${type}/?name=${encodeURIComponent(query)}`;
        const data = await fetchJSON(url, {}, `rm_${type}_${query}`, 'rickandmorty', 20);
        if (!data.results?.length) return 'No Rick and Morty results.';
        return data.results.slice(0, 5).map(r => {
            if (type === 'character') return `👽 *${r.name}*\n🟢 Status: ${r.status} | 👽 Species: ${r.species}\n📍 ${r.location.name}`;
            if (type === 'episode') return `📺 *${r.name}* (${r.episode})\n📅 ${r.air_date}`;
            return `🌍 *${r.name}*\n📍 ${r.type || 'Planet'}`;
        }).join('\n\n');
    } catch (e) { return `❌ Rick and Morty: ${e.message}`; }
}

async function starWarsSearch(query, type = 'people') {
    try {
        const url = `https://swapi.dev/api/${type}/?search=${encodeURIComponent(query)}`;
        const data = await fetchJSON(url, {}, `sw_${type}_${query}`, 'swapi', 20);
        if (!data.results?.length) return 'No Star Wars results.';
        return data.results.slice(0, 5).map(r => {
            if (type === 'people') return `⭐ *${r.name}*\n🟢 Height: ${r.height}cm | Weight: ${r.mass}kg\n👁️ Eye: ${r.eye_color} | 🎂 Birth: ${r.birth_year}`;
            if (type === 'planets') return `🌍 *${r.name}*\n👥 Population: ${r.population} | 🌡️ Climate: ${r.climate}`;
            if (type === 'starships') return `🚀 *${r.name}*\n💨 Speed: ${r.max_atmosphering_speed} | 👥 Crew: ${r.crew}`;
            return `⭐ *${r.name}*`;
        }).join('\n\n');
    } catch (e) { return `❌ Star Wars: ${e.message}`; }
}

async function harryPotterSearch(query, type = 'characters') {
    try {
        const url = `https://hp-api.onrender.com/api/${type}`;
        const data = await fetchJSON(url, {}, `hp_${type}`, 'hpapi', 20);
        const filtered = data.filter(item => item.name?.toLowerCase().includes(query.toLowerCase()));
        if (!filtered.length) return 'No Harry Potter characters found.';
        return filtered.slice(0, 5).map(c =>
            `⚡ *${c.name}*\n🏠 House: ${c.house || 'Unknown'} | 👤 Species: ${c.species}\n🎭 Actor: ${c.actor || 'Unknown'}`
        ).join('\n\n');
    } catch (e) { return `❌ Harry Potter: ${e.message}`; }
}

async function cocktailSearch(name) {
    try {
        const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`;
        const data = await fetchJSON(url, {}, `cocktail_${name}`, 'cocktaildb', 20);
        if (!data.drinks?.length) return 'No cocktails found.';
        return data.drinks.slice(0, 3).map(d => {
            const ingredients = [];
            for (let i = 1; i <= 15; i++) {
                if (d[`strIngredient${i}`]) ingredients.push(`${d[`strMeasure${i}`] || ''} ${d[`strIngredient${i}`]}`.trim());
            }
            return `🍸 *${d.strDrink}* (${d.strAlcoholic})\n🥃 Glass: ${d.strGlass}\n📝 ${ingredients.join(', ')}\n📖 ${d.strInstructions?.substring(0, 200)}`;
        }).join('\n\n');
    } catch (e) { return `❌ Cocktail: ${e.message}`; }
}

async function brewerySearch(query) {
    try {
        const url = `https://api.openbrewerydb.org/v1/breweries/search?query=${encodeURIComponent(query)}&per_page=5`;
        const data = await fetchJSON(url, {}, `brewery_${query}`, 'openbrewery', 20);
        if (!data.length) return 'No breweries found.';
        return data.map(b =>
            `🍺 *${b.name}*\n📍 ${b.city}, ${b.state || b.country}\n🏷️ Type: ${b.brewery_type}\n🔗 ${b.website_url || 'N/A'}`
        ).join('\n\n');
    } catch (e) { return `❌ Brewery: ${e.message}`; }
}

async function foodSearch(query) {
    const key = process.env.SPOONACULAR_API_KEY;
    if (!key) return '❌ Spoonacular API key required for food search.';
    try {
        const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=5&apiKey=${key}`;
        const data = await fetchJSON(url, {}, `food_${query}`, 'spoonacular', 20);
        if (!data.results?.length) return 'No recipes found.';
        return data.results.map(r =>
            `🍽️ *${r.title}*\n⏱️ Ready in: ${r.readyInMinutes || '?'} mins | Servings: ${r.servings || '?'}\n🔗 https://spoonacular.com/recipes/${r.title?.replace(/\s+/g, '-').toLowerCase()}-${r.id}`
        ).join('\n\n');
    } catch (e) { return `❌ Food: ${e.message}`; }
}

// ========== 14. UNIVERSAL / META SEARCH ==========

async function universalSearch(query, platforms = []) {
    const allPlatforms = {
        web: googleSearch,
        wiki: wikiSearch,
        reddit: redditSearch,
        github: githubSearch,
        youtube: youtubeSearch,
        news: newsSearch,
        anime: animeSearch,
        manga: mangaSearch,
        movie: movieSearch,
        game: gameSearch,
        music: (q) => spotifySearch(q, 'track'),
        image: imageSearch,
        weather: weatherSearch,
        crypto: cryptoSearch,
        stock: stockSearch,
        arxiv: arxivSearch,
        scholar: semanticScholarSearch,
        stackoverflow: stackOverflowSearch,
        twitter: twitterSearch,
        twitch: twitchSearch,
        npm: npmSearch,
        pypi: pypiSearch,
        docker: dockerHubSearch,
        urban: urbanDictionary,
        dictionary: dictionarySearch,
        giphy: giphySearch,
        hn: hackernewsSearch,
        pokemon: pokemonSearch,
        cocktail: cocktailSearch,
    };

    const targets = platforms.length ? platforms : Object.keys(allPlatforms);
    const tasks = targets.map(p => ({
        name: p,
        fn: () => allPlatforms[p]?.(query).catch(err => `❌ ${p}: ${err.message}`)
    })).filter(t => t.fn);

    const results = await parallelLimit(tasks.map(t => t.fn), CONFIG.concurrentLimit);

    let output = `🔥 *UNIVERSAL SEARCH: "${query}"*\n`;
    output += `📡 Searched ${targets.length} platforms\n`;
    output += `${'═'.repeat(40)}\n\n`;

    results.forEach((res, i) => {
        output += `【${targets[i].toUpperCase()}】\n${res}\n\n`;
    });

    return output;
}

async function findPerson(username) {
    const platforms = [
        { name: 'GitHub', fn: () => githubUserSearch(username) },
        { name: 'Reddit', fn: () => redditUserSearch(username) },
        { name: 'Twitter/X', fn: () => twitterUserSearch(username) },
        { name: 'Twitch', fn: () => twitchSearch(username) },
    ];

    const results = await parallelLimit(platforms.map(p => p.fn), CONFIG.concurrentLimit);

    let output = `👤 *PERSON SEARCH: "${username}"*\n`;
    output += `🔍 Checked ${platforms.length} platforms\n`;
    output += `${'═'.repeat(40)}\n\n`;

    results.forEach((res, i) => {
        output += `【${platforms[i].name}】\n${res}\n\n`;
    });

    return output;
}

async function findAnything(query) {
    const platforms = [
        { name: 'Wikipedia', fn: () => wikiSearch(query) },
        { name: 'Wikidata', fn: () => wikidataSearch(query) },
        { name: 'arXiv', fn: () => arxivSearch(query) },
        { name: 'Semantic Scholar', fn: () => semanticScholarSearch(query) },
        { name: 'Crossref', fn: () => crossrefSearch(query) },
        { name: 'OpenAlex', fn: () => openAlexSearch(query) },
        { name: 'PubMed', fn: () => pubmedSearch(query) },
    ];

    const results = await parallelLimit(platforms.map(p => p.fn), CONFIG.concurrentLimit);

    let output = `📚 *KNOWLEDGE SEARCH: "${query}"*\n`;
    output += `🔍 Checked ${platforms.length} academic platforms\n`;
    output += `${'═'.repeat(40)}\n\n`;

    results.forEach((res, i) => {
        output += `【${platforms[i].name}】\n${res}\n\n`;
    });

    return output;
}

// ═══════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    // Core utilities
    fetchJSON,
    fetchHTML,
    parallelLimit,
    cache,
    formatResult,

    // Web Search
    googleSearch,
    bingSearch,

    // Knowledge
    wikiSearch,
    wikidataSearch,
    urbanDictionary,
    dictionarySearch,

    // Social Media
    redditSearch,
    redditUserSearch,
    twitterSearch,
    twitterUserSearch,
    discordSearch,
    telegramSearch,
    mastodonSearch,
    blueskySearch,
    instagramSearch,
    tiktokSearch,
    pinterestSearch,
    linkedinSearch,
    snapchatSearch,
    twitchSearch,
    youtubeSearch,
    youtubeChannelSearch,

    // Code
    githubSearch,
    githubUserSearch,
    gitlabSearch,
    npmSearch,
    pypiSearch,
    dockerHubSearch,
    stackOverflowSearch,
    sourceForgeSearch,

    // Entertainment
    animeSearch,
    mangaSearch,
    movieSearch,
    tvSearch,
    gameSearch,
    igdbSearch,
    comicSearch,
    spotifySearch,
    lastfmSearch,
    deezerSearch,
    lyricsSearch,
    giphySearch,
    tenorSearch,

    // Academic
    arxivSearch,
    crossrefSearch,
    semanticScholarSearch,
    openAlexSearch,
    pubmedSearch,
    coreSearch,
    googleScholarSearch,
    doiLookup,

    // News
    newsSearch,
    hackernewsSearch,
    techCrunchSearch,

    // Shopping
    ebaySearch,
    amazonSearch,
    aliexpressSearch,
    etsySearch,

    // Images
    imageSearch,

    // Weather & Geo
    weatherSearch,
    openWeatherSearch,
    geocodeSearch,

    // Finance
    cryptoSearch,
    stockSearch,
    exchangeRate,

    // Government
    nasaSearch,
    worldBankSearch,
    patentSearch,

    // Fun
    randomUser,
    nameInfo,
    pokemonSearch,
    chuckNorris,
    dadJoke,
    catFact,
    dogImage,
    numberFact,
    rickAndMortySearch,
    starWarsSearch,
    harryPotterSearch,
    cocktailSearch,
    brewerySearch,
    foodSearch,

    // Meta
    universalSearch,
    findPerson,
    findAnything,
};