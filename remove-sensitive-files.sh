#!/bin/bash

echo "🔒 SECURITY CLEANUP: Removing sensitive files from Git history"
echo "================================================================"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: This is not a git repository!"
    echo "Please run this script from the root of your git repository."
    exit 1
fi

echo "📋 Files to remove from Git history:"
echo "  - .env"
echo "  - createAdmin.js"
echo "  - config/db.js"
echo "  - config/cloudinary.js"
echo "  - config/razorpay.js"
echo ""

echo "⚠️  WARNING: This will permanently remove these files from Git history!"
echo "⚠️  This action cannot be undone!"
echo ""

read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled."
    exit 0
fi

echo ""
echo "🚀 Starting cleanup process..."

# Remove files from Git history using git filter-branch
echo "🗑️  Removing .env from Git history..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

echo "🗑️  Removing createAdmin.js from Git history..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch createAdmin.js" \
  --prune-empty --tag-name-filter cat -- --all

echo "🗑️  Removing config/db.js from Git history..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch config/db.js" \
  --prune-empty --tag-name-filter cat -- --all

echo "🗑️  Removing config/cloudinary.js from Git history..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch config/cloudinary.js" \
  --prune-empty --tag-name-filter cat -- --all

echo "🗑️  Removing config/razorpay.js from Git history..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch config/razorpay.js" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up the backup refs
echo "🧹 Cleaning up backup references..."
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d

# Force garbage collection
echo "🗂️  Running garbage collection..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✅ Cleanup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Force push to GitHub: git push origin --force --all"
echo "  2. Force push tags: git push origin --force --tags"
echo "  3. Update your .env file with new credentials"
echo "  4. Update createAdmin.js with new admin credentials"
echo "  5. Update config files with new credentials"
echo ""
echo "⚠️  IMPORTANT: After force pushing, update all your credentials!"
echo "⚠️  The old credentials are now compromised and should be changed!"
echo ""
echo "🔒 Your repository is now secure!"
