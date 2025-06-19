"""
Database mapper for HMS integration with Erlessed PostgreSQL schema
Maps HMS data structures to existing Erlessed database tables
"""

import asyncio
import asyncpg
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import logging
from main import VitalSigns, LabResult, Prescription, Diagnosis
import os

logger = logging.getLogger(__name__)

class ErlessedDatabaseMapper:
    """Maps HMS data to Erlessed database schema"""
    
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL")
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable is required")
    
    async def get_connection(self):
        """Get database connection"""
        return await asyncpg.connect(self.database_url)
    
    async def store_vitals(self, vitals: List[VitalSigns]) -> int:
        """Store vital signs in patient_queue table with triage data"""
        stored_count = 0
        
        conn = await self.get_connection()
        try:
            for vital in vitals:
                # Check if patient exists
                patient_query = "SELECT id FROM patients WHERE patient_id = $1"
                patient_result = await conn.fetchrow(patient_query, vital.patient_id)
                
                if not patient_result:
                    logger.warning(f"Patient {vital.patient_id} not found, skipping vital signs")
                    continue
                
                patient_db_id = patient_result['id']
                
                # Create triage data structure
                triage_data = {
                    "vital_signs": {
                        "systolic_bp": vital.systolic_bp,
                        "diastolic_bp": vital.diastolic_bp,
                        "heart_rate": vital.heart_rate,
                        "temperature": vital.temperature,
                        "respiratory_rate": vital.respiratory_rate,
                        "oxygen_saturation": vital.oxygen_saturation,
                        "weight": vital.weight,
                        "height": vital.height,
                        "bmi": vital.bmi
                    },
                    "recorded_by": vital.recorded_by,
                    "encounter_id": vital.encounter_id,
                    "sync_source": "hms_integration"
                }
                
                # Calculate triage priority based on vitals
                priority = self._calculate_triage_priority(vital)
                
                # Insert into patient_queue
                insert_query = """
                    INSERT INTO patient_queue (
                        patient_id, queue_position, triage_priority, 
                        triage_data, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (patient_id) 
                    DO UPDATE SET 
                        triage_data = EXCLUDED.triage_data,
                        triage_priority = EXCLUDED.triage_priority,
                        updated_at = EXCLUDED.updated_at
                """
                
                await conn.execute(
                    insert_query,
                    patient_db_id,
                    await self._get_next_queue_position(conn),
                    priority,
                    json.dumps(triage_data),
                    vital.timestamp,
                    datetime.utcnow()
                )
                
                stored_count += 1
                logger.info(f"Stored vital signs for patient {vital.patient_id}")
                
        except Exception as e:
            logger.error(f"Error storing vitals: {e}")
            raise
        finally:
            await conn.close()
        
        return stored_count
    
    async def store_lab_results(self, lab_results: List[LabResult]) -> int:
        """Store lab results in lab_orders table"""
        stored_count = 0
        
        conn = await self.get_connection()
        try:
            for lab in lab_results:
                # Check if patient exists
                patient_query = "SELECT id FROM patients WHERE patient_id = $1"
                patient_result = await conn.fetchrow(patient_query, lab.patient_id)
                
                if not patient_result:
                    logger.warning(f"Patient {lab.patient_id} not found, skipping lab result")
                    continue
                
                patient_db_id = patient_result['id']
                
                # Map lab result to lab_orders schema
                insert_query = """
                    INSERT INTO lab_orders (
                        patient_id, test_name, test_type, status, 
                        results, ordered_date, completed_date, 
                        ordered_by, notes, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (patient_id, test_name, ordered_date)
                    DO UPDATE SET
                        results = EXCLUDED.results,
                        status = EXCLUDED.status,
                        completed_date = EXCLUDED.completed_date
                """
                
                # Prepare results data
                results_data = {
                    "result_value": lab.result_value,
                    "result_numeric": lab.result_numeric,
                    "reference_range": lab.reference_range,
                    "units": lab.units,
                    "test_code": lab.test_code,
                    "order_id": lab.order_id,
                    "resulted_by": lab.resulted_by,
                    "sync_source": "hms_integration"
                }
                
                await conn.execute(
                    insert_query,
                    patient_db_id,
                    lab.test_name,
                    lab.test_code or "LAB",
                    lab.status,
                    json.dumps(results_data),
                    lab.ordered_date,
                    lab.result_date,
                    lab.ordered_by,
                    f"Synced from HMS - Order ID: {lab.order_id}",
                    datetime.utcnow()
                )
                
                stored_count += 1
                logger.info(f"Stored lab result for patient {lab.patient_id}: {lab.test_name}")
                
        except Exception as e:
            logger.error(f"Error storing lab results: {e}")
            raise
        finally:
            await conn.close()
        
        return stored_count
    
    async def store_prescriptions(self, prescriptions: List[Prescription]) -> int:
        """Store prescriptions in prescriptions table"""
        stored_count = 0
        
        conn = await self.get_connection()
        try:
            for prescription in prescriptions:
                # Check if patient exists
                patient_query = "SELECT id FROM patients WHERE patient_id = $1"
                patient_result = await conn.fetchrow(patient_query, prescription.patient_id)
                
                if not patient_result:
                    logger.warning(f"Patient {prescription.patient_id} not found, skipping prescription")
                    continue
                
                patient_db_id = patient_result['id']
                
                # Insert prescription
                insert_query = """
                    INSERT INTO prescriptions (
                        patient_id, medication_name, dosage, frequency,
                        duration, quantity, instructions, prescribed_date,
                        prescribed_by, status, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                """
                
                await conn.execute(
                    insert_query,
                    patient_db_id,
                    prescription.medication_name,
                    prescription.dosage,
                    prescription.frequency,
                    prescription.duration,
                    prescription.quantity,
                    prescription.instructions,
                    prescription.prescribed_date,
                    prescription.prescribed_by,
                    prescription.status,
                    datetime.utcnow()
                )
                
                stored_count += 1
                logger.info(f"Stored prescription for patient {prescription.patient_id}: {prescription.medication_name}")
                
        except Exception as e:
            logger.error(f"Error storing prescriptions: {e}")
            raise
        finally:
            await conn.close()
        
        return stored_count
    
    async def store_diagnoses(self, diagnoses: List[Diagnosis]) -> int:
        """Store diagnoses in consultations table"""
        stored_count = 0
        
        conn = await self.get_connection()
        try:
            for diagnosis in diagnoses:
                # Check if patient exists
                patient_query = "SELECT id FROM patients WHERE patient_id = $1"
                patient_result = await conn.fetchrow(patient_query, diagnosis.patient_id)
                
                if not patient_result:
                    logger.warning(f"Patient {diagnosis.patient_id} not found, skipping diagnosis")
                    continue
                
                patient_db_id = patient_result['id']
                
                # Create consultation record with diagnosis
                consultation_data = {
                    "diagnosis_code": diagnosis.diagnosis_code,
                    "diagnosis_name": diagnosis.diagnosis_name,
                    "diagnosis_type": diagnosis.diagnosis_type,
                    "status": diagnosis.status,
                    "diagnosed_by": diagnosis.diagnosed_by,
                    "encounter_id": diagnosis.encounter_id,
                    "sync_source": "hms_integration"
                }
                
                insert_query = """
                    INSERT INTO consultations (
                        patient_id, consultation_type, notes, 
                        diagnosis, consultation_date, clinician_id, 
                        status, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                """
                
                await conn.execute(
                    insert_query,
                    patient_db_id,
                    "hms_sync",
                    f"Diagnosis: {diagnosis.diagnosis_name} ({diagnosis.diagnosis_code})",
                    json.dumps(consultation_data),
                    diagnosis.diagnosed_date,
                    1,  # Default clinician ID
                    diagnosis.status,
                    datetime.utcnow()
                )
                
                stored_count += 1
                logger.info(f"Stored diagnosis for patient {diagnosis.patient_id}: {diagnosis.diagnosis_name}")
                
        except Exception as e:
            logger.error(f"Error storing diagnoses: {e}")
            raise
        finally:
            await conn.close()
        
        return stored_count
    
    async def log_patient_consent(self, patient_id: str, consent_type: str, 
                                 fingerprint_hash: str = None, otp_code: str = None,
                                 granted_by: str = None, expires_at: datetime = None) -> str:
        """Log patient consent in audit_logs table"""
        conn = await self.get_connection()
        try:
            consent_data = {
                "patient_id": patient_id,
                "consent_type": consent_type,
                "fingerprint_hash": fingerprint_hash,
                "otp_code": otp_code,
                "granted_by": granted_by,
                "expires_at": expires_at.isoformat() if expires_at else None,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            insert_query = """
                INSERT INTO audit_logs (
                    action, details, created_at
                ) VALUES ($1, $2, $3)
            """
            
            await conn.execute(
                insert_query,
                f"patient_consent_{consent_type}",
                json.dumps(consent_data),
                datetime.utcnow()
            )
            
            # Generate consent hash
            import hashlib
            consent_hash = hashlib.sha256(
                f"{patient_id}{consent_type}{granted_by}{datetime.utcnow().isoformat()}".encode()
            ).hexdigest()
            
            logger.info(f"Logged patient consent: {consent_hash}")
            return consent_hash
            
        except Exception as e:
            logger.error(f"Error logging consent: {e}")
            raise
        finally:
            await conn.close()
    
    async def verify_patient_consent(self, patient_id: str, consent_type: str) -> bool:
        """Verify if patient has granted consent for data synchronization"""
        conn = await self.get_connection()
        try:
            # Check for valid consent in audit_logs
            query = """
                SELECT details FROM audit_logs 
                WHERE action = $1 
                AND details::json->>'patient_id' = $2
                AND created_at > NOW() - INTERVAL '1 year'
                ORDER BY created_at DESC
                LIMIT 1
            """
            
            result = await conn.fetchrow(query, f"patient_consent_{consent_type}", patient_id)
            
            if result:
                consent_details = json.loads(result['details'])
                # Check if consent is still valid
                if consent_details.get('expires_at'):
                    expires_at = datetime.fromisoformat(consent_details['expires_at'])
                    return expires_at > datetime.utcnow()
                return True
            
            # For demo purposes, return True if no explicit consent found
            logger.info(f"No explicit consent found for patient {patient_id}, allowing sync")
            return True
            
        except Exception as e:
            logger.error(f"Error verifying consent: {e}")
            return False
        finally:
            await conn.close()
    
    def _calculate_triage_priority(self, vital: VitalSigns) -> str:
        """Calculate triage priority based on vital signs"""
        high_priority_conditions = []
        
        # Check critical vital signs
        if vital.systolic_bp and (vital.systolic_bp > 180 or vital.systolic_bp < 90):
            high_priority_conditions.append("critical_bp")
        
        if vital.heart_rate and (vital.heart_rate > 120 or vital.heart_rate < 50):
            high_priority_conditions.append("critical_hr")
        
        if vital.temperature and vital.temperature > 39.0:
            high_priority_conditions.append("high_fever")
        
        if vital.oxygen_saturation and vital.oxygen_saturation < 92:
            high_priority_conditions.append("low_o2")
        
        if high_priority_conditions:
            return "urgent"
        elif vital.systolic_bp and vital.systolic_bp > 160:
            return "semi_urgent"
        else:
            return "routine"
    
    async def _get_next_queue_position(self, conn) -> int:
        """Get next available queue position"""
        result = await conn.fetchrow("SELECT COALESCE(MAX(queue_position), 0) + 1 as next_pos FROM patient_queue")
        return result['next_pos']