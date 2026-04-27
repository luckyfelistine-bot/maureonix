// commands/moviesports.js – Movies, TV, Anime, Sports
module.exports = {
    // Movie
    movie: async (nimesha, m, { text, Movie, db, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <title>`);
        await m.reply('🎬 *Searching...*');
        try {
            const results = await Movie.search(text);
            if (!results || !results.length) return m.reply('No results found.');
            if (!db.movieSearch) db.movieSearch = {};
            db.movieSearch[m.sender] = { results, timestamp: Date.now() };
            await m.reply(Movie.formatList(results) + `\n\n_Reply with the number (1-${Math.min(results.length, 8)}) to see details, or use *.imdb <id>*._`);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },
    imdb: async (nimesha, m, { args, Movie, db }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <imdb-id>\nOr reply with a number from a previous search.`);
        let id = args[0];
        if (/^\d+$/.test(id) && db.movieSearch && db.movieSearch[m.sender]) {
            const search = db.movieSearch[m.sender];
            if (Date.now() - search.timestamp > 300000) { delete db.movieSearch[m.sender]; } else {
                const index = parseInt(id) - 1;
                if (index >= 0 && index < search.results.length) id = search.results[index].imdbID;
                else return m.reply('Invalid number. Please use a valid IMDB ID.');
            }
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
            if (!results || !results.length) return m.reply('No series found.');
            if (!db.movieSearch) db.movieSearch = {};
            db.movieSearch[m.sender] = { results, timestamp: Date.now() };
            await m.reply(Movie.formatList(results) + `\n\n_Reply with the number (1-${Math.min(results.length, 8)}) to see details, or use *.imdb <id>*._`);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },
    rating: async (nimesha, m, { args, Movie }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <imdb-id>`);
        const r = await Movie.getRatings(args[0]);
        await m.reply(`⭐ *Ratings*\nIMDB: ${r.imdb}/10\n🍅 Rotten: ${r.rotten}\nⓂ️ Metacritic: ${r.metacritic}/100`);
    },
    tv: async (nimesha, m, { text, TVMaze, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} breaking bad`);
        try {
            const r = await TVMaze.search(text);
            if (!r.length) return m.reply('No shows found.');
            const s = r[0].show;
            m.reply(TVMaze.fmtShow(s));
        } catch (e) { m.reply('❌ ' + e.message); }
    },
    episodes: async (nimesha, m, { args, TVMaze, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <tvmaze-show-id>`);
        try {
            const e = await TVMaze.episodes(args[0]);
            let txt = `📺 *Episodes*\n`; e.slice(-20).forEach(x => txt += `S${String(x.season).padStart(2, '0')}E${String(x.number).padStart(2, '0')} — ${x.name}\n`);
            m.reply(txt);
        } catch (e) { m.reply('❌ ' + e.message); }
    },
    tvschedule: async (nimesha, m, { TVMaze }) => {
        try {
            const s = await TVMaze.schedule('US');
            let txt = `📡 *Airing Today (US)*\n\n`; s.slice(0, 15).forEach(x => txt += `• ${x.show.name} — ${x.name} (${x.show.network?.name || 'Web'})\n`);
            m.reply(txt);
        } catch (e) { m.reply('❌ ' + e.message); }
    },
    trendinganime: async (nimesha, m, { AniList }) => {
        try {
            const r = await AniList.trending();
            let txt = `🔥 *Trending Anime*\n\n`; r.Page.media.forEach((a, i) => txt += `${i + 1}. *${a.title.english || a.title.romaji}* — ⭐${a.averageScore}\n`);
            m.reply(txt);
        } catch (e) { m.reply('❌ ' + e.message); }
    },
    jikan: async (nimesha, m, { text, Jikan, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} naruto`);
        try {
            const r = await Jikan.anime(text);
            if (!r?.length) return m.reply('No results.');
            const a = r[0];
            m.reply(`📺 *${a.title}*\n⭐ ${a.score || '?'}/10 | 🎭 ${(a.genres || []).map(g => g.name).join(', ')}\n📁 Episodes: ${a.episodes || '?'}\n📝 ${a.synopsis?.slice(0, 300) || '-'}\n🔗 ${a.url}`);
        } catch (e) { m.reply('❌ ' + e.message); }
    },
    topanime: async (nimesha, m, { Jikan }) => {
        try {
            const r = await Jikan.topAnime();
            let txt = `🏆 *Top Anime*\n\n`; r.slice(0, 10).forEach((a, i) => txt += `${i + 1}. *${a.title}* — ⭐${a.score}\n`);
            m.reply(txt);
        } catch (e) { m.reply('❌ ' + e.message); }
    },
    moviequote: async (nimesha, m, { MovieGuesser, db }) => {
        const mg = new MovieGuesser(); const q = mg.random();
        db.users[m.sender]._movieguess = q.t;
        m.reply(`🎬 Guess the movie:\n\n${q.e}\n\nReply with the title!`);
    },
    season: async (nimesha, m, { args, OMDB, prefix, command }) => {
        if (!args[0] || !args[1]) return m.reply(`Example: ${prefix + command} <imdb-id> <season-number>`);
        try {
            const s = await OMDB.season(args[0], args[1]);
            let txt = `📂 *${s.Title} — Season ${s.Season}*\n\n`; (s.Episodes || []).forEach(e => txt += `E${e.Episode} — ${e.Title} ⭐${e.imdbRating}\n`);
            m.reply(txt);
        } catch (e) { m.reply('❌ ' + e.message); }
    },
    // Sports
    leagues: async (nimesha, m, { APISports }) => {
        await m.reply('⚽ Fetching football leagues...');
        try {
            const leagues = await APISports.leagues({ current: 'true' });
            if (!leagues.length) return m.reply('No leagues found.');
            let txt = `📋 *Football Leagues*\n\n`;
            leagues.slice(0, 15).forEach(l => { txt += `• *${l.league.name}* (${l.country.name})\n  ID: ${l.league.id}\n`; });
            m.reply(txt);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },
    fixtures: async (nimesha, m, { text, APISports, prefix }) => {
        if (!text) return m.reply(`Example: ${prefix}fixtures <league-id>\nExample: ${prefix}fixtures 39 (Premier League)`);
        const league = parseInt(text);
        if (isNaN(league)) return m.reply('Invalid league ID.');
        await m.reply('⚽ Fetching fixtures...');
        try {
            const fixtures = await APISports.fixtures({ league, season: '2025', next: 10 });
            if (!fixtures.length) return m.reply('No fixtures found.');
            let txt = `📅 *Upcoming Fixtures*\n\n`;
            fixtures.forEach(f => { txt += `${APISports.fmtFixture(f)}\n\n`; });
            m.reply(txt);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },
    live: async (nimesha, m, { text, APISports }) => {
        const league = parseInt(text) || 39;
        await m.reply('⚽ Fetching live scores...');
        try {
            const live = await APISports.live(league);
            if (!live.length) return m.reply('No live matches.');
            let txt = `🔥 *Live Scores*\n\n`;
            live.forEach(f => { txt += `${APISports.fmtFixture(f)}\n\n`; });
            m.reply(txt);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },
    standings: async (nimesha, m, { text, APISports, prefix }) => {
        if (!text) return m.reply(`Example: ${prefix}standings <league-id>\nExample: ${prefix}standings 39`);
        const league = parseInt(text);
        if (isNaN(league)) return m.reply('Invalid league ID.');
        await m.reply('📊 Fetching standings...');
        try {
            const standings = await APISports.standings(league, '2025');
            if (!standings.length) return m.reply('No standings found.');
            m.reply(APISports.fmtStandings({ league: { name: 'League', standings: standings } }));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },
    team: async (nimesha, m, { text, APISports, prefix }) => {
        if (!text) return m.reply(`Example: ${prefix}team <team-id>\nExample: ${prefix}team 33`);
        const id = parseInt(text);
        if (isNaN(id)) return m.reply('Invalid team ID.');
        await m.reply('🏟️ Fetching team info...');
        try {
            const team = await APISports.team(id);
            m.reply(APISports.fmtTeam(team[0] || {}));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },
    player: async (nimesha, m, { text, APISports, prefix }) => {
        if (!text) return m.reply(`Example: ${prefix}player <player-id>\nExample: ${prefix}player 276`);
        const id = parseInt(text);
        if (isNaN(id)) return m.reply('Invalid player ID.');
        await m.reply('👤 Fetching player info...');
        try {
            const player = await APISports.player(id, '2025');
            m.reply(APISports.fmtPlayer(player[0] || {}));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },
    h2h: async (nimesha, m, { text, APISports, prefix }) => {
        if (!text) return m.reply(`Example: ${prefix}h2h <team1-id>-<team2-id>\nExample: ${prefix}h2h 33-40`);
        const [t1, t2] = text.split('-').map(x => parseInt(x.trim()));
        if (isNaN(t1) || isNaN(t2)) return m.reply('Invalid format. Use: 33-40');
        await m.reply('⚽ Fetching head-to-head...');
        try {
            const h2h = await APISports.headToHead(`${t1}-${t2}`);
            if (!h2h.length) return m.reply('No matches found.');
            let txt = `⚔️ *Head to Head*\n\n`;
            h2h.slice(0, 5).forEach(f => { txt += `${APISports.fmtFixture(f)}\n\n`; });
            m.reply(txt);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },
    predict: async (nimesha, m, { text, APISports, prefix }) => {
        if (!text) return m.reply(`Example: ${prefix}prediction <fixture-id>`);
        const id = parseInt(text);
        if (isNaN(id)) return m.reply('Invalid fixture ID.');
        await m.reply('🔮 Fetching prediction...');
        try {
            const pred = await APISports.predictions(id);
            if (!pred.length) return m.reply('No prediction available.');
            const p = pred[0];
            let txt = `🔮 *Match Prediction*\n\n`;
            txt += `⚽ ${p.teams?.home?.name} vs ${p.teams?.away?.name}\n\n📊 *Win Probability*\nHome: ${p.predictions?.percent?.home || '?'}%\nDraw: ${p.predictions?.percent?.draw || '?'}%\nAway: ${p.predictions?.percent?.away || '?'}%\n\n💡 *Advice:* ${p.predictions?.advice || 'N/A'}`;
            m.reply(txt);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },
    odds: async (nimesha, m, { text, OddsAPI, prefix }) => {
        if (!text) return m.reply(`Example: ${prefix}odds <sport-key>\nExample: ${prefix}odds soccer_epl`);
        const sport = text.trim();
        await m.reply('🎲 Fetching odds...');
        try {
            const odds = await OddsAPI.odds(sport, 'us', 'h2h');
            if (!odds.length) return m.reply('No odds found.');
            let txt = `🎲 *Betting Odds*\n\n`;
            odds.slice(0, 5).forEach(e => { txt += `${OddsAPI.fmtOdds(e)}\n`; });
            m.reply(txt);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },
    sports: async (nimesha, m, { OddsAPI }) => {
        await m.reply('🎲 Fetching available sports...');
        try {
            const sports = await OddsAPI.sports();
            if (!sports.length) return m.reply('No sports found.');
            let txt = `🏈 *Available Sports*\n\n`;
            sports.forEach(s => { txt += `• *${s.title}* — Key: \`${s.key}\` ${s.active ? '🟢' : '🔴'}\n`; });
            m.reply(txt);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },
    espn: async (nimesha, m, { args, ESPN, prefix }) => {
        if (!args[0] || !args[1]) return m.reply(`Example: ${prefix}espn <sport> <league>\nExample: ${prefix}espn soccer eng.1`);
        const sport = args[0]; const league = args[1];
        await m.reply('📺 Fetching ESPN scoreboard...');
        try {
            const sb = await ESPN.scoreboard(sport, league);
            m.reply(ESPN.fmtScoreboard(sb));
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },
    espnnews: async (nimesha, m, { args, ESPN, prefix }) => {
        if (!args[0] || !args[1]) return m.reply(`Example: ${prefix}espnnews <sport> <league>\nExample: ${prefix}espnnews soccer eng.1`);
        const sport = args[0]; const league = args[1];
        await m.reply('📰 Fetching news...');
        try {
            const news = await ESPN.news(sport, league);
            let txt = `📰 *ESPN News*\n\n`;
            news.articles?.slice(0, 5).forEach(a => { txt += `• *${a.headline}*\n  ${a.description?.slice(0, 80)}...\n  🔗 ${a.links?.web?.href}\n\n`; });
            m.reply(txt);
        } catch (e) { m.reply(`❌ ${e.message}`); }
    },
    sportsmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *⚽ SPORTS COMMANDS*  ║\n╚══════════════════════╝\n\n📌 *Football (API Sports)*\n▸ ${prefix}leagues – List leagues & IDs\n▸ ${prefix}fixtures <league-id> – Upcoming matches\n▸ ${prefix}live – Live scores (Premier League)\n▸ ${prefix}standings <league-id> – League table\n▸ ${prefix}team <id> – Team info\n▸ ${prefix}player <id> – Player stats\n▸ ${prefix}h2h <id1>-<id2> – Head to head\n▸ ${prefix}predict <fixture-id> – Match prediction\n\n📌 *Betting (Odds API)*\n▸ ${prefix}sports – List available sports\n▸ ${prefix}odds <sport-key> – Current odds\n\n📌 *ESPN (Free)*\n▸ ${prefix}espn <sport> <league> – Live scoreboard\n▸ ${prefix}espnnews <sport> <league> – News\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },
    moviesmenu: async (nimesha, m, { prefix }) => {
        const msg = `╔══════════════════════╗\n║  *🎬 MOVIES COMMANDS*  ║\n╚══════════════════════╝\n\n📌 *Movie Info*\n▸ ${prefix}movie <title>\n▸ ${prefix}film <title>\n▸ ${prefix}imdb <id>\n▸ ${prefix}series <title>\n▸ ${prefix}rating <id>\n▸ ${prefix}tv <show>\n▸ ${prefix}episodes <show-id> <season>\n▸ ${prefix}moviequote\n\n━━━━━━━━━━━━━━━━━━━━━━\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX`;
        await m.reply(msg);
    },
    // Aliases
    film: async (nimesha, m, ctx) => { await module.exports.movie(nimesha, m, ctx); },
    cinema: async (nimesha, m, ctx) => { await module.exports.movie(nimesha, m, ctx); },
    eps: async (nimesha, m, ctx) => { await module.exports.episodes(nimesha, m, ctx); },
    ontv: async (nimesha, m, ctx) => { await module.exports.tvschedule(nimesha, m, ctx); },
    livescore: async (nimesha, m, ctx) => { await module.exports.live(nimesha, m, ctx); },
    table: async (nimesha, m, ctx) => { await module.exports.standings(nimesha, m, ctx); },
    headtohead: async (nimesha, m, ctx) => { await module.exports.h2h(nimesha, m, ctx); },
    prediction: async (nimesha, m, ctx) => { await module.exports.predict(nimesha, m, ctx); },
    betting: async (nimesha, m, ctx) => { await module.exports.odds(nimesha, m, ctx); },
    sportsnews: async (nimesha, m, ctx) => { await module.exports.espnnews(nimesha, m, ctx); },
    scoreboard: async (nimesha, m, ctx) => { await module.exports.espn(nimesha, m, ctx); },
};