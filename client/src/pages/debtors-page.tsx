import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DollarSign, Clock, AlertTriangle, FileText, 
  TrendingUp, Users, Crown, Star 
} from "lucide-react";

interface Claim {
  id: number;
  claimId: string;
  patientId: number;
  serviceType: string;
  status: string;
  serviceCost: string;
  createdAt: string;
  diagnosisCode?: string;
  isVoid: boolean;
}

export default function DebtorsPage() {
  const { data: claims, isLoading } = useQuery<Claim[]>({
    queryKey: ["/api/claims/recent"],
  });

  const getStatusIcon = (status: string, isVoid: boolean) => {
    if (isVoid) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    
    switch (status) {
      case 'approved':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'denied':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string, isVoid: boolean) => {
    if (isVoid) return 'bg-red-100 text-red-800';
    
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  // Calculate summary statistics
  const stats = claims ? {
    outstanding: claims.filter(c => c.status === 'pending').length,
    missingDiagnosis: claims.filter(c => !c.diagnosisCode && c.status === 'pending').length,
    totalValue: claims.reduce((sum, c) => sum + parseFloat(c.serviceCost), 0),
    avgProcessing: 4.2, // days
    voidClaims: claims.filter(c => c.isVoid).length
  } : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Debtors Management Module</h1>
          <p className="text-gray-600">Manage outstanding claims, missing documentation, and billing analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Claims</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="missing-diagnosis">Missing Diagnosis</SelectItem>
              <SelectItem value="void">Void Claims</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Claims</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.outstanding}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Missing Diagnosis</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.missingDiagnosis}</div>
              <p className="text-xs text-muted-foreground">
                Require documentation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue.toString())}</div>
              <p className="text-xs text-muted-foreground">
                Outstanding claims value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgProcessing}d</div>
              <p className="text-xs text-muted-foreground">
                Days to completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Void Claims</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.voidClaims}</div>
              <p className="text-xs text-muted-foreground">
                Cancelled transactions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="claims" className="space-y-6">
        <TabsList>
          <TabsTrigger value="claims">Claims Management</TabsTrigger>
          <TabsTrigger value="analytics">Premium Analytics</TabsTrigger>
          <TabsTrigger value="providers">Provider Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Submitted Claims</CardTitle>
                  <CardDescription>
                    Review and manage outstanding healthcare claims
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">Basic View</Button>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium View
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : !claims || claims.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No claims found</p>
                  <p className="text-sm">Claims data will appear here when available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="pb-3 text-sm font-medium text-gray-600">Claim ID</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Patient</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Service</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Amount</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Status</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Date</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {claims.slice(0, 20).map((claim) => (
                        <tr key={claim.id} className="border-b border-gray-50">
                          <td className="py-3 text-sm font-mono">{claim.claimId}</td>
                          <td className="py-3 text-sm">Patient #{claim.patientId}</td>
                          <td className="py-3 text-sm">{claim.serviceType}</td>
                          <td className="py-3 text-sm font-medium">
                            {claim.isVoid ? (
                              <span className="line-through text-gray-500">
                                {formatCurrency(claim.serviceCost)}
                              </span>
                            ) : (
                              formatCurrency(claim.serviceCost)
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(claim.status, claim.isVoid)}
                              <Badge className={getStatusColor(claim.status, claim.isVoid)} variant="secondary">
                                {claim.isVoid ? 'VOID' : claim.status.toUpperCase()}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 text-sm text-gray-500">
                            {new Date(claim.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {!claim.diagnosisCode && claim.status === 'pending' && (
                                <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                                  Fix
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Premium Analytics Section */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-purple-800 flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span>Premium Analytics Dashboard</span>
                </h3>
                <p className="text-purple-600 text-sm">Advanced insights and cost optimization tools</p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Real-time Cost Comparison</span>
                  </div>
                  <div className="text-lg font-bold text-purple-800">$125 vs $98</div>
                  <div className="text-xs text-purple-600">22% savings potential identified</div>
                </CardContent>
              </Card>
              
              <Card className="border border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Provider Benchmarking</span>
                  </div>
                  <div className="text-lg font-bold text-purple-800">Top 15%</div>
                  <div className="text-xs text-purple-600">Cost efficiency ranking</div>
                </CardContent>
              </Card>
              
              <Card className="border border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Predictive Analytics</span>
                  </div>
                  <div className="text-lg font-bold text-purple-800">94% Accuracy</div>
                  <div className="text-xs text-purple-600">Cost prediction model</div>
                </CardContent>
              </Card>
            </div>

            <Alert className="mt-4 border-yellow-200 bg-yellow-50">
              <Star className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Premium Feature:</strong> Advanced analytics includes real-time cost comparisons, 
                provider performance benchmarking, and predictive cost modeling to optimize healthcare spending.
              </AlertDescription>
            </Alert>
          </div>

          {/* Basic Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Claims by Status</CardTitle>
                <CardDescription>
                  Distribution of claim statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats && [
                    { status: 'Approved', count: claims?.filter(c => c.status === 'approved').length || 0, color: 'bg-green-500' },
                    { status: 'Pending', count: stats.outstanding, color: 'bg-yellow-500' },
                    { status: 'Missing Diagnosis', count: stats.missingDiagnosis, color: 'bg-red-500' },
                    { status: 'Void', count: stats.voidClaims, color: 'bg-gray-500' }
                  ].map((item) => {
                    const percentage = claims ? (item.count / claims.length) * 100 : 0;
                    return (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm font-medium">{item.status}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold">{item.count}</span>
                          <span className="text-xs text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Performance</CardTitle>
                <CardDescription>
                  Average processing times and efficiency metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Processing Time</span>
                    <span className="font-medium">{stats?.avgProcessing || 0} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Claims Processed Today</span>
                    <span className="font-medium">{Math.floor((claims?.length || 0) / 30)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Documentation Completion</span>
                    <span className="font-medium">
                      {claims ? ((claims.filter(c => c.diagnosisCode).length / claims.length) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Void Rate</span>
                    <span className="font-medium">
                      {stats && claims ? ((stats.voidClaims / claims.length) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provider Analysis</CardTitle>
              <CardDescription>
                Performance metrics by healthcare provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Provider analysis coming soon</p>
                <p className="text-sm">Detailed provider performance metrics will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
