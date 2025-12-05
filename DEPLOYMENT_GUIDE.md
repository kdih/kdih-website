# 🚀 KDIH Website Deployment Guide - Railway.app

## Complete Step-by-Step Guide for Beginners

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:

- [ ] GitHub account (create at github.com if you don't have one)
- [ ] Railway account (we'll create this together)
- [ ] Your email credentials for sending notifications
- [ ] Your Paystack API keys (live keys, not test keys)
- [ ] Admin password you want to use

---

## Part 1: Prepare Your Code for Deployment

### Step 1: Create a GitHub Repository

1. **Go to GitHub.com** and sign in
2. **Click the "+" icon** (top right) → "New repository"
3. **Repository name:** `kdih-website`
4. **Set to Private** (recommended for security)
5. **Click "Create repository"**

### Step 2: Upload Your Code to GitHub

Open your terminal in the project folder and run these commands:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit - KDIH website ready for deployment"

# Connect to your GitHub repository (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/kdih-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

> **Note:** Replace `YOUR-USERNAME` with your actual GitHub username

---

## Part 2: Deploy to Railway

### Step 1: Create Railway Account

1. **Go to:** https://railway.app
2. **Click "Login"** → Choose "Login with GitHub"
3. **Authorize Railway** to access your GitHub account
4. **Verify your email** if prompted

### Step 2: Create New Project

1. **Click "New Project"** on Railway dashboard
2. **Select "Deploy from GitHub repo"**
3. **Choose your repository:** `kdih-website`
4. **Click "Deploy Now"**

Railway will automatically:
- Detect it's a Node.js app
- Install dependencies
- Try to start the server

### Step 3: Add PostgreSQL Database

> **Why PostgreSQL?** SQLite doesn't work well on Railway. PostgreSQL is more reliable for production.

1. **In your Railway project**, click **"+ New"**
2. **Select "Database"** → **"Add PostgreSQL"**
3. Railway will create a database automatically
4. **Click on the PostgreSQL service** → **"Variables"** tab
5. **Copy the DATABASE_URL** (you'll need this)

### Step 4: Configure Environment Variables

1. **Click on your web service** (the one with your code)
2. **Go to "Variables" tab**
3. **Click "+ New Variable"** and add these one by one:

```env
NODE_ENV=production
PORT=3000

# Database (use the DATABASE_URL from PostgreSQL service)
DATABASE_URL=postgresql://...  (copy from PostgreSQL service)

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Paystack (LIVE KEYS - not test keys!)
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...

# Session Security
SESSION_SECRET=create-a-long-random-string-here-min-32-characters

# Admin
ADMIN_EMAIL=admin@kdih.org
```

> **Important:** For `SESSION_SECRET`, create a random string. You can generate one at: https://randomkeygen.com/

### Step 5: Update Database Configuration

Since we're switching from SQLite to PostgreSQL, we need to update the database connection.

**I'll create the updated database file for you in the next step.**

---

## Part 3: Get Your Domain

### Option A: Use Railway's Free Domain (Easiest)

1. **In your Railway project**, click on your web service
2. **Go to "Settings" tab**
3. **Click "Generate Domain"**
4. You'll get a URL like: `kdih-website-production.up.railway.app`
5. **This is your live website!** ✅

### Option B: Use Your Own Domain (Optional)

If you have a custom domain (e.g., `kdih.org`):

1. **In Railway Settings**, click **"Custom Domain"**
2. **Enter your domain:** `kdih.org` or `www.kdih.org`
3. **Copy the CNAME record** Railway provides
4. **Go to your domain registrar** (Namecheap, GoDaddy, etc.)
5. **Add the CNAME record** to your DNS settings
6. **Wait 5-60 minutes** for DNS to propagate

---

## Part 4: Initialize Production Database

### Step 1: Access Railway Shell

1. **In Railway**, click on your web service
2. **Click the three dots (⋮)** → **"Shell"**
3. A terminal will open in your deployed app

### Step 2: Run Database Setup

In the Railway shell, run:

```bash
node database.js
```

This will create all your database tables.

### Step 3: Create Admin User

Still in the Railway shell:

```bash
node create-admin.js
```

Follow the prompts to create your admin account.

---

## Part 5: Test Your Deployment

### Test Checklist:

1. **Visit your Railway URL**
   - [ ] Homepage loads correctly
   - [ ] Images and styles work

2. **Test Admin Login**
   - [ ] Go to `/admin`
   - [ ] Login with your admin credentials
   - [ ] Dashboard loads

3. **Test Course Registration**
   - [ ] Register for a course
   - [ ] Check if email is sent
   - [ ] Test Paystack payment (use test mode first!)

4. **Test Co-working Booking**
   - [ ] Book a desk
   - [ ] Book a meeting room
   - [ ] Check confirmation email

5. **Test Member Dashboard**
   - [ ] Login as a member
   - [ ] View enrolled courses
   - [ ] Check payment status

---

## 🔧 Common Issues & Solutions

### Issue 1: "Application Error" or "503 Service Unavailable"

**Solution:**
1. Check Railway logs: Click on your service → "Deployments" → Click latest deployment → "View Logs"
2. Look for error messages
3. Usually means environment variables are missing

### Issue 2: Database Connection Error

**Solution:**
1. Make sure `DATABASE_URL` is set in environment variables
2. Verify PostgreSQL service is running
3. Check if database.js ran successfully

### Issue 3: Emails Not Sending

**Solution:**
1. Verify `EMAIL_USER` and `EMAIL_PASS` are correct
2. Make sure you're using a Gmail App Password (not your regular password)
3. Enable "Less secure app access" in Gmail settings

### Issue 4: Paystack Payments Not Working

**Solution:**
1. Verify you're using **LIVE keys** (not test keys)
2. Check `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` are set
3. Make sure your Paystack account is fully verified

---

## 📊 Monitoring Your Website

### View Logs

1. **In Railway**, click your web service
2. **Go to "Deployments"**
3. **Click on the latest deployment**
4. **Click "View Logs"** to see real-time activity

### Check Resource Usage

1. **In Railway**, click your web service
2. **Go to "Metrics"** tab
3. Monitor:
   - CPU usage
   - Memory usage
   - Network traffic

### Set Up Alerts

1. **In Railway**, go to project settings
2. **Enable "Deploy Notifications"**
3. Get notified when deployments succeed/fail

---

## 💰 Cost Management

### Free Tier ($5 credit/month)

**What you get:**
- ~500-1000 visitors per month
- 512MB RAM
- 1GB storage
- Enough for testing and small traffic

### When to Upgrade

Upgrade when you see:
- Consistent 500+ daily visitors
- Running out of free credits
- Need more storage for files

**Typical costs:**
- Small hub (1000-5000 visitors/month): $10-15/month
- Medium hub (5000-10000 visitors/month): $20-30/month

---

## 🔄 Updating Your Website

### Automatic Deployments (Recommended)

Every time you push to GitHub, Railway automatically deploys:

```bash
# Make your changes locally
# Then commit and push
git add .
git commit -m "Updated room booking feature"
git push origin main
```

Railway will automatically:
1. Pull your changes
2. Install dependencies
3. Restart the server
4. Deploy the update

### Manual Deployment

1. **In Railway**, click your web service
2. **Go to "Deployments"**
3. **Click "Deploy"** → **"Redeploy"**

---

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` file to GitHub
- ✅ Use strong `SESSION_SECRET` (32+ characters)
- ✅ Rotate secrets every 6 months

### 2. Database Backups
- ✅ Railway auto-backs up PostgreSQL daily
- ✅ Download manual backups monthly
- ✅ Store backups securely

### 3. SSL/HTTPS
- ✅ Railway provides free SSL automatically
- ✅ All traffic is encrypted
- ✅ No additional setup needed

### 4. Rate Limiting
- ✅ Already configured in your app
- ✅ Prevents abuse and DDoS attacks

---

## 📞 Getting Help

### Railway Support
- **Documentation:** https://docs.railway.app
- **Discord:** https://discord.gg/railway
- **Email:** team@railway.app

### KDIH Technical Issues
- Check logs first (Railway → Deployments → View Logs)
- Review error messages
- Test locally before deploying

---

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] Bookmark your Railway dashboard
- [ ] Save your admin credentials securely
- [ ] Test all major features
- [ ] Set up monitoring/alerts
- [ ] Share website URL with team
- [ ] Update DNS if using custom domain
- [ ] Schedule regular database backups
- [ ] Document any custom configurations

---

## 🎉 You're Live!

Congratulations! Your KDIH website is now live and accessible to the world.

**Next Steps:**
1. Share your website URL
2. Monitor traffic and performance
3. Gather user feedback
4. Plan future updates

**Your Railway Dashboard:** https://railway.app/dashboard

---

## Quick Reference Commands

```bash
# View logs
railway logs

# Open shell
railway shell

# Link local project to Railway
railway link

# Deploy manually
railway up
```

---

**Need help?** Review the "Common Issues" section or check Railway documentation.

**Good luck with your KDIH platform! 🚀**
