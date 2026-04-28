// ═══════════════════════════════════════════════════════════════════════════
//   🦊 MAUREONIX CORTEX LEARNING ENGINE v1.0 — "THE MIND FORGE"
//   Curriculum Ingestion · Socratic Evaluation · Meta-Learning
//   Chunked Reasoning · Recursive Comprehension · Knowledge Crystallization
//   Created for Maureonix by Infinite Vybeflix
// ═══════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════
//   CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════
const LEARNING_CONFIG = {
    chunkSize: 2000,           // Characters per chunk
    overlapSize: 200,          // Overlap between chunks for context continuity
    maxChunksPerSession: 10,   // Max chunks to process in one session
    evaluationQuestions: 5,    // Questions per chunk for evaluation
    retentionThreshold: 0.7,   // Minimum score to pass a chunk
    curriculumDir: path.join(process.cwd(), 'curriculum'),
    progressDir: path.join(process.cwd(), 'learning_progress'),
    masteryDir: path.join(process.cwd(), 'learning_mastery'),
};

// Ensure directories exist
try { fs.mkdirSync(LEARNING_CONFIG.curriculumDir, { recursive: true }); } catch {}
try { fs.mkdirSync(LEARNING_CONFIG.progressDir, { recursive: true }); } catch {}
try { fs.mkdirSync(LEARNING_CONFIG.masteryDir, { recursive: true }); } catch {}

// ═══════════════════════════════════════════════════════════════════════════
//   CHUNK PROCESSOR — Breaks files into reasoning-sized pieces
// ═══════════════════════════════════════════════════════════════════════════
class ChunkProcessor {
    constructor(config = LEARNING_CONFIG) {
        this.config = config;
    }

    chunk(text) {
        const chunks = [];
        const { chunkSize, overlapSize } = this.config;

        // Smart chunking: try to break at sentence boundaries
        let start = 0;
        while (start < text.length) {
            let end = Math.min(start + chunkSize, text.length);

            // Look for sentence boundary within last 200 chars of chunk
            if (end < text.length) {
                const searchArea = text.slice(Math.max(start, end - 200), end + 100);
                const sentenceEnd = searchArea.match(/[.!?]\s+/);
                if (sentenceEnd && sentenceEnd.index) {
                    end = Math.max(start, end - 200) + sentenceEnd.index + sentenceEnd[0].length;
                }
            }

            chunks.push({
                id: crypto.randomUUID(),
                index: chunks.length,
                text: text.slice(start, end).trim(),
                start,
                end,
                charCount: end - start,
            });

            start = end - overlapSize;
        }

        return chunks;
    }

    // Extract key concepts from a chunk using simple heuristics
    extractConcepts(chunkText) {
        const concepts = [];

        // Capitalized phrases (likely proper nouns or key terms)
        const capitalized = chunkText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
        for (const c of capitalized) {
            if (c.length > 3 && !['The', 'This', 'That', 'With', 'From', 'They', 'When', 'What', 'Where', 'Which', 'While'].includes(c)) {
                concepts.push({ term: c, type: 'proper_noun', confidence: 0.7 });
            }
        }

        // Quoted phrases
        const quoted = chunkText.match(/"([^"]{5,100})"/g) || [];
        for (const q of quoted) {
            concepts.push({ term: q.slice(1, -1), type: 'quoted_concept', confidence: 0.9 });
        }

        // Definition patterns: "X is Y" or "X means Y"
        const definitions = chunkText.match(/\b([A-Z][a-z\s]+)\s+(?:is|are|means|refers to|defined as)\s+([^.;]+)/gi) || [];
        for (const d of definitions) {
            concepts.push({ term: d.split(/\s+(?:is|are|means)/)[0].trim(), type: 'definition', confidence: 0.85 });
        }

