# Employer Benefits Dashboard

A complete employer benefits management system with secure authentication and claims processing.

## Features

- **Secure Authentication**: Session-based login with bcrypt password hashing
- **Role-Based Access**: Employer and admin user roles with proper permissions
- **Claims Management**: Submit, approve, reject, and track benefit claims
- **Employee Management**: Track benefit limits and usage by employee
- **Fund Tracking**: Monitor employer fund totals and usage
- **Real-Time Analytics**: Dashboard with live statistics and reporting

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

3. Seed the database with demo data:
```bash
node seed.js
```

4. Start the server:
```bash
node server.js
```

The application will be available at http://localhost:3001

## Demo Accounts

Use these accounts to test the application:

- **Employer Account**: 
  - Email: hr@techcorp.com
  - Password: demo123

- **Admin Account**:
  - Email: admin@benefits.com  
  - Password: admin123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - User logout

### Employers
- `GET /api/employers` - List all employers
- `POST /api/employers` - Create new employer
- `GET /api/employers/:id/employees` - Get employees for employer

### Employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/:id/claims` - Get claims for employee

### Claims
- `POST /api/claims` - Submit new claim
- `PATCH /api/claims/:id/status` - Update claim status

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics

## Database Schema

### Users
- id, email, password (hashed), role, employerId
- Roles: 'employer', 'admin'

### Employers
- id, name, contact, fundTotal, createdAt

### Employees  
- id, name, employerId, benefitLimits (JSON), createdAt

### Claims
- id, employeeId, provider, category, amount, status, justification, createdAt

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: express-session, bcryptjs
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Session Storage**: connect-sqlite3

## Security Features

- Bcrypt password hashing
- Session-based authentication
- Protected API routes
- CORS configuration
- Secure cookie settings

## Development

To modify the database schema:

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_migration_name`
3. Update seed.js if needed
4. Run `node seed.js` to refresh data

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Configure secure session secrets
3. Enable HTTPS and update cookie settings
4. Set up proper database backups
5. Configure reverse proxy (nginx/Apache)

## Support

For issues or questions, please check the API documentation or contact the development team.