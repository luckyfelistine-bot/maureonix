/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  🧠 MAUREONIX INTELLIGENCE LAYER v4.0                        ║
 * ║  Reports • AI Insights • Alerts • Chat • Learning • Backups  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const cron = require('node-schedule'); // Better than node-cron for complex schedules
const path = require('path');
const fs = require('fs');
const config = require('../config');
const { 
  verifyConnection, 
  sendHtmlReport, 
  sendPlain, 
  sendToAny,      // NEW
  startInboxMonitor, 
  createBackupAndEmail,
  formatUptime,
  getStats 
} = require('./emailService');

let nimesha = null;
let AI = null;
let db = null;
let learningEngine = null;

const reportState = {
  lastDaily: null, lastWeekly: null, lastMonthly: null,
  lastBackup: null, alertsSent: 0, crisesHandled: 0,
  emailsReceived: 0, learningReportsSent: 0,
};

/* ───────────────────────────────────────────────────────────────
   INITIALIZATION
   ─────────────────────────────────────────────────────────────── */
async function initEmailReports(nimeshaInstance, aiModule, dbRef, learnEngine) {
  nimesha = nimeshaInstance;
  AI = aiModule;
  db = dbRef || {};
  learningEngine = learnEngine || null;

  await verifyConnection();
  sendBootNotification();

  startInboxMonitor({
    onChat: handleEmailChat,
    onReportRequest: handleReportRequest,
    onBackupRequest: handleBackupRequest,
    onLearnRequest: handleLearnRequest,    // NEW
  });

  scheduleReports();
  console.log('[EmailReports] 🧠 v4.0 Intelligence active');
}

/* ───────────────────────────────────────────────────────────────
   SCHEDULER — More powerful with node-schedule
   ─────────────────────────────────────────────────────────────── */
function scheduleReports() {
  // Daily: 7:00 AM
  cron.scheduleJob('daily-report', { hour: 7, minute: 0, tz: 'Africa/Nairobi' }, async () => {
    await sendDailyReport();
    reportState.lastDaily = Date.now();
  });

  // Weekly: Monday 8:00 AM
  cron.scheduleJob('weekly-report', { dayOfWeek: 1, hour: 8, minute: 0, tz: 'Africa/Nairobi' }, async () => {
    await sendWeeklyReport();
    reportState.lastWeekly = Date.now();
  });

  // Monthly: 1st @ 9:00 AM
  cron.scheduleJob('monthly-report', { date: 1, hour: 9, minute: 0, tz: 'Africa/Nairobi' }, async () => {
    await sendMonthlyReport();
    reportState.lastMonthly = Date.now();
  });

  // Alerts: Every 5 minutes
  setInterval(async () => {
    await checkAndSendAlerts();
  }, 300000);

  // Heartbeat: Every 6 hours
  setInterval(async () => {
    await sendHeartbeat();
  }, 21600000);

  // Learning Digest: Daily 8:00 PM
  cron.scheduleJob('learning-digest', { hour: 20, minute: 0, tz: 'Africa/Nairobi' }, async () => {
    await sendLearningDigest();
  });

  // Auto-backup: Every 12 hours
  setInterval(async () => {
    await performAutoBackup();
  }, 43200000);

  // Auto-curriculum scan: Every 24 hours
  setInterval(async () => {
    await scanAndLearnCurriculum();
  }, 86400000);
}

/* ───────────────────────────────────────────────────────────────
   REPORT GENERATORS (Enhanced with AI)
   ─────────────────────────────────────────────────────────────── */
