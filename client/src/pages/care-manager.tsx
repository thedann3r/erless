import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Progress } from "@/components/ui/progress";

export default function CareManager() {
  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: fraudAlerts } = useQuery({
    queryKey: ["/api/analytics/fraud"],
  });

  const { data: claims } = useQuery({
    queryKey: ["/api/claims"],
  });

  const { data: providers } = useQuery({
    queryKey: ["/api/providers"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'void': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Care Manager Dashboard</h1>
                <p className="text-gray-600">Monitor claims, AI decisions, and provider performance</p>
              </div>
              <div className="flex items-center space-x-4">
                <Select defaultValue="30days">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="3months">Last 3 months</SelectItem>
                    <SelectItem value="6months">Last 6 months</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="teal-button">
                  <i className="fas fa-download mr-2"></i>
                  Export Report
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Claims</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.totalClaims?.toLocaleString() || "0"}
                    </p>
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

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.aiAccuracy || "0"}%</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-brain text-teal-600"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-green-600 text-sm font-medium">+2.1%</span>
                  <span className="text-gray-500 text-sm ml-2">improvement</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Processing Time</p>
                    <p className="text-2xl font-bold text-gray-900">1.3s</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-clock text-green-600"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-green-600 text-sm font-medium">-0.2s</span>
                  <span className="text-gray-500 text-sm ml-2">faster than target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fraud Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">{fraudAlerts?.length || "0"}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-shield-alt text-red-600"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-red-600 text-sm font-medium">0.08%</span>
                  <span className="text-gray-500 text-sm ml-2">detection rate</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Provider Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-hospital text-blue-500"></i>
                  <span>Provider Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {providers && providers.length > 0 ? (
                  <div className="space-y-4">
                    {providers.slice(0, 5).map((provider: any) => (
                      <div key={provider.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">{provider.name}</div>
                          <div className="text-sm text-gray-600">Type: {provider.type}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">Active</div>
                          <div className="text-xs text-gray-500">{provider.licenseNumber}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <i className="fas fa-hospital text-3xl mb-4 text-gray-300"></i>
                    <p>No provider data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fraud Detection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-shield-alt text-red-500"></i>
                  <span>Fraud Pattern Detection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fraudAlerts && fraudAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {fraudAlerts.slice(0, 5).map((alert: any) => (
                      <div key={alert.id} className={`p-4 rounded-lg border ${getRiskColor(alert.riskLevel)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{alert.alertType.replace('_', ' ').toUpperCase()}</span>
                          <span className="text-xs">Risk: {alert.riskLevel.toUpperCase()}</span>
                        </div>
                        <div className="text-sm">
                          {alert.description}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs">Confidence: {alert.aiConfidence}%</span>
                          <Button size="sm" variant="outline">
                            Investigate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <i className="fas fa-shield-check text-3xl mb-4 text-green-300"></i>
                    <p>No fraud alerts</p>
                    <p className="text-sm mt-2">All systems operating normally</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Decision Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-brain text-purple-500"></i>
                  <span>AI Decision Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Auto-approved claims</span>
                    <span className="font-medium">{stats?.approvedClaims || 0} (91%)</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Flagged for review</span>
                    <span className="font-medium">{Math.floor((stats?.totalClaims || 0) * 0.075)} (7.5%)</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Auto-denied</span>
                    <span className="font-medium">{Math.floor((stats?.totalClaims || 0) * 0.015)} (1.5%)</span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg. processing time</span>
                      <span className="font-medium text-green-600">1.3 seconds</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Human override rate</span>
                    <span className="font-medium text-blue-600">5.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Outcomes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-heartbeat text-red-500"></i>
                  <span>Patient Outcomes Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-800">Treatment Success Rate</span>
                      <span className="text-green-600">94.2%</span>
                    </div>
                    <Progress value={94.2} className="mt-2" />
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">Patient Satisfaction</span>
                      <span className="text-blue-600">4.7/5.0</span>
                    </div>
                    <Progress value={94} className="mt-2" />
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-purple-800">Cost Efficiency</span>
                      <span className="text-purple-600">87.3%</span>
                    </div>
                    <Progress value={87.3} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Claims */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Claims Activity</CardTitle>
                <CardDescription>Latest claims processed in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {claims && claims.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-200">
                          <th className="pb-3 text-sm font-medium text-gray-600">Claim ID</th>
                          <th className="pb-3 text-sm font-medium text-gray-600">Service</th>
                          <th className="pb-3 text-sm font-medium text-gray-600">Provider</th>
                          <th className="pb-3 text-sm font-medium text-gray-600">Amount</th>
                          <th className="pb-3 text-sm font-medium text-gray-600">Status</th>
                          <th className="pb-3 text-sm font-medium text-gray-600">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {claims.slice(0, 10).map((claim: any) => (
                          <tr key={claim.id} className="border-b border-gray-50">
                            <td className="py-3 text-sm font-mono">{claim.claimId}</td>
                            <td className="py-3 text-sm">{claim.serviceType}</td>
                            <td className="py-3 text-sm">{claim.provider?.name || 'N/A'}</td>
                            <td className="py-3 text-sm">${parseFloat(claim.serviceCost).toFixed(2)}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                                {claim.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 text-sm text-gray-500">
                              {new Date(claim.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <i className="fas fa-file-medical text-3xl mb-4 text-gray-300"></i>
                    <p>No claims data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
