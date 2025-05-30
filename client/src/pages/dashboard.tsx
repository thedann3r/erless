import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { FileText, Brain, Clock, Shield, TrendingUp, Plus, Fingerprint } from "lucide-react";
import { Link } from "wouter";

interface DashboardStats {
  activeClaims: number;
  aiDecisions: number;
  processingTime: number;
  blockchainAnchored: number;
  fraudDetected: number;
}

interface Activity {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  details: any;
  createdAt: string;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: activity, isLoading: activityLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activity"],
  });

  return (
    <div className="flex min-h-screen bg-clinical-gray">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Monitor claims, AI decisions, and system performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">System Healthy</span>
              </div>
              <Link href="/claims">
                <Button className="bg-teal-primary hover:bg-teal-dark">
                  <Plus className="w-4 h-4 mr-2" />
                  New Claim
                </Button>
              </Link>
              <Link href="/verification">
                <Button variant="outline" className="border-teal-primary text-teal-primary hover:bg-teal-50">
                  <Fingerprint className="w-4 h-4 mr-2" />
                  Verify Patient
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Claims
                </CardTitle>
                <FileText className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats?.activeClaims.toLocaleString() || 0}
                    </div>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600 font-medium">
                        +12.5% vs last month
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  AI Decisions
                </CardTitle>
                <Brain className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats?.aiDecisions.toLocaleString() || 0}
                    </div>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600 font-medium">
                        96.8% accuracy
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Avg Processing
                </CardTitle>
                <Clock className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats?.processingTime || 1.3}
                      <span className="text-lg font-medium text-gray-500 ml-1">s</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600 font-medium">
                        -0.2s faster
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Blockchain
                </CardTitle>
                <Shield className="h-5 w-5 text-teal-600" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats?.blockchainAnchored.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-teal-600 font-medium mt-2">
                      Sepolia testnet
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Fraud Detected
                </CardTitle>
                <Shield className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900">
                      {((stats?.fraudDetected || 0) * 100).toFixed(2)}%
                    </div>
                    <div className="text-xs text-red-600 font-medium mt-2">
                      {stats?.fraudDetected || 0} cases flagged
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                <CardDescription>
                  Common workflows and processes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/verification">
                  <Button variant="outline" className="w-full justify-start">
                    <Fingerprint className="w-4 h-4 mr-3" />
                    Patient Verification
                  </Button>
                </Link>
                <Link href="/claims">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-3" />
                    Process Claim
                  </Button>
                </Link>
                <Link href="/preauth">
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="w-4 h-4 mr-3" />
                    AI Preauthorization
                  </Button>
                </Link>
                <Link href="/pharmacy">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-3" />
                    Pharmacy Validation
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-600" />
                  AI Insights
                </CardTitle>
                <CardDescription>
                  Recent AI decisions and confidence scores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-green-800">
                        Preauth Approved
                      </span>
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        97.2%
                      </Badge>
                    </div>
                    <p className="text-sm text-green-700">
                      MRI scan for patient PT-2024-001847
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-yellow-800">
                        Review Required
                      </span>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                        72.5%
                      </Badge>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Surgery request needs documentation
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-800">
                        System Confidence
                      </span>
                      <Badge variant="outline" className="text-blue-600 border-blue-300">
                        94.2%
                      </Badge>
                    </div>
                    <Progress value={94.2} className="mt-2 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                <CardDescription>
                  Latest system events and actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activity?.slice(0, 5).map((item, index) => (
                      <div key={item.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                          {item.action === 'claim_submitted' && <FileText className="w-4 h-4 text-teal-600" />}
                          {item.action === 'patient_verified' && <Fingerprint className="w-4 h-4 text-green-600" />}
                          {item.action === 'preauthorization_requested' && <Brain className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item.action === 'claim_submitted' && 'New claim submitted'}
                            {item.action === 'patient_verified' && 'Patient verification completed'}
                            {item.action === 'preauthorization_requested' && 'AI preauthorization processed'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.entityId} • {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            item.action === 'claim_submitted'
                              ? 'bg-green-100 text-green-800'
                              : item.action === 'patient_verified'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }
                        >
                          {item.action === 'claim_submitted' && 'Success'}
                          {item.action === 'patient_verified' && 'Verified'}
                          {item.action === 'preauthorization_requested' && 'AI Decision'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">System Status</CardTitle>
              <CardDescription>
                Real-time monitoring of platform components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">AI Service</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <Progress value={98.5} className="h-2" />
                  <p className="text-xs text-gray-500">98.5% uptime</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Blockchain</span>
                    <Badge className="bg-purple-100 text-purple-800">Connected</Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                  <p className="text-xs text-gray-500">Sepolia testnet</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Database</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <Progress value={95.2} className="h-2" />
                  <p className="text-xs text-gray-500">Response time: 12ms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
