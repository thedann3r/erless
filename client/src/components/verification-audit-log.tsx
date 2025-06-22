import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, 
  Download, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  X,
  FileText,
  Search,
  Calendar,
  Lock
} from "lucide-react";

interface VerificationAuditEntry {
  id: string;
  patientName: string;
  service: string;
  billedBy: string;
  billedAt: string;
  verifiedBy: string;
  fingerprintStatus: 'verified' | 'missing' | 'pending' | 'time_mismatch';
  timestamp: string;
  department: string;
  amount: number;
  serviceCode: string;
  verificationHash?: string;
  timeDifference?: number; // minutes between billing and verification
}

interface VerificationAuditLogProps {
  isPremiumUser: boolean;
}

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function VerificationAuditLog({ isPremiumUser }: VerificationAuditLogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<VerificationAuditEntry | null>(null);

  // Fetch audit data from API
  const { data: auditResponse, isLoading } = useQuery({
    queryKey: ['/api/debtors/verification-audit', { 
      department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      search: searchTerm || undefined
    }],
    queryFn: ({ queryKey }) => {
      const params = new URLSearchParams();
      const filters = queryKey[1] as Record<string, string>;
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return apiRequest(`/api/debtors/verification-audit?${params.toString()}`);
    },
    enabled: isPremiumUser
  });

  const auditData = auditResponse?.data || [];
  const auditSummary = auditResponse?.summary || {
    total: 0,
    verified: 0,
    missing: 0,
    pending: 0,
    timeMismatches: 0
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'missing':
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Missing
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'time_mismatch':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Time Mismatch
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getFilteredData = () => {
    return auditData;
  };

  const exportToPDF = () => {
    console.log("Exporting verification audit to PDF...");
    // Implementation for PDF export
  };

  const exportToCSV = () => {
    const csvContent = [
      "Patient Name,Service,Billed By,Billed At,Verified By,Fingerprint Status,Timestamp,Department,Amount,Service Code",
      ...getFilteredData().map(entry => 
        `${entry.patientName},${entry.service},${entry.billedBy},${entry.billedAt},${entry.verifiedBy},${entry.fingerprintStatus},${entry.timestamp},${entry.department},${entry.amount},${entry.serviceCode}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isPremiumUser) {
    return (
      <Card className="relative">
        <div className="absolute inset-0 bg-gray-50/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="text-center p-6">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Premium Feature</h3>
            <p className="text-sm text-gray-500 mb-4">
              Upgrade to Premium to unlock Verification Audit Tools
            </p>
            <Button variant="outline" className="text-teal-600 border-teal-600 hover:bg-teal-50">
              Upgrade Now
            </Button>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-teal-600" />
            <span>Verification Audit Log</span>
            <Badge variant="secondary">Premium</Badge>
          </CardTitle>
          <CardDescription>
            Comprehensive audit trail of biometric verifications and billing activities
          </CardDescription>
        </CardHeader>
        <CardContent className="blur-sm">
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-teal-600" />
              <span>Verification Audit Log</span>
              <Badge className="bg-teal-100 text-teal-800">Premium</Badge>
            </CardTitle>
            <CardDescription>
              Comprehensive audit trail of biometric verifications and billing activities
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="audit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="audit">Audit Table</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="audit" className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Patient, service, or provider..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Outpatient">Outpatient</SelectItem>
                    <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="Laboratory">Laboratory</SelectItem>
                    <SelectItem value="Physiotherapy">Physiotherapy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Verification Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="missing">Missing</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="time_mismatch">Time Mismatch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date-from">Date From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="date-to">Date To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Audit Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Billed By</TableHead>
                    <TableHead>Billed At</TableHead>
                    <TableHead>Verified By</TableHead>
                    <TableHead>Fingerprint Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                          <span>Loading audit data...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : getFilteredData().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No audit records found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredData().map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{entry.patientName}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.service}</div>
                          <div className="text-xs text-gray-500">{entry.serviceCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.billedBy}</div>
                          <div className="text-xs text-gray-500">{entry.department}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(entry.billedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {entry.verifiedBy || <span className="text-gray-400">Not verified</span>}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(entry.fingerprintStatus)}
                        {entry.fingerprintStatus === 'time_mismatch' && entry.timeDifference && (
                          <div className="text-xs text-orange-600 mt-1">
                            {entry.timeDifference > 0 ? '+' : ''}{entry.timeDifference}min
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        KES {entry.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedEntry(entry)}>
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Verification Audit Details</DialogTitle>
                              <DialogDescription>
                                Complete audit trail for {entry.patientName}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedEntry && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Service Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><strong>Patient:</strong> {selectedEntry.patientName}</p>
                                      <p><strong>Service:</strong> {selectedEntry.service}</p>
                                      <p><strong>Service Code:</strong> {selectedEntry.serviceCode}</p>
                                      <p><strong>Amount:</strong> KES {selectedEntry.amount.toLocaleString()}</p>
                                      <p><strong>Department:</strong> {selectedEntry.department}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Verification Details</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><strong>Billed By:</strong> {selectedEntry.billedBy}</p>
                                      <p><strong>Billed At:</strong> {new Date(selectedEntry.billedAt).toLocaleString()}</p>
                                      <p><strong>Verified By:</strong> {selectedEntry.verifiedBy || 'Not verified'}</p>
                                      <p><strong>Verified At:</strong> {selectedEntry.timestamp ? new Date(selectedEntry.timestamp).toLocaleString() : 'N/A'}</p>
                                      <p><strong>Status:</strong> {getStatusBadge(selectedEntry.fingerprintStatus)}</p>
                                    </div>
                                  </div>
                                </div>
                                {selectedEntry.verificationHash && (
                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium mb-2">Blockchain Hash</h4>
                                    <code className="text-xs bg-white p-2 rounded border block">
                                      {selectedEntry.verificationHash}
                                    </code>
                                  </div>
                                )}
                                {selectedEntry.fingerprintStatus === 'time_mismatch' && (
                                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                    <div className="flex items-center space-x-2">
                                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                                      <span className="font-medium text-orange-800">Time Mismatch Alert</span>
                                    </div>
                                    <p className="text-sm text-orange-700 mt-1">
                                      Verification occurred {Math.abs(selectedEntry.timeDifference || 0)} minutes 
                                      {(selectedEntry.timeDifference || 0) > 0 ? ' after' : ' before'} billing. 
                                      This may indicate irregular billing practices.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Verification Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {auditSummary.total > 0 ? Math.round((auditSummary.verified / auditSummary.total) * 100) : 0}%
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Missing Verifications</p>
                      <p className="text-2xl font-bold text-red-600">
                        {auditSummary.missing}
                      </p>
                    </div>
                    <X className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Time Mismatches</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {auditSummary.timeMismatches}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}