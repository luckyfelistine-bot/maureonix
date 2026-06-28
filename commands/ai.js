// commands/ai.js – AI chat, image generation, translation, TTS, etc. (FULLY FIXED)
const { sendFile, extractQuotedContent } = require('./_utils');

module.exports = {
    // ─── GPT ──────────────────────────────────────────────────────────
    gpt: async (maureonix, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <question>`);
        // Send thinking indicator without affecting messageHandled
        await maureonix.sendMessage(m.chat, { text: '🦊 *Maureonix thinking...*' }, { quoted: m });
        try {
            const res = await AI.askModel(text, 'gpt', m.sender);
            if (!res || !res.text) throw new Error('Empty response from AI');
            await m.reply(`🦊 *Maureonix (GPT)*\n\n${res.text}`);
        } catch (e) {
            console.error('[GPT Error]', e);
            await m.reply(`❌ AI error: ${e.message}`);
        }
    },
    gemini: async (maureonix, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <question>`);
        await maureonix.sendMessage(m.chat, { text: '♊ *Maureonix (Gemini) thinking...*' }, { quoted: m });
        try {
            const res = await AI.askModel(text, 'gemini', m.sender);
            if (!res || !res.text) throw new Error('Empty response');
            await m.reply(`♊ *Maureonix (Gemini)*\n\n${res.text}`);
        } catch (e) {
            console.error('[Gemini Error]', e);
            await m.reply(`❌ AI error: ${e.message}`);
        }
    },
    llama: async (maureonix, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <question>`);
        await maureonix.sendMessage(m.chat, { text: '🦙 *Maureonix (Llama 3) thinking...*' }, { quoted: m });
        try {
            const res = await AI.askModel(text, 'llama', m.sender);
            await m.reply(`🦙 *Maureonix (Llama 3)*\n\n${res.text}`);
        } catch (e) {
            console.error('[Llama Error]', e);
            await m.reply(`❌ AI error: ${e.message}`);
        }
    },
    deepseek: async (maureonix, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <question>`);
        await maureonix.sendMessage(m.chat, { text: '🐋 *Maureonix (DeepSeek) thinking...*' }, { quoted: m });
        try {
            const res = await AI.askModel(text, 'deepseek', m.sender);
            await m.reply(`🐋 *Maureonix (DeepSeek)*\n\n${res.text}`);
        } catch (e) {
            console.error('[DeepSeek Error]', e);
            await m.reply(`❌ AI error: ${e.message}`);
        }
    },

    // ─── General AI (uses ultimateAI with doc context) ─────────────────
    ai: async (maureonix, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <question>`);
        const { buildContext } = require('../lib/docs');
        const context = buildContext(text, 2);
        let prompt = text;
        if (context) prompt = `Use documentation if relevant:\n${context}\n\nUser: ${text}`;
        const res = await AI.ultimateAI(prompt, m.sender);
        await m.reply(`🦊 *Maureonix*\n\n${res.text}`);
    },

    // ─── Image generation (Pollinations) ───────────────────────────────
    imagine: async (maureonix, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <prompt>`);
        await m.reply('🎨 *Generating image...*');
        const url = await AI.imagine(text);
        await maureonix.sendMessage(m.chat, { image: { url }, caption: `🎨 *${text}*` }, { quoted: m });
    },

    // ─── Translation (multi‑service fallback) ──────────────────────────
    translate: async (maureonix, m, { args, prefix, command, text }) => {
        if (args.length < 2) return m.reply(`Example: ${prefix + command} si Hello world`);
        const targetLang = args[0].toLowerCase();
        const textToTranslate = args.slice(1).join(' ');
        if (!textToTranslate) return m.reply('Please provide text to translate.');
        await m.reply('🌐 *Translating...*');
        try {
            let translatedText = null;
            // MyMemory
            try {
                const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|${targetLang}`);
                const json = await res.json();
                if (json.responseStatus === 200 && json.responseData?.translatedText) translatedText = json.responseData.translatedText;
            } catch (e) {}
            // LibreTranslate
            if (!translatedText) {
                try {
                    const res = await fetch('https://translate.argosopentech.com/translate', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ q: textToTranslate, source: 'auto', target: targetLang, format: 'text' })
                    });
                    if (res.ok) { const json = await res.json(); translatedText = json.translatedText; }
                } catch (e) {}
            }
            // Google Translate fallback
            if (!translatedText) {
                try {
                    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`);
                    const json = await res.json();
                    translatedText = json[0].map(part => part[0]).join('');
                } catch (e) {}
            }
            if (translatedText) await m.reply(`🌐 *Translated (${targetLang})*\n\n${translatedText}`);
            else throw new Error('All translation services failed');
        } catch (e) { m.reply(`❌ Translation failed: ${e.message}`); }
    },

    // ─── Text to Speech (gTTS + ffmpeg to opus) ────────────────────────
    tts: async (maureonix, m, { args, text, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} Hello world`);
        let lang = args[0]?.length === 2 ? args.shift() : 'en';
        let txt = args.join(' ') || text;
        await m.reply('🔊 *Generating voice...*');
        let oggBuffer = null;
        try {
            const gTTS = require('gtts');
            const tmpDir = require('os').tmpdir();
            const fs = require('fs');
            const path = require('path');
            const { exec } = require('child_process');
            const util = require('util');
            const execPromise = util.promisify(exec);
            const tempMp3 = path.join(tmpDir, `tts_${Date.now()}.mp3`);
            await new Promise((resolve, reject) => {
                const tts = new gTTS(txt, lang);
                tts.save(tempMp3, (err) => { if (err) reject(err); else resolve(); });
            });
            const mp3Buffer = fs.readFileSync(tempMp3);
            fs.unlinkSync(tempMp3);
            const tempOgg = path.join(tmpDir, `tts_${Date.now()}.ogg`);
            await execPromise(`ffmpeg -i "${tempMp3}" -c:a libopus -b:a 24k -ar 24000 "${tempOgg}" -y`);
            oggBuffer = fs.readFileSync(tempOgg);
            fs.unlinkSync(tempOgg);
        } catch (e) { console.error('[TTS]', e); }
        if (oggBuffer) {
            await maureonix.sendMessage(m.chat, { audio: oggBuffer, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m });
        } else {
            try {
                // fallback to mp3
                const gTTS = require('gtts');
                const tmpDir = require('os').tmpdir();
                const fs = require('fs');
                const path = require('path');
                const tempMp3 = path.join(tmpDir, `tts_${Date.now()}.mp3`);
                await new Promise((resolve, reject) => {
                    const tts = new gTTS(txt, lang);
                    tts.save(tempMp3, (err) => { if (err) reject(err); else resolve(); });
                });
                const mp3Buffer = fs.readFileSync(tempMp3);
                fs.unlinkSync(tempMp3);
                await maureonix.sendMessage(m.chat, { audio: mp3Buffer, mimetype: 'audio/mpeg', ptt: false }, { quoted: m });
            } catch (finalErr) { m.reply(`❌ TTS failed: ${finalErr.message}`); }
        }
    },

    // ─── Speech to Text (voice note transcription) ─────────────────────
    stt: async (maureonix, m) => {
        if (!m.quoted || !/audio|voice|ptt/.test(m.quoted.type)) return m.reply('🎤 Reply to a voice note to transcribe it.');
        await m.reply('🎤 *Transcribing audio...*');
        try {
            const audioBuffer = await m.quoted.download();
            const { transcribeAudio } = require('../lib/audioTranscribe');
            const text = await transcribeAudio(audioBuffer);
            await m.reply(`📝 *Transcription:*\n\n${text || '(No speech detected)'}`);
        } catch (err) { await m.reply(`❌ Transcription failed: ${err.message}`); }
    },

    // ─── View Once (handled in maureonix_core, but keep alias) ──────────────
    vv: async (maureonix, m, ctx) => {
        // This is already handled in maureonix_core; if called directly, ignore
        return m.reply('Use .vv as a reply to a view‑once message.');
    },

    // ─── Summarize ─────────────────────────────────────────────────────
    summarize: async (maureonix, m, { AI }) => {
        if (!m.quoted) return m.reply('Reply to a long message to summarize');
        const text = m.quoted.body || m.quoted.text || '';
        if (!text) return m.reply('No text to summarize');
        await m.reply('📋 *Summarizing...*');
        try {
            const summary = await AI.summarize(text);
            await m.reply(`📋 *Summary:*\n\n${summary}`);
        } catch (e) { m.reply('❌ Summarize failed: ' + e.message); }
    },

    // ─── Code Generation ───────────────────────────────────────────────
    code: async (maureonix, m, { args, text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <description>`);
        const lang = args[0]?.startsWith('--') ? args.shift().slice(2) : 'javascript';
        const desc = args.join(' ') || text;
        try {
            const res = await AI.codeAI(desc, lang);
            await m.reply(`💻 *${lang.toUpperCase()} Code:*\n\n\`\`\`${lang}\n${res.text}\n\`\`\``);
        } catch (e) { m.reply('❌ Code generation failed: ' + e.message); }
    },

    // ─── Brainrot (Gen Z slang) ────────────────────────────────────────
    brainrot: async (maureonix, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <text>`);
        try {
            const res = await AI.brainrot(text);
            await m.reply(`🧠 *Brainrot Mode:*\n${res.text}`);
        } catch (e) { m.reply('❌ Brainrot failed: ' + e.message); }
    },

    // ─── Roast AI ──────────────────────────────────────────────────────
    roastai: async (maureonix, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <name/thing>`);
        try {
            const res = await AI.roast(text);
            await m.reply(`🔥 *AI Roast:*\n${res.text}`);
        } catch (e) { m.reply('❌ Roast failed: ' + e.message); }
    },

    // ─── Rizz (pickup lines) ───────────────────────────────────────────
    rizz: async (maureonix, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <situation>`);
        try {
            const res = await AI.rizz(text);
            await m.reply(`💘 *Rizz:*\n${res.text}`);
        } catch (e) { m.reply('❌ Rizz failed: ' + e.message); }
    },

    // ─── Ask Media (file analysis) ─────────────────────────────────────
    askmedia: async (maureonix, m, { text, AI, prefix, command }) => {
        if (!m.quoted) return m.reply(`📎 *Universal Media AI*\n\nReply to any file with:\n${prefix}askmedia [your question]\n\nSupports: images, audio, video, PDF, Word, Excel, PowerPoint, archives, ebooks, code, and more.`);
        let userQuestion = text || 'Please summarise the content of this file.';
        await m.reply('🧠 *Analyzing file with AI...*');
        try {
            const extracted = await extractQuotedContent(m.quoted, maureonix);
            if (!extracted.text && extracted.type !== 'sticker') return m.reply(`❌ Could not extract text from this ${extracted.type || 'file'}.${extracted.error ? `\nError: ${extracted.error}` : ''}`);
            let prompt = extracted.type === 'sticker' ? `User: "${userQuestion}"\n(Sticker – no text)` : `File type: ${extracted.type}\nContent:\n"""\n${extracted.text.slice(0, 4000)}\n"""\n\nQuestion: ${userQuestion}\nAnswer based on the content.`;
            const aiResult = await AI.ultimateAI(prompt, m.sender, 'deepseek');
            await m.reply(`📎 *${extracted.type.toUpperCase()} Analysis*\n\n${aiResult.text}`);
        } catch (e) { await m.reply(`❌ Failed: ${e.message}`); }
    },

    // ─── Clear AI memory ───────────────────────────────────────────────
    clearmemory: async (maureonix, m, { AI }) => {
        AI.clearMemory(m.sender);
        await m.reply('🧹 AI memory cleared');
    },

    // ─── AI Balance (placeholder) ──────────────────────────────────────
    aibalance: async (maureonix, m, { AI }) => {
        try {
            const bal = await AI.getBalance();
            await m.reply(`💰 *AI Service Status*\n\nBalance: ${bal.balance}\nRate Limit: ${bal.rate_limit}`);
        } catch (e) { await m.reply('❌ Failed to fetch status'); }
    },

    // ─── Detect Language ───────────────────────────────────────────────
    detectlang: async (maureonix, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <text>`);
        const res = await AI.ultimateAI(`Detect language: "${text}". Reply only language name.`, m.sender, 'deepseek');
        await m.reply(`🌐 Detected: ${res.text}`);
    },

    // ─── Read Time (words per minute) ──────────────────────────────────
    readtime: async (maureonix, m, { text }) => {
        const words = text.split(/\s+/).length;
        const mins = Math.ceil(words / 200);
        await m.reply(`📖 ${words} words ≈ ${mins} min read`);
    },

    // ═══════════════════════════════════════════════════════════════════
    //  MODE SWITCH (instant, search, code, creative)
    // ═══════════════════════════════════════════════════════════════════
    mode: async (maureonix, m, { args, prefix, AI }) => {
        if (!args[0]) return m.reply(`Usage: ${prefix}mode <instant|search|code|creative>\nCurrent: ${AI.getCurrentMode(m.sender)}`);
        const msg = AI.setMode(m.sender, args[0].toLowerCase());
        m.reply(msg);
    },

    // ═══════════════════════════════════════════════════════════════════
    //  THINKING RETRIEVAL (shows last hidden reasoning)
    // ═══════════════════════════════════════════════════════════════════
    thinking: async (maureonix, m, { AI }) => {
        const thinking = AI.getThinking(m.sender);
        m.reply(`💭 *Thinking*\n\n${thinking}`);
    },

    // ─── Aliases (for convenience) ─────────────────────────────────────
    chatgpt: async (maureonix, m, ctx) => { await module.exports.gpt(maureonix, m, ctx); },
    openai: async (maureonix, m, ctx) => { await module.exports.gpt(maureonix, m, ctx); },
    transcribe: async (maureonix, m, ctx) => { await module.exports.stt(maureonix, m, ctx); },
    speech2text: async (maureonix, m, ctx) => { await module.exports.stt(maureonix, m, ctx); },
    coding: async (maureonix, m, ctx) => { await module.exports.code(maureonix, m, ctx); },
    program: async (maureonix, m, ctx) => { await module.exports.code(maureonix, m, ctx); },
    aiimage: async (maureonix, m, ctx) => { await module.exports.imagine(maureonix, m, ctx); },
    draw: async (maureonix, m, ctx) => { await module.exports.imagine(maureonix, m, ctx); },
    create: async (maureonix, m, ctx) => { await module.exports.imagine(maureonix, m, ctx); },
    askai: async (maureonix, m, ctx) => { await module.exports.ai(maureonix, m, ctx); },
    tr: async (maureonix, m, ctx) => { await module.exports.translate(maureonix, m, ctx); },
};
