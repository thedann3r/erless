import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Stethoscope, 
  Pill, 
  TestTube, 
  Clock, 
  User, 
  FileText, 
  CheckCircle,
  Plus,
  Trash2,
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ActiveLabOrders from "@/components/active-lab-orders";

interface Patient {
  id: number;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber?: string;
  insuranceProvider: string;
  insurancePlan: string;
}

interface Prescription {
  id?: number;
  serviceName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface LabOrder {
  id?: number;
  serviceName: string;
  serviceCode?: string;
  instructions: string;
  durationDays: number;
}

interface Consultation {
  id?: number;
  patientId: string;
  chiefComplaint: string;
  history: string;
  examination: string;
  diagnosis: string;
  icdCode?: string;
  treatmentPlan: string;
  followUpDate?: string;
  vitals: {
    bloodPressure?: string;
    temperature?: string;
    pulse?: string;
    weight?: string;
    height?: string;
  };
}

export default function DoctorConsultation() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract patient ID from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const patientId = urlParams.get('patientId') || 'P001';
  
  const [consultation, setConsultation] = useState<Consultation>({
    patientId,
    chiefComplaint: '',
    history: '',
    examination: '',
    diagnosis: '',
    icdCode: '',
    treatmentPlan: '',
    followUpDate: '',
    vitals: {}
  });
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [isSigningOff, setIsSigningOff] = useState(false);

