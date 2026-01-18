# Quick MongoDB Setup - 5 Minutes

## Step 1: Create MongoDB Atlas Account (2 minutes)

1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Click "Try Free"
3. Sign up with Google/GitHub or email
4. **No credit card required!**

## Step 2: Create Free Cluster (1 minute)

1. After signup, click **"Build a Database"**
2. Choose **FREE (M0)** tier
3. Select **Provider**: AWS
4. Select **Region**: Choose closest to France (e.g., `eu-west-1` - Ireland, or `eu-central-1` - Frankfurt)
5. Click **"Create"** (takes 1-3 minutes)

## Step 3: Create Database User (1 minute)

1. Click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter:
   - **Username**: `groceryuser` (or any name)
   - **Password**: Create a strong password (save it!)
5. Set privileges: **"Atlas admin"** (or "Read and write to any database")
6. Click **"Add User"**

## Step 4: Allow Network Access (1 minute)

1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - Or click "Add Current IP Address" if you want to restrict
4. Click **"Confirm"**

## Step 5: Get Connection String (1 minute)

1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select **Driver**: Node.js, **Version**: 5.5 or later
5. **Copy the connection string**
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## Step 6: Update Your .env File

1. Open `backend/.env`
2. Replace the `MONGODB_URI` line with:
   ```env
   MONGODB_URI=mongodb+srv://groceryuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/grocery?retryWrites=true&w=majority
   ```
3. Replace:
   - `groceryuser` with your database username
   - `YOUR_PASSWORD` with your database password (URL encode special characters)
   - `cluster0.xxxxx` with your actual cluster name
   - Keep `/grocery` at the end (this is your database name)

**Example:**
```env
MONGODB_URI=mongodb+srv://groceryuser:mypassword123@cluster0.abc123.mongodb.net/grocery?retryWrites=true&w=majority
```

## Step 7: Restart Backend

```bash
cd backend
npm start
```

You should see:
```
✅ Connected to MongoDB successfully!
📦 Database: grocery
```

## Troubleshooting

**If connection fails:**
- Make sure password doesn't have special characters (or URL encode them: `@` = `%40`, `#` = `%23`)
- Check Network Access allows your IP
- Verify username and password are correct
- Wait 2-3 minutes after creating cluster (it needs time to provision)

## URL Encoding Special Characters

If your password has special characters:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

Or just use a password without special characters for easier setup!

