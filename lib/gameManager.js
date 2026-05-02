// lib/gameManager.js – Maureonix Central Game State Manager
// Handles all game types: suit, connect4, chess, blackjack, snakeLadder,
// akinator, tebakbom, trivia, family100, rpg, mini, and any custom game.
// Auto‑cleanup, player search, and extensible design.

class GameManager {
    constructor() {
        // ──────────────────────────────────────────────────────────
        // Game collections – each is a Map<gameId, gameState>
        // You can add new types simply by defining a new Map here.
        // ──────────────────────────────────────────────────────────
        this.games = {
            // PvP / multiplayer games
            suit: new Map(),           // Rock‑Paper‑Scissors PvP
            connect4: new Map(),       // Connect 4 PvP
            chess: new Map(),          // Chess PvP / vs Bot
            snakeLadder: new Map(),    // Snakes & Ladders group
            family100: new Map(),      // Family 100 group quiz

            // Solo / vs Bot games
            blackjack: new Map(),      // Blackjack (casino solo)
            akinator: new Map(),       // Akinator per user
            tebakbom: new Map(),       // Bomb defuse game
            rpg: new Map(),            // RPG adventure per user
            mini: new Map(),           // All mini‑games (math, anagram, guessnum, pokemon, trivia, etc.)

            // Miscellaneous game collections (can be extended)
            tekateki: new Map(),       // Riddles
            tebaklagu: new Map(),      // Guess song lyrics
            tebakkata: new Map(),      // Word puzzle
            tebakgambar: new Map(),    // Guess image
            tebakbendera: new Map(),   // Guess flag
            tebaknegara: new Map(),    // Guess country
            tebakkimia: new Map(),     // Chemistry guess
            caklontong: new Map(),     // Wordplay quiz
            susunkata: new Map(),      // Arrange letters
            // Add any new game type here – it will be auto‑supported
        };

        // Default timeouts in milliseconds per game type.
        // Tune these values to balance memory and user experience.
        this.timeouts = {
            suit: 3 * 60 * 1000,          // 3 minutes
            connect4: 10 * 60 * 1000,     // 10 minutes
            chess: 60 * 60 * 1000,        // 1 hour
            blackjack: 5 * 60 * 1000,     // 5 minutes
            snakeLadder: 120 * 60 * 1000, // 2 hours
            akinator: 10 * 60 * 1000,     // 10 minutes
            tebakbom: 5 * 60 * 1000,      // 5 minutes
            trivia: 5 * 60 * 1000,        // 5 minutes
            family100: 10 * 60 * 1000,    // 10 minutes
            rpg: 30 * 60 * 1000,          // 30 minutes
            mini: 3 * 60 * 1000,          // 3 minutes

            // Default for any unspecified type
            default: 5 * 60 * 1000,
        };

        // Reverse index: playerId → { gameType, gameId }
        // Allows O(1) lookup of any active game a player is participating in.
        this.playerIndex = new Map();

        // Start periodic cleanup
        this.cleanupInterval = setInterval(() => this.cleanupExpired(), 5 * 60 * 1000);
        // Prevent interval from blocking process exit (optional)
        if (this.cleanupInterval.unref) this.cleanupInterval.unref();
    }

    // ──────────────────────────────────────────────────────────────
    //  Core CRUD operations
    // ──────────────────────────────────────────────────────────────

    /**
     * Store a game instance.
     * @param {string} type – one of the keys in this.games
     * @param {string} id – unique identifier (game ID, e.g., 'c4_123456')
     * @param {object} data – the game state object
     * @param {array} players – optional array of player JIDs (for indexing)
     * @returns {boolean} success
     */
    set(type, id, data, players = []) {
        const store = this.games[type];
        if (!store) {
            console.warn(`[GameManager] Unknown game type: ${type}`);
            return false;
        }
        data._lastActivity = Date.now();
        store.set(id, data);

        // Index players for fast lookup
        if (players && players.length) {
            for (const player of players) {
                const normalized = this._normalizeJid(player);
                if (!this.playerIndex.has(normalized)) {
                    this.playerIndex.set(normalized, new Set());
                }
                this.playerIndex.get(normalized).add({ type, id });
            }
        }
        return true;
    }

    /**
     * Retrieve a game instance.
     * Automatically touches _lastActivity to prevent expiry.
     * @param {string} type
     * @param {string} id
     * @returns {object|undefined}
     */
    get(type, id) {
        const store = this.games[type];
        if (!store) return undefined;
        const data = store.get(id);
        if (!data) return undefined;
        data._lastActivity = Date.now();
        return data;
    }

    /**
     * Delete a game instance and remove from player index.
     * @param {string} type
     * @param {string} id
     * @returns {boolean}
     */
    delete(type, id) {
        const store = this.games[type];
        if (!store) return false;
        const data = store.get(id);
        if (data) {
            // Remove from player index
            const players = this._extractPlayers(data);
            for (const player of players) {
                const norm = this._normalizeJid(player);
                const idx = this.playerIndex.get(norm);
                if (idx) {
                    for (const entry of idx) {
                        if (entry.type === type && entry.id === id) {
                            idx.delete(entry);
                            break;
                        }
                    }
                    if (idx.size === 0) this.playerIndex.delete(norm);
                }
            }
        }
        return store.delete(id);
    }

