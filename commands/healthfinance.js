// commands/healthfinance.js – Health calculators, Finance, Dev, Social, Travel, Food
module.exports = {
    // Health
    bmi: async (nimesha, m, { args, Health, prefix, command }) => {
        if (args.length < 2) return m.reply(`Example: ${prefix + command} <kg> <cm>`);
        const res = Health.bmi(parseFloat(args[0]), parseFloat(args[1]));
        await m.reply(`⚖️ *BMI Result*\nValue: ${res.val}\nCategory: ${res.cat}\nIdeal weight: ${res.ideal[0]}-${res.ideal[1]}kg`);
    },
    bmr: async (nimesha, m, { args, Health, prefix, command }) => {
        if (args.length < 4) return m.reply(`Example: ${prefix + command} <kg> <cm> <age> <male/female>`);
        const val = Health.bmr(parseFloat(args[0]), parseFloat(args[1]), parseInt(args[2]), args[3]);
        await m.reply(`🔥 *BMR:* ${val} calories/day`);
    },
    tdee: async (nimesha, m, { args, Health, prefix, command }) => {
        if (args.length < 2) return m.reply(`Example: ${prefix + command} <bmr> <sedentary/light/moderate/active/athlete>`);
        const val = Health.tdee(parseInt(args[0]), args[1]);
        await m.reply(`⚡ *TDEE:* ${val} calories/day`);
    },
    macros: async (nimesha, m, { args, Health, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <calories> [lose/maintain/gain]`);
        const res = Health.macros(parseInt(args[0]), args[1]);
        await m.reply(`🥗 *Macros for ${args[0]} cal*\n🥩 Protein: ${res.protein}g\n🥑 Fat: ${res.fat}g\n🍚 Carbs: ${res.carbs}g`);
    },
    watercalc: async (nimesha, m, { args, Health, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <kg>`);
        await m.reply(`💧 Drink ~${Health.water(parseFloat(args[0]))}ml daily`);
    },
    sleep: async (nimesha, m, { Health }) => {
        const cycles = Health.sleepWakeUp();
        await m.reply(`😴 *If you sleep now, wake up at:*\n${cycles.map((t, i) => `${i + 1} cycle${i + 1 > 1 ? 's' : ''}: ${t}`).join('\n')}\n\n💡 90min = 1 sleep cycle`);
    },
    heartrate: async (nimesha, m, { args, Health, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <age>`);
        const z = Health.hrZones(parseInt(args[0]));
        await m.reply(`❤️ *HR Zones (Max: ${z.max})*\n🔥 Fat Burn: ${z.fatburn}\n🏃 Cardio: ${z.cardio}\n⚡ Peak: ${z.peak}`);
    },
    onerm: async (nimesha, m, { args, Health, prefix, command }) => {
        if (args.length < 2) return m.reply(`Example: ${prefix + command} <weight> <reps>`);
        const rm = Health.oneRm(parseFloat(args[0]), parseInt(args[1]));
        await m.reply(`🏋️ Estimated 1RM: ${rm}kg`);
    },
    bodyfat: async (nimesha, m, { args, Health, prefix, command }) => {
        if (args.length < 4) return m.reply(`Example: ${prefix + command} <male/female> <waist(cm)> <neck(cm)> <height(cm)> [hip(cm)]`);
        const res = Health.bodyFat(args[0], parseFloat(args[1]), parseFloat(args[2]), parseFloat(args[3]), parseFloat(args[4] || 0));
        await m.reply(`📊 Estimated body fat: ${res}%`);
    },
    workout: async (nimesha, m, { args, Health }) => {
        const type = args[0] || 'fullbody';
        const plan = Health.workout(type);
        await m.reply(`💪 *${type.toUpperCase()} Workout*\n${plan.map((x, i) => `${i + 1}. ${x}`).join('\n')}`);
    },
    yoga: async (nimesha, m, { args, Health }) => {
        const p = Health.yoga(args[0]);
        await m.reply(`🧘 *${p.name}*\n⏱️ Hold: ${p.time}\n✨ Benefit: ${p.benefit}`);
    },
    // Finance
    stock: async (nimesha, m, { args, Finance, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <AAPL>`);
        try {
            const s = await Finance.stock(args[0]);
            await m.reply(`📈 *${args[0].toUpperCase()}*\nPrice: $${s.price}\nChange: ${s.change}%\nPrev: $${s.prev}`);
        } catch (e) { m.reply('❌ Market data limit'); }
    },
    crypto: async (nimesha, m, { args, Finance }) => {
        const coin = args[0]?.toLowerCase() || 'bitcoin';
        try {
            const s = await Finance.crypto(coin);
            await m.reply(`💰 *${coin.toUpperCase()}*\nPrice: $${s.price}\n24h Change: ${s.change24h}%\nMarket Cap: $${s.marketCap}`);
        } catch (e) { m.reply('❌ Crypto data limit'); }
    },
    portfolio: async (nimesha, m, { Finance }) => {
        const p = Finance.getPortfolio(m.sender);
        if (!p.length) return m.reply('No portfolio. Use .addstock/.addcrypto');
        let txt = `📊 *Your Portfolio*\n`;
        p.forEach((x, i) => { txt += `${i + 1}. ${x.type} ${x.sym} x${x.qty} @ $${x.buy}\n`; });
        await m.reply(txt);
    },
    addstock: async (nimesha, m, { args, Finance, prefix, command }) => {
        if (args.length < 3) return m.reply(`Example: ${prefix + command} <SYM> <qty> <buyPrice>`);
        Finance.addPortfolio(m.sender, 'stock', args[0], args[1], args[2]);
        await m.reply('✅ Added to portfolio');
    },
    addcrypto: async (nimesha, m, { args, Finance, prefix, command }) => {
        if (args.length < 3) return m.reply(`Example: ${prefix + command} <BTC> <qty> <buyPrice>`);
        Finance.addPortfolio(m.sender, 'crypto', args[0], args[1], args[2]);
        await m.reply('✅ Added to portfolio');
    },
    tip: async (nimesha, m, { args, Finance, prefix, command }) => {
        if (args.length < 2) return m.reply(`Example: ${prefix + command} <amount> <percent> [people]`);
        const res = Finance.tip(parseFloat(args[0]), parseInt(args[1]), parseInt(args[2] || 1));
        await m.reply(`💰 *Tip Calculator*\nSubtotal: $${res.subtotal}\nTip (${args[1]}%): $${res.tip}\nTotal: $${res.total}\nPer person: $${res.each}`);
    },
    loan: async (nimesha, m, { args, Finance, prefix, command }) => {
        if (args.length < 3) return m.reply(`Example: ${prefix + command} <principal> <rate%> <months>`);
        const res = Finance.emi(parseFloat(args[0]), parseFloat(args[1]), parseInt(args[2]));
        await m.reply(`🏦 *Loan EMI*\nEMI: $${res.emi}/month\nTotal: $${res.total}\nInterest: $${res.interest}`);
    },
    savings: async (nimesha, m, { args, Finance, prefix, command }) => {
        if (args.length < 2) return m.reply(`Example: ${prefix + command} <goalAmount> <monthlySaving> [rate%]`);
        const res = Finance.savings(parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2] || 5));
        await m.reply(`🏦 Reach $${args[0]} in ~${res.years} years (${res.months} months)`);
    },
    // Dev
    uuid: async (nimesha, m, { Dev }) => { await m.reply(`🔑 ${Dev.uuid()}`); },
    password: async (nimesha, m, { args, Dev }) => {
        const len = parseInt(args[0]) || 16;
        const p = Dev.password(len);
        await m.reply(`🔐 *Password*\n\`\`\`\n${p.pass}\n\`\`\`\nEntropy: ${p.entropy}`);
    },
    json: async (nimesha, m, { text, Dev, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <json string>`);
        const r = Dev.json(text);
        if (r.valid) await m.reply(`✅ Valid (${r.keys} keys)\n\`\`\`json\n${r.pretty.slice(0, 2000)}\n\`\`\``);
        else await m.reply(`❌ ${r.error}`);
    },
    encode: async (nimesha, m, { args, Dev, prefix, command }) => {
        if (args.length < 2) return m.reply(`Example: ${prefix + command} <base64/url/html> <text>`);
        await m.reply(Dev.encode(args[0], args.slice(1).join(' ')));
    },
    decode: async (nimesha, m, { args, Dev, prefix, command }) => {
        if (args.length < 2) return m.reply(`Example: ${prefix + command} <base64/url/html> <text>`);
        await m.reply(Dev.decode(args[0], args.slice(1).join(' ')));
    },
    lorem: async (nimesha, m, { args, Dev }) => {
        await m.reply(Dev.lorem(parseInt(args[0]) || 50));
    },
    palette: async (nimesha, m, { Dev }) => {
        const c = Dev.palette();
        await m.reply(`🎨 *Color Palette*\n${c.map(x => `■ ${x}`).join('\n')}`);
    },
    qrvcard: async (nimesha, m, { args, Dev, Tools, nimesha: nm, prefix, command }) => {
        if (args.length < 3) return m.reply(`Example: ${prefix + command} <name> <phone> <email>`);
        const data = Dev.qrData('vcard', { name: args[0], phone: args[1], email: args[2] });
        const buf = await Tools.qr(data);
        await nm.sendMessage(m.chat, { image: buf, caption: `📇 vCard QR for ${args[0]}` }, { quoted: m });
    },
    qrwifi: async (nimesha, m, { args, Dev, Tools, nimesha: nm, prefix, command }) => {
        if (args.length < 2) return m.reply(`Example: ${prefix + command} <SSID> <password>`);
        const data = Dev.qrData('wifi', { ssid: args[0], pass: args[1] });
        const buf = await Tools.qr(data);
        await nm.sendMessage(m.chat, { image: buf, caption: `📶 WiFi: ${args[0]}` }, { quoted: m });
    },
    checksum: async (nimesha, m, { Dev }) => {
        if (!m.quoted || !m.quoted.isMedia) return m.reply('Reply to a file');
        const buf = await m.quoted.download();
        const sha = Dev.checksum(buf, 'sha256');
        const md5 = Dev.checksum(buf, 'md5');
        await m.reply(`📁 Checksums\nSHA256: ${sha}\nMD5: ${md5}`);
    },
    // Social
    bio: async (nimesha, m, { args, Social }) => {
        const niche = args[0] || 'creator';
        await m.reply(`✍️ *Bio Idea*\n${Social.bios(niche)}`);
    },
    hashtag: async (nimesha, m, { args, Social }) => {
        const topic = args[0] || 'love';
        await m.reply(`#️⃣ *Hashtags*\n${Social.hashtags(topic)}`);
    },
    caption: async (nimesha, m, { args, Social }) => {
        const mood = args[0] || 'happy';
        await m.reply(`📝 *Caption*\n${Social.captions(mood)}`);
    },
    username: async (nimesha, m, { args, Social, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <name> [clean/dev/cool]`);
        await m.reply(`👤 Suggested: ${Social.username(args[0], args[1])}`);
    },
    slogan: async (nimesha, m, { args, Social }) => {
        await m.reply(`💡 *Slogan:*\n"${Social.slogan(args[0] || 'business')}"`);
    },
    // Travel
    packing: async (nimesha, m, { args, Travel, prefix, command }) => {
        if (args.length < 3) return m.reply(`Example: ${prefix + command} <destination> <days> <hot/cold/rain>`);
        const list = Travel.packing(args[0], parseInt(args[1]), args[2]);
        await m.reply(`🎒 *Packing List for ${args[0]}*\n${list.map((x, i) => `${i + 1}. ${x}`).join('\n')}`);
    },
    worldclock: async (nimesha, m, { args, Travel, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <city>`);
        const t = Travel.timezone(args[0]);
        await m.reply(`🌍 *${t.city}*\n🕐 ${t.time}\n📅 ${t.date}\n${t.offset}`);
    },
    phrasebook: async (nimesha, m, { args, Travel }) => {
        const lang = args[0] || 'spanish';
        const p = Travel.phrases(lang);
        await m.reply(`🗣️ *${lang.toUpperCase()} Phrases*\n${Object.entries(p).map(([k, v]) => `*${k}:* ${v}`).join('\n')}`);
    },
    itinerary: async (nimesha, m, { args, Travel, prefix, command }) => {
        if (args.length < 2) return m.reply(`Example: ${prefix + command} <city> <days>`);
        const plan = Travel.itinerary(args[0], parseInt(args[1]));
        await m.reply(`🗺️ *${args[0]} ${args[1]}-Day Plan*\n${plan.map((x, i) => `Day ${i + 1}: ${x}`).join('\n')}`);
    },
    convert: async (nimesha, m, { args, prefix, command }) => {
        if (args.length < 3) return m.reply(`Example: ${prefix + command} <value> <from> <to>\nUnits: km, mi, kg, lb, c, f, l, gal`);
        const val = parseFloat(args[0]);
        const f = args[1].toLowerCase(); const t = args[2].toLowerCase();
        const rates = { km_mi: 0.621371, mi_km: 1.60934, kg_lb: 2.20462, lb_kg: 0.453592, l_gal: 0.264172, gal_l: 3.78541 };
        const key = `${f}_${t}`;
        let res;
        if (key === 'c_f') res = (val * 9 / 5) + 32;
        else if (key === 'f_c') res = (val - 32) * 5 / 9;
        else if (rates[key]) res = val * rates[key];
        else return m.reply('Unsupported conversion');
        await m.reply(`🔄 ${val}${f} = ${res.toFixed(2)}${t}`);
    },
    // Food
    recipe: async (nimesha, m, { text, Food, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <dish>`);
        const r = await Food.recipe(text);
        if (!r) return m.reply('Recipe not found');
        await nimesha.sendMessage(m.chat, { image: { url: r.thumb }, caption: `🍽️ *${r.name}*\n📍 ${r.area} | ${r.category}\n\n*Ingredients:*\n${r.ingredients.join('\n')}\n\n*Instructions:*\n${r.instructions.slice(0, 800)}...` }, { quoted: m });
    },
    cocktail: async (nimesha, m, { text, Food }) => {
        const c = await Food.cocktail(text || 'margarita');
        if (!c) return m.reply('Drink not found');
        await nimesha.sendMessage(m.chat, { image: { url: c.thumb }, caption: `🍸 *${c.name}*\n🥃 Glass: ${c.glass}\n\n*Ingredients:*\n${c.ingredients.join(', ')}\n\n*How to make:*\n${c.instructions}` }, { quoted: m });
    },
    substitute: async (nimesha, m, { args, Food, prefix, command }) => {
        if (!args[0]) return m.reply(`Example: ${prefix + command} <ingredient>`);
        await m.reply(`🔄 *Substitute for ${args[0]}*\n${Food.substitute(args[0])}`);
    },
    mealprep: async (nimesha, m, { args, Food }) => {
        const plan = Food.mealPrep(args[0] || 'balanced');
        await m.reply(`🥗 *${(args[0] || 'balanced').toUpperCase()} Meal Plan*\n${plan.map((x, i) => `${i + 1}. ${x}`).join('\n')}`);
    },
    // Aliases
    bitcoin: async (nimesha, m, ctx) => { await module.exports.crypto(nimesha, m, { ...ctx, args: ['bitcoin'] }); },
    eth: async (nimesha, m, ctx) => { await module.exports.crypto(nimesha, m, { ...ctx, args: ['ethereum'] }); },
    emi: async (nimesha, m, ctx) => { await module.exports.loan(nimesha, m, ctx); },
    tags: async (nimesha, m, ctx) => { await module.exports.hashtag(nimesha, m, ctx); },
    phrases: async (nimesha, m, ctx) => { await module.exports.phrasebook(nimesha, m, ctx); },
    time: async (nimesha, m, ctx) => { await module.exports.worldclock(nimesha, m, ctx); },
    unit: async (nimesha, m, ctx) => { await module.exports.convert(nimesha, m, ctx); },
};