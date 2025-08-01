import { db } from "./db";
import { sql } from "drizzle-orm";

interface BenefitLookupResult {
  patient: {
    patientId: string;
    name: string;
  };
  activePolicies: {
    insurerName: string;
    insurerCode: string;
    policyName: string;
    memberNumber: string;
    memberType: string;
    schemes: {
      schemeName: string;
      schemeCode: string;
      annualLimit: number;
      perVisitLimit: number;
      benefits: {
        category: string;
        name: string;
        code: string;
        coverageAmount: number;
        coveragePercentage: number;
        sessionLimit: number;
        frequencyLimit: string;
        requiresPreauth: boolean;
      }[];
    }[];
  }[];
  coverageSummary: {
    totalActivePolicies: number;
    totalActiveSchemes: number;
    totalAvailableBenefits: number;
    totalAnnualCoverage: number;
    insurers: string[];
  };
}

export class RealTimeBenefitLookup {
  
  /**
   * Comprehensive real-time benefit lookup for patient during biometric verification
   * This simulates the exact workflow that happens during patient verification
   */
  async performRealTimeLookup(patientId: string): Promise<BenefitLookupResult | null> {
    try {
      // Step 1: Get patient basic info
      const patientQuery = await db.execute(sql`
        SELECT patient_id, first_name, last_name 
        FROM patients 
        WHERE patient_id = ${patientId} AND is_active = true
      `);

      if (!patientQuery.rows.length) {
        return null;
      }

      const patient = patientQuery.rows[0];

      // Step 2: Get comprehensive coverage details
      const coverageQuery = await db.execute(sql`
        SELECT 
          p.patient_id,
          CONCAT(p.first_name, ' ', p.last_name) as patient_name,
          i.name as insurer_name,
          i.code as insurer_code,
          pol.policy_name,
          mp.member_number,
          mp.member_type,
          s.scheme_name,
          s.scheme_code,
          s.annual_limit,
          s.per_visit_limit,
          sb.benefit_category,
          sb.benefit_name,
          sb.benefit_code,
          sb.coverage_amount,
          sb.coverage_percentage,
          sb.session_limit,
          sb.frequency_limit,
          sb.is_preauthorized
        FROM patients p
        JOIN member_policies mp ON p.id = mp.patient_id
        JOIN policies pol ON mp.policy_id = pol.id
        JOIN insurers i ON pol.insurer_id = i.id
        JOIN member_schemes ms ON mp.id = ms.member_policy_id
        JOIN schemes s ON ms.scheme_id = s.id
        LEFT JOIN scheme_benefits sb ON s.id = sb.scheme_id
        WHERE p.patient_id = ${patientId}
          AND mp.is_active = true
          AND ms.is_active = true
          AND (sb.is_active = true OR sb.id IS NULL)
        ORDER BY i.name, s.scheme_name, sb.benefit_category, sb.benefit_name
      `);

      // Step 3: Get coverage summary
      const summaryQuery = await db.execute(sql`
        SELECT 
          COUNT(DISTINCT mp.id) as active_policies,
          COUNT(DISTINCT ms.scheme_id) as active_schemes,
          COUNT(DISTINCT sb.id) as available_benefits,
          STRING_AGG(DISTINCT i.name, ', ') as insurers,
          COALESCE(SUM(DISTINCT s.annual_limit), 0) as total_annual_coverage
        FROM patients p
        JOIN member_policies mp ON p.id = mp.patient_id
        JOIN policies pol ON mp.policy_id = pol.id
        JOIN insurers i ON pol.insurer_id = i.id
        JOIN member_schemes ms ON mp.id = ms.member_policy_id
        JOIN schemes s ON ms.scheme_id = s.id
        LEFT JOIN scheme_benefits sb ON s.id = sb.scheme_id
        WHERE p.patient_id = ${patientId}
          AND mp.is_active = true
          AND ms.is_active = true
          AND (sb.is_active = true OR sb.id IS NULL)
      `);

      // Step 4: Process and structure the data
      const activePolicies = this.structurePolicyData(coverageQuery.rows);
      const summary = summaryQuery.rows[0];

      return {
        patient: {
          patientId: patient.patient_id,
          name: `${patient.first_name} ${patient.last_name}`
        },
        activePolicies,
        coverageSummary: {
          totalActivePolicies: parseInt(summary?.active_policies || '0'),
          totalActiveSchemes: parseInt(summary?.active_schemes || '0'),
          totalAvailableBenefits: parseInt(summary?.available_benefits || '0'),
          totalAnnualCoverage: parseFloat(summary?.total_annual_coverage || '0'),
          insurers: summary?.insurers ? summary.insurers.split(', ') : []
        }
      };

    } catch (error) {
      console.error('Real-time benefit lookup error:', error);
      throw error;
    }
  }

