#!/bin/bash
# Script to push to both GitLab and GitHub at once

echo "🚀 Pushing to GitLab and GitHub..."

# Push to GitLab
echo "📤 Pushing to GitLab..."
git push gitlab main || git push gitlab master

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push github main || git push github master

echo "✅ Done! Code pushed to both GitLab and GitHub"
echo "🔄 GitLab CI will auto-sync to GitHub (if configured)"

