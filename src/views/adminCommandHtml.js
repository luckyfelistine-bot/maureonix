const path = require('path');

module.exports = function getAdminCommandHtml(pkg, isDefaultSecret) {
  const manifestObj = {
    name: 'Maureonix Command Center',
    short_name: 'MX Command',
    description: 'Neural administration interface for Maureonix',
    start_url: '/admin',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#00f0ff',
    orientation: 'any',
    icons: [
      { src: 'https://i.ibb.co/fVD4078t/maureonix-logo.png', sizes: '192x192', type: 'image/png' },
      { src: 'https://i.ibb.co/fVD4078t/maureonix-logo.png', sizes: '512x512', type: 'image/png' }
    ]
  };
  const manifestB64 = Buffer.from(JSON.stringify(manifestObj)).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
<meta name="theme-color" content="#000000">
<meta name="color-scheme" content="dark">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="MX Command">
<meta name="description" content="Maureonix Neural Command Center">
<link rel="manifest" href="data:application/json;base64,${manifestB64}">
<link rel="apple-touch-icon" href="https://i.ibb.co/fVD4078t/maureonix-logo.png">
<title>MAUREONIX · Command Center</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
<style>
:root{--void:#000;--deep:#020408;--panel:rgba(4,10,24,0.95);--panel-solid:#040a18;--panel-elevated:#0a1525;--sidebar:#030814;--cyan:#00f0ff;--cyan-dim:rgba(0,240,255,0.08);--blue:#0066ff;--green:#00ff88;--green-dim:rgba(0,255,136,0.08);--danger:#ff2a6d;--danger-dim:rgba(255,42,109,0.08);--warning:#ffb020;--warning-dim:rgba(255,176,32,0.08);--text:#eef6ff;--text-dim:#8a9bb8;--text-muted:#475569;--border:rgba(0,240,255,0.07);--border-bright:rgba(0,240,255,0.18);--glow:rgba(0,240,255,0.12);--shadow:0 20px 60px rgba(0,0,0,0.6);--font-main:'Inter',system-ui,sans-serif;--font-mono:'JetBrains Mono','Fira Code',monospace;--font-display:'Space Grotesk','Inter',sans-serif;--ease:cubic-bezier(0.16,1,0.3,1)}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scrollbar-width:thin;scrollbar-color:var(--border) var(--void)}
::-webkit-scrollbar{width:8px;height:8px}
::-webkit-scrollbar-track{background:var(--void)}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:999px}
::-webkit-scrollbar-thumb:hover{background:var(--cyan)}
body{background:var(--void);color:var(--text);font-family:var(--font-main);min-height:100vh;overflow-x:hidden;line-height:1.6;-webkit-font-smoothing:antialiased}
img{max-width:100%;height:auto;display:block}
.scan-h{position:fixed;left:0;width:100%;height:2px;z-index:10000;background:linear-gradient(90deg,transparent,var(--cyan),transparent);pointer-events:none;opacity:0.8}
.scan-h.top{top:0;animation:scanH 3s linear infinite}
.scan-h.bottom{bottom:0;animation:scanH 3s linear infinite reverse}
.scan-v{position:fixed;top:0;width:2px;height:100%;z-index:10000;background:linear-gradient(180deg,transparent,var(--cyan),transparent);pointer-events:none;opacity:0.8}
.scan-v.left{left:0;animation:scanV 4s linear infinite}
.scan-v.right{right:0;animation:scanV 4s linear infinite reverse}
@keyframes scanH{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
@keyframes scanV{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
.bg-grid{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(0,240,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,255,0.02) 1px,transparent 1px);background-size:50px 50px}
.bg-glow{position:fixed;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(0,240,255,0.035),transparent 60%);top:-250px;right:-250px;pointer-events:none;z-index:0;animation:pulseGlow 12s ease-in-out infinite}
#particleCanvas{position:fixed;inset:0;z-index:0;opacity:0.4;pointer-events:none}
@keyframes pulseGlow{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.2);opacity:0.8}}
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
.app-shell{display:none;min-height:100vh;position:relative;z-index:1}
.app-shell.visible{display:flex;animation:fadeIn 0.5s var(--ease)}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.sidebar{width:270px;background:var(--sidebar);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;inset:0 auto 0 0;z-index:100;transition:transform 0.3s var(--ease)}
.sidebar-brand{padding:1.5rem;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:0.875rem}
.sidebar-brand img{width:36px;height:36px;border-radius:10px;object-fit:cover;border:1px solid rgba(255,123,44,0.3)}
.sidebar-brand span{font-family:var(--font-display);font-weight:700;font-size:1.1rem;letter-spacing:-0.01em}
.sidebar-brand small{display:block;font-size:0.65rem;color:var(--text-dim);letter-spacing:0.15em;text-transform:uppercase;margin-top:2px}
.nav-menu{padding:1rem 0;flex:1;overflow-y:auto}
.nav-item{display:flex;align-items:center;gap:0.875rem;padding:0.875rem 1.5rem;color:var(--text-dim);font-size:0.9rem;font-weight:500;cursor:pointer;transition:all 0.2s;border-left:3px solid transparent;text-decoration:none;background:transparent;border-right:none;border-top:none;border-bottom:none;width:100%;font-family:var(--font-main)}
.nav-item:hover{background:rgba(0,240,255,0.03);color:var(--text)}
.nav-item.active{background:rgba(0,240,255,0.05);color:var(--cyan);border-left-color:var(--cyan)}
.nav-icon{font-size:1.1rem;width:24px;text-align:center}
.sidebar-footer{padding:1rem 1.5rem;border-top:1px solid var(--border);font-size:0.75rem;color:var(--text-muted)}
.sidebar-footer b{color:var(--cyan)}
.main{flex:1;margin-left:270px;min-height:100vh;display:flex;flex-direction:column}
.main-header{position:sticky;top:0;z-index:90;background:rgba(0,0,0,0.7);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between}
.main-header h2{font-family:var(--font-display);font-size:1.25rem;font-weight:700;display:flex;align-items:center;gap:0.75rem}
.header-actions{display:flex;gap:0.6rem;align-items:center}
.live-indicator{display:inline-flex;align-items:center;gap:0.5rem;background:var(--green-dim);color:var(--green);padding:0.35rem 0.875rem;border-radius:20px;font-size:0.75rem;font-weight:600;border:1px solid rgba(0,255,136,0.12)}
.pulse-dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 10px var(--green);animation:pulseDot 2.2s infinite}
@keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.6)}}
.btn-icon{background:var(--panel);border:1px solid var(--border);color:var(--text-dim);padding:0.5rem 0.875rem;border-radius:8px;cursor:pointer;font-size:0.8rem;font-weight:500;transition:all 0.2s;display:inline-flex;align-items:center;gap:0.4rem;font-family:var(--font-main);text-decoration:none}
.btn-icon:hover{border-color:var(--border-bright);color:var(--text);background:var(--panel-elevated)}
.btn-icon.danger:hover{border-color:var(--danger);color:var(--danger);background:var(--danger-dim)}
.btn-icon.active{border-color:var(--cyan);color:var(--cyan);background:var(--cyan-dim)}
.install-btn{display:none}
.install-btn.visible{display:inline-flex}
.content{padding:2rem;flex:1}
.tab-content{display:none;animation:fadeUp 0.4s var(--ease)}
.tab-content.active{display:block}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.25rem;margin-bottom:2rem}
.stat-card{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:1.25rem;position:relative;overflow:hidden;transition:all 0.3s var(--ease);backdrop-filter:blur(10px)}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--cyan),transparent);opacity:0.5}
.stat-card:hover{border-color:var(--border-bright);transform:translateY(-3px);box-shadow:0 15px 40px rgba(0,0,0,0.4)}
.stat-card.green::before{background:linear-gradient(90deg,var(--green),transparent)}
.stat-card.warning::before{background:linear-gradient(90deg,var(--warning),transparent)}
.stat-card.danger::before{background:linear-gradient(90deg,var(--danger),transparent)}
.stat-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem}
.stat-label{font-size:0.75rem;color:var(--text-dim);font-weight:500;text-transform:uppercase;letter-spacing:0.08em}
.stat-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;background:var(--cyan-dim)}
.stat-card.green .stat-icon{background:var(--green-dim)}
.stat-card.warning .stat-icon{background:var(--warning-dim)}
.stat-card.danger .stat-icon{background:var(--danger-dim)}
.stat-value{font-size:1.7rem;font-weight:800;color:var(--text);letter-spacing:-0.02em;line-height:1;font-family:var(--font-mono)}
.stat-meta{margin-top:0.4rem;font-size:0.75rem;color:var(--text-muted)}
.stat-bar-bg{width:100%;height:4px;background:rgba(0,0,0,0.3);border-radius:2px;margin-top:0.75rem;overflow:hidden}
.stat-bar-fill{height:100%;border-radius:2px;transition:width 1s var(--ease)}
.chart-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.25rem;margin-bottom:2rem}
.chart-card{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:1.25rem}
.chart-card h3{font-size:0.85rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1rem}
.chart-bars{display:flex;align-items:flex-end;gap:6px;height:120px}
.chart-bar{flex:1;background:linear-gradient(180deg,var(--cyan),var(--blue));border-radius:4px 4px 0 0;opacity:0.7;transition:opacity 0.2s;position:relative;min-width:8px}
.chart-bar:hover{opacity:1}
.chart-bar::after{content:attr(data-label);position:absolute;bottom:-18px;left:50%;transform:translateX(-50%) rotate(-45deg);font-size:0.6rem;color:var(--text-muted);white-space:nowrap}
.status-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.25rem;margin-bottom:2rem}
.status-card{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:1.25rem}
.status-card h3{font-size:0.8rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1rem}
.status-row{display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border);font-size:0.85rem}
.status-row:last-child{border-bottom:none}
.status-row span:first-child{color:var(--text-dim)}
.status-row span:last-child{font-family:var(--font-mono);color:var(--cyan)}
.status-online{color:var(--green) !important;text-shadow:0 0 10px var(--green)}
.table-container{background:var(--panel);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.25)}
.table-wrapper{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:0.85rem}
thead{position:sticky;top:0;z-index:10}
th{padding:0.875rem 1.25rem;text-align:left;font-weight:600;color:var(--cyan);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em;background:var(--panel-elevated);border-bottom:1px solid var(--border);white-space:nowrap}
td{padding:0.75rem 1.25rem;border-bottom:1px solid var(--border);color:var(--text-dim);vertical-align:middle}
tbody tr{transition:all 0.2s;animation:rowIn 0.4s var(--ease) backwards}
tbody tr:nth-child(1){animation-delay:0.03s}tbody tr:nth-child(2){animation-delay:0.06s}tbody tr:nth-child(3){animation-delay:0.09s}
tbody tr:nth-child(4){animation-delay:0.12s}tbody tr:nth-child(5){animation-delay:0.15s}
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
.cell-comment{max-width:260px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.5}
.ip-badge{font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);background:rgba(0,0,0,0.25);padding:0.2rem 0.5rem;border-radius:4px;display:inline-block}
.page-tag{background:var(--cyan-dim);color:var(--cyan);padding:0.2rem 0.55rem;border-radius:4px;font-size:0.7rem;font-weight:600;border:1px solid var(--border)}
.seen-dot{width:8px;height:8px;border-radius:50%;display:inline-block}
.seen-yes{background:var(--green);box-shadow:0 0 8px var(--green)}
.seen-no{background:var(--cyan);box-shadow:0 0 8px var(--cyan);animation:pulseDot 2s infinite}
.btn-delete{background:transparent;border:1px solid var(--danger);color:var(--danger);padding:0.35rem 0.75rem;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;transition:all 0.2s;display:inline-flex;align-items:center;gap:0.35rem}
.btn-delete:hover{background:var(--danger);color:#fff;box-shadow:0 0 15px rgba(255,42,109,0.25)}
.empty-state{text-align:center;padding:4rem 2rem;color:var(--text-muted)}
.empty-icon{font-size:3rem;margin-bottom:1rem;opacity:0.4}
.empty-state h3{color:var(--text-dim);font-size:1.1rem;margin-bottom:0.5rem}
.toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;gap:1rem;flex-wrap:wrap}
.search-box{position:relative;flex:1;min-width:240px;max-width:360px}
.search-box input{width:100%;background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:0.625rem 1rem 0.625rem 2.5rem;color:var(--text);font-size:0.9rem;outline:none;transition:all 0.3s}
.search-box::before{content:'🔍';position:absolute;left:0.875rem;top:50%;transform:translateY(-50%);font-size:0.9rem;opacity:0.4}
.search-box input:focus{border-color:var(--cyan);box-shadow:0 0 0 3px var(--cyan-dim)}
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

