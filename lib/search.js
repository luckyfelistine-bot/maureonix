const fetch = require('node-fetch');

async function googleSearch(query) {
  const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=YOUR_KEY&cx=YOUR_CX&q=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.items?.slice(0, 5).map(i => `*${i.title}*\n${i.link}\n_${i.snippet}_`).join('\n\n');
}

async function wikiSearch(query, lang = 'en') {
  const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/ /g, '_'))}`);
  const data = await res.json();
  if (data.type === 'disambiguation') return `⚠️ Disambiguation: ${data.content_urls.desktop.page}`;
  return `*${data.title}*\n_${data.description || 'Wikipedia'}_\n\n${data.extract}\n\n${data.content_urls?.desktop?.page || ''}`;
}

async function githubSearch(query, type = 'repositories') {
  const res = await fetch(`https://api.github.com/search/${type}?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.items?.slice(0, 5).map(i => `📁 [${i.full_name || i.title}](${i.html_url || i.url})\n⭐ ${i.stargazers_count || i.score}\n_${i.description || ''}_`).join('\n\n');
}

async function npmSearch(pkg) {
  const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(pkg)}&size=5`);
  const data = await res.json();
  return data.objects?.map(o => `📦 ${o.package.name}@${o.package.version}\n_${o.package.description}_\n⬇️ ${o.package.links.npm}`).join('\n\n');
}

async function urbanDictionary(term) {
  const res = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`);
  const data = await res.json();
  return data.list?.slice(0, 3).map((d, i) => `${i+1}. *${d.word}*\n${d.definition}\n👍 ${d.thumbs_up} 👎 ${d.thumbs_down}`).join('\n\n') || 'No results';
}

async function animeSearch(query) {
  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`);
  const data = await res.json();
  return data.data?.map(a => `📺 *${a.title}* (${a.type})\n⭐ ${a.score}\n📅 ${a.aired?.string}\n_${a.synopsis?.substring(0, 200)}..._\n🔗 ${a.url}`).join('\n\n');
}

async function mangaSearch(query) {
  const res = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=5`);
  const data = await res.json();
  return data.data?.map(m => `📖 *${m.title}*\n⭐ ${m.score}\n📅 ${m.published?.string}\n_${m.synopsis?.substring(0, 200)}..._`).join('\n\n');
}

module.exports = { googleSearch, wikiSearch, githubSearch, npmSearch, urbanDictionary, animeSearch, mangaSearch };