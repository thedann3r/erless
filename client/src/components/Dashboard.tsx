import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  User,
  CreditCard,
  Activity
} from "lucide-react";

interface DashboardProps {
  user: {
    name: string;
    role: string;
    isPremium?: boolean;
  };
}

// Role-specific dashboard content
const getDashboardContent = (role: string) => {
  switch (role) {
    case "doctor":
      return {
        title: "Clinical Dashboard",
        subtitle: "Patient care and claim management",
        stats: [
          { label: "Active Patients", value: "28", icon: User, trend: "+3" },
          { label: "Pending Diagnosis", value: "5", icon: AlertCircle, trend: "2 urgent" },
          { label: "Claims Submitted", value: "142", icon: FileText, trend: "This month" },
          { label: "Approval Rate", value: "94%", icon: CheckCircle, trend: "+2%" }
        ],
        recentClaims: [
          { patient: "John Kamau", service: "Consultation", status: "approved", amount: "KES 3,500" },
          { patient: "Mary Njeri", service: "Lab Tests", status: "pending", amount: "KES 8,200" },
          { patient: "Peter Ochieng", service: "Procedure", status: "review", amount: "KES 15,000" }
        ]
      };
    case "pharmacy":
      return {
        title: "Pharmacy Dashboard",
        subtitle: "Prescription validation and claims",
        stats: [
          { label: "Prescriptions Today", value: "47", icon: FileText, trend: "+12" },
          { label: "Pending Validation", value: "8", icon: Clock, trend: "3 urgent" },
          { label: "Claims Value", value: "385K", icon: CreditCard, trend: "Today" },
          { label: "Approval Rate", value: "91%", icon: CheckCircle, trend: "+5%" }
        ],
        recentClaims: [
          { patient: "Alice Wanjiku", service: "Antibiotics", status: "approved", amount: "KES 2,800" },
          { patient: "James Mwangi", service: "Chronic Meds", status: "pending", amount: "KES 12,400" },
          { patient: "Grace Otieno", service: "Insulin", status: "approved", amount: "KES 8,600" }
        ]
      };
    case "front-office":
      return {
        title: "Front Office Dashboard",
        subtitle: "Patient verification and preauthorization",
        stats: [
          { label: "Patients Today", value: "124", icon: User, trend: "+18" },
          { label: "Verified", value: "119", icon: CheckCircle, trend: "96%" },
          { label: "Preauth Pending", value: "12", icon: Clock, trend: "5 urgent" },
          { label: "Claims Initiated", value: "108", icon: FileText, trend: "Today" }
        ],
        recentClaims: [
          { patient: "Daniel Kiprop", service: "Registration", status: "verified", amount: "SHA Member" },
          { patient: "Faith Muthoni", service: "Preauth", status: "pending", amount: "CIC Insurance" },
          { patient: "Robert Ouko", service: "Emergency", status: "approved", amount: "AAR Coverage" }
        ]
      };
    default:
      return {
        title: "Dashboard",
        subtitle: "Healthcare claims management",
        stats: [],
        recentClaims: []
      };
  }
};

export default function Dashboard({ user }: DashboardProps) {
  const content = getDashboardContent(user.role);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "verified":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "review":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">{content.title}</h1>
          <p className="text-white/60 mt-1">{content.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/80">Welcome, {user.name}</span>
          {user.isPremium && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              Premium
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {content.stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white/5 backdrop-blur border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    <p className="text-xs text-white/40 mt-2">{stat.trend}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/10">
                    <Icon className="w-6 h-6 text-[#78A8FF]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Claims */}
      <Card className="bg-white/5 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Claims Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.recentClaims.map((claim, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-white">{claim.patient}</p>
                  <p className="text-sm text-white/60 mt-1">{claim.service}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={getStatusColor(claim.status)}>
                    {claim.status}
                  </Badge>
                  <span className="text-white/80 font-medium">{claim.amount}</span>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 bg-[#78A8FF] hover:bg-[#78A8FF]/80 text-black">
            View All Claims
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur border-white/10">
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold">Real-time Status</h3>
            <p className="text-white/60 text-sm mt-1">Live claim tracking</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur border-white/10">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold">Analytics</h3>
            <p className="text-white/60 text-sm mt-1">Performance metrics</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur border-white/10">
          <CardContent className="p-6 text-center">
            <FileText className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold">Reports</h3>
            <p className="text-white/60 text-sm mt-1">Export & download</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}