# Azure Deployment - Step by Step Guide

## 🎯 Quick Start: Deploy to Azure (Easiest Method)

Azure App Service is the **easiest and best** option for your project. It's free to start and handles everything automatically.

## 📋 Prerequisites

1. **Azure Account** (Free tier available):
   - Sign up: https://azure.microsoft.com/free/
   - Get $200 free credit + 12 months free services

2. **Your Project** (already on GitLab ✅)

## 🚀 Method 1: Azure App Service (Recommended)

### Step 1: Create Azure App Service for Backend

1. **Go to Azure Portal**: https://portal.azure.com
2. Click **"+ Create a resource"** (top left)
3. Search for **"Web App"**
4. Click **"Create"**

### Step 2: Configure Backend App Service

Fill in the form:

**Basics Tab:**
- **Subscription**: Choose your subscription
- **Resource Group**: 
  - Click "Create new"
  - Name: `grocery-store-rg`
- **Name**: `grocery-store-backend-UNIQUE` 
  - ⚠️ Must be globally unique (add random numbers)
  - Example: `grocery-store-backend-12345`
- **Publish**: Code
- **Runtime stack**: **Node 18 LTS**
- **Operating System**: **Linux**
- **Region**: **West Europe** (closest to France) or your preference

**App Service Plan:**
- Click "Create new"
- **Name**: `grocery-store-plan`
- **Region**: Same as above
- **Pricing tier**: 
  - **Free F1** (for testing - FREE forever)
  - OR **Basic B1** (~$13/month - for production)
- Click **"OK"**

Click **"Review + create"** → **"Create"**

Wait 2-3 minutes for deployment.

### Step 3: Configure Environment Variables

1. Go to your App Service (search in top bar)
2. Click **"Configuration"** in left menu
3. Click **"Application settings"** tab
4. Click **"+ New application setting"** for each:

```
Name: MONGODB_URI
Value: mongodb+srv://krishbavarva:o8RVjnUOeMUUEd68@cluster0.atewaqb.mongodb.net/grocery?retryWrites=true&w=majority

Name: JWT_SECRET
Value: your-jwt-secret-key-here

Name: STRIPE_SECRET_KEY
Value: sk_test_51SqroIQ1lh1OBKoTJMLoFJeboXil1ygqkLon2B7b1X15lpnuEU0IqcVrZ6YUC9dxNEB7e2KTE1mdqkboG3wsrB4H00MDdkZuGY

Name: NODE_ENV
Value: production

Name: PORT
Value: 8080
```

5. Click **"Save"** (top)
6. Click **"Continue"** when prompted

### Step 4: Deploy Backend from GitLab

1. In your App Service, click **"Deployment Center"** (left menu)
2. **Source**: Choose **"External Git"** or **"GitLab"**
3. If GitLab:
   - **Repository URL**: `https://gitlab.com/krish.bavarva114999/grocery_trinity_web_dev.git`
   - **Branch**: `main`
   - **Authorization**: Create GitLab Personal Access Token
     - Go to GitLab → Settings → Access Tokens
     - Create token with `read_repository` scope
     - Use token as password
4. **Build provider**: **"App Service build service"**
5. **Organization settings**: Leave default
6. Click **"Save"**

Azure will automatically:
- Clone your repository
- Install dependencies
- Build your backend
- Deploy it

**Your backend URL will be**: `https://grocery-store-backend-12345.azurewebsites.net`

### Step 5: Deploy Frontend to Azure Static Web Apps

1. Azure Portal → **"+ Create a resource"**
2. Search **"Static Web App"**
3. Click **"Create"**

**Configure:**
- **Resource Group**: Same (`grocery-store-rg`)
- **Name**: `grocery-store-frontend-UNIQUE`
- **Plan type**: **Free**
- **Region**: Same as backend
- **Source**: **GitLab**
- **GitLab organization**: Your username
- **Project**: `grocery_trinity_web_dev`
- **Branch**: `main`
- **Build Presets**: **Custom**
- **App location**: `/frontend`
- **Api location**: (leave empty)
- **Output location**: `dist`

