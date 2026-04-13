'use strict';
/**
 * ╔══════════════════════════════════════════════════╗
 * ║  🦊 MAUREONIX — MENU IMAGE ENGINE v3.0          ║
 * ║  Geometric Fox Logo · Holographic Neon Grid      ║
 * ║  Sharp SVG renderer — no external font deps      ║
 * ╚══════════════════════════════════════════════════╝
 *
 * EXPORTS
 *   generateMenuImage(opts)           → Buffer  (master banner .allmenu)
 *   generateCategoryCard(key, opts)   → Buffer  (single category card)
 *   generateAllCards(opts, outDir)    → saves PNGs to disk (call at startup)
 *   CAT                               → command catalogue object
 */

const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

// ── SVG escape ───────────────────────────────────────────────────────────────
const esc = s => String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// ── Colour palette ─────────────────────────────────────────────────────────
const C = {
    bg:'#06060f', card:'#0a0a18', border:'#1a1a3e',
    glow:'#00f0ff', violet:'#7b2fff', neon:'#00ff88',
    gold:'#ffd700', warn:'#ff4488', text:'#c8d8ff',
    muted:'#556688', cmd:'#aaffee', white:'#ffffff',
    scan:'#ffffff03', glass:'#ffffff06',
    // fox colours
    fox1:'#FF8C00', fox2:'#FF5500', foxEar:'#FF4D6D',
    foxEye:'#1A1A2E', foxMuz:'#FFF3E0',
};

// ── Per-category accent tints ─────────────────────────────────────────────
const TINTS = {
    bot:'#00f0ff',    group:'#00ff88',  download:'#ffd700',
    ai:'#cc44ff',     sticker:'#ff44aa', games:'#ff8800',
    fun:'#ffee00',    search:'#44aaff',  owner:'#ffd700',
    admin:'#ff4444',  movies:'#ff6688',
};

// ── Command catalogue ─────────────────────────────────────────────────────
const CAT = {
    bot:      { icon:'🤖', title:'BOT SYSTEM',     cmds:['alive','ping','speed','runtime','info','owner','vv','jid','github','staff','groupinfo','block','unblock','listblock','privacy','help'] },
    group:    { icon:'👥', title:'GROUP CONTROL',   cmds:['tagall','hidetag','totag','add','kick','ban','unban','promote','demote','warn','unwarn','votekick','poll','setname','setdesc','linkgroup','revoke','setwelcome','setleave','welcome','goodbye'] },
    download: { icon:'⬇️', title:'DOWNLOADS',       cmds:['song','mp3','play','ytmp3','video','mp4','ytmp4'] },
    ai:       { icon:'🧠', title:'AI INTELLIGENCE', cmds:['gpt','gemini','llama3','ai','chatai','imagine','flux','sora'] },
    sticker:  { icon:'🎨', title:'STICKER & IMAGE', cmds:['sticker','s','simage','toimg','attp','removebg','blur','ss','tts','trt'] },
    games:    { icon:'🎮', title:'GAMES ZONE',      cmds:['slot','casino','blackjack','math','tictactoe','suit','chess','akinator','snakeladder','daily','transfer','buy','gamelist','topgames','searchgame','randomgame'] },
    fun:      { icon:'😂', title:'FUN & VIBES',     cmds:['joke','quote','fact','8ball','ship','simp','hack','compliment','insult','flirt','wasted','jail','triggered','shayari','character','tweet','ytcomment','oogway','namecard'] },
    search:   { icon:'🔍', title:'SEARCH ENGINE',   cmds:['google','ytsearch','define','weather','news','lyrics','cinfo','apk'] },
    movies:   { icon:'🎬', title:'MOVIES & TV',     cmds:['movie','tv','trailer','topmovies','upcoming','nowplaying','celebrity','moviequote'] },
    owner:    { icon:'👑', title:'OWNER PANEL',     cmds:['shutdown','restart','broadcast','addprem','delprem','addowner','delowner','setbotname','backup','mode','restrictgroup','allowgroup','allowuser','update','adminonly'] },
    admin:    { icon:'🛡️', title:'ADMIN CONTROL',  cmds:['pair','automod','antilink','antispam','antidelete','antibadword','anticall','antiviewonce','nsfw','antitoxic','antivirtex','poll','welcome','goodbye','lock','unlock','votekick','protections'] },
};

