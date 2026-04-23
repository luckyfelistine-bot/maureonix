\# 👤 User Roles \& Permissions – Maureonix



Maureonix has a tiered permission system that controls access to commands and features.



| Role | Identifier | Description |

|------|------------|-------------|

| \*\*Owner\*\* | Number in `global.owner` | Full bot control, all commands, bypasses all limits. |

| \*\*Co‑Owner\*\* | Numbers in `set.owner` array | Same as Owner, can be added/removed by Owner. |

| \*\*Premium\*\* | Entry in `db.premium` | Increased limits, exclusive commands, no daily reset. |

| \*\*VIP\*\* | `db.users\[jid].vip = true` | Higher limits than Premium, custom perks. |

| \*\*Group Admin\*\* | Group participant with admin status | Can use group management commands (if bot is admin). |

| \*\*User\*\* | Default | Standard limits, basic commands. |

| \*\*Banned\*\* | `db.users\[jid].ban = true` | Cannot use any command. |



\*\*Owner Commands for Role Management:\*\* `.addowner`, `.delowner`, `.addprem`, `.delprem`, `.ban`, `.unban`.

