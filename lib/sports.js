// ╔══════════════════════════════════════════════════════════════════╗
// ║  ⚽ MAUREONIX GODMODE SPORTS ENGINE v6.0.0                     ║
// ║  API-Sports (Football) + The Odds API + ESPN Free APIs         ║
// ║  Created by Infinite Vybeflix — God of the Pitch              ║
// ╚══════════════════════════════════════════════════════════════════╝

const fetch = require('node-fetch');

// ═══════════════════════════════════════════════════════════════════
//  CONFIGURATION (read from global SecureConfig)
// ═══════════════════════════════════════════════════════════════════
const getConfig = () => {
    try {
        return require('../config');
    } catch {
        return {
            apiSportsKey: process.env.API_SPORTS_KEY || '',
            oddsApiKey: process.env.ODDS_API_KEY || '',
        };
    }
};

// ═══════════════════════════════════════════════════════════════════
//  🌍 API SPORTS (FOOTBALL) – https://v3.football.api-sports.io
// ═══════════════════════════════════════════════════════════════════
class APISports {
    static getKey() {
        const cfg = getConfig();
        return cfg.apiSportsKey || 'e77f42417ca17805d5c16951a9af6137';
    }

    static async req(endpoint, params = {}) {
        const base = 'https://v3.football.api-sports.io';
        const url = new URL(base + endpoint);
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
                url.searchParams.set(k, v);
            }
        });
        const res = await fetch(url.toString(), {
            headers: {
                'x-apisports-key': this.getKey(),
                'Content-Type': 'application/json',
            },
            timeout: 15000,
        });
        if (!res.ok) throw new Error(`API Sports ${res.status}`);
        const data = await res.json();
        if (data.errors && Object.keys(data.errors).length) {
            throw new Error(data.errors.rateLimit || 'API Sports error');
        }
        return data.response || [];
    }

    // Leagues & Seasons
    static async leagues(params = {}) { return this.req('/leagues', params); }
    static async seasons(league) { return this.req('/leagues/seasons', { league }); }

    // Teams & Players
    static async teams(params = {}) { return this.req('/teams', params); }
    static async team(id) { return this.req('/teams', { id }); }
    static async squad(team, season) { return this.req('/players/squads', { team, season }); }
    static async players(params = {}) { return this.req('/players', params); }
    static async player(id, season) { return this.req('/players', { id, season }); }

    // Fixtures & Live
    static async fixtures(params = {}) { return this.req('/fixtures', params); }
    static async fixture(id) { return this.req('/fixtures', { id }); }
    static async live(league) { return this.req('/fixtures', { live: 'all', league }); }
    static async headToHead(h2h) { return this.req('/fixtures/headtohead', { h2h }); }

    // Standings
    static async standings(league, season) { return this.req('/standings', { league, season }); }

    // Stats & Predictions
    static async statistics(fixture, team) { return this.req('/statistics', { fixture, team }); }
    static async predictions(fixture) { return this.req('/predictions', { fixture }); }
    static async odds(fixture) { return this.req('/odds', { fixture }); }

    // Other
    static async injuries(params = {}) { return this.req('/injuries', params); }
    static async transfers(params = {}) { return this.req('/transfers', params); }
    static async countries() { return this.req('/countries'); }
    static async venues(params = {}) { return this.req('/venues', params); }
    static async timezone() { return this.req('/timezone'); }

    // Formatters
    static fmtFixture(f) {
        const home = f.teams?.home?.name || 'Home';
        const away = f.teams?.away?.name || 'Away';
        const score = f.goals?.home !== null ? `${f.goals.home} - ${f.goals.away}` : 'vs';
        const status = f.status?.long || 'Scheduled';
        const league = f.league?.name || 'Unknown League';
        const date = new Date(f.fixture?.date).toLocaleString();
        return `⚽ *${home}* ${score} *${away}*\n📋 ${league} | ${status}\n📅 ${date}`;
    }

    static fmtStandings(s) {
        if (!s.league?.standings) return 'No standings.';
        let txt = `📊 *${s.league.name}*\n\n`;
        const groups = s.league.standings;
        groups.forEach((group, i) => {
            if (groups.length > 1) txt += `─ *Group ${i + 1}* ─\n`;
            group.forEach((t, j) => {
                txt += `${j + 1}. *${t.team.name}* | Pts: ${t.points} | GD: ${t.goalsDiff} | Played: ${t.all.played}\n`;
            });
        });
        return txt;
    }

    static fmtTeam(t) {
        if (!t.team) return 'Team not found.';
        const info = t.team;
        const venue = t.venue?.name || 'N/A';
        return `🏟️ *${info.name}*\n📍 Country: ${info.country}\n🏠 Founded: ${info.founded || 'N/A'}\n🏟️ Stadium: ${venue} (${t.venue?.capacity || 'N/A'} seats)`;
    }

    static fmtPlayer(p) {
        const pl = p.player;
        const stats = p.statistics?.[0] || {};
        return `👤 *${pl.name}* (${pl.age || '?'})\n🎽 Position: ${stats.games?.position || 'N/A'}\n⚽ Goals: ${stats.goals?.total || 0} | 🎯 Assists: ${stats.goals?.assists || 0}\n🏟️ Team: ${stats.team?.name || 'N/A'}`;
    }
}

