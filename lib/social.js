class SocialEngine {
  bios(niche) {
    const pool = {
      creator: ['🔥 Creating magic daily | DM for collabs', '✨ Storyteller | Visual artist | Dreamer', '🎥 Content that hits different'],
      business: ['💼 Scaling brands to 7 figures', '📈 Growth strategist | ROI obsessed', '🚀 Helping founders win'],
      fitness: ['💪 Online coaching open | CPT', '🏋️ Transforming 1000+ lives', '🔥 Your daily fitness accountability'],
      tech: ['💻 Full-stack | Open source lover', '⚡ Building in public', '🤖 AI x Code'],
      fashion: ['👗 Outfit ideas daily', '✨ Style curator | Thrift queen', '👠 OOTD | Fashion hacks']
    };
    const arr = pool[niche] || pool.creator;
    return arr[Math.floor(Math.random()*arr.length)];
  }

  hashtags(topic) {
    const map = {
      fitness: '#fitness #gym #workout #fitfam #bodybuilding #health #training #fitnessmotivation',
      tech: '#coding #programming #developer #javascript #tech #ai #codinglife #webdev',
      food: '#foodie #instafood #foodporn #yummy #cooking #foodphotography #homemade',
      travel: '#travel #wanderlust #adventure #explore #travelphotography #nature #trip',
      motivation: '#motivation #success #mindset #goals #hustle #entrepreneur #inspiration'
    };
    return map[topic] || `#${topic} #instagood #photooftheday #love #trending #viral #explore`;
  }

  captions(mood) {
    const c = {
      happy: ['Living my best life 🌞', 'Good vibes happen on the tides ✨', 'Sunshine state of mind 😊'],
      sad: ['Healing is not linear 🌱', 'Rainy days need coffee ☕', 'This season will pass 🕊️'],
      savage: ['Not everyone likes me, but not everyone matters 😤', 'Catch flights, not feelings ✈️', 'Too glam to give a damn 💅'],
      motivation: ['Dream big. Hustle hard. 💯', 'Your only limit is your mind 🔥', 'Be the CEO your parents wanted you to marry 👑']
    };
    const arr = c[mood] || c.happy;
    return arr[Math.floor(Math.random()*arr.length)];
  }

  username(base, style = 'cool') {
    const sfx = ['hq','daily','co','official','lab','app','zone','hub'];
    const num = Math.floor(Math.random()*999);
    if (style === 'clean') return `${base}.${sfx[Math.floor(Math.random()*sfx.length)]}`;
    if (style === 'dev') return `${base}_dev`;
    return `${base}${num}`;
  }

  slogan(industry) {
    const sl = {
      coffee: ['Wake up and smell the empire.', 'Espresso yourself.'],
      gym: ['The only bad workout is the one that didn’t happen.', 'Lift heavy, live happy.'],
      tech: ['Innovation at your fingertips.', 'Code the future.'],
      fashion: ['Wear your confidence.', 'Style that speaks.']
    };
    const arr = sl[industry] || ['Quality you can trust.', 'Excellence delivered.'];
    return arr[Math.floor(Math.random()*arr.length)];
  }
}

module.exports = new SocialEngine();