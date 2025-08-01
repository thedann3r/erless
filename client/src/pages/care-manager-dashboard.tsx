import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, Users, Calendar, TrendingUp, AlertCircle, CheckCircle, 
  Activity, FileText, Shield, Clock, Phone, Mail 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface CarePlan {
  id: number;
  planName: string;
  planDescription: string;
  healthConditions: string[];
  treatmentGoals: any;
  assignedServices: any;
  priority: string;
  status: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate: string;
  notes: string;
  createdAt: string;
  patientFirstName: string;
  patientLastName: string;
  patientId: string;
  policyName: string;
  insurerName: string;
}

interface PolicyInsight {
  policyId: number;
  policyName: string;
  memberNumber: string;
  memberType: string;
  relationship: string;
  enrollmentDate: string;
  effectiveDate: string;
  terminationDate: string;
  insurerName: string;
  insurerCode: string;
  schemeName: string;
  schemeCode: string;
  annualLimit: string;
  perVisitLimit: string;
  copayPercentage: string;
}

export default function CareManagerDashboard() {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  
  const { data: carePlans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/policy-management/care-plans"],
    queryFn: () => fetch("/api/policy-management/care-plans").then(res => res.json())
  });

  const { data: policyInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/policy-management/policy-insights", selectedPatient],
    queryFn: () => fetch(`/api/policy-management/policy-insights?patientId=${selectedPatient}`).then(res => res.json()),
    enabled: !!selectedPatient
  });

  // Filter care plans by priority
  const filteredPlans = carePlans?.filter((plan: CarePlan) => {
    if (priorityFilter === "all") return true;
    return plan.priority === priorityFilter;
  });

  // Calculate dashboard metrics
  const totalCarePlans = carePlans?.length || 0;
  const activePlans = carePlans?.filter((p: CarePlan) => p.status === "active")?.length || 0;
  const highPriorityPlans = carePlans?.filter((p: CarePlan) => p.priority === "high")?.length || 0;
  const completedPlans = carePlans?.filter((p: CarePlan) => p.status === "completed")?.length || 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
      case "medium": return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "low": return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
      default: return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
      case "completed": return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
      case "suspended": return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
      default: return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const calculatePlanProgress = (plan: CarePlan) => {
    const startDate = new Date(plan.startDate);
    const endDate = plan.expectedEndDate ? new Date(plan.expectedEndDate) : new Date();
    const currentDate = new Date();
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = currentDate.getTime() - startDate.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Care Manager Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Coordinated care planning and patient management for {user?.insurerCompany || 'Healthcare Network'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Care Plans</CardTitle>
              <Heart className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">{totalCarePlans}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Active care coordination
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activePlans}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Currently managed patients
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{highPriorityPlans}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Requiring immediate attention
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Plans</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{completedPlans}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Successfully concluded
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="care-plans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="care-plans">Care Plans</TabsTrigger>
            <TabsTrigger value="policy-insights">Policy Insights</TabsTrigger>
            <TabsTrigger value="patient-coordination">Patient Coordination</TabsTrigger>
          </TabsList>

          {/* Care Plans Tab */}
          <TabsContent value="care-plans" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Care Plans</h2>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Heart className="w-4 h-4 mr-2" />
                Create New Plan
              </Button>
            </div>

            <div className="grid gap-6">
              {plansLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">Loading care plans...</div>
                  </CardContent>
                </Card>
              ) : (
                filteredPlans?.map((plan: CarePlan) => (
                  <Card key={plan.id} className="bg-white dark:bg-gray-800">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{plan.planName}</CardTitle>
                          <CardDescription>
                            Patient: {plan.patientFirstName} {plan.patientLastName} • ID: {plan.patientId}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(plan.priority)}>
                            {plan.priority} Priority
                          </Badge>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Health Conditions */}
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Health Conditions</p>
                        <div className="flex flex-wrap gap-2">
                          {plan.healthConditions?.map((condition, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Plan Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plan Progress</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {Math.round(calculatePlanProgress(plan))}%
                          </p>
                        </div>
                        <Progress value={calculatePlanProgress(plan)} className="h-2" />
                      </div>

                      {/* Plan Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Start Date</p>
                          <p className="text-sm flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(plan.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expected End</p>
                          <p className="text-sm flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {plan.expectedEndDate ? new Date(plan.expectedEndDate).toLocaleDateString() : "Ongoing"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Insurance Coverage</p>
                          <p className="text-sm flex items-center">
                            <Shield className="w-3 h-3 mr-1" />
                            {plan.insurerName || "Multiple Insurers"}
                          </p>
                        </div>
                      </div>

                      {/* Treatment Goals */}
                      {plan.treatmentGoals && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Treatment Goals</p>
                          <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            {JSON.stringify(plan.treatmentGoals).replace(/[{},"]/g, '').replace(/:/g, ': ')}
                          </div>
                        </div>
                      )}

                      {/* Assigned Services */}
                      {plan.assignedServices && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Assigned Services</p>
                          <div className="text-sm text-gray-700 dark:text-gray-300 bg-teal-50 dark:bg-teal-900/20 p-3 rounded-md">
                            {JSON.stringify(plan.assignedServices).replace(/[{}"]/g, '').replace(/:/g, ': ').replace(/,/g, ', ')}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {plan.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Care Notes</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">{plan.notes}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Update Plan
                          </Button>
                          <Button variant="outline" size="sm">
                            <Phone className="w-4 h-4 mr-2" />
                            Contact Patient
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {new Date(plan.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Policy Insights Tab */}
          <TabsContent value="policy-insights" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Policy Insights</h2>
              <div className="flex items-center space-x-4">
                <Input 
                  placeholder="Enter Patient ID" 
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-48"
                />
                <Button>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analyze Coverage
                </Button>
              </div>
            </div>

            {selectedPatient ? (
              <div className="grid gap-6">
                {insightsLoading ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">Loading policy insights...</div>
                    </CardContent>
                  </Card>
                ) : (
                  policyInsights?.map((insight: PolicyInsight) => (
                    <Card key={insight.policyId} className="bg-white dark:bg-gray-800">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{insight.policyName}</CardTitle>
                            <CardDescription>
                              {insight.insurerName} • Member: {insight.memberNumber}
                            </CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="default">
                              {insight.memberType}
                            </Badge>
                            <Badge variant="outline">
                              {insight.relationship}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheme Details</p>
                            <p className="text-sm">{insight.schemeName}</p>
                            <p className="text-xs text-gray-500">Code: {insight.schemeCode}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Coverage Limits</p>
                            <p className="text-sm">
                              Annual: {insight.annualLimit ? `KES ${parseFloat(insight.annualLimit).toLocaleString()}` : "Unlimited"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Per Visit: {insight.perVisitLimit ? `KES ${parseFloat(insight.perVisitLimit).toLocaleString()}` : "No limit"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost Sharing</p>
                            <p className="text-sm">
                              Copay: {insight.copayPercentage ? `${insight.copayPercentage}%` : "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Effective: {new Date(insight.effectiveDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-8">
                  <div className="text-center">
                    <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Policy Coverage Analysis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Enter a patient ID above to view their comprehensive insurance coverage and benefit utilization.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Patient Coordination Tab */}
          <TabsContent value="patient-coordination" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Care Coordination</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Users className="w-4 h-4 mr-2" />
                Schedule Team Meeting
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Care Team Communication */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-blue-600" />
                    Care Team Communication
                  </CardTitle>
                  <CardDescription>
                    Coordinate with healthcare providers and specialists
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Care team coordination features coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Patient Engagement */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-600" />
                    Patient Engagement
                  </CardTitle>
                  <CardDescription>
                    Monitor patient adherence and outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Patient engagement tracking coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}