// ═══════════════════════════════════════════════════════════════════
//  🎲 THE ODDS API – https://api.the-odds-api.com/v4
// ═══════════════════════════════════════════════════════════════════
class OddsAPI {
    static getKey() {
        const cfg = getConfig();
        return cfg.oddsApiKey || '4ac89ebfd82a84d98aa247d8cad45817';
    }

    static async req(endpoint, params = {}) {
        const base = 'https://api.the-odds-api.com/v4';
        const url = new URL(base + endpoint);
        url.searchParams.set('apiKey', this.getKey());
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null) url.searchParams.set(k, v);
        });
        const res = await fetch(url.toString(), { timeout: 15000 });
        if (!res.ok) throw new Error(`Odds API ${res.status}`);
        const data = await res.json();
        if (data.error_code) throw new Error(data.message);
        return data;
    }

    static async sports(all = false) { return this.req('/sports', { all }); }
    static async events(sport, dateFormat = 'iso') { return this.req(`/sports/${sport}/events`, { dateFormat }); }
    static async odds(sport, regions = 'us', markets = 'h2h', dateFormat = 'iso', oddsFormat = 'decimal') {
        return this.req(`/sports/${sport}/odds`, { regions, markets, dateFormat, oddsFormat });
    }
    static async eventOdds(sport, eventId, regions = 'us', markets = 'h2h', oddsFormat = 'decimal') {
        return this.req(`/sports/${sport}/events/${eventId}/odds`, { regions, markets, oddsFormat });
    }
    static async historical(sport, date, markets = 'h2h', oddsFormat = 'decimal') {
        return this.req(`/historical/sports/${sport}/odds`, { date, markets, oddsFormat });
    }

    static fmtOdds(event) {
        const home = event.home_team;
        const away = event.away_team;
        let txt = `🎲 *${home} vs ${away}*\n📅 ${new Date(event.commence_time).toLocaleString()}\n\n`;
        event.bookmakers?.forEach(bk => {
            txt += `🏪 *${bk.title}*\n`;
            bk.markets?.forEach(m => {
                m.outcomes?.forEach(o => {
                    txt += `  ${o.name}: ${o.price}\n`;
                });
            });
        });
        return txt;
    }
}

// ═══════════════════════════════════════════════════════════════════
//  🆓 ESPN FREE PUBLIC API (No Key Required)
// ═══════════════════════════════════════════════════════════════════
class ESPN {
    static async req(path) {
        const base = 'https://site.api.espn.com/apis/site/v2/sports';
        const url = base + path;
        const res = await fetch(url, { timeout: 15000 });
        if (!res.ok) throw new Error(`ESPN ${res.status}`);
        return await res.json();
    }

    static async scoreboard(sport, league) { return this.req(`/${sport}/${league}/scoreboard`); }
    static async news(sport, league) { return this.req(`/${sport}/${league}/news`); }
    static async standings(sport, league) { return this.req(`/${sport}/${league}/standings`); }
    static async teams(sport, league) { return this.req(`/${sport}/${league}/teams`); }
    static async events(sport, league) { return this.req(`/${sport}/${league}/events`); }

    static fmtScoreboard(sb) {
        let txt = `🏆 *${sb.leagues?.[0]?.name || 'Live Scores'}*\n\n`;
        sb.events?.forEach(e => {
            const comp = e.competitions?.[0];
            const home = comp?.competitors?.find(c => c.homeAway === 'home');
            const away = comp?.competitors?.find(c => c.homeAway === 'away');
            const score = home && away ? `${home.score} - ${away.score}` : 'vs';
            txt += `⚽ *${home?.team?.shortDisplayName}* ${score} *${away?.team?.shortDisplayName}*\n   ${comp?.status?.type?.shortDetail || ''}\n\n`;
        });
        return txt || 'No live scores.';
    }
}

// ═══════════════════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════════════════
module.exports = {
    APISports,
    OddsAPI,
    ESPN,
};