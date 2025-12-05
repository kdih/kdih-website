#!/bin/bash

# KDIH Website - Railway Deployment Helper Script
# This script helps prepare your project for Railway deployment

set -e

echo "🚀 KDIH Railway Deployment Helper"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not initialized"
    echo "   Run: git init"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 You have uncommitted changes:"
    git status --short
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    fi
fi

# Check if remote is set
if ! git remote | grep -q "origin"; then
    echo ""
    echo "🔗 No remote repository found"
    read -p "Enter your GitHub repository URL: " repo_url
    git remote add origin "$repo_url"
    echo "✅ Remote added: $repo_url"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main || git push -u origin master

echo ""
echo "✅ Code pushed to GitHub successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://railway.app"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'Deploy from GitHub repo'"
echo "4. Select your kdih-website repository"
echo "5. Add environment variables (see RAILWAY_DEPLOYMENT_GUIDE.md)"
echo "6. Add persistent volume: /app/data"
echo "7. Configure custom domain: kdih.org"
echo ""
echo "For detailed instructions, see: RAILWAY_DEPLOYMENT_GUIDE.md"
echo ""