// ── SVG helpers ───────────────────────────────────────────────────────────
function scanlines(w,h){
    let s='';
    for(let y=0;y<h;y+=4) s+=`<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${C.scan}" stroke-width="1"/>`;
    return s;
}
function hexGrid(w,h,col='#ffffff05'){
    const sz=32; let s='';
    for(let row=-1;row<h/(sz*1.5)+2;row++){
        for(let col2=-1;col2<w/(sz*Math.sqrt(3))+2;col2++){
            const cx=col2*sz*Math.sqrt(3)+(row%2?sz*Math.sqrt(3)/2:0), cy=row*sz*1.5, pts=[];
            for(let a=0;a<6;a++){const ang=Math.PI/180*(60*a-30);pts.push(`${cx+sz*Math.cos(ang)},${cy+sz*Math.sin(ang)}`);}
            s+=`<polygon points="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="0.4" opacity="0.5"/>`;
        }
    }
    return s;
}
function corners(x1,y1,x2,y2,sz=20,col=C.glow,sw=2){
    const L=sz;
    return [`<line x1="${x1}" y1="${y1}" x2="${x1+L}" y2="${y1}" stroke="${col}" stroke-width="${sw}"/>`,
            `<line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y1+L}" stroke="${col}" stroke-width="${sw}"/>`,
            `<line x1="${x2}" y1="${y1}" x2="${x2-L}" y2="${y1}" stroke="${col}" stroke-width="${sw}"/>`,
            `<line x1="${x2}" y1="${y1}" x2="${x2}" y2="${y1+L}" stroke="${col}" stroke-width="${sw}"/>`,
            `<line x1="${x1}" y1="${y2}" x2="${x1+L}" y2="${y2}" stroke="${col}" stroke-width="${sw}"/>`,
            `<line x1="${x1}" y1="${y2}" x2="${x1}" y2="${y2-L}" stroke="${col}" stroke-width="${sw}"/>`,
            `<line x1="${x2}" y1="${y2}" x2="${x2-L}" y2="${y2}" stroke="${col}" stroke-width="${sw}"/>`,
            `<line x1="${x2}" y1="${y2}" x2="${x2}" y2="${y2-L}" stroke="${col}" stroke-width="${sw}"/>`].join('');
}

// ── Geometric Fox Logo (pure SVG — no external fonts needed) ────────────
function foxLogo(cx, cy, s=1){
    return `
<!-- outer ears -->
<polygon points="${cx-70*s},${cy-18*s} ${cx-42*s},${cy-68*s} ${cx-10*s},${cy-20*s}" fill="${C.fox2}"/>
<polygon points="${cx+70*s},${cy-18*s} ${cx+42*s},${cy-68*s} ${cx+10*s},${cy-20*s}" fill="${C.fox2}"/>
<!-- inner ears -->
<polygon points="${cx-60*s},${cy-22*s} ${cx-42*s},${cy-56*s} ${cx-16*s},${cy-26*s}" fill="${C.foxEar}" opacity="0.9"/>
<polygon points="${cx+60*s},${cy-22*s} ${cx+42*s},${cy-56*s} ${cx+16*s},${cy-26*s}" fill="${C.foxEar}" opacity="0.9"/>
<!-- head -->
<circle cx="${cx}" cy="${cy+5*s}" r="${62*s}" fill="${C.fox1}"/>
<!-- muzzle -->
<ellipse cx="${cx}" cy="${cy+36*s}" rx="${34*s}" ry="${26*s}" fill="${C.foxMuz}"/>
<!-- eyes -->
<ellipse cx="${cx-22*s}" cy="${cy-2*s}" rx="${11*s}" ry="${13*s}" fill="${C.foxEye}"/>
<ellipse cx="${cx+22*s}" cy="${cy-2*s}" rx="${11*s}" ry="${13*s}" fill="${C.foxEye}"/>
<!-- eye shine -->
<circle cx="${cx-18*s}" cy="${cy-6*s}" r="${4*s}" fill="white" opacity="0.9"/>
<circle cx="${cx+26*s}" cy="${cy-6*s}" r="${4*s}" fill="white" opacity="0.9"/>
<!-- nose -->
<ellipse cx="${cx}" cy="${cy+28*s}" rx="${7*s}" ry="${5*s}" fill="${C.foxEye}"/>
<!-- mouth -->
<line x1="${cx}" y1="${cy+33*s}" x2="${cx-12*s}" y2="${cy+40*s}" stroke="${C.foxEye}" stroke-width="${1.5*s}" stroke-linecap="round"/>
<line x1="${cx}" y1="${cy+33*s}" x2="${cx+12*s}" y2="${cy+40*s}" stroke="${C.foxEye}" stroke-width="${1.5*s}" stroke-linecap="round"/>
<!-- cheek dots -->
<circle cx="${cx-40*s}" cy="${cy+20*s}" r="${3*s}" fill="${C.foxEar}" opacity="0.7"/>
<circle cx="${cx-32*s}" cy="${cy+28*s}" r="${2.5*s}" fill="${C.foxEar}" opacity="0.6"/>
<circle cx="${cx+40*s}" cy="${cy+20*s}" r="${3*s}" fill="${C.foxEar}" opacity="0.7"/>
<circle cx="${cx+32*s}" cy="${cy+28*s}" r="${2.5*s}" fill="${C.foxEar}" opacity="0.6"/>`;
}