Click **"Review + create"** → **"Create"**

**Your frontend URL will be**: `https://grocery-store-frontend-12345.azurestaticapps.net`

### Step 6: Update Frontend API URL

After frontend is deployed:

1. Go to Static Web App → **"Configuration"**
2. Click **"Application settings"**
3. Add:
   ```
   VITE_API_URL = https://grocery-store-backend-12345.azurewebsites.net/api
   VITE_STRIPE_PUBLISHABLE_KEY = pk_test_51SqroIQ1lh1OBKoTbmb4kahUMkxkjF3VaDgn3WOGtfOZkOBh1czCvFWCzsAGuheIl2tOKSYRuKAxGMZgWfHjmjZ00ccDi25XB
   ```
4. **Rebuild** your frontend (push a new commit or trigger manually)

## 🖥️ Method 2: Local Server Deployment

### Option A: Simple Local Deployment

```bash
# 1. Install dependencies
cd backend
npm install --production

cd ../frontend
npm install
npm run build

# 2. Start backend
cd ../backend
npm start
# Backend runs on http://localhost:5000

# 3. Serve frontend (in new terminal)
cd frontend
npx serve -s dist -l 3000
# Frontend runs on http://localhost:3000
```

### Option B: Production Local Server (PM2)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start app.js --name grocery-backend

# Serve frontend
cd ../frontend
npm run build
pm2 serve dist 3000 --name grocery-frontend --spa

# Save PM2 config
pm2 save
pm2 startup  # Follow instructions
```

### Option C: Using Docker (if you have Docker)

```bash
# Build and run
docker-compose up -d

# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

## 🔄 Method 3: Update GitLab CI/CD for Auto-Deployment

I've added Azure deployment jobs to your `.gitlab-ci.yml`. To use them:

1. **Add Azure Variables** in GitLab:
   - Settings → CI/CD → Variables
   - Add: `AZURE_WEBAPP_NAME` = your-app-service-name

2. **Manual Deployment**:
   - Go to CI/CD → Pipelines
   - Click on pipeline
   - Click **"Play"** button on `deploy:azure:backend` or `deploy:azure:frontend`

## ✅ Verification

After deployment, test:

1. **Backend Health Check**:
   ```
   https://your-backend.azurewebsites.net/api/health
   ```

2. **Frontend**:
   ```
   https://your-frontend.azurestaticapps.net
   ```

3. **Test Features**:
   - Login/Register
   - Browse products
   - Add to cart
   - Checkout flow

## 💰 Azure Costs

### Free Tier (F1):
- ✅ **$0/month** - Free forever
- ✅ 1 GB storage
- ✅ 1 GB data transfer/month
- ⚠️ Limited CPU (shared)
- ⚠️ No custom domain SSL

### Basic Tier (B1):
- 💰 **~$13/month**
- ✅ Custom domain
- ✅ SSL certificate
- ✅ Better performance
- ✅ 10 GB storage

## 🎯 Recommendation

**For You (Best & Easy)**:
1. ✅ **Azure App Service** (Free tier) - Deploy backend
2. ✅ **Azure Static Web Apps** (Free) - Deploy frontend
3. ✅ **Total Cost**: $0/month (free tier)

**Why Azure?**
- ✅ Easiest setup (15 minutes)
- ✅ Free tier available
- ✅ Auto HTTPS
- ✅ Auto-scaling
- ✅ Built-in monitoring
- ✅ GitLab integration

## 📞 Need Help?

If deployment fails:
1. Check Azure Portal → App Service → **Log stream** (see real-time logs)
2. Check **Deployment Center** → **Logs** (see deployment logs)
3. Verify environment variables are set correctly
4. Check MongoDB connection string

---

**Next Step**: Follow Method 1 (Azure App Service) - it's the easiest! 🚀

