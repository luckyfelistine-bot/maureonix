// commands/others.js – Reminders, notes, todo, jadibot, docs, ping
const fs = require('fs');
const path = require('path');
const { similarity } = require('../lib/function');

module.exports = {
    remindme: async (nimesha, m, { args, db, prefix, command }) => {
        if (args.length < 2) return m.reply(`Example: ${prefix + command} <minutes> <text>`);
        const mins = parseInt(args[0]);
        const msgText = args.slice(1).join(' ');
        if (isNaN(mins) || mins <= 0) return m.reply('Invalid minutes.');
        const due = Date.now() + mins * 60000;
        if (!db.reminders) db.reminders = [];
        db.reminders.push({ user: m.sender, target: m.sender, text: msgText, due });
        await m.reply(`⏰ Reminder set for ${mins} minute(s).\n📝 ${msgText}`);
    },
    remind: async (nimesha, m, { text, AI, db, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} me to call John tomorrow at 10am`);
        await m.reply('🧠 *Understanding your reminder...*');
        try {
            const { ultimateAI } = require('../lib/ai');
            const now = new Date();
            const localNow = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
            const prompt = `Extract the reminder datetime (UNIX timestamp in milliseconds, in Africa/Nairobi timezone) and message from this user request.
Return ONLY a JSON object with "due" (timestamp in milliseconds) and "text" (the reminder message). If you can't determine a date/time, set "due" to null.
Current time in Nairobi: ${localNow.toISOString()} (${localNow.toString()})
User request: "${text}"
JSON:`;
            const res = await ultimateAI(prompt, m.sender, 'deepseek');
            let parsed;
            try { parsed = JSON.parse(res.text); } catch { const match = res.text.match(/\{[\s\S]*\}/); if (!match) throw new Error('No JSON found'); parsed = JSON.parse(match[0]); }
            if (!parsed.due || isNaN(parsed.due) || !parsed.text) return m.reply('❌ Could not extract a valid time from your request. Please be more specific.\nExample: "remind me to buy milk at 5pm"');
            const dueMs = parsed.due;
            if (dueMs <= Date.now()) return m.reply('❌ The time you mentioned is in the past. Please use a future time.');
            if (!db.reminders) db.reminders = [];
            db.reminders.push({ user: m.sender, target: m.sender, text: parsed.text, due: dueMs });
            const timeStr = new Date(dueMs).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
            await m.reply(`⏰ *Reminder set!*\n📝 ${parsed.text}\n📅 ${timeStr}`);
        } catch (e) { m.reply(`❌ Failed to set reminder: ${e.message}\n\nTry using the manual format: ${prefix}remindme 30 Buy milk`); }
    },
    reminders: async (nimesha, m, { db }) => {
        if (!db.reminders) db.reminders = [];
        const mine = db.reminders.filter(r => r.user === m.sender || r.target === m.sender);
        if (!mine.length) return m.reply('📭 You have no active reminders.');
        let txt = '⏰ *Your Active Reminders*\n\n';
        mine.forEach((r, i) => {
            const due = new Date(r.due);
            const timeLeft = r.due - Date.now();
            const timeStr = due.toLocaleString('en-KE', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
            let relative = '';
            if (timeLeft < 60000) relative = ' (now)';
            else if (timeLeft < 3600000) relative = ` (in ${Math.floor(timeLeft / 60000)}m)`;
            else if (timeLeft < 86400000) relative = ` (in ${Math.floor(timeLeft / 3600000)}h)`;
            else relative = ` (in ${Math.floor(timeLeft / 86400000)}d)`;
            txt += `${i + 1}. ${r.text}\n   📅 ${timeStr}${relative}\n\n`;
        });
        txt += `Total: ${mine.length} reminder${mine.length > 1 ? 's' : ''}`;
        await m.reply(txt);
    },
    clearreminders: async (nimesha, m, { db }) => {
        if (!db.reminders) return m.reply('No reminders to clear.');
        db.reminders = db.reminders.filter(r => r.user !== m.sender);
        await m.reply('🧹 All your reminders cleared.');
    },
    note: async (nimesha, m, { text, db, prefix, command }) => {
        const [title, ...body] = text.split('|');
        if (!title || !body.length) return m.reply(`Example: ${prefix + command} Title | Content`);
        if (!db.notes) db.notes = {};
        if (!db.notes[m.sender]) db.notes[m.sender] = [];
        db.notes[m.sender].push({ title: title.trim(), content: body.join('|').trim(), date: Date.now() });
        await m.reply(`📝 Note saved: *${title.trim()}*`);
    },
    mynotes: async (nimesha, m, { db }) => {
        if (!db.notes?.[m.sender]?.length) return m.reply('No notes.');
        let txt = `📚 *Your Notes*\n`;
        db.notes[m.sender].forEach((n, i) => { txt += `${i + 1}. *${n.title}* — ${new Date(n.date).toLocaleDateString()}\n`; });
        await m.reply(txt);
    },
    delnote: async (nimesha, m, { args, db }) => {
        const idx = parseInt(args[0]) - 1;
        if (!db.notes?.[m.sender] || idx < 0 || idx >= db.notes[m.sender].length) return m.reply('Invalid note number.');
        db.notes[m.sender].splice(idx, 1);
        await m.reply('🗑️ Note deleted');
    },
    todo: async (nimesha, m, { text, db, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} <task> | priority (high/medium/low)`);
        const [task, priority] = text.split('|').map(s => s.trim());
        if (!db.todos) db.todos = {};
        if (!db.todos[m.sender]) db.todos[m.sender] = [];
        db.todos[m.sender].push({ task, priority: priority || 'medium', done: false, date: Date.now() });
        await m.reply(`✅ Task added! (${db.todos[m.sender].filter(t => !t.done).length} pending)`);
    },
    todos: async (nimesha, m, { db }) => {
        if (!db.todos?.[m.sender]?.length) return m.reply('No tasks.');
        const pending = db.todos[m.sender].filter(t => !t.done);
        const done = db.todos[m.sender].filter(t => t.done);
        let txt = `📋 *Todo List*\n\n*Pending:*\n`;
        pending.forEach((t, i) => { txt += `${i + 1}. [${t.priority.toUpperCase()}] ${t.task}\n`; });
        txt += `\n*Done:* ${done.length}`;
        await m.reply(txt);
    },
    done: async (nimesha, m, { args, db }) => {
        const idx = parseInt(args[0]) - 1;
        if (!db.todos?.[m.sender] || idx < 0 || idx >= db.todos[m.sender].length) return m.reply('Invalid task number.');
        db.todos[m.sender][idx].done = true;
        await m.reply('🎉 Task completed!');
    },
    cleartodo: async (nimesha, m, { db }) => {
        if (!db.todos?.[m.sender]) return m.reply('No tasks.');
        db.todos[m.sender] = db.todos[m.sender].filter(t => !t.done);
        await m.reply('🧹 Completed tasks cleared');
    },
    // Jadibot (multi-device)
    pair: async (nimesha, m, { text, prefix, db, ownerNumber }) => {
        if (!text) return m.reply(`Example: ${prefix}pair 254712345678`);
        const targetNumber = text.replace(/[^0-9]/g, '');
        if (targetNumber.length < 9) return m.reply('Invalid phone number. Include country code.');

        if (db.jadibot?.sessions?.[m.sender]?.active)
            return m.reply('✅ You already have an active bot session! Use .stopjadibot first.');

        if (db.jadibot?.requests?.[m.sender] && Date.now() - db.jadibot.requests[m.sender].timestamp < 120000)
            return m.reply('⏳ You have a pending pairing request. Wait 2 minutes or use .startjadibot.');

        await m.reply('📲 *Requesting pairing code...*');

        const { default: makeWASocket, useMultiFileAuthState, fetchLatestWaWebVersion } = require('baileys');
        const pino = require('pino');
        const fs = require('fs');
        const path = require('path');
        const os = require('os');

        const tempId = `pair_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const tempDir = path.join(os.tmpdir(), tempId);
        fs.mkdirSync(tempDir, { recursive: true });

        let sock = null;
        const cleanup = () => {
            if (sock) { try { sock.ws?.close(); } catch {} sock = null; }
            try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
        };

        try {
            const { version } = await fetchLatestWaWebVersion().catch(() => ({ version: [2, 3000, 1017531287] }));
            const { state } = await useMultiFileAuthState(tempDir);

            // ⏱ Wait for socket to open (up to 60 seconds – mirror main bot)
            const socketOpenPromise = new Promise((resolve, reject) => {
                sock = makeWASocket({
                    version,
                    logger: pino({ level: 'silent' }),
                    auth: state,
                    printQRInTerminal: false,
                    browser: ['Maureonix (Pairing)', 'Chrome', '120.0.0.0'],
                    connectTimeoutMs: 60_000,          // ← generous handshake time
                    defaultQueryTimeoutMs: 60_000,
                    keepAliveIntervalMs: 25_000
                });

                const onConnectionUpdate = (update) => {
                    const { connection, lastDisconnect } = update;
                    if (connection === 'open') {
                        sock.ev.off('connection.update', onConnectionUpdate);
                        resolve();
                    } else if (connection === 'close') {
                        sock.ev.off('connection.update', onConnectionUpdate);
                        const statusCode = lastDisconnect?.error?.output?.statusCode;
                        if (statusCode === 401) reject(new Error('Phone number not registered on WhatsApp.'));
                        else if (statusCode === 403) reject(new Error('Access denied. Try again later.'));
                        else reject(new Error(`Connection closed: ${lastDisconnect?.error?.message || 'Unknown'}`));
                    }
                };
                sock.ev.on('connection.update', onConnectionUpdate);
            });

            // Total hard deadline: 65 seconds (no one waits longer)
            const totalTimeout = setTimeout(() => {
                cleanup();
                throw new Error('Pairing request timed out (65s). Please try again in a moment.');
            }, 65_000);

            await socketOpenPromise;
            clearTimeout(totalTimeout);

            // ── Request the pairing code with a 3‑second cooldown (syncs with main bot) ──
            let code = null;
            for (let attempt = 0; attempt < 3; attempt++) {
                try {
                    await new Promise(r => setTimeout(r, 3_000));   // small cooldown
                    code = await sock.requestPairingCode(targetNumber);
                    break;   // success – exit loop
                } catch (e) {
                    if (attempt === 2) throw e;   // last attempt failed
                    // otherwise retry
                }
            }

            cleanup();

            const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
            if (!db.jadibot) db.jadibot = { sessions: {}, requests: {} };
            db.jadibot.requests[m.sender] = {
                code,
                number: targetNumber,
                authFolder: path.join(process.cwd(), 'jadibot_sessions', m.sender.split('@')[0]),
                timestamp: Date.now()
            };

            await m.reply(
                `📲 *WhatsApp Pairing Code*\n\n` +
                `🔑 *Your code:* ${formatted}\n\n` +
                `⏰ _Expires in 60 seconds_\n\n` +
                `1. Open WhatsApp on your phone\n` +
                `2. Go to *Settings* → *Linked Devices*\n` +
                `3. Tap *Link a Device*\n` +
                `4. Enter the code above\n\n` +
                `_After linking, use ${prefix}startjadibot to activate your bot_`
            );

            const ownerMsg = `🔐 *New Pairing Request*\n👤 @${m.sender.split('@')[0]}\n📱 +${targetNumber}\n🔑 ${formatted}`;
            await nimesha.sendMessage(ownerNumber[0], { text: ownerMsg, mentions: [m.sender] });
        } catch (e) {
            cleanup();
            m.reply(`❌ Failed to get pairing code: ${e.message}`);
        }
    },
    startjadibot: async (nimesha, m, { db, store }) => {
        if (!db.jadibot?.requests?.[m.sender]) return m.reply('❌ No pairing request found. Use .pair <number> first.');
        const req = db.jadibot.requests[m.sender];
        if (Date.now() - req.timestamp > 120000) { delete db.jadibot.requests[m.sender]; return m.reply('❌ Pairing request expired. Please use .pair again.'); }
        if (db.jadibot.sessions?.[m.sender]?.active) return m.reply('✅ Your bot is already running! Use .stopjadibot to stop.');
        await m.reply('⏳ *Starting your bot instance...*');
        const { JadiBot } = require('../src/jadibot');
        try {
            const userClient = await JadiBot(nimesha, m.sender, m, store);
            if (!db.jadibot.sessions) db.jadibot.sessions = {};
            db.jadibot.sessions[m.sender] = { active: true, number: req.number, startedAt: Date.now(), authFolder: req.authFolder };
            delete db.jadibot.requests[m.sender];
            await m.reply(`✅ *Your bot is now active!*\n\n📱 Number: +${req.number}\n\n_Use .help to see commands_\n_Use .stopjadibot to stop_`);
        } catch (e) { m.reply(`❌ Failed to start bot: ${e.message}`); }
    },
    stopjadibot: async (nimesha, m, { db }) => {
        if (!db.jadibot?.sessions?.[m.sender]?.active) return m.reply('❌ You don\'t have an active bot session.');
        const { StopJadiBot } = require('../src/jadibot');
        await StopJadiBot(nimesha, m.sender, m);
        if (db.jadibot.sessions[m.sender]) db.jadibot.sessions[m.sender].active = false;
        await m.reply('🛑 *Your bot has been stopped.*');
    },
    listjadibot: async (nimesha, m, { isCreator, mess }) => {
        if (!isCreator) return m.reply(mess.owner);
        const { ListJadiBot } = require('../src/jadibot');
        await ListJadiBot(nimesha, m);
    },
    stopuserjadibot: async (nimesha, m, { isCreator, mess, db }) => {
        if (!isCreator) return m.reply(mess.owner);
        const target = m.mentionedJid?.[0];
        if (!target) return m.reply(`Mention the user whose bot you want to stop.\nExample: ${prefix}stopuserjadibot @user`);
        const { StopJadiBot } = require('../src/jadibot');
        const stopped = await StopJadiBot(nimesha, target, m);
        if (stopped) { if (db.jadibot?.sessions?.[target]) db.jadibot.sessions[target].active = false; await m.reply(`🛑 Force‑stopped bot for @${target.split('@')[0]}`, { mentions: [target] }); }
        else await m.reply(`❌ No active bot session found for @${target.split('@')[0]}.`, { mentions: [target] });
    },
    docs: async (nimesha, m, { text, prefix, similarity }) => {
        const docsDir = path.join(process.cwd(), 'docs');
        if (!fs.existsSync(docsDir)) return m.reply('❌ *Documentation folder not found.*');
        let files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
        if (files.length === 0) return m.reply('❌ No documentation files found in `docs/`.');
        if (!text) {
            let list = '📚 *Available Documentation*\n━━━━━━━━━━━━━━━━━━━━━━\n';
            files.forEach((f, i) => { const name = f.replace(/\.md$/i, ''); list += `${i + 1}. ${name}\n`; });
            list += `\n_Type ${prefix}docs <name> to read._\n_Example: ${prefix}docs admin_`;
            return m.reply(list);
        }
        const query = text.trim().toLowerCase();
        let match = files.find(f => f.replace(/\.md$/i, '').toLowerCase() === query);
        if (!match) match = files.find(f => f.toLowerCase().includes(query));
        if (!match && typeof similarity === 'function') {
            let best = null, bestScore = 0;
            for (const f of files) {
                const name = f.replace(/\.md$/i, '');
                const score = similarity(query, name.toLowerCase());
                if (score > bestScore && score > 0.6) { bestScore = score; best = f; }
            }
            match = best;
        }
        if (!match) {
            const names = files.map(f => f.replace(/\.md$/i, ''));
            let suggestion = `❌ No documentation found for "*${text}*".\n\n💡 *Did you mean one of these?*\n`;
            names.slice(0, 10).forEach(n => { suggestion += `   • ${n}\n`; });
            suggestion += `\n_Use ${prefix}docs to list all._`;
            return m.reply(suggestion);
        }
        const filePath = path.join(docsDir, match);
        try {
            const fullMarkdown = fs.readFileSync(filePath, 'utf8');
            const { formatDocForWhatsApp } = require('../lib/docs');
            let content = formatDocForWhatsApp(fullMarkdown);
            const title = match.replace(/\.md$/i, '').toUpperCase();
            const maxLen = 3800;
            if (content.length <= maxLen) await m.reply(`📄 *${title}*\n━━━━━━━━━━━━━━━━━━━━━━\n${content}`);
            else for (let i = 0; i < content.length; i += maxLen) { const chunk = content.slice(i, i + maxLen); const part = Math.floor(i / maxLen) + 1; const total = Math.ceil(content.length / maxLen); await m.reply(`📄 *${title}* (Part ${part}/${total})\n━━━━━━━━━━━━━━━━━━━━━━\n${chunk}`); }
        } catch (e) { m.reply(`❌ Error reading file: ${e.message}`); }
    },
    ask: async (nimesha, m, { text, AI, prefix, command }) => {
        if (!text) return m.reply(`Example: ${prefix + command} How do I set up auto-backup?`);
        await m.reply('🔍 *Searching documentation...*');
        const { buildContext } = require('../lib/docs');
        const context = buildContext(text, 3);
        let prompt;
        if (context) prompt = `You are Maureonix, a WhatsApp bot. Answer the user's question using ONLY the documentation provided below. If the answer is not in the documentation, say "I couldn't find that in my documentation. Try using .docs <name> to read the full guide." Keep answers concise and helpful.\n\n${context}\n\nUser question: ${text}`;
        else prompt = `You are Maureonix. Answer briefly. User question: ${text}`;
        try {
            const res = await AI.ultimateAI(prompt, m.sender, 'deepseek');
            await m.reply(`📚 *Maureonix Help*\n\n${res.text}`);
        } catch (e) { m.reply(`❌ Failed to get answer: ${e.message}`); }
    },
    // Aliases
    clearme: async (nimesha, m, ctx) => { await module.exports.clearreminders(nimesha, m, ctx); },
    addnote: async (nimesha, m, ctx) => { await module.exports.note(nimesha, m, ctx); },
    mynotes: async (nimesha, m, ctx) => { await module.exports.mynotes(nimesha, m, ctx); },
    delnote: async (nimesha, m, ctx) => { await module.exports.delnote(nimesha, m, ctx); },
    addtodo: async (nimesha, m, ctx) => { await module.exports.todo(nimesha, m, ctx); },
    check: async (nimesha, m, ctx) => { await module.exports.done(nimesha, m, ctx); },
    cleartodo: async (nimesha, m, ctx) => { await module.exports.cleartodo(nimesha, m, ctx); },
};
