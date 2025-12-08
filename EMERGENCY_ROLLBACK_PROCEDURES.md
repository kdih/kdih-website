# Emergency Rollback & Recovery Procedures
**For Critical System Failures**

---

## 🚨 When to Use This Guide

Use these procedures if:
- Website completely down
- Database corrupted
- Payment system broken
- Critical security breach
- Data loss incident
- Major bug in production

**⚠️ Stay Calm. Follow Steps Methodically. Document Everything.**

---

## 🔄 Quick Rollback (Code Issues)

### If Recent Deployment Broke Something

**Severity: HIGH | Time: 5-10 minutes**

#### Step 1: Identify the Problem
```bash
# Check what was last deployed
git log -3 --oneline

# Note the commit hash of last working version
```

#### Step 2: Revert to Previous Version
```bash
# Revert to last working commit
git revert HEAD
# OR go back to specific commit
git reset --hard <commit-hash>

# Force push (CAREFUL!)
git push origin main --force
```

#### Step 3: Trigger Redeploy on Render
1. Go to Render Dashboard
2. Select your service
3. Click **Manual Deploy**
4. Select previous successful deployment
5. OR wait for auto-deploy from Git push

#### Step 4: Verify
- [ ] Website loads
- [ ] Login works
- [ ] Critical features functional
- [ ] No errors in logs

---

## 💾 Database Rollback (Data Corruption)

### If Database Has Issues

**Severity: CRITICAL | Time: 15-30 minutes**

#### Prerequisites
- Have recent backup available
- Know exact time of corruption
- Backup before restore!

#### Step 1: Create Emergency Backup
```bash
# Even if corrupted, backup current state
node -e "require('./utils/backup').createBackup()" 
```

#### Step 2: Choose Restore Point
1. Go to Admin Dashboard → Backups
2. OR list backup files:
```bash
ls -lh backups/
```
3. Choose most recent clean backup

#### Step 3: Stop Application (Optional but Safer)
1. Render Dashboard → Service
2. Click **Suspend**
3. Wait for confirmation

#### Step 4: Restore Database
**Option A: Via Admin Dashboard**
1. Login to admin dashboard (if accessible)
2. Navigate to Backups tab
3. Click **Restore** next to chosen backup
4. Confirm action
5. Wait for completion

**Option B: Via Command Line**
```bash
# Copy backup to main database location
cp backups/kdih-backup-YYYY-MM-DD_HH-MM-SS.db kdih-database.db

# Restart application
# (On Render, resume service)
```

#### Step 5: Resume Service
1. Render Dashboard → Resume
2. Monitor logs for errors
3. Test database connectivity

#### Step 6: Verify Data
- [ ] Recent data present
- [ ] No corruption errors
- [ ] All tables accessible
- [ ] Query performance normal

#### Step 7: Calculate Data Loss
- Backup time: [_____________]
- Issue detected: [_____________]
- Data loss window: [_____ hours]
- Affected transactions: [review logs]

---

## 🔐 Security Breach Response

### If System Compromised

**Severity: CRITICAL | Time: 60 minutes**

#### Immediate Actions (First 5 Minutes)
1. **DO NOT PANIC**
2. **Document everything you see**
3. **Screenshot suspicious activity**
4. **Note exact time**

#### Step 1: Contain the Breach
```bash
# Change all passwords IMMEDIATELY
# Super admin, admin, database, Render, Git, Paystack

# Revoke all API keys
# Generate new ones

# Check for unauthorized access
```

#### Step 2: Disable Compromised Systems
1. Suspend application on Render (if needed)
2. Disable payment processing temporarily
3. Block suspicious IP addresses
4. Revoke compromised user sessions

#### Step 3: Assess Impact
- [ ] What data was accessed?
- [ ] Was data modified?
- [ ] Was data stolen?
- [ ] Payment info compromised?
- [ ] User credentials leaked?

#### Step 4: Secure the System
1. Update all passwords
2. Generate new API keys
3. Review all admin accounts
4. Check for backdoors in code
5. Update dependencies
6. Apply security patches

#### Step 5: Notify Affected Parties
**If user data compromised:**
- Email all affected users
- Explain what happened
- What data was affected
- Steps you're taking
- What they should do

#### Step 6: Document Incident
```
Date/Time: _______________
Type of breach: _______________
How discovered: _______________
Impact: _______________
Actions taken: _______________
Lessons learned: _______________
```

---

## 💳 Payment System Failure

### If Payments Not Working

**Severity: HIGH | Time: 30 minutes**

#### Step 1: Switch to Manual Mode
1. Admin Dashboard → Announcement
2. Post: "Online payments temporarily unavailable. Please contact support for manual payment."
3. Brief staff on accepting manual payments

#### Step 2: Diagnose Issue
Check in order:
- [ ] Paystack API keys correct?
- [ ] Paystack service status (status.paystack.com)
- [ ] Webhook URL configured?
- [ ] Network connectivity?
- [ ] Application logs for errors?

