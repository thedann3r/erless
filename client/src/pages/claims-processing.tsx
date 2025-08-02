import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ClaimsProcessing() {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    serviceType: "",
    procedureCode: "",
    diagnosisCode: "",
    description: "",
    serviceCost: "",
    providerId: ""
  });
  const { toast } = useToast();

  const { data: patients } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: providers } = useQuery({
    queryKey: ["/api/providers"],
  });

  const createClaimMutation = useMutation({
    mutationFn: async (claimData: any) => {
      const res = await apiRequest("POST", "/api/claims", claimData);
      return await res.json();
    },
    onSuccess: (claim) => {
      toast({
        title: "Claim Created",
        description: `Claim ${claim.claimId} has been successfully created`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      // Reset form
      setFormData({
        serviceType: "",
        procedureCode: "",
        diagnosisCode: "",
        description: "",
        serviceCost: "",
        providerId: ""
      });
      setSelectedPatient(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create claim. Please try again.",
        variant: "destructive",
      });
    },
  });

  const codeSuggestionMutation = useMutation({
    mutationFn: async (data: { serviceDescription: string; diagnosis?: string }) => {
      const res = await apiRequest("POST", "/api/ai/suggest-codes", data);
      return await res.json();
    },
    onSuccess: (suggestions) => {
      if (suggestions.codes.length > 0) {
        setFormData(prev => ({ ...prev, procedureCode: suggestions.codes[0] }));
        toast({
          title: "AI Code Suggestion",
          description: `Suggested code: ${suggestions.codes[0]} (${suggestions.confidence}% confidence)`,
        });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient first",
        variant: "destructive",
      });
      return;
    }

    const serviceCost = parseFloat(formData.serviceCost);
    const insuranceCoverage = serviceCost * 0.8; // 80% coverage
    const patientCopay = serviceCost - insuranceCoverage;

    createClaimMutation.mutate({
      patientId: selectedPatient.id,
      providerId: parseInt(formData.providerId),
      serviceType: formData.serviceType,
      procedureCode: formData.procedureCode,
      diagnosisCode: formData.diagnosisCode,
      description: formData.description,
      serviceCost: serviceCost.toString(),
      insuranceCoverage: insuranceCoverage.toString(),
      patientCopay: patientCopay.toString(),
    });
  };

  const suggestCodes = () => {
    if (formData.description) {
      codeSuggestionMutation.mutate({
        serviceDescription: formData.description,
        diagnosis: formData.diagnosisCode
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Claims Processing</h1>
            <p className="text-gray-600">Create and manage healthcare claims with AI assistance</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Patient Selection */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Selection</CardTitle>
                  <CardDescription>Choose the patient for this claim</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="patient-select">Select Patient</Label>
                    <Select onValueChange={(value) => {
                      const patient = patients?.find((p: any) => p.id.toString() === value);
                      setSelectedPatient(patient);
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
                    <div className="bg-teal-50 rounded-lg p-4 space-y-2">
                      <h4 className="font-medium text-teal-900">Patient Information</h4>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-teal-700">Name:</span>
                          <span className="ml-2">{selectedPatient.firstName} {selectedPatient.lastName}</span>
                        </div>
                        <div>
                          <span className="text-teal-700">ID:</span>
                          <span className="ml-2">{selectedPatient.patientId}</span>
                        </div>
                        <div>
                          <span className="text-teal-700">Insurance:</span>
                          <span className="ml-2">{selectedPatient.insuranceProvider}</span>
                        </div>
                        <div>
                          <span className="text-teal-700">Plan:</span>
                          <span className="ml-2">{selectedPatient.insurancePlan}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Claim Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-file-medical text-blue-600"></i>
                    <span>New Claim</span>
                    <div className="ai-indicator">
                      <i className="fas fa-robot mr-1"></i>
                      AI Assisted
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="serviceType">Service Type</Label>
                        <Select 
                          value={formData.serviceType}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">General Consultation</SelectItem>
                            <SelectItem value="specialist">Specialist Consultation</SelectItem>
                            <SelectItem value="laboratory">Laboratory Test</SelectItem>
                            <SelectItem value="pharmacy">Pharmacy</SelectItem>
                            <SelectItem value="emergency">Emergency Care</SelectItem>
                            <SelectItem value="imaging">Diagnostic Imaging</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="provider">Provider</Label>
                        <Select 
                          value={formData.providerId}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, providerId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {providers?.map((provider: any) => (
                              <SelectItem key={provider.id} value={provider.id.toString()}>
                                {provider.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Service Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the service provided..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="medical-form-input"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="procedureCode">Procedure Code (CPT)</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="procedureCode"
                            placeholder="99213"
                            value={formData.procedureCode}
                            onChange={(e) => setFormData(prev => ({ ...prev, procedureCode: e.target.value }))}
                            className="medical-form-input"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={suggestCodes}
                            disabled={!formData.description || codeSuggestionMutation.isPending}
                          >
                            <i className="fas fa-robot"></i>
                          </Button>
                        </div>
                        {codeSuggestionMutation.isPending && (
                          <p className="text-xs text-blue-600 mt-1">AI suggesting codes...</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="diagnosisCode">Diagnosis Code (ICD-10)</Label>
                        <Input
                          id="diagnosisCode"
                          placeholder="Z00.00"
                          value={formData.diagnosisCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, diagnosisCode: e.target.value }))}
                          className="medical-form-input"
                        />
                      </div>

                      <div>
                        <Label htmlFor="serviceCost">Service Cost ($)</Label>
                        <Input
                          id="serviceCost"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.serviceCost}
                          onChange={(e) => setFormData(prev => ({ ...prev, serviceCost: e.target.value }))}
                          className="medical-form-input"
                        />
                      </div>
                    </div>

                    {/* Real-time Billing Calculation */}
                    {formData.serviceCost && parseFloat(formData.serviceCost) > 0 && (
                      <Card className="bg-green-50 border-green-200">
                        <CardHeader>
                          <CardTitle className="text-green-800 text-lg">
                            <i className="fas fa-calculator mr-2"></i>
                            Real-time Billing Calculation
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Service Cost:</span>
                              <span className="font-medium">${parseFloat(formData.serviceCost).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Insurance Coverage (80%):</span>
                              <span className="font-medium text-green-600">
                                -${(parseFloat(formData.serviceCost) * 0.8).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-green-200 pt-2 font-semibold">
                              <span>Patient Copay:</span>
                              <span>${(parseFloat(formData.serviceCost) * 0.2).toFixed(2)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex space-x-4">
                      <Button 
                        type="submit" 
                        className="flex-1 teal-button"
                        disabled={createClaimMutation.isPending || !selectedPatient}
                      >
                        {createClaimMutation.isPending ? "Processing..." : "Submit Claim"}
                      </Button>
                      <Button type="button" variant="outline" className="flex-1">
                        Save Draft
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
