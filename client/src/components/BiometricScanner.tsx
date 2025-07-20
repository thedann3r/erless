import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Fingerprint, CheckCircle, AlertCircle, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BiometricScannerProps {
  mode: 'register' | 'verify';
  patientId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function BiometricScanner({ 
  mode, 
  patientId, 
  onSuccess, 
  onError, 
  className 
}: BiometricScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<'success' | 'failed' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationScore, setVerificationScore] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate fingerprint scanning with progressive updates
  const simulateFingerprint = async (): Promise<string> => {
    setScanning(true);
    setScanProgress(0);
    setScanResult(null);
    setErrorMessage('');

    // Progressive scanning simulation
    const steps = [
      { progress: 15, message: 'Initializing scanner...' },
      { progress: 30, message: 'Detecting finger placement...' },
      { progress: 50, message: 'Capturing ridge patterns...' },
      { progress: 70, message: 'Analyzing minutiae points...' },
      { progress: 85, message: 'Generating biometric hash...' },
      { progress: 100, message: 'Scan complete!' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
      setScanProgress(step.progress);
    }

    // Generate mock fingerprint data (base64 encoded)
    const timestamp = Date.now();
    const randomData = Array.from({length: 64}, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
    
    return btoa(`fingerprint_${patientId}_${timestamp}_${randomData}`);
  };

  const handleScan = async () => {
    try {
      const fingerprintData = await simulateFingerprint();
      
      const endpoint = mode === 'register' 
        ? '/api/biometric/register'
        : '/api/biometric/verify';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          patientId,
          fingerprintData,
          deviceId: `web_${Date.now()}`
        })
      });

      const result = await response.json();

      if (result.success) {
        setScanResult('success');
        if (mode === 'verify' && result.verificationScore) {
          setVerificationScore(result.verificationScore);
        }
        onSuccess?.(result);
      } else {
        setScanResult('failed');
        setErrorMessage(result.error || 'Biometric operation failed');
        onError?.(result.error || 'Biometric operation failed');
      }
    } catch (error) {
      setScanResult('failed');
      const errorMsg = error instanceof Error ? error.message : 'Network error occurred';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setScanning(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file');
      return;
    }

    try {
      setScanning(true);
      setScanProgress(25);

      // Convert file to base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      setScanProgress(75);

      const endpoint = mode === 'register' 
        ? '/api/biometric/register'
        : '/api/biometric/verify';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          patientId,
          fingerprintData: fileData,
          deviceId: `upload_${Date.now()}`
        })
      });

      const result = await response.json();
      setScanProgress(100);

      if (result.success) {
        setScanResult('success');
        if (mode === 'verify' && result.verificationScore) {
          setVerificationScore(result.verificationScore);
        }
        onSuccess?.(result);
      } else {
        setScanResult('failed');
        setErrorMessage(result.error || 'Biometric operation failed');
        onError?.(result.error || 'Biometric operation failed');
      }
    } catch (error) {
      setScanResult('failed');
      const errorMsg = error instanceof Error ? error.message : 'File upload failed';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setScanning(false);
    }
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2">
          <Fingerprint className="h-6 w-6 text-[#265651]" />
          {mode === 'register' ? 'Register Fingerprint' : 'Verify Identity'}
        </CardTitle>
        <Badge variant="outline" className="mx-auto">
          Patient ID: {patientId}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Scanner Visualization */}
        <div className="relative">
          <div className={cn(
            "w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center transition-all duration-300",
            scanning ? "border-[#265651] bg-[#265651]/10 animate-pulse" : "border-gray-300",
            scanResult === 'success' && "border-green-500 bg-green-50",
            scanResult === 'failed' && "border-red-500 bg-red-50"
          )}>
            {scanning ? (
              <Loader2 className="h-12 w-12 text-[#265651] animate-spin" />
            ) : scanResult === 'success' ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : scanResult === 'failed' ? (
              <AlertCircle className="h-12 w-12 text-red-500" />
            ) : (
              <Fingerprint className="h-12 w-12 text-gray-400" />
            )}
          </div>

          {/* Progress Ring */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="68"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="68"
                  stroke="#265651"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={427}
                  strokeDashoffset={427 - (427 * scanProgress) / 100}
                  className="transition-all duration-300 ease-out"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {scanning && (
          <div className="space-y-2">
            <Progress value={scanProgress} className="w-full" />
            <p className="text-sm text-center text-gray-600">
              {scanProgress < 100 ? 'Scanning...' : 'Processing...'}
            </p>
          </div>
        )}

        {/* Verification Score */}
        {scanResult === 'success' && mode === 'verify' && verificationScore > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Verification successful! Match confidence: {Math.round(verificationScore)}%
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {scanResult === 'failed' && errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleScan}
            disabled={scanning}
            className="w-full bg-[#265651] hover:bg-[#1d453f] text-white"
          >
            {scanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Fingerprint className="mr-2 h-4 w-4" />
                {mode === 'register' ? 'Register Fingerprint' : 'Verify Fingerprint'}
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="w-full border-[#265651] text-[#265651] hover:bg-[#265651]/5"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Fingerprint Image
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 text-center space-y-2">
          <p>
            {mode === 'register' 
              ? 'Place your finger on the scanner or upload a fingerprint image'
              : 'Verify your identity using the same finger used during registration'
            }
          </p>
          <p className="text-xs text-gray-500">
            Ensure your finger is clean and dry for best results
          </p>
        </div>
      </CardContent>
    </Card>
  );
}