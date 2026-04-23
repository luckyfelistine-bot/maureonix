\# 👑 Owner Guide – Maureonix



This guide is for the \*\*bot owner\*\*. You have full control over the bot and its data.



\## 🔐 Authentication

The owner is identified by the `ownerNumber` array in `config.js`. You can add co‑owners with `.addowner`.



\## 📊 Monitoring



| Command | Description |

|---------|-------------|

| `.stats` | Bot statistics (uptime, users, groups, commands run) |

| `.listpc` | List all private chats the bot is in |

| `.listgc` | List all groups the bot is in |

| `.listprem` | List premium users and their expiry |

| `.listblock` | List blocked numbers |



\## 👥 User Management



| Command | Description |

|---------|-------------|

| `.ban @user` | Ban a user from using the bot |

| `.unban @user` | Remove ban |

| `.addprem @user \\| 30d` | Grant premium for 30 days |

| `.delprem @user` | Remove premium |

| `.addmoney @user 10000` | Give money |

| `.addlimit @user 50` | Add command limit |



\## 🤖 Bot Control



| Command | Description |

|---------|-------------|

| `.block @user` | Block on WhatsApp |

| `.unblock @user` | Unblock on WhatsApp |

| `.allblock` | Block all known contacts |

| `.allunblock` | Unblock everyone |

| `.join <link>` | Join a group via invite link |

| `.leave` | Leave current group |

| `.clearchat` | Delete many messages at once |

| `.backup database` | Manually backup database |

| `.shutdown` | Stop the bot |



\## ⚡ Automation

Use `.automation` to view all toggles. Enable features like:

\- `.autobackup on` – daily database backup sent to you.

\- `.autodownload on` – statuses downloaded to your private chat.

\- `.autoforward <jid>` – forward all messages to you.



\## 🚨 Emergency

If the bot misbehaves:

1\. `.shutdown` to stop immediately.

2\. Check logs (`pm2 logs maureonix`).

3\. Restore from backup if needed.

