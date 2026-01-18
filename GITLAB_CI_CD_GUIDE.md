# How to Check CI/CD Pipeline in GitLab

This guide explains how to monitor, check, and troubleshoot your CI/CD pipeline in GitLab.

## 🔍 Quick Ways to Check CI/CD Status

### Method 1: View Pipelines Page (Recommended)

1. **Login to GitLab** → Navigate to your project
2. Click on **"CI/CD"** in the left sidebar
3. Click **"Pipelines"** (or it may show directly)
4. You'll see all pipeline runs with:
   - ✅ **Green checkmark** = Pipeline passed
   - ❌ **Red X** = Pipeline failed
   - ⏸️ **Paused icon** = Pipeline paused/waiting
   - ⏳ **Clock icon** = Pipeline running

### Method 2: From Project Homepage

1. Go to your project homepage
2. Look at the **top section** - you'll see pipeline status badges
3. Click on the status badge to go to pipelines page

### Method 3: From Commits Page

1. Click **"Repository"** → **"Commits"** in left sidebar
2. Each commit shows a pipeline status icon next to it:
   - ✅ Passed
   - ❌ Failed
   - ⏳ Running
   - ⏸️ Paused

## 📊 Understanding Pipeline Status

### Pipeline States:

| Icon | Status | Meaning |
|------|--------|---------|
| ✅ | **Passed** | All jobs completed successfully |
| ❌ | **Failed** | One or more jobs failed |
| ⏳ | **Running** | Pipeline is currently executing |
| ⏸️ | **Skipped** | Pipeline was skipped |
| ⚠️ | **Warning** | Pipeline passed with warnings |
| 🛑 | **Canceled** | Pipeline was manually canceled |

## 🔎 Viewing Pipeline Details

### Step 1: Click on a Pipeline

1. Go to **CI/CD** → **Pipelines**
2. Click on any pipeline (the status badge or pipeline ID)
3. You'll see the **pipeline overview** with all jobs

### Step 2: View Job Details

Click on any **job** (e.g., `backend:test`, `frontend:build`) to see:
- Job status (Passed/Failed/Running)
- Job logs (console output)
- Job duration
- Job artifacts (if any)

### Step 3: View Job Logs

1. Click on a job name
2. Scroll down to see **job logs**
3. Logs show:
   - Commands executed
   - Output from scripts
   - Error messages (if any)
   - Warning messages

## 📝 Reading Job Logs

### Successful Job Log Example:

```
$ cd backend
Installing backend dependencies...
npm ci
Running backend tests...
No tests configured yet - skipping
Job succeeded
```

### Failed Job Log Example:

```
$ cd backend
Installing backend dependencies...
npm ci
ERROR: npm ci failed
Error: Missing package-lock.json
Job failed
```

## 🔍 Troubleshooting Failed Pipelines

### Step 1: Identify Which Job Failed

1. Go to **CI/CD** → **Pipelines**
2. Click on failed pipeline (❌ red icon)
3. Find the job with ❌ red icon

### Step 2: Check Job Logs

1. Click on the failed job
2. Scroll to bottom of logs
3. Look for error messages (usually in red)

### Common Issues:

#### Issue 1: Missing Environment Variables
**Error**: `MONGODB_URI is not defined`
**Solution**: 
- Go to **Settings** → **CI/CD** → **Variables**
- Add missing variables

#### Issue 2: Test Failures
**Error**: `Tests failed` or `npm test failed`
**Solution**:
- Check test files in `backend/tests/` or `frontend/tests/`
- Fix failing tests
- If no tests exist, pipeline will skip (no error)

#### Issue 3: Build Failures
**Error**: `npm run build failed`
**Solution**:
- Check build errors in job logs
- Verify all dependencies are installed
- Check for syntax errors

#### Issue 4: Docker Build Failures
**Error**: `docker build failed`
**Solution**:
- Check Dockerfile syntax
- Verify Container Registry is enabled
- Check Docker login credentials

## 📈 Pipeline Metrics & Insights

### View Pipeline Statistics:

1. Go to **CI/CD** → **Pipelines**
2. Look at the **top section** for:
   - **Total pipelines**: Number of pipelines run
   - **Success rate**: Percentage of successful pipelines
   - **Average duration**: How long pipelines take

### Pipeline Charts:

1. Go to **CI/CD** → **Analytics** → **CI/CD Analytics**
2. View charts showing:
   - Pipeline success rate over time
   - Pipeline duration trends
   - Most common failure reasons

## 🎯 Quick Actions on Pipelines

### Cancel a Running Pipeline:

1. Go to **CI/CD** → **Pipelines**
2. Click on running pipeline
3. Click **"Cancel"** button (top right)

### Retry a Failed Pipeline:

1. Go to **CI/CD** → **Pipelines**
2. Click on failed pipeline
3. Click **"Retry"** button (top right)
4. Or click **"Retry failed jobs"**

### Manual Deployment:

1. Go to **CI/CD** → **Pipelines**
2. Find deployment stage (e.g., `deploy:production`)
3. Click **"Play"** button (▶️) to manually trigger
4. Only works for jobs with `when: manual`

## 📱 Pipeline Notifications

### Email Notifications:

GitLab sends emails when:
- ✅ Pipeline passes
- ❌ Pipeline fails
- ⚠️ Pipeline has warnings

### Configure Notifications:

1. Go to **Settings** → **Notifications**
2. Configure email preferences
3. Choose which events to receive notifications for

## 🔔 Pipeline Badges

### Add Pipeline Badge to README:

1. Go to **Settings** → **CI/CD** → **General Pipelines**
2. Expand **"Pipeline status"** section
3. Copy the badge URL
4. Add to your README.md:
   ```markdown
   ![pipeline status](https://gitlab.com/username/project/badges/main/pipeline.svg)
   ```

## 📊 Pipeline Variables in Logs

### Check Environment Variables:

Pipeline logs show which variables are available (masked):
```
$ echo $MONGODB_URI
[FILTERED]  # Sensitive variables are masked
```

### Debug Mode:

To see more details, check job logs or enable verbose mode in `.gitlab-ci.yml`:
```yaml
variables:
  DEBUG: "true"
```

## 🎓 Best Practices

1. **Check pipelines regularly** - Monitor status after each push
2. **Review failed jobs immediately** - Fix issues quickly
3. **Use job artifacts** - Download build outputs for inspection
4. **Set up notifications** - Get alerts for pipeline failures
5. **Review pipeline duration** - Optimize slow jobs

## 🔗 Useful Links

- **CI/CD Pipelines**: `https://gitlab.com/username/project/-/pipelines`
- **Pipeline Editor**: `https://gitlab.com/username/project/-/ci/editor`
- **Job Logs**: Click on any job to view logs

## ✅ Quick Checklist

- [ ] Can access CI/CD → Pipelines page
- [ ] Can see pipeline status (✅/❌)
- [ ] Can click on pipelines to see details
- [ ] Can view job logs
- [ ] Can identify failed jobs
- [ ] Know how to retry failed pipelines
- [ ] Have configured environment variables
- [ ] Understand pipeline stages

## 🆘 Need Help?

If pipeline fails:
1. Check job logs for error messages
2. Verify environment variables are set
3. Ensure code doesn't have syntax errors
4. Check `.gitlab-ci.yml` syntax is correct
5. Review GitLab CI/CD documentation

---

**Quick Tip**: Use browser bookmarks to quickly access pipelines page: `https://gitlab.com/username/project/-/pipelines`

