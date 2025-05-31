import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Stethoscope, 
  Brain, 
  FileText, 
  Search, 
  Plus, 
  X, 
  Clock,
  AlertCircle,
  CheckCircle,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConsultationData {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  historyPresentIllness: string;
  physicalExam: {
    general: string;
    vitals: {
      bloodPressure: string;
      heartRate: string;
      temperature: string;
      respiratoryRate: string;
      oxygenSaturation: string;
    };
    systems: {
      cardiovascular: string;
      respiratory: string;
      gastrointestinal: string;
      neurological: string;
      musculoskeletal: string;
    };
  };
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  differentialDiagnoses: string[];
  icd10Codes: Array<{
    code: string;
    description: string;
    confidence: number;
  }>;
  treatment: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  followUp: string;
  notes: string;
}

interface ICD10Suggestion {
  code: string;
  description: string;
  confidence: number;
  category: string;
}

export default function ConsultationForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [icd10Suggestions, setIcd10Suggestions] = useState<ICD10Suggestion[]>([]);
  const [searchingICD, setSearchingICD] = useState(false);

  const [consultation, setConsultation] = useState<ConsultationData>({
    patientId: "PT-2024-001",
    patientName: "Sarah Johnson",
    age: 34,
    gender: "Female",
    chiefComplaint: "",
    historyPresentIllness: "",
    physicalExam: {
      general: "",
      vitals: {
        bloodPressure: "150/95",
        heartRate: "98",
        temperature: "37.2",
        respiratoryRate: "16",
        oxygenSaturation: "97"
      },
      systems: {
        cardiovascular: "",
        respiratory: "",
        gastrointestinal: "",
        neurological: "",
        musculoskeletal: ""
      }
    },
    primaryDiagnosis: "",
    secondaryDiagnoses: [],
    differentialDiagnoses: [],
    icd10Codes: [],
    treatment: "",
    medications: [],
    followUp: "",
    notes: ""
  });

  // Mock ICD-10 suggestions based on clinical input
  const generateICD10Suggestions = async (clinicalText: string) => {
    if (!clinicalText.trim()) return;
    
    setSearchingICD(true);
    
    // Simulate AI-powered ICD-10 code suggestions
    setTimeout(() => {
      const suggestions: ICD10Suggestion[] = [];
      
      // Chest pain related codes
      if (clinicalText.toLowerCase().includes('chest pain')) {
        suggestions.push(
          { code: "R06.02", description: "Shortness of breath", confidence: 85, category: "Symptoms" },
          { code: "I25.9", description: "Chronic ischemic heart disease, unspecified", confidence: 75, category: "Cardiovascular" },
          { code: "R06.00", description: "Dyspnea, unspecified", confidence: 70, category: "Symptoms" }
        );
      }
      
      // Hypertension related
      if (clinicalText.toLowerCase().includes('hypertension') || clinicalText.includes('150/95')) {
        suggestions.push(
          { code: "I10", description: "Essential (primary) hypertension", confidence: 90, category: "Cardiovascular" },
          { code: "I12.9", description: "Hypertensive chronic kidney disease", confidence: 60, category: "Cardiovascular" }
        );
      }
      
      // Fever related
      if (clinicalText.toLowerCase().includes('fever') || consultation.physicalExam.vitals.temperature > "37.0") {
        suggestions.push(
          { code: "R50.9", description: "Fever, unspecified", confidence: 80, category: "Symptoms" },
          { code: "J06.9", description: "Acute upper respiratory infection, unspecified", confidence: 65, category: "Respiratory" }
        );
      }
      
      // General symptoms
      suggestions.push(
        { code: "Z00.00", description: "Encounter for general adult medical examination", confidence: 50, category: "Factors" },
        { code: "R53", description: "Malaise and fatigue", confidence: 45, category: "Symptoms" }
      );
      
      setIcd10Suggestions(suggestions.sort((a, b) => b.confidence - a.confidence));
      setSearchingICD(false);
    }, 1500);
  };

  const addICD10Code = (suggestion: ICD10Suggestion) => {
    const exists = consultation.icd10Codes.find(code => code.code === suggestion.code);
    if (!exists) {
      setConsultation(prev => ({
        ...prev,
        icd10Codes: [...prev.icd10Codes, {
          code: suggestion.code,
          description: suggestion.description,
          confidence: suggestion.confidence
        }]
      }));
    }
  };

  const removeICD10Code = (code: string) => {
    setConsultation(prev => ({
      ...prev,
      icd10Codes: prev.icd10Codes.filter(icd => icd.code !== code)
    }));
  };

  const addMedication = () => {
    setConsultation(prev => ({
      ...prev,
      medications: [...prev.medications, {
        name: "",
        dosage: "",
        frequency: "",
        duration: ""
      }]
    }));
  };

  const removeMedication = (index: number) => {
    setConsultation(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    setConsultation(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const saveConsultation = async () => {
    setIsLoading(true);
    try {
      // Save consultation logic here
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Consultation Saved",
        description: "Patient consultation has been documented successfully."
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save consultation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultation Form</h1>
          <p className="text-gray-600 mt-1">Complete clinical documentation with AI-powered diagnosis support</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-sm">
            <Clock className="w-4 h-4 mr-1" />
            In Progress
          </Badge>
          <Button onClick={saveConsultation} disabled={isLoading} className="teal-button">
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save Consultation"}
          </Button>
        </div>
      </div>

      {/* Patient Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <User className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900">{consultation.patientName}</h3>
              <p className="text-blue-700">ID: {consultation.patientId} | {consultation.age}Y {consultation.gender}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="history">History & Complaint</TabsTrigger>
          <TabsTrigger value="examination">Physical Exam</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnosis & ICD-10</TabsTrigger>
          <TabsTrigger value="treatment">Treatment & Follow-up</TabsTrigger>
        </TabsList>

        {/* History & Chief Complaint */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Chief Complaint & History</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="chief-complaint">Chief Complaint</Label>
                <Textarea
                  id="chief-complaint"
                  placeholder="Patient's primary reason for visit..."
                  value={consultation.chiefComplaint}
                  onChange={(e) => setConsultation(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                  className="medical-form-input"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="hpi">History of Present Illness (HPI)</Label>
                <Textarea
                  id="hpi"
                  placeholder="Detailed history of current symptoms, onset, duration, severity, associated symptoms..."
                  value={consultation.historyPresentIllness}
                  onChange={(e) => setConsultation(prev => ({ ...prev, historyPresentIllness: e.target.value }))}
                  className="medical-form-input"
                  rows={6}
                />
              </div>

              <div className="mt-4">
                <Button 
                  onClick={() => generateICD10Suggestions(consultation.chiefComplaint + " " + consultation.historyPresentIllness)}
                  variant="outline"
                  disabled={searchingICD}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {searchingICD ? "Analyzing..." : "Get AI Diagnosis Suggestions"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Physical Examination */}
        <TabsContent value="examination" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-green-600" />
                <span>Physical Examination</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vitals */}
              <div>
                <h4 className="font-medium mb-3">Vital Signs</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="bp">Blood Pressure</Label>
                    <Input
                      id="bp"
                      value={consultation.physicalExam.vitals.bloodPressure}
                      onChange={(e) => setConsultation(prev => ({
                        ...prev,
                        physicalExam: {
                          ...prev.physicalExam,
                          vitals: { ...prev.physicalExam.vitals, bloodPressure: e.target.value }
                        }
                      }))}
                      placeholder="120/80"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hr">Heart Rate</Label>
                    <Input
                      id="hr"
                      value={consultation.physicalExam.vitals.heartRate}
                      onChange={(e) => setConsultation(prev => ({
                        ...prev,
                        physicalExam: {
                          ...prev.physicalExam,
                          vitals: { ...prev.physicalExam.vitals, heartRate: e.target.value }
                        }
                      }))}
                      placeholder="72"
                    />
                  </div>
                  <div>
                    <Label htmlFor="temp">Temperature</Label>
                    <Input
                      id="temp"
                      value={consultation.physicalExam.vitals.temperature}
                      onChange={(e) => setConsultation(prev => ({
                        ...prev,
                        physicalExam: {
                          ...prev.physicalExam,
                          vitals: { ...prev.physicalExam.vitals, temperature: e.target.value }
                        }
                      }))}
                      placeholder="36.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rr">Respiratory Rate</Label>
                    <Input
                      id="rr"
                      value={consultation.physicalExam.vitals.respiratoryRate}
                      onChange={(e) => setConsultation(prev => ({
                        ...prev,
                        physicalExam: {
                          ...prev.physicalExam,
                          vitals: { ...prev.physicalExam.vitals, respiratoryRate: e.target.value }
                        }
                      }))}
                      placeholder="16"
                    />
                  </div>
                  <div>
                    <Label htmlFor="o2sat">O2 Saturation</Label>
                    <Input
                      id="o2sat"
                      value={consultation.physicalExam.vitals.oxygenSaturation}
                      onChange={(e) => setConsultation(prev => ({
                        ...prev,
                        physicalExam: {
                          ...prev.physicalExam,
                          vitals: { ...prev.physicalExam.vitals, oxygenSaturation: e.target.value }
                        }
                      }))}
                      placeholder="98"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* System Examination */}
              <div>
                <h4 className="font-medium mb-3">System Examination</h4>
                <div className="space-y-4">
                  {Object.entries(consultation.physicalExam.systems).map(([system, findings]) => (
                    <div key={system}>
                      <Label htmlFor={system} className="capitalize">{system.replace(/([A-Z])/g, ' $1')}</Label>
                      <Textarea
                        id={system}
                        value={findings}
                        onChange={(e) => setConsultation(prev => ({
                          ...prev,
                          physicalExam: {
                            ...prev.physicalExam,
                            systems: { ...prev.physicalExam.systems, [system]: e.target.value }
                          }
                        }))}
                        placeholder={`${system} examination findings...`}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diagnosis & ICD-10 */}
        <TabsContent value="diagnosis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diagnosis Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>Clinical Diagnosis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primary-diagnosis">Primary Diagnosis</Label>
                  <Textarea
                    id="primary-diagnosis"
                    value={consultation.primaryDiagnosis}
                    onChange={(e) => setConsultation(prev => ({ ...prev, primaryDiagnosis: e.target.value }))}
                    placeholder="Primary clinical diagnosis..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Differential Diagnoses</Label>
                  <Textarea
                    value={consultation.differentialDiagnoses.join('\n')}
                    onChange={(e) => setConsultation(prev => ({ 
                      ...prev, 
                      differentialDiagnoses: e.target.value.split('\n').filter(d => d.trim()) 
                    }))}
                    placeholder="Alternative diagnoses to consider (one per line)..."
                    rows={4}
                  />
                </div>

                {/* Current ICD-10 Codes */}
                <div>
                  <Label>Assigned ICD-10 Codes</Label>
                  <div className="space-y-2 mt-2">
                    {consultation.icd10Codes.map((icd, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
                        <div>
                          <span className="font-medium text-green-800">{icd.code}</span>
                          <p className="text-sm text-green-600">{icd.description}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {icd.confidence}% confidence
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeICD10Code(icd.code)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  <span>AI ICD-10 Suggestions</span>
                </CardTitle>
                <CardDescription>
                  AI-powered diagnosis code suggestions based on clinical data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {searchingICD ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Brain className="w-8 h-8 mx-auto animate-pulse text-blue-600 mb-2" />
                      <p className="text-sm text-gray-600">Analyzing clinical data...</p>
                    </div>
                  </div>
                ) : icd10Suggestions.length > 0 ? (
                  <div className="space-y-3">
                    {icd10Suggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-blue-600">{suggestion.code}</span>
                              <Badge variant="outline" className="text-xs">
                                {suggestion.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{suggestion.description}</p>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                className={`text-xs ${
                                  suggestion.confidence >= 80 ? 'bg-green-100 text-green-800' :
                                  suggestion.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                {suggestion.confidence}% match
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addICD10Code(suggestion)}
                            className="ml-2"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>Enter clinical data and click "Get AI Diagnosis Suggestions" to see ICD-10 recommendations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Treatment & Follow-up */}
        <TabsContent value="treatment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Treatment Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Treatment Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="treatment">Treatment & Management</Label>
                  <Textarea
                    id="treatment"
                    value={consultation.treatment}
                    onChange={(e) => setConsultation(prev => ({ ...prev, treatment: e.target.value }))}
                    placeholder="Treatment plan, procedures, recommendations..."
                    rows={6}
                  />
                </div>

                <div>
                  <Label htmlFor="follow-up">Follow-up Instructions</Label>
                  <Textarea
                    id="follow-up"
                    value={consultation.followUp}
                    onChange={(e) => setConsultation(prev => ({ ...prev, followUp: e.target.value }))}
                    placeholder="Follow-up schedule, return visit instructions..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Medications</span>
                  <Button size="sm" onClick={addMedication} variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consultation.medications.map((med, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium">Medication {index + 1}</h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedication(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Medication Name</Label>
                          <Input
                            value={med.name}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            placeholder="e.g., Amoxicillin"
                          />
                        </div>
                        <div>
                          <Label>Dosage</Label>
                          <Input
                            value={med.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            placeholder="e.g., 500mg"
                          />
                        </div>
                        <div>
                          <Label>Frequency</Label>
                          <Input
                            value={med.frequency}
                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                            placeholder="e.g., Twice daily"
                          />
                        </div>
                        <div>
                          <Label>Duration</Label>
                          <Input
                            value={med.duration}
                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            placeholder="e.g., 7 days"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {consultation.medications.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No medications prescribed</p>
                      <Button size="sm" onClick={addMedication} variant="outline" className="mt-2">
                        <Plus className="w-4 h-4 mr-1" />
                        Add First Medication
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Clinical Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={consultation.notes}
                onChange={(e) => setConsultation(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional observations, patient education provided, special considerations..."
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}