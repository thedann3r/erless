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
import { Separator } from "@/components/ui/separator";
import { Shield, TrendingUp, AlertTriangle, DollarSign, Clock, FileText, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LogoutButton } from "@/components/ui/logout-button";

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

interface ClaimInflow {
  providerId: number;
  providerName: string;
  todayClaims: number;
  weekClaims: number;
  monthClaims: number;
  averageClaimValue: number;
  flaggedPercentage: number;
  lastClaimTime: string;
}

interface SchemeUsage {
  schemeId: number;
  schemeName: string;
  totalMembers: number;
  activeMembers: number;
  totalVisits: number;
  benefitUtilization: number;
  burnoutRate: number;
  averageCostPerMember: number;
}

export default function InsurerDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("preauth");
  const [selectedRequest, setSelectedRequest] = useState<PreauthorizationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [decision, setDecision] = useState<"approved" | "denied" | "">("");

  // Fetch pending preauthorization requests
  const { data: preauthorizationRequests = [] } = useQuery({
    queryKey: ["/api/insurer/preauthorizations/pending"],
    queryFn: async () => [
      {
        id: 1,
        patient: {
          firstName: "John",
          lastName: "Doe",
          patientId: "P001234",
          age: 45,
          gender: "Male",
          membershipNumber: "NHIF123456789",
          scheme: "NHIF Principal"
        },
        provider: {
          name: "Aga Khan University Hospital",
          type: "Hospital",
          riskScore: 2.1
        },
        serviceType: "Cardiac Catheterization",
        procedureCode: "93458",
        diagnosis: "Coronary Artery Disease",
        icd10Code: "I25.10",
        clinicalJustification: "Patient presents with chest pain and abnormal stress test. ECG shows ST depression. Requires cardiac catheterization to assess coronary anatomy and determine need for intervention.",
        estimatedCost: 450000,
        urgency: "urgent" as const,
        requestedBy: "Dr. Sarah Wilson",
        submittedAt: "2024-06-18T09:30:00Z",
        aiDecision: "review_required" as const,
        aiConfidence: 75,
        aiReasoning: [
          "High-cost procedure requires careful review",
          "Patient age and symptoms support clinical indication", 
          "Provider has good track record for this procedure",
          "Previous similar cases were medically necessary"
        ],
        status: "pending" as const
      },
      {
        id: 2,
        patient: {
          firstName: "Mary",
          lastName: "Smith",
          patientId: "P001235",
          age: 32,
          gender: "Female",
          membershipNumber: "CORP987654321",
          scheme: "Corporate Health Plan"
        },
        provider: {
          name: "Kenyatta National Hospital",
          type: "Hospital",
          riskScore: 3.2
        },
        serviceType: "MRI Brain",
        procedureCode: "70553",
        diagnosis: "Chronic Headaches",
        icd10Code: "R51",
        clinicalJustification: "Patient has persistent headaches for 3 months, not responding to medication. Neurological examination normal. MRI needed to rule out secondary causes.",
        estimatedCost: 25000,
        urgency: "routine" as const,
        requestedBy: "Dr. James Brown",
        submittedAt: "2024-06-18T08:15:00Z",
        aiDecision: "approved" as const,
        aiConfidence: 92,
        aiReasoning: [
          "Standard diagnostic protocol for chronic headaches",
          "Cost is within normal range for this procedure",
          "Clinical justification is appropriate",
          "No red flags in patient or provider history"
        ],
        status: "pending" as const
      }
    ] as PreauthorizationRequest[],
  });

  // Fetch claim inflow data
  const { data: claimInflow = [] } = useQuery({
    queryKey: ["/api/insurer/claims/inflow"],
    queryFn: async () => [
      {
        providerId: 1,
        providerName: "Aga Khan University Hospital",
        todayClaims: 45,
        weekClaims: 287,
        monthClaims: 1234,
        averageClaimValue: 18500,
        flaggedPercentage: 2.1,
        lastClaimTime: "2024-06-18T10:45:00Z"
      },
      {
        providerId: 2,
        providerName: "Kenyatta National Hospital",
        todayClaims: 67,
        weekClaims: 421,
        monthClaims: 1789,
        averageClaimValue: 15200,
        flaggedPercentage: 3.8,
        lastClaimTime: "2024-06-18T10:52:00Z"
      },
      {
        providerId: 3,
        providerName: "Carepoint Medical Centers",
        todayClaims: 123,
        weekClaims: 834,
        monthClaims: 3567,
        averageClaimValue: 4200,
        flaggedPercentage: 1.2,
        lastClaimTime: "2024-06-18T10:58:00Z"
      }
    ] as ClaimInflow[],
  });

  // Fetch scheme usage data
  const { data: schemeUsage = [] } = useQuery({
    queryKey: ["/api/insurer/schemes/usage"],
    queryFn: async () => [
      {
        schemeId: 1,
        schemeName: "NHIF Principal",
        totalMembers: 125000,
        activeMembers: 98500,
        totalVisits: 15600,
        benefitUtilization: 78.5,
        burnoutRate: 12.3,
        averageCostPerMember: 8500
      },
      {
        schemeId: 2,
        schemeName: "Corporate Health Plans",
        totalMembers: 45000,
        activeMembers: 42000,
        totalVisits: 8900,
        benefitUtilization: 65.2,
        burnoutRate: 8.7,
        averageCostPerMember: 15200
      }
    ] as SchemeUsage[],
  });

  const processPreauthorizationMutation = useMutation({
    mutationFn: async (data: {
      requestId: number;
      decision: "approved" | "denied";
      reviewNotes: string;
    }) => {
      return apiRequest("/api/insurer/preauthorizations/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Decision Recorded",
        description: "Preauthorization decision has been processed successfully",
      });
      setSelectedRequest(null);
      setReviewNotes("");
      setDecision("");
      queryClient.invalidateQueries({ queryKey: ["/api/insurer/preauthorizations/pending"] });
    },
  });

  const processDecision = () => {
    if (!selectedRequest || !decision) return;

    processPreauthorizationMutation.mutate({
      requestId: selectedRequest.id,
      decision,
      reviewNotes,
    });
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants = {
      routine: "bg-green-100 text-green-800",
      urgent: "bg-yellow-100 text-yellow-800", 
      emergency: "bg-red-100 text-red-800"
    };
    return variants[urgency as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const getAIDecisionBadge = (decision: string) => {
    const variants = {
      approved: "bg-green-100 text-green-800",
      denied: "bg-red-100 text-red-800",
      review_required: "bg-yellow-100 text-yellow-800"
    };
    return variants[decision as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 7) return "text-red-600";
    if (score >= 4) return "text-yellow-600";
    return "text-green-600";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-green-600";
    if (confidence >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Insurer Dashboard</h1>
          <p className="text-gray-600">Manage preauthorizations and monitor network activity</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-teal-600 border-teal-200">
            <Shield className="w-4 h-4 mr-1" />
            Underwriter
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preauth">Preauthorizations</TabsTrigger>
          <TabsTrigger value="claims">Claims Inflow</TabsTrigger>
          <TabsTrigger value="schemes">Scheme Management</TabsTrigger>
          <TabsTrigger value="appeals">Appeals</TabsTrigger>
        </TabsList>

        <TabsContent value="preauth" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Pending Requests ({preauthorizationRequests.length})
                </CardTitle>
                <CardDescription>
                  AI-assisted preauthorization decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {preauthorizationRequests.map((request) => (
                    <Card 
                      key={request.id} 
                      className={`cursor-pointer border-l-4 transition-colors ${
                        selectedRequest?.id === request.id 
                          ? "border-l-teal-500 bg-teal-50" 
                          : "border-l-gray-300 hover:border-l-teal-300"
                      }`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">
                            {request.patient.firstName} {request.patient.lastName}
                          </h3>
                          <Badge className={getUrgencyBadge(request.urgency)}>
                            {request.urgency}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Service: {request.serviceType}</div>
                          <div>Provider: {request.provider.name}</div>
                          <div>Cost: KES {request.estimatedCost.toLocaleString()}</div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <Badge className={getAIDecisionBadge(request.aiDecision)}>
                            AI: {request.aiDecision.replace('_', ' ')}
                          </Badge>
                          <span className={`text-sm font-medium ${getConfidenceColor(request.aiConfidence)}`}>
                            {request.aiConfidence}% confidence
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Decision Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  {selectedRequest ? "Review Request" : "Select Request"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRequest ? (
                  <div className="space-y-6">
                    {/* Patient Info */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Patient Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span>
                          <div>{selectedRequest.patient.firstName} {selectedRequest.patient.lastName}</div>
                        </div>
                        <div>
                          <span className="font-medium">Member ID:</span>
                          <div>{selectedRequest.patient.membershipNumber}</div>
                        </div>
                        <div>
                          <span className="font-medium">Age/Gender:</span>
                          <div>{selectedRequest.patient.age} years, {selectedRequest.patient.gender}</div>
                        </div>
                        <div>
                          <span className="font-medium">Scheme:</span>
                          <div>{selectedRequest.patient.scheme}</div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Clinical Information */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Clinical Information</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-sm">Diagnosis:</span>
                          <div className="text-sm">{selectedRequest.diagnosis} ({selectedRequest.icd10Code})</div>
                        </div>
                        <div>
                          <span className="font-medium text-sm">Requested Service:</span>
                          <div className="text-sm">{selectedRequest.serviceType} (Code: {selectedRequest.procedureCode})</div>
                        </div>
                        <div>
                          <span className="font-medium text-sm">Clinical Justification:</span>
                          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            {selectedRequest.clinicalJustification}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-sm">Estimated Cost:</span>
                          <div className="text-lg font-semibold text-teal-600">
                            KES {selectedRequest.estimatedCost.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* AI Analysis */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">AI Analysis</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className={getAIDecisionBadge(selectedRequest.aiDecision)}>
                            {selectedRequest.aiDecision.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className={`font-medium ${getConfidenceColor(selectedRequest.aiConfidence)}`}>
                            {selectedRequest.aiConfidence}% Confidence
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-sm">AI Reasoning:</span>
                          <ul className="mt-2 space-y-1">
                            {selectedRequest.aiReasoning.map((reason, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start">
                                <span className="text-teal-500 mr-2">•</span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Decision Section */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Your Decision</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="decision">Decision</Label>
                          <Select value={decision} onValueChange={setDecision}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select decision" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="approved">Approve</SelectItem>
                              <SelectItem value="denied">Deny</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="reviewNotes">Review Notes</Label>
                          <Textarea
                            id="reviewNotes"
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Enter your review notes and justification"
                            rows={4}
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedRequest(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={processDecision}
                            disabled={!decision || processPreauthorizationMutation.isPending}
                            className="bg-teal-600 hover:bg-teal-700"
                          >
                            {processPreauthorizationMutation.isPending ? "Processing..." : "Submit Decision"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a preauthorization request to review</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Real-time Claims Inflow
              </CardTitle>
              <CardDescription>
                Monitor claim submission patterns across providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {claimInflow.map((provider) => (
                  <Card key={provider.providerId} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{provider.providerName}</h3>
                          <p className="text-sm text-gray-600">
                            Last claim: {new Date(provider.lastClaimTime).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {provider.todayClaims}
                          </div>
                          <p className="text-sm text-gray-600">Today</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{provider.weekClaims}</div>
                          <p className="text-xs text-gray-600">This Week</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{provider.monthClaims}</div>
                          <p className="text-xs text-gray-600">This Month</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            KES {provider.averageClaimValue.toLocaleString()}
                          </div>
                          <p className="text-xs text-gray-600">Avg. Value</p>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${
                            provider.flaggedPercentage > 5 ? "text-red-600" : 
                            provider.flaggedPercentage > 2 ? "text-yellow-600" : "text-green-600"
                          }`}>
                            {provider.flaggedPercentage}%
                          </div>
                          <p className="text-xs text-gray-600">Flagged</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schemes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Scheme Usage & Configuration
              </CardTitle>
              <CardDescription>
                Monitor benefit utilization and configure co-pay policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {schemeUsage.map((scheme) => (
                  <Card key={scheme.schemeId} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{scheme.schemeName}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-teal-600">
                          {scheme.benefitUtilization}%
                        </div>
                        <p className="text-sm text-gray-600">Utilization</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{scheme.totalMembers.toLocaleString()}</div>
                        <p className="text-xs text-gray-600">Total Members</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{scheme.activeMembers.toLocaleString()}</div>
                        <p className="text-xs text-gray-600">Active Members</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{scheme.totalVisits.toLocaleString()}</div>
                        <p className="text-xs text-gray-600">Total Visits</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${
                          scheme.burnoutRate > 15 ? "text-red-600" : 
                          scheme.burnoutRate > 10 ? "text-yellow-600" : "text-green-600"
                        }`}>
                          {scheme.burnoutRate}%
                        </div>
                        <p className="text-xs text-gray-600">Burnout Rate</p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-600">Average Cost per Member:</span>
                        <div className="font-semibold">KES {scheme.averageCostPerMember.toLocaleString()}</div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure Benefits
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appeals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Claims Appeals Management
              </CardTitle>
              <CardDescription>
                Review and process member appeals for denied claims
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending appeals</p>
                <p className="text-sm text-gray-500">Member appeals will appear here for review</p>
              </div>
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