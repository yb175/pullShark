# Security Remediation Plan

**Project:** pullShark Backend  
**Date:** December 29, 2025  
**Status:** Pending Implementation

---

## Overview

This document provides a detailed, step-by-step remediation plan for the 12 security vulnerabilities identified in the pullShark backend application. Each vulnerability includes specific code changes, affected files, and implementation steps.

---

## Phase 1: Critical Immediate Fixes (24-48 Hours)

### Fix #1: Remove GitHub Tokens from JWT Payloads

**Vulnerability:** #2 - Sensitive Data Exposure in JWT Tokens  
**Priority:** P0 - Critical  
**Estimated Time:** 2-3 hours

#### Affected Files:
- `backend/controllers/auth/exchangecode.js`
- `backend/middlewares/refreshTokenMiddleware.js`
- `backend/controllers/llm/analysePr.js`
- `backend/controllers/auth/getUserRepos.js`
- `backend/utils/decryptGithubToken.js`

#### Implementation Steps:

1. **Update JWT Payload Structure** (`exchangecode.js`, lines 73-84):
   ```javascript
   // BEFORE (VULNERABLE):
   const accessToken = jwt.sign(
     {
       id: user.userId,
       username: user.username,
       email: user.email,
       avatarUrl: user.avatarUrl,
       ghTokenExpiresAt: ghAccessTokenExpiresAt,
       ghAccessToken: access_token,  // ❌ REMOVE THIS
     },
     process.env.JWT_SECRET_KEY,
     { expiresIn: "4d" }
   );

   // AFTER (SECURE):
   const accessToken = jwt.sign(
     {
       id: user.userId,
       username: user.username,
       email: user.email,
       avatarUrl: user.avatarUrl,
       sessionId: crypto.randomUUID(), // Add session tracking
     },
     process.env.JWT_SECRET_KEY,
     { expiresIn: "4d" }
   );
   ```

2. **Update Middleware to Fetch Token from DB** (`refreshTokenMiddleware.js`):
   ```javascript
   // Add after user is fetched from DB (line 34)
   // Token is already available in user.accessToken
   // No need to decode from JWT
   ```

3. **Update All Token Usage** - Replace JWT-decoded tokens with DB-fetched tokens:
   - `analysePr.js`: Use `req.user.accessToken` instead of `payload.ghAccessToken`
   - `getUserRepos.js`: Use `req.user.accessToken` instead of decoded payload

#### Testing:
- ✅ Verify JWT no longer contains `ghAccessToken` field
- ✅ Decode JWT and inspect payload
- ✅ Test all authenticated endpoints still work
- ✅ Verify token refresh mechanism works

---

### Fix #2: Add Secure Cookie Flags

**Vulnerability:** #3 - Missing HTTPS/Secure Flag on Authentication Cookies  
**Priority:** P0 - Critical  
**Estimated Time:** 30 minutes

#### Affected Files:
- `backend/controllers/auth/exchangecode.js` (lines 88-91)
- `backend/middlewares/refreshTokenMiddleware.js` (lines 112-115)

#### Implementation Steps:

1. **Create Cookie Configuration Utility** (`backend/utils/cookieConfig.js`):
   ```javascript
   export const secureCookieOptions = {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict',
     maxAge: 2 * 60 * 60 * 1000, // 2 hours
     domain: process.env.COOKIE_DOMAIN || undefined,
   };
   ```

2. **Update Cookie Setting in exchangecode.js**:
   ```javascript
   import { secureCookieOptions } from "../../utils/cookieConfig.js";

   res.cookie("accesstoken", accessToken, secureCookieOptions);
   ```

3. **Update Cookie Setting in refreshTokenMiddleware.js**:
   ```javascript
   import { secureCookieOptions } from "../utils/cookieConfig.js";

   res.cookie("accesstoken", newAppAccessToken, secureCookieOptions);
   ```

