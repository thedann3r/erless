import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // front-office, doctor, lab, pharmacy, debtors, care-manager
  name: text("name").notNull(),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  phoneNumber: text("phone_number"),
  email: text("email"),
  address: text("address"),
  insuranceProvider: text("insurance_provider").notNull(),
  insurancePlan: text("insurance_plan").notNull(),
  policyNumber: text("policy_number").notNull(),
  memberSince: timestamp("member_since").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  biometricHash: text("biometric_hash"), // Simulated fingerprint hash
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dependents = pgTable("dependents", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  relationship: text("relationship").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const benefits = pgTable("benefits", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  benefitType: text("benefit_type").notNull(), // consultations, lab, pharmacy, specialists
  totalAllowed: integer("total_allowed").notNull(),
  usedCount: integer("used_count").default(0).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  usedAmount: decimal("used_amount", { precision: 10, scale: 2 }).default("0.00"),
  resetPeriod: text("reset_period").notNull(), // annual, monthly
  lastReset: timestamp("last_reset").defaultNow().notNull(),
});

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  claimId: text("claim_id").notNull().unique(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  providerId: integer("provider_id").references(() => providers.id).notNull(),
  serviceType: text("service_type").notNull(),
  procedureCode: text("procedure_code"),
  diagnosisCode: text("diagnosis_code"),
  description: text("description"),
  serviceCost: decimal("service_cost", { precision: 10, scale: 2 }).notNull(),
  insuranceCoverage: decimal("insurance_coverage", { precision: 10, scale: 2 }).notNull(),
  patientCopay: decimal("patient_copay", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // pending, approved, denied, void
  submittedBy: integer("submitted_by").references(() => users.id).notNull(),
  aiDecision: jsonb("ai_decision"), // AI reasoning and confidence
  isVoid: boolean("is_void").default(false).notNull(),
  voidReason: text("void_reason"),
  voidedBy: integer("voided_by").references(() => users.id),
  blockchainTxHash: text("blockchain_tx_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  providerId: text("provider_id").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // hospital, clinic, lab, pharmacy
  address: text("address"),
  phoneNumber: text("phone_number"),
  licenseNumber: text("license_number"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const preauthorizations = pgTable("preauthorizations", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").references(() => claims.id),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  serviceType: text("service_type").notNull(),
  requestedBy: integer("requested_by").references(() => users.id).notNull(),
  clinicalJustification: text("clinical_justification").notNull(),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }).notNull(),
  urgency: text("urgency").notNull(), // routine, urgent, emergency
  aiDecision: text("ai_decision").notNull(), // approved, denied, review
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }).notNull(),
  aiReasoning: jsonb("ai_reasoning"), // Chain-of-thought explanation
  humanReviewRequired: boolean("human_review_required").default(false).notNull(),
  finalDecision: text("final_decision"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").references(() => claims.id),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  medicationName: text("medication_name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  duration: text("duration").notNull(),
  quantity: integer("quantity").notNull(),
  indication: text("indication").notNull(),
  prescribedBy: integer("prescribed_by").references(() => users.id).notNull(),
  isValidated: boolean("is_validated").default(false).notNull(),
  validationNotes: text("validation_notes"),
  weightBasedDosing: boolean("weight_based_dosing").default(false).notNull(),
  genderSensitive: boolean("gender_sensitive").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fraudAlerts = pgTable("fraud_alerts", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").references(() => providers.id),
  patientId: integer("patient_id").references(() => patients.id),
  alertType: text("alert_type").notNull(), // billing_pattern, duplicate_service, unusual_frequency
  description: text("description").notNull(),
  riskLevel: text("risk_level").notNull(), // low, medium, high
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }).notNull(),
  status: text("status").default("open").notNull(), // open, investigating, resolved, false_positive
  investigatedBy: integer("investigated_by").references(() => users.id),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  claims: many(claims),
  preauthorizations: many(preauthorizations),
  prescriptions: many(prescriptions),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  dependents: many(dependents),
  benefits: many(benefits),
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
  submittedByUser: one(users, {
    fields: [claims.submittedBy],
    references: [users.id],
  }),
  preauthorizations: many(preauthorizations),
  prescriptions: many(prescriptions),
}));

export const providersRelations = relations(providers, ({ many }) => ({
  claims: many(claims),
  fraudAlerts: many(fraudAlerts),
}));

// Zod schemas
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
  updatedAt: true,
});

export const insertPreauthorizationSchema = createInsertSchema(preauthorizations).omit({
  id: true,
  createdAt: true,
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Provider = typeof providers.$inferSelect;
export type Benefit = typeof benefits.$inferSelect;
export type Dependent = typeof dependents.$inferSelect;
export type Preauthorization = typeof preauthorizations.$inferSelect;
export type InsertPreauthorization = z.infer<typeof insertPreauthorizationSchema>;
export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type FraudAlert = typeof fraudAlerts.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
