# Erlessed Healthcare Platform

A comprehensive healthcare claims management system with AI-powered preauthorization, patient verification, and secure production deployment capabilities.

## Features

- **6 Role-Based Dashboards**: Doctor, Pharmacy, Care Manager, Insurer, Patient, and Admin interfaces
- **AI-Powered Analytics**: OpenAI and Anthropic integration for intelligent decision making
- **Kenya Compliance**: Professional license validation and SHA billing guidelines
- **HMS Integration**: FastAPI microservice for hospital management systems
- **Secure Infrastructure**: Production-ready with rate limiting, monitoring, and backup systems

## Quick Start

### Development Setup

```bash
# Clone and install dependencies
git clone <repository-url>
cd erlessed-healthcare
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Production Deployment

#### Option 1: Fly.io (Recommended for Africa)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
chmod +x deploy.sh
./deploy.sh
# Select option 1 for Fly.io
```

#### Option 2: Render.com

```bash
# Deploy using blueprint
./deploy.sh
# Select option 2 for Render.com
```

#### Option 3: Docker Compose

```bash
# Copy production environment
cp production.env .env.production
# Edit with your production values

# Deploy with Docker
docker-compose up -d
```

## Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/erlessed
JWT_SECRET=your-secure-256-bit-secret

# AI Services (for analytics and decision support)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Payment Processing (for billing features)
STRIPE_SECRET_KEY=sk_live_your-stripe-secret
VITE_STRIPE_PUBLIC_KEY=pk_live_your-stripe-public
```

### Optional Configuration

```bash
# Monitoring
SENTRY_DSN=your-sentry-dsn
REDIS_URL=redis://host:6379

# HMS Integration
HMS_API_USERNAME=your-hms-username
HMS_API_PASSWORD=your-hms-password
```

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query
- **Routing**: Wouter

### Backend (Express.js + TypeScript)
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **Security**: Helmet, rate limiting, CORS protection

### HMS Integration (FastAPI + Python)
- **Framework**: FastAPI with async support
- **Integration**: OpenMRS, AfyaPro, custom EMR systems
- **Authentication**: OAuth2 and token-based auth
- **Data Sync**: Real-time synchronization with consent management

## Security Features

- **Rate Limiting**: Configurable per endpoint with Redis backend
- **Security Headers**: Helmet.js with CSP and HSTS
- **Authentication**: Session-based with secure cookie handling
- **Data Protection**: AES-256 encryption for biometric data
- **Audit Logging**: Comprehensive logging for compliance

## Monitoring & Health Checks

### Health Endpoints

- **Application Health**: `GET /health`
- **Metrics**: `GET /metrics` (Prometheus format)
- **Uptime Monitoring**: Built-in monitoring script

### Example Health Check Response

```json
{
  "status": "OK",
  "timestamp": "2025-01-19T19:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "database": {
    "status": "connected",
    "responseTime": "15ms"
  },
  "memory": {
    "used": 128,
    "total": 256
  }
}
```

## Backup & Recovery

### Automated Backups

- **PostgreSQL**: Automated daily backups with 7-day retention
- **Cloud Storage**: Optional S3 integration for off-site backups
- **Recovery**: Point-in-time recovery capabilities

### Manual Backup

```bash
# Create manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_file.sql
```

## API Documentation

### Core Endpoints

- **Authentication**: `POST /api/auth/login`, `POST /api/auth/register`
- **Claims Management**: `GET|POST /api/claims`
- **Patient Data**: `GET|POST /api/patients`
- **Analytics**: `GET /api/analytics/dashboard`
- **HMS Integration**: `POST /api/hms/sync`

### Rate Limits

- **General API**: 1000 requests per 15 minutes
- **Authentication**: 10 requests per 15 minutes
- **File Uploads**: 10MB maximum size

## Legal Compliance

### Kenya Healthcare Regulations

- **Data Protection Act 2019**: Full compliance implementation
- **SHA Billing Guidelines**: Integrated billing workflows
- **Professional Licensing**: KMPDC, PPB, Clinical Officers validation
- **Patient Consent**: Granular consent management with withdrawal options

### Documentation

- `legal_docs/terms_of_service.md`: Complete terms of service
- `legal_docs/privacy_policy.md`: Data protection and privacy policy
- `legal_docs/patient_consent.md`: Patient consent forms and procedures

## Development

### Project Structure

```
erlessed-healthcare/
├── client/src/           # React frontend
├── server/              # Express.js backend
├── hms_integration/     # FastAPI HMS microservice
├── shared/              # Shared TypeScript types
├── legal_docs/          # Legal compliance documents
└── deployment/          # Production configuration
```

### Database Schema

- **Users & Authentication**: Multi-role user management
- **Patients & Claims**: Healthcare data with audit trails
- **HMS Integration**: Synchronized clinical data
- **Billing & Subscriptions**: Payment processing and usage tracking

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Database operations
npm run db:push        # Push schema changes
npm run db:studio      # Open database studio

# Type checking
npm run type-check

# Security audit
npm audit
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify DATABASE_URL in environment
   - Check PostgreSQL service status
   - Ensure network connectivity

2. **Rate Limiting Errors**
   - Check Redis connection if configured
   - Verify rate limit configurations
   - Review IP whitelisting

3. **HMS Integration Issues**
   - Verify HMS credentials
   - Check patient consent status
   - Review audit logs

### Getting Help

- **Health Check**: Visit `/health` endpoint
- **Logs**: Check application logs in `/logs` directory
- **Monitoring**: Use uptime monitor script
- **Support**: Contact system administrator

## License

Proprietary software for healthcare providers. All rights reserved.

## Version

Current version: 1.0.0
Last updated: December 19, 2024# erless