4. **Add Environment Variable**:
   - Update `.env.sample`: Add `COOKIE_DOMAIN=`
   - Update documentation with proper domain configuration

#### Testing:
- ✅ In production mode, verify `secure` flag is set
- ✅ In development, verify cookies work without HTTPS
- ✅ Test CSRF protection with `sameSite: strict`
- ✅ Verify cookies are not accessible via JavaScript

---

### Fix #3: Add Authentication to LLM Endpoint

**Vulnerability:** #7 - Missing Authentication on LLM Endpoint  
**Priority:** P0 - Critical  
**Estimated Time:** 15 minutes

#### Affected Files:
- `backend/routes/llm.js`

#### Implementation Steps:

1. **Update Route Configuration**:
   ```javascript
   import express from "express"
   import analysePr from "../controllers/llm/analysePr.js"
   import checkBlacklistedToken from "../middlewares/checkBlacklistedToken.js"
   import refreshTokenMiddleware from "../middlewares/refreshTokenMiddleware.js"
   import rateLimiter from "../middlewares/ratelimiter.js"

   const llmRouter = express.Router()

   llmRouter.post(
     "/analysePr/:owner/:repo/:prNumber",
     rateLimiter,                    // Add rate limiting
     checkBlacklistedToken,          // Check token validity
     refreshTokenMiddleware,         // Ensure fresh token
     analysePr
   )

   export default llmRouter
   ```

#### Testing:
- ✅ Verify endpoint returns 401 without authentication
- ✅ Verify authenticated users can access endpoint
- ✅ Verify rate limiting works
- ✅ Test with expired and blacklisted tokens

---

## Phase 2: High Priority Fixes (Week 1)

### Fix #4: Implement Token Encryption

**Vulnerability:** #1 - Sensitive Tokens Stored in Plain Text  
**Priority:** P1 - High  
**Estimated Time:** 4-6 hours

#### Affected Files:
- `backend/models/user/userSchema.js`
- `backend/controllers/auth/exchangecode.js`
- `backend/middlewares/refreshTokenMiddleware.js`
- New: `backend/utils/tokenEncryption.js`

#### Implementation Steps:

1. **Create Encryption Utility** (`backend/utils/tokenEncryption.js`):
   ```javascript
   import crypto from 'crypto';

   const ALGORITHM = 'aes-256-gcm';
   const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes
   const IV_LENGTH = 12; // GCM recommended
   const AUTH_TAG_LENGTH = 16;

   export function encryptToken(token) {
     const iv = crypto.randomBytes(IV_LENGTH);
     const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
     
     let encrypted = cipher.update(token, 'utf8', 'hex');
     encrypted += cipher.final('hex');
     
     const authTag = cipher.getAuthTag();
     
     // Format: iv:authTag:encrypted
     return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
   }

   export function decryptToken(encryptedData) {
     const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
     
     const iv = Buffer.from(ivHex, 'hex');
     const authTag = Buffer.from(authTagHex, 'hex');
     const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
     
     decipher.setAuthTag(authTag);
     
     let decrypted = decipher.update(encrypted, 'hex', 'utf8');
     decrypted += decipher.final('utf8');
     
     return decrypted;
   }
   ```

2. **Update User Schema** (`userSchema.js`):
   ```javascript
   import { encryptToken, decryptToken } from "../../utils/tokenEncryption.js";

   const userSchema = new mongoose.Schema({
     // ... existing fields ...
     
     // Encrypted tokens
     encryptedAccessToken: { type: String },
     encryptedRefreshToken: { type: String },
     
     refreshTokenExpiresAt: { type: Date },
     // ... rest of schema
   }, { timestamps: true });

   // Virtual for access token
   userSchema.virtual('accessToken')
     .get(function() {
       return this.encryptedAccessToken ? decryptToken(this.encryptedAccessToken) : null;
     })
     .set(function(token) {
       this.encryptedAccessToken = token ? encryptToken(token) : null;
     });

   // Virtual for refresh token
   userSchema.virtual('refreshToken')
     .get(function() {
       return this.encryptedRefreshToken ? decryptToken(this.encryptedRefreshToken) : null;
     })
     .set(function(token) {
       this.encryptedRefreshToken = token ? encryptToken(token) : null;
     });

   // Ensure virtuals are included in JSON
   userSchema.set('toJSON', { virtuals: true });
   userSchema.set('toObject', { virtuals: true });
   ```

