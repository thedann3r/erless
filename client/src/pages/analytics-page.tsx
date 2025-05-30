import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, Users, DollarSign, Clock, AlertTriangle, 
  Shield, Activity, Brain, FileText, Award 
} from "lucide-react";

interface AnalyticsData {
  totalClaims: number;
  totalAmount: number;
  avgProcessingTime: number;
  approvalRate: number;
}

interface FraudAlert {
  providerId: string;
  suspiciousActivity: string;
  claimCount: number;
  totalAmount: number;
}

interface ProviderPerformance {
  providerId: string;
  totalClaims: number;
  approvedClaims: number;
  voidedClaims: number;
  totalAmount: number;
  avgClaimAmount: number;
  approvalRate: number;
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/claims"],
  });

  const { data: fraudAlerts, isLoading: isLoadingFraud } = useQuery<FraudAlert[]>({
    queryKey: ["/api/analytics/fraud-alerts"],
  });

  const { data: providerPerformance, isLoading: isLoadingProviders } = useQuery<ProviderPerformance[]>({
    queryKey: ["/api/analytics/providers"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  const getRiskLevel = (claimCount: number) => {
    if (claimCount > 20) return { color: 'bg-red-100 text-red-800', level: 'High Risk' };
    if (claimCount > 10) return { color: 'bg-yellow-100 text-yellow-800', level: 'Medium Risk' };
    return { color: 'bg-green-100 text-green-800', level: 'Low Risk' };
  };

  const getPerformanceRating = (approvalRate: number) => {
    if (approvalRate >= 95) return { color: 'bg-green-100 text-green-800', rating: 'Excellent' };
    if (approvalRate >= 90) return { color: 'bg-blue-100 text-blue-800', rating: 'Good' };
    if (approvalRate >= 80) return { color: 'bg-yellow-100 text-yellow-800', rating: 'Fair' };
    return { color: 'bg-red-100 text-red-800', rating: 'Poor' };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive analytics for claims, providers, and AI performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 3 months</SelectItem>
              <SelectItem value="365days">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalClaims?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                Processed this period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.totalAmount || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Claims value processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.approvalRate?.toFixed(1) || 0}%</div>
              <p className="text-xs text-muted-foreground">
                AI + manual approvals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(analytics.avgProcessingTime || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Per claim processing time
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Provider Performance</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span>Claims Processing Trends</span>
                </CardTitle>
                <CardDescription>
                  Volume and performance metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">Daily Average</p>
                      <p className="text-sm text-blue-700">Claims processed per day</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-900">
                        {analytics ? Math.round(analytics.totalClaims / 30) : 0}
                      </p>
                      <p className="text-sm text-blue-600">+12.5% vs last month</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">Success Rate</p>
                      <p className="text-sm text-green-700">Approved without issues</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-900">
                        {analytics?.approvalRate?.toFixed(1) || 0}%
                      </p>
                      <p className="text-sm text-green-600">+2.1% improvement</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium text-purple-900">AI Automation</p>
                      <p className="text-sm text-purple-700">Auto-processed claims</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-900">87.3%</p>
                      <p className="text-sm text-purple-600">High confidence decisions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span>Financial Summary</span>
                </CardTitle>
                <CardDescription>
                  Claims value and cost analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Gross Claims</p>
                      <p className="text-xl font-bold text-gray-900">
                        {analytics ? formatCurrency(analytics.totalAmount) : formatCurrency(0)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Net Approved</p>
                      <p className="text-xl font-bold text-gray-900">
                        {analytics ? formatCurrency(analytics.totalAmount * (analytics.approvalRate / 100)) : formatCurrency(0)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Cost Savings</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      AI automation has saved an estimated $45,000 in processing costs this month
                      through faster decisions and reduced manual review requirements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Provider Performance</span>
              </CardTitle>
              <CardDescription>
                Analysis of provider claims and approval rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProviders ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : !providerPerformance || providerPerformance.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No provider data available</p>
                  <p className="text-sm">Provider performance metrics will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {providerPerformance.map((provider) => {
                    const rating = getPerformanceRating(provider.approvalRate);
                    return (
                      <div key={provider.providerId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{provider.providerId}</h4>
                            <p className="text-sm text-gray-600">
                              {provider.totalClaims} claims • {formatCurrency(provider.totalAmount)} total
                            </p>
                          </div>
                          <Badge className={rating.color}>
                            {rating.rating}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-gray-500">Approved</p>
                            <p className="font-medium">{provider.approvedClaims}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500">Voided</p>
                            <p className="font-medium">{provider.voidedClaims}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500">Approval Rate</p>
                            <p className="font-medium">{provider.approvalRate.toFixed(1)}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500">Avg Claim</p>
                            <p className="font-medium">{formatCurrency(provider.avgClaimAmount)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-red-600" />
                <span>Fraud Detection</span>
              </CardTitle>
              <CardDescription>
                Suspicious activity and pattern analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFraud ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : !fraudAlerts || fraudAlerts.length === 0 ? (
                <Alert className="border-green-200 bg-green-50">
                  <Shield className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>No fraud alerts detected.</strong> All provider activity appears normal within expected parameters.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {fraudAlerts.map((alert, index) => {
                    const risk = getRiskLevel(alert.claimCount);
                    return (
                      <Alert key={index} className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-800">
                                Provider {alert.providerId}: {alert.suspiciousActivity}
                              </p>
                              <p className="text-sm text-red-700">
                                {alert.claimCount} claims totaling {formatCurrency(alert.totalAmount)} in 24 hours
                              </p>
                            </div>
                            <Badge className={risk.color}>
                              {risk.level}
                            </Badge>
                          </div>
                          <div className="mt-2 flex space-x-2">
                            <Button size="sm" variant="outline">
                              Investigate
                            </Button>
                            <Button size="sm" variant="outline">
                              Flag Provider
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>AI Performance Metrics</span>
                </CardTitle>
                <CardDescription>
                  Decision accuracy and processing efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium text-purple-900">Decision Accuracy</span>
                    <span className="text-xl font-bold text-purple-900">94.2%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-900">Avg Processing Time</span>
                    <span className="text-xl font-bold text-blue-900">1.3s</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-green-900">Auto-approval Rate</span>
                    <span className="text-xl font-bold text-green-900">87.3%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium text-orange-900">Human Override Rate</span>
                    <span className="text-xl font-bold text-orange-900">5.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span>AI Improvements</span>
                </CardTitle>
                <CardDescription>
                  Recent enhancements and learning updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Model Update:</strong> Chain-of-thought reasoning improved with new clinical guidelines, 
                      increasing accuracy by 3.2% this month.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Activity className="h-4 w-4" />
                    <AlertDescription>
                      <strong>RAG Enhancement:</strong> Retrieved context relevance improved by 15% with 
                      expanded historical case database.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Performance:</strong> Processing time reduced by 0.4s after model optimization. 
                      99.2% uptime maintained.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
