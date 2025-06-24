import { useState, useEffect } from "react";
import { SharedLayout } from "@/components/layout/shared-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Eye, 
  Users, 
  Activity,
  Filter,
  Download,
  Search,
  Bell,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  Heart,
  Brain,
  Stethoscope,
  Award,
  Clock
} from "lucide-react";
import { useLocation } from "wouter";

const sidebarItems = [
  { path: "/modern-care-manager", icon: <BarChart3 className="h-5 w-5" />, label: "Claims Overview" },
  { path: "/modern-care-manager/fraud", icon: <Shield className="h-5 w-5" />, label: "Fraud Alerts", badge: "12" },
  { path: "/modern-care-manager/costs", icon: <TrendingUp className="h-5 w-5" />, label: "Cost Trends" },
  { path: "/modern-care-manager/referrals", icon: <Users className="h-5 w-5" />, label: "Referral Patterns" },
  { path: "/modern-care-manager/benchmarks", icon: <Target className="h-5 w-5" />, label: "Provider Benchmarks", badge: "Premium" },
  { path: "/modern-care-manager/analytics", icon: <Brain className="h-5 w-5" />, label: "Advanced Analytics", badge: "Premium" }
];

// Mock data for demonstration
const mockClaimsData = [
  {
    id: "CLM-2024-001",
    patient: "Mary Wanjiku",
    provider: "Nairobi Hospital",
    amount: 45000,
    service: "Cardiac Surgery",
    flaggedReason: "Unusual procedure frequency",
    severity: "high",
    status: "pending_review",
    riskScore: 85,
    submittedDate: "2024-06-22",
    flags: ["High Cost", "Frequency Alert"]
  },
  {
    id: "CLM-2024-002",
    patient: "James Kiprotich",
    provider: "Aga Khan Hospital",
    amount: 15000,
    service: "MRI Scan",
    flaggedReason: "Duplicate service",
    severity: "medium",
    status: "investigating",
    riskScore: 65,
    submittedDate: "2024-06-21",
    flags: ["Duplicate", "Same Provider"]
  },
  {
    id: "CLM-2024-003",
    patient: "Grace Mutindi",
    provider: "Kenyatta Hospital",
    amount: 8500,
    service: "Lab Tests",
    flaggedReason: "Pattern deviation",
    severity: "low",
    status: "cleared",
    riskScore: 25,
    submittedDate: "2024-06-20",
    flags: ["Pattern Alert"]
  }
];

const mockProviderBenchmarks = [
  {
    provider: "Nairobi Hospital",
    category: "Cardiac",
    avgCost: 42000,
    survivalRate: 94.5,
    patientSatisfaction: 4.6,
    avgStayDays: 5.2,
    complicationRate: 2.1,
    benchmark: "excellent"
  },
  {
    provider: "Aga Khan Hospital",
    category: "Orthopedic",
    avgCost: 38000,
    survivalRate: 97.2,
    patientSatisfaction: 4.8,
    avgStayDays: 4.1,
    complicationRate: 1.8,
    benchmark: "excellent"
  },
  {
    provider: "Kenyatta Hospital",
    category: "General Surgery",
    avgCost: 28000,
    survivalRate: 91.8,
    patientSatisfaction: 4.2,
    avgStayDays: 6.8,
    complicationRate: 3.2,
    benchmark: "good"
  }
];

const mockBenefitBurnRates = [
  { category: "Inpatient Care", used: 68, total: 100, percentage: 68 },
  { category: "Outpatient Services", used: 42, total: 80, percentage: 52.5 },
  { category: "Prescription Drugs", used: 89, total: 120, percentage: 74.2 },
  { category: "Diagnostic Tests", used: 156, total: 200, percentage: 78 },
  { category: "Emergency Services", used: 23, total: 50, percentage: 46 }
];

