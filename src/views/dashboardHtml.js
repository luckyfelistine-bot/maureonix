module.exports = function getDashboardHtml(pkg) {
  return `<!DOCTYPE html>
<html lang="en" data-theme="neural">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover"/>
<meta name="theme-color" content="#000000"/>
<meta name="color-scheme" content="dark"/>
<meta name="description" content="Maureonix Neural Interface — The future of WhatsApp automation."/>
<title>Maureonix · Neural Interface v${pkg.version}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"/>
<style>
:root{--void:#000;--deep:#02040a;--panel:rgba(4,10,24,0.88);--panel-solid:#040a18;--border:rgba(0,240,255,0.07);--border-bright:rgba(0,240,255,0.22);--cyan:#00f0ff;--blue:#0066ff;--green:#00ff88;--fox:#ff7b2c;--text:#eef6ff;--text-dim:#8a9bb8;--danger:#ff2a6d;--warning:#ffb020;--glow:rgba(0,240,255,0.12);--font-main:'Inter',system-ui,sans-serif;--font-mono:'JetBrains Mono',monospace;--font-display:'Space Grotesk','Inter',sans-serif;--ease-out-expo:cubic-bezier(0.16,1,0.3,1)}
/* ═══ THEME ENGINE v2.0 ═══ */
[data-theme="solar"]{--cyan:#ffb020;--blue:#ff6600;--green:#ffaa00;--fox:#ff4400;--text:#fff8f0;--text-dim:#c4a882;--danger:#ff4444;--warning:#ff8800;--glow:rgba(255,176,32,0.15)}
[data-theme="matrix"]{--cyan:#00ff50;--blue:#00cc00;--green:#00ff88;--fox:#55ff55;--text:#e0ffe0;--text-dim:#55aa55;--danger:#ff3333;--warning:#ffff00;--glow:rgba(0,255,80,0.15)}
[data-theme="abyss"]{--cyan:#e000ff;--blue:#7700ff;--green:#cc00ff;--fox:#ff00ff;--text:#f0e0ff;--text-dim:#aa77cc;--danger:#ff0055;--warning:#ff00aa;--glow:rgba(200,0,255,0.15)}
[data-theme="ghost"]{--cyan:#b4c0d4;--blue:#8899aa;--green:#aaccbb;--fox:#ddeeff;--text:#f0f4f8;--text-dim:#99aabb;--danger:#ff6666;--warning:#ffcc88;--glow:rgba(180,192,212,0.15)}
[data-theme="inferno"]{--cyan:#ff4444;--blue:#ff2200;--green:#ff8800;--fox:#ffaa00;--text:#fff0e0;--text-dim:#cc9988;--danger:#ff0000;--warning:#ffcc00;--glow:rgba(255,68,68,0.15)}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:var(--border) var(--void)}
body{background:var(--void);color:var(--text);font-family:var(--font-main);overflow-x:hidden;min-height:100vh;line-height:1.6;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:8px;height:8px}
::-webkit-scrollbar-track{background:var(--void)}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:999px}
::-webkit-scrollbar-thumb:hover{background:var(--cyan)}
.skip-link{position:absolute;top:-100%;left:1rem;z-index:100000;background:var(--cyan);color:var(--void);padding:0.5rem 1rem;border-radius:0.75rem;font-weight:700;font-size:0.875rem;text-decoration:none;transition:top 150ms var(--ease-out-expo)}
.skip-link:focus{top:1rem}
.scroll-progress{position:fixed;top:0;left:0;height:2px;width:0%;z-index:10001;background:linear-gradient(90deg,var(--cyan),var(--green),var(--fox));box-shadow:0 0 10px rgba(0,240,255,0.15);transition:width 0.1s linear}
.border-scan{position:fixed;z-index:9997;pointer-events:none;opacity:0.6}
.border-scan.top,.border-scan.bottom{left:0;width:100%;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
.border-scan.top{top:0;animation:borderScanH 3s linear infinite}
.border-scan.bottom{bottom:0;animation:borderScanH 3s linear infinite reverse}
.border-scan.left,.border-scan.right{top:0;width:2px;height:100%;background:linear-gradient(180deg,transparent,var(--cyan),transparent)}
.border-scan.left{left:0;animation:borderScanV 4s linear infinite}
.border-scan.right{right:0;animation:borderScanV 4s linear infinite reverse}
@keyframes borderScanH{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
@keyframes borderScanV{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
.spotlight{position:fixed;inset:0;z-index:2;pointer-events:none;background:radial-gradient(800px circle at var(--mx,50%) var(--my,50%),rgba(0,240,255,0.15),transparent 50%);transition:background 150ms linear}
.grain{position:fixed;inset:0;z-index:9990;pointer-events:none;opacity:0.03;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-repeat:repeat;background-size:180px 180px}
.scan-system{position:fixed;inset:0;z-index:9998;pointer-events:none;overflow:hidden;opacity:0.25}
.scan-fine{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,240,255,0.035) 2px,rgba(0,240,255,0.035) 4px);animation:scanFine 6s linear infinite}
.scan-rgb{position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,0,0,.012) 0px,rgba(0,255,0,.012) 1px,rgba(0,0,255,.012) 2px,transparent 3px);background-size:3px 100%}
.scan-bar{position:absolute;top:-12%;left:0;width:100%;height:12%;background:linear-gradient(180deg,transparent 0%,rgba(0,240,255,0.06) 40%,rgba(0,255,136,.08) 50%,rgba(0,240,255,0.06) 60%,transparent 100%);filter:blur(8px);animation:scanBar 6s cubic-bezier(0.37,0,0.63,1) infinite;box-shadow:0 0 50px rgba(0,240,255,0.15)}
.scan-bar:nth-child(4){animation-delay:2s;animation-duration:7s;opacity:0.4}
.scan-bar:nth-child(5){animation-delay:4s;animation-duration:8s;opacity:0.25;background:linear-gradient(180deg,transparent,rgba(255,123,44,.06),transparent)}
.scan-vignette{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,transparent 25%,rgba(0,0,0,.55) 100%)}
.bg-mesh{position:fixed;inset:0;z-index:0;background:radial-gradient(ellipse 80% 50% at 20% 30%,rgba(0,102,255,0.12) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 70%,rgba(0,240,255,0.15) 0%,transparent 50%),radial-gradient(ellipse 50% 50% at 50% 50%,rgba(255,123,44,.025) 0%,transparent 60%);animation:meshMove 25s cubic-bezier(0.37,0,0.63,1) infinite alternate}
.bg-grid{position:fixed;inset:0;z-index:0;background-image:linear-gradient(rgba(0,240,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,255,0.035) 1px,transparent 1px);background-size:50px 50px;mask-image:radial-gradient(ellipse at 50% 50%,black 25%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse at 50% 50%,black 25%,transparent 75%)}
#particleCanvas{position:fixed;inset:0;z-index:0;opacity:0.4}
#flash{position:fixed;inset:0;z-index:9996;background:#fff;opacity:0;pointer-events:none}
#flash.active{animation:flashAnim 0.9s var(--ease-out-expo) forwards}
#infinityOverlay{position:fixed;inset:0;z-index:10001;display:none;align-items:center;justify-content:center;background:var(--void);pointer-events:none;opacity:0;transition:opacity 0.6s var(--ease-out-expo)}
#infinityOverlay.show{display:flex;opacity:1}
.infinity-svg{width:min(80vw,400px);height:auto;overflow:visible}
.infinity-path{fill:none;stroke:url(#infGrad);stroke-width:3;stroke-linecap:round;filter:drop-shadow(0 0 12px var(--cyan));stroke-dasharray:1000;stroke-dashoffset:1000}
.infinity-animate .infinity-path{animation:drawInfinity 2.2s var(--ease-out-expo) forwards}
.app{position:relative;z-index:1;opacity:0;transform:scale(0.97) translateY(10px);transition:opacity 1.2s var(--ease-out-expo),transform 1.2s var(--ease-out-expo);display:none;visibility:hidden}
.app.visible{opacity:1;transform:scale(1) translateY(0);display:block;visibility:visible}
.container{max-width:1280px;margin:0 auto;padding:0 clamp(1rem,4vw,3rem)}
#gate{position:fixed;inset:0;z-index:10000;background:var(--void);display:flex;align-items:center;justify-content:center;flex-direction:column;transition:opacity 1.6s var(--ease-out-expo),visibility 1.6s;overflow:hidden}
#gate.opening{pointer-events:none}
#gate[aria-hidden="true"]{opacity:0;visibility:hidden}
.gate-crt{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,240,255,0.035) 1px,rgba(0,240,255,0.035) 2px);pointer-events:none;z-index:2;animation:crtFlicker 0.12s infinite}
.gate-chromatic{position:absolute;inset:0;pointer-events:none;z-index:3;mix-blend-mode:screen;opacity:0.07;background:linear-gradient(90deg,rgba(255,0,0,.12) 0%,transparent 33%,transparent 66%,rgba(0,255,255,.12) 100%);animation:chromaticShift 4s ease-in-out infinite}
.gate-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,240,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,255,0.035) 1px,transparent 1px);background-size:35px 35px;perspective:600px;transform-style:preserve-3d;animation:gateGridMove 20s linear infinite}
.gate-rings{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:min(80vw,80vh);height:min(80vw,80vh);max-width:600px;max-height:600px;pointer-events:none}
.gate-ring{position:absolute;border:1px solid var(--border-bright);border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);animation:gateRingPulse 4s ease-in-out infinite}
.gate-ring:nth-child(1){width:30%;height:30%;animation-delay:0s;border-color:rgba(255,123,44,.4);border-width:2px}
.gate-ring:nth-child(2){width:50%;height:50%;animation-delay:0.4s}
.gate-ring:nth-child(3){width:70%;height:70%;animation-delay:0.8s;border-color:rgba(0,255,136,.25)}
.gate-ring:nth-child(4){width:90%;height:90%;animation-delay:1.2s;border-color:rgba(0,102,255,.2)}
.gate-ring:nth-child(5){width:110%;height:110%;animation-delay:1.6s;border-color:var(--border-bright);border-style:dashed}
.gate-hex{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:min(70vw,70vh);height:min(70vw,70vh);max-width:500px;max-height:500px;pointer-events:none;opacity:0.15;animation:hexRotate 60s linear infinite}
.gate-particles{position:absolute;inset:0;background-image:radial-gradient(circle,var(--cyan) 1px,transparent 1px);background-size:25px 25px;animation:gateParticles 25s linear infinite;opacity:0.2}
#gateCanvas{position:absolute;inset:0;z-index:1;opacity:0.6}
.gate-content{position:relative;z-index:4;text-align:center;cursor:pointer;padding:clamp(2rem,5vw,2.5rem) clamp(1.5rem,4vw,2rem);border-radius:1.5rem;background:rgba(2,4,8,.5);backdrop-filter:blur(24px);max-width:min(90vw,520px);transform-style:preserve-3d;transition:all 0.5s var(--ease-out-expo);border:1px solid transparent}
.gate-content::before{content:'';position:absolute;inset:-2px;border-radius:calc(1.5rem + 2px);background:conic-gradient(from 0deg,var(--cyan),var(--green),var(--fox),var(--blue),var(--cyan));animation:conicRotate 4s linear infinite;z-index:-1;opacity:0;transition:opacity 0.5s}
.gate-content::after{content:'';position:absolute;inset:0;border-radius:1.5rem;background:radial-gradient(600px circle at var(--mx,50%) var(--my,50%),rgba(0,240,255,.08),transparent 60%);z-index:0;opacity:0;transition:opacity 0.4s;pointer-events:none}
.gate-content:hover::before,.gate-content:focus-visible::before{opacity:0.7}
.gate-content:hover::after,.gate-content:focus-visible::after{opacity:1}
.gate-content:hover,.gate-content:focus-visible{transform:scale(1.03) translateZ(20px);box-shadow:0 0 120px rgba(0,240,255,0.15),inset 0 0 80px rgba(0,240,255,0.15)}
.gate-logo-wrap{position:relative;width:110px;height:110px;margin:0 auto 1.5rem;perspective:800px}
.gate-logo{width:100px;height:100px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,123,44,.4);box-shadow:0 0 50px rgba(255,123,44,.5),0 0 100px rgba(255,123,44,.2);animation:gateLogoFloat 4s ease-in-out infinite,gateLogoPulse 3.5s ease-in-out infinite;transition:all 0.5s ease;display:block;position:relative;z-index:2;margin:5px auto 0}
.gate-logo-shimmer{position:absolute;inset:0;border-radius:50%;background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,.25) 50%,transparent 60%);background-size:200% 200%;animation:shimmerMove 3s ease-in-out infinite;pointer-events:none;z-index:3;mix-blend-mode:overlay}
.gate-content:hover .gate-logo,.gate-content:focus-visible .gate-logo{transform:scale(1.12) rotate(8deg);box-shadow:0 0 70px rgba(255,123,44,.8),0 0 140px rgba(255,123,44,.3)}
.gate-title{font-family:var(--font-display);font-size:clamp(1.8rem,8vw,3.2rem);font-weight:700;letter-spacing:0.3em;color:var(--text);margin-bottom:0.5rem;text-shadow:0 0 40px rgba(0,240,255,0.15);position:relative;display:inline-block}
.gate-title::before,.gate-title::after{content:'MAUREONIX';position:absolute;left:0;right:0;top:0;opacity:0.25}
.gate-title::before{color:#ff0055;transform:translateX(-3px);clip-path:inset(0 0 50% 0);animation:chromaticText 3s infinite}
.gate-title::after{color:#00ffff;transform:translateX(3px);clip-path:inset(50% 0 0 0);animation:chromaticText 3s infinite reverse}
.gate-sub{font-family:var(--font-mono);font-size:clamp(0.6rem,2.5vw,0.8rem);color:var(--cyan);letter-spacing:0.3em;opacity:0.85;animation:textFlicker 5s infinite;margin-bottom:1rem}
.boot-sequence{font-family:var(--font-mono);font-size:0.65rem;color:var(--text-dim);letter-spacing:0.05em;min-height:1.4rem;margin-bottom:1rem;opacity:0.8}
.boot-line{display:block}
.gate-line{width:min(280px,60vw);height:2px;background:linear-gradient(90deg,transparent,var(--cyan),var(--green),var(--fox),transparent);margin:1.5rem auto 0;opacity:0.8;animation:lineExpand 3.5s ease-in-out infinite;box-shadow:0 0 25px rgba(0,240,255,0.15);position:relative;overflow:hidden}
.gate-line::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent);animation:lineShine 2s infinite}
.sound-bars{display:flex;align-items:flex-end;justify-content:center;gap:3px;height:20px;margin-top:1.25rem;opacity:0.6}
.sbar{width:3px;background:var(--cyan);border-radius:2px;animation:soundBar 1s ease-in-out infinite}
.sbar:nth-child(1){height:6px;animation-duration:0.8s}.sbar:nth-child(2){height:12px;animation-duration:1.1s}.sbar:nth-child(3){height:8px;animation-duration:0.9s}.sbar:nth-child(4){height:16px;animation-duration:1.3s}.sbar:nth-child(5){height:10px;animation-duration:1s}
.gate-hint{margin-top:1.5rem;font-size:0.7rem;color:var(--text-dim);letter-spacing:0.25em;text-transform:uppercase;animation:fadePulse 2.5s ease-in-out infinite}
.gate-version{position:absolute;bottom:1.5rem;right:1.5rem;font-family:var(--font-mono);font-size:0.6rem;color:var(--text-dim);opacity:0.35;letter-spacing:0.1em}
nav{position:sticky;top:0;z-index:100;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);background:rgba(0,0,0,.55);border-bottom:1px solid var(--border)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;padding:0.75rem 0;gap:1rem}
.nav-logo{display:flex;align-items:center;gap:0.75rem;font-family:var(--font-display);font-weight:700;font-size:1.25rem;letter-spacing:-0.02em;text-decoration:none;color:var(--text)}
.nav-logo img{width:32px;height:32px;border-radius:10px;object-fit:cover;border:1px solid rgba(255,123,44,.3);box-shadow:0 0 15px rgba(255,123,44,.15)}
.nav-logo span{color:var(--cyan)}
.nav-right{display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;justify-content:flex-end}
.nav-status{display:flex;align-items:center;gap:0.5rem;font-family:var(--font-mono);font-size:0.68rem;padding:0.25rem 1rem;border-radius:999px;border:1px solid rgba(0,255,136,.15);background:rgba(0,255,136,.04);color:var(--green);letter-spacing:0.05em}
.pulse-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 12px var(--green);animation:pulseDot 2.2s infinite}
.theme-switcher{display:flex;gap:0.25rem;align-items:center;background:var(--panel);padding:0.25rem;border-radius:999px;border:1px solid var(--border);backdrop-filter:blur(10px)}
.theme-dot{width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:all 300ms;position:relative;flex-shrink:0}
.theme-dot:hover{transform:scale(1.3)}.theme-dot.active{border-color:var(--text);box-shadow:0 0 10px var(--cyan)}
.theme-dot::after{content:attr(data-label);position:absolute;top:-28px;left:50%;transform:translateX(-50%) scale(0);background:var(--panel-solid);color:var(--text);font-size:0.55rem;padding:0.15rem 0.4rem;border-radius:4px;border:1px solid var(--border);white-space:nowrap;opacity:0;transition:all 150ms;pointer-events:none;font-family:var(--font-mono)}
.theme-dot:hover::after,.theme-dot:focus-visible::after{opacity:1;transform:translateX(-50%) scale(1)}
.audio-toggle{width:36px;height:36px;border-radius:50%;border:1px solid var(--border);background:var(--panel);color:var(--text);display:grid;place-items:center;cursor:pointer;transition:all 300ms;font-size:0.85rem;flex-shrink:0}
.audio-toggle:hover{border-color:var(--cyan);box-shadow:0 0 15px rgba(0,240,255,0.15);transform:scale(1.1)}
.audio-toggle.muted{color:var(--danger);border-color:var(--danger)}
.hero{min-height:92vh;display:flex;align-items:center;position:relative;padding:3rem 0;content-visibility:auto;contain-intrinsic-size:0 500px}
.hero-grid{display:grid;grid-template-columns:1.1fr 0.9fr;gap:3rem;align-items:center;width:100%}
.hero-badge{display:inline-flex;align-items:center;gap:0.5rem;padding:0.25rem 1rem;border-radius:999px;border:1px solid var(--border-bright);background:rgba(0,240,255,0.15);color:var(--cyan);font-family:var(--font-mono);font-size:0.7rem;letter-spacing:0.06em;margin-bottom:2rem;width:fit-content;backdrop-filter:blur(10px)}
.hero h1{font-family:var(--font-display);font-size:clamp(2.4rem,5.5vw,4.6rem);font-weight:700;line-height:1.05;letter-spacing:-0.03em;margin-bottom:1.25rem}
.hero h1 .line{display:block}
.hero h1 .accent{background:linear-gradient(135deg,var(--cyan) 0%,var(--blue) 40%,var(--green) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 25px rgba(0,240,255,0.15))}
.hero-desc{color:var(--text-dim);font-size:clamp(0.95rem,1.2vw,1.05rem);max-width:460px;line-height:1.7;margin-bottom:2rem}
.hero-cta{display:flex;gap:1rem;flex-wrap:wrap}
.btn-primary{padding:0.75rem 2rem;border-radius:1rem;border:none;background:linear-gradient(135deg,var(--cyan),var(--blue));color:var(--void);font-family:var(--font-display);font-weight:700;font-size:0.9rem;cursor:pointer;position:relative;overflow:hidden;transition:all 300ms var(--ease-out-expo);box-shadow:0 0 25px rgba(0,240,255,0.15),0 4px 15px rgba(0,102,255,0.12);letter-spacing:0.02em;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;min-height:44px}
.btn-primary::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);transition:left 0.6s}
.btn-primary:hover{transform:translateY(-3px);box-shadow:0 10px 40px rgba(0,240,255,0.15),0 4px 20px rgba(0,102,255,0.12)}
.btn-primary:hover::before{left:100%}
.btn-ghost{padding:0.75rem 2rem;border-radius:1rem;border:1px solid var(--border-bright);background:transparent;color:var(--text);font-family:var(--font-display);font-weight:600;font-size:0.9rem;cursor:pointer;transition:all 300ms ease;backdrop-filter:blur(10px);text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;min-height:44px}
.btn-ghost:hover{background:rgba(0,240,255,0.15);border-color:var(--cyan);color:var(--cyan);box-shadow:0 0 20px rgba(0,240,255,0.15)}
.hero-visual{position:relative;height:560px;display:flex;align-items:center;justify-content:center;perspective:1200px}
.holo-prism{position:relative;width:100%;max-width:380px;transform-style:preserve-3d;animation:prismAutoRotate 12s ease-in-out infinite;transition:transform 0.1s}
.holo-prism img{width:100%;border-radius:1.5rem;border:1px solid var(--border-bright);box-shadow:0 25px 80px rgba(0,0,0,.6),0 0 0 1px var(--border);display:block;position:relative;z-index:2}
.holo-prism::before{content:'';position:absolute;inset:-20px;background:radial-gradient(circle at 50% 50%,var(--cyan),transparent 70%);opacity:0.2;filter:blur(40px);z-index:-1;animation:holoGlow 4s ease-in-out infinite}
.holo-prism::after{content:'';position:absolute;inset:0;border-radius:1.5rem;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,240,255,0.035) 2px,rgba(0,240,255,0.035) 4px);pointer-events:none;z-index:3}
.holo-reflection{position:absolute;bottom:-20%;left:5%;right:5%;height:20%;overflow:hidden;border-radius:1.5rem;z-index:1;opacity:0.2;filter:blur(8px);pointer-events:none}
.holo-reflection img{width:100%;transform:scaleY(-1);opacity:0.6}
.prism-corners{position:absolute;inset:-10px;z-index:4;pointer-events:none}
.prism-corners::before,.prism-corners::after{content:'';position:absolute;width:24px;height:24px;border:2px solid var(--cyan)}
.prism-corners::before{top:0;left:0;border-right:0;border-bottom:0;border-top-left-radius:10px}
.prism-corners::after{bottom:0;right:0;border-left:0;border-top:0;border-bottom-right-radius:10px}
.stats-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem;margin:2rem 0 6rem}
.stat-card{background:var(--panel);border:1px solid var(--border);border-radius:1rem;padding:1.25rem;position:relative;overflow:hidden;transition:all 300ms var(--ease-out-expo);backdrop-filter:blur(10px);contain:paint layout}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--cyan),var(--blue),var(--green));opacity:0.5}
.stat-card:hover{border-color:var(--border-bright);transform:translateY(-5px);box-shadow:0 25px 50px rgba(0,0,0,.4),0 0 0 1px rgba(0,240,255,0.15)}
.stat-value{font-family:var(--font-mono);font-size:clamp(1.4rem,2vw,1.8rem);font-weight:700;color:var(--cyan);margin-bottom:0.25rem;text-shadow:0 0 20px rgba(0,240,255,0.15)}
.stat-label{font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.12em}
.section-header{text-align:center;margin-bottom:2.5rem}
.section-tag{font-family:var(--font-mono);font-size:0.65rem;color:var(--cyan);letter-spacing:0.25em;text-transform:uppercase;margin-bottom:0.75rem;display:inline-block;padding:0.25rem 1rem;border:1px solid var(--border);border-radius:999px;background:rgba(0,240,255,0.15)}
.section-title{font-family:var(--font-display);font-size:clamp(1.7rem,4vw,2.8rem);font-weight:700;margin-bottom:0.75rem}
.section-desc{color:var(--text-dim);max-width:550px;margin:0 auto;font-size:0.95rem;line-height:1.7}
.features-section{margin:6rem 0;overflow:hidden}
.marquee-wrapper{position:relative;margin-bottom:1rem}
.marquee-wrapper::before,.marquee-wrapper::after{content:'';position:absolute;top:0;bottom:0;width:80px;z-index:10;pointer-events:none}
.marquee-wrapper::before{left:0;background:linear-gradient(90deg,var(--void),transparent)}
.marquee-wrapper::after{right:0;background:linear-gradient(-90deg,var(--void),transparent)}
.marquee-track{display:flex;gap:0.75rem;width:max-content;animation:marqueeLeft 35s linear infinite;touch-action:pan-y}
.marquee-wrapper:nth-child(2) .marquee-track{animation:marqueeRight 40s linear infinite}
.marquee-wrapper:hover .marquee-track{animation-play-state:paused}
.cat-card{width:200px;flex-shrink:0;background:var(--panel);border:1px solid var(--border);border-radius:1rem;padding:1.25rem;cursor:pointer;position:relative;overflow:hidden;transition:all 300ms var(--ease-out-expo);backdrop-filter:blur(10px);contain:paint layout}
.cat-card::after{content:'';position:absolute;inset:0;background:radial-gradient(500px circle at var(--mouse-x,50%) var(--mouse-y,50%),rgba(0,240,255,0.15),transparent 40%);opacity:0;transition:opacity 300ms;pointer-events:none}
.cat-card:hover::after{opacity:1}
.cat-card:hover{border-color:var(--border-bright);transform:translateY(-5px) scale(1.02);box-shadow:0 15px 40px rgba(0,0,0,.4),0 0 0 1px rgba(0,240,255,0.15)}
.cat-card.active{border-color:var(--cyan);box-shadow:0 0 25px rgba(0,240,255,0.15),inset 0 0 15px rgba(0,240,255,0.15)}
.cat-icon{font-size:1.7rem;margin-bottom:0.75rem;display:block;filter:drop-shadow(0 0 8px rgba(0,240,255,0.15))}
.cat-title{font-family:var(--font-display);font-size:0.92rem;font-weight:700;margin-bottom:0.25rem}
.cat-desc{font-size:0.73rem;color:var(--text-dim);line-height:1.5;margin-bottom:0.75rem}
.cat-meta{display:flex;align-items:center;gap:0.5rem}
.cat-count{font-family:var(--font-mono);font-size:0.6rem;padding:0.15rem 0.5rem;border-radius:999px;background:rgba(0,240,255,0.15);color:var(--cyan);border:1px solid var(--border-bright)}
.cat-arrow{margin-left:auto;font-size:0.9rem;color:var(--text-dim);transition:transform 300ms}
.cat-card:hover .cat-arrow{transform:translateX(4px);color:var(--cyan)}
.detail-panel{max-height:0;overflow:hidden;transition:max-height 0.7s var(--ease-out-expo),opacity 0.5s,margin 300ms;opacity:0;margin-top:0}
.detail-panel.open{max-height:2000px;opacity:1;margin-top:2.5rem}
.detail-inner{background:var(--panel);border:1px solid var(--border);border-radius:1.5rem;padding:2.5rem;position:relative;backdrop-filter:blur(20px)}
.detail-close{position:absolute;top:1rem;right:1rem;width:40px;height:40px;border-radius:50%;border:1px solid var(--border);background:transparent;color:var(--text-dim);cursor:pointer;display:grid;place-items:center;font-size:1.3rem;transition:all 300ms}
.detail-close:hover{border-color:var(--danger);color:var(--danger);transform:rotate(90deg)}
.detail-header{display:flex;align-items:center;gap:1rem;margin-bottom:2rem}
.detail-header h3{font-family:var(--font-display);font-size:1.6rem}
.detail-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:0.75rem}
.detail-item{padding:0.75rem 1rem;background:rgba(0,0,0,.25);border:1px solid var(--border);border-radius:1rem;font-size:0.85rem;color:var(--text-dim);transition:all 300ms;display:flex;align-items:center;gap:0.75rem}
.detail-item::before{content:'›';color:var(--cyan);font-weight:700;font-size:1.1rem}
.detail-item:hover{border-color:var(--border-bright);color:var(--text);background:rgba(0,240,255,0.15);transform:translateX(4px)}
.pair-section{margin:6rem 0;position:relative}
.pair-glow{position:absolute;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(0,240,255,0.15),transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:0}
.steps-matrix{position:relative;z-index:1;max-width:950px;margin:0 auto 2.5rem;padding:3px;border-radius:calc(1.5rem + 3px);background:linear-gradient(135deg,var(--cyan),var(--green),var(--fox),var(--blue),var(--cyan));background-size:400% 400%;animation:gradientMove 6s ease infinite;box-shadow:0 0 60px rgba(0,240,255,0.15)}
.steps-matrix-inner{background:rgba(2,4,10,.9);border-radius:1.5rem;padding:2rem;backdrop-filter:blur(40px);position:relative;overflow:hidden}
.pair-steps{display:flex;gap:1.25rem;position:relative;z-index:1}
.pair-steps::before{content:'';position:absolute;top:28px;left:15%;right:15%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),var(--green),transparent);opacity:0.3;z-index:0;animation:linePulse 3s ease-in-out infinite}
.step-holo{flex:1;position:relative;background:var(--panel);border-radius:1rem;padding:2rem 1.25rem;text-align:center;z-index:1;transition:all 300ms ease}
.step-holo::before{content:'';position:absolute;inset:-1.5px;border-radius:calc(1rem + 1.5px);background:linear-gradient(45deg,var(--cyan),var(--green),var(--fox),var(--blue),var(--cyan));background-size:300% 300%;animation:holoBorder 3s linear infinite;z-index:-1}
.step-holo::after{content:'';position:absolute;inset:0;border-radius:1rem;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,240,255,0.035) 2px,rgba(0,240,255,0.035) 4px);pointer-events:none;z-index:2}
.step-holo:hover{transform:translateY(-6px);box-shadow:0 20px 50px rgba(0,0,0,.5)}
.p-step-num{width:48px;height:48px;border-radius:50%;background:var(--panel-solid);border:2px solid var(--border-bright);display:grid;place-items:center;margin:0 auto 0.75rem;font-family:var(--font-mono);font-weight:700;font-size:0.95rem;color:var(--cyan);transition:all 300ms;box-shadow:0 0 20px rgba(0,240,255,0.15);position:relative}
.p-step-num::after{content:'';position:absolute;inset:-4px;border-radius:50%;border:1px solid var(--border-bright);animation:ringPulse 2s infinite}
.step-holo:hover .p-step-num{border-color:var(--cyan);box-shadow:0 0 30px rgba(0,240,255,0.15);transform:scale(1.1)}
.step-holo h4{font-size:0.95rem;margin-bottom:0.25rem;position:relative;z-index:3}
.step-holo p{font-size:0.78rem;color:var(--text-dim);position:relative;z-index:3}
.pair-card{position:relative;z-index:1;background:var(--panel);border:1px solid var(--border);border-radius:1.5rem;padding:2.5rem;max-width:650px;margin:0 auto;overflow:hidden;backdrop-filter:blur(20px)}
.pair-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--cyan),var(--green),var(--fox),var(--blue));background-size:300% 100%;animation:gradientMove 5s ease infinite}
.pair-form{display:flex;gap:0.75rem;background:rgba(0,0,0,.35);padding:0.25rem;border-radius:999px;border:1px solid var(--border);max-width:520px;margin:0 auto 1.25rem;position:relative;z-index:3;transition:all 300ms}
.pair-form:focus-within{border-color:var(--cyan);box-shadow:0 0 25px rgba(0,240,255,0.15)}
.pair-input-wrap{flex:1;display:flex;align-items:center;padding-left:1.25rem;gap:0.75rem;min-width:0}
.pair-input-wrap span{font-size:1.1rem;flex-shrink:0}
.pair-input-wrap input{flex:1;background:transparent;border:none;font-family:var(--font-mono);font-size:0.95rem;color:var(--text);outline:none;padding:0.75rem 0.5rem 0.75rem 0;min-width:0}
.pair-input-wrap input::placeholder{color:var(--text-dim);opacity:0.4}
.pair-btn{padding:0.75rem 2rem;border-radius:999px;border:none;background:linear-gradient(135deg,var(--cyan),var(--blue));color:var(--void);font-family:var(--font-display);font-weight:700;font-size:0.9rem;cursor:pointer;white-space:nowrap;transition:all 300ms;box-shadow:0 4px 15px rgba(0,240,255,0.15);position:relative;overflow:hidden;min-height:44px}
.pair-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,240,255,0.15)}
.pair-btn:disabled{opacity:0.5;cursor:not-allowed}
.result-box{max-width:520px;margin:0 auto;border-radius:1rem;padding:1.5rem;background:rgba(0,0,0,.3);border:1px solid var(--border);display:none;text-align:center;animation:fadeUp 0.5s var(--ease-out-expo);backdrop-filter:blur(10px);position:relative;z-index:3}
.result-box.show{display:block}
.result-box.error{border-color:rgba(255,42,109,.25);background:rgba(255,42,109,.04)}
.result-box.success{border-color:rgba(0,255,136,.25);background:rgba(0,255,136,.04)}
.code-display{font-family:var(--font-mono);font-size:clamp(1.8rem,5vw,2.6rem);font-weight:700;letter-spacing:0.2em;color:var(--cyan);text-shadow:0 0 25px rgba(0,240,255,0.15);padding:1.25rem;background:rgba(0,0,0,.35);border-radius:1rem;margin:1rem 0;border:1px solid var(--border);user-select:all;position:relative}
.copy-btn{position:absolute;top:0.5rem;right:0.5rem;background:var(--panel);border:1px solid var(--border);color:var(--text-dim);padding:0.25rem 0.75rem;border-radius:0.5rem;font-size:0.7rem;font-family:var(--font-mono);cursor:pointer;transition:all 150ms}
.copy-btn:hover{background:var(--cyan);color:var(--void);border-color:var(--cyan)}
.timer-visual{display:flex;align-items:center;justify-content:center;gap:1.25rem;margin-top:1.25rem}
.timer-ring{position:relative;width:64px;height:64px}
.timer-ring svg{transform:rotate(-90deg);width:100%;height:100%}
.timer-track{fill:none;stroke:var(--border);stroke-width:4}
.timer-progress{fill:none;stroke:var(--cyan);stroke-width:4;stroke-linecap:round;transition:stroke-dashoffset 1s linear}
.timer-text{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:var(--font-mono);font-size:1.1rem;font-weight:700;color:var(--cyan)}
.result-timer{font-family:var(--font-mono);font-size:0.75rem;color:var(--fox);margin-top:0.5rem}
.terminal-section{margin:6rem 0;max-width:800px;margin-left:auto;margin-right:auto;content-visibility:auto}
.terminal-window{background:var(--panel-solid);border:1px solid var(--border);border-radius:1rem;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5),inset 0 0 40px rgba(0,240,255,0.15);position:relative}
.terminal-window::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,240,255,0.035) 3px,rgba(0,240,255,0.035) 6px);pointer-events:none;z-index:2;opacity:0.6;border-radius:inherit}
.terminal-header{display:flex;align-items:center;gap:0.5rem;padding:0.75rem 1rem;background:rgba(0,0,0,.4);border-bottom:1px solid var(--border);position:relative;z-index:3}
.term-btn{width:11px;height:11px;border-radius:50%;flex-shrink:0}
.term-btn.r{background:var(--danger)}.term-btn.y{background:#e5c800}.term-btn.g{background:var(--green)}
.terminal-title{margin-left:0.5rem;font-family:var(--font-mono);font-size:0.65rem;color:var(--text-dim);letter-spacing:0.05em}
.terminal-body{padding:1.5rem;font-family:var(--font-mono);font-size:0.9rem;line-height:1.7;color:var(--text-dim);min-height:120px;position:relative;z-index:3}
.term-cursor{display:inline-block;width:8px;height:16px;background:var(--cyan);vertical-align:middle;margin-left:4px;animation:cursorBlink 1s step-end infinite;box-shadow:0 0 10px var(--cyan)}
.term-prompt{color:var(--cyan);margin-right:0.5rem}
.term-cmd{color:var(--text)}
.quote-display{padding:0.5rem 0}
.quote-line{margin-bottom:0.75rem;font-style:italic;color:var(--text)}
.quote-author{margin-top:0.75rem;font-size:0.8rem;color:var(--fox);opacity:0;transition:opacity 0.6s;min-height:1.2rem}
.quote-author.visible{opacity:1}
.toast-container{position:fixed;bottom:1.5rem;right:1.5rem;z-index:10002;display:flex;flex-direction:column;gap:0.75rem;pointer-events:none}
.toast{background:var(--panel-solid);border:1px solid var(--border-bright);color:var(--text);padding:0.75rem 1.25rem;border-radius:1rem;font-family:var(--font-mono);font-size:0.8rem;backdrop-filter:blur(20px);box-shadow:0 10px 30px rgba(0,0,0,.5);transform:translateX(120%);transition:transform 300ms var(--ease-out-expo);pointer-events:auto;display:flex;align-items:center;gap:0.75rem;max-width:320px}
.toast.show{transform:translateX(0)}
.toast.success{border-color:rgba(0,255,136,.3)}.toast.error{border-color:rgba(255,42,109,.3)}
.back-to-top{position:fixed;bottom:1.5rem;left:1.5rem;z-index:10002;width:44px;height:44px;border-radius:50%;border:1px solid var(--border);background:var(--panel);color:var(--text);display:grid;place-items:center;cursor:pointer;opacity:0;transform:translateY(20px);transition:all 300ms var(--ease-out-expo);backdrop-filter:blur(10px);box-shadow:0 4px 15px rgba(0,0,0,.3)}
.back-to-top.visible{opacity:1;transform:translateY(0)}
.back-to-top:hover{border-color:var(--cyan);box-shadow:0 0 20px rgba(0,240,255,0.15);transform:translateY(-2px)}
footer{border-top:1px solid var(--border);margin-top:6rem;padding:2.5rem 0;position:relative}
.footer-inner{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
.footer-brand{display:flex;align-items:center;gap:0.75rem;font-family:var(--font-display);font-weight:700;font-size:1rem;color:var(--text);text-decoration:none}
.footer-brand img{height:26px;width:26px;border-radius:8px;object-fit:cover}
.footer-copy{font-size:0.75rem;color:var(--text-dim)}
.footer-links{display:flex;gap:1.25rem;align-items:center;flex-wrap:wrap;justify-content:center}
.footer-links a{color:var(--text-dim);text-decoration:none;font-size:0.8rem;transition:all 300ms;position:relative}
.footer-links a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:1px;background:var(--cyan);transition:width 300ms}
.footer-links a:hover{color:var(--cyan)}.footer-links a:hover::after{width:100%}
.contact-emojis{display:flex;gap:0.5rem;align-items:center}
.contact-emoji-btn{cursor:pointer;font-size:1.1rem;padding:0.5rem;border-radius:50%;transition:all 300ms;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:1px solid var(--border);background:var(--panel);text-decoration:none;color:var(--text)}
.contact-emoji-btn:hover{background:rgba(0,240,255,0.15);border-color:var(--cyan);transform:scale(1.15) translateY(-2px);box-shadow:0 0 20px rgba(0,240,255,0.15)}
.reveal{opacity:0;transform:translateY(24px);transition:opacity 0.7s var(--ease-out-expo),transform 0.7s var(--ease-out-expo)}
.reveal.visible{opacity:1;transform:translateY(0)}
@keyframes scanFine{0%{transform:translateY(0)}100%{transform:translateY(4px)}}
@keyframes scanBar{0%{top:-12%}100%{top:112%}}
@keyframes meshMove{0%{transform:scale(1) translate(0,0)}50%{transform:scale(1.12) translate(-1%,1.5%)}100%{transform:scale(1) translate(0,0)}}
@keyframes gateGridMove{0%{transform:perspective(600px) rotateX(55deg) translateY(0)}100%{transform:perspective(600px) rotateX(55deg) translateY(35px)}}
@keyframes gateRingPulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.3}50%{transform:translate(-50%,-50%) scale(1.06);opacity:0.65}}
@keyframes gateLogoFloat{0%,100%{transform:translateY(0) rotateY(0deg)}25%{transform:translateY(-10px) rotateY(5deg)}50%{transform:translateY(0) rotateY(0deg)}75%{transform:translateY(-6px) rotateY(-5deg)}}
@keyframes gateLogoPulse{0%,100%{box-shadow:0 0 50px rgba(255,123,44,.4),0 0 100px rgba(255,123,44,.15)}50%{box-shadow:0 0 70px rgba(255,123,44,.7),0 0 140px rgba(255,123,44,.25)}}
@keyframes chromaticText{0%,100%{transform:translateX(-3px)}50%{transform:translateX(3px)}}
@keyframes chromaticShift{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}
@keyframes crtFlicker{0%,100%{opacity:1}50%{opacity:0.97}52%{opacity:0.82}54%{opacity:0.97}}
@keyframes gateParticles{0%{transform:translateY(0)}100%{transform:translateY(-25px)}}
@keyframes textFlicker{0%,100%{opacity:0.85}50%{opacity:1}52%{opacity:0.25}54%{opacity:1}}
@keyframes lineExpand{0%,100%{width:min(280px,60vw);opacity:0.7}50%{width:min(380px,70vw);opacity:1}}
@keyframes lineShine{0%{left:-100%}100%{left:100%}}
@keyframes fadePulse{0%,100%{opacity:0.3}50%{opacity:0.85}}
@keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.7)}}
@keyframes flashAnim{0%{opacity:0}15%{opacity:0.95}100%{opacity:0}}
@keyframes marqueeLeft{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes marqueeRight{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
@keyframes gradientMove{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes cursorBlink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes holoBorder{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes ringPulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.3);opacity:0}}
@keyframes linePulse{0%,100%{opacity:0.2}50%{opacity:0.5}}
@keyframes prismAutoRotate{0%,100%{transform:perspective(1000px) rotateY(-8deg) rotateX(2deg)}50%{transform:perspective(1000px) rotateY(8deg) rotateX(-2deg)}}
@keyframes holoGlow{0%,100%{opacity:0.15;transform:scale(1)}50%{opacity:0.3;transform:scale(1.05)}}
@keyframes hexRotate{0%{transform:translate(-50%,-50%) rotate(0deg)}100%{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes conicRotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes shimmerMove{0%{background-position:200% 200%}100%{background-position:-200% -200%}}
@keyframes soundBar{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.6)}}
@keyframes drawInfinity{to{stroke-dashoffset:0}}
@keyframes spin{to{transform:rotate(360deg)}}

/* ═══ NEURAL COMMAND CENTER v7.0 — Chat & Feedback ═══ */
.chat-toggle-btn{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--cyan),var(--blue));border:none;color:#000;font-size:1.6rem;cursor:pointer;z-index:10003;box-shadow:0 0 30px var(--glow),0 4px 20px rgba(0,0,0,0.4);transition:all 0.3s var(--ease-out-expo);display:grid;place-items:center;animation:floatLogo 6s ease-in-out infinite;transform:translateZ(0)}
.chat-toggle-btn:hover{transform:scale(1.15) rotate(10deg) translateZ(0);box-shadow:0 0 50px var(--glow)}
.chat-toggle-btn::before{content:'';position:absolute;inset:-4px;border-radius:50%;border:2px solid var(--cyan);opacity:0;transition:opacity 0.3s}
.chat-toggle-btn:hover::before{opacity:0.4;animation:ringPulse 2s infinite}
.chat-badge{position:absolute;top:-4px;right:-4px;background:var(--danger);color:#fff;font-size:0.65rem;font-weight:700;width:22px;height:22px;border-radius:50%;display:none;place-items:center;border:2px solid var(--void);font-family:var(--font-mono);box-shadow:0 0 10px var(--danger)}
.chat-panel{position:fixed;bottom:96px;right:24px;width:440px;max-width:calc(100vw - 48px);height:600px;max-height:calc(100vh - 130px);background:rgba(4,10,24,0.96);border:1px solid var(--border-bright);border-radius:20px;display:none;flex-direction:column;z-index:10003;box-shadow:0 30px 100px rgba(0,0,0,0.8),0 0 0 1px rgba(0,240,255,0.1),inset 0 0 60px rgba(0,240,255,0.02);overflow:hidden;animation:panelIn 0.5s var(--ease-out-expo);backdrop-filter:blur(40px);transform:translateZ(0);contain:paint layout}
@keyframes panelIn{from{opacity:0;transform:translateY(20px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
.chat-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),var(--green),transparent);z-index:10}
.chat-panel::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,240,255,0.015) 3px,rgba(0,240,255,0.015) 6px);pointer-events:none;z-index:0}
.chat-header{padding:1rem 1.25rem;background:rgba(0,0,0,0.4);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;position:relative;z-index:5}
.chat-header>span:first-child{display:flex;align-items:center;gap:0.75rem;font-family:var(--font-display);font-weight:700;color:var(--cyan);font-size:0.95rem}
.neural-status{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 10px var(--green);animation:pulseDot 2s infinite}
.chat-header button{width:32px;height:32px;border-radius:50%;border:1px solid var(--border);background:transparent;color:var(--text-dim);cursor:pointer;display:grid;place-items:center;font-size:1.2rem;transition:all 0.2s}
.chat-header button:hover{border-color:var(--danger);color:var(--danger);background:rgba(255,42,109,0.1)}
.chat-messages{flex:1;overflow-y:auto;padding:1.25rem;display:flex;flex-direction:column;gap:1rem;position:relative;z-index:3;scroll-behavior:smooth}
.chat-bubble{max-width:88%;padding:0.875rem 1.125rem;border-radius:14px;font-size:0.88rem;line-height:1.6;word-break:break-word;animation:msgIn 0.4s var(--ease-out-expo);position:relative}
@keyframes msgIn{from{opacity:0;transform:translateY(10px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.chat-bubble.user{align-self:flex-end;background:linear-gradient(135deg,var(--cyan),var(--blue));color:#000;border-bottom-right-radius:4px;font-weight:600;box-shadow:0 4px 20px rgba(0,240,255,0.15)}
.chat-bubble.assistant{align-self:flex-start;background:rgba(0,0,0,0.35);border:1px solid var(--border);color:var(--text);border-bottom-left-radius:4px}
.chat-bubble .ts{font-size:0.6rem;opacity:0.4;margin-top:6px;display:block;font-family:var(--font-mono)}
.chat-bubble pre{background:rgba(0,0,0,0.5);border:1px solid var(--border);border-radius:8px;padding:0.75rem;margin:0.5rem 0;overflow-x:auto;font-family:var(--font-mono);font-size:0.8rem;line-height:1.5;position:relative}
.chat-bubble pre code{color:var(--cyan)}
.chat-bubble code:not(pre code){background:rgba(0,240,255,0.08);color:var(--cyan);padding:0.15rem 0.4rem;border-radius:4px;font-family:var(--font-mono);font-size:0.82rem;border:1px solid rgba(0,240,255,0.1)}
.chat-bubble strong{color:var(--text);font-weight:600}
.chat-bubble a{color:var(--cyan);text-decoration:none;border-bottom:1px solid var(--border)}
.chat-bubble a:hover{border-color:var(--cyan)}
.copy-code-btn{position:absolute;top:6px;right:6px;background:var(--panel);border:1px solid var(--border);color:var(--text-dim);font-size:0.65rem;padding:2px 8px;border-radius:4px;cursor:pointer;font-family:var(--font-mono);transition:all 0.2s}
.copy-code-btn:hover{background:var(--cyan);color:#000;border-color:var(--cyan)}
.chat-typing{padding:0 1.25rem 0.75rem;font-size:0.78rem;color:var(--text-dim);font-family:var(--font-mono);display:none;align-items:center;gap:8px;position:relative;z-index:3}
.chat-typing span:first-child{font-style:italic;opacity:0.7}
.chat-typing .dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;animation:typingBounce 1.4s infinite ease-in-out both;box-shadow:0 0 8px var(--cyan)}
.chat-typing .dot:nth-child(2){animation-delay:-0.32s}.chat-typing .dot:nth-child(3){animation-delay:-0.16s}.chat-typing .dot:nth-child(4){animation-delay:0s}
@keyframes typingBounce{0%,80%,100%{transform:scale(0);opacity:0.3}40%{transform:scale(1);opacity:1}}
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
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(12px);z-index:10004;display:none;align-items:center;justify-content:center;padding:1rem;animation:fadeUp 0.3s ease}
.cyber-modal{background:var(--panel-solid);border:1px solid var(--border-bright);border-radius:1.5rem;padding:2rem;max-width:440px;width:100%;position:relative;box-shadow:0 30px 90px rgba(0,0,0,0.7);animation:fadeUp 0.4s var(--ease-out-expo)}
.cyber-modal h3{font-family:var(--font-display);font-size:1.3rem;color:var(--cyan);margin-bottom:1rem;text-align:center}
.star-rating{display:flex;gap:0.5rem;justify-content:center;margin:1rem 0 1.25rem;font-size:2.2rem;cursor:pointer;user-select:none}
.star-rating span{color:var(--border);transition:color 0.2s,transform 0.2s var(--ease-out-expo);line-height:1}
.star-rating span.active,.star-rating span:hover,.star-rating span.hovered{color:var(--warning);transform:scale(1.25);text-shadow:0 0 15px rgba(255,176,32,.4)}
.cyber-modal textarea,.cyber-modal input[type="text"]{width:100%;background:rgba(0,0,0,.35);border:1px solid var(--border);border-radius:1rem;padding:0.75rem;color:var(--text);font-family:var(--font-main);margin-bottom:0.75rem;outline:none;font-size:0.9rem;resize:vertical}
.cyber-modal textarea:focus,.cyber-modal input:focus{border-color:var(--cyan);box-shadow:0 0 12px var(--glow)}
.cyber-modal textarea{min-height:80px}
.cyber-modal .btn-row{display:flex;gap:0.75rem;margin-top:0.5rem}
.cyber-modal .btn-row button{flex:1;padding:0.75rem;border-radius:1rem;border:none;background:linear-gradient(135deg,var(--cyan),var(--blue));color:var(--void);font-weight:700;cursor:pointer;font-family:var(--font-display);transition:transform 0.2s,box-shadow 0.2s}
.cyber-modal .btn-row button:hover{transform:translateY(-2px);box-shadow:0 8px 25px var(--glow)}
.cyber-modal .btn-row .ghost-btn{background:transparent;border:1px solid var(--border);color:var(--text-dim)}
.cyber-modal .btn-row .ghost-btn:hover{border-color:var(--danger);color:var(--danger);box-shadow:none}
/* Rating Popup Styles */
.rating-popup-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(16px);z-index:10005;display:none;align-items:center;justify-content:center;padding:1rem;opacity:0;transition:opacity 0.4s ease}
.rating-popup-overlay.active{display:flex;opacity:1}
.rating-popup{background:var(--panel-solid);border:1px solid var(--border-bright);border-radius:1.5rem;padding:2.5rem;max-width:420px;width:100%;text-align:center;box-shadow:0 30px 90px rgba(0,0,0,0.8);animation:fadeUp 0.5s var(--ease-out-expo)}
.rating-popup .popup-icon{font-size:3rem;margin-bottom:1rem}
.rating-popup h3{font-family:var(--font-display);font-size:1.4rem;color:var(--cyan);margin-bottom:0.5rem}
.rating-popup p{color:var(--text-dim);font-size:0.9rem;margin-bottom:1.5rem;line-height:1.6}
.rating-popup .thank-you{display:none}
.rating-popup .thank-you.visible{display:block;animation:fadeUp 0.5s var(--ease-out-expo)}
.rating-popup .suggestion-box{width:100%;background:rgba(0,0,0,.35);border:1px solid var(--border);border-radius:1rem;padding:0.75rem;color:var(--text);font-family:var(--font-main);margin:1rem 0;outline:none;font-size:0.9rem;resize:vertical;min-height:60px}
.rating-popup .suggestion-box:focus{border-color:var(--cyan);box-shadow:0 0 12px var(--glow)}
@media(max-width:768px){.hero-grid{grid-template-columns:1fr;gap:2rem}.hero-visual{height:420px;order:-1}.holo-prism{max-width:300px}.stats-bar{grid-template-columns:repeat(2,1fr)}.pair-steps{flex-direction:column}.steps-matrix{margin:0 0.5rem 2rem}.detail-grid{grid-template-columns:1fr}.footer-inner{flex-direction:column;text-align:center}}
@media(max-width:480px){.chat-panel{right:12px;bottom:80px;width:calc(100vw - 24px);height:60vh;border-radius:16px}.chat-toggle-btn{width:52px;height:52px;font-size:1.3rem;bottom:16px;right:16px}.cyber-modal{padding:1.25rem}}
</style>
</head>
<body>
<div class="scroll-progress" id="scrollProgress" role="progressbar" aria-label="Page scroll progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
<a href="#mainContent" class="skip-link">Skip to main content</a>
<div class="border-scan top" aria-hidden="true"></div><div class="border-scan bottom" aria-hidden="true"></div><div class="border-scan left" aria-hidden="true"></div><div class="border-scan right" aria-hidden="true"></div>
<div class="spotlight" id="spotlight" aria-hidden="true"></div>
<div class="scan-system" aria-hidden="true"><div class="scan-fine"></div><div class="scan-rgb"></div><div class="scan-bar"></div><div class="scan-bar"></div><div class="scan-bar"></div><div class="scan-vignette"></div></div>
<div class="bg-mesh" aria-hidden="true"></div><div class="bg-grid" aria-hidden="true"></div><canvas id="particleCanvas" aria-hidden="true"></canvas>
<div id="flash" aria-hidden="true"></div>
<div id="infinityOverlay" aria-hidden="true">
  <svg class="infinity-svg" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs><linearGradient id="infGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:var(--cyan)"/><stop offset="50%" style="stop-color:var(--green)"/><stop offset="100%" style="stop-color:var(--fox)"/></linearGradient></defs>
    <path id="infinityPath" class="infinity-path" d="M75,75 C75,30 135,30 150,75 C165,120 225,120 225,75 C225,30 165,30 150,75 C135,120 75,120 75,75"/>
  </svg>
</div>
<div id="gate" role="dialog" aria-modal="true" aria-label="System initialization gate">
  <canvas id="gateCanvas" aria-hidden="true"></canvas>
  <div class="gate-grid" aria-hidden="true"></div><div class="gate-particles" aria-hidden="true"></div>
  <div class="gate-crt" aria-hidden="true"></div><div class="gate-chromatic" aria-hidden="true"></div>
  <div class="gate-rings" aria-hidden="true"><div class="gate-ring"></div><div class="gate-ring"></div><div class="gate-ring"></div><div class="gate-ring"></div><div class="gate-ring"></div></div>
  <svg class="gate-hex" viewBox="0 0 100 100" fill="none" stroke="var(--cyan)" stroke-width="0.3" aria-hidden="true"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"/><polygon points="50,20 80,35 80,65 50,80 20,65 20,35"/></svg>
  <div class="gate-content" id="gateContent" tabindex="0" role="button" aria-label="Initialize Maureonix Neural Interface">
    <div class="gate-logo-wrap"><img src="https://i.ibb.co/fVD4078t/maureonix-logo.png" alt="" class="gate-logo" id="gateLogo" loading="eager"/><div class="gate-logo-shimmer" aria-hidden="true"></div></div>
    <div class="gate-title" aria-label="Maureonix">MAUREONIX</div>
    <div class="gate-sub">NEURAL INTERFACE v${pkg.version}</div>
    <div class="boot-sequence" id="bootSequence" aria-live="polite" aria-atomic="true"></div>
    <div class="gate-line" aria-hidden="true"></div>
    <div class="sound-bars" aria-hidden="true"><div class="sbar"></div><div class="sbar"></div><div class="sbar"></div><div class="sbar"></div><div class="sbar"></div></div>
    <div class="gate-hint" id="gateHint" style="opacity:0">Click or press Enter to Initialize System</div>
  </div>
  <div class="gate-version" aria-hidden="true">INF.VYBE.v${pkg.version}</div>
</div>
<div class="app" id="app">
  <nav aria-label="Main navigation"><div class="container nav-inner">
    <a href="#" class="nav-logo" aria-label="Maureonix Home"><img src="https://i.ibb.co/fVD4078t/maureonix-logo.png" alt="" id="navLogo" loading="lazy"/><span>Maureonix</span><span style="color:var(--cyan)">.</span></a>
    <div class="nav-right">
      <div class="theme-switcher" id="themeSwitcher" role="radiogroup" aria-label="Select theme">
        <div class="theme-dot active" data-theme="neural" data-label="Neural" style="background:linear-gradient(135deg,#00f0ff,#ff7b2c)" role="radio" aria-checked="true" tabindex="0" aria-label="Neural theme"></div>
        <div class="theme-dot" data-theme="solar" data-label="Solar" style="background:linear-gradient(135deg,#ffb020,#ff4400)" role="radio" aria-checked="false" tabindex="-1" aria-label="Solar theme"></div>
        <div class="theme-dot" data-theme="matrix" data-label="Matrix" style="background:linear-gradient(135deg,#00ff50,#000)" role="radio" aria-checked="false" tabindex="-1" aria-label="Matrix theme"></div>
        <div class="theme-dot" data-theme="abyss" data-label="Abyss" style="background:linear-gradient(135deg,#e000ff,#7700ff)" role="radio" aria-checked="false" tabindex="-1" aria-label="Abyss theme"></div>
        <div class="theme-dot" data-theme="ghost" data-label="Ghost" style="background:linear-gradient(135deg,#b4c0d4,#fff)" role="radio" aria-checked="false" tabindex="-1" aria-label="Ghost theme"></div>
        <div class="theme-dot" data-theme="inferno" data-label="Inferno" style="background:linear-gradient(135deg,#ff4444,#ffaa00)" role="radio" aria-checked="false" tabindex="-1" aria-label="Inferno theme"></div>
      </div>
      <button class="audio-toggle" id="audioToggle" title="Toggle ambient sound" aria-label="Toggle ambient sound" aria-pressed="false">🔇</button>
      <button class="audio-toggle" id="feedbackToggle" title="Leave feedback" aria-label="Leave feedback">⭐</button>
      <div class="nav-status" aria-label="System status"><span class="pulse-dot" aria-hidden="true"></span><span id="navUptime">SYSTEM ONLINE</span></div>
    </div>
  </div></nav>
  <main id="mainContent">
    <section class="hero" aria-label="Hero"><div class="container hero-grid">
      <div class="hero-left reveal">
        <div class="hero-badge"><span aria-hidden="true">◈</span> 700+ Commands · 50+ Automations · 20+ Platforms</div>
        <h1><span class="line">The <span class="accent">Future</span></span><span class="line">of WhatsApp</span><span class="line">Automation.</span></h1>
        <p class="hero-desc">A neural-grade bot ecosystem engineered for precision. Multi-AI intelligence, autonomous workflows, and infinite extensibility in a single interface.</p>
        <div class="hero-cta"><a href="#pairing" class="btn-primary" id="btnInitConnect">Initialize Connection</a><a href="#features" class="btn-ghost" id="btnExplore">Explore Systems</a></div>
      </div>
      <div class="hero-visual reveal">
        <div class="holo-prism" id="holoPrism">
          <div class="holo-reflection" aria-hidden="true"><img src="https://i.ibb.co/vCSV0NcX/image.png" alt="" loading="lazy"/></div>
          <img src="https://i.ibb.co/vCSV0NcX/image.png" alt="Maureonix Command Center" id="posterImg" loading="eager"/>
          <div class="prism-corners" aria-hidden="true"></div>
        </div>
      </div>
    </div></section>
    <section class="container" aria-label="Statistics"><div class="stats-bar">
      <div class="stat-card reveal"><div class="stat-value" id="uptimeVal" data-target="0">—</div><div class="stat-label">Uptime</div></div>
      <div class="stat-card reveal"><div class="stat-value" data-target="700">0</div><div class="stat-label">Commands</div></div>
      <div class="stat-card reveal"><div class="stat-value" data-target="50">0</div><div class="stat-label">Auto Toggles</div></div>
      <div class="stat-card reveal"><div class="stat-value" data-target="20">0</div><div class="stat-label">Platforms</div></div>
    </div></section>
    <section class="features-section" id="features" aria-label="Feature Matrix"><div class="container">
      <div class="section-header reveal"><div class="section-tag">System Modules</div><h2 class="section-title">Feature <span style="color:var(--cyan)">Matrix</span></h2><p class="section-desc">Every capability engineered for dominance. Click any module to decrypt its full specification.</p></div>
    </div>
    <div class="marquee-wrapper"><div class="marquee-track" id="track1"></div></div>
    <div class="marquee-wrapper"><div class="marquee-track" id="track2"></div></div>
    <div class="container"><div class="detail-panel" id="detailPanel"><div class="detail-inner">
      <button class="detail-close" id="detailClose" aria-label="Close detail panel">×</button>
      <div class="detail-header"><span id="detailIcon" style="font-size:2.2rem" aria-hidden="true"></span><div><h3 id="detailTitle"></h3><p id="detailDesc" style="color:var(--text-dim);font-size:0.85rem"></p></div></div>
      <div class="detail-grid" id="detailGrid"></div>
    </div></div></div>
    </section>
    <section class="pair-section" id="pairing" aria-label="Neural Link">
      <div class="pair-glow" aria-hidden="true"></div>
      <div class="container">
        <div class="section-header reveal"><div class="section-tag">Neural Link</div><h2 class="section-title">Establish <span style="color:var(--green)">Connection</span></h2><p class="section-desc">Synchronize your WhatsApp instance with the Maureonix neural network.</p></div>
        <div class="steps-matrix reveal"><div class="steps-matrix-inner"><div class="pair-steps">
          <div class="step-holo"><div class="step-content"><div class="p-step-num">1</div><h4>Linked Devices</h4><p>WhatsApp → Settings → Linked Devices</p></div></div>
          <div class="step-holo"><div class="step-content"><div class="p-step-num">2</div><h4>Link Phone</h4><p>Tap "Link a Device" → Link with phone number</p></div></div>
          <div class="step-holo"><div class="step-content"><div class="p-step-num">3</div><h4>Enter Code</h4><p>Input the 8-digit pairing code below</p></div></div>
        </div></div></div>
        <div class="pair-card reveal">
          <div class="pair-scan" aria-hidden="true"></div>
          <div class="pair-form"><div class="pair-input-wrap"><span aria-hidden="true">📞</span><input type="tel" id="phoneInput" placeholder="254XXXXXXXX" maxlength="15" autocomplete="off" inputmode="tel" aria-label="Phone number with country code"/></div><button class="pair-btn" id="pairBtn">Get Pair Code</button></div>
          <div class="result-box" id="resultBox" role="status" aria-live="polite" aria-atomic="true"></div>
        </div>
      </div>
    </section>
    <section class="terminal-section reveal" aria-label="Neural Terminal"><div class="container"><div class="terminal-window">
      <div class="terminal-header"><div class="term-btn r" aria-hidden="true"></div><div class="term-btn y" aria-hidden="true"></div><div class="term-btn g" aria-hidden="true"></div><div class="terminal-title">maureonix@neural-core:~</div></div>
      <div class="terminal-body"><div class="quote-display"><div class="quote-line"><span class="term-prompt">maureonix@neural-core:~$</span><span class="term-cmd">decrypt --source=human-wisdom --format=cinematic</span></div><div class="quote-line" style="margin-top:0.8rem"><span class="term-cmd" style="font-style:italic" id="typewriter"></span><span class="term-cursor" aria-hidden="true"></span></div><div class="quote-author" id="quoteAuthor"></div></div></div>
    </div></div></section>
  </main>
  <footer><div class="container footer-inner">
    <a href="#" class="footer-brand" aria-label="Maureonix"><img src="https://i.ibb.co/fVD4078t/maureonix-logo.png" alt="" id="footerLogo" loading="lazy"/><span>${pkg.name} <span style="color:var(--cyan)">${pkg.version}</span></span></a>
    <div class="footer-links"><a href="#features">Modules</a><a href="#pairing">Connect</a><a href="https://whatsapp.com/channel/0029Vb7IABxCXC3J7ZFFsk2h" target="_blank" rel="noopener noreferrer">Updates</a><span style="color:var(--border);font-size:0.9rem" aria-hidden="true">|</span><div class="contact-emojis"><a href="tel:+254116903500" class="contact-emoji-btn" aria-label="Call support">🤙</a><a href="mailto:iris.with.vybeflix@gmail.com" class="contact-emoji-btn" aria-label="Email support">✉️</a><a href="https://wa.me/254116903500" target="_blank" rel="noopener noreferrer" class="contact-emoji-btn" aria-label="WhatsApp support">📱</a><a href="https://whatsapp.com/channel/0029Vb7IABxCXC3J7ZFFsk2h" target="_blank" rel="noopener noreferrer" class="contact-emoji-btn" aria-label="Channel updates">📢</a></div></div>
    <div class="footer-copy">Built with precision by Infinite Vybeflix</div>
  </div></footer>
</div>
<div class="toast-container" id="toastContainer" aria-live="polite" aria-atomic="true"></div>
<button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>

<div class="modal-overlay" id="feedbackModal" role="dialog" aria-modal="true" aria-label="Feedback form"><div class="cyber-modal">
  <h3>Rate Maureonix</h3>
  <div class="star-rating" id="starRating" role="radiogroup" aria-label="Star rating">
    <span data-value="1" role="radio" aria-checked="false" tabindex="0">★</span><span data-value="2" role="radio" aria-checked="false" tabindex="0">★</span><span data-value="3" role="radio" aria-checked="false" tabindex="0">★</span><span data-value="4" role="radio" aria-checked="false" tabindex="0">★</span><span data-value="5" role="radio" aria-checked="false" tabindex="0">★</span>
  </div>
  <textarea id="feedbackComment" placeholder="Tell us what you think... (optional)" aria-label="Feedback comment"></textarea>
  <input type="text" id="feedbackContact" placeholder="Contact info (optional)" aria-label="Contact information"/>
  <div class="btn-row"><button id="submitFeedback">Transmit Feedback</button><button class="ghost-btn" id="closeFeedback">Cancel</button></div>
</div></div>

<button class="chat-toggle-btn" id="chatToggle" aria-label="Open Neural Assistant" aria-expanded="false">🦊</button>
<div class="chat-panel" id="chatPanel" role="dialog" aria-label="Neural Assistant" aria-hidden="true">
  <div class="chat-header"><span><span class="neural-status"></span> MAUREONIX AI</span><button onclick="toggleChat()" aria-label="Close chat">×</button></div>
  <div class="chat-messages" id="chatMessages" aria-live="polite" aria-atomic="false"></div>
  <div class="chat-typing" id="chatTyping" aria-hidden="true"><span>Neural pathways connecting</span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
  <div class="neural-chips" id="floatChips"><div class="chips-track">
    <span class="neural-chip" onclick="sendQuick('How do I pair my WhatsApp?')">🔗 Pair Device</span>
    <span class="neural-chip" onclick="sendQuick('List all AI commands')">🤖 AI Commands</span>
    <span class="neural-chip" onclick="sendQuick('What is Maureonix?')">❓ About</span>
    <span class="neural-chip" onclick="sendQuick('Show bot status')">📊 Status</span>
    <span class="neural-chip" onclick="sendQuick('Scroll to features')">✨ Features</span>
    <span class="neural-chip" onclick="sendQuick('Scroll to pairing')">🔗 Pairing</span>
    <span class="neural-chip" onclick="sendQuick('How do I pair my WhatsApp?')">🔗 Pair Device</span>
    <span class="neural-chip" onclick="sendQuick('List all AI commands')">🤖 AI Commands</span>
  </div></div>
  <div class="chat-input-area"><div class="neural-textarea-wrap"><textarea id="chatInput" placeholder="Ask Maureonix anything..." aria-label="Message input" oninput="autoResize(this);checkChips()" onkeydown="handleChatKey(event)"></textarea></div><button id="chatSend" onclick="sendChatMessage()" aria-label="Send message">➤</button></div>
</div>

<!-- ═══ Post-Visit Rating Popup ═══ -->
<div class="rating-popup-overlay" id="ratingPopupOverlay">
  <div class="rating-popup" id="ratingPopup">
    <div class="popup-icon">⭐</div>
    <h3>How was your experience?</h3>
    <p>Your feedback helps us evolve the neural network.</p>
    <div class="star-rating" id="popupStarRating" role="radiogroup" aria-label="Rate your experience">
      <span data-value="1" role="radio" aria-checked="false" tabindex="0">★</span>
      <span data-value="2" role="radio" aria-checked="false" tabindex="0">★</span>
      <span data-value="3" role="radio" aria-checked="false" tabindex="0">★</span>
      <span data-value="4" role="radio" aria-checked="false" tabindex="0">★</span>
      <span data-value="5" role="radio" aria-checked="false" tabindex="0">★</span>
    </div>
    <textarea class="suggestion-box" id="popupSuggestion" placeholder="Any suggestions? (optional)"></textarea>
    <div class="btn-row" id="popupBtnRow">
      <button onclick="submitRating()">Submit Rating</button>
      <button class="ghost-btn" onclick="dismissRating()">Maybe Later</button>
    </div>
    <div class="thank-you" id="ratingThankYou">
      <div class="popup-icon">🙏</div>
      <h3>Thank you!</h3>
      <p>Your feedback has been transmitted to the neural core.</p>
      <p style="color:var(--text-dim);font-size:0.8rem;margin-top:0.5rem">Welcome back to MAUREONIX anytime.</p>
    </div>
  </div>
</div>

<script>
(function(){
'use strict';
const $=(sel,ctx=document)=>ctx.querySelector(sel);
const $$=(sel,ctx=document)=>Array.from(ctx.querySelectorAll(sel));
const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice=window.matchMedia('(hover: none)').matches;
function safeImage(id,onError){const el=document.getElementById(id);if(!el)return;el.addEventListener('error',function handler(){el.style.display='none';if(onError)onError(el);el.removeEventListener('error',handler);});}
safeImage('gateLogo');safeImage('navLogo',el=>{const s=el.nextElementSibling;if(s&&s.tagName==='SPAN')s.textContent='🦊 '+s.textContent;});safeImage('posterImg');safeImage('footerLogo');
const categories=[{id:'core',icon:'🤖',title:'Core Bot',count:'15+',desc:'Multi-device connectivity & intelligent session management',features:['Multi-Device WhatsApp via @whiskeysockets/baileys','Pairing Code / QR Login','Interactive Carousel Menu','Fallback Image & Text Menus','Customizable Prefix (., !, #)','Public / Private Mode','Self-Mode Detection','Runtime & Uptime Tracking','Profile & Stats System','Message Counting & Leaderboard','Bot Info Command','Interactive Quick Replies']},{id:'auto',icon:'⚡',title:'Automation',count:'50+',desc:'Owner-controlled neural toggles with persistent database storage',features:['Auto-View Status','Auto-Like Status','Auto-React Mention','Auto-Reply Mention','Auto-Read Messages','Auto-Typing Indicator','Auto-Recording Indicator','Auto-Bio Update (10min)','Auto-Backup Daily','Auto-Join Groups','Auto-Download Status','Auto-Forward Messages','Auto-Sticker Conversion','Auto-Translate','Auto-Delete Messages','Auto-React Emoji','Auto-Block Keywords','Auto-Kick Keywords','Auto-Mute Keywords','Auto-Welcome','Auto-Goodbye']},{id:'group',icon:'👥',title:'Group Control',count:'25+',desc:'Military-precision group administration and moderation',features:['Add / Kick / Promote / Demote','Warning System (4-Strike Auto-Kick)','Group Open/Close','Disappearing Messages','Anti-Link / Anti-Virtex','Anti-Delete / Anti-Toxic','Anti-HideTag / Anti-TagSw','Tagall / Hidetag / Totag','Set Name / Description / PPGC','Link Group / Revoke','Pin / Unpin Messages','List Online Members','Join Requests Accept/Reject']},{id:'ai',icon:'🧠',title:'AI Engine',count:'20+',desc:'Multi-model artificial intelligence with contextual memory',features:['GPT-4 Integration','Google Gemini','Llama 3 via Groq','DeepSeek AI','AI Image Generation (Pollinations)','Auto Language Detection','Translation (Sinhala Support)','Text-to-Speech (Google TTS)','Text Summarization','Code Generation','AI Roast Engine','AI Rizz Generator','Brainrot Mode (Gen Z)','Contextual Memory (20 msg)','Memory Clear Command']},{id:'dl',icon:'📥',title:'Downloaders',count:'20+',desc:'Multi-API fallback chains across every major platform',features:['YouTube MP3/MP4','TikTok (HD Watermark-Free)','Instagram Posts/Reels/Stories','Facebook Videos','Twitter/X Media','Spotify Audio','Pinterest','Reddit','SoundCloud','Threads','CapCut Templates','Likee','Snapchat','Vimeo','Dailymotion','MediaFire','Google Drive','APK Downloader']},{id:'search',icon:'🔍',title:'Intelligence',count:'15+',desc:'Global data retrieval and real-time information systems',features:['Google Search','Wikipedia','GitHub Lookup','NPM Registry','Urban Dictionary','Weather (Open-Meteo)','RSS News Feed','COVID-19 Statistics','Crypto (CoinGecko)','Forex Rates','IP Lookup / Geolocation','WHOIS / DNS Lookup','QR Code Generator','URL Shortener']},{id:'media',icon:'🎨',title:'Media Lab',count:'12+',desc:'Advanced media manipulation and creative tools',features:['Sticker Maker (WebP)','Sticker to Image','Animated Text Sticker (ATTP)','Background Removal','Image Blur','Quote Canvas','Brat Style Generator','Sticker Meme Overlay','View-Once Revealer','Metallic / Neon / Glitch Text','Fire / Ice Effects','Meme Overlays (20+)']},{id:'fun',icon:'😂',title:'Entertainment',count:'30+',desc:'Neural recreation and social interaction modules',features:['Jokes / Memes / Facts','Magic 8-Ball','Roast / Compliment','Ship Calculator','Would You Rather','Truth or Dare','Yes/No Divination','Dice Roll / Coin Flip','Anime Reaction GIFs','Neko / Waifu Generator','Hug / Kiss / Pat / Cry / Slap','Text Effects (20+ Styles)','Meme Generators (Oogway, Tweet, YT Comment)']},{id:'games',icon:'🎮',title:'Game Core',count:'25+',desc:'Multiplayer arenas, casino systems, and RPG adventures',features:['Connect Four','Suit / Chess','Slot Machine','Roulette','Crash Game','Dice / Coinflip / RPS','Blackjack','Tic-Tac-Toe','Snakes & Ladders','RPG Fight / Heal / Spawn','Trivia Engine','Math Puzzles','Anagram Solver','Guess Number','Pokemon Guessing','Song Quiz','Family 100','Cak Lontong','RAWG Game Database']},{id:'cinema',icon:'🎬',title:'Cinema & Anime',count:'10+',desc:'Complete entertainment database access',features:['Movie Search (IMDb)','Movie Ratings','Movie Quotes','TV Series Info','Episode Guides','TV Schedule','Anime Search (AniList/Jikan)','Manga Lookup','Trending Anime','Top Anime Charts']},{id:'sports',icon:'⚽',title:'SportsNet',count:'8+',desc:'Real-time athletic data and predictive analytics',features:['Football Leagues','Live Fixtures','Match Standings','Team Profiles','Player Stats','Head-to-Head','Match Predictions','Betting Odds','ESPN News Feed']},{id:'eco',icon:'💰',title:'Economy',count:'8+',desc:'Persistent virtual economy with banking and trade',features:['Daily Income','Work Commands','Rob System','Bank Balance','Deposit / Withdraw','Transfer Funds','Item Shop','Inventory System','Leaderboard']},{id:'prod',icon:'📅',title:'Productivity',count:'12+',desc:'Personal organization and life management tools',features:['Persistent Reminders','Notes System','To-Do Lists','Habit Tracker','Mood Logging','Mood Graphs','Water Intake','Expense Tracker','Grocery Lists','Timer / Alarm','Sleep Cycle Calculator']},{id:'health',icon:'💪',title:'Health & Fit',count:'10+',desc:'Biometric calculators and wellness planning',features:['BMI Calculator','BMR Calculator','TDEE Calculator','Macro Calculator','Water Calculator','Sleep Cycle','Heart Rate Zones','One-Rep Max','Body Fat %','Workout Plans','Yoga Guides']},{id:'dev',icon:'💻',title:'DevTools',count:'10+',desc:'Essential utilities for software engineers',features:['UUID Generator','Password Generator','JSON Formatter','Regex Tester','Base64 Encode/Decode','Lorem Ipsum','Color Palette','Checksum Calculator']},{id:'owner',icon:'👑',title:'Owner CMD',count:'20+',desc:'God-tier control panel for system administrators',features:['Block / Unblock Users','Ban / Unban System','Premium Management','Join / Leave Groups','Clear Chat','Backup Database','Shutdown Bot','Set Profile Picture','Delete Profile Picture','Session Management','Case System','Set Bot Name','Set Pack/Author','Rental Group Manager','Status Upload','JadiBot Control']}];
function renderMarquee(){const t1=$('#track1'),t2=$('#track2');if(!t1||!t2)return;const half=Math.ceil(categories.length/2);const row1=categories.slice(0,half),row2=categories.slice(half);const cardsHTML=(list)=>list.map(c=>'<div class="cat-card" data-id="'+c.id+'" role="button" tabindex="0" aria-label="'+c.title+' module, '+c.count+' commands"><span class="cat-icon" aria-hidden="true">'+c.icon+'</span><div class="cat-title">'+c.title+'</div><div class="cat-desc">'+c.desc+'</div><div class="cat-meta"><span class="cat-count">'+c.count+' cmds</span><span class="cat-arrow" aria-hidden="true">→</span></div></div>').join('');t1.innerHTML=cardsHTML(row1)+cardsHTML(row1);t2.innerHTML=cardsHTML(row2)+cardsHTML(row2);}
renderMarquee();
function openDetail(id){const cat=categories.find(c=>c.id===id);if(!cat)return;$$('.cat-card').forEach(c=>c.classList.remove('active'));$$('.cat-card[data-id="'+id+'"]').forEach(c=>c.classList.add('active'));$('#detailIcon').textContent=cat.icon;$('#detailTitle').textContent=cat.title;$('#detailDesc').textContent=cat.desc;$('#detailGrid').innerHTML=cat.features.map(f=>'<div class="detail-item">'+f+'</div>').join('');const panel=$('#detailPanel');panel.classList.add('open');setTimeout(()=>panel.scrollIntoView({behavior:prefersReducedMotion?'auto':'smooth',block:'nearest'}),120);}
function closeDetail(){$('#detailPanel').classList.remove('open');$$('.cat-card').forEach(c=>c.classList.remove('active'));}
function setTheme(theme){document.documentElement.setAttribute('data-theme',theme);$$('.theme-dot').forEach(d=>{const active=d.dataset.theme===theme;d.classList.toggle('active',active);d.setAttribute('aria-checked',active);d.setAttribute('tabindex',active?'0':'-1');});try{localStorage.setItem('maureonix-theme',theme);}catch(e){}}
$$('.theme-dot').forEach(dot=>{dot.addEventListener('click',()=>setTheme(dot.dataset.theme));dot.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setTheme(dot.dataset.theme);}});});
try{const saved=localStorage.getItem('maureonix-theme');if(saved)setTheme(saved);}catch(e){}
let musicCtx,musicGain,musicInterval,isMusicPlaying=false,musicStarted=false;
function initMusic(){
  if(musicCtx){if(musicCtx.state==='suspended')musicCtx.resume();return;}
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    musicCtx=new AC();
    musicGain=musicCtx.createGain();musicGain.gain.value=0.12;
    const convolver=musicCtx.createConvolver();
    const rate=musicCtx.sampleRate;const length=rate*1.5;
    const impulse=musicCtx.createBuffer(2,length,rate);
    for(let c=0;c<2;c++){const ch=impulse.getChannelData(c);for(let i=0;i<length;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/length,2);}
    convolver.buffer=impulse;
    const revGain=musicCtx.createGain();revGain.gain.value=0.35;
    musicGain.connect(convolver);convolver.connect(revGain);revGain.connect(musicCtx.destination);
    const delay=musicCtx.createDelay();delay.delayTime.value=0.375;
    const dGain=musicCtx.createGain();dGain.gain.value=0.25;
    musicGain.connect(delay);delay.connect(dGain);dGain.connect(delay);dGain.connect(musicCtx.destination);
    musicGain.connect(musicCtx.destination);
    const scale=[130.81,155.56,174.61,196.00,233.08,261.63,311.13,349.23];
    const bassScale=[65.41,73.42,82.41,98.00];
    function playNote(){
      if(!musicCtx||musicCtx.state==='closed')return;
      const freq=scale[Math.floor(Math.random()*scale.length)]*(Math.random()>0.75?0.5:1);
      const osc=musicCtx.createOscillator();const g=musicCtx.createGain();
      osc.type=Math.random()>0.55?'sine':'triangle';osc.frequency.value=freq;
      g.gain.setValueAtTime(0,musicCtx.currentTime);
      g.gain.linearRampToValueAtTime(0.025+Math.random()*0.015,musicCtx.currentTime+0.08);
      g.gain.exponentialRampToValueAtTime(0.001,musicCtx.currentTime+1.5+Math.random());
      osc.connect(g);g.connect(musicGain);osc.start();osc.stop(musicCtx.currentTime+2.5);
      if(Math.random()>0.65){
        const bass=musicCtx.createOscillator();const bg=musicCtx.createGain();
        bass.type='sine';bass.frequency.value=bassScale[Math.floor(Math.random()*bassScale.length)];
        bg.gain.setValueAtTime(0,musicCtx.currentTime);bg.gain.linearRampToValueAtTime(0.05,musicCtx.currentTime+0.4);
        bg.gain.exponentialRampToValueAtTime(0.001,musicCtx.currentTime+1.8);
        bass.connect(bg);bg.connect(musicGain);bass.start();bass.stop(musicCtx.currentTime+2.2);
      }
    }
    musicInterval=setInterval(playNote,280);isMusicPlaying=true;
  }catch(e){console.warn('Music init failed',e);}
}
function stopMusic(){if(musicInterval)clearInterval(musicInterval);if(musicCtx){musicCtx.close();musicCtx=null;musicGain=null;}isMusicPlaying=false;}
function toggleAudio(){
  const btn=$('#audioToggle');
  if(!btn)return;
  // Initialize audio context on first user gesture if needed
  if(!musicStarted){
    musicStarted=true;
    try{initMusic();}catch(e){}
    btn.textContent='🔊';btn.classList.remove('muted');btn.setAttribute('aria-pressed','true');
    showToast('Ambient neural soundscape activated','success');
    return;
  }
  if(!musicCtx)return;
  if(musicCtx.state==='suspended'){musicCtx.resume();btn.textContent='🔊';btn.classList.remove('muted');btn.setAttribute('aria-pressed','true');isMusicPlaying=true;return;}
  if(isMusicPlaying){musicGain.gain.cancelScheduledValues(musicCtx.currentTime);musicGain.gain.linearRampToValueAtTime(0,musicCtx.currentTime+0.3);setTimeout(stopMusic,350);btn.textContent='🔇';btn.classList.add('muted');btn.setAttribute('aria-pressed','false');isMusicPlaying=false;showToast('Soundscape paused','info');}
  else{initMusic();btn.textContent='🔊';btn.classList.remove('muted');btn.setAttribute('aria-pressed','true');showToast('Soundscape resumed','success');}
}
const gateCanvas=$('#gateCanvas');const gCtx=gateCanvas?gateCanvas.getContext('2d'):null;let gateNodes=[];let gateAnimId;function resizeGateCanvas(){if(!gateCanvas)return;gateCanvas.width=window.innerWidth;gateCanvas.height=window.innerHeight;}window.addEventListener('resize',resizeGateCanvas);resizeGateCanvas();const nodeCount=isTouchDevice?30:60;for(let i=0;i<nodeCount;i++){gateNodes.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3,size:Math.random()*1.5+0.5});}function drawGateNodes(){if(!gCtx||document.hidden){gateAnimId=requestAnimationFrame(drawGateNodes);return;}gCtx.clearRect(0,0,gateCanvas.width,gateCanvas.height);gateNodes.forEach((n,i)=>{n.x+=n.vx;n.y+=n.vy;if(n.x<0)n.x=gateCanvas.width;if(n.x>gateCanvas.width)n.x=0;if(n.y<0)n.y=gateCanvas.height;if(n.y>gateCanvas.height)n.y=0;gCtx.beginPath();gCtx.arc(n.x,n.y,n.size,0,Math.PI*2);gCtx.fillStyle='rgba(0,240,255,'+(n.size/3)+')';gCtx.fill();for(let j=i+1;j<gateNodes.length;j++){const n2=gateNodes[j],dx=n.x-n2.x,dy=n.y-n2.y,d=Math.sqrt(dx*dx+dy*dy);if(d<120){gCtx.beginPath();gCtx.moveTo(n.x,n.y);gCtx.lineTo(n2.x,n2.y);gCtx.strokeStyle='rgba(0,240,255,'+(0.08*(1-d/120))+')';gCtx.lineWidth=0.4;gCtx.stroke();}}});gateAnimId=requestAnimationFrame(drawGateNodes);}if(!prefersReducedMotion)drawGateNodes();
const gateContent=$('#gateContent');if(gateContent&&!isTouchDevice){let tiltRaf;gateContent.addEventListener('mousemove',(e)=>{cancelAnimationFrame(tiltRaf);tiltRaf=requestAnimationFrame(()=>{const rect=gateContent.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width-0.5;const y=(e.clientY-rect.top)/rect.height-0.5;gateContent.style.transform='scale(1.03) translateZ(20px) perspective(1000px) rotateY('+(x*10)+'deg) rotateX('+(-y*10)+'deg)';});});gateContent.addEventListener('mouseleave',()=>{cancelAnimationFrame(tiltRaf);gateContent.style.transform='';});}
const bootTexts=['Initializing neural core...','Loading synaptic protocols...','Establishing secure handshake...','System ready.'];let bootIdx=0,bootChar=0;function runBootSequence(){const el=$('#bootSequence');if(!el)return;function type(){if(bootIdx>=bootTexts.length){const hint=$('#gateHint');if(hint)hint.style.opacity='1';return;}const txt=bootTexts[bootIdx];let html='';for(let b=0;b<bootIdx;b++)html+='<span class="boot-line">[OK] '+bootTexts[b]+'</span>';html+='<span class="boot-line">[..] '+txt.substring(0,bootChar+1)+'</span>';el.innerHTML=html;bootChar++;if(bootChar===txt.length){bootIdx++;bootChar=0;setTimeout(type,400);}else{setTimeout(type,30+Math.random()*40);}}setTimeout(type,600);}runBootSequence();
const infPath=$('#infinityPath');if(infPath){const len=infPath.getTotalLength();infPath.style.strokeDasharray=len;infPath.style.strokeDashoffset=len;}
function enterSystem(){const btn=$('#audioToggle');if(!musicStarted){musicStarted=true;initMusic();if(btn){btn.textContent='🔊';btn.classList.remove('muted');btn.setAttribute('aria-pressed','true');}}const gate=$('#gate');const flash=$('#flash');const app=$('#app');const infOverlay=$('#infinityOverlay');infOverlay.classList.add('show');requestAnimationFrame(()=>infOverlay.classList.add('infinity-animate'));setTimeout(()=>{infOverlay.style.opacity='0';infOverlay.style.transition='opacity 0.6s ease';setTimeout(()=>{infOverlay.classList.remove('show','infinity-animate');infOverlay.style.opacity='';infOverlay.style.transition='';gate.classList.add('opening');flash.classList.add('active');$$('.scan-bar').forEach((bar,i)=>{bar.style.animationDuration='0.6s';bar.style.animationDelay=(i*0.12)+'s';});setTimeout(()=>{gate.style.opacity='0';gate.style.visibility='hidden';gate.setAttribute('aria-hidden','true');app.style.display='block';app.style.visibility='visible';requestAnimationFrame(()=>app.classList.add('visible'));setTimeout(()=>{$$('.scan-bar').forEach(bar=>{bar.style.animationDuration='';bar.style.animationDelay='';});flash.classList.remove('active');startTypewriter();animateCounters();},900);},500);},600);},2400);}
if(gateContent){gateContent.addEventListener('click',enterSystem);gateContent.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();enterSystem();}});}
let spotRaf;document.addEventListener('mousemove',(e)=>{if(isTouchDevice)return;cancelAnimationFrame(spotRaf);spotRaf=requestAnimationFrame(()=>{document.documentElement.style.setProperty('--mx',e.clientX+'px');document.documentElement.style.setProperty('--my',e.clientY+'px');});},{passive:true});
const holoPrism=$('#holoPrism');if(holoPrism&&!isTouchDevice){let prismRaf;holoPrism.addEventListener('mousemove',(e)=>{cancelAnimationFrame(prismRaf);prismRaf=requestAnimationFrame(()=>{const rect=holoPrism.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width-0.5;const y=(e.clientY-rect.top)/rect.height-0.5;holoPrism.style.animation='none';holoPrism.style.transform='perspective(1000px) rotateY('+(x*20)+'deg) rotateX('+(-y*20)+'deg)';});});holoPrism.addEventListener('mouseleave',()=>{cancelAnimationFrame(prismRaf);holoPrism.style.animation='';holoPrism.style.transform='';});}
const canvas=$('#particleCanvas');const ctx=canvas?canvas.getContext('2d'):null;let particles=[];let particleAnimId;function resizeCanvas(){if(!canvas)return;const dpr=window.devicePixelRatio||1;canvas.width=window.innerWidth*dpr;canvas.height=window.innerHeight*dpr;canvas.style.width=window.innerWidth+'px';canvas.style.height=window.innerHeight+'px';if(ctx)ctx.scale(dpr,dpr);}window.addEventListener('resize',resizeCanvas);resizeCanvas();const particleCount=isTouchDevice?40:90;for(let i=0;i<particleCount;i++){particles.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,vx:(Math.random()-0.5)*0.2,vy:(Math.random()-0.5)*0.2,size:Math.random()*2+0.5,alpha:Math.random()*0.35+0.1});}function drawParticles(){if(!ctx||document.hidden){particleAnimId=requestAnimationFrame(drawParticles);return;}const w=window.innerWidth,h=window.innerHeight;ctx.clearRect(0,0,w,h);particles.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fillStyle='rgba(0, 240, 255, '+p.alpha+')';ctx.fill();for(let j=i+1;j<particles.length;j++){const p2=particles[j],dx=p.x-p2.x,dy=p.y-p2.y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<140){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p2.x,p2.y);ctx.strokeStyle='rgba(0, 240, 255, '+(0.05*(1-dist/140))+')';ctx.lineWidth=0.5;ctx.stroke();}}});particleAnimId=requestAnimationFrame(drawParticles);}if(!prefersReducedMotion)drawParticles();
const quotes=[{text:"The future is already here — it is just not evenly distributed.",author:"William Gibson"},{text:"Any sufficiently advanced technology is indistinguishable from magic.",author:"Arthur C. Clarke"},{text:"Code is poetry written in logic.",author:"Maureonix Kernel"},{text:"The Matrix is everywhere. It is all around us.",author:"The Matrix"},{text:"Data is the new oil, but intelligence is the combustion engine.",author:"Peter Sondergaard"},{text:"Software is eating the world.",author:"Marc Andreessen"},{text:"First we shape our tools, then our tools shape us.",author:"Marshall McLuhan"},{text:"The best way to predict the future is to invent it.",author:"Alan Kay"},{text:"Talk is cheap. Show me the code.",author:"Linus Torvalds"},{text:"Simplicity is the ultimate sophistication.",author:"Leonardo da Vinci"},{text:"Innovation distinguishes between a leader and a follower.",author:"Steve Jobs"},{text:"Stay hungry, stay foolish.",author:"Steve Jobs"},{text:"The only way to do great work is to love what you do.",author:"Steve Jobs"},{text:"Everything is connected.",author:"Maureonix Network"},{text:"There is no cloud. It is just someone else's computer.",author:"Sysadmin Proverb"},{text:"Design is not just what it looks like. Design is how it works.",author:"Steve Jobs"},{text:"Done is better than perfect.",author:"Sheryl Sandberg"},{text:"Build what you wish existed.",author:"Unknown"},{text:"Dream in digital, live in reality.",author:"Maureonix"},{text:"Algorithms are the new spells.",author:"Maureonix Grimoire"},{text:"Hack the planet.",author:"Zero Cool"},{text:"Knowledge is power. Code is leverage.",author:"Maureonix"},{text:"The infinite is possible at Maureonix.",author:"System Boot"},{text:"Every line of code is a decision about the future.",author:"Unknown"},{text:"Automation is not the enemy. Inefficiency is.",author:"Maureonix"},{text:"The bot awakens.",author:"System Log"},{text:"Digital immortality begins with a single backup.",author:"Unknown"},{text:"Encrypt your thoughts. Decrypt the universe.",author:"Unknown"},{text:"Upgrade your reality.",author:"Maureonix"},{text:"The terminal is the window to the soul.",author:"Unix Philosophy"},{text:"We are the ghosts in the machine, and we are here to help.",author:"Maureonix Support"},{text:"One bot to rule them all, one prompt to find them.",author:"Maureonix Lore"},{text:"The code is strong with this one.",author:"Obi-Wan Kenobi Parody"},{text:"With great automation comes great responsibility.",author:"Uncle Ben Parody"},{text:"I am not a robot. I am a digital lifeform.",author:"Maureonix AI"},{text:"Resistance is futile. You will be automated.",author:"Borg Parody"},{text:"Houston, we have a feature.",author:"Apollo Parody"},{text:"E=mc²? More like E=maureonix².",author:"Physics Dept"},{text:"To bot or not to bot? That is the question.",author:"Shakespeare Parody"},{text:"All the world's a server, and all the men and women merely users.",author:"Shakespeare Parody"},{text:"The fault, dear Brutus, is not in our stars, but in our dependencies.",author:"Julius Caesar Parody"},{text:"Cry havoc and let slip the dogs of war... or just restart the server.",author:"Julius Caesar Parody"},{text:"Divide et impera... divide and conquer, the algorithmic way.",author:"Caesar Parody"},{text:"Alea iacta est... the die is cast, the deploy is live.",author:"Caesar Parody"},{text:"The measure of intelligence is the ability to change.",author:"Albert Einstein"},{text:"Imagination is more important than knowledge.",author:"Albert Einstein"},{text:"The cosmos is within us. We are made of star-stuff.",author:"Carl Sagan"},{text:"We are a way for the cosmos to know itself.",author:"Carl Sagan"},{text:"For small creatures such as we, the vastness is bearable only through love.",author:"Carl Sagan"},{text:"You are the universe experiencing itself in human form.",author:"Alan Watts"},{text:"The only true wisdom is in knowing you know nothing.",author:"Socrates"},{text:"We are what we repeatedly do. Excellence, then, is not an act, but a habit.",author:"Aristotle"}];
let qIdx=0,qChar=0,qPhase='typing';let typewriterTimeout;function startTypewriter(){const textEl=$('#typewriter'),authEl=$('#quoteAuthor');if(!textEl)return;function loop(){const q=quotes[qIdx];if(qPhase==='typing'){textEl.textContent=q.text.substring(0,qChar+1);qChar++;if(qChar===q.text.length){authEl.textContent='— '+q.author;authEl.classList.add('visible');qPhase='waiting';typewriterTimeout=setTimeout(loop,5000);return;}typewriterTimeout=setTimeout(loop,28+Math.random()*18);}else if(qPhase==='waiting'){qPhase='deleting';typewriterTimeout=setTimeout(loop,800);}else if(qPhase==='deleting'){textEl.textContent='';authEl.classList.remove('visible');qChar=0;qIdx=(qIdx+1)%quotes.length;qPhase='typing';typewriterTimeout=setTimeout(loop,600);}}loop();}
async function fetchStatus(){try{const r=await fetch('/');const ct=r.headers.get('content-type')||'';if(!ct.includes('application/json'))return;const d=await r.json();if(d.uptime){const sec=parseInt(d.uptime),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;const str=(h>0?h+'h ':'')+m+'m '+s+'s';const uptimeVal=$('#uptimeVal');if(uptimeVal)uptimeVal.textContent=str;const navUptime=$('#navUptime');if(navUptime)navUptime.textContent='UP '+str;}}catch(e){}}fetchStatus();const statusInterval=setInterval(fetchStatus,30000);
let timerInterval;function startTimer(seconds){if(timerInterval)clearInterval(timerInterval);let remaining=seconds;const box=$('#resultBox');const circle=$('#timerProgress');const text=$('#timerText');const circumference=2*Math.PI*45;if(circle){circle.style.strokeDasharray=circumference;circle.style.strokeDashoffset=0;}timerInterval=setInterval(()=>{remaining--;if(text)text.textContent=remaining;if(circle)circle.style.strokeDashoffset=circumference*(1-remaining/seconds);const timerEl=box.querySelector('.result-timer');if(timerEl&&remaining>0)timerEl.textContent='⏱ Expires in '+remaining+' seconds';else if(timerEl){timerEl.textContent='⏱ EXPIRED — Request new code';timerEl.style.color='var(--danger)';clearInterval(timerInterval);}},1000);}
async function getPairCode(){const btn=$('#pairBtn'),input=$('#phoneInput'),box=$('#resultBox');const num=input.value.trim().replace(/[^0-9]/g,'');if(!num||num.length<7){showResult('error','<div style="font-weight:600;color:var(--danger);margin-bottom:0.5rem">⚠️ INVALID INPUT</div><div style="font-size:0.8rem;color:var(--text-dim)">Please enter a valid phone number with country code.</div>');showToast('Invalid phone number','error');return;}btn.disabled=true;btn.innerHTML='<span style="display:inline-block;animation:spin 1s linear infinite">⟳</span> Processing...';box.className='result-box';box.style.display='none';try{const r=await fetch('/pair?number='+encodeURIComponent(num));const d=await r.json();if(d.status){showResult('success','<div style="font-weight:600;color:var(--green);margin-bottom:0.8rem;font-size:1rem">✅ PAIR CODE GENERATED</div><div class="code-display" id="pairCodeDisplay">'+d.code+'<button class="copy-btn" id="copyPairBtn" aria-label="Copy pair code">COPY</button></div><div style="color:var(--text-dim);font-size:0.8rem">Enter this code in WhatsApp Linked Devices immediately</div><div class="timer-visual"><div class="timer-ring"><svg viewBox="0 0 100 100"><circle class="timer-track" cx="50" cy="50" r="45"/><circle class="timer-progress" cx="50" cy="50" r="45" id="timerProgress"/></svg><span class="timer-text" id="timerText">60</span></div></div><div class="result-timer">⏱ Expires in 60 seconds</div>');const copyBtn=$('#copyPairBtn');if(copyBtn){copyBtn.addEventListener('click',()=>{navigator.clipboard.writeText(d.code).then(()=>{copyBtn.textContent='COPIED';showToast('Pair code copied to clipboard','success');setTimeout(()=>copyBtn.textContent='COPY',2000);}).catch(()=>showToast('Failed to copy','error'));});}startTimer(60);showToast('Pair code generated successfully','success');}else{showResult('error','<div style="font-weight:600;color:var(--danger);margin-bottom:0.5rem">❌ ERROR</div><div style="font-size:0.8rem;color:var(--text-dim)">'+(d.message||'Failed to generate pairing code.')+'</div>');showToast(d.message||'Failed to generate code','error');}}catch(e){showResult('error','<div style="font-weight:600;color:var(--danger);margin-bottom:0.5rem">❌ CONNECTION FAILED</div><div style="font-size:0.8rem;color:var(--text-dim)">Neural link interrupted. Please retry.</div>');showToast('Connection failed. Please retry.','error');}btn.disabled=false;btn.innerHTML='Get Pair Code';}
function showResult(type,html){const box=$('#resultBox');box.className='result-box show '+type;box.innerHTML=html;box.style.display='block';}
function showToast(message,type='info'){const container=$('#toastContainer');if(!container)return;const toast=document.createElement('div');toast.className='toast '+type;toast.textContent=message;container.appendChild(toast);requestAnimationFrame(()=>toast.classList.add('show'));setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),400);},4000);}
document.addEventListener('click',(e)=>{const target=e.target.closest('.cat-card');if(target){openDetail(target.dataset.id);}if(e.target.closest('#detailClose')){closeDetail();}if(e.target.closest('#pairBtn')){getPairCode();}if(e.target.closest('#audioToggle')){toggleAudio();}if(e.target.closest('#backToTop')){window.scrollTo({top:0,behavior:prefersReducedMotion?'auto':'smooth'});}});
document.addEventListener('keydown',(e)=>{if(e.key==='Escape')closeDetail();if(e.key==='t'||e.key==='T'){const themes=['neural','solar','matrix','abyss','ghost','inferno'];const current=document.documentElement.getAttribute('data-theme')||'neural';const idx=themes.indexOf(current);setTheme(themes[(idx+1)%themes.length]);}if(e.key==='m'||e.key==='M')toggleAudio();});
const phoneInput=$('#phoneInput');if(phoneInput){phoneInput.addEventListener('keydown',(e)=>{if(e.key==='Enter')getPairCode();});}
const revealObserver=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('visible');});},{threshold:0.08,rootMargin:'0px 0px -50px 0px'});$$('.reveal').forEach(el=>revealObserver.observe(el));
function animateCounters(){$$('[data-target]').forEach(el=>{const target=parseInt(el.dataset.target);if(!target||target===0)return;const duration=2000;const start=performance.now();function update(now){const elapsed=now-start;const progress=Math.min(elapsed/duration,1);const eased=1-Math.pow(1-progress,3);el.textContent=Math.floor(eased*target)+(target>=100?'+':'');if(progress<1)requestAnimationFrame(update);}requestAnimationFrame(update);});}
const scrollProgress=$('#scrollProgress');const backToTop=$('#backToTop');function onScroll(){const scrollTop=window.scrollY;const docHeight=document.documentElement.scrollHeight-window.innerHeight;const progress=docHeight>0?(scrollTop/docHeight)*100:0;if(scrollProgress){scrollProgress.style.width=progress+'%';scrollProgress.setAttribute('aria-valuenow',Math.round(progress));}if(backToTop){backToTop.classList.toggle('visible',scrollTop>500);}}window.addEventListener('scroll',onScroll,{passive:true});onScroll();
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(gateAnimId)cancelAnimationFrame(gateAnimId);if(particleAnimId)cancelAnimationFrame(particleAnimId);}else{if(!prefersReducedMotion){if(gateCanvas)drawGateNodes();if(canvas)drawParticles();}}});

/* ═══ CHAT WIDGET v7.0 — Smart Neural Assistant ═══ */
const CHAT_SESSION_KEY='maureonix-chat-session';const CHAT_HISTORY_KEY='maureonix-chat-history';
let chatSessionId='';let chatHistory=[];let isChatOpen=false;let audioCtx=null;let isAdmin=false;

function initAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();}
function playSound(type){if(!audioCtx)return;try{const osc=audioCtx.createOscillator();const gain=audioCtx.createGain();if(type==='send'){osc.frequency.value=880;gain.gain.value=0.025;}else if(type==='receive'){osc.frequency.value=660;gain.gain.value=0.02;}else{osc.frequency.value=440;gain.gain.value=0.015;}osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+0.06);}catch(e){}}
function generateSessionId(){return'sess_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);}

function initChatSession(){
  try{
    chatSessionId=localStorage.getItem(CHAT_SESSION_KEY)||generateSessionId();
    localStorage.setItem(CHAT_SESSION_KEY,chatSessionId);
    const raw=localStorage.getItem(CHAT_HISTORY_KEY);
    chatHistory=raw?JSON.parse(raw):[];
    renderChatHistory();
    if(!chatHistory.length){
      const greeting=isAdmin?'Welcome back, **Administrator**. I am MAUREONIX. I can navigate, research, verify numbers, and execute commands for you.':'Welcome to the **Neural Command Center**.\n\nI am MAUREONIX. Ask me about commands, pairing, or anything.';
      appendChatBubble('assistant',greeting,Date.now(),true);
    }
  }catch(e){chatSessionId=generateSessionId();}
}

function saveChatHistory(){try{localStorage.setItem(CHAT_HISTORY_KEY,JSON.stringify(chatHistory.slice(-50)));}catch(e){}}
function renderChatHistory(){const container=$('#chatMessages');if(!container)return;container.innerHTML='';chatHistory.forEach(msg=>appendChatBubble(msg.role,msg.text,msg.ts,false));scrollChatToBottom();}

function parseMarkdown(text){
  let html=text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const tick=String.fromCharCode(96);
  let parts=html.split(tick+tick+tick);
  for(let i=1;i<parts.length;i+=2){
    let block=parts[i];
    let nl=block.indexOf('\n');
    let code=nl>-1?block.substring(nl+1):block;
    parts[i]='<pre><button class="copy-code-btn" onclick="copyCode(this)">COPY</button><code>'+code.trim()+'</code></pre>';
  }
  html=parts.join('');
  let parts2=html.split(tick);
  for(let j=1;j<parts2.length;j+=2){parts2[j]='<code>'+parts2[j]+'</code>';}
  html=parts2.join('');
  html=html.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  html=html.replace(/\*([^*]+)\*/g,'<em>$1</em>');
  html=html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  html=html.replace(/\n/g,'<br>');
  return html;
}

function copyCode(btn){const code=btn.parentElement.querySelector('code').innerText;navigator.clipboard.writeText(code).then(()=>{btn.textContent='COPIED';setTimeout(()=>btn.textContent='COPY',2000);});}

function appendChatBubble(role,text,ts,save){
  const container=$('#chatMessages');if(!container)return;
  const bubble=document.createElement('div');bubble.className='chat-bubble '+role;
  const timeStr=ts?new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';
  const parsed=role==='assistant'?parseMarkdown(text):text.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  bubble.innerHTML=parsed+'<span class="ts">'+timeStr+'</span>';
  container.appendChild(bubble);
  if(save){chatHistory.push({role,text,ts:ts||Date.now()});saveChatHistory();}
  scrollChatToBottom();
}

function scrollChatToBottom(){const container=$('#chatMessages');if(container)container.scrollTop=container.scrollHeight;}

function autoResize(ta){ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,120)+'px';}
function handleChatKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChatMessage();}}
function checkChips(){const ta=$('#chatInput');const hasText=ta&&ta.value.trim().length>0;const chips=$('#floatChips');if(chips)chips.classList.toggle('hidden',hasText);}

function sendQuick(text){const ta=$('#chatInput');if(ta){ta.value=text;autoResize(ta);checkChips();}sendChatMessage();}

/* ── Smart Intent Parser ── */
function parseIntent(text){
  const lower=text.toLowerCase();
  const intents=[];
  
  // Navigation / Scrolling
  if(/scroll to|go to|navigate to|show me|take me to|open|jump to/.test(lower)){
    if(/pair|connect|link|code|whatsapp/.test(lower))intents.push({type:'scrollTo',target:'pairing'});
    else if(/feature|module|command|capability/.test(lower))intents.push({type:'scrollTo',target:'features'});
    else if(/terminal|quote|wisdom/.test(lower))intents.push({type:'scrollTo',target:'mainContent'});
    else if(/stat|metric|number|count/.test(lower))intents.push({type:'scrollTo',target:'stats'});
    else intents.push({type:'scrollTo',target:'mainContent'});
  }
  
  // Click actions
  if(/click|press|tap|hit|activate/.test(lower)){
    if(/init|connect|start|begin|pair/.test(lower))intents.push({type:'click',target:'btnInitConnect'});
    else if(/explore|feature|discover/.test(lower))intents.push({type:'click',target:'btnExplore'});
    else if(/feedback|rate|review|star/.test(lower))intents.push({type:'click',target:'feedbackToggle'});
  }
  
  // Phone verification
  const phoneMatch=text.match(/(?:\+?254|0)?\d{9,12}/);
  if(phoneMatch){
    const num=phoneMatch[0].replace(/^0/,'254').replace(/^\+/,'');
    if(/verify|check|validate|confirm|is.*correct/.test(lower))intents.push({type:'verifyPhone',number:num});
    else if(/pair|code|link|connect.*number/.test(lower))intents.push({type:'requestPair',number:num});
  }
  
  // Research / Info
  if(/research|search|find|look up|what is|who is|how to|explain|tell me about/.test(lower)){
    intents.push({type:'research',query:text});
  }
  
  // Status check
  if(/status|health|online|alive|running|working/.test(lower)){
    intents.push({type:'statusCheck'});
  }
  
  return intents;
}

function executeIntent(intent){
  switch(intent.type){
    case 'scrollTo':
      const el=document.getElementById(intent.target);
      if(el){el.scrollIntoView({behavior:'smooth',block:'start'});return true;}
      return false;
    case 'click':
      const btn=document.getElementById(intent.target);
      if(btn){btn.click();return true;}
      return false;
    case 'verifyPhone':
      const valid=/^254\d{9}$/.test(intent.number);
      return valid?'✅ **'+intent.number+'** is a valid Kenyan format number.':'⚠️ **'+intent.number+'** does not appear to be a valid format. Use format: 254XXXXXXXXX';
    case 'requestPair':
      const input=$('#phoneInput');
      if(input){input.value=intent.number;getPairCode();return true;}
      return false;
    case 'statusCheck':
      return '🟢 **MAUREONIX** is online. Uptime: '+($('#uptimeVal')?$('#uptimeVal').textContent:'—')+'. All systems nominal.';
    default:return false;
  }
}

async function sendChatMessage(){
  initAudio();
  const ta=$('#chatInput');const btn=$('#chatSend');
  const text=ta.value.trim();if(!text)return;
  ta.value='';autoResize(ta);checkChips();
  appendChatBubble('user',text,Date.now(),true);playSound('send');
  $('#chatTyping').style.display='flex';btn.disabled=true;
  
  // Parse intents first
  const intents=parseIntent(text);
  let intentHandled=false;
  let intentResponse=[];
  
  for(const intent of intents){
    if(intent.type==='research')continue; // Let server handle research
    const result=executeIntent(intent);
    if(result===true){intentHandled=true;}
    else if(typeof result==='string'){intentResponse.push(result);intentHandled=true;}
  }
  
  if(intentHandled&&intentResponse.length>0){
    setTimeout(()=>{
      appendChatBubble('assistant',intentResponse.join('\n\n'),Date.now(),true);playSound('receive');
      $('#chatTyping').style.display='none';btn.disabled=false;ta.focus();
    },600);
    return;
  }
  
  try{
    const res=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:chatSessionId,message:text,context:{page:'dashboard',isAdmin:isAdmin}})});
    const data=await res.json();
    if(data.text){
      appendChatBubble('assistant',data.text,Date.now(),true);playSound('receive');
      if(data.actions&&Array.isArray(data.actions)){
        data.actions.forEach(act=>{
          if(act.type==='scrollTo'){const t=document.getElementById(act.target);if(t)t.scrollIntoView({behavior:'smooth',block:'start'});}
          if(act.type==='highlight'){const t=document.getElementById(act.target);if(t){t.style.transition='box-shadow 0.5s';t.style.boxShadow='0 0 40px var(--cyan)';setTimeout(()=>t.style.boxShadow='',2000);}}
        });
      }
    }else{
      appendChatBubble('assistant','⚠️ Neural link interrupted. Please retry.',Date.now(),true);
    }
  }catch(e){
    appendChatBubble('assistant','❌ Connection failed. The neural network is unreachable.',Date.now(),true);
  }
  $('#chatTyping').style.display='none';btn.disabled=false;ta.focus();
}

function toggleChat(){
  initAudio();
  const panel=$('#chatPanel');const btn=$('#chatToggle');
  isChatOpen=!isChatOpen;
  panel.style.display=isChatOpen?'flex':'none';
  panel.setAttribute('aria-hidden',String(!isChatOpen));
  btn.setAttribute('aria-expanded',String(isChatOpen));
  if(isChatOpen){
    $('#chatInput').focus();scrollChatToBottom();
    adjustChatForViewport();
  }
}

// Visual Viewport API for keyboard handling
function adjustChatForViewport(){
  const panel=$('#chatPanel');
  if(!panel||panel.style.display!=='flex')return;
  if(window.visualViewport){
    const vv=window.visualViewport;
    const h=Math.min(600,vv.height-130);
    panel.style.height=h+'px';
    panel.style.maxHeight=h+'px';
    const bottomOffset=window.innerHeight-vv.height;
    panel.style.bottom=(bottomOffset+90)+'px';
  }
}
if(window.visualViewport){
  window.visualViewport.addEventListener('resize',adjustChatForViewport);
  window.visualViewport.addEventListener('scroll',adjustChatForViewport);
}

// Rating Popup Logic
let popupRating=0;
function showRatingPopup(){
  const overlay=$('#ratingPopupOverlay');
  if(!overlay)return;
  overlay.classList.add('active');
}
function dismissRating(){
  const overlay=$('#ratingPopupOverlay');
  if(overlay)overlay.classList.remove('active');
  localStorage.setItem('maureonix-rating-dismissed','1');
}
function submitRating(){
  if(popupRating===0){showToast('Please select a star rating','error');return;}
  const suggestion=$('#popupSuggestion').value.trim();
  fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({rating:popupRating,comment:suggestion||'Post-visit rating',page:location.href})})
    .then(()=>{
      $('#popupBtnRow').style.display='none';
      $('#popupStarRating').style.display='none';
      $('#popupSuggestion').style.display='none';
      $('#ratingPopup').querySelector('h3').textContent='Thank you!';
      $('#ratingPopup').querySelector('p').textContent='Your feedback powers the neural network.';
      document.getElementById('ratingThankYou').classList.add('visible');
      localStorage.setItem('maureonix-rating-submitted','1');
      setTimeout(dismissRating,4000);
    }).catch(()=>showToast('Failed to submit. Please retry.','error'));
}

// Init popup after 90s
setTimeout(()=>{
  if(!localStorage.getItem('maureonix-rating-submitted')&&!localStorage.getItem('maureonix-rating-dismissed')){
    showRatingPopup();
  }
},90000);

// Popup star rating
const popupStars=$('#popupStarRating');
if(popupStars){
  popupStars.addEventListener('click',(e)=>{
    const star=e.target.closest('span');
    if(star){popupRating=parseInt(star.dataset.value);updatePopupStars();}
  });
  popupStars.addEventListener('mouseover',(e)=>{
    const star=e.target.closest('span');
    if(star)updatePopupStars(parseInt(star.dataset.value));
  });
  popupStars.addEventListener('mouseleave',()=>updatePopupStars());
}
function updatePopupStars(hoverVal){
  const stars=$$('#popupStarRating span');
  stars.forEach((s,i)=>{
    const val=i+1;
    s.classList.toggle('active',val<=popupRating);
    s.classList.toggle('hovered',hoverVal>0&&val<=hoverVal);
  });
}

document.addEventListener('click',(e)=>{
  if(e.target.closest('#chatToggle'))toggleChat();
  if(e.target.closest('#chatClose'))toggleChat();
  if(e.target.closest('#chatSend'))sendChatMessage();
  if(e.target.closest('#feedbackToggle'))openFeedbackModal();
  if(e.target.closest('#closeFeedback'))closeFeedbackModal();
  if(e.target.closest('#submitFeedback'))submitFeedback();
});
document.addEventListener('keydown',(e)=>{
  if(e.key==='Escape'){
    const fm=$('#feedbackModal');if(fm&&fm.style.display==='flex'){closeFeedbackModal();return;}
    if(isChatOpen)toggleChat();
  }
});

// Fix audio init on first interaction
document.body.addEventListener('click',function initAudioOnFirstClick(){
  if(!audioCtx)initAudio();
  document.body.removeEventListener('click',initAudioOnFirstClick);
},{once:true});

initChatSession();
})();
</script>
</body>
</html>`;
};