# Deployment Guide - Azure & Local Server

This guide covers deploying your grocery store application to Azure and local servers.

## 🚀 Quick Comparison

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **Azure App Service** | ✅ Easy setup<br>✅ Free tier available<br>✅ Auto-scaling<br>✅ Built-in CI/CD | ⚠️ Costs after free tier | Production & Testing |
| **Azure Static Web Apps** | ✅ Free tier<br>✅ Perfect for React<br>✅ Auto HTTPS | ⚠️ Backend needs separate service | Frontend deployment |
| **Local Server** | ✅ Free<br>✅ Full control<br>✅ No internet needed | ⚠️ Manual setup<br>⚠️ No auto-scaling | Development & Testing |
| **Azure VM** | ✅ Full control<br>✅ Any OS | ⚠️ More expensive<br>⚠️ Manual management | Advanced users |

## 📦 Option 1: Azure App Service (Recommended - Easiest)

### Why Azure App Service?
- ✅ **Free tier** available (F1 - Free)
- ✅ **Easy setup** - Deploy in minutes
- ✅ **Auto HTTPS** - SSL certificate included
- ✅ **Built-in CI/CD** - Connect with GitLab
- ✅ **Auto-scaling** - Handles traffic spikes
- ✅ **Supports Node.js** - Perfect for your backend

### Step-by-Step Azure App Service Deployment

#### Part A: Deploy Backend to Azure App Service

1. **Create Azure Account** (if you don't have one):
   - Go to: https://azure.microsoft.com/free/
   - Sign up (free tier includes $200 credit)

2. **Create App Service**:
   - Go to Azure Portal: https://portal.azure.com
   - Click **"+ Create a resource"**
   - Search for **"Web App"**
   - Click **"Create"**

3. **Configure App Service**:
   - **Subscription**: Choose your subscription
   - **Resource Group**: Create new (e.g., `grocery-store-rg`)
   - **Name**: `grocery-store-backend` (must be unique)
   - **Publish**: Code
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: Choose closest (e.g., West Europe for France)
   - **App Service Plan**: 
     - Click "Create new"
     - Name: `grocery-store-plan`
     - **SKU and size**: **Free F1** (for testing) or **Basic B1** (for production)
   - Click **"Review + create"** → **"Create"**

4. **Configure Environment Variables**:
   - Go to your App Service → **Configuration** → **Application settings**
   - Click **"+ New application setting"** and add:
     ```
     MONGODB_URI = your_mongodb_connection_string
     JWT_SECRET = your_jwt_secret
     STRIPE_SECRET_KEY = your_stripe_secret_key
     NODE_ENV = production
     PORT = 8080 (Azure sets this automatically, but good to have)
     ```
   - Click **"Save"**

5. **Deploy Backend**:
   - Go to **Deployment Center**
   - Choose **"External Git"** or **"GitLab"**
   - Connect your GitLab repository
   - Branch: `main`
   - Build provider: **"App Service build service"**
   - Click **"Save"**
   - Azure will automatically deploy on every push!

#### Part B: Deploy Frontend to Azure Static Web Apps

1. **Create Static Web App**:
   - Azure Portal → **"+ Create a resource"**
   - Search **"Static Web App"**
   - Click **"Create"**

2. **Configure**:
   - **Resource Group**: Same as backend
   - **Name**: `grocery-store-frontend`
   - **Plan type**: Free
   - **Region**: Same as backend
   - **Source**: GitLab
   - **Branch**: `main`
   - **App location**: `/frontend`
   - **Api location**: (leave empty)
   - **Output location**: `dist`
   - Click **"Review + create"** → **"Create"**

3. **Configure Frontend Environment**:
   - After creation, go to **Configuration** → **Application settings**
   - Add:
     ```
     VITE_API_URL = https://grocery-store-backend.azurewebsites.net/api
     VITE_STRIPE_PUBLISHABLE_KEY = your_stripe_publishable_key
     ```

### Azure URLs After Deployment:
- **Backend API**: `https://grocery-store-backend.azurewebsites.net`
- **Frontend**: `https://grocery-store-frontend.azurestaticapps.net`

## 🖥️ Option 2: Local Server Deployment

### Requirements:
- Node.js 18+ installed
- MongoDB (local or Atlas)
- Windows/Linux/Mac server

### Step-by-Step Local Deployment

#### 1. Install Dependencies

```bash
# Backend
cd backend
npm install --production

# Frontend
cd ../frontend
npm install
npm run build
```

#### 2. Configure Environment

**Backend `.env`**:
```env
MONGODB_URI=mongodb://localhost:27017/grocery-store
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/grocery
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
PORT=5000
NODE_ENV=production
```

**Frontend** (build-time):
- Update `frontend/src/services/*.js` to use your server IP
- Or use environment variables in build

#### 3. Start Services

**Backend**:
```bash
cd backend
npm start
# Or use PM2 for production:
npm install -g pm2
pm2 start app.js --name grocery-backend
```

**Frontend** (serve built files):
```bash
cd frontend
# Option 1: Use serve
npm install -g serve
serve -s dist -l 3000

# Option 2: Use nginx (Linux)
# Configure nginx to serve frontend/dist folder
```

#### 4. Use PM2 for Production (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start app.js --name grocery-backend

# Start frontend (if using Node server)
cd ../frontend
pm2 start "serve -s dist -l 3000" --name grocery-frontend

# Save PM2 configuration
pm2 save
pm2 startup  # Follow instructions to auto-start on boot
```

## 🔄 Option 3: Update GitLab CI/CD for Azure Deployment

I'll update your `.gitlab-ci.yml` to include Azure deployment jobs.

## 📋 Deployment Checklist

### Before Deployment:
- [ ] All environment variables configured
- [ ] MongoDB connection string ready
- [ ] Stripe keys configured
- [ ] Frontend API URL updated
- [ ] Tests passing (optional)
- [ ] Build successful

### After Deployment:
- [ ] Backend API accessible
- [ ] Frontend loads correctly
- [ ] API endpoints working
- [ ] Database connected
- [ ] Payment system working (test mode)
- [ ] HTTPS enabled (Azure auto-enables)

## 💰 Azure Pricing

### Free Tier (F1):
- ✅ **Free forever**
- ✅ 1 GB storage
- ✅ 1 GB outbound data transfer
- ⚠️ Limited CPU/memory
- ⚠️ No custom domain SSL

### Basic Tier (B1) - ~$13/month:
- ✅ Custom domain
- ✅ SSL certificate
- ✅ Better performance
- ✅ 10 GB storage

## 🆘 Troubleshooting

### Azure Deployment Issues:
1. **Build fails**: Check build logs in Deployment Center
2. **App not starting**: Check Application Insights logs
3. **Environment variables**: Verify in Configuration → Application settings
4. **Port issues**: Azure uses PORT environment variable (usually 8080)

### Local Deployment Issues:
1. **Port already in use**: Change PORT in .env
2. **MongoDB connection**: Check MongoDB is running
3. **CORS errors**: Update CORS settings in backend

## 📚 Next Steps

1. Choose your deployment option
2. Follow the step-by-step guide
3. Test your deployed application
4. Monitor logs and performance

---

**Recommendation**: Start with **Azure App Service** (Free tier) - it's the easiest and most reliable option!

