\# 🔒 Security \& Best Practices – Maureonix v5.0.0



Maureonix is designed with security in mind, protecting both the bot owner and end users. This document outlines the security measures in place, how to securely configure the bot, and best practices for deployment.



---



\## 🛡️ Core Security Principles



| Principle | Implementation |

|-----------|----------------|

| \*\*No Hardcoded Secrets\*\* | All API keys, database URIs, and owner numbers are stored in `config.js` (not committed). |

| \*\*Environment Variable Support\*\* | Supports `.env` for cloud deployments (Railway, Heroku, Docker). |

| \*\*Owner‑Only Command Gating\*\* | Sensitive commands require `isCreator` verification based on `ownerNumber`. |

| \*\*Anti‑Spam \& Rate Limiting\*\* | Commands are cooldown‑protected to prevent flooding. |

| \*\*Input Sanitization\*\* | User input is escaped/sanitized before use in shell commands or APIs. |

| \*\*Error Handling\*\* | Global `uncaughtException` and `unhandledRejection` handlers prevent crashes from leaking sensitive info. |

| \*\*Session Isolation\*\* | Each paired user (JadiBot) gets a dedicated auth folder; sessions never mix. |



---



\## 🔐 Protecting Your API Keys



\### Never Commit `config.js` or `.env`



Add these to your `.gitignore`:

config.js

.env

\*.log

database/

nimadev/

jadibot\_sessions/





\### Use Environment Variables in Production



When deploying to Railway, Heroku, or Docker, set environment variables instead of using `config.js`:



| Variable | Purpose |

|----------|---------|

| `BOT\_NUMBER` | WhatsApp number of the bot |

| `MONGODB\_URI` | MongoDB connection string |

| `GEMINI\_API\_KEY` | Google Gemini API key |

| `GROQ\_API\_KEY` | Groq API key |

| `REMOVE\_BG\_KEY` | remove.bg API key |

| `VOICE\_RSS\_KEY` | Voice RSS API key |



The bot reads these automatically, so you never need to store a `config.js` file on the server.



\### Restrict API Key Permissions



| Service | Recommended Restriction |

|---------|-------------------------|

| \*\*MongoDB Atlas\*\* | Use a dedicated database user with read/write only on the bot's database. Enable IP whitelist if possible. |

| \*\*remove.bg\*\* | The free tier is limited to 50 images/month. Revoke and regenerate if exposed. |

| \*\*Voice RSS\*\* | Free tier limited to 350 requests/day. Regenerate if leaked. |

| \*\*Gemini / Groq\*\* | Monitor usage in respective dashboards. Revoke compromised keys immediately. |



---



\## 👑 Owner Authentication



The bot identifies the owner via the `ownerNumber` array in `config.js`. \*\*All owner‑only commands\*\* check `isCreator`, which verifies:



\- The message is from the bot itself (`m.fromMe`), \*\*OR\*\*

\- The sender's number matches an entry in `ownerNumber`.



\### Adding Multiple Owners



```javascript

ownerNumber: \['254116903500', '254712345678']



Security Note

Never share your ownerNumber slot with untrusted users.



If you pair a second device to the bot's WhatsApp account, anyone with access to that device can run owner commands. Use a dedicated WhatsApp account for the bot.



👥 User Data Privacy

What Data Is Stored?

Data Type	Purpose	Retention

User JID (WhatsApp ID)	Identify users for economy, warnings, settings.	Until user requests deletion or database is reset.

Group JID	Store group settings.	Until bot leaves group.

Message Cache (store)	Anti‑delete, command context.	Cached in memory; persisted every 30s.

AI Conversation History	Context for multi‑turn chats.	Up to 20 messages per user; cleared on .clearmemory.

Reminders \& Notes	User‑created productivity data.	Stored until user deletes them.

Data Deletion

Users can clear their own data with:



.clearmemory – Clear AI conversation history.



.clearreminders – Delete all reminders.



.cleartodo – Clear completed to‑dos.



For full account deletion, the owner can manually remove the user from the database or run a database cleanup script.



Privacy Features

Feature	Description

View‑Once Revealer	.vv reveals "view once" media. Use responsibly.

Anti‑Delete	Resends deleted messages. Disable per‑group with .group antidelete off.

Auto‑Download Status	Downloads statuses to owner's private chat. Enable only if you trust the owner.

🧹 Safe Command Execution

Shell Commands

Some commands (e.g., $, >, <) allow the owner to execute shell commands or JavaScript code. These are restricted to the owner only.



if (budy.startsWith('$')) {

&nbsp;   if (!isCreator) return;

&nbsp;   exec(budy.slice(2), (err, stdout) => { ... });

}



⚠️ Warning: These commands give full system access. Never expose the bot to untrusted users.



FFmpeg \& Child Processes

The .attp and .sticker commands spawn ffmpeg processes. User input is escaped using a custom escTxt function to prevent command injection.



const escTxt = (s) => s

&nbsp;   .replace(/\\\\/g, '\\\\\\\\')

&nbsp;   .replace(/'/g, "\\\\'")

&nbsp;   .replace(/:/g, '\\\\:')

&nbsp;   // ... more escapes

&nbsp;   .replace(/%/g, '\\\\%');



🌐 Network Security

Use HTTPS for All External APIs

All API calls use https:// endpoints. The bot does not make plain HTTP requests.



MongoDB TLS

If using MongoDB Atlas, the connection string includes +srv and TLS is enforced.



Railway / Cloud Deployments

Railway provides a secure tunnel to your bot. The Express server is not exposed publicly unless you configure a public domain.



Environment variables are encrypted at rest.



🚨 Incident Response

If Your API Keys Are Leaked

Immediately revoke the key from the service's dashboard.



Generate a new key and update config.js or environment variables.



Restart the bot to apply changes.



If the Bot Is Sending Spam

Stop the bot immediately (pm2 stop maureonix or Ctrl+C).



Check logs for unauthorized command usage.



Change the bot's WhatsApp password (via WhatsApp Web logout) to invalidate all sessions.



Review ownerNumber and remove any unknown numbers.



Delete the nimadev folder and re‑pair the bot.



If the Database Is Corrupted

Restore from the latest auto‑backup (sent to owner's chat daily).



Place the backup file in ./database/ and restart the bot.



✅ Security Checklist for Deployment

config.js is not committed to Git.



.env is not committed to Git.



ownerNumber contains only trusted numbers.



API keys have appropriate restrictions (IP whitelist, usage limits).



MongoDB user has minimal required permissions.



Bot is running under a non‑root user (on VPS).



PM2 or systemd is used for process supervision.



Logs are rotated and do not contain sensitive data.



Auto‑backup is enabled (.autobackup on).

