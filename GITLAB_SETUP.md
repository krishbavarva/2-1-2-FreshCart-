# GitLab Setup and CI/CD Pipeline Guide

This guide explains how to set up your project on GitLab and configure CI/CD pipelines for automated testing and deployment.

## 📋 Prerequisites

1. GitLab account (https://gitlab.com)
2. Git installed on your local machine
3. Project code ready for commit

## 🚀 Step 1: Create GitLab Project

1. **Login to GitLab** (https://gitlab.com)
2. Click the **"+"** icon (top right) → **"New project/repository"**
3. Choose **"Create blank project"**
4. Fill in the project details:
   - **Project name**: `grocery-store` (or your preferred name)
   - **Project slug**: `grocery-store` (auto-generated)
   - **Visibility Level**: Private or Public (as per your preference)
   - **Initialize repository with a README**: ❌ Uncheck (we have our own)
5. Click **"Create project"**

## 🔧 Step 2: Connect Local Repository to GitLab

Open terminal/command prompt in your project root directory and run:

```bash
# Initialize git (if not already done)
git init

# Add GitLab remote (replace with your GitLab project URL)
git remote add origin https://gitlab.com/YOUR_USERNAME/grocery-store.git

# Check current files
git status

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Grocery store application with CI/CD"

# Push to GitLab main branch
git branch -M main
git push -u origin main
```

**Note**: Replace `YOUR_USERNAME` with your actual GitLab username.

## 🔐 Step 3: Configure GitLab CI/CD Variables (Environment Variables)

Your pipeline needs environment variables for deployment. Add them in GitLab:

1. Go to your project in GitLab
2. Navigate to **Settings** → **CI/CD**
3. Expand **"Variables"** section
4. Click **"Add variable"** and add these variables:

### Required Variables (for testing):
```
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
NODE_ENV=production
```

**Important**: 
- ✅ Check **"Mask variable"** for sensitive values
- ✅ Check **"Protect variable"** to only use in protected branches

## 📝 Step 4: Understanding the CI/CD Pipeline

The `.gitlab-ci.yml` file defines your pipeline with these stages:

### Stages:

1. **Test Stage**:
   - `backend:test` - Runs backend tests
   - `frontend:test` - Runs frontend tests
   - `backend:lint` - Checks code quality

2. **Build Stage**:
   - `frontend:build` - Builds frontend for production
   - `backend:build` - Validates backend build
   - `docker:build` - Builds Docker images (optional)

3. **Deploy Stage**:
   - `deploy:staging` - Deploys to staging environment
   - `deploy:production` - Deploys to production environment

## 🧪 Step 5: Add Tests (Optional but Recommended)

Currently, tests are optional. To add tests later:

### Backend Tests:
Create test files in `backend/tests/`:

```javascript
// backend/tests/auth.test.js
import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('Auth Controller', () => {
  it('should register a new user', () => {
    // Your test code here
  });
});
```

### Frontend Tests:
Install testing framework:

```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

## 🐳 Step 6: Docker Setup (Optional)

If you want to use Docker deployment:

1. **Enable Container Registry** in GitLab:
   - Settings → General → Visibility → Container Registry: Enabled

2. **Configure Docker builds** in `.gitlab-ci.yml` (already included)

## 📊 Step 7: Monitor Pipeline

1. Go to **CI/CD** → **Pipelines** in your GitLab project
2. View pipeline status and logs
3. Click on any job to see detailed logs

## 🔄 Pipeline Triggers

Pipelines run automatically when:
- ✅ Code is pushed to any branch
- ✅ Merge requests are created
- ✅ Manual trigger from GitLab UI

**Deploy stages** are set to `manual` - you need to click "Play" button to deploy.

## 📱 Quick Commands

```bash
# Check pipeline status
gitlab-ci status

# View pipeline logs
# (In GitLab UI: CI/CD → Pipelines → Click on pipeline)

# Push new changes (triggers pipeline)
git add .
git commit -m "Update: description of changes"
git push origin main
```

## 🔍 Troubleshooting

### Pipeline Fails?

1. **Check logs**: CI/CD → Pipelines → Click failed job
2. **Common issues**:
   - Missing environment variables → Add them in Settings → CI/CD → Variables
   - Test failures → Fix failing tests
   - Build errors → Check npm install and build scripts

### Tests Not Running?

- Tests are optional - pipeline will pass with "No tests configured" message
- Add tests to `backend/tests/` or `frontend/tests/` when ready

### Docker Build Fails?

- Ensure Container Registry is enabled
- Check Dockerfile syntax
- Verify Docker login credentials

## 📚 Additional Resources

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [GitLab CI/CD Variables](https://docs.gitlab.com/ee/ci/variables/)
- [GitLab Container Registry](https://docs.gitlab.com/ee/user/packages/container_registry/)

## ✅ Verification Checklist

- [ ] GitLab project created
- [ ] Local repository connected to GitLab
- [ ] Code pushed to GitLab
- [ ] `.gitlab-ci.yml` file exists in project root
- [ ] Environment variables added in GitLab
- [ ] First pipeline run successfully
- [ ] Test jobs passing (or skipping gracefully)
- [ ] Build jobs completing successfully

## 🎉 Next Steps

1. **Customize deployment**: Update `deploy:staging` and `deploy:production` jobs with your actual deployment commands
2. **Add tests**: Write unit and integration tests
3. **Set up monitoring**: Configure GitLab monitoring and alerts
4. **Protect branches**: Enable branch protection rules for main branch

---

**Need Help?** Check GitLab CI/CD documentation or review pipeline logs for detailed error messages.

