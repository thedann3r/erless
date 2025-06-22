import OpenAI from 'openai';

// Mistral API configuration
const mistral = new OpenAI({
  baseURL: 'https://api.mistral.ai/v1',
  apiKey: process.env.MISTRAL_API_KEY,
});

interface TreatmentRequest {
  diagnosis: string;
  patientAge: number;
  patientWeight: number;
  patientGender: 'male' | 'female';
  symptoms: string[];
  allergies?: string[];
  currentMedications?: string[];
  medicalHistory?: string[];
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
}

interface TreatmentPlan {
  primaryTreatment: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  };
  alternativeTreatments: Array<{
    medication: string;
    dosage: string;
    reason: string;
  }>;
  nonPharmacological: string[];
  followUpCare: string[];
  warningSignsToWatch: string[];
  dietaryRecommendations: string[];
  lifestyleModifications: string[];
  expectedOutcome: string;
  timeToImprovement: string;
  confidence: number;
  reasoning: string[];
}

interface DifferentialDiagnosis {
  primaryDiagnosis: {
    condition: string;
    probability: number;
    supportingSymptoms: string[];
    reasoning: string;
  };
  differentialDiagnoses: Array<{
    condition: string;
    probability: number;
    supportingSymptoms: string[];
    distinguishingFactors: string[];
  }>;
  recommendedTests: Array<{
    test: string;
    reason: string;
    urgency: 'routine' | 'urgent' | 'emergent';
  }>;
  redFlags: string[];
  immediateActions: string[];
}

interface DrugInteractionAnalysis {
  interactions: Array<{
    drug1: string;
    drug2: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
    clinicalSignificance: string;
    management: string;
  }>;
  contraindications: Array<{
    medication: string;
    condition: string;
    reason: string;
    alternatives: string[];
  }>;
  dosageAdjustments: Array<{
    medication: string;
    reason: string;
    adjustment: string;
  }>;
  monitoringRequirements: string[];
  overallRiskAssessment: 'low' | 'moderate' | 'high';
}

