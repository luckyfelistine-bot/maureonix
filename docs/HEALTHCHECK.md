\# 💚 Health Check – Maureonix



Maureonix exposes a simple HTTP endpoint for monitoring.



\## 🌐 Endpoint



GET /health





\## 📤 Response

```json

{

&nbsp; "status": "ok",

&nbsp; "uptime": 123456.789,

&nbsp; "user": "254116903500@s.whatsapp.net",

&nbsp; "timestamp": "2026-04-21T12:00:00.000Z"

}



🔧 Usage

cURL



curl http://localhost:3000/health



Uptime Monitoring Services

UptimeRobot – Ping every 5 minutes.



Healthchecks.io – Cron‑style monitoring.



BetterStack – Advanced logging and heartbeat.



🚨 Alerts

Configure your monitoring service to alert you if:



Response is not 200 OK.



status field is not "ok".



Response time exceeds 5 seconds.



📍 Port

The health check runs on the same port as the Express server (default: 3000). Change with PORT environment variable.





---



\### 📄 `docs/LOGGING.md`



```markdown

\# 📜 Logging – Maureonix



Maureonix outputs logs to the console (stdout/stderr). For production, use a process manager like PM2.



\## 📂 PM2 Logs

```bash

pm2 logs maureonix

pm2 logs maureonix --lines 100

pm2 flush maureonix



🗂️ Log Files (PM2)

~/.pm2/logs/maureonix-out.log

~/.pm2/logs/maureonix-error.log



📊 What's Logged

Level	Content

Info	Command usage, connection status, auto‑backup

Error	API failures, database errors, uncaught exceptions

Debug	(Optional) Detailed Baileys protocol messages

🔍 Filtering Logs



\# View only errors

pm2 logs maureonix --err



\# Search for specific text

pm2 logs maureonix | grep "ERROR"



⚙️ Log Rotation (PM2)

pm2 install pm2-logrotate

pm2 set pm2-logrotate:max\_size 10M

pm2 set pm2-logrotate:retain 7



🔒 Security Note

Logs may contain sensitive information (phone numbers, message content). Do not share logs publicly.





