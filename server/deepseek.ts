import OpenAI from 'openai';

// DeepSeek API configuration
const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChainOfThoughtRequest {
  prompt: string;
  context?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChainOfThoughtResponse {
  reasoning: string[];
  conclusion: string;
  confidence: number;
  supportingEvidence: string[];
}

interface PreauthorizationRequest {
  patientId: string;
  diagnosis: string;
  treatmentPlan: string;
  medicalHistory?: string;
  insuranceScheme: string;
  cost: number;
}

interface PreauthorizationDecision {
  decision: 'approved' | 'denied' | 'requires_review';
  reasoning: string[];
  confidence: number;
  conditions?: string[];
  appealProcess?: string;
}

export class DeepSeekService {
  /**
   * Generate chain of thought reasoning for any healthcare decision
   */
  async generateChainOfThought(request: ChainOfThoughtRequest): Promise<ChainOfThoughtResponse> {
    try {
      const systemPrompt = `You are a healthcare decision support AI that provides transparent chain-of-thought reasoning. 
      Always structure your response as:
      1. REASONING STEPS: Break down your thinking into clear, logical steps
      2. CONCLUSION: Your final recommendation
      3. CONFIDENCE: A score from 0-100 indicating certainty
      4. SUPPORTING EVIDENCE: Key factors that support your decision

      Be thorough, evidence-based, and transparent in your reasoning process.`;

      const userPrompt = `${request.context ? `Context: ${request.context}\n\n` : ''}${request.prompt}

      Please provide a detailed chain of thought analysis following the structured format.`;

      const completion = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1500,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Parse the structured response
      return this.parseChainOfThoughtResponse(response);
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw new Error('Failed to generate chain of thought reasoning');
    }
  }

  /**
   * Preauthorization decision with chain of thought
   */
  async analyzePreauthorization(request: PreauthorizationRequest): Promise<PreauthorizationDecision> {
    const prompt = `Analyze this preauthorization request for healthcare coverage:

    Patient ID: ${request.patientId}
    Diagnosis: ${request.diagnosis}
    Treatment Plan: ${request.treatmentPlan}
    Medical History: ${request.medicalHistory || 'Not provided'}
    Insurance Scheme: ${request.insuranceScheme}
    Estimated Cost: KES ${request.cost.toLocaleString()}

    Consider:
    1. Medical necessity and evidence-based guidelines
    2. Cost-effectiveness and alternatives
    3. Insurance scheme coverage policies
    4. Patient safety and contraindications
    5. Regulatory compliance (Kenya healthcare standards)

    Provide your decision (approved/denied/requires_review) with detailed reasoning.`;

    const chainOfThought = await this.generateChainOfThought({
      prompt,
      context: 'Healthcare preauthorization analysis for Kenyan medical insurance',
      temperature: 0.3, // Lower temperature for more consistent decisions
    });

    // Extract decision from conclusion
    const decision = this.extractDecision(chainOfThought.conclusion);
    
    return {
      decision,
      reasoning: chainOfThought.reasoning,
      confidence: chainOfThought.confidence,
      conditions: this.extractConditions(chainOfThought.conclusion),
      appealProcess: decision === 'denied' ? 'Patient may appeal within 30 days with additional documentation' : undefined
    };
  }

  /**
   * Drug interaction and safety analysis
   */
  async analyzePrescriptionSafety(
    patientId: string,
    medications: string[],
    patientAge: number,
    patientWeight: number,
    allergies: string[] = [],
    conditions: string[] = []
  ): Promise<{
    safetyScore: number;
    interactions: string[];
    warnings: string[];
    recommendations: string[];
    reasoning: string[];
  }> {
    const prompt = `Analyze prescription safety for:

    Patient: ${patientId} (Age: ${patientAge}, Weight: ${patientWeight}kg)
    Medications: ${medications.join(', ')}
    Known Allergies: ${allergies.length > 0 ? allergies.join(', ') : 'None reported'}
    Medical Conditions: ${conditions.length > 0 ? conditions.join(', ') : 'None reported'}

    Evaluate:
    1. Drug-drug interactions
    2. Drug-allergy conflicts
    3. Age-appropriate dosing
    4. Weight-based dosing considerations
    5. Contraindications with existing conditions

    Provide safety score (0-100), specific interactions, warnings, and recommendations.`;

    const chainOfThought = await this.generateChainOfThought({
      prompt,
      context: 'Prescription safety analysis for pharmacy dispensing',
      temperature: 0.2,
    });

    return {
      safetyScore: this.extractSafetyScore(chainOfThought.conclusion),
      interactions: this.extractInteractions(chainOfThought.reasoning),
      warnings: this.extractWarnings(chainOfThought.reasoning),
      recommendations: this.extractRecommendations(chainOfThought.conclusion),
      reasoning: chainOfThought.reasoning
    };
  }

  /**
   * Fraud detection analysis
   */
  async analyzeFraudRisk(
    claimId: string,
    providerId: string,
    patientId: string,
    services: any[],
    claimAmount: number,
    historicalData?: any
  ): Promise<{
    riskScore: number;
    riskFactors: string[];
    redFlags: string[];
    recommendation: 'approve' | 'investigate' | 'reject';
    reasoning: string[];
  }> {
    const prompt = `Analyze potential fraud risk for healthcare claim:

    Claim ID: ${claimId}
    Provider: ${providerId}
    Patient: ${patientId}
    Services: ${JSON.stringify(services, null, 2)}
    Claim Amount: KES ${claimAmount.toLocaleString()}
    Historical Context: ${historicalData ? JSON.stringify(historicalData) : 'Limited data available'}

    Evaluate fraud indicators:
    1. Unusual billing patterns
    2. Service appropriateness for diagnosis
    3. Provider behavior anomalies
    4. Patient utilization patterns
    5. Cost outliers and billing irregularities

    Provide risk score (0-100) and recommendation.`;

    const chainOfThought = await this.generateChainOfThought({
      prompt,
      context: 'Healthcare claims fraud detection analysis',
      temperature: 0.3,
    });

    return {
      riskScore: this.extractRiskScore(chainOfThought.conclusion),
      riskFactors: this.extractRiskFactors(chainOfThought.reasoning),
      redFlags: this.extractRedFlags(chainOfThought.reasoning),
      recommendation: this.extractFraudRecommendation(chainOfThought.conclusion),
      reasoning: chainOfThought.reasoning
    };
  }

  private parseChainOfThoughtResponse(response: string): ChainOfThoughtResponse {
    // Parse the structured response from DeepSeek
    const reasoningMatch = response.match(/REASONING STEPS?:(.*?)(?=CONCLUSION|$)/is);
    const conclusionMatch = response.match(/CONCLUSION:(.*?)(?=CONFIDENCE|$)/is);
    const confidenceMatch = response.match(/CONFIDENCE:(.*?)(?=SUPPORTING EVIDENCE|$)/is);
    const evidenceMatch = response.match(/SUPPORTING EVIDENCE:(.*?)$/is);

    const reasoning = reasoningMatch?.[1]
      ?.split(/\d+\.|\n-|\n•/)
      .filter(step => step.trim())
      .map(step => step.trim()) || [response];

    const conclusion = conclusionMatch?.[1]?.trim() || response;
    
    const confidenceStr = confidenceMatch?.[1]?.trim() || '70';
    const confidence = parseInt(confidenceStr.match(/\d+/)?.[0] || '70');

    const supportingEvidence = evidenceMatch?.[1]
      ?.split(/\n-|\n•/)
      .filter(evidence => evidence.trim())
      .map(evidence => evidence.trim()) || [];

    return {
      reasoning,
      conclusion,
      confidence: Math.min(100, Math.max(0, confidence)),
      supportingEvidence
    };
  }

  private extractDecision(conclusion: string): 'approved' | 'denied' | 'requires_review' {
    const lower = conclusion.toLowerCase();
    if (lower.includes('approved') || lower.includes('approve')) return 'approved';
    if (lower.includes('denied') || lower.includes('deny') || lower.includes('reject')) return 'denied';
    return 'requires_review';
  }

  private extractConditions(conclusion: string): string[] {
    const conditionMatch = conclusion.match(/conditions?:\s*(.*?)(?:\n|$)/i);
    if (!conditionMatch) return [];
    
    return conditionMatch[1]
      .split(/[,;]/)
      .map(condition => condition.trim())
      .filter(condition => condition);
  }

  private extractSafetyScore(conclusion: string): number {
    const scoreMatch = conclusion.match(/safety score:\s*(\d+)/i) || 
                     conclusion.match(/score:\s*(\d+)/i) ||
                     conclusion.match(/(\d+)(?:%|\s*out of 100)/i);
    return parseInt(scoreMatch?.[1] || '75');
  }

  private extractInteractions(reasoning: string[]): string[] {
    return reasoning
      .filter(step => step.toLowerCase().includes('interaction'))
      .map(step => step.replace(/^\d+\.?\s*/, '').trim());
  }

  private extractWarnings(reasoning: string[]): string[] {
    return reasoning
      .filter(step => step.toLowerCase().includes('warning') || step.toLowerCase().includes('caution'))
      .map(step => step.replace(/^\d+\.?\s*/, '').trim());
  }

  private extractRecommendations(conclusion: string): string[] {
    const recMatch = conclusion.match(/recommendations?:\s*(.*?)(?:\n\n|$)/is);
    if (!recMatch) return [];
    
    return recMatch[1]
      .split(/\n-|\n•|\d+\./)
      .filter(rec => rec.trim())
      .map(rec => rec.trim());
  }

  private extractRiskScore(conclusion: string): number {
    const scoreMatch = conclusion.match(/risk score:\s*(\d+)/i) || 
                     conclusion.match(/score:\s*(\d+)/i);
    return parseInt(scoreMatch?.[1] || '50');
  }

  private extractRiskFactors(reasoning: string[]): string[] {
    return reasoning
      .filter(step => step.toLowerCase().includes('risk') || step.toLowerCase().includes('factor'))
      .map(step => step.replace(/^\d+\.?\s*/, '').trim());
  }

  private extractRedFlags(reasoning: string[]): string[] {
    return reasoning
      .filter(step => step.toLowerCase().includes('red flag') || step.toLowerCase().includes('suspicious'))
      .map(step => step.replace(/^\d+\.?\s*/, '').trim());
  }

  private extractFraudRecommendation(conclusion: string): 'approve' | 'investigate' | 'reject' {
    const lower = conclusion.toLowerCase();
    if (lower.includes('investigate') || lower.includes('review')) return 'investigate';
    if (lower.includes('reject') || lower.includes('deny')) return 'reject';
    return 'approve';
  }
}

export const deepSeekService = new DeepSeekService();