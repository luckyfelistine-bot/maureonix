\# 🛠️ Admin Guide – Maureonix



This guide is for \*\*group admins\*\* who want to use Maureonix to manage their communities.



\## 📌 Prerequisites

\- The bot must be \*\*added to the group\*\*.

\- The bot must be \*\*promoted to admin\*\* (to use kick, promote, etc.).



\## 👥 Member Management



| Action | Command |

|--------|---------|

| Add member | `.add 254712345678` |

| Kick member | `.kick @user` |

| Promote to admin | `.promote @user` |

| Demote admin | `.demote @user` |

| Warn member | `.warn @user` |

| Remove warnings | `.unwarn @user` |



\## ⚙️ Group Settings



| Setting | Command |

|---------|---------|

| Change group name | `.setname New Name` |

| Change description | `.setdesc Welcome!` |

| Set group picture | Reply to image with `.setppgc` |

| Get invite link | `.linkgroup` |

| Reset invite link | `.revoke` |

| Open/Close group | `.group open` / `.group close` |

| Enable disappearing messages | `.group disappearing 7` (days) |



\## 🛡️ Protection Toggles



| Feature | Enable | Disable |

|---------|--------|---------|

| Anti‑Link | `.group antilink on` | `.group antilink off` |

| Anti‑Virtex | `.group antivirtex on` | `.group antivirtex off` |

| Anti‑Delete | `.group antidelete on` | `.group antidelete off` |

| Anti‑Toxic | `.group antitoxic on` | `.group antitoxic off` |

| Anti‑Hidetag | `.group antihidetag on` | `.group antihidetag off` |

| Welcome Message | `.group welcome on` | `.group welcome off` |

| NSFW Filter | `.group nsfw on` | `.group nsfw off` |



\## 📢 Announcements



| Action | Command |

|--------|---------|

| Tag all members | `.tagall Important announcement` |

| Hidden tag all | `.hidetag Secret message` |



\## 💡 Tips

\- Use `.listonline` to see who's currently active.

\- Customize welcome/leave messages with `.group setwelcome <text>` (use `@` for mention).

