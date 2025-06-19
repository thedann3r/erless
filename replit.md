# Erlessed Healthcare Management System

## Overview

Erlessed is a comprehensive healthcare claims management system that combines AI-powered preauthorization, patient verification, prescription validation, and blockchain anchoring for healthcare claims. The system is designed to streamline healthcare operations across multiple care provider types including hospitals, clinics, and pharmacy chains.

## System Architecture

The application follows a modern full-stack architecture with the following key components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom teal/medical theme using shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for fast development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy using session-based auth
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Authentication System
- **Multi-role Support**: front-office, doctor, pharmacist, care-manager, debtors-officer
- **Domain-based Registration**: Automatic care provider detection from email domains
- **Professional Validation**: Integration with medical/pharmacy board registration verification
- **Enhanced Security**: Biometric verification capabilities for patient authentication

### AI Integration
- **OpenAI Integration**: GPT-4o for intelligent decision making
- **Preauthorization Analysis**: AI-powered approval/denial decisions with confidence scoring
- **Fraud Detection**: Pattern analysis for suspicious claims
- **Prescription Validation**: Safety checks including drug interactions and dosage validation
- **Chain-of-Thought Reasoning**: Transparent AI decision process with step-by-step explanations

### Patient Management
- **Biometric Verification**: Fingerprint scanning simulation for patient identity
- **Insurance Integration**: Multi-provider support with benefit tracking
- **Dependent Management**: Family member coverage tracking
- **Clinical History**: Comprehensive medical record management

### Claims Processing
- **Real-time Processing**: Immediate claim validation and status updates
- **Multi-stage Workflow**: Submission → AI Review → Approval/Denial → Payment
- **Void Capability**: Claims can be voided with audit trails
- **Blockchain Anchoring**: Immutable claim records via smart contracts

### Pharmacy Integration
- **Prescription Validation**: Weight-based, gender-sensitive, and interaction checking
- **Benefit Category Matching**: Automatic formulary compliance
- **Cost Calculation**: Real-time pricing with insurance coverage
- **Safety Flagging**: Clinical decision support

## Data Flow

1. **Patient Registration**: Biometric enrollment with insurance verification
2. **Clinical Encounter**: Patient queue management with triage prioritization
3. **Service Delivery**: Real-time eligibility checking and preauthorization
4. **Claims Submission**: Automated coding and AI review
5. **Payment Processing**: Electronic adjudication with blockchain verification
6. **Analytics**: Real-time dashboards and fraud monitoring

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless
- **AI Services**: OpenAI API for GPT-4o integration
- **Session Store**: PostgreSQL-backed sessions

### Frontend Libraries
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: TanStack Query v5
- **Icons**: Lucide React icons

### Backend Services
- **Blockchain**: Simulated Web3 integration for claim anchoring
- **Authentication**: Passport.js with bcrypt password hashing
- **Validation**: Zod schemas for type-safe data validation

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module
- **Hot Reload**: Vite HMR with Express middleware mode
- **Port Configuration**: 5000 (internal) → 80 (external)

### Production Build
- **Frontend**: Vite build to `dist/public`
- **Backend**: esbuild bundling with ESM output
- **Asset Serving**: Express static file serving
- **Environment**: Production mode with optimized bundles

### Scaling Strategy
- **Deployment Target**: Autoscale configuration
- **Session Management**: Database-backed sessions for horizontal scaling
- **Static Assets**: CDN-ready build output
- **Database**: Serverless PostgreSQL with connection pooling

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**June 18, 2025 - Comprehensive 6-Role Dashboard System Implementation:**
- **Doctor/Clinician Dashboard** (/doctor): Patient queue with triage vitals, consultation workflow with ICD-10 AI suggestions, smart prescription builder with safety validation, lab order forms with preauthorization status, fingerprint/OTP sign-off capability
- **Pharmacy Dashboard** (/pharmacy-dashboard): Prescription validation with drug interaction checks, benefit tracking and depletion warnings, medication dispensing workflow, preauthorization validation, real-time copay calculation
- **Care Manager Dashboard** (/care-manager-dashboard): Cross-network claims oversight, fraud pattern detection with AI scoring, provider performance analytics, cost benchmarking between facilities, referral success rate tracking, copay policy management
- **Insurer Dashboard** (/insurer): AI-assisted preauthorization decisions with confidence scoring, real-time claims inflow monitoring, scheme usage tracking with burnout alerts, appeals management workflow, automated approval thresholds
- **Patient Dashboard** (/patient): Claims history with appeal functionality, family dependent management, benefit utilization tracking with visual progress bars, preauthorized services status, cost estimates by scheme type
- **Admin Dashboard** (/admin): Platform user management, care provider registration, AI feature configuration with threshold controls, system performance monitoring, registration validation API testing

**Database Enhancements:**
- Added comprehensive tables: lab_orders, patient_queue, consultations, insurance_schemes, benefit_usage, dispensing_records, claim_appeals
- Enhanced user schema with care provider relationships and professional verification
- Implemented audit logging and fraud detection structures

**AI Integration Features:**
- Demo mode with realistic mock responses for all AI features
- Configurable confidence thresholds for automated decisions
- Chain-of-thought reasoning display for transparency
- Fraud pattern detection with risk scoring

**Kenya Clinical Registration Board Integration:**
- Professional license validation API with `/verify-registration` endpoint
- KMPDC, Clinical Officers Council, and PPB board integration
- 15 realistic practitioner records with proper Kenyan naming conventions
- Comprehensive validation including license expiry, suspension status
- Returns 403 for invalid/inactive/suspended registrations
- Admin Dashboard registration validator with testing interface
- Real-time verification with detailed practitioner information

**Advanced Analytics and Prognosis Modeling:**
- AI-powered prognosis models for diabetes, cardiovascular, cancer, and mental health
- Individual patient outcome tracking with predicted vs actual results
- Population health trend analysis with incidence and recovery rates
- Multi-dimensional risk assessment with radar charts and scoring
- Real-time model accuracy tracking and confidence scoring
- Comprehensive outcome metrics with treatment plan effectiveness
- Risk factor analysis with severity grading and recommendations

**Secure FastAPI HMS Integration Microservice:**
- Comprehensive microservice for hospital management system integration
- Support for OpenMRS, AfyaPro, and custom EMR systems
- REST API and FHIR protocol compatibility with OAuth2/token authentication
- Real-time data synchronization for vitals, labs, prescriptions, and diagnoses
- Patient consent management with fingerprint/OTP verification
- CSV/XML file upload fallback for offline data import
- Secure database mapping to Erlessed PostgreSQL schema
- Audit logging and compliance tracking for all sync operations

## Changelog

- June 18, 2025. Initial setup
- June 18, 2025. Comprehensive 6-role dashboard system with AI-powered workflows