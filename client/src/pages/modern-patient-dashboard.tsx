import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SharedLayout } from "@/components/layout/shared-layout";
import { 
  User, FileText, Users, DollarSign, AlertCircle, Clock, Plus,
  Heart, Shield, Activity, CheckCircle, XCircle, Calculator,
  Phone, MapPin, Calendar, CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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

interface BenefitUsage {
  category: string;
  usedAmount: number;
  totalLimit: number;
  utilizationPercentage: number;
  remainingAmount: number;
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

export default function ModernPatientDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedClaim, setSelectedClaim] = useState<PatientClaim | null>(null);

  // Mock data
  const claims: PatientClaim[] = [
    {
      id: 1,
      serviceType: "General Consultation",
      provider: "Aga Khan Hospital",
      diagnosis: "Hypertension Follow-up",
      claimAmount: 5000,
      copayAmount: 500,
      status: "approved",
      serviceDate: "2024-06-15",
      processedDate: "2024-06-16",
      canAppeal: false
    },
    {
      id: 2,
      serviceType: "Laboratory Tests",
      provider: "Nairobi Hospital",
      diagnosis: "Diabetes Monitoring",
      claimAmount: 3500,
      copayAmount: 350,
      status: "approved",
      serviceDate: "2024-06-10",
      processedDate: "2024-06-11",
      canAppeal: false
    },
    {
      id: 3,
      serviceType: "Specialist Consultation",
      provider: "Kenyatta National Hospital",
      diagnosis: "Cardiology Consultation",
      claimAmount: 8000,
      copayAmount: 1600,
      status: "denied",
      serviceDate: "2024-06-05",
      processedDate: "2024-06-07",
      denialReason: "Service not covered under current benefit category",
      canAppeal: true
    }
  ];

  const dependents: Dependent[] = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe Jr.",
      relationship: "Son",
      dateOfBirth: "2015-03-20",
      gender: "Male",
      isActive: true
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Doe",
      relationship: "Daughter",
      dateOfBirth: "2018-07-15",
      gender: "Female",
      isActive: true
    }
  ];

  const benefitUsage: BenefitUsage[] = [
    {
      category: "Outpatient Services",
      usedAmount: 25000,
      totalLimit: 50000,
      utilizationPercentage: 50,
      remainingAmount: 25000
    },
    {
      category: "Specialist Consultations",
      usedAmount: 18000,
      totalLimit: 30000,
      utilizationPercentage: 60,
      remainingAmount: 12000
    },
    {
      category: "Laboratory & Imaging",
      usedAmount: 8000,
      totalLimit: 20000,
      utilizationPercentage: 40,
      remainingAmount: 12000
    },
    {
      category: "Pharmacy",
      usedAmount: 15000,
      totalLimit: 25000,
      utilizationPercentage: 60,
      remainingAmount: 10000
    }
  ];

  const preauthorizedServices: PreauthorizedService[] = [
    {
      id: 1,
      serviceType: "MRI Scan",
      provider: "Nairobi Hospital",
      estimatedCost: 45000,
      approvedAmount: 40000,
      status: "approved",
      expiryDate: "2024-07-20",
      conditions: "Prior authorization valid for 30 days"
    },
    {
      id: 2,
      serviceType: "Physical Therapy",
      provider: "Rehab Center",
      estimatedCost: 12000,
      approvedAmount: 12000,
      status: "approved",
      expiryDate: "2024-08-15"
    }
  ];

  const sidebarItems = [
    { path: "/patient", icon: <User className="h-5 w-5" />, label: "Overview" },
    { path: "/patient/claims", icon: <FileText className="h-5 w-5" />, label: "My Claims", badge: claims.length.toString() },
    { path: "/patient/family", icon: <Users className="h-5 w-5" />, label: "Family Members" },
    { path: "/patient/benefits", icon: <Shield className="h-5 w-5" />, label: "Benefits" },
    { path: "/patient/appointments", icon: <Calendar className="h-5 w-5" />, label: "Appointments" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "denied": return "bg-red-100 text-red-800 border-red-200";
      case "pending": return "bg-orange-100 text-orange-800 border-orange-200";
      case "void": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return "text-red-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-green-600";
  };

  const appealClaim = async (claimId: number) => {
    toast({
      title: "Appeal Submitted",
      description: "Your claim appeal has been submitted for review",
    });
  };

  const calculateHealthScore = () => {
    // Mock health score calculation based on recent claims and visits
    const recentClaims = claims.filter(claim => 
      new Date(claim.serviceDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    
    const baseScore = 85;
    const penalty = Math.min(recentClaims * 5, 20); // Max 20 point penalty
    return Math.max(baseScore - penalty, 40);
  };

  const healthScore = calculateHealthScore();

  return (
    <SharedLayout sidebarItems={sidebarItems} title="Patient Dashboard">
      <div className="space-y-6">
        {/* Health Score Widget */}
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Health Score</h3>
                <p className="text-sm text-muted-foreground">
                  Based on recent healthcare activity and prevention
                </p>
              </div>
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-8 border-gray-200 border-t-primary animate-pulse-slow flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{healthScore}</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{claims.length}</p>
                  <p className="text-sm text-muted-foreground">Total Claims</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    KES {claims.reduce((sum, claim) => sum + claim.claimAmount, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Claims Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{dependents.length + 1}</p>
                  <p className="text-sm text-muted-foreground">Family Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round(benefitUsage.reduce((sum, benefit) => sum + benefit.utilizationPercentage, 0) / benefitUsage.length)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Benefit Usage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="claims">Claims History</TabsTrigger>
            <TabsTrigger value="family">Family</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Claims */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Claims</CardTitle>
                  <CardDescription>Your latest healthcare claims and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {claims.slice(0, 3).map((claim) => (
                      <div key={claim.id} className="border rounded-xl p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{claim.serviceType}</h4>
                            <p className="text-sm text-muted-foreground">{claim.provider}</p>
                          </div>
                          <Badge className={getStatusColor(claim.status)}>
                            {claim.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Amount:</span> KES {claim.claimAmount.toLocaleString()}</p>
                          <p><span className="font-medium">Your Share:</span> KES {claim.copayAmount.toLocaleString()}</p>
                          <p><span className="font-medium">Date:</span> {new Date(claim.serviceDate).toLocaleDateString()}</p>
                        </div>
                        {claim.canAppeal && (
                          <Button size="sm" variant="outline" onClick={() => appealClaim(claim.id)}>
                            Appeal Decision
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Preauthorized Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Preauthorized Services</CardTitle>
                  <CardDescription>Services approved for future use</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {preauthorizedServices.map((service) => (
                      <div key={service.id} className="border rounded-xl p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{service.serviceType}</h4>
                            <p className="text-sm text-muted-foreground">{service.provider}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            APPROVED
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Approved Amount:</span> KES {service.approvedAmount.toLocaleString()}</p>
                          <p><span className="font-medium">Expires:</span> {new Date(service.expiryDate).toLocaleDateString()}</p>
                          {service.conditions && (
                            <p className="text-xs text-orange-600">{service.conditions}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="claims" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Claims History</CardTitle>
                <CardDescription>Complete history of your healthcare claims</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <Card key={claim.id} className="card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-medium">{claim.serviceType}</h4>
                            <p className="text-sm text-muted-foreground">{claim.provider}</p>
                            <p className="text-sm text-muted-foreground">{claim.diagnosis}</p>
                          </div>
                          <Badge className={getStatusColor(claim.status)}>
                            {claim.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-muted-foreground">Service Date</p>
                            <p className="font-medium">{new Date(claim.serviceDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Claim Amount</p>
                            <p className="font-medium">KES {claim.claimAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Your Share</p>
                            <p className="font-medium">KES {claim.copayAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Insurance Covered</p>
                            <p className="font-medium">KES {(claim.claimAmount - claim.copayAmount).toLocaleString()}</p>
                          </div>
                        </div>

                        {claim.denialReason && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                            <p className="text-sm text-red-700">
                              <span className="font-medium">Denial Reason:</span> {claim.denialReason}
                            </p>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {claim.canAppeal && (
                            <Button size="sm" variant="outline" onClick={() => appealClaim(claim.id)}>
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Appeal
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-1" />
                            Contact Provider
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="family" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Primary Member */}
              <Card>
                <CardHeader>
                  <CardTitle>Primary Member</CardTitle>
                  <CardDescription>Your coverage information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{user?.name || 'John Doe'}</h3>
                        <p className="text-sm text-muted-foreground">Primary Member</p>
                        <Badge className="bg-green-100 text-green-800 mt-1">ACTIVE</Badge>
                      </div>
                    </div>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Member ID:</span>
                        <span className="font-medium">SHA-001234567</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Plan:</span>
                        <span className="font-medium">SHA Essential Health Package</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coverage Start:</span>
                        <span className="font-medium">January 1, 2024</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dependents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Family Members</span>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Member
                    </Button>
                  </CardTitle>
                  <CardDescription>Your covered dependents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dependents.map((dependent) => (
                      <div key={dependent.id} className="flex items-center justify-between p-3 border rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{dependent.firstName} {dependent.lastName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {dependent.relationship} • Age: {new Date().getFullYear() - new Date(dependent.dateOfBirth).getFullYear()}
                            </p>
                          </div>
                        </div>
                        <Badge className={dependent.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {dependent.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Benefit Utilization</CardTitle>
                <CardDescription>Track your healthcare benefit usage across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {benefitUsage.map((benefit) => (
                    <div key={benefit.category} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{benefit.category}</h4>
                        <span className={`text-sm font-medium ${getUtilizationColor(benefit.utilizationPercentage)}`}>
                          {benefit.utilizationPercentage}%
                        </span>
                      </div>
                      
                      <Progress value={benefit.utilizationPercentage} className="h-3" />
                      
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Used:</span>
                          <span className="font-medium">KES {benefit.usedAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Remaining:</span>
                          <span className="font-medium">KES {benefit.remainingAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Limit:</span>
                          <span className="font-medium">KES {benefit.totalLimit.toLocaleString()}</span>
                        </div>
                      </div>

                      {benefit.utilizationPercentage >= 80 && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                          <div className="flex items-center space-x-2 text-orange-700">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">High Usage Alert</span>
                          </div>
                          <p className="text-xs text-orange-600 mt-1">
                            You're approaching your limit for this benefit category
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost Estimator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Cost Estimator</span>
                </CardTitle>
                <CardDescription>Estimate costs for upcoming healthcare services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="service-type">Service Type</Label>
                      <Input id="service-type" placeholder="e.g., General Consultation" />
                    </div>
                    <div>
                      <Label htmlFor="provider">Provider</Label>
                      <Input id="provider" placeholder="e.g., Nairobi Hospital" />
                    </div>
                    <div>
                      <Label htmlFor="estimated-cost">Estimated Cost</Label>
                      <Input id="estimated-cost" placeholder="e.g., 5000" type="number" />
                    </div>
                  </div>
                  <Button className="w-full md:w-auto">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Copay
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SharedLayout>
  );
}