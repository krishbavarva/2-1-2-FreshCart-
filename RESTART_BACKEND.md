# ⚠️ IMPORTANT: Restart Backend Server

## Problem
The cart and orders routes are returning 404 errors because the backend server hasn't been restarted with the new routes.

## Solution: Restart the Backend Server

### Step 1: Find and Stop the Backend Server

**Option A: If running in a terminal window**
- Go to the terminal where `npm run dev` is running
- Press `Ctrl + C` to stop it

**Option B: Kill the process**
```powershell
# Find the backend process (usually the one running on port 5000)
Get-Process -Name node | Where-Object { $_.StartTime -lt (Get-Date).AddMinutes(-5) }

# Kill all node processes (be careful - this kills ALL node processes)
# Or kill specific process by ID:
Stop-Process -Id <ProcessId> -Force
```

### Step 2: Restart the Server

```powershell
cd backend
npm run dev
```

### Step 3: Verify Routes Are Loaded

After restarting, you should see this in the console:
```
✅ Routes registered:
   - /api/auth (authentication)
   - /api/products (products with Open Food Facts)
   - /api/cart (shopping cart)
   - /api/orders (order management)
```

### Step 4: Test the Routes

Run this command to verify:
```powershell
cd backend
node check-routes.js
```

You should see:
```
✅ GET /api/cart - Found
✅ GET /api/orders - Found
```

## Why This Happened

The backend code was updated with new cart and order routes, but the running server process still has the old code loaded. Node.js needs to reload the modules to pick up the new routes.

## Quick Check Script

I've created `backend/check-routes.js` - run it anytime to verify all routes are accessible:
```powershell
cd backend
node check-routes.js
```

## After Restart

Once the server is restarted:
- ✅ Cart will load successfully
- ✅ You can add items to cart
- ✅ Order history will work
- ✅ All 404 errors will be resolved