  // Fetch patient data
  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: [`/api/patients/${patientId}`],
    enabled: !!patientId
  });

  // Fetch existing consultation if available
  const { data: existingConsultation } = useQuery({
    queryKey: [`/api/consultations/patient/${patientId}`],
    enabled: !!patientId
  });

  useEffect(() => {
    if (existingConsultation && !existingConsultation.signedOff) {
      setConsultation(existingConsultation);
    }
  }, [existingConsultation]);

  const addPrescription = () => {
    setPrescriptions([...prescriptions, {
      serviceName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: keyof Prescription, value: string) => {
    const updated = [...prescriptions];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptions(updated);
  };

  const addLabOrder = () => {
    setLabOrders([...labOrders, {
      serviceName: '',
      serviceCode: '',
      instructions: '',
      durationDays: 180
    }]);
  };

  const removeLabOrder = (index: number) => {
    setLabOrders(labOrders.filter((_, i) => i !== index));
  };

  const updateLabOrder = (index: number, field: keyof LabOrder, value: string | number) => {
    const updated = [...labOrders];
    updated[index] = { ...updated[index], [field]: value };
    setLabOrders(updated);
  };

  // Sign off consultation mutation
  const signOffMutation = useMutation({
    mutationFn: async () => {
      // Save consultation
      const consultationResponse = await apiRequest('/api/consultations', {
        method: 'POST',
        body: JSON.stringify({
          ...consultation,
          signedOff: true,
          signedOffAt: new Date().toISOString()
        })
      });

      const consultationId = consultationResponse.id;

      // Save prescriptions
      for (const prescription of prescriptions) {
        if (prescription.serviceName.trim()) {
          await apiRequest('/api/services', {
            method: 'POST',
            body: JSON.stringify({
              patientId: consultation.patientId,
              type: 'pharmacy',
              serviceName: prescription.serviceName,
              dosage: prescription.dosage,
              frequency: prescription.frequency,
              duration: prescription.duration,
              instructions: prescription.instructions,
              status: 'active'
            })
          });
        }
      }

      // Save lab orders
      for (const labOrder of labOrders) {
        if (labOrder.serviceName.trim()) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + labOrder.durationDays);
          
          await apiRequest('/api/services', {
            method: 'POST',
            body: JSON.stringify({
              patientId: consultation.patientId,
              type: 'lab',
              serviceName: labOrder.serviceName,
              serviceCode: labOrder.serviceCode,
              instructions: labOrder.instructions,
              status: 'active',
              durationDays: labOrder.durationDays,
              expiresAt: expiresAt.toISOString()
            })
          });
        }
      }

      return consultationId;
    },
    onSuccess: () => {
      toast({
        title: "Consultation Signed Off",
        description: "Patient consultation completed with prescriptions and lab orders.",
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/consultations/patient/${patientId}`] });
      setLocation('/doctor');
    },
    onError: (error) => {
      toast({
        title: "Sign Off Failed", 
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSignOff = () => {
    if (!consultation.chiefComplaint || !consultation.diagnosis) {
      toast({
        title: "Missing Required Fields",
        description: "Please complete chief complaint and diagnosis before signing off.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSigningOff(true);
    signOffMutation.mutate();
  };

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Stethoscope className="h-8 w-8 text-teal-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Doctor Consultation</h1>
                <p className="text-gray-600">Complete patient consultation and sign-off</p>
              </div>
            </div>
            <Button
              onClick={() => setLocation('/doctor')}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Patient Information */}
        {patient && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Patient Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  <p className="text-lg font-semibold">{patient.firstName} {patient.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Patient ID</Label>
                  <p className="text-lg">{patient.patientId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Insurance</Label>
                  <p className="text-lg">{patient.insuranceProvider} - {patient.insurancePlan}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Gender</Label>
                  <p className="text-lg">{patient.gender}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                  <p className="text-lg">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p className="text-lg">{patient.phoneNumber || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Consultation Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vitals */}
            <Card>
              <CardHeader>
                <CardTitle>Vital Signs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodPressure">Blood Pressure</Label>
                    <Input
                      id="bloodPressure"
                      placeholder="120/80"
                      value={consultation.vitals.bloodPressure || ''}
                      onChange={(e) => setConsultation({
                        ...consultation,
                        vitals: { ...consultation.vitals, bloodPressure: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      placeholder="37.0"
                      value={consultation.vitals.temperature || ''}
                      onChange={(e) => setConsultation({
                        ...consultation,
                        vitals: { ...consultation.vitals, temperature: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pulse">Pulse (bpm)</Label>
                    <Input
                      id="pulse"
                      placeholder="72"
                      value={consultation.vitals.pulse || ''}
                      onChange={(e) => setConsultation({
                        ...consultation,
                        vitals: { ...consultation.vitals, pulse: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      placeholder="70"
                      value={consultation.vitals.weight || ''}
                      onChange={(e) => setConsultation({
                        ...consultation,
                        vitals: { ...consultation.vitals, weight: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Information */}
            <Card>
              <CardHeader>
                <CardTitle>Clinical Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
                  <Textarea
                    id="chiefComplaint"
                    placeholder="Patient's main complaint..."
                    value={consultation.chiefComplaint}
                    onChange={(e) => setConsultation({...consultation, chiefComplaint: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="history">History of Present Illness</Label>
                  <Textarea
                    id="history"
                    placeholder="Detailed history..."
                    value={consultation.history}
                    onChange={(e) => setConsultation({...consultation, history: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="examination">Physical Examination</Label>
                  <Textarea
                    id="examination"
                    placeholder="Examination findings..."
                    value={consultation.examination}
                    onChange={(e) => setConsultation({...consultation, examination: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="diagnosis">Diagnosis *</Label>
                    <Input
                      id="diagnosis"
                      placeholder="Primary diagnosis"
                      value={consultation.diagnosis}
                      onChange={(e) => setConsultation({...consultation, diagnosis: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="icdCode">ICD-10 Code</Label>
                    <Input
                      id="icdCode"
                      placeholder="A00.0"
                      value={consultation.icdCode || ''}
                      onChange={(e) => setConsultation({...consultation, icdCode: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="treatmentPlan">Treatment Plan</Label>
                  <Textarea
                    id="treatmentPlan"
                    placeholder="Treatment recommendations..."
                    value={consultation.treatmentPlan}
                    onChange={(e) => setConsultation({...consultation, treatmentPlan: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="followUpDate">Follow-up Date</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={consultation.followUpDate || ''}
                    onChange={(e) => setConsultation({...consultation, followUpDate: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prescriptions, Lab Orders and Active Lab Orders */}
          <div className="space-y-6">
            {/* Active Lab Orders */}
            <ActiveLabOrders patientId={patientId} doctorId={1} />
            {/* Prescriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Pill className="h-5 w-5" />
                    <span>Prescriptions</span>
                  </div>
                  <Button onClick={addPrescription} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </CardTitle>
                <CardDescription>
                  Medication prescriptions with duration
                </CardDescription>
              </CardHeader>
              <CardContent>
                {prescriptions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No prescriptions added</p>
                ) : (
                  <div className="space-y-4">
                    {prescriptions.map((prescription, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Prescription {index + 1}</h4>
                          <Button
                            onClick={() => removePrescription(index)}
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <Input
                            placeholder="Medication name"
                            value={prescription.serviceName}
                            onChange={(e) => updatePrescription(index, 'serviceName', e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              placeholder="Dosage (e.g., 500mg)"
                              value={prescription.dosage}
                              onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                            />
                            <Input
                              placeholder="Frequency (e.g., 2x daily)"
                              value={prescription.frequency}
                              onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                            />
                          </div>
                          <Input
                            placeholder="Duration (e.g., 7 days)"
                            value={prescription.duration}
                            onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                          />
                          <Textarea
                            placeholder="Instructions for patient"
                            value={prescription.instructions}
                            onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lab Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TestTube className="h-5 w-5" />
                    <span>Lab Orders</span>
                  </div>
                  <Button onClick={addLabOrder} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </CardTitle>
                <CardDescription>
                  Laboratory tests (auto-expire in 6 months)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {labOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No lab orders added</p>
                ) : (
                  <div className="space-y-4">
                    {labOrders.map((labOrder, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Lab Order {index + 1}</h4>
                          <Button
                            onClick={() => removeLabOrder(index)}
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <Input
                            placeholder="Test name (e.g., Full Blood Count)"
                            value={labOrder.serviceName}
                            onChange={(e) => updateLabOrder(index, 'serviceName', e.target.value)}
                          />
                          <Input
                            placeholder="Test code (optional)"
                            value={labOrder.serviceCode || ''}
                            onChange={(e) => updateLabOrder(index, 'serviceCode', e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Expires in (days)</Label>
                              <Input
                                type="number"
                                value={labOrder.durationDays}
                                onChange={(e) => updateLabOrder(index, 'durationDays', parseInt(e.target.value))}
                                min="1"
                                max="365"
                              />
                            </div>
                            <div className="flex items-end">
                              <Badge variant="outline" className="h-fit">
                                <Clock className="h-3 w-3 mr-1" />
                                {labOrder.durationDays} days
                              </Badge>
                            </div>
                          </div>
                          <Textarea
                            placeholder="Special instructions"
                            value={labOrder.instructions}
                            onChange={(e) => updateLabOrder(index, 'instructions', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sign Off Button */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium">Ready to sign off consultation?</p>
                  <p className="text-sm text-gray-600">
                    This will complete the consultation and activate all prescriptions and lab orders.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSignOff}
                disabled={isSigningOff || signOffMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isSigningOff || signOffMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing Off...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Sign Off Consultation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}