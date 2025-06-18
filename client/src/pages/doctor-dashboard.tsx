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
import { Clock, User, AlertTriangle, Stethoscope, FileText, Pill, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  pastMedicalHistory: string;
  examination: string;
  diagnosis: string;
  icd10Codes: string[];
  treatment: string;
  notes: string;
  followUpInstructions: string;
}

interface LabOrder {
  testType: string;
  testCode: string;
  urgency: "routine" | "urgent" | "stat";
  clinicalInfo: string;
}

interface Prescription {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  indication: string;
}

export default function DoctorDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("queue");
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null);
  const [consultationForm, setConsultationForm] = useState<ConsultationForm>({
    patientId: 0,
    queueId: 0,
    chiefComplaint: "",
    historyOfPresentingIllness: "",
    pastMedicalHistory: "",
    examination: "",
    diagnosis: "",
    icd10Codes: [],
    treatment: "",
    notes: "",
    followUpInstructions: "",
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [icdSuggestions, setIcdSuggestions] = useState<string[]>([]);

  // Mock data for patient queue
  const { data: patientQueue = [] } = useQuery({
    queryKey: ["/api/doctor/queue"],
    queryFn: async () => {
      // Mock patient queue data
      return [
        {
          id: 1,
          patientId: 1,
          patient: {
            firstName: "John",
            lastName: "Doe",
            patientId: "P001234",
            dateOfBirth: "1985-06-15",
            gender: "Male",
            phoneNumber: "+254712345678"
          },
          queueNumber: 1,
          priority: "high" as const,
          chiefComplaint: "Chest pain and shortness of breath",
          vitals: {
            bloodPressure: "150/90",
            temperature: "37.2°C",
            pulse: "88 bpm",
            respiratoryRate: "20/min",
            oxygenSaturation: "96%"
          },
          triageNotes: "Patient reports acute onset chest pain, stable vitals",
          status: "waiting" as const,
          checkedInAt: "2024-06-18T08:30:00Z"
        },
        {
          id: 2,
          patientId: 2,
          patient: {
            firstName: "Mary",
            lastName: "Smith",
            patientId: "P001235",
            dateOfBirth: "1990-03-22",
            gender: "Female",
            phoneNumber: "+254723456789"
          },
          queueNumber: 2,
          priority: "normal" as const,
          chiefComplaint: "Headache and fever for 3 days",
          vitals: {
            bloodPressure: "120/80",
            temperature: "38.5°C",
            pulse: "92 bpm",
            respiratoryRate: "18/min"
          },
          triageNotes: "Fever, mild dehydration, no neck stiffness",
          status: "waiting" as const,
          checkedInAt: "2024-06-18T09:15:00Z"
        }
      ] as QueuePatient[];
    },
  });

  const startConsultationMutation = useMutation({
    mutationFn: async (queueId: number) => {
      return apiRequest(`/api/doctor/queue/${queueId}/start`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Consultation Started",
        description: "Patient consultation has been initiated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/queue"] });
    },
  });

  const submitConsultationMutation = useMutation({
    mutationFn: async (data: ConsultationForm) => {
      return apiRequest("/api/doctor/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Consultation Completed",
        description: "Patient consultation has been saved successfully",
      });
      setSelectedPatient(null);
      setActiveTab("queue");
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/queue"] });
    },
  });

  const startConsultation = (patient: QueuePatient) => {
    setSelectedPatient(patient);
    setConsultationForm({
      patientId: patient.patientId,
      queueId: patient.id,
      chiefComplaint: patient.chiefComplaint,
      historyOfPresentingIllness: "",
      pastMedicalHistory: "",
      examination: "",
      diagnosis: "",
      icd10Codes: [],
      treatment: "",
      notes: "",
      followUpInstructions: "",
    });
    setActiveTab("consultation");
    startConsultationMutation.mutate(patient.id);
  };

  const suggestICD10Codes = async (diagnosis: string) => {
    if (diagnosis.length > 3) {
      // Mock ICD-10 suggestions
      const suggestions = [
        "I20.9 - Angina pectoris, unspecified",
        "I25.9 - Chronic ischemic heart disease, unspecified",
        "R06.0 - Dyspnea",
        "R50.9 - Fever, unspecified"
      ].filter(code => 
        code.toLowerCase().includes(diagnosis.toLowerCase()) ||
        diagnosis.toLowerCase().includes("chest") && code.includes("I20") ||
        diagnosis.toLowerCase().includes("fever") && code.includes("R50")
      );
      setIcdSuggestions(suggestions);
    }
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, {
      medicationName: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: 0,
      indication: ""
    }]);
  };

  const addLabOrder = () => {
    setLabOrders([...labOrders, {
      testType: "",
      testCode: "",
      urgency: "routine",
      clinicalInfo: ""
    }]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "normal": return "bg-blue-100 text-blue-800 border-blue-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTimeSinceCheckIn = (checkedInAt: string) => {
    const checkInTime = new Date(checkedInAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - checkInTime.getTime()) / (1000 * 60));
    return `${diffInMinutes} min ago`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600">Manage patient consultations and clinical workflow</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-teal-600 border-teal-200">
            <Stethoscope className="w-4 h-4 mr-1" />
            Clinician
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue">Patient Queue</TabsTrigger>
          <TabsTrigger value="consultation">Consultation</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="lab-orders">Lab Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Patient Queue ({patientQueue.length})
              </CardTitle>
              <CardDescription>
                Patients waiting for consultation, ordered by priority and check-in time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientQueue.map((patient) => (
                  <Card key={patient.id} className="border-l-4 border-l-teal-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-800 font-bold">
                              {patient.queueNumber}
                            </div>
                            <Badge className={getPriorityColor(patient.priority)}>
                              {patient.priority}
                            </Badge>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {patient.patient.firstName} {patient.patient.lastName}
                            </h3>
                            <p className="text-gray-600">ID: {patient.patient.patientId}</p>
                            <p className="text-sm text-gray-500">
                              {patient.patient.gender} • {patient.patient.phoneNumber}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex items-center text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {getTimeSinceCheckIn(patient.checkedInAt)}
                          </div>
                          <Button
                            onClick={() => startConsultation(patient)}
                            className="bg-teal-600 hover:bg-teal-700"
                          >
                            Start Consultation
                          </Button>
                        </div>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Chief Complaint</h4>
                          <p className="text-gray-700">{patient.chiefComplaint}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Vital Signs</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>BP: {patient.vitals.bloodPressure}</div>
                            <div>Temp: {patient.vitals.temperature}</div>
                            <div>Pulse: {patient.vitals.pulse}</div>
                            <div>RR: {patient.vitals.respiratoryRate}</div>
                          </div>
                        </div>
                      </div>
                      
                      {patient.triageNotes && (
                        <div className="mt-3">
                          <h4 className="font-medium text-gray-900 mb-1">Triage Notes</h4>
                          <p className="text-gray-600 text-sm">{patient.triageNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultation" className="space-y-4">
          {selectedPatient ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Consultation - {selectedPatient.patient.firstName} {selectedPatient.patient.lastName}
                </CardTitle>
                <CardDescription>
                  Complete consultation form with ICD-10 diagnosis codes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                    <Textarea
                      id="chiefComplaint"
                      value={consultationForm.chiefComplaint}
                      onChange={(e) => setConsultationForm({
                        ...consultationForm,
                        chiefComplaint: e.target.value
                      })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="historyOfPresentingIllness">History of Presenting Illness</Label>
                    <Textarea
                      id="historyOfPresentingIllness"
                      value={consultationForm.historyOfPresentingIllness}
                      onChange={(e) => setConsultationForm({
                        ...consultationForm,
                        historyOfPresentingIllness: e.target.value
                      })}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pastMedicalHistory">Past Medical History</Label>
                    <Textarea
                      id="pastMedicalHistory"
                      value={consultationForm.pastMedicalHistory}
                      onChange={(e) => setConsultationForm({
                        ...consultationForm,
                        pastMedicalHistory: e.target.value
                      })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="examination">Physical Examination</Label>
                    <Textarea
                      id="examination"
                      value={consultationForm.examination}
                      onChange={(e) => setConsultationForm({
                        ...consultationForm,
                        examination: e.target.value
                      })}
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input
                    id="diagnosis"
                    value={consultationForm.diagnosis}
                    onChange={(e) => {
                      setConsultationForm({
                        ...consultationForm,
                        diagnosis: e.target.value
                      });
                      suggestICD10Codes(e.target.value);
                    }}
                    placeholder="Enter primary diagnosis"
                  />
                  {icdSuggestions.length > 0 && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">ICD-10 Code Suggestions</h4>
                      <div className="space-y-1">
                        {icdSuggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="justify-start h-auto p-2 text-left"
                            onClick={() => {
                              const code = suggestion.split(' - ')[0];
                              setConsultationForm({
                                ...consultationForm,
                                icd10Codes: [...consultationForm.icd10Codes, code]
                              });
                            }}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {consultationForm.icd10Codes.length > 0 && (
                  <div>
                    <Label>Selected ICD-10 Codes</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {consultationForm.icd10Codes.map((code, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer">
                          {code}
                          <button
                            onClick={() => {
                              setConsultationForm({
                                ...consultationForm,
                                icd10Codes: consultationForm.icd10Codes.filter((_, i) => i !== index)
                              });
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="treatment">Treatment Plan</Label>
                    <Textarea
                      id="treatment"
                      value={consultationForm.treatment}
                      onChange={(e) => setConsultationForm({
                        ...consultationForm,
                        treatment: e.target.value
                      })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="followUpInstructions">Follow-up Instructions</Label>
                    <Textarea
                      id="followUpInstructions"
                      value={consultationForm.followUpInstructions}
                      onChange={(e) => setConsultationForm({
                        ...consultationForm,
                        followUpInstructions: e.target.value
                      })}
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={consultationForm.notes}
                    onChange={(e) => setConsultationForm({
                      ...consultationForm,
                      notes: e.target.value
                    })}
                    rows={2}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setActiveTab("queue")}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => submitConsultationMutation.mutate(consultationForm)}
                    disabled={submitConsultationMutation.isPending}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {submitConsultationMutation.isPending ? "Saving..." : "Complete Consultation"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a patient from the queue to start consultation</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Pill className="w-5 h-5 mr-2" />
                  Prescription Management
                </div>
                <Button onClick={addPrescription} size="sm">
                  Add Prescription
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No prescriptions added yet</p>
                  <Button onClick={addPrescription} className="mt-4">
                    Add First Prescription
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((prescription, index) => (
                    <Card key={index} className="border-dashed">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Medication Name</Label>
                            <Input
                              value={prescription.medicationName}
                              onChange={(e) => {
                                const updated = [...prescriptions];
                                updated[index].medicationName = e.target.value;
                                setPrescriptions(updated);
                              }}
                              placeholder="e.g., Amoxicillin"
                            />
                          </div>
                          <div>
                            <Label>Dosage</Label>
                            <Input
                              value={prescription.dosage}
                              onChange={(e) => {
                                const updated = [...prescriptions];
                                updated[index].dosage = e.target.value;
                                setPrescriptions(updated);
                              }}
                              placeholder="e.g., 500mg"
                            />
                          </div>
                          <div>
                            <Label>Frequency</Label>
                            <Select
                              value={prescription.frequency}
                              onValueChange={(value) => {
                                const updated = [...prescriptions];
                                updated[index].frequency = value;
                                setPrescriptions(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="once_daily">Once daily</SelectItem>
                                <SelectItem value="twice_daily">Twice daily</SelectItem>
                                <SelectItem value="three_times_daily">Three times daily</SelectItem>
                                <SelectItem value="four_times_daily">Four times daily</SelectItem>
                                <SelectItem value="as_needed">As needed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <Label>Duration</Label>
                            <Input
                              value={prescription.duration}
                              onChange={(e) => {
                                const updated = [...prescriptions];
                                updated[index].duration = e.target.value;
                                setPrescriptions(updated);
                              }}
                              placeholder="e.g., 7 days"
                            />
                          </div>
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={prescription.quantity}
                              onChange={(e) => {
                                const updated = [...prescriptions];
                                updated[index].quantity = parseInt(e.target.value) || 0;
                                setPrescriptions(updated);
                              }}
                              placeholder="Total tablets/capsules"
                            />
                          </div>
                          <div>
                            <Label>Indication</Label>
                            <Input
                              value={prescription.indication}
                              onChange={(e) => {
                                const updated = [...prescriptions];
                                updated[index].indication = e.target.value;
                                setPrescriptions(updated);
                              }}
                              placeholder="Reason for prescription"
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setPrescriptions(prescriptions.filter((_, i) => i !== index));
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <TestTube className="w-5 h-5 mr-2" />
                  Laboratory Orders
                </div>
                <Button onClick={addLabOrder} size="sm">
                  Add Lab Order
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {labOrders.length === 0 ? (
                <div className="text-center py-8">
                  <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No lab orders added yet</p>
                  <Button onClick={addLabOrder} className="mt-4">
                    Add First Lab Order
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {labOrders.map((order, index) => (
                    <Card key={index} className="border-dashed">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Test Type</Label>
                            <Select
                              value={order.testType}
                              onValueChange={(value) => {
                                const updated = [...labOrders];
                                updated[index].testType = value;
                                setLabOrders(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select test type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="complete_blood_count">Complete Blood Count (CBC)</SelectItem>
                                <SelectItem value="basic_metabolic_panel">Basic Metabolic Panel</SelectItem>
                                <SelectItem value="lipid_panel">Lipid Panel</SelectItem>
                                <SelectItem value="liver_function">Liver Function Tests</SelectItem>
                                <SelectItem value="thyroid_function">Thyroid Function Tests</SelectItem>
                                <SelectItem value="urinalysis">Urinalysis</SelectItem>
                                <SelectItem value="chest_xray">Chest X-Ray</SelectItem>
                                <SelectItem value="ecg">ECG/EKG</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Urgency</Label>
                            <Select
                              value={order.urgency}
                              onValueChange={(value: "routine" | "urgent" | "stat") => {
                                const updated = [...labOrders];
                                updated[index].urgency = value;
                                setLabOrders(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="routine">Routine</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="stat">STAT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label>Clinical Information</Label>
                          <Textarea
                            value={order.clinicalInfo}
                            onChange={(e) => {
                              const updated = [...labOrders];
                              updated[index].clinicalInfo = e.target.value;
                              setLabOrders(updated);
                            }}
                            placeholder="Clinical indication and relevant history"
                            rows={2}
                          />
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setLabOrders(labOrders.filter((_, i) => i !== index));
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-8">
        Powered by Aboolean
      </div>
    </div>
  );
}