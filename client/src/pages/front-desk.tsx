import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Fingerprint, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Building2,
  User,
  FileText,
  Clock,
  Phone,
  MessageSquare,
  Smartphone,
  Download
} from "lucide-react";
import { generateClaimForm, downloadPDF, generateFilename, type PatientData, type ClaimService } from "@/utils/autofillClaim";
// Temporary mock biometric service
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
import { EnhancedClaimTracker } from "@/components/enhanced-claim-tracker";

interface InsurancePolicy {
  id: string;
  insurerName: string;
  schemeName: string;
  policyNumber: string;
  coverageAmount: number;
  expiryDate: string;
  isActive: boolean;
}

interface ActiveSession {
  sessionId: string;
  facilityName: string;
  serviceName: string;
  startedAt: string;
  userId: string;
  userRole: string;
}

interface Patient {
  id: number;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber?: string;
  biometricId?: string;
}

export default function FrontDeskPage() {
  const [step, setStep] = useState<'input' | 'verification' | 'selection' | 'session' | 'service' | 'preauth' | 'complete'>('input');
  const [patientId, setPatientId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'fingerprint' | 'otp'>('fingerprint');
  
  // Biometric states
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  
  // Patient data
  const [verifiedPatient, setVerifiedPatient] = useState<Patient | null>(null);
  const [activePolicies, setActivePolicies] = useState<InsurancePolicy[]>([]);
  const [selectedInsurer, setSelectedInsurer] = useState<InsurancePolicy | null>(null);
  
  // Session management
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionToHandle, setSessionToHandle] = useState<ActiveSession | null>(null);
  
  // SMS OTP states
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  // Service selection and preauthorization states
  const [selectedService, setSelectedService] = useState<string>('');
  const [benefitBuckets, setBenefitBuckets] = useState<any[]>([]);
  const [preauthResult, setPreauthResult] = useState<any>(null);
  const [preauthLoading, setPreauthLoading] = useState(false);

  const handlePatientLookup = async () => {
    if (!patientId.trim()) return;
    
    setStep('verification');
    setVerificationStatus('idle');
  };

  const handleFingerprintVerification = async () => {
    setIsScanning(true);
    setVerificationStatus('scanning');
    setScanProgress(0);

    try {
      // Generate realistic biometric scan
      const biometricData = await mockBiometricService.simulateFingerprintScan(patientId);
      
      // Simulate progressive scanning
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 12 + 3;
        });
      }, 180);

      // Wait for scanning completion
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

      // Store biometric data
      await mockBiometricService.storeBiometricData(patientId, biometricData);
      
      // Verify patient with biometric data
      await verifyPatientIdentity(biometricData);
      
    } catch (error) {
      console.error('Fingerprint verification error:', error);
      setVerificationStatus('failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    
    try {
      // Simulate SMS sending delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would call SMS API
      console.log(`Sending OTP to patient ${patientId}`);
      
      setOtpSent(true);
    } catch (error) {
      console.error('OTP sending failed:', error);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpVerification = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      return;
    }
    
    setVerificationStatus('scanning');
    
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, accept any 6-digit code
      if (otpCode.length === 6) {
        await verifyPatientIdentity(null, otpCode);
      } else {
        setVerificationStatus('failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setVerificationStatus('failed');
    }
  };

  const verifyPatientIdentity = async (biometricData?: any, otp?: string) => {
    try {
      const response = await fetch(`/api/front-desk/verify-patient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          patientId,
          biometricData,
          otpCode: otp
        })
      });
      
      const data = await response.json();

      if (data.verified) {
        setVerifiedPatient(data.patient);
        setActivePolicies(data.activePolicies || []);
        setActiveSessions(data.activeSessions || []);
        setVerificationStatus('success');
        
        // Check for active sessions at other facilities
        if (data.activeSessions && data.activeSessions.length > 0) {
          setSessionToHandle(data.activeSessions[0]);
          setShowSessionModal(true);
        } else if (data.activePolicies && data.activePolicies.length > 1) {
          // Multiple insurers - show selection
          setStep('selection');
        } else if (data.activePolicies && data.activePolicies.length === 1) {
          // Single insurer - proceed directly
          setSelectedInsurer(data.activePolicies[0]);
          setStep('complete');
        } else {
          // No active policies
          setStep('complete');
        }
      } else {
        setVerificationStatus('failed');
      }
    } catch (error) {
      console.error('Patient verification error:', error);
      setVerificationStatus('failed');
    }
  };

  const handleInsurerSelection = (insurerId: string) => {
    const selected = activePolicies.find(policy => policy.id === insurerId);
    if (selected) {
      setSelectedInsurer(selected);
      setStep('complete');
      
      // Store selection in session
      sessionStorage.setItem('selectedInsurer', JSON.stringify(selected));
    }
  };

  const handleContinueSession = async (continueSession: boolean) => {
    setShowSessionModal(false);
    
    if (continueSession && sessionToHandle) {
      // Continue existing session
      try {
        await fetch('/api/front-desk/continue-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            sessionId: sessionToHandle.sessionId,
            patientId: verifiedPatient?.patientId
          })
        });
        
        setStep('complete');
      } catch (error) {
        console.error('Session continuation error:', error);
      }
    } else {
      // Start new session - check for multiple insurers
      if (activePolicies.length > 1) {
        setStep('selection');
      } else if (activePolicies.length === 1) {
        setSelectedInsurer(activePolicies[0]);
        setStep('complete');
      } else {
        setStep('complete');
      }
    }
  };

  const handleStartNewClaim = async () => {
    if (!verifiedPatient || !selectedInsurer) return;
    
    // Mock benefit buckets for the patient's insurance
    const mockBenefits = [
      {
        serviceType: 'consultation',
        name: 'Medical Consultation',
        description: 'General consultation with doctor',
        totalAllowed: 12,
        usedCount: 3,
        remainingAmount: 'KES 45,000',
        icon: '🩺'
      },
      {
        serviceType: 'laboratory',
        name: 'Laboratory Tests',
        description: 'Blood tests, X-rays, and diagnostics',
        totalAllowed: 20,
        usedCount: 5,
        remainingAmount: 'KES 25,000',
        icon: '🧪'
      },
      {
        serviceType: 'pharmacy',
        name: 'Pharmacy Benefits',
        description: 'Prescription medications',
        totalAllowed: 24,
        usedCount: 8,
        remainingAmount: 'KES 18,000',
        icon: '💊'
      },
      {
        serviceType: 'specialist',
        name: 'Specialist Consultation',
        description: 'Cardiologist, Dermatologist, etc.',
        totalAllowed: 6,
        usedCount: 1,
        remainingAmount: 'KES 30,000',
        icon: '👨‍⚕️'
      }
    ];
    
    setBenefitBuckets(mockBenefits);
    setStep('service');
  };

  const handleServiceSelection = async (serviceType: string) => {
    setSelectedService(serviceType);
    setStep('preauth');
    setPreauthLoading(true);
    
    try {
      const response = await fetch('/api/preauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          patientId: verifiedPatient?.id,
          insurer: selectedInsurer?.insurerName,
          serviceType: serviceType,
          clinicalJustification: `${serviceType} service requested for patient ${verifiedPatient?.patientId}`,
          estimatedCost: getEstimatedCost(serviceType),
          urgency: 'routine'
        })
      });
      
      const result = await response.json();
      setPreauthResult(result);
      
      if (result.decision === 'approved') {
        // Success - allow billing
        setStep('complete');
      } else {
        // Show denial reason
        // Stay on preauth step to show the denial
      }
    } catch (error) {
      console.error('Preauthorization error:', error);
      setPreauthResult({
        decision: 'denied',
        reason: 'System error during preauthorization. Please try again.',
        confidence: 0
      });
    } finally {
      setPreauthLoading(false);
    }
  };

  const getEstimatedCost = (serviceType: string): string => {
    const costs = {
      consultation: '2500',
      laboratory: '4500',
      pharmacy: '3200',
      specialist: '5000'
    };
    return costs[serviceType as keyof typeof costs] || '2000';
  };

  const generatePatientClaimForm = async () => {
    if (!verifiedPatient || !selectedInsurer) return;
    
    try {
      const patientData: PatientData = {
        name: `${verifiedPatient.firstName} ${verifiedPatient.lastName}`,
        dateOfBirth: new Date(verifiedPatient.dateOfBirth).toLocaleDateString(),
        gender: verifiedPatient.gender,
        memberId: verifiedPatient.patientId,
        phoneNumber: verifiedPatient.phoneNumber || '',
        address: verifiedPatient.address || '',
        diagnosis: 'General Consultation',
        treatment: 'Medical Evaluation',
        serviceDate: new Date().toLocaleDateString(),
        providerName: 'Erlessed Healthcare Platform'
      };

      const sampleServices: ClaimService[] = [
        {
          serviceCode: 'CONS001',
          serviceName: 'General Consultation',
          quantity: 1,
          unitCost: 2000,
          totalCost: 2000,
          serviceDate: new Date().toLocaleDateString()
        }
      ];

      const pdfBytes = await generateClaimForm(
        patientData, 
        selectedInsurer.insurerName, 
        sampleServices
      );
      
      const filename = generateFilename(patientData, selectedInsurer.insurerName);
      downloadPDF(pdfBytes, filename);
      
    } catch (error) {
      console.error('Error generating claim form:', error);
    }
  };

  const resetFlow = () => {
    setStep('input');
    setPatientId('');
    setOtpCode('');
    setVerificationStatus('idle');
    setVerifiedPatient(null);
    setActivePolicies([]);
    setSelectedInsurer(null);
    setActiveSessions([]);
    setScanProgress(0);
    setOtpSent(false);
    setSelectedService('');
    setBenefitBuckets([]);
    setPreauthResult(null);
    setPreauthLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Front Office Patient Verification</h1>
          <p className="text-gray-600">Secure patient identity verification and claim session management</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`flex items-center space-x-2 ${step === 'input' ? 'text-teal-600' : step === 'verification' || step === 'selection' || step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'input' ? 'bg-teal-100 border-2 border-teal-600' : step === 'verification' || step === 'selection' || step === 'complete' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Patient ID</span>
          </div>
          
          <div className={`w-8 h-1 ${step === 'verification' || step === 'selection' || step === 'complete' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          
          <div className={`flex items-center space-x-2 ${step === 'verification' ? 'text-teal-600' : step === 'selection' || step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'verification' ? 'bg-teal-100 border-2 border-teal-600' : step === 'selection' || step === 'complete' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Verification</span>
          </div>
          
          <div className={`w-8 h-1 ${step === 'complete' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          
          <div className={`flex items-center space-x-2 ${step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'complete' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Complete</span>
          </div>
        </div>

        {/* Step 1: Patient ID Input */}
        {step === 'input' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Patient Identification
              </CardTitle>
              <CardDescription>
                Enter the patient ID to begin verification process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Patient ID</label>
                <Input
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter patient ID (e.g., PAT001)"
                  className="text-lg"
                />
              </div>
              
              <Button 
                onClick={handlePatientLookup}
                disabled={!patientId.trim()}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                Lookup Patient
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Verification Method Selection and Execution */}
        {step === 'verification' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-600" />
                  Identity Verification
                </CardTitle>
                <CardDescription>
                  Choose verification method for patient {patientId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Verification Method Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant={verificationMethod === 'fingerprint' ? 'default' : 'outline'}
                    onClick={() => setVerificationMethod('fingerprint')}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Fingerprint className="w-6 h-6" />
                    <span>Fingerprint Scan</span>
                  </Button>
                  
                  <Button
                    variant={verificationMethod === 'otp' ? 'default' : 'outline'}
                    onClick={() => setVerificationMethod('otp')}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Smartphone className="w-6 h-6" />
                    <span>SMS OTP</span>
                  </Button>
                </div>

                {/* Fingerprint Verification */}
                {verificationMethod === 'fingerprint' && (
                  <div className="text-center space-y-4">
                    {verificationStatus === 'idle' && (
                      <Button
                        onClick={handleFingerprintVerification}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        <Fingerprint className="w-4 h-4 mr-2" />
                        Start Fingerprint Scan
                      </Button>
                    )}
                    
                    {verificationStatus === 'scanning' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <div className="relative">
                            <Fingerprint className={`w-16 h-16 text-teal-600 ${isScanning ? 'animate-pulse' : ''}`} />
                            {isScanning && (
                              <Loader2 className="w-6 h-6 animate-spin absolute -top-1 -right-1 text-blue-600" />
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Scanning fingerprint...</p>
                          <Progress value={scanProgress} className="h-2" />
                          <p className="text-xs text-gray-500">{Math.round(scanProgress)}% complete</p>
                        </div>
                      </div>
                    )}
                    
                    {verificationStatus === 'success' && (
                      <div className="text-center text-green-600">
                        <CheckCircle className="w-16 h-16 mx-auto mb-2" />
                        <p className="font-medium">Fingerprint Verified Successfully</p>
                      </div>
                    )}
                    
                    {verificationStatus === 'failed' && (
                      <div className="text-center">
                        <AlertTriangle className="w-16 h-16 mx-auto mb-2 text-red-600" />
                        <p className="font-medium text-red-600">Verification Failed</p>
                        <Button
                          onClick={() => setVerificationStatus('idle')}
                          variant="outline"
                          className="mt-2"
                        >
                          Try Again
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* SMS OTP Verification */}
                {verificationMethod === 'otp' && (
                  <div className="space-y-4">
                    {!otpSent ? (
                      <div className="text-center">
                        <Button
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isSendingOtp ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending OTP...
                            </>
                          ) : (
                            <>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Send OTP
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Alert>
                          <Phone className="w-4 h-4" />
                          <AlertDescription>
                            OTP has been sent to the patient's registered phone number
                          </AlertDescription>
                        </Alert>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Enter 6-digit OTP</label>
                          <Input
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            className="text-center text-lg tracking-widest"
                            maxLength={6}
                          />
                        </div>
                        
                        <Button
                          onClick={handleOtpVerification}
                          disabled={otpCode.length !== 6 || verificationStatus === 'scanning'}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {verificationStatus === 'scanning' ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            'Verify OTP'
                          )}
                        </Button>
                        
                        {verificationStatus === 'failed' && (
                          <Alert>
                            <AlertTriangle className="w-4 h-4" />
                            <AlertDescription>
                              Invalid OTP. Please check and try again.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Insurer Selection */}
        {step === 'selection' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Insurance Provider Selection
              </CardTitle>
              <CardDescription>
                Patient {verifiedPatient?.firstName} {verifiedPatient?.lastName} has multiple active insurance policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {activePolicies.map((policy) => (
                  <Card 
                    key={policy.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                    onClick={() => handleInsurerSelection(policy.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{policy.insurerName}</h3>
                          <p className="text-gray-600">{policy.schemeName}</p>
                          <p className="text-sm text-gray-500">Policy: {policy.policyNumber}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 mb-2">Active</Badge>
                          <p className="text-sm font-medium">
                            KES {policy.coverageAmount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Expires: {new Date(policy.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Service Selection */}
        {step === 'service' && verifiedPatient && selectedInsurer && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Select Service Type
              </CardTitle>
              <CardDescription>
                Choose the type of service for {verifiedPatient.firstName} {verifiedPatient.lastName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefitBuckets.map((bucket) => {
                  const usagePercent = (bucket.usedCount / bucket.totalAllowed) * 100;
                  const isLowUsage = usagePercent < 50;
                  const isMediumUsage = usagePercent >= 50 && usagePercent < 80;
                  const isHighUsage = usagePercent >= 80;
                  
                  return (
                    <Card 
                      key={bucket.serviceType}
                      className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-teal-500 hover:border-l-teal-600"
                      onClick={() => handleServiceSelection(bucket.serviceType)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{bucket.icon}</span>
                            <div>
                              <h3 className="font-semibold text-lg">{bucket.name}</h3>
                              <p className="text-sm text-gray-600">{bucket.description}</p>
                            </div>
                          </div>
                          <Badge 
                            className={`${
                              isLowUsage ? 'bg-green-100 text-green-800' :
                              isMediumUsage ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {bucket.usedCount}/{bucket.totalAllowed}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Usage</span>
                            <span>{Math.round(usagePercent)}%</span>
                          </div>
                          <Progress 
                            value={usagePercent} 
                            className={`h-2 ${
                              isLowUsage ? '[&>div]:bg-green-500' :
                              isMediumUsage ? '[&>div]:bg-yellow-500' :
                              '[&>div]:bg-red-500'
                            }`}
                          />
                          <p className="text-sm font-medium text-teal-700">
                            Remaining: {bucket.remainingAmount}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <Button 
                  onClick={() => setStep('complete')} 
                  variant="outline" 
                  className="w-full"
                >
                  Back to Patient Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Preauthorization */}
        {step === 'preauth' && verifiedPatient && selectedService && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Preauthorization Request
              </CardTitle>
              <CardDescription>
                Processing preauthorization for {selectedService} service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {preauthLoading ? (
                <div className="text-center space-y-4">
                  <Loader2 className="w-16 h-16 mx-auto animate-spin text-blue-600" />
                  <div>
                    <p className="text-lg font-medium">Processing Authorization...</p>
                    <p className="text-sm text-gray-600">Analyzing patient eligibility and coverage</p>
                  </div>
                </div>
              ) : preauthResult ? (
                <div className="space-y-4">
                  {preauthResult.decision === 'approved' ? (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Preauthorization Approved</strong>
                        <br />
                        {preauthResult.reason || 'Service authorized for billing.'}
                        <br />
                        <span className="text-sm">Confidence: {Math.round((preauthResult.confidence || 0.95) * 100)}%</span>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Preauthorization Denied</strong>
                        <br />
                        {preauthResult.reason || 'Service not authorized at this time.'}
                        <br />
                        <span className="text-sm">Confidence: {Math.round((preauthResult.confidence || 0.85) * 100)}%</span>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {preauthResult.chainOfThought && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-sm">Decision Process</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {preauthResult.chainOfThought.map((step: any, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="text-blue-600 font-mono text-xs mt-1">{index + 1}.</span>
                              <span className="text-gray-700">{step}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="flex gap-4 pt-4">
                    <Button 
                      onClick={() => setStep('service')} 
                      variant="outline" 
                      className="flex-1"
                    >
                      Select Different Service
                    </Button>
                    {preauthResult.decision === 'approved' ? (
                      <Button 
                        onClick={() => setStep('complete')} 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Proceed to Billing
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setStep('complete')} 
                        variant="outline" 
                        className="flex-1"
                      >
                        Return to Summary
                      </Button>
                    )}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Step 6: Complete */}
        {step === 'complete' && verifiedPatient && (
          <div className="space-y-6">
            {/* Patient Summary */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Patient Verified Successfully
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {verifiedPatient.firstName} {verifiedPatient.lastName}
                    </h3>
                    <p className="text-gray-600">ID: {verifiedPatient.patientId}</p>
                    <p className="text-gray-600">DOB: {new Date(verifiedPatient.dateOfBirth).toLocaleDateString()}</p>
                    <p className="text-gray-600">Gender: {verifiedPatient.gender}</p>
                  </div>
                  
                  {selectedInsurer && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Selected Insurance</h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium">{selectedInsurer.insurerName}</p>
                        <p className="text-sm text-gray-600">{selectedInsurer.schemeName}</p>
                        <p className="text-sm text-gray-600">Coverage: KES {selectedInsurer.coverageAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Claims Tracker */}
            <EnhancedClaimTracker patientId={verifiedPatient.patientId} showAllClaims={false} />

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={resetFlow} variant="outline">
                Verify New Patient
              </Button>
              {selectedInsurer && (
                <Button 
                  onClick={generatePatientClaimForm}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate Claim Form
                </Button>
              )}
              <Button 
                onClick={handleStartNewClaim}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Start New Claim
              </Button>
            </div>
          </div>
        )}

        {/* Active Session Modal */}
        {showSessionModal && sessionToHandle && (
          <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Active Session Detected
                </DialogTitle>
                <DialogDescription>
                  An active claim session was found at another facility
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <Alert>
                  <Building2 className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Facility:</strong> {sessionToHandle.facilityName}<br />
                    <strong>Service:</strong> {sessionToHandle.serviceName}<br />
                    <strong>Started:</strong> {new Date(sessionToHandle.startedAt).toLocaleString()}<br />
                    <strong>Provider:</strong> {sessionToHandle.userRole}
                  </AlertDescription>
                </Alert>
                
                <p className="text-sm text-gray-600">
                  Would you like to continue the existing session or start a new one?
                </p>
              </div>
              
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleContinueSession(false)}
                >
                  Start New Session
                </Button>
                <Button 
                  onClick={() => handleContinueSession(true)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Continue Existing
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}