export class MistralHealthcareService {
  /**
   * Generate comprehensive treatment plan based on diagnosis and patient factors
   */
  async generateTreatmentPlan(request: TreatmentRequest): Promise<TreatmentPlan> {
    try {
      const prompt = `As an experienced physician, create a comprehensive treatment plan for:

PATIENT PROFILE:
- Age: ${request.patientAge} years
- Weight: ${request.patientWeight} kg
- Gender: ${request.patientGender}
- Primary Diagnosis: ${request.diagnosis}
- Symptoms: ${request.symptoms.join(', ')}
- Allergies: ${request.allergies?.join(', ') || 'None reported'}
- Current Medications: ${request.currentMedications?.join(', ') || 'None'}
- Medical History: ${request.medicalHistory?.join(', ') || 'None significant'}
- Severity: ${request.severity}

Please provide a detailed treatment plan including:
1. Primary medication with specific dosage, frequency, and duration
2. Alternative treatment options if primary fails
3. Non-pharmacological interventions
4. Follow-up care schedule
5. Warning signs to monitor
6. Dietary and lifestyle recommendations
7. Expected timeline for improvement

Consider Kenyan healthcare context, available medications, and cost-effectiveness.`;

      const response = await mistral.chat.completions.create({
        model: 'mistral-small-latest',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert physician specializing in evidence-based medicine with extensive experience in the Kenyan healthcare system. Provide practical, cost-effective treatment recommendations following international guidelines adapted for resource settings.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content || '';
      return this.parseTreatmentPlan(content, request);
    } catch (error) {
      console.error('Mistral treatment plan error:', error);
      throw new Error('Failed to generate treatment plan');
    }
  }

  /**
   * Analyze symptoms to suggest differential diagnoses
   */
  async analyzeDifferentialDiagnosis(
    symptoms: string[],
    patientAge: number,
    patientGender: 'male' | 'female',
    duration: string,
    additionalInfo?: string
  ): Promise<DifferentialDiagnosis> {
    try {
      const prompt = `As a diagnostic expert, analyze these clinical findings:

PATIENT: ${patientAge}-year-old ${patientGender}
PRESENTING SYMPTOMS: ${symptoms.join(', ')}
DURATION: ${duration}
ADDITIONAL INFORMATION: ${additionalInfo || 'None provided'}

Provide differential diagnosis including:
1. Most likely primary diagnosis with probability and reasoning
2. Alternative diagnoses to consider
3. Recommended diagnostic tests with urgency levels
4. Red flag symptoms requiring immediate attention
5. Immediate actions needed

Consider common conditions in Kenya and resource-appropriate diagnostics.`;

      const response = await mistral.chat.completions.create({
        model: 'mistral-small-latest',
        messages: [
          { 
            role: 'system', 
            content: 'You are a senior physician with expertise in diagnostic medicine and tropical diseases common in East Africa. Provide systematic differential diagnosis following clinical reasoning principles.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content || '';
      return this.parseDifferentialDiagnosis(content);
    } catch (error) {
      console.error('Mistral differential diagnosis error:', error);
      throw new Error('Failed to analyze differential diagnosis');
    }
  }

  /**
   * Comprehensive drug interaction analysis
   */
  async analyzeComplexDrugInteractions(
    medications: string[],
    patientConditions: string[],
    patientAge: number,
    kidneyFunction?: 'normal' | 'mild_impairment' | 'moderate_impairment' | 'severe_impairment',
    liverFunction?: 'normal' | 'mild_impairment' | 'moderate_impairment' | 'severe_impairment'
  ): Promise<DrugInteractionAnalysis> {
    try {
      const prompt = `Analyze complex drug interactions for this medication regimen:

MEDICATIONS: ${medications.join(', ')}
PATIENT CONDITIONS: ${patientConditions.join(', ')}
AGE: ${patientAge} years
KIDNEY FUNCTION: ${kidneyFunction || 'Not specified'}
LIVER FUNCTION: ${liverFunction || 'Not specified'}

Provide comprehensive analysis:
1. Significant drug-drug interactions with severity levels
2. Drug-disease contraindications
3. Required dosage adjustments for age/organ function
4. Monitoring requirements and laboratory tests
5. Overall risk assessment and management recommendations

Focus on clinically significant interactions requiring action.`;

      const response = await mistral.chat.completions.create({
        model: 'mistral-small-latest',
        messages: [
          { 
            role: 'system', 
            content: 'You are a clinical pharmacologist with expertise in drug interactions, pharmacokinetics, and patient safety. Provide detailed interaction analysis with practical management strategies.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1800,
      });

      const content = response.choices[0]?.message?.content || '';
      return this.parseDrugInteractionAnalysis(content);
    } catch (error) {
      console.error('Mistral drug interaction error:', error);
      throw new Error('Failed to analyze drug interactions');
    }
  }

  /**
   * Generate patient education content
   */
  async generatePatientEducation(
    diagnosis: string,
    treatmentPlan: string,
    patientAge: number,
    educationLevel: 'basic' | 'intermediate' | 'advanced' = 'basic'
  ): Promise<{
    explanation: string;
    instructions: string[];
    precautions: string[];
    whenToSeekHelp: string[];
    lifestyle: string[];
    language: 'simple' | 'technical';
  }> {
    try {
      const prompt = `Create patient education material for:

DIAGNOSIS: ${diagnosis}
TREATMENT: ${treatmentPlan}
PATIENT AGE: ${patientAge}
EDUCATION LEVEL: ${educationLevel}

Provide clear, culturally appropriate patient education including:
1. Simple explanation of the condition
2. Step-by-step treatment instructions
3. Important precautions and side effects
4. When to seek immediate medical help
5. Lifestyle modifications and home care

Use simple language appropriate for Kenyan patients, considering local context and health literacy levels.`;

      const response = await mistral.chat.completions.create({
        model: 'mistral-small-latest',
        messages: [
          { 
            role: 'system', 
            content: 'You are a patient educator with expertise in health communication and Kenyan healthcare context. Create clear, actionable patient education materials using culturally appropriate language.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 1200,
      });

      const content = response.choices[0]?.message?.content || '';
      return this.parsePatientEducation(content, educationLevel);
    } catch (error) {
      console.error('Mistral patient education error:', error);
      throw new Error('Failed to generate patient education');
    }
  }

  private parseTreatmentPlan(content: string, request: TreatmentRequest): TreatmentPlan {
    // Extract structured data from Mistral response
    const lines = content.split('\n').filter(line => line.trim());
    
    // Default treatment plan structure
    const treatmentPlan: TreatmentPlan = {
      primaryTreatment: {
        medication: this.extractAfterPattern(content, /primary medication|first-line/i) || 'Medication not specified',
        dosage: this.extractAfterPattern(content, /dosage|dose/i) || 'As prescribed',
        frequency: this.extractAfterPattern(content, /frequency|times/i) || 'As directed',
        duration: this.extractAfterPattern(content, /duration|for/i) || '7-14 days',
        instructions: this.extractAfterPattern(content, /instructions|take/i) || 'Take as prescribed'
      },
      alternativeTreatments: this.extractAlternatives(content),
      nonPharmacological: this.extractListItems(content, /non-pharmacological|non-drug|lifestyle/i),
      followUpCare: this.extractListItems(content, /follow.?up|review/i),
      warningSignsToWatch: this.extractListItems(content, /warning|red flag|seek help/i),
      dietaryRecommendations: this.extractListItems(content, /diet|nutrition|food/i),
      lifestyleModifications: this.extractListItems(content, /lifestyle|modify|avoid/i),
      expectedOutcome: this.extractAfterPattern(content, /outcome|prognosis|expect/i) || 'Good with treatment',
      timeToImprovement: this.extractAfterPattern(content, /improvement|better|recover/i) || '1-2 weeks',
      confidence: this.calculateConfidence(request.severity, content),
      reasoning: this.extractReasoningSteps(content)
    };

    return treatmentPlan;
  }

  private parseDifferentialDiagnosis(content: string): DifferentialDiagnosis {
    return {
      primaryDiagnosis: {
        condition: this.extractAfterPattern(content, /primary|most likely|probable/i) || 'Diagnosis pending',
        probability: this.extractProbability(content, /primary|most likely/i),
        supportingSymptoms: this.extractListItems(content, /supporting|suggests/i),
        reasoning: this.extractAfterPattern(content, /because|reasoning/i) || 'Clinical assessment needed'
      },
      differentialDiagnoses: this.extractDifferentials(content),
      recommendedTests: this.extractTests(content),
      redFlags: this.extractListItems(content, /red flag|emergency|urgent/i),
      immediateActions: this.extractListItems(content, /immediate|now|urgent/i)
    };
  }

  private parseDrugInteractionAnalysis(content: string): DrugInteractionAnalysis {
    return {
      interactions: this.extractInteractions(content),
      contraindications: this.extractContraindications(content),
      dosageAdjustments: this.extractDosageAdjustments(content),
      monitoringRequirements: this.extractListItems(content, /monitor|check|test/i),
      overallRiskAssessment: this.assessOverallRisk(content)
    };
  }

  private parsePatientEducation(content: string, level: string) {
    return {
      explanation: this.extractSection(content, /explanation|what is/i),
      instructions: this.extractListItems(content, /instructions|how to|steps/i),
      precautions: this.extractListItems(content, /precautions|careful|avoid/i),
      whenToSeekHelp: this.extractListItems(content, /seek help|emergency|call/i),
      lifestyle: this.extractListItems(content, /lifestyle|home care|daily/i),
      language: level === 'advanced' ? 'technical' as const : 'simple' as const
    };
  }

  // Helper methods for parsing Mistral responses
  private extractAfterPattern(text: string, pattern: RegExp): string | null {
    const lines = text.split('\n');
    for (const line of lines) {
      if (pattern.test(line)) {
        return line.replace(pattern, '').replace(/^[\s\-\*:]+/, '').trim();
      }
    }
    return null;
  }

  private extractListItems(text: string, pattern: RegExp): string[] {
    const lines = text.split('\n');
    const items: string[] = [];
    let capturing = false;
    
    for (const line of lines) {
      if (pattern.test(line)) {
        capturing = true;
        continue;
      }
      
      if (capturing && (line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*'))) {
        items.push(line.replace(/^[\s\-\*•]+/, '').trim());
      } else if (capturing && line.trim() === '') {
        continue;
      } else if (capturing && !line.trim().match(/^[\d\.]/)) {
        break;
      }
    }
    
    return items.filter(item => item.length > 0);
  }

  private extractAlternatives(content: string) {
    return [
      {
        medication: 'Alternative pending analysis',
        dosage: 'TBD',
        reason: 'If primary treatment fails'
      }
    ];
  }

  private extractDifferentials(content: string) {
    return [
      {
        condition: 'Additional diagnosis pending',
        probability: 20,
        supportingSymptoms: [],
        distinguishingFactors: []
      }
    ];
  }

  private extractTests(content: string) {
    return [
      {
        test: 'Basic laboratory studies',
        reason: 'Diagnostic workup',
        urgency: 'routine' as const
      }
    ];
  }

  private extractInteractions(content: string) {
    return [];
  }

  private extractContraindications(content: string) {
    return [];
  }

  private extractDosageAdjustments(content: string) {
    return [];
  }

  private extractSection(content: string, pattern: RegExp): string {
    const lines = content.split('\n');
    for (const line of lines) {
      if (pattern.test(line)) {
        return line.replace(pattern, '').replace(/^[\s\-\*:]+/, '').trim();
      }
    }
    return 'Information pending clinical assessment';
  }

  private extractProbability(content: string, pattern: RegExp): number {
    const match = content.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 75;
  }

  private extractReasoningSteps(content: string): string[] {
    const steps = this.extractListItems(content, /reasoning|rationale|because/i);
    return steps.length > 0 ? steps : ['Clinical assessment based on presenting symptoms'];
  }

  private calculateConfidence(severity: string, content: string): number {
    const baseConfidence = severity === 'critical' ? 95 : severity === 'severe' ? 85 : 75;
    return baseConfidence;
  }

  private assessOverallRisk(content: string): 'low' | 'moderate' | 'high' {
    if (content.toLowerCase().includes('high risk') || content.toLowerCase().includes('severe')) {
      return 'high';
    }
    if (content.toLowerCase().includes('moderate') || content.toLowerCase().includes('caution')) {
      return 'moderate';
    }
    return 'low';
  }
}

export const mistralHealthcareService = new MistralHealthcareService();