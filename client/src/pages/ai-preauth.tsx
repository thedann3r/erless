import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DecisionPanel } from "@/components/ai/decision-panel";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const preauthFormSchema = z.object({
  patientId: z.number(),
  providerId: z.number(),
  treatmentService: z.string().min(1, "Treatment/service is required"),
  clinicalJustification: z.string().min(10, "Clinical justification must be at least 10 characters"),
  estimatedCost: z.string().min(1, "Estimated cost is required"),
  urgency: z.enum(["routine", "urgent", "emergency"]),
});

type PreauthFormData = z.infer<typeof preauthFormSchema>;

export default function AIPreauth() {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [aiDecision, setAiDecision] = useState<any>(null);
  const [showReasoningChain, setShowReasoningChain] = useState(false);
  const { toast } = useToast();

  const form = useForm<PreauthFormData>({
    resolver: zodResolver(preauthFormSchema),
    defaultValues: {
      treatmentService: "",
      clinicalJustification: "",
      estimatedCost: "",
      urgency: "routine",
    },
  });

  const { data: recentPreauths } = useQuery({
    queryKey: ["/api/preauthorizations", { limit: 10 }],
    queryFn: () => api.getPreauths(10),
  });

  const { data: aiDecisions } = useQuery({
    queryKey: ["/api/ai/decisions", { limit: 10 }],
    queryFn: () => api.getAIDecisions(10),
  });

  const createPreauthMutation = useMutation({
    mutationFn: api.createPreauth,
    onSuccess: (data) => {
      setAiDecision(data);
      toast({
        title: "Preauthorization Processed",
        description: `Request ${data.requestId} has been ${data.aiDecision} by AI`,
        className: data.aiDecision === 'approved' ? "verification-success" : "verification-pending",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/preauthorizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/decisions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Preauthorization Failed",
        description: error.message || "Failed to process preauthorization",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: PreauthFormData) => {
    if (!selectedPatient) {
      toast({
        title: "Patient Required",
        description: "Please select a patient first",
        variant: "destructive",
      });
      return;
    }

    await createPreauthMutation.mutateAsync({
      ...data,
      patientId: selectedPatient.id,
      providerId: 1, // Default provider
    });
  };

  const mockPatients = [
    { id: 1, name: "John Smith", patientId: "PT-2024-001", plan: "Premium Health+" },
    { id: 2, name: "Maria Garcia", patientId: "PT-2024-002", plan: "Basic Care" },
    { id: 3, name: "David Chen", patientId: "PT-2024-003", plan: "Family Plan" },
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'approved': return 'status-approved';
      case 'denied': return 'status-denied';
      default: return 'status-pending';
    }
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
                  <h1 className="text-3xl font-bold text-gray-900">AI Preauthorization</h1>
                  <p className="text-gray-600 mt-1">
                    Intelligent preauthorization with chain-of-thought reasoning
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full">
                  <i className="fas fa-brain text-purple-600"></i>
                  <span className="text-sm text-purple-600 font-medium">AI Engine Active</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preauthorization Request Form */}
              <div className="space-y-6">
                {/* Patient Selection */}
                <Card className="medical-interface">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-user-md text-teal-600"></i>
                      <span>Patient Selection</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
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
                            </div>
                            <Badge variant="outline">{patient.plan}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Preauthorization Form */}
                <Card className="medical-interface">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-file-medical-alt text-blue-600"></i>
                      <span>Preauthorization Request</span>
                    </CardTitle>
                    <CardDescription>
                      Submit request for AI analysis and approval
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="treatmentService"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Treatment/Service</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="e.g., MRI Brain with contrast"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="clinicalJustification"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Clinical Justification</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Provide detailed clinical reasoning for the requested service"
                                  rows={4}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="estimatedCost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estimated Cost</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      className="pl-8"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="urgency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Urgency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select urgency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="routine">Routine</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={createPreauthMutation.isPending || !selectedPatient}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {createPreauthMutation.isPending ? (
                            <>
                              <i className="fas fa-spinner animate-spin mr-2"></i>
                              Analyzing with AI...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-robot mr-2"></i>
                              Request AI Analysis
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              {/* AI Decision and Analysis */}
              <div className="space-y-6">
                {/* AI Decision Result */}
                {aiDecision && (
                  <Card className="medical-interface">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <i className="fas fa-brain text-purple-600"></i>
                        <span>AI Decision</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DecisionPanel decision={aiDecision} />
                    </CardContent>
                  </Card>
                )}

                {/* Chain-of-Thought Reasoning */}
                {aiDecision && aiDecision.aiReasoningChain && (
                  <Card className="medical-interface">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <i className="fas fa-thought-bubble text-blue-600"></i>
                        <span>Reasoning Chain</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Array.isArray(aiDecision.aiReasoningChain) ? 
                          aiDecision.aiReasoningChain.map((step: any, index: number) => (
                            <div key={index} className="reasoning-step">
                              <div className="reasoning-number">{index + 1}</div>
                              <div className="text-sm text-blue-800">
                                <span className="font-medium">Step {index + 1}:</span>
                                <span className="ml-2">{typeof step === 'string' ? step : step.description || 'Analysis step'}</span>
                              </div>
                            </div>
                          )) : (
                            <div className="reasoning-step">
                              <div className="reasoning-number">✓</div>
                              <div className="text-sm text-blue-800">
                                <span className="font-medium">Analysis Complete:</span>
                                <span className="ml-2">AI decision based on clinical guidelines and policy review</span>
                              </div>
                            </div>
                          )
                        }
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* RAG Retrieved Context */}
                {aiDecision && aiDecision.ragContext && (
                  <Card className="medical-interface">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <i className="fas fa-database text-purple-600"></i>
                        <span>Retrieved Context (RAG)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="space-y-2 text-sm text-purple-800">
                          <div>• Patient history reviewed for similar treatments</div>
                          <div>• Policy guidelines checked for coverage criteria</div>
                          <div>• Provider track record considered in decision</div>
                          <div>• Cost analysis compared to similar cases</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent AI Decisions */}
                <Card className="medical-interface">
                  <CardHeader>
                    <CardTitle>Recent AI Decisions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiDecisions?.slice(0, 5).map((decision: any) => (
                        <div key={decision.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge className={getDecisionColor(decision.decision)}>
                                {decision.decision.toUpperCase()}
                              </Badge>
                              <span className="text-sm font-medium">
                                {decision.entityType} #{decision.entityId}
                              </span>
                            </div>
                            <div className="ai-confidence mt-1">
                              <div className="ai-confidence-bar">
                                <div 
                                  className="ai-confidence-fill" 
                                  style={{ width: `${decision.confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{decision.confidence}% confidence</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <i className="fas fa-eye mr-1"></i>
                            View
                          </Button>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          <i className="fas fa-robot text-2xl mb-2"></i>
                          <p className="text-sm">No AI decisions yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Preauthorizations Table */}
            <Card className="medical-interface mt-8">
              <CardHeader>
                <CardTitle>Recent Preauthorizations</CardTitle>
                <CardDescription>Latest preauthorization requests and their AI decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="pb-3 text-sm font-medium text-gray-600">Request ID</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Patient</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Service</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Cost</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Urgency</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Decision</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Confidence</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Time</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {recentPreauths?.map((preauth: any) => (
                        <tr key={preauth.id} className="border-b border-gray-50">
                          <td className="py-3 text-sm font-mono">{preauth.requestId}</td>
                          <td className="py-3 text-sm">Patient #{preauth.patientId}</td>
                          <td className="py-3 text-sm">{preauth.treatmentService}</td>
                          <td className="py-3 text-sm">${preauth.estimatedCost}</td>
                          <td className="py-3">
                            <Badge className={getUrgencyColor(preauth.urgency)}>
                              {preauth.urgency}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge className={getDecisionColor(preauth.aiDecision)}>
                              {preauth.aiDecision}
                            </Badge>
                          </td>
                          <td className="py-3 text-sm">{preauth.aiConfidence}%</td>
                          <td className="py-3 text-sm text-gray-500">
                            {new Date(preauth.submittedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-500">
                            <i className="fas fa-file-medical-alt text-2xl mb-2"></i>
                            <p>No preauthorizations found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
