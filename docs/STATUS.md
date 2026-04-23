\# 📊 Status \& Monitoring – Maureonix



Real‑time status information available via commands and HTTP endpoint.



\## 🤖 Bot Commands



| Command | Output |

|---------|--------|

| `.ping` | Response time and WebSocket state |

| `.alive` | Uptime, RAM, users, groups |

| `.stats` | Commands run, total users/groups |

| `.runtime` | Formatted uptime |

| `.info` | Full bot information |



\## 🌐 HTTP Endpoints



| Endpoint | Description |

|----------|-------------|

| `GET /health` | JSON health check |

| `GET /qr` | QR code image (when pairing) |



\## 📈 Prometheus Metrics (Future)

Planned for v5.2:



HELP maureonix\_commands\_total Total commands executed

TYPE maureonix\_commands\_total counter

maureonix\_commands\_total{command="ping"} 150



HELP maureonix\_users\_active Active users in last 24h

TYPE maureonix\_users\_active gauge

maureonix\_users\_active 42





\## 🔔 Alerting

Configure external monitoring (UptimeRobot, Healthchecks.io) to ping `/health` every 5 minutes. Alert if:

\- Response ≠ 200

\- `status` ≠ "ok"

\- Response time > 10s



\## 📋 Status Dashboard (Railway)

If deployed on Railway, view logs and metrics in the dashboard.



\## 📱 WhatsApp Status

The bot can post status updates (owner only) with `.upsw`. Use to announce maintenance or downtime.

