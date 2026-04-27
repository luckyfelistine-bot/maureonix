// lib/extract.js – Universal text extractor with AI‑powered description
const fs = require('fs');
const path = require('path');
const os = require('os');

let mammoth, xlsx, pdfParse, officeParser, admZip, epub;
try { mammoth = require('mammoth'); } catch (_) {}
try { xlsx = require('xlsx'); } catch (_) {}
try { pdfParse = require('pdf-parse'); } catch (_) {}
try { officeParser = require('officeparser'); } catch (_) {}
try { admZip = require('adm-zip'); } catch (_) {}
try { epub = require('epub'); } catch (_) {}

/**
 * Extract text from a buffer based on MIME type and filename.
 * Supports: images (OCR), audio (STT), video (STT via ffmpeg),
 *           PDF, Word, Excel, PowerPoint, archives, ebooks,
 *           plain text/code, and AI‑powered image description.
 */
async function extractText(buffer, mimeType = '', filename = '') {
    const ext = (filename || '').split('.').pop().toLowerCase();
    const mime = mimeType.toLowerCase();

    // ─── IMAGES ───
    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|tiff|webp|heic|heif)$/i.test(filename)) {
        // Try OCR first (if tesseract installed)
        let ocrText = '';
        try {
            const { imageToText } = require('./ocr');
            ocrText = await imageToText(buffer, 'eng');
        } catch (e) { ocrText = ''; }

        // If OCR returned less than 20 characters, also get AI description
        if (ocrText.length < 20) {
            const aiDesc = await describeImageWithAI(buffer);
            return ocrText + (aiDesc ? '\n[Image description: ' + aiDesc + ']' : '');
        }
        return ocrText;
    }

    // ─── AUDIO (STT) ───
    if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac|wma|opus)$/i.test(filename)) {
        const { transcribeAudio } = require('./audioTranscribe');
        return await transcribeAudio(buffer);
    }

    // ─── VIDEO (extract audio → transcribe) ───
    if (mime.startsWith('video/') || /\.(mp4|mkv|avi|mov|wmv|flv|webm|3gp)$/i.test(filename)) {
        const tempVideo = path.join(os.tmpdir(), `vid_${Date.now()}.mp4`);
        const tempAudio = path.join(os.tmpdir(), `aud_${Date.now()}.mp3`);
        fs.writeFileSync(tempVideo, buffer);
        try {
            await new Promise((resolve, reject) => {
                const cmd = `ffmpeg -i "${tempVideo}" -vn -ar 16000 -ac 1 -b:a 32k -f mp3 "${tempAudio}" -y`;
                require('child_process').exec(cmd, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            const audioBuffer = fs.readFileSync(tempAudio);
            const { transcribeAudio } = require('./audioTranscribe');
            return await transcribeAudio(audioBuffer);
        } finally {
            try { fs.unlinkSync(tempVideo); } catch (_) {}
            try { fs.unlinkSync(tempAudio); } catch (_) {}
        }
    }

    // ─── PDF ───
    if (mime === 'application/pdf' || ext === 'pdf') {
        if (!pdfParse) throw new Error('pdf-parse not installed');
        const data = await pdfParse(buffer);
        return data.text.trim();
    }

    // ─── Word (.docx, .doc) ───
    if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx') {
        if (!mammoth) throw new Error('mammoth not installed');
        return (await mammoth.extractRawText({ buffer })).value.trim();
    }
    if (mime === 'application/msword' || ext === 'doc') {
        if (!officeParser) throw new Error('officeparser not installed');
        return (await officeParser.parseOfficeAsync(buffer)).trim();
    }

    // ─── Excel (.xlsx, .xls) ───
    if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || ext === 'xlsx' ||
        mime === 'application/vnd.ms-excel' || ext === 'xls') {
        if (!xlsx) throw new Error('xlsx not installed');
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
        if (!officeParser) throw new Error('officeparser not installed');
        return (await officeParser.parseOfficeAsync(buffer)).trim();
    }

    // ─── Archives (.zip, .rar, .7z, .tar, .gz) – list text files inside ───
    if (/zip|rar|7z|tar|gzip|x-rar/.test(mime) || /\.(zip|rar|7z|tar|gz|bz2|xz)$/i.test(filename)) {
        if (!admZip) throw new Error('adm-zip not installed');
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
        if (!epub) throw new Error('epub not installed');
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

    // ─── Plain text & code files ───
    const textExts = ['txt','md','js','py','html','css','json','csv','xml','log','sh','sql','java','c','cpp','h','rb','go','rs','swift','kt','php','ts','yaml','yml','ini','cfg','conf','env','toml','lock','bat','ps1','lua','r','pl','scala','groovy','gradle','properties','vue','jsx','tsx'];
    if (textExts.includes(ext)) {
        let text = buffer.toString('utf-8');
        if (!text.trim()) text = buffer.toString('latin1');
        return text.replace(/[^\x20-\x7E\n\r\t]/g, '').trim();
    }

    return '[Unsupported file type – no text extracted]';
}

/**
 * Use Groq vision model to describe an image
 */
async function describeImageWithAI(imageBuffer) {
    try {
        const { keyManager, MODELS } = require('./ai');
        const apiKey = keyManager.getNext();
        const base64 = imageBuffer.toString('base64');

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODELS.scout,  // Llama 4 Scout supports vision
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Describe this image in one concise sentence.' },
                        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } }
                    ]
                }],
                max_tokens: 200,
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            keyManager.reportFailure(apiKey);
            return '';
        }
        const data = await response.json();
        keyManager.reportSuccess(apiKey);
        return data.choices?.[0]?.message?.content || '';
    } catch (e) {
        return '';
    }
}

module.exports = { extractText, describeImageWithAI };