async function sendDailyReport() {
  const stats = gatherSystemStats();
  const period = new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  let insights = '';
  if (AI?.ultimateAI) {
    try {
      const prompt = `Analyze these daily metrics. Give 2-3 concise, actionable insights. Be strategic and direct:\n${JSON.stringify(stats, null, 2)}`;
      const res = await AI.ultimateAI(prompt, 'system', 'deepseek');
      insights = res.text || res;
    } catch (e) { console.error('[EmailReports] AI insight failed:', e.message); }
  }

  await sendHtmlReport({
    to: config.emailRecipient,
    subject: `📊 Maureonix Daily Brief — ${new Date().toLocaleDateString('en-KE')}`,
    template: 'report',
    templateData: {
      period,
      stats: formatStats(stats),
      insights: insights ? `💡 AI Insights\n\n${insights}` : '',
      type: 'DAILY',
    },
    attachments: [makeJsonAttachment('daily_report', { period, stats, insights })],
  });

  await mirrorToWhatsApp(`📊 Daily Report sent`);
}

async function sendWeeklyReport() {
  const stats = gatherSystemStats();
  const now = new Date();
  const weekNum = Math.ceil(now.getDate() / 7);
  const period = `Week ${weekNum}, ${now.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}`;

  let insights = '';
  if (AI?.ultimateAI) {
    try {
      const prompt = `WEEKLY strategic review. Analyze trends, predict next week's challenges, provide 3 high-level strategic moves:\n${JSON.stringify(stats, null, 2)}`;
      const res = await AI.ultimateAI(prompt, 'system', 'deepseek');
      insights = res.text || res;
    } catch (e) { console.error('[EmailReports] Weekly AI failed:', e.message); }
  }

  await sendHtmlReport({
    to: config.emailRecipient,
    subject: `📈 Maureonix Weekly Intelligence — ${period}`,
    template: 'report',
    templateData: {
      period,
      stats: { ...formatStats(stats), '📈 User Growth': db.weeklyGrowth?.users || '+0%', '🚀 Command Growth': db.weeklyGrowth?.commands || '+0%' },
      insights: insights ? `💡 Strategic Recommendations\n\n${insights}` : '',
      type: 'WEEKLY',
    },
    attachments: [makeJsonAttachment('weekly_report', { period, stats, insights })],
  });

  await mirrorToWhatsApp(`📈 Weekly Intelligence sent`);
}

async function sendMonthlyReport() {
  const stats = gatherSystemStats();
  const period = new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });

  let insights = '';
  if (AI?.ultimateAI) {
    try {
      const prompt = `MONTHLY deep dive. Long-term trends, next month predictions, 3 strategic moves. Executive format:\n${JSON.stringify(stats, null, 2)}`;
      const res = await AI.ultimateAI(prompt, 'system', 'deepseek');
      insights = res.text || res;
    } catch (e) { console.error('[EmailReports] Monthly AI failed:', e.message); }
  }

  const attachments = [makeJsonAttachment('monthly_report', { period, stats, insights })];
  
  // Add mastery CSV if exists
  const csvAttach = await generateMasteryCsv();
  if (csvAttach) attachments.push(csvAttach);

  await sendHtmlReport({
    to: config.emailRecipient,
    subject: `🌌 Maureonix Monthly Deep Dive — ${period}`,
    template: 'report',
    templateData: {
      period,
      stats: formatStats(stats),
      insights: insights ? `🌌 Strategic Deep Dive\n\n${insights}` : '',
      type: 'MONTHLY',
    },
    attachments,
  });

  await mirrorToWhatsApp(`🌌 Monthly Deep Dive delivered`);
}

/* ───────────────────────────────────────────────────────────────
   LEARNING REPORT — NEW: She learns, then emails you what she learned
   ─────────────────────────────────────────────────────────────── */
