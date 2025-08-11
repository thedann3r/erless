import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIDecisionPanel } from "@/components/ai-decision-panel";
import { 
  Brain, FileCheck, Clock, CheckCircle, XCircle, 
  AlertTriangle, Lightbulb, Database, TrendingUp 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PreauthorizationRequest {
  patientId: number;
  serviceType: string;
  procedureCode: string;
  clinicalJustification: string;
  estimatedCost: number;
  urgency: string;
}

interface AIDecision {
  id: number;
  decision: string;
  confidence: number;
  reasoningChain: any;
  retrievedContext: any;
  processingTime: number;
  createdAt: string;
}

export default function PreauthorizationPage() {
  const [request, setRequest] = useState<Partial<PreauthorizationRequest>>({
    urgency: 'routine'
  });
  const [activeDecision, setActiveDecision] = useState<AIDecision | null>(null);

  const { data: recentDecisions, isLoading: isLoadingDecisions } = useQuery<AIDecision[]>({
    queryKey: ["/api/ai/decisions/recent"],
  });

  const preauthorizationMutation = useMutation({
    mutationFn: async (data: PreauthorizationRequest) => {
      const response = await apiRequest("POST", "/api/ai/preauthorization", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setActiveDecision(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.patientId || !request.serviceType || !request.procedureCode) {
      return;
    }
    preauthorizationMutation.mutate(request as PreauthorizationRequest);
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'review_required':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'review_required':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Preauthorization</h1>
          <p className="text-gray-600">Intelligent preauthorization with chain-of-thought reasoning</p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span className="text-sm text-gray-600">GPT-4o Powered</span>
        </div>
      </div>

      <Tabs defaultValue="request" className="space-y-6">
        <TabsList>
          <TabsTrigger value="request">New Request</TabsTrigger>
          <TabsTrigger value="decisions">Recent Decisions</TabsTrigger>
          <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                  <span>Preauthorization Request</span>
                </CardTitle>
                <CardDescription>
                  Submit a request for AI-powered preauthorization analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-id">Patient ID</Label>
                    <Input
                      id="patient-id"
                      type="number"
                      placeholder="12345"
                      value={request.patientId || ''}
                      onChange={(e) => setRequest(prev => ({ ...prev, patientId: parseInt(e.target.value) }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-type">Service/Treatment</Label>
                    <Input
                      id="service-type"
                      placeholder="e.g., MRI Brain with contrast"
                      value={request.serviceType || ''}
                      onChange={(e) => setRequest(prev => ({ ...prev, serviceType: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="procedure-code">Procedure Code</Label>
                    <Input
                      id="procedure-code"
                      placeholder="CPT/ICD-10 Code"
                      value={request.procedureCode || ''}
                      onChange={(e) => setRequest(prev => ({ ...prev, procedureCode: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="justification">Clinical Justification</Label>
                    <Textarea
                      id="justification"
                      rows={4}
                      placeholder="Provide detailed clinical reasoning for the requested service..."
                      value={request.clinicalJustification || ''}
                      onChange={(e) => setRequest(prev => ({ ...prev, clinicalJustification: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cost">Estimated Cost ($)</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={request.estimatedCost || ''}
                        onChange={(e) => setRequest(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="urgency">Urgency Level</Label>
                      <Select 
                        value={request.urgency} 
                        onValueChange={(value) => setRequest(prev => ({ ...prev, urgency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={preauthorizationMutation.isPending}
                  >
                    {preauthorizationMutation.isPending ? (
                      <>
                        <Brain className="w-4 h-4 mr-2 animate-pulse" />
                        AI Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Request AI Analysis
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* AI Decision Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>AI Decision Analysis</span>
                </CardTitle>
                <CardDescription>
                  Real-time AI reasoning and decision output
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!activeDecision ? (
                  <div className="text-center py-12 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No analysis yet</p>
                    <p className="text-sm">Submit a preauthorization request to see AI decision</p>
                  </div>
                ) : (
                  <AIDecisionPanel decision={activeDecision} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Decisions</CardTitle>
              <CardDescription>
                History of AI preauthorization decisions with reasoning
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDecisions ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : !recentDecisions || recentDecisions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No decisions found</p>
                  <p className="text-sm">AI decisions will appear here after requests are processed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDecisions.map((decision) => (
                    <div 
                      key={decision.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setActiveDecision(decision)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getDecisionIcon(decision.decision)}
                          <Badge className={getDecisionColor(decision.decision)} variant="secondary">
                            {decision.decision.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{decision.confidence?.toFixed(1)}% confidence</span>
                          <span>•</span>
                          <span>{decision.processingTime}ms</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{new Date(decision.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Decision Accuracy</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">
                  Based on human feedback
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.3s</div>
                <p className="text-xs text-muted-foreground">
                  Chain-of-thought analysis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auto-approval Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.3%</div>
                <p className="text-xs text-muted-foreground">
                  High confidence decisions
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span>AI Insights</span>
              </CardTitle>
              <CardDescription>
                Recent patterns and improvements in AI decision making
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    <strong>RAG Enhancement:</strong> AI is now retrieving more relevant historical cases, 
                    improving decision accuracy by 3.2% this month.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Learning Update:</strong> Chain-of-thought reasoning has been enhanced 
                    with new clinical guidelines for better policy compliance.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Performance:</strong> Processing time improved by 0.4s after model optimization. 
                    Human override rate decreased to 5.1%.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
