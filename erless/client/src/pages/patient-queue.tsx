import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, AlertTriangle, User, Stethoscope, FileText, Filter } from "lucide-react";
import { BiometricScanner } from "@/components/biometric-scanner";

interface TriagePatient {
  id: number;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  arrivalTime: string;
  priority: 'emergency' | 'urgent' | 'routine';
  chiefComplaint: string;
  vitals: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    oxygenSat: number;
  };
  insurance: string;
  claimStatus: 'verified' | 'pending' | 'denied';
  labPending: boolean;
  referralPending: boolean;
  waitTime: number;
}

export default function PatientQueue() {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<TriagePatient | null>(null);

  // Mock patient queue data
  const patientQueue: TriagePatient[] = [
    {
      id: 1,
      patientId: "PT-2024-001",
      name: "Sarah Johnson",
      age: 34,
      gender: "Female",
      arrivalTime: "09:15 AM",
      priority: "urgent",
      chiefComplaint: "Chest pain radiating to left arm",
      vitals: {
        bloodPressure: "150/95",
        heartRate: 98,
        temperature: 37.2,
        oxygenSat: 97
      },
      insurance: "Premium Health+",
      claimStatus: "verified",
      labPending: true,
      referralPending: false,
      waitTime: 45
    },
    {
      id: 2,
      patientId: "PT-2024-002",
      name: "Michael Chen",
      age: 28,
      gender: "Male",
      arrivalTime: "09:30 AM",
      priority: "routine",
      chiefComplaint: "Annual physical exam",
      vitals: {
        bloodPressure: "120/80",
        heartRate: 72,
        temperature: 36.8,
        oxygenSat: 99
      },
      insurance: "Basic Care",
      claimStatus: "verified",
      labPending: false,
      referralPending: false,
      waitTime: 30
    },
    {
      id: 3,
      patientId: "PT-2024-003",
      name: "Emma Rodriguez",
      age: 45,
      gender: "Female",
      arrivalTime: "08:45 AM",
      priority: "emergency",
      chiefComplaint: "Severe abdominal pain",
      vitals: {
        bloodPressure: "110/70",
        heartRate: 110,
        temperature: 38.5,
        oxygenSat: 95
      },
      insurance: "Emergency Care",
      claimStatus: "pending",
      labPending: true,
      referralPending: true,
      waitTime: 75
    }
  ];

  const filteredPatients = patientQueue.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (filter) {
      case 'emergency':
        return matchesSearch && patient.priority === 'emergency';
      case 'lab-pending':
        return matchesSearch && patient.labPending;
      case 'referral-pending':
        return matchesSearch && patient.referralPending;
      case 'claim-issues':
        return matchesSearch && patient.claimStatus !== 'verified';
      default:
        return matchesSearch;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'routine': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'denied': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Queue & Triage</h1>
          <p className="text-gray-600 mt-1">Real-time patient queue with triage priority and claim status</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {filteredPatients.length} patients waiting
          </Badge>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <span>Queue Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by patient name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="sm:w-48">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="emergency">Emergency Priority</SelectItem>
                  <SelectItem value="lab-pending">Lab Results Pending</SelectItem>
                  <SelectItem value="referral-pending">Referral Pending</SelectItem>
                  <SelectItem value="claim-issues">Claim Issues</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="queue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="queue">Patient Queue</TabsTrigger>
          <TabsTrigger value="triage">Triage Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedPatient(patient)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                      </div>
                      <Badge className={getPriorityColor(patient.priority)}>
                        {patient.priority.toUpperCase()}
                      </Badge>
                      <Badge className={getClaimStatusColor(patient.claimStatus)}>
                        {patient.claimStatus}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Patient ID: <span className="font-medium">{patient.patientId}</span></p>
                        <p className="text-gray-600">Age/Gender: <span className="font-medium">{patient.age}Y {patient.gender}</span></p>
                        <p className="text-gray-600">Insurance: <span className="font-medium">{patient.insurance}</span></p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">Arrival: <span className="font-medium">{patient.arrivalTime}</span></p>
                        <p className="text-gray-600">Wait Time: <span className="font-medium">{patient.waitTime} min</span></p>
                        <p className="text-gray-600">Chief Complaint:</p>
                        <p className="font-medium text-gray-900">{patient.chiefComplaint}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">Vitals:</p>
                        <p className="text-xs text-gray-600">
                          BP: {patient.vitals.bloodPressure} | 
                          HR: {patient.vitals.heartRate} | 
                          Temp: {patient.vitals.temperature}°C |
                          O2: {patient.vitals.oxygenSat}%
                        </p>
                        <div className="flex space-x-2 mt-2">
                          {patient.labPending && (
                            <Badge variant="outline" className="text-xs">Lab Pending</Badge>
                          )}
                          {patient.referralPending && (
                            <Badge variant="outline" className="text-xs">Referral Pending</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button size="sm" className="teal-button">
                      <Stethoscope className="w-4 h-4 mr-1" />
                      Consult
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-1" />
                      View Chart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="triage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Priority Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Priority Cases</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-red-600 font-medium">Emergency</span>
                    <Badge className="bg-red-100 text-red-800">
                      {patientQueue.filter(p => p.priority === 'emergency').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-600 font-medium">Urgent</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {patientQueue.filter(p => p.priority === 'urgent').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-medium">Routine</span>
                    <Badge className="bg-green-100 text-green-800">
                      {patientQueue.filter(p => p.priority === 'routine').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Lab Results</span>
                    <Badge variant="outline">
                      {patientQueue.filter(p => p.labPending).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Referrals</span>
                    <Badge variant="outline">
                      {patientQueue.filter(p => p.referralPending).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Claim Issues</span>
                    <Badge variant="outline">
                      {patientQueue.filter(p => p.claimStatus !== 'verified').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wait Time Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Queue Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Wait</span>
                    <span className="font-medium">
                      {Math.round(patientQueue.reduce((acc, p) => acc + p.waitTime, 0) / patientQueue.length)} min
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Longest Wait</span>
                    <span className="font-medium text-red-600">
                      {Math.max(...patientQueue.map(p => p.waitTime))} min
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Patients</span>
                    <span className="font-medium">{patientQueue.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Patient Detail Modal/Panel */}
      {selectedPatient && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Patient Details: {selectedPatient.name}</span>
              <Button variant="ghost" onClick={() => setSelectedPatient(null)}>×</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Patient Information</h4>
                <div className="space-y-2 text-sm">
                  <p>ID: {selectedPatient.patientId}</p>
                  <p>Age: {selectedPatient.age} years</p>
                  <p>Gender: {selectedPatient.gender}</p>
                  <p>Insurance: {selectedPatient.insurance}</p>
                  <p>Claim Status: <Badge className={getClaimStatusColor(selectedPatient.claimStatus)}>{selectedPatient.claimStatus}</Badge></p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Clinical Information</h4>
                <div className="space-y-2 text-sm">
                  <p>Chief Complaint: {selectedPatient.chiefComplaint}</p>
                  <p>Priority: <Badge className={getPriorityColor(selectedPatient.priority)}>{selectedPatient.priority}</Badge></p>
                  <p>Vitals: BP {selectedPatient.vitals.bloodPressure}, HR {selectedPatient.vitals.heartRate}, T {selectedPatient.vitals.temperature}°C</p>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Button className="teal-button w-full">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Start Consultation
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    View Full Medical History
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}