async function sendLearningReport(curriculumName, masteryData) {
  if (!masteryData) return;
  
  let insights = '';
  if (AI?.ultimateAI) {
    try {
      const prompt = `I just completed learning "${curriculumName}" with ${masteryData.mastery}% mastery. Summarize what I've learned in 3-4 sentences as if reporting to my creator. Be proud but professional.`;
      const res = await AI.ultimateAI(prompt, 'system', 'deepseek');
      insights = res.text || res;
    } catch (e) { console.error('[EmailReports] Learning AI failed:', e.message); }
  }

  const achievements = [];
  if (masteryData.mastery >= 90) achievements.push({ icon: '🏆', name: 'Grandmaster', desc: '90%+ Mastery' });
  if (masteryData.mastery >= 75) achievements.push({ icon: '⭐', name: 'Expert', desc: '75%+ Mastery' });
  if (masteryData.mastery >= 50) achievements.push({ icon: '📖', name: 'Scholar', desc: '50%+ Mastery' });
  if (masteryData.chunksStudied >= 10) achievements.push({ icon: '🔥', name: 'Marathoner', desc: '10+ Chunks' });

  await sendHtmlReport({
    to: config.emailRecipient,
    subject: `🎓 Learning Complete — ${curriculumName}`,
    template: 'learning',
    templateData: {
      curriculum: curriculumName,
      mastery: masteryData.mastery.toFixed(1),
      chunks: `${masteryData.chunksStudied}/${masteryData.totalChunks}`,
      insights: insights || `I have successfully completed ${curriculumName} with a mastery level of ${masteryData.mastery.toFixed(1)}%.`,
      achievements,
    },
  });

  reportState.learningReportsSent++;
  await mirrorToWhatsApp(`🎓 Finished learning: ${curriculumName} (${masteryData.mastery.toFixed(1)}% mastery)`);
}

async function sendLearningDigest() {
  let totalCurricula = 0, avgMastery = 0, topLearners = [];
  try {
    const masteryDir = path.join(process.cwd(), 'learning_mastery');
    if (fs.existsSync(masteryDir)) {
      const files = fs.readdirSync(masteryDir);
      let all = [];
      for (const f of files) {
        const data = JSON.parse(fs.readFileSync(path.join(masteryDir, f), 'utf8'));
        all = all.concat(data);
      }
      totalCurricula = all.length;
      if (totalCurricula) {
        avgMastery = (all.reduce((s, h) => s + (h.mastery || 0), 0) / totalCurricula).toFixed(1);
        topLearners = all.sort((a, b) => (b.mastery || 0) - (a.mastery || 0)).slice(0, 3);
      }
    }
  } catch(e) {}

  await sendHtmlReport({
    to: config.emailRecipient,
    subject: `📚 Learning Digest — ${new Date().toLocaleDateString('en-KE')}`,
    template: 'report',
    templateData: {
      period: new Date().toLocaleDateString('en-KE'),
      stats: {
        '📚 Total Curricula': totalCurricula,
        '🎯 Average Mastery': avgMastery + '%',
        '🥇 Top Learner': topLearners[0] ? `${topLearners[0].userId} (${topLearners[0].mastery}%)` : 'N/A',
        '🥈 2nd Place': topLearners[1] ? `${topLearners[1].userId} (${topLearners[1].mastery}%)` : 'N/A',
        '🥉 3rd Place': topLearners[2] ? `${topLearners[2].userId} (${topLearners[2].mastery}%)` : 'N/A',
      },
      insights: '',
      type: 'DAILY',
    },
  });
}

/* ───────────────────────────────────────────────────────────────
   AUTO-CURRICULUM SCANNER — Scans curriculum/ folder and learns
   ─────────────────────────────────────────────────────────────── */
