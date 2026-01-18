# How to Add Project to GitLab - Step by Step Guide

This guide will help you push your project to GitLab and set up CI/CD.

## 🚀 Quick Steps to Add Project to GitLab

### Step 1: Create GitLab Project

1. **Go to GitLab**: https://gitlab.com
2. **Click the "+" button** (top right) → **"New project/repository"**
3. Choose **"Create blank project"**
4. **Fill in details**:
   - **Project name**: `grocery-store` (or your preferred name)
   - **Project slug**: Will auto-generate
   - **Visibility**: Choose Private or Public
   - **Initialize with README**: ❌ Uncheck this (we have our own files)
5. **Click "Create project"**

### Step 2: Get Your GitLab Project URL

After creating the project, GitLab will show you the project URL. It will look like:
```
https://gitlab.com/your-username/grocery-store.git
```

**Copy this URL** - you'll need it in the next step.

### Step 3: Connect Your Local Project to GitLab

Open terminal/command prompt in your project root directory (`2-1=2`) and run:

```bash
# Check current git status
git status

# Add all new files (including .gitlab-ci.yml)
git add .

# Commit all changes
git commit -m "Add CI/CD pipeline and complete grocery store features"

# Add GitLab remote (replace YOUR_USERNAME and PROJECT_NAME with your actual values)
git remote add gitlab https://gitlab.com/YOUR_USERNAME/PROJECT_NAME.git

# Or if you want to replace existing remote (if you already have origin):
# git remote set-url origin https://gitlab.com/YOUR_USERNAME/PROJECT_NAME.git

# Push to GitLab
git push -u gitlab main
```

**Important**: Replace `YOUR_USERNAME` and `PROJECT_NAME` with your actual GitLab username and project name.

### Step 4: Verify Push

1. Go back to your GitLab project page
2. You should see all your files
3. Check that `.gitlab-ci.yml` is in the root directory

## 🔐 Step 5: Configure CI/CD Variables

After pushing, set up environment variables:

1. In GitLab project, go to **Settings** → **CI/CD**
2. Expand **"Variables"** section
3. Click **"Add variable"** for each variable:

| Variable Name | Example Value | Mask? |
|--------------|---------------|-------|
| `MONGODB_URI` | `mongodb+srv://...` | ✅ Yes |
| `JWT_SECRET` | `your-secret-key` | ✅ Yes |
| `STRIPE_SECRET_KEY` | `sk_test_...` | ✅ Yes |
| `NODE_ENV` | `production` | ❌ No |

**Important**: 
- ✅ Check **"Mask variable"** for sensitive values (password, keys)
- ✅ Check **"Protect variable"** to only use in protected branches

## 🎯 Step 6: Trigger First Pipeline

After pushing your code:

1. Go to **CI/CD** → **Pipelines** in your GitLab project
2. You should see a pipeline running automatically (triggered by the push)
3. Wait for it to complete
4. Check status:
   - ✅ Green = Success
   - ❌ Red = Failed (check logs)

## 📝 Alternative: If You Want to Replace Existing Remote

If you already have a remote (like GitHub), and want to use GitLab instead:

```bash
# Check current remotes
git remote -v

# Replace origin with GitLab URL
git remote set-url origin https://gitlab.com/YOUR_USERNAME/PROJECT_NAME.git

# Verify
git remote -v

# Push
git push -u origin main
```

## 🔍 Troubleshooting

### Issue: "Remote already exists"

If you see `error: remote origin already exists`:

**Solution 1**: Add GitLab as a different remote name:
```bash
git remote add gitlab https://gitlab.com/YOUR_USERNAME/PROJECT_NAME.git
git push -u gitlab main
```

**Solution 2**: Replace existing remote:
```bash
git remote set-url origin https://gitlab.com/YOUR_USERNAME/PROJECT_NAME.git
git push -u origin main
```

### Issue: Authentication Failed

If push fails with authentication error:

1. **Use Personal Access Token**:
   - Go to GitLab → Settings → Access Tokens
   - Create token with `write_repository` scope
   - Use token as password when pushing

2. **Or use SSH**:
   - Set up SSH keys in GitLab
   - Use SSH URL: `git@gitlab.com:username/project.git`

### Issue: Files Not Showing in GitLab

- Check `.gitignore` - files might be ignored
- Make sure you ran `git add .`
- Verify commit was successful: `git log`

## ✅ Verification Checklist

After completing all steps:

- [ ] GitLab project created
- [ ] Local repository connected to GitLab
- [ ] All files pushed to GitLab
- [ ] `.gitlab-ci.yml` visible in GitLab repository
- [ ] CI/CD variables configured
- [ ] First pipeline triggered (visible in CI/CD → Pipelines)
- [ ] Pipeline status checked (green ✅ or red ❌)

## 📚 Next Steps

1. **Monitor Pipelines**: Check CI/CD → Pipelines regularly
2. **Add Tests**: Create tests in `backend/tests/` and `frontend/tests/`
3. **Customize Deployment**: Update deploy jobs in `.gitlab-ci.yml`
4. **Set up Branch Protection**: Protect main branch in Settings → Repository

## 🆘 Need Help?

- Check `.gitlab-ci.yml` syntax
- Review pipeline logs for errors
- Verify environment variables are set
- Check GitLab CI/CD documentation

---

**Quick Command Summary:**

```bash
# Add all files
git add .

# Commit
git commit -m "Add CI/CD pipeline"

# Add GitLab remote
git remote add gitlab https://gitlab.com/YOUR_USERNAME/PROJECT_NAME.git

# Push to GitLab
git push -u gitlab main
```

