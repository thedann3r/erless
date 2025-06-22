import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { SharedLayout } from "@/components/layout/shared-layout";
import { BiometricVerificationModal } from "@/components/biometric-verification-modal";
import { ClaimFormGenerator } from "@/components/claim-form-generator";
import { ChainOfThoughtDisplay, InlineChainOfThought } from "@/components/chain-of-thought-display";
import { 
  Pill, AlertTriangle, ShieldCheck, CreditCard, User, Clock, 
  Package, CheckCircle, XCircle, Search, Calculator, FileText,
  Zap, Activity, TrendingUp, AlertCircle, Fingerprint, Shield,
  FileCheck, Lock, Info, Database, Brain
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PendingPrescription {
  id: number;
  patient: {
    firstName: string;
    lastName: string;
    patientId: string;
    gender: string;
    age: number;
    weight?: number;
    allergies: string[];
    currentMedications: string[];
  };
  doctor: {
    firstName: string;
    lastName: string;
    registrationNumber: string;
  };
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  indication: string;
  diagnosis: string;
  prescribedAt: string;
  benefitCategory: string;
  preauthorizationRequired: boolean;
  preauthorizationStatus: string;
  interactions: string[];
  warnings: string[];
}

interface BenefitInfo {
  category: string;
  usedAmount: number;
  remainingAmount: number;
  totalLimit: number;
  utilizationPercentage: number;
}

export default function ModernPharmacyDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPrescription, setSelectedPrescription] = useState<PendingPrescription | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dispensingChecks, setDispensingChecks] = useState({
    patientVerified: false,
    dosageVerified: false,
    interactionsChecked: false,
    insuranceCovered: false,
    patientCounseled: false
  });
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showClaimGenerator, setShowClaimGenerator] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [verifiedPatient, setVerifiedPatient] = useState<any>(null);

  // Mock data
  const pendingPrescriptions: PendingPrescription[] = [
    {
      id: 1,
      patient: {
        firstName: "Sarah",
        lastName: "Johnson",
        patientId: "PT-2024-001",
        gender: "Female",
        age: 38,
        weight: 65,
        allergies: ["Penicillin", "Sulfa drugs"],
        currentMedications: ["Metformin 500mg", "Lisinopril 10mg"]
      },
      doctor: {
        firstName: "Dr. James",
        lastName: "Mwangi",
        registrationNumber: "KMPDC-001"
      },
      medicationName: "Amlodipine",
      dosage: "5mg",
      frequency: "Once daily",
      duration: "30 days",
      quantity: 30,
      indication: "Hypertension",
      diagnosis: "Essential Hypertension",
      prescribedAt: "2024-06-20T10:30:00Z",
      benefitCategory: "Essential Medicines",
      preauthorizationRequired: false,
      preauthorizationStatus: "approved",
      interactions: [],
      warnings: ["Monitor blood pressure regularly"]
    },
    {
      id: 2,
      patient: {
        firstName: "Michael",
        lastName: "Ochieng",
        patientId: "PT-2024-002",
        gender: "Male",
        age: 47,
        weight: 80,
        allergies: [],
        currentMedications: ["Metformin 1000mg"]
      },
      doctor: {
        firstName: "Dr. Grace",
        lastName: "Wanjiku",
        registrationNumber: "KMPDC-002"
      },
      medicationName: "Glibenclamide",
      dosage: "5mg",
      frequency: "Twice daily",
      duration: "30 days",
      quantity: 60,
      indication: "Type 2 Diabetes",
      diagnosis: "Type 2 Diabetes Mellitus",
      prescribedAt: "2024-06-20T11:15:00Z",
      benefitCategory: "Chronic Disease",
      preauthorizationRequired: true,
      preauthorizationStatus: "pending",
      interactions: ["Potential interaction with Metformin - monitor glucose"],
      warnings: ["Risk of hypoglycemia", "Take with meals"]
    }
  ];

  const benefitInfo: BenefitInfo[] = [
    {
      category: "Essential Medicines",
      usedAmount: 4500,
      remainingAmount: 5500,
      totalLimit: 10000,
      utilizationPercentage: 45
    },
    {
      category: "Chronic Disease",
      usedAmount: 8000,
      remainingAmount: 2000,
      totalLimit: 10000,
      utilizationPercentage: 80
    },
    {
      category: "Specialized Drugs",
      usedAmount: 1200,
      remainingAmount: 3800,
      totalLimit: 5000,
      utilizationPercentage: 24
    }
  ];

  const sidebarItems = [
    { path: "/pharmacy-dashboard", icon: <Pill className="h-5 w-5" />, label: "Prescription Queue", badge: "2" },
    { path: "/pharmacy/dispensing", icon: <Package className="h-5 w-5" />, label: "Dispensing" },
    { path: "/pharmacy/benefits", icon: <ShieldCheck className="h-5 w-5" />, label: "Benefits" },
    { path: "/pharmacy/interactions", icon: <AlertTriangle className="h-5 w-5" />, label: "Interaction Alerts" },
    { path: "/pharmacy/inventory", icon: <Activity className="h-5 w-5" />, label: "Inventory" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-orange-100 text-orange-800 border-orange-200";
      case "denied": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getBenefitColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-orange-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-green-600";
  };

  const calculateCopay = (prescription: PendingPrescription) => {
    const medicationCost = prescription.quantity * 25; // Mock calculation
    const coveragePercentage = prescription.benefitCategory === "Essential Medicines" ? 90 : 80;
    const copay = medicationCost * (1 - coveragePercentage / 100);
    return { total: medicationCost, copay, covered: medicationCost - copay };
  };

  const handleBiometricVerification = (patientData: any) => {
    setVerifiedPatient(patientData);
    setDispensingChecks(prev => ({ ...prev, patientVerified: true }));
    toast({
      title: "Patient Verified",
      description: `Identity confirmed for ${patientData.firstName} ${patientData.lastName}`,
    });
  };

  const handleGenerateClaim = () => {
    if (!verifiedPatient) {
      toast({
        title: "Verification Required",
        description: "Please verify patient identity first",
        variant: "destructive"
      });
      return;
    }
    setShowClaimGenerator(true);
  };

  const dispenseMedication = async () => {
    if (!selectedPrescription) return;
    
    const allChecksCompleted = Object.values(dispensingChecks).every(check => check);
    if (!allChecksCompleted) {
      toast({
        title: "Dispensing Checks Required",
        description: "Please complete all safety checks before dispensing",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Medication Dispensed",
      description: `${selectedPrescription.medicationName} dispensed to ${selectedPrescription.patient.firstName} ${selectedPrescription.patient.lastName}`,
    });

    setSelectedPrescription(null);
    setVerifiedPatient(null);
    setDispensingChecks({
      patientVerified: false,
      dosageVerified: false,
      interactionsChecked: false,
      insuranceCovered: false,
      patientCounseled: false
    });
  };

  return (
    <SharedLayout sidebarItems={sidebarItems} title="Pharmacy Dashboard">
      <div className="space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Pill className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Pending Prescriptions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">Dispensed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Drug Interactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">KES 45K</p>
                  <p className="text-sm text-muted-foreground">Revenue Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Section */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Essential pharmacy workflow tools</CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col items-center justify-center space-y-2 border-2 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-600 transition-all duration-200 hover:scale-105"
                  onClick={() => setShowBiometricModal(true)}
                >
                  <Fingerprint className="h-6 w-6" />
                  <span className="text-sm font-medium">Verify Patient</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col items-center justify-center space-y-2 border-2 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-200 hover:scale-105"
                >
                  <Shield className="h-6 w-6" />
                  <span className="text-sm font-medium">Preauthorization</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col items-center justify-center space-y-2 border-2 rounded-2xl bg-green-50 hover:bg-green-100 text-green-600 transition-all duration-200 hover:scale-105"
                  onClick={() => setShowPrescriptionModal(true)}
                >
                  <FileCheck className="h-6 w-6" />
                  <span className="text-sm font-medium">Validate Prescription</span>
                </Button>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-20 w-full flex flex-col items-center justify-center space-y-2 border-2 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-600 transition-all duration-200 hover:scale-105 relative"
                    >
                      <Lock className="h-6 w-6" />
                      <span className="text-sm font-medium">Secure Claim Log</span>
                      <Info className="h-3 w-3 absolute top-2 right-2 opacity-50" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Securely log claims to blockchain for immutable audit trail</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Real-time platform health monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-xl">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-teal-600" />
                  <span className="text-sm text-gray-600">Intelligence Engine</span>
                </div>
                <Badge variant="secondary" className="text-green-600 bg-green-50 rounded-full px-3 py-1">
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-xl">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-teal-600" />
                  <span className="text-sm text-gray-600">System Database</span>
                </div>
                <Badge variant="secondary" className="text-green-600 bg-green-50 rounded-full px-3 py-1">
                  Healthy
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-xl">
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-teal-600" />
                  <span className="text-sm text-gray-600">Smart Contract Ledger</span>
                </div>
                <Badge variant="secondary" className="text-green-600 bg-green-50 rounded-full px-3 py-1">
                  Connected
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-xl">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-teal-600" />
                  <span className="text-sm text-gray-600">Payments</span>
                </div>
                <Badge variant="secondary" className="text-green-600 bg-green-50 rounded-full px-3 py-1">
                  Online
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Prescription Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Prescription Queue</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prescriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
            </div>

            <div className="space-y-3">
              {pendingPrescriptions.map((prescription) => (
                <Card 
                  key={prescription.id} 
                  className={`card-hover cursor-pointer transition-all ${
                    selectedPrescription?.id === prescription.id ? 'ring-2 ring-primary' : ''
                  } ${prescription.interactions.length > 0 ? 'border-l-4 border-l-orange-500' : ''}`}
                  onClick={() => setSelectedPrescription(prescription)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">
                            {prescription.patient.firstName} {prescription.patient.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {prescription.patient.patientId} | Age: {prescription.patient.age}
                          </p>
                        </div>
                        <Badge className={getStatusColor(prescription.preauthorizationStatus)}>
                          {prescription.preauthorizationStatus.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-primary">
                            {prescription.medicationName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {prescription.dosage}
                          </span>
                        </div>
                        <p className="text-sm">
                          {prescription.frequency} × {prescription.duration}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {prescription.quantity} | {prescription.indication}
                        </p>
                      </div>

                      {prescription.interactions.length > 0 && (
                        <div className="flex items-center space-x-1 text-orange-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-xs">Drug Interaction Alert</span>
                        </div>
                      )}

                      {prescription.patient.allergies.length > 0 && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-xs">
                            Allergies: {prescription.patient.allergies.join(", ")}
                          </span>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Prescribed by: {prescription.doctor.firstName} {prescription.doctor.lastName}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Center Panel - Dispensing Interface */}
          <div className="lg:col-span-2 space-y-4">
            {selectedPrescription ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Pill className="h-5 w-5" />
                      <span>Dispensing: {selectedPrescription.medicationName}</span>
                    </CardTitle>
                    <CardDescription>
                      Patient: {selectedPrescription.patient.firstName} {selectedPrescription.patient.lastName} | 
                      Weight: {selectedPrescription.patient.weight}kg | 
                      Age: {selectedPrescription.patient.age}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Drug Interaction Warnings */}
                    {selectedPrescription.interactions.length > 0 && (
                      <div className="p-4 border border-orange-200 bg-orange-50 rounded-2xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          <h4 className="font-medium text-orange-800">Drug Interaction Warning</h4>
                        </div>
                        <ul className="text-sm text-orange-700 space-y-1">
                          {selectedPrescription.interactions.map((interaction, index) => (
                            <li key={index}>• {interaction}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Safety Warnings */}
                    {selectedPrescription.warnings.length > 0 && (
                      <div className="p-4 border border-blue-200 bg-blue-50 rounded-2xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium text-blue-800">Safety Information</h4>
                        </div>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {selectedPrescription.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Biometric Verification Section */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Patient Verification</h4>
                      <div className="p-4 border rounded-xl bg-muted/50">
                        {!dispensingChecks.patientVerified ? (
                          <div className="text-center space-y-3">
                            <Fingerprint className="h-12 w-12 text-muted-foreground mx-auto" />
                            <div>
                              <p className="text-sm font-medium">Identity Verification Required</p>
                              <p className="text-xs text-muted-foreground">Verify patient identity to access insurance details</p>
                            </div>
                            <Button 
                              onClick={() => setShowBiometricModal(true)}
                              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
                            >
                              <Fingerprint className="h-4 w-4 mr-2" />
                              Verify Patient Identity
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Patient Verified</span>
                            </div>
                            {verifiedPatient && (
                              <div className="text-sm space-y-1">
                                <p><span className="font-medium">Name:</span> {verifiedPatient.firstName} {verifiedPatient.lastName}</p>
                                <p><span className="font-medium">Member ID:</span> {verifiedPatient.memberId}</p>
                                <p><span className="font-medium">Insurer:</span> {verifiedPatient.insurerName}</p>
                              </div>
                            )}
                            <Button 
                              onClick={handleGenerateClaim}
                              variant="outline"
                              className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 rounded-xl"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Generate Insurance Claim
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dispensing Checklist */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Dispensing Safety Checklist</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="patient-verified"
                            checked={dispensingChecks.patientVerified}
                            onCheckedChange={(checked) => 
                              setDispensingChecks(prev => ({ ...prev, patientVerified: checked as boolean }))
                            }
                            disabled={true} // This is now controlled by biometric verification
                          />
                          <Label htmlFor="patient-verified">Patient identity verified</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="dosage-verified"
                            checked={dispensingChecks.dosageVerified}
                            onCheckedChange={(checked) => 
                              setDispensingChecks(prev => ({ ...prev, dosageVerified: checked as boolean }))
                            }
                          />
                          <Label htmlFor="dosage-verified">Dosage and frequency verified</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="interactions-checked"
                            checked={dispensingChecks.interactionsChecked}
                            onCheckedChange={(checked) => 
                              setDispensingChecks(prev => ({ ...prev, interactionsChecked: checked as boolean }))
                            }
                          />
                          <Label htmlFor="interactions-checked">Drug interactions reviewed</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="insurance-covered"
                            checked={dispensingChecks.insuranceCovered}
                            onCheckedChange={(checked) => 
                              setDispensingChecks(prev => ({ ...prev, insuranceCovered: checked as boolean }))
                            }
                          />
                          <Label htmlFor="insurance-covered">Insurance coverage confirmed</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="patient-counseled"
                            checked={dispensingChecks.patientCounseled}
                            onCheckedChange={(checked) => 
                              setDispensingChecks(prev => ({ ...prev, patientCounseled: checked as boolean }))
                            }
                          />
                          <Label htmlFor="patient-counseled">Patient counseled on medication use</Label>
                        </div>
                      </div>
                    </div>

                    {/* Cost Calculation */}
                    <div className="p-4 border rounded-2xl">
                      <div className="flex items-center space-x-2 mb-3">
                        <Calculator className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Cost Breakdown</h4>
                      </div>
                      {(() => {
                        const costs = calculateCopay(selectedPrescription);
                        return (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total medication cost:</span>
                              <span>KES {costs.total}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                              <span>Insurance covered:</span>
                              <span>KES {costs.covered}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-medium">
                              <span>Patient copay:</span>
                              <span>KES {costs.copay}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <Button 
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl" 
                      size="lg"
                      onClick={dispenseMedication}
                      disabled={!Object.values(dispensingChecks).every(check => check)}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Dispense Medication
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Select a Prescription</h3>
                  <p className="text-muted-foreground">
                    Choose a prescription from the queue to begin dispensing
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Benefit Tracking Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5" />
              <span>Benefit Category Usage</span>
            </CardTitle>
            <CardDescription>
              Track patient benefit utilization across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefitInfo.map((benefit) => (
                <div key={benefit.category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{benefit.category}</h4>
                    <span className={`text-sm font-medium ${getBenefitColor(benefit.utilizationPercentage)}`}>
                      {benefit.utilizationPercentage}%
                    </span>
                  </div>
                  <Progress 
                    value={benefit.utilizationPercentage} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Used:</span>
                      <span>KES {benefit.usedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining:</span>
                      <span>KES {benefit.remainingAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Biometric Verification Modal */}
        <BiometricVerificationModal
          isOpen={showBiometricModal}
          onClose={() => setShowBiometricModal(false)}
          onVerificationComplete={handleBiometricVerification}
          patientId={selectedPrescription?.patient.patientId}
        />

        {/* Claim Form Generator */}
        {verifiedPatient && (
          <ClaimFormGenerator
            isOpen={showClaimGenerator}
            onClose={() => setShowClaimGenerator(false)}
            patientData={verifiedPatient}
          />
        )}

        {/* Prescription Validation Modal */}
        {showPrescriptionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Prescription Validation</h3>
              <p className="text-gray-600 mb-4">
                This feature validates prescription authenticity, checks for drug interactions, and verifies dosage appropriateness.
              </p>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setShowPrescriptionModal(false)}
                  variant="outline"
                  className="flex-1 rounded-xl"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => setShowPrescriptionModal(false)}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
                >
                  Validate
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SharedLayout>
  );
}