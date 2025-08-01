import { Router } from "express";
import { z } from "zod";
import { db } from "./db";
import { 
  policies, insurers, schemes, schemeBenefits, claimForms, 
  employerGroups, preauthorizationRules, policyApprovals, carePlans,
  memberPolicies, memberSchemes, policyExclusions 
} from "@shared/schema";
import { eq, and, desc, asc, ilike, inArray, sql } from "drizzle-orm";

const router = Router();

// Role-based access control middleware
function requireRole(allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const userRole = req.user.role;
    const userInsurerRole = req.user.insurerRole;
    
    // Check if user has the required role
    const hasRole = allowedRoles.some(role => 
      userRole === role || userInsurerRole === role
    );
    
    if (!hasRole) {
      return res.status(403).json({ 
        error: "Access denied", 
        required: allowedRoles,
        current: { role: userRole, insurerRole: userInsurerRole }
      });
    }
    
    next();
  };
}

// === INSURER ADMIN ONLY ENDPOINTS ===

// Get all policies for insurer admin
router.get("/policies", requireRole(["insurer_admin", "admin"]), async (req, res) => {
  try {
    const insurerId = req.query.insurerId as string;
    
    let query = db.select({
      id: policies.id,
      policyNumber: policies.policyNumber,
      policyName: policies.policyName,
      policyType: policies.policyType,
      effectiveDate: policies.effectiveDate,
      expiryDate: policies.expiryDate,
      premiumAmount: policies.premiumAmount,
      corporateClient: policies.corporateClient,
      isActive: policies.isActive,
      createdAt: policies.createdAt,
      insurerName: insurers.name,
      insurerCode: insurers.code
    })
    .from(policies)
    .leftJoin(insurers, eq(policies.insurerId, insurers.id))
    .orderBy(desc(policies.createdAt));

    if (insurerId) {
      query = query.where(eq(policies.insurerId, parseInt(insurerId)));
    }

    const result = await query;
    res.json(result);
  } catch (error) {
    console.error("Error fetching policies:", error);
    res.status(500).json({ error: "Failed to fetch policies" });
  }
});

// Create new policy (Insurer Admin only)
router.post("/policies", requireRole(["insurer_admin"]), async (req, res) => {
  try {
    const policySchema = z.object({
      insurerId: z.number(),
      policyNumber: z.string(),
      policyName: z.string(),
      policyType: z.enum(["individual", "family", "corporate", "government"]),
      effectiveDate: z.string(),
      expiryDate: z.string(),
      premiumAmount: z.number().optional(),
      corporateClient: z.string().optional()
    });

    const validated = policySchema.parse(req.body);
    
    const [newPolicy] = await db.insert(policies).values({
      ...validated,
      effectiveDate: new Date(validated.effectiveDate),
      expiryDate: new Date(validated.expiryDate),
      premiumAmount: validated.premiumAmount?.toString(),
    }).returning();

    // Create approval workflow entry
    await db.insert(policyApprovals).values({
      policyId: newPolicy.id,
      approvalStage: "draft",
      requestedBy: req.user.id,
      approverRole: "insurer_admin"
    });

    res.status(201).json(newPolicy);
  } catch (error) {
    console.error("Error creating policy:", error);
    res.status(500).json({ error: "Failed to create policy" });
  }
});

// Get schemes for a policy
router.get("/policies/:policyId/schemes", requireRole(["insurer_admin", "claims_manager", "care_manager"]), async (req, res) => {
  try {
    const policyId = parseInt(req.params.policyId);
    
    const result = await db.select({
      id: schemes.id,
      schemeName: schemes.schemeName,
      schemeCode: schemes.schemeCode,
      description: schemes.description,
      coverageType: schemes.coverageType,
      coverageValue: schemes.coverageValue,
      annualLimit: schemes.annualLimit,
      perVisitLimit: schemes.perVisitLimit,
      copayPercentage: schemes.copayPercentage,
      deductible: schemes.deductible,
      waitingPeriod: schemes.waitingPeriod,
      preauthorizationRequired: schemes.preauthorizationRequired,
      networkRestriction: schemes.networkRestriction,
      isActive: schemes.isActive,
      createdAt: schemes.createdAt
    })
    .from(schemes)
    .where(eq(schemes.policyId, policyId))
    .orderBy(asc(schemes.schemeName));

    res.json(result);
  } catch (error) {
    console.error("Error fetching schemes:", error);
    res.status(500).json({ error: "Failed to fetch schemes" });
  }
});

