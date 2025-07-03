import { Link, useLocation } from "wouter";
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  ClipboardList, 
  Activity,
  LogOut,
  Clock,
  AlertCircle,
  ChevronRight,
  UserCheck,
  Heart,
  Thermometer,
  ArrowUp,
  ArrowDown,
  Pill,
  TestTube,
  FileText,
  Brain
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Sidebar Component
function Sidebar({ user }: { user: any }) {
  const [location] = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: "/modern-doctor", label: "Dashboard", icon: Activity },
    { path: "/modern-doctor/patients", label: "Patient Queue", icon: Users },
    { path: "/modern-doctor/consultations", label: "Consultations", icon: Stethoscope },
    { path: "/modern-doctor/prescriptions", label: "Prescriptions", icon: Pill },
    { path: "/modern-doctor/lab-orders", label: "Lab Orders", icon: TestTube },
    { path: "/modern-doctor/appointments", label: "Appointments", icon: Calendar }
  ];

  return (
    <div className="w-64 bg-[#0a0a2e] border-r border-[#1a1a5e] p-6 h-screen flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#14B8A6] to-[#3B82F6]">
          Erlessed
        </h1>
        <p className="text-sm text-gray-400 mt-1">Doctor Portal</p>
      </div>

      <div className="mb-8 p-4 bg-[#1a1150] rounded-lg border border-[#2a1a5e]">
        <p className="text-sm text-gray-400">Logged in as</p>
        <p className="font-semibold text-white">{user.name}</p>
        <p className="text-xs text-[#14B8A6] mt-1 capitalize">{user.role}</p>
        {user.isPremium && (
          <span className="inline-block mt-2 px-2 py-1 text-xs bg-gradient-to-r from-[#14B8A6] to-[#3B82F6] rounded-full">
            Premium
          </span>
        )}
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-[#14B8A6]/20 to-[#3B82F6]/20 text-white border border-[#14B8A6]/30"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1150]"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="pt-8">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1150] w-full transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

// Welcome Card Component
function WelcomeCard({ user }: { user: any }) {
  return (
    <Card className="bg-gradient-to-r from-[#1a1150] to-[#2a1a5e] border-[#3a2a6e]">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome back, Dr. {user.name}!
        </h2>
        <p className="text-gray-300">
          You have 12 patients in queue today. Your next consultation is with John Kamau in 15 minutes.
        </p>
      </CardContent>
    </Card>
  );
}

// Quick Stats Component
function QuickStats({ user }: { user: any }) {
  const stats = [
    {
      label: "Patients Today",
      value: "24",
      change: "+3",
      trend: "up",
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      label: "Consultations",
      value: "18",
      change: "+2",
      trend: "up",
      icon: Stethoscope,
      color: "from-green-500 to-green-600"
    },
    {
      label: "Lab Orders",
      value: "8",
      change: "-1",
      trend: "down",
      icon: TestTube,
      color: "from-purple-500 to-purple-600"
    },
    {
      label: "Prescriptions",
      value: "32",
      change: "+5",
      trend: "up",
      icon: Pill,
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? ArrowUp : ArrowDown;
        
        return (
          <Card key={index} className="bg-[#1a1150] border-[#2a1a5e] hover:border-[#3a2a6e] transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "flex items-center gap-1",
                    stat.trend === "up" ? "text-green-400" : "text-red-400"
                  )}
                >
                  <TrendIcon className="w-3 h-3" />
                  {stat.change}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Recent Claims Component (Patient Queue for Doctors)
function RecentClaims() {
  const patients = [
    {
      queueNumber: "Q001",
      name: "John Kamau",
      complaint: "Chest pain, shortness of breath",
      priority: "high",
      vitals: "BP: 150/90, Temp: 37.8°C",
      waitTime: "15 min"
    },
    {
      queueNumber: "Q002",
      name: "Mary Wanjiru",
      complaint: "Headache, fever",
      priority: "normal",
      vitals: "BP: 120/80, Temp: 38.2°C",
      waitTime: "25 min"
    },
    {
      queueNumber: "Q003",
      name: "Peter Ochieng",
      complaint: "Follow-up consultation",
      priority: "low",
      vitals: "BP: 118/75, Temp: 36.8°C",
      waitTime: "35 min"
    },
    {
      queueNumber: "Q004",
      name: "Grace Muthoni",
      complaint: "Abdominal pain",
      priority: "normal",
      vitals: "BP: 125/82, Temp: 37.2°C",
      waitTime: "45 min"
    }
  ];

  return (
    <Card className="bg-[#1a1150] border-[#2a1a5e]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Patient Queue</CardTitle>
          <Button variant="ghost" size="sm" className="text-[#14B8A6] hover:text-[#14B8A6]/80">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patients.map((patient) => (
            <div 
              key={patient.queueNumber} 
              className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a2e] border border-[#2a1a5e] hover:border-[#3a2a6e] transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium text-white">{patient.queueNumber} - {patient.name}</h4>
                  <Badge 
                    variant={
                      patient.priority === "high" ? "destructive" :
                      patient.priority === "normal" ? "secondary" : "default"
                    }
                    className={cn(
                      patient.priority === "high" && "bg-red-500/20 text-red-400 border-red-500/30",
                      patient.priority === "normal" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                      patient.priority === "low" && "bg-green-500/20 text-green-400 border-green-500/30"
                    )}
                  >
                    {patient.priority} priority
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mt-1">{patient.complaint}</p>
                <p className="text-xs text-gray-500 mt-1">{patient.vitals}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Wait time</p>
                <p className="font-semibold text-white">{patient.waitTime}</p>
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
      label: "Start Consultation",
      description: "Begin patient consultation",
      icon: Stethoscope,
      color: "from-blue-500 to-blue-600",
      href: "/modern-doctor/consultation/new"
    },
    {
      label: "Write Prescription",
      description: "Create new prescription",
      icon: FileText,
      color: "from-green-500 to-green-600",
      href: "/modern-doctor/prescription/new"
    },
    {
      label: "Order Lab Tests",
      description: "Request laboratory tests",
      icon: TestTube,
      color: "from-purple-500 to-purple-600",
      href: "/modern-doctor/lab-order/new"
    },
    {
      label: "AI Diagnosis",
      description: "Get AI-assisted diagnosis",
      icon: Brain,
      color: "from-orange-500 to-orange-600",
      href: "/modern-doctor/ai-assist"
    }
  ];

  return (
    <Card className="bg-[#1a1150] border-[#2a1a5e]">
      <CardHeader>
        <CardTitle className="text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <Link key={index} href={action.href}>
                <a className="block p-4 rounded-lg bg-[#0a0a2e] border border-[#2a1a5e] hover:border-[#3a2a6e] transition-all group">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white group-hover:text-[#14B8A6] transition-colors">
                        {action.label}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </a>
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
    isPremium: true
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0e0d3c] via-[#1b1150] to-[#2a1a5e] text-white">
      <Sidebar user={dashboardUser} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <WelcomeCard user={dashboardUser} />
        <QuickStats user={dashboardUser} />
        <RecentClaims />
        <QuickActions user={dashboardUser} />
      </main>
    </div>
  );
}