import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, TrendingUp, Users, DollarSign, Activity, Shield, Building2 } from "lucide-react";
import { CostComparisonDashboard } from "@/components/cost-comparison-dashboard";

interface ClaimOverview {
  id: number;
  patientName: string;
  patientId: string;
  provider: string;
  serviceType: string;
  claimAmount: number;
  status: "pending" | "approved" | "denied" | "flagged" | "void";
  submittedAt: string;
  flaggedReasons?: string[];
  riskScore?: number;
}

interface FraudAlert {
  id: number;
  alertType: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  providerId: number;
  providerName: string;
  patientCount: number;
  flaggedAmount: number;
  detectedAt: string;
  status: "open" | "investigating" | "resolved" | "false_positive";
}

interface ProviderAnalytics {
  providerId: number;
  providerName: string;
  providerType: string;
  totalClaims: number;
  totalAmount: number;
  approvalRate: number;
  averageClaimValue: number;
  flaggedClaims: number;
  topServices: string[];
  riskScore: number;
}

export default function CareManagerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("all");

  // Dashboard statistics
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/care-manager/stats", selectedTimeframe],
    queryFn: async () => ({
      totalClaims: 1247,
      pendingClaims: 89,
      flaggedClaims: 23,
      totalClaimValue: 15678900,
      approvalRate: 87.5,
      fraudDetectionRate: 2.3,
      averageProcessingTime: 4.2,
      costPerClaim: 12567
    }),
  });

  // Claims overview
  const { data: claimsOverview = [] } = useQuery({
    queryKey: ["/api/care-manager/claims", selectedTimeframe],
    queryFn: async () => [
      {
        id: 1,
        patientName: "John Doe",
        patientId: "P001234",
        provider: "Aga Khan University Hospital",
        serviceType: "Cardiology Consultation",
        claimAmount: 15000,
        status: "flagged" as const,
        submittedAt: "2024-06-18T10:30:00Z",
        flaggedReasons: ["Unusual frequency", "High cost variance"],
        riskScore: 8.5
      },
      {
        id: 2,
        patientName: "Mary Smith",
        patientId: "P001235",
        provider: "Kenyatta National Hospital",
        serviceType: "Laboratory Tests",
        claimAmount: 3500,
        status: "approved" as const,
        submittedAt: "2024-06-18T09:15:00Z"
      },
      {
        id: 3,
        patientName: "David Wilson",
        patientId: "P001236",
        provider: "Carepoint Medical Center",
        serviceType: "Emergency Care",
        claimAmount: 25000,
        status: "pending" as const,
        submittedAt: "2024-06-18T08:45:00Z"
      }
    ] as ClaimOverview[],
  });

  // Fraud alerts
  const { data: fraudAlerts = [] } = useQuery({
    queryKey: ["/api/care-manager/fraud-alerts", selectedRiskLevel],
    queryFn: async () => [
      {
        id: 1,
        alertType: "billing_pattern",
        description: "Unusual billing frequency for outpatient procedures",
        riskLevel: "high" as const,
        providerId: 1,
        providerName: "QuickCare Clinic",
        patientCount: 45,
        flaggedAmount: 127000,
        detectedAt: "2024-06-18T06:00:00Z",
        status: "open" as const
      },
      {
        id: 2,
        alertType: "duplicate_service",
        description: "Potential duplicate billing for same service",
        riskLevel: "medium" as const,
        providerId: 2,
        providerName: "City Medical Center",
        patientCount: 12,
        flaggedAmount: 34000,
        detectedAt: "2024-06-17T14:30:00Z",
        status: "investigating" as const
      }
    ] as FraudAlert[],
  });

  // Provider analytics
  const { data: providerAnalytics = [] } = useQuery({
    queryKey: ["/api/care-manager/provider-analytics", selectedTimeframe],
    queryFn: async () => [
      {
        providerId: 1,
        providerName: "Aga Khan University Hospital",
        providerType: "Hospital",
        totalClaims: 234,
        totalAmount: 3450000,
        approvalRate: 92.3,
        averageClaimValue: 14744,
        flaggedClaims: 8,
        topServices: ["Cardiology", "Surgery", "Emergency Care"],
        riskScore: 2.1
      },
      {
        providerId: 2,
        providerName: "Kenyatta National Hospital",
        providerType: "Hospital",
        totalClaims: 189,
        totalAmount: 2890000,
        approvalRate: 89.4,
        averageClaimValue: 15291,
        flaggedClaims: 12,
        topServices: ["General Medicine", "Pediatrics", "Oncology"],
        riskScore: 3.2
      },
      {
        providerId: 3,
        providerName: "Carepoint Medical Centers",
        providerType: "Clinic Network",
        totalClaims: 456,
        totalAmount: 1890000,
        approvalRate: 94.1,
        averageClaimValue: 4144,
        flaggedClaims: 3,
        topServices: ["Primary Care", "Laboratory", "Pharmacy"],
        riskScore: 1.8
      }
    ] as ProviderAnalytics[],
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      denied: "bg-red-100 text-red-800",
      flagged: "bg-orange-100 text-orange-800",
      void: "bg-gray-100 text-gray-800"
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const getRiskLevelBadge = (level: string) => {
    const variants = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    };
    return variants[level as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 7) return "text-red-600";
    if (score >= 4) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Care Manager Dashboard</h1>
          <p className="text-gray-600">Monitor claims activity, fraud detection, and provider analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-teal-600 border-teal-200">
            <Shield className="w-4 h-4 mr-1" />
            Care Manager
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-teal-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Claims</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.totalClaims?.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {(dashboardStats?.totalClaimValue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Flagged Claims</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.flaggedClaims}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.approvalRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Claims Overview</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Alerts</TabsTrigger>
          <TabsTrigger value="providers">Provider Analytics</TabsTrigger>
          <TabsTrigger value="benchmarks">Cost Benchmarks</TabsTrigger>
          <TabsTrigger value="cost-comparison">Cost Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Claims Activity ({claimsOverview.length})
              </CardTitle>
              <CardDescription>
                Real-time view of all claims across the healthcare network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {claimsOverview.map((claim) => (
                  <Card key={claim.id} className="border-l-4 border-l-teal-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-800 font-bold">
                            {claim.id}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{claim.patientName}</h3>
                            <p className="text-gray-600">ID: {claim.patientId}</p>
                            <p className="text-sm text-gray-500">{claim.provider}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={getStatusBadge(claim.status)}>
                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                          </Badge>
                          <div className="text-lg font-semibold">
                            KES {claim.claimAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Service Type</h4>
                          <p className="text-gray-700">{claim.serviceType}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Submitted</h4>
                          <p className="text-gray-700">
                            {new Date(claim.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {claim.riskScore && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Risk Score</h4>
                            <p className={`font-semibold ${getRiskScoreColor(claim.riskScore)}`}>
                              {claim.riskScore}/10
                            </p>
                          </div>
                        )}
                      </div>

                      {claim.flaggedReasons && claim.flaggedReasons.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" />
                            Flagged Reasons
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {claim.flaggedReasons.map((reason, index) => (
                              <Badge key={index} variant="outline" className="text-orange-700 border-orange-300">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Fraud Detection Alerts</h2>
              <p className="text-gray-600">AI-powered fraud pattern detection and risk assessment</p>
            </div>
            <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {fraudAlerts.map((alert) => (
                  <Card key={alert.id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{alert.providerName}</h3>
                            <p className="text-gray-600 capitalize">{alert.alertType.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-500">{alert.description}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={getRiskLevelBadge(alert.riskLevel)}>
                            {alert.riskLevel.charAt(0).toUpperCase() + alert.riskLevel.slice(1)} Risk
                          </Badge>
                          <div className="text-sm text-gray-600">
                            {alert.patientCount} patients affected
                          </div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Flagged Amount:</span>
                          <div className="text-red-600 font-semibold">
                            KES {alert.flaggedAmount.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Detected:</span>
                          <div className="text-gray-700">
                            {new Date(alert.detectedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Status:</span>
                          <div className="text-gray-700 capitalize">
                            {alert.status.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="text-right">
                          <Button size="sm" variant="outline">
                            Investigate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Provider Performance Analytics
              </CardTitle>
              <CardDescription>
                Compare performance metrics across healthcare providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerAnalytics.map((provider) => (
                  <Card key={provider.providerId} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{provider.providerName}</h3>
                          <p className="text-gray-600">{provider.providerType}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {provider.approvalRate}%
                          </div>
                          <p className="text-sm text-gray-600">Approval Rate</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {provider.totalClaims}
                          </div>
                          <p className="text-sm text-gray-600">Total Claims</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            KES {provider.averageClaimValue.toLocaleString()}
                          </div>
                          <p className="text-sm text-gray-600">Avg. Claim Value</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {provider.flaggedClaims}
                          </div>
                          <p className="text-sm text-gray-600">Flagged Claims</p>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getRiskScoreColor(provider.riskScore)}`}>
                            {provider.riskScore}
                          </div>
                          <p className="text-sm text-gray-600">Risk Score</p>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Top Service Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {provider.topServices.map((service, index) => (
                            <Badge key={index} variant="secondary">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Cost Benchmarking & Referral Analytics
              </CardTitle>
              <CardDescription>
                Compare costs across providers and track referral patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Cost Benchmarking */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Service Cost Benchmarks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Cardiology Consultation</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Hospital Average:</span>
                          <span className="font-medium">KES 15,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Clinic Average:</span>
                          <span className="font-medium">KES 8,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Network Average:</span>
                          <span className="font-medium text-teal-600">KES 12,500</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Laboratory Panel (Basic)</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Hospital Average:</span>
                          <span className="font-medium">KES 3,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Clinic Average:</span>
                          <span className="font-medium">KES 2,800</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Network Average:</span>
                          <span className="font-medium text-teal-600">KES 3,150</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Referral Analytics */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Referral Success Rates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">94%</div>
                      <p className="text-sm text-gray-600">Cardiology Referrals</p>
                      <p className="text-xs text-gray-500">AKU Hospital</p>
                    </Card>

                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">89%</div>
                      <p className="text-sm text-gray-600">Oncology Referrals</p>
                      <p className="text-xs text-gray-500">KNH</p>
                    </Card>

                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">92%</div>
                      <p className="text-sm text-gray-600">Pediatric Referrals</p>
                      <p className="text-xs text-gray-500">Gertrude's Hospital</p>
                    </Card>
                  </div>
                </div>

                {/* Co-pay Configuration */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Active Co-pay Policies</h3>
                  <div className="space-y-3">
                    <Card className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">NHIF Scheme</h4>
                          <p className="text-sm text-gray-600">National Hospital Insurance Fund</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">10%</div>
                          <p className="text-sm text-gray-600">Co-pay Rate</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Corporate Health Plans</h4>
                          <p className="text-sm text-gray-600">Private insurance schemes</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">15%</div>
                          <p className="text-sm text-gray-600">Co-pay Rate</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost-comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Premium Cost Comparison Analytics
              </CardTitle>
              <CardDescription>
                Real-time cost analysis and provider benchmarking for premium care managers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CostComparisonDashboard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-8">
        Powered by Aboolean
      </div>
    </div>
  );
}