# Fixing 404 Errors on Admin Dashboard

## Issue
When accessing the admin dashboard, the console shows 404 errors for:
- `/api/employee/statistics`
- `/api/manager/statistics`
- `/api/manager/orders`
- `/api/manager/products?limit=10`
- `/api/employee/orders`
- `/api/admin/statistics`

## Root Cause
The backend server is running, but the routes are returning 404. This could be due to:
1. Backend server not properly started
2. Routes not being registered correctly
3. Middleware blocking requests
4. Database connection issues

## Solution Steps

### 1. Verify Backend Server is Running
```bash
# Check if backend is running on port 5000
netstat -ano | findstr :5000

# If not running, start it:
cd backend
npm start
```

### 2. Verify MongoDB is Running
```bash
# Check if MongoDB is running
# If using Docker:
docker compose ps

# If using local MongoDB:
# Make sure MongoDB service is running
```

### 3. Check Backend Logs
Look for:
- Route registration messages
- MongoDB connection status
- Any error messages

### 4. Test API Endpoints
Test the endpoints directly:
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test admin statistics (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/admin/statistics
```

### 5. Verify Route Registration
Check `backend/app.js` to ensure all routes are registered:
- `/api/admin` - Admin routes
- `/api/employee` - Employee routes
- `/api/manager` - Manager routes

### 6. Check Middleware
Verify that:
- `authenticate` middleware is working
- Role-based middleware (`isAdmin`, `isEmployee`, `isManager`) is working
- Database connection is established

## Quick Fix
1. Stop the backend server
2. Restart the backend server:
   ```bash
   cd backend
   npm start
   ```
3. Verify routes are registered in console output
4. Check MongoDB connection status
5. Refresh the frontend page

## Expected Console Output (Backend)
When the backend starts, you should see:
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
```

## If Issues Persist
1. Check backend logs for specific error messages
2. Verify MongoDB connection
3. Check if user is properly authenticated
4. Verify user role in database
5. Check network tab in browser DevTools for actual HTTP status codes

