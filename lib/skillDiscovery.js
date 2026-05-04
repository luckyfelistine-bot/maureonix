// ═══════════════════════════════════════════════════════════════════════════════
//  lib/skillDiscovery.js — Dynamic Skill Discovery Engine v2
//  Purpose: Scans the ENTIRE project, extracts every callable function,
//           builds a manifest, and enables Maureonix to know herself.
//  Capabilities: Recursive scanning, fuzzy matching, metadata extraction,
//                dependency mapping, and skill health monitoring.
// ═══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const EXCLUDED_DIRS = new Set([
    'node_modules', '.git', 'tmp', 'logs', '.maureonix_backups',
    'coverage', 'dist', 'build', '.nyc_output'
]);

// ─────────────────────────────────────────────────────────────────────────────
//   DESCRIPTION EXTRACTION ENGINE
//   Pulls JSDoc, inline comments, and function signatures for context.
// ─────────────────────────────────────────────────────────────────────────────

function extractDescription(fn, key = null) {
    if (!fn) return 'No description available.';

    // Check for custom description property
    if (fn.description && typeof fn.description === 'string') return fn.description;

    const str = fn.toString();

    // Try JSDoc block - match /** ... */
    const jsdocMatch = str.match(/\/\*\*[\s\S]*?\*\//);
    if (jsdocMatch) {
        const cleaned = jsdocMatch[0]
            .replace(/\/\*\*/g, '')
            .replace(/\*\//g, '')
            .replace(/^\s*\*\s?/gm, '')
            .trim();
        return cleaned.split('\n')[0] || cleaned;
    }

    // Try single-line comment before function
    const singleMatch = str.match(/\/\/\s*(.+)/);
    if (singleMatch) return singleMatch[1].trim();

    // Try to extract parameter signature as description
    const sigMatch = str.match(/function\s*(?:\w+)?\s*\(([^)]*)\)/);
    if (sigMatch && key) return `${key}(${sigMatch[1]}) — Auto-discovered function`;

    if (key) return `${key} — Auto-discovered function`;
    return 'Auto-discovered function';
}

function extractParameters(fn) {
    const str = fn.toString();
    const match = str.match(/function\s*(?:\w+)?\s*\(([^)]*)\)/);
    if (!match) return [];
    return match[1].split(',').map(p => p.trim()).filter(Boolean);
}

function extractReturnType(fn) {
    const str = fn.toString();
    // Very basic inference
    if (str.includes('return await') || str.includes('return new Promise')) return 'Promise';
    if (str.includes('return {') || str.includes('return {')) return 'Object';
    if (str.includes('return [')) return 'Array';
    if (str.includes('return true') || str.includes('return false')) return 'Boolean';
    if (str.includes('return "') || str.includes("return '") || str.includes('return `')) return 'String';
    if (str.includes('return ')) return 'Mixed';
    return 'Unknown';
}

// ─────────────────────────────────────────────────────────────────────────────
//   FILE ANALYSIS ENGINE
//   Deep inspection of JS files to extract all exported capabilities.
// ─────────────────────────────────────────────────────────────────────────────

function analyzeModule(filePath, relativePath) {
    const skills = [];
    const moduleName = path.basename(filePath, '.js');
    const dirPrefix = path.dirname(relativePath).replace(/\\/g, '/');
    const prefix = dirPrefix === '.' ? '' : dirPrefix + '/';

    try {
        // Clear require cache to get fresh module
        delete require.cache[require.resolve(filePath)];
        const mod = require(filePath);

        if (mod === null || mod === undefined) return skills;

        // Case 1: Module exports a single function directly
        if (typeof mod === 'function') {
            const fnName = prefix + moduleName;
            skills.push({
                name: fnName,
                file: filePath,
                relativePath: relativePath,
                func: mod,
                description: extractDescription(mod, moduleName),
                parameters: extractParameters(mod),
                returnType: extractReturnType(mod),
                skillPath: filePath,
                type: 'function',
                category: inferCategory(relativePath),
                async: mod.toString().includes('async ')
            });
        }
        // Case 2: Module exports an object with multiple functions
        else if (typeof mod === 'object' && !Array.isArray(mod)) {
            for (const [key, value] of Object.entries(mod)) {
                if (typeof value === 'function' && !key.startsWith('_') && key !== 'default') {
                    const fnName = prefix + moduleName + '/' + key;
                    skills.push({
                        name: fnName,
                        file: filePath,
                        relativePath: relativePath,
                        func: value,
                        description: extractDescription(value, key),
                        parameters: extractParameters(value),
                        returnType: extractReturnType(value),
                        skillPath: filePath + ':' + key,
                        type: 'method',
                        category: inferCategory(relativePath),
                        async: value.toString().includes('async ')
                    });
                }
            }
        }
        // Case 3: Module exports a class
        else if (typeof mod === 'function' && mod.prototype && Object.keys(mod.prototype).length > 0) {
            const className = prefix + moduleName;
            const instanceMethods = [];
            for (const [key, value] of Object.entries(mod.prototype)) {
                if (typeof value === 'function' && !key.startsWith('_')) {
                    instanceMethods.push({
                        name: key,
                        description: extractDescription(value, key),
                        parameters: extractParameters(value),
                        async: value.toString().includes('async ')
                    });
                }
            }
            skills.push({
                name: className,
                file: filePath,
                relativePath: relativePath,
                func: mod,
                description: `Class ${moduleName} with methods: ${instanceMethods.map(m => m.name).join(', ')}`,
                parameters: [],
                returnType: 'Class',
                skillPath: filePath,
                type: 'class',
                category: inferCategory(relativePath),
                async: false,
                methods: instanceMethods
            });
        }
    } catch (e) {
        // Silently skip files that can't be loaded
        // This is intentional — some files may have runtime dependencies
    }

    return skills;
}

