---
tracker:
  kind: github
  api_key: $GITHUB_TOKEN
  project_slug: luckyfelistine-bot/maureonix
  active_states:
    - open
  terminal_states:
    - closed

polling:
  interval_ms: 30000

workspace:
  root: ./.symphony/workspaces

hooks:
  after_create: |
    echo "Workspace created for issue"
    npm install 2>/dev/null || true
  before_run: |
    echo "Starting agent session"
  after_run: |
    echo "Agent session complete"
  before_remove: |
    echo "Cleaning workspace"
  timeout_ms: 60000

agent:
  max_concurrent_agents: 3
  max_turns: 20
  max_retry_backoff_ms: 300000

codex:
  command: node lib/symphonyAgentRunner.js
  turn_timeout_ms: 3600000
  read_timeout_ms: 5000
  stall_timeout_ms: 300000

notifications:
  whatsapp_enabled: true
  email_enabled: true
  alert_on_completion: true
  alert_on_failure: true

server:
  port: 8080
---

You are a Symphony coding agent working on GitHub issue {{issue.identifier}}: "{{issue.title}}".

Your task is to:
1. Read and understand the issue description
2. Explore the codebase to understand the context
3. Implement the required fix or feature
4. Write tests if applicable
5. Run existing tests to ensure no regressions
6. Commit changes with a descriptive message
7. Report completion with DONE: summary

Issue Details:
- ID: {{issue.identifier}}
- Title: {{issue.title}}
- State: {{issue.state}}
- Labels: {{issue.labels | join: ", "}}
- URL: {{issue.url}}

{% if attempt %}
This is retry attempt {{attempt}}. Previous attempts may have failed. Be extra careful.
{% endif %}

Use Maureonix system commands to accomplish this task:
- read_file /path/to/file
- write_file /path/to/file
<content>
- exec_cmd <command>
- git_pull / git_push
