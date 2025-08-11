"""
Support Ticket System for Erlessed Healthcare Platform
FastAPI backend for managing support tickets, documentation, and user help
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import sqlite3
import json
import os
import uuid
from pathlib import Path

# Initialize FastAPI app
support_app = FastAPI(
    title="Erlessed Support System",
    description="Support tickets, documentation, and user assistance API",
    version="1.0.0"
)

# CORS middleware
support_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Enums
class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class UserRole(str, Enum):
    DOCTOR = "doctor"
    PHARMACIST = "pharmacist"
    CARE_MANAGER = "care-manager"
    INSURER = "insurer"
    PATIENT = "patient"
    ADMIN = "admin"

# Pydantic models
class SupportTicket(BaseModel):
    id: Optional[str] = None
    user_id: str
    user_role: UserRole
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    category: str = Field(..., description="e.g., technical, billing, training")
    priority: TicketPriority = TicketPriority.MEDIUM
    status: TicketStatus = TicketStatus.OPEN
    attachments: Optional[List[str]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    assigned_to: Optional[str] = None

class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    assigned_to: Optional[str] = None
    response: Optional[str] = None

class TicketResponse(BaseModel):
    ticket_id: str
    responder_id: str
    responder_name: str
    message: str
    created_at: datetime
    attachments: Optional[List[str]] = []

class DocumentationPage(BaseModel):
    id: Optional[str] = None
    title: str
    content: str  # Markdown content
    role: Optional[UserRole] = None  # Role-specific content
    category: str
    tags: List[str] = []
    order: int = 0
    published: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class FAQItem(BaseModel):
    id: Optional[str] = None
    question: str
    answer: str  # Markdown content
    role: Optional[UserRole] = None
    category: str
    order: int = 0
    helpful_count: int = 0
    created_at: Optional[datetime] = None

# Database setup
def init_support_db():
    """Initialize SQLite database for support system"""
    db_path = Path("support.db")
    conn = sqlite3.connect(db_path)
    
    # Create tables
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS tickets (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            user_role TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            priority TEXT NOT NULL,
            status TEXT NOT NULL,
            attachments TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP,
            assigned_to TEXT
        );
        
        CREATE TABLE IF NOT EXISTS ticket_responses (
            id TEXT PRIMARY KEY,
            ticket_id TEXT NOT NULL,
            responder_id TEXT NOT NULL,
            responder_name TEXT NOT NULL,
            message TEXT NOT NULL,
            attachments TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES tickets (id)
        );
        
        CREATE TABLE IF NOT EXISTS documentation (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            role TEXT,
            category TEXT NOT NULL,
            tags TEXT,
            order_num INTEGER DEFAULT 0,
            published BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS faq (
            id TEXT PRIMARY KEY,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            role TEXT,
            category TEXT NOT NULL,
            order_num INTEGER DEFAULT 0,
            helpful_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
        CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
        CREATE INDEX IF NOT EXISTS idx_documentation_role ON documentation(role);
        CREATE INDEX IF NOT EXISTS idx_faq_role ON faq(role);
    """)
    
    conn.commit()
    conn.close()

# Initialize database
init_support_db()

# Database helper functions
def get_db_connection():
    """Get database connection"""
    return sqlite3.connect("support.db", detect_types=sqlite3.PARSE_DECLTYPES)

def dict_factory(cursor, row):
    """Convert SQLite row to dictionary"""
    return dict((col[0], row[idx]) for idx, col in enumerate(cursor.description))

# Authentication helper
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract user info from JWT token"""
    # TODO: Implement proper JWT validation
    # For now, return mock user
    return {
        "id": "user_123",
        "username": "testuser",
        "role": "doctor"
    }

# Support ticket endpoints
@support_app.post("/tickets", response_model=SupportTicket)
async def create_ticket(ticket: SupportTicket, current_user: dict = Depends(get_current_user)):
    """Create a new support ticket"""
    ticket.id = str(uuid.uuid4())
    ticket.user_id = current_user["id"]
    ticket.created_at = datetime.now()
    ticket.updated_at = datetime.now()
    
    conn = get_db_connection()
    try:
        conn.execute("""
            INSERT INTO tickets (id, user_id, user_role, title, description, category, 
                               priority, status, attachments)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ticket.id, ticket.user_id, ticket.user_role.value, ticket.title,
            ticket.description, ticket.category, ticket.priority.value,
            ticket.status.value, json.dumps(ticket.attachments or [])
        ))
        conn.commit()
        return ticket
    finally:
        conn.close()

