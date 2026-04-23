\# 🎯 Intent Detection – Maureonix



Maureonix uses \*\*prefix‑based command routing\*\*, not natural language intent detection. However, the foundation is in place for future NLU integration.



\## 🔮 Planned Intent Categories (v6.0)

| Intent | Example User Input |

|--------|---------------------|

| `greeting` | "Hello", "Hi bot" |

| `help` | "What can you do?" |

| `weather` | "What's the weather in Nairobi?" |

| `translate` | "Translate hello to Sinhala" |

| `reminder` | "Remind me to call mom at 3pm" |

| `game` | "Let's play a game" |

| `fun` | "Tell me a joke" |



\## 🧩 Current Implementation

Commands are triggered by \*\*exact match\*\* of the first word after the prefix.



```javascript

const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase();

switch (command) {

&nbsp;   case 'ping': ...

}

🚀 Future NLU Pipeline

User message → Intent Classifier (TensorFlow.js / Wit.ai)



Entity Extraction (dates, times, locations)



Route to appropriate handler



Generate contextual response



This will enable natural conversations like:



User: "What's the weather like tomorrow in Mombasa?"

Bot: Fetches and replies with forecast