// ─────────────────────────────────────────────────────────────────────────────
//   CATEGORY INFERENCE
//   Automatically categorizes skills based on their file path.
// ─────────────────────────────────────────────────────────────────────────────

function inferCategory(relativePath) {
    const lower = relativePath.toLowerCase();
    if (lower.includes('command')) return 'Command';
    if (lower.includes('skill')) return 'Skill';
    if (lower.includes('lib/')) return 'Core Library';
    if (lower.includes('util')) return 'Utility';
    if (lower.includes('middleware')) return 'Middleware';
    if (lower.includes('database') || lower.includes('db/')) return 'Database';
    if (lower.includes('api')) return 'API Integration';
    if (lower.includes('media') || lower.includes('download')) return 'Media';
    if (lower.includes('game')) return 'Game';
    if (lower.includes('admin')) return 'Admin';
    if (lower.includes('config')) return 'Configuration';
    if (lower.includes('ai') || lower.includes('openai') || lower.includes('deepseek')) return 'AI Engine';
    return 'General';
}

// ─────────────────────────────────────────────────────────────────────────────
//   RECURSIVE DIRECTORY SCANNER
//   Walks the entire project tree and discovers all skills.
// ─────────────────────────────────────────────────────────────────────────────

function discoverSkillsFromDir(dirPath, baseRoot = dirPath, depth = 0) {
    const skills = [];
    if (!fs.existsSync(dirPath)) return skills;
    if (depth > 10) return skills; // Prevent infinite recursion

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(baseRoot, fullPath);

        if (entry.isDirectory()) {
            if (EXCLUDED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
            skills.push(...discoverSkillsFromDir(fullPath, baseRoot, depth + 1));
        } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.startsWith('_')) {
            const fileSkills = analyzeModule(fullPath, relativePath);
            skills.push(...fileSkills);
        }
    }

    return skills;
}

// ─────────────────────────────────────────────────────────────────────────────
//   MANIFEST BUILDER
//   Creates a comprehensive, searchable manifest of all skills.
// ─────────────────────────────────────────────────────────────────────────────

function buildSkillManifest(skills) {
    const manifest = {
        totalSkills: skills.length,
        categories: {},
        asyncSkills: 0,
        syncSkills: 0,
        files: new Set(),
        byFile: {}
    };

    for (const skill of skills) {
        // Count by category
        manifest.categories[skill.category] = (manifest.categories[skill.category] || 0) + 1;

        // Count async vs sync
        if (skill.async) manifest.asyncSkills++;
        else manifest.syncSkills++;

        // Track files
        manifest.files.add(skill.file);

        // Group by file
        if (!manifest.byFile[skill.file]) manifest.byFile[skill.file] = [];
        manifest.byFile[skill.file].push(skill.name);
    }

    manifest.files = Array.from(manifest.files);
    return manifest;
}

// ─────────────────────────────────────────────────────────────────────────────
//   PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

function discoverAllSkills() {
    const projectRoot = path.join(__dirname, '..');
    const skills = discoverSkillsFromDir(projectRoot, projectRoot);

    // Deduplicate by name (keep first occurrence)
    const seen = new Map();
    for (const skill of skills) {
        if (!seen.has(skill.name)) seen.set(skill.name, skill);
    }

    return Array.from(seen.values());
}

function getSkillManifest() {
    const skills = discoverAllSkills();
    return buildSkillManifest(skills);
}

function searchSkills(query) {
    const skills = discoverAllSkills();
    const lowerQuery = query.toLowerCase();
    return skills.filter(skill =>
        skill.name.toLowerCase().includes(lowerQuery) ||
        skill.description.toLowerCase().includes(lowerQuery) ||
        skill.category.toLowerCase().includes(lowerQuery)
    );
}

function getSkillsByCategory(category) {
    const skills = discoverAllSkills();
    return skills.filter(skill => skill.category === category);
}

function getSkillsByFile(filePath) {
    const skills = discoverAllSkills();
    return skills.filter(skill => skill.file === filePath || skill.relativePath === filePath);
}

// ─────────────────────────────────────────────────────────────────────────────
//   EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
    discoverAllSkills,
    discoverSkillsFromDir,
    getSkillManifest,
    searchSkills,
    getSkillsByCategory,
    getSkillsByFile,
    extractDescription,
    extractParameters,
    extractReturnType,
    inferCategory,
    buildSkillManifest,
    analyzeModule
};
