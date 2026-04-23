\# 📈 Scaling – Maureonix



Recommendations for running Maureonix at scale.



\## 🖥️ Single Instance Limits

| Resource | Recommended Max |

|----------|-----------------|

| Concurrent Chats | ~500 groups + private |

| Messages per Minute | ~200 (WhatsApp rate limits) |

| JadiBot Users | 10–20 (RAM dependent) |



\## 🚀 Vertical Scaling (Upgrade Server)

| Users | RAM | CPU |

|-------|-----|-----|

| < 100 | 1 GB | 1 vCPU |

| 100–500 | 2 GB | 2 vCPU |

| 500–1000 | 4 GB | 4 vCPU |

| 1000+ | 8+ GB | 4+ vCPU |



\## 🌐 Horizontal Scaling (Multiple Instances)

\- Run separate bot instances on different phone numbers.

\- Use a shared MongoDB Atlas database for unified state.

\- Route users to different instances via WhatsApp Business API.



\## 📊 Database Scaling

| Storage | Use Case |

|---------|----------|

| JSON file | Development, < 50 users |

| MongoDB Local | Small production |

| MongoDB Atlas | Production, auto‑scaling, backups |



\## 🔄 Load Balancing (JadiBot)

Each paired user runs their own socket—this distributes load naturally. Monitor with `pm2 monit`.



\## 🛑 Rate Limiting

\- WhatsApp: ~50 messages/minute per number.

\- Use delays between bulk operations (e.g., `.tagall` splits messages).

\- Consider Business API for higher limits.

