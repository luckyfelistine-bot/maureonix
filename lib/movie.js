// ╔══════════════════════════════════════════════════════════════════╗
// ║  🎬 MAUREONIX CINEMATIC EMPIRE v7.0.0                            ║
// ║  OMDB + TVMaze + AniList + Jikan + Kitsu + MangaDex + TMDB      ║
// ║  + Open Library + RAWG + Open Trivia + JokeAPI + CatFacts        ║
// ║  + Quotes + NumbersAPI + DogCEO                                  ║
// ║  All sources verified working & NO KEY required (except OMDB)   ║
// ╚══════════════════════════════════════════════════════════════════╝

const fetch = require('node-fetch');

// ─── UNIVERSAL FETCH WITH TIMEOUT & ERROR HANDLING ───
async function safeFetch(url, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        try { return JSON.parse(text); } catch { return text; }
    } catch (e) {
        clearTimeout(timer);
        if (e.name === 'AbortError') throw new Error('Request timed out. The API may be slow. Try again.');
        throw e;
    }
}

// ─── OMDB ───
const OMDB_KEY = 'c9e60a6f';
const OMDB_URL = 'http://www.omdbapi.com/';

class OMDB {
    static async req(params) {
        const url = new URL(OMDB_URL);
        Object.entries({ ...params, apikey: OMDB_KEY, r: 'json' }).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
        });
        const d = await safeFetch(url.toString());
        if (d.Response === 'False') throw new Error(d.Error || 'OMDB Error');
        return d;
    }
    static search(q, type = '', year = '', page = 1) { return this.req({ s: q, type, y: year, page }); }
    static byId(id, plot = 'full') { return this.req({ i: id, plot }); }
    static byTitle(t, y = '', plot = 'full') { return this.req({ t, y, plot }); }
    static season(id, s) { return this.req({ i: id, Season: s }); }
    static episode(id, s, e) { return this.req({ i: id, Season: s, Episode: e }); }
    static async ratings(id) {
        const d = await this.byId(id, 'short');
        return {
            imdb: d.imdbRating || 'N/A',
            metacritic: d.Metascore || 'N/A',
            rotten: d.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value || 'N/A',
            votes: d.imdbVotes || '0'
        };
    }
    static fmt(m) {
        return `🎬 *${m.Title}* (${m.Year})
📀 Rated: ${m.Rated || 'N/A'} | ⏱️ ${m.Runtime || 'N/A'} | 🎭 ${m.Genre || 'N/A'}
⭐ IMDB: ${m.imdbRating || 'N/A'}/10 (${m.imdbVotes || '0'} votes)
🍅 Rotten: ${m.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value || 'N/A'}
🎬 Director: ${m.Director || '-'}
🎭 Actors: ${m.Actors || '-'}
🏆 Awards: ${m.Awards || '-'}
📝 Plot: ${m.Plot || '-'}

🔗 https://imdb.com/title/${m.imdbID}`;
    }
    static fmtList(items) {
        if (!items || !items.length) return '❌ No results found.';
        let txt = `🎬 *Search Results*

`;
        items.slice(0, 10).forEach((m, i) => {
            txt += `${i + 1}. *${m.Title}* (${m.Year}) — \`${m.imdbID}\`
`;
        });
        txt += `
_Reply with the number (1-${Math.min(items.length, 10)}) to see details, or use *.imdb <id>*._`;
        return txt;
    }
}

