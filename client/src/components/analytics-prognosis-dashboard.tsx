import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar,
  BarChart3,
  Target,
  Zap,
  Shield
} from "lucide-react";

interface PrognosisModel {
  modelId: string;
  modelName: string;
  condition: string;
  accuracy: number;
  lastTrained: string;
  dataPoints: number;
  status: "active" | "training" | "deprecated";
}

interface OutcomeMetrics {
  patientId: string;
  patientName: string;
  condition: string;
  initialDiagnosis: string;
  treatmentPlan: string;
  predictedOutcome: {
    recoveryProbability: number;
    timeToRecovery: number;
    riskFactors: string[];
    confidenceLevel: number;
  };
  actualOutcome?: {
    status: "recovered" | "improved" | "stable" | "deteriorated";
    timeToOutcome: number;
    complications: string[];
    followUpRequired: boolean;
  };
  lastUpdated: string;
}

interface PopulationTrend {
  timeperiod: string;
  condition: string;
  incidenceRate: number;
  mortalityRate: number;
  recoveryRate: number;
  avgTreatmentCost: number;
  riskScore: number;
}

interface RiskAssessment {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  riskFactors: Array<{
    factor: string;
    severity: "low" | "medium" | "high";
    impact: number;
  }>;
  overallRiskScore: number;
  recommendations: string[];
  nextReviewDate: string;
}

