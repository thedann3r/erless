import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  warnings: string[];
  recommendations: string[];
  interactions: string[];
}

export default function Pharmacy() {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [prescriptionData, setPrescriptionData] = useState({
    medicationName: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: "",
    indication: "",
    patientWeight: ""
  });
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const { toast } = useToast();

  const { data: patients } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: patientMedications } = useQuery({
    queryKey: ["/api/patients", selectedPatient?.id, "medications"],
    enabled: !!selectedPatient?.id,
  });

  const validatePrescriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/pharmacy/validate", data);
      return await res.json();
    },
    onSuccess: (result) => {
      setValidationResult(result);
      toast({
        title: "Prescription Validated",
        description: `Validation ${result.isValid ? 'passed' : 'failed'} with ${result.confidence}% confidence`,
        variant: result.isValid ? "default" : "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Validation Error",
        description: "Failed to validate prescription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/pharmacy/prescriptions", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Prescription Created",
        description: "Prescription has been successfully processed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients", selectedPatient?.id, "medications"] });
      // Reset form
      setPrescriptionData({
        medicationName: "",
        dosage: "",
        frequency: "",
        duration: "",
        quantity: "",
        indication: "",
        patientWeight: ""
      });
      setValidationResult(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create prescription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleValidate = () => {
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient first",
        variant: "destructive",
      });
      return;
    }

    const age = Math.floor((Date.now() - new Date(selectedPatient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    validatePrescriptionMutation.mutate({
      patientId: selectedPatient.id,
      medicationName: prescriptionData.medicationName,
      dosage: prescriptionData.dosage,
      frequency: prescriptionData.frequency,
      patientAge: age,
      patientWeight: prescriptionData.patientWeight ? parseFloat(prescriptionData.patientWeight) : undefined,
      patientGender: selectedPatient.gender,
      indication: prescriptionData.indication,
      currentMedications: patientMedications || []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !validationResult?.isValid) {
      toast({
        title: "Error",
        description: "Please validate the prescription first",
        variant: "destructive",
      });
      return;
    }

    createPrescriptionMutation.mutate({
      patientId: selectedPatient.id,
      ...prescriptionData,
      quantity: parseInt(prescriptionData.quantity),
      isValidated: true,
      weightBasedDosing: !!prescriptionData.patientWeight,
      genderSensitive: selectedPatient.gender === 'female'
    });
  };

  const getValidationStatusColor = (isValid: boolean) => {
    return isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Pharmacy Validation</h1>
            <p className="text-gray-600">Smart medication validation with safety checks</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Patient Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-user-circle text-blue-600"></i>
                    <span>Patient Selection</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="patient-select">Select Patient</Label>
                      <Select onValueChange={(value) => {
                        const patient = patients?.find((p: any) => p.id.toString() === value);
                        setSelectedPatient(patient);
                        setValidationResult(null);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients?.map((patient: any) => (
                            <SelectItem key={patient.id} value={patient.id.toString()}>
                              {patient.firstName} {patient.lastName} - {patient.patientId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedPatient && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-3">Patient Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Age:</span>
                            <span>{Math.floor((Date.now() - new Date(selectedPatient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Gender:</span>
                            <span>{selectedPatient.gender}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Insurance:</span>
                            <span>{selectedPatient.insuranceProvider}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Current Medications */}
              {selectedPatient && (
                <Card>
                  <CardHeader>
                    <CardTitle>Current Medications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patientMedications && patientMedications.length > 0 ? (
                      <div className="space-y-3">
                        {patientMedications.map((med: any) => (
                          <div key={med.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-gray-900">{med.medicationName}</div>
                            <div className="text-sm text-gray-600">{med.dosage} - {med.frequency}</div>
                            <div className="text-xs text-gray-500">For: {med.indication}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No current medications</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Prescription Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-prescription-bottle-alt text-purple-500"></i>
                    <span>Prescription Details</span>
                  </CardTitle>
                  <CardDescription>
                    Enter medication information for validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="medicationName">Medication Name</Label>
                        <Input
                          id="medicationName"
                          placeholder="e.g., Amoxicillin"
                          value={prescriptionData.medicationName}
                          onChange={(e) => setPrescriptionData(prev => ({ ...prev, medicationName: e.target.value }))}
                          className="medical-form-input"
                        />
                      </div>

                      <div>
                        <Label htmlFor="dosage">Dosage</Label>
                        <Input
                          id="dosage"
                          placeholder="e.g., 500mg"
                          value={prescriptionData.dosage}
                          onChange={(e) => setPrescriptionData(prev => ({ ...prev, dosage: e.target.value }))}
                          className="medical-form-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select 
                          value={prescriptionData.frequency}
                          onValueChange={(value) => setPrescriptionData(prev => ({ ...prev, frequency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once-daily">Once daily</SelectItem>
                            <SelectItem value="twice-daily">Twice daily</SelectItem>
                            <SelectItem value="three-times-daily">Three times daily</SelectItem>
                            <SelectItem value="four-times-daily">Four times daily</SelectItem>
                            <SelectItem value="as-needed">As needed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          placeholder="e.g., 7 days"
                          value={prescriptionData.duration}
                          onChange={(e) => setPrescriptionData(prev => ({ ...prev, duration: e.target.value }))}
                          className="medical-form-input"
                        />
                      </div>

                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="Number of units"
                          value={prescriptionData.quantity}
                          onChange={(e) => setPrescriptionData(prev => ({ ...prev, quantity: e.target.value }))}
                          className="medical-form-input"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="indication">Clinical Indication</Label>
                      <Select 
                        value={prescriptionData.indication}
                        onValueChange={(value) => setPrescriptionData(prev => ({ ...prev, indication: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select indication" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="acute-infection">Acute infection</SelectItem>
                          <SelectItem value="chronic-condition">Chronic condition management</SelectItem>
                          <SelectItem value="family-planning">Family planning</SelectItem>
                          <SelectItem value="vaccination">Vaccination</SelectItem>
                          <SelectItem value="pain-management">Pain management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="patientWeight">Patient Weight (kg) - Optional</Label>
                      <Input
                        id="patientWeight"
                        type="number"
                        step="0.1"
                        placeholder="Weight for pediatric dosing"
                        value={prescriptionData.patientWeight}
                        onChange={(e) => setPrescriptionData(prev => ({ ...prev, patientWeight: e.target.value }))}
                        className="medical-form-input"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        onClick={handleValidate}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={validatePrescriptionMutation.isPending || !selectedPatient}
                      >
                        {validatePrescriptionMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner animate-spin mr-2"></i>
                            Validating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check-double mr-2"></i>
                            Validate Prescription
                          </>
                        )}
                      </Button>

                      <Button
                        type="submit"
                        className="flex-1 teal-button"
                        disabled={createPrescriptionMutation.isPending || !validationResult?.isValid}
                      >
                        {createPrescriptionMutation.isPending ? "Processing..." : "Process Prescription"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Validation Results */}
              {validationResult && (
                <Card className={getValidationStatusColor(validationResult.isValid)}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className={`fas ${validationResult.isValid ? 'fa-check-circle text-green-600' : 'fa-exclamation-triangle text-red-600'}`}></i>
                      <span>Validation Results</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          validationResult.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {validationResult.isValid ? 'VALID' : 'REQUIRES REVIEW'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium">AI Confidence:</span>
                        <span className="font-bold">{validationResult.confidence}%</span>
                      </div>

                      {validationResult.warnings.length > 0 && (
                        <div>
                          <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
                          <ul className="space-y-1">
                            {validationResult.warnings.map((warning, index) => (
                              <li key={index} className="text-sm text-yellow-700 flex items-start space-x-2">
                                <i className="fas fa-exclamation-triangle text-yellow-600 mt-0.5"></i>
                                <span>{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validationResult.interactions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-800 mb-2">Drug Interactions:</h4>
                          <ul className="space-y-1">
                            {validationResult.interactions.map((interaction, index) => (
                              <li key={index} className="text-sm text-red-700 flex items-start space-x-2">
                                <i className="fas fa-exclamation-circle text-red-600 mt-0.5"></i>
                                <span>{interaction}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validationResult.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium text-blue-800 mb-2">Recommendations:</h4>
                          <ul className="space-y-1">
                            {validationResult.recommendations.map((recommendation, index) => (
                              <li key={index} className="text-sm text-blue-700 flex items-start space-x-2">
                                <i className="fas fa-lightbulb text-blue-600 mt-0.5"></i>
                                <span>{recommendation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
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