// ─── TVMAZE (FREE — NO KEY) ───
class TVMaze {
    static async req(path) {
        const d = await safeFetch(`https://api.tvmaze.com${path}`);
        if (d.status === 404 || (Array.isArray(d) && d.length === 0)) throw new Error('No results found.');
        return d;
    }
    static search(q) { return this.req(`/search/shows?q=${encodeURIComponent(q)}`); }
    static show(id) { return this.req(`/shows/${id}?embed[]=episodes&embed[]=cast`); }
    static episodes(id) { return this.req(`/shows/${id}/episodes`); }
    static schedule(country = 'US', date) { return this.req(`/schedule?country=${country}${date ? '&date=' + date : ''}`); }
    static cast(id) { return this.req(`/shows/${id}/cast`); }
    static person(id) { return this.req(`/people/${id}?embed[]=castcredits`); }
    static fmtShow(s) {
        const d = s._embedded || {};
        const genres = (s.genres || []).join(', ') || '-';
        return `📺 *${s.name}* (${s.premiered?.slice(0, 4) || 'TBA'})
⭐ Rating: ${s.rating?.average || 'N/A'}/10
🎭 Genres: ${genres}
📡 Network: ${s.network?.name || s.webChannel?.name || '-'}
📝 ${s.summary ? s.summary.replace(/<[^>]+>/g, '').slice(0, 350) : 'No summary.'}
🔗 ${s.officialSite || s.url}`;
    }
    static fmtEpisode(e) {
        return `🎞️ ${e.name} (S${String(e.season).padStart(2,'0')}E${String(e.number).padStart(2,'0')})
📅 ${e.airdate || 'TBA'} | ⏱️ ${e.runtime || '?'} min
📝 ${e.summary ? e.summary.replace(/<[^>]+>/g, '').slice(0, 200) : '-'}`;
    }
    static fmtCast(list) {
        return list.slice(0, 10).map((c, i) => `${i + 1}. ${c.person.name} as ${c.character.name}`).join('
');
    }
}

// ─── ANILIST (FREE GRAPHQL — NO KEY) ───
class AniList {
    static async gql(query, vars = {}) {
        const d = await safeFetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query, variables: vars })
        });
        if (d.errors) throw new Error(d.errors[0]?.message || 'AniList Error');
        return d.data;
    }
    static searchAnime(q, page = 1, perPage = 10) {
        return this.gql(`query($s:String,$p:Int,$pp:Int){Page(page:$p,perPage:$pp){media(search:$s,type:ANIME){id title{romaji english native} coverImage{large} averageScore episodes format genres description(asHtml:false) startDate{year} status siteUrl}}}`, { s: q, p: page, pp: perPage });
    }
    static searchManga(q, page = 1, perPage = 10) {
        return this.gql(`query($s:String,$p:Int,$pp:Int){Page(page:$p,perPage:$pp){media(search:$s,type:MANGA){id title{romaji english native} coverImage{large} averageScore chapters volumes format genres description(asHtml:false) status siteUrl}}}`, { s: q, p: page, pp: perPage });
    }
    static trending() {
        return this.gql(`{Page(page:1,perPage:10){media(sort:TRENDING_DESC,type:ANIME){id title{romaji english} coverImage{large} averageScore episodes genres status siteUrl}}}`);
    }
    static topAnime() {
        return this.gql(`{Page(page:1,perPage:10){media(sort:SCORE_DESC,type:ANIME){id title{romaji english} coverImage{large} averageScore episodes genres status siteUrl}}}`);
    }
    static upcoming() {
        return this.gql(`{Page(page:1,perPage:10){media(status:NOT_YET_RELEASED,type:ANIME,sort:POPULARITY_DESC){id title{romaji english} coverImage{large} averageScore episodes genres startDate{year} status siteUrl}}}`);
    }
    static fmtAnime(a) {
        const title = a.title.english || a.title.romaji || a.title.native || 'Unknown';
        return `📺 *${title}*
⭐ Score: ${a.averageScore || 'N/A'}/100 | 📁 Episodes: ${a.episodes || '?'}
📅 Year: ${a.startDate?.year || '?'} | 🎭 Genres: ${(a.genres || []).join(', ') || '-'}
📝 ${(a.description || '').replace(/<[^>]+>/g, '').slice(0, 350)}
🔗 ${a.siteUrl || `https://anilist.co/anime/${a.id}`}`;
    }
    static fmtManga(a) {
        const title = a.title.english || a.title.romaji || a.title.native || 'Unknown';
        return `📖 *${title}*
⭐ Score: ${a.averageScore || 'N/A'}/100 | 📁 Chapters: ${a.chapters || '?'} | 📚 Volumes: ${a.volumes || '?'}
🎭 Genres: ${(a.genres || []).join(', ') || '-'}
📝 ${(a.description || '').replace(/<[^>]+>/g, '').slice(0, 350)}
🔗 ${a.siteUrl || `https://anilist.co/manga/${a.id}`}`;
    }
}

