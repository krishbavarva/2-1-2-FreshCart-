# Update MongoDB Connection String

## Your MongoDB Atlas Connection String

You have:
```
mongodb+srv://krishbavarva:<db_password>@cluster0.atewaqb.mongodb.net/
```

## Steps to Update .env File

1. **Replace `<db_password>` with your actual MongoDB Atlas password**
   - This is the password you created when setting up the database user in MongoDB Atlas
   - Make sure to use the correct password!

2. **Add database name and connection options:**
   - Add `/grocery` at the end (this is your database name)
   - Add `?retryWrites=true&w=majority` for better connection options

3. **Final format should be:**
   ```
   MONGODB_URI=mongodb+srv://krishbavarva:YOUR_PASSWORD@cluster0.atewaqb.mongodb.net/grocery?retryWrites=true&w=majority
   ```

## Update Your .env File

Open `backend/.env` and replace the `MONGODB_URI` line with:

```env
MONGODB_URI=mongodb+srv://krishbavarva:YOUR_PASSWORD@cluster0.atewaqb.mongodb.net/grocery?retryWrites=true&w=majority
```

**Replace `YOUR_PASSWORD` with your actual MongoDB password!**

## Important Notes

- **Special Characters in Password:** If your password has special characters like `@`, `#`, `$`, etc., you need to URL-encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`

- **No Spaces:** Make sure there are no spaces around the `=` sign

## After Updating

1. Save the `.env` file
2. Restart your backend server:
   ```bash
   cd backend
   npm start
   ```

You should see:
```
✅ Connected to MongoDB successfully!
📦 Database: grocery
```

## Need Help?

If you forgot your password:
1. Go to MongoDB Atlas Dashboard
2. Click "Database Access"
3. Click on your user (krishbavarva)
4. Click "Edit" to reset password

