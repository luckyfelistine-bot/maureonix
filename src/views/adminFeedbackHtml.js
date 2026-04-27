module.exports = function getAdminFeedbackHtml(isDefaultSecret) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
<meta name="theme-color" content="#000000">
<meta name="color-scheme" content="dark">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="MX Admin">
<meta name="description" content="Maureonix Neural Feedback Command Center">
<link rel="manifest" href="data:application/json;base64,eyJuYW1lIjoiTWF1cmVvbml4IEFkbWluIENvbW1hbmQgQ2VudGVyIiwic2hvcnRfbmFtZSI6Ik1YIEFkbWluIiwiZGVzY3JpcHRpb24iOiJOZXVyYWwgZmVlZGJhY2sgYWRtaW5pc3RyYXRpb24gaW50ZXJmYWNlIGZvciBNYXVyZW9uaXgiLCJzdGFydF91cmwiOiIvYWRtaW4vZmVlZGJhY2siLCJkaXNwbGF5Ijoic3RhbmRhbG9uZSIsImJhY2tncm91bmRfY29sb3IiOiIjMDAwMDAwIiwidGhlbWVfY29sb3IiOiIjMDBmMGZmIiwib3JpZW50YXRpb24iOiJhbnkiLCJpY29ucyI6W3sic3JjIjoiaHR0cHM6Ly9pLmliYi5jby9mVkQ0MDc4dC9tYXVyZW9uaXgtbG9nby5wbmciLCJzaXplcyI6IjE5MngxOTIiLCJ0eXBlIjoiaW1hZ2UvcG5nIn0seyJzcmMiOiJodHRwczovL2kuYmJiLmNvL2ZWRDQwNzh0L21hdXJlb25peC1sb2dvLnBuZyIsInNpemVzIjoiNTEyeDUxMiIsInR5cGUiOiJpbWFnZS9wbmcifV19">
<link rel="apple-touch-icon" href="https://i.ibb.co/fVD4078t/maureonix-logo.png">
<title>MAUREONIX · Feedback Command Center</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
<style>
:root{--void:#000;--deep:#020408;--panel:rgba(4,10,24,0.92);--panel-solid:#040a18;--panel-elevated:#0a1525;--cyan:#00f0ff;--cyan-dim:rgba(0,240,255,0.08);--blue:#0066ff;--green:#00ff88;--green-dim:rgba(0,255,136,0.08);--danger:#ff2a6d;--danger-dim:rgba(255,42,109,0.08);--warning:#ffb020;--warning-dim:rgba(255,176,32,0.08);--text:#eef6ff;--text-dim:#8a9bb8;--text-muted:#475569;--border:rgba(0,240,255,0.07);--border-bright:rgba(0,240,255,0.18);--glow:rgba(0,240,255,0.12);--shadow:0 20px 60px rgba(0,0,0,0.6);--fox:#ff7b2c;--glow:rgba(0,240,255,0.12);--font-main:'Inter',system-ui,sans-serif;--font-mono:'JetBrains Mono','Fira Code',monospace;--font-display:'Space Grotesk','Inter',sans-serif;--ease:cubic-bezier(0.16,1,0.3,1)}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scrollbar-width:thin;scrollbar-color:var(--border) var(--void)}
::-webkit-scrollbar{width:8px;height:8px}
::-webkit-scrollbar-track{background:var(--void)}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:999px}
::-webkit-scrollbar-thumb:hover{background:var(--cyan)}
body{background:var(--void);color:var(--text);font-family:var(--font-main);min-height:100vh;overflow-x:hidden;line-height:1.6;-webkit-font-smoothing:antialiased}
.scan-h{position:fixed;left:0;width:100%;height:2px;z-index:10000;background:linear-gradient(90deg,transparent,var(--cyan),transparent);pointer-events:none;opacity:0.8}
.scan-h.top{top:0;animation:scanH 3s linear infinite}
.scan-h.bottom{bottom:0;animation:scanH 3s linear infinite reverse}
.scan-v{position:fixed;top:0;width:2px;height:100%;z-index:10000;background:linear-gradient(180deg,transparent,var(--cyan),transparent);pointer-events:none;opacity:0.8}
.scan-v.left{left:0;animation:scanV 4s linear infinite}
.scan-v.right{right:0;animation:scanV 4s linear infinite reverse}
@keyframes scanH{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
@keyframes scanV{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
.bg-grid{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(0,240,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,255,0.025) 1px,transparent 1px);background-size:50px 50px;mask-image:radial-gradient(ellipse at 50% 50%,black 20%,transparent 70%);-webkit-mask-image:radial-gradient(ellipse at 50% 50%,black 20%,transparent 70%)}
.bg-glow{position:fixed;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(0,240,255,0.04),transparent 60%);top:-200px;right:-200px;pointer-events:none;z-index:0;animation:pulseGlow 10s ease-in-out infinite}
#particleCanvas{position:fixed;inset:0;z-index:0;opacity:0.5;pointer-events:none}
@keyframes pulseGlow{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.15);opacity:0.8}}
.toast-container{position:fixed;top:24px;right:24px;z-index:10002;display:flex;flex-direction:column;gap:10px;pointer-events:none}
.toast{background:var(--panel-solid);border:1px solid var(--border);border-left:3px solid var(--cyan);color:var(--text);padding:14px 20px;border-radius:10px;font-size:0.85rem;font-weight:500;backdrop-filter:blur(20px);box-shadow:var(--shadow);transform:translateX(120%);transition:transform 0.4s var(--ease);pointer-events:auto;display:flex;align-items:center;gap:10px;max-width:340px}
.toast.show{transform:translateX(0)}
.toast.success{border-left-color:var(--green)}
.toast.error{border-left-color:var(--danger)}
.toast-icon{font-size:1.1rem}
.login-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;padding:2rem}
.login-card{width:100%;max-width:440px;background:var(--panel);border:1px solid var(--border);border-radius:16px;padding:3rem;position:relative;overflow:hidden;box-shadow:var(--shadow);transition:transform 0.3s}
.login-card.shake{animation:shake 0.5s ease}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
.login-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),var(--green),var(--fox),transparent);animation:gradientMove 4s linear infinite;background-size:300% 100%}
.brand{text-align:center;margin-bottom:2.5rem}
.brand-logo{width:72px;height:72px;margin:0 auto 1.5rem;border-radius:18px;object-fit:cover;border:2px solid rgba(255,123,44,0.3);box-shadow:0 0 40px rgba(255,123,44,0.2);animation:floatLogo 5s ease-in-out infinite}
@keyframes floatLogo{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.brand h1{font-family:var(--font-display);font-size:1.6rem;font-weight:700;letter-spacing:0.15em;background:linear-gradient(135deg,var(--text),var(--cyan));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:0.4rem}
.brand p{color:var(--text-dim);font-size:0.8rem;letter-spacing:0.2em;text-transform:uppercase}
.input-group{margin-bottom:1.5rem}
.input-group label{display:block;font-size:0.7rem;font-weight:600;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.5rem}
.input-group input{width:100%;background:rgba(0,0,0,0.35);border:1px solid var(--border);border-radius:10px;padding:0.875rem 1rem;color:var(--text);font-size:1rem;font-family:var(--font-mono);outline:none;transition:all 0.3s}
.input-group input:focus{border-color:var(--cyan);box-shadow:0 0 0 3px var(--cyan-dim),0 0 20px rgba(0,240,255,0.1)}
.btn{width:100%;padding:0.875rem;border:none;border-radius:10px;background:linear-gradient(135deg,var(--cyan),var(--blue));color:#000;font-family:var(--font-display);font-weight:700;font-size:0.95rem;cursor:pointer;position:relative;overflow:hidden;transition:all 0.3s var(--ease);box-shadow:0 4px 15px rgba(0,240,255,0.2);letter-spacing:0.02em}
.btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);transform:translateX(-100%);transition:transform 0.6s}
.btn:hover::after{transform:translateX(100%)}
.btn:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(0,240,255,0.3)}
.dashboard{position:relative;z-index:1;padding:2rem;max-width:1400px;margin:0 auto;display:none}
.dashboard.visible{display:block;animation:fadeIn 0.6s var(--ease)}
@keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem;padding-bottom:1.25rem;border-bottom:1px solid var(--border)}
.header-left h1{font-family:var(--font-display);font-size:1.5rem;font-weight:700;letter-spacing:-0.02em;display:flex;align-items:center;gap:0.75rem}
.header-left h1 img{width:32px;height:32px;border-radius:8px;object-fit:cover;border:1px solid rgba(255,123,44,0.3)}
.header-left p{color:var(--text-dim);font-size:0.85rem;margin-top:0.25rem}
.live-indicator{display:inline-flex;align-items:center;gap:0.5rem;background:var(--green-dim);color:var(--green);padding:0.35rem 0.875rem;border-radius:20px;font-size:0.75rem;font-weight:600;border:1px solid rgba(0,255,136,0.12)}
.pulse-dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 10px var(--green);animation:pulseDot 2.2s infinite}
@keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.6)}}
.header-actions{display:flex;gap:0.6rem;align-items:center;flex-wrap:wrap}
.btn-icon{background:var(--panel);border:1px solid var(--border);color:var(--text-dim);padding:0.5rem 0.875rem;border-radius:8px;cursor:pointer;font-size:0.8rem;font-weight:500;transition:all 0.2s;display:inline-flex;align-items:center;gap:0.4rem;font-family:var(--font-main)}
.btn-icon:hover{border-color:var(--border-bright);color:var(--text);background:var(--panel-elevated)}
.btn-icon.danger:hover{border-color:var(--danger);color:var(--danger);background:var(--danger-dim)}
.btn-icon.active{border-color:var(--cyan);color:var(--cyan);background:var(--cyan-dim)}
.install-btn{display:none}
.install-btn.visible{display:inline-flex}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem;margin-bottom:2rem}
.stat-card{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:1.5rem;position:relative;overflow:hidden;transition:all 0.3s var(--ease);backdrop-filter:blur(10px)}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--cyan),transparent);opacity:0.5;transition:opacity 0.3s}
.stat-card:hover{border-color:var(--border-bright);transform:translateY(-3px);box-shadow:0 15px 40px rgba(0,0,0,0.4)}
.stat-card:hover::before{opacity:1}
.stat-card.green::before{background:linear-gradient(90deg,var(--green),transparent)}
.stat-card.warning::before{background:linear-gradient(90deg,var(--warning),transparent)}
.stat-card.danger::before{background:linear-gradient(90deg,var(--danger),transparent)}
.stat-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.875rem}
.stat-label{font-size:0.8rem;color:var(--text-dim);font-weight:500;text-transform:uppercase;letter-spacing:0.08em}
.stat-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;background:var(--cyan-dim)}
.stat-card.green .stat-icon{background:var(--green-dim)}
.stat-card.warning .stat-icon{background:var(--warning-dim)}
.stat-card.danger .stat-icon{background:var(--danger-dim)}
.stat-value{font-size:1.9rem;font-weight:800;color:var(--text);letter-spacing:-0.02em;line-height:1;font-family:var(--font-mono)}
.stat-meta{margin-top:0.5rem;font-size:0.75rem;color:var(--text-muted)}
.toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;gap:1rem;flex-wrap:wrap}
.search-box{position:relative;flex:1;min-width:260px;max-width:380px}
.search-box input{width:100%;background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:0.625rem 1rem 0.625rem 2.5rem;color:var(--text);font-size:0.9rem;outline:none;transition:all 0.3s}
.search-box::before{content:'🔍';position:absolute;left:0.875rem;top:50%;transform:translateY(-50%);font-size:0.9rem;opacity:0.4}
.search-box input:focus{border-color:var(--cyan);box-shadow:0 0 0 3px var(--cyan-dim)}
.toolbar-right{display:flex;gap:0.75rem;align-items:center;color:var(--text-dim);font-size:0.8rem;flex-wrap:wrap}
.table-container{background:var(--panel);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.25)}
.table-wrapper{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:0.85rem}
thead{position:sticky;top:0;z-index:10}
th{padding:1rem 1.25rem;text-align:left;font-weight:600;color:var(--cyan);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em;background:var(--panel-elevated);border-bottom:1px solid var(--border);white-space:nowrap;cursor:pointer;user-select:none;transition:background 0.2s}
th:hover{background:rgba(0,240,255,0.06)}
th .sort-indicator{margin-left:6px;opacity:0.3;font-size:0.7rem}
td{padding:0.875rem 1.25rem;border-bottom:1px solid var(--border);color:var(--text-dim);vertical-align:middle}
tbody tr{transition:all 0.2s;animation:rowIn 0.4s var(--ease) backwards}
tbody tr:nth-child(1){animation-delay:0.03s}tbody tr:nth-child(2){animation-delay:0.06s}tbody tr:nth-child(3){animation-delay:0.09s}tbody tr:nth-child(4){animation-delay:0.12s}tbody tr:nth-child(5){animation-delay:0.15s}
@keyframes rowIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
tbody tr:hover{background:rgba(0,240,255,0.025)}
tbody tr.unseen{background:rgba(0,240,255,0.025)}
tbody tr.unseen td:first-child{position:relative}
tbody tr.unseen td:first-child::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:55%;background:var(--cyan);border-radius:0 3px 3px 0}
.cell-id{font-family:var(--font-mono);font-size:0.78rem;color:var(--text-muted)}
.id-hash{color:var(--cyan);margin-right:2px}
.cell-time{white-space:nowrap;font-size:0.8rem}
.cell-time-sub{color:var(--text-muted);font-size:0.72rem}
.cell-rating{color:var(--warning);font-weight:700;letter-spacing:0.08em;font-size:0.9rem}
.rating-empty{color:var(--text-muted);opacity:0.3}
.cell-comment{max-width:280px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.5}
.cell-contact{font-family:var(--font-mono);font-size:0.78rem}
.ip-badge{font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);background:rgba(0,0,0,0.25);padding:0.2rem 0.5rem;border-radius:4px;display:inline-block}
.page-tag{background:var(--cyan-dim);color:var(--cyan);padding:0.2rem 0.55rem;border-radius:4px;font-size:0.7rem;font-weight:600;border:1px solid var(--border)}
.seen-dot{width:8px;height:8px;border-radius:50%;display:inline-block}
.seen-yes{background:var(--green);box-shadow:0 0 8px var(--green)}
.seen-no{background:var(--cyan);box-shadow:0 0 8px var(--cyan);animation:pulseDot 2s infinite}
.btn-delete{background:transparent;border:1px solid var(--danger);color:var(--danger);padding:0.35rem 0.75rem;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;transition:all 0.2s;display:inline-flex;align-items:center;gap:0.35rem}
.btn-delete:hover{background:var(--danger);color:#fff;box-shadow:0 0 15px rgba(255,42,109,0.25)}
.empty-cell{padding:0 !important}
.empty-state{text-align:center;padding:4rem 2rem;color:var(--text-muted)}
.empty-icon{font-size:3rem;margin-bottom:1rem;opacity:0.4}
.empty-state h3{color:var(--text-dim);font-size:1.1rem;margin-bottom:0.5rem}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(10px);z-index:1000;display:none;align-items:center;justify-content:center;padding:2rem;opacity:0;transition:opacity 0.3s}
.modal-overlay.active{display:flex;opacity:1}
.cyber-modal{background:var(--panel-elevated);border:1px solid var(--border-bright);border-radius:16px;padding:2rem;max-width:420px;width:100%;box-shadow:0 25px 60px rgba(0,0,0,0.6);transform:scale(0.95);transition:transform 0.3s var(--ease)}
.modal-overlay.active .cyber-modal{transform:scale(1)}
.modal-icon{width:52px;height:52px;background:var(--danger-dim);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:1.25rem}
.cyber-modal h3{font-size:1.2rem;font-weight:700;margin-bottom:0.5rem}
.cyber-modal p{color:var(--text-dim);font-size:0.9rem;margin-bottom:1.5rem;line-height:1.6}
.modal-actions{display:flex;gap:0.75rem}
.modal-actions button{flex:1;padding:0.625rem;border-radius:8px;font-size:0.9rem;font-weight:600;cursor:pointer;transition:all 0.2s;border:none}
.btn-secondary{background:var(--panel);border:1px solid var(--border);color:var(--text-dim)}
.btn-secondary:hover{border-color:var(--border-bright);color:var(--text)}
.btn-danger-solid{background:var(--danger);color:#fff}
.btn-danger-solid:hover{box-shadow:0 0 20px rgba(255,42,109,0.3);transform:translateY(-1px)}
.admin-footer{text-align:center;padding:3rem 0 1.5rem;color:var(--text-muted);font-size:0.75rem;letter-spacing:0.1em}
.admin-footer b{color:var(--cyan);font-weight:600}
.chat-toggle-btn{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--cyan),var(--blue));border:none;color:#000;font-size:1.6rem;cursor:pointer;z-index:10003;box-shadow:0 0 30px var(--glow),0 4px 20px rgba(0,0,0,0.4);transition:all 0.3s var(--ease);display:grid;place-items:center;animation:floatLogo 6s ease-in-out infinite;transform:translateZ(0)}
.chat-toggle-btn:hover{transform:scale(1.15) rotate(10deg) translateZ(0);box-shadow:0 0 50px var(--glow)}
.chat-panel{position:fixed;bottom:96px;right:24px;width:380px;max-width:calc(100vw - 48px);height:520px;max-height:calc(100vh - 130px);background:var(--panel-solid);border:1px solid var(--border-bright);border-radius:20px;display:none;flex-direction:column;z-index:10003;box-shadow:0 30px 100px rgba(0,0,0,0.8),inset 0 0 60px rgba(0,240,255,0.02);overflow:hidden;animation:panelIn 0.5s var(--ease);backdrop-filter:blur(40px);transform:translateZ(0)}
@keyframes panelIn{from{opacity:0;transform:translateY(20px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
.chat-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),var(--green),transparent);z-index:10}
.chat-header{padding:0.75rem 1rem;background:rgba(0,0,0,0.45);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-family:var(--font-display);font-weight:700;color:var(--cyan);font-size:0.95rem;flex-shrink:0;position:relative;z-index:5}
.chat-header button{background:transparent;border:none;color:var(--text-dim);font-size:1.4rem;cursor:pointer;line-height:1;transition:color 0.2s;width:32px;height:32px;display:grid;place-items:center;border-radius:50%}
.chat-header button:hover{color:var(--danger);background:rgba(255,42,109,0.1)}
.chat-messages{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.75rem;scroll-behavior:smooth;position:relative;z-index:3}
.chat-bubble{max-width:88%;padding:0.75rem 1rem;border-radius:12px;font-size:0.85rem;line-height:1.55;word-break:break-word;animation:msgIn 0.35s var(--ease)}
@keyframes msgIn{from{opacity:0;transform:translateY(10px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.chat-bubble.user{align-self:flex-end;background:linear-gradient(135deg,var(--cyan),var(--blue));color:var(--void);border-bottom-right-radius:4px;font-weight:500}
.chat-bubble.assistant{align-self:flex-start;background:rgba(0,0,0,0.4);border:1px solid var(--border);color:var(--text);border-bottom-left-radius:4px}
.chat-bubble .ts{font-size:0.6rem;opacity:0.5;margin-top:4px;display:block;font-family:var(--font-mono)}
.chat-typing{padding:0 1rem 0.5rem;font-size:0.75rem;color:var(--text-dim);font-family:var(--font-mono);display:none;align-items:center;gap:4px;position:relative;z-index:3}
.chat-typing .dot{width:5px;height:5px;background:var(--cyan);border-radius:50%;animation:typingBounce 1.4s infinite ease-in-out both}
.chat-typing .dot:nth-child(1){animation-delay:-0.32s}.chat-typing .dot:nth-child(2){animation-delay:-0.16s}
@keyframes typingBounce{0%,80%,100%{transform:scale(0);opacity:0.3}40%{transform:scale(1);opacity:1}}
.chat-input-area{display:flex;gap:0.5rem;padding:0.75rem 1rem;border-top:1px solid var(--border);background:rgba(0,0,0,0.3);flex-shrink:0;position:relative;z-index:5}
.chat-input-area input{flex:1;background:rgba(0,0,0,0.25);border:1px solid var(--border);border-radius:999px;padding:0.5rem 1rem;color:var(--text);font-family:var(--font-main);outline:none;font-size:0.9rem}
.chat-input-area input:focus{border-color:var(--cyan);box-shadow:0 0 10px var(--glow)}
.chat-input-area input::placeholder{color:var(--text-dim);opacity:0.4}
.chat-input-area button{width:40px;height:40px;border-radius:50%;border:none;background:linear-gradient(135deg,var(--cyan),var(--blue));color:var(--void);cursor:pointer;display:grid;place-items:center;transition:transform 0.2s,box-shadow 0.2s;font-size:1rem;flex-shrink:0}
.chat-input-area button:hover{transform:scale(1.1);box-shadow:0 0 15px var(--glow)}
.chat-input-area button:disabled{opacity:0.4;cursor:not-allowed;transform:none}
/* Admin Welcome */
.admin-banner{background:linear-gradient(90deg,rgba(0,240,255,0.08),rgba(0,255,136,0.04));border:1px solid var(--border-bright);border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.875rem}
.admin-banner .admin-icon{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--cyan),var(--blue));display:grid;place-items:center;font-size:1.2rem}
.admin-banner .admin-info strong{color:var(--cyan);font-family:var(--font-display)}
.admin-banner .admin-info span{display:block;font-size:0.75rem;color:var(--text-dim);margin-top:2px}
@media(max-width:768px){.dashboard{padding:1rem}.header{flex-direction:column;align-items:flex-start}.stats-grid{grid-template-columns:repeat(2,1fr);gap:0.875rem}.toolbar{flex-direction:column;align-items:stretch}.search-box{max-width:none}th,td{padding:0.75rem}.cell-comment{max-width:140px}.toast-container{right:12px;top:12px}.chat-panel{right:12px;bottom:80px;width:calc(100vw - 24px);height:60vh}}
@media(max-width:480px){.stats-grid{grid-template-columns:1fr 1fr}.stat-value{font-size:1.4rem}.login-card{padding:2rem 1.5rem}}
.hidden{display:none !important}
</style>
</head>
<body>
<div class="scan-h top" aria-hidden="true"></div><div class="scan-h bottom" aria-hidden="true"></div><div class="scan-v left" aria-hidden="true"></div><div class="scan-v right" aria-hidden="true"></div>
<div class="bg-grid" aria-hidden="true"></div><div class="bg-glow" aria-hidden="true"></div><canvas id="particleCanvas" aria-hidden="true"></canvas>
<div class="toast-container" id="toastContainer"></div>
<div id="loginScreen" class="login-screen"><div class="login-card" id="loginCard">
  <div class="brand"><img src="https://i.ibb.co/fVD4078t/maureonix-logo.png" alt="" class="brand-logo" onerror="this.style.display='none'"><h1>MAUREONIX</h1><p>Feedback Command Center</p></div>
    <div class="input-group"><label>Admin Secret Key</label><input type="password" id="secretInput" placeholder="Enter neural key..." autocomplete="off" onkeypress="if(event.key==='Enter')doLogin()">${isDefaultSecret ? '<small style="color:#8a9bb8;display:block;margin-top:6px;font-size:0.75rem;">Default secret: <code style="background:rgba(0,240,255,0.08);padding:2px 6px;border-radius:4px;">maureonix_secret_key</code></small>' : ''}</div>
  <button class="btn" onclick="doLogin()">AUTHENTICATE</button>
</div></div>
<div id="dashboard" class="dashboard">
<div class="admin-banner" id="adminBanner" style="display:none;"><div class="admin-icon">👑</div><div class="admin-info"><strong>System Administrator</strong><span>Neural link established. Full access granted.</span></div></div>
  <div class="header">
    <div class="header-left"><h1><img src="https://i.ibb.co/fVD4078t/maureonix-logo.png" alt="" onerror="this.style.display='none'"> FEEDBACK COMMAND CENTER</h1><p>Neural feedback administration interface</p></div>
    <div class="header-actions">
      <div class="live-indicator"><span class="pulse-dot"></span><span>LIVE</span></div>
      <button class="btn-icon install-btn" id="installBtn" onclick="installPWA()" title="Install PWA">📲 Install</button>
      <button class="btn-icon" onclick="doLogin()" title="Refresh">🔄 Refresh</button>
      <button class="btn-icon" id="autoRefreshToggle" onclick="toggleAutoRefresh()" title="Auto-refresh">⏱ Auto</button>
      <button class="btn-icon danger" onclick="logout()" title="Logout">🚪 Logout</button>
    </div>
  </div>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-header"><span class="stat-label">Total Feedback</span><div class="stat-icon">📨</div></div><div class="stat-value" id="statTotal">—</div><div class="stat-meta">All-time submissions</div></div>
    <div class="stat-card green"><div class="stat-header"><span class="stat-label">Average Rating</span><div class="stat-icon">⭐</div></div><div class="stat-value" id="statAvg">—</div><div class="stat-meta">Out of 5 stars</div></div>
    <div class="stat-card warning"><div class="stat-header"><span class="stat-label">Unseen</span><div class="stat-icon">👁</div></div><div class="stat-value" id="statUnseen">—</div><div class="stat-meta">Awaiting review</div></div>
    <div class="stat-card danger"><div class="stat-header"><span class="stat-label">Seen Rate</span><div class="stat-icon">📊</div></div><div class="stat-value" id="statSeenRate">—</div><div class="stat-meta">Reviewed percentage</div></div>
  </div>
  <div class="toolbar">
    <div class="search-box"><input type="text" id="searchInput" placeholder="Search comment, contact, page, IP..." oninput="filterTable()"></div>
    <div class="toolbar-right">
      <button class="btn-icon" onclick="markAllSeen()" title="Mark all reviewed">✓ Mark All Seen</button>
      <button class="btn-icon" onclick="exportCSV()" title="Export to CSV">📥 Export</button>
      <button class="btn-icon danger" onclick="deleteAll()" title="Clear all">🗑 Clear All</button>
      <span id="showingCount">0 entries</span><span style="color:var(--border)">|</span><span id="lastUpdated">—</span>
    </div>
  </div>
  <div class="table-container"><div class="table-wrapper"><table id="feedbackTable"><thead><tr><th onclick="sortBy('id')">ID <span class="sort-indicator" data-col="id">⇅</span></th><th onclick="sortBy('timestamp')">Time <span class="sort-indicator" data-col="timestamp">⇅</span></th><th onclick="sortBy('rating')">Rating <span class="sort-indicator" data-col="rating">⇅</span></th><th>Comment</th><th>Contact</th><th>Page</th><th>IP</th><th onclick="sortBy('seen')">Seen <span class="sort-indicator" data-col="seen">⇅</span></th><th style="text-align:center;">Action</th></tr></thead><tbody id="tableBody"><tr><td colspan="9" class="empty-cell"><div class="empty-state"><div class="empty-icon">📭</div><h3>No feedback yet</h3><p>Submissions will appear here in real-time</p></div></td></tr></tbody></table></div></div>
  <div class="admin-footer"><b>MAUREONIX</b> NEURAL INTERFACE · Admin Command Center</div>
</div>
<div class="modal-overlay" id="deleteModal" onclick="if(event.target===this)closeModal()"><div class="cyber-modal"><div class="modal-icon">🗑</div><h3>Purge Feedback</h3><p>Permanently delete this feedback? This cannot be undone.</p><div class="modal-actions"><button class="btn-secondary" onclick="closeModal()">Cancel</button><button class="btn-danger-solid" onclick="confirmDelete()">Purge</button></div></div></div>
<button class="chat-toggle-btn" id="chatToggle" onclick="toggleChat()" title="Neural Assistant">🦊</button>
<button class="chat-toggle-btn" id="chatToggle" onclick="toggleChat()" title="Neural Assistant" aria-label="Open Neural Assistant">🦊</button>
<div class="chat-panel" id="chatPanel" role="dialog" aria-label="Neural Assistant" aria-hidden="true">
  <div class="chat-header"><span>🦊 MAUREONIX AI</span><button onclick="toggleChat()" aria-label="Close chat">×</button></div>
  <div class="chat-messages" id="chatMessages"></div>
  <div class="chat-typing" id="chatTyping"><span>Thinking</span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
  <div class="chat-input-area"><input type="text" id="chatInput" placeholder="Ask Maureonix anything..." onkeypress="if(event.key==='Enter')sendChatMessage()"><button id="chatSend" onclick="sendChatMessage()">➤</button></div>
</div>
<script>
var ADMIN_KEY='maureonix-admin-secret';var secret=localStorage.getItem(ADMIN_KEY)||'';var allFeedback=[];var filteredFeedback=[];var deleteTargetId=null;var autoRefresh=true;var refreshTimer=null;var sortCol='timestamp';var sortDir='desc';var deferredPrompt=null;var isChatOpen=false;
if(secret)doLogin();
var swCode="self.addEventListener('install',function(e){e.waitUntil(self.skipWaiting())});self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim())});self.addEventListener('fetch',function(e){e.respondWith(fetch(e.request).catch(function(){return new Response('Offline',{status:503,headers:{'Content-Type':'text/plain'}})}))});";
if('serviceWorker' in navigator){try{navigator.serviceWorker.register(URL.createObjectURL(new Blob([swCode],{type:'application/javascript'}))).catch(function(){});}catch(e){}}
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredPrompt=e;var btn=document.getElementById('installBtn');if(btn)btn.classList.add('visible');});
function installPWA(){if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt.userChoice.then(function(){deferredPrompt=null;});var btn=document.getElementById('installBtn');if(btn)btn.classList.remove('visible');}
function showToast(msg,type){var container=document.getElementById('toastContainer');var toast=document.createElement('div');toast.className='toast toast-'+(type||'info');var icon=type==='success'?'✓':type==='error'?'✕':'ℹ';toast.innerHTML='<span class="toast-icon">'+icon+'</span><span>'+msg+'</span>';container.appendChild(toast);requestAnimationFrame(function(){toast.classList.add('show');});setTimeout(function(){toast.classList.remove('show');setTimeout(function(){toast.remove();},400);},4000);}
async function doLogin(){if(!secret)secret=document.getElementById('secretInput').value.trim();if(!secret)return;try{var r=await fetch('/api/feedback/list?secret='+encodeURIComponent(secret));if(!r.ok)throw new Error('Unauthorized');var data=await r.json();localStorage.setItem(ADMIN_KEY,secret);document.getElementById('loginScreen').classList.add('hidden');var dash=document.getElementById('dashboard');dash.classList.remove('hidden');dash.classList.add('visible');allFeedback=data.feedback||[];applySortAndFilter();showToast('Neural link established. Welcome, Admin.','success');checkAdminIdentity();startAutoRefresh();initChatSession();}catch(e){showToast('Authentication failed. Invalid secret key.','error');secret='';localStorage.removeItem(ADMIN_KEY);var card=document.getElementById('loginCard');card.classList.add('shake');setTimeout(function(){card.classList.remove('shake');},500);}}
function logout(){secret='';localStorage.removeItem(ADMIN_KEY);stopAutoRefresh();document.getElementById('loginScreen').classList.remove('hidden');var dash=document.getElementById('dashboard');dash.classList.add('hidden');dash.classList.remove('visible');document.getElementById('secretInput').value='';showToast('Session terminated. Goodbye.','info');}
function applySortAndFilter(){var query=document.getElementById('searchInput').value.toLowerCase().trim();var list=allFeedback;if(query){list=list.filter(function(f){return(f.comment&&f.comment.toLowerCase().indexOf(query)!==-1)||(f.contact&&f.contact.toLowerCase().indexOf(query)!==-1)||(f.page&&f.page.toLowerCase().indexOf(query)!==-1)||(f.ip&&f.ip.toLowerCase().indexOf(query)!==-1)||String(f.id).toLowerCase().indexOf(query)!==-1;});}list=list.slice().sort(function(a,b){var av=a[sortCol],bv=b[sortCol];if(sortCol==='timestamp'){av=new Date(av).getTime();bv=new Date(bv).getTime();}else if(sortCol==='rating'){av=parseInt(av)||0;bv=parseInt(bv)||0;}else if(sortCol==='seen'){av=av?1:0;bv=bv?1:0;}else{av=String(av||'').toLowerCase();bv=String(bv||'').toLowerCase();}if(av<bv)return sortDir==='asc'?-1:1;if(av>bv)return sortDir==='asc'?1:-1;return 0;});filteredFeedback=list;render(list);}
function render(list){var total=allFeedback.length;var avg=total?(allFeedback.reduce(function(s,f){return s+f.rating;},0)/total).toFixed(1):'0.0';var unseen=allFeedback.filter(function(f){return!f.seen;}).length;var seenRate=total?Math.round((total-unseen)/total*100):0;document.getElementById('statTotal').textContent=total.toLocaleString();document.getElementById('statAvg').textContent=avg+' ★';document.getElementById('statUnseen').textContent=unseen.toLocaleString();document.getElementById('statSeenRate').textContent=seenRate+'%';document.getElementById('showingCount').textContent='Showing '+list.length+' of '+total;document.getElementById('lastUpdated').textContent='Updated '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});var tbody=document.getElementById('tableBody');if(!list.length){tbody.innerHTML='<tr><td colspan="9" class="empty-cell"><div class="empty-state"><div class="empty-icon">📭</div><h3>No feedback found</h3><p>Submissions will appear here in real-time</p></div></td></tr>';return;}tbody.innerHTML=list.map(function(f,i){var date=new Date(f.timestamp);var dateStr=date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});var timeStr=date.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});var unseenClass=f.seen?'':'unseen';var seenDot=f.seen?'<span class="seen-dot seen-yes"></span>':'<span class="seen-dot seen-no"></span>';var shortId=String(f.id).slice(-8).toUpperCase();var comment=f.comment?escapeHtml(f.comment):'<span style="color:var(--text-muted);font-style:italic;">No comment</span>';var pageTag=f.page?'<span class="page-tag">'+escapeHtml(f.page)+'</span>':'<span style="color:var(--text-muted);">-</span>';return'<tr class="'+unseenClass+'" style="animation-delay:'+(i*0.025)+'s"><td class="cell-id"><span class="id-hash">#</span>'+shortId+'</td><td class="cell-time"><div>'+dateStr+'</div><div class="cell-time-sub">'+timeStr+'</div></td><td class="cell-rating">'+'★'.repeat(f.rating)+'<span class="rating-empty">'+'☆'.repeat(5-f.rating)+'</span></td><td class="cell-comment" title="'+escapeHtml(f.comment||'')+'">'+comment+'</td><td class="cell-contact">'+(f.contact?escapeHtml(f.contact):'<span style="color:var(--text-muted);">-</span>')+'</td><td>'+pageTag+'</td><td><span class="ip-badge">'+(f.ip||'-')+'</span></td><td class="cell-seen">'+seenDot+'</td><td class="cell-action"><button class="btn-delete" onclick="openDeleteModal(\\''+f.id+'\\')"><span>🗑</span> Delete</button></td></tr>';}).join('');document.querySelectorAll('.sort-indicator').forEach(function(el){var col=el.dataset.col;if(col===sortCol){el.textContent=sortDir==='asc'?'▲':'▼';el.style.opacity='1';}else{el.textContent='⇅';el.style.opacity='0.3';}});}
function escapeHtml(t){var d=document.createElement('div');d.textContent=t||'';return d.innerHTML;}
function sortBy(col){if(sortCol===col)sortDir=sortDir==='asc'?'desc':'asc';else{sortCol=col;sortDir='desc';}applySortAndFilter();}
function filterTable(){applySortAndFilter();}
function openDeleteModal(id){deleteTargetId=id;document.getElementById('deleteModal').classList.add('active');}
function closeModal(){document.getElementById('deleteModal').classList.remove('active');deleteTargetId=null;}
async function confirmDelete(){if(!deleteTargetId)return;closeModal();try{var r=await fetch('/api/feedback/'+deleteTargetId+'?secret='+encodeURIComponent(secret),{method:'DELETE'});if(!r.ok)throw new Error('Failed');showToast('Feedback entry purged successfully.','success');doLogin();}catch(e){showToast('Purge failed. Neural link interrupted.','error');}}
async function deleteAll(){if(!allFeedback.length)return;if(!confirm('⚠️ WARNING\\n\\nThis will permanently delete ALL feedback entries.\\nThis action is irreversible.\\n\\nAre you absolutely sure?'))return;var deleted=0,failed=0;for(var i=0;i<allFeedback.length;i++){try{await fetch('/api/feedback/'+allFeedback[i].id+'?secret='+encodeURIComponent(secret),{method:'DELETE'});deleted++;}catch(e){failed++;}}showToast('Purged '+deleted+' entries'+(failed?' ('+failed+' failed)':''),'success');doLogin();}
async function markAllSeen(){if(!allFeedback.length)return;try{var r=await fetch('/api/feedback/seen?secret='+encodeURIComponent(secret),{method:'POST'});if(!r.ok)throw new Error('Failed');showToast('All feedback marked as reviewed.','success');doLogin();}catch(e){showToast('Failed to update status.','error');}}
function exportCSV(){if(!allFeedback.length)return showToast('No data to export.','error');var headers=['ID','Timestamp','Rating','Comment','Contact','Page','IP','Seen'];var rows=allFeedback.map(function(f){return[f.id,f.timestamp,f.rating,'"'+(f.comment||'').replace(/"/g,'""')+'"',f.contact||'',f.page||'',f.ip||'',f.seen?'Yes':'No'].join(',');});var csv=headers.join(',')+'\\n'+rows.join('\\n');var blob=new Blob([csv],{type:'text/csv'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='maureonix_feedback_'+new Date().toISOString().slice(0,10)+'.csv';a.click();URL.revokeObjectURL(url);showToast('CSV exported successfully.','success');}
function startAutoRefresh(){stopAutoRefresh();if(autoRefresh){refreshTimer=setInterval(doLogin,30000);document.getElementById('autoRefreshToggle').classList.add('active');}}
function stopAutoRefresh(){if(refreshTimer)clearInterval(refreshTimer);refreshTimer=null;document.getElementById('autoRefreshToggle').classList.remove('active');}
function toggleAutoRefresh(){autoRefresh=!autoRefresh;if(autoRefresh){startAutoRefresh();showToast('Auto-refresh enabled (30s).','info');}else{stopAutoRefresh();showToast('Auto-refresh disabled.','info');}}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();if(e.key==='Enter'&&document.activeElement.id==='secretInput')doLogin();});
(function(){var canvas=document.getElementById('particleCanvas');if(!canvas)return;var ctx=canvas.getContext('2d');var particles=[];function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}window.addEventListener('resize',resize);resize();for(var i=0;i<55;i++){particles.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-0.5)*0.25,vy:(Math.random()-0.5)*0.25,size:Math.random()*1.5+0.5});}function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);particles.forEach(function(p,i){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fillStyle='rgba(0,240,255,'+(p.size/4)+')';ctx.fill();for(var j=i+1;j<particles.length;j++){var p2=particles[j],dx=p.x-p2.x,dy=p.y-p2.y,d=Math.sqrt(dx*dx+dy*dy);if(d<130){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p2.x,p2.y);ctx.strokeStyle='rgba(0,240,255,'+(0.035*(1-d/130))+')';ctx.lineWidth=0.5;ctx.stroke();}}});requestAnimationFrame(draw);}draw();})();

