import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BiometricVerificationFlow } from '@/components/BiometricVerificationFlow';
import { MultiFingerprintRegistration } from '@/components/MultiFingerprintRegistration';
import { BiometricManagement } from '@/components/BiometricManagement';
import { BiometricScanner } from '@/components/BiometricScanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fingerprint, Shield, Settings, TestTube } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function BiometricDemo() {
  const [selectedPatientId, setSelectedPatientId] = useState('P12345');
  const [selectedPatientName, setSelectedPatientName] = useState('John Doe');
  const [demoMode, setDemoMode] = useState('verification-flow');
  const { user } = useAuth();

  // Sample patients for demo
  const samplePatients = [
    { id: 'P12345', name: 'John Doe', registered: false },
    { id: 'P67890', name: 'Jane Smith', registered: true },
    { id: 'P24680', name: 'Mary Johnson', registered: true },
    { id: 'P13579', name: 'Robert Wilson', registered: false },
    { id: 'P11111', name: 'Grace Muthoni', registered: true },
  ];

  const handleVerificationSuccess = (result: any) => {
    console.log('Verification successful:', result);
  };

  const handleRegistrationComplete = (result: any) => {
    console.log('Registration complete:', result);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f5f0] via-[#f0faf7] to-[#d1e7e0]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Please log in to access the biometric demo system.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f5f0] via-[#f0faf7] to-[#d1e7e0] p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Fingerprint className="h-8 w-8 text-[#265651]" />
              Erlessed Biometric System Demo
              <TestTube className="h-6 w-6 text-orange-500" />
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Full-stack biometric verification system with MongoDB storage, 
              JWT authentication, and comprehensive audit logging.
            </p>
          </CardHeader>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#265651]" />
              Demo Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Select Patient</Label>
                <Select 
                  value={selectedPatientId} 
                  onValueChange={(value) => {
                    setSelectedPatientId(value);
                    const patient = samplePatients.find(p => p.id === value);
                    setSelectedPatientName(patient?.name || '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {samplePatients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.id}) - {patient.registered ? '✓ Registered' : '◯ Not Registered'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Patient Name</Label>
                <Input 
                  value={selectedPatientName}
                  onChange={(e) => setSelectedPatientName(e.target.value)}
                  placeholder="Enter patient name"
                />
              </div>

              <div className="space-y-2">
                <Label>Demo Mode</Label>
                <Select value={demoMode} onValueChange={setDemoMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verification-flow">Full Verification Flow</SelectItem>
                    <SelectItem value="multi-register">Multi-Fingerprint Registration</SelectItem>
                    <SelectItem value="scanner-only">Scanner Component Only</SelectItem>
                    <SelectItem value="management">Biometric Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <strong>Current User:</strong> {user.username} ({user.role}) 
              {['care_manager', 'insurer', 'admin'].includes(user.role) && (
                <span className="ml-2 text-blue-600">• Admin Controls Available</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Main Demo */}
          <div className="space-y-6">
            {demoMode === 'verification-flow' && (
              <BiometricVerificationFlow
                patientId={selectedPatientId}
                patientName={selectedPatientName}
                onVerificationSuccess={handleVerificationSuccess}
                onRegistrationComplete={handleRegistrationComplete}
                redirectTo="/modern-pharmacy"
              />
            )}

            {demoMode === 'multi-register' && (
              <MultiFingerprintRegistration
                patientId={selectedPatientId}
                patientName={selectedPatientName}
                onComplete={(results) => {
                  console.log('Multi-fingerprint registration complete:', results);
                  alert(`Successfully registered ${results.length} fingerprints!`);
                }}
                onError={(error) => {
                  console.error('Multi-registration error:', error);
                  alert(`Registration error: ${error}`);
                }}
              />
            )}

            {demoMode === 'scanner-only' && (
              <Card>
                <CardHeader>
                  <CardTitle>Biometric Scanner Component</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="register" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="register">Register Mode</TabsTrigger>
                      <TabsTrigger value="verify">Verify Mode</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="register" className="space-y-4">
                      <BiometricScanner
                        mode="register"
                        patientId={selectedPatientId}
                        onSuccess={(result) => console.log('Registration:', result)}
                        onError={(error) => console.error('Registration error:', error)}
                      />
                    </TabsContent>
                    
                    <TabsContent value="verify" className="space-y-4">
                      <BiometricScanner
                        mode="verify"
                        patientId={selectedPatientId}
                        onSuccess={(result) => console.log('Verification:', result)}
                        onError={(error) => console.error('Verification error:', error)}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {demoMode === 'management' && (
              <BiometricManagement
                patientId={selectedPatientId}
                patientName={selectedPatientName}
              />
            )}
          </div>

          {/* Right Column - System Information */}
          <div className="space-y-6">
            {/* API Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#265651]" />
                  Available API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-600">GET</span>
                    <span>/api/biometric/exists/:patientId</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">POST</span>
                    <span>/api/biometric/register</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">POST</span>
                    <span>/api/biometric/register-finger</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">POST</span>
                    <span>/api/biometric/verify</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">POST</span>
                    <span>/api/biometric/verify-multi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">GET</span>
                    <span>/api/biometric/enhanced-info/:id</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">GET</span>
                    <span>/api/biometric/count/:id</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-600">POST</span>
                    <span>/api/biometric/reset/:patientId</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">GET</span>
                    <span>/api/biometric/audit/:patientId</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">GET</span>
                    <span>/api/biometric/info/:patientId</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>System Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    MongoDB fingerprint storage with encryption
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    JWT-based role authentication system
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Comprehensive audit logging for all actions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Fingerprint simulation with file upload support
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Role-based reset permissions (care managers/insurers)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Duplicate fingerprint prevention across patients
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Progressive scanning simulation with visual feedback
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Complete verification workflow integration
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Technical Stack */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Implementation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Backend:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Node.js + Express.js REST API</li>
                      <li>• MongoDB with native driver</li>
                      <li>• JWT token-based authentication</li>
                      <li>• SHA-256 fingerprint hashing</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong>Frontend:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• React + TypeScript components</li>
                      <li>• TanStack Query for API management</li>
                      <li>• Tailwind CSS + shadcn/ui styling</li>
                      <li>• Progressive scanning animations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}