# Erlessed Support System Documentation

## Overview

The Erlessed Support System provides comprehensive user assistance through multiple channels including ticketing, real-time chat, role-specific documentation, and FAQ systems. The system is designed to reduce support burden while providing contextual help based on user roles and current workflows.

## Components

### Backend (FastAPI Service)
- **Location**: `hms_integration/support_service.py`
- **Port**: 8002
- **Database**: SQLite with tickets, documentation, FAQ tables
- **Features**: Ticket management, role-specific documentation, FAQ system

### Frontend Components
- **Support Widget**: Floating help button with contextual assistance
- **Chat Support**: Simulated real-time chat with role-specific responses
- **Support Dashboard**: Admin interface for ticket management

### Integration Points
- **Main App Routes**: Proxy routes for support service API
- **Role-Based Content**: Customized help based on user permissions
- **Dashboard Integration**: Support widgets embedded in all role dashboards

## Role-Specific Features

### Doctor Support
- Patient queue management help
- ICD-10 coding assistance
- Prescription workflow guidance
- Clinical documentation support

### Pharmacist Support  
- Drug verification processes
- Benefit checking procedures
- Dispensing workflow assistance
- Inventory management guidance

### Care Manager Support
- Fraud detection analytics
- Provider performance metrics
- Claims oversight tools
- Network management help

### Insurer Support
- Claim appeal procedures
- Preauthorization workflows
- Risk assessment tools
- Decision review processes

### Patient Support
- Benefit understanding
- Claims status tracking
- Dependent management
- Billing inquiries

### Admin Support
- User management procedures
- System configuration
- Performance monitoring
- Security administration

## API Structure

### Ticket Management
- Create, update, and track support tickets
- Role-based ticket filtering
- Response threading and updates
- Priority and status management

### Documentation System
- Markdown-based content management
- Role-specific content filtering
- Category and tag organization
- Search functionality

### FAQ System
- Question and answer management
- Popularity tracking
- Role-based filtering
- Category organization

## Chat Integration Options

### Internal Chat System
- Contextual keyword matching
- Role-specific response generation
- Quick action suggestions
- Typing indicators and real-time feel

### External Service Integration
- **Tawk.to**: Live chat widget integration
- **Crisp**: Customer messaging platform
- **WhatsApp Business API**: Mobile chat support
- **Custom webhook**: Connect to existing support systems

## Content Management

### Documentation Creation
1. Add markdown content to documentation table
2. Set role and category filters
3. Configure tags for searchability
4. Set display order and publication status

### FAQ Management
1. Create question-answer pairs with markdown formatting
2. Categorize by functional area
3. Track helpfulness metrics
4. Maintain popularity-based ordering

## Usage

### End Users
- Access help via floating support button on any dashboard
- Search FAQ for immediate answers
- Browse role-specific documentation guides
- Create support tickets for complex issues
- Use chat for real-time assistance

### Support Staff
- Monitor tickets through admin dashboard
- Respond with contextual solutions
- Update ticket status and priority
- Track resolution metrics
- Manage documentation content

### Administrators
- Configure role-specific content
- Monitor support system metrics
- Manage user access and permissions
- Integrate external chat services
- Update system documentation

## Database Schema

### Support Tickets
- Comprehensive ticket tracking with status, priority, and assignment
- User role association for contextual support
- Response threading for conversation history
- Audit trail with timestamps

### Documentation
- Markdown content with role-based filtering
- Category and tag organization
- Publication control and versioning
- Usage tracking capabilities

### FAQ Items
- Question-answer pairs with markdown support
- Role-specific and category filtering
- Popularity metrics and helpful tracking
- Ordering and priority management

## Deployment

### Development
- Support service runs on port 8002
- SQLite database for rapid development
- Hot reload for content updates
- Integrated with main application auth

### Production
- Containerized with main application
- Persistent volume for SQLite database
- Environment configuration for external services
- Health monitoring and alerting

## Security

### Access Control
- Role-based content filtering
- Authenticated API access
- Secure ticket data handling
- Admin privilege verification

### Data Protection
- Ticket content security
- Audit logging for all interactions
- Secure file attachment handling
- Privacy compliance measures

This support system provides comprehensive user assistance while maintaining security and performance standards appropriate for healthcare platform operations.