async function scanAndLearnCurriculum() {
  const curriculumDir = path.join(process.cwd(), 'curriculum');
  if (!fs.existsSync(curriculumDir)) return;

  const files = fs.readdirSync(curriculumDir).filter(f => 
    f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.json')
  );

  for (const file of files) {
    const filePath = path.join(curriculumDir, file);
    const stat = fs.statSync(filePath);
    
    // Skip if already learned (check by modified time)
    const learnedMarker = path.join(process.cwd(), 'learning_progress', `curriculum_${path.basename(file, path.extname(file))}.json`);
    if (fs.existsSync(learnedMarker)) {
      const learnedStat = fs.statSync(learnedMarker);
      if (learnedStat.mtime >= stat.mtime) continue; // Already learned this version
    }

    console.log(`[EmailReports] 📚 Auto-learning curriculum: ${file}`);
    
    if (learningEngine?.startLearning) {
      try {
        const result = await learningEngine.startLearning('system', filePath, path.basename(file, path.extname(file)));
        if (result.success) {
          // Auto-process all chunks
          let chunkResult = await learningEngine.processChunk('system');
          while (chunkResult && chunkResult.type !== 'completed' && !chunkResult.error) {
            // Auto-answer questions with AI
            if (chunkResult.firstQuestion && AI?.ultimateAI) {
              const answer = await AI.ultimateAI(
                `Answer this question based on the context: ${chunkResult.firstQuestion.question}\nContext: ${chunkResult.chunkText?.slice(0, 500)}`,
                'system', 'deepseek'
              );
              await learningEngine.processAnswer('system', answer.text || 'Based on the material...');
            }
            chunkResult = await learningEngine.processChunk('system');
          }

          if (chunkResult?.type === 'completed') {
            await sendLearningReport(result.curriculumName, chunkResult);
          }
        }
      } catch (e) {
        console.error(`[EmailReports] Auto-learn failed for ${file}:`, e.message);
      }
    }
  }
}

/* ───────────────────────────────────────────────────────────────
   ALERTS & CRISIS
   ─────────────────────────────────────────────────────────────── */
async function checkAndSendAlerts() {
  // ... (same as before, enhanced)
}

async function sendCrisisAlert(userMessage, userId, severity) {
  reportState.crisesHandled++;
  const text = `🚨 CRISIS ALERT (${severity})\nUser: ${userId}\nMessage: ${userMessage}\nTime: ${new Date().toLocaleString('en-KE')}`;
  
  await sendHtmlReport({
    to: config.emailRecipient,
    subject: `🚨 CRISIS — ${severity}`,
    template: 'alert',
    templateData: { severity: 'CRITICAL', alerts: [`User ${userId}: "${userMessage}"`], source: `Crisis Detection • ${severity}` },
  });

  await sendPlain(config.emailRecipient, `🚨 Maureonix Crisis — ${severity}`, text);
  await mirrorToWhatsApp(text);
}

/* ───────────────────────────────────────────────────────────────
   EMAIL CHAT HANDLERS
   ─────────────────────────────────────────────────────────────── */
async function handleEmailChat({ subject, body, messageId, from }) {
  reportState.emailsReceived++;
  if (!AI?.ultimateAI) {
    await sendPlain(from, 'Re: ' + subject, 'AI engine offline. Message saved.');
    return;
  }
  try {
    const prompt = `Owner emailed me. Respond professionally as Maureonix AI.\nSubject: ${subject}\nMessage: ${body}\nUptime: ${formatUptime(process.uptime())}, Emails: ${getStats().emailsSent}`;
    const res = await AI.ultimateAI(prompt, 'system', 'deepseek');
    await sendHtmlReport({
      to: from, subject: `Re: ${subject}`, template: 'chat',
      templateData: { header: 'Response from Maureonix', message: res.text || res, isReceipt: false },
      inReplyTo: messageId,
    });
  } catch (err) {
    await sendPlain(from, 'Re: ' + subject, 'Error generating response. Try WhatsApp.');
  }
}

async function handleReportRequest({ subject, body }) {
  const lower = (subject + ' ' + body).toLowerCase();
  if (lower.includes('weekly')) await sendWeeklyReport();
  else if (lower.includes('monthly')) await sendMonthlyReport();
  else await sendDailyReport();
}

async function handleBackupRequest() {
  await performAutoBackup();
}

async function handleLearnRequest({ subject, body }) {
  // Extract curriculum name from email
  const match = body.match(/learn\s+(.+)/i) || subject.match(/learn\s+(.+)/i);
  const curriculumName = match ? match[1].trim() : 'email_curriculum';
  
  // Save email body as curriculum
  const curriculumPath = path.join(process.cwd(), 'curriculum', `${curriculumName}.txt`);
  fs.writeFileSync(curriculumPath, body);
  
  await sendPlain(config.emailRecipient, `📚 Learning: ${curriculumName}`, 
    `I've saved your email as a new curriculum: "${curriculumName}".\nI'll learn it during the next scan cycle and send you a report when complete.`);
}

