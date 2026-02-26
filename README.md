# 🦈 PullShark AI
> **Catch logic bombs before they blow up production.**

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]() [![Bug Hunter](https://img.shields.io/badge/Status-Hungry-red.svg)]() [![Risk Level](https://img.shields.io/badge/Risk_Level-Zero-blue.svg)]()

---

### 🤔 The Problem: "But it passed the Linter!"

We've all been there.
1. You write code.
2. The linter says "No syntax errors! ✅"
3. The tests pass.
4. You merge to production.
5. **The server crashes because of an infinite loop in an edge case nobody thought of.** 💥

Standard tools check your **syntax** (commas, brackets, styles). They don't check your **logic**.

### 💡 The Solution: Meet PullShark

**PullShark AI** is an automated Senior Engineer that lives in your Pull Requests. It doesn't care about your indentation; it cares about your **code's behavior**.

It simulates execution paths to find "Logic Bombs"—infinite loops, resource exhaustion, and unhandled edge cases—that human reviewers and standard linters often miss.

---

### 📸 See It In Action
[![Watch the video](https://img.youtube.com/vi/_3XEFBSeCr8/maxresdefault.jpg)](https://www.youtube.com/watch?v=_3XEFBSeCr8)


> **The "One-Line Change" Disaster:**
> In our demo, a developer changed a simple log message. A linter would call this "trivial."
> **PullShark saw the truth:** That change was inside a conditional block where the `else` statement contained a `while(true)` loop that would freeze the server if the input wasn't perfect.
> **Result:** Crisis averted. 🛑

---

### 🚀 Key Features

**🧠 Behavioral Analysis (Not Just Regex)**
PullShark understands control flow. It knows that `while(true)` is fine in a background worker but **fatal** in a request handler.

**🛡️ Security First**
It flags potential **Denial of Service (DoS)** vectors where user input could trick your app into hanging or consuming 100% CPU.

**🧪 Automatic Test Architect**
Don't just fix the bug—prove it's fixed. PullShark generates **Checklists & Test Plans** for QA, specifically targeting the edge cases you missed (e.g., *"What happens if this API returns `null` instead of `1`?"*).

**💬 No Noise, Just Signal**
We won't spam you about trailing spaces. We only speak up when there's a real risk. If PullShark comments, **you should listen.**

---

### ⚡ How It Works

1.  **Install the App:** Add PullShark to your GitHub repo (SaaS or Self-Hosted).
2.  **Open a PR:** Work as usual.
3.  **The Shark Swims:** PullShark silently analyzes the logic changes in the background.
4.  **The Bite:** If a high-risk logic error is found, PullShark posts a detailed alert with a reproduction path.

---

### 🥊 PullShark vs. The Rest

| Feature | 🤖 Standard Linter | 🐰 Other AI Bots | 🦈 PullShark |
| :--- | :---: | :---: | :---: |
| Checks Syntax? | ✅ | ✅ | ✅ |
| Writes Poems? | ❌ | ✅ | ❌ (We're busy) |
| **Predicts Crashes?** | ❌ | 🤷‍♂️ | ✅ **YES** |
| **Prevents Downtime?** | ❌ | ❌ | ✅ **YES** |

--- 
## Running the App

### Frontend (Local)

Prerequisites:
- Node.js 20+

```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

### Backend (Docker)

Prerequisites:

- Docker
- Docker Compose

#### Creating the image
```bash
docker compose up --build
```

#### Running the container
```bash
docker compose up
```

#### Stopping the container
```bash
docker compose down
```
### 🤝 Join the School

Stop letting "happy path" programming break your builds. Let PullShark handle the deep waters.

**[Get Started Now]** • **[Read the Docs]** • **[Contact Sales]**

---
*Built with ❤️ (and safety checks) by the PullShark Team.*
