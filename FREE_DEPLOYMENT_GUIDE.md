# Free Deployment Guide - Best Free Services

This guide covers **100% FREE** deployment options for your grocery store application.

## 🆓 Best Free Deployment Services

| Service | Backend | Frontend | Free Tier | Best For |
|---------|---------|----------|-----------|----------|
| **Render** | ✅ Yes | ✅ Yes | ✅ Free forever | **Best overall** |
| **Railway** | ✅ Yes | ✅ Yes | ✅ $5 credit/month | **Easiest setup** |
| **Vercel** | ✅ Yes | ✅ Yes | ✅ Free forever | **Best for React** |
| **Netlify** | ✅ Yes | ✅ Yes | ✅ Free forever | **Great for frontend** |
| **Fly.io** | ✅ Yes | ✅ Yes | ✅ Free tier | **Good performance** |
| **Cyclic** | ✅ Yes | ❌ No | ✅ Free forever | **Backend only** |

## 🏆 Recommendation: Render (Best Free Option)

**Why Render?**
- ✅ **100% FREE** - No credit card required
- ✅ **Backend + Frontend** - Deploy both
- ✅ **Auto HTTPS** - SSL included
- ✅ **Auto-deploy from GitLab** - Connect your repo
- ✅ **Free PostgreSQL** (if needed later)
- ✅ **Easy setup** - 5 minutes

### Render Free Tier:
- ✅ **750 hours/month** (enough for 24/7)
- ✅ **100 GB bandwidth/month**
- ✅ **Free SSL**
- ✅ **Auto-deploy from Git**

## 🚀 Method 1: Render Deployment (Recommended)

### Step 1: Create Render Account

1. Go to: https://render.com
2. Click **"Get Started for Free"**
3. Sign up with **GitLab** (easiest - connects automatically)
   - OR sign up with email

### Step 2: Deploy Backend

1. **Dashboard** → Click **"+ New"** → **"Web Service"**
2. **Connect Repository**:
   - Choose **"GitLab"**
   - Authorize Render
   - Select: `grocery_trinity_web_dev`
3. **Configure**:
   - **Name**: `grocery-store-backend`
   - **Region**: Choose closest (e.g., Frankfurt for Europe)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Environment Variables**:
   - Click **"Advanced"** → **"Add Environment Variable"**
   - Add each:
     ```
     MONGODB_URI = mongodb+srv://krishbavarva:o8RVjnUOeMUUEd68@cluster0.atewaqb.mongodb.net/grocery?retryWrites=true&w=majority
     JWT_SECRET = your-jwt-secret-key
     STRIPE_SECRET_KEY = sk_test_51SqroIQ1lh1OBKoTJMLoFJeboXil1ygqkLon2B7b1X15lpnuEU0IqcVrZ6YUC9dxNEB7e2KTE1mdqkboG3wsrB4H00MDdkZuGY
     NODE_ENV = production
     PORT = 10000
     ```
5. Click **"Create Web Service"**

**Your backend URL**: `https://grocery-store-backend.onrender.com`

⚠️ **Note**: Free tier services "spin down" after 15 minutes of inactivity. First request takes ~30 seconds to wake up.

### Step 3: Deploy Frontend

1. **Dashboard** → Click **"+ New"** → **"Static Site"**
2. **Connect Repository**:
   - Choose **"GitLab"**
   - Select: `grocery_trinity_web_dev`
3. **Configure**:
   - **Name**: `grocery-store-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Environment Variables**:
   - Click **"Advanced"** → **"Add Environment Variable"**
   - Add:
     ```
     VITE_API_URL = https://grocery-store-backend.onrender.com/api
     VITE_STRIPE_PUBLISHABLE_KEY = pk_test_51SqroIQ1lh1OBKoTbmb4kahUMkxkjF3VaDgn3WOGtfOZkOBh1czCvFWCzsAGuheIl2tOKSYRuKAxGMZgWfHjmjZ00ccDi25XB
     ```
5. Click **"Create Static Site"**

**Your frontend URL**: `https://grocery-store-frontend.onrender.com`

### Step 4: Update CORS in Backend

After deployment, update backend CORS to allow your frontend domain:

1. Go to Render → Your backend service → **"Environment"**
2. Add:
   ```
   CLIENT_URL = https://grocery-store-frontend.onrender.com
   ```
3. Update `backend/app.js` CORS settings (if needed)

## 🚂 Method 2: Railway (Easiest - $5 Free Credit/Month)

### Why Railway?
- ✅ **$5 free credit/month** (enough for small apps)
- ✅ **Super easy** - Deploy in 2 clicks
- ✅ **Auto-detects** your stack
- ✅ **Free PostgreSQL** included

