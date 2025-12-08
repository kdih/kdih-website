# 🔐 KDIH Website Security Testing Guide

This guide outlines penetration testing procedures for the KDIH website.

## 📋 Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Authentication Testing](#authentication-testing)
3. [Authorization Testing](#authorization-testing)
4. [Input Validation Testing](#input-validation-testing)
5. [File Upload Testing](#file-upload-testing)
6. [API Security Testing](#api-security-testing)
7. [Session Management Testing](#session-management-testing)
8. [Payment Security Testing](#payment-security-testing)
9. [Information Disclosure Testing](#information-disclosure-testing)
10. [Automated Testing Tools](#automated-testing-tools)

---

## 🚀 Pre-Testing Setup

### Required Tools

```bash
# Install testing tools
npm install -g owasp-zap-cli
brew install nikto nmap sqlmap
pip install wfuzz
```

### Testing Environment

- **Always test on a staging/local environment first**
- Create backup of database before testing
- Document all findings with screenshots

---

## 1. 🔐 Authentication Testing

### 1.1 Brute Force Attack Test

```bash
# Test rate limiting on login endpoint
for i in {1..20}; do
  curl -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong'$i'"}'
  echo ""
done
```

**Expected Result**: Should be blocked after 5 attempts with "Too many login attempts"

### 1.2 Default Credentials Check

| Username | Default Password | Status |
|----------|-----------------|--------|
| admin | admin123 | ⚠️ CHANGE IMMEDIATELY |
| superadmin | superadmin123 | ⚠️ CHANGE IMMEDIATELY |

**Action Required**: Run `node change-admin-password.js` to change defaults

### 1.3 Password Policy Testing

- [ ] Minimum length requirement
- [ ] Special character requirement
- [ ] Previous password check

### 1.4 SQL Injection in Login

```bash
# Test SQL injection
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR 1=1--","password":"test"}'
```

**Expected Result**: Should fail authentication (parameterized queries protect this)

---

## 2. 🔑 Authorization Testing

### 2.1 Privilege Escalation Tests

```bash
# Access admin endpoint without auth
curl http://localhost:3000/api/admin/members

# Access admin endpoint with member session
curl http://localhost:3000/api/admin/users \
  -H "Cookie: connect.sid=MEMBER_SESSION_ID"
```

**Expected Result**: 401 Unauthorized or 403 Forbidden

### 2.2 IDOR (Insecure Direct Object Reference)

```bash
# Try accessing other users' data
curl http://localhost:3000/api/member/profile -H "Cookie: connect.sid=YOUR_SESSION"
curl http://localhost:3000/api/member/1  # Try different IDs
curl http://localhost:3000/api/member/2
```

**Check**: Can user A access user B's data by changing ID?

### 2.3 Protected Endpoints Checklist

| Endpoint | Auth Required | Role Required | Status |
|----------|--------------|---------------|--------|
| /api/admin/members | ✅ | admin/super_admin | ✅ |
| /api/admin/users | ✅ | super_admin | ✅ |
| /api/login | ❌ | - | ✅ |
| /api/member/profile | ✅ | member | ✅ |

---

## 3. 📝 Input Validation Testing

### 3.1 XSS (Cross-Site Scripting)

```bash
# Test stored XSS in contact form
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(1)</script>","email":"test@test.com","message":"Test"}'

# Test in member registration
curl -X POST http://localhost:3000/api/members/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"<img src=x onerror=alert(1)>","email":"xss@test.com","password":"test123"}'
```

**Check Admin Dashboard**: See if scripts execute when viewing data

### 3.2 SQL Injection

```bash
# Test in search/filter parameters
curl "http://localhost:3000/api/courses?search=test' OR 1=1--"
curl "http://localhost:3000/api/members?id=1 OR 1=1"

# Use sqlmap for automated testing
sqlmap -u "http://localhost:3000/api/courses?search=test" --batch
```

### 3.3 NoSQL Injection

```bash
# Though using SQLite, test for JSON parsing issues
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":{"$gt":""},"password":{"$gt":""}}'
```

### 3.4 Command Injection

```bash
# Test in fields that might be processed server-side
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"; ls -la","email":"cmd@test.com","message":"test"}'
```

---

## 4. 📁 File Upload Testing

### 4.1 Malicious File Upload

```bash
# Create test files
echo '<?php system($_GET["cmd"]); ?>' > test.php
echo '<script>alert(1)</script>' > test.html

# Try to upload malicious files
curl -X POST http://localhost:3000/api/job-applications \
  -F "cv=@test.php" \
  -F "position=Test" \
  -F "full_name=Test User" \
  -F "email=test@test.com" \
  -F "phone=1234567890"

# Try double extension
cp test.php test.pdf.php
curl -X POST http://localhost:3000/api/job-applications \
  -F "cv=@test.pdf.php" ...
```

**Check**: File should be rejected or stored without execution capability

### 4.2 File Size Limit Test

```bash
# Create large file (>5MB default limit)
dd if=/dev/zero of=largefile.pdf bs=1M count=10

curl -X POST http://localhost:3000/api/job-applications \
  -F "cv=@largefile.pdf" ...
```

**Expected**: Error "File too large"

### 4.3 Path Traversal

```bash
# Try to upload to different directory
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.txt;filename=../../../etc/passwd"
```

---

## 5. 🔌 API Security Testing

### 5.1 Rate Limiting Verification

```bash
# General API rate limit test (100 requests/15 min)
for i in {1..150}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/services
done | sort | uniq -c
```

**Expected**: 429 responses after ~100 requests

### 5.2 HTTP Methods Testing

```bash
# Test unsupported methods
curl -X DELETE http://localhost:3000/api/services/1
curl -X PUT http://localhost:3000/api/services/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Hacked"}'
```

**Check**: Should require authentication

### 5.3 Mass Assignment

```bash
# Try to set admin role during registration
curl -X POST http://localhost:3000/api/members/register \
  -H "Content-Type: application/json" \
  -d '{"email":"hack@test.com","password":"test123","full_name":"Hacker","role":"admin","is_admin":true}'
```

**Check**: User should NOT have elevated privileges

### 5.4 API Enumeration

```bash
# Discover hidden endpoints
wfuzz -c -z file,/usr/share/wordlists/dirb/common.txt \
  http://localhost:3000/api/FUZZ
```

---

## 6. 🍪 Session Management Testing

### 6.1 Session Fixation

1. Note your session cookie value
2. Login with valid credentials
3. Check if session ID changed after login

### 6.2 Session Cookie Flags

```bash
# Check cookie attributes
curl -v http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YOUR_PASSWORD"}' 2>&1 | grep -i "set-cookie"
```

**Expected Flags**:

- HttpOnly ✅
- Secure (in production) ✅
- SameSite ✅

### 6.3 Session Timeout

- [ ] Session expires after inactivity
- [ ] Session destroyed on logout
- [ ] Old sessions invalid after password change

---

## 7. 💳 Payment Security Testing

### 7.1 Payment Manipulation (CRITICAL)

```bash
# NEVER test in production with real payments!

# Test amount tampering
# Intercept payment initiation and modify amount
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{"amount":1,"type":"course","course_id":1}'

# Verify server validates amount server-side
```

### 7.2 Webhook Signature Verification

- [ ] Paystack webhook validates signature
- [ ] Webhook endpoint not publicly guessable
- [ ] Payment status verified before granting access

---

## 8. 🔍 Information Disclosure Testing

### 8.1 Error Message Analysis

```bash
# Generate intentional errors
curl http://localhost:3000/api/nonexistent
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"invalid":"json'
```

**Check**: Errors don't reveal stack traces in production

### 8.2 Directory Listing

```bash
curl http://localhost:3000/uploads/
curl http://localhost:3000/public/
```

**Expected**: 404 or proper index page

### 8.3 Sensitive File Access

```bash
# Try to access sensitive files
curl http://localhost:3000/.env
curl http://localhost:3000/.git/config
curl http://localhost:3000/database.js
curl http://localhost:3000/kdih.db
```

**Expected**: All should return 404

### 8.4 Response Headers

```bash
curl -I http://localhost:3000
```

**Check for**:

- ❌ X-Powered-By (should be removed)
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ Content-Security-Policy

---

## 9. 🛠️ Automated Testing Tools

### 9.1 OWASP ZAP Automated Scan

```bash
# Start ZAP in daemon mode
zap.sh -daemon -port 8090

# Run automated scan
zap-cli --zap-url http://localhost:8090 quick-scan http://localhost:3000

# Generate report
zap-cli --zap-url http://localhost:8090 report -o security-report.html -f html
```

### 9.2 Nikto Web Scanner

```bash
nikto -h http://localhost:3000 -o nikto-report.txt
```

### 9.3 Nmap Port Scan

```bash
nmap -sV -sC localhost
```

### 9.4 npm Audit

```bash
cd "/Users/yankyaure/Downloads/kdih_website 2"
npm audit
npm audit fix
```

---

## 📊 Vulnerability Report Template

### Finding Template

```
**Title**: [Vulnerability Name]
**Severity**: Critical/High/Medium/Low/Info
**CVSS Score**: X.X
**Location**: [Endpoint/File]
**Description**: [What the vulnerability is]
**Proof of Concept**: [Steps to reproduce]
**Impact**: [What an attacker could do]
**Recommendation**: [How to fix]
```

---

## 🚨 Known Issues to Fix

Based on code analysis, address these issues:

### 1. Default Credentials (CRITICAL)

```javascript
// In database.js lines 95-110
// Default passwords are hardcoded
'superadmin123' // CHANGE THIS
'admin123'      // CHANGE THIS
```

**Fix**: Change immediately in production

### 2. Missing Content-Type Validation on Uploads

```javascript
// In utils/upload.js
// Only checks file extension, not actual content type
```

**Fix**: Add magic number/MIME type validation

### 3. Verbose Error Messages in Development

```javascript
// In server.js error handler
// Stack traces exposed in non-production
```

**Fix**: Ensure NODE_ENV=production in deployment

---

## 📝 Testing Checklist Summary

- [ ] Brute force protection working
- [ ] Default credentials changed
- [ ] All admin endpoints protected
- [ ] No IDOR vulnerabilities
- [ ] XSS sanitized in all inputs
- [ ] SQL injection prevented
- [ ] File uploads properly validated
- [ ] Rate limiting effective
- [ ] Session security implemented
- [ ] Payment integrity verified
- [ ] No sensitive info leakage
- [ ] Security headers present
- [ ] npm dependencies updated
- [ ] HTTPS enforced in production

---

## 🔧 Quick Security Fixes Script

```bash
#!/bin/bash
# security-fixes.sh

# 1. Update npm packages
npm update
npm audit fix

# 2. Check for default credentials
echo "Checking for default admin..."
node -e "const db=require('./database');db.get('SELECT * FROM users WHERE password LIKE \"%admin123%\"',(e,r)=>console.log(r?'⚠️ DEFAULT CREDENTIALS FOUND':'✅ Safe'))"

# 3. Verify environment
if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️ NODE_ENV is not set to production"
fi
```

---

## 📞 Security Contact

Report security vulnerabilities to: <security@kdih.org>

**Responsible Disclosure Policy**: Please allow 90 days before public disclosure.
