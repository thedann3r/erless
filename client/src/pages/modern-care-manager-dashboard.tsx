import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { SharedLayout } from "@/components/layout/shared-layout";
import { 
  AlertTriangle, TrendingUp, Users, DollarSign, Activity, Shield, 
  Building2, Search, Filter, Eye, Flag, CheckCircle, XCircle,
  BarChart3, PieChart, TrendingDown, Zap
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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

export default function ModernCareManagerDashboard() {
  const { user } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [selectedScheme, setSelectedScheme] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const claimsOverview: ClaimOverview[] = [
    {
      id: 1,
      patientName: "Sarah Johnson",
      patientId: "PT-2024-001",
      provider: "Aga Khan Hospital",
      serviceType: "Cardiology Consultation",
      claimAmount: 15000,
      status: "flagged",
      submittedAt: "2024-06-20T08:30:00Z",
      flaggedReasons: ["Unusual service frequency", "High cost variance"],
      riskScore: 85
    },
    {
      id: 2,
      patientName: "Michael Ochieng",
      patientId: "PT-2024-002",
      provider: "Kenyatta National Hospital",
      serviceType: "Diabetes Follow-up",
      claimAmount: 3500,
      status: "approved",
      submittedAt: "2024-06-20T09:15:00Z",
      riskScore: 12
    },
    {
      id: 3,
      patientName: "Grace Wanjiku",
      patientId: "PT-2024-003",
      provider: "Nairobi Hospital",
      serviceType: "General Consultation",
      claimAmount: 2800,
      status: "pending",
      submittedAt: "2024-06-20T10:00:00Z",
      riskScore: 25
    }
  ];

  const fraudAlerts: FraudAlert[] = [
    {
      id: 1,
      alertType: "Billing Pattern Anomaly",
      description: "Unusual spike in high-value procedures from provider",
      riskLevel: "high",
      providerId: 101,
      providerName: "Metropolitan Medical Center",
      patientCount: 15,
      flaggedAmount: 850000,
      detectedAt: "2024-06-20T07:00:00Z",
      status: "investigating"
    },
    {
      id: 2,
      alertType: "Duplicate Claims",
      description: "Multiple claims for same service on same date",
      riskLevel: "medium",
      providerId: 205,
      providerName: "City Clinic Network",
      patientCount: 3,
      flaggedAmount: 45000,
      detectedAt: "2024-06-20T08:30:00Z",
      status: "open"
    }
  ];

  const providerAnalytics: ProviderAnalytics[] = [
    {
      providerId: 101,
      providerName: "Aga Khan Hospital",
      providerType: "Tertiary Hospital",
      totalClaims: 1245,
      totalAmount: 15600000,
      approvalRate: 94.2,
      averageClaimValue: 12530,
      flaggedClaims: 23,
      topServices: ["Cardiology", "Orthopedics", "Surgery"],
      riskScore: 15
    },
    {
      providerId: 102,
      providerName: "Kenyatta National Hospital",
      providerType: "Public Hospital",
      totalClaims: 3456,
      totalAmount: 28900000,
      approvalRate: 89.7,
      averageClaimValue: 8365,
      flaggedClaims: 67,
      topServices: ["Emergency", "Internal Medicine", "Pediatrics"],
      riskScore: 28
    },
    {
      providerId: 103,
      providerName: "Nairobi Hospital",
      providerType: "Private Hospital",
      totalClaims: 987,
      totalAmount: 18700000,
      approvalRate: 96.1,
      averageClaimValue: 18943,
      flaggedClaims: 12,
      topServices: ["Surgery", "Diagnostics", "Maternity"],
      riskScore: 8
    }
  ];

  const sidebarItems = [
    { path: "/care-manager-dashboard", icon: <BarChart3 className="h-5 w-5" />, label: "Claims Overview" },
    { path: "/care-manager/analytics", icon: <PieChart className="h-5 w-5" />, label: "Analytics" },
    { path: "/care-manager/fraud", icon: <AlertTriangle className="h-5 w-5" />, label: "Fraud Review", badge: "2" },
    { path: "/care-manager/cost", icon: <DollarSign className="h-5 w-5" />, label: "Cost Analysis" },
    { path: "/care-manager/providers", icon: <Building2 className="h-5 w-5" />, label: "Provider Performance" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-orange-100 text-orange-800 border-orange-200";
      case "denied": return "bg-red-100 text-red-800 border-red-200";
      case "flagged": return "bg-purple-100 text-purple-800 border-purple-200";
      case "void": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-600 bg-red-50";
    if (score >= 40) return "text-orange-600 bg-orange-50";
    if (score >= 20) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return "HIGH";
    if (score >= 40) return "MEDIUM";
    if (score >= 20) return "LOW";
    return "MINIMAL";
  };

  return (
    <SharedLayout sidebarItems={sidebarItems} title="Care Manager Dashboard">
      <div className="space-y-6">
        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-sm text-muted-foreground">Active Claims</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-sm text-muted-foreground">Flagged Claims</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">Void Claims</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">KES 2.4M</p>
                  <p className="text-sm text-muted-foreground">Net Claims Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center space-x-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search claims, patients, providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="aku">Aga Khan Hospital</SelectItem>
                  <SelectItem value="knh">Kenyatta National Hospital</SelectItem>
                  <SelectItem value="nairobi">Nairobi Hospital</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedScheme} onValueChange={setSelectedScheme}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Schemes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schemes</SelectItem>
                  <SelectItem value="nhif">NHIF</SelectItem>
                  <SelectItem value="private">Private Insurance</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Claims Overview</TabsTrigger>
            <TabsTrigger value="providers">Provider Analytics</TabsTrigger>
            <TabsTrigger value="fraud">Fraud Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Claims List */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Claims</CardTitle>
                  <CardDescription>Latest claim submissions across network</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {claimsOverview.map((claim) => (
                      <div key={claim.id} className="border rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{claim.patientName}</h4>
                            <p className="text-sm text-muted-foreground">{claim.patientId}</p>
                          </div>
                          <Badge className={getStatusColor(claim.status)}>
                            {claim.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Provider:</span> {claim.provider}</p>
                          <p><span className="font-medium">Service:</span> {claim.serviceType}</p>
                          <p><span className="font-medium">Amount:</span> KES {claim.claimAmount.toLocaleString()}</p>
                        </div>

                        {claim.riskScore && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Risk Score:</span>
                            <Badge className={getRiskColor(claim.riskScore)}>
                              {claim.riskScore}% {getRiskLevel(claim.riskScore)}
                            </Badge>
                          </div>
                        )}

                        {claim.flaggedReasons && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-orange-600">Flagged Reasons:</p>
                            <ul className="text-xs text-orange-700 space-y-1">
                              {claim.flaggedReasons.map((reason, index) => (
                                <li key={index}>• {reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          {claim.status === "flagged" && (
                            <Button size="sm" variant="outline">
                              <Flag className="h-4 w-4 mr-1" />
                              Investigate
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Fraud Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>Active Fraud Alerts</span>
                  </CardTitle>
                  <CardDescription>System-detected suspicious patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fraudAlerts.map((alert) => (
                      <div key={alert.id} className="border border-orange-200 bg-orange-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-orange-800">{alert.alertType}</h4>
                            <p className="text-sm text-orange-700">{alert.description}</p>
                          </div>
                          <Badge className={
                            alert.riskLevel === "high" ? "bg-red-100 text-red-800" :
                            alert.riskLevel === "medium" ? "bg-orange-100 text-orange-800" :
                            "bg-yellow-100 text-yellow-800"
                          }>
                            {alert.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Provider:</span> {alert.providerName}</p>
                          <p><span className="font-medium">Patients Affected:</span> {alert.patientCount}</p>
                          <p><span className="font-medium">Flagged Amount:</span> KES {alert.flaggedAmount.toLocaleString()}</p>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                            <Zap className="h-4 w-4 mr-1" />
                            Investigate
                          </Button>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Reviewed
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="providers" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {providerAnalytics.map((provider) => (
                <Card key={provider.providerId} className="card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{provider.providerName}</span>
                      <Badge variant="outline">{provider.providerType}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Risk Score: <span className={getRiskColor(provider.riskScore)}>{provider.riskScore}%</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Claims</p>
                        <p className="font-medium">{provider.totalClaims.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="font-medium">KES {(provider.totalAmount / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Approval Rate</p>
                        <p className="font-medium">{provider.approvalRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Claim</p>
                        <p className="font-medium">KES {provider.averageClaimValue.toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Approval Rate</span>
                        <span>{provider.approvalRate}%</span>
                      </div>
                      <Progress value={provider.approvalRate} className="h-2" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Top Services</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.topServices.map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Detailed Analytics
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fraud" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  <span>Fraud Detection Dashboard</span>
                </CardTitle>
                <CardDescription>
                  Advanced pattern recognition and anomaly detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Detection Algorithms</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Billing Pattern Analysis</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Duplicate Detection</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Outlier Analysis</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Network Analysis</span>
                        <Badge className="bg-orange-100 text-orange-800">Training</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Today's Detection Stats</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Claims Analyzed</span>
                          <span>1,247</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Anomalies Detected</span>
                          <span>23 (1.8%)</span>
                        </div>
                        <Progress value={1.8} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>False Positives</span>
                          <span>2 (8.7%)</span>
                        </div>
                        <Progress value={8.7} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Risk Heatmap</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(9)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-8 rounded ${
                            i === 2 || i === 5 ? 'bg-red-200' :
                            i === 1 || i === 4 || i === 7 ? 'bg-orange-200' :
                            'bg-green-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Provider risk distribution across network
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SharedLayout>
  );
}