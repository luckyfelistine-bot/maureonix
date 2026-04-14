/**
 * MAUREONIX - Menu Image Generator v4.0
 * ----------------------------------------
 * KEY RULES (learned the hard way):
 *   - ZERO emoji in ANY <text> element — glib XML parser crashes
 *   - Fox logo uses only SVG shapes (polygon/circle/ellipse/line) — safe
 *   - All text labels are pure ASCII
 *   - Sharp PNG output only (most stable)
 */

'use strict';

const sharp = require('sharp');
const fs    = require('fs');
const path  = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// Colour palette
// ─────────────────────────────────────────────────────────────────────────────
const C = {
    bg:      '#07071a',
    panel:   '#0d0d24',
    card:    '#0a0a1e',
    border:  '#1e1e4a',
    glow:    '#00e5ff',
    violet:  '#7c3aff',
    neon:    '#00ff88',
    gold:    '#ffd700',
    text:    '#c8d8ff',
    muted:   '#4a5580',
    cmd:     '#99ffee',
    white:   '#ffffff',
    scan:    '#ffffff04',
    glass:   '#ffffff07',
    // Fox colours
    fox1:    '#ff8c00',
    fox2:    '#e06000',
    foxEar:  '#ff4d6d',
    foxEye:  '#0a0a1e',
    foxMuz:  '#fff0d0',
};

// Per-category accent colours  (pure hex, no emoji)
const TINT = {
    bot:      '#00e5ff',
    group:    '#00ff88',
    download: '#ffd700',
    ai:       '#cc44ff',
    sticker:  '#ff44aa',
    games:    '#ff8800',
    fun:      '#ffee00',
    search:   '#44aaff',
    movies:   '#ff6688',
    owner:    '#ffd700',
    admin:    '#ff4444',
};

// Category labels — ASCII only
const CAT_LABEL = {
    bot:      'BOT SYSTEM',
    group:    'GROUP',
    download: 'DOWNLOADS',
    ai:       'AI / CHAT',
    sticker:  'STICKER',
    games:    'GAMES',
    fun:      'FUN',
    search:   'SEARCH',
    movies:   'MOVIES & TV',
    owner:    'OWNER',
    admin:    'ADMIN',
};

const CAT_CMDS = {
    bot:      ['alive','ping','speed','runtime','info','owner','vv','jid','github','staff','block','unblock'],
    group:    ['tagall','hidetag','add','kick','ban','unban','promote','demote','warn','votekick','poll','antilink','antispam','antidelete','antibadword','nsfw','anticall','automod','lock'],
    download: ['song','mp3','play','ytmp3','video','mp4','ytmp4'],
    ai:       ['gpt','gemini','llama3','ai','chatai','imagine','flux','sora'],
    sticker:  ['sticker','s','simage','attp','removebg','blur','ss','tts','trt'],
    games:    ['slot','casino','blackjack','math','tictactoe','suit','daily','transfer','buy','gamelist','topgames','searchgame'],
    fun:      ['joke','quote','fact','8ball','ship','simp','hack','compliment','insult','flirt','wasted','jail','triggered'],
    search:   ['google','ytsearch','define','weather','news','lyrics','cinfo'],
    movies:   ['movie','series','topmovies','upcoming','nowplaying','celebrity','movierec','moviequote'],
    owner:    ['shutdown','restart','broadcast','addprem','delprem','setbotname','backup','mode','update'],
    admin:    ['pair','automod','antilink','antispam','antidelete','antibadword','anticall','nsfw','poll','welcome','goodbye','lock','votekick'],
};

// ─────────────────────────────────────────────────────────────────────────────
// SVG helpers — NO emoji, pure ASCII safe
// ─────────────────────────────────────────────────────────────────────────────
function esc(s) {
    // Strips anything outside ASCII printable range too — safety net
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        // Remove any non-ASCII characters that would break glib XML parser
        .replace(/[^\x20-\x7E]/g, '');
}

function scanlines(w, h) {
    let s = '';
    for (let y = 0; y < h; y += 4)
        s += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${C.scan}" stroke-width="1"/>`;
    return s;
}

