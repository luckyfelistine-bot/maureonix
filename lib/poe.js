const fetch = require('node-fetch');

const POE_BASE = 'https://api.poe.com/v1';
const HEADERS = (key) => ({
  'Authorization': `Bearer ${key}`,
  'Content-Type': 'application/json'
});

class PoeAPI {
  constructor(apiKey = global.poeApiKey) {
    this.apiKey = apiKey;
    this.baseURL = POE_BASE;
  }

  async chatCompletion(messages, model = 'Claude-Opus-4.6', opts = {}) {
    const res = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: HEADERS(this.apiKey),
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.max_tokens ?? 4096,
        stream: false,
        ...opts
      })
    });
    if (!res.ok) throw new Error(`PoeHTTP ${res.status}: ${await res.text()}`);
    return await res.json();
  }

  async generateImage(prompt, model = 'Imagen-4', n = 1, size = '1024x1024') {
    const res = await fetch(`${this.baseURL}/images/generations`, {
      method: 'POST',
      headers: HEADERS(this.apiKey),
      body: JSON.stringify({ prompt, model, n, size })
    });
    if (!res.ok) throw new Error(`PoeImageHTTP ${res.status}`);
    return await res.json();
  }

  async getBalance() {
    const res = await fetch(`${this.baseURL}/usage/current_balance`, {
      headers: HEADERS(this.apiKey)
    });
    return await res.json();
  }
}

module.exports = new PoeAPI();