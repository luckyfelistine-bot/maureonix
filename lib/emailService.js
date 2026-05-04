/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  ⚡ MAUREONIX EMAIL INFRASTRUCTURE v4.0                      ║
 * ║  SMTP Sender • IMAP Reader • HTML Templates • Backup Engine  ║
 * ║  Dynamic Recipients • Chat • Receipts • Delivery Tracking    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const nodemailer = require('nodemailer');
const Imap = require('node-imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const config = require('../config');

/* ───────────────────────────────────────────────────────────────
   CONFIGURATION & STATE
   ─────────────────────────────────────────────────────────────── */
const SMTP_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: config.emailSender,
    pass: (config.emailAppPassword || '').replace(/\s/g, ''),
  },
  connectionTimeout: 20000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
  pool: true,
  maxConnections: 5,
  maxMessages: 150,
};

const IMAP_CONFIG = {
  user: config.emailSender,
  password: (config.emailAppPassword || '').replace(/\s/g, ''),
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  connTimeout: 30000,
  authTimeout: 30000,
};

let transporter = null;
let isConnected = false;
let messageCounter = 0;
let imapConnection = null;
let isReading = false;

/* ───────────────────────────────────────────────────────────────
   FUTURISTIC HTML TEMPLATE ENGINE — Glassmorphic Dark Neon
   ─────────────────────────────────────────────────────────────── */