// ── MASTER BANNER (1100 × 500) ─────────────────────────────────────────
function buildMasterSVG(opts={}){
    const { prefix='.', botName='🦊 MAUREONIX', ownerName='Infinite Vybeflix',
            memberName='User', totalCmds=220, time='', date='' } = opts;
    const W=1100, H=500;
    const TW=80, TH=54, COLS=6, GAP=8;
    const GX=316, GY=175;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#06060f"/><stop offset="100%" stop-color="#090918"/>
  </linearGradient>
  <linearGradient id="foxAura" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FF8C00" stop-opacity="0.28"/>
    <stop offset="100%" stop-color="#FF8C00" stop-opacity="0"/>
  </linearGradient>
  <filter id="g4"><feGaussianBlur stdDeviation="4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="g8"><feGaussianBlur stdDeviation="8" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;

    svg += `<rect width="${W}" height="${H}" fill="url(#bg)"/>`;
    svg += hexGrid(W,H,'#ffffff04');
    svg += scanlines(W,H);
    svg += `<rect x="0" y="0" width="${W}" height="4" fill="${C.glow}"/>`;
    svg += `<rect x="0" y="${H-3}" width="${W}" height="3" fill="${C.violet}"/>`;

    // Left panel
    svg += `<rect x="0" y="0" width="306" height="${H}" fill="${C.glass}"/>`;
    svg += `<line x1="306" y1="20" x2="306" y2="${H-20}" stroke="${C.border}" stroke-width="1"/>`;

    // Fox aura glow
    svg += `<ellipse cx="153" cy="265" rx="128" ry="128" fill="url(#foxAura)"/>`;

    // Fox logo
    svg += foxLogo(153, 228, 0.70);

    // Bot name
    svg += `<text x="153" y="328" text-anchor="middle" font-family="'Courier New',Consolas,monospace" font-size="14" font-weight="700" fill="${C.fox1}" filter="url(#g4)">${esc(botName)}</text>`;
    svg += `<text x="153" y="346" text-anchor="middle" font-family="'Courier New',monospace" font-size="8" fill="${C.muted}" letter-spacing="3">BY ${esc(ownerName.toUpperCase())}</text>`;

    // Version badge
    svg += `<rect x="93" y="356" width="120" height="20" rx="10" fill="${C.violet}" opacity="0.22" stroke="${C.violet}" stroke-width="1"/>`;
    svg += `<text x="153" y="370" text-anchor="middle" font-family="'Courier New',monospace" font-size="9" fill="${C.glow}">⚡ QUANTUM v3.0 ⚡</text>`;
    svg += `<text x="153" y="400" text-anchor="middle" font-family="'Courier New',monospace" font-size="9" fill="${C.muted}">PREFIX: ${esc(prefix)}  ·  CMDS: ${totalCmds}</text>`;

    // Right — header
    svg += `<text x="${GX}" y="50" font-family="'Courier New',monospace" font-size="28" font-weight="700" fill="${C.glow}" filter="url(#g8)" letter-spacing="2">[ COMMAND MATRIX ]</text>`;
    svg += `<line x1="${GX}" y1="60" x2="${W-28}" y2="60" stroke="${C.border}" stroke-width="1"/>`;
    svg += `<text x="${GX}" y="78" font-family="'Courier New',monospace" font-size="11" fill="${C.neon}">USER: ${esc(memberName)}</text>`;
    svg += `<text x="${GX+210}" y="78" font-family="'Courier New',monospace" font-size="11" fill="${C.glow}">PREFIX: ${esc(prefix)}</text>`;
    svg += `<text x="${GX+390}" y="78" font-family="'Courier New',monospace" font-size="11" fill="${C.neon}">TOTAL: ${totalCmds} cmds</text>`;
    if(date) svg += `<text x="${GX+580}" y="78" font-family="'Courier New',monospace" font-size="10" fill="${C.muted}">${esc(date)} ${esc(time)}</text>`;
    svg += `<line x1="${GX}" y1="86" x2="${W-28}" y2="86" stroke="${C.border}" stroke-width="1"/>`;
    svg += `<text x="${GX}" y="104" font-family="'Courier New',monospace" font-size="10" fill="${C.muted}" letter-spacing="1">▸ SELECT A CATEGORY BELOW — TAP BUTTON TO OPEN COMMANDS</text>`;

    // Category tiles
    Object.entries(CAT).forEach(([key,cat],i)=>{
        const col=i%COLS, row=Math.floor(i/COLS);
        const tx=GX+col*(TW+GAP), ty=GY+row*(TH+10);
        const tint=TINTS[key]||C.glow;
        svg += `<rect x="${tx}" y="${ty}" width="${TW}" height="${TH}" rx="7" fill="${C.card}" stroke="${tint}" stroke-width="1.2"/>`;
        svg += `<rect x="${tx}" y="${ty}" width="${TW}" height="3" rx="2" fill="${tint}"/>`;
        svg += `<text x="${tx+TW/2}" y="${ty+20}" text-anchor="middle" font-size="13">${esc(cat.icon)}</text>`;
        svg += `<text x="${tx+TW/2}" y="${ty+33}" text-anchor="middle" font-family="'Courier New',monospace" font-size="8" font-weight="700" fill="${tint}">${esc(cat.title.split(' ')[0])}</text>`;
        svg += `<text x="${tx+TW/2}" y="${ty+46}" text-anchor="middle" font-family="'Courier New',monospace" font-size="7.5" fill="${C.muted}">${cat.cmds.length} cmds</text>`;
    });

    svg += `<text x="${GX}" y="${H-14}" font-family="'Courier New',monospace" font-size="9" fill="${C.muted}">🦊 MAUREONIX · ${esc(ownerName)} · 2026 · Type ${esc(prefix)}menu to navigate</text>`;
    svg += corners(8,8,W-8,H-8,22,C.glow);
    svg += '</svg>';
    return svg;
}