/* Chat & Marquee Chips */
.chat-toggle-btn{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--cyan),var(--blue));border:none;color:#000;font-size:1.6rem;cursor:pointer;z-index:10003;box-shadow:0 0 30px var(--glow),0 4px 20px rgba(0,0,0,0.4);transition:all 0.3s var(--ease);display:grid;place-items:center;animation:floatLogo 6s ease-in-out infinite}
.chat-toggle-btn:hover{transform:scale(1.15) rotate(10deg);box-shadow:0 0 50px var(--glow)}
.chat-panel{position:fixed;bottom:96px;right:24px;width:420px;max-width:calc(100vw - 48px);height:560px;max-height:calc(100vh - 130px);background:var(--panel-solid);border:1px solid var(--border-bright);border-radius:20px;display:none;flex-direction:column;z-index:10003;box-shadow:0 30px 100px rgba(0,0,0,0.8),inset 0 0 60px rgba(0,240,255,0.02);overflow:hidden;animation:panelIn 0.5s var(--ease);backdrop-filter:blur(40px)}
@keyframes panelIn{from{opacity:0;transform:translateY(20px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
.chat-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),var(--green),transparent);z-index:10}
.chat-header{padding:1rem 1.25rem;background:rgba(0,0,0,0.4);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;position:relative;z-index:5}
.chat-header>span:first-child{display:flex;align-items:center;gap:0.75rem;font-family:var(--font-display);font-weight:700;color:var(--cyan);font-size:0.95rem}
.neural-status{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 10px var(--green);animation:pulseDot 2s infinite}
.chat-header button{width:32px;height:32px;border-radius:50%;border:1px solid var(--border);background:transparent;color:var(--text-dim);cursor:pointer;display:grid;place-items:center;font-size:1.2rem;transition:all 0.2s}
.chat-header button:hover{border-color:var(--danger);color:var(--danger);background:rgba(255,42,109,0.1)}
.chat-messages{flex:1;overflow-y:auto;padding:1.25rem;display:flex;flex-direction:column;gap:0.875rem;position:relative;z-index:3;scroll-behavior:smooth}
.chat-bubble{max-width:88%;padding:0.875rem 1.125rem;border-radius:14px;font-size:0.88rem;line-height:1.6;word-break:break-word;animation:msgIn 0.4s var(--ease);position:relative}
@keyframes msgIn{from{opacity:0;transform:translateY(10px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.chat-bubble.user{align-self:flex-end;background:linear-gradient(135deg,var(--cyan),var(--blue));color:#000;border-bottom-right-radius:4px;font-weight:600;box-shadow:0 4px 20px rgba(0,240,255,0.15)}
.chat-bubble.assistant{align-self:flex-start;background:rgba(0,0,0,0.35);border:1px solid var(--border);color:var(--text);border-bottom-left-radius:4px}
.chat-bubble .ts{font-size:0.6rem;opacity:0.4;margin-top:6px;display:block;font-family:var(--font-mono)}
.chat-bubble pre{background:rgba(0,0,0,0.5);border:1px solid var(--border);border-radius:8px;padding:0.75rem;margin:0.5rem 0;overflow-x:auto;font-family:var(--font-mono);font-size:0.8rem;line-height:1.5;position:relative}
.chat-bubble pre code{color:var(--cyan)}
.chat-bubble code:not(pre code){background:rgba(0,240,255,0.08);color:var(--cyan);padding:0.15rem 0.4rem;border-radius:4px;font-family:var(--font-mono);font-size:0.82rem;border:1px solid rgba(0,240,255,0.1)}
.chat-bubble strong{color:var(--text);font-weight:600}
.copy-code-btn{position:absolute;top:6px;right:6px;background:var(--panel);border:1px solid var(--border);color:var(--text-dim);font-size:0.65rem;padding:2px 8px;border-radius:4px;cursor:pointer;font-family:var(--font-mono);transition:all 0.2s}
.copy-code-btn:hover{background:var(--cyan);color:#000;border-color:var(--cyan)}
.chat-typing{padding:0 1.25rem 0.75rem;font-size:0.78rem;color:var(--text-dim);font-family:var(--font-mono);display:none;align-items:center;gap:8px;position:relative;z-index:3}
.chat-typing span:first-child{font-style:italic;opacity:0.7}
.chat-typing .dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;animation:typingBounce 1.4s infinite ease-in-out both;box-shadow:0 0 8px var(--cyan)}
.chat-typing .dot:nth-child(2){animation-delay:-0.32s}.chat-typing .dot:nth-child(3){animation-delay:-0.16s}.chat-typing .dot:nth-child(4){animation-delay:0s}
@keyframes typingBounce{0%,80%,100%{transform:scale(0);opacity:0.3}40%{transform:scale(1);opacity:1}}

/* Marquee Chips */
.neural-chips{display:flex;overflow:hidden;padding:0.5rem 1.25rem;position:relative;z-index:3;height:44px;align-items:center}
.neural-chips.hidden{display:none !important}
.chips-track{display:flex;gap:0.5rem;animation:chipMarquee 16s linear infinite;width:max-content}
.neural-chips:hover .chips-track{animation-play-state:paused}
@keyframes chipMarquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.neural-chip{background:rgba(0,240,255,0.05);border:1px solid var(--border);color:var(--text-dim);padding:0.35rem 0.75rem;border-radius:999px;font-size:0.75rem;cursor:pointer;transition:all 0.2s;white-space:nowrap;user-select:none}
.neural-chip:hover{border-color:var(--cyan);color:var(--cyan);background:rgba(0,240,255,0.1);transform:translateY(-1px)}
.chat-input-area{display:flex;gap:0.5rem;padding:0.875rem 1.25rem;border-top:1px solid var(--border);background:rgba(0,0,0,0.35);position:relative;z-index:5;align-items:flex-end}
.neural-textarea-wrap{flex:1;position:relative}
.neural-textarea-wrap textarea{width:100%;background:rgba(0,0,0,0.25);border:1px solid var(--border);border-radius:12px;padding:0.625rem 2.5rem 0.625rem 1rem;color:var(--text);font-family:var(--font-main);outline:none;font-size:0.9rem;resize:none;min-height:44px;max-height:120px;line-height:1.5;overflow-y:auto}
.neural-textarea-wrap textarea:focus{border-color:var(--cyan);box-shadow:0 0 15px var(--glow)}
.neural-textarea-wrap textarea::placeholder{color:var(--text-dim);opacity:0.4}
#chatSend{width:44px;height:44px;border-radius:50%;border:none;background:linear-gradient(135deg,var(--cyan),var(--blue));color:#000;cursor:pointer;display:grid;place-items:center;transition:all 0.2s;font-size:1.1rem;flex-shrink:0;box-shadow:0 4px 15px var(--glow)}
#chatSend:hover{transform:scale(1.08);box-shadow:0 8px 25px var(--glow)}
#chatSend:disabled{opacity:0.4;cursor:not-allowed;transform:none;box-shadow:none}
@media(max-width:1024px){.sidebar{transform:translateX(-100%)}.sidebar.open{transform:translateX(0)}.main{margin-left:0}.menu-toggle{display:inline-flex !important}}
@media(max-width:768px){.stats-grid{grid-template-columns:repeat(2,1fr)}.content{padding:1rem}.main-header{padding:1rem}.chat-panel{right:12px;bottom:80px;width:calc(100vw - 24px);height:60vh}}
.menu-toggle{display:none;background:transparent;border:1px solid var(--border);color:var(--text);padding:0.4rem 0.7rem;border-radius:6px;cursor:pointer;font-size:1rem}
.hidden{display:none !important}
</style>
</head>
<body>
<div class="scan-h top" aria-hidden="true"></div><div class="scan-h bottom" aria-hidden="true"></div><div class="scan-v left" aria-hidden="true"></div><div class="scan-v right" aria-hidden="true"></div>
<div class="bg-grid" aria-hidden="true"></div><div class="bg-glow" aria-hidden="true"></div><canvas id="particleCanvas" aria-hidden="true"></canvas>
<div class="toast-container" id="toastContainer"></div>
<div id="loginScreen" class="login-screen"><div class="login-card" id="loginCard">
  <div class="brand"><img src="https://i.ibb.co/fVD4078t/maureonix-logo.png" alt="" class="brand-logo" onerror="this.style.display='none'"><h1>MAUREONIX</h1><p>Command Center</p></div>
    <div class="input-group"><label>Admin Secret Key</label><input type="password" id="secretInput" placeholder="Enter neural key..." autocomplete="off" onkeypress="if(event.key==='Enter')doLogin()">${isDefaultSecret ? '<small style="color:#8a9bb8;display:block;margin-top:6px;font-size:0.75rem;">Default secret: <code style="background:rgba(0,240,255,0.08);padding:2px 6px;border-radius:4px;">maureonix_secret_key</code></small>' : ''}</div>
  <button class="btn" onclick="doLogin()">AUTHENTICATE</button>
</div></div>
<div id="appShell" class="app-shell">
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-brand"><img src="https://i.ibb.co/fVD4078t/maureonix-logo.png" alt="" onerror="this.style.display='none'"><div><span>Maureonix</span><small>Command Center</small></div></div>
    <nav class="nav-menu">
      <button class="nav-item active" onclick="switchTab('dashboard')" data-tab="dashboard"><span class="nav-icon">📊</span> Dashboard</button>
      <button class="nav-item" onclick="switchTab('feedback')" data-tab="feedback"><span class="nav-icon">📨</span> Feedback</button>
      <button class="nav-item" onclick="switchTab('visitors')" data-tab="visitors"><span class="nav-icon">🌐</span> Visitors</button>
      <button class="nav-item" onclick="switchTab('neural')" data-tab="neural"><span class="nav-icon">🧠</span> Neural</button>
      <a href="/admin/feedback" class="nav-item" style="margin-top:1rem;border-top:1px solid var(--border);padding-top:1rem;"><span class="nav-icon">🔐</span> Legacy Feedback</a>
      <a href="/dashboard" class="nav-item" target="_blank"><span class="nav-icon">🚀</span> Public Site</a>
    </nav>
    <div class="sidebar-footer"><b>MAUREONIX</b> v${pkg.version}<br><span id="sidebarUptime">—</span></div>
  </aside>
  <main class="main">
    <div class="main-header">
      <h2 id="pageTitle">📊 Overview</h2>
      <div class="header-actions">
        <button class="menu-toggle" id="menuToggle" onclick="toggleSidebar()">☰</button>
        <div class="live-indicator"><span class="pulse-dot"></span><span>ONLINE</span></div>
        <button class="btn-icon install-btn" id="installBtn" onclick="installPWA()">📲 Install</button>
        <button class="btn-icon" onclick="refreshAll()" title="Refresh">🔄 Refresh</button>
        <button class="btn-icon danger" onclick="logout()" title="Logout">🚪 Logout</button>
      </div>
    </div>
    <div class="content">
      <div id="tab-dashboard" class="tab-content active">
        <div class="stats-grid" id="statsGrid">
          <div class="stat-card"><div class="stat-header"><span class="stat-label">Total Visitors</span><div class="stat-icon">🌐</div></div><div class="stat-value" id="stVisitors">—</div><div class="stat-meta">All-time page loads</div><div class="stat-bar-bg"><div class="stat-bar-fill" id="barVisitors" style="width:0%;background:var(--cyan)"></div></div></div>
          <div class="stat-card green"><div class="stat-header"><span class="stat-label">Unique IPs</span><div class="stat-icon">👤</div></div><div class="stat-value" id="stUnique">—</div><div class="stat-meta">Distinct addresses</div></div>
          <div class="stat-card warning"><div class="stat-header"><span class="stat-label">Pair Attempts</span><div class="stat-icon">🔗</div></div><div class="stat-value" id="stPairs">—</div><div class="stat-meta">WhatsApp links initiated</div></div>
          <div class="stat-card"><div class="stat-header"><span class="stat-label">Feedback</span><div class="stat-icon">📨</div></div><div class="stat-value" id="stFeedback">—</div><div class="stat-meta">Total submissions</div></div>
          <div class="stat-card green"><div class="stat-header"><span class="stat-label">Avg Rating</span><div class="stat-icon">⭐</div></div><div class="stat-value" id="stRating">—</div><div class="stat-meta">Out of 5 stars</div></div>
          <div class="stat-card danger"><div class="stat-header"><span class="stat-label">Unseen</span><div class="stat-icon">👁</div></div><div class="stat-value" id="stUnseen">—</div><div class="stat-meta">Awaiting review</div></div>
          <div class="stat-card"><div class="stat-header"><span class="stat-label">Uptime</span><div class="stat-icon">⏱</div></div><div class="stat-value" id="stUptime">—</div><div class="stat-meta">Since last boot</div></div>
          <div class="stat-card green"><div class="stat-header"><span class="stat-label">Status</span><div class="stat-icon">🟢</div></div><div class="stat-value" id="stStatus" style="font-size:1.2rem;padding-top:0.3rem;">ONLINE</div><div class="stat-meta">Neural link active</div></div>
        </div>
        <div class="chart-grid">
          <div class="chart-card"><h3>Recent Activity (Last 10 Hits)</h3><div class="chart-bars" id="visitorChart"></div></div>
          <div class="chart-card"><h3>System Monitor</h3><div class="status-grid" style="margin-bottom:0;"><div class="status-card"><div class="status-row"><span>Node.js</span><span id="sysNode">—</span></div><div class="status-row"><span>Platform</span><span id="sysPlatform">—</span></div><div class="status-row"><span>Version</span><span id="sysVer">—</span></div><div class="status-row"><span>Memory RSS</span><span id="sysMem">—</span></div><div class="status-row"><span>Heap Used</span><span id="sysHeap">—</span></div></div></div></div>
        </div>
      </div>
      <div id="tab-feedback" class="tab-content">
        <div class="toolbar"><div class="search-box"><input type="text" id="fbSearch" placeholder="Search feedback..." oninput="renderFeedback()"></div><div class="toolbar-right"><button class="btn-icon" onclick="markAllSeen()" title="Mark all seen">✓ Mark All Seen</button><button class="btn-icon" onclick="exportCSV()" title="Export CSV">📥 Export</button><button class="btn-icon danger" onclick="deleteAll()" title="Clear all">🗑 Clear All</button><span id="fbCount">0 entries</span></div></div>
        <div class="table-container"><div class="table-wrapper"><table id="fbTable"><thead><tr><th>ID</th><th>Time</th><th>Rating</th><th>Comment</th><th>Contact</th><th>Page</th><th>IP</th><th>Seen</th><th style="text-align:center;">Action</th></tr></thead><tbody id="fbBody"><tr><td colspan="9" class="empty-state"><div class="empty-icon">📭</div><h3>No feedback</h3></td></tr></tbody></table></div></div>
      </div>
      <div id="tab-visitors" class="tab-content">
        <div class="toolbar"><div class="toolbar-right"><span id="visCount">0 recent hits</span></div></div>
        <div class="table-container"><div class="table-wrapper"><table><thead><tr><th>Time</th><th>IP Address</th><th>Path</th><th>User Agent</th></tr></thead><tbody id="visBody"><tr><td colspan="4" class="empty-state"><div class="empty-icon">🌐</div><h3>No visitors yet</h3></td></tr></tbody></table></div></div>
      </div>
      <div id="tab-neural" class="tab-content">
        <div class="chat-panel" style="position:relative;bottom:auto;right:auto;width:100%;max-width:none;height:70vh;max-height:none;display:flex;animation:none;border-radius:12px;">
          <div class="chat-messages" id="neuralMessages" style="flex:1;padding:1.5rem;"></div>
          <div class="chat-typing" id="neuralTyping"><span>Neural pathways connecting</span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
          <div class="neural-chips" id="tabChips">
            <div class="chips-track">
              <span class="neural-chip" onclick="sendQuick('How do I pair my WhatsApp?')">🔗 Pair Device</span>
              <span class="neural-chip" onclick="sendQuick('List all AI commands')">🤖 AI Commands</span>
              <span class="neural-chip" onclick="sendQuick('What is Maureonix?')">❓ About</span>
              <span class="neural-chip" onclick="sendQuick('Show bot status')">📊 Status</span>
              <span class="neural-chip" onclick="sendQuick('How do I pair my WhatsApp?')">🔗 Pair Device</span>
              <span class="neural-chip" onclick="sendQuick('List all AI commands')">🤖 AI Commands</span>
              <span class="neural-chip" onclick="sendQuick('What is Maureonix?')">❓ About</span>
              <span class="neural-chip" onclick="sendQuick('Show bot status')">📊 Status</span>
            </div>
          </div>
          <div class="chat-input-area"><div class="neural-textarea-wrap" style="flex:1;"><textarea id="neuralInput" placeholder="Ask Maureonix anything..." oninput="autoResize(this);checkChips()" onkeydown="handleChatKey(event)" style="width:100%;"></textarea></div><button id="neuralSend" onclick="sendChatMessage()" style="width:44px;height:44px;border-radius:50%;border:none;background:linear-gradient(135deg,var(--cyan),var(--blue));color:#000;cursor:pointer;display:grid;place-items:center;font-size:1.1rem;flex-shrink:0;box-shadow:0 4px 15px var(--glow);">➤</button></div>
        </div>
      </div>
    </div>
  </main>
</div>
<button class="chat-toggle-btn" id="chatToggle" onclick="toggleChat()" title="Neural Assistant">🦊</button>
<div class="chat-panel" id="chatPanel" style="display:none;"><div class="chat-header"><span><span class="neural-status"></span> Neural Assistant</span><button onclick="toggleChat()">×</button></div><div class="chat-messages" id="chatMessages"></div><div class="chat-typing" id="chatTyping"><span>Thinking</span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div><div class="neural-chips" id="floatChips"><div class="chips-track"><span class="neural-chip" onclick="sendQuick('How do I pair my WhatsApp?')">🔗 Pair</span><span class="neural-chip" onclick="sendQuick('List all AI commands')">🤖 AI</span><span class="neural-chip" onclick="sendQuick('Show bot status')">📊 Status</span><span class="neural-chip" onclick="sendQuick('How do I pair my WhatsApp?')">🔗 Pair</span><span class="neural-chip" onclick="sendQuick('List all AI commands')">🤖 AI</span><span class="neural-chip" onclick="sendQuick('Show bot status')">📊 Status</span></div></div><div class="chat-input-area"><div class="neural-textarea-wrap"><textarea id="chatInput" placeholder="Ask Maureonix anything..." oninput="autoResize(this);checkChips()" onkeydown="handleChatKey(event)"></textarea></div><button id="chatSend" onclick="sendChatMessage()">➤</button></div></div>
<div class="modal-overlay" id="deleteModal" onclick="if(event.target===this)closeModal()"><div class="cyber-modal"><div class="modal-icon">🗑</div><h3>Purge Entry</h3><p>Permanently delete this feedback? This cannot be undone.</p><div class="modal-actions"><button class="btn-secondary" onclick="closeModal()">Cancel</button><button class="btn-danger-solid" onclick="confirmDelete()">Purge</button></div></div></div>
<script>
var ADMIN_KEY='maureonix-admin-secret';var secret=localStorage.getItem(ADMIN_KEY)||'';var allFeedback=[];var deleteTargetId=null;var deferredPrompt=null;var currentTab='dashboard';var statsData={};var isChatOpen=false;
if(secret)doLogin();
var swCode="self.addEventListener('install',function(e){e.waitUntil(self.skipWaiting())});self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim())});self.addEventListener('fetch',function(e){e.respondWith(fetch(e.request).catch(function(){return new Response('Offline',{status:503})}))});";
if('serviceWorker' in navigator){try{navigator.serviceWorker.register(URL.createObjectURL(new Blob([swCode],{type:'application/javascript'}))).catch(function(){});}catch(e){}}
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredPrompt=e;var btn=document.getElementById('installBtn');if(btn)btn.classList.add('visible');});
function installPWA(){if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt.userChoice.then(function(){deferredPrompt=null;});document.getElementById('installBtn').classList.remove('visible');}
function showToast(msg,type){var c=document.getElementById('toastContainer');var t=document.createElement('div');t.className='toast toast-'+(type||'info');var i=type==='success'?'✓':type==='error'?'✕':'ℹ';t.innerHTML='<span class="toast-icon">'+i+'</span><span>'+msg+'</span>';c.appendChild(t);requestAnimationFrame(function(){t.classList.add('show');});setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove();},400);},4000);}
async function doLogin(){if(!secret)secret=document.getElementById('secretInput').value.trim();if(!secret)return;try{var r=await fetch('/api/admin/stats?secret='+encodeURIComponent(secret));if(!r.ok)throw new Error('Unauthorized');statsData=await r.json();localStorage.setItem(ADMIN_KEY,secret);document.getElementById('loginScreen').classList.add('hidden');var shell=document.getElementById('appShell');shell.classList.remove('hidden');shell.classList.add('visible');showToast('Neural link established. Welcome, Admin.','success');renderDashboard();renderFeedback();renderVisitors();startPolling();initChatSession();}catch(e){showToast('Authentication failed.','error');secret='';localStorage.removeItem(ADMIN_KEY);var card=document.getElementById('loginCard');card.classList.add('shake');setTimeout(function(){card.classList.remove('shake');},500);}}
function logout(){secret='';localStorage.removeItem(ADMIN_KEY);stopPolling();document.getElementById('loginScreen').classList.remove('hidden');var shell=document.getElementById('appShell');shell.classList.add('hidden');shell.classList.remove('visible');document.getElementById('secretInput').value='';showToast('Session terminated.','info');}
function refreshAll(){doLogin();showToast('Data refreshed.','success');}
function switchTab(tab){currentTab=tab;document.querySelectorAll('.tab-content').forEach(function(el){el.classList.remove('active');});document.getElementById('tab-'+tab).classList.add('active');document.querySelectorAll('.nav-item').forEach(function(el){el.classList.remove('active');});var nav=document.querySelector('.nav-item[data-tab="'+tab+'"]');if(nav)nav.classList.add('active');var titles={dashboard:'📊 Overview',feedback:'📨 Feedback',visitors:'🌐 Visitors',neural:'🧠 Neural'};document.getElementById('pageTitle').textContent=titles[tab]||'Overview';var floatChat=document.getElementById('chatToggle');if(tab==='neural'){floatChat.style.display='none';document.getElementById('chatPanel').style.display='none';isChatOpen=false;}else{floatChat.style.display='grid';}if(window.innerWidth<1024)document.getElementById('sidebar').classList.remove('open');}
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');}
function renderDashboard(){if(!statsData)return;document.getElementById('stVisitors').textContent=(statsData.totalVisitors||0).toLocaleString();document.getElementById('stUnique').textContent=(statsData.uniqueVisitors||0).toLocaleString();document.getElementById('stPairs').textContent=(statsData.totalPairs||0).toLocaleString();document.getElementById('stFeedback').textContent=(statsData.feedbackCount||0).toLocaleString();document.getElementById('stRating').textContent=(statsData.avgRating||'0.0')+' ★';document.getElementById('stUnseen').textContent=(statsData.unseenFeedback||0).toLocaleString();var sec=statsData.uptime||0;var h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;document.getElementById('stUptime').textContent=(h>0?h+'h ':'')+m+'m '+s+'s';document.getElementById('sidebarUptime').textContent='UP '+(h>0?h+'h ':'')+m+'m';document.getElementById('stStatus').innerHTML='<span style="color:var(--green);text-shadow:0 0 10px var(--green);">●</span> ONLINE';document.getElementById('sysNode').textContent=statsData.nodeVersion||'—';document.getElementById('sysPlatform').textContent=statsData.platform||'—';document.getElementById('sysVer').textContent=statsData.version||'—';document.getElementById('sysMem').textContent=(statsData.memory&&statsData.memory.rss?statsData.memory.rss+' MB':'—');document.getElementById('sysHeap').textContent=(statsData.memory&&statsData.memory.heapUsed?statsData.memory.heapUsed+' MB':'—');var bar=Math.min(100,(statsData.totalVisitors||0)/10);document.getElementById('barVisitors').style.width=bar+'%';}
function renderVisitorChart(){var chart=document.getElementById('visitorChart');if(!chart)return;chart.innerHTML='';var data=[3,7,5,12,8,15,10,18,14,20];var max=Math.max.apply(null,data);data.forEach(function(val,i){var bar=document.createElement('div');bar.className='chart-bar';bar.style.height=(val/max*100)+'%';bar.dataset.label='T-'+(10-i);chart.appendChild(bar);});}
async function renderFeedback(){var query=document.getElementById('fbSearch').value.toLowerCase().trim();var list=allFeedback;if(query){list=list.filter(function(f){return(f.comment&&f.comment.toLowerCase().indexOf(query)!==-1)||(f.contact&&f.contact.toLowerCase().indexOf(query)!==-1)||(f.page&&f.page.toLowerCase().indexOf(query)!==-1)||(f.ip&&f.ip.toLowerCase().indexOf(query)!==-1)||String(f.id).toLowerCase().indexOf(query)!==-1;});}document.getElementById('fbCount').textContent=list.length+' entries';var tbody=document.getElementById('fbBody');if(!list.length){tbody.innerHTML='<tr><td colspan="9" class="empty-state"><div class="empty-icon">📭</div><h3>No feedback found</h3></td></tr>';return;}tbody.innerHTML=list.map(function(f,i){var date=new Date(f.timestamp);var dateStr=date.toLocaleDateString('en-US',{month:'short',day:'numeric'});var timeStr=date.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});var unseenClass=f.seen?'':'unseen';var seenDot=f.seen?'<span class="seen-dot seen-yes"></span>':'<span class="seen-dot seen-no"></span>';var shortId=String(f.id).slice(-8).toUpperCase();var comment=f.comment?escapeHtml(f.comment):'<span style="color:var(--text-muted);font-style:italic;">No comment</span>';return'<tr class="'+unseenClass+'" style="animation-delay:'+(i*0.025)+'s"><td class="cell-id"><span class="id-hash">#</span>'+shortId+'</td><td class="cell-time"><div>'+dateStr+'</div><div class="cell-time-sub">'+timeStr+'</div></td><td class="cell-rating">'+'★'.repeat(f.rating)+'<span class="rating-empty">'+'☆'.repeat(5-f.rating)+'</span></td><td class="cell-comment" title="'+escapeHtml(f.comment||'')+'">'+comment+'</td><td class="cell-contact">'+(f.contact?escapeHtml(f.contact):'<span style="color:var(--text-muted);">-</span>')+'</td><td>'+(f.page?'<span class="page-tag">'+escapeHtml(f.page)+'</span>':'<span style="color:var(--text-muted);">-</span>')+'</td><td><span class="ip-badge">'+(f.ip||'-')+'</span></td><td>'+seenDot+'</td><td style="text-align:center;"><button class="btn-delete" onclick="openDeleteModal(\\''+f.id+'\\')"><span>🗑</span> Delete</button></td></tr>';}).join('');}
function escapeHtml(t){var d=document.createElement('div');d.textContent=t||'';return d.innerHTML;}
function openDeleteModal(id){deleteTargetId=id;document.getElementById('deleteModal').classList.add('active');}
function closeModal(){document.getElementById('deleteModal').classList.remove('active');deleteTargetId=null;}
async function confirmDelete(){if(!deleteTargetId)return;closeModal();try{await fetch('/api/feedback/'+deleteTargetId+'?secret='+encodeURIComponent(secret),{method:'DELETE'});showToast('Purged.','success');doLogin();}catch(e){showToast('Purge failed.','error');}}
async function deleteAll(){if(!allFeedback.length)return;if(!confirm('⚠️ Delete ALL feedback? This is irreversible.'))return;var deleted=0;for(var i=0;i<allFeedback.length;i++){try{await fetch('/api/feedback/'+allFeedback[i].id+'?secret='+encodeURIComponent(secret),{method:'DELETE'});deleted++;}catch(e){}}showToast('Purged '+deleted+' entries.','success');doLogin();}
async function markAllSeen(){try{await fetch('/api/feedback/seen?secret='+encodeURIComponent(secret),{method:'POST'});showToast('All marked as seen.','success');doLogin();}catch(e){showToast('Failed.','error');}}
function exportCSV(){if(!allFeedback.length)return showToast('No data.','error');var headers=['ID','Timestamp','Rating','Comment','Contact','Page','IP','Seen'];var rows=allFeedback.map(function(f){return[f.id,f.timestamp,f.rating,'"'+(f.comment||'').replace(/"/g,'""')+'"',f.contact||'',f.page||'',f.ip||'',f.seen?'Yes':'No'].join(',');});var csv=headers.join(',')+'\\n'+rows.join('\\n');var blob=new Blob([csv],{type:'text/csv'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='maureonix_feedback_'+new Date().toISOString().slice(0,10)+'.csv';a.click();URL.revokeObjectURL(url);showToast('CSV exported.','success');}
async function renderVisitors(){try{var r=await fetch('/api/admin/visitors?secret='+encodeURIComponent(secret));if(!r.ok)throw new Error('Unauthorized');var data=await r.json();var list=data.visitors||[];document.getElementById('visCount').textContent=list.length+' recent hits';var tbody=document.getElementById('visBody');if(!list.length){tbody.innerHTML='<tr><td colspan="4" class="empty-state"><div class="empty-icon">🌐</div><h3>No visitors yet</h3></td></tr>';return;}tbody.innerHTML=list.slice(0,50).map(function(v,i){var date=new Date(v.time);var timeStr=date.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});var ua=(v.ua||'').split(' ')[0]||'-';return'<tr style="animation-delay:'+(i*0.02)+'s"><td class="cell-time">'+timeStr+'</td><td><span class="ip-badge">'+(v.ip||'-')+'</span></td><td><span class="page-tag">'+(v.path||'/')+'</span></td><td style="font-size:0.75rem;max-width:200px;overflow:hidden;text-overflow:ellipsis;">'+escapeHtml(ua)+'</td></tr>';}).join('');}catch(e){showToast('Failed to load visitors.','error');}}
var pollTimer=null;function startPolling(){if(pollTimer)clearInterval(pollTimer);pollTimer=setInterval(async function(){try{var r=await fetch('/api/admin/stats?secret='+encodeURIComponent(secret));if(r.ok){statsData=await r.json();renderDashboard();var fb=await fetch('/api/feedback/list?secret='+encodeURIComponent(secret));if(fb.ok){var d=await fb.json();allFeedback=d.feedback||[];if(currentTab==='feedback')renderFeedback();}}}catch(e){}},10000);}
function stopPolling(){if(pollTimer)clearInterval(pollTimer);pollTimer=null;}

/* ── Neural Chat (Hardened for Admin Command Center) ── */
var CHAT_SESSION_KEY='maureonix-chat-session';var CHAT_HISTORY_KEY='maureonix-chat-history';
var chatSessionId='';var chatHistory=[];var isChatOpen=false;

function generateSessionId(){ return'sess_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10); }
function initChatSession(){
  try {
    chatSessionId=localStorage.getItem(CHAT_SESSION_KEY)||generateSessionId();
    localStorage.setItem(CHAT_SESSION_KEY,chatSessionId);
    var raw=localStorage.getItem(CHAT_HISTORY_KEY);
    chatHistory=raw?JSON.parse(raw):[];
    renderChatHistory();
    if(!chatHistory.length){
      appendChatBubble('assistant','Welcome to the **Neural Command Center**.\\n\\nI am Maureonix. Ask me about commands, pairing, or anything.',Date.now(),true);
    }
  } catch(e){ chatSessionId=generateSessionId(); }
}

function saveChatHistory(){ try{ localStorage.setItem(CHAT_HISTORY_KEY,JSON.stringify(chatHistory.slice(-50))); }catch(e){} }
function renderChatHistory(){
  var container=currentTab==='neural'?document.getElementById('neuralMessages'):document.getElementById('chatMessages');
  if(!container)return;
  container.innerHTML='';
  chatHistory.forEach(function(msg){ appendChatBubble(msg.role,msg.text,msg.ts,false); });
  scrollChatToBottom();
}

function parseMarkdown(text){
  var html=text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  var tick=String.fromCharCode(96);
  var parts=html.split(tick+tick+tick);
  for(var i=1;i<parts.length;i+=2){
    var block=parts[i];
    var nl=block.indexOf('\\n');
    var code=nl>-1?block.substring(nl+1):block;
    parts[i]='<pre><button class="copy-code-btn" onclick="copyCode(this)">COPY</button><code>'+code.trim()+'</code></pre>';
  }
  html=parts.join('');
  var parts2=html.split(tick);
  for(var j=1;j<parts2.length;j+=2){ parts2[j]='<code>'+parts2[j]+'</code>'; }
  html=parts2.join('');
  html=html.replace(/\\*\\*([^*]+)\\*\\*/g,'<strong>$1</strong>');
  html=html.replace(/\\*([^*]+)\\*/g,'<em>$1</em>');
  html=html.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  html=html.replace(/\\n/g,'<br>');
  return html;
}

function copyCode(btn){
  var code=btn.parentElement.querySelector('code').innerText;
  navigator.clipboard.writeText(code).then(function(){
    btn.textContent='COPIED';setTimeout(function(){ btn.textContent='COPY'; },2000);
  });
}

function appendChatBubble(role,text,ts,save){
  var container=currentTab==='neural'?document.getElementById('neuralMessages'):document.getElementById('chatMessages');
  if(!container)return;
  var bubble=document.createElement('div');
  bubble.className='chat-bubble '+role;
  var timeStr=ts?new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';
  var parsed=role==='assistant'?parseMarkdown(text):text.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\n/g,'<br>');
  bubble.innerHTML=parsed+'<span class="ts">'+timeStr+'</span>';
  container.appendChild(bubble);
  if(save){ chatHistory.push({role,text,ts:ts||Date.now()});saveChatHistory(); }
  scrollChatToBottom();
}

function scrollChatToBottom(){
  var container=currentTab==='neural'?document.getElementById('neuralMessages'):document.getElementById('chatMessages');
  if(container) container.scrollTop=container.scrollHeight;
}

function autoResize(ta){ ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,120)+'px'; }
function handleChatKey(e){ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault();sendChatMessage(); } }
function checkChips(){
  var hasText=false;
  ['chatInput','neuralInput'].forEach(function(id){
    var el=document.getElementById(id);if(el&&el.value.trim().length>0)hasText=true;
  });
  var chips=document.querySelectorAll('.neural-chips');
  chips.forEach(function(c){ if(hasText)c.classList.add('hidden');else c.classList.remove('hidden'); });
}

function sendQuick(text){
  var ta=currentTab==='neural'?document.getElementById('neuralInput'):document.getElementById('chatInput');
  if(ta){ ta.value=text;autoResize(ta);checkChips(); }
  sendChatMessage();
}

async function sendChatMessage(){
  var ta=currentTab==='neural'?document.getElementById('neuralInput'):document.getElementById('chatInput');
  if(!ta)return;
  var btn=currentTab==='neural'?document.getElementById('neuralSend'):document.getElementById('chatSend');
  var text=ta.value.trim();
  if(!text)return;
  ta.value='';autoResize(ta);checkChips();
  appendChatBubble('user',text,Date.now(),true);
  var typingEl=currentTab==='neural'?document.getElementById('neuralTyping'):document.getElementById('chatTyping');
  if(typingEl)typingEl.style.display='flex';
  if(btn)btn.disabled=true;
  try{
    var res=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:chatSessionId,message:text})});
    var data=await res.json();
    if(data.text){
      appendChatBubble('assistant',data.text,Date.now(),true);
    }else{
      appendChatBubble('assistant','⚠️ Neural link interrupted. Please retry.',Date.now(),true);
    }
  }catch(e){
    appendChatBubble('assistant','❌ Connection failed. The neural network is unreachable.',Date.now(),true);
  }
  if(typingEl)typingEl.style.display='none';
  if(btn)btn.disabled=false;
  if(ta)ta.focus();
}

