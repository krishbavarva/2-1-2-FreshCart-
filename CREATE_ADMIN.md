# How to Create an Admin User

## Method 1: Using the Script (Recommended)

### Step 1: Make sure MongoDB is running
- If using Docker: `docker compose up -d mongodb`
- If using local MongoDB: Make sure MongoDB service is running

### Step 2: Run the create admin script

**If running locally (without Docker):**
```bash
cd backend
npm run create-admin
```

**If using Docker:**
```bash
docker compose exec backend npm run create-admin
```

### Step 3: Login with admin credentials
- **Email:** `admin@gmail.com`
- **Password:** `123456`

After logging in, you will see the **Admin** link in the navbar.

---

## Method 2: Create Admin via Admin Panel (if you already have an admin)

1. Login as an existing admin user
2. Go to Admin Panel → User Management
3. Click "Create User"
4. Fill in the form and set **Role** to `admin`
5. Save the user

---

## Method 3: Create Admin via API

You can also create an admin user by making a POST request to the API:

```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@gmail.com",
    "password": "123456",
    "role": "admin"
  }'
```

---

## Verify Admin User

After creating the admin user:

1. Logout from current session (if logged in)
2. Login with admin credentials
3. You should see the **Admin** link in the navbar
4. Click on Admin to access the admin dashboard

---

## Notes

- The admin link in the navbar will **only** appear for users with role `admin` or `manager`
- Regular users will see: Products, Dashboard, Orders, Cart
- Admin users will see: Products, Dashboard, Orders, **Admin**, Cart
- The Admin link has a special orange background to distinguish it

---

## Troubleshooting

**If admin link doesn't appear:**
1. Make sure you logged out and logged back in
2. Check browser console for user role information
3. Verify the user role in database is exactly `admin` (not `Admin` or `ADMIN`)
4. Clear browser cache and localStorage

**To check user role in database:**
```bash
# Using MongoDB shell
docker compose exec mongodb mongosh
use grocery
db.users.find({ email: "admin@gmail.com" })
```

