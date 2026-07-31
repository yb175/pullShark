# Changelog

All notable changes to the **PullShark** project are documented in this file.

---

## [Unreleased] - 2026-08-01

### 🔐 Authentication & Cross-Origin Fixes (Vercel + Render Migration)
- **SameSite=None & Secure Cookie Options**:
  - Updated cookie setting logic in `backend/controllers/auth/exchangecode.js` and `backend/middlewares/refreshTokenMiddleware.js` to set `sameSite: "none"` and `secure: true` in production (`NODE_ENV=production`).
  - Enables cross-site cookie transmission between frontend (`pull-shark-phi.vercel.app`) and backend (`pullshark.onrender.com`).
- **Express Proxy Trust**:
  - Added `app.set("trust proxy", 1)` in `backend/server.js` so Express correctly trusts reverse proxy headers (`X-Forwarded-Proto`) sent by Render's load balancers.
- **Cross-Site Logout Cleanup**:
  - Updated `backend/controllers/auth/logoutuser.js` to pass matching `sameSite` and `secure` options when invoking `res.clearCookie`, ensuring modern browsers delete cross-site cookies on logout.

### ⚙️ Worker & Queue Service Integration
- **Single-Process BullMQ Worker**:
  - Integrated `backend/worker/analysis.worker.js` directly into `backend/server.js`.
  - The BullMQ worker now runs inside the Express Web Service instance, eliminating the need for a separate paid Render Background Worker service.
- **Worker Logging & Cleanup**:
  - Added explicit lifecycle logging to `analysis.worker.js` (`[Worker] Running PR analysis...`, `[Worker] Analysis finished successfully...`).
  - Removed obsolete debug logs from `handleWebhook.js`.

### 📄 Environment & Documentation Updates
- **Updated `backend/.env.sample`**:
  - Added missing keys: `NODE_ENV`, `FRONTEND_URL`, `LLM_ANALYSIS_URL`, `DATABASE_URL`, and organized all service configuration sections.
- **Created `frontend/.env.sample`**:
  - Documented `VITE_API_BASE_URL` and `VITE_API_URL` configuration for Vite.
- **Added `CHANGELOG.md`**:
  - Created repository changelog for tracking release updates and architecture fixes.