// Create new scheme (Insurer Admin only)
router.post("/policies/:policyId/schemes", requireRole(["insurer_admin"]), async (req, res) => {
  try {
    const policyId = parseInt(req.params.policyId);
    
    const schemeSchema = z.object({
      schemeName: z.string(),
      schemeCode: z.string(),
      description: z.string().optional(),
      coverageType: z.enum(["percentage", "fixed_amount", "hybrid"]),
      coverageValue: z.number().optional(),
      annualLimit: z.number().optional(),
      perVisitLimit: z.number().optional(),
      copayPercentage: z.number().optional(),
      deductible: z.number().optional(),
      waitingPeriod: z.number().optional(),
      preauthorizationRequired: z.boolean().default(false),
      networkRestriction: z.boolean().default(false)
    });

    const validated = schemeSchema.parse(req.body);
    
    const [newScheme] = await db.insert(schemes).values({
      policyId,
      ...validated,
      coverageValue: validated.coverageValue?.toString(),
      annualLimit: validated.annualLimit?.toString(),
      perVisitLimit: validated.perVisitLimit?.toString(),
      copayPercentage: validated.copayPercentage?.toString(),
      deductible: validated.deductible?.toString()
    }).returning();

    res.status(201).json(newScheme);
  } catch (error) {
    console.error("Error creating scheme:", error);
    res.status(500).json({ error: "Failed to create scheme" });
  }
});

// Get claim forms for insurer
router.get("/claim-forms", requireRole(["insurer_admin", "claims_manager"]), async (req, res) => {
  try {
    const insurerId = req.query.insurerId as string;
    
    let query = db.select({
      id: claimForms.id,
      formName: claimForms.formName,
      formType: claimForms.formType,
      formTemplate: claimForms.formTemplate,
      autoFillRules: claimForms.autoFillRules,
      validationRules: claimForms.validationRules,
      isActive: claimForms.isActive,
      version: claimForms.version,
      createdAt: claimForms.createdAt,
      insurerName: insurers.name
    })
    .from(claimForms)
    .leftJoin(insurers, eq(claimForms.insurerId, insurers.id))
    .orderBy(desc(claimForms.createdAt));

    if (insurerId) {
      query = query.where(eq(claimForms.insurerId, parseInt(insurerId)));
    }

    const result = await query;
    res.json(result);
  } catch (error) {
    console.error("Error fetching claim forms:", error);
    res.status(500).json({ error: "Failed to fetch claim forms" });
  }
});

// Create claim form template (Insurer Admin only)
router.post("/claim-forms", requireRole(["insurer_admin"]), async (req, res) => {
  try {
    const formSchema = z.object({
      insurerId: z.number(),
      formName: z.string(),
      formType: z.enum(["outpatient", "inpatient", "pharmacy", "dental", "optical"]),
      formTemplate: z.object({}).passthrough(),
      autoFillRules: z.object({}).passthrough().optional(),
      validationRules: z.object({}).passthrough().optional(),
      version: z.string().default("1.0")
    });

    const validated = formSchema.parse(req.body);
    
    const [newForm] = await db.insert(claimForms).values({
      ...validated,
      createdBy: req.user.id
    }).returning();

    res.status(201).json(newForm);
  } catch (error) {
    console.error("Error creating claim form:", error);
    res.status(500).json({ error: "Failed to create claim form" });
  }
});

