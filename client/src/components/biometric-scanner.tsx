import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BiometricScannerProps {
  onScanComplete: (biometricHash: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function BiometricScanner({ onScanComplete, isLoading = false, className }: BiometricScannerProps) {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    
    // Simulate fingerprint scanning delay
    setTimeout(() => {
      // Generate a simulated biometric hash
      const biometricHash = `bio_${Math.random().toString(36).substr(2, 16)}`;
      onScanComplete(biometricHash);
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className={cn("text-center", className)}>
      <div className={cn(
        "biometric-scanner relative mx-auto mb-4 transition-all duration-300",
        (isScanning || isLoading) && "animate-pulse"
      )}>
        <i className={cn(
          "fingerprint-icon fas fa-fingerprint transition-all duration-300",
          (isScanning || isLoading) && "animate-pulse"
        )}></i>
        
        {/* Scanning animation overlay */}
        {(isScanning || isLoading) && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent opacity-50 animate-scan"></div>
        )}
      </div>
      
      <div className="space-y-2">
        <Button
          onClick={handleScan}
          disabled={isScanning || isLoading}
          className="teal-button"
        >
          {isScanning ? (
            <>
              <i className="fas fa-spinner animate-spin mr-2"></i>
              Scanning...
            </>
          ) : isLoading ? (
            <>
              <i className="fas fa-spinner animate-spin mr-2"></i>
              Processing...
            </>
          ) : (
            <>
              <i className="fas fa-fingerprint mr-2"></i>
              Start Scan
            </>
          )}
        </Button>
        
        <p className="text-sm text-gray-600">
          {isScanning ? "Please hold finger steady..." : "Click to simulate fingerprint scan"}
        </p>
      </div>
      
      {/* Status indicators */}
      <div className="mt-4 flex justify-center space-x-2">
        <div className={cn(
          "w-2 h-2 rounded-full transition-colors duration-300",
          (isScanning || isLoading) ? "bg-yellow-500 animate-pulse" : "bg-gray-300"
        )}></div>
        <div className={cn(
          "w-2 h-2 rounded-full transition-colors duration-300",
          isLoading ? "bg-green-500" : "bg-gray-300"
        )}></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
      </div>
    </div>
  );
}
