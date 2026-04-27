// lib/ocr.js – Multi‑source OCR with AI fallback (OCR.space, Tesseract, Groq Vision)
const fs = require('fs');
const path = require('path');
const os = require('os');
const fetch = require('node-fetch');
const FormData = require('form-data');

let tesseract;
try { tesseract = require('node-tesseract-ocr'); } catch (_) {}

/** Primary: OCR.space (free) */
async function ocrSpace(imageBuffer, language = 'eng') {
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
            body: form,
            timeout: 15000,
        });
        const data = await res.json();
        if (!data.IsErroredOnProcessing && data.ParsedResults?.[0]) {
            return data.ParsedResults[0].ParsedText.trim();
        }
        throw new Error(data.ErrorMessage?.[0] || 'OCR.space failed');
    } finally {
        try { fs.unlinkSync(tempFile); } catch (_) {}
    }
}

/** Secondary: Tesseract (local) */
async function tesseractOCR(imageBuffer, language = 'eng') {
    if (!tesseract) throw new Error('Tesseract not installed');
    const tempImg = path.join(os.tmpdir(), `ocr_${Date.now()}.png`);
    fs.writeFileSync(tempImg, imageBuffer);
    try {
        return (await tesseract.recognize(tempImg, { lang: language })).trim();
    } finally { fs.unlinkSync(tempImg); }
}

/** Tertiary: Groq Vision model (AI description) */
async function visionDescribe(imageBuffer) {
    try {
        const { keyManager, MODELS } = require('./ai');
        const apiKey = keyManager.getNext();
        const base64 = imageBuffer.toString('base64');
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODELS.scout,
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Extract all visible text from this image. If no text, describe the image briefly.' },
                        { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } }
                    ]
                }],
                max_tokens: 300,
                temperature: 0,
            }),
        });
        if (!res.ok) {
            keyManager.reportFailure(apiKey);
            return '';
        }
        const data = await res.json();
        keyManager.reportSuccess(apiKey);
        return data.choices?.[0]?.message?.content || '';
    } catch (e) { return ''; }
}

/**
 * Extract text from an image using available methods.
 * @param {Buffer} imageBuffer
 * @param {string} [language='eng']
 * @returns {Promise<string>} Extracted text
 */
async function imageToText(imageBuffer, language = 'eng') {
    // Try OCR.space first (fast, free)
    try { return await ocrSpace(imageBuffer, language); } catch (_) {}

    // Try local Tesseract
    try { return await tesseractOCR(imageBuffer, language); } catch (_) {}

    // Fallback to AI vision (slower but works)
    try { return await visionDescribe(imageBuffer); } catch (_) {}

    throw new Error('All OCR methods failed');
}

module.exports = { imageToText, ocrSpace, tesseractOCR, visionDescribe };