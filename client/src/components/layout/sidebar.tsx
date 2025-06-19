import { useAuth } from "@/hooks/use-auth";
import { ErllessedLogo } from "@/components/erlessed-logo";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => {
    return location === path || (path !== "/" && location.startsWith(path));
  };

  const navItems = [
    { path: "/", icon: "fas fa-chart-line", label: "Dashboard" },
    { path: "/patient-queue", icon: "fas fa-users", label: "Patient Queue", roles: ["doctor"] },
    { path: "/consultation", icon: "fas fa-stethoscope", label: "Consultation Form", roles: ["doctor"] },
    { path: "/verification", icon: "fas fa-fingerprint", label: "Patient Verification", roles: ["pharmacy", "front-office"] },
    { path: "/claims", icon: "fas fa-file-medical", label: "Claims Processing" },
    { path: "/ai-preauth", icon: "fas fa-brain", label: "AI Preauthorization", badge: "AI", roles: ["pharmacy", "front-office"] },
    { path: "/pharmacy", icon: "fas fa-pills", label: "Pharmacy" },
    { path: "/care-manager", icon: "fas fa-chart-bar", label: "Analytics", roles: ["care-manager"] },
    { path: "/blockchain", icon: "fas fa-link", label: "Blockchain Audit", badge: "Beta" },
    { path: "/debtors", icon: "fas fa-dollar-sign", label: "Debtors", roles: ["debtors", "care-manager"] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || "")
  );

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full z-10">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <ErllessedLogo />
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {filteredNavItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
              <i className={`${item.icon} w-5`}></i>
              <span>{item.label}</span>
              {item.badge && (
                <div className={`ml-auto px-2 py-1 text-xs rounded-full ${
                  item.badge === 'AI' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                }`}>
                  {item.badge}
                </div>
              )}
            </div>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-teal-primary rounded-full flex items-center justify-center">
            <i className="fas fa-user text-white text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('-', ' ')}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600"
            disabled={logoutMutation.isPending}
          >
            <i className="fas fa-sign-out-alt"></i>
          </Button>
        </div>
      </div>
    </aside>
  );
}
