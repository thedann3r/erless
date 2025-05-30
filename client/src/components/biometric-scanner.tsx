import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Fingerprint, CheckCircle, AlertTriangle } from "lucide-react";

interface BiometricScannerProps {
  onScanComplete: () => void;
  isLoading?: boolean;
}

export function BiometricScanner({ onScanComplete, isLoading = false }: BiometricScannerProps) {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scanProgress, setScanProgress] = useState(0);

  const handleStartScan = () => {
    setScanState('scanning');
    setScanProgress(0);
    
    // Simulate scanning process
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanState('success');
          setTimeout(() => {
            onScanComplete();
            setScanState('idle');
            setScanProgress(0);
          }, 1500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getScannerColor = () => {
    switch (scanState) {
      case 'scanning':
        return 'bg-blue-100 border-blue-300';
      case 'success':
        return 'bg-green-100 border-green-300';
      case 'error':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-teal-100 border-teal-300';
    }
  };

  const getIconColor = () => {
    switch (scanState) {
      case 'scanning':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-teal-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Scanner Display */}
      <div className={`p-8 rounded-lg border-2 transition-all duration-300 ${getScannerColor()}`}>
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white border-2 border-current flex items-center justify-center">
            {scanState === 'success' ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : scanState === 'error' ? (
              <AlertTriangle className="w-12 h-12 text-red-600" />
            ) : (
              <Fingerprint className={`w-12 h-12 ${getIconColor()} ${scanState === 'scanning' ? 'animate-pulse' : ''}`} />
            )}
          </div>
          
          <div className="space-y-2">
            {scanState === 'idle' && (
              <p className="text-gray-600">Place finger on sensor to begin verification</p>
            )}
            {scanState === 'scanning' && (
              <>
                <p className="text-blue-800 font-medium">Scanning fingerprint...</p>
                <Progress value={scanProgress} className="w-32 mx-auto" />
                <p className="text-sm text-blue-600">{scanProgress}% complete</p>
              </>
            )}
            {scanState === 'success' && (
              <p className="text-green-800 font-medium">Verification successful!</p>
            )}
            {scanState === 'error' && (
              <p className="text-red-800 font-medium">Verification failed. Please try again.</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={handleStartScan}
        disabled={isLoading || scanState === 'scanning' || scanState === 'success'}
        className="w-full bg-teal-600 hover:bg-teal-700"
      >
        {scanState === 'scanning' ? (
          <>
            <Fingerprint className="w-4 h-4 mr-2 animate-pulse" />
            Scanning...
          </>
        ) : scanState === 'success' ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Verified
          </>
        ) : (
          <>
            <Fingerprint className="w-4 h-4 mr-2" />
            Start Biometric Scan
          </>
        )}
      </Button>

      {/* Instructions */}
      <Alert>
        <Fingerprint className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Biometric Security:</strong> Ensure patient's finger is clean and dry. 
          Center the finger on the scanner for best results. This simulates actual fingerprint verification.
        </AlertDescription>
      </Alert>
    </div>
  );
}
