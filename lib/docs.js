const fs = require('fs');
const path = require('path');

// In-memory knowledge base
let knowledgeBase = [];
let isLoaded = false;

/**
 * Load all .md files from the docs folder and chunk them by headers.
 * Runs once at startup.
 */
function loadDocs(docsPath = path.join(process.cwd(), 'docs')) {
    if (isLoaded) return knowledgeBase;
    
    if (!fs.existsSync(docsPath)) {
        console.warn('⚠️ Docs folder not found, knowledge base empty');
        isLoaded = true;
        return [];
    }

    const files = fs.readdirSync(docsPath).filter(f => f.endsWith('.md'));
    const chunks = [];

    for (const file of files) {
        const filePath = path.join(docsPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const docName = file.replace('.md', '').toUpperCase();

        // Split by markdown headers (## or ###)
        const sections = content.split(/^#{2,3}\s+/gm);
        const headers = content.match(/^#{2,3}\s+.+$/gm) || [];

        // First section is before any header
        if (sections[0] && !headers.length) {
            chunks.push({
                doc: docName,
                title: 'Overview',
                content: cleanMarkdown(sections[0])
            });
        }

        // Match headers with sections
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i].replace(/^#{2,3}\s+/, '').trim();
            const sectionContent = sections[i + 1] || '';
            if (sectionContent.trim().length > 50) {
                chunks.push({
                    doc: docName,
                    title: header,
                    content: cleanMarkdown(sectionContent)
                });
            }
        }
    }

    knowledgeBase = chunks;
    isLoaded = true;
    console.log(`📚 Loaded ${chunks.length} documentation chunks into memory`);
    return chunks;
}

/**
 * Clean markdown for embedding in prompts
 */
function cleanMarkdown(text) {
    return text
        .replace(/```[\s\S]*?```/g, '[code block]')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Search the knowledge base for relevant chunks using keyword matching.
 * Returns top N most relevant chunks.
 */
function searchDocs(query, topK = 3) {
    if (!knowledgeBase.length) return [];

    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    if (queryTerms.length === 0) return knowledgeBase.slice(0, topK);

    const scored = knowledgeBase.map(chunk => {
        const contentLower = chunk.content.toLowerCase();
        const titleLower = chunk.title.toLowerCase();
        let score = 0;

        for (const term of queryTerms) {
            // Title matches are weighted higher
            if (titleLower.includes(term)) score += 10;
            // Content matches
            const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
            score += matches;
        }

        // Bonus for exact phrase match
        if (contentLower.includes(query.toLowerCase())) score += 5;

        return { chunk, score };
    });

    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(s => s.chunk);
}

/**
 * Format retrieved chunks into a context string for AI prompt.
 */
function buildContext(query, topK = 3) {
    const chunks = searchDocs(query, topK);
    if (!chunks.length) return '';

    let context = '--- RELEVANT DOCUMENTATION ---\n';
    for (const chunk of chunks) {
        context += `[${chunk.doc} - ${chunk.title}]\n${chunk.content.slice(0, 800)}\n\n`;
    }
    context += '--- END DOCUMENTATION ---\n';
    return context;
}

module.exports = { loadDocs, searchDocs, buildContext };