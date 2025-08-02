import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface AuthCheckerProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

export function AuthChecker({ children, requiredRole, redirectTo = "/direct-debtors-login" }: AuthCheckerProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation(redirectTo);
    } else if (!isLoading && user && requiredRole && user.role !== requiredRole) {
      // Redirect to appropriate dashboard based on role
      const roleDashboards: Record<string, string> = {
        doctor: "/modern-doctor",
        pharmacy: "/modern-pharmacy", 
        pharmacist: "/modern-pharmacy",
        "care-manager": "/modern-care-manager",
        insurer: "/modern-insurer",
        patient: "/modern-patient",
        admin: "/modern-admin",
        debtors: "/debtors-dashboard"
      };
      
      const targetDashboard = roleDashboards[user.role] || "/";
      setLocation(targetDashboard);
    }
  }, [user, isLoading, requiredRole, redirectTo, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect is handled in useEffect
  }

  if (requiredRole && user.role !== requiredRole) {
    return null; // Redirect is handled in useEffect
  }

  return <>{children}</>;
}