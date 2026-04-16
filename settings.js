const fs = require('fs');
const chalk = require('chalk');

const SecureConfig = require('./config');

global.owner = SecureConfig.ownerNumber;
global.ownerName = SecureConfig.ownerName;
global.author = SecureConfig.ownerName;
global.botname = SecureConfig.botName;
global.packname = SecureConfig.botName;
global.listprefix = ['+','!','.'];

global.listv = ['•','●','■','✿','▲','➩','➢','➣','➤','✦','✧','△','❀','○','□','♤','♡','◇','♧','々','〆'];
global.tempatDB = 'database.json';
global.tempatStore = 'baileys_store.json';
global.pairing_code = SecureConfig.pairingCode;
global.number_bot = SecureConfig.number_bot;

global.fake = {
    anonim: 'https://ibb.co/rKyYj3Rr',
    thumbnailUrl: 'https://ibb.co/rKyYj3Rr',
    thumbnail: fs.readFileSync('./src/media/nima.png'),
    docs: fs.readFileSync('./src/media/fake.pdf'),
    listfakedocs: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/pdf'],
};

global.my = {
    tt: SecureConfig.tiktokLink,
    gh: SecureConfig.githubRepo,
    gc: SecureConfig.groupInviteLink,
    ch: SecureConfig.groupJid,
};

global.limit = SecureConfig.limit;
global.money = SecureConfig.money;

global.mess = SecureConfig.mess;   // already English

global.APIs = {
    nima: 'https://api.nima.biz.id',
};
global.APIKeys = {
    'https://api.nima.biz.id': SecureConfig.apiKey,
};

global.badWords = SecureConfig.badWords;
global.chatLength = SecureConfig.chatLength;
global.geminiMemorySize = SecureConfig.geminiMemorySize;
global.geminiApiKey = SecureConfig.geminiApiKey;
global.footer = SecureConfig.footer;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});