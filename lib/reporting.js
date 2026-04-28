// lib/reporting.js
const path = require('path');
const fs = require('fs');
const { runtime } = require('./function');

async function generateReport(type, db, AI, hyperMemory, knowledgeGraph, reflectionEngine, keyManager, learningSessionManager, userId) {
    const now = new Date();
    const period = type === 'weekly' ? `Week ${Math.ceil(now.getDate() / 7)}` : now.toLocaleDateString('en-KE');

    // Stats
    const uptime = runtime(process.uptime());
    const users = Object.keys(db.users || {}).length;
    const groups = Object.keys(db.groups || {}).length;
    const commandHits = db.hit ? Object.values(db.hit).reduce((a,b)=>a+b,0) : 0;
    const aiCalls = db.aiModelUsage ? Object.values(db.aiModelUsage).reduce((a,b)=>a+b,0) : 0;

    // Learning stats
    let totalCurricula = 0, avgMastery = 0;
    try {
        const masteryDir = path.join(process.cwd(), 'learning_mastery');
        const files = fs.readdirSync(masteryDir);
        let all = [];
        for (const f of files) {
            const data = JSON.parse(fs.readFileSync(path.join(masteryDir, f), 'utf8'));
            all = all.concat(data);
        }
        totalCurricula = all.length;
        if (totalCurricula) avgMastery = (all.reduce((s, h) => s + h.mastery, 0) / totalCurricula).toFixed(1);
    } catch(e) {}

    const activeSessions = learningSessionManager?.activeSessions?.size || 0;
    const keyHealth = keyManager?.getReport?.() || {};
    const healthyKeys = Object.values(keyHealth).filter(k=>k?.healthy).length;
    const totalKeys = Object.keys(keyHealth).length;
    const diag = reflectionEngine?.getDiagnostics?.() || { successRate: 'N/A', avgLatency: 'N/A' };

    let statsText = `📊 *${type.toUpperCase()} REPORT – ${period}*\n\n` +
        `⏱️ Uptime: ${uptime}\n👥 Users: ${users}\n🏠 Groups: ${groups}\n` +
        `📟 Commands: ${commandHits}\n🤖 AI Calls: ${aiCalls}\n` +
        `📚 Curricula: ${totalCurricula}\n🎯 Avg Mastery: ${avgMastery}%\n` +
        `🧠 Active learners: ${activeSessions}\n🔑 API keys: ${healthyKeys}/${totalKeys} healthy\n` +
        `📊 Success rate: ${diag.successRate}\n⚡ Avg latency: ${diag.avgLatency}\n\n`;

    let insights = '';
    if (AI && AI.ultimateAI) {
        try {
            const res = await AI.ultimateAI(
                `Based on these stats, write 2-3 concise, helpful insights for the bot owner:\n${statsText}`,
                userId || 'system',
                'deepseek'
            );
            insights = `💡 *AI Insights*\n${res.text}\n\n`;
        } catch(e) { console.error('[reporting insights]', e); }
    }

    const fullReport = statsText + insights + `_Report: ${now.toLocaleString('en-KE')}_\n> Maureonix Cortex`;
    return {
        text: fullReport,
        attachment: Buffer.from(fullReport, 'utf-8'),
        filename: `${type}_report_${now.toISOString().slice(0,10)}.txt`,
    };
}

module.exports = { generateReport };