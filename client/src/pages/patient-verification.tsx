import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BiometricScanner } from "@/components/biometric-scanner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Patient {
  id: number;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  insuranceProvider: string;
  insurancePlan: string;
  policyNumber: string;
  benefits?: any[];
  dependents?: any[];
}

export default function PatientVerification() {
  const [verifiedPatient, setVerifiedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const verificationMutation = useMutation({
    mutationFn: async (data: { patientId?: string; biometricHash?: string; otp?: string }) => {
      const res = await apiRequest("POST", "/api/patients/verify", data);
      return await res.json();
    },
    onSuccess: (patient) => {
      setVerifiedPatient(patient);
      toast({
        title: "Patient Verified",
        description: `Successfully verified ${patient.firstName} ${patient.lastName}`,
      });
    },
    onError: () => {
      toast({
        title: "Verification Failed",
        description: "Could not verify patient. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBiometricVerification = async (biometricHash: string) => {
    verificationMutation.mutate({ biometricHash });
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    verificationMutation.mutate({ patientId: searchQuery.trim() });
  };

  const handleOTPVerification = async (otp: string) => {
    verificationMutation.mutate({ otp });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Patient Verification</h1>
            <p className="text-gray-600">Verify patient identity using biometric or OTP authentication</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Verification Methods */}
            <div className="space-y-6">
              <Card>
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
                  <Tabs defaultValue="biometric" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="biometric">Fingerprint</TabsTrigger>
                      <TabsTrigger value="otp">SMS OTP</TabsTrigger>
                      <TabsTrigger value="manual">Manual ID</TabsTrigger>
                    </TabsList>

                    <TabsContent value="biometric" className="space-y-4">
                      <div className="text-center py-8">
                        <BiometricScanner
                          onScanComplete={handleBiometricVerification}
                          isLoading={verificationMutation.isPending}
                        />
                        <p className="text-sm text-gray-600 mt-4">
                          Place finger on scanner for instant verification
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="otp" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="phone">Patient Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className="medical-form-input"
                          />
                        </div>
                        <Button className="w-full teal-button">
                          Send OTP
                        </Button>
                        <div>
                          <Label htmlFor="otp">Enter OTP Code</Label>
                          <Input
                            id="otp"
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            className="medical-form-input text-center text-lg tracking-widest"
                            onChange={(e) => {
                              if (e.target.value.length === 6) {
                                handleOTPVerification(e.target.value);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="manual" className="space-y-4">
                      <form onSubmit={handleManualSearch} className="space-y-4">
                        <div>
                          <Label htmlFor="search">Patient ID or Insurance Number</Label>
                          <Input
                            id="search"
                            type="text"
                            placeholder="PT-2024-001847 or Insurance ID"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="medical-form-input"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full teal-button"
                          disabled={verificationMutation.isPending || !searchQuery.trim()}
                        >
                          {verificationMutation.isPending ? "Searching..." : "Search Patient"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Patient Information Display */}
            <div className="space-y-6">
              {verifiedPatient ? (
                <>
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-green-800">
                        <i className="fas fa-check-circle"></i>
                        <span>Verification Successful</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-teal-600 text-xl"></i>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {verifiedPatient.firstName} {verifiedPatient.lastName}
                            </h3>
                            <p className="text-gray-600">ID: {verifiedPatient.patientId}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">DOB:</span>
                            <span className="ml-2 font-medium">
                              {new Date(verifiedPatient.dateOfBirth).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Gender:</span>
                            <span className="ml-2 font-medium">{verifiedPatient.gender}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Insurance:</span>
                            <span className="ml-2 font-medium">{verifiedPatient.insuranceProvider}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Plan:</span>
                            <span className="ml-2 font-medium">{verifiedPatient.insurancePlan}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Benefits Display */}
                  {verifiedPatient.benefits && verifiedPatient.benefits.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Current Benefits</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {verifiedPatient.benefits.map((benefit: any, index: number) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600 capitalize">
                                  {benefit.benefitType}
                                </span>
                                <span className="text-sm font-medium">
                                  {benefit.usedCount || 0}/{benefit.totalAllowed}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-teal-primary h-2 rounded-full"
                                  style={{ 
                                    width: `${((benefit.usedCount || 0) / benefit.totalAllowed) * 100}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Dependents */}
                  {verifiedPatient.dependents && verifiedPatient.dependents.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Dependents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {verifiedPatient.dependents.map((dependent: any) => (
                            <div key={dependent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">{dependent.firstName} {dependent.lastName}</p>
                                <p className="text-sm text-gray-600">{dependent.relationship}</p>
                              </div>
                              <span className="text-sm text-gray-500">
                                Age {Math.floor((Date.now() - new Date(dependent.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <Button className="flex-1 teal-button" asChild>
                      <a href="/claims">Process Claim</a>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setVerifiedPatient(null)}
                    >
                      Verify Another
                    </Button>
                  </div>
                </>
              ) : (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <i className="fas fa-user-check text-4xl text-gray-300 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      No Patient Verified
                    </h3>
                    <p className="text-sm text-gray-400 text-center">
                      Use one of the verification methods to authenticate a patient
                      and view their information and benefits.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
