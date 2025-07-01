import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Fingerprint, Shield, CheckCircle, AlertTriangle, Loader2, Building2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
// Temporary mock biometric service until fingerprint.ts is created
const mockBiometricService = {
  async simulateFingerprintScan(patientId: string) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      fingerprintHash: `fp_${patientId}_${Date.now()}`,
      deviceFingerprint: `device_${Date.now()}`,
      timestamp: Date.now(),
      sessionId: `session_${Date.now()}`
    };
  },
  async storeBiometricData(patientId: string, data: any) {
    localStorage.setItem(`biometric_${patientId}`, JSON.stringify(data));
  }
};

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

interface BiometricVerificationProps {
  patientId: string;
  onVerificationSuccess: (selectedInsurer?: InsurancePolicy) => void;
  onVerificationFailed: () => void;
}

interface InsurerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  policies: InsurancePolicy[];
  onSelect: (insurer: InsurancePolicy) => void;
}

function InsurerSelectionModal({ isOpen, onClose, policies, onSelect }: InsurerSelectionModalProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);

  const handleSelect = () => {
    if (selectedPolicy) {
      onSelect(selectedPolicy);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Select Active Insurance Policy
          </DialogTitle>
          <DialogDescription>
            Multiple active insurance policies found. Please select which policy to use for this claim.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedPolicy?.id === policy.id 
                  ? 'border-teal-500 bg-teal-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPolicy(policy)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-lg">{policy.insurerName}</span>
                  <Badge 
                    variant={policy.status === 'active' ? 'default' : 'secondary'}
                    className={policy.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {policy.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  Expires: {new Date(policy.expiryDate).toLocaleDateString()}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Policy Number:</span>
                  <div className="font-medium">{policy.policyNumber}</div>
                </div>
                <div>
                  <span className="text-gray-600">Plan Type:</span>
                  <div className="font-medium">{policy.planType}</div>
                </div>
                <div>
                  <span className="text-gray-600">Member Name:</span>
                  <div className="font-medium">{policy.memberName}</div>
                </div>
                <div>
                  <span className="text-gray-600">Coverage:</span>
                  <div className="font-medium">KES {policy.coverageAmount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSelect} 
            disabled={!selectedPolicy}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Select Policy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BiometricVerification({ patientId, onVerificationSuccess, onVerificationFailed }: BiometricVerificationProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [showInsurerModal, setShowInsurerModal] = useState(false);
  const [activePolicies, setActivePolicies] = useState<InsurancePolicy[]>([]);
  const [verifiedPatient, setVerifiedPatient] = useState<any>(null);

  // Enhanced fingerprint scanning with real biometric simulation
  const simulateFingerprint = async () => {
    setIsScanning(true);
    setVerificationStatus('scanning');
    setScanProgress(0);

    try {
      // Generate realistic biometric scan
      const biometricData = await mockBiometricService.simulateFingerprintScan(patientId);
      
      // Simulate progressive scanning with realistic steps
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 12 + 3; // More controlled progress
        });
      }, 180);

      // Wait for biometric scanning to complete
      await new Promise(resolve => {
        const checkProgress = () => {
          if (scanProgress >= 100) {
            clearInterval(progressInterval);
            resolve(true);
          } else {
            setTimeout(checkProgress, 100);
          }
        };
        checkProgress();
      });

      // Store biometric data for this session
      await mockBiometricService.storeBiometricData(patientId, biometricData);
      
      // Verify patient and get active policies
      const response = await fetch(`/api/verify-patient/${patientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fingerprintHash: biometricData.fingerprintHash,
          deviceFingerprint: biometricData.deviceFingerprint,
          sessionId: biometricData.sessionId
        })
      });
      
      const data = await response.json();

      if (data.verified && data.activePolicies) {
        setVerifiedPatient(data.patient);
        setActivePolicies(data.activePolicies);
        setVerificationStatus('success');
        
        // If multiple policies, show selection modal
        if (data.activePolicies.length > 1) {
          setShowInsurerModal(true);
        } else if (data.activePolicies.length === 1) {
          // Single policy - proceed directly
          onVerificationSuccess(data.activePolicies[0]);
        } else {
          // No active policies
          setVerificationStatus('failed');
          onVerificationFailed();
        }
      } else {
        setVerificationStatus('failed');
        onVerificationFailed();
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('failed');
      onVerificationFailed();
    } finally {
      setIsScanning(false);
    }
  };

  const handleInsurerSelection = (selectedInsurer: InsurancePolicy) => {
    // Store selected insurer in session/local storage for claim processing
    sessionStorage.setItem('selectedInsurer', JSON.stringify(selectedInsurer));
    onVerificationSuccess(selectedInsurer);
  };

  const resetVerification = () => {
    setVerificationStatus('idle');
    setScanProgress(0);
    setActivePolicies([]);
    setVerifiedPatient(null);
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Patient Verification
          </CardTitle>
          <CardDescription>
            Secure biometric identity verification required
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Fingerprint Scanner Interface */}
          <div className="relative">
            <div className={`
              w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center transition-all duration-300
              ${verificationStatus === 'scanning' ? 'border-blue-500 bg-blue-50' : ''}
              ${verificationStatus === 'success' ? 'border-green-500 bg-green-50' : ''}
              ${verificationStatus === 'failed' ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            `}>
              {verificationStatus === 'scanning' ? (
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              ) : verificationStatus === 'success' ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : verificationStatus === 'failed' ? (
                <AlertTriangle className="w-12 h-12 text-red-600" />
              ) : (
                <Fingerprint className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            {/* Progress Ring */}
            {verificationStatus === 'scanning' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="68"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-blue-200"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="68"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 68}`}
                    strokeDashoffset={`${2 * Math.PI * 68 * (1 - scanProgress / 100)}`}
                    className="text-blue-600 transition-all duration-200"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {verificationStatus === 'idle' && (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Place finger on scanner to verify patient identity
              </p>
            </div>
          )}

          {verificationStatus === 'scanning' && (
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-blue-600">
                Scanning fingerprint... {Math.round(scanProgress)}%
              </p>
              <p className="text-xs text-gray-500">
                Keep finger steady on the scanner
              </p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Verification Successful!</strong>
                {verifiedPatient && (
                  <div className="mt-1">
                    Patient: {verifiedPatient.firstName} {verifiedPatient.lastName}
                    <br />
                    ID: {verifiedPatient.patientId}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus === 'failed' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Verification Failed</strong>
                <br />
                Fingerprint not recognized or no active insurance policies found.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {verificationStatus === 'idle' && (
              <Button 
                onClick={simulateFingerprint}
                disabled={isScanning}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Fingerprint className="w-4 h-4 mr-2" />
                Start Fingerprint Scan
              </Button>
            )}

            {verificationStatus === 'scanning' && (
              <Button disabled className="w-full">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scanning in Progress...
              </Button>
            )}

            {(verificationStatus === 'failed') && (
              <Button 
                onClick={resetVerification}
                variant="outline" 
                className="w-full"
              >
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insurer Selection Modal */}
      <InsurerSelectionModal
        isOpen={showInsurerModal}
        onClose={() => setShowInsurerModal(false)}
        policies={activePolicies}
        onSelect={handleInsurerSelection}
      />
    </>
  );
}