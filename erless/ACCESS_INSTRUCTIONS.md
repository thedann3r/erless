# How to Access the Employer Benefits Dashboard

## Important: Two Separate Applications

This Replit project contains two different applications:

1. **Main Erlessed Healthcare Platform** (port 5000) - The main medical claims system
2. **Employer Benefits Dashboard** (port 3001) - The new employer benefits management system with authentication

## Access the Employer Benefits Dashboard

### Option 1: Direct URL Access
Open your browser and navigate directly to:
```
http://localhost:3001/
```

### Option 2: Via Replit Preview
1. In Replit, click the "Open in new tab" button
2. Change the URL from port 5000 to port 3001
3. Example: Change `https://your-repl.replit.dev` to `https://your-repl.replit.dev:3001`

## Demo Login Accounts

Use these credentials to test the application:

**Employer Account:**
- Email: `hr@techcorp.com`
- Password: `demo123`

**Admin Account:**
- Email: `admin@benefits.com`
- Password: `admin123`

## Features Available

After logging in, you can:
- View dashboard analytics
- Manage claims (approve/reject)
- Submit new claims
- Track employee benefit usage
- View employer fund totals
- Logout securely

## Troubleshooting

If you can't access the dashboard:

1. **Check if the server is running:**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"OK",...}`

2. **Start the server manually:**
   ```bash
   cd employer-dashboard
   node server.js
   ```

3. **Verify the database:**
   ```bash
   cd employer-dashboard
   node seed.js
   ```

## API Testing

You can test the authentication API directly:

```bash
# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@techcorp.com","password":"demo123"}'

# Test dashboard data
curl -X GET http://localhost:3001/api/analytics/dashboard \
  -H "Cookie: connect.sid=your_session_cookie"
```

## Next Steps

The authentication system is fully implemented and working. You can now:
- Register new users
- Add password reset functionality
- Implement role-based dashboard features
- Add user management for admins
- Deploy to production with HTTPS