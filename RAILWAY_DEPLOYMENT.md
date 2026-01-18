# 🚂 Railway Deployment Guide

## Why Railway Needs dotenv in dependencies

Railway runs your app in a **fresh container**, so:
- If `dotenv` is not listed in `dependencies` in `package.json`, it won't be installed
- `devDependencies` are **NOT installed** in production by default
- Railway uses `NODE_ENV=production` by default
- If you did `npm install dotenv --save-dev`, it won't be available in production → `ERR_MODULE_NOT_FOUND`

## ✅ Step 1: Ensure dotenv is in dependencies

**Root `package.json` must have:**
```json
{
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "mongoose": "^8.4.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "cookie-parser": "^1.4.6",
    "swagger-ui-express": "^5.0.0",
    "swagger-jsdoc": "^6.2.8",
    "jsonwebtoken": "^9.0.3",
    "bcryptjs": "^2.4.3",
    "express-validator": "^7.3.1",
    "stripe": "^20.2.0"
  }
}
```

**Note:** This project uses `bcryptjs` (not `bcrypt`) for password hashing.

**NOT in `devDependencies`!**

If you see it under `devDependencies`, run:
```bash
npm install dotenv --save
```

## ✅ Step 2: Railway Environment Variables

1. Go to **Railway Project** → **Settings** → **Environment Variables**
2. Add these variables:

| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/grocery?retryWrites=true&w=majority` |
| `MONGO_URI` | (Optional, for compatibility) | Same as above |
| `PORT` | Port number (Railway sets this automatically) | `3000` |
| `JWT_SECRET` | Your JWT secret key (REQUIRED) | `your-secret-key-here` |
| `STRIPE_SECRET_KEY` | Your Stripe secret key (if using Stripe) | `sk_test_...` |
| `NODE_ENV` | Environment | `production` |

**⚠️ Important:**
- **NO QUOTES** around the value
- **NO SPACES** around `=` sign
- Railway injects environment variables automatically in production
- Do **NOT** rely on `.env` file in Railway production

## ✅ Step 3: server.js Configuration

The `server.js` file already handles this correctly:

```javascript
// Load environment variables - works for both local dev and Railway
import dotenv from 'dotenv';
dotenv.config(); // Harmless in production, useful for local dev

// Railway automatically injects environment variables into process.env
// dotenv.config() is only needed for local .env file reading
```

## ✅ Step 4: Code Compatibility

### ESM (ES Modules) - ✅ Current Setup
```javascript
import dotenv from 'dotenv';
dotenv.config();
```

### CommonJS (if needed)
```javascript
require('dotenv').config();
```

**Our code uses ESM** (ES Modules) which is correct for Railway.

## ✅ Step 5: Deploy to Railway

1. **Connect your GitHub repository** to Railway
2. **Railway will automatically:**
   - Install dependencies from `package.json`
   - Run `npm start` (which runs `node server.js`)
   - Inject environment variables you set in Railway dashboard

3. **After deployment:**
   - Check Railway logs for: `✅ Connected to MongoDB successfully!`
   - Visit your Railway URL to test the app

## 🔧 Troubleshooting

### Error: `ERR_MODULE_NOT_FOUND: Cannot find module 'dotenv'` or `'jsonwebtoken'` or `'bcryptjs'`

**Fix:**
1. Check `package.json` - all runtime packages must be in `dependencies`, not `devDependencies`
2. Run: `npm install jsonwebtoken bcryptjs cors dotenv express mongoose express-validator stripe --save`
3. Commit and push changes
4. Redeploy on Railway

### Error: `MongoDB connection failed`

**Fix:**
1. Railway → Settings → Environment Variables
2. Add `MONGODB_URI` with your MongoDB Atlas connection string
3. Make sure MongoDB Atlas Network Access allows `0.0.0.0/0`
4. Redeploy

### Error: `PORT is not defined`

**Fix:**
- Railway automatically sets `PORT` environment variable
- Your code uses: `const PORT = process.env.PORT || 3000;` ✅
- This is already correct!

## 📋 Railway vs Replit Differences

| Feature | Replit | Railway |
|---------|--------|---------|
| Environment Variables | Secrets (🔒 icon) | Settings → Environment Variables |
| dotenv | Can be in devDependencies | **MUST be in dependencies** |
| .env file | Works | **NOT used in production** |
| NODE_ENV | Can be development | **Always production** |
| Dependencies | Installs all | **Only installs dependencies** |

## ✅ Quick Checklist

- [ ] `dotenv` is in `dependencies` (not `devDependencies`) in root `package.json`
- [ ] `MONGODB_URI` is set in Railway Environment Variables
- [ ] `JWT_SECRET` is set in Railway Environment Variables
- [ ] `STRIPE_SECRET_KEY` is set in Railway Environment Variables (if using Stripe)
- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0`
- [ ] Code uses ESM (`import`) not CommonJS (`require`)
- [ ] `server.js` has `dotenv.config()` at the top
- [ ] Committed and pushed to GitHub
- [ ] Railway is connected to GitHub repository
- [ ] Redeployed on Railway

## 🎯 TL;DR Railway Fix

1. **`npm install dotenv --save`** → ensures dotenv is in dependencies
2. **Use Railway Environment Variables** for `MONGODB_URI` instead of `.env`
3. **Redeploy app**

---

**After these steps, your app should work on Railway!** 🚂

