// lib/ocr.js
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function imageToText(imageBuffer, language = 'eng') {
    const tempFile = path.join(os.tmpdir(), `ocr_${Date.now()}.png`);
    fs.writeFileSync(tempFile, imageBuffer);
    const form = new FormData();
    form.append('file', fs.createReadStream(tempFile));
    form.append('language', language);
    form.append('isOverlayRequired', 'false');
    form.append('OCREngine', '2');

    try {
        const res = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: form
        });
        const data = await res.json();
        if (!data.IsErroredOnProcessing && data.ParsedResults?.[0]) {
            return data.ParsedResults[0].ParsedText.trim();
        }
        throw new Error(data.ErrorMessage?.[0] || 'OCR failed');
    } finally {
        try { fs.unlinkSync(tempFile); } catch {}
    }
}

module.exports = { imageToText };