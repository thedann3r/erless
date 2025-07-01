import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Pill,
  TestTube,
  Stethoscope,
  Calendar,
  DollarSign,
  User,
  Building2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ClaimService {
  id: string;
  serviceName: string;
  serviceType: 'consultation' | 'lab' | 'pharmacy' | 'procedure';
  status: 'pending' | 'fulfilled' | 'cancelled' | 'expired';
  prescribedBy: string;
  startDate: string;
  durationDays?: number;
  quantity: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

interface EnhancedClaim {
  id: string;
  patientId: string;
  patientName: string;
  insurerName: string;
  schemeName: string;
  claimNumber: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'approved' | 'denied' | 'voided';
  isActive: boolean;
  submittedAt: string;
  services: ClaimService[];
}

interface ClaimTrackerProps {
  patientId?: string;
  showAllClaims?: boolean;
}

export function EnhancedClaimTracker({ patientId, showAllClaims = false }: ClaimTrackerProps) {
  const [selectedClaim, setSelectedClaim] = useState<EnhancedClaim | null>(null);

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['/api/enhanced-claims', patientId],
    queryFn: async () => {
      const url = patientId 
        ? `/api/enhanced-claims/patient/${patientId}` 
        : '/api/enhanced-claims';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch claims');
      return response.json() as Promise<EnhancedClaim[]>;
    }
  });

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'consultation':
        return <Stethoscope className="w-4 h-4" />;
      case 'pharmacy':
        return <Pill className="w-4 h-4" />;
      case 'lab':
        return <TestTube className="w-4 h-4" />;
      case 'procedure':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'denied':
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateClaimProgress = (claim: EnhancedClaim) => {
    const totalServices = claim.services.length;
    const completedServices = claim.services.filter(s => s.status === 'fulfilled').length;
    return totalServices > 0 ? (completedServices / totalServices) * 100 : 0;
  };

  const getActiveClaims = () => claims.filter(claim => claim.isActive);
  const getCompletedClaims = () => claims.filter(claim => !claim.isActive);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <span className="ml-2">Loading claims...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Claims Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Claims</p>
                <p className="text-2xl font-bold">{getActiveClaims().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">
                  KES {claims.reduce((sum, claim) => sum + claim.totalAmount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-teal-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{getCompletedClaims().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Claims Management
          </CardTitle>
          <CardDescription>
            Track and manage patient claims with detailed service breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Claims ({getActiveClaims().length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({getCompletedClaims().length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-4">
              <div className="space-y-4">
                {getActiveClaims().map((claim) => (
                  <ClaimCard 
                    key={claim.id} 
                    claim={claim} 
                    onSelect={setSelectedClaim}
                    calculateProgress={calculateClaimProgress}
                    getStatusColor={getStatusColor}
                  />
                ))}
                {getActiveClaims().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No active claims found</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4">
              <div className="space-y-4">
                {getCompletedClaims().map((claim) => (
                  <ClaimCard 
                    key={claim.id} 
                    claim={claim} 
                    onSelect={setSelectedClaim}
                    calculateProgress={calculateClaimProgress}
                    getStatusColor={getStatusColor}
                  />
                ))}
                {getCompletedClaims().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No completed claims found</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detailed Claim View */}
      {selectedClaim && (
        <ClaimDetailsModal 
          claim={selectedClaim} 
          onClose={() => setSelectedClaim(null)}
          getServiceIcon={getServiceIcon}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
}

function ClaimCard({ 
  claim, 
  onSelect, 
  calculateProgress, 
  getStatusColor 
}: {
  claim: EnhancedClaim;
  onSelect: (claim: EnhancedClaim) => void;
  calculateProgress: (claim: EnhancedClaim) => number;
  getStatusColor: (status: string) => string;
}) {
  const progress = calculateProgress(claim);
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-teal-500"
      onClick={() => onSelect(claim)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-semibold">{claim.claimNumber}</h3>
              <p className="text-sm text-gray-600">
                {claim.patientName} • {claim.insurerName}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(claim.status)}>
              {claim.status.toUpperCase()}
            </Badge>
            <p className="text-sm font-medium mt-1">
              KES {claim.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{claim.services.length} services</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>Submitted: {new Date(claim.submittedAt).toLocaleDateString()}</span>
          <span>Scheme: {claim.schemeName}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ClaimDetailsModal({ 
  claim, 
  onClose, 
  getServiceIcon, 
  getStatusIcon, 
  getStatusColor 
}: {
  claim: EnhancedClaim;
  onClose: () => void;
  getServiceIcon: (type: string) => React.ReactNode;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{claim.claimNumber}</CardTitle>
            <CardDescription>
              Detailed claim information and service breakdown
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Claim Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Patient</p>
              <p className="font-medium">{claim.patientName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Insurer</p>
              <p className="font-medium">{claim.insurerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="font-medium">{new Date(claim.submittedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Services Breakdown */}
        <div>
          <h4 className="font-semibold mb-4">Services ({claim.services.length})</h4>
          <div className="space-y-3">
            {claim.services.map((service) => (
              <div 
                key={service.id} 
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getServiceIcon(service.serviceType)}
                  <div>
                    <p className="font-medium">{service.serviceName}</p>
                    <p className="text-sm text-gray-600">
                      Qty: {service.quantity} • Prescribed by: {service.prescribedBy}
                    </p>
                    {service.durationDays && (
                      <p className="text-xs text-gray-500">
                        Duration: {service.durationDays} days
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(service.status)}
                    <Badge className={getStatusColor(service.status)}>
                      {service.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="font-medium">
                    KES {service.totalCost.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    @{service.unitCost} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}