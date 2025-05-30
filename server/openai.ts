import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEMO_MODE = !process.env.OPENAI_API_KEY;
const openai = DEMO_MODE ? null : new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface AIPreauthorizationRequest {
  patientId: number;
  serviceType: string;
  clinicalJustification: string;
  estimatedCost: number;
  urgency: string;
  patientHistory?: any;
  policyData?: any;
}

export interface AIPreauthorizationResponse {
  decision: 'approved' | 'denied' | 'review';
  confidence: number;
  reasoning: {
    step: number;
    description: string;
    factor: string;
  }[];
  riskFactors: string[];
  recommendations?: string[];
}

export async function analyzePreauthorization(request: AIPreauthorizationRequest): Promise<AIPreauthorizationResponse> {
  if (DEMO_MODE) {
    // Demo mode with realistic responses
    const urgencyScore = request.urgency === 'emergency' ? 90 : request.urgency === 'urgent' ? 75 : 60;
    const costFactor = request.estimatedCost > 10000 ? 0.8 : 0.9;
    const confidence = Math.floor(urgencyScore * costFactor);
    
    return {
      decision: confidence > 80 ? 'approved' : confidence > 60 ? 'review' : 'denied',
      confidence,
      reasoning: [
        {
          step: 1,
          description: "Clinical necessity assessment",
          factor: `${request.clinicalJustification ? 'Adequate' : 'Insufficient'} clinical justification provided`
        },
        {
          step: 2,
          description: "Cost-benefit analysis",
          factor: `Estimated cost of $${request.estimatedCost} ${request.estimatedCost > 10000 ? 'requires additional review' : 'within normal range'}`
        },
        {
          step: 3,
          description: "Urgency evaluation",
          factor: `${request.urgency} priority case - ${urgencyScore}% urgency score`
        }
      ],
      riskFactors: request.estimatedCost > 10000 ? ['High cost procedure requires additional oversight'] : [],
      recommendations: confidence < 80 ? ['Consider alternative treatments', 'Request additional documentation'] : []
    };
  }

  try {
    const prompt = `You are a healthcare AI assistant analyzing a preauthorization request. Use chain-of-thought reasoning to evaluate this request.

Request Details:
- Service Type: ${request.serviceType}
- Clinical Justification: ${request.clinicalJustification}
- Estimated Cost: $${request.estimatedCost}
- Urgency: ${request.urgency}
- Patient History: ${JSON.stringify(request.patientHistory || {})}
- Policy Data: ${JSON.stringify(request.policyData || {})}

Analyze this request step by step:
1. Review clinical guidelines and medical necessity
2. Check policy coverage and limitations
3. Assess cost-effectiveness and alternatives
4. Evaluate patient's medical history and risk factors
5. Consider urgency and standard of care

Provide your analysis in JSON format with decision (approved/denied/review), confidence percentage (0-100), detailed reasoning chain, and any risk factors identified.`;

    const response = await openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant with expertise in healthcare preauthorization decisions. Always provide detailed, evidence-based reasoning."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      decision: result.decision || 'review',
      confidence: Math.min(100, Math.max(0, result.confidence || 50)),
      reasoning: result.reasoning || [],
      riskFactors: result.riskFactors || [],
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      decision: 'review',
      confidence: 0,
      reasoning: [{ step: 1, description: 'AI analysis failed - manual review required', factor: 'system_error' }],
      riskFactors: ['AI system unavailable'],
      recommendations: ['Perform manual review of request']
    };
  }
}

export interface FraudAnalysisRequest {
  providerId: number;
  claimPatterns: any[];
  billingHistory: any[];
  timeframe: string;
}

export interface FraudAnalysisResponse {
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  anomalies: string[];
  recommendations: string[];
}

