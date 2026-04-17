class TravelKit {
  packing(dest, days, weather) {
    const base = ['🛂 Passport/ID', '🔌 Phone charger', '🧼 Toiletries', '🩲 Underwear x'+days, '🧦 Socks x'+Math.ceil(days*1.5)];
    const w = { hot: ['🧴 Sunscreen','🕶️ Sunglasses','👒 Hat','🩴 Sandals','👕 Light clothes'], cold: ['🧥 Jacket','🧤 Gloves','🧣 Scarf','🥾 Boots','🧦 Thermals'], rain: ['☂️ Umbrella','🧥 Raincoat','💧 Waterproof bag'] };
    const extra = days > 5 ? ['🧺 Laundry bag','👟 Extra shoes'] : days > 2 ? ['🎒 Daypack'] : [];
    return [...base, ...(w[weather]||[]), ...extra];
  }

  timezone(city) {
    const z = { london:0, paris:1, dubai:4, mumbai:5.5, bangkok:7, singapore:8, tokyo:9, sydney:11, nyc:-5, la:-8, nairobi:3, cairo:2, johannesburg:2 };
    const off = z[city.toLowerCase().replace(/[^a-z]/g,'')] ?? 0;
    const utc = Date.now() + (new Date().getTimezoneOffset()*60000);
    const t = new Date(utc + (3600000*off));
    return { city, time: t.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}), date: t.toLocaleDateString(), offset: `UTC${off>=0?'+':''}${off}` };
  }

  phrases(lang) {
    const p = {
      spanish: {hello:'Hola',thanks:'Gracias',bathroom:'¿Dónde está el baño?',help:'Ayuda',food:'Comida'},
      french: {hello:'Bonjour',thanks:'Merci',bathroom:'Où sont les toilettes?',help:'Aidez-moi',food:'Nourriture'},
      german: {hello:'Hallo',thanks:'Danke',bathroom:'Wo ist die Toilette?',help:'Hilfe',food:'Essen'},
      japanese: {hello:'Konnichiwa',thanks:'Arigatou',bathroom:'Toire wa doko?',help:'Tasukete',food:'Tabemono'},
      swahili: {hello:'Jambo',thanks:'Asante',bathroom:'Choo kiko wapi?',help:'Nisaidie',food:'Chakula'}
    };
    return p[lang.toLowerCase()] || p.spanish;
  }

  itinerary(city, days) {
    const plans = {
      paris: ['🗼 Eiffel Tower & Seine cruise','🎨 Louvre Museum','👑 Versailles day trip','⛪ Montmartre & Sacré-Cœur','🛍️ Champs-Élysées'],
      tokyo: ['🌃 Shibuya crossing','⛩️ Senso-ji Temple','🌸 Meiji Shrine','🍣 Tsukiji market','🗻 Mt Fuji day trip'],
      nairobi: ['🦁 Nairobi National Park','🐘 David Sheldrick Trust','🦒 Giraffe Centre','🏛️ National Museum','🌿 Karura Forest'],
      nyc: ['🗽 Statue of Liberty','🏙️ Empire State','🎭 Broadway','🌳 Central Park','🎨 MoMA']
    };
    const plan = plans[city.toLowerCase()] || ['🏛️ Explore downtown','🎨 Visit museums','🍜 Try local food','🛍️ Shopping district','🌳 Relax at park'];
    return plan.slice(0, days);
  }
}

module.exports = new TravelKit();