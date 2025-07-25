# Employer Benefits Dashboard

A comprehensive system for managing employee benefits and claims processing with fund tracking capabilities.

## Features

- **Employer Management**: Track multiple employers with fund allocation
- **Employee Benefits**: Flexible JSON-based benefit limits per employee  
- **Claims Processing**: Submit, review, approve/reject employee claims
- **Fund Tracking**: Monitor total funds and payouts
- **Analytics Dashboard**: Real-time statistics and reporting
- **API-First**: RESTful API for all operations

## Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: SQLite with Prisma ORM
- **Frontend**: Vanilla JavaScript + HTML/CSS
- **CORS**: Enabled for cross-origin requests

## Database Schema

### Employer
- `id` (String, Primary Key)
- `name` (String) - Company name
- `contact` (String) - Contact email
- `fundTotal` (Float) - Total allocated fund amount
- `createdAt` (DateTime)

### Employee  
- `id` (String, Primary Key)
- `name` (String) - Employee name
- `employerId` (String, Foreign Key)
- `benefitLimits` (JSON) - Flexible benefit categories and limits
- `status` (String) - active/inactive
- `createdAt` (DateTime)

### Claim
- `id` (String, Primary Key)
- `employeeId` (String, Foreign Key)
- `provider` (String) - Healthcare/service provider name
- `category` (String) - medical/dental/vision/wellness
- `amount` (Float) - Claim amount
- `status` (String) - pending/approved/rejected
- `justification` (String, Optional) - Claim description
- `createdAt` (DateTime)

## API Endpoints

### Employers
- `GET /api/employers` - List all employers with employees and claims
- `POST /api/employers` - Create new employer

### Employees
- `GET /api/employers/:id/employees` - Get employees for employer
- `POST /api/employees` - Create new employee

### Claims
- `GET /api/employees/:id/claims` - Get claims for employee
- `POST /api/claims` - Submit new claim
- `PATCH /api/claims/:id/status` - Update claim status

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name employer_init
   ```

3. **Seed Sample Data**:
   ```bash
   npm run seed
   ```

4. **Start Server**:
   ```bash
   npm run dev     # Development mode with auto-reload
   npm start       # Production mode
   ```

5. **Access Dashboard**:
   Open http://localhost:3001 in your browser

## Sample Data

The seed script creates:
- **2 Employers**: TechCorp Ltd, HealthPlus Solutions
- **3 Employees**: With varying benefit limits
- **4 Claims**: Mix of pending and approved claims

## Usage Examples

### Create New Employer
```bash
curl -X POST http://localhost:3001/api/employers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "NewCorp Ltd",
    "contact": "hr@newcorp.com", 
    "fundTotal": 300000.00
  }'
```

### Submit Employee Claim
```bash
curl -X POST http://localhost:3001/api/claims \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "employee_id_here",
    "provider": "City Hospital",
    "category": "medical",
    "amount": 25000.00,
    "justification": "Emergency surgery"
  }'
```

### Approve/Reject Claim
```bash
curl -X PATCH http://localhost:3001/api/claims/claim_id_here/status \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

## Frontend Features

- **Dashboard Overview**: Real-time statistics display
- **Claims Management**: View, filter, and update claim statuses  
- **Claim Submission**: Form-based claim creation
- **Responsive Design**: Works on desktop and mobile
- **Auto-refresh**: Real-time updates after actions

## Development Notes

- Server runs on port 3001 by default
- Database file: `prisma/dev.db`
- CORS enabled for frontend integration
- Graceful shutdown handling
- Error logging and validation

## Future Enhancements

- User authentication and role-based access
- Email notifications for claim status changes
- Advanced reporting and analytics
- Integration with external payment systems
- Bulk claim processing
- Document upload support