import { Link, useLocation } from "wouter";
import { 
  Pill, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Activity,
  LogOut,
  Clock,
  ChevronRight,
  Shield,
  Heart,
  ArrowUp,
  ArrowDown,
  Package,
  Search,
  Fingerprint,
  ShieldCheck
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
    { path: "/modern-pharmacy", label: "Dashboard", icon: Activity },
    { path: "/modern-pharmacy/prescriptions", label: "Prescriptions", icon: FileText },
    { path: "/modern-pharmacy/dispensing", label: "Dispensing", icon: Pill },
    { path: "/modern-pharmacy/inventory", label: "Inventory", icon: Package },
    { path: "/modern-pharmacy/verification", label: "Verification", icon: Shield },
    { path: "/modern-pharmacy/reports", label: "Reports", icon: FileText }
  ];

  return (
    <div className="w-64 bg-[#0a0a2e] border-r border-[#1a1a5e] p-6 h-screen flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#14B8A6] to-[#3B82F6]">
          Erlessed
        </h1>
        <p className="text-sm text-gray-400 mt-1">Pharmacy Portal</p>
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
              <div
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-gradient-to-r from-[#14B8A6]/20 to-[#3B82F6]/20 text-white border border-[#14B8A6]/30"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1150]"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
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
          Welcome back, {user.name}!
        </h2>
        <p className="text-gray-300">
          You have 15 prescriptions pending verification. 3 items are low in stock and need reordering.
        </p>
      </CardContent>
    </Card>
  );
}

// Quick Stats Component
function QuickStats({ user }: { user: any }) {
  const stats = [
    {
      label: "Prescriptions Today",
      value: "48",
      change: "+12%",
      trend: "up",
      icon: FileText,
      color: "from-blue-500 to-blue-600"
    },
    {
      label: "Dispensed",
      value: "33",
      change: "+8%",
      trend: "up",
      icon: CheckCircle,
      color: "from-green-500 to-green-600"
    },
    {
      label: "Pending Verification",
      value: "15",
      change: "-5%",
      trend: "down",
      icon: Clock,
      color: "from-purple-500 to-purple-600"
    },
    {
      label: "Safety Alerts",
      value: "2",
      change: "-50%",
      trend: "down",
      icon: AlertCircle,
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

// Recent Claims Component (Pending Prescriptions for Pharmacy)
function RecentClaims() {
  const prescriptions = [
    {
      id: "RX-2024-001",
      patient: "John Kamau",
      medication: "Amoxicillin 500mg",
      quantity: "21 tablets",
      status: "pending",
      doctor: "Dr. Mwangi",
      time: "10 min ago"
    },
    {
      id: "RX-2024-002",
      patient: "Mary Wanjiru",
      medication: "Metformin 850mg",
      quantity: "60 tablets",
      status: "verified",
      doctor: "Dr. Ochieng",
      time: "15 min ago"
    },
    {
      id: "RX-2024-003",
      patient: "Peter Ochieng",
      medication: "Paracetamol 500mg",
      quantity: "20 tablets",
      status: "dispensed",
      doctor: "Dr. Kamau",
      time: "25 min ago"
    },
    {
      id: "RX-2024-004",
      patient: "Grace Muthoni",
      medication: "Omeprazole 20mg",
      quantity: "30 capsules",
      status: "alert",
      doctor: "Dr. Wanjiku",
      time: "30 min ago"
    }
  ];

  return (
    <Card className="bg-[#1a1150] border-[#2a1a5e]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Recent Prescriptions</CardTitle>
          <Button variant="ghost" size="sm" className="text-[#14B8A6] hover:text-[#14B8A6]/80">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div 
              key={rx.id} 
              className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a2e] border border-[#2a1a5e] hover:border-[#3a2a6e] transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium text-white">{rx.id}</h4>
                  <Badge 
                    variant={
                      rx.status === "verified" ? "default" :
                      rx.status === "pending" ? "secondary" :
                      rx.status === "dispensed" ? "outline" : "destructive"
                    }
                    className={cn(
                      rx.status === "verified" && "bg-green-500/20 text-green-400 border-green-500/30",
                      rx.status === "pending" && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                      rx.status === "dispensed" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                      rx.status === "alert" && "bg-red-500/20 text-red-400 border-red-500/30"
                    )}
                  >
                    {rx.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {rx.patient} • {rx.medication} • {rx.quantity}
                </p>
                <p className="text-xs text-gray-500 mt-1">Prescribed by {rx.doctor}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">{rx.time}</p>
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
      label: "Verify Patient",
      description: "Biometric verification",
      icon: Fingerprint,
      color: "from-blue-500 to-blue-600",
      href: "/modern-pharmacy/verify"
    },
    {
      label: "Preauthorization",
      description: "Check insurance coverage",
      icon: Shield,
      color: "from-green-500 to-green-600",
      href: "/modern-pharmacy/preauth"
    },
    {
      label: "Validate Prescription",
      description: "Safety & interaction check",
      icon: CheckCircle,
      color: "from-purple-500 to-purple-600",
      href: "/modern-pharmacy/validate"
    },
    {
      label: "Secure Claim Log",
      description: "Blockchain anchoring",
      icon: ShieldCheck,
      color: "from-orange-500 to-orange-600",
      href: "/modern-pharmacy/blockchain"
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
                <div className="block p-4 rounded-lg bg-[#0a0a2e] border border-[#2a1a5e] hover:border-[#3a2a6e] transition-all group cursor-pointer">
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
export default function ModernPharmacyDashboard() {
  const { user } = useAuth();
  
  const dashboardUser = {
    name: user?.name || "Pharmacist",
    role: user?.role || "pharmacist",
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