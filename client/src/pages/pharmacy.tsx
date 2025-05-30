import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const medicationFormSchema = z.object({
  patientId: z.number(),
  providerId: z.number(),
  medicationName: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  indication: z.string().optional(),
  benefitCategory: z.string().optional(),
});

type MedicationFormData = z.infer<typeof medicationFormSchema>;

export default function Pharmacy() {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      medicationName: "",
      dosage: "",
      frequency: "twice-daily",
      duration: "",
      quantity: 1,
      indication: "",
      benefitCategory: "acute",
    },
  });

  const createMedicationMutation = useMutation({
    mutationFn: api.createMedication,
    onSuccess: (data) => {
      setValidationResult(data.validation);
      toast({
        title: "Prescription Processed",
        description: `Prescription ${data.prescriptionId} has been ${data.validationStatus}`,
        className: data.validationStatus === 'approved' ? "verification-success" : "verification-pending",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
    },
    onError: (error: any) => {
      toast({
        title: "Prescription Failed",
        description: error.message || "Failed to process prescription",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: MedicationFormData) => {
    if (!selectedPatient) {
      toast({
        title: "Patient Required",
        description: "Please select a patient first",
        variant: "destructive",
      });
      return;
    }

    await createMedicationMutation.mutateAsync({
      ...data,
      patientId: selectedPatient.id,
      providerId: 1, // Default provider
    });
  };

  // Mock patient data with demographics for dosing calculations
  const mockPatients = [
    { 
      id: 1, 
      name: "Emma Johnson", 
      patientId: "PT-2024-001", 
      age: 8, 
      weight: 25, 
      gender: "female",
      plan: "Pediatric Care+"
    },
    { 
      id: 2, 
      name: "Robert Smith", 
      patientId: "PT-2024-002", 
      age: 45, 
      weight: 80, 
      gender: "male",
      plan: "Premium Health"
    },
    { 
      id: 3, 
      name: "Maria Garcia", 
      patientId: "PT-2024-003", 
      age: 32, 
      weight: 65, 
      gender: "female",
      plan: "Family Plan"
    },
  ];

  const mockCurrentMedications = [
    { name: "Lisinopril 10mg", frequency: "Once daily", indication: "Hypertension", startDate: "Jan 2024" },
    { name: "Metformin 500mg", frequency: "Twice daily", indication: "Diabetes", startDate: "Dec 2023" },
  ];

  const mockBenefits = [
    { type: "Chronic Medications", used: 750, limit: 1000, percentage: 75 },
    { type: "Acute Medications", used: 225, limit: 500, percentage: 45 },
    { type: "Family Planning", used: 60, limit: 300, percentage: 20 },
  ];

  const getBenefitColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
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
                  <h1 className="text-3xl font-bold text-gray-900">Pharmacy Validation System</h1>
                  <p className="text-gray-600 mt-1">
                    Smart medication validation with weight-based dosing and safety checks
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full">
                  <i className="fas fa-pills text-purple-600"></i>
                  <span className="text-sm text-purple-600 font-medium">Smart Validation</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Patient & Prescription Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Patient Selection */}
                <Card className="medical-interface">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-user-circle text-teal-600"></i>
                      <span>Patient Selection</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedPatient?.id === patient.id
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{patient.name}</p>
                              <p className="text-sm text-gray-600">{patient.patientId}</p>
                              <div className="flex space-x-4 mt-1 text-xs text-gray-500">
                                <span>Age: {patient.age}</span>
                                <span>Weight: {patient.weight}kg</span>
                                <span>Gender: {patient.gender}</span>
                              </div>
                            </div>
                            <Badge variant="outline">{patient.plan}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Patient Demographics */}
                {selectedPatient && (
                  <Card className="medical-interface">
                    <CardContent className="pt-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <i className="fas fa-user-circle text-blue-600"></i>
                          <h3 className="font-medium text-blue-800">
                            Patient: {selectedPatient.name}
                          </h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-blue-700 font-medium">Age:</span>
                            <span className="ml-2">{selectedPatient.age} years</span>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">Weight:</span>
                            <span className="ml-2">{selectedPatient.weight} kg</span>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">Gender:</span>
                            <span className="ml-2">{selectedPatient.gender}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Prescription Form */}
                <Card className="medical-interface">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-prescription-bottle-alt text-purple-600"></i>
                      <span>Prescription Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="medicationName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Medication Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., Amoxicillin" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="dosage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dosage</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., 500mg" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="frequency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frequency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="once-daily">Once daily</SelectItem>
                                    <SelectItem value="twice-daily">Twice daily</SelectItem>
                                    <SelectItem value="three-times-daily">Three times daily</SelectItem>
                                    <SelectItem value="four-times-daily">Four times daily</SelectItem>
                                    <SelectItem value="as-needed">As needed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., 7 days" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="Number of units"
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="indication"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Clinical Indication</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select indication" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="acute-infection">Acute infection</SelectItem>
                                  <SelectItem value="chronic-condition">Chronic condition management</SelectItem>
                                  <SelectItem value="family-planning">Family planning</SelectItem>
                                  <SelectItem value="vaccination">Vaccination</SelectItem>
                                  <SelectItem value="pain-management">Pain management</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          disabled={createMedicationMutation.isPending || !selectedPatient}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          {createMedicationMutation.isPending ? (
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
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                {/* Validation Results */}
                {validationResult && (
                  <Card className="medical-interface">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <i className="fas fa-clipboard-check text-green-600"></i>
                        <span>Validation Results</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-3">
                            <i className="fas fa-weight text-green-500"></i>
                            <span className="text-green-800">
                              Weight-based dosage: {validationResult.isValid ? 'Appropriate' : 'Needs adjustment'}
                            </span>
                          </div>
                          <i className={`fas ${validationResult.isValid ? 'fa-check-circle text-green-500' : 'fa-exclamation-triangle text-yellow-500'}`}></i>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-3">
                            <i className={`fas ${selectedPatient?.gender === 'female' ? 'fa-venus' : 'fa-mars'} text-blue-500`}></i>
                            <span className="text-blue-800">Gender-appropriate medication selection</span>
                          </div>
                          <i className="fas fa-check-circle text-green-500"></i>
                        </div>

                        {validationResult.warnings?.length > 0 && (
                          <div className="space-y-2">
                            {validationResult.warnings.map((warning: string, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="flex items-center space-x-3">
                                  <i className="fas fa-exclamation-triangle text-yellow-500"></i>
                                  <span className="text-yellow-800">{warning}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center space-x-3">
                            <i className="fas fa-tags text-purple-500"></i>
                            <span className="text-purple-800">Auto-categorized: Acute medication benefit</span>
                          </div>
                          <span className="text-xs text-purple-600">$450 remaining</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column: Benefits & Current Medications */}
              <div className="space-y-6">
                {/* Pharmacy Benefits */}
                <Card className="medical-interface">
                  <CardHeader>
                    <CardTitle>Pharmacy Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockBenefits.map((benefit, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-800">{benefit.type}</span>
                            <span className="text-sm text-gray-600">{benefit.percentage}% used</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getBenefitColor(benefit.percentage)}`}
                              style={{ width: `${benefit.percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            ${benefit.used} of ${benefit.limit} used
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Current Medications */}
                <Card className="medical-interface">
                  <CardHeader>
                    <CardTitle>Current Medications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockCurrentMedications.map((medication, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-800">{medication.name}</div>
                          <div className="text-sm text-gray-600">{medication.frequency} - {medication.indication}</div>
                          <div className="text-xs text-gray-500">Started: {medication.startDate}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card className="medical-interface">
                  <CardHeader>
                    <CardTitle>Prescription Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">
                      <i className="fas fa-pills mr-2"></i>
                      Process Prescription
                    </Button>
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-save mr-2"></i>
                      Save for Review
                    </Button>
                    <Button variant="outline" className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                      <i className="fas fa-shield-alt mr-2"></i>
                      Request Prior Auth
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
