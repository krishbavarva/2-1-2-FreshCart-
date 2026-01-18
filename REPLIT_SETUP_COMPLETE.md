# 🚀 Complete Replit Setup Guide (Based on ChatGPT + Our Code)

This guide combines the best practices from ChatGPT's suggestion with our existing codebase structure.

---

## ✅ Step 1: MongoDB Atlas Setup

### 1.1 Create Free Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Login
3. Create a **Free M0 Cluster** (takes 3-5 minutes)

### 1.2 Create Database User
1. Go to **Database Access** → **Add New Database User**
2. Username: `krishbavarva` (or your choice)
3. Password: `o8RVjnUOeMUUEd68` (or generate a secure one)
4. **Database User Privileges**: Read and write to any database
5. Click **Add User**

### 1.3 Network Access (CRITICAL!)
1. Go to **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"** button
3. This adds `0.0.0.0/0` (all IPs)
4. Click **Confirm**
5. **Wait 2 minutes** for changes to propagate

### 1.4 Get Connection String
1. Go to **Database** → **Connect** → **Connect your application**
2. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. Replace `<username>` and `<password>` with your actual credentials
4. Add database name: `...mongodb.net/grocery?...`

**Final format:**
```
mongodb+srv://krishbavarva:o8RVjnUOeMUUEd68@cluster0.atewaqb.mongodb.net/grocery?retryWrites=true&w=majority
```

---

## ✅ Step 2: Add to Replit Secrets

1. In Replit, click **🔒 Secrets** icon (lock icon in left sidebar)
2. Click **"New secret"**
3. Add these secrets:

| Key | Value | Example |
|-----|-------|---------|
| `MONGODB_URI` | Your connection string | `mongodb+srv://user:pass@cluster.mongodb.net/grocery?retryWrites=true&w=majority` |
| `JWT_SECRET` | Random secret string | `your-super-secret-jwt-key-12345` |
| `STRIPE_SECRET_KEY` | Your Stripe secret key | `sk_test_...` |

**⚠️ IMPORTANT:**
- **NO SPACES** around the `=` sign!
- **NO QUOTES** around the value!
- Use `MONGODB_URI` (we also support `MONGO_URI` for compatibility)

**Correct:**
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/grocery?retryWrites=true&w=majority
```

**Wrong:**
```
MONGODB_URI = mongodb+srv://...  (spaces around =)
MONGODB_URI="mongodb+srv://..."  (quotes)
```

---

## ✅ Step 3: Project Structure

Your project should look like this:
```
your-project/
├── server.js              # Main entry point (serves API + React)
├── package.json           # Root package.json with scripts
├── .replit               # Replit configuration
├── backend/               # Backend code
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── config/
└── frontend/             # React frontend
    ├── src/
    ├── public/
    └── dist/            # Built React app (created after npm run build)
```

---

## ✅ Step 4: Install Dependencies

Replit will automatically run the `[deploy]` command from `.replit`:

```bash
npm run install:all && npm run build && npm start
```

This will:
1. Install root dependencies
2. Install backend dependencies
3. Install frontend dependencies
4. Build React app (`frontend/dist/`)
5. Start server (`node server.js`)

**Manual steps (if needed):**
```bash
# Install all dependencies
npm run install:all

# Build React frontend
npm run build

# Start server
npm start
```

---

## ✅ Step 5: Verify Connection

### 5.1 Check Console Logs

After starting, you should see:

**✅ Success:**
```
🔍 Environment Variables Check:
   MONGODB_URI: ✅ Found
   MongoDB User: krishbavarva
   MongoDB Host: cluster0.atewaqb.mongodb.net
   Database: grocery
   Type: Atlas (Cloud)

🔄 Starting MongoDB connection (non-blocking)...
🔍 Attempting to connect to MongoDB... (Attempt 1)
   Type: MongoDB Atlas
   Username: krishbavarva
   Host: cluster0.atewaqb.mongodb.net
✅ Connected to MongoDB successfully!
📦 Database: grocery
```

**❌ Error:**
```
❌ MongoDB connection failed: ...
```

### 5.2 Test Health Endpoint

Visit: `https://your-repl-url.repl.co/api/health/db`

**Should return:**
```json
{
  "status": "connected",
  "connected": true,
  "database": "grocery"
}
```

---

## ✅ Step 6: Test Your App

1. Visit your Replit URL: `https://your-repl-name.your-username.repl.co`
2. Try to:
   - Register a new user
   - Login
   - Browse products
   - Add to cart
   - Place an order

If these work, **MongoDB is connected!** 🎉

---

## 🔧 Troubleshooting

### Issue 1: "MONGODB_URI is not set"
**Fix:**
1. Go to Replit → Secrets
2. Add `MONGODB_URI` with your connection string
3. **NO SPACES** around `=`
4. Restart server

### Issue 2: "MongoServerSelectionError: connection timeout"
**Fix:**
1. MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0`
3. Wait 2 minutes
4. Restart server

### Issue 3: "MongoServerError: bad auth"
**Fix:**
1. Check username/password in connection string
2. Verify database user exists in MongoDB Atlas
3. URL encode special characters in password

### Issue 4: "MongoNetworkError: failed to connect"
**Fix:**
1. Check MongoDB Atlas cluster is **running** (not paused)
2. Verify connection string format
3. Check internet connection

### Issue 5: App works locally but not on Replit
**Fix:**
1. Environment variables in Replit Secrets (not `.env` file)
2. Make sure `MONGODB_URI` is set in Secrets
3. Restart server after adding secrets

---

## 📋 Your Specific Setup

Based on your credentials:

**Replit Secrets:**
```
MONGODB_URI=mongodb+srv://krishbavarva:o8RVjnUOeMUUEd68@cluster0.atewaqb.mongodb.net/grocery?retryWrites=true&w=majority
JWT_SECRET=your-jwt-secret-key-here
STRIPE_SECRET_KEY=sk_test_51SqroIQ1lh1OBKoTJMLoFJeboXil1ygqkLon2B7b1X15lpnuEU0IqcVrZ6YUC9dxNEB7e2KTE1mdqkboG3wsrB4H00MDdkZuGY
```

**MongoDB Atlas Network Access:**
- IP Address: `0.0.0.0/0` (Allow from anywhere)

---

## 🎯 Quick Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network Access: `0.0.0.0/0` added
- [ ] Connection string copied
- [ ] `MONGODB_URI` added to Replit Secrets (no spaces!)
- [ ] `JWT_SECRET` added to Replit Secrets
- [ ] `STRIPE_SECRET_KEY` added to Replit Secrets
- [ ] Server restarted
- [ ] Console shows: `✅ Connected to MongoDB successfully!`
- [ ] Health endpoint returns: `{"status": "connected"}`

---

## 💡 Pro Tips

1. **Free Tier Limitation**: Replit apps sleep after inactivity. First request may be slow (waking up).

2. **Connection String Format**: Always use `mongodb+srv://` for Atlas, not `mongodb://`

3. **Database Name**: Make sure database name (`grocery`) matches in connection string

4. **Password Special Characters**: If password has special chars, URL encode them:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`

5. **Test Locally First**: Test MongoDB connection locally before deploying to Replit

---

**After following these steps, your MongoDB should connect successfully!** 🚀

If you still have issues, check the console logs for specific error messages and refer to the troubleshooting section.

