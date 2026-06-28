// lib/gameHandler.js
// Middleware that processes replies for all interactive games
const gameManager = require('./gameManager');
const {
    suitAccept, suitChoice,
    chessMove,
    connect4Move,
    bombResponse,
    akinatorResponse,
    triviaResponse,
    family100Response,
    snakeLadderResponse,
    miniGameAnswer
} = require('../commands/games');
const { similarity } = require('./function');
const { iGame } = (() => {
    try { return require('./game'); } catch { return require('../commands/games'); }
})();
const almost = 0.66;                                   // the same threshold used in maureonix_core

/**
 * @param {object} maureonix – Baileys socket
 * @param {object} m – Baileys message object
 * @param {object} ctx – { db, ownerNumber, isCreator, command, prefix, set, ... }
 * @returns {Promise<boolean>} true if the message was consumed by a game
 */
async function handleGameMessage(maureonix, m, ctx) {
    const { db, ownerNumber, isCreator, command, prefix } = ctx;
    const sender = m.sender;

    // ── PvP Games (managed by gameManager) ──

    // 1. SUIT (Rock‑Paper‑Scissors)
    const suitGame = gameManager.findPlayerIn('suit', sender);
    if (suitGame) {
        const { data } = suitGame;
        // Acceptance phase
        if (data.status === 'wait' && m.isGroup) {
            await suitAccept(maureonix, m, db);
            return true;
        }
        // Choice phase (private chat only)
        if (data.status === 'play' && !m.isGroup && /^(rock|paper|scissors)$/i.test(m.text)) {
            await suitChoice(maureonix, m, db);
            return true;
        }
        // Any other message during an active suit game – swallow it
        return true;
    }

    // 2. CHESS
    const chessGame = gameManager.findPlayerIn('chess', sender);
    if (chessGame) {
        const { data } = chessGame;
        // Only process if it's the player's turn and the message looks like a move
        if (data.turn === sender && /^[a-h][1-8]\s+[a-h][1-8]$/i.test(m.text)) {
            await chessMove(maureonix, m, db);
            return true;
        }
        return true; // suppress other handlers
    }

    // 3. CONNECT 4
    const c4Game = gameManager.findPlayerIn('connect4', sender);
    if (c4Game) {
        const { data } = c4Game;
        if (data.state === 'PLAYING') {
            // Surrender
            if (/^(me)?nyerah|surr?ender$/i.test(m.text)) {
                const winner = sender === data.player1 ? data.player2 : data.player1;
                await maureonix.sendMessage(m.chat, {
                    text: `🏳️ @${sender.split('@')[0]} surrendered!\n@${winner.split('@')[0]} wins!`,
                    mentions: [sender, winner]
                });
                gameManager.delete('connect4', c4Game.id);
                return true;
            }
            // Column move (1‑7)
            if (/^[1-7]$/.test(m.text)) {
                await connect4Move(maureonix, m);
                return true;
            }
        }
        return true;
    }

    // ── Solo Games (stored in db.game or db.users) ──

    // 4. BOMB GAME
    if (await bombResponse(m, db)) return true;

    // 5. AKINATOR
    if (await akinatorResponse(m)) return true;

    // 6. TRIVIA WORD GAMES (tebaklirik, tekateki, etc.)
    if (await triviaResponse(m, db, { iGame, similarity, almost })) return true;

    // 7. FAMILY 100
    if (await family100Response(m, db)) return true;

    // 8. SNAKE LADDER
    if (await snakeLadderResponse(maureonix, m, db)) return true;

    // 9. MINI‑GAME ANSWERS (trivia, math, anagram, guess number, pokemon, movie)
    if (await miniGameAnswer(m, db)) return true;

    return false;
}

module.exports = handleGameMessage;
