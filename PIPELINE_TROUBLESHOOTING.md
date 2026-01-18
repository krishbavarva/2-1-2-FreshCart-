# GitLab Pipeline Troubleshooting Guide

## 🔍 How to Check Pipeline Errors

1. **Go to GitLab Pipeline Page:**
   - Click on the failed pipeline (red X icon)
   - Click on the failed job to see the error

2. **Check Job Logs:**
   - Look for red error messages
   - Check which stage failed (test, build, or deploy)

## 🐛 Common Pipeline Failures

### 1. Frontend Build Failure

**Error:** `npm run build` fails

**Possible Causes:**
- Missing dependencies
- Build errors in code
- Environment variables not set

**Fix:**
```bash
# Check locally
cd frontend
npm install
npm run build
```

### 2. Backend Build Failure

**Error:** `node -c app.js` fails

**Possible Causes:**
- Syntax errors in `app.js`
- Missing dependencies

**Fix:**
```bash
# Check locally
cd backend
npm install
node -c app.js
```

### 3. Test Failures

**Error:** Tests fail

**Note:** Tests have `allow_failure: true`, so they won't break the pipeline, but you should fix them.

**Fix:**
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### 4. GitHub Sync Failure

**Error:** `sync:github` job fails

**Possible Causes:**
- `GITHUB_REPO_URL` not set
- `GITHUB_TOKEN` or `GITHUB_SSH_PRIVATE_KEY` not set
- GitHub repository doesn't exist

**Fix:**
1. Go to GitLab → Settings → CI/CD → Variables
2. Add `GITHUB_REPO_URL` = `https://github.com/username/repo.git`
3. Add `GITHUB_TOKEN` = your GitHub personal access token
4. Or add `GITHUB_SSH_PRIVATE_KEY` = your SSH private key

**Note:** This job has `allow_failure: true`, so it won't break the pipeline.

## ✅ Quick Fixes

### If Frontend Build Fails:

1. Check for missing environment variables:
   ```bash
   # In frontend/.env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=your_key
   ```

2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

### If Backend Build Fails:

1. Check `app.js` for syntax errors
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

### If All Jobs Pass But Pipeline Shows Failed:

- Check if any job without `allow_failure: true` failed
- Jobs with `allow_failure: true` can fail without breaking the pipeline

## 📋 Pipeline Job Status

| Job | Stage | Allow Failure | Will Break Pipeline? |
|-----|-------|---------------|----------------------|
| `backend:test` | test | ✅ Yes | ❌ No |
| `frontend:test` | test | ✅ Yes | ❌ No |
| `backend:lint` | test | ✅ Yes | ❌ No |
| `frontend:build` | build | ❌ No | ✅ Yes |
| `backend:build` | build | ❌ No | ✅ Yes |
| `sync:github` | deploy | ✅ Yes | ❌ No |
| `deploy:production` | deploy | ✅ Yes | ❌ No |
| `deploy:github:info` | deploy | ✅ Yes | ❌ No |

## 🎯 Most Likely Issues

1. **Frontend build failing** - Missing dependencies or build errors
2. **Backend build failing** - Syntax errors in `app.js`
3. **GitHub sync failing** - Missing credentials (but this won't break pipeline)

## 🔧 Next Steps

1. **Click on the failed pipeline** in GitLab
2. **Click on the failed job** (red X)
3. **Read the error message** in the job logs
4. **Fix the issue** based on the error
5. **Push again** to trigger a new pipeline

---

**Need help?** Share the error message from the failed job and I'll help you fix it!