export async function analyzeFraudPatterns(request: FraudAnalysisRequest): Promise<FraudAnalysisResponse> {
  if (DEMO_MODE) {
    // Demo mode with realistic fraud analysis
    const riskScore = request.claimPatterns.length > 5 ? 0.8 : 0.3;
    return {
      riskLevel: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low',
      confidence: Math.floor(riskScore * 100),
      anomalies: riskScore > 0.7 ? ['Unusual billing frequency', 'Duplicate claim patterns'] : [],
      recommendations: riskScore > 0.7 ? ['Manual review required', 'Audit billing practices'] : ['Continue monitoring']
    };
  }

  try {
    const prompt = `Analyze the following healthcare provider billing patterns for potential fraud indicators:

Provider ID: ${request.providerId}
Timeframe: ${request.timeframe}
Claim Patterns: ${JSON.stringify(request.claimPatterns)}
Billing History: ${JSON.stringify(request.billingHistory)}

Look for:
- Unusual billing frequency patterns
- Procedure code combinations that don't make clinical sense
- Outlier costs compared to similar providers
- Rapid increases in specific service types
- Geographic anomalies in patient distribution

Provide analysis in JSON format with risk level, confidence percentage, specific anomalies found, and recommendations.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a healthcare fraud detection AI with expertise in identifying billing anomalies and fraudulent patterns."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      riskLevel: result.riskLevel || 'low',
      confidence: Math.min(100, Math.max(0, result.confidence || 50)),
      anomalies: result.anomalies || [],
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error('Fraud analysis error:', error);
    return {
      riskLevel: 'low',
      confidence: 0,
      anomalies: ['Analysis failed - system error'],
      recommendations: ['Manual review recommended due to system error']
    };
  }
}

export interface PharmacyValidationRequest {
  medicationName: string;
  dosage: string;
  frequency: string;
  patientAge: number;
  patientWeight?: number;
  patientGender: string;
  indication: string;
  currentMedications: string[];
}

export interface PharmacyValidationResponse {
  isValid: boolean;
  confidence: number;
  warnings: string[];
  recommendations: string[];
  interactions: string[];
}

export async function validatePrescription(request: PharmacyValidationRequest): Promise<PharmacyValidationResponse> {
  if (DEMO_MODE) {
    // Demo mode with realistic prescription validation
    const hasInteractions = request.currentMedications.length > 2;
    const ageAppropriate = request.patientAge >= 18;
    
    return {
      isValid: ageAppropriate && !hasInteractions,
      confidence: ageAppropriate ? (hasInteractions ? 60 : 90) : 40,
      warnings: !ageAppropriate ? ['Age verification required'] : [],
      recommendations: hasInteractions ? ['Check for drug interactions', 'Consider alternative medications'] : ['Prescription appears appropriate'],
      interactions: hasInteractions ? ['Potential interaction with existing medications'] : []
    };
  }

  try {
    const prompt = `Validate this prescription for safety and appropriateness:

Medication: ${request.medicationName}
Dosage: ${request.dosage}
Frequency: ${request.frequency}
Patient Age: ${request.patientAge}
Patient Weight: ${request.patientWeight || 'Not provided'}kg
Patient Gender: ${request.patientGender}
Indication: ${request.indication}
Current Medications: ${request.currentMedications.join(', ')}

Check for:
- Age-appropriate dosing
- Weight-based dosing accuracy (especially for pediatric patients)
- Gender-specific considerations
- Drug interactions with current medications
- Contraindications for the indication
- Standard dosing guidelines

Provide validation results in JSON format.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a clinical pharmacist AI with expertise in medication safety, drug interactions, and dosing guidelines."
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
    
    return {
      isValid: result.isValid !== false,
      confidence: Math.min(100, Math.max(0, result.confidence || 80)),
      warnings: result.warnings || [],
      recommendations: result.recommendations || [],
      interactions: result.interactions || []
    };
  } catch (error) {
    console.error('Pharmacy validation error:', error);
    return {
      isValid: false,
      confidence: 0,
      warnings: ['Validation failed - manual review required'],
      recommendations: ['Consult with pharmacist for manual validation'],
      interactions: []
    };
  }
}

export async function suggestClaimCodes(serviceDescription: string, diagnosis?: string): Promise<{codes: string[], confidence: number}> {
  try {
    const prompt = `Suggest appropriate CPT and ICD-10 codes for the following medical service:

Service Description: ${serviceDescription}
Diagnosis: ${diagnosis || 'Not provided'}

Provide the most likely CPT procedure codes and ICD-10 diagnosis codes in JSON format with confidence scores.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical coding AI assistant with expertise in CPT and ICD-10 coding guidelines."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      codes: result.codes || [],
      confidence: Math.min(100, Math.max(0, result.confidence || 70))
    };
  } catch (error) {
    console.error('Code suggestion error:', error);
    return {
      codes: [],
      confidence: 0
    };
  }
}