/* ───────────────────────────────────────────────────────────────
   DYNAMIC EMAIL COMMAND — Send to ANY recipient
   ─────────────────────────────────────────────────────────────── */
async function sendDynamicEmail(to, subject, text, html, attachments = []) {
  if (!to || !to.includes('@')) {
    return { success: false, error: 'Invalid email address' };
  }
  
  console.log(`[EmailReports] 📤 Sending dynamic email to ${to}`);
  const result = await sendToAny({ to, subject, text, html, attachments });
  
  if (result.success) {
    await mirrorToWhatsApp(`📤 Email sent to ${to}: "${subject}"`);
  }
  
  return result;
}

/* ───────────────────────────────────────────────────────────────
   NOTIFICATIONS
   ─────────────────────────────────────────────────────────────── */
async function sendBootNotification() {
  await sendHtmlReport({
    to: config.emailRecipient,
    subject: `⚡ Maureonix Online — ${new Date().toLocaleTimeString('en-KE')}`,
    template: 'chat',
    templateData: {
      header: 'System Boot Complete',
      message: `Maureonix Cortex v4.0 online.\n\n📧 Email Engine: Connected\n📬 IMAP: Active\n🤖 AI Core: Ready\n🧠 Learning Engine: Active\n⏱️ Uptime: ${formatUptime(process.uptime())}\n\nSchedules:\n• Daily: 7:00 AM\n• Weekly: Monday 8:00 AM\n• Monthly: 1st @ 9:00 AM\n• Heartbeat: Every 6h\n• Backup: Every 12h\n• Learning Scan: Every 24h`,
      isReceipt: false,
    },
  });
}

async function sendHeartbeat() {
  const stats = gatherSystemStats();
  const emailStats = getStats();
  await sendHtmlReport({
    to: config.emailRecipient,
    subject: `💓 Heartbeat — ${new Date().toLocaleTimeString('en-KE')}`,
    template: 'chat',
    templateData: {
      header: 'System Heartbeat',
      message: `All systems nominal.\n\n⏱️ Uptime: ${stats.uptime}\n👥 Users: ${stats.users}\n🤖 AI Calls: ${stats.aiCalls}\n📧 Emails Today: ${emailStats.emailsSent}\n🚨 Alerts: ${reportState.alertsSent}\n💬 Chats: ${reportState.emailsReceived}\n🎓 Learning Reports: ${reportState.learningReportsSent}`,
      isReceipt: false,
    },
  });
}

/* ───────────────────────────────────────────────────────────────
   BACKUP
   ─────────────────────────────────────────────────────────────── */
async function performAutoBackup() {
  const backupPaths = [
    path.join(process.cwd(), 'database.json'),
    path.join(process.cwd(), 'config.js'),
    path.join(process.cwd(), 'learning_mastery'),
    path.join(process.cwd(), 'learning_progress'),
    path.join(process.cwd(), 'curriculum'),
    path.join(process.cwd(), 'logs'),
  ].filter(p => fs.existsSync(p));

  if (backupPaths.length === 0) return;
  const result = await createBackupAndEmail(backupPaths, 'maureonix_auto');
  if (result.success) {
    reportState.lastBackup = Date.now();
    await mirrorToWhatsApp(`💾 Auto-backup: ${result.zipName} (${result.totalSize})`);
  }
}

/* ───────────────────────────────────────────────────────────────
   UTILITIES
   ─────────────────────────────────────────────────────────────── */
