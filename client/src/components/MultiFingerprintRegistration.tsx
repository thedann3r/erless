import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Fingerprint, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Hand, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiFingerprintRegistrationProps {
  patientId: string;
  patientName?: string;
  onComplete?: (results: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface FingerData {
  id: string;
  name: string;
  hand: 'left' | 'right';
  scanned: boolean;
  scanning: boolean;
  progress: number;
  result: 'success' | 'failed' | null;
  error?: string;
  fingerprintId?: string;
}

const FINGERS: FingerData[] = [
  // Right Hand
  { id: 'right_thumb', name: 'Right Thumb', hand: 'right', scanned: false, scanning: false, progress: 0, result: null },
  { id: 'right_index', name: 'Right Index', hand: 'right', scanned: false, scanning: false, progress: 0, result: null },
  { id: 'right_middle', name: 'Right Middle', hand: 'right', scanned: false, scanning: false, progress: 0, result: null },
  { id: 'right_ring', name: 'Right Ring', hand: 'right', scanned: false, scanning: false, progress: 0, result: null },
  { id: 'right_pinky', name: 'Right Pinky', hand: 'right', scanned: false, scanning: false, progress: 0, result: null },
  // Left Hand
  { id: 'left_thumb', name: 'Left Thumb', hand: 'left', scanned: false, scanning: false, progress: 0, result: null },
  { id: 'left_index', name: 'Left Index', hand: 'left', scanned: false, scanning: false, progress: 0, result: null },
  { id: 'left_middle', name: 'Left Middle', hand: 'left', scanned: false, scanning: false, progress: 0, result: null },
  { id: 'left_ring', name: 'Left Ring', hand: 'left', scanned: false, scanning: false, progress: 0, result: null },
  { id: 'left_pinky', name: 'Left Pinky', hand: 'left', scanned: false, scanning: false, progress: 0, result: null },
];

export function MultiFingerprintRegistration({
  patientId,
  patientName,
  onComplete,
  onError,
  className
}: MultiFingerprintRegistrationProps) {
  const [fingers, setFingers] = useState<FingerData[]>(FINGERS);
  const [activeTab, setActiveTab] = useState<'right' | 'left'>('right');
  const [currentFinger, setCurrentFinger] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  // Simulate fingerprint scanning
  const simulateFingerprint = async (fingerId: string): Promise<string> => {
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
      
      setFingers(prev => prev.map(finger => 
        finger.id === fingerId 
          ? { ...finger, progress: step.progress }
          : finger
      ));
    }

    // Generate mock fingerprint data
    const timestamp = Date.now();
    const randomData = Array.from({length: 64}, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
    
    return btoa(`fingerprint_${patientId}_${fingerId}_${timestamp}_${randomData}`);
  };

  const scanFingerprint = async (fingerId: string) => {
    setCurrentFinger(fingerId);
    
    // Update scanning state
    setFingers(prev => prev.map(finger => 
      finger.id === fingerId 
        ? { ...finger, scanning: true, progress: 0, result: null, error: undefined }
        : finger
    ));

    try {
      const fingerprintData = await simulateFingerprint(fingerId);
      
      const response = await fetch('/api/biometric/register-finger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          patientId,
          fingerId,
          fingerprintData,
          deviceId: `multi_scanner_${Date.now()}`
        })
      });

      const result = await response.json();

      if (result.success) {
        setFingers(prev => prev.map(finger => 
          finger.id === fingerId 
            ? { 
                ...finger, 
                scanning: false, 
                scanned: true, 
                result: 'success',
                fingerprintId: result.fingerprintId
              }
            : finger
        ));
        updateOverallProgress();
      } else {
        setFingers(prev => prev.map(finger => 
          finger.id === fingerId 
            ? { 
                ...finger, 
                scanning: false, 
                result: 'failed',
                error: result.error || 'Registration failed'
              }
            : finger
        ));
        onError?.(result.error || 'Fingerprint registration failed');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error occurred';
      setFingers(prev => prev.map(finger => 
        finger.id === fingerId 
          ? { 
              ...finger, 
              scanning: false, 
              result: 'failed',
              error: errorMsg
            }
          : finger
      ));
      onError?.(errorMsg);
    } finally {
      setCurrentFinger(null);
    }
  };

  const updateOverallProgress = () => {
    const scannedCount = fingers.filter(f => f.scanned).length;
    const newProgress = (scannedCount / fingers.length) * 100;
    setOverallProgress(newProgress);
    
    if (scannedCount === fingers.length) {
      onComplete?.(fingers.filter(f => f.scanned));
    }
  };

  const resetFinger = (fingerId: string) => {
    setFingers(prev => prev.map(finger => 
      finger.id === fingerId 
        ? { 
            ...finger, 
            scanned: false, 
            scanning: false, 
            progress: 0, 
            result: null,
            error: undefined,
            fingerprintId: undefined
          }
        : finger
    ));
    updateOverallProgress();
  };

  const getHandFingers = (hand: 'left' | 'right') => {
    return fingers.filter(f => f.hand === hand);
  };

  const renderFingerCard = (finger: FingerData) => {
    return (
      <Card key={finger.id} className="relative">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">{finger.name}</h4>
            <Badge 
              variant={finger.scanned ? "default" : finger.result === 'failed' ? "destructive" : "outline"}
              className={cn(
                finger.scanned && "bg-green-100 text-green-700 border-green-300"
              )}
            >
              {finger.scanning ? 'Scanning' : finger.scanned ? 'Complete' : finger.result === 'failed' ? 'Failed' : 'Pending'}
            </Badge>
          </div>

          {/* Finger Visualization */}
          <div className="relative mb-4">
            <div className={cn(
              "w-20 h-20 mx-auto rounded-full border-4 flex items-center justify-center transition-all duration-300",
              finger.scanning ? "border-[#265651] bg-[#265651]/10 animate-pulse" : "border-gray-300",
              finger.result === 'success' && "border-green-500 bg-green-50",
              finger.result === 'failed' && "border-red-500 bg-red-50"
            )}>
              {finger.scanning ? (
                <Loader2 className="h-8 w-8 text-[#265651] animate-spin" />
              ) : finger.result === 'success' ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : finger.result === 'failed' ? (
                <AlertCircle className="h-8 w-8 text-red-500" />
              ) : (
                <Fingerprint className="h-8 w-8 text-gray-400" />
              )}
            </div>

            {/* Progress Ring */}
            {finger.scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    stroke="#265651"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={276}
                    strokeDashoffset={276 - (276 * finger.progress) / 100}
                    className="transition-all duration-300 ease-out"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {finger.scanning && (
            <div className="mb-3">
              <Progress value={finger.progress} className="w-full h-2" />
              <p className="text-xs text-center text-gray-600 mt-1">
                {finger.progress}%
              </p>
            </div>
          )}

          {/* Error Message */}
          {finger.result === 'failed' && finger.error && (
            <Alert variant="destructive" className="mb-3 text-xs">
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                {finger.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {!finger.scanned && finger.result !== 'failed' && (
              <Button
                onClick={() => scanFingerprint(finger.id)}
                disabled={finger.scanning || currentFinger !== null}
                className="w-full bg-[#265651] hover:bg-[#1d453f] text-white text-sm"
                size="sm"
              >
                {finger.scanning ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Fingerprint className="mr-2 h-3 w-3" />
                    Scan
                  </>
                )}
              </Button>
            )}

            {(finger.result === 'failed' || finger.scanned) && (
              <Button
                onClick={() => resetFinger(finger.id)}
                disabled={finger.scanning || currentFinger !== null}
                variant="outline"
                className="w-full text-sm"
                size="sm"
              >
                <RotateCcw className="mr-2 h-3 w-3" />
                Rescan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const scannedCount = fingers.filter(f => f.scanned).length;
  const failedCount = fingers.filter(f => f.result === 'failed').length;

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hand className="h-6 w-6 text-[#265651]" />
            Multi-Fingerprint Registration
          </CardTitle>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline">Patient ID: {patientId}</Badge>
              {patientName && (
                <Badge variant="outline" className="ml-2">{patientName}</Badge>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Progress: {scannedCount}/{fingers.length} fingers
              </p>
              <Progress value={overallProgress} className="w-32 mt-1" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{scannedCount}</div>
            <div className="text-sm text-gray-600">Registered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{fingers.length - scannedCount - failedCount}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Hand Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'right' | 'left')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="right" className="flex items-center gap-2">
            <Hand className="h-4 w-4" />
            Right Hand ({getHandFingers('right').filter(f => f.scanned).length}/5)
          </TabsTrigger>
          <TabsTrigger value="left" className="flex items-center gap-2">
            <Hand className="h-4 w-4 scale-x-[-1]" />
            Left Hand ({getHandFingers('left').filter(f => f.scanned).length}/5)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="right" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {getHandFingers('right').map(renderFingerCard)}
          </div>
        </TabsContent>

        <TabsContent value="left" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {getHandFingers('left').map(renderFingerCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">Registration Instructions:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Ensure hands are clean and dry before scanning</p>
            <p>• Place each finger firmly on the scanner</p>
            <p>• Hold steady during the scanning process</p>
            <p>• Register at least 3 fingers per hand for optimal security</p>
            <p>• You can rescan any finger if the initial scan fails</p>
          </div>
        </CardContent>
      </Card>

      {/* Completion Actions */}
      {scannedCount >= 6 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-800">Minimum Requirements Met!</h4>
                <p className="text-sm text-green-600">
                  You have registered {scannedCount} fingers. You can continue registering more or proceed.
                </p>
              </div>
              <Button 
                onClick={() => onComplete?.(fingers.filter(f => f.scanned))}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}