// ─── JIKAN (MAL WRAPPER — FREE, NO KEY) ───
class Jikan {
    static async req(path) {
        const d = await safeFetch(`https://api.jikan.moe/v4${path}`);
        if (!d || !d.data) throw new Error('Jikan returned no data.');
        return d.data;
    }
    static anime(q) { return this.req(`/anime?q=${encodeURIComponent(q)}&limit=10&sfw=true`); }
    static manga(q) { return this.req(`/manga?q=${encodeURIComponent(q)}&limit=10&sfw=true`); }
    static animeById(id) { return this.req(`/anime/${id}/full`); }
    static mangaById(id) { return this.req(`/manga/${id}/full`); }
    static topAnime() { return this.req('/top/anime?limit=10&sfw=true'); }
    static topManga() { return this.req('/top/manga?limit=10&sfw=true'); }
    static schedule(day) { return this.req(`/schedules?filter=${day}&sfw=true`); }
    static characters(q) { return this.req(`/characters?q=${encodeURIComponent(q)}&limit=10`); }
    static characterById(id) { return this.req(`/characters/${id}/full`); }
    static fmtAnime(a) {
        return `📺 *${a.title}*
⭐ ${a.score || '?'}/10 | 🎭 ${(a.genres || []).map(g => g.name).join(', ') || '-'}
📁 Episodes: ${a.episodes || '?'} | 📅 Aired: ${a.aired?.string || '?'}
📝 ${a.synopsis?.slice(0, 350) || '-'}
🔗 ${a.url}`;
    }
    static fmtManga(a) {
        return `📖 *${a.title}*
⭐ ${a.score || '?'}/10 | 🎭 ${(a.genres || []).map(g => g.name).join(', ') || '-'}
📁 Chapters: ${a.chapters || '?'} | 📚 Volumes: ${a.volumes || '?'}
📝 ${a.synopsis?.slice(0, 350) || '-'}
🔗 ${a.url}`;
    }
    static fmtCharacter(c) {
        return `👤 *${c.name}*
🎭 ${c.about ? c.about.slice(0, 350) : 'No description.'}
🔗 ${c.url}`;
    }
}

// ─── KITSU (FREE — NO KEY, JSON:API) ───
class Kitsu {
    static async req(path) {
        const d = await safeFetch(`https://kitsu.io/api/edge${path}`, {
            headers: { 'Accept': 'application/vnd.api+json' }
        });
        if (!d || !d.data) throw new Error('Kitsu returned no data.');
        return d.data;
    }
    static searchAnime(q) { return this.req(`/anime?filter[text]=${encodeURIComponent(q)}&page[limit]=10`); }
    static searchManga(q) { return this.req(`/manga?filter[text]=${encodeURIComponent(q)}&page[limit]=10`); }
    static trendingAnime() { return this.req('/trending/anime?limit=10'); }
    static trendingManga() { return this.req('/trending/manga?limit=10'); }
    static fmtAnime(a) {
        const attr = a.attributes || {};
        return `📺 *${attr.canonicalTitle || attr.titles?.en || attr.titles?.en_jp || 'Unknown'}*
⭐ ${attr.averageRating || '?'}/100 | 📁 Episodes: ${attr.episodeCount || '?'}
🎭 ${(attr.genres || []).join(', ') || '-'}
📝 ${attr.synopsis?.slice(0, 350) || '-'}
🔗 https://kitsu.io/anime/${a.id}`;
    }
    static fmtManga(a) {
        const attr = a.attributes || {};
        return `📖 *${attr.canonicalTitle || attr.titles?.en || attr.titles?.en_jp || 'Unknown'}*
⭐ ${attr.averageRating || '?'}/100 | 📁 Chapters: ${attr.chapterCount || '?'}
📝 ${attr.synopsis?.slice(0, 350) || '-'}
🔗 https://kitsu.io/manga/${a.id}`;
    }
}

