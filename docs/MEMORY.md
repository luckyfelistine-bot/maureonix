\# 🧠 AI Memory – Maureonix



Maureonix retains short‑term conversation context for AI chats.



\## 📋 How It Works

\- Up to \*\*20 messages\*\* per user are stored.

\- Includes both user messages and bot responses.

\- Older messages are discarded (FIFO).



\## 🔄 Commands

| Command | Effect |

|---------|--------|

| `.clearmemory` | Wipes your entire conversation history with the bot. |



\## 📂 Storage

\- Memory is stored \*\*in‑memory only\*\* (not persisted to database).

\- Restarting the bot clears all AI memory.



\## 🧪 Gemini Auto‑Reply Memory

\- Separate memory is used for Gemini auto‑reply in private/groups.

\- History size is configurable via `global.geminiMemorySize` (default: 50).



\## ⚙️ Configuration

In `settings.js`:

```javascript

global.aiMemorySize = 20;          // For GPT/Llama/DeepSeek

global.geminiMemorySize = 50;      // For Gemini auto‑reply



💡 Pro Tip

Use .clearmemory if the AI starts repeating itself or giving irrelevant answers.





