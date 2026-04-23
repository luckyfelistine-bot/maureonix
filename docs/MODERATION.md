\# 🚨 Moderation Guide – Maureonix



Maureonix includes automated and manual moderation tools to keep groups safe.



\## 🛡️ Automated Protections



| Feature | What It Does |

|---------|--------------|

| \*\*Anti‑Link\*\* | Deletes messages containing `chat.whatsapp.com` links. |

| \*\*Anti‑Virtex\*\* | Deletes unusually long/buggy messages. |

| \*\*Anti‑Delete\*\* | Resends deleted messages (so admins can see). |

| \*\*Anti‑Toxic\*\* | Deletes messages with bad words (customizable). |

| \*\*Anti‑Hidetag\*\* | Detects and warns users who tag everyone without permission. |

| \*\*Anti‑Tag Status\*\* | Warns/kicks users who tag the group in WhatsApp statuses. |



Enable/disable with `.group <feature> on/off`.



\## 👮 Manual Moderation



| Action | Command |

|--------|---------|

| Warn user | `.warn @user` |

| Remove warnings | `.unwarn @user` |

| Kick user | `.kick @user` |

| Mute group (bot ignores commands) | `.mute` / `.unmute` |

| Delete message | Reply with `.delete` |



\## 📋 Warning System

\- 3 warnings = auto‑kick (configurable in code).

\- Warnings are stored per‑group.



\## 🔇 Keyword Filters

Owner can set auto‑block/kick/mute keywords globally:

\- `.autoblock spam,scam` – blocks users who send these words.

\- `.autokick invite,link` – kicks group members.

\- `.automute badword` – deletes messages.



View current filters with `.automation`.