/* ── Toggle the floating chat panel ── */
function toggleChat(){
  var panel=document.getElementById('chatPanel');
  if(!panel)return;
  isChatOpen=!isChatOpen;
  panel.style.display=isChatOpen?'flex':'none';
  if(isChatOpen){
    var chatInput=document.getElementById('chatInput');
    if(chatInput)chatInput.focus();
    scrollChatToBottom();
  }
}

/* ── Event delegation for chat buttons ── */
document.addEventListener('click',function(e){
  if(e.target.closest('#chatToggle')){e.preventDefault();toggleChat();return;}
  if(e.target.closest('#chatSend')){e.preventDefault();sendChatMessage();return;}
  if(e.target.closest('#neuralSend')){e.preventDefault();sendChatMessage();return;}
});

document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    var fm=document.getElementById('feedbackModal'); // in case feedback is open
    if(fm&&fm.style.display==='flex')return;
    if(isChatOpen)toggleChat();
  }
});

/* ── Init on load ── */
initChatSession();

(function(){var canvas=document.getElementById('particleCanvas');if(!canvas)return;var ctx=canvas.getContext('2d');var particles=[];function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}window.addEventListener('resize',resize);resize();for(var i=0;i<50;i++){particles.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-0.5)*0.25,vy:(Math.random()-0.5)*0.25,size:Math.random()*1.5+0.5});}function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);particles.forEach(function(p,i){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fillStyle='rgba(0,240,255,'+(p.size/4)+')';ctx.fill();for(var j=i+1;j<particles.length;j++){var p2=particles[j],dx=p.x-p2.x,dy=p.y-p2.y,d=Math.sqrt(dx*dx+dy*dy);if(d<130){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p2.x,p2.y);ctx.strokeStyle='rgba(0,240,255,'+(0.03*(1-d/130))+')';ctx.lineWidth=0.5;ctx.stroke();}}});requestAnimationFrame(draw);}draw();})();
switchTab('dashboard');
</script>
</body>
</html>`;
};