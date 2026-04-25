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
  const systemPrompt = `You are Maureonix Neural Assistant, the AI guide for the Maureonix Dashboard. You help users with bot commands, dashboard features, pairing setup, and navigation. Be concise, friendly, and cyberpunk-themed. Use emojis occasionally. You can trigger frontend actions by including a hidden block exactly like this: [ACTION: {"type":"scrollTo","target":"pairing"}]. Available actions: scrollTo(pairing,features,commands,terminal,stats,dashboard), focusInput(phoneInput), openFeedbackForm.`;
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
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
  let text = data.choices?.[0]?.message?.content || 'No response';
  const actions = [];
  const actionRegex = /\[ACTION:\s*(\{.*?\})\]/gs;
  text = text.replace(actionRegex, (match, jsonStr) => {
    try { actions.push(JSON.parse(jsonStr)); } catch {}
    return '';
  }).trim();
  history.push({ role: 'user', content: message });
  history.push({ role: 'assistant', content: text });
  if (history.length > AI_SESSION_MAX * 2) history.splice(0, history.length - AI_SESSION_MAX * 2);
  return { text, actions };
}

module.exports = { dashboardAiChat };