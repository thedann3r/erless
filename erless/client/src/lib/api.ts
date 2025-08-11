import { apiRequest } from "./queryClient";

export interface PatientVerificationRequest {
  patientId?: string;
  biometricData?: string;
  otp?: string;
}

export interface ClaimRequest {
  patientId: number;
  providerId: number;
  serviceType: string;
  procedureCode?: string;
  diagnosisCode?: string;
  description?: string;
  serviceCost: string;
  insuranceCoverage?: string;
  patientResponsibility?: string;
}

export interface PreauthRequest {
  patientId: number;
  providerId: number;
  treatmentService: string;
  clinicalJustification?: string;
  estimatedCost?: string;
  urgency: string;
}

export interface MedicationRequest {
  patientId: number;
  providerId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration?: string;
  quantity: number;
  indication?: string;
  benefitCategory?: string;
}

export const api = {
  // Patient verification
  verifyPatient: async (data: PatientVerificationRequest) => {
    const response = await apiRequest("POST", "/api/patients/verify", data);
    return response.json();
  },

  searchPatients: async (query: string) => {
    const response = await apiRequest("GET", `/api/patients/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  // Claims
  createClaim: async (data: ClaimRequest) => {
    const response = await apiRequest("POST", "/api/claims", data);
    return response.json();
  },

  getClaims: async (params?: { status?: string; patientId?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.patientId) searchParams.set("patientId", params.patientId);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    
    const response = await apiRequest("GET", `/api/claims?${searchParams}`);
    return response.json();
  },

  voidClaim: async (id: number, reason: string, fingerprintApproval: boolean) => {
    const response = await apiRequest("PUT", `/api/claims/${id}/void`, {
      reason,
      fingerprintApproval
    });
    return response.json();
  },

  // Preauthorizations
  createPreauth: async (data: PreauthRequest) => {
    const response = await apiRequest("POST", "/api/preauthorizations", data);
    return response.json();
  },

  getPreauths: async (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiRequest("GET", `/api/preauthorizations${params}`);
    return response.json();
  },

  // Medications
  createMedication: async (data: MedicationRequest) => {
    const response = await apiRequest("POST", "/api/medications", data);
    return response.json();
  },

  // AI suggestions
  getAISuggestions: async (query: string, type: string) => {
    const response = await apiRequest("POST", "/api/ai/suggestions", { query, type });
    return response.json();
  },

  // Blockchain
  anchorToBlockchain: async (claimId: string, claimHash: string) => {
    const response = await apiRequest("POST", "/api/blockchain/anchor", {
      claimId,
      claimHash
    });
    return response.json();
  },

  verifyBlockchainTx: async (txHash: string) => {
    const response = await apiRequest("GET", `/api/blockchain/verify/${txHash}`);
    return response.json();
  },

  // Analytics
  getAnalyticsStats: async () => {
    const response = await apiRequest("GET", "/api/analytics/stats");
    return response.json();
  },

  getProviderPerformance: async () => {
    const response = await apiRequest("GET", "/api/analytics/providers");
    return response.json();
  },

  getFraudAlerts: async () => {
    const response = await apiRequest("GET", "/api/analytics/fraud");
    return response.json();
  },

  getAIDecisions: async (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiRequest("GET", `/api/ai/decisions${params}`);
    return response.json();
  }
};