Common Causes:
- API key expired/revoked
- Webhook not firing
- Paystack service down
- Code bug in payment flow

#### Step 3: Quick Fixes

**If API Key Issue:**
```bash
# Verify keys in environment
# Re-enter in Render dashboard
# Redeploy
```

**If Webhook Issue:**
```bash
# Check webhook URL in Paystack dashboard
# Test webhook manually
# Check server receiving requests
```

**If Paystack Down:**
- Wait for service restoration
- Use manual payments
- Notify customers

#### Step 4: Test Before Re-enabling
1. Make test payment (₦100)
2. Verify full flow
3. Refund test payment
4. Remove announcement
5. Monitor closely

---

## 📧 Email System Failure

### If Emails Not Sending

**Severity: MEDIUM | Time: 15-30 minutes**

#### Step 1: Verify Email Service
- Check email service credentials
- Verify SMTP settings
- Test email configuration

#### Step 2: Fallback Communication
- Use WhatsApp for urgent notifications
- Post announcements on website
- Manual email via personal account

#### Step 3: Fix Email Service
**Check environment variables:**
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-specific-password
EMAIL_SERVICE=gmail
```

**Test email config:**
```javascript
node -e "require('./utils/email').testEmailConfig()"
```

---

## 🌐 Complete Site Down

### Nuclear Option - Full Recovery

**Severity: CRITICAL | Time: 2-4 hours**

#### Step 1: Check Render Status
1. Go to Render Dashboard
2. Check service status
3. Review deploy logs
4. Check for resource limits

#### Step 2: Verify DNS
- Domain pointing correctly?
- SSL certificate valid?
- Check with `nslookup yourdomain.com`

#### Step 3: Check Server Resources
- Out of memory?
- Disk space full?
- CPU maxed out?

#### Step 4: Fresh Deployment
```bash
# Clone fresh from Git
git clone <repo-url> kdih-fresh
cd kdih-fresh

# Install dependencies
npm install

# Copy production .env
cp ../kdih-website/.env .env

# Test locally
npm start

# If works, push to trigger deploy
git push origin main
```

#### Step 5: Last Resort - Rebuild
1. Create new Render service
2. Point to Git repository
3. Configure environment variables
4. Import database backup
5. Update DNS to new service
6. Monitor closely

---

## 📊 Post-Incident Review

### After Resolving Any Emergency

#### Document Incident Report
```markdown
## Incident Report

### Incident Details
- Date/Time: _______________
- Severity: _______________
- Duration: _______________
- Services Affected: _______________

### Root Cause
[What actually caused the problem]

### Impact
- Users affected: _______________
- Data loss: _______________
- Revenue impact: _______________
- Reputation damage: _______________

### Timeline
- Issue detected: _______________
- Team notified: _______________
- Diagnosis completed: _______________
- Fix implemented: _______________
- Service restored: _______________
- Verification completed: _______________

### Actions Taken
1. _______________
2. _______________
3. _______________

### Preventive Measures
1. _______________
2. _______________
3. _______________

### Lessons Learned
_______________

### Team Members Involved
_______________
```

#### Share with Team
- Review what happened
- What worked well
- What could improve
- Update procedures

#### Implement Improvements
- Update monitoring
- Add alerts
- Improve documentation
- Train staff

---

## 📞 Emergency Contacts

**Have These Ready BEFORE Emergency:**

### Technical Team
- Primary: _______________
- Secondary: _______________
- After hours: _______________

### Service Providers
- Render Support: via dashboard
- Paystack: support@paystack.com
- Domain Provider: _______________
- Email Service: _______________

### Internal
- Decision Maker: _______________
- Communications: _______________
- Customer Support: _______________

---

## ✅ Recovery Verification Checklist

After any recovery procedure:

- [ ] Website loads correctly
- [ ] All pages accessible
- [ ] Login/registration works
- [ ] Payment system functional (test transaction)
- [ ] Database queries working
- [ ] Email notifications sending
- [ ] Admin dashboard accessible
- [ ] Analytics tracking
- [ ] Backups operational
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Security intact

**Document Recovery:**
- Recovery time: _______________
- Method used: _______________
- Data loss (if any): _______________
- Next steps: _______________

---

## 🎯 Prevention is Better Than Cure

### Regular Maintenance
- Daily backup verification
- Weekly security updates
- Monthly disaster recovery drills
- Quarterly full system review

### Monitoring
- Set up uptime monitoring (e.g., UptimeRobot)
- Application performance monitoring
- Error tracking (e.g., Sentry)
- Payment system alerts

### Documentation
- Keep this guide updated
- Document all incidents
- Share learnings with team
- Review procedures quarterly

**Remember: Every incident is a learning opportunity. Stay calm, follow procedures, and improve the system.**
