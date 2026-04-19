// ╔══════════════════════════════════════════════════════════════════╗
// ║  🎬 MAUREONIX CINEMATIC EMPIRE v6.1.0                           ║
// ║  OMDB + TVMaze + AniList + Jikan + TMDB — Godmode Entertainment  ║
// ╚══════════════════════════════════════════════════════════════════╝

const fetch = require('node-fetch');

// ─── OMDB ───
const OMDB_KEY = 'c9e60a6f';
const OMDB_URL = 'http://www.omdbapi.com/';

class OMDB {
  static async req(params) {
    const url = new URL(OMDB_URL);
    Object.entries({ ...params, apikey: OMDB_KEY, r: 'json' }).forEach(([k, v]) => url.searchParams.set(k, v));
    const r = await fetch(url.toString(), { timeout: 15000 });
    const d = await r.json();
    if (d.Response === 'False') throw new Error(d.Error);
    return d;
  }
  static search(q, type = '', year = '', page = 1) { return this.req({ s: q, type, y: year, page }); }
  static byId(id, plot = 'full') { return this.req({ i: id, plot }); }
  static byTitle(t, y = '', plot = 'full') { return this.req({ t, y, plot }); }
  static season(id, s) { return this.req({ i: id, Season: s }); }
  static episode(id, s, e) { return this.req({ i: id, Season: s, Episode: e }); }
  static async ratings(id) {
    const d = await this.byId(id, 'short');
    return { imdb: d.imdbRating, metacritic: d.Metascore, rotten: d.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value || 'N/A', votes: d.imdbVotes };
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
    if (!items || !items.length) return 'No results found.';
    let txt = `🎬 *Search Results*\n\n`;
    items.slice(0, 8).forEach((m, i) => {
      txt += `${i + 1}. *${m.Title}* (${m.Year}) — \`${m.imdbID}\`\n`;
    });
    txt += `\n_Reply with the number to see details, or use *.imdb <id>*._`;
    return txt;
  }
}

// ─── TVMAZE (FREE — NO KEY) ───
class TVMaze {
  static async req(path) { const r = await fetch(`https://api.tvmaze.com${path}`, { timeout: 15000 }); return await r.json(); }
  static search(q) { return this.req(`/search/shows?q=${encodeURIComponent(q)}`); }
  static show(id) { return this.req(`/shows/${id}?embed[]=episodes&embed[]=cast`); }
  static episodes(id) { return this.req(`/shows/${id}/episodes`); }
  static schedule(country = 'US', date) { return this.req(`/schedule?country=${country}${date ? '&date=' + date : ''}`); }
  static cast(id) { return this.req(`/shows/${id}/cast`); }
  static person(id) { return this.req(`/people/${id}?embed[]=castcredits`); }
  static fmtShow(s) {
    const d = s._embedded || {};
    return `📺 *${s.name}* (${s.premiered?.slice(0, 4) || 'TBA'})\n⭐ Rating: ${s.rating?.average || 'N/A'}/10\n🎭 Genres: ${(s.genres || []).join(', ') || '-'}\n📡 Network: ${s.network?.name || s.webChannel?.name || '-'}\n📝 ${s.summary ? s.summary.replace(/<[^>]+>/g, '').slice(0, 300) : 'No summary.'}\n🔗 ${s.officialSite || s.url}`;
  }
  static fmtEpisode(e) { return `🎞️ ${e.name} (S${String(e.season).padStart(2,'0')}E${String(e.number).padStart(2,'0')})\n📅 ${e.airdate || 'TBA'} | ⏱️ ${e.runtime || '?'} min\n📝 ${e.summary ? e.summary.replace(/<[^>]+>/g, '').slice(0, 200) : '-'}`; }
}

// ─── ANILIST (FREE GRAPHQL — NO KEY) ───
class AniList {
  static async gql(query, vars = {}) {
    const r = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables: vars }), timeout: 15000 });
    const d = await r.json(); return d.data;
  }
  static searchAnime(q, page = 1, perPage = 10) {
    return this.gql(`query($s:String,$p:Int,$pp:Int){Page(page:$p,perPage:$pp){media(search:$s,type:ANIME){id title{romaji english} coverImage{large} averageScore episodes genres description(asHtml:false)}}}`, { s: q, p: page, pp: perPage });
  }
  static searchManga(q, page = 1, perPage = 10) {
    return this.gql(`query($s:String,$p:Int,$pp:Int){Page(page:$p,perPage:$pp){media(search:$s,type:MANGA){id title{romaji english} coverImage{large} averageScore chapters genres description(asHtml:false)}}}`, { s: q, p: page, pp: perPage });
  }
  static trending() {
    return this.gql(`{Page(page:1,perPage:10){media(sort:TRENDING_DESC,type:ANIME){id title{romaji english} coverImage{large} averageScore episodes genres}}}`);
  }
  static fmtAnime(a) { return `📺 *${a.title.english || a.title.romaji}*\n⭐ Score: ${a.averageScore || 'N/A'}/100\n📁 Episodes: ${a.episodes || '?'}\n🎭 Genres: ${(a.genres || []).join(', ')}\n📝 ${(a.description || '').replace(/<[^>]+>/g, '').slice(0, 300)}`; }
  static fmtManga(a) { return `📖 *${a.title.english || a.title.romaji}*\n⭐ Score: ${a.averageScore || 'N/A'}/100\n📁 Chapters: ${a.chapters || '?'}\n🎭 Genres: ${(a.genres || []).join(', ')}\n📝 ${(a.description || '').replace(/<[^>]+>/g, '').slice(0, 300)}`; }
}

