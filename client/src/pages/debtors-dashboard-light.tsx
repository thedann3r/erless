import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Download,
  Upload,
  Search,
  Filter,
  Building,
  Calendar,
  Home,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  Eye,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sidebar Component with light theme
function Sidebar({ user }: { user: any }) {
  const [activeItem, setActiveItem] = useState("dashboard");
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/debtors-dashboard" },
    { id: "claims", label: "Claim Batches", icon: FileSpreadsheet, href: "/debtors-dashboard/claims" },
    { id: "pending", label: "Pending Diagnosis", icon: AlertCircle, href: "/debtors-dashboard/pending" },
    { id: "reconciliation", label: "Reconciliation", icon: FileText, href: "/debtors-dashboard/reconciliation" },
    { id: "audit", label: "Verification Audit", icon: Eye, href: "/verification-audit", premium: true },
    { id: "reports", label: "Reports", icon: TrendingUp, href: "/debtors-dashboard/reports" },
    { id: "settings", label: "Settings", icon: Settings, href: "/debtors-dashboard/settings" }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#265651] to-[#6BBDB4]">
          Erlessed
        </h1>
        <p className="text-sm text-gray-600 mt-1">Debtors Dashboard</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-900">{user.name}</p>
        <p className="text-xs text-[#265651] mt-1 capitalize">{user.role}</p>
        <Badge className="mt-2 bg-[#6BBDB4]/20 text-[#265651] border-[#6BBDB4]/30">
          Finance Team
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
                    {item.premium && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        Premium
                      </Badge>
                    )}
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

// KPI Stats Component
function KPIStats() {
  const stats = [
    {
      label: "Total Claims",
      value: "2,847",
      subtitle: "This month",
      icon: FileText,
      color: "text-[#265651]",
      bgColor: "bg-[#265651]/10"
    },
    {
      label: "Clean Claims %",
      value: "87.5%",
      subtitle: "+3.2% from last month",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "Pending Diagnosis",
      value: "156",
      subtitle: "24 urgent",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      label: "Expected Reimbursement",
      value: "KES 8.4M",
      subtitle: "Next 30 days",
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
                  <p className="text-xs text-gray-500 mt-2">{stat.subtitle}</p>
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

// Claim Batches Component
function ClaimBatches() {
  const batches = [
    {
      id: "BATCH-2024-01",
      insurer: "SHA",
      claims: 324,
      amount: "KES 2.1M",
      status: "ready",
      lastUpdated: "2 hours ago"
    },
    {
      id: "BATCH-2024-02",
      insurer: "CIC",
      claims: 156,
      amount: "KES 980K",
      status: "pending",
      lastUpdated: "1 day ago"
    },
    {
      id: "BATCH-2024-03",
      insurer: "AAR",
      claims: 89,
      amount: "KES 540K",
      status: "submitted",
      lastUpdated: "3 days ago"
    },
    {
      id: "BATCH-2024-04",
      insurer: "Jubilee",
      claims: 210,
      amount: "KES 1.5M",
      status: "ready",
      lastUpdated: "5 hours ago"
    }
  ];

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-gray-900">Claim Batches by Insurer</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Ready for submission</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-gray-700">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
          <Button size="sm" className="bg-[#265651] hover:bg-[#265651]/90 text-white">
            <Upload className="h-4 w-4 mr-1" />
            Submit All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {batches.map((batch) => (
            <div key={batch.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-900">{batch.insurer}</span>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        batch.status === "ready" && "bg-green-100 text-green-700 border-green-300",
                        batch.status === "pending" && "bg-yellow-100 text-yellow-700 border-yellow-300",
                        batch.status === "submitted" && "bg-blue-100 text-blue-700 border-blue-300"
                      )}
                    >
                      {batch.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {batch.claims} claims • {batch.amount} • Last updated {batch.lastUpdated}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-gray-700">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" className="bg-[#6BBDB4] hover:bg-[#6BBDB4]/90 text-white">
                    <Send className="h-4 w-4" />
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

// Pending Diagnosis Component
function PendingDiagnosis() {
  const pendingCases = [
    {
      patient: "John Kamau",
      doctor: "Dr. Sarah Wanjiru",
      service: "Consultation",
      date: "2024-01-15",
      daysOverdue: 3,
      amount: "KES 3,500"
    },
    {
      patient: "Mary Njeri",
      doctor: "Dr. James Mwangi",
      service: "Lab Tests",
      date: "2024-01-14",
      daysOverdue: 4,
      amount: "KES 8,200"
    },
    {
      patient: "Peter Ochieng",
      doctor: "Dr. Grace Otieno",
      service: "Procedure",
      date: "2024-01-13",
      daysOverdue: 5,
      amount: "KES 15,000"
    }
  ];

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-gray-900">Pending Diagnosis</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Claims awaiting diagnosis codes</p>
        </div>
        <Button variant="outline" size="sm" className="text-[#265651]">
          <Bell className="h-4 w-4 mr-1" />
          Send Reminders
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingCases.map((case_, index) => (
            <div key={index} className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{case_.patient}</p>
                  <p className="text-sm text-gray-600">
                    {case_.doctor} • {case_.service} • {case_.amount}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300">
                    {case_.daysOverdue} days overdue
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{case_.date}</p>
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
function QuickActions() {
  const actions = [
    {
      label: "Generate Report",
      description: "Monthly claims summary",
      icon: FileSpreadsheet,
      color: "from-[#265651] to-[#265651]/80",
      href: "/debtors-dashboard/reports/generate"
    },
    {
      label: "Verify Batch",
      description: "Biometric verification",
      icon: CheckCircle,
      color: "from-[#6BBDB4] to-[#6BBDB4]/80",
      href: "/debtors-dashboard/verify"
    },
    {
      label: "Export Claims",
      description: "Download for submission",
      icon: Download,
      color: "from-purple-500 to-purple-600",
      href: "/debtors-dashboard/export"
    },
    {
      label: "Reconciliation",
      description: "Match payments",
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
      href: "/debtors-dashboard/reconcile"
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
export default function DebtorsDashboard() {
  const dashboardUser = {
    name: "Finance Officer",
    role: "debtors-officer"
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#e8f5f0] via-[#f0faf7] to-[#d1e7e0]">
      <Sidebar user={dashboardUser} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#265651] to-[#6BBDB4] rounded-lg p-6 text-white shadow-md">
          <h1 className="text-2xl font-bold">Medical Insurance Claims Management</h1>
          <p className="text-white/90 mt-1">Track, submit, and reconcile insurance claims efficiently</p>
        </div>

        {/* KPIs */}
        <KPIStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ClaimBatches />
          </div>
          <div>
            <PendingDiagnosis />
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </main>
    </div>
  );
}