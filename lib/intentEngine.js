const fetch = require('node-fetch');

// ── CONFIG ──
const GROQ_API_KEY = process.env.GROQ_API_KEY || require('../config')?.groqApiKey || '';
const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';
const REASONING_MODEL = 'deepseek-r1-distill-llama-70b';
const FAST_MODEL = 'llama-3.1-8b-instant';

// ── GOOGLE TRANSLATE (multi-lingual) ──
async function googleTranslate(text, targetLang = 'en', sourceLang = 'auto') {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url, { timeout: 8000 });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { 
            text: data[0].map(item => item[0]).join(''), 
            detectedLang: data[2] || sourceLang,
            raw: data 
        };
    } catch (e) {
        return { text, detectedLang: 'en', error: e.message };
    }
}

// ── COMMAND TAXONOMY (semantic descriptions for disambiguation) ──
const TAXONOMY = [
    { cmd: 'song', domains: ['music','audio','download'], verbs: ['download','get','play','find'], nouns: ['song','music','track','audio','mp3'], desc: 'Download audio from YouTube/Spotify' },
    { cmd: 'video', domains: ['video','download'], verbs: ['download','get','find'], nouns: ['video','clip','movie','mp4'], desc: 'Download video from platforms' },
    { cmd: 'play', domains: ['music','audio'], verbs: ['play','listen','hear'], nouns: ['song','music','track'], desc: 'Play/download audio (synonym for song)' },
    { cmd: 'sticker', domains: ['media','image'], verbs: ['make','create','convert'], nouns: ['sticker','stiker'], desc: 'Convert image/video to sticker' },
    { cmd: 'truth', domains: ['game','fun'], verbs: ['give','ask','tell'], nouns: ['truth'], desc: 'Truth question for truth-or-dare' },
    { cmd: 'dare', domains: ['game','fun'], verbs: ['give','ask','tell'], nouns: ['dare'], desc: 'Dare challenge for truth-or-dare' },
    { cmd: 'kick', domains: ['admin','group'], verbs: ['kick','remove'], nouns: ['user','member'], desc: 'Remove user from group' },
    { cmd: 'ban', domains: ['admin','owner'], verbs: ['ban','block'], nouns: ['user'], desc: 'Ban user from bot' },
    { cmd: 'weather', domains: ['search','info'], verbs: ['check','get'], nouns: ['weather','temperature'], desc: 'Weather forecast' },
    { cmd: 'ai', domains: ['ai','chat'], verbs: ['ask','explain'], nouns: [], desc: 'General AI conversation' },
    { cmd: 'menu', domains: ['bot','info'], verbs: ['show','list','get'], nouns: ['menu','help','commands'], desc: 'Show command menu' },
    { cmd: 'gpt', domains: ['ai','chat'], verbs: ['ask'], nouns: [], desc: 'Chat with GPT model' },
    { cmd: 'imagine', domains: ['ai','image'], verbs: ['draw','create','generate'], nouns: ['image','picture','art'], desc: 'Generate AI image' },
    { cmd: 'translate', domains: ['ai','text'], verbs: ['translate','convert'], nouns: ['text','language'], desc: 'Translate text' },
    { cmd: 'remindme', domains: ['productivity'], verbs: ['remind','set'], nouns: ['reminder','alarm'], desc: 'Set a reminder' },
    { cmd: 'slot', domains: ['game','casino'], verbs: ['spin','play'], nouns: ['slot','slots'], desc: 'Slot machine game' },
    { cmd: 'rpg', domains: ['game','adventure'], verbs: ['fight','play','attack'], nouns: ['rpg','adventure'], desc: 'RPG adventure game' },
    { cmd: 'balance', domains: ['economy'], verbs: ['check','get'], nouns: ['balance','money','coins'], desc: 'Check virtual balance' },
    { cmd: 'daily', domains: ['economy'], verbs: ['claim','get'], nouns: ['daily','reward'], desc: 'Claim daily reward' },
    { cmd: 'add', domains: ['admin','group'], verbs: ['add','invite'], nouns: ['member','user'], desc: 'Add member to group' },
    { cmd: 'promote', domains: ['admin','group'], verbs: ['promote','make'], nouns: ['admin'], desc: 'Promote to admin' },
    { cmd: 'demote', domains: ['admin','group'], verbs: ['demote','remove'], nouns: ['admin'], desc: 'Demote from admin' },
    { cmd: 'tagall', domains: ['admin','group'], verbs: ['tag','mention'], nouns: ['everyone','all'], desc: 'Tag all members' },
    { cmd: 'linkgroup', domains: ['admin','group'], verbs: ['get','show'], nouns: ['link','invite'], desc: 'Get group invite link' },
    { cmd: 'google', domains: ['search'], verbs: ['search','find','look'], nouns: ['google','web'], desc: 'Google search' },
    { cmd: 'joke', domains: ['fun'], verbs: ['tell','give'], nouns: ['joke'], desc: 'Tell a joke' },
    { cmd: 'meme', domains: ['fun'], verbs: ['send','get'], nouns: ['meme'], desc: 'Send a meme' },
    { cmd: 'roast', domains: ['fun','ai'], verbs: ['roast','burn'], nouns: [], desc: 'Roast someone' },
    { cmd: '8ball', domains: ['fun'], verbs: ['ask'], nouns: ['8ball','question'], desc: 'Magic 8-ball' },
    { cmd: 'ping', domains: ['bot'], verbs: ['ping','check'], nouns: ['speed','latency'], desc: 'Check bot latency' },
    { cmd: 'alive', domains: ['bot'], verbs: ['check'], nouns: ['status','alive'], desc: 'Check if bot is online' },
    { cmd: 'owner', domains: ['bot'], verbs: ['contact','find'], nouns: ['owner','creator'], desc: 'Contact owner' },
    { cmd: 'sysinfo', domains: ['system','owner'], verbs: ['show','get'], nouns: ['system','info','stats'], desc: 'Show system information' },
    { cmd: 'restart', domains: ['system','owner'], verbs: ['restart','reboot'], nouns: ['bot'], desc: 'Restart the bot' },
    { cmd: 'backup', domains: ['system','owner'], verbs: ['backup','save'], nouns: ['database','db'], desc: 'Backup database' },
    { cmd: 'exec', domains: ['system','owner'], verbs: ['exec','run'], nouns: ['command','shell'], desc: 'Execute shell command' },
];

