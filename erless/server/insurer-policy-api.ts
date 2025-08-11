import { Express, Request, Response } from "express";
import { z } from "zod";
import { storage } from "./storage";
import {
  insertInsurerSchema,
  insertPolicySchema,
  insertSchemeSchema,
  insertSchemeBenefitSchema,
  insertMemberPolicySchema,
  insertMemberSchemeSchema,
  insertPolicyExclusionSchema,
  insertBenefitUtilizationSchema,
  insertPolicyHistorySchema,
  insertCoverageMappingSchema,
} from "@shared/schema";

// Helper function to handle async route errors
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export function setupInsurerPolicyAPI(app: Express) {
  
  // === INSURER MANAGEMENT ===
  
  // Get all insurers
  app.get("/api/insurers", asyncHandler(async (req: Request, res: Response) => {
    const insurers = await storage.getAllInsurers();
    res.json(insurers);
  }));

  // Get single insurer by ID
  app.get("/api/insurers/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const insurer = await storage.getInsurerById(id);
    
    if (!insurer) {
      return res.status(404).json({ error: "Insurer not found" });
    }
    
    res.json(insurer);
  }));

  // Create new insurer
  app.post("/api/insurers", asyncHandler(async (req: Request, res: Response) => {
    const validatedData = insertInsurerSchema.parse(req.body);
    const insurer = await storage.createInsurer(validatedData);
    res.status(201).json(insurer);
  }));

  // Update insurer
  app.put("/api/insurers/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const validatedData = insertInsurerSchema.parse(req.body);
    const insurer = await storage.updateInsurer(id, validatedData);
    
    if (!insurer) {
      return res.status(404).json({ error: "Insurer not found" });
    }
    
    res.json(insurer);
  }));

  // Delete insurer
  app.delete("/api/insurers/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteInsurer(id);
    
    if (!success) {
      return res.status(404).json({ error: "Insurer not found" });
    }
    
    res.status(204).send();
  }));

  // === POLICY MANAGEMENT ===
  
  // Get all policies for an insurer
  app.get("/api/insurers/:insurerId/policies", asyncHandler(async (req: Request, res: Response) => {
    const insurerId = parseInt(req.params.insurerId);
    const policies = await storage.getPoliciesByInsurer(insurerId);
    res.json(policies);
  }));

  // Get single policy
  app.get("/api/policies/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const policy = await storage.getPolicyById(id);
    
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }
    
    res.json(policy);
  }));

  // Create new policy
  app.post("/api/policies", asyncHandler(async (req: Request, res: Response) => {
    const validatedData = insertPolicySchema.parse(req.body);
    const policy = await storage.createPolicy(validatedData);
    res.status(201).json(policy);
  }));

  // Update policy
  app.put("/api/policies/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const validatedData = insertPolicySchema.parse(req.body);
    const policy = await storage.updatePolicy(id, validatedData);
    
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }
    
    res.json(policy);
  }));

  // Mark policy as expired/inactive
  app.patch("/api/policies/:id/deactivate", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { reason } = req.body;
    
    const policy = await storage.deactivatePolicy(id, reason);
    
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }
    
    res.json(policy);
  }));

  // === SCHEME MANAGEMENT ===
  
  // Get all schemes for a policy
  app.get("/api/policies/:policyId/schemes", asyncHandler(async (req: Request, res: Response) => {
    const policyId = parseInt(req.params.policyId);
    const schemes = await storage.getSchemesByPolicy(policyId);
    res.json(schemes);
  }));

  // Get single scheme with benefits
  app.get("/api/schemes/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const scheme = await storage.getSchemeWithBenefits(id);
    
    if (!scheme) {
      return res.status(404).json({ error: "Scheme not found" });
    }
    
    res.json(scheme);
  }));

  // Create new scheme
  app.post("/api/schemes", asyncHandler(async (req: Request, res: Response) => {
    const validatedData = insertSchemeSchema.parse(req.body);
    const scheme = await storage.createScheme(validatedData);
    res.status(201).json(scheme);
  }));

  // Update scheme
  app.put("/api/schemes/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const validatedData = insertSchemeSchema.parse(req.body);
    const scheme = await storage.updateScheme(id, validatedData);
    
    if (!scheme) {
      return res.status(404).json({ error: "Scheme not found" });
    }
    
    res.json(scheme);
  }));

  // Add benefits to scheme
  app.post("/api/schemes/:schemeId/benefits", asyncHandler(async (req: Request, res: Response) => {
    const schemeId = parseInt(req.params.schemeId);
    const benefits = z.array(insertSchemeBenefitSchema).parse(req.body);
    
    const schemeBenefits = await storage.addSchemeBenefits(schemeId, benefits);
    res.status(201).json(schemeBenefits);
  }));

  // === MEMBER MANAGEMENT ===
  
  // Assign scheme to member
  app.post("/api/members/schemes", asyncHandler(async (req: Request, res: Response) => {
    const validatedData = insertMemberSchemeSchema.parse(req.body);
    const memberScheme = await storage.assignSchemeToMember(validatedData);
    res.status(201).json(memberScheme);
  }));

  // Get member's active policies and schemes
  app.get("/api/members/:patientId/policies", asyncHandler(async (req: Request, res: Response) => {
    const patientId = parseInt(req.params.patientId);
    const memberPolicies = await storage.getMemberPolicies(patientId);
    res.json(memberPolicies);
  }));

  // Get member's benefit summary for biometric verification
  app.get("/api/members/:patientId/benefits", asyncHandler(async (req: Request, res: Response) => {
    const patientId = parseInt(req.params.patientId);
    const { financialYear } = req.query;
    
    const benefitSummary = await storage.getMemberBenefitSummary(
      patientId, 
      financialYear as string || new Date().getFullYear().toString()
    );
    
    res.json(benefitSummary);
  }));

  // Real-time eligibility check during biometric verification
  app.post("/api/eligibility/check", asyncHandler(async (req: Request, res: Response) => {
    const { patientId, procedureCode, amountRequested } = req.body;
    
    const eligibility = await storage.checkEligibility(patientId, procedureCode, amountRequested);
    res.json(eligibility);
  }));

  // === EXCLUSIONS AND COVERAGE MAPPING ===
  
  // Get policy exclusions
  app.get("/api/policies/:policyId/exclusions", asyncHandler(async (req: Request, res: Response) => {
    const policyId = parseInt(req.params.policyId);
    const exclusions = await storage.getPolicyExclusions(policyId);
    res.json(exclusions);
  }));

  // Add policy exclusion
  app.post("/api/exclusions", asyncHandler(async (req: Request, res: Response) => {
    const validatedData = insertPolicyExclusionSchema.parse(req.body);
    const exclusion = await storage.createPolicyExclusion(validatedData);
    res.status(201).json(exclusion);
  }));

  // Get coverage mapping for procedure/diagnosis codes
  app.get("/api/coverage/:schemeId/:codeType/:code", asyncHandler(async (req: Request, res: Response) => {
    const { schemeId, codeType, code } = req.params;
    
    const coverage = await storage.getCoverageMapping(
      parseInt(schemeId), 
      codeType, 
      code
    );
    
    if (!coverage) {
      return res.status(404).json({ error: "Coverage mapping not found" });
    }
    
    res.json(coverage);
  }));

  // Add coverage mapping
  app.post("/api/coverage", asyncHandler(async (req: Request, res: Response) => {
    const validatedData = insertCoverageMappingSchema.parse(req.body);
    const mapping = await storage.createCoverageMapping(validatedData);
    res.status(201).json(mapping);
  }));

  // === BENEFIT UTILIZATION TRACKING ===
  
  // Record benefit utilization (called during claims processing)
  app.post("/api/utilization", asyncHandler(async (req: Request, res: Response) => {
    const validatedData = insertBenefitUtilizationSchema.parse(req.body);
    const utilization = await storage.recordBenefitUtilization(validatedData);
    res.status(201).json(utilization);
  }));

  // Get utilization history for a member
  app.get("/api/members/:patientId/utilization", asyncHandler(async (req: Request, res: Response) => {
    const patientId = parseInt(req.params.patientId);
    const { financialYear, schemeId } = req.query;
    
    const utilization = await storage.getMemberUtilizationHistory(
      patientId,
      financialYear as string,
      schemeId ? parseInt(schemeId as string) : undefined
    );
    
    res.json(utilization);
  }));

  // === POLICY HISTORY AND AUDIT ===
  
  // Get policy change history
  app.get("/api/policies/:policyId/history", asyncHandler(async (req: Request, res: Response) => {
    const policyId = parseInt(req.params.policyId);
    const history = await storage.getPolicyHistory(policyId);
    res.json(history);
  }));

  // Record policy change
  app.post("/api/policies/history", asyncHandler(async (req: Request, res: Response) => {
    const validatedData = insertPolicyHistorySchema.parse(req.body);
    const historyRecord = await storage.recordPolicyChange(validatedData);
    res.status(201).json(historyRecord);
  }));

  // === INTEGRATION ENDPOINTS FOR CLAIMS PROCESSING ===
  
  // Auto-fill claim form data based on policy
  app.get("/api/policies/:policyId/claim-template", asyncHandler(async (req: Request, res: Response) => {
    const policyId = parseInt(req.params.policyId);
    const template = await storage.getClaimFormTemplate(policyId);
    res.json(template);
  }));

  // Preauthorization lookup
  app.post("/api/preauth/lookup", asyncHandler(async (req: Request, res: Response) => {
    const { patientId, procedureCode, amount, urgency } = req.body;
    
    const preauthRequirement = await storage.checkPreauthorizationRequirement(
      patientId,
      procedureCode,
      amount,
      urgency
    );
    
    res.json(preauthRequirement);
  }));

  // Benefit auto-deduction for approved claims
  app.post("/api/benefits/deduct", asyncHandler(async (req: Request, res: Response) => {
    const { claimId, patientId, amount, benefitCategory } = req.body;
    
    const deduction = await storage.processAutomaticDeduction(
      claimId,
      patientId,
      amount,
      benefitCategory
    );
    
    res.json(deduction);
  }));

  // Error handling middleware
  app.use("/api", (error: any, req: Request, res: Response, next: Function) => {
    console.error("API Error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors
      });
    }
    
    res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  });
}