import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface PatientHistory {
  previousClaims: Array<{
    serviceType: string;
    diagnosisCode: string;
    cost: number;
    date: string;
  }>;
  currentMedications: string[];
  allergies: string[];
  chronicConditions: string[];
}

interface PolicyData {
  coverageDetails: Record<string, any>;
  benefitLimits: Record<string, number>;
  exclusions: string[];
}

interface PreauthorizationRequest {
  treatmentDescription: string;
  clinicalJustification: string;
  estimatedCost: number;
  urgency: 'routine' | 'urgent' | 'emergency';
  diagnosisCode?: string;
  procedureCode?: string;
}

interface AIDecision {
  decision: 'approved' | 'denied' | 'review_required';
  confidence: number;
  reasoning: string[];
  chainOfThought: Array<{
    step: number;
    description: string;
    result: string;
  }>;
  ragContext?: {
    similarCases: number;
    policyReferences: string[];
    clinicalGuidelines: string[];
  };
}

interface ClaimAnalysis {
  fraudScore: number;
  anomalies: string[];
  recommendations: string[];
  confidence: number;
}

export class AIService {
  // Preauthorization decision using Chain-of-Thought reasoning
  async processPreauthorization(
    request: PreauthorizationRequest,
    patientHistory: PatientHistory,
    policyData: PolicyData
  ): Promise<AIDecision> {
    try {
      const prompt = `
You are an AI healthcare preauthorization specialist. Analyze the following preauthorization request using chain-of-thought reasoning and provide a detailed decision.

PREAUTHORIZATION REQUEST:
Treatment: ${request.treatmentDescription}
Clinical Justification: ${request.clinicalJustification}
Estimated Cost: $${request.estimatedCost}
Urgency: ${request.urgency}
Diagnosis Code: ${request.diagnosisCode || 'Not provided'}
Procedure Code: ${request.procedureCode || 'Not provided'}

PATIENT HISTORY:
Previous Claims: ${JSON.stringify(patientHistory.previousClaims)}
Current Medications: ${patientHistory.currentMedications.join(', ')}
Allergies: ${patientHistory.allergies.join(', ')}
Chronic Conditions: ${patientHistory.chronicConditions.join(', ')}

POLICY DATA:
Coverage Details: ${JSON.stringify(policyData.coverageDetails)}
Benefit Limits: ${JSON.stringify(policyData.benefitLimits)}
Exclusions: ${JSON.stringify(policyData.exclusions)}

Please analyze this request step by step and provide your decision in the following JSON format:
{
  "decision": "approved|denied|review_required",
  "confidence": number (0-100),
  "reasoning": ["reason1", "reason2", "reason3"],
  "chainOfThought": [
    {
      "step": 1,
      "description": "Policy Coverage Check",
      "result": "Description of findings"
    },
    {
      "step": 2,
      "description": "Clinical Necessity Assessment",
      "result": "Description of findings"
    },
    {
      "step": 3,
      "description": "Cost-Benefit Analysis",
      "result": "Description of findings"
    },
    {
      "step": 4,
      "description": "Risk Assessment",
      "result": "Description of findings"
    }
  ],
  "ragContext": {
    "similarCases": number,
    "policyReferences": ["ref1", "ref2"],
    "clinicalGuidelines": ["guideline1", "guideline2"]
  }
}
`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert healthcare AI that makes preauthorization decisions based on medical necessity, policy coverage, and clinical guidelines. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1, // Low temperature for consistent decision-making
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result as AIDecision;
    } catch (error) {
      console.error('AI preauthorization error:', error);
      throw new Error('Failed to process AI preauthorization: ' + (error as Error).message);
    }
  }

  // Fraud detection and claim analysis
  async analyzeClaim(
    claimData: {
      serviceType: string;
      procedureCode?: string;
      diagnosisCode?: string;
      cost: number;
      providerId: string;
      patientAge: number;
      serviceDate: string;
    },
    patientHistory: PatientHistory
  ): Promise<ClaimAnalysis> {
    try {
      const prompt = `
You are an AI fraud detection specialist for healthcare claims. Analyze the following claim for potential fraud, anomalies, and provide recommendations.

CLAIM DATA:
Service Type: ${claimData.serviceType}
Procedure Code: ${claimData.procedureCode || 'Not provided'}
Diagnosis Code: ${claimData.diagnosisCode || 'Not provided'}
Cost: $${claimData.cost}
Provider ID: ${claimData.providerId}
Patient Age: ${claimData.patientAge}
Service Date: ${claimData.serviceDate}

PATIENT HISTORY:
Previous Claims: ${JSON.stringify(patientHistory.previousClaims)}
Current Medications: ${patientHistory.currentMedications.join(', ')}
Chronic Conditions: ${patientHistory.chronicConditions.join(', ')}

Analyze for:
1. Unusual billing patterns
2. Inappropriate service for patient age/condition
3. Duplicate or overlapping services
4. Cost anomalies compared to standard rates
5. Timeline inconsistencies

Provide analysis in JSON format:
{
  "fraudScore": number (0-100, where 100 is highest fraud risk),
  "anomalies": ["anomaly1", "anomaly2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "confidence": number (0-100)
}
`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert fraud detection AI that analyzes healthcare claims for anomalies and potential fraud. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result as ClaimAnalysis;
    } catch (error) {
      console.error('AI fraud analysis error:', error);
      throw new Error('Failed to analyze claim for fraud: ' + (error as Error).message);
    }
  }