/* ═══ Chat v7.0 — Smart Admin Assistant ═══ */
var CHAT_SESSION_KEY='maureonix-chat-session';var CHAT_HISTORY_KEY='maureonix-chat-history';
var chatSessionId='';var chatHistory=[];var isChatOpen=false;var adminIdentity=null;

function generateSessionId(){return'sess_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);}

function initChatSession(){
  try{
    chatSessionId=localStorage.getItem(CHAT_SESSION_KEY)||generateSessionId();
    localStorage.setItem(CHAT_SESSION_KEY,chatSessionId);
    var raw=localStorage.getItem(CHAT_HISTORY_KEY);
    chatHistory=raw?JSON.parse(raw):[];
    renderChatHistory();
    if(!chatHistory.length){
      var greeting=adminIdentity?'Welcome back, **Administrator**. I can check feedback, verify numbers, export data, and execute any command.':'Welcome to the **Neural Command Center**.\\n\\nI am MAUREONIX. Ask me about feedback, pairing, or anything.';   
      appendChatBubble('assistant',greeting,Date.now(),true);
    }
  }catch(e){chatSessionId=generateSessionId();}
}

function saveChatHistory(){try{localStorage.setItem(CHAT_HISTORY_KEY,JSON.stringify(chatHistory.slice(-40)));}catch(e){}}

function renderChatHistory(){
  var container=document.getElementById('chatMessages');
  if(!container)return;
  container.innerHTML='';
  chatHistory.forEach(function(msg){appendChatBubble(msg.role,msg.text,msg.ts,false);});
  scrollChatToBottom();
}

function appendChatBubble(role,text,ts,save){
  var container=document.getElementById('chatMessages');
  if(!container)return;
  var bubble=document.createElement('div');
  bubble.className='chat-bubble '+role;
  var timeStr=ts?new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';
  var displayText=text.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  bubble.innerHTML=displayText+'<span class="ts">'+timeStr+'</span>';
  container.appendChild(bubble);
  if(save){chatHistory.push({role,text,ts:ts||Date.now()});saveChatHistory();}
  scrollChatToBottom();
}

function scrollChatToBottom(){var container=document.getElementById('chatMessages');if(container)container.scrollTop=container.scrollHeight;}

function setChatTyping(show){var el=document.getElementById('chatTyping');if(el)el.style.display=show?'flex':'none';}

/* ── Smart Intent Parser ── */
function parseIntent(text){
  var lower=text.toLowerCase();
  var intents=[];
  if(/show.*unseen|unseen.*feedback|new.*feedback/.test(lower))intents.push({type:'action',action:'filterUnseen'});
  if(/mark.*seen|mark.*all|clear.*all.*seen/.test(lower))intents.push({type:'action',action:'markAllSeen'});
  if(/export|download.*csv/.test(lower))intents.push({type:'action',action:'exportCSV'});
  if(/delete.*all|clear.*all|purge.*all/.test(lower))intents.push({type:'action',action:'deleteAll'});
  if(/verify.*number|check.*number|validate.*phone/.test(lower)){
    var m=text.match(/(?:\+?254|0)?\d{9,12}/);
    if(m)intents.push({type:'verifyPhone',number:m[0].replace(/^0/,'254').replace(/^\+/,'')});
  }
  if(/refresh|reload|update.*data/.test(lower))intents.push({type:'action',action:'refresh'});
  if(/scroll.*top|go.*top|back.*top/.test(lower))intents.push({type:'scrollTo',target:'loginScreen'});
  return intents;
}

function executeIntent(intent){
  switch(intent.type){
    case 'action':
      if(intent.action==='markAllSeen'){markAllSeen();return true;}
      if(intent.action==='exportCSV'){exportCSV();return true;}
      if(intent.action==='deleteAll'){deleteAll();return true;}
      if(intent.action==='refresh'){doLogin();return true;}
      if(intent.action==='filterUnseen'){document.getElementById('searchInput').value='unseen';filterTable();return true;}
      return false;
    case 'verifyPhone':
      var valid=/^254\d{9}$/.test(intent.number);
      return valid?'✅ **'+intent.number+'** is valid Kenyan format.':'⚠️ **'+intent.number+'** is invalid. Use 254XXXXXXXXX';
    case 'scrollTo':
      var el=document.getElementById(intent.target);
      if(el){el.scrollIntoView({behavior:'smooth'});return true;}
      return false;
    default:return false;
  }
}

async function sendChatMessage(){
  var input=document.getElementById('chatInput');
  var btn=document.getElementById('chatSend');
  var text=input.value.trim();
  if(!text)return;
  input.value='';
  appendChatBubble('user',text,Date.now(),true);
  setChatTyping(true);btn.disabled=true;
  
  var intents=parseIntent(text);
  var intentHandled=false;var intentResponse=[];
  for(var i=0;i<intents.length;i++){
    var result=executeIntent(intents[i]);
    if(result===true)intentHandled=true;
    else if(typeof result==='string'){intentResponse.push(result);intentHandled=true;}
  }
  if(intentHandled&&intentResponse.length>0){
    setTimeout(function(){
      appendChatBubble('assistant',intentResponse.join('\n\n'),Date.now(),true);
      setChatTyping(false);btn.disabled=false;input.focus();
    },500);
    return;
  }
  
  try{
    var res=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:chatSessionId,message:text,context:{page:'admin-feedback',isAdmin:true}})});
    var data=await res.json();
    if(data.text){appendChatBubble('assistant',data.text,Date.now(),true);}
    else{appendChatBubble('assistant','⚠️ Neural link interrupted. Please retry.',Date.now(),true);}
  }catch(e){
    appendChatBubble('assistant','❌ Connection failed. The neural network is unreachable.',Date.now(),true);
  }
  setChatTyping(false);btn.disabled=false;input.focus();
}

