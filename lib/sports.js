// ╔══════════════════════════════════════════════════════════════════╗
// ║  ⚽ MAUREONIX GODMODE SPORTS ENGINE v7.0.0                     ║
// ║  SPORTS REMOVED — REPLACED WITH FREE ENTERTAINMENT APIs          ║
// ║  ESPN Free + TheSportsDB + SportMonks + SportSRC            ║
// ║  + Football-Data.org + API-Football (RapidAPI fallback)          ║
// ╚══════════════════════════════════════════════════════════════════╝

const fetch = require('node-fetch');

// ─── UNIVERSAL FETCH WITH TIMEOUT ───
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

// ─── ESPN FREE PUBLIC API (No Key) ───
class ESPN {
    static async req(path) {
        const base = 'https://site.api.espn.com/apis/site/v2/sports';
        const d = await safeFetch(base + path);
        if (!d) throw new Error('ESPN returned empty response.');
        return d;
    }
    static scoreboard(sport, league) { return this.req(`/${sport}/${league}/scoreboard`); }
    static news(sport, league) { return this.req(`/${sport}/${league}/news`); }
    static standings(sport, league) { return this.req(`/${sport}/${league}/standings`); }
    static teams(sport, league) { return this.req(`/${sport}/${league}/teams`); }
    static events(sport, league) { return this.req(`/${sport}/${league}/events`); }
    static fmtScoreboard(sb) {
        let txt = `🏆 *${sb.leagues?.[0]?.name || 'Live Scores'}*

`;
        if (!sb.events || !sb.events.length) return '⚠️ No live scores available right now.';
        sb.events.forEach(e => {
            const comp = e.competitions?.[0];
            const home = comp?.competitors?.find(c => c.homeAway === 'home');
            const away = comp?.competitors?.find(c => c.homeAway === 'away');
            const score = home && away ? `${home.score} - ${away.score}` : 'vs';
            const status = comp?.status?.type?.shortDetail || '';
            txt += `⚽ *${home?.team?.shortDisplayName || 'Home'}* ${score} *${away?.team?.shortDisplayName || 'Away'}*
   ${status}

`;
        });
        return txt;
    }
    static fmtNews(news) {
        let txt = `📰 *ESPN News*

`;
        if (!news.articles || !news.articles.length) return '⚠️ No news available.';
        news.articles.slice(0, 5).forEach(a => {
            txt += `• *${a.headline}*
  ${a.description?.slice(0, 100) || ''}...
  🔗 ${a.links?.web?.href || ''}

`;
        });
        return txt;
    }
}

// ─── THESPORTSDB (FREE — NO KEY, Community Maintained) ───
class TheSportsDB {
    static async req(path) {
        const d = await safeFetch(`https://www.thesportsdb.com/api/v1/json/3${path}`);
        if (!d || d.events === null) throw new Error('TheSportsDB returned no data.');
        return d;
    }
    static searchTeam(q) { return this.req(`/searchteams.php?t=${encodeURIComponent(q)}`); }
    static searchEvent(q) { return this.req(`/searchevents.php?e=${encodeURIComponent(q)}`); }
    static next5(leagueId) { return this.req(`/eventsnextleague.php?id=${leagueId}`); }
    static last5(leagueId) { return this.req(`/eventspastleague.php?id=${leagueId}`); }
    static leagues() { return this.req('/all_leagues.php'); }
    static seasons(id) { return this.req(`/lookup_all_seasons.php?id=${id}`); }
    static fmtEvent(e) {
        return `⚽ *${e.strEvent}*
📅 ${e.dateEvent || 'TBA'} | 🏟️ ${e.strVenue || 'Unknown Venue'}
🏠 ${e.strHomeTeam} vs ${e.strAwayTeam}
🔗 https://www.thesportsdb.com/event/${e.idEvent}`;
    }
    static fmtTeam(t) {
        return `🏟️ *${t.strTeam}*
📍 ${t.strStadiumLocation || 'Unknown Location'}
🏠 Stadium: ${t.strStadium || 'N/A'} (${t.intStadiumCapacity || '?'} seats)
🌐 ${t.strWebsite || t.strFacebook || 'No website'}
🔗 https://www.thesportsdb.com/team/${t.idTeam}`;
    }
    static fmtLeagues(list) {
        if (!list || !list.length) return '❌ No leagues found.';
        let txt = `🏆 *Leagues*

`;
        list.slice(0, 15).forEach(l => {
            txt += `• *${l.strLeague}* (${l.strSport}) — ID: ${l.idLeague}
`;
        });
        return txt;
    }
}

