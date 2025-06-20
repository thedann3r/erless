import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SharedLayout } from "@/components/layout/shared-layout";
import { 
  Shield, TrendingUp, AlertTriangle, DollarSign, Clock, FileText, 
  Settings, CheckCircle, XCircle, Search, Zap, Brain, BarChart3,
  Users, Activity, Target, AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PreauthorizationRequest {
  id: number;
  patient: {
    firstName: string;
    lastName: string;
    patientId: string;
    age: number;
    gender: string;
    membershipNumber: string;
    scheme: string;
  };
  provider: {
    name: string;
    type: string;
    riskScore: number;
  };
  serviceType: string;
  procedureCode: string;
  diagnosis: string;
  icd10Code: string;
  clinicalJustification: string;
  estimatedCost: number;
  urgency: "routine" | "urgent" | "emergency";
  requestedBy: string;
  submittedAt: string;
  aiDecision: "approved" | "denied" | "review_required";
  aiConfidence: number;
  aiReasoning: string[];
  status: "pending" | "approved" | "denied" | "review_required";
}

interface SchemeUsage {
  schemeId: string;
  schemeName: string;
  totalLimit: number;
  usedAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  memberCount: number;
  burnoutRisk: "low" | "medium" | "high";
  projectedBurnout?: string;
}

export default function ModernInsurerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<PreauthorizationRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [overrideReason, setOverrideReason] = useState("");

  // Mock data
  const preauthorizationRequests: PreauthorizationRequest[] = [
    {
      id: 1,
      patient: {
        firstName: "Sarah",
        lastName: "Johnson",
        patientId: "PT-2024-001",
        age: 38,
        gender: "Female",
        membershipNumber: "NHIF-001234567",
        scheme: "Essential Package"
      },
      provider: {
        name: "Aga Khan Hospital",
        type: "Tertiary Hospital",
        riskScore: 15
      },
      serviceType: "Cardiac Catheterization",
      procedureCode: "93458",
      diagnosis: "Coronary Artery Disease",
      icd10Code: "I25.10",
      clinicalJustification: "Patient presents with chest pain and abnormal stress test. Catheterization needed to assess coronary anatomy for treatment planning.",
      estimatedCost: 450000,
      urgency: "urgent",
      requestedBy: "Dr. James Mwangi",
      submittedAt: "2024-06-20T08:30:00Z",
      aiDecision: "approved",
      aiConfidence: 87,
      aiReasoning: [
        "Clinical indicators support necessity of procedure",
        "Provider has excellent track record",
        "Cost within expected range for this procedure",
        "Patient age and condition warrant intervention"
      ],
      status: "pending"
    },
    {
      id: 2,
      patient: {
        firstName: "Michael",
        lastName: "Ochieng",
        patientId: "PT-2024-002",
        age: 47,
        gender: "Male",
        membershipNumber: "CORP-987654321",
        scheme: "Corporate Plus"
      },
      provider: {
        name: "Nairobi Hospital",
        type: "Private Hospital",
        riskScore: 8
      },
      serviceType: "MRI Brain with Contrast",
      procedureCode: "70553",
      diagnosis: "Chronic Headaches",
      icd10Code: "G44.209",
      clinicalJustification: "Patient has persistent headaches not responding to treatment. MRI needed to rule out structural abnormalities.",
      estimatedCost: 85000,
      urgency: "routine",
      requestedBy: "Dr. Grace Wanjiku",
      submittedAt: "2024-06-20T09:15:00Z",
      aiDecision: "review_required",
      aiConfidence: 65,
      aiReasoning: [
        "Moderate clinical necessity indicated",
        "Alternative imaging options available",
        "Provider cost variance noted",
        "Requires human review for final decision"
      ],
      status: "pending"
    },
    {
      id: 3,
      patient: {
        firstName: "Grace",
        lastName: "Wanjiku",
        patientId: "PT-2024-003",
        age: 29,
        gender: "Female",
        membershipNumber: "NHIF-567890123",
        scheme: "Essential Package"
      },
      provider: {
        name: "Kenyatta National Hospital",
        type: "Public Hospital",
        riskScore: 28
      },
      serviceType: "Cosmetic Surgery",
      procedureCode: "15824",
      diagnosis: "Aesthetic Enhancement",
      icd10Code: "Z41.1",
      clinicalJustification: "Patient requests aesthetic improvement procedure.",
      estimatedCost: 200000,
      urgency: "routine",
      requestedBy: "Dr. Peter Kimani",
      submittedAt: "2024-06-20T10:00:00Z",
      aiDecision: "denied",
      aiConfidence: 95,
      aiReasoning: [
        "Procedure not medically necessary",
        "Cosmetic procedures excluded from scheme coverage",
        "No clinical indication for intervention",
        "Patient can seek private payment option"
      ],
      status: "pending"
    }
  ];

  const schemeUsage: SchemeUsage[] = [
    {
      schemeId: "NHIF-ESS",
      schemeName: "NHIF Essential Package",
      totalLimit: 50000000,
      usedAmount: 42000000,
      remainingAmount: 8000000,
      utilizationPercentage: 84,
      memberCount: 1250,
      burnoutRisk: "high",
      projectedBurnout: "2024-08-15"
    },
    {
      schemeId: "CORP-PLUS",
      schemeName: "Corporate Plus",
      totalLimit: 25000000,
      usedAmount: 15600000,
      remainingAmount: 9400000,
      utilizationPercentage: 62,
      memberCount: 450,
      burnoutRisk: "medium"
    },
    {
      schemeId: "PRIV-GOLD",
      schemeName: "Private Gold",
      totalLimit: 15000000,
      usedAmount: 4200000,
      remainingAmount: 10800000,
      utilizationPercentage: 28,
      memberCount: 180,
      burnoutRisk: "low"
    }
  ];

  const sidebarItems = [
    { path: "/insurer", icon: <Shield className="h-5 w-5" />, label: "Preauthorization", badge: "3" },
    { path: "/insurer/claims", icon: <FileText className="h-5 w-5" />, label: "Claims Processing" },
    { path: "/insurer/schemes", icon: <Target className="h-5 w-5" />, label: "Scheme Management" },
    { path: "/insurer/appeals", icon: <AlertTriangle className="h-5 w-5" />, label: "Appeals" },
    { path: "/insurer/analytics", icon: <BarChart3 className="h-5 w-5" />, label: "Analytics" },
    { path: "/insurer/settings", icon: <Settings className="h-5 w-5" />, label: "Configuration" },
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency": return "bg-red-100 text-red-800 border-red-200";
      case "urgent": return "bg-orange-100 text-orange-800 border-orange-200";
      case "routine": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "denied": return "bg-red-100 text-red-800 border-red-200";
      case "review_required": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getBurnoutRiskColor = (risk: string) => {
    switch (risk) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-orange-600 bg-orange-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const processDecision = async (requestId: number, decision: "approved" | "denied", reason?: string) => {
    toast({
      title: "Decision Processed",
      description: `Preauthorization request ${decision} successfully`,
    });
    
    setSelectedRequest(null);
    setOverrideReason("");
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "approved": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "denied": return <XCircle className="h-4 w-4 text-red-600" />;
      case "review_required": return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <SharedLayout sidebarItems={sidebarItems} title="Insurer Dashboard">
      <div className="space-y-6">
        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">87%</p>
                  <p className="text-sm text-muted-foreground">Auto-approval Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">Appeals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">KES 3.2M</p>
                  <p className="text-sm text-muted-foreground">Today's Approvals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Request Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Preauthorization Queue</h2>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-40"
                  />
                </div>
                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="routine">Routine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {preauthorizationRequests.map((request) => (
                <Card 
                  key={request.id} 
                  className={`card-hover cursor-pointer transition-all ${
                    selectedRequest?.id === request.id ? 'ring-2 ring-primary' : ''
                  } ${request.urgency === 'emergency' ? 'border-l-4 border-l-red-500' : 
                     request.urgency === 'urgent' ? 'border-l-4 border-l-orange-500' : ''}`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">
                            {request.patient.firstName} {request.patient.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {request.patient.membershipNumber}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Badge className={getUrgencyColor(request.urgency)}>
                            {request.urgency.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="font-medium text-primary">{request.serviceType}</p>
                        <p className="text-sm">{request.diagnosis}</p>
                        <p className="text-sm text-muted-foreground">
                          Provider: {request.provider.name}
                        </p>
                        <p className="text-sm font-medium">
                          Est. Cost: KES {request.estimatedCost.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getDecisionIcon(request.aiDecision)}
                          <Badge className={getDecisionColor(request.aiDecision)}>
                            {request.aiDecision.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Confidence</p>
                          <p className={`text-sm font-medium ${getConfidenceColor(request.aiConfidence)}`}>
                            {request.aiConfidence}%
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Submitted: {new Date(request.submittedAt).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Center Panel - Decision Interface */}
          <div className="lg:col-span-2 space-y-4">
            {selectedRequest ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <span>Decision Support Analysis</span>
                    </CardTitle>
                    <CardDescription>
                      Request for {selectedRequest.serviceType} - {selectedRequest.patient.firstName} {selectedRequest.patient.lastName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Patient & Provider Info */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium">Patient Information</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Age:</span> {selectedRequest.patient.age}</p>
                          <p><span className="font-medium">Gender:</span> {selectedRequest.patient.gender}</p>
                          <p><span className="font-medium">Scheme:</span> {selectedRequest.patient.scheme}</p>
                          <p><span className="font-medium">Member ID:</span> {selectedRequest.patient.membershipNumber}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium">Provider Information</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Facility:</span> {selectedRequest.provider.name}</p>
                          <p><span className="font-medium">Type:</span> {selectedRequest.provider.type}</p>
                          <p><span className="font-medium">Risk Score:</span> 
                            <Badge className={getBurnoutRiskColor(selectedRequest.provider.riskScore > 50 ? 'high' : selectedRequest.provider.riskScore > 25 ? 'medium' : 'low')}>
                              {selectedRequest.provider.riskScore}%
                            </Badge>
                          </p>
                          <p><span className="font-medium">Requested by:</span> {selectedRequest.requestedBy}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Clinical Information */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Clinical Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><span className="font-medium">Procedure:</span> {selectedRequest.serviceType}</p>
                          <p><span className="font-medium">Code:</span> {selectedRequest.procedureCode}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Diagnosis:</span> {selectedRequest.diagnosis}</p>
                          <p><span className="font-medium">ICD-10:</span> {selectedRequest.icd10Code}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Clinical Justification:</p>
                        <div className="p-3 bg-muted rounded-xl text-sm">
                          {selectedRequest.clinicalJustification}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Decision Analysis */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-purple-500" />
                        <h4 className="font-medium">Reasoning Chain</h4>
                        <Badge className={getDecisionColor(selectedRequest.aiDecision)}>
                          {selectedRequest.aiDecision.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className={`text-sm font-medium ${getConfidenceColor(selectedRequest.aiConfidence)}`}>
                          {selectedRequest.aiConfidence}% Confidence
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {selectedRequest.aiReasoning.map((reason, index) => (
                          <div key={index} className="flex items-start space-x-2 text-sm">
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium mt-0.5">
                              {index + 1}
                            </div>
                            <p className="flex-1">{reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Cost Analysis */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Cost Analysis</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Estimated Cost</p>
                          <p className="font-medium text-lg">KES {selectedRequest.estimatedCost.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Scheme Coverage</p>
                          <p className="font-medium text-lg text-green-600">80%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Patient Copay</p>
                          <p className="font-medium text-lg">KES {(selectedRequest.estimatedCost * 0.2).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Override Capability */}
                    {selectedRequest.aiDecision !== "approved" && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Override Decision</h4>
                        <Textarea
                          placeholder="Provide justification for overriding the automated decision..."
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                          rows={3}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => processDecision(selectedRequest.id, "approved", overrideReason)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => processDecision(selectedRequest.id, "denied", overrideReason)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Deny
                      </Button>
                      <Button variant="outline">
                        <Clock className="h-4 w-4 mr-2" />
                        Request More Info
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Select a Request</h3>
                  <p className="text-muted-foreground">
                    Choose a preauthorization request to review and process
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Scheme Usage Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Scheme Usage Monitoring</span>
            </CardTitle>
            <CardDescription>
              Real-time tracking of scheme utilization and burnout alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {schemeUsage.map((scheme) => (
                <div key={scheme.schemeId} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{scheme.schemeName}</h4>
                    <Badge className={getBurnoutRiskColor(scheme.burnoutRisk)}>
                      {scheme.burnoutRisk.toUpperCase()} RISK
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Utilization</span>
                      <span className={getConfidenceColor(100 - scheme.utilizationPercentage)}>
                        {scheme.utilizationPercentage}%
                      </span>
                    </div>
                    <Progress value={scheme.utilizationPercentage} className="h-2" />
                  </div>

                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Used:</span>
                      <span>KES {(scheme.usedAmount / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining:</span>
                      <span>KES {(scheme.remainingAmount / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Members:</span>
                      <span>{scheme.memberCount.toLocaleString()}</span>
                    </div>
                    {scheme.projectedBurnout && (
                      <div className="flex justify-between text-red-600 font-medium">
                        <span>Projected Burnout:</span>
                        <span>{new Date(scheme.projectedBurnout).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {scheme.burnoutRisk === "high" && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center space-x-2 text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Burnout Alert</span>
                      </div>
                      <p className="text-xs text-red-600 mt-1">
                        Consider implementing usage controls or member communication
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SharedLayout>
  );
}