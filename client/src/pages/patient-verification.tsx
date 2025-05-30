import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { FingerprintScanner } from "@/components/verification/fingerprint-scanner";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PatientData {
  patient: any;
  benefits: any[];
  dependents: any[];
}

export default function PatientVerification() {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<"fingerprint" | "otp" | "manual">("fingerprint");
  const [otpValue, setOtpValue] = useState("");
  const { toast } = useToast();

  const verifyPatientMutation = useMutation({
    mutationFn: api.verifyPatient,
    onSuccess: (data) => {
      setPatientData(data);
      toast({
        title: "Patient Verified",
        description: `Successfully verified ${data.patient.firstName} ${data.patient.lastName}`,
        className: "verification-success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Patient verification failed",
        variant: "destructive",
      });
    },
  });

  const { data: searchResults, refetch: searchPatients } = useQuery({
    queryKey: ["/api/patients/search", searchQuery],
    queryFn: () => api.searchPatients(searchQuery),
    enabled: false,
  });

  const handleFingerprintVerification = (biometricData: string) => {
    verifyPatientMutation.mutate({ biometricData });
  };

  const handleOTPVerification = () => {
    if (otpValue.length === 6) {
      verifyPatientMutation.mutate({ otp: otpValue });
    }
  };

  const handleManualSearch = () => {
    if (searchQuery.trim()) {
      searchPatients();
    }
  };

  const handlePatientSelect = (patient: any) => {
    verifyPatientMutation.mutate({ patientId: patient.patientId });
  };

  const getBenefitProgress = (benefit: any) => {
    if (benefit.monetaryLimit) {
      const used = parseFloat(benefit.monetaryUsed || 0);
      const limit = parseFloat(benefit.monetaryLimit);
      return (used / limit) * 100;
    } else {
      return (benefit.usedAmount / benefit.totalLimit) * 100;
    }
  };

  const getBenefitColor = (progress: number) => {
    if (progress >= 90) return "bg-red-500";
    if (progress >= 75) return "bg-yellow-500";
    return "bg-teal-500";
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
                  <h1 className="text-3xl font-bold text-gray-900">Patient Verification</h1>
                  <p className="text-gray-600 mt-1">
                    Secure biometric and OTP verification for patient identification
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Biometric Scanner Ready</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Verification Panel */}
              <div className="space-y-6">
                <Card className="medical-interface">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-shield-alt text-teal-600"></i>
                      <span>Patient Verification</span>
                    </CardTitle>
                    <CardDescription>
                      Choose your preferred verification method
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={verificationMethod} onValueChange={(value: any) => setVerificationMethod(value)}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="fingerprint">Fingerprint</TabsTrigger>
                        <TabsTrigger value="otp">OTP</TabsTrigger>
                        <TabsTrigger value="manual">Manual Search</TabsTrigger>
                      </TabsList>

                      <TabsContent value="fingerprint" className="space-y-6">
                        <div className="text-center py-8">
                          <FingerprintScanner
                            onScan={handleFingerprintVerification}
                            isScanning={verifyPatientMutation.isPending}
                          />
                          <p className="text-gray-600 mt-4">
                            Place finger on scanner for instant verification
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="otp" className="space-y-6">
                        <div className="space-y-4">
                          <Label htmlFor="otp">Enter 6-digit OTP</Label>
                          <Input
                            id="otp"
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                            className="text-center tracking-widest text-lg"
                          />
                          <Button
                            onClick={handleOTPVerification}
                            disabled={otpValue.length !== 6 || verifyPatientMutation.isPending}
                            className="w-full bg-teal-600 hover:bg-teal-700"
                          >
                            {verifyPatientMutation.isPending ? "Verifying..." : "Verify OTP"}
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="manual" className="space-y-6">
                        <div className="space-y-4">
                          <Label htmlFor="search">Patient ID or Name</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="search"
                              placeholder="Enter patient ID or search by name..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                            />
                            <Button
                              onClick={handleManualSearch}
                              disabled={!searchQuery.trim()}
                              variant="outline"
                            >
                              <i className="fas fa-search"></i>
                            </Button>
                          </div>

                          {searchResults && searchResults.length > 0 && (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {searchResults.map((patient: any) => (
                                <div
                                  key={patient.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                                  onClick={() => handlePatientSelect(patient)}
                                >
                                  <div>
                                    <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                                    <p className="text-sm text-gray-600">{patient.patientId}</p>
                                  </div>
                                  <Badge variant="outline">{patient.insurancePlan}</Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>

                    {verifyPatientMutation.error && (
                      <Alert className="verification-error">
                        <i className="fas fa-exclamation-triangle"></i>
                        <AlertDescription>
                          {verifyPatientMutation.error.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="medical-interface">
                  <CardHeader>
                    <CardTitle>Verification Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">1,247</div>
                        <div className="text-sm text-gray-600">Verifications Today</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">98.9%</div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Patient Information */}
              <div className="space-y-6">
                {patientData ? (
                  <>
                    {/* Patient Profile */}
                    <Card className="medical-interface">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2">
                            <i className="fas fa-user-check text-green-600"></i>
                            <span>Patient Verified</span>
                          </CardTitle>
                          <Badge className="status-approved">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                              <i className="fas fa-user text-teal-700 text-xl"></i>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {patientData.patient.firstName} {patientData.patient.lastName}
                              </h3>
                              <p className="text-gray-600">{patientData.patient.patientId}</p>
                              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                <div>
                                  <span className="text-gray-500">DOB:</span>
                                  <span className="ml-2 font-medium">
                                    {new Date(patientData.patient.dateOfBirth).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Gender:</span>
                                  <span className="ml-2 font-medium">{patientData.patient.gender}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Plan:</span>
                                  <span className="ml-2 font-medium">{patientData.patient.insurancePlan}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Provider:</span>
                                  <span className="ml-2 font-medium">{patientData.patient.insuranceProvider}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Benefits Overview */}
                    <Card className="medical-interface">
                      <CardHeader>
                        <CardTitle>Current Benefits</CardTitle>
                        <CardDescription>Available coverage and utilization</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {patientData.benefits.map((benefit: any) => {
                            const progress = getBenefitProgress(benefit);
                            const progressColor = getBenefitColor(progress);
                            
                            return (
                              <div key={benefit.id} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-900">
                                    {benefit.benefitType.charAt(0).toUpperCase() + benefit.benefitType.slice(1).replace('-', ' ')}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {benefit.monetaryLimit ? 
                                      `$${benefit.monetaryUsed || 0} / $${benefit.monetaryLimit}` :
                                      `${benefit.usedAmount} / ${benefit.totalLimit}`
                                    }
                                  </span>
                                </div>
                                <div className="benefit-progress">
                                  <div 
                                    className={`benefit-progress-bar ${progressColor}`}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Dependents */}
                    {patientData.dependents.length > 0 && (
                      <Card className="medical-interface">
                        <CardHeader>
                          <CardTitle>Dependents</CardTitle>
                          <CardDescription>Covered family members</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {patientData.dependents.map((dependent: any) => (
                              <div key={dependent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {dependent.firstName} {dependent.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {dependent.relationship} • Age {
                                      Math.floor((new Date().getTime() - new Date(dependent.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                                    }
                                  </p>
                                </div>
                                <Badge className="status-approved">Covered</Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                      <Button className="flex-1 bg-teal-600 hover:bg-teal-700">
                        <i className="fas fa-file-medical mr-2"></i>
                        Process Claim
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <i className="fas fa-history mr-2"></i>
                        View History
                      </Button>
                    </div>
                  </>
                ) : (
                  <Card className="medical-interface">
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <i className="fas fa-user-plus text-4xl text-gray-300 mb-4"></i>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Patient Selected</h3>
                        <p className="text-gray-600">
                          Use fingerprint, OTP, or manual search to verify a patient
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
