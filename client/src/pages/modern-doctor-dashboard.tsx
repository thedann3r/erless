import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { SharedLayout } from "@/components/layout/shared-layout";
import { BiometricVerificationModal } from "@/components/biometric-verification-modal";
import { ClaimFormGenerator } from "@/components/claim-form-generator";
import { ChainOfThoughtDisplay } from "@/components/chain-of-thought-display";
import { TreatmentPlanDisplay } from "@/components/treatment-plan-display";
import { 
  Stethoscope, Users, FileText, Pill, TestTube, Clock, User, 
  AlertTriangle, Heart, Thermometer, Activity, Search, Plus,
  CheckCircle, Calendar, MapPin, Phone, Fingerprint, Brain, Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface QueuePatient {
  id: number;
  patientId: number;
  patient: {
    firstName: string;
    lastName: string;
    patientId: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;
  };
  queueNumber: number;
  priority: "high" | "normal" | "low";
  chiefComplaint: string;
  vitals: {
    bloodPressure?: string;
    temperature?: string;
    pulse?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
  };
  triageNotes: string;
  status: "waiting" | "in_consultation" | "completed";
  checkedInAt: string;
}

interface ConsultationForm {
  patientId: number;
  queueId: number;
  chiefComplaint: string;
  historyOfPresentingIllness: string;
  physicalExamination: string;
  diagnosis: string;
  icd10Code: string;
  treatmentPlan: string;
  prescriptions: string[];
  labOrders: string[];
  followUpInstructions: string;
}

export default function ModernDoctorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null);
  const [activeTab, setActiveTab] = useState("history");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showClaimGenerator, setShowClaimGenerator] = useState(false);
  const [verifiedPatient, setVerifiedPatient] = useState<any>(null);
  const [showTreatmentPlan, setShowTreatmentPlan] = useState(false);
  const [generatedTreatmentPlan, setGeneratedTreatmentPlan] = useState<any>(null);
  const [showDifferentialDiagnosis, setShowDifferentialDiagnosis] = useState(false);
  const [differentialAnalysis, setDifferentialAnalysis] = useState<any>(null);
  const [consultationCompleted, setConsultationCompleted] = useState(false);

  const handleBiometricVerification = (patient: any) => {
    setVerifiedPatient(patient);
    setShowBiometricModal(false);
    toast({
      title: "Patient Verified",
      description: `${patient.firstName} ${patient.lastName} verified successfully`,
    });
  };

  const generateTreatmentPlan = async (patientData: any, diagnosis: string) => {
    try {
      const response = await apiRequest('POST', '/api/ai/treatment-plan', {
        diagnosis,
        patientAge: calculateAge(patientData?.patient?.dateOfBirth) || 35,
        patientWeight: 70,
        patientGender: patientData?.patient?.gender?.toLowerCase() || 'female',
        symptoms: ['fatigue', 'headache'],
        allergies: [],
        currentMedications: [],
        medicalHistory: [],
        severity: 'moderate'
      });
      
      setGeneratedTreatmentPlan(response);
      setShowTreatmentPlan(true);
    } catch (error) {
      toast({
        title: "Treatment Plan Error",
        description: "Failed to generate treatment plan",
        variant: "destructive"
      });
    }
  };

  const analyzeDifferentialDiagnosis = async (symptoms: string[], patientAge: number, patientGender: string) => {
    try {
      const response = await apiRequest('POST', '/api/ai/differential-diagnosis', {
        symptoms,
        patientAge,
        patientGender: patientGender.toLowerCase(),
        duration: '3 days',
        additionalInfo: 'Patient reports gradual onset'
      });
      
      setDifferentialAnalysis(response);
      setShowDifferentialDiagnosis(true);
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze differential diagnosis",
        variant: "destructive"
      });
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 35;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Mock data - replace with actual API calls
  const queuePatients: QueuePatient[] = [
    {
      id: 1,
      patientId: 1001,
      patient: {
        firstName: "Sarah",
        lastName: "Johnson",
        patientId: "PT-2024-001",
        dateOfBirth: "1985-06-15",
        gender: "Female",
        phoneNumber: "+254712345678"
      },
      queueNumber: 1,
      priority: "high",
      chiefComplaint: "Chest pain and shortness of breath",
      vitals: {
        bloodPressure: "150/95",
        temperature: "37.8°C",
        pulse: "88 bpm",
        respiratoryRate: "22/min",
        oxygenSaturation: "96%"
      },
      triageNotes: "Patient reports acute onset chest pain, mild dyspnea. Vitals elevated.",
      status: "waiting",
      checkedInAt: "2024-06-20T08:30:00Z"
    },
    {
      id: 2,
      patientId: 1002,
      patient: {
        firstName: "Michael",
        lastName: "Ochieng",
        patientId: "PT-2024-002",
        dateOfBirth: "1976-11-23",
        gender: "Male",
        phoneNumber: "+254723456789"
      },
      queueNumber: 2,
      priority: "normal",
      chiefComplaint: "Follow-up diabetes check",
      vitals: {
        bloodPressure: "130/80",
        temperature: "36.5°C",
        pulse: "72 bpm",
        respiratoryRate: "16/min",
        oxygenSaturation: "98%"
      },
      triageNotes: "Routine diabetes follow-up. Patient reports good medication compliance.",
      status: "waiting",
      checkedInAt: "2024-06-20T09:15:00Z"
    },
    {
      id: 3,
      patientId: 1003,
      patient: {
        firstName: "Grace",
        lastName: "Wanjiku",
        patientId: "PT-2024-003",
        dateOfBirth: "1992-03-08",
        gender: "Female",
        phoneNumber: "+254734567890"
      },
      queueNumber: 3,
      priority: "low",
      chiefComplaint: "Mild headache and fatigue",
      vitals: {
        bloodPressure: "120/75",
        temperature: "36.8°C",
        pulse: "68 bpm",
        respiratoryRate: "14/min",
        oxygenSaturation: "99%"
      },
      triageNotes: "Patient reports mild symptoms for 2 days. No fever, stable vitals.",
      status: "waiting",
      checkedInAt: "2024-06-20T10:00:00Z"
    }
  ];

  const sidebarItems = [
    { path: "/doctor", icon: <Users className="h-5 w-5" />, label: "Patient Queue", badge: "3" },
    { path: "/doctor/consultations", icon: <Stethoscope className="h-5 w-5" />, label: "Consultations" },
    { path: "/doctor/lab-orders", icon: <TestTube className="h-5 w-5" />, label: "Lab Orders" },
    { path: "/doctor/prescriptions", icon: <Pill className="h-5 w-5" />, label: "Prescriptions" },
    { path: "/doctor/history", icon: <FileText className="h-5 w-5" />, label: "Patient History" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "normal": return "bg-blue-100 text-blue-800 border-blue-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getVitalStatus = (vital: string, type: string) => {
    // Simple vital signs validation - replace with proper medical ranges
    if (type === "bloodPressure") {
      const [systolic] = vital.split("/").map(v => parseInt(v));
      if (systolic > 140) return "text-red-600";
      if (systolic > 120) return "text-orange-600";
      return "text-green-600";
    }
    return "text-foreground";
  };

  const startConsultation = (patient: QueuePatient) => {
    setSelectedPatient(patient);
    setActiveTab("history");
    setConsultationCompleted(false);
    setVerifiedPatient(null);
    toast({
      title: "Consultation Started",
      description: `Started consultation with ${patient.patient.firstName} ${patient.patient.lastName}`,
    });
  };

  const handleBiometricVerification = (patientData: any) => {
    setVerifiedPatient(patientData);
    toast({
      title: "Patient Verified",
      description: `Identity confirmed for ${patientData.firstName} ${patientData.lastName}`,
    });
  };

  const handleGenerateClaim = () => {
    if (!verifiedPatient) {
      toast({
        title: "Verification Required",
        description: "Please verify patient identity first",
        variant: "destructive"
      });
      return;
    }
    setShowClaimGenerator(true);
  };

  const completeConsultation = () => {
    if (!consultationCompleted) {
      toast({
        title: "Complete Documentation",
        description: "Please complete all consultation tabs before finalizing",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Consultation Completed",
      description: `Consultation completed for ${selectedPatient?.patient.firstName} ${selectedPatient?.patient.lastName}`,
    });

    setSelectedPatient(null);
    setVerifiedPatient(null);
    setConsultationCompleted(false);
    setActiveTab("history");
  };

  return (
    <SharedLayout sidebarItems={sidebarItems} title="Doctor Dashboard">
      <div className="space-y-6">
        {/* Top Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Patients Waiting</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">15</p>
                  <p className="text-sm text-muted-foreground">Avg Wait (min)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Patient Queue */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Triage Queue</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
            </div>

            <div className="space-y-3">
              {queuePatients.map((patient) => (
                <Card 
                  key={patient.id} 
                  className={`card-hover cursor-pointer transition-all ${
                    selectedPatient?.id === patient.id ? 'ring-2 ring-primary' : ''
                  } ${patient.priority === 'high' ? 'priority-high' : 
                     patient.priority === 'normal' ? 'priority-normal' : 'priority-low'}`}
                  onClick={() => setSelectedPatient(patient)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            #{patient.queueNumber}
                          </Badge>
                          <Badge className={getPriorityColor(patient.priority)}>
                            {patient.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <h3 className="font-medium">
                          {patient.patient.firstName} {patient.patient.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {patient.patient.patientId}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {patient.chiefComplaint}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{new Date(patient.checkedInAt).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    {/* Vital Signs Summary */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        <span className={getVitalStatus(patient.vitals.bloodPressure || "", "bloodPressure")}>
                          {patient.vitals.bloodPressure}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Thermometer className="h-3 w-3 text-orange-500" />
                        <span>{patient.vitals.temperature}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Activity className="h-3 w-3 text-blue-500" />
                        <span>{patient.vitals.pulse}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-green-500">O₂</span>
                        <span>{patient.vitals.oxygenSaturation}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-3" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startConsultation(patient);
                      }}
                    >
                      Start Consultation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Center Panel - Active Consultation */}
          <div className="lg:col-span-2">
            {selectedPatient ? (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>
                      {selectedPatient.patient.firstName} {selectedPatient.patient.lastName}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Patient ID: {selectedPatient.patient.patientId} | 
                    DOB: {new Date(selectedPatient.patient.dateOfBirth).toLocaleDateString()} |
                    Gender: {selectedPatient.patient.gender}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="history">History</TabsTrigger>
                      <TabsTrigger value="examination">Examination</TabsTrigger>
                      <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                      <TabsTrigger value="treatment">Treatment</TabsTrigger>
                    </TabsList>

                    <TabsContent value="history" className="space-y-4 mt-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="chief-complaint">Chief Complaint</Label>
                          <Textarea
                            id="chief-complaint"
                            defaultValue={selectedPatient.chiefComplaint}
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="history-illness">History of Presenting Illness</Label>
                          <Textarea
                            id="history-illness"
                            placeholder="Document the patient's presenting illness history..."
                            className="mt-1"
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Past Medical History</Label>
                            <Textarea placeholder="Previous conditions, surgeries..." className="mt-1" />
                          </div>
                          <div>
                            <Label>Medications</Label>
                            <Textarea placeholder="Current medications..." className="mt-1" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="examination" className="space-y-4 mt-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Blood Pressure</Label>
                            <Input defaultValue={selectedPatient.vitals.bloodPressure} />
                          </div>
                          <div>
                            <Label>Temperature</Label>
                            <Input defaultValue={selectedPatient.vitals.temperature} />
                          </div>
                          <div>
                            <Label>Pulse</Label>
                            <Input defaultValue={selectedPatient.vitals.pulse} />
                          </div>
                          <div>
                            <Label>O₂ Saturation</Label>
                            <Input defaultValue={selectedPatient.vitals.oxygenSaturation} />
                          </div>
                        </div>
                        <div>
                          <Label>Physical Examination</Label>
                          <Textarea
                            placeholder="Document physical examination findings..."
                            className="mt-1"
                            rows={6}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="diagnosis" className="space-y-4 mt-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Primary Diagnosis</Label>
                            <Input placeholder="Enter diagnosis..." />
                          </div>
                          <div>
                            <Label>ICD-10 Code</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Search ICD-10 codes..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="I20.9">I20.9 - Angina pectoris, unspecified</SelectItem>
                                <SelectItem value="E11.9">E11.9 - Type 2 diabetes mellitus without complications</SelectItem>
                                <SelectItem value="G44.1">G44.1 - Vascular headache, not elsewhere classified</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Clinical Notes</Label>
                          <Textarea
                            placeholder="Additional clinical observations and reasoning..."
                            rows={4}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="treatment" className="space-y-4 mt-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Treatment Plan</Label>
                          <Textarea
                            placeholder="Document treatment recommendations..."
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Prescriptions</Label>
                            <div className="space-y-2">
                              <Button variant="outline" size="sm" className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Medication
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label>Lab Orders</Label>
                            <div className="space-y-2">
                              <Button variant="outline" size="sm" className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Order Tests
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label>Follow-up Instructions</Label>
                          <Textarea
                            placeholder="Follow-up care instructions..."
                            rows={2}
                          />
                        </div>
                        {/* Patient Verification and Claim Generation */}
                        <div className="space-y-4">
                          <div className="p-4 border rounded-xl bg-muted/50">
                            {!verifiedPatient ? (
                              <div className="text-center space-y-3">
                                <Fingerprint className="h-8 w-8 text-muted-foreground mx-auto" />
                                <div>
                                  <p className="text-sm font-medium">Patient Verification</p>
                                  <p className="text-xs text-muted-foreground">Verify identity for insurance claim generation</p>
                                </div>
                                <Button 
                                  onClick={() => setShowBiometricModal(true)}
                                  variant="outline"
                                  className="w-full"
                                >
                                  <Fingerprint className="h-4 w-4 mr-2" />
                                  Verify Patient Identity
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">Patient Verified</span>
                                </div>
                                <div className="text-sm space-y-1">
                                  <p><span className="font-medium">Name:</span> {verifiedPatient.firstName} {verifiedPatient.lastName}</p>
                                  <p><span className="font-medium">Member ID:</span> {verifiedPatient.memberId}</p>
                                  <p><span className="font-medium">Insurer:</span> {verifiedPatient.insurerName}</p>
                                </div>
                                <Button 
                                  onClick={handleGenerateClaim}
                                  variant="outline"
                                  className="w-full"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Generate Insurance Claim
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-4">
                          <Button 
                            onClick={() => setShowBiometricModal(true)}
                            variant="outline" 
                            className="h-10"
                          >
                            <Fingerprint className="h-4 w-4 mr-2" />
                            Verify Patient
                          </Button>
                          <Button 
                            onClick={() => generateTreatmentPlan(selectedPatient, 'Hypertension')}
                            className="bg-purple-600 hover:bg-purple-700 text-white h-10"
                            disabled={!selectedPatient}
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            Treatment Plan
                          </Button>
                          <Button 
                            onClick={() => analyzeDifferentialDiagnosis(['headache', 'fatigue', 'dizziness'], calculateAge(selectedPatient?.patient?.dateOfBirth) || 35, selectedPatient?.patient?.gender || 'female')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white h-10"
                            disabled={!selectedPatient}
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            Differential
                          </Button>
                          <Button 
                            className="h-10"
                          >
                            Complete Consultation
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Select a Patient</h3>
                  <p className="text-muted-foreground">
                    Choose a patient from the queue to start consultation
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Biometric Verification Modal */}
        <BiometricVerificationModal
          isOpen={showBiometricModal}
          onClose={() => setShowBiometricModal(false)}
          onVerificationComplete={handleBiometricVerification}
          patientId={selectedPatient?.patient.patientId}
        />

        {/* Claim Form Generator */}
        {verifiedPatient && (
          <ClaimFormGenerator
            isOpen={showClaimGenerator}
            onClose={() => setShowClaimGenerator(false)}
            patientData={verifiedPatient}
          />
        )}

        {/* Treatment Plan Modal */}
        {showTreatmentPlan && generatedTreatmentPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Treatment Plan</h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowTreatmentPlan(false)}
                    className="rounded-xl"
                  >
                    Close
                  </Button>
                </div>
                <TreatmentPlanDisplay
                  treatmentPlan={generatedTreatmentPlan}
                  patientName={selectedPatient ? `${selectedPatient.patient.firstName} ${selectedPatient.patient.lastName}` : "Patient"}
                  diagnosis="Hypertension"
                />
              </div>
            </div>
          </div>
        )}

        {/* Differential Diagnosis Modal */}
        {showDifferentialDiagnosis && differentialAnalysis && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Differential Diagnosis Analysis</h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowDifferentialDiagnosis(false)}
                    className="rounded-xl"
                  >
                    Close
                  </Button>
                </div>
                <div className="space-y-6">
                  {/* Primary Diagnosis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-green-600" />
                        <span>Primary Diagnosis</span>
                        <Badge className="bg-green-100 text-green-800">
                          {differentialAnalysis.primaryDiagnosis?.probability || 0}% probability
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-lg mb-2">
                        {differentialAnalysis.primaryDiagnosis?.condition || 'Analysis pending'}
                      </h3>
                      <p className="text-gray-700 mb-4">
                        {differentialAnalysis.primaryDiagnosis?.reasoning || 'Clinical assessment needed'}
                      </p>
                      {differentialAnalysis.primaryDiagnosis?.supportingSymptoms?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Supporting Symptoms:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {differentialAnalysis.primaryDiagnosis.supportingSymptoms.map((symptom: string, index: number) => (
                              <li key={index} className="text-sm text-gray-600">{symptom}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recommended Tests */}
                  {differentialAnalysis.recommendedTests?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <span>Recommended Tests</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {differentialAnalysis.recommendedTests.map((test: any, index: number) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <span className="font-medium">{test.test}</span>
                                <Badge variant={test.urgency === 'emergent' ? 'destructive' : test.urgency === 'urgent' ? 'default' : 'secondary'}>
                                  {test.urgency}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{test.reason}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Red Flags */}
                  {differentialAnalysis.redFlags?.length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-red-800">
                          <AlertTriangle className="h-5 w-5" />
                          <span>Red Flag Symptoms</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {differentialAnalysis.redFlags.map((flag: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-red-700">{flag}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SharedLayout>
  );
}