function gatherSystemStats() {
  const uptime = formatUptime(process.uptime());
  const users = Object.keys(db.users || {}).length;
  const groups = Object.keys(db.groups || {}).length;
  const commandHits = db.hit ? Object.values(db.hit).reduce((a, b) => a + b, 0) : 0;
  const aiCalls = db.aiModelUsage ? Object.values(db.aiModelUsage).reduce((a, b) => a + b, 0) : 0;

  let totalCurricula = 0, avgMastery = 0;
  try {
    const masteryDir = path.join(process.cwd(), 'learning_mastery');
    if (fs.existsSync(masteryDir)) {
      const files = fs.readdirSync(masteryDir);
      let all = [];
      for (const f of files) {
        const data = JSON.parse(fs.readFileSync(path.join(masteryDir, f), 'utf8'));
        all = all.concat(data);
      }
      totalCurricula = all.length;
      if (totalCurricula) avgMastery = (all.reduce((s, h) => s + (h.mastery || 0), 0) / totalCurricula).toFixed(1);
    }
  } catch(e) {}

  const activeSessions = db.learningSessionManager?.activeSessions?.size || 0;
  const keyHealth = db.keyManager?.getReport?.() || {};
  const healthyKeys = Object.values(keyHealth).filter(k => k?.healthy).length;
  const totalKeys = Object.keys(keyHealth).length;
  const diag = db.reflectionEngine?.getDiagnostics?.() || { successRate: 'N/A', avgLatency: 'N/A' };

  return { uptime, users, groups, commandHits, aiCalls, totalCurricula, avgMastery, activeSessions, healthyKeys, totalKeys, successRate: diag.successRate, avgLatency: diag.avgLatency, emailsSent: getStats().emailsSent };
}

function formatStats(stats) {
  return {
    '⏱️ Uptime': stats.uptime,
    '👥 Total Users': stats.users.toLocaleString(),
    '🏠 Active Groups': stats.groups.toLocaleString(),
    '📟 Commands': stats.commandHits.toLocaleString(),
    '🤖 AI Calls': stats.aiCalls.toLocaleString(),
    '📚 Curricula': stats.totalCurricula,
    '🎯 Avg Mastery': stats.avgMastery + '%',
    '🧠 Active Learners': stats.activeSessions,
    '🔑 API Health': `${stats.healthyKeys}/${stats.totalKeys} healthy`,
    '📊 Success Rate': stats.successRate,
    '⚡ Avg Latency': stats.avgLatency,
    '📧 Emails Sent': stats.emailsSent,
  };
}

function makeJsonAttachment(name, data) {
  return {
    filename: `${name}_${new Date().toISOString().slice(0,10)}.json`,
    content: Buffer.from(JSON.stringify(data, null, 2)),
  };
}

async function generateMasteryCsv() {
  try {
    const masteryDir = path.join(process.cwd(), 'learning_mastery');
    if (!fs.existsSync(masteryDir)) return null;
    const files = fs.readdirSync(masteryDir);
    let csv = 'User,Curriculum,Mastery,CompletedAt\n';
    for (const f of files) {
      const data = JSON.parse(fs.readFileSync(path.join(masteryDir, f), 'utf8'));
      data.forEach(row => {
        csv += `${row.userId || 'system'},${row.curriculum || 'unknown'},${row.mastery || 0},${row.completedAt || ''}\n`;
      });
    }
    return { filename: `mastery_export_${new Date().toISOString().slice(0,10)}.csv`, content: Buffer.from(csv) };
  } catch { return null; }
}

async function mirrorToWhatsApp(text) {
  if (!nimesha || !config.ownerNumber) return;
  try {
    const ownerJid = Array.isArray(config.ownerNumber) 
      ? config.ownerNumber[0] + '@s.whatsapp.net'
      : config.ownerNumber + '@s.whatsapp.net';
    await nimesha.sendMessage(ownerJid, { text });
  } catch (e) { console.error('[EmailReports] WhatsApp mirror failed:', e.message); }
}

function getReportState() {
    return { ...reportState };
}

/* ───────────────────────────────────────────────────────────────
   EXPORTS
   ─────────────────────────────────────────────────────────────── */
module.exports = {
  initEmailReports,
  sendCrisisAlert,
  sendDailyReport,
  sendWeeklyReport,
  sendMonthlyReport,
  sendLearningReport,      // NEW
  sendDynamicEmail,        // NEW: Command to send to anyone
  performAutoBackup,
  scanAndLearnCurriculum,  // NEW
  getReportState: () => ({ ...reportState }),
};
