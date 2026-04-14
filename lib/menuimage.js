'use strict';
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🦊 MAUREONIX — QUANTUM VISUAL ENGINE v4.0                                   ║
 * ║                                                                              ║
 * ║  Generates stunning cyberpunk/futuristic menu images using Sharp/SVG         ║
 * ║  Features: Neon glows, animated elements, particle effects, HUD elements     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const sharp = require('sharp');

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR PALETTE — Cyberpunk Neon Theme
// ═══════════════════════════════════════════════════════════════════════════════
const COLORS = {
    neonBlue: '#00F0FF',
    neonPink: '#FF00A0',
    neonPurple: '#B829DD',
    neonCyan: '#00FFFF',
    darkBg: '#0A0A0F',
    darkerBg: '#050508',
    gridColor: '#1A1A2E',
    textWhite: '#FFFFFF',
    textGray: '#A0A0B0',
    accentGold: '#FFD700',
    matrixGreen: '#00FF41',
    orange: '#FF8C00',
    deepOrange: '#FF5500',
    foxEar: '#FF4D6D',
    foxEye: '#00FFFF',
    glass: 'rgba(255,255,255,0.03)'
};

// Category color mapping
const CATEGORY_COLORS = {
    botmenu: '#00F0FF',
    groupmenu: '#FF00A0',
    downloadmenu: '#00FF41',
    searchmenu: '#FFD700',
    aimenu: '#B829DD',
    stickersmenu: '#FF6B6B',
    gamemenu: '#00FFFF',
    funmenu: '#FF1493',
    moviesmenu: '#E50914',
    adminmenu: '#FF4500',
    ownermenu: '#FFD700'
};

// ═══════════════════════════════════════════════════════════════════════════════
// SVG FILTERS — Glow & Neon Effects
// ═══════════════════════════════════════════════════════════════════════════════
const GLOW_FILTERS = `
    <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feFlood flood-color="#00F0FF" result="color"/>
            <feComposite in="color" in2="blur" operator="in" result="shadow"/>
            <feMerge>
                <feMergeNode in="shadow"/>
                <feMergeNode in="shadow"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0A0A0F"/>
            <stop offset="50%" style="stop-color:#0F0F1A"/>
            <stop offset="100%" style="stop-color:#0A0A0F"/>
        </linearGradient>
        <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#00F0FF"/>
            <stop offset="50%" style="stop-color:#FF00A0"/>
            <stop offset="100%" style="stop-color:#00F0FF"/>
        </linearGradient>
        <linearGradient id="foxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1A0A2E"/>
            <stop offset="50%" style="stop-color:#2D1B4E"/>
            <stop offset="100%" style="stop-color:#1A0A2E"/>
        </linearGradient>
    </defs>
`;

