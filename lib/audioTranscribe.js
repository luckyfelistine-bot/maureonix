// lib/audioTranscribe.js – Speech-to-Text using Groq Whisper
const fs = require('fs');
const path = require('path');
const os = require('os');
const fetch = require('node-fetch');
const FormData = require('form-data');

const GROQ_API_KEY = process.env.GROQ_API_KEY || require('../config')?.groqApiKey || '';

/**
 * Transcribe audio buffer (voice note) to text
 * @param {Buffer} audioBuffer - Audio data (MP3, OGG, etc.)
 * @returns {Promise<string>} Transcribed text
 */
async function transcribeAudio(audioBuffer) {
    if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured');

    // Save buffer to temp file (Whisper requires a file upload)
    const tempFile = path.join(os.tmpdir(), `stt_${Date.now()}.ogg`);
    fs.writeFileSync(tempFile, audioBuffer);

    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(tempFile));
        form.append('model', 'whisper-large-v3-turbo');
        form.append('response_format', 'text');
        form.append('temperature', '0');

        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                ...form.getHeaders()
            },
            body: form
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Whisper API error ${response.status}: ${errorText.slice(0, 200)}`);
        }

        const result = await response.json();
        return result.text || '';
    } finally {
        // Clean up temp file
        try { fs.unlinkSync(tempFile); } catch (e) {}
    }
}

module.exports = { transcribeAudio };