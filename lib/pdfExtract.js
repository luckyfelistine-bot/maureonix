// lib/pdfExtract.js
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
    const tempFile = path.join(os.tmpdir(), `pdf_${Date.now()}.pdf`);
    fs.writeFileSync(tempFile, pdfBuffer);
    try {
        const data = await pdfParse(pdfBuffer);
        return data.text.trim();
    } finally {
        try { fs.unlinkSync(tempFile); } catch {}
    }
}

module.exports = { pdfToText };