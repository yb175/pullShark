

# 🦈 PullShark Backend

> **The intelligence layer for automated code review.**

This repository contains the Node.js/Express API that powers PullShark. It handles the complex orchestration between GitHub Webhooks, OAuth authentication, and our LLM analysis engine to detect logic flaws in real-time.

  

-----

## 🏗️ Architecture & Stack

We utilize a stateless, event-driven architecture designed for high availability and low latency.

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Core API** | **Node.js + Express** | High-throughput, non-blocking request handling. |
| **Data Store** | **MongoDB** | Persistent storage for user profiles and repository metadata. |
| **Cache & Queue** | **Redis** | Distributed rate limiting and job management. |
| **Integration** | **GitHub App API** | Real-time webhook processing and diff fetching. |

-----

## ⚡ Quick Start (Local Environment)

Follow these steps to spin up the backend services locally.

### 1\. Installation

Navigate to the project root and install dependencies.

> cd backend

> npm install

### 2\. Environment Configuration 🔑

The application requires sensitive credentials to function. Create a `.env` file in the root directory.

**Here is exactly where to find each secret:**

### 🍃 Database Setup

**`MONGODB_URI`**

  * **Source:** [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
  * **Path:** Database \> Connect \> Drivers \> Node.js.
  * **Format:** `mongodb+srv://user:pass@cluster.mongodb.net/pullshark`

**`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`**

  * **Source:** [Redis Cloud](https://app.redislabs.com/) or your local terminal.
  * **Note:** If running locally, simply use `localhost` and port `6379`.

***

## 🛡️ GitHub App Permissions (The Policy)

For PullShark to function correctly—authenticating users, reading diffs, and leaving comments—the following configuration must be set in your GitHub App settings: 


### 1. General Settings (URLs & Flows)

| Setting | Configuration | Note |
| :--- | :--- | :--- |
| **User Authorization Callback URL** | Must be configured. | Used for user login (OAuth). |
| **Setup URL** | Must be configured. | Where users land after installation. |
| **Device Flow** | **Enabled** | Necessary for certain future authentication flows. |
| **Post Installation** | **Redirect on update** | Ensures users are brought back to your site after changing installation settings. |
| **Active** | **Checked** | Ensures the Webhook is listening. |

---

### 2. Repository Permissions

These permissions allow the AI to read code, leave comments, and trigger actions.

| Permission | Access Level | Purpose |
| :--- | :--- | :--- |
| **Actions** | Read-only | To observe CI/CD status. |
| **Checks** | Read & Write | To post status checks on PRs. |
| **Contents** | Read-only | To read file contents and retrieve diffs. |
| **Metadata** | Read-only | Basic info about repositories. |
| **Pull Requests** | Read & Write | To read PR data and post review comments. |
| **Webhooks** | Read & Write | To manage webhooks on the repository level. |

### 3. Subscribed Events

These are the specific events GitHub must notify your webhook URL about.

* `Pull request`
* `Pull request review`
* `Pull request review comment`
* `Pull request review thread`

### 4. Organization & Account Permissions

| Permission | Access Level |
| :--- | :--- |
| **Organization Events** | Read-only (Issue Types & Webhooks) |
| **Account Events** | Read-only |
### 🐙 GitHub App Integration

You must create a GitHub App to get these credentials.

  * **Create App Here:** [GitHub Developer Settings \> GitHub Apps](https://github.com/settings/apps)

**`GITHUB_APP_ID`**

  * Found in the "About" section of your App's General settings.

**`GITHUB_CLIENT_ID`**

  * Found in the "About" section right below the App ID.

**`GITHUB_CLIENT_SECRET`**

  * **Path:** General \> Client secrets \> Generate a new client secret.
  * **Important:** Copy this immediately; you will never see it again.

**`GITHUB_PRIVATE_KEY`**

  * **Path:** General \> Private keys \> Generate a private key.
  * **Action:** This downloads a `.pem` file. Open it with a text editor and copy the **entire contents** (including `-----BEGIN RSA PRIVATE KEY-----`) into your `.env` file. It must be one single line (use `\n` for newlines) or a template literal string if your parser supports it.

**`GITHUB_WEBHOOK_SECRET`**

  * **Path:** General \> Webhook.
  * **Action:** Create your own secure password here (e.g., `shark_attack_secure_123`).

**`GITHUB_CALLBACK_URL`**

  * Set this to: `http://localhost:3000/auth/callback`

### 🛡️ Security & Notifications

**`EMAIL_USER`**

  * Your Gmail address for sending system alerts.

**`EMAIL_PASS`**

  * **Source:** [Google Account Security](https://myaccount.google.com/apppasswords)
  * **Path:** Security \> 2-Step Verification \> App passwords.
  * **Note:** Do not use your real login password. Generate a specific 16-character App Password.

**`JWT_SECRET_KEY`**

  * Generate a random string (e.g., using `openssl rand -base64 32` in terminal).

-----

## 3\. Execution

Launch the server.

> **Development Mode** (Hot-Reload Enabled):
> `npm run dev`

> **Production Mode**:
> `npm start`

*Success Indicator:* The console should output `🔌 MongoDB Connected` and `🚀 Server running on Port 3000`.

-----

## 📡 API Reference

The backend exposes three primary router modules.

### 🔐 `/auth` (Authentication)

Handles the OAuth 2.0 flow with GitHub and session management.

  * `GET /auth/redirect` - Initiates the OAuth handshake with GitHub.
  * `GET /auth/callback` - Handling the callback and exchanging codes for tokens.
  * `GET /auth/status` - **[Secured]** Returns the sanitized profile of the current user.
  * `GET /auth/repos` - **[Secured]** Fetches a paginated list of the user's repositories.

### 🎣 `/webhook` (Event Processing)

The primary ingestion point for GitHub events.

  * `POST /webhook/handle` - Verifies the payload signature and triggers the analysis pipeline.
  * `GET /webhook/app-installed` - Verifies if the PullShark App is installed on the user's account.

### 🧠 `/llm` (Analysis Engine)

Direct interface to the logic analysis core.

  * `POST /llm/analysePr/:owner/:repo/:prNumber` - **Manual Trigger.** Forces an immediate analysis of a specific PR (useful for debugging or retrying stalled jobs).

-----

## 📂 Project Structure

A quick map of the codebase organization:

  * **`controllers/`** - Business logic.
      * `auth/` - OAuth exchange and session handling.
      * `llm/` - Prompt engineering and response parsing.
      * `webhook/` - Event filtering and verification.
  * **`middlewares/`** - Request processing chain (`ratelimiter`, `checkBlacklistedToken`).
  * **`utils/`** - Shared utilities (`cleandiff.js` for diff optimization, `githubjwt.js` for app authentication).
  * **`models/`** - Mongoose schemas and data models.

-----

## 🤝 Contributing

We welcome contributions\! Please ensure you lint your code (`npm run lint`) before submitting a PR.

*Built with precision by the PullShark Team.*
