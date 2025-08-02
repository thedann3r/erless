import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { MapPin, User, FileText, Camera, Phone, Navigation } from "lucide-react";

interface FieldVisit {
  id: string;
  patientName: string;
  patientId: string;
  address: string;
  coordinates: { lat: number; lng: number };
  scheduledTime: string;
  visitType: "assessment" | "follow-up" | "emergency" | "medication-delivery";
  priority: "low" | "medium" | "high" | "urgent";
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  notes?: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
  };
}

interface PatientLocation {
  id: string;
  name: string;
  address: string;
  distance: string;
  estimatedTime: string;
  urgency: "low" | "medium" | "high";
}

export default function MobileFieldWorker() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("visits");
  const [selectedVisit, setSelectedVisit] = useState<FieldVisit | null>(null);
  const [vitals, setVitals] = useState({
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: ""
  });

  const todayVisits: FieldVisit[] = [
    {
      id: "FV001",
      patientName: "Mary Wanjiku",
      patientId: "PAT-2024-001",
      address: "Kiambu Road, Nairobi",
      coordinates: { lat: -1.2494, lng: 36.7816 },
      scheduledTime: "09:00 AM",
      visitType: "assessment",
      priority: "high",
      status: "scheduled"
    },
    {
      id: "FV002",
      patientName: "John Kamau",
      patientId: "PAT-2024-002",
      address: "Westlands, Nairobi",
      coordinates: { lat: -1.2630, lng: 36.8063 },
      scheduledTime: "11:30 AM",
      visitType: "follow-up",
      priority: "medium",
      status: "scheduled"
    },
    {
      id: "FV003",
      patientName: "Grace Achieng",
      patientId: "PAT-2024-003",
      address: "Karen, Nairobi",
      coordinates: { lat: -1.3197, lng: 36.7076 },
      scheduledTime: "02:00 PM",
      visitType: "medication-delivery",
      priority: "low",
      status: "scheduled"
    }
  ];

  const nearbyPatients: PatientLocation[] = [
    {
      id: "NP001",
      name: "Samuel Ochieng",
      address: "Kilimani, Nairobi",
      distance: "0.8 km",
      estimatedTime: "12 min",
      urgency: "medium"
    },
    {
      id: "NP002",
      name: "Faith Njeri",
      address: "Lavington, Nairobi",
      distance: "1.2 km",
      estimatedTime: "18 min",
      urgency: "low"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50";
      case "in-progress": return "text-blue-600 bg-blue-50";
      case "scheduled": return "text-gray-600 bg-gray-50";
      case "cancelled": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const startVisit = (visit: FieldVisit) => {
    setSelectedVisit({ ...visit, status: "in-progress" });
    setActiveTab("current-visit");
  };

  const completeVisit = () => {
    if (selectedVisit) {
      const processedVitals = {
        bloodPressure: vitals.bloodPressure,
        heartRate: vitals.heartRate ? parseInt(vitals.heartRate) : undefined,
        temperature: vitals.temperature ? parseFloat(vitals.temperature) : undefined,
        oxygenSaturation: vitals.oxygenSaturation ? parseInt(vitals.oxygenSaturation) : undefined,
      };
      setSelectedVisit({ ...selectedVisit, status: "completed", vitals: processedVitals });
      setActiveTab("visits");
      setVitals({ bloodPressure: "", heartRate: "", temperature: "", oxygenSaturation: "" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Erlessed Field</h1>
            <p className="text-sm opacity-90">Welcome, {user?.username}</p>
          </div>
          <div className="text-right">
            <p className="text-sm">Today</p>
            <p className="text-xs opacity-75">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="visits" className="text-xs">Visits</TabsTrigger>
            <TabsTrigger value="current-visit" className="text-xs">Current</TabsTrigger>
            <TabsTrigger value="nearby" className="text-xs">Nearby</TabsTrigger>
            <TabsTrigger value="emergency" className="text-xs">Emergency</TabsTrigger>
          </TabsList>

          {/* Today's Visits */}
          <TabsContent value="visits" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Today's Schedule</h2>
              <Badge variant="secondary">{todayVisits.length} visits</Badge>
            </div>

            {todayVisits.map((visit) => (
              <Card key={visit.id} className="border-l-4 border-l-teal-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{visit.patientName}</h3>
                      <p className="text-xs text-gray-600">{visit.patientId}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(visit.priority)}`}></div>
                      <Badge className={getStatusColor(visit.status)} variant="secondary">
                        {visit.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      {visit.address}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <User className="w-3 h-3 mr-1" />
                      {visit.visitType.replace('-', ' ')} • {visit.scheduledTime}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                      onClick={() => startVisit(visit)}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Start Visit
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

          {/* Current Visit */}
          <TabsContent value="current-visit" className="space-y-4">
            {selectedVisit ? (
              <>
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {selectedVisit.patientName}
                      <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600">{selectedVisit.address}</p>
                  </CardHeader>
                </Card>

                {/* Vitals Collection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Patient Vitals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bp" className="text-xs">Blood Pressure</Label>
                        <Input
                          id="bp"
                          placeholder="120/80"
                          value={vitals.bloodPressure}
                          onChange={(e) => setVitals({...vitals, bloodPressure: e.target.value})}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hr" className="text-xs">Heart Rate</Label>
                        <Input
                          id="hr"
                          placeholder="72"
                          value={vitals.heartRate}
                          onChange={(e) => setVitals({...vitals, heartRate: e.target.value})}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="temp" className="text-xs">Temperature (°C)</Label>
                        <Input
                          id="temp"
                          placeholder="36.5"
                          value={vitals.temperature}
                          onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="o2" className="text-xs">O2 Saturation</Label>
                        <Input
                          id="o2"
                          placeholder="98"
                          value={vitals.oxygenSaturation}
                          onChange={(e) => setVitals({...vitals, oxygenSaturation: e.target.value})}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <Button className="w-full bg-gray-600 hover:bg-gray-700">
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>

                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={completeVisit}
                      >
                        Complete Visit
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Save & Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Visit</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Start a visit from your schedule to begin patient assessment
                  </p>
                  <Button onClick={() => setActiveTab("visits")} className="bg-teal-600 hover:bg-teal-700">
                    View Schedule
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Nearby Patients */}
          <TabsContent value="nearby" className="space-y-4">
            <h2 className="text-lg font-semibold">Nearby Patients</h2>
            
            {nearbyPatients.map((patient) => (
              <Card key={patient.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{patient.name}</h3>
                      <p className="text-xs text-gray-600">{patient.address}</p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={patient.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}
                    >
                      {patient.urgency}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-gray-600">
                      {patient.distance} • {patient.estimatedTime} away
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1 bg-teal-600 hover:bg-teal-700">
                      <Navigation className="w-3 h-3 mr-1" />
                      Navigate
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

          {/* Emergency */}
          <TabsContent value="emergency" className="space-y-4">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Emergency Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-red-600 hover:bg-red-700 h-12">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Emergency Services
                </Button>
                
                <Button className="w-full bg-orange-600 hover:bg-orange-700 h-12">
                  <User className="w-5 h-5 mr-2" />
                  Request Supervisor
                </Button>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12">
                  <FileText className="w-5 h-5 mr-2" />
                  Report Incident
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}