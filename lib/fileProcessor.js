// lib/fileProcessor.js – Universal file handler for self‑chat / auto‑AI
const { extractText } = require('./extract');
const { transcribeAudio } = require('./audioTranscribe');
const { imageToText } = require('./ocr');

/**
 * Process any file (buffer, mimetype, filename) and return a text description.
 * Used automatically when a file is sent to the bot without a command.
 */
async function processFile(buffer, mimeType = '', filename = '') {
    const startTime = Date.now();
    try {
        // Use the universal extractor first (handles most types)
        const extracted = await extractText(buffer, mimeType, filename);
        if (extracted && extracted.length > 10 && !extracted.startsWith('[')) {
            return { type: 'text', content: extracted, method: 'extract' };
        }

        // If extraction failed or gave mimaureonixl text, try AI description for images
        if (mimeType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) {
            const desc = await imageToText(buffer, 'eng');
            if (desc && desc.length > 5) return { type: 'text', content: desc, method: 'ocr/ai' };
        }

        // For audio without good extraction, transcribe directly
        if (mimeType.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac)$/i.test(filename)) {
            const transcript = await transcribeAudio(buffer);
            if (transcript) return { type: 'text', content: transcript, method: 'stt' };
        }

        return { type: 'unknown', content: 'Could not understand this file.' };
    } catch (e) {
        return { type: 'error', content: `File processing error: ${e.message}` };
    }
}

module.exports = { processFile };