// ── Category Card (1000 × 560) ────────────────────────────────────────────
function buildCatCardSVG(catKey, opts={}){
    const { prefix='.', botName='🦊 MAUREONIX', memberName='User',
            time='', date='', ownerName='Infinite Vybeflix' } = opts;
    const cat=CAT[catKey]||CAT.bot, tint=TINTS[catKey]||C.glow;
    const W=1000, H=560, HDR=130, CMD_H=30, COL_W=435;
    const half=Math.ceil(cat.cmds.length/2);
    const col1=cat.cmds.slice(0,half), col2=cat.cmds.slice(half);

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#06060f"/><stop offset="100%" stop-color="#0c0022"/>
  </linearGradient>
  <filter id="g"><feGaussianBlur stdDeviation="3" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;

    svg += `<rect width="${W}" height="${H}" fill="url(#bg)"/>`;
    svg += hexGrid(W,H,'#ffffff04');
    svg += scanlines(W,H);
    svg += `<rect x="0" y="0" width="${W}" height="5" fill="${tint}"/>`;
    svg += `<rect x="0" y="5" width="${W}" height="2" fill="${tint}" opacity="0.3"/>`;
    svg += `<rect x="0" y="0" width="${W}" height="${HDR}" fill="${C.glass}"/>`;
    svg += `<line x1="0" y1="${HDR}" x2="${W}" y2="${HDR}" stroke="${tint}" stroke-width="1" opacity="0.4"/>`;

    // Small fox
    svg += foxLogo(70, 62, 0.42);

    // Title
    svg += `<text x="148" y="44" font-family="'Courier New',monospace" font-size="25" font-weight="700" fill="${tint}" filter="url(#g)">${esc(cat.icon)} ${esc(cat.title)}</text>`;
    svg += `<text x="148" y="63" font-family="'Courier New',monospace" font-size="10" fill="${C.muted}" letter-spacing="2">🦊 MAUREONIX · ${esc(botName)} · ${esc(date)} ${esc(time)}</text>`;
    svg += `<text x="148" y="80" font-family="'Courier New',monospace" font-size="10" fill="${C.neon}">USER: ${esc(memberName)}  ·  PREFIX: ${esc(prefix)}  ·  ${cat.cmds.length} COMMANDS</text>`;
    svg += `<text x="148" y="98" font-family="'Courier New',monospace" font-size="9.5" fill="${C.muted}">▸ Tap any command in the list below to execute instantly ⚡</text>`;

    // Command columns
    const renderCol=(cmds,startX)=>{
        let s='';
        cmds.forEach((cmd,i)=>{
            const cy=HDR+20+i*CMD_H;
            if(i%2===0) s+=`<rect x="${startX-4}" y="${cy-16}" width="${COL_W}" height="${CMD_H}" fill="${C.glass}" rx="4"/>`;
            s+=`<text x="${startX+2}" y="${cy}" font-family="'Courier New',monospace" font-size="12" fill="${tint}" opacity="0.8">▸</text>`;
            s+=`<text x="${startX+18}" y="${cy}" font-family="'Courier New',monospace" font-size="13" fill="${C.cmd}">${esc(prefix)}${esc(cmd)}</text>`;
        });
        return s;
    };
    svg += renderCol(col1, 30);
    svg += renderCol(col2, 30+COL_W+28);

    svg += `<rect x="0" y="${H-36}" width="${W}" height="36" fill="${C.glass}"/>`;
    svg += `<rect x="0" y="${H-36}" width="${W}" height="1" fill="${tint}" opacity="0.4"/>`;
    svg += `<text x="${W/2}" y="${H-14}" text-anchor="middle" font-family="'Courier New',monospace" font-size="10" fill="${C.muted}">🦊 MAUREONIX · ${esc(ownerName)} · 2026 · ${esc(prefix)}help</text>`;
    svg += corners(8,8,W-8,H-8,16,tint);
    svg += '</svg>';
    return svg;
}

