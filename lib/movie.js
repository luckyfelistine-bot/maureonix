const fetch = require('node-fetch');
const OMDB = `http://www.omdbapi.com/?apikey=${global.omdbApiKey}`;

class MovieDB {
  async search(title, year = '', page = 1) {
    const res = await fetch(`${OMDB}&s=${encodeURIComponent(title)}&y=${year}&page=${page}`);
    const data = await res.json();
    if (data.Response === 'False') throw new Error(data.Error);
    return data.Search;
  }

  async getById(imdbID, plot = 'full') {
    const res = await fetch(`${OMDB}&i=${imdbID}&plot=${plot}`);
    return await res.json();
  }

  async getByTitle(title, year = '', plot = 'full') {
    const res = await fetch(`${OMDB}&t=${encodeURIComponent(title)}&y=${year}&plot=${plot}`);
    return await res.json();
  }

  async getRatings(imdbID) {
    const data = await this.getById(imdbID, 'short');
    return {
      imdb: data.imdbRating,
      metacritic: data.Metascore,
      rotten: data.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value || 'N/A'
    };
  }

  formatMovie(m) {
    return `🎬 *${m.Title}* (${m.Year})
📀 Rated: ${m.Rated}
⏱️ Runtime: ${m.Runtime}
🎭 Genre: ${m.Genre}
👤 Director: ${m.Director}
🎬 Actors: ${m.Actors}
🏆 Awards: ${m.Awards}
⭐ IMDB: ${m.imdbRating}/10
🍅 Rotten: ${m.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value || 'N/A'}
📖 Plot: ${m.Plot}
🔗 https://imdb.com/title/${m.imdbID}`;
  }
}

module.exports = new MovieDB();