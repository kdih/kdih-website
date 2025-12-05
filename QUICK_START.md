# 🚀 KDIH Website - Quick Start Deployment Guide

## Your Project is Ready for Railway Deployment!

---

## ✅ What's Been Done

1.  **Database configured** for Railway (using environment variable)
2. **Git repository initialized** in your project
3. **Deployment documentation** created
4. **Helper scripts** added for easy deployment

---

## 📋 Next Steps (In Order)

### 1. Create GitHub Repository & Push Code

```bash
# Navigate to your project
cd "/Users/yankyaure/Downloads/kdih_website 2"

# Add all files
git add .

# Commit
git commit -m "Prepare KDIH website for Railway deployment"

# Create a new GitHub repository at: https://github.com/new
# Name it: kdih-website

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/kdih-website.git
git push -u origin main
```

**OR use the helper script:**
```bash
./deploy-railway.sh
```

---

### 2. Deploy to Railway

1. **Go to:** https://railway.app
2. **Sign up** with your GitHub account
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your **kdih-website** repository
6. Railway automatically detects Node.js and deploys!

---

### 3. Configure Environment Variables

In Railway dashboard:
1. Go to **Variables** tab
2. Add all variables from `.env.railway` file
3. **Important variables:**
   - `NODE_ENV=production`
   - `DB_PATH=/app/data/kdih.db`
   - `SESSION_SECRET=<generate-strong-secret>`
   - `EMAIL_USER=<your-gmail>`
   - `EMAIL_PASS=<gmail-app-password>`
   - `PAYSTACK_SECRET_KEY=sk_live_...`
   - `PAYSTACK_PUBLIC_KEY=pk_live_...`

See `.env.railway` for full list!

---

### 4. Add Persistent Volume (SQLite Database Storage)

1. In Railway, click **"New"** → **"Volume"**
2. **Mount path:** `/app/data`
3. **Size:** 1 GB
4. Click **"Add Volume"**

This ensures your database survives deployments! 💾

---

### 5. Configure Custom Domain (kdih.org)

**In Railway:**
1. Go to **Settings** → **Domains** 
2. Click **"Custom Domain"**
3. Enter: `kdih.org`
4. Copy the DNS records shown

**In GoDaddy:**
1. Go to **My Products** → **kdih.org** → **DNS**
2. Add **CNAME** record:
   - Name: `@`
   - Value: `your-app.up.railway.app`
   - TTL: 600
3. **Save** and wait 10-60 minutes

---

### 6. Test Your Deployment ✅

```bash
# Test Railway URL
curl https://your-app.up.railway.app/api/services

# After DNS propagates, test custom domain  
curl https://kdih.org/api/services

# Open in browser
open https://kdih.org
```

---

## 📚 Documentation Files

- **`RAILWAY_DEPLOYMENT_GUIDE.md`** - Comprehensive step-by-step guide
- **`.env.railway`** - Environment variables template
- **`deploy-railway.sh`** - Automated deployment helper script

---

## ⚙️ Default Admin Credentials

After deployment, login with:
- **Username:** `admin`
- **Password:** `admin123`

OR

- **Username:** `superadmin`  
- **Password:** `superadmin123`

**⚠️ CHANGE THESE IMMEDIATELY AFTER FIRST LOGIN!**

---

## 💰 Expected Costs

- **Month 1-3:** FREE (using $5 credit)
- **Month 4+:** $3-8/month for small-medium traffic
- **Monitor usage** in Railway dashboard

---

## 🆘 Need Help?

- Check **RAILWAY_DEPLOYMENT_GUIDE.md** for detailed troubleshooting
- Railway Docs: https://docs.railway.app
- Contact support if stuck!

---

## 🎯 Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create Railway project
- [ ] Add environment variables
- [ ] Add persistent volume
- [ ] Configure kdih.org domain
- [ ] Test live website
- [ ] Change default admin password
- [ ] Test payment integration

---

**Ready to deploy? Start with Step 1 above!** 🚀
