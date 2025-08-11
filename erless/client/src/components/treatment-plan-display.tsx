import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Pill, 
  Clock, 
  AlertTriangle, 
  Heart, 
  Activity, 
  FileText,
  User,
  Calendar,
  Shield,
  Brain
} from "lucide-react";

interface TreatmentPlan {
  primaryTreatment: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  };
  alternativeTreatments: Array<{
    medication: string;
    dosage: string;
    reason: string;
  }>;
  nonPharmacological: string[];
  followUpCare: string[];
  warningSignsToWatch: string[];
  dietaryRecommendations: string[];
  lifestyleModifications: string[];
  expectedOutcome: string;
  timeToImprovement: string;
  confidence: number;
  reasoning: string[];
  generatedBy?: string;
  timestamp?: string;
}

interface TreatmentPlanDisplayProps {
  treatmentPlan: TreatmentPlan;
  patientName?: string;
  diagnosis: string;
}

export function TreatmentPlanDisplay({ 
  treatmentPlan, 
  patientName = "Patient",
  diagnosis 
}: TreatmentPlanDisplayProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-green-600 bg-green-50 border-green-200";
    if (confidence >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-teal-100">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-teal-600" />
              <div>
                <CardTitle className="text-xl">Treatment Plan</CardTitle>
                <p className="text-sm text-gray-600">
                  {patientName} • {diagnosis}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {treatmentPlan.generatedBy === 'mistral-7b' && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  <Brain className="h-3 w-3 mr-1" />
                  Mistral 7B
                </Badge>
              )}
              <div className={`px-3 py-1 rounded-full border ${getConfidenceColor(treatmentPlan.confidence)}`}>
                <span className="text-sm font-medium">
                  {treatmentPlan.confidence}% confidence
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expected Outcome */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Expected Outcome</span>
              </div>
              <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                {treatmentPlan.expectedOutcome}
              </p>
            </div>

            {/* Time to Improvement */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Time to Improvement</span>
              </div>
              <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                {treatmentPlan.timeToImprovement}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Treatment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="h-5 w-5 text-teal-600" />
            <span>Primary Treatment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Medication</label>
                <p className="text-sm font-semibold text-teal-700 bg-teal-50 p-2 rounded">
                  {treatmentPlan.primaryTreatment.medication}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Dosage</label>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                  {treatmentPlan.primaryTreatment.dosage}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Frequency</label>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                  {treatmentPlan.primaryTreatment.frequency}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Duration</label>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                  {treatmentPlan.primaryTreatment.duration}
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Instructions</h4>
              <p className="text-sm text-blue-700">
                {treatmentPlan.primaryTreatment.instructions}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Treatments */}
      {treatmentPlan.alternativeTreatments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <span>Alternative Treatments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {treatmentPlan.alternativeTreatments.map((alt, index) => (
                <div key={index} className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-orange-800">{alt.medication}</span>
                    <span className="text-sm text-orange-600">{alt.dosage}</span>
                  </div>
                  <p className="text-sm text-orange-700">{alt.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Non-Pharmacological Interventions */}
        {treatmentPlan.nonPharmacological.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-600" />
                <span>Non-Drug Interventions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {treatmentPlan.nonPharmacological.map((intervention, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{intervention}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Follow-up Care */}
        {treatmentPlan.followUpCare.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Follow-up Care</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {treatmentPlan.followUpCare.map((followUp, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{followUp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Warning Signs */}
      {treatmentPlan.warningSignsToWatch.length > 0 && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Warning Signs to Watch</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {treatmentPlan.warningSignsToWatch.map((warning, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-white border border-red-200 rounded">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-700">{warning}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dietary Recommendations */}
        {treatmentPlan.dietaryRecommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dietary Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {treatmentPlan.dietaryRecommendations.map((diet, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{diet}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Lifestyle Modifications */}
        {treatmentPlan.lifestyleModifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lifestyle Modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {treatmentPlan.lifestyleModifications.map((lifestyle, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{lifestyle}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reasoning */}
      {treatmentPlan.reasoning.length > 0 && (
        <Card className="border-2 border-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span>Clinical Reasoning</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {treatmentPlan.reasoning.map((reason, index) => (
                <div key={index} className="flex space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">
                    {reason}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      {treatmentPlan.timestamp && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Generated on {new Date(treatmentPlan.timestamp).toLocaleDateString()} at{' '}
            {new Date(treatmentPlan.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}