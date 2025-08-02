import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, Brain, Users, TrendingUp, Clock, Shield, 
  Activity, DollarSign, AlertTriangle, CheckCircle 
} from "lucide-react";
import { Link } from "wouter";

interface DashboardStats {
  analytics: {
    totalClaims: number;
    totalAmount: number;
    avgProcessingTime: number;
    approvalRate: number;
  };
  recentDecisions: Array<{
    id: number;
    decision: string;
    confidence: number;
    requestType: string;
    createdAt: string;
  }>;
  fraudAlerts: number;
  topProviders: Array<{
    providerId: string;
    totalAmount: number;
    approvalRate: number;
  }>;
}

export default function HomePage() {
  const { user } = useAuth();

  const { data: dashboardStats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const getRoleBasedGreeting = () => {
    switch (user?.role) {
      case 'front-office':
        return "Welcome to the Front Office Dashboard";
      case 'doctor':
        return "Welcome to the Physician Dashboard";
      case 'lab':
        return "Welcome to the Laboratory Dashboard";
      case 'pharmacy':
        return "Welcome to the Pharmacy Dashboard";
      case 'debtors':
        return "Welcome to the Debtors Management Dashboard";
      case 'care-manager':
        return "Welcome to the Care Manager Dashboard";
      default:
        return "Welcome to Erlessed";
    }
  };

  const getRoleSpecificActions = () => {
    switch (user?.role) {
      case 'front-office':
        return [
          { label: "Verify Patient", href: "/verification", icon: Shield },
          { label: "New Claim", href: "/claims", icon: FileText },
          { label: "View Analytics", href: "/analytics", icon: TrendingUp },
        ];
      case 'doctor':
        return [
          { label: "Patient Verification", href: "/verification", icon: Shield },
          { label: "Submit Claim", href: "/claims", icon: FileText },
          { label: "AI Preauth", href: "/preauth", icon: Brain },
        ];
      case 'pharmacy':
        return [
          { label: "Prescription Validation", href: "/pharmacy", icon: Shield },
          { label: "Drug Interaction Check", href: "/pharmacy", icon: AlertTriangle },
          { label: "Benefit Categories", href: "/pharmacy", icon: Activity },
        ];
      case 'care-manager':
        return [
          { label: "Analytics Dashboard", href: "/analytics", icon: TrendingUp },
          { label: "Provider Performance", href: "/analytics", icon: Users },
          { label: "Fraud Detection", href: "/analytics", icon: AlertTriangle },
        ];
      default:
        return [
          { label: "Patient Verification", href: "/verification", icon: Shield },
          { label: "Claims Processing", href: "/claims", icon: FileText },
          { label: "AI Decisions", href: "/preauth", icon: Brain },
        ];
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getRoleBasedGreeting()}</h1>
          <p className="text-gray-600">
            {user?.department && `${user.department} • `}
            Role: {user?.role?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">System Online</span>
        </div>
      </div>

      {/* Key Metrics */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.analytics.totalClaims?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active processing pipeline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Approval Rate</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.analytics.approvalRate?.toFixed(1) || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Chain-of-thought decisions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.analytics.avgProcessingTime?.toFixed(1) || 0}s</div>
              <p className="text-xs text-muted-foreground">
                Average decision time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(dashboardStats.analytics.totalAmount || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Claims processed
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for your role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getRoleSpecificActions().map((action, index) => (
              <Link key={index} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-teal-50 hover:border-teal-300"
                >
                  <action.icon className="w-6 h-6 text-teal-600" />
                  <span>{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent AI Decisions */}
      {dashboardStats?.recentDecisions && dashboardStats.recentDecisions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span>Recent AI Decisions</span>
            </CardTitle>
            <CardDescription>
              Latest automated preauthorization decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardStats.recentDecisions.slice(0, 5).map((decision) => (
                <div key={decision.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      decision.decision === 'approved' ? 'bg-green-500' : 
                      decision.decision === 'denied' ? 'bg-red-500' : 
                      'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium text-sm">{decision.requestType.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(decision.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      decision.decision === 'approved' ? 'default' : 
                      decision.decision === 'denied' ? 'destructive' : 
                      'secondary'
                    }>
                      {decision.decision.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-500">{decision.confidence?.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fraud Alerts */}
      {dashboardStats?.fraudAlerts && dashboardStats.fraudAlerts > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{dashboardStats.fraudAlerts} fraud alert{dashboardStats.fraudAlerts !== 1 ? 's' : ''}</strong> detected in the last 24 hours. 
            <Link href="/analytics" className="underline ml-1">Review suspicious activity</Link>
          </AlertDescription>
        </Alert>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span>System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">AI Engine</p>
                <p className="text-sm text-gray-500">Operational</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Blockchain Network</p>
                <p className="text-sm text-gray-500">Sepolia Connected</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Database</p>
                <p className="text-sm text-gray-500">Healthy</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
