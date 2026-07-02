// maureonix.js — Loader wrapper (NO-OP export to prevent double handling)
// src/message.js calls both coreHandler and cmdHandler.
// By exporting null here, cmdHandler becomes null and messages are handled ONCE.

require('./maureonix_core');

module.exports = null;
