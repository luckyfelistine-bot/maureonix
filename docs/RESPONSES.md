\# 💬 Response Templates – Maureonix



Standard response templates used throughout the bot. Customize in `lib/function.js` or individual command cases.



\## ✅ Success Messages

✅ Success!

━━━━━━━━━━━━━━━━━━━━━━

{message}

━━━━━━━━━━━━━━━━━━━━━━



\## ❌ Error Messages



❌ Error

{error}



\## ⏳ Loading Messages

⏳ {action}...



\## 📋 List Format

╭──❍「 {title} 」❍

│• {item1}

│• {item2}

╰──────❍



\## 🎮 Game Boards

1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣

⚪⚪⚪⚪⚪⚪⚪

⚪⚪⚪⚪⚪⚪⚪

⚪⚪⚪⚪⚪⚪⚪

⚪⚪⚪⚪⚪⚪⚪

⚪⚪🔴🟡⚪⚪⚪

⚪🔴🟡🟡🔴⚪⚪

1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣





\## 👤 Profile Card

👤 Profile @{user}

━━━━━━━━━━━━━━━━━━━━━━

🐋 Bot User: {isUser}

🔥 Status: {premium/vip/free}

🎫 Limit: {limit}

💰 Money: {money}

━━━━━━━━━━━━━━━━━━━━━━



\## 🤖 AI Response

🤖 {model}

{response}



\## 🌐 Translation

🌐 Translated ({lang})

{translatedText}



---



\## 🎨 Customizing

Edit the strings directly in `maureonix\_commands.js` or create a `templates.js` module for centralized management.

