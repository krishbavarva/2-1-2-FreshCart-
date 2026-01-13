# How to View the 500 Internal Server Error

## Method 1: Check Browser Developer Console

1. **Open your browser's Developer Tools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows)
   - Go to the **Console** tab

2. **Look for the error:**
   - You should see: `Error loading cart: AxiosError`
   - Click on the error to expand it
   - Look for the `response` object which contains the error details

3. **Check the Network tab:**
   - Go to **Network** tab in Developer Tools
   - Find the request to `/api/cart`
   - Click on it
   - Go to **Response** tab to see the full error message

## Method 2: Check Backend Server Console

The backend server console will show detailed error logs:

```
❌ Error getting cart: [error message]
Error details: {
  message: '...',
  name: '...',
  code: '...',
  stack: '...'
}
Sending error response: {
  "message": "Error fetching cart",
  "error": "...",
  "errorName": "...",
  "errorCode": "...",
  "stack": "..."
}
```

## Method 3: Test with curl/Postman

```bash
# Get your token from browser localStorage or login
TOKEN="your-jwt-token-here"

# Test GET cart
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/cart

# Test POST cart
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"test","name":"Test","price":10}' \
  http://localhost:5000/api/cart
```

## Common 500 Error Causes

1. **MongoDB Connection Issues**
   - Error: "MongoServerError" or connection timeout
   - Solution: Check MongoDB Atlas IP whitelist

2. **Invalid User ID Format**
   - Error: "CastError" or "ObjectId" related
   - Solution: User ID from token might be in wrong format

3. **Cart Model Validation Error**
   - Error: "ValidationError"
   - Solution: Check if required fields are missing

4. **Database Operation Failed**
   - Error: "MongoError" or "MongoServerError"
   - Solution: Check database connection and permissions

## What the Error Response Looks Like

When you get a 500 error, the response will be:

```json
{
  "message": "Error fetching cart",
  "error": "Actual error message here",
  "errorName": "ErrorType",
  "errorCode": "ERROR_CODE",
  "stack": "Full stack trace (development only)"
}
```

## Next Steps

1. **Restart the backend server** to see detailed logs
2. **Try the cart operation** that's failing
3. **Check the backend console** for the detailed error
4. **Share the error message** from the console for further debugging



