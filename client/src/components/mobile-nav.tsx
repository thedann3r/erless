import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { 
  Menu, X, User, MapPin, Heart, FileText, 
  Calendar, Pill, CreditCard, Phone, Settings,
  LogOut, Home, Shield
} from "lucide-react";

interface MobileNavProps {
  userRole?: string;
}

interface NavLink {
  path: string;
  icon: React.ComponentType<any>;
  label: string;
  badge?: string;
}

export function MobileNav({ userRole }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const fieldWorkerLinks: NavLink[] = [
    { path: "/mobile-field-worker", icon: MapPin, label: "Field Visits", badge: "3" },
    { path: "/patient-verification", icon: Shield, label: "Verify Patient" },
    { path: "/emergency-contacts", icon: Phone, label: "Emergency" },
  ];

  const patientPortalLinks: NavLink[] = [
    { path: "/mobile-patient-portal", icon: Home, label: "Dashboard" },
    { path: "/appointments", icon: Calendar, label: "Appointments" },
    { path: "/prescriptions", icon: Pill, label: "Medications" },
    { path: "/claims", icon: CreditCard, label: "Claims" },
    { path: "/health-records", icon: Heart, label: "Health Data" },
  ];

  const getNavLinks = () => {
    switch (userRole) {
      case "field-worker":
        return fieldWorkerLinks;
      case "patient":
        return patientPortalLinks;
      default:
        return [...fieldWorkerLinks, ...patientPortalLinks];
    }
  };

  const isActive = (path: string) => {
    return location === path || location.startsWith(path);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-teal-600 to-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-white/20"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <h1 className="text-lg font-bold">Erlessed Mobile</h1>
              <p className="text-sm opacity-90">{userRole || "Healthcare"}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Side Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)}>
          <div className="w-80 h-full bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            {/* Menu Header */}
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{user?.username}</p>
                    <p className="text-sm opacity-90 capitalize">{userRole?.replace('-', ' ')}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-2">
              {getNavLinks().map((link) => (
                <Link key={link.path} href={link.path}>
                  <div
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive(link.path)
                        ? "bg-teal-50 text-teal-700 border border-teal-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="flex-1 font-medium">{link.label}</span>
                    {link.badge && (
                      <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                        {link.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-red-600 hover:bg-red-700">
                  <Phone className="w-4 h-4 mr-2" />
                  Emergency Call
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Logout */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Mobile Quick Access Widget
export function MobileQuickAccess() {
  return (
    <div className="lg:hidden fixed bottom-4 right-4 z-40">
      <Card className="shadow-lg">
        <CardContent className="p-3">
          <div className="flex space-x-2">
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              <Phone className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <FileText className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}