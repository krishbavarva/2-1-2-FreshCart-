# ⚡ Railway Quick Fix - All Dependencies

## ✅ Step 1: Install All Backend Runtime Dependencies

In your project root (where `package.json` is):

```bash
npm install axios bcryptjs cors dotenv express express-validator jsonwebtoken mongoose stripe --save
```

This ensures all runtime packages are in `dependencies` (not `devDependencies`).

## ✅ Step 2: Verify package.json

Your `dependencies` section should look like this:

```json
{
  "dependencies": {
    "axios": "^1.13.2",
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-validator": "^7.3.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^8.4.1",
    "stripe": "^20.2.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0"
  }
}
```

**Important:**
- ✅ All packages in `dependencies` (not `devDependencies`)
- ✅ Uses `bcryptjs` (not `bcrypt`)
- ✅ Uses ESM (`"type": "module"`)

## ✅ Step 3: Import Syntax (ESM)

Since `package.json` has `"type": "module"`, use ESM imports:

```javascript
import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';  // Note: bcryptjs, not bcrypt
import dotenv from 'dotenv';
dotenv.config();
```

**NOT CommonJS:**
```javascript
// ❌ Don't use this (CommonJS)
const axios = require('axios');
```

## ✅ Step 4: Railway Environment Variables

Go to **Railway → Project → Settings → Environment Variables**:

| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/grocery?retryWrites=true&w=majority` |
| `JWT_SECRET` | JWT secret key (REQUIRED) | `your-secret-key-here` |
| `STRIPE_SECRET_KEY` | Stripe secret key (if using) | `sk_test_...` |
| `PORT` | Port (Railway sets automatically) | `3000` |

**⚠️ Important:**
- NO QUOTES around values
- NO SPACES around `=` sign
- Railway injects these automatically (no `.env` file needed)

## ✅ Step 5: Commit and Redeploy

```bash
git add .
git commit -m "fix: add all backend runtime dependencies for Railway"
git push
```

Railway will automatically:
1. Install all packages from `dependencies`
2. Run `npm start` (which runs `node server.js`)
3. Inject environment variables

## 🔧 Optional: Railway Shell One-Line Fix

If you need to fix dependencies directly in Railway shell:

```bash
npm install axios bcryptjs cors dotenv express express-validator jsonwebtoken mongoose stripe --save && rm -rf node_modules package-lock.json && npm install
```

Then redeploy your Railway project.

## ✅ Verification Checklist

- [ ] All packages in `dependencies` (not `devDependencies`)
- [ ] `axios` is included
- [ ] `bcryptjs` is included (not `bcrypt`)
- [ ] `jsonwebtoken` is included
- [ ] `MONGODB_URI` set in Railway Environment Variables
- [ ] `JWT_SECRET` set in Railway Environment Variables
- [ ] Code uses ESM imports (`import`, not `require`)
- [ ] Committed and pushed to GitHub
- [ ] Railway redeployed

## 🎯 Summary

**All Required Runtime Dependencies:**
- `axios` - HTTP client for API calls
- `bcryptjs` - Password hashing
- `cors` - CORS middleware
- `dotenv` - Environment variables (for local dev)
- `express` - Web framework
- `express-validator` - Request validation
- `jsonwebtoken` - JWT authentication
- `mongoose` - MongoDB ODM
- `stripe` - Payment processing
- Plus: `cookie-parser`, `helmet`, `swagger-ui-express`, `swagger-jsdoc`

**After these steps, your Railway app should start without `ERR_MODULE_NOT_FOUND` errors!** 🚂

