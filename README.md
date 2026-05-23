# 🦈 PullShark AI

> Automated PR analysis focused on reliability, edge cases, and risky logic paths.

 

---

## 🤔 Why PullShark?

Traditional linters and formatters are great at catching syntax and style issues, but many production issues come from logic errors, risky edge cases, or unexpected execution paths.

PullShark is an experimental automated code review system that analyzes pull requests and highlights potentially risky logic changes before they get merged.

The goal isn’t to replace human review — it’s to help developers catch issues earlier and focus attention on high-risk areas.

---

## ⚡ What It Currently Focuses On

* Detecting potentially risky control-flow patterns
* Highlighting edge-case heavy code paths
* Surfacing logic that may lead to resource exhaustion or unstable execution
* Generating review notes and testing suggestions for suspicious changes
* Reducing noisy review comments and focusing on meaningful risks

---

## 🏗️ Built Around

* GitHub App webhooks
* Background PR analysis pipelines
* LLM-assisted review workflows
* Redis-backed processing
* Async job execution
* Reliability-first backend design

---

## 📸 Demo

[![Watch the video](https://img.youtube.com/vi/_3XEFBSeCr8/maxresdefault.jpg)](https://www.youtube.com/watch?v=_3XEFBSeCr8)

---

## ⚙️ Running Locally

### Prerequisites

* Node.js
* Docker
* Docker Compose
* GitHub App credentials
* MongoDB instance
* Redis instance

---

### 1. Clone the Repository

```bash
git clone https://github.com/yb175/pullShark.git
cd pullShark
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the project root and add the required credentials:

```env
MONGODB_URI=
REDIS_HOST=
REDIS_PORT=
GITHUB_APP_ID=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
JWT_SECRET_KEY=
```

You can find a more detailed setup guide in the backend documentation.

---

### 4. Start Services with Docker

```bash
docker compose up --build
```

---

### 5. Run the Development Server

```bash
npm run dev
```

The server should now be running locally.

---


## 🚀 Current Direction

PullShark is still evolving, but the broader idea is to explore how automated systems can assist engineers in reviewing complex pull requests, identifying risky behavior, and improving developer workflows around code review.

---

## 🤝 Contributions

Contributions, feedback, and discussions are always welcome.