export default function ModernCareManagerDashboard() {
  const [, setLocation] = useLocation();
  const [selectedTimeframe, setSelectedTimeframe] = useState("30days");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock user data for demo purposes
  const user = {
    id: 5,
    username: "caremanager1",
    email: "care@nairobi.hospital",
    name: "Dr. Sarah Mwangi",
    role: "care-manager",
    premiumAccess: true
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBenchmarkColor = (benchmark: string) => {
    switch (benchmark) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredClaims = mockClaimsData.filter(claim =>
    claim.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SharedLayout 
      user={user} 
      sidebarItems={sidebarItems}
      className="min-h-screen bg-gray-50"
    >
      <div className="space-y-8">
        {/* Header Analytics */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Care Manager Dashboard</h1>
            <p className="text-gray-600">Cross-network claims oversight and provider analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              <Badge className="ml-2 bg-red-500">3</Badge>
            </Button>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 Days</SelectItem>
                <SelectItem value="30days">30 Days</SelectItem>
                <SelectItem value="90days">90 Days</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Gross Claims</p>
                  <p className="text-2xl font-bold text-gray-900">KES 24.8M</p>
                  <p className="text-xs text-green-600">↑ 12% from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Net Claims</p>
                  <p className="text-2xl font-bold text-gray-900">KES 22.1M</p>
                  <p className="text-xs text-green-600">89% approval rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Void Claims</p>
                  <p className="text-2xl font-bold text-gray-900">247</p>
                  <p className="text-xs text-red-600">KES 2.7M lost</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Fraud Risk</p>
                  <p className="text-2xl font-bold text-gray-900">3.2%</p>
                  <p className="text-xs text-orange-600">12 high-risk cases</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="flagged-claims" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="flagged-claims">Flagged Claims</TabsTrigger>
            <TabsTrigger value="cost-trends">Cost Trends</TabsTrigger>
            <TabsTrigger value="benchmarks">Provider Benchmarks</TabsTrigger>
            <TabsTrigger value="analytics">
              Premium Analytics
              <Badge className="ml-2 bg-teal-100 text-teal-800">Premium</Badge>
            </TabsTrigger>
          </TabsList>

          {/* AI-Flagged Claims Table */}
          <TabsContent value="flagged-claims" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      <span>Intelligence-Flagged Claims</span>
                    </CardTitle>
                    <CardDescription>
                      Claims requiring review based on pattern analysis and risk scoring
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search claims..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Providers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Providers</SelectItem>
                        <SelectItem value="nairobi">Nairobi Hospital</SelectItem>
                        <SelectItem value="agakhan">Aga Khan Hospital</SelectItem>
                        <SelectItem value="kenyatta">Kenyatta Hospital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Flags</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-medium">{claim.id}</TableCell>
                        <TableCell>{claim.patient}</TableCell>
                        <TableCell>{claim.provider}</TableCell>
                        <TableCell>{claim.service}</TableCell>
                        <TableCell>KES {claim.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{claim.riskScore}%</span>
                            <Progress value={claim.riskScore} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(claim.severity)}>
                            {claim.severity.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {claim.flags.map((flag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              Override
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Trends */}
          <TabsContent value="cost-trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LineChart className="h-5 w-5 text-blue-600" />
                    <span>Cross-Provider Cost Trends</span>
                  </CardTitle>
                  <CardDescription>
                    30-day rolling average costs by service category
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">KES 28,450</p>
                      <p className="text-sm text-gray-600">Avg Surgery Cost</p>
                      <p className="text-xs text-green-600">↓ 5% from last month</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">KES 12,800</p>
                      <p className="text-sm text-gray-600">Avg Diagnostic</p>
                      <p className="text-xs text-red-600">↑ 8% from last month</p>
                    </div>
                  </div>
                  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Cost Trend Chart</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    <span>Benefit Category Burn Rates</span>
                  </CardTitle>
                  <CardDescription>
                    Current utilization vs annual limits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockBenefitBurnRates.map((benefit, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{benefit.category}</span>
                        <span className="text-sm text-gray-600">
                          {benefit.used}/{benefit.total} ({benefit.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress 
                        value={benefit.percentage} 
                        className="h-2"
                        color={benefit.percentage > 80 ? "red" : benefit.percentage > 60 ? "yellow" : "green"}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Provider Benchmarks */}
          <TabsContent value="benchmarks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-teal-600" />
                  <span>Real-Time Provider Benchmarking</span>
                </CardTitle>
                <CardDescription>
                  Survival rates, costs, and quality metrics across care providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Avg Cost</TableHead>
                      <TableHead>Survival Rate</TableHead>
                      <TableHead>Patient Satisfaction</TableHead>
                      <TableHead>Avg Stay (Days)</TableHead>
                      <TableHead>Complication Rate</TableHead>
                      <TableHead>Benchmark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProviderBenchmarks.map((provider, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{provider.provider}</TableCell>
                        <TableCell>{provider.category}</TableCell>
                        <TableCell>KES {provider.avgCost.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {provider.survivalRate}%
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <span>{provider.patientSatisfaction}</span>
                            <Award className="h-4 w-4 text-yellow-500" />
                          </div>
                        </TableCell>
                        <TableCell>{provider.avgStayDays}</TableCell>
                        <TableCell className="text-red-600">{provider.complicationRate}%</TableCell>
                        <TableCell>
                          <Badge className={`${getBenchmarkColor(provider.benchmark)} bg-opacity-20`}>
                            {provider.benchmark.toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Premium Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            {user.premiumAccess ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Eye className="h-5 w-5 text-purple-600" />
                        <span>Real-Time Cost Visibility</span>
                        <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
                      </CardTitle>
                      <CardDescription>
                        Live cost tracking and policy fit analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-lg font-bold text-blue-600">KES 2.4M</p>
                          <p className="text-sm text-gray-600">Today's Inpatient Costs</p>
                          <p className="text-xs text-green-600">Within policy limits</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                          <p className="text-lg font-bold text-orange-600">KES 890K</p>
                          <p className="text-sm text-gray-600">Today's Procedure Costs</p>
                          <p className="text-xs text-orange-600">Approaching threshold</p>
                        </div>
                      </div>
                      <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-600">Real-Time Cost Dashboard</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-red-600" />
                        <span>Procedure Referral Analytics</span>
                        <Badge className="bg-red-100 text-red-800">Premium</Badge>
                      </CardTitle>
                      <CardDescription>
                        Cost-to-policy fit analysis for referral patterns
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Heart className="h-5 w-5 text-red-500" />
                            <div>
                              <p className="font-medium">Cardiac Procedures</p>
                              <p className="text-sm text-gray-600">89% policy compliance</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Optimal</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Brain className="h-5 w-5 text-purple-500" />
                            <div>
                              <p className="font-medium">Neurological</p>
                              <p className="text-sm text-gray-600">76% policy compliance</p>
                            </div>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Stethoscope className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="font-medium">General Surgery</p>
                              <p className="text-sm text-gray-600">94% policy compliance</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-teal-600" />
                      <span>Survival Rate Analytics & Outcomes</span>
                      <Badge className="bg-teal-100 text-teal-800">Premium</Badge>
                    </CardTitle>
                    <CardDescription>
                      Advanced outcomes tracking and predictive analytics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-2">94.2%</div>
                        <p className="text-sm font-medium">Overall Survival Rate</p>
                        <p className="text-xs text-gray-600">30-day post-procedure</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-2">87.8%</div>
                        <p className="text-sm font-medium">Complication-Free Rate</p>
                        <p className="text-xs text-gray-600">Major procedures</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600 mb-2">4.6</div>
                        <p className="text-sm font-medium">Avg Satisfaction Score</p>
                        <p className="text-xs text-gray-600">Out of 5.0</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Analytics</h3>
                  <p className="text-gray-600 mb-6">
                    Unlock advanced analytics including real-time cost visibility, procedure referral analysis, and survival rate tracking.
                  </p>
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </SharedLayout>
  );
}