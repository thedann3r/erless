import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { BiometricScanner } from "@/components/biometric-scanner";
import { 
  Fingerprint, Smartphone, Search, User, Calendar, 
  Shield, CheckCircle, Users, CreditCard 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PatientData {
  patient: {
    id: number;
    patientId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;
    insuranceNumber: string;
    insurancePlan: string;
  };
  benefits: Array<{
    id: number;
    benefitType: string;
    totalAllowed: number;
    used: number;
    remainingAmount: string;
  }>;
  dependents: Array<{
    id: number;
    firstName: string;
    lastName: string;
    relationship: string;
    dateOfBirth: string;
  }>;
}

export default function VerificationPage() {
  const [verificationMethod, setVerificationMethod] = useState<'fingerprint' | 'otp'>('fingerprint');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedPatient, setVerifiedPatient] = useState<PatientData | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const queryClient = useQueryClient();

  const verifyPatientMutation = useMutation({
    mutationFn: async (data: { patientId?: string; biometricData?: boolean; otpCode?: string }) => {
      const response = await apiRequest("POST", "/api/patients/verify", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setVerifiedPatient(data);
    },
  });

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["/api/patients/search", { q: searchQuery }],
    enabled: searchQuery.length > 2,
  });

  const handleBiometricVerification = () => {
    verifyPatientMutation.mutate({ 
      patientId: searchQuery,
      biometricData: true 
    });
  };

  const handleOtpVerification = () => {
    verifyPatientMutation.mutate({ 
      patientId: searchQuery,
      otpCode 
    });
  };

  const calculateBenefitUsage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  const getBenefitColor = (usage: number) => {
    if (usage < 50) return 'bg-green-500';
    if (usage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Verification</h1>
          <p className="text-gray-600">Secure biometric and OTP-based patient authentication</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-teal-600" />
          <span className="text-sm text-gray-600">HIPAA Compliant</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Fingerprint className="w-5 h-5 text-teal-600" />
              <span>Patient Verification</span>
            </CardTitle>
            <CardDescription>
              Verify patient identity using biometric or OTP methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Search */}
            <div className="space-y-2">
              <Label htmlFor="patient-search">Patient ID or Insurance Number</Label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="patient-search"
                    placeholder="Enter Patient ID, Insurance #, or Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Search Results */}
              {isSearching && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Searching...</p>
                </div>
              )}
              
              {searchResults && searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.slice(0, 3).map((patient: any) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => setSearchQuery(patient.patientId)}
                    >
                      <div>
                        <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                        <p className="text-sm text-gray-500">ID: {patient.patientId}</p>
                      </div>
                      <Badge variant="outline">{patient.insurancePlan}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verification Method Selection */}
            <Tabs value={verificationMethod} onValueChange={(value) => setVerificationMethod(value as 'fingerprint' | 'otp')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fingerprint" className="flex items-center space-x-2">
                  <Fingerprint className="w-4 h-4" />
                  <span>Biometric</span>
                </TabsTrigger>
                <TabsTrigger value="otp" className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4" />
                  <span>OTP</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="fingerprint" className="space-y-4">
                <Alert>
                  <Fingerprint className="h-4 w-4" />
                  <AlertDescription>
                    Place patient's finger on the biometric scanner for instant verification.
                  </AlertDescription>
                </Alert>
                
                <BiometricScanner
                  onScanComplete={handleBiometricVerification}
                  isLoading={verifyPatientMutation.isPending}
                />
              </TabsContent>

              <TabsContent value="otp" className="space-y-4">
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    A 6-digit OTP will be sent to the patient's registered phone number.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <Label htmlFor="otp">Enter 6-digit OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center tracking-widest font-mono text-lg"
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleOtpVerification}
                      disabled={otpCode.length !== 6 || verifyPatientMutation.isPending}
                      className="flex-1"
                    >
                      Verify OTP
                    </Button>
                    <Button variant="outline">
                      Resend
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Verification Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Patient Information</span>
            </CardTitle>
            <CardDescription>
              Verified patient details and insurance benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!verifiedPatient ? (
              <div className="text-center py-12 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Patient verification required</p>
                <p className="text-sm">Complete biometric or OTP verification to view patient details</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Verification Success */}
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Patient verified successfully
                  </AlertDescription>
                </Alert>

                {/* Patient Profile */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-teal-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-teal-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {verifiedPatient.patient.firstName} {verifiedPatient.patient.lastName}
                      </h3>
                      <p className="text-gray-600">ID: {verifiedPatient.patient.patientId}</p>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">DOB:</span>
                          <span className="ml-2 font-medium">
                            {new Date(verifiedPatient.patient.dateOfBirth).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Gender:</span>
                          <span className="ml-2 font-medium">{verifiedPatient.patient.gender}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Plan:</span>
                          <span className="ml-2 font-medium">{verifiedPatient.patient.insurancePlan}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <span className="ml-2 font-medium">{verifiedPatient.patient.phoneNumber}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>

                {/* Benefits Overview */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Insurance Benefits</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {verifiedPatient.benefits.map((benefit) => {
                      const usage = calculateBenefitUsage(benefit.used, benefit.totalAllowed);
                      return (
                        <div key={benefit.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium capitalize">
                              {benefit.benefitType.replace('-', ' ')}
                            </span>
                            <span className="text-sm text-gray-500">
                              {benefit.used}/{benefit.totalAllowed}
                            </span>
                          </div>
                          <Progress value={usage} className="h-2 mb-2" />
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Usage: {usage}%</span>
                            {benefit.remainingAmount && (
                              <span className="text-gray-500">
                                Remaining: ${benefit.remainingAmount}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dependents */}
                {verifiedPatient.dependents.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Dependents</span>
                    </h4>
                    <div className="space-y-2">
                      {verifiedPatient.dependents.map((dependent) => (
                        <div key={dependent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">
                              {dependent.firstName} {dependent.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {dependent.relationship} • Born {new Date(dependent.dateOfBirth).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">Covered</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => window.location.href = '/claims'}
                >
                  Proceed to Claims Processing
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
