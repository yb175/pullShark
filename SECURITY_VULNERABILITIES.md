# Security Vulnerability Analysis Report

**Date:** December 29, 2025  
**Project:** pullShark Backend  
**Analyzed by:** Security Analysis Agent

---

## Executive Summary

This report details critical and high-severity security vulnerabilities discovered in the pullShark backend application. A total of **12 distinct security issues** were identified across authentication, data protection, input validation, and API security domains.

**Severity Breakdown:**
- 🔴 **Critical:** 4 vulnerabilities
- 🟠 **High:** 5 vulnerabilities  
- 🟡 **Medium:** 3 vulnerabilities

---

## Critical Vulnerabilities (🔴)

### 1. Sensitive Tokens Stored in Plain Text in Database

**Severity:** Critical  
**CWE:** CWE-312 (Cleartext Storage of Sensitive Information)  
**CVSS Score:** 9.1 (Critical)

**Description:**  
GitHub OAuth tokens (access tokens and refresh tokens) are stored in plain text in MongoDB without any encryption.

**Affected Files:**
- `backend/models/user/userSchema.js` (lines 10-11)
- `backend/controllers/auth/exchangecode.js` (lines 60-69)
- `backend/middlewares/refreshTokenMiddleware.js` (lines 85-93)

**Vulnerable Code:**
```javascript
// userSchema.js
refreshToken: { type: String },
refreshTokenExpiresAt: { type: Date },
```

**Impact:**
- If database is compromised, attackers gain full access to all user GitHub accounts
- Tokens can be used to access private repositories, commit code, and perform actions on behalf of users
- No defense in depth - single point of failure

**Remediation:**
1. Implement encryption at rest for sensitive tokens using AES-256-GCM
2. Store encrypted tokens with initialization vectors (IVs)
3. Use environment-based encryption keys
4. Consider using MongoDB field-level encryption or application-level encryption
5. Implement key rotation strategy

**Recommended Libraries:**
- `crypto` (Node.js built-in) for encryption
- `@google-cloud/kms` or AWS KMS for key management

---

### 2. Sensitive Data Exposure in JWT Tokens

**Severity:** Critical  
**CWE:** CWE-359 (Exposure of Private Personal Information)  
**CVSS Score:** 8.6 (High)

**Description:**  
GitHub access tokens are embedded directly in JWT tokens sent to clients, exposing them in cookies and potentially in logs.

**Affected Files:**
- `backend/controllers/auth/exchangecode.js` (lines 73-84)
- `backend/middlewares/refreshTokenMiddleware.js` (lines 100-109)

**Vulnerable Code:**
```javascript
const accessToken = jwt.sign(
  {
    id: user.userId,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    ghTokenExpiresAt: ghAccessTokenExpiresAt,
    ghAccessToken: access_token,  // ❌ EXPOSED IN JWT
  },
  process.env.JWT_SECRET_KEY,
  { expiresIn: "4d" }
);
```

**Impact:**
- JWTs can be decoded by anyone (they are only signed, not encrypted)
- GitHub access tokens exposed in browser developer tools
- Tokens may be logged in application logs or proxies
- XSS attacks could steal the entire GitHub access token

**Remediation:**
1. Never store sensitive tokens in JWT payloads
2. Use session identifiers instead
3. Store tokens securely server-side only
4. Retrieve tokens from database when needed using session ID

---

### 3. Missing HTTPS/Secure Flag on Authentication Cookies

**Severity:** Critical  
**CWE:** CWE-614 (Sensitive Cookie in HTTPS Session Without 'Secure' Attribute)  
**CVSS Score:** 7.5 (High)

**Description:**  
Authentication cookies lack `secure` and `sameSite` flags, making them vulnerable to interception and CSRF attacks.

**Affected Files:**
- `backend/controllers/auth/exchangecode.js` (lines 88-91)
- `backend/middlewares/refreshTokenMiddleware.js` (lines 112-115)

**Vulnerable Code:**
```javascript
res.cookie("accesstoken", accessToken, {
  httpOnly: true,
  maxAge: 2 * 60 * 60 * 1000,
  // ❌ Missing: secure, sameSite, domain
});
```

**Impact:**
- Man-in-the-middle (MITM) attacks can intercept cookies over HTTP
- CSRF attacks possible without sameSite protection
- Cookie theft via network sniffing

**Remediation:**
```javascript
res.cookie("accesstoken", accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict', // CSRF protection
  maxAge: 2 * 60 * 60 * 1000,
  domain: process.env.COOKIE_DOMAIN // Explicit domain
});
```

---

### 4. No Input Validation or Sanitization

**Severity:** Critical  
**CWE:** CWE-20 (Improper Input Validation)  
**CVSS Score:** 8.1 (High)

**Description:**  
No input validation is performed on user-controlled parameters, leading to potential injection attacks and NoSQL injection.

**Affected Files:**
- `backend/controllers/llm/analysePr.js` (line 26)
- `backend/controllers/auth/getRepoPullRequests.js`
- `backend/controllers/auth/exchangecode.js` (line 6)

