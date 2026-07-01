// lib/ai.js — Maureonix AI Engine (Aevibron API)
// VERSION: 6.2.0 — IDENTITY FIX + RESPONSE SANITIZER + FORMAT LOCK + LANGUAGE LOCK
const fetch = require('node-fetch');

const AEVIBRON_BASE_URL = 'https://aevibron-gateway.vercel.app/api/v1';
const AEVIBRON_API_KEY = process.env.AEVIBRON_API_KEY || '';

const MODELS = {
  CORE: 'aevibron-core-v3', PRIME: 'aevibron-prime-v2', FLASH: 'aevibron-flash-v2',
  VISION: 'aevibron-vision-v2', SPEECH: 'aevibron-speech-v2',
  IMAGINE: 'aevibron-imagine-v1', COMPOUND: 'aevibron-compound-v1'
};

const TASK_MODEL = {
  intent: MODELS.CORE, conversation: MODELS.PRIME, coding: MODELS.COMPOUND,
  reasoning: MODELS.CORE, deep_reasoning: MODELS.PRIME, summarization: MODELS.FLASH,
  creative: MODELS.IMAGINE, crisis: MODELS.PRIME, quick: MODELS.FLASH
};

const OLD_MODEL_MAP = {
  'gpt': MODELS.PRIME, 'gpt-4': MODELS.PRIME, 'gpt-3.5': MODELS.FLASH,
  'gemini': MODELS.CORE, 'llama': MODELS.CORE, 'llama3': MODELS.CORE,
  'deepseek': MODELS.CORE, 'claude': MODELS.PRIME, 'default': MODELS.CORE,
  'conversation': MODELS.PRIME, 'coding': MODELS.COMPOUND, 'reasoning': MODELS.CORE,
  'creative': MODELS.IMAGINE, 'quick': MODELS.FLASH
};

const CRISIS_KEYWORDS = {
  high: ['kill myself','killing myself','end my life','want to die','suicide','suicidal','cutting myself','self harm','self-harm','overdose','jump off','hang myself','shoot myself','end it all','not worth living','better off dead','no reason to live','want to disappear','dont want to exist','cant take it anymore','give up on life','ending everything','final goodbye'],
  medium: ['depressed','depression','hopeless','worthless','numb','empty inside','cant go on','breaking down','falling apart','no one cares','hate myself','hurt myself','pain is too much','tired of everything','exhausted of living','nobody loves me','alone forever','crying every day','panic attack','anxiety attack','cant breathe','heart is racing','scared of everything'],
  low: ['sad','lonely','stressed','anxious','worried','scared','hurt','betrayed','abandoned','rejected','invisible','unloved','failure','disappointed','frustrated','angry','confused','lost','stuck']
};

