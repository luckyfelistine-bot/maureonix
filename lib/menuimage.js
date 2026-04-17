const { createCanvas } = require('canvas');

async function generateQuantumMenu(opts) {
    const width = opts.width || 1080;
    const height = opts.height || 1920;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grd = ctx.createLinearGradient(0, 0, width, height);
    grd.addColorStop(0, '#0a0a1a');
    grd.addColorStop(0.5, '#1a0a2e');
    grd.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    // Grid pattern
    ctx.strokeStyle = 'rgba(0,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke(); }
    for (let i = 0; i < height; i += 40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(width,i); ctx.stroke(); }

    // Title
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 20;
    ctx.fillText(opts.botName || 'MAUREONIX', width/2, 150);
    
    ctx.fillStyle = '#ff00a0';
    ctx.font = '40px sans-serif';
    ctx.shadowColor = '#ff00a0';
    ctx.fillText(opts.subtitle || 'ULTIMATE v5.0', width/2, 210);

    // Stats
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px sans-serif';
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
    const stats = [
        `👤 User: ${opts.user || 'User'}`,
        `⚡ Prefix: ${opts.prefix || '.'}`,
        `📊 Commands: ${opts.totalCmds || '500+'}`,
        `⏰ Time: ${opts.time || new Date().toLocaleTimeString()}`,
        `📅 Date: ${opts.date || new Date().toLocaleDateString()}`,
        `👑 Owner: ${opts.ownerName || 'Infinite Vybeflix'}`
    ];
    stats.forEach((s, i) => ctx.fillText(s, 60, 320 + i * 50));

    // Sections
    if (opts.sections) {
        opts.sections.forEach((sec, i) => {
            const y = 650 + i * 140;
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fillRect(40, y, width-80, 120);
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(40, y, width-80, 120);
            ctx.fillStyle = '#00f0ff';
            ctx.font = 'bold 35px sans-serif';
            ctx.fillText(sec.icon + ' ' + sec.title, 70, y + 45);
            ctx.fillStyle = '#cccccc';
            ctx.font = '25px sans-serif';
            ctx.fillText(sec.content, 70, y + 85);
        });
    }

    // Fox logo
    ctx.beginPath();
    ctx.arc(width/2, height-220, 80, 0, Math.PI*2);
    ctx.fillStyle = '#ff6b00';
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🦊', width/2, height-205);

    return canvas.toBuffer('image/png');
}

module.exports = { generateQuantumMenu };