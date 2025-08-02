import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { 
  Heart, FileText, Calendar, Pill, Phone, MapPin, 
  CreditCard, Shield, Clock, CheckCircle, AlertCircle,
  User, Camera, Download, Star
} from "lucide-react";

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: "consultation" | "follow-up" | "procedure" | "test";
  status: "confirmed" | "pending" | "cancelled" | "completed";
}

interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  dateIssued: string;
  refillsRemaining: number;
  status: "active" | "expired" | "discontinued";
}

interface ClaimStatus {
  id: string;
  serviceDate: string;
  provider: string;
  service: string;
  amount: number;
  status: "submitted" | "processing" | "approved" | "denied" | "paid";
  copayAmount?: number;
}

interface HealthMetric {
  type: string;
  value: string;
  unit: string;
  date: string;
  status: "normal" | "warning" | "critical";
}

export default function MobilePatientPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const appointments: Appointment[] = [
    {
      id: "APT001",
      doctorName: "Dr. Sarah Mwangi",
      specialty: "Cardiology",
      date: "2024-12-21",
      time: "10:00 AM",
      location: "Nairobi Hospital",
      type: "consultation",
      status: "confirmed"
    },
    {
      id: "APT002",
      doctorName: "Dr. James Kiprotich",
      specialty: "General Practice",
      date: "2024-12-28",
      time: "2:30 PM",
      location: "Karen Medical Center",
      type: "follow-up",
      status: "pending"
    }
  ];

  const prescriptions: Prescription[] = [
    {
      id: "RX001",
      medicationName: "Lisinopril 10mg",
      dosage: "10mg",
      frequency: "Once daily",
      prescribedBy: "Dr. Sarah Mwangi",
      dateIssued: "2024-12-15",
      refillsRemaining: 2,
      status: "active"
    },
    {
      id: "RX002",
      medicationName: "Metformin 500mg",
      dosage: "500mg",
      frequency: "Twice daily",
      prescribedBy: "Dr. James Kiprotich",
      dateIssued: "2024-12-10",
      refillsRemaining: 1,
      status: "active"
    }
  ];

  const claims: ClaimStatus[] = [
    {
      id: "CLM001",
      serviceDate: "2024-12-15",
      provider: "Nairobi Hospital",
      service: "Cardiology Consultation",
      amount: 8500,
      status: "approved",
      copayAmount: 1000
    },
    {
      id: "CLM002",
      serviceDate: "2024-12-10",
      provider: "Lab Quest",
      service: "Blood Tests",
      amount: 3200,
      status: "processing"
    }
  ];

  const healthMetrics: HealthMetric[] = [
    { type: "Blood Pressure", value: "118/75", unit: "mmHg", date: "2024-12-19", status: "normal" },
    { type: "Heart Rate", value: "72", unit: "bpm", date: "2024-12-19", status: "normal" },
    { type: "Blood Sugar", value: "95", unit: "mg/dL", date: "2024-12-18", status: "normal" },
    { type: "Weight", value: "68.5", unit: "kg", date: "2024-12-17", status: "normal" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": case "approved": case "active": case "paid":
        return "text-green-600 bg-green-50";
      case "pending": case "processing": case "submitted":
        return "text-yellow-600 bg-yellow-50";
      case "cancelled": case "denied": case "expired":
        return "text-red-600 bg-red-50";
      case "completed":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "text-green-600";
      case "warning": return "text-yellow-600";
      case "critical": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">My Health Portal</h1>
            <p className="text-sm opacity-90">Welcome back, {user?.username}</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="dashboard" className="text-xs">Home</TabsTrigger>
            <TabsTrigger value="appointments" className="text-xs">Visits</TabsTrigger>
            <TabsTrigger value="prescriptions" className="text-xs">Meds</TabsTrigger>
            <TabsTrigger value="claims" className="text-xs">Claims</TabsTrigger>
            <TabsTrigger value="health" className="text-xs">Health</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-teal-500">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="text-xs text-gray-600">Next Visit</p>
                      <p className="text-sm font-semibold">Dec 21</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Pill className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Active Meds</p>
                      <p className="text-sm font-semibold">{prescriptions.filter(p => p.status === 'active').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Claim Approved</p>
                    <p className="text-xs text-gray-600">Cardiology consultation - KES 8,500</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Appointment Confirmed</p>
                    <p className="text-xs text-gray-600">Dr. Sarah Mwangi - Dec 21, 10:00 AM</p>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Pill className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Prescription Refilled</p>
                    <p className="text-xs text-gray-600">Lisinopril 10mg - 2 refills remaining</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="h-16 flex-col bg-teal-600 hover:bg-teal-700">
                    <Calendar className="w-5 h-5 mb-1" />
                    <span className="text-xs">Book Visit</span>
                  </Button>
                  <Button className="h-16 flex-col" variant="outline">
                    <Pill className="w-5 h-5 mb-1" />
                    <span className="text-xs">Refill Rx</span>
                  </Button>
                  <Button className="h-16 flex-col" variant="outline">
                    <FileText className="w-5 h-5 mb-1" />
                    <span className="text-xs">View Records</span>
                  </Button>
                  <Button className="h-16 flex-col" variant="outline">
                    <Phone className="w-5 h-5 mb-1" />
                    <span className="text-xs">Contact Care</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Appointments</h2>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                <Calendar className="w-4 h-4 mr-1" />
                Book
              </Button>
            </div>

            {appointments.map((appointment) => (
              <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{appointment.doctorName}</h3>
                      <p className="text-xs text-gray-600">{appointment.specialty}</p>
                    </div>
                    <Badge className={getStatusColor(appointment.status)} variant="secondary">
                      {appointment.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="w-3 h-3 mr-1" />
                      {appointment.date} at {appointment.time}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      {appointment.location}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Reschedule
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Prescriptions */}
          <TabsContent value="prescriptions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Medications</h2>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                <Pill className="w-4 h-4 mr-1" />
                Refill
              </Button>
            </div>

            {prescriptions.map((prescription) => (
              <Card key={prescription.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{prescription.medicationName}</h3>
                      <p className="text-xs text-gray-600">{prescription.dosage} • {prescription.frequency}</p>
                    </div>
                    <Badge className={getStatusColor(prescription.status)} variant="secondary">
                      {prescription.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-xs text-gray-600">
                      <User className="w-3 h-3 mr-1" />
                      Prescribed by {prescription.prescribedBy}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock className="w-3 h-3 mr-1" />
                      Issued {prescription.dateIssued}
                    </div>
                    <div className="text-xs text-green-600">
                      {prescription.refillsRemaining} refills remaining
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      Request Refill
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Set Reminder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Claims */}
          <TabsContent value="claims" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Claims Status</h2>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                <FileText className="w-4 h-4 mr-1" />
                Submit
              </Button>
            </div>

            {claims.map((claim) => (
              <Card key={claim.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{claim.service}</h3>
                      <p className="text-xs text-gray-600">{claim.provider}</p>
                    </div>
                    <Badge className={getStatusColor(claim.status)} variant="secondary">
                      {claim.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Service Date:</span>
                      <span>{claim.serviceDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium">KES {claim.amount.toLocaleString()}</span>
                    </div>
                    {claim.copayAmount && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Your Copay:</span>
                        <span className="text-red-600">KES {claim.copayAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Health Metrics */}
          <TabsContent value="health" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Health Metrics</h2>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                <Heart className="w-4 h-4 mr-1" />
                Log Data
              </Button>
            </div>

            {/* Health Score */}
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Health Score</h3>
                  <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Progress value={85} className="h-2" />
                  </div>
                  <span className="text-2xl font-bold text-green-600">85</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Based on your recent vitals and health data
                </p>
              </CardContent>
            </Card>

            {/* Recent Metrics */}
            <div className="grid grid-cols-2 gap-4">
              {healthMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">{metric.type}</h4>
                      <div className={`w-2 h-2 rounded-full ${
                        metric.status === 'normal' ? 'bg-green-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    <div className="text-lg font-bold">{metric.value}</div>
                    <div className="text-xs text-gray-600">{metric.unit}</div>
                    <div className="text-xs text-gray-500 mt-1">{metric.date}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Health Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Health Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="h-16 flex-col" variant="outline">
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-xs">Symptom Check</span>
                  </Button>
                  <Button className="h-16 flex-col" variant="outline">
                    <Heart className="w-5 h-5 mb-1" />
                    <span className="text-xs">Vitals Log</span>
                  </Button>
                  <Button className="h-16 flex-col" variant="outline">
                    <FileText className="w-5 h-5 mb-1" />
                    <span className="text-xs">Health Report</span>
                  </Button>
                  <Button className="h-16 flex-col" variant="outline">
                    <Star className="w-5 h-5 mb-1" />
                    <span className="text-xs">Wellness Tips</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}