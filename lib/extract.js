// lib/extract.js – Universal text extractor for all file types
const fs = require('fs');
const path = require('path');
const os = require('os');

// Optional dependencies – gracefully handle if not installed
let mammoth, xlsx, pdfParse, officeParser, tesseract, ffmpeg, admZip, epub;
try { mammoth = require('mammoth'); } catch(e) {}
try { xlsx = require('xlsx'); } catch(e) {}
try { pdfParse = require('pdf-parse'); } catch(e) {}
try { officeParser = require('officeparser'); } catch(e) {}
try { tesseract = require('node-tesseract-ocr'); } catch(e) {}
try { ffmpeg = require('fluent-ffmpeg'); } catch(e) {}
try { admZip = require('adm-zip'); } catch(e) {}
try { epub = require('epub'); } catch(e) {}

async function extractText(buffer, mimeType = '', filename = '') {
    const ext = (filename || '').split('.').pop().toLowerCase();
    const mime = mimeType.toLowerCase();

    // ─── IMAGES (OCR) ───
    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|tiff|webp|heic)$/i.test(filename)) {
        if (!tesseract) throw new Error('Install: npm install node-tesseract-ocr');
        const tempImg = path.join(os.tmpdir(), `ocr_${Date.now()}.png`);
        fs.writeFileSync(tempImg, buffer);
        try {
            return (await tesseract.recognize(tempImg, { lang: 'eng' })).trim();
        } finally { fs.unlinkSync(tempImg); }
    }

    // ─── AUDIO (STT) ───
    if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(filename)) {
        const { transcribeAudio } = require('./audioTranscribe');
        return await transcribeAudio(buffer);
    }

    // ─── VIDEO (extract audio → transcribe) ───
    if (mime.startsWith('video/') || /\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i.test(filename)) {
        if (!ffmpeg) throw new Error('Install: npm install fluent-ffmpeg');
        const tempVideo = path.join(os.tmpdir(), `vid_${Date.now()}.mp4`);
        const tempAudio = path.join(os.tmpdir(), `aud_${Date.now()}.mp3`);
        fs.writeFileSync(tempVideo, buffer);
        try {
            await new Promise((resolve, reject) => {
                require('fluent-ffmpeg')(tempVideo)
                    .noVideo()
                    .audioCodec('libmp3lame')
                    .save(tempAudio)
                    .on('end', resolve)
                    .on('error', reject);
            });
            const audioBuffer = fs.readFileSync(tempAudio);
            const { transcribeAudio } = require('./audioTranscribe');
            return await transcribeAudio(audioBuffer);
        } finally {
            try { fs.unlinkSync(tempVideo); } catch(e) {}
            try { fs.unlinkSync(tempAudio); } catch(e) {}
        }
    }

    // ─── PDF ───
    if (mime === 'application/pdf' || ext === 'pdf') {
        if (!pdfParse) throw new Error('Install: npm install pdf-parse');
        const data = await pdfParse(buffer);
        return data.text.trim();
    }

    // ─── Word (.docx, .doc) ───
    if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx') {
        if (!mammoth) throw new Error('Install: npm install mammoth');
        const result = await mammoth.extractRawText({ buffer });
        return result.value.trim();
    }
    if (mime === 'application/msword' || ext === 'doc') {
        if (!officeParser) throw new Error('Install: npm install officeparser');
        return (await officeParser.parseOfficeAsync(buffer)).trim();
    }

    // ─── Excel (.xlsx, .xls) ───
    if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || ext === 'xlsx' || mime === 'application/vnd.ms-excel' || ext === 'xls') {
        if (!xlsx) throw new Error('Install: npm install xlsx');
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        let text = '';
        workbook.SheetNames.forEach(sheet => {
            const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1, defval: '' });
            rows.forEach(row => text += row.join(' ') + '\n');
        });
        return text.trim();
    }

    // ─── PowerPoint (.pptx, .ppt) ───
    if (mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || ext === 'pptx') {
        if (!officeParser) throw new Error('Install: npm install officeparser');
        return (await officeParser.parseOfficeAsync(buffer)).trim();
    }

    // ─── Archives (.zip, .rar, .7z, .tar, .gz) – list text files inside ───
    if (/zip|rar|7z|tar|gzip|x-rar/.test(mime) || /\.(zip|rar|7z|tar|gz|bz2|xz)$/i.test(filename)) {
        if (!admZip) throw new Error('Install: npm install adm-zip');
        const tempZip = path.join(os.tmpdir(), `archive_${Date.now()}.zip`);
        fs.writeFileSync(tempZip, buffer);
        const zip = new admZip(tempZip);
        let result = '';
        zip.getEntries().forEach(entry => {
            if (!entry.isDirectory && /\.(txt|md|js|py|html|json|xml|csv|log|sh|sql|java|cpp|rb|go|rs|swift|kt|php|ts|yml|ini|cfg|conf|env)$/i.test(entry.name)) {
                result += `\n--- ${entry.name} ---\n${entry.getData().toString('utf-8')}\n`;
            }
        });
        fs.unlinkSync(tempZip);
        return result || 'Archive contains no text files.';
    }

    // ─── Ebooks (.epub) ───
    if (mime === 'application/epub+zip' || ext === 'epub') {
        if (!epub) throw new Error('Install: npm install epub');
        const tempEpub = path.join(os.tmpdir(), `book_${Date.now()}.epub`);
        fs.writeFileSync(tempEpub, buffer);
        try {
            const book = new (require('epub'))(tempEpub);
            let text = '';
            await new Promise((resolve, reject) => {
                book.parse();
                book.on('end', () => {
                    for (const id in book.flow) if (book.flow[id].text) text += book.flow[id].text + '\n';
                    resolve();
                });
                book.on('error', reject);
            });
            return text.trim();
        } finally { fs.unlinkSync(tempEpub); }
    }

    // ─── Plain text & code files (everything else) ───
    const textExts = ['txt','md','js','py','html','css','json','csv','xml','log','sh','sql','java','c','cpp','h','rb','go','rs','swift','kt','php','ts','yaml','yml','ini','cfg','conf','env','toml','lock','bat','ps1','lua','r','pl','scala','groovy','gradle','properties','vue','jsx','tsx'];
    if (textExts.includes(ext)) {
        let text = buffer.toString('utf-8');
        if (!text.trim()) text = buffer.toString('latin1');
        return text.replace(/[^\x20-\x7E\n\r\t]/g, '').trim();
    }

    return '[Unsupported file type – no text extracted]';
}

module.exports = { extractText };