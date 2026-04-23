\# 💓 Heartbeat \& Proactive Systems – Maureonix v5.0.0



Maureonix includes several \*\*proactive, self‑maintaining systems\*\* that ensure the bot remains responsive, data is backed up, and users never miss important reminders. These systems run on internal timers and are fully configurable by the owner.



---



\## 🧠 Overview



| System | Purpose | Default Interval |

|--------|---------|------------------|

| \*\*Reminder Heartbeat\*\* | Checks for due reminders and sends notifications. | Every 30 seconds |

| \*\*Auto‑Backup\*\* | Sends a copy of the database to the owner daily. | Every 24 hours (at midnight) |

| \*\*Auto‑Bio Update\*\* | Refreshes the bot's profile bio with current uptime and stats. | Every 10 minutes |

| \*\*Pre‑Key Refresh\*\* | Refreshes Baileys pre‑keys to avoid "closed session" errors. | Every 12 hours |

| \*\*Database Save\*\* | Persists in‑memory database to disk/MongoDB. | Every 30 seconds |

| \*\*Presence Update\*\* | Sends periodic "available" presence to keep connection alive. | Every 10 minutes |

| \*\*Connection Health Check\*\* | Monitors WebSocket and reconnects on disconnect. | Built‑in Baileys |



---



\## ⏰ Reminder Heartbeat



The reminder system allows users to set one‑time or recurring reminders that \*\*survive bot restarts\*\*. Reminders are stored in the database and checked every 30 seconds by a `setInterval` loop.



\### How It Works



1\. \*\*User sets a reminder:\*\* `.remindme 10 Call mom`

2\. \*\*Bot stores reminder\*\* in `db.reminders` array with `user`, `text`, and `due` timestamp.

3\. \*\*Heartbeat checks\*\* every 30 seconds:

&nbsp;  ```javascript

&nbsp;  setInterval(async () => {

&nbsp;      const now = Date.now();

&nbsp;      const due = db.reminders.filter(r => r.due <= now);

&nbsp;      for (const r of due) {

&nbsp;          await sock.sendMessage(r.user, { text: `⏰ \*Reminder!\*\\n\\n${r.text}` });

&nbsp;      }

&nbsp;      db.reminders = db.reminders.filter(r => r.due > now);

&nbsp;  }, 30000);



Related Commands

Command	Description

.remindme <minutes> <text>	Set a reminder.

.reminders	List your active reminders.

.clearme / .clearreminders	Clear all your reminders.

💡 Pro Tip

Reminders persist across bot restarts because they are saved in the database (MongoDB or JSON).



You can have unlimited reminders, but they are stored in memory only while the bot is running. They are reloaded from the database on startup.



💾 Auto‑Backup System

The bot can automatically send a backup of the entire database to the owner's private chat every day at midnight (Africa/Nairobi timezone). This ensures you never lose user data, group settings, or economy progress.



Enabling Auto‑Backup



.autobackup on



How It Works

A cron job runs at 00:00 daily.



The database is written to a file (JSON) or exported from MongoDB.



The file is sent as a document attachment to all owner numbers.



File name format: YYYY-MM-DDTHH-MM-SSZ\_database.json



Manual Backup

You can trigger a manual backup anytime:



.backup database



Backup File Location

Storage Type	Backup Path

JSON	./database/backup\_database.json

MongoDB	Exported to temp JSON file, then sent

💡 Pro Tip

Enable autobackup on production bots to recover quickly from data loss.



Backups are also saved locally, so you can retrieve them via SSH if needed.



📝 Auto‑Bio Update

The bot can automatically update its WhatsApp profile bio with real‑time statistics. This is a great way to show that the bot is active and provide useful info at a glance.



Enabling Auto‑Bio

.autobio on



Bio Template



🦊 Maureonix | 🎯 Runtime: 2d 5h 30m



Update Interval

The bio is refreshed every 10 minutes to reflect the current uptime. The timer resets after each update to avoid hitting WhatsApp rate limits.



💡 Pro Tip

Combine with autoread and autotyping for a fully "alive" bot presence.



If you change the bot's name or status manually, auto‑bio will overwrite it on the next cycle.



🔐 Pre‑Key Refresh

Baileys (the WhatsApp library) uses pre‑keys for end‑to‑end encryption. If pre‑keys are exhausted, the bot may fail to decrypt messages or show "closed session" errors. Maureonix automatically requests new pre‑keys every 12 hours to prevent this.



Implementation



setInterval(async () => {

&nbsp;   if (sock.authState?.creds?.registered) {

&nbsp;       await sock.requestPreKeys(5);

&nbsp;       console.log('🔄 Pre-keys refreshed');

&nbsp;   }

}, 12 \* 60 \* 60 \* 1000);



💡 Pro Tip

This is especially important for bots that are online 24/7.



No user action required—completely automatic.



💽 Database Auto‑Save

To prevent data loss during unexpected crashes, Maureonix saves the in‑memory database to disk (or MongoDB) every 30 seconds.



Implementation



setInterval(async () => {

&nbsp;   if (global.db) await database.write(global.db);

&nbsp;   if (global.store) await storeDB.write(global.store);

}, 30000);



💡 Pro Tip

Combined with auto‑backup, this gives you both frequent local saves and daily off‑site backups.



If using MongoDB, writes are atomic and durable.



📡 Presence Keep‑Alive

The bot sends an available presence update every 10 minutes to keep the WhatsApp connection alive and prevent timeouts.



setInterval(async () => {

&nbsp;   await sock.sendPresenceUpdate('available');

}, 10 \* 60 \* 1000);



💡 Pro Tip

This is standard practice for long‑running Baileys bots.



Does not affect the bot's "online" status visibility (controlled by privacy settings).



🔄 Connection Health \& Auto‑Reconnect

Baileys automatically handles disconnections with exponential backoff. Maureonix enhances this with:



Disconnect Reason	Action

loggedOut	Clears session and re‑pairs.

badSession	Clears pre‑keys and retries.

connectionReplaced	Waits 45s and reconnects.

multideviceMismatch	Clears session keys and retries.

Other	Exponential backoff (5s → 10s → 20s … max 60s).

💡 Pro Tip

If the bot frequently disconnects, try deleting the nimadev folder and re‑pairing.



Ensure your server has a stable internet connection.



🧪 Testing the Heartbeat

You can verify all systems are working by:



Set a test reminder: .remindme 1 Test – should notify you in 1 minute.



Check auto‑backup: Enable .autobackup on and wait until midnight (or change system time for testing).



View automation status: .automation shows all active toggles.



📊 Summary of Intervals

System	Interval	Configurable

Reminder check	30 seconds	❌

Auto‑backup	24 hours (midnight)	❌

Auto‑bio update	10 minutes	❌

Pre‑key refresh	12 hours	❌

Database save	30 seconds	❌

Presence keep‑alive	10 minutes	❌

All intervals are hard‑coded for optimal performance and reliability.





