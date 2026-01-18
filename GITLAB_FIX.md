# Fix: Add Project to GitLab

## Problem
The GitHub project name `2-1-2-FreshCart-` is invalid for GitLab because:
- ❌ Starts with a digit (2)
- ❌ Ends with a dash (-)

## Solution: Create New GitLab Project with Valid Name

### Step 1: Create New Project in GitLab

1. Go to https://gitlab.com
2. Click **"+"** → **"New project/repository"**
3. Choose **"Create blank project"**
4. Use a **valid project name**:
   - ✅ **Good names**: `freshcart`, `grocery-store`, `freshcart-app`, `grocery-app`
   - ❌ **Bad names**: `2-1-2-FreshCart-`, `-project`, `project-`
5. Fill in:
   - **Project name**: `freshcart` (or `grocery-store`)
   - **Project slug**: Will auto-generate
   - **Visibility**: Private or Public
   - **Initialize with README**: ❌ Uncheck
6. Click **"Create project"**

### Step 2: Get the GitLab Project URL

After creating, copy the URL. It will look like:
```
https://gitlab.com/krish.bavarva114999/freshcart.git
```

### Step 3: Push to GitLab

Run these commands (replace `freshcart` with your actual project name):

```bash
# Add GitLab remote
git remote add gitlab https://gitlab.com/krish.bavarva114999/freshcart.git

# Push to GitLab
git push -u gitlab main
```

### Step 4: Verify CI/CD Pipeline

1. Go to your GitLab project
2. Check **CI/CD** → **Pipelines**
3. You should see pipeline running automatically
4. Check that `.gitlab-ci.yml` is in the repository

### Step 5: Configure CI/CD Variables

1. Go to **Settings** → **CI/CD** → **Variables**
2. Add these variables:
   - `MONGODB_URI` (mask it ✅)
   - `JWT_SECRET` (mask it ✅)
   - `STRIPE_SECRET_KEY` (mask it ✅)
   - `NODE_ENV=production`

## Alternative: If Project Already Exists

If you already created a project in GitLab, just use that URL:

```bash
# Remove old remote
git remote remove gitlab

# Add correct remote (use your actual GitLab project URL)
git remote add gitlab https://gitlab.com/krish.bavarva114999/YOUR_PROJECT_NAME.git

# Push
git push -u gitlab main
```