// ─── SPORTMONKS (FREE TIER — NO KEY for selected leagues) ───
class SportMonks {
    static async req(path) {
        const key = process.env.SPORTMONKS_KEY || '';
        const url = key ? `https://api.sportmonks.com/v3/football${path}?api_token=${key}` : `https://api.sportmonks.com/v3/football${path}`;
        const d = await safeFetch(url);
        if (!d || !d.data) throw new Error('SportMonks returned no data (free tier may be limited).');
        return d.data;
    }
    static leagues() { return this.req('/leagues'); }
    static fixtures(date) { return this.req(`/fixtures/date/${date}`); }
    static live() { return this.req('/livescores'); }
    static standings(seasonId) { return this.req(`/standings/season/${seasonId}`); }
    static fmtFixture(f) {
        const home = f.participants?.find(p => p.meta?.location === 'home')?.name || 'Home';
        const away = f.participants?.find(p => p.meta?.location === 'away')?.name || 'Away';
        const score = f.scores ? `${f.scores.find(s => s.description === 'CURRENT')?.score?.goals || '?'}` : 'vs';
        return `⚽ *${home}* ${score} *${away}*
📅 ${f.starting_at || 'TBA'} | 🏆 ${f.league?.name || 'Unknown'}`;
    }
}

// ─── SPORTSRC (FREE — NO KEY, JSON API) ───
class SportSRC {
    static async req(path) {
        const d = await safeFetch(`https://api.sportsrc.io${path}`);
        if (!d) throw new Error('SportSRC returned no data.');
        return d;
    }
    static scoreboard() { return this.req('/scoreboard'); }
    static news() { return this.req('/news'); }
    static fmtScoreboard(sb) {
        if (!sb || !sb.length) return '⚠️ No scores available.';
        let txt = `🏆 *Live Scores (SportSRC)*

`;
        sb.slice(0, 10).forEach(g => {
            txt += `⚽ *${g.home_team}* ${g.home_score} - ${g.away_score} *${g.away_team}*
   ${g.status} | ${g.league}

`;
        });
        return txt;
    }
}

// ─── FOOTBALL-DATA.ORG (FREE — NO KEY, limited) ───
class FootballData {
    static async req(path) {
        const d = await safeFetch(`https://api.football-data.org/v4${path}`, {
            headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_KEY || '' }
        });
        if (!d) throw new Error('Football-Data returned no data.');
        return d;
    }
    static competitions() { return this.req('/competitions'); }
    static matches(competition) { return this.req(`/competitions/${competition}/matches`); }
    static standings(competition) { return this.req(`/competitions/${competition}/standings`); }
    static fmtMatch(m) {
        return `⚽ *${m.homeTeam.shortName || m.homeTeam.name}* ${m.score.fullTime.home ?? '?'} - ${m.score.fullTime.away ?? '?'} *${m.awayTeam.shortName || m.awayTeam.name}*
📅 ${m.utcDate || 'TBA'} | 🏆 ${m.competition?.name || 'Unknown'}`;
    }
    static fmtStandings(d) {
        if (!d.standings || !d.standings.length) return '❌ No standings found.';
        let txt = `📊 *${d.competition?.name || 'League Table'}*

`;
        d.standings[0]?.table?.slice(0, 10).forEach((t, i) => {
            txt += `${i + 1}. *${t.team.shortName || t.team.name}* | Pts: ${t.points} | P: ${t.playedGames} | GD: ${t.goalDifference}
`;
        });
        return txt;
    }
}

// ─── EXPORTS ───
module.exports = {
    ESPN,
    TheSportsDB,
    SportMonks,
    SportSRC,
    FootballData,
    safeFetch
};
