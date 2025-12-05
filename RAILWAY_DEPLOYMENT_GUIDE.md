# Railway Deployment Guide for KDIH Website

## Step 1: Prepare Your Code ✅

Your code is now prepared with:
- ✅ Configurable database path (via `DB_PATH` environment variable)
- ✅ Proper `.gitignore` file
- ✅ All dependencies in `package.json`

## Step 2: Push to GitHub

If you haven't already, create a GitHub repository and push your code:

```bash
cd "/Users/yankyaure/Downloads/kdih_website 2"

# Initialize git (if not done)
git init

# Add all files
git add .

git commit -m "Prepare for Railway deployment"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/kdih-website.git

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Railway

### A. Create Railway Account

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign up with your **GitHub account**

### B. Deploy from GitHub

1. Click **"Deploy from GitHub repo"**
2. Select your **kdih-website** repository
3. Railway will automatically detect Node.js and start deployment

### C. Add Environment Variables

In Railway dashboard:

1. Click on your project
2. Go to **Variables** tab
3. Click **"+ New Variable"** and add these one by one:

```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-strong-secret-key-change-this
DB_PATH=/app/data/kdih.db

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key

# Optional
BASE_URL=https://kdih.org
```

> **Important:** Use LIVE Paystack keys, not test keys!

### D. Add Persistent Volume for Database

1. In Railway project, click **"New"** → **"Volume"**
2. **Mount path:** `/app/data`
3. **Size:** 1 GB (minimum)
4. Click **"Add Volume"**

This ensures your SQLite database persists across deployments.

## Step 4: Configure Custom Domain (kdih.org)

### In Railway:

1. Go to **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter: `kdih.org`
4. Railway will show you DNS records to add

### In GoDaddy:

1. Login to your GoDaddy account
2. Go to **My Products** → Find **kdih.org**
3. Click **DNS** (or **Manage DNS**)
4. Add these records (provided by Railway):

**Option A: CNAME Record (Recommended)**
```
Type: CNAME
Name: @
Value: your-app-name.up.railway.app
TTL: 600
```

**Option B: A Record**
```
Type: A
Name: @
Value: [IP address from Railway]
TTL: 600
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: kdih.org
TTL: 600
```

5. Click **Save**
6. Wait 10-60 minutes for DNS propagation

## Step 5: Test Your Deployment

### Test Railway URL
```bash
curl https://your-app-name.up.railway.app/api/services
```

### Test Custom Domain (after DNS propagation)
```bash
# Check DNS
nslookup kdih.org

# Test HTTPS
curl https://kdih.org/api/services

# Open in browser
open https://kdih.org
```

## Step 6: Create Admin User

Once deployed, create your admin user:

```bash
# SSH into Railway (if necessary) or use Railway's console
# Then run your create-admin script
```

Or use the database seeding which automatically creates:
- Username: `admin` / Password: `admin123`
- Username: `superadmin` / Password: `superadmin123`

**IMPORTANT:** Change these passwords immediately after first login!

## Step 7: Post-Deployment Checklist

- [ ] Website loads at `https://kdih.org`
- [ ] SSL certificate is active (green padlock)
- [ ] Admin login works
- [ ] Contact form sends emails
- [ ] Course registration works
- [ ] Payment integration works (test with small amount)
- [ ] All images and assets load
- [ ] Member portal is accessible

## Troubleshooting

### Database Not Persisting
- Ensure Volume is mounted at `/app/data`
- Set `DB_PATH=/app/data/kdih.db` in environment variables

### Domain Not Working
- Check DNS propagation: `nslookup kdih.org`
- Verify CNAME record in GoDaddy
- Wait up to 48 hours for full propagation

### Emails Not Sending
- Use Gmail App Password, not regular password
- Enable "Less secure app access" if using regular Gmail
- Consider using SendGrid for production

### Deployment Fails
- Check Railway logs in dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Continuous Deployment

Railway automatically redeploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Railway auto-deploys! 🚀
```

## Cost Management

Monitor your Railway usage:
- Go to **Usage** tab in Railway
- Track monthly spend
- Set up spending limits if needed

Free tier: $5 credit/month
Expected cost: $3-8/month for moderate traffic

## Next Steps

1. Set up monitoring (Railway provides basic logs)
2. Configure automated backups for database
3. Set up error tracking (e.g., Sentry)
4. Implement rate limiting (already in code)
5. Consider CDN for static assets (Cloudflare)

---

**Need Help?**
- Railway Docs: https://docs.railway.app
- Railway Discord: Community support
- Contact me for assistance!
