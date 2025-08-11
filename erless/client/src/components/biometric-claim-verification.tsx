import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Fingerprint, Smartphone, CheckCircle, AlertTriangle, Send } from "lucide-react";

interface BiometricClaimVerificationProps {
  batchId: string;
  totalAmount: number;
  claimCount: number;
  onVerificationComplete: (verified: boolean) => void;
}

export function BiometricClaimVerification({ 
  batchId, 
  totalAmount, 
  claimCount, 
  onVerificationComplete 
}: BiometricClaimVerificationProps) {
  const [verificationStep, setVerificationStep] = useState<'select' | 'fingerprint' | 'otp' | 'complete'>('select');
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'fingerprint' | 'otp' | null>(null);

  const handleFingerprintVerification = async () => {
    setIsVerifying(true);
    setVerificationStep('fingerprint');
    
    // Simulate fingerprint scanning
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsVerifying(false);
    setVerificationStep('complete');
    setTimeout(() => {
      onVerificationComplete(true);
    }, 1000);
  };

  const handleOTPVerification = async () => {
    if (otpCode.length !== 6) return;
    
    setIsVerifying(true);
    
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsVerifying(false);
    setVerificationStep('complete');
    setTimeout(() => {
      onVerificationComplete(true);
    }, 1000);
  };

  const renderVerificationContent = () => {
    switch (verificationStep) {
      case 'select':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Confirm claim batch submission with biometric verification
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex-col space-y-2"
                onClick={() => {
                  setVerificationMethod('fingerprint');
                  handleFingerprintVerification();
                }}
              >
                <Fingerprint className="h-8 w-8 text-teal-600" />
                <span>Fingerprint</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col space-y-2"
                onClick={() => {
                  setVerificationMethod('otp');
                  setVerificationStep('otp');
                }}
              >
                <Smartphone className="h-8 w-8 text-blue-600" />
                <span>SMS OTP</span>
              </Button>
            </div>
          </div>
        );

      case 'fingerprint':
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className={`p-6 rounded-full ${isVerifying ? 'bg-teal-100 animate-pulse' : 'bg-gray-100'}`}>
                <Fingerprint className={`h-12 w-12 ${isVerifying ? 'text-teal-600' : 'text-gray-400'}`} />
              </div>
            </div>
            <div>
              <h4 className="font-medium">
                {isVerifying ? 'Scanning Fingerprint...' : 'Place your finger on the scanner'}
              </h4>
              <p className="text-sm text-muted-foreground">
                Verifying identity for claim submission authorization
              </p>
            </div>
          </div>
        );

      case 'otp':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Smartphone className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <h4 className="font-medium">Enter SMS Verification Code</h4>
              <p className="text-sm text-muted-foreground">
                Code sent to your registered mobile number
              </p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="otp">6-digit verification code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
              <Button 
                className="w-full" 
                onClick={handleOTPVerification}
                disabled={otpCode.length !== 6 || isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify & Submit'}
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="p-6 rounded-full bg-green-100">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-green-800">Verification Successful</h4>
              <p className="text-sm text-muted-foreground">
                Claim batch has been verified and submitted to insurer
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Send className="mr-2 h-4 w-4" />
          Submit Batch (Verification Required)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Confirm Batch Submission</span>
          </DialogTitle>
          <DialogDescription>
            Batch {batchId} • {claimCount} claims • KES {totalAmount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Batch Summary</span>
            <div className="text-right">
              <p className="text-sm font-medium">KES {totalAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{claimCount} claims</p>
            </div>
          </div>
          {renderVerificationContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}