  /**
   * Structure the raw database results into organized policy data
   */
  private structurePolicyData(rows: any[]): BenefitLookupResult['activePolicies'] {
    const policiesMap = new Map();

    for (const row of rows) {
      const policyKey = `${row.insurer_code}-${row.member_number}`;
      
      if (!policiesMap.has(policyKey)) {
        policiesMap.set(policyKey, {
          insurerName: row.insurer_name,
          insurerCode: row.insurer_code,
          policyName: row.policy_name,
          memberNumber: row.member_number,
          memberType: row.member_type,
          schemes: new Map()
        });
      }

      const policy = policiesMap.get(policyKey);
      const schemeKey = row.scheme_code;

      if (!policy.schemes.has(schemeKey)) {
        policy.schemes.set(schemeKey, {
          schemeName: row.scheme_name,
          schemeCode: row.scheme_code,
          annualLimit: parseFloat(row.annual_limit || '0'),
          perVisitLimit: parseFloat(row.per_visit_limit || '0'),
          benefits: []
        });
      }

      if (row.benefit_code) {
        policy.schemes.get(schemeKey).benefits.push({
          category: row.benefit_category,
          name: row.benefit_name,
          code: row.benefit_code,
          coverageAmount: parseFloat(row.coverage_amount || '0'),
          coveragePercentage: parseFloat(row.coverage_percentage || '0'),
          sessionLimit: parseInt(row.session_limit || '0'),
          frequencyLimit: row.frequency_limit,
          requiresPreauth: row.is_preauthorized || false
        });
      }
    }

    // Convert maps to arrays
    return Array.from(policiesMap.values()).map(policy => ({
      ...policy,
      schemes: Array.from(policy.schemes.values())
    }));
  }

  /**
   * Check if a specific service is covered under patient's policies
   */
  async checkServiceCoverage(patientId: string, serviceCode: string, serviceCategory: string): Promise<{
    isCovered: boolean;
    coverageDetails: any[];
    preauthorizationRequired: boolean;
  }> {
    try {
      const coverageQuery = await db.execute(sql`
        SELECT 
          i.name as insurer_name,
          s.scheme_name,
          sb.benefit_name,
          sb.coverage_amount,
          sb.coverage_percentage,
          sb.session_limit,
          sb.is_preauthorized
        FROM patients p
        JOIN member_policies mp ON p.id = mp.patient_id
        JOIN policies pol ON mp.policy_id = pol.id
        JOIN insurers i ON pol.insurer_id = i.id
        JOIN member_schemes ms ON mp.id = ms.member_policy_id
        JOIN schemes s ON ms.scheme_id = s.id
        JOIN scheme_benefits sb ON s.id = sb.scheme_id
        WHERE p.patient_id = ${patientId}
          AND mp.is_active = true
          AND ms.is_active = true
          AND sb.is_active = true
          AND (sb.benefit_code = ${serviceCode} OR sb.benefit_category = ${serviceCategory})
        ORDER BY sb.coverage_percentage DESC, sb.coverage_amount DESC
      `);

      const coverageDetails = coverageQuery.rows;
      const isCovered = coverageDetails.length > 0;
      const preauthorizationRequired = coverageDetails.some(coverage => coverage.is_preauthorized);

      return {
        isCovered,
        coverageDetails,
        preauthorizationRequired
      };

    } catch (error) {
      console.error('Service coverage check error:', error);
      throw error;
    }
  }
}

export const realTimeBenefitLookup = new RealTimeBenefitLookup();