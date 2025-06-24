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

**Comprehensive Legal Framework for Kenyan Compliance:**
- Complete Terms of Service for healthcare providers and insurers (21 sections)
- Comprehensive Privacy Policy with Data Protection Act 2019 compliance (18 sections)
- Detailed Patient Consent and Data Access Statement (16 sections with 5 consent forms)
- AI-powered decision making disclaimers and patient rights protection
- Biometric data special protections with AES-256 encryption requirements
- SHA (Social Health Authority) billing guidelines integration and real-time compliance checking (replacing NHIF)
- Professional license verification requirements (KMPDC, PPB, Clinical Officers Council)
- Cross-border data transfer safeguards and adequacy decision compliance

**December 19, 2024 - Legal Compliance Framework Completion:**
- Created comprehensive 4-document legal framework ensuring full Kenyan healthcare compliance
- Updated all references from NHIF to SHA (Social Health Authority) per current Kenyan healthcare system structure
- Implemented Data Protection Act 2019 complete compliance with all 45 articles covered
- Added AI transparency requirements with human review rights and explainable decision-making
- Enhanced biometric data protections with AES-256 encryption and separate consent mechanisms
- Established professional license verification framework for KMPDC, PPB, and Clinical Officers Council
- Created patient consent management system with 5 granular consent types and withdrawal mechanisms
- Documentation includes Terms of Service, Privacy Policy, Patient Consent Statement, and Compliance Summary

**December 19, 2024 - Production Deployment Infrastructure:**
- Implemented comprehensive Docker containerization with multi-stage builds for frontend and FastAPI HMS integration
- Created Fly.io and Render.com deployment configurations with health checks and auto-scaling
- Added production security middleware: Helmet.js, CORS, rate limiting with Redis backend, and compression
- Implemented enhanced health monitoring with database connectivity checks and Prometheus metrics endpoint
- Created automated PostgreSQL backup system with 6-hour intervals and 7-day retention
- Added graceful shutdown handling with SIGTERM/SIGINT support and connection cleanup
- Deployed uptime monitoring script with multi-service health checks and alert notifications
- Enhanced error handling and logging for production debugging and monitoring

**December 19, 2024 - Comprehensive Support Module Implementation:**
- Built FastAPI support service (port 8002) with SQLite database for tickets, documentation, and FAQ management
- Created interactive support widget with role-specific quick help, FAQ browser, and ticket creation interface
- Implemented contextual chat support with simulated real-time assistance and role-based automated responses
- Developed admin support dashboard for ticket management, response tracking, and performance analytics
- Added role-specific documentation system with markdown content, category filtering, and search functionality
- Integrated support widgets into all user dashboards with contextual help based on user roles and workflows
- Created comprehensive documentation system with deployment guides and external chat integration options

**December 19, 2024 - Universal Logout Functionality Implementation:**
- Implemented comprehensive logout functionality across all 6 role-based dashboards (Doctor, Pharmacist, Care Manager, Insurer, Patient, Admin)
- Created reusable LogoutButton component with dropdown variant showing session timeout and user information
- Added server-side `/api/logout` route with session destruction and cookie cleanup
- Implemented 15-minute auto-logout functionality for users handling sensitive claims and patient data
- Added activity tracking with inactivity warnings and session timeout notifications
- Enhanced authentication system with comprehensive session management and security features

**December 20, 2024 - Mobile App Implementation for Field Workers and Patient Self-Service:**
- Built comprehensive mobile field worker application (`/mobile-field-worker`) with responsive design
- Features include: scheduled patient visits with GPS navigation, real-time vitals collection, photo documentation, emergency contacts
- Implemented patient self-service mobile portal (`/mobile-patient-portal`) with full healthcare management
- Mobile portal includes: appointment scheduling, prescription management, claims tracking, health metrics dashboard
- Created mobile navigation component with role-based menu systems and quick access widgets
- Added mobile-responsive layouts with touch-friendly interfaces optimized for healthcare workflows
- Integrated emergency services access and supervisor communication for field workers
- Patient portal features benefit tracking, medication reminders, and health score visualization