// ── Public API ────────────────────────────────────────────────────────────
async function svgToPng(s){
    return sharp(Buffer.from(s)).png({ quality:95, compressionLevel:6 }).toBuffer();
}

async function generateMenuImage(opts={}){
    return svgToPng(buildMasterSVG(opts));
}

async function generateCategoryCard(key, opts={}){
    return svgToPng(buildCatCardSVG(key, opts));
}

/**
 * Save all category cards + master banner to disk at startup.
 * @param {object} opts  - same options as generateMenuImage
 * @param {string} outDir - e.g. './src/media/menu'
 */
async function generateAllCards(opts={}, outDir='./src/media/menu'){
    if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
    const jobs=[
        ...Object.keys(CAT).map(k=>({ k, f:path.join(outDir,`menu_${k}.png`), fn:()=>generateCategoryCard(k,opts) })),
        { k:'main', f:path.join(outDir,'menu_main.png'), fn:()=>generateMenuImage(opts) }
    ];
    for(const j of jobs){
        try{ fs.writeFileSync(j.f, await j.fn()); console.log(`[MenuImg] ✅ ${j.f}`); }
        catch(e){ console.error(`[MenuImg] ❌ ${j.k}: ${e.message}`); }
    }
}

module.exports = { generateMenuImage, generateCategoryCard, generateAllCards, CAT, TINTS };
