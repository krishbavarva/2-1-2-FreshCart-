# MongoDB Setup Guide

## Current Status
❌ MongoDB is not running on your system

## Option 1: Install MongoDB Locally (Recommended for Development)

### Windows Installation:

1. **Download MongoDB Community Server:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows, MSI package
   - Download and install

2. **Install as Windows Service:**
   - During installation, check "Install MongoDB as a Service"
   - This will automatically start MongoDB on system boot

3. **Start MongoDB Service:**
   ```powershell
   net start MongoDB
   ```

4. **Verify it's running:**
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 27017
   ```

## Option 2: Use MongoDB Atlas (Cloud - FREE)

### Quick Setup:

1. **Create Free Account:**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free (no credit card required)

2. **Create a Cluster:**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select a region close to you (e.g., Europe for France)
   - Click "Create"

3. **Set Up Database Access:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
   - Set privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your current IP address
   - Click "Confirm"

5. **Get Connection String:**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/`

6. **Update Your .env File:**
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/grocery?retryWrites=true&w=majority
   ```
   Replace:
   - `your-username` with your database username
   - `your-password` with your database password
   - `cluster0.xxxxx` with your cluster name

## Option 3: Use Docker (If you have Docker installed)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Verify Connection

After setting up MongoDB, restart your backend:

```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB connected successfully
```

## Current Configuration

Your `.env` file is set to:
```
MONGODB_URI=mongodb://localhost:27017/grocery
```

This expects MongoDB to be running locally on port 27017.

## Recommendation

For development in France, I recommend **MongoDB Atlas (Option 2)** because:
- ✅ FREE tier available
- ✅ No installation needed
- ✅ Works from anywhere
- ✅ Automatic backups
- ✅ Easy to set up

Once you have MongoDB running (local or Atlas), your payment system will work perfectly!

