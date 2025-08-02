import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight, 
  Brain, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Lightbulb,
  Target,
  TrendingUp
} from "lucide-react";

interface ChainOfThoughtProps {
  reasoning: string[];
  conclusion: string;
  confidence: number;
  decision?: 'approved' | 'denied' | 'requires_review';
  supportingEvidence?: string[];
  conditions?: string[];
  chainOfThought?: boolean;
  title?: string;
}

export function ChainOfThoughtDisplay({ 
  reasoning, 
  conclusion, 
  confidence, 
  decision,
  supportingEvidence = [],
  conditions = [],
  chainOfThought = false,
  title = "Decision Analysis"
}: ChainOfThoughtProps) {
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  const getDecisionIcon = () => {
    switch (decision) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'requires_review':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Brain className="h-5 w-5 text-teal-600" />;
    }
  };

  const getDecisionColor = () => {
    switch (decision) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'denied':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'requires_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-teal-100 text-teal-800 border-teal-200';
    }
  };

  const getConfidenceColor = () => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-2 border-teal-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-teal-600" />
            <CardTitle className="text-lg">{title}</CardTitle>
            {chainOfThought && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Chain of Thought
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className={`h-4 w-4 ${getConfidenceColor()}`} />
            <span className={`text-sm font-medium ${getConfidenceColor()}`}>
              {confidence}% confidence
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Decision Summary */}
        {decision && (
          <div className={`p-4 rounded-xl border-2 ${getDecisionColor()}`}>
            <div className="flex items-center space-x-2 mb-2">
              {getDecisionIcon()}
              <span className="font-semibold capitalize">
                {decision.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm">{conclusion}</p>
          </div>
        )}

        {/* Reasoning Chain */}
        <Collapsible open={isReasoningOpen} onOpenChange={setIsReasoningOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Reasoning Process ({reasoning.length} steps)</span>
              </div>
              {isReasoningOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-3">
              {reasoning.map((step, index) => (
                <div key={index} className="flex space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Supporting Evidence */}
        {supportingEvidence.length > 0 && (
          <Collapsible open={isEvidenceOpen} onOpenChange={setIsEvidenceOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Supporting Evidence ({supportingEvidence.length} items)</span>
                </div>
                {isEvidenceOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="space-y-2">
                {supportingEvidence.map((evidence, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{evidence}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Conditions */}
        {conditions.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Conditions & Requirements</span>
            </h4>
            <ul className="space-y-1">
              {conditions.map((condition, index) => (
                <li key={index} className="text-sm text-blue-700">
                  • {condition}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Chain of Thought Badge */}
        {chainOfThought && (
          <div className="text-center">
            <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-purple-200">
              Powered by DeepSeek Chain of Thought Reasoning
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simplified version for inline display
export function InlineChainOfThought({ 
  reasoning, 
  confidence, 
  decision 
}: { 
  reasoning: string[]; 
  confidence: number; 
  decision?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-purple-200 bg-purple-50 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-800">
            Reasoning Available ({confidence}% confidence)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-6 px-2 text-purple-600 hover:bg-purple-100"
        >
          {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>
      </div>
      
      {isOpen && (
        <div className="mt-3 space-y-2">
          {reasoning.slice(0, 3).map((step, index) => (
            <div key={index} className="text-xs text-purple-700 bg-white p-2 rounded">
              {index + 1}. {step}
            </div>
          ))}
          {reasoning.length > 3 && (
            <p className="text-xs text-purple-600 italic">
              +{reasoning.length - 3} more reasoning steps...
            </p>
          )}
        </div>
      )}
    </div>
  );
}