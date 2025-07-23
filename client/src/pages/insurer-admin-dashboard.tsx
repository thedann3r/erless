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
  Shield, TrendingUp, AlertTriangle, DollarSign, Users, 
  Settings, CheckCircle, XCircle, Search, Eye, Download,
  UserPlus, FileText, BarChart3, Globe, Key, Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SystemMetric {
  id: string;
  name: string;
  value: string | number;
  change: string;
  status: "up" | "down" | "stable";
  icon: string;
}

interface UserAccount {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "claims_manager" | "care_manager" | "insurer_admin";
  department: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface PolicyConfiguration {
  id: number;
  name: string;
  category: string;
  currentValue: string;
  recommendedValue?: string;
  description: string;
  lastUpdated: string;
  status: "active" | "pending" | "inactive";
}

export default function InsurerAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Mock system metrics
  const systemMetrics: SystemMetric[] = [
    { id: "1", name: "Total Active Policies", value: "45,678", change: "+2.3%", status: "up", icon: "shield" },
    { id: "2", name: "Claims Processing Rate", value: "97.8%", change: "+1.2%", status: "up", icon: "trending-up" },
    { id: "3", name: "System Uptime", value: "99.97%", change: "stable", status: "stable", icon: "activity" },
    { id: "4", name: "User Satisfaction", value: "4.6/5", change: "+0.2", status: "up", icon: "users" }
  ];

  // Mock user accounts
  const mockUsers: UserAccount[] = [
    {
      id: 1,
      username: "claims_manager1",
      email: "claims.manager@cic.co.ke",
      firstName: "Joseph",
      lastName: "Kamau",
      role: "claims_manager",
      department: "Claims Processing",
      isActive: true,
      lastLogin: "2024-01-15T10:30:00Z",
      createdAt: "2024-01-01T00:00:00Z"
    },
    {
      id: 2,
      username: "care_manager1", 
      email: "care.manager@cic.co.ke",
      firstName: "Grace",
      lastName: "Wanjiku",
      role: "care_manager",
      department: "Care Management",
      isActive: true,
      lastLogin: "2024-01-14T15:45:00Z",
      createdAt: "2024-01-01T00:00:00Z"
    }
  ];

  // Mock policy configurations
  const mockPolicies: PolicyConfiguration[] = [
    {
      id: 1,
      name: "Auto-approval Threshold",
      category: "Claims Processing",
      currentValue: "KES 5,000",
      recommendedValue: "KES 8,000",
      description: "Maximum claim amount for automatic approval",
      lastUpdated: "2024-01-10",
      status: "active"
    },
    {
      id: 2,
      name: "High-risk Patient Threshold",
      category: "Care Management",
      currentValue: "75%",
      recommendedValue: "70%",
      description: "Risk score threshold for intervention alerts",
      lastUpdated: "2024-01-08",
      status: "pending"
    }
  ];

  const handleCreateUser = async () => {
    toast({
      title: "User Account Created",
      description: "New user account has been created successfully.",
    });
  };

  const handleToggleUserStatus = async (userId: number) => {
    toast({
      title: "User Status Updated",
      description: "User account status has been updated.",
    });
  };

  const handleUpdatePolicy = async (policyId: number) => {
    toast({
      title: "Policy Updated",
      description: "Policy configuration has been updated successfully.",
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "claims_manager":
        return <Badge className="bg-blue-500">Claims Manager</Badge>;
      case "care_manager":
        return <Badge className="bg-green-500">Care Manager</Badge>;
      case "insurer_admin":
        return <Badge className="bg-purple-500">Admin</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <SharedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Insurer Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">System administration and configuration for {user?.insurerCompany || "your organization"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              System Report
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* System Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {systemMetrics.map((metric) => (
            <Card key={metric.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs ${
                  metric.status === 'up' ? 'text-green-600' : 
                  metric.status === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.change} from last period
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="policies">Policy Configuration</TabsTrigger>
            <TabsTrigger value="analytics">System Analytics</TabsTrigger>
            <TabsTrigger value="settings">Global Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Account Management</CardTitle>
                <CardDescription>Manage user accounts and permissions for your organization</CardDescription>
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="claims_manager">Claims Manager</SelectItem>
                      <SelectItem value="care_manager">Care Manager</SelectItem>
                      <SelectItem value="insurer_admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreateUser}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUsers.map((userAccount) => (
                    <div key={userAccount.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{userAccount.firstName} {userAccount.lastName}</h3>
                            {getRoleBadge(userAccount.role)}
                            <Badge className={userAccount.isActive ? "bg-green-500" : "bg-red-500"}>
                              {userAccount.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Username</p>
                              <p className="font-mono text-xs">{userAccount.username}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Email</p>
                              <p className="text-xs">{userAccount.email}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Department</p>
                              <p className="font-semibold">{userAccount.department}</p>  
                            </div>
                            <div>
                              <p className="text-gray-600">Last Login</p>
                              <p className="text-xs">
                                {userAccount.lastLogin 
                                  ? new Date(userAccount.lastLogin).toLocaleDateString()
                                  : "Never"
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(userAccount.id)}
                          >
                            {userAccount.isActive ? (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Policy Configuration</CardTitle>
                <CardDescription>Configure system policies and business rules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPolicies.map((policy) => (
                    <div key={policy.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{policy.name}</h3>
                            {getStatusBadge(policy.status)}
                            <Badge variant="outline">{policy.category}</Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600">{policy.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Current Value</p>
                              <p className="font-semibold">{policy.currentValue}</p>
                            </div>
                            {policy.recommendedValue && (
                              <div>
                                <p className="text-gray-600">Recommended</p>
                                <p className="font-semibold text-blue-600">{policy.recommendedValue}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-gray-600">Last Updated</p>
                              <p className="text-xs">{new Date(policy.lastUpdated).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdatePolicy(policy.id)}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                          {policy.recommendedValue && (
                            <Button size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Apply Recommended
                            </Button>
                          )}
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
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>CPU Usage (23%)</span>
                        <span>Normal</span>
                      </div>
                      <Progress value={23} className="w-full" />
                      
                      <div className="flex justify-between">
                        <span>Memory Usage (67%)</span>
                        <span>Good</span>
                      </div>
                      <Progress value={67} className="w-full" />
                      
                      <div className="flex justify-between">
                        <span>Database Performance (94%)</span>
                        <span>Excellent</span>
                      </div>
                      <Progress value={94} className="w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-8 text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                      <p>User activity analytics</p>
                      <p className="text-sm">Login patterns, feature usage, and performance metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>Global system settings and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="systemName">Organization Name</Label>
                    <Input id="systemName" value={user?.insurerCompany || "CIC Insurance"} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">System Timezone</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="africa/nairobi">Africa/Nairobi (EAT)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input id="sessionTimeout" type="number" placeholder="30" />
                  </div>
                  <Button>Save Configuration</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Security policies and access controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="passwordPolicy">Password Policy</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (8+ chars)</SelectItem>
                        <SelectItem value="strict">Strict (12+ chars, symbols)</SelectItem>
                        <SelectItem value="maximum">Maximum (16+ chars, complex)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mfaRequired">Multi-Factor Authentication</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="MFA requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="optional">Optional</SelectItem>
                        <SelectItem value="required">Required for all users</SelectItem>
                        <SelectItem value="admin-only">Required for admins only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiAccess">API Access</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="API access level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disabled">Disabled</SelectItem>
                        <SelectItem value="read-only">Read-only</SelectItem>
                        <SelectItem value="full">Full access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>Update Security Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SharedLayout>
  );
}