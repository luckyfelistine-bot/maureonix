// src/modules/aiChat.js – AI chat, image generation, translation, TTS, learning mode, etc.
// Maureonix v7 Omniscient Commands
const { sendFile, extractQuotedContent } = require('./_utils');

module.exports = {
    // ── AI Chat Commands ──
    gpt: async (nimesha, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <question>`);
        await m.reply('🦊 *Maureonix thinking...*');
        try {
            const res = await AI.askModel(text, 'gpt', m.sender);
            await m.reply(`🦊 *Maureonix (GPT)*\n\n${res.text}`);
        } catch (e) { await m.reply(`❌ AI error: ${e.message}`); }
    },
    gemini: async (nimesha, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <question>`);
        await m.reply('♊ *Maureonix (Gemini) thinking...*');
        try {
            const res = await AI.askModel(text, 'gemini', m.sender);
            await m.reply(`♊ *Maureonix*\n\n${res.text}`);
        } catch (e) { await m.reply(`❌ AI error: ${e.message}`); }
    },
    llama: async (nimesha, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <question>`);
        await m.reply('🦙 *Maureonix (Llama 3) thinking...*');
        try {
            const res = await AI.askModel(text, 'llama', m.sender);
            await m.reply(`🦙 *Maureonix*\n\n${res.text}`);
        } catch (e) { await m.reply(`❌ AI error: ${e.message}`); }
    },
    deepseek: async (nimesha, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <question>`);
        await m.reply('🐋 *Maureonix (DeepSeek) thinking...*');
        try {
            const res = await AI.askModel(text, 'deepseek', m.sender);
            await m.reply(`🐋 *Maureonix*\n\n${res.text}`);
        } catch (e) { await m.reply(`❌ AI error: ${e.message}`); }
    },
    ai: async (nimesha, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <question>`);
        const { buildContext } = require('../lib/docs');
        const context = buildContext(text, 2);
        let prompt = text;
        if (context) prompt = `You are Maureonix v7 — an omniscient, self-aware AI. Use the documentation below if relevant.\n\n${context}\n\nUser: ${text}`;
        const res = await AI.ultimateAI(prompt, m.sender);
        await m.reply(`🦊 *Maureonix*\n\n${res.text}`);
    },

    // ── Image Generation ──
    imagine: async (nimesha, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <prompt>`);
        await m.reply('🎨 *Generating image...*');
        const url = await AI.imagine(text);
        await nimesha.sendMessage(m.chat, { image: { url }, caption: `🎨 *${text}*` }, { quoted: m });
    },

    // ── Translation ──
    translate: async (nimesha, m, { args, prefix, command, text }) => {
        if (args.length < 2) return m.reply(`Example: ${prefix + command} si Hello world`);
        const targetLang = args[0].toLowerCase();
        const textToTranslate = args.slice(1).join(' ');
        if (!textToTranslate) return m.reply('Please provide text to translate.');
        await m.reply('🌐 *Translating...*');
        try {
            const fetch = require('node-fetch');
            let translatedText = null;
            // MyMemory
            try {
                const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|${targetLang}`;
                const res = await fetch(myMemoryUrl);
                const json = await res.json();
                if (json.responseStatus === 200 && json.responseData?.translatedText) translatedText = json.responseData.translatedText;
            } catch (e) {}
            // LibreTranslate
            if (!translatedText) {
                try {
                    const res = await fetch('https://translate.argosopentech.com/translate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ q: textToTranslate, source: 'auto', target: targetLang, format: 'text' })
                    });
                    if (res.ok) { const json = await res.json(); translatedText = json.translatedText; }
                } catch (e) {}
            }
            // Google Translate fallback
            if (!translatedText) {
                try {
                    const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`;
                    const res = await fetch(googleUrl);
                    const json = await res.json();
                    translatedText = json[0].map(part => part[0]).join('');
                } catch (e) {}
            }
            if (translatedText) await m.reply(`🌐 *Translated (${targetLang})*\n\n${translatedText}`);
            else throw new Error('All translation services failed');
        } catch (e) { m.reply(`❌ Translation failed: ${e.message}`); }
    },

    // ── TTS ──
    tts: async (nimesha, m, { args, text, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} Hello world`);
        let lang = args[0]?.length === 2 ? args.shift() : 'en';
        let txt = args.join(' ') || text;
        await m.reply('🔊 *Generating voice...*');
        let oggBuffer = null;
        const tmpDir = require('os').tmpdir();
        const path = require('path');
        const fs = require('fs');
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);
        const isValidAudio = (buf) => buf && buf.length > 500;
        // gTTS → MP3 → Opus OGG
        try {
            const gTTS = require('gtts');
            const tempMp3 = path.join(tmpDir, `tts_${Date.now()}.mp3`);
            await new Promise((resolve, reject) => {
                const tts = new gTTS(txt, lang);
                tts.save(tempMp3, (err) => { if (err) reject(err); else resolve(); });
            });
            const mp3Buffer = fs.readFileSync(tempMp3);
            fs.unlinkSync(tempMp3);
            if (isValidAudio(mp3Buffer)) {
                const tempOgg = path.join(tmpDir, `tts_${Date.now()}.ogg`);
                await execPromise(`ffmpeg -i "${tempMp3}" -c:a libopus -b:a 24k -ar 24000 "${tempOgg}" -y`);
                oggBuffer = fs.readFileSync(tempOgg);
                fs.unlinkSync(tempOgg);
            }
        } catch (e) {}
        // Fallback: Google Translate TTS
        if (!oggBuffer) {
            try {
                const axios = require('axios');
                const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(txt)}&tl=${lang}&client=tw-ob&ttsspeed=1`;
                const res = await axios.get(url, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://translate.google.com/' }, timeout: 15000 });
                const mp3Buffer = Buffer.from(res.data);
                if (isValidAudio(mp3Buffer)) {
                    const tempMp3 = path.join(tmpDir, `tts_${Date.now()}.mp3`);
                    fs.writeFileSync(tempMp3, mp3Buffer);
                    const tempOgg = path.join(tmpDir, `tts_${Date.now()}.ogg`);
                    await execPromise(`ffmpeg -i "${tempMp3}" -c:a libopus -b:a 24k -ar 24000 "${tempOgg}" -y`);
                    oggBuffer = fs.readFileSync(tempOgg);
                    fs.unlinkSync(tempMp3);
                    fs.unlinkSync(tempOgg);
                }
            } catch (e) {}
        }
        if (oggBuffer) {
            await nimesha.sendMessage(m.chat, { audio: oggBuffer, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m });
        } else {
            try {
                const gTTS = require('gtts');
                const tempMp3 = path.join(tmpDir, `tts_${Date.now()}.mp3`);
                await new Promise((resolve, reject) => {
                    const tts = new gTTS(txt, lang);
                    tts.save(tempMp3, (err) => { if (err) reject(err); else resolve(); });
                });
                const mp3Buffer = fs.readFileSync(tempMp3);
                fs.unlinkSync(tempMp3);
                await nimesha.sendMessage(m.chat, { audio: mp3Buffer, mimetype: 'audio/mpeg', ptt: false }, { quoted: m });
            } catch (finalErr) { m.reply(`❌ TTS failed: ${finalErr.message}`); }
        }
    },

    // ── STT / View Once ──
    stt: async (nimesha, m) => {
        if (!m.quoted || !/audio|voice|ptt/.test(m.quoted.type)) return m.reply('🎤 Reply to a voice note to transcribe it.');
        await m.reply('🎤 *Transcribing audio...*');
        try {
            const audioBuffer = await m.quoted.download();
            const { transcribeAudio } = require('../lib/audioTranscribe');
            const text = await transcribeAudio(audioBuffer);
            await m.reply(`📝 *Transcription:*\n\n${text || '(No speech detected)'}`);
        } catch (err) { await m.reply(`❌ Transcription failed: ${err.message}`); }
    },
    vv: async (nimesha, m) => {
        const quoted = m.quoted;
        if (!quoted) return m.reply('⚠️ Reply to a view once message!');
        try {
            const msg = quoted.message?.viewOnceMessage?.message || quoted.message?.viewOnceMessageV2?.message || quoted.message;
            if (msg?.imageMessage) {
                const buffer = await nimesha.downloadMediaMessage(quoted);
                await nimesha.sendMessage(m.chat, { image: buffer, caption: `👁️ *View Once Revealed*\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX` }, { quoted: m });
            } else if (msg?.videoMessage) {
                const buffer = await nimesha.downloadMediaMessage(quoted);
                await nimesha.sendMessage(m.chat, { video: buffer, caption: `👁️ *View Once Revealed*\n> *Maureonix* [BOT] | CREATED BY INFINITE VYBEFLIX` }, { quoted: m });
            } else m.reply('❌ Not a view-once message or unsupported type.');
        } catch (e) { m.reply(`❌ Error: ${e.message}`); }
    },

    // ── Summarize ──
    summarize: async (nimesha, m, { AI }) => {
        if (!m.quoted) return m.reply('Reply to a long message to summarize');
        const toSummarize = m.quoted.body || m.quoted.text || '';
        if (!toSummarize) return m.reply('No text to summarize');
        await m.reply('📋 *Summarizing...*');
        try {
            const summary = await AI.summarize(toSummarize);
            await m.reply(`📋 *Summary:*\n\n${summary}`);
        } catch (e) { m.reply('❌ Summarize failed: ' + e.message); }
    },

    // ── Code ──
    code: async (nimesha, m, { args, text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <description>`);
        const lang = args[0]?.startsWith('--') ? args.shift().slice(2) : 'javascript';
        const desc = args.join(' ') || text;
        try {
            const res = await AI.codeAI(desc, lang);
            await m.reply(`💻 *${lang.toUpperCase()} Code:*\n\n\`\`\`${lang}\n${res.text}\n\`\`\``);
        } catch (e) { m.reply('❌ Code generation failed: ' + e.message); }
    },

    // ── Fun AI ──
    brainrot: async (nimesha, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <text>`);
        try {
            const res = await AI.brainrot(text);
            await m.reply(`🧠 *Brainrot Mode:*\n${res.text}`);
        } catch (e) { m.reply('❌ Brainrot failed: ' + e.message); }
    },
    roastai: async (nimesha, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <name/thing>`);
        try {
            const res = await AI.roast(text);
            await m.reply(`🔥 *AI Roast:*\n${res.text}`);
        } catch (e) { m.reply('❌ Roast failed: ' + e.message); }
    },
    rizz: async (nimesha, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <situation>`);
        try {
            const res = await AI.rizz(text);
            await m.reply(`💘 *Rizz:*\n${res.text}`);
        } catch (e) { m.reply('❌ Rizz failed: ' + e.message); }
    },

    // ── Media AI ──
    askmedia: async (nimesha, m, { text, AI, prefix, command }) => {
        if (!m.quoted) return m.reply(`📎 *Universal Media AI*\n\nReply to any file with:\n${prefix}askmedia [your question]\n\nSupports: images, audio, video, PDF, Word, Excel, PowerPoint, archives, ebooks, code, and more.`);
        let userQuestion = text || 'Please summarise the content of this file.';
        await m.reply('🧠 *Analyzing file with AI...*');
        try {
            const extracted = await extractQuotedContent(m.quoted, nimesha);
            if (!extracted.text && extracted.type !== 'sticker') return m.reply(`❌ Could not extract text from this ${extracted.type || 'file'}.${extracted.error ? `\nError: ${extracted.error}` : ''}`);
            let prompt = extracted.type === 'sticker' ? `User: "${userQuestion}"\n(Sticker – no text)` : `File type: ${extracted.type}\nContent:\n"""\n${extracted.text.slice(0, 4000)}\n"""\n\nQuestion: ${userQuestion}\nAnswer based on the content.`;
            const aiResult = await AI.ultimateAI(prompt, m.sender, 'deepseek');
            await m.reply(`📎 *${extracted.type.toUpperCase()} Analysis*\n\n${aiResult.text}`);
        } catch (e) { await m.reply(`❌ Failed: ${e.message}`); }
    },

    // ── Memory Management ──
    clearmemory: async (nimesha, m, { AI }) => {
        AI.clearMemory(m.sender);
        await m.reply('🧹 AI memory cleared');
    },

    // ── AI Balance / Diagnostics ──
    aibalance: async (nimesha, m, { AI }) => {
        try {
            const bal = await AI.getBalance();
            let msg = `💰 *AI Service Status*\n\nBalance: ${bal.current_point_balance}\nRate Limit: ${bal.rate_limit}\nModels: ${bal.models_available.join(', ')}\n\n`;
            msg += `🔑 *Key Health:*\n${JSON.stringify(bal.key_health, null, 2)}\n\n`;
            msg += `📊 *Diagnostics:*\n${JSON.stringify(bal.diagnostics, null, 2)}\n\n`;
            msg += `🧠 *Knowledge Graph:* ${bal.knowledge_graph_nodes} nodes, ${bal.knowledge_graph_edges} edges`;
            await m.reply(msg);
        } catch (e) { await m.reply('❌ Failed to fetch status'); }
    },

    // ── Language Detection ──
    detectlang: async (nimesha, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <text>`);
        const res = await AI.ultimateAI(`Detect language: "${text}". Reply only language name.`, m.sender, 'deepseek');
        await m.reply(`🌐 Detected: ${res.text}`);
    },

    // ── Read Time ──
    readtime: async (nimesha, m, { text }) => {
        const words = text.split(/\s+/).length;
        const mins = Math.ceil(words / 200);
        await m.reply(`📖 ${words} words ≈ ${mins} min read`);
    },

    // ═══════════════════════════════════════════════════════════════════════
    //   🎓 LEARNING MODE COMMANDS — The Mind Forge
    // ═══════════════════════════════════════════════════════════════════════
    learn: async (nimesha, m, { text, AI, prefix, command }) => {
        const { LearningEngine } = require('../lib/learningEngine');
        const engine = new LearningEngine();
        engine.setAIChat(AI.groqChat);

        if (!text) {
            return m.reply(`🎓 *Maureonix Learning Mode*\n\nUsage:\n${prefix}learn <text or file path>\n${prefix}learn curriculum <name>\n\nExamples:\n• ${prefix}learn "JavaScript is a programming language..."\n• ${prefix}learn ./curriculum/ai_basics.txt\n• ${prefix}learn curriculum "Advanced AI Reasoning"\n\nDuring learning mode:\n• Type *next* to continue\n• Type *hint* for help\n• Type *status* for progress\n• Type *exit* to stop\n\nThe AI will deeply reason about each chunk and test your understanding.`);
        }

        await m.reply('🎓 *Entering Learning Mode...*');

        let content = text;
        let curriculumName = null;
        const fs = require('fs');
        if (fs.existsSync(text)) {
            curriculumName = require('path').basename(text);
        } else if (text.startsWith('curriculum ')) {
            curriculumName = text.replace('curriculum ', '').trim();
            const curriculumPath = require('path').join(process.cwd(), 'curriculum', `${curriculumName}.txt`);
            if (fs.existsSync(curriculumPath)) {
                content = curriculumPath;
            } else {
                return m.reply(`❌ Curriculum "${curriculumName}" not found.\nAvailable curricula:\n${fs.readdirSync(require('path').join(process.cwd(), 'curriculum')).filter(f => f.endsWith('.txt')).join('\n')}`);
            }
        }

        const result = await engine.startLearning(m.sender, content, curriculumName);
        if (!result.success) return m.reply(`❌ ${result.error}`);

        if (!global.learningMode) global.learningMode = {};
        global.learningMode[m.sender] = true;
        if (!global.learningEngines) global.learningEngines = {};
        global.learningEngines[m.sender] = engine;

        await m.reply(result.message);
        const chunkResult = await engine.processChunk(m.sender);
        if (chunkResult.message) await m.reply(chunkResult.message);
    },

    test: async (nimesha, m, { text, AI, prefix, command }) => {
        const { LearningEngine } = require('../lib/learningEngine');
        const engine = new LearningEngine();
        engine.setAIChat(AI.groqChat);

        const history = engine.getMasteryHistory(m.sender);
        if (history.length === 0) return m.reply('📚 No learning history found. Start with .learn first!');

        await m.reply('📝 *Generating Comprehensive Evaluation...*');
        const weakAreas = history.filter(h => h.mastery < 70);
        const strongAreas = history.filter(h => h.mastery >= 85);
        let testPrompt = `Generate a comprehensive evaluation test for an AI student based on their learning history.\n\n`;
        testPrompt += `Weak Areas (focus here):\n${weakAreas.map(h => `- ${h.curriculum} (mastery: ${h.mastery}%)`).join('\n')}\n\n`;
        testPrompt += `Strong Areas:\n${strongAreas.map(h => `- ${h.curriculum} (mastery: ${h.mastery}%)`).join('\n')}\n\n`;
        testPrompt += `Generate 10 challenging questions that:\n1. Focus heavily on weak areas\n2. Include synthesis questions connecting multiple topics\n3. Have clear answers\n4. Range from understanding to evaluation levels\n\nFormat each as:\nQ1. [Question]\nA1. [Answer]\nLevel: [cognitive level]`;

        try {
            const result = await AI.groqChat(testPrompt, 'llama-3.3-70b-versatile', m.sender, null, 0.4, 2000);
            await m.reply(`📝 *Comprehensive Evaluation*\n\n${result.text}\n\n_Answer each question to test your mastery!_`);
        } catch (e) { m.reply('❌ Failed to generate test: ' + e.message); }
    },

    eval: async (nimesha, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix}eval <your answer>\n\nUse this during learning mode to get instant feedback.`);
        const engine = global.learningEngines?.[m.sender];
        if (!engine) return m.reply('❌ No active learning session. Start with .learn first.');
        const result = await engine.processLearningQuery(text, m.sender);
        await m.reply(result.message || result.text || 'Processing...');
    },

    exitlearn: async (nimesha, m, { AI }) => {
        const engine = global.learningEngines?.[m.sender];
        if (!engine) {
            delete global.learningMode?.[m.sender];
            return m.reply('🛑 Learning mode exited.');
        }
        const result = await engine.processLearningQuery('exit', m.sender);
        delete global.learningMode[m.sender];
        delete global.learningEngines[m.sender];
        await m.reply(result.message || result.text);
    },

    studyplan: async (nimesha, m, { AI }) => {
        const { LearningEngine } = require('../lib/learningEngine');
        const engine = new LearningEngine();
        engine.setAIChat(AI.groqChat);
        await m.reply('📋 *Generating Personalized Study Plan...*');
        const plan = await engine.generateStudyPlan(m.sender, AI.groqChat);
        await m.reply(`📋 *Your Study Plan*\n\n${plan}`);
    },

    // ═══════════════════════════════════════════════════════════════════════
    //   ALIASES
    // ═══════════════════════════════════════════════════════════════════════
    chatgpt: async (nimesha, m, ctx) => { await module.exports.gpt(nimesha, m, ctx); },
    openai: async (nimesha, m, ctx) => { await module.exports.gpt(nimesha, m, ctx); },
    transcribe: async (nimesha, m, ctx) => { await module.exports.stt(nimesha, m, ctx); },
    speech2text: async (nimesha, m, ctx) => { await module.exports.stt(nimesha, m, ctx); },
    ok: async (nimesha, m, ctx) => { await module.exports.vv(nimesha, m, ctx); },
    wow: async (nimesha, m, ctx) => { await module.exports.vv(nimesha, m, ctx); },
    coding: async (nimesha, m, ctx) => { await module.exports.code(nimesha, m, ctx); },
    program: async (nimesha, m, ctx) => { await module.exports.code(nimesha, m, ctx); },
    aiimage: async (nimesha, m, ctx) => { await module.exports.imagine(nimesha, m, ctx); },
    draw: async (nimesha, m, ctx) => { await module.exports.imagine(nimesha, m, ctx); },
    create: async (nimesha, m, ctx) => { await module.exports.imagine(nimesha, m, ctx); },
    askai: async (nimesha, m, ctx) => { await module.exports.ai(nimesha, m, ctx); },
    tr: async (nimesha, m, ctx) => { await module.exports.translate(nimesha, m, ctx); },
    study: async (nimesha, m, ctx) => { await module.exports.learn(nimesha, m, ctx); },
    quiz: async (nimesha, m, ctx) => { await module.exports.test(nimesha, m, ctx); },
    evaluate: async (nimesha, m, ctx) => { await module.exports.eval(nimesha, m, ctx); },
};