**December 20, 2024 - Enhanced Professional Registration System:**
- Implemented comprehensive two-step onboarding flow (`/signup`) with professional validation
- Step 1: Basic information collection (name, email, password) with care provider auto-detection
- Step 2: Role selection with clinical/non-clinical differentiation and automatic facility assignment
- Added Kenya regulatory board integration (KMPDC, COC, PPB) with license verification for clinical roles
- Non-clinical roles (Billing Officer, Care Manager, Front Office, Insurer Officer) skip regulatory validation
- Integrated care provider domain detection for major Kenyan healthcare institutions
- Role-based dashboard redirection after successful registration
- Enhanced form validation with real-time feedback and professional license verification stub

**December 20, 2024 - Flexible Email/Username Authentication System:**
- Updated login form to accept single "Email or Username" input field
- Backend automatically detects @ symbol to determine authentication method
- Enhanced LocalStrategy to support both getUserByEmail and getUserByUsername queries
- Added comprehensive error handling with inline error messaging
- Created test user for authentication validation (username: testuser, email: test@aku.edu)
- Implemented proper session management and login response formatting
- Added visual feedback for authentication attempts with Erlessed teal/blue theming

**December 20, 2024 - Session Management and Logout System:**
- Fixed session persistence issues with proper cookie configuration and 24-hour expiration
- Enhanced session serialization/deserialization with detailed logging and type handling
- Implemented logout functionality accessible from header (dropdown) and sidebar
- Added role-based dashboard redirection after successful authentication
- Session management now properly maintains authentication state across all dashboard pages
- Complete authentication flow: login → role-based redirect → persistent session → logout capability

