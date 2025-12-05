# 🚀 Next Step: Deploy to Railway.app

## Your code is on GitHub! ✅
Repository: https://github.com/kdih/kdih-website

---

## Step 1: Create Railway Account & Deploy

### A. Go to Railway
1. Visit: **https://railway.app**
2. Click **"Start a New Project"**
3. Click **"Login with GitHub"**
4. Authorize Railway to access your GitHub

### B. Deploy Your Repository
1. After login, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select: **`kdih-website`**
4. Railway will:
   - Detect Node.js automatically ✅
   - Install dependencies ✅
   - Start building ✅

**Wait 2-3 minutes for initial deployment to complete**

---

## Step 2: Configure Environment Variables

1. Click on your **deployed service** in Railway
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add these one by one:

### Critical Variables (Add These First):

```bash
NODE_ENV=production
PORT=3000
DB_PATH=/app/data/kdih.db
SESSION_SECRET=your-strong-random-secret-here
```

### Email Configuration:
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

### Paystack (Use LIVE keys!):
```bash
PAYSTACK_SECRET_KEY=sk_live_your_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_key_here
```

### Optional:
```bash
BASE_URL=https://kdih.org
```

> 💡 See `.env.railway` file for complete variable list and instructions

---

## Step 3: Add Persistent Volume (CRITICAL!)

**Without this, your database will be deleted on each deployment!**

1. In Railway dashboard, click **"New"** → **"Volume"**
2. Settings:
   - **Name:** `kdih-data`
   - **Mount Path:** `/app/data`
   - **Size:** `1 GB` (minimum)
3. Click **"Add Volume"**

Railway will restart your service automatically.

---

## Step 4: Get Your Railway URL

1. Go to **"Settings"** tab
2. Under **"Domains"**, you'll see your Railway URL:
   - Format: `your-app-name.up.railway.app`
3. Click to open and **test your website!**

**Test checklist:**
- [ ] Homepage loads
- [ ] Admin login works (admin / admin123)
- [ ] Contact form submits
- [ ] Check Railway logs for errors

---

## Step 5: Configure Custom Domain (kdih.org)

### In Railway:
1. Go to **Settings** → **Domains**
2. Click **"+ Custom Domain"**
3. Enter: `kdih.org`
4. Railway will show DNS records like:
   ```
   Type: CNAME
   Name: @
   Value: your-app-name.up.railway.app
   ```

### In GoDaddy:
1. Login to **GoDaddy.com**
2. Go to **My Products** → Find **kdih.org**
3. Click **"DNS"** or **"Manage DNS"**
4. Click **"Add"** to add new record:
   - **Type:** `CNAME`
   - **Name:** `@` (or root)
   - **Value:** `your-app-name.up.railway.app` (from Railway)
   - **TTL:** `600` (or 1 hour)
5. **Save** changes

**Also add www subdomain:**
   - **Type:** `CNAME`
   - **Name:** `www`
   - **Value:** `kdih.org`
   - **TTL:** `600`

### Wait for DNS Propagation
- Usually takes: **10-60 minutes**
- Can take up to: **48 hours** (rare)
- Check status: `nslookup kdih.org`

---

## Step 6: Test Everything! ✅

### Test Railway URL First:
```bash
curl https://your-app-name.up.railway.app/api/services
```

### After DNS Propagates:
```bash
# Check DNS
nslookup kdih.org

# Test HTTPS
curl https://kdih.org/api/services

# Open in browser
open https://kdih.org
```

### Full Feature Test:
- [ ] Website loads at https://kdih.org
- [ ] SSL certificate is active (green lock)
- [ ] Admin dashboard accessible
- [ ] Contact form sends emails
- [ ] Course registration works
- [ ] Payment integration works
- [ ] Member portal accessible

---

## Post-Deployment Tasks

### Immediate:
1. **Change admin passwords!**
   - Login as admin/superadmin
   - Change passwords in admin dashboard
   
2. **Test payment flow**
   - Make a test payment (small amount)
   - Verify Paystack webhook works

3. **Monitor logs**
   - Check Railway dashboard for errors
   - Verify email sending works

### Optional but Recommended:
- Set up automated database backups
- Configure error monitoring (Sentry)
- Set up uptime monitoring
- Review Railway usage/costs

---

## Troubleshooting

### Website Not Loading?
- Check Railway logs in dashboard
- Verify all environment variables are set
- Check if service is running

### Database Issues?
- Confirm volume is mounted at `/app/data`
- Verify `DB_PATH=/app/data/kdih.db`
- Check Railway logs for database errors

### Domain Not Working?
- Verify CNAME record in GoDaddy
- Wait for DNS propagation (up to 48h)
- Check: `nslookup kdih.org`

### Emails Not Sending?
- Use Gmail App Password, not regular password
- Check EMAIL_USER and EMAIL_PASS are correct
- Review Railway logs for email errors

---

## 💰 Cost Monitoring

Free tier: **$5 credit/month**  
Expected cost: **$3-8/month** for moderate traffic

Monitor in Railway:
1. Go to **Usage** tab
2. Track monthly spend
3. Set spending limits if needed

---

## 🎉 You're Done!

Once everything is working:
1. ✅ Code on GitHub
2. ✅ Deployed to Railway
3. ✅ Database persistent
4. ✅ Custom domain (kdih.org)
5. ✅ SSL certificate active
6. ✅ All features tested

**Congratulations! Your KDIH website is LIVE!** 🚀

---

## Need Help?
- Railway Docs: https://docs.railway.app
- RAILWAY_DEPLOYMENT_GUIDE.md (detailed guide)
- Contact me for assistance!
