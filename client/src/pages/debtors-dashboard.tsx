import { useState } from "react";
import { SharedLayout } from "@/components/layout/shared-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  Send, 
  Download,
  Upload,
  Mail,
  Filter,
  Search
} from "lucide-react";
import { BiometricClaimVerification } from "@/components/biometric-claim-verification";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const sidebarItems = [
  { path: "/debtors-dashboard", icon: <FileText className="h-5 w-5" />, label: "Overview" },
  { path: "/debtors-dashboard/batches", icon: <FileText className="h-5 w-5" />, label: "Claim Batches" },
  { path: "/debtors-dashboard/pending", icon: <AlertTriangle className="h-5 w-5" />, label: "Pending Diagnosis" },
  { path: "/debtors-dashboard/void", icon: <AlertTriangle className="h-5 w-5" />, label: "Void Claims", badge: "Premium" },
  { path: "/debtors-dashboard/tracker", icon: <CheckCircle className="h-5 w-5" />, label: "Insurer Status" },
  { path: "/debtors-dashboard/export", icon: <Download className="h-5 w-5" />, label: "Export & Submission" },
];

// Mock data - replace with real API calls
const mockClaimBatches = [
  {
    id: "SHA-001",
    insurer: "SHA (Social Health Authority)",
    scheme: "Universal Health Coverage",
    claims: [
      {
        id: "CLM-001",
        patientName: "John Wanjiku",
        services: "Consultation, Lab Tests",
        date: "2025-01-15",
        amount: 3500,
        diagnosisStatus: "missing",
        doctorName: "Dr. Sarah Mwangi",
        status: "pending"
      },
      {
        id: "CLM-002", 
        patientName: "Mary Njeri",
        services: "Surgery, Medication",
        date: "2025-01-14",
        amount: 85000,
        diagnosisStatus: "complete",
        doctorName: "Dr. Peter Kimani",
        status: "ready"
      }
    ]
  },
  {
    id: "CIC-001",
    insurer: "CIC Insurance",
    scheme: "Individual Medical Cover",
    claims: [
      {
        id: "CLM-003",
        patientName: "David Ochieng",
        services: "Physiotherapy",
        date: "2025-01-13",
        amount: 4500,
        diagnosisStatus: "complete",
        doctorName: "Dr. Anne Mutiso",
        status: "preauth_missing"
      }
    ]
  }
];

const mockPendingDiagnosis = [
  {
    doctorName: "Dr. Sarah Mwangi",
    pendingCount: 3,
    email: "sarah.mwangi@knh.go.ke",
    oldestClaim: "2025-01-10"
  },
  {
    doctorName: "Dr. James Kiprotich",
    pendingCount: 1,
    email: "james.k@aku.edu",
    oldestClaim: "2025-01-12"
  }
];

const mockVoidClaims = [
  {
    id: "CLM-V001",
    patientName: "Grace Waweru",
    reason: "Patient ID mismatch",
    amount: 2500,
    date: "2025-01-08",
    category: "data_error"
  },
  {
    id: "CLM-V002",
    patientName: "Samuel Kiptoo",
    reason: "Incomplete notes",
    amount: 1200,
    date: "2025-01-07",
    category: "documentation"
  }
];

