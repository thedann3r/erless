import { ClaimForm } from "@/components/claim-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface Claim {
  id: number;
  claimId: string;
  patientId: number;
  serviceType: string;
  status: string;
  serviceCost: string;
  aiDecision: string;
  aiConfidence: string;
  createdAt: string;
}

export default function ClaimsPage() {
  const { data: recentClaims, isLoading } = useQuery<Claim[]>({
    queryKey: ["/api/claims/recent"],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'review':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claims Processing</h1>
          <p className="text-gray-600">Submit and manage healthcare claims with AI-powered validation</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          AI Assisted
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claim Form */}
        <div className="lg:col-span-2">
          <ClaimForm />
        </div>

        {/* Recent Claims */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Recent Claims</span>
              </CardTitle>
              <CardDescription>
                Latest submitted claims and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : !recentClaims || recentClaims.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No claims found</p>
                  <p className="text-sm">Submit your first claim to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentClaims.slice(0, 10).map((claim) => (
                    <div key={claim.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{claim.claimId}</span>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(claim.status)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">{claim.serviceType}</span>
                        <Badge className={getStatusColor(claim.status)} variant="secondary">
                          {claim.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">${claim.serviceCost}</span>
                        {claim.aiConfidence && (
                          <span className="text-gray-500">
                            AI: {parseFloat(claim.aiConfidence).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(claim.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