@support_app.get("/tickets", response_model=List[SupportTicket])
async def get_tickets(
    status: Optional[TicketStatus] = None,
    user_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get tickets with optional filtering"""
    conn = get_db_connection()
    conn.row_factory = dict_factory
    
    try:
        query = "SELECT * FROM tickets WHERE 1=1"
        params = []
        
        # Filter by user if not admin
        if current_user["role"] != "admin":
            query += " AND user_id = ?"
            params.append(current_user["id"])
        elif user_id:
            query += " AND user_id = ?"
            params.append(user_id)
            
        if status:
            query += " AND status = ?"
            params.append(status.value)
            
        query += " ORDER BY created_at DESC"
        
        cursor = conn.execute(query, params)
        tickets = cursor.fetchall()
        
        # Convert to Pydantic models
        result = []
        for ticket in tickets:
            ticket['attachments'] = json.loads(ticket['attachments'] or '[]')
            ticket['user_role'] = UserRole(ticket['user_role'])
            ticket['priority'] = TicketPriority(ticket['priority'])
            ticket['status'] = TicketStatus(ticket['status'])
            result.append(SupportTicket(**ticket))
            
        return result
    finally:
        conn.close()

@support_app.get("/tickets/{ticket_id}", response_model=SupportTicket)
async def get_ticket(ticket_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific ticket by ID"""
    conn = get_db_connection()
    conn.row_factory = dict_factory
    
    try:
        cursor = conn.execute("SELECT * FROM tickets WHERE id = ?", (ticket_id,))
        ticket = cursor.fetchone()
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
            
        # Check permission
        if current_user["role"] != "admin" and ticket["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
            
        ticket['attachments'] = json.loads(ticket['attachments'] or '[]')
        ticket['user_role'] = UserRole(ticket['user_role'])
        ticket['priority'] = TicketPriority(ticket['priority'])
        ticket['status'] = TicketStatus(ticket['status'])
        
        return SupportTicket(**ticket)
    finally:
        conn.close()

@support_app.patch("/tickets/{ticket_id}", response_model=SupportTicket)
async def update_ticket(
    ticket_id: str, 
    update: TicketUpdate, 
    current_user: dict = Depends(get_current_user)
):
    """Update ticket status, priority, or assignment"""
    # Only admins can update tickets
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    conn = get_db_connection()
    try:
        # Build update query
        updates = []
        params = []
        
        if update.status:
            updates.append("status = ?")
            params.append(update.status.value)
            if update.status == TicketStatus.RESOLVED:
                updates.append("resolved_at = ?")
                params.append(datetime.now())
                
        if update.priority:
            updates.append("priority = ?")
            params.append(update.priority.value)
            
        if update.assigned_to:
            updates.append("assigned_to = ?")
            params.append(update.assigned_to)
            
        if not updates:
            raise HTTPException(status_code=400, detail="No updates provided")
            
        updates.append("updated_at = ?")
        params.append(datetime.now())
        params.append(ticket_id)
        
        query = f"UPDATE tickets SET {', '.join(updates)} WHERE id = ?"
        conn.execute(query, params)
        
        # Add response if provided
        if update.response:
            response_id = str(uuid.uuid4())
            conn.execute("""
                INSERT INTO ticket_responses (id, ticket_id, responder_id, responder_name, message)
                VALUES (?, ?, ?, ?, ?)
            """, (response_id, ticket_id, current_user["id"], current_user["username"], update.response))
        
        conn.commit()
        
        # Return updated ticket
        return await get_ticket(ticket_id, current_user)
    finally:
        conn.close()

@support_app.get("/tickets/{ticket_id}/responses", response_model=List[TicketResponse])
async def get_ticket_responses(ticket_id: str, current_user: dict = Depends(get_current_user)):
    """Get all responses for a ticket"""
    conn = get_db_connection()
    conn.row_factory = dict_factory
    
    try:
        cursor = conn.execute("""
            SELECT * FROM ticket_responses 
            WHERE ticket_id = ? 
            ORDER BY created_at ASC
        """, (ticket_id,))
        responses = cursor.fetchall()
        
        result = []
        for response in responses:
            response['attachments'] = json.loads(response['attachments'] or '[]')
            result.append(TicketResponse(**response))
            
        return result
    finally:
        conn.close()

# Documentation endpoints
@support_app.get("/documentation", response_model=List[DocumentationPage])
async def get_documentation(
    role: Optional[UserRole] = None,
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get documentation pages"""
    conn = get_db_connection()
    conn.row_factory = dict_factory
    
    try:
        query = "SELECT * FROM documentation WHERE published = 1"
        params = []
        
        if role:
            query += " AND (role IS NULL OR role = ?)"
            params.append(role.value)
        elif current_user["role"]:
            query += " AND (role IS NULL OR role = ?)"
            params.append(current_user["role"])
            
        if category:
            query += " AND category = ?"
            params.append(category)
            
        query += " ORDER BY order_num ASC, title ASC"
        
        cursor = conn.execute(query, params)
        docs = cursor.fetchall()
        
        result = []
        for doc in docs:
            doc['tags'] = json.loads(doc['tags'] or '[]')
            if doc['role']:
                doc['role'] = UserRole(doc['role'])
            result.append(DocumentationPage(**doc))
            
        return result
    finally:
        conn.close()

@support_app.get("/documentation/{doc_id}", response_model=DocumentationPage)
async def get_documentation_page(doc_id: str):
    """Get specific documentation page"""
    conn = get_db_connection()
    conn.row_factory = dict_factory
    
    try:
        cursor = conn.execute("SELECT * FROM documentation WHERE id = ? AND published = 1", (doc_id,))
        doc = cursor.fetchone()
        
        if not doc:
            raise HTTPException(status_code=404, detail="Documentation not found")
            
        doc['tags'] = json.loads(doc['tags'] or '[]')
        if doc['role']:
            doc['role'] = UserRole(doc['role'])
            
        return DocumentationPage(**doc)
    finally:
        conn.close()

# FAQ endpoints
@support_app.get("/faq", response_model=List[FAQItem])
async def get_faq(
    role: Optional[UserRole] = None,
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get FAQ items"""
    conn = get_db_connection()
    conn.row_factory = dict_factory
    
    try:
        query = "SELECT * FROM faq WHERE 1=1"
        params = []
        
        if role:
            query += " AND (role IS NULL OR role = ?)"
            params.append(role.value)
        elif current_user["role"]:
            query += " AND (role IS NULL OR role = ?)"
            params.append(current_user["role"])
            
        if category:
            query += " AND category = ?"
            params.append(category)
            
        query += " ORDER BY order_num ASC, helpful_count DESC"
        
        cursor = conn.execute(query, params)
        faqs = cursor.fetchall()
        
        result = []
        for faq in faqs:
            if faq['role']:
                faq['role'] = UserRole(faq['role'])
            result.append(FAQItem(**faq))
            
        return result
    finally:
        conn.close()

# Health check
@support_app.get("/health")
async def support_health_check():
    """Health check for support service"""
    return {
        "status": "healthy",
        "service": "erlessed-support",
        "timestamp": datetime.now().isoformat()
    }

# Initialize with sample data
@support_app.on_event("startup")
async def initialize_support_data():
    """Initialize support system with sample documentation and FAQ"""
    conn = get_db_connection()
    
    try:
        # Check if data already exists
        cursor = conn.execute("SELECT COUNT(*) FROM documentation")
        if cursor.fetchone()[0] > 0:
            return
            
        # Sample documentation
        sample_docs = [
            {
                "id": str(uuid.uuid4()),
                "title": "Doctor Onboarding Guide",
                "content": """# Doctor Onboarding Guide

## Getting Started with Erlessed

### Step 1: Account Setup
1. Complete your professional license verification
2. Set up biometric authentication
3. Configure notification preferences

### Step 2: Patient Management
- Learn how to use the patient queue system
- Understand triage prioritization
- Practice biometric patient verification

### Step 3: Clinical Documentation
- ICD-10 code suggestions
- AI-powered diagnosis support
- Electronic prescription workflow

### Step 4: Claims Processing
- Real-time preauthorization
- Documentation requirements
- Claim submission process
""",
                "role": "doctor",
                "category": "onboarding",
                "tags": '["onboarding", "clinical", "workflow"]',
                "order_num": 1,
                "published": 1
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Insurer Claim Appeal Process",
                "content": """# Claim Appeal Process

## Understanding Appeals

### When to Appeal
- Claim denial with clinical justification
- Incorrect benefit calculations
- Missing pre-authorization

### Appeal Workflow
1. Review denial reason
2. Gather supporting documentation
3. Submit appeal through portal
4. Track appeal status
5. Review final determination

### Required Documentation
- Medical records
- Clinical notes
- Treatment plans
- Outcome reports

### Timeframes
- Initial appeal: 30 days
- Peer review: 15 days
- Final determination: 45 days
""",
                "role": "insurer",
                "category": "appeals",
                "tags": '["appeals", "claims", "process"]',
                "order_num": 1,
                "published": 1
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Pharmacist Verification Flow",
                "content": """# Pharmacist Verification Flow

## Prescription Validation

### Step 1: Patient Verification
- Biometric verification
- Insurance eligibility check
- Dependent validation

### Step 2: Prescription Checks
- Drug interaction analysis
- Dosage validation
- Allergy screening
- Formulary compliance

### Step 3: Dispensing Process
- Medication preparation
- Patient counseling
- Compliance documentation
- Claim submission

### Step 4: Quality Assurance
- Double-check verification
- Patient education
- Follow-up scheduling

### Common Issues
- Benefit exhaustion
- Prior authorization required
- Generic substitution rules
""",
                "role": "pharmacist",
                "category": "verification",
                "tags": '["pharmacy", "verification", "dispensing"]',
                "order_num": 1,
                "published": 1
            }
        ]
        
        for doc in sample_docs:
            conn.execute("""
                INSERT INTO documentation (id, title, content, role, category, tags, order_num, published)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (doc["id"], doc["title"], doc["content"], doc["role"], doc["category"], 
                  doc["tags"], doc["order_num"], doc["published"]))
        
        # Sample FAQ
        sample_faqs = [
            {
                "id": str(uuid.uuid4()),
                "question": "How do I reset my biometric authentication?",
                "answer": "Contact your system administrator or submit a support ticket. Biometric resets require identity verification for security.",
                "role": None,
                "category": "authentication",
                "order_num": 1
            },
            {
                "id": str(uuid.uuid4()),
                "question": "What should I do if a claim is denied?",
                "answer": "Review the denial reason, gather additional documentation if needed, and submit an appeal through the appeals portal within 30 days.",
                "role": "doctor",
                "category": "claims",
                "order_num": 2
            },
            {
                "id": str(uuid.uuid4()),
                "question": "How do I check if a medication is covered?",
                "answer": "Use the formulary lookup tool in the pharmacy dashboard or check the patient's benefit summary.",
                "role": "pharmacist",
                "category": "benefits",
                "order_num": 1
            }
        ]
        
        for faq in sample_faqs:
            conn.execute("""
                INSERT INTO faq (id, question, answer, role, category, order_num)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (faq["id"], faq["question"], faq["answer"], faq["role"], 
                  faq["category"], faq["order_num"]))
        
        conn.commit()
        print("✅ Support system initialized with sample data")
        
    except Exception as e:
        print(f"❌ Error initializing support data: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(support_app, host="0.0.0.0", port=8002, log_level="info")