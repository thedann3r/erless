import { eq, and, desc, sum, sql, gte, lte } from "drizzle-orm";
import { db } from "./db";
import {
  insurers,
  policies,
  schemes,
  schemeBenefits,
  memberPolicies,
  memberSchemes,
  policyExclusions,
  benefitUtilization,
  policyHistory,
  coverageMapping,
  patients,
  claims,
  type Insurer,
  type InsertInsurer,
  type Policy,
  type InsertPolicy,
  type Scheme,
  type InsertScheme,
  type SchemeBenefit,
  type InsertSchemeBenefit,
  type MemberPolicy,
  type InsertMemberPolicy,
  type MemberScheme,
  type InsertMemberScheme,
  type PolicyExclusion,
  type InsertPolicyExclusion,
  type BenefitUtilization,
  type InsertBenefitUtilization,
  type PolicyHistory,
  type InsertPolicyHistory,
  type CoverageMapping,
  type InsertCoverageMapping,
} from "@shared/schema";

export class InsurerPolicyStorage {
  
  // === INSURER MANAGEMENT ===
  
  async getAllInsurers(): Promise<Insurer[]> {
    return await db.select().from(insurers).where(eq(insurers.isActive, true));
  }

  async getInsurerById(id: number): Promise<Insurer | undefined> {
    const [insurer] = await db.select().from(insurers).where(eq(insurers.id, id));
    return insurer;
  }

  async createInsurer(data: InsertInsurer): Promise<Insurer> {
    const [insurer] = await db.insert(insurers).values(data).returning();
    return insurer;
  }

  async updateInsurer(id: number, data: Partial<InsertInsurer>): Promise<Insurer | undefined> {
    const [insurer] = await db
      .update(insurers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(insurers.id, id))
      .returning();
    return insurer;
  }

