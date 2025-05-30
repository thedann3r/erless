import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Fingerprint,
  FileText,
  Brain,
  Pill,
  BarChart3,
  Link as LinkIcon,
  DollarSign,
  Settings,
  LogOut,
  Shield
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Patient Verification",
    href: "/verification",
    icon: Fingerprint,
  },
  {
    name: "Claims Processing",
    href: "/claims",
    icon: FileText,
  },
  {
    name: "AI Preauthorization",
    href: "/preauth",
    icon: Brain,
    badge: "AI",
    badgeColor: "bg-blue-100 text-blue-600",
  },
  {
    name: "Pharmacy Validation",
    href: "/pharmacy",
    icon: Pill,
  },
  {
    name: "Care Manager",
    href: "/care-manager",
    icon: BarChart3,
  },
  {
    name: "Blockchain Anchor",
    href: "/blockchain",
    icon: LinkIcon,
    badge: "Beta",
    badgeColor: "bg-purple-100 text-purple-600",
  },
  {
    name: "Debtors Module",
    href: "/debtors",
    icon: DollarSign,
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full z-10 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Logo className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-bold text-teal-primary">Erlessed</h1>
            <p className="text-xs text-gray-500">
              powered by <span className="font-mono font-medium text-black">Aboolean</span>
            </p>
          </div>
        </div>
      </div>

      {/* Role Indicator */}
      <div className="px-6 py-4 bg-clinical-gray border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-teal-primary" />
          <span className="text-sm font-medium text-gray-700">
            {user?.role?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'User'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                  isActive
                    ? "bg-teal-primary text-white"
                    : "text-gray-700 hover:bg-teal-50 hover:text-teal-primary"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <div className={cn("ml-auto px-2 py-1 text-xs rounded-full", item.badgeColor)}>
                    {item.badge}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
        
        <hr className="my-4 border-gray-200" />
        
        <Link href="/settings">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-primary transition-colors cursor-pointer">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </div>
        </Link>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-teal-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