**June 20, 2025 - Modern UI Redesign with Teal Healthcare Theme:**
- Rebuilt entire Erlessed platform with modern, clean design using teal (#14B8A6) and healthcare blue (#3B82F6) brand colors
- Implemented comprehensive SharedLayout component with session timer, user avatar dropdown, and role-based sidebar navigation
- Created modern dashboards for all 6 roles: Doctor (/modern-doctor), Pharmacy (/modern-pharmacy), Care Manager (/modern-care-manager), Insurer (/modern-insurer), Patient (/modern-patient), Admin (/modern-admin)
- Enhanced visual hierarchy with card-based layouts, priority color coding (high: red, normal: blue, low: green), and smooth animations
- Integrated advanced features: reasoning chains, benefit progress rings, fraud detection heatmaps, cost calculators, and real-time health scoring
- Added modern authentication page (/modern-auth) with brand showcase, quick login options for demo access, and responsive mobile design
- Removed all "AI" terminology from user interface while maintaining intelligent decision support functionality
- Implemented proper 2xl rounded corners, minimal shadows, and Inter font for professional healthcare aesthetic

**June 21, 2025 - Biometric Verification and Insurance Claim Form Generation:**
- Added comprehensive biometric verification system with fingerprint scanning and SMS OTP verification
- Implemented insurer-specific claim form generation using PDFMake with support for CIC, AAR, and SHA templates (NHIF replaced by SHA)
- Enhanced pharmacy dashboard with patient identity verification before dispensing medications
- Integrated claim form generator with auto-populated patient, provider, and service data from current encounters
- Added front office dashboard (/modern-front-office) for appointment management, walk-in registration, and insurance verification
- Enhanced doctor dashboard with patient verification and claim generation workflow integration
- Claim forms include proper insurer branding, patient demographics, clinical information, service details, and signature sections
- All claim generation activities are logged and linked to current patient encounters for audit trails

**June 21, 2025 - NHIF to SHA System Update:**
- Updated all platform references from NHIF to SHA (Social Health Authority) to reflect current Kenyan healthcare system
- Modified claim form templates, member ID formats, and insurer selection options throughout all dashboards
- Updated biometric verification system to use SHA member identifiers and branding
- Ensured compliance with current Social Health Authority billing guidelines and procedures
- All user interfaces now display SHA terminology instead of deprecated NHIF references

**June 21, 2025 - Pharmacy Dashboard UI Enhancement:**
- Renamed Quick Actions for improved workflow: "Verify Patient" → "Preauthorization" → "Validate Prescription" → "Secure Claim Log"
- Updated System Status terminology: "Intelligence Engine", "System Database", "Smart Contract Ledger"
- Added professional iconography with fingerprint, shield, file-check, and shield-lock icons
- Implemented rounded buttons with teal color scheme (#14B8A6) for touch-friendly interface
- Added tooltip for "Secure Claim Log" explaining blockchain anchoring functionality
- Enhanced mobile responsiveness and consistent healthcare branding throughout interface

**June 22, 2025 - Advanced AI Integration with DeepSeek and Mistral 7B:**
- Integrated DeepSeek API for chain of thought reasoning across healthcare decisions
- Added Mistral 7B API for comprehensive healthcare treatment logic and clinical support
- Created comprehensive DeepSeekService with preauthorization analysis, prescription safety validation, and fraud detection with transparent reasoning chains
- Developed MistralHealthcareService for treatment plan generation, differential diagnosis analysis, complex drug interaction assessment, and patient education content
- Enhanced pharmacy dashboard with ChainOfThoughtDisplay component showing expandable reasoning steps, confidence scoring, and supporting evidence
- Updated all existing API endpoints (/api/preauth, /api/pharmacy/validate) to use AI reasoning with fallback to existing OpenAI integration
- Added new endpoints: /api/ai/treatment-plan, /api/ai/differential-diagnosis, /api/ai/drug-interactions, /api/ai/patient-education
- Created TreatmentPlanDisplay component for comprehensive treatment visualization with clinical reasoning, alternative treatments, and patient education
- All AI-powered decisions now include transparency indicators and confidence scoring for clinical decision support

**June 22, 2025 - Dashboard Navigation Enhancement:**
- Implemented comprehensive DashboardToggle component for seamless navigation between role-based dashboards
- Added recent dashboard tracking with localStorage persistence for quick access to previously used dashboards
- Created responsive design with full dashboard selector for desktop and compact version for mobile
- Integrated quick back button functionality to return to previous dashboard with one click
- Enhanced SharedLayout header to include dashboard navigation controls with role-based color coding
- Added dashboard descriptions and role badges for better user orientation and context switching

**June 22, 2025 - Comprehensive Debtors Dashboard Implementation:**
- Created dedicated Debtors Dashboard for hospital accounts department to manage medical insurance claims
- Implemented claim batch tracking with insurer-specific grouping (SHA, CIC, AAR) and submission status monitoring
- Added pending diagnosis reminders panel with doctor notification system for incomplete claims
- Integrated biometric verification system for secure claim batch submissions with fingerprint and SMS OTP options
- Built void claims analysis (premium feature) with categorization by error type and reconciliation tracking
- Added comprehensive KPI tracking: total claims, clean claims percentage, pending diagnosis count, expected reimbursements
- Implemented role-based access controls for debtor users with care provider auto-mapping via email domain
- Created export and submission functionality with PDF/Excel report generation and insurer feedback reconciliation
- Added comprehensive API endpoints for claims batches, pending diagnosis tracking, reminder notifications, and secure batch submissions

**June 22, 2025 - Verification Audit Log Implementation:**
- Built premium Verification Audit Log panel for comprehensive biometric verification tracking
- Implemented audit table with patient name, service, billed by, verification status, and timestamp columns
- Added advanced filtering by date range, department (pharmacy, triage, lab), and verification status
- Created status badge system: Verified (green), Missing (red), Time Mismatch (orange), Pending (yellow)
- Integrated time difference tracking with alerts for verification performed after billing
- Added detailed audit trail viewer with blockchain hash display and verification metadata
- Implemented premium access controls with upgrade prompts for basic users
- Created analytics dashboard with verification rates, missing verification counts, and time mismatch statistics
- Added CSV/PDF export functionality for audit reporting and compliance documentation
- API endpoints for verification audit data with filtering, search, and premium status checking

**June 22, 2025 - Restored Debtors Authentication System:**
- Restored authentication requirements for debtors dashboard access
- Protected routes now require proper debtors role authentication
- Verification audit page requires authentication and role-based access control
- Maintained all existing functionality: claim batches, KPI tracking, verification audit, quick actions
- Navigation between dashboard and audit pages with proper authentication flow
- Both /debtors-dashboard and /verification-audit now require valid debtors authentication

## Changelog

- June 18, 2025. Initial setup
- June 18, 2025. Comprehensive 6-role dashboard system with AI-powered workflows
- December 19, 2024. Production-ready deployment infrastructure with monitoring and security
- December 19, 2024. Complete support module with ticketing, chat, and role-specific documentation