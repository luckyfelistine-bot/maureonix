// lib/emailReports.js – Maureonix Reporting & Alert Engine
const cron = require('node-cron');
const { sendEmail } = require('./emailService');
const { diagnosticsReport, metricsCollector, anomalyDetector, predictiveAlerts } = require('./realTimeDiagnostics');
const { generateReport } = require('./reporting');
const config = require('../config');

let nimesha = null; // Baileys socket for WhatsApp mirror
let AI = null;

async function initEmailReports(nimeshaInstance, aiModule) {
    nimesha = nimeshaInstance;
    AI = aiModule;

    // ── Daily report (default 7:00 AM Africa/Nairobi) ──
    cron.schedule(config.reportDailyTime || '0 7 * * *', async () => {
        await sendDailyReport();
    }, { timezone: 'Africa/Nairobi' });

    // ── Weekly report (default Monday 8:00 AM) ──
    cron.schedule(config.reportWeeklyTime || '0 8 * * 1', async () => {
        await sendWeeklyReport();
    }, { timezone: 'Africa/Nairobi' });

    // ── Real‑time anomaly alerts (every 5 minutes) ──
    cron.schedule('*/5 * * * *', async () => {
        await checkAndSendAlerts();
    }, { timezone: 'Africa/Nairobi' });

    console.log('[EmailReports] Reporting engine started');
}

async function sendDailyReport() {
    const reportData = diagnosticsReport.generateFullReport();
    const text = diagnosticsReport.formatForWhatsApp(reportData);

    let insightText = '';
    if (AI && AI.ultimateAI) {
        try {
            const res = await AI.ultimateAI(
                `Based on these system stats, give 2-3 concise, actionable insights for the bot owner:\n${JSON.stringify(reportData)}`,
                'system',
                'deepseek'
            );
            insightText = `\n💡 *AI Insights*\n${res.text}\n`;
        } catch (e) {}
    }

    const fullText = `📊 *Daily System Report*\n\n${text}\n${insightText}`;
    const attachmentBuffer = Buffer.from(JSON.stringify(reportData, null, 2), 'utf-8');

    // Send email
    const emailSent = await sendEmail(
        config.emailRecipient,
        `Maureonix Daily Report – ${new Date().toLocaleDateString('en-KE')}`,
        fullText,
        attachmentBuffer,
        `daily_report_${new Date().toISOString().slice(0,10)}.json`
    );

    // WhatsApp mirror if email fails or always (optional)
    if (!emailSent || config.alwaysWhatsAppReport) {
        const ownerJid = config.ownerNumber[0] + '@s.whatsapp.net';
        await nimesha.sendMessage(ownerJid, { text: fullText });
    }
}

async function sendWeeklyReport() {
    const reportData = diagnosticsReport.generateFullReport();
    const text = diagnosticsReport.formatForWhatsApp(reportData);

    let insightText = '';
    if (AI && AI.ultimateAI) {
        try {
            const res = await AI.ultimateAI(
                `Analyze these weekly bot stats and give strategic recommendations:\n${JSON.stringify(reportData)}`,
                'system',
                'deepseek'
            );
            insightText = `\n💡 *AI Weekly Insights & Recommendations*\n${res.text}\n`;
        } catch (e) {}
    }

    const fullText = `📈 *Weekly System Report*\n\n${text}\n${insightText}`;
    const attachmentBuffer = Buffer.from(JSON.stringify(reportData, null, 2), 'utf-8');

    const emailSent = await sendEmail(
        config.emailRecipient,
        `Maureonix Weekly Report – ${new Date().toLocaleDateString('en-KE')}`,
        fullText,
        attachmentBuffer,
        `weekly_report_${new Date().toISOString().slice(0,10)}.json`
    );

    if (!emailSent || config.alwaysWhatsAppReport) {
        const ownerJid = config.ownerNumber[0] + '@s.whatsapp.net';
        await nimesha.sendMessage(ownerJid, { text: fullText });
    }
}

async function checkAndSendAlerts() {
    const anomalies = anomalyDetector.detect();
    const predictions = predictiveAlerts.predict();

    // Combine all alerts
    const allAlerts = [...anomalies.map(a => ({ ...a, type: 'anomaly' })), ...predictions.map(p => ({ ...p, type: 'prediction' }))];

    if (allAlerts.length === 0) return;

    // Rate‑limit: only send alerts if at least one critical or more than 3 warnings
    const critical = allAlerts.filter(a => a.severity === 'critical');
    const warnings = allAlerts.filter(a => a.severity === 'warning');
    if (critical.length === 0 && warnings.length < 3) return;

    // Build alert message
    let msg = `🚨 *Real‑Time System Alerts*\n\n`;
    if (critical.length > 0) msg += `🔴 Critical:\n${critical.map(a => `• ${a.message}`).join('\n')}\n\n`;
    if (warnings.length > 0) msg += `🟡 Warnings:\n${warnings.slice(0, 5).map(a => `• ${a.message}`).join('\n')}\n\n`;
    msg += `_Generated at ${new Date().toLocaleString('en-KE')}_`;

    // Send email only for critical or batch of warnings
    if (critical.length > 0) {
        await sendEmail(
            config.emailRecipient,
            `⚠️ Maureonix Alert – ${critical.length} critical issues`,
            msg
        );
    } else if (warnings.length >= 3) {
        await sendEmail(
            config.emailRecipient,
            `ℹ️ Maureonix Notice – ${warnings.length} warnings`,
            msg
        );
    }

    // Always WhatsApp mirror for alerts
    const ownerJid = config.ownerNumber[0] + '@s.whatsapp.net';
    await nimesha.sendMessage(ownerJid, { text: msg });
}

// Function to be called from crisis detection in nima_core.js
async function sendCrisisAlert(userMessage, userId, severity) {
    const msg = `🚨 *CRISIS ALERT (${severity})*\nUser: ${userId}\nMessage: ${userMessage}\nTime: ${new Date().toLocaleString()}`;
    await sendEmail(config.emailRecipient, `🚨 Maureonix Crisis – ${severity}`, msg);
    const ownerJid = config.ownerNumber[0] + '@s.whatsapp.net';
    if (nimesha) await nimesha.sendMessage(ownerJid, { text: msg });
}

module.exports = { initEmailReports, sendCrisisAlert };
