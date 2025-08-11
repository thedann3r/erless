import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface AIDecisionPanelProps {
  decision: {
    aiDecision: string;
    aiConfidence: number;
    aiReasoning: {
      reasoning?: {
        step: number;
        description: string;
        factor: string;
      }[];
      riskFactors?: string[];
      recommendations?: string[];
    };
    serviceType: string;
    estimatedCost: string;
  };
}

export function AIDecisionPanel({ decision }: AIDecisionPanelProps) {
  const getDecisionColor = (aiDecision: string) => {
    switch (aiDecision) {
      case 'approved': return 'border-green-200 bg-green-50';
      case 'denied': return 'border-red-200 bg-red-50';
      case 'review': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getDecisionIcon = (aiDecision: string) => {
    switch (aiDecision) {
      case 'approved': return 'fas fa-check-circle text-green-600';
      case 'denied': return 'fas fa-times-circle text-red-600';
      case 'review': return 'fas fa-exclamation-triangle text-yellow-600';
      default: return 'fas fa-question-circle text-gray-600';
    }
  };

  return (
    <Card className={getDecisionColor(decision.aiDecision)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <i className={getDecisionIcon(decision.aiDecision)}></i>
          <span>AI Decision: {decision.aiDecision.toUpperCase()}</span>
        </CardTitle>
        <CardDescription>
          {decision.serviceType} - ${parseFloat(decision.estimatedCost).toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Confidence Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">AI Confidence</span>
              <span className="text-sm font-bold">{decision.aiConfidence}%</span>
            </div>
            <Progress value={decision.aiConfidence} className="h-2" />
          </div>

          {/* Chain-of-Thought Reasoning */}
          {decision.aiReasoning.reasoning && decision.aiReasoning.reasoning.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                <i className="fas fa-brain text-blue-500"></i>
                <span>Chain-of-Thought Reasoning</span>
              </h4>
              
              <div className="space-y-3">
                {decision.aiReasoning.reasoning.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{step.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Factor: {step.factor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Factors */}
          {decision.aiReasoning.riskFactors && decision.aiReasoning.riskFactors.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                <i className="fas fa-exclamation-triangle text-yellow-500"></i>
                <span>Risk Factors</span>
              </h4>
              <ul className="space-y-2">
                {decision.aiReasoning.riskFactors.map((risk, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                    <i className="fas fa-warning text-yellow-500 mt-0.5 text-xs"></i>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {decision.aiReasoning.recommendations && decision.aiReasoning.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                <i className="fas fa-lightbulb text-blue-500"></i>
                <span>AI Recommendations</span>
              </h4>
              <ul className="space-y-2">
                {decision.aiReasoning.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                    <i className="fas fa-arrow-right text-blue-500 mt-0.5 text-xs"></i>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            {decision.aiDecision === 'approved' && (
              <Button className="flex-1 teal-button">
                Accept & Process
              </Button>
            )}
            {decision.aiDecision === 'review' && (
              <Button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white">
                Escalate to Human Review
              </Button>
            )}
            {decision.aiDecision === 'denied' && (
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                Submit Appeal
              </Button>
            )}
            <Button variant="outline" className="flex-1">
              Generate Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
