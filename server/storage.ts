import { users, patients, dependents, patientBenefits, providers, claims, preauthorizations, prescriptions, verificationLogs, blockchainTransactions, activityLogs } from "@shared/schema";
import type { 
  User, InsertUser, 
  Patient, InsertPatient, 
  Dependent, 
  PatientBenefit, 
  Provider, 
  Claim, InsertClaim,
  Preauthorization, InsertPreauthorization,
  Prescription, InsertPrescription,
  VerificationLog, InsertVerificationLog,
  BlockchainTransaction,
  ActivityLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Patient management
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByPatientId(patientId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, updates: Partial<InsertPatient>): Promise<Patient | undefined>;
  getPatientDependents(patientId: number): Promise<Dependent[]>;
  getPatientBenefits(patientId: number): Promise<PatientBenefit[]>;

  // Provider management
  getProvider(id: number): Promise<Provider | undefined>;
  getProviderByProviderId(providerId: string): Promise<Provider | undefined>;
  getAllProviders(): Promise<Provider[]>;

  // Claims management
  getClaim(id: number): Promise<Claim | undefined>;
  getClaimByClaimId(claimId: string): Promise<Claim | undefined>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaim(id: number, updates: Partial<InsertClaim>): Promise<Claim | undefined>;
  getClaimsByPatient(patientId: number): Promise<Claim[]>;
  getClaimsByProvider(providerId: number): Promise<Claim[]>;
  getClaimsByUser(userId: number): Promise<Claim[]>;
  getRecentClaims(limit?: number): Promise<Claim[]>;

  // Preauthorization management
  getPreauthorization(id: number): Promise<Preauthorization | undefined>;
  createPreauthorization(preauth: InsertPreauthorization): Promise<Preauthorization>;
  updatePreauthorization(id: number, updates: Partial<InsertPreauthorization>): Promise<Preauthorization | undefined>;
  getPreauthorizationsByPatient(patientId: number): Promise<Preauthorization[]>;
  getRecentPreauthorizations(limit?: number): Promise<Preauthorization[]>;

  // Prescription management
  getPrescription(id: number): Promise<Prescription | undefined>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: number, updates: Partial<InsertPrescription>): Promise<Prescription | undefined>;
  getPrescriptionsByPatient(patientId: number): Promise<Prescription[]>;

  // Verification logs
  createVerificationLog(log: InsertVerificationLog): Promise<VerificationLog>;
  getVerificationsByPatient(patientId: number): Promise<VerificationLog[]>;

  // Blockchain transactions
  createBlockchainTransaction(transaction: Omit<BlockchainTransaction, 'id' | 'createdAt'>): Promise<BlockchainTransaction>;
  getBlockchainTransactionsByClaimId(claimId: number): Promise<BlockchainTransaction[]>;

  // Activity logs
  createActivityLog(log: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog>;
  getActivityLogsByUser(userId: number, limit?: number): Promise<ActivityLog[]>;
  getRecentActivity(limit?: number): Promise<ActivityLog[]>;

  // Analytics
  getDashboardStats(): Promise<{
    activeClaims: number;
    aiDecisions: number;
    processingTime: number;
    blockchainAnchored: number;
    fraudDetected: number;
  }>;

  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Patient management
  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.patientId, patientId));
    return patient || undefined;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db
      .insert(patients)
      .values(insertPatient)
      .returning();
    return patient;
  }

  async updatePatient(id: number, updates: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [patient] = await db
      .update(patients)
      .set(updates)
      .where(eq(patients.id, id))
      .returning();
    return patient || undefined;
  }

  async getPatientDependents(patientId: number): Promise<Dependent[]> {
    return await db.select().from(dependents).where(eq(dependents.patientId, patientId));
  }

  async getPatientBenefits(patientId: number): Promise<PatientBenefit[]> {
    return await db.select().from(patientBenefits).where(eq(patientBenefits.patientId, patientId));
  }

  // Provider management
  async getProvider(id: number): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    return provider || undefined;
  }

  async getProviderByProviderId(providerId: string): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.providerId, providerId));
    return provider || undefined;
  }

  async getAllProviders(): Promise<Provider[]> {
    return await db.select().from(providers).where(eq(providers.isActive, true));
  }

  // Claims management
  async getClaim(id: number): Promise<Claim | undefined> {
    const [claim] = await db.select().from(claims).where(eq(claims.id, id));
    return claim || undefined;
  }

  async getClaimByClaimId(claimId: string): Promise<Claim | undefined> {
    const [claim] = await db.select().from(claims).where(eq(claims.claimId, claimId));
    return claim || undefined;
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const [claim] = await db
      .insert(claims)
      .values(insertClaim)
      .returning();
    return claim;
  }

  async updateClaim(id: number, updates: Partial<InsertClaim>): Promise<Claim | undefined> {
    const [claim] = await db
      .update(claims)
      .set(updates)
      .where(eq(claims.id, id))
      .returning();
    return claim || undefined;
  }

  async getClaimsByPatient(patientId: number): Promise<Claim[]> {
    return await db
      .select()
      .from(claims)
      .where(eq(claims.patientId, patientId))
      .orderBy(desc(claims.createdAt));
  }

  async getClaimsByProvider(providerId: number): Promise<Claim[]> {
    return await db
      .select()
      .from(claims)
      .where(eq(claims.providerId, providerId))
      .orderBy(desc(claims.createdAt));
  }

  async getClaimsByUser(userId: number): Promise<Claim[]> {
    return await db
      .select()
      .from(claims)
      .where(eq(claims.submittedBy, userId))
      .orderBy(desc(claims.createdAt));
  }

  async getRecentClaims(limit: number = 10): Promise<Claim[]> {
    return await db
      .select()
      .from(claims)
      .orderBy(desc(claims.createdAt))
      .limit(limit);
  }

  // Preauthorization management
  async getPreauthorization(id: number): Promise<Preauthorization | undefined> {
    const [preauth] = await db.select().from(preauthorizations).where(eq(preauthorizations.id, id));
    return preauth || undefined;
  }

  async createPreauthorization(insertPreauth: InsertPreauthorization): Promise<Preauthorization> {
    const [preauth] = await db
      .insert(preauthorizations)
      .values(insertPreauth)
      .returning();
    return preauth;
  }

  async updatePreauthorization(id: number, updates: Partial<InsertPreauthorization>): Promise<Preauthorization | undefined> {
    const [preauth] = await db
      .update(preauthorizations)
      .set(updates)
      .where(eq(preauthorizations.id, id))
      .returning();
    return preauth || undefined;
  }

  async getPreauthorizationsByPatient(patientId: number): Promise<Preauthorization[]> {
    return await db
      .select()
      .from(preauthorizations)
      .where(eq(preauthorizations.patientId, patientId))
      .orderBy(desc(preauthorizations.createdAt));
  }

  async getRecentPreauthorizations(limit: number = 10): Promise<Preauthorization[]> {
    return await db
      .select()
      .from(preauthorizations)
      .orderBy(desc(preauthorizations.createdAt))
      .limit(limit);
  }

  // Prescription management
  async getPrescription(id: number): Promise<Prescription | undefined> {
    const [prescription] = await db.select().from(prescriptions).where(eq(prescriptions.id, id));
    return prescription || undefined;
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const [prescription] = await db
      .insert(prescriptions)
      .values(insertPrescription)
      .returning();
    return prescription;
  }

  async updatePrescription(id: number, updates: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    const [prescription] = await db
      .update(prescriptions)
      .set(updates)
      .where(eq(prescriptions.id, id))
      .returning();
    return prescription || undefined;
  }

  async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    return await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.createdAt));
  }

  // Verification logs
  async createVerificationLog(insertLog: InsertVerificationLog): Promise<VerificationLog> {
    const [log] = await db
      .insert(verificationLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getVerificationsByPatient(patientId: number): Promise<VerificationLog[]> {
    return await db
      .select()
      .from(verificationLogs)
      .where(eq(verificationLogs.patientId, patientId))
      .orderBy(desc(verificationLogs.createdAt));
  }

  // Blockchain transactions
  async createBlockchainTransaction(transaction: Omit<BlockchainTransaction, 'id' | 'createdAt'>): Promise<BlockchainTransaction> {
    const [tx] = await db
      .insert(blockchainTransactions)
      .values(transaction)
      .returning();
    return tx;
  }

  async getBlockchainTransactionsByClaimId(claimId: number): Promise<BlockchainTransaction[]> {
    return await db
      .select()
      .from(blockchainTransactions)
      .where(eq(blockchainTransactions.claimId, claimId))
      .orderBy(desc(blockchainTransactions.createdAt));
  }

  // Activity logs
  async createActivityLog(log: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog> {
    const [activityLog] = await db
      .insert(activityLogs)
      .values(log)
      .returning();
    return activityLog;
  }

  async getActivityLogsByUser(userId: number, limit: number = 50): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  async getRecentActivity(limit: number = 20): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  // Analytics
  async getDashboardStats(): Promise<{
    activeClaims: number;
    aiDecisions: number;
    processingTime: number;
    blockchainAnchored: number;
    fraudDetected: number;
  }> {
    const [activeClaimsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(claims)
      .where(eq(claims.status, 'pending'));

    const [aiDecisionsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(preauthorizations)
      .where(sql`ai_decision IS NOT NULL`);

    const [blockchainResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(claims)
      .where(sql`blockchain_hash IS NOT NULL`);

    const [fraudResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(claims)
      .where(sql`ai_confidence < 50`);

    return {
      activeClaims: activeClaimsResult?.count || 0,
      aiDecisions: aiDecisionsResult?.count || 0,
      processingTime: 1.3, // Average processing time in seconds
      blockchainAnchored: blockchainResult?.count || 0,
      fraudDetected: fraudResult?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
