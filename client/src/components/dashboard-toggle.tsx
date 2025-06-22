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
  Grid3X3,
  Calendar,
  MapPin,
  Smartphone
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
    description: "Patient queue, consultations, diagnosis support",
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
    description: "System management, user control, configuration",
    role: "System",
    color: "bg-red-100 text-red-700 border-red-200"
  },
  {
    path: "/modern-front-office",
    label: "Front Office",
    icon: Calendar,
    description: "Patient registration, appointments, walk-ins",
    role: "Reception",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200"
  },
  {
    path: "/patient-queue",
    label: "Patient Queue",
    icon: Clock,
    description: "Triage queue, wait times, priority management",
    role: "Operations",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200"
  },
  {
    path: "/mobile-field-worker",
    label: "Field Worker",
    icon: MapPin,
    description: "Mobile visits, GPS navigation, field support",
    role: "Mobile",
    color: "bg-cyan-100 text-cyan-700 border-cyan-200"
  },
  {
    path: "/mobile-patient-portal",
    label: "Mobile Patient",
    icon: Smartphone,
    description: "Mobile self-service, health tracking",
    role: "Mobile",
    color: "bg-pink-100 text-pink-700 border-pink-200"
  }
];

interface DashboardHistory {
  path: string;
  timestamp: number;
  visitCount: number;
}

interface DashboardToggleProps {
  currentPath?: string;
  showRecentDashboards?: boolean;
}

export function DashboardToggle({ currentPath, showRecentDashboards = true }: DashboardToggleProps) {
  const [location, navigate] = useLocation();
  const [dashboardHistory, setDashboardHistory] = useState<DashboardHistory[]>(() => {
    const saved = localStorage.getItem('erlessed-dashboard-history');
    return saved ? JSON.parse(saved) : [];
  });

  const currentDashboard = dashboardOptions.find(d => d.path === (currentPath || location));
  
  const addToHistory = (path: string) => {
    const now = Date.now();
    const existing = dashboardHistory.find(h => h.path === path);
    
    let updated: DashboardHistory[];
    if (existing) {
      updated = dashboardHistory.map(h => 
        h.path === path 
          ? { ...h, timestamp: now, visitCount: h.visitCount + 1 }
          : h
      );
    } else {
      updated = [...dashboardHistory, { path, timestamp: now, visitCount: 1 }];
    }
    
    // Keep only last 5 unique dashboards, sorted by most recent
    updated = updated
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
    
    setDashboardHistory(updated);
    localStorage.setItem('erlessed-dashboard-history', JSON.stringify(updated));
  };

  const handleDashboardSwitch = (path: string) => {
    addToHistory(path);
    navigate(path);
  };

  const getRecentDashboards = () => {
    return dashboardHistory
      .filter(h => h.path !== (currentPath || location))
      .map(h => dashboardOptions.find(d => d.path === h.path))
      .filter(Boolean)
      .slice(0, 3);
  };

  const getMostVisited = () => {
    return dashboardHistory
      .filter(h => h.path !== (currentPath || location))
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 2)
      .map(h => dashboardOptions.find(d => d.path === h.path))
      .filter(Boolean);
  };

  const formatLastVisit = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Quick Back Button */}
      {getRecentDashboards().length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const lastDashboard = getRecentDashboards()[0];
            if (lastDashboard && lastDashboard.path !== (currentPath || location)) {
              handleDashboardSwitch(lastDashboard.path);
            }
          }}
          className="h-8 px-2"
          title={`Go back to ${getRecentDashboards()[0]?.label || 'previous dashboard'}`}
        >
          <ArrowLeft className="h-3 w-3" />
        </Button>
      )}

      {/* Dashboard Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 gap-2 min-w-[180px] sm:min-w-[200px] justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              {currentDashboard ? (
                <>
                  <currentDashboard.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium truncate">{currentDashboard.label}</span>
                </>
              ) : (
                <>
                  <Grid3X3 className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Switch Dashboard</span>
                </>
              )}
            </div>
            <ChevronDown className="h-3 w-3 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80 sm:w-96" align="start">
          <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center space-x-2">
              <Grid3X3 className="h-4 w-4" />
              <span>Erlessed Dashboards</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {dashboardHistory.length} visited
            </Badge>
          </DropdownMenuLabel>
          
          {/* Recent Dashboards */}
          {showRecentDashboards && getRecentDashboards().length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Recent</span>
              </DropdownMenuLabel>
              {getRecentDashboards().map((dashboard) => {
                const historyItem = dashboardHistory.find(h => h.path === dashboard.path);
                return (
                  <DropdownMenuItem
                    key={dashboard.path}
                    onClick={() => handleDashboardSwitch(dashboard.path)}
                    className="cursor-pointer py-3"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <dashboard.icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{dashboard.label}</div>
                        <div className="text-xs text-muted-foreground flex items-center space-x-2">
                          <span className="truncate">{dashboard.description}</span>
                          {historyItem && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                              {formatLastVisit(historyItem.timestamp)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {dashboard.role}
                        </Badge>
                        {historyItem && historyItem.visitCount > 1 && (
                          <span className="text-xs text-muted-foreground">
                            {historyItem.visitCount} visits
                          </span>
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </>
          )}

          {/* Most Visited Dashboards */}
          {getMostVisited().length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center space-x-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Most Visited</span>
              </DropdownMenuLabel>
              {getMostVisited().map((dashboard) => {
                const historyItem = dashboardHistory.find(h => h.path === dashboard.path);
                return (
                  <DropdownMenuItem
                    key={`most-visited-${dashboard.path}`}
                    onClick={() => handleDashboardSwitch(dashboard.path)}
                    className="cursor-pointer py-2"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <dashboard.icon className="h-4 w-4 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{dashboard.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {historyItem && `${historyItem.visitCount} visits`}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                        Popular
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                );
              })}
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