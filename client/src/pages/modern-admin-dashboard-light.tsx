import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  ArrowRight,
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  UserCheck,
  Building,
  Activity,
  ShieldCheck,
  Eye,
  LogOut,
  Home,
  FileBarChart,
  UserCog,
  History,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sidebar Component with light theme
function Sidebar({ user }: { user: any }) {
  const [activeItem, setActiveItem] = useState("dashboard");
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/modern-admin" },
    { id: "users", label: "User Management", icon: UserCog, href: "/modern-admin/users" },
    { id: "providers", label: "Care Providers", icon: Building, href: "/modern-admin/providers" },
    { id: "license", label: "License Validation", icon: ShieldCheck, href: "/modern-admin/license" },
    { id: "audit", label: "Audit Logs", icon: History, href: "/modern-admin/audit" },
    { id: "settings", label: "Global Settings", icon: Settings, href: "/modern-admin/settings" }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#265651] to-[#6BBDB4]">
          Erlessed
        </h1>
        <p className="text-sm text-gray-600 mt-1">Admin Dashboard</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-900">{user.name}</p>
        <p className="text-xs text-[#265651] mt-1 capitalize">{user.role}</p>
        {user.isPremium && (
          <span className="inline-block mt-2 px-2 py-1 text-xs bg-gradient-to-r from-[#265651] to-[#6BBDB4] rounded-full text-white">
            Premium
          </span>
        )}
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
              Here's your system overview for today
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
              Admin Access
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
      label: "Total Users",
      value: "2,847",
      change: "+12%",
      changeType: "positive",
      icon: Users,
      color: "text-[#265651]",
      bgColor: "bg-[#265651]/10"
    },
    {
      label: "Active Claims",
      value: "156",
      change: "+8%",
      changeType: "positive",
      icon: FileText,
      color: "text-[#6BBDB4]",
      bgColor: "bg-[#6BBDB4]/10"
    },
    {
      label: "System Health",
      value: "98.5%",
      change: "+0.5%",
      changeType: "positive",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "Monthly Revenue",
      value: "KES 2.4M",
      change: "+18%",
      changeType: "positive",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
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
                      stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                    )}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
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

// Recent Claims Component
function RecentClaims() {
  const recentClaims = [
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
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gray-900">Recent Claims</CardTitle>
        <Button variant="ghost" size="sm" className="text-[#265651] hover:text-[#265651]/80">
          View All <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentClaims.map((claim) => (
            <div key={claim.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{claim.id}</span>
                  <Badge 
                    variant={
                      claim.status === "approved" ? "default" : 
                      claim.status === "pending" ? "secondary" : "destructive"
                    }
                    className={cn(
                      claim.status === "approved" && "bg-green-100 text-green-700 border-green-300",
                      claim.status === "pending" && "bg-yellow-100 text-yellow-700 border-yellow-300",
                      claim.status === "rejected" && "bg-red-100 text-red-700 border-red-300"
                    )}
                  >
                    {claim.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {claim.patient} • {claim.provider}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{claim.amount}</p>
                <p className="text-xs text-gray-500">{claim.date}</p>
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
      color: "from-[#265651] to-[#265651]/80",
      href: "/modern-admin/users/new"
    },
    {
      label: "System Health",
      description: "View system diagnostics",
      icon: Activity,
      color: "from-[#6BBDB4] to-[#6BBDB4]/80",
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
export default function ModernAdminDashboard() {
  const { user } = useAuth();
  
  const dashboardUser = {
    name: user?.name || "Administrator",
    role: user?.role || "admin",
    isPremium: true
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#e8f5f0] via-[#f0faf7] to-[#d1e7e0]">
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