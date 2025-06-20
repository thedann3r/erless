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
import { 
  Stethoscope, Users, FileText, Pill, TestTube, Clock, User, 
  AlertTriangle, Heart, Thermometer, Activity, Search, Plus,
  CheckCircle, Calendar, MapPin, Phone
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
    toast({
      title: "Consultation Started",
      description: `Started consultation with ${patient.patient.firstName} ${patient.patient.lastName}`,
    });
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
                        <div className="flex space-x-2 pt-4">
                          <Button className="flex-1">
                            Complete Consultation
                          </Button>
                          <Button variant="outline">
                            Save Draft
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
      </div>
    </SharedLayout>
  );
}