const Templates = {
  base: ({ title, body, accent = '#00f0ff', icon = '⚡', footerNote = '' }) => {
    const ts = new Date().toLocaleString('en-KE', { dateStyle: 'full', timeStyle: 'short' });
    return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${title}</title>
<style>
@media only screen and (max-width:600px){
  .container{width:100%!important;max-width:100%!important;}
  .pad{padding:20px!important;}
  .stack{display:block!important;width:100%!important;}
  .hide-mobile{display:none!important;}
  .metric-box{padding:12px!important;}
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#050508;mso-line-height-rule:exactly;">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background-color:#050508;background-image:radial-gradient(circle at 50% 0%,#1a1a2e 0%,#050508 70%);">
  <tr>
    <td align="center" style="padding:40px 10px;">
      <table role="presentation" class="container" cellpadding="0" cellspacing="0" style="width:640px;max-width:640px;border-collapse:collapse;background-color:#0f0f1a;border:1px solid #1e1e2d;border-radius:16px;overflow:hidden;box-shadow:0 0 60px rgba(0,240,255,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,${accent}22 0%,#7c3aed22 100%);border-bottom:1px solid ${accent}44;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
              <tr>
                <td class="pad" style="padding:32px 40px;text-align:center;">
                  <div style="font-size:36px;line-height:1;margin-bottom:8px;">${icon}</div>
                  <h1 style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:1px;text-transform:uppercase;">Maureonix Cortex</h1>
                  <p style="margin:8px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:${accent};letter-spacing:3px;text-transform:uppercase;">${title}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="pad" style="padding:40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
              ${body}
            </table>
          </td>
        </tr>
        <tr>
          <td style="background-color:#0a0a14;border-top:1px solid #1e1e2d;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
              <tr>
                <td class="pad" style="padding:24px 40px;text-align:center;">
                  <p style="margin:0 0 6px 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:#555;">Neural Network Operations Center • Nairobi, Kenya 🇰🇪</p>
                  <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;color:#333;">${ts}</p>
                  ${footerNote ? `<p style="margin:12px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;color:${accent};">${footerNote}</p>` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
  },

  report: ({ period, stats, insights, type = 'DAILY' }) => {
    const accent = type === 'CRISIS' ? '#ff2a6d' : type === 'WEEKLY' ? '#7c3aed' : type === 'MONTHLY' ? '#00ff88' : type === 'LEARNING' ? '#ffd700' : '#00f0ff';
    const icon = type === 'CRISIS' ? '🚨' : type === 'WEEKLY' ? '📈' : type === 'MONTHLY' ? '🌌' : type === 'LEARNING' ? '🧠' : '📊';
    
    const statRows = Object.entries(stats).map(([label, value]) => `
      <tr>
        <td class="stack" style="padding:10px 0;border-bottom:1px solid #1e1e2d;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#888;width:50%;">${label}</td>
              <td style="font-family:'SF Mono',Monaco,'Cascadia Code',monospace;font-size:15px;color:#fff;text-align:right;font-weight:600;">${value}</td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('');

    const insightBlock = insights ? `
      <tr>
        <td style="padding-top:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:linear-gradient(135deg,${accent}11 0%,transparent 100%);border-left:3px solid ${accent};border-radius:0 8px 8px 0;">
            <tr><td style="padding:16px 20px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#ccc;line-height:1.6;">${insights.replace(/\n/g, '<br>')}</td></tr>
          </table>
        </td>
      </tr>
    ` : '';

    const body = `
      <tr>
        <td style="padding-bottom:24px;">
          <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#aaa;text-transform:uppercase;letter-spacing:2px;">Reporting Period</p>
          <p style="margin:6px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:22px;color:#fff;font-weight:700;">${period}</p>
        </td>
      </tr>
      ${statRows}
      ${insightBlock}
      <tr>
        <td style="padding-top:24px;text-align:center;">
          <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;color:#444;">Generated by Maureonix AI Engine v4.0 • DeepSeek Neural Core</p>
        </td>
      </tr>
    `;

    return Templates.base({ title: `${type} SYSTEM REPORT`, body, accent, icon });
  },

  alert: ({ severity, alerts, source = 'Anomaly Detector' }) => {
    const accent = severity === 'CRITICAL' ? '#ff2a6d' : severity === 'WARNING' ? '#ffc800' : '#00f0ff';
    const icon = severity === 'CRITICAL' ? '🔴' : severity === 'WARNING' ? '🟡' : '🔵';
    const alertItems = alerts.map(a => `
      <tr>
        <td style="padding:12px 16px;background:#0a0a14;border-left:3px solid ${accent};margin-bottom:8px;">
          <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#ddd;">${a}</p>
        </td>
      </tr>
    `).join('');

    const body = `
      <tr>
        <td style="padding-bottom:16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="background:${accent}22;border:1px solid ${accent}44;border-radius:8px;padding:16px;text-align:center;">
                <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:28px;font-weight:800;color:${accent};text-transform:uppercase;letter-spacing:2px;">${severity} ALERT</p>
                <p style="margin:6px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:#888;">Source: ${source}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${alertItems}
      <tr>
        <td style="padding-top:16px;">
          <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:#555;text-align:center;">Auto-escalation active • WhatsApp mirror dispatched</p>
        </td>
      </tr>
    `;

    return Templates.base({ title: 'Real-Time Alert', body, accent, icon });
  },

  chat: ({ header, message, isReceipt = false }) => {
    const accent = isReceipt ? '#ffd700' : '#7c3aed';
    const icon = isReceipt ? '✅' : '💬';
    const body = `
      <tr>
        <td style="padding-bottom:20px;">
          <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:18px;color:#fff;font-weight:600;">${header}</p>
        </td>
      </tr>
      <tr>
        <td style="background:#0a0a14;border:1px solid #1e1e2d;border-radius:12px;padding:24px;">
          <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:#ddd;line-height:1.7;">${message.replace(/\n/g, '<br>')}</p>
        </td>
      </tr>
      ${!isReceipt ? `
      <tr>
        <td style="padding-top:20px;text-align:center;">
          <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#666;">Reply directly to this email to continue the conversation</p>
        </td>
      </tr>` : ''}
    `;

    return Templates.base({ 
      title: isReceipt ? 'Message Received' : 'Neural Response', 
      body, 
      accent, 
      icon,
      footerNote: isReceipt ? 'Thread ID: ' + Date.now().toString(36).toUpperCase() : ''
    });
  },

  learning: ({ curriculum, mastery, chunks, insights, achievements }) => {
    const accent = '#ffd700';
    const icon = '🎓';
    const achievementBadges = (achievements || []).map(a => `
      <tr>
        <td class="metric-box" style="padding:16px;background:linear-gradient(135deg,#ffd70011 0%,#ff8c0011 100%);border:1px solid #ffd70033;border-radius:8px;text-align:center;width:30%;">
          <p style="margin:0;font-size:24px;">${a.icon}</p>
          <p style="margin:6px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:#ffd700;font-weight:600;">${a.name}</p>
          <p style="margin:4px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:10px;color:#888;">${a.desc}</p>
        </td>
      </tr>
    `).join('');

    const body = `
      <tr>
        <td style="padding-bottom:24px;">
          <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#aaa;text-transform:uppercase;letter-spacing:2px;">Learning Achievement</p>
          <p style="margin:6px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:24px;color:#fff;font-weight:700;">${curriculum}</p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td class="metric-box" style="padding:20px;background:#0a0a14;border:1px solid #1e1e2d;border-radius:12px;text-align:center;">
                <p style="margin:0;font-family:'SF Mono',monospace;font-size:36px;color:#ffd700;font-weight:800;">${mastery}%</p>
                <p style="margin:6px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:#888;">Mastery Level</p>
              </td>
              <td style="width:16px;"></td>
              <td class="metric-box" style="padding:20px;background:#0a0a14;border:1px solid #1e1e2d;border-radius:12px;text-align:center;">
                <p style="margin:0;font-family:'SF Mono',monospace;font-size:36px;color:#00f0ff;font-weight:800;">${chunks}</p>
                <p style="margin:6px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:#888;">Chunks Mastered</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${insights ? `
      <tr>
        <td style="padding-bottom:20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:linear-gradient(135deg,#ffd70008 0%,transparent 100%);border-left:3px solid #ffd700;border-radius:0 8px 8px 0;">
            <tr><td style="padding:16px 20px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#ccc;line-height:1.6;">${insights.replace(/\n/g, '<br>')}</td></tr>
          </table>
        </td>
      </tr>` : ''}
      ${achievementBadges ? `
      <tr>
        <td style="padding-top:16px;">
          <p style="margin:0 0 12px 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#888;">Achievements Unlocked</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>${achievementBadges}</tr>
          </table>
        </td>
      </tr>` : ''}
    `;

    return Templates.base({ title: 'Learning Report', body, accent, icon });
  },

  backup: ({ files, totalSize, duration, manifest }) => {
    const fileRows = files.map(f => `
      <tr>
        <td class="stack" style="padding:8px 0;border-bottom:1px solid #1e1e2d;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="font-family:'SF Mono',monospace;font-size:12px;color:#aaa;">${f.name}</td>
              <td style="font-family:'SF Mono',monospace;font-size:12px;color:#00ff88;text-align:right;">${f.size}</td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('');

    const body = `
      <tr>
        <td style="padding-bottom:20px;">
          <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#aaa;">Secure offsite backup completed successfully</p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#00ff8811;border:1px solid #00ff8833;border-radius:8px;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#00ff88;"><strong>Total Size:</strong> ${totalSize} &nbsp;|&nbsp; <strong>Duration:</strong> ${duration} &nbsp;|&nbsp; <strong>Files:</strong> ${files.length}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${fileRows}
      <tr>
        <td style="padding-top:20px;">
          <p style="margin:0;font-family:'SF Mono',monospace;font-size:11px;color:#444;line-height:1.5;">${manifest}</p>
        </td>
      </tr>
    `;

    return Templates.base({ title: 'Backup Manifest', body, accent: '#00ff88', icon: '💾' });
  },
};

/* ───────────────────────────────────────────────────────────────
   TRANSPORTER MANAGEMENT
   ─────────────────────────────────────────────────────────────── */
function getTransporter() {
  if (!transporter && SMTP_CONFIG.auth.user && SMTP_CONFIG.auth.pass) {
    transporter = nodemailer.createTransport(SMTP_CONFIG);
    transporter.on('idle', () => { isConnected = true; });
    transporter.on('error', (err) => {
      console.error('[EmailService] Transporter error:', err.message);
      isConnected = false;
      transporter = null;
    });
  }
  return transporter;
}

async function verifyConnection() {
  const t = getTransporter();
  if (!t) {
    console.error('[EmailService] ❌ No transporter — check emailSender and emailAppPassword');
    return false;
  }
  try {
    await t.verify();
    isConnected = true;
    console.log('[EmailService] ✅ SMTP verified — Gmail ready');
    return true;
  } catch (err) {
    isConnected = false;
    transporter = null;
    console.error('[EmailService] ❌ SMTP verification failed:', err.message);
    return false;
  }
}

/* ───────────────────────────────────────────────────────────────
   CORE SEND FUNCTIONS — Now with DYNAMIC RECIPIENTS
   ─────────────────────────────────────────────────────────────── */
async function sendEmail({ 
  to, 
  subject, 
  text, 
  html, 
  attachments = [], 
  replyTo, 
  inReplyTo, 
  references,
  priority = 'normal' 
}) {
  const t = getTransporter();
  if (!t) {
    console.error('[EmailService] ❌ Cannot send — no transporter');
    return { success: false, error: 'No transporter', messageId: null };
  }

  const mailOptions = {
    from: `"Maureonix Cortex" <${config.emailSender}>`,
    to: to || config.emailRecipient,
    subject,
    text: text || '',
    html: html || '',
    attachments,
    priority,
    headers: {},
  };

  if (replyTo) mailOptions.replyTo = replyTo;
  if (inReplyTo) mailOptions.headers['In-Reply-To'] = inReplyTo;
  if (references) mailOptions.headers['References'] = references;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const info = await t.sendMail(mailOptions);
      messageCounter++;
      console.log(`[EmailService] ✅ Sent "${subject}" to ${mailOptions.to}`);
      return { success: true, error: null, messageId: info.messageId };
    } catch (err) {
      console.error(`[EmailService] ⚠️ Attempt ${attempt}/3 failed:`, err.message);
      if (attempt === 3) return { success: false, error: err.message, messageId: null };
      await new Promise(r => setTimeout(r, 5000 * attempt));
    }
  }
}

/**
 * Send HTML report using templates
 */
async function sendHtmlReport({ to, subject, template, templateData, attachments = [], inReplyTo }) {
  if (!Templates[template]) {
    console.error(`[EmailService] Unknown template: ${template}`);
    return { success: false, error: 'Unknown template' };
  }
  const html = Templates[template](templateData);
  const text = `[Maureonix ${template.toUpperCase()}] ${subject}`;
  return sendEmail({ to, subject, text, html, attachments, inReplyTo, priority: template === 'alert' ? 'high' : 'normal' });
}

/**
 * Send to ANY dynamic recipient (for commands)
 */
async function sendToAny({ to, subject, text, html, attachments = [] }) {
  return sendEmail({ to, subject, text, html, attachments });
}

/**
 * Send plain text fallback
 */
async function sendPlain(to, subject, text) {
  return sendEmail({ to, subject, text });
}

/* ───────────────────────────────────────────────────────────────
   IMAP INBOX READER — Two-Way Email Chat + Learning Ingestion
   ─────────────────────────────────────────────────────────────── */
async function startInboxMonitor(handlers = {}) {
  if (isReading) return;
  const imap = new Imap(IMAP_CONFIG);
  
  imap.once('ready', () => {
    console.log('[EmailService] 📬 IMAP connected');
    isReading = true;
    imapConnection = imap;
    openInboxAndFetch(imap, handlers);
  });

  imap.once('error', (err) => {
    console.error('[EmailService] IMAP error:', err.message);
    isReading = false;
    imapConnection = null;
    setTimeout(() => startInboxMonitor(handlers), 30000);
  });

  imap.once('end', () => {
    isReading = false;
    imapConnection = null;
  });

  imap.connect();
}

function openInboxAndFetch(imap, handlers) {
  imap.openBox('INBOX', false, (err, box) => {
    if (err) { console.error('[EmailService] Inbox open error:', err); return; }
    
    const searchCriteria = [['UNSEEN'], ['FROM', config.emailRecipient]];
    const fetchOptions = {
      bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID IN-REPLY-TO REFERENCES)', 'TEXT'],
      markSeen: true,
      struct: true,
    };

    imap.search(searchCriteria, (err, results) => {
      if (err || !results || results.length === 0) {
        scheduleNextCheck(imap, handlers);
        return;
      }

      console.log(`[EmailService] 📨 ${results.length} new email(s) from owner`);
      const f = imap.fetch(results, fetchOptions);
      const emails = [];

      f.on('message', (msg, seqno) => {
        const emailData = { seqno, headers: {}, body: '' };
        msg.on('body', (stream, info) => {
          let buffer = '';
          stream.on('data', chunk => buffer += chunk.toString('utf8'));
          stream.on('end', () => {
            if (info.which === 'TEXT') emailData.body = buffer;
            else {
              buffer.split('\n').forEach(line => {
                const [key, ...vals] = line.split(':');
                if (key && vals.length) emailData.headers[key.trim().toLowerCase()] = vals.join(':').trim();
              });
            }
          });
        });
        msg.once('end', () => emails.push(emailData));
      });

      f.once('error', (err) => console.error('[EmailService] Fetch error:', err));
      f.once('end', async () => {
        for (const email of emails) await processIncomingEmail(email, handlers);
        scheduleNextCheck(imap, handlers);
      });
    });
  });
}

