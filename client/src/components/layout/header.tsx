import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";
import { Link } from "wouter";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getPageTitle(window.location.pathname)}
          </h1>
          <p className="text-gray-600">{getPageDescription(window.location.pathname)}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* AI Status Indicator */}
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">AI Active</span>
          </div>

          {/* Current Role */}
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              {user?.role?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'User'}
            </span>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Quick Action */}
          <Link href="/claims">
            <Button className="bg-teal-primary hover:bg-teal-dark">
              <Plus className="w-4 h-4 mr-2" />
              New Claim
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function getPageTitle(pathname: string): string {
  switch (pathname) {
    case "/":
      return "Dashboard";
    case "/verification":
      return "Patient Verification";
    case "/claims":
      return "Claims Processing";
    case "/preauth":
      return "AI Preauthorization";
    case "/pharmacy":
      return "Pharmacy Validation";
    case "/care-manager":
      return "Care Manager";
    case "/blockchain":
      return "Blockchain Anchor";
    case "/debtors":
      return "Debtors Module";
    default:
      return "Erlessed";
  }
}

function getPageDescription(pathname: string): string {
  switch (pathname) {
    case "/":
      return "Monitor claims, AI decisions, and system performance";
    case "/verification":
      return "Verify patient identity using biometric or OTP authentication";
    case "/claims":
      return "Process and manage healthcare claims with AI assistance";
    case "/preauth":
      return "AI-powered preauthorization with Chain-of-Thought reasoning";
    case "/pharmacy":
      return "Validate prescriptions with smart medication checks";
    case "/care-manager":
      return "Analytics, fraud detection, and provider performance";
    case "/blockchain":
      return "Anchor claims to blockchain for immutable audit trail";
    case "/debtors":
      return "Manage outstanding claims and payment tracking";
    default:
      return "Healthcare Claims Processing Platform";
  }
}
