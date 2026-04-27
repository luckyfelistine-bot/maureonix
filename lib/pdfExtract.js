// lib/pdfExtract.js – PDF text extraction with OCR fallback
const fs = require('fs');
const path = require('path');
const os = require('os');

async function pdfToText(pdfBuffer) {
    let pdfParse;
    try {
        pdfParse = require('pdf-parse');
    } catch {
        throw new Error('pdf-parse not installed. Run: npm install pdf-parse');
    }
    try {
        const data = await pdfParse(pdfBuffer);
        return data.text.trim();
    } catch (err) {
        // Fallback: treat as image and OCR
        const { imageToText } = require('./ocr');
        return await imageToText(pdfBuffer, 'eng');
    }
}

module.exports = { pdfToText };