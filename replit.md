# Erlessed Healthcare Management System

## Overview
Erlessed is a comprehensive healthcare claims management system designed to streamline operations for hospitals, clinics, and pharmacies. It integrates AI-powered preauthorization, patient verification, prescription validation, and blockchain anchoring for immutable claim records. The system's vision is to enhance efficiency, reduce fraud, and improve decision-making in healthcare claims management across multiple care provider types.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### General Principles
The application features a modern full-stack architecture prioritizing scalability, security, and maintainability. Key architectural decisions include a component-based frontend, a Node.js backend, and a PostgreSQL database. The system emphasizes clear separation of concerns, microservice-oriented integration for external systems, and a strong focus on compliance with Kenyan healthcare regulations.

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom teal/medical theme using shadcn/ui components; features consistent modern UI with card-based layouts and professional aesthetics. Supports both dark and light themes.
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Build Tool**: Vite
- **UI/UX Decisions**: Employs a clean, modern design with a consistent teal/healthcare blue color scheme. Features role-specific dashboards (Admin, Doctor, Pharmacist, Care Manager, Insurer, Patient, Front Office, Debtors) with tailored KPIs and workflows. Incorporates visual elements like progress rings, heatmaps, and confidence badges.
- **Mobile Experience**: Responsive design for field workers and patient self-service.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and PostgreSQL-backed session management, supporting multi-role access and domain-based registration. Includes biometric verification capabilities for patients.
- **AI Integration**: Utilizes OpenAI (GPT-4o), DeepSeek, and Mistral 7B for AI-powered preauthorization, fraud detection, prescription validation, treatment planning, and reasoning chain generation. AI decisions are transparent with confidence scoring.
- **Data Flow**: Comprehensive workflows for patient registration, clinical encounters, real-time eligibility checks, claims submission (with AI review), payment processing (with blockchain verification), and analytics.
- **Features**: Multi-role support, advanced authentication (including biometric simulation), real-time claims processing, multi-stage workflow, void capability for claims, and blockchain anchoring for immutability.
- **Pharmacy Integration**: Prescription validation with safety checks (weight-based, gender-sensitive, drug interaction), benefit category matching, and real-time cost calculation.
- **Legal Compliance**: Integrated framework for Kenyan compliance (Data Protection Act 2019, SHA guidelines, professional license verification) with legal disclaimers and patient consent management.

### Data Storage
- **Primary Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM for type-safe queries
- **Schema**: Shared schema definitions for consistency.
- **Migrations**: Drizzle Kit

### Other Technical Implementations
- **Claim Form Generation**: Dynamic PDF claim form generation for various insurers (SHA, CIC, AAR, Jubilee, AON Minet) using PDFMake.
- **Verification Audit Log**: Comprehensive tracking of biometric verifications with filtering and analytics.
- **Decision Feedback System**: Tracks AI decisions and allows care managers to provide feedback on outcomes.
- **HMS Integration Microservice**: Secure FastAPI microservice for integration with Hospital Management Systems (OpenMRS, AfyaPro, custom EMRs) supporting REST API and FHIR protocol.

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless
- **AI Services**: OpenAI API (for GPT-4o), DeepSeek API, Mistral 7B API
- **Session Store**: PostgreSQL-backed sessions

### Frontend Libraries
- **UI Components**: Radix UI primitives, shadcn/ui
- **Form Handling**: React Hook Form, Zod
- **State Management**: TanStack Query v5
- **Icons**: Lucide React icons
- **Biometric Simulation**: FingerprintJS2

### Backend Services
- **Authentication**: Passport.js, bcrypt
- **Validation**: Zod schemas
- **PDF Generation**: PDFMake
- **XML Security**: defusedxml (for HMS integration)
- **Blockchain**: Simulated Web3 integration for claim anchoring (not a live blockchain)
- **Support Module**: FastAPI service (internal microservice)
- **Employer Benefits Module**: Node.js/Express with Prisma ORM and SQLite (separate, self-contained module)