  // Prescription validation
  async validatePrescription(
    prescription: {
      medicationName: string;
      dosage: string;
      frequency: string;
      patientAge: number;
      patientWeight?: number;
      gender: string;
      indication: string;
    },
    patientHistory: PatientHistory
  ): Promise<{
    isValid: boolean;
    validationNotes: Array<{
      type: 'weight_based' | 'gender_sensitive' | 'drug_interaction' | 'age_appropriate' | 'indication_match';
      severity: 'info' | 'warning' | 'error';
      message: string;
    }>;
    recommendedCategory: 'chronic' | 'acute' | 'fp' | 'vax';
  }> {
    try {
      const prompt = `
You are an AI pharmacist validating a prescription. Analyze the following prescription for safety and appropriateness.

PRESCRIPTION:
Medication: ${prescription.medicationName}
Dosage: ${prescription.dosage}
Frequency: ${prescription.frequency}
Patient Age: ${prescription.patientAge}
Patient Weight: ${prescription.patientWeight || 'Not provided'} kg
Gender: ${prescription.gender}
Indication: ${prescription.indication}

PATIENT HISTORY:
Current Medications: ${patientHistory.currentMedications.join(', ')}
Allergies: ${patientHistory.allergies.join(', ')}
Chronic Conditions: ${patientHistory.chronicConditions.join(', ')}

Validate for:
1. Weight-based dosing (especially for pediatric patients)
2. Gender-sensitive prescribing
3. Drug interactions with current medications
4. Age-appropriate medication and dosing
5. Indication appropriateness

Provide validation in JSON format:
{
  "isValid": boolean,
  "validationNotes": [
    {
      "type": "weight_based|gender_sensitive|drug_interaction|age_appropriate|indication_match",
      "severity": "info|warning|error",
      "message": "Detailed message"
    }
  ],
  "recommendedCategory": "chronic|acute|fp|vax"
}
`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert clinical pharmacist AI that validates prescriptions for safety, appropriateness, and categorization. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result;
    } catch (error) {
      console.error('AI prescription validation error:', error);
      throw new Error('Failed to validate prescription: ' + (error as Error).message);
    }
  }

  // RAG system for retrieving relevant patient history and policy data
  async retrieveRelevantContext(
    query: string,
    contextType: 'patient_history' | 'policy_data' | 'clinical_guidelines'
  ): Promise<{
    relevantData: any[];
    confidence: number;
    sources: string[];
  }> {
    try {
      // This would integrate with a vector database in a real implementation
      // For now, we'll simulate RAG functionality
      const prompt = `
You are a RAG (Retrieval-Augmented Generation) system for healthcare data. 
Based on the query: "${query}" and context type: "${contextType}"

Simulate retrieving relevant data and provide:
{
  "relevantData": [
    "relevant_item_1",
    "relevant_item_2",
    "relevant_item_3"
  ],
  "confidence": number (0-100),
  "sources": [
    "source_1",
    "source_2"
  ]
}
`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a RAG system that retrieves relevant healthcare data based on queries. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result;
    } catch (error) {
      console.error('RAG retrieval error:', error);
      throw new Error('Failed to retrieve relevant context: ' + (error as Error).message);
    }
  }

  // Suggest appropriate procedure/diagnosis codes
  async suggestCodes(
    serviceDescription: string,
    clinicalContext: string
  ): Promise<{
    procedureCodes: Array<{ code: string; description: string; confidence: number }>;
    diagnosisCodes: Array<{ code: string; description: string; confidence: number }>;
  }> {
    try {
      const prompt = `
You are an AI medical coding specialist. Based on the service description and clinical context, suggest appropriate CPT procedure codes and ICD-10 diagnosis codes.

SERVICE DESCRIPTION: ${serviceDescription}
CLINICAL CONTEXT: ${clinicalContext}

Provide suggestions in JSON format:
{
  "procedureCodes": [
    {
      "code": "CPT_CODE",
      "description": "Description of procedure",
      "confidence": number (0-100)
    }
  ],
  "diagnosisCodes": [
    {
      "code": "ICD10_CODE",
      "description": "Description of diagnosis",
      "confidence": number (0-100)
    }
  ]
}
`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert medical coding AI that suggests appropriate CPT and ICD-10 codes. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result;
    } catch (error) {
      console.error('AI code suggestion error:', error);
      throw new Error('Failed to suggest medical codes: ' + (error as Error).message);
    }
  }
}

export const aiService = new AIService();
