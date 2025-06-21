import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SharedLayout } from "@/components/layout/shared-layout";
import { BiometricVerificationModal } from "@/components/biometric-verification-modal";
import { ClaimFormGenerator } from "@/components/claim-form-generator";
import { 
  Users, Calendar, FileText, CreditCard, Clock, Phone, 
  CheckCircle, AlertCircle, Search, Plus, User, MapPin,
  Fingerprint, Shield, Activity, TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Appointment {
  id: number;
  patient: {
    firstName: string;
    lastName: string;
    patientId: string;
    phoneNumber: string;
    email: string;
    insuranceProvider: string;
    memberId: string;
  };
  appointmentType: string;
  scheduledTime: string;
  status: "scheduled" | "checked_in" | "in_progress" | "completed" | "cancelled";
  doctor: string;
  department: string;
  notes?: string;
}

interface WalkInPatient {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  chiefComplaint: string;
  urgency: "low" | "medium" | "high";
  registeredAt: string;
  insurance?: {
    provider: string;
    memberId: string;
  };
}

export default function ModernFrontOfficeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("appointments");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showClaimGenerator, setShowClaimGenerator] = useState(false);
  const [verifiedPatient, setVerifiedPatient] = useState<any>(null);

  // Mock data
  const appointments: Appointment[] = [
    {
      id: 1,
      patient: {
        firstName: "Sarah",
        lastName: "Johnson",
        patientId: "PT-2024-001",
        phoneNumber: "+254712345678",
        email: "sarah.j@email.com",
        insuranceProvider: "CIC Insurance",
        memberId: "CIC-001234567"
      },
      appointmentType: "General Consultation",
      scheduledTime: "2024-06-21T09:00:00Z",
      status: "scheduled",
      doctor: "Dr. James Mwangi",
      department: "General Medicine"
    },
    {
      id: 2,
      patient: {
        firstName: "Michael",
        lastName: "Ochieng",
        patientId: "PT-2024-002",
        phoneNumber: "+254723456789",
        email: "michael.o@email.com",
        insuranceProvider: "AAR Insurance",
        memberId: "AAR-987654321"
      },
      appointmentType: "Follow-up Visit",
      scheduledTime: "2024-06-21T10:30:00Z",
      status: "checked_in",
      doctor: "Dr. Grace Wanjiku",
      department: "Endocrinology"
    },
    {
      id: 3,
      patient: {
        firstName: "Grace",
        lastName: "Wanjiku",
        patientId: "PT-2024-003",
        phoneNumber: "+254734567890",
        email: "grace.w@email.com",
        insuranceProvider: "NHIF",
        memberId: "NHIF-567890123"
      },
      appointmentType: "Specialist Consultation",
      scheduledTime: "2024-06-21T14:00:00Z",
      status: "scheduled",
      doctor: "Dr. Peter Kimani",
      department: "Cardiology"
    }
  ];

  const walkInPatients: WalkInPatient[] = [
    {
      id: 1,
      firstName: "David",
      lastName: "Mwiti",
      phoneNumber: "+254745678901",
      chiefComplaint: "Chest pain",
      urgency: "high",
      registeredAt: "2024-06-21T08:45:00Z",
      insurance: {
        provider: "CIC Insurance",
        memberId: "CIC-445566778"
      }
    },
    {
      id: 2,
      firstName: "Mary",
      lastName: "Njeri",
      phoneNumber: "+254756789012",
      chiefComplaint: "Headache and fever",
      urgency: "medium",
      registeredAt: "2024-06-21T09:15:00Z"
    }
  ];

  const sidebarItems = [
    { path: "/front-office", icon: <Calendar className="h-5 w-5" />, label: "Appointments", badge: appointments.length.toString() },
    { path: "/front-office/walk-ins", icon: <Users className="h-5 w-5" />, label: "Walk-in Patients", badge: walkInPatients.length.toString() },
    { path: "/front-office/registration", icon: <FileText className="h-5 w-5" />, label: "Patient Registration" },
    { path: "/front-office/insurance", icon: <Shield className="h-5 w-5" />, label: "Insurance Verification" },
    { path: "/front-office/billing", icon: <CreditCard className="h-5 w-5" />, label: "Billing & Claims" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "checked_in": return "bg-orange-100 text-orange-800 border-orange-200";
      case "in_progress": return "bg-purple-100 text-purple-800 border-purple-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-orange-100 text-orange-800 border-orange-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleBiometricVerification = (patientData: any) => {
    setVerifiedPatient(patientData);
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

  const checkInPatient = (appointmentId: number) => {
    toast({
      title: "Patient Checked In",
      description: "Patient has been successfully checked in",
    });
  };

  const startInsuranceVerification = (patient: any) => {
    setShowBiometricModal(true);
  };

  return (
    <SharedLayout sidebarItems={sidebarItems} title="Front Office Dashboard">
      <div className="space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                  <p className="text-sm text-muted-foreground">Today's Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{walkInPatients.length}</p>
                  <p className="text-sm text-muted-foreground">Walk-in Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">95%</p>
                  <p className="text-sm text-muted-foreground">Check-in Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="walk-ins">Walk-in Patients</TabsTrigger>
            <TabsTrigger value="registration">New Registration</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Today's Appointments</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="card-hover">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </CardTitle>
                        <CardDescription>
                          {appointment.patient.patientId} | {appointment.patient.phoneNumber}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Appointment Type</p>
                        <p className="font-medium">{appointment.appointmentType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Scheduled Time</p>
                        <p className="font-medium">{new Date(appointment.scheduledTime).toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Doctor</p>
                        <p className="font-medium">{appointment.doctor}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Department</p>
                        <p className="font-medium">{appointment.department}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="text-sm">
                      <p className="text-muted-foreground mb-1">Insurance Information</p>
                      <div className="flex justify-between">
                        <span>Provider:</span>
                        <span className="font-medium">{appointment.patient.insuranceProvider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Member ID:</span>
                        <span className="font-medium">{appointment.patient.memberId}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {appointment.status === "scheduled" && (
                        <Button 
                          size="sm" 
                          onClick={() => checkInPatient(appointment.id)}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Check In
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => startInsuranceVerification(appointment.patient)}
                        className="flex-1"
                      >
                        <Fingerprint className="h-4 w-4 mr-1" />
                        Verify Insurance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="walk-ins" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Walk-in Patients</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Register Walk-in
              </Button>
            </div>

            <div className="space-y-4">
              {walkInPatients.map((patient) => (
                <Card key={patient.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-lg">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <Badge className={getUrgencyColor(patient.urgency)}>
                            {patient.urgency.toUpperCase()} PRIORITY
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{patient.phoneNumber}</p>
                        <p className="text-sm"><span className="font-medium">Chief Complaint:</span> {patient.chiefComplaint}</p>
                        <p className="text-xs text-muted-foreground">
                          Registered: {new Date(patient.registeredAt).toLocaleString()}
                        </p>
                        {patient.insurance && (
                          <div className="text-sm">
                            <p><span className="font-medium">Insurance:</span> {patient.insurance.provider}</p>
                            <p><span className="font-medium">Member ID:</span> {patient.insurance.memberId}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button size="sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                        <Button size="sm" variant="outline">
                          <Fingerprint className="h-4 w-4 mr-1" />
                          Verify Identity
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="registration" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>New Patient Registration</CardTitle>
                <CardDescription>Register a new patient and verify insurance information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Enter first name" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Enter last name" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+254..." />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="patient@email.com" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Insurance Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CIC">CIC Insurance</SelectItem>
                          <SelectItem value="AAR">AAR Insurance</SelectItem>
                          <SelectItem value="NHIF">NHIF</SelectItem>
                          <SelectItem value="SHA">Social Health Authority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="memberId">Member ID</Label>
                      <Input id="memberId" placeholder="Insurance member ID" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input id="emergencyContact" placeholder="Emergency contact number" />
                </div>

                <div className="flex space-x-3">
                  <Button className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Register Patient
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Register with Biometric
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Patient Verification Section */}
        {verifiedPatient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Patient Verified</span>
              </CardTitle>
              <CardDescription>
                Identity confirmed for insurance processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Patient Name</p>
                  <p className="font-medium">{verifiedPatient.firstName} {verifiedPatient.lastName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Member ID</p>
                  <p className="font-medium">{verifiedPatient.memberId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Insurance Provider</p>
                  <p className="font-medium">{verifiedPatient.insurerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Verification Status</p>
                  <Badge className="bg-green-100 text-green-800">VERIFIED</Badge>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleGenerateClaim} className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Claim Form
                </Button>
                <Button variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Check Benefits
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Biometric Verification Modal */}
        <BiometricVerificationModal
          isOpen={showBiometricModal}
          onClose={() => setShowBiometricModal(false)}
          onVerificationComplete={handleBiometricVerification}
        />

        {/* Claim Form Generator */}
        {verifiedPatient && (
          <ClaimFormGenerator
            isOpen={showClaimGenerator}
            onClose={() => setShowClaimGenerator(false)}
            patientData={verifiedPatient}
          />
        )}
      </div>
    </SharedLayout>
  );
}