// ═══════════════════════════════════════════════════════════════════════════════
// GEOMETRIC FOX LOGO — Pure SVG (No External Dependencies)
// ═══════════════════════════════════════════════════════════════════════════════
function generateFoxLogo(cx, cy, scale = 1) {
    const s = scale;
    return `
        <!-- Outer glow rings -->
        <circle cx="${cx}" cy="${cy}" r="${95*s}" fill="none" stroke="#00F0FF" stroke-width="2" opacity="0.3" filter="url(#glow)"/>
        <circle cx="${cx}" cy="${cy}" r="${85*s}" fill="none" stroke="#FF00A0" stroke-width="1" opacity="0.5" filter="url(#glow)"/>
        
        <!-- Fox head geometric shape -->
        <path d="M${cx} ${cy-70*s} L${cx+40*s} ${cy-30*s} L${cx+30*s} ${cy+10*s} L${cx} ${cy+30*s} L${cx-30*s} ${cy+10*s} L${cx-40*s} ${cy-30*s} Z" 
              fill="url(#foxGradient)" stroke="#00F0FF" stroke-width="2" filter="url(#glow)"/>
        
        <!-- Ears -->
        <path d="M${cx-40*s} ${cy-30*s} L${cx-60*s} ${cy-60*s} L${cx-20*s} ${cy-40*s} Z" fill="#FF00A0" opacity="0.9"/>
        <path d="M${cx+40*s} ${cy-30*s} L${cx+60*s} ${cy-60*s} L${cx+20*s} ${cy-40*s} Z" fill="#FF00A0" opacity="0.9"/>
        
        <!-- Glowing eyes -->
        <ellipse cx="${cx-15*s}" cy="${cy-15*s}" rx="${8*s}" ry="${12*s}" fill="#00FFFF" filter="url(#strongGlow)"/>
        <ellipse cx="${cx+15*s}" cy="${cy-15*s}" rx="${8*s}" ry="${12*s}" fill="#00FFFF" filter="url(#strongGlow)"/>
        
        <!-- Nose -->
        <polygon points="${cx},${cy+5*s} ${cx-5*s},${cy+15*s} ${cx+5*s},${cy+15*s}" fill="#FFD700"/>
        
        <!-- Circuit patterns -->
        <path d="M${cx-15*s} ${cy-5*s} L${cx} ${cy+5*s} L${cx+15*s} ${cy-5*s}" fill="none" stroke="#00F0FF" stroke-width="1" opacity="0.6"/>
        <line x1="${cx}" y1="${cy+5*s}" x2="${cx}" y2="${cy+25*s}" stroke="#00F0FF" stroke-width="1" opacity="0.6"/>
        
        <!-- Quantum particles -->
        <circle cx="${cx-60*s}" cy="${cy}" r="3" fill="#00F0FF" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="${cx+60*s}" cy="${cy}" r="3" fill="#FF00A0" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" begin="1s"/>
        </circle>
    `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKGROUND GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════
function generateGrid(width, height, density = 40) {
    let grid = '';
    for (let y = 0; y < height; y += density) {
        const opacity = 0.1 + (Math.random() * 0.1);
        grid += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#00F0FF" stroke-width="0.5" opacity="${opacity}"/>`;
    }
    for (let x = 0; x < width; x += density) {
        const opacity = 0.1 + (Math.random() * 0.1);
        grid += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#00F0FF" stroke-width="0.5" opacity="${opacity}"/>`;
    }
    return grid;
}

function generateHexagons(width, height) {
    let hexes = '';
    const hexSize = 30;
    for (let x = 50; x < width; x += hexSize * 3) {
        for (let y = 50; y < height; y += hexSize * 2.6) {
            const opacity = Math.random() * 0.15;
            const points = [
                `${x},${y}`,
                `${x+hexSize},${y}`,
                `${x+hexSize*1.5},${y+hexSize*0.866}`,
                `${x+hexSize},${y+hexSize*1.732}`,
                `${x},${y+hexSize*1.732}`,
                `${x-hexSize*0.5},${y+hexSize*0.866}`
            ].join(' ');
            hexes += `<polygon points="${points}" fill="none" stroke="#B829DD" stroke-width="0.5" opacity="${opacity}"/>`;
        }
    }
    return hexes;
}

function generateParticles(count = 25, width = 1080, height = 1920) {
    let particles = '';
    const colors = ['#00F0FF', '#FF00A0', '#00FFFF', '#B829DD'];
    for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 1 + Math.random() * 3;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const delay = Math.random() * 5;
        const duration = 3 + Math.random() * 2;
        particles += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0;0.6" dur="${duration}s" repeatCount="indefinite" begin="${delay}s"/>
            <animate attributeName="cy" values="${y};${y-50};${y}" dur="${duration+1}s" repeatCount="indefinite" begin="${delay}s"/>
        </circle>`;
    }
    return particles;
}

function generateCornerDecorations(width, height, color1 = '#00F0FF', color2 = '#FF00A0') {
    const size = 40;
    return `
        <path d="M${size} ${size} L${size*3} ${size} L${size*3} ${size+20}" fill="none" stroke="${color1}" stroke-width="2" opacity="0.5"/>
        <path d="M${width-size} ${size} L${width-size*3} ${size} L${width-size*3} ${size+20}" fill="none" stroke="${color2}" stroke-width="2" opacity="0.5"/>
        <path d="M${size} ${height-size} L${size*3} ${height-size} L${size*3} ${height-size-20}" fill="none" stroke="${color2}" stroke-width="2" opacity="0.5"/>
        <path d="M${width-size} ${height-size} L${width-size*3} ${height-size} L${width-size*3} ${height-size-20}" fill="none" stroke="${color1}" stroke-width="2" opacity="0.5"/>
    `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY BADGE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
function generateCategoryBadges(categories, prefix, startY = 450) {
    let badges = '';
    const gapY = 110;
    
    categories.forEach((cat, index) => {
        const y = startY + (index * gapY);
        const isEven = index % 2 === 0;
        const x = isEven ? 80 : 560;
        const accentColor = isEven ? '#00F0FF' : '#FF00A0';
        
        badges += `
            <g transform="translate(${x}, ${y})">
                <!-- Glow container -->
                <rect x="0" y="0" width="440" height="90" rx="12" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.4" filter="url(#glow)"/>
                
                <!-- Main badge -->
                <rect x="0" y="0" width="440" height="90" rx="12" fill="#0D0D15" stroke="${accentColor}" stroke-width="1" opacity="0.95"/>
                
                <!-- Icon circle with glow -->
                <circle cx="45" cy="45" r="28" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.6"/>
                <text x="45" y="55" text-anchor="middle" font-size="28" fill="${accentColor}">${cat.icon}</text>
                
                <!-- Title -->
                <text x="90" y="35" font-family="monospace" font-size="20" font-weight="bold" fill="#FFFFFF" filter="url(#neon)">${cat.title}</text>
                
                <!-- Description -->
                <text x="90" y="58" font-family="monospace" font-size="13" fill="#A0A0B0">${cat.desc}</text>
                
                <!-- Command hint -->
                <text x="90" y="78" font-family="monospace" font-size="11" fill="${accentColor}" opacity="0.9">${prefix}${cat.id}</text>
                
                <!-- Decorative corners -->
                <path d="M420 0 L440 0 L440 20" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.8"/>
                <path d="M0 70 L0 90 L20 90" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.8"/>
            </g>
        `;
    });
    
    return badges;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN MENU IMAGE GENERATOR — 1080x1920 Vertical Format
// ═══════════════════════════════════════════════════════════════════════════════
async function generateMenuImage(options = {}) {
    const {
        prefix = '.',
        botName = '🦊 MAUREONIX',
        ownerName = 'Infinite Vybeflix',
        memberName = 'User',
        totalCmds = 220,
        time = '00:00:00',
        date = '01/01/2024'
    } = options;

    const width = 1080;
    const height = 1920;

    const categories = [
        { icon: '🤖', title: 'BOT SYSTEM', desc: 'Core controls & info', id: 'botmenu' },
        { icon: '👥', title: 'GROUP CONTROL', desc: 'Manage your groups', id: 'groupmenu' },
        { icon: '⬇️', title: 'DOWNLOADS', desc: 'Media & files', id: 'downloadmenu' },
        { icon: '🔍', title: 'SEARCH ENGINE', desc: 'Find anything', id: 'searchmenu' },
        { icon: '🧠', title: 'AI INTELLIGENCE', desc: 'Smart assistants', id: 'aimenu' },
        { icon: '🎨', title: 'STICKER & IMAGE', desc: 'Visual creations', id: 'stickersmenu' },
        { icon: '🎮', title: 'GAMES', desc: 'Play & compete', id: 'gamemenu' },
        { icon: '😂', title: 'FUN & VIBES', desc: 'Entertainment', id: 'funmenu' }
    ];

    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${GLOW_FILTERS}
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bgGradient)"/>
        
        <!-- Grid overlays -->
        ${generateGrid(width, height)}
        ${generateHexagons(width, height)}
        
        <!-- Floating particles -->
        ${generateParticles(30, width, height)}
        
        <!-- Top neon bar -->
        <rect x="0" y="0" width="100%" height="4" fill="url(#headerGradient)"/>
        
        <!-- Fox Logo -->
        ${generateFoxLogo(540, 180, 0.8)}
        
        <!-- Bot Name -->
        <text x="540" y="280" text-anchor="middle" font-family="monospace" font-size="52" font-weight="bold" fill="#FFFFFF" filter="url(#strongGlow)">
            MAUREONIX
        </text>
        <text x="540" y="315" text-anchor="middle" font-family="monospace" font-size="16" fill="#00F0FF" opacity="0.9">
            QUANTUM NEURAL INTERFACE v4.0
        </text>
        
        <!-- Welcome box -->
        <g transform="translate(540, 380)">
            <rect x="-320" y="0" width="640" height="70" rx="15" fill="#0D0D15" stroke="#00F0FF" stroke-width="1" opacity="0.9"/>
            <text x="0" y="30" text-anchor="middle" font-family="monospace" font-size="20" fill="#FFFFFF">
                Welcome, ${memberName}
            </text>
            <text x="0" y="55" text-anchor="middle" font-family="monospace" font-size="14" fill="#A0A0B0">
                ${date} | ${time}
            </text>
        </g>
        
        <!-- Stats bar -->
        <g transform="translate(0, 470)">
            <rect x="80" y="0" width="920" height="55" rx="27" fill="#0D0D15" stroke="#FF00A0" stroke-width="1" opacity="0.7"/>
            <text x="180" y="35" font-family="monospace" font-size="16" fill="#FFFFFF">⚡ ${totalCmds}+ Commands</text>
            <text x="540" y="35" text-anchor="middle" font-family="monospace" font-size="16" fill="#FFFFFF">👑 ${ownerName}</text>
            <text x="820" y="35" font-family="monospace" font-size="16" fill="#FFFFFF">Prefix: ${prefix}</text>
        </g>
        
        <!-- Category badges -->
        ${generateCategoryBadges(categories, prefix, 560)}
        
        <!-- Bottom hint -->
        <g transform="translate(540, 1780)">
            <text x="0" y="0" text-anchor="middle" font-family="monospace" font-size="14" fill="#A0A0B0" opacity="0.7">
                Tap any button below to explore the quantum realm
            </text>
            <path d="M-80 25 L0 45 L80 25" fill="none" stroke="#00F0FF" stroke-width="2" opacity="0.6">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
            </path>
        </g>
        
        <!-- Corner decorations -->
        ${generateCornerDecorations(width, height)}
        
        <!-- Bottom neon bar -->
        <rect x="0" y="${height-4}" width="100%" height="4" fill="url(#headerGradient)"/>
    </svg>`;

    try {
        const buffer = await sharp(Buffer.from(svg))
            .png({ quality: 95, compressionLevel: 3 })
            .toBuffer();
        return buffer;
    } catch (error) {
        console.error('[MenuImage] Error generating menu:', error);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY CARD GENERATOR — Square format for category selection
// ═══════════════════════════════════════════════════════════════════════════════
async function generateCategoryCard(category, options = {}) {
    const {
        prefix = '.',
        botName = '🦊 MAUREONIX',
        ownerName = 'Infinite Vybeflix',
        memberName = 'User'
    } = options;

    const catData = {
        botmenu: { icon: '🤖', title: 'BOT SYSTEM', color: '#00F0FF', desc: 'Core bot controls' },
        groupmenu: { icon: '👥', title: 'GROUP CONTROL', color: '#FF00A0', desc: 'Group management' },
        downloadmenu: { icon: '⬇️', title: 'DOWNLOADS', color: '#00FF41', desc: 'Media downloads' },
        searchmenu: { icon: '🔍', title: 'SEARCH', color: '#FFD700', desc: 'Web search tools' },
        aimenu: { icon: '🧠', title: 'AI INTELLIGENCE', color: '#B829DD', desc: 'AI assistants' },
        stickersmenu: { icon: '🎨', title: 'STICKER & IMAGE', color: '#FF6B6B', desc: 'Visual tools' },
        gamemenu: { icon: '🎮', title: 'GAMES', color: '#00FFFF', desc: 'Play & earn' },
        funmenu: { icon: '😂', title: 'FUN & VIBES', color: '#FF1493', desc: 'Entertainment' },
        moviesmenu: { icon: '🎬', title: 'MOVIES & TV', color: '#E50914', desc: 'Cinema database' },
        adminmenu: { icon: '🛡️', title: 'ADMIN CONTROL', color: '#FF4500', desc: 'Protection tools' },
        ownermenu: { icon: '👑', title: 'OWNER PANEL', color: '#FFD700', desc: 'Owner exclusive' }
    }[category] || { icon: '📦', title: 'CATEGORY', color: '#00F0FF', desc: 'Commands' };

    const width = 1080;
    const height = 1080;

    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${GLOW_FILTERS}
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bgGradient)"/>
        <rect width="100%" height="100%" fill="url(#glowRadial)" opacity="0.3"/>
        
        <!-- Grid -->
        ${generateGrid(width, height, 50)}
        
        <!-- Central icon with rotating ring -->
        <g transform="translate(540, 350)">
            <circle cx="0" cy="0" r="160" fill="none" stroke="${catData.color}" stroke-width="3" opacity="0.3" filter="url(#glow)"/>
            <circle cx="0" cy="0" r="130" fill="none" stroke="${catData.color}" stroke-width="2" opacity="0.5"/>
            <text x="0" y="50" text-anchor="middle" font-size="140" fill="${catData.color}" filter="url(#glow)">${catData.icon}</text>
            
            <!-- Rotating dashed ring -->
            <circle cx="0" cy="0" r="180" fill="none" stroke="${catData.color}" stroke-width="2" stroke-dasharray="25,15" opacity="0.4">
                <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="15s" repeatCount="indefinite"/>
            </circle>
        </g>
        
        <!-- Title -->
        <text x="540" y="600" text-anchor="middle" font-family="monospace" font-size="48" font-weight="bold" fill="#FFFFFF" filter="url(#glow)">
            ${catData.title}
        </text>
        
        <!-- Description -->
        <text x="540" y="660" text-anchor="middle" font-family="monospace" font-size="22" fill="#A0A0B0">
            ${catData.desc}
        </text>
        
        <!-- Command box -->
        <g transform="translate(540, 780)">
            <rect x="-350" y="0" width="700" height="180" rx="20" fill="#0D0D15" stroke="${catData.color}" stroke-width="2" opacity="0.9"/>
            <text x="0" y="50" text-anchor="middle" font-family="monospace" font-size="20" fill="${catData.color}">
                AVAILABLE COMMANDS
            </text>
            <text x="0" y="90" text-anchor="middle" font-family="monospace" font-size="18" fill="#FFFFFF" opacity="0.9">
                Use ${prefix}${category} to see all
            </text>
            <text x="0" y="130" text-anchor="middle" font-family="monospace" font-size="16" fill="#A0A0B0">
                Tap buttons below to execute instantly
            </text>
        </g>
        
        <!-- Corner accents -->
        <path d="M40 40 L140 40 L140 70" fill="none" stroke="${catData.color}" stroke-width="3" opacity="0.6"/>
        <path d="M1040 40 L940 40 L940 70" fill="none" stroke="${catData.color}" stroke-width="3" opacity="0.6"/>
        <path d="M40 1040 L140 1040 L140 1010" fill="none" stroke="${catData.color}" stroke-width="3" opacity="0.6"/>
        <path d="M1040 1040 L940 1040 L940 1010" fill="none" stroke="${catData.color}" stroke-width="3" opacity="0.6"/>
        
        <!-- Footer -->
        <text x="540" y="1060" text-anchor="middle" font-family="monospace" font-size="16" fill="#A0A0B0" opacity="0.7">
            🦊 MAUREONIX • ${ownerName}
        </text>
    </svg>`;

    try {
        const buffer = await sharp(Buffer.from(svg))
            .png({ quality: 95 })
            .toBuffer();
        return buffer;
    } catch (error) {
        console.error('[MenuImage] Error generating category card:', error);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FULL MENU POSTER — Complete command reference (tall format)
// ═══════════════════════════════════════════════════════════════════════════════
async function generateFullMenuPoster(options = {}) {
    const {
        prefix = '.',
        botName = '🦊 MAUREONIX',
        ownerName = 'Infinite Vybeflix',
        totalCmds = 220
    } = options;

    const allCategories = [
        { icon: '🤖', title: 'BOT SYSTEM', color: '#00F0FF', cmds: ['alive', 'ping', 'speed', 'runtime', 'info', 'owner', 'vv', 'jid', 'github', 'staff', 'groupinfo', 'privacy', 'help'] },
        { icon: '👥', title: 'GROUP CONTROL', color: '#FF00A0', cmds: ['tagall', 'hidetag', 'add', 'kick', 'ban', 'promote', 'demote', 'warn', 'votekick', 'poll', 'setname', 'setdesc', 'linkgroup', 'welcome', 'lock'] },
        { icon: '⬇️', title: 'DOWNLOADS', color: '#00FF41', cmds: ['song', 'mp3', 'play', 'ytmp3', 'video', 'mp4', 'ytmp4', 'apk'] },
        { icon: '🔍', title: 'SEARCH', color: '#FFD700', cmds: ['define', 'weather', 'news', 'lyrics', 'cinfo'] },
        { icon: '🧠', title: 'AI', color: '#B829DD', cmds: ['gpt', 'gemini', 'llama3', 'ai', 'imagine', 'flux', 'sora'] },
        { icon: '🎨', title: 'STICKER', color: '#FF6B6B', cmds: ['sticker', 's', 'toimg', 'attp', 'removebg', 'blur', 'ss', 'tts', 'trt'] },
        { icon: '🎮', title: 'GAMES', color: '#00FFFF', cmds: ['slot', 'casino', 'blackjack', 'math', 'tictactoe', 'chess', 'gamelist', 'topgames'] },
        { icon: '😂', title: 'FUN', color: '#FF1493', cmds: ['joke', 'quote', '8ball', 'ship', 'hack', 'wasted', 'triggered', 'tweet', 'ytcomment'] },
        { icon: '🎬', title: 'MOVIES', color: '#E50914', cmds: ['movie', 'tv', 'trailer', 'topmovies', 'upcoming', 'celebrity'] },
        { icon: '🛡️', title: 'ADMIN', color: '#FF4500', cmds: ['automod', 'antilink', 'antidelete', 'antispam', 'lock', 'votekick', 'pair'] },
        { icon: '👑', title: 'OWNER', color: '#FFD700', cmds: ['broadcast', 'mode', 'update', 'backup', 'adminonly', 'ban', 'unban'] }
    ];

    let categoriesSvg = '';
    let yPos = 400;

    allCategories.forEach((cat, idx) => {
        // Category header
        categoriesSvg += `
            <g transform="translate(100, ${yPos})">
                <rect x="0" y="0" width="880" height="70" rx="12" fill="#0D0D15" stroke="${cat.color}" stroke-width="2" opacity="0.95"/>
                <text x="30" y="45" font-family="monospace" font-size="32" fill="${cat.color}" filter="url(#glow)">${cat.icon}</text>
                <text x="80" y="45" font-family="monospace" font-size="26" font-weight="bold" fill="#FFFFFF">${cat.title}</text>
                <text x="800" y="45" font-family="monospace" font-size="18" fill="${cat.color}">${cat.cmds.length} cmds</text>
            </g>
        `;

        yPos += 90;

        // Commands in rows of 4
        for (let i = 0; i < cat.cmds.length; i += 4) {
            const row = cat.cmds.slice(i, i + 4);
            let xPos = 100;

            row.forEach(cmd => {
                categoriesSvg += `
                    <g transform="translate(${xPos}, ${yPos})">
                        <rect x="0" y="0" width="200" height="45" rx="8" fill="#1A1A2E" stroke="${cat.color}" stroke-width="0.5" opacity="0.7"/>
                        <text x="100" y="30" text-anchor="middle" font-family="monospace" font-size="14" fill="#FFFFFF">${prefix}${cmd}</text>
                    </g>
                `;
                xPos += 220;
            });

            yPos += 60;
        }

        yPos += 40; // Space between categories
    });

    const height = Math.max(2400, yPos + 200);

    const svg = `<svg width="1080" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${GLOW_FILTERS}
        
        <rect width="100%" height="100%" fill="url(#bgGradient)"/>
        ${generateGrid(1080, height)}
        ${generateParticles(40, 1080, height)}
        
        <!-- Header -->
        <g transform="translate(540, 150)">
            <text x="0" y="0" text-anchor="middle" font-family="monospace" font-size="64" font-weight="bold" fill="#FFFFFF" filter="url(#strongGlow)">
                🦊 MAUREONIX
            </text>
            <text x="0" y="60" text-anchor="middle" font-family="monospace" font-size="28" fill="#00F0FF">
                COMPLETE COMMAND REFERENCE
            </text>
            <text x="0" y="100" text-anchor="middle" font-family="monospace" font-size="20" fill="#A0A0B0">
                ${totalCmds}+ Commands • Prefix: ${prefix} • By ${ownerName}
            </text>
        </g>
        
        <!-- Categories -->
        ${categoriesSvg}
        
        <!-- Footer -->
        <text x="540" y="${height-80}" text-anchor="middle" font-family="monospace" font-size="20" fill="#00F0FF" opacity="0.9">
            ⚡ QUANTUM NEURAL INTERFACE v4.0 ⚡
        </text>
        <text x="540" y="${height-50}" text-anchor="middle" font-family="monospace" font-size="16" fill="#A0A0B0" opacity="0.7">
            Save this image for quick reference
        </text>
    </svg>`;

    try {
        const buffer = await sharp(Buffer.from(svg))
            .png({ quality: 95 })
            .toBuffer();
        return buffer;
    } catch (error) {
        console.error('[MenuImage] Error generating poster:', error);
        throw error;
    }
}

module.exports = {
    generateMenuImage,
    generateCategoryCard,
    generateFullMenuPoster,
    COLORS,
    CATEGORY_COLORS
};