import { careProviders, users, type CareProvider, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface DomainDetectionResult {
  careProvider: CareProvider | null;
  suggestedRole: string | null;
  suggestedCadre: string | null;
  branch: string | null;
  confidence: number;
}

export interface RegistrationValidationResult {
  isValid: boolean;
  registrationBody: string | null;
  cadre: string | null;
  specialization: string | null;
  expiryDate: string | null;
  errors: string[];
}

export class AuthenticationService {
  // Known care provider domains and their configurations
  private readonly knownDomains = [
    {
      domain: "aku.edu",
      name: "Aga Khan University Hospital",
      type: "hospital",
      defaultRoles: ["doctor", "clinician", "admin"]
    },
    {
      domain: "knh.or.ke",
      name: "Kenyatta National Hospital",
      type: "hospital",
      defaultRoles: ["doctor", "clinician", "admin"]
    },
    {
      domain: "mnh.or.tz",
      name: "Muhimbili National Hospital",
      type: "hospital",
      defaultRoles: ["doctor", "clinician", "admin"]
    },
    {
      domain: "pharmacy.co.ke",
      name: "Pharmacy Corporation",
      type: "pharmacy-chain",
      defaultRoles: ["pharmacist", "admin"]
    },
    {
      domain: "carepoint.health",
      name: "Carepoint Medical Centers",
      type: "clinic",
      defaultRoles: ["doctor", "clinician", "pharmacist"]
    }
  ];

  // Role detection patterns in email addresses
  private readonly rolePatterns = [
    { pattern: /dr\.|doc|doctor|physician/i, role: "doctor", cadre: "general-practitioner" },
    { pattern: /pharm|pharmacist/i, role: "pharmacist", cadre: "clinical-pharmacist" },
    { pattern: /nurse|nurs|rn|bsn/i, role: "clinician", cadre: "registered-nurse" },
    { pattern: /lab|laboratory|tech/i, role: "clinician", cadre: "laboratory-technician" },
    { pattern: /admin|administrator/i, role: "admin", cadre: null },
    { pattern: /debt|collection|finance/i, role: "debtor-officer", cadre: null },
    { pattern: /specialist|consultant/i, role: "doctor", cadre: "specialist" },
    { pattern: /registrar|resident/i, role: "doctor", cadre: "registrar" }
  ];

  // Professional registration validation patterns
  private readonly registrationPatterns = {
    doctor: {
      kenya: /^KMP\/\d{4,6}$/,
      tanzania: /^TMC\/\d{4,6}$/,
      uganda: /^UMC\/\d{4,6}$/
    },
    pharmacist: {
      kenya: /^PPB\/\d{4,6}$/,
      tanzania: /^TPC\/\d{4,6}$/,
      uganda: /^UPC\/\d{4,6}$/
    }
  };

  /**
   * Detect care provider and role information from email domain
   */
  async detectFromDomain(email: string): Promise<DomainDetectionResult> {
    const emailParts = email.toLowerCase().split('@');
    if (emailParts.length !== 2) {
      return { careProvider: null, suggestedRole: null, suggestedCadre: null, branch: null, confidence: 0 };
    }

    const [username, domain] = emailParts;
    
    // Check for branch in subdomain (e.g., branch1.aku.edu)
    const domainParts = domain.split('.');
    let baseDomain = domain;
    let branch = null;
    
    if (domainParts.length > 2) {
      // Potential subdomain/branch
      branch = domainParts[0];
      baseDomain = domainParts.slice(1).join('.');
    }

    // Look for existing care provider in database
    let careProvider = await this.findCareProviderByDomain(baseDomain);
    
    // If not found, check against known domains
    if (!careProvider) {
      const knownDomain = this.knownDomains.find(kd => kd.domain === baseDomain);
      if (knownDomain) {
        // Create new care provider entry
        careProvider = await this.createCareProvider({
          name: knownDomain.name,
          domain: baseDomain,
          type: knownDomain.type,
          branch: branch,
          address: null,
          licenseNumber: null,
          isActive: true
        });
      }
    }

    // Detect role from username patterns
    const roleDetection = this.detectRoleFromUsername(username);
    
    return {
      careProvider,
      suggestedRole: roleDetection.role,
      suggestedCadre: roleDetection.cadre,
      branch,
      confidence: careProvider ? (roleDetection.role ? 95 : 75) : (roleDetection.role ? 60 : 30)
    };
  }

  /**
   * Validate professional registration number
   */
  async validateRegistration(
    registrationNumber: string, 
    role: string, 
    country: string = 'kenya'
  ): Promise<RegistrationValidationResult> {
    const patterns = this.registrationPatterns[role as keyof typeof this.registrationPatterns];
    
    if (!patterns || !patterns[country as keyof typeof patterns]) {
      return {
        isValid: false,
        registrationBody: null,
        cadre: null,
        specialization: null,
        expiryDate: null,
        errors: [`Registration validation not available for ${role} in ${country}`]
      };
    }

    const pattern = patterns[country as keyof typeof patterns];
    const isValid = pattern.test(registrationNumber);

    if (!isValid) {
      return {
        isValid: false,
        registrationBody: null,
        cadre: null,
        specialization: null,
        expiryDate: null,
        errors: [`Invalid ${role} registration number format for ${country}`]
      };
    }

    // Simulate API call to professional board
    // In production, this would call the actual licensing board API
    return this.simulateRegistrationCheck(registrationNumber, role, country);
  }

  /**
   * Get role and care provider options for manual selection
   */
  getRoleOptions(): Array<{ value: string; label: string; requiresRegistration: boolean }> {
    return [
      { value: "doctor", label: "Doctor/Physician", requiresRegistration: true },
      { value: "clinician", label: "Clinician/Nurse", requiresRegistration: true },
      { value: "pharmacist", label: "Pharmacist", requiresRegistration: true },
      { value: "admin", label: "Administrator", requiresRegistration: false },
      { value: "debtor-officer", label: "Debtor Officer", requiresRegistration: false }
    ];
  }

  /**
   * Get cadre options based on role
   */
  getCadreOptions(role: string): Array<{ value: string; label: string }> {
    const cadreMap = {
      doctor: [
        { value: "general-practitioner", label: "General Practitioner" },
        { value: "specialist", label: "Specialist" },
        { value: "consultant", label: "Consultant" },
        { value: "registrar", label: "Registrar" },
        { value: "intern", label: "Medical Intern" }
      ],
      clinician: [
        { value: "registered-nurse", label: "Registered Nurse" },
        { value: "clinical-officer", label: "Clinical Officer" },
        { value: "laboratory-technician", label: "Laboratory Technician" },
        { value: "radiographer", label: "Radiographer" }
      ],
      pharmacist: [
        { value: "clinical-pharmacist", label: "Clinical Pharmacist" },
        { value: "hospital-pharmacist", label: "Hospital Pharmacist" },
        { value: "community-pharmacist", label: "Community Pharmacist" },
        { value: "pharmaceutical-technician", label: "Pharmaceutical Technician" }
      ]
    };

    return cadreMap[role as keyof typeof cadreMap] || [];
  }

  async getAllCareProviders(): Promise<CareProvider[]> {
    return await db.select().from(careProviders).where(eq(careProviders.isActive, true));
  }

  // Private helper methods
  private async findCareProviderByDomain(domain: string): Promise<CareProvider | null> {
    const [provider] = await db.select()
      .from(careProviders)
      .where(eq(careProviders.domain, domain))
      .limit(1);
    
    return provider || null;
  }

  private async createCareProvider(data: Omit<CareProvider, 'id' | 'createdAt'>): Promise<CareProvider> {
    const [provider] = await db.insert(careProviders)
      .values(data)
      .returning();
    
    return provider;
  }

  private detectRoleFromUsername(username: string): { role: string | null; cadre: string | null } {
    for (const pattern of this.rolePatterns) {
      if (pattern.pattern.test(username)) {
        return { role: pattern.role, cadre: pattern.cadre };
      }
    }
    return { role: null, cadre: null };
  }

  private async simulateRegistrationCheck(
    registrationNumber: string, 
    role: string, 
    country: string
  ): Promise<RegistrationValidationResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate successful validation for demo purposes
    const registrationBodies = {
      kenya: {
        doctor: "Kenya Medical Practitioners Board",
        pharmacist: "Pharmacy & Poisons Board"
      },
      tanzania: {
        doctor: "Tanzania Medical Council",
        pharmacist: "Tanzania Pharmacy Council"
      },
      uganda: {
        doctor: "Uganda Medical Council",
        pharmacist: "Uganda Pharmacy Council"
      }
    };

    const body = registrationBodies[country as keyof typeof registrationBodies]?.[role as keyof typeof registrationBodies.kenya];

    return {
      isValid: true,
      registrationBody: body || `${country.toUpperCase()} Professional Board`,
      cadre: role === "doctor" ? "general-practitioner" : `clinical-${role}`,
      specialization: null,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      errors: []
    };
  }
}

export const authService = new AuthenticationService();