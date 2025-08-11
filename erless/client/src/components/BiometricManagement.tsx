import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Fingerprint, 
  Shield, 
  RotateCcw, 
  History, 
  AlertTriangle,
  Clock,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

interface BiometricManagementProps {
  patientId: string;
  patientName?: string;
  className?: string;
}

interface AuditLog {
  _id: string;
  patientId: string;
  action: string;
  userId: string;
  userRole: string;
  deviceId?: string;
  ipAddress: string;
  timestamp: string;
  details: {
    success?: boolean;
    errorMessage?: string;
    verificationScore?: number;
    reason?: string;
  };
}

export function BiometricManagement({ patientId, patientName, className }: BiometricManagementProps) {
  const [resetReason, setResetReason] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if user can reset fingerprints
  const canResetFingerprints = user?.role && ['care_manager', 'insurer', 'admin'].includes(user.role);

  // Get biometric info
  const { data: biometricInfo, isLoading } = useQuery({
    queryKey: [`/api/biometric/info/${patientId}`],
    enabled: !!patientId
  });

  // Get audit logs
  const { data: auditData } = useQuery({
    queryKey: [`/api/biometric/audit/${patientId}`],
    enabled: showAuditLogs && !!patientId
  });

  // Reset fingerprint mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/biometric/reset/${patientId}`, {
        method: 'POST',
        body: { reason: resetReason }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/biometric/info/${patientId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/biometric/audit/${patientId}`] });
      setShowResetDialog(false);
      setResetReason('');
    }
  });

  // Complete reset mutation
  const completeResetMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/biometric/reset/${patientId}/complete`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/biometric/info/${patientId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/biometric/audit/${patientId}`] });
    }
  });

  const handleResetRequest = async () => {
    if (!resetReason.trim()) return;
    resetMutation.mutate();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'register':
        return <Fingerprint className="h-4 w-4 text-blue-500" />;
      case 'verify':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'reset_request':
      case 'reset_approved':
        return <RotateCcw className="h-4 w-4 text-orange-500" />;
      case 'verification_failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'register':
        return 'Registration';
      case 'verify':
        return 'Verification';
      case 'reset_request':
        return 'Reset Requested';
      case 'reset_approved':
        return 'Reset Approved';
      case 'verification_failed':
        return 'Verification Failed';
      default:
        return action;
    }
  };

  const getStatusBadge = (details: AuditLog['details']) => {
    if (details.success === true) {
      return <Badge variant="outline" className="text-green-600 border-green-300">Success</Badge>;
    } else if (details.success === false) {
      return <Badge variant="outline" className="text-red-600 border-red-300">Failed</Badge>;
    }
    return <Badge variant="outline">Info</Badge>;
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#265651]"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Biometric Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-[#265651]" />
            Biometric Status
            {patientName && <span className="text-sm font-normal text-gray-600">- {patientName}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Patient ID</Label>
              <Badge variant="outline">{patientId}</Badge>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Registration Status</Label>
              {biometricInfo?.info ? (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Registered
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-600">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Registered
                </Badge>
              )}
            </div>

            {biometricInfo?.info && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Registered Date</Label>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(biometricInfo.info.registeredAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge 
                    variant={biometricInfo.info.status === 'active' ? 'default' : 'secondary'}
                    className={cn(
                      biometricInfo.info.status === 'active' && "bg-green-100 text-green-800 border-green-300"
                    )}
                  >
                    {biometricInfo.info.status}
                  </Badge>
                </div>
              </>
            )}
          </div>

          {!biometricInfo?.info && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No biometric data registered for this patient. Patient needs to complete fingerprint registration.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Management Actions */}
      {canResetFingerprints && biometricInfo?.info && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#265651]" />
              Biometric Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-yellow-200 bg-yellow-50">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Administrator Controls:</strong> Use these options only when necessary for security or technical issues.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Request Reset
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Request Fingerprint Reset</DialogTitle>
                    <DialogDescription>
                      This will archive the current fingerprint and require the patient to register a new one. 
                      Please provide a reason for this reset.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reason">Reset Reason</Label>
                      <Textarea
                        id="reason"
                        value={resetReason}
                        onChange={(e) => setResetReason(e.target.value)}
                        placeholder="Please explain why this fingerprint reset is necessary..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowResetDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleResetRequest}
                        disabled={!resetReason.trim() || resetMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        {resetMutation.isPending ? 'Requesting...' : 'Request Reset'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                onClick={() => completeResetMutation.mutate()}
                disabled={completeResetMutation.isPending}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                {completeResetMutation.isPending ? 'Completing...' : 'Complete Reset'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#265651]" />
              Audit Logs
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAuditLogs(!showAuditLogs)}
            >
              {showAuditLogs ? 'Hide' : 'Show'} Logs
            </Button>
          </CardTitle>
        </CardHeader>
        
        {showAuditLogs && (
          <CardContent>
            {auditData?.logs?.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {auditData.logs.map((log: AuditLog) => (
                  <div 
                    key={log._id}
                    className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50"
                  >
                    {getActionIcon(log.action)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">
                          {getActionLabel(log.action)}
                        </span>
                        {getStatusBadge(log.details)}
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>By: {log.userRole}</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        
                        {log.details.errorMessage && (
                          <div className="text-red-600">
                            Error: {log.details.errorMessage}
                          </div>
                        )}
                        
                        {log.details.verificationScore && (
                          <div className="text-green-600">
                            Match: {Math.round(log.details.verificationScore)}%
                          </div>
                        )}
                        
                        {log.details.reason && (
                          <div>
                            Reason: {log.details.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No audit logs found for this patient.
              </p>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}