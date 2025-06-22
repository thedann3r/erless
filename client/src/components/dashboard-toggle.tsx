import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  Stethoscope, 
  Pill, 
  Users, 
  Shield, 
  User, 
  Settings,
  Clock,
  ArrowLeft,
  Grid3X3
} from "lucide-react";
import { useLocation } from "wouter";

interface DashboardOption {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  role: string;
  color: string;
}

const dashboardOptions: DashboardOption[] = [
  {
    path: "/modern-doctor",
    label: "Doctor Dashboard",
    icon: Stethoscope,
    description: "Patient queue, consultations, AI diagnosis",
    role: "Clinical",
    color: "bg-blue-100 text-blue-700 border-blue-200"
  },
  {
    path: "/modern-pharmacy",
    label: "Pharmacy Dashboard", 
    icon: Pill,
    description: "Prescription validation, dispensing, safety checks",
    role: "Pharmacy",
    color: "bg-green-100 text-green-700 border-green-200"
  },
  {
    path: "/modern-care-manager",
    label: "Care Manager Dashboard",
    icon: Users,
    description: "Claims oversight, fraud detection, analytics",
    role: "Management",
    color: "bg-purple-100 text-purple-700 border-purple-200"
  },
  {
    path: "/modern-insurer",
    label: "Insurer Dashboard",
    icon: Shield,
    description: "Preauthorizations, claims review, risk assessment",
    role: "Insurance",
    color: "bg-orange-100 text-orange-700 border-orange-200"
  },
  {
    path: "/modern-patient",
    label: "Patient Portal",
    icon: User,
    description: "Claims history, benefits, appointments",
    role: "Patient",
    color: "bg-teal-100 text-teal-700 border-teal-200"
  },
  {
    path: "/modern-admin",
    label: "Admin Dashboard",
    icon: Settings,
    description: "System management, user control, AI configuration",
    role: "System",
    color: "bg-red-100 text-red-700 border-red-200"
  }
];

interface DashboardToggleProps {
  currentPath?: string;
  showRecentDashboards?: boolean;
}

export function DashboardToggle({ currentPath, showRecentDashboards = true }: DashboardToggleProps) {
  const [location, navigate] = useLocation();
  const [recentDashboards, setRecentDashboards] = useState<string[]>(() => {
    const saved = localStorage.getItem('erlessed-recent-dashboards');
    return saved ? JSON.parse(saved) : [];
  });

  const currentDashboard = dashboardOptions.find(d => d.path === (currentPath || location));
  
  const addToRecent = (path: string) => {
    const updated = [path, ...recentDashboards.filter(p => p !== path)].slice(0, 3);
    setRecentDashboards(updated);
    localStorage.setItem('erlessed-recent-dashboards', JSON.stringify(updated));
  };

  const handleDashboardSwitch = (path: string) => {
    addToRecent(path);
    navigate(path);
  };

  const getRecentDashboards = () => {
    return dashboardOptions.filter(d => 
      recentDashboards.includes(d.path) && d.path !== (currentPath || location)
    ).sort((a, b) => 
      recentDashboards.indexOf(a.path) - recentDashboards.indexOf(b.path)
    );
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Quick Back Button */}
      {recentDashboards.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const lastDashboard = recentDashboards[0];
            if (lastDashboard && lastDashboard !== (currentPath || location)) {
              handleDashboardSwitch(lastDashboard);
            }
          }}
          className="h-8 px-2"
          title="Go back to previous dashboard"
        >
          <ArrowLeft className="h-3 w-3" />
        </Button>
      )}

      {/* Dashboard Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 gap-2 min-w-[200px] justify-between">
            <div className="flex items-center space-x-2">
              {currentDashboard ? (
                <>
                  <currentDashboard.icon className="h-4 w-4" />
                  <span className="font-medium">{currentDashboard.label}</span>
                </>
              ) : (
                <>
                  <Grid3X3 className="h-4 w-4" />
                  <span>Switch Dashboard</span>
                </>
              )}
            </div>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80" align="start">
          <DropdownMenuLabel className="flex items-center space-x-2">
            <Grid3X3 className="h-4 w-4" />
            <span>Erlessed Dashboards</span>
          </DropdownMenuLabel>
          
          {/* Recent Dashboards */}
          {showRecentDashboards && getRecentDashboards().length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Recent</span>
              </DropdownMenuLabel>
              {getRecentDashboards().map((dashboard) => (
                <DropdownMenuItem
                  key={dashboard.path}
                  onClick={() => handleDashboardSwitch(dashboard.path)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <dashboard.icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{dashboard.label}</div>
                      <div className="text-xs text-muted-foreground">{dashboard.description}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {dashboard.role}
                    </Badge>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">All Dashboards</DropdownMenuLabel>
          
          {/* All Dashboards */}
          {dashboardOptions.map((dashboard) => {
            const isActive = dashboard.path === (currentPath || location);
            return (
              <DropdownMenuItem
                key={dashboard.path}
                onClick={() => !isActive && handleDashboardSwitch(dashboard.path)}
                className={`cursor-pointer ${isActive ? 'bg-muted' : ''}`}
                disabled={isActive}
              >
                <div className="flex items-center space-x-3 w-full">
                  <dashboard.icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <div className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                      {dashboard.label}
                      {isActive && <span className="ml-2 text-xs">(Current)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{dashboard.description}</div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${isActive ? dashboard.color : ''}`}
                  >
                    {dashboard.role}
                  </Badge>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Current Dashboard Info */}
      {currentDashboard && (
        <Card className="hidden lg:block">
          <CardContent className="p-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={`text-xs ${currentDashboard.color}`}>
                {currentDashboard.role}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {currentDashboard.description}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Compact version for mobile/smaller screens
export function CompactDashboardToggle({ currentPath }: { currentPath?: string }) {
  const [location, navigate] = useLocation();
  const currentDashboard = dashboardOptions.find(d => d.path === (currentPath || location));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          {currentDashboard ? (
            <currentDashboard.icon className="h-3 w-3" />
          ) : (
            <Grid3X3 className="h-3 w-3" />
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>Switch Dashboard</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {dashboardOptions.map((dashboard) => {
          const isActive = dashboard.path === (currentPath || location);
          return (
            <DropdownMenuItem
              key={dashboard.path}
              onClick={() => !isActive && navigate(dashboard.path)}
              className={`cursor-pointer ${isActive ? 'bg-muted' : ''}`}
              disabled={isActive}
            >
              <dashboard.icon className="h-4 w-4 mr-2" />
              <span className={isActive ? 'font-medium' : ''}>{dashboard.label}</span>
              {isActive && <Badge variant="outline" className="ml-auto text-xs">Current</Badge>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}