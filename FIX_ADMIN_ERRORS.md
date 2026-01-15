# Fix Admin Dashboard Errors

## Errors You're Seeing:
1. ❌ "User not found"
2. ❌ "Database not connected"
3. ⚠️ "No Products Found"

## Solutions

### Step 1: Fix Database Connection

**Check if MongoDB is running:**

**With Docker:**
```bash
# Check if MongoDB container is running
docker compose ps

# If not running, start it
docker compose up -d mongodb

# Check MongoDB logs
docker compose logs mongodb
```

**Without Docker:**
- Make sure MongoDB service is running on your system
- Check if MongoDB is accessible on `localhost:27017`

**Verify Database Connection:**
Visit: http://localhost:5000/api/health/db

Should show:
```json
{
  "status": "connected",
  "connected": true
}
```

### Step 2: Create Admin User

If you haven't created an admin user yet:

**With Docker:**
```bash
docker compose exec backend npm run create-admin
```

**Without Docker:**
```bash
cd backend
npm run create-admin
```

This creates:
- **Email:** `admin@gmail.com`
- **Password:** `123456`
- **Role:** `admin`

### Step 3: Login as Admin

1. **Logout** from current session (if logged in)
2. **Login** with admin credentials:
   - Email: `admin@gmail.com`
   - Password: `123456`
3. Navigate to Admin Dashboard

### Step 4: Sync Products

After fixing database and authentication, sync products:

**With Docker:**
```bash
docker compose exec backend npm run sync-products
```

**Without Docker:**
```bash
cd backend
npm run sync-products
```

### Step 5: Verify Everything Works

1. ✅ Database is connected (check `/api/health/db`)
2. ✅ Admin user exists and you're logged in
3. ✅ Products are synced to database
4. ✅ Admin Dashboard loads without errors

## Quick Fix Commands (All at Once)

If using Docker, run these commands in order:

```bash
# 1. Start MongoDB
docker compose up -d mongodb

# 2. Wait a few seconds for MongoDB to start
timeout /t 5

# 3. Create admin user
docker compose exec backend npm run create-admin

# 4. Sync products
docker compose exec backend npm run sync-products

# 5. Restart backend (to ensure fresh connection)
docker compose restart backend
```

## Troubleshooting

### If "User not found" persists:

1. **Check if user exists in database:**
   ```bash
   docker compose exec mongodb mongosh
   use grocery
   db.users.find({ email: "admin@gmail.com" })
   ```

2. **Verify user role is 'admin':**
   ```bash
   db.users.findOne({ email: "admin@gmail.com" }, { role: 1 })
   ```

3. **If user doesn't exist, create it again:**
   ```bash
   docker compose exec backend npm run create-admin
   ```

### If "Database not connected" persists:

1. **Check MongoDB container:**
   ```bash
   docker compose ps mongodb
   ```

2. **Check MongoDB logs:**
   ```bash
   docker compose logs mongodb
   ```

3. **Restart MongoDB:**
   ```bash
   docker compose restart mongodb
   ```

4. **Check backend logs:**
   ```bash
   docker compose logs backend
   ```

5. **Verify MONGODB_URI in backend:**
   - Should be: `mongodb://mongodb:27017/grocery` (for Docker)
   - Or: `mongodb://localhost:27017/grocery` (for local)

### If products don't sync:

1. **Check backend logs:**
   ```bash
   docker compose logs backend
   ```

2. **Check if API is accessible:**
   - Open Food Facts API might be slow or down
   - Try running sync again

3. **Verify products in database:**
   ```bash
   docker compose exec mongodb mongosh
   use grocery
   db.products.countDocuments()
   ```

## Expected Result

After following these steps:
- ✅ No "User not found" error
- ✅ No "Database not connected" error
- ✅ Admin Dashboard shows statistics
- ✅ Products are visible in database

## Still Having Issues?

1. **Check browser console** (F12) for detailed error messages
2. **Check backend logs:** `docker compose logs backend`
3. **Verify all services are running:** `docker compose ps`
4. **Try restarting everything:**
   ```bash
   docker compose down
   docker compose up -d --build
   ```

