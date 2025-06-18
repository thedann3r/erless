import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Pill, ShieldCheck, CreditCard, User, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PendingPrescription {
  id: number;
  patient: {
    firstName: string;
    lastName: string;
    patientId: string;
    gender: string;
    age: number;
    weight?: number;
    allergies: string[];
    currentMedications: string[];
  };
  doctor: {
    firstName: string;
    lastName: string;
    registrationNumber: string;
  };
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  indication: string;
  diagnosis: string;
  prescribedAt: string;
  benefitCategory: string;
  preauthorizationRequired: boolean;
  preauthorizationStatus: string;
}

interface BenefitInfo {
  category: string;
  usedAmount: number;
  remainingAmount: number;
  maximumBenefit: number;
  resetDate: string;
}

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  interactions: string[];
  recommendations: string[];
  estimatedCost: number;
  copayAmount: number;
}

export default function PharmacyDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("prescriptions");
  const [selectedPrescription, setSelectedPrescription] = useState<PendingPrescription | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [dispensingQuantity, setDispensingQuantity] = useState(0);
  const [daysSupply, setDaysSupply] = useState(0);

  // Fetch pending prescriptions
  const { data: prescriptions = [] } = useQuery({
    queryKey: ["/api/pharmacy/prescriptions/pending"],
    queryFn: async () => {
      // Mock prescription data
      return [
        {
          id: 1,
          patient: {
            firstName: "John",
            lastName: "Doe",
            patientId: "P001234",
            gender: "Male",
            age: 45,
            weight: 75,
            allergies: ["Penicillin"],
            currentMedications: ["Metformin 500mg", "Lisinopril 10mg"]
          },
          doctor: {
            firstName: "Dr. Sarah",
            lastName: "Wilson",
            registrationNumber: "KMP/12345"
          },
          medicationName: "Amoxicillin",
          dosage: "500mg",
          frequency: "Three times daily",
          duration: "7 days",
          quantity: 21,
          indication: "Bacterial infection",
          diagnosis: "Upper respiratory tract infection",
          prescribedAt: "2024-06-18T10:30:00Z",
          benefitCategory: "outpatient_drugs",
          preauthorizationRequired: false,
          preauthorizationStatus: "not_required"
        },
        {
          id: 2,
          patient: {
            firstName: "Mary",
            lastName: "Smith",
            patientId: "P001235",
            gender: "Female",
            age: 32,
            weight: 60,
            allergies: [],
            currentMedications: ["Oral contraceptive"]
          },
          doctor: {
            firstName: "Dr. James",
            lastName: "Brown",
            registrationNumber: "KMP/12346"
          },
          medicationName: "Insulin Glargine",
          dosage: "20 units",
          frequency: "Once daily",
          duration: "30 days",
          quantity: 1,
          indication: "Type 1 Diabetes",
          diagnosis: "Type 1 Diabetes Mellitus",
          prescribedAt: "2024-06-18T11:15:00Z",
          benefitCategory: "chronic_medications",
          preauthorizationRequired: true,
          preauthorizationStatus: "approved"
        }
      ] as PendingPrescription[];
    },
  });

  // Fetch patient benefits
  const { data: patientBenefits = [] } = useQuery({
    queryKey: ["/api/pharmacy/benefits", selectedPrescription?.patient.patientId],
    queryFn: async () => {
      if (!selectedPrescription) return [];
      // Mock benefit data
      return [
        {
          category: "outpatient_drugs",
          usedAmount: 15000,
          remainingAmount: 35000,
          maximumBenefit: 50000,
          resetDate: "2024-12-31"
        },
        {
          category: "chronic_medications",
          usedAmount: 8000,
          remainingAmount: 22000,
          maximumBenefit: 30000,
          resetDate: "2024-12-31"
        }
      ] as BenefitInfo[];
    },
    enabled: !!selectedPrescription,
  });

  const validatePrescriptionMutation = useMutation({
    mutationFn: async (prescriptionId: number) => {
      // Mock validation logic
      const prescription = prescriptions.find(p => p.id === prescriptionId);
      if (!prescription) throw new Error("Prescription not found");

      // Simulate validation checks
      const warnings = [];
      const interactions = [];
      const recommendations = [];

      // Check for allergies
      if (prescription.patient.allergies.includes("Penicillin") && 
          prescription.medicationName.toLowerCase().includes("amoxicillin")) {
        warnings.push("Patient has documented penicillin allergy - consider alternative antibiotic");
      }

      // Check for drug interactions
      if (prescription.patient.currentMedications.some(med => med.includes("Metformin")) &&
          prescription.medicationName.toLowerCase().includes("insulin")) {
        interactions.push("Monitor blood glucose closely when combining with Metformin");
      }

      // Age/weight-based dosing recommendations
      if (prescription.patient.age > 65) {
        recommendations.push("Consider reduced dose for elderly patient");
      }

      // Calculate estimated cost and copay
      const baseCost = prescription.quantity * 50; // Mock pricing
      const benefit = patientBenefits.find(b => b.category === prescription.benefitCategory);
      const copayPercentage = 10; // 10% copay
      const copayAmount = Math.round(baseCost * copayPercentage / 100);

      return {
        isValid: warnings.length === 0,
        warnings,
        interactions,
        recommendations,
        estimatedCost: baseCost,
        copayAmount
      } as ValidationResult;
    },
    onSuccess: (result) => {
      setValidationResult(result);
      if (result.warnings.length > 0) {
        toast({
          title: "Validation Warnings",
          description: `${result.warnings.length} warning(s) found. Please review before dispensing.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Validation Passed",
          description: "Prescription is safe to dispense",
        });
      }
    },
  });

  const dispenseMedicationMutation = useMutation({
    mutationFn: async (data: {
      prescriptionId: number;
      quantityDispensed: number;
      daysSupply: number;
      copayAmount: number;
    }) => {
      return apiRequest("/api/pharmacy/dispense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Medication Dispensed",
        description: "Prescription has been successfully dispensed and recorded",
      });
      setSelectedPrescription(null);
      setValidationResult(null);
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacy/prescriptions/pending"] });
    },
  });

  const validatePrescription = (prescription: PendingPrescription) => {
    setSelectedPrescription(prescription);
    setDispensingQuantity(prescription.quantity);
    setDaysSupply(parseInt(prescription.duration.split(' ')[0]) || 30);
    validatePrescriptionMutation.mutate(prescription.id);
  };

  const dispenseMedication = () => {
    if (!selectedPrescription || !validationResult) return;

    dispenseMedicationMutation.mutate({
      prescriptionId: selectedPrescription.id,
      quantityDispensed: dispensingQuantity,
      daysSupply: daysSupply,
      copayAmount: validationResult.copayAmount,
    });
  };

  const getPreauthorizationBadge = (status: string, required: boolean) => {
    if (!required) {
      return <Badge variant="secondary">Not Required</Badge>;
    }
    
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "denied":
        return <Badge className="bg-red-100 text-red-800">Denied</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getBenefitUtilization = (benefit: BenefitInfo) => {
    const percentage = (benefit.usedAmount / benefit.maximumBenefit) * 100;
    return {
      percentage,
      color: percentage > 80 ? "bg-red-500" : percentage > 60 ? "bg-yellow-500" : "bg-green-500"
    };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="text-gray-600">Validate prescriptions and manage medication dispensing</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-teal-600 border-teal-200">
            <Pill className="w-4 h-4 mr-1" />
            Pharmacist
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prescriptions">Pending Prescriptions</TabsTrigger>
          <TabsTrigger value="validation">Prescription Validation</TabsTrigger>
          <TabsTrigger value="dispensing">Dispensing History</TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="w-5 h-5 mr-2" />
                Pending Prescriptions ({prescriptions.length})
              </CardTitle>
              <CardDescription>
                Prescriptions awaiting validation and dispensing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <Card key={prescription.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Pill className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {prescription.patient.firstName} {prescription.patient.lastName}
                            </h3>
                            <p className="text-gray-600">ID: {prescription.patient.patientId}</p>
                            <p className="text-sm text-gray-500">
                              {prescription.patient.gender} • {prescription.patient.age} years
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {new Date(prescription.prescribedAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <Button
                            onClick={() => validatePrescription(prescription)}
                            className="bg-teal-600 hover:bg-teal-700"
                          >
                            Validate & Dispense
                          </Button>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Prescription Details</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>Medication:</strong> {prescription.medicationName} {prescription.dosage}</div>
                            <div><strong>Frequency:</strong> {prescription.frequency}</div>
                            <div><strong>Duration:</strong> {prescription.duration}</div>
                            <div><strong>Quantity:</strong> {prescription.quantity}</div>
                            <div><strong>Indication:</strong> {prescription.indication}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Clinical Information</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>Diagnosis:</strong> {prescription.diagnosis}</div>
                            <div><strong>Prescriber:</strong> {prescription.doctor.firstName} {prescription.doctor.lastName}</div>
                            <div><strong>Registration:</strong> {prescription.doctor.registrationNumber}</div>
                            <div><strong>Benefit Category:</strong> {prescription.benefitCategory.replace('_', ' ')}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <span className="text-sm text-gray-600">Preauthorization: </span>
                            {getPreauthorizationBadge(prescription.preauthorizationStatus, prescription.preauthorizationRequired)}
                          </div>
                          {prescription.patient.allergies.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span className="text-sm text-orange-700">
                                Allergies: {prescription.patient.allergies.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          {selectedPrescription ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Prescription Validation - {selectedPrescription.patient.firstName} {selectedPrescription.patient.lastName}
                  </CardTitle>
                  <CardDescription>
                    Review safety checks and benefit utilization before dispensing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Patient Benefits */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Benefit Utilization</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patientBenefits.map((benefit) => {
                        const utilization = getBenefitUtilization(benefit);
                        return (
                          <Card key={benefit.category} className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium capitalize">
                                {benefit.category.replace('_', ' ')}
                              </h4>
                              <span className="text-sm text-gray-600">
                                {utilization.percentage.toFixed(1)}% used
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className={`h-2 rounded-full ${utilization.color}`}
                                style={{ width: `${utilization.percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-sm text-gray-600">
                              KES {benefit.usedAmount.toLocaleString()} / KES {benefit.maximumBenefit.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Remaining: KES {benefit.remainingAmount.toLocaleString()}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  {/* Validation Results */}
                  {validationResult && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Safety Validation</h3>
                      
                      {validationResult.warnings.length > 0 && (
                        <Card className="border-orange-200 bg-orange-50 mb-4">
                          <CardContent className="p-4">
                            <div className="flex items-center mb-2">
                              <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                              <h4 className="font-medium text-orange-800">Warnings</h4>
                            </div>
                            <ul className="space-y-1">
                              {validationResult.warnings.map((warning, index) => (
                                <li key={index} className="text-sm text-orange-700">• {warning}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {validationResult.interactions.length > 0 && (
                        <Card className="border-yellow-200 bg-yellow-50 mb-4">
                          <CardContent className="p-4">
                            <div className="flex items-center mb-2">
                              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                              <h4 className="font-medium text-yellow-800">Drug Interactions</h4>
                            </div>
                            <ul className="space-y-1">
                              {validationResult.interactions.map((interaction, index) => (
                                <li key={index} className="text-sm text-yellow-700">• {interaction}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {validationResult.recommendations.length > 0 && (
                        <Card className="border-blue-200 bg-blue-50 mb-4">
                          <CardContent className="p-4">
                            <div className="flex items-center mb-2">
                              <ShieldCheck className="w-5 h-5 text-blue-600 mr-2" />
                              <h4 className="font-medium text-blue-800">Recommendations</h4>
                            </div>
                            <ul className="space-y-1">
                              {validationResult.recommendations.map((recommendation, index) => (
                                <li key={index} className="text-sm text-blue-700">• {recommendation}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {validationResult.warnings.length === 0 && 
                       validationResult.interactions.length === 0 && 
                       validationResult.recommendations.length === 0 && (
                        <Card className="border-green-200 bg-green-50">
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <ShieldCheck className="w-5 h-5 text-green-600 mr-2" />
                              <span className="text-green-800 font-medium">
                                No safety concerns identified. Safe to dispense.
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Dispensing Details */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Dispensing Information</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="quantity">Quantity to Dispense</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={dispensingQuantity}
                          onChange={(e) => setDispensingQuantity(parseInt(e.target.value) || 0)}
                          max={selectedPrescription.quantity}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Max: {selectedPrescription.quantity}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="daysSupply">Days Supply</Label>
                        <Input
                          id="daysSupply"
                          type="number"
                          value={daysSupply}
                          onChange={(e) => setDaysSupply(parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Patient Copay</Label>
                        <div className="p-2 bg-gray-50 rounded-md">
                          <span className="font-medium">
                            KES {validationResult?.copayAmount?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedPrescription(null);
                        setValidationResult(null);
                        setActiveTab("prescriptions");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={dispenseMedication}
                      disabled={dispenseMedicationMutation.isPending || !validationResult}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      {dispenseMedicationMutation.isPending ? "Dispensing..." : "Dispense Medication"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a prescription to validate</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dispensing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Dispensing History
              </CardTitle>
              <CardDescription>
                Recent medication dispensing records and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No dispensing records found</p>
                <p className="text-sm text-gray-500">Dispensed medications will appear here</p>
              </div>
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