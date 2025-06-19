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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Users, Building2, BarChart3, Bot, Shield, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { RegistrationValidator } from "@/components/registration-validator";

interface SystemUser {
  id: number;
  username: string;
  email: string;
  role: string;
  cadre?: string;
  careProvider?: {
    name: string;
    type: string;
  };
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface CareProvider {
  id: number;
  name: string;
  domain: string;
  type: string;
  branch?: string;
  address: string;
  licenseNumber: string;
  isActive: boolean;
  userCount: number;
  claimsCount: number;
  createdAt: string;
}

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalProviders: number;
  totalClaims: number;
  aiDecisions: number;
  fraudDetections: number;
  systemUptime: number;
  avgResponseTime: number;
}

interface AISettings {
  preAuthEnabled: boolean;
  fraudDetectionEnabled: boolean;
  prescriptionValidationEnabled: boolean;
  confidenceThreshold: number;
  autoApprovalThreshold: number;
  reviewThreshold: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<CareProvider | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "",
    careProviderId: ""
  });
  const [newProvider, setNewProvider] = useState({
    name: "",
    domain: "",
    type: "",
    address: "",
    licenseNumber: ""
  });

  // Fetch platform statistics
  const { data: platformStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => ({
      totalUsers: 1247,
      activeUsers: 892,
      totalProviders: 45,
      totalClaims: 15678,
      aiDecisions: 12543,
      fraudDetections: 89,
      systemUptime: 99.7,
      avgResponseTime: 120
    } as PlatformStats),
  });

  // Fetch system users
  const { data: systemUsers = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => [
      {
        id: 1,
        username: "dr.wilson",
        email: "sarah.wilson@aku.edu",
        role: "doctor",
        cadre: "General Practitioner",
        careProvider: {
          name: "Aga Khan University Hospital",
          type: "Hospital"
        },
        isVerified: true,
        lastLogin: "2024-06-18T08:30:00Z",
        createdAt: "2024-01-15T10:00:00Z"
      },
      {
        id: 2,
        username: "pharm.john",
        email: "john.doe@pharmacy.co.ke",
        role: "pharmacist",
        cadre: "Clinical Pharmacist",
        careProvider: {
          name: "Pharmacy Corporation",
          type: "Pharmacy Chain"
        },
        isVerified: true,
        lastLogin: "2024-06-18T09:15:00Z",
        createdAt: "2024-02-01T14:30:00Z"
      },
      {
        id: 3,
        username: "manager.jane",
        email: "jane.smith@carepoint.health",
        role: "care-manager",
        careProvider: {
          name: "Carepoint Medical Centers",
          type: "Clinic Network"
        },
        isVerified: true,
        lastLogin: "2024-06-17T16:45:00Z",
        createdAt: "2024-03-10T11:20:00Z"
      }
    ] as SystemUser[],
  });

  // Fetch care providers
  const { data: careProviders = [] } = useQuery({
    queryKey: ["/api/admin/providers"],
    queryFn: async () => [
      {
        id: 1,
        name: "Aga Khan University Hospital",
        domain: "aku.edu",
        type: "Hospital",
        branch: "Nairobi",
        address: "3rd Parklands Avenue, Nairobi",
        licenseNumber: "KMP-H-001",
        isActive: true,
        userCount: 145,
        claimsCount: 2340,
        createdAt: "2024-01-01T00:00:00Z"
      },
      {
        id: 2,
        name: "Kenyatta National Hospital",
        domain: "knh.or.ke",
        type: "Hospital",
        branch: "Nairobi",
        address: "Hospital Road, Nairobi",
        licenseNumber: "KMP-H-002",
        isActive: true,
        userCount: 234,
        claimsCount: 3456,
        createdAt: "2024-01-01T00:00:00Z"
      },
      {
        id: 3,
        name: "Carepoint Medical Centers",
        domain: "carepoint.health",
        type: "Clinic Network",
        address: "Multiple Locations",
        licenseNumber: "KMP-C-001",
        isActive: true,
        userCount: 89,
        claimsCount: 1234,
        createdAt: "2024-01-15T00:00:00Z"
      }
    ] as CareProvider[],
  });

  // Fetch AI settings
  const { data: aiSettings, refetch: refetchAISettings } = useQuery({
    queryKey: ["/api/admin/ai-settings"],
    queryFn: async () => ({
      preAuthEnabled: true,
      fraudDetectionEnabled: true,
      prescriptionValidationEnabled: true,
      confidenceThreshold: 75,
      autoApprovalThreshold: 90,
      reviewThreshold: 50
    } as AISettings),
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      return apiRequest("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user has been created successfully",
      });
      setNewUser({ username: "", email: "", role: "", careProviderId: "" });
      setShowAddUser(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const createProviderMutation = useMutation({
    mutationFn: async (providerData: typeof newProvider) => {
      return apiRequest("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(providerData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Provider Added",
        description: "New care provider has been added successfully",
      });
      setNewProvider({ name: "", domain: "", type: "", address: "", licenseNumber: "" });
      setShowAddProvider(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/providers"] });
    },
  });

  const updateAISettingsMutation = useMutation({
    mutationFn: async (settings: AISettings) => {
      return apiRequest("/api/admin/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "AI configuration has been updated successfully",
      });
      refetchAISettings();
    },
  });

  const toggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      await apiRequest(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      
      toast({
        title: "User Status Updated",
        description: `User has been ${isActive ? 'activated' : 'deactivated'}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      doctor: "bg-blue-100 text-blue-800",
      pharmacist: "bg-green-100 text-green-800",
      "care-manager": "bg-purple-100 text-purple-800",
      "front-office": "bg-yellow-100 text-yellow-800",
      insurer: "bg-red-100 text-red-800",
      admin: "bg-gray-100 text-gray-800"
    };
    return roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800";
  };

  const getProviderTypeBadge = (type: string) => {
    const typeColors = {
      Hospital: "bg-blue-100 text-blue-800",
      "Clinic Network": "bg-green-100 text-green-800",
      "Pharmacy Chain": "bg-purple-100 text-purple-800",
      Laboratory: "bg-yellow-100 text-yellow-800"
    };
    return typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage platform users, providers, and system configuration</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-teal-600 border-teal-200">
            <Shield className="w-4 h-4 mr-1" />
            Super Admin
          </Badge>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {platformStats?.totalUsers?.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  {platformStats?.activeUsers} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Care Providers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {platformStats?.totalProviders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Claims</p>
                <p className="text-2xl font-bold text-gray-900">
                  {platformStats?.totalClaims?.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Decisions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {platformStats?.aiDecisions?.toLocaleString()}
                </p>
                <p className="text-xs text-orange-600">
                  {platformStats?.fraudDetections} fraud alerts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="providers">Care Providers</TabsTrigger>
          <TabsTrigger value="registration">License Validation</TabsTrigger>
          <TabsTrigger value="ai-config">AI Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">System Uptime</span>
                  <span className="font-semibold text-green-600">
                    {platformStats?.systemUptime}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="font-semibold">
                    {platformStats?.avgResponseTime}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Sessions</span>
                  <span className="font-semibold">
                    {platformStats?.activeUsers}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Export User Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Audit
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bot className="w-4 h-4 mr-2" />
                  Test AI Models
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  System Users ({systemUsers.length})
                </div>
                <Button onClick={() => setShowAddUser(true)} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add User
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemUsers.map((user) => (
                  <Card key={user.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{user.username}</h3>
                            <p className="text-gray-600">{user.email}</p>
                            <p className="text-sm text-gray-500">
                              {user.careProvider?.name} • {user.cadre}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={getRoleBadge(user.role)}>
                            {user.role.replace('-', ' ')}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            {user.isVerified ? (
                              <Badge className="bg-green-100 text-green-800">Verified</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Created:</span>
                          <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="font-medium">Last Login:</span>
                          <div>
                            {user.lastLogin 
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : "Never"
                            }
                          </div>
                        </div>
                        <div className="text-right">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add User Form */}
          {showAddUser && (
            <Card>
              <CardHeader>
                <CardTitle>Add New User</CardTitle>
                <CardDescription>Create a new system user account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor">Doctor/Clinician</SelectItem>
                        <SelectItem value="pharmacist">Pharmacist</SelectItem>
                        <SelectItem value="care-manager">Care Manager</SelectItem>
                        <SelectItem value="front-office">Front Office</SelectItem>
                        <SelectItem value="insurer">Insurer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="careProvider">Care Provider</Label>
                    <Select
                      value={newUser.careProviderId}
                      onValueChange={(value) => setNewUser({ ...newUser, careProviderId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {careProviders.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id.toString()}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddUser(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createUserMutation.mutate(newUser)}
                    disabled={createUserMutation.isPending}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Care Providers ({careProviders.length})
                </div>
                <Button onClick={() => setShowAddProvider(true)} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Provider
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {careProviders.map((provider) => (
                  <Card key={provider.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{provider.name}</h3>
                            <p className="text-gray-600">@{provider.domain}</p>
                            <p className="text-sm text-gray-500">{provider.address}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={getProviderTypeBadge(provider.type)}>
                            {provider.type}
                          </Badge>
                          <div className="text-sm text-gray-600">
                            License: {provider.licenseNumber}
                          </div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Users:</span>
                          <div className="text-lg font-semibold">{provider.userCount}</div>
                        </div>
                        <div>
                          <span className="font-medium">Claims:</span>
                          <div className="text-lg font-semibold">{provider.claimsCount}</div>
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <div>
                            {provider.isActive ? (
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Provider Form */}
          {showAddProvider && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Care Provider</CardTitle>
                <CardDescription>Register a new healthcare provider</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="providerName">Provider Name</Label>
                    <Input
                      id="providerName"
                      value={newProvider.name}
                      onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="domain">Email Domain</Label>
                    <Input
                      id="domain"
                      value={newProvider.domain}
                      onChange={(e) => setNewProvider({ ...newProvider, domain: e.target.value })}
                      placeholder="example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="providerType">Provider Type</Label>
                    <Select
                      value={newProvider.type}
                      onValueChange={(value) => setNewProvider({ ...newProvider, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hospital">Hospital</SelectItem>
                        <SelectItem value="Clinic Network">Clinic Network</SelectItem>
                        <SelectItem value="Pharmacy Chain">Pharmacy Chain</SelectItem>
                        <SelectItem value="Laboratory">Laboratory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={newProvider.licenseNumber}
                      onChange={(e) => setNewProvider({ ...newProvider, licenseNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={newProvider.address}
                    onChange={(e) => setNewProvider({ ...newProvider, address: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddProvider(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createProviderMutation.mutate(newProvider)}
                    disabled={createProviderMutation.isPending}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {createProviderMutation.isPending ? "Adding..." : "Add Provider"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="registration" className="space-y-4">
          <RegistrationValidator />
        </TabsContent>

        <TabsContent value="ai-config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="w-5 h-5 mr-2" />
                AI Features Configuration
              </CardTitle>
              <CardDescription>
                Configure AI-powered features and decision thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {aiSettings && (
                <>
                  {/* Feature Toggles */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Feature Control</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="preauth">Preauthorization AI</Label>
                          <p className="text-sm text-gray-600">
                            Enable AI-assisted preauthorization decisions
                          </p>
                        </div>
                        <Switch
                          id="preauth"
                          checked={aiSettings.preAuthEnabled}
                          onCheckedChange={(checked) => {
                            updateAISettingsMutation.mutate({
                              ...aiSettings,
                              preAuthEnabled: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="fraud">Fraud Detection</Label>
                          <p className="text-sm text-gray-600">
                            Enable AI-powered fraud pattern detection
                          </p>
                        </div>
                        <Switch
                          id="fraud"
                          checked={aiSettings.fraudDetectionEnabled}
                          onCheckedChange={(checked) => {
                            updateAISettingsMutation.mutate({
                              ...aiSettings,
                              fraudDetectionEnabled: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="prescription">Prescription Validation</Label>
                          <p className="text-sm text-gray-600">
                            Enable AI prescription safety checks
                          </p>
                        </div>
                        <Switch
                          id="prescription"
                          checked={aiSettings.prescriptionValidationEnabled}
                          onCheckedChange={(checked) => {
                            updateAISettingsMutation.mutate({
                              ...aiSettings,
                              prescriptionValidationEnabled: checked
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Threshold Settings */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Decision Thresholds</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="confidence">Minimum Confidence (%)</Label>
                        <Input
                          id="confidence"
                          type="number"
                          min="0"
                          max="100"
                          value={aiSettings.confidenceThreshold}
                          onChange={(e) => {
                            updateAISettingsMutation.mutate({
                              ...aiSettings,
                              confidenceThreshold: parseInt(e.target.value) || 75
                            });
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum confidence for AI decisions
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="autoApproval">Auto-Approval Threshold (%)</Label>
                        <Input
                          id="autoApproval"
                          type="number"
                          min="0"
                          max="100"
                          value={aiSettings.autoApprovalThreshold}
                          onChange={(e) => {
                            updateAISettingsMutation.mutate({
                              ...aiSettings,
                              autoApprovalThreshold: parseInt(e.target.value) || 90
                            });
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Auto-approve above this confidence
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="review">Human Review Threshold (%)</Label>
                        <Input
                          id="review"
                          type="number"
                          min="0"
                          max="100"
                          value={aiSettings.reviewThreshold}
                          onChange={(e) => {
                            updateAISettingsMutation.mutate({
                              ...aiSettings,
                              reviewThreshold: parseInt(e.target.value) || 50
                            });
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Require human review below this
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Test AI Features */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">AI Model Testing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="justify-start">
                        <Bot className="w-4 h-4 mr-2" />
                        Test Preauthorization Model
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Test Fraud Detection
                      </Button>
                    </div>
                  </div>
                </>
              )}
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