3. **Generate Encryption Key**:
   ```bash
   # Generate 32-byte key
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Update Environment Variables**:
   - Add to `.env.sample`: `ENCRYPTION_KEY=`
   - Document key generation process

#### Migration Strategy:
1. Deploy encryption code without breaking existing data
2. Create migration script to encrypt existing tokens
3. Verify all tokens are encrypted
4. Remove plain text fields in next version

#### Testing:
- ✅ Test encryption/decryption roundtrip
- ✅ Verify tokens work after encryption
- ✅ Test token refresh with encrypted tokens
- ✅ Performance test (encryption overhead)
- ✅ Test key rotation process

---

### Fix #5: Add Input Validation

**Vulnerability:** #4 - No Input Validation or Sanitization  
**Priority:** P1 - High  
**Estimated Time:** 3-4 hours

#### Affected Files:
- `backend/controllers/llm/analysePr.js`
- `backend/controllers/auth/exchangecode.js`
- `backend/controllers/auth/getRepoPullRequests.js`
- New: `backend/middlewares/validation.js`
- New: `backend/validators/*.js`

#### Implementation Steps:

1. **Install Validation Library**:
   ```bash
   npm install joi
   ```

2. **Create Validation Middleware** (`backend/middlewares/validation.js`):
   ```javascript
   export function validate(schema, property = 'body') {
     return (req, res, next) => {
       const { error, value } = schema.validate(req[property], {
         abortEarly: false,
         stripUnknown: true
       });
       
       if (error) {
         const errors = error.details.map(detail => ({
           field: detail.path.join('.'),
           message: detail.message
         }));
         
         return res.status(400).json({
           success: false,
           message: 'Validation failed',
           errors
         });
       }
       
       // Replace with validated value
       req[property] = value;
       next();
     };
   }
   ```

3. **Create Validation Schemas** (`backend/validators/prValidation.js`):
   ```javascript
   import Joi from 'joi';

   export const analysePrSchema = Joi.object({
     owner: Joi.string()
       .alphanum()
       .min(1)
       .max(39)
       .required()
       .messages({
         'string.alphanum': 'Owner must contain only alphanumeric characters',
         'string.max': 'Owner cannot exceed 39 characters',
       }),
     
     repo: Joi.string()
       .min(1)
       .max(100)
       .pattern(/^[a-zA-Z0-9._-]+$/)
       .required()
       .messages({
         'string.pattern.base': 'Invalid repository name format',
       }),
     
     prNumber: Joi.number()
       .integer()
       .positive()
       .max(999999)
       .required()
       .messages({
         'number.positive': 'PR number must be positive',
       }),
   });

   export const codeExchangeSchema = Joi.object({
     code: Joi.string()
       .min(20)
       .max(256)
       .required()
       .messages({
         'string.min': 'Invalid authorization code',
       }),
   });
   ```

4. **Apply Validation to Routes**:
   ```javascript
   // In llm.js
   import { validate } from "../middlewares/validation.js"
   import { analysePrSchema } from "../validators/prValidation.js"

   llmRouter.post(
     "/analysePr/:owner/:repo/:prNumber",
     validate(analysePrSchema, 'params'),  // Validate params
     rateLimiter,
     checkBlacklistedToken,
     refreshTokenMiddleware,
     analysePr
   )

   // In auth.js
   import { codeExchangeSchema } from "../validators/prValidation.js"

   authRouter.get(
     "/exchange/:code",
     validate(codeExchangeSchema, 'params'),
     exchangeToken
   );
   ```

#### Testing:
- ✅ Test with valid inputs
- ✅ Test with invalid owner names (special chars, too long)
- ✅ Test with invalid PR numbers (negative, zero, strings)
- ✅ Test with missing required fields
- ✅ Verify error messages are helpful

---

### Fix #6: Add Rate Limiting to All Endpoints

**Vulnerability:** #5 - Missing Rate Limiting on Critical Endpoints  
**Priority:** P1 - High  
**Estimated Time:** 2 hours

#### Affected Files:
- `backend/routes/llm.js`
- `backend/routes/webhook.js`
- `backend/middlewares/ratelimiter.js` (enhance)
- New: `backend/middlewares/strictRateLimiter.js`

#### Implementation Steps:

1. **Create Strict Rate Limiter for Expensive Operations** (`strictRateLimiter.js`):
   ```javascript
   import redisClient from "../config/redisClient.js";

   const windowSize = 60; // seconds
   const maxRequests = 5; // only 5 requests per minute for expensive ops

   export default async function strictRateLimiter(req, res, next) {
     try {
       const userId = req.user?.userId || req.ip;
       const key = `rl_strict_${userId}`;
       const now = Date.now();
       const windowStart = now - windowSize * 1000;

       await redisClient.zRemRangeByScore(key, 0, windowStart);
       const reqCount = await redisClient.zCard(key);

       if (reqCount >= maxRequests) {
         return res.status(429).json({ 
           success: false, 
           message: "Rate limit exceeded. Please try again in 60 seconds.",
           retryAfter: 60 
         });
       }

       await redisClient.zAdd(key, [{ score: now, value: `${now}` }]);
       await redisClient.expire(key, windowSize);

       next();
     } catch (err) {
       console.error("Rate limiter error:", err);
       return res.status(500).json({ success: false, message: "Rate limiter error" });
     }
   }
   ```

2. **Update LLM Route**:
   ```javascript
   import strictRateLimiter from "../middlewares/strictRateLimiter.js"

   llmRouter.post(
     "/analysePr/:owner/:repo/:prNumber",
     strictRateLimiter,  // Stricter limit for LLM
     checkBlacklistedToken,
     refreshTokenMiddleware,
     analysePr
   )
   ```

3. **Add Rate Limiting to Webhook** (`webhook.js`):
   ```javascript
   import rateLimiter from "../middlewares/ratelimiter.js";

   router.post(
     "/handle",
     rateLimiter,  // Add basic rate limiting
     express.raw({ type: "*/*" }),
     handleWebhook
   );
   ```

4. **Add Rate Limit Headers**:
   Update rate limiters to include standard headers:
   ```javascript
   res.setHeader('X-RateLimit-Limit', maxRequests);
   res.setHeader('X-RateLimit-Remaining', maxRequests - reqCount);
   res.setHeader('X-RateLimit-Reset', new Date(now + windowSize * 1000).toISOString());
   ```

#### Testing:
- ✅ Test rate limits are enforced
- ✅ Verify different limits for different endpoints
- ✅ Test per-user vs per-IP limiting
- ✅ Verify rate limit headers are present
- ✅ Test rate limit reset timing

---

## Phase 3: Medium Priority Fixes (Week 2)

### Fix #7: Improve Error Handling

**Vulnerability:** #6 - Inadequate Error Handling  
**Priority:** P2 - Medium  
**Estimated Time:** 3 hours

#### Implementation Steps:

1. **Create Error Handler Utility** (`backend/utils/errorHandler.js`):
   ```javascript
   export class AppError extends Error {
     constructor(message, statusCode, isOperational = true) {
       super(message);
       this.statusCode = statusCode;
       this.isOperational = isOperational;
       Error.captureStackTrace(this, this.constructor);
     }
   }

   export function errorHandler(err, req, res, next) {
     const { statusCode = 500, message } = err;
     
     // Log full error server-side
     console.error('[ERROR]', {
       timestamp: new Date().toISOString(),
       path: req.path,
       method: req.method,
       error: err.stack,
       userId: req.user?.userId,
     });

     // Send generic message to client
     res.status(statusCode).json({
       success: false,
       message: err.isOperational 
         ? message 
         : 'An unexpected error occurred. Please try again later.',
       ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
     });
   }
   ```

2. **Apply Global Error Handler** (`server.js`):
   ```javascript
   import { errorHandler } from "./utils/errorHandler.js";

   // Routes...

   // Error handling middleware (must be last)
   app.use(errorHandler);
   ```

3. **Update Controllers to Use AppError**:
   ```javascript
   import { AppError } from "../../utils/errorHandler.js";

   // In exchangecode.js
   if (!access_token) {
     throw new AppError("Authentication failed", 400);
   }

   // Wrap async functions
   import asyncHandler from 'express-async-handler';

   export default asyncHandler(async function exchangeToken(req, res) {
     // No try-catch needed - errors bubble to errorHandler
   });
   ```

#### Testing:
- ✅ Test error responses don't leak information
- ✅ Verify stack traces only in development
- ✅ Test logging captures all necessary info
- ✅ Verify 4xx vs 5xx status codes

---

### Fix #8: Fix CORS Configuration

**Vulnerability:** #8 - CORS Configuration Too Permissive  
**Priority:** P2 - Medium  
**Estimated Time:** 1 hour

#### Implementation:
```javascript
// server.js
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.PRODUCTION_FRONTEND_URL,
].filter(Boolean);

