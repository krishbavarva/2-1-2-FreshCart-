# Troubleshooting Admin Dashboard "Failed to load statistics" Error

## Common Causes and Solutions

### 1. No Products in Database

**Problem:** The database doesn't have any products yet.

**Solution:** Run the product sync script to populate the database:

```bash
# Without Docker
cd backend
npm run sync-products

# With Docker
docker compose exec backend npm run sync-products
```

### 2. Database Not Connected

**Problem:** MongoDB is not running or not connected.

**Solution:**

**Check if MongoDB is running:**
```bash
# With Docker
docker compose ps

# Check MongoDB logs
docker compose logs mongodb
```

**If MongoDB is not running:**
```bash
docker compose up -d mongodb
```

**Check database connection:**
- Visit: http://localhost:5000/api/health/db
- Should show connection status

### 3. Authentication Issue

**Problem:** Your admin token might be expired or invalid.

**Solution:**
1. Logout and login again
2. Make sure you're logged in as an admin user
3. Check browser console for authentication errors

### 4. Backend Server Not Running

**Problem:** Backend API is not accessible.

**Solution:**
```bash
# Check if backend is running
docker compose ps

# Check backend logs
docker compose logs backend

# Restart backend
docker compose restart backend
```

### 5. CORS or Network Issues

**Problem:** Frontend can't reach the backend API.

**Solution:**
- Check browser console for network errors
- Verify backend is running on http://localhost:5000
- Check if API URL in `adminService.js` is correct

## Debugging Steps

### Step 1: Check Browser Console
Open browser DevTools (F12) and check:
- Network tab: Look for failed requests to `/api/admin/statistics`
- Console tab: Look for error messages

### Step 2: Check Backend Logs
```bash
docker compose logs backend
```

Look for errors related to:
- Database connection
- Product queries
- Authentication

### Step 3: Test API Directly
Use Postman or curl to test the endpoint:

```bash
# Get your token first (login and copy token)
curl -X GET http://localhost:5000/api/admin/statistics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 4: Verify Database Has Products
```bash
# Connect to MongoDB
docker compose exec mongodb mongosh

# In MongoDB shell:
use grocery
db.products.countDocuments()
```

If count is 0, run the sync script.

## Quick Fix Checklist

- [ ] MongoDB is running
- [ ] Backend server is running
- [ ] You're logged in as admin
- [ ] Database has products (run sync script)
- [ ] No CORS errors in browser console
- [ ] API endpoint is accessible

## Still Having Issues?

1. **Check the detailed error message** - The updated code now shows more specific error messages
2. **Check browser console** - Look for the actual error response
3. **Check backend logs** - Look for server-side errors
4. **Verify environment variables** - Make sure MONGODB_URI is set correctly

## Expected Behavior

After fixing the issue, the Admin Dashboard should show:
- Total Products count
- In Stock count
- Low Stock count (< 30)
- Out of Stock count
- Total Stock Value
- Lists of low stock and out of stock products