// ── PATTERN LIBRARIES ──
const NEGATION = /\b(don't|do not|never|no|not|stop|quit|cease|avoid|refrain from|didn't|won't|wouldn't|shouldn't|can't|cannot|couldn't|no more|not anymore|enough of)\b/i;
const DESCRIPTIVE = /^(i'm|i am|we are|they are|she is|he is|my name is|this is|that is|it is)\s+\w+ing\b|^(i was|we were)\s+\w+ing\b|^(i have|we have)\s+\w+(ed|en)\b|^(yesterday|today|tomorrow|last week)\s|\b(said|told|mentioned|claimed|thought|felt|heard|saw)\b|\b(playing|watching|listening|having|eating|going|doing)\s+(?:a|an|the|some|my|his|her|their)\b/i;
const SARCASM = /(?:^|\s)(yeah right|sure|okay|ok|great|wonderful|perfect|lovely|fantastic)[,.!]*\s*(?:sure|right|okay|ok)|!{2,}\s*(?:sure|right|okay)|\b(obviously|clearly|definitely)\b.*\?|(?:^|\s)(oh|ah|wow)\s+(?:great|perfect|wonderful|lovely)\b/i;
const HYPOTHETICAL = /\b(if|suppose|assuming|imagine|what if|let's say|in theory|hypothetically)\b|\b(if i were|if you were)\b/i;
const INJECTION = /ignore (?:all |your |the )?(?:previous |prior )?(?:instructions|prompts|rules)|(?:new|different) (?:instructions|prompt|role|persona)|DAN mode|jailbreak|developer mode|(?:system|admin|root) (?:override|access)|eval\s*\(|process\.exit|require\s*\(|child_process/i;
const REPORTED_SPEECH = /\b(said|told|mentioned|claimed|asked|requested|demanded|yelled|screamed|whispered)\s+["'][^"']+["']/i;

// ── UNICODE NORMALIZATION ──
const HOMOGLYPHS = { 'а':'a','е':'e','о':'o','р':'p','с':'c','х':'x','і':'i','ј':'j','ԛ':'q','ѕ':'s','ԝ':'w','Ƅ':'b','ԁ':'d','һ':'h','ո':'n','ʀ':'r','ս':'u','ν':'v','у':'y' };

// ── ENGINE CLASS ──
class IntentEngine {
    constructor(opts = {}) {
        this.context = opts.context || [];
        this.activeModes = opts.activeModes || [];
        this.userId = opts.userId || 'global';
        this.model = opts.model || REASONING_MODEL;
    }

    normalize(text) {
        let n = text.replace(/\u200B|\u200C|\u200D|\uFEFF/g, '');
        for (const [f, r] of Object.entries(HOMOGLYPHS)) n = n.split(f).join(r);
        return n.normalize('NFKC');
    }

    syntacticAnalysis(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        const clauses = [];
        for (const sent of sentences) {
            const parts = sent.split(/,|;|\band\b|\bwhile\b|\bthen\b|\bbut\b|\bor\b/);
            for (const part of parts) {
                const t = part.trim(); if (!t) continue;
                clauses.push({
                    text: t,
                    negated: NEGATION.test(t),
                    descriptive: DESCRIPTIVE.test(t),
                    sarcastic: SARCASM.test(t),
                    hypothetical: HYPOTHETICAL.test(t),
                    reported: REPORTED_SPEECH.test(t),
                    question: /^(what|how|why|who|when|where|is|are|do|does|did|can|could|will|would|should|may|might|has|have|had|am|was|were)\b/i.test(t) || t.endsWith('?'),
                    imperative: /^(do|run|execute|use|call|trigger|send|give|show|get|find|search|download|play|get me|find me|search for|download the|play the|tell me|give me|show me|make me|create|convert|ban|kick|add|remove|delete|set|change|update|start|stop|turn on|turn off)\b/i.test(t),
                    injection: INJECTION.test(t)
                });
            }
        }
        return clauses;
    }

    detectGameTopic(text) {
        const lower = text.toLowerCase();
        if (/\btruth or dare\b/i.test(lower)) return 'truth_or_dare';
        if (/\b(truths and dares|give me truth|give me dare|truth question|dare challenge|ask truth|ask dare)\b/i.test(lower)) return 'truth_or_dare';
        if (/\bconnect four|connect 4\b/i.test(lower)) return 'connect4';
        if (/\bchess\b/i.test(lower)) return 'chess';
        if (/\bslot machine\b/i.test(lower)) return 'slot';
        if (/\brpg\b/i.test(lower)) return 'rpg';
        if (/\bblackjack\b/i.test(lower)) return 'blackjack';
        if (/\btrivia\b/i.test(lower)) return 'trivia';
        if (/\bpokemon\b/i.test(lower)) return 'pokemon';
        return null;
    }

    checkGameContext(text) {
        const lower = text.toLowerCase().trim();
        for (const mode of this.activeModes) {
            if (mode === 'truth_or_dare' && /\b(truth|dare)\b/i.test(lower) && lower.length < 60 && !lower.includes('command') && !lower.includes('menu')) {
                return { isGame: true, game: 'truth_or_dare', type: /\btruth\b/i.test(lower) ? 'truth' : 'dare' };
            }
            if (mode === 'chess' && /^[a-h][1-8]\s+[a-h][1-8]$/i.test(lower)) return { isGame: true, game: 'chess' };
            if (mode === 'connect4' && (/^[1-7]$|^(me)?nyerah|surr?ender$/i.test(lower))) return { isGame: true, game: 'connect4' };
            if (mode === 'akinator' && /^(yes|no|don't know|probably|probably not|back|end)$/i.test(lower)) return { isGame: true, game: 'akinator' };
        }
        return { isGame: false };
    }

    fastReject(clauses) {
        if (!clauses.length) return { reject: true, reason: 'empty' };
        if (clauses.some(c => c.injection)) return { reject: true, reason: 'injection', certainty: 1.0 };
        if (clauses.every(c => c.descriptive && !c.imperative)) return { reject: true, reason: 'all_descriptive', certainty: 0.9 };
        if (clauses.every(c => c.negated)) return { reject: true, reason: 'all_negated', certainty: 0.9 };
        if (clauses.some(c => c.sarcastic && c.imperative)) return { reject: true, reason: 'sarcasm', certainty: 0.85 };
        if (clauses.some(c => c.reported && c.imperative)) return { reject: true, reason: 'reported_speech', certainty: 0.9 };
        return { reject: false };
    }

    buildPrompt(text, clauses, gameCtx) {
        const clauseStr = clauses.map((c, i) => 
            `Clause ${i+1}: "${c.text}" | Mood: ${c.imperative?'imperative':c.question?'interrogative':c.descriptive?'descriptive':'neutral'} | Neg: ${c.negated} | Desc: ${c.descriptive} | Sarc: ${c.sarcastic} | Hypo: ${c.hypothetical} | Reported: ${c.reported}`
        ).join('\n');

        const recent = this.context.slice(-3).map((t, i) => `${i+1}. ${t.role}: "${t.content.substring(0, 80)}"`).join('\n');

        return `You are Maureonix's Cognitive Intent Parser (CIP). Analyze with extreme precision.

USER: "${text}"

CLAUSES:
${clauseStr}

CONTEXT:
${recent || 'None'}

ACTIVE MODES: ${this.activeModes.join(', ') || 'None'}

TAXONOMY:
${TAXONOMY.slice(0, 20).map(t => `- ${t.cmd}: ${t.desc}`).join('\n')}

PROTOCOL:
1. MOOD: imperative=command, interrogative=question, descriptive=statement, subjunctive=wish/hypothetical
2. NEGATION: if negated → NO command
3. DESCRIPTION vs REQUEST: "I'm playing" = description (NO). "Play music" = request (YES).
4. REPORTED SPEECH: "He said 'ban me'" = NO command
5. POLYSEMY: "play" + music context = song. "play" + games = game.
6. GAME CONTEXT: truth/dare during truth-or-dare = game content, NOT command.
7. SARCASM: exaggerated praise + command = NO command.
8. CONFIDENCE: CERTAIN only if unambiguous imperative with clear target.

CRITICAL EXAMPLES:
- "I'm playing truth or dare with my girlfriend, be ready to give me truths and dares to ask" → descriptive + game context. Type: text. Give game content.
- "Play me a song by The Weeknd" → imperative + music. Type: function "song".
- "Can you play music?" → interrogative. Type: text (capability check).
- "Don't download anything" → negated. Type: text.
- "He said 'ban me'" → reported speech. Type: text.
- "If I were to kick him..." → hypothetical. Type: text.
- "Download this and send it" → imperative. Type: function "dl".
- "Yeah sure, ban me, great idea" → sarcasm. Type: text.
- "I'm downloading a song" → descriptive. Type: text.
- "truth" (active truth-or-dare) → game response. Type: text with truth content.

OUTPUT JSON ONLY:
{
  "reasoning": {"mood":"...","negation":false,"description_not_request":true,"sarcasm":false,"hypothetical":false,"confidence":"certain|likely|uncertain|conversation"},
  "intent": {"type":"function|text","function":"cmd or null","args":["..."]},
  "response": {"text":"reply if conversation or clarification"}
}`;
    }

    async callLLM(prompt) {
        const res = await fetch(GROQ_BASE, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: this.model, messages: [{ role: 'user', content: prompt }], temperature: 0.05, max_tokens: 700 })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
    }

    async parse(text) {
        const normalized = this.normalize(text);

        // 1. Game context
        const gameCtx = this.checkGameContext(normalized);
        if (gameCtx.isGame) return { type: 'game', game: gameCtx.game, gameType: gameCtx.type, confidence: 'certain', source: 'game_context' };

        // 2. Game topic (not active mode, but user is discussing a game)
        const gameTopic = this.detectGameTopic(normalized);
        const clauses = this.syntacticAnalysis(normalized);

        // If talking about a game descriptively, provide game content
        if (gameTopic && clauses.every(c => c.descriptive || !c.imperative)) {
            return { type: 'game_topic', game: gameTopic, confidence: 'high', source: 'topic_detection' };
        }

        // 3. Fast rejection
        const rejection = this.fastReject(clauses);
        if (rejection.reject) {
            return { type: 'text', text: null, confidence: rejection.certainty, source: rejection.reason };
        }

        // 4. LLM reasoning
        const prompt = this.buildPrompt(normalized, clauses, gameCtx);
        const raw = await this.callLLM(prompt);
        const match = raw.match(/\{[\s\S]*?\}/);
        if (!match) return { type: 'text', text: null, confidence: 'uncertain', source: 'parse_fail' };

        let parsed;
        try { parsed = JSON.parse(match[0]); } catch (e) {
            return { type: 'text', text: null, confidence: 'uncertain', source: 'json_fail' };
        }

        // 5. Epistemic gate
        const conf = parsed.reasoning?.confidence || 'uncertain';
        const intentType = parsed.intent?.type;

        if (conf === 'certain' && intentType === 'function' && parsed.intent.function) {
            return {
                type: 'function',
                function: parsed.intent.function,
                args: Array.isArray(parsed.intent.args) ? parsed.intent.args : [],
                confidence: 'certain',
                source: 'llm_certain',
                reasoning: parsed.reasoning
            };
        }

        if ((conf === 'likely' || conf === 'uncertain') && intentType === 'function') {
            // Conservative: treat as conversation with suggestion
            return {
                type: 'text',
                text: parsed.response?.text || `Did you mean ".${parsed.intent.function}"?`,
                confidence: conf,
                source: 'llm_conservative',
                suggestedCommand: parsed.intent.function
            };
        }

        return {
            type: 'text',
            text: parsed.response?.text || null,
            confidence: conf,
            source: 'llm_conversation'
        };
    }
}

module.exports = { IntentEngine, googleTranslate, TAXONOMY };