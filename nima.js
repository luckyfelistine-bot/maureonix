// nima.js – Wrapper that loads core handler and commands
const coreHandler = require('./nima_core');
const fs = require('fs');
const chalk = require('chalk');

module.exports = coreHandler;

// Hot reload watcher (optional but kept for development)
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});