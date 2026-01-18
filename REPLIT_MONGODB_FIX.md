# 🔧 Fix MongoDB Connection in Replit

## Problem
After deployment, MongoDB is not connecting in Replit.

## Common Causes

### 1. MongoDB Atlas Network Access
**Most Common Issue!**

MongoDB Atlas blocks connections by default. You need to allow Replit IPs.

**Fix:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **Network Access** (left sidebar)
3. Click **Add IP Address**
4. Click **Allow Access from Anywhere** (or enter `0.0.0.0/0`)
5. Click **Confirm**
6. Wait 1-2 minutes for changes to propagate

### 2. Environment Variable Not Set
**Check Replit Secrets:**

1. In Replit, click **🔒 Secrets** (lock icon)
2. Verify `MONGODB_URI` is set:
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```
3. Make sure there are **no spaces** around the `=` sign
4. Make sure the password is **URL encoded** if it contains special characters

### 3. Connection String Format
**Correct Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database?retryWrites=true&w=majority
```

**Common Mistakes:**
- ❌ Missing `mongodb+srv://` prefix
- ❌ Wrong password (not URL encoded)
- ❌ Missing database name
- ❌ Extra spaces in the string

### 4. Cluster Paused
**Check MongoDB Atlas:**
1. Go to your cluster
2. Make sure it's **running** (not paused)
3. Free tier clusters auto-pause after inactivity

### 5. Connection Timeout
**Already Fixed:**
- Timeouts increased to 30 seconds for Replit
- Non-blocking connection (server starts even if DB fails)

## Quick Fix Steps

### Step 1: Check MongoDB Atlas Network Access
```
1. MongoDB Atlas → Network Access
2. Add IP: 0.0.0.0/0
3. Wait 2 minutes
```

### Step 2: Verify Replit Secrets
```
1. Replit → Secrets (🔒 icon)
2. Check MONGODB_URI is set
3. Format: mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority
```

### Step 3: Test Connection
After fixing, restart your Replit:
1. Click **Stop**
2. Click **Run**
3. Check console logs for:
   - ✅ "Connected to MongoDB successfully!"
   - ❌ Any error messages

### Step 4: Check Logs
Look for these in Replit Console:
```
✅ Connected to MongoDB successfully!
📦 Database: grocery
```

Or errors like:
```
❌ MongoDB connection error: ...
💡 Troubleshooting tips: ...
```

## Test Connection Endpoint

After deployment, test:
```
https://your-repl-url.repl.co/api/health/db
```

Should return:
```json
{
  "status": "connected",
  "connected": true,
  "database": "grocery"
}
```

## Still Not Working?

1. **Check Replit Console** for specific error messages
2. **Test connection string** in MongoDB Atlas → Connect → Connect your application
3. **Verify password** doesn't have special characters (or URL encode them)
4. **Check cluster status** in MongoDB Atlas (not paused)

## Password with Special Characters

If your password has special characters like `@`, `#`, `%`, etc.:
1. URL encode them:
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`
   - etc.
2. Or change your MongoDB password to one without special characters

## Example Connection String

```
mongodb+srv://krishbavarva:o8RVjnUOeMUUEd68@cluster0.atewaqb.mongodb.net/grocery?retryWrites=true&w=majority
```

Make sure:
- ✅ Username is correct
- ✅ Password is correct (and URL encoded if needed)
- ✅ Cluster name matches (`cluster0.atewaqb`)
- ✅ Database name is correct (`grocery`)

---

**Most likely fix:** Add `0.0.0.0/0` to MongoDB Atlas Network Access! 🎯