function hexGrid(w, h, col = '#ffffff06') {
    const sz = 34;
    let s = '';
    for (let row = -1; row < h / (sz * 1.5) + 2; row++) {
        for (let col2 = -1; col2 < w / (sz * 1.732) + 2; col2++) {
            const cx = col2 * sz * 1.732 + (row % 2 ? sz * 0.866 : 0);
            const cy = row * sz * 1.5;
            const pts = [];
            for (let a = 0; a < 6; a++) {
                const ang = (Math.PI / 3) * a - Math.PI / 6;
                pts.push(`${(cx + sz * Math.cos(ang)).toFixed(1)},${(cy + sz * Math.sin(ang)).toFixed(1)}`);
            }
            s += `<polygon points="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="0.4"/>`;
        }
    }
    return s;
}

function corners(x1, y1, x2, y2, sz = 20, col = C.glow, sw = 2) {
    const L = sz;
    return [
        `<line x1="${x1}"   y1="${y1}"   x2="${x1+L}" y2="${y1}"   stroke="${col}" stroke-width="${sw}"/>`,
        `<line x1="${x1}"   y1="${y1}"   x2="${x1}"   y2="${y1+L}" stroke="${col}" stroke-width="${sw}"/>`,
        `<line x1="${x2}"   y1="${y1}"   x2="${x2-L}" y2="${y1}"   stroke="${col}" stroke-width="${sw}"/>`,
        `<line x1="${x2}"   y1="${y1}"   x2="${x2}"   y2="${y1+L}" stroke="${col}" stroke-width="${sw}"/>`,
        `<line x1="${x1}"   y1="${y2}"   x2="${x1+L}" y2="${y2}"   stroke="${col}" stroke-width="${sw}"/>`,
        `<line x1="${x1}"   y1="${y2}"   x2="${x1}"   y2="${y2-L}" stroke="${col}" stroke-width="${sw}"/>`,
        `<line x1="${x2}"   y1="${y2}"   x2="${x2-L}" y2="${y2}"   stroke="${col}" stroke-width="${sw}"/>`,
        `<line x1="${x2}"   y1="${y2}"   x2="${x2}"   y2="${y2-L}" stroke="${col}" stroke-width="${sw}"/>`,
    ].join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// Geometric fox logo — pure SVG shapes, zero text, zero emoji
// ─────────────────────────────────────────────────────────────────────────────
function foxLogo(cx, cy, s = 1) {
    return `
<g id="fox-logo">
  <!-- outer ears -->
  <polygon points="${cx-70*s},${cy-18*s} ${cx-42*s},${cy-68*s} ${cx-10*s},${cy-20*s}" fill="${C.fox2}"/>
  <polygon points="${cx+70*s},${cy-18*s} ${cx+42*s},${cy-68*s} ${cx+10*s},${cy-20*s}" fill="${C.fox2}"/>
  <!-- inner ears -->
  <polygon points="${cx-60*s},${cy-22*s} ${cx-42*s},${cy-56*s} ${cx-16*s},${cy-26*s}" fill="${C.foxEar}" opacity="0.9"/>
  <polygon points="${cx+60*s},${cy-22*s} ${cx+42*s},${cy-56*s} ${cx+16*s},${cy-26*s}" fill="${C.foxEar}" opacity="0.9"/>
  <!-- head circle -->
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
  <line x1="${cx}" y1="${cy+33*s}" x2="${cx-12*s}" y2="${cy+40*s}" stroke="${C.foxEye}" stroke-width="${2*s}" stroke-linecap="round"/>
  <line x1="${cx}" y1="${cy+33*s}" x2="${cx+12*s}" y2="${cy+40*s}" stroke="${C.foxEye}" stroke-width="${2*s}" stroke-linecap="round"/>
  <!-- cheek dots -->
  <circle cx="${cx-40*s}" cy="${cy+20*s}" r="${3*s}" fill="${C.foxEar}" opacity="0.7"/>
  <circle cx="${cx-32*s}" cy="${cy+28*s}" r="${2.5*s}" fill="${C.foxEar}" opacity="0.6"/>
  <circle cx="${cx+40*s}" cy="${cy+20*s}" r="${3*s}" fill="${C.foxEar}" opacity="0.7"/>
  <circle cx="${cx+32*s}" cy="${cy+28*s}" r="${2.5*s}" fill="${C.foxEar}" opacity="0.6"/>
  <!-- glow aura -->
  <circle cx="${cx}" cy="${cy+5*s}" r="${70*s}" fill="${C.fox1}" opacity="0.06"/>
</g>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER BANNER  (1100 x 500)
// ─────────────────────────────────────────────────────────────────────────────
function buildMasterSVG(opts = {}) {
    const {
        prefix    = '.',
        botName   = 'MAUREONIX',
        ownerName = 'Infinite Vybeflix',
        memberName= 'User',
        totalCmds = 200,
        time      = '',
        date      = '',
    } = opts;

    // Sanitise — no emoji
    const safeBotName   = esc(botName.replace(/[^\x20-\x7E]/g, '').trim() || 'MAUREONIX');
    const safeOwner     = esc(ownerName.replace(/[^\x20-\x7E]/g, '').trim() || 'Infinite Vybeflix');
    const safeMember    = esc(memberName.replace(/[^\x20-\x7E]/g, '').trim() || 'User');
    const safePrefix    = esc(prefix);

    const W = 1100, H = 500;
    const TILE_W = 82, TILE_H = 58, COLS = 6, GAP = 8;
    const GRID_X = 316, GRID_Y = 175;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bgG" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#07071a"/>
    <stop offset="100%" stop-color="#0a0820"/>
  </linearGradient>
  <linearGradient id="foxAura" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ff8c00" stop-opacity="0.2"/>
    <stop offset="100%" stop-color="#ff8c00" stop-opacity="0"/>
  </linearGradient>
  <filter id="glo4">
    <feGaussianBlur stdDeviation="4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="glo8">
    <feGaussianBlur stdDeviation="8" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>`;

    // Background
    svg += `<rect width="${W}" height="${H}" fill="url(#bgG)"/>`;
    svg += hexGrid(W, H, '#ffffff05');
    svg += scanlines(W, H);

    // Accent bars
    svg += `<rect x="0" y="0" width="${W}" height="4" fill="${C.glow}"/>`;
    svg += `<rect x="0" y="${H-3}" width="${W}" height="3" fill="${C.violet}"/>`;

    // Left panel
    svg += `<rect x="0" y="0" width="308" height="${H}" fill="${C.glass}"/>`;
    svg += `<line x1="308" y1="16" x2="308" y2="${H-16}" stroke="${C.border}" stroke-width="1"/>`;

    // Fox glow
    svg += `<ellipse cx="154" cy="265" rx="130" ry="130" fill="url(#foxAura)"/>`;

    // Fox logo
    svg += foxLogo(154, 228, 0.70);

    // Bot name — ASCII only
    svg += `<text x="154" y="328" text-anchor="middle" font-family="Courier New,Consolas,monospace" font-size="15" font-weight="700" fill="${C.fox1}" filter="url(#glo4)">${safeBotName}</text>`;
    svg += `<text x="154" y="346" text-anchor="middle" font-family="Courier New,Consolas,monospace" font-size="9" fill="${C.muted}" letter-spacing="3">BY ${safeOwner.toUpperCase()}</text>`;

    // Version badge
    svg += `<rect x="90" y="356" width="128" height="22" rx="11" fill="${C.violet}" opacity="0.2" stroke="${C.violet}" stroke-width="1"/>`;
    svg += `<text x="154" y="371" text-anchor="middle" font-family="Courier New,Consolas,monospace" font-size="9" fill="${C.glow}">QUANTUM v3.0</text>`;

    // Stats
    svg += `<text x="154" y="406" text-anchor="middle" font-family="Courier New,Consolas,monospace" font-size="9" fill="${C.muted}">PREFIX: ${safePrefix}  |  CMDS: ${totalCmds}</text>`;

    // Right panel header
    svg += `<text x="${GRID_X}" y="50" font-family="Courier New,Consolas,monospace" font-size="30" font-weight="700" fill="${C.glow}" filter="url(#glo8)" letter-spacing="2">[ COMMAND MATRIX ]</text>`;
    svg += `<line x1="${GRID_X}" y1="62" x2="${W-28}" y2="62" stroke="${C.border}" stroke-width="1"/>`;

    svg += `<text x="${GRID_X}" y="80" font-family="Courier New,Consolas,monospace" font-size="11" fill="${C.neon}">USER: ${safeMember}</text>`;
    svg += `<text x="${GRID_X+200}" y="80" font-family="Courier New,Consolas,monospace" font-size="11" fill="${C.glow}">PREFIX: ${safePrefix}</text>`;
    svg += `<text x="${GRID_X+380}" y="80" font-family="Courier New,Consolas,monospace" font-size="11" fill="${C.neon}">TOTAL COMMANDS: ${totalCmds}</text>`;
    if (date) svg += `<text x="${GRID_X+620}" y="80" font-family="Courier New,Consolas,monospace" font-size="11" fill="${C.muted}">${esc(date)} ${esc(time)}</text>`;
    svg += `<line x1="${GRID_X}" y1="90" x2="${W-28}" y2="90" stroke="${C.border}" stroke-width="1"/>`;
    svg += `<text x="${GRID_X}" y="107" font-family="Courier New,Consolas,monospace" font-size="10" fill="${C.muted}" letter-spacing="1">SWIPE CATEGORY  >>  TAP BUTTON  >>  EXECUTE</text>`;

    // Category tiles
    const cats = Object.keys(CAT_CMDS);
    cats.forEach((key, i) => {
        const col  = i % COLS;
        const row  = Math.floor(i / COLS);
        const tx   = GRID_X + col * (TILE_W + GAP);
        const ty   = GRID_Y + row * (TILE_H + 10);
        const tint = TINT[key] || C.glow;
        const lbl  = CAT_LABEL[key] || key.toUpperCase();

        svg += `<rect x="${tx}" y="${ty}" width="${TILE_W}" height="${TILE_H}" rx="7" fill="${C.card}" stroke="${tint}" stroke-width="1.2"/>`;
        svg += `<rect x="${tx}" y="${ty}" width="${TILE_W}" height="3" rx="2" fill="${tint}"/>`;

        // Short label — 2 lines if needed, pure ASCII
        const words = lbl.split(' ');
        if (words.length >= 2) {
            svg += `<text x="${tx+TILE_W/2}" y="${ty+22}" text-anchor="middle" font-family="Courier New,monospace" font-size="9" font-weight="700" fill="${tint}">${esc(words[0])}</text>`;
            svg += `<text x="${tx+TILE_W/2}" y="${ty+33}" text-anchor="middle" font-family="Courier New,monospace" font-size="8" fill="${tint}" opacity="0.8">${esc(words.slice(1).join(' '))}</text>`;
        } else {
            svg += `<text x="${tx+TILE_W/2}" y="${ty+28}" text-anchor="middle" font-family="Courier New,monospace" font-size="9" font-weight="700" fill="${tint}">${esc(lbl)}</text>`;
        }
        svg += `<text x="${tx+TILE_W/2}" y="${ty+47}" text-anchor="middle" font-family="Courier New,monospace" font-size="8" fill="${C.muted}">${(CAT_CMDS[key]||[]).length} cmds</text>`;
    });

    // Footer
    svg += `<text x="${GRID_X}" y="${H-14}" font-family="Courier New,monospace" font-size="9" fill="${C.muted}">${safeBotName} by ${safeOwner} | 2026 | Type ${safePrefix}help</text>`;

    svg += corners(8, 8, W-8, H-8, 22, C.glow);
    svg += `</svg>`;
    return svg;
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY CARD  (1000 x 540)
// ─────────────────────────────────────────────────────────────────────────────
function buildCatCardSVG(catKey, opts = {}) {
    const {
        prefix    = '.',
        botName   = 'MAUREONIX',
        ownerName = 'Infinite Vybeflix',
        memberName= 'User',
        time      = '',
        date      = '',
    } = opts;

    const safePrefix = esc(prefix);
    const safeMember = esc(memberName.replace(/[^\x20-\x7E]/g, '').trim() || 'User');
    const safeBotName= esc(botName.replace(/[^\x20-\x7E]/g, '').trim() || 'MAUREONIX');
    const safeOwner  = esc(ownerName.replace(/[^\x20-\x7E]/g, '').trim() || 'Infinite Vybeflix');

    const cat  = CAT_CMDS[catKey] || CAT_CMDS.bot;
    const lbl  = CAT_LABEL[catKey] || catKey.toUpperCase();
    const tint = TINT[catKey] || C.glow;

    const W = 1000, H = 540, HDR = 125, CMD_H = 30, COL_W = 430;
    const half = Math.ceil(cat.length / 2);
    const col1 = cat.slice(0, half);
    const col2 = cat.slice(half);

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#07071a"/>
    <stop offset="100%" stop-color="#0c0020"/>
  </linearGradient>
  <filter id="g3">
    <feGaussianBlur stdDeviation="3" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>`;

    svg += `<rect width="${W}" height="${H}" fill="url(#bg2)"/>`;
    svg += hexGrid(W, H, '#ffffff04');
    svg += scanlines(W, H);

    // Top bar
    svg += `<rect x="0" y="0" width="${W}" height="5" fill="${tint}"/>`;
    svg += `<rect x="0" y="5" width="${W}" height="2" fill="${tint}" opacity="0.3"/>`;

    // Header area
    svg += `<rect x="0" y="0" width="${W}" height="${HDR}" fill="${C.glass}"/>`;
    svg += `<line x1="0" y1="${HDR}" x2="${W}" y2="${HDR}" stroke="${tint}" stroke-width="1" opacity="0.4"/>`;

    // Small fox left
    svg += foxLogo(68, 58, 0.38);

    // Title — ASCII only
    svg += `<text x="144" y="42" font-family="Courier New,Consolas,monospace" font-size="26" font-weight="700" fill="${tint}" filter="url(#g3)">${esc(lbl)}</text>`;
    svg += `<text x="144" y="62" font-family="Courier New,Consolas,monospace" font-size="10" fill="${C.muted}" letter-spacing="2">${safeBotName} | ${esc(date)} ${esc(time)}</text>`;
    svg += `<text x="144" y="80" font-family="Courier New,Consolas,monospace" font-size="10" fill="${C.neon}">USER: ${safeMember}  |  PREFIX: ${safePrefix}  |  ${cat.length} COMMANDS</text>`;
    svg += `<text x="144" y="98" font-family="Courier New,Consolas,monospace" font-size="9.5" fill="${C.muted}">Tap any command below to execute instantly</text>`;

    // Command columns
    const renderCol = (cmds, startX) => {
        let s = '';
        cmds.forEach((cmd, i) => {
            const cy = HDR + 22 + i * CMD_H;
            if (i % 2 === 0) s += `<rect x="${startX-4}" y="${cy-16}" width="${COL_W}" height="${CMD_H}" fill="${C.glass}" rx="4"/>`;
            s += `<text x="${startX+4}" y="${cy}" font-family="Courier New,monospace" font-size="12" fill="${tint}" opacity="0.7">&gt;</text>`;
            s += `<text x="${startX+20}" y="${cy}" font-family="Courier New,Consolas,monospace" font-size="13" fill="${C.cmd}">${esc(safePrefix)}${esc(cmd)}</text>`;
        });
        return s;
    };
    svg += renderCol(col1, 30);
    svg += renderCol(col2, 30 + COL_W + 28);

    // Footer
    svg += `<rect x="0" y="${H-34}" width="${W}" height="34" fill="${C.glass}"/>`;
    svg += `<rect x="0" y="${H-34}" width="${W}" height="1" fill="${tint}" opacity="0.35"/>`;
    svg += `<text x="${W/2}" y="${H-13}" text-anchor="middle" font-family="Courier New,monospace" font-size="10" fill="${C.muted}">${safeBotName} by ${safeOwner} | 2026</text>`;

    svg += corners(8, 8, W-8, H-8, 16, tint);
    svg += `</svg>`;
    return svg;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────
async function svgToPng(svgStr) {
    const buf = Buffer.from(svgStr, 'utf8');
    return sharp(buf)
        .png({ quality: 92, compressionLevel: 7 })
        .toBuffer();
}

async function generateMenuImage(opts = {}) {
    return svgToPng(buildMasterSVG(opts));
}

async function generateCategoryCard(catKey, opts = {}) {
    return svgToPng(buildCatCardSVG(catKey, opts));
}

/**
 * Pre-generate and save all category card images + master banner.
 * Call once at bot startup.
 */
async function generateAllCards(opts = {}, outDir = './src/media/menu') {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const jobs = [
        ...Object.keys(CAT_CMDS).map(key => ({
            key, file: path.join(outDir, `menu_${key}.png`),
            fn: () => generateCategoryCard(key, opts),
        })),
        { key: 'main', file: path.join(outDir, 'menu_main.png'), fn: () => generateMenuImage(opts) },
    ];
    let ok = 0, fail = 0;
    for (const job of jobs) {
        try {
            fs.writeFileSync(job.file, await job.fn());
            console.log(`[MenuImg] OK  ${job.file}`);
            ok++;
        } catch (e) {
            console.error(`[MenuImg] FAIL ${job.key}: ${e.message}`);
            fail++;
        }
    }
    console.log(`[MenuImg] Done: ${ok} generated, ${fail} failed`);
}

module.exports = { generateMenuImage, generateCategoryCard, generateAllCards, CAT_CMDS, TINT, CAT_LABEL };
