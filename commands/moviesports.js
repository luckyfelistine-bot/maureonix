// commands/moviesports.js – Movies, TV, Anime, Manga, Games, Books, Trivia, Facts, Jokes, Quotes, Sports
module.exports = {
    // ═════════════════════════════════════════════════════════════════
    //  🎬 MOVIES & TV (OMDB + TVMaze)
    // ═════════════════════════════════════════════════════════════════
    movie: async (nimesha, m, { text, Movie, db, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <title>`);
        await m.reply('🎬 *Searching OMDB...*');
        try {
            const results = await Movie.search(text);
            if (!results || !results.length) return m.reply('❌ No results found.');
            if (!db.movieSearch) db.movieSearch = {};
            db.movieSearch[m.sender] = { results, timestamp: Date.now() };
            await m.reply(Movie.formatList(results));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },
    film: async (nimesha, m, ctx) => { await module.exports.movie(nimesha, m, ctx); },
    cinema: async (nimesha, m, ctx) => { await module.exports.movie(nimesha, m, ctx); },

    imdb: async (nimesha, m, { args, Movie, db, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <imdb-id>\nOr reply with a number from a previous search.`);
        let id = args[0];
        if (/^\d+$/.test(id) && db.movieSearch && db.movieSearch[m.sender]) {
            const search = db.movieSearch[m.sender];
            if (Date.now() - search.timestamp > 300000) {
                delete db.movieSearch[m.sender];
                return m.reply('⚠️ Search expired. Please search again.');
            }
            const index = parseInt(id) - 1;
            if (index >= 0 && index < search.results.length) id = search.results[index].imdbID;
            else return m.reply('❌ Invalid number. Please use a valid IMDB ID.');
        }
        try {
            const data = await Movie.getById(id);
            const poster = data.Poster && data.Poster !== 'N/A' ? data.Poster : null;
            const caption = Movie.formatMovie(data);
            if (poster) await nimesha.sendMessage(m.chat, { image: { url: poster }, caption }, { quoted: m });
            else await m.reply(caption);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    series: async (nimesha, m, { text, Movie, db, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <title>`);
        await m.reply('📺 *Searching TV series...*');
        try {
            const results = await Movie.search(text, 'series');
            if (!results || !results.length) return m.reply('❌ No series found.');
            if (!db.movieSearch) db.movieSearch = {};
            db.movieSearch[m.sender] = { results, timestamp: Date.now() };
            await m.reply(Movie.formatList(results));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    rating: async (nimesha, m, { args, Movie, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <imdb-id>`);
        try {
            const r = await Movie.getRatings(args[0]);
            await m.reply(`⭐ *Ratings*\nIMDB: ${r.imdb}/10\n🍅 Rotten: ${r.rotten}\nⓂ️ Metacritic: ${r.metacritic}/100\n👥 Votes: ${r.votes}`);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    season: async (nimesha, m, { args, OMDB, prefix, command }) => {
        if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <imdb-id> <season-number>`);
        try {
            const s = await OMDB.season(args[0], args[1]);
            let txt = `📂 *${s.Title} — Season ${s.Season}*\n\n`;
            (s.Episodes || []).forEach(e => txt += `E${e.Episode} — ${e.Title} ⭐${e.imdbRating || 'N/A'}\n`);
            m.reply(txt);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    moviequote: async (nimesha, m, { MovieGuesser, db }) => {
        try {
            const mg = new MovieGuesser();
            const q = mg.random();
            if (!db.users) db.users = {};
            if (!db.users[m.sender]) db.users[m.sender] = {};
            db.users[m.sender]._movieguess = q.t;
            m.reply(`🎬 Guess the movie:\n\n${q.e}\n\nReply with the title!`);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    // ─── TVMAZE ───
    tv: async (nimesha, m, { text, TVMaze, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} breaking bad`);
        try {
            const r = await TVMaze.search(text);
            if (!r.length) return m.reply('❌ No shows found.');
            const s = r[0].show;
            m.reply(TVMaze.fmtShow(s));
        } catch (e) { m.reply('❌ ' + e.message); }
    },

    episodes: async (nimesha, m, { args, TVMaze, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <tvmaze-show-id>`);
        try {
            const e = await TVMaze.episodes(args[0]);
            let txt = `📺 *Episodes*\n`;
            e.slice(-20).forEach(x => txt += `S${String(x.season).padStart(2,'0')}E${String(x.number).padStart(2,'0')} — ${x.name}\n`);
            m.reply(txt);
        } catch (e) { m.reply('❌ ' + e.message); }
    },
    eps: async (nimesha, m, ctx) => { await module.exports.episodes(nimesha, m, ctx); },

    tvschedule: async (nimesha, m, { TVMaze }) => {
        try {
            const s = await TVMaze.schedule('US');
            let txt = `📡 *Airing Today (US)*\n\n`;
            s.slice(0, 15).forEach(x => txt += `• ${x.show.name} — ${x.name} (${x.show.network?.name || 'Web'})\n`);
            m.reply(txt);
        } catch (e) { m.reply('❌ ' + e.message); }
    },
    ontv: async (nimesha, m, ctx) => { await module.exports.tvschedule(nimesha, m, ctx); },

    tvcast: async (nimesha, m, { args, TVMaze, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <tvmaze-show-id>`);
        try {
            const cast = await TVMaze.cast(args[0]);
            m.reply(`🎭 *Cast*\n\n${TVMaze.fmtCast(cast)}`);
        } catch (e) { m.reply('❌ ' + e.message); }
    },

    // ═════════════════════════════════════════════════════════════════
    //  📺 ANIME (AniList + Jikan + Kitsu)
    // ═════════════════════════════════════════════════════════════════
    anime: async (nimesha, m, { text, AniList, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <title>`);
        await m.reply('🔍 *Searching AniList...*');
        try {
            const r = await AniList.searchAnime(text);
            if (!r || !r.Page || !r.Page.media || !r.Page.media.length) return m.reply('❌ No anime found.');
            const a = r.Page.media[0];
            m.reply(AniList.fmtAnime(a));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    animesearch: async (nimesha, m, { text, Jikan, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <title>`);
        await m.reply('🔍 *Searching Jikan...*');
        try {
            const r = await Jikan.anime(text);
            if (!r || !r.length) return m.reply('❌ No results.');
            m.reply(Jikan.fmtAnime(r[0]));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    trendinganime: async (nimesha, m, { AniList }) => {
        try {
            const r = await AniList.trending();
            let txt = `🔥 *Trending Anime*\n\n`;
            r.Page.media.forEach((a, i) => txt += `${i + 1}. *${a.title.english || a.title.romaji}* — ⭐${a.averageScore}\n`);
            m.reply(txt);
        } catch (e) { m.reply('❌ ' + e.message); }
    },

    topanime: async (nimesha, m, { AniList }) => {
        try {
            const r = await AniList.topAnime();
            let txt = `🏆 *Top Anime (AniList)*\n\n`;
            r.Page.media.forEach((a, i) => txt += `${i + 1}. *${a.title.english || a.title.romaji}* — ⭐${a.averageScore}\n`);
            m.reply(txt);
        } catch (e) { m.reply('❌ ' + e.message); }
    },

    upcominganime: async (nimesha, m, { AniList }) => {
        try {
            const r = await AniList.upcoming();
            let txt = `⏳ *Upcoming Anime*\n\n`;
            r.Page.media.forEach((a, i) => txt += `${i + 1}. *${a.title.english || a.title.romaji}* — 📅 ${a.startDate?.year || 'TBA'}\n`);
            m.reply(txt);
        } catch (e) { m.reply('❌ ' + e.message); }
    },

    jikan: async (nimesha, m, { text, Jikan, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} naruto`);
        try {
            const r = await Jikan.anime(text);
            if (!r?.length) return m.reply('❌ No results.');
            const a = r[0];
            m.reply(`📺 *${a.title}*\n⭐ ${a.score || '?'}/10 | 🎭 ${(a.genres || []).map(g => g.name).join(', ') || '-'}\n📁 Episodes: ${a.episodes || '?'}\n📝 ${a.synopsis?.slice(0, 300) || '-'}\n🔗 ${a.url}`);
        } catch (e) { m.reply('❌ ' + e.message); }
    },

    topjikan: async (nimesha, m, { Jikan }) => {
        try {
            const r = await Jikan.topAnime();
            let txt = `🏆 *Top Anime (Jikan)*\n\n`;
            r.slice(0, 10).forEach((a, i) => txt += `${i + 1}. *${a.title}* — ⭐${a.score}\n`);
            m.reply(txt);
        } catch (e) { m.reply('❌ ' + e.message); }
    },

    animechar: async (nimesha, m, { text, Jikan, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <character name>`);
        try {
            const r = await Jikan.characters(text);
            if (!r || !r.length) return m.reply('❌ No character found.');
            m.reply(Jikan.fmtCharacter(r[0]));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    // ═════════════════════════════════════════════════════════════════
    //  📖 MANGA (AniList + Jikan + MangaDex + Kitsu)
    // ═════════════════════════════════════════════════════════════════
    manga: async (nimesha, m, { text, AniList, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <title>`);
        await m.reply('🔍 *Searching AniList Manga...*');
        try {
            const r = await AniList.searchManga(text);
            if (!r || !r.Page || !r.Page.media || !r.Page.media.length) return m.reply('❌ No manga found.');
            m.reply(AniList.fmtManga(r.Page.media[0]));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    mangadex: async (nimesha, m, { text, MangaDex, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <title>`);
        try {
            const r = await MangaDex.search(text);
            if (!r || !r.data || !r.data.length) return m.reply('❌ No manga found on MangaDex.');
            m.reply(MangaDex.fmtMangaList(r.data));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    mangajikan: async (nimesha, m, { text, Jikan, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <title>`);
        try {
            const r = await Jikan.manga(text);
            if (!r || !r.length) return m.reply('❌ No manga found.');
            m.reply(Jikan.fmtManga(r[0]));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    // ═════════════════════════════════════════════════════════════════
    //  📚 BOOKS (Open Library)
    // ═════════════════════════════════════════════════════════════════
    book: async (nimesha, m, { text, OpenLibrary, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <title or author>`);
        await m.reply('📚 *Searching Open Library...*');
        try {
            const docs = await OpenLibrary.search(text);
            if (!docs || !docs.length) return m.reply('❌ No books found.');
            m.reply(OpenLibrary.fmtBook(docs[0]));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    books: async (nimesha, m, { text, OpenLibrary, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <title>`);
        try {
            const docs = await OpenLibrary.search(text);
            m.reply(OpenLibrary.fmtList(docs));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    // ═════════════════════════════════════════════════════════════════
    //  🎮 GAMES (RAWG)
    // ═════════════════════════════════════════════════════════════════
    game: async (nimesha, m, { text, RAWG, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <game title>`);
        await m.reply('🎮 *Searching RAWG...*');
        try {
            const r = await RAWG.search(text);
            if (!r || !r.results || !r.results.length) return m.reply('❌ No games found.');
            m.reply(RAWG.fmtGame(r.results[0]));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    games: async (nimesha, m, { text, RAWG, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <title>`);
        try {
            const r = await RAWG.search(text);
            m.reply(RAWG.fmtList(r.results));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    topgames: async (nimesha, m, { RAWG }) => {
        try {
            const r = await RAWG.topGames();
            if (!r || !r.results || !r.results.length) return m.reply('❌ No data.');
            let txt = `🏆 *Top Rated Games*\n\n`;
            r.results.slice(0, 10).forEach((g, i) => txt += `${i + 1}. *${g.name}* — ⭐${g.rating}\n`);
            m.reply(txt);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    // ═════════════════════════════════════════════════════════════════
    //  🧠 TRIVIA (Open Trivia DB)
    // ═════════════════════════════════════════════════════════════════
    trivia: async (nimesha, m, { text, TriviaDB, db, prefix, command }) => {
        const [amount, category, difficulty] = text.split(',').map(s => s.trim());
        const amt = parseInt(amount) || 5;
        try {
            const qs = await TriviaDB.getQuestions(amt, category || '', difficulty || '');
            if (!db.trivia) db.trivia = {};
            db.trivia[m.chat] = { questions: qs, timestamp: Date.now() };
            m.reply(TriviaDB.fmtQuestions(qs));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    // ═════════════════════════════════════════════════════════════════
    //  😂 JOKES (JokeAPI)
    // ═════════════════════════════════════════════════════════════════
    joke: async (nimesha, m, { text, JokeAPI }) => {
        try {
            const d = await JokeAPI.getJoke(text || 'Any');
            m.reply(JokeAPI.fmt(d));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    // ═════════════════════════════════════════════════════════════════
    //  💬 QUOTES (Quotable)
    // ═════════════════════════════════════════════════════════════════
    quote: async (nimesha, m, { Quotable }) => {
        try {
            const q = await Quotable.random();
            m.reply(Quotable.fmt(q));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    quotes: async (nimesha, m, { text, Quotable, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <author name>`);
        try {
            const d = await Quotable.byAuthor(text);
            m.reply(Quotable.fmtList(d.results || []));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    quotetags: async (nimesha, m, { Quotable }) => {
        try {
            const d = await Quotable.tags();
            m.reply(`🏷️ *Quote Tags*\n\n${(d || []).map(t => t.name).join(', ')}`);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    // ═════════════════════════════════════════════════════════════════
    //  🔢 FACTS (Numbers + Cat Facts + Dog CEO)
    // ═════════════════════════════════════════════════════════════════
    numfact: async (nimesha, m, { text, NumbersAPI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <number>`);
        try {
            const d = await NumbersAPI.trivia(parseInt(text));
            m.reply(NumbersAPI.fmt(d));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    yearfact: async (nimesha, m, { text, NumbersAPI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <year>`);
        try {
            const d = await NumbersAPI.year(parseInt(text));
            m.reply(NumbersAPI.fmt(d));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    datefact: async (nimesha, m, { text, NumbersAPI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <month/day> (e.g., 12/25)`);
        const [month, day] = text.split('/').map(Number);
        if (!month || !day) return m.reply('❌ Invalid format. Use: month/day');
        try {
            const d = await NumbersAPI.date(month, day);
            m.reply(NumbersAPI.fmt(d));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    catfact: async (nimesha, m, { CatFacts }) => {
        try {
            const d = await CatFacts.random();
            m.reply(CatFacts.fmt(d));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    catfacts: async (nimesha, m, { CatFacts }) => {
        try {
            const d = await CatFacts.many(5);
            m.reply(CatFacts.fmtList(d));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    dog: async (nimesha, m, { DogCEO }) => {
        try {
            const d = await DogCEO.random();
            await nimesha.sendMessage(m.chat, { image: { url: d.message } }, { quoted: m });
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    dogbreeds: async (nimesha, m, { DogCEO }) => {
        try {
            const d = await DogCEO.breeds();
            const breeds = Object.keys(d.message || {});
            m.reply(`🐕 *Dog Breeds*\n\n${breeds.slice(0, 30).join(', ')}\n\n_Total: ${breeds.length} breeds_`);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    // ═════════════════════════════════════════════════════════════════
    //  ⚽ SPORTS (ESPN + TheSportsDB + SportMonks + SportSRC + FootballData)
    // ═════════════════════════════════════════════════════════════════
    espn: async (nimesha, m, { args, ESPN, prefix, command }) => {
        if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <sport> <league>\nExample: ${prefix + command} soccer eng.1`);
        try {
            const sb = await ESPN.scoreboard(args[0], args[1]);
            m.reply(ESPN.fmtScoreboard(sb));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    espnnews: async (nimesha, m, { args, ESPN, prefix, command }) => {
        if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <sport> <league>`);
        try {
            const news = await ESPN.news(args[0], args[1]);
            m.reply(ESPN.fmtNews(news));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    sportsdbteam: async (nimesha, m, { text, TheSportsDB, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <team name>`);
        try {
            const d = await TheSportsDB.searchTeam(text);
            if (!d.teams || !d.teams.length) return m.reply('❌ No team found.');
            m.reply(TheSportsDB.fmtTeam(d.teams[0]));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    sportsdbnext: async (nimesha, m, { text, TheSportsDB, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <league-id>`);
        try {
            const d = await TheSportsDB.next5(text);
            if (!d.events || !d.events.length) return m.reply('❌ No upcoming events.');
            let txt = `📅 *Upcoming Events*\n\n`;
            d.events.slice(0, 5).forEach(e => txt += `${TheSportsDB.fmtEvent(e)}\n\n`);
            m.reply(txt);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    sportsdbleagues: async (nimesha, m, { TheSportsDB }) => {
        try {
            const d = await TheSportsDB.leagues();
            m.reply(TheSportsDB.fmtLeagues(d.leagues));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    sportmonkslive: async (nimesha, m, { SportMonks }) => {
        try {
            const d = await SportMonks.live();
            if (!d || !d.length) return m.reply('⚠️ No live matches (free tier may be limited).');
            let txt = `🔥 *Live Scores (SportMonks)*\n\n`;
            d.slice(0, 10).forEach(f => txt += `${SportMonks.fmtFixture(f)}\n\n`);
            m.reply(txt);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    sportsrc: async (nimesha, m, { SportSRC }) => {
        try {
            const d = await SportSRC.scoreboard();
            m.reply(SportSRC.fmtScoreboard(d));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    footballstandings: async (nimesha, m, { text, FootballData, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <competition-code>\nExample: ${prefix + command} PL (Premier League)`);
        try {
            const d = await FootballData.standings(text.toUpperCase());
            m.reply(FootballData.fmtStandings(d));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },

    // ═════════════════════════════════════════════════════════════════
    //  📋 CATEGORY MENUS (Text-only, won't interfere with your carousel)
    // ═════════════════════════════════════════════════════════════════
    moviesmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *🎬 MOVIES & TV*      ║\n╚══════════════════════╝\n\n🎬 *Movies*\n▸ ${prefix}movie <title>\n▸ ${prefix}film <title>\n▸ ${prefix}cinema <title>\n▸ ${prefix}imdb <id>\n▸ ${prefix}series <title>\n▸ ${prefix}rating <imdb-id>\n▸ ${prefix}season <imdb-id> <season>\n▸ ${prefix}moviequote\n\n📺 *TV Shows*\n▸ ${prefix}tv <show>\n▸ ${prefix}episodes <show-id>\n▸ ${prefix}tvschedule\n▸ ${prefix}tvcast <show-id>\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    animemenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *📺 ANIME & MANGA*   ║\n╚══════════════════════╝\n\n📺 *Anime*\n▸ ${prefix}anime <title>\n▸ ${prefix}animesearch <title>\n▸ ${prefix}trendinganime\n▸ ${prefix}topanime\n▸ ${prefix}upcominganime\n▸ ${prefix}jikan <title>\n▸ ${prefix}topjikan\n▸ ${prefix}animechar <name>\n\n📖 *Manga*\n▸ ${prefix}manga <title>\n▸ ${prefix}mangadex <title>\n▸ ${prefix}mangajikan <title>\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    gamesmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *🎮 GAMES & BOOKS*    ║\n╚══════════════════════╝\n\n🎮 *Video Games (RAWG)*\n▸ ${prefix}game <title>\n▸ ${prefix}games <title>\n▸ ${prefix}topgames\n\n📚 *Books (Open Library)*\n▸ ${prefix}book <title>\n▸ ${prefix}books <title>\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    funmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *😂 FUN & FACTS*      ║\n╚══════════════════════╝\n\n🧠 *Trivia*\n▸ ${prefix}trivia [amount,category,difficulty]\n\n😂 *Jokes*\n▸ ${prefix}joke [category]\n\n💬 *Quotes*\n▸ ${prefix}quote\n▸ ${prefix}quotes <author>\n▸ ${prefix}quotetags\n\n🔢 *Facts*\n▸ ${prefix}numfact <number>\n▸ ${prefix}yearfact <year>\n▸ ${prefix}datefact <month/day>\n▸ ${prefix}catfact\n▸ ${prefix}catfacts\n▸ ${prefix}dog\n▸ ${prefix}dogbreeds\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    sportsmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *⚽ SPORTS COMMANDS*  ║\n╚══════════════════════╝\n\n📌 *ESPN (Free)*\n▸ ${prefix}espn <sport> <league>\n▸ ${prefix}espnnews <sport> <league>\n\n📌 *TheSportsDB (Free)*\n▸ ${prefix}sportsdbleagues\n▸ ${prefix}sportsdbteam <name>\n▸ ${prefix}sportsdbnext <league-id>\n\n📌 *SportMonks (Free Tier)*\n▸ ${prefix}sportmonkslive\n\n📌 *SportSRC (Free)*\n▸ ${prefix}sportsrc\n\n📌 *Football-Data*\n▸ ${prefix}footballstandings <code> (e.g., PL)\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },

    // ─── Aliases ───
    livescore: async (nimesha, m, ctx) => { await module.exports.espn(nimesha, m, ctx); },
    sportsnews: async (nimesha, m, ctx) => { await module.exports.espnnews(nimesha, m, ctx); },
    scoreboard: async (nimesha, m, ctx) => { await module.exports.espn(nimesha, m, ctx); },
    table: async (nimesha, m, ctx) => { await module.exports.footballstandings(nimesha, m, ctx); },
    headtohead: async (nimesha, m, ctx) => { m.reply('⚠️ Head-to-head moved to TheSportsDB. Use .sportsdbteam and check their website for H2H.'); },
    prediction: async (nimesha, m, ctx) => { m.reply('⚠️ Predictions API suspended. Use .sportmonkslive for live data.'); },
    betting: async (nimesha, m, ctx) => { m.reply('⚠️ Betting odds API suspended. Use .sportsrc or .sportmonkslive instead.'); },
    odds: async (nimesha, m, ctx) => { m.reply('⚠️ Odds API suspended. Use .sportsrc or .sportmonkslive instead.'); },
    sports: async (nimesha, m, ctx) => { await module.exports.sportsmenu(nimesha, m, ctx); },
};
