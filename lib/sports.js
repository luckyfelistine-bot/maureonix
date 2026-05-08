// ╔══════════════════════════════════════════════════════════════════╗
// ║  ⚽ MAUREONIX GODMODE SPORTS ENGINE v6.0.0                     ║
// ║  API-Sports (Football) + The Odds API + ESPN Free APIs         ║
// ║  Created by Infinite Vybeflix — God of the Pitch              ║
// ╚══════════════════════════════════════════════════════════════════╝
// ═══════════════════════════════════════════════════════════════════
//  🌍 API SPORTS (FOOTBALL) – v3.football.api-sports.io
// ═══════════════════════════════════════════════════════════════════
class APISports {
    static getKey() {
        const cfg = getConfig();
        return cfg.apiSportsKey || 'e77f42417ca17805d5c16951a9af6137';
    }

    // ── internal fetcher with AbortController timeout ──
    static async req(endpoint, params = {}, opts = {}) {
        const base = 'https://v3.football.api-sports.io';
        const url = new URL(base + endpoint);
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
                url.searchParams.set(k, v);
            }
        });

        // use the caller's signal, or create a default 15‑second one
        const signal = opts.signal;
        const controller = signal ? null : new AbortController();
        const timer = controller ? setTimeout(() => controller.abort(), 15000) : null;

        try {
            const res = await fetch(url.toString(), {
                headers: {
                    'x-apisports-key': this.getKey(),
                    'Content-Type': 'application/json',
                },
                signal: signal || controller?.signal,
            });
            if (!res.ok) throw new Error(`API Sports ${res.status}`);
            const data = await res.json();
            if (data.errors && Object.keys(data.errors).length) {
                throw new Error(data.errors.rateLimit || 'API Sports error');
            }
            return data.response || [];
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    // ── public methods that forward an optional signal ──
    static async leagues(params = {}, opts = {}) { return this.req('/leagues', params, opts); }
    static async seasons(league, opts = {}) { return this.req('/leagues/seasons', { league }, opts); }
    static async teams(params = {}, opts = {}) { return this.req('/teams', params, opts); }
    static async team(id, opts = {}) { return this.req('/teams', { id }, opts); }
    static async squad(team, season, opts = {}) { return this.req('/players/squads', { team, season }, opts); }
    static async players(params = {}, opts = {}) { return this.req('/players', params, opts); }
    static async player(id, season, opts = {}) { return this.req('/players', { id, season }, opts); }
    static async fixtures(params = {}, opts = {}) { return this.req('/fixtures', params, opts); }
    static async fixture(id, opts = {}) { return this.req('/fixtures', { id }, opts); }
    static async live(league, opts = {}) { return this.req('/fixtures', { live: 'all', league }, opts); }
    static async headToHead(h2h, opts = {}) { return this.req('/fixtures/headtohead', { h2h }, opts); }
    static async standings(league, season, opts = {}) { return this.req('/standings', { league, season }, opts); }
    static async statistics(fixture, team, opts = {}) { return this.req('/statistics', { fixture, team }, opts); }
    static async predictions(fixture, opts = {}) { return this.req('/predictions', { fixture }, opts); }
    static async odds(fixture, opts = {}) { return this.req('/odds', { fixture }, opts); }
    static async injuries(params = {}, opts = {}) { return this.req('/injuries', params, opts); }
    static async transfers(params = {}, opts = {}) { return this.req('/transfers', params, opts); }
    static async countries(opts = {}) { return this.req('/countries', {}, opts); }
    static async venues(params = {}, opts = {}) { return this.req('/venues', params, opts); }
    static async timezone(opts = {}) { return this.req('/timezone', {}, opts); }

    // ── formatters (unchanged) ──
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
