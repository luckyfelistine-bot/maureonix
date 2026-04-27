// lib/docs.js – Smart documentation search with beautiful WhatsApp‑style formatting
const fs = require('fs');
const path = require('path');

let knowledgeBase = [];
let isLoaded = false;

/** Load and index all .md files from docs/ folder */
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

        // Split by ## and ### headers
        const sections = content.split(/^#{2,3}\s+/gm);
        const headers = content.match(/^#{2,3}\s+.+$/gm) || [];

        // Section before any header
        if (sections[0] && !headers.length) {
            chunks.push({ doc: docName, title: 'Overview', content: sections[0].trim() });
        }

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i].replace(/^#{2,3}\s+/, '').trim();
            const sectionContent = sections[i + 1] || '';
            if (sectionContent.trim().length > 20) {
                chunks.push({ doc: docName, title: header, content: sectionContent.trim() });
            }
        }
    }

    knowledgeBase = chunks;
    isLoaded = true;
    console.log(`📚 Loaded ${chunks.length} documentation chunks into memory`);
    return chunks;
}

/** Simple TF‑IDF style search */
function searchDocs(query, topK = 3) {
    if (!knowledgeBase.length) return [];

    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
    if (queryTerms.length === 0) return knowledgeBase.slice(0, topK);

    // Compute document frequency (simple)
    const docFreq = {};
    for (const term of queryTerms) {
        let count = 0;
        for (const chunk of knowledgeBase) {
            if (chunk.content.toLowerCase().includes(term)) count++;
        }
        docFreq[term] = count;
    }

    const scored = knowledgeBase.map(chunk => {
        const contentLower = chunk.content.toLowerCase();
        const titleLower = chunk.title.toLowerCase();
        let score = 0;

        for (const term of queryTerms) {
            const tf = (contentLower.match(new RegExp(term, 'g')) || []).length;
            const idf = Math.log((knowledgeBase.length + 1) / (docFreq[term] + 1)) + 1;
            score += tf * idf;
            if (titleLower.includes(term)) score += 3;
        }

        // Boost for exact phrase match
        if (contentLower.includes(query.toLowerCase())) score += 5;
        if (titleLower === query.toLowerCase()) score += 10;

        return { chunk, score };
    });

    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(s => s.chunk);
}

/** Convert Markdown to WhatsApp‑friendly formatting */
function formatDocForWhatsApp(markdown) {
    let text = markdown;

    // Preserve code blocks (replace with bold + monospace indicator)
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        const clean = code.trim().replace(/^/gm, '  '); // indent for readability
        return `\n\`\`\`${lang || ''}\n${clean}\n\`\`\`\n`;
    });

    // Inline code: use backticks (WhatsApp shows them nicely)
    text = text.replace(/`([^`]+)`/g, '```$1```');

    // Bold: **text** → *text*
    text = text.replace(/\*\*(.+?)\*\*/g, '*$1*');

    // Italic: *text* → _text_
    text = text.replace(/\*(.+?)\*/g, '_$1_');

    // Strikethrough: ~~text~~ → ~text~
    text = text.replace(/~~(.+?)~~/g, '~$1~');

    // Links: [text](url) → text (url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

    // Headers: remove trailing #, but add separator
    text = text.replace(/^#{1,6}\s+/gm, '');

    // Horizontal rules
    text = text.replace(/^---+/gm, '━━━━━━━━━━━━━━━━━━━━━');

    // Unordered lists
    text = text.replace(/^\s*[-*+]\s+/gm, '• ');

    // Ordered lists
    text = text.replace(/^\s*\d+\.\s+/gm, '• ');

    // Collapse excessive newlines
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
}

/** Build a rich context string for AI prompts */
function buildContext(query, topK = 3) {
    const chunks = searchDocs(query, topK);
    if (!chunks.length) return '';

    let context = '--- RELEVANT DOCUMENTATION ---\n';
    for (const chunk of chunks) {
        context += `[${chunk.doc} - ${chunk.title}]\n${cleanMarkdownForAI(chunk.content.slice(0, 800))}\n\n`;
    }
    context += '--- END DOCUMENTATION ---\n';
    return context;
}

/** Minimal cleaning for AI prompt (remove formatting noise) */
function cleanMarkdownForAI(text) {
    return text
        .replace(/```[\s\S]*?```/g, '[code block]')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

module.exports = { loadDocs, searchDocs, buildContext, formatDocForWhatsApp, cleanMarkdownForAI };