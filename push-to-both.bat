@echo off
REM Script to push to both GitLab and GitHub at once (Windows)

echo 🚀 Pushing to GitLab and GitHub...

REM Push to GitLab
echo 📤 Pushing to GitLab...
git push gitlab main
if errorlevel 1 git push gitlab master

REM Push to GitHub
echo 📤 Pushing to GitHub...
git push github main
if errorlevel 1 git push github master

echo ✅ Done! Code pushed to both GitLab and GitHub
echo 🔄 GitLab CI will auto-sync to GitHub (if configured)

pause


