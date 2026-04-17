const fetch = require('node-fetch');
const Poe = require('./poe');

const AI_MEMORY = new Map(); // context memory

async function poeChat(prompt, model = 'Claude-Opus-4.6', userId = 'global') {
  try {
    if (!AI_MEMORY.has(userId)) AI_MEMORY.set(userId, []);
    const history = AI_MEMORY.get(userId);
    history.push({ role: 'user', content: prompt });
    if (history.length > 20) history.shift();
    
    const res = await Poe.chatCompletion(history, model);
    const text = res.choices?.[0]?.message?.content || 'No response';
    history.push({ role: 'assistant', content: text });
    return text;
  } catch (e) {
    throw new Error(`POE: ${e.message}`);
  }
}

async function chatGPT(prompt) {
  try {
    const res = await fetch('https://api.airiapi.xyz/api/gpt4', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model: 'gpt-4o' })
    });
    const data = await res.json();
    return data.response || data.message || 'No response';
  } catch (e) { throw new Error(`GPT: ${e.message}`); }
}

async function gemini(prompt) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${global.geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
  } catch (e) { throw new Error(`Gemini: ${e.message}`); }
}

async function llama3(prompt) {
  try {
    const res = await fetch('https://api.llama-api.com/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${global.llamaKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3-70b', messages: [{ role: 'user', content: prompt }] })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response';
  } catch (e) { throw new Error(`Llama: ${e.message}`); }
}

async function deepseek(prompt) {
  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${global.deepseekKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }] })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response';
  } catch (e) { throw new Error(`DeepSeek: ${e.message}`); }
}

// ─── ULTIMATE FALLBACK CHAIN ────────────────────────
async function ultimateAI(prompt, userId, preferred = 'poe') {
  const providers = {
    poe: () => poeChat(prompt, 'Claude-Opus-4.6', userId),
    gpt: () => chatGPT(prompt),
    gemini: () => gemini(prompt),
    deepseek: () => deepseek(prompt),
    llama: () => llama3(prompt)
  };
  
  const order = preferred === 'poe' 
    ? ['poe', 'deepseek', 'gpt', 'gemini', 'llama']
    : ['deepseek', 'gpt', 'gemini', 'llama', 'poe'];

  let lastErr = '';
  for (const provider of order) {
    try {
      const result = await providers[provider]();
      if (result && result !== 'No response') return { text: result, provider };
    } catch (e) { lastErr = e.message; continue; }
  }
  return { text: `❌ All AI providers failed. Last error: ${lastErr}`, provider: 'none' };
}

async function imagine(prompt) {
  try {
    // Try POE image generation first
    const res = await Poe.generateImage(prompt, 'FLUX-pro', 1);
    if (res.data?.[0]?.url) return res.data[0].url;
  } catch (e) {
    // Fallback to pollinations
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true`;
  }
}

async function translate(text, targetLang, sourceLang = 'auto') {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
  } catch (e) { return `Translation error: ${e.message}`; }
}

async function summarize(text) {
  return ultimateAI(`Summarize concisely:\n\n${text.substring(0, 4000)}`);
}

async function codeAI(prompt, language = 'javascript') {
  return ultimateAI(`Write ${language} code for: ${prompt}\n\nProvide only the code with comments.`);
}

async function brainrot(text) {
  return ultimateAI(`Convert this text to maximum brainrot zoomer slang: "${text}"`);
}

async function roast(text) {
  return ultimateAI(`Roast this person harshly but comedically: "${text}"`);
}

async function rizz(text) {
  return ultimateAI(`Give a smooth pickup line for this situation: "${text}"`);
}

function clearMemory(userId) {
  AI_MEMORY.delete(userId);
  return true;
}

module.exports = { 
  ultimateAI, poeChat, chatGPT, gemini, llama3, deepseek, 
  imagine, translate, summarize, codeAI, brainrot, roast, rizz,
  clearMemory, AI_MEMORY 
};