function toggleChat(){
  var panel=document.getElementById('chatPanel');
  var btn=document.getElementById('chatToggle');
  if(!panel)return;
  isChatOpen=!isChatOpen;
  panel.style.display=isChatOpen?'flex':'none';
  if(isChatOpen){
    document.getElementById('chatInput').focus();
    scrollChatToBottom();
    adjustChatForViewport();
  }
}

// Visual Viewport API
function adjustChatForViewport(){
  var panel=document.getElementById('chatPanel');
  if(!panel||panel.style.display!=='flex')return;
  if(window.visualViewport){
    var vv=window.visualViewport;
    var h=Math.min(520,vv.height-130);
    panel.style.height=h+'px';
    panel.style.maxHeight=h+'px';
    var bottomOffset=window.innerHeight-vv.height;
    panel.style.bottom=(bottomOffset+90)+'px';
  }
}
if(window.visualViewport){
  window.visualViewport.addEventListener('resize',adjustChatForViewport);
  window.visualViewport.addEventListener('scroll',adjustChatForViewport);
}

document.addEventListener('click',function(e){
  if(e.target.closest('#chatToggle'))toggleChat();
  if(e.target.closest('#chatClose'))toggleChat();
  if(e.target.closest('#chatSend'))sendChatMessage();
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&isChatOpen)toggleChat();
});

/* ── Admin Identity ── */
async function checkAdminIdentity(){
  try{
    var r=await fetch('/api/admin/identity?secret='+encodeURIComponent(secret));
    if(r.ok){
      adminIdentity=await r.json();
      var banner=document.getElementById('adminBanner');
      if(banner){banner.style.display='flex';}
    }
  }catch(e){}
}

initChatSession();

</script>
</body>
</html>`;
};