### Step 1: Deploy to Railway

1. Go to: https://railway.app
2. Sign up with **GitLab**
3. Click **"+ New Project"** → **"Deploy from Git repo"**
4. Select: `grocery_trinity_web_dev`

### Step 2: Configure Backend

1. Railway auto-detects your backend
2. Click on backend service
3. **Settings** → **"Variables"** → Add environment variables:
   ```
   MONGODB_URI = your_mongodb_uri
   JWT_SECRET = your_jwt_secret
   STRIPE_SECRET_KEY = your_stripe_key
   NODE_ENV = production
   ```
4. Railway auto-deploys!

### Step 3: Deploy Frontend

1. **"+ New"** → **"GitHub Repo"** (or add another service)
2. Select same repo
3. Set **Root Directory**: `frontend`
4. Railway auto-detects it's a Vite app
5. Add environment variables
6. Deploy!

**Railway URLs**: Auto-generated (e.g., `backend-production.up.railway.app`)

## ⚡ Method 3: Vercel (Best for Frontend)

### Deploy Frontend to Vercel

1. Go to: https://vercel.com
2. Sign up with **GitLab**
3. **"Add New Project"**
4. Import: `grocery_trinity_web_dev`
5. **Configure**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **Environment Variables**:
   ```
   VITE_API_URL = your_backend_url
   VITE_STRIPE_PUBLISHABLE_KEY = your_key
   ```
7. Click **"Deploy"**

**Vercel URL**: `https://grocery-store-frontend.vercel.app`

### Deploy Backend to Vercel (Serverless)

Vercel supports Node.js serverless functions. You can deploy your Express backend as serverless.

## 🌐 Method 4: Netlify (Great for Frontend)

### Deploy Frontend to Netlify

1. Go to: https://www.netlify.com
2. Sign up with **GitLab**
3. **"Add new site"** → **"Import an existing project"**
4. Choose **GitLab** → Select your repo
5. **Build settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
6. **Environment variables**:
   ```
   VITE_API_URL = your_backend_url
   VITE_STRIPE_PUBLISHABLE_KEY = your_key
   ```
7. Click **"Deploy site"**

**Netlify URL**: `https://grocery-store-frontend.netlify.app`

### Deploy Backend to Netlify Functions

Netlify supports serverless functions. You can convert your Express app to Netlify functions.

## 🪰 Method 5: Fly.io (Good Performance)

### Deploy to Fly.io

1. Go to: https://fly.io
2. Sign up (free tier available)
3. Install Fly CLI:
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```
4. Login:
   ```bash
   fly auth login
   ```
5. Deploy backend:
   ```bash
   cd backend
   fly launch
   ```
6. Follow prompts (auto-detects Node.js)

**Fly.io URL**: `https://grocery-store-backend.fly.dev`

## 📋 Quick Comparison

### Render (Recommended)
- ✅ **Free forever**
- ✅ Easy setup
- ✅ Backend + Frontend
- ⚠️ Spins down after 15 min (first request slow)

### Railway
- ✅ **$5 free credit/month**
- ✅ Easiest setup
- ✅ Auto-detects everything
- ⚠️ Need credit card (but free tier)

### Vercel
- ✅ **Free forever**
- ✅ Best for React/Vite
- ✅ Fast CDN
- ⚠️ Backend needs serverless conversion

### Netlify
- ✅ **Free forever**
- ✅ Great for frontend
- ✅ Easy GitLab integration
- ⚠️ Backend needs functions conversion

## 🎯 My Recommendation for You

**Use Render** - It's the best free option:
1. ✅ 100% free (no credit card)
2. ✅ Supports both backend and frontend
3. ✅ Easy GitLab integration
4. ✅ Auto HTTPS
5. ✅ Simple setup

## 🚀 Quick Start: Render (5 Minutes)

1. **Sign up**: https://render.com (with GitLab)
2. **Deploy Backend**:
   - New → Web Service
   - Connect GitLab repo
   - Root: `backend`
   - Start: `npm start`
   - Add environment variables
3. **Deploy Frontend**:
   - New → Static Site
   - Connect GitLab repo
   - Root: `frontend`
   - Build: `npm run build`
   - Publish: `dist`
   - Add environment variables

**Done!** Your app is live in 5 minutes! 🎉

## 🔧 Update GitLab CI/CD for Render

I'll update your `.gitlab-ci.yml` to include Render deployment.

## 📝 Notes

- **Free tier limitations**: Services may spin down after inactivity
- **First request**: May take 30 seconds (waking up)
- **Bandwidth**: Usually 100GB/month (enough for testing)
- **Custom domains**: Available on free tier (some services)

---

**Start with Render** - It's the easiest and completely free! 🚀

