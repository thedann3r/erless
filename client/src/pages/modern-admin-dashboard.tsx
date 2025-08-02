import { Link, useLocation } from "wouter";
import { 
  Users, 
  Building2, 
  CheckCircle, 
  FileText, 
  Settings,
  LayoutDashboard,
  LogOut,
  Activity,
  TrendingUp,
  Database,
  Brain,
  ChevronRight,
  Shield,
  UserCheck,
  Server,
  Clock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  DollarSign,
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
    { path: "/modern-admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/modern-admin/users", label: "User Management", icon: Users },
    { path: "/modern-admin/providers", label: "Care Providers", icon: Building2 },
    { path: "/modern-admin/validation", label: "License Validation", icon: CheckCircle },
    { path: "/modern-admin/audit", label: "Audit Logs", icon: FileText },
    { path: "/modern-admin/settings", label: "Global Settings", icon: Settings }
  ];

  return (
    <div className="w-64 bg-[#0a0a2e] border-r border-[#1a1a5e] p-6 h-screen flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#265651] to-[#6BBDB4]">
          Erlessed
        </h1>
        <p className="text-sm text-gray-400 mt-1">Healthcare Platform</p>
      </div>

      <div className="mb-8 p-4 bg-[#1a1150] rounded-lg border border-[#2a1a5e]">
        <p className="text-sm text-gray-400">Logged in as</p>
        <p className="font-semibold text-white">{user.name}</p>
        <p className="text-xs text-[#6BBDB4] mt-1 capitalize">{user.role}</p>
        {user.isPremium && (
          <span className="inline-block mt-2 px-2 py-1 text-xs bg-gradient-to-r from-[#265651] to-[#6BBDB4] rounded-full text-white">
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
                    ? "bg-gradient-to-r from-[#265651]/20 to-[#6BBDB4]/20 text-white border border-[#6BBDB4]/30"
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
          Monitor platform health, manage users, and configure system settings from your admin dashboard.
        </p>
      </CardContent>
    </Card>
  );
}

// Quick Stats Component
function QuickStats({ user }: { user: any }) {
  const stats = [
    {
      label: "Total Users",
      value: "1,247",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      label: "Active Claims",
      value: "892",
      change: "+8%",
      trend: "up",
      icon: Activity,
      color: "from-green-500 to-green-600"
    },
    {
      label: "System Uptime",
      value: "99.8%",
      change: "+0.2%",
      trend: "up",
      icon: Server,
      color: "from-purple-500 to-purple-600"
    },
    {
      label: "Revenue",
      value: "KES 4.2M",
      change: "+15%",
      trend: "up",
      icon: DollarSign,
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

// Recent Claims Component
function RecentClaims() {
  const claims = [
    {
      id: "CLM-2024-001",
      patient: "John Kamau",
      provider: "Aga Khan Hospital",
      amount: "KES 45,000",
      status: "approved",
      date: "2 hours ago"
    },
    {
      id: "CLM-2024-002",
      patient: "Mary Wanjiru",
      provider: "Nairobi Hospital",
      amount: "KES 28,500",
      status: "pending",
      date: "3 hours ago"
    },
    {
      id: "CLM-2024-003",
      patient: "Peter Ochieng",
      provider: "MP Shah Hospital",
      amount: "KES 67,200",
      status: "rejected",
      date: "5 hours ago"
    },
    {
      id: "CLM-2024-004",
      patient: "Grace Muthoni",
      provider: "Kenyatta Hospital",
      amount: "KES 15,800",
      status: "approved",
      date: "6 hours ago"
    }
  ];

  return (
    <Card className="bg-[#1a1150] border-[#2a1a5e]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Recent Claims Activity</CardTitle>
          <Button variant="ghost" size="sm" className="text-[#6BBDB4] hover:text-[#6BBDB4]/80">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {claims.map((claim) => (
            <div 
              key={claim.id} 
              className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a2e] border border-[#2a1a5e] hover:border-[#3a2a6e] transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium text-white">{claim.id}</h4>
                  <Badge 
                    variant={
                      claim.status === "approved" ? "default" :
                      claim.status === "pending" ? "secondary" : "destructive"
                    }
                    className={cn(
                      claim.status === "approved" && "bg-green-500/20 text-green-400 border-green-500/30",
                      claim.status === "pending" && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                      claim.status === "rejected" && "bg-red-500/20 text-red-400 border-red-500/30"
                    )}
                  >
                    {claim.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {claim.patient} • {claim.provider}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">{claim.amount}</p>
                <p className="text-xs text-gray-400">{claim.date}</p>
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
      label: "Add New User",
      description: "Create a new system user",
      icon: UserCheck,
      color: "from-blue-500 to-blue-600",
      href: "/modern-admin/users/new"
    },
    {
      label: "System Health",
      description: "View system diagnostics",
      icon: Activity,
      color: "from-green-500 to-green-600",
      href: "/modern-admin/health"
    },
    {
      label: "Security Audit",
      description: "Review security logs",
      icon: ShieldCheck,
      color: "from-purple-500 to-purple-600",
      href: "/modern-admin/security"
    },
    {
      label: "View Reports",
      description: "Analytics & insights",
      icon: Eye,
      color: "from-orange-500 to-orange-600",
      href: "/modern-admin/reports"
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
                      <h4 className="font-medium text-white group-hover:text-[#6BBDB4] transition-colors">
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
export default function ModernAdminDashboard() {
  const { user } = useAuth();
  
  const dashboardUser = {
    name: user?.name || "Administrator",
    role: user?.role || "admin",
    isPremium: true
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#e8f5f0] via-[#f0faf7] to-[#d1e7e0] text-gray-900">
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