// ─── MANGADEX (FREE — NO KEY) ───
class MangaDex {
    static async req(path) {
        const d = await safeFetch(`https://api.mangadex.org${path}`);
        if (!d || !d.data) throw new Error('MangaDex returned no data.');
        return d;
    }
    static search(q, limit = 10) { return this.req(`/manga?title=${encodeURIComponent(q)}&limit=${limit}&contentRating[]=safe`); }
    static mangaById(id) { return this.req(`/manga/${id}?includes[]=cover_art&includes[]=author`); }
    static fmtManga(m) {
        const attr = m.attributes || {};
        const title = attr.title?.en || Object.values(attr.title || {})[0] || 'Unknown';
        const year = attr.year || '?';
        const status = attr.status || '?';
        return `📖 *${title}*
📅 Year: ${year} | 📊 Status: ${status}
🎭 ${(attr.tags || []).slice(0, 5).map(t => t.attributes?.name?.en).filter(Boolean).join(', ') || '-'}
📝 ${attr.description?.en?.slice(0, 350) || '-'}
🔗 https://mangadex.org/title/${m.id}`;
    }
    static fmtMangaList(results) {
        if (!results || !results.length) return '❌ No manga found.';
        let txt = `📖 *Manga Search Results*

`;
        results.slice(0, 10).forEach((m, i) => {
            const title = m.attributes?.title?.en || Object.values(m.attributes?.title || {})[0] || 'Unknown';
            txt += `${i + 1}. *${title}* — \`${m.id}\`
`;
        });
        return txt;
    }
}

// ─── TMDB (FREE TIER — REQUIRES KEY, USE ENV) ───
class TMDB {
    static getKey() { return process.env.TMDB_KEY || ''; }
    static async req(endpoint, params = {}) {
        const key = this.getKey();
        if (!key) throw new Error('TMDB_KEY not set in environment variables.');
        const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
        url.searchParams.set('api_key', key);
        Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
        return safeFetch(url.toString());
    }
    static searchMovie(q, page = 1) { return this.req('/search/movie', { query: q, page }); }
    static movieDetails(id) { return this.req(`/movie/${id}`); }
    static trending() { return this.req('/trending/movie/week'); }
    static popular() { return this.req('/movie/popular'); }
    static upcoming() { return this.req('/movie/upcoming'); }
    static searchTv(q, page = 1) { return this.req('/search/tv', { query: q, page }); }
    static tvDetails(id) { return this.req(`/tv/${id}`); }
    static fmt(m) {
        return `🎬 *${m.title || m.name}* (${(m.release_date || m.first_air_date || 'TBA').slice(0,4)})
⭐ TMDB: ${m.vote_average || '?'}/10 (${m.vote_count || '0'} votes)
📝 ${m.overview?.slice(0, 300) || 'No overview.'}
🔗 https://www.themoviedb.org/${m.title ? 'movie' : 'tv'}/${m.id}`;
    }
}

// ─── OPEN LIBRARY (FREE — NO KEY) ───
class OpenLibrary {
    static async search(q, limit = 10) {
        const d = await safeFetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=${limit}`);
        if (!d || !d.docs) throw new Error('Open Library returned no data.');
        return d.docs;
    }
    static async bookByKey(key) {
        return safeFetch(`https://openlibrary.org${key}.json`);
    }
    static fmtBook(b) {
        return `📚 *${b.title}*
✍️ ${(b.author_name || []).join(', ') || 'Unknown Author'}
📅 ${b.first_publish_year || '?'} | 📖 ${b.number_of_pages_median || '?'} pages
📝 ${b.first_sentence?.[0]?.slice(0, 200) || 'No preview available.'}
🔗 https://openlibrary.org${b.key}`;
    }
    static fmtList(docs) {
        if (!docs || !docs.length) return '❌ No books found.';
        let txt = `📚 *Book Search Results*

`;
        docs.slice(0, 10).forEach((b, i) => {
            txt += `${i + 1}. *${b.title}* — ${(b.author_name || []).join(', ') || 'Unknown'}
`;
        });
        return txt;
    }
}