function scheduleNextCheck(imap, handlers) {
  setTimeout(() => {
    if (imap.state === 'authenticated') openInboxAndFetch(imap, handlers);
    else { isReading = false; startInboxMonitor(handlers); }
  }, 120000);
}

async function processIncomingEmail(email, handlers) {
  try {
    const subject = email.headers['subject'] || 'No Subject';
    const messageId = email.headers['message-id'] || '';
    const from = email.headers['from'] || '';
    const body = email.body.trim();

    console.log(`[EmailService] 📧 Processing: "${subject}"`);

    // Send read receipt
    await sendHtmlReport({
      to: config.emailRecipient,
      subject: `✅ Received: ${subject}`,
      template: 'chat',
      templateData: {
        header: 'Message Confirmed',
        message: `Received at ${new Date().toLocaleTimeString('en-KE')}.\nSubject: ${subject}\nProcessing...`,
        isReceipt: true,
      },
      inReplyTo: messageId,
    });

    const lowerSubject = subject.toLowerCase();
    const lowerBody = body.toLowerCase();

    // Route by intent
    if (lowerSubject.includes('report') || lowerBody.includes('send report')) {
      if (handlers.onReportRequest) await handlers.onReportRequest({ subject, body, messageId });
      return;
    }
    if (lowerSubject.includes('backup') || lowerBody.includes('backup now')) {
      if (handlers.onBackupRequest) await handlers.onBackupRequest({ subject, body, messageId });
      return;
    }
    if (lowerSubject.includes('learn') || lowerBody.includes('teach me') || lowerBody.includes('curriculum')) {
      if (handlers.onLearnRequest) await handlers.onLearnRequest({ subject, body, messageId, from });
      return;
    }
    if (lowerSubject.includes('status') || lowerBody.includes('are you there')) {
      await sendHtmlReport({
        to: config.emailRecipient,
        subject: `💓 System Heartbeat`,
        template: 'chat',
        templateData: {
          header: 'System Status: Online',
          message: `All systems operational.\n📧 Emails sent: ${messageCounter}\n⏱️ Uptime: ${formatUptime(process.uptime())}\n🧠 AI Engine: Active\n📬 IMAP: Connected`,
          isReceipt: false,
        },
        inReplyTo: messageId,
      });
      return;
    }
    if (handlers.onChat) await handlers.onChat({ subject, body, messageId, from });

  } catch (err) {
    console.error('[EmailService] Error processing email:', err);
  }
}

