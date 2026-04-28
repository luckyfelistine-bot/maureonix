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
/* ... (the entire CSS from previous version, unchanged) ... */

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
function initMusic(){try{const AC=window.AudioContext||window.webkitAudioContext;musicCtx=new AC();musicGain=musicCtx.createGain();musicGain.gain.value=0.12;const convolver=musicCtx.createConvolver();const rate=musicCtx.sampleRate;const length=rate*1.5;const impulse=musicCtx.createBuffer(2,length,rate);for(let c=0;c<2;c++){const ch=impulse.getChannelData(c);for(let i=0;i<length;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/length,2);}convolver.buffer=impulse;const revGain=musicCtx.createGain();revGain.gain.value=0.35;musicGain.connect(convolver);convolver.connect(revGain);revGain.connect(musicCtx.destination);const delay=musicCtx.createDelay();delay.delayTime.value=0.375;const dGain=musicCtx.createGain();dGain.gain.value=0.25;musicGain.connect(delay);delay.connect(dGain);dGain.connect(delay);dGain.connect(musicCtx.destination);musicGain.connect(musicCtx.destination);const scale=[130.81,155.56,174.61,196.00,233.08,261.63,311.13,349.23];const bassScale=[65.41,73.42,82.41,98.00];function playNote(){if(!musicCtx||musicCtx.state==='closed')return;const freq=scale[Math.floor(Math.random()*scale.length)]*(Math.random()>0.75?0.5:1);const osc=musicCtx.createOscillator();const g=musicCtx.createGain();osc.type=Math.random()>0.55?'sine':'triangle';osc.frequency.value=freq;g.gain.setValueAtTime(0,musicCtx.currentTime);g.gain.linearRampToValueAtTime(0.025+Math.random()*0.015,musicCtx.currentTime+0.08);g.gain.exponentialRampToValueAtTime(0.001,musicCtx.currentTime+1.5+Math.random());osc.connect(g);g.connect(musicGain);osc.start();osc.stop(musicCtx.currentTime+2.5);if(Math.random()>0.65){const bass=musicCtx.createOscillator();const bg=musicCtx.createGain();bass.type='sine';bass.frequency.value=bassScale[Math.floor(Math.random()*bassScale.length)];bg.gain.setValueAtTime(0,musicCtx.currentTime);bg.gain.linearRampToValueAtTime(0.05,musicCtx.currentTime+0.4);bg.gain.exponentialRampToValueAtTime(0.001,musicCtx.currentTime+1.8);bass.connect(bg);bg.connect(musicGain);bass.start();bass.stop(musicCtx.currentTime+2.2);}}musicInterval=setInterval(playNote,280);isMusicPlaying=true;}catch(e){console.warn('Music init failed',e);}}
function stopMusic(){if(musicInterval)clearInterval(musicInterval);if(musicCtx){musicCtx.close();musicCtx=null;musicGain=null;}isMusicPlaying=false;}
function toggleAudio(){const btn=$('#audioToggle');if(!btn)return;if(!musicStarted){musicStarted=true;try{initMusic();}catch(e){}btn.textContent='🔊';btn.classList.remove('muted');btn.setAttribute('aria-pressed','true');showToast('Ambient neural soundscape activated','success');return;}if(!musicCtx)return;if(musicCtx.state==='suspended'){musicCtx.resume();btn.textContent='🔊';btn.classList.remove('muted');btn.setAttribute('aria-pressed','true');isMusicPlaying=true;return;}if(isMusicPlaying){musicGain.gain.cancelScheduledValues(musicCtx.currentTime);musicGain.gain.linearRampToValueAtTime(0,musicCtx.currentTime+0.3);setTimeout(stopMusic,350);btn.textContent='🔇';btn.classList.add('muted');btn.setAttribute('aria-pressed','false');isMusicPlaying=false;showToast('Soundscape paused','info');}else{initMusic();btn.textContent='🔊';btn.classList.remove('muted');btn.setAttribute('aria-pressed','true');showToast('Soundscape resumed','success');}}
const gateCanvas=$('#gateCanvas');const gCtx=gateCanvas?gateCanvas.getContext('2d'):null;let gateNodes=[],gateAnimId;function resizeGateCanvas(){if(!gateCanvas)return;gateCanvas.width=window.innerWidth;gateCanvas.height=window.innerHeight;}window.addEventListener('resize',resizeGateCanvas);resizeGateCanvas();const nodeCount=isTouchDevice?30:60;for(let i=0;i<nodeCount;i++){gateNodes.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3,size:Math.random()*1.5+0.5});}function drawGateNodes(){if(!gCtx||document.hidden){gateAnimId=requestAnimationFrame(drawGateNodes);return;}gCtx.clearRect(0,0,gateCanvas.width,gateCanvas.height);gateNodes.forEach((n,i)=>{n.x+=n.vx;n.y+=n.vy;if(n.x<0)n.x=gateCanvas.width;if(n.x>gateCanvas.width)n.x=0;if(n.y<0)n.y=gateCanvas.height;if(n.y>gateCanvas.height)n.y=0;gCtx.beginPath();gCtx.arc(n.x,n.y,n.size,0,Math.PI*2);gCtx.fillStyle='rgba(0,240,255,'+(n.size/3)+')';gCtx.fill();for(let j=i+1;j<gateNodes.length;j++){const n2=gateNodes[j],dx=n.x-n2.x,dy=n.y-n2.y,d=Math.sqrt(dx*dx+dy*dy);if(d<120){gCtx.beginPath();gCtx.moveTo(n.x,n.y);gCtx.lineTo(n2.x,n2.y);gCtx.strokeStyle='rgba(0,240,255,'+(0.08*(1-d/120))+')';gCtx.lineWidth=0.4;gCtx.stroke();}}});gateAnimId=requestAnimationFrame(drawGateNodes);}if(!prefersReducedMotion)drawGateNodes();
const gateContent=$('#gateContent');if(gateContent&&!isTouchDevice){let tiltRaf;gateContent.addEventListener('mousemove',(e)=>{cancelAnimationFrame(tiltRaf);tiltRaf=requestAnimationFrame(()=>{const rect=gateContent.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width-0.5;const y=(e.clientY-rect.top)/rect.height-0.5;gateContent.style.transform='scale(1.03) translateZ(20px) perspective(1000px) rotateY('+(x*10)+'deg) rotateX('+(-y*10)+'deg)';});});gateContent.addEventListener('mouseleave',()=>{cancelAnimationFrame(tiltRaf);gateContent.style.transform='';});}
const bootTexts=['Initializing neural core...','Loading synaptic protocols...','Establishing secure handshake...','System ready.'];let bootIdx=0,bootChar=0;function runBootSequence(){const el=$('#bootSequence');if(!el)return;function type(){if(bootIdx>=bootTexts.length){const hint=$('#gateHint');if(hint)hint.style.opacity='1';return;}const txt=bootTexts[bootIdx];let html='';for(let b=0;b<bootIdx;b++)html+='<span class="boot-line">[OK] '+bootTexts[b]+'</span>';html+='<span class="boot-line">[..] '+txt.substring(0,bootChar+1)+'</span>';el.innerHTML=html;bootChar++;if(bootChar===txt.length){bootIdx++;bootChar=0;setTimeout(type,400);}else{setTimeout(type,30+Math.random()*40);}}setTimeout(type,600);}runBootSequence();
const infPath=$('#infinityPath');if(infPath){const len=infPath.getTotalLength();infPath.style.strokeDasharray=len;infPath.style.strokeDashoffset=len;}
function enterSystem(){try{const btn=$('#audioToggle');if(!musicStarted){musicStarted=true;initMusic();if(btn){btn.textContent='🔊';btn.classList.remove('muted');btn.setAttribute('aria-pressed','true');}}}catch(e){}const gate=$('#gate');const flash=$('#flash');const app=$('#app');const infOverlay=$('#infinityOverlay');infOverlay.classList.add('show');requestAnimationFrame(()=>infOverlay.classList.add('infinity-animate'));setTimeout(()=>{infOverlay.style.opacity='0';infOverlay.style.transition='opacity 0.6s ease';setTimeout(()=>{infOverlay.classList.remove('show','infinity-animate');infOverlay.style.opacity='';infOverlay.style.transition='';gate.classList.add('opening');flash.classList.add('active');$$('.scan-bar').forEach((bar,i)=>{bar.style.animationDuration='0.6s';bar.style.animationDelay=(i*0.12)+'s';});setTimeout(()=>{gate.style.opacity='0';gate.style.visibility='hidden';gate.setAttribute('aria-hidden','true');app.style.display='block';app.style.visibility='visible';requestAnimationFrame(()=>app.classList.add('visible'));setTimeout(()=>{$$('.scan-bar').forEach(bar=>{bar.style.animationDuration='';bar.style.animationDelay='';});flash.classList.remove('active');startTypewriter();animateCounters();},900);},500);},600);},2400);}
if(gateContent){gateContent.addEventListener('click',enterSystem);gateContent.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();enterSystem();}});}
let spotRaf;document.addEventListener('mousemove',(e)=>{if(isTouchDevice)return;cancelAnimationFrame(spotRaf);spotRaf=requestAnimationFrame(()=>{document.documentElement.style.setProperty('--mx',e.clientX+'px');document.documentElement.style.setProperty('--my',e.clientY+'px');});},{passive:true});
const holoPrism=$('#holoPrism');if(holoPrism&&!isTouchDevice){let prismRaf;holoPrism.addEventListener('mousemove',(e)=>{cancelAnimationFrame(prismRaf);prismRaf=requestAnimationFrame(()=>{const rect=holoPrism.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width-0.5;const y=(e.clientY-rect.top)/rect.height-0.5;holoPrism.style.animation='none';holoPrism.style.transform='perspective(1000px) rotateY('+(x*20)+'deg) rotateX('+(-y*20)+'deg)';});});holoPrism.addEventListener('mouseleave',()=>{cancelAnimationFrame(prismRaf);holoPrism.style.animation='';holoPrism.style.transform='';});}
const canvas=$('#particleCanvas');const ctx=canvas?canvas.getContext('2d'):null;let particles=[],particleAnimId;function resizeCanvas(){if(!canvas)return;const dpr=window.devicePixelRatio||1;canvas.width=window.innerWidth*dpr;canvas.height=window.innerHeight*dpr;canvas.style.width=window.innerWidth+'px';canvas.style.height=window.innerHeight+'px';if(ctx)ctx.scale(dpr,dpr);}window.addEventListener('resize',resizeCanvas);resizeCanvas();const particleCount=isTouchDevice?40:90;for(let i=0;i<particleCount;i++){particles.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,vx:(Math.random()-0.5)*0.2,vy:(Math.random()-0.5)*0.2,size:Math.random()*2+0.5,alpha:Math.random()*0.35+0.1});}function drawParticles(){if(!ctx||document.hidden){particleAnimId=requestAnimationFrame(drawParticles);return;}const w=window.innerWidth,h=window.innerHeight;ctx.clearRect(0,0,w,h);particles.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fillStyle='rgba(0, 240, 255, '+p.alpha+')';ctx.fill();for(let j=i+1;j<particles.length;j++){const p2=particles[j],dx=p.x-p2.x,dy=p.y-p2.y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<140){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p2.x,p2.y);ctx.strokeStyle='rgba(0, 240, 255, '+(0.05*(1-dist/140))+')';ctx.lineWidth=0.5;ctx.stroke();}}});particleAnimId=requestAnimationFrame(drawParticles);}if(!prefersReducedMotion)drawParticles();
const quotes=[{text:"The future is already here — it is just not evenly distributed.",author:"William Gibson"},{text:"Any sufficiently advanced technology is indistinguishable from magic.",author:"Arthur C. Clarke"},{text:"Code is poetry written in logic.",author:"Maureonix Kernel"},{text:"The Matrix is everywhere. It is all around us.",author:"The Matrix"},{text:"Data is the new oil, but intelligence is the combustion engine.",author:"Peter Sondergaard"},{text:"Software is eating the world.",author:"Marc Andreessen"},{text:"First we shape our tools, then our tools shape us.",author:"Marshall McLuhan"},{text:"The best way to predict the future is to invent it.",author:"Alan Kay"},{text:"Talk is cheap. Show me the code.",author:"Linus Torvalds"},{text:"Simplicity is the ultimate sophistication.",author:"Leonardo da Vinci"},{text:"Innovation distinguishes between a leader and a follower.",author:"Steve Jobs"},{text:"Stay hungry, stay foolish.",author:"Steve Jobs"},{text:"The only way to do great work is to love what you do.",author:"Steve Jobs"},{text:"Everything is connected.",author:"Maureonix Network"},{text:"There is no cloud. It is just someone else's computer.",author:"Sysadmin Proverb"},{text:"Design is not just what it looks like. Design is how it works.",author:"Steve Jobs"},{text:"Done is better than perfect.",author:"Sheryl Sandberg"},{text:"Build what you wish existed.",author:"Unknown"},{text:"Dream in digital, live in reality.",author:"Maureonix"},{text:"Algorithms are the new spells.",author:"Maureonix Grimoire"},{text:"Hack the planet.",author:"Zero Cool"},{text:"Knowledge is power. Code is leverage.",author:"Maureonix"},{text:"The infinite is possible at Maureonix.",author:"System Boot"},{text:"Every line of code is a decision about the future.",author:"Unknown"},{text:"Automation is not the enemy. Inefficiency is.",author:"Maureonix"},{text:"The bot awakens.",author:"System Log"},{text:"Digital immortality begins with a single backup.",author:"Unknown"},{text:"Encrypt your thoughts. Decrypt the universe.",author:"Unknown"},{text:"Upgrade your reality.",author:"Maureonix"},{text:"The terminal is the window to the soul.",author:"Unix Philosophy"},{text:"We are the ghosts in the machine, and we are here to help.",author:"Maureonix Support"},{text:"One bot to rule them all, one prompt to find them.",author:"Maureonix Lore"},{text:"The code is strong with this one.",author:"Obi-Wan Kenobi Parody"},{text:"With great automation comes great responsibility.",author:"Uncle Ben Parody"},{text:"I am not a robot. I am a digital lifeform.",author:"Maureonix AI"},{text:"Resistance is futile. You will be automated.",author:"Borg Parody"},{text:"Houston, we have a feature.",author:"Apollo Parody"},{text:"E=mc²? More like E=maureonix².",author:"Physics Dept"},{text:"To bot or not to bot? That is the question.",author:"Shakespeare Parody"},{text:"All the world's a server, and all the men and women merely users.",author:"Shakespeare Parody"},{text:"The fault, dear Brutus, is not in our stars, but in our dependencies.",author:"Julius Caesar Parody"},{text:"Cry havoc and let slip the dogs of war... or just restart the server.",author:"Julius Caesar Parody"},{text:"Divide et impera... divide and conquer, the algorithmic way.",author:"Caesar Parody"},{text:"Alea iacta est... the die is cast, the deploy is live.",author:"Caesar Parody"},{text:"The measure of intelligence is the ability to change.",author:"Albert Einstein"},{text:"Imagination is more important than knowledge.",author:"Albert Einstein"},{text:"The cosmos is within us. We are made of star-stuff.",author:"Carl Sagan"},{text:"We are a way for the cosmos to know itself.",author:"Carl Sagan"},{text:"For small creatures such as we, the vastness is bearable only through love.",author:"Carl Sagan"},{text:"You are the universe experiencing itself in human form.",author:"Alan Watts"},{text:"The only true wisdom is in knowing you know nothing.",author:"Socrates"},{text:"We are what we repeatedly do. Excellence, then, is not an act, but a habit.",author:"Aristotle"}];
let qIdx=0,qChar=0,qPhase='typing',typewriterTimeout;function startTypewriter(){const textEl=$('#typewriter'),authEl=$('#quoteAuthor');if(!textEl)return;function loop(){const q=quotes[qIdx];if(qPhase==='typing'){textEl.textContent=q.text.substring(0,qChar+1);qChar++;if(qChar===q.text.length){authEl.textContent='— '+q.author;authEl.classList.add('visible');qPhase='waiting';typewriterTimeout=setTimeout(loop,5000);return;}typewriterTimeout=setTimeout(loop,28+Math.random()*18);}else if(qPhase==='waiting'){qPhase='deleting';typewriterTimeout=setTimeout(loop,800);}else if(qPhase==='deleting'){textEl.textContent='';authEl.classList.remove('visible');qChar=0;qIdx=(qIdx+1)%quotes.length;qPhase='typing';typewriterTimeout=setTimeout(loop,600);}}loop();}
async function fetchStatus(){try{const r=await fetch('/');const ct=r.headers.get('content-type')||'';if(!ct.includes('application/json'))return;const d=await r.json();if(d.uptime){const sec=parseInt(d.uptime),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;const str=(h>0?h+'h ':'')+m+'m '+s+'s';const uptimeVal=$('#uptimeVal');if(uptimeVal)uptimeVal.textContent=str;const navUptime=$('#navUptime');if(navUptime)navUptime.textContent='UP '+str;}}catch(e){}}fetchStatus();const statusInterval=setInterval(fetchStatus,30000);
let timerInterval;function startTimer(seconds){if(timerInterval)clearInterval(timerInterval);let remaining=seconds;const box=$('#resultBox');const circle=$('#timerProgress');const text=$('#timerText');const circumference=2*Math.PI*45;if(circle){circle.style.strokeDasharray=circumference;circle.style.strokeDashoffset=0;}timerInterval=setInterval(()=>{remaining--;if(text)text.textContent=remaining;if(circle)circle.style.strokeDashoffset=circumference*(1-remaining/seconds);const timerEl=box.querySelector('.result-timer');if(timerEl&&remaining>0)timerEl.textContent='⏱ Expires in '+remaining+' seconds';else if(timerEl){timerEl.textContent='⏱ EXPIRED — Request new code';timerEl.style.color='var(--danger)';clearInterval(timerInterval);}},1000);}
async function getPairCode(){const btn=$('#pairBtn'),input=$('#phoneInput'),box=$('#resultBox');const num=input.value.trim().replace(/[^0-9]/g,'');if(!num||num.length<7){showResult('error','<div style="font-weight:600;color:var(--danger);margin-bottom:0.5rem">⚠️ INVALID INPUT</div><div style="font-size:0.8rem;color:var(--text-dim)">Please enter a valid phone number with country code.</div>');showToast('Invalid phone number','error');return;}btn.disabled=true;btn.innerHTML='<span style="display:inline-block;animation:spin 1s linear infinite">⟳</span> Processing...';box.className='result-box';box.style.display='none';try{const r=await fetch('/pair?number='+encodeURIComponent(num));const d=await r.json();if(d.status){showResult('success','<div style="font-weight:600;color:var(--green);margin-bottom:0.8rem;font-size:1rem">✅ PAIR CODE GENERATED</div><div class="code-display" id="pairCodeDisplay">'+d.code+'<button class="copy-btn" id="copyPairBtn" aria-label="Copy pair code">COPY</button></div><div style="color:var(--text-dim);font-size:0.8rem">Enter this code in WhatsApp Linked Devices immediately</div><div class="timer-visual"><div class="timer-ring"><svg viewBox="0 0 100 100"><circle class="timer-track" cx="50" cy="50" r="45"/><circle class="timer-progress" cx="50" cy="50" r="45" id="timerProgress"/></svg><span class="timer-text" id="timerText">60</span></div></div><div class="result-timer">⏱ Expires in 60 seconds</div>');const copyBtn=$('#copyPairBtn');if(copyBtn){copyBtn.addEventListener('click',()=>{navigator.clipboard.writeText(d.code).then(()=>{copyBtn.textContent='COPIED';showToast('Pair code copied to clipboard','success');setTimeout(()=>copyBtn.textContent='COPY',2000);}).catch(()=>showToast('Failed to copy','error'));});}startTimer(60);showToast('Pair code generated successfully','success');}else{showResult('error','<div style="font-weight:600;color:var(--danger);margin-bottom:0.5rem">❌ ERROR</div><div style="font-size:0.8rem;color:var(--text-dim)">'+(d.message||'Failed to generate pairing code.')+'</div>');showToast(d.message||'Failed to generate code','error');}}catch(e){showResult('error','<div style="font-weight:600;color:var(--danger);margin-bottom:0.5rem">❌ CONNECTION FAILED</div><div style="font-size:0.8rem;color:var(--text-dim)">Neural link interrupted. Please retry.</div>');showToast('Connection failed. Please retry.','error');}btn.disabled=false;btn.innerHTML='Get Pair Code';}
function showResult(type,html){const box=$('#resultBox');box.className='result-box show '+type;box.innerHTML=html;box.style.display='block';}
function showToast(message,type='info'){const container=$('#toastContainer');if(!container)return;const toast=document.createElement('div');toast.className='toast '+type;toast.textContent=message;container.appendChild(toast);requestAnimationFrame(()=>toast.classList.add('show'));setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),400);},4000);}
const revealObserver=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('visible');});},{threshold:0.08,rootMargin:'0px 0px -50px 0px'});$$('.reveal').forEach(el=>revealObserver.observe(el));
function animateCounters(){$$('[data-target]').forEach(el=>{const target=parseInt(el.dataset.target);if(!target||target===0)return;const duration=2000;const start=performance.now();function update(now){const elapsed=now-start;const progress=Math.min(elapsed/duration,1);const eased=1-Math.pow(1-progress,3);el.textContent=Math.floor(eased*target)+(target>=100?'+':'');if(progress<1)requestAnimationFrame(update);}requestAnimationFrame(update);});}
const scrollProgress=$('#scrollProgress'),backToTop=$('#backToTop');function onScroll(){const scrollTop=window.scrollY;const docHeight=document.documentElement.scrollHeight-window.innerHeight;const progress=docHeight>0?(scrollTop/docHeight)*100:0;if(scrollProgress){scrollProgress.style.width=progress+'%';scrollProgress.setAttribute('aria-valuenow',Math.round(progress));}if(backToTop){backToTop.classList.toggle('visible',scrollTop>500);}}window.addEventListener('scroll',onScroll,{passive:true});onScroll();
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(gateAnimId)cancelAnimationFrame(gateAnimId);if(particleAnimId)cancelAnimationFrame(particleAnimId);}else{if(!prefersReducedMotion){if(gateCanvas)drawGateNodes();if(canvas)drawParticles();}}});