// Get employer groups
router.get("/employer-groups", requireRole(["insurer_admin", "claims_manager", "care_manager"]), async (req, res) => {
  try {
    const insurerId = req.query.insurerId as string;
    
    let query = db.select({
      id: employerGroups.id,
      groupName: employerGroups.groupName,
      groupCode: employerGroups.groupCode,
      corporateClient: employerGroups.corporateClient,
      contactPerson: employerGroups.contactPerson,
      contactEmail: employerGroups.contactEmail,
      contactPhone: employerGroups.contactPhone,
      assignedSchemes: employerGroups.assignedSchemes,
      memberCount: employerGroups.memberCount,
      isActive: employerGroups.isActive,
      effectiveDate: employerGroups.effectiveDate,
      expiryDate: employerGroups.expiryDate,
      createdAt: employerGroups.createdAt,
      insurerName: insurers.name
    })
    .from(employerGroups)
    .leftJoin(insurers, eq(employerGroups.insurerId, insurers.id))
    .orderBy(desc(employerGroups.createdAt));

    if (insurerId) {
      query = query.where(eq(employerGroups.insurerId, parseInt(insurerId)));
    }

    const result = await query;
    res.json(result);
  } catch (error) {
    console.error("Error fetching employer groups:", error);
    res.status(500).json({ error: "Failed to fetch employer groups" });
  }
});

// Create employer group (Insurer Admin only)
router.post("/employer-groups", requireRole(["insurer_admin"]), async (req, res) => {
  try {
    const groupSchema = z.object({
      insurerId: z.number(),
      groupName: z.string(),
      groupCode: z.string(),
      corporateClient: z.string(),
      contactPerson: z.string().optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
      assignedSchemes: z.array(z.number()),
      memberCount: z.number().default(0),
      effectiveDate: z.string(),
      expiryDate: z.string().optional()
    });

    const validated = groupSchema.parse(req.body);
    
    const [newGroup] = await db.insert(employerGroups).values({
      ...validated,
      effectiveDate: new Date(validated.effectiveDate),
      expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
      createdBy: req.user.id
    }).returning();

    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error creating employer group:", error);
    res.status(500).json({ error: "Failed to create employer group" });
  }
});

// Get preauthorization rules
router.get("/preauth-rules", requireRole(["insurer_admin", "claims_manager"]), async (req, res) => {
  try {
    const insurerId = req.query.insurerId as string;
    const schemeId = req.query.schemeId as string;
    
    let query = db.select({
      id: preauthorizationRules.id,
      serviceType: preauthorizationRules.serviceType,
      serviceCode: preauthorizationRules.serviceCode,
      serviceName: preauthorizationRules.serviceName,
      requiresPreauth: preauthorizationRules.requiresPreauth,
      autoApprovalThreshold: preauthorizationRules.autoApprovalThreshold,
      maxAmount: preauthorizationRules.maxAmount,
      frequencyLimit: preauthorizationRules.frequencyLimit,
      clinicalCriteria: preauthorizationRules.clinicalCriteria,
      ageRestrictions: preauthorizationRules.ageRestrictions,
      genderRestrictions: preauthorizationRules.genderRestrictions,
      isActive: preauthorizationRules.isActive,
      createdAt: preauthorizationRules.createdAt,
      insurerName: insurers.name,
      schemeName: schemes.schemeName
    })
    .from(preauthorizationRules)
    .leftJoin(insurers, eq(preauthorizationRules.insurerId, insurers.id))
    .leftJoin(schemes, eq(preauthorizationRules.schemeId, schemes.id))
    .orderBy(desc(preauthorizationRules.createdAt));

    if (insurerId) {
      query = query.where(eq(preauthorizationRules.insurerId, parseInt(insurerId)));
    }
    if (schemeId) {
      query = query.where(eq(preauthorizationRules.schemeId, parseInt(schemeId)));
    }

    const result = await query;
    res.json(result);
  } catch (error) {
    console.error("Error fetching preauth rules:", error);
    res.status(500).json({ error: "Failed to fetch preauth rules" });
  }
});

// === CARE MANAGER ENDPOINTS ===