export default function DebtorsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInsurer, setSelectedInsurer] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch claims batches data
  const { data: claimsBatches = mockClaimBatches } = useQuery({
    queryKey: ['/api/debtors/claims-batches'],
    queryFn: () => apiRequest('/api/debtors/claims-batches')
  });

  // Fetch pending diagnosis data
  const { data: pendingDiagnosis = mockPendingDiagnosis } = useQuery({
    queryKey: ['/api/debtors/pending-diagnosis'],
    queryFn: () => apiRequest('/api/debtors/pending-diagnosis')
  });

  // Send reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: (doctorData: any) => apiRequest('/api/debtors/send-reminder', {
      method: 'POST',
      body: JSON.stringify(doctorData),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: (data, variables) => {
      toast({
        title: "Reminder Sent",
        description: `Notification sent to ${variables.doctorName}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive"
      });
    }
  });

  // Submit batch mutation
  const submitBatchMutation = useMutation({
    mutationFn: (batchData: any) => apiRequest('/api/debtors/submit-batch', {
      method: 'POST',
      body: JSON.stringify(batchData),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/debtors/claims-batches'] });
      toast({
        title: "Batch Submitted",
        description: "Claims batch has been successfully submitted to insurer",
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit claims batch",
        variant: "destructive"
      });
    }
  });

  const getStatusBadge = (status: string, diagnosisStatus: string) => {
    if (diagnosisStatus === "missing") {
      return <Badge variant="destructive">Diagnosis Missing</Badge>;
    }
    if (status === "preauth_missing") {
      return <Badge variant="secondary">Preauth Missing</Badge>;
    }
    if (status === "ready") {
      return <Badge variant="default" className="bg-teal-100 text-teal-800">Ready for Submission</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const totalClaims = claimsBatches.reduce((sum, batch) => sum + batch.claims.length, 0);
  const readyClaims = claimsBatches.reduce((sum, batch) => 
    sum + batch.claims.filter(c => c.status === "ready" && c.diagnosisStatus === "complete").length, 0
  );
  const pendingDiagnosisClaims = claimsBatches.reduce((sum, batch) => 
    sum + batch.claims.filter(c => c.diagnosisStatus === "missing").length, 0
  );
  const totalAmount = claimsBatches.reduce((sum, batch) => 
    sum + batch.claims.reduce((claimSum, claim) => claimSum + claim.amount, 0), 0
  );

  const handleSendReminder = (doctor: any) => {
    sendReminderMutation.mutate({
      doctorEmail: doctor.email,
      doctorName: doctor.doctorName,
      pendingCount: doctor.pendingCount
    });
  };

  const handleBatchSubmission = (batchId: string, verificationMethod: string) => {
    const batch = claimsBatches.find(b => b.id === batchId);
    if (!batch) return;

    submitBatchMutation.mutate({
      batchId,
      verificationMethod,
      totalAmount: batch.claims.reduce((sum, claim) => sum + claim.amount, 0),
      claimCount: batch.claims.length
    });
  };

  return (
    <SharedLayout sidebarItems={sidebarItems} title="Debtors Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Claims</p>
                  <p className="text-2xl font-bold text-gray-900">{totalClaims}</p>
                  <p className="text-xs text-muted-foreground">Current Month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-teal-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clean Claims Ready</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalClaims > 0 ? Math.round((readyClaims / totalClaims) * 100) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">{readyClaims} of {totalClaims}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Diagnosis</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingDiagnosisClaims}</p>
                  <p className="text-xs text-muted-foreground">Awaiting doctors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expected Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    KES {totalAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total reimbursements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="batches">Claim Batches</TabsTrigger>
            <TabsTrigger value="diagnosis">Pending Diagnosis</TabsTrigger>
            <TabsTrigger value="void">Void Claims</TabsTrigger>
            <TabsTrigger value="export">Export & Submit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Batch SHA-001 ready for submission</p>
                        <p className="text-xs text-muted-foreground">2 claims, KES 88,500</p>
                      </div>
                      <Badge variant="outline">Today</Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Diagnosis reminder sent to Dr. Mwangi</p>
                        <p className="text-xs text-muted-foreground">3 pending claims</p>
                      </div>
                      <Badge variant="outline">1h ago</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Send className="mr-2 h-4 w-4" />
                      Send Diagnosis Reminders
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Generate Monthly Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Insurer Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="batches" className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search claims..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedInsurer} onValueChange={setSelectedInsurer}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by insurer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Insurers</SelectItem>
                  <SelectItem value="sha">SHA</SelectItem>
                  <SelectItem value="cic">CIC Insurance</SelectItem>
                  <SelectItem value="aar">AAR Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {claimsBatches.map((batch) => (
                <Card key={batch.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{batch.insurer}</CardTitle>
                        <CardDescription>{batch.scheme}</CardDescription>
                      </div>
                      <Badge variant="outline">Batch {batch.id}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="claims">
                        <AccordionTrigger>
                          View Claims ({batch.claims.length})
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {batch.claims.map((claim) => (
                              <div key={claim.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-3">
                                    <h4 className="font-medium">{claim.patientName}</h4>
                                    {getStatusBadge(claim.status, claim.diagnosisStatus)}
                                  </div>
                                  <span className="font-semibold text-green-600">
                                    KES {claim.amount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                  <div>
                                    <p><strong>Services:</strong> {claim.services}</p>
                                    <p><strong>Date:</strong> {claim.date}</p>
                                  </div>
                                  <div>
                                    <p><strong>Doctor:</strong> {claim.doctorName}</p>
                                    <p><strong>Claim ID:</strong> {claim.id}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="diagnosis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span>Pending Diagnosis Reminders</span>
                </CardTitle>
                <CardDescription>
                  Doctors who haven't completed diagnosis for submitted claims
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingDiagnosis.map((doctor, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{doctor.doctorName}</h4>
                          <p className="text-sm text-muted-foreground">{doctor.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {doctor.pendingCount} pending • Oldest: {doctor.oldestClaim}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive">{doctor.pendingCount} pending</Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSendReminder(doctor)}
                          disabled={sendReminderMutation.isPending}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          {sendReminderMutation.isPending ? 'Sending...' : 'Send Reminder'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="void" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span>Void Claims Analysis</span>
                    </CardTitle>
                    <CardDescription>
                      Claims that were voided or rejected with categorization
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Premium Feature</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockVoidClaims.map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{claim.patientName}</h4>
                        <p className="text-sm text-muted-foreground">{claim.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {claim.date} • KES {claim.amount.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={claim.category === "data_error" ? "destructive" : "secondary"}>
                        {claim.category === "data_error" ? "Data Error" : "Documentation"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submission Readiness</CardTitle>
                  <CardDescription>
                    Generate batches for insurer submission
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Summary Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download Batch (Excel)
                    </Button>
                    {claimsBatches.length > 0 && (
                      <BiometricClaimVerification
                        batchId={claimsBatches[0].id}
                        totalAmount={claimsBatches[0].claims.reduce((sum, claim) => sum + claim.amount, 0)}
                        claimCount={claimsBatches[0].claims.length}
                        onVerificationComplete={(verified) => {
                          if (verified) {
                            handleBatchSubmission(claimsBatches[0].id, 'biometric');
                          }
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Insurer Feedback</CardTitle>
                  <CardDescription>
                    Upload and reconcile insurer responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload insurer response files (CSV/PDF)
                    </p>
                    <Button variant="outline" size="sm">
                      Choose Files
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Submitted Claims</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Paid Claims</span>
                      <span className="font-medium text-green-600">8</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Denied Claims</span>
                      <span className="font-medium text-red-600">2</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Pending Review</span>
                      <span className="font-medium text-orange-600">2</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SharedLayout>
  );
}