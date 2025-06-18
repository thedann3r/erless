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
import { User, FileText, Users, DollarSign, AlertCircle, Clock, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PatientClaim {
  id: number;
  serviceType: string;
  provider: string;
  diagnosis: string;
  claimAmount: number;
  copayAmount: number;
  status: "approved" | "denied" | "pending" | "void";
  serviceDate: string;
  processedDate?: string;
  denialReason?: string;
  canAppeal: boolean;
}

interface Dependent {
  id: number;
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string;
  gender: string;
  isActive: boolean;
}

interface PreauthorizedService {
  id: number;
  serviceType: string;
  provider: string;
  estimatedCost: number;
  approvedAmount: number;
  status: "approved" | "partially_approved" | "pending";
  expiryDate: string;
  conditions?: string;
}

interface BenefitSummary {
  category: string;
  totalBenefit: number;
  usedAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  resetDate: string;
}

export default function PatientDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("claims");
  const [selectedClaim, setSelectedClaim] = useState<PatientClaim | null>(null);
  const [appealReason, setAppealReason] = useState("");
  const [newDependent, setNewDependent] = useState({
    firstName: "",
    lastName: "",
    relationship: "",
    dateOfBirth: "",
    gender: ""
  });
  const [showAddDependent, setShowAddDependent] = useState(false);

  // Mock patient info
  const patientInfo = {
    firstName: "John",
    lastName: "Doe",
    patientId: "P001234",
    membershipNumber: "NHIF123456789",
    scheme: "NHIF Principal",
    dateOfBirth: "1985-06-15",
    gender: "Male",
    phoneNumber: "+254712345678",
    email: "john.doe@email.com"
  };

  // Fetch patient claims
  const { data: claims = [] } = useQuery({
    queryKey: ["/api/patient/claims"],
    queryFn: async () => [
      {
        id: 1,
        serviceType: "General Consultation",
        provider: "Aga Khan University Hospital",
        diagnosis: "Hypertension",
        claimAmount: 5000,
        copayAmount: 500,
        status: "approved" as const,
        serviceDate: "2024-06-15",
        processedDate: "2024-06-16",
        canAppeal: false
      },
      {
        id: 2,
        serviceType: "Laboratory Tests",
        provider: "Kenyatta National Hospital",
        diagnosis: "Routine Check-up",
        claimAmount: 3500,
        copayAmount: 350,
        status: "approved" as const,
        serviceDate: "2024-06-10",
        processedDate: "2024-06-11",
        canAppeal: false
      },
      {
        id: 3,
        serviceType: "MRI Scan",
        provider: "Carepoint Medical Center",
        diagnosis: "Back Pain",
        claimAmount: 25000,
        copayAmount: 2500,
        status: "denied" as const,
        serviceDate: "2024-06-08",
        processedDate: "2024-06-09",
        denialReason: "Requires additional clinical justification",
        canAppeal: true
      },
      {
        id: 4,
        serviceType: "Cardiology Consultation",
        provider: "Aga Khan University Hospital",
        diagnosis: "Chest Pain",
        claimAmount: 15000,
        copayAmount: 1500,
        status: "pending" as const,
        serviceDate: "2024-06-18",
        canAppeal: false
      }
    ] as PatientClaim[],
  });

  // Fetch dependents
  const { data: dependents = [] } = useQuery({
    queryKey: ["/api/patient/dependents"],
    queryFn: async () => [
      {
        id: 1,
        firstName: "Jane",
        lastName: "Doe",
        relationship: "Spouse",
        dateOfBirth: "1990-03-22",
        gender: "Female",
        isActive: true
      },
      {
        id: 2,
        firstName: "Michael",
        lastName: "Doe",
        relationship: "Child",
        dateOfBirth: "2015-08-10",
        gender: "Male",
        isActive: true
      }
    ] as Dependent[],
  });

  // Fetch preauthorized services
  const { data: preauthorizedServices = [] } = useQuery({
    queryKey: ["/api/patient/preauthorizations"],
    queryFn: async () => [
      {
        id: 1,
        serviceType: "Physical Therapy",
        provider: "Rehab Center",
        estimatedCost: 20000,
        approvedAmount: 15000,
        status: "approved" as const,
        expiryDate: "2024-07-15",
        conditions: "Maximum 10 sessions"
      },
      {
        id: 2,
        serviceType: "Specialist Consultation",
        provider: "Cardiology Clinic",
        estimatedCost: 12000,
        approvedAmount: 12000,
        status: "approved" as const,
        expiryDate: "2024-06-30"
      }
    ] as PreauthorizedService[],
  });

  // Fetch benefit summary
  const { data: benefitSummary = [] } = useQuery({
    queryKey: ["/api/patient/benefits"],
    queryFn: async () => [
      {
        category: "Outpatient Services",
        totalBenefit: 50000,
        usedAmount: 23500,
        remainingAmount: 26500,
        utilizationPercentage: 47,
        resetDate: "2024-12-31"
      },
      {
        category: "Chronic Medications",
        totalBenefit: 30000,
        usedAmount: 8000,
        remainingAmount: 22000,
        utilizationPercentage: 27,
        resetDate: "2024-12-31"
      },
      {
        category: "Emergency Care",
        totalBenefit: 100000,
        usedAmount: 0,
        remainingAmount: 100000,
        utilizationPercentage: 0,
        resetDate: "2024-12-31"
      }
    ] as BenefitSummary[],
  });

  const submitAppealMutation = useMutation({
    mutationFn: async (data: { claimId: number; reason: string }) => {
      return apiRequest("/api/patient/appeals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Appeal Submitted",
        description: "Your claim appeal has been submitted for review",
      });
      setSelectedClaim(null);
      setAppealReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/patient/claims"] });
    },
  });

  const addDependentMutation = useMutation({
    mutationFn: async (dependent: typeof newDependent) => {
      return apiRequest("/api/patient/dependents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dependent),
      });
    },
    onSuccess: () => {
      toast({
        title: "Dependent Added",
        description: "New dependent has been added to your coverage",
      });
      setNewDependent({
        firstName: "",
        lastName: "",
        relationship: "",
        dateOfBirth: "",
        gender: ""
      });
      setShowAddDependent(false);
      queryClient.invalidateQueries({ queryKey: ["/api/patient/dependents"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: "bg-green-100 text-green-800",
      denied: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      void: "bg-gray-100 text-gray-800"
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return "bg-red-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const submitAppeal = () => {
    if (!selectedClaim || !appealReason.trim()) return;

    submitAppealMutation.mutate({
      claimId: selectedClaim.id,
      reason: appealReason,
    });
  };

  const addDependent = () => {
    if (!newDependent.firstName || !newDependent.lastName || !newDependent.relationship) return;

    addDependentMutation.mutate(newDependent);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Health Dashboard</h1>
          <p className="text-gray-600">Manage your healthcare claims and family coverage</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="font-semibold">{patientInfo.firstName} {patientInfo.lastName}</div>
            <div className="text-sm text-gray-600">{patientInfo.membershipNumber}</div>
          </div>
          <Badge variant="outline" className="text-teal-600 border-teal-200">
            <User className="w-4 h-4 mr-1" />
            {patientInfo.scheme}
          </Badge>
        </div>
      </div>

      {/* Benefit Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {benefitSummary.map((benefit) => (
          <Card key={benefit.category}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{benefit.category}</h3>
                <span className="text-sm text-gray-600">
                  {benefit.utilizationPercentage}% used
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full ${getUtilizationColor(benefit.utilizationPercentage)}`}
                  style={{ width: `${benefit.utilizationPercentage}%` }}
                ></div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Used:</span>
                  <span className="font-medium">KES {benefit.usedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium text-green-600">
                    KES {benefit.remainingAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resets:</span>
                  <span className="text-xs">{new Date(benefit.resetDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="claims">My Claims</TabsTrigger>
          <TabsTrigger value="dependents">Family Members</TabsTrigger>
          <TabsTrigger value="preauth">Preauthorizations</TabsTrigger>
          <TabsTrigger value="estimates">Cost Estimates</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Claims History ({claims.length})
              </CardTitle>
              <CardDescription>
                View and manage your healthcare claims
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {claims.map((claim) => (
                  <Card key={claim.id} className="border-l-4 border-l-teal-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-800 font-bold">
                            {claim.id}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{claim.serviceType}</h3>
                            <p className="text-gray-600">{claim.provider}</p>
                            <p className="text-sm text-gray-500">{claim.diagnosis}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={getStatusBadge(claim.status)}>
                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                          </Badge>
                          <div className="text-lg font-semibold">
                            KES {claim.claimAmount.toLocaleString()}
                          </div>
                          {claim.copayAmount > 0 && (
                            <div className="text-sm text-gray-600">
                              Co-pay: KES {claim.copayAmount.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Service Date</h4>
                          <p className="text-gray-700">
                            {new Date(claim.serviceDate).toLocaleDateString()}
                          </p>
                        </div>
                        {claim.processedDate && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Processed</h4>
                            <p className="text-gray-700">
                              {new Date(claim.processedDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {claim.status === "pending" && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                            <p className="text-yellow-600 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Processing
                            </p>
                          </div>
                        )}
                      </div>

                      {claim.denialReason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-md">
                          <div className="flex items-center mb-1">
                            <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                            <h4 className="font-medium text-red-800">Denial Reason</h4>
                          </div>
                          <p className="text-red-700 text-sm">{claim.denialReason}</p>
                        </div>
                      )}

                      {claim.canAppeal && (
                        <div className="mt-3 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedClaim(claim)}
                          >
                            Appeal Claim
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appeal Modal */}
          {selectedClaim && (
            <Card>
              <CardHeader>
                <CardTitle>Appeal Claim #{selectedClaim.id}</CardTitle>
                <CardDescription>
                  Submit an appeal for the denied claim
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="appealReason">Reason for Appeal</Label>
                  <Textarea
                    id="appealReason"
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="Please explain why you believe this claim should be reconsidered..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSelectedClaim(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={submitAppeal}
                    disabled={!appealReason.trim() || submitAppealMutation.isPending}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {submitAppealMutation.isPending ? "Submitting..." : "Submit Appeal"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dependents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Family Members ({dependents.length})
                </div>
                <Button onClick={() => setShowAddDependent(true)} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Dependent
                </Button>
              </CardTitle>
              <CardDescription>
                Manage family members covered under your plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dependents.map((dependent) => (
                  <Card key={dependent.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {dependent.firstName} {dependent.lastName}
                            </h3>
                            <p className="text-gray-600 capitalize">{dependent.relationship}</p>
                            <p className="text-sm text-gray-500">
                              {dependent.gender} • Born {new Date(dependent.dateOfBirth).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={dependent.isActive ? "default" : "secondary"}>
                            {dependent.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Dependent Form */}
          {showAddDependent && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Dependent</CardTitle>
                <CardDescription>
                  Add a family member to your coverage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newDependent.firstName}
                      onChange={(e) => setNewDependent({
                        ...newDependent,
                        firstName: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newDependent.lastName}
                      onChange={(e) => setNewDependent({
                        ...newDependent,
                        lastName: e.target.value
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="relationship">Relationship</Label>
                    <Select
                      value={newDependent.relationship}
                      onValueChange={(value) => setNewDependent({
                        ...newDependent,
                        relationship: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newDependent.dateOfBirth}
                      onChange={(e) => setNewDependent({
                        ...newDependent,
                        dateOfBirth: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={newDependent.gender}
                      onValueChange={(value) => setNewDependent({
                        ...newDependent,
                        gender: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDependent(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={addDependent}
                    disabled={addDependentMutation.isPending}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {addDependentMutation.isPending ? "Adding..." : "Add Dependent"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preauth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Current Preauthorizations ({preauthorizedServices.length})
              </CardTitle>
              <CardDescription>
                Services that have been pre-approved for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preauthorizedServices.map((service) => (
                  <Card key={service.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{service.serviceType}</h3>
                          <p className="text-gray-600">{service.provider}</p>
                          {service.conditions && (
                            <p className="text-sm text-gray-500">{service.conditions}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800">
                            {service.status.replace('_', ' ')}
                          </Badge>
                          <div className="text-lg font-semibold text-green-600">
                            KES {service.approvedAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Estimated Cost</h4>
                          <p className="text-gray-700">
                            KES {service.estimatedCost.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Expires</h4>
                          <p className="text-gray-700">
                            {new Date(service.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estimates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Cost Estimates
              </CardTitle>
              <CardDescription>
                Get estimates for common services based on your scheme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">General Consultation</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Hospital:</span>
                        <span>KES 3,000 - 8,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Clinic:</span>
                        <span>KES 1,500 - 4,000</span>
                      </div>
                      <div className="flex justify-between font-medium text-teal-600">
                        <span>Your co-pay (10%):</span>
                        <span>KES 150 - 800</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Laboratory Tests</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Basic Panel:</span>
                        <span>KES 2,000 - 5,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Comprehensive:</span>
                        <span>KES 5,000 - 12,000</span>
                      </div>
                      <div className="flex justify-between font-medium text-teal-600">
                        <span>Your co-pay (10%):</span>
                        <span>KES 200 - 1,200</span>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="text-center py-8 bg-gray-50 rounded-md">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Need a specific estimate?</p>
                  <Button className="mt-2 bg-teal-600 hover:bg-teal-700">
                    Contact Customer Service
                  </Button>
                </div>
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