export function AnalyticsPrognosisDashboard() {
  const [selectedModel, setSelectedModel] = useState("diabetes-prediction");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("6months");
  const [analysisType, setAnalysisType] = useState("population");

  // Fetch prognosis models
  const { data: prognosisModels, isLoading: modelsLoading } = useQuery({
    queryKey: ["/api/analytics/prognosis-models"],
    queryFn: async () => [
      {
        modelId: "diabetes-prediction",
        modelName: "Diabetes Progression Predictor",
        condition: "Type 2 Diabetes",
        accuracy: 89.5,
        lastTrained: "2024-06-15",
        dataPoints: 15400,
        status: "active"
      },
      {
        modelId: "cardiovascular-risk",
        modelName: "Cardiovascular Risk Assessment",
        condition: "Heart Disease",
        accuracy: 92.1,
        lastTrained: "2024-06-10",
        dataPoints: 22100,
        status: "active"
      },
      {
        modelId: "cancer-prognosis",
        modelName: "Cancer Treatment Response",
        condition: "Various Cancers",
        accuracy: 87.3,
        lastTrained: "2024-06-08",
        dataPoints: 8750,
        status: "active"
      },
      {
        modelId: "mental-health",
        modelName: "Mental Health Outcome Predictor",
        condition: "Depression/Anxiety",
        accuracy: 84.7,
        lastTrained: "2024-06-12",
        dataPoints: 12600,
        status: "training"
      }
    ] as PrognosisModel[],
  });

  // Fetch outcome tracking data
  const { data: outcomeMetrics, isLoading: outcomesLoading } = useQuery({
    queryKey: ["/api/analytics/outcome-tracking", selectedCondition, selectedTimeframe],
    queryFn: async () => [
      {
        patientId: "P12345",
        patientName: "John Kamau",
        condition: "Type 2 Diabetes",
        initialDiagnosis: "HbA1c: 8.5%, Fasting glucose: 180mg/dL",
        treatmentPlan: "Metformin + Lifestyle modification",
        predictedOutcome: {
          recoveryProbability: 78,
          timeToRecovery: 180,
          riskFactors: ["Obesity", "Family history", "Sedentary lifestyle"],
          confidenceLevel: 89
        },
        actualOutcome: {
          status: "improved",
          timeToOutcome: 165,
          complications: [],
          followUpRequired: true
        },
        lastUpdated: "2024-06-18"
      },
      {
        patientId: "P12346",
        patientName: "Mary Wanjiku",
        condition: "Hypertension",
        initialDiagnosis: "BP: 165/95 mmHg, Stage 2 HTN",
        treatmentPlan: "ACE inhibitor + Diet modification",
        predictedOutcome: {
          recoveryProbability: 85,
          timeToRecovery: 90,
          riskFactors: ["Age >50", "Salt intake", "Stress"],
          confidenceLevel: 92
        },
        actualOutcome: {
          status: "stable",
          timeToOutcome: 95,
          complications: [],
          followUpRequired: true
        },
        lastUpdated: "2024-06-17"
      },
      {
        patientId: "P12347",
        patientName: "Peter Ochieng",
        condition: "Asthma",
        initialDiagnosis: "Moderate persistent asthma, FEV1: 65%",
        treatmentPlan: "ICS/LABA + Action plan",
        predictedOutcome: {
          recoveryProbability: 92,
          timeToRecovery: 60,
          riskFactors: ["Environmental triggers", "Compliance"],
          confidenceLevel: 87
        },
        lastUpdated: "2024-06-16"
      }
    ] as OutcomeMetrics[],
  });

  // Fetch population trends
  const { data: populationTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ["/api/analytics/population-trends", selectedTimeframe],
    queryFn: async () => [
      { timeperiod: "Jan 2024", condition: "Diabetes", incidenceRate: 4.2, mortalityRate: 0.8, recoveryRate: 78, avgTreatmentCost: 45000, riskScore: 6.5 },
      { timeperiod: "Feb 2024", condition: "Diabetes", incidenceRate: 4.5, mortalityRate: 0.7, recoveryRate: 79, avgTreatmentCost: 46000, riskScore: 6.3 },
      { timeperiod: "Mar 2024", condition: "Diabetes", incidenceRate: 4.1, mortalityRate: 0.6, recoveryRate: 81, avgTreatmentCost: 44500, riskScore: 6.1 },
      { timeperiod: "Apr 2024", condition: "Diabetes", incidenceRate: 3.9, mortalityRate: 0.5, recoveryRate: 83, avgTreatmentCost: 43000, riskScore: 5.9 },
      { timeperiod: "May 2024", condition: "Diabetes", incidenceRate: 3.7, mortalityRate: 0.5, recoveryRate: 85, avgTreatmentCost: 42000, riskScore: 5.7 },
      { timeperiod: "Jun 2024", condition: "Diabetes", incidenceRate: 3.5, mortalityRate: 0.4, recoveryRate: 87, avgTreatmentCost: 41000, riskScore: 5.5 }
    ] as PopulationTrend[],
  });

  // Fetch risk assessments
  const { data: riskAssessments, isLoading: riskLoading } = useQuery({
    queryKey: ["/api/analytics/risk-assessments"],
    queryFn: async () => [
      {
        patientId: "P98765",
        patientName: "Grace Muthoni",
        age: 45,
        gender: "Female",
        riskFactors: [
          { factor: "Hypertension", severity: "medium", impact: 6.5 },
          { factor: "Family History of CVD", severity: "high", impact: 8.2 },
          { factor: "Smoking", severity: "high", impact: 9.1 },
          { factor: "High Cholesterol", severity: "medium", impact: 6.8 }
        ],
        overallRiskScore: 7.6,
        recommendations: [
          "Smoking cessation program",
          "Cholesterol management",
          "Regular BP monitoring",
          "Cardiology consultation"
        ],
        nextReviewDate: "2024-09-15"
      },
      {
        patientId: "P98766",
        patientName: "Samuel Kiprop",
        age: 38,
        gender: "Male",
        riskFactors: [
          { factor: "Obesity (BMI >30)", severity: "medium", impact: 5.8 },
          { factor: "Sedentary Lifestyle", severity: "medium", impact: 4.9 },
          { factor: "Pre-diabetes", severity: "high", impact: 7.3 }
        ],
        overallRiskScore: 6.0,
        recommendations: [
          "Weight management program",
          "Exercise prescription",
          "Dietary counseling",
          "Regular glucose monitoring"
        ],
        nextReviewDate: "2024-08-20"
      }
    ] as RiskAssessment[],
  });

  const getModelStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      training: "bg-yellow-100 text-yellow-800",
      deprecated: "bg-red-100 text-red-800"
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const getOutcomeStatusBadge = (status: string) => {
    const statusColors = {
      recovered: "bg-green-100 text-green-800",
      improved: "bg-blue-100 text-blue-800",
      stable: "bg-yellow-100 text-yellow-800",
      deteriorated: "bg-red-100 text-red-800"
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const getRiskSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return "text-red-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-blue-600";
    return "text-green-600";
  };

  const radarData = riskAssessments?.[0]?.riskFactors.map(factor => ({
    factor: factor.factor,
    impact: factor.impact,
    fullMark: 10
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics & Prognosis</h2>
          <p className="text-gray-600">Predictive modeling and outcome tracking for improved patient care</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-purple-600 border-purple-200">
            <Brain className="w-4 h-4 mr-1" />
            AI-Powered Analytics
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="model">Prognosis Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {prognosisModels?.map((model) => (
                    <SelectItem key={model.modelId} value={model.modelId}>
                      {model.modelName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="diabetes">Diabetes</SelectItem>
                  <SelectItem value="hypertension">Hypertension</SelectItem>
                  <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
                  <SelectItem value="respiratory">Respiratory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timeframe">Analysis Period</Label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="analysisType">Analysis Type</Label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="population">Population Health</SelectItem>
                  <SelectItem value="individual">Individual Prognosis</SelectItem>
                  <SelectItem value="comparative">Comparative Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Model Accuracy</p>
                <p className="text-2xl font-bold text-green-600">89.2%</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Progress value={89.2} className="w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prediction Confidence</p>
                <p className="text-2xl font-bold text-blue-600">92.7%</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Progress value={92.7} className="w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outcome Accuracy</p>
                <p className="text-2xl font-bold text-teal-600">87.4%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-teal-600" />
            </div>
            <div className="mt-2">
              <Progress value={87.4} className="w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Patients Analyzed</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">This period</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={analysisType} onValueChange={setAnalysisType}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="population">Population Health Trends</TabsTrigger>
          <TabsTrigger value="individual">Individual Prognosis</TabsTrigger>
          <TabsTrigger value="comparative">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="population" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Population Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Population Health Trends</CardTitle>
                <CardDescription>Disease incidence and recovery rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={populationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeperiod" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="incidenceRate" stroke="#ef4444" name="Incidence Rate" />
                    <Line type="monotone" dataKey="recoveryRate" stroke="#10b981" name="Recovery Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Score Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Score Evolution</CardTitle>
                <CardDescription>Population risk trends and treatment costs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={populationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeperiod" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="riskScore" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Prognosis Models Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Active Prognosis Models</CardTitle>
              <CardDescription>AI models currently deployed for predictive analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prognosisModels?.map((model) => (
                  <Card key={model.modelId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Brain className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{model.modelName}</h3>
                          <p className="text-sm text-gray-600">{model.condition}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge className={getModelStatusBadge(model.status)}>
                          {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                        </Badge>
                        <p className="text-sm text-gray-500">
                          Accuracy: {model.accuracy}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Data Points</p>
                        <p className="text-lg font-semibold">{model.dataPoints.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Last Trained</p>
                        <p className="text-lg font-semibold">{new Date(model.lastTrained).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Model Accuracy</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={model.accuracy} className="flex-1" />
                          <span className="text-sm font-medium">{model.accuracy}%</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Individual Patient Outcomes</CardTitle>
              <CardDescription>Tracking predicted vs actual outcomes for patient care optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {outcomeMetrics?.map((outcome) => (
                  <Card key={outcome.patientId} className="p-6 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-xl">{outcome.patientName}</h3>
                        <p className="text-gray-600">Patient ID: {outcome.patientId}</p>
                        <p className="text-sm text-gray-500">{outcome.condition}</p>
                      </div>
                      <div className="text-right">
                        {outcome.actualOutcome && (
                          <Badge className={getOutcomeStatusBadge(outcome.actualOutcome.status)}>
                            {outcome.actualOutcome.status.charAt(0).toUpperCase() + outcome.actualOutcome.status.slice(1)}
                          </Badge>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          Updated: {new Date(outcome.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Predicted Outcome */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Brain className="w-4 h-4 mr-2 text-purple-600" />
                          Predicted Outcome
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Recovery Probability</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={outcome.predictedOutcome.recoveryProbability} className="w-20" />
                              <span className="text-sm font-medium">{outcome.predictedOutcome.recoveryProbability}%</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Estimated Recovery Time</span>
                            <span className="text-sm font-medium">{outcome.predictedOutcome.timeToRecovery} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Confidence Level</span>
                            <span className="text-sm font-medium">{outcome.predictedOutcome.confidenceLevel}%</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Risk Factors:</p>
                            <div className="flex flex-wrap gap-1">
                              {outcome.predictedOutcome.riskFactors.map((factor, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actual Outcome */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Activity className="w-4 h-4 mr-2 text-teal-600" />
                          Actual Outcome
                        </h4>
                        {outcome.actualOutcome ? (
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm">Current Status</span>
                              <Badge className={getOutcomeStatusBadge(outcome.actualOutcome.status)}>
                                {outcome.actualOutcome.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Time to Outcome</span>
                              <span className="text-sm font-medium">{outcome.actualOutcome.timeToOutcome} days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Follow-up Required</span>
                              <span className="text-sm font-medium">
                                {outcome.actualOutcome.followUpRequired ? "Yes" : "No"}
                              </span>
                            </div>
                            {outcome.actualOutcome.complications.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-1">Complications:</p>
                                <div className="flex flex-wrap gap-1">
                                  {outcome.actualOutcome.complications.map((comp, index) => (
                                    <Badge key={index} variant="outline" className="text-xs bg-red-50">
                                      {comp}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <Calendar className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Outcome tracking in progress</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Clinical Details */}
                    <div className="mt-6 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-1">Initial Diagnosis</h5>
                          <p className="text-sm">{outcome.initialDiagnosis}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-1">Treatment Plan</h5>
                          <p className="text-sm">{outcome.treatmentPlan}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparative" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Assessment Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Factor Analysis</CardTitle>
                <CardDescription>Multi-dimensional risk assessment visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="factor" />
                    <PolarRadiusAxis domain={[0, 10]} />
                    <Radar name="Risk Impact" dataKey="impact" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Score Trends</CardTitle>
                <CardDescription>Population risk distribution over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={populationTrends}>
                    <CartesianGrid />
                    <XAxis dataKey="avgTreatmentCost" name="Treatment Cost" />
                    <YAxis dataKey="riskScore" name="Risk Score" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Risk vs Cost" data={populationTrends} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Individual Risk Assessments */}
          <Card>
            <CardHeader>
              <CardTitle>High-Risk Patient Assessments</CardTitle>
              <CardDescription>Comprehensive risk profiling for proactive care management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {riskAssessments?.map((assessment) => (
                  <Card key={assessment.patientId} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-xl">{assessment.patientName}</h3>
                        <p className="text-gray-600">{assessment.age} years old • {assessment.gender}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getRiskScoreColor(assessment.overallRiskScore)}`}>
                          {assessment.overallRiskScore}/10
                        </div>
                        <p className="text-sm text-gray-500">Overall Risk Score</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
                          Risk Factors
                        </h4>
                        <div className="space-y-3">
                          {assessment.riskFactors.map((factor, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{factor.factor}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Progress value={factor.impact * 10} className="flex-1" />
                                  <span className={`text-xs font-medium ${getRiskSeverityColor(factor.severity)}`}>
                                    {factor.severity}
                                  </span>
                                </div>
                              </div>
                              <span className="text-sm font-semibold ml-3">{factor.impact}/10</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-green-600" />
                          Recommendations
                        </h4>
                        <div className="space-y-2">
                          {assessment.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm">{rec}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t">
                          <p className="text-sm text-gray-600">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Next Review: {new Date(assessment.nextReviewDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}