// lib/sharedMemory.js — Central log of all AI interactions
const interactions = [];
const MAX_LOG = 30; // keep the last 30 entries

function logInteraction(type, userId, message, response) {
    interactions.push({
        time: new Date().toISOString(),
        type,          // 'owner', 'private', 'autoai', 'gemini'
        userId: userId?.split?.('@')[0] || userId,
        message: message?.slice(0, 150),
        response: response?.slice(0, 150),
    });
    if (interactions.length > MAX_LOG) interactions.shift();
}

function getRecentInteractions(count = 10) {
    return interactions.slice(-count);
}

module.exports = { logInteraction, getRecentInteractions };
