// lib/emailService.js – Maureonix Email via Resend (HTTPS)
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const config = require('../config');

/* ───────────────────────────────────────────────────────────────
   CONFIGURATION & STATE
   ─────────────────────────────────────────────────────────────── */
const resend = new Resend(config.resendApiKey);

let messageCounter = 0;

/* ───────────────────────────────────────────────────────────────
   CYBERPUNK HOLOGRAPHIC TEMPLATE ENGINE — Neural Link v4.0
   Scanlines • CRT Flicker • Neon Bloom • Hex Grid • Quantum HUD
   ─────────────────────────────────────────────────────────────── */

// Decorative helpers
const hashLine = () => {
  const chars = '0123456789ABCDEF';
  let s = '';
  for (let i = 0; i < 32; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
};

const Templates = {
  base: ({ title, body, accent = '#00f0ff', icon = '⚡', footerNote = '' }) => {
    const ts = new Date().toLocaleString('en-KE', { dateStyle: 'full', timeStyle: 'short' });
    const sessionId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const topHash = hashLine();
    const bottomHash = hashLine();

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
@keyframes flicker {
  0%,19%,21%,23%,25%,54%,56%,100%{opacity:1}
  20%,24%,55%{opacity:0.8}
}
@keyframes pulse {
  0%,100%{box-shadow:0 0 20px ${accent}22}
  50%{box-shadow:0 0 40px ${accent}55,0 0 80px ${accent}22}
}
@keyframes blink {
  0%,100%{opacity:1}
  50%{opacity:0}
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#020204;mso-line-height-rule:exactly;">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background-color:#020204;background-image:radial-gradient(circle at 50% 0%,#0d0d1a 0%,#020204 70%);">
  <!-- Quantum Status Bar -->
  <tr>
    <td style="background:#000;border-bottom:1px solid ${accent}33;padding:8px 20px;text-align:center;">
      <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:${accent};letter-spacing:3px;text-transform:uppercase;">
        <span style="display:inline-block;width:6px;height:6px;background:${accent};border-radius:50%;margin-right:8px;box-shadow:0 0 8px ${accent};"></span>
        <span style="amaureonixtion:flicker 3s infinite;">◈ NEURAL UPLINK ESTABLISHED ◈</span>
        <span style="color:#333;margin:0 10px;">||</span>
        <span style="color:#555;">SESSION:</span> <span style="color:${accent};">${sessionId}</span>
        <span style="color:#333;margin:0 10px;">||</span>
        <span style="color:#555;">ENC:</span> <span style="color:#00ff41;">QUANTUM-AES-4096</span>
      </p>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:40px 10px;">
      <!-- Main Holographic Container -->
      <table role="presentation" class="container" cellpadding="0" cellspacing="0" style="width:640px;max-width:640px;border-collapse:collapse;background-color:#0c0c14;border:1px solid ${accent}33;border-radius:4px;overflow:hidden;box-shadow:0 0 100px ${accent}11, inset 0 0 60px rgba(0,0,0,0.6);amaureonixtion:pulse 4s infinite;">
        <!-- Scanline Overlay -->
        <tr>
          <td style="height:3px;background:repeating-linear-gradient(90deg,transparent,transparent 6px,${accent}15 6px,${accent}15 12px);font-size:0;line-height:0;border-bottom:1px solid ${accent}22;">&nbsp;</td>
        </tr>
        <!-- Header Section -->
        <tr>
          <td style="background:linear-gradient(180deg,${accent}12 0%,transparent 100%);border-bottom:1px solid ${accent}22;position:relative;">
            <!-- Top Decorative Frame -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-bottom:1px solid ${accent}11;">
              <tr>
                <td style="padding:6px 12px;font-family:'Courier New',monospace;font-size:9px;color:${accent}44;text-align:left;letter-spacing:1px;">┌─[MAUREONIX_CORTEX_v4.0.1]─</td>
                <td style="padding:6px 12px;font-family:'Courier New',monospace;font-size:9px;color:${accent}44;text-align:right;letter-spacing:1px;">─[SECURE_CHANNEL]─┐</td>
              </tr>
            </table>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
              <tr>
                <td class="pad" style="padding:36px 40px 28px;text-align:center;">
                  <div style="font-size:40px;line-height:1;margin-bottom:12px;text-shadow:0 0 20px ${accent}99, 0 0 40px ${accent}55;">${icon}</div>
                  <h1 style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:4px;text-transform:uppercase;text-shadow:0 0 10px ${accent}88, 0 0 30px ${accent}44, 0 0 50px ${accent}22;">Maureonix Cortex</h1>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px auto 0;width:80%;">
                    <tr><td style="height:1px;background:linear-gradient(90deg,transparent,${accent},transparent);"></td></tr>
                  </table>
                  <p style="margin:12px 0 0 0;font-family:'Courier New',monospace;font-size:11px;color:${accent};letter-spacing:5px;text-transform:uppercase;text-shadow:0 0 8px ${accent}55;">${title}</p>
                  <p style="margin:8px 0 0 0;font-family:'Courier New',monospace;font-size:9px;color:#333;letter-spacing:2px;">${topHash}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body Section -->
        <tr>
          <td class="pad" style="padding:40px;background-image:linear-gradient(180deg,transparent 0%,${accent}02 50%,transparent 100%);">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
              ${body}
            </table>
          </td>
        </tr>
        <!-- Footer Section -->
        <tr>
          <td style="background-color:#06060c;border-top:1px solid #1a1a2e;">
            <!-- Bottom Decorative Frame -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-bottom:1px solid ${accent}11;">
              <tr>
                <td style="padding:6px 12px;font-family:'Courier New',monospace;font-size:9px;color:#333;text-align:left;letter-spacing:1px;">└─[END_TRANSMISSION]─</td>
                <td style="padding:6px 12px;font-family:'Courier New',monospace;font-size:9px;color:#333;text-align:right;letter-spacing:1px;">─[EOF]─┘</td>
              </tr>
            </table>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
              <tr>
                <td class="pad" style="padding:24px 40px;text-align:center;">
                  <p style="margin:0 0 6px 0;font-family:'Courier New',monospace;font-size:10px;color:#444;letter-spacing:2px;text-transform:uppercase;">Neural Network Operations Center • Nairobi, Kenya 🇰🇪</p>
                  <p style="margin:0;font-family:'Courier New',monospace;font-size:9px;color:#333;letter-spacing:1px;">${ts}</p>
                  <p style="margin:6px 0 0 0;font-family:'Courier New',monospace;font-size:9px;color:#222;">${bottomHash}</p>
                  ${footerNote ? `<p style="margin:14px 0 0 0;font-family:'Courier New',monospace;font-size:10px;color:${accent};text-shadow:0 0 8px ${accent}44;letter-spacing:2px;border-top:1px solid ${accent}22;display:inline-block;padding-top:8px;">${footerNote}</p>` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Bottom Scanline -->
        <tr>
          <td style="height:2px;background:repeating-linear-gradient(90deg,transparent,transparent 6px,${accent}10 6px,${accent}10 12px);font-size:0;line-height:0;border-top:1px solid ${accent}15;">&nbsp;</td>
        </tr>
      </table>
      <!-- Subtle Grid Background Hint -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:640px;max-width:640px;margin-top:8px;">
        <tr>
          <td style="text-align:center;font-family:'Courier New',monospace;font-size:8px;color:#1a1a2e;letter-spacing:4px;">◈ ◈ ◈ ◈ ◈ ◈ ◈ ◈ ◈ ◈ ◈ ◈ ◈ ◈ ◈ ◈ ◈ ◈ ◈ ◈</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
  },

  report: ({ period, stats, insights, type = 'DAILY' }) => {
    const accent = type === 'CRISIS' ? '#ff003c' : type === 'WEEKLY' ? '#bd00ff' : type === 'MONTHLY' ? '#00ff88' : type === 'LEARNING' ? '#ffd700' : '#00f0ff';
    const icon = type === 'CRISIS' ? '🚨' : type === 'WEEKLY' ? '📈' : type === 'MONTHLY' ? '🌌' : type === 'LEARNING' ? '🧠' : '📊';
    const threatLevel = type === 'CRISIS' ? 'CRITICAL' : type === 'WEEKLY' ? 'ELEVATED' : 'NORMAL';
    const threatColor = type === 'CRISIS' ? '#ff003c' : type === 'WEEKLY' ? '#bd00ff' : '#00ff88';

    const statRows = Object.entries(stats).map(([label, value], idx) => `
      <tr>
        <td class="stack" style="padding:14px 0;border-bottom:1px solid #1e1e2d;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="font-family:'Courier New',monospace;font-size:11px;color:#555;width:45%;letter-spacing:1px;text-transform:uppercase;">▸ ${label}</td>
              <td style="text-align:right;">
                <span style="font-family:'SF Mono',Monaco,'Cascadia Code',monospace;font-size:16px;color:#fff;font-weight:700;text-shadow:0 0 10px ${accent}66;">${value}</span>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:8px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;height:2px;background:#0f0f1a;border-radius:1px;overflow:hidden;">
                  <tr>
                    <td style="width:${60 + (idx % 4) * 10}%;background:linear-gradient(90deg,${accent},${accent}66);box-shadow:0 0 6px ${accent}44;"></td>
                    <td style="width:${40 - (idx % 4) * 10}%;"></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('');

    const insightBlock = insights ? `
      <tr>
        <td style="padding-top:28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:linear-gradient(135deg,${accent}08 0%,transparent 100%);border-left:2px solid ${accent};border-radius:0 8px 8px 0;">
            <tr>
              <td style="padding:6px 0 0 16px;font-family:'Courier New',monospace;font-size:9px;color:${accent};letter-spacing:2px;">◈ NEURAL INSIGHT ◈</td>
            </tr>
            <tr><td style="padding:10px 20px 16px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#bbb;line-height:1.7;">${insights.replace(/\n/g, '<br>')}</td></tr>
          </table>
        </td>
      </tr>
    ` : '';

    const body = `
      <tr>
        <td style="padding-bottom:8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="font-family:'Courier New',monospace;font-size:9px;color:#444;letter-spacing:2px;text-transform:uppercase;">Reporting Period</td>
              <td style="text-align:right;font-family:'Courier New',monospace;font-size:9px;color:${threatColor};letter-spacing:1px;">[THREAT: ${threatLevel}]</td>
            </tr>
          </table>
          <p style="margin:6px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:24px;color:#fff;font-weight:800;letter-spacing:1px;text-shadow:0 0 15px ${accent}44;">${period}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:10px;width:100%;">
            <tr><td style="height:1px;background:linear-gradient(90deg,${accent}66,transparent);"></td></tr>
          </table>
        </td>
      </tr>
      ${statRows}
      ${insightBlock}
      <tr>
        <td style="padding-top:28px;text-align:center;">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:9px;color:#333;letter-spacing:3px;text-transform:uppercase;">Generated by Maureonix AI Engine v4.0 • DeepSeek Neural Core</p>
          <p style="margin:6px 0 0 0;font-family:'Courier New',monospace;font-size:8px;color:#222;">${hashLine()}</p>
        </td>
      </tr>
    `;

    return Templates.base({ title: `${type} SYSTEM REPORT`, body, accent, icon });
  },

  alert: ({ severity, alerts, source = 'Anomaly Detector' }) => {
    const accent = severity === 'CRITICAL' ? '#ff003c' : severity === 'WARNING' ? '#ffd700' : '#00f0ff';
    const icon = severity === 'CRITICAL' ? '🔴' : severity === 'WARNING' ? '🟡' : '🔵';
    const alertItems = alerts.map((a, i) => `
      <tr>
        <td style="padding:14px 16px;background:#0a0a14;border-left:3px solid ${accent};margin-bottom:8px;border-bottom:1px solid #1a1a2e;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="font-family:'Courier New',monospace;font-size:9px;color:${accent};width:30px;">[${String(i + 1).padStart(2, '0')}]</td>
              <td style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#ddd;line-height:1.6;">${a}</td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('');

    const body = `
      <tr>
        <td style="padding-bottom:20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="background:${accent}15;border:1px solid ${accent}44;border-radius:4px;padding:20px;text-align:center;box-shadow:0 0 30px ${accent}22, inset 0 0 20px ${accent}11;">
                <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:32px;font-weight:900;color:${accent};text-transform:uppercase;letter-spacing:4px;text-shadow:0 0 20px ${accent}88;">${severity} ALERT</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:10px auto;width:60%;">
                  <tr><td style="height:2px;background:linear-gradient(90deg,transparent,${accent},transparent);"></td></tr>
                </table>
                <p style="margin:8px 0 0 0;font-family:'Courier New',monospace;font-size:11px;color:#666;letter-spacing:2px;">SOURCE: ${source}</p>
                <p style="margin:6px 0 0 0;font-family:'Courier New',monospace;font-size:9px;color:#333;">${hashLine()}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:8px;">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:9px;color:#444;letter-spacing:2px;text-transform:uppercase;">◈ Anomaly Log ◈</p>
        </td>
      </tr>
      ${alertItems}
      <tr>
        <td style="padding-top:20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid ${accent}22;padding-top:12px;">
            <tr>
              <td style="text-align:center;">
                <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:#555;letter-spacing:1px;">Auto-escalation active • WhatsApp mirror dispatched</p>
                <p style="margin:4px 0 0 0;font-family:'Courier New',monospace;font-size:8px;color:#333;">PROTOCOL: EMERGENCY_BROADCAST_v2.1</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;

    return Templates.base({ title: 'Real-Time Alert', body, accent, icon });
  },

  chat: ({ header, message, isReceipt = false }) => {
    const accent = isReceipt ? '#ffd700' : '#bd00ff';
    const icon = isReceipt ? '✅' : '💬';
    const statusText = isReceipt ? 'TRANSMISSION_RECEIVED' : 'INCOMING_TRANSMISSION';
    const body = `
      <tr>
        <td style="padding-bottom:16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="font-family:'Courier New',monospace;font-size:9px;color:${accent};letter-spacing:3px;text-transform:uppercase;">◈ ${statusText} ◈</td>
              <td style="text-align:right;"><span style="display:inline-block;width:6px;height:6px;background:${accent};border-radius:50%;box-shadow:0 0 8px ${accent};amaureonixtion:flicker 2s infinite;"></span></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:20px;">
          <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:20px;color:#fff;font-weight:700;letter-spacing:1px;text-shadow:0 0 10px ${accent}33;">${header}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px;width:40%;">
            <tr><td style="height:1px;background:linear-gradient(90deg,${accent},transparent);"></td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#0a0a14;border:1px solid ${accent}33;border-radius:4px;padding:24px;box-shadow:inset 0 0 30px rgba(0,0,0,0.5), 0 0 20px ${accent}11;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="width:20px;font-family:'Courier New',monospace;font-size:12px;color:${accent};vertical-align:top;">></td>
              <td style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:#ddd;line-height:1.8;">${message.replace(/\n/g, '<br>')}</td>
            </tr>
          </table>
          ${!isReceipt ? `<p style="margin:16px 0 0 0;font-family:'Courier New',monospace;font-size:12px;color:${accent};amaureonixtion:blink 1.5s infinite;">▮</p>` : ''}
        </td>
      </tr>
      ${!isReceipt ? `
      <tr>
        <td style="padding-top:20px;text-align:center;">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:#444;letter-spacing:1px;">Reply directly to this email to continue the conversation</p>
          <p style="margin:4px 0 0 0;font-family:'Courier New',monospace;font-size:8px;color:#222;">${hashLine()}</p>
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
    const xpWidth = Math.min(100, Math.max(0, parseInt(mastery) || 0));

    const achievementBadges = (achievements || []).map(a => `
      <tr>
        <td class="metric-box" style="padding:16px;background:linear-gradient(135deg,#ffd70008 0%,#ff8c0008 100%);border:1px solid #ffd70033;border-radius:4px;text-align:center;">
          <p style="margin:0;font-size:28px;text-shadow:0 0 15px #ffd70055;">${a.icon}</p>
          <p style="margin:8px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:#ffd700;font-weight:700;letter-spacing:1px;text-shadow:0 0 8px #ffd70033;">${a.name}</p>
          <p style="margin:4px 0 0 0;font-family:'Courier New',monospace;font-size:9px;color:#666;letter-spacing:1px;">${a.desc}</p>
        </td>
      </tr>
    `).join('');

    const body = `
      <tr>
        <td style="padding-bottom:8px;">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:9px;color:#555;letter-spacing:3px;text-transform:uppercase;">Learning Achievement</p>
          <p style="margin:8px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:26px;color:#fff;font-weight:800;letter-spacing:1px;text-shadow:0 0 15px ${accent}33;">${curriculum}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:10px;width:100%;">
            <tr><td style="height:1px;background:linear-gradient(90deg,${accent},transparent);"></td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td class="metric-box" style="padding:24px;background:#0a0a14;border:1px solid ${accent}33;border-radius:4px;text-align:center;box-shadow:0 0 20px ${accent}11;">
                <p style="margin:0;font-family:'SF Mono',monospace;font-size:42px;color:${accent};font-weight:900;text-shadow:0 0 20px ${accent}55;">${mastery}%</p>
                <p style="margin:8px 0 0 0;font-family:'Courier New',monospace;font-size:10px;color:#666;letter-spacing:2px;text-transform:uppercase;">Mastery Level</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:12px;width:100%;height:4px;background:#0f0f1a;border-radius:2px;overflow:hidden;">
                  <tr>
                    <td style="width:${xpWidth}%;background:linear-gradient(90deg,${accent},#ff8c00);box-shadow:0 0 8px ${accent}44;"></td>
                    <td style="width:${100 - xpWidth}%;"></td>
                  </tr>
                </table>
              </td>
              <td style="width:16px;"></td>
              <td class="metric-box" style="padding:24px;background:#0a0a14;border:1px solid #1e1e2d;border-radius:4px;text-align:center;">
                <p style="margin:0;font-family:'SF Mono',monospace;font-size:42px;color:#00f0ff;font-weight:900;text-shadow:0 0 20px #00f0ff55;">${chunks}</p>
                <p style="margin:8px 0 0 0;font-family:'Courier New',monospace;font-size:10px;color:#666;letter-spacing:2px;text-transform:uppercase;">Chunks Mastered</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:12px;width:100%;height:4px;background:#0f0f1a;border-radius:2px;overflow:hidden;">
                  <tr>
                    <td style="width:75%;background:linear-gradient(90deg,#00f0ff,#0088ff);box-shadow:0 0 8px #00f0ff44;"></td>
                    <td style="width:25%;"></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${insights ? `
      <tr>
        <td style="padding-bottom:20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:linear-gradient(135deg,#ffd70006 0%,transparent 100%);border-left:2px solid ${accent};border-radius:0 8px 8px 0;">
            <tr>
              <td style="padding:6px 0 0 16px;font-family:'Courier New',monospace;font-size:9px;color:${accent};letter-spacing:2px;">◈ SYNAPTIC ANALYSIS ◈</td>
            </tr>
            <tr><td style="padding:10px 20px 16px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#bbb;line-height:1.7;">${insights.replace(/\n/g, '<br>')}</td></tr>
          </table>
        </td>
      </tr>` : ''}
      ${achievementBadges ? `
      <tr>
        <td style="padding-top:16px;">
          <p style="margin:0 0 16px 0;font-family:'Courier New',monospace;font-size:10px;color:#555;letter-spacing:2px;text-transform:uppercase;">◈ Achievements Unlocked ◈</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>${achievementBadges}</tr>
          </table>
        </td>
      </tr>` : ''}
      <tr>
        <td style="padding-top:20px;text-align:center;">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:9px;color:#333;letter-spacing:2px;">NEURAL PATHWAY SYNCHRONIZED • KNOWLEDGE GRAPH UPDATED</p>
        </td>
      </tr>
    `;

    return Templates.base({ title: 'Learning Report', body, accent, icon });
  },

  backup: ({ files, totalSize, duration, manifest }) => {
    const fileRows = files.map((f, i) => `
      <tr>
        <td class="stack" style="padding:10px 0;border-bottom:1px solid #1e1e2d;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="font-family:'Courier New',monospace;font-size:10px;color:#444;width:24px;">${String(i + 1).padStart(2, '0')}</td>
              <td style="font-family:'SF Mono',monospace;font-size:12px;color:#aaa;">${f.name}</td>
              <td style="font-family:'SF Mono',monospace;font-size:12px;color:#00ff88;text-align:right;text-shadow:0 0 8px #00ff8833;">${f.size}</td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('');

    const body = `
      <tr>
        <td style="padding-bottom:8px;">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:9px;color:#555;letter-spacing:3px;text-transform:uppercase;">Archive Manifest</p>
          <p style="margin:8px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;color:#fff;font-weight:600;">Secure offsite backup completed successfully</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:10px;width:100%;">
            <tr><td style="height:1px;background:linear-gradient(90deg,#00ff88,transparent);"></td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#00ff8808;border:1px solid #00ff8833;border-radius:4px;box-shadow:0 0 20px #00ff8811;">
            <tr>
              <td style="padding:18px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
                  <tr>
                    <td style="font-family:'Courier New',monospace;font-size:11px;color:#00ff88;letter-spacing:1px;"><strong>TOTAL:</strong> ${totalSize}</td>
                    <td style="font-family:'Courier New',monospace;font-size:11px;color:#00ff88;letter-spacing:1px;text-align:center;"><strong>DURATION:</strong> ${duration}</td>
                    <td style="font-family:'Courier New',monospace;font-size:11px;color:#00ff88;letter-spacing:1px;text-align:right;"><strong>FILES:</strong> ${files.length}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:8px;">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:9px;color:#444;letter-spacing:2px;text-transform:uppercase;">◈ File Index ◈</p>
        </td>
      </tr>
      ${fileRows}
      <tr>
        <td style="padding-top:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#0a0a14;border:1px solid #1e1e2d;border-radius:4px;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0 0 8px 0;font-family:'Courier New',monospace;font-size:9px;color:#333;letter-spacing:1px;">◈ CHECKSUM MANIFEST ◈</p>
                <p style="margin:0;font-family:'SF Mono',monospace;font-size:10px;color:#444;line-height:1.6;word-break:break-all;">${manifest}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;

    return Templates.base({ title: 'Backup Manifest', body, accent: '#00ff88', icon: '💾' });
  },
};

/* ───────────────────────────────────────────────────────────────
   CORE SEND FUNCTIONS (now using Resend)
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
  if (!resend) {
    console.error('[EmailService] ❌ Resend not initialized');
    return { success: false, error: 'No Resend API key', messageId: null };
  }

  const mailOptions = {
    from: 'Maureonix Cortex <onboarding@resend.dev>',
    to: to || config.emailRecipient,
    subject,
    text: text || '',
    html: html || '',
    attachments: attachments.map(a => ({
      filename: a.filename,
      content: a.content.toString('base64'),
    })),
    headers: {},
  };

  if (replyTo) mailOptions.reply_to = replyTo;
  if (inReplyTo) mailOptions.headers['In-Reply-To'] = inReplyTo;
  if (references) mailOptions.headers['References'] = references;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { data, error } = await resend.emails.send(mailOptions);
      if (error) throw new Error(error.message);
      messageCounter++;
      console.log(`[EmailService] ✅ Sent "${subject}" to ${mailOptions.to}`);
      return { success: true, error: null, messageId: data.id };
    } catch (err) {
      console.error(`[EmailService] ⚠️ Attempt ${attempt}/3 failed:`, err.message);
      if (attempt === 3) return { success: false, error: err.message, messageId: null };
      await new Promise(r => setTimeout(r, 5000 * attempt));
    }
  }
}

async function sendHtmlReport({ to, subject, template, templateData, attachments = [], inReplyTo }) {
  if (!Templates[template]) {
    console.error(`[EmailService] Unknown template: ${template}`);
    return { success: false, error: 'Unknown template' };
  }
  const html = Templates[template](templateData);
  const text = `[Maureonix ${template.toUpperCase()}] ${subject}`;
  return sendEmail({ to, subject, text, html, attachments, inReplyTo, priority: template === 'alert' ? 'high' : 'normal' });
}

async function sendToAny({ to, subject, text, html, attachments = [] }) {
  return sendEmail({ to, subject, text, html, attachments });
}

async function sendPlain(to, subject, text) {
  return sendEmail({ to, subject, text });
}

/* ───────────────────────────────────────────────────────────────
   IMAP INBOX READER – not supported on Railway, stub kept for compatibility
   ─────────────────────────────────────────────────────────────── */
async function startInboxMonitor(handlers = {}) {
  console.warn('[EmailService] IMAP inbox monitoring not available on this platform.');
}

/* ───────────────────────────────────────────────────────────────
   BACKUP ENGINE (unchanged logic, uses sendEmail)
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
        attachments: [{ filename: zipName, content: fs.readFileSync(zipPath) }],
      });

      try { fs.unlinkSync(zipPath); } catch (e) { }
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
  return { emailsSent: messageCounter, isConnected: true };
}

module.exports = {
  sendEmail,
  sendHtmlReport,
  sendToAny,
  sendPlain,
  Templates,
  startInboxMonitor,
  createBackupAndEmail,
  formatUptime,
  formatBytes,
  getStats,
};
