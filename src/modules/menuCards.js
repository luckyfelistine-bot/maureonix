const fs = require('fs');
const path = require('path');
const { MENU_CARDS_DIR } = require('../config/constants');

async function generateMenuCards(botInfo = {}) {
  try {
    const sharp = require('sharp');
    const moment = require('moment-timezone');
    const now = moment.tz('Africa/Nairobi');
    const timeStr = now.format('HH:mm');
    const dateStr = now.format('DD/MM/YYYY');

    // FIXED: ../../config reaches your ROOT config folder (not src/config/)
    const SecureConfig = require('../../config');
    const botName   = botInfo.botName   || global.botname   || SecureConfig.botName   || 'Maureonix';
    const ownerName = botInfo.ownerName || global.ownerName || SecureConfig.ownerName || 'Infinite Vybeflix';
    const botNumber = botInfo.botNumber || global.number_bot || SecureConfig.number_bot || '254116903500';
    const ownerNum  = botInfo.ownerNum  || (SecureConfig.ownerNumber?.[0] || '254116903500');
    const prefix    = botInfo.prefix    || (global.listprefix?.[0] || '.');

    const CATS = [
      { id:'bot',      title:'BOT',       sub:'Bot Commands',           color:'#e67e22', cmds:['.alive','.ping','.speed','.runtime','.info','.owner','.vv','.jid','.github','.groupinfo','.staff','.profile','.leaderboard','.totalpesan','.sc','.donasi'] },
      { id:'group',    title:'GROUP',     sub:'Group Commands',          color:'#b85c1a', cmds:['.add','.kick','.promote','.demote','.warn','.unwarn','.tagall','.hidetag','.totag','.setname','.setdesc','.setppgc','.linkgroup','.revoke','.delete','.pin','.unpin','.mute','.unmute'] },
      { id:'download', title:'DOWNLOAD',  sub:'Download Commands',       color:'#2ecc71', cmds:['.song','.mp3','.play','.video','.mp4','.tiktok','.instagram','.facebook','.twitter','.spotify','.pinterest','.reddit','.soundcloud','.threads','.capcut','.likee','.snapchat','.vimeo','.dailymotion','.mediafire','.gdrive','.apk'] },
      { id:'ai',       title:'AI',        sub:'Artificial Intelligence', color:'#3498db', cmds:['.gpt','.gemini','.llama','.deepseek','.ai','.imagine','.translate','.tts','.summarize','.code','.brainrot','.roastai','.rizz','.clearmemory','.aibalance','.docs','.ask'] },
      { id:'sticker',  title:'STICKER',   sub:'Sticker & Image',         color:'#9b59b6', cmds:['.sticker','.s','.simage','.toimg','.attp','.removebg','.blur','.qc','.brat','.smeme','.vv','.namecard','.jail','.triggered'] },
      { id:'fun',      title:'FUN',       sub:'Fun & Entertainment',     color:'#f1c40f', cmds:['.joke','.meme','.quote','.fact','.8ball','.roast','.compliment','.ship','.truth','.dare','.wyr','.flip','.roll','.neko','.waifu','.hug','.kiss','.pat','.cry','.slap'] },
      { id:'games',    title:'GAMES',     sub:'Games Commands',          color:'#e74c3c', cmds:['.connect4','.suit','.slot','.blackjack','.rpg','.math','.anagram','.guessnum','.trivia','.pokemon','.numbers','.hangman','.wordle','.snake','.tictactoe'] },
      { id:'search',   title:'SEARCH',    sub:'Search Commands',         color:'#1abc9c', cmds:['.google','.wiki','.urban','.weather','.news','.covid','.crypto','.forex','.iplookup','.whois','.dns','.qr','.shorten','.anime','.manga','.github','.npm'] },
      { id:'privacy',  title:'PRIVACY',   sub:'Privacy & Auto Toggles',  color:'#95a5a6', cmds:['.autodownload','.autoviewstatus','.autolikestatus','.autoreactmention','.autoreplymention','.autoforward','.autosticker','.autotranslate','.autodelete','.autoreact','.autoblock','.autokick','.automute','.autowelcome','.autogoodbye','.autoai','.selfchat','.privatemode','.setawaymsg','.awaymsg','.pending','.pendingclear','.automation'] },
      { id:'economy',  title:'ECONOMY',   sub:'Economy & Banking',       color:'#f39c12', cmds:['.daily','.work','.rob','.balance','.deposit','.withdraw','.transfer','.buy','.inventory','.lb','.leaderboard'] },
      { id:'sports',   title:'SPORTS',    sub:'Sports & Live Scores',    color:'#27ae60', cmds:['.leagues','.fixtures','.live','.standings','.team','.player','.h2h','.predict','.odds','.sports','.espn','.espnnews'] },
      { id:'movies',   title:'MOVIES',    sub:'Movies & TV Shows',       color:'#c0392b', cmds:['.movie','.series','.imdb','.rating','.tv','.episodes','.tvschedule','.anime','.manga','.trendinganime','.topanime','.moviequote'] },
      { id:'casino',   title:'CASINO',    sub:'Casino Games',            color:'#d35400', cmds:['.roulette','.crash','.dice','.coinflip','.rps'] },
      { id:'admin',    title:'ADMIN',     sub:'Admin & Moderation',      color:'#7f8c8d', cmds:['.ban','.unban','.mute','.unmute','.warn','.unwarn','.clear','.delete','.pin','.unpin'] },
      { id:'owner',    title:'OWNER',     sub:'Owner Commands',          color:'#8e44ad', cmds:['.block','.unblock','.join','.leave','.backup','.setppbot','.delppbot','.shutdown','.public','.private','.mode','.listjadibot','.stopuserjadibot','.schedule','.remind','.reminders','.pendingclear'] },
    ];

    function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function hexToBgTint(hex) { const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16); return `rgb(${Math.floor(r*0.08)},${Math.floor(g*0.08)},${Math.floor(b*0.08)})`; }
    function hexToInfoBg(hex) { const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16); return `rgb(${Math.floor(r*0.05)},${Math.floor(g*0.05)},${Math.floor(b*0.05)})`; }
    function hexToLabelColor(hex) { const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16); return `rgb(${Math.floor(r*0.5)},${Math.floor(g*0.5)},${Math.floor(b*0.5)})`; }
    function hexToTextColor(hex) { const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16); return `rgb(${Math.min(255,Math.floor(r*0.8)+140)},${Math.min(255,Math.floor(g*0.8)+140)},${Math.min(255,Math.floor(b*0.8)+140)})`; }

    for (const cat of CATS) {
      const W=620, CMD_H=46, INFO_H=240, TITLE_H=120, half=Math.ceil(cat.cmds.length/2), CMDS_H=half*CMD_H+56, FOOT_H=64, H=TITLE_H+INFO_H+CMDS_H+FOOT_H;
      const bgTint=hexToBgTint(cat.color), infoBg=hexToInfoBg(cat.color), labelCol=hexToLabelColor(cat.color), textCol=hexToTextColor(cat.color);
      let svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'">';
      svg+='<rect width="'+W+'" height="'+H+'" fill="#1a0d00"/>';
      svg+='<rect width="'+W+'" height="'+H+'" fill="'+bgTint+'"/>';
      for(let y=0;y<H;y+=5) svg+='<line x1="0" y1="'+y+'" x2="'+W+'" y2="'+y+'" stroke="'+cat.color+'" stroke-width="0.3" opacity="0.06"/>';
      svg+='<rect x="0" y="0" width="'+W+'" height="'+TITLE_H+'" fill="'+cat.color+'" opacity="0.15"/>';
      svg+='<rect x="0" y="0" width="'+W+'" height="7" fill="'+cat.color+'"/>';
      svg+='<rect x="0" y="7" width="'+W+'" height="3" fill="'+cat.color+'" opacity="0.3"/>';
      const b=18, bs=26;
      [[b,b,1,1],[W-b,b,-1,1],[b,TITLE_H-b,1,-1],[W-b,TITLE_H-b,-1,-1]].forEach(function(p){
        svg+='<line x1="'+p[0]+'" y1="'+p[1]+'" x2="'+(p[0]+p[2]*bs)+'" y2="'+p[1]+'" stroke="'+cat.color+'" stroke-width="3.5" opacity="0.9"/>';
        svg+='<line x1="'+p[0]+'" y1="'+p[1]+'" x2="'+p[0]+'" y2="'+(p[1]+p[3]*bs)+'" stroke="'+cat.color+'" stroke-width="3.5" opacity="0.9"/>';
      });
      svg+='<text x="'+(W/2)+'" y="60" text-anchor="middle" font-family="Courier New,Consolas,monospace" font-size="42" font-weight="700" fill="'+cat.color+'" letter-spacing="8">[ '+esc(cat.title)+' ]</text>';
      svg+='<text x="'+(W/2)+'" y="92" text-anchor="middle" font-family="Courier New,monospace" font-size="17" fill="'+labelCol+'" letter-spacing="3">'+esc(cat.sub.toUpperCase())+'</text>';
      const infoY=TITLE_H;
      svg+='<rect x="0" y="'+infoY+'" width="'+W+'" height="'+INFO_H+'" fill="'+infoBg+'"/>';
      svg+='<line x1="0" y1="'+infoY+'" x2="'+W+'" y2="'+infoY+'" stroke="'+cat.color+'" stroke-width="2"/>';
      const col1=32, col2=W/2+16, lh=36;
      let iy=infoY+34;
      svg+='<text x="'+col1+'" y="'+iy+'" font-family="Courier New,monospace" font-size="13" fill="'+labelCol+'" letter-spacing="3">BOT NAME</text>';
      svg+='<text x="'+col2+'" y="'+iy+'" font-family="Courier New,monospace" font-size="13" fill="'+labelCol+'" letter-spacing="3">OWNER</text>';
      iy+=lh-2;
      svg+='<text x="'+col1+'" y="'+iy+'" font-family="Courier New,monospace" font-size="22" font-weight="700" fill="'+textCol+'">'+esc(botName)+'</text>';
      svg+='<text x="'+col2+'" y="'+iy+'" font-family="Courier New,monospace" font-size="22" font-weight="700" fill="'+textCol+'">'+esc(ownerName)+'</text>';
      iy+=lh+12;
      svg+='<text x="'+col1+'" y="'+iy+'" font-family="Courier New,monospace" font-size="13" fill="'+labelCol+'" letter-spacing="3">BOT NUMBER</text>';
      svg+='<text x="'+col2+'" y="'+iy+'" font-family="Courier New,monospace" font-size="13" fill="'+labelCol+'" letter-spacing="3">OWNER NUMBER</text>';
      iy+=lh-2;
      svg+='<text x="'+col1+'" y="'+iy+'" font-family="Courier New,monospace" font-size="20" fill="'+textCol+'">+'+esc(botNumber)+'</text>';
      svg+='<text x="'+col2+'" y="'+iy+'" font-family="Courier New,monospace" font-size="20" fill="'+textCol+'">+'+esc(ownerNum)+'</text>';
      iy+=lh+12;
      svg+='<text x="'+col1+'" y="'+iy+'" font-family="Courier New,monospace" font-size="13" fill="'+labelCol+'" letter-spacing="3">DATE</text>';
      svg+='<text x="'+col2+'" y="'+iy+'" font-family="Courier New,monospace" font-size="13" fill="'+labelCol+'" letter-spacing="3">TIME</text>';
      iy+=lh-2;
      svg+='<text x="'+col1+'" y="'+iy+'" font-family="Courier New,monospace" font-size="22" fill="'+textCol+'">'+esc(dateStr)+'</text>';
      svg+='<text x="'+col2+'" y="'+iy+'" font-family="Courier New,monospace" font-size="22" fill="'+textCol+'">'+esc(timeStr)+'</text>';
      iy+=lh+8;
      svg+='<text x="'+col1+'" y="'+iy+'" font-family="Courier New,monospace" font-size="13" fill="'+labelCol+'" letter-spacing="3">PREFIX</text>';
      iy+=lh-4;
      svg+='<text x="'+col1+'" y="'+iy+'" font-family="Courier New,monospace" font-size="26" font-weight="700" fill="'+cat.color+'">'+esc(prefix)+'</text>';
      const cmdY=infoY+INFO_H;
      svg+='<line x1="0" y1="'+cmdY+'" x2="'+W+'" y2="'+cmdY+'" stroke="'+cat.color+'" stroke-width="2"/>';
      svg+='<text x="'+(W/2)+'" y="'+(cmdY+26)+'" text-anchor="middle" font-family="Courier New,monospace" font-size="13" fill="'+cat.color+'" letter-spacing="6">COMMAND  LIST</text>';
      svg+='<line x1="32" y1="'+(cmdY+32)+'" x2="'+(W-32)+'" y2="'+(cmdY+32)+'" stroke="'+cat.color+'" stroke-width="0.8" opacity="0.4"/>';
      cat.cmds.forEach(function(cmd,i){
        const isRight=i>=half, row=isRight?i-half:i, cx=isRight?(W/2+16):24, cy=cmdY+48+row*CMD_H;
        if(row%2===0){ const rowX=isRight?W/2:0; svg+='<rect x="'+rowX+'" y="'+(cy-28)+'" width="'+(W/2)+'" height="'+(CMD_H-2)+'" fill="'+cat.color+'" opacity="0.05"/>'; }
        svg+='<text x="'+cx+'" y="'+cy+'" font-family="Courier New,monospace" font-size="18" fill="'+cat.color+'" font-weight="700">&gt;</text>';
        svg+='<text x="'+(cx+22)+'" y="'+cy+'" font-family="Courier New,monospace" font-size="20" fill="'+textCol+'">'+esc(cmd)+'</text>';
      });
      const footY=cmdY+48+half*CMD_H+12;
      svg+='<rect x="0" y="'+footY+'" width="'+W+'" height="'+FOOT_H+'" fill="'+infoBg+'"/>';
      svg+='<line x1="0" y1="'+footY+'" x2="'+W+'" y2="'+footY+'" stroke="'+cat.color+'" stroke-width="3"/>';
      svg+='<line x1="0" y1="'+(footY+1)+'" x2="'+W+'" y2="'+(footY+1)+'" stroke="'+cat.color+'" stroke-width="1" opacity="0.3"/>';
      svg+='<text x="'+(W/2)+'" y="'+(footY+26)+'" text-anchor="middle" font-family="Courier New,monospace" font-size="15" fill="'+labelCol+'">Maureonix  |  Infinite Vybeflix</text>';
      svg+='<text x="'+(W/2)+'" y="'+(footY+48)+'" text-anchor="middle" font-family="Courier New,monospace" font-size="13" fill="'+cat.color+'" letter-spacing="3">[ TAP TO RUN COMMAND ]</text>';
      svg+='<rect x="0" y="'+(footY+FOOT_H-5)+'" width="'+W+'" height="5" fill="'+cat.color+'"/>';
      svg+='</svg>';
      const buf=await sharp(Buffer.from(svg)).jpeg({quality:96}).toBuffer();
      fs.writeFileSync(path.join(MENU_CARDS_DIR, cat.id+'.jpg'), buf);
    }
    console.log('🦊 Maureonix menu cards generated (fallback JPEGs)');
  } catch(e) {
    console.log('⚠️ Menu card generation skipped:', e.message);
  }
}

module.exports = { generateMenuCards };