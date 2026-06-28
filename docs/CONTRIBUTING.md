\# 🤝 Contributing to Maureonix



Thank you for your interest in contributing to Maureonix! This document provides guidelines for submitting issues, feature requests, and code contributions.



---



\## 📋 Code of Conduct



This project and everyone participating in it is governed by the \[Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code\_of\_conduct/). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainer.



---



\## 🐛 Reporting Issues



\### Bug Reports



If you find a bug, please open an issue on GitHub with the following information:



\- \*\*Bot Version\*\* (from `.info` or `package.json`)

\- \*\*Node.js Version\*\* (`node -v`)

\- \*\*Deployment Platform\*\* (Termux, VPS, Railway, etc.)

\- \*\*Steps to Reproduce\*\* the issue

\- \*\*Expected Behavior\*\* vs \*\*Actual Behavior\*\*

\- \*\*Relevant Logs\*\* (copy from terminal or `logs/` folder)



\### Security Vulnerabilities



If you discover a security vulnerability, please \*\*DO NOT\*\* open a public issue. Instead, email the maintainer directly at `infinitevybeflix@proton.me` (or your preferred contact). We will address the issue promptly and credit you in the release notes (if desired).



\### Feature Requests



We welcome feature requests! Please open an issue with:



\- A clear description of the feature

\- Why it would be useful to users

\- Any implementation ideas you have



Label the issue with `enhancement`.



---



\## 💻 Code Contributions



\### Getting Started



1\. \*\*Fork\*\* the repository on GitHub.

2\. \*\*Clone\*\* your fork locally:

&nbsp;  ```bash

&nbsp;  git clone https://github.com/your-username/maureonix.git

&nbsp;  cd maureonix

3.Install dependencies:

npm install

4.Create a new branch for your changes:

git checkout -b feature/your-feature-name



Development Environment

Node.js: ≥20.0.0



Recommended Editor: VS Code with ESLint and Prettier extensions.



Testing: Run npm start and test commands in WhatsApp.



Coding Standards

Rule	Description

Indentation	4 spaces (no tabs)

Quotes	Single quotes ' for strings, except when escaping is needed

Semicolons	Always use semicolons

Line Length	Max 120 characters

Variable Naming	camelCase for variables/functions, PascalCase for classes

Case Labels	Use descriptive names, match command aliases

Command Case Template

case 'commandname': case 'alias': {

&nbsp;   if (!text) return m.reply(`Example: ${prefix + command} <argument>`);

&nbsp;   // Your code here

&nbsp;   await m.reply('Response');

}

break



Commit Messages

Use the Conventional Commits format:

<type>(<scope>): <description>



\[optional body]



\[optional footer]





Type	Purpose

feat	New feature

fix	Bug fix

docs	Documentation only

style	Code style (formatting, missing semicolons)

refactor	Code change that neither fixes a bug nor adds a feature

perf	Performance improvement

test	Adding or correcting tests

chore	Build process, tooling, dependencies

Example:

feat(games): add roulette casino game



\- Added roulette case with betting options

\- Integrated with economy system

\- Added fallback for API failures



Closes #42

Adding a New Command

Open maureonix\_commands.js.



Add a new case block under the appropriate category section.



Follow the template above.



Test locally by running the bot and using the command.



Update COMMANDS.md with the new command (if documentation is updated).



Adding a New Library Module

If you're adding a new helper module (e.g., lib/newmodule.js):



Create the file with a clear export structure.



Import it in maureonix\_core.js.



Pass it through the ctx object to maureonix\_commands.js.



Update ARCHITECTURE.md if it's a significant addition.



🔄 Pull Request Process

Ensure your branch is up‑to‑date with main:



git fetch origin

git rebase origin/main



Run a syntax check:

node --check maureonix\_commands.js

node --check maureonix\_core.js

node --check index.js



Test thoroughly on a test WhatsApp number.



Push your branch:



git push origin feature/your-feature-name



Open a Pull Request on GitHub with:



A clear title and description.



Reference to any related issues (e.g., Closes #123).



Screenshots or logs if applicable.



Wait for review. The maintainer may request changes. Be responsive and update your PR accordingly.



Once approved, your PR will be merged. Congratulations! 🎉



📚 Documentation Contributions

Documentation is just as important as code! You can contribute by:



Fixing typos or unclear instructions.



Adding examples to existing docs.



Translating documentation into other languages (Sinhala, Swahili, etc.).



Creating video tutorials.



Documentation files are in the docs/ folder and follow Markdown format.



🧪 Testing

Currently, Maureonix does not have an automated test suite. Manual testing is required.



Testing Checklist for New Commands

Works in private chat.



Works in group (if applicable).



Handles missing arguments gracefully.



Handles API failures (fallback works).



Does not crash the bot.



Respects isLimit, isPremium, isCreator checks.



🌐 Translations

Maureonix is used worldwide. If you'd like to contribute translations:



Locale files are not yet implemented. Please open an issue to discuss the best approach.



For now, you can translate command descriptions in COMMANDS.md.



❓ Questions?

If you have questions about contributing, feel free to:



Open a GitHub Discussion



Join the WhatsApp Group



DM the maintainer on WhatsApp (for urgent matters)



Thank you for helping make Maureonix better! 💙









