/**
 * 🎬 MAUREONIX — Ultimate Movie & TV Engine
 * Uses OMDB API (key: c9e60a6f) and TMDB API
 */

const axios = require('axios');
const moment = require('moment-timezone');

// Your OMDB API key
const OMDB_API_KEY = 'c9e60a6f';
const TMDB_API_KEY = '87d2613ba4b34b7d83929fcd8516f43b'; // free TMDB key

// ─────────────────────────────────────────────────────────────
// 1. MOVIE DETAILS (OMDB) – full info + poster
// ─────────────────────────────────────────────────────────────
async function getMovie(title, year = null) {
    let url = `http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}&plot=full`;
    if (year) url += `&y=${year}`;
    const res = await axios.get(url);
    if (res.data.Response === 'False') throw new Error(res.data.Error);
    const m = res.data;
    return {
        title: m.Title,
        year: m.Year,
        rated: m.Rated,
        released: m.Released,
        runtime: m.Runtime,
        genre: m.Genre,
        director: m.Director,
        writer: m.Writer,
        actors: m.Actors,
        plot: m.Plot,
        language: m.Language,
        country: m.Country,
        awards: m.Awards,
        poster: m.Poster !== 'N/A' ? m.Poster : null,
        imdbRating: m.imdbRating,
        imdbVotes: m.imdbVotes,
        imdbID: m.imdbID,
        boxOffice: m.BoxOffice,
        trailerUrl: null // will be fetched separately
    };
}

// ─────────────────────────────────────────────────────────────
// 2. YOUTUBE TRAILER (using your Gemini API key – works for YouTube search)
// ─────────────────────────────────────────────────────────────
async function getTrailer(title, year = null) {
    const query = `${title} ${year ? year : ''} official trailer`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=AIzaSyARjH2TwsNEpQ3vPHzDecf5a7v7evmQmZc`;
    try {
        const res = await axios.get(url);
        if (res.data.items && res.data.items.length) {
            const videoId = res.data.items[0].id.videoId;
            return `https://www.youtube.com/watch?v=${videoId}`;
        }
    } catch (e) {
        // fallback: return a search link
        return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    }
    return null;
}

// ─────────────────────────────────────────────────────────────
// 3. TV SERIES DETAILS + optional season episodes
// ─────────────────────────────────────────────────────────────
async function getTVSeries(title, season = null) {
    let url = `http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}&plot=full`;
    const res = await axios.get(url);
    if (res.data.Response === 'False') throw new Error(res.data.Error);
    const m = res.data;
    let result = {
        title: m.Title,
        year: m.Year,
        rated: m.Rated,
        genre: m.Genre,
        plot: m.Plot,
        poster: m.Poster !== 'N/A' ? m.Poster : null,
        imdbRating: m.imdbRating,
        imdbVotes: m.imdbVotes,
        imdbID: m.imdbID,
        totalSeasons: m.totalSeasons,
        actors: m.Actors,
        awards: m.Awards
    };
    if (season && m.totalSeasons && season <= parseInt(m.totalSeasons)) {
        const epUrl = `http://www.omdbapi.com/?i=${m.imdbID}&Season=${season}&apikey=${OMDB_API_KEY}`;
        const epRes = await axios.get(epUrl);
        if (epRes.data.Response === 'True') {
            result.season = season;
            result.episodes = epRes.data.Episodes.map(ep => ({
                title: ep.Title,
                episode: ep.Episode,
                released: ep.Released,
                imdbRating: ep.imdbRating
            }));
        }
    }
    return result;
}

// ─────────────────────────────────────────────────────────────
// 4. TOP RATED MOVIES (TMDB)
// ─────────────────────────────────────────────────────────────
async function topRatedMovies(page = 1) {
    const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}`;
    const res = await axios.get(url);
    return res.data.results.map(m => ({
        title: m.title,
        year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
        rating: m.vote_average,
        overview: m.overview.substring(0, 150),
        poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null
    }));
}

// ─────────────────────────────────────────────────────────────
// 5. UPCOMING MOVIES
// ─────────────────────────────────────────────────────────────
async function upcomingMovies(page = 1) {
    const url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}`;
    const res = await axios.get(url);
    return res.data.results.map(m => ({
        title: m.title,
        release: m.release_date,
        rating: m.vote_average,
        overview: m.overview.substring(0, 150),
        poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null
    }));
}

