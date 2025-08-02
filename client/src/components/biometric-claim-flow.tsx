import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BiometricVerification } from "./biometric-verification";
import { ClaimFormGenerator } from "./claim-form-generator";
import { CheckCircle, FileText, Shield, ArrowRight } from "lucide-react";

interface InsurancePolicy {
  id: number;
  insurerName: string;
  policyNumber: string;
  planType: string;
  memberName: string;
  status: string;
  expiryDate: string;
  coverageAmount: number;
}

interface BiometricClaimFlowProps {
  patientId: string;
  serviceType?: string;
  estimatedCost?: number;
}

export function BiometricClaimFlow({ patientId, serviceType, estimatedCost }: BiometricClaimFlowProps) {
  const [currentStep, setCurrentStep] = useState<'verification' | 'claim-form'>('verification');
  const [selectedInsurer, setSelectedInsurer] = useState<InsurancePolicy | null>(null);
  const [verifiedPatient, setVerifiedPatient] = useState<any>(null);

  const handleVerificationSuccess = (insurer?: InsurancePolicy) => {
    if (insurer) {
      setSelectedInsurer(insurer);
      // Store in session for claim form pre-population
      sessionStorage.setItem('selectedInsurer', JSON.stringify(insurer));
    }
    setCurrentStep('claim-form');
  };

  const handleVerificationFailed = () => {
    // Handle verification failure - could show error or redirect
    console.log('Verification failed');
  };

  const resetFlow = () => {
    setCurrentStep('verification');
    setSelectedInsurer(null);
    setVerifiedPatient(null);
    sessionStorage.removeItem('selectedInsurer');
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className={`flex items-center space-x-2 ${
          currentStep === 'verification' ? 'text-blue-600' : 'text-green-600'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'verification' 
              ? 'border-blue-600 bg-blue-50' 
              : 'border-green-600 bg-green-50'
          }`}>
            {currentStep === 'claim-form' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
          </div>
          <span className="font-medium">Patient Verification</span>
        </div>
        
        <ArrowRight className="w-4 h-4 text-gray-400" />
        
        <div className={`flex items-center space-x-2 ${
          currentStep === 'claim-form' ? 'text-blue-600' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'claim-form' 
              ? 'border-blue-600 bg-blue-50' 
              : 'border-gray-300'
          }`}>
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-medium">Claim Submission</span>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'verification' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Secure Patient Verification</CardTitle>
              <CardDescription>
                Biometric verification required before claim submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BiometricVerification
                patientId={patientId}
                onVerificationSuccess={handleVerificationSuccess}
                onVerificationFailed={handleVerificationFailed}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 'claim-form' && (
        <div className="space-y-4">
          {/* Selected Insurer Info */}
          {selectedInsurer && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-800">
                        Verification Complete
                      </h3>
                      <p className="text-sm text-green-700">
                        Policy: {selectedInsurer.insurerName} - {selectedInsurer.policyNumber}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {selectedInsurer.planType}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Claim Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Generate Claim Form
              </CardTitle>
              <CardDescription>
                Complete the claim form with pre-populated patient and insurance information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClaimFormGenerator 
                preSelectedInsurer={selectedInsurer?.insurerName}
                patientId={patientId}
                serviceType={serviceType}
                estimatedCost={estimatedCost}
              />
            </CardContent>
          </Card>

          {/* Reset Option */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={resetFlow}>
              Start New Verification
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}