import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import {
  Users,
  Calendar,
  Activity,
  FileText,
  AlertCircle,
  ChevronRight,
  Home,
  UserPlus,
  ClipboardList,
  Pill,
  FileBarChart,
  History,
  Settings,
  LogOut,
  Clock,
  Thermometer,
  Heart,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sidebar Component with light theme
function Sidebar({ user }: { user: any }) {
  const [activeItem, setActiveItem] = useState("dashboard");
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/modern-doctor" },
    { id: "queue", label: "Patient Queue", icon: Users, href: "/modern-doctor/queue" },
    { id: "consultations", label: "Consultations", icon: ClipboardList, href: "/modern-doctor/consultations" },
    { id: "prescriptions", label: "Prescriptions", icon: Pill, href: "/modern-doctor/prescriptions" },
    { id: "lab-orders", label: "Lab Orders", icon: FileBarChart, href: "/modern-doctor/lab" },
    { id: "history", label: "Patient History", icon: History, href: "/modern-doctor/history" },
    { id: "settings", label: "Settings", icon: Settings, href: "/modern-doctor/settings" }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#265651] to-[#6BBDB4]">
          Erlessed
        </h1>
        <p className="text-sm text-gray-600 mt-1">Doctor Dashboard</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-900">{user.name}</p>
        <p className="text-xs text-[#265651] mt-1 capitalize">{user.role}</p>
        <Badge className="mt-2 bg-[#6BBDB4]/20 text-[#265651] border-[#6BBDB4]/30">
          KMPDC Verified
        </Badge>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <Link href={item.href}>
                  <div
                    onClick={() => setActiveItem(item.id)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-[#265651]/10 to-[#6BBDB4]/10 text-[#265651] border border-[#6BBDB4]/30"
                        : "hover:bg-gray-100 text-gray-700 hover:text-[#265651]"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-700 hover:text-[#265651] hover:bg-gray-100"
          onClick={async () => {
            await logout();
            setLocation("/modern-auth");
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}

// Welcome Card Component
function WelcomeCard({ user }: { user: any }) {
  return (
    <Card className="bg-gradient-to-r from-[#265651] to-[#6BBDB4] border-0 shadow-md text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Welcome back, Dr. {user.name}!
            </h2>
            <p className="text-white/90 mt-1">
              You have {user.appointmentsToday || 12} appointments scheduled today
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4 text-white/80" />
              <span className="text-sm text-white/80">Next patient in 15 mins</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Stats Component
function QuickStats({ user }: { user: any }) {
  const stats = [
    {
      label: "Patients Today",
      value: "12",
      change: "3 remaining",
      icon: Users,
      color: "text-[#265651]",
      bgColor: "bg-[#265651]/10"
    },
    {
      label: "Consultations",
      value: "9",
      change: "75% complete",
      icon: ClipboardList,
      color: "text-[#6BBDB4]",
      bgColor: "bg-[#6BBDB4]/10"
    },
    {
      label: "Lab Results",
      value: "5",
      change: "2 pending",
      icon: FileBarChart,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      label: "Prescriptions",
      value: "24",
      change: "Today",
      icon: Pill,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-2">{stat.change}</p>
                </div>
                <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                  <Icon className={cn("w-6 h-6", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Patient Queue Component
function PatientQueue() {
  const patients = [
    {
      id: "PT-001",
      name: "Sarah Mwangi",
      age: 32,
      visitType: "Follow-up",
      priority: "normal",
      waitTime: "10 mins",
      vitals: { bp: "120/80", temp: "36.5°C", pulse: "72 bpm" }
    },
    {
      id: "PT-002",
      name: "James Ochieng",
      age: 45,
      visitType: "New Visit",
      priority: "high",
      waitTime: "25 mins",
      vitals: { bp: "145/95", temp: "37.8°C", pulse: "88 bpm" }
    },
    {
      id: "PT-003",
      name: "Grace Njeri",
      age: 28,
      visitType: "Emergency",
      priority: "urgent",
      waitTime: "5 mins",
      vitals: { bp: "110/70", temp: "36.2°C", pulse: "65 bpm" }
    }
  ];

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gray-900">Patient Queue</CardTitle>
        <Button variant="ghost" size="sm" className="text-[#265651] hover:text-[#265651]/80">
          View All <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patients.map((patient) => (
            <div key={patient.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{patient.name}</span>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        patient.priority === "urgent" && "bg-red-100 text-red-700 border-red-300",
                        patient.priority === "high" && "bg-orange-100 text-orange-700 border-orange-300",
                        patient.priority === "normal" && "bg-blue-100 text-blue-700 border-blue-300"
                      )}
                    >
                      {patient.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {patient.visitType} • Age {patient.age} • Waiting {patient.waitTime}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{patient.vitals.bp}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4 text-blue-500" />
                      <span>{patient.vitals.temp}</span>
                    </div>
                  </div>
                  <Button size="sm" className="mt-2 bg-[#265651] hover:bg-[#265651]/90 text-white">
                    Start Consultation
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Actions Component
function QuickActions({ user }: { user: any }) {
  const actions = [
    {
      label: "New Consultation",
      description: "Start patient visit",
      icon: UserPlus,
      color: "from-[#265651] to-[#265651]/80",
      href: "/modern-doctor/consultation/new"
    },
    {
      label: "Lab Results",
      description: "Review pending results",
      icon: FileBarChart,
      color: "from-[#6BBDB4] to-[#6BBDB4]/80",
      href: "/modern-doctor/lab-results"
    },
    {
      label: "Write Prescription",
      description: "E-prescribe medications",
      icon: Pill,
      color: "from-purple-500 to-purple-600",
      href: "/modern-doctor/prescribe"
    },
    {
      label: "Patient Records",
      description: "Access medical history",
      icon: History,
      color: "from-orange-500 to-orange-600",
      href: "/modern-doctor/records"
    }
  ];

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <Link key={index} href={action.href}>
                <div className="block p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-[#6BBDB4] hover:bg-[#6BBDB4]/5 transition-all group cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 group-hover:text-[#265651] transition-colors">
                        {action.label}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
export default function ModernDoctorDashboard() {
  const { user } = useAuth();
  
  const dashboardUser = {
    name: user?.name || "Doctor",
    role: user?.role || "doctor",
    appointmentsToday: 12
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#e8f5f0] via-[#f0faf7] to-[#d1e7e0]">
      <Sidebar user={dashboardUser} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <WelcomeCard user={dashboardUser} />
        <QuickStats user={dashboardUser} />
        <PatientQueue />
        <QuickActions user={dashboardUser} />
      </main>
    </div>
  );
}