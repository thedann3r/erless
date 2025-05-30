import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function Debtors() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: claims } = useQuery({
    queryKey: ["/api/claims"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
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

  const filteredClaims = claims?.filter((claim: any) => {
    const matchesStatus = filterStatus === "all" || claim.status === filterStatus;
    const matchesSearch = !searchTerm || 
      claim.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const outstandingClaims = claims?.filter((claim: any) => claim.status === 'pending').length || 0;
  const missingDiagnosis = claims?.filter((claim: any) => !claim.diagnosisCode).length || 0;
  const voidClaims = claims?.filter((claim: any) => claim.isVoid).length || 0;
  const totalValue = filteredClaims.reduce((sum: number, claim: any) => sum + parseFloat(claim.serviceCost || 0), 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Debtors Management</h1>
                <p className="text-gray-600">Manage outstanding claims and billing issues</p>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Claims</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="void">Void Claims</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="teal-button">
                  <i className="fas fa-download mr-2"></i>
                  Generate Report
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Outstanding Claims</p>
                    <p className="text-2xl font-bold text-gray-900">{outstandingClaims}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-clock text-yellow-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Missing Diagnosis</p>
                    <p className="text-2xl font-bold text-gray-900">{missingDiagnosis}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-red-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-dollar-sign text-blue-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Void Claims</p>
                    <p className="text-2xl font-bold text-gray-900">{voidClaims}</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-ban text-gray-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by claim ID or service type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="medical-form-input"
                />
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <Button variant="ghost" size="sm" className="text-blue-700">
                  Basic View
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  Premium View
                </Button>
              </div>
            </div>
          </div>

          {/* Claims Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Claims Management</CardTitle>
                <CardDescription>
                  {filteredClaims.length} claims found
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {filteredClaims.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="pb-3 text-sm font-medium text-gray-600">Claim ID</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Service Type</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Provider</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Amount</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Status</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Issues</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClaims.map((claim: any) => (
                        <tr key={claim.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 text-sm font-mono">{claim.claimId}</td>
                          <td className="py-3 text-sm">{claim.serviceType}</td>
                          <td className="py-3 text-sm">{claim.provider?.name || 'N/A'}</td>
                          <td className="py-3 text-sm">
                            {claim.isVoid ? (
                              <span className="line-through text-gray-500">
                                ${parseFloat(claim.serviceCost).toFixed(2)}
                              </span>
                            ) : (
                              `$${parseFloat(claim.serviceCost).toFixed(2)}`
                            )}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                              {claim.isVoid ? 'VOID' : claim.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 text-sm">
                            {!claim.diagnosisCode && (
                              <span className="text-red-600 text-xs">Missing Diagnosis</span>
                            )}
                            {claim.isVoid && (
                              <span className="text-gray-600 text-xs">Voided</span>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                              {!claim.diagnosisCode && (
                                <Button variant="ghost" size="sm" className="text-red-600">
                                  Fix
                                </Button>
                              )}
                              {claim.status === 'pending' && (
                                <Button variant="ghost" size="sm" className="text-blue-600">
                                  Review
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <i className="fas fa-file-invoice text-4xl mb-4 text-gray-300"></i>
                  <h3 className="text-lg font-medium text-gray-500 mb-2">No Claims Found</h3>
                  <p className="text-sm">Try adjusting your search criteria or filters</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Premium Features Section */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-purple-800">
                <i className="fas fa-crown text-yellow-500 mr-2"></i>
                Premium Analytics
              </h3>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Upgrade to Premium
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-purple-600 mb-1">Real-time Cost Comparison</div>
                <div className="text-lg font-bold text-purple-800">$125 vs $98</div>
                <div className="text-xs text-purple-600">22% savings potential</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-purple-600 mb-1">Provider Benchmarking</div>
                <div className="text-lg font-bold text-purple-800">Top 15%</div>
                <div className="text-xs text-purple-600">Cost efficiency ranking</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-purple-600 mb-1">Predictive Analytics</div>
                <div className="text-lg font-bold text-purple-800">94% Accuracy</div>
                <div className="text-xs text-purple-600">Cost prediction model</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
