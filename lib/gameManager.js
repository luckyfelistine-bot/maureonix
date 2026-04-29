// lib/gameManager.js – Maureonix Centralised Game State Manager
// Replaces fragile direct storage in global.db.game with automatic expiry

const crypto = require('crypto');

class GameManager {
    constructor() {
        // In‑memory storage (fast, cleaned on crash)
        this.games = {
            suit: new Map(),
            connect4: new Map(),
            chess: new Map(),
            blackjack: new Map(),
            snakeLadder: new Map(),
            akinator: new Map(),
            tebakbom: new Map(),
            trivia: new Map(),     // tekateki, tebaklirik, etc.
            family100: new Map(),
            rpg: new Map(),
            // mini‑games (per user)
            mini: new Map(),
        };

        // Default timeouts (ms)
        this.timeouts = {
            suit: 3 * 60 * 1000,
            connect4: 10 * 60 * 1000,
            chess: 60 * 60 * 1000,
            blackjack: 5 * 60 * 1000,
            snakeLadder: 120 * 60 * 1000,
            akinator: 10 * 60 * 1000,
            tebakbom: 5 * 60 * 1000,
            trivia: 5 * 60 * 1000,
            family100: 10 * 60 * 1000,
            rpg: 30 * 60 * 1000,
            mini: 3 * 60 * 1000,
        };

        // Periodic cleanup every 5 minutes
        setInterval(() => this.cleanupExpired(), 5 * 60 * 1000);
    }

    // ── Generic setter ──────────────────────────────────────
    set(type, id, data) {
        // type must be one of the known collections
        const store = this.games[type];
        if (!store) return false;
        data._lastActivity = Date.now();
        store.set(id, data);
        return true;
    }

    // ── Generic getter ──────────────────────────────────────
    get(type, id) {
        const store = this.games[type];
        if (!store) return undefined;
        const data = store.get(id);
        if (!data) return undefined;
        // Update activity timestamp on access
        data._lastActivity = Date.now();
        return data;
    }

    // ── Check if a game is still alive (not expired) ────────
    isExpired(type, id) {
        const store = this.games[type];
        if (!store) return true;
        const data = store.get(id);
        if (!data) return true;
        const timeout = this.timeouts[type] || 5 * 60 * 1000;
        return Date.now() - (data._lastActivity || 0) > timeout;
    }

    // ── Delete a game ───────────────────────────────────────
    delete(type, id) {
        const store = this.games[type];
        if (!store) return false;
        return store.delete(id);
    }

    // ── Get all active games of a type (for iteration) ──────
    getAll(type) {
        const store = this.games[type];
        if (!store) return [];
        return Array.from(store.values());
    }

    // ── Find games where a player is involved (for Connect4, Suit, etc.) ──
    findPlayerIn(type, playerId) {
        const store = this.games[type];
        if (!store) return undefined;
        for (const [id, data] of store) {
            if (data.p === playerId || data.p2 === playerId ||
                data.player1 === playerId || data.player2 === playerId ||
                (data.players && data.players.some(p => p.id === playerId))) {
                return { id, data };
            }
        }
        return undefined;
    }

    // ── Periodic cleanup of expired games ───────────────────
    cleanupExpired() {
        for (const [type, store] of Object.entries(this.games)) {
            const timeout = this.timeouts[type] || 5 * 60 * 1000;
            const now = Date.now();
            for (const [id, data] of store) {
                if (now - (data._lastActivity || 0) > timeout) {
                    store.delete(id);
                    console.log(`[GameManager] Cleaned up expired ${type} game ${id}`);
                }
            }
        }
    }

    // ── Get total count stats ───────────────────────────────
    stats() {
        const s = {};
        for (const [type, store] of Object.entries(this.games)) {
            s[type] = store.size;
        }
        return s;
    }
}

// Singleton
const gameManager = new GameManager();
module.exports = gameManager;