// ─── JIKAN (MAL WRAPPER — FREE) ───
class Jikan {
  static async req(path) { const r = await fetch(`https://api.jikan.moe/v4${path}`, { timeout: 15000 }); const d = await r.json(); return d.data; }
  static anime(q) { return this.req(`/anime?q=${encodeURIComponent(q)}&limit=5`); }
  static manga(q) { return this.req(`/manga?q=${encodeURIComponent(q)}&limit=5`); }
  static topAnime() { return this.req('/top/anime?limit=10'); }
  static topManga() { return this.req('/top/manga?limit=10'); }
  static schedule(day) { return this.req(`/schedules?filter=${day}`); }
}

// ─── TMDB (FREE TIER) ───
class TMDB {
  static getKey() { return process.env.TMDB_KEY || 'c0b0e9a8f72e9d8f1c1b0b0e9a8f72e9'; }
  static async req(endpoint, params = {}) {
    const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
    url.searchParams.set('api_key', this.getKey());
    Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
    const r = await fetch(url.toString(), { timeout: 15000 });
    if (!r.ok) throw new Error(`TMDB ${r.status}`);
    return await r.json();
  }
  static searchMovie(q, page = 1) { return this.req('/search/movie', { query: q, page }); }
  static movieDetails(id) { return this.req(`/movie/${id}`); }
  static trending() { return this.req('/trending/movie/week'); }
  static popular() { return this.req('/movie/popular'); }
  static upcoming() { return this.req('/movie/upcoming'); }
  static fmt(m) {
    return `🎬 *${m.title}* (${m.release_date?.slice(0,4) || 'TBA'})\n⭐ TMDB: ${m.vote_average}/10 (${m.vote_count} votes)\n📝 ${m.overview?.slice(0, 250) || 'No overview.'}\n🔗 https://www.themoviedb.org/movie/${m.id}`;
  }
}

// ─── MOVIE GUESSER ENGINE ───
class MovieGuesser {
  constructor() {
    this.pool = [
      { t: 'The Godfather', e: '👴🍊🐴' }, { t: 'Titanic', e: '🚢❄️💎' }, { t: 'The Matrix', e: '💊🕶️🐇' },
      { t: 'Jurassic Park', e: '🦖🌴🚙' }, { t: 'Forrest Gump', e: '🏃🍫🦐' }, { t: 'Inception', e: '🌀💤🔫' },
      { t: 'The Lion King', e: '🦁👑🌅' }, { t: 'Harry Potter', e: '⚡🧹🏰' }, { t: 'Spider-Man', e: '🕷️🕸️🏙️' },
      { t: 'Batman', e: '🦇🌑🃏' }, { t: 'Avengers', e: '🦸🔨🛡️' }, { t: 'Frozen', e: '❄️👑⛄' }
    ];
  }
  random() { return pickRandom(this.pool); }
}

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── FORMATTERS ───
function fmtCast(list) { return list.slice(0, 10).map((c, i) => `${i + 1}. ${c.person.name} as ${c.character.name}`).join('\n'); }

// ─── BACKWARD COMPATIBLE INSTANCE ───
class MovieDB {
  async search(title, year = '', page = 1) { return (await OMDB.search(title, '', year, page)).Search; }
  async getById(imdbID, plot = 'full') { return OMDB.byId(imdbID, plot); }
  async getByTitle(title, year = '', plot = 'full') { return OMDB.byTitle(title, year, plot); }
  async getRatings(imdbID) { return OMDB.ratings(imdbID); }
  formatMovie(m) { return OMDB.fmt(m); }
  formatList(items) { return OMDB.fmtList(items); }
}

module.exports = {
  // Classes
  OMDB, TVMaze, AniList, Jikan, TMDB, MovieGuesser,
  // Instance (backward compatible with old nima.js Movie import)
  Movie: new MovieDB(),
  MovieDB,
  // Utils
  fmtCast, pickRandom
};