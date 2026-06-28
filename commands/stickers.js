// commands/stickers.js – Sticker & media processing
const fs = require('fs');
const path = require('path');
const { writeExif } = require('../lib/exif');
const { getBuffer } = require('../lib/function');

module.exports = {
    sticker: async (maureonix, m, { packname, author }) => {
        if (!m.quoted) return m.reply('Reply to an image, video, or GIF to convert to sticker.');
        try {
            const buffer = await m.quoted.download();
            const stickerPath = await writeExif(buffer, { packname, author });
            const stickerBuffer = fs.readFileSync(stickerPath);
            await maureonix.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });
            fs.unlinkSync(stickerPath);
        } catch (e) { m.reply('❌ Failed to create sticker: ' + e.message); }
    },
    simage: async (maureonix, m) => {
        if (!m.quoted || !/sticker/.test(m.quoted.type)) return m.reply('Reply to a sticker to convert to image.');
        try {
            const buffer = await m.quoted.download();
            await maureonix.sendMessage(m.chat, { image: buffer }, { quoted: m });
        } catch (e) { m.reply('❌ Failed to convert: ' + e.message); }
    },
    attp: async (maureonix, m, { prefix, command, text }) => {
        if (!text) return m.reply(`Example: ${prefix + command} Hello`);
        await m.reply('🎨 *Creating amaureonixted sticker...*');
        try {
            const { spawn } = require('child_process');
            const os = require('os');
            const path = require('path');
            const fs = require('fs');
            const fontPath = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
            const escTxt = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/:/g, '\\:').replace(/,/g, '\\,').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/%/g, '\\%');
            const safeText = escTxt(text);
            const tmpOut = path.join(os.tmpdir(), `attp_${Date.now()}.webp`);
            const cycle = 0.3, dur = 1.8;
            const base = `fontfile='${fontPath}':text='${safeText}':borderw=3:bordercolor=black@0.8:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2`;
            const drawRed   = `drawtext=${base}:fontcolor=#FF4444:enable='lt(mod(t\\,${cycle})\\,0.1)'`;
            const drawBlue  = `drawtext=${base}:fontcolor=#4488FF:enable='between(mod(t\\,${cycle})\\,0.1\\,0.2)'`;
            const drawGreen = `drawtext=${base}:fontcolor=#44FF88:enable='gte(mod(t\\,${cycle})\\,0.2)'`;
            const args = [
                '-y',
                '-f', 'lavfi', '-i', `color=c=black:s=512x512:d=${dur}:r=15`,
                '-vf', `${drawRed},${drawBlue},${drawGreen},scale=512:512`,
                '-vcodec', 'libwebp',
                '-lossless', '0',
                '-compression_level', '4',
                '-quality', '70',
                '-loop', '0',
                '-preset', 'default',
                '-an', '-vsync', '0',
                '-t', String(dur),
                tmpOut
            ];
            const webpBuffer = await new Promise((resolve, reject) => {
                const ff = spawn('ffmpeg', args);
                let stderr = '';
                ff.stderr.on('data', d => stderr += d);
                ff.on('error', reject);
                ff.on('close', code => {
                    if (code === 0 && fs.existsSync(tmpOut)) {
                        const buf = fs.readFileSync(tmpOut);
                        fs.unlinkSync(tmpOut);
                        resolve(buf);
                    } else {
                        try { fs.unlinkSync(tmpOut); } catch {}
                        reject(new Error(stderr.slice(-200)));
                    }
                });
            });
            await maureonix.sendMessage(m.chat, { sticker: webpBuffer }, { quoted: m });
            await m.reply('✅ ATTP sticker created!');
        } catch (ffErr) {
            console.log('ATTP ffmpeg fail:', ffErr.message.slice(0, 200));
            // Fallback to free APIs
            const fetch = require('node-fetch');
            const apis = [
                `https://api.paxsenix.biz.id/sticker/attp?text=${encodeURIComponent(text)}`,
                `https://api.lolhuman.xyz/api/attp?apikey=demo&text=${encodeURIComponent(text)}`
            ];
            let success = false;
            for (const url of apis) {
                try {
                    const res = await fetch(url);
                    if (!res.ok) continue;
                    const buffer = await res.buffer();
                    if (buffer && buffer.length > 100) {
                        await maureonix.sendMessage(m.chat, { sticker: buffer }, { quoted: m });
                        m.reply('✅ ATTP sticker created!');
                        success = true;
                        break;
                    }
                } catch (_) {}
            }
            if (!success) m.reply('❌ Failed to create ATTP sticker.');
        }
    },
    removebg: async (maureonix, m, { global }) => {
        if (!m.quoted || !/image/.test(m.quoted.type)) return m.reply('Reply to an image to remove background.');
        await m.reply('🎨 *Removing background...*');
        try {
            const buffer = await m.quoted.download();
            const fetch = require('node-fetch');
            const FormData = require('form-data');
            const form = new FormData();
            form.append('image_file', buffer, 'image.png');
            form.append('size', 'auto');
            const res = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: { 'X-Api-Key': global.removeBgKey },
                body: form
            });
            if (res.ok) {
                const result = await res.buffer();
                await maureonix.sendMessage(m.chat, { image: result, caption: '✅ Background removed' }, { quoted: m });
            } else throw new Error(`API error: ${res.status}`);
        } catch (e) { m.reply('❌ Failed to remove background: ' + e.message); }
    },
    blur: async (maureonix, m) => {
        if (!m.quoted || !/image/.test(m.quoted.type)) return m.reply('Reply to an image to blur.');
        try {
            const sharp = require('sharp');
            const buffer = await m.quoted.download();
            const blurred = await sharp(buffer).blur(10).toBuffer();
            await maureonix.sendMessage(m.chat, { image: blurred, caption: '🔮 Blurred' }, { quoted: m });
        } catch (e) { m.reply('❌ Failed to blur: ' + e.message); }
    },
    // ─── QR Code Generator (any text / URL / link) ────────────
    qr: async (maureonix, m, { text, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} https://maureonix.com\nOr: ${prefix + command} Hello World`);
        await m.reply('📱 *Generating QR code...*');
        const url = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(text)}&size=300x300&format=png`;
        try {
            const fetch = require('node-fetch');
            const res = await fetch(url);
            if (!res.ok) throw new Error('QR API returned ' + res.status);
            const buffer = await res.buffer();
            await maureonix.sendMessage(m.chat, { image: buffer, caption: `🔳 QR for: ${text}` }, { quoted: m });
        } catch (e) {
            await m.reply(`❌ Failed to generate QR: ${e.message}`);
        }
    },

    // ─── QR Code Reader (decode an image back to text) ────────
    readqr: async (maureonix, m) => {
        if (!m.quoted || !/image/.test(m.quoted.type)) return m.reply('📸 Reply to a QR code image to decode it.');
        await m.reply('🔍 *Reading QR code...*');
        try {
            const mediaBuffer = await m.quoted.download();
            // Upload to api.qrserver.com
            const FormData = require('form-data');
            const fetch = require('node-fetch');
            const form = new FormData();
            form.append('file', mediaBuffer, { filename: 'qr.png' });

            const res = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
                method: 'POST',
                body: form,
                headers: form.getHeaders(),
            });
            const json = await res.json();
            if (json && json[0] && json[0].symbol[0].data) {
                const decoded = json[0].symbol[0].data;
                await m.reply(`🔳 *Decoded QR content:*\n\n${decoded}`);
            } else if (json && json[0] && json[0].symbol[0].error) {
                await m.reply(`❌ Could not decode: ${json[0].symbol[0].error}`);
            } else {
                await m.reply('❌ No QR code found in the image.');
            }
        } catch (e) {
            await m.reply(`❌ Failed to read QR: ${e.message}`);
        }
    },

    brat: async (maureonix, m, { isLimit, mess, prefix, command, text, setLimit, db }) => {
        if (!isLimit) return m.reply(mess.limit);
        if (!text && (!m.quoted || !m.quoted.text)) return m.reply(`📌 Reply with text or type: ${prefix + command} <text>`);
        const inputText = text || m.quoted.text;
        await m.reply('🎨 *Generating brat sticker...*');
        try {
            const fetch = require('node-fetch');
            const apis = [
                `https://api.paxsenix.biz.id/maker/brat?text=${encodeURIComponent(inputText)}`,
                `https://api.davidcyriltech.my.id/brat?text=${encodeURIComponent(inputText)}`
            ];
            let success = false;
            for (const url of apis) {
                try {
                    const res = await fetch(url);
                    if (!res.ok) continue;
                    const buffer = await res.buffer();
                    if (buffer && buffer.length > 100) {
                        await maureonix.sendAsSticker(m.chat, buffer, m);
                        success = true;
                        break;
                    }
                } catch (e) {}
            }
            if (!success) throw new Error('All APIs failed');
            setLimit(m, db);
        } catch (e) { m.reply('❌ Brat generation failed.'); }
    },
    smeme: async (maureonix, m, { prefix, command, text, getBuffer }) => {
        if (!m.quoted || !/image/.test(m.quoted.type)) return m.reply('Reply to an image with caption: .smeme top|bottom');
        if (!text || !text.includes('|')) return m.reply(`Example: ${prefix + command} top text|bottom text`);
        const [top, bottom] = text.split('|').map(s => s.trim());
        try {
            const fetch = require('node-fetch');
            const buffer = await m.quoted.download();
            const base64 = buffer.toString('base64');
            const url = `https://api.memegen.link/images/custom/${encodeURIComponent(top || '_')}/${encodeURIComponent(bottom || '_')}.png?background=${encodeURIComponent(base64)}`;
            const memeBuffer = await getBuffer(url);
            await maureonix.sendMessage(m.chat, { image: memeBuffer }, { quoted: m });
        } catch (e) { m.reply('❌ Smeme failed: ' + e.message); }
    },
    // aliases
    s: async (maureonix, m, ctx) => { await module.exports.sticker(maureonix, m, ctx); },
    toimg: async (maureonix, m, ctx) => { await module.exports.simage(maureonix, m, ctx); },
    
    // Alias for qr (optional)
    qrcode: async (maureonix, m, ctx) => { await module.exports.qr(maureonix, m, ctx); },
};
