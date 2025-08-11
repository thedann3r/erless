import { useState, useEffect } from "react";
import { SharedLayout } from "@/components/layout/shared-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Building2, 
  Shield, 
  FileText, 
  Settings, 
  Database, 
  Brain, 
  Link,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Activity,
  Clock,
  Globe,
  Zap
} from "lucide-react";
import { useLocation } from "wouter";

const sidebarItems = [
  { path: "/modern-admin", icon: <Users className="h-5 w-5" />, label: "User Management" },
  { path: "/modern-admin/providers", icon: <Building2 className="h-5 w-5" />, label: "Care Providers" },
  { path: "/modern-admin/licenses", icon: <Shield className="h-5 w-5" />, label: "License Validation" },
  { path: "/modern-admin/logs", icon: <FileText className="h-5 w-5" />, label: "Audit Logs" },
  { path: "/modern-admin/settings", icon: <Settings className="h-5 w-5" />, label: "Global Settings" }
];

// Mock data for demonstration
const mockUsers = [
  {
    id: 1,
    name: "Dr. Sarah Mwangi",
    email: "sarah.mwangi@nairobi.hospital",
    role: "doctor",
    careProvider: "Nairobi Hospital",
    licenseStatus: "verified",
    licenseNumber: "DOC/2024/001",
    registrationBoard: "KMPDC",
    lastLogin: "2024-06-24 14:30",
    status: "active"
  },
  {
    id: 2,
    name: "John Kiprotich",
    email: "j.kiprotich@agakhan.org",
    role: "pharmacist",
    careProvider: "Aga Khan Hospital",
    licenseStatus: "pending",
    licenseNumber: "PHARM/2024/045",
    registrationBoard: "PPB",
    lastLogin: "2024-06-24 09:15",
    status: "active"
  },
  {
    id: 3,
    name: "Grace Mutindi",
    email: "g.mutindi@caremanager.co.ke",
    role: "care-manager",
    careProvider: "Independent",
    licenseStatus: "not_required",
    licenseNumber: "N/A",
    registrationBoard: "N/A",
    lastLogin: "2024-06-23 16:45",
    status: "active"
  },
  {
    id: 4,
    name: "Dr. Michael Ochieng",
    email: "m.ochieng@mtrh.go.ke",
    role: "doctor",
    careProvider: "Moi Teaching Hospital",
    licenseStatus: "expired",
    licenseNumber: "DOC/2023/089",
    registrationBoard: "KMPDC",
    lastLogin: "2024-06-20 11:20",
    status: "suspended"
  }
];

const mockCareProviders = [
  {
    id: 1,
    name: "Nairobi Hospital",
    domain: "nairobi.hospital",
    type: "Private Hospital",
    location: "Nairobi",
    compliance: "excellent",
    activeUsers: 45,
    totalClaims: 1250,
    approvalRate: 94.5,
    lastActivity: "2024-06-24 15:30",
    accreditation: "JCI Accredited"
  },
  {
    id: 2,
    name: "Aga Khan Hospital",
    domain: "agakhan.org",
    type: "Private Hospital",
    location: "Nairobi",
    compliance: "good",
    activeUsers: 38,
    totalClaims: 980,
    approvalRate: 91.2,
    lastActivity: "2024-06-24 14:15",
    accreditation: "ISO 9001"
  },
  {
    id: 3,
    name: "Kenyatta Hospital",
    domain: "knh.or.ke",
    type: "Public Hospital",
    location: "Nairobi",
    compliance: "average",
    activeUsers: 125,
    totalClaims: 2100,
    approvalRate: 87.8,
    lastActivity: "2024-06-24 13:45",
    accreditation: "COHSASA"
  }
];

const mockSystemHealth = {
  database: { status: "healthy", responseTime: "12ms", uptime: "99.9%" },
  intelligenceEngine: { status: "healthy", responseTime: "340ms", uptime: "99.7%" },
  blockchain: { status: "warning", responseTime: "1200ms", uptime: "98.5%" },
  lastUpdate: "2024-06-24 15:32:45"
};

// Domain mapping for auto-detection
const careProviderDomains = {
  "nairobi.hospital": "Nairobi Hospital",
  "agakhan.org": "Aga Khan Hospital", 
  "knh.or.ke": "Kenyatta Hospital",
  "mtrh.go.ke": "Moi Teaching Hospital",
  "gertrudes.org": "Gertrudes Children's Hospital"
};

