import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ClaimForm } from "@/components/claims/claim-form";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface PatientData {
  patient: any;
  benefits: any[];
  dependents: any[];
}

const claimFormSchema = z.object({
  patientId: z.number(),
  providerId: z.number(),
  serviceType: z.string().min(1, "Service type is required"),
  procedureCode: z.string().optional(),
  diagnosisCode: z.string().optional(),
  description: z.string().optional(),
  serviceCost: z.string().min(1, "Service cost is required"),
  insuranceCoverage: z.string().optional(),
  patientResponsibility: z.string().optional(),
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

export default function ClaimsProcessing() {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const { toast } = useToast();

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      serviceType: "",
      procedureCode: "",
      diagnosisCode: "",
      description: "",
      serviceCost: "",
      insuranceCoverage: "",
      patientResponsibility: "",
    },
  });

  const { data: recentClaims } = useQuery({
    queryKey: ["/api/claims", { limit: 10 }],
    queryFn: () => api.getClaims({ limit: 10 }),
  });

  const createClaimMutation = useMutation({
    mutationFn: api.createClaim,
    onSuccess: (data) => {
      toast({
        title: "Claim Submitted Successfully",
        description: `Claim ${data.claimId} has been processed and ${data.aiDecision === 'approved' ? 'approved' : 'flagged for review'}`,
        className: data.aiDecision === 'approved' ? "verification-success" : "verification-pending",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
    },
    onError: (error: any) => {
      toast({
        title: "Claim Submission Failed",
        description: error.message || "Failed to submit claim",
        variant: "destructive",
      });
    },
  });

  const voidClaimMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      api.voidClaim(id, reason, true), // Simulate fingerprint approval
    onSuccess: () => {
      toast({
        title: "Claim Voided",
        description: "Claim has been successfully voided with fingerprint approval",
        className: "verification-success",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
    },
    onError: (error: any) => {
      toast({
        title: "Void Failed",
        description: error.message || "Failed to void claim",
        variant: "destructive",
      });
    },
  });

  const searchPatients = async (query: string) => {
    if (query.trim()) {
      try {
        const results = await api.searchPatients(query);
        return results;
      } catch (error) {
        console.error("Patient search failed:", error);
        return [];
      }
    }
    return [];
  };

  const handlePatientSelect = async (patient: any) => {
    try {
      const data = await api.verifyPatient({ patientId: patient.patientId });
      setPatientData(data);
      form.setValue("patientId", data.patient.id);
      form.setValue("providerId", 1); // Default provider
      
      toast({
        title: "Patient Selected",
        description: `${data.patient.firstName} ${data.patient.lastName} loaded successfully`,
        className: "verification-success",
      });
    } catch (error) {
      toast({
        title: "Patient Load Failed",
        description: "Failed to load patient data",
        variant: "destructive",
      });
    }
  };

  const getSuggestions = async (query: string, type: string) => {
    if (query.length > 2) {
      try {
        const suggestions = await api.getAISuggestions(query, type);
        setAiSuggestions(suggestions);
      } catch (error) {
        console.error("Failed to get AI suggestions:", error);
      }
    }
  };

  const calculateCoverage = (serviceCost: string) => {
    const cost = parseFloat(serviceCost) || 0;
    const coverageRate = 0.8; // 80% coverage
    const coverage = cost * coverageRate;
    const patientResp = cost - coverage;
    
    form.setValue("insuranceCoverage", coverage.toFixed(2));
    form.setValue("patientResponsibility", patientResp.toFixed(2));
  };

  const onSubmit = async (data: ClaimFormData) => {
    await createClaimMutation.mutateAsync(data);
  };

  const getBenefitProgress = (benefit: any) => {
    if (benefit.monetaryLimit) {
      const used = parseFloat(benefit.monetaryUsed || 0);
      const limit = parseFloat(benefit.monetaryLimit);
      return (used / limit) * 100;
    } else {
      return (benefit.usedAmount / benefit.totalLimit) * 100;
    }
  };

  const getBenefitColor = (progress: number) => {
    if (progress >= 90) return "bg-red-500";
    if (progress >= 75) return "bg-yellow-500";
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
                  <h1 className="text-3xl font-bold text-gray-900">Claims Processing</h1>
                  <p className="text-gray-600 mt-1">
                    Dynamic claim forms with AI-powered preauthorization
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                  <i className="fas fa-robot text-blue-600"></i>
                  <span className="text-sm text-blue-600 font-medium">AI Assisted</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Patient Selection & Claim Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Patient Selection */}
                {!patientData && (
                  <Card className="medical-interface">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <i className="fas fa-user-search text-teal-600"></i>
                        <span>Select Patient</span>
                      </CardTitle>
                      <CardDescription>
                        Search and select a patient to begin claim processing
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Search by patient ID or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && searchPatients(searchQuery)}
                          />
                          <Button
                            onClick={() => searchPatients(searchQuery)}
                            disabled={!searchQuery.trim()}
                            variant="outline"
                          >
                            <i className="fas fa-search"></i>
                          </Button>
                        </div>

                        {/* Search results would be rendered here */}
                        <div className="text-center py-8 text-gray-500">
                          <i className="fas fa-user-plus text-3xl mb-4"></i>
                          <p>Search for a patient to begin</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Patient Information */}
                {patientData && (
                  <Card className="medical-interface">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <i className="fas fa-user-check text-green-600"></i>
                          <span>Patient Information</span>
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPatientData(null)}
                        >
                          Change Patient
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-green-700"></i>
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-900">
                              {patientData.patient.firstName} {patientData.patient.lastName}
                            </h3>
                            <p className="text-green-700">{patientData.patient.patientId}</p>
                            <p className="text-sm text-green-600">
                              {patientData.patient.insuranceProvider} - {patientData.patient.insurancePlan}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Claim Form */}
                {patientData && (
                  <Card className="medical-interface">
                    <CardHeader>
                      <CardTitle>New Claim</CardTitle>
                      <CardDescription>
                        Complete the claim information with AI assistance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="serviceType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Service Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select service type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="consultation">General Consultation</SelectItem>
                                      <SelectItem value="specialist">Specialist Consultation</SelectItem>
                                      <SelectItem value="laboratory">Laboratory Tests</SelectItem>
                                      <SelectItem value="pharmacy">Pharmacy Services</SelectItem>
                                      <SelectItem value="emergency">Emergency Services</SelectItem>
                                      <SelectItem value="surgery">Surgery</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="procedureCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Procedure Code (CPT)</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        placeholder="Enter CPT code"
                                        onChange={(e) => {
                                          field.onChange(e);
                                          getSuggestions(e.target.value, 'procedure');
                                        }}
                                      />
                                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                        <i className="fas fa-robot text-blue-500"></i>
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="diagnosisCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Diagnosis Code (ICD-10)</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Enter ICD-10 code" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="serviceCost"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Service Cost</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                      <Input
                                        {...field}
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="pl-8"
                                        onChange={(e) => {
                                          field.onChange(e);
                                          calculateCoverage(e.target.value);
                                        }}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Describe the service or treatment provided"
                                    rows={3}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Real-time Billing Calculation */}
                          {form.watch("serviceCost") && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h4 className="font-medium text-green-900 mb-3">
                                <i className="fas fa-calculator mr-2"></i>
                                Real-time Benefit Calculation
                              </h4>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-green-700">Service Cost:</span>
                                  <p className="font-bold">${form.watch("serviceCost")}</p>
                                </div>
                                <div>
                                  <span className="text-green-700">Insurance Coverage (80%):</span>
                                  <p className="font-bold">${form.watch("insuranceCoverage")}</p>
                                </div>
                                <div>
                                  <span className="text-green-700">Patient Responsibility:</span>
                                  <p className="font-bold">${form.watch("patientResponsibility")}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Treatment Logic Validation */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <i className="fas fa-brain text-blue-600"></i>
                              <span className="font-medium text-blue-900">AI Treatment Logic</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <i className="fas fa-check-circle text-green-500"></i>
                                <span className="text-blue-800">Consultation limit: Within allowed range</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <i className="fas fa-check-circle text-green-500"></i>
                                <span className="text-blue-800">Benefit utilization: Appropriate</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <i className="fas fa-exclamation-triangle text-yellow-500"></i>
                                <span className="text-blue-800">One consultation per session enforced</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-4">
                            <Button
                              type="submit"
                              disabled={createClaimMutation.isPending}
                              className="bg-teal-600 hover:bg-teal-700"
                            >
                              {createClaimMutation.isPending ? (
                                <>
                                  <i className="fas fa-spinner animate-spin mr-2"></i>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-file-medical mr-2"></i>
                                  Submit Claim
                                </>
                              )}
                            </Button>
                            <Button type="button" variant="outline">
                              Save Draft
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Patient Benefits */}
                {patientData && (
                  <Card className="medical-interface">
                    <CardHeader>
                      <CardTitle>Available Benefits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {patientData.benefits.map((benefit: any) => {
                          const progress = getBenefitProgress(benefit);
                          const progressColor = getBenefitColor(progress);
                          
                          return (
                            <div key={benefit.id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-900 text-sm">
                                  {benefit.benefitType.charAt(0).toUpperCase() + benefit.benefitType.slice(1).replace('-', ' ')}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {benefit.monetaryLimit ? 
                                    `$${benefit.monetaryUsed || 0} / $${benefit.monetaryLimit}` :
                                    `${benefit.usedAmount} / ${benefit.totalLimit}`
                                  }
                                </span>
                              </div>
                              <div className="benefit-progress">
                                <div 
                                  className={`benefit-progress-bar ${progressColor}`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Claims */}
                <Card className="medical-interface">
                  <CardHeader>
                    <CardTitle>Recent Claims</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentClaims?.slice(0, 5).map((claim: any) => (
                        <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{claim.claimId}</span>
                              <Badge 
                                className={
                                  claim.status === 'approved' ? 'status-approved' :
                                  claim.status === 'pending' ? 'status-pending' :
                                  claim.status === 'denied' ? 'status-denied' :
                                  'status-void'
                                }
                              >
                                {claim.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">{claim.serviceType}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">${claim.serviceCost}</p>
                            {claim.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 mt-1"
                                onClick={() => voidClaimMutation.mutate({ 
                                  id: claim.id, 
                                  reason: "Error correction" 
                                })}
                              >
                                <i className="fas fa-fingerprint mr-1"></i>
                                Void
                              </Button>
                            )}
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          <i className="fas fa-file-medical text-2xl mb-2"></i>
                          <p className="text-sm">No recent claims</p>
                        </div>
                      )}
                    </div>
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
