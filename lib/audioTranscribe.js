// lib/audioTranscribe.js – Speech-to-Text using Groq Whisper (multi‑key)
const fs = require('fs');
const path = require('path');
const os = require('os');
const fetch = require('node-fetch');
const FormData = require('form-data');

// Use the shared key manager from the AI engine
let keyManager;
try { keyManager = require('./ai').keyManager; } catch(e) {}

const GROQ_TRANSCRIBE_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

/**
 * Transcribe audio buffer (voice note) to text
 * @param {Buffer} audioBuffer - Audio data (MP3, OGG, WAV, FLAC, M4A, etc.)
 * @param {string} [model='whisper-large-v3-turbo'] - Whisper model to use
 * @returns {Promise<string>} Transcribed text
 */
async function transcribeAudio(audioBuffer, model = 'whisper-large-v3-turbo') {
    if (!keyManager || keyManager.keys.length === 0) {
        throw new Error('No Groq API keys configured. Set groqApiKeys in config.js');
    }

    // Save buffer to temp file (required by Whisper API)
    const tempFile = path.join(os.tmpdir(), `stt_${Date.now()}_${Math.random().toString(36).slice(2)}.ogg`);
    fs.writeFileSync(tempFile, audioBuffer);

    let lastError = null;
    const maxKeyAttempts = Math.min(3, keyManager.keys.length);

    for (let k = 0; k < maxKeyAttempts; k++) {
        const apiKey = keyManager.getNext();
        try {
            const form = new FormData();
            form.append('file', fs.createReadStream(tempFile));
            form.append('model', model);
            form.append('response_format', 'json');  // changed to json for better error details
            form.append('temperature', '0');

            const response = await fetch(GROQ_TRANSCRIBE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    ...form.getHeaders()
                },
                body: form,
                timeout: 30000,
            });

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 429 || response.status === 401 || response.status === 403) {
                    keyManager.reportFailure(apiKey);
                    continue;   // try next key
                }
                throw new Error(`Whisper API error ${response.status}: ${errorText.slice(0, 200)}`);
            }

            const result = await response.json();
            keyManager.reportSuccess(apiKey);
            return result.text || '';
        } catch (e) {
            lastError = e;
            if (e.name === 'AbortError' || e.message.includes('timeout')) {
                keyManager.reportFailure(apiKey);
            }
        } finally {
            try { fs.unlinkSync(tempFile); } catch (_) {}
        }
    }

    throw new Error(`Whisper transcription failed after ${maxKeyAttempts} keys. Last error: ${lastError?.message}`);
}

module.exports = { transcribeAudio };