/* ───────────────────────────────────────────────────────────────
   BACKUP ENGINE
   ─────────────────────────────────────────────────────────────── */
async function createBackupAndEmail(paths, label = 'system_backup') {
  const startTime = Date.now();
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const zipName = `${label}_${timestamp}.zip`;
  const zipPath = path.join(process.cwd(), 'temp', zipName);

  if (!fs.existsSync(path.dirname(zipPath))) fs.mkdirSync(path.dirname(zipPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    const files = [];

    output.on('close', async () => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
      const totalSize = formatBytes(archive.pointer());
      const manifest = files.map(f => `[${f.size}] ${f.path}`).join('\n');
      
      const result = await sendEmail({
        to: config.emailRecipient,
        subject: `💾 Backup Complete — ${label}`,
        text: `Backup ${zipName} (${totalSize}) in ${duration}`,
        html: Templates.backup({ files, totalSize, duration, manifest }),
        attachments: [{ filename: zipName, path: zipPath }],
      });

      try { fs.unlinkSync(zipPath); } catch(e) {}
      resolve({ success: result.success, zipName, totalSize, duration, error: result.error });
    });

    archive.on('warning', (err) => console.warn('[EmailService] Archive warning:', err.message));
    archive.on('error', (err) => reject(err));
    archive.on('entry', (entry) => {
      files.push({ name: entry.name, size: formatBytes(entry.stats ? entry.stats.size : 0) });
    });
    archive.pipe(output);

    for (const p of paths) {
      if (fs.existsSync(p)) {
        const stat = fs.statSync(p);
        if (stat.isDirectory()) archive.directory(p, path.basename(p));
        else archive.file(p, { name: path.basename(p) });
      }
    }
    archive.finalize();
  });
}

/* ───────────────────────────────────────────────────────────────
   UTILITIES
   ─────────────────────────────────────────────────────────────── */
function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getStats() {
  return { emailsSent: messageCounter, isConnected };
}

module.exports = {
  verifyConnection,
  sendEmail,
  sendHtmlReport,
  sendToAny,        // NEW: Dynamic recipient
  sendPlain,
  Templates,
  startInboxMonitor,
  createBackupAndEmail,
  formatUptime,
  formatBytes,
  getStats,
};