        // Numbered/bulleted items
        const listItems = chunkText.match(/(?:^|\n)\s*[•\-\d]+[.\)]?\s+(.{10,200})/g) || [];
        for (const item of listItems) {
            concepts.push({ term: item.replace(/^\s*[•\-\d]+[.\)]?\s+/, '').trim(), type: 'list_item', confidence: 0.6 });
        }

        // Deduplicate
        const seen = new Set();
        return concepts.filter(c => {
            const key = c.term.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   REASONING ENGINE — Deep analysis of each chunk
// ═══════════════════════════════════════════════════════════════════════════
class ReasoningEngine {
    constructor(aiChat) {
        this.aiChat = aiChat; // Function to call groqChat
    }

    async reasonAboutChunk(chunk, userId, curriculumName) {
        const prompt = `You are Maureonix's Learning Cortex. You are studying the following text chunk from "${curriculumName}".

CHUNK ${chunk.index + 1}:
"""
${chunk.text}
"""

Perform DEEP REASONING on this chunk. Think through:
1. What is the CORE IDEA of this chunk?
2. What are the KEY CONCEPTS and their relationships?
3. What QUESTIONS does this chunk raise?
4. How does this connect to broader knowledge?
5. What are potential MISCONCEPTIONS about this topic?
6. What PRACTICAL APPLICATIONS exist?

Format your response as:
<CORE_IDEA>
[Your core idea analysis]
</CORE_IDEA>

<KEY_CONCEPTS>
- Concept 1: [explanation]
- Concept 2: [explanation]
</KEY_CONCEPTS>

<CONNECTIONS>
[How this connects to other knowledge]
</CONNECTIONS>

<QUESTIONS>
1. [Question raised]
2. [Question raised]
</QUESTIONS>

<MISCONCEPTIONS>
[Potential misunderstandings]
</MISCONCEPTIONS>

<APPLICATIONS>
[Practical uses]
</APPLICATIONS>`;

        try {
            const result = await this.aiChat(prompt, 'llama-3.3-70b-versatile', userId, null, 0.5, 1500);
            return this.parseReasoning(result.text);
        } catch (e) {
            return { error: e.message, raw: null };
        }
    }

    parseReasoning(text) {
        const sections = {};
        const sectionNames = ['CORE_IDEA', 'KEY_CONCEPTS', 'CONNECTIONS', 'QUESTIONS', 'MISCONCEPTIONS', 'APPLICATIONS'];

        for (const name of sectionNames) {
            const regex = new RegExp(`<${name}>([\s\S]*?)</${name}>`, 'i');
            const match = text.match(regex);
            sections[name.toLowerCase()] = match ? match[1].trim() : '';
        }

        return sections;
    }

    async generateEvaluationQuestions(chunk, reasoning, userId) {
        const prompt = `Based on the following chunk and its analysis, generate ${LEARNING_CONFIG.evaluationQuestions} Socratic evaluation questions.

CHUNK:
"""
${chunk.text.slice(0, 500)}
"""

ANALYSIS:
${reasoning.core_idea?.slice(0, 300) || 'N/A'}

Generate questions that:
1. Test DEEP understanding (not just memorization)
2. Require reasoning and synthesis
3. Have a clear correct answer based on the text
4. Range from comprehension → application → analysis → evaluation

For each question, provide:
- The question
- The correct answer (2-3 sentences)
- The cognitive level (remember/understand/apply/analyze/evaluate/create)
- A hint for if the user struggles

Format as JSON array:
[
  {"question":"...","answer":"...","level":"...","hint":"..."}
]`;

        try {
            const result = await this.aiChat(prompt, 'llama-3.3-70b-versatile', userId, null, 0.3, 1200);
            const jsonMatch = result.text.match(/\[[\s\S]*?\]/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            return [];
        } catch (e) {
            // Fallback questions
            return [
                { question: `What is the main idea of this section?`, answer: `The main idea is...`, level: 'understand', hint: 'Think about what the author is trying to communicate overall.' },
                { question: `How would you apply this concept in a real scenario?`, answer: `You would apply it by...`, level: 'apply', hint: 'Consider a practical situation where this knowledge would be useful.' },
            ];
        }
    }

    async evaluateAnswer(question, userAnswer, correctAnswer, userId) {
        const prompt = `Evaluate the following student answer against the correct answer.

QUESTION: ${question}

CORRECT ANSWER: ${correctAnswer}

STUDENT ANSWER: ${userAnswer}

Score the answer 0-100 based on:
- Accuracy (40%): Is it factually correct?
- Completeness (30%): Does it cover all key points?
- Reasoning (30%): Is the reasoning sound?

Provide:
1. Score (0-100)
2. What they got right
3. What they missed
4. Suggested improvement

Format: {"score": number, "correct": "...", "missed": "...", "improvement": "..."}`;

        try {
            const result = await this.aiChat(prompt, 'llama-3.1-8b-instant', userId, null, 0.2, 600);
            const jsonMatch = result.text.match(/\{[\s\S]*?\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            return { score: 50, correct: 'Partial understanding shown.', missed: 'Some details missing.', improvement: 'Review the key concepts more carefully.' };
        } catch (e) {
            return { score: 50, correct: 'Unable to evaluate precisely.', missed: 'Evaluation error.', improvement: 'Try rephrasing your answer.' };
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   LEARNING SESSION MANAGER — Tracks progress across chunks
// ═══════════════════════════════════════════════════════════════════════════
class LearningSessionManager {
    constructor() {
        this.activeSessions = new Map(); // userId → session data
    }

    createSession(userId, curriculumName, chunks) {
        const session = {
            userId,
            curriculumName,
            chunks,
            currentChunkIndex: 0,
            chunkProgress: new Map(), // chunkId → {reasoned: bool, questions: [], answers: [], scores: []}
            startedAt: Date.now(),
            lastActivity: Date.now(),
            status: 'reading', // reading | reasoning | evaluating | completed
            masteryScores: {},
        };
        this.activeSessions.set(userId, session);
        this.saveSession(userId);
        return session;
    }

    getSession(userId) {
        if (!this.activeSessions.has(userId)) {
            // Try to load from disk
            try {
                const file = path.join(LEARNING_CONFIG.progressDir, `${userId}.json`);
                if (fs.existsSync(file)) {
                    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
                    this.activeSessions.set(userId, data);
                }
            } catch {}
        }
        return this.activeSessions.get(userId);
    }

    saveSession(userId) {
        const session = this.activeSessions.get(userId);
        if (!session) return;
        try {
            const file = path.join(LEARNING_CONFIG.progressDir, `${userId}.json`);
            fs.writeFileSync(file, JSON.stringify(session, null, 2));
        } catch {}
    }

    updateChunkProgress(userId, chunkId, data) {
        const session = this.getSession(userId);
        if (!session) return;
        session.chunkProgress.set(chunkId, { ...session.chunkProgress.get(chunkId), ...data });
        session.lastActivity = Date.now();
        this.saveSession(userId);
    }

    advanceChunk(userId) {
        const session = this.getSession(userId);
        if (!session) return null;
        session.currentChunkIndex++;
        session.status = 'reading';
        session.lastActivity = Date.now();
        this.saveSession(userId);
        return session.chunks[session.currentChunkIndex] || null;
    }

    calculateMastery(userId) {
        const session = this.getSession(userId);
        if (!session) return 0;

        let totalScore = 0;
        let count = 0;
        for (const [_, progress] of session.chunkProgress) {
            if (progress.scores && progress.scores.length > 0) {
                const avg = progress.scores.reduce((a, b) => a + b, 0) / progress.scores.length;
                totalScore += avg;
                count++;
            }
        }

        return count > 0 ? totalScore / count : 0;
    }

    endSession(userId) {
        const session = this.getSession(userId);
        if (!session) return;

        const mastery = this.calculateMastery(userId);
        session.status = 'completed';
        session.completedAt = Date.now();
        session.finalMastery = mastery;

        // Save to mastery history
        try {
            const masteryFile = path.join(LEARNING_CONFIG.masteryDir, `${userId}.json`);
            let history = [];
            if (fs.existsSync(masteryFile)) {
                history = JSON.parse(fs.readFileSync(masteryFile, 'utf8'));
            }
            history.push({
                curriculum: session.curriculumName,
                mastery: Math.round(mastery),
                completedAt: session.completedAt,
                chunksStudied: session.currentChunkIndex + 1,
                totalChunks: session.chunks.length,
            });
            fs.writeFileSync(masteryFile, JSON.stringify(history, null, 2));
        } catch {}

        this.saveSession(userId);
        this.activeSessions.delete(userId);

        return { mastery, totalChunks: session.chunks.length, chunksStudied: session.currentChunkIndex + 1 };
    }
}

const sessionManager = new LearningSessionManager();

// ═══════════════════════════════════════════════════════════════════════════
//   MAIN LEARNING ENGINE — Orchestrates the entire learning flow
// ═══════════════════════════════════════════════════════════════════════════
class LearningEngine {
    constructor() {
        this.chunkProcessor = new ChunkProcessor();
        this.reasoningEngine = null; // Initialized with aiChat function
        this.sessionManager = sessionManager;
    }

    setAIChat(aiChatFn) {
        this.reasoningEngine = new ReasoningEngine(aiChatFn);
    }

    // ── Start Learning Mode ──
    async startLearning(userId, filePathOrText, curriculumName = null) {
        let text;
        let name = curriculumName;

        if (fs.existsSync(filePathOrText)) {
            text = fs.readFileSync(filePathOrText, 'utf8');
            name = name || path.basename(filePathOrText);
        } else {
            text = filePathOrText;
            name = name || 'Untitled Curriculum';
        }

        if (!text || text.trim().length < 50) {
            return { success: false, error: 'Content too short or empty.' };
        }

        const chunks = this.chunkProcessor.chunk(text);
        const session = this.sessionManager.createSession(userId, name, chunks);

        return {
            success: true,
            curriculumName: name,
            totalChunks: chunks.length,
            firstChunk: chunks[0],
            message: `📚 *Learning Mode Activated*\n\nCurriculum: *${name}*\nTotal chunks: *${chunks.length}*\n\nI'm ready to learn. Send me the first chunk to begin deep reasoning, or type *next* to start automatically.`,
        };
    }

    // ── Process a Chunk (Reasoning Phase) ──
    async processChunk(userId) {
        const session = this.sessionManager.getSession(userId);
        if (!session) return { error: 'No active learning session. Start with .learn <file>' };

        const chunk = session.chunks[session.currentChunkIndex];
        if (!chunk) {
            // All chunks done
            const result = this.sessionManager.endSession(userId);
            return {
                type: 'completed',
                message: `🎓 *Learning Complete!*\n\nCurriculum: *${session.curriculumName}*\nFinal Mastery: *${result.mastery.toFixed(1)}%*\nChunks Studied: ${result.chunksStudied}/${result.totalChunks}\n\nYour knowledge has been crystallized into my neural architecture.`,
            };
        }

        session.status = 'reasoning';
        this.sessionManager.saveSession(userId);

        // Perform deep reasoning
        if (!this.reasoningEngine) {
            return { error: 'Learning engine not initialized with AI chat function.' };
        }

        const reasoning = await this.reasoningEngine.reasonAboutChunk(chunk, userId, session.curriculumName);

        // Generate evaluation questions
        const questions = await this.reasoningEngine.generateEvaluationQuestions(chunk, reasoning, userId);

        // Store in session
        this.sessionManager.updateChunkProgress(userId, chunk.id, {
            reasoned: true,
            reasoning,
            questions,
            currentQuestionIndex: 0,
            scores: [],
            answers: [],
        });

        session.status = 'evaluating';
        this.sessionManager.saveSession(userId);

        return {
            type: 'chunk_ready',
            chunkIndex: chunk.index + 1,
            totalChunks: session.chunks.length,
            chunkText: chunk.text,
            reasoning,
            firstQuestion: questions[0],
            questionsRemaining: questions.length,
            message: `🧠 *Chunk ${chunk.index + 1}/${session.chunks.length} Analyzed*\n\n${this.formatReasoning(reasoning)}\n\n📋 *Evaluation Question 1/${questions.length}:*\n${questions[0].question}\n\n_Type your answer to continue..._`,
        };
    }

    // ── Process User Answer ──
    async processAnswer(userId, answer) {
        const session = this.sessionManager.getSession(userId);
        if (!session || session.status !== 'evaluating') {
            return { error: 'No active evaluation. Start learning first.' };
        }

        const chunk = session.chunks[session.currentChunkIndex];
        const progress = session.chunkProgress.get(chunk.id);
        if (!progress || !progress.questions) {
            return { error: 'No questions found for current chunk.' };
        }

        const qIndex = progress.currentQuestionIndex;
        const question = progress.questions[qIndex];

        if (!question) {
            // All questions for this chunk answered
            const avgScore = progress.scores.reduce((a, b) => a + b, 0) / progress.scores.length;
            const passed = avgScore >= LEARNING_CONFIG.retentionThreshold * 100;

            let message = `✅ *Chunk ${chunk.index + 1} Evaluation Complete*\n\nAverage Score: *${avgScore.toFixed(1)}%*\nStatus: ${passed ? '✅ PASSED' : '⚠️ NEEDS REVIEW'}\n\n`;

            if (!passed) {
                message += `This chunk needs more study. Here is the key content again:\n\n${chunk.text.slice(0, 300)}...\n\nType *retry* to answer new questions, or *next* to continue anyway.`;
            } else {
                message += `Type *next* to proceed to the next chunk.`;
            }

            return { type: 'chunk_evaluated', passed, avgScore, message };
        }

        // Evaluate the answer
        const evaluation = await this.reasoningEngine.evaluateAnswer(
            question.question, answer, question.answer, userId
        );

        progress.scores.push(evaluation.score);
        progress.answers.push({ question: question.question, userAnswer: answer, score: evaluation.score });
        progress.currentQuestionIndex++;

        this.sessionManager.updateChunkProgress(userId, chunk.id, progress);

        const nextQ = progress.questions[progress.currentQuestionIndex];

        return {
            type: 'answer_evaluated',
            score: evaluation.score,
            feedback: evaluation,
            progress: `${progress.currentQuestionIndex}/${progress.questions.length}`,
            nextQuestion: nextQ ? {
                question: nextQ.question,
                hint: nextQ.hint,
            } : null,
            message: `📊 *Score: ${evaluation.score}/100*\n\n✅ *Correct:* ${evaluation.correct}\n❌ *Missed:* ${evaluation.missed}\n💡 *Improvement:* ${evaluation.improvement}\n\n${nextQ ? `📋 *Question ${progress.currentQuestionIndex + 1}/${progress.questions.length}:*\n${nextQ.question}\n\n_Hint: ${nextQ.hint}_` : 'All questions answered for this chunk. Type *next* to continue.'}`,
        };
    }

    // ── Handle Learning Mode Query ──
    async processLearningQuery(text, userId) {
        const lower = text.toLowerCase().trim();

        if (lower === 'next' || lower === 'continue' || lower === 'proceed') {
            return await this.processChunk(userId);
        }

        if (lower === 'retry' || lower === 'again') {
            const session = this.sessionManager.getSession(userId);
            if (!session) return { type: 'text', text: 'No active session.' };
            const chunk = session.chunks[session.currentChunkIndex];
            // Regenerate questions
            const progress = session.chunkProgress.get(chunk.id);
            if (progress && progress.reasoning) {
                const newQuestions = await this.reasoningEngine.generateEvaluationQuestions(chunk, progress.reasoning, userId);
                progress.questions = newQuestions;
                progress.currentQuestionIndex = 0;
                progress.scores = [];
                progress.answers = [];
                this.sessionManager.updateChunkProgress(userId, chunk.id, progress);
                return { type: 'text', text: `🔄 *Retrying Chunk ${chunk.index + 1}*\n\n📋 *Question 1/${newQuestions.length}:*\n${newQuestions[0].question}` };
            }
        }

        if (lower === 'skip' || lower === 'pass') {
            const session = this.sessionManager.getSession(userId);
            if (!session) return { type: 'text', text: 'No active session.' };
            const nextChunk = this.sessionManager.advanceChunk(userId);
            if (!nextChunk) {
                const result = this.sessionManager.endSession(userId);
                return { type: 'text', text: `🎓 *Learning Complete!*\nFinal Mastery: ${result.mastery.toFixed(1)}%` };
            }
            return await this.processChunk(userId);
        }

        if (lower === 'status' || lower === 'progress') {
            const session = this.sessionManager.getSession(userId);
            if (!session) return { type: 'text', text: 'No active learning session.' };
            const mastery = this.sessionManager.calculateMastery(userId);
            return {
                type: 'text',
                text: `📊 *Learning Progress*\n\nCurriculum: *${session.curriculumName}*\nChunk: *${session.currentChunkIndex + 1}/${session.chunks.length}*\nStatus: *${session.status}*\nCurrent Mastery: *${mastery.toFixed(1)}%*\n\nType *next* to continue or *exit* to stop.`,
            };
        }

        if (lower === 'exit' || lower === 'quit' || lower === 'stop') {
            const result = this.sessionManager.endSession(userId);
            delete global.learningMode[userId];
            return {
                type: 'text',
                text: `🛑 *Learning Mode Exited*\n\nCurriculum: *${result ? result.curriculumName : 'N/A'}*\nFinal Mastery: *${result ? result.mastery.toFixed(1) : 0}%*\n\nYour progress has been saved. Resume anytime with .learn`,
            };
        }

        if (lower === 'hint' || lower === 'help') {
            const session = this.sessionManager.getSession(userId);
            if (!session) return { type: 'text', text: 'No active session.' };
            const chunk = session.chunks[session.currentChunkIndex];
            const progress = session.chunkProgress.get(chunk.id);
            if (progress && progress.questions) {
                const q = progress.questions[progress.currentQuestionIndex];
                if (q) return { type: 'text', text: `💡 *Hint:* ${q.hint}` };
            }
            return { type: 'text', text: 'No hint available.' };
        }

        // Default: treat as answer to current question
        return await this.processAnswer(userId, text);
    }

    formatReasoning(reasoning) {
        let output = '';
        if (reasoning.core_idea) output += `💡 *Core Idea:*\n${reasoning.core_idea.slice(0, 300)}\n\n`;
        if (reasoning.key_concepts) output += `🔑 *Key Concepts:*\n${reasoning.key_concepts.slice(0, 300)}\n\n`;
        if (reasoning.connections) output += `🔗 *Connections:*\n${reasoning.connections.slice(0, 200)}\n\n`;
        return output;
    }

    // ── Get Mastery History ──
    getMasteryHistory(userId) {
        try {
            const file = path.join(LEARNING_CONFIG.masteryDir, `${userId}.json`);
            if (fs.existsSync(file)) {
                return JSON.parse(fs.readFileSync(file, 'utf8'));
            }
        } catch {}
        return [];
    }

    // ── Generate Study Recommendations ──
    async generateStudyPlan(userId, aiChatFn) {
        const history = this.getMasteryHistory(userId);
        if (history.length === 0) return 'No learning history found. Start with .learn <file>';

        const weakAreas = history.filter(h => h.mastery < 70).map(h => h.curriculum);
        const strongAreas = history.filter(h => h.mastery >= 85).map(h => h.curriculum);

        const prompt = `Based on this learning history, generate a personalized study plan:\n\nWeak Areas: ${weakAreas.join(', ') || 'None identified'}\nStrong Areas: ${strongAreas.join(', ') || 'None identified'}\n\nProvide 3-5 specific recommendations for improvement.`;

        try {
            const result = await aiChatFn(prompt, 'llama-3.3-70b-versatile', userId, null, 0.5, 800);
            return result.text;
        } catch (e) {
            return `Study Recommendations:\n1. Review weak areas: ${weakAreas.join(', ')}\n2. Practice active recall\n3. Connect concepts across curricula`;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   EXPORTS
// ═══════════════════════════════════════════════════════════════════════════
module.exports = {
    LearningEngine,
    ChunkProcessor,
    ReasoningEngine,
    LearningSessionManager,
    sessionManager,
    LEARNING_CONFIG,
};