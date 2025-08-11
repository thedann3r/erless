import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Users, 
  Building2,
  Calendar,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface VerificationResult {
  isValid: boolean;
  practitioner?: {
    fullName: string;
    status: string;
    cadre: string;
    specialization: string;
    facility: string;
    board: string;
    licenseExpiryDate: string;
    practiceLicense: string;
  };
  error?: string;
}

interface RegistrationStats {
  totalPractitioners: number;
  activePractitioners: number;
  suspendedPractitioners: number;
  expiredLicenses: number;
  boardBreakdown: Record<string, number>;
}

export function RegistrationValidator() {
  const { toast } = useToast();
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [selectedCadre, setSelectedCadre] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [searchQuery, setSearchQuery] = useState({
    name: "",
    facility: "",
    cadre: "",
    board: ""
  });

  // Fetch registration boards
  const { data: boards = [] } = useQuery({
    queryKey: ["/api/registration/boards"],
    queryFn: async () => {
      const response = await fetch("/api/registration/boards");
      const data = await response.json();
      return data.boards || [];
    },
  });

  // Fetch registration statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/registration/statistics"],
    queryFn: async () => {
      const response = await fetch("/api/registration/statistics");
      const data = await response.json();
      return data as RegistrationStats;
    },
  });

  // Verification mutation
  const verifyMutation = useMutation({
    mutationFn: async (data: { registrationNumber: string; cadre?: string }) => {
      const response = await fetch("/api/verify-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Verification failed");
      }
      
      return result as VerificationResult;
    },
    onSuccess: (result) => {
      setVerificationResult(result);
      toast({
        title: "Verification Complete",
        description: result.isValid ? "Registration verified successfully" : "Registration verification failed",
        variant: result.isValid ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      setVerificationResult({
        isValid: false,
        error: error.message
      });
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (query: typeof searchQuery) => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/registration/search?${params}`, {
        credentials: 'include'
      });
      const data = await response.json();
      return data.practitioners || [];
    },
    onSuccess: () => {
      toast({
        title: "Search Complete",
        description: "Practitioner search completed successfully",
      });
    },
  });

  const handleVerify = () => {
    if (!registrationNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a registration number",
        variant: "destructive",
      });
      return;
    }

    verifyMutation.mutate({
      registrationNumber: registrationNumber.trim(),
      cadre: selectedCadre || undefined
    });
  };

  const handleSearch = () => {
    searchMutation.mutate(searchQuery);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800"><AlertTriangle className="w-3 h-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const sampleRegistrations = [
    { number: "KMPDC/001/2018", cadre: "Medical Doctor", description: "Active doctor registration" },
    { number: "PPB/001/2018", cadre: "Pharmacist", description: "Active pharmacist registration" },
    { number: "COC/001/2019", cadre: "Clinical Officer", description: "Active clinical officer" },
    { number: "KMPDC/004/2017", cadre: "Medical Doctor", description: "Suspended registration" },
    { number: "COC/003/2020", cadre: "Clinical Officer", description: "Expired license" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-teal-600" />
            Kenya Clinical Registration Validator
          </CardTitle>
          <CardDescription>
            Verify professional licenses with Kenya's clinical registration boards (KMPDC, COC, PPB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="verify" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="verify">Verify Registration</TabsTrigger>
              <TabsTrigger value="search">Search Practitioners</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="verify" className="space-y-6">
              {/* Sample Registrations */}
              <div>
                <h3 className="font-semibold mb-3">Sample Registrations for Testing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sampleRegistrations.map((sample, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => {
                            setRegistrationNumber(sample.number);
                            setSelectedCadre(sample.cadre);
                          }}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-mono text-sm font-medium">{sample.number}</p>
                            <p className="text-xs text-gray-600">{sample.cadre}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {sample.description}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Verification Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="regNumber">Registration Number</Label>
                  <Input
                    id="regNumber"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g., KMPDC/001/2018"
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="cadre">Expected Cadre (Optional)</Label>
                  <Select value={selectedCadre} onValueChange={setSelectedCadre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cadre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Cadre</SelectItem>
                      <SelectItem value="Medical Doctor">Medical Doctor</SelectItem>
                      <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                      <SelectItem value="Clinical Officer">Clinical Officer</SelectItem>
                      <SelectItem value="Nurse">Nurse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleVerify}
                disabled={verifyMutation.isPending}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {verifyMutation.isPending ? "Verifying..." : "Verify Registration"}
                <Shield className="w-4 h-4 ml-2" />
              </Button>

              {/* Verification Results */}
              {verificationResult && (
                <Alert className={verificationResult.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <div className="flex items-start">
                    {verificationResult.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>
                        {verificationResult.isValid ? (
                          <div className="space-y-3">
                            <p className="font-semibold text-green-800">Registration Verified Successfully</p>
                            <div className="bg-white rounded-lg p-4 space-y-2">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Full Name</p>
                                  <p className="text-sm">{verificationResult.practitioner?.fullName}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Status</p>
                                  {getStatusBadge(verificationResult.practitioner?.status || "")}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Cadre</p>
                                  <p className="text-sm">{verificationResult.practitioner?.cadre}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Specialization</p>
                                  <p className="text-sm">{verificationResult.practitioner?.specialization}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Facility</p>
                                  <p className="text-sm">{verificationResult.practitioner?.facility}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Board</p>
                                  <p className="text-sm">{verificationResult.practitioner?.board}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">License Expiry</p>
                                  <p className="text-sm flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(verificationResult.practitioner?.licenseExpiryDate || "").toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Practice License</p>
                                  <p className="text-sm font-mono">{verificationResult.practitioner?.practiceLicense}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-red-800">Verification Failed</p>
                            <p className="text-red-700 mt-1">{verificationResult.error}</p>
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="search" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="searchName">Practitioner Name</Label>
                  <Input
                    id="searchName"
                    value={searchQuery.name}
                    onChange={(e) => setSearchQuery({...searchQuery, name: e.target.value})}
                    placeholder="Enter name to search"
                  />
                </div>
                <div>
                  <Label htmlFor="searchFacility">Facility</Label>
                  <Input
                    id="searchFacility"
                    value={searchQuery.facility}
                    onChange={(e) => setSearchQuery({...searchQuery, facility: e.target.value})}
                    placeholder="Enter facility name"
                  />
                </div>
                <div>
                  <Label htmlFor="searchCadre">Cadre</Label>
                  <Select value={searchQuery.cadre} onValueChange={(value) => setSearchQuery({...searchQuery, cadre: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cadre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Cadres</SelectItem>
                      <SelectItem value="Medical Doctor">Medical Doctor</SelectItem>
                      <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                      <SelectItem value="Clinical Officer">Clinical Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="searchBoard">Board</Label>
                  <Select value={searchQuery.board} onValueChange={(value) => setSearchQuery({...searchQuery, board: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Boards</SelectItem>
                      {boards.map((board: string) => (
                        <SelectItem key={board} value={board}>{board}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleSearch}
                disabled={searchMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {searchMutation.isPending ? "Searching..." : "Search Practitioners"}
                <Search className="w-4 h-4 ml-2" />
              </Button>

              {searchMutation.data && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Search Results ({searchMutation.data.length})</h3>
                  {searchMutation.data.map((practitioner: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{practitioner.fullName}</h4>
                            <p className="text-sm text-gray-600">{practitioner.cadre} - {practitioner.specialization}</p>
                            <p className="text-sm text-gray-500">{practitioner.facility}</p>
                          </div>
                          <div className="text-right space-y-1">
                            {getStatusBadge(practitioner.status)}
                            <p className="text-xs text-gray-500">{practitioner.board}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Practitioners</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalPractitioners}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Active Licenses</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.activePractitioners}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <XCircle className="h-8 w-8 text-red-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Suspended</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.suspendedPractitioners}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Expired Licenses</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.expiredLicenses}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {stats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      Board Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(stats.boardBreakdown).map(([board, count]) => (
                        <div key={board} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{board}</span>
                          <Badge variant="outline">{count} practitioners</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}