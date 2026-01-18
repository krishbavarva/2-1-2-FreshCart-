# ⚡ Quick Replit Setup (5 Minutes)

## 🚀 Fast Setup Steps

### 1. Import to Replit
- Go to [replit.com](https://replit.com)
- Click **"Create Repl"** → **"Import from GitHub"**
- URL: `https://github.com/krishbavarva/2-1-2-FreshCart-`
- Click **"Import"**

### 2. Add Secrets (🔒 Icon)
Add these in Replit Secrets:

```
MONGODB_URI = mongodb+srv://krishbavarva:o8RVjnUOeMUUEd68@cluster0.atewaqb.mongodb.net/grocery?retryWrites=true&w=majority
PORT = 3000
JWT_SECRET = your-secret-key-here
STRIPE_SECRET_KEY = sk_test_51SqroIQ1lh1OBKoTJMLoFJeboXil1ygqkLon2B7b1X15lpnuEU0IqcVrZ6YUC9dxNEB7e2KTE1mdqkboG3wsrB4H00MDdkZuGY
CLIENT_URL = https://your-repl-name.username.repl.co
NODE_ENV = production
```

### 3. Install & Build
Run in Replit Shell:

```bash
npm install
cd frontend && npm install && npm run build && cd ..
```

### 4. Run
Click **▶️ Run** button

### 5. Update MongoDB Atlas
- Go to MongoDB Atlas → Network Access
- Add IP: `0.0.0.0/0` (allow all)

### 6. Update Frontend API URL
After first run, get your Replit URL and update:
- Go to Secrets
- Update `CLIENT_URL` with your actual Replit URL
- Rebuild: `cd frontend && npm run build && cd ..`

## ✅ Done!

Your app is live at: `https://your-repl-name.username.repl.co`

---

## 🔧 If Something Breaks

```bash
# Clean install
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install && cd ..

# Rebuild
cd frontend && npm run build && cd ..

# Restart
# Click Run button again
```

---

**Full guide:** See `REPLIT_DEPLOYMENT.md` for detailed instructions.

