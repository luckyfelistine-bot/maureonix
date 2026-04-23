\# 🔐 Authentication – Maureonix



Maureonix uses \*\*Baileys\*\* for WhatsApp Multi‑Device authentication.



\## 📱 Pairing Methods



\### 1. Pairing Code (Recommended)

\- Set `global.pairing\_code = true` in `settings.js`.

\- Bot displays an 8‑character code in the terminal.

\- User enters code in WhatsApp: \*\*Settings → Linked Devices → Link a Device\*\*.



\### 2. QR Code

\- Set `global.pairing\_code = false`.

\- Scan QR code with WhatsApp.



\## 📂 Session Storage

\- Auth state is saved in the `nimadev/` folder.

\- \*\*Never share this folder\*\*—it contains your private keys.



\## 👥 Multi‑User (JadiBot)

Each paired user gets their own auth folder: `jadibot\_sessions/{userJid}/`.

These are isolated and managed by `src/jadibot.js`.



\## 🔄 Session Expiry

\- Sessions do not expire unless you log out from WhatsApp.

\- If the bot is inactive for a long time, WhatsApp may require re‑pairing.



\## 🛡️ Security

\- Use a \*\*dedicated WhatsApp number\*\* for the bot—not your personal number.

\- Enable two‑step verification on the WhatsApp account.

\- Regularly backup `nimadev/` to avoid losing session.



\## 🚨 Logged Out

If the bot is logged out (`DisconnectReason.loggedOut`), the `nimadev/` folder is cleared and you must re‑pair.