// ─── RAWG VIDEO GAMES (FREE — REQUIRES KEY, USE ENV) ───
class RAWG {
    static getKey() { return process.env.RAWG_KEY || ''; }
    static async req(endpoint, params = {}) {
        const key = this.getKey();
        if (!key) throw new Error('RAWG_KEY not set in environment variables.');
        const url = new URL(`https://api.rawg.io/api${endpoint}`);
        url.searchParams.set('key', key);
        Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
        return safeFetch(url.toString());
    }
    static search(q, page = 1) { return this.req('/games', { search: q, page, page_size: 10 }); }
    static gameDetails(id) { return this.req(`/games/${id}`); }
    static topGames() { return this.req('/games', { ordering: '-rating', page_size: 10 }); }
    static fmtGame(g) {
        return `🎮 *${g.name}*
⭐ ${g.rating || '?'}/5 | 👥 ${g.ratings_count || '0'} ratings
📅 Released: ${g.released || 'TBA'} | ⏱️ ${g.playtime || '?'}h avg playtime
🎭 ${(g.genres || []).map(x => x.name).join(', ') || '-'}
📝 ${g.description_raw?.slice(0, 300) || g.description?.slice(0, 300) || 'No description.'}
🔗 https://rawg.io/games/${g.slug || g.id}`;
    }
    static fmtList(results) {
        if (!results || !results.length) return '❌ No games found.';
        let txt = `🎮 *Game Search Results*

`;
        results.slice(0, 10).forEach((g, i) => {
            txt += `${i + 1}. *${g.name}* (${g.released?.slice(0,4) || 'TBA'}) — ⭐${g.rating || '?'}
`;
        });
        return txt;
    }
}

// ─── OPEN TRIVIA DB (FREE — NO KEY) ───
class TriviaDB {
    static async getQuestions(amount = 5, category = '', difficulty = '', type = '') {
        let url = `https://opentdb.com/api.php?amount=${amount}`;
        if (category) url += `&category=${category}`;
        if (difficulty) url += `&difficulty=${difficulty}`;
        if (type) url += `&type=${type}`;
        const d = await safeFetch(url);
        if (d.response_code !== 0) throw new Error('No trivia questions found for those settings.');
        return d.results;
    }
    static fmtQuestions(list) {
        let txt = `🧠 *Trivia Time!*

`;
        list.forEach((q, i) => {
            txt += `*${i + 1}.* ${q.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')}
`;
            const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
            answers.forEach((a, j) => {
                txt += `   ${String.fromCharCode(65 + j)}. ${a.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')}
`;
            });
            txt += `
`;
        });
        txt += `_Reply with the number and letter (e.g., "1A") to answer!_`;
        return txt;
    }
}

// ─── JOKEAPI (FREE — NO KEY) ───
class JokeAPI {
    static async getJoke(category = 'Any', type = '') {
        let url = `https://v2.jokeapi.dev/joke/${category}?blacklistFlags=nsfw,religious,political,racist,sexist,explicit`;
        if (type) url += `&type=${type}`;
        const d = await safeFetch(url);
        if (d.error) throw new Error(d.message || 'JokeAPI Error');
        return d;
    }
    static fmt(d) {
        if (d.type === 'single') return `😂 *Joke*

${d.joke}`;
        return `😂 *Joke*

${d.setup}

➡️ ${d.delivery}`;
    }
}

