import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface DecisionLog {
  id: number;
  userId: number;
  patientId: number | null;
  decisionType: string;
  originalDecision: string;
  aiConfidence: string;
  reasoning: any;
  finalOutcome: string | null;
  appealOutcome: string | null;
  careManagerNotes: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface FeedbackFormProps {
  log: DecisionLog;
  onSuccess: () => void;
}

function FeedbackForm({ log, onSuccess }: FeedbackFormProps) {
  const [finalOutcome, setFinalOutcome] = useState(log.finalOutcome || '');
  const [appealOutcome, setAppealOutcome] = useState(log.appealOutcome || '');
  const [reviewerNotes, setReviewerNotes] = useState(log.careManagerNotes || '');
  
  const queryClient = useQueryClient();

  const updateFeedback = useMutation({
    mutationFn: async (data: { logId: number; finalOutcome: string; appealOutcome?: string; reviewerNotes?: string }) => {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update feedback');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/decision-logs'] });
      onSuccess();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalOutcome) return;

    updateFeedback.mutate({
      logId: log.id,
      finalOutcome,
      appealOutcome: appealOutcome || undefined,
      reviewerNotes: reviewerNotes || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="finalOutcome">Final Outcome *</Label>
        <Select value={finalOutcome} onValueChange={setFinalOutcome}>
          <SelectTrigger>
            <SelectValue placeholder="Select final outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
            <SelectItem value="approved_with_conditions">Approved with Conditions</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="appealOutcome">Appeal Outcome (if applicable)</Label>
        <Select value={appealOutcome} onValueChange={setAppealOutcome}>
          <SelectTrigger>
            <SelectValue placeholder="Select appeal outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No Appeal</SelectItem>
            <SelectItem value="appeal_approved">Appeal Approved</SelectItem>
            <SelectItem value="appeal_denied">Appeal Denied</SelectItem>
            <SelectItem value="appeal_pending">Appeal Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="reviewerNotes">Reviewer Notes</Label>
        <Textarea
          id="reviewerNotes"
          value={reviewerNotes}
          onChange={(e) => setReviewerNotes(e.target.value)}
          placeholder="Add any notes about the decision or review process..."
          rows={3}
        />
      </div>

      <Button 
        type="submit" 
        disabled={!finalOutcome || updateFeedback.isPending}
        className="w-full bg-teal-600 hover:bg-teal-700"
      >
        {updateFeedback.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Update Feedback
          </>
        )}
      </Button>
    </form>
  );
}

export function DecisionFeedbackPanel() {
  const [selectedLog, setSelectedLog] = useState<DecisionLog | null>(null);
  const [filterType, setFilterType] = useState<string>('');

  const { data: decisionLogs = [], isLoading } = useQuery({
    queryKey: ['/api/decision-logs', filterType],
    queryFn: async () => {
      const url = filterType ? `/api/decision-logs?type=${filterType}` : '/api/decision-logs';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch decision logs');
      return response.json() as Promise<DecisionLog[]>;
    }
  });

  const getDecisionIcon = (decision: string) => {
    switch (decision.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getOutcomeColor = (outcome: string | null) => {
    if (!outcome) return 'bg-gray-100 text-gray-800';
    switch (outcome.toLowerCase()) {
      case 'approved':
      case 'appeal_approved':
        return 'bg-green-100 text-green-800';
      case 'denied':
      case 'appeal_denied':
        return 'bg-red-100 text-red-800';
      case 'approved_with_conditions':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Decision Logs List */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Decision Logs
            </CardTitle>
            <CardDescription>
              Track and provide feedback on AI decisions
            </CardDescription>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="preauth">Preauthorization</SelectItem>
                  <SelectItem value="pharmacy_validation">Pharmacy Validation</SelectItem>
                  <SelectItem value="claims_validation">Claims Validation</SelectItem>
                  <SelectItem value="fraud_detection">Fraud Detection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                <span className="ml-2">Loading decision logs...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {decisionLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedLog?.id === log.id 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getDecisionIcon(log.originalDecision)}
                        <span className="font-medium">
                          {log.decisionType.replace('_', ' ').toUpperCase()}
                        </span>
                        <Badge variant="outline">
                          {log.aiConfidence}% confidence
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Original:</span>
                        <Badge className={`ml-1 ${getOutcomeColor(log.originalDecision)}`}>
                          {log.originalDecision}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-600">Final:</span>
                        {log.finalOutcome ? (
                          <Badge className={`ml-1 ${getOutcomeColor(log.finalOutcome)}`}>
                            {log.finalOutcome}
                          </Badge>
                        ) : (
                          <span className="ml-1 text-gray-400">Pending</span>
                        )}
                      </div>
                    </div>

                    {log.metadata && (
                      <div className="mt-2 text-xs text-gray-600">
                        {log.metadata.serviceType && (
                          <span>Service: {log.metadata.serviceType} • </span>
                        )}
                        {log.metadata.estimatedCost && (
                          <span>Cost: KES {log.metadata.estimatedCost}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {decisionLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No decision logs found for the selected criteria
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Form */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Provide Feedback
            </CardTitle>
            <CardDescription>
              Update outcome and add reviewer notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLog ? (
              <div className="space-y-4">
                {/* Log Details */}
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    {getDecisionIcon(selectedLog.originalDecision)}
                    <span className="font-medium">
                      {selectedLog.decisionType.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-gray-600">Original Decision:</span>
                      <Badge className={`ml-1 ${getOutcomeColor(selectedLog.originalDecision)}`}>
                        {selectedLog.originalDecision}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Confidence:</span>
                      <span className="ml-1 font-medium">{selectedLog.aiConfidence}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-1">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {selectedLog.reasoning && Array.isArray(selectedLog.reasoning) && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-600 font-medium">AI Reasoning:</span>
                      <div className="text-xs mt-1 space-y-1">
                        {selectedLog.reasoning.slice(0, 3).map((reason: string, index: number) => (
                          <div key={index} className="text-gray-700">
                            • {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Feedback Form */}
                <FeedbackForm 
                  log={selectedLog} 
                  onSuccess={() => setSelectedLog(null)} 
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Select a decision log to provide feedback</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}