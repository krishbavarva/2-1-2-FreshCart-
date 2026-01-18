# 🚀 Replit Deployment Guide

This guide will help you deploy your FreshCart application on Replit.

## 📋 Prerequisites

1. **Replit Account** - Sign up at [replit.com](https://replit.com)
2. **MongoDB Atlas Account** - Free tier works fine
3. **Stripe Account** (optional, for payments)

---

## 🔧 Step 1: Import Project to Replit

### Option A: Import from GitHub/GitLab
1. Go to [Replit](https://replit.com)
2. Click **"Create Repl"**
3. Select **"Import from GitHub"**
4. Enter your repository URL:
   - GitHub: `https://github.com/krishbavarva/2-1-2-FreshCart-`
   - GitLab: `https://gitlab.com/krish.bavarva114999/grocery_trinity_web_dev`
5. Click **"Import"**

### Option B: Upload Files
1. Create a new **Node.js** repl
2. Upload all project files
3. Make sure the structure is:
   ```
   your-repl/
   ├── backend/
   ├── frontend/
   ├── server.js
   ├── .replit
   └── package.json (root)
   ```

---

## 🔑 Step 2: Configure Environment Variables (Secrets)

1. In Replit, click the **🔒 Secrets** icon (lock icon) in the left sidebar
2. Add these environment variables:

```
MONGODB_URI = mongodb+srv://krishbavarva:o8RVjnUOeMUUEd68@cluster0.atewaqb.mongodb.net/grocery?retryWrites=true&w=majority
PORT = 3000
JWT_SECRET = your-jwt-secret-key-here
STRIPE_SECRET_KEY = sk_test_51SqroIQ1lh1OBKoTJMLoFJeboXil1ygqkLon2B7b1X15lpnuEU0IqcVrZ6YUC9dxNEB7e2KTE1mdqkboG3wsrB4H00MDdkZuGY
CLIENT_URL = https://your-repl-name.username.repl.co
NODE_ENV = production
```

**Important:**
- Replace `your-repl-name.username` with your actual Replit URL
- Use a strong random string for `JWT_SECRET`
- Keep your MongoDB password secure

---

## 📦 Step 3: Install Dependencies

In the Replit shell, run:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Build React app
npm run build

# Go back to root
cd ..
```

---

## 🏗️ Step 4: Project Structure for Replit

Your project should have this structure:

```
your-repl/
├── backend/              # Backend code
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── package.json
├── frontend/             # React app
│   ├── src/
│   ├── dist/            # Built React app (after npm run build)
│   └── package.json
├── server.js            # Main server file (serves both API and React)
├── .replit              # Replit configuration
└── package.json         # Root package.json (optional)
```

---

## ⚙️ Step 5: Update Frontend API URL

Update `frontend/src/services/*.js` files to use the Replit URL:

**Before:**
```javascript
const API_URL = 'http://localhost:5000/api';
```

**After:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://your-repl-name.username.repl.co/api';
```

Or create `frontend/.env`:
```
VITE_API_URL=https://your-repl-name.username.repl.co/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SqroIQ1lh1OBKoTbmb4kahUMkxkjF3VaDgn3WOGtfOZkOBh1czCvFWCzsAGuheIl2tOKSYRuKAxGMZgWfHjmjZ00ccDi25XB
```

---

## 🚀 Step 6: Run the Application

1. Click the **▶️ Run** button in Replit
2. Or run in shell:
   ```bash
   node server.js
   ```

The server will:
- Start on port 3000 (or PORT from secrets)
- Serve API at `/api/*`
- Serve React app at root `/`

---

## ✅ Step 7: Verify Deployment

1. **Check Health:**
   - Visit: `https://your-repl-name.username.repl.co/health`
   - Should return: `{"status":"OK",...}`

2. **Check API:**
   - Visit: `https://your-repl-name.username.repl.co/api-docs`
   - Should show Swagger documentation

3. **Check Frontend:**
   - Visit: `https://your-repl-name.username.repl.co`
   - Should show your React app

---

## 🔧 Step 8: Fix Common Issues

### Issue 1: "React app not found"
**Solution:**
```bash
cd frontend
npm run build
cd ..
```

### Issue 2: "MongoDB connection failed"
**Solution:**
1. Check MongoDB Atlas Network Access
2. Add IP `0.0.0.0/0` (allow all IPs) for Replit
3. Verify `MONGODB_URI` in Secrets

### Issue 3: "CORS errors"
**Solution:**
- Update `CLIENT_URL` in Secrets to your Replit URL
- Or set `CLIENT_URL = *` in Secrets

### Issue 4: "Port already in use"
**Solution:**
- Replit automatically assigns a port
- Use `process.env.PORT` (already configured in `server.js`)

### Issue 5: "Module not found"
**Solution:**
```bash
# Reinstall all dependencies
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install && cd ..
```

---

## 📝 Step 9: Update MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **Network Access**
3. Click **Add IP Address**
4. Add `0.0.0.0/0` (allow all IPs) - **Required for Replit**
5. Click **Confirm**

---

## 🔄 Step 10: Rebuild After Changes

After making code changes:

```bash
# Rebuild React app
cd frontend
npm run build
cd ..

# Restart server (click Run button again)
```

---

## 🎯 Quick Start Commands

```bash
# Full setup (run once)
npm install
cd frontend && npm install && npm run build && cd ..

# Start server
node server.js

# Rebuild frontend only
cd frontend && npm run build && cd ..
```

---

## 📊 Monitoring

- **Logs:** Check Replit console for errors
- **Database:** Monitor MongoDB Atlas dashboard
- **API:** Use `/api-docs` for API testing

---

## 🆘 Troubleshooting

### App sleeps after inactivity
- **Free tier limitation** - Replit free tier apps sleep after 5 minutes
- **Solution:** Upgrade to paid plan or use a keep-alive service

### Build fails
- Check Node.js version (should be 18+)
- Clear cache: `rm -rf node_modules frontend/node_modules`
- Reinstall: `npm install && cd frontend && npm install`

### API returns 404
- Make sure routes are registered in `server.js`
- Check that `backend/routes/*.js` files exist
- Verify API path starts with `/api/`

---

## 🎉 Success!

Your app should now be running at:
- **Frontend:** `https://your-repl-name.username.repl.co`
- **API:** `https://your-repl-name.username.repl.co/api`
- **Docs:** `https://your-repl-name.username.repl.co/api-docs`

---

## 📚 Additional Resources

- [Replit Docs](https://docs.replit.com)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Express.js Docs](https://expressjs.com)

---

**Need Help?** Check the logs in Replit console for detailed error messages.

