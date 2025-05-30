import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with role-based access
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("front-office"), // front-office, doctor, lab, pharmacy, debtors, care-manager
  department: text("department"),
  providerId: text("provider_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Patients table with comprehensive information
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: jsonb("address"),
  insuranceProvider: text("insurance_provider").notNull(),
  insurancePlan: text("insurance_plan").notNull(),
  policyNumber: text("policy_number").notNull(),
  memberSince: timestamp("member_since").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  biometricHash: text("biometric_hash"), // For fingerprint verification
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dependents table for family members
export const dependents = pgTable("dependents", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  relationship: text("relationship").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// Patient benefits tracking
export const patientBenefits = pgTable("patient_benefits", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  benefitType: text("benefit_type").notNull(), // consultations, lab, pharmacy, specialists, chronic, fp, vax
  totalAllowed: integer("total_allowed").notNull(),
  usedCount: integer("used_count").notNull().default(0),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  usedAmount: decimal("used_amount", { precision: 10, scale: 2 }).default("0.00"),
  resetDate: timestamp("reset_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Healthcare providers
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  providerId: text("provider_id").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // hospital, clinic, lab, pharmacy
  address: jsonb("address"),
  phone: text("phone"),
  email: text("email"),
  licenseNumber: text("license_number"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Claims table
export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  claimId: text("claim_id").notNull().unique(),
  patientId: integer("patient_id").notNull(),
  providerId: integer("provider_id").notNull(),
  submittedBy: integer("submitted_by").notNull(), // user who submitted
  serviceType: text("service_type").notNull(),
  procedureCode: text("procedure_code"),
  diagnosisCode: text("diagnosis_code"),
  diagnosis: text("diagnosis"),
  serviceCost: decimal("service_cost", { precision: 10, scale: 2 }).notNull(),
  insuranceCoverage: decimal("insurance_coverage", { precision: 10, scale: 2 }).notNull(),
  patientResponsibility: decimal("patient_responsibility", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, denied, void
  aiDecision: text("ai_decision"),
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }),
  aiReasoning: jsonb("ai_reasoning"),
  isVoid: boolean("is_void").notNull().default(false),
  voidReason: text("void_reason"),
  voidedBy: integer("voided_by"),
  voidedAt: timestamp("voided_at"),
  blockchainHash: text("blockchain_hash"),
  blockchainTxHash: text("blockchain_tx_hash"),
  serviceDate: timestamp("service_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI preauthorization decisions
export const preauthorizations = pgTable("preauthorizations", {
  id: serial("id").primaryKey(),
  requestId: text("request_id").notNull().unique(),
  patientId: integer("patient_id").notNull(),
  providerId: integer("provider_id").notNull(),
  requestedBy: integer("requested_by").notNull(),
  treatmentDescription: text("treatment_description").notNull(),
  clinicalJustification: text("clinical_justification").notNull(),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }).notNull(),
  urgency: text("urgency").notNull().default("routine"), // routine, urgent, emergency
  aiDecision: text("ai_decision").notNull(), // approved, denied, review_required
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }).notNull(),
  chainOfThought: jsonb("chain_of_thought").notNull(),
  ragContext: jsonb("rag_context"),
  humanReviewRequired: boolean("human_review_required").notNull().default(false),
  humanDecision: text("human_decision"),
  humanReviewer: integer("human_reviewer"),
  reviewNotes: text("review_notes"),
  status: text("status").notNull().default("pending"), // pending, approved, denied
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pharmacy prescriptions and validations
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  prescriptionId: text("prescription_id").notNull().unique(),
  patientId: integer("patient_id").notNull(),
  providerId: integer("provider_id").notNull(),
  prescribedBy: integer("prescribed_by").notNull(),
  medicationName: text("medication_name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  duration: text("duration").notNull(),
  quantity: integer("quantity").notNull(),
  indication: text("indication").notNull(),
  isWeightBased: boolean("is_weight_based").notNull().default(false),
  isGenderSensitive: boolean("is_gender_sensitive").notNull().default(false),
  validationStatus: text("validation_status").notNull().default("pending"), // pending, validated, flagged
  validationNotes: jsonb("validation_notes"),
  benefitCategory: text("benefit_category").notNull(), // chronic, acute, fp, vax
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  dispensedAt: timestamp("dispensed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Patient verification logs
export const verificationLogs = pgTable("verification_logs", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  verificationType: text("verification_type").notNull(), // fingerprint, otp
  verificationData: text("verification_data"),
  isSuccessful: boolean("is_successful").notNull(),
  verifiedBy: integer("verified_by").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Blockchain transactions log
export const blockchainTransactions = pgTable("blockchain_transactions", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").notNull(),
  contractAddress: text("contract_address").notNull(),
  transactionHash: text("transaction_hash").notNull().unique(),
  blockNumber: integer("block_number"),
  gasUsed: integer("gas_used"),
  gasPrice: text("gas_price"),
  status: text("status").notNull().default("pending"), // pending, confirmed, failed
  networkName: text("network_name").notNull().default("sepolia"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity logs for audit trail
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  claims: many(claims),
  preauthorizations: many(preauthorizations),
  prescriptions: many(prescriptions),
  verificationLogs: many(verificationLogs),
  activityLogs: many(activityLogs),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  dependents: many(dependents),
  benefits: many(patientBenefits),
  claims: many(claims),
  preauthorizations: many(preauthorizations),
  prescriptions: many(prescriptions),
  verificationLogs: many(verificationLogs),
}));

export const dependentsRelations = relations(dependents, ({ one }) => ({
  patient: one(patients, {
    fields: [dependents.patientId],
    references: [patients.id],
  }),
}));

export const patientBenefitsRelations = relations(patientBenefits, ({ one }) => ({
  patient: one(patients, {
    fields: [patientBenefits.patientId],
    references: [patients.id],
  }),
}));

export const providersRelations = relations(providers, ({ many }) => ({
  claims: many(claims),
  preauthorizations: many(preauthorizations),
  prescriptions: many(prescriptions),
}));

export const claimsRelations = relations(claims, ({ one, many }) => ({
  patient: one(patients, {
    fields: [claims.patientId],
    references: [patients.id],
  }),
  provider: one(providers, {
    fields: [claims.providerId],
    references: [providers.id],
  }),
  submitter: one(users, {
    fields: [claims.submittedBy],
    references: [users.id],
  }),
  blockchainTransactions: many(blockchainTransactions),
}));

export const preauthorizationsRelations = relations(preauthorizations, ({ one }) => ({
  patient: one(patients, {
    fields: [preauthorizations.patientId],
    references: [patients.id],
  }),
  provider: one(providers, {
    fields: [preauthorizations.providerId],
    references: [providers.id],
  }),
  requester: one(users, {
    fields: [preauthorizations.requestedBy],
    references: [users.id],
  }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  patient: one(patients, {
    fields: [prescriptions.patientId],
    references: [patients.id],
  }),
  provider: one(providers, {
    fields: [prescriptions.providerId],
    references: [providers.id],
  }),
  prescriber: one(users, {
    fields: [prescriptions.prescribedBy],
    references: [users.id],
  }),
}));

export const verificationLogsRelations = relations(verificationLogs, ({ one }) => ({
  patient: one(patients, {
    fields: [verificationLogs.patientId],
    references: [patients.id],
  }),
  verifier: one(users, {
    fields: [verificationLogs.verifiedBy],
    references: [users.id],
  }),
}));

export const blockchainTransactionsRelations = relations(blockchainTransactions, ({ one }) => ({
  claim: one(claims, {
    fields: [blockchainTransactions.claimId],
    references: [claims.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  createdAt: true,
});

export const insertPreauthorizationSchema = createInsertSchema(preauthorizations).omit({
  id: true,
  createdAt: true,
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
});

export const insertVerificationLogSchema = createInsertSchema(verificationLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Dependent = typeof dependents.$inferSelect;
export type PatientBenefit = typeof patientBenefits.$inferSelect;
export type Provider = typeof providers.$inferSelect;
export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Preauthorization = typeof preauthorizations.$inferSelect;
export type InsertPreauthorization = z.infer<typeof insertPreauthorizationSchema>;
export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type VerificationLog = typeof verificationLogs.$inferSelect;
export type InsertVerificationLog = z.infer<typeof insertVerificationLogSchema>;
export type BlockchainTransaction = typeof blockchainTransactions.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
