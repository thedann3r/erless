import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api";
import { useState } from "react";

export default function CareManager() {
  const [timeRange, setTimeRange] = useState("30");

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/stats"],
    queryFn: () => api.getAnalyticsStats(),
  });

  const { data: providerPerformance } = useQuery({
    queryKey: ["/api/analytics/providers"],
    queryFn: () => api.getProviderPerformance(),
  });

  const { data: fraudAlerts } = useQuery({
    queryKey: ["/api/analytics/fraud"],
    queryFn: () => api.getFraudAlerts(),
  });

  const { data: aiDecisions } = useQuery({
    queryKey: ["/api/ai/decisions", { limit: 10 }],
    queryFn: () => api.getAIDecisions(10),
  });

  const { data: recentClaims } = useQuery({
    queryKey: ["/api/claims", { limit: 10 }],
    queryFn: () => api.getClaims({ limit: 10 }),
  });

  const mockOutcomes = {
    deliveries: 247,
    newBabyAccounts: 12,
    recoveryRate: 94.2,
    deathCertificates: 3
  };

  const mockProviders = [
    { name: "General Hospital", claims: 1245, gross: 487000, net: 452000, voidRate: 3.2 },
    { name: "City Medical Center", claims: 892, gross: 312000, net: 298000, voidRate: 4.5 },
    { name: "Specialist Clinic", claims: 710, gross: 398000, net: 385000, voidRate: 1.8 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'denied': return 'status-denied';
      case 'void': return 'status-void';
      default: return 'status-pending';
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'approved': return 'status-approved';
      case 'denied': return 'status-denied';
      default: return 'status-pending';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 medical-scroll">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Care Manager Dashboard</h1>
                  <p className="text-gray-600 mt-1">
                    Monitor claims, AI decisions, provider performance, and patient outcomes
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 3 months</SelectItem>
                      <SelectItem value="180">Last 6 months</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    <i className="fas fa-download mr-2"></i>
                    Export Report
                  </Button>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="medical-interface">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Claims</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.total || 2847}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-file-medical text-blue-600"></i>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-green-600 text-sm font-medium">+12.5%</span>
                    <span className="text-gray-500 text-sm ml-2">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="medical-interface">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Gross Amount</p>
                      <p className="text-2xl font-bold text-gray-900">$1.2M</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-dollar-sign text-green-600"></i>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-green-600 text-sm font-medium">+8.3%</span>
                    <span className="text-gray-500 text-sm ml-2">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="medical-interface">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Void Claims</p>
                      <p className="text-2xl font-bold text-gray-900">127</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-ban text-red-600"></i>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-red-600 text-sm font-medium">+2.1%</span>
                    <span className="text-gray-500 text-sm ml-2">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="medical-interface">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">AI Decisions</p>
                      <p className="text-2xl font-bold text-gray-900">{aiDecisions?.length || 1689}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-robot text-purple-600"></i>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-green-600 text-sm font-medium">94.2%</span>
                    <span className="text-gray-500 text-sm ml-2">accuracy rate</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="providers">Provider Performance</TabsTrigger>
                <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                <TabsTrigger value="outcomes">Patient Outcomes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Provider Performance Overview */}
                  <Card className="medical-interface">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <i className="fas fa-hospital text-blue-600"></i>
                        <span>Provider Performance</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockProviders.map((provider, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-800">{provider.name}</div>
                              <div className="text-sm text-gray-600">
                                {provider.claims.toLocaleString()} claims • ${(provider.gross / 1000).toFixed(0)}K gross
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-green-600">
                                ${(provider.net / 1000).toFixed(0)}K net
                              </div>
                              <div className="text-xs text-gray-500">{provider.voidRate}% void rate</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fraud Detection */}
                  <Card className="medical-interface">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <i className="fas fa-shield-alt text-red-600"></i>
                        <span>Fraud Pattern Detection</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {fraudAlerts && fraudAlerts.length > 0 ? (
                          fraudAlerts.slice(0, 3).map((alert: any) => (
                            <div key={alert.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-red-800">High-Risk Pattern Detected</span>
                                <span className="text-xs text-red-600">Priority: High</span>
                              </div>
                              <div className="text-sm text-red-700">
                                Claim {alert.claimId}: Unusual billing pattern - ${alert.serviceCost}
                              </div>
                              <Button size="sm" variant="outline" className="mt-2 text-red-600 border-red-300">
                                Investigate →
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-green-800">System Health</span>
                              <span className="text-xs text-green-600">All Clear</span>
                            </div>
                            <div className="text-sm text-green-700">
                              No significant anomalies detected in the last 24 hours
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Claims */}
                <Card className="medical-interface">
                  <CardHeader>
                    <CardTitle>Recent Claims Activity</CardTitle>
                    <CardDescription>Latest claim submissions across all providers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b border-gray-200">
                            <th className="pb-3 text-sm font-medium text-gray-600">Claim ID</th>
                            <th className="pb-3 text-sm font-medium text-gray-600">Service</th>
                            <th className="pb-3 text-sm font-medium text-gray-600">Amount</th>
                            <th className="pb-3 text-sm font-medium text-gray-600">Status</th>
                            <th className="pb-3 text-sm font-medium text-gray-600">AI Decision</th>
                            <th className="pb-3 text-sm font-medium text-gray-600">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentClaims?.slice(0, 8).map((claim: any) => (
                            <tr key={claim.id} className="border-b border-gray-50">
                              <td className="py-3 text-sm font-mono">{claim.claimId}</td>
                              <td className="py-3 text-sm">{claim.serviceType}</td>
                              <td className="py-3 text-sm">${claim.serviceCost}</td>
                              <td className="py-3">
                                <Badge className={getStatusColor(claim.status)}>
                                  {claim.status}
                                </Badge>
                              </td>
                              <td className="py-3">
                                {claim.aiDecision && (
                                  <Badge className={getDecisionColor(claim.aiDecision)}>
                                    {claim.aiDecision}
                                  </Badge>
                                )}
                              </td>
                              <td className="py-3 text-sm text-gray-500">
                                {new Date(claim.submittedAt).toLocaleDateString()}
                              </td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-gray-500">
                                No recent claims found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="providers" className="space-y-6">
                <Card className="medical-interface">
                  <CardHeader>
                    <CardTitle>Detailed Provider Analytics</CardTitle>
                    <CardDescription>Comprehensive performance metrics by provider</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {mockProviders.map((provider, index) => (
                        <Card key={index} className="border border-gray-200">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg">{provider.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Claims:</span>
                                <span className="font-medium">{provider.claims.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Gross Revenue:</span>
                                <span className="font-medium">${(provider.gross / 1000).toFixed(0)}K</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Net Revenue:</span>
                                <span className="font-medium text-green-600">${(provider.net / 1000).toFixed(0)}K</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Void Rate:</span>
                                <span className={`font-medium ${provider.voidRate > 4 ? 'text-red-600' : 'text-green-600'}`}>
                                  {provider.voidRate}%
                                </span>
                              </div>
                              <div className="pt-2">
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs text-gray-600">Performance Score</span>
                                  <span className="text-xs text-gray-600">
                                    {(100 - provider.voidRate * 10).toFixed(0)}/100
                                  </span>
                                </div>
                                <Progress value={100 - provider.voidRate * 10} className="h-2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-insights" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* AI Decision Insights */}
                  <Card className="medical-interface">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <i className="fas fa-brain text-purple-600"></i>
                        <span>AI Decision Insights</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Auto-approved claims</span>
                          <span className="font-medium">1,534 (91%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Flagged for review</span>
                          <span className="font-medium">127 (7.5%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Auto-denied</span>
                          <span className="font-medium">28 (1.5%)</span>
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Avg. processing time</span>
                            <span className="font-medium text-green-600">2.3 seconds</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Human override rate</span>
                          <span className="font-medium text-blue-600">5.8%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent AI Decisions */}
                  <Card className="medical-interface">
                    <CardHeader>
                      <CardTitle>Recent AI Decisions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {aiDecisions?.slice(0, 6).map((decision: any) => (
                          <div key={decision.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Badge className={getDecisionColor(decision.decision)}>
                                  {decision.decision}
                                </Badge>
                                <span className="text-sm font-medium">
                                  {decision.entityType} #{decision.entityId}
                                </span>
                              </div>
                              <div className="mt-1">
                                <Progress value={decision.confidence || 0} className="h-1" />
                                <span className="text-xs text-gray-500">{decision.confidence}% confidence</span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <i className="fas fa-eye mr-1"></i>
                              View
                            </Button>
                          </div>
                        )) || (
                          <div className="text-center py-8 text-gray-500">
                            <i className="fas fa-robot text-2xl mb-2"></i>
                            <p className="text-sm">No AI decisions yet</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="outcomes" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Patient Outcomes */}
                  <Card className="medical-interface">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <i className="fas fa-heartbeat text-red-600"></i>
                        <span>Patient Outcomes Tracking</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-green-800">Successful Deliveries</span>
                            <span className="text-green-600">{mockOutcomes.deliveries}</span>
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            {mockOutcomes.newBabyAccounts} new "Baby of" accounts created
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-blue-800">Recovery Rate</span>
                            <span className="text-blue-600">{mockOutcomes.recoveryRate}%</span>
                          </div>
                          <div className="text-xs text-blue-600 mt-1">Above industry average</div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-800">Death Certificates</span>
                            <span className="text-gray-600">{mockOutcomes.deathCertificates}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">All properly documented</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quality Metrics */}
                  <Card className="medical-interface">
                    <CardHeader>
                      <CardTitle>Quality Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Patient Satisfaction</span>
                            <span className="text-sm text-gray-600">96.8%</span>
                          </div>
                          <Progress value={96.8} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Treatment Success Rate</span>
                            <span className="text-sm text-gray-600">94.2%</span>
                          </div>
                          <Progress value={94.2} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Readmission Rate</span>
                            <span className="text-sm text-gray-600">3.1%</span>
                          </div>
                          <Progress value={3.1} className="h-2 bg-red-100" />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Claims Accuracy</span>
                            <span className="text-sm text-gray-600">98.9%</span>
                          </div>
                          <Progress value={98.9} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
