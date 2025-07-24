import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

import { 
  Activity, TrendingUp, AlertTriangle, Heart, Users, 
  Clock, Shield, CheckCircle, XCircle, Search, Eye,
  Stethoscope, FileText, Calendar, Settings, BarChart3,
  Target, Brain, DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CareProgram {
  id: number;
  name: string;
  type: "chronic_care" | "preventive" | "emergency" | "wellness";
  participantCount: number;
  activeMembers: number;
  costPerMember: number;
  outcomeScore: number;
  riskReduction: number;
  status: "active" | "completed" | "planned";
}

interface PatientCareData {
  id: number;
  memberNumber: string;
  name: string;
  age: number;
  condition: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  lastVisit: string;
  nextAppointment?: string;
  careProgram: string;
  complianceScore: number;
  totalCost: number;
  predictedRisk: number;
}

// Sidebar navigation items
const sidebarItems = [
  { path: "/insurer-care-manager", icon: <BarChart3 className="h-5 w-5" />, label: "Claims Overview" },
  { path: "/insurer-care-manager/fraud", icon: <Shield className="h-5 w-5" />, label: "Fraud Alerts", badge: "12" },
  { path: "/insurer-care-manager/costs", icon: <TrendingUp className="h-5 w-5" />, label: "Cost Trends" },
  { path: "/insurer-care-manager/referrals", icon: <Users className="h-5 w-5" />, label: "Referral Patterns" },
  { path: "/insurer-care-manager/benchmarks", icon: <Target className="h-5 w-5" />, label: "Provider Benchmarks", badge: "Premium" },
  { path: "/insurer-care-manager/analytics", icon: <Brain className="h-5 w-5" />, label: "Advanced Analytics", badge: "Premium" }
];

export default function InsurerCareManagerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProgram, setSelectedProgram] = useState<CareProgram | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  // Mock data for care programs
  const mockPrograms: CareProgram[] = [
    {
      id: 1,
      name: "Diabetes Management Program",
      type: "chronic_care",
      participantCount: 1245,
      activeMembers: 1189,
      costPerMember: 24500,
      outcomeScore: 87,
      riskReduction: 23,
      status: "active"
    },
    {
      id: 2,
      name: "Cardiovascular Prevention",
      type: "preventive",
      participantCount: 892,
      activeMembers: 856,
      costPerMember: 18700,
      outcomeScore: 92,
      riskReduction: 31,
      status: "active"
    },
    {
      id: 3,
      name: "Mental Health Support",
      type: "wellness",
      participantCount: 534,
      activeMembers: 498,
      costPerMember: 15200,
      outcomeScore: 79,
      riskReduction: 18,
      status: "active"
    }
  ];

  // Mock data for high-risk patients
  const mockPatients: PatientCareData[] = [
    {
      id: 1,
      memberNumber: `${user?.insurerCompany || "CIC"}-123456789`,
      name: "John Mwangi",
      age: 54,
      condition: "Type 2 Diabetes + Hypertension",
      riskLevel: "high",
      lastVisit: "2024-01-10",
      nextAppointment: "2024-01-25",
      careProgram: "Diabetes Management",
      complianceScore: 76,
      totalCost: 145000,
      predictedRisk: 78
    },
    {
      id: 2,
      memberNumber: `${user?.insurerCompany || "CIC"}-987654321`,
      name: "Mary Wanjiku",
      age: 67,
      condition: "Chronic Heart Failure",
      riskLevel: "critical",
      lastVisit: "2024-01-12",
      nextAppointment: "2024-01-20",
      careProgram: "Cardio Prevention",
      complianceScore: 45,
      totalCost: 324000,
      predictedRisk: 91
    }
  ];

  const handleInterventionCreate = async (patientId: number) => {
    toast({
      title: "Care Intervention Initiated",
      description: "Healthcare provider has been notified for immediate follow-up.",
    });
  };

  const handleProviderBenchmark = () => {
    toast({
      title: "Provider Benchmark Analysis",
      description: "Opening provider performance comparison across all care facilities.",
    });
  };

  const handleAdvancedAnalytics = () => {
    toast({
      title: "Advanced Analytics",
      description: "Loading comprehensive cost trends and outcome analytics dashboard.",
    });
  };

  const handleCostTrends = () => {
    toast({
      title: "Cost Trends Analysis",
      description: "Displaying 30-day rolling cost averages and benefit category burn rates.",
    });
  };

  const handleNotifications = () => {
    toast({
      title: "Notification Center",
      description: "Opening alert management and notification preferences.",
    });
  };

  const handleOverride = (claimId?: number) => {
    toast({
      title: "Override Action",
      description: claimId ? `Processing override for claim #${claimId}` : "Override functionality activated.",
    });
  };

  const handleReferralPatterns = () => {
    toast({
      title: "Referral Pattern Analysis",
      description: "Analyzing procedure referral patterns and policy compliance.",
    });
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "low":
        return <Badge className="bg-green-500">Low Risk</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500">Medium Risk</Badge>;
      case "high":
        return <Badge className="bg-orange-500">High Risk</Badge>;
      case "critical":
        return <Badge className="bg-red-500">Critical</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  const getProgramTypeBadge = (type: string) => {
    switch (type) {
      case "chronic_care":
        return <Badge variant="outline" className="text-blue-600">Chronic Care</Badge>;
      case "preventive":
        return <Badge variant="outline" className="text-green-600">Preventive</Badge>;
      case "emergency":
        return <Badge variant="outline" className="text-red-600">Emergency</Badge>;
      case "wellness":
        return <Badge variant="outline" className="text-purple-600">Wellness</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with logo and user info - standalone */}
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Erlessed Care Manager
            </h1>
          </div>
        </div>
      </header>
      
      <div className="flex">
        {/* Fixed Sidebar */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r bg-white shadow-lg">
          <div className="flex h-full flex-col">
            <div className="p-4 border-b bg-gradient-to-r from-teal-600 to-blue-600">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
                Navigation
              </h2>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {sidebarItems.map((item) => (
                <div
                  key={item.path}
                  className="flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-md"
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge variant="outline" className="ml-auto text-xs border-white text-white">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              ))}
            </nav>
            <div className="border-t p-4 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Powered by Erlessed
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1">
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Care Manager Dashboard</h1>
                  <p className="text-gray-600 mt-1">Monitor patient care programs and health outcomes for {user?.insurerCompany || "your organization"}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleNotifications}>
                    <FileText className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                  <Button variant="outline" onClick={handleAdvancedAnalytics}>
                    <Activity className="h-4 w-4 mr-2" />
                    Advanced Analytics
                  </Button>
                  <Button onClick={handleProviderBenchmark}>
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Provider Benchmark
                  </Button>
                </div>
              </div>

              {/* Key Health Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,543</div>
              <p className="text-xs text-muted-foreground">+7% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Care Cost per Member</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES 19,800</div>
              <p className="text-xs text-muted-foreground">-12% cost reduction</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Outcome Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">86.2%</div>
              <p className="text-xs text-muted-foreground">+3.4% improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High-Risk Patients</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">-18 from intervention</p>
            </CardContent>
          </Card>
              </div>

              {/* Main Content Tabs */}
              <Tabs defaultValue="programs" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="programs">Care Programs</TabsTrigger>
            <TabsTrigger value="patients">High-Risk Patients</TabsTrigger>
            <TabsTrigger value="outcomes">Health Outcomes</TabsTrigger>
            <TabsTrigger value="cost-trends" className="hidden lg:block">Cost Trends</TabsTrigger>
            <TabsTrigger value="referral-patterns" className="hidden lg:block">Referral Patterns</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Care Programs</CardTitle>
                <CardDescription>Monitor performance and outcomes of care management programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPrograms.map((program) => (
                    <div key={program.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{program.name}</h3>
                            {getProgramTypeBadge(program.type)}
                            <Badge className="bg-green-500">Active</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Participants</p>
                              <p className="font-semibold">{program.participantCount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Active Members</p>
                              <p className="font-semibold">{program.activeMembers.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Cost per Member</p>
                              <p className="font-semibold">KES {program.costPerMember.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Outcome Score</p>
                              <p className="font-semibold">{program.outcomeScore}%</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Risk Reduction Achievement</span>
                              <span>{program.riskReduction}%</span>
                            </div>
                            <Progress value={program.riskReduction} className="w-full" />
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>High-Risk Patient Management</CardTitle>
                <CardDescription>Monitor and manage patients requiring immediate attention</CardDescription>
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by risk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPatients.map((patient) => (
                    <div key={patient.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{patient.name}</h3>
                            {getRiskBadge(patient.riskLevel)}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Member ID</p>
                              <p className="font-mono text-xs">{patient.memberNumber}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Age / Condition</p>
                              <p className="font-semibold">{patient.age} years</p>
                              <p className="text-xs text-gray-600">{patient.condition}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Care Program</p>
                              <p className="font-semibold">{patient.careProgram}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Total Care Cost</p>
                              <p className="font-semibold">KES {patient.totalCost.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Compliance Score</span>
                                <span>{patient.complianceScore}%</span>
                              </div>
                              <Progress 
                                value={patient.complianceScore} 
                                className={`w-full ${patient.complianceScore < 60 ? 'bg-red-100' : 'bg-green-100'}`} 
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Predicted Risk</span>
                                <span>{patient.predictedRisk}%</span>
                              </div>
                              <Progress 
                                value={patient.predictedRisk} 
                                className={`w-full ${patient.predictedRisk > 80 ? 'bg-red-100' : 'bg-orange-100'}`} 
                              />
                            </div>
                          </div>

                          <div className="text-sm text-gray-600">
                            <p><strong>Last Visit:</strong> {new Date(patient.lastVisit).toLocaleDateString()}</p>
                            {patient.nextAppointment && (
                              <p><strong>Next Appointment:</strong> {new Date(patient.nextAppointment).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleInterventionCreate(patient.id)}
                          >
                            <Activity className="h-4 w-4 mr-1" />
                            Intervene
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleOverride(patient.id)}>
                            <Shield className="h-4 w-4 mr-1" />
                            Override
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outcomes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Program Effectiveness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Diabetes Management (87%)</span>
                        <span>1,189 members</span>
                      </div>
                      <Progress value={87} className="w-full" />
                      
                      <div className="flex justify-between">
                        <span>Cardiovascular Prevention (92%)</span>
                        <span>856 members</span>
                      </div>
                      <Progress value={92} className="w-full" />
                      
                      <div className="flex justify-between">
                        <span>Mental Health Support (79%)</span>
                        <span>498 members</span>
                      </div>
                      <Progress value={79} className="w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost vs. Outcome Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-8 text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                      <p>Advanced analytics visualization</p>
                      <p className="text-sm">Cost-effectiveness charts and trend analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cost-trends" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>Cost Trends Analysis</span>
                  </CardTitle>
                  <CardDescription>30-day rolling averages and benefit category burn rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Cost per Category</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Inpatient Care</span>
                        <span className="font-semibold">KES 8.4M</span>
                      </div>
                      <Progress value={75} className="w-full" />
                      
                      <div className="flex justify-between items-center">
                        <span>Outpatient Services</span>
                        <span className="font-semibold">KES 3.2M</span>
                      </div>
                      <Progress value={45} className="w-full" />
                      
                      <div className="flex justify-between items-center">
                        <span>Pharmaceuticals</span>
                        <span className="font-semibold">KES 2.8M</span>
                      </div>
                      <Progress value={38} className="w-full" />
                      
                      <div className="flex justify-between items-center">
                        <span>Laboratory Tests</span>
                        <span className="font-semibold">KES 1.9M</span>
                      </div>
                      <Progress value={28} className="w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Trend Analysis & Projections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-gray-600">Monthly Growth</p>
                        <p className="text-2xl font-bold text-green-600">+8.2%</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-gray-600">Cost Efficiency</p>
                        <p className="text-2xl font-bold text-blue-600">91.3%</p>
                      </div>
                    </div>
                    
                    <div className="text-center p-8 text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                      <p>Interactive Cost Visualization</p>
                      <p className="text-sm">30-day rolling trends and forecasts</p>
                      <Button className="mt-4" onClick={handleCostTrends}>
                        Load Detailed Analysis
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referral-patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Referral Pattern Analysis</CardTitle>
                <CardDescription>Procedure referral patterns and policy compliance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <h4 className="font-semibold">Total Referrals</h4>
                      <p className="text-2xl font-bold text-blue-600">1,247</p>
                      <p className="text-sm text-gray-600">+12% this month</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <h4 className="font-semibold">Policy Compliance</h4>
                      <p className="text-2xl font-bold text-green-600">87.3%</p>
                      <p className="text-sm text-gray-600">Above target</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <h4 className="font-semibold">Success Rate</h4>
                      <p className="text-2xl font-bold text-purple-600">92.1%</p>
                      <p className="text-sm text-gray-600">+3.2% improvement</p>
                    </div>
                  </div>
                  
                  <div className="text-center p-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>Referral Pattern Visualization</p>
                    <p className="text-sm">Network flow and success tracking</p>
                    <Button className="mt-4" onClick={handleReferralPatterns}>
                      View Detailed Patterns
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Care Management Settings</CardTitle>
                <CardDescription>Configure risk thresholds and intervention protocols</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="riskThreshold">High-risk threshold (%)</Label>
                    <Input id="riskThreshold" type="number" placeholder="75" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interventionDelay">Intervention delay (days)</Label>
                    <Input id="interventionDelay" type="number" placeholder="3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outcomeTarget">Target outcome score (%)</Label>
                  <Input id="outcomeTarget" type="number" placeholder="85" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alertFrequency">Alert frequency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select alert frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}