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
import { SharedLayout } from "@/components/layout/shared-layout";
import { 
  Settings, Users, Building2, BarChart3, Bot, Shield, Plus, Edit, 
  Trash2, Search, Filter, CheckCircle, XCircle, AlertTriangle,
  Activity, TrendingUp, Database, Server, Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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
  systemUptime: number;
  apiRequests: number;
}

interface AIConfiguration {
  preauthorizationThreshold: number;
  fraudDetectionSensitivity: number;
  autoApprovalLimit: number;
  enableChainOfThought: boolean;
  enableFraudDetection: boolean;
  enablePrescriptionValidation: boolean;
}

export default function ModernAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProvider, setSelectedProvider] = useState<CareProvider | null>(null);

  // Mock data
  const platformStats: PlatformStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalProviders: 45,
    totalClaims: 15678,
    systemUptime: 99.8,
    apiRequests: 2456789
  };

  const systemUsers: SystemUser[] = [
    {
      id: 1,
      username: "dr.mwangi",
      email: "james.mwangi@aku.edu",
      role: "doctor",
      cadre: "General Practitioner",
      careProvider: {
        name: "Aga Khan Hospital",
        type: "Tertiary Hospital"
      },
      isVerified: true,
      lastLogin: "2024-06-20T08:30:00Z",
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 2,
      username: "pharmacy.knh",
      email: "pharmacy@knh.or.ke",
      role: "pharmacist",
      cadre: "Senior Pharmacist",
      careProvider: {
        name: "Kenyatta National Hospital",
        type: "Public Hospital"
      },
      isVerified: true,
      lastLogin: "2024-06-20T07:45:00Z",
      createdAt: "2024-02-01T09:30:00Z"
    },
    {
      id: 3,
      username: "care.manager",
      email: "manager@nhif.or.ke",
      role: "care-manager",
      isVerified: false,
      createdAt: "2024-06-19T14:20:00Z"
    }
  ];

  const careProviders: CareProvider[] = [
    {
      id: 1,
      name: "Aga Khan Hospital",
      domain: "aku.edu",
      type: "Tertiary Hospital",
      address: "3rd Parklands Avenue, Nairobi",
      licenseNumber: "MOH-001-2024",
      isActive: true,
      userCount: 156,
      claimsCount: 4567,
      createdAt: "2024-01-01T00:00:00Z"
    },
    {
      id: 2,
      name: "Kenyatta National Hospital",
      domain: "knh.or.ke",
      type: "Public Hospital",
      address: "Hospital Road, Upper Hill, Nairobi",
      licenseNumber: "MOH-002-2024",
      isActive: true,
      userCount: 298,
      claimsCount: 8934,
      createdAt: "2024-01-01T00:00:00Z"
    },
    {
      id: 3,
      name: "Nairobi Hospital",
      domain: "nairobi-hospital.org",
      type: "Private Hospital",
      address: "Argwings Kodhek Road, Nairobi",
      licenseNumber: "MOH-003-2024",
      isActive: true,
      userCount: 87,
      claimsCount: 2145,
      createdAt: "2024-01-01T00:00:00Z"
    }
  ];

  const [aiConfig, setAiConfig] = useState<AIConfiguration>({
    preauthorizationThreshold: 75,
    fraudDetectionSensitivity: 80,
    autoApprovalLimit: 50000,
    enableChainOfThought: true,
    enableFraudDetection: true,
    enablePrescriptionValidation: true
  });

  const sidebarItems = [
    { path: "/admin", icon: <BarChart3 className="h-5 w-5" />, label: "Overview" },
    { path: "/admin/users", icon: <Users className="h-5 w-5" />, label: "User Management", badge: systemUsers.length.toString() },
    { path: "/admin/providers", icon: <Building2 className="h-5 w-5" />, label: "Care Providers" },
    { path: "/admin/ai-config", icon: <Bot className="h-5 w-5" />, label: "System Configuration" },
    { path: "/admin/monitoring", icon: <Activity className="h-5 w-5" />, label: "System Health" },
    { path: "/admin/security", icon: <Shield className="h-5 w-5" />, label: "Security & Audit" },
  ];

  const getVerificationColor = (isVerified: boolean) => {
    return isVerified 
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-orange-100 text-orange-800 border-orange-200";
  };

  const getRoleColor = (role: string) => {
    const colors = {
      doctor: "bg-blue-100 text-blue-800",
      pharmacist: "bg-green-100 text-green-800",
      "care-manager": "bg-purple-100 text-purple-800",
      insurer: "bg-orange-100 text-orange-800",
      patient: "bg-pink-100 text-pink-800",
      admin: "bg-red-100 text-red-800",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const updateAIConfig = async (config: Partial<AIConfiguration>) => {
    setAiConfig(prev => ({ ...prev, ...config }));
    toast({
      title: "Configuration Updated",
      description: "System configuration has been saved successfully",
    });
  };

  return (
    <SharedLayout sidebarItems={sidebarItems} title="Admin Dashboard">
      <div className="space-y-6">
        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{platformStats.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{platformStats.totalProviders}</p>
                  <p className="text-sm text-muted-foreground">Care Providers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{(platformStats.totalClaims / 1000).toFixed(1)}K</p>
                  <p className="text-sm text-muted-foreground">Total Claims</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{platformStats.systemUptime}%</p>
                  <p className="text-sm text-muted-foreground">System Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="providers">Care Providers</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5" />
                    <span>System Health</span>
                  </CardTitle>
                  <CardDescription>Real-time system performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Response Time</span>
                      <Badge className="bg-green-100 text-green-800">125ms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Connections</span>
                      <Badge className="bg-blue-100 text-blue-800">12/50</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Memory Usage</span>
                      <Badge className="bg-orange-100 text-orange-800">68%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Sessions</span>
                      <Badge className="bg-purple-100 text-purple-800">{platformStats.activeUsers}</Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Activity</h4>
                    <div className="text-sm space-y-1">
                      <p>• 15 new users registered today</p>
                      <p>• 234 claims processed in the last hour</p>
                      <p>• 2 system alerts resolved</p>
                      <p>• Database backup completed successfully</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Registration Validator */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional License Validator</CardTitle>
                  <CardDescription>Test Kenya regulatory board integration</CardDescription>
                </CardHeader>
                <CardContent>
                  <RegistrationValidator />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">User Management</h2>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-4 font-medium">User</th>
                        <th className="p-4 font-medium">Role</th>
                        <th className="p-4 font-medium">Provider</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Last Login</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemUsers.map((user) => (
                        <tr key={user.id} className="border-b last:border-b-0 hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{user.username}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              {user.cadre && (
                                <p className="text-xs text-muted-foreground">{user.cadre}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getRoleColor(user.role)}>
                              {user.role.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {user.careProvider ? (
                              <div>
                                <p className="text-sm font-medium">{user.careProvider.name}</p>
                                <p className="text-xs text-muted-foreground">{user.careProvider.type}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge className={getVerificationColor(user.isVerified)}>
                              {user.isVerified ? 'VERIFIED' : 'PENDING'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                            </p>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {careProviders.map((provider) => (
                <Card key={provider.id} className="card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{provider.name}</span>
                      <Badge className={provider.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {provider.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{provider.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Domain:</span>
                        <span className="font-medium">{provider.domain}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">License:</span>
                        <span className="font-medium">{provider.licenseNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Users:</span>
                        <span className="font-medium">{provider.userCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Claims:</span>
                        <span className="font-medium">{provider.claimsCount.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <p>{provider.address}</p>
                      <p>Registered: {new Date(provider.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Smart Decision Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="h-5 w-5" />
                    <span>Smart Decision Configuration</span>
                  </CardTitle>
                  <CardDescription>Configure automated decision-making thresholds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="preauth-threshold">Preauthorization Confidence Threshold</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <Input
                          id="preauth-threshold"
                          type="range"
                          min="0"
                          max="100"
                          value={aiConfig.preauthorizationThreshold}
                          onChange={(e) => updateAIConfig({ preauthorizationThreshold: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="w-16 text-sm font-medium">{aiConfig.preauthorizationThreshold}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum confidence required for automatic approval
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="fraud-sensitivity">Fraud Detection Sensitivity</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <Input
                          id="fraud-sensitivity"
                          type="range"
                          min="0"
                          max="100"
                          value={aiConfig.fraudDetectionSensitivity}
                          onChange={(e) => updateAIConfig({ fraudDetectionSensitivity: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="w-16 text-sm font-medium">{aiConfig.fraudDetectionSensitivity}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Higher values increase fraud detection sensitivity
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="auto-approval-limit">Auto-approval Limit (KES)</Label>
                      <Input
                        id="auto-approval-limit"
                        type="number"
                        value={aiConfig.autoApprovalLimit}
                        onChange={(e) => updateAIConfig({ autoApprovalLimit: parseInt(e.target.value) })}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum claim amount for automatic approval
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Feature Toggles</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Chain-of-Thought Reasoning</p>
                        <p className="text-sm text-muted-foreground">Show detailed reasoning for decisions</p>
                      </div>
                      <Switch
                        checked={aiConfig.enableChainOfThought}
                        onCheckedChange={(checked) => updateAIConfig({ enableChainOfThought: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Fraud Detection</p>
                        <p className="text-sm text-muted-foreground">Enable pattern-based fraud detection</p>
                      </div>
                      <Switch
                        checked={aiConfig.enableFraudDetection}
                        onCheckedChange={(checked) => updateAIConfig({ enableFraudDetection: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Prescription Validation</p>
                        <p className="text-sm text-muted-foreground">Validate prescriptions for safety</p>
                      </div>
                      <Switch
                        checked={aiConfig.enablePrescriptionValidation}
                        onCheckedChange={(checked) => updateAIConfig({ enablePrescriptionValidation: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Monitoring */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>System Monitoring</span>
                  </CardTitle>
                  <CardDescription>Real-time system performance and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-xl">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Database Connection</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-xl">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">API Services</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-xl">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">Memory Usage</span>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">High</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-xl">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Backup Status</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Current</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Performance Metrics</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Avg Response Time:</span>
                        <span className="font-medium">125ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Requests/Hour:</span>
                        <span className="font-medium">12,456</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Rate:</span>
                        <span className="font-medium text-green-600">0.02%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Users:</span>
                        <span className="font-medium">{platformStats.activeUsers}</span>
                      </div>
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