# GitLab to GitHub Auto-Sync Setup

This guide shows you how to automatically sync your GitLab repository to GitHub whenever you push to GitLab.

## 🚀 Quick Setup (5 Minutes)

### Method 1: Using HTTPS (Easier - Recommended)

#### Step 1: Create GitHub Personal Access Token

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **"Generate new token (classic)"**
3. Name it: `GitLab Sync`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)

#### Step 2: Add GitLab CI/CD Variables

1. Go to your GitLab project
2. **Settings** → **CI/CD** → **Variables** → **Expand**
3. Click **"Add variable"**

**Add these variables:**

**Variable 1:**
- **Key**: `GITHUB_REPO_URL`
- **Value**: `https://YOUR_TOKEN@github.com/yourusername/your-repo-name.git`
  - Replace `YOUR_TOKEN` with your GitHub token
  - Replace `yourusername/your-repo-name` with your GitHub repo
- **Type**: Variable
- **Protected**: ✅ (optional)
- **Masked**: ✅ (recommended)

**Variable 2:**
- **Key**: `GITHUB_USERNAME`
- **Value**: `your-github-username`
- **Type**: Variable

**Variable 3:**
- **Key**: `GITHUB_TOKEN`
- **Value**: `your-github-personal-access-token`
- **Type**: Variable
- **Protected**: ✅
- **Masked**: ✅

#### Step 3: Update .gitlab-ci.yml

The sync job is already configured! Just make sure it's enabled.

#### Step 4: Test It!

1. Make a small change and commit:
   ```bash
   git add .
   git commit -m "Test GitHub sync"
   git push gitlab main
   ```

2. Check GitLab CI/CD pipeline - you should see `sync:github` job
3. Check GitHub - your code should appear automatically!

---

### Method 2: Using SSH (More Secure)

#### Step 1: Generate SSH Key

```bash
ssh-keygen -t ed25519 -C "gitlab-ci@example.com" -f ~/.ssh/gitlab_github_key
```

#### Step 2: Add SSH Key to GitHub

1. Copy the **public key**:
   ```bash
   cat ~/.ssh/gitlab_github_key.pub
   ```

2. Go to GitHub → **Settings** → **SSH and GPG keys**
3. Click **"New SSH key"**
4. **Title**: `GitLab CI Sync`
5. **Key**: Paste your public key
6. Click **"Add SSH key"**

#### Step 3: Add to GitLab CI/CD Variables

1. Go to GitLab → **Settings** → **CI/CD** → **Variables**
2. Add variable:
   - **Key**: `GITHUB_SSH_PRIVATE_KEY`
   - **Value**: Copy your **private key**:
     ```bash
     cat ~/.ssh/gitlab_github_key
     ```
   - **Type**: Variable
   - **Protected**: ✅
   - **Masked**: ❌ (SSH keys can't be masked)

3. Add variable:
   - **Key**: `GITHUB_REPO_URL`
   - **Value**: `git@github.com:yourusername/your-repo-name.git`
   - **Type**: Variable

#### Step 4: Test It!

Push to GitLab and watch it sync to GitHub automatically!

---

## 🔧 Manual Sync (If Auto-Sync Fails)

If auto-sync doesn't work, you can manually sync:

```bash
# Add GitHub remote (if not already added)
git remote add github https://github.com/yourusername/your-repo.git

# Or if using SSH
git remote add github git@github.com:yourusername/your-repo.git

# Push to GitHub
git push github main

# Or push to both at once
git push gitlab main && git push github main
```

---

## 📋 GitLab CI/CD Variables Checklist

Make sure these are set in **GitLab → Settings → CI/CD → Variables**:

- [ ] `GITHUB_REPO_URL` - Your GitHub repo URL
- [ ] `GITHUB_TOKEN` - GitHub personal access token (HTTPS method)
- [ ] `GITHUB_SSH_PRIVATE_KEY` - SSH private key (SSH method)
- [ ] `GITHUB_USERNAME` - Your GitHub username (optional)

---

## 🎯 How It Works

1. **You push to GitLab**: `git push gitlab main`
2. **GitLab CI runs**: Tests, builds, etc.
3. **Auto-sync job runs**: Pushes code to GitHub
4. **GitHub Actions triggers**: Runs tests and deploys to GitHub Pages
5. **Your site is live!** 🎉

---

## 🐛 Troubleshooting

### "Permission denied" error
- Check your GitHub token has `repo` scope
- Verify the token is correct in GitLab variables

### "Repository not found" error
- Make sure the GitHub repo exists
- Check the repo URL is correct
- Verify you have access to the repo

### SSH key not working
- Make sure public key is added to GitHub
- Verify private key is correctly set in GitLab variables
- Check SSH key format (should start with `-----BEGIN OPENSSH PRIVATE KEY-----`)

### Sync job not running
- Check it's enabled in `.gitlab-ci.yml`
- Verify you're pushing to `main` or `master` branch
- Check GitLab CI/CD pipeline logs

---

## ✅ Success Indicators

When it's working, you'll see:
- ✅ `sync:github` job passes in GitLab CI/CD
- ✅ Code appears in GitHub repository
- ✅ GitHub Actions pipeline runs automatically
- ✅ GitHub Pages deploys your site

---

**That's it!** Now every push to GitLab will automatically sync to GitHub! 🚀

