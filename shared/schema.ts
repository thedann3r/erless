import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const careProviders = pgTable("care_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(), // e.g., aku.edu
  type: text("type").notNull(), // hospital, clinic, pharmacy-chain, insurer
  branch: text("branch"), // for multi-branch facilities
  address: text("address"),
  licenseNumber: text("license_number"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  contactPerson: text("contact_person"),
  schemesSupported: text("schemes_supported").array(), // SHA, CIC, UNHCR, etc.
  onboardingStatus: text("onboarding_status").default("pending").notNull(), // pending, in_progress, approved, rejected
  onboardingData: jsonb("onboarding_data"), // Store form data
  verificationDocuments: text("verification_documents").array(), // uploaded document paths
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insurancePolicies = pgTable("insurance_policies", {
  id: serial("id").primaryKey(),
  policyName: text("policy_name").notNull(),
  insurerName: text("insurer_name").notNull(), // SHA, CIC, UNHCR
  policyType: text("policy_type").notNull(), // basic, premium, specialist
  coverageDetails: jsonb("coverage_details").notNull(), // benefit limits, copays, exclusions
  benefitCategories: jsonb("benefit_categories").notNull(), // consultation, lab, pharmacy, etc.
  preauthorizationRules: jsonb("preauthorization_rules").notNull(), // automatic approval thresholds
  exclusions: text("exclusions").array(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const onboardingAudits = pgTable("onboarding_audits", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").references(() => careProviders.id).notNull(),
  action: text("action").notNull(), // form_submitted, documents_uploaded, approved, rejected
  actionBy: integer("action_by").references(() => users.id),
  details: jsonb("details"), // action-specific data
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const sampleClaimFlows = pgTable("sample_claim_flows", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").references(() => careProviders.id).notNull(),
  flowName: text("flow_name").notNull(), // "General Consultation", "Emergency Care", etc.
  flowType: text("flow_type").notNull(), // consultation, lab, pharmacy, combined
  steps: jsonb("steps").notNull(), // array of step definitions
  testData: jsonb("test_data").notNull(), // sample patient and claim data
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // doctor, clinician, pharmacist, admin, debtor-officer
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  careProviderId: integer("care_provider_id").references(() => careProviders.id),
  department: text("department"),
  cadre: text("cadre"), // specialist, consultant, registrar, etc.
  registrationNumber: text("registration_number"), // professional license number
  registrationBody: text("registration_body"), // national medical/pharmacy board
  isActive: boolean("is_active").default(true).notNull(),
  licenseNumber: text("license_number"),
  licenseVerified: boolean("license_verified").default(false).notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  fingerprintId: text("fingerprint_id").unique(), // Enhanced biometric tracking
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

// Service tracking table for detailed claim services
export const claimServices = pgTable("claim_services", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").references(() => claims.id).notNull(),
  serviceName: text("service_name").notNull(),
  serviceType: text("service_type").notNull(), // consultation, lab, pharmacy, procedure
  serviceCode: text("service_code"), // CPT, ICD codes
  status: text("status").notNull().default("pending"), // pending, fulfilled, cancelled, expired
  prescribedBy: integer("prescribed_by").references(() => users.id),
  startDate: timestamp("start_date").defaultNow().notNull(),
  durationDays: integer("duration_days"),
  quantity: integer("quantity").default(1).notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Decision logs for tracking AI decisions and outcomes
export const decisionLogs = pgTable("decision_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  patientId: integer("patient_id").references(() => patients.id),
  decisionType: text("decision_type").notNull(), // preauth, pharmacy_validation, claims_validation, fraud_detection
  originalDecision: text("original_decision").notNull(), // approved, denied, review
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }).notNull(),
  reasoning: jsonb("reasoning"), // AI reasoning chain
  finalOutcome: text("final_outcome"), // actual outcome after human review
  appealOutcome: text("appeal_outcome"), // outcome if appealed
  careManagerNotes: text("care_manager_notes"), // reviewer notes
  metadata: jsonb("metadata"), // additional context (claim amount, service type, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Lab Orders for Doctor/Clinician Dashboard
export const labOrders = pgTable("lab_orders", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  providerId: integer("provider_id").references(() => providers.id).notNull(),
  doctorId: integer("doctor_id").references(() => users.id).notNull(),
  testType: text("test_type").notNull(),
  testCode: text("test_code"),
  urgency: text("urgency").notNull().default("routine"), // routine, urgent, stat
  clinicalInfo: text("clinical_info"),
  preauthorizationStatus: text("preauthorization_status").default("pending"),
  status: text("status").notNull().default("ordered"), // ordered, collected, processing, completed, cancelled
  estimatedCost: integer("estimated_cost"),
  results: text("results"),
  resultDate: timestamp("result_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Patient Queue for triage workflow
export const patientQueue = pgTable("patient_queue", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  providerId: integer("provider_id").references(() => providers.id).notNull(),
  assignedDoctorId: integer("assigned_doctor_id").references(() => users.id),
  queueNumber: integer("queue_number").notNull(),
  priority: text("priority").notNull().default("normal"), // high, normal, low
  chiefComplaint: text("chief_complaint"),
  vitals: jsonb("vitals"), // BP, temp, pulse, etc.
  triageNotes: text("triage_notes"),
  status: text("status").notNull().default("waiting"), // waiting, in_consultation, completed, cancelled
  checkedInAt: timestamp("checked_in_at").defaultNow().notNull(),
  consultationStarted: timestamp("consultation_started"),
  consultationCompleted: timestamp("consultation_completed"),
});

// Consultation Records
export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  doctorId: integer("doctor_id").references(() => users.id).notNull(),
  queueId: integer("queue_id").references(() => patientQueue.id),
  chiefComplaint: text("chief_complaint"),
  historyOfPresentingIllness: text("history_of_presenting_illness"),
  pastMedicalHistory: text("past_medical_history"),
  examination: text("examination"),
  diagnosis: text("diagnosis").notNull(),
  icd10Codes: text("icd10_codes").array(),
  treatment: text("treatment"),
  notes: text("notes"),
  followUpInstructions: text("follow_up_instructions"),
  signedAt: timestamp("signed_at"),
  signatureMethod: text("signature_method"), // fingerprint, otp, password
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insurance Schemes
export const insuranceSchemes = pgTable("insurance_schemes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  insurerName: text("insurer_name").notNull(),
  schemeType: text("scheme_type").notNull(), // nhif, private, corporate
  benefitCategories: text("benefit_categories").array(),
  copayPercentage: integer("copay_percentage").default(0),
  maximumBenefit: integer("maximum_benefit"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Benefit Usage Tracking
export const benefitUsage = pgTable("benefit_usage", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  schemeId: integer("scheme_id").references(() => insuranceSchemes.id).notNull(),
  benefitCategory: text("benefit_category").notNull(),
  usedAmount: integer("used_amount").notNull().default(0),
  remainingAmount: integer("remaining_amount"),
  lastUsed: timestamp("last_used"),
  resetDate: timestamp("reset_date"),
});

// Pharmacy Dispensing Records
export const dispensingRecords = pgTable("dispensing_records", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id).notNull(),
  pharmacistId: integer("pharmacist_id").references(() => users.id).notNull(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  medicationName: text("medication_name").notNull(),
  quantityDispensed: integer("quantity_dispensed").notNull(),
  daysSupply: integer("days_supply"),
  benefitUsed: integer("benefit_used"),
  copayAmount: integer("copay_amount"),
  preauthorizationRequired: boolean("preauthorization_required").default(false),
  preauthorizationStatus: text("preauthorization_status"),
  dispensedAt: timestamp("dispensed_at").defaultNow().notNull(),
});

// Claim Appeals for Patient Dashboard
export const claimAppeals = pgTable("claim_appeals", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").references(() => claims.id).notNull(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  appealReason: text("appeal_reason").notNull(),
  supportingDocuments: text("supporting_documents").array(),
  status: text("status").notNull().default("submitted"), // submitted, under_review, approved, denied
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// Relations
export const careProvidersRelations = relations(careProviders, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  careProvider: one(careProviders, {
    fields: [users.careProviderId],
    references: [careProviders.id],
  }),
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
export const insertCareProviderSchema = createInsertSchema(careProviders).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
  verificationDate: true,
}).extend({
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
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

export const insertLabOrderSchema = createInsertSchema(labOrders).omit({
  id: true,
  createdAt: true,
});

export const insertPatientQueueSchema = createInsertSchema(patientQueue).omit({
  id: true,
  checkedInAt: true,
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({
  id: true,
  createdAt: true,
});

export const insertDispensingRecordSchema = createInsertSchema(dispensingRecords).omit({
  id: true,
  dispensedAt: true,
});

export const insertClaimAppealSchema = createInsertSchema(claimAppeals).omit({
  id: true,
  createdAt: true,
});

export const insertInsurancePolicySchema = createInsertSchema(insurancePolicies).omit({
  id: true,
  createdAt: true,
});

export const insertOnboardingAuditSchema = createInsertSchema(onboardingAudits).omit({
  id: true,
  timestamp: true,
});

export const insertSampleClaimFlowSchema = createInsertSchema(sampleClaimFlows).omit({
  id: true,
  createdAt: true,
});

export const onboardingFormSchema = z.object({
  organizationType: z.enum(["hospital", "clinic", "pharmacy-chain", "insurer"]),
  organizationName: z.string().min(2, "Organization name is required"),
  domain: z.string().min(3, "Domain is required").regex(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/, "Invalid domain format"),
  contactPerson: z.string().min(2, "Contact person is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(10, "Complete address is required"),
  licenseNumber: z.string().min(5, "License number is required"),
  schemesSupported: z.array(z.string()).min(1, "Select at least one scheme"),
  branch: z.string().optional(),
  servicesOffered: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  operatingHours: z.string().optional(),
  emergencyServices: z.boolean().optional(),
});

export const userPermissionSchema = z.object({
  providerId: z.number(),
  users: z.array(z.object({
    name: z.string().min(2),
    email: z.string().email(),
    role: z.enum(["doctor", "pharmacist", "care-manager", "front-office", "admin"]),
    department: z.string().optional(),
    cadre: z.string().optional(),
    registrationNumber: z.string().optional(),
    permissions: z.array(z.string()),
  })),
});

// Types
export type CareProvider = typeof careProviders.$inferSelect;
export type InsertCareProvider = z.infer<typeof insertCareProviderSchema>;
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
export type LabOrder = typeof labOrders.$inferSelect;
export type InsertLabOrder = z.infer<typeof insertLabOrderSchema>;
export type PatientQueue = typeof patientQueue.$inferSelect;
export type InsertPatientQueue = z.infer<typeof insertPatientQueueSchema>;
export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type InsuranceScheme = typeof insuranceSchemes.$inferSelect;
export type BenefitUsage = typeof benefitUsage.$inferSelect;
export type DispensingRecord = typeof dispensingRecords.$inferSelect;
export type InsertDispensingRecord = z.infer<typeof insertDispensingRecordSchema>;
export type ClaimAppeal = typeof claimAppeals.$inferSelect;
export type InsertClaimAppeal = z.infer<typeof insertClaimAppealSchema>;
export type InsurancePolicy = typeof insurancePolicies.$inferSelect;
export type InsertInsurancePolicy = z.infer<typeof insertInsurancePolicySchema>;
export type OnboardingAudit = typeof onboardingAudits.$inferSelect;
export type InsertOnboardingAudit = z.infer<typeof insertOnboardingAuditSchema>;
export type SampleClaimFlow = typeof sampleClaimFlows.$inferSelect;
export type InsertSampleClaimFlow = z.infer<typeof insertSampleClaimFlowSchema>;
export type OnboardingForm = z.infer<typeof onboardingFormSchema>;
export type UserPermission = z.infer<typeof userPermissionSchema>;