if (allowedOrigins.length === 0) {
  throw new Error('FRONTEND_URL must be configured');
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
```

---

### Fix #9: Add Security Headers

**Vulnerability:** #11 - Missing Security Headers  
**Priority:** P2 - Medium  
**Estimated Time:** 1 hour

#### Implementation:

1. **Install Helmet**:
   ```bash
   npm install helmet
   ```

2. **Configure Security Headers** (`server.js`):
   ```javascript
   import helmet from 'helmet';

   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
         imgSrc: ["'self'", "data:", "https:"],
         connectSrc: ["'self'", process.env.FRONTEND_URL],
       },
     },
     hsts: {
       maxAge: 31536000,
       includeSubDomains: true,
       preload: true
     },
     frameguard: {
       action: 'deny'
     },
     noSniff: true,
     xssFilter: true,
   }));
   ```

#### Testing:
- ✅ Verify headers in response
- ✅ Test CSP doesn't break functionality
- ✅ Scan with security header checkers

---

### Fix #10: Implement Comprehensive Logging

**Vulnerability:** #10 - Insufficient Logging  
**Priority:** P2 - Medium  
**Estimated Time:** 3 hours

#### Implementation:

1. **Install Winston**:
   ```bash
   npm install winston winston-daily-rotate-file
   ```

2. **Configure Logger** (`backend/utils/logger.js`):
   ```javascript
   import winston from 'winston';
   import DailyRotateFile from 'winston-daily-rotate-file';

   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.errors({ stack: true }),
       winston.format.json()
     ),
     transports: [
       new DailyRotateFile({
         filename: 'logs/app-%DATE%.log',
         datePattern: 'YYYY-MM-DD',
         maxFiles: '14d'
       }),
       new DailyRotateFile({
         filename: 'logs/error-%DATE%.log',
         datePattern: 'YYYY-MM-DD',
         level: 'error',
         maxFiles: '30d'
       })
     ]
   });

   if (process.env.NODE_ENV !== 'production') {
     logger.add(new winston.transports.Console({
       format: winston.format.combine(
         winston.format.colorize(),
         winston.format.simple()
       )
     }));
   }

   export default logger;
   ```

3. **Add Audit Logging Middleware** (`backend/middlewares/auditLog.js`):
   ```javascript
   import logger from '../utils/logger.js';

   export default function auditLog(req, res, next) {
     const start = Date.now();
     
     res.on('finish', () => {
       logger.info('HTTP Request', {
         method: req.method,
         path: req.path,
         statusCode: res.statusCode,
         duration: Date.now() - start,
         userId: req.user?.userId,
         ip: req.ip,
       });
     });
     
     next();
   }
   ```

4. **Log Security Events**:
   ```javascript
   // In checkBlacklistedToken.js
   if (isBlacklisted) {
     logger.warn('Blacklisted token used', { token: token.substring(0, 10) });
   }

   // In refreshTokenMiddleware.js
   logger.info('Token refreshed', { userId: user.userId });
   ```

---

## Phase 4: Ongoing Security Practices

### Fix #11: Dependency Audits

**Priority:** P3 - Ongoing  

#### Setup:

1. **Add npm Scripts** (`package.json`):
   ```json
   {
     "scripts": {
       "audit": "npm audit",
       "audit:fix": "npm audit fix",
       "outdated": "npm outdated"
     }
   }
   ```

2. **Setup Dependabot**:
   Create `.github/dependabot.yml`:
   ```yaml
   version: 2
   updates:
     - package-ecosystem: "npm"
       directory: "/backend"
       schedule:
         interval: "weekly"
       open-pull-requests-limit: 10
   ```

3. **Regular Audits**:
   - Weekly: Run `npm audit`
   - Monthly: Review and update dependencies
   - Immediately: Apply critical security patches

---

### Fix #12: Webhook Timing Attack

**Vulnerability:** #9 - Webhook Timing Attack  
**Priority:** P2 - Medium  
**Estimated Time:** 30 minutes

#### Implementation:
```javascript
// In handleWebhook.js
const secret = process.env.GITHUB_WEBHOOK_SECRET;
const signatureHeader = req.headers["x-hub-signature-256"];