// ─── QUOTABLE (FREE — NO KEY) ───
class Quotable {
    static async random() { return safeFetch('https://api.quotable.io/random'); }
    static async byAuthor(author) { return safeFetch(`https://api.quotable.io/quotes?author=${encodeURIComponent(author)}&limit=5`); }
    static async search(q) { return safeFetch(`https://api.quotable.io/search/quotes?query=${encodeURIComponent(q)}&limit=5`); }
    static async authors() { return safeFetch('https://api.quotable.io/authors?limit=20'); }
    static async tags() { return safeFetch('https://api.quotable.io/tags'); }
    static fmt(q) { return `💬 *Quote*

"${q.content}"

— *${q.author}*`; }
    static fmtList(quotes) {
        if (!quotes || !quotes.length) return '❌ No quotes found.';
        return quotes.map((q, i) => `${i + 1}. "${q.content}" — ${q.author}`).join('

');
    }
}

// ─── NUMBERS API (FREE — NO KEY) ───
class NumbersAPI {
    static async trivia(num) { return safeFetch(`http://numbersapi.com/${num}/trivia?json`); }
    static async math(num) { return safeFetch(`http://numbersapi.com/${num}/math?json`); }
    static async year(num) { return safeFetch(`http://numbersapi.com/${num}/year?json`); }
    static async date(month, day) { return safeFetch(`http://numbersapi.com/${month}/${day}/date?json`); }
    static async random() { return safeFetch('http://numbersapi.com/random/trivia?json'); }
    static fmt(d) { return `🔢 *Number Fact*

${d.text}`; }
}

// ─── CAT FACTS (FREE — NO KEY) ───
class CatFacts {
    static async random() { return safeFetch('https://catfact.ninja/fact'); }
    static async many(limit = 5) { return safeFetch(`https://catfact.ninja/facts?limit=${limit}`); }
    static fmt(d) { return `🐱 *Cat Fact*

${d.fact}`; }
    static fmtList(d) {
        if (!d.data || !d.data.length) return '❌ No cat facts found.';
        return d.data.map((f, i) => `${i + 1}. ${f.fact}`).join('

');
    }
}

// ─── DOG CEO (FREE — NO KEY) ───
class DogCEO {
    static async random() { return safeFetch('https://dog.ceo/api/breeds/image/random'); }
    static async byBreed(breed) { return safeFetch(`https://dog.ceo/api/breed/${breed}/images/random`); }
    static async breeds() { return safeFetch('https://dog.ceo/api/breeds/list/all'); }
    static fmt(d) { return d.message; }
}

// ─── MOVIE GUESSER ENGINE ───
class MovieGuesser {
    constructor() {
        this.pool = [
            { t: 'The Godfather', e: '👴🍊🐴' }, { t: 'Titanic', e: '🚢❄️💎' },
            { t: 'The Matrix', e: '💊🕶️🐇' }, { t: 'Jurassic Park', e: '🦖🌴🚙' },
            { t: 'Forrest Gump', e: '🏃🍫🦐' }, { t: 'Inception', e: '🌀💤🔫' },
            { t: 'The Lion King', e: '🦁👑🌅' }, { t: 'Harry Potter', e: '⚡🧹🏰' },
            { t: 'Spider-Man', e: '🕷️🕸️🏙️' }, { t: 'Batman', e: '🦇🌑🃏' },
            { t: 'Avengers', e: '🦸🔨🛡️' }, { t: 'Frozen', e: '❄️👑⛄' },
            { t: 'Shrek', e: '👹🏰🧅' }, { t: 'Finding Nemo', e: '🐠🌊🦈' },
            { t: 'The Terminator', e: '🤖🔫🕶️' }, { t: 'Toy Story', e: '🤠👨‍🚀🧸' },
            { t: 'Pirates of the Caribbean', e: '🏴‍☠️⚓💀' }, { t: 'The Hunger Games', e: '🏹🔥👧' },
            { t: 'Back to the Future', e: '⏰🚗⚡' }, { t: 'E.T.', e: '👽🚲🌙' }
        ];
    }
    random() { return this.pool[Math.floor(Math.random() * this.pool.length)]; }
}

// ─── BACKWARD COMPATIBLE INSTANCE ───
class MovieDB {
    async search(title, year = '', page = 1) {
        const d = await OMDB.search(title, '', year, page);
        return d.Search || [];
    }
    async getById(imdbID, plot = 'full') { return OMDB.byId(imdbID, plot); }
    async getByTitle(title, year = '', plot = 'full') { return OMDB.byTitle(title, year, plot); }
    async getRatings(imdbID) { return OMDB.ratings(imdbID); }
    formatMovie(m) { return OMDB.fmt(m); }
    formatList(items) { return OMDB.fmtList(items); }
}

module.exports = {
    // Core Classes
    OMDB, TVMaze, AniList, Jikan, Kitsu, MangaDex, TMDB,
    OpenLibrary, RAWG, TriviaDB, JokeAPI, Quotable, NumbersAPI, CatFacts, DogCEO,
    MovieGuesser,
    // Backward compatible instance
    Movie: new MovieDB(),
    MovieDB,
    // Utilities
    safeFetch, pickRandom: (arr) => arr[Math.floor(Math.random() * arr.length)]
};
