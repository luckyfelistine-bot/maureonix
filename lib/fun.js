const fetch = require('node-fetch');

const roasts = [
  "You're the reason the gene pool needs a lifeguard.",
  "I'm not saying I hate you, but I would unplug your life support to charge my phone.",
  "You're like a cloud. When you disappear, it's a beautiful day.",
  "I'd agree with you but then we'd both be wrong.",
  "You're not stupid; you just have bad luck thinking.",
  "I'm jealous of people who don't know you.",
  "You bring everyone so much joy... when you leave the room.",
  "If I wanted to kill myself, I'd climb your ego and jump to your IQ.",
  "You're proof that evolution can go in reverse.",
  "I don't have the energy to pretend to like you today."
];

const compliments = [
  "You're more fun than a ball pit filled with candy.",
  "Who raised you? They deserve a medal for a job well done.",
  "You're like a breath of fresh air.",
  "You are the most perfect you there is.",
  "You're an awesome friend.",
  "You light up the room.",
  "You deserve a hug right now.",
  "You should be proud of yourself.",
  "You're more helpful than you realize.",
  "Your smile is contagious."
];

const truths = [
  "What's the most embarrassing thing you've done?",
  "Have you ever cheated in a relationship?",
  "What's your biggest fear?",
  "Who's your secret crush?",
  "What's the worst lie you've ever told?",
  "Have you ever stolen something?",
  "What's your biggest regret?",
  "What's the most illegal thing you've done?"
];

const dares = [
  "Send 'I love you' to your last chatted contact.",
  "Change your profile picture to a baby photo for 1 hour.",
  "Type with your eyes closed for the next 3 messages.",
  "Send a voice note singing your favorite song.",
  "Tell the group your most embarrassing secret.",
  "Act like a chicken for 30 seconds in voice chat."
];

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function joke() {
  const r = await fetch('https://official-joke-api.appspot.com/random_joke');
  const d = await r.json();
  return `*${d.setup}*\n\n${d.punchline} 😂`;
}

async function meme() {
  const r = await fetch('https://meme-api.com/gimme');
  const d = await r.json();
  return { image: d.url, caption: d.title, subreddit: d.subreddit };
}

async function quote() {
  const r = await fetch('https://api.quotable.io/random');
  const d = await r.json();
  return `"${d.content}"\n— *${d.author}*`;
}

async function fact() {
  const r = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
  const d = await r.json();
  return `📚 *Did you know?*\n${d.text}`;
}

async function ship(name1, name2) {
  const percent = Math.floor(Math.random() * 100) + 1;
  let status = percent > 80 ? '💍 Soulmates' : percent > 50 ? '💕 Compatible' : percent > 30 ? '🔥 Fling' : '💔 Avoid each other';
  return `❤️ *Ship: ${name1} x ${name2}*\n\nCompatibility: ${percent}%\n${status}`;
}

async function wouldYouRather() {
  const r = await fetch('https://would-you-rather-api.abaanshanid.repl.co/');
  const d = await r.json();
  return `🤔 *Would You Rather*\n\n${d.data}`;
}

async function eightBall(question) {
  const responses = ['Yes', 'No', 'Maybe', 'Definitely', 'Absolutely not', 'Ask again later', 'Most likely', 'Very doubtful'];
  return `🎱 *8Ball*\n\nQ: ${question}\nA: ${getRandom(responses)}`;
}

async function rollDice(sides = 6) { return `🎲 You rolled: ${Math.floor(Math.random() * sides) + 1}`; }
async function flipCoin() { return `🪙 ${Math.random() > 0.5 ? 'Heads' : 'Tails'}`; }
async function roast() { return `🔥 ${getRandom(roasts)}`; }
async function compliment() { return `🌟 ${getRandom(compliments)}`; }
async function truth() { return `🤐 *TRUTH*\n${getRandom(truths)}`; }
async function dare() { return `😈 *DARE*\n${getRandom(dares)}`; }

module.exports = { joke, meme, quote, fact, ship, wouldYouRather, eightBall, rollDice, flipCoin, roast, compliment, truth, dare };