// Use consistent error message
if (!secret || !signatureHeader) {
  return res.status(401).json({ 
    success: false, 
    message: "Unauthorized" 
  });
}

// ... rest of validation
```

---

## Implementation Checklist

### Phase 1 (Days 1-2):
- [ ] Remove GitHub tokens from JWT (#2)
- [ ] Add secure cookie flags (#3)
- [ ] Add authentication to LLM endpoint (#7)
- [ ] Deploy and verify

### Phase 2 (Days 3-7):
- [ ] Implement token encryption (#1)
- [ ] Add input validation framework (#4)
- [ ] Add rate limiting to all endpoints (#5)
- [ ] Test thoroughly
- [ ] Deploy and monitor

### Phase 3 (Days 8-14):
- [ ] Improve error handling (#6)
- [ ] Fix CORS configuration (#8)
- [ ] Add security headers (#11)
- [ ] Implement comprehensive logging (#10)
- [ ] Fix webhook timing attack (#9)
- [ ] Deploy and monitor

### Phase 4 (Ongoing):
- [ ] Setup automated dependency scanning (#12)
- [ ] Configure Dependabot
- [ ] Establish security review process
- [ ] Schedule regular penetration testing

---

## Post-Implementation Verification

After each phase, verify:
1. ✅ All tests pass
2. ✅ No regressions in functionality
3. ✅ Security scanners show improvements
4. ✅ Performance is acceptable
5. ✅ Logs show expected behavior
6. ✅ Documentation is updated

---

## Rollback Plan

For each change:
1. Create feature branch
2. Implement fix
3. Test thoroughly in staging
4. Deploy to production with monitoring
5. Keep rollback script ready:
   ```bash
   git revert <commit-hash>
   npm run deploy
   ```

---

## Success Metrics

Track improvement in:
- Security scan scores (before/after)
- Number of vulnerabilities: 12 → 0
- OWASP compliance: Currently failing → All passing
- Audit log completeness: 0% → 100%
- Incident response capability: Poor → Excellent

---

**Document Version:** 1.0  
**Last Updated:** December 29, 2025  
**Next Review:** After Phase 3 completion
