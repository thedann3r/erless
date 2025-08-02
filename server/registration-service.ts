import fs from "fs/promises";
import path from "path";

export interface RegistrationData {
  registrationNumber: string;
  fullName: string;
  cadre: string;
  specialization: string;
  status: "active" | "inactive" | "suspended";
  facility: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  board: string;
  practiceLicense: string;
  registrationDate: string;
  suspensionReason?: string;
  inactiveReason?: string;
}

export interface RegistrationDatabase {
  practitioners: RegistrationData[];
}

export interface VerificationRequest {
  registrationNumber: string;
  cadre?: string;
}

export interface VerificationResponse {
  isValid: boolean;
  practitioner?: {
    fullName: string;
    status: string;
    cadre: string;
    specialization: string;
    facility: string;
    board: string;
    licenseExpiryDate: string;
    practiceLicense: string;
  };
  error?: string;
}

export class RegistrationValidationService {
  private dbPath: string;
  private cache: RegistrationDatabase | null = null;
  private cacheTimestamp: number = 0;
  private cacheTTL: number = 300000; // 5 minutes

  constructor() {
    this.dbPath = path.join(process.cwd(), "server", "registration-db.json");
  }

  private async loadDatabase(): Promise<RegistrationDatabase> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache && (now - this.cacheTimestamp) < this.cacheTTL) {
      return this.cache;
    }

    try {
      const data = await fs.readFile(this.dbPath, "utf-8");
      this.cache = JSON.parse(data) as RegistrationDatabase;
      this.cacheTimestamp = now;
      return this.cache;
    } catch (error) {
      console.error("Failed to load registration database:", error);
      throw new Error("Registration database unavailable");
    }
  }

  private normalizeRegistrationNumber(regNumber: string): string {
    return regNumber.toUpperCase().trim().replace(/\s+/g, "");
  }

  private isLicenseExpired(expiryDate: string): boolean {
    const expiry = new Date(expiryDate);
    const now = new Date();
    return expiry < now;
  }

  private getBoardFromRegistration(regNumber: string): string {
    const normalized = this.normalizeRegistrationNumber(regNumber);
    
    if (normalized.startsWith("KMPDC/")) {
      return "Kenya Medical Practitioners and Dentists Council";
    } else if (normalized.startsWith("COC/")) {
      return "Clinical Officers Council";
    } else if (normalized.startsWith("PPB/")) {
      return "Pharmacy and Poisons Board";
    } else if (normalized.startsWith("KNDI/")) {
      return "Kenya Nutritionists and Dietitians Institute";
    } else if (normalized.startsWith("KNCHR/")) {
      return "Kenya National Commission for Human Rights";
    }
    
    return "Unknown Board";
  }

  private validateCadreMatch(requested: string, actual: string): boolean {
    const normalizedRequested = requested.toLowerCase().trim();
    const normalizedActual = actual.toLowerCase().trim();
    
    // Direct match
    if (normalizedActual.includes(normalizedRequested)) {
      return true;
    }
    
    // Common variations
    const cadreMap: Record<string, string[]> = {
      "doctor": ["medical doctor", "physician", "dr", "md"],
      "pharmacist": ["pharm", "pharmaceutical", "pharmacy"],
      "clinical officer": ["clinical", "co", "clinician"],
      "nurse": ["nursing", "rn", "enrolled nurse"],
      "nutritionist": ["dietitian", "nutrition", "diet"]
    };
    
    for (const [key, variations] of Object.entries(cadreMap)) {
      if (variations.includes(normalizedRequested) && variations.some(v => normalizedActual.includes(v))) {
        return true;
      }
    }
    
    return false;
  }

  async verifyRegistration(request: VerificationRequest): Promise<VerificationResponse> {
    try {
      const database = await this.loadDatabase();
      const normalizedRegNumber = this.normalizeRegistrationNumber(request.registrationNumber);
      
      // Find practitioner by registration number
      const practitioner = database.practitioners.find(p => 
        this.normalizeRegistrationNumber(p.registrationNumber) === normalizedRegNumber
      );
      
      if (!practitioner) {
        return {
          isValid: false,
          error: "Registration number not found in database"
        };
      }
      
      // Check if cadre matches (if specified)
      if (request.cadre && !this.validateCadreMatch(request.cadre, practitioner.cadre)) {
        return {
          isValid: false,
          error: "Cadre mismatch - registration exists but for different profession"
        };
      }
      
      // Check if license is expired
      const isExpired = this.isLicenseExpired(practitioner.licenseExpiryDate);
      
      // Check status
      if (practitioner.status === "suspended") {
        return {
          isValid: false,
          error: `Registration suspended: ${practitioner.suspensionReason || "Under disciplinary action"}`
        };
      }
      
      if (practitioner.status === "inactive" || isExpired) {
        return {
          isValid: false,
          error: practitioner.inactiveReason || "License expired or inactive"
        };
      }
      
      // Valid registration
      return {
        isValid: true,
        practitioner: {
          fullName: practitioner.fullName,
          status: practitioner.status,
          cadre: practitioner.cadre,
          specialization: practitioner.specialization,
          facility: practitioner.facility,
          board: practitioner.board,
          licenseExpiryDate: practitioner.licenseExpiryDate,
          practiceLicense: practitioner.practiceLicense
        }
      };
      
    } catch (error) {
      console.error("Registration verification error:", error);
      return {
        isValid: false,
        error: "Verification service temporarily unavailable"
      };
    }
  }

  async getAllBoards(): Promise<string[]> {
    try {
      const database = await this.loadDatabase();
      const boards = new Set(database.practitioners.map(p => p.board));
      return Array.from(boards);
    } catch (error) {
      console.error("Failed to get boards:", error);
      return [];
    }
  }

  async getStatistics(): Promise<{
    totalPractitioners: number;
    activePractitioners: number;
    suspendedPractitioners: number;
    expiredLicenses: number;
    boardBreakdown: Record<string, number>;
  }> {
    try {
      const database = await this.loadDatabase();
      const practitioners = database.practitioners;
      
      const stats = {
        totalPractitioners: practitioners.length,
        activePractitioners: practitioners.filter(p => p.status === "active" && !this.isLicenseExpired(p.licenseExpiryDate)).length,
        suspendedPractitioners: practitioners.filter(p => p.status === "suspended").length,
        expiredLicenses: practitioners.filter(p => this.isLicenseExpired(p.licenseExpiryDate)).length,
        boardBreakdown: {} as Record<string, number>
      };
      
      // Board breakdown
      practitioners.forEach(p => {
        stats.boardBreakdown[p.board] = (stats.boardBreakdown[p.board] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error("Failed to get statistics:", error);
      throw error;
    }
  }

  async searchPractitioners(query: {
    name?: string;
    facility?: string;
    cadre?: string;
    board?: string;
    status?: string;
  }): Promise<RegistrationData[]> {
    try {
      const database = await this.loadDatabase();
      let results = database.practitioners;
      
      if (query.name) {
        const nameQuery = query.name.toLowerCase();
        results = results.filter(p => 
          p.fullName.toLowerCase().includes(nameQuery)
        );
      }
      
      if (query.facility) {
        const facilityQuery = query.facility.toLowerCase();
        results = results.filter(p => 
          p.facility.toLowerCase().includes(facilityQuery)
        );
      }
      
      if (query.cadre) {
        results = results.filter(p => 
          this.validateCadreMatch(query.cadre!, p.cadre)
        );
      }
      
      if (query.board) {
        results = results.filter(p => 
          p.board.toLowerCase().includes(query.board!.toLowerCase())
        );
      }
      
      if (query.status) {
        results = results.filter(p => p.status === query.status);
      }
      
      return results;
    } catch (error) {
      console.error("Search failed:", error);
      throw error;
    }
  }
}

export const registrationService = new RegistrationValidationService();