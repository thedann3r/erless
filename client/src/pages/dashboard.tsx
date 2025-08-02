import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: recentClaims } = useQuery({
    queryKey: ["/api/claims"],
  });

  const { data: blockchainStatus } = useQuery({
    queryKey: ["/api/blockchain/status"],
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.name}
                </h1>
                <p className="text-gray-600">
                  {user?.role === 'care-manager' ? 'Monitor claims and AI decisions' :
                   user?.role === 'doctor' ? 'Patient queue and clinical consultations' :
                   user?.role === 'pharmacy' ? 'Validate prescriptions and medications' :
                   'Manage healthcare claims and patient verification'}
                </p>
              </div>
              <div className="flex space-x-3">
                {user?.role === 'doctor' ? (
                  <>
                    <Link href="/patient-queue">
                      <Button className="teal-button">
                        <i className="fas fa-users mr-2"></i>
                        Patient Queue
                      </Button>
                    </Link>
                    <Link href="/consultation">
                      <Button variant="outline">
                        <i className="fas fa-stethoscope mr-2"></i>
                        New Consultation
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/verification">
                      <Button className="teal-button">
                        <i className="fas fa-fingerprint mr-2"></i>
                        Verify Patient
                      </Button>
                    </Link>
                    <Link href="/claims">
                      <Button variant="outline">
                        <i className="fas fa-plus mr-2"></i>
                        New Claim
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Claims</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? "..." : stats?.activeClaims?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-file-medical text-blue-600"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+12.5%</span>
                  <span className="text-gray-500 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? "..." : `${stats?.aiAccuracy || "0"}%`}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-brain text-teal-600"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+2.1%</span>
                  <span className="text-gray-500 ml-1">improvement</span>
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
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">-0.2s</span>
                  <span className="text-gray-500 ml-1">faster</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Blockchain</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {blockchainStatus?.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-link text-purple-600"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-purple-600 font-medium">Sepolia</span>
                  <span className="text-gray-500 ml-1">testnet</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Claims */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Claims</CardTitle>
                  <CardDescription>Latest claims processed in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentClaims?.slice(0, 5).map((claim: any) => (
                      <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{claim.claimId}</p>
                          <p className="text-sm text-gray-600">{claim.serviceType}</p>
                        </div>
                        <div className="text-right">
                          <span className={`status-${claim.status}`}>
                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            ${parseFloat(claim.serviceCost).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center text-gray-500 py-8">
                        <i className="fas fa-file-medical text-3xl mb-4 text-gray-300"></i>
                        <p>No claims found</p>
                        <Link href="/claims">
                          <Button className="mt-4 teal-button">Create Your First Claim</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                  {recentClaims?.length > 0 && (
                    <div className="mt-6">
                      <Link href="/claims">
                        <Button variant="outline" className="w-full">
                          View All Claims
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/verification" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <i className="fas fa-fingerprint mr-3 text-teal-600"></i>
                      Patient Verification
                    </Button>
                  </Link>
                  <Link href="/ai-preauth" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <i className="fas fa-brain mr-3 text-blue-600"></i>
                      AI Preauthorization
                    </Button>
                  </Link>
                  <Link href="/pharmacy" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <i className="fas fa-pills mr-3 text-green-600"></i>
                      Pharmacy Validation
                    </Button>
                  </Link>
                  <Link href="/blockchain" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <i className="fas fa-link mr-3 text-purple-600"></i>
                      Blockchain Anchor
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">AI Engine</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">Healthy</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Blockchain</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">Connected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
