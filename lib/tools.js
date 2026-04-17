const fetch = require('node-fetch');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function weather(city) {
  const r = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
  const d = await r.json();
  const c = d.current_condition[0];
  return `🌤️ *${city}*\n🌡️ ${c.temp_C}°C (feels ${c.FeelsLikeC}°C)\n💧 Humidity: ${c.humidity}%\n💨 Wind: ${c.winddir16Point} ${c.windspeedKmph}km/h\n👁️ Visibility: ${c.visibility}km\n🌅 Sunrise: ${d.weather[0].astronomy[0].sunrise}\n🌇 Sunset: ${d.weather[0].astronomy[0].sunset}`;
}

async function news() {
  const r = await fetch(`https://gnews.io/api/v4/top-headlines?token=YOUR_GNEWS_TOKEN&lang=en`);
  const d = await r.json();
  return d.articles?.slice(0, 5).map((a, i) => `${i+1}. *${a.title}*\n${a.url}`).join('\n\n');
}

async function qr(text) {
  return await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`).then(r => r.buffer());
}

async function shorten(url) {
  const r = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
  return await r.text();
}

async function ipLookup(ip) {
  const r = await fetch(`http://ip-api.com/json/${ip}`);
  const d = await r.json();
  return `📍 *IP Lookup*\n🏳️ Country: ${d.country}\n🏙️ City: ${d.city}\n🏢 ISP: ${d.isp}\n🌐 Org: ${d.org}\n📡 AS: ${d.as}`;
}

async function cryptoPrice(coin) {
  const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd,eur,gbp&include_24hr_change=true`);
  const d = await r.json();
  const c = d[coin];
  return `💰 *${coin.toUpperCase()}*\n💵 USD: $${c.usd} (${c.usd_24h_change > 0 ? '+' : ''}${c.usd_24h_change?.toFixed(2)}%)\n💶 EUR: €${c.eur}\n💷 GBP: £${c.gbp}`;
}

async function forex(from, to) {
  const r = await fetch(`https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`);
  const d = await r.json();
  return `💱 *${from.toUpperCase()} → ${to.toUpperCase()}*\nRate: ${d.rates[to.toUpperCase()]}\n📅 ${d.date}`;
}

async function covid(country) {
  const r = await fetch(`https://disease.sh/v3/covid-19/countries/${encodeURIComponent(country)}`);
  const d = await r.json();
  return `🦠 *COVID-19: ${d.country}*\n😷 Cases: ${d.cases.toLocaleString()}\n💀 Deaths: ${d.deaths.toLocaleString()}\n💚 Recovered: ${d.recovered.toLocaleString()}\n📊 Active: ${d.active.toLocaleString()}`;
}

async function gitClone(repoUrl) {
  const { stdout } = await execPromise(`git clone --depth 1 ${repoUrl} /tmp/repo_${Date.now()}`);
  return stdout || 'Repository cloned successfully';
}

async function dnsLookup(domain) {
  const { stdout } = await execPromise(`nslookup ${domain}`);
  return stdout;
}

async function whois(domain) {
  const r = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`);
  const d = await r.json();
  return `📋 *WHOIS: ${domain}*\n🏛️ Registry: ${d.ldhName}\n📅 Created: ${d.events?.find(e => e.eventAction === 'registration')?.eventDate}\n🔄 Updated: ${d.events?.find(e => e.eventAction === 'last update')?.eventDate}`;
}

async function hashGen(text, algo = 'sha256') {
  const crypto = require('crypto');
  return crypto.createHash(algo).update(text).digest('hex');
}

async function base64(op, text) {
  if (op === 'encode') return Buffer.from(text).toString('base64');
  if (op === 'decode') return Buffer.from(text, 'base64').toString('utf8');
  throw new Error('Use encode/decode');
}

async function morse(text) {
  const m = { 'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','0':'-----',' ':'/' };
  return text.toUpperCase().split('').map(c => m[c] || c).join(' ');
}

async def removeBg(imageBuffer) {
  // Requires remove.bg API key
  throw new Error('Setup remove.bg API key first');
}

module.exports = {
  weather, news, qr, shorten, ipLookup, cryptoPrice, forex,
  covid, gitClone, dnsLookup, whois, hashGen, base64, morse
};