import { 
  users, patients, claims, providers, benefits, dependents, 
  preauthorizations, prescriptions, fraudAlerts, auditLogs,
  type User, type InsertUser, type Patient, type InsertPatient,
  type Claim, type InsertClaim, type Provider, type Benefit,
  type Dependent, type Preauthorization, type InsertPreauthorization,
  type Prescription, type InsertPrescription, type FraudAlert, type AuditLog
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
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

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
}

export const storage = new DatabaseStorage();
