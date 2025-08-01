import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, FileText, Users, Settings, TrendingUp, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface Policy {
  id: number;
  policyNumber: string;
  policyName: string;
  policyType: string;
  effectiveDate: string;
  expiryDate: string;
  premiumAmount: string;
  corporateClient: string;
  isActive: boolean;
  createdAt: string;
  insurerName: string;
  insurerCode: string;
}

interface ClaimForm {
  id: number;
  formName: string;
  formType: string;
  isActive: boolean;
  version: string;
  createdAt: string;
  insurerName: string;
}

interface EmployerGroup {
  id: number;
  groupName: string;
  groupCode: string;
  corporateClient: string;
  memberCount: number;
  isActive: boolean;
  effectiveDate: string;
  expiryDate: string;
  assignedSchemes: number[];
}

export default function InsurerAdminDashboard() {
  const { user } = useAuth();
  const [selectedInsurer, setSelectedInsurer] = useState<string>("1");
  
  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ["/api/policy-management/policies", selectedInsurer],
    queryFn: () => fetch(`/api/policy-management/policies?insurerId=${selectedInsurer}`).then(res => res.json()),
    enabled: !!selectedInsurer
  });

  const { data: claimForms, isLoading: formsLoading } = useQuery({
    queryKey: ["/api/policy-management/claim-forms", selectedInsurer],
    queryFn: () => fetch(`/api/policy-management/claim-forms?insurerId=${selectedInsurer}`).then(res => res.json()),
    enabled: !!selectedInsurer
  });

  const { data: employerGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ["/api/policy-management/employer-groups", selectedInsurer],
    queryFn: () => fetch(`/api/policy-management/employer-groups?insurerId=${selectedInsurer}`).then(res => res.json()),
    enabled: !!selectedInsurer
  });

  const { data: preauthRules, isLoading: rulesLoading } = useQuery({
    queryKey: ["/api/policy-management/preauth-rules", selectedInsurer],
    queryFn: () => fetch(`/api/policy-management/preauth-rules?insurerId=${selectedInsurer}`).then(res => res.json()),
    enabled: !!selectedInsurer
  });

  // Calculate dashboard metrics
  const activePolicies = policies?.filter((p: Policy) => p.isActive)?.length || 0;
  const totalMembers = employerGroups?.reduce((sum: number, group: EmployerGroup) => sum + group.memberCount, 0) || 0;
  const activeClaimForms = claimForms?.filter((f: ClaimForm) => f.isActive)?.length || 0;
  const totalPreauthRules = preauthRules?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Insurer Administrator Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Comprehensive policy and scheme management for {user?.insurerCompany || 'Insurance Company'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedInsurer} onValueChange={setSelectedInsurer}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Insurer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Social Health Authority</SelectItem>
                <SelectItem value="2">CIC Insurance Group</SelectItem>
                <SelectItem value="3">AAR Insurance Kenya</SelectItem>
                <SelectItem value="4">Jubilee Insurance</SelectItem>
                <SelectItem value="5">AON Minet Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
              <Building2 className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">{activePolicies}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                +2 new this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalMembers.toLocaleString()}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Across all employer groups
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claim Forms</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeClaimForms}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Active form templates
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preauth Rules</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalPreauthRules}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Active authorization rules
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="policies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="schemes">Schemes</TabsTrigger>
            <TabsTrigger value="forms">Claim Forms</TabsTrigger>
            <TabsTrigger value="groups">Employer Groups</TabsTrigger>
            <TabsTrigger value="preauth">Preauth Rules</TabsTrigger>
          </TabsList>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Policy Management</h2>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Building2 className="w-4 h-4 mr-2" />
                Create New Policy
              </Button>
            </div>

            <div className="grid gap-6">
              {policiesLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">Loading policies...</div>
                  </CardContent>
                </Card>
              ) : (
                policies?.map((policy: Policy) => (
                  <Card key={policy.id} className="bg-white dark:bg-gray-800">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{policy.policyName}</CardTitle>
                          <CardDescription>
                            Policy #{policy.policyNumber} • {policy.policyType}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={policy.isActive ? "default" : "secondary"}>
                            {policy.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Corporate Client</p>
                          <p className="text-sm">{policy.corporateClient || "Individual Policy"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Effective Period</p>
                          <p className="text-sm">
                            {new Date(policy.effectiveDate).toLocaleDateString()} - {new Date(policy.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Premium Amount</p>
                          <p className="text-sm font-semibold text-teal-600">
                            {policy.premiumAmount ? `KES ${parseFloat(policy.premiumAmount).toLocaleString()}` : "N/A"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Claim Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Claim Form Templates</h2>
              <Button className="bg-green-600 hover:bg-green-700">
                <FileText className="w-4 h-4 mr-2" />
                Create New Form
              </Button>
            </div>

            <div className="grid gap-4">
              {formsLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">Loading claim forms...</div>
                  </CardContent>
                </Card>
              ) : (
                claimForms?.map((form: ClaimForm) => (
                  <Card key={form.id} className="bg-white dark:bg-gray-800">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{form.formName}</CardTitle>
                          <CardDescription>
                            {form.formType} • Version {form.version}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={form.isActive ? "default" : "secondary"}>
                            {form.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Edit Template
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Created: {new Date(form.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Button variant="ghost" size="sm">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Usage Statistics
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Employer Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Employer Group Management</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Users className="w-4 h-4 mr-2" />
                Add Employer Group
              </Button>
            </div>

            <div className="grid gap-4">
              {groupsLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">Loading employer groups...</div>
                  </CardContent>
                </Card>
              ) : (
                employerGroups?.map((group: EmployerGroup) => (
                  <Card key={group.id} className="bg-white dark:bg-gray-800">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{group.groupName}</CardTitle>
                          <CardDescription>
                            {group.corporateClient} • Code: {group.groupCode}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={group.isActive ? "default" : "secondary"}>
                            {group.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Member Count</p>
                          <p className="text-xl font-semibold text-blue-600">{group.memberCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contract Period</p>
                          <p className="text-sm">
                            {new Date(group.effectiveDate).toLocaleDateString()} - 
                            {group.expiryDate ? new Date(group.expiryDate).toLocaleDateString() : "Ongoing"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned Schemes</p>
                          <p className="text-sm">{group.assignedSchemes?.length || 0} schemes assigned</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Preauth Rules Tab */}
          <TabsContent value="preauth" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preauthorization Rules</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Shield className="w-4 h-4 mr-2" />
                Create New Rule
              </Button>
            </div>

            <div className="grid gap-4">
              {rulesLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">Loading preauth rules...</div>
                  </CardContent>
                </Card>
              ) : (
                preauthRules?.map((rule: any) => (
                  <Card key={rule.id} className="bg-white dark:bg-gray-800">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{rule.serviceName}</CardTitle>
                          <CardDescription>
                            {rule.serviceType} • Code: {rule.serviceCode || "N/A"}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={rule.requiresPreauth ? "destructive" : "default"}>
                            {rule.requiresPreauth ? "Preauth Required" : "Auto Approved"}
                          </Badge>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Auto Approval Threshold</p>
                          <p className="text-sm font-semibold text-green-600">
                            {rule.autoApprovalThreshold ? `KES ${parseFloat(rule.autoApprovalThreshold).toLocaleString()}` : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maximum Amount</p>
                          <p className="text-sm font-semibold text-red-600">
                            {rule.maxAmount ? `KES ${parseFloat(rule.maxAmount).toLocaleString()}` : "No Limit"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Frequency Limit</p>
                          <p className="text-sm">{rule.frequencyLimit || "No Restriction"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Schemes Tab */}
          <TabsContent value="schemes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Policy Schemes</h2>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <TrendingUp className="w-4 h-4 mr-2" />
                Create New Scheme
              </Button>
            </div>

            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a policy to view and manage its schemes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}