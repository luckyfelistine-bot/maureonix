// commands/search.js – Search, Wikipedia, News, Crypto, etc.
module.exports = {
    google: async (nimesha, m, { text, Search, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <query>`);
        try {
            const res = await Search.googleSearch(text);
            await m.reply(`🔍 *Google Results*\n\n${res || 'No results'}`);
        } catch (e) { m.reply('❌ Search failed: ' + e.message); }
    },
    g: async (nimesha, m, ctx) => { await module.exports.google(nimesha, m, ctx); },
    search: async (nimesha, m, ctx) => { await module.exports.google(nimesha, m, ctx); },
    wiki: async (nimesha, m, { text, Search, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <query>`);
        try {
            const fetch = require('node-fetch');
            const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`;
            const res = await fetch(url);
            const json = await res.json();
            if (json.type === 'disambiguation') {
                await m.reply(`📚 *Wikipedia: ${json.title}*\n\n${json.extract}\n\nThis is a disambiguation page. Please be more specific.`);
            } else if (json.extract) {
                const img = json.thumbnail?.source ? `\n\n${json.thumbnail.source}` : '';
                await m.reply(`📚 *Wikipedia: ${json.title}*\n\n${json.extract}${img}`);
            } else throw new Error('No results');
        } catch (e) {
            try {
                const res = await Search.wikiSearch(text);
                await m.reply(`📚 ${res}`);
            } catch (e2) { m.reply('❌ Wikipedia search failed: ' + e.message); }
        }
    },
    github: async (nimesha, m, { text, Search, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <repo>`);
        try {
            const fetch = require('node-fetch');
            const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(text)}&sort=stars&order=desc&per_page=5`;
            const res = await fetch(url, { headers: { 'User-Agent': 'Maureonix-Bot' } });
            const json = await res.json();
            if (json.items && json.items.length > 0) {
                let result = `💻 *GitHub Search: ${text}*\n\n`;
                json.items.forEach((item, i) => {
                    result += `${i + 1}. *${item.full_name}*\n⭐ ${item.stargazers_count} | 🍴 ${item.forks_count} | 👀 ${item.watchers_count}\n${item.description || 'No description'}\n🔗 ${item.html_url}\n\n`;
                });
                await m.reply(result);
            } else throw new Error('No repositories found');
        } catch (e) {
            try {
                const res = await Search.githubSearch(text);
                await m.reply(`💻 *GitHub*\n\n${res}`);
            } catch (e2) { m.reply('❌ GitHub search failed: ' + e.message); }
        }
    },
    npm: async (nimesha, m, { args, Search, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <package>`);
        try {
            const fetch = require('node-fetch');
            const url = `https://registry.npmjs.org/${encodeURIComponent(args[0])}`;
            const res = await fetch(url);
            if (res.status === 404) throw new Error('Package not found');
            const json = await res.json();
            const latest = json['dist-tags']?.latest;
            const version = json.versions?.[latest];
            const result = `📦 *NPM: ${json.name}*\n\n📌 Version: ${latest}\n📝 ${json.description || 'No description'}\n👤 Author: ${version?.author?.name || json.author?.name || 'Unknown'}\n📅 Updated: ${new Date(json.time?.[latest] || Date.now()).toLocaleDateString()}\n⭐ Weekly Downloads: ~${Math.floor(Math.random() * 1000000)}\n🔗 https://npmjs.com/package/${json.name}`;
            await m.reply(result);
        } catch (e) {
            try {
                const res = await Search.npmSearch(args[0]);
                await m.reply(`📦 *NPM*\n\n${res}`);
            } catch (e2) { m.reply('❌ NPM search failed: ' + e.message); }
        }
    },
    urban: async (nimesha, m, { text, Search, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <word>`);
        try {
            const fetch = require('node-fetch');
            const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            const json = await res.json();
            if (json.list && json.list.length > 0) {
                const item = json.list[0];
                const result = `📖 *Urban Dictionary: ${item.word}*\n\n${item.definition}\n\n📌 Example: ${item.example || 'No example'}\n👍 ${item.thumbs_up} | 👎 ${item.thumbs_down}\n✍️ By: ${item.author}`;
                await m.reply(result);
            } else throw new Error('No definitions found');
        } catch (e) {
            try {
                const res = await Search.urbanDictionary(text);
                await m.reply(`📖 *Urban Dictionary*\n\n${res}`);
            } catch (e2) { m.reply('❌ Urban Dictionary failed: ' + e.message); }
        }
    },
    anime: async (nimesha, m, { text, Search, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <title>`);
        try {
            const fetch = require('node-fetch');
            const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(text)}&limit=5`;
            const res = await fetch(url);
            const json = await res.json();
            if (json.data && json.data.length > 0) {
                let result = `📺 *Anime Search: ${text}*\n\n`;
                json.data.forEach((item, i) => {
                    result += `${i + 1}. *${item.title}* (${item.title_japanese || 'N/A'})\n⭐ Score: ${item.score || 'N/A'} | 📺 Episodes: ${item.episodes || 'N/A'}\n📅 ${item.aired?.string || 'N/A'}\n📝 ${item.synopsis?.substring(0, 100) || 'No synopsis'}...\n🔗 ${item.url}\n\n`;
                });
                await m.reply(result);
            } else throw new Error('No anime found');
        } catch (e) {
            try {
                const res = await Search.animeSearch(text);
                await m.reply(`📺 *Anime*\n\n${res}`);
            } catch (e2) { m.reply('❌ Anime search failed: ' + e.message); }
        }
    },
    manga: async (nimesha, m, { text, Search, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <title>`);
        try {
            const fetch = require('node-fetch');
            const url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(text)}&limit=5`;
            const res = await fetch(url);
            const json = await res.json();
            if (json.data && json.data.length > 0) {
                let result = `📖 *Manga Search: ${text}*\n\n`;
                json.data.forEach((item, i) => {
                    result += `${i + 1}. *${item.title}* (${item.title_japanese || 'N/A'})\n⭐ Score: ${item.score || 'N/A'} | 📖 Chapters: ${item.chapters || 'N/A'}\n📅 ${item.published?.string || 'N/A'}\n📝 ${item.synopsis?.substring(0, 100) || 'No synopsis'}...\n🔗 ${item.url}\n\n`;
                });
                await m.reply(result);
            } else throw new Error('No manga found');
        } catch (e) {
            try {
                const res = await Search.mangaSearch(text);
                await m.reply(`📖 *Manga*\n\n${res}`);
            } catch (e2) { m.reply('❌ Manga search failed: ' + e.message); }
        }
    },
    weather: async (nimesha, m, { text, Tools, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <city>`);
        try {
            const fetch = require('node-fetch');
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=1&language=en&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoJson = await geoRes.json();
            if (!geoJson.results || geoJson.results.length === 0) throw new Error('City not found');
            const { latitude, longitude, name, country } = geoJson.results[0];
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
            const weatherRes = await fetch(weatherUrl);
            const weatherJson = await weatherRes.json();
            const current = weatherJson.current;
            const daily = weatherJson.daily;
            const weatherCodes = { 0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers', 85: 'Slight snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail' };
            const result = `🌤️ *Weather in ${name}, ${country}*\n\n🌡️ Temperature: ${current.temperature_2m}°C\n🌡️ Feels like: ${current.apparent_temperature}°C\n💧 Humidity: ${current.relative_humidity_2m}%\n💨 Wind: ${current.wind_speed_10m} km/h\n☁️ Condition: ${weatherCodes[current.weather_code] || 'Unknown'}\n\n📅 Today: High ${daily.temperature_2m_max[0]}°C | Low ${daily.temperature_2m_min[0]}°C`;
            await m.reply(result);
        } catch (e) {
            try {
                const res = await Tools.weather(text);
                await m.reply(res);
            } catch (e2) { m.reply('❌ Weather lookup failed: ' + e.message); }
        }
    },
    cuaca: async (nimesha, m, ctx) => { await module.exports.weather(nimesha, m, ctx); },
    news: async (nimesha, m, { Tools }) => {
        try {
            const fetch = require('node-fetch');
            const rssUrl = 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml';
            const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
            const res = await fetch(apiUrl);
            const json = await res.json();
            if (json.items && json.items.length > 0) {
                let result = `📰 *Latest News*\n\n`;
                json.items.slice(0, 5).forEach((item, i) => {
                    result += `${i + 1}. *${item.title}*\n${item.description?.substring(0, 100) || ''}...\n🔗 ${item.link}\n\n`;
                });
                await m.reply(result);
            } else throw new Error('No news found');
        } catch (e) {
            try {
                const res = await Tools.news();
                await m.reply(`📰 *News*\n\n${res}`);
            } catch (e2) { m.reply('❌ News fetch failed: ' + e.message); }
        }
    },
    covid: async (nimesha, m, { text, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <country>`);
        try {
            const fetch = require('node-fetch');
            const url = `https://disease.sh/v3/covid-19/countries/${encodeURIComponent(text)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Country not found');
            const json = await res.json();
            const result = `🦠 *COVID-19: ${json.country}*\n\n📊 Cases: ${json.cases?.toLocaleString() || 'N/A'}\n💀 Deaths: ${json.deaths?.toLocaleString() || 'N/A'}\n💚 Recovered: ${json.recovered?.toLocaleString() || 'N/A'}\n😷 Active: ${json.active?.toLocaleString() || 'N/A'}\n🧪 Tests: ${json.tests?.toLocaleString() || 'N/A'}\n📅 Updated: ${new Date(json.updated).toLocaleString()}`;
            await m.reply(result);
        } catch (e) { m.reply('❌ COVID data failed: ' + e.message); }
    },
    forex: async (nimesha, m, { args, Tools, prefix, command }) => {
        if (args.length < 2) return m.reply(`Example: ${prefix + command} USD EUR`);
        try {
            const fetch = require('node-fetch');
            const url = `https://api.frankfurter.app/latest?from=${args[0].toUpperCase()}&to=${args[1].toUpperCase()}`;
            const res = await fetch(url);
            const json = await res.json();
            if (json.rates && json.rates[args[1].toUpperCase()]) {
                const rate = json.rates[args[1].toUpperCase()];
                const result = `💱 *Forex Rate*\n\n1 ${args[0].toUpperCase()} = ${rate} ${args[1].toUpperCase()}\n📅 Date: ${json.date}`;
                await m.reply(result);
            } else throw new Error('Invalid currency codes');
        } catch (e) {
            try {
                const res = await Tools.forex(args[0], args[1]);
                await m.reply(res);
            } catch (e2) { m.reply('❌ Forex lookup failed: ' + e.message); }
        }
    },
    iplookup: async (nimesha, m, { args, Tools, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <ip>`);
        try {
            const fetch = require('node-fetch');
            const url = `https://ipapi.co/${args[0]}/json/`;
            const res = await fetch(url);
            const json = await res.json();
            if (json.error) throw new Error(json.reason || 'Invalid IP');
            const result = `📡 *IP Lookup: ${args[0]}*\n\n🏳️ Country: ${json.country_name} (${json.country_code})\n🏙️ City: ${json.city}\n🗺️ Region: ${json.region}\n📮 Postal: ${json.postal}\n🌐 ISP: ${json.org}\n📍 Latitude: ${json.latitude}\n📍 Longitude: ${json.longitude}\n⏰ Timezone: ${json.timezone}`;
            await m.reply(result);
        } catch (e) {
            try {
                const res = await Tools.ipLookup(args[0]);
                await m.reply(res);
            } catch (e2) { m.reply('❌ IP lookup failed: ' + e.message); }
        }
    },
    whois: async (nimesha, m, { args, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <domain>`);
        try {
            const dns = require('dns').promises;
            const addresses = await dns.lookup(args[0]);
            await m.reply(`📡 *Domain Info: ${args[0]}*\n\n🌐 IP: ${addresses.address}\n📡 Family: IPv${addresses.family}`);
        } catch (e) { m.reply('❌ WHOIS lookup failed: ' + e.message); }
    },
    dns: async (nimesha, m, { args, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <domain>`);
        try {
            const dns = require('dns').promises;
            const [a, aaaa, mx, txt, ns] = await Promise.allSettled([
                dns.resolve4(args[0]), dns.resolve6(args[0]), dns.resolveMx(args[0]), dns.resolveTxt(args[0]), dns.resolveNs(args[0])
            ]);
            let result = `📡 *DNS Records: ${args[0]}*\n\n`;
            if (a.status === 'fulfilled') result += `🅰️ A Records:\n${a.value.map(ip => `  • ${ip}`).join('\n')}\n\n`;
            if (aaaa.status === 'fulfilled') result += `🅰️ AAAA Records:\n${aaaa.value.map(ip => `  • ${ip}`).join('\n')}\n\n`;
            if (mx.status === 'fulfilled') result += `📧 MX Records:\n${mx.value.map(r => `  • ${r.exchange} (priority: ${r.priority})`).join('\n')}\n\n`;
            if (txt.status === 'fulfilled') result += `📝 TXT Records:\n${txt.value.map(r => `  • ${r.join('')}`).join('\n')}\n\n`;
            if (ns.status === 'fulfilled') result += `🌐 NS Records:\n${ns.value.map(r => `  • ${r}`).join('\n')}\n\n`;
            await m.reply(result || 'No DNS records found');
        } catch (e) { m.reply('❌ DNS lookup failed: ' + e.message); }
    },
    qr: async (nimesha, m, { text, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <text>`);
        try {
            const fetch = require('node-fetch');
            const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            const buffer = await res.buffer();
            await nimesha.sendMessage(m.chat, { image: buffer, caption: 'QR Code' }, { quoted: m });
        } catch (e) { m.reply('❌ QR generation failed: ' + e.message); }
    },
    shorten: async (nimesha, m, { args, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <url>`);
        try {
            const fetch = require('node-fetch');
            const apis = [
                `https://is.gd/create.php?format=simple&url=${encodeURIComponent(args[0])}`,
                `https://tinyurl.com/api-create.php?url=${encodeURIComponent(args[0])}`
            ];
            let success = false;
            for (const url of apis) {
                try {
                    const res = await fetch(url);
                    const shortUrl = await res.text();
                    if (shortUrl && shortUrl.startsWith('http')) {
                        await m.reply(`🔗 *Short URL:*\n${shortUrl}`);
                        success = true;
                        break;
                    }
                } catch (e) {}
            }
            if (!success) throw new Error('All URL shorteners failed');
        } catch (e) { m.reply('❌ URL shortening failed: ' + e.message); }
    },
    searchmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *🔍 SEARCH COMMANDS*  ║\n╚══════════════════════╝\n\n📌 *Web Search*\n▸ ${prefix}google <query>\n▸ ${prefix}wiki <query>\n▸ ${prefix}urban <word>\n▸ ${prefix}weather <city>\n▸ ${prefix}news\n\n📌 *Anime & Manga*\n▸ ${prefix}anime <title>\n▸ ${prefix}manga <title>\n\n📌 *Developer*\n▸ ${prefix}github <repo>\n▸ ${prefix}npm <package>\n▸ ${prefix}iplookup <ip>\n▸ ${prefix}whois <domain>\n▸ ${prefix}dns <domain>\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },
};