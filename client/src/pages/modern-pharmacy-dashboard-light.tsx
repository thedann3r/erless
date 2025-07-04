import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  Pill,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Home,
  ClipboardList,
  Shield,
  FileSearch,
  TrendingUp,
  DollarSign,
  History,
  Settings,
  LogOut,
  Users,
  AlertCircle,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sidebar Component with light theme
function Sidebar({ user }: { user: any }) {
  const [activeItem, setActiveItem] = useState("dashboard");
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/modern-pharmacy" },
    { id: "prescriptions", label: "Prescriptions", icon: ClipboardList, href: "/modern-pharmacy/prescriptions" },
    { id: "validation", label: "Validation Queue", icon: Shield, href: "/modern-pharmacy/validation" },
    { id: "inventory", label: "Inventory", icon: Package, href: "/modern-pharmacy/inventory" },
    { id: "claims", label: "Claims", icon: FileSearch, href: "/modern-pharmacy/claims" },
    { id: "reports", label: "Reports", icon: TrendingUp, href: "/modern-pharmacy/reports" },
    { id: "settings", label: "Settings", icon: Settings, href: "/modern-pharmacy/settings" }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#265651] to-[#6BBDB4]">
          Erlessed
        </h1>
        <p className="text-sm text-gray-600 mt-1">Pharmacy Dashboard</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-900">{user.name}</p>
        <p className="text-xs text-[#265651] mt-1 capitalize">{user.role}</p>
        <Badge className="mt-2 bg-[#6BBDB4]/20 text-[#265651] border-[#6BBDB4]/30">
          PPB Licensed
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
        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-[#265651] hover:bg-gray-100">
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
              Welcome back, {user.name}!
            </h2>
            <p className="text-white/90 mt-1">
              {user.pendingPrescriptions || 8} prescriptions pending validation
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
            <Badge className="mt-2 bg-white/20 text-white border-white/30">
              Pharmacy Operations
            </Badge>
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
      label: "Prescriptions Today",
      value: "124",
      change: "+12%",
      changeType: "positive",
      icon: Pill,
      color: "text-[#265651]",
      bgColor: "bg-[#265651]/10"
    },
    {
      label: "Validated",
      value: "98",
      change: "79% complete",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "Pending Review",
      value: "26",
      change: "8 urgent",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      label: "Revenue Today",
      value: "KES 156K",
      change: "+22%",
      changeType: "positive",
      icon: DollarSign,
      color: "text-[#6BBDB4]",
      bgColor: "bg-[#6BBDB4]/10"
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
                  <div className="flex items-center mt-2">
                    <span className={cn(
                      "text-sm font-medium",
                      stat.changeType === "positive" ? "text-green-600" : "text-gray-600"
                    )}>
                      {stat.change}
                    </span>
                  </div>
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

// Recent Prescriptions Component
function RecentPrescriptions() {
  const prescriptions = [
    {
      id: "RX-2024-001",
      patient: "John Kamau",
      medication: "Amoxicillin 500mg",
      doctor: "Dr. Sarah Wanjiru",
      status: "validated",
      insurer: "SHA",
      time: "10 mins ago"
    },
    {
      id: "RX-2024-002",
      patient: "Mary Njeri",
      medication: "Metformin 850mg + Glimepiride 2mg",
      doctor: "Dr. James Mwangi",
      status: "pending",
      insurer: "CIC",
      time: "25 mins ago"
    },
    {
      id: "RX-2024-003",
      patient: "Peter Ochieng",
      medication: "Tramadol 50mg",
      doctor: "Dr. Grace Otieno",
      status: "flagged",
      insurer: "AAR",
      time: "45 mins ago"
    },
    {
      id: "RX-2024-004",
      patient: "Alice Wambui",
      medication: "Losartan 50mg",
      doctor: "Dr. Michael Kiprop",
      status: "validated",
      insurer: "SHA",
      time: "1 hour ago"
    }
  ];

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gray-900">Recent Prescriptions</CardTitle>
        <Button variant="ghost" size="sm" className="text-[#265651] hover:text-[#265651]/80">
          View All <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{rx.id}</span>
                  <Badge 
                    variant={
                      rx.status === "validated" ? "default" : 
                      rx.status === "pending" ? "secondary" : "destructive"
                    }
                    className={cn(
                      rx.status === "validated" && "bg-green-100 text-green-700 border-green-300",
                      rx.status === "pending" && "bg-yellow-100 text-yellow-700 border-yellow-300",
                      rx.status === "flagged" && "bg-red-100 text-red-700 border-red-300"
                    )}
                  >
                    {rx.status}
                  </Badge>
                  <Badge variant="outline" className="text-gray-600">
                    {rx.insurer}
                  </Badge>
                </div>
                <p className="font-medium text-gray-800">{rx.medication}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {rx.patient} • Prescribed by {rx.doctor}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{rx.time}</p>
                <Button size="sm" className="mt-2 bg-[#265651] hover:bg-[#265651]/90 text-white">
                  Process
                </Button>
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
      icon: Shield,
      color: "from-[#265651] to-[#265651]/80",
      href: "/modern-pharmacy/verify"
    },
    {
      label: "Validate Prescription",
      description: "Check drug interactions",
      icon: FileSearch,
      color: "from-[#6BBDB4] to-[#6BBDB4]/80",
      href: "/modern-pharmacy/validate"
    },
    {
      label: "Process Claim",
      description: "Submit to insurer",
      icon: FileText,
      color: "from-purple-500 to-purple-600",
      href: "/modern-pharmacy/claim"
    },
    {
      label: "Inventory Check",
      description: "Stock levels & orders",
      icon: Package,
      color: "from-orange-500 to-orange-600",
      href: "/modern-pharmacy/inventory"
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

// System Status Component
function SystemStatus() {
  const systems = [
    { name: "Intelligence Engine", status: "operational", uptime: "99.9%" },
    { name: "System Database", status: "operational", uptime: "100%" },
    { name: "Smart Contract Ledger", status: "operational", uptime: "98.5%" },
    { name: "Biometric Scanner", status: "operational", uptime: "100%" }
  ];

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {systems.map((system, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  system.status === "operational" ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-sm font-medium text-gray-700">{system.name}</span>
              </div>
              <span className="text-sm text-gray-600">{system.uptime} uptime</span>
            </div>
          ))}
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
    pendingPrescriptions: 8
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#e8f5f0] via-[#f0faf7] to-[#d1e7e0]">
      <Sidebar user={dashboardUser} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <WelcomeCard user={dashboardUser} />
        <QuickStats user={dashboardUser} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentPrescriptions />
          </div>
          <div>
            <SystemStatus />
          </div>
        </div>
        <QuickActions user={dashboardUser} />
      </main>
    </div>
  );
}