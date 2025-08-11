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
import { SharedLayout } from "@/components/layout/shared-layout";
import { 
  FileText, TrendingUp, AlertTriangle, DollarSign, Clock, 
  Settings, CheckCircle, XCircle, Search, Eye, Download,
  Calculator, Filter, Calendar, Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ClaimBatch {
  id: number;
  batchNumber: string;
  insurer: string;
  totalClaims: number;
  totalAmount: number;
  status: "pending" | "submitted" | "processing" | "paid" | "rejected";
  submittedAt: string;
  expectedPayment?: string;
  claimTypes: string[];
}

interface ClaimItem {
  id: number;
  claimId: string;
  patientName: string;
  memberNumber: string;
  provider: string;
  serviceType: string;
  amount: number;
  status: "approved" | "pending" | "denied" | "under_review";
  diagnosisCode?: string;
  submittedAt: string;
  reviewNotes?: string;
}

export default function InsurerClaimsManagerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedBatch, setSelectedBatch] = useState<ClaimBatch | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data for claims batches
  const mockBatches: ClaimBatch[] = [
    {
      id: 1,
      batchNumber: "BATCH-2024-001",
      insurer: user?.insurerCompany || "CIC",
      totalClaims: 156,
      totalAmount: 2340000,
      status: "pending",
      submittedAt: "2024-01-15T10:30:00Z",
      expectedPayment: "2024-01-25",
      claimTypes: ["Consultation", "Lab Tests", "Medication"]
    },
    {
      id: 2,
      batchNumber: "BATCH-2024-002",
      insurer: user?.insurerCompany || "CIC",
      totalClaims: 89,
      totalAmount: 1680000,
      status: "processing",
      submittedAt: "2024-01-10T14:20:00Z",
      expectedPayment: "2024-01-20",
      claimTypes: ["Emergency", "Surgery", "ICU"]
    },
    {
      id: 3,
      batchNumber: "BATCH-2024-003",
      insurer: user?.insurerCompany || "CIC",
      totalClaims: 203,
      totalAmount: 3120000,
      status: "paid",
      submittedAt: "2024-01-05T09:15:00Z",
      claimTypes: ["Consultation", "Pharmacy", "Diagnostics"]
    }
  ];

  // Mock data for individual claims
  const mockClaims: ClaimItem[] = [
    {
      id: 1,
      claimId: "CLM-2024-001",
      patientName: "Mary Wanjiku",
      memberNumber: `${user?.insurerCompany || "CIC"}-123456789`,
      provider: "Aga Khan Hospital",
      serviceType: "Consultation",
      amount: 5000,
      status: "approved",
      diagnosisCode: "Z00.0",
      submittedAt: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      claimId: "CLM-2024-002",
      patientName: "John Kamau",
      memberNumber: `${user?.insurerCompany || "CIC"}-987654321`,
      provider: "Nairobi Hospital",
      serviceType: "Lab Tests",
      amount: 12000,
      status: "pending",
      diagnosisCode: "R50.9",
      submittedAt: "2024-01-15T11:45:00Z",
      reviewNotes: "Additional documentation required"
    }
  ];

  const handleApproveClaim = async (claimId: number) => {
    toast({
      title: "Claim Approved",
      description: `Claim ID: CLM-2024-${claimId.toString().padStart(3, '0')} has been approved for payment.`,
    });
  };

  const handleRejectClaim = async (claimId: number) => {
    toast({
      title: "Claim Rejected",
      description: `Claim ID: CLM-2024-${claimId.toString().padStart(3, '0')} has been rejected.`,
      variant: "destructive",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "denied":
        return <Badge className="bg-red-500">Denied</Badge>;
      case "under_review":
        return <Badge className="bg-blue-500">Under Review</Badge>;
      case "paid":
        return <Badge className="bg-green-600">Paid</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <SharedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Claims Manager Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage and process insurance claims for {user?.insurerCompany || "your organization"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              New Batch
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claims Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES 7.14M</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87.3%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2 days</div>
              <p className="text-xs text-muted-foreground">-0.5 days improvement</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="batches" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="batches">Claim Batches</TabsTrigger>
            <TabsTrigger value="individual">Individual Claims</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="batches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Claim Batches</CardTitle>
                <CardDescription>Monitor and manage claim batches by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockBatches.map((batch) => (
                    <div key={batch.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{batch.batchNumber}</h3>
                            {getStatusBadge(batch.status)}
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>{batch.totalClaims} claims • KES {batch.totalAmount.toLocaleString()}</p>
                            <p>Submitted: {new Date(batch.submittedAt).toLocaleDateString()}</p>
                            {batch.expectedPayment && (
                              <p>Expected Payment: {batch.expectedPayment}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {batch.claimTypes.map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="individual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Individual Claims Review</CardTitle>
                <CardDescription>Review and process individual claims</CardDescription>
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Search claims..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockClaims.map((claim) => (
                    <div key={claim.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{claim.claimId}</h3>
                            {getStatusBadge(claim.status)}
                          </div>
                          <div className="text-sm text-gray-600">
                            <p><strong>Patient:</strong> {claim.patientName}</p>
                            <p><strong>Member ID:</strong> {claim.memberNumber}</p>
                            <p><strong>Provider:</strong> {claim.provider}</p>
                            <p><strong>Service:</strong> {claim.serviceType}</p>
                            <p><strong>Amount:</strong> KES {claim.amount.toLocaleString()}</p>
                            {claim.diagnosisCode && (
                              <p><strong>Diagnosis:</strong> {claim.diagnosisCode}</p>
                            )}
                            <p><strong>Submitted:</strong> {new Date(claim.submittedAt).toLocaleDateString()}</p>
                            {claim.reviewNotes && (
                              <p className="text-orange-600"><strong>Notes:</strong> {claim.reviewNotes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleApproveClaim(claim.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleRejectClaim(claim.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Claims by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Approved (67%)</span>
                      <span>164 claims</span>
                    </div>
                    <Progress value={67} className="w-full" />
                    
                    <div className="flex justify-between">
                      <span>Pending (23%)</span>
                      <span>56 claims</span>
                    </div>
                    <Progress value={23} className="w-full" />
                    
                    <div className="flex justify-between">
                      <span>Denied (10%)</span>
                      <span>25 claims</span>
                    </div>
                    <Progress value={10} className="w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-8 text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                      <p>Detailed analytics charts would be implemented here</p>
                      <p className="text-sm">Integration with charting library required</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Claims Processing Settings</CardTitle>
                <CardDescription>Configure automated processing rules and thresholds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="autoApproval">Auto-approval threshold (KES)</Label>
                    <Input id="autoApproval" type="number" placeholder="5000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviewThreshold">Manual review threshold (KES)</Label>
                    <Input id="reviewThreshold" type="number" placeholder="50000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notifications">Email notifications</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily digest</SelectItem>
                      <SelectItem value="weekly">Weekly report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SharedLayout>
  );
}