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
import { AIDecisionPanel } from "@/components/ai-decision-panel";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AIPreauth() {
  const [formData, setFormData] = useState({
    patientId: "",
    serviceType: "",
    clinicalJustification: "",
    estimatedCost: "",
    urgency: ""
  });
  const [aiDecision, setAIDecision] = useState<any>(null);
  const { toast } = useToast();

  const { data: patients } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: preauths } = useQuery({
    queryKey: ["/api/preauth"],
  });

  const submitPreauthMutation = useMutation({
    mutationFn: async (preauthData: any) => {
      const res = await apiRequest("POST", "/api/preauth", preauthData);
      return await res.json();
    },
    onSuccess: (result) => {
      setAIDecision(result);
      toast({
        title: "Preauthorization Processed",
        description: `AI decision: ${result.aiDecision.toUpperCase()} (${result.aiConfidence}% confidence)`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/preauth"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process preauthorization. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    submitPreauthMutation.mutate({
      patientId: parseInt(formData.patientId),
      serviceType: formData.serviceType,
      clinicalJustification: formData.clinicalJustification,
      estimatedCost: formData.estimatedCost,
      urgency: formData.urgency,
    });
  };

  const getStatusColor = (decision: string) => {
    switch (decision) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'denied': return 'text-red-600 bg-red-100';
      case 'review': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">AI Preauthorization</h1>
            <p className="text-gray-600">Intelligent preauthorization with Chain-of-Thought reasoning</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preauth Request Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-file-medical-alt text-blue-500"></i>
                    <span>Preauthorization Request</span>
                  </CardTitle>
                  <CardDescription>
                    Submit a new preauthorization request for AI analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="patient">Patient</Label>
                      <Select 
                        value={formData.patientId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
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

                    <div>
                      <Label htmlFor="serviceType">Treatment/Service</Label>
                      <Input
                        id="serviceType"
                        placeholder="e.g., MRI Brain with contrast"
                        value={formData.serviceType}
                        onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                        className="medical-form-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="justification">Clinical Justification</Label>
                      <Textarea
                        id="justification"
                        placeholder="Provide clinical reasoning for the requested service..."
                        rows={4}
                        value={formData.clinicalJustification}
                        onChange={(e) => setFormData(prev => ({ ...prev, clinicalJustification: e.target.value }))}
                        className="medical-form-input"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cost">Estimated Cost ($)</Label>
                        <Input
                          id="cost"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.estimatedCost}
                          onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                          className="medical-form-input"
                        />
                      </div>

                      <div>
                        <Label htmlFor="urgency">Urgency</Label>
                        <Select 
                          value={formData.urgency}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="routine">Routine</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full teal-button"
                      disabled={submitPreauthMutation.isPending}
                    >
                      {submitPreauthMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner animate-spin mr-2"></i>
                          AI Analyzing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-robot mr-2"></i>
                          Request AI Analysis
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* AI Decision Results */}
            <div className="space-y-6">
              {aiDecision ? (
                <AIDecisionPanel decision={aiDecision} />
              ) : (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <i className="fas fa-brain text-4xl text-gray-300 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      No AI Analysis Yet
                    </h3>
                    <p className="text-sm text-gray-400 text-center">
                      Submit a preauthorization request to see AI analysis with 
                      Chain-of-Thought reasoning and confidence scoring.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Recent AI Decisions */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Decisions</CardTitle>
                <CardDescription>Latest preauthorization decisions with AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {preauths && preauths.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-200">
                          <th className="pb-3 text-sm font-medium text-gray-600">Service</th>
                          <th className="pb-3 text-sm font-medium text-gray-600">Decision</th>
                          <th className="pb-3 text-sm font-medium text-gray-600">Confidence</th>
                          <th className="pb-3 text-sm font-medium text-gray-600">Time</th>
                          <th className="pb-3 text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-2">
                        {preauths.slice(0, 10).map((preauth: any) => (
                          <tr key={preauth.id} className="border-b border-gray-50">
                            <td className="py-3 text-sm">{preauth.serviceType}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(preauth.aiDecision)}`}>
                                {preauth.aiDecision.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 text-sm">{preauth.aiConfidence}%</td>
                            <td className="py-3 text-sm text-gray-500">
                              {new Date(preauth.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              <Button variant="ghost" size="sm">
                                View Reasoning
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <i className="fas fa-robot text-3xl mb-4 text-gray-300"></i>
                    <p>No AI decisions yet</p>
                    <p className="text-sm mt-2">Submit your first preauthorization request to see AI analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
