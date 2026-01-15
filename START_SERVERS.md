# How to Start Backend and Frontend Separately

## Current Status
- ✅ Frontend is running on port 5173
- ❌ Backend is NOT running on port 5000 (this is why you see 404 errors)

## Step-by-Step Instructions

### Step 1: Start the Backend Server

Open a **new terminal window** and run:

```bash
cd backend
npm start
```

**Expected Output:**
```
📋 Environment Check:
   PORT: 5000 (default)
   CLIENT_URL: http://localhost:5173 (default)
   MONGODB_URI: ✅ Set (Local) or ⚠️ Set (Atlas)

🔍 Attempting to connect to MongoDB... (Attempt 1)
✅ MongoDB connected successfully

✅ Routes registered:
   - /api/auth (Authentication)
   - /api/products (Products)
   - /api/cart (Shopping Cart)
   - /api/orders (Order Management)
   - /api/admin (Admin Panel)
   - /api/customer (Customer Dashboard)
   - /api/employee (Employee Dashboard)
   - /api/manager (Manager Dashboard)

🚀 Server is running on port 5000
📚 API Documentation: http://localhost:5000/api-docs
```

### Step 2: Verify Backend is Running

Open a browser and go to:
```
http://localhost:5000/health
```

You should see a JSON response like:
```json
{
  "status": "OK",
  "message": "Server is running",
  "mongodb": "connected",
  ...
}
```

### Step 3: Check MongoDB Connection

Make sure MongoDB is running:

**If using local MongoDB:**
- Check if MongoDB service is running
- Default connection: `mongodb://localhost:27017/grocery`

**If using MongoDB Atlas:**
- Make sure your connection string is in `backend/.env` as `MONGODB_URI`

### Step 4: Refresh Frontend

After the backend is running, refresh your frontend page:
```
http://localhost:5173/admin
```

The 404 errors should be resolved!

## Troubleshooting

### Issue: "Cannot find module" or "npm start fails"
**Solution:**
```bash
cd backend
npm install
npm start
```

### Issue: "MongoDB connection failed"
**Solution:**
1. Check if MongoDB is running:
   ```bash
   # Windows - Check MongoDB service
   services.msc
   # Look for "MongoDB" service and make sure it's running
   ```

2. Or if using Docker for MongoDB only:
   ```bash
   docker compose up -d mongodb
   ```

3. Check your `backend/.env` file has correct `MONGODB_URI`

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace <PID> with actual process ID)
taskkill /F /PID <PID>

# Then start backend again
cd backend
npm start
```

### Issue: "CORS error" in browser console
**Solution:**
- Make sure `CLIENT_URL` in `backend/.env` is set to `http://localhost:5173`
- Or the backend will use the default: `http://localhost:5173`

## Quick Verification Commands

```bash
# Check if backend is running
netstat -ano | findstr :5000

# Check if frontend is running
netstat -ano | findstr :5173

# Test backend health endpoint
curl http://localhost:5000/health
```

## Running Both Servers

You need **TWO terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Both should be running simultaneously!

