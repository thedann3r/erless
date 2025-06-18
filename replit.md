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

## Changelog

Changelog:
- June 18, 2025. Initial setup