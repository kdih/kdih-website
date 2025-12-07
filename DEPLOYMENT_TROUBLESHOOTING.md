# Deployment Troubleshooting Guide

## Common Issues & Solutions

### 1. Analytics Dashboard Issues

#### Charts Not Rendering
**Symptom**: White/blank space where charts should be
**Solution**:
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors
- Verify Chart.js CDN is accessible
- Check API endpoints return data:
  ```
  curl https://your-site.onrender.com/api/analytics/overview
  ```

#### "Failed to load analytics" Error
**Symptom**: Alert box with error message
**Solution**:
- Check if user is logged in (session active)
- Verify API endpoints are accessible
- Check Render logs for database errors
- Test endpoints individually:
  ```bash
  # Test overview
  curl -H "Cookie: your-session-cookie" \
    https://your-site.onrender.com/api/analytics/overview
  
  # Test revenue
  curl -H "Cookie: your-session-cookie" \
    https://your-site.onrender.com/api/analytics/revenue?period=30d
  ```

#### Empty Data / Zero Metrics
**Symptom**: All cards show 0 or "No data"
**Solution**:
- This is normal for fresh deployment
- Add test data or wait for real data
- Verify database has data:
  - Members
  - Courses
  - Payments
  - Events

---

### 2. Backup System Issues

#### "Failed to create backup" Error
**Symptom**: Backup creation fails
**Solutions**:
1. **File Permissions** (most common on Render)
   - Render filesystem might be read-only
   - Check logs for EACCES or EPERM errors
   - Solution: Render needs persistent disk or backups won't persist

2. **Database Lock**
   - Database might be locked by another process
   - Wait and try again
   - Check if server is under heavy load

3. **Disk Space**
   - Check if enough disk space available
   - Clean old backups manually if needed

#### Backups Disappear After Restart
**Symptom**: Backups vanish when Render restarts
**Expected Behavior**: ⚠️ This is NORMAL on Render free tier
**Solution**:
- Render's filesystem is ephemeral (temporary)
- Download important backups regularly
- Consider upgrading to Render plan with persistent disk
- OR use external storage (future enhancement)

#### "Backup file not found" on Restore
**Symptom**: Restore fails
**Solution**:
- Refresh backup list
- Verify backup file still exists
- Download backup and restore manually if needed

---

### 3. Scheduler Issues

#### Automated Backups Not Running
**Symptom**: No backups created at 2 AM
**Verification**:
```bash
# Check Render logs around 2 AM UTC
# Look for: "Running scheduled backup..."
```

**Solutions**:
1. **Timezone Issue**
   - Scheduler runs at 2 AM UTC (might be different in your timezone)
   - Check: 2 AM UTC = your local time?

2. **Server Restart**
   - Render free tier sleeps after inactivity
   - Scheduler won't run if server is asleep
   - Solution: Upgrade to always-on plan OR accept manual backups

3. **Cron Expression**
   - Verify in utils/backup.js
   - Should be: `'0 2 * * *'`

---

### 4. General API Issues

#### 401 Unauthorized Errors
**Symptom**: API calls return 401
**Solution**:
- User session expired - re-login
- Cookie not being sent - check CORS settings
- Session secret mismatch - verify .env on Render

#### 500 Internal Server Error
**Symptom**: API calls return 500
**Solution**:
- Check Render logs for stack trace
- Database connection issue - verify DB_PATH
- Missing environment variables
- Code error - check logs for details

---

### 5. Performance Issues

#### Slow Analytics Loading
**Symptom**: Analytics take >5 seconds to load
**Solutions**:
- Normal for first load (cold start on Render)
- Database queries might be slow with large data
- Add database indexes (future optimization)
- Consider caching (future enhancement)

#### Charts Lag on Interaction
**Symptom**: Charts slow to update
**Solution**:
- Reduce data points (use monthly instead of daily)
- Upgrade browser
- Close other tabs/applications

---

## Quick Diagnostic Commands

### Test Locally
```bash
# Test analytics endpoint
curl http://localhost:3000/api/analytics/overview

# Test backup creation
curl -X POST http://localhost:3000/api/admin/backup/create

# Test backup list
curl http://localhost:3000/api/admin/backup/list
```

### Check Render
```bash
# View logs
render logs --tail

# SSH into service (if available)
render ssh

# Check environment
render env
```

---

## Emergency Procedures

### If Analytics Breaks Everything
1. Comment out analytics routes in routes/api.js
2. Redeploy
3. Fix issue
4. Uncomment and redeploy

### If Backups Cause Issues
1. Comment out backup scheduler in server.js
2. Keep manual backup endpoints
3. Redeploy

### Nuclear Option - Rollback
1. Go to Render dashboard
2. Find previous deployment
3. Click "Rollback to this version"

---

## Health Checks

### ✅ Everything Working If:
- Analytics tab loads without errors
- At least one chart renders
- Backup creation completes
- Backup list shows files
- No errors in browser console
- No 500 errors in Render logs

### 🔍 Investigate If:
- Any 500 errors in logs
- Charts show as white boxes
- Backups fail consistently
- Session expires immediately

---

## Contact Points

**If you encounter persistent issues:**
1. Check Render status page
2. Review code changes in git diff
3. Test locally first
4. Check package.json dependencies
5. Verify environment variables

---

## Known Limitations on Render Free Tier

1. **Ephemeral Filesystem**
   - Backups disappear on restart
   - Download important backups

2. **Auto-Sleep**
   - Service sleeps after 15 min inactivity
   - Scheduled backups won't run when asleep

3. **Cold Starts**
   - First request after sleep is slow
   - Charts may take 5-10 seconds first time

**Recommendation**: Upgrade to paid plan for production use with persistent disk and always-on service.
