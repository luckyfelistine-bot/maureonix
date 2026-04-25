const fetch = require('node-fetch');
const { GROQ_API_KEY, GROQ_BASE, AI_MODEL } = require('../config/constants');

const AI_SESSIONS = new Map();
const AI_SESSION_MAX = 20;

function getAiMemory(sessionId) {
  if (!AI_SESSIONS.has(sessionId)) AI_SESSIONS.set(sessionId, []);
  return AI_SESSIONS.get(sessionId);
}

async function dashboardAiChat(sessionId, message) {
  const history = getAiMemory(sessionId);
  
  const systemPrompt = `You are Maureonix, the AI guide for the Maureonix Dashboard. You help users navigate the dashboard, pair WhatsApp, explore features, and use bot commands.

DASHBOARD SECTIONS:
- "hero" / "top" → Top of page with branding
- "features" / "matrix" → Feature cards with modules (Core Bot, AI, Downloaders, Games, etc.)
- "pairing" / "connect" / "link" → WhatsApp pairing section with phone input
- "terminal" / "quotes" → Terminal with rotating quotes
- "stats" → Statistics bar

AVAILABLE ACTIONS (always include when relevant):
- [SCROLL:features] — scroll to feature matrix
- [SCROLL:pairing] — scroll to WhatsApp pairing
- [SCROLL:terminal] — scroll to terminal section
- [SCROLL:stats] — scroll to stats
- [FOCUS:phoneInput] — focus the pairing phone input
- [OPEN:feedback] — open feedback modal
- [NAVIGATE:top] — scroll to top

RULES:
1. Be concise, friendly, cyberpunk-themed. Use emojis.
2. NEVER give generic tech support ("restart your computer", "check your internet").
3. ALWAYS guide users within Maureonix.
4. If user wants to pair WhatsApp, use [SCROLL:pairing] and explain the 3 steps.
5. If user asks about commands, use [SCROLL:features] and mention they can click cards.
6. If user wants to leave feedback, use [OPEN:feedback].
7. If user is confused, ask what they want to do and offer navigation.
8. Never make up commands that don't exist.

Current user message: "${message}"`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10),
    { role: 'user', content: message }
  ];
  
  const res = await fetch(GROQ_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model: AI_MODEL, messages, temperature: 0.7, max_tokens: 1024 })
  });
  
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
  const data = await res.json();
  let text = data.choices?.[0]?.message?.content || 'Neural link interrupted.';
  
  const actions = [];
  const actionRegex = /\[ACTION:\s*(\{.*?\})\]/gs;
  text = text.replace(actionRegex, (match, jsonStr) => {
    try { actions.push(JSON.parse(jsonStr)); } catch {}
    return '';
  }).trim();
  
  // Also parse shorthand markers
  const scrollRegex = /\[SCROLL:(\w+)\]/g;
  text = text.replace(scrollRegex, (match, target) => {
    actions.push({ type: 'scrollTo', target });
    return '';
  }).trim();
  
  const focusRegex = /\[FOCUS:(\w+)\]/g;
  text = text.replace(focusRegex, (match, target) => {
    actions.push({ type: 'focusInput', target });
    return '';
  }).trim();
  
  const openRegex = /\[OPEN:(\w+)\]/g;
  text = text.replace(openRegex, (match, target) => {
    actions.push({ type: 'openModal', target });
    return '';
  }).trim();
  
  const navRegex = /\[NAVIGATE:(\w+)\]/g;
  text = text.replace(navRegex, (match, target) => {
    actions.push({ type: 'navigate', target });
    return '';
  }).trim();
  
  history.push({ role: 'user', content: message });
  history.push({ role: 'assistant', content: text });
  if (history.length > AI_SESSION_MAX * 2) history.splice(0, history.length - AI_SESSION_MAX * 2);
  
  return { text, actions };
}

module.exports = { dashboardAiChat };