// Get care plans assigned to care manager
router.get("/care-plans", requireRole(["care_manager", "admin"]), async (req, res) => {
  try {
    const careManagerId = req.user.role === "care_manager" ? req.user.id : req.query.careManagerId;
    
    let query = db.select({
      id: carePlans.id,
      planName: carePlans.planName,
      planDescription: carePlans.planDescription,
      healthConditions: carePlans.healthConditions,
      treatmentGoals: carePlans.treatmentGoals,
      assignedServices: carePlans.assignedServices,
      priority: carePlans.priority,
      status: carePlans.status,
      startDate: carePlans.startDate,
      expectedEndDate: carePlans.expectedEndDate,
      actualEndDate: carePlans.actualEndDate,
      notes: carePlans.notes,
      createdAt: carePlans.createdAt,
      patientFirstName: sql`patients.first_name`,
      patientLastName: sql`patients.last_name`,
      patientId: sql`patients.patient_id`,
      policyName: policies.policyName,
      insurerName: insurers.name
    })
    .from(carePlans)
    .leftJoin(sql`patients`, eq(carePlans.patientId, sql`patients.id`))
    .leftJoin(policies, eq(carePlans.policyId, policies.id))
    .leftJoin(insurers, eq(policies.insurerId, insurers.id))
    .orderBy(desc(carePlans.createdAt));

    if (careManagerId) {
      query = query.where(eq(carePlans.careManagerId, parseInt(careManagerId.toString())));
    }

    const result = await query;
    res.json(result);
  } catch (error) {
    console.error("Error fetching care plans:", error);
    res.status(500).json({ error: "Failed to fetch care plans" });
  }
});

// Create care plan (Care Manager only)
router.post("/care-plans", requireRole(["care_manager"]), async (req, res) => {
  try {
    const planSchema = z.object({
      patientId: z.number(),
      policyId: z.number().optional(),
      planName: z.string(),
      planDescription: z.string().optional(),
      healthConditions: z.array(z.string()).optional(),
      treatmentGoals: z.object({}).passthrough().optional(),
      assignedServices: z.object({}).passthrough().optional(),
      priority: z.enum(["high", "medium", "low"]).default("medium"),
      startDate: z.string(),
      expectedEndDate: z.string().optional()
    });

    const validated = planSchema.parse(req.body);
    
    const [newPlan] = await db.insert(carePlans).values({
      ...validated,
      careManagerId: req.user.id,
      startDate: new Date(validated.startDate),
      expectedEndDate: validated.expectedEndDate ? new Date(validated.expectedEndDate) : null
    }).returning();

    res.status(201).json(newPlan);
  } catch (error) {
    console.error("Error creating care plan:", error);
    res.status(500).json({ error: "Failed to create care plan" });
  }
});

// Get policy insights for care manager
router.get("/policy-insights", requireRole(["care_manager", "admin"]), async (req, res) => {
  try {
    const patientId = req.query.patientId as string;
    
    // Get patient's active policies with utilization data
    const result = await db.select({
      policyId: memberPolicies.id,
      policyName: policies.policyName,
      memberNumber: memberPolicies.memberNumber,
      memberType: memberPolicies.memberType,
      relationship: memberPolicies.relationship,
      enrollmentDate: memberPolicies.enrollmentDate,
      effectiveDate: memberPolicies.effectiveDate,
      terminationDate: memberPolicies.terminationDate,
      insurerName: insurers.name,
      insurerCode: insurers.code,
      schemeName: schemes.schemeName,
      schemeCode: schemes.schemeCode,
      annualLimit: schemes.annualLimit,
      perVisitLimit: schemes.perVisitLimit,
      copayPercentage: schemes.copayPercentage
    })
    .from(memberPolicies)
    .leftJoin(policies, eq(memberPolicies.policyId, policies.id))
    .leftJoin(insurers, eq(policies.insurerId, insurers.id))
    .leftJoin(memberSchemes, eq(memberSchemes.memberPolicyId, memberPolicies.id))
    .leftJoin(schemes, eq(memberSchemes.schemeId, schemes.id))
    .where(and(
      eq(memberPolicies.patientId, parseInt(patientId)),
      eq(memberPolicies.isActive, true)
    ));

    res.json(result);
  } catch (error) {
    console.error("Error fetching policy insights:", error);
    res.status(500).json({ error: "Failed to fetch policy insights" });
  }
});

export default router;