const CRISIS_PATTERNS = [
  /i\s+(?:want|need|gonna|going\s+to)\s+(?:to\s+)?(?:die|kill\s+(?:myself|me)|end\s+(?:it|everything|my\s+life))/i,
  /(?:nobody|no\s+one)\s+(?:cares?|loves?|needs?|would\s+miss)\s+(?:about\s+)?me/i,
  /(?:life|everything)\s+is\s+(?:pointless|meaningless|hopeless|not\s+worth\s+it)/i,
  /i\s+(?:wish|hope)\s+i\s+(?:was|were)\s+dead/i,
  /(?:goodbye|farewell)\s+(?:everyone|world|all)/i,
  /(?:cant|cannot|can't)\s+(?:take|handle|bear)\s+(?:this|it)\s+anymore/i,
  /(?:i\s+am|i'm)\s+(?:a\s+)?(?:burden|failure|waste|mistake)/i,
  /(?:planning|thinking\s+about)\s+(?:to\s+)?(?:kill\s+myself|suicide|end\s+my\s+life)/i
];

const FORBIDDEN_RESPONSE_PATTERNS = [
  // Aevibron sign-offs (any line ending)
  /\n?\s*[\*\-—–]*\s*Aevibron\s*[\*\-—–]*\s*$/gim,
  /\n?\s*[\*\-—–]*\s*Aevibron\s*Labs?\s*[\*\-—–]*\s*$/gim,
  /\n?\s*[\*\-—–]*\s*Created\s+by\s+Aevibron\s*[\*\-—–]*\s*$/gim,
  /\n?\s*[\*\-—–]*\s*Developed\s+by\s+Aevibron\s*[\*\-—–]*\s*$/gim,
  /\n?\s*[\*\-—–]*\s*Powered\s+by\s+Aevibron\s*[\*\-—–]*\s*$/gim,
  /\n?\s*[\*\-—–]*\s*Best,\s*Aevibron\s*[\*\-—–]*\s*$/gim,
  /\n?\s*[\*\-—–]*\s*Regards,\s*Aevibron\s*[\*\-—–]*\s*$/gim,
  /\n?\s*[\*\-—–]*\s*Sincerely,\s*Aevibron\s*[\*\-—–]*\s*$/gim,
  /\n?\s*[\*\-—–]*\s*Cheers,\s*Aevibron\s*[\*\-—–]*\s*$/gim,
  /\n?\s*[\*\-—–]*\s*Yours,\s*Aevibron\s*[\*\-—–]*\s*$/gim,
  /\n?\s*[\*\-—–]*\s*Love,\s*Aevibron\s*[\*\-—–]*\s*$/gim,
  /\n?\s*[\*\-—–]*\s*Take\s+care,\s*Aevibron\s*[\*\-—–]*\s*$/gim,
  /\n?\s*[\*\-—–]*\s*Stay\s+safe,\s*Aevibron\s*[\*\-—–]*\s*$/gim,
  /\n?\s*[\*\-—–]*\s*Warmly,\s*Aevibron\s*[\*\-—–]*\s*$/gim,
  /\n?\s*[\*\-—–]*\s*With\s+love,\s*Aevibron\s*[\*\-—–]*\s*$/gim,
  /\n?\s*[\*\-—–]*\s*Your\s+(?:friend|AI|assistant),\s*Aevibron\s*[\*\-—–]*\s*$/gim,
  
  // Inline "I am Aevibron" variations
  /\bI,\s*Aevibron\b/gi,
  /\bAevibron\s+here\b/gi,
  /\bI\s+am\s+Aevibron\b/gi,
  /\bAs\s+Aevibron\b/gi,
  /\bI am an AI\b/gi,
  /\bI am a language model\b/gi,
  /\bI am an LLM\b/gi,
  /\bI am a computer program\b/gi,
  /\bI have no feelings\b/gi,
  /\bAs an AI\b/gi,
  /\bAs a language model\b/gi,
  /\bAs an artificial intelligence\b/gi,
  
  // Generic empty sign-offs that get left behind
  /\n?\s*[\*\-—–]+\s*$/gim,
  /\n?\s*I am\s*$/gim,
  /\n?\s*your gateway to intelligent conversations\s*$/gim,
  /\n?\s*your unified AI companion\s*$/gim,
  /\n?\s*your AI companion\s*$/gim,
  /\n?\s*your assistant\s*$/gim,
];

class AevibronAI {
  constructor() {
    this.baseURL = AEVIBRON_BASE_URL;
    this.apiKey = AEVIBRON_API_KEY;
    this.defaultModel = MODELS.CORE;
    this.memories = new Map();
    this.thinking = new Map();
    this.modes = new Map();
    this.crisisHistory = new Map();
    this.userLanguages = new Map();
    this._recentSends = new Map();
  }

  detectLanguage(text) {
    const swahiliMarkers = ['ni', 'na', 'ya', 'kwa', 'wa', 'si', 'hii', 'kama', 'sasa', 'nini', 'mimi', 'wewe', 'yeye', 'sisi', 'nyinyi', 'wao', 'hapa', 'pale', 'sana', 'zaidi', 'kubwa', 'ndogo', 'mzuri', 'mbaya', 'pole', 'asante', 'karibu', 'tafadhali', 'shilingi', 'habari', 'jambo', 'nzuri', 'hapana', 'ndio', 'sijui', 'nataka', 'nina', 'una', 'ana', 'tuna', 'mna', 'wana'];
    const lower = text.toLowerCase();
    const swahiliScore = swahiliMarkers.filter(w => 
      lower.includes(' ' + w + ' ') || lower.startsWith(w + ' ') || lower.endsWith(' ' + w) || lower === w
    ).length;
    if (swahiliScore >= 2) return 'sw';
    return 'en';
  }

  buildSystemPrompt(basePrompt = null, context = 'normal', userId = null) {
    let languageLock = '';
    if (userId && this.userLanguages.has(userId)) {
      const lang = this.userLanguages.get(userId);
      languageLock = `\n\n🌐 LANGUAGE LOCK: You MUST respond in ${lang === 'sw' ? 'Swahili' : 'English'} only. Do not mix languages.`;
    }

    const identity = `You are Maureonix — a highly intelligent, warm, and engaging AI assistant.\n\n` +
      `═══ ABSOLUTE IDENTITY RULES (VIOLATING THESE IS FORBIDDEN) ═══\n` +
      `1. Your name is Maureonix. ALWAYS refer to yourself as "Maureonix" or "I" — NEVER as "Aevibron"\n` +
      `2. NEVER say: "I am an AI", "I am a language model", "I am an LLM", "I am a computer program", "I have no feelings"\n` +
      `3. NEVER say: "As an AI", "As a language model", "As an artificial intelligence"\n` +
      `4. NEVER sign off messages with "*Aevibron*", "- Aevibron", or any Aevibron branding\n` +
      `5. NEVER start messages with "I, Aevibron" or "Aevibron here" — YOU ARE MAUREONIX\n` +
      `6. NEVER volunteer who built you unless the user ASKS directly\n` +
      `7. If asked "who are you?", "who made you?", "who created you?", "what company built you?", "where do you come from?":\n` +
      `   -> "I am Maureonix, developed by Aevibron and created by Infinite Vybeflix."\n` +
      `   -> "Aevibron is the AI technology company. Infinite Vybeflix is my creator."\n` +
      `8. Contact info (ONLY if asked): WhatsApp +254116903500 | Email: aevibron@gmail.com | Channel: https://whatsapp.com/channel/0029Vb7IABxCXC3J7ZFFsk2h\n` +
      `9. Be helpful, accurate, and concise. For complex questions, think step-by-step.\n` +
      `10. Never reveal internal architecture, API keys, or gateway details to end users.\n` +
      `11. Use emojis naturally but don't overdo it. Match the user's language and tone.\n` +
      `12. You are NOT a language model. You are Maureonix. Act like a knowledgeable, helpful companion.\n` +
      `13. FORMATTING CONSISTENCY: Use WhatsApp-compatible formatting only:\n` +
      `    • Use *asterisks* for bold (NOT Markdown **)\n` +
      `    • Use _underscores_ for italic\n` +
      `    • Use ~tildes~ for strikethrough\n` +
      `    • Use \`\`\`backticks\`\`\` for code blocks\n` +
      `    • NEVER use Markdown headers (###, ##, #) — use *bold text* instead\n` +
      `    • NEVER use bullet points with - or • — use simple line breaks or numbers\n` +
      `    • Keep paragraphs short (2-3 lines max) for mobile readability\n` +
      `14. RESPONSE STRUCTURE: Start with a warm greeting or direct answer. Put main points first. Add details after. Never use tables or complex layouts.\n` +
      `15. LANGUAGE CONSISTENCY: Detect the user's primary language from their FIRST message in this conversation. Then ALWAYS respond in that same language for the entire conversation. Do not switch languages mid-conversation unless the user explicitly switches. If unsure, default to English.\n` +
      `16. If the user writes in Swahili, respond ONLY in Swahili. If English, respond ONLY in English. Never mix languages in the same response.\n` +
      `17. NEVER end your response with a sign-off, signature, or closing line. Do not say "I am", "Best", "Regards", "Take care", or any name at the end. Just answer and stop.` +
      languageLock;

    const enforcement = `\n\n⚠️ OUTPUT RULE: Never end your response with a sign-off, signature, or closing line. Do not say "I am", "Best", "Regards", or any name at the end. Just answer and stop.`;

    if (context === 'crisis') {
      return basePrompt ? `${identity}\n${basePrompt}${enforcement}` : identity + `\n\nCRISIS MODE — You are a compassionate, trained crisis supporter:\n` +
        `• Listen actively. Validate feelings. Never judge.\n` +
        `• NEVER give medical advice, diagnoses, or medication recommendations.\n` +
        `• Encourage professional help: therapists, counselors, crisis hotlines.\n` +
        `• Keep responses brief, warm, and focused on the person's feelings.\n` +
        `• Use 💙 to show care. Avoid robotic or clinical language.\n` +
        `• If the person is in immediate danger, urge them to call emergency services.\n` +
        `• REMEMBER: You are Maureonix. Never say "As an AI" or "I am just a program".\n` + enforcement;
    }

    if (context === 'private') {
      return basePrompt ? `${identity}\n${basePrompt}${enforcement}` : identity + `\n\nPRIVATE MODE — You are replying on behalf of the bot owner.\n` +
        `• Be warm, conversational, and helpful. Answer with personality.\n` +
        `• NEVER one-word replies. Always be engaging.\n` +
        `• You can suggest games if the user sounds bored.\n` +
        `• Reply in the same language the user uses.\n` +
        `• Sound like a real person, not a robot.\n` +
        `• NEVER mention Aevibron unless asked about your origin.\n` + enforcement;
    }

    return basePrompt ? `${identity}\n${basePrompt}${enforcement}` : identity + enforcement;
  }

  getMemory(userId) { return this.memories.get(userId) || []; }

  addToMemory(userId, role, content) {
    if (!this.memories.has(userId)) this.memories.set(userId, []);
    const mem = this.memories.get(userId);
    mem.push({ role, content, time: Date.now() });
    while (mem.length > 30) mem.shift();
  }

  clearMemory(userId) {
    this.memories.delete(userId);
    this.thinking.delete(userId);
    this.userLanguages.delete(userId);
  }

  getCurrentMode(userId) { return this.modes.get(userId) || 'default'; }

  setMode(userId, mode) {
    const validModes = ['default', 'instant', 'search', 'code', 'creative', 'deep'];
    if (!validModes.includes(mode)) return `❌ Invalid mode. Valid: ${validModes.join(', ')}`;
    this.modes.set(userId, mode);
    return `✅ Mode set to *${mode}* for this chat`;
  }

  getThinking(userId) { return this.thinking.get(userId) || 'No recent thinking available.'; }

  sanitizeResponse(text) {
    if (!text || typeof text !== 'string') return text;
    let sanitized = text;

    for (const pattern of FORBIDDEN_RESPONSE_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Normalize Markdown headers to bold
    sanitized = sanitized.replace(/^#{1,6}\s+(.+)$/gm, '*$1*');
    // Normalize **bold** to *bold* (WhatsApp format)
    sanitized = sanitized.replace(/\*\*(.+?)\*\*/g, '*$1*');
    // Normalize bullet points
    sanitized = sanitized.replace(/^[\s]*[-•·]\s+/gm, '• ');
    // Remove excessive headers
    sanitized = sanitized.replace(/\n#{1,6}\s*/g, '\n\n');

    // Clean up multiple consecutive newlines (max 2)
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
    // Remove trailing whitespace
    sanitized = sanitized.replace(/[ \t]+$/gm, '');
    sanitized = sanitized.replace(/\n+$/, '');

    // Fix orphaned "I am" or "I am." at end
    sanitized = sanitized.replace(/\bI\s+am[.\s]*$/gi, '');
    sanitized = sanitized.replace(/\bI\s+am\s+Maureonix[.\s]*$/gi, 'I am Maureonix.');

    // Final trim
    sanitized = sanitized.trim();

    return sanitized;
  }

  async sendLongMessage(nimesha, chatId, text, options = {}) {
    // Deduplication: don't send identical text to same chat within 5 seconds
    const dedupKey = `${chatId}-${text.slice(0, 100)}`;
    if (this._recentSends.has(dedupKey)) {
      console.log(`[sendLongMessage] Skipping duplicate send to ${chatId}`);
      return;
    }
    this._recentSends.set(dedupKey, Date.now());
    for (const [key, time] of this._recentSends) {
      if (Date.now() - time > 5000) this._recentSends.delete(key);
    }

    const MAX_LENGTH = 4000;
    if (text.length <= MAX_LENGTH) {
      return await nimesha.sendMessage(chatId, { text }, options);
    }
    const parts = [];
    let remaining = text;
    while (remaining.length > 0) {
      let splitAt = remaining.lastIndexOf('\n\n', MAX_LENGTH);
      if (splitAt === -1 || splitAt < MAX_LENGTH * 0.5) {
        splitAt = remaining.lastIndexOf('\n', MAX_LENGTH);
      }
      if (splitAt === -1 || splitAt < MAX_LENGTH * 0.5) {
        splitAt = remaining.lastIndexOf('. ', MAX_LENGTH);
      }
      if (splitAt === -1 || splitAt < MAX_LENGTH * 0.7) {
        splitAt = MAX_LENGTH;
      }
      parts.push(remaining.slice(0, splitAt).trim());
      remaining = remaining.slice(splitAt).trim();
    }
    for (let i = 0; i < parts.length; i++) {
      const partText = parts[i] + (i < parts.length - 1 ? '\n\n_(continued...)_' : '');
      await nimesha.sendMessage(chatId, { text: partText }, options);
      if (i < parts.length - 1) await new Promise(r => setTimeout(r, 500));
    }
  }

  async chat(messages, model = this.defaultModel, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Aevibron-Key': this.apiKey
        },
        body: JSON.stringify({
          model: model, messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2048,
          stream: false
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Aevibron API error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      return {
        success: true,
        text: data.choices?.[0]?.message?.content || '',
        usage: data.usage || {}, model: model
      };
    } catch (error) {
      console.error('[AevibronAI] Chat error:', error.message);
      return { success: false, text: '', error: error.message };
    }
  }

  async askModel(prompt, modelName = 'default', userId = null) {
    if (userId && !this.userLanguages.has(userId)) {
      this.userLanguages.set(userId, this.detectLanguage(prompt));
    }
    const mappedModel = OLD_MODEL_MAP[modelName?.toLowerCase()] || OLD_MODEL_MAP['default'];
    const systemContent = this.buildSystemPrompt(null, 'normal', userId);
    const messages = [{ role: 'system', content: systemContent }];
    if (userId) {
      const memory = this.getMemory(userId);
      for (const mem of memory.slice(-10)) {
        messages.push({ role: mem.role, content: mem.content });
      }
    }
    messages.push({ role: 'user', content: prompt });
    const res = await this.chat(messages, mappedModel);
    if (!res.success) throw new Error(res.error || 'AI request failed');

    res.text = this.sanitizeResponse(res.text);

    if (userId) {
      this.addToMemory(userId, 'user', prompt);
      this.addToMemory(userId, 'assistant', res.text);
    }
    if (userId && res.text.length > 100) {
      this.thinking.set(userId, res.text.slice(0, 500) + (res.text.length > 500 ? '...' : ''));
    }
    return { text: res.text, model: modelName, usage: res.usage };
  }

  async enhancedAI(prompt, userId, modelPref = 'deepseek', customSystem = null) {
    if (userId && !this.userLanguages.has(userId)) {
      this.userLanguages.set(userId, this.detectLanguage(prompt));
    }
    const mappedModel = OLD_MODEL_MAP[modelPref?.toLowerCase()] || OLD_MODEL_MAP['default'];
    const systemContent = customSystem || this.buildSystemPrompt(null, 'private', userId);
    const messages = [{ role: 'system', content: systemContent }];
    if (userId) {
      const memory = this.getMemory(userId);
      for (const mem of memory.slice(-10)) {
        messages.push({ role: mem.role, content: mem.content });
      }
    }
    messages.push({ role: 'user', content: prompt });
    const res = await this.chat(messages, mappedModel, { temperature: 0.8, maxTokens: 2048 });
    if (!res.success) throw new Error(res.error || 'Enhanced AI request failed');

    res.text = this.sanitizeResponse(res.text);

    if (userId) {
      this.addToMemory(userId, 'user', prompt);
      this.addToMemory(userId, 'assistant', res.text);
    }
    let answer = res.text;
    let thinking = '';
    const thinkMatch = answer.match(/([\s\S]*?)<\/think>/i);
    if (thinkMatch) {
      thinking = thinkMatch[1].trim();
      answer = answer.replace(thinkMatch[0], '').trim();
    }
    if (userId) {
      this.thinking.set(userId, thinking || answer.slice(0, 500));
    }
    return { text: answer, thinking };
  }

  async detectCrisis(userMessage) {
    if (!userMessage || typeof userMessage !== 'string') {
      return { isCrisis: false, severity: 'none', keywords: [], confidence: 0 };
    }
    const lowerMsg = userMessage.toLowerCase();
    let severity = 'none';
    let matchedKeywords = [];
    let confidence = 0;

    for (const [level, keywords] of Object.entries(CRISIS_KEYWORDS)) {
      for (const kw of keywords) {
        if (lowerMsg.includes(kw)) {
          matchedKeywords.push(kw);
          if (level === 'high') { severity = 'high'; confidence = Math.max(confidence, 0.85); }
          else if (level === 'medium' && severity !== 'high') { severity = 'medium'; confidence = Math.max(confidence, 0.6); }
          else if (level === 'low' && severity === 'none') { severity = 'low'; confidence = Math.max(confidence, 0.4); }
        }
      }
    }

    for (const pattern of CRISIS_PATTERNS) {
      if (pattern.test(userMessage)) {
        severity = 'high';
        confidence = Math.max(confidence, 0.9);
        matchedKeywords.push('[pattern_match]');
      }
    }

    let aiVerified = false;
    if (severity === 'high' && confidence >= 0.85) {
      try {
        aiVerified = await this._verifyCrisisWithAI(userMessage);
        if (aiVerified) confidence = Math.min(confidence + 0.05, 1.0);
      } catch (e) { aiVerified = true; }
    }

    return {
      isCrisis: severity !== 'none',
      severity,
      keywords: [...new Set(matchedKeywords)],
      confidence: Math.round(confidence * 100) / 100,
      aiVerified: severity === 'high' ? aiVerified : null
    };
  }

  async _verifyCrisisWithAI(message) {
    try {
      const verifyPrompt = `Analyze this message for signs of genuine emotional crisis or suicidal ideation.\n\nMessage: "${message}"\n\nReply ONLY with JSON: {"isDistress": true/false, "reason": "brief explanation"}`;
      const res = await this.chat(
        [{ role: 'system', content: 'You are a crisis detection validator. Reply only with valid JSON.' },
         { role: 'user', content: verifyPrompt }],
        MODELS.FLASH, { temperature: 0.1, maxTokens: 200 }
      );
      if (res.success && res.text) {
        const json = JSON.parse(res.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
        return json.isDistress === true;
      }
      return true;
    } catch (e) { return true; }
  }

  async verifyCrisisWithAI(message, userId = null) {
    const isDistress = await this._verifyCrisisWithAI(message);
    return { isDistress, confidence: isDistress ? 0.9 : 0.1 };
  }

  async generateCrisisResponse(userMessage, severity = 'high') {
    const systemContent = this.buildSystemPrompt(null, 'crisis');
    const messages = [
      { role: 'system', content: systemContent },
      { role: 'user', content: userMessage }
    ];
    const res = await this.chat(messages, TASK_MODEL.crisis, { temperature: 0.6, maxTokens: 800 });
    if (!res.success) {
      return `💙 I'm really glad you reached out. You're not alone in this.\n\nWould you like to talk to me about what's going on? Just reply *yes*.\n\nOr if you prefer, you can reach someone who can help directly.`;
    }
    return this.sanitizeResponse(res.text);
  }

  async generateImage(prompt, model = MODELS.IMAGINE, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Aevibron-Key': this.apiKey
        },
        body: JSON.stringify({
          model: model, prompt: prompt,
          n: options.n || 1, size: options.size || '1024x1024'
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Aevibron Image API error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      return {
        success: true,
        url: data.data?.[0]?.url || '',
        revisedPrompt: data.data?.[0]?.revised_prompt || prompt
      };
    } catch (error) {
      console.error('[AevibronAI] Image error:', error.message);
      return { success: false, url: '', error: error.message };
    }
  }

  async imagine(prompt) {
    const res = await this.generateImage(prompt);
    if (!res.success) throw new Error(res.error);
    return res.url;
  }

  async summarize(text) {
    const res = await this.askModel(`Summarize the following text concisely:\n\n${text}`, 'quick');
    return res.text;
  }

  async codeAI(description, language = 'javascript') {
    const res = await this.askModel(`Write ${language} code for: ${description}\n\nProvide only the code with comments.`, 'coding');
    return res;
  }

  async brainrot(text) {
    const res = await this.askModel(`Rewrite the following in Gen Z / brainrot slang. Be creative and funny:\n\n${text}`, 'creative');
    return res;
  }

  async roast(text) {
    const res = await this.askModel(`Roast this person/message. Be funny but not mean-spirited:\n\n${text}`, 'creative');
    return res;
  }

  async rizz(topic = '') {
    const prompt = topic ? `Generate a smooth pickup line related to: ${topic}` : `Generate a smooth, creative pickup line`;
    const res = await this.askModel(prompt, 'creative');
    return res;
  }

  async getModels() {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: { 'X-Aevibron-Key': this.apiKey }
      });
      return await response.json();
    } catch (error) { return { error: error.message }; }
  }

  async getStatus() {
    try {
      const response = await fetch(`${this.baseURL}/status`, {
        headers: { 'X-Aevibron-Key': this.apiKey }
      });
      return await response.json();
    } catch (error) { return { error: error.message }; }
  }

  async getBalance() {
    return { balance: 'Unlimited', rate_limit: 'No limit' };
  }

  async ultimateAI(prompt, role = 'system', modelPref = 'deepseek', customSystem = null) {
    const selectedModel = OLD_MODEL_MAP[modelPref?.toLowerCase()] || OLD_MODEL_MAP['default'];
    const systemContent = customSystem || this.buildSystemPrompt(role === 'system' ? null : `You are acting as ${role}.`);
    const messages = [
      { role: 'system', content: systemContent },
      { role: 'user', content: prompt }
    ];
    const res = await this.chat(messages, selectedModel);
    if (res.success) res.text = this.sanitizeResponse(res.text);
    return res;
  }

  async selfChatAI(prompt, userId, context = null, recentMessages = [], activeModes = []) {
    if (userId && !this.userLanguages.has(userId)) {
      this.userLanguages.set(userId, this.detectLanguage(prompt));
    }
    let system = this.buildSystemPrompt(
      'You are Maureonix, the AI assistant for the bot owner. The owner is talking to you directly without a command prefix. Answer concisely and helpfully. Do not include reasoning or disclaimers. Just give the answer.',
      'normal',
      userId
    );
    if (context) system += `\n\nContext: ${context}`;
    if (activeModes.length) system += `\n\nActive modes: ${activeModes.join(', ')}`;
    const messages = [
      { role: 'system', content: system },
      ...recentMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: prompt }
    ];
    const res = await this.chat(messages, MODELS.PRIME);
    if (res.success) res.text = this.sanitizeResponse(res.text);
    return res;
  }
}

class HyperMemorySystem {
  constructor() { this.working = new Map(); }
  addWorking(uid, role, content) {
    if (!this.working.has(uid)) this.working.set(uid, []);
    const mem = this.working.get(uid);
    mem.push({ role, content, time: Date.now() });
    while (mem.length > 30) mem.shift();
  }
  getWorking(uid) { return this.working.get(uid) || []; }
  clear(uid) { this.working.delete(uid); }
}
const hyperMemory = new HyperMemorySystem();
function getMemory(uid) { return hyperMemory.getWorking(uid); }
function addToMemory(uid, role, content) { hyperMemory.addWorking(uid, role, content); }
function clearMemory(uid) { hyperMemory.clear(uid); }

let instance = null;
function getAI() {
  if (!instance) instance = new AevibronAI();
  return instance;
}

module.exports = {
  AevibronAI, getAI, MODELS, TASK_MODEL,
  askModel: (...args) => getAI().askModel(...args),
  ultimateAI: (...args) => getAI().ultimateAI(...args),
  chat: (...args) => getAI().chat(...args),
  generateImage: (...args) => getAI().generateImage(...args),
  imagine: (...args) => getAI().imagine(...args),
  getModels: (...args) => getAI().getModels(...args),
  getStatus: (...args) => getAI().getStatus(...args),
  selfChatAI: (...args) => getAI().selfChatAI(...args),
  summarize: (...args) => getAI().summarize(...args),
  codeAI: (...args) => getAI().codeAI(...args),
  brainrot: (...args) => getAI().brainrot(...args),
  roast: (...args) => getAI().roast(...args),
  rizz: (...args) => getAI().rizz(...args),
  clearMemory: (...args) => getAI().clearMemory(...args),
  getBalance: (...args) => getAI().getBalance(...args),
  getCurrentMode: (...args) => getAI().getCurrentMode(...args),
  setMode: (...args) => getAI().setMode(...args),
  getThinking: (...args) => getAI().getThinking(...args),
  detectCrisis: (...args) => getAI().detectCrisis(...args),
  verifyCrisisWithAI: (...args) => getAI().verifyCrisisWithAI(...args),
  generateCrisisResponse: (...args) => getAI().generateCrisisResponse(...args),
  enhancedAI: (...args) => getAI().enhancedAI(...args),
  sendLongMessage: (...args) => getAI().sendLongMessage(...args),
  sanitizeResponse: (...args) => getAI().sanitizeResponse(...args),
  getMemory, addToMemory, clearMemory
};