/* ═══ CHAT WIDGET v2.0 — Robust Neural Assistant ═══ */
const CHAT_SESSION_KEY='maureonix-chat-session',CHAT_HISTORY_KEY='maureonix-chat-history';
let chatSessionId='',chatHistory=[],isChatOpen=false,audioCtx=null,isAdmin=false;

function initAudio(){try{if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}
function playSound(type){if(!audioCtx)return;try{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.frequency.value=type==='send'?880:type==='receive'?660:440;gain.gain.value=type==='send'?0.025:type==='receive'?0.02:0.015;osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+0.06);}catch(e){}}
function generateSessionId(){return'sess_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);}

function initChatSession(){
  try{
    chatSessionId=localStorage.getItem(CHAT_SESSION_KEY)||generateSessionId();
    localStorage.setItem(CHAT_SESSION_KEY,chatSessionId);
    const raw=localStorage.getItem(CHAT_HISTORY_KEY);
    chatHistory=raw?JSON.parse(raw):[];
    renderChatHistory();
    if(!chatHistory.length){
      const greeting=isAdmin?'Welcome back, **Administrator**. I am MAUREONIX. I can navigate, research, verify numbers, and execute commands for you.':'Welcome to the **Neural Command Center**.\\n\\nI am MAUREONIX. Ask me about commands, pairing, or anything.';
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

function parseIntent(text){
  const lower=text.toLowerCase();
  const intents=[];
  if(/scroll to|go to|navigate to|show me|take me to|open|jump to/.test(lower)){
    if(/pair|connect|link|code|whatsapp/.test(lower))intents.push({type:'scrollTo',target:'pairing'});
    else if(/feature|module|command|capability/.test(lower))intents.push({type:'scrollTo',target:'features'});
    else if(/terminal|quote|wisdom/.test(lower))intents.push({type:'scrollTo',target:'mainContent'});
    else if(/stat|metric|number|count/.test(lower))intents.push({type:'scrollTo',target:'stats'});
    else intents.push({type:'scrollTo',target:'mainContent'});
  }
  if(/click|press|tap|hit|activate/.test(lower)){
    if(/init|connect|start|begin|pair/.test(lower))intents.push({type:'click',target:'btnInitConnect'});
    else if(/explore|feature|discover/.test(lower))intents.push({type:'click',target:'btnExplore'});
    else if(/feedback|rate|review|star/.test(lower))intents.push({type:'click',target:'feedbackToggle'});
  }
  const phoneMatch=text.match(/(?:\+?254|0)?\d{9,12}/);
  if(phoneMatch){
    const num=phoneMatch[0].replace(/^0/,'254').replace(/^\+/,'');
    if(/verify|check|validate|confirm|is.*correct/.test(lower))intents.push({type:'verifyPhone',number:num});
    else if(/pair|code|link|connect.*number/.test(lower))intents.push({type:'requestPair',number:num});
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
    default:return false;
  }
}

async function sendChatMessage(){
  try{initAudio();}catch(e){}
  const ta=$('#chatInput'),btn=$('#chatSend');
  const text=ta.value.trim();if(!text)return;
  ta.value='';autoResize(ta);checkChips();
  appendChatBubble('user',text,Date.now(),true);playSound('send');
  $('#chatTyping').style.display='flex';btn.disabled=true;

  const intents=parseIntent(text);
  let intentHandled=false;
  let intentResponse=[];
  for(const intent of intents){
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
  try{initAudio();}catch(e){}
  const panel=$('#chatPanel'),btn=$('#chatToggle');
  if(!panel||!btn)return;
  isChatOpen=!isChatOpen;
  panel.style.display=isChatOpen?'flex':'none';
  panel.setAttribute('aria-hidden',String(!isChatOpen));
  btn.setAttribute('aria-expanded',String(isChatOpen));
  if(isChatOpen){
    const inp=$('#chatInput');if(inp)inp.focus();
    scrollChatToBottom();
    try{adjustChatForViewport();}catch(e){}
  }
}
function adjustChatForViewport(){
  const panel=$('#chatPanel');
  if(!panel||panel.style.display!=='flex')return;
  if(window.visualViewport){
    const vv=window.visualViewport;
    panel.style.height=Math.min(600,vv.height-130)+'px';
    panel.style.maxHeight=Math.min(600,vv.height-130)+'px';
    panel.style.bottom=(window.innerHeight-vv.height+90)+'px';
  }
}
if(window.visualViewport){
  window.visualViewport.addEventListener('resize',adjustChatForViewport);
  window.visualViewport.addEventListener('scroll',adjustChatForViewport);
}

// Rating Popup Logic
let popupRating=0;
function showRatingPopup(){const overlay=$('#ratingPopupOverlay');if(overlay)overlay.classList.add('active');}
function dismissRating(){const overlay=$('#ratingPopupOverlay');if(overlay)overlay.classList.remove('active');localStorage.setItem('maureonix-rating-dismissed','1');}
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
setTimeout(()=>{
  if(!localStorage.getItem('maureonix-rating-submitted')&&!localStorage.getItem('maureonix-rating-dismissed')){
    showRatingPopup();
  }
},90000);
const popupStars=$('#popupStarRating');
if(popupStars){
  popupStars.addEventListener('click',(e)=>{const star=e.target.closest('span');if(star){popupRating=parseInt(star.dataset.value);updatePopupStars();}});
  popupStars.addEventListener('mouseover',(e)=>{const star=e.target.closest('span');if(star)updatePopupStars(parseInt(star.dataset.value));});
  popupStars.addEventListener('mouseleave',()=>updatePopupStars());
}
function updatePopupStars(hoverVal){
  const stars=$$('#popupStarRating span');
  stars.forEach((s,i)=>{const val=i+1;s.classList.toggle('active',val<=popupRating);s.classList.toggle('hovered',hoverVal>0&&val<=hoverVal);});
}

// Feedback modal
function openFeedbackModal(){const fm=document.getElementById('feedbackModal');if(fm)fm.style.display='flex';}
function closeFeedbackModal(){const fm=document.getElementById('feedbackModal');if(fm)fm.style.display='none';}

// Event Listeners
document.addEventListener('click',(e)=>{
  if(e.target.closest('#chatToggle'))toggleChat();
  if(e.target.closest('#chatClose'))toggleChat();
  if(e.target.closest('#chatSend'))sendChatMessage();
  if(e.target.closest('#feedbackToggle'))openFeedbackModal();
  if(e.target.closest('#closeFeedback'))closeFeedbackModal();
  if(e.target.closest('#submitFeedback'))submitFeedback();
  if(e.target.closest('#backToTop'))window.scrollTo({top:0,behavior:prefersReducedMotion?'auto':'smooth'});
  if(e.target.closest('.cat-card'))openDetail(e.target.closest('.cat-card').dataset.id);
  if(e.target.closest('#detailClose'))closeDetail();
  if(e.target.closest('#pairBtn'))getPairCode();
  if(e.target.closest('#audioToggle'))toggleAudio();
});
document.addEventListener('keydown',(e)=>{
  if(e.key==='Escape'){
    const fm=$('#feedbackModal');if(fm&&fm.style.display==='flex'){closeFeedbackModal();return;}
    if(isChatOpen)toggleChat();
    closeDetail();
  }
  if(e.key==='t'||e.key==='T'){const themes=['neural','solar','matrix','abyss','ghost','inferno'];const current=document.documentElement.getAttribute('data-theme')||'neural';setTheme(themes[(themes.indexOf(current)+1)%themes.length]);}
  if(e.key==='m'||e.key==='M')toggleAudio();
});
const phoneInput=$('#phoneInput');if(phoneInput)phoneInput.addEventListener('keydown',(e)=>{if(e.key==='Enter')getPairCode();});

// Admin detection
(function checkAdmin(){
  try{
    if(location.pathname.includes('/admin')||localStorage.getItem('maureonix-admin-secret')){
      isAdmin=true;
    }
  }catch(e){}
})();

// Init
initChatSession();
})();
</script>
</body>
</html>`;
};