import { 
  users, patients, claims, providers, benefits, dependents, 
  preauthorizations, prescriptions, fraudAlerts, auditLogs,
  careProviders, insurancePolicies, onboardingAudits, sampleClaimFlows,
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

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  
  // Onboarding
  createOnboardingApplication(data: any): Promise<any>;
  getOnboardingApplications(): Promise<any[]>;
  approveOnboardingApplication(id: number, approvedBy: number): Promise<void>;
  rejectOnboardingApplication(id: number, rejectedBy: number, reason: string): Promise<void>;
  logOnboardingAudit(audit: any): Promise<void>;
  generateSampleClaimFlows(providerId: number): Promise<void>;
  getSampleClaimFlows(providerId: number): Promise<any[]>;
  completeSampleFlow(flowId: number): Promise<void>;
  getInsurancePolicies(): Promise<any[]>;
  seedInsurancePolicies(): Promise<void>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool: pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: this.detectRoleFromEmail(insertUser.email)
      })
      .returning();
    return user;
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
    const [auditLog] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    return auditLog;
  }

  // Onboarding implementation
  async createOnboardingApplication(data: any): Promise<any> {
    const [provider] = await db
      .insert(careProviders)
      .values({
        organizationType: data.organizationType,
        organizationName: data.organizationName,
        domain: data.domain,
        contactPerson: data.contactPerson,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        licenseNumber: data.licenseNumber,
        schemesSupported: data.schemesSupported,
        branch: data.branch,
        servicesOffered: data.servicesOffered,
        specializations: data.specializations,
        operatingHours: data.operatingHours,
        emergencyServices: data.emergencyServices,
        onboardingStatus: 'pending',
        onboardingData: data
      })
      .returning();
    return provider;
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
        flowType: 'outpatient_consultation',
        title: 'Outpatient Consultation',
        description: 'Submit and process a routine outpatient consultation claim',
        steps: ['Patient registration', 'Service delivery', 'Claim submission', 'Processing', 'Payment'],
        estimatedDuration: 30,
        completed: false
      },
      {
        providerId,
        flowType: 'emergency_visit',
        title: 'Emergency Department Visit',
        description: 'Handle emergency department visit with preauthorization',
        steps: ['Emergency admission', 'Immediate preauth', 'Treatment', 'Claim processing'],
        estimatedDuration: 45,
        completed: false
      },
      {
        providerId,
        flowType: 'pharmacy_dispensing',
        title: 'Pharmacy Dispensing',
        description: 'Process prescription validation and dispensing',
        steps: ['Prescription verification', 'Benefit checking', 'Dispensing', 'Claim submission'],
        estimatedDuration: 20,
        completed: false
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
        completed: true,
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
        provider: 'Social Health Authority',
        coverageType: 'comprehensive',
        benefitLimits: {
          annual: 1000000,
          outpatient: 50000,
          inpatient: 500000,
          emergency: 200000
        },
        copayStructure: {
          outpatient: 200,
          inpatient: 2000,
          emergency: 1000
        },
        excludedServices: ['cosmetic surgery', 'experimental treatments'],
        isActive: true
      },
      {
        policyName: 'UNHCR Refugee Health Insurance',
        provider: 'United Nations High Commissioner for Refugees',
        coverageType: 'basic',
        benefitLimits: {
          annual: 500000,
          outpatient: 30000,
          inpatient: 300000,
          emergency: 150000
        },
        copayStructure: {
          outpatient: 100,
          inpatient: 1000,
          emergency: 500
        },
        excludedServices: ['dental', 'vision correction'],
        isActive: true
      },
      {
        policyName: 'CIC General Insurance',
        provider: 'CIC Insurance Group',
        coverageType: 'premium',
        benefitLimits: {
          annual: 2000000,
          outpatient: 100000,
          inpatient: 1000000,
          emergency: 400000
        },
        copayStructure: {
          outpatient: 500,
          inpatient: 5000,
          emergency: 2000
        },
        excludedServices: [],
        isActive: true
      }
    ];

    for (const policy of policies) {
      await db.insert(insurancePolicies).values(policy);
    }
  }
}

export const storage = new DatabaseStorage();
