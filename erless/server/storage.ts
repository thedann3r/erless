import { 
  users, patients, claims, providers, benefits, dependents, 
  preauthorizations, prescriptions, fraudAlerts, auditLogs,
  careProviders, insurancePolicies, onboardingAudits, sampleClaimFlows,
  consultations, services,
  type User, type InsertUser, type Patient, type InsertPatient,
  type Claim, type InsertClaim, type Provider, type Benefit,
  type Dependent, type Preauthorization, type InsertPreauthorization,
  type Prescription, type InsertPrescription, type FraudAlert, type AuditLog,
  type CareProvider, type InsertCareProvider
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { InsurerPolicyStorage } from "./insurer-policy-storage";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateLastLogin(userId: number): Promise<void>;
  
  // Patient management
  getAllPatients(): Promise<Patient[]>;
  getPatientById(id: number): Promise<Patient | undefined>;
  getPatientByPatientId(patientId: string): Promise<Patient | undefined>;
  getPatientByBiometric(biometricHash: string): Promise<Patient | undefined>;
  getPatientBenefits(patientId: number): Promise<Benefit[]>;
  getPatientDependents(patientId: number): Promise<Dependent[]>;
  getPatientClaimHistory(patientId: number): Promise<Claim[]>;
  getPatientMedications(patientId: number): Promise<Prescription[]>;
  
  // Claims management
  getAllClaims(): Promise<Claim[]>;
  getClaimById(id: number): Promise<Claim | undefined>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  voidClaim(id: number, voidedBy: number, reason: string): Promise<Claim>;
  updateClaimBlockchainHash(id: number, txHash: string): Promise<void>;
  
  // Preauthorizations
  getAllPreauthorizations(): Promise<Preauthorization[]>;
  createPreauthorization(preauth: InsertPreauthorization): Promise<Preauthorization>;
  
  // Prescriptions
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  
  // Providers
  getAllProviders(): Promise<Provider[]>;
  
  // Analytics
  getDashboardStats(): Promise<any>;
  getFraudAlerts(): Promise<FraudAlert[]>;
  
  // Audit logging
  createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;
  
  // Decision logs
  createDecisionLog(log: any): Promise<any>;
  getDecisionLog(id: number): Promise<any>;
  getDecisionLogs(limit: number, offset: number): Promise<any[]>;
  getDecisionLogsByType(type: string, limit: number): Promise<any[]>;
  updateDecisionLogFeedback(id: number, feedback: any): Promise<void>;
  updateSessionActivity(sessionId: string, lastActivity: Date): Promise<void>;
  
  // Onboarding
  createOnboardingApplication(data: any): Promise<any>;
  getOnboardingApplications(): Promise<any[]>;
  approveOnboardingApplication(id: number, approvedBy: number): Promise<void>;
  rejectOnboardingApplication(id: number, rejectedBy: number, reason: string): Promise<void>;
  logOnboardingAudit(audit: any): Promise<void>;

  // Insurer Policy Methods
  getAllInsurers(): Promise<any[]>;
  getInsurerById(id: number): Promise<any>;
  createInsurer(insurer: any): Promise<any>;
  updateInsurer(id: number, insurer: any): Promise<any>;
  deleteInsurer(id: number): Promise<void>;
  
  getAllPolicies(): Promise<any[]>;
  getPolicyById(id: number): Promise<any>;
  getPoliciesByInsurer(insurerId: number): Promise<any[]>;
  createPolicy(policy: any): Promise<any>;
  updatePolicy(id: number, policy: any): Promise<any>;
  deletePolicy(id: number): Promise<void>;
  
  getAllSchemes(): Promise<any[]>;
  getSchemeById(id: number): Promise<any>;
  getSchemesByPolicy(policyId: number): Promise<any[]>;
  createScheme(scheme: any): Promise<any>;
  updateScheme(id: number, scheme: any): Promise<any>;
  deleteScheme(id: number): Promise<void>;
  
  getSchemeBenefits(schemeId: number): Promise<any[]>;
  createSchemeBenefit(benefit: any): Promise<any>;
  updateSchemeBenefit(id: number, benefit: any): Promise<any>;
  deleteSchemeBenefit(id: number): Promise<void>;
  
  getMemberPolicies(patientId: number): Promise<any[]>;
  assignPolicyToMember(assignment: any): Promise<any>;
  unassignPolicyFromMember(id: number): Promise<void>;
  
  getBenefitUtilization(memberPolicyId: number, financialYear: string): Promise<any[]>;
  recordBenefitUtilization(utilization: any): Promise<any>;
  
  getCoverageMapping(schemeId: number): Promise<any[]>;
  createCoverageMapping(mapping: any): Promise<any>;
  generateSampleClaimFlows(providerId: number): Promise<void>;
  getSampleClaimFlows(providerId: number): Promise<any[]>;
  completeSampleFlow(flowId: number): Promise<void>;
  getInsurancePolicies(): Promise<any[]>;
  seedInsurancePolicies(): Promise<void>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  private insurerPolicyStorage: InsurerPolicyStorage;
  sessionStore: any;

  constructor() {
    this.insurerPolicyStorage = new InsurerPolicyStorage();
    // Initialize session store
    this.sessionStore = new PostgresSessionStore({ 
      pool: pool as any,
      tableName: 'session',
      createTableIfMissing: true,
      schemaName: 'public',
      ttl: 24 * 60 * 60, // 24 hours
      disableTouch: false
    });
  }

  // Expose insurer policy methods
  get insurerPolicy() {
    return this.insurerPolicyStorage;
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] as User | undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values({
        ...insertUser,
        role: this.detectRoleFromEmail(insertUser.email)
      })
      .returning();
    return result[0];
  }

  async updateLastLogin(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userId));
  }

  private detectRoleFromEmail(email: string): string {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return 'front-office';
    
    if (domain.includes('frontoffice') || domain.includes('front-office')) return 'front-office';
    if (domain.includes('doctor') || domain.includes('physician') || domain.includes('md')) return 'doctor';
    if (domain.includes('lab') || domain.includes('laboratory')) return 'lab';
    if (domain.includes('pharmacy') || domain.includes('pharm')) return 'pharmacy';
    if (domain.includes('debt') || domain.includes('billing')) return 'debtors';
    if (domain.includes('care') || domain.includes('manager')) return 'care-manager';
    
    return 'front-office'; // Default role
  }

  async getAllPatients(): Promise<Patient[]> {
    return await db.select().from(patients).where(eq(patients.isActive, true));
  }

  async getPatientById(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.patientId, patientId));
    return patient || undefined;
  }

  async getPatientByBiometric(biometricHash: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.biometricHash, biometricHash));
    return patient || undefined;
  }

  async getPatientBenefits(patientId: number): Promise<Benefit[]> {
    return await db.select().from(benefits).where(eq(benefits.patientId, patientId));
  }

  async getPatientDependents(patientId: number): Promise<Dependent[]> {
    return await db.select().from(dependents).where(eq(dependents.patientId, patientId));
  }

  async getPatientClaimHistory(patientId: number): Promise<Claim[]> {
    return await db
      .select()
      .from(claims)
      .where(eq(claims.patientId, patientId))
      .orderBy(desc(claims.createdAt));
  }

  async getPatientMedications(patientId: number): Promise<Prescription[]> {
    return await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.createdAt));
  }

  async getAllClaims(): Promise<Claim[]> {
    return await db
      .select()
      .from(claims)
      .orderBy(desc(claims.createdAt));
  }

  async getClaimById(id: number): Promise<Claim | undefined> {
    const [claim] = await db.select().from(claims).where(eq(claims.id, id));
    return claim || undefined;
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const [claim] = await db
      .insert(claims)
      .values(insertClaim)
      .returning();
    return claim;
  }

  async voidClaim(id: number, voidedBy: number, reason: string): Promise<Claim> {
    const [claim] = await db
      .update(claims)
      .set({
        isVoid: true,
        voidReason: reason,
        voidedBy,
        status: 'void',
        updatedAt: new Date()
      })
      .where(eq(claims.id, id))
      .returning();
    return claim;
  }

  async updateClaimBlockchainHash(id: number, txHash: string): Promise<void> {
    await db
      .update(claims)
      .set({ blockchainTxHash: txHash })
      .where(eq(claims.id, id));
  }

  async getAllPreauthorizations(): Promise<Preauthorization[]> {
    return await db
      .select()
      .from(preauthorizations)
      .orderBy(desc(preauthorizations.createdAt));
  }

  async createPreauthorization(insertPreauth: InsertPreauthorization): Promise<Preauthorization> {
    const [preauth] = await db
      .insert(preauthorizations)
      .values(insertPreauth)
      .returning();
    return preauth;
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const [prescription] = await db
      .insert(prescriptions)
      .values(insertPrescription)
      .returning();
    return prescription;
  }

  async getAllProviders(): Promise<Provider[]> {
    return await db.select().from(providers).where(eq(providers.isActive, true));
  }

  async getDashboardStats(): Promise<any> {
    const totalClaims = await db.select({ count: sql<number>`count(*)` }).from(claims);
    const activeClaims = await db.select({ count: sql<number>`count(*)` }).from(claims).where(eq(claims.status, 'pending'));
    const approvedClaims = await db.select({ count: sql<number>`count(*)` }).from(claims).where(eq(claims.status, 'approved'));
    const voidClaims = await db.select({ count: sql<number>`count(*)` }).from(claims).where(eq(claims.isVoid, true));
    
    const aiDecisions = await db.select({ count: sql<number>`count(*)` }).from(preauthorizations);
    const aiApprovals = await db.select({ count: sql<number>`count(*)` }).from(preauthorizations).where(eq(preauthorizations.aiDecision, 'approved'));
    
    return {
      totalClaims: totalClaims[0]?.count || 0,
      activeClaims: activeClaims[0]?.count || 0,
      approvedClaims: approvedClaims[0]?.count || 0,
      voidClaims: voidClaims[0]?.count || 0,
      aiDecisions: aiDecisions[0]?.count || 0,
      aiApprovals: aiApprovals[0]?.count || 0,
      aiAccuracy: aiDecisions[0]?.count > 0 ? ((aiApprovals[0]?.count || 0) / aiDecisions[0].count * 100).toFixed(1) : '0.0'
    };
  }

  async getFraudAlerts(): Promise<FraudAlert[]> {
    return await db
      .select()
      .from(fraudAlerts)
      .where(eq(fraudAlerts.status, 'open'))
      .orderBy(desc(fraudAlerts.createdAt));
  }

  async createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const result = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    return result[0];
  }

  // Onboarding implementation
  async createOnboardingApplication(data: any): Promise<any> {
    const result = await db
      .insert(careProviders)
      .values({
        name: data.organizationName,
        domain: data.domain,
        type: data.organizationType,
        contactPerson: data.contactPerson,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        licenseNumber: data.licenseNumber,
        schemesSupported: data.schemesSupported || [],
        branch: data.branch,
        onboardingStatus: 'pending',
        onboardingData: data
      })
      .returning();
    return result[0];
  }

  async getOnboardingApplications(): Promise<any[]> {
    return await db
      .select()
      .from(careProviders)
      .where(sql`${careProviders.onboardingStatus} IN ('pending', 'approved', 'rejected')`)
      .orderBy(desc(careProviders.createdAt));
  }

  async approveOnboardingApplication(id: number, approvedBy: number): Promise<void> {
    await db
      .update(careProviders)
      .set({ 
        onboardingStatus: 'approved',
        approvedBy,
        approvedAt: new Date()
      })
      .where(eq(careProviders.id, id));
  }

  async rejectOnboardingApplication(id: number, rejectedBy: number, reason: string): Promise<void> {
    await db
      .update(careProviders)
      .set({ 
        onboardingStatus: 'rejected',
        rejectedBy,
        rejectedAt: new Date(),
        rejectionReason: reason
      })
      .where(eq(careProviders.id, id));
  }

  async logOnboardingAudit(audit: any): Promise<void> {
    await db
      .insert(onboardingAudits)
      .values({
        providerId: audit.providerId,
        action: audit.action,
        actionBy: audit.actionBy,
        details: audit.details,
        ipAddress: audit.ipAddress,
        userAgent: audit.userAgent
      });
  }

  async generateSampleClaimFlows(providerId: number): Promise<void> {
    const sampleFlows = [
      {
        providerId,
        flowName: 'Outpatient Consultation',
        flowType: 'outpatient_consultation',
        steps: {
          steps: ['Patient registration', 'Service delivery', 'Claim submission', 'Processing', 'Payment']
        },
        testData: {
          description: 'Submit and process a routine outpatient consultation claim',
          estimatedDuration: 30
        },
        isCompleted: false
      },
      {
        providerId,
        flowName: 'Emergency Department Visit',
        flowType: 'emergency_visit',
        steps: {
          steps: ['Emergency admission', 'Immediate preauth', 'Treatment', 'Claim processing']
        },
        testData: {
          description: 'Handle emergency department visit with preauthorization',
          estimatedDuration: 45
        },
        isCompleted: false
      },
      {
        providerId,
        flowName: 'Pharmacy Dispensing',
        flowType: 'pharmacy_dispensing',
        steps: {
          steps: ['Prescription verification', 'Benefit checking', 'Dispensing', 'Claim submission']
        },
        testData: {
          description: 'Process prescription validation and dispensing',
          estimatedDuration: 20
        },
        isCompleted: false
      }
    ];

    for (const flow of sampleFlows) {
      await db.insert(sampleClaimFlows).values(flow);
    }
  }

  async getSampleClaimFlows(providerId: number): Promise<any[]> {
    return await db
      .select()
      .from(sampleClaimFlows)
      .where(eq(sampleClaimFlows.providerId, providerId))
      .orderBy(sampleClaimFlows.createdAt);
  }

  async completeSampleFlow(flowId: number): Promise<void> {
    await db
      .update(sampleClaimFlows)
      .set({ 
        isCompleted: true,
        completedAt: new Date()
      })
      .where(eq(sampleClaimFlows.id, flowId));
  }

  async getInsurancePolicies(): Promise<any[]> {
    return await db
      .select()
      .from(insurancePolicies)
      .orderBy(insurancePolicies.policyName);
  }

  async seedInsurancePolicies(): Promise<void> {
    const policies = [
      {
        policyName: 'SHA Universal Health Coverage',
        insurerName: 'Social Health Authority',
        policyType: 'comprehensive',
        coverageDetails: {
          annual: 1000000,
          outpatient: 50000,
          inpatient: 500000,
          emergency: 200000
        },
        benefitCategories: {
          outpatient: 200,
          inpatient: 2000,
          emergency: 1000
        },
        preauthorizationRules: {
          automatic: ['outpatient'],
          manual: ['inpatient', 'emergency']
        },
        exclusions: ['cosmetic surgery', 'experimental treatments'],
        isActive: true
      },
      {
        policyName: 'UNHCR Refugee Health Insurance',
        insurerName: 'United Nations High Commissioner for Refugees',
        policyType: 'basic',
        coverageDetails: {
          annual: 500000,
          outpatient: 30000,
          inpatient: 300000,
          emergency: 150000
        },
        benefitCategories: {
          outpatient: 100,
          inpatient: 1000,
          emergency: 500
        },
        preauthorizationRules: {
          automatic: ['outpatient'],
          manual: ['inpatient', 'emergency']
        },
        exclusions: ['dental', 'vision correction'],
        isActive: true
      },
      {
        policyName: 'CIC General Insurance',
        insurerName: 'CIC Insurance Group',
        policyType: 'premium',
        coverageDetails: {
          annual: 2000000,
          outpatient: 100000,
          inpatient: 1000000,
          emergency: 400000
        },
        benefitCategories: {
          outpatient: 500,
          inpatient: 5000,
          emergency: 2000
        },
        preauthorizationRules: {
          automatic: ['outpatient'],
          manual: ['inpatient', 'emergency']
        },
        exclusions: [],
        isActive: true
      }
    ];

    for (const policy of policies) {
      await db.insert(insurancePolicies).values(policy);
    }
  }

  // Consultation and Services methods
  async createConsultation(consultation: any): Promise<any> {
    const result = await db.insert(consultations).values({
      patientId: consultation.patientId,
      doctorId: consultation.doctorId || 1, // Default doctor ID
      chiefComplaint: consultation.chiefComplaint,
      history: consultation.history,
      examination: consultation.examination,
      diagnosis: consultation.diagnosis,
      icdCode: consultation.icdCode,
      treatmentPlan: consultation.treatmentPlan,
      followUpDate: consultation.followUpDate ? new Date(consultation.followUpDate) : null,
      signedOff: consultation.signedOff || false,
      signedOffAt: consultation.signedOffAt ? new Date(consultation.signedOffAt) : null,
      vitals: consultation.vitals,
      status: consultation.status || 'in-progress'
    }).returning();
    return result[0];
  }

  async getConsultationByPatient(patientId: string): Promise<any> {
    const result = await db.select()
      .from(consultations)
      .where(eq(consultations.patientId, patientId))
      .orderBy(desc(consultations.createdAt))
      .limit(1);
    return result[0];
  }

  async createService(service: any): Promise<any> {
    const expiresAt = service.expiresAt ? new Date(service.expiresAt) : null;
    
    const result = await db.insert(services).values({
      patientId: service.patientId,
      prescribedBy: service.prescribedBy || 1, // Default doctor ID
      type: service.type,
      serviceCode: service.serviceCode,
      serviceName: service.serviceName,
      dosage: service.dosage,
      frequency: service.frequency,
      duration: service.duration,
      instructions: service.instructions,
      status: service.status || 'active',
      durationDays: service.durationDays || (service.type === 'lab' ? 180 : null),
      expiresAt: expiresAt,
      notes: service.notes
    }).returning();
    return result[0];
  }

  async getServicesByPatient(patientId: string): Promise<any[]> {
    const result = await db.select()
      .from(services)
      .where(eq(services.patientId, patientId))
      .orderBy(desc(services.createdAt));
    return result;
  }

  async getActiveServicesByType(patientId: string, type: 'lab' | 'pharmacy'): Promise<any[]> {
    const result = await db.select()
      .from(services)
      .where(and(
        eq(services.patientId, patientId),
        eq(services.type, type),
        eq(services.status, 'active')
      ))
      .orderBy(desc(services.createdAt));
    return result;
  }

  async cancelLabOrder(labId: number, doctorId: number, reason: string): Promise<any> {
    const result = await db.update(services)
      .set({
        status: 'cancelled',
        notes: reason,
        dispensedBy: doctorId,
        dispensedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(services.id, labId),
        eq(services.type, 'lab')
      ))
      .returning();
    return result[0];
  }

  async createReviewConsultation(data: any): Promise<any> {
    const result = await db.insert(consultations)
      .values({
        patientId: data.patientId,
        doctorId: data.doctorId,
        chiefComplaint: `Review consultation for cancelled lab order: ${data.originalService}`,
        diagnosis: 'Review consultation pending',
        treatmentPlan: `Patient review following cancelled lab order (ID: ${data.cancelledLabId}). Reason: ${data.reason}`,
        status: 'in-progress',
        signedOff: false
      })
      .returning();
    return result[0];
  }

  // Decision log methods
  async createDecisionLog(log: any): Promise<any> {
    // For now, create a simple audit log entry since we don't have a separate decision logs table
    return await this.createAuditLog({
      userId: log.userId,
      action: log.action || 'decision',
      entityType: log.entityType || 'preauthorization',
      entityId: log.entityId,
      details: log.details,
      ipAddress: log.ipAddress || 'unknown',
      userAgent: log.userAgent || 'unknown'
    });
  }

  async getDecisionLog(id: number): Promise<any> {
    const result = await db.select().from(auditLogs).where(eq(auditLogs.id, id));
    return result[0];
  }

  async getDecisionLogs(limit: number, offset: number): Promise<any[]> {
    return await db.select()
      .from(auditLogs)
      .where(eq(auditLogs.action, 'decision'))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getDecisionLogsByType(type: string, limit: number): Promise<any[]> {
    return await db.select()
      .from(auditLogs)
      .where(and(
        eq(auditLogs.action, 'decision'),
        eq(auditLogs.entityType, type)
      ))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  async updateDecisionLogFeedback(id: number, feedback: any): Promise<void> {
    // Update the audit log details with feedback
    const existing = await this.getDecisionLog(id);
    if (existing) {
      const updatedDetails = {
        ...existing.details,
        feedback: feedback
      };
      
      await db.update(auditLogs)
        .set({ details: updatedDetails })
        .where(eq(auditLogs.id, id));
    }
  }

  async updateSessionActivity(sessionId: string, lastActivity: Date): Promise<void> {
    // This is typically handled by the session store, but we can log it if needed
    console.log(`Session ${sessionId} last activity: ${lastActivity}`);
  }

  // Insurer Policy method implementations
  private insurerPolicyStorage = new InsurerPolicyStorage();

  async getAllInsurers(): Promise<any[]> {
    return this.insurerPolicyStorage.getAllInsurers();
  }

  async getInsurerById(id: number): Promise<any> {
    return this.insurerPolicyStorage.getInsurerById(id);
  }

  async createInsurer(insurer: any): Promise<any> {
    return this.insurerPolicyStorage.createInsurer(insurer);
  }

  async updateInsurer(id: number, insurer: any): Promise<any> {
    return this.insurerPolicyStorage.updateInsurer(id, insurer);
  }

  async deleteInsurer(id: number): Promise<void> {
    return this.insurerPolicyStorage.deleteInsurer(id);
  }

  async getAllPolicies(): Promise<any[]> {
    return this.insurerPolicyStorage.getAllPolicies();
  }

  async getPolicyById(id: number): Promise<any> {
    return this.insurerPolicyStorage.getPolicyById(id);
  }

  async getPoliciesByInsurer(insurerId: number): Promise<any[]> {
    return this.insurerPolicyStorage.getPoliciesByInsurer(insurerId);
  }

  async createPolicy(policy: any): Promise<any> {
    return this.insurerPolicyStorage.createPolicy(policy);
  }

  async updatePolicy(id: number, policy: any): Promise<any> {
    return this.insurerPolicyStorage.updatePolicy(id, policy);
  }

  async deletePolicy(id: number): Promise<void> {
    return this.insurerPolicyStorage.deletePolicy(id);
  }

  async getAllSchemes(): Promise<any[]> {
    return this.insurerPolicyStorage.getAllSchemes();
  }

  async getSchemeById(id: number): Promise<any> {
    return this.insurerPolicyStorage.getSchemeById(id);
  }

  async getSchemesByPolicy(policyId: number): Promise<any[]> {
    return this.insurerPolicyStorage.getSchemesByPolicy(policyId);
  }

  async createScheme(scheme: any): Promise<any> {
    return this.insurerPolicyStorage.createScheme(scheme);
  }

  async updateScheme(id: number, scheme: any): Promise<any> {
    return this.insurerPolicyStorage.updateScheme(id, scheme);
  }

  async deleteScheme(id: number): Promise<void> {
    return this.insurerPolicyStorage.deleteScheme(id);
  }

  async getSchemeBenefits(schemeId: number): Promise<any[]> {
    return this.insurerPolicyStorage.getSchemeBenefits(schemeId);
  }

  async createSchemeBenefit(benefit: any): Promise<any> {
    return this.insurerPolicyStorage.createSchemeBenefit(benefit);
  }

  async updateSchemeBenefit(id: number, benefit: any): Promise<any> {
    return this.insurerPolicyStorage.updateSchemeBenefit(id, benefit);
  }

  async deleteSchemeBenefit(id: number): Promise<void> {
    return this.insurerPolicyStorage.deleteSchemeBenefit(id);
  }

  async getMemberPolicies(patientId: number): Promise<any[]> {
    return this.insurerPolicyStorage.getMemberPolicies(patientId);
  }

  async assignPolicyToMember(assignment: any): Promise<any> {
    return this.insurerPolicyStorage.assignPolicyToMember(assignment);
  }

  async unassignPolicyFromMember(id: number): Promise<void> {
    return this.insurerPolicyStorage.unassignPolicyFromMember(id);
  }

  async getBenefitUtilization(memberPolicyId: number, financialYear: string): Promise<any[]> {
    return this.insurerPolicyStorage.getBenefitUtilization(memberPolicyId, financialYear);
  }

  async recordBenefitUtilization(utilization: any): Promise<any> {
    return this.insurerPolicyStorage.recordBenefitUtilization(utilization);
  }

  async getCoverageMapping(schemeId: number): Promise<any[]> {
    return this.insurerPolicyStorage.getCoverageMapping(schemeId);
  }

  async createCoverageMapping(mapping: any): Promise<any> {
    return this.insurerPolicyStorage.createCoverageMapping(mapping);
  }
}

export const storage = new DatabaseStorage();
