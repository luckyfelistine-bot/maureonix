const fs = require('fs');
const chalk = require('chalk');

const SecureConfig = require('./config');

global.owner = SecureConfig.ownerNumber;
global.ownerName = SecureConfig.ownerName;
global.author = SecureConfig.ownerName;
global.botname = SecureConfig.botName;
global.packname = SecureConfig.botName;
global.listprefix = ['+','!','.']

global.listv = ['•','●','■','✿','▲','➩','➢','➣','➤','✦','✧','△','❀','○','□','♤','♡','◇','♧','々','〆']
global.tempatDB = 'database.json'
global.tempatStore = 'baileys_store.json'
global.pairing_code = true
global.number_bot = '254116903500'

global.fake = {
    anonim: 'https://ibb.co/rKyYj3Rr',
    thumbnailUrl: 'https://ibb.co/rKyYj3Rr',
    thumbnail: fs.readFileSync('./src/media/nima.png'),
    docs: fs.readFileSync('./src/media/fake.pdf'),
    listfakedocs: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/pdf'],
}

global.my = {
    tt: 'https://vm.tiktok.com/ZS9LevY1LSrXD-wytcp/',
    gh: 'https://github.com/luckyfelistine-bot',
    gc: 'https://whatsapp.com/channel/0029Vb7IABxCXC3J7ZFFsk2h',
    group: 'https://chat.whatsapp.com/B61mO6noiJG3wVzgkDZd4a',
    ch: SecureConfig.groupJid,
}

global.limit = {
    free: 20,
    premium: 999,
    vip: 9999
}

global.money = {
    free: 10000,
    premium: 1000000,
    vip: 10000000
}

global.mess = {
    key: 'Your API key has expired. Please visit https://nima.biz.id',
    owner: 'Only the owner can use this command.',
    admin: 'Only admins can use this command.',
    botAdmin: 'The bot needs to be admin to use this command.',
    group: 'This command can only be used in groups.',
    private: 'This command can only be used in private chats.',
    limit: 'You have exceeded your daily limit.',
    prem: 'This command is only for premium users.',
    wait: 'Processing, please wait...',
    error: 'An error occurred. Please try again later.',
    done: 'Done! ✅'
}

global.APIs = {
    nima: 'https://api.nima.biz.id',
}
global.APIKeys = {
    'https://api.nima.biz.id': SecureConfig.apiKey,
}

global.badWords = ['dongo']
global.chatLength = 500
global.geminiMemorySize = 50
global.geminiApiKey = SecureConfig.geminiApiKey;
global.footer = SecureConfig.footer;

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})