"""
Erlessed HMS Integration Microservice
Secure FastAPI service for hospital management system integration
"""

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import os
import logging
from datetime import datetime, timedelta
import asyncio
import httpx
import json
import pandas as pd
from defusedxml.ElementTree import fromstring as ET_fromstring
from jose import JWTError, jwt
from passlib.context import CryptContext
import aiofiles
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, DateTime, JSON, Boolean, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import sessionmaker
import uuid
import hashlib
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app initialization
app = FastAPI(
    title="Erlessed HMS Integration Service",
    description="Secure microservice for hospital management system integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Security configuration
SECRET_KEY = os.getenv("HMS_SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Pydantic models for API requests/responses
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class HMSCredentials(BaseModel):
    system_type: str = Field(..., description="HMS type: openmrs, afyapro, custom")
    base_url: str = Field(..., description="HMS base URL")
    username: str
    password: str
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    oauth_endpoint: Optional[str] = None

class PatientConsent(BaseModel):
    patient_id: str
    consent_type: str = Field(..., description="data_sync, analytics, sharing")
    fingerprint_hash: Optional[str] = None
    otp_code: Optional[str] = None
    granted_by: str
    expires_at: Optional[datetime] = None

class SyncRequest(BaseModel):
    hms_credentials: HMSCredentials
    patient_ids: Optional[List[str]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    include_vitals: bool = True
    include_labs: bool = True
    include_prescriptions: bool = True
    include_diagnoses: bool = True

class VitalSigns(BaseModel):
    patient_id: str
    encounter_id: Optional[str] = None
    timestamp: datetime
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None
    heart_rate: Optional[float] = None
    temperature: Optional[float] = None
    respiratory_rate: Optional[float] = None
    oxygen_saturation: Optional[float] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    bmi: Optional[float] = None
    recorded_by: Optional[str] = None

class LabResult(BaseModel):
    patient_id: str
    order_id: Optional[str] = None
    test_name: str
    test_code: Optional[str] = None
    result_value: Optional[str] = None
    result_numeric: Optional[float] = None
    reference_range: Optional[str] = None
    units: Optional[str] = None
    status: str = Field(default="completed", description="pending, completed, cancelled")
    ordered_date: datetime
    result_date: Optional[datetime] = None
    ordered_by: Optional[str] = None
    resulted_by: Optional[str] = None

class Prescription(BaseModel):
    patient_id: str
    encounter_id: Optional[str] = None
    medication_name: str
    medication_code: Optional[str] = None
    dosage: str
    frequency: str
    duration: Optional[str] = None
    quantity: Optional[float] = None
    instructions: Optional[str] = None
    prescribed_date: datetime
    prescribed_by: str
    status: str = Field(default="active", description="active, completed, cancelled")

class Diagnosis(BaseModel):
    patient_id: str
    encounter_id: Optional[str] = None
    diagnosis_code: str
    diagnosis_name: str
    diagnosis_type: str = Field(default="primary", description="primary, secondary, differential")
    status: str = Field(default="confirmed", description="confirmed, provisional, ruled_out")
    diagnosed_date: datetime
    diagnosed_by: str

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    return token_data

# HMS Integration classes
class BaseHMSClient:
    """Base class for HMS system clients"""
    
    def __init__(self, credentials: HMSCredentials):
        self.credentials = credentials
        self.base_url = credentials.base_url.rstrip('/')
        self.session = None
        self.token = None
        
    async def authenticate(self):
        """Authenticate with HMS system"""
        raise NotImplementedError
        
    async def get_vitals(self, patient_ids: List[str], date_from: datetime = None, date_to: datetime = None) -> List[VitalSigns]:
        """Fetch vital signs from HMS"""
        raise NotImplementedError
        
    async def get_lab_results(self, patient_ids: List[str], date_from: datetime = None, date_to: datetime = None) -> List[LabResult]:
        """Fetch lab results from HMS"""
        raise NotImplementedError
        
    async def get_prescriptions(self, patient_ids: List[str], date_from: datetime = None, date_to: datetime = None) -> List[Prescription]:
        """Fetch prescriptions from HMS"""
        raise NotImplementedError
        
    async def get_diagnoses(self, patient_ids: List[str], date_from: datetime = None, date_to: datetime = None) -> List[Diagnosis]:
        """Fetch diagnoses from HMS"""
        raise NotImplementedError

class OpenMRSClient(BaseHMSClient):
    """OpenMRS HMS client implementation"""
    
    async def authenticate(self):
        """Authenticate with OpenMRS using session-based auth"""
        async with httpx.AsyncClient() as client:
            auth_url = f"{self.base_url}/ws/rest/v1/session"
            auth_data = {
                "username": self.credentials.username,
                "password": self.credentials.password
            }
            
            response = await client.post(auth_url, json=auth_data)
            if response.status_code == 200:
                session_data = response.json()
                self.token = session_data.get("sessionId")
                logger.info("Successfully authenticated with OpenMRS")
                return True
            else:
                logger.error(f"OpenMRS authentication failed: {response.status_code}")
                return False
    
    async def get_vitals(self, patient_ids: List[str], date_from: datetime = None, date_to: datetime = None) -> List[VitalSigns]:
        """Fetch vital signs from OpenMRS"""
        vitals = []
        
        async with httpx.AsyncClient() as client:
            headers = {"Cookie": f"JSESSIONID={self.token}"} if self.token else {}
            
            for patient_id in patient_ids:
                url = f"{self.base_url}/ws/rest/v1/patient/{patient_id}/encounter"
                response = await client.get(url, headers=headers)
                
                if response.status_code == 200:
                    encounters = response.json().get("results", [])
                    
                    for encounter in encounters:
                        # Extract vital signs from encounter observations
                        obs_url = f"{self.base_url}/ws/rest/v1/encounter/{encounter['uuid']}/obs"
                        obs_response = await client.get(obs_url, headers=headers)
                        
                        if obs_response.status_code == 200:
                            observations = obs_response.json().get("results", [])
                            
                            vital_data = {
                                "patient_id": patient_id,
                                "encounter_id": encounter["uuid"],
                                "timestamp": datetime.fromisoformat(encounter["encounterDatetime"].replace("Z", "+00:00")),
                            }
                            
                            # Map OpenMRS concepts to vital signs
                            concept_mapping = {
                                "5085": "systolic_bp",
                                "5086": "diastolic_bp",
                                "5087": "heart_rate",
                                "5088": "temperature",
                                "5242": "respiratory_rate",
                                "5092": "oxygen_saturation",
                                "5089": "weight",
                                "5090": "height"
                            }
                            
                            for obs in observations:
                                concept_id = obs.get("concept", {}).get("uuid", "")
                                if concept_id in concept_mapping:
                                    field_name = concept_mapping[concept_id]
                                    vital_data[field_name] = float(obs.get("value", 0))
                            
                            if len(vital_data) > 3:  # More than just basic fields
                                vitals.append(VitalSigns(**vital_data))
        
        return vitals

class AfyaProClient(BaseHMSClient):
    """AfyaPro HMS client implementation"""
    
    async def authenticate(self):
        """Authenticate with AfyaPro using OAuth2"""
        if not self.credentials.oauth_endpoint:
            logger.error("OAuth endpoint required for AfyaPro")
            return False
            
        async with httpx.AsyncClient() as client:
            token_data = {
                "grant_type": "client_credentials",
                "client_id": self.credentials.client_id,
                "client_secret": self.credentials.client_secret
            }
            
            response = await client.post(self.credentials.oauth_endpoint, data=token_data)
            if response.status_code == 200:
                token_info = response.json()
                self.token = token_info.get("access_token")
                logger.info("Successfully authenticated with AfyaPro")
                return True
            else:
                logger.error(f"AfyaPro authentication failed: {response.status_code}")
                return False

class CustomEMRClient(BaseHMSClient):
    """Custom EMR client implementation"""
    
    async def authenticate(self):
        """Authenticate with custom EMR using token-based auth"""
        async with httpx.AsyncClient() as client:
            auth_url = f"{self.base_url}/api/auth/login"
            auth_data = {
                "username": self.credentials.username,
                "password": self.credentials.password
            }
            
            response = await client.post(auth_url, json=auth_data)
            if response.status_code == 200:
                auth_result = response.json()
                self.token = auth_result.get("token")
                logger.info("Successfully authenticated with Custom EMR")
                return True
            else:
                logger.error(f"Custom EMR authentication failed: {response.status_code}")
                return False

# Factory function to create HMS clients
def create_hms_client(credentials: HMSCredentials) -> BaseHMSClient:
    """Factory function to create appropriate HMS client"""
    if credentials.system_type.lower() == "openmrs":
        return OpenMRSClient(credentials)
    elif credentials.system_type.lower() == "afyapro":
        return AfyaProClient(credentials)
    elif credentials.system_type.lower() == "custom":
        return CustomEMRClient(credentials)
    else:
        raise ValueError(f"Unsupported HMS type: {credentials.system_type}")

# Database functions for data normalization and storage
from database_mapper import ErlessedDatabaseMapper

db_mapper = ErlessedDatabaseMapper()

async def store_vitals(vitals: List[VitalSigns]) -> int:
    """Store vital signs in Erlessed database"""
    return await db_mapper.store_vitals(vitals)

async def store_lab_results(lab_results: List[LabResult]) -> int:
    """Store lab results in Erlessed database"""
    return await db_mapper.store_lab_results(lab_results)

async def store_prescriptions(prescriptions: List[Prescription]) -> int:
    """Store prescriptions in Erlessed database"""
    return await db_mapper.store_prescriptions(prescriptions)

async def store_diagnoses(diagnoses: List[Diagnosis]) -> int:
    """Store diagnoses in Erlessed database"""
    return await db_mapper.store_diagnoses(diagnoses)

# File processing functions for CSV/XML fallback
async def process_csv_file(file_content: bytes, data_type: str) -> List[Dict]:
    """Process CSV file and return structured data"""
    try:
        df = pd.read_csv(io.BytesIO(file_content))
        return df.to_dict('records')
    except Exception as e:
        logger.error(f"CSV processing error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {e}")

async def process_xml_file(file_content: bytes, data_type: str) -> List[Dict]:
    """Process XML file and return structured data"""
    try:
        root = ET_fromstring(file_content)
        data = []
        
        # Basic XML parsing - customize based on your XML structure
        for item in root.findall('.//record'):
            record = {}
            for child in item:
                record[child.tag] = child.text
            data.append(record)
        
        return data
    except Exception as e:
        logger.error(f"XML processing error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid XML format: {e}")

# Consent management functions
async def log_patient_consent(consent: PatientConsent):
    """Log patient consent for data synchronization"""
    return await db_mapper.log_patient_consent(
        consent.patient_id,
        consent.consent_type,
        consent.fingerprint_hash,
        consent.otp_code,
        consent.granted_by,
        consent.expires_at
    )

async def verify_patient_consent(patient_id: str, consent_type: str) -> bool:
    """Verify if patient has granted consent for data synchronization"""
    return await db_mapper.verify_patient_consent(patient_id, consent_type)

@app.get("/")
async def root():
    return {
        "service": "Erlessed HMS Integration Service",
        "version": "1.0.0",
        "status": "active",
        "supported_systems": ["OpenMRS", "AfyaPro", "Custom EMR"]
    }

# API Endpoints for HMS Integration

@app.post("/auth/token")
async def get_access_token(username: str, password: str):
    """Obtain access token for HMS integration service"""
    # Simplified authentication for demo - implement proper validation
    if username == "hms_admin" and password == "secure_password":
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": username}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.post("/consent/log")
async def log_consent(consent: PatientConsent, current_user: TokenData = Depends(get_current_user)):
    """Log patient consent for data synchronization"""
    try:
        consent_hash = await log_patient_consent(consent)
        return {
            "status": "success",
            "consent_hash": consent_hash,
            "patient_id": consent.patient_id,
            "consent_type": consent.consent_type,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Consent logging error: {e}")
        raise HTTPException(status_code=500, detail="Failed to log consent")

@app.get("/consent/verify/{patient_id}")
async def verify_consent(patient_id: str, consent_type: str, current_user: TokenData = Depends(get_current_user)):
    """Verify patient consent for data synchronization"""
    try:
        is_valid = await verify_patient_consent(patient_id, consent_type)
        return {
            "patient_id": patient_id,
            "consent_type": consent_type,
            "is_valid": is_valid,
            "checked_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Consent verification error: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify consent")

@app.post("/sync/vitals")
async def sync_vitals(sync_request: SyncRequest, current_user: TokenData = Depends(get_current_user)):
    """Sync vital signs from HMS to Erlessed database"""
    try:
        # Verify patient consent
        if sync_request.patient_ids:
            for patient_id in sync_request.patient_ids:
                if not await verify_patient_consent(patient_id, "data_sync"):
                    raise HTTPException(
                        status_code=403,
                        detail=f"Patient {patient_id} has not granted consent for data synchronization"
                    )
        
        # Create HMS client and authenticate
        hms_client = create_hms_client(sync_request.hms_credentials)
        auth_success = await hms_client.authenticate()
        
        if not auth_success:
            raise HTTPException(status_code=401, detail="HMS authentication failed")
        
        # Fetch vital signs
        vitals = await hms_client.get_vitals(
            sync_request.patient_ids or [],
            sync_request.date_from,
            sync_request.date_to
        )
        
        # Store in Erlessed database
        await store_vitals(vitals)
        
        return {
            "status": "success",
            "records_synced": len(vitals),
            "sync_type": "vitals",
            "timestamp": datetime.utcnow().isoformat(),
            "hms_system": sync_request.hms_credentials.system_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Vitals sync error: {e}")
        raise HTTPException(status_code=500, detail=f"Vitals synchronization failed: {str(e)}")

@app.post("/sync/labs")
async def sync_lab_results(sync_request: SyncRequest, current_user: TokenData = Depends(get_current_user)):
    """Sync lab results from HMS to Erlessed database"""
    try:
        # Verify patient consent
        if sync_request.patient_ids:
            for patient_id in sync_request.patient_ids:
                if not await verify_patient_consent(patient_id, "data_sync"):
                    raise HTTPException(
                        status_code=403,
                        detail=f"Patient {patient_id} has not granted consent for data synchronization"
                    )
        
        # Create HMS client and authenticate
        hms_client = create_hms_client(sync_request.hms_credentials)
        auth_success = await hms_client.authenticate()
        
        if not auth_success:
            raise HTTPException(status_code=401, detail="HMS authentication failed")
        
        # Fetch lab results
        lab_results = await hms_client.get_lab_results(
            sync_request.patient_ids or [],
            sync_request.date_from,
            sync_request.date_to
        )
        
        # Store in Erlessed database
        await store_lab_results(lab_results)
        
        return {
            "status": "success",
            "records_synced": len(lab_results),
            "sync_type": "lab_results",
            "timestamp": datetime.utcnow().isoformat(),
            "hms_system": sync_request.hms_credentials.system_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Lab results sync error: {e}")
        raise HTTPException(status_code=500, detail=f"Lab results synchronization failed: {str(e)}")

@app.post("/sync/prescriptions")
async def sync_prescriptions(sync_request: SyncRequest, current_user: TokenData = Depends(get_current_user)):
    """Sync prescriptions from HMS to Erlessed database"""
    try:
        # Verify patient consent
        if sync_request.patient_ids:
            for patient_id in sync_request.patient_ids:
                if not await verify_patient_consent(patient_id, "data_sync"):
                    raise HTTPException(
                        status_code=403,
                        detail=f"Patient {patient_id} has not granted consent for data synchronization"
                    )
        
        # Create HMS client and authenticate
        hms_client = create_hms_client(sync_request.hms_credentials)
        auth_success = await hms_client.authenticate()
        
        if not auth_success:
            raise HTTPException(status_code=401, detail="HMS authentication failed")
        
        # Fetch prescriptions
        prescriptions = await hms_client.get_prescriptions(
            sync_request.patient_ids or [],
            sync_request.date_from,
            sync_request.date_to
        )
        
        # Store in Erlessed database
        await store_prescriptions(prescriptions)
        
        return {
            "status": "success",
            "records_synced": len(prescriptions),
            "sync_type": "prescriptions",
            "timestamp": datetime.utcnow().isoformat(),
            "hms_system": sync_request.hms_credentials.system_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prescriptions sync error: {e}")
        raise HTTPException(status_code=500, detail=f"Prescriptions synchronization failed: {str(e)}")

@app.post("/sync/diagnoses")
async def sync_diagnoses(sync_request: SyncRequest, current_user: TokenData = Depends(get_current_user)):
    """Sync diagnoses from HMS to Erlessed database"""
    try:
        # Verify patient consent
        if sync_request.patient_ids:
            for patient_id in sync_request.patient_ids:
                if not await verify_patient_consent(patient_id, "data_sync"):
                    raise HTTPException(
                        status_code=403,
                        detail=f"Patient {patient_id} has not granted consent for data synchronization"
                    )
        
        # Create HMS client and authenticate
        hms_client = create_hms_client(sync_request.hms_credentials)
        auth_success = await hms_client.authenticate()
        
        if not auth_success:
            raise HTTPException(status_code=401, detail="HMS authentication failed")
        
        # Fetch diagnoses
        diagnoses = await hms_client.get_diagnoses(
            sync_request.patient_ids or [],
            sync_request.date_from,
            sync_request.date_to
        )
        
        # Store in Erlessed database
        await store_diagnoses(diagnoses)
        
        return {
            "status": "success",
            "records_synced": len(diagnoses),
            "sync_type": "diagnoses",
            "timestamp": datetime.utcnow().isoformat(),
            "hms_system": sync_request.hms_credentials.system_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Diagnoses sync error: {e}")
        raise HTTPException(status_code=500, detail=f"Diagnoses synchronization failed: {str(e)}")

@app.post("/sync/bulk")
async def bulk_sync(sync_request: SyncRequest, current_user: TokenData = Depends(get_current_user)):
    """Perform bulk synchronization of all data types"""
    try:
        # Verify patient consent
        if sync_request.patient_ids:
            for patient_id in sync_request.patient_ids:
                if not await verify_patient_consent(patient_id, "data_sync"):
                    raise HTTPException(
                        status_code=403,
                        detail=f"Patient {patient_id} has not granted consent for data synchronization"
                    )
        
        # Create HMS client and authenticate
        hms_client = create_hms_client(sync_request.hms_credentials)
        auth_success = await hms_client.authenticate()
        
        if not auth_success:
            raise HTTPException(status_code=401, detail="HMS authentication failed")
        
        sync_results = {}
        total_records = 0
        
        # Sync vitals if requested
        if sync_request.include_vitals:
            vitals = await hms_client.get_vitals(
                sync_request.patient_ids or [],
                sync_request.date_from,
                sync_request.date_to
            )
            await store_vitals(vitals)
            sync_results["vitals"] = len(vitals)
            total_records += len(vitals)
        
        # Sync lab results if requested
        if sync_request.include_labs:
            lab_results = await hms_client.get_lab_results(
                sync_request.patient_ids or [],
                sync_request.date_from,
                sync_request.date_to
            )
            await store_lab_results(lab_results)
            sync_results["lab_results"] = len(lab_results)
            total_records += len(lab_results)
        
        # Sync prescriptions if requested
        if sync_request.include_prescriptions:
            prescriptions = await hms_client.get_prescriptions(
                sync_request.patient_ids or [],
                sync_request.date_from,
                sync_request.date_to
            )
            await store_prescriptions(prescriptions)
            sync_results["prescriptions"] = len(prescriptions)
            total_records += len(prescriptions)
        
        # Sync diagnoses if requested
        if sync_request.include_diagnoses:
            diagnoses = await hms_client.get_diagnoses(
                sync_request.patient_ids or [],
                sync_request.date_from,
                sync_request.date_to
            )
            await store_diagnoses(diagnoses)
            sync_results["diagnoses"] = len(diagnoses)
            total_records += len(diagnoses)
        
        return {
            "status": "success",
            "total_records_synced": total_records,
            "sync_breakdown": sync_results,
            "sync_type": "bulk",
            "timestamp": datetime.utcnow().isoformat(),
            "hms_system": sync_request.hms_credentials.system_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bulk sync error: {e}")
        raise HTTPException(status_code=500, detail=f"Bulk synchronization failed: {str(e)}")

# File-based sync endpoints for CSV/XML fallback
@app.post("/sync/file/vitals")
async def sync_vitals_from_file(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """Sync vital signs from uploaded CSV/XML file"""
    try:
        file_content = await file.read()
        
        if file.filename.endswith('.csv'):
            data = await process_csv_file(file_content, "vitals")
        elif file.filename.endswith('.xml'):
            data = await process_xml_file(file_content, "vitals")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or XML")
        
        # Convert to VitalSigns objects and store
        vitals = []
        for record in data:
            try:
                vital = VitalSigns(
                    patient_id=record.get("patient_id", ""),
                    timestamp=datetime.fromisoformat(record.get("timestamp", datetime.utcnow().isoformat())),
                    systolic_bp=float(record.get("systolic_bp", 0)) if record.get("systolic_bp") else None,
                    diastolic_bp=float(record.get("diastolic_bp", 0)) if record.get("diastolic_bp") else None,
                    heart_rate=float(record.get("heart_rate", 0)) if record.get("heart_rate") else None,
                    temperature=float(record.get("temperature", 0)) if record.get("temperature") else None,
                    # Add other fields as needed
                )
                vitals.append(vital)
            except Exception as e:
                logger.warning(f"Skipping invalid vital record: {e}")
        
        await store_vitals(vitals)
        
        return {
            "status": "success",
            "records_processed": len(data),
            "records_stored": len(vitals),
            "sync_type": "file_vitals",
            "filename": file.filename,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File vitals sync error: {e}")
        raise HTTPException(status_code=500, detail=f"File vitals sync failed: {str(e)}")

@app.post("/sync/file/labs")
async def sync_labs_from_file(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """Sync lab results from uploaded CSV/XML file"""
    try:
        file_content = await file.read()
        
        if file.filename.endswith('.csv'):
            data = await process_csv_file(file_content, "labs")
        elif file.filename.endswith('.xml'):
            data = await process_xml_file(file_content, "labs")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or XML")
        
        # Convert to LabResult objects and store
        lab_results = []
        for record in data:
            try:
                lab_result = LabResult(
                    patient_id=record.get("patient_id", ""),
                    test_name=record.get("test_name", ""),
                    ordered_date=datetime.fromisoformat(record.get("ordered_date", datetime.utcnow().isoformat())),
                    result_value=record.get("result_value"),
                    result_numeric=float(record.get("result_numeric", 0)) if record.get("result_numeric") else None,
                    # Add other fields as needed
                )
                lab_results.append(lab_result)
            except Exception as e:
                logger.warning(f"Skipping invalid lab record: {e}")
        
        await store_lab_results(lab_results)
        
        return {
            "status": "success",
            "records_processed": len(data),
            "records_stored": len(lab_results),
            "sync_type": "file_labs",
            "filename": file.filename,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File labs sync error: {e}")
        raise HTTPException(status_code=500, detail=f"File labs sync failed: {str(e)}")

@app.get("/sync/status")
async def get_sync_status(current_user: TokenData = Depends(get_current_user)):
    """Get synchronization status and statistics"""
    try:
        # Return sync statistics and status
        return {
            "service_status": "active",
            "last_sync": datetime.utcnow().isoformat(),
            "supported_systems": ["OpenMRS", "AfyaPro", "Custom EMR"],
            "supported_formats": ["REST API", "FHIR", "CSV", "XML"],
            "sync_endpoints": [
                "/sync/vitals",
                "/sync/labs", 
                "/sync/prescriptions",
                "/sync/diagnoses",
                "/sync/bulk"
            ],
            "file_endpoints": [
                "/sync/file/vitals",
                "/sync/file/labs"
            ],
            "consent_required": True,
            "authentication": "Bearer token required"
        }
    except Exception as e:
        logger.error(f"Status check error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get sync status")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected" if DATABASE_URL else "not configured"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)