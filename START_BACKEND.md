# How to Start the Backend Server

## Issue
The 404 errors you're seeing are because the backend server is not running or not accessible.

## Solution

### Step 1: Start the Backend Server

Open a terminal and run:
```bash
cd backend
npm start
```

You should see output like:
```
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
```

### Step 2: Verify MongoDB is Running

If you're using Docker:
```bash
docker compose ps
```

If MongoDB is not running:
```bash
docker compose up -d mongodb
```

If you're using local MongoDB, make sure the MongoDB service is running.

### Step 3: Check Backend Logs

Look for:
- ✅ MongoDB connection successful
- ✅ Routes registered
- Any error messages

### Step 4: Test the API

Open your browser and go to:
```
http://localhost:5000/health
```

You should see a JSON response with server status.

### Step 5: Refresh Frontend

After the backend is running, refresh your frontend page (http://localhost:5173/admin).

The 404 errors should be resolved.

## Common Issues

### Issue: "Port 5000 already in use"
**Solution:** Kill the process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /F /PID <PID>

# Then restart
cd backend
npm start
```

### Issue: "MongoDB connection failed"
**Solution:** 
1. Make sure MongoDB is running
2. Check your `.env` file has the correct `MONGODB_URI`
3. If using Docker, make sure the MongoDB container is running

### Issue: Routes still returning 404
**Solution:**
1. Check backend console for route registration messages
2. Verify the backend is actually running on port 5000
3. Check browser DevTools Network tab for actual HTTP status codes
4. Verify your authentication token is valid

## Quick Check Commands

```bash
# Check if backend is running
netstat -ano | findstr :5000

# Check if MongoDB is running (Docker)
docker compose ps

# View backend logs
# (Look at the terminal where you ran npm start)
```

