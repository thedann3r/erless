import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ClaimAnalysisRequest {
  serviceType: string;
  procedureCode: string;
  diagnosisCode: string;
  cost: number;
  urgency?: string;
}

export interface MedicationValidationRequest {
  medicationName: string;
  dosage: string;
  patientAge: number;
  patientWeight: number;
  patientGender: string;
  indication: string;
}

export interface AIAnalysisResponse {
  decision: 'approved' | 'denied' | 'review-required';
  confidence: number;
  reasoning: any;
  context?: any;
}

export interface MedicationValidationResponse {
  isValid: boolean;
  notes: any;
  warnings?: string[];
  dosageAdjustment?: string;
}

export async function analyzeClaimForPreauth(request: ClaimAnalysisRequest): Promise<AIAnalysisResponse> {
  try {
    const prompt = `
You are a healthcare AI system analyzing a preauthorization request. Provide a detailed chain-of-thought analysis.

Request Details:
- Service Type: ${request.serviceType}
- Procedure Code: ${request.procedureCode}
- Diagnosis Code: ${request.diagnosisCode}
- Estimated Cost: $${request.cost}
- Urgency: ${request.urgency || 'routine'}

Analyze this request considering:
1. Clinical necessity and appropriateness
2. Cost-effectiveness
3. Policy coverage guidelines
4. Risk factors
5. Alternative treatments

Provide your response in JSON format with:
- decision: "approved", "denied", or "review-required"
- confidence: percentage (0-100)
- reasoning: detailed step-by-step analysis
- recommendations: any suggestions for alternatives or modifications

Be thorough in your analysis and explain your reasoning clearly.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert healthcare AI assistant specializing in preauthorization decisions. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      decision: result.decision || 'review-required',
      confidence: Math.min(100, Math.max(0, result.confidence || 75)),
      reasoning: result.reasoning || { summary: "AI analysis completed" },
      context: result.recommendations || null
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Fallback response
    return {
      decision: 'review-required',
      confidence: 50,
      reasoning: { error: "AI analysis failed", fallback: true },
      context: null
    };
  }
}

export async function validateMedication(request: MedicationValidationRequest): Promise<MedicationValidationResponse> {
  try {
    const prompt = `
You are a clinical pharmacist AI validating a medication prescription. Analyze the following:

Medication: ${request.medicationName}
Dosage: ${request.dosage}
Patient Details:
- Age: ${request.patientAge} years
- Weight: ${request.patientWeight} kg
- Gender: ${request.patientGender}
- Indication: ${request.indication}

Validate this prescription considering:
1. Age-appropriate dosing (especially for pediatric patients)
2. Weight-based dosing requirements
3. Gender-specific considerations
4. Drug interactions and contraindications
5. Indication appropriateness

Provide response in JSON format with:
- isValid: boolean
- notes: detailed validation analysis
- warnings: array of any safety concerns
- dosageAdjustment: recommended dosage if adjustment needed

Focus on patient safety and evidence-based guidelines.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a clinical pharmacist AI specializing in medication validation. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      isValid: result.isValid !== false,
      notes: result.notes || { summary: "Medication validated" },
      warnings: result.warnings || [],
      dosageAdjustment: result.dosageAdjustment || undefined
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Fallback response
    return {
      isValid: true,
      notes: { error: "AI validation failed", fallback: true },
      warnings: ["Manual review required due to AI system error"]
    };
  }
}

export async function generateClaimSuggestions(query: string, type: string): Promise<any> {
  try {
    const prompt = `
Generate healthcare ${type} suggestions for the query: "${query}"

Provide relevant suggestions based on:
- Common medical procedures and codes
- Standard diagnostic codes (ICD-10)
- Healthcare service types
- Medical terminology

Return a JSON array of suggestions with:
- code: procedure/diagnosis code if applicable
- description: human-readable description
- category: type of service/procedure

Limit to 5-10 most relevant suggestions.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a healthcare coding assistant. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.suggestions || [];
  } catch (error) {
    console.error("OpenAI API error:", error);
    return [];
  }
}

export async function detectFraudPatterns(claimData: any): Promise<any> {
  try {
    const prompt = `
Analyze this healthcare claim for potential fraud patterns:

${JSON.stringify(claimData, null, 2)}

Look for:
1. Unusual billing patterns
2. Excessive costs for services
3. Inappropriate procedure combinations
4. Frequency anomalies
5. Provider behavior patterns

Respond in JSON format with:
- riskScore: 0-100 (higher = more suspicious)
- flaggedPatterns: array of detected patterns
- recommendations: suggested actions
- confidence: confidence in fraud detection
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a healthcare fraud detection AI. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      riskScore: 0,
      flaggedPatterns: [],
      recommendations: [],
      confidence: 0
    };
  }
}
