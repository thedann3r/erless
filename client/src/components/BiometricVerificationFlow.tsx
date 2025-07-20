import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BiometricScanner } from './BiometricScanner';
import { 
  User, 
  Fingerprint, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  Shield,
  Clock,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface BiometricVerificationFlowProps {
  patientId: string;
  patientName?: string;
  onVerificationSuccess?: (result: any) => void;
  onRegistrationComplete?: (result: any) => void;
  redirectTo?: string;
  className?: string;
}

interface BiometricInfo {
  info: {
    patientId: string;
    fingerprintHash: string;
    registeredBy: string;
    registeredAt: string;
    status: 'active' | 'archived' | 'pending_reset';
  } | null;
  message?: string;
}

export function BiometricVerificationFlow({
  patientId,
  patientName,
  onVerificationSuccess,
  onRegistrationComplete,
  redirectTo,
  className
}: BiometricVerificationFlowProps) {
  const [step, setStep] = useState<'checking' | 'register' | 'verify' | 'success'>('checking');
  const [showRegistration, setShowRegistration] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [, setLocation] = useLocation();

  // Check if fingerprint exists for patient
  const { data: biometricInfo, isLoading } = useQuery<BiometricInfo>({
    queryKey: [`/api/biometric/info/${patientId}`],
    enabled: !!patientId
  });

  useEffect(() => {
    if (!isLoading && biometricInfo) {
      if (biometricInfo.info && biometricInfo.info.status === 'active') {
        setStep('verify');
      } else {
        setStep('register');
      }
    }
  }, [biometricInfo, isLoading]);

  const handleRegistrationSuccess = (result: any) => {
    setStep('verify');
    setShowRegistration(false);
    onRegistrationComplete?.(result);
  };

  const handleVerificationSuccess = (result: any) => {
    setVerificationResult(result);
    setStep('success');
    onVerificationSuccess?.(result);
  };

  const handleProceed = () => {
    if (redirectTo) {
      setLocation(redirectTo);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'checking', label: 'Checking', icon: User },
      { id: 'register', label: 'Register', icon: Fingerprint },
      { id: 'verify', label: 'Verify', icon: Shield },
      { id: 'success', label: 'Complete', icon: CheckCircle }
    ];

    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((stepItem, index) => {
          const Icon = stepItem.icon;
          const isActive = step === stepItem.id;
          const isCompleted = ['register', 'verify', 'success'].indexOf(step) > 
                           ['register', 'verify', 'success'].indexOf(stepItem.id);
          
          return (
            <React.Fragment key={stepItem.id}>
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                isActive && "border-[#265651] bg-[#265651] text-white",
                isCompleted && "border-green-500 bg-green-500 text-white",
                !isActive && !isCompleted && "border-gray-300 text-gray-400"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 h-px mx-2 transition-colors",
                  isCompleted && "bg-green-500",
                  !isCompleted && "bg-gray-300"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full max-w-lg mx-auto", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#265651]"></div>
          <span className="ml-3 text-gray-600">Checking biometric status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full max-w-2xl mx-auto space-y-6", className)}>
      {renderStepIndicator()}

      {/* Patient Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-[#265651]" />
            Patient Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Patient ID:</span>
              <Badge variant="outline">{patientId}</Badge>
            </div>
            {patientName && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Patient Name:</span>
                <span>{patientName}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-medium">Biometric Status:</span>
              <Badge variant={biometricInfo?.info ? 'default' : 'secondary'}>
                {biometricInfo?.info ? 'Registered' : 'Not Registered'}
              </Badge>
            </div>
            {biometricInfo?.info && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Registered:</span>
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(biometricInfo.info.registeredAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Flow Card */}
      <Card>
        <CardContent className="pt-6">
          {step === 'register' && (
            <div className="text-center space-y-6">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>No biometric data found.</strong> Please register fingerprint to proceed with secure verification.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fingerprint Registration Required</h3>
                <p className="text-gray-600">
                  To ensure secure patient identity verification, we need to register your fingerprint. 
                  This is a one-time setup that will enable quick verification for future visits.
                </p>
                
                <Button 
                  onClick={() => setShowRegistration(true)}
                  className="bg-[#265651] hover:bg-[#1d453f] text-white"
                >
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Register Fingerprint
                </Button>
              </div>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Identity Verification</h3>
                <p className="text-gray-600">
                  Place your finger on the scanner to verify your identity and proceed.
                </p>
              </div>
              
              <BiometricScanner
                mode="verify"
                patientId={patientId}
                onSuccess={handleVerificationSuccess}
                onError={(error) => console.error('Verification failed:', error)}
              />
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-800">Verification Successful!</h3>
                <p className="text-gray-600 mt-2">
                  Identity confirmed. You can now proceed to your requested service.
                </p>
                {verificationResult?.verificationScore && (
                  <Badge variant="outline" className="mt-3">
                    Match: {Math.round(verificationResult.verificationScore)}%
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                {redirectTo && (
                  <Button 
                    onClick={handleProceed}
                    className="w-full bg-[#265651] hover:bg-[#1d453f] text-white"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Proceed to {redirectTo.includes('pharmacy') ? 'Pharmacy' : 'Front Desk'}
                  </Button>
                )}
                
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => setLocation('/modern-pharmacy')}
                  >
                    Pharmacy
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setLocation('/front-desk')}
                  >
                    Front Desk
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Dialog */}
      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register Fingerprint</DialogTitle>
            <DialogDescription>
              This will securely register your fingerprint for future identity verification.
            </DialogDescription>
          </DialogHeader>
          
          <BiometricScanner
            mode="register"
            patientId={patientId}
            onSuccess={handleRegistrationSuccess}
            onError={(error) => console.error('Registration failed:', error)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}