export default function ModernAdminDashboard() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [licenseTestForm, setLicenseTestForm] = useState({
    regNumber: "",
    cadre: "doctor"
  });
  const [licenseTestResult, setLicenseTestResult] = useState(null);
  const [isTestingLicense, setIsTestingLicense] = useState(false);

  // Mock user data for demo purposes
  const user = {
    id: 1,
    username: "admin",
    email: "admin@erlessed.com",
    name: "System Administrator",
    role: "admin",
    premiumAccess: true
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLicenseStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'not_required': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.careProvider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleLicenseTest = async () => {
    setIsTestingLicense(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock license validation result
      const mockResult = {
        regNumber: licenseTestForm.regNumber,
        cadre: licenseTestForm.cadre,
        status: "verified",
        practitionerName: "Dr. John Doe",
        licenseExpiry: "2025-12-31",
        registrationBoard: licenseTestForm.cadre === "doctor" ? "KMPDC" : "PPB",
        specialization: "General Practice",
        isActive: true
      };
      
      setLicenseTestResult(mockResult);
      setIsTestingLicense(false);
    }, 2000);
  };

  const detectCareProvider = (email: string) => {
    const domain = email.split('@')[1];
    return careProviderDomains[domain] || "Independent";
  };

  return (
    <SharedLayout 
      user={user} 
      sidebarItems={sidebarItems}
      className="min-h-screen bg-gray-50"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">System management and oversight</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Audit Logs
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Settings className="h-4 w-4 mr-2" />
              Global Settings
            </Button>
          </div>
        </div>

        {/* System Health Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getHealthStatusIcon(mockSystemHealth.database.status)}
                  <div>
                    <p className="font-medium">Database</p>
                    <p className="text-sm text-gray-600">{mockSystemHealth.database.responseTime}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{mockSystemHealth.database.uptime}</p>
                  <p className="text-xs text-gray-500">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getHealthStatusIcon(mockSystemHealth.intelligenceEngine.status)}
                  <div>
                    <p className="font-medium">Intelligence Engine</p>
                    <p className="text-sm text-gray-600">{mockSystemHealth.intelligenceEngine.responseTime}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{mockSystemHealth.intelligenceEngine.uptime}</p>
                  <p className="text-xs text-gray-500">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getHealthStatusIcon(mockSystemHealth.blockchain.status)}
                  <div>
                    <p className="font-medium">Blockchain Ledger</p>
                    <p className="text-sm text-gray-600">{mockSystemHealth.blockchain.responseTime}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{mockSystemHealth.blockchain.uptime}</p>
                  <p className="text-xs text-gray-500">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="providers">Care Providers</TabsTrigger>
            <TabsTrigger value="licenses">License Validation</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span>User Management</span>
                    </CardTitle>
                    <CardDescription>
                      Manage user accounts, roles, and license verification status
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="pharmacist">Pharmacist</SelectItem>
                        <SelectItem value="care-manager">Care Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Care Provider</TableHead>
                      <TableHead>License Status</TableHead>
                      <TableHead>Registration Board</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>{user.careProvider}</TableCell>
                        <TableCell>
                          <Badge className={getLicenseStatusColor(user.licenseStatus)}>
                            {user.licenseStatus.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.registrationBoard}</TableCell>
                        <TableCell className="text-sm text-gray-600">{user.lastLogin}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
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

          {/* Care Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockCareProviders.map((provider) => (
                <Card key={provider.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <CardDescription>{provider.type} • {provider.location}</CardDescription>
                      </div>
                      <Badge className={`${getComplianceColor(provider.compliance)} bg-opacity-20`}>
                        {provider.compliance.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Domain</p>
                        <p className="font-medium">{provider.domain}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Accreditation</p>
                        <p className="font-medium">{provider.accreditation}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Active Users</p>
                        <p className="font-medium">{provider.activeUsers}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Claims</p>
                        <p className="font-medium">{provider.totalClaims}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Approval Rate</span>
                        <span className="text-sm font-medium">{provider.approvalRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-teal-600 h-2 rounded-full" 
                          style={{ width: `${provider.approvalRate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Last activity: {provider.lastActivity}</span>
                      <Button size="sm" variant="outline">
                        <Activity className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* License Validation Tab */}
          <TabsContent value="licenses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span>License Validation API Test</span>
                  </CardTitle>
                  <CardDescription>
                    Test the license validation system by entering registration details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="regNumber">Registration Number</Label>
                    <Input
                      id="regNumber"
                      placeholder="Enter registration number"
                      value={licenseTestForm.regNumber}
                      onChange={(e) => setLicenseTestForm(prev => ({
                        ...prev,
                        regNumber: e.target.value
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cadre">Professional Cadre</Label>
                    <Select 
                      value={licenseTestForm.cadre} 
                      onValueChange={(value) => setLicenseTestForm(prev => ({
                        ...prev,
                        cadre: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor">Doctor (KMPDC)</SelectItem>
                        <SelectItem value="pharmacist">Pharmacist (PPB)</SelectItem>
                        <SelectItem value="clinical_officer">Clinical Officer (COC)</SelectItem>
                        <SelectItem value="nurse">Nurse (NCK)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={handleLicenseTest}
                    disabled={!licenseTestForm.regNumber || isTestingLicense}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    {isTestingLicense ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Validate License
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span>Validation Result</span>
                  </CardTitle>
                  <CardDescription>
                    License validation response from regulatory boards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {licenseTestResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-700">License Verified</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Practitioner</p>
                          <p className="font-medium">{licenseTestResult.practitionerName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Registration No.</p>
                          <p className="font-medium">{licenseTestResult.regNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Board</p>
                          <p className="font-medium">{licenseTestResult.registrationBoard}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Specialization</p>
                          <p className="font-medium">{licenseTestResult.specialization}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Expires</p>
                          <p className="font-medium">{licenseTestResult.licenseExpiry}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status</p>
                          <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Enter registration details and click validate to see results</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Domain Auto-Mapping Logic */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <span>Domain-Based Auto-Mapping</span>
                </CardTitle>
                <CardDescription>
                  Automatic care provider detection based on email domains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(careProviderDomains).map(([domain, provider]) => (
                    <div key={domain} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{domain}</p>
                        <p className="text-sm text-gray-600">{provider}</p>
                      </div>
                      <Link className="h-4 w-4 text-teal-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SharedLayout>
  );
}