// ─────────────────────────────────────────────────────────────
// 6. NOW PLAYING
// ─────────────────────────────────────────────────────────────
async function nowPlaying(page = 1) {
    const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`;
    const res = await axios.get(url);
    return res.data.results.map(m => ({
        title: m.title,
        release: m.release_date,
        rating: m.vote_average,
        overview: m.overview.substring(0, 150),
        poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null
    }));
}

// ─────────────────────────────────────────────────────────────
// 7. CELEBRITY INFO (TMDB)
// ─────────────────────────────────────────────────────────────
async function getCelebrity(name) {
    const searchUrl = `https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(name)}`;
    const search = await axios.get(searchUrl);
    if (!search.data.results.length) throw new Error('Celebrity not found');
    const person = search.data.results[0];
    const detailsUrl = `https://api.themoviedb.org/3/person/${person.id}?api_key=${TMDB_API_KEY}&append_to_response=combined_credits`;
    const details = await axios.get(detailsUrl);
    const p = details.data;
    return {
        name: p.name,
        birthday: p.birthday,
        deathday: p.deathday,
        place: p.place_of_birth,
        bio: p.biography.substring(0, 500),
        popularity: p.popularity,
        photo: p.profile_path ? `https://image.tmdb.org/t/p/w500${p.profile_path}` : null,
        knownFor: p.combined_credits.cast.slice(0, 5).map(c => c.title || c.name)
    };
}

// ─────────────────────────────────────────────────────────────
// 8. RANDOM MOVIE QUOTE (free API)
// ─────────────────────────────────────────────────────────────
async function randomQuote() {
    try {
        const res = await axios.get('https://movie-quote-api.herokuapp.com/v1/quote');
        return `"${res.data.quote}" — ${res.data.show}`;
    } catch {
        return '"May the Force be with you" — Star Wars';
    }
}

// ─────────────────────────────────────────────────────────────
// 9. RECOMMENDATIONS (TMDB by movie ID)
// ─────────────────────────────────────────────────────────────
async function recommendations(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}`;
    const res = await axios.get(url);
    return res.data.results.slice(0, 5).map(m => ({
        title: m.title,
        year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
        rating: m.vote_average
    }));
}

// ─────────────────────────────────────────────────────────────
// 10. SEARCH MOVIE BY IMDB ID (for recommendations)
// ─────────────────────────────────────────────────────────────
async function getByImdbID(imdbID) {
    const url = `http://www.omdbapi.com/?i=${imdbID}&apikey=${OMDB_API_KEY}&plot=short`;
    const res = await axios.get(url);
    if (res.data.Response === 'False') throw new Error(res.data.Error);
    return res.data;
}

// ─────────────────────────────────────────────────────────────
// FORMATTERS for WhatsApp
// ─────────────────────────────────────────────────────────────
function formatMovie(movie) {
    let text = `🎬 *${movie.title}* (${movie.year})\n⭐ IMDb: ${movie.imdbRating}/10 (${movie.imdbVotes} votes)\n🎭 Genre: ${movie.genre}\n👤 Director: ${movie.director}\n🎭 Actors: ${movie.actors}\n📝 Plot: ${movie.plot.substring(0, 300)}...\n🏆 Awards: ${movie.awards}`;
    if (movie.boxOffice && movie.boxOffice !== 'N/A') text += `\n💰 Box Office: ${movie.boxOffice}`;
    if (movie.trailerUrl) text += `\n🎥 Trailer: ${movie.trailerUrl}`;
    return text;
}

function formatTVSeries(series) {
    let text = `📺 *${series.title}* (${series.year})\n⭐ IMDb: ${series.imdbRating}/10 (${series.imdbVotes} votes)\n🎭 Genre: ${series.genre}\n👤 Cast: ${series.actors}\n📝 Plot: ${series.plot.substring(0, 300)}...\n📅 Total Seasons: ${series.totalSeasons}\n🏆 Awards: ${series.awards}`;
    if (series.season && series.episodes) {
        text += `\n\n*Season ${series.season} Episodes:*\n` + series.episodes.slice(0, 10).map(ep => `${ep.episode}. ${ep.title} (⭐ ${ep.imdbRating})`).join('\n');
    }
    return text;
}

function formatMovieList(movies, title) {
    let text = `🎬 *${title}*\n\n`;
    movies.forEach((m, i) => {
        text += `${i+1}. *${m.title}* (${m.year}) — ⭐ ${m.rating}\n   ${m.overview}\n\n`;
    });
    return text;
}

module.exports = {
    getMovie,
    getTrailer,
    getTVSeries,
    topRatedMovies,
    upcomingMovies,
    nowPlaying,
    getCelebrity,
    randomQuote,
    recommendations,
    getByImdbID,
    formatMovie,
    formatTVSeries,
    formatMovieList
};