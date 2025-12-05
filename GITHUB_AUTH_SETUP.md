# GitHub Authentication Setup Guide

The git push failed due to authentication. Here are your options:

## Option 1: Personal Access Token (RECOMMENDED - Easiest)

### Step 1: Create a Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token" → "Generate new token (classic)"**
3. Give it a name: `KDIH Website Deployment`
4. Select scopes: Check **`repo`** (full control of private repositories)
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Push with Token

```bash
cd "/Users/yankyaure/Downloads/kdih_website 2"

# Use this format (replace YOUR_TOKEN with the actual token)
git remote set-url origin https://YOUR_TOKEN@github.com/kdih/kdih-website.git

# Now push
git push -u origin main
```

**Example:**
```bash
git remote set-url origin https://ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx@github.com/kdih/kdih-website.git
git push -u origin main
```

---

## Option 2: SSH Keys (More Secure, One-Time Setup)

### Step 1: Generate SSH Key

```bash
# Check if you already have an SSH key
ls -al ~/.ssh

# If not, generate one
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter for all prompts (default location)

# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to agent
ssh-add ~/.ssh/id_ed25519

# Copy public key to clipboard
cat ~/.ssh/id_ed25519.pub
```

### Step 2: Add SSH Key to GitHub

1. Go to: https://github.com/settings/keys
2. Click **"New SSH key"**
3. Title: `MacBook Pro KDIH`
4. Paste the public key
5. Click **"Add SSH key"**

### Step 3: Change Remote to SSH

```bash
git remote set-url origin git@github.com:kdih/kdih-website.git
git push -u origin main
```

---

## Option 3: GitHub CLI (Requires Installation)

```bash
# Install GitHub CLI
brew install gh

# Authenticate
gh auth login

# Push
git push -u origin main
```

---

## Quick Fix (Use Option 1 - Token)

1. **Get token** from: https://github.com/settings/tokens
2. **Run this** (replace YOUR_TOKEN):
   ```bash
   cd "/Users/yankyaure/Downloads/kdih_website 2"
   git remote set-url origin https://YOUR_TOKEN@github.com/kdih/kdih-website.git
   git push -u origin main
   ```

That's it! Once the push completes, you can proceed to Railway deployment.
