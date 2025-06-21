import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Fingerprint, Smartphone, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BiometricVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (patientData: PatientSession) => void;
  patientId?: string;
}

interface PatientSession {
  id: string;
  firstName: string;
  lastName: string;
  memberId: string;
  insurerId: string;
  insurerName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emergencyContact: string;
  currentEncounter?: {
    id: string;
    diagnosis: string;
    services: Array<{
      code: string;
      description: string;
      cost: number;
    }>;
    providerId: string;
    providerName: string;
    doctorName: string;
    date: string;
  };
}

export function BiometricVerificationModal({ 
  isOpen, 
  onClose, 
  onVerificationComplete, 
  patientId 
}: BiometricVerificationModalProps) {
  const [verificationMethod, setVerificationMethod] = useState<"fingerprint" | "otp">("fingerprint");
  const [fingerprintProgress, setFingerprintProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "failed">("idle");
  const { toast } = useToast();

  // Mock patient data - in production, this would come from the database
  const mockPatientData: PatientSession = {
    id: patientId || "PT-2024-001",
    firstName: "Sarah",
    lastName: "Johnson",
    memberId: "CIC-001234567",
    insurerId: "CIC",
    insurerName: "CIC Insurance",
    dateOfBirth: "1985-06-15",
    gender: "Female",
    phoneNumber: "+254712345678",
    emergencyContact: "+254723456789",
    currentEncounter: {
      id: "ENC-2024-001",
      diagnosis: "Hypertension Follow-up",
      services: [
        { code: "99213", description: "Office Visit - Established Patient", cost: 5000 },
        { code: "80061", description: "Lipid Panel", cost: 2500 }
      ],
      providerId: "PROV-001",
      providerName: "Aga Khan Hospital",
      doctorName: "Dr. James Mwangi",
      date: new Date().toISOString()
    }
  };

  const simulateFingerprintScan = async () => {
    setIsScanning(true);
    setFingerprintProgress(0);
    
    // Simulate fingerprint scanning progress
    const interval = setInterval(() => {
      setFingerprintProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          handleVerificationSuccess();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const sendOTP = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number to receive OTP",
        variant: "destructive"
      });
      return;
    }

    // Simulate OTP sending
    toast({
      title: "OTP Sent",
      description: `Verification code sent to ${phoneNumber}`,
    });
  };

  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    // Simulate OTP verification (accept any 6-digit code for demo)
    setTimeout(() => {
      setIsVerifying(false);
      if (otpCode === "123456" || otpCode.length === 6) {
        handleVerificationSuccess();
      } else {
        setVerificationStatus("failed");
        toast({
          title: "Verification Failed",
          description: "Invalid OTP code. Please try again.",
          variant: "destructive"
        });
      }
    }, 1500);
  };

  const handleVerificationSuccess = () => {
    setVerificationStatus("success");
    
    setTimeout(() => {
      onVerificationComplete(mockPatientData);
      onClose();
      // Reset state for next use
      setVerificationStatus("idle");
      setFingerprintProgress(0);
      setOtpCode("");
      setPhoneNumber("");
    }, 1500);
  };

  const resetVerification = () => {
    setVerificationStatus("idle");
    setFingerprintProgress(0);
    setOtpCode("");
    setIsScanning(false);
    setIsVerifying(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Patient Identity Verification</DialogTitle>
          <DialogDescription>
            Verify patient identity to access insurance information and generate claims
          </DialogDescription>
        </DialogHeader>

        {verificationStatus === "success" ? (
          <div className="flex flex-col items-center space-y-4 py-8">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <div className="text-center">
              <h3 className="text-lg font-medium text-green-800">Verification Successful</h3>
              <p className="text-sm text-green-600">Patient identity confirmed. Loading session...</p>
            </div>
          </div>
        ) : verificationStatus === "failed" ? (
          <div className="flex flex-col items-center space-y-4 py-8">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <div className="text-center">
              <h3 className="text-lg font-medium text-red-800">Verification Failed</h3>
              <p className="text-sm text-red-600">Unable to verify patient identity. Please try again.</p>
            </div>
            <Button onClick={resetVerification} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <Tabs value={verificationMethod} onValueChange={(value: any) => setVerificationMethod(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fingerprint">Fingerprint</TabsTrigger>
              <TabsTrigger value="otp">SMS OTP</TabsTrigger>
            </TabsList>

            <TabsContent value="fingerprint" className="space-y-4">
              <Card>
                <CardHeader className="text-center">
                  <Fingerprint className="h-12 w-12 mx-auto text-primary" />
                  <CardTitle>Fingerprint Verification</CardTitle>
                  <CardDescription>
                    Place your finger on the scanner to verify identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isScanning && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Scanning...</span>
                        <span>{fingerprintProgress}%</span>
                      </div>
                      <Progress value={fingerprintProgress} className="h-2" />
                    </div>
                  )}
                  
                  <Button 
                    onClick={simulateFingerprintScan} 
                    disabled={isScanning}
                    className="w-full"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Scanning Fingerprint...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="h-4 w-4 mr-2" />
                        Start Fingerprint Scan
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-muted-foreground text-center">
                    <p>For demo purposes, the scan will automatically succeed</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="otp" className="space-y-4">
              <Card>
                <CardHeader className="text-center">
                  <Smartphone className="h-12 w-12 mx-auto text-primary" />
                  <CardTitle>SMS Verification</CardTitle>
                  <CardDescription>
                    Enter your phone number to receive a verification code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>

                  <Button onClick={sendOTP} variant="outline" className="w-full">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Send OTP Code
                  </Button>

                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <Button 
                    onClick={verifyOTP} 
                    disabled={isVerifying || otpCode.length !== 6}
                    className="w-full"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>

                  <div className="text-xs text-muted-foreground text-center">
                    <p>For demo purposes, use code "123456" or any 6-digit number</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}