**Vulnerable Code:**
```javascript
// No validation on parameters
const { owner, repo, prNumber } = req.params;
const baseUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
```

**Impact:**
- NoSQL injection in MongoDB queries
- Command injection possibilities
- Path traversal attacks
- Malformed API requests causing server errors

**Remediation:**
1. Implement input validation using libraries like `joi` or `express-validator`
2. Sanitize all user inputs
3. Use parameterized queries
4. Implement type checking and length restrictions

**Example:**
```javascript
import Joi from 'joi';

const schema = Joi.object({
  owner: Joi.string().alphanum().min(1).max(39).required(),
  repo: Joi.string().min(1).max(100).required(),
  prNumber: Joi.number().integer().positive().required()
});

const { error, value } = schema.validate(req.params);
if (error) return res.status(400).json({ success: false, message: error.details[0].message });
```

---

## High Severity Vulnerabilities (🟠)

### 5. Missing Rate Limiting on Critical Endpoints

**Severity:** High  
**CWE:** CWE-770 (Allocation of Resources Without Limits or Throttling)  
**CVSS Score:** 7.5 (High)

**Description:**  
Rate limiting is only applied to a few endpoints. Critical endpoints like webhook handler and LLM analysis lack rate limiting.

**Affected Files:**
- `backend/routes/llm.js` (line 4) - No rate limiter
- `backend/routes/webhook.js` (line 8) - No rate limiter on POST webhook
- `backend/routes/auth.js` - Inconsistent rate limiting

**Vulnerable Code:**
```javascript
// llm.js - NO RATE LIMITING
llmRouter.post("/analysePr/:owner/:repo/:prNumber", analysePr);

// webhook.js - NO RATE LIMITING
router.post("/handle", express.raw({ type: "*/*" }), handleWebhook);
```

**Impact:**
- Denial of Service (DoS) attacks
- Resource exhaustion
- API abuse and cost overflow (especially for external LLM API calls)
- GitHub API rate limit exhaustion

**Remediation:**
1. Apply rate limiting to all endpoints
2. Use stricter limits for expensive operations (LLM calls)
3. Implement per-user rate limiting
4. Add request queuing for webhook processing

```javascript
import rateLimiter from "../middlewares/ratelimiter.js";

llmRouter.post("/analysePr/:owner/:repo/:prNumber", 
  rateLimiter,  // Add rate limiting
  analysePr
);
```

---

### 6. Inadequate Error Handling and Information Disclosure

**Severity:** High  
**CWE:** CWE-209 (Generation of Error Message Containing Sensitive Information)  
**CVSS Score:** 6.5 (Medium)

**Description:**  
Error messages expose internal implementation details, stack traces, and system information.

**Affected Files:**
- `backend/controllers/auth/exchangecode.js` (line 108)
- `backend/controllers/llm/analysePr.js` (line 82)
- `backend/middlewares/refreshTokenMiddleware.js` (line 133)

**Vulnerable Code:**
```javascript
catch (err) {
  console.error("GitHub OAuth Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message,  // ❌ Exposes internal error details
  });
}
```

**Impact:**
- Information leakage about internal system structure
- Reveals technology stack and versions
- Helps attackers map the application
- Potential exposure of file paths and configurations

**Remediation:**
```javascript
catch (err) {
  console.error("GitHub OAuth Error:", err); // Log full error server-side
  res.status(500).json({
    success: false,
    message: "Authentication failed. Please try again.",  // Generic message
  });
}
```

---

### 7. Missing Authentication on LLM Endpoint

**Severity:** High  
**CWE:** CWE-306 (Missing Authentication for Critical Function)  
**CVSS Score:** 8.6 (High)

**Description:**  
The `/llm/analysePr/:owner/:repo/:prNumber` endpoint is completely unprotected and lacks authentication.

**Affected Files:**
- `backend/routes/llm.js` (line 4)

**Vulnerable Code:**
```javascript
llmRouter.post("/analysePr/:owner/:repo/:prNumber", analysePr);
// ❌ No checkBlacklistedToken, no refreshTokenMiddleware
```

**Impact:**
- Anyone can trigger expensive LLM analysis operations
- Potential cost overflow from API calls to external LLM service
- Abuse of the service by unauthorized users
- No audit trail of who initiated analyses

**Remediation:**
```javascript
import checkBlacklistedToken from "../middlewares/checkBlacklistedToken.js";
import refreshTokenMiddleware from "../middlewares/refreshTokenMiddleware.js";
import rateLimiter from "../middlewares/ratelimiter.js";

llmRouter.post(
  "/analysePr/:owner/:repo/:prNumber",
  rateLimiter,
  checkBlacklistedToken,
  refreshTokenMiddleware,
  analysePr
);
```

---

### 8. CORS Configuration Too Permissive

**Severity:** High  
**CWE:** CWE-942 (Permissive Cross-domain Policy with Untrusted Domains)  
**CVSS Score:** 6.8 (Medium)

**Description:**  
CORS is configured to allow credentials but origin validation is weak with fallback to localhost.

**Affected Files:**
- `backend/server.js` (lines 16-21)

**Vulnerable Code:**
```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",  // ❌ Weak fallback
    credentials: true,
  })
);
```

**Impact:**
- If `FRONTEND_URL` is not set, defaults to localhost in production
- Potential for cross-site attacks if misconfigured
- Cookie theft if origin is compromised

**Remediation:**
```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.PRODUCTION_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
```

---

### 9. Webhook Secret Validation Timing Attack Vulnerability

**Severity:** High  
**CWE:** CWE-208 (Observable Timing Discrepancy)  
**CVSS Score:** 5.9 (Medium)

**Description:**  
While `crypto.timingSafeEqual` is used for signature comparison (good!), error messages reveal whether the webhook secret exists or signature format is correct.

**Affected Files:**
- `backend/controllers/webhook/handleWebhook.js` (lines 14-27)

**Vulnerable Code:**
```javascript
if (!secret) {
  return res.status(500).json({ success: false, message: "Missing webhook secret" }); // ❌ Information leak
}

if (!signatureHeader) {
  return res.status(400).json({ success: false, message: "Missing signature header" }); // ❌ Different status
}
```

**Impact:**
- Attackers can differentiate between configuration errors and validation failures
- Information disclosure aids in crafting attacks
- Different response times and status codes reveal system state

**Remediation:**
```javascript
// Use consistent error response for all authentication failures
if (!secret || !signatureHeader) {
  return res.status(401).json({ success: false, message: "Unauthorized" });
}
```

---

## Medium Severity Vulnerabilities (🟡)

### 10. Insufficient Logging and Monitoring

**Severity:** Medium  
**CWE:** CWE-778 (Insufficient Logging)  
**CVSS Score:** 5.3 (Medium)

**Description:**  
Security-relevant events are not properly logged. No audit trail for authentication attempts, token refreshes, or suspicious activities.

**Affected Files:**
- All authentication controllers
- `backend/middlewares/refreshTokenMiddleware.js`
- `backend/middlewares/checkBlacklistedToken.js`

**Impact:**
- Cannot detect security breaches
- No forensic data for incident response
- Compliance violations (GDPR, SOC2)

**Remediation:**
1. Implement structured logging (Winston, Pino)
2. Log all authentication events
3. Log failed authorization attempts
4. Implement log aggregation and monitoring
5. Set up alerts for suspicious patterns

---

### 11. Missing Security Headers

**Severity:** Medium  
**CWE:** CWE-1021 (Improper Restriction of Rendered UI Layers or Frames)  
**CVSS Score:** 5.0 (Medium)

**Description:**  
Critical security headers are missing from HTTP responses.

**Affected Files:**
- `backend/server.js`

**Missing Headers:**
- `X-Frame-Options` / `Content-Security-Policy` (clickjacking protection)
- `X-Content-Type-Options` (MIME sniffing protection)
- `Strict-Transport-Security` (HSTS)
- `X-XSS-Protection`
- `Referrer-Policy`

**Remediation:**
```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

### 12. Dependency Security Issues

**Severity:** Medium  
**CWE:** CWE-1104 (Use of Unmaintained Third Party Components)  
**CVSS Score:** 5.5 (Medium)

**Description:**  
Package dependencies should be regularly audited for known vulnerabilities.

**Affected Files:**
- `backend/package.json`

**Recommendations:**
1. Run `npm audit` regularly
2. Use tools like Snyk or Dependabot
3. Keep dependencies updated
4. Review security advisories

---

## Remediation Priority

### Immediate (Within 24 hours):
1. ✅ Remove GitHub tokens from JWT payloads (#2)
2. ✅ Add secure cookie flags (#3)
3. ✅ Add authentication to LLM endpoint (#7)

### High Priority (Within 1 week):
4. ✅ Implement token encryption (#1)
5. ✅ Add input validation (#4)
6. ✅ Add rate limiting to all endpoints (#5)

### Medium Priority (Within 2 weeks):
7. ✅ Improve error handling (#6)
8. ✅ Fix CORS configuration (#8)
9. ✅ Add security headers (#11)
10. ✅ Implement comprehensive logging (#10)

### Ongoing:
11. ✅ Regular dependency audits (#12)
12. ✅ Security code reviews
13. ✅ Penetration testing

---

## Testing Recommendations

1. **Security Testing:**
   - Perform penetration testing on authentication flows
   - Test for SQL/NoSQL injection vulnerabilities
   - Validate rate limiting effectiveness

2. **Code Review:**
   - Implement mandatory security reviews for all PRs
   - Use static analysis tools (ESLint security plugins, SonarQube)

3. **Monitoring:**
   - Set up intrusion detection
   - Monitor for suspicious authentication patterns
   - Track API usage anomalies

---

## Compliance Considerations

These vulnerabilities may affect compliance with:
- **GDPR:** Article 32 (Security of Processing) - inadequate token protection
- **OWASP Top 10 2021:** A01:2021 – Broken Access Control, A02:2021 – Cryptographic Failures
- **PCI DSS:** Requirement 6.5 (if processing payment data)
- **SOC 2:** Security and confidentiality criteria

---

## References

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [CWE Top 25 Most Dangerous Software Weaknesses](https://cwe.mitre.org/top25/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Report End**