    /**
     * Check if a game has expired (idle too long).
     * @param {string} type
     * @param {string} id
     * @returns {boolean}
     */
    isExpired(type, id) {
        const store = this.games[type];
        if (!store) return true;
        const data = store.get(id);
        if (!data) return true;
        const timeout = this.timeouts[type] || this.timeouts.default;
        return Date.now() - (data._lastActivity || 0) > timeout;
    }

    // ──────────────────────────────────────────────────────────────
    //  Advanced queries
    // ──────────────────────────────────────────────────────────────

    /**
     * List all active games of a given type.
     * @param {string} type
     * @returns {Array<object>}
     */
    getAll(type) {
        const store = this.games[type];
        if (!store) return [];
        return Array.from(store.values());
    }

    /**
     * Find a game where a specific player is involved (fast O(1) using index).
     * @param {string} playerId – JID (e.g., '123@s.whatsapp.net')
     * @returns {{ type: string, id: string, data: object } | undefined}
     */
    findPlayerGame(playerId) {
        const norm = this._normalizeJid(playerId);
        const entries = this.playerIndex.get(norm);
        if (!entries || entries.size === 0) return undefined;
        // Return the first active game found (a player can only be in one game of a type at a time)
        for (const entry of entries) {
            const data = this.get(entry.type, entry.id);
            if (data) return { ...entry, data };
        }
        return undefined;
    }

    /**
     * Legacy method – find game by type and player (slower, but kept for compatibility).
     * @param {string} type
     * @param {string} playerId
     * @returns {{ id: string, data: object } | undefined}
     */
    findPlayerIn(type, playerId) {
        const store = this.games[type];
        if (!store) return undefined;
        for (const [id, data] of store) {
            const players = this._extractPlayers(data);
            if (players.some(p => this._normalizeJid(p) === this._normalizeJid(playerId))) {
                return { id, data };
            }
        }
        return undefined;
    }

    /**
     * Delete all games of a certain type (e.g., when bot restarts).
     * @param {string} type
     */
    clearAll(type) {
        const store = this.games[type];
        if (!store) return;
        // Remove from player index
        for (const [id, data] of store) {
            const players = this._extractPlayers(data);
            for (const player of players) {
                const norm = this._normalizeJid(player);
                const idx = this.playerIndex.get(norm);
                if (idx) {
                    for (const entry of idx) {
                        if (entry.type === type && entry.id === id) {
                            idx.delete(entry);
                            break;
                        }
                    }
                    if (idx.size === 0) this.playerIndex.delete(norm);
                }
            }
        }
        store.clear();
    }

    // ──────────────────────────────────────────────────────────────
    //  Automatic expiry & stats
    // ──────────────────────────────────────────────────────────────

    /**
     * Remove all expired games from all collections.
     * Called automatically every 5 minutes.
     */
    cleanupExpired() {
        const now = Date.now();
        let totalCleaned = 0;
        for (const [type, store] of Object.entries(this.games)) {
            const timeout = this.timeouts[type] || this.timeouts.default;
            const toDelete = [];
            for (const [id, data] of store) {
                if (now - (data._lastActivity || 0) > timeout) {
                    toDelete.push(id);
                }
            }
            for (const id of toDelete) {
                this.delete(type, id);  // delete handles index cleanup
                totalCleaned++;
            }
            if (toDelete.length) {
                console.log(`[GameManager] Cleaned ${toDelete.length} expired ${type} games`);
            }
        }
        if (totalCleaned) console.log(`[GameManager] Total cleaned: ${totalCleaned} games`);
    }

    /**
     * Get current statistics: how many active games per type.
     * @returns {object}
     */
    stats() {
        const stats = {};
        for (const [type, store] of Object.entries(this.games)) {
            stats[type] = store.size;
        }
        stats.playerIndexSize = this.playerIndex.size;
        return stats;
    }

    /**
     * Graceful shutdown – clears all games.
     */
    shutdown() {
        if (this.cleanupInterval) clearInterval(this.cleanupInterval);
        for (const type of Object.keys(this.games)) {
            this.clearAll(type);
        }
        this.playerIndex.clear();
        console.log('[GameManager] Shutdown complete – all games cleared.');
    }

    // ──────────────────────────────────────────────────────────────
    //  Private helpers
    // ──────────────────────────────────────────────────────────────

    /**
     * Extract all player IDs from a game state object.
     * Recognises common patterns: p, p2, player1, player2, players array.
     * @param {object} data
     * @returns {string[]}
     */
    _extractPlayers(data) {
        if (!data) return [];
        const players = [];
        if (data.p) players.push(data.p);
        if (data.p2) players.push(data.p2);
        if (data.player1) players.push(data.player1);
        if (data.player2) players.push(data.player2);
        if (data.players && Array.isArray(data.players)) {
            for (const p of data.players) {
                if (p.id) players.push(p.id);
                else if (typeof p === 'string') players.push(p);
            }
        }
        // Remove duplicates and normalize JIDs
        return [...new Set(players.map(p => this._normalizeJid(p)))];
    }

    /**
     * Normalize a JID: ensure it ends with '@s.whatsapp.net' or '@g.us'.
     * @param {string} jid
     * @returns {string}
     */
    _normalizeJid(jid) {
        if (!jid) return '';
        if (jid.includes('@')) return jid;
        // Assume it's a phone number without suffix – add default
        return jid + '@s.whatsapp.net';
    }
}

// Singleton instance – export once
const gameManager = new GameManager();
module.exports = gameManager;