  async deleteInsurer(id: number): Promise<boolean> {
    const [result] = await db
      .update(insurers)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(insurers.id, id))
      .returning();
    return !!result;
  }

  // === POLICY MANAGEMENT ===
  
  async getPoliciesByInsurer(insurerId: number): Promise<Policy[]> {
    return await db
      .select()
      .from(policies)
      .where(and(eq(policies.insurerId, insurerId), eq(policies.isActive, true)));
  }

  async getPolicyById(id: number): Promise<Policy | undefined> {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id));
    return policy;
  }

  async createPolicy(data: InsertPolicy): Promise<Policy> {
    const [policy] = await db.insert(policies).values(data).returning();
    
    // Record policy creation in history
    await this.recordPolicyChange({
      policyId: policy.id,
      changeType: "created",
      changeDescription: "Policy created",
      newValues: policy,
      effectiveDate: data.effectiveDate,
    });
    
    return policy;
  }

  async updatePolicy(id: number, data: Partial<InsertPolicy>): Promise<Policy | undefined> {
    // Get current policy for history
    const currentPolicy = await this.getPolicyById(id);
    if (!currentPolicy) return undefined;
    
    const [policy] = await db
      .update(policies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(policies.id, id))
      .returning();

    // Record policy update in history
    await this.recordPolicyChange({
      policyId: id,
      changeType: "updated",
      changeDescription: "Policy updated",
      previousValues: currentPolicy,
      newValues: policy,
      effectiveDate: data.effectiveDate || currentPolicy.effectiveDate,
    });
    
    return policy;
  }

  async deactivatePolicy(id: number, reason: string): Promise<Policy | undefined> {
    const [policy] = await db
      .update(policies)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(policies.id, id))
      .returning();

    if (policy) {
      await this.recordPolicyChange({
        policyId: id,
        changeType: "cancelled",
        changeDescription: reason,
        effectiveDate: new Date().toISOString().split('T')[0],
      });
    }
    
    return policy;
  }

  // === SCHEME MANAGEMENT ===
  
  async getSchemesByPolicy(policyId: number): Promise<Scheme[]> {
    return await db
      .select()
      .from(schemes)
      .where(and(eq(schemes.policyId, policyId), eq(schemes.isActive, true)));
  }

  async getSchemeWithBenefits(id: number): Promise<any> {
    const scheme = await db.select().from(schemes).where(eq(schemes.id, id));
    if (!scheme[0]) return undefined;
    
    const benefits = await db
      .select()
      .from(schemeBenefits)
      .where(and(eq(schemeBenefits.schemeId, id), eq(schemeBenefits.isActive, true)));
    
    return {
      ...scheme[0],
      benefits
    };
  }

  async createScheme(data: InsertScheme): Promise<Scheme> {
    const [scheme] = await db.insert(schemes).values(data).returning();
    return scheme;
  }

  async updateScheme(id: number, data: Partial<InsertScheme>): Promise<Scheme | undefined> {
    const [scheme] = await db
      .update(schemes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schemes.id, id))
      .returning();
    return scheme;
  }

  async addSchemeBenefits(schemeId: number, benefits: InsertSchemeBenefit[]): Promise<SchemeBenefit[]> {
    const benefitsWithSchemeId = benefits.map(benefit => ({
      ...benefit,
      schemeId
    }));
    
    return await db.insert(schemeBenefits).values(benefitsWithSchemeId).returning();
  }

  // === MEMBER MANAGEMENT ===
  
  async assignSchemeToMember(data: InsertMemberScheme): Promise<MemberScheme> {
    const [memberScheme] = await db.insert(memberSchemes).values(data).returning();
    return memberScheme;
  }

  async getMemberPolicies(patientId: number): Promise<any[]> {
    return await db
      .select({
        memberPolicy: memberPolicies,
        policy: policies,
        insurer: insurers,
        schemes: schemes,
      })
      .from(memberPolicies)
      .leftJoin(policies, eq(memberPolicies.policyId, policies.id))
      .leftJoin(insurers, eq(policies.insurerId, insurers.id))
      .leftJoin(memberSchemes, eq(memberPolicies.id, memberSchemes.memberPolicyId))
      .leftJoin(schemes, eq(memberSchemes.schemeId, schemes.id))
      .where(and(
        eq(memberPolicies.patientId, patientId),
        eq(memberPolicies.isActive, true)
      ));
  }

  async getMemberBenefitSummary(patientId: number, financialYear: string): Promise<any> {
    // Get all active member policies and their schemes
    const memberData = await this.getMemberPolicies(patientId);
    
    // Get benefit utilization for the financial year
    const utilization = await db
      .select()
      .from(benefitUtilization)
      .leftJoin(memberPolicies, eq(benefitUtilization.memberPolicyId, memberPolicies.id))
      .leftJoin(schemes, eq(benefitUtilization.schemeId, schemes.id))
      .where(and(
        eq(memberPolicies.patientId, patientId),
        eq(benefitUtilization.financialYear, financialYear)
      ));
    
    return {
      memberPolicies: memberData,
      utilization: utilization,
      totalUtilized: utilization.reduce((sum, u) => sum + parseFloat(u.benefit_utilization?.amountUtilized || '0'), 0),
      lastUpdated: new Date().toISOString()
    };
  }

  // === ELIGIBILITY AND COVERAGE ===
  
  async checkEligibility(patientId: number, procedureCode: string, amountRequested: number): Promise<any> {
    // Get member's active schemes
    const memberSchemes = await db
      .select({
        scheme: schemes,
        policy: policies,
        memberPolicy: memberPolicies,
      })
      .from(memberSchemes)
      .leftJoin(schemes, eq(memberSchemes.schemeId, schemes.id))
      .leftJoin(memberPolicies, eq(memberSchemes.memberPolicyId, memberPolicies.id))
      .leftJoin(policies, eq(memberPolicies.policyId, policies.id))
      .where(and(
        eq(memberPolicies.patientId, patientId),
        eq(memberSchemes.isActive, true),
        eq(schemes.isActive, true),
        eq(policies.isActive, true)
      ));

    // Check coverage mapping for the procedure
    const coverageResults = await Promise.all(
      memberSchemes.map(async (ms) => {
        const coverage = await this.getCoverageMapping(ms.scheme.id, "CPT", procedureCode);
        
        // Get current year utilization
        const currentYear = new Date().getFullYear().toString();
        const [utilization] = await db
          .select({
            totalUtilized: sum(benefitUtilization.amountUtilized),
          })
          .from(benefitUtilization)
          .where(and(
            eq(benefitUtilization.memberPolicyId, ms.memberPolicy.id),
            eq(benefitUtilization.schemeId, ms.scheme.id),
            eq(benefitUtilization.financialYear, currentYear)
          ));

        const totalUtilized = parseFloat(utilization?.totalUtilized || '0');
        const remainingLimit = parseFloat(ms.scheme.annualLimit || '0') - totalUtilized;

        return {
          scheme: ms.scheme,
          policy: ms.policy,
          coverage: coverage,
          eligibleAmount: Math.min(amountRequested, remainingLimit),
          remainingLimit: remainingLimit,
          utilizationStatus: {
            utilized: totalUtilized,
            limit: ms.scheme.annualLimit,
            remaining: remainingLimit
          }
        };
      })
    );

    return {
      patientId,
      procedureCode,
      amountRequested,
      eligibilityResults: coverageResults,
      isEligible: coverageResults.some(cr => cr.eligibleAmount > 0),
      recommendedScheme: coverageResults.find(cr => cr.eligibleAmount === Math.max(...coverageResults.map(c => c.eligibleAmount)))
    };
  }

  async getCoverageMapping(schemeId: number, codeType: string, code: string): Promise<CoverageMapping | undefined> {
    const [mapping] = await db
      .select()
      .from(coverageMapping)
      .where(and(
        eq(coverageMapping.schemeId, schemeId),
        eq(coverageMapping.codeType, codeType),
        eq(coverageMapping.code, code),
        eq(coverageMapping.isActive, true)
      ));
    return mapping;
  }

  async createCoverageMapping(data: InsertCoverageMapping): Promise<CoverageMapping> {
    const [mapping] = await db.insert(coverageMapping).values(data).returning();
    return mapping;
  }

  // === EXCLUSIONS ===
  
  async getPolicyExclusions(policyId: number): Promise<PolicyExclusion[]> {
    return await db
      .select()
      .from(policyExclusions)
      .where(and(eq(policyExclusions.policyId, policyId), eq(policyExclusions.isActive, true)));
  }

  async createPolicyExclusion(data: InsertPolicyExclusion): Promise<PolicyExclusion> {
    const [exclusion] = await db.insert(policyExclusions).values(data).returning();
    return exclusion;
  }

  // === BENEFIT UTILIZATION ===
  
  async recordBenefitUtilization(data: InsertBenefitUtilization): Promise<BenefitUtilization> {
    const [utilization] = await db.insert(benefitUtilization).values(data).returning();
    return utilization;
  }

  async getMemberUtilizationHistory(patientId: number, financialYear?: string, schemeId?: number): Promise<BenefitUtilization[]> {
    let query = db
      .select()
      .from(benefitUtilization)
      .leftJoin(memberPolicies, eq(benefitUtilization.memberPolicyId, memberPolicies.id))
      .where(eq(memberPolicies.patientId, patientId));

    if (financialYear) {
      query = query.where(eq(benefitUtilization.financialYear, financialYear));
    }

    if (schemeId) {
      query = query.where(eq(benefitUtilization.schemeId, schemeId));
    }

    return await query.orderBy(desc(benefitUtilization.createdAt));
  }

  // === POLICY HISTORY ===
  
  async recordPolicyChange(data: InsertPolicyHistory): Promise<PolicyHistory> {
    const [history] = await db.insert(policyHistory).values(data).returning();
    return history;
  }

  async getPolicyHistory(policyId: number): Promise<PolicyHistory[]> {
    return await db
      .select()
      .from(policyHistory)
      .where(eq(policyHistory.policyId, policyId))
      .orderBy(desc(policyHistory.createdAt));
  }

  // === INTEGRATION HELPERS ===
  
  async getClaimFormTemplate(policyId: number): Promise<any> {
    const policy = await this.getPolicyById(policyId);
    if (!policy) return null;

    const insurer = await this.getInsurerById(policy.insurerId);
    const activeSchemes = await this.getSchemesByPolicy(policyId);

    return {
      policy: policy,
      insurer: insurer,
      schemes: activeSchemes,
      formFields: {
        // Standard fields that should be pre-filled
        insurerName: insurer?.name,
        policyNumber: policy.policyNumber,
        availableSchemes: activeSchemes.map(s => ({
          id: s.id,
          name: s.schemeName,
          code: s.schemeCode
        }))
      }
    };
  }

  async checkPreauthorizationRequirement(
    patientId: number, 
    procedureCode: string, 
    amount: number, 
    urgency: string
  ): Promise<any> {
    const memberSchemes = await this.getMemberPolicies(patientId);
    
    const preauthChecks = await Promise.all(
      memberSchemes.map(async (ms) => {
        const coverage = await this.getCoverageMapping(ms.schemes?.id || 0, "CPT", procedureCode);
        
        return {
          scheme: ms.schemes,
          policy: ms.policy,
          requiresPreauth: ms.schemes?.preauthorizationRequired || 
                          coverage?.coverageType === "preauth_required" ||
                          amount > parseFloat(ms.schemes?.perVisitLimit || '0'),
          urgency: urgency,
          autoApprovalEligible: urgency === "emergency" && amount < 10000, // Example rule
        };
      })
    );

    return {
      patientId,
      procedureCode,
      amount,
      urgency,
      preauthRequirements: preauthChecks,
      overallRequiresPreauth: preauthChecks.some(pc => pc.requiresPreauth && !pc.autoApprovalEligible)
    };
  }

  async processAutomaticDeduction(
    claimId: number,
    patientId: number, 
    amount: number, 
    benefitCategory: string
  ): Promise<any> {
    const currentYear = new Date().getFullYear().toString();
    
    // Find the appropriate member scheme for deduction
    const memberSchemes = await this.getMemberPolicies(patientId);
    const appropriateScheme = memberSchemes.find(ms => 
      ms.schemes?.schemeName?.toLowerCase().includes(benefitCategory.toLowerCase())
    );

    if (!appropriateScheme) {
      throw new Error("No appropriate scheme found for benefit category");
    }

    // Record the deduction
    const utilization = await this.recordBenefitUtilization({
      memberPolicyId: appropriateScheme.memberPolicy.id,
      schemeId: appropriateScheme.schemes.id,
      claimId: claimId,
      utilizationDate: new Date().toISOString().split('T')[0],
      amountUtilized: amount.toString(),
      financialYear: currentYear,
    });

    return {
      claimId,
      utilizationRecord: utilization,
      deductedAmount: amount,
      scheme: appropriateScheme.schemes,
      success: true
    };
  }
}