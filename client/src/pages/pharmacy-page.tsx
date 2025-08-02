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
import { Progress } from "@/components/ui/progress";
import { 
  Pill, Scale, Venus, VenusAndMars, AlertTriangle, CheckCircle, 
  Clock, User, Activity, DollarSign, Shield 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PrescriptionData {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  indication: string;
  patientId: number;
  prescribedBy: number;
  cost: number;
}

interface ValidationResult {
  weightBasedCheck: boolean;
  genderSensitiveCheck: boolean;
  drugInteractions: string[];
  benefitCategoryMatch: boolean;
  safetyFlags: string[];
  recommendations: string[];
}

export default function PharmacyPage() {
  const [prescription, setPrescription] = useState<Partial<PrescriptionData>>({
    frequency: "once-daily",
    indication: "acute-infection"
  });
  const [patientInfo, setPatientInfo] = useState({
    weight: '',
    age: '',
    gender: 'female'
  });
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: PrescriptionData) => {
      const response = await apiRequest("POST", "/api/prescriptions", data);
      return await response.json();
    },
    onSuccess: (data) => {
      console.log('Prescription created:', data);
      // Reset form after successful submission
      setPrescription({
        frequency: "once-daily",
        indication: "acute-infection"
      });
    },
  });

  const validatePrescriptionMutation = useMutation({
    mutationFn: async (data: { prescriptionId: number; patientWeight: number; patientAge: number; gender: string }) => {
      const response = await apiRequest("POST", `/api/prescriptions/${data.prescriptionId}/validate`, data);
      return await response.json();
    },
    onSuccess: (data) => {
      setValidationResult(data);
    },
  });

  const handleSubmitPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescription.medicationName || !prescription.dosage || !prescription.patientId) {
      return;
    }

    // Generate prescription ID for validation
    const prescriptionId = Date.now();
    
    createPrescriptionMutation.mutate(prescription as PrescriptionData);
    
    // Trigger validation if patient info is provided
    if (patientInfo.weight && patientInfo.age) {
      validatePrescriptionMutation.mutate({
        prescriptionId,
        patientWeight: parseFloat(patientInfo.weight),
        patientAge: parseInt(patientInfo.age),
        gender: patientInfo.gender
      });
    }
  };

  const getBenefitCategoryInfo = (indication: string) => {
    const categories = {
      'chronic-condition': { color: 'bg-red-100 text-red-800', name: 'Chronic Medications' },
      'acute-infection': { color: 'bg-blue-100 text-blue-800', name: 'Acute Medications' },
      'family-planning': { color: 'bg-green-100 text-green-800', name: 'Family Planning' },
      'vaccination': { color: 'bg-purple-100 text-purple-800', name: 'Vaccination' },
      'pain-management': { color: 'bg-orange-100 text-orange-800', name: 'Pain Management' }
    };
    return categories[indication as keyof typeof categories] || categories['acute-infection'];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Validation System</h1>
          <p className="text-gray-600">Smart medication validation with safety checks and benefit management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Pill className="w-5 h-5 text-purple-600" />
          <span className="text-sm text-gray-600">AI-Powered Validation</span>
        </div>
      </div>

      <Tabs defaultValue="prescription" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prescription">New Prescription</TabsTrigger>
          <TabsTrigger value="benefits">Benefit Categories</TabsTrigger>
          <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
        </TabsList>

        <TabsContent value="prescription" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Patient Information</span>
                </CardTitle>
                <CardDescription>
                  Patient details for medication validation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Current Patient</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Name:</span>
                      <span className="font-medium">Emily Rodriguez</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Age:</span>
                      <span className="font-medium">38 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Insurance:</span>
                      <span className="font-medium">Premium Health+</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="65.0"
                        value={patientInfo.weight}
                        onChange={(e) => setPatientInfo(prev => ({ ...prev, weight: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="38"
                      value={patientInfo.age}
                      onChange={(e) => setPatientInfo(prev => ({ ...prev, age: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={patientInfo.gender} 
                      onValueChange={(value) => setPatientInfo(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">
                          <div className="flex items-center space-x-2">
                            <Venus className="w-4 h-4" />
                            <span>Female</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="male">
                          <div className="flex items-center space-x-2">
                            <VenusAndMars className="w-4 h-4" />
                            <span>Male</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Patient information is used for weight-based dosing and gender-sensitive medication checks.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Prescription Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Pill className="w-5 h-5 text-purple-600" />
                  <span>Prescription Details</span>
                </CardTitle>
                <CardDescription>
                  Enter medication information for validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPrescription} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-id">Patient ID</Label>
                    <Input
                      id="patient-id"
                      type="number"
                      placeholder="12345"
                      value={prescription.patientId || ''}
                      onChange={(e) => setPrescription(prev => ({ ...prev, patientId: parseInt(e.target.value) }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medication">Medication Name</Label>
                    <Input
                      id="medication"
                      placeholder="e.g., Amoxicillin"
                      value={prescription.medicationName || ''}
                      onChange={(e) => setPrescription(prev => ({ ...prev, medicationName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        placeholder="500mg"
                        value={prescription.dosage || ''}
                        onChange={(e) => setPrescription(prev => ({ ...prev, dosage: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="30"
                        value={prescription.quantity || ''}
                        onChange={(e) => setPrescription(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select 
                        value={prescription.frequency} 
                        onValueChange={(value) => setPrescription(prev => ({ ...prev, frequency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once-daily">Once daily</SelectItem>
                          <SelectItem value="twice-daily">Twice daily</SelectItem>
                          <SelectItem value="three-times-daily">Three times daily</SelectItem>
                          <SelectItem value="four-times-daily">Four times daily</SelectItem>
                          <SelectItem value="as-needed">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        placeholder="7 days"
                        value={prescription.duration || ''}
                        onChange={(e) => setPrescription(prev => ({ ...prev, duration: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="indication">Clinical Indication</Label>
                    <Select 
                      value={prescription.indication} 
                      onValueChange={(value) => setPrescription(prev => ({ ...prev, indication: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acute-infection">Acute infection</SelectItem>
                        <SelectItem value="chronic-condition">Chronic condition management</SelectItem>
                        <SelectItem value="family-planning">Family planning</SelectItem>
                        <SelectItem value="vaccination">Vaccination</SelectItem>
                        <SelectItem value="pain-management">Pain management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost ($)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      placeholder="25.99"
                      value={prescription.cost || ''}
                      onChange={(e) => setPrescription(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={createPrescriptionMutation.isPending}
                  >
                    {createPrescriptionMutation.isPending ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Pill className="w-4 h-4 mr-2" />
                        Validate Prescription
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Validation Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Validation Results</span>
                </CardTitle>
                <CardDescription>
                  Safety checks and benefit verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!validationResult ? (
                  <div className="text-center py-12 text-gray-500">
                    <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No validation yet</p>
                    <p className="text-sm">Submit a prescription to see validation results</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Weight-based Validation */}
                    <div className={`flex items-center justify-between p-3 rounded-lg border ${
                      validationResult.weightBasedCheck 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <Scale className={`w-5 h-5 ${
                          validationResult.weightBasedCheck ? 'text-green-500' : 'text-yellow-500'
                        }`} />
                        <span className={`font-medium ${
                          validationResult.weightBasedCheck ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                          Weight-based dosage check
                        </span>
                      </div>
                      {validationResult.weightBasedCheck ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>

                    {/* Gender-sensitive Check */}
                    <div className={`flex items-center justify-between p-3 rounded-lg border ${
                      validationResult.genderSensitiveCheck 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        {patientInfo.gender === 'female' ? (
                          <Venus className={`w-5 h-5 ${
                            validationResult.genderSensitiveCheck ? 'text-green-500' : 'text-yellow-500'
                          }`} />
                        ) : (
                          <VenusAndMars className={`w-5 h-5 ${
                            validationResult.genderSensitiveCheck ? 'text-green-500' : 'text-yellow-500'
                          }`} />
                        )}
                        <span className={`font-medium ${
                          validationResult.genderSensitiveCheck ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                          Gender-appropriate medication
                        </span>
                      </div>
                      {validationResult.genderSensitiveCheck ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>

                    {/* Drug Interactions */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Drug Interactions</span>
                      </div>
                      {validationResult.drugInteractions.length === 0 ? (
                        <p className="text-sm text-blue-700">No known interactions detected</p>
                      ) : (
                        <ul className="text-sm text-blue-700 space-y-1">
                          {validationResult.drugInteractions.map((interaction, index) => (
                            <li key={index}>• {interaction}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Benefit Category */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-800">Benefit Category</span>
                        </div>
                        <Badge className={getBenefitCategoryInfo(prescription.indication || '').color}>
                          {getBenefitCategoryInfo(prescription.indication || '').name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Benefits Overview</CardTitle>
              <CardDescription>
                Current patient benefit utilization by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { category: 'Chronic Medications', used: 750, total: 1000, color: 'bg-red-500' },
                  { category: 'Acute Medications', used: 225, total: 500, color: 'bg-blue-500' },
                  { category: 'Family Planning', used: 60, total: 300, color: 'bg-green-500' },
                  { category: 'Vaccinations', used: 150, total: 200, color: 'bg-purple-500' },
                  { category: 'Pain Management', used: 320, total: 400, color: 'bg-orange-500' },
                  { category: 'Mental Health', used: 180, total: 600, color: 'bg-indigo-500' }
                ].map((benefit) => {
                  const percentage = (benefit.used / benefit.total) * 100;
                  return (
                    <Card key={benefit.category}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{benefit.category}</span>
                          <span className="text-sm text-gray-500">
                            ${benefit.used}/${benefit.total}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-3 mb-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{percentage.toFixed(1)}% used</span>
                          <span className="text-gray-600">${benefit.total - benefit.used} remaining</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Medications</CardTitle>
              <CardDescription>
                Active prescriptions for drug interaction checking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Lisinopril 10mg",
                    frequency: "Once daily",
                    indication: "Hypertension",
                    startDate: "Jan 2024",
                    interactions: 0
                  },
                  {
                    name: "Metformin 500mg",
                    frequency: "Twice daily", 
                    indication: "Diabetes",
                    startDate: "Dec 2023",
                    interactions: 1
                  },
                  {
                    name: "Atorvastatin 20mg",
                    frequency: "Once daily",
                    indication: "High cholesterol",
                    startDate: "Mar 2024",
                    interactions: 0
                  }
                ].map((med, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{med.name}</h4>
                      <p className="text-sm text-gray-600">{med.frequency} • {med.indication}</p>
                      <p className="text-xs text-gray-500">Started: {med.startDate}</p>
                    </div>
                    <div className="text-right">
                      {med.interactions > 0 ? (
                        <Badge variant="destructive">
                          {med.interactions} interaction{med.